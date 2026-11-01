# MYTHOS — The Eternal Museum

**Version 1.2.1 · MYTHOS_010 · Complete interactive portfolio demo**

*A museum outside of time. The gods have faded. Their stories remain.*

MYTHOS is a responsive, fully client-side 3D museum exploring three distinct mythological traditions: **Greece, Rome and Egypt**. An architectural rotunda leads into three galleries, with curated artworks, interpretive stories, a guided visit, a historical timeline and a visitor journal. It is an independent **portfolio demonstration**, not an official museum or a complete scholarly collection.

## Quick start — Windows / Быстрый запуск

1. Extract `MYTHOS_010.zip` into a **new folder**. Open the extracted folder containing `package.json` (GitHub names it `mythos-main`).
2. Install **Node.js 22 LTS or later** if needed.
3. Double-click **`START_MYTHOS_WINDOWS.bat`** to install dependencies on first run and open the site.
4. Stop the development server by closing the terminal or pressing `Ctrl+C`.

To verify production readiness, double-click **`BUILD_MYTHOS_WINDOWS.bat`**. It will run navigation tests, GLB checks, TypeScript, ESLint, and Vite build, then place static files in `dist/`.

### Terminal commands (all platforms)

```bash
npm ci
npm run dev
npm run test
npm run verify:assets
npm run typecheck
npm run lint
npm run build
npm run preview
```

Run `npm run build` before publishing. **Never open `index.html` directly from disk:** start a server.

## In the museum

