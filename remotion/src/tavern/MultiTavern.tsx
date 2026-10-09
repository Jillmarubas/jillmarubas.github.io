import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import envelope from '../../public/tavern/envelope.json';
import '../promo/fonts';

/*
 * "Rainy Tavern Night", four camera angles of one tavern (the user's Nano Banana stills),
 * animated entirely in Remotion and cross-faded in time with the track.
 * Each scene gets effects placed for its own composition: warped flame, flickering hearth/candle light,
 * rain on the glass, rising steam, embers, dust, a breathing cat, a slow push-in.
 * Coordinates are in source-image pixels (1376x768); the SVG viewBox maps them to 1920x1080.
 * Light follows the music's loudness envelope and note onsets (scripts/tavern_envelope.py).
 */
export const MULTI_FPS = 30;
export const MULTI_FULL = envelope.frames;
export const MULTI_TEST = 45 * MULTI_FPS;
const VW = 1376;
const VH = 768;
const XF = 60; // cross-fade length in frames

type Pt = {x: number; y: number};
type Scene = {
  src: string;
  fire?: Pt & {rx: number; ry: number; warp: number};
  candles: (Pt & {s: number})[];
  window?: string; // polygon
  rainScale?: number;
  steam?: (Pt & {s: number})[];
  cat?: Pt & {rx: number; ry: number};
  push: {x: number; y: number}; // where the slow push-in heads
};

const WIDE: Scene = {
  src: 'tavern/a_wide.jpg',
  fire: {x: 280, y: 540, rx: 62, ry: 58, warp: 10},
  candles: [
    {x: 138, y: 352, s: 0.5}, {x: 167, y: 346, s: 0.5}, {x: 193, y: 354, s: 0.5},
    {x: 425, y: 343, s: 0.5}, {x: 445, y: 338, s: 0.5}, {x: 462, y: 344, s: 0.5},
    {x: 706, y: 545, s: 0.9}, {x: 746, y: 532, s: 0.9},
    {x: 681, y: 440, s: 0.45}, {x: 711, y: 438, s: 0.45}, {x: 947, y: 462, s: 0.6},
  ],
  window: '912,178 1302,150 1306,484 912,492',
  rainScale: 0.8,
  steam: [{x: 1006, y: 548, s: 0.9}, {x: 578, y: 488, s: 0.8}],
  push: {x: 560, y: 450},
};
const FIRE: Scene = {
  src: 'tavern/a_fire.jpg',
  fire: {x: 700, y: 440, rx: 118, ry: 108, warp: 16},
  candles: [
    {x: 318, y: 92, s: 0.7}, {x: 380, y: 82, s: 0.8}, {x: 436, y: 92, s: 0.7},
    {x: 993, y: 92, s: 0.7}, {x: 1048, y: 82, s: 0.8}, {x: 1096, y: 92, s: 0.7},
  ],
  cat: {x: 440, y: 662, rx: 92, ry: 38},
  push: {x: 690, y: 430},
};
const TABLE: Scene = {
  src: 'tavern/a_table.jpg',
  fire: {x: 265, y: 300, rx: 108, ry: 92, warp: 12},
  candles: [
    {x: 1152, y: 330, s: 1.1}, {x: 1228, y: 365, s: 1.1},
    {x: 55, y: 178, s: 0.5}, {x: 105, y: 172, s: 0.5}, {x: 135, y: 182, s: 0.5},
    {x: 470, y: 178, s: 0.5}, {x: 500, y: 172, s: 0.5}, {x: 520, y: 182, s: 0.5},
    {x: 840, y: 205, s: 0.6}, {x: 1237, y: 230, s: 0.7},
  ],
  window: '1160,0 1376,0 1376,282 1160,282',
  rainScale: 0.6,
  steam: [{x: 688, y: 412, s: 1.3}],
  push: {x: 760, y: 440},
};
const WINDOW: Scene = {
  src: 'tavern/a_window.jpg',
  candles: [{x: 1063, y: 478, s: 1.4}, {x: 830, y: 462, s: 0.7}],
  window: '92,0 1200,0 1200,632 92,640',
  rainScale: 1.7,
  push: {x: 700, y: 330},
};

