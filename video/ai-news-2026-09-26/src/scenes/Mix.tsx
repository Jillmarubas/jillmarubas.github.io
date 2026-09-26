import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {resolveBeats} from '../beats';
import {isCountable} from '../components/Kinetic';
import {FPS} from '../theme';
import {BLOCKS, TOTAL_FRAMES, sec, wi} from '../timeline';

// Levels were measured with ebur128 (see README): VO is normalised to -16 LUFS, the
// raw bed is -15.1 LUFS, and each SFX gets its own gain so it lands 6-12 dB under the voice.
export const LEVELS = {
  musicUnderVoice: 0.14, // ≈ -17 dB → bed ≈ -32 LUFS under speech
  musicOpen: 0.42, // ≈ -7.5 dB on cards, stings and the end card
  impact: 0.19,
  riser: 0.14,
  whoosh: 0.3,
  tick: 0.2,
  glitch: 0.75,
  shutter: 0.38,
};

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

// Music level: ducked while Joey speaks, lifted in the gaps, with 0.4 s ramps.
const musicVolume = (frame: number) => {
  const t = frame / FPS;
  let duck = 0;
  for (const b of BLOCKS) {
    if (b.kind !== 'vo') continue;
    const a0 = b.start - 0.35;
    const a1 = b.start + b.len + 0.15;
    const d = interpolate(t, [a0 - 0.4, a0, a1, a1 + 0.5], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    duck = Math.max(duck, d);
  }
  const level = LEVELS.musicOpen + (LEVELS.musicUnderVoice - LEVELS.musicOpen) * duck;
  const fadeIn = interpolate(frame, [0, FPS], [0, 1], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [TOTAL_FRAMES - 3 * FPS, TOTAL_FRAMES - 4], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return level * fadeIn * fadeOut;
};

export const Mix: React.FC = () => (
  <>
    <Audio src={staticFile('music/bed.mp3')} volume={musicVolume} />
    {BLOCKS.filter((b) => b.kind === 'vo').map((b) =>
      b.kind === 'vo' ? (
        <Sequence key={b.id} from={Math.round(b.start * FPS)} durationInFrames={Math.ceil((b.len + 0.3) * FPS)} name={`VO ${b.id}`}>
          <Audio src={staticFile(`vo/${b.id}.mp3`)} />
        </Sequence>
      ) : null,
    )}
    {CUES.map((c, i) => (
      <Sequence key={i} from={Math.max(0, Math.round(c.at * FPS))} durationInFrames={3 * FPS} name={`sfx ${c.file}`}>
        <Audio src={staticFile(`sfx/${c.file}.mp3`)} volume={c.vol} />
      </Sequence>
    ))}
  </>
);
