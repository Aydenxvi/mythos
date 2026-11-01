# Revision 1.2.1 validation

`before.json` / `after.json`: controlled Athena inspection with 40 raycasts, DPR 1, BALANCED, Chromium software WebGL. Matching `before-*` / `after-*` files are actual browser screenshots. Source baseline: Git commit abd6d68. The scripts for repeating pointer/idle and general functional validation are in `tests/`.

`browser-results.json`: production browser regression; 7 groups passed, no unhandled JS errors, all 9 local photo textures loaded, and stable resource counts through 3 warm circuits. Screenshots named after the galleries come from that run.

`pointer-idle.json`: focused production run confirming lightweight gallery selection, no inspection picking, and no continuous redraw after animation settles.

Rendering uses SwiftShader. CPU submission timings are not full-frame GPU timings and cannot establish RTX 3050 / Edge FPS. Screenshots were visually inspected for the three gallery materials.
