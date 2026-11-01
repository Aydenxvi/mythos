import { geometries } from './geometryCache'
import { getStoneMaterial } from './materialCache'
import type { Vec3 } from '../../types/museum'

export interface PedestalProps {
  position?: Vec3
  height?: number
  color: string
}

/** The atrium's central exhibition plinth. */
export function Pedestal({ position = [0, 0, 0], height = 1.05, color }: PedestalProps) {
  const material = getStoneMaterial(color, 0.6)
  return (
    <group position={position}>
      <mesh
        geometry={geometries.pedestal}
        material={material}
        scale={[0.85, height, 0.85]}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={geometries.pedestalCap}
        material={material}
        position={[0, height + 0.07, 0]}
        castShadow
        receiveShadow
      />
    </group>
  )
}
