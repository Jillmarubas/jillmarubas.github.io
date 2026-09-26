import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {resolveBeats} from '../beats';
import {Kinetic, Mode} from '../components/Kinetic';
import {FPS, depart} from '../theme';
import {sec} from '../timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const XFADE = 10;

export const useBeats = (id: string) => {
  const s = sec(id);
  return React.useMemo(() => {
    const phraseStart = (i: number) => s.phrases.find((p) => i >= p.a && i <= p.b)!.s;
    const beats = resolveBeats(id, phraseStart).map((b) => ({...b, from: Math.max(0, Math.round(b.start * FPS) - 4)}));
    const end = Math.round(s.duration * FPS) + 20;
    return beats.map((b, k) => ({...b, to: k + 1 < beats.length ? beats[k + 1].from : end}));
  }, [id, s]);
};

export const SectionView: React.FC<{id: string}> = ({id}) => {
  const frame = useCurrentFrame();
  const s = sec(id);
  const beats = useBeats(id);
  const modeOf = React.useCallback(
    (k: number): Mode => {
      const startF = Math.round(s.phrases[k].s * FPS) - 4;
      const b = [...beats].reverse().find((x) => startF >= x.from - 1) ?? beats[0];
      return b.mode;
    },
    [beats, s],
  );
  return (
    <AbsoluteFill>
      {beats.map((b, k) => {
        if (!b.media) return null;
        if (frame < b.from || frame > b.to + XFADE) return null;
        const local = frame - b.from;
        // leave on `depart` while the next beat arrives
        const out = interpolate(frame, [b.to, b.to + XFADE], [0, 1], {...clamp, easing: depart});
        const at = (word: string, nth = 1) => {
          let seen = 0;
          const norm = (t: string) => t.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9$%.¢'-]/g, '').replace(/[.,]+$/, '');
          const target = norm(word);
          for (let j = 0; j < s.words.length; j++) {
            if (norm(s.words[j].t) === target && ++seen === nth) return Math.round(s.words[j].s * FPS) - 2 - b.from;
          }
          throw new Error(`beat word "${word}"#${nth} not found in ${id}`);
        };
        const isPhoto = b.mode === 'photo';
        const inP = isPhoto ? interpolate(local, [0, XFADE], [0, 1], clamp) : 1;
        return (
          <AbsoluteFill
            key={k}
            style={{
              opacity: inP * (1 - out),
              filter: out > 0 && !isPhoto ? `blur(${out * 10}px)` : undefined,
              transform: out > 0 && !isPhoto ? `translateX(${-out * 40}px)` : undefined,
            }}
          >
            {b.media({local, dur: b.to - b.from + XFADE, at})}
          </AbsoluteFill>
        );
      })}
      <Kinetic s={s} modeOf={modeOf} />
    </AbsoluteFill>
  );
};
