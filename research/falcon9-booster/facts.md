# Falcon 9 booster: verified facts and landing maths

For "How SpaceX Lands a Rocket That Can't Hover" (Teardown Lab). Checked 23 Oct 2026.
Tier A = SpaceX or NASA primary source. Tier B = well-cited secondary source (Wikipedia with citations,
specialist infographics). Tier C = estimate or derived; on screen only with "about" or as an illustration.

## The vehicle (Tier A unless marked)
| Fact | Value | Source |
|---|---|---|
| Height, whole rocket | 70 m (229 ft) with both stages, interstage and fairing | SpaceX Falcon User's Guide (2021), p. 8 |
| Diameter | 3.66 m (12 ft) | User's Guide p. 8 |
| First-stage (booster) height | 41.2 m, or 47.7 m with interstage | Tier B: spec sheets |
| First-stage engines | 9 Merlin 1D: 8 in a circle around a centre engine | User's Guide p. 7 |
| Thrust per engine | up to 854 kN (190,000 lbf) at sea level; 7,686 kN total at liftoff | User's Guide pp. 7–8 |
| Throttle range per engine | 190,000 lbf down to 108,300 lbf (≈ 482 kN) at sea level | User's Guide p. 8 |
| Propellants | Liquid oxygen + RP-1 kerosene | User's Guide p. 8 |
| Tanks | Aluminium-lithium alloy walls, friction-stir welded; a common dome separates the LOX and RP-1 tanks | User's Guide p. 7 |
| Oxygen feed | A double-wall transfer tube carries LOX through the centre of the RP-1 tank to the engines | User's Guide p. 7 |
| Tank pressure | Heated helium | User's Guide p. 8 |
| Recovery hardware | 4 grid fins near the top, 4 deployable legs at the base | User's Guide p. 7 |
| Coast control | Nitrogen gas thrusters (recovery only) | User's Guide p. 8 |
| Interstage | Carbon fibre over an aluminium honeycomb core | User's Guide p. 7 |
| Stage separation | Helium releases 3 latches; 4 pneumatic pushers (plus a centre pusher) push the stages apart | User's Guide p. 8 |
| Grid fins | Single-piece cast and machined titanium | Tier B: Wikipedia, Falcon 9 Block 5 |
| Booster empty mass | ≈ 22,200 kg | Tier B: Wikipedia, Falcon 9 Block 5 (**get a better source**) |
| Propellant capacity | LOX ≈ 287,400 kg, RP-1 ≈ 123,500 kg | Tier B: Wikipedia, Falcon 9 Block 5 |
| Merlin injector | Pintle injector (also used in the Apollo lunar module descent engine) | Tier B: Wikipedia, SpaceX Merlin |
| Reuse record | B1067's 37th flight and landing, 25 Aug 2026 | AIAA |

## The return trip
| Phase | What happens | Source |
|---|---|---|
| Boostback | Engines relight to turn the stage back toward the landing site (~30 s on 3 engines on a 2015 flight) | NASA Space Launch Report data sheet (Tier A/B) |
| Grid fins | Deploy before the entry burn and steer through the atmosphere | NASA data sheet; User's Guide |
| Entry burn | 3 engines, roughly 70 km → 40 km altitude, to slow down and protect the stage | Tier B: ZLSA infographic |
| Landing burn | Usually the centre engine alone (some missions use 3); lit at roughly 8 km in older profiles; ~32 s single-engine burn on a 2015 flight | NASA data sheet; ZLSA |
| A recent timeline | Crew-13: entry burn shutdown T+6:32, landing burn start T+7:24, landing T+7:41 | Space Launch Schedule (Tier B) |
| Failure examples | 2018: grid-fin hydraulic pump stalled, booster spun into the sea. Aug 2024: a leg collapsed and the booster tipped off the droneship | Wikipedia, B1050; CBS News |

## The maths (Tier C, derived from the Tier A/B numbers above)
- **Why it can't hover.** One Merlin at its lowest setting still pushes ≈ 482 kN. A nearly empty booster
  (≈ 22 t plus a few tonnes of leftover propellant, say 25–30 t) weighs m·g ≈ 245–295 kN. Thrust ÷ weight
  ≈ 1.6–2.0, so even at minimum throttle it accelerates upward. It can't hold still in the air; it must
  reach **zero speed at exactly zero height** (a "hoverslam" or "suicide burn").
- **Braking on the lowest setting.** a = T/m − g ≈ 482 000 / 25 000 − 9.81 ≈ 9.5 m/s², about 1 g of braking.
  At full power (854 kN): 854 000 / 25 000 − 9.81 ≈ 24 m/s², about 2.5 g.
- **When to light the engine.** Stopping distance d = v² / (2a). Example: falling at 250 m/s with 2 g
  braking (≈ 19.6 m/s²): d = 250² / 39.2 ≈ 1,600 m. Light it higher and it stops in mid-air and climbs
  back up; lower and it hits the deck.
