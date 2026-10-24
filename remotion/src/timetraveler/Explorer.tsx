import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {Expression, Pose, TT} from './TimeTraveler';

// The rest of the Jurassic squad. Original characters in the same cartoon style as the
// time traveler (white round heads, thick ink outlines, flat colours), each with its own
// body shape and gear so they read apart at thumbnail size:
//   tank  the big strong one: huge shoulders, man-bun and beard, rope coil
//   pip   the small nervous one: big head, round glasses, an overloaded backpack, camera
//   ria   the fearless one: high ponytail, rolled-up field jacket, wooden staff
// Same props as TimeTraveler (expression, pose + fromPose/poseProgress, talking, flip, size).

export type ExplorerId = 'tank' | 'pip' | 'ria';

export type ExplorerProps = {
  who: ExplorerId;
  expression?: Expression;
  pose?: Pose;
  fromPose?: Pose;
  poseProgress?: number;
  talking?: boolean;
  flip?: boolean;
  /** Height of a standard-height character in px; each explorer scales from it. */
  size?: number;
  style?: React.CSSProperties;
  /** Something held in a hand (viewer's left = A, right = B), drawn at the wrist in the 300 x 520 box. */
  handA?: React.ReactNode;
  handB?: React.ReactNode;
  /** Draw arm B in front of the face (for hand-to-mouth poses like 'eat'). */
  armBFront?: boolean;
  /** Extra drawing on top of everything, in the 300 x 520 box. */
  children?: React.ReactNode;
  /** Expedition gear (Pip's backpack and camera, Tank's rope, Ria's staff). Turn off for scenes at home. */
  gear?: boolean;
};

const {ink, line: LW} = TT;

type Spec = {
  height: number; // relative to the time traveler
  headR: number;
  headY: number;
  shoulder: number; // half width at the shoulders
  hip: number;
  torsoTop: number;
  torsoBottom: number;
  legW: number;
  legGap: number;
  arm: number; // sleeve thickness
  upper: number;
  fore: number;
  shirt: string;
  shirtShade: string;
  sleeve: string; // colour of the arm (skin for bare arms)
  pants: string;
  shoe: string;
};

export const SQUAD: Record<ExplorerId, Spec & {name: string; role: string}> = {
  tank: {
    name: 'Tank', role: 'the muscle',
    height: 1.12, headR: 64, headY: 112, shoulder: 96, hip: 70, torsoTop: 186, torsoBottom: 352,
    legW: 40, legGap: 10, arm: 48, upper: 64, fore: 58,
    shirt: '#5f7a3a', shirtShade: '#4c6330', sleeve: TT.skin, pants: '#6d6248', shoe: '#4a3122',
  },
  pip: {
    name: 'Pip', role: 'the nervous one',
    height: 0.8, headR: 90, headY: 140, shoulder: 50, hip: 50, torsoTop: 240, torsoBottom: 360,
    legW: 26, legGap: 10, arm: 28, upper: 50, fore: 46,
    shirt: '#e2553f', shirtShade: '#c44331', sleeve: '#e2553f', pants: '#c9a86a', shoe: '#3a6ea8',
  },
  ria: {
    name: 'Ria', role: 'the fearless one',
    height: 1.04, headR: 74, headY: 120, shoulder: 58, hip: 50, torsoTop: 204, torsoBottom: 350,
    legW: 30, legGap: 12, arm: 30, upper: 60, fore: 56,
    shirt: '#c4622d', shirtShade: '#a54f22', sleeve: '#c4622d', pants: '#3d5a40', shoe: '#3b2a1e',
  },
};

