import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, F, FPS, depart, settle, snap} from '../theme';
import {Phrase, Section, Word, quotedMask} from '../timeline';

export type Mode = 'stage' | 'split' | 'photo';

const LEAD = 2; // frames a word starts before it is heard
const EXIT = 8; // frames a phrase takes to leave

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---- counted numbers ----------------------------------------------------------
const COUNT = /^(["“]?)(\$?)(\d[\d,]*\.?\d*)(%|¢| GW|-line)?([.,:;?!"”]*)$/;
export const isCountable = (t: string) => {
  const m = t.match(COUNT);
  if (!m) return false;
  return Boolean(m[2] || m[4] || m[3].includes(','));
};
const formatLike = (template: string, v: number) => {
  const decimals = template.includes('.') ? template.split('.')[1].length : 0;
  const s = v.toFixed(decimals);
  if (!template.includes(',')) return s;
  const [i, d] = s.split('.');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? '.' + d : '');
};

const CountWord: React.FC<{w: Word; local: number; style: React.CSSProperties}> = ({w, local, style}) => {
  const m = w.t.match(COUNT)!;
  const [, q, pre, num, suf = '', trail] = m;
  const target = parseFloat(num.replace(/,/g, ''));
  const dur = Math.max(10, Math.min(22, Math.round((w.e - w.s) * FPS) + 4));
  const p = interpolate(local, [0, dur], [0, 1], {...clamp, easing: settle});
  const shown = formatLike(num, target * p);
  const inP = interpolate(local, [0, 8], [0, 1], {...clamp, easing: settle});
  return (
    <span style={{position: 'relative', display: 'inline-block', ...style}}>
      {/* the final text holds the width so the line never re-flows while counting */}
      <span style={{visibility: 'hidden'}}>{w.t}</span>
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          whiteSpace: 'nowrap',
          color: C.accent,
          fontVariantNumeric: 'tabular-nums',
          opacity: inP,
          transform: `translateY(${(1 - inP) * 0.4}em) scale(${1.18 - 0.18 * inP})`,
          transformOrigin: '0% 80%',
          filter: `blur(${(1 - inP) * 10}px)`,
        }}
      >
        {q}
        {pre}
        {shown}
        {suf}
        <span style={{color: C.text}}>{trail}</span>
      </span>
      <Underline local={local - dur + 2} />
    </span>
  );
};

const Underline: React.FC<{local: number}> = ({local}) => {
  const p = interpolate(local, [0, 10], [0, 1], {...clamp, easing: settle});
  return (
    <span
      style={{
        position: 'absolute',
        left: 0,
        right: '0.08em',
        bottom: '-0.02em',
        height: '0.075em',
        background: C.accent,
        transformOrigin: '0% 50%',
        transform: `scaleX(${p})`,
        borderRadius: 2,
        boxShadow: `0 0 18px rgba(250,90,5,${0.55 * p})`,
      }}
    />
  );
};

