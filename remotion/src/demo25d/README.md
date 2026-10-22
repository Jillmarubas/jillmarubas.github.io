# 2.5D demo: Remotion vs HyperFrames

The same 8 s parallax shot (six cut-out layers, camera push-in, counter, keyword) built three ways
to compare the two tools. Shot numbers live in `shot.ts`; the HyperFrames file uses the same values.

| Version | How | Local render, 4-core cloud box, 4 workers |
|---|---|---|
| `Demo25D` | Remotion + three.js camera | 4 min 6 s |
| `Demo25DCss` | Remotion + CSS 3D | 2 min 36 s |
| `hyperframes/index.html` | HyperFrames + CSS 3D + GSAP | 1 min 2 s |

Output looked identical (about 3/255 average pixel difference).

## Re-run
- Layers: `python3 -I gen_layers.py public/demo25d` (drawn in code, seeded).
- Remotion: `npx remotion render src/demo25d/index.ts Demo25D out.mp4 --gl=swangle`
  (or `Demo25DCss`). Separate entry point, so the main `Root.tsx` is untouched.
- HyperFrames: `npx hyperframes@0.8.185 init demo --example blank`, copy `hyperframes/index.html`
  in, put the PNGs from `public/demo25d/` plus `inter-latin-800-normal.woff2`,
  `fraunces-latin-400-italic.woff2` (from `@fontsource`) and `gsap.min.js` (gsap 3.14.2) in
  `demo/assets/`, then `npx hyperframes render demo -w 4`.
