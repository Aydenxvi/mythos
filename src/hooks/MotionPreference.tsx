import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type MotionMode = 'cinematic' | 'instant'
const STORAGE_KEY = 'mythos.motion.mode.v1'
const MotionContext = createContext<MotionMode>('cinematic')

export function useMotionPreference() {
  const [motion, setMotion] = useState<MotionMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'cinematic' || saved === 'instant') return saved
    } catch { /* Storage is optional. */ }
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'instant' : 'cinematic'
  })
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, motion) } catch { /* Private mode. */ }
  }, [motion])
  return { motion, setMotion }
}

export function MotionProvider({ mode, children }: { mode: MotionMode; children: ReactNode }) {
  return <MotionContext.Provider value={mode}>{children}</MotionContext.Provider>
}

export function useMotionMode() { return useContext(MotionContext) }
