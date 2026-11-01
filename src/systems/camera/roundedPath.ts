import * as THREE from 'three'
import type { CameraPose, Vec3 } from '../../types/museum'

/** Round only short sections near turning points so the camera stays within passages.
 * Straight corridor segments remain straight; corners no longer stop or snap.
 * A maximum 0.42-unit inset avoids cutting through arch jambs.
 */
export function roundCameraPath(poses: CameraPose[]): CameraPose[] {
  if (poses.length < 3) return poses
  const output: CameraPose[] = [poses[0]]
  const mix = (a: Vec3, b: Vec3, t: number): Vec3 => [
    THREE.MathUtils.lerp(a[0], b[0], t),
    THREE.MathUtils.lerp(a[1], b[1], t),
    THREE.MathUtils.lerp(a[2], b[2], t),
  ]
  for (let i = 1; i < poses.length - 1; i++) {
    const prev = poses[i - 1], mid = poses[i], next = poses[i + 1]
    const before = new THREE.Vector3(...prev.position).distanceTo(new THREE.Vector3(...mid.position))
    const after = new THREE.Vector3(...mid.position).distanceTo(new THREE.Vector3(...next.position))
    if (before < 0.05 || after < 0.05) { output.push(mid); continue }
    const inset = Math.min(0.42, before * 0.16, after * 0.16)
    const enterT = inset / before
    const exitT = inset / after
    const entry: CameraPose = { position: mix(mid.position, prev.position, enterT),
      target: mix(mid.target, prev.target, enterT), fov: THREE.MathUtils.lerp(mid.fov ?? 50, prev.fov ?? 50, enterT) }
    const exit: CameraPose = { position: mix(mid.position, next.position, exitT),
      target: mix(mid.target, next.target, exitT), fov: THREE.MathUtils.lerp(mid.fov ?? 50, next.fov ?? 50, exitT) }
    output.push(entry)
    for (let step = 1; step <= 5; step++) {
      const t = step / 5, a = (1 - t) ** 2, b = 2 * (1 - t) * t, c = t ** 2
      const quadratic = (left: Vec3, center: Vec3, right: Vec3): Vec3 => [
        a * left[0] + b * center[0] + c * right[0],
        a * left[1] + b * center[1] + c * right[1],
        a * left[2] + b * center[2] + c * right[2],
      ]
      output.push({ position: quadratic(entry.position, mid.position, exit.position),
        target: quadratic(entry.target, mid.target, exit.target),
        fov: a * (entry.fov ?? 50) + b * (mid.fov ?? 50) + c * (exit.fov ?? 50) })
    }
  }
  output.push(poses[poses.length - 1])
  return output
}
