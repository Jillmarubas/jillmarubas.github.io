import React from 'react';
import {Easing, Img, interpolate, random, staticFile} from 'remotion';
import {C, F, H, W} from './design';
import ASSETS from './assets.gen.json';

/*
 * Pieces for the paper collage. Every piece is drawn at its natural size; the stage decides where it sits.
 * Photos are prints with a white border and a strip of tape; cut-outs are stickers with a thin white edge;
 * logos sit on a small white card; people are cut-outs with a name strip.
 */
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const glide = Easing.bezier(0.33, 0, 0.15, 1);
export const settle = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : glide(x));
export const inOut = Easing.bezier(0.45, 0, 0.2, 1);
export const e01 = (f: number, a: number, d: number, ease: (x: number) => number = inOut) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: ease});

type Asset = {id: string; type: string; src: string; w: number; h: number; credit: string; name?: string; role?: string};
const A = ASSETS as unknown as Record<string, Asset>;
export const asset = (id: string): Asset | undefined => A[id];

/** Box (w, h) a piece takes at scale 1, for layout. */
export const pieceSize = (kind: string, ref: string, big: boolean): [number, number] => {
  const a = A[ref];
  if (kind === 'p') {
    const r = a ? a.w / a.h : 1.5;
    const maxW = big ? 1040 : 1040, maxH = big ? 640 : 640;
    const w = Math.min(maxW, maxH * r);
    return [w + 28, w / r + 28];
  }
  if (kind === 'c' || kind === 'h') {
    const r = a ? a.w / a.h : 1;
    const maxW = kind === 'h' ? 560 : 640, maxH = kind === 'h' ? 680 : 560;
    const w = Math.min(maxW, maxH * r);
    return [w, w / r];
  }
  if (kind === 'l') return [520, 300];
  if (kind === 'n') return [Math.min(1700, 80 + ref.replace(/\*/g, '').length * numSize(ref) * 0.6), 260];
  const n = ref.replace(/\*/g, '').length;
  return [n <= 18 ? 80 + n * wordSize(ref) * 0.56 : Math.min(1400, 160 + n * 40), n > 26 ? 280 : 180];
};

const Accent: React.FC<{text: string}> = ({text}) => (
  <>
    {text.split(/(\*[^*]+\*)/).map((s, i) =>
      s.startsWith('*') ? (
        <span key={i} style={{color: C.hum}}>
          {s.slice(1, -1)}
        </span>
      ) : (
        <span key={i}>{s}</span>
      ),
    )}
  </>
);

const Credit: React.FC<{text: string; dark?: boolean}> = ({text, dark}) =>
  text ? (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: -30, textAlign: 'right', fontFamily: F.mono, fontSize: 13, letterSpacing: '0.04em', color: dark ? 'rgba(236,232,225,0.6)' : C.ink2, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
      {text}
    </div>
  ) : null;

export const Photo: React.FC<{id: string; w: number; h: number; seed: number}> = ({id, w, h, seed}) => {
  const a = A[id];
  const tapeRot = (random(`t${seed}`) - 0.5) * 10;
  return (
    <div style={{width: w, height: h, background: '#FFFEFB', padding: 14, boxSizing: 'border-box', position: 'relative', boxShadow: '0 1px 0 rgba(0,0,0,0.04)'}}>
      {a ? <Img src={staticFile(a.src)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'contrast(1.03) saturate(0.96)'}} /> : <Missing id={id} />}
      <div style={{position: 'absolute', top: -14, left: '50%', width: 120, height: 30, marginLeft: -60, background: 'rgba(236,226,200,0.82)', transform: `rotate(${tapeRot}deg)`, boxShadow: '0 1px 2px rgba(0,0,0,0.08)'}} />
      <Credit text={a?.credit ?? ''} />
    </div>
  );
};

/** A cut-out sticker: thin white edge around the alpha shape. */
export const Cutout: React.FC<{id: string; w: number; h: number}> = ({id, w, h}) => {
  const a = A[id];
  if (!a) return <Missing id={id} w={w} h={h} />;
  const edge = 'drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff)';
  return (
    <div style={{width: w, height: h, position: 'relative'}}>
      <Img src={staticFile(a.src)} style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block', filter: a.type === 'c' || a.type === 'h' ? edge : undefined}} />
      <Credit text={a.credit} />
    </div>
  );
};

export const Person: React.FC<{id: string; w: number; h: number}> = ({id, w, h}) => {
  const a = A[id];
  return (
    <div style={{width: w, height: h, position: 'relative'}}>
      <Cutout id={id} w={w} h={h} />
      <div style={{position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%) rotate(-2deg)', background: C.ink, color: '#fff', padding: '10px 22px 12px', whiteSpace: 'nowrap', textAlign: 'center'}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 40, lineHeight: 1}}>{a?.name ?? id}</div>
        {a?.role && <div style={{fontFamily: F.mono, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6, opacity: 0.8}}>{a.role}</div>}
      </div>
    </div>
  );
};

export const Logo: React.FC<{id: string; w: number; h: number}> = ({id, w, h}) => {
  const a = A[id];
  return (
    <div style={{width: w, height: h, background: '#FFFFFF', borderRadius: 6, padding: 44, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
      {a ? <Img src={staticFile(a.src)} style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} /> : <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 56, color: C.ink}}>{id}</div>}
    </div>
  );
};

const wordSize = (t: string) => {
  const n = t.replace(/\*/g, '').length;
  return n > 34 ? 70 : n > 22 ? 88 : n > 12 ? 108 : 132;
};
const numSize = (t: string) => {
  const n = t.replace(/\*/g, '').length;
  return n <= 6 ? 190 : n <= 10 ? 150 : 112;
};
export const Words: React.FC<{text: string; w: number; size?: number; night?: boolean}> = ({text, w, size, night}) => {
  const s = size ?? wordSize(text);
  const short = text.replace(/\*/g, '').length <= 18;
  return (
    <div style={{width: w, fontFamily: F.display, fontWeight: 900, fontSize: s, lineHeight: 1.02, color: night ? C.nightInk : C.ink, textAlign: 'center', letterSpacing: '-0.01em', whiteSpace: short ? 'nowrap' : undefined, textShadow: night ? 'none' : '0 2px 18px rgba(242,238,230,0.9)'}}>
      <Accent text={text} />
    </div>
  );
};

export const Num: React.FC<{text: string; w: number}> = ({text, w}) => (
  <div style={{width: w, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: F.display, fontWeight: 900, fontSize: numSize(text), lineHeight: 1, color: C.hum, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 18px rgba(242,238,230,0.9)'}}>
    <Accent text={text} />
  </div>
);

const Missing: React.FC<{id: string; w?: number; h?: number}> = ({id, w, h}) => (
  <div style={{width: w ?? '100%', height: h ?? '100%', background: '#E4DED2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 20, color: C.ink2}}>{id}</div>
);

export const Kicker: React.FC<{text: string; o: number}> = ({text, o}) => (
  <div
    style={{
      position: 'absolute',
      left: 64,
      bottom: 46,
      maxWidth: W - 128,
      opacity: o,
      transform: `translateX(${(1 - o) * -24}px)`,
      fontFamily: F.mono,
      fontWeight: 500,
      fontSize: 22,
      letterSpacing: '0.14em',
      color: C.ink,
      background: 'rgba(251,249,244,0.92)',
      padding: '10px 18px',
      borderLeft: `5px solid ${C.hum}`,
    }}
  >
    {text}
  </div>
);
export {Accent, H, W};
