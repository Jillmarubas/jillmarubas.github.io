# SOP: Script → 10-minute YouTube video (AI News Daily)

**Owner:** Jillmar Ubas · **Last updated:** 26 September 2026 · **Reference build:** `video/ai-news-2026-09-26/`

Follow this every time a new script is handed over. Read sections 1–3 before touching anything.

---

## 1. Standing instructions (non-negotiable)

These are Jillmar's requirements. Every video must meet all of them.

| # | Requirement | How it is met |
|---|---|---|
| 1 | **About 10 minutes long**, made with **Remotion** | One Remotion project per episode in `video/ai-news-YYYY-MM-DD/` |
| 2 | **Voice-over by ElevenLabs "Joey"** | Voice **"Joey – Upbeat Popular News Host"**, ID `mUfWEBhcigm8YlCDbmGP`, model `eleven_multilingual_v2` |
| 3 | **Rendered on Remotion Lambda** | `npm run lambda:deploy` then `npm run lambda:render` (§6) |
| 4 | **Frost Glass design system** from the repo | `design-system/frost-glass/`; tokens copied into `src/theme.ts`; rules in the episode's `DESIGN.md` |
| 5 | **Real photos of people. No AI image generation.** | Wikimedia Commons only, credited on screen and on the end card |
| 6 | **After Effects-style kinetic type and motion graphics** | Every spoken word animates on its own (§5.4) |
| 7 | **Motion graphics on every word of the script** | 100% of the script is on screen, timed to the voice |
| 8 | **Consistent. No AI slop, nothing generic.** | Follow `DESIGN.md`; run the anti-slop check (§7.3) |
| 9 | **Music and SFX generated in Remotion (code), not ElevenLabs** | `synth/`, `npm run audio`. ElevenLabs is for the voice **only**. |
| 10 | **Check frame by frame, plus music and SFX levels, before finalising** | QA gates in §7. Nothing ships until every gate passes. |
| 11 | **High-quality final video** (full 1080p original, not a compressed copy) | Kept private in S3 and downloaded from the AWS console (§8) |
| 12 | **Thumbnails** | 3 variants as Remotion `<Still>`s for YouTube Test & Compare (§9) |
| 13 | **Do not put the video on GitHub** | The repo is public, and GitHub rejects files over 100 MB. The video stays in S3. |

---

## 2. Where the keys and accounts are

> **Never paste a key, password or token into chat or into a file.** This section records *where* things live, never their values.

| What | Where it lives | How it is used |
|---|---|---|
| **AWS access key** (IAM user `remotion-user`) | Cloud environment settings: session title bar → environment menu → **Edit → API credentials** | Injected by the sandbox proxy into requests to `*.amazonaws.com`. Inside the sandbox, `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` are **placeholders**. Scripts must preload `scripts/aws-proxy.cjs`. |
| **AWS account (root)** | Sign in at `signin.aws.amazon.com` → **Root user** → `jillmar1988@gmail.com`. Password in Jillmar's password manager; reset with *Forgot password?* | Console only: downloads and presigned links. Keep MFA on. |
| **AWS region** | `us-east-1` | Lambda function, S3 bucket, Agent Toolkit |
| **Remotion Lambda function** | `remotion-render-4-0-529-mem3008mb-disk10240mb-900sec` | Created by `npm run lambda:deploy` |
| **Remotion S3 bucket** | `remotionlambda-useast1-c5w9ygbemk` | `sites/<episode>/` (bundle) · `renders/<id>/` (Lambda output) · `final/<episode>.mp4` (finished videos, **private**) |
| **ElevenLabs** | claude.ai **Settings → Connectors → ElevenLabs** | The voice-over (Joey) |
| **GitHub** | claude.ai GitHub connection, repo `Jillmarubas/jillmarubas.github.io` (**public**) | Code only |
| **AWS MCP connector** (optional) | claude.ai **Settings → Connectors → AWS**. Needs re-authorising when it says "sign in again". | Lets Claude make presigned download links |

### AWS account limits (discovered 26 Sep 2026)

- Lambda memory is capped at **3008 MB**. 3009 is rejected.
- About **10 concurrent Lambda executions**. 18 chunks were throttled with *Rate Exceeded*.
- A Lambda runs for at most **900 s**.
- Raising these is a request in AWS Service Quotas. Until then, keep the split-render plan in §6.

---

## 3. Before starting: checklist

- [ ] The script is saved as `ai-news-script-YYYY-MM-DD.md` and read end to end.
- [ ] The branch named in the session is checked out (create it if needed).
- [ ] The ElevenLabs connector is connected (the `creative_*` tools exist).
- [ ] AWS works. This must print an Arn:
      `curl -sS --aws-sigv4 "aws:amz:us-east-1:sts" --user "$AWS_ACCESS_KEY_ID:$AWS_SECRET_ACCESS_KEY" "https://sts.us-east-1.amazonaws.com/?Action=GetCallerIdentity&Version=2011-06-15"`
