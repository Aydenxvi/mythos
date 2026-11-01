import * as THREE from 'three'

export type StoneKind = 'ivory' | 'travertine' | 'limestone' | 'sandstone'
const palette: Record<StoneKind, { tone: number; variation: number; warmth: number }> = {
  ivory: { tone: 238, variation: 8, warmth: 1.01 },
  travertine: { tone: 224, variation: 15, warmth: 0.84 },
  limestone: { tone: 211, variation: 12, warmth: 0.91 },
  sandstone: { tone: 194, variation: 21, warmth: 0.96 },
}

const cache = new Map<StoneKind, THREE.MeshStandardMaterial>()
/** Locally generated fine-grain stone texture. No downloads, CORS, or missing assets. */
export function museumStone(kind: StoneKind): THREE.MeshStandardMaterial {
  const existing = cache.get(kind)
  if (existing) return existing
  const { tone, variation, warmth } = palette[kind]
  const size = 256
  const pixels = new Uint8Array(size * size * 4)
  const fract = (n: number) => n - Math.floor(n)
  const hash = (x: number, y: number) => fract(Math.sin(x * 127.1 + y * 311.7 + 49.3) * 43758.5453)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const noise = (x: number, y: number, grid: number) => {
    const px = x * grid / size; const py = y * grid / size
    const xi = Math.floor(px); const yi = Math.floor(py)
    const tx = px - xi; const ty = py - yi
    const sx = tx * tx * (3 - 2 * tx); const sy = ty * ty * (3 - 2 * ty)
    return lerp(lerp(hash(xi, yi), hash(xi+1, yi), sx), lerp(hash(xi, yi+1), hash(xi+1, yi+1), sx), sy)
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const grain = (noise(x,y,10)-0.5)*variation + (noise(x,y,40)-0.5)*3
    const veins = Math.pow(Math.max(0, Math.sin(x*0.12 + y*0.045 + noise(x,y,4)*7)), 22)*variation*0.4
    const value = tone + grain - veins
    const idx = (y*size+x)*4
    pixels[idx] = Math.max(0, Math.min(255, value + (kind === 'sandstone' ? 5 : 4)))
    pixels[idx+1] = Math.max(0, Math.min(255, value * warmth + (kind === 'sandstone' ? -3 : 10)))
    pixels[idx+2] = Math.max(0, Math.min(255, value * (warmth-0.09) + (kind === 'sandstone' ? -12 : 15)))
    pixels[idx+3] = 255
  }
  const texture = new THREE.DataTexture(pixels, size, size)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = 4
  texture.needsUpdate = true
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.87, metalness: 0 })
  cache.set(kind, material)
  return material
}

export const museumBronze = new THREE.MeshStandardMaterial({ color: '#a88b5c', metalness: 0.68, roughness: 0.42 })
export const darkBronze = new THREE.MeshStandardMaterial({ color: '#574735', metalness: 0.56, roughness: 0.55 })
