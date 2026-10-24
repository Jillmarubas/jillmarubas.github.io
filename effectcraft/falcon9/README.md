# Falcon 9 booster: EffectCraft 3D parts

The 3D components for "How SpaceX Lands a Rocket That Can't Hover". The models are built in three.js
(`remotion/src/falcon9/model.ts`) and exported to glTF with pre-cut cutaway copies, so EffectCraft gets
clean caps instead of a live clipping plane.

## Build

```sh
# 1. Export the models (from remotion/)
PLAYWRIGHT_PATH=/opt/node-tools/node_modules/playwright \
  node src/three-tools/run_glb_export.mjs src/falcon9/export.ts ../effectcraft/falcon9/assets
# 2. Rig data and the studio light (from effectcraft/falcon9/)
echo "var RIG = $(cat assets/rig.json);" > rig.jsx
cp ../cutaway/assets/studio_env.png assets/
# 3. Build the preview project and render a still
effectcraft-cli script $PWD/preview.jsx --empty --save-as $PWD/preview.ecproj
effectcraft-cli render-frame preview.ecproj --comp "A Scale" --frame 0 --max-side 960 --out A.png
```

`preview.jsx` builds nine check comps: scale lineup, cutaway, engine bay with legs, exploded Merlin,
the technician on top, the droneship landing, the interstage (fins and thrusters), the helium bottles
in the LOX tank, and the base of the fuel tank.

## EffectCraft 0.14 lessons

- Nulls default to a `[50, 50]` anchor and children sit relative to it. `Scene.nul()` zeroes it, or
  every parented part shifts by 50 px (4 m at 12 px per metre).
- A parent null's Y Rotation did not reach its children; its Z Rotation does. A layer's own rotations
  apply Y before Z. So fins and legs carry their yaw in Orientation and their fold in Z Rotation.
- Axis mapping: three.js metres `(x, y, z)` → comp px `(960 + S·x, 540 − S·y, −S·z)`; Y and Z rotations
  flip sign.
- Rotations don't compose through deeper parents: a booster turned by a pivot leaves its fins, legs and
  engines behind. For any shot that turns the booster, use a rigid `assembly_*` model (fins and legs
  baked in), `flameFree()` for its flames, and highlights baked in the same space (`hl_fins_out`,
  `hl_leg1_landed_red`).
- Fading a model layer from 100 to below 100 opacity makes it pop (the render mode switches). Slide
  models in and out of frame at full opacity instead (the building, the upper stack, `openCut`).
- Model layers can't take effects or animated materials, so a highlight is a separate glowing copy
  grown by a small pad (so it never shares a surface and z-fights). It must match what's on screen:
  a nearly empty tank gets `hlFill()` at that level, not the full-tank highlight, and a cutaway shell
  highlight hides behind the opaque fuel, so use the whole-shell highlight there.
- Comp motion blur has no effect on nested comps; fast camera moves strobe. Use cuts and geometric
  dollies (`cameraPath` keys with `true`) instead.
- Shot comps are 2 frames longer than their slot, or a frame can fall between two shots and go black.

## Accuracy

Built as close to the real booster as public sources allow. The "3D model" table in
`research/falcon9-booster/facts.md` gives the source and tier of every feature; anything SpaceX has not
published (COPV count and position, exact Merlin and leg proportions) is marked illustrative. No logos or
markings.
