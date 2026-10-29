# The Invisible Cassette — EffectCraft build

Built with EffectCraft 0.18.0 (compositing, 3D camera, effects) and PhotoCraft 0.17.0 (texture and cut-out prep), per the Small Print brief.

- `lib.jsx`: the rig (35 mm camera with DOF, Z +350 / 0 / −250, tungsten key, drop shadows, grain, vignette, dust, stamps, typewriter and rise text).
- `s1.jsx`: Scene 1 (cold open + title card). `breakdown-s1.html`: the shot-by-shot breakdown.
- Assets (git-ignored, regenerate with PhotoCraft):
  ```bash
  PC=photocraft-cli
  $PC run --new '{"width":3840,"height":2160,"background":"#808080"}' --cmd filter.noise.addNoise --params '{"amount":200,"distribution":"gaussian","monochromatic":true,"seed":3}' --cmd filter.blur.motionBlur --params '{"angle":1.5,"distance":420}' --cmd image.autoContrast --cmd filter.distort.wave --params '{"generators":3,"wavelengthMin":400,"wavelengthMax":900,"amplitudeMin":4,"amplitudeMax":14,"seed":2}' --cmd image.adjustments.gradientMap --params '{"stops":[[0,"#04060A"],[0.35,"#0A0D12"],[0.55,"#11131A"],[0.72,"#1B1714"],[0.88,"#2A1F17"],[1,"#3B2B1D"]],"dither":true}' --out assets/desk_oak.png
  $PC run --new '{"width":2400,"height":1600,"background":"white"}' --cmd filter.render.clouds --params '{"seed":11}' --cmd image.adjustments.gradientMap --params '{"stops":[[0,"#D5C5A6"],[0.6,"#E0D3BA"],[1,"#EBE2D0"]],"dither":true}' --cmd filter.noise.addNoise --params '{"amount":9,"distribution":"gaussian","monochromatic":true,"seed":5}' --out assets/manila.png
  ```
- Fonts: convert `remotion/public/fonts/*.woff2` to TTF in `~/.fonts` (fontTools) and run `fc-cache -f`; JetBrains Mono (system) supplies ▼ ▲.
- Build and render (absolute paths):
  ```bash
  effectcraft-cli script "$PWD/s1.jsx" --empty --save-as "$PWD/s1.ecproj"
  effectcraft-cli render --project "$PWD/s1.ecproj" --comp Scene1 --out "$PWD/render/s1-half.mp4" --format h264 --resolution half --audio off --progress
  ```
- Sound: `remotion/scripts/mix_ic.py remotion/src/invisible-cassette/cues_s1.json` (same film times).

Lessons: a text layer created empty renders nothing even with a Source Text expression (create it with its full string); shape groups draw first-on-top; EffectCraft holds the first opacity key backwards, so pin a 0 key at time 0 for anything that appears later.
