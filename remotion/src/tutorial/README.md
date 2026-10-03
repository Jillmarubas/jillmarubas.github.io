# Screen tutorial template (dark-mode MacBook)

Horizontal 1920×1080, 30 fps. A space-black laptop on a dark desk, a macOS-style dark desktop,
a cursor that glides and clicks, camera zooms onto the part being explained, captions for the
voiceover. Everything is drawn in code: no Apple marks, no real app icons.

Demo: composition `TutorialDemo` (`Demo.tsx`), 12.4 s, fictional app "Flowbase".

## Making a real tutorial from a script
1. Copy `Demo.tsx` to a new file and register it in `Root.tsx`.
2. **Screens:** rebuild the app's screens as components laid out in screen points (1512×945),
   or drop real screenshots in `public/tutorial/` and show them with `<ScreenImage>`.
3. **Voiceover:** ElevenLabs, Asher (`tMvyQtpCVQ0DkixuYm6J`) unless the user picks another.
   Time words with faster-whisper (see `scripts/news1003_timing.py`) and pin keys to words.
4. **Keys** (all "arrive at frame f"):
   - `CURSOR: CursorKey[]` — `{f, x, y, click?}`. Glide length follows distance (12–28 f) with a slight arc.
   - `CAMERA: CamKey[]` — `{f, zoom, x, y, dur?}`. Zoom 1 = whole laptop; it never shows past the stage edge.
   - Typing: `keystrokes(text, start)` + `typedAt(...)` (~13 chars/s, slightly uneven).
5. **Overlays** (`kit.tsx`): `Button` (hover/press), `Field` (caret), `Highlight` (ring + dim),
   `Toast` (notification), `Caption` (subtitle, words rise in).
6. Render on Lambda: `FRAMES_PER_LAMBDA=24 ./render-lambda.sh <Comp> out/<name>.mp4`.

## Files
| File | What |
|---|---|
| `theme.ts` | Colours (macOS dark + system blue accent), easings, screen/laptop geometry |
| `MacBook.tsx` | `Studio` backdrop, `MacBook` frame (rim, bezel, notch, base, shadows, glass), `ScreenImage` |
| `Desktop.tsx` | `Wallpaper`, `MenuBar`, `Dock` (magnify + bounce), `Window` (grows from its Dock icon) |
| `timeline.ts` | `cursorAt`, `cameraAt`, `cameraTransform`, `keystrokes`, `prog`, `isOver` |
| `kit.tsx` | Cursor and overlay components |
| `fonts.ts` | Inter 400–700 + IBM Plex Mono, bundled |
