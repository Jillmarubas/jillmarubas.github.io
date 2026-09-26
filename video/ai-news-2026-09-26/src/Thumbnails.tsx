import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Grain} from './components/Field';
import {C, F} from './theme';

// YouTube thumbnails, 1280×720, in the video's Frost Glass look. Three variants for
// YouTube Studio's Test & Compare; each changes one idea (story, faces, stakes).
// Rules: ≤ 3 words, one focal point, readable at 200 px wide, real photos only.

const photo = (key: string) => staticFile(`photos/${key}.jpg`);

const Brand: React.FC<{dark?: boolean}> = ({dark}) => (
  <div
    style={{
      position: 'absolute',
      left: 40,
      top: 34,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 16px',
      borderRadius: 10,
      background: dark ? 'rgba(10,8,6,.7)' : C.glassStrong,
      border: `1px solid ${C.rimLit}`,
      backdropFilter: 'blur(14px)',
    }}
  >
    <div style={{width: 12, height: 12, borderRadius: 6, background: C.accent, boxShadow: '0 0 14px rgba(250,90,5,.9)'}} />
    <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 24, letterSpacing: '0.04em', color: C.text}}>AI NEWS DAILY</div>
  </div>
);

// Heavy display type with a dark halo so it survives any photo and a phone-sized view.
const Big: React.FC<{children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties}> = ({
  children,
  size,
  color = C.text,
  style,
}) => (
  <div
    style={{
      fontFamily: F.display,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 0.86,
      letterSpacing: '-0.035em',
      color,
      textTransform: 'uppercase',
      textShadow: '0 6px 0 rgba(0,0,0,.35), 0 10px 40px rgba(0,0,0,.65)',
      WebkitTextStroke: '2px rgba(0,0,0,.25)',
      ...style,
    }}
  >
    {children}
  </div>
);

// ---- A: AI BROKE IN ------------------------------------------------------------------
// The story people will talk about. Parliament House is sliced by a breach glitch; the
// question the image leaves open is: into what, and how?
export const ThumbBreach: React.FC = () => {
  const slices = [
    {top: 36, h: 7, dx: 46, tint: 'rgba(255,90,90,.55)'},
    {top: 52, h: 4, dx: -38, tint: 'rgba(250,90,5,.5)'},
    {top: 63, h: 9, dx: 64, tint: 'rgba(255,90,90,.45)'},
    {top: 76, h: 3, dx: -26, tint: 'rgba(250,90,5,.55)'},
  ];
  const img = {position: 'absolute' as const, left: 300, top: -20, width: 1080, height: 760, objectFit: 'cover' as const, objectPosition: '50% 55%'};
  return (
    <AbsoluteFill style={{background: '#0a0a0a', overflow: 'hidden'}}>
      <Img src={photo('canberra')} style={{...img, filter: 'saturate(1.15) contrast(1.08)'}} />
      {/* breach glitch: horizontal slices of the same photo, displaced and tinted */}
      {slices.map((s, i) => (
        <div key={i} style={{position: 'absolute', inset: 0, clipPath: `inset(${s.top}% 0 ${100 - s.top - s.h}% 0)`}}>
          <Img src={photo('canberra')} style={{...img, left: 300 + s.dx, filter: 'saturate(1.4) contrast(1.2)'}} />
          <div style={{position: 'absolute', inset: 0, background: s.tint, mixBlendMode: 'screen'}} />
        </div>
      ))}
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,6,5,.97) 0%, rgba(8,6,5,.9) 32%, rgba(8,6,5,.25) 60%, rgba(8,6,5,0) 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(60% 70% at 0% 100%, rgba(250,90,5,.45), rgba(250,90,5,0) 70%)'}} />
      <Brand />
      <div style={{position: 'absolute', left: 44, top: 150}}>
        <Big size={236} color={C.accent}>AI</Big>
        <Big size={150}>Broke</Big>
        <Big size={150}>in</Big>
      </div>
      <div
        style={{
          // top right: YouTube draws the video length over the bottom-right corner
          position: 'absolute',
          right: 40,
          top: 40,
          padding: '12px 18px',
          borderRadius: 8,
          background: C.danger,
          color: '#1a0505',
          fontFamily: F.mono,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: '0.08em',
          boxShadow: '0 8px 30px rgba(255,90,90,.45)',
          transform: 'rotate(3deg)',
        }}
      >
        UNAUTHORIZED ACCESS
      </div>
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};

// ---- B: 90 MIN APART -------------------------------------------------------------------
// Two faces, eye contact on the left, split by an orange slash: the race between the labs.
export const ThumbRace: React.FC = () => (
  <AbsoluteFill style={{background: '#0a0a0a', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 700, height: 720, clipPath: 'polygon(0 0, 100% 0, 78% 100%, 0 100%)', overflow: 'hidden'}}>
      <Img src={photo('altman')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '48% 20%', transform: 'scale(1.18)', transformOrigin: '48% 25%', filter: 'contrast(1.08) saturate(1.05)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(8,6,5,.85) 0%, rgba(8,6,5,0) 45%)'}} />
    </div>
    <div style={{position: 'absolute', right: 0, top: 0, width: 700, height: 720, clipPath: 'polygon(22% 0, 100% 0, 100% 100%, 0 100%)', overflow: 'hidden'}}>
      <Img src={photo('amodei')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '52% 25%', transform: 'scale(1.35)', transformOrigin: '55% 22%', filter: 'contrast(1.08) saturate(1.05)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(8,6,5,.85) 0%, rgba(8,6,5,0) 45%)'}} />
    </div>
    {/* the orange slash between them */}
    <div style={{position: 'absolute', left: 612, top: -40, width: 26, height: 820, background: C.accent, transform: 'rotate(9.6deg)', boxShadow: '0 0 60px rgba(250,90,5,.8)'}} />
    <Brand dark />
    {/* kept clear of the bottom-right corner, where YouTube shows the video length */}
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          padding: '10px 26px 16px',
          borderRadius: 18,
          background: 'rgba(10,8,6,.72)',
          border: `1px solid ${C.rimLit}`,
          boxShadow: '0 20px 60px rgba(0,0,0,.6)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 22,
        }}
      >
        <Big size={150} color={C.accent} style={{textShadow: 'none'}}>90 MIN</Big>
        <Big size={96} style={{textShadow: 'none'}}>apart</Big>
      </div>
    </div>
    <Grain opacity={0.06} />
  </AbsoluteFill>
);

// ---- C: UK LOCKED OUT ----------------------------------------------------------------------
// The geopolitics angle: the White House, a padlock line, and who is on the other side.
export const ThumbLocked: React.FC = () => (
  <AbsoluteFill style={{background: '#0a0a0a', overflow: 'hidden'}}>
    <Img src={photo('whitehouse')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%', filter: 'contrast(1.1) saturate(1.1)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(8,6,5,.96) 0%, rgba(8,6,5,.75) 42%, rgba(8,6,5,.1) 75%)'}} />
    <AbsoluteFill style={{background: 'rgba(250,90,5,.12)', mixBlendMode: 'soft-light'}} />
    <Brand />
    {/* a hard orange bar, like a closed barrier, across the building */}
    <div style={{position: 'absolute', left: -20, right: -20, top: 300, height: 22, background: C.accent, boxShadow: '0 0 50px rgba(250,90,5,.7)', transform: 'rotate(-2deg)'}} />
    <div style={{position: 'absolute', left: 46, bottom: 44}}>
      <Big size={210} color={C.accent}>UK</Big>
      <Big size={132}>locked out</Big>
    </div>
    <Grain opacity={0.07} />
  </AbsoluteFill>
);
