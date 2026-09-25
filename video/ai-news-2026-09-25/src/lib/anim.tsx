import React, {createContext, useContext} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {D, E, STAGGER} from '../theme';

/** Absolute time in seconds. Every cue in this video is absolute, so nothing uses Sequence-local time. */
export const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

export const prog = (t: number, start: number, dur: number, ease = E.settle) =>
  interpolate(t, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

// ---------- beats: a block of the stage that lives between two cues ----------

type BeatInfo = {from: number; to: number};
const BeatCtx = createContext<BeatInfo>({from: 0, to: Infinity});
export const useBeat = () => useContext(BeatCtx);

/** Shows its children from `from` to `to`, then departs: up, blurred, one step shorter than the entrance. */
export const Beat: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  exit?: 'up' | 'fade' | 'none';
}> = ({from, to, children, style, exit = 'up'}) => {
  const t = useT();
  if (t < from - 0.05 || t > to + D.base + 0.05) return null;
  const q = exit === 'none' ? 0 : prog(t, to, D.base, E.depart);
  const move = exit === 'up' ? q : 0;
  return (
    <BeatCtx.Provider value={{from, to}}>
      <AbsoluteFill
        style={{
          opacity: 1 - q,
          transform: `translateY(${-70 * move}px) scale(${1 - 0.05 * move})`,
          filter: q > 0.001 ? `blur(${10 * q}px)` : undefined,
          ...style,
        }}
      >
        {children}
      </AbsoluteFill>
    </BeatCtx.Provider>
  );
};

/** Arrive, then settle: rise + blur-in, timed from the beat start plus `d`, or from `at`. */
export const useRise = (d = 0, opts: {at?: number; dur?: number; y?: number; blur?: number; scale?: number} = {}) => {
  const t = useT();
  const {from} = useBeat();
  const start = opts.at ?? from + d;
  const p = prog(t, start, opts.dur ?? D.slow);
  const y = opts.y ?? 48;
  const blur = opts.blur ?? 8;
  const s = opts.scale ?? 1;
  return {
    p,
    style: {
      opacity: p,
      transform: `translateY(${y * (1 - p)}px) scale(${mix(s, 1, p)})`,
      filter: p < 0.999 ? `blur(${blur * (1 - p)}px)` : undefined,
    } as React.CSSProperties,
  };
};

export const Rise: React.FC<{
  d?: number;
  at?: number;
  dur?: number;
  y?: number;
  blur?: number;
  scale?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({d, at, dur, y, blur, scale, style, children}) => {
  const r = useRise(d, {at, dur, y, blur, scale});
  return <div style={{...style, ...r.style, ...(style?.transform ? {transform: `${r.style.transform} ${style.transform}`} : {})}}>{children}</div>;
};

/** Letters rising out of a mask, 40 ms apart: the logo intro from Settle Motion, used on display type. */
export const Letters: React.FC<{
  text: string;
  d?: number;
  at?: number;
  style?: React.CSSProperties;
  stagger?: number;
  color?: string;
}> = ({text, d = 0, at, style, stagger = STAGGER.letter, color}) => {
  const t = useT();
  const {from} = useBeat();
  const start = at ?? from + d;
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', ...style}}>
      {text.split(' ').map((word, wi, arr) => {
        const before = arr.slice(0, wi).join(' ').length + (wi > 0 ? 1 : 0);
        return (
          <span key={wi} style={{display: 'inline-flex', overflow: 'hidden', paddingBottom: '0.08em', marginRight: wi < arr.length - 1 ? '0.26em' : 0}}>
            {word.split('').map((ch, ci) => {
              const p = prog(t, start + (before + ci) * stagger, D.slow);
              return (
                <span key={ci} style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, color}}>
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
};

/** Words rising 60 ms apart. */
export const Words: React.FC<{text: string; d?: number; at?: number; style?: React.CSSProperties; wordStyle?: (w: string, i: number) => React.CSSProperties}> = ({
  text,
  d = 0,
  at,
  style,
  wordStyle,
}) => {
  const t = useT();
  const {from} = useBeat();
  const start = at ?? from + d;
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', columnGap: '0.26em', ...style}}>
      {text.split(' ').map((w, i) => {
        const p = prog(t, start + i * STAGGER.word, D.slow);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * 24}px)`,
              filter: p < 0.999 ? `blur(${(1 - p) * 8}px)` : undefined,
              ...wordStyle?.(w, i),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** A number counting up (or down) on the settle curve. */
export const Count: React.FC<{
  from?: number;
  to: number;
  at: number;
  dur?: number;
  format: (n: number) => string;
  style?: React.CSSProperties;
}> = ({from = 0, to, at, dur = 0.9, format, style}) => {
  const t = useT();
  const p = prog(t, at, dur, E.settle);
  const show = prog(t, at - 0.08, D.quick);
  return (
    <span style={{display: 'inline-block', fontVariantNumeric: 'tabular-nums', opacity: show, transform: `translateY(${(1 - show) * 24}px)`, ...style}}>
      {format(mix(from, to, p))}
    </span>
  );
};

/** A line drawn through its parent, left to right: for things the story crosses out. */
export const Strike: React.FC<{at: number; color?: string; thickness?: number; top?: string}> = ({at, color = '#ff5a5a', thickness = 10, top = '52%'}) => {
  const t = useT();
  const p = prog(t, at, D.base, E.glide);
  return (
    <div
      style={{
        position: 'absolute',
        left: -12,
        right: -12,
        top,
        height: thickness,
        marginTop: -thickness / 2,
        background: color,
        borderRadius: thickness,
        transformOrigin: 'left center',
        transform: `scaleX(${p}) rotate(-3deg)`,
        boxShadow: `0 0 24px ${color}88`,
      }}
    />
  );
};
