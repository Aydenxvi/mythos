"""Generate three original, intentionally stylized museum-study GLB busts.

Build-time authoring helper; generated assets are committed in /public/models.
Requires numpy, scipy, scikit-image and trimesh. Not required to run the website.
These works are contemporary artistic interpretations, NOT scans of antiquities.
"""
from pathlib import Path
import numpy as np
import trimesh
from skimage.measure import marching_cubes

OUTPUT = Path(__file__).resolve().parents[1] / 'public' / 'models'
OUTPUT.mkdir(parents=True, exist_ok=True)
N = 102
AX = np.linspace(-1.35,1.35,N)
AY = np.linspace(-.10,3.5,round(N*1.33))
AZ = np.linspace(-1.0,1.3,N)
X,Y,Z = np.meshgrid(AX,AY,AZ,indexing='ij')

PALETTE = {
    'ivory': (222, 214, 199, 255), 'pearl':(234, 225, 209, 255),
    'shadow':(183,172,152,255), 'bronze': (137,105,65,255),
    'darkgold': (101,76,46,255), 'basalt':(42,39,38,255),
    'obsidian':(32,33,34,255), 'sandstone':(179,151,113,255)
}

def mat(name):
    r,g,b,a=PALETTE[name]
    return trimesh.visual.material.PBRMaterial(
        name=name, baseColorFactor=[r,g,b,a], metallicFactor=0.12 if name not in ('bronze','darkgold') else 0.64,
        roughnessFactor=0.78 if name not in ('bronze','darkgold') else 0.47, doubleSided=True,
    )

def ell(cx,cy,cz,rx,ry,rz):
    return (np.sqrt(((X-cx)/rx)**2+((Y-cy)/ry)**2+((Z-cz)/rz)**2)-1)*min(rx,ry,rz)

def cone(cx,cy,cz,rad0,rad1,height,sz=1):
    yy=np.clip((Y-cy)/height,0,1)
    r=rad0+(rad1-rad0)*yy
    return np.maximum(np.sqrt((X-cx)**2+((Z-cz)/sz)**2)-r, np.maximum(cy-Y,Y-(cy+height)))

def capsule(start,end,r):
    a=np.array(start); b=np.array(end); p=np.stack([X,Y,Z],axis=-1)
    ab=b-a
    t=np.clip(np.sum((p-a)*ab,axis=-1)/np.dot(ab,ab),0,1)
    return np.linalg.norm(p-(a+t[...,None]*ab),axis=-1)-r

def smin(a,b,k):
    h=np.maximum(k-np.abs(a-b),0)/k
    return np.minimum(a,b)-h*h*k*.25

def sculpt(implicit, color):
    v,f,n,_=marching_cubes(implicit.astype(np.float32),0,spacing=(AX[1]-AX[0],AY[1]-AY[0],AZ[1]-AZ[0]))
    v+=np.array([AX[0],AY[0],AZ[0]])
    mesh=trimesh.Trimesh(vertices=v,faces=f,process=False)
    mesh.visual=trimesh.visual.TextureVisuals(material=mat(color))
    return mesh

def shaped_drapery(color='ivory', wide=.95, low=0, high=1.55, pleats=18, twist=.06):
    """A continuous elliptical fluted chiton/toga shell, rather than stacked cylinders."""
    ns,nt=56,160
    ys=np.linspace(low,high,ns)
    theta=np.linspace(0,2*np.pi,nt,endpoint=False)
    vertices=[]
    for y in ys:
        t=(y-low)/(high-low)
        xwidth=wide*(.75+.38*np.sin(np.pi*t*.88))
        if t>.83:xwidth*=1-(t-.83)*2.3
        depth=.38*(1-.30*t)
        for a in theta:
            fold=(.037*(1-.35*t))*np.cos(pleats*a+twist*y*4)
            x=(xwidth+fold)*np.cos(a)
            z=(depth+fold)*np.sin(a)+(-.035 if t>.65 else 0)
            vertices.append([x,y,z])
    faces=[]
    for i in range(ns-1):
        for j in range(nt):
            k=i*nt+j; l=i*nt+(j+1)%nt
            faces.append([k,l,k+nt]);faces.append([l,l+nt,k+nt])
    faces=np.array(faces)
    mesh=trimesh.Trimesh(vertices=np.array(vertices),faces=faces,process=False)
    mesh.visual=trimesh.visual.TextureVisuals(material=mat(color))
    return mesh

