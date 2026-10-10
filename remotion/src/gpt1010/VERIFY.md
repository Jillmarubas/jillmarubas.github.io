# Verification: "ChatGPT Now Builds Answers You Can Click" (AI News Daily, 10 Oct 2026)

Script: the user's research doc "AI News Daily: research and script, 3–10 Oct 2026" (Cowork), Part C.
Checked 10 Oct 2026 against OpenAI's own pages. openai.com and help.openai.com block direct fetching
(HTTP 403), so their text was read through domain-restricted search of those pages; the OpenAI
Developer Community announcement (an official OpenAI post) was read directly.

Sources
- RN: ChatGPT release notes, entries 6, 7, 9 Oct 2026 — https://help.openai.com/en/articles/6825453-chatgpt-release-notes
- Blog: "GPT-6 and Intelligent UI for everyone", 7 Oct 2026 — https://openai.com/index/gpt-6-for-everyone/
- Forum: "GPT-6 and Intelligent UI in ChatGPT" (OpenAI announcement) — https://community.openai.com/t/gpt-6-and-intelligent-ui-in-chatgpt/1404139
- IUI: Help "Intelligent UI in ChatGPT" — https://help.openai.com/en/articles/20001598-intelligent-ui-in-chatgpt
- Audio: Help "Uploading files and audio to ChatGPT" — https://help.openai.com/en/articles/8555545-uploading-files-and-audio-to-chatgpt
- CP: Help "Composer predictions in Codex" — https://help.openai.com/en/articles/20001601-composer-predictions-in-codex

| # | Claim in script | Source says | Status |
|---|---|---|---|
| 1 | GPT-6 + Intelligent UI came to the Chat tab on 7 Oct 2026 | RN, Blog, Forum | ✅ |
| 2 | Answers mix text, visuals, interactive parts; OpenAI lists graphics, tappable buttons, forms, charts | RN, Blog | ✅ |
| 3 | It can build a working bill splitter in the chat | RN ("calculators, bill splitters, and games"), Blog (dinner bill splitter) | ✅ |
| 4 | Comparisons may come side by side; "how it works" may come as a diagram to explore; simple questions still get plain text | IUI, Blog | ✅ |
| 5 | Rollout began 7 Oct for Plus, Pro, Business, Enterprise; Free and Go starting 8 Oct; it's a rollout | Forum ("expanding to Free and Go starting October 8"), RN | ✅ |
| 6 | Plus/Pro/Business/Enterprise use GPT-6 Sol; Free and Go use GPT-6 Luna | RN, Forum table | ✅ |
| 7 | OpenAI's demo breaks a 7-speed bike into five systems you can tap through | Blog example "7-Speed Bicycle"; press describe five: frame, wheels, drivetrain, brakes, cockpit | ✅ |
| 8 | Road-trip stops can appear on a map | Blog | ✅ |
| 9 | Works from Instant up to Extra High; the Pro reasoning option doesn't support it | RN ("Pro reasoning option continues to use GPT-6 Astra") | ✅ |
| 10 | GPT-6 starts answering while still thinking/using tools; more is added without a new prompt | Forum ("can begin answering while it continues to think"), Blog | ✅ |
| 11 | First words 44% sooner on average, GPT-6 Instant vs GPT-5.6 Instant, web-search questions; OpenAI's own measure | Forum, Blog | ✅ |
| 12 | Audio uploads arrived 6 Oct: transcript, summary, questions | RN | ✅ |
| 13 | Paid subscriptions and workspaces; not on Free right now | RN, Audio | ✅ |
| 14 | Up to 512 MB; MP3, WAV, M4A, FLAC among formats; video-identified files not supported | Audio | ✅ |
| 15 | "transcripts can have mistakes, and it may mix up who is speaking" | RN says transcripts "may contain errors" and performance "may vary across languages"; speaker mix-ups not found on any OpenAI page | ⚠️ → **fixed**: "transcripts can have mistakes, and accuracy can vary by language" |
| 16 | Composer predictions in Codex, beta, 9 Oct; suggestion appears in the message box after Codex replies | RN, CP | ✅ |
| 17 | Personal ChatGPT Pro, 18+, latest Codex desktop app, local and SSH threads, GPT-6 Astra or GPT-6.1 Sol | RN, CP | ✅ |
| 18 | Suggestions free during beta (no Codex limits/credits); sent messages count as usual | RN, CP | ✅ |
| 19 | Tab accepts into the box, doesn't send | RN, CP | ✅ |
| 20 | On by default; Settings › General › Composer › Show predictions | CP | ✅ |

Example prompts (bill splitter $240, bike, KL–Penang trip, Penang weather, meeting notes) are the
user's own, as the script says. Screens are drawn in code and labelled as illustrations; tool outputs
shown (per-person amounts, map stops, notes) are illustrative.

Confirmed but not used (the user's researcher had them as ⚠️): a "Simple" layout option reduces visuals
(IUI: Personalization › Layout and Visuals › Simple; another help page gives a different path), and older
macOS/Windows desktop apps don't support Intelligent UI.

People named: none. Logo: OpenAI mark (editorial, exact black/white), from `public/news1003/logos/openai.svg`.