- [ ] `node -v` is 22 or later.
- [ ] Tools for analysis are installed: `pip install imageio-ffmpeg pillow numpy faster-whisper`, then symlink the static ffmpeg to `/usr/local/bin/ffmpeg`.

---

## 4. Set up a new episode

1. Copy the reference project without its heavy folders:
   `rsync -a --exclude node_modules --exclude out --exclude public/vo --exclude data video/ai-news-2026-09-26/ video/ai-news-YYYY-MM-DD/`
2. `npm install` inside the new folder.
3. Rename everything dated: the site id `ai-news-2026-09-26` in `scripts/lambda-*.mjs`, the output file names, the date in `Chrome.tsx` and `Cards.tsx`, and the story list in `src/timeline.ts` (`STORIES`).

---

## 5. Production steps

### 5.1 Voice-over (ElevenLabs Joey)

1. Split the script into sections: hook, preview, story 1–N, wrap, outro.
2. **Write numbers the way they should be spoken**, e.g. "sixty-six point four percent", "GPT five point six", "twenty twenty-seven".
3. Create one flow, then generate one take per section with `generations_count: 1`.
   **At most 3 generations at a time**: the plan limit is 3 concurrent requests. Rerun failures with `creative_run_flow_nodes`.
4. Download each MP3 into `public/vo/NN-name.mp3` straight away. The URLs expire after 2 hours.
5. Keep the untouched takes in `data/vo-raw/`.
6. **Normalise every section to −16 LUFS / −1.5 dBTP**, two-pass linear loudnorm. Raw takes vary by up to 11 dB between sections.

### 5.2 Word timings

1. Paste the exact spoken text of each section into `scripts/sections.py`, under `SECTIONS`.
2. Update `DISPLAY` (spoken form → on-screen form, e.g. "two dollars" → **$2**) and `KEY` (names and terms shown in orange).
3. `python3 scripts/align.py`: faster-whisper word timings → `data/whisper-words.json`.
4. `python3 scripts/build_timeline.py` → `src/data/timeline.json`.
   It prints the share of words timed directly. Expect 89–100%. Spot-check the numeric tokens.

### 5.3 Photos (real only)

1. Search Wikimedia Commons: `python3 scripts/commons.py "Person name" "Place"`. It retries on HTTP 429 and sends a User-Agent.
2. Put the chosen files in `picks` in `scripts/fetch.py`, then run `python3 scripts/fetch.py` from the episode folder. It downloads each photo at 2400 px to `public/photos/<key>.jpg` and writes `credits.json` with artist and licence.
3. Show a person **only** in a story about their organisation, captioned with name and role.
4. Portrait-orientation photos use `framed: true`.
5. Label illustrative photos as illustrative, e.g. "Illustrative photo · Finland".
6. Delete any photo that isn't used, and remove it from `credits.json`.

### 5.4 Every word animated (kinetic typography)

This happens automatically from `timeline.json` in `src/components/Kinetic.tsx`:

- plain words rise out of a 12 px blur on the `settle` curve;
- key words drop in letter by letter in orange with an underline;
- money, percentages and counts roll up to their value;
- quoted speech types on.

Words start 2 frames before they're heard.

### 5.5 Visual beats

1. Edit `src/beats.tsx`. Each beat is anchored to a spoken word (use `nth` for repeated words) and picks a layout:
   - `stage`: words only;
   - `split`: a glass panel with a chart, list, timeline or chips;
   - `photo`: a full-bleed photo.
2. The build **throws if beats are out of order**, which catches a word anchored to its wrong occurrence.

### 5.6 Music and SFX (synthesised in code)

`npm run audio`:

- synthesises the 100 BPM underscore, arranged against the running order;
- **bakes the ducking into the file** (`src/musicDuck.ts`);
- builds the six SFX;
- writes `public/audio/manifest.json`.

The composition refuses to render if the audio is stale. **Rerun `npm run audio` after any change to VO or timing.**

---

## 6. Rendering on Remotion Lambda

```bash
npm run audio            # 1. audio matches the current edit
npm run lambda:deploy    # 2. function (reused) + site bundle to S3
npm run lambda:render    # 3. audio job, 5 video parts, join, mux → out/<episode>.mp4
```

How `lambda:render` works, and why:

- **One audio-only job** runs with `inputProps: {audioOnly: true}` (null-tested: bit-identical sound). This keeps the sound free of joins.
- **Five sequential muted H.264 parts**, 8 chunks each, `concurrencyPerLambda: 2`. A 1080p frame costs about 1 s on Lambda, so a single render can't fit the 900 s / 10-Lambda limits.
- The parts are joined **without re-encoding** and muxed with the audio, encoded once to AAC 320k.
- Downloads use S3 `GetObject`, **not** `downloadMedia`: the proxy breaks presigned URLs.
- Throttled progress checks are retried. Finished parts are skipped on a re-run.
- Cost: about **$0.15 per part, roughly $0.75 per episode**.

