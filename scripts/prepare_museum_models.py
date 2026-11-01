"""Optional asset preparation script for contributed museum GLB files.

Python dependencies (not used by the website): numpy, Pillow, trimesh, vtk.
Usage: python scripts/prepare_museum_models.py SOURCE.glb OUT.glb --reduction 0.65 --max-texture 2048

Creates a web-friendly derivative while preserving author/license information
embedded in Sketchfab's glTF asset extras. Keep the artist/source credit in the UI.
"""
from __future__ import annotations
import argparse
import io
import json
import os
import struct
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image
import trimesh


def glb_chunks(raw: bytes):
    assert raw[:4] == b'glTF' and int.from_bytes(raw[4:8],'little') == 2, 'Expected GLB version 2'
    offset = 12
    chunks = {}
    while offset < len(raw):
        length, chunk_type = struct.unpack_from('<II',raw,offset)
        offset += 8
        chunks[chunk_type] = raw[offset:offset+length]
        offset += length
    return chunks


def glb_pack(gltf: dict, buf: bytes) -> bytes:
    json_data = json.dumps(gltf,separators=(',',':'),ensure_ascii=False).encode('utf-8')
    json_data += b' ' * ((-len(json_data)) % 4)
    buf += b'\0' * ((-len(buf)) % 4)
    size = 12 + 8 + len(json_data) + 8 + len(buf)
    return struct.pack('<4sII',b'glTF',2,size) + struct.pack('<I4s',len(json_data),b'JSON') + json_data + struct.pack('<I4s',len(buf),b'BIN\0') + buf


def optimize_textures(raw:bytes, max_size:int, originals:dict) ->bytes:
    chunks=glb_chunks(raw)
    gltf=json.loads(chunks[0x4E4F534A])
    buf=chunks[0x004E4942]
    views=gltf['bufferViews']
    imgs={im['bufferView']:im for im in gltf.get('images',[]) if 'bufferView' in im}
    output=bytearray()
    for i,view in enumerate(views):
        offset=view.get('byteOffset',0)
        data=buf[offset:offset+view['byteLength']]
        if i in imgs:
            image_ref=imgs[i]
            try:
                with Image.open(io.BytesIO(data)) as picture:
                    if max(picture.size)>max_size:
                        picture.thumbnail((max_size,max_size),Image.Resampling.LANCZOS)
                        dst=io.BytesIO()
                        if image_ref['mimeType']=='image/jpeg':
                            picture.convert('RGB').save(dst,format='JPEG',quality=87,optimize=True,subsampling=0)
                        else:
                            picture.save(dst,format='PNG',optimize=True,compress_level=7)
                        data=dst.getvalue()
            except Exception as e:
                print('image optimization skipped:',e)
        output.extend(b'\0'*((-len(output))%4))
        view['byteOffset']=len(output)
        view['byteLength']=len(data)
        view['buffer']=0
        output.extend(data)
    gltf['buffers']=[{'byteLength':len(output)}]
    # Keep embedded license, original author and source URL available for audit.
    if originals:
        gltf.setdefault('asset',{}).setdefault('extras',{}).update(originals)
    return glb_pack(gltf, bytes(output))


def simplify_meshes(input_file:Path,reduction:float)->bytes:
    import vtk
    from vtk.util.numpy_support import numpy_to_vtk, vtk_to_numpy, numpy_to_vtkIdTypeArray

    scene=trimesh.load(input_file,force='scene',process=False)
    count_before=0
    count_after=0
    for key in list(scene.geometry):
        mesh=scene.geometry[key]
        count_before+=len(mesh.faces)
        if len(mesh.faces)<8000 or reduction<=0:
            count_after+=len(mesh.faces)
            continue
        pd=vtk.vtkPolyData()
        p=vtk.vtkPoints()
        p.SetData(numpy_to_vtk(np.ascontiguousarray(mesh.vertices,dtype=np.float32),deep=True))
        pd.SetPoints(p)
        cells=vtk.vtkCellArray()
        faces=np.c_[np.full(len(mesh.faces),3,dtype=np.int64),mesh.faces.astype(np.int64)].ravel()
        cells.SetCells(len(mesh.faces),numpy_to_vtkIdTypeArray(faces,deep=True))
        pd.SetPolys(cells)
        if hasattr(mesh.visual,'uv'):
            uv=numpy_to_vtk(np.ascontiguousarray(mesh.visual.uv,dtype=np.float32),deep=True)
            uv.SetName('TCoords')
            pd.GetPointData().SetTCoords(uv)
        dec=vtk.vtkQuadricDecimation()
        dec.SetInputData(pd)
        dec.SetTargetReduction(reduction)
        dec.AttributeErrorMetricOn()
        dec.TCoordsAttributeOn()
        dec.SetTCoordsWeight(1.0)
        dec.VolumePreservationOn()
        dec.Update()
        result=dec.GetOutput()
        points=vtk_to_numpy(result.GetPoints().GetData()).copy()
        indices=vtk_to_numpy(result.GetPolys().GetConnectivityArray()).reshape(-1,3).copy()
        coords=result.GetPointData().GetTCoords()
        if coords is None: raise RuntimeError('Texture UVs lost during simplification')
        visual=trimesh.visual.TextureVisuals(uv=vtk_to_numpy(coords).copy(), material=mesh.visual.material)
        new_mesh=trimesh.Trimesh(vertices=points,faces=indices,visual=visual,process=False)
        # Recalculate normals to avoid stretched original normals after decimation.
        _=new_mesh.vertex_normals
        scene.geometry[key]=new_mesh
        count_after+=len(new_mesh.faces)
    print(f'Simplified {input_file.name}: {count_before:,} -> {count_after:,} triangles')
    return trimesh.exchange.gltf.export_glb(scene,include_normals=True)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('source',type=Path)
    parser.add_argument('destination',type=Path)
    parser.add_argument('--reduction',type=float,default=0)
    parser.add_argument('--max-texture',type=int,default=2048)
    args=parser.parse_args()
    source_bytes=args.source.read_bytes()
    source_json=json.loads(glb_chunks(source_bytes)[0x4E4F534A])
    extras=source_json.get('asset',{}).get('extras',{})
    if args.reduction:
        model_bytes=simplify_meshes(args.source,args.reduction)
    else:
        model_bytes=source_bytes
    out=optimize_textures(model_bytes,args.max_texture,extras)
    args.destination.parent.mkdir(parents=True,exist_ok=True)
    args.destination.write_bytes(out)
    print(f'Wrote {args.destination}, {len(out)/1024**2:.1f} MiB, source {len(source_bytes)/1024**2:.1f} MiB')

if __name__=='__main__': main()
