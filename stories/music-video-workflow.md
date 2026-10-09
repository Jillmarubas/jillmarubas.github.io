# Music video workflow (user's preferences)

- **Images: the user generates them, never Claude.** Claude writes the image prompts
  (copy boxes); the user makes them for free on the Higgsfield website (unlimited image
  models) or in Gemini. Do NOT generate images through the Higgsfield MCP: it costs credits.
- **Video clips: Claude generates them through the Higgsfield MCP** (Kling 3.0, 5 s, 16:9,
  std/720p, sound off ≈ 7.5 credits per clip; the website charges 10).
- Flow: song (MP3) → Claude analyses beats/drops + shot list → image prompts → user makes and
  uploads images → Claude checks them → Claude generates clips → Claude edits in Remotion.
- Budget: Pro plan = 600 credits/month; one ~36-clip video ≈ 270 credits.
- Reuse the existing DJ character and stage references (Drive folder "DJ") for consistency.
- **Always send the reference images together with each image prompt** (SendUserFile from
  `assets/aurum-beats/`, in upload order); the user works on a phone and doesn't keep them.
