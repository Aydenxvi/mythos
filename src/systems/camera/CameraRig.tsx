import { useEffect, useRef, type ElementRef } from 'react'
import { useThree } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useMuseumState } from '../../app/AppStateContext'
import { ATRIUM, ROOMS } from '../../data/world'
import { getExhibit } from '../../data/exhibits'
import { buildTransitionPath } from './cameraPath'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useMotionMode } from '../../hooks/MotionPreference'
import { roundCameraPath } from './roundedPath'
import type { AppState, CameraPose } from '../../types/museum'

const DEFAULT_ORBIT_LIMITS = {
  minDistance: 3.4,
  maxDistance: 7.4,
  minPolarAngle: Math.PI * 0.23,
  maxPolarAngle: Math.PI * 0.59,
}

/**
 * One continuous GSAP tween per journey, rather than easing to a stop at EACH
 * waypoint. Waypoints still constrain the camera to the doors and corridors.
 * The total duration is capped so even Greece -> Egypt cannot take 10 seconds.
 * Render invalidation is explicit: static rooms don't require a 60fps WebGL loop.
 */
export function CameraRig() {
  const { state, dispatch } = useMuseumState()
  const invalidate = useThree((s) => s.invalidate)
  const reducedMotion = useReducedMotion()
  const motionMode = useMotionMode()
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null)
  const animationRef = useRef<gsap.core.Tween | null>(null)
  const previousStateRef = useRef<AppState | null>(null)
  const previousExhibitRef = useRef<string | null>(null)
  const lastOrbitTargetRef = useRef(new THREE.Vector3(...ATRIUM.welcomeCamera.target))

  const currentTargetRef = useRef(new THREE.Vector3(...ATRIUM.welcomeCamera.target))

  useEffect(() => {
    const camera = cameraRef.current
    if (!camera) return
    const previous = previousStateRef.current

    if (previous === null) {
      camera.position.set(...ATRIUM.welcomeCamera.position)
      currentTargetRef.current.set(...ATRIUM.welcomeCamera.target)
      camera.lookAt(currentTargetRef.current)
      camera.fov = ATRIUM.welcomeCamera.fov ?? 50
      camera.updateProjectionMatrix()
      previousStateRef.current = state.appState
      previousExhibitRef.current = state.selectedExhibitId
      invalidate()
      return
    }

    if (previous === state.appState && previousExhibitRef.current === state.selectedExhibitId) {
      // INSTANT is also a way to finish an already-running journey.
      if ((reducedMotion || motionMode === 'instant') && animationRef.current) {
        const animation = animationRef.current
        animation.progress(1)
        animation.kill()
      }
      return
    }

    animationRef.current?.kill()

    // OrbitControls changed the *real* camera. Do not reuse the pre-orbit pose.
    const from: CameraPose = {
      position: camera.position.toArray() as [number, number, number],
      target: (previous === 'EXHIBIT_VIEW'
        ? lastOrbitTargetRef.current
        : currentTargetRef.current).toArray() as [number, number, number],
      fov: camera.fov,
    }
    const destinations = buildTransitionPath(previous, state.appState, state.selectedExhibitId, previousExhibitRef.current)
    previousStateRef.current = state.appState
    previousExhibitRef.current = state.selectedExhibitId

    if (!destinations.length) {
      dispatch({ type: 'SET_TRANSITIONING', value: false })
      return
    }

    const points = roundCameraPath([from, ...destinations])
    // Cache vectors *once per route*. Allocating new Vector3 objects on every
    // animation frame causes needless garbage collection during camera travel.
    const positions = points.map(p => new THREE.Vector3(...p.position))
    const targets = points.map(p => new THREE.Vector3(...p.target))
    const fovs = points.map((p, i) => p.fov ?? (i ? points[i - 1].fov ?? camera.fov : camera.fov))
    const lengths: number[] = []
    let totalLength = 0
    for (let i = 0; i < points.length - 1; i++) {
      totalLength += Math.max(0.000001, positions[i].distanceTo(positions[i + 1]))
      lengths.push(totalLength)
    }

    const position = new THREE.Vector3()
    const target = new THREE.Vector3()
    const setPose = (progress: number) => {
      const distance = THREE.MathUtils.clamp(progress, 0, 1) * totalLength
      const index = lengths.findIndex(end => distance <= end)
      const i = index < 0 ? lengths.length - 1 : index
      const startDistance = i === 0 ? 0 : lengths[i - 1]
      const segmentLength = lengths[i] - startDistance
      const fraction = segmentLength > 0 ? THREE.MathUtils.clamp((distance - startDistance) / segmentLength, 0, 1) : 1
      position.copy(positions[i]).lerp(positions[i + 1], fraction)
      target.copy(targets[i]).lerp(targets[i + 1], fraction)
      camera.position.copy(position)
      currentTargetRef.current.copy(target)
      camera.lookAt(target)
      const fov = THREE.MathUtils.lerp(fovs[i], fovs[i + 1], fraction)
      if (Math.abs(camera.fov - fov) > 0.005) {
        camera.fov = fov
        camera.updateProjectionMatrix()
      }
      invalidate()
    }

    if (reducedMotion || motionMode === 'instant') {
      setPose(1)
      dispatch({ type: 'SET_TRANSITIONING', value: false })
      return
    }

    // Expressive but quick: 0.9 s to inspect, up to 3.7 s across the whole museum.
    const duration = state.appState === 'EXHIBIT_VIEW' || (previous === 'EXHIBIT_VIEW' && destinations.length === 1)
      ? 0.85
      : previous === 'WELCOME'
        ? 2.05
        : Math.min(3.7, Math.max(1.25, 0.9 + totalLength / 18))
    const progress = { value: 0 }
    animationRef.current = gsap.to(progress, {
      value: 1,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => setPose(progress.value),
      onComplete: () => {
        setPose(1)
        animationRef.current = null
        dispatch({ type: 'SET_TRANSITIONING', value: false })
      },
    })
  }, [state.appState, state.selectedExhibitId, reducedMotion, motionMode, invalidate, dispatch])

  useEffect(() => () => { animationRef.current?.kill() }, [])

  // The Drei control is only mounted after its target is focused. Setting its
  // target as a prop prevents the default (0,0,0) from causing a one-frame jump.
  const orbitActive = state.appState === 'EXHIBIT_VIEW' && !state.isTransitioning
  const exhibit = state.selectedExhibitId ? getExhibit(state.selectedExhibitId) : undefined
  const limits = exhibit?.orbitLimits ?? DEFAULT_ORBIT_LIMITS
  const orbitTarget = exhibit?.cameraFocus.target

  useEffect(() => {
    if (!orbitActive || !orbitTarget) return
    lastOrbitTargetRef.current.set(...orbitTarget)
    if (controlsRef.current) {
      controlsRef.current.target.set(...orbitTarget)
      controlsRef.current.update()
      invalidate()
    }
  }, [orbitActive, orbitTarget, invalidate])

  return <>
    <PerspectiveCamera ref={cameraRef} makeDefault position={ATRIUM.welcomeCamera.position}
      fov={ATRIUM.welcomeCamera.fov} near={0.1} far={140} />
    {orbitActive && exhibit && <OrbitControls
      ref={controlsRef}
      target={orbitTarget}
      enablePan={false}
      enableDamping
      dampingFactor={0.095}
      rotateSpeed={0.72}
      zoomSpeed={0.95}
      minDistance={limits.minDistance}
      maxDistance={limits.maxDistance}
      minAzimuthAngle={-ROOMS[exhibit.civilization].entranceAngle - 0.68}
      maxAzimuthAngle={-ROOMS[exhibit.civilization].entranceAngle + 0.68}
      minPolarAngle={limits.minPolarAngle}
      maxPolarAngle={limits.maxPolarAngle}
      onChange={() => {
        if (controlsRef.current) lastOrbitTargetRef.current.copy(controlsRef.current.target)
        invalidate()
      }}
    />}
  </>
}
