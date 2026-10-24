# Falcon 9 booster teardown: what people are curious about

Collected 23 Oct 2026 for the Teardown Lab full teardown episode. Raw data first, then what it means
for the script. Numbers marked **verify** need a primary source (SpaceX user guide, NASA) before they
go on screen.

## Raw data

### Google autocomplete (what people type into Google)
- "how does falcon 9 …": **land**, deploy satellites, work, release satellites, **survive reentry**,
  **landing legs work**, **return to earth**, landing work, how do falcon 9 boosters land, what does it use for fuel
- "why does falcon 9 …": **glow**, use kerosene (the rest is news: the Moon impact story, crashes, launches today)
- "how does spacex land …": rockets, land, **back on earth**, boosters, their boosters, on the moon, on mars, starship
- "how does the spacex rocket …": land back on earth, explode, fuel, how fast, cost
- "how much fuel does falcon 9 …": use, **use per second**, hold, burn, carry, gallons, fuel cost
- "how tall is falcon 9 …": rocket, **booster**, **first stage**, second stage, with Crew Dragon, **in stories**
- "what happens to falcon 9 …": second stage, upper stage, fairings

### YouTube search suggestions (what people type into YouTube)
- "spacex booster …": **catch**, **landing**, explosion, catch reaction, return, landing on barge, landing reaction
- "falcon 9 landing …": on drone ship, compilation, failure, first time, reaction, **sonic boom**, **landing legs**, boat
- "how spacex lands …": rocket, landing works, how do spacex rockets land
- "how do rockets land …": on the moon, back on earth
- "falcon 9 explained", "inside falcon 9", "how spacex rocket works", "how spacex rocket return to earth"

(Reddit's search API blocks automated requests, so Reddit wasn't sampled.)

## What it means

1. **Landing is the number one question, by far.** It leads Google ("how does falcon 9 land") and
   YouTube ("booster landing", "booster catch", "how spacex landing works"). Make it the main open
   loop: ask it in the first seconds, answer it in the last chapter.
2. **Coming back through the atmosphere is the second mystery**: "survive reentry", "return to earth".
3. **People want scale in human terms**: "how tall is falcon 9 booster / first stage / in stories". This
   backs the human-on-the-rocket opening.
4. **Fuel numbers fascinate**: "how much fuel … per second", "why kerosene". Good mid-video hooks.
5. **Small "why" puzzles work as chapter hooks**: "why does it glow" (the twilight "jellyfish" plume),
   "landing legs", "sonic boom".
6. **Out of scope for a booster teardown, good for the ending or a next episode**: second stage,
   fairings, deploying satellites, Starship booster catch.

## Facts gathered (verify each before it goes on screen)
| Fact | Value | Source |
|---|---|---|
| Whole rocket | ~70 m tall, 3.7 m wide | SpaceX Falcon 9 page |
| First stage (booster) | 41.2 m tall (47.7 m with interstage), 3.7 m wide | Wevolver spec sheet (**verify** with SpaceX) |
| Booster in storeys | 41.2 m ÷ ~3 m per storey ≈ 14 storeys | derived |
| Engines | 9 Merlin 1D; ~7,600 kN at sea level; ~162 s burn | Wevolver (**verify**) |
| Propellant | ~395,700 kg liquid oxygen + RP-1 kerosene | Wevolver, Spaceflight101 (**verify** for Block 5) |
| Average burn rate | 395.7 t ÷ 162 s ≈ 2.4 t a second, if it all burned. Some is kept for landing, so the real figure differs | derived (**verify**) |
| Reuse record | B1067's 37th flight, 25 Aug 2026, landed on the droneship *A Shortfall of Gravitas* | AIAA |
| Landings | 650th successful Falcon booster landing reported 15 Aug 2026 | GK Today (**verify**: sources disagree) |
| A failure for tension | Aug 2024: a landing leg collapsed and the booster tipped off the droneship | CBS News |
| The glow | Twilight sunlight on the high-altitude exhaust (mostly water vapour and CO₂) while the ground is dark | NASA APOD, 19 Mar 2026 |

## Sources
- SpaceX Falcon 9: https://new.spacex.com/vehicles/falcon-9
- Falcon 9 Block 5 specs: https://wevolver.com/specs/falcon-9-v12-or-full-thrust-block-5
- Falcon 9 v1.1 overview: https://spaceflight101.com/spacerockets/?p=56
- NASA, the two-stage Falcon 9: https://blogs.nasa.gov/commercialcrew/2020/05/27/the-two-stage-spacex-falcon-9/
- AIAA, reuse record: https://aiaa.org/2026/08/25/spacex-falcon-9-booster-sets-reuse-record-with-37th-flight/
- 650th landing: https://www.gktoday.in/spacex-sets-dual-falcon-9-launch-record/
- 2024 landing failure: https://www.cbsnews.com/amp/news/spacex-falcon-9-grounded-faa-crash-landing
- Jellyfish plume: https://apod.nasa.gov/apod/ap260319.html
