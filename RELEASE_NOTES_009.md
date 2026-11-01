# MYTHOS_009 — Portfolio release, 1.1.0

This is a **complete self-contained source release** for the project’s scoped three-exhibit interactive museum. It is not a claim of full browser certification or a commercial product.

## Included
- Full rotunda and three civilizations, with accessible HTML navigation
- Three optimized locally hosted 3D models, high/low variants where available
- Curated tour, history and symbolism, text-to-speech where available
- Atlas with collection search and historical timeline, journal with local persistence
- Camera navigation with cinematic and immediate options, graphics presets, reduced-motion support
- Original architecture, restrained museum UI, credits and asset provenance

## Improvements since 008
1. Production static hosting with correct asset URLs under GitHub Pages repository paths.
2. Independent lazy-gallery Suspense boundaries, avoiding the previous whole-gallery blanking on initial room load.
3. Stronger state guards: no jumping past the welcome or opening an unrelated exhibit.
4. Improved keyboard help dialog focus cycle and an always accessible creator/license page (`credits.html`).
5. Better recovery when switching between high and low model variants after an asset error.
6. Six executable navigation regression tests, model integrity verification script, one-click Windows release validation.
7. GitHub Actions pipeline to test and deploy only if build succeeds.
8. Consolidated README and clear external model license requirements.

## Current verification
- PASS: native Node.js navigation reducer tests (6 cases).
- PASS: five binary GLB structural checks.
- PASS: 58 TS/TSX syntax and relative-import checks.
- NOT EXECUTED: dependency-backed TypeScript checker, ESLint, Vite build and live WebGL QA because npm registry DNS was unavailable in the authoring environment. CI will independently gate publishing.

## Important
This is a finished **portfolio demo scope**, not a fully scholarly virtual museum: it has three exhibit objects, not an extensive artifact collection. Confirm licensing for Athena and Zeus on the current original creator pages before publishing third-party artwork.
