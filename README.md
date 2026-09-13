# Jillmar Ubas — portfolio

AI Specialist building n8n agents, Zapier automations and CRM pipelines that validate
their own inputs and log every run — plus the sites they plug into.

The live site is published from `site/` by GitHub Actions on every push to `main`.

## What's in here

| Path | What it is |
|---|---|
| `site/` | The published site — `index.html` (portfolio), `cv.html` (CV), images, certificates, CV PDF. |
| `design-system/` | Two design systems and the drop-in layers running on the site. `design-system/README.md` is the index. |
| `backups/` | Earlier versions kept for reference: the original orange design, the pre-glass version, and the black/white Settle rebuild. Not published. |
| `.github/workflows/pages.yml` | The deploy workflow. |

## The site, briefly

Plain HTML and CSS — no framework, no build step. `site/index.html` opens in a browser
as-is. Three layers sit on top of the base design, each documented in
`design-system/`:

- **Frost glass** — the orange gradient field behind the whole page, with dark frosted
  surfaces over it.
- **Settle Motion** — the motion system: logo intro, headline words brightening on
  scroll, blur-in stagger, counters, a morphing copy button.
- **Container transform** — certificates and workflow screenshots grow from the card
  into an overlay using the View Transitions API, with a crossfade fallback.

Everything respects `prefers-reduced-motion`, and the CV prints as plain white paper
regardless of what the screen shows.

## Contact

- jillmar.automation@gmail.com
- WhatsApp +60 11 3324 0261
