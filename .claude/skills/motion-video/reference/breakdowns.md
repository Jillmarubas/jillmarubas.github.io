# Reference breakdowns

Six vertical short-form motion-graphics videos, studied frame by frame (contact sheets at
4 fps, plus native-frame-rate measurements). This file records **techniques and numbers
only**. We never reuse the references' footage, photos, logos, characters or scripts.

Method: every frame was downscaled to 90×160 and diffed against the previous frame. A
spike in mean difference is a hard cut. A run of frames above the median difference is a
"move". Luma, contrast and saturation are averaged over the whole clip.

## Summary table

| # | Topic / look | fps | Length | Hard cuts | Mean shot | Luma (0–255) | Saturation | Typical move |
|---|---|---|---|---|---|---|---|---|
| 1 | Tech explainer, white studio, 3D icons | 59.94 | 19.3 s | 12 | 1.48 s | 214 (bright) | 4 (mono) | constant slow drift + quick pops |
| 2 | Cinematic essay, dark, gold/red | 25 | 23.5 s | 6 | 3.36 s | 41 (dark) | 35 (one hue per scene) | 420 ms, peak speed at 20 % |
| 3 | Quote / motivation, cream paper | 60 | 17.2 s | 5 | 2.86 s | 135 | 13 | 600 ms, ease-in-out |
| 4 | Listicle on black, chrome type | 30 | 21.3 s | 3 | 5.33 s | 17 (near black) | 11 | 383 ms, ease-in-out |
| 5 | Archival documentary, grey | 24 | 17.5 s | 10 | 1.59 s | 117 | 1 (pure grey) | 375 ms, ease-in-out |
| 6 | Editorial poster, B/W + one accent | 30 | 20.0 s | 6 | 2.86 s | 144 | 8 | 433 ms, ease-in-out |

**Patterns shared by all six**
- **Near-monochrome.** Saturation stays between 1 and 35 out of 255. Colour is a single accent (gold, red or orange) used on one word or object at a time.
- **Holds matter as much as motion.** About 55 % of the runtime is near-still, so the viewer can read.
- **Moves take 380–600 ms**, which is 11–18 frames at 30 fps or 23–36 at 60 fps.
- **Easing:** most moves peak in speed halfway through (ease-in-out). Cinematic video 2 peaks at 20 % instead, a fast start with a long settle (ease-out).
- **Length:** 17–24 s, with a new beat every 1.5–3.5 s.
- **Frame rate follows genre:** 24/25 fps for cinematic or documentary, 30 fps for listicles and posters, 60 fps for glossy tech and quotes.

---

## 1 · Tech explainer on white (59.94 fps)
- **Stage:** pure white (luma about 250), no texture. Depth comes only from soft contact shadows.
- **Ghost word:** a giant word in 8–12 % grey sits behind the subject, and the subject overlaps it. It's revealed by fading and sliding up about 40 px.
- **Headline:** a small word next to a big word ("small/BIG" pairing). The letters fade in over 8–10 frames at 60 fps with a blur trail.
- **Floating 3D tiles** (glossy app-icon tiles with bevelled edges) sit in opposite corners, cut off by the frame. They rotate ±8° and drift about 20 px per second, never stopping. Soft shadows fall down-right.
- **Screen pop-out:** UI cards pop out of a phone screen one after another (about 4 frames apart). Each scales 0.9→1, lifts off the screen and gets a bigger, blurrier shadow as it rises.
- **Breaking the frame:** a car drives *through* a rounded card. It's in front of the card's lower edge but behind its top, so it reads as 3D.
- **Push-in cut:** the camera pushes into a screen until the footage on it fills the frame.
- **Chromatic aberration:** 1–2 px of pink/green fringing on high-contrast edges, a subtle "lens" cue.
- **Glossy 3D icons** (clipboard, cross) with soft ambient occlusion and a white-studio reflection.
- **Ending:** matte white 3D heads frame the top and bottom, with soft lighting and no hard shadows. The call to action is a thin serif that fades in word by word.

## 2 · Cinematic essay, dark (25 fps)
- **Rack focus opening:** a mask floats toward the camera from heavy blur (about 20 px) to sharp over about 1 s. Hands reach in from the corners with motion blur.
- **Text behind the object:** a tall, condensed, thin word stands behind the hero object.
- **Flash transition:** a warm white bloom over 6–8 frames, then a hard cut to a new colour world.
- **Grade per scene:** red monochrome, then black and gold, then sepia, then red again. Each scene gets one hue and deep blacks (luma 41 on average).
- **Hero objects:** a gold crown on a red marble column, coins with raised faces, a diamond under a cloche. Each is rim-lit from behind, with bloom on the highlights and a strong vignette.
- **Light trail:** a thin red arc sweeps across in about 20 frames, leaving a glow.
- **Text on black:** plain words on black between scenes; white, with the key word in the accent colour.
- **Volumetric light:** a warm pool of light behind the subject, with fog/clouds and candles as practical lights.
- **Ending:** a glowing word that flickers, a slow push-in on the figure, and an orange film-burn over 5–8 frames.
- **Moves:** peak speed at 20 %. Objects arrive quickly and then settle slowly, which is what feels "cinematic".

