# 3D realism recipes (Remotion + three.js)

Photorealism comes from four things: **real shape, real surface data, real light, and a real
camera**. Each recipe below works in Remotion's `@remotion/three` and renders on Lambda with
`--gl=swangle` (software WebGL, no GPU).

## 1. Light (the biggest lever)

| Look | Setup | Numbers |
|---|---|---|
| **White studio** (ref 1) | `RoomEnvironment` through a PMREM generator as `scene.environment`, plus one soft key light | env intensity 0.5–0.8; key `directionalLight` 1.5–2.5 from upper-left front; exposure 1.0–1.1 (ACES) |
| **Dark cinematic** (ref 2) | Rim light behind the subject plus a weak front fill, no environment (or env ≤ 0.15) | rim : fill ≈ **8 : 1**; warm rim `#ffb870`, cool fill `#8fa6ff`; black level ≤ 8 |
| **Window light** (ref 3) | A `spotLight` with a **projected gobo texture** (`light.map`, a stripe or leaf canvas) and a large penumbra, pointed at both the subject and the backdrop | angle 0.6–0.9; penumbra 0.8; stripes at a 35–45° diagonal; shadow contrast 25–35 % |
| **Space** | One hard sun light, ambient ≤ 0.03, faint blue earthshine | sun 3–3.6; earthshine 0.05; no fill (shadows go truly black) |
| **Product light-sweep** (ref 6) | Rotate or slide a narrow key light across the object over 20–40 frames, starting from darkness | key 0 → 3 over the sweep; rim steady at 1 |

Rules
- **One key light direction per scene.** Everything, including shadows and gobos, has to agree with it.
- **Tone map:** `ACESFilmicToneMapping`, and colour textures in sRGB (`tex.colorSpace = SRGBColorSpace`). Data maps (height, normal, roughness) stay linear.
- **Keep the palette monochrome and add one accent colour.** Every reference stays at or below 35/255 saturation.

## 2. Shadows

- **Contact shadow** (the most important one): a soft, dark ellipse right under the object that fades with height. Scale it by `1 - height/…` and set its opacity to about 0.45 on the ground.
- **Real shadow maps:** `castShadow` and `receiveShadow`, map size 2048 for the key and 1024 for spots, `shadow-bias ≈ -0.0005`, `normalBias 0.02`. PCFSoft shadows on the renderer.
- **Transparent floor that only shows shadows:** `ShadowMaterial` with opacity 0.2–0.35 over a CSS or backdrop gradient.
- **Gobo shadows** (window blinds, leaves): project the gobo from the key light *and* multiply a matching blurred 2D overlay onto the flat background, so the object and the paper share the pattern (ref 3's strongest realism cue).
- **Cut-outs on cards:** CSS `drop-shadow(0 34px 34px rgba(0,0,0,.28))` on the canvas or image. Bigger blur means higher above the surface.

## 3. Reflections and materials

Always give metals an environment map. Without reflections, metal renders black.

| Material | Settings |
|---|---|
| Chrome | `metalness 1, roughness 0.05–0.12`, env intensity 1 |
| Brushed steel | `metalness 1, roughness 0.3–0.4` |
| Gold | `color #e6b35a, metalness 1, roughness 0.2`, warm environment |
| Glossy plastic / 3D icon | `MeshPhysicalMaterial` with `clearcoat 1, clearcoatRoughness 0.1`, base `roughness 0.4` |
| Lacquered wood (chess piece) | Physical material, wood colour map, `roughness 0.35, clearcoat 0.6` |
| Matte clay (white heads) | `roughness 0.9`, colour `#f2f2f0`; soft environment only, no hard key |
| Paper / card | `roughness 1`, very slight bump from a noise texture |
| Moon / rock | Real colour map + displacement + normal map, `roughness 1` |
| Earth | Day map, cloud alpha layer (radius × 1.008), atmosphere rim shader (radius × 1.06, additive, only on the sunlit side) |

## 4. Real surface data

- **Real places:** NASA public-domain maps: the LRO Moon colour map, LOLA elevation, Blue Marble Earth plus a cloud layer. Convert them with `remotion/scripts/prepare-nasa-textures.py`, which outputs 4K JPG/PNG and computes a normal map from the height data.
- **Objects:** Poly Haven (CC0) photo-scanned models, textures and HDRIs. Load glTF/GLB with `GLTFLoader` and HDRIs with `RGBELoader` plus PMREM.
- **Heavy displacement:** use 512×256 segments on a hero sphere. Scale relief to about 1–2 % of the radius (real Moon relief is about 0.6 %; exaggerate slightly).
- **Load textures before the frame is captured:** `delayRender` → load → `setState` → release with `continueRender` **after React commits** (double `requestAnimationFrame`). Otherwise frames come out black.

## 5. Camera and lens (what makes it feel filmed)

| Effect | How | Numbers |
|---|---|---|
| Depth of field / rack focus | CSS `filter: blur()` on separate layers (foreground, subject, background) | foreground 6–14 px, background 3–6 px; rack from 20 px to 0 over 25–30 frames |
| Motion blur | Blur scaled to how far the object moved since last frame (`velocityBlur`); whip pans blur the whole stage | whip blur peaks at 26–30 px mid-move; objects about 0.1 px per px moved |
| Bloom | Additive radial sprite on light sources, plus a text glow (`text-shadow` 0 0 18 px) | sprite opacity 0.3 idle, up to 0.8 when looking straight into the light |
| Chromatic aberration | Duplicate text or image layers in red and cyan, offset 1–4 px, `mix-blend-mode: screen` | subtle 1–2 px (ref 1), stylised 2–4 px (ref 6) |
| Vignette | Radial gradient overlay | 25–45 % black at the corners |
| Film grain | Animated SVG `feTurbulence` noise overlay, re-seeded every frame | opacity 4–8 % |
| Light leak / flash | Full-frame warm gradient, `screen` blend | 4–8 frames up, 6–10 frames down |
| Letterbox | Black bars slide in | 8 frames, each bar about 8 % of the height |

## 6. Limits of Lambda (software WebGL)

- **Per-frame cost** at 1080×1920: simple 3D is about 2–3 s; 4K textures with displacement is about 5–6 s. At a 10-Lambda concurrency limit, use 8 workers.
- **Not available here:** ray-traced global illumination, true soft area shadows, caustics. For those, render the hero asset in **Blender Cycles on a GPU instance**, export a PNG sequence with alpha, and composite it in Remotion.
