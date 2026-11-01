# MYTHOS 1.3.0 — material revision validation

This revision adds detailed light/dark marble, travertine and metal finishes to the museum architecture. The previous 1.2.1 screenshots remain in `../revision-1.2.1/` for comparison.

Browser captures are actual WebGL frames. Tests run in Chromium 154 / SwiftShader on Linux; they validate rendering, input and resource behavior, not RTX 3050 frame rates. See `browser-results.json` and `pointer-idle.json` for the completed run results.

The asset validator checks all 21 map files against the source manifest and verifies the eight GLBs. Node tests cover navigation, camera/quality selection and physical UV density/caching.
