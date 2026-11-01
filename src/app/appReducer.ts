import type { AppState, Civilization, LocationId } from '../types/museum'

export interface MuseumState {
  appState: AppState
  activeLocation: LocationId
  /** The room an inspected exhibit belongs to, so "return" knows where to go. */
  activeRoom: Civilization | null
  selectedExhibitId: string | null
  isTransitioning: boolean
  /** True once the visitor has entered the museum at least once, used to gate the welcome overlay only. */
  hasEntered: boolean
}

export const initialMuseumState: MuseumState = {
  appState: 'WELCOME',
  activeLocation: 'atrium',
  activeRoom: null,
  selectedExhibitId: null,
  isTransitioning: false,
  hasEntered: false,
}

export type MuseumAction =
  | { type: 'ENTER_MUSEUM' }
  | { type: 'GO_TO_ROOM'; room: Civilization }
  | { type: 'RETURN_TO_ATRIUM' }
  | { type: 'SELECT_EXHIBIT'; exhibitId: string; room: Civilization }
  | { type: 'RETURN_TO_ROOM' }
  | { type: 'SET_TRANSITIONING'; value: boolean }

export function museumReducer(state: MuseumState, action: MuseumAction): MuseumState {
  switch (action.type) {
    case 'ENTER_MUSEUM':
      if (state.appState !== 'WELCOME') return state
      return {
        ...state,
        appState: 'ATRIUM',
        activeLocation: 'atrium',
        hasEntered: true,
        isTransitioning: true,
      }

    case 'GO_TO_ROOM':
      if (state.appState === 'WELCOME' || state.isTransitioning || (state.activeLocation === action.room && state.appState === action.room.toUpperCase())) return state
      return {
        ...state,
        appState: action.room.toUpperCase() as AppState,
        activeLocation: action.room,
        activeRoom: action.room,
        selectedExhibitId: null,
        isTransitioning: true,
      }

    case 'RETURN_TO_ATRIUM':
      if (state.isTransitioning || state.appState === 'ATRIUM') return state
      return {
        ...state,
        appState: 'ATRIUM',
        activeLocation: 'atrium',
        activeRoom: null,
        selectedExhibitId: null,
        isTransitioning: true,
      }

    case 'SELECT_EXHIBIT':
      if (state.isTransitioning || state.activeRoom !== action.room ||
          state.appState !== action.room.toUpperCase()) return state
      return {
        ...state,
        appState: 'EXHIBIT_VIEW',
        activeRoom: action.room,
        selectedExhibitId: action.exhibitId,
        isTransitioning: true,
      }

    case 'RETURN_TO_ROOM':
      if (state.isTransitioning || !state.activeRoom) return state
      return {
        ...state,
        appState: state.activeRoom.toUpperCase() as AppState,
        activeLocation: state.activeRoom,
        selectedExhibitId: null,
        isTransitioning: true,
      }

    case 'SET_TRANSITIONING':
      return { ...state, isTransitioning: action.value }

    default:
      return state
  }
}
