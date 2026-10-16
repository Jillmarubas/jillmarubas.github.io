// The building blocks for the 2D animated film: a camera, flat illustrations (drawn in SVG around 0,0 at about
// 200 units across), and infographics that build up in time with the narration. Saturated palette from akit.
//
// Scene pattern:
//   export const MyScene: React.FC<AnimProps> = ({f, t0}) => {
//     const w = (abs: number) => at(t0, abs);           // frame of a spoken word, from timing.json
//     return (
//       <Bg c={P.navy}>
//         <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1], [t0 + 4, 1200, 500, 1.4]]}>   // world-space camera moves
//           <svg width={1920} height={1080}> <DataCentre x={900} y={600} s={2} f={f} /> </svg>
//         </Cam>
//         <Counter ... /> <Caption ... />                      // screen-space text on top
//       </Bg>
//     );
//   };
import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {AF, P, Note, Tag, ease, lerp, pop} from './akit';
import {settle} from '../kit';

/* ================================================================== stage and camera */
/* A living background (review note: "make the background more interesting"): the base colour, slow drifting glows
 * in its own hues, one faint themed pattern and a vignette. The pattern is picked from the colours so neighbouring
 * scenes differ: circuit traces with running pulses or a perspective data floor on dark grounds, contour lines or a dot
 * grid on light ones. Pass `pattern` to choose, or `pattern="none"` for a plain ground. */
