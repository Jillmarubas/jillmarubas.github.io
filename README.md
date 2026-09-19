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
| `tools/` | `kie-video.py` — generates a video through the kie.ai API and downloads it. |
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

## Generating a video

`tools/kie-video.py` submits a prompt to [kie.ai](https://kie.ai), polls the task until
it finishes and downloads the result. It needs an API key:

```sh
export KIE_API_KEY=...
tools/kie-video.py --prompt "a slow dolly across a desk at night" --model veo3_fast
```

Veo models (`veo3_fast`, `veo3`) go through kie.ai's dedicated Veo endpoints; anything
else (`sora-2-text-to-video`, `kling-v3-0`, ...) goes through the generic job endpoints.
Pass `--image <public URL>` to animate a still instead of generating from text alone.
Videos land in `out/`, which is not committed.

## Contact

- jillmar.automation@gmail.com
- WhatsApp +60 11 3324 0261
