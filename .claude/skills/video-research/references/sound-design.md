# Film sound design: psychoacoustics and aesthetics (detail)

Source: the user's report *The Psychoacoustics and Aesthetics of Film Sound Design: Engineering
Emotional Resonance in Audiovisual Media* (references Murch, Chion, Randy Thom, PLOS ONE emotion
studies).

## History in one paragraph
- **1927:** synchronous sound arrives (the "talkies") and live orchestras go silent. Sound was first
  treated as a technical add-on.
- **1940s–1970s:** formats develop from Vitasound and Fantasound to Dolby Stereo, then to digital
  multitrack.
- **Late 1970s:** the title "sound designer" is coined for Walter Murch (*Apocalypse Now*) and Ben
  Burtt (*Star Wars*), a role on a par with the director of photography. Sound shapes picture as much
  as picture shapes sound.

## Chion's audio-vision vocabulary
| Concept | What it is | Use |
|---|---|---|
| Synchresis | Sound and image that happen together fuse into one event | Give any designed sound to any visual; the basis of all SFX editing |
| Added value | Sound changes what the image *means* | Set the emotional reading before the image is analyzed |
| Acousmatic | Sound with no visible source | Suspense, mystery, world beyond the frame, projection of fears |
| Acousmêtre | A voice or presence that stays unseen | Feels everywhere and all-powerful because it has no visible limits |
| Empathetic | Sound matches the mood | Reinforce the emotion; easy to absorb |
| Anempathetic | Sound indifferent to the action (cheerful song over violence, a shower still running after a murder) | Irony and amplified horror; bypasses emotional defenses |
| Rendering | Sound of the *sensation*, not the literal acoustics | Bone-crushing hits, felt impact |

Example: *The Texas Chain Saw Massacre*'s atonal musique concrète (rattles, clanks) offers no comfort at all.

## Multisensory integration (why sync matters)
- **Ventriloquist effect:** the brain pulls a sound's location toward a simultaneous visual,
  weighted by reliability. Vision is sharper in space, so it "captures" the sound.
- **Integration happens before awareness:** EEG with masking shows audio-visual binding within
  roughly the first 220 ms, before conscious broadcast. The emotional weight of a designed hit lands
  before the viewer can judge whether it's "real".
- **Ventriloquism aftereffect:** sustained sync recalibrates where viewers hear sounds coming from,
  which deepens immersion.
- **Rule:** put effects on the exact frame of the visual event.

## Emoacoustics: fear vs calm
- **Acoustic roughness:**
  - Amplitude modulation at **30–150 Hz**: too fast to hear as beats, too slow to hear as a pitch.
  - Aversion **peaks around 40 Hz** and disappears above about 130 Hz, where it fuses into pitch.
  - It's the signature of screams, distressed animals and alarms.
  - It goes straight to the **superficial amygdala** (threat), bypassing slower cortical analysis.
- **Fear music (fMRI):** less activity (BOLD) in the auditory cortex, more in the amygdala and the
  right somatosensory cortex. The amygdala couples with the visual cortex (cuneus) and parietal lobe,
  so viewers become **visually hyper-vigilant**.
- **Joy music** (low dissonance, strong chords): more auditory-cortex activity, a relaxed, analytical,
  empathetic state.
- **Timbre:** harsh, fast attacks read as aggression; soft, slowly evolving sounds read as intimacy.
- **Priming:** low-frequency rough beds make later jump scares hit far harder.
- **Repo:** synthesize roughness with numpy in the `remotion/scripts/make_*` generators. Example: a
  drone multiplied by `1 + 0.8*sin(2π·40·t)`. Keep explainer beds smooth.

## Foley
- Named after Jack Foley: live, performed effects in sync with picture (footsteps, cloth, props).
- It's psychological, not literal. Texture, weight and attack carry character (stealthy, vulnerable,
  predatory).
- **Process:**
  1. Spotting: mark every needed sound.
  2. Performing and recording to picture.
  3. Editing and syncing.
- **Effect:** tactile detail (snow crunch, leather creak) reads as physical closeness, so later
  violence or tragedy hits an emotionally exposed audience.

