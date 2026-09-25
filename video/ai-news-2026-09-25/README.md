# AI News Today — Sep 25, 2026 · YouTube Short

A 2:50, 1080 × 1920 Short cut from the 10-minute script, built in Remotion on the
portfolio's **frost glass** design system and **Settle Motion** curves.

| | |
|---|---|
| Final video | `out/ai-news-short-2026-09-25.mp4` (H.264, 2:50, ≈ −14 LUFS, 92 MB) |
| Script (short cut) | `script-short.md` |
| Voice | ElevenLabs, **Joey – Upbeat Popular News Host**, `eleven_multilingual_v2` |
| Music + SFX | ElevenLabs sound generation (30 s seamless loop; whoosh, impact, pop, low-passed at 7 kHz by `tools/sfx_soft.sh` and kept well under the voice) |
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

Photos from Wikimedia Commons, cropped to head and shoulders and shown in the piece's
orange duotone (so all three are marked "edited"). Each carries its credit on screen.

| Person | File | Author | License |
|---|---|---|---|
| Sam Altman | [Sam Altman CropEdit James Tamim.jpg](https://commons.wikimedia.org/wiki/File:Sam_Altman_CropEdit_James_Tamim.jpg) | TechCrunch (crop by James Tamim) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Dario Amodei | [Dario Amodei in 2023.jpg](https://commons.wikimedia.org/wiki/File:Dario_Amodei_in_2023.jpg) | UK Prime Minister | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Mark Zuckerberg | [Mark Zuckerberg F8 2019 Keynote (32830578717) (cropped).jpg](https://commons.wikimedia.org/wiki/File:Mark_Zuckerberg_F8_2019_Keynote_(32830578717)_(cropped).jpg) | Anthony Quintano | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |

Commons has no photos of Stanley Qi, Kevin Blake or Koray Kavukcuoglu, so they keep
initials tiles. Generated faces of real people are not an option. To add one later, drop
a licensed image in `public/people/` and list it in `src/data/portraits.json` under its id
(`qi`, `blake`, `kavukcuoglu`).

Put the credits above in the YouTube description as well.

## Background photos

Story plates behind the glass (`src/components/Plates.tsx`), all from Wikimedia Commons,
shown in the orange duotone at 30% with a slow push-in, credited on screen while they're up.

| Story | File | Author | License |
|---|---|---|---|
| Price war | [Datacenter Server Racks (22370909788).jpg](https://commons.wikimedia.org/wiki/File:Datacenter_Server_Racks_(22370909788).jpg) | Carl Lender | CC BY 2.0 |
| Enzyme | [Enterobacteria phage T2 transmission electron micrograph.jpg](https://commons.wikimedia.org/wiki/File:Enterobacteria_phage_T2_transmission_electron_micrograph.jpg) | SnaxMikn | CC BY-SA 4.0 |
| Enzyme (lab) | [Pipetting culture medium.jpg](https://commons.wikimedia.org/wiki/File:Pipetting_culture_medium.jpg) | Bill Branson, National Cancer Institute | Public domain |
| Meta | [Ray-Ban Meta Gen 1 smart glasses with charging case.jpg](https://commons.wikimedia.org/wiki/File:Ray-Ban_Meta_Gen_1_smart_glasses_with_charging_case.jpg) | CCadio | CC BY 4.0 |
| Gemini | [Google-Deep Mind headquarters in London, 6 Pancras Square.jpg](https://commons.wikimedia.org/wiki/File:Google-Deep_Mind_headquarters_in_London,_6_Pancras_Square.jpg) | Gciriani | CC BY-SA 4.0 |
| Island | [Cybersecurity.png](https://commons.wikimedia.org/wiki/File:Cybersecurity.png) | jaydeep_ | CC0 |
| UN | [United Nations Headquarters - Security Council chamber, angled view.jpg](https://commons.wikimedia.org/wiki/File:United_Nations_Headquarters_-_Security_Council_chamber,_angled_view.jpg) | Jdforrester | CC BY 4.0 |

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

Audio-only change? `node tools/audio.mjs build out/audio.wav` renders just the soundtrack in
a few minutes; mux it onto `out/master.mp4` and run `tools/finish.sh` again.

Rendering without a GPU uses SwANGLE (set in `remotion.config.ts`): about 0.4 s a frame on
4 cores, ~40 minutes for the whole Short.
