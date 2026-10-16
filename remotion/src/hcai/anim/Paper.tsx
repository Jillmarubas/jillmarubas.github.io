// Cold open 0:28–0:36. The newspaper's question (the user's own image when it's in public/hcai/user, a drawn front
// page until then), stamped "No comment" and then "Taken to court"; then David and Goliath: one local paper against
// one of the most valuable companies on Earth, seen from the ground looking up.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';

/** Pictures the user makes; null until the file is in public/hcai/user. */
export const USER_IMAGES: Record<string, string | null> = {newspaper: 'hcai/user/newspaper.jpg', gpu: 'hcai/user/gpu.jpg', gpu2: 'hcai/user/gpu.jpg'};

const Stamp: React.FC<{text: string; k: number; x: number; y: number; rot: number; color?: string; size?: number; solid?: boolean}> = ({text, k, x, y, rot, color = P.red, size = 84, solid}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.2, 1, Math.min(1, k))})`, opacity: Math.min(1, k * 2), border: `${size / 8.4}px solid ${color}`, borderRadius: size / 4.7, padding: `${size / 7}px ${size / 2.5}px`, fontFamily: AF.head, fontWeight: 800, fontSize: size, color, letterSpacing: '0.04em', whiteSpace: 'nowrap', background: solid ? 'rgba(240,236,228,0.96)' : 'rgba(255,255,255,0.12)', mixBlendMode: solid ? undefined : 'multiply'}}>
      {text}
    </div>
  );

const DrawnFront: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <div style={{position: 'relative', width: 1200, height: 1500, background: '#F7F3EA', padding: '60px 70px', boxSizing: 'border-box', fontFamily: 'Fraunces, serif', color: '#1C1B19', boxShadow: '0 40px 80px rgba(0,0,0,0.45)'}}>
    <div style={{textAlign: 'center', fontWeight: 900, fontSize: 92, letterSpacing: '-0.01em', borderBottom: '6px double #1C1B19', paddingBottom: 14}}>The Local Herald</div>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: AF.mono, fontSize: 20, padding: '10px 0', borderBottom: '2px solid #1C1B19'}}>
      <span>OREGON</span>
      <span>2021</span>
      <span>ILLUSTRATION</span>
    </div>
    <div style={{fontWeight: 900, fontSize: 118, lineHeight: 0.98, marginTop: 40}}>How much of our water is Google using?</div>
    <div style={{fontWeight: 600, fontStyle: 'italic', fontSize: 40, marginTop: 26, color: '#55524C'}}>The city calls the numbers a trade secret</div>
    <div style={{display: 'flex', gap: 36, marginTop: 40}}>
      {[0, 1, 2].map((c) => (
        <div key={c} style={{flex: 1}}>
          {Array.from({length: 16}, (_, i) => (
            <div key={i} style={{height: 12, background: '#CFC8BA', marginBottom: 14, width: `${88 + ((i * 37 + c * 11) % 12)}%`}} />
          ))}
        </div>
      ))}
    </div>
    {children}
  </div>
);

export const Newspaper: React.FC<AnimProps> = ({f, t0}) => {
  const w = (abs: number) => at(t0, abs);
  const src = USER_IMAGES.newspaper;
  const k = ease(f, 0, w(32.7));
  const noComment = pop(f, w(28.75), 8);
  const court = pop(f, w(31.15), 8);
  return (
    <AbsoluteFill style={{background: src ? '#000' : `linear-gradient(160deg, ${P.plum}, ${P.night})`, overflow: 'hidden'}}>
      {src ? (
        // the user's front page; the stamps ride with it and sit over its printed dates (the image says 2023; the story is 2021)
        <AbsoluteFill style={{transform: `scale(${lerp(1.02, 1.09, k)}) translateY(${lerp(6, -10, k)}px)`, transformOrigin: '22% 45%'}}>
          <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
          <Stamp text="NO COMMENT" k={noComment} x={330} y={412} rot={-6} size={52} solid />
          <Stamp text="TAKEN TO COURT" k={court} x={520} y={785} rot={4} size={54} solid />
        </AbsoluteFill>
      ) : (
        <div style={{position: 'absolute', left: 960, top: 545, transform: `translate(-50%,-50%) perspective(2600px) rotateX(${lerp(24, 12, k)}deg) rotateZ(${lerp(-6, -2, k)}deg) scale(${lerp(0.52, 0.62, k)})`}}>
          <DrawnFront>
            <Stamp text="NO COMMENT" k={noComment} x={780} y={1010} rot={-8} />
            <Stamp text="TAKEN TO COURT" k={court} x={560} y={1250} rot={5} />
          </DrawnFront>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Goliath: React.FC<AnimProps> = ({f, t0}) => {
  const w = (abs: number) => at(t0, abs);
  const rise = ease(f, w(33.3), w(34.6) - w(33.3));
  const tilt = ease(f, 0, w(36.3));
  const drop = Math.max(0, Math.min(1, (f - w(35.9)) / (w(36.36) - w(35.9))));
  const towerH = lerp(80, 1500, rise);
  return (
    <AbsoluteFill style={{background: `linear-gradient(${P.blue}, ${P.sky})`, overflow: 'hidden'}}>
      {/* a low camera looking up: the world is tilted back */}
      <AbsoluteFill style={{transform: `perspective(1800px) rotateX(${lerp(-4, -12, tilt)}deg) translateY(${lerp(0, 60, tilt)}px)`, transformOrigin: '50% 100%'}}>
        <div style={{position: 'absolute', left: -200, right: -200, top: 900, bottom: -200, background: P.green}} />
        {/* the newspaper */}
        <div style={{position: 'absolute', left: 360, top: 900 - 230, width: 170, height: 230, background: '#F7F3EA', borderRadius: 6, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', padding: 16, boxSizing: 'border-box', transform: `rotate(-4deg) translateY(${Math.sin(f / 6) * 3}px)`}}>
          <div style={{height: 22, background: P.ink, marginBottom: 12}} />
          {Array.from({length: 8}, (_, i) => (
            <div key={i} style={{height: 8, background: '#CFC8BA', marginBottom: 10, width: `${70 + (i * 17) % 30}%`}} />
          ))}
        </div>
        {/* the company */}
        <div style={{position: 'absolute', left: 980, top: 900 - towerH, width: 560, height: towerH, background: `linear-gradient(90deg, #1E2C5A, #3A4F8F 45%, #24356B)`, boxShadow: '0 0 0 4px #121C3D'}}>
          {Array.from({length: Math.floor(towerH / 70)}, (_, r) => (
            <div key={r} style={{position: 'absolute', left: 30, right: 30, bottom: 30 + r * 70, height: 34, display: 'flex', gap: 14}}>
              {Array.from({length: 6}, (_, c) => (
                <div key={c} style={{flex: 1, background: (r * 7 + c * 3) % 5 ? '#8FB4FF' : P.yellow, opacity: 0.85}} />
              ))}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 250, top: 400, width: 400, textAlign: 'center', opacity: ease(f, 0, 10)}}>
        <Tag bg={P.white} color={P.ink} size={40}>1 local newspaper</Tag>
      </div>
      <div style={{position: 'absolute', left: 1100, top: 120, opacity: ease(f, w(33.5), 10)}}>
        <Tag bg={P.yellow} color={P.ink} size={46}>~$2 trillion company</Tag>
        <Note style={{marginTop: 12, marginLeft: 10}} color={P.white}>Alphabet (Google), market value, late 2021</Note>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: AF.head, fontWeight: 800, fontSize: 90, color: P.white, opacity: ease(f, w(32.9), 8), textShadow: '0 8px 30px rgba(0,0,0,0.35)'}}>vs.</div>
      {/* "over water": one drop falls between them */}
      {drop > 0 && (
        <svg width={120} height={160} viewBox="0 0 60 80" style={{position: 'absolute', left: 900, top: lerp(-160, 720, drop * drop)}}>
          <path d="M30 0 C30 0 0 38 0 52 A30 30 0 0 0 60 52 C60 38 30 0 30 0 Z" fill={P.water} stroke={P.white} strokeWidth={3} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

/** A full-frame picture the user made, with a slow camera move and an optional label at a spoken word. */
const userShot = (key: string, opts: {from: number; to: number; ox: string; label?: string; sub?: string; word?: number}): React.FC<AnimProps> => {
  const Shot: React.FC<AnimProps> = ({f, t0, dur}) => {
    const src = USER_IMAGES[key];
    const k = ease(f, 0, dur);
    const o = opts.word ? ease(f, at(t0, opts.word), 10) : 0;
    return (
      <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
        {src && <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${lerp(opts.from, opts.to, k)})`, transformOrigin: opts.ox}} />}
        {opts.label && (
          <div style={{position: 'absolute', left: 90, bottom: 90, opacity: o, transform: `translateY(${(1 - o) * 20}px)`}}>
            <Tag bg={P.white} color={P.ink} size={50}>{opts.label}</Tag>
            {opts.sub && <Note style={{marginTop: 14, marginLeft: 10}} size={24}>{opts.sub}</Note>}
          </div>
        )}
      </AbsoluteFill>
    );
  };
  return Shot;
};
export const Gpu = userShot('gpu', {from: 1.02, to: 1.12, ox: '52% 52%', label: 'GPU', sub: 'graphics processing unit', word: 139.1});
export const Gpu2 = userShot('gpu2', {from: 1.25, to: 1.4, ox: '52% 50%'});