## Ben Burtt: organic sources ("reality hook")
| Sound | Source | Effect |
|---|---|---|
| Darth Vader's breathing | Burtt breathing through scuba gear at different speeds | Claustrophobic, mechanical intimacy |
| Lightsaber | Idling 35 mm projector + broken TV-tube hum, with Doppler | Barely contained, dangerous energy |
| TIE fighter scream | Elephant bellow, slowed and altered | Predatory, animal aggression |
| R2-D2 | 50/50 ARP 2600 synth + Burtt's own baby-like vocals | Emotion technology can carry |
| Blasters | Hammer on a radio-tower guy-wire | Sharp, physical, kinetic |
| Speeder bike | P-51 Mustang + P-38 Lightning | Thrill of dangerous speed |

**Rule:** build fantastic sounds from real recordings, pitched, slowed, reversed or layered.

## Walter Murch: dense clarity and the rule of five
- *Apocalypse Now* had 175+ tracks in one sequence. Played all at once it became a "logjam"; it
  sounded "brown".
- **Light analogy:** all colors together = white light, white noise. Harmonic sounds superimpose
  without limit (a chord, an orchestra in key). Film mixes non-harmonic sounds, which do have a limit.
- **Murch's estimate:** about 2.5 distinct streams per brain hemisphere, so roughly **5 layers** before
  masking and overload.
- **Spectrum, from encoded to embodied:**
  - **Violet,** dialogue: decoded language, takes the most attention.
  - **Blue,** linguistic effects: footsteps mean walking, a knock means arrival.
  - **Yellow,** centaur effects: half literal, half musical.
  - **Orange,** atmospheres and tonal effects: room tone, wind, rumble.
  - **Red,** music: processed whole, emotionally.
- **Rule:** one layer of each color at most. A 6th layer means removing one. When urgent dialogue
  arrives, **drop the music** ("I'm not going, I'm not going!").
- **Subliminal triggers:** in *The English Patient*, a faint distant bell (the first sound of
  civilization) sets off a flashback and moves the mood from war to memory.
- **Silence is constructed.** Film silence didn't exist before 1927. Pulling all sound out (Caravaggio's
  realization) makes a vacuum the viewer fills with anxiety, often stronger than an orchestral swell.
- **Worldizing:** play sounds back in a real space and re-record them to capture real reverb.

## Abstract sounds: The Matrix (Dane Davis)
- Every sound, even code or "bullet time", must carry emotion; mimicry alone fails.
- Give digital actions **physical mass**: air drag, heavy Doppler, synthesized arcs, low transients.
  Viewers then feel the effort and the stakes.

## Case studies
- **The Zone of Interest (Johnnie Burn):** the picture shows a pastoral home; the sound is the camp
  next door.
  - Built from a 600-page research document.
  - All the horror is acousmatic: crematoria roar, gunshots, muffled screams.
  - Ambiguous sounds (train whistle, baby, scream) make viewers build the horror themselves.
  - Viewers get used to it ("territorial listening"), then realize they tuned out murder: complicity
    and the moral point.
- **A Quiet Place (Erik Aadahl, Ethan Van der Ryn):**
  - Point of audition: the whole mix drops into Regan's deafness; her cochlear implant is shown as
    feedback and frequency isolation.
  - Long near-silences lower the viewer's threshold, so a nail step or a creature click lands like a blow.
  - Worldized creature sounds.

## Mix chain we use (ffmpeg)
```
# VO clean-up
highpass=f=90, equalizer=f=<room resonance>:t=q:w=8:g=-4, acompressor=threshold=-20dB:ratio=3:attack=10:release=120, highshelf=f=8000:g=2
# music: carve the voice range, then duck under the VO (sidechain)
[music]equalizer=f=2500:t=q:w=1:g=-3[m]; [m][vo]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[ducked]
# master (house standard, two-pass)
loudnorm=I=-14:TP=-1:LRA=11  -> 48 kHz
```
- **Ducking** (sidechain compression) keeps the music's momentum in the pauses and gets it out of
  the way of words.
- **Parametric EQ** with a narrow Q removes room resonances.
- **High-shelf** adds air and crisp consonants.
- **Linear-phase EQ** for transparent mastering.
