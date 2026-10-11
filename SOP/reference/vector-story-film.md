# Story-driven 2D vector films ("like watching a movie")

The user's standing request for story videos (set after the data-centres city-world edition,
Sept 2026): **tell a story with 2D vector graphics so that every line of the script is its own
scene, where you can see the emotion and the scenery, like watching a movie.** Information
cards alone are not enough; the picture has to *act out* each line.

What the city-world edition did well and should keep: one illustrated world, a flying camera,
living backgrounds (cars, walkers, birds, smoke, water), flags that change the world with the
story. What it lacked and every story film must have: **a main character we follow, faces
with emotions, and a shot chosen for each line.**

## 1. Story first (before any art)
- **A main character.** One person whose life the story passes through (a neighbour, a
  worker, a kid). Give them a home, a want and a problem. Name them only if the script does;
  never model them on a real private person.
- **Map each chapter to a beat in their life**: normal day → disturbance → it gets worse →
  the other side / a turn → the decision → the change. Write this beat sheet next to the script.
- **Every script line gets a scene.** Make a shot list with one row per line (see §3). No row
  may be "text card over background"; data can appear, but inside a scene (on a phone screen,
  a letter, a billboard, a TV in the room, a hand-drawn overlay over the action).
- **Callbacks.** Plant 2–3 images early (a window, a mug, a sound, a tree) and bring them back
  changed at the end.

## 2. Characters that can act
Build a character rig in `src/<project>/cast.tsx`, not static figures:
- **Face:** eyes (blink every 90–150 f, 4 f close), brows (angle carries most of the emotion),
  mouth (shape set per emotion; flap open/closed on voiced words when the character is the
  one speaking), cheeks blush for embarrassment/cold.
- **Expressions as presets:** `neutral, happy, worried, sad, angry, shocked, tired, hopeful,
  determined`. Blend between presets over 6–10 frames, never snap.
- **Body:** head tilt, shoulder raise/slump, arm poses (`hands-on-hips, cover-ears, hold-phone,
  hold-letter, point, wave, arms-crossed, hug`), walk and run cycles, sit, a breathing idle
  (2 px, 90 f cycle) so nobody is ever frozen.
- **Turnarounds:** front, 3/4 and side views; flip for left/right.
- **Consistent design:** the same palette, proportions and outfit every scene (change the
  outfit only for a story reason: night-clothes, a coat in winter).
- Supporting cast (family, officials, workers, a crowd) reuse the rig with seeded variety.

## 3. Shot grammar (pick one per line)
| Shot | Use it for | Camera |
|---|---|---|
| Establishing / wide | new place, time jump, chapter start | slow push or drift, z ≈ 0.3–0.5 |
| Medium | a character doing something | eye level, gentle push |
| Close-up | an emotion, a reaction | on the face, z ≈ 2–3, hold still |
| Insert | an object that carries the line (a bill, a well, a phone, a sign) | tight, often from above |
| Over-the-shoulder / POV | what the character sees | behind them, their silhouette in the foreground |
| Reaction | right after a surprising fact | cut to the face, 1–2 s |
| Montage | a list ("a hum, a bill, a dry well…") | quick cuts, one image per item |
| Low / high angle | power (the building looms) / helplessness (she looks small) | tilt the world ±3–6°, change the horizon height |
The shot list row for each line: `line · beat · shot · location · time of day · character
pose + expression · what moves · any data shown in-scene · SFX`.

Rhythm: wide → medium → close → insert, then open wide again. Change the shot on every line,
but reuse a set-up (same place and angle) when returning to it so the audience feels at home.
Cuts land on the line boundaries (whooshes are timed to them); use a camera move instead of a
cut when two lines share a place.

## 4. Mood through scenery
- **Colour script:** plan the palette per chapter before drawing (e.g. warm morning → grey
  worry → cold night → orange conflict → soft hopeful dawn). Keep it in `design.ts`.
- **Time of day and weather carry emotion:** rain for worry, night for loneliness or fear,
  golden hour for hope and endings, harsh noon for heat and conflict.
- **Lighting:** a light source per scene (window glow, street lamp, screen light on a face),
  soft shadow under everything, rim light on the character in close-ups.
- **Depth:** 3–4 parallax layers (far sky, far hills/skyline, mid scene, foreground framing
  like leaves, a window frame or a fence) moving at different speeds. Foreground framing is
  what makes it feel like a film instead of a diagram.
- **The world stays alive:** wind in trees, cars, birds, steam, flickering windows, the
  character's idle. Never a fully still frame.

## 5. Film finish
- Letterbox bars are optional (ask); a gentle vignette and a light film grain (static, from a
  grain texture such as `public/grain-1024.png`, not re-seeded every frame) are the default for story films.
- Transitions: match cuts (circle → sun), wipe with a foreground object passing the lens,
  whip-pan along the world, iris to a window. Keep the "enter from a side, exit toward the
  viewer" rule for any overlay pieces.
- Sound: ambience per place (street, desert wind, night crickets), foley for actions (letter
  tear, door, footsteps), and music that follows the colour script only if the user asks for music. Keep all SFX clearly audible.

## 6. QA additions
- Contact-sheet every line's scene, not just every chapter. Check each frame answers: *where are
  we, who is here, what are they feeling, what is the line about?* If one answer is missing,
  fix the shot.
- Check the character's expression matches the words on that line.
- Check the same character looks the same in every scene.
