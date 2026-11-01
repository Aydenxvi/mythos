import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { museumBronze, museumStone } from './museumMaterials'

export interface DomeProps {
  radius?: number
  baseHeight?: number
  color: string
  oculusAngle?: number
}

/** Inward-facing coffered dome with an actual opening at its crown. */
export function Dome({ radius = 11.5, baseHeight = 8.1, oculusAngle = 0.27 }: DomeProps) {
  const shell = useMemo(() => new THREE.SphereGeometry(radius,96,36,0,Math.PI*2,oculusAngle,Math.PI/2-oculusAngle),[radius,oculusAngle])
  const inner = useMemo(() => {const mat=museumStone('ivory').clone(); mat.side=THREE.BackSide;return mat},[])
  const dark = useMemo(() => {const mat=museumStone('limestone').clone(); mat.side=THREE.BackSide; return mat},[])
  const rings = [0.33,0.52,0.77,1.01,1.26]
  const cofferTiles = useMemo(() => {
    const tiles: THREE.BufferGeometry[] = []
    for(let row=0;row<4;row++){
      const theta0=0.34+row*0.226
      const count=12+row*6
      for(let col=0;col<count;col++){
        const start=col*Math.PI*2/count+0.028
        const span=Math.PI*2/count-0.056
        tiles.push(new THREE.SphereGeometry(radius-0.055,3,2,start,span,theta0+0.018,0.18))
      }
    }
    const merged = mergeGeometries(tiles)
    tiles.forEach(geometry => geometry.dispose())
    return merged
  },[radius])
  const ribs = useMemo(() => {
    const pieces = Array.from({length:24},(_,i)=>{
      const a=i*Math.PI*2/24
      const points:THREE.Vector3[]=[]
      for(let j=0;j<=24;j++){
        const th=oculusAngle+j/24*(Math.PI/2-oculusAngle)
        points.push(new THREE.Vector3((radius-0.10)*Math.sin(th)*Math.sin(a),(radius-0.10)*Math.cos(th),(radius-0.10)*Math.sin(th)*Math.cos(a)))
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,0.040,5,false)
    })
    const merged = mergeGeometries(pieces)
    pieces.forEach(geometry => geometry.dispose())
    return merged
  },[radius,oculusAngle])
  return (
    <group position={[0,baseHeight,0]}>
      <mesh geometry={shell} material={inner} receiveShadow />
      <mesh geometry={cofferTiles} material={dark} receiveShadow />
      <mesh geometry={ribs} material={museumStone('ivory')} />
      {rings.map((th,i)=>{
        const r=(radius-0.08)*Math.sin(th)
        const y=(radius-0.08)*Math.cos(th)
        return <mesh key={i} rotation={[Math.PI/2,0,0]} position={[0,y,0]} material={i===0?museumBronze:inner}>
          <torusGeometry args={[r,i===0?0.095:0.065,7,128]} />
        </mesh>
      })}
      {/* Oculus contains empty geometry: light and the sky can be seen through it. */}
      <mesh rotation={[Math.PI/2,0,0]} position={[0,radius*Math.cos(oculusAngle),0]} material={museumBronze}>
        <torusGeometry args={[radius*Math.sin(oculusAngle),0.13,10,100]}/>
      </mesh>
    </group>
  )
}
