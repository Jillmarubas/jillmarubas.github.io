# Suno commercial terms and plans (as of Oct 2026)

Not legal advice. Several details come from secondary blogs and search snippets, not Suno's own pages. Verify against suno.com/terms and help.suno.com before relying on them.

## 1. Plans, prices, credits, and rights by tier

### Takeaway
Commercial rights exist only on paid plans (Pro $8/mo, Premier $24/mo) and attach to songs made while subscribed and downloaded through an approved channel. Free-tier songs stay non-commercial permanently, including after an upgrade. Since Sept 3, 2026, downloads are capped (Free 7 lifetime, Pro 20/mo, Premier 60/mo).

### Cited Findings
- Free: $0, 50 credits/day, no downloads listed, no commercial rights, model v6-mini, shared queue. — [Suno pricing](https://suno.com/pricing) (fetched Oct 2026, summarized by fetch tool)
- Pro: $8/mo ($6.40/mo yearly), 2,500 credits/mo, 20 song downloads/mo, commercial rights, v6 and v6-wild, stems, priority queue (10 concurrent), add-on credits. — [Suno pricing](https://suno.com/pricing)
- Premier: $24/mo ($19.20/mo yearly), 10,000 credits/mo, 60 downloads/mo, commercial rights, Suno Studio with MIDI/effects, all stem types, upload up to 30 min of audio, add vocals/instrumentals. — [Suno pricing](https://suno.com/pricing)
- Purchased add-on credits don't expire but require an active subscription to use. — [Suno pricing](https://suno.com/pricing)
- Suno help center: free-plan songs are "only intended for personal, non-commercial use." Paid-plan downloaded songs get commercial use rights. Suno does not own your music. Free-plan songs do not get retroactive commercial rights if you later subscribe. — [Suno Help: Rights & Ownership](https://help.suno.com/en/categories/550145-rights-ownership)
- Terms of Service (effective Sept 3, 2026): users keep ownership of submissions but grant Suno a broad worldwide, sublicensable, perpetual, irrevocable license. Pro/Premier users get output ownership assigned and may exploit downloaded output commercially. Free users are limited to "lawful, personal and non-commercial purposes." Users cannot "commercially exploit Output that has not been downloaded by you through an approved channel." — [Suno Terms](https://suno.com/terms) (via fetch summary, not verbatim full read)
- Terms also say output may not be unique and other users may get similar output. — [Suno Terms](https://suno.com/terms)
- Download caps start Sept 3, 2026: Free 7 lifetime (non-commercial), Pro 20/mo, Premier 60/mo. One song counts as one download including stems and other formats. Re-downloading doesn't consume more. Extra downloads can be purchased. Caps reportedly apply retroactively to existing libraries. Trial downloads are not commercially usable. — [aimusicpreneur](https://www.aimusicpreneur.com/ai-tools-news/suno-download-caps-free-pro-premier-september-2026/); [GitHub issue #562 (third-party)](https://github.com/bitwize-music-studio/claude-ai-music-skills/issues/562); [jackrighteous](https://jackrighteous.com/blogs/guides-using-suno-ai-music-creation/distribute-suno-music-after-september-3-spotify-distrokid-youtube); [Musegen](https://www.musegen.ai/blog/suno-download-limits-what-changed-alternatives)
- Remixes are never commercial (per third-party doc). — [GitHub issue #562](https://github.com/bitwize-music-studio/claude-ai-music-skills/issues/562)
- v6 generations cost 10 credits, or 20 with Max Mode. At 2,500 credits, Pro is roughly 250 standard generations/mo. (Inference from the cited credit costs.) — [GitHub issue #562](https://github.com/bitwize-music-studio/claude-ai-music-skills/issues/562)

### Inferences
- For monetized YouTube, the real constraint is the 20 downloads/mo on Pro. Free users cannot create monetizable assets at all. Generate and audition in-app, then download only keepers.
- Any song generated while on Free, even if downloaded after subscribing, should be treated as non-commercial.

### Gaps
- I did not read the full ToS text. The "approved channel" definition and whether video/YouTube links count as a download channel is unverified.
- Sources conflict on Studio: pricing page lists Studio under Premier, one aggregator says "unlimited only on Studio." Not resolved.
- Whether rights survive after cancelling a subscription is not confirmed in the sources I read (help center wording suggests songs made while subscribed keep commercial rights).

## 2. Warner settlement, UMG/Sony litigation, v6 licensed models

### Takeaway
Warner settled Nov 2025 and licensed Suno. Suno launched licensed-partner v6 models Sept 9, 2026, retired old models, and imposed paid-only/capped downloads. UMG and Sony remain adversaries and filed a second suit Sept 18, 2026 attacking v6. Creator terms did not become more restrictive on ownership, but downloads did.

### Cited Findings
- Nov 2025: Warner Music Group settled and partnered with Suno. Suno may train on licensed WMG catalog. Warner artists control whether their voices, names, likenesses and compositions appear. Suno acquired Songkick. Free-tier songs would be playable and shareable but not downloadable. Paid downloads would be capped with purchasable extras. Current models to be deprecated when licensed models launch. — [MBW](https://www.musicbusinessworldwide.com/warner-music-group-settles-with-suno-strikes-first-of-its-kind-deal-with-ai-song-generator/); [Forbes, Nov 25 2025](https://www.forbes.com/sites/conormurray/2025/11/25/warner-music-settles-lawsuit-with-suno-and-will-partner-with-ai-music-generator/); [Digital Music News, Dec 22 2025](https://www.digitalmusicnews.com/2025/12/22/suno-warner-music-deal-changes/)
- Sept 9, 2026: Suno launched v6 family (v6 and v6-wild for paid, v6-mini for all), developed with Warner, BMG, Believe (and TuneCore). Older models retired. CPO Jack Brody said v6 was trained from scratch on data excluding Universal and Sony. — [Bedroom Producers Blog](https://bedroomproducersblog.com/2026/09/26/suno-lawsuit/); [MBW](https://www.musicbusinessworldwide.com/universal-and-sony-sue-suno-for-a-second-time-claiming-platforms-v6-models-are-the-fruit-of-the-same-poisoned-tree/)
- Suno later acknowledged training on user "interactions, including creations," which labels say derive from earlier unlicensed models. — [Bedroom Producers Blog](https://bedroomproducersblog.com/2026/09/26/suno-lawsuit/)
- Sept 18, 2026: UMG and Sony filed a second suit (Boston federal court) covering 60,202 recordings, alleging v6 "launders" infringement. Theoretical statutory exposure about $9B, plus up to $150M for circumventing YouTube anti-download protections. — [MBW](https://www.musicbusinessworldwide.com/universal-and-sony-sue-suno-for-a-second-time-claiming-platforms-v6-models-are-the-fruit-of-the-same-poisoned-tree/); [Digital Music News](https://www.digitalmusicnews.com/2026/09/18/universal-music-suno-lawsuit-second/)
- Original June 2024 case (560 works): discovery closed Sept 30, 2026. A judge refused to add 61,026 recordings, prompting the second suit. BMG deal in Aug 2026, Believe in Sept 2026. — [MBW](https://www.musicbusinessworldwide.com/universal-and-sony-sue-suno-for-a-second-time-claiming-platforms-v6-models-are-the-fruit-of-the-same-poisoned-tree/)
- The Sept 3, 2026 ToS made download through an approved channel the gateway to commercial use. — [Suno Terms](https://suno.com/terms); [Musegen](https://www.musegen.ai/blog/suno-download-limits-what-changed-alternatives)

### Inferences
- Litigation targets Suno, not users, in everything I found. Residual risk for creators is platform or distributor policy shifts and possible injunction or settlement terms that change product access, not direct liability (no source found addressing user liability; ask a lawyer).
- Further changes are plausible if UMG/Sony settle (Warner's pattern: caps, paid-only downloads, licensed models).

### Gaps
- No found source on Sony/UMG settlement talks or trial dates.
- Whether Warner's artist opt-in products are live: reportedly "phase two" (see section 4).
- The Digital Music News Dec 2025 article body would not load; details come from search snippets.

## 3. Distribution, PROs, Content ID, copyrightability

### Takeaway
Suno permits distribution of paid, downloaded songs to streaming services, but Content ID typically needs exclusive rights, which is hard for AI output others can resemble. Pure prompt-generated music is not copyrightable in the US; only human contributions (lyrics, arrangement, edits) are.

### Cited Findings
- Paid songs can be distributed to Spotify, Apple Music, etc. but each destination's rules still apply. Free songs cannot be uploaded for monetization. — [Suno Help](https://help.suno.com/en/categories/550145-rights-ownership); [Dynamoi](https://dynamoi.com/learn/guides/suno-commercial-rights-explained)
- Content ID enrollment requires exclusive rights, a stricter standard than distribution rights. — [jackrighteous](https://jackrighteous.com/blogs/guides-using-suno-ai-music-creation/distribute-suno-music-after-september-3-spotify-distrokid-youtube) (blog, secondary)
- Suno's ToS says outputs may be non-unique (see section 1), which undercuts exclusivity claims. — [Suno Terms](https://suno.com/terms)
- Suno ToS does not address Content ID or revenue sharing. — [Suno Terms](https://suno.com/terms) (fetch summary)
- DistroKid accepts AI music with disclosure; CD Baby reportedly bans fully AI tracks; Spotify allows AI with disclosure and removed 75M+ spam tracks. — [Tosky Records, Jun 9 2026](https://toskyrecords.com/2026/06/09/the-working-artists-guide-to-suno-paid-tiers-rights-distribution-monetization-in-2026/) (secondary, unverified)
- US Copyright Office, Copyright and AI Part 2 (Jan 2025): prompts alone do not give sufficient control for authorship; human-authored contributions and creative selection/arrangement can be protected; AI material in a work is disclaimed in registration. — [Manatt summary](https://manatt.com/insights/newsletters/copyright-office-releases-new-report-on-copyrightability-of-ai-works); [Baker Botts](https://ourtake.bakerbotts.com/post/102jxrk/copyright-office-releases-part-2-of-artificial-intelligence-report)
- Mar 2, 2026: Supreme Court denied cert in Thaler v. Perlmutter, leaving the human-authorship requirement intact. — [Reed Smith](https://www.reedsmith.com/our-insights/blogs/viewpoints/102mlpl/supreme-court-denies-certiorari-in-thaler-v-perlmutter-human-only-rule-for-ai/); [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/03/supreme-court-denies-review-in-ai-authorship-case)
- Suno help: you own lyrics you wrote; registration process varies by region. — [Suno Help](https://help.suno.com/en/categories/550145-rights-ownership)

### Inferences
- "Ownership" from Suno is a contractual assignment of whatever rights exist; with no copyright in the raw output there may be little to enforce against copycats. Adding human lyrics, edits, and arrangement strengthens claims.
- PRO registration: I found no authoritative source on PRO policy for AI works. Expect human-authorship requirements.

### Gaps
- No primary source on ASCAP/BMI/SESAC/PRS AI-registration rules, or YouTube's current Content ID/AI-disclosure policy for music (YouTube monetization policies not checked). Verify directly; consult an IP lawyer for registration strategy.

## 4. Restrictions, voices, and model quality

### Takeaway
Artist-name prompts are rewritten, voice models must be your own voice, and v6 replaced all earlier models. Quality claims for v6 not independently assessed.

### Cited Findings
- Artist names in prompts are still auto-replaced with similar styles; v6 does not unlock artist names, and opt-in artist products are described as "phase two." — [AIToolsReview / search snippets via aimusicpreneur](https://www.aimusicpreneur.com/ai-tools-news/suno-v6-v6-wild-v6-mini-launch/) (secondary)
- Terms: Voice Models are for the user's own voice; creating a voice model of another person is prohibited. Personas became "Voices"; one-click upgrade to v6; Voices cannot be used on instrumentals. — [The Vocal Market](https://thevocalmarket.com/blogs/how-to/suno-v6-what-it-means-for-producers); [GitHub issue #562](https://github.com/bitwize-music-studio/claude-ai-music-skills/issues/562)
- Prohibited by ToS: building competing products, removing watermarks/metadata, stream-ripping. — [Suno Terms](https://suno.com/terms)
- Limits: style box 1,000 chars, lyrics 5,000, duration 10s to 6 min; Variety slider; Max Mode doubles credits. Custom Models on v5.5 auto-upgrade to v6. — [GitHub issue #562](https://github.com/bitwize-music-studio/claude-ai-music-skills/issues/562)

### Inferences
- Old v4.5/v5 tracks can no longer be regenerated; catalogs should be downloaded before relying on them (subject to caps).

### Gaps
- Cover/upload rules: Premier allows 30 min uploads, but I did not find the ToS terms on uploading copyrighted audio. Remixes are non-commercial per third-party source only.
- No independent quality reviews of v6 vs v5 found.

## 5. Recent changes to watch

### Takeaway
Watch: ToS of Sept 3, 2026; v6 licensing; UMG/Sony second suit; possible settlement; further download-cap or pricing changes; distributor and YouTube AI policies.

### Cited Findings
- Timeline: Nov 25 2025 Warner deal; Aug 2026 BMG; Sept 3 2026 ToS and download caps; Sept 9 v6 launch; Sept 18 second UMG/Sony suit; Sept 30 discovery close in first case. — sources above ([MBW](https://www.musicbusinessworldwide.com/universal-and-sony-sue-suno-for-a-second-time-claiming-platforms-v6-models-are-the-fruit-of-the-same-poisoned-tree/), [Suno Terms](https://suno.com/terms))
- Prior releases were not automatically removed from Spotify/YouTube by the Sept 3 change. — [jackrighteous](https://jackrighteous.com/blogs/guides-using-suno-ai-music-creation/distribute-suno-music-after-september-3-spotify-distrokid-youtube)

### Inferences
- Keep dated records: subscription invoices, download logs, project files, and human-contribution evidence per song.

### Gaps
- Pricing page and ToS were read via summarizing fetch tool, so exact wording and any footnotes are unverified.
