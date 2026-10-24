// The cut-out cast: a kid rigged at the joints (like a paper puppet with split pins), the red kite, birds.
import React from 'react';
import {C, Cut, cut, ellipsePts, Pt, rectPts} from './kit';

export type Expr = 'happy' | 'neutral' | 'worried' | 'shocked' | 'joy';

export type KidPose = {
  x: number;
  y: number; // feet
  scale?: number;
  flip?: boolean; // face left
  armBack?: number; // degrees, 0 = hanging down, negative = forward/up
  armFront?: number;
  legBack?: number;
  legFront?: number;
  lean?: number;
  headTilt?: number;
  expr?: Expr;
  blink?: boolean;
  hairBlow?: number; // 0..1
  bob?: number;
};

const SHOULDER: Pt = [0, -268];
const ARM_LEN = 118;
const HIP_Y = -150;

// Where the front hand is, in scene coordinates (for attaching the kite string).
export const handPos = (p: KidPose, which: 'front' | 'back' = 'front'): Pt => {
  const s = p.scale ?? 1;
  const a = (((which === 'front' ? p.armFront : p.armBack) ?? 0) * Math.PI) / 180;
  const lean = ((p.lean ?? 0) * Math.PI) / 180;
  // hand in body space
  let hx = SHOULDER[0] - Math.sin(a) * ARM_LEN;
  let hy = SHOULDER[1] + Math.cos(a) * ARM_LEN;
  // lean rotates about the hips
  const ry = hy - HIP_Y;
  const lx = hx * Math.cos(lean) - ry * Math.sin(lean);
  const ly = hx * Math.sin(lean) + ry * Math.cos(lean) + HIP_Y;
  hx = lx;
  hy = ly - (p.bob ?? 0);
  const dir = p.flip ? -1 : 1;
  return [p.x + hx * s * dir, p.y + hy * s];
};

