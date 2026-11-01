import { useEffect, useState } from 'react'
import { useMuseumState } from '../../app/AppStateContext'

/**
 * Drives a brief visual veil across camera transitions. Deliberately kept
 * separate from `CameraRig` — this hook only knows "is a transition
 * happening", never camera math, so presentation (the veil component) and
 * navigation/camera logic stay independent, as required.
 */
export function useTransitionVeil(fadeOutDelay = 140): boolean {
  const { state } = useMuseumState()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (state.isTransitioning) {
      setVisible(true)
      return
    }
    const timeout = window.setTimeout(() => setVisible(false), fadeOutDelay)
    return () => window.clearTimeout(timeout)
  }, [state.isTransitioning, fadeOutDelay])

  return visible
}
