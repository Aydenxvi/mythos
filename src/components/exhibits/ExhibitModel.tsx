import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { ModelAsset } from '../../types/museum'
import { useGraphicsQualityContext } from '../../hooks/GraphicsQualityContext'
import { GRAPHICS, modelUrl } from '../../graphics'

/**
 * Normalized GLB viewer: every object stands on the exhibition plinth, even if
 * its source file uses an arbitrary size/origin. The imported scene is cloned
 * so we never mutate the shared Drei GLTF cache. Original materials survive.
 */
export function ExhibitModel({ asset }: { asset: ModelAsset }) {
  const quality = useGraphicsQualityContext()
  const url = modelUrl(asset, quality)
  const { scene } = useGLTF(url)
  const gl = useThree(s => s.gl)
  const invalidate = useThree(s => s.invalidate)
  useEffect(() => {
    const anisotropy = Math.min(GRAPHICS[quality].anisotropy, gl.capabilities.getMaxAnisotropy())
    scene.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      for (const material of materials) for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture && value.anisotropy !== anisotropy) {
          // GLTFLoader assigns sRGB to base/emissive maps and linear to data maps.
          // Preserve that semantic distinction, including packed metallic/roughness.
          value.anisotropy = anisotropy
          value.needsUpdate = true
        }
      }
    })
    invalidate()
  }, [scene, gl, quality, invalidate])
  const { object, position, scale } = useMemo(() => {
    const clone = scene.clone(true)
    clone.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const normalize = (asset.targetHeight ?? 3.15) / Math.max(size.y, 0.001)
    clone.traverse(child => {
      if (child instanceof THREE.Mesh) {
        // A 300k-triangle scan rendered into a dynamic shadow map is very costly.
        // The pedestal and architecture still provide spatial shadows.
        child.castShadow = false
        child.receiveShadow = false
      }
    })
    return {
      object: clone,
      scale: normalize,
      position: [-center.x * normalize, -box.min.y * normalize, -center.z * normalize] as [number, number, number],
    }
  }, [scene, asset.targetHeight])
  return <group name="exhibit-model" dispose={null} scale={asset.scale ?? [1, 1, 1]} rotation={asset.rotation ?? [0, 0, 0]}>
    <group position={position} scale={scale}>
      <primitive object={object} />
    </group>
  </group>
}
