# Notes for Claude

## Video production (Remotion)

- **Voiceover:** ElevenLabs, voice **Joey – Upbeat Popular News Host** (`mUfWEBhcigm8YlCDbmGP`).
- **Background music and SFX:** make them with Remotion, not ElevenLabs. Don't spend ElevenLabs
  credits on music or sound effects.
  - SFX: `@remotion/sfx` (whoosh, whip, click, switch, ding, page turn, shutter…). Its files load
    from `https://remotion.media`, so that host must be allowed in the environment's network settings.
  - Music: Remotion has no music library. Synthesize a bed in code, or use a track the user provides.
- Reference project: `video/ai-news-2026-09-25/` (frost glass design system, word-timed captions).

## Remotion Lambda (AWS account 840928785099, region `ap-southeast-5`, Kuala Lumpur)

- Done: IAM role `remotion-lambda-role` and IAM user `remotion-user`, each with Remotion's own
  inline policy (`npx remotion lambda policies role|user`).
- The user adds an access key for `remotion-user` to the environment as `REMOTION_AWS_ACCESS_KEY_ID`
  and `REMOTION_AWS_SECRET_ACCESS_KEY` (never pasted in chat). The container's own `AWS_*` keys are
  proxy placeholders and do not work for Remotion.
- Then, from `video/ai-news-2026-09-25/` (`@remotion/lambda` is installed at the same version):
  1. `npx remotion lambda functions deploy --region=ap-southeast-5`
  2. `npx remotion lambda sites create src/index.ts --site-name=ai-news --region=ap-southeast-5`
  3. `npx remotion lambda render ai-news AINewsShort --region=ap-southeast-5`, then run
     `tools/finish.sh` on the downloaded MP4 as with a local render.
