import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Bar, THUMB_RED, THUMB_YELLOW, Words} from '../thumbs/HighlightThumb';
import {Brick} from './props';

/*
 * YouTube thumbnails for AI News, 1 Oct 2026, built entirely in Remotion (the user's rule: ElevenLabs is
 * for voiceover only). Real, licensed photos of the people in the script (Wikimedia Commons, credited
 * in the description), cut out locally with rembg; official 3D logos; the approved yellow/red lettering.
 * Every word is accurate to the sources: no invented quotes, expressions untouched.
 */
const INK = '#120E0B';
const WHITE = '#F4F6FB';
const cut = (n: string) => staticFile(`news1001/cut/${n}.png`);
const outline = (w: number, c: string) => [`${w}px 0 0 ${c}`, `-${w}px 0 0 ${c}`, `0 ${w}px 0 ${c}`, `0 -${w}px 0 ${c}`, `${w * 0.7}px ${w * 0.7}px 0 ${c}`, `-${w * 0.7}px ${w * 0.7}px 0 ${c}`, `${w * 0.7}px -${w * 0.7}px 0 ${c}`, `-${w * 0.7}px -${w * 0.7}px 0 ${c}`].join(', ');
const big: React.CSSProperties = {fontFamily: 'Geist, sans-serif', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.9};

