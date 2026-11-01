import { useMemo } from 'react'
import * as THREE from 'three'
import { polishedMarble } from './museumMaterials'
import { wallMaterial } from './surfaceMaterials'
import { surfaceBox, surfaceCylinder } from './surfaceGeometry'
import { THEMES } from './theme'
import type { Vec3 } from '../../types/museum'

function floorStone(color: string) {
  if (color === THEMES.egypt.floor) return wallMaterial('sandstone')
  if (color === THEMES.rome.floor) return wallMaterial('travertine')
  return polishedMarble
}
const jointMaterial = new THREE.MeshStandardMaterial({ color: '#a49c8f', roughness: 1 })

/** Fine slab joints, batched into one mesh and clipped to the actual floor edge. */
function SlabJoints({ width, depth, radius = 0 }: { width: number; depth: number; radius?: number }) {
  const geometry = useMemo(() => {
    const vertices: number[] = []
    const halfJoint = 0.005
    const spacing = 1.5
    const rectangle = (x0:number,z0:number,x1:number,z1:number) => {
      vertices.push(x0,0,z0, x1,0,z1, x1,0,z0, x0,0,z0, x0,0,z1, x1,0,z1)
    }
    for (let x = spacing; x < width / 2 - 0.05; x += spacing) {
      const extent = radius ? Math.sqrt(radius * radius - (x + halfJoint) ** 2) : depth / 2
      for (const sign of [-1,1]) rectangle(sign*x-halfJoint,-extent,sign*x+halfJoint,extent)
    }
    for (let z = spacing; z < depth / 2 - 0.05; z += spacing) {
      const extent = radius ? Math.sqrt(radius * radius - (z + halfJoint) ** 2) : width / 2
      for (const sign of [-1,1]) rectangle(-extent,sign*z-halfJoint,extent,sign*z+halfJoint)
    }
    rectangle(-halfJoint,-depth/2,halfJoint,depth/2)
    rectangle(-width/2,-halfJoint,width/2,halfJoint)
    const result = new THREE.BufferGeometry()
    result.setAttribute('position', new THREE.Float32BufferAttribute(vertices,3))
    result.computeVertexNormals()
    return result
  }, [width,depth,radius])
  return <mesh geometry={geometry} material={jointMaterial} position={[0,0.002,0]} receiveShadow />
}

export function CircularFloor({ radius, color }: { radius: number; color: string }) {
  return <group>
    <mesh geometry={surfaceCylinder(radius,radius,0.2,96,3)} material={floorStone(color)}
      position={[0,-0.1,0]} receiveShadow />
    <SlabJoints width={radius*2} depth={radius*2} radius={radius} />
  </group>
}

export interface RectFloorProps { width: number; depth: number; color: string; position?: Vec3 }
export function RectFloor({width,depth,color,position=[0,-0.1,0]}:RectFloorProps) {
  const marble = color !== THEMES.egypt.floor && color !== THEMES.rome.floor
  return <group position={position}>
    <mesh geometry={surfaceBox(width,0.2,depth,3)} material={floorStone(color)} receiveShadow />
    {marble && <group position={[0,0.1,0]}><SlabJoints width={width} depth={depth} /></group>}
  </group>
}