// scene order across the track (fractions of the total length)
const ORDER: Scene[] = [WIDE, FIRE, TABLE, WINDOW, WIDE];
const CUTS = [0, 0.2, 0.4, 0.6, 0.8, 1];

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

const SceneView: React.FC<{sc: Scene; id: string; frame: number; local: number; len: number; light: number; t: number}> = ({sc, id, frame, local, len, light, t}) => {
  const img = staticFile(sc.src);
  const p = Math.min(1, Math.max(0, local / len));
  // slow push-in toward the scene's point of interest
  const s = 1.0 + 0.07 * Easing.inOut(Easing.sin)(p);
  const tx = (VW / 2 - sc.push.x) * (s - 1) * 0.6;
  const ty = (VH / 2 - sc.push.y) * (s - 1) * 0.6;
  const fireF = 0.82 + 0.18 * flick(frame, 0.55, 1.31, 2.7) + light * 0.18;
  const seed = Math.floor(frame / 2) % 97;
  const breath = Math.sin(frame / 36) * 1.4;
  const rs = sc.rainScale ?? 1;
  const lp = (frame % 1140) / 30;
  const lightning = Math.max(0, 1 - Math.abs(lp - 21) / 0.35) * 0.5 + Math.max(0, 1 - Math.abs(lp - 21.5) / 0.2) * 0.3;

  return (
    <g transform={`translate(${VW / 2 + tx} ${VH / 2 + ty}) scale(${s}) translate(${-VW / 2} ${-VH / 2})`}>
      <defs>
        {sc.fire && (
          <>
            <filter id={`warp-${id}`} x="-20%" y="-30%" width="140%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency={`0.025 ${0.06 + Math.sin(frame / 9) * 0.008}`} numOctaves={2} seed={seed} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale={sc.fire.warp * (1 + light * 0.5)} xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <clipPath id={`fc-${id}`}><ellipse cx={sc.fire.x} cy={sc.fire.y} rx={sc.fire.rx} ry={sc.fire.ry} /></clipPath>
            <mask id={`fm-${id}`}><ellipse cx={sc.fire.x} cy={sc.fire.y} rx={sc.fire.rx * 0.9} ry={sc.fire.ry * 0.9} fill="#fff" filter="url(#soft)" /></mask>
          </>
        )}
        {sc.window && <clipPath id={`wc-${id}`}><polygon points={sc.window} /></clipPath>}
        {sc.cat && (
          <>
            <clipPath id={`cc-${id}`}><ellipse cx={sc.cat.x} cy={sc.cat.y} rx={sc.cat.rx} ry={sc.cat.ry} /></clipPath>
            <mask id={`cm-${id}`}><ellipse cx={sc.cat.x} cy={sc.cat.y} rx={sc.cat.rx * 0.9} ry={sc.cat.ry * 0.85} fill="#fff" filter="url(#soft)" /></mask>
          </>
        )}
      </defs>

      <image href={img} x={0} y={0} width={VW} height={VH} preserveAspectRatio="xMidYMid slice" />

      {sc.fire && (
        <g mask={`url(#fm-${id})`} style={{filter: `brightness(${0.9 + fireF * 0.32}) saturate(1.12)`}}>
          <g filter={`url(#warp-${id})`}>
            <image href={img} x={0} y={0} width={VW} height={VH} preserveAspectRatio="xMidYMid slice" clipPath={`url(#fc-${id})`} />
          </g>
        </g>
      )}

      {sc.cat && (
        <g mask={`url(#cm-${id})`}>
          <g transform={`translate(0 ${breath * 0.4}) translate(${sc.cat.x} ${sc.cat.y + sc.cat.ry}) scale(1 ${1 + breath * 0.008}) translate(${-sc.cat.x} ${-(sc.cat.y + sc.cat.ry)})`}>
            <image href={img} x={0} y={0} width={VW} height={VH} preserveAspectRatio="xMidYMid slice" clipPath={`url(#cc-${id})`} />
          </g>
        </g>
      )}

      {/* hearth + candle light, flickering and following the music */}
      <g style={{mixBlendMode: 'screen'}}>
        {sc.fire && (
          <>
            <ellipse cx={sc.fire.x} cy={sc.fire.y - sc.fire.ry * 0.2} rx={sc.fire.rx * 4.2} ry={sc.fire.ry * 3.6} fill="url(#warm)" opacity={0.16 * fireF + light * 0.2} />
            <ellipse cx={sc.fire.x} cy={sc.fire.y + sc.fire.ry * 0.8} rx={sc.fire.rx * 2.4} ry={sc.fire.ry * 0.7} fill="url(#warm)" opacity={0.14 * fireF + light * 0.1} />
          </>
        )}
        {sc.candles.map((c, i) => {
          const f = 0.8 + 0.2 * flick(frame, 0.7 + i * 0.13, 1.9 + i * 0.07, 3.3) + light * 0.1;
          return <circle key={i} cx={c.x} cy={c.y - 6 * c.s} r={46 * c.s} fill="url(#candle)" opacity={0.4 * f + light * 0.05} />;
        })}
      </g>

      {/* rain on the glass + faint lightning */}
      {sc.window && (
        <g clipPath={`url(#wc-${id})`}>
          <rect x={0} y={0} width={VW} height={VH} fill="#9CC3FF" opacity={lightning * 0.35} style={{mixBlendMode: 'screen'}} />
          <g filter="url(#glass)" stroke="#D2E6FF" strokeLinecap="round">
            {Array.from({length: Math.round(90 * Math.min(1.4, rs))}).map((_, i) => {
              const x = rnd(i, 3) * VW;
              const len = (22 + rnd(i, 5) * 40) * rs;
              const sp = 12 * rs * (0.75 + rnd(i, 7) * 0.6);
              const y = ((rnd(i, 9) * VH + frame * sp) % (VH + len)) - len;
              return <line key={i} x1={x} y1={y} x2={x - len * 0.1} y2={y + len} strokeWidth={(0.8 + rnd(i, 11) * 1.2) * Math.sqrt(rs)} opacity={0.1 + rnd(i, 13) * 0.24} />;
            })}
          </g>
          {Array.from({length: Math.round(14 * rs)}).map((_, i) => {
            const x = rnd(i, 61) * VW;
            const speed = (0.4 + rnd(i, 65) * 0.9) * rs;
            const y = (rnd(i, 63) * VH + frame * speed) % VH;
            const wob = Math.sin(frame * 0.05 + i * 2) * 1.2;
            return (
              <g key={i}>
                <ellipse cx={x + wob} cy={y} rx={2 * rs} ry={(4 + rnd(i, 67) * 4) * rs} fill="#EAF3FF" opacity={0.32} />
                <line x1={x + wob} y1={y - 50 * speed} x2={x + wob} y2={y} stroke="#EAF3FF" strokeWidth={0.9 * rs} opacity={0.1} />
              </g>
            );
          })}
        </g>
      )}

      {/* steam */}
      {sc.steam && (
        <g filter="url(#steamBlur)">
          {sc.steam.flatMap((m, j) =>
            Array.from({length: 6}).map((_, i) => {
              const life = 170;
              const age = (frame + i * (life / 6) + j * 40) % life;
              const q = age / life;
              const x = m.x + Math.sin(age * 0.045 + i * 1.7 + j) * (8 + q * 22) * m.s;
              const y = m.y - q * 130 * m.s;
              return <ellipse key={`${j}-${i}`} cx={x} cy={y} rx={(9 + q * 24) * m.s} ry={(13 + q * 30) * m.s} fill="#FFEFD6" opacity={0.17 * Math.sin(q * Math.PI)} />;
            }),
          )}
        </g>
      )}

      {/* embers */}
      {sc.fire &&
        Array.from({length: 18}).map((_, i) => {
          const life = 110 + rnd(i, 21) * 110;
          const age = (frame + rnd(i, 23) * life) % life;
          const q = age / life;
          const burst = Math.max(0, 1 - sinceOnset(t) / 1.0);
          const k = sc.fire!.rx / 100;
          const x = sc.fire!.x + (rnd(i, 25) - 0.5) * 120 * k + Math.sin(age * 0.09 + i) * 22 * q * k;
          const y = sc.fire!.y - 20 * k - q * (220 + rnd(i, 29) * 180) * k;
          return <circle key={i} cx={x} cy={y} r={(0.9 + rnd(i, 31) * 1.6 * (0.8 + burst * 0.5)) * Math.max(0.7, k)} fill={i % 3 ? '#FFD25A' : '#FF9A2E'} opacity={Math.sin(q * Math.PI) * (0.5 + burst * 0.4)} />;
        })}

      {/* dust */}
      {Array.from({length: 30}).map((_, i) => {
        const x = (rnd(i, 41) * VW + frame * (0.15 + rnd(i, 43) * 0.25) + Math.sin(frame * 0.01 + i) * 18) % VW;
        const y = (rnd(i, 45) * VH - frame * (0.08 + rnd(i, 47) * 0.16) + VH * 6) % VH;
        const tw = 0.25 + 0.75 * Math.abs(Math.sin(frame * 0.02 + i * 3));
        return <circle key={i} cx={x} cy={y} r={0.7 + rnd(i, 49) * 1.2} fill="#FFD9A0" opacity={0.18 * tw} />;
      })}
    </g>
  );
};

