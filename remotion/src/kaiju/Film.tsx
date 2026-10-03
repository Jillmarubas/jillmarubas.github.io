import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import './fonts';
import TL from './timeline.json';
import {SHOT_COMPONENTS} from './shots';

/*
 * "The Giant from the Sea": a 2-minute 2D vector monster short (private example).
 * 27 shots from timeline.json; the soundtrack is synthesised by scripts/make_kaiju_audio.py
 * from the same cue list and muxed after rendering.
 */
const FPS = TL.fps;
const STARTS = (() => {
  let acc = 0;
  return TL.shots.map((s) => {
    const a = acc;
    acc += Math.round(s.dur * FPS);
    return a;
  });
})();
export const KAIJU_DURATION = STARTS[STARTS.length - 1] + Math.round(TL.shots[TL.shots.length - 1].dur * FPS);

export const KaijuFilm: React.FC<{offset?: number}> = ({offset = 0}) => {
  const f = useCurrentFrame() + offset;
  let i = 0;
  STARTS.forEach((s, k) => {
    if (f >= s) i = k;
  });
  const shot = TL.shots[i];
  const Comp = SHOT_COMPONENTS[shot.id];
  const t = f - STARTS[i];
  const d = shot.dur;
  // a short dip from black at the very start and to black at the very end
  const fadeIn = Math.min(1, f / 20);
  const fadeOut = Math.min(1, (KAIJU_DURATION - f) / 30);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, opacity: Math.min(fadeIn, fadeOut)}}>
        <defs>
          <filter id="blurBg" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="silhouette">
            <feColorMatrix type="matrix" values="0 0 0 0 0.09  0 0 0 0 0.07  0 0 0 0 0.16  0 0 0 1 0" />
          </filter>
        </defs>
        <Comp t={t} d={d} mood={shot.mood} />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 60%, rgba(0,0,0,0.35) 100%)'}} />
    </AbsoluteFill>
  );
};

/** QA: one frame at 60% of every shot. */
export const KAIJU_QA = STARTS.map((s, i) => s + Math.round(TL.shots[i].dur * FPS * 0.6));
export const KaijuQA: React.FC = () => {
  const f = useCurrentFrame();
  return <KaijuFilm offset={KAIJU_QA[f] - f} />;
};
