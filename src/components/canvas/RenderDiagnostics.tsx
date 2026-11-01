import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { GraphicsQuality } from '../../hooks/useGraphicsQuality'

/** Opt-in console diagnostics; no overlay or per-frame React updates. */
export function RenderDiagnostics({ quality }: { quality: GraphicsQuality }) {
  const store = useThree()
  useEffect(() => {
    if (!new URLSearchParams(location.search).has('diagnostics')) return
    const diagnostics = {
      quality,
      snapshot: () => ({
        quality, dpr: store.gl.getPixelRatio(),
        calls: store.gl.info.render.calls, triangles: store.gl.info.render.triangles,
        memory: { ...store.gl.info.memory },
        camera: store.camera.position.toArray(),
      }),
      scene: store.scene, camera: store.camera, renderer: store.gl,
      invalidate: store.invalidate,
    }
    Object.assign(window, { mythosDiagnostics: diagnostics })
    return () => { Reflect.deleteProperty(window, 'mythosDiagnostics') }
  }, [store, quality])
  return null
}
