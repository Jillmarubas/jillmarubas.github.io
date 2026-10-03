// "Claude Code Just Got Mods" — AI News Daily explainer + tutorial, 3 Oct 2026. 1920×1080, 60 fps.
import React, {useId} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import './fonts';
import {C, F, FPS, GRADIENT} from './design';
import {E, clamp, p01} from './ae';
import {LivingGradient} from '../gradient/GradientLoop';
import {CHAPTERS, DURATION, SceneCtx, SceneWin, line} from './timing';
import {PartDim, PartTag} from './ui';
import {SCENES, Tr} from './scenes';

export const TR = 0.5; // transition overlap (s)
export const CC_DURATION = Math.round(DURATION * FPS);

// Resolve scene windows from the voice timing.
export const WINDOWS: (SceneWin & {tr: Tr; idx: number})[] = (() => {
  const out: (SceneWin & {tr: Tr; idx: number})[] = [];
  SCENES.forEach((s, k) => {
    const first = k === 0 || SCENES[k - 1].ch !== s.ch;
    const start = k === 0 ? 0 : first ? CHAPTERS[s.ch].start : line(s.ch, s.from).start - (s.pre ?? 0.4);
    out.push({ch: s.ch, from: s.from, to: s.to ?? 99, start, end: 0, tr: s.tr ?? (first ? 'zoom' : k % 2 ? 'whipL' : 'whipR'), idx: k});
  });
  out.forEach((w, k) => (w.end = k < out.length - 1 ? out[k + 1].start + TR : DURATION));
  return out;
})();

// Chapter tags (stinger + corner tag) that span whole chapters.
const TAGS: Record<string, {n?: string; title: string; full: boolean}> = {
  p1a: {n: '01', title: 'Mods', full: true},
  p1b: {n: '01', title: 'Build your first mod', full: false},
  p2: {n: '02', title: 'Wrap-Up Allowance', full: true},
  p3: {n: '03', title: 'Opus + Sonnet 5.5', full: true},
  p4: {n: '04', title: 'Free credit', full: true},
  p5: {n: '05', title: 'prompt-audit', full: true},
  p6: {n: '06', title: 'You should know', full: true},
  p7: {n: '07', title: 'Evals', full: true},
  p8: {n: '08', title: 'Publish', full: true},
  p9: {n: '09', title: 'Pro tips', full: true},
  wrap: {title: 'Your to-do list', full: true},
};

/** Scene wrapper: AE-style transitions in and out, with directional motion blur on the move. */
const Shot: React.FC<{w: (typeof WINDOWS)[number]; next?: (typeof WINDOWS)[number]; children: React.ReactNode}> = ({w, next, children}) => {
  const f = useCurrentFrame();
  const id = useId().replace(/:/g, '');
  const t = f / FPS;
  const dur = w.end - w.start;
  const pin = w.idx === 0 ? 1 : p01(t, 0, TR, E.inOut);
  const pout = next ? p01(t, dur - TR, TR, E.inOut) : 0;
  const pose = (pi: number, po: number) => {
    let x = 0, y = 0, s = 1, o = 1;
    const ti = w.tr, to = next?.tr;
    if (pi < 1) {
      if (ti === 'whipL') x += (1 - pi) * 1500;
      if (ti === 'whipR') x -= (1 - pi) * 1500;
      if (ti === 'up') y += (1 - pi) * 900;
      if (ti === 'zoom') { s *= 0.55 + 0.45 * pi; o *= clamp(pi * 1.6); }
      if (ti === 'fade') o *= pi;
    }
    if (po > 0) {
      if (to === 'whipL') x -= po * 1500;
      if (to === 'whipR') x += po * 1500;
      if (to === 'up') y -= po * 900;
      if (to === 'zoom') { s *= 1 + po * 1.4; o *= 1 - clamp(po * 1.4); }
      if (to === 'fade') o *= 1 - po;
    }
    return {x, y, s, o};
  };
  const a = pose(pin, pout);
  const dt = 1 / (FPS * 2);
  const b = pose(w.idx === 0 ? 1 : p01(t - dt, 0, TR, E.inOut), next ? p01(t - dt, dur - TR, TR, E.inOut) : 0);
  const bx = Math.min(90, Math.abs(a.x - b.x) * 0.42 + Math.abs(a.s - b.s) * 600);
  const by = Math.min(90, Math.abs(a.y - b.y) * 0.42 + Math.abs(a.s - b.s) * 600);
  const blur = bx > 0.6 || by > 0.6;
  return (
    <AbsoluteFill style={{transform: `translate(${a.x}px, ${a.y}px) scale(${a.s})`, opacity: a.o, filter: blur ? `url(#tr${id})` : undefined}}>
      {blur && (
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id={`tr${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={`${bx.toFixed(1)} ${by.toFixed(1)}`} />
          </filter>
        </svg>
      )}
      {children}
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(120% 95% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)', pointerEvents: 'none'}} />;

export const CCFilm: React.FC<{offset?: number}> = ({offset = 0}) => {
  return (
    <AbsoluteFill style={{background: '#0B0C0F', color: C.ink, fontFamily: F.ui}}>
      <LivingGradient palette={GRADIENT} loop={900} grain={0.12} />
      {WINDOWS.map((w, k) => {
        const S = SCENES[k].C;
        const from = Math.round(w.start * FPS) - offset;
        const len = Math.round((w.end - w.start) * FPS);
        if (from + len < 0) return null;
        return (
          <Sequence key={k} from={from} durationInFrames={len} layout="none">
            <SceneCtx.Provider value={w}>
              <Shot w={w} next={WINDOWS[k + 1]}>
                <S />
              </Shot>
            </SceneCtx.Provider>
          </Sequence>
        );
      })}
      {CHAPTERS.map((c, k) => {
        const tag = TAGS[c.key];
        if (!tag) return null;
        const from = Math.round(c.start * FPS) - offset;
        const len = Math.round((c.end - c.start) * FPS);
        if (from + len < 0) return null;
        return (
          <Sequence key={`tag${k}`} from={from} durationInFrames={len} layout="none">
            <TagClock c={c} tag={tag} />
          </Sequence>
        );
      })}
      <Vignette />
    </AbsoluteFill>
  );
};

const TagClock: React.FC<{c: (typeof CHAPTERS)[number]; tag: {n?: string; title: string; full: boolean}}> = ({c, tag}) => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {tag.full && <PartDim t={t} />}
      <PartTag t={t} n={tag.n} title={tag.title} dur={c.end - c.start} full={tag.full} />
    </AbsoluteFill>
  );
};

// Parts for parallel Lambda renders: one per chapter.
export const CC_PARTS = CHAPTERS.map((c, i) => ({from: Math.round(c.start * FPS), to: i < CHAPTERS.length - 1 ? Math.round(CHAPTERS[i + 1].start * FPS) : CC_DURATION}));
export const CCPart: React.FC<{part: number}> = ({part}) => {
  const p = CC_PARTS[part];
  return (
    <Sequence from={-p.from} layout="none">
      <CCFilm />
    </Sequence>
  );
};