- **Why it gets harder.** It keeps burning fuel, so m falls and a = T/m − g rises. The computer throttles
  continuously (within the 482–854 kN range) to land on zero.
- **One-second error.** At 250 m/s, being one second late means 250 m less to stop in.

## Still open (fill before the script locks)
- Real booster speed and altitude at landing-burn start for one specific recent flight. SpaceX webcasts
  show stage-1 speed and altitude on screen: pick one flight and read them off the webcast frame by frame.
  Until then the script says "hundreds of metres per second" and labels the example numbers as an example.
- A better source than Wikipedia for the empty mass (≈ 22 t).
- Landing legs: material and stroke (the User's Guide only says "four deployable legs").

## 3D model: what each feature is based on (model.ts)
Tier A/B features are modelled as documented. "Photos" means shape and placement taken from public
launch and landing photos, with proportions estimated. "Illustrative" means not published; say so on screen.
| Feature | Basis | Tier |
|---|---|---|
| 3.66 m diameter, 41.2 m stage, 47.7 m with interstage, 70 m total, 5.2 m × 13.2 m fairing | User's Guide; spec sheets | A/B |
| LOX tank on top, RP-1 below, common dome between them | User's Guide p. 7 | A |
| Tank split by volume (LOX ≈ 252 m³, RP-1 ≈ 152 m³) | Derived from the propellant masses above | C |
| Double-wall LOX transfer tube through the centre of the RP-1 tank | User's Guide p. 7 | A |
| RP-1 tank skin-and-stringer, LOX tank monocoque (48 stringers drawn) | Wikipedia, Falcon 9 Block 5 (stringer count illustrative) | B |
| Helium COPVs inside the LOX tank, held on struts | Spaceflight101 (both stages); CRS-7 strut finding (2nd stage). Count and position on stage 1 illustrative | B |
| 9 Merlin 1D, 8 around a centre engine, on an eight-sided bolted octaweb | User's Guide p. 7; Wikipedia, Block 5 | A/B |
| Merlin parts: pintle injector, gas generator, turbopump, turbine exhaust duct, gimbal actuators | Wikipedia, SpaceX Merlin; photos (proportions illustrative) | B |
| Heat shield at the base | Wikipedia, Block 5 | B |
| Black interstage (carbon fibre over aluminium honeycomb) | User's Guide p. 7 | A |
| Black raceway up the side; black legs and interstage (thermal coating) | Wikipedia, Block 5; photos (position illustrative) | B |
| 4 titanium grid fins on the interstage, folded up when stowed, hydraulic | User's Guide p. 7; Wikipedia, Block 5 | A/B |
| 2 nitrogen thruster pods on the interstage | User's Guide p. 8 (thrusters); photos (pods) | A/photos |
| Stage separation: centre pusher plus 4 pneumatic pushers | User's Guide p. 8 | A |
| 4 legs, carbon fibre with aluminium honeycomb, hinged at the base, stowed pointing up, swing down and out | Spaceflight Now (SpaceX website), 2014 | B |
| Leg span ≈ 18 m, length 9.3 m, telescoping pusher strut (4 stages) | Photos; span is widely quoted but unsourced | C |
| Droneship deck ≈ 91 m × 52 m | Tier B spec | B |
| No logos or names on any part | Channel rule | — |

Extra sources: Spaceflight101 on COPVs in LOX (https://spaceflight101.com/?p=23029); Spaceflight Now on the
legs (https://www.spaceflightnow.com/falcon9/009/140223legs/).

## Sources
- SpaceX Falcon User's Guide (Sept 2021): https://web.mit.edu/2.70/Reading%20Materials/SpaceX%20Falcon-users-guide-2021-09.pdf
- NASA Space Launch Report, Falcon 9 v1.2 data sheet: https://sma.nasa.gov/LaunchVehicle/assets/spacex-falcon-9-v1.2-data-sheet.pdf
- Falcon 9 Block 5: https://en.wikipedia.org/wiki/Falcon_9_Block_5
- SpaceX Merlin: https://en.wikipedia.org/wiki/SpaceX_Merlin
- Falcon 9 B1050: https://en.wikipedia.org/wiki/Falcon_9_B1050
- ZLSA Design, downrange propulsive landing: https://zlsadesign.com/infographic/trajectory/spacex-falcon9-booster-dpl/
- Crew-13 timeline: https://spacelaunchschedule.com/launch/falcon-9-block-5-crew-13
- Everyday Astronaut, Starship vs Falcon 9 (hoverslam): https://everydayastronaut.com/definitive-guide-to-starship/
- AIAA reuse record: https://aiaa.org/2026/08/25/spacex-falcon-9-booster-sets-reuse-record-with-37th-flight/
- CBS News, 2024 landing failure: https://www.cbsnews.com/amp/news/spacex-falcon-9-grounded-faa-crash-landing