Then upload the master to S3 as `final/<episode>.mp4`. Keep it **private**.

---

## 7. QA gates: all must pass before hand-over

### 7.1 Frame by frame

- [ ] `node scripts/stills.mjs --every 90` then `python3 scripts/sheets.py <dir>`. Review **every** sheet, one still every 3 s.
- [ ] Check every-frame renders of at least one count-up, one card entrance and one phrase handover.
- [ ] Check spaces inside multi-word tokens ("3 months", "Sept 22"). Letter-split words must keep their spaces.
- [ ] No panel sits empty for long before its value is spoken.
- [ ] Labels are readable over bright photos (top scrim).
- [ ] Nothing important is cut off or overlapping.
- [ ] Credits list only photos that are used.

### 7.2 Audio

`python3 scripts/analyze_mix.py <file>` on the **final MP4**. Targets:

- [ ] Integrated about **−16 LUFS**, true peak **≤ −1.5 dBTP**
- [ ] Every section's median within **1 LU** of the others
- [ ] Music about **15 dB under the voice** (bed about −32 LUFS in speech, about −23 on cards)
- [ ] **The loudest moments are the voice**, never an SFX
- [ ] A/V sync: **0-sample offset** against the WAV master at the start, middle and end

### 7.3 Anti-slop

- [ ] Only Frost Glass tokens: accent `#fa5a05`; fonts Archivo, IBM Plex Sans and IBM Plex Mono; no Inter.
- [ ] No purple or blue gradients, emoji, gradient text or centred hero type.
- [ ] Type is left-aligned. One accent colour.

### 7.4 Final file

- [ ] Frame count = composition frames. 1920×1080, 30 fps, H.264 + AAC.
- [ ] The four part joins are seamless (compare change across each join with change between neighbouring frames).
- [ ] Duration about 10:00.

---

## 8. Hand-over

1. Send a **720p preview under 30 MiB** in chat (two-pass x264 at about 290k, AAC 96k). The chat upload limit is 30 MiB.
2. **Full quality:** Jillmar downloads `final/<episode>.mp4` from S3 in the AWS console:
   **S3 → bucket → final/ → tick the file → Download**, or **Object actions → Share with a presigned URL** (private, up to 12 h).
3. Do **not** make the object public, and do **not** push the video to GitHub.
4. Commit and push all code to the session branch. `out/` stays ignored.

---

## 9. Thumbnails

1. Add three `<Still>`s (1280×720) in `src/Thumbnails.tsx` and render with `npx remotion still <Id> thumbnails/<Id>.png`.
2. Each variant tests one idea: the story hook, faces, and the stakes.
3. Each uses at most **3 words** and one focal point, real photos, and Frost Glass type.
4. [ ] It passes the **200 px mobile test**.
5. [ ] Nothing sits in the **bottom-right corner**, where YouTube shows the video length.
6. Send the PNGs and recommend a lead variant for YouTube Studio **Test & Compare**.

---

## 10. Known pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| ElevenLabs "Too many concurrent requests" | Plan allows 3 at a time | Batch generations in threes |
| AWS `InvalidClientTokenId` from Node | The AWS SDK bypasses the proxy | Preload `scripts/aws-proxy.cjs` (the npm scripts already do) |
| `MemorySize … ≤ 3008` | Account cap | Deploy with 3008 MB |
| Lambda *Rate Exceeded* | About 10 concurrent Lambdas | 8 chunks + orchestrator; retry throttled progress checks |
| Lambda *main function timed out* | Too many frames per render | Split parts (§6) |
| Audio chunk timeouts | Per-frame volume curves, or picture layout during audio jobs | Bake ducking into the file; `audioOnly` input prop |
| S3 "Only one auth mechanism allowed" | Presigned URL plus proxy auth | Use `GetObject` |
| Chrome font errors (`ERR_CERT_AUTHORITY_INVALID`) | Headless Chrome doesn't trust the proxy CA | Fonts are self-hosted in `public/fonts` |
| A render dies mid-way | The process was paused (SIGSTOP) | Never pause a running render |
| Visual on the wrong line | Beat anchored to the first occurrence of a repeated word | Set `nth`; the ordering guard throws |
| Commons HTTP 429 | Rate limit | Use `scripts/commons.py` (retries with a User-Agent) |
| `awscli.amazonaws.com` HTTP 502 in the sandbox | Network policy | Run the AWS Agent Toolkit setup on your own computer, not in the cloud sandbox |
