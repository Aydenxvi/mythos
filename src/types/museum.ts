/**
 * Core typed vocabulary for the MYTHOS museum.
 *
 * Content (data/*.ts) is described entirely through these types so that
 * rendering, navigation, and camera systems never need to know about a
 * specific room or exhibit by name — they just consume this shape.
 */

/** The three civilizations represented in Phase 1. */
export type Civilization = 'greece' | 'rome' | 'egypt'

/** Every space a visitor can stand in. */
export type LocationId = 'atrium' | Civilization

/** The finite set of states the whole experience can be in. */
export type AppState =
  | 'WELCOME'
  | 'ATRIUM'
  | 'GREECE'
  | 'ROME'
  | 'EGYPT'
  | 'EXHIBIT_VIEW'

/** A 3-tuple used for Three.js positions, rotations (Euler, radians) and scales. */
export type Vec3 = [number, number, number]

/** Position + look-at target the camera system can animate to. */
export interface CameraPose {
  position: Vec3
  target: Vec3
  /** Optional field of view override for this pose. */
  fov?: number
}

/** Orbit limits applied while a visitor is inspecting an exhibit. */
export interface OrbitLimits {
  minDistance: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
}

/**
 * Placeholder geometry description used when no real asset is supplied.
 * Kept deliberately simple — these read as intentional museum-style
 * plinths/forms rather than an attempt to fake a real artifact.
 */
export type PlaceholderKind = 'column-figure' | 'seated-figure' | 'canine-guardian' | 'stele'

/** Source credit remains visible in the museum and in ASSET_CREDITS.md. */
export interface ModelAttribution {
  artist: string
  title: string
  sourceUrl: string
  license: string
  note: string
}

/** GLB/GLTF asset configuration with stable size and position. */
export interface ModelAsset {
  /** Path to a .glb/.gltf file, relative to /public. */
  url: string
  /** Lower-poly, smaller-texture asset loaded in ECO mode. */
  liteUrl?: string
  /** Optional detailed tier. BALANCED uses url; HIGH falls back to url. */
  highUrl?: string
  scale?: Vec3
  rotation?: Vec3
  /** Normalize arbitrary GLBs to the same display height and center them on the plinth. */
  targetHeight?: number
  attribution?: ModelAttribution
}

/** Non-essential historical/contextual metadata — intentionally loose for future expansion. */
export interface ExhibitMetadata {
  period?: string
  origin?: string
  material?: string
  /** Free-form attribution/source note. No authenticity claims are made by Phase 1 content. */
  note?: string
}

export interface ExhibitData {
  id: string
  title: string
  civilization: Civilization
  /** One or two sentence curatorial blurb. */
  description: string
  metadata?: ExhibitMetadata
  /** Placeholder sculptural form used until a real model is supplied. */
  placeholder: PlaceholderKind
  /** Study GLB or future licensed museum asset, with placeholder fallback on failure. */
  asset?: ModelAsset
  position: Vec3
  rotation?: Vec3
  scale?: number
  /** Camera pose used when this exhibit is selected for inspection. */
  cameraFocus: CameraPose
  /** Orbit limits while inspecting this exhibit. */
  orbitLimits?: OrbitLimits
}

/** A waypoint the camera passes through while moving between two spaces, so it never clips through architecture. */
export interface CameraWaypoint {
  position: Vec3
  target: Vec3
}

export interface RoomData {
  id: Civilization
  name: string
  subtitle: string
  /** Short description shown in navigation / headers. */
  description: string
  /** Camera pose when a visitor is standing in this room. */
  roomCamera: CameraPose
  /** Waypoint(s) the camera travels through between the atrium and this room. */
  passageWaypoints: CameraWaypoint[]
  /** World-space position of this room's group, and the direction (radians, around Y) its passage faces from the atrium. */
  worldPosition: Vec3
  entranceAngle: number
  exhibitIds: string[]
  /** The corridor connecting this room to the atrium — geometry reads this to fill the space continuously, with no gap. */
  passage: {
    /** World-space center point of the passage's midpoint, for placing its geometry. */
    center: Vec3
    /** Length (world units) of the passage along its axis, from the atrium wall to the room's entrance. */
    length: number
  }
}

export interface AtriumData {
  camera: CameraPose
  welcomeCamera: CameraPose
}
