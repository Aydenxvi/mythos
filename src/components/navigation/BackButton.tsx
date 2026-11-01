import { ChevronLeft } from 'lucide-react'
import './BackButton.css'

export interface BackButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

/** Context-aware "go back one level" control (exhibit → room, room → atrium). */
export function BackButton({ label, onClick, disabled }: BackButtonProps) {
  return (
    <button type="button" className="back-button" onClick={onClick} disabled={disabled}>
      <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
