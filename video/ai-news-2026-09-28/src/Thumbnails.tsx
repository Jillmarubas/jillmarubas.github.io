import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Grain} from './components/Field';
import {C, F} from './theme';

// YouTube thumbnails, 1280×720, in the video's look: the green–teal gradient field, grey photos
// in frosted-glass frames, one heavy line of Instrument Sans with a single mint hook word.
// Three variants for YouTube Studio's Test & Compare; each tests one idea (story, faces, stakes).
// Rules: ≤ 3 words that add to the title rather than repeat it, one focal point, readable at
// 200 px wide, real photos only, never type over a face, nothing in the bottom-right corner
// (YouTube prints the running time there).

const photo = (key: string) => staticFile(`photos/${key}.jpg`);
const grey = 'grayscale(1) contrast(1.15) brightness(1)';

// The video's background, frozen and a little brighter so it survives YouTube's small sizes.
const Gradient: React.FC = () => (
  <AbsoluteFill
    style={{
      background: [
        'radial-gradient(60% 75% at 8% 8%, rgba(171,254,193,.34), rgba(171,254,193,0) 70%)',
        'radial-gradient(55% 70% at 88% 18%, rgba(31,138,98,.62), rgba(31,138,98,0) 70%)',
        'radial-gradient(70% 70% at 72% 100%, rgba(27,112,128,.6), rgba(27,112,128,0) 70%)',
        'radial-gradient(80% 80% at 45% 50%, rgba(18,60,44,.7), rgba(18,60,44,0) 75%)',
        '#020504',
      ].join(','),
    }}
  />
);

// A frosted-glass frame: lit rim, depth, and a sheen across the top.
const glassFrame: React.CSSProperties = {
  position: 'absolute',
  borderRadius: 28,
  overflow: 'hidden',
  border: '2px solid rgba(242,243,242,.35)',
  boxShadow: '0 30px 80px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.35)',
};
const Sheen: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(160deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 35%)', pointerEvents: 'none'}} />
);

const Brand: React.FC<{left?: number}> = ({left = 48}) => (
  <div style={{position: 'absolute', left, top: 40, display: 'flex', alignItems: 'center', gap: 12}}>
    <span style={{width: 12, height: 12, borderRadius: 6, background: C.mint}} />
    <span style={{fontFamily: F.sans, fontWeight: 600, fontSize: 24, letterSpacing: '0.06em', color: C.onNight}}>AI NEWS DAILY</span>
  </div>
);

const Headline: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 160}) => (
  <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: size, lineHeight: 0.88, letterSpacing: '-0.06em', color: '#FFFFFF', textShadow: '0 6px 40px rgba(0,0,0,.45)'}}>
    {children}
  </div>
);
const Mint: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: C.mint}}>{children}</span>;

// 1 · the story hook: something got out, and the glass box shows how
export const ThumbEscape: React.FC = () => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <Gradient />
    <div style={{...glassFrame, left: 640, top: 40, width: 600, height: 640}}>
      <Img src={photo('datacenter')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 50%', filter: grey}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,.5), rgba(0,0,0,.1) 60%)'}} />
      {/* the sandbox: a dashed glass box with its side door open and the mint path leaving through it */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 150,
          width: 330,
          height: 330,
          borderRadius: 26,
          border: '6px dashed rgba(255,255,255,.95)',
          background: 'rgba(255,255,255,.08)',
          backdropFilter: 'blur(6px)',
        }}
      />
      <div style={{position: 'absolute', left: 388, top: 270, width: 30, height: 96, background: '#000', borderRadius: 6, border: `5px solid ${C.mint}`}} />
      <div style={{position: 'absolute', left: 190, top: 312, width: 360, height: 12, background: C.mint, borderRadius: 6, boxShadow: '0 0 30px rgba(171,254,193,.8)'}} />
      <div style={{position: 'absolute', left: 520, top: 294, width: 0, height: 0, borderTop: '24px solid transparent', borderBottom: '24px solid transparent', borderLeft: `40px solid ${C.mint}`}} />
      <Sheen />
    </div>
    <Brand />
    <div style={{position: 'absolute', left: 48, top: 170, width: 600}}>
      <Headline>
        It got
        <br />
        <Mint>out.</Mint>
      </Headline>
      <div style={{fontFamily: F.mono, fontSize: 26, color: C.onNight, marginTop: 34, opacity: 0.85}}>Again.</div>
    </div>
    <Grain opacity={0.04} />
  </AbsoluteFill>
);

// 2 · the faces: two rival CEOs in glass frames, one shared warning
export const ThumbRivals: React.FC = () => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <Gradient />
    {[
      {k: 'altman', x: 24, pos: '45% 26%'},
      {k: 'amodei', x: 652, pos: '58% 24%'},
    ].map((p) => (
      <div key={p.k} style={{...glassFrame, left: p.x, top: 24, width: 604, height: 450}}>
        <Img src={photo(p.k)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.pos, filter: grey}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,.55))'}} />
        <Sheen />
      </div>
    ))}
    <div
      style={{
        position: 'absolute',
        left: 48,
        top: 44,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 18px',
        borderRadius: 999,
        background: 'rgba(0,0,0,.55)',
        border: '1px solid rgba(242,243,242,.35)',
      }}
    >
      <span style={{width: 12, height: 12, borderRadius: 6, background: C.mint}} />
      <span style={{fontFamily: F.mono, fontSize: 21, color: C.onNight}}>UN Security Council</span>
    </div>
    <div style={{position: 'absolute', left: 48, top: 492}}>
      <Headline size={168}>
        Same <Mint>warning.</Mint>
      </Headline>
    </div>
    <Grain opacity={0.04} />
  </AbsoluteFill>
);

// 3 · the stakes: the handshake, and what the new line is for
export const ThumbHotline: React.FC = () => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <Gradient />
    <div style={{...glassFrame, left: 24, top: 24, width: 640, bottom: 24}}>
      <Img src={photo('trumpxi2')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '46% 60%', transform: 'scale(1.35)', transformOrigin: '46% 72%', filter: grey}} />
      <Sheen />
    </div>
    <Brand left={712} />
    <div style={{position: 'absolute', left: 712, top: 160, width: 540}}>
      <Headline size={150}>
        For AI
        <br />
        <Mint>mishaps</Mint>
      </Headline>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 40, padding: '12px 20px', borderRadius: 999, background: 'rgba(0,0,0,.45)', border: '1px solid rgba(242,243,242,.35)'}}>
        <span style={{width: 12, height: 12, borderRadius: 6, background: C.mint}} />
        <span style={{fontFamily: F.mono, fontSize: 24, color: C.onNight}}>US × China hotline</span>
      </div>
    </div>
    <Grain opacity={0.04} />
  </AbsoluteFill>
);
