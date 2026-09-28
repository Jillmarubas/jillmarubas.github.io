import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, DUR, F, FPS, settle} from '../theme';
import {BLOCKS, STORIES, TOTAL_FRAMES, f} from '../timeline';
import {DOCK_AT} from '../scenes/Cards';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const BRAND = 'AI NEWS DAILY';
export const DATE = '28.09.2026';

// Top: the docked wordmark and date on the left, the current segment in a pill on the right.
// Bottom: one rail segment per story; the active one fills in mint (active), finished ones stay lit.
// The chrome only exists after the logo has docked into it, and steps aside for paper cards.
export const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sting = BLOCKS.find((b) => b.kind === 'sting')!;
  const dockF = Math.round(sting.start * FPS) + DOCK_AT;
  if (frame < dockF) return null;
  const current = [...BLOCKS].reverse().find((b) => t >= b.start);
  let label = 'Today';
  let story = 0;
  if (current) {
    if ((current.kind === 'vo' || current.kind === 'card') && current.story) {
      story = current.story;
      label = `Story ${String(story).padStart(2, '0')} / 06 · ${STORIES[story - 1].kicker}`;
    } else if (current.kind === 'recap' || (current.kind === 'vo' && current.id === '09-wrap')) label = 'Recap';
    else if (current.kind === 'vo' && current.id === '10-outro') label = 'See you next time';
  }
  // step aside while a paper card covers the frame
  let away = 0;
  for (const b of BLOCKS) {
    if (b.kind !== 'card') continue;
    const a = Math.round(b.start * FPS);
    const e = Math.round((b.start + b.len) * FPS);
    away = Math.max(away, interpolate(frame, [a - 2, a + DUR.quick, e - 12, e], [0, 1, 1, 0], clamp));
  }
  const endFade = interpolate(frame, [TOTAL_FRAMES - f(9), TOTAL_FRAMES - f(8.6)], [1, 0], clamp);
  const segs = STORIES.map((s) => {
    const card = BLOCKS.find((b) => b.kind === 'card' && b.story === s.n)!;
    const vo = BLOCKS.find((b) => b.kind === 'vo' && b.story === s.n)!;
    const p = interpolate(t, [card.start, vo.start + vo.len], [0, 1], clamp);
    return {n: s.n, p, active: story === s.n};
  });
  // the segment label swaps like Settle's pinned title: old leaves 8 px up, new arrives from below
  const block = current!;
  const since = frame - Math.round(block.start * FPS);
  const swap = interpolate(since, [0, DUR.base], [0, 1], {...clamp, easing: settle});
  return (
    <div style={{position: 'absolute', inset: 0, opacity: (1 - away) * endFade, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 120, top: 54, display: 'flex', alignItems: 'baseline', gap: 22}}>
        <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: 25, letterSpacing: '0.06em', color: C.onNight}}>{BRAND}</div>
        <div style={{fontFamily: F.mono, fontSize: 15, color: C.onNight2, opacity: interpolate(frame, [dockF, dockF + DUR.slow], [0, 1], clamp)}}>{DATE}</div>
      </div>
      <div style={{position: 'absolute', right: 120, top: 44, opacity: interpolate(frame, [dockF, dockF + DUR.slow], [0, 1], {...clamp, easing: settle})}}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: F.mono,
            fontSize: 15,
            padding: '10px 18px',
            borderRadius: 999,
            border: `1px solid ${C.pillEdge}`,
            color: C.onNight2,
            background: 'rgba(0,0,0,.5)',
          }}
        >
          <span style={{width: 8, height: 8, borderRadius: 4, background: story ? C.mint : C.onNight2}} />
          <span style={{display: 'inline-block', opacity: swap, transform: `translateY(${(1 - swap) * 8}px)`}}>{label}</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, bottom: 50, display: 'flex', gap: 10, opacity: interpolate(frame, [dockF + 6, dockF + 6 + DUR.slow], [0, 1], clamp)}}>
        {segs.map((s) => (
          <div key={s.n} style={{flex: 1, height: 3, borderRadius: 2, background: 'rgba(242,243,242,.12)', overflow: 'hidden'}}>
            <div style={{width: `${s.p * 100}%`, height: '100%', background: s.active ? C.mint : 'rgba(242,243,242,.55)'}} />
          </div>
        ))}
      </div>
    </div>
  );
};

