import { geometries } from './geometryCache'
import { architecturalStone, museumStone } from './museumMaterials'
import { repeatGeometryUV, surfaceBox, surfaceCylinder } from './surfaceGeometry'
import type { Vec3 } from '../../types/museum'

export interface ColumnProps {
  position: Vec3
  height?: number
  radiusScale?: number
  color: string
}

/** Fluted stone column with stepped torus-like base, molded capital and squared abacus. */
export function Column({ position, height = 4.6, radiusScale = 1, color }: ColumnProps) {
  const stone = architecturalStone(color)
  const trim = museumStone('travertine')
  const shaft = repeatGeometryUV(geometries.columnShaft, Math.PI * 0.9 * radiusScale / 2, height / 2)
  const capital = repeatGeometryUV(geometries.columnCapital, Math.PI * 1.1 * radiusScale / 2, 0.34 / 2)
  return (
    <group position={position} scale={[radiusScale, 1, radiusScale]}>
      <mesh geometry={surfaceCylinder(0.64,0.68,0.22,40)} material={stone} position={[0, 0.12, 0]} receiveShadow />
      <mesh geometry={surfaceCylinder(0.55,0.57,0.11,40)} material={trim} position={[0, 0.27, 0]} receiveShadow />
      <mesh geometry={shaft} material={stone} scale={[1, height, 1]}
        position={[0, 0.32 + height / 2, 0]} receiveShadow />
      <mesh geometry={capital} material={stone}
        position={[0, height + 0.32, 0]} receiveShadow />
      <mesh geometry={surfaceBox(1.36,0.16,1.36,2)} material={stone}
        position={[0, height + 0.74, 0]} receiveShadow />
    </group>
  )
}
