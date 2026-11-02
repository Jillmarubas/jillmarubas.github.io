# YouTube outlier research (2 Nov 2026)

**Method (Galloway's outlier test):** 30 YouTube searches across 20 candidate topics, filtered to videos uploaded in the
last 12 months (top ~20 results per search: 571 videos, 511 channels). For every channel, the median views of its recent
uploads (up to ~30) was read from its Videos tab. **Outlier** = a video with 3× or more its channel's median.
**Small-channel outlier** = an outlier from a channel under 100K subscribers, the signal that matters for a small channel.
Checked by hand: off-topic results were set aside (Windows "repair" tutorials under right-to-repair, photo-recovery
how-tos under deleted files), and so were company channels that likely run paid promotion (Applied Digital, ASUS India).
View counts as of 2 Nov 2026. Raw data: scratchpad `yt/results.json` (not committed).

## Ranking for this channel (motion-graphics explainers, AI-avatar thumbnails)

| Rank | Topic | Evidence (last 12 months) | Verdict |
|---|---|---|---|
| 1 | **USB-C: why it never works** | [Simple but Surprising](https://youtu.be/Y2PIEpTzybk), 22K subs: **1.8M views = 2,765× its median**; its follow-up [251K](https://youtu.be/y3h9kzk2gAY); a copy by [Wild Imprint](https://youtu.be/WjZBi-HIytc), **2K subs: 145K = 584×**, 4 months ago; [Switch and Click](https://youtu.be/wPIJEFVetW0) 1.6M. Topic median 20K views | Strongest: tiny channels keep breaking out on it, recently |
| 2 | **The building that answers your ChatGPT message (AI data centres)** | [James Harrison](https://youtu.be/hSZFAtJVqPQ), **261 subs: 250K = 4,390×**, 3 months ago; [MEP Academy](https://youtu.be/cTwvUqLNQrM) "How Data Centers Actually Work" 1.6M (166×); [Leo Cui](https://youtu.be/ckoi0RTEgcY), 50K subs: 605K (55×). Topic median 190K, the highest of all 20 | Strong, and the best fit for AI + 3D |
| 3 | **Apple chips vs Intel (ARM vs x86)** | [Bitwise Explained](https://youtu.be/TpAxJfhZ_WE), **2K subs: 138K and 129K** (115×, 108×) in the last 4 months; [Bit Byte Talks](https://youtu.be/d-8M6Rks860), 25K subs: 743K (74×) | Strong, but close to your last laptop video |
| 4 | Laptop slower every year (as "mistakes") | [Albert Unbox](https://youtu.be/cZ2hhXO_zps), 12K subs: 1.1M (501×), a tips listicle. Topic median only 251 views | Hit-or-miss; works as a list of mistakes, not a pure explainer |
| 5 | AI is making RAM pricier | [TECH SCRIPT](https://youtu.be/oCYoByeDQXo), 14K subs: 614K (341×), 4 days old; topic median 173K | Hot now, but news: it ages fast |
| 6 | Undersea cables | [Factron Process](https://youtu.be/S7xi_H3rIW8), 2K subs: 541K (1,872×), a how-it's-made angle; topic median only 386 | One breakout, most fail |
| 7 | Why chips stopped getting faster | [BitLemon](https://youtu.be/5JWcI_xutuI), 45K subs: 406K (14×) | Medium |

**Weak for a small channel (drop):** how ChatGPT works (big channels win; best small outlier 5K), TSMC (Veritasium's
65M; small channels at 2K), right to repair (no small explainer outliers found), where deleted files go (only
recovery tutorials), why AI uses so much electricity (topic median 35 views; Hank Green's 6.2M is a big channel; matches
your AI-water video's 87), AI PC/NPU (median 522), Wi-Fi, phones getting hot, GaN chargers, the cloud, 8 GB RAM.

## What this changes
- Earlier picks were wrong on #4 (deleted photos) and partly on #1 (the ChatGPT journey): the data says the
  **data-centre angle** ("the building that answers you") is what breaks out, not the message's network route.
- New #1 is a topic that wasn't in my earlier top three: **USB-C**.

## Verification pass (same day)
- **Channel depth:** Simple but Surprising (median 643 over 30 videos), Wild Imprint (248 over 30) and Bitwise
  Explained (1K over 30) are real channels with long histories, so their ratios hold. **James Harrison has only 6
  videos (median 57)**, so its 4,390× is unreliable: one fluke or a promoted video. Removed as evidence.
- **Trend:** USB-C outliers fell from 11 of 14 (4–12 months ago) to 8 of 16 (last 4 months): still strong but cooling.
  AI data centres rose from 3 of 9 to 9 of 18, but recent hits are mostly big channels (ColdFusion, Be Smart,
  Maxinomics). Apple chips steady (6/17 → 9/22).
- **New signal found:** [Silicon Up Close](https://youtu.be/oBKrR3i6jWM) "What Happens Inside an AI Chip When You Ask a Question",
  10K subs, 9 videos (median 24K), **932K views (39×), 3 weeks old**: the AI-chip angle is breaking out for small channels right now.
- **Not checkable:** like and comment counts (YouTube's automated-traffic check stopped video-page requests), so a
  paid-promotion check on single videos wasn't possible.

## User's idea: "Why AI gets sloppy and how to avoid it" (same day)
12 more searches (240 results, 205 channels), same method. Raw data: scratchpad `yt/slop.json`.

| Angle | Best small-channel evidence (last 12 months) | Read |
|---|---|---|
| **Why AI gets worse in long chats** (the mechanism) | [Nate Codes AI](https://youtu.be/wgzpz13L35k) "Why ChatGPT Gets Dumber The Longer You Talk To It", 804 subs: 3.4K (22×); [AI CatchUp](https://youtu.be/d_H5FBOGsYk) context windows, 340 subs: 2.1K (median 9, unreliable) | Proven, but small ceilings |
| **AI is getting dumber** (the news/opinion version) | [Pigeon Finance](https://youtu.be/46vJ2nhIBvc), 14K subs: 44K (9×); [Devsplainers](https://youtu.be/7usmtO_bJx8), 23K subs: 75K (3×) | Medium; ages with each model release |
| **How to stop it** (fixes) | [Dylan Davis](https://youtu.be/EH8Mdx948Kw) "The 3-Rule Prompt That Stops ChatGPT, Gemini, and Claude From Guessing", 66K subs: **208K (21×)** | The strongest half of the idea |
| AI flatters you (sycophancy) | [The Humans In The Loop](https://youtu.be/xU7zS8kfaV8), 841 subs: 10K (75×), 1 month ago | Rising, niche |
| AI hallucinations explained | Best 1.6K views; one experiment video 162K | Weak as a pure explainer |
| "AI slop" | Breakouts (vindalol 714K, the internet is eating itself 699K, Xám 71K) are culture commentary about AI junk content online | **Different meaning**: the word "sloppy" pulls in the wrong audience |

**Verdict:** real, repeatable small-channel demand, but the ceilings are tens of thousands (one 208K tips video), against
USB-C's 1.8M and 145K and the AI chip's 932K. The fix half carries the views; the "why" half alone tops out low.
Packaging: drop "sloppy" (it reads as "AI slop"). Use the proven phrasing "gets dumber the longer you talk to it".
