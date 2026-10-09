import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import envelope from '../../public/tavern/envelope.json';
import '../promo/fonts';

/*
 * "Rainy Tavern Night", animated entirely in Remotion from one photoreal still (no video model).
 * Layers over the photo: displaced flame, flickering hearth/candle light, rain and droplets on the window,
 * rising steam, embers and dust, a breathing cat, slow camera drift, occasional distant lightning.
 * Nothing loops: every effect is procedural, so a 3-minute track never repeats a visible pattern.
 * Light follows the music's loudness envelope and note onsets (scripts/tavern_envelope.py).
 */
export const STILL_FPS = 30;
export const STILL_FULL = envelope.frames;
export const STILL_TEST = 45 * STILL_FPS;
const W = 1920;
const H = 1080;

const rnd = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const envAt = (f: number) => envelope.env[Math.min(envelope.env.length - 1, Math.max(0, Math.floor(f)))];
const sinceOnset = (t: number) => {
  let last = -10;
  for (const o of envelope.onsets) {
    if (o <= t) last = o;
    else break;
  }
  return t - last;
};
const flick = (f: number, a: number, b: number, c: number) => 0.5 * Math.sin(f * a) + 0.3 * Math.sin(f * b + 1.7) + 0.2 * Math.sin(f * c + 4.1);

// positions in 1920x1080 space, measured on the still
const FIRE = {x: 482, y: 805, rx: 84, ry: 96};
const CANDLES = [
  {x: 1420, y: 735, s: 1},
  {x: 1382, y: 758, s: 0.8},
  {x: 248, y: 395, s: 0.7},
  {x: 290, y: 402, s: 0.6},
  {x: 742, y: 425, s: 0.7},
  {x: 768, y: 428, s: 0.6},
];
const WINDOW = '1280,92 1800,70 1822,650 1272,672';
const MUG = {x: 1002, y: 722};
const CAT = {x: 700, y: 862};

