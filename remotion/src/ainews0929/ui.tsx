// Cobalt Haze surfaces for video: the field, glass, type, and the lens pass.
import React from 'react';
import {Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, clamp, F, glass, SHADOW} from './theme';

// ---------- the field: 150° cobalt ramp + four drifting blooms (48–62 s cycles) ----------
export const Field: React.FC<{tint?: number}> = ({tint = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const osc = (period: number, phase = 0) => (1 - Math.cos(((t + phase) / period) * Math.PI * 2)) / 2;
  const bloom = (w: number, pos: React.CSSProperties, color: string, tx: number, ty: number, sc: number, period: number) => {
    const k = osc(period);
    return (
      <div
        style={{
          position: 'absolute',
          width: w,
          height: w,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}, rgba(0,0,0,0) 64%)`,
          transform: `translate(${tx * k}%, ${ty * k}%) scale(${1 + sc * k})`,
          ...pos,
        }}
      />
    );
  };
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: 'linear-gradient(150deg,#041F5C 0%,#05348E 30%,#1E4C9E 52%,#6F8CC0 74%,#B9C3D9 90%,#C9C6CD 100%)'}}>
      {bloom(1500, {right: -560, top: -560}, 'rgba(4,31,92,.92)', -6, 8, 0.05, 62)}
      {bloom(1130, {left: -300, top: 200}, 'rgba(77,113,173,.72)', 10, -8, 0, 56)}
      {bloom(690, {right: 380, bottom: -170}, 'rgba(177,200,224,.75)', 10, -8, 0, 44)}
      {bloom(1550, {right: -560, bottom: -730}, 'rgba(214,210,218,.95)', -8, -6, 0.08, 48)}
      {/* keep the left third deep so type always sits on cobalt, never on the haze bloom */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(4,31,92,.55) 0%, rgba(4,31,92,.18) 45%, rgba(4,31,92,0) 70%)'}} />
      <div style={{position: 'absolute', inset: 0, background: `rgba(4,31,92,${tint})`}} />
    </div>
  );
};

// ---------- lens pass: vignette + grain, re-seeded every frame ----------
export const Lens: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(2,10,36,.42) 100%)'}} />
      <div
        style={{
          position: 'absolute',
          inset: -256,
          backgroundImage: `url(${staticFile('ainews0929/grain.png')})`,
          backgroundSize: '256px 256px',
          transform: `translate(${Math.floor(random(`gx${f}`) * 256)}px, ${Math.floor(random(`gy${f}`) * 256)}px)`,
          opacity: 0.07,
          mixBlendMode: 'overlay',
        }}
      />
    </>
  );
};

// ---------- entrance/exit wrapper: rise 24 px + 8 px blur in, blur out ----------
export const Appear: React.FC<{at: number; out: number; children: React.ReactNode; style?: React.CSSProperties; rise?: number; from?: 'below' | 'left' | 'right'}> = ({
  at,
  out,
  children,
  style,
  rise = 24,
  from = 'below',
}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [at, at + 12], [0, 1], {...clamp, easing: glass});
  const x = interpolate(f, [out, out + 9], [0, 1], clamp);
  if (e <= 0 || x >= 1) return null;
  const d = (1 - e) * rise;
  const tr = from === 'below' ? `translateY(${d}px)` : `translateX(${from === 'left' ? -d * 2 : d * 2}px)`;
  return <div style={{position: 'absolute', opacity: e * (1 - x), filter: `blur(${(1 - e) * 8 + x * 8}px)`, transform: tr, ...style}}>{children}</div>;
};

export const glassBox = (tier: 'chrome' | 'panel' | 'modal' | 'sheet' = 'panel', r = 20): React.CSSProperties => ({
  background: tier === 'chrome' ? C.glassChrome : tier === 'modal' ? C.glassModal : tier === 'sheet' ? C.glassSheet : C.glassPanel,
  backdropFilter: `blur(${tier === 'chrome' ? 10 : tier === 'modal' ? 36 : tier === 'sheet' ? 28 : 20}px) saturate(155%)`,
  border: `1px solid ${C.rim}`,
  borderRadius: r,
  boxShadow: `${SHADOW.float}, ${SHADOW.litTop}, ${SHADOW.shadeBottom}`,
});

// Glass kicker chip: accent dot + mono caps.
export const Kicker: React.FC<{text: string; color?: string; size?: number}> = ({text, color = C.ok, size = 22}) => (
  <div style={{...glassBox('chrome', 999), display: 'inline-flex', alignItems: 'center', gap: 14, padding: '12px 24px 12px 20px'}}>
    <span style={{width: 12, height: 12, borderRadius: 6, background: color, boxShadow: `0 0 14px ${color}`}} />
    <span style={{fontFamily: F.mono, fontWeight: 500, fontSize: size, letterSpacing: '0.12em', color: C.text1, textTransform: 'uppercase'}}>{text}</span>
  </div>
);

// Stepped headline: second line indents 1.12em; *word* renders in Instrument Serif italic.
export const Headline: React.FC<{lines: string[]; at: number; size?: number; color?: string}> = ({lines, at, size = 88, color = C.text1}) => {
  const f = useCurrentFrame();
  let k = 0;
  return (
    <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: size, lineHeight: 0.98, letterSpacing: '-0.045em', color}}>
      {lines.map((line, li) => (
        <div key={li} style={{paddingLeft: li % 2 ? '1.12em' : 0, whiteSpace: 'nowrap'}}>
          {line.split(' ').map((w, wi) => {
            const serif = w.startsWith('*');
            const word = w.replace(/\*/g, '');
            const s = at + k++ * 2;
            const e = interpolate(f, [s, s + 12], [0, 1], {...clamp, easing: glass});
            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  marginRight: '0.24em',
                  opacity: e,
                  transform: `translateY(${(1 - e) * 0.3}em)`,
                  filter: `blur(${(1 - e) * 8}px)`,
                  ...(serif ? {fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.12em', letterSpacing: '-0.01em'} : {}),
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Number that counts up; keeps prefix/suffix and decimals.
export const Counter: React.FC<{to: number; at: number; dur?: number; prefix?: string; suffix?: string; decimals?: number; size?: number; color?: string; from?: number}> = ({
  to,
  at,
  dur = 24,
  prefix = '',
  suffix = '',
  decimals = 0,
  size = 160,
  color = C.text1,
  from = 0,
}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [at, at + dur], [from, to], {...clamp, easing: glass});
  const s = v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  return (
    <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: size, letterSpacing: '-0.05em', lineHeight: 1, color, fontVariantNumeric: 'tabular-nums'}}>
      {prefix}
      {s}
      {suffix}
    </div>
  );
};

// Small glass label pinned under an object.
export const Tag: React.FC<{text: string; color?: string; size?: number; mono?: boolean}> = ({text, color, size = 26, mono}) => (
  <div style={{...glassBox('sheet', 999), padding: '10px 22px', display: 'inline-flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap'}}>
    {color && <span style={{width: 10, height: 10, borderRadius: 5, background: color}} />}
    <span style={{fontFamily: mono ? F.mono : F.sans, fontWeight: 500, fontSize: size, color: C.text1, letterSpacing: mono ? '0.06em' : '-0.01em'}}>{text}</span>
  </div>
);

// Quote on a sheet (body text goes on --glass-sheet so it holds contrast over the haze).
export const Quote: React.FC<{text: string; who: string; width?: number; size?: number}> = ({text, who, width = 760, size = 50}) => (
  <div style={{...glassBox('sheet', 28), width, padding: '40px 48px'}}>
    <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 120, lineHeight: 0.5, color: C.periwinkle200, height: 50}}>“</div>
    <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: size, lineHeight: 1.12, color: C.text1}}>{text}</div>
    <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 20, letterSpacing: '0.1em', color: C.text2, marginTop: 26, textTransform: 'uppercase'}}>{who}</div>
  </div>
);

export const Source: React.FC<{text: string}> = ({text}) => (
  <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 18, letterSpacing: '0.06em', color: 'rgba(214,223,240,.78)'}}>SOURCE · {text}</div>
);

export const Small: React.FC<{children: React.ReactNode; size?: number; color?: string; width?: number}> = ({children, size = 30, color = C.text2, width}) => (
  <div style={{fontFamily: F.sans, fontWeight: 400, fontSize: size, lineHeight: 1.35, color, width, letterSpacing: '-0.01em'}}>{children}</div>
);
