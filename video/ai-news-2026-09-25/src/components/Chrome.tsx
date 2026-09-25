import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, D, E, F} from '../theme';
import {mix, prog, useT} from '../lib/anim';
import {DURATION, PARAS} from '../lib/timeline';

export const STORIES = ['The price war', 'The mystery enzyme', 'Meta goes wearable', 'Gemini 4 is close', 'Follow the money', 'Warning at the UN'];

/** Brand line and a six-part progress bar, one segment per story. */
export const TopBar: React.FC = () => {
  const t = useT();
  const inP = prog(t, 0.1, D.slow);
  const outP = prog(t, DURATION - 0.5, D.base, E.depart);
  return (
    <AbsoluteFill style={{opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * -20}px)`}}>
      <div style={{position: 'absolute', top: 70, left: 60, right: 60, display: 'flex', gap: 10}}>
        {STORIES.map((_, i) => {
          const s = PARAS[i + 1];
          const fill = Math.max(0, Math.min(1, (t - s.start) / (s.end - s.start)));
          return (
            <div key={i} style={{flex: 1, height: 6, borderRadius: 6, background: 'rgba(255,255,255,.14)', overflow: 'hidden'}}>
              <div style={{width: `${fill * 100}%`, height: '100%', background: C.accent, boxShadow: '0 0 12px rgba(250,90,5,.8)'}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 104, left: 60, right: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 18, height: 18, borderRadius: 5, background: C.accent, boxShadow: '0 0 18px rgba(250,90,5,.9)'}} />
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 32, letterSpacing: '.02em', color: C.text}}>AI NEWS TODAY</div>
        </div>
        <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '.14em', color: C.faint}}>SEP 25 · 2026</div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Between stories: a frosted sheet wipes up through the frame with the story number,
 * then the number stays behind the story as an outlined watermark.
 */
export const StoryMarks: React.FC<{layer: 'back' | 'front'}> = ({layer}) => {
  const t = useT();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {STORIES.map((title, i) => {
        const s = PARAS[i + 1];
        const gapStart = PARAS[i].end + 0.05;
        if (t < gapStart - 0.1 || t > s.end + 0.6) return null;
        // the wipe: a glass sheet crossing the frame bottom to top over ~0.7s
        const wipe = prog(t, gapStart, 0.75, E.glide);
        const numIn = prog(t, gapStart + 0.15, D.hero);
        const numOut = prog(t, s.end + 0.1, D.base, E.depart);
        const tagIn = prog(t, s.start + 0.05, D.slow);
        const n = String(i + 1).padStart(2, '0');
        return (
          <AbsoluteFill key={i}>
            {/* outlined story number, parked behind the stage */}
            {layer === 'back' ? (<>
            <div
              style={{
                position: 'absolute',
                right: -30,
                top: 150,
                fontFamily: F.display,
                fontWeight: 900,
                fontSize: 560,
                lineHeight: 1,
                letterSpacing: '-.06em',
                color: 'transparent',
                WebkitTextStroke: '3px rgba(255,255,255,.10)',
                opacity: numIn * (1 - numOut),
                transform: `translateX(${(1 - numIn) * 160}px)`,
                filter: numIn < 0.999 ? `blur(${(1 - numIn) * 10}px)` : undefined,
              }}
            >
              {n}
            </div>
            {/* section tag */}
            <div
              style={{
                position: 'absolute',
                top: 178,
                left: 60,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                opacity: tagIn * (1 - numOut),
                transform: `translateY(${(1 - tagIn) * 16}px)`,
              }}
            >
              <span style={{fontFamily: F.mono, fontWeight: 600, fontSize: 26, color: C.accentHover, letterSpacing: '.12em'}}>{n}</span>
              <span style={{width: mix(0, 48, tagIn), height: 2, background: C.accent}} />
              <span style={{fontFamily: F.mono, fontWeight: 500, fontSize: 26, color: C.text, letterSpacing: '.12em', textTransform: 'uppercase'}}>{title}</span>
            </div>
            </>) : null}
            {/* the wipe itself, in front of the stage so it frosts whatever it crosses */}
            {layer === 'front' && wipe > 0 && wipe < 1 ? (
              <div
                style={{
                  position: 'absolute',
                  left: -40,
                  right: -40,
                  height: 900,
                  top: mix(1960, -960, wipe),
                  background: 'linear-gradient(180deg, rgba(250,90,5,0) 0%, rgba(20,14,10,.55) 18%, rgba(20,14,10,.55) 82%, rgba(250,90,5,0) 100%)',
                  backdropFilter: 'blur(26px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(26px) saturate(150%)',
                  borderTop: '2px solid rgba(255,255,255,.22)',
                  display: 'grid',
                  placeItems: 'center',
                  transform: 'skewY(-6deg)',
                }}
              >
                <div style={{transform: 'skewY(6deg)', textAlign: 'center'}}>
                  <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 200, lineHeight: 1, color: C.text, letterSpacing: '-.04em'}}>{n}</div>
                  <div style={{fontFamily: F.mono, fontSize: 30, letterSpacing: '.16em', color: C.accentHover, textTransform: 'uppercase', marginTop: 10}}>{title}</div>
                </div>
              </div>
            ) : null}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
