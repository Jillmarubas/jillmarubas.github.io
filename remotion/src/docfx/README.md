# docfx: documentary effects kit

Reusable Remotion pieces for documentary and MagnatesMedia-style videos, built from the
reference 7 study (`.claude/skills/motion-video/reference/breakdowns.md`). All times are in
**seconds, local to the enclosing `Sequence`**. Everything is seeded and deterministic.

**Tools, not a template.** Reference 7 is guidance only: never imitate it. Use a piece only
where the story needs it and style it from the film's own design system (fonts, colours, glow).
The defaults are neutral on purpose.

| Piece | File | What it does | Principle it serves |
|---|---|---|---|
| `DecodeTitle` | `DecodeTitle.tsx` | Random glyphs resolve into the name left to right, with glow; leaves left to right | a name lands on the word that says it |
| `MatteTransition kind="ink"` | `MatteTransition.tsx` | Organic black ink/smoke front sweeps across and reveals the next shot (~0.35 s) | a hard change of place or time |
| `MatteTransition kind="dissolve"` | `MatteTransition.tsx` | Fine-grain "melt" dissolve (~0.3 s), for statue → photo, legend → man | a transformation (then → now, myth → person) |
| `ParticleRain` | `ParticleRain.tsx` | Bills, coins or paper falling or flying toward the lens, with depth blur and motion blur; ramp `density` to 1 for a particle wipe | excess or scale; can carry a transition |
| `SideEntrance` | `Layers.tsx` | Cut-outs slide in from both edges to their spots, staggered, smeared by speed | many people at once, named on the line |
| `FaceOff` | `Layers.tsx` | Two giant profiles facing each other at the edges, closing in, the scene between them | conflict between two people |
| `VoidStage` + `ClassicalBuilding` | `VoidStage.tsx` | A 3D object floating in a dark void: dust, stars, key light from above, glow pool, camera recedes to a hold | a place as a symbol (a real 3D replica) |
| `OverShoulder` | `Layers.tsx` | Soft foreground back/shoulders sliding up: subject and target in one frame | subject and target in one frame |
| `ForegroundSweep` | `Layers.tsx` | A near prop crossing the frame fast and out of focus | depth on any shot |
| `Tint` | `Layers.tsx` | Soft-light colour wash; animate it for the cold ↔ warm flip on a story turn | a story turn felt in colour |
| `DocFinish` | `Layers.tsx` | Grain (15 fps) + vignette | filmic finish |

`Shapes.tsx` has placeholder silhouettes and props drawn in code (profiles, shoulders, busts, gold
bars). They're for demos. In films, use real licensed or public-domain cut-outs (method B /
`prep_depth.py` makes them from archive photos), and real 3D replicas of places.

## Demo
`DocFxDemo` (16 s, 30 fps) is a feature test that exercises every piece; it is not a template for films. It needs `public/demodepth/` (run
`parallax/prep_depth.py` first, see `../demodepth/README.md`).

```bash
npx remotion still src/docfx/index.ts DocFxDemo out.png --frame=120 --gl=swangle
npx remotion render src/docfx/index.ts DocFxDemo out.mp4 --gl=swangle
```

## Notes
- `MatteTransition` must get both shots; wrap the incoming one in
  `<Sequence from={at}>` so its time starts at the transition.
- `ParticleRain` draws on one canvas; keep `count` ≤ ~300. Run the flash check
  (`flash_check.py`) on anything with a particle wipe or fast dips.
- `VoidStage` and `ArchiveParallax` each own a WebGL canvas. Two at once (during a transition)
  is fine; avoid more.
- Story turns (the "but" moment) are a package: a silence beat before, the cut on the word, a
  bass drop-out and a `Tint` flip. The audio half lives in the mix script (see the SOP).
