import { RoomShell } from '../common/RoomShell'
import { Archway } from '../../components/architecture/Archway'
import { Exhibit } from '../../components/exhibits/Exhibit'
import { getExhibitsForRoom } from '../../data/exhibits'
import { THEMES } from '../../components/architecture/theme'
import { ROOMS, ROOM_DEPTH_EXPORT as ROOM_DEPTH } from '../../data/world'
import type { ExhibitData } from '../../types/museum'

export interface RoomSceneProps {
  onSelectExhibit: (exhibit: ExhibitData) => void
  interactive: boolean
}

/** Travertine and warm stone, monumental arches, warm lighting. */
export function RomeRoom({ onSelectExhibit, interactive }: RoomSceneProps) {
  const exhibits = getExhibitsForRoom('rome')
  const room = ROOMS.rome
  const center = room.worldPosition

  return (
    <group>
      <RoomShell civ="rome" columnsPerSide={2} columnHeight={4.3} columnRadiusScale={1.1} wallHeight={5} />
      {/* A decorative arched niche set against the back wall. */}
      <group position={center} rotation={[0, -room.entranceAngle, 0]}>
        <group position={[0, 0, -ROOM_DEPTH / 2 + 1.1]}>
          <Archway position={[0, 0, 0]} rotationY={0} width={2.6} height={3.6} color={THEMES.rome.trim} shape="arch" />
        </group>
      </group>
      <pointLight
        position={[center[0], 4.6, center[2]]}
        color={THEMES.rome.accentLight}
        intensity={1.3}
        distance={17}
        decay={2}
      />
      {exhibits.map((exhibit) => (
        <Exhibit
          key={exhibit.id}
          data={exhibit}
          onSelect={onSelectExhibit}
          interactive={interactive}
          plinthColor={THEMES.rome.trim}
        />
      ))}
    </group>
  )
}
