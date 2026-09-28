# AI News Daily — 28 Sep 2026 · design brief

Follow this file exactly. Don't add any colour, font or treatment it doesn't list.

## Subject and job
A 10-minute YouTube roundup of six AI stories, read by Joey (ElevenLabs). The job:
make every sentence easy to follow by ear *and* by eye. **Every word of the script is
set on screen as Joey says it**, and each word animates on its own.

## Direction: Settle Motion, with the voice as the playhead
Built from `design-system/settle-motion/` (tokens.css and settle-motion.html). Near-black
night, grey photos in rounded night panels, white paper panels for quotes and story cards,
and one ambient green haze. Motion arrives fast and settles; nothing bounces except a
success.

Settle's second principle is "scroll is the playhead": headline words brighten as you
scroll. Here **the voice is the playhead**. Each phrase lands with its words at
word-floor (22%), and every word brightens the moment Joey says it.

## Tokens (`src/theme.ts`)
| Role | Value | Use |
|---|---|---|
| `night` | `#000000` | the ground |
| `night2` | `#151615` (raised `#1D201D`) | graphite cards on night |
| `onNight` / `onNight2` | `#F2F3F2` / `#9DA39F` | words once spoken / labels |
| `floor` | 22% of `onNight` | words on screen, not yet spoken |
| `paper` / `ink` | `#FEFEFE` / `#0A0C0B` | quote panels, story cards |
| `mint` | `#ABFEC1` | **active, live or done only**: the marker under the key word being said, the active story's rail segment, checks on finished list rows, "Subscribed ✓" |
| haze | mint at ≤ 14% | the one ambient colour, upper left |

Type: **Instrument Sans** 500 (600 for names and numbers) for every spoken word, with
tracking −0.04em. **Martian Mono** 400 for labels, dates, credits. Radius: 28 px panels
(32 → 18 while rising), 18 px rows, 999 px pills.

## Layout
```
STAGE                         SPLIT                           PHOTO
┌──────────────────────┐      ┌──────────────────────┐        ┌──────────────────────┐
│ brand          pill  │      │ brand          pill  │        │╭ night panel, grey ─╮│
│  (read, 16%)         │      │ (read)    ┌────────┐ │        ││ photo, slow push   ││
│ SPOKEN PHRASE ─ 540  │      │ PHRASE    │graphite│ │        ││ (read)             ││
│                      │      │           │ card   │ │        ││ PHRASE ── 930      ││
│ ─── story rail ───── │      │ ─── rail ─└────────┘ │        │╰─ credit ──────────╯│
└──────────────────────┘      └──────────────────────┘        └──────────────────────┘
```
Type is always left-aligned. Framed (portrait) photos sit right, and the words take the
split column.

## Signature
**The transcript scrolls.** Consecutive phrases are one column the browser lays out, so
lines never collide. The column glides up (11 f) to bring each new phrase to the reading
line. The phrase just read dims to 16% above it, and the one before that leaves.

## Patterns used (all from Settle's library)
- **Word scrub**: floor → lit per word, timed to the voice.
- **Blur-in stagger**: words and cards rise 24 / 48 px out of an 8 px blur on `settle`, 60 / 80 ms apart.
- **Counter tick**: numbers roll digit by digit, right to left, 30 ms apart, on `glide`. A number is never visible before it is said.
- **Panel rise**: photos, quotes and story cards rise from 105%, widening from .92 and tightening their corners 32 → 18.
- **Pinned index**: each story card is a paper panel whose index marker glides to the new story while its line redraws.
- **Logo intro**: once per film, letters rise from a mask 40 ms apart, hold 250 ms, then glide into the nav.
- **Orbit**: the one loop, 12 s per revolution, for "three labs" and "the same political orbit".
- **Button morph**: press .96 → collapse → spinner → mint "Subscribed ✓" with the snap overshoot (success only).

## Motion
- `settle` `cubic-bezier(.22,1,.36,1)`: every entrance.
- `glide` `cubic-bezier(.65,0,.35,1)`: scroll, markers, counters.
- `depart` `cubic-bezier(.55,0,1,.45)`: every exit, one step shorter (8 f).
- `snap`: success only.
- Words brighten 2 frames before they are heard. At most three things move at once.

## Audio
As in the SOP: music and SFX synthesised in code (`synth/`), VO at −16 LUFS, bed ducked
about 15 dB under the voice, a glitch only on the two escape moments.

## Do not use
Inter, Archivo or system fonts · the Frost Glass orange · glass, backdrop blur or glow ·
colour photos · mint for decoration or hover · centred type · emoji · AI-generated
people or images · company logos.

## Photo rules
Real photographs only, from Wikimedia Commons, graded to grey. Each is credited on screen
and in `public/photos/credits.json`. People appear only in stories about their
organisation, captioned with name and role. Illustrative places are labelled as
illustrative.
