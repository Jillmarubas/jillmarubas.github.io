import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import '../gpt1010/fonts';

/*
 * Thumbnail text on the user's Higgsfield image (Asher holding the three app icons), five options.
 * Flat Geist 900, no 3D, no red underline (the user's notes). Text lives in the dark top-left,
 * above the laptop and clear of his hair.
 */
const Y = '#F2C14E';
const W = '#F5F3EE';
const INK = '#0B0B0D';
const shadow = '0 6px 28px rgba(0,0,0,.75), 0 2px 6px rgba(0,0,0,.6)';
const T: React.CSSProperties = {fontFamily: 'Geist, sans-serif', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.9, textShadow: shadow, margin: 0};

const Base: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
    <Img src={staticFile('vs1010/thumb-asher.webp')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    {/* darken the top-left a touch so the words pop */}
    <AbsoluteFill style={{background: 'radial-gradient(60% 70% at 15% 25%, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 70%)'}} />
    <div style={{position: 'absolute', left: 90, top: 80}}>{children}</div>
  </AbsoluteFill>
);

const Arrow: React.FC = () => (
  <svg width={520} height={300} viewBox="0 0 520 300" style={{position: 'absolute', left: 690, top: 540, overflow: 'visible', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.7))'}}>
    <path d="M10 30 C 180 0, 360 60, 440 230" fill="none" stroke={W} strokeWidth={11} strokeLinecap="round" />
    <path d="M395 215 L 445 240 L 462 185" fill="none" stroke={W} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 1: ONLY NEED / ONE (yellow). */
export const AsherThumb1: React.FC = () => (
  <Base>
    <div style={{...T, fontSize: 170, color: W}}>ONLY NEED</div>
    <div style={{...T, fontSize: 290, color: Y}}>ONE</div>
  </Base>
);

/** 2: same words, ONE on a yellow block. */
export const AsherThumb2: React.FC = () => (
  <Base>
    <div style={{...T, fontSize: 170, color: W}}>ONLY NEED</div>
    <div style={{display: 'inline-block', background: Y, padding: '6px 34px 22px', marginTop: 26, transform: 'rotate(-3deg)', boxShadow: '0 14px 40px rgba(0,0,0,.6)'}}>
      <div style={{...T, fontSize: 250, color: INK, textShadow: 'none'}}>ONE</div>
    </div>
  </Base>
);

/** 3: ONLY NEED ONE + arrow to the icons. */
export const AsherThumb3: React.FC = () => (
  <AbsoluteFill>
    <Base>
      <div style={{...T, fontSize: 170, color: W}}>ONLY NEED</div>
      <div style={{...T, fontSize: 290, color: Y}}>ONE</div>
    </Base>
    <Arrow />
  </AbsoluteFill>
);

/** 4: WHICH / ONE? */
export const AsherThumb4: React.FC = () => (
  <Base>
    <div style={{...T, fontSize: 240, color: W}}>WHICH</div>
    <div style={{...T, fontSize: 300, color: Y}}>ONE?</div>
  </Base>
);

/** 5: SAME $20? with the three brand colours under it. */
export const AsherThumb5: React.FC = () => (
  <Base>
    <div style={{...T, fontSize: 200, color: W}}>SAME</div>
    <div style={{...T, fontSize: 330, color: Y}}>$20?</div>
    <div style={{display: 'flex', gap: 18, marginTop: 30}}>
      {['#10A37F', '#D97757', '#4E8DF5'].map((c) => (
        <div key={c} style={{width: 150, height: 16, borderRadius: 8, background: c, boxShadow: `0 0 24px ${c}`}} />
      ))}
    </div>
  </Base>
);
