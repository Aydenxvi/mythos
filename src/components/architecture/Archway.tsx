import * as THREE from 'three'
import { useMemo } from 'react'
import { architecturalStone, museumBronze, museumStone } from './museumMaterials'
import { surfaceBox } from './surfaceGeometry'
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
  const outer = architecturalStone(color, true)
  const ivory = museumStone('ivory')
  const half = width/2
  const arch = useMemo(() => {
    const geometry = new THREE.TorusGeometry(half,0.24,10,52,Math.PI)
    const uv = geometry.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * half * Math.PI / 2, uv.getY(i) * 0.24 * Math.PI)
    return geometry
  },[half])
  const archTrim = useMemo(() => new THREE.TorusGeometry(half+0.34,0.056,8,52,Math.PI),[half])
  return (
    <group position={position} rotation={[0,rotationY,0]}>
      {[-1,1].map(side=><group key={side} position={[side*(half+0.20),0,0]}>
        <mesh geometry={surfaceBox(0.68,height,0.95,2)} material={outer} position={[0,height/2,0]} castShadow receiveShadow />
        <mesh geometry={surfaceBox(0.94,0.36,1.10,2)} material={ivory} position={[0,0.22,0.04]} receiveShadow />
        <mesh geometry={surfaceBox(0.95,0.30,1.10,2)} material={ivory} position={[0,height-0.24,0.04]} castShadow />
      </group>)}
      {shape==='arch' ? <>
        <mesh geometry={arch} material={ivory} position={[0,height,0]} castShadow receiveShadow />
        <mesh geometry={archTrim} material={museumBronze} position={[0,height,0.06]} />
      </> : <mesh geometry={surfaceBox(width+1.40,0.55,1.12,2)} material={ivory} position={[0,height+0.20,0]} castShadow />}
    </group>
  )
}