def tube(points,radius,color,sections=10):
    pts=np.array(points,float)
    path=trimesh.load_path(pts)
    # Construct a smooth circular sweep manually using stable local frame.
    vertices=[]
    for idx,p in enumerate(pts):
        d=pts[min(idx+1,len(pts)-1)]-pts[max(idx-1,0)]
        d=d/(np.linalg.norm(d)+1e-9)
        ref=np.array([1.,0,0]) if abs(d[0])<.88 else np.array([0,0,1.])
        a=np.cross(d,ref);a/=np.linalg.norm(a)+1e-9
        b=np.cross(d,a)
        for ang in np.linspace(0,2*np.pi,sections,endpoint=False):vertices.append(p+radius*(a*np.cos(ang)+b*np.sin(ang)))
    faces=[]
    for i in range(len(pts)-1):
        for j in range(sections):
            a=i*sections+j;b=i*sections+(j+1)%sections;c=a+sections;d=b+sections
            faces.extend([[a,b,c],[b,d,c]])
    mesh=trimesh.Trimesh(vertices=vertices,faces=faces,process=False)
    mesh.visual=trimesh.visual.TextureVisuals(material=mat(color))
    return mesh

def ball(center,scale,color,sub=3):
    m=trimesh.creation.icosphere(subdivisions=sub,radius=1.0);m.apply_scale(scale);m.apply_translation(center)
    m.visual=trimesh.visual.TextureVisuals(material=mat(color));return m

def ring(center,major,minor,color,rotation=None):
    # Create from tube to avoid torus geometry dependency
    pts=[]
    for a in np.linspace(0,2*np.pi,97):
        xyz=np.array([major*np.cos(a),0,major*np.sin(a)])
        if rotation is not None:xyz=rotation@xyz
        pts.append(np.array(center)+xyz)
    return tube(pts,minor,color,8)

def base_head(female=True):
    f=ell(0,2.23,0,.30,.41,.30)
    f=smin(f,ell(0,1.83,0,.13,.24,.16),.15)
    f=smin(f,ell(0,2.10,.30,.092,.13,.18),.13) # brow and nose
    f=smin(f,ell(0,2.00,.37,.08,.07,.055),.035)
    for s in (-1,1):f=smin(f,ell(s*.21,2.14,.08,.10,.12,.14),.13)
    if female:
        # gently deepen the eye sockets rather than cartoon googly eyes
        for s in (-1,1):
            eye=ell(s*.123,2.31,.273,.083,.041,.052)
            f=np.maximum(f,-eye*.87)
        f=smin(f,ell(0,1.96,.11,.18,.11,.19),.09)
    else:
        f=smin(f,ell(0,1.97,.13,.28,.28,.28),.13) # beard
    return f

def torso_field():
    f=ell(0,1.05,-.02,.68,.53,.42)
    f=smin(f,ell(0,.58,.00,.68,.52,.38),.22)
    for s in (-1,1): f=smin(f,ell(s*.50,1.23,-.02,.28,.20,.32),.16)
    f=smin(f,capsule((0,1.38,0),(0,1.9,0),.155),.12)
    return f

def athena():
    scene=trimesh.Scene()
    scene.add_geometry(shaped_drapery('ivory',low=0,high=1.5,pleats=22))
    scene.add_geometry(sculpt(torso_field(),'ivory'))
    scene.add_geometry(sculpt(base_head(True),'pearl'))
    helmet=ell(0,2.54,-.045,.35,.23,.34)
    helmet=smin(helmet,ell(0,2.72,-.06,.29,.17,.35),.10)
    scene.add_geometry(sculpt(helmet,'shadow'))
    # Corinthian helmet cheeks, ridged crest and sculpted plume
    for s in (-1,1):
        scene.add_geometry(ball((s*.26,2.34,.11),(.10,.20,.11),'shadow'))
    arc=np.linspace(0,np.pi,25)
    scene.add_geometry(tube([(0,2.79+.30*np.sin(a),-.36+.57*np.cos(a)) for a in arc],.10,'bronze',12))
    for i in range(17):
        u=i/16*np.pi
        scene.add_geometry(tube([(s*.04,2.86+.25*np.sin(u),-.37+.53*np.cos(u)),
            (s*.06,2.92+.32*np.sin(u),-.37+.58*np.cos(u))] if (s:=(-1 if i%2 else 1)) else [],.035,'ivory',6))
    # braided hair strands at temples
    for s in (-1,1):
        for i in range(3):
            a=i*.19
            scene.add_geometry(tube([(s*(.22+a*.10),2.50,.02),(s*(.31+a*.09),2.24,.12),(s*(.25+a*.06),1.96,.15)],.052,'shadow',8))
    # gold aegis necklace + central medallion
    scene.add_geometry(ring((0,1.51,.16),.33,.022,'bronze'))
    scene.add_geometry(ball((0,1.47,.37),(.095,.12,.035),'bronze'))
    return scene

