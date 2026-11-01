import * as THREE from 'three'

const cache = new Map<string, THREE.MeshStandardMaterial>()

/**
 * Returns a shared MeshStandardMaterial for the given look, creating it
 * once and reusing it for every mesh that asks for the same combination.
 */
export function getStoneMaterial(
  color: string,
  roughness = 0.85,
  options?: { metalness?: number; side?: THREE.Side },
): THREE.MeshStandardMaterial {
  const metalness = options?.metalness ?? 0
  const side = options?.side ?? THREE.FrontSide
  const key = `${color}|${roughness}|${metalness}|${side}`
  let material = cache.get(key)
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, roughness, metalness, side })
    cache.set(key, material)
  }
  return material
}