const Limb: React.FC<{x: number; y: number; angle: number; len: number; w: number; fill: string; seed: string; end?: React.ReactNode}> = ({
  x,
  y,
  angle,
  len,
  w,
  fill,
  seed,
  end,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <Cut d={cut(rectPts(-w / 2, -w / 2, w, len + w / 2), seed, 1.1, 14)} fill={fill} lift={1} edge={0.25} />
    {end}
  </g>
);

const Mouth: React.FC<{expr: Expr}> = ({expr}) => {
  const mx = 44;
  const my = -318;
  switch (expr) {
    case 'shocked':
      return <ellipse cx={mx} cy={my + 2} rx={9} ry={13} fill={C.ink} />;
    case 'worried':
      return <path d={`M${mx - 12} ${my + 4} Q${mx} ${my - 5} ${mx + 10} ${my + 4}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
    case 'neutral':
      return <path d={`M${mx - 10} ${my} L${mx + 10} ${my}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />;
    case 'joy':
      return <path d={`M${mx - 16} ${my - 6} Q${mx} ${my + 22} ${mx + 14} ${my - 6} Z`} fill={C.ink} />;
    default:
      return <path d={`M${mx - 14} ${my - 4} Q${mx} ${my + 12} ${mx + 12} ${my - 4}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
  }
};

const BROW: Record<Expr, [number, number]> = {
  happy: [0, -364],
  neutral: [0, -362],
  worried: [-14, -366],
  shocked: [6, -376],
  joy: [4, -368],
};

export const Kid: React.FC<KidPose & {holding?: React.ReactNode}> = (p) => {
  const s = p.scale ?? 1;
  const expr = p.expr ?? 'happy';
  const [browRot, browY] = BROW[expr];
  const blow = p.hairBlow ?? 0;
  const shoe = (seed: string) => <Cut d={cut(ellipsePts(10, ARM_LEN + 18, 26, 13), seed, 0.8)} fill={C.ink} lift={1} edge={0.15} />;
  const armUp = (p.armFront ?? 0) < -95;
  const frontArm = (
    <Limb x={SHOULDER[0] + 4} y={SHOULDER[1] + 8} angle={p.armFront ?? 0} len={ARM_LEN} w={30} fill={C.shirt} seed="armF" end={<Cut d={cut(ellipsePts(0, ARM_LEN, 15, 15, 12), 'handF', 0.6)} fill={C.skin} lift={1} edge={0.2} />} />
  );
  const hand = (seed: string) => <Cut d={cut(ellipsePts(0, ARM_LEN, 15, 15, 12), seed, 0.6)} fill={C.skin} lift={1} edge={0.2} />;
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${(p.flip ? -1 : 1) * s} ${s})`}>
      {/* ground shadow */}
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="rgba(43,29,16,0.16)" />
      <g transform={`translate(0 ${-(p.bob ?? 0)}) rotate(${p.lean ?? 0} 0 ${HIP_Y})`}>
        {/* back arm + leg */}
        <Limb x={SHOULDER[0] - 6} y={SHOULDER[1] + 6} angle={p.armBack ?? 0} len={ARM_LEN} w={30} fill="#5E6A72" seed="armB" end={hand('handB')} />
        <Limb x={-8} y={HIP_Y} angle={p.legBack ?? 0} len={ARM_LEN} w={34} fill="#45403A" seed="legB" end={shoe('shoeB')} />
        {/* body */}
        <Cut d={cut([[-44, -128], [46, -128], [40, -170], [-40, -170]], 'shorts', 1.2, 14)} fill={C.pants} lift={1} />
        <Cut d={cut([[-48, -158], [50, -158], [42, -284], [-40, -284]], 'shirt', 1.4, 14)} fill={C.shirt} lift={2} />
        <Cut d={cut(rectPts(-46, -214, 96, 16), 'stripe', 1, 14)} fill="#E3DCCD" lift={1} edge={0} />
        {/* front leg */}
        <Limb x={8} y={HIP_Y} angle={p.legFront ?? 0} len={ARM_LEN} w={34} fill={C.pants} seed="legF" end={shoe('shoeF')} />
        {armUp && frontArm}
        {/* head */}
        <g transform={`rotate(${p.headTilt ?? 0} 0 -290)`}>
          <Cut d={cut(ellipsePts(8, -338, 66, 70), 'head', 1.2)} fill={C.skin} lift={2} />
          <Cut d={cut(ellipsePts(-20, -334, 13, 17, 12), 'ear', 0.8)} fill="#DCC3AD" lift={1} edge={0.2} />
          {/* hair: cap + a tuft that blows in the wind */}
          <Cut
            d={cut([[-58, -330], [-62, -372], [-40, -404], [0, -414], [44, -404], [70, -378], [62, -360], [20, -376], [-18, -366], [-36, -346]], 'hair', 1.4, 12)}
            fill={C.hair}
            lift={1}
          />
          <g transform={`rotate(${-12 - blow * 26} 10 -408)`}>
            <Cut d={cut([[0, -404], [-18, -440], [12, -428], [24, -452], [30, -410]], 'tuft', 1, 10)} fill={C.hair} lift={1} edge={0.1} />
          </g>
          {/* eye, brow, cheek, mouth */}
          {p.blink ? (
            <path d="M30 -344 Q38 -338 46 -344" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
          ) : (
            <ellipse cx={38} cy={-345} rx={expr === 'shocked' ? 8 : 6.5} ry={expr === 'shocked' ? 11 : 9} fill={C.ink} />
          )}
          <path d={`M26 ${browY} L50 ${browY}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${browRot} 38 ${browY})`} />
          <ellipse cx={30} cy={-318} rx={13} ry={9} fill={C.cheek} opacity={0.55} />
          <Mouth expr={expr} />
        </g>
        {/* front arm: in front of the body, but tucked behind the head when raised so it never covers the face */}
        {!armUp && frontArm}
      </g>
      {p.holding}
    </g>
  );
};

// Walk / run cycles, driven by the stepped frame.
export const walk = (f: number, speed = 0.22, amp = 24) => {
  const ph = f * speed;
  return {
    legFront: Math.sin(ph) * amp,
    legBack: -Math.sin(ph) * amp,
    armFront: -Math.sin(ph) * amp * 0.8,
    armBack: Math.sin(ph) * amp * 0.8,
    bob: Math.abs(Math.sin(ph)) * (amp / 4),
  };
};

export const blinkAt = (f: number, offset = 0) => (f + offset) % 70 < 3;

// ---------- the kite ----------
export const Kite: React.FC<{x: number; y: number; rot?: number; scale?: number; f: number; tail?: number; tailDir?: number}> = ({
  x,
  y,
  rot = 0,
  scale = 1,
  f,
  tail = 1,
  tailDir = 0,
}) => {
  // tail: a wavy line with paper bows, flowing down and away from the wind
  const segs = 7;
  const pts: Pt[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    pts.push([Math.sin(f * 0.35 - i * 0.9) * 18 * t * tail - tailDir * i * 22, 150 + i * 44]);
  }
  const tailD = 'M0 120 ' + pts.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path d={tailD} stroke={C.ink} strokeWidth={3} fill="none" filter="url(#lift2)" />
      {pts.slice(1).filter((_, i) => i % 2 === 0).map((p, i) => (
        <g key={i} transform={`translate(${p[0]} ${p[1]}) rotate(${Math.sin(f * 0.4 + i) * 20})`}>
          <Cut d={cut([[-20, -11], [0, 0], [-20, 11]], `bowL${i}`, 0.6, 10)} fill={C.accent} lift={2} edge={0.2} />
          <Cut d={cut([[20, -11], [0, 0], [20, 11]], `bowR${i}`, 0.6, 10)} fill={C.accentDark} lift={2} edge={0.2} />
        </g>
      ))}
      {/* two-tone diamond, like folded paper */}
      <Cut d={cut([[0, -120], [-84, -30], [0, 130]], 'kiteL', 1.2, 18)} fill={C.accent} lift={3} />
      <Cut d={cut([[0, -120], [84, -30], [0, 130]], 'kiteR', 1.2, 18)} fill={C.accentDark} lift={3} />
      <Cut d={cut(ellipsePts(0, -18, 26, 26, 14), 'kiteDot', 0.8)} fill="#F4E6D6" lift={1} edge={0} />
      <path d="M0 -120 L0 130 M-84 -30 L84 -30" stroke="#5A2A1E" strokeWidth={3.5} opacity={0.55} />
    </g>
  );
};

// A curved kite string between two points (sags under its own weight).
export const KiteString: React.FC<{from: Pt; to: Pt; sag?: number; opacity?: number}> = ({from, to, sag = 60, opacity = 1}) => {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2 + sag;
  return <path d={`M${from[0]} ${from[1]} Q${mx} ${my} ${to[0]} ${to[1]}`} stroke={C.ink} strokeWidth={2.6} fill="none" opacity={opacity} />;
};

// Paper bird: two wings flapping on twos.
export const Bird: React.FC<{x: number; y: number; f: number; scale?: number; seed: string; color?: string}> = ({x, y, f, scale = 1, seed, color = C.ink}) => {
  const up = Math.floor(f / 4) % 2 === 0;
  const a = up ? -28 : 18;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g transform={`rotate(${a})`}>
        <Cut d={cut([[0, 0], [-46, -6], [-30, 8]], `${seed}l`, 0.6, 12)} fill={color} lift={2} edge={0} />
      </g>
      <g transform={`rotate(${-a})`}>
        <Cut d={cut([[0, 0], [46, -6], [30, 8]], `${seed}r`, 0.6, 12)} fill={color} lift={2} edge={0} />
      </g>
      <ellipse cx={0} cy={2} rx={8} ry={6} fill={color} />
    </g>
  );
};
