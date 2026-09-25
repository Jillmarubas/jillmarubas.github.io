# AI News Today — Sep 25, 2026 · YouTube Short

A 2:50, 1080 × 1920 Short cut from the 10-minute script, built in Remotion on the
portfolio's **frost glass** design system and **Settle Motion** curves.

| | |
|---|---|
| Final video | `out/ai-news-short-2026-09-25.mp4` (H.264, 2:50, ≈ −14 LUFS, 92 MB) |
| Script (short cut) | `script-short.md` |
| Voice | ElevenLabs, **Joey – Upbeat Popular News Host**, `eleven_multilingual_v2` |
| Music + SFX | ElevenLabs sound generation (30 s seamless loop, whoosh, impact, pop, riser, glitch) |
| Type | Archivo (display), IBM Plex Sans, IBM Plex Mono, bundled locally in `public/fonts` |

## How it's built

- **Every word is timed.** `tools/align.py` force-aligns the script to the voiceover
  (PocketSphinx), so captions, quotes and graphics all fire on the spoken word.
  `tools/space_vo.py` then opens a 0.55 s gap between stories for the transitions.
- **Captions** (`src/components/Captions.tsx`): each page rises in word by word at the
  design system's 0.22 floor, and each word lights up as it's said. Story words
  (names, numbers) take the accent and an underline that draws in.
- **Field** (`src/components/Field.tsx`): the six-bloom orange aurora from
  `frost-glass-layer.html`, drifting, with a different colour mood per story.
- **Glass**: dark frosted panels (blur, 55% fill, lit rim, depth), with a light sweep as
  they land. Never glass on glass.
- **Motion**: arrive-then-settle entrances on `cubic-bezier(.22,1,.36,1)`, exits on
  `depart`, one step shorter; words stagger 60 ms, letters 40 ms.
- **Sound**: music is sidechain-ducked under the voice (`tools/music_bed.sh`); SFX sit on
  the same cues as the graphics (`src/Video.tsx`).

## People on screen

Name tiles (initials) stand in for photos: this environment couldn't reach Wikimedia
Commons, and generated faces of real people aren't an option. To use real photos, drop
licensed images in `public/people/` and list them in `src/data/portraits.json`:

```json
{"altman": {"file": "altman.jpg", "credit": "Photo: Name / CC BY-SA 4.0"}}
```

Ids used: `altman`, `amodei`, `zuckerberg`, `qi`, `blake`, `kavukcuoglu`. They're shown in
the same orange duotone as the rest of the piece, with the credit on the image.

## Re-render

```bash
npm install
# derived audio (needs python3 with numpy, and ffmpeg)
python3 tools/space_vo.py ffmpeg public/audio/vo.mp3 src/data/words.json public/audio/vo-spaced.wav src/data/timeline.json
tools/music_bed.sh ffmpeg
npm run studio        # preview
npm run render        # writes out/master.mp4
tools/finish.sh ffmpeg
```

Rendering without a GPU uses SwANGLE (set in `remotion.config.ts`): about 0.4 s a frame on
4 cores, ~40 minutes for the whole Short.