/** A person cut out of their photo, with a white sticker edge and a hard shadow so they pop off the background. */
const Person: React.FC<{n: string; h: number; x: number; y: number; flip?: boolean; glow?: string; rot?: number; fade?: [number, number]}> = ({n, h, x, y, flip, glow = 'rgba(0,0,0,0)', rot = 0, fade}) => {
  // fade a cut-off neck or hand out instead of showing the cutout's ragged edge; the mask sits on the
  // image and the filter on the wrapper, so the sticker edge and glow follow the faded outline
  const mask = fade ? `linear-gradient(to bottom, #000 ${fade[0]}%, transparent ${fade[1]}%)` : undefined;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `${flip ? 'scaleX(-1) ' : ''}rotate(${rot}deg)`,
        filter: `drop-shadow(0 0 0 #fff) drop-shadow(6px 0 0 #fff) drop-shadow(-6px 0 0 #fff) drop-shadow(0 6px 0 #fff) drop-shadow(0 -6px 0 #fff) drop-shadow(0 26px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 70px ${glow}) contrast(1.08) saturate(1.12)`,
      }}
    >
      <Img src={cut(n)} style={{display: 'block', height: h, WebkitMaskImage: mask, maskImage: mask}} />
    </div>
  );
};
const Grain: React.FC = () => <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, opacity: 0.07, mixBlendMode: 'overlay'}} />;
const Vignette: React.FC = () => <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 85% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)`}} />;

/** D — FTC VS AI: the FTC chair on one side, Anthropic and OpenAI's leaders on the other, torn apart. */
export const N1ThumbD: React.FC = () => (
  <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: 'linear-gradient(100deg, #0E1F3D 0%, #13294F 48%, #3A0A0C 52%, #5A0E10 100%)'}} />
    <Img src={staticFile('news1001/logos/seal_ftc.svg')} style={{position: 'absolute', left: -120, top: 160, width: 760, opacity: 0.12}} />
    {/* the tear down the middle */}
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <path d="M990 0 L955 120 L1000 230 L948 360 L1004 470 L952 610 L1010 720 L958 860 L1000 960 L970 1080" fill="none" stroke="#FFFFFF" strokeWidth={14} strokeLinejoin="round" />
      <path d="M990 0 L955 120 L1000 230 L948 360 L1004 470 L952 610 L1010 720 L958 860 L1000 960 L970 1080" fill="none" stroke={THUMB_RED} strokeWidth={5} strokeLinejoin="round" />
    </svg>
    <Person n="ferguson" h={900} x={90} y={250} glow="rgba(80,140,255,0.45)" />
    <Person n="brockman" h={760} x={1430} y={360} glow="rgba(255,60,60,0.45)" />
    <Person n="amodei" h={820} x={1030} y={300} glow="rgba(255,60,60,0.45)" fade={[82, 96]} />
    <div style={{...big, position: 'absolute', left: 60, top: 40, fontSize: 250, color: THUMB_YELLOW, textShadow: `${outline(8, INK)}, 0 18px 40px rgba(0,0,0,0.6)`, transform: 'rotate(-3deg)'}}>FTC</div>
    <div style={{...big, position: 'absolute', right: 70, top: 40, fontSize: 250, color: THUMB_YELLOW, textShadow: `${outline(8, INK)}, 0 18px 40px rgba(0,0,0,0.6)`, transform: 'rotate(3deg)'}}>AI</div>
    <div style={{...big, position: 'absolute', left: 770, top: 420, fontSize: 190, color: WHITE, transform: 'rotate(-6deg)'}}>
      <Bar color={THUMB_RED} rot={0} ink={INK} pad="0.04em 0.18em 0.1em">
        VS
      </Bar>
    </div>
    <Grain />
    <Vignette />
  </AbsoluteFill>
);

/** E — $355M TAX BREAK: Zuckerberg, smiling, under a rain of cash, wearing the label Meta gave his pay. */
export const N1ThumbE: React.FC = () => {
  const bricks = [
    [1180, 40, -18, 150], [1560, 110, 14, 130], [1760, 420, -10, 120], [1080, 600, 22, 140], [1450, 780, -16, 150], [1820, 760, 8, 110], [1060, 330, 12, 120],
  ];
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 70% at 70% 55%, #3B2A12 0%, #1A130B 55%, #0E0A07 100%)'}} />
      {bricks.map(([x, y, r, w], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${r}deg)`, filter: i % 2 ? 'blur(3px)' : 'none', opacity: 0.95}}>
          <Brick w={w} />
        </div>
      ))}
      <Person n="zuckerberg" h={1000} x={1170} y={160} glow="rgba(255,190,80,0.45)" />
      {/* the label: Meta counted his stock-option pay as "research" */}
      <div style={{position: 'absolute', left: 1380, top: 800, transform: 'rotate(-7deg)', background: '#FFFFFF', border: `10px solid ${THUMB_RED}`, borderRadius: 16, padding: '6px 30px 12px', boxShadow: '0 18px 30px rgba(0,0,0,0.5)'}}>
        <div style={{fontFamily: 'Geist, sans-serif', fontWeight: 900, fontSize: 30, color: THUMB_RED, letterSpacing: '0.12em', textAlign: 'center'}}>HELLO, MY PAY IS</div>
        <div style={{fontFamily: 'Caveat, cursive', fontWeight: 600, fontSize: 92, color: INK, lineHeight: 1, textAlign: 'center'}}>“research”</div>
      </div>
      <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(18,14,11,0.9) 0%, rgba(18,14,11,0.5) 38%, rgba(18,14,11,0) 55%)`}} />
      <div style={{position: 'absolute', left: 70, top: 200}}>
        <Words words={['$355M', 'TAX', 'BREAK']} style="marker" ink={INK} />
      </div>
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};

/** F — THEY POLICE THEMSELVES: the President over the six CEOs who signed a voluntary pact (critics: no independent enforcement). */
export const N1ThumbF: React.FC = () => {
  const ceos = ['amodei', 'brockman', 'pichai', 'zuckerberg', 'musk', 'huang'];
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 55% 75% at 78% 40%, #4A0F12 0%, #1C0B0B 55%, #0C0808 100%)'}} />
      <Person n="trump" h={1000} x={1230} y={40} glow="rgba(255,60,60,0.5)" fade={[68, 73]} />
      <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(12,8,8,0.92) 0%, rgba(12,8,8,0.55) 34%, rgba(12,8,8,0) 50%)`}} />
      {/* the six signers, lined up like a group photo */}
      <div style={{position: 'absolute', left: 560, bottom: -30, display: 'flex', alignItems: 'flex-end'}}>
        {ceos.map((n, i) => (
          <Img key={n} src={cut(n)} style={{height: n === 'huang' ? 300 : 330, marginLeft: i ? -40 : 0, filter: 'drop-shadow(0 0 0 #fff) drop-shadow(4px 0 0 #fff) drop-shadow(-4px 0 0 #fff) drop-shadow(0 -4px 0 #fff) drop-shadow(0 16px 26px rgba(0,0,0,0.6)) contrast(1.06)', zIndex: 10 - Math.abs(i - 2.5)}} />
        ))}
      </div>
      {/* the accord, stamped */}
      <div style={{position: 'absolute', left: 80, top: 700, width: 420, height: 300, background: '#F7F2E8', transform: 'rotate(-5deg)', zIndex: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.55)', padding: 26, boxSizing: 'border-box'}}>
        <div style={{fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 30, color: INK, lineHeight: 1.05}}>White House Accord on Super Intelligence</div>
        {Array.from({length: 5}, (_, i) => (
          <div key={i} style={{height: 9, background: 'rgba(0,0,0,0.15)', marginTop: 14, width: `${88 - (i % 3) * 12}%`}} />
        ))}
        <div style={{position: 'absolute', left: 34, top: 150, transform: 'rotate(-8deg)', border: `8px solid ${THUMB_RED}`, color: THUMB_RED, fontFamily: 'Geist, sans-serif', fontWeight: 900, fontSize: 46, padding: '4px 16px', letterSpacing: '0.06em', mixBlendMode: 'multiply'}}>VOLUNTARY</div>
      </div>
      <div style={{position: 'absolute', left: 70, top: 90}}>
        <div style={{...big, transform: 'rotate(-3deg)', transformOrigin: 'left center'}}>
          <div style={{fontSize: 190, color: WHITE, textShadow: `${outline(6, INK)}, 0 18px 40px rgba(0,0,0,0.6)`}}>THEY</div>
          <div style={{fontSize: 230, color: THUMB_YELLOW, textShadow: `${outline(7, INK)}, 0 18px 40px rgba(0,0,0,0.6)`}}>POLICE</div>
          <div style={{fontSize: 150, color: WHITE, marginTop: 16, marginLeft: -6}}>
            <Bar color={THUMB_RED} rot={-1.5} ink={INK}>
              THEMSELVES
            </Bar>
          </div>
        </div>
      </div>
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
