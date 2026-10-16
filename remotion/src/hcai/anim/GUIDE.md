# Building a chapter as 2D animation

The film ("The Hidden Cost of AI", composition `HiddenCostAI-strip`) is being rebuilt so every scene is an
informative 2D animation in one saturated style. The cold open (`Laptop.tsx`, `Town.tsx`, `Coins.tsx`, `Chain.tsx`,
`co.tsx`) and chapter 1 (`ch1a.tsx`, `ch1b.tsx`) are done. They are the reference for look, density and timing:
read them before writing anything.

## Where things go
- Scenes for chapter N: `src/hcai/anim/chN.tsx`. Export each scene as a `React.FC<AnimProps>` and register it in
  `SCENES_N` (key = lowercase id like `c3drought`, value = the component). Don't edit `index.ts`; it already spreads
  `SCENES_N`.
- Placement: `src/hcai/edits/chN.json` → `{"edits": [{"ch": N, "from": s, "to": s, "mode": "anim", "ref": "<key>",
  "note": "..."}]}`. An edit removes every old scene that starts in `[from, to)` and puts yours at `from`. It runs until
  the next scene starts. Times are film seconds (see the brief).
- Cover the whole chapter from just before the first narration word (`vo` − 0.1 at the earliest) to the chapter end.
  Leave no old scene behind, except every `board map` scene: keep those exactly. Don't start an edit inside a map's
  span; start your next scene where the map's span ends, which is where the next old scene began.
- Don't touch other chapters' files, `Strip.tsx`, `lib.tsx`, `akit.tsx` or shared JSON. If you need a new reusable
  drawing, define it locally in your chapter file.

## The kit
- `akit.tsx`: `P` (palette), `AF` (fonts), `AnimProps` ({f, t0, dur}), `at(t0, abs)` (frame of a film time),
  `ease`, `pop`, `lerp`, `Tag`, `Note`.
- `lib.tsx`:
  - stage: `Bg`, `Cam` with keyframes `[time, x, y, zoom, turn°, tilt°]`, `World` (an svg layer), `Put`
    (place, scale and pop-in an illustration)
  - illustrations, centred on 0,0 at about 200 units: DataCentre, Rack, Chip, Laptop, Phone, PowerPlant,
    CoolingTower, NuclearPlant, WindTurbine, SolarPanel, Pylon, Bolt, Drop, Glass, House, Office, Factory, Person,
    Crowd, Coin, Banknote, Bill, Clock, Thermometer, Fan, CloudShape, Sun, Truck, Rock, Pickaxe, Battery, Globe, Doc,
    Gavel, Ship
  - motion: Pipe, Flow (glowing dots along a path), Arrow
  - info: Counter, Bars, Donut, IconGrid, Meter, Timeline, Caption (bottom fact line, optional source), Label
    (corner title), Pop (a word or number that pops in)
- `const w = (abs: number) => at(t0, abs);` then key everything to spoken words: `pop(f, w(173.0))`.

## The bar for every scene
1. **It explains, not decorates.** Show the mechanism or the number being said: flows for processes, bars, counters
   or grids for quantities, a before/after for change, a map pin for a place. Ask "what would a viewer learn with the
   sound off?"
2. **It moves with the words.** Elements appear on the word that names them, from `words:` in the brief. At least
   one thing is always moving: a camera move (`Cam`), flowing dots, spinning fans, smoke, a counter.
3. **It varies the camera.** Mix wide, close, isometric (see `Town.tsx`, `C1Neighbours`), side-on and low angles, and
   tilt or turn with `Cam` keys. Don't make every scene a flat centred diagram.
4. **It's accurate.** Use only numbers in VERIFY.md or in the narration itself, and put the source in `Caption`'s
   `source` or a `Note`. Don't invent statistics or counters. Mark illustrative proportions "illustration".
   Simple arithmetic on verified numbers is fine (chapter 1 shows 100,000 × 700 W = 70 MW).
5. **People, brands and places.**
   - No logos and no caricatures of real people. Show a named person as a generic figure or a name card
     (`Tag` with name + title).
   - Companies are names in a `Tag`, never logos.
   - Places get a `Label` (name + one line of context).
6. **It's readable.** Text is at least 28 px (1920×1080 canvas) and stays 70 px from the edges. Don't put two
   captions on screen at once, and don't stack a `Label` and a `Pop` in the same spot. Write in plain words, the
   way someone would say it.
7. **It's clean.** It's saturated against dark or vivid grounds (navy, plum, teal, sky, sand), uses one or two accent
   colours, and keeps the background simple.

Scene length: merge a few of the old scenes into one scene that builds up. Most scenes run 5–20 s. Change scene on
an idea change, not every sentence. A chapter is usually 15–28 scenes.

## Checking
1. `cd /home/user/jillmarubas.github.io/remotion && npx tsc --noEmit -p .` must pass. Keep your file compiling at all
   times, and write whole files rather than half-finished edits: other chapters are bundled from the same tree.
2. `scripts/hcai_stills.sh N /tmp/chN-stills` renders two stills per scene (it waits its turn on a lock), then tiles
   them into sheet1.jpg, sheet2.jpg and so on. Open them with the Read tool and look hard: overlaps, text off
   screen, empty frames, unreadable bits, scenes that don't explain anything. Fix, then re-check. Three rounds is
   plenty.
3. Don't commit, push, render on Lambda or change anything outside your chapter's two files. Report back with the
   scene list (id, from–to, one line on what it shows), any facts you used with their sources, and anything you
   weren't sure about.
