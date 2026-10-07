import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import envelope from '../../public/tavern/envelope.json';
import '../promo/fonts';

/*
 * "Rainy Tavern Night": an original flat-vector tavern interior drawn in SVG (16:9, 30 fps).
 * Audio-reactive: the fireplace and candle glow follow the loudness envelope of the track
 * (scripts/tavern_envelope.py), and small embers pop on detected note onsets.
 * Scene motion: rain on the window, lightning-free storm glow, flickering fire, candle flames,
 * steam over the mug, drifting dust motes, a cat that breathes.
 */
export const TAVERN_FPS = 30;
export const TAVERN_FULL = envelope.frames; // whole track
export const TAVERN_TEST = 45 * TAVERN_FPS; // 45 s test cut
const W = 1920;
const H = 1080;
const TAU = Math.PI * 2;

const P = {
  wall: '#3A2418',
  wall2: '#2C1A12',
  beam: '#1D100A',
  floor: '#24150E',
  floor2: '#2F1C12',
  stone: '#4A3A33',
  stone2: '#362A25',
  night: '#0F1B2B',
  night2: '#1A2D44',
  rain: '#9CC3E6',
  fire: '#FF9A2E',
  fire2: '#FFD25A',
  fire3: '#E8501F',
  warm: '#FFB45A',
  wood: '#6B4226',
  wood2: '#4F2F1B',
  cream: '#F6E7C4',
  cat: '#0B0B0F',
};

// deterministic pseudo-random so every frame render agrees
const rnd = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const envAt = (frame: number) => {
  const e = envelope.env;
  const i = Math.min(e.length - 1, Math.max(0, Math.floor(frame)));
  return e[i];
};

/** seconds since the last detected onset (capped) */
const sinceOnset = (t: number) => {
  let last = -10;
  for (const o of envelope.onsets) {
    if (o <= t) last = o;
    else break;
  }
  return t - last;
};

/* ----------------------------------------------------------------- pieces */
const Rain: React.FC<{frame: number; x0: number; y0: number; w: number; h: number; count: number; speed: number; opacity: number}> = ({frame, x0, y0, w, h, count, speed, opacity}) => (
  <g opacity={opacity} stroke={P.rain} strokeLinecap="round">
    {Array.from({length: count}).map((_, i) => {
      const x = x0 + rnd(i, 3) * w;
      const len = 26 + rnd(i, 5) * 40;
      const sp = speed * (0.75 + rnd(i, 7) * 0.6);
      const y = y0 + ((rnd(i, 9) * h + frame * sp) % (h + len)) - len;
      return <line key={i} x1={x} y1={y} x2={x - len * 0.18} y2={y + len} strokeWidth={1.5 + rnd(i, 11) * 1.8} opacity={0.35 + rnd(i, 13) * 0.55} />;
    })}
  </g>
);

const Candle: React.FC<{x: number; y: number; frame: number; seed: number; glow: number}> = ({x, y, frame, seed, glow}) => {
  const fl = Math.sin(frame * 0.31 + seed * 9) * 0.5 + Math.sin(frame * 0.77 + seed * 4) * 0.5;
  const h = 34 + fl * 5 + glow * 8;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={-52} r={90 + glow * 40} fill="url(#candleGlow)" opacity={0.55 + glow * 0.35} />
      <rect x={-14} y={-46} width={28} height={64} rx={4} fill={P.cream} />
      <rect x={-14} y={-46} width={10} height={64} rx={4} fill="#FFFFFF" opacity={0.18} />
      <path d={`M0 ${-48 - h} C 14 ${-48 - h * 0.45}, 12 -52, 0 -48 C -12 -52, -14 ${-48 - h * 0.45}, 0 ${-48 - h} Z`} fill={P.fire2} transform={`rotate(${fl * 4} 0 -48)`} />
      <path d={`M0 ${-48 - h * 0.62} C 6 ${-48 - h * 0.3}, 5 -51, 0 -48 C -5 -51, -6 ${-48 - h * 0.3}, 0 ${-48 - h * 0.62} Z`} fill="#FFF6D0" transform={`rotate(${fl * 4} 0 -48)`} />
    </g>
  );
};

