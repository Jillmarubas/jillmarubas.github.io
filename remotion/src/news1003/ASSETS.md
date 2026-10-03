# Assets and licences: AI News, 3 October 2026

Every photo, logo, voice and sound in the film, with its source and licence (SOP, Vox-style rules 3–4).

## People
| Person | File | Source | Licence / author | On screen |
|---|---|---|---|---|
| Rob Bonta | `public/news1003/people/bonta.jpg`, cut-out `cut/bonta.png` | https://commons.wikimedia.org/wiki/File:Rob_Bonta_official_portrait.jpg | Public domain · Douglas Despres, California Attorney General's Office | Credit line on the photo card |
| Matt Garman | `public/news1003/people/garman.jpg` (cropped from Amazon's leadership-announcement image) | https://www.aboutamazon.com/news/company-news/leadership-update-aws-adam-selipsky-matt-garman | Amazon press photo, editorial use (the user approved official press headshots, 3 Oct) | "Photo: Amazon · Amazon press photo" |
| Steve Corfield | none | No licensed or official press photo found (anthropic.com, claude.com, Commons, web search, 3 Oct) | — | Named silhouette card (SOP rule 3) |

No AI-generated faces anywhere. Video-call tiles are drawn silhouettes.

## Objects (real photos)
| Object | File | Source | Licence |
|---|---|---|---|
| Nvidia DGX Spark, oblique / front / rear | `public/news1003/photos/spark_*.jpg`, cut-outs in `cut/` (rembg, local) | https://commons.wikimedia.org/wiki/File:Nvidia_DGX_Spark_oblique_view_dllu.jpg (and `…front view…`, `…rear ports…`) | CC BY-SA 4.0 · Daniel Lu (User:dllu); credited on screen in story 1 |

## Logos (editorial reference only; never altered or combined)
Exact colours come from each official vector file (fills read straight from the SVG by `Logo3D`).
| Mark | File | Source | Licence | Colours |
|---|---|---|---|---|
| OpenAI | `logos/openai.svg` | carried over from news1001 (see `src/news1001/ASSETS.md`) | — | black |
| Anthropic | `logos/anthropic.svg` | news1001 | — | #191919 |
| Nvidia | `logos/nvidia.svg` | news1001 | — | #76B900 |
| Amazon | `logos/amazon.svg` | Commons `Amazon_logo.svg` | Public domain (text logo) | #221F1F / #FF9900 |
| AWS | `logos/aws.svg` | Commons `Amazon_Web_Services_Logo.svg` | Apache 2.0 | #252F3E / #FF9900 |
| Claude | `logos/claude.svg` | Commons `Claude_AI_symbol.svg` | CC0 | #D97757 |
| Hugging Face | `logos/huggingface.svg` | https://huggingface.co/front/assets/huggingface_logo.svg (official brand asset) | Brand asset | #FFD21E / #FF9D0B / #3A3B45 / #FF323D |
| Tavus | `logos/tavus.svg` | tavus.io site logo | Brand asset | #140206 — shown **flat** (its compound path doesn't extrude cleanly) |
| Accenture | `logos/accenture.svg` | Commons `Accenture.svg` | Public domain | #A100FF / black |
| Bain & Company | `logos/bain.svg` | Commons `Bain_&_Company_logo.svg` | Public domain | #CB2026 |
| Deloitte | `logos/deloitte.svg` | Commons `Logo_of_Deloitte.svg` | Public domain | #0F0B0B / #86BC24 |
| McKinsey & Company | `logos/mckinsey.svg` | Commons `McKinsey_and_Company_Logo_1.svg` | Public domain | #24477F |
| Morgan Stanley | `logos/morganstanley.svg` | Commons `Morgan_Stanley_Logo_1.svg` | Public domain | #000000 |
| Novo Nordisk | — | No reusable vector found (Commons file is a non-free PNG) | — | ⚠️ shown as the name in type, #001965 |

## Seals (public-domain government artwork, shown flat)
California (`Seal_of_California.svg`), SEC, U.S. Census Bureau, U.S. Department of Education (all Commons, public domain); FTC from news1001.

## Maps
U.S. states (U.S. Census Bureau) and world (Natural Earth), public domain, `public/dc/geo/`.

## Places
San Francisco (Transamerica Pyramid), New York (Empire State Building), London (Elizabeth Tower): 2.5D replicas drawn in code from their real silhouettes (`Landmark` in `propsB.tsx`); no photos reused. The data-centre town is a generic replica (no specific site is named in the script).

## Voice
Asher, ElevenLabs voice `tMvyQtpCVQ0DkixuYm6J`, `eleven_multilingual_v2`, one take per chapter (`public/news1003/vo/s0–s7.mp3`), 8,379 credits.

## Sound
One swoosh only: BigSoundBank `public/sfx/whoosh7.mp3` (0.94 s, CC0), once per scene exit. No music (user's rule).

## Fonts
Instrument Sans, Hanken Grotesk, IBM Plex Mono — SIL OFL, bundled in `public/fonts` (Autopilot Blue).
