/**
 * Small shared trig helpers so every room's local layout (built inside a
 * rotated group) stays consistent with the absolute world coordinates used
 * by the camera and exhibit data in `data/world.ts` and `data/exhibits.ts`.
 */

/** World-space (x, z) direction pointing away from the atrium along `angle`. */
export function forwardXZ(angle: number): [number, number] {
  return [Math.sin(angle), -Math.cos(angle)]
}

/** World-space (x, z) direction to the right of someone facing `forwardXZ(angle)`. */
export function rightXZ(angle: number): [number, number] {
  return [Math.cos(angle), Math.sin(angle)]
}
