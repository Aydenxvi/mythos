import { Suspense, lazy, useEffect, useRef } from 'react'
import { Atrium } from '../scenes/Atrium/Atrium'
import { Passage } from '../components/architecture/Passage'
import { useMuseumState } from './AppStateContext'
import { ROOM_ORDER } from '../data/world'
import type { Civilization, ExhibitData } from '../types/museum'
import { museumStone } from '../components/architecture/museumMaterials'
import { wallMaterial } from '../components/architecture/surfaceMaterials'

const GreeceRoom = lazy(() => import('../scenes/Greece/GreeceRoom').then((m) => ({ default: m.GreeceRoom })))
const RomeRoom = lazy(() => import('../scenes/Rome/RomeRoom').then((m) => ({ default: m.RomeRoom })))
const EgyptRoom = lazy(() => import('../scenes/Egypt/EgyptRoom').then((m) => ({ default: m.EgyptRoom })))

/**
 * The full 3D world, mounted once: the atrium hub plus all three wings,
 * laid out in continuous space (see `data/world.ts`) so navigation reads
 * as real movement through one building rather than scene swaps.
 *
 * Each wing's code is fetched when needed. Its gallery remains mounted
 * until the camera has left the room, then is hidden. Architecture is retained to avoid disposing shared
 * geometry and compiling it again on every return. Heavy models still unmount. Separate Suspense boundaries preserve the other rooms while
 * destination models finish loading.
 * Each room only accepts exhibit clicks while it is the visitor's current
 * location and the camera isn't mid-transition.
 */
export function MuseumWorld() {
  const { state, dispatch } = useMuseumState()
  useEffect(() => {
    // Fetch local wall maps and room code during idle time, before first travel.
    const warm = () => {
      for (const kind of ['ivory', 'travertine', 'sandstone', 'limestone'] as const) {
        museumStone(kind)
        wallMaterial(kind)
      }
      void import('../scenes/Greece/GreeceRoom')
      void import('../scenes/Rome/RomeRoom')
      void import('../scenes/Egypt/EgyptRoom')
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm)
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(warm, 500)
    return () => clearTimeout(id)
  }, [])
  // Keep the departing gallery visible until camera travel is finished, but
  // release previous galleries afterwards instead of keeping every heavy scan
  // mounted forever. The destination mounts at the start of the journey.
  const previousRoom = useRef<Civilization | null>(null)
  const visited = useRef(new Set<Civilization>())
  if (state.activeRoom) visited.current.add(state.activeRoom)
  if (!state.isTransitioning) previousRoom.current = state.activeRoom
  const roomsToRender = new Set<Civilization>()
  if (state.activeRoom) roomsToRender.add(state.activeRoom)
  if (state.isTransitioning && previousRoom.current) roomsToRender.add(previousRoom.current)

  function handleSelectExhibit(exhibit: ExhibitData) {
    dispatch({ type: 'SELECT_EXHIBIT', exhibitId: exhibit.id, room: exhibit.civilization })
  }

  function handleSelectRoom(room: Civilization) {
    dispatch({ type: 'GO_TO_ROOM', room })
  }

  const canInteract = !state.isTransitioning

  return (
    <group>
      {/* Settled room cameras and bounded exhibit orbits face the gallery.
          Keep the hub visible during travel, then omit its meshes and lights. */}
      <group visible={!state.activeRoom || state.isTransitioning}>
        <Atrium onSelectRoom={handleSelectRoom} interactive={canInteract && state.appState === 'ATRIUM'} />
        {ROOM_ORDER.map((civ) => <Passage key={civ} civ={civ} />)}
      </group>
      {visited.current.has('greece') && <Suspense fallback={null}><group visible={roomsToRender.has('greece')}>
          <GreeceRoom
            onSelectExhibit={handleSelectExhibit}
            interactive={canInteract && state.appState === 'GREECE'}
          />
        </group></Suspense>}
      {visited.current.has('rome') && <Suspense fallback={null}><group visible={roomsToRender.has('rome')}>
          <RomeRoom
            onSelectExhibit={handleSelectExhibit}
            interactive={canInteract && state.appState === 'ROME'}
          />
        </group></Suspense>}
      {visited.current.has('egypt') && <Suspense fallback={null}><group visible={roomsToRender.has('egypt')}>
          <EgyptRoom
            onSelectExhibit={handleSelectExhibit}
            interactive={canInteract && state.appState === 'EGYPT'}
          />
        </group></Suspense>}
    </group>
  )
}
