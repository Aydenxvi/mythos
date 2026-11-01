import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { museumBronze, museumStone, darkBronze } from '../architecture/museumMaterials'
import type { PlaceholderKind } from '../../types/museum'

interface ExhibitPlaceholderProps { kind: PlaceholderKind; hovered?: boolean }

/**
 * Original stylized study sculptures. Their iconography references mythology,
 * but none purport to be an authentic ancient artifact or a scanned reproduction.
 */
export function ExhibitPlaceholder({kind,hovered=false}:ExhibitPlaceholderProps) {
  const marble = museumStone('ivory')
  const travertine = museumStone('travertine')
  const ebony = useMemo(()=>new THREE.MeshStandardMaterial({color:'#292a27',roughness:0.74,metalness:0.07}),[])
  useEffect(()=>()=>ebony.dispose(),[ebony])
  const trim = hovered ? museumBronze : darkBronze

  if (kind==='column-figure') return <group>
    {/* Athena: an intentionally simplified peplos, helmet, spear and shield. */}
    <mesh material={marble} castShadow position={[0,0.83,0]}><cylinderGeometry args={[0.32,0.67,1.66,40]}/></mesh>
    {Array.from({length:18},(_,i)=>{
      const a=i*Math.PI*2/18
      return <mesh key={i} material={travertine} castShadow position={[Math.sin(a)*0.56,0.77,Math.cos(a)*0.56]}
        rotation={[0,a,0]}><cylinderGeometry args={[0.018,0.065,1.36,8]}/></mesh>
    })}
    <mesh material={marble} castShadow position={[0,1.8,0]}><sphereGeometry args={[0.39,28,22]}/></mesh>
    <mesh material={marble} castShadow position={[0,2.28,0]}><cylinderGeometry args={[0.135,0.18,0.22,24]}/></mesh>
    {/* An oval face with nose, cheeks and recessed eyes, rather than a floating ball. */}
    <mesh material={marble} castShadow position={[0,2.47,.09]} scale={[.80,1.13,.81]}><sphereGeometry args={[0.25,32,28]}/></mesh>
    <mesh material={travertine} position={[0,2.43,.305]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[.064,.20,12]}/></mesh>
    {[-1,1].map(s=><mesh key={s} material={travertine} position={[s*.105,2.53,.277]} scale={[.82,.40,.18]}><sphereGeometry args={[.065,16,8]}/></mesh>)}
    <mesh material={marble} castShadow position={[0,2.68,0]}><sphereGeometry args={[.275,30,20,0,Math.PI*2,0,Math.PI*.57]}/></mesh>
    {/* Crested helmet represented as a swept ridge instead of a sideways cone. */}
    <mesh material={museumBronze} castShadow position={[0,2.9,-.01]} rotation={[Math.PI/2,0,0]} scale={[1,.45,1]}><torusGeometry args={[.28,.044,8,36,Math.PI]}/></mesh>
    {Array.from({length:9},(_,i)=><mesh key={i} material={travertine} castShadow position={[0,2.92+Math.sin(i/8*Math.PI)*.27,-.33+i*.08]} rotation={[0,0,-.14]}><coneGeometry args={[.09,.28,12]}/></mesh>)}
    {[-1,1].map(side=><group key={side}>
      <mesh material={marble} castShadow position={[side*0.46,1.57,0]} rotation={[0,0,side*.22]}>
        <cylinderGeometry args={[0.16,0.10,0.69,20]}/>
      </mesh>
      <mesh material={marble} castShadow position={[side*0.63,1.10,0]} rotation={[0,0,side*.12]}>
        <cylinderGeometry args={[0.095,0.075,0.46,18]}/>
      </mesh>
    </group>)}
    {/* Thin spear and polished stone shield, recognizable even from the room entrance. */}
    <mesh material={museumBronze} castShadow position={[.84,1.58,0]}><cylinderGeometry args={[0.025,0.025,3.45,12]}/></mesh>
    <mesh material={museumBronze} castShadow position={[.84,3.41,0]}><coneGeometry args={[0.095,0.48,10]}/></mesh>
    <mesh material={marble} castShadow position={[-.72,1.32,.18]} rotation={[0,.25,Math.PI/2]}>
      <cylinderGeometry args={[.56,.56,.12,48]}/>
    </mesh>
    <mesh material={trim} position={[-.79,1.32,.22]} rotation={[0,.25,Math.PI/2]}>
      <torusGeometry args={[.47,.025,6,48]}/>
    </mesh>
  </group>

  if(kind==='seated-figure')return <group>
    {/* Jupiter: seated monumental figure, throne, and ceremonial staff. */}
    <mesh material={travertine} castShadow position={[0,.62,-.23]}><boxGeometry args={[1.45,1.25,.46]}/></mesh>
    <mesh material={travertine} castShadow position={[0,.24,.18]}><boxGeometry args={[1.34,.45,1.14]}/></mesh>
    {[-1,1].map(s=><mesh key={s} material={travertine} castShadow position={[s*.72,.73,.18]}>
      <boxGeometry args={[.22,1.15,1.03]}/>
    </mesh>)}
    <mesh material={marble} castShadow position={[0,1.50,0]}><cylinderGeometry args={[.33,.53,1.23,32]}/></mesh>
    <mesh material={marble} castShadow position={[0,2.25,0]}><sphereGeometry args={[.32,28,22]}/></mesh>
    <mesh material={marble} castShadow position={[0,2.58,-.04]}><sphereGeometry args={[.36,24,14,0,Math.PI*2,0,Math.PI*.61]}/></mesh>
    <mesh material={travertine} position={[0,2.22,.31]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[.07,.19,12]}/></mesh>
    {[-1,1].map(s=><mesh key={s} material={travertine} position={[s*.13,2.29,.29]}><sphereGeometry args={[.075,14,10]}/></mesh>)}
    {Array.from({length:9},(_,i)=>{const a=i*Math.PI*2/9;return <mesh key={i} material={travertine} position={[Math.sin(a)*.27,2.51,Math.cos(a)*.23]}><sphereGeometry args={[.10,12,10]}/></mesh>})}
    <mesh material={marble} castShadow position={[0,2.06,.23]}><coneGeometry args={[.22,.33,16]}/></mesh>
    {[-1,1].map(s=><group key={s}>
      <mesh material={marble} castShadow position={[s*.53,1.45,0]} rotation={[0,0,s*.33]}>
        <cylinderGeometry args={[.16,.13,.76,20]}/>
      </mesh>
      <mesh material={marble} castShadow position={[s*.52,.64,.34]}><cylinderGeometry args={[.25,.32,.72,22]}/></mesh>
    </group>)}
    <mesh material={museumBronze} castShadow position={[1.0,1.64,0]}><cylinderGeometry args={[.028,.028,3.1,12]}/></mesh>
    <mesh material={museumBronze} castShadow position={[1,3.18,0]}><sphereGeometry args={[.14,16,12]}/></mesh>
    <mesh material={trim} position={[0,2.61,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.33,.018,8,42]}/></mesh>
  </group>

  if(kind==='canine-guardian')return <group>
    {/* Anubis: abstract jackal-headed standing guardian, not an archaeological replica. */}
    <mesh material={ebony} castShadow position={[0,.86,0]}><cylinderGeometry args={[.26,.47,1.72,32]}/></mesh>
    <mesh material={ebony} castShadow position={[0,1.91,0]}><cylinderGeometry args={[.31,.25,.58,26]}/></mesh>
    <mesh material={ebony} castShadow position={[0,2.39,0]} scale={[.84,1.16,.9]}><sphereGeometry args={[.30,32,28]}/></mesh>
    <mesh material={ebony} castShadow position={[0,2.28,.35]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[.20,.76,24]}/></mesh>
    <mesh material={darkBronze} castShadow position={[0,2.25,.70]} scale={[1,.60,.65]}><sphereGeometry args={[.14,20,12]}/></mesh>
    <mesh material={museumBronze} castShadow position={[0,1.89,0]}><cylinderGeometry args={[.32,.36,.1,32]}/></mesh>
    {[-1,1].map(s=><group key={s}>
      <mesh material={ebony} castShadow position={[s*.19,2.83,-.02]} rotation={[0,0,s*.10]}>
        <coneGeometry args={[.11,.65,12]}/>
      </mesh>
      <mesh material={ebony} castShadow position={[s*.36,1.57,0]} rotation={[0,0,s*.18]}>
        <cylinderGeometry args={[.11,.09,.84,16]}/>
      </mesh>
      <mesh material={museumBronze} position={[s*.16,2.44,.244]} scale={[.9,.48,.45]}><sphereGeometry args={[.054,16,12]}/></mesh>
      <mesh material={museumBronze} position={[s*.14,2.89,-.01]}><coneGeometry args={[.033,.16,10]}/></mesh>
    </group>)}
    {[0,0.10,0.20].map((v,i)=><mesh key={i} material={i===1?darkBronze:museumBronze} position={[0,1.85-v,0]} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[.33+v*.35,.024,8,48]}/>
    </mesh>)}
    <mesh material={museumBronze} castShadow position={[0,.72,.41]}><boxGeometry args={[.62,.055,.07]}/></mesh>
    <mesh material={museumBronze} castShadow position={[0,.72,0]}><cylinderGeometry args={[.36,.36,.07,32]}/></mesh>
    <mesh material={museumBronze} castShadow position={[.71,1.60,0]}><cylinderGeometry args={[.035,.035,3.25,12]}/></mesh>
  </group>

  return <group>
    <mesh material={marble} castShadow position={[0,.82,0]}><boxGeometry args={[1,1.62,.24]}/></mesh>
    <mesh material={museumBronze} position={[0,.98,.13]}><boxGeometry args={[.78,.035,.04]}/></mesh>
  </group>
}
