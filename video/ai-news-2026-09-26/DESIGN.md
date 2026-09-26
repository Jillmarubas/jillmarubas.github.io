# AI News Daily — 26 Sep 2026 · design brief

Follow this file exactly. Don't add any colour, font or treatment it doesn't list.

## Subject and job
A 10-minute YouTube roundup of five AI stories, read by Joey (ElevenLabs). The job:
make every sentence easy to follow by sound *and* by eye. **Every word of the script
is set on screen as Joey says it**, and each word animates in on its own.

## Direction: dark-technical broadcast on Frost Glass
Built from `design-system/frost-glass/frost-glass-layer.html`, the layer running on the
portfolio: an orange aurora drifting behind everything, dark frosted surfaces with a lit
rim on top, and grain so the gradients never band. Motion follows the Settle Motion
curves in `design-system/settle-motion/tokens.css`.

## Tokens (`src/theme.ts`)
| Role | Value | Use |
|---|---|---|
| `ground` | `#0a0a0a` + warm floor `#1a0d05 → #0d0a08 → #140a10` | background under the field |
| `accent` | `#fa5a05` | the only accent: key words, numbers, rails, active rows |
| `accentHi` | `#ff7a2e` | accent text on glass, underline glints |
| `text` | `#f3efe9` | all body words |
| `text2` | `#9c948b` | labels, captions |
| `danger` | `#ff5a5a` | story 4 breach marker only |
| glass fill | `rgba(12,10,8,.55)`, rim `rgba(255,255,255,.14)`, lit rim `.30` | panels |

Type: **Archivo 900** for every spoken word, **IBM Plex Mono 500** for labels, chips,
credits and timecodes, **IBM Plex Sans 500/600** for short supporting copy in panels.
Radius: 18px panels, 10px chips, 999px pills. Nothing larger.

## Layout
Three modes, chosen per on-screen phrase:
```
STAGE                         SPLIT                           PHOTO
┌──────────────────────┐      ┌──────────────────────┐        ┌──────────────────────┐
│ brand          label │      │ brand          label │        │ photo, full bleed    │
│                      │      │ words     ┌────────┐ │        │ slow push-in         │
│ WORDS, LARGE,        │      │ words     │ glass  │ │        │                      │
│ LEFT-ALIGNED         │      │ words     │ media  │ │        │ WORDS, LOWER LEFT    │
│                      │      │           └────────┘ │        │ credit ─────────── ▸ │
│ ─── progress rail ── │      │ ─── progress rail ── │        │ ─── progress rail ── │
└──────────────────────┘      └──────────────────────┘        └──────────────────────┘
```
Type is always left-aligned and never centred.

## Signature
**Words land through frost.** Each word rises about half an em, sharpening from a
12px blur, on the `settle` curve. Key words and names land in orange with a snap
overshoot and an underline that wipes in. Numbers count up. When a phrase has been
said it leaves on `depart`, moving up and blurring, while the next one rises in
underneath. That handover is the moment people should remember.

## Motion
- `settle` `cubic-bezier(.22,1,.36,1)`: every entrance.
- `depart` `cubic-bezier(.55,0,1,.45)`: every exit, one step shorter than the entrance.
- `snap` `cubic-bezier(.34,1.56,.64,1)`: key words only.
- Words start 2 frames before they are heard, so the eye lands with the ear.
- At most three things move at once; panels and photos only change at phrase boundaries.

## Audio
- Music and SFX are synthesised in code (`synth/`). Nothing is sampled, and nothing
  comes from a generative model.
- VO: about −16 LUFS integrated, never clipped.
- Music bed: ducked to about −31 LUFS under speech, lifted about 9 dB on cards and
  stings, 1 s fade in and 3 s fade out.
- SFX: whoosh on layout changes, tick on counted numbers, impact on story cards, a
  riser into each card, glitch in the breach story only, shutter on photo reveals.
  All sit below the voice.

## Do not use
Inter, Roboto or system fonts · purple or blue gradients · centred hero type ·
emoji · AI-generated people or images · logos imitated as graphics · gradient text ·
the same fade-up on everything (key words and numbers get their own animation).

## Photo rules
Real photographs only, from Wikimedia Commons, each credited on screen (author and
licence) and again in `public/photos/credits.json`. Show a person only in a story
about their organisation, and caption them with name and role.
