# Explainer videos: comprehension research (detail)

Source: the user's report *The Architecture of Comprehension: Advanced Methodologies in Explainer
Video Production* (2026). Market figures come from vendor blogs (Piktochart, tools8020, Pictory,
Wistia, Vidyard). Treat them as context, not as facts to put on screen (see `claims-to-check.md`).

## Market context (as reported)
| Metric | 2025 | 2026 | Meaning |
|---|---|---|---|
| Businesses using video | 89% | 91% | Video is the baseline, not an edge |
| Marketers reporting positive ROI | 93% | 82% | Flood of low-quality (often AI) video lowers average returns |
| AI used in production | 51% | 63% | More volume, often less coherence |
| Consumers: quality affects trust | 91% | 89% | Poor execution damages the brand |
| Convinced to buy by an explainer | – | 85% | Good explainers still convert |

Other reported numbers: 96% of consumers have watched an explainer. Pages with video convert at
4.8% vs 2.9% without (+65%).

**Takeaway:** having a video no longer wins. A video that cuts the effort needed to understand does.

## Cognitive Load Theory (Sweller, 1988)
Working memory is small and short-lived. Three loads share it:
- **Intrinsic:** how hard the subject is, measured by element interactivity (how many things must
  be held together). Fixed by the topic.
- **Extraneous:** effort wasted on bad design (distractions, redundancy, unsynced audio, confusing
  visuals). **The producer's job is to minimize this.**
- **Germane:** productive effort that builds schemas in long-term memory. Freed capacity goes here.

Effects to design around:
- **Transient information effect:** speech and animation vanish as they play, so viewers can't
  re-read. Don't make them hold early details to understand the ending. Time audio and visuals precisely.
- **Expertise reversal:** heavy guidance helps novices but hinders experts.
- **Guidance fading:** start explicit, then step back.
- **Split attention** (≠ redundancy): two separate sources that must be cross-referenced, such as a
  diagram plus a separate key. Fix it by putting labels on the diagram.
- **Redundancy:** the same content in two forms at once, such as narration read off on-screen text.
  Fix it with keywords only on screen.

## Mayer's Cognitive Theory of Multimedia Learning
Two channels (eyes and ears), each with limited capacity.

| Principle | Load it targets | Directive | Effect size d (as reported) |
|---|---|---|---|
| Temporal contiguity | Extraneous | Narration and the matching animation happen together | 1.30 (very high) |
| Multimedia | Germane | Words + relevant graphics, not words alone | 0.85 |
| Coherence | Extraneous | Cut decorative images, music that competes, tangents | 0.80 |
| Pre-training | Intrinsic | Name and define the key parts before the process | 0.78 |
| Modality | Intrinsic | Explain with voice, not blocks of on-screen text | 0.72 |
| Spatial contiguity | Extraneous | Labels next to what they describe | 0.72 |
| Signaling | Extraneous | Cue the essentials (arrows, color, bold, vocal stress) | 0.52 |

Also:
- **Segmenting:** break the flow into beats.
- **Personalization:** conversational "you/we".
- **Voice:** a friendly human voice beats a synthetic one.
- **Image:** a talking head doesn't improve learning except to build trust at the start.

## Script
- Define **one core message**. Define the audience: prior knowledge, role, pain point.
- **Arc:**
  1. **Hook,** 0–10 s: a pattern interrupt plus a pain point, a number or a question.
  2. **Problem expansion,** about 20 s: validate the frustration and name the pain.
  3. **Solution and benefits,** shown as the remedy through visual metaphors.
  4. **One CTA.** More options split attention and cut conversion.
- **For the ear:** short active sentences, contractions, plain words. Use the Hemingway App to flag
  sentences that are hard to read aloud.
- **Pacing:** 130–150 spoken words per minute.

| Length | Words | Use |
|---|---|---|
| 60 s | 130–150 | Top-of-funnel social ads, simple app overviews |
| 90 s | 195–225 | Standard homepage explainer |
| 120 s | 260–300 | Complex B2B workflows |

Too long → cut copy. Speeding up the voice raises extraneous load and hurts comprehension.

**Two-column A/V script:** the left column holds VO, music and SFX; the right holds the visuals
that play at the same moment.

## Formats
| Format | Best for | Est. cost, 60 s (2026) | Timeline |
|---|---|---|---|
| Basic 2D motion graphics | Startups, feature updates, cheap social | $1k–5k | 3–5 wk |
| Custom 2D character animation | B2B SaaS, abstract services needing a metaphor | $4k–10k | 4–8 wk |
| High-end 3D | Hardware, medical devices, premium tech (inner mechanisms, impossible angles) | $15k–30k+ | 8–12 wk |
| Live action | Physical goods, trust-based services | $15k–50k+ | 6–10 wk |

Also:
- **Whiteboard:** education and storytelling; viewers want to see each drawing finish.
- **Screencast:** cheap but static and high in load; best for bottom-of-funnel tutorials.
- **AI-generated (under $1k):** often loses scene-to-scene coherence and sync, which breaks Mayer's
  principles. If AI is used, human-direct the timing.

## Completion and funnel (Vidyard, ~1M B2B videos)
| Length | Average completion | Placement |
|---|---|---|
| Under 60 s | 65% | Top of funnel (social, landing-page hooks) |
| 1–3 min | 50–60% | Middle (homepage, email) |
| Over 20 min | 20% | Bottom (webinars, deep demos) |

81% of teams share video on LinkedIn (as reported). Place the CTA before most viewers drop off.

## Case studies (as reported)
| Company | What they did | Reported result |
|---|---|---|
| Dropbox (2009) | Paying up to $388 per customer for a $99 product. Common Craft made a 120 s paper-cutout stop-motion video (about $50k) with no specs, just a relatable lost-files story and a "magic box" metaphor | ~10% conversion lift, 25M+ views, credited with 10M users and ~$48M |
| Crazy Egg | Demo Duck video with a mustached egg guide (personalization); turned "why visitors leave" into a heatmap visual | +64% conversion, ~$21k MRR |
| Rypple | Split-tested landing page | +20% visitor-to-customer |
| RankWatch | Explained a complex tool | +27% trial signups |
| CaseComplete | Replaced dense text with an animated overview | +23% conversion |
| Jellyfish | Custom explainer in cold outreach | $800k contract closed in 7 days |
| Sandwich Video for Slack | "Sandwich in a Lunchbox", shot remotely using Slack itself | Dry, conversational human tone anchors attention on high-load products |

**Lesson:** find the exact point of confusion and turn it into a visual that matches the viewer's
existing mental model.