type Pattern = 'circuit' | 'floor' | 'topo' | 'dots' | 'none';
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const luma = (hex: string) => {
  if (!hex.startsWith('#') || hex.length < 7) return 0.3;
  const n = parseInt(hex.slice(1, 7), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};
const CIRCUIT = (() => {
  const traces: [number, number][][] = [];
  for (let i = 0; i < 34; i++) {
    let x = Math.round(random(`cx${i}`) * 48) * 40, y = Math.round(random(`cy${i}`) * 27) * 40;
    const pts: [number, number][] = [[x, y]];
    for (let j = 0; j < 4; j++) {
      if (j % 2 === 0) x += (random(`dx${i}${j}`) > 0.5 ? 1 : -1) * (80 + Math.round(random(`lx${i}${j}`) * 6) * 40);
      else y += (random(`dy${i}${j}`) > 0.5 ? 1 : -1) * (40 + Math.round(random(`ly${i}${j}`) * 4) * 40);
      pts.push([x, y]);
    }
    traces.push(pts);
  }
  return traces;
})();
const along = (pts: [number, number][], u: number): [number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = u * seg.reduce((a, b) => a + b, 0);
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) return [lerp(pts[i][0], pts[i + 1][0], d / seg[i]), lerp(pts[i][1], pts[i + 1][1], d / seg[i])];
    d -= seg[i];
  }
  return pts[pts.length - 1];
};
const BgPattern: React.FC<{kind: Pattern; f: number; ink: string; glow: string}> = ({kind, f, ink, glow}) => {
  if (kind === 'circuit')
    return (
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g stroke={ink} strokeWidth={2.5} fill="none" opacity={0.3}>
          {CIRCUIT.map((t, i) => (
            <path key={i} d={'M' + t.map((p) => p.join(',')).join(' L')} />
          ))}
        </g>
        <g fill={ink} opacity={0.45}>
          {CIRCUIT.map((t, i) => (
            <circle key={i} cx={t[t.length - 1][0]} cy={t[t.length - 1][1]} r={5} />
          ))}
        </g>
        {CIRCUIT.filter((_, i) => i % 2 === 0).map((t, i) => {
          const [x, y] = along(t, ((f / 140 + i * 0.37) % 1 + 1) % 1);
          return <circle key={i} cx={x} cy={y} r={6} fill={glow} opacity={0.9} style={{filter: `drop-shadow(0 0 10px ${glow})`}} />;
        })}
      </svg>
    );
  if (kind === 'floor') {
    const hz = 560; // horizon
    return (
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="bgfloorfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={ink} stopOpacity={0} />
            <stop offset="1" stopColor={ink} stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <g stroke="url(#bgfloorfade)" strokeWidth={2}>
          {Array.from({length: 25}, (_, i) => (
            <line key={i} x1={960 + (i - 12) * 30} y1={hz} x2={960 + (i - 12) * 260} y2={1080} />
          ))}
          {Array.from({length: 12}, (_, i) => {
            const k = ((i + (f / 40) % 1) / 12) ** 2.2; // rows move toward the viewer
            const y = hz + (1080 - hz) * k;
            return <line key={i} x1={0} y1={y} x2={1920} y2={y} />;
          })}
        </g>
        <rect x={0} y={hz - 3} width={1920} height={6} fill={glow} opacity={0.35} style={{filter: `drop-shadow(0 0 14px ${glow})`}} />
      </svg>
    );
  }
  if (kind === 'topo')
    return (
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}} opacity={0.28}>
        <g fill="none" stroke={ink} strokeWidth={2}>
          {Array.from({length: 9}, (_, i) =>
            [0, 1].map((k) => {
              const cx = k ? 1500 : 380, cy = k ? 260 : 820, r = 60 + i * 70;
              const wob = (a: number) => r * (1 + 0.12 * Math.sin(a * 3 + i + f / 90 + k) + 0.06 * Math.sin(a * 5 - i));
              const d = Array.from({length: 49}, (_, j) => {
                const a = (j / 48) * Math.PI * 2;
                return `${j ? 'L' : 'M'}${cx + Math.cos(a) * wob(a) * 1.4},${cy + Math.sin(a) * wob(a)}`;
              }).join(' ');
              return <path key={`${i}-${k}`} d={d + 'Z'} />;
            }),
          )}
        </g>
      </svg>
    );
  if (kind === 'dots')
    return (
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${ink} 2.2px, transparent 2.6px)`,
          backgroundSize: '44px 44px',
          backgroundPosition: `${(f * 0.3) % 44}px ${(f * 0.15) % 44}px`,
          opacity: 0.32,
        }}
      />
    );
  return null;
};
export const Bg: React.FC<{c?: string; c2?: string; angle?: number; pattern?: Pattern; children?: React.ReactNode}> = ({c = P.navy, c2, angle = 160, pattern, children}) => {
  const f = useCurrentFrame();
  const dark = luma(c) < 0.45;
  const h = hash(c + (c2 ?? '') + angle);
  const kind: Pattern = pattern ?? (dark ? (h % 2 ? 'circuit' : 'floor') : h % 2 ? 'topo' : 'dots');
  const ink = dark ? '#9FC2FF' : '#FFFFFF';
  const glow = dark ? P.sky : P.white;
  const lite = dark ? shade(c, 2.4) : shade(c, 1.18);
  const deep = shade(c, dark ? 0.5 : 0.82);
  const t = f / 24;
  const blob = (x: number, y: number, r: number, col: string, a: number) => `radial-gradient(circle ${r}px at ${x}px ${y}px, ${col} 0%, transparent 70%)`;
  return (
    <AbsoluteFill style={{background: c2 ? `linear-gradient(${angle}deg, ${c}, ${c2})` : `radial-gradient(ellipse 90% 85% at 50% 40%, ${c} 0%, ${shade(c, 0.62)} 100%)`, overflow: 'hidden'}}>
      {/* drifting glows in the scene's own colours */}
      <AbsoluteFill
        style={{
          backgroundImage: [
            blob(480 + Math.sin(t * 0.21 + h) * 260, 300 + Math.cos(t * 0.17) * 140, 620, lite, 0),
            blob(1500 + Math.cos(t * 0.15 + h) * 240, 760 + Math.sin(t * 0.19) * 120, 560, lite, 0),
            blob(1100 + Math.sin(t * 0.11) * 300, 120, 420, deep, 0),
          ].join(','),
          opacity: dark ? 0.85 : 0.6,
        }}
      />
      {kind !== 'none' && <BgPattern kind={kind} f={f} ink={ink} glow={glow} />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 60%, rgba(0,0,0,0.28) 100%)'}} />
      {children}
    </AbsoluteFill>
  );
};
/** Camera keyframes: [film time (s), centre x, centre y, zoom, turn (deg, optional), tilt (deg, optional)]. */
export type CamKey = [number, number, number, number, number?, number?];
export const camAt = (t: number, keys: CamKey[]) => {
  if (t <= keys[0][0]) return keys[0];
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const k = b[0] === a[0] ? 1 : settle(Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0]))));
  return [t, lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k), lerp(a[4] ?? 0, b[4] ?? 0, k), lerp(a[5] ?? 0, b[5] ?? 0, k)] as CamKey;
};
/** Moves through a 1920×1080 (or larger) world: the point (x, y) sits at screen centre at the given zoom. */
export const Cam: React.FC<{f: number; t0: number; keys: CamKey[]; children: React.ReactNode}> = ({f, t0, keys, children}) => {
  const [, x, y, z, ry = 0, rx = 0] = camAt(t0 + f / 24, keys);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1, transformOrigin: '0 0', transform: `translate(960px,540px) perspective(2400px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${z}) translate(${-x}px,${-y}px)`}}>
      <div style={{position: 'absolute', left: 0, top: 0}}>{children}</div>
    </div>
  );
};
/** A full-size SVG layer for world drawings (default 1920×1080; pass w/h for bigger worlds). */
export const World: React.FC<{w?: number; h?: number; children: React.ReactNode}> = ({w = 1920, h = 1080, children}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {children}
  </svg>
);
/** Places an illustration: translate + uniform scale + pop-in at `at` (frames) if given. */
export const Put: React.FC<{x: number; y: number; s?: number; f?: number; at?: number; rot?: number; o?: number; children: React.ReactNode}> = ({x, y, s = 1, f = 0, at: a, rot = 0, o = 1, children}) => {
  const k = a === undefined ? 1 : pop(f, a, 12);
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s * k})`} opacity={Math.min(1, k) * o}>
      {children}
    </g>
  );
};

/* ================================================================== colour helpers */
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
};

/* ================================================================== illustrations (centred on 0,0; ~200 units) */
type Ill = {f?: number; c?: string; c2?: string; on?: number};
const blink = (f: number, i: number, rate = 5) => (Math.floor(f / rate + i * 7.3) % 4 ? 1 : 0.25);

