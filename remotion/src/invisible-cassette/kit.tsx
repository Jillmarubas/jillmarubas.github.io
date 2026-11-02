// Shared pieces for The Invisible Cassette (Small Print). Times are in SECONDS of film time.
import React from 'react';
import {AbsoluteFill, Easing, staticFile, useCurrentFrame} from 'remotion';
import {C, F, FPS, SHADOW} from './design';

export const useT = () => useCurrentFrame() / FPS;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const E = {
  out: Easing.bezier(0.215, 0.61, 0.355, 1), // ease-out cubic: documents sliding in with inertia
  inOut: Easing.bezier(0.45, 0, 0.2, 1),
  in: Easing.bezier(0.55, 0.055, 0.675, 0.19),
  lin: (x: number) => x,
};
export const p01 = (t: number, at: number, dur: number, e = E.out) => e(clamp((t - at) / dur));
export const tw = (t: number, at: number, dur: number, a: number, b: number, e = E.out) => lerp(a, b, p01(t, at, dur, e));
/** 0 → 1 → 0 window with soft edges. */
export const win = (t: number, a: number, b: number, fi = 0.5, fo = 0.5) => Math.min(p01(t, a, fi, E.inOut), 1 - p01(t, b - fo, fo, E.inOut));
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ------------------------------------------------------------- 3D camera ------------- */
/** A real perspective camera: children sit at their own Z, so a push-in creates parallax. */
export const Camera: React.FC<{x?: number; y?: number; z?: number; dutch?: number; children: React.ReactNode}> = ({x = 0, y = 0, z = 0, dutch = 0, children}) => (
  <AbsoluteFill style={{perspective: 1400, perspectiveOrigin: '50% 50%', overflow: 'hidden'}}>
    <AbsoluteFill style={{transformStyle: 'preserve-3d', transform: `rotateZ(${dutch}deg) translate3d(${-x}px, ${-y}px, ${-z}px)`}}>{children}</AbsoluteFill>
  </AbsoluteFill>
);
/** A layer placed at depth z (negative = farther). Scaled so it still fills its design size at z. */
export const Depth: React.FC<{z: number; children: React.ReactNode; style?: React.CSSProperties}> = ({z, children, style}) => {
  const s = (1400 - z) / 1400; // compensate perspective so layout units stay true at rest
  return <AbsoluteFill style={{transformStyle: 'preserve-3d', transform: `translateZ(${z}px) scale(${s})`, ...style}}>{children}</AbsoluteFill>;
};

/* ------------------------------------------------------------- surfaces -------------- */
/** Dark oiled oak under one warm overhead tungsten lamp. `lamp` 0..1 dims the pool. */
export const Desk: React.FC<{lamp?: number; cx?: number; cy?: number}> = ({lamp = 1, cx = 50, cy = 46}) => (
  <div style={{position: 'absolute', left: -500, top: -500, width: 2920, height: 2080, background: C.void}}>
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.55}}>
      <filter id="oak">
        <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.09" numOctaves={4} seed={7} />
        <feColorMatrix values="0 0 0 0 0.24  0 0 0 0 0.15  0 0 0 0 0.08  0 0 0 0.9 -0.18" />
      </filter>
      <rect width="100%" height="100%" filter="url(#oak)" />
    </svg>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 34% 40% at ${cx}% ${cy}%, rgba(255,196,120,${0.22 * lamp}) 0%, rgba(255,170,90,${0.08 * lamp}) 45%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 62% at ${cx}% ${cy}%, rgba(0,0,0,0) 30%, rgba(4,5,8,0.92) 100%)`}} />
  </div>
);

/** Aged manila card stock. */
export const Manila: React.FC<{w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties; tone?: string}> = ({w, h, children, style, tone = C.manila}) => (
  <div style={{position: 'absolute', width: w, height: h, background: `linear-gradient(160deg, ${tone} 0%, #D8C9AE 70%, #CDBB98 100%)`, boxShadow: `${SHADOW}, inset 0 0 60px rgba(120,90,40,0.25)`, borderRadius: 3, overflow: 'hidden', ...style}}>
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.35}}>
      <filter id="fib">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
        <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.5 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#fib)" />
    </svg>
    {children}
  </div>
);

