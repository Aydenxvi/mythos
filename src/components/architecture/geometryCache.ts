import * as THREE from 'three'

/** Shared geometry; small radial surface modulation produces readable stone fluting. */
function flutedShaft(flutes = 20, segments = 160): THREE.BufferGeometry {
  const vertices: number[] = []
  const indices: number[] = []
  const uvs: number[] = []
  for (let iy = 0; iy <= 6; iy++) {
    const t = iy / 6
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2
      const r = (0.465 - t * 0.035) - 0.027 * Math.pow((1 - Math.cos(a * flutes)) * 0.5, 1.4)
      vertices.push(Math.sin(a) * r, t - 0.5, Math.cos(a) * r)
      uvs.push(i / segments, t)
      if (i < segments && iy < 6) {
        const k = iy * (segments + 1) + i
        indices.push(k, k + segments + 1, k + 1, k + 1, k + segments + 1, k + segments + 2)
      }
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

const capitalProfile = [
  [0.43, 0], [0.51, 0.04], [0.60, 0.09], [0.60, 0.16],
  [0.54, 0.19], [0.54, 0.24], [0.64, 0.28], [0.65, 0.34],
] as const

export const geometries = {
  columnShaft: flutedShaft(),
  columnBase: new THREE.CylinderGeometry(0.64, 0.68, 0.22, 40),
  columnCapital: new THREE.LatheGeometry(capitalProfile.map(([r,y]) => new THREE.Vector2(r,y)), 48),
  columnFoot: new THREE.CylinderGeometry(0.55, 0.57, 0.11, 40),
  columnAbacus: new THREE.BoxGeometry(1.36, 0.16, 1.36),
  circularFloor: new THREE.CylinderGeometry(1, 1, 0.2, 96),
  rectSlab: new THREE.BoxGeometry(1, 0.2, 1),
  unitBox: new THREE.BoxGeometry(1, 1, 1),
  pedestal: new THREE.CylinderGeometry(0.89, 0.96, 1, 48),
  pedestalCap: new THREE.CylinderGeometry(1.06, 0.98, 0.14, 48),
}
