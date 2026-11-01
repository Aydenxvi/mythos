import { useCallback, useEffect, useState } from 'react'
import type { Civilization } from '../types/museum'

const STORAGE_KEY = 'mythos:progress:v1'
export interface MuseumProgress { favorites: string[]; visited: Civilization[] }
const EMPTY: MuseumProgress = { favorites: [], visited: [] }

function readProgress(): MuseumProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY
    const data = parsed as Record<string, unknown>
    const clean = (value: unknown, valid: string[]) => Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string' && valid.includes(item))
      : []
    return {
      favorites: clean(data.favorites, ['athena', 'jupiter', 'anubis']),
      visited: clean(data.visited, ['greece', 'rome', 'egypt']) as Civilization[],
    }
  } catch { return EMPTY }
}

export function useMuseumProgress() {
  const [progress, setProgress] = useState<MuseumProgress>(readProgress)
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) } catch { /* private mode */ } }, [progress])
  const toggleFavorite = useCallback((id: string) => {
    setProgress(p => ({ ...p, favorites: p.favorites.includes(id) ? p.favorites.filter(x => x !== id) : [...p.favorites, id] }))
  }, [])
  const visitRoom = useCallback((room: Civilization) => {
    setProgress(p => p.visited.includes(room) ? p : { ...p, visited: [...p.visited, room] })
  }, [])
  return { progress, toggleFavorite, visitRoom }
}
