import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { museumBronze, darkBronze, museumStone } from './museumMaterials'
import { ROOM_DEPTH_EXPORT as DEPTH, ROOM_WIDTH_EXPORT as WIDTH } from '../../data/world'
import type { Civilization } from '../../types/museum'

const greekFrieze = (() => {
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < 22; i++) {
    const x = -3.52 + i * .335
    parts.push(new THREE.BoxGeometry(.20,.035,.035).translate(x,0,0))
    parts.push(new THREE.BoxGeometry(.032,.19,.035).translate(x+.10,.095,0))
    parts.push(new THREE.BoxGeometry(.12,.035,.035).translate(x+.14,.19,0))
  }
  const geometry = mergeGeometries(parts)
  parts.forEach(part => part.dispose())
  return geometry
})()

/** Quiet architectural decoration, deliberately not passed off as original antiquities. */
export function GalleryDetails({ civ }: { civ: Civilization }) {
  const pale = museumStone(civ === 'egypt' ? 'limestone' : 'ivory')
  const warm = museumStone(civ === 'egypt' ? 'sandstone' : 'travertine')
  const edge = civ === 'egypt' ? darkBronze : museumBronze
  const floorInlay = [
    { pos: [0, 0.013, -DEPTH / 2 + 1.0] as const, scale: [WIDTH - 1.8, .012, .042] as const },
    { pos: [0, 0.013, DEPTH / 2 - 1.05] as const, scale: [WIDTH - 1.8, .012, .042] as const },
    { pos: [WIDTH / 2 - 0.95, 0.013, 0] as const, scale: [.042, .012, DEPTH - 2.1] as const },
    { pos: [-WIDTH / 2 + 0.95, 0.013, 0] as const, scale: [.042, .012, DEPTH - 2.1] as const },
  ]
  return <group>
    {floorInlay.map((line,i)=><mesh key={i} position={[...line.pos]} scale={[...line.scale]} material={edge} receiveShadow><boxGeometry args={[1,1,1]}/></mesh>)}
    {/* A large stone roundel anchors the plinth in its niche. */}
    <mesh material={warm} rotation={[-Math.PI/2,0,0]} position={[0,.02,-DEPTH*.12]} receiveShadow><circleGeometry args={[2.55,64]}/></mesh>
    <mesh material={edge} rotation={[Math.PI/2,0,0]} position={[0,.026,-DEPTH*.12]}><torusGeometry args={[2.55,.021,8,96]}/></mesh>
    <mesh material={pale} rotation={[-Math.PI/2,0,0]} position={[0,.027,-DEPTH*.12]}><ringGeometry args={[2.19,2.26,96]}/></mesh>
    {civ==='greece'&&<group>
      {/* Repeated angular frieze, derived from the rhythm of a Greek key. */}
      <mesh geometry={greekFrieze} material={edge} position={[0,4.58,-DEPTH/2+.38]} />
      <mesh material={pale} position={[0,4.8,-DEPTH/2+.30]}><boxGeometry args={[WIDTH-1.5,.12,.12]}/></mesh>
    </group>}
    {civ==='rome'&&<group>
      {/* Stepped imperial-style cornice and restrained bronze medallion. */}
      {[4.35,4.61,4.84].map((y,i)=><mesh key={i} material={i===1?edge:warm} position={[0,y,-DEPTH/2+.37]}><boxGeometry args={[WIDTH-1.5+i*.12,i===1?.07:.14,.13+i*.06]}/></mesh>)}
      <mesh material={edge} position={[0,3.12,-DEPTH/2+.42]}><torusGeometry args={[.67,.046,8,64]}/></mesh>
      <mesh material={pale} position={[0,3.12,-DEPTH/2+.47]}><circleGeometry args={[.59,64]}/></mesh>
    </group>}
    {civ==='egypt'&&<group>
      {/* Deep stone banding and reed motifs are interpretive, not invented hieroglyphs. */}
      {[1.1,4.2,4.5].map((y,i)=><mesh key={i} material={i===1?edge:warm} position={[0,y,-DEPTH/2+.37]}><boxGeometry args={[WIDTH-1.5,i===1?.07:.16,.2]}/></mesh>)}
      {Array.from({length:14},(_,i)=>{
        const x=-3.3+i*.51
        return <mesh key={i} material={edge} position={[x,4.34,-DEPTH/2+.5]}><boxGeometry args={[.035,.13,.042]}/></mesh>
      })}
    </group>}
  </group>
}
