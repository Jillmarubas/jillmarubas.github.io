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
