import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { GraphicsQuality } from '../../hooks/useGraphicsQuality'
import { useMuseumState } from '../../app/AppStateContext'
import { ROOMS } from '../../data/world'
import { GRAPHICS } from '../../graphics'

/** Local reflection environment makes metallic GLTF materials readable. */
function Reflections() {
  const { gl, scene, invalidate } = useThree()
  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const environment = generator.fromScene(room, 0.04, 0.1, 100)
    scene.environment = environment.texture
    scene.environmentIntensity = 0.35
    room.dispose()
    generator.dispose()
    invalidate()
    return () => { scene.environment = null; environment.dispose() }
  }, [gl, scene, invalidate])
  return null
}

/** One shadow source, focused on the visited gallery; static shadows are cached. */
export function Lighting({ quality }: { quality: GraphicsQuality }) {
  const { state } = useMuseumState()
  const light = useRef<THREE.DirectionalLight>(null)
  const target = useRef(new THREE.Object3D())
  const invalidate = useThree(s => s.invalidate)
  const room = state.activeRoom ? ROOMS[state.activeRoom] : null
  const [x, , z] = room?.roomCamera.target ?? [0, 0, 0]
  const angle = room?.entranceAngle ?? 0
  const extent = room ? 10 : 19
  const size = GRAPHICS[quality].shadowSize || 512
  useEffect(() => {
    if (light.current) {
      light.current.shadow.map?.dispose()
      light.current.shadow.map = null
      light.current.shadow.needsUpdate = true
    }
    invalidate()
  }, [quality, invalidate])
  useEffect(() => {
    target.current.position.set(x, 1.8, z)
    target.current.updateMatrixWorld()
    if (light.current) light.current.shadow.needsUpdate = true
    invalidate()
  }, [x, z, state.isTransitioning, invalidate])
  return <>
    <Reflections />
    <primitive object={target.current} />
    <hemisphereLight args={['#edf2ff', '#8b8074', 0.7]} />
    <ambientLight intensity={0.12} color="#ffffff" />
    <directionalLight ref={light} target={target.current}
      position={[x - 6 * Math.cos(angle) - 8 * Math.sin(angle), 13, z - 6 * Math.sin(angle) + 8 * Math.cos(angle)]}
      intensity={2.5} color="#fff7ed" castShadow={quality !== 'eco'}
      shadow-autoUpdate={false} shadow-mapSize-width={size} shadow-mapSize-height={size}
      shadow-radius={2} shadow-normalBias={0.025} shadow-bias={-0.0002}
      shadow-camera-near={0.5} shadow-camera-far={45}
      shadow-camera-left={-extent} shadow-camera-right={extent}
      shadow-camera-top={extent} shadow-camera-bottom={-extent}/>
    <directionalLight position={[x + 9, 8, z + 4]} intensity={0.65} color="#e6eeff" />
  </>
}
