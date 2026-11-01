"""Build 010 texture tiers without changing meshes, UVs, transforms or credits.

Requires Pillow. Usage: python scripts/prepare_quality_tiers.py ATHENA_MASTER ANUBIS_MASTER
Masters are the user-supplied GLBs; no remote assets are downloaded.
"""
import io
import json
import struct
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'models'


def read(path):
    raw = Path(path).read_bytes()
    assert raw[:4] == b'glTF' and struct.unpack_from('<I', raw, 8)[0] == len(raw)
    length = struct.unpack_from('<I', raw, 12)[0]
    return json.loads(raw[20:20 + length]), raw[28 + length:]


def texture(gltf, binary, index):
    view = gltf['bufferViews'][gltf['images'][index]['bufferView']]
    start = view.get('byteOffset', 0)
    return binary[start:start + view['byteLength']]


def athena_tier(source, mesh, destination, size):
    master, master_binary = read(source)
    gltf, binary = read(mesh)
    assert len(master['images']) == len(gltf['images']) == 1
    data = texture(master, master_binary, 0)
    with Image.open(io.BytesIO(data)) as picture:
        if max(picture.size) > size:
            picture.thumbnail((size, size), Image.Resampling.LANCZOS)
            stream = io.BytesIO()
            picture.save(stream, 'JPEG', quality=94, subsampling=0)
            data = stream.getvalue()
    image_view = gltf['images'][0]['bufferView']
    gltf['images'][0]['mimeType'] = master['images'][0]['mimeType']
    output = bytearray()
    for index, view in enumerate(gltf['bufferViews']):
        start = view.get('byteOffset', 0)
        chunk = data if index == image_view else binary[start:start + view['byteLength']]
        output.extend(b'\0' * (-len(output) % 4))
        view.update(byteOffset=len(output), byteLength=len(chunk))
        output.extend(chunk)
    gltf['buffers'][0]['byteLength'] = len(output)
    gltf['asset'].setdefault('extras', {})['mythosDerivative'] = (
        f'010: existing UV-preserving web mesh; texture from supplied Athena master, max {size}px.'
    )
    document = json.dumps(gltf, separators=(',', ':'), ensure_ascii=False).encode()
    document += b' ' * (-len(document) % 4)
    output.extend(b'\0' * (-len(output) % 4))
    raw = struct.pack('<4sII', b'glTF', 2, 28 + len(document) + len(output))
    raw += struct.pack('<I4s', len(document), b'JSON') + document
    raw += struct.pack('<I4s', len(output), b'BIN\0') + output
    destination.write_bytes(raw)
    print(destination.name, len(raw))


if __name__ == '__main__':
    athena, anubis = map(Path, sys.argv[1:])
    athena_tier(athena, ROOT / 'athena-walston-optimized.glb', ROOT / 'athena-balanced.glb', 2048)
    athena_tier(athena, ROOT / 'athena-walston-optimized.glb', ROOT / 'athena-high.glb', 4096)
    # Anubis is already only 8,630 triangles; keep all original material maps.
    read(anubis)
    (ROOT / 'anubis-detail.glb').write_bytes(anubis.read_bytes())
