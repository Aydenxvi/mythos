import { ROOM_ORDER, ROOMS } from '../../data/world'
import type { Civilization, LocationId } from '../../types/museum'
import './CivilizationNavigation.css'
import { useGLTF } from '@react-three/drei'
import { getExhibitsForRoom } from '../../data/exhibits'
import { useGraphicsQualityContext } from '../../hooks/GraphicsQualityContext'
import { modelUrl } from '../../graphics'

export interface CivilizationNavigationProps {
  activeLocation: LocationId
  disabled: boolean
  onSelectRoom: (room: Civilization) => void
  onSelectAtrium: () => void
}

/**
 * Always-available navigation menu so visitors never have to rely on
 * precise 3D clicking to get around the museum.
 */
export function CivilizationNavigation({
  activeLocation,
  disabled,
  onSelectRoom,
  onSelectAtrium,
}: CivilizationNavigationProps) {
  const quality = useGraphicsQualityContext()
  function prefetch(room: Civilization) {
    if (disabled) return
    for (const exhibit of getExhibitsForRoom(room)) {
      if (exhibit.asset) useGLTF.preload(modelUrl(exhibit.asset, quality))
    }
  }
  return (
    <nav className="civ-nav" aria-label="Museum navigation">
      <button
        type="button"
        className={`civ-nav__item${activeLocation === 'atrium' ? ' is-active' : ''}`}
        onClick={onSelectAtrium}
        disabled={disabled || activeLocation === 'atrium'}
      >
        Atrium
      </button>
      {ROOM_ORDER.map((id) => (
        <button
          key={id}
          type="button"
          className={`civ-nav__item${activeLocation === id ? ' is-active' : ''}`}
          onClick={() => onSelectRoom(id)}
          onPointerEnter={() => prefetch(id)}
          onFocus={() => prefetch(id)}
          disabled={disabled || activeLocation === id}
        >
          {ROOMS[id].name}
        </button>
      ))}
    </nav>
  )
}
