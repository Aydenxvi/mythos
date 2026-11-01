import type { ExhibitData } from '../types/museum'
import { ROOMS } from './world'

// Vite BASE_URL makes asset URLs work in a GitHub Pages repository subpath too.
const MODEL_BASE = import.meta.env.BASE_URL

/**
 * Three sample exhibits, one per civilization. Positions are derived from
 * each room's layout in `world.ts` so the exhibit always sits correctly on
 * its room's central plinth regardless of where that room is placed.
 */

const DEFAULT_ORBIT_LIMITS = {
  minDistance: 4.0,
  maxDistance: 6.6,
  minPolarAngle: Math.PI * 0.29,
  maxPolarAngle: Math.PI * 0.52,
}

/**
 * Rotation (radians, Y axis) that turns an exhibit to face back toward the
 * room's entrance — the direction visitors approach from. Mirrors the sign
 * convention in `RoomShell`: THREE's `rotateY` and this file's `forwardXZ`-
 * style angles sweep opposite ways, so facing the entrance (`-forward`)
 * works out to `-entranceAngle`, not a fixed value. A single fixed rotation
 * only looks right by coincidence for a near-symmetric placeholder (Athena,
 * Jupiter) and visibly turns an asymmetric one (Anubis) away from the camera.
 */
function facingEntrance(civ: 'greece' | 'rome' | 'egypt'): number {
  return -ROOMS[civ].entranceAngle
}

function exhibitFocusFromRoom(civ: 'greece' | 'rome' | 'egypt', exhibitY: number) {
  const room = ROOMS[civ]
  const [tx, , tz] = room.roomCamera.target
  const angle = room.entranceAngle
  // Pull the camera back toward the atrium along the room's axis, and raise it slightly.
  const back = 5.4
  const px = tx - Math.sin(angle) * back
  const pz = tz + Math.cos(angle) * back
  return {
    position: [px, exhibitY + 1.85, pz] as [number, number, number],
    target: [tx, exhibitY + 1.1, tz] as [number, number, number],
    fov: 48,
  }
}

export const EXHIBITS: Record<string, ExhibitData> = {
  athena: {
    id: 'athena',
    title: 'Athena',
    civilization: 'greece',
    description:
      'Athena represents wisdom, craft and strategic skill in the Greek mythological imagination.',
    metadata: {
      period: 'Object: Roman, c. 100–200 CE; subject: Greek Athena',
      origin: 'Roman sculpture, Fitzwilliam Museum, Cambridge',
      material: 'Roman marble statue · photogrammetric 3D scan',
      note: 'Newton Hall (Walston) Athena, Roman period (c. 100–200 CE), depicting the Greek goddess. Fitzwilliam Museum, GR.1.2006. The web mesh is simplified; texture quality follows the selected graphics mode; credit and source in 3D Model Credit.',
    },
    placeholder: 'column-figure',
    asset: {
      url: `${MODEL_BASE}models/athena-balanced.glb`, highUrl: `${MODEL_BASE}models/athena-high.glb`, liteUrl: `${MODEL_BASE}models/athena-walston-lite.glb`, targetHeight: 3.2,
      rotation: [0, 0, 0], // Supplied scan faces +Z. Room rotation already faces the entrance.
      attribution: {
        artist: 'Fitzwilliam Museum', title: 'Newton Hall (Walston) Athena',
        sourceUrl: 'https://sketchfab.com/3d-models/newton-hall-walston-athena-95a8422dc20348539503dc7b68d72aa7',
        license: 'CC BY 4.0',
        note: 'Roman marble statue, c. 100–200 CE. Simplified web mesh; ECO/BALANCED textures resized, HIGH retains the original 4K texture.',
      },
    },
    position: [ROOMS.greece.roomCamera.target[0], 1.15, ROOMS.greece.roomCamera.target[2]],
    rotation: [0, facingEntrance('greece'), 0],
    scale: 1,
    cameraFocus: exhibitFocusFromRoom('greece', 1.3),
    orbitLimits: DEFAULT_ORBIT_LIMITS,
  },
  jupiter: {
    id: 'jupiter',
    title: 'Jupiter',
    civilization: 'rome',
    description:
      'Jupiter embodies the Roman sky, the authority of oaths, and public divine protection.',
    metadata: {
      period: 'Roman religious tradition (thematic reference)',
      origin: 'Rome',
      material: 'Modern 3D depiction of the Greek Zeus, used here to illustrate the Roman Jupiter',
      note: 'The displayed modern 3D statue depicts Greek Zeus, a deity closely associated with but not identical to Roman Jupiter. This is not a scan of a historical Roman Jupiter sculpture.',
    },
    placeholder: 'seated-figure',
    asset: {
      url: `${MODEL_BASE}models/zeus-optimized.glb`, liteUrl: `${MODEL_BASE}models/zeus-lite.glb`, targetHeight: 3.05,
      rotation: [0, -Math.PI / 2, 0],
      attribution: {
        artist: 'LZ Creation', title: 'Zeus',
        sourceUrl: 'https://sketchfab.com/3d-models/zeus-782f99eadca041b8b52d9e0a2c6f4e3f',
        license: 'CC BY 4.0',
        note: 'Modern Zeus model used as a comparative visual illustration of Jupiter. Mesh simplified, textures resized.',
      },
    },
    position: [ROOMS.rome.roomCamera.target[0], 1.0, ROOMS.rome.roomCamera.target[2]],
    rotation: [0, facingEntrance('rome'), 0],
    scale: 1.1,
    cameraFocus: exhibitFocusFromRoom('rome', 1.35),
    orbitLimits: DEFAULT_ORBIT_LIMITS,
  },
  anubis: {
    id: 'anubis',
    title: 'Anubis',
    civilization: 'egypt',
    description:
      'Anubis is associated with burial protection, embalming and the journey beyond death.',
    metadata: {
      period: 'Ancient Egyptian funerary tradition (thematic reference)',
      origin: 'Egypt',
      material: 'Contemporary digital Anubis bust · textured 3D artwork',
      note: 'This 3D artwork by lucasthx88 is a modern interpretation of Anubis, not an excavated ancient Egyptian object. ECO textures are reduced; BALANCED/HIGH retain the supplied original maps.',
    },
    placeholder: 'canine-guardian',
    asset: {
      url: `${MODEL_BASE}models/anubis-detail.glb`, liteUrl: `${MODEL_BASE}models/anubis-optimized.glb`, targetHeight: 2.9,
      attribution: {
        artist: 'lucasthx88', title: 'Anubis Bust',
        sourceUrl: 'https://sketchfab.com/3d-models/anubis-bust-636c098547e24805a796cca1773aa9bb',
        license: 'CC BY 4.0',
        note: 'Modern original 3D artwork. Original maps in BALANCED/HIGH; reduced textures in ECO.',
      },
    },
    position: [ROOMS.egypt.roomCamera.target[0], 1.2, ROOMS.egypt.roomCamera.target[2]],
    rotation: [0, facingEntrance('egypt'), 0],
    scale: 1,
    cameraFocus: exhibitFocusFromRoom('egypt', 1.4),
    orbitLimits: DEFAULT_ORBIT_LIMITS,
  },
}

export function getExhibit(id: string): ExhibitData | undefined {
  return EXHIBITS[id]
}

export function getExhibitsForRoom(civ: 'greece' | 'rome' | 'egypt'): ExhibitData[] {
  return ROOMS[civ].exhibitIds.map((id) => EXHIBITS[id]).filter(Boolean)
}
