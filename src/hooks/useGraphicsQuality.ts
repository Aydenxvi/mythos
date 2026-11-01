import { useEffect, useState } from 'react'

export type GraphicsQuality = 'eco' | 'balanced' | 'high'
const KEY = 'mythos.graphics.quality.v1'

function defaultQuality(): GraphicsQuality {
  if (typeof window === 'undefined') return 'balanced'
  let saved: string | null = null
  try { saved = window.localStorage.getItem(KEY) } catch { /* private browsing */ }
  if (saved === 'eco' || saved === 'balanced' || saved === 'high') return saved
  // A sensible starting point; users can always switch to HIGH themselves.
  const cores = navigator.hardwareConcurrency || 4
  return window.innerWidth < 760 || cores <= 4 ? 'eco' : 'balanced'
}

export function useGraphicsQuality() {
  const [quality, setQuality] = useState<GraphicsQuality>(defaultQuality)
  useEffect(() => {
    try { window.localStorage.setItem(KEY, quality) } catch { /* storage unavailable */ }
  }, [quality])
  return { quality, setQuality }
}
