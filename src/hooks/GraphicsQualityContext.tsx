import { createContext, useContext, type ReactNode } from 'react'
import type { GraphicsQuality } from './useGraphicsQuality'

const QualityContext = createContext<GraphicsQuality>('balanced')
export function GraphicsQualityProvider({ quality, children }: { quality: GraphicsQuality, children: ReactNode }) {
  return <QualityContext.Provider value={quality}>{children}</QualityContext.Provider>
}
export const useGraphicsQualityContext = () => useContext(QualityContext)
