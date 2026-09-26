import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, F, settle} from '../theme';
import {BLOCKS, STORIES, TOTAL_FRAMES, f} from '../timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Top: brand and date on the left, the current segment on the right.
// Bottom: a rail with one segment per story that fills as the video plays.
export const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const current = [...BLOCKS].reverse().find((b) => t >= b.start);
  let label = 'Top stories';
  let story = 0;
  if (current) {
    if ((current.kind === 'vo' || current.kind === 'card') && current.story) {
      story = current.story;
      label = `Story ${String(story).padStart(2, '0')} / 05 · ${STORIES[story - 1].kicker}`;
    } else if (current.kind === 'vo' && current.id === '02-preview') label = 'Today';
    else if (current.kind === 'recap' || (current.kind === 'vo' && current.id === '08-wrap')) label = 'Recap';
    else if (current.kind === 'vo' && current.id === '09-outro') label = 'See you tomorrow';
  }
  const endFade = interpolate(frame, [TOTAL_FRAMES - f(9), TOTAL_FRAMES - f(8.4)], [1, 0], clamp);
  const inFade = interpolate(frame, [4, 24], [0, 1], {...clamp, easing: settle});
  const segs = STORIES.map((s) => {
    const card = BLOCKS.find((b) => b.kind === 'card' && b.story === s.n)!;
    const vo = BLOCKS.find((b) => b.kind === 'vo' && b.story === s.n)!;
    const p = interpolate(t, [card.start, vo.start + vo.len], [0, 1], clamp);
    return {n: s.n, p};
  });
  return (
    <div style={{position: 'absolute', inset: 0, opacity: inFade * endFade, pointerEvents: 'none', textShadow: '0 1px 12px rgba(0,0,0,.55)'}}>
      <div style={{position: 'absolute', left: 120, top: 56, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: C.accent, boxShadow: '0 0 16px rgba(250,90,5,.8)'}} />
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 24, letterSpacing: '0.04em', color: C.text}}>AI NEWS DAILY</div>
        <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.12em', color: C.text2}}>26.09.2026</div>
      </div>
      <div
        key={label}
        style={{
          position: 'absolute',
          right: 120,
          top: 58,
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 19,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: story ? C.accentHi : C.text2,
        }}
      >
        {label}
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, bottom: 52, display: 'flex', gap: 10}}>
        {segs.map((s) => (
          <div key={s.n} style={{flex: 1, height: 4, borderRadius: 2, background: 'rgba(243,239,233,.14)', overflow: 'hidden'}}>
            <div style={{width: `${s.p * 100}%`, height: '100%', background: C.accent}} />
          </div>
        ))}
      </div>
    </div>
  );
};
