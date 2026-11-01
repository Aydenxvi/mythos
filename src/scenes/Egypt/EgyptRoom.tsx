import { RoomShell } from '../common/RoomShell'
import { Exhibit } from '../../components/exhibits/Exhibit'
import { getExhibitsForRoom } from '../../data/exhibits'
import { THEMES } from '../../components/architecture/theme'
import { ROOMS } from '../../data/world'
import { forwardXZ, rightXZ } from '../../utils/spatial'
import type { ExhibitData } from '../../types/museum'

export interface RoomSceneProps {
  onSelectExhibit: (exhibit: ExhibitData) => void
  interactive: boolean
}

/**
 * Sandstone, heavy columns, and a single strong offset light rather than
 * even fill — a more directional, atmospheric mood than Greece or Rome.
 */
export function EgyptRoom({ onSelectExhibit, interactive }: RoomSceneProps) {
  const exhibits = getExhibitsForRoom('egypt')
  const room = ROOMS.egypt
  const center = room.worldPosition
  const [rx, rz] = rightXZ(room.entranceAngle)
  const [fx, fz] = forwardXZ(room.entranceAngle)

  return (
    <group>
      <RoomShell civ="egypt" columnsPerSide={2} columnHeight={4.9} columnRadiusScale={1.35} wallHeight={5.6} />
      <pointLight
        position={[center[0] + rx * 4.2, 4.4, center[2] + rz * 4.2]}
        color={THEMES.egypt.accentLight}
        intensity={1.65}
        distance={18}
        decay={2}
      />
      {/*
        Soft fill from the entrance side, low and dim, so the exhibit-facing
        surface the visitor actually sees (the plinth, the near side of the
        placeholder) doesn't read as pure black next to the dramatic key
        light above — still clearly darker and warmer than Greece or Rome.
      */}
      <pointLight
        position={[center[0] - fx * 2 - rx * 0.6, 2, center[2] - fz * 2 - rz * 0.6]}
        color={THEMES.egypt.accentLight}
        intensity={2.0}
        distance={9}
        decay={2}
      />
      {exhibits.map((exhibit) => (
        <Exhibit
          key={exhibit.id}
          data={exhibit}
          onSelect={onSelectExhibit}
          interactive={interactive}
          plinthColor={THEMES.egypt.trim}
        />
      ))}
    </group>
  )
}
