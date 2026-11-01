import test from 'node:test'
import assert from 'node:assert/strict'
import { surfaceBox, surfaceCylinder, surfaceDisk, repeatGeometryUV } from '../src/components/architecture/surfaceGeometry.ts'

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

test('circular floor and pedestal caps retain planar texture density', () => {
  for (const geometry of [surfaceDisk(11.5), surfaceDisk(3.36,3.04), surfaceCylinder(0.8,0.9,1.05)]) {
    const { position, normal, uv } = geometry.attributes
    for (let a = 0; a < position.count - 1; a++) {
      const b = a + 1
      const disk = geometry.type !== 'CylinderGeometry'
      const cap = Math.abs(normal.getY(a)) > 0.99 && normal.getY(a) === normal.getY(b)
      if (!disk && !cap) continue
      const distance = Math.hypot(position.getX(a)-position.getX(b), position.getY(a)-position.getY(b), position.getZ(a)-position.getZ(b))
      const texels = Math.hypot(uv.getX(a)-uv.getX(b), uv.getY(a)-uv.getY(b))
      if (distance > 0.0001) assert.ok(Math.abs(distance / texels - 2) < 0.0001)
    }
  }
})

test('column UV variants are cached without changing the shared source geometry', () => {
  const source = surfaceCylinder(0.4,0.5,1)
  const original = [...source.attributes.uv.array]
  const short = repeatGeometryUV(source,1,2)
  const tall = repeatGeometryUV(source,1,3)
  assert.notEqual(short,tall)
  assert.equal(short,repeatGeometryUV(source,1,2))
  assert.deepEqual([...source.attributes.uv.array],original)
  for (let i = 0; i < source.attributes.uv.count; i++) {
    assert.ok(Math.abs(tall.attributes.uv.getY(i)-source.attributes.uv.getY(i)*3) < 0.00001)
  }
})
