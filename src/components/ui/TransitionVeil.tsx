import { useTransitionVeil } from '../../systems/transitions/useTransitionVeil'
import './TransitionVeil.css'

/** A subtle fade used to soften camera transitions — never a hard cut. */
export function TransitionVeil() {
  const visible = useTransitionVeil()
  return <div className={`transition-veil${visible ? ' is-visible' : ''}`} aria-hidden="true" />
}
