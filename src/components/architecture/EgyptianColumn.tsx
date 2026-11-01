import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { museumStone, darkBronze } from './museumMaterials'
import { surfaceBox, surfaceCylinder } from './surfaceGeometry'
import type { Vec3 } from '../../types/museum'

/** Sandstone-colored papyrus bundle: fine surface detail and batched reed stems. */
export function EgyptianColumn({ position, height = 4.9, radiusScale = 1 }: {
  position: Vec3; height?: number; radiusScale?: number
}) {
  const sandstone = museumStone('sandstone')
  const darker = museumStone('limestone')
  const stems = useMemo(() => {
    const pieces = Array.from({ length: 12 }, (_, i) => {
      const a = i / 12 * Math.PI * 2
      return surfaceCylinder(0.015,0.02,Math.max(0.4,height-1.2),6).clone()
        .translate(Math.cos(a)*0.506,0,Math.sin(a)*0.506)
    })
    const geometry = mergeGeometries(pieces)
    pieces.forEach(piece => piece.dispose())
    return geometry
  }, [height])
  const bands = useMemo(() => {
    const pieces = [0.52,height-0.26,height+0.16].map(y => new THREE.CylinderGeometry(0.525,0.525,0.026,32).translate(0,y,0))
    const geometry = mergeGeometries(pieces)
    pieces.forEach(piece => piece.dispose())
    return geometry
  }, [height])
  return <group position={position} scale={[radiusScale, 1, radiusScale]}>
    <mesh geometry={surfaceCylinder(0.7,0.75,0.36,48)} material={darker} position={[0,0.18,0]} castShadow receiveShadow />
    <mesh geometry={surfaceCylinder(0.47,0.56,height,48)} material={sandstone} position={[0,height/2+0.3,0]} castShadow receiveShadow />
    <mesh geometry={stems} material={darker} position={[0,height/2+0.35,0]} castShadow />
    <mesh geometry={bands} material={darkBronze} />
    <mesh geometry={surfaceCylinder(0.82,0.43,0.82,48)} material={sandstone} position={[0,height+0.64,0]} castShadow receiveShadow />
    <mesh geometry={surfaceBox(1.75,0.22,1.75,2)} material={darker} position={[0,height+1.1,0]} castShadow receiveShadow />
  </group>
}
