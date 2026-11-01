import { RoomShell } from '../common/RoomShell'
import { Exhibit } from '../../components/exhibits/Exhibit'
import { getExhibitsForRoom } from '../../data/exhibits'
import { THEMES } from '../../components/architecture/theme'
import { ROOMS } from '../../data/world'
import type { ExhibitData } from '../../types/museum'

export interface RoomSceneProps {
  onSelectExhibit: (exhibit: ExhibitData) => void
  interactive: boolean
}

/** Light marble, slender columns, bright and harmonious. */
export function GreeceRoom({ onSelectExhibit, interactive }: RoomSceneProps) {
  const exhibits = getExhibitsForRoom('greece')
  const center = ROOMS.greece.worldPosition

  return (
    <group>
      <RoomShell civ="greece" columnsPerSide={3} columnHeight={4.7} columnRadiusScale={0.82} wallHeight={5.3} />
      <pointLight
        position={[center[0], 5.2, center[2]]}
        color={THEMES.greece.accentLight}
        intensity={0.9}
        distance={16}
        decay={2}
      />
      {exhibits.map((exhibit) => (
        <Exhibit
          key={exhibit.id}
          data={exhibit}
          onSelect={onSelectExhibit}
          interactive={interactive}
          plinthColor={THEMES.greece.trim}
        />
      ))}
    </group>
  )
}
