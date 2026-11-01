import * as THREE from 'three'
import { invalidate } from '@react-three/fiber'
import type { StoneKind } from './museumMaterials'

const textures = new Map<string, THREE.Texture>()
const materials = new Map<StoneKind, THREE.MeshStandardMaterial>()
const loader = new THREE.TextureLoader()

function texture(asset: string, channel: 'color' | 'normal' | 'roughness') {
  const name = `${asset}_${channel}`
  let map = textures.get(name)
  if (!map) {
    map = loader.load(`${import.meta.env.BASE_URL}textures/${name}.jpg`, () => invalidate())
    map.colorSpace = channel === 'color' ? THREE.SRGBColorSpace : THREE.NoColorSpace
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.anisotropy = 4
    textures.set(name, map)
  }
  return map
}

/** Local CC0 photo materials. UVs express meters, so texture density stays fixed. */
export function wallMaterial(kind: StoneKind) {
  let material = materials.get(kind)
  if (!material) {
    const asset = kind === 'sandstone' ? 'sandstone_blocks_08'
      : kind === 'travertine' ? 'marble_01' : 'plastered_wall_04'
    material = new THREE.MeshStandardMaterial({
      map: texture(asset, 'color'), normalMap: texture(asset, 'normal'),
      roughnessMap: texture(asset, 'roughness'), roughness: 0.9,
      normalScale: new THREE.Vector2(0.45, 0.45), metalness: 0,
      color: kind === 'ivory' ? '#eef2f6' : kind === 'limestone' ? '#d9d3c7' : '#ffffff',
      envMapIntensity: 0.25,
    })
    materials.set(kind, material)
  }
  return material
}

const boxes = new Map<string, THREE.BoxGeometry>()
export function surfaceBox(width: number, height: number, depth: number, tileMeters = 3) {
  const key = [width, height, depth, tileMeters].join(':')
  let geometry = boxes.get(key)
  if (!geometry) {
    geometry = new THREE.BoxGeometry(width, height, depth)
    const uv = geometry.attributes.uv
    const dimensions = [[depth, height], [depth, height], [width, depth], [width, depth], [width, height], [width, height]]
    for (let face = 0; face < 6; face++) {
      const [u, v] = dimensions[face]
      for (let j = 0; j < 4; j++) {
        const i = face * 4 + j
        uv.setXY(i, uv.getX(i) * u / tileMeters, uv.getY(i) * v / tileMeters)
      }
    }
    boxes.set(key, geometry)
  }
  return geometry
}
