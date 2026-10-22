# Motion graphics, compositing and overlays (detail)

Sources: the user's reports *Advanced Motion Graphics and Post-Production Workflows* (full text in
`source-motion-graphics.md`) and *Advanced Video Compositing and Overlays*. Each section ends with
how we do it in this repo (Remotion / HyperFrames / three.js / ffmpeg).

## Interpolation: value graph vs speed graph
- **Value graph:** the property's value over time. The slope is velocity. Use it for exact numbers
  and for **overshoot** (the value passes the target, then settles). Separate the X and Y dimensions
  to shape each axis on its own, for example a bouncing ball.
- **Speed graph:** velocity over time. Ease-ease is a bell curve from 0 up to a peak and back to 0.
  Handle length is *influence*: how long the current acceleration lasts. Pulling handles too far
  makes the curve dip below 0, so the object reverses (an accidental bounce).
- **Manual overshoot in After Effects:**
  1. Easy Ease (F9).
  2. Separate Dimensions.
  3. Open the Value Graph.
  4. Alt-drag the last keyframe's incoming handle past the target value.
  5. Handle length sets how big and how long the overshoot is.
- **Repo:**
  - Remotion: `interpolate(frame, [a, b], [v0, v1], {easing: Easing.bezier(...)})`. Overshoot with
    `Easing.bezier(0.34, 1.56, 0.64, 1)` or `spring({damping: 12})`.
  - GSAP: `back.out(1.4)`.
  - AE-like keyframes with per-segment easing: `remotion/src/cc1003/ae.tsx` (`kf`).

## Time: shutter, speed ramps, optical flow
- **180° shutter rule:** shutter = 1/(2 × fps), so 1/48 s at 24 fps and 1/60 s at 30 fps.
  Shutter angle = fps × 360 / shutter speed. Set virtual cameras to 180° so CG blur matches live
  action. Repo: `MotionBlurRenderer` (`cola/motion3d.tsx`) and `Layer` (`cc1003/ae.tsx`) already use 180°.
- **Clean slow motion:** high-fps footage conformed 1:1, e.g. 120 → 24 fps = 20% speed. Slower than
  that needs invented frames:
  - Nearest frame: sharp but staccato judder.
  - Frame blending: ghosting.
  - Optical flow (speed warp): best on linear motion. It melts on occlusions, busy backgrounds and
    footage with too little motion blur. Fix with manual spline warps or added motion blur.
- **Speed ramps:**
  - Premiere: Time Remapping (rubber band, split keyframes for a bezier ramp).
  - Resolve: Retime Controls, then Retime Curve, with process set to Optical Flow.
  - CapCut: Speed, then Curve presets ("Flash In", "Hero"), plus the smooth slow-mo toggle.
- **Repo:** in Remotion, remap time by computing the source frame from a curve,
  `<OffthreadVideo startFrom>` / `<Video playbackRate>`; for generated scenes, just ease the time variable.

## Kinetic typography
- **AE Text Animators + Range Selector** (Start/End/Offset across characters, words or lines). Shape:
  - Square + 0% smoothness = typewriter.
  - Ramp Up/Down = gradient.
- **Ease High** = easing into the fully selected state; **Ease Low** = easing out of the unselected state.
- **Organic cascade:**
  1. Animate Opacity 0% and Position +50 px down.
  2. Set Shape to Ramp Up.
  3. Set Ease High and Ease Low to 50%.
  4. Animate Offset from −100% to 100%.
- **Wiggly Selector** on top adds Perlin-noise variation to only the selected letters.
- **Expression Selector:** the default is `selectorValue * textIndex/textTotal`.
  - `if (textIndex == Math.floor(time)) 100 else 0` reveals one letter per second.
  - Penner easing equations work inside it.
  - `frames = 1/thisComp.frameDuration` makes timing fps-safe.
- **Resolve Fusion:** `Text+` with the **Follower** modifier staggers by character, word or line.
  Animate in the Follower's Transform tab so all 8 shading layers move together.
- **Repo:** per-character spans with a stagger.
  - Remotion: `AText` in `cc1003/ae.tsx`, `TypeText` / `WordRise` / `ScatterText` in `promo/motion.tsx`.
  - HyperFrames: a GSAP stagger.
  - Never tween `letter-spacing`; move each glyph's `x`.

## Paths, shapes, Lottie
- **Vector path** = vertices + in/out tangents. AE `createPath(points, inTangents, outTangents, closed)`;
  `pointOnPath()`, `tangentOnPath()`.
- **Linking line between two moving layers:**
  `var p1 = thisComp.layer("Target 1").toComp([0,0]); var p2 = thisComp.layer("Target 2").toComp([0,0]); createPath([p1, p2], [], [], false);`
