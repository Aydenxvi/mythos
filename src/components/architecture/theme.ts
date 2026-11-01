export interface SurfaceTheme {
  floor: string
  column: string
  wall: string
  trim: string
  /** Tint used for this space's accent light. */
  accentLight: string
}

/** One palette per space, built from the project's temporary design tokens. */
export const THEMES: Record<'atrium' | 'greece' | 'rome' | 'egypt', SurfaceTheme> = {
  atrium: {
    floor: '#cfc3a9',
    column: '#f2eee6',
    wall: '#e8ddc6',
    trim: '#a88d66',
    accentLight: '#ffe9c2',
  },
  greece: {
    floor: '#ece3d0',
    column: '#f7f3ea',
    wall: '#ece1c8',
    trim: '#cdbfa0',
    accentLight: '#fff6e0',
  },
  rome: {
    floor: '#c9a876',
    column: '#d8c8ae',
    wall: '#bf9b68',
    trim: '#8a5a34',
    accentLight: '#ffcf8f',
  },
  egypt: {
    floor: '#b39a76',
    column: '#bfa47b',
    wall: '#a58a63',
    trim: '#705a3c',
    accentLight: '#ffe0a5',
  },
}