const Fire: React.FC<{frame: number; x: number; y: number; glow: number}> = ({frame, x, y, glow}) => {
  const tongues = [
    {dx: -60, w: 70, h: 150, s: 1},
    {dx: -20, w: 80, h: 200, s: 2},
    {dx: 25, w: 75, h: 175, s: 3},
    {dx: 62, w: 60, h: 130, s: 4},
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(1.3)`}>
      <ellipse cx={0} cy={-80} rx={330 + glow * 60} ry={240 + glow * 40} fill="url(#fireGlow)" opacity={0.7 + glow * 0.25} />
      {/* logs */}
      <rect x={-120} y={-18} width={240} height={34} rx={17} fill={P.wood2} transform="rotate(-6)" />
      <rect x={-110} y={-30} width={230} height={34} rx={17} fill={P.wood} transform="rotate(7)" />
      {tongues.map((t, i) => {
        const fl = Math.sin(frame * (0.21 + i * 0.07) + t.s * 2.1) * 0.5 + Math.sin(frame * 0.53 + t.s * 5.3) * 0.5;
        const hh = t.h * (1 + fl * 0.14 + glow * 0.18);
        const sway = fl * 10;
        const path = (k: number, color: string) => (
          <path
            key={color}
            d={`M ${t.dx} 0 C ${t.dx - t.w * 0.7 * k} ${-hh * 0.35 * k}, ${t.dx - t.w * 0.25 * k + sway} ${-hh * 0.75 * k}, ${t.dx + sway * 1.4} ${-hh * k} C ${t.dx + t.w * 0.25 * k + sway} ${-hh * 0.7 * k}, ${t.dx + t.w * 0.7 * k} ${-hh * 0.3 * k}, ${t.dx} 0 Z`}
            fill={color}
          />
        );
        return (
          <g key={i}>
            {path(1, P.fire3)}
            {path(0.72, P.fire)}
            {path(0.42, P.fire2)}
          </g>
        );
      })}
    </g>
  );
};

const Embers: React.FC<{frame: number; x: number; y: number; t: number}> = ({frame, x, y, t}) => {
  const since = sinceOnset(t);
  const burst = Math.max(0, 1 - since / 1.1); // fades over ~1 s after a note onset
  return (
    <g>
      {Array.from({length: 26}).map((_, i) => {
        const life = 150 + rnd(i, 21) * 120;
        const age = (frame + rnd(i, 23) * life) % life;
        const p = age / life;
        const px = x + (rnd(i, 25) - 0.5) * 150 + Math.sin(age * 0.07 + i) * 34 * p + (rnd(i, 27) - 0.5) * 120 * p;
        const py = y - p * (320 + rnd(i, 29) * 260);
        const op = Math.sin(p * Math.PI) * (0.55 + burst * 0.45);
        return <circle key={i} cx={px} cy={py} r={2 + rnd(i, 31) * 3.2 * (0.7 + burst * 0.6)} fill={i % 3 ? P.fire2 : P.fire} opacity={op} />;
      })}
    </g>
  );
};

const Steam: React.FC<{frame: number; x: number; y: number}> = ({frame, x, y}) => (
  <g fill="none" stroke="#FFF1D8" strokeLinecap="round">
    {[0, 1, 2].map((i) => {
      const ph = frame * 0.035 + i * 2.1;
      const rise = ((frame * 0.5 + i * 38) % 120) / 120;
      const dx = Math.sin(ph) * 10;
      return <path key={i} d={`M ${x + i * 20 - 20 + dx} ${y - rise * 100} q 10 -18 0 -36 q -10 -18 0 -36`} strokeWidth={5} opacity={0.22 * Math.sin(rise * Math.PI)} />;
    })}
  </g>
);

const Dust: React.FC<{frame: number}> = ({frame}) => (
  <g>
    {Array.from({length: 34}).map((_, i) => {
      const x = (rnd(i, 41) * W + frame * (0.18 + rnd(i, 43) * 0.3) + Math.sin(frame * 0.01 + i) * 24) % W;
      const y = (rnd(i, 45) * H - frame * (0.1 + rnd(i, 47) * 0.2) + H * 4) % H;
      const tw = 0.25 + 0.75 * Math.abs(Math.sin(frame * 0.02 + i * 3));
      return <circle key={i} cx={x} cy={y} r={1.3 + rnd(i, 49) * 2} fill={P.fire2} opacity={0.22 * tw} />;
    })}
  </g>
);

/* ------------------------------------------------------------------ scene */
export const RainyTavern: React.FC<{frames?: number; sound?: boolean}> = ({frames = TAVERN_TEST, sound = true}) => {
  const frame = useCurrentFrame();
  const t = frame / TAVERN_FPS;
  const env = envAt(frame);
  const glow = Math.pow(env, 1.4); // 0..1, follows the music's loudness
  const pulse = Math.max(0, 1 - sinceOnset(t) / 0.5) * 0.35; // brief brighten on note onsets
  const light = Math.min(1, glow * 0.8 + pulse);

  // slow camera drift ("breathing"): a few px, never a zoom cut
  const camX = Math.sin(frame / 260) * 9;
  const camY = Math.cos(frame / 310) * 5;
  const camS = 1.035 + Math.sin(frame / 400) * 0.006;

  // title card: in at 1 s, out at 7 s; end fade handled below
  const titleOp = interpolate(frame, [30, 62, 190, 230], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleRise = interpolate(frame, [30, 70], [18, 0], {easing: Easing.bezier(0.22, 1, 0.36, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeIn = interpolate(frame, [0, 36], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [frames - 60, frames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const catBreath = Math.sin(frame / 38) * 3;
  const stormGlow = 0.55 + Math.sin(frame / 90) * 0.1;

  return (
    <AbsoluteFill style={{background: P.wall2}}>
      {sound && <Audio src={staticFile('tavern/music.mp3')} />}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="fireGlow">
            <stop offset="0" stopColor={P.fire} stopOpacity="0.55" />
            <stop offset="0.5" stopColor={P.fire} stopOpacity="0.16" />
            <stop offset="1" stopColor={P.fire} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="candleGlow">
            <stop offset="0" stopColor={P.warm} stopOpacity="0.55" />
            <stop offset="1" stopColor={P.warm} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.7" />
          </radialGradient>
          <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.night} />
            <stop offset="1" stopColor={P.night2} />
          </linearGradient>
          <clipPath id="win">
            <rect x={1120} y={160} width={520} height={470} rx={6} />
          </clipPath>
        </defs>

        <g transform={`translate(${W / 2 + camX} ${H / 2 + camY}) scale(${camS}) translate(${-W / 2} ${-H / 2})`}>
          {/* wall */}
          <rect x={-40} y={-40} width={W + 80} height={H * 0.72} fill={P.wall} />
          {Array.from({length: 11}).map((_, i) => (
            <rect key={i} x={-40 + i * 190} y={-40} width={4} height={H * 0.72} fill={P.wall2} opacity={0.5} />
          ))}
          {/* ceiling beam */}
          <rect x={-40} y={-30} width={W + 80} height={110} fill={P.beam} />
          <rect x={-40} y={70} width={W + 80} height={10} fill="#000" opacity={0.35} />
          {/* floor */}
          <rect x={-40} y={H * 0.72} width={W + 80} height={H * 0.3} fill={P.floor} />
          {Array.from({length: 9}).map((_, i) => (
            <rect key={i} x={-40} y={H * 0.72 + i * 40} width={W + 80} height={3} fill={P.floor2} opacity={0.7} />
          ))}

          {/* window with storm */}
          <rect x={1100} y={140} width={560} height={510} rx={10} fill="#1A0F09" />
          <g clipPath="url(#win)">
            <rect x={1120} y={160} width={520} height={470} fill="url(#nightSky)" />
            {/* far clouds */}
            <g opacity={0.5} fill="#2B4666">
              <ellipse cx={1250 + Math.sin(frame / 220) * 40} cy={250} rx={180} ry={46} />
              <ellipse cx={1500 - Math.sin(frame / 260) * 36} cy={330} rx={210} ry={52} />
            </g>
            {/* distant cottage light */}
            <rect x={1180} y={470} width={90} height={60} fill="#13202F" />
            <rect x={1205} y={485} width={20} height={20} fill={P.warm} opacity={0.75 + Math.sin(frame / 7) * 0.08} />
            <Rain frame={frame} x0={1120} y0={160} w={520} h={470} count={90} speed={14} opacity={0.7} />
            {/* droplets sliding down the glass */}
            {Array.from({length: 10}).map((_, i) => {
              const x = 1150 + rnd(i, 61) * 460;
              const y = 160 + ((rnd(i, 63) * 470 + frame * (0.6 + rnd(i, 65) * 0.8)) % 470);
              return <ellipse key={i} cx={x} cy={y} rx={3} ry={6 + rnd(i, 67) * 4} fill="#CFE6FA" opacity={0.5} />;
            })}
            <rect x={1120} y={160} width={520} height={470} fill={P.rain} opacity={0.04 * stormGlow} />
          </g>
          {/* window frame + mullions */}
          <rect x={1100} y={140} width={560} height={510} rx={10} fill="none" stroke="#120A06" strokeWidth={22} />
          <rect x={1372} y={160} width={16} height={470} fill="#120A06" />
          <rect x={1120} y={388} width={520} height={16} fill="#120A06" />
          <rect x={1080} y={650} width={600} height={26} rx={6} fill={P.wood2} />

          {/* fireplace */}
          <g>
            <rect x={230} y={250} width={620} height={560} fill={P.stone} />
            {Array.from({length: 6}).map((_, r) => (
              <g key={r}>
                {Array.from({length: 5}).map((__, c) => (
                  <rect key={c} x={236 + c * 120 + (r % 2) * 60} y={256 + r * 90} width={110} height={80} rx={8} fill={r % 2 ? P.stone2 : P.stone} opacity={0.85} />
                ))}
              </g>
            ))}
            <rect x={200} y={228} width={680} height={42} rx={6} fill={P.wood2} />
            <rect x={330} y={420} width={420} height={390} rx={4} fill="#0A0503" />
            <path d={`M 330 810 L 330 440 Q 540 340 750 440 L 750 810 Z`} fill="#0A0503" />
          </g>
          <Fire frame={frame} x={540} y={800} glow={light} />
          <Embers frame={frame} x={540} y={760} t={t} />

          {/* shelf with mugs on the wall */}
          <rect x={900} y={330} width={160} height={10} fill={P.wood2} />
          <rect x={920} y={290} width={34} height={40} rx={5} fill="#7A4A2A" />
          <rect x={970} y={296} width={30} height={34} rx={5} fill="#A8643A" />
          <rect x={1015} y={282} width={26} height={48} rx={5} fill="#5C3A22" />

          {/* table + candles + mug */}
          <ellipse cx={1180} cy={950} rx={560} ry={60} fill="#000" opacity={0.35} />
          <rect x={650} y={815} width={1080} height={46} rx={10} fill={P.wood} />
          <rect x={650} y={858} width={1080} height={10} fill="#000" opacity={0.25} />
          <rect x={700} y={868} width={34} height={150} fill={P.wood2} />
          <rect x={1646} y={868} width={34} height={150} fill={P.wood2} />
          {/* mug */}
          <g>
            <path d="M 1010 735 h 98 v 62 a 36 36 0 0 1 -36 36 h -26 a 36 36 0 0 1 -36 -36 z" fill="#9C5A33" />
            <path d="M 1108 750 q 38 6 24 40 q -8 14 -26 12" fill="none" stroke="#9C5A33" strokeWidth={12} strokeLinecap="round" />
            <rect x={1010} y={735} width={98} height={10} fill="#C98250" opacity={0.7} />
          </g>
          <Steam frame={frame} x={1060} y={730} />
          <Candle x={1320} y={815} frame={frame} seed={1} glow={light} />
          <Candle x={1450} y={815} frame={frame} seed={2} glow={light} />
          {/* bread + book */}
          <ellipse cx={850} cy={806} rx={62} ry={26} fill="#C9954F" />
          <path d="M 800 803 q 50 -16 100 0" stroke="#A8743A" strokeWidth={4} fill="none" />
          <rect x={1540} y={782} width={120} height={34} rx={4} fill="#3F5F7A" />
          <rect x={1550} y={776} width={104} height={12} fill={P.cream} />

          {/* hearth light on the floor */}
          <ellipse cx={540} cy={900} rx={380} ry={80} fill={P.fire} opacity={0.10 + light * 0.14} />
          {/* cat curled by the hearth */}
          <g transform={`translate(430 ${905 + catBreath * 0.2})`}>
            <ellipse cx={0} cy={0} rx={96} ry={42 + catBreath} fill={P.cat} />
            <circle cx={-82} cy={-4} r={30} fill={P.cat} />
            <path d="M -102 -26 l 8 -22 l 16 14 z M -76 -30 l 14 -18 l 8 20 z" fill={P.cat} />
            <path d="M 96 4 q 56 28 -10 44" stroke={P.cat} strokeWidth={16} fill="none" strokeLinecap="round" />
            <path d="M -95 -4 q 6 5 12 0" stroke={P.fire2} strokeWidth={3} fill="none" opacity={0.7} />
            <ellipse cx={0} cy={-18} rx={90} ry={14} fill={P.fire} opacity={0.12 + light * 0.18} />
          </g>

          <Dust frame={frame} />
        </g>

        {/* overall warm light from the music + vignette */}
        <rect width={W} height={H} fill={P.fire} opacity={0.035 + light * 0.06} style={{mixBlendMode: 'soft-light'}} />
        <rect width={W} height={H} fill="url(#vig)" />
      </svg>

      {/* film grain */}
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundPosition: `${(frame * 37) % 1024}px ${(frame * 53) % 1024}px`, opacity: 0.06, mixBlendMode: 'overlay'}} />

      {/* title card */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: titleOp, transform: `translateY(${titleRise}px)`}}>
        <div style={{textAlign: 'center', fontFamily: "'Cormorant Garamond', Georgia, serif", color: P.cream, textShadow: '0 4px 30px rgba(0,0,0,0.65)'}}>
          <div style={{fontSize: 30, letterSpacing: 14, textTransform: 'uppercase', opacity: 0.8}}>tabletop ambience</div>
          <div style={{fontSize: 130, fontWeight: 600, marginTop: 8}}>Rainy Tavern Night</div>
          <div style={{fontSize: 34, opacity: 0.75, marginTop: 6}}>cozy fantasy music for your game</div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut)}} />
    </AbsoluteFill>
  );
};
