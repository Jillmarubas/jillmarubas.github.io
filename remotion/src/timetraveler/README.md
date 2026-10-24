# Time traveler: history survival stories

| File | What it is |
|---|---|
| `TimeTraveler.tsx` | The main character, one SVG component. Props: `expression`, `costume` (none / iceAge / rome / egypt), `pose` (idle / wave / point / panic / shiver / checkWatch), `talking`, `watchGlitch`, `flip`, `size`, plus `fromPose` + `poseProgress` to blend poses. Blinks, breathes and sways by itself. |
| `TimeTravelerDemo.tsx` | Composition `TimeTravelerDemo`: all four costumes cycling through every pose and expression. |
| `IceAgeScene.tsx` | Compositions `IceAgeScene` (VectorCraft art) and `IceAgeSceneCode` (code-drawn fallback). 390 frames, 30 fps, 1920x1080. |
| `pieces.ts` | The box (viewBox) of every art piece, the mammoth rig points, and the scene palette. |
| `codeArt.tsx` | The code-drawn version of every piece (the fallback). |

The VectorCraft art lives in `public/timetraveler/vector/<piece>.svg`. The editable files are in
`assets/timetraveler-vectorcraft/<piece>.vectorcraft`, and `scripts/vectorcraft/art.py` redraws them all:

```sh
python3 scripts/vectorcraft/art.py /tmp/vc-out            # all pieces, or name some: ... cave logs
cp /tmp/vc-out/*.svg public/timetraveler/vector/
cp /tmp/vc-out/*.vectorcraft assets/timetraveler-vectorcraft/
```

Switch a scene between the two art sets with the `art` prop (`'vector'` or `'code'`).

## Rules for new pieces
- Draw in the piece's box from `pieces.ts`, so code and vector versions are interchangeable.
- Outline: ink `#2a1b12`, 5 px at layer scale 1 (the character's outline at size 300 is 4.6 px).
  Far mountains use 4, mid 4.5; the mammoth uses 9 in its box because the scene draws it at 0.52.
- Hand-drawn look: Roughen (smooth points, about 1.4 pt) on outlined shapes, Scribble on shade
  shapes, the `lens` width profile on detail strokes.
- Animated parts (the mammoth's legs, head, trunk and tusks) share one box and turn around the
  rig points in `pieces.ts`. Leg tops have no outline so they melt into the body fur.

## Asset sources
Everything here is original: the character, the code-drawn art and the VectorCraft art were all
drawn for this project. No third-party images. The film grain is the repo's existing `public/grain-1024.png`.

## Basement, front view (`BasementFront`)

The reverse of `BasementTV`: the camera sits at the TV and looks back at the couch. Same room and 3D
camera (`scripts/vectorcraft/basement_front.py` imports `P()`/`box3d()` from `basement.py`), so the
two shots cut together; left and right swap (Ria, Tank, the Traveler, Pip; the lamp is on the right).
The rigs sit by being clipped at the hips, with seated legs drawn in front. New seated poses on both
rigs: `eat`, `reach`, `snack`, `holdBowl`, `toss`, plus `handA`/`handB` (something held in a hand),
`armBFront` (hand in front of the face) and `children` (extra drawing in the rig's own coordinates).