// ---- arms (same pose language as the time traveler) ----
type ArmPose = {upper: number; elbow: number};
type PoseDef = {a: ArmPose; b: ArmPose; headTilt: number; lookX: number; lookY: number};
type BasePose = 'idle' | 'wave' | 'point' | 'panic' | 'shiver' | 'checkWatch';
const BASE: Record<BasePose, PoseDef> = {
  idle: {a: {upper: 12, elbow: -10}, b: {upper: 12, elbow: -10}, headTilt: 0, lookX: 0, lookY: 0},
  wave: {a: {upper: 12, elbow: -10}, b: {upper: 145, elbow: 35}, headTilt: -4, lookX: 0, lookY: 0},
  point: {a: {upper: 10, elbow: -8}, b: {upper: 92, elbow: 0}, headTilt: -3, lookX: 3, lookY: 0},
  panic: {a: {upper: 150, elbow: 30}, b: {upper: 150, elbow: 30}, headTilt: 0, lookX: 0, lookY: -1},
  shiver: {a: {upper: -8, elbow: -105}, b: {upper: -8, elbow: -105}, headTilt: 0, lookX: 0, lookY: 1},
  checkWatch: {a: {upper: 38, elbow: -118}, b: {upper: 12, elbow: -10}, headTilt: -9, lookX: -3, lookY: 4},
};
// seated poses, solved per body so the hand lands on the mouth, the lap or a bowl
const arm = (upper: number, elbow: number) => ({upper, elbow});
const SEATED: Record<ExplorerId, Record<'eat' | 'reach' | 'holdBowl' | 'toss' | 'snack', PoseDef>> = {
  tank: {
    eat: {a: arm(-8.5, -10), b: arm(-50.4, -117.8), headTilt: 0, lookX: 0, lookY: 0},
    reach: {a: arm(19.1, -10), b: arm(-8.5, -10), headTilt: -4, lookX: -2, lookY: 1},
    holdBowl: {a: arm(-4, -10.2), b: arm(-4, -10.2), headTilt: 0, lookX: 0, lookY: 0},
    toss: {a: arm(-8.5, -10), b: arm(142.1, 60.7), headTilt: 4, lookX: -2, lookY: -5},
    snack: {a: arm(19.1, -10), b: arm(-50.4, -117.8), headTilt: -2, lookX: 0, lookY: 0},
  },
  pip: {
    eat: {a: arm(32.1, -85.2), b: arm(-100.8, -112), headTilt: 0, lookX: 0, lookY: 0},
    reach: {a: arm(50.2, -48.4), b: arm(32.1, -85.2), headTilt: -4, lookX: -2, lookY: 1},
    holdBowl: {a: arm(53, -87.5), b: arm(53, -87.5), headTilt: 0, lookX: 0, lookY: 0},
    toss: {a: arm(32.1, -85.2), b: arm(163.4, 10.8), headTilt: 3, lookX: 0, lookY: -4},
    snack: {a: arm(50.2, -48.4), b: arm(-100.8, -112), headTilt: -2, lookX: 0, lookY: 0},
  },
  ria: {
    eat: {a: arm(25.5, -73), b: arm(-85.8, -120), headTilt: 0, lookX: 0, lookY: 0},
    reach: {a: arm(50.3, -43.7), b: arm(25.5, -73), headTilt: -4, lookX: -2, lookY: 1},
    holdBowl: {a: arm(36, -71.7), b: arm(36, -71.7), headTilt: 0, lookX: 0, lookY: 0},
    toss: {a: arm(25.5, -73), b: arm(161.1, 10.3), headTilt: 3, lookX: 0, lookY: -4},
    snack: {a: arm(50.3, -43.7), b: arm(-85.8, -120), headTilt: -2, lookX: 0, lookY: 0},
  },
};
const poseOf = (who: ExplorerId, pose: Pose): PoseDef => (pose in BASE ? BASE[pose as BasePose] : SEATED[who][pose as keyof (typeof SEATED)['tank']]);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (p: PoseDef, q: PoseDef, t: number): PoseDef => ({
  a: {upper: lerp(p.a.upper, q.a.upper, t), elbow: lerp(p.a.elbow, q.a.elbow, t)},
  b: {upper: lerp(p.b.upper, q.b.upper, t), elbow: lerp(p.b.elbow, q.b.elbow, t)},
  headTilt: lerp(p.headTilt, q.headTilt, t),
  lookX: lerp(p.lookX, q.lookX, t),
  lookY: lerp(p.lookY, q.lookY, t),
});
const rad = (d: number) => (d * Math.PI) / 180;