/** A data-centre hall: long low block, roof fans, a row of windows of blinking racks. */
export const DataCentre: React.FC<Ill & {busy?: number}> = ({f = 0, c = '#E8EEF9', busy = 0}) => (
  <g>
    <rect x={-150} y={-60} width={300} height={120} rx={8} fill={c} />
    <rect x={-150} y={-60} width={300} height={22} rx={8} fill={shade(c, 0.85)} />
    {[-110, -55, 0, 55, 110].map((x, i) => (
      <g key={x} transform={`translate(${x},-74)`}>
        <rect x={-20} y={-8} width={40} height={16} rx={4} fill="#9FB0D3" />
        <g transform={`rotate(${(f * 14 + i * 40) % 360})`}>
          <rect x={-14} y={-2.5} width={28} height={5} rx={2.5} fill="#5B6B8C" />
        </g>
      </g>
    ))}
    {Array.from({length: 8}, (_, i) => (
      <g key={i} transform={`translate(${-128 + i * 34},-24)`}>
        <rect width={24} height={70} rx={3} fill={P.ink} />
        {[0, 1, 2, 3, 4].map((r) => (
          <rect key={r} x={5} y={8 + r * 12} width={14} height={4} rx={2} fill={busy ? P.yellow : P.green} opacity={busy ? blink(f, i * 5 + r, 2) : blink(f, i * 5 + r, 9)} />
        ))}
      </g>
    ))}
  </g>
);
/** One server rack, front view. */
export const Rack: React.FC<Ill & {busy?: number}> = ({f = 0, busy = 0}) => (
  <g>
    <rect x={-45} y={-100} width={90} height={200} rx={8} fill={P.ink} />
    {Array.from({length: 12}, (_, r) => (
      <g key={r}>
        <rect x={-35} y={-90 + r * 15.5} width={70} height={11} rx={3} fill="#2B3150" />
        <circle cx={-26} cy={-84.5 + r * 15.5} r={2.6} fill={busy ? P.yellow : P.green} opacity={blink(f, r, busy ? 2 : 8)} />
        <circle cx={-18} cy={-84.5 + r * 15.5} r={2.6} fill={P.sky} opacity={blink(f, r + 3, busy ? 3 : 11)} />
      </g>
    ))}
  </g>
);
/** A chip: package with pins and a shiny die. */
export const Chip: React.FC<Ill> = ({c = P.green, f = 0, on = 0}) => (
  <g>
    {Array.from({length: 8}, (_, i) => (
      <g key={i}>
        <rect x={-62 + i * 16} y={-92} width={6} height={20} fill="#C9A23A" />
        <rect x={-62 + i * 16} y={72} width={6} height={20} fill="#C9A23A" />
        <rect x={-92} y={-62 + i * 16} width={20} height={6} fill="#C9A23A" />
        <rect x={72} y={-62 + i * 16} width={20} height={6} fill="#C9A23A" />
      </g>
    ))}
    <rect x={-75} y={-75} width={150} height={150} rx={10} fill={c} />
    <rect x={-45} y={-45} width={90} height={90} rx={6} fill="#C8D2E0" />
    <rect x={-45} y={-45} width={90} height={90} rx={6} fill={P.yellow} opacity={on * (0.5 + 0.5 * Math.sin(f / 3))} />
  </g>
);
export const Laptop: React.FC<Ill & {screen?: React.ReactNode}> = ({c = '#C9CDD6', screen}) => (
  <g>
    <rect x={-90} y={-70} width={180} height={115} rx={8} fill="#0C0C0F" />
    <rect x={-82} y={-62} width={164} height={99} rx={3} fill="#F4F6FB" />
    {screen}
    <path d="M-110 48 H110 L100 62 H-100 Z" fill={c} />
  </g>
);
export const Phone: React.FC<Ill> = ({c = P.ink}) => (
  <g>
    <rect x={-45} y={-90} width={90} height={180} rx={16} fill={c} />
    <rect x={-38} y={-78} width={76} height={150} rx={8} fill="#F4F6FB" />
  </g>
);
/** A gas or coal plant: hall and smokestacks; smoke drifts. */
export const PowerPlant: React.FC<Ill & {smoke?: number}> = ({f = 0, c = '#B8C3D9', smoke = 1}) => (
  <g>
    {[-40, 10].map((x, i) => (
      <g key={x}>
        <rect x={x} y={-130} width={22} height={110} fill={shade(c, 0.8)} />
        <rect x={x} y={-110} width={22} height={8} fill={P.red} />
        {Array.from({length: 4}, (_, j) => {
          const k = ((f / 40 + j / 4 + i * 0.3) % 1);
          return <circle key={j} cx={x + 11 + k * 40} cy={-140 - k * 80} r={10 + k * 22} fill="#D9DEE8" opacity={(1 - k) * 0.8 * smoke} />;
        })}
      </g>
    ))}
    <rect x={-100} y={-40} width={200} height={100} rx={6} fill={c} />
    {[-70, -30, 10, 50].map((x) => (
      <rect key={x} x={x} y={-15} width={24} height={30} rx={3} fill={P.yellow} opacity={0.8} />
    ))}
  </g>
);
/** A hyperbolic cooling tower with a plume of steam. */
export const CoolingTower: React.FC<Ill & {steam?: number}> = ({f = 0, c = '#D7DCE6', steam = 1}) => (
  <g>
    {Array.from({length: 5}, (_, j) => {
      const k = (f / 50 + j / 5) % 1;
      return <circle key={j} cx={k * 30} cy={-110 - k * 110} r={30 + k * 40} fill="#FFFFFF" opacity={(1 - k) * 0.85 * steam} />;
    })}
    <path d="M-70 100 C-45 30 -45 -40 -55 -100 L55 -100 C45 -40 45 30 70 100 Z" fill={c} />
    <path d="M-55 -100 L55 -100 L50 -88 L-50 -88 Z" fill={shade(c, 0.8)} />
  </g>
);
/** A nuclear plant: dome + cooling tower. */
export const NuclearPlant: React.FC<Ill> = ({f = 0}) => (
  <g>
    <g transform="translate(70,-10) scale(0.9)">
      <CoolingTower f={f} />
    </g>
    <path d="M-120 90 V10 A55 55 0 0 1 -10 10 V90 Z" fill="#E8EEF9" />
    <rect x={-150} y={60} width={300} height={36} rx={4} fill="#B8C3D9" />
    <path d="M-80 -2 l10 -18 l10 18 z" fill={P.yellow} />
  </g>
);
export const WindTurbine: React.FC<Ill> = ({f = 0}) => (
  <g>
    <path d="M-5 0 L5 0 L8 160 L-8 160 Z" fill="#F4F6FB" />
    <g transform={`rotate(${(f * 4) % 360})`}>
      {[0, 120, 240].map((a) => (
        <path key={a} d="M0 0 L-6 -10 L0 -110 L6 -10 Z" fill="#FFFFFF" transform={`rotate(${a})`} />
      ))}
      <circle r={9} fill="#D7DCE6" />
    </g>
  </g>
);
export const SolarPanel: React.FC<Ill> = () => (
  <g>
    <path d="M-100 20 L-70 -40 L100 -40 L70 20 Z" fill="#1E3A8A" />
    {[1, 2, 3].map((i) => (
      <line key={i} x1={-100 + i * 42.5 + 7.5 * i} y1={20} x2={-70 + i * 42.5 + 7.5 * i} y2={-40} stroke="#6EA8FF" strokeWidth={2} />
    ))}
    <line x1={-85} y1={-10} x2={85} y2={-10} stroke="#6EA8FF" strokeWidth={2} />
    <rect x={-4} y={20} width={8} height={40} fill="#9AA6BD" />
  </g>
);
/** A transmission pylon. */
export const Pylon: React.FC<Ill> = ({c = '#7C8AA8'}) => (
  <g stroke={c} strokeWidth={5} fill="none">
    <path d="M-30 120 L-8 -100 L8 -100 L30 120" />
    <path d="M-60 -60 H60 M-45 -20 H45" />
    <path d="M-25 80 L20 30 M25 80 L-20 30 M-18 30 L12 -20 M18 30 L-12 -20" />
  </g>
);
export const Bolt: React.FC<Ill> = ({c = P.yellow}) => <path d="M15 -80 L-50 10 H-5 L-20 80 L50 -15 H5 Z" fill={c} />;
export const Drop: React.FC<Ill> = ({c = P.water}) => <path d="M0 -80 C0 -80 -55 -5 -55 25 A55 55 0 0 0 55 25 C55 -5 0 -80 0 -80 Z" fill={c} />;
/** Water in a tank or a glass that fills to `level` (0–1). */
export const Glass: React.FC<Ill & {level?: number}> = ({level = 0.7, c = P.water}) => {
  const id = React.useId();
  return (
    <g>
      <path d="M-50 -80 L50 -80 L40 80 L-40 80 Z" fill="rgba(255,255,255,0.18)" stroke="#FFFFFF" strokeWidth={5} />
      <clipPath id={id}>
        <path d="M-50 -80 L50 -80 L40 80 L-40 80 Z" />
      </clipPath>
      <rect x={-60} y={80 - 160 * level} width={120} height={160 * level} fill={c} opacity={0.85} clipPath={`url(#${id})`} />
    </g>
  );
};
export const House: React.FC<Ill> = ({c = P.orange, c2 = '#FFF1DC', on = 0}) => (
  <g>
    <rect x={-50} y={-20} width={100} height={70} fill={c2} />
    <path d="M-62 -18 L0 -70 L62 -18 Z" fill={c} />
    <rect x={-12} y={14} width={24} height={36} fill={shade(c, 0.7)} />
    <rect x={-40} y={0} width={20} height={18} fill={on ? P.yellow : '#9BB7E0'} />
    <rect x={20} y={0} width={20} height={18} fill={on ? P.yellow : '#9BB7E0'} />
  </g>
);
export const Office: React.FC<Ill & {floors?: number}> = ({c = '#3A4F8F', floors = 8, f = 0}) => (
  <g>
    <rect x={-60} y={-floors * 22} width={120} height={floors * 22 + 20} fill={c} />
    {Array.from({length: floors}, (_, r) =>
      [0, 1, 2, 3].map((k) => <rect key={`${r}-${k}`} x={-50 + k * 26} y={-floors * 22 + 8 + r * 22} width={18} height={12} fill={(r * 7 + k * 3 + Math.floor(f / 30)) % 5 ? '#8FB4FF' : P.yellow} />),
    )}
  </g>
);
export const Factory: React.FC<Ill> = ({c = '#9FB0D3', f = 0}) => (
  <g>
    <path d="M-110 70 V-10 L-70 -40 V-10 L-30 -40 V-10 L10 -40 V-10 L50 -40 V-70 H80 V70 Z" fill={c} />
    <PowerPlantSmoke x={65} y={-70} f={f} />
  </g>
);
const PowerPlantSmoke: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => (
  <>
    {Array.from({length: 3}, (_, j) => {
      const k = (f / 40 + j / 3) % 1;
      return <circle key={j} cx={x + k * 30} cy={y - 10 - k * 60} r={8 + k * 16} fill="#D9DEE8" opacity={(1 - k) * 0.8} />;
    })}
  </>
);
/** A simple person; `c` is the shirt. Arms can wave (`wave`) or hold up (`up`). */
export const Person: React.FC<Ill & {skin?: string; wave?: number; up?: number}> = ({c = P.blue, skin = '#C98E64', f = 0, wave = 0, up = 0}) => {
  const a = wave ? Math.sin(f / 5) * 25 * wave : 0;
  return (
    <g>
      <rect x={-22} y={20} width={16} height={60} rx={8} fill="#2B3150" />
      <rect x={6} y={20} width={16} height={60} rx={8} fill="#2B3150" />
      <rect x={-30} y={-40} width={60} height={70} rx={22} fill={c} />
      <rect x={-46} y={-34} width={16} height={56} rx={8} fill={c} transform={`rotate(${-a - up * 150} -38 -30)`} />
      <rect x={30} y={-34} width={16} height={56} rx={8} fill={c} transform={`rotate(${a + up * 150} 38 -30)`} />
      <circle cy={-66} r={26} fill={skin} />
    </g>
  );
};
/** A group of people in rows; `n` of them, the first `hi` highlighted in `c`. */
export const Crowd: React.FC<Ill & {n?: number; hi?: number; cols?: number; gap?: number}> = ({n = 12, hi = 0, cols = 6, gap = 70, c = P.red, f = 0}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const skins = ['#C98E64', '#8D5A3B', '#E9B48A', '#6B4128', '#F1C9A5'];
      return (
        <g key={i} transform={`translate(${(col - (cols - 1) / 2) * gap},${row * gap * 1.4}) scale(0.5)`}>
          <Person c={i < hi ? c : '#7C8AA8'} skin={skins[Math.floor(random(`sk${i}`) * skins.length)]} f={f} />
        </g>
      );
    })}
  </g>
);
export const Coin: React.FC<Ill & {label?: string}> = ({label = '$', c = P.yellow}) => (
  <g>
    <ellipse cy={10} rx={60} ry={22} fill={shade(c, 0.7)} />
    <rect x={-60} y={-2} width={120} height={12} fill={shade(c, 0.7)} />
    <ellipse cy={-2} rx={60} ry={22} fill={c} />
    <text y={6} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={24} fill={shade(c, 0.6)}>
      {label}
    </text>
  </g>
);
export const Banknote: React.FC<Ill & {label?: string}> = ({label = '$', c = '#5CC98B'}) => (
  <g>
    <rect x={-90} y={-45} width={180} height={90} rx={8} fill={c} />
    <rect x={-80} y={-35} width={160} height={70} rx={6} fill="none" stroke={shade(c, 0.75)} strokeWidth={4} />
    <circle r={24} fill={shade(c, 0.85)} />
    <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={shade(c, 0.55)}>
      {label}
    </text>
  </g>
);
/** A utility bill on paper with lines; the total row can be highlighted. */
export const Bill: React.FC<Ill & {total?: string; hot?: number}> = ({total = '$', hot = 0}) => (
  <g>
    <rect x={-80} y={-110} width={160} height={220} rx={6} fill="#FFFFFF" />
    <rect x={-80} y={-110} width={160} height={30} rx={6} fill={P.blue} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={-62} y={-60 + i * 22} width={i % 2 ? 90 : 120} height={8} rx={4} fill="#D5DBE8" />
    ))}
    <rect x={-70} y={62} width={140} height={34} rx={6} fill={hot ? P.red : '#EEF2F8'} />
    <text x={58} y={86} textAnchor="end" fontFamily="Poppins" fontWeight={800} fontSize={22} fill={hot ? P.white : P.ink}>
      {total}
    </text>
  </g>
);
export const Clock: React.FC<Ill & {spin?: number}> = ({f = 0, spin = 1}) => (
  <g>
    <circle r={80} fill={P.white} stroke={P.yellow} strokeWidth={10} />
    {Array.from({length: 12}, (_, i) => (
      <rect key={i} x={-3} y={-70} width={6} height={12} rx={3} fill={P.ink} transform={`rotate(${i * 30})`} />
    ))}
    <rect x={-4} y={-56} width={8} height={56} rx={4} fill={P.red} transform={`rotate(${(f * 6 * spin) % 360})`} />
    <rect x={-5} y={-36} width={10} height={36} rx={5} fill={P.ink} transform={`rotate(${(f * 0.5 * spin) % 360})`} />
    <circle r={7} fill={P.ink} />
  </g>
);
export const Thermometer: React.FC<Ill & {level?: number}> = ({level = 0.5}) => (
  <g>
    <rect x={-18} y={-100} width={36} height={170} rx={18} fill={P.white} />
    <circle cy={80} r={32} fill={P.red} />
    <rect x={-9} y={70 - 160 * level} width={18} height={160 * level + 10} rx={9} fill={P.red} />
  </g>
);
export const Fan: React.FC<Ill> = ({f = 0, c = '#9FB0D3'}) => (
  <g>
    <circle r={80} fill={shade(c, 0.6)} />
    <g transform={`rotate(${(f * 25) % 360})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M0 0 C20 -20 30 -60 0 -72 C-12 -50 -12 -25 0 0 Z" fill={c} transform={`rotate(${a})`} />
      ))}
    </g>
    <circle r={14} fill={P.ink} />
  </g>
);
export const CloudShape: React.FC<Ill> = ({c = P.white}) => (
  <path d="M-80 40 Q-120 40 -110 10 Q-100 -20 -65 -15 Q-55 -60 -5 -50 Q25 -80 65 -45 Q115 -45 110 0 Q120 40 80 40 Z" fill={c} />
);
export const Sun: React.FC<Ill> = ({f = 0}) => (
  <g>
    <g transform={`rotate(${(f / 2) % 360})`}>
      {Array.from({length: 12}, (_, i) => (
        <rect key={i} x={-5} y={-95} width={10} height={26} rx={5} fill={P.yellow} transform={`rotate(${i * 30})`} />
      ))}
    </g>
    <circle r={58} fill={P.yellow} />
  </g>
);
export const Truck: React.FC<Ill> = ({c = P.yellow}) => (
  <g>
    <rect x={-100} y={-50} width={140} height={70} rx={6} fill={c} />
    <path d="M40 -30 H80 L100 0 V20 H40 Z" fill={shade(c, 0.85)} />
    <rect x={55} y={-24} width={22} height={18} fill="#9BB7E0" />
    {[-70, -20, 70].map((x) => (
      <circle key={x} cx={x} cy={26} r={16} fill={P.ink} />
    ))}
  </g>
);
export const Rock: React.FC<Ill> = ({c = '#8A7F76', c2 = P.sky}) => (
  <g>
    <path d="M-80 35 L-58 -30 L-8 -58 L50 -40 L82 12 L46 58 L-30 60 Z" fill={c} />
    {[[-30, -10], [10, 20], [30, -20], [-10, 35]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={7} fill={c2} />
    ))}
  </g>
);
export const Pickaxe: React.FC<Ill> = () => (
  <g>
    <rect x={-6} y={-60} width={12} height={130} rx={6} fill="#8B5A2B" transform="rotate(30)" />
    <path d="M-80 -40 Q0 -90 80 -40 Q0 -70 -80 -40 Z" fill="#9AA6BD" transform="rotate(30)" />
  </g>
);
export const Battery: React.FC<Ill & {level?: number}> = ({level = 0.7, c = P.green}) => (
  <g>
    <rect x={-70} y={-40} width={140} height={80} rx={12} fill="none" stroke={P.white} strokeWidth={8} />
    <rect x={70} y={-15} width={12} height={30} rx={4} fill={P.white} />
    <rect x={-60} y={-30} width={120 * level} height={60} rx={6} fill={c} />
  </g>
);
export const Globe: React.FC<Ill> = ({f = 0, c = P.water, c2 = P.green}) => {
  const id = React.useId();
  return (
  <g>
    <circle r={100} fill={c} />
    <g clipPath={`url(#${id})`}>
      <clipPath id={id}>
        <circle r={100} />
      </clipPath>
      {[0, 1].map((k) => (
        <g key={k} transform={`translate(${((f * 0.8) % 240) - 120 + k * 240 - 120},0)`}>
          <path d="M-60 -60 Q-20 -80 0 -40 Q10 -10 -30 0 Q-50 30 -20 60 Q-60 50 -80 10 Q-90 -30 -60 -60 Z" fill={c2} />
          <path d="M30 -70 Q80 -60 90 -20 Q70 10 40 0 Q20 -30 30 -70 Z M40 30 Q70 30 70 60 Q50 80 30 60 Z" fill={c2} />
        </g>
      ))}
    </g>
    <circle r={100} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={4} />
  </g>
  );
};
export const Doc: React.FC<Ill & {title?: string; stamp?: string}> = ({title, stamp, c = P.white}) => (
  <g>
    <rect x={-70} y={-95} width={140} height={190} rx={6} fill={c} />
    {title && (
      <text y={-62} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={18} fill={P.ink}>
        {title}
      </text>
    )}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={-52} y={-40 + i * 20} width={i % 3 === 2 ? 70 : 104} height={7} rx={3.5} fill="#D5DBE8" />
    ))}
    {stamp && (
      <g transform="rotate(-14) translate(0,40)">
        <rect x={-62} y={-20} width={124} height={40} rx={6} fill="none" stroke={P.red} strokeWidth={5} />
        <text y={9} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={20} fill={P.red}>
          {stamp}
        </text>
      </g>
    )}
  </g>
);
export const Gavel: React.FC<Ill & {hit?: number}> = ({hit = 0}) => (
  <g>
    <rect x={-70} y={60} width={140} height={20} rx={6} fill="#8B5A2B" />
    <g transform={`rotate(${-30 + 30 * hit} 40 0)`}>
      <rect x={-10} y={-10} width={110} height={16} rx={8} fill="#A86B34" />
      <rect x={-50} y={-40} width={50} height={76} rx={10} fill="#8B5A2B" />
    </g>
  </g>
);
export const Ship: React.FC<Ill> = ({c = P.red}) => (
  <g>
    <path d="M-120 0 H120 L95 40 H-95 Z" fill={c} />
    {[-80, -40, 0, 40].map((x, i) => (
      <rect key={x} x={x} y={-36} width={36} height={36} fill={[P.blue, P.yellow, P.teal, P.orange][i]} />
    ))}
    <rect x={70} y={-60} width={30} height={60} fill="#F4F6FB" />
  </g>
);
/** A short horizontal "pipe" segment between two points with water running in it. */
export const Pipe: React.FC<{pts: [number, number][]; f: number; flow?: number; c?: string; wpx?: number}> = ({pts, f, flow = 1, c = P.water, wpx = 16}) => {
  const d = 'M' + pts.map((p) => p.join(',')).join(' L');
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke="#5B6B8C" strokeWidth={wpx} />
      <path d={d} stroke={c} strokeWidth={wpx * 0.5} strokeDasharray="18 16" strokeDashoffset={-f * 4} opacity={flow} />
    </g>
  );
};
/** Glowing dots running along a path (electricity, data, money): `n` dots, `speed` px/frame. */
export const Flow: React.FC<{pts: [number, number][]; f: number; c?: string; n?: number; r?: number; speed?: number; o?: number; line?: boolean}> = ({pts, f, c = P.yellow, n = 6, r = 9, speed = 6, o = 1, line = true}) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0) || 1;
  const along = (d: number): [number, number] => {
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i]) {
        const k = d / seg[i];
        return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
      }
      d -= seg[i];
    }
    return pts[pts.length - 1];
  };
  return (
    <g opacity={o}>
      {line && <path d={'M' + pts.map((p) => p.join(',')).join(' L')} stroke={c} strokeOpacity={0.3} strokeWidth={r * 0.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {Array.from({length: n}, (_, i) => {
        const [x, y] = along(((f * speed + (i * total) / n) % total + total) % total);
        return <circle key={i} cx={x} cy={y} r={r} fill={c} style={{filter: `drop-shadow(0 0 ${r}px ${c})`}} />;
      })}
    </g>
  );
};
/** A dashed arrow from a to b that draws itself from `at` (frames). */
export const Arrow: React.FC<{a: [number, number]; b: [number, number]; f: number; at?: number; c?: string; wpx?: number}> = ({a, b, f, at: a0 = 0, c = P.white, wpx = 8}) => {
  const k = ease(f, a0, 14);
  if (k <= 0) return null;
  const x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k);
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={x} y2={y} stroke={c} strokeWidth={wpx} strokeLinecap="round" />
      <path d={`M0 0 L-${wpx * 3} -${wpx * 2} L-${wpx * 3} ${wpx * 2} Z`} fill={c} transform={`translate(${x},${y}) rotate(${ang})`} />
    </g>
  );
};

