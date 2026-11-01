// Zero-dependency GLB and publication sanity checks; Node.js 22+.
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

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
const textures = JSON.parse(readFileSync(join(root, 'public/textures/sources.json'), 'utf8'))
assert.equal(textures.length, 21, 'Expected three maps for each of seven architectural material sets')
assert.equal(new Set(textures.map(t => t.file)).size, textures.length, 'Duplicate texture filenames')
for (const asset of new Set(textures.map(t => t.asset))) {
  for (const channel of ['color', 'normal', 'roughness']) {
    assert.ok(textures.some(t => t.file === `${asset}_${channel}.jpg`), `Missing ${channel} map for ${asset}`)
  }
}
for (const texture of textures) {
  const buffer = readFileSync(join(root, 'public/textures', texture.file))
  assert.equal(buffer.length, texture.bytes, `Texture length mismatch: ${texture.file}`)
  assert.equal(createHash('sha256').update(buffer).digest('hex'), texture.sha256, `Texture checksum mismatch: ${texture.file}`)
  assert.equal(buffer.readUInt16BE(0), 0xffd8, `Invalid JPEG: ${texture.file}`)
  assert.equal(texture.license, 'CC0-1.0')
  console.log(`✓ ${texture.file} (SHA-256 verified)`)
}
console.log('All public models, wall textures and release resources are valid.')
