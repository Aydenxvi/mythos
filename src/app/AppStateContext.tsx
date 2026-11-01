import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react'
import { museumReducer, initialMuseumState, type MuseumState, type MuseumAction } from './appReducer'

interface MuseumContextValue {
  state: MuseumState
  dispatch: React.Dispatch<MuseumAction>
}

const MuseumContext = createContext<MuseumContextValue | null>(null)

export function MuseumStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(museumReducer, initialMuseumState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <MuseumContext.Provider value={value}>{children}</MuseumContext.Provider>
}

export function useMuseumState(): MuseumContextValue {
  const ctx = useContext(MuseumContext)
  if (!ctx) {
    throw new Error('useMuseumState must be used within a MuseumStateProvider')
  }
  return ctx
}