/* ================================================================== infographics (screen-space HTML) */
/** A number counting up from `from` to `to` over `dur` frames from `start`. */
export const Counter: React.FC<{f: number; start: number; dur?: number; from?: number; to: number; decimals?: number; prefix?: string; suffix?: string; size?: number; color?: string; style?: React.CSSProperties}> = ({f, start, dur = 30, from = 0, to, decimals = 0, prefix = '', suffix = '', size = 140, color = P.white, style}) => {
  const k = ease(f, start, dur);
  const v = lerp(from, to, k);
  const shown = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US');
  return (
    <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: size, lineHeight: 1, color, fontVariantNumeric: 'tabular-nums', opacity: ease(f, start - 4, 8), whiteSpace: 'nowrap', ...style}}>
      {prefix}
      {shown}
      {suffix}
    </div>
  );
};
/** Bars that grow in turn. Values on one scale; labels under, values above. */
export const Bars: React.FC<{f: number; items: {label: string; value: number; color?: string; at: number; text?: string}[]; max?: number; h?: number; w?: number; barW?: number; style?: React.CSSProperties; dark?: boolean}> = ({f, items, max, h = 520, w = 1100, barW = 160, style, dark = true}) => {
  const m = max ?? Math.max(...items.map((i) => i.value));
  const ink = dark ? P.white : P.ink;
  return (
    <div style={{position: 'absolute', width: w, height: h + 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', ...style}}>
      {items.map((it, i) => {
        const k = ease(f, it.at, 20);
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: barW + 80}}>
            <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 48, color: ink, opacity: ease(f, it.at + 10, 10), marginBottom: 10, whiteSpace: 'nowrap'}}>{it.text ?? it.value}</div>
            <div style={{width: barW, height: Math.max(4, (h * it.value * k) / m), background: it.color ?? P.yellow, borderRadius: '12px 12px 0 0'}} />
            <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 30, color: ink, marginTop: 14, opacity: ease(f, it.at, 10), textAlign: 'center', lineHeight: 1.15}}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
};
/** A ring that fills to `pct` (0–100). */
export const Donut: React.FC<{f: number; start: number; pct: number; size?: number; color?: string; track?: string; label?: string; thick?: number}> = ({f, start, pct, size = 360, color = P.yellow, track = 'rgba(255,255,255,0.18)', label, thick = 44}) => {
  const k = ease(f, start, 30);
  const r = size / 2 - thick / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={thick} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={thick} fill="none" strokeDasharray={`${(c * pct * k) / 100} ${c}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: AF.head, fontWeight: 800, fontSize: size * 0.24, color: P.white}}>
        {(pct * k).toFixed(pct % 1 ? 1 : 0)}%{label && <div style={{fontSize: size * 0.07, fontWeight: 700, marginTop: 6, opacity: 0.85}}>{label}</div>}
      </div>
    </div>
  );
};
/** A grid of n icons (dots by default); the first `hi` light up one after another from `start`. */
export const IconGrid: React.FC<{f: number; start: number; n: number; hi: number; cols?: number; size?: number; gap?: number; color?: string; off?: string; stagger?: number; shape?: 'dot' | 'person' | 'square'}> = ({f, start, n, hi, cols = 10, size = 40, gap = 14, color = P.yellow, off = 'rgba(255,255,255,0.18)', stagger = 1.5, shape = 'dot'}) => (
  <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap}}>
    {Array.from({length: n}, (_, i) => {
      const on = i < hi && f >= start + i * stagger;
      const fill = on ? color : off;
      return shape === 'person' ? (
        <svg key={i} width={size} height={size} viewBox="0 0 40 40">
          <circle cx={20} cy={11} r={8} fill={fill} />
          <rect x={9} y={21} width={22} height={18} rx={9} fill={fill} />
        </svg>
      ) : (
        <div key={i} style={{width: size, height: size, borderRadius: shape === 'dot' ? size / 2 : 6, background: fill, transform: on ? `scale(${Math.min(1.15, pop(f, start + i * stagger, 8))})` : undefined}} />
      );
    })}
  </div>
);
/** A labelled horizontal meter, e.g. a share of something. */
export const Meter: React.FC<{f: number; start: number; value: number; max: number; label: string; text?: string; color?: string; w?: number}> = ({f, start, value, max, label, text, color = P.yellow, w = 900}) => {
  const k = ease(f, start, 24);
  return (
    <div style={{width: w, opacity: ease(f, start - 4, 8)}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: AF.head, fontWeight: 700, fontSize: 34, color: P.white, marginBottom: 10}}>
        <span>{label}</span>
        <span style={{color}}>{text ?? value}</span>
      </div>
      <div style={{height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.16)', overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${(100 * value * k) / max}%`, background: color, borderRadius: 17}} />
      </div>
    </div>
  );
};
/** Year markers along a line that appear one by one. */
export const Timeline: React.FC<{f: number; items: {year: string; label: string; at: number; color?: string}[]; w?: number}> = ({f, items, w = 1500}) => (
  <div style={{position: 'relative', width: w, height: 220}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 60, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.25)'}} />
    {items.map((it, i) => {
      const x = (w * (i + 0.5)) / items.length;
      const k = pop(f, it.at, 12);
      return (
        <div key={i} style={{position: 'absolute', left: x - 160, width: 320, top: 0, textAlign: 'center', opacity: Math.min(1, k)}}>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 40, color: it.color ?? P.yellow}}>{it.year}</div>
          <div style={{margin: '6px auto 0', width: 28, height: 28, borderRadius: 14, background: it.color ?? P.yellow, transform: `scale(${k})`}} />
          <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 28, color: P.white, marginTop: 14, lineHeight: 1.2}}>{it.label}</div>
        </div>
      );
    })}
  </div>
);
/** A fact line along the bottom: the key point in words, with an optional source. */
export const Caption: React.FC<{f: number; at: number; children: React.ReactNode; source?: string; dark?: boolean; until?: number}> = ({f, at: a, children, source, dark, until}) => {
  const k = ease(f, a, 10) * (until !== undefined ? 1 - ease(f, until, 8) : 1);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 64, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 20}px)`}}>
      <Tag bg={dark ? P.ink : P.white} color={dark ? P.white : P.ink} size={42}>
        {children}
      </Tag>
      {source && (
        <Note style={{marginTop: 12}} size={18}>
          Source · {source}
        </Note>
      )}
    </div>
  );
};
/** A title card in the corner: a place, a name, a date. */
export const Label: React.FC<{f: number; at: number; title: string; sub?: string; x?: number; y?: number; bg?: string; color?: string; size?: number}> = ({f, at: a, title, sub, x = 80, y = 70, bg = P.white, color = P.ink, size = 44}) => {
  const k = ease(f, a, 10);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: k, transform: `translateX(${(1 - k) * -20}px)`}}>
      <Tag bg={bg} color={color} size={size}>
        {title}
      </Tag>
      {sub && (
        <Note style={{marginTop: 12, marginLeft: 8}} size={20}>
          {sub}
        </Note>
      )}
    </div>
  );
};
/** A headline word or number that pops in at screen position (x, y), centred. */
export const Pop: React.FC<{f: number; at: number; x: number; y: number; children: React.ReactNode; size?: number; color?: string; until?: number}> = ({f, at: a, x, y, children, size = 90, color = P.white, until}) => {
  const k = pop(f, a, 12) * (until !== undefined ? 1 - ease(f, until, 8) : 1);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${k})`, fontFamily: AF.head, fontWeight: 800, fontSize: size, color, whiteSpace: 'nowrap', textShadow: '0 8px 30px rgba(0,0,0,0.3)', textAlign: 'center', lineHeight: 1.05}}>
      {children}
    </div>
  );
};
export {Tag, Note, P, AF, ease, lerp, pop};
