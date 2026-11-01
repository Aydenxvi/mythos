import { museumStone, darkBronze } from './museumMaterials'
import type { Vec3 } from '../../types/museum'

/** Sandstone papyrus-bundle inspired gallery column. Geometric interpretation, not a replica. */
export function EgyptianColumn({ position, height = 4.9, radiusScale = 1 }: {
  position: Vec3; height?: number; radiusScale?: number
}) {
  const sandstone = museumStone('sandstone')
  const darker = museumStone('limestone')
  return <group position={position} scale={[radiusScale, 1, radiusScale]}>
    <mesh material={darker} position={[0, 0.18, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.7, 0.75, 0.36, 16]} />
    </mesh>
    <mesh material={sandstone} position={[0, height / 2 + 0.3, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.47, 0.56, height, 20]} />
    </mesh>
    {/* Stems cut into the mass of the shaft, rather than Greek flutes. */}
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2
      return <mesh key={i} material={darker} position={[Math.cos(a) * 0.506, height / 2 + 0.35, Math.sin(a) * 0.506]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, Math.max(0.4, height - 1.2), 6]} />
      </mesh>
    })}
    {[0.52, height - 0.26, height + 0.16].map(y => <mesh key={y} material={darkBronze} position={[0, y, 0]}>
      <cylinderGeometry args={[0.525, 0.525, 0.026, 32]} />
    </mesh>)}
    {/* Broad papyrus-shaped flared capital and restrained square abacus. */}
    <mesh material={sandstone} position={[0, height + 0.64, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.82, 0.43, 0.82, 20]} />
    </mesh>
    <mesh material={darker} position={[0, height + 1.1, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.75, 0.22, 1.75]} />
    </mesh>
  </group>
}
