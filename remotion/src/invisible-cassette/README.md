# The Invisible Cassette (Small Print documentary)

- `script.json`: the fact-checked narration, with each change, its reason and its sources. This is the source of truth.
- `SCRIPT.md`: the clean narration for the voiceover (Edmund, `q2pKfokws6RPblc1D8Vs`, `eleven_multilingual_v2`).
- `VERIFY.md`: the claim-by-claim fact check.
- `build_factcheck.py`: rebuilds `SCRIPT.md`, `VERIFY.md` and the review page from `script.json`:
  `python3 -I remotion/src/invisible-cassette/build_factcheck.py remotion/src/invisible-cassette <out.html>`
- `pages/sound-cues.html`: the music and SFX prompt sheet (published as a private claude.ai page).

- `words.json`: word timings for every scene's voiceover (faster-whisper small.en), the base for timing the picture.
- `design.ts`, `fonts.ts`: Small Print tokens and bundled fonts (Playfair Display, Courier Prime, Special Elite, IBM Plex Sans Condensed; all SIL OFL).

Status (29 Oct 2026):
- Script approved. Voiceover recorded with Edmund (9 scene takes, about 17 min; three lines re-recorded after a transcription check). Audio lives in `remotion/out/invisible-cassette/audio/` (not committed).
- Music: all 16 cues from the user. SFX: F1–F4 from the user, the rest ElevenLabs Sound Effects v2 at set lengths.
- No AI animation of real people; 24 fps.
- Six fact lines still rest on secondary sources: sec.gov and cftc.gov block automated downloads, Wikipedia rate-limited the session.
