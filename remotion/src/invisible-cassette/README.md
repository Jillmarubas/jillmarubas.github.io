# The Invisible Cassette (Small Print documentary)

- `script.json`: the fact-checked narration, with each change, its reason and its sources. This is the source of truth.
- `SCRIPT.md`: the clean narration for the voiceover (Edmund, `q2pKfokws6RPblc1D8Vs`, `eleven_multilingual_v2`).
- `VERIFY.md`: the claim-by-claim fact check.
- `build_factcheck.py`: rebuilds `SCRIPT.md`, `VERIFY.md` and the review page from `script.json`:
  `python3 -I remotion/src/invisible-cassette/build_factcheck.py remotion/src/invisible-cassette <out.html>`
- `pages/sound-cues.html`: the music and SFX prompt sheet (published as a private claude.ai page).

Status (29 Oct 2026): script awaiting the user's approval; six lines still to check against the primary PDFs (sec.gov, cftc.gov and wikipedia.org were blocked in the cloud session).
