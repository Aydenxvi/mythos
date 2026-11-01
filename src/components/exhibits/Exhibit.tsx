import { Suspense, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useMuseumState } from '../../app/AppStateContext'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { ExhibitPlaceholder } from './ExhibitPlaceholder'
import { ExhibitModel } from './ExhibitModel'
import { ModelErrorBoundary } from './ModelErrorBoundary'
import { geometries } from '../architecture/geometryCache'
import { museumStone, museumBronze } from '../architecture/museumMaterials'
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
  const plinthMaterial = museumStone(data.civilization === 'egypt' ? 'sandstone' : 'ivory')
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

  return (
    <group position={[data.position[0], 0, data.position[2]]}>
      <mesh
        geometry={geometries.pedestal}
        material={plinthMaterial}
        scale={[0.87, plinthHeight, 0.87]}
        position={[0, plinthHeight / 2, 0]}
        castShadow
        receiveShadow
      />
      <mesh geometry={geometries.pedestalCap} material={plinthMaterial} position={[0,plinthHeight+0.055,0]} scale={[0.89,1,0.89]} receiveShadow castShadow />
      <mesh position={[0,0.18,0.86]} material={museumBronze}>
        <boxGeometry args={[0.76,0.18,0.024]}/>
      </mesh>
      <group
        ref={groupRef}
        position={[0, plinthHeight, 0]}
        rotation={data.rotation ?? [0, 0, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
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
    </group>
  )
}
