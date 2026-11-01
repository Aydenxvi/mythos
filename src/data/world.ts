import type { AtriumData, Civilization, RoomData, Vec3 } from '../types/museum'

/**
 * Single source of truth for the museum's spatial layout.
 *
 * The atrium sits at the world origin. Three passages radiate across the rear semicircle, visible
 * together from the establishing camera. Changing a room's `entranceAngle` or
 * distance here is enough to relocate it — nothing in the rendering or
 * camera code hard-codes a direction.
 */

const ATRIUM_RADIUS = 11
const PASSAGE_LENGTH = 9
const ROOM_DEPTH = 13
const ROOM_WIDTH = 9
/** Corridor width — narrower than a room, wide enough to clear the camera's passage waypoint with margin. */
const PASSAGE_WIDTH = 4.4

/** Angle (radians, measured from +Z) for each wing's passage out of the atrium. */
const ANGLES: Record<Civilization, number> = {
  greece: 0,
  rome: -0.87,
  egypt: 0.87,
}

export function polarToWorld(angle: number, distance: number): Vec3 {
  return [Math.sin(angle) * distance, 0, -Math.cos(angle) * distance]
}

function buildRoom(
  id: Civilization,
  name: string,
  subtitle: string,
  description: string,
  exhibitIds: string[],
): RoomData {
  const angle = ANGLES[id]
  // Where the passage opens into the room's interior.
  const entryDistance = ATRIUM_RADIUS + PASSAGE_LENGTH
  // A waypoint partway down the passage, so the camera travels through the archway.
  const thresholdDistance = ATRIUM_RADIUS + PASSAGE_LENGTH * 0.55
  // The exhibit sits toward the back of the room, well clear of the back wall at entryDistance + ROOM_DEPTH.
  const exhibitDistance = entryDistance + ROOM_DEPTH * 0.62
  // The room camera stands just inside the entrance, looking down the room toward the exhibit.
  const roomCameraDistance = entryDistance + ROOM_DEPTH * 0.18

  const threshold = polarToWorld(angle, thresholdDistance)
  const roomCameraPos = polarToWorld(angle, roomCameraDistance)
  const roomTarget = polarToWorld(angle, exhibitDistance)
  // The passage fills the gap between the atrium wall and the room's entrance exactly —
  // its midpoint distance is the mean of the two, its length the full gap between them.
  const passageCenterDistance = (ATRIUM_RADIUS + entryDistance) / 2

  return {
    id,
    name,
    subtitle,
    description,
    worldPosition: polarToWorld(angle, entryDistance + ROOM_DEPTH / 2),
    entranceAngle: angle,
    exhibitIds,
    roomCamera: {
      position: [roomCameraPos[0], 3.1, roomCameraPos[2]],
      target: [roomTarget[0], 2.0, roomTarget[2]],
      fov: 46,
    },
    passageWaypoints: [
      {
        position: [threshold[0], 3.2, threshold[2]],
        target: [roomTarget[0], 2.0, roomTarget[2]],
      },
    ],
    passage: {
      center: polarToWorld(angle, passageCenterDistance),
      length: PASSAGE_LENGTH,
    },
  }
}

export const ROOMS: Record<Civilization, RoomData> = {
  greece: buildRoom(
    'greece',
    'Greece',
    'Light & Reason',
    'Marble halls of the Hellenic world — bright, harmonious, and open to the sky.',
    ['athena'],
  ),
  rome: buildRoom(
    'rome',
    'Rome',
    'Order & Empire',
    'Travertine and monumental arches — the warm, civic grandeur of the Republic and Empire.',
    ['jupiter'],
  ),
  egypt: buildRoom(
    'egypt',
    'Egypt',
    'The Eternal Kingdom',
    'Sandstone and shadow — heavy columns and the long memory of the Nile.',
    ['anubis'],
  ),
}

export const ROOM_ORDER: Civilization[] = ['greece', 'rome', 'egypt']

export const ATRIUM: AtriumData = {
  camera: {
    position: [0, 4.0, 7.8],
    target: [0, 3.0, -4.6],
    fov: 55,
  },
  welcomeCamera: {
    position: [0, 4.6, 17.4],
    target: [0, 4.0, -1.0],
    fov: 57,
  },
}

export const ATRIUM_RADIUS_EXPORT = ATRIUM_RADIUS
export const PASSAGE_LENGTH_EXPORT = PASSAGE_LENGTH
export const ROOM_DEPTH_EXPORT = ROOM_DEPTH
export const ROOM_WIDTH_EXPORT = ROOM_WIDTH
export const PASSAGE_WIDTH_EXPORT = PASSAGE_WIDTH
