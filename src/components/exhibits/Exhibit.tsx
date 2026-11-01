import { Suspense, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useMuseumState } from '../../app/AppStateContext'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { ExhibitPlaceholder } from './ExhibitPlaceholder'
import { ExhibitModel } from './ExhibitModel'
import { ModelErrorBoundary } from './ModelErrorBoundary'
import { museumStone, museumBronze, darkMarble } from '../architecture/museumMaterials'
import { surfaceCylinder } from '../architecture/surfaceGeometry'
import type { ExhibitData } from '../../types/museum'
import { useGraphicsQualityContext } from '../../hooks/GraphicsQualityContext'
import { modelUrl } from '../../graphics'

export interface ExhibitProps {
  data: ExhibitData
  onSelect: (exhibit: ExhibitData) => void
  /** Disabled during camera transitions and while already inspecting an exhibit. */
  interactive?: boolean
  plinthColor: string
}

/**
 * A clickable museum exhibit: a plinth plus a GLB model (or fallback sculpture).
 * Hover and click are the only two interactions it needs to support —
 * everything else (camera focus, info panel) is driven by the parent
 * through `onSelect`.
 */
export function Exhibit({ data, onSelect, interactive = true, plinthColor }: ExhibitProps) {
  const { state } = useMuseumState()
  const invalidate = useThree((s) => s.invalidate)
  const quality = useGraphicsQualityContext()
  const isCurrentRoom = state.activeRoom === data.civilization
  const [keepModel, setKeepModel] = useState(isCurrentRoom)
  // During departure keep the old exhibit visible until the corridor passage
  // finishes; afterwards its heavy model can be unmounted to free GPU work.
  useEffect(() => {
    if (isCurrentRoom) setKeepModel(true)
    else if (!state.isTransitioning) setKeepModel(false)
  }, [isCurrentRoom, state.isTransitioning])
  const showModel = isCurrentRoom || keepModel
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const plinthMaterial = data.civilization === 'egypt' ? museumStone('sandstone') : darkMarble
  const capMaterial = museumStone(data.civilization === 'egypt' ? 'travertine' : 'ivory')
  void plinthColor

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    const targetScale = (data.scale ?? 1) * (hovered && interactive ? 1.025 : 1)
    const next = THREE.MathUtils.damp(group.scale.x, targetScale, 7, delta)
    group.scale.setScalar(next)
    if (Math.abs(next - targetScale) > 0.0005) invalidate()
  })

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation()
    if (!interactive) return
    onSelect(data)
  }

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    if (!interactive) return
    setHovered(true)
    invalidate()
    document.body.style.cursor = 'pointer'
  }

  function handlePointerOut(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    setHovered(false)
    invalidate()
    document.body.style.cursor = 'auto'
  }

  // If this exhibit stops being interactive mid-hover (a transition starts)
  // or unmounts while hovered, make sure the pointer cursor doesn't stay
  // stuck on 'pointer'.
  useEffect(() => {
    if (interactive) return
    setHovered(false)
    invalidate()
    document.body.style.cursor = 'auto'
  }, [interactive, invalidate])

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  const plinthHeight = 1.05
  const hitHeight = (data.asset?.targetHeight ?? 3.2) * (data.scale ?? 1)

  return (
    <group position={[data.position[0], 0, data.position[2]]}>
      <mesh
        geometry={surfaceCylinder(0.89*0.87,0.96*0.87,plinthHeight,48)}
        material={plinthMaterial}
        position={[0, plinthHeight / 2, 0]}
        castShadow
        receiveShadow
      />
      <mesh geometry={surfaceCylinder(1.06*0.89,0.98*0.89,0.14,48)} material={capMaterial} position={[0,plinthHeight+0.055,0]} receiveShadow castShadow />
      <mesh position={[0,0.18,0.86]} material={museumBronze}>
        <boxGeometry args={[0.76,0.18,0.024]}/>
      </mesh>
      <group
        ref={groupRef}
        position={[0, plinthHeight, 0]}
        rotation={data.rotation ?? [0, 0, 0]}
      >
        {data.asset && showModel ? (
          <ModelErrorBoundary key={modelUrl(data.asset, quality)} fallback={<ExhibitPlaceholder kind={data.placeholder} hovered={hovered && interactive} />}>
            <Suspense fallback={<ExhibitPlaceholder kind={data.placeholder} hovered={false} />}>
              <ExhibitModel asset={data.asset} />
            </Suspense>
          </ModelErrorBoundary>
        ) : (
          <ExhibitPlaceholder kind={data.placeholder} hovered={hovered && interactive} />
        )}
      </group>
      {/* Pick a cheap proxy, never hundreds of thousands of scan triangles.
          In inspection mode OrbitControls owns the pointer; no picking is needed. */}
      {interactive && <mesh name="exhibit-hit-target"
        position={[0, plinthHeight + hitHeight / 2, 0]}
        onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <boxGeometry args={[1.9, hitHeight, 1.6]} />
        <meshBasicMaterial visible={false} />
      </mesh>}
    </group>
  )
}
