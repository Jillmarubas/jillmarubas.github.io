// Paper-cutout toolkit: scissor-cut shapes, lifted paper shadows, on-twos stepping and a little boil.
import React from 'react';
import {Easing, interpolate, random, staticFile, useCurrentFrame, continueRender, delayRender} from 'remotion';

export const FPS = 23;
export const W = 1080;
export const H = 1920;
export const sec = (s: number) => Math.round(s * FPS);

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const io = Easing.bezier(0.45, 0, 0.2, 1); // house ease-in-out
export const snap = Easing.bezier(0.22, 1, 0.36, 1); // snap in and settle
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ramp = (f: number, a: number, b: number, from = 0, to = 1, easing = io) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});

// Cut-out animation is shot "on twos": every drawing is held for two frames.
export const useStep = () => {
  const f = useCurrentFrame();
  return f - (f % 2);
};

// The palette: cream paper, muted greys and sage, one accent (the kite).
export const C = {
  paper: '#F3ECE0',
  paper2: '#EAE1D2',
  white: '#FBF8F1',
  tan: '#D8CDB9',
  tan2: '#C7BAA4',
  roof: '#8F8173',
  roof2: '#A39383',
  roof3: '#7E756B',
  ink: '#3A332C',
  window: '#6C7179',
  sage1: '#D6D4C0',
  sage2: '#C4C3AA',
  sage3: '#AFAF93',
  sage4: '#9A9C80',
  sea1: '#BFC8C5',
  sea2: '#ACB8B6',
  sea3: '#99A8A7',
  sea4: '#879797',
  sun: '#EBD7A6',
  skin: '#E6D1BD',
  cheek: '#D9A99A',
  shirt: '#6F7C85',
  pants: '#4F4A44',
  hair: '#3A332C',
  accent: '#E1543A',
  accentDark: '#B9412C',
};

// ---------- scissor-cut geometry ----------
export type Pt = [number, number];

