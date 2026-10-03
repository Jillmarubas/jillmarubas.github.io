# "Why people hate data centres": design system

Follow this exactly. Don't introduce colours, fonts or treatments that aren't listed here.

## Brief
- **Subject:** why towns fight data centres (bills, water, noise, land, the deal).
- **Audience:** a general YouTube audience. The format is a 16:9 Vox-style explainer, about 17 minutes long.
- **The job of every frame:** show the evidence the narration is talking about ("write to the visuals").
- **Direction:** a warm editorial paper collage. Cut-out paper pieces float over a paper desk, with soft real shadows. This is the user's white-paper look, carried over from their Pinterest references.

## Colour (tokens in `design.ts`)
| Token | Hex | Role |
|---|---|---|
| `paper` | #F2EEE6 | backdrop (textured `public/dc/paper.jpg`) |
| `card` | #FBF9F4 | cut-out pieces |
| `ink` | #1D1B18 | type, outlines, primary marks |
| `ink2` | #5A554C | secondary type, labels |
| `mute` | #A39C90 | recessive marks, grid, "other" data |
| `hum` | #E5401F | **the only accent.** Used for one word, one mark or one number at a time |

- There is no second hue. Water, money and power are all drawn in ink. The accent means "this is the point".
- Text is always ink, ink2 or mute, never the accent, except for the single key number of a chart.

## Type
| Role | Face | Use |
|---|---|---|
| Display | **Fraunces** 900 (headlines, chapter numerals), 600 italic (lead-ins) | big words and numbers, sparingly |
| Body and labels | **IBM Plex Sans** 500 / 700 | captions, chart labels |
| Data and sources | **IBM Plex Mono** 500, uppercase, tracked | kickers, source tags, axis ticks |
| Hand | **Caveat** 600 | Vox-style marker annotations (arrows, circles, "look at this") |

Banned: Inter, Poppins, Roboto and system fonts in this video.

## Layout (1920×1080)
```
┌──────────────────────────────────────────────┐
│ KICKER·MONO                                  │
│ Lead-in italic            ┌───────────────┐  │
│ KEY WORD (Fraunces 900)   │  evidence     │  │
│ caption (Plex 500)        │  (map/chart/  │  │
│                           │   collage)    │  │
│ SOURCE · MONO             └───────────────┘  │
└──────────────────────────────────────────────┘
```
- Text column on the left, 120 px margin, max 640 px wide. The evidence stage takes the right 60 %.
- **Break the grid:** chapter numerals and hero numbers bleed off the left edge.
- Spacing scale: 8, 16, 24, 32, 48, 64, 96.
- Corner radius is capped at 6 px. Paper corners are nearly square.

## Signature
**The hum line:** a thin vermilion waveform, the sound from the cold open. It threads the whole video: it draws on under the chapter titles, connects evidence to evidence, becomes chart lines, and flatlines at the end.

## Motion (the user's rules, from the motion-video skill)
- Pieces enter from the left, right, top or bottom, rotating as they glide, with a long soft settle and no overshoot. Consecutive pieces never share a direction.
- After landing, a piece keeps drifting a few pixels. Nothing freezes.
- At the end of a scene, pieces ease **toward the viewer**, left to right a few frames apart, growing, drifting outward and blurring as they pass the lens.
- A gentle breathing zoom on the whole desk, about 3 %, over each scene.
- Soft edge blur (focus in the middle), grain and a light vignette.

## Anti-examples
- Gradients, glassmorphism or neon glows.
- Stock icons in rounded squares.
- Coloured text.
- Dual-axis charts.
- A number on every data point.
- Emoji.