const armGeom = (side: -1 | 1, p: ArmPose, s: Spec) => {
  const sx = 150 + side * (s.shoulder - s.arm * 0.35);
  const sy = s.torsoTop + 22;
  const dir = (deg: number) => [side * Math.sin(rad(deg)), Math.cos(rad(deg))];
  const [ux, uy] = dir(p.upper);
  const ex = sx + ux * s.upper;
  const ey = sy + uy * s.upper;
  const [fx, fy] = dir(p.upper + p.elbow);
  return {sx, sy, ex, ey, wx: ex + fx * s.fore, wy: ey + fy * s.fore, fx, fy};
};

const Arm: React.FC<{g: ReturnType<typeof armGeom>; s: Spec; bare?: boolean}> = ({g, s, bare}) => {
  const d = `M${g.sx} ${g.sy} L${g.ex} ${g.ey} L${g.wx} ${g.wy}`;
  return (
    <g>
      <path d={d} fill="none" stroke={ink} strokeWidth={s.arm + LW * 2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={s.sleeve} strokeWidth={s.arm} strokeLinecap="round" strokeLinejoin="round" />
      {!bare && (
        // short sleeve edge on the upper arm
        <path d={`M${g.sx} ${g.sy} L${lerp(g.sx, g.ex, 0.6)} ${lerp(g.sy, g.ey, 0.6)}`} fill="none" stroke={s.shirtShade} strokeWidth={s.arm * 0.35} strokeLinecap="round" opacity={0.5} />
      )}
      <circle cx={g.wx} cy={g.wy} r={s.arm * 0.42 + 4} fill={TT.skin} stroke={ink} strokeWidth={LW * 0.8} />
    </g>
  );
};

// ---- faces ----
type Face = {brow: number; browY: number; eye: number; mouth: 'smile' | 'grin' | 'o' | 'wobble' | 'scream' | 'flat' | 'chatter'};
const FACES: Record<Expression, Face> = {
  neutral: {brow: 0, browY: 0, eye: 1, mouth: 'smile'},
  happy: {brow: -6, browY: -3, eye: 1, mouth: 'grin'},
  surprised: {brow: 4, browY: -9, eye: 1.18, mouth: 'o'},
  worried: {brow: 16, browY: -3, eye: 1.05, mouth: 'wobble'},
  scared: {brow: 22, browY: -7, eye: 1.22, mouth: 'scream'},
  determined: {brow: -18, browY: 2, eye: 0.95, mouth: 'flat'},
  cold: {brow: 12, browY: -2, eye: 1, mouth: 'chatter'},
};

const Mouth: React.FC<{m: Face['mouth']; open: boolean; k: number}> = ({m, open, k}) => {
  const s = {stroke: ink, strokeWidth: LW * 0.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const inner = (() => {
    if (open) return <ellipse cx={0} cy={4} rx={12} ry={10} fill="#5a1f1f" {...s} />;
    switch (m) {
      case 'smile': return <path d="M-13 0 Q0 10 13 0" fill="none" {...s} />;
      case 'grin': return <path d="M-17 -2 Q0 21 17 -2 Z" fill="#5a1f1f" {...s} />;
      case 'o': return <ellipse cx={0} cy={4} rx={8} ry={11} fill="#5a1f1f" {...s} />;
      case 'wobble': return <path d="M-13 6 Q-7 0 0 5 Q7 10 13 4" fill="none" {...s} />;
      case 'scream': return <path d="M-14 10 Q-13 -6 0 -6 Q13 -6 14 10 Q0 4 -14 10 Z" fill="#5a1f1f" {...s} />;
      case 'flat': return <path d="M-12 3 L12 1" fill="none" {...s} />;
      case 'chatter': return <rect x={-14} y={-5} width={28} height={13} rx={5} fill="#fff" {...s} />;
    }
  })();
  return <g transform={`scale(${k})`}>{inner}</g>;
};

// ---- per-character hair and gear ----
const TankHairBack: React.FC<{s: Spec}> = ({s}) => (
  // man-bun on top of the head
  <g>
    <circle cx={150} cy={s.headY - s.headR - 4} r={20} fill="#5a3a22" stroke={ink} strokeWidth={LW} />
    <path d={`M136 ${s.headY - s.headR + 6} Q150 ${s.headY - s.headR - 6} 164 ${s.headY - s.headR + 6}`} fill="none" stroke="#c94f3d" strokeWidth={7} strokeLinecap="round" />
  </g>
);
const TankHairFront: React.FC<{s: Spec}> = ({s}) => {
  const {headR: r, headY: y} = s;
  return (
    <g>
      {/* hair pulled back: a cap over the top of the head only */}
      <path d={`M${150 - r * 0.92} ${y - r * 0.38} Q${150 - r * 0.8} ${y - r - 6} 150 ${y - r - 2} Q${150 + r * 0.8} ${y - r - 6} ${150 + r * 0.92} ${y - r * 0.38} Q150 ${y - r * 0.72} ${150 - r * 0.92} ${y - r * 0.38} Z`} fill="#5a3a22" stroke={ink} strokeWidth={LW} strokeLinejoin="round" />
      {/* full beard round the jaw, starting below the eyes */}
      <path d={`M${150 - r + 1} ${y + r * 0.28} Q${150 - r + 6} ${y + r + 32} 150 ${y + r + 36} Q${150 + r - 6} ${y + r + 32} ${150 + r - 1} ${y + r * 0.28} Q${150 + r * 0.6} ${y + r * 0.6} 150 ${y + r * 0.52} Q${150 - r * 0.6} ${y + r * 0.6} ${150 - r + 1} ${y + r * 0.28} Z`} fill="#5a3a22" stroke={ink} strokeWidth={LW} strokeLinejoin="round" />
      {/* moustache */}
      <path d={`M${150 - 26} ${y + r * 0.66} Q150 ${y + r * 0.46} ${150 + 26} ${y + r * 0.66}`} fill="none" stroke="#3e2716" strokeWidth={8} strokeLinecap="round" />
    </g>
  );
};
const TankGear: React.FC<{s: Spec}> = ({s}) => (
  // rope coil worn across the chest
  <g>
    <path d={`M${150 - s.shoulder + 14} ${s.torsoTop + 6} L${150 + s.shoulder - 30} ${s.torsoBottom - 30}`} stroke={ink} strokeWidth={22} strokeLinecap="round" />
    <path d={`M${150 - s.shoulder + 14} ${s.torsoTop + 6} L${150 + s.shoulder - 30} ${s.torsoBottom - 30}`} stroke="#d9b77a" strokeWidth={14} strokeLinecap="round" />
    {[0.2, 0.4, 0.6, 0.8].map((t) => {
      const x = lerp(150 - s.shoulder + 14, 150 + s.shoulder - 30, t);
      const y = lerp(s.torsoTop + 6, s.torsoBottom - 30, t);
      return <path key={t} d={`M${x - 6} ${y - 6} l10 10`} stroke="#a8864a" strokeWidth={3.5} strokeLinecap="round" />;
    })}
  </g>
);

const PipHair: React.FC<{s: Spec}> = ({s}) => {
  const {headR: r, headY: y} = s;
  // short black tufts sticking up, a little cowlick
  const pts: string[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const a = rad(-188 + (196 * i) / n);
    const rr = i % 2 ? r + 10 : r - 4;
    pts.push(`${150 + Math.cos(a) * rr} ${y + Math.sin(a) * rr}`);
  }
  return (
    <g>
      <path d={`M${pts.join(' L')} Q150 ${y - r * 0.55} ${pts[0]} Z`} fill="#1f1b24" stroke={ink} strokeWidth={LW} strokeLinejoin="round" />
      <path d={`M150 ${y - r - 6} q14 -26 34 -16`} fill="none" stroke={ink} strokeWidth={9} strokeLinecap="round" />
      <path d={`M150 ${y - r - 6} q14 -26 34 -16`} fill="none" stroke="#1f1b24" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};
const PipGlasses: React.FC<{s: Spec; lookX: number}> = ({s, lookX}) => {
  const k = s.headR / 80;
  return (
    <g transform={`translate(${lookX} 0)`}>
      {[-1, 1].map((side) => (
        <circle key={side} cx={150 + side * 30 * k} cy={s.headY + 14 * k} r={22 * k} fill="rgba(200,235,255,0.35)" stroke="#e08a1e" strokeWidth={7} />
      ))}
      <path d={`M${150 - 8 * k} ${s.headY + 12 * k} Q150 ${s.headY + 6 * k} ${150 + 8 * k} ${s.headY + 12 * k}`} fill="none" stroke="#e08a1e" strokeWidth={6} />
    </g>
  );
};
const PipBackpack: React.FC<{s: Spec}> = ({s}) => (
  // an overloaded pack towering above his head: sleeping mat, frying pan, lantern
  <g>
    <rect x={150 - s.shoulder - 34} y={s.torsoTop - 210} width={(s.shoulder + 34) * 2} height={340} rx={34} fill="#5c7a96" stroke={ink} strokeWidth={LW} />
    <rect x={150 - s.shoulder - 48} y={s.torsoTop - 244} width={(s.shoulder + 48) * 2} height={42} rx={21} fill="#3fa36a" stroke={ink} strokeWidth={LW} />
    <circle cx={150 + s.shoulder + 40} cy={s.torsoTop - 150} r={24} fill="#3a3a44" stroke={ink} strokeWidth={LW} />
    <path d={`M${150 + s.shoulder + 40} ${s.torsoTop - 126} l26 40`} stroke={ink} strokeWidth={10} strokeLinecap="round" />
    <rect x={150 - s.shoulder - 62} y={s.torsoTop - 170} width={28} height={38} rx={6} fill="#f2c14e" stroke={ink} strokeWidth={LW * 0.8} />
  </g>
);
const PipGear: React.FC<{s: Spec; camera: boolean}> = ({s, camera}) => (
  // camera on a neck strap: he films everything
  <g>
    {camera && <>
    <path d={`M${150 - 26} ${s.torsoTop + 2} L150 ${s.torsoTop + 50} L${150 + 26} ${s.torsoTop + 2}`} fill="none" stroke={ink} strokeWidth={4} />
    <rect x={150 - 22} y={s.torsoTop + 44} width={44} height={30} rx={6} fill="#2e2e36" stroke={ink} strokeWidth={LW * 0.8} />
    <circle cx={150} cy={s.torsoTop + 59} r={9} fill="#7fd3ff" stroke={ink} strokeWidth={3} />
    </>}
    {/* tall striped socks */}
    {[-1, 1].map((side) => (
      <g key={side}>
        <rect x={150 + side * (s.legGap / 2 + s.legW / 2) - s.legW / 2 - 1} y={430} width={s.legW + 2} height={42} fill="#ffffff" stroke={ink} strokeWidth={LW * 0.7} />
        <path d={`M${150 + side * (s.legGap / 2 + s.legW / 2) - s.legW / 2} 442 h${s.legW} M${150 + side * (s.legGap / 2 + s.legW / 2) - s.legW / 2} 452 h${s.legW}`} stroke="#e2553f" strokeWidth={5} />
      </g>
    ))}
  </g>
);

const RiaPonytail: React.FC<{s: Spec; frame: number}> = ({s, frame}) => {
  const sw = Math.sin(frame / 14) * 8;
  const {headR: r, headY: y} = s;
  return (
    <path
      d={`M${150 + r * 0.55} ${y - r * 0.75} Q${150 + r + 40 + sw} ${y - r * 0.6} ${150 + r + 20 + sw} ${y + r * 0.9} Q${150 + r + 4} ${y + r * 0.3} ${150 + r * 0.7} ${y - r * 0.35} Z`}
      fill="#231a20"
      stroke={ink}
      strokeWidth={LW}
      strokeLinejoin="round"
    />
  );
};
const RiaHair: React.FC<{s: Spec}> = ({s}) => {
  const {headR: r, headY: y} = s;
  return (
    <g>
      <path d={`M${150 - r - 2} ${y + 6} Q${150 - r} ${y - r - 10} 150 ${y - r - 4} Q${150 + r} ${y - r - 10} ${150 + r + 2} ${y + 2} Q${150 + r * 0.5} ${y - r * 0.5} 150 ${y - r * 0.45} Q${150 - r * 0.6} ${y - r * 0.35} ${150 - r - 2} ${y + 6} Z`} fill="#231a20" stroke={ink} strokeWidth={LW} strokeLinejoin="round" />
      <path d={`M${150 - r + 4} ${y - r * 0.42} Q150 ${y - r * 0.85} ${150 + r - 4} ${y - r * 0.42}`} fill="none" stroke={ink} strokeWidth={16} strokeLinecap="round" />
      <path d={`M${150 - r + 4} ${y - r * 0.42} Q150 ${y - r * 0.85} ${150 + r - 4} ${y - r * 0.42}`} fill="none" stroke="#3f8f5a" strokeWidth={8} strokeLinecap="round" />
    </g>
  );
};
const RiaGear: React.FC<{s: Spec}> = ({s}) => (
  // dark top under the open jacket, belt with pouches
  <g>
    <path d={`M${150 - 20} ${s.torsoTop + 4} L${150 + 20} ${s.torsoTop + 4} L${150 + 22} ${s.torsoBottom - 22} L${150 - 22} ${s.torsoBottom - 22} Z`} fill="#2b2f3a" stroke={ink} strokeWidth={LW * 0.7} strokeLinejoin="round" />
    <rect x={150 - s.hip - 2} y={s.torsoBottom - 26} width={(s.hip + 2) * 2} height={14} rx={4} fill="#5a3a22" stroke={ink} strokeWidth={LW * 0.7} />
    <rect x={150 - s.hip + 6} y={s.torsoBottom - 30} width={18} height={22} rx={4} fill="#8a6a3a" stroke={ink} strokeWidth={LW * 0.6} />
    <rect x={150 + s.hip - 24} y={s.torsoBottom - 30} width={18} height={22} rx={4} fill="#8a6a3a" stroke={ink} strokeWidth={LW * 0.6} />
  </g>
);
const RiaStaff: React.FC<{g: ReturnType<typeof armGeom>}> = ({g}) => {
  // held upright in the right hand
  const len = 300;
  const x1 = g.wx - g.fy * 0 ;
  return (
    <g>
      <path d={`M${x1} ${g.wy - len * 0.55} L${x1} ${g.wy + len * 0.45}`} stroke={ink} strokeWidth={16} strokeLinecap="round" />
      <path d={`M${x1} ${g.wy - len * 0.55} L${x1} ${g.wy + len * 0.45}`} stroke="#9a6a3a" strokeWidth={8} strokeLinecap="round" />
      <path d={`M${x1 - 7} ${g.wy - len * 0.42} h14 M${x1 - 7} ${g.wy - len * 0.36} h14`} stroke="#3f8f5a" strokeWidth={5} />
    </g>
  );
};

// ---- the explorer ----
export const Explorer: React.FC<ExplorerProps> = ({who, expression = 'neutral', pose = 'idle', fromPose, poseProgress = 1, talking = false, flip = false, size = 400, style, handA, handB, armBFront = false, children, gear = true}) => {
  const frame = useCurrentFrame();
  const s = SQUAD[who];
  const p = fromPose ? mix(poseOf(who, fromPose), poseOf(who, pose), Math.min(1, Math.max(0, poseProgress))) : poseOf(who, pose);
  const face = FACES[expression];
  const breath = Math.sin((frame / 90) * Math.PI * 2 + s.height * 7);
  const sway = Math.sin((frame / 130) * Math.PI * 2 + s.height * 3) * 2 + p.headTilt;
  const shiver = pose === 'shiver' ? Math.sin(frame * 2.3) * 1.6 : 0;
  const panic = pose === 'panic' ? Math.sin(frame * 1.7) * 6 : 0;
  const wave = pose === 'wave' ? Math.sin(frame / 4) * 22 : 0;
  const ga = armGeom(-1, {...p.a, elbow: p.a.elbow - panic}, s);
  const gb = armGeom(1, {...p.b, elbow: p.b.elbow + wave + panic}, s);

  const period = 115 + Math.floor(random(who + 'p') * 40);
  const cycle = Math.floor(frame / period);
  const off = Math.floor(random(`${who}-${cycle}`) * (period - 8));
  const t = frame - cycle * period - off;
  const eyeOpen = t >= 0 && t < 4 ? 0.12 : 1;
  const flap = talking && Math.sin(frame * 1.9 + s.height * 5) + Math.sin(frame * 1.13 + 1) > 0.2;

  const k = s.headR / 80;
  const h = size * s.height;
  const legX = (side: -1 | 1) => 150 + side * (s.legGap / 2 + s.legW / 2);
  const armBNode = (
    <>
      <Arm g={gb} s={s} bare={who === 'tank'} />
      {handB && <g transform={`translate(${gb.wx} ${gb.wy})`}>{handB}</g>}
    </>
  );

  return (
    <svg width={(h * TT.viewW) / TT.viewH} height={h} viewBox={`0 0 ${TT.viewW} ${TT.viewH}`} style={{overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined, ...style}}>
      <g transform={`translate(${shiver} 0)`}>
        {who === 'pip' && gear && <g transform={`translate(0 ${breath * 1.6})`}><PipBackpack s={s} /></g>}
        {who === 'ria' && <g transform={`translate(0 ${breath * 1.6}) rotate(${sway} 150 ${s.headY + s.headR})`}><RiaPonytail s={s} frame={frame} /></g>}
        {/* legs and boots */}
        {([-1, 1] as const).map((side) => (
          <g key={side}>
            <rect x={legX(side) - s.legW / 2} y={s.torsoBottom - 14} width={s.legW} height={480 - s.torsoBottom + 14} rx={10} fill={s.pants} stroke={ink} strokeWidth={LW} />
            <path d={`M${legX(side) - s.legW / 2 - 12} 496 Q${legX(side) - s.legW / 2 - 12} 462 ${legX(side)} 462 Q${legX(side) + s.legW / 2 + 14} 462 ${legX(side) + s.legW / 2 + 14} 496 Z`} fill={s.shoe} stroke={ink} strokeWidth={LW} strokeLinejoin="round" />
            <rect x={legX(side) - s.legW / 2 - 14} y={492} width={s.legW + 30} height={9} rx={4} fill="#e9e1d0" stroke={ink} strokeWidth={LW * 0.6} />
          </g>
        ))}
        {who === 'pip' && <PipGear s={s} camera={gear} />}

        <g transform={`translate(0 ${breath * 1.6})`}>
          {/* torso */}
          <path
            d={`M${150 - s.shoulder + 10} ${s.torsoTop} Q150 ${s.torsoTop - 12} ${150 + s.shoulder - 10} ${s.torsoTop} Q${150 + s.shoulder + 4} ${s.torsoTop + 8} ${150 + s.shoulder} ${s.torsoTop + 40} L${150 + s.hip + 4} ${s.torsoBottom} Q150 ${s.torsoBottom + 12} ${150 - s.hip - 4} ${s.torsoBottom} L${150 - s.shoulder} ${s.torsoTop + 40} Q${150 - s.shoulder - 4} ${s.torsoTop + 8} ${150 - s.shoulder + 10} ${s.torsoTop} Z`}
            fill={s.shirt}
            stroke={ink}
            strokeWidth={LW}
            strokeLinejoin="round"
          />
          {who === 'tank' && gear && <TankGear s={s} />}
          {who === 'ria' && (
            <>
              <RiaGear s={s} />
              {/* open jacket collar */}
              <path d={`M${150 - 30} ${s.torsoTop - 2} L150 ${s.torsoTop + 40} L${150 + 30} ${s.torsoTop - 2}`} fill="none" stroke={ink} strokeWidth={LW * 0.8} strokeLinejoin="round" />
            </>
          )}
          {who === 'pip' && (
            <>
              <path d={`M${150 - s.shoulder + 6} ${s.torsoTop + 50} H${150 + s.shoulder - 6} M${150 - s.shoulder + 4} ${s.torsoTop + 80} H${150 + s.shoulder - 4}`} stroke={s.shirtShade} strokeWidth={8} />
              {/* backpack straps */}
              {gear && <>
              <path d={`M${150 - 34} ${s.torsoTop} L${150 - 30} ${s.torsoTop + 90} M${150 + 34} ${s.torsoTop} L${150 + 30} ${s.torsoTop + 90}`} stroke={ink} strokeWidth={14} strokeLinecap="round" />
              <path d={`M${150 - 34} ${s.torsoTop} L${150 - 30} ${s.torsoTop + 90} M${150 + 34} ${s.torsoTop} L${150 + 30} ${s.torsoTop + 90}`} stroke="#45627c" strokeWidth={7} strokeLinecap="round" />
              </>}
            </>
          )}

          {/* neck */}
          <rect x={150 - 16 * k} y={s.headY + s.headR - 14} width={32 * k} height={s.torsoTop - s.headY - s.headR + 22} fill={TT.skin} stroke={ink} strokeWidth={LW} />

          {who === 'ria' && gear && <RiaStaff g={gb} />}
          <Arm g={ga} s={s} bare={who === 'tank'} />
          {handA && <g transform={`translate(${ga.wx} ${ga.wy})`}>{handA}</g>}
          {!armBFront && armBNode}

          {/* head */}
          <g transform={`rotate(${sway} 150 ${s.headY + s.headR})`}>
            {who === 'tank' && <TankHairBack s={s} />}
            <circle cx={150} cy={s.headY} r={s.headR} fill={TT.skin} stroke={ink} strokeWidth={LW} />
            <path d={`M${150 + s.headR * 0.65} ${s.headY + s.headR * 0.6} Q${150 + s.headR * 1.0} ${s.headY + s.headR * 0.1} ${150 + s.headR * 0.9} ${s.headY - s.headR * 0.4} Q${150 + s.headR * 1.05} ${s.headY + s.headR * 0.3} ${150 + s.headR * 0.55} ${s.headY + s.headR * 0.72} Z`} fill={TT.skinShade} />
            {who === 'tank' && <TankHairFront s={s} />}
            {who === 'pip' && <PipHair s={s} />}
            {who === 'ria' && <RiaHair s={s} />}
            {/* brows */}
            <g transform={`translate(0 ${face.browY + (who === 'tank' ? 2 : 0)})`}>
              {([-1, 1] as const).map((side) => (
                <path
                  key={side}
                  d={`M${150 + side * 28 * k - 12} ${s.headY - 16 * k} L${150 + side * 28 * k + 12} ${s.headY - 16 * k}`}
                  transform={`rotate(${side * -face.brow} ${150 + side * 28 * k} ${s.headY - 16 * k})`}
                  stroke={ink}
                  strokeWidth={who === 'tank' ? LW * 1.3 : LW * 0.9}
                  strokeLinecap="round"
                />
              ))}
            </g>
            {/* eyes */}
            {([-1, 1] as const).map((side) => (
              <g key={side} transform={`translate(${150 + side * 28 * k + p.lookX} ${s.headY + 14 * k + p.lookY}) scale(${face.eye * k} ${face.eye * k * eyeOpen})`}>
                <ellipse rx={9.5} ry={13} fill={ink} />
                {eyeOpen > 0.5 && <circle cx={-3} cy={-5} r={3.5} fill="#fff" />}
              </g>
            ))}
            {who === 'pip' && <PipGlasses s={s} lookX={p.lookX * 0.4} />}
            {/* mouth */}
            <g transform={`translate(${150 + p.lookX * 0.6} ${s.headY + 48 * k + (who === 'tank' ? 10 : 0)})`}>
              <Mouth m={face.mouth} open={flap} k={k} />
            </g>
          </g>
          {armBFront && armBNode}
          {children}
        </g>
      </g>
    </svg>
  );
};
