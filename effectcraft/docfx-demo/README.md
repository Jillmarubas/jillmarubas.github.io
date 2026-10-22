# docfx demo, built in EffectCraft (no Remotion)

The same 16 s effects demo as `remotion/src/docfx/DocFxDemo`, rebuilt entirely in
[EffectCraft](https://github.com/storytold/effectcraft) from After Effects-style scripts:
3D layers and cameras, lights, shape layers, text animators, Source Text expressions,
Glow, Gradient Wipe, Fractal Noise, CC Particle World, CC Vignette, Noise, Exposure, Tint,
motion blur and audio layers.

| File | Builds |
|---|---|
| `lib.jsx` | Helpers: import, comps, keyframes with ease, effects by name, SVG path → Shape, soft-light tint |
| `shotA.jsx` | Archive photo pull-back through 3D cut-out layers + decode title (Source Text expression) with orange Glow |
| `shots.jsx` | 3D building in a void (spot + ambient light, dust particles, glow pool), over-the-shoulder, face-off, lineup, bill/coin rain, transition gradients |
| `build.jsx` | The main 16 s timeline: ink wipe (Gradient Wipe + lagging black front), money rain + dip, melt dissolve, grain + vignette, whooshes |

## Run
```bash
# assets next to the scripts (git-ignored):
mkdir -p assets
cp ../../remotion/public/demodepth/{clean,obj_mid,obj_near,photo}.png assets/   # from parallax/prep_depth.py
cp ../../remotion/public/sfx/whoosh7.mp3 assets/                                 # CC0
# the title font (EffectCraft reads system fonts): convert the repo's Fraunces to TTF
python -c "from fontTools.ttLib import TTFont; f=TTFont('../../remotion/public/fonts/Fraunces-900-normal.woff2'); f.flavor=None; f.save('$HOME/.fonts/Fraunces-Black.ttf')" && fc-cache -f
# build and render (absolute paths: #include needs the script's folder)
effectcraft-cli script "$PWD/build.jsx" --empty --save-as "$PWD/demo.ecproj"
effectcraft-cli render --project "$PWD/demo.ecproj" --comp Main --out "$PWD/demo.mp4" --format h264
```
Measured 22 Oct 2026 (v0.14.0, 4-core cloud box, no GPU): 104 layers in Main; the 16 s 1080p
render took 6 min; flash check passes.

The silhouettes are placeholders drawn in code; films use licensed cut-outs. The demo is a
feature test, not a template (references guide, never imitate).