// Subdivide each edge and nudge points along the normal: the slightly uneven line of a scissor cut.
export const cut = (pts: Pt[], seed: string, amp = 1.6, seg = 16, closed = true) => {
  const out: Pt[] = [];
  const n = pts.length;
  const edges = closed ? n : n - 1;
  for (let i = 0; i < edges; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.max(1, Math.round(len / seg));
    const nx = -dy / len;
    const ny = dx / len;
    for (let j = 0; j < k; j++) {
      const t = j / k;
      const r = (random(`${seed}-${i}-${j}`) - 0.5) * 2 * amp * (j === 0 ? 0.3 : 1);
      out.push([a[0] + dx * t + nx * r, a[1] + dy * t + ny * r]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return 'M' + out.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + (closed ? 'Z' : '');
};

export const ellipsePts = (cx: number, cy: number, rx: number, ry: number, n?: number): Pt[] => {
  const k = n ?? Math.max(14, Math.round((rx + ry) / 5));
  return Array.from({length: k}, (_, i) => {
    const a = (i / k) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Pt;
  });
};
export const rectPts = (x: number, y: number, w: number, h: number): Pt[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];
// A band whose top edge follows f(x), filled down to `bottom`.
export const bandPts = (f: (x: number) => number, x0: number, x1: number, bottom: number, step = 30): Pt[] => {
  const pts: Pt[] = [];
  for (let x = x0; x <= x1; x += step) pts.push([x, f(x)]);
  pts.push([x1, f(x1)], [x1, bottom], [x0, bottom]);
  return pts;
};
// Zig-zag sun / star burst.
export const burstPts = (cx: number, cy: number, r1: number, r2: number, n: number, rot = 0): Pt[] =>
  Array.from({length: n * 2}, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2 + rot;
    const r = i % 2 ? r2 : r1;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt;
  });

// ---------- paper rendering ----------
// Shadow depth: 1 glued down, 2 lifted, 3 floating, 4 close to the lens.
export const PaperDefs: React.FC = () => (
  <defs>
    {[
      [1, 2, 3, 2, 0.22],
      [2, 5, 8, 5, 0.24],
      [3, 10, 16, 9, 0.26],
      [4, 18, 30, 16, 0.3],
    ].map(([id, dx, dy, sd, op]) => (
      <filter key={id} id={`lift${id}`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx={dx} dy={dy} stdDeviation={sd} floodColor="#2B1D10" floodOpacity={op} />
      </filter>
    ))}
  </defs>
);

export const Cut: React.FC<{
  d: string;
  fill: string;
  lift?: 0 | 1 | 2 | 3 | 4;
  edge?: number; // light cut-edge highlight opacity
  opacity?: number;
}> = ({d, fill, lift = 1, edge = 0.35, opacity}) => (
  <path
    d={d}
    fill={fill}
    opacity={opacity}
    filter={lift ? `url(#lift${lift})` : undefined}
    stroke={edge ? `rgba(255,253,246,${edge})` : undefined}
    strokeWidth={edge ? 1.6 : undefined}
    strokeLinejoin="round"
  />
);

// Boil: hand-placed pieces never sit perfectly still. Re-seeded every 4 frames.
export const useBoil = (seed: string, amp = 0.8) => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 4);
  return {
    dx: (random(`${seed}-x-${k}`) - 0.5) * 2 * amp,
    dy: (random(`${seed}-y-${k}`) - 0.5) * 2 * amp,
    r: (random(`${seed}-r-${k}`) - 0.5) * 0.5 * amp,
  };
};

export const Boil: React.FC<{seed: string; amp?: number; children: React.ReactNode}> = ({seed, amp = 0.8, children}) => {
  const b = useBoil(seed, amp);
  return <g transform={`translate(${b.dx} ${b.dy}) rotate(${b.r})`}>{children}</g>;
};

// Directional entrance with a soft settle (no overshoot), held on twos.
export type Dir = 'left' | 'right' | 'top' | 'bottom' | 'tl' | 'br';
const DIRV: Record<Dir, Pt> = {left: [-1, 0], right: [1, 0], top: [0, -1], bottom: [0, 1], tl: [-0.8, -0.6], br: [0.8, 0.6]};
export const enter = (f: number, at: number, dir: Dir, dist = 900, dur = 14) => {
  const p = ramp(f, at, at + dur, 0, 1, snap);
  const [vx, vy] = DIRV[dir];
  return {x: vx * dist * (1 - p), y: vy * dist * (1 - p), rot: (1 - p) * 8 * (vx || vy), p};
};

// Exit toward the viewer: scale up, drift outward, blur and fade (the house exit).
export const towardViewer = (f: number, at: number, cx: number, cy: number, dur = 11) => {
  const p = ramp(f, at, at + dur, 0, 1, Easing.bezier(0.5, 0, 0.9, 0.6));
  const s = 1 + p * 1.1;
  return {
    transform: `translate(${cx} ${cy}) scale(${s}) translate(${-cx + (cx - W / 2) * p * 0.6} ${-cy + (cy - H / 2) * p * 0.4})`,
    style: {filter: p > 0.02 ? `blur(${p * 14}px)` : undefined, opacity: 1 - p * p},
  };
};

// ---------- fonts ----------
const FONTS: [string, string, string][] = [
  ['Fraunces', '900', 'Fraunces-900-normal.woff2'],
  ['Caveat', '600', 'Caveat-600-normal.woff2'],
];
const fontHandle = delayRender('paperkite fonts');
Promise.all(
  FONTS.map(([family, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(fontHandle));

// ---------- finish ----------
export const PaperFinish: React.FC<{night?: number}> = ({night = 0}) => (
  <>
    <img
      src={staticFile('paperkite/fiber.png')}
      style={{position: 'absolute', inset: 0, width: W, height: H, mixBlendMode: 'multiply', opacity: 0.55 - night * 0.2}}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(40,28,16,0.22) 100%)',
      }}
    />
  </>
);

// A strip of paper with a word cut out on it.
export const Strip: React.FC<{
  x: number;
  y: number;
  text: string;
  size: number;
  font: 'Fraunces' | 'Caveat';
  color?: string;
  fill?: string;
  seed: string;
  padX?: number;
  rot?: number;
  lift?: 1 | 2 | 3;
}> = ({x, y, text, size, font, color = C.ink, fill = C.white, seed, padX = 0.45, rot = 0, lift = 2}) => {
  const w = text.length * size * (font === 'Caveat' ? 0.42 : 0.7) + size * padX * 2;
  const h = size * 1.25;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Cut d={cut(rectPts(-w / 2, -h / 2, w, h), seed, 2.2, 22)} fill={fill} lift={lift} />
      <text
        x={0}
        y={size * (font === 'Caveat' ? 0.3 : 0.34)}
        textAnchor="middle"
        fontFamily={font}
        fontWeight={font === 'Caveat' ? 600 : 900}
        fontSize={size}
        fill={color}
        letterSpacing={font === 'Fraunces' ? -size * 0.01 : 0}
      >
        {text}
      </text>
    </g>
  );
};
