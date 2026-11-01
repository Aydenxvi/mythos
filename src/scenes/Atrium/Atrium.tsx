import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { CircularFloor, RectFloor } from '../../components/architecture/Floor'
import { Dome } from '../../components/architecture/Dome'
import { Archway } from '../../components/architecture/Archway'
import { EntranceInscription } from '../../components/architecture/EntranceInscription'
import { RotundaWalls, RotundaColonnade, RotundaFloorInlay, CentralMonument } from '../../components/architecture/RotundaDetails'
import { THEMES } from '../../components/architecture/theme'
import { Column } from '../../components/architecture/Column'
import { museumStone } from '../../components/architecture/museumMaterials'
import { ROOMS, ROOM_ORDER, ATRIUM_RADIUS_EXPORT as RADIUS } from '../../data/world'
import type { Civilization } from '../../types/museum'

export interface AtriumProps {
  onSelectRoom: (room: Civilization) => void
  interactive: boolean
}

function EntranceTarget({civ,interactive,onSelect}: {civ:Civilization,interactive:boolean,onSelect:(room:Civilization)=>void}) {
  const [hover,setHover]=useState(false)
  const invalidate = useThree(s=>s.invalidate)
  const group=useRef<THREE.Group>(null)
  const room=ROOMS[civ]
  useFrame((_,dt)=>{
    if(group.current) {
      const next=THREE.MathUtils.damp(group.current.scale.x,hover&&interactive?1.02:1,7,dt)
      group.current.scale.setScalar(next)
      if(Math.abs(next-(hover&&interactive?1.02:1))>0.0005) invalidate()
    }
  })
  useEffect(()=>{if(!interactive){setHover(false);invalidate();document.body.style.cursor='auto'}},[interactive,invalidate])
  useEffect(()=>()=>{document.body.style.cursor='auto'},[])
  const position: [number,number,number] = [Math.sin(room.entranceAngle)*RADIUS,0,-Math.cos(room.entranceAngle)*RADIUS]
  function enter(e:ThreeEvent<MouseEvent>){e.stopPropagation();if(interactive)onSelect(civ)}
  function over(e:ThreeEvent<PointerEvent>){e.stopPropagation();if(interactive){setHover(true);invalidate();document.body.style.cursor='pointer'}}
  function out(e:ThreeEvent<PointerEvent>){e.stopPropagation();setHover(false);invalidate();document.body.style.cursor='auto'}
  return <group ref={group} position={position} rotation={[0,-room.entranceAngle,0]}>
    <Archway position={[0,0,0]} rotationY={0} width={3.8} height={4.66} color={THEMES[civ].wall} />
    <EntranceInscription civ={civ}/>
    <mesh position={[0,3,0.07]} onClick={interactive ? enter : undefined} onPointerOver={interactive ? over : undefined} onPointerOut={interactive ? out : undefined}>
      <boxGeometry args={[4.15,6.35,0.16]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
    </mesh>
  </group>
}

export function Atrium({onSelectRoom,interactive}:AtriumProps) {
  return <group>
    <CircularFloor radius={RADIUS} color={THEMES.atrium.floor}/>
    {/* Actual forecourt outside the south entry; otherwise the welcome view floats over empty sky. */}
    <RectFloor width={11} depth={17.5} color={THEMES.atrium.floor} position={[0,-0.1,15.25]}/>
    <Archway position={[0,0,RADIUS+0.35]} rotationY={Math.PI} width={7.4} height={6.2}
      color={THEMES.atrium.column} shape="arch" />
    {[-1,1].map(s=><group key={s}>
      {[13.4,18.2].map(z=><Column key={z} position={[s*5.3,0,z]} height={6.2} radiusScale={0.97} color="#efe7d7"/>)}
      <mesh material={museumStone('ivory')} position={[s*5.3,7.20,15.8]} receiveShadow>
        <boxGeometry args={[1.46,0.52,7.8]}/>
      </mesh>
    </group>)}
    <RotundaFloorInlay />
    <RotundaWalls />
    <RotundaColonnade />
    <Dome radius={RADIUS-0.05} baseHeight={8.15} color={THEMES.atrium.wall} />
    <CentralMonument />
    {ROOM_ORDER.map(civ=><EntranceTarget key={civ} civ={civ} interactive={interactive} onSelect={onSelectRoom}/>)}
    {/* Gentle architectural fill in the large rotunda, rather than orange point-light pools. */}
    <pointLight position={[0,11,0]} color="#fff7e7" intensity={28} distance={30} decay={2}/>
  </group>
}
