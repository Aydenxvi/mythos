import * as THREE from 'three'
import { photoTexture } from './photoTextures'

export type StoneKind = 'ivory' | 'travertine' | 'limestone' | 'sandstone'
const cache = new Map<string, THREE.MeshStandardMaterial>()

function finish(key: string, asset: string, color: string, roughness: number, relief: number, metalness = 0) {
  let material = cache.get(key)
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      name: key, color, roughness: 1, metalness,
      map: photoTexture(asset, 'color'), normalMap: photoTexture(asset, 'normal'),
      roughnessMap: photoTexture(asset, 'roughness'),
      normalScale: new THREE.Vector2(relief, relief),
      envMapIntensity: metalness ? 1.1 : 0.65,
    })
    // Source marble is highly polished. Give each finish a real roughness
    // range so honed columns do not inherit the floor's mirror-like highlights.
    const minimum = metalness ? 0.22 : roughness < 0.7 ? 0.24 : 0.52
    material.onBeforeCompile = shader => {
      shader.uniforms.mythosRoughnessRange = { value: new THREE.Vector2(minimum, roughness) }
      shader.fragmentShader = 'uniform vec2 mythosRoughnessRange;\n' + shader.fragmentShader
      shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>',
        '#include <roughnessmap_fragment>\nroughnessFactor = mix(mythosRoughnessRange.x, mythosRoughnessRange.y, roughnessFactor);')
    }
    material.customProgramCacheKey = () => 'mythos-roughness-range-v1'
    cache.set(key, material)
  }
  return material
}

/** Honed architectural stone; material variation comes from local PBR maps. */
export function museumStone(kind: StoneKind) {
  if (kind === 'ivory') return finish(kind, 'Marble012', '#f3f1eb', 0.85, 0.16)
  if (kind === 'travertine') return finish(kind, 'Travertine009', '#f0e3cf', 0.9, 0.35)
  if (kind === 'sandstone') return finish(kind, 'Travertine009', '#ceb182', 1, 0.55)
  return finish(kind, 'Travertine009', '#bcb7a9', 1, 0.3)
}

export function architecturalStone(color: string, warm = false) {
  return finish(`cut-stone:${color}:${warm}`, warm ? 'Travertine009' : 'Marble012', color, 0.9, warm ? 0.3 : 0.16)
}

export const museumBronze = finish('brushed-bronze', 'Metal048A', '#f1d3ab', 0.85, 0.18, 0.85)
export const darkBronze = finish('aged-bronze', 'Metal048A', '#6b5540', 1, 0.2, 0.8)
export const darkMarble = finish('dark-marble', 'Marble006', '#d5ded8', 0.65, 0.12)
export const polishedMarble = finish('polished-marble', 'Marble012', '#eeeae2', 0.55, 0.09)
