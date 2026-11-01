import './MuseumHeader.css'

export interface MuseumHeaderProps {
  locationLabel: string
}

/** Persistent wordmark + current-location label, shown once inside the museum. */
export function MuseumHeader({ locationLabel }: MuseumHeaderProps) {
  return (
    <header className="museum-header">
      <span className="museum-header__mark">MYTHOS</span>
      <span className="museum-header__divider" aria-hidden="true" />
      <span className="museum-header__location">{locationLabel}</span>
    </header>
  )
}
