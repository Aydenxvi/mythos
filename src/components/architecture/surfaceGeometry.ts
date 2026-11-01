import * as THREE from 'three'

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

const cylinders = new Map<string, THREE.CylinderGeometry>()
/** Cylindrical sides use circumference/height; flat caps use planar coordinates. */
export function surfaceCylinder(top: number, bottom: number, height: number, segments = 48, tileMeters = 2) {
  const key = [top, bottom, height, segments, tileMeters].join(':')
  let geometry = cylinders.get(key)
  if (!geometry) {
    geometry = new THREE.CylinderGeometry(top, bottom, height, segments)
    const { position, normal, uv } = geometry.attributes
    for (let i = 0; i < uv.count; i++) {
      if (Math.abs(normal.getY(i)) > 0.99) {
        uv.setXY(i, position.getX(i) / tileMeters, position.getZ(i) / tileMeters)
      } else {
        uv.setXY(i, uv.getX(i) * Math.PI * (top + bottom) / tileMeters, position.getY(i) / tileMeters)
      }
    }
    cylinders.set(key, geometry)
  }
  return geometry
}

const disks = new Map<string, THREE.BufferGeometry>()
export function surfaceDisk(radius: number, inner = 0, tileMeters = 2) {
  const key = [radius, inner, tileMeters].join(':')
  let geometry = disks.get(key)
  if (!geometry) {
    geometry = inner ? new THREE.RingGeometry(inner, radius, 96) : new THREE.CircleGeometry(radius, 96)
    const { position, uv } = geometry.attributes
    for (let i = 0; i < uv.count; i++) uv.setXY(i, position.getX(i) / tileMeters, position.getY(i) / tileMeters)
    disks.set(key, geometry)
  }
  return geometry
}

const repeats = new WeakMap<THREE.BufferGeometry, Map<string, THREE.BufferGeometry>>()
/** UV variants share a cache; changing one object's scale never mutates another. */
export function repeatGeometryUV(source: THREE.BufferGeometry, repeatU: number, repeatV: number) {
  let variants = repeats.get(source)
  if (!variants) { variants = new Map(); repeats.set(source, variants) }
  const key = `${repeatU}:${repeatV}`
  let geometry = variants.get(key)
  if (!geometry) {
    geometry = source.clone()
    const uv = geometry.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * repeatU, uv.getY(i) * repeatV)
    variants.set(key, geometry)
  }
  return geometry
}
