# Higgsfield image list: The $20 Lie

Every image is one separate piece, so it can be layered and moved in EffectCraft.
People come from Google Flow (`PEOPLE_PROMPTS.md`). Text, numbers, charts, counters and icons are animated in code, so they need no images.

**Prices checked 26 Oct 2026:** `gpt_image_2_5` costs 0.25 credits per image; `soul_location` costs 1 credit per image.

- **Props** are photoreal objects on a flat mid-grey (#808080) background, so I can cut them out. No text or logos.
- **Plates** are full-frame backgrounds with no people. They are made in layers (far and near) where the shot uses parallax.

## Plates (backgrounds): `soul_location`, 1 credit each

| # | Used in | What |
|---|---|---|
| B1 | Ch 1 "made fresh, on chips in a data centre" | Long server aisle, cool light, blinking status LEDs, no people. Far layer. |
| B2 | Ch 1 (same shot) | One server rack close to camera, for the near parallax layer. |
| B3 | Ch 2 and Ch 4 night scenes | Dark home office at night, empty desk and chair, city glow through the window. |
| B4 | Ch 1 and Ch 4 calm scenes | Bright, cosy living room in daylight, empty sofa and armchair. |
| B5 | Ch 4 "that group is growing" | Night city skyline of apartment blocks, many windows dark, a few lit. |
| B6 | Ch 1 gym comparison | Empty gym entrance with a turnstile, morning light. |
| B7 | Ch 2 cliffhanger "One company tried to fix that quietly" | A single door slightly ajar in a dark corridor, a thin blade of light. |

## Props (cut-outs): `gpt_image_2_5`, 0.25 credits each

| # | Used in | What |
|---|---|---|
| O1 | All chapters (the film's motif) | Long blank thermal receipt, curling at the bottom |
| O2 | Cold open, Ch 3 | Small thermal receipt printer |
| O3 | Cold open, Ch 1, 2 and 3 | Blank paper price tag on a string |
| O4 | Cold open, Ch 3 and the end | Brass magnifying glass |
| O5 | Cold open, Ch 1 | Smartphone, blank white screen |
| O6 | Ch 2 | Open laptop, blank screen, side view |
| O7 | Ch 1 "film doesn't get more expensive" | Vintage film reel |
| O8 | Ch 1 | Single gold coin, plus a small stack of coins |
| O9 | Ch 1 and 4 | Vintage taxi meter |
| O10 | Ch 1 "chips in a data centre" | AI chip, top view, gold contacts |
| O11 | Ch 2 "never turned it off" | Plain wall clock, white face, no numbers |
| O12 | Ch 3 "twenty dollars of credit" | Vintage fuel gauge, needle on full |
| O13 | Ch 3 Anthropic change | Electrical plug pulled halfway from a wall socket |
| O14 | Ch 3 "October 29th" | Desk flip calendar, blank pages |
| O15 | Ch 3 date stamps | Rubber date stamp with an ink pad |
| O16 | Ch 4 "Shrink the box" | Chocolate bar in a plain wrapper (I shorten it in code) |
| O17 | Ch 4 "$13.1B" | Stack of banknotes (no readable currency) |
| O18 | Ch 4 data-centre map | Small isometric data-centre building, used as a map pin |
| O19 | Ch 2 "invisible ceiling" | Sheet of frosted glass seen from below |

## Cost

- 7 plates × 1 credit = 7 credits
- 19 props × 2 variants each (to pick the best) × 0.25 credits = 9.5 credits
- **Total: about 17 credits** of your 140. Redos for bad hands or warped objects are about 0.25 credits each.

## Revision 1 (27 Oct 2026, from the review-room notes)

New Higgsfield images (gpt_image_2_5, high quality; links in `images/higgsfield_jobs.txt`):
two newspaper front pages with a made-up masthead (THE DAILY LEDGER; real logos blurred afterwards),
a blank A4 sheet, a commuter crowd on their phones (4K), a US dollar coin, a monitor, a stack of US
banknotes, and the Builder holding an A4 bill (P6b, cut out with Higgsfield's background remover).
About 27 credits in total.

Made in code from those (no credits): `effectcraft/twentylie/tools/bake_tags.py` (price printed onto
the tag) and `tools/make_paper_assets.py` (A4 bills, the fair-use page, the October 2026 calendar,
the laptop with the post on screen).

**Sam Altman** is shown with a real, licensed photo, not an AI likeness:
"Sam Altman TechCrunch SF 2019 Day 2 Oct 3 (cropped).jpg", Wikimedia Commons, by TechCrunch,
CC BY 2.0 (credit shown on screen: "Photo: TechCrunch, CC BY 2.0"; also credit it in the video
description). Brought in through Higgsfield's URL import and cut out with its background remover,
because this server can't reach Wikimedia. **Check** the license line on the Commons file page.
