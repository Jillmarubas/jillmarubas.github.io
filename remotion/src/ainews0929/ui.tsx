// Cobalt Haze surfaces for video: the field, glass, type, and the lens pass.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {LivingGradient, paletteFrom} from '../gradient/GradientLoop';
import {C, clamp, F, glass, SHADOW} from './theme';

// ---------- the field: the approved living gradient (SOP "Daily news videos"), in Cobalt Haze colours ----------
// soften 0: Cobalt Haze sets white type on a deep field, so its own field colours are used as they are
// (softening toward white would drop the headlines below 4.5:1). Order: primary, secondary, light accent, haze.
export const COBALT_GRADIENT = paletteFrom([C.cobalt800, C.azure400, C.ice100, C.periwinkle200], 0);
export const Field: React.FC = () => <LivingGradient palette={COBALT_GRADIENT} />;

// ---------- lens pass: vignette only; grain is the gradient's static grain (never animated) ----------
export const Lens: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(2,10,36,.42) 100%)'}} />
);

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
  <div style={{...glassBox('sheet', 999), display: 'inline-flex', alignItems: 'center', gap: 14, padding: '12px 24px 12px 20px'}}>
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
  <div style={{...glassBox('sheet', 999), display: 'inline-block', padding: '8px 16px', fontFamily: F.mono, fontWeight: 500, fontSize: 18, letterSpacing: '0.06em', color: C.text2, whiteSpace: 'nowrap'}}>SOURCE · {text}</div>
);
// Mono line on a sheet pill (dates, captions).
export const MonoPill: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 24}) => (
  <div style={{...glassBox('sheet', 999), display: 'inline-block', padding: '10px 22px', fontFamily: F.mono, fontWeight: 500, fontSize: size, letterSpacing: '0.24em', color: C.text2, whiteSpace: 'nowrap'}}>{children}</div>
);

export const Small: React.FC<{children: React.ReactNode; size?: number; color?: string; width?: number}> = ({children, size = 30, color = C.text1, width}) => (
  <div style={{...glassBox('sheet', 18), display: 'inline-block', padding: '12px 20px', maxWidth: width, fontFamily: F.sans, fontWeight: 400, fontSize: size, lineHeight: 1.3, color, letterSpacing: '-0.01em'}}>{children}</div>
);
