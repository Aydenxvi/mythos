// Zero-dependency GLB and publication sanity checks; Node.js 22+.
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const root = fileURLToPath(new URL('../', import.meta.url))
const names = [
  'athena-walston-lite.glb', 'athena-walston-optimized.glb',
  'zeus-lite.glb', 'zeus-optimized.glb', 'anubis-optimized.glb',
  'athena-balanced.glb', 'athena-high.glb', 'anubis-detail.glb',
]
for (const name of names) {
  const file = join(root, 'public', 'models', name)
  assert.ok(existsSync(file), `Missing model ${name}`)
  const buffer = readFileSync(file)
  assert.ok(buffer.length >= 40, `GLB ${name} is truncated`)
  assert.equal(buffer.toString('ascii', 0, 4), 'glTF', `Invalid GLB signature: ${name}`)
  assert.equal(buffer.readUInt32LE(4), 2, `GLB must be version 2: ${name}`)
  assert.equal(buffer.readUInt32LE(8), buffer.length, `GLB length mismatch: ${name}`)
  const jsonLength = buffer.readUInt32LE(12)
  assert.equal(buffer.toString('ascii', 16, 20), 'JSON', `Missing JSON chunk: ${name}`)
  const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength))
  assert.equal(gltf.asset.version, '2.0')
  assert.ok(gltf.meshes?.length > 0, `No meshes in ${name}`)
  assert.ok(gltf.scenes?.length > 0, `No scene in ${name}`)
  console.log(`✓ ${name} (${(statSync(file).size / 1048576).toFixed(1)} MB; ${gltf.meshes.length} meshes)`)
}
for (const file of ['index.html', 'public/favicon.svg', 'public/credits.html', 'ASSET_CREDITS.md', 'README.md']) {
  assert.ok(existsSync(join(root, file)), `Missing public asset or documentation: ${file}`)
}
console.log('All public model files and release resources are valid.')
