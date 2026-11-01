import * as THREE from 'three'
import { invalidate } from '@react-three/fiber'

const textures = new Map<string, THREE.Texture>()
const loader = new THREE.TextureLoader()
let filtering = 4

/** One GPU texture per local source map, shared by every finish and room. */
export function photoTexture(asset: string, channel: 'color' | 'normal' | 'roughness') {
  const name = `${asset}_${channel}`
  let map = textures.get(name)
  if (!map) {
    map = loader.load(`${import.meta.env.BASE_URL}textures/${name}.jpg`, () => invalidate())
    map.colorSpace = channel === 'color' ? THREE.SRGBColorSpace : THREE.NoColorSpace
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.anisotropy = filtering
    map.name = name
    textures.set(name, map)
  }
  return map
}

/** Quality changes reuse source images and GPU objects; only filtering changes. */
export function setArchitecturalTextureFiltering(anisotropy: number) {
  filtering = anisotropy
  for (const map of textures.values()) {
    if (map.anisotropy === anisotropy) continue
    map.anisotropy = anisotropy
    if (map.image) map.needsUpdate = true
  }
}
