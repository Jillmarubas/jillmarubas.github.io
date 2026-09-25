import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, D, E, F, glassStyle, innerStyle} from '../theme';
import {prog, useBeat, useRise, useT} from '../lib/anim';
import type {Word} from '../lib/timeline';
import portraits from '../data/portraits.json';

/** Dark frosted glass with a light sweep across it as it lands. */
export const Glass: React.FC<{
  d?: number;
  at?: number;
  style?: React.CSSProperties;
  strong?: boolean;
  y?: number;
  children?: React.ReactNode;
}> = ({d = 0, at, style, strong, y = 48, children}) => {
  const t = useT();
  const {from} = useBeat();
  const start = at ?? from + d;
  const r = useRise(0, {at: start, y, scale: 0.96});
  const sweep = prog(t, start + 0.12, 0.9, E.glide);
  return (
    <div style={{position: 'relative', ...glassStyle(strong), overflow: 'hidden', ...style, ...r.style}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(105deg, rgba(255,255,255,0) 35%, rgba(255,255,255,.13) 50%, rgba(255,255,255,0) 65%)',
          transform: `translateX(${-120 + 240 * sweep}%)`,
          opacity: sweep > 0 && sweep < 1 ? 1 : 0,
        }}
      />
      {children}
    </div>
  );
};

export const Inner: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{...innerStyle, ...style}}>{children}</div>
);

/** Mono pill. `dot` adds a status dot; success green is kept for things that are done or live. */
export const Chip: React.FC<{
  children: React.ReactNode;
  d?: number;
  at?: number;
  dot?: string;
  accent?: boolean;
  style?: React.CSSProperties;
}> = ({children, d = 0, at, dot, accent, style}) => {
  const r = useRise(d, {at, y: 16, dur: D.base});
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 26px',
        borderRadius: 999,
        fontFamily: F.mono,
        fontWeight: 500,
        fontSize: 26,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        color: accent ? C.accentHover : C.text,
        background: accent ? 'rgba(250,90,5,.14)' : C.glassRaised,
        border: `2px solid ${accent ? 'rgba(250,90,5,.45)' : C.rim}`,
        boxShadow: 'inset 0 2px 0 rgba(255,255,255,.12)',
        ...style,
        ...r.style,
      }}
    >
      {dot ? <span style={{width: 12, height: 12, borderRadius: 12, background: dot, boxShadow: `0 0 16px ${dot}`}} /> : null}
      {children}
    </div>
  );
};

export const Label: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '.12em', textTransform: 'uppercase', color: C.faint, ...style}}>{children}</div>
);

/** Photo when one is licensed and on disk, otherwise a monogram tile. Never a generated face. */
export const Portrait: React.FC<{id: keyof typeof portraits | string; name: string; size?: number; style?: React.CSSProperties}> = ({id, name, size = 260, style}) => {
  const entry = (portraits as Record<string, {file: string; credit: string} | undefined>)[id];
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
  return (
    <div
      style={{
        width: size,
        height: size * 1.18,
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
        flex: 'none',
        border: `2px solid ${C.rimLit}`,
        boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        background: 'linear-gradient(150deg, #fa5a05 0%, #d61f5a 60%, #7c3abe 100%)',
        ...style,
      }}
    >
      {entry ? (
        <>
          <Img src={staticFile(`people/${entry.file}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.12) brightness(1.02)'}} />
          {/* duotone: the photo takes the field's orange in its highlights */}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(250,90,5,.55), rgba(124,58,190,.45))', mixBlendMode: 'color'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '6px 10px', fontFamily: F.mono, fontSize: 13, color: 'rgba(255,255,255,.7)', background: 'linear-gradient(0deg, rgba(0,0,0,.6), rgba(0,0,0,0))'}}>
            {entry.credit}
          </div>
        </>
      ) : (
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
          <span style={{fontFamily: F.display, fontWeight: 900, fontSize: size * 0.42, color: 'rgba(255,255,255,.92)', letterSpacing: '-.03em', textShadow: '0 8px 30px rgba(0,0,0,.35)'}}>{initials}</span>
        </div>
      )}
      <div style={{position: 'absolute', inset: 0, borderRadius: 28, boxShadow: 'inset 0 2px 0 rgba(255,255,255,.25)'}} />
    </div>
  );
};

/** Name + role block, for a person on screen. */
export const PersonCard: React.FC<{
  id: string;
  name: string;
  role: string;
  d?: number;
  at?: number;
  size?: number;
  style?: React.CSSProperties;
}> = ({id, name, role, d = 0, at, size = 220, style}) => (
  <Glass d={d} at={at} style={{display: 'flex', alignItems: 'center', gap: 36, padding: 30, ...style}}>
    <Portrait id={id} name={name} size={size} />
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 60, lineHeight: 1, color: C.text, letterSpacing: '-.02em'}}>{name}</div>
      <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '.1em', textTransform: 'uppercase', color: C.accentHover}}>{role}</div>
    </div>
  </Glass>
);

/** Quote whose words light up as the voiceover says them. */
export const SpokenQuote: React.FC<{words: Word[]; size?: number; style?: React.CSSProperties; hot?: string[]}> = ({words, size = 58, style, hot = []}) => {
  const t = useT();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', columnGap: '0.24em', rowGap: 6, fontFamily: F.display, fontWeight: 700, fontSize: size, lineHeight: 1.12, letterSpacing: '-.015em', ...style}}>
      {words.map((w, i) => {
        const p = prog(t, w.start - 0.03, 0.28);
        const clean = w.text.replace(/[“”".,:]/g, '');
        const isHot = hot.includes(clean.toLowerCase());
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color: isHot && p > 0.5 ? C.accentHover : C.text,
              opacity: 0.22 + 0.78 * p,
              transform: `translateY(${(1 - p) * 10}px)`,
              textShadow: isHot && p > 0.5 ? '0 0 30px rgba(250,90,5,.55)' : undefined,
            }}
          >
            {w.text.replace(/"/g, '')}
          </span>
        );
      })}
    </div>
  );
};

export const BigQuoteMark: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 220, lineHeight: 0.8, color: C.accent, textShadow: '0 0 60px rgba(250,90,5,.5)', height: 120, ...style}}>“</div>
);

/** Check mark that draws itself. */
export const Tick: React.FC<{at: number; size?: number; color?: string}> = ({at, size = 34, color = C.success}) => {
  const t = useT();
  const p = prog(t, at, D.base, E.glide);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{flex: 'none'}}>
      <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};
