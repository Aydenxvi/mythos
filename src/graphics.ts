import type { GraphicsQuality } from './hooks/useGraphicsQuality'
import type { ModelAsset } from './types/museum'

/** Stable, explicit budgets. DPR respects the device ratio up to these caps. */
export const GRAPHICS = {
  eco: { dpr: 1, anisotropy: 2, shadowSize: 0 },
  balanced: { dpr: 1.5, anisotropy: 8, shadowSize: 1024 },
  high: { dpr: 2, anisotropy: 16, shadowSize: 2048 },
} as const

export function modelUrl(asset: ModelAsset, quality: GraphicsQuality): string {
  if (quality === 'eco') return asset.liteUrl ?? asset.url
  if (quality === 'high') return asset.highUrl ?? asset.url
  return asset.url
}