export const StillTavern: React.FC<{frames?: number; sound?: boolean}> = ({frames = STILL_TEST, sound = true}) => {
  const frame = useCurrentFrame();
  const t = frame / STILL_FPS;
  const glow = Math.pow(envAt(frame), 1.4);
  const pulse = Math.max(0, 1 - sinceOnset(t) / 0.5) * 0.3;
  const light = Math.min(1, glow * 0.8 + pulse);

  // slow breathing camera drift (never a cut)
  const camS = 1.045 + Math.sin(frame / 520) * 0.012;
  const camX = Math.sin(frame / 410) * 14;
  const camY = Math.cos(frame / 480) * 8;

  const fireF = 0.82 + 0.18 * flick(frame, 0.55, 1.31, 2.7) + light * 0.18;

  // distant lightning: faint flashes on the window every ~38 s
  const lp = (frame % 1140) / 30;
  const lightning = Math.max(0, 1 - Math.abs(lp - 21) / 0.35) * 0.55 + Math.max(0, 1 - Math.abs(lp - 21.5) / 0.2) * 0.3;

  const titleOp = interpolate(frame, [30, 66, 190, 232], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleRise = interpolate(frame, [30, 74], [16, 0], {easing: Easing.bezier(0.22, 1, 0.36, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeIn = interpolate(frame, [0, 45], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [frames - 75, frames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const seed = Math.floor(frame / 2);
  const breath = Math.sin(frame / 36) * 1.6;

  return (
    <AbsoluteFill style={{background: '#050403'}}>
      {sound && <Audio src={staticFile('tavern/music.mp3')} />}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="flameWarp" x="-20%" y="-30%" width="140%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency={`0.018 ${0.045 + Math.sin(frame / 9) * 0.006}`} numOctaves={2} seed={seed % 97} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={16 + light * 9} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="softBlur"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="steamBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
          <filter id="glassBlur"><feGaussianBlur stdDeviation="0.7" /></filter>
          <radialGradient id="warm"><stop offset="0" stopColor="#FFB45A" stopOpacity="0.9" /><stop offset="0.45" stopColor="#FF8A2A" stopOpacity="0.28" /><stop offset="1" stopColor="#FF7A1A" stopOpacity="0" /></radialGradient>
          <radialGradient id="candle"><stop offset="0" stopColor="#FFE2A0" stopOpacity="0.95" /><stop offset="0.35" stopColor="#FFB45A" stopOpacity="0.35" /><stop offset="1" stopColor="#FFB45A" stopOpacity="0" /></radialGradient>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.78"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
          <clipPath id="fireClip"><ellipse cx={FIRE.x} cy={FIRE.y} rx={FIRE.rx} ry={FIRE.ry} /></clipPath>
          <clipPath id="winClip"><polygon points={WINDOW} /></clipPath>
          <clipPath id="catClip"><ellipse cx={CAT.x} cy={CAT.y} rx={78} ry={42} /></clipPath>
          <mask id="fireFeather"><ellipse cx={FIRE.x} cy={FIRE.y} rx={FIRE.rx} ry={FIRE.ry} fill="#fff" filter="url(#softBlur)" /></mask>
          <mask id="catFeather"><ellipse cx={CAT.x} cy={CAT.y} rx={72} ry={36} fill="#fff" filter="url(#softBlur)" /></mask>
        </defs>

        <g transform={`translate(${W / 2 + camX} ${H / 2 + camY}) scale(${camS}) translate(${-W / 2} ${-H / 2})`}>
          {/* the photograph */}
          <image href={staticFile('tavern/still.jpg')} x={0} y={0} width={W} height={H} />

          {/* flame: a feathered copy of the fire region, warped by animated turbulence + brightness flicker */}
          <g mask="url(#fireFeather)" style={{filter: `brightness(${0.9 + fireF * 0.35}) saturate(1.15)`}}>
            <g filter="url(#flameWarp)">
              <image href={staticFile('tavern/still.jpg')} x={0} y={0} width={W} height={H} clipPath="url(#fireClip)" />
            </g>
          </g>

          {/* cat breathing: a feathered copy that rises and falls a pixel or two */}
          <g mask="url(#catFeather)">
            <g transform={`translate(0 ${breath * 0.5}) translate(${CAT.x} ${CAT.y}) scale(1 ${1 + breath * 0.006}) translate(${-CAT.x} ${-CAT.y})`}>
              <image href={staticFile('tavern/still.jpg')} x={0} y={0} width={W} height={H} clipPath="url(#catClip)" />
            </g>
          </g>

          {/* hearth light on the room, flickering and following the music */}
          <g style={{mixBlendMode: 'screen'}}>
            <ellipse cx={FIRE.x + 40} cy={FIRE.y - 30} rx={560} ry={420} fill="url(#warm)" opacity={0.2 * fireF + light * 0.22} />
            <ellipse cx={FIRE.x} cy={FIRE.y + 70} rx={300} ry={90} fill="url(#warm)" opacity={0.16 * fireF + light * 0.12} />
            {CANDLES.map((c, i) => {
              const f = 0.8 + 0.2 * flick(frame, 0.7 + i * 0.13, 1.9 + i * 0.07, 3.3, ) + light * 0.1;
              return <circle key={i} cx={c.x} cy={c.y - 14} r={90 * c.s} fill="url(#candle)" opacity={0.42 * f * c.s + light * 0.05} />;
            })}
          </g>

          {/* window: streaming rain + sliding droplets + faint lightning */}
          <g clipPath="url(#winClip)">
            <rect x={1250} y={60} width={600} height={620} fill="#9CC3FF" opacity={lightning * 0.42} style={{mixBlendMode: 'screen'}} />
            <g filter="url(#glassBlur)" stroke="#CFE4FF" strokeLinecap="round">
              {Array.from({length: 110}).map((_, i) => {
                const x = 1270 + rnd(i, 3) * 560;
                const len = 30 + rnd(i, 5) * 56;
                const sp = 17 * (0.75 + rnd(i, 7) * 0.6);
                const y = 70 + ((rnd(i, 9) * 620 + frame * sp) % (620 + len)) - len;
                return <line key={i} x1={x} y1={y} x2={x - len * 0.16} y2={y + len} strokeWidth={1.2 + rnd(i, 11) * 1.6} opacity={0.12 + rnd(i, 13) * 0.28} />;
              })}
            </g>
            {Array.from({length: 16}).map((_, i) => {
              const x = 1290 + rnd(i, 61) * 520;
              const speed = 0.6 + rnd(i, 65) * 1.1;
              const y = 80 + ((rnd(i, 63) * 600 + frame * speed) % 600);
              const wobble = Math.sin(frame * 0.05 + i * 2) * 1.2;
              return (
                <g key={i}>
                  <ellipse cx={x + wobble} cy={y} rx={2.6} ry={6 + rnd(i, 67) * 5} fill="#EAF3FF" opacity={0.38} />
                  <line x1={x + wobble} y1={y - 60 * speed} x2={x + wobble} y2={y} stroke="#EAF3FF" strokeWidth={1.2} opacity={0.12} />
                </g>
              );
            })}
          </g>

          {/* steam over the mug */}
          <g filter="url(#steamBlur)">
            {Array.from({length: 7}).map((_, i) => {
              const life = 160;
              const age = (frame + i * (life / 7)) % life;
              const p = age / life;
              const x = MUG.x + Math.sin(age * 0.045 + i * 1.7) * (14 + p * 34) + (i - 3) * 3;
              const y = MUG.y - p * 190;
              return <ellipse key={i} cx={x} cy={y} rx={14 + p * 36} ry={20 + p * 44} fill="#FFEFD6" opacity={0.2 * Math.sin(p * Math.PI)} />;
            })}
          </g>

          {/* embers rising from the fire, bursting slightly on note onsets */}
          {Array.from({length: 22}).map((_, i) => {
            const life = 110 + rnd(i, 21) * 110;
            const age = (frame + rnd(i, 23) * life) % life;
            const p = age / life;
            const burst = Math.max(0, 1 - sinceOnset(t) / 1.0);
            const x = FIRE.x + (rnd(i, 25) - 0.5) * 110 + Math.sin(age * 0.09 + i) * 26 * p;
            const y = FIRE.y - 30 - p * (260 + rnd(i, 29) * 220);
            return <circle key={i} cx={x} cy={y} r={1.3 + rnd(i, 31) * 2.2 * (0.8 + burst * 0.5)} fill={i % 3 ? '#FFD25A' : '#FF9A2E'} opacity={Math.sin(p * Math.PI) * (0.55 + burst * 0.4)} />;
          })}

          {/* dust motes drifting through the warm haze */}
          {Array.from({length: 36}).map((_, i) => {
            const x = (rnd(i, 41) * W + frame * (0.2 + rnd(i, 43) * 0.35) + Math.sin(frame * 0.01 + i) * 26) % W;
            const y = (rnd(i, 45) * H - frame * (0.1 + rnd(i, 47) * 0.22) + H * 6) % H;
            const tw = 0.25 + 0.75 * Math.abs(Math.sin(frame * 0.02 + i * 3));
            return <circle key={i} cx={x} cy={y} r={1 + rnd(i, 49) * 1.8} fill="#FFD9A0" opacity={0.2 * tw} />;
          })}
        </g>

        {/* global warm swell with the music + vignette */}
        <rect width={W} height={H} fill="#FF9A2E" opacity={0.025 + light * 0.05} style={{mixBlendMode: 'soft-light'}} />
        <rect width={W} height={H} fill="url(#vig)" />
      </svg>

      {/* film grain */}
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundPosition: `${(frame * 37) % 1024}px ${(frame * 53) % 1024}px`, opacity: 0.07, mixBlendMode: 'overlay'}} />

      {/* title card */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: titleOp, transform: `translateY(${titleRise}px)`}}>
        <div style={{textAlign: 'center', fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#F6E7C4', textShadow: '0 4px 40px rgba(0,0,0,0.8)'}}>
          <div style={{fontSize: 30, letterSpacing: 14, textTransform: 'uppercase', opacity: 0.85}}>tabletop ambience</div>
          <div style={{fontSize: 130, fontWeight: 600, marginTop: 8}}>Rainy Tavern Night</div>
          <div style={{fontSize: 34, opacity: 0.8, marginTop: 6}}>cozy fantasy music for your game</div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut)}} />
    </AbsoluteFill>
  );
};