/* ------------------------------------------------------------- type ------------------ */
/** Characters appear one by one from `at`, `cps` per second (typewriter / terminal). */
export const TypeOn: React.FC<{t: number; at: number; text: string; cps?: number; style?: React.CSSProperties; caret?: boolean}> = ({t, at, text, cps = 18, style, caret}) => {
  const n = Math.floor(clamp((t - at) * cps, 0, text.length));
  const blink = caret && Math.floor(t * 2.2) % 2 === 0 && n < text.length + 1;
  return (
    <span style={{whiteSpace: 'pre', ...style}}>
      {text.slice(0, n)}
      <span style={{opacity: 0}}>{text.slice(n)}</span>
      {blink ? <span style={{position: 'absolute', opacity: 0.8}}>▌</span> : null}
    </span>
  );
};

/** Keyword with letters rising in, staggered (move each glyph, never letter-spacing). */
export const Rise: React.FC<{t: number; at: number; text: string; style?: React.CSSProperties; stagger?: number}> = ({t, at, text, style, stagger = 0.035}) => (
  <span style={{display: 'inline-block', whiteSpace: 'pre', ...style}}>
    {text.split('').map((ch, i) => {
      const k = p01(t, at + i * stagger, 0.45);
      return (
        <span key={i} style={{display: 'inline-block', opacity: k, transform: `translateY(${(1 - k) * 0.5}em)`, filter: `blur(${(1 - k) * 6}px)`}}>
          {ch}
        </span>
      );
    })}
  </span>
);

/* ------------------------------------------------------------- props ----------------- */
/** A rubber stamp that slams: 2-frame overshoot 115 % → 100 %, ink at a slight angle. */
export const Stamp: React.FC<{t: number; at: number; lines: string[]; rot?: number; color?: string; size?: number}> = ({t, at, lines, rot = -6, color = C.crimson, size = 54}) => {
  if (t < at - 0.12) return null;
  const f = (t - at) * FPS;
  const s = f < 0 ? 1.6 - (f + 3) * 0.15 : f < 2 ? 1.15 - f * 0.075 : 1;
  const o = f < 0 ? 0.0 : 0.92;
  return (
    <div style={{transform: `rotate(${rot}deg) scale(${s})`, opacity: o, border: `6px solid ${color}`, padding: '14px 26px', color, fontFamily: F.display, fontWeight: 900, fontSize: size, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.05, textAlign: 'center', mixBlendMode: 'multiply', filter: 'url(#inkbleed)'}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id="inkbleed">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={11} />
          <feDisplacementMap in="SourceGraphic" scale={4} />
        </filter>
      </svg>
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------- atmosphere ------------- */
/** Dust motes drifting through the lamp light (screen blend). */
export const Dust: React.FC<{t: number; n?: number; amt?: number}> = ({t, n = 70, amt = 1}) => (
  <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
    {Array.from({length: n}).map((_, i) => {
      const x = (hash(i) * 2200 - 140 + t * (6 + hash(i + 3) * 14)) % 2200;
      const y = (hash(i + 7) * 1300 - 110 + Math.sin(t * 0.4 + i) * 22 - t * (3 + hash(i + 9) * 6)) % 1300;
      const r = 1 + hash(i + 11) * 3.2;
      const lit = Math.max(0, 1 - Math.hypot((x - 960) / 900, (y - 500) / 560));
      return <div key={i} style={{position: 'absolute', left: x - 140, top: y < 0 ? y + 1300 : y, width: r, height: r, borderRadius: r, background: '#FFE3B5', opacity: lit * 0.55 * amt, filter: `blur(${hash(i + 5) > 0.7 ? 2.5 : 0.6}px)`}} />;
    })}
  </AbsoluteFill>
);

/** Global finish: grain (overlay, ~12 %), vignette (~18 %), and the exposure curve (0 = black). */
export const Finish: React.FC<{t: number; exposure?: number; grain?: number}> = ({t, exposure = 1, grain = 0.12}) => {
  const k = Math.floor(t * 12);
  return (
    <>
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundPosition: `${(k * 137) % 512}px ${(k * 271) % 512}px`, mixBlendMode: 'overlay', opacity: grain}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
      <AbsoluteFill style={{background: '#000', opacity: clamp(1 - exposure)}} />
    </>
  );
};

export const Credit: React.FC<{text: string; o?: number}> = ({text, o = 1}) => (
  <div style={{position: 'absolute', right: 48, bottom: 36, fontFamily: F.ui, fontSize: 18, color: C.mono, opacity: 0.6 * o, letterSpacing: '0.04em'}}>{text}</div>
);
