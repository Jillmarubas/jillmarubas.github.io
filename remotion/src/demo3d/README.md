# Real-3D demo: Remotion vs HyperFrames

One three.js scene (`city3d.js`: a seeded city at dusk, low sun with shadows, fog, moving
car lights, a gold-crowned tower, crane-up camera) rendered by both tools. The scene file
takes `THREE` as an argument, so both hosts run identical scene code:

- Remotion: `Demo3D.tsx` hands the scene to `@remotion/three` and poses it per frame.
- HyperFrames: `hyperframes/index.html` draws it in an `hf-seek` listener.

Test frames from the two matched to under 0.5/255 average pixel difference.
Render times: see the PR / results below once measured.

## Re-run
- Remotion: `npx remotion render src/demo3d/index.ts Demo3D out.mp4 --gl=swangle`
- HyperFrames: `npx hyperframes@0.8.185 init demo3d --example blank`, copy
  `hyperframes/index.html` in, and put in `demo3d/assets/`: `city3d.js`,
  `three.module.js` + `three.core.js` (three 0.180.0 `build/`), `gsap.min.js` (3.14.2),
  `grain.png` (from `public/demo25d/`) and the two `@fontsource` woff2 files.
  Then `npx hyperframes render demo3d -w 4`.
