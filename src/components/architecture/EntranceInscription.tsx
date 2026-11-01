import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import type { Civilization } from '../../types/museum'

const labels: Record<Civilization, [string,string]> = {
  greece: ['H E L L A S','MYTHS OF THE OLYMPIANS'],
  rome: ['R O M A','ORDER & EMPIRE'],
  egypt: ['K E M E T','THE ETERNAL KINGDOM'],
}

export function EntranceInscription({civ}: {civ:Civilization}) {
  const tex = useMemo(()=>{
    const canvas=document.createElement('canvas')
    canvas.width=1024;canvas.height=256
    const ctx=canvas.getContext('2d')!
    ctx.clearRect(0,0,1024,256)
    ctx.textAlign='center'
    ctx.fillStyle='#5e492b'
    ctx.font='500 76px Georgia, serif'
    ctx.fillText(labels[civ][0],512,102)
    ctx.fillStyle='#7f6b4d'
    ctx.font='34px Georgia,serif'
    ctx.fillText(labels[civ][1],512,167)
    const t=new THREE.CanvasTexture(canvas)
    t.colorSpace=THREE.SRGBColorSpace
    t.anisotropy=4
    return t
  },[civ])
  const mat=useMemo(()=>new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide}),[tex])
  useEffect(()=>()=>{tex.dispose();mat.dispose()},[tex,mat])
  return (
    <mesh position={[0,6.92,0.55]} material={mat}>
      <planeGeometry args={[3.9,0.97]} />
    </mesh>
  )
}