export const MultiTavern: React.FC<{frames?: number; sound?: boolean}> = ({frames = MULTI_TEST, sound = true}) => {
  const frame = useCurrentFrame();
  const t = frame / MULTI_FPS;
  const glow = Math.pow(envAt(frame), 1.4);
  const pulse = Math.max(0, 1 - sinceOnset(t) / 0.5) * 0.3;
  const light = Math.min(1, glow * 0.8 + pulse);
  const bounds = CUTS.map((c) => Math.round(c * frames));

  const titleOp = interpolate(frame, [30, 66, 190, 232], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleRise = interpolate(frame, [30, 74], [16, 0], {easing: Easing.bezier(0.22, 1, 0.36, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeIn = interpolate(frame, [0, 45], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [frames - 75, frames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#050403'}}>
      {sound && <Audio src={staticFile('tavern/music.mp3')} />}
      <svg width={1920} height={1080} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="soft"><feGaussianBlur stdDeviation="7" /></filter>
          <filter id="steamBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="glass"><feGaussianBlur stdDeviation="0.5" /></filter>
          <radialGradient id="warm"><stop offset="0" stopColor="#FFB45A" stopOpacity="0.9" /><stop offset="0.45" stopColor="#FF8A2A" stopOpacity="0.28" /><stop offset="1" stopColor="#FF7A1A" stopOpacity="0" /></radialGradient>
          <radialGradient id="candle"><stop offset="0" stopColor="#FFE2A0" stopOpacity="0.9" /><stop offset="0.35" stopColor="#FFB45A" stopOpacity="0.3" /><stop offset="1" stopColor="#FFB45A" stopOpacity="0" /></radialGradient>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.78"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
        </defs>

        {ORDER.map((sc, i) => {
          const a = bounds[i];
          const b = bounds[i + 1];
          const from = i === 0 ? a : a - XF / 2;
          const to = i === ORDER.length - 1 ? b : b + XF / 2;
          if (frame < from || frame >= to) return null;
          const fadeInOp = i === 0 ? 1 : interpolate(frame, [a - XF / 2, a + XF / 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <g key={i} opacity={fadeInOp}>
              <SceneView sc={sc} id={`s${i}`} frame={frame} local={frame - from} len={to - from} light={light} t={t} />
            </g>
          );
        })}

        <rect width={VW} height={VH} fill="#FF9A2E" opacity={0.02 + light * 0.045} style={{mixBlendMode: 'soft-light'}} />
        <rect width={VW} height={VH} fill="url(#vig)" />
      </svg>

      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundPosition: `${(frame * 37) % 1024}px ${(frame * 53) % 1024}px`, opacity: 0.07, mixBlendMode: 'overlay'}} />

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