// ---- key words: letters drop in with a snap, then an underline wipes ------------
const KeyWord: React.FC<{w: Word; local: number; style: React.CSSProperties}> = ({w, local, style}) => {
  const letters = [...w.t];
  const trailing = (w.t.match(/[.,:;?!"”]+$/) || [''])[0];
  const core = letters.length - trailing.length;
  return (
    <span style={{position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', ...style}}>
      {letters.map((ch, i) => {
        const l = local - Math.min(i, 10) * 1;
        const p = interpolate(l, [0, 10], [0, 1], {...clamp, easing: snap});
        const o = interpolate(l, [0, 5], [0, 1], clamp);
        const b = interpolate(l, [0, 7], [8, 0], clamp);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color: i < core ? C.accent : C.text,
              opacity: o,
              filter: `blur(${b}px)`,
              transform: `translateY(${(1 - p) * -0.45}em) scale(${1 + (1 - p) * 0.35})`,
              transformOrigin: '50% 100%',
            }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        );
      })}
      <Underline local={local - 8} />
    </span>
  );
};

// ---- quoted speech: typed on, letter by letter ----------------------------------
const TypedWord: React.FC<{w: Word; local: number; style: React.CSSProperties}> = ({w, local, style}) => {
  const dur = Math.max(4, Math.round((w.e - w.s) * FPS));
  const n = Math.ceil(interpolate(local, [0, dur], [0, w.t.length], clamp));
  return (
    <span style={{position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', ...style}}>
      <span style={{visibility: 'hidden'}}>{w.t}</span>
      <span style={{position: 'absolute', left: 0, top: 0}}>
        {w.t.slice(0, n)}
        {n < w.t.length && local >= 0 ? (
          <span style={{display: 'inline-block', width: '0.08em', height: '0.8em', background: C.accent, marginLeft: '0.03em', transform: 'translateY(0.08em)'}} />
        ) : null}
      </span>
    </span>
  );
};

// ---- plain words: rise out of frost -------------------------------------------
const PlainWord: React.FC<{w: Word; local: number; style: React.CSSProperties}> = ({w, local, style}) => {
  const p = interpolate(local, [0, 11], [0, 1], {...clamp, easing: settle});
  return (
    <span
      style={{
        display: 'inline-block',
        whiteSpace: 'nowrap',
        opacity: Math.min(1, p * 1.7),
        transform: `translateY(${(1 - p) * 0.55}em)`,
        filter: `blur(${(1 - p) * 12}px)`,
        ...style,
      }}
    >
      {w.t}
    </span>
  );
};

// ---- a phrase: words in, then the whole line departs ------------------------------
const SIZES: Record<Mode, number> = {stage: 124, split: 84, photo: 92};

const PhraseView: React.FC<{
  s: Section;
  p: Phrase;
  next?: Phrase;
  frame: number;
  mode: Mode;
  quoted: boolean[];
}> = ({s, p, next, frame, mode, quoted}) => {
  const start = Math.round(p.s * FPS) - LEAD;
  // leave when the next phrase is about to arrive, or after a long hold
  const holdEnd = next ? Math.round(next.s * FPS) - LEAD - 6 : Math.round(s.duration * FPS) + 6;
  const exitAt = Math.min(holdEnd, Math.round(p.e * FPS) + Math.round(2.4 * FPS));
  if (frame < start - 1 || frame > exitAt + EXIT) return null;
  const x = interpolate(frame, [exitAt, exitAt + EXIT], [0, 1], {...clamp, easing: depart});
  const life = interpolate(frame, [start, exitAt], [0, 1], clamp);
  const isQuote = quoted[p.a];
  const size = SIZES[mode];
  const words = s.words.slice(p.a, p.b + 1);
  const rule = interpolate(frame - start, [0, 12], [0, 1], {...clamp, easing: settle});
  return (
    <div
      style={{
        position: 'absolute',
        ...(mode === 'stage' && {left: 140, top: 0, bottom: 0, width: 1560}),
        ...(mode === 'split' && {left: 120, top: 0, bottom: 0, width: 850}),
        ...(mode === 'photo' && {left: 120, bottom: 150, width: 1420}),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: mode === 'photo' ? 'flex-end' : 'center',
        opacity: 1 - x,
        filter: x > 0 ? `blur(${x * 8}px)` : undefined,
        transform: `translateY(${-x * 0.35 * size}px) scale(${1 + life * 0.012})`,
        transformOrigin: '0% 50%',
      }}
    >
      <div
        style={{
          position: 'relative',
          fontFamily: F.display,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.04,
          letterSpacing: '-0.018em',
          color: C.text,
          textShadow: mode === 'photo' ? '0 4px 30px rgba(0,0,0,.55)' : '0 2px 24px rgba(0,0,0,.25)',
          paddingLeft: isQuote ? '0.42em' : 0,
        }}
      >
        {isQuote ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '0.12em',
              bottom: '0.1em',
              width: '0.07em',
              background: C.accent,
              transformOrigin: '50% 0%',
              transform: `scaleY(${rule})`,
              borderRadius: 3,
            }}
          />
        ) : null}
        {words.map((w, j) => {
          const i = p.a + j;
          const local = frame - (Math.round(w.s * FPS) - LEAD);
          const gap: React.CSSProperties = {marginRight: '0.24em', fontWeight: quoted[i] ? 700 : 900};
          if (local < 0) {
            return (
              <span key={i} style={{display: 'inline-block', whiteSpace: 'nowrap', opacity: 0, ...gap}}>
                {w.t}
              </span>
            );
          }
          if (quoted[i]) return <TypedWord key={i} w={w} local={local} style={gap} />;
          if (w.n && isCountable(w.t)) return <CountWord key={i} w={w} local={local} style={gap} />;
          if (w.k) return <KeyWord key={i} w={w} local={local} style={gap} />;
          return <PlainWord key={i} w={w} local={local} style={gap} />;
        })}
      </div>
    </div>
  );
};

// Renders a whole VO section's words, frame-accurate to the voice.
export const Kinetic: React.FC<{s: Section; modeOf: (phraseIndex: number) => Mode}> = ({s, modeOf}) => {
  const frame = useCurrentFrame();
  const quoted = React.useMemo(() => quotedMask(s), [s]);
  return (
    <AbsoluteFill>
      {s.phrases.map((p, k) => (
        <PhraseView key={k} s={s} p={p} next={s.phrases[k + 1]} frame={frame} mode={modeOf(k)} quoted={quoted} />
      ))}
    </AbsoluteFill>
  );
};