- **Trim Paths** on multi-path shapes: Simultaneously vs Individually (sequential).
- **Lottie** (Bodymovin JSON) is resolution-independent and tiny next to GIF or APNG.
  **dotLottie** (`.lottie`, `application/zip+dotlottie`) bundles animations, themes, state machines
  and images:
  - Up to 10x smaller.
  - ThorVG runtime (WASM on the web, native on iOS/Android): about 70% less memory, 120 fps.
  - Interactive states declared in the file, with no JS.
- **Repo:** in Remotion, `DrawPath` / `Draw` (trim paths) and SVG paths computed from live positions
  each frame. HyperFrames plays Lottie via `window.__hfLottie`.

## Character rigging
- **FK:** a parent-child rotation chain. Good for arcs: swinging arms, swimming, whips.
- **IK:** solve the joint angles from the end point. Needed for planted feet and hands on walls.
- **Duik Angela** (free): nulls and expressions on your artwork. Very versatile (quadrupeds, faces)
  but heavy in the viewport and slow to render.
- **Limber:**
  - Each limb is a single procedural shape layer with two controllers, so it's fast.
  - IK↔FK blend slider with a "Match" snap.
  - **FreeK** mode keeps both the shoulder and the wrist planted while the elbow moves.
- **Repo:** 2D characters are code-drawn (see `motion-video/reference/vector-story-film.md`). Use
  2-bone IK math (law of cosines) for planted limbs and FK for swings.

## 2.5D parallax, depth maps, camera tracking
- **Manual:**
  1. Cut foreground, mid and background.
  2. **Rebuild the background behind the cut-out** (content-aware fill or clone).
  3. Spread the layers in Z.
  4. Move a 3D camera.
- **AI depth:** Depth Anything V2 turns one image into a grayscale map (white = near, black = far).
  Use it as a displacement map for instant 2.5D (AE Displacement Map, VoluMax 7, CapCut "3D Zoom Pro").
  - Optics Compensation (a keyframed FOV) adds a dynamic lens warp to the move.
- **Video:** per-frame depth flickers and "boils". Use **Video Depth Anything** (CVPR 2025:
  spatial-temporal head with a temporal gradient matching loss) for depth that stays stable over time.
- **3D camera tracking** (Fusion `CameraTracker`, Resolve Studio Depth Map node) needs real parallax
  in the shot; a tripod pan won't solve.

| Tracker | Tracks | Fails on | Use |
|---|---|---|---|
| Point | 2D X/Y | Perspective changes | Pinning simple text |
| Planar | Flat surfaces (rotation, scale, perspective) | Curved surfaces | Screen replacements, rigid HUDs |
| Camera | 3D camera path + point cloud | Locked-off shots (no parallax) | 3D objects in live plates |

- **Repo:** `remotion/src/demo25d/` (three.js and CSS 3D versions, plus a HyperFrames version) and
  the `motion-video` 2.5D camera. A depth-map displacement could be a three.js plane displaced by a
  depth texture. No depth model is installed yet; add one before promising AI depth.

## Audio-driven motion
- **AE:** Convert Audio to Keyframes → keep "Both Channels". Then
  `var a = thisComp.layer("Audio Amplitude").effect("Both Channels")("Slider"); var s = linear(a, 0, 25, 100, 150); [s, s];`
  Add `clamp()` against spikes and `smooth(0.1, 5)` against jitter.
- **AI beat sync** (e.g. FlyU.ai) maps BPM, energy and song sections. A drop fires a cut, a shake and
  a brightness shift together.
- **Sound for motion:** a whoosh under wipes, a riser before a structural change, an impact or
  sub-boom on the hard cut. J/L cuts and audio match cuts (a scream into a train whistle) bridge scenes.
- **Repo:** `@remotion/media-utils` `getAudioData` + `visualizeAudio`, smoothed over a few frames,
  then `interpolate(..., {extrapolateRight: 'clamp'})`. HyperFrames: `hyperframes beats` writes beat
  times to drive cuts.

## Overlay types
- **Atmospheric / optical:** light leaks, film burns, grain, flares, dust. These use blend modes and
  mask harsh digital cuts.
- **Graphic / informational:** lower thirds, HUD, type, motion graphics. These need precise alpha.
- **Transitional:** graphic, action and audio match cuts. Example: a draining tub dissolving into an eye.
- **Geometric / depth:** depth maps, displacement, point clouds.

