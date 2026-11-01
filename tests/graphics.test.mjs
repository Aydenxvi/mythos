import test from 'node:test'
import assert from 'node:assert/strict'
import { modelUrl, GRAPHICS } from '../src/graphics.ts'
import { roundCameraPath } from '../src/systems/camera/roundedPath.ts'

test('each asset tier selects its actual resource, sharing URLs when detail is identical', () => {
  const asset = { url: 'balanced.glb', liteUrl: 'eco.glb', highUrl: 'high.glb' }
  assert.equal(modelUrl(asset, 'eco'), 'eco.glb')
  assert.equal(modelUrl(asset, 'balanced'), 'balanced.glb')
  assert.equal(modelUrl(asset, 'high'), 'high.glb')
  assert.equal(modelUrl({ url: 'master.glb' }, 'eco'), 'master.glb')
  assert.equal(modelUrl({ url: 'master.glb' }, 'high'), 'master.glb')
  assert.ok(GRAPHICS.eco.dpr < GRAPHICS.balanced.dpr)
  assert.ok(GRAPHICS.balanced.dpr < GRAPHICS.high.dpr)
  assert.equal(GRAPHICS.eco.shadowSize, 0)
})

test('rounded travel keeps endpoints and stays inside the corner safety envelope', () => {
  const pose = (x, z) => ({ position: [x, 3, z], target: [x, 2, z - 3], fov: 50 })
  const poses = [pose(0, 0), pose(0, -10), pose(10, -10)]
  const route = roundCameraPath(poses)
  assert.deepEqual(route[0], poses[0])
  assert.deepEqual(route.at(-1), poses.at(-1))
  for (const p of route) {
    assert.ok(p.position.every(Number.isFinite))
    const [x,,z] = p.position
    assert.ok(x >= 0 && x <= 10 && z <= 0 && z >= -10)
    assert.ok(x <= 0.42 || Math.abs(z + 10) <= 0.42)
  }
  assert.deepEqual(roundCameraPath([poses[0], poses[0], poses[2]])[0], poses[0])
})
