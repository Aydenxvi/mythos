import { Column } from '../../components/architecture/Column'
import { EgyptianColumn } from '../../components/architecture/EgyptianColumn'
import { EgyptianRelief } from '../../components/architecture/EgyptianRelief'
import { GalleryDetails } from '../../components/architecture/GalleryDetails'
import { RectFloor } from '../../components/architecture/Floor'
import { museumStone, museumBronze } from '../../components/architecture/museumMaterials'
import { THEMES } from '../../components/architecture/theme'
import { ROOMS, ROOM_WIDTH_EXPORT as WIDTH, ROOM_DEPTH_EXPORT as DEPTH } from '../../data/world'
import type { Civilization } from '../../types/museum'
import { wallMaterial, surfaceBox } from '../../components/architecture/surfaceMaterials'

export interface RoomShellProps {
  civ: Civilization
  columnsPerSide?: number
  columnHeight?: number
  columnRadiusScale?: number
  wallHeight?: number
}

/** Designed gallery shell: continuous architecture, moulded walls and an illuminated exhibit niche. */
export function RoomShell({civ,columnsPerSide=3,columnHeight=4.2,columnRadiusScale=1,wallHeight=5.3}:RoomShellProps) {
  const room=ROOMS[civ]
  const theme=THEMES[civ]
  const wall=wallMaterial(civ==='egypt'?'sandstone':civ==='rome'?'travertine':'ivory')
  const detail=museumStone(civ==='egypt'?'travertine':'ivory')
  const columnZ=Array.from({length:columnsPerSide},(_,i)=>DEPTH/2-1.05-i*(DEPTH-3)/(columnsPerSide-1 || 1))
  return <group position={[room.worldPosition[0],0,room.worldPosition[2]]} rotation={[0,-room.entranceAngle,0]}>
    <RectFloor width={WIDTH} depth={DEPTH} color={theme.floor}/>
    <GalleryDetails civ={civ}/>
    {/* Side walls and rear gallery: no more black void behind columns. */}
    {[-1,1].map(side=><group key={side}>
      <mesh geometry={surfaceBox(0.32,wallHeight+0.6,DEPTH+0.2)} material={wall} position={[side*WIDTH/2,wallHeight/2+0.3,0]}
        receiveShadow />
      <mesh geometry={surfaceBox(0.22,0.52,DEPTH,2)} material={detail} position={[side*(WIDTH/2-0.16),0.26,0]} receiveShadow />
      <mesh geometry={surfaceBox(0.22,0.27,DEPTH,2)} material={detail} position={[side*(WIDTH/2-0.16),wallHeight-0.2,0]} receiveShadow />
      {columnZ.map((z,i)=>civ==='egypt'
        ? <EgyptianColumn key={i} position={[side*(WIDTH/2-0.98),0,z]} height={columnHeight} radiusScale={columnRadiusScale * 0.9}/>
        : <Column key={i} position={[side*(WIDTH/2-0.86),0,z]}
            height={columnHeight} radiusScale={columnRadiusScale} color={theme.column}/>)}
    </group>)}
    <mesh geometry={surfaceBox(WIDTH,wallHeight+0.6,0.42)} material={wall}
      position={[0,(wallHeight+0.6)/2,-DEPTH/2]} receiveShadow />
    <mesh geometry={surfaceBox(WIDTH+0.15,0.42,0.55,2)} material={detail}
      position={[0,wallHeight+0.12,-DEPTH/2]} receiveShadow />
    {/* Egyptian gallery receives an independent shallow relief, not Greek orders everywhere. */}
    {civ==='egypt' && <EgyptianRelief wallZ={-DEPTH/2+0.36} />}
    {/* A recessed framed niche behind the sculpture. */}
    <mesh geometry={surfaceBox(3.5,4.6,0.035)} material={civ==='egypt'?wall:museumBronze}
      position={[0,3.2,-DEPTH/2+0.26]}/>
    <mesh geometry={surfaceBox(3.37,4.46,0.042)} material={wall}
      position={[0,3.2,-DEPTH/2+0.3]}/>
    <mesh geometry={surfaceBox(4,0.56,0.75,2)} material={detail}
      position={[0,0.32,-DEPTH/2+0.34]}/>
    {/* Stepped ceiling and beams make the interiors feel enclosed and continuous. */}
    <mesh geometry={surfaceBox(WIDTH+0.12,0.32,DEPTH)} material={wallMaterial('ivory')}
      position={[0,wallHeight+0.72,0]} receiveShadow />
    {[ -DEPTH/2 + 2.1, 0, DEPTH/2 - 2.1].map(z=><mesh key={z}
      geometry={surfaceBox(WIDTH,0.30,0.52)} material={wall}
      position={[0,wallHeight+0.46,z]} receiveShadow />)}
    <pointLight position={[0,wallHeight-0.5,-DEPTH/2+3]} color={theme.accentLight}
      intensity={2.4} distance={12} decay={2}/>
    <pointLight position={[0,wallHeight-0.3,DEPTH/2-2]} color="#fff5e7"
      intensity={1.1} distance={10} decay={2}/>
  </group>
}