## Codecs for transparency
| | ProRes 4444 | WebM VP9 + alpha |
|---|---|---|
| Chroma | 4:4:4:4 | 4:2:0 + alpha |
| Depth | 12-bit RGB + 16-bit alpha | 8/10-bit |
| Compression | Visually lossless, intra-frame (smooth scrubbing) | Heavy, inter-frame |
| Size | ~1–5 GB/min | Small |
| Support | Premiere, Resolve, FCPX | Premiere 23+, Resolve, OBS; CapCut can halo |
| Use | Professional post, VFX | Web, streaming, light edits |

## Alpha: straight vs premultiplied
- **Straight (unmatted):** RGB is stored raw; a 50% red pixel is (255, 0, 0, 127). It looks jagged in
  players without alpha support but composites cleanest.
- **Premultiplied (matted):** RGB is multiplied by alpha against a background, usually black; the same
  pixel is (127, 0, 0, 127). Read as straight, it gets darkened twice, giving a **dark halo**.
- **Fix:** Interpret Footage, then the correct alpha type (Premiere/AE), or Fusion `Matte Control` to
  unpremultiply, despill or restore fringes, then re-premultiply.
- **Mattes:**
  - Alpha matte: the top layer's transparency is the stencil (text reveals, logo wipes).
  - Luma matte: brightness is the stencil (white = show, black = hide). Use it for B/W ink and
    brush transitions.
  - Premiere: Track Matte Key with Composite using Alpha or Luma. Use adjustment layers for a grade
    or grain across many cuts.

## Blend modes (a = blend layer, b = base, 0–1)
| Mode | Formula | Does | Typical use |
|---|---|---|---|
| Multiply | a·b | Darkens, white disappears | Grunge, ink, paper, film borders |
| Screen | 1−(1−a)(1−b) | Lightens, black disappears | Light leaks, flares, film burns, fire |
| Linear Dodge (Add) | a+b | Strong lightening, clips at 1.0 unless 32-bit float | HUD glow, lasers, magic |
| Overlay | b<0.5: 2ab; else 1−2(1−a)(1−b) | Contrast, keyed on the base | Grain, texture sharpening |
| Hard Light | Same as Overlay, keyed on the blend layer | Harsh contrast | Stylized looks |
| Soft Light | Gentle gamma-like dodge and burn | Soft texture | Subtle grain |
| Difference | abs(a−b) | Inverts by luminance | Aligning plates, stylized effects |

**Repo:** CSS `mix-blend-mode` (`multiply`, `screen`, `plus-lighter`, `overlay`, `soft-light`,
`hard-light`, `difference`). CSS blends in sRGB gamma, so do hero glows in WebGL (linear) or keep
additive overlays subtle.

## Bit depth, linear light, color management
- **8-bit:** 256 levels per channel (16.7M colors). Soft gradients **band**.
- **16-bit:** 65,536 levels per channel. No banding while compositing.
- **32-bit float, linear:** values above 1.0 survive (no clipping during Add), and blends and blurs
  match real light mixing (no muddy fringes). Gamma-space math gives dark fringes on bright mixes.
- **ACES / ACEScct:** scene-referred AP1 working space with a film-like toe; highlights don't
  hard-clip while you work.
- **HDR (Rec.2020, ST.2084 PQ):** overlays can hit 4,000–10,000 nits. Dolby Vision L1 metadata
  (min/mid/max per shot) tone-maps each shot dynamically; static tone mapping can crush shadows.
- **Repo:** Chrome renders 8-bit sRGB. Keep the grain/dither layer on dark gradients and use a low
  CRF; three.js scenes render in linear and then tone-map (ACES) inside WebGL.

## Accessibility: photosensitive epilepsy (WCAG 2.3.1)
- No more than **3 flashes in any 1 s**.
- A flash is a pair of opposite changes in relative luminance of ≥10% of the maximum, where the
  darker image is below 0.80.
- **Saturated red** has a stricter threshold.
- Avoid strobing type, binary opacity wiggles and looping flash GIFs; ease instead.
- **Repo:** `scripts/flash_check.py`.

## Platform cheat sheet
- **Premiere:** layer timeline. Track Matte Key for text reveals. Interpret Footage for alpha.
  Adjustment layers for global looks.
- **Resolve:** Edit-page Composite Mode for basic blends; Fusion nodes for real compositing
  (`Merge`, `Matte Control`, trackers, `Depth Map` in Studio).
- **After Effects:** 2.5D parallax, depth displacement, VoluMax 7, Optics Compensation.
- **CapCut:** one-click 3D Zoom Pro (internal depth map), speed curves with smooth slow-mo, blend modes
  in the Inspector. WebM alpha sometimes halos; use ProRes 4444.
