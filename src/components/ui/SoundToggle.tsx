import { VolumeX } from 'lucide-react'
import './SoundToggle.css'

/** Placeholder control — audio isn't implemented yet, so this is clearly disabled rather than functional. */
export function SoundToggle() {
  return (
    <button
      type="button"
      className="sound-toggle"
      disabled
      aria-label="Sound (not yet available)"
      title="Sound is not yet available"
    >
      <VolumeX size={16} strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}