def jupiter():
    scene=trimesh.Scene()
    scene.add_geometry(shaped_drapery('shadow',low=0,high=1.38,pleats=13,twist=.10))
    scene.add_geometry(sculpt(torso_field(),'ivory'))
    scene.add_geometry(sculpt(base_head(False),'pearl'))
    # layered beard curls that rest naturally on the chin
    for row in range(4):
        for col in range(7-row):
            x=(col-(6-row)/2)*.088;y=2.03-row*.11;z=.225-.02*row
            scene.add_geometry(ball((x,y,z),(.060,.075,.085),'shadow',2))
    # crown of short curls, laurel wreath, bronze neck clasp
    for a in np.linspace(0,np.pi,16):
        x=.32*np.cos(a);z=.12+.19*np.sin(a)
        scene.add_geometry(ball((x,2.50,z),(.092,.075,.078),'shadow',2))
    for s in (-1,1):
        for i in range(8):
            a=i/7*np.pi*.95
            scene.add_geometry(ball((s*(.26+.026*np.sin(a)),2.63-.14*np.sin(a),-.11+.23*np.cos(a)),(.05,.075,.023),'bronze',1))
    scene.add_geometry(ball((0,1.45,.38),(.09,.11,.04),'bronze'))
    # shoulder mantle, asymmetrically folded toga
    for i in range(7):
        a=i*.11
        scene.add_geometry(tube([(-.66,1.29,-.04+i*.05),(-.28,1.21-a*.16,.28),(.21,1.01-a*.18,.38),(.54,.70-a*.2,.27)],.039,'pearl',8))
    return scene

def anubis():
    scene=trimesh.Scene()
    scene.add_geometry(shaped_drapery('basalt',wide=.86,low=0,high=1.5,pleats=19))
    scene.add_geometry(sculpt(torso_field(),'basalt'))
    # jackal body, long muzzle, cheek and brow in one joined smooth sculpt
    f=ell(0,2.22,-.04,.30,.43,.28)
    f=smin(f,ell(0,2.10,.31,.18,.15,.40),.12)
    f=smin(f,ell(0,2.04,.62,.14,.09,.12),.10)
    f=smin(f,ell(0,1.84,0,.14,.26,.19),.14)
    f=smin(f,ell(0,2.40,-.14,.28,.23,.22),.10)
    for s in (-1,1):
        f=smin(f,capsule((s*.19,2.49,-.12),(s*.21,3.29,-.15),.09),.10)
    scene.add_geometry(sculpt(f,'obsidian'))
    for s in (-1,1):
        scene.add_geometry(ball((s*.16,2.37,.23),(.062,.035,.015),'bronze',3))
        # sculpted inverted eye-line; ear inner lining
        scene.add_geometry(tube([(s*.13,2.41,.24),(s*.21,2.40,.21)],.011,'bronze',6))
        scene.add_geometry(tube([(s*.20,2.64,-.054),(s*.215,3.14,-.11)],.017,'darkgold',7))
    scene.add_geometry(ball((0,2.05,.73),(.085,.05,.07),'basalt'))
    for i in range(4):
        scene.add_geometry(ring((0,1.56-i*.075,.02),.43+i*.07,.020,'bronze'))
    # nemes side-drapes and vertical golden inlay
    for s in (-1,1):
        scene.add_geometry(tube([(s*.30,2.45,-.11),(s*.39,2.10,-.12),(s*.50,1.52,-.08)],.10,'basalt',10))
        scene.add_geometry(tube([(s*.35,2.34,.01),(s*.46,1.64,.03)],.019,'bronze',7))
    return scene

if __name__=='__main__':
    for name,fn in [('athena',athena),('jupiter',jupiter),('anubis',anubis)]:
        path=OUTPUT/f'{name}-study.glb'
        scene=fn()
        path.write_bytes(scene.export(file_type='glb'))
        print(path, path.stat().st_size, 'bytes')
