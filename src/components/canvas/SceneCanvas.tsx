import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Suspense, type ReactNode } from 'react'
import { CameraRig } from '../../systems/camera/CameraRig'
import { Lighting } from './Lighting'
import type { GraphicsQuality } from '../../hooks/useGraphicsQuality'
import { GRAPHICS } from '../../graphics'
import { RenderDiagnostics } from './RenderDiagnostics'

export interface SceneCanvasProps {
  children: ReactNode
  quality: GraphicsQuality
  onReady?: () => void
}

/**
 * Rendering on demand keeps an idle museum from redrawing 60 times a second.
 * Camera tweens and orbit interaction explicitly invalidate the canvas.
 */
export function SceneCanvas({ children, quality, onReady }: SceneCanvasProps) {
  const dpr = Math.min(window.devicePixelRatio || 1, GRAPHICS[quality].dpr)
  return <div className="museum-viewport"><Canvas
    frameloop="demand"
    shadows={quality !== 'eco'}
    fallback={<div className="webgl-fallback" role="alert"><h2>3D viewing unavailable</h2><p>Your browser could not start WebGL. Try updating your graphics drivers or enabling hardware acceleration.</p><button onClick={() => window.location.reload()}>Try again</button></div>}
    dpr={dpr}
    gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
    onCreated={({ gl }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping
      gl.toneMappingExposure = 1
      gl.outputColorSpace = THREE.SRGBColorSpace
      onReady?.()
    }}
  >
    <color attach="background" args={['#c8beb0']} />
    <fog attach="fog" args={['#b7aea1', 42, 100]} />
    <CameraRig />
    <Lighting quality={quality} />
    <RenderDiagnostics quality={quality} />
    <Suspense fallback={null}>{children}</Suspense>
  </Canvas></div>
}
