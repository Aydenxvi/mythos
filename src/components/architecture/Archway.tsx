import * as THREE from 'three'
import { useMemo } from 'react'
import { geometries } from './geometryCache'
import { getStoneMaterial } from './materialCache'
import { museumBronze, museumStone } from './museumMaterials'
import type { Vec3 } from '../../types/museum'

export interface ArchwayProps {
  position: Vec3
  rotationY: number
  width?: number
  height?: number
  color: string
  shape?: 'lintel' | 'arch'
}

/** Classical framed doorway with actual clear space for camera transit. */
export function Archway({position,rotationY,width=3.7,height=4.6,color,shape='arch'}:ArchwayProps) {
  const outer = getStoneMaterial(color,0.86)
  const ivory = museumStone('ivory')
  const half = width/2
  const arch = useMemo(() => new THREE.TorusGeometry(half,0.24,10,52,Math.PI),[half])
  const archTrim = useMemo(() => new THREE.TorusGeometry(half+0.34,0.056,8,52,Math.PI),[half])
  return (
    <group position={position} rotation={[0,rotationY,0]}>
      {[-1,1].map(side=><group key={side} position={[side*(half+0.20),0,0]}>
        <mesh geometry={geometries.unitBox} material={outer} position={[0,height/2,0]} scale={[0.68,height,0.95]} castShadow receiveShadow />
        <mesh geometry={geometries.unitBox} material={ivory} position={[0,0.22,0.04]} scale={[0.94,0.36,1.10]} receiveShadow />
        <mesh geometry={geometries.unitBox} material={ivory} position={[0,height-0.24,0.04]} scale={[0.95,0.30,1.10]} castShadow />
      </group>)}
      {shape==='arch' ? <>
        <mesh geometry={arch} material={ivory} position={[0,height,0]} castShadow receiveShadow />
        <mesh geometry={archTrim} material={museumBronze} position={[0,height,0.06]} />
      </> : <mesh geometry={geometries.unitBox} material={ivory} scale={[width+1.40,0.55,1.12]} position={[0,height+0.20,0]} castShadow />}
    </group>
  )
}