## 3 · Quote video on cream paper (60 fps)
- **Window-blind shadow:** diagonal soft stripes of light and shadow across the whole frame, **falling on the objects too** (a chess king gets the same stripes). This was the strongest realism cue in the whole set.
- **Giant 3D word:** a huge grey word, extruded and skewed in perspective, behind the text.
- **Text pairing:** a thin serif lead-in line over a heavy sans key word. Letters resolve left to right from a blur, with the last 2–3 letters still blurred while the first are sharp (about 12 frames at 60 fps).
- **Props** (pocket watches, sunflowers, a chess king) are cut off by the frame edges, with deep soft shadows, floating dust specks and film grain.
- **Line art:** thin arcs and circles draw on, plus ✦ sparkles and a long thin star streak.
- **Colour-flash transitions:** warm orange, cyan-white and magenta light leaks, each 4–8 frames.
- **Punch-in:** the text scales to about 2× and slides past the camera.
- **Iris ring:** a blurred white ring expands from the centre over about 1.25 s and reveals the next line.
- **Dark scene** with a floating 3D figure and debris, plus rainbow sparkles from chromatic aberration.

## 4 · Listicle on black (30 fps)
- **Repeating module** (5 repeats): title → logo → dotted arrow grows down → value word → product bursts in → "NOT ___" label. Each module is about 2.2 s.
- **Title tracking-in:** letters start about 3× wider apart and pull together into a tight word over about 8 frames. The chrome/gold gradient text has a bevel and a soft glow.
- **Dotted arrow** grows downward over 6 frames.
- **Burst reveal:** radial white spikes rotate and expand while the product scales from blurred to sharp. The label sits *in front of* the product.
- **Background:** very dark, with a faint grid and a vignette (luma 17 on average).
- **Opening:** a big glowing yellow disc rises behind a black-and-white cut-out figure, which fades in from blur.
- **Ending:** single words replace each other in the centre every 6–10 frames. The final word gets a gold glint sweep plus a script subtitle.
- **Note:** this reference uses real brand logos and product photos. **We never do that.** Use original marks, or the client's own.

## 5 · Archival documentary (24 fps)
- **Pure greyscale** (saturation 1). The background is an old typed letter with handwriting, drifting very slowly.
- **Framed photo:** the photo sits in a grey card, **rising up from the card's bottom edge** (masked reveal), then the card scales up. The subject then **breaks out of the card's top edge** (the cut-out sits over the card). That gives a 2.5D pop.
- **Big, soft drop shadows** under the cards (about 60 px blur, 35 % opacity).
- **Word stacks** in mixed sizes; each word drops in with blur.
- **Hand-drawn annotations:** arrows and an ellipse drawn around a key word, in white pen with a stroke-draw effect.
- **Typewriter** text with a blinking cursor. A giant ghost word sits behind.
- **Taped photo:** tape strips on the corners, and the photo inside **swaps every 12 frames (0.5 s)** as a rapid montage.
- **Defocus transitions:** the whole frame blurs out and the next one blurs in, over about 8 frames.

## 6 · Editorial poster, B/W with one accent (30 fps)
- **Opening:** an anamorphic lens-flare streak blooms into a white blob (6 frames), which reveals the scene.
- **Poster layout:** a serial number, barcode, info boxes, plus-marks and a grid. The frame is designed like a printed poster.
- **Heavy chromatic aberration** on the display type (2–4 px red/cyan split).
- **Clone echo:** copies of the same subject step out from behind, each one offset and larger. The photo also breaks out of its card.
- **Foliage shadow:** a leaf-shaped shadow overlay moves slowly across the paper.
- **Letterbox bars** slide in (about 8 frames) for a cinematic beat.
- **Chrome 3D props** (a knife, a trophy with laurel) with sharp studio reflections.
- **Rotating 3D cube** inside a dotted circle on a grid.
- **Light-sweep product reveal:** the product starts in darkness, then a light sweeps across it over about 1 s, with the large word behind it.
- **Black iris wipe:** a circle grows from a point until it fills the frame (about 8 frames).
- **Ending:** a 3D booklet mockup with the call to action, then a defocus fade.
