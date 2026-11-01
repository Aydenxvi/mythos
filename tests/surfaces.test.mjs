import test from 'node:test'
import assert from 'node:assert/strict'
import { surfaceBox } from '../src/components/architecture/surfaceMaterials.ts'

test('wall texture density stays constant on every face of differently sized walls', () => {
  for (const dimensions of [[0.32, 5.9, 12.2], [9, 5.9, 0.42], [3.37, 4.46, 0.042]]) {
    const geometry = surfaceBox(...dimensions)
    const position = geometry.attributes.position
    const uv = geometry.attributes.uv
    for (let face = 0; face < 6; face++) {
      // Both perpendicular edges must map three world meters to one tile.
      const a = face * 4
      for (const b of [a + 1, a + 2]) {
        const worldLength = Math.hypot(position.getX(a)-position.getX(b), position.getY(a)-position.getY(b), position.getZ(a)-position.getZ(b))
        const uvLength = Math.hypot(uv.getX(a)-uv.getX(b), uv.getY(a)-uv.getY(b))
        assert.ok(Math.abs(worldLength / uvLength - 3) < 0.00001, `stretched face ${face}`)
      }
    }
  }
})
