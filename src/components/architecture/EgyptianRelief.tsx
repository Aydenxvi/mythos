import { museumStone, darkBronze } from './museumMaterials'

/** Original geometric sun-and-reed decoration. Not hieroglyphic writing or an archaeological copy. */
export function EgyptianRelief({ wallZ }: { wallZ: number }) {
  const stone = museumStone('sandstone')
  return <group>
    {[-3.35, 3.35].map(x => <group key={x} position={[x, 2.82, wallZ]}>
      <mesh material={stone} receiveShadow><boxGeometry args={[1.78, 3.9, 0.16]} /></mesh>
      <mesh material={darkBronze} position={[0, 0, 0.091]}>
        <boxGeometry args={[1.57, 3.66, 0.015]} />
      </mesh>
      <mesh material={stone} position={[0, 0, 0.112]}>
        <boxGeometry args={[1.49, 3.58, 0.015]} />
      </mesh>
      <mesh material={darkBronze} position={[0, 1.02, 0.131]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.027, 8, 36]} />
      </mesh>
      {[-0.42, -0.21, 0, 0.21, 0.42].map(px => <mesh key={px} material={darkBronze} position={[px, -0.42, 0.133]}>
        <boxGeometry args={[0.027, 1.62 - Math.abs(px) * 0.35, 0.014]} />
      </mesh>)}
      {[-1.44, -1.64].map(y => <mesh key={y} material={darkBronze} position={[0, y, 0.132]}>
        <boxGeometry args={[1.04, 0.026, 0.016]} />
      </mesh>)}
    </group>)}
  </group>
}
