import { geometries } from './geometryCache'
import { museumStone } from './museumMaterials'
import { THEMES } from './theme'
import type { Vec3 } from '../../types/museum'

function floorStone(color: string) {
  if (color === THEMES.egypt.floor) return museumStone('sandstone')
  if (color === THEMES.rome.floor) return museumStone('travertine')
  if (color === THEMES.greece.floor) return museumStone('ivory')
  return museumStone('limestone')
}

export function CircularFloor({ radius, color }: { radius: number; color: string }) {
  return <mesh geometry={geometries.circularFloor} material={floorStone(color)} scale={[radius,1,radius]}
    position={[0,-0.1,0]} receiveShadow />
}

export interface RectFloorProps {
  width: number
  depth: number
  color: string
  position?: Vec3
}

export function RectFloor({width,depth,color,position=[0,-0.1,0]}:RectFloorProps) {
  return <mesh geometry={geometries.rectSlab} material={floorStone(color)} scale={[width,1,depth]}
    position={position} receiveShadow />
}
