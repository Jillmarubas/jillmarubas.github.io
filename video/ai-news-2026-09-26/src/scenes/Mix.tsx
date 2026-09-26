import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {resolveBeats} from '../beats';
import {isCountable} from '../components/Kinetic';
import {FPS} from '../theme';
import manifest from '../../public/audio/manifest.json';
import {BLOCKS, sec, wi} from '../timeline';

// Music and SFX are synthesised in code by synth/ (`npm run audio`), not sourced. The
// music's level curve is baked in (src/musicDuck.ts). Gains come from ebur128: VO is
// -16 LUFS (momentary median -16.5); each SFX gain puts its loudest 400 ms window where noted.
export const LEVELS = {
  impact: 0.32, // -7.1 → ≈ -17 LUFS, on cards where the voice is silent
  riser: 0.2, // -8.9 → ≈ -23 LUFS, into each card
  whoosh: 0.17, // -10.5 → ≈ -26 LUFS
  tick: 0.26, // -18.3 → ≈ -30 LUFS, under every counted number
  glitch: 0.12, // -5.7 → ≈ -24 LUFS, the breach moments only
  shutter: 0.45, // -22.1 → ≈ -29 LUFS, photo reveals
};

// The synth arranges the music against the running order it was built with. If the edit
// has changed since, fail loudly instead of drifting out of sync.
BLOCKS.forEach((b, i) => {
  const m = manifest.blocks[i];
  if (!m || m.kind !== b.kind || Math.abs(m.start - b.start) > 0.002) {
    throw new Error(`public/audio was synthesised for a different edit (block ${i}). Run \`npm run audio\`.`);
  }
});

type Cue = {at: number; file: string; vol: number};

const cues = (): Cue[] => {
  const out: Cue[] = [];
  for (const b of BLOCKS) {
    if (b.kind === 'card') {
      out.push({at: b.start - 1.35, file: 'riser', vol: LEVELS.riser});
      out.push({at: b.start + 0.05, file: 'impact', vol: LEVELS.impact});
      out.push({at: b.start + b.len - 0.35, file: 'whoosh', vol: LEVELS.whoosh * 0.8});
    }
    if (b.kind === 'sting') {
      out.push({at: b.start + 0.02, file: 'impact', vol: LEVELS.impact});
      out.push({at: b.start + b.len - 0.35, file: 'whoosh', vol: LEVELS.whoosh * 0.8});
    }
    if (b.kind === 'recap') {
      out.push({at: b.start - 1.0, file: 'riser', vol: LEVELS.riser * 0.8});
      out.push({at: b.start + 0.05, file: 'impact', vol: LEVELS.impact * 0.8});
    }
    if (b.kind === 'end') out.push({at: b.start, file: 'whoosh', vol: LEVELS.whoosh});
    if (b.kind !== 'vo') continue;
    const s = sec(b.id);
    // layout changes and photo reveals
    const phraseStart = (i: number) => s.phrases.find((p) => i >= p.a && i <= p.b)!.s;
    for (const beat of resolveBeats(b.id, phraseStart)) {
      if (beat.sfx) out.push({at: b.start + beat.start - 0.12, file: beat.sfx, vol: LEVELS[beat.sfx]});
    }
    // a tick under every number that counts up
    s.words.forEach((w) => {
      if (w.n && isCountable(w.t)) out.push({at: b.start + w.s - 0.05, file: 'tick', vol: LEVELS.tick});
    });
  }
  // the breach moments get a glitch
  const g = (id: string, word: string) => {
    const b = BLOCKS.find((x) => x.kind === 'vo' && x.id === id)!;
    out.push({at: b.start + sec(id).words[wi(id, word)].s, file: 'glitch', vol: LEVELS.glitch});
  };
  g('01-hook', 'broke');
  g('06-story4', 'unauthorized');
  g('06-story4', 'breaching');
  return out.sort((a, b) => a.at - b.at);
};

export const CUES = cues();

export const Mix: React.FC = () => (
  <>
    {/* ducking is baked into the file by the synth (src/musicDuck.ts) */}
    <Audio src={staticFile('audio/music.mp3')} />
    {BLOCKS.filter((b) => b.kind === 'vo').map((b) =>
      b.kind === 'vo' ? (
        <Sequence key={b.id} from={Math.round(b.start * FPS)} durationInFrames={Math.ceil((b.len + 0.3) * FPS)} name={`VO ${b.id}`}>
          <Audio src={staticFile(`vo/${b.id}.mp3`)} />
        </Sequence>
      ) : null,
    )}
    {CUES.map((c, i) => (
      <Sequence key={i} from={Math.max(0, Math.round(c.at * FPS))} durationInFrames={3 * FPS} name={`sfx ${c.file}`}>
        <Audio src={staticFile(`audio/sfx/${c.file}.wav`)} volume={c.vol} />
      </Sequence>
    ))}
  </>
);
