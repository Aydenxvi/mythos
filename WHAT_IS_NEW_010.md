# MYTHOS_010 — visual quality and performance stabilization

Version 1.2.0. Continued from the supplied MYTHOS_009 source; the museum, mythology content, tour, atlas, journal, timeline, audio controls and static deployment model are retained.

## Concrete changes

- Fixed the six TypeScript diagnostics that blocked the original release: nullable camera capture and a GSAP cleanup callback returning a Tween.
- Athena's supplied forward axis is +Z. Removed the extra quarter-turn; the default entrance and exhibit cameras now see her face. Checked actual WebGL frames for Athena, Jupiter and Anubis.
- ECO keeps the lightweight 1K artwork tiers. BALANCED now uses detailed geometry with up to 2K maps, rather than selecting ECO assets. Athena HIGH uses the supplied original 4K JPEG with the existing detailed 283,727-triangle mesh. Anubis BALANCED/HIGH retain all maps from the original 8,630-triangle GLB. Zeus remains limited to the archive's 2K source.
- Explicit DPR caps of 1 / 1.5 / 2 and artwork anisotropy caps of 2 / 8 / 16; device/GPU limits still apply. Shadow maps are disabled / 1024 / 2048. Antialiasing is enabled when the WebGL context is created and stays consistent during preset switches.
- GLTFLoader's sRGB base-color/emissive maps and linear normal/packed material maps are preserved. Renderer output is explicitly sRGB with ACES filmic tone mapping. Neutral gallery fill and a locally generated reflection environment reveal contours and make metallic Anubis materials readable. No remote environment maps or postprocessing dependencies.
- Shadow coverage follows the active gallery. Static shadow results are reused while orbiting; only quality changes reallocate the shadow map. Ivory and sandstone palettes are less yellow.
- Removed the artificial minimum distance assigned to every rounded camera-path segment. Short corner segments now take their actual share of travel time. Switching CAMERA to INSTANT completes an active journey. Orbit departure uses the real current camera and target.
- Gallery architecture is mounted once per visited room and hidden when inactive, avoiding repeated destruction of shared geometry/materials. Heavy exhibits leave the active scene on departure; cached GLTF resources remain reusable. Quality changes selecting the same model URL no longer force a model remount.
- Gallery code and procedural stone textures warm during idle time; navigation hover/focus preloads the selected asset tier. Shared GLTF resources are not prematurely disposed.
- The artwork has its own viewport beside the information panel; mobile uses a separate upper viewport and lower reader. View artwork restores the full viewport. Existing navigation, keyboard and reduced-motion behavior are retained. TOUR/ATLAS/JOURNAL now have stable accessible names when their visible labels collapse on mobile.
- Optional `?diagnostics=1` exposes render/resource/camera information in the console without an overlay or per-frame React state updates.

## Validation

Node.js 24.19.0 / npm 11.9.0; Chromium 154 with SwiftShader on Linux. Dependencies installed reproducibly with `npm ci --no-audit --no-fund`.

| Command | Result |
|---|---|
| `npm run test` | 8 passed, 0 failed, 0 skipped |
| `npm run verify:assets` | All 8 GLBs and release resources passed |
| `npm run typecheck` | Passed |
| `npm run lint` | 0 errors; 4 inherited Fast Refresh warnings |
| `npm run build` | Passed; Vite warns about the large Three.js main bundle |
| Browser regression | See validation/browser-results.json and the final validation summary below |

Exact terminal output is in `validation/checks.txt`. Reproduce the browser run against the production server with `python tests/browser_smoke.py http://127.0.0.1:4173/ /tmp/mythos-browser-check`. Python Playwright and Chromium are optional development tools, not website dependencies.

The production-browser regression passed with no unhandled JavaScript errors. It exercised welcome/atrium, the three-stop tour, all three sculptures, orbit/zoom and Escape, ECO → BALANCED → HIGH → BALANCED → ECO, myth/detail tabs, symbol explanations, journal persistence across reload, atlas/timeline, cross-gallery travel, cinematic travel and INSTANT completion, a 390px mobile viewport, reduced motion, and a forced GLB 404 fallback.

At the Athena view the measured budgets were: ECO DPR 1 / 120,839 submitted triangles; BALANCED DPR 1.5 / 296,755 triangles; HIGH DPR 2 / 296,755 triangles. All three issued 121 draw calls in that view. Three repeated warm gallery circuits each reported exactly 407 geometries and 18 textures; this is a bounded resource check, not proof against every long-session leak.

The software-rendered cinematic sample recorded 58 render submissions (median CPU submission time 1.95 ms, p95 17.70 ms) and 11 sampled animation-frame intervals (median 316.70 ms, p95 695.96 ms). GPU/software rasterization and scheduling dominate these intervals; render submission time is not total GPU frame time. This cloud run included concurrent validation and cannot establish a physical device's FPS or a before/after speedup. Raw samples are retained in `validation/browser-results.json`.

Actual WebGL screenshots are in `validation/`: welcome, atrium, Athena HIGH, Jupiter HIGH, Anubis HIGH, mobile Athena and the missing-model fallback. These are browser captures, not generated illustrations. Exhibit captures wait for the drawing surface and camera aspect to match the resized viewport and for the GPU command queue to finish; the mobile sculpture is fully framed above the reader.

## Limits and remaining checks

- The separately attached `zeus.glb` could not be transferred because it exceeds the environment's 32 MiB per-file transfer limit. The best supplied archive derivative is used. Lost detail is not claimed to be restored.
- High-detail Athena deliberately retains the web mesh (283,727 triangles) instead of all 746,662 source triangles. The original texture pixels are available; original mesh detail beyond this derivative is not restored. ECO retains the earlier aggressive simplification and its visible surface artifacts.
- Browser rendering here is software WebGL. Ordinary desktop/mobile GPU FPS, thermal behavior and prolonged memory use need testing on physical devices; no 60/30 FPS guarantee is made.
- Audio start/stop controls are exercised with a deterministic speech API stub. Actual voices, sound output and touch gestures require a real device. Mobile testing uses a Chromium viewport, not physical hardware.
- No new provenance or licensing claims: existing artist credits and CC BY attribution are retained. See ASSET_CREDITS.md.
- Source files are prepared locally in `/workspace/mythos`; nothing was pushed to GitHub. Environment setup/start instructions are saved as a draft; publication and fresh-task restoration have not been performed.

## Files changed

See `validation/changed-files.json` for the complete inventory relative to MYTHOS_009. Main changes: `src/systems/camera/CameraRig.tsx`, canvas lighting/rendering/diagnostics, exhibit model/tier selection, `src/graphics.ts`, gallery lifecycle, viewport CSS, model data, three generated detail GLBs, quality-tier generation and browser/graphics tests. README, asset credits and version metadata are updated. No backend or additional frontend dependencies were added.
