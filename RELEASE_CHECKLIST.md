# MYTHOS_010 validation checklist

See WHAT_IS_NEW_010.md and validation/ for executed results and limitations.

- [x] Frozen dependency installation (`npm ci`), repeated successfully.
- [x] Eight navigation/graphics unit tests; eight model integrity checks.
- [x] TypeScript and production build pass.
- [x] ESLint: no errors; four existing Fast Refresh warnings documented.
- [ ] Physical desktop GPU performance at target settings.
- [ ] Physical phone touch gestures, thermal behavior and mobile GPU performance.
- [ ] Real speech output with the device's installed voices.
- [ ] Long-duration profiling beyond the automated warm-circuit resource check.
- [ ] GitHub Pages deployment (not performed from this workspace).

The original MYTHOS_009 checklist is preserved below as historical context, not as a record of 010 results.

---

# MYTHOS 009 — release checklist

The project includes all planned features for its **three-exhibit portfolio scope**. A public release should be gated by the following actual checks, not the appearance of a ZIP alone.

## Automatic checks

- [x] Navigation reducer tests passed (6 cases) in the authoring environment
- [x] All five GLB containers passed binary/header/embedded glTF checks
- [x] Relative-path/static publication configuration added
- [x] Independent gallery suspense boundaries and stronger navigation guards added
- [ ] `npm ci` / `npm run build` — **blocked by npm registry DNS in the authoring environment**
- [ ] `npm run lint` and `npm run typecheck` — requires dependencies
- [ ] GitHub Actions workflow — supplied, must run on the user's repository

## Manual desktop/browser QA

- [ ] Fresh local launch and no blocking browser console errors
- [ ] Enter museum, inspect welcome/atrium lighting and all three entrances
- [ ] Atrium → Greece → Athena → Greece → Atrium
- [ ] Atrium → Rome → Jupiter → Rome → Atrium
- [ ] Atrium → Egypt → Anubis → Egypt → Atrium
- [ ] Greece → Egypt and Egypt → Rome via navigation
- [ ] After orbiting an exhibit, returning does not jump the camera
- [ ] Try both camera modes; verify ECO works on slow hardware
- [ ] TOUR navigation, ATLAS search, historical filters, bookmarked journal
- [ ] Reload page and check journal/settings persist
- [ ] Help dialog keyboard focus and Escape, artwork credits link
- [ ] Review all model orientations and foot/plinth placement

## Manual mobile/accessibility QA

- [ ] 390px-wide Android/iPhone viewport; menus accessible without overlap
- [ ] Pinch-zoom and swipe orbit in each exhibit
- [ ] Reduced-motion OS setting disables long movement by default
- [ ] Keyboard focus visible and controls reachable
- [ ] Offline/network interruption gives understandable behavior, not a blank screen

## Rights / publishing

- [x] Original author names, model links and modifications documented
- [x] Anubis CC Attribution independently matched on creator page
- [ ] Recheck the *live* licenses of Athena and Zeus before public upload
- [ ] Record screenshot/video tour and repository URL once the build is verified