- **Explore**: enter from the welcome screen and choose the Greece, Rome or Egypt gallery using a 3D entrance or the accessible navigation controls.
- **Inspect**: select a sculpture; drag to orbit, scroll/pinch to zoom, press **View artwork** for a distraction-free view.
- **Read**: Overview, The myth and Details (including the creators' attribution and source).
- **Listen**: optional browser speech synthesis when supported; captions are always available as text.
- **TOUR**: follow a three-stop guided journey at your own pace.
- **ATLAS**: browse exhibits, search, filter the historical timeline.
- **JOURNAL**: save your favorite exhibits; local storage only, no accounts.
- **Settings**: ECO / BALANCED / HIGH graphics and CINEMATIC / INSTANT camera modes. Preferences are stored locally.
- **Help**: `?` or `H`, ATLAS: `A`, journal: `J`, tour: `T`, exit exhibit: `Escape`.

## Technical architecture

- Vite, React 18, TypeScript strict mode, React Three Fiber / Three.js, Drei, GSAP.
- Reusable museum architecture with local photographic wall materials: 2K color plus normal/roughness maps, consistent physical texture scale, merged static decoration and simplified pointer picking.
- Three local, optimized GLB artworks. ECO uses light variants; BALANCED uses detailed meshes and 2K maps; HIGH adds Athena’s original 4K texture. See WHAT_IS_NEW_010.md.
- Lazy gallery code, isolated Suspense boundaries, on-demand canvas rendering, reduced-motion support, and manual quality control.
- Typed exhibit data and state-machine-driven navigation without a backend or database.
- Navigation regression tests and GLB integrity checks, CI validation, and Pages deployment workflow.

Key directories: `src/scenes` (galleries), `src/components/architecture` (procedural rotunda and gallery construction), `src/systems/camera` (GSAP route controller), `src/data` (museum narrative and metadata), `src/components/ui` (HTML exhibition interface), `public/models` (licensed 3D art), `public/textures` (local CC0 wall materials), `tests` (navigation regression tests).

## Publish on GitHub Pages

1. Upload the contents of the `MYTHOS_010` folder to a GitHub repository (ideally a **new** repository, no old `node_modules`).
2. Use `main` as the default branch.
3. Open the repo's **Settings → Pages → Build and deployment**, and choose **GitHub Actions** as the source.
4. Push to `main`; `.github/workflows/release.yml` runs checks, builds, and deploys the site after successful validation.
5. On GitHub, open **Actions** to see actual test results and deployment URL. The workflow will not publish if the build fails.

The relative Vite `base: './'` allows deployment in a repository subpath. The same `dist/` can also be deployed to Netlify, Cloudflare Pages, or any static HTTP host. No API keys or environmental secrets are required.

## Artwork licenses / rights

Read **`ASSET_CREDITS.md`** and the **`credits.html` page** in the published site. The Athena scan is Roman-period art depicting the Greek goddess; the Zeus and Anubis models are **modern depictions** and should not be described as excavated Roman or Egyptian antiquities. Asset credit is shown in the exhibit Details tabs. The received model metadata states CC BY 4.0, and Anubis was also confirmed via the creator's webpage. Before publishing, independently confirm that **Athena and Zeus** source pages still grant the required rights. All modifications (geometry simplification, texture downsampling and transforms) are acknowledged.

No blanket license is granted over third-party artwork. The museum is an independent portfolio project, not affiliated with any creator or museum.

## Verification and honest limitations

- Locally verifiable: navigation/graphics/UV tests, eight GLB integrity checks and nine wall-texture checksums, plus the browser regression described below.
- CI checks: frozen npm install, navigation, assets, TypeScript, lint and production Vite build; deploy only if successful.
- MYTHOS_010 validation and its limits are documented in `WHAT_IS_NEW_010.md`. Optional browser regression: install Python Playwright separately and run `python tests/browser_smoke.py` against a running development server. It uses installed Chromium with software WebGL; set `CHROMIUM_PATH` if needed. Device audio and consumer-GPU frame rates still require hardware testing.
- Performance and speech synthesis depend on the visitor's device and browser. Three featured exhibits are presented, not an exhaustive mythology encyclopedia.

## Graphics and diagnostics

| Mode | DPR cap | Artwork anisotropy cap | Shadows | Artwork |
|---|---:|---:|---:|---|
| ECO | 1 | 2 | Off | Light meshes / 1K maps |
| BALANCED | 1.5 | 8 | 1024 | Detailed meshes / up to 2K maps |
| HIGH | 2 | 16 | 2048 | Detailed meshes / Athena 4K, Zeus and Anubis up to 2K |

DPR never exceeds the display's native ratio; anisotropy respects the GPU limit. MSAA stays enabled for all presets because changing a live WebGL context's antialias flag is unsupported. HIGH retains a practical 283,727-triangle Athena derivative rather than rendering all 746,662 master triangles.

Walls use the same local 2K color and 1K normal/roughness maps in all three presets, with consistent texture density.

Add `?diagnostics=1` to the served address to inspect `window.mythosDiagnostics.snapshot()` in the browser console (draw calls, triangles, resource counts and camera). No developer overlay is shown. This is opt-in and is not a performance guarantee.

Generated GLBs are included; Python is not needed to run or build the site. To regenerate Athena/Anubis detail tiers from the separately supplied originals, install Pillow and run `python scripts/prepare_quality_tiers.py /path/to/newton_hall_walston_athena.glb /path/to/anubis_bust.glb`. Original files are not bundled.

## Windows: “vite is not recognized”

This usually means the local Windows command shim is missing or development dependencies were omitted. In the project directory (beside `package.json`), run:

```bat
npm ci --include=dev --bin-links
npm run dev -- --open
```

The Windows launch/build scripts now check `node_modules/.bin/vite.cmd`, `tsc.cmd` and `eslint.cmd` before deciding that installation is complete. They repair missing commands using the frozen lockfile, including development dependencies and command links. No global Vite installation is needed.

## Persistent low frame rate in Edge

Version 1.2.1 removes expensive scan raycasting during mouse movement and batches static architecture. The measured before/after changes and browser checks are in `WHAT_IS_NEW_010.md`.

If performance stays low even in ECO, inspect `edge://gpu`: WebGL/WebGL2 should report hardware acceleration. Edge's System and performance settings include “Use graphics acceleration when available”; changing it requires a browser restart. On a laptop with two GPUs, Windows Settings → System → Display → Graphics can select the high-performance GPU for Edge. These are troubleshooting checks, not confirmed causes on a particular device.
