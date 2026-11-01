import * as THREE from 'three'
import type { StoneKind } from './museumMaterials'

import { photoTexture } from './photoTextures'

const materials = new Map<StoneKind, THREE.MeshStandardMaterial>()

/** Local CC0 photo materials. UVs express meters, so texture density stays fixed. */
export function wallMaterial(kind: StoneKind) {
  let material = materials.get(kind)
  if (!material) {
    const asset = kind === 'sandstone' ? 'sandstone_blocks_08'
      : kind === 'travertine' ? 'marble_01' : 'plastered_wall_04'
    material = new THREE.MeshStandardMaterial({
      map: photoTexture(asset, 'color'), normalMap: photoTexture(asset, 'normal'),
      roughnessMap: photoTexture(asset, 'roughness'), roughness: 0.9,
      normalScale: new THREE.Vector2(0.45, 0.45), metalness: 0,
      color: kind === 'ivory' ? '#eef2f6' : kind === 'limestone' ? '#d9d3c7' : '#ffffff',
      envMapIntensity: 0.25,
    })
    materials.set(kind, material)
  }
  return material
}

export { surfaceBox, surfaceCylinder, surfaceDisk, repeatGeometryUV } from './surfaceGeometry'
