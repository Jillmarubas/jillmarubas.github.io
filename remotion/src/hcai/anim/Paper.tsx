// Cold open 0:28–0:36. The newspaper's question (the user's own image when it's in public/hcai/user, a drawn front
// page until then), stamped "No comment" and then "Taken to court"; then David and Goliath: one local paper against
// one of the most valuable companies on Earth, seen from the ground looking up.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';

/** Pictures the user makes; null until the file is in public/hcai/user. */
export const USER_IMAGES: Record<string, string | null> = {newspaper: null, gpu: null};

const Stamp: React.FC<{text: string; k: number; x: number; y: number; rot: number; color?: string}> = ({text, k, x, y, rot, color = P.red}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.2, 1, Math.min(1, k))})`, opacity: Math.min(1, k * 2), border: `10px solid ${color}`, borderRadius: 18, padding: '12px 34px', fontFamily: AF.head, fontWeight: 800, fontSize: 84, color, letterSpacing: '0.04em', whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.12)', mixBlendMode: 'multiply'}}>
      {text}
    </div>
  );

const DrawnFront: React.FC = () => (
  <div style={{width: 1200, height: 1500, background: '#F7F3EA', padding: '60px 70px', boxSizing: 'border-box', fontFamily: 'Fraunces, serif', color: '#1C1B19', boxShadow: '0 40px 80px rgba(0,0,0,0.45)'}}>
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
        <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${lerp(1.04, 1.14, k)}) translateY(${lerp(10, -20, k)}px)`}} />
      ) : (
        <div style={{position: 'absolute', left: 960, top: 590, transform: `translate(-50%,-50%) perspective(2600px) rotateX(${lerp(30, 16, k)}deg) rotateZ(${lerp(-8, -3, k)}deg) scale(${lerp(0.56, 0.7, k)})`}}>
          <DrawnFront />
        </div>
      )}
      <Stamp text="NO COMMENT" k={noComment} x={1330} y={760} rot={-8} />
      <Stamp text="TAKEN TO COURT" k={court} x={720} y={930} rot={5} />
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
