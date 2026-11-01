import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { wallMaterial } from './surfaceMaterials'
import { Column } from './Column'
import { geometries } from './geometryCache'
import { museumStone, museumBronze, darkBronze } from './museumMaterials'
import { ATRIUM_RADIUS_EXPORT as RADIUS, ROOMS, ROOM_ORDER } from '../../data/world'

const TWO_PI = Math.PI * 2
const ENTRANCE_HALF_WIDTH = 0.235
function difference(a: number, b: number) { return Math.atan2(Math.sin(a-b), Math.cos(a-b)) }
const blocked = (angle: number) => Math.abs(difference(angle, Math.PI)) < 0.35 || ROOM_ORDER.some(id => Math.abs(difference(angle, ROOMS[id].entranceAngle)) < ENTRANCE_HALF_WIDTH)

/** Real inner wall segments, omitted at each archway, with restrained stone mouldings. */
export function RotundaWalls() {
  const wall = wallMaterial('limestone')
  const ivory = museumStone('ivory')
  const segments = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    const count = 84
    for (let i = 0; i < count; i++) {
      const a = (i+0.5) * TWO_PI/count
      if (blocked(a)) continue
      const geometry = new THREE.CylinderGeometry(RADIUS - 0.1, RADIUS - 0.1, 7.7, 4, 1, true,
        Math.PI-(i+1)*TWO_PI/count, TWO_PI/count+0.001)
      const uv = geometry.attributes.uv
      const arc = (RADIUS - 0.1) * TWO_PI / count
      for (let j = 0; j < uv.count; j++) uv.setXY(j, (i + 1 - uv.getX(j)) * arc / 3, uv.getY(j) * 7.7 / 3)
      parts.push(geometry)
    }
    const merged = mergeGeometries(parts)
    parts.forEach(part => part.dispose())
    return merged
  }, [])
  // Cylinder meshes are double sided: the viewer must see the interior.
  const inner = useMemo(() => { const m = wall.clone(); m.side = THREE.DoubleSide; return m }, [wall])
  const rim = useMemo(() => new THREE.TorusGeometry(RADIUS-0.06, 0.16, 8, 112), [])
  const drum = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(RADIUS+0.25,RADIUS+0.25,0.76,112,1,true)
    const uv = geometry.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * TWO_PI * (RADIUS+0.25) / 3, uv.getY(i) * 0.76 / 3)
    return geometry
  }, [])
  return (
    <group>
      <mesh geometry={segments} material={inner} position={[0,3.85,0]} receiveShadow />
      {/* Continuous frieze above the door lintels, set into the dome drum. */}
      <mesh geometry={drum} material={inner} position={[0,7.78,0]} />
      {[7.33, 7.7, 8.12].map((height,i) => (
        <mesh key={height} geometry={rim} material={i===1?museumBronze:ivory}
          position={[0,height,0]} rotation={[Math.PI/2,0,0]} scale={[1,1,i===1?0.32:1]} />
      ))}
    </group>
  )
}

/** Concentric marble mosaic rings and brass markers give floor a material hierarchy. */
export function RotundaFloorInlay() {
  const stone = museumStone('travertine')
  const rings = [2.0, 3.0, 3.38, 6.1, 8.45]
  return (
    <group>
      <mesh position={[0,0.018,0]} rotation={[-Math.PI/2,0,0]}>
        <circleGeometry args={[3.1,96]} />
        <primitive object={stone} attach="material" />
      </mesh>
      {rings.map((r,i)=><mesh key={r} position={[0,0.028+i*0.001,0]} rotation={[Math.PI/2,0,0]} material={i%2===0?museumBronze:darkBronze}>
        <torusGeometry args={[r,i===2?0.07:0.027,8,144]}/>
      </mesh>)}
      {Array.from({length:32},(_,i)=>{
        const a=i*TWO_PI/32
        return <mesh key={i} geometry={geometries.unitBox} material={museumBronze}
          position={[Math.cos(a)*3.22,0.028,Math.sin(a)*3.22]}
          rotation={[0,-a,0]} scale={[0.13,0.008,0.032]} />
      })}
    </group>
  )
}

/** Classical round nave: sculptural column rhythm, not the previous four bare cylinders. */
export function RotundaColonnade() {
  const angles = Array.from({length:20},(_,i)=>i*TWO_PI/20)
    .filter(angle => !blocked(angle) && Math.abs(difference(angle, Math.PI)) > 0.18)
  return (
    <group>
      {angles.map((angle,i)=>{
        const r=RADIUS-1.0
        const x=Math.sin(angle)*r, z=-Math.cos(angle)*r
        return <group key={i}>
          <Column position={[x,0,z]} height={6.45} radiusScale={1.05} color="#eee6d7" />
          <mesh material={museumStone('ivory')} position={[x,7.32,z]} castShadow receiveShadow>
            <boxGeometry args={[1.65,0.26,1.65]} />
          </mesh>
        </group>
      })}
    </group>
  )
}

/** Three elliptical bronze orbits form an original "Cycles of Time" museum installation.
 *  A contemporary, interpretive centerpiece, not an ancient archaeological object.
 *  The silhouette deliberately avoids a fake humanoid statue made from primitives.
 */
export function CentralMonument() {
  const marble = museumStone('ivory')
  const base = museumStone('travertine')
  return <group>
    {[{r:2.05,h:0.16,y:0.08},{r:1.76,h:0.19,y:0.25},{r:1.41,h:0.94,y:0.81},{r:1.58,h:0.19,y:1.36}].map((p,i)=>(
      <mesh key={i} material={i===2?marble:base} castShadow receiveShadow position={[0,p.y,0]}>
        <cylinderGeometry args={[p.r,p.r+(i===2?.15:0),p.h,72]} />
      </mesh>
    ))}
    {/* Fine central stem, kept behind the orbital sculpture. */}
    <mesh material={darkBronze} position={[0,1.96,0]} castShadow>
      <cylinderGeometry args={[0.085,0.125,0.95,24]} />
    </mesh>
    <group position={[0,2.66,0]}>
      <mesh material={museumBronze} castShadow rotation={[0,0,0.17]}>
        <torusGeometry args={[1.21,0.063,12,108]} />
      </mesh>
      <mesh material={darkBronze} castShadow rotation={[0.63,0.33,1.05]}>
        <torusGeometry args={[1.40,0.053,12,108]} />
      </mesh>
      <mesh material={museumBronze} castShadow rotation={[1.1,-0.38,-0.62]}>
        <torusGeometry args={[1.30,0.044,12,108]} />
      </mesh>
      <mesh material={marble} castShadow receiveShadow>
        <sphereGeometry args={[0.57,48,32]} />
      </mesh>
      {/* Meridian and equator grooves suggest time and travel without neon effects. */}
      <mesh material={darkBronze} rotation={[Math.PI/2,0,0]}>
        <torusGeometry args={[0.575,0.012,8,72]} />
      </mesh>
      <mesh material={darkBronze} rotation={[0,Math.PI/2,0]}>
        <torusGeometry args={[0.575,0.011,8,72]} />
      </mesh>
    </group>
    <mesh position={[0,1.46,1.51]} material={darkBronze}>
      <boxGeometry args={[1.16,0.15,0.035]} />
    </mesh>
  </group>
}
