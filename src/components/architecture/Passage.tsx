import { Archway } from './Archway'
import { RectFloor } from './Floor'
import { geometries } from './geometryCache'
import { museumStone, museumBronze } from './museumMaterials'
import { THEMES } from './theme'
import { ROOMS, PASSAGE_WIDTH_EXPORT as WIDTH } from '../../data/world'
import type { Civilization } from '../../types/museum'
import { wallMaterial, surfaceBox } from './surfaceMaterials'

export interface PassageProps { civ: Civilization; wallHeight?: number }
/** Enclosed processional corridor that physically meets both adjoining gallery floors. */
export function Passage({civ,wallHeight=5.5}:PassageProps) {
  const room=ROOMS[civ]
  const {center,length}=room.passage
  const wall=wallMaterial(civ==='egypt'?'sandstone':'limestone')
  const ivory=museumStone('ivory')
  return <group position={[center[0],0,center[2]]} rotation={[0,-room.entranceAngle,0]}>
    <RectFloor width={WIDTH} depth={length} color={THEMES.atrium.floor}/>
    {[-1,1].map(side=><group key={side}>
      <mesh geometry={surfaceBox(0.40,wallHeight,length)} material={wall}
        position={[side*(WIDTH/2),wallHeight/2,0]} receiveShadow />
      <mesh geometry={surfaceBox(0.20,0.40,length,2)} material={ivory}
        position={[side*(WIDTH/2-0.24),0.28,0]} receiveShadow />
      <mesh geometry={geometries.unitBox} material={museumBronze} scale={[0.05,0.06,length]}
        position={[side*(WIDTH/2-0.25),0.57,0]} />
    </group>)}
    <mesh geometry={surfaceBox(WIDTH+0.6,0.38,length)} material={wallMaterial('ivory')}
      position={[0,wallHeight+0.19,0]} receiveShadow />
    {[-length/2+1.3,0,length/2-1.3].map(z=><mesh key={z} geometry={surfaceBox(WIDTH+0.55,0.45,0.46)}
      material={wall} position={[0,wallHeight-0.06,z]} receiveShadow />)}
    <pointLight position={[0,wallHeight-1.1,0]} color="#fff4df" intensity={27} distance={10} decay={2}/>
    <Archway position={[0,0,-length/2]} rotationY={0} width={3.8} height={4.64}
      color={THEMES[civ].wall} shape="arch"/>
  </group>
}
