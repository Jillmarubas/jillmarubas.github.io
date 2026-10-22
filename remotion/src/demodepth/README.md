# Depth-map parallax test

One archive photo, three ways to move a camera through it. The reusable code (component,
scene, prep script) lives in `../parallax/`; method B is the house default (motion-video SOP,
"Archive-photo parallax: method B"). Same 6 s move in all three (track
right, slight rise, push in, lens widening 48.5° → 52°).

| Composition | Method |
|---|---|
| `DepthA` | **Depth map only.** The whole photo is a mesh pushed back by the AI depth map. No cutting. |
| `DepthB` | **Hybrid.** Cut-outs (shack + family, front posts) as flat cards in front of the filled-in background; the background itself is bent by the object-free depth map. |
| `DepthC` | **No fill.** Same as B without filling the background, so the cut-out holes show. |

What it showed:
- **A** is fast and needs no cutting, but edges stretch where near meets far (hat, heads, posts).
- **B** is clean and still has real ground depth; it costs a cut-out and a fill.
- **C** shows why the hole behind cut-outs must be filled.

## Asset (source and license)
- Arthur Rothstein, *Farmer and sons walking in the face of a dust storm, Cimarron County,
  Oklahoma*, April 1936. Library of Congress (file 00241u, via Wikimedia Commons, which lists it
  as **public domain**).
  Commons: https://commons.wikimedia.org/wiki/File:Farmer_and_sons_walking_in_the_face_of_a_dust_storm,_Cimarron_County,_Oklahoma,_00241u.tif
- Depth model: Depth Anything V2 **Small** (`depth-anything/Depth-Anything-V2-Small-hf`,
  Apache-2.0). The Base and Large models are CC-BY-NC, so don't use them for commercial work.

## Re-run
```bash
# 1. Python tools (CPU is enough; the model runs in a few seconds per image)
python3 -m venv venv && venv/bin/pip install --index-url https://download.pytorch.org/whl/cpu torch==2.5.1
venv/bin/pip install transformers==4.46.3 pillow numpy opencv-python-headless==4.10.0.84
# 2. Photo: the 3840 px rendering of the Commons file above (send a User-Agent header)
curl -A "Mozilla/5.0 (jillmarubas.github.io)" -o dust.jpg "<thumburl from the Commons API, iiurlwidth=3840>"
# 3. Crop, depth, cut-outs, filled background -> public/demodepth/ (git-ignored)
venv/bin/python src/parallax/prep_depth.py dust.jpg public/demodepth --crop 0.038,0.960 --cy 0.585
# 4. Render (each about 3-4 min on a 4-core box without a GPU)
npx remotion render src/demodepth/index.ts DepthB out.mp4 --gl=swangle
```

## Notes for reuse
- The cut-out finder is a heuristic for photos with a clear ground: a pixel is an "object" when it
  is clearly nearer than the farther pixels in its row. Check the cut-outs on every new photo.
- OpenCV inpainting smears large holes. It's fine when the cut-out covers most of the hole, but for
  big reveals use a better fill (e.g. a LaMa-style inpainting model or a hand clean plate).
- `ThreeCanvas` only draws on frame changes and on creation, so mount it after textures load
  (see `../parallax/ArchiveParallax.tsx`), or frames come out black.
