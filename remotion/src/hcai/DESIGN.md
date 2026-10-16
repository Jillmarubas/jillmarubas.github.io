# "The Hidden Cost of AI": design system

The paper-collage look of `src/dc` ("Why people hate data centres"), carried over. Follow this exactly. Don't introduce colours, fonts or treatments that aren't listed here.

## Brief
- **Subject:** what it physically takes to answer one AI question: the buildings, the power, the water, the hidden workers, the rocks, and who pays the bill.
- **Audience:** a general YouTube audience. The format is a 16:9 research documentary, about 34 minutes long (1920×1080, 24 fps).
- **The job of every frame:** show the thing the narrator is saying, on the word it is said (`shots.txt`, timed by `timing.json`).

## Colour (tokens in `design.ts`)
| Token | Hex | Role |
|---|---|---|
| `paper` | #F2EEE6 | backdrop (textured `public/dc/paper.jpg`) |
| `card` | #FBF9F4 | boards and cards |
| `ink` | #1D1B18 | type, outlines, primary marks |
| `ink2` | #5A554C | secondary type, labels |
| `mute` | #A39C90 | recessive marks, "other" data |
| `hum` | #E5401F | **the only accent.** One word, one mark or one number at a time |
| `night` | #121214 | the late-night chat screens (full frame) |
| `nightInk` | #ECE8E1 | type on `night` |

- Each chapter has its own grade (`GRADE`, brightness and saturation), following the tension curve. "The hands" is the darkest and least saturated; "The other side" is the lightest.

## Type
| Role | Face | Use |
|---|---|---|
| Display | **Fraunces** 900 | key words and numbers, chapter titles |
| Body and labels | **IBM Plex Sans** 500 / 700 | captions, chart labels |
| Data and sources | **IBM Plex Mono** 500, uppercase, tracked | kickers, credits, source tags |
| Hand | **Caveat** 600 | marker notes on boards |

## Pieces (`kit.tsx`)
- **Photos** are prints: a white border, a strip of tape, the credit underneath.
- **Cut-outs** are stickers with a thin white edge. People are cut-outs with a name and role strip.
- **Logos** sit on a small white card, flat (no 3D).
- **Words and numbers** are typeset in Fraunces, never a verbatim copy of the narration: keywords and figures only.

## Staging (`Film.tsx`)
- The newest piece lands centre-stage on its word; the one before steps aside and shrinks; older ones recede and blur.
- Boards (`specials.tsx`: maps, charts, the chat window, the bill, the chain) take the full stage. Pieces that arrive while a board is up dock beside it.
- Text pieces leave when the next piece arrives. A "clear" in `shots.txt` empties the stage on a topic change, with a soft swoosh.
- The camera pushes in slowly with parallax between layers (a camera move, not a zoom).
