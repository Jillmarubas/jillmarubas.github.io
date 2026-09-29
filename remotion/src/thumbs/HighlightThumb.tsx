// The user's approved YouTube thumbnail style (Sept 2026), for every video. See SOP "Thumbnails".
// A photoreal reaction image full-bleed on the right, a dark scrim in the design system's darkest
// colour on the left third, and at most three words in Geist 900 with highlight treatments:
//   marker       big yellow key/number + white word (dark outline), punch word white on a red marker stroke  ← default
//   highlighter  first two words dark on a yellow highlighter bar, punch word white on a red bar
//   glow         yellow words with a dark outline, punch word red with a white outline and a red glow
import React from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, staticFile} from 'remotion';

export type ThumbStyle = 'marker' | 'highlighter' | 'glow';
export type ThumbProps = {
  src: string; // image in public/ (staticFile path)
  words: [string, string, string]; // [key or number, word, punch word]; three words max in total
  style?: ThumbStyle;
  ink?: string; // the design system's darkest colour: text outlines and the scrim
  flip?: boolean; // mirror the photo if the subject faces the wrong way
};

export const THUMB_YELLOW = '#FFD60A';
export const THUMB_RED = '#FF2A3D';
const WHITE = '#F4F6FB';

// Geist 800/900 are bundled in public/fonts; loaded here so any project can use this component.
const handle = delayRender('Loading thumbnail fonts');
Promise.all(
  (['800', '900'] as const).map((wt) => {
    const face = new FontFace('Geist', `url(${staticFile(`fonts/Geist-${wt}-normal.woff2`)}) format('woff2')`, {weight: wt});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const outline = (w: number, c: string) =>
  [`${w}px 0 0 ${c}`, `-${w}px 0 0 ${c}`, `0 ${w}px 0 ${c}`, `0 -${w}px 0 ${c}`, `${w * 0.7}px ${w * 0.7}px 0 ${c}`, `-${w * 0.7}px ${w * 0.7}px 0 ${c}`, `${w * 0.7}px -${w * 0.7}px 0 ${c}`, `-${w * 0.7}px -${w * 0.7}px 0 ${c}`].join(', ');

// A marker stroke: slightly rotated bar with ragged ends, like one pass of a highlighter.
const Bar: React.FC<{color: string; rot: number; children: React.ReactNode; pad?: string; ink: string}> = ({color, rot, children, pad = '0.02em 0.22em 0.08em', ink}) => (
  <span style={{position: 'relative', display: 'inline-block', transform: `rotate(${rot}deg)`}}>
    <span
      style={{
        position: 'absolute',
        inset: '8% -3% 0 -3%',
        background: color,
        clipPath: 'polygon(1.5% 6%, 98% 0%, 100% 48%, 98.5% 96%, 2% 100%, 0% 55%)',
        filter: `drop-shadow(0 12px 22px ${rgba(ink, 0.45)})`,
      }}
    />
    <span style={{position: 'relative', padding: pad}}>{children}</span>
  </span>
);

const Words: React.FC<{words: [string, string, string]; style: ThumbStyle; ink: string}> = ({words: [a, b, c], style, ink}) => {
  const base: React.CSSProperties = {fontFamily: 'Geist, sans-serif', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.92};
  const drop = `0 18px 40px ${rgba(ink, 0.55)}`;
  if (style === 'marker')
    return (
      <div style={{...base, transform: 'rotate(-3deg)', transformOrigin: 'left center'}}>
        <div style={{fontSize: 270, color: THUMB_YELLOW, textShadow: `${outline(7, ink)}, ${drop}`}}>{a}</div>
        <div style={{fontSize: 172, color: WHITE, textShadow: `${outline(6, ink)}, ${drop}`}}>{b}</div>
        <div style={{fontSize: 186, color: WHITE, marginTop: 18, marginLeft: -8}}>
          <Bar color={THUMB_RED} rot={-1.5} ink={ink}>
            {c}
          </Bar>
        </div>
      </div>
    );
  if (style === 'highlighter')
    return (
      <div style={{...base, transform: 'rotate(-2deg)', transformOrigin: 'left center'}}>
        <div style={{fontSize: 176, color: ink}}>
          <Bar color={THUMB_YELLOW} rot={-1} pad="0.02em 0.32em 0.08em" ink={ink}>
            {a} {b}
          </Bar>
        </div>
        <div style={{fontSize: 200, color: WHITE, marginTop: 26}}>
          <Bar color={THUMB_RED} rot={1.5} pad="0.02em 0.32em 0.08em" ink={ink}>
            {c}
          </Bar>
        </div>
      </div>
    );
  return (
    <div style={{...base, transform: 'rotate(-3deg)', transformOrigin: 'left center'}}>
      <div style={{fontSize: 250, color: THUMB_YELLOW, textShadow: `${outline(8, ink)}, ${drop}`}}>{a}</div>
      <div style={{fontSize: 170, color: THUMB_YELLOW, textShadow: `${outline(7, ink)}, ${drop}`}}>{b}</div>
      <div style={{fontSize: 196, color: THUMB_RED, textShadow: `${outline(7, '#FFFFFF')}, 0 0 50px ${rgba(THUMB_RED, 0.85)}, ${drop}`}}>{c}</div>
    </div>
  );
};

export const HighlightThumb: React.FC<ThumbProps> = ({src, words, style = 'marker', ink = '#041F5C', flip}) => (
  <AbsoluteFill style={{background: ink, overflow: 'hidden'}}>
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: flip ? 'scaleX(-1)' : undefined}} />
    {/* punchier grade: a little more contrast and saturation than the raw image */}
    <AbsoluteFill style={{backdropFilter: 'contrast(1.08) saturate(1.15)'}} />
    <AbsoluteFill style={{background: `linear-gradient(90deg, ${rgba(ink, 0.85)} 0%, ${rgba(ink, 0.55)} 36%, ${rgba(ink, 0)} 58%)`}} />
    <div style={{position: 'absolute', left: 80, top: style === 'highlighter' ? 250 : 110}}>
      <Words words={words} style={style} ink={ink} />
    </div>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 80% at 60% 50%, rgba(0,0,0,0) 55%, ${rgba(ink, 0.4)} 100%)`}} />
  </AbsoluteFill>
);
