import { geometries } from './geometryCache'
import { getStoneMaterial } from './materialCache'
import type { Vec3 } from '../../types/museum'

export interface ColumnProps {
  position: Vec3
  height?: number
  radiusScale?: number
  color: string
}

/** Fluted stone column with stepped torus-like base, molded capital and squared abacus. */
export function Column({ position, height = 4.6, radiusScale = 1, color }: ColumnProps) {
  const stone = getStoneMaterial(color, 0.84)
  const trim = getStoneMaterial('#d5c6ac', 0.85)
  return (
    <group position={position} scale={[radiusScale, 1, radiusScale]}>
      <mesh geometry={geometries.columnBase} material={stone} position={[0, 0.12, 0]} receiveShadow />
      <mesh geometry={geometries.columnFoot} material={trim} position={[0, 0.27, 0]} receiveShadow />
      <mesh geometry={geometries.columnShaft} material={stone} scale={[1, height, 1]}
        position={[0, 0.32 + height / 2, 0]} receiveShadow />
      <mesh geometry={geometries.columnCapital} material={stone}
        position={[0, height + 0.32, 0]} receiveShadow />
      <mesh geometry={geometries.columnAbacus} material={stone}
        position={[0, height + 0.74, 0]} receiveShadow />
    </group>
  )
}
