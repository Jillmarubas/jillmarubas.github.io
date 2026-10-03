# AI News, 1 Oct 2026: design system

A 16:9 Vox-style news explainer in the **paper collage** look, with a suspense mood. Follow
the SOP's "Vox-style rules set by the user" (24 fps, real photos, 3D logos, show-don't-type,
place replicas, nothing generic).

## Mood
A late-night newsroom desk: warm paper under a single desk lamp, dark falloff at the edges,
slow drifting light. Suspense comes from the light, the music and the pacing, never from
"hacker" visuals.

## Colour (`design.ts`)
| Token | Hex | Role |
|---|---|---|
| `paper` | #E9E1D2 | desk paper (textured `public/dc/paper.jpg`) |
| `card` | #FAF6EE | cut-out pieces, photo borders |
| `ink` | #191714 | type, outlines |
| `ink2` | #5A544A | secondary type, labels |
| `mute` | #A69E90 | recessive marks |
| `red` | #C8261D | **the only accent**: one mark, number or word at a time (stamps, circles, highlighter) |
| `tape` | #E8D9A8 | masking tape |

**Brand colours appear only on the brands' own logos,** which are reproduced exactly (see `ASSETS.md`).

## Type
| Role | Face |
|---|---|
| Names, numbers, headlines | **Fraunces** 900 / 600 italic |
| Labels | **IBM Plex Sans** 500 / 700 |
| Sources, kickers, credits | **IBM Plex Mono** 500, uppercase |
| Quotes and annotations | **Caveat** 600 (marker hand) |

On-screen text is limited to names and titles, quoted words, numbers and sources.

## Objects
- **People:** real licensed photos, printed on a paper card with a white border, taped to the desk, with a name strip and a credit in small type.
- **Logos:** official vector marks extruded in 3D (`Logo3D`), lit by a warm key light and a cool rim, casting a soft contact shadow on the paper.
- **Places:** 3D replicas (White House north front, FTC Apex Building) with their real surroundings (lawn, fountain, elms, fence, street trees, lamps).
- **Props:** drawn as paper cut-outs (documents, calendar pages, phone, money, bell, flask), never clip art.

## Motion (24 fps)
- Pieces glide in from a side, rotating, settle in 18–22 frames with no overshoot, then keep drifting.
- Accent moves (stamps, circles, counters): 9–14 frames.
- Scene exit: pieces ease toward the viewer, blurring past the lens (20 frames).
- Camera: a slow push of up to 6% per scene; the lamp light drifts across the desk.
- Chapter cards: segment number and title on a torn paper strip, with a red rule drawing on.
