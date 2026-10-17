// The Oz cast: paper puppets with real human proportions (never stick figures, even far away).
// Body landmarks are fractions of stature from anthropometric tables (Drillis & Contini):
// adult chin 0.87, shoulder 0.818, hip joint 0.53, knee 0.285, ankle 0.039;
// a ten-year-old is about six heads tall, so her head is bigger and her legs shorter.
// Every limb has two joints (shoulder/elbow, hip/knee), shaped hands and real boots.
import React from 'react';
import {random} from 'remotion';
import {Cut, Pt, ellipsePts} from '../paperkite/kit';
import {cutC, OZ} from './look';

export type Expr = 'calm' | 'smile' | 'worried' | 'scared' | 'amazed' | 'stern' | 'sad' | 'asleep';

export type Pose = {
  x: number;
  y: number; // ground point under the feet
  h: number; // stature in px (a 5'6" adult in a medium shot is about 700)
  flip?: boolean; // face left
  // joint angles in degrees. Arms: 0 hangs down, + swings forward. Elbow/knee: + bends naturally.
  shF?: number; elF?: number; shB?: number; elB?: number;
  hipF?: number; knF?: number; hipB?: number; knB?: number;
  lean?: number; // torso lean forward (+) about the hips
  head?: number; // head tilt, + looks down/forward
  bob?: number; // body raised (+) or lowered (-) in px of the 1000 rig
  expr?: Expr;
  blink?: boolean;
  talk?: number; // 0..1 mouth opening
  wind?: number; // 0..1 hair/skirt blown back
  look: Costume;
  shadow?: number;
};

export type Costume = {
  kind: 'adult' | 'child' | 'small';
  female?: boolean;
  skin: string;
  skinShade: string;
  hair: string;
  hairStyle: 'braids' | 'bun' | 'short' | 'white-long' | 'none';
  beard?: string; // long beard colour
  shirt: string; // torso / bodice
  sleeve?: string; // defaults to shirt
  shortSleeve?: boolean;
  skirt?: string; // a skirt instead of trousers
  skirtLen?: number; // 0..1 of hip-to-ankle (0.55 = just below the knee)
  apron?: string;
  collar?: string;
  trousers?: string;
  legs?: string; // stockings / trouser legs below the skirt
  boots: string;
  bootTop?: string; // coloured boot tops (Munchkins)
  hat?: 'brim' | 'point' | 'bonnet' | 'none';
  hatColor?: string;
  hatBand?: string;
  bells?: boolean;
  suspenders?: string;
  stars?: boolean;
  wrinkles?: boolean;
};

// Stature fractions. y is measured up from the ground (multiplied by -1 when drawn).
type Prop = {
  head: number; chin: number; shoulder: number; waist: number; hip: number; knee: number;
  upperArm: number; foreArm: number; hand: number; thigh: number; shin: number; foot: number;
  shW: number; hipW: number; neckW: number;
};
const ADULT_M: Prop = {head: 0.13, chin: 0.87, shoulder: 0.818, waist: 0.63, hip: 0.53, knee: 0.285, upperArm: 0.186, foreArm: 0.146, hand: 0.108, thigh: 0.245, shin: 0.246, foot: 0.152, shW: 0.25, hipW: 0.18, neckW: 0.06};
const ADULT_F: Prop = {...ADULT_M, shW: 0.22, hipW: 0.2, neckW: 0.05, waist: 0.62};
const CHILD: Prop = {head: 0.165, chin: 0.835, shoulder: 0.79, waist: 0.6, hip: 0.5, knee: 0.27, upperArm: 0.18, foreArm: 0.145, hand: 0.1, thigh: 0.23, shin: 0.23, foot: 0.15, shW: 0.23, hipW: 0.18, neckW: 0.055};
// Munchkins: grown-ups no taller than Dorothy, so adult build with a slightly larger head.
const SMALL: Prop = {...ADULT_M, head: 0.15, chin: 0.85, shoulder: 0.8, shW: 0.24};

const propsFor = (c: Costume) => (c.kind === 'child' ? CHILD : c.kind === 'small' ? SMALL : c.female ? ADULT_F : ADULT_M);

const R = 1000; // the rig is drawn at a stature of 1000 and scaled
const deg = Math.PI / 180;

// A tapered limb segment from (0,0) down to (0,len). Profile = [t, half-width] pairs.
const segPts = (len: number, prof: [number, number][]): Pt[] => {
  const right = prof.map(([t, w]) => [w, t * len] as Pt);
  const left = [...prof].reverse().map(([t, w]) => [-w, t * len] as Pt);
  return [...right, ...left];
};

const Hand: React.FC<{s: number; fill: string; seed: string}> = ({s, fill, seed}) => {
  // a relaxed hand in profile: palm, fingers together, thumb forward
  const pts: Pt[] = [
    [-0.17, 0], [0.18, 0], [0.24, 0.2], [0.34, 0.36], [0.31, 0.46], [0.2, 0.4], [0.19, 0.66], [0.13, 0.92], [0.0, 1.0], [-0.12, 0.9], [-0.19, 0.6], [-0.2, 0.25],
  ];
  return <Cut d={cutC(pts.map(([x, y]) => [x * s, y * s]), seed, 0.8, 10)} fill={fill} lift={1} edge={0.2} />;
};

const Boot: React.FC<{len: number; fill: string; top?: string; seed: string; h: number}> = ({len, fill, top, seed, h}) => {
  // ankle at (0,0); heel behind, toe forward, sole at y = h
  const pts: Pt[] = [
    [-0.32 * len, -0.5 * h], [0.22 * len, -0.5 * h], [0.26 * len, 0.1 * h], [0.6 * len, 0.38 * h], [0.76 * len, 0.62 * h], [0.78 * len, h], [-0.3 * len, h], [-0.36 * len, 0.6 * h],
  ];
  return (
    <>
      <Cut d={cutC(pts, seed, 0.9, 12)} fill={fill} lift={1} edge={0.18} />
      <rect x={-0.34 * len} y={h * 0.86} width={1.1 * len} height={h * 0.14} fill="rgba(0,0,0,0.35)" />
      {top && <Cut d={cutC([[-0.34 * len, -0.9 * h], [0.26 * len, -0.9 * h], [0.24 * len, -0.1 * h], [-0.34 * len, -0.1 * h]], seed + 't', 0.7, 10)} fill={top} lift={1} edge={0.2} />}
    </>
  );
};

type LimbSpec = {upper: number; lower: number; up: [number, number][]; lo: [number, number][]; fillUp: string; fillLo: string};

// Two-joint limb: rotate at the root, then at the middle joint.
const Limb2: React.FC<{a: number; b: number; spec: LimbSpec; seed: string; end: React.ReactNode; leg?: boolean}> = ({a, b, spec, seed, end, leg}) => (
  <g transform={`rotate(${-a})`}>
    <Cut d={cutC(segPts(spec.upper, spec.up), seed + 'u', 1.2, 16)} fill={spec.fillUp} lift={1} edge={0.22} />
    <g transform={`translate(0 ${spec.upper}) rotate(${leg ? b : -b})`}>
      <Cut d={cutC(segPts(spec.lower, spec.lo), seed + 'l', 1.2, 16)} fill={spec.fillLo} lift={1} edge={0.22} />
      <circle cx={0} cy={0} r={spec.lo[0][1] * 0.98} fill={spec.fillLo} />
      <g transform={`translate(0 ${spec.lower})`}>{end}</g>
    </g>
  </g>
);

// ---------- the head (three-quarter view, facing +x) ----------
const HEAD_PTS: Pt[] = [
  [-0.37, -0.02], [-0.36, -0.26], [-0.24, -0.45], [-0.02, -0.52], [0.2, -0.47], [0.32, -0.33], [0.36, -0.14], [0.37, -0.02],
  [0.43, 0.1], [0.37, 0.15], [0.36, 0.24], [0.34, 0.31], [0.3, 0.42], [0.18, 0.5], [0.02, 0.47], [-0.14, 0.34], [-0.22, 0.2], [-0.3, 0.12],
];

const Face: React.FC<{u: number; c: Costume; expr: Expr; blink?: boolean; talk: number}> = ({u, c, expr, blink, talk}) => {
  const P = (x: number, y: number) => `${(x * u).toFixed(1)} ${(y * u).toFixed(1)}`;
  const eyeR = expr === 'amazed' || expr === 'scared' ? 0.055 : 0.045;
  const closed = blink || expr === 'asleep';
  const brow: Record<Expr, [number, number]> = {calm: [0, -0.13], smile: [0, -0.14], worried: [10, -0.14], scared: [12, -0.17], amazed: [-4, -0.19], stern: [-12, -0.12], sad: [12, -0.13], asleep: [0, -0.12]};
  const [bRot, bY] = brow[expr];
  const ink = '#2B211B';
  const mouthOpen = Math.max(talk, expr === 'amazed' ? 0.7 : expr === 'scared' ? 0.55 : 0);
  return (
    <g>
      {/* ear */}
      <ellipse cx={-0.1 * u} cy={0.04 * u} rx={0.06 * u} ry={0.1 * u} fill={c.skinShade} />
      {/* cheek warmth */}
      <ellipse cx={0.22 * u} cy={0.17 * u} rx={0.08 * u} ry={0.05 * u} fill="#D9826E" opacity={c.kind === 'child' ? 0.45 : 0.22} />
      {/* eyes: near eye full, far eye narrower (three-quarter turn) */}
      {[
        [0.17, 1],
        [0.33, 0.62],
      ].map(([ex, k], i) =>
        closed ? (
          <path key={i} d={`M${P(ex - 0.05 * k, -0.02)} Q${P(ex, 0.02)} ${P(ex + 0.05 * k, -0.02)}`} stroke={ink} strokeWidth={0.014 * u} fill="none" strokeLinecap="round" />
        ) : (
          <g key={i}>
            <ellipse cx={ex * u} cy={-0.03 * u} rx={0.06 * k * u} ry={eyeR * u} fill="#F7F1E8" />
            <ellipse cx={(ex + 0.012) * u} cy={-0.03 * u} rx={0.032 * k * u} ry={0.038 * u} fill="#3C2A1E" />
            <circle cx={(ex + 0.02) * u} cy={-0.045 * u} r={0.009 * u} fill="#fff" />
          </g>
        ),
      )}
      {/* brows */}
      {[0.17, 0.33].map((ex, i) => (
        <path key={i} d={`M${P(ex - 0.06, bY)} L${P(ex + 0.05, bY - 0.01)}`} stroke={c.hair === '#F2EEE6' ? '#B9B3AA' : c.beard ?? c.hair} strokeWidth={0.024 * u} strokeLinecap="round" transform={`rotate(${i ? -bRot : bRot} ${ex * u} ${bY * u})`} />
      ))}
      {/* nose shading line */}
      <path d={`M${P(0.39, -0.02)} Q${P(0.42, 0.08)} ${P(0.36, 0.12)}`} stroke={c.skinShade} strokeWidth={0.016 * u} fill="none" />
      {/* mouth */}
      {mouthOpen > 0.05 ? (
        <ellipse cx={0.3 * u} cy={0.26 * u} rx={0.05 * u} ry={(0.015 + mouthOpen * 0.045) * u} fill="#5A2620" />
      ) : expr === 'smile' ? (
        <path d={`M${P(0.24, 0.24)} Q${P(0.3, 0.3)} ${P(0.35, 0.23)}`} stroke="#8A3B30" strokeWidth={0.02 * u} fill="none" strokeLinecap="round" />
      ) : expr === 'worried' || expr === 'sad' || expr === 'stern' ? (
        <path d={`M${P(0.24, 0.28)} Q${P(0.3, 0.24)} ${P(0.35, 0.28)}`} stroke="#8A3B30" strokeWidth={0.018 * u} fill="none" strokeLinecap="round" />
      ) : (
        <path d={`M${P(0.25, 0.26)} L${P(0.34, 0.26)}`} stroke="#8A3B30" strokeWidth={0.018 * u} strokeLinecap="round" />
      )}
      {c.wrinkles && (
        <g stroke={c.skinShade} strokeWidth={0.012 * u} fill="none" strokeLinecap="round">
          <path d={`M${P(0.04, -0.2)} L${P(0.26, -0.21)}`} />
          <path d={`M${P(0.06, -0.25)} L${P(0.24, -0.26)}`} />
          <path d={`M${P(0.33, 0.14)} Q${P(0.27, 0.22)} ${P(0.26, 0.32)}`} />
          <path d={`M${P(0.06, 0.02)} L${P(0.1, 0.06)}`} />
        </g>
      )}
    </g>
  );
};

const HairBack: React.FC<{u: number; c: Costume; wind: number; t: number}> = ({u, c, wind, t}) => {
  const k = (pts: Pt[]) => pts.map(([x, y]) => [x * u, y * u] as Pt);
  const sway = Math.sin(t * 2.4) * 3 + wind * 22;
  switch (c.hairStyle) {
    case 'braids':
      // two braids hanging behind the ear, tied with ribbons, swinging with the wind
      return (
        <g>
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${(-0.18 - i * 0.1) * u} ${0.08 * u}) rotate(${sway + i * 6})`}>
              {Array.from({length: 5}, (_, j) => (
                <Cut key={j} d={cutC(ellipsePts(0, (0.06 + j * 0.1) * u, 0.055 * u, 0.065 * u, 12), `br${i}${j}`, 0.5, 8)} fill={c.hair} lift={1} edge={0.12} />
              ))}
              <Cut d={cutC(k([[-0.07, 0.52], [0.07, 0.52], [0.09, 0.6], [-0.09, 0.6]]), `rib${i}`, 0.4, 8)} fill="#2E5FA8" lift={1} edge={0.2} />
            </g>
          ))}
        </g>
      );
    case 'bun':
      return <Cut d={cutC(ellipsePts(-0.34 * u, -0.22 * u, 0.15 * u, 0.13 * u, 14), 'bun', 0.6, 8)} fill={c.hair} lift={1} edge={0.15} />;
    case 'white-long':
      return <Cut d={cutC(k([[-0.38, -0.3], [-0.46, 0.1], [-0.42, 0.55], [-0.2, 0.62], [-0.1, 0.2]]), 'whl', 1, 10)} fill={c.hair} lift={1} edge={0.15} />;
    default:
      return null;
  }
};

const HairFront: React.FC<{u: number; c: Costume}> = ({u, c}) => {
  const k = (pts: Pt[]) => pts.map(([x, y]) => [x * u, y * u] as Pt);
  if (c.hairStyle === 'none') return null;
  const cap: Pt[] =
    c.hairStyle === 'short'
      ? [[-0.38, 0.02], [-0.38, -0.3], [-0.24, -0.5], [0.02, -0.55], [0.24, -0.48], [0.34, -0.3], [0.2, -0.36], [-0.02, -0.34], [-0.2, -0.24], [-0.24, 0.0]]
      : [[-0.4, 0.08], [-0.4, -0.3], [-0.26, -0.5], [0.0, -0.56], [0.24, -0.5], [0.36, -0.32], [0.3, -0.24], [0.12, -0.34], [-0.04, -0.3], [-0.2, -0.18], [-0.24, 0.06]];
  return <Cut d={cutC(k(cap), 'hcap' + c.hairStyle, 0.9, 10)} fill={c.hair} lift={1} edge={0.15} />;
};

const Hat: React.FC<{u: number; c: Costume; wind: number; bellT: number}> = ({u, c, wind, bellT}) => {
  const k = (pts: Pt[]) => pts.map(([x, y]) => [x * u, y * u] as Pt);
  const col = c.hatColor ?? '#555';
  if (c.hat === 'brim')
    return (
      <g transform={`rotate(${-4 - wind * 6} 0 ${-0.4 * u})`}>
        <Cut d={cutC(k([[-0.3, -0.42], [-0.26, -0.7], [-0.06, -0.78], [0.2, -0.74], [0.3, -0.44]]), 'crown', 0.8, 10)} fill={col} lift={2} />
        {c.hatBand && <rect x={-0.29 * u} y={-0.52 * u} width={0.6 * u} height={0.07 * u} fill={c.hatBand} />}
        <Cut d={cutC(k([[-0.62, -0.4], [-0.3, -0.47], [0.3, -0.47], [0.66, -0.4], [0.62, -0.35], [0.0, -0.38], [-0.58, -0.35]]), 'brim', 0.8, 10)} fill={col} lift={2} />
      </g>
    );
  if (c.hat === 'point') {
    // round hat rising to a small point "a foot above their heads", bells around the brim
    const bells = c.bells ? [-0.5, -0.28, -0.04, 0.2, 0.44] : [];
    return (
      <g>
        <Cut d={cutC(k([[-0.36, -0.4], [-0.24, -0.9], [-0.06, -1.6], [0.02, -1.62], [0.16, -0.9], [0.34, -0.4]]), 'pcone' + col, 0.8, 10)} fill={col} lift={2} />
        <Cut d={cutC(k([[-0.6, -0.36], [-0.34, -0.46], [0.34, -0.46], [0.62, -0.36], [0.5, -0.3], [-0.5, -0.3]]), 'pbrim' + col, 0.8, 10)} fill={col} lift={2} />
        {bells.map((bx, i) => (
          <g key={i} transform={`translate(${bx * u} ${-0.3 * u}) rotate(${Math.sin(bellT * 9 + i) * 14})`}>
            <line x1={0} y1={0} x2={0} y2={0.05 * u} stroke="#7A6A3A" strokeWidth={0.01 * u} />
            <circle cx={0} cy={0.08 * u} r={0.035 * u} fill="#E8C04A" stroke="#9C7A22" strokeWidth={0.008 * u} />
          </g>
        ))}
      </g>
    );
  }
  if (c.hat === 'bonnet')
    return (
      <g transform={`rotate(${-wind * 8} 0 0)`}>
        <Cut d={cutC(k([[-0.46, 0.2], [-0.46, -0.36], [-0.28, -0.6], [0.1, -0.66], [0.44, -0.52], [0.56, -0.24], [0.4, -0.3], [0.1, -0.42], [-0.2, -0.3], [-0.28, 0.2]]), 'bonnet', 0.8, 10)} fill={col} lift={2} />
        <path d={`M${0.0 * u} ${0.0 * u} Q${0.1 * u} ${0.4 * u} ${0.18 * u} ${0.5 * u}`} stroke={col} strokeWidth={0.04 * u} fill="none" />
      </g>
    );
  return null;
};

// ---------- the person ----------
export const Person: React.FC<Pose & {t?: number}> = (p) => {
  const c = p.look;
  const P = propsFor(c);
  const t = p.t ?? 0;
  const s = p.h / R;
  const u = P.head * R; // head height in rig units
  const yChin = -P.chin * R;
  const yHead = yChin - u / 2; // head centre
  const yShoulder = -P.shoulder * R;
  const yHip = -P.hip * R;
  const yWaist = -P.waist * R;
  const shW = P.shW * R;
  const hipW = P.hipW * R;
  const wind = p.wind ?? 0;
  const sleeve = c.sleeve ?? c.shirt;
  const legFill = c.legs ?? c.trousers ?? '#3A3530';
  const thighFill = c.trousers ?? legFill;
  const female = !!c.female || c.kind === 'child';

  const armSpec: LimbSpec = {
    upper: P.upperArm * R,
    lower: P.foreArm * R,
    up: [[0, shW * 0.2], [0.5, shW * 0.17], [1, shW * 0.14]],
    lo: [[0, shW * 0.13], [0.3, shW * 0.135], [1, shW * 0.09]],
    fillUp: sleeve,
    fillLo: c.shortSleeve ? c.skin : sleeve,
  };
  const legSpec: LimbSpec = {
    upper: P.thigh * R,
    lower: P.shin * R,
    up: [[0, hipW * 0.36], [0.6, hipW * 0.3], [1, hipW * 0.22]],
    lo: [[0, hipW * 0.21], [0.28, hipW * 0.24], [0.8, hipW * 0.14], [1, hipW * 0.12]],
    fillUp: thighFill,
    fillLo: legFill,
  };
  const bootH = 0.039 * R + 6;
  const hand = (seed: string) => <Hand s={P.hand * R} fill={c.skin} seed={seed} />;
  const boot = (seed: string) => <Boot len={P.foot * R} h={bootH} fill={c.boots} top={c.bootTop} seed={seed} />;

  const shF = p.shF ?? 4;
  const raised = shF > 120;
  const frontArm = (
    <g transform={`translate(${shW * 0.08} ${yShoulder + u * 0.12})`}>
      <Limb2 a={shF} b={p.elF ?? 10} spec={armSpec} seed="aF" end={hand('hF')} />
    </g>
  );

  // skirt hem follows the legs a little and blows back in the wind
  const skirtLen = c.skirtLen ?? 0.6;
  const hemY = yHip + (yHip - -0.039 * R) * -skirtLen;
  const legSwing = ((p.hipF ?? 0) + (p.hipB ?? 0)) / 2;
  const hemShift = Math.sin(legSwing * deg) * 40 - wind * 70;
  const hemW = hipW * (c.kind === 'child' ? 1.25 : 1.05);

  // torso: sloped trapezius into rounded shoulders, chest, a waist, then hips (or the bodice ends at the waist)
  const yNeckB = yShoulder - u * 0.22;
  const nk = P.neckW * R;
  const yBottom = c.skirt ? yWaist + 6 : yHip + 30;
  const chest = c.kind === 'child' ? 0.4 : female ? 0.42 : 0.44;
  const torso: Pt[] = [
    [-nk * 0.8, yNeckB], [nk * 0.9, yNeckB], [shW * 0.3, yShoulder - u * 0.1], [shW * 0.44, yShoulder + u * 0.02], [shW * 0.47, yShoulder + u * 0.25],
    [shW * chest, yShoulder + u * 0.75], [hipW * 0.4, yWaist], [hipW * 0.5, yBottom], [-hipW * 0.5, yBottom], [-hipW * 0.42, yWaist],
    [-shW * 0.44, yShoulder + u * 0.75], [-shW * 0.47, yShoulder + u * 0.25], [-shW * 0.42, yShoulder + u * 0.0], [-shW * 0.28, yShoulder - u * 0.12],
  ];
  const skirt: Pt[] = [
    [-hipW * 0.46, yWaist], [hipW * 0.46, yWaist], [hipW * 0.6, yHip], [hemW / 2 + hemShift, hemY], [-hemW / 2 + hemShift * 1.3, hemY + 8], [-hipW * 0.62, yHip],
  ];

  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${(p.flip ? -1 : 1) * s} ${s})`}>
      {(p.shadow ?? 1) > 0 && <ellipse cx={0} cy={4} rx={190} ry={26} fill="rgba(30,20,10,0.22)" opacity={p.shadow ?? 1} />}
      <g transform={`translate(0 ${-(p.bob ?? 0)}) rotate(${p.lean ?? 0} 0 ${yHip})`}>
        {/* back arm and leg (a little darker: they're in the body's shadow) */}
        <g filter="url(#shade)">
          <g transform={`translate(${-shW * 0.1} ${yShoulder + u * 0.12})`}>
            <Limb2 a={p.shB ?? -4} b={p.elB ?? 10} spec={armSpec} seed="aB" end={hand('hB')} />
          </g>
          <g transform={`translate(${-hipW * 0.12} ${yHip})`}>
            <Limb2 a={p.hipB ?? 0} b={p.knB ?? 2} spec={legSpec} seed="lB" end={boot('bB')} leg />
          </g>
        </g>
        {/* front leg */}
        <g transform={`translate(${hipW * 0.12} ${yHip})`}>
          <Limb2 a={p.hipF ?? 0} b={p.knF ?? 2} spec={legSpec} seed="lF" end={boot('bF')} leg />
        </g>
        {/* trousers: hips */}
        {!c.skirt && <Cut d={cutC([[-hipW * 0.5, yWaist], [hipW * 0.5, yWaist], [hipW * 0.52, yHip + 20], [-hipW * 0.52, yHip + 20]], 'hips', 1, 14)} fill={c.trousers ?? '#4A4038'} lift={1} />}
        {/* skirt over the thighs */}
        {c.skirt && <Cut d={cutC(skirt, 'skirt' + c.skirt, 1.4, 18)} fill={c.skirt} lift={2} />}
        {c.apron && <Cut d={cutC([[hipW * 0.02, yWaist + 4], [hipW * 0.52, yWaist + 4], [hipW * 0.62 + hemShift * 0.5, hemY - 40], [hipW * 0.04 + hemShift * 0.6, hemY - 30]], 'apron', 1.1, 16)} fill={c.apron} lift={2} />}
        {/* neck */}
        <Cut d={cutC([[-P.neckW * R * 0.5, yChin + 10], [P.neckW * R * 0.6, yChin + 10], [P.neckW * R * 0.75, yNeckB + 20], [-P.neckW * R * 0.75, yNeckB + 20]], 'neck', 0.8, 10)} fill={c.skinShade} lift={1} edge={0} />
        {/* torso */}
        <Cut d={cutC(torso, 'torso' + c.shirt, 1.4, 18)} fill={c.shirt} lift={2} />
        {c.suspenders && (
          <g stroke={c.suspenders} strokeWidth={14} strokeLinecap="round">
            <line x1={shW * 0.18} y1={yShoulder} x2={hipW * 0.28} y2={yWaist + 10} />
            <line x1={-shW * 0.1} y1={yShoulder} x2={-hipW * 0.08} y2={yWaist + 10} />
          </g>
        )}
        {c.stars &&
          Array.from({length: 14}, (_, i) => (
            <circle key={i} cx={(random(`st${i}`) - 0.5) * hipW * 1.1} cy={yShoulder + 40 + random(`sy${i}`) * (hemY - yShoulder - 60)} r={5} fill="#E9D98A" />
          ))}
        {c.collar && <Cut d={cutC([[-nk * 1.3, yNeckB - 4], [nk * 1.5, yNeckB - 4], [nk * 2.2, yNeckB + u * 0.2], [-nk * 1.9, yNeckB + u * 0.2]], 'collar', 0.8, 10)} fill={c.collar} lift={1} edge={0.3} />}
        {raised && frontArm}
        {/* head */}
        <g transform={`translate(${u * 0.02} ${yHead}) rotate(${p.head ?? 0} 0 ${u * 0.45})`}>
          <HairBack u={u} c={c} wind={wind} t={t} />
          <Cut d={cutC(HEAD_PTS.map(([x, y]) => [x * u, y * u] as Pt), 'head' + c.kind + (female ? 'f' : 'm'), 0.9, 10)} fill={c.skin} lift={2} />
          <Face u={u} c={c} expr={p.expr ?? 'calm'} blink={p.blink} talk={p.talk ?? 0} />
          {c.beard && <Cut d={cutC([[0.02 * u, 0.12 * u], [0.28 * u, 0.2 * u], [0.4 * u, 0.32 * u], [0.36 * u, 0.7 * u], [0.22 * u, 1.05 * u], [0.06 * u, 0.9 * u], [-0.14 * u, 0.42 * u], [-0.2 * u, 0.16 * u]], 'beard', 1, 10)} fill={c.beard} lift={1} edge={0.2} />}
          {c.beard && <path d={`M${0.26 * u} ${0.26 * u} L${0.36 * u} ${0.26 * u}`} stroke="#4A2A22" strokeWidth={0.02 * u} strokeLinecap="round" />}
          <HairFront u={u} c={c} />
          <Hat u={u} c={c} wind={wind} bellT={t} />
        </g>
        {!raised && frontArm}
      </g>
    </g>
  );
};

// ---------- motion helpers (all poses are driven by the stepped time) ----------
export type Gait = Partial<Pose>;
export const walkCycle = (t: number, speed = 1, stride = 1): Gait => {
  const ph = t * Math.PI * 2 * 0.9 * speed;
  const sw = Math.sin(ph);
  return {
    hipF: sw * 24 * stride,
    hipB: -sw * 24 * stride,
    knF: Math.max(0, -Math.cos(ph)) * 34 * stride + 4,
    knB: Math.max(0, Math.cos(ph)) * 34 * stride + 4,
    shF: -sw * 18 * stride,
    shB: sw * 18 * stride,
    elF: 14,
    elB: 14,
    bob: Math.abs(Math.cos(ph)) * 10 * stride,
  };
};
export const runCycle = (t: number, speed = 1): Gait => {
  const ph = t * Math.PI * 2 * 1.5 * speed;
  const sw = Math.sin(ph);
  return {
    hipF: sw * 42,
    hipB: -sw * 42,
    knF: Math.max(0, -Math.cos(ph)) * 70 + 20,
    knB: Math.max(0, Math.cos(ph)) * 70 + 20,
    shF: -sw * 46,
    shB: sw * 46,
    elF: 80,
    elB: 80,
    lean: 12,
    bob: Math.abs(Math.cos(ph)) * 22,
  };
};
export const blinkAt = (t: number, off = 0) => ((t + off) % 3.7) < 0.12;

// ---------- Toto: a little black dog with long silky hair ----------
export const Toto: React.FC<{x: number; y: number; h: number; flip?: boolean; t: number; run?: number; bark?: number; sit?: boolean}> = ({x, y, h, flip, t, run = 0, bark = 0, sit}) => {
  const s = h / 100; // rig: 100 tall at the shoulder
  const ph = t * Math.PI * 2 * 2.6;
  const legA = (i: number) => (run ? Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? 0.6 : 0)) * 34 * run : 0);
  const black = '#16130F';
  const sheen = '#3B352E';
  const legs: [number, number][] = [
    [26, 0], [32, 1], [-30, 2], [-24, 3],
  ];
  const tail = Math.sin(t * 14) * 18;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={2} rx={60} ry={9} fill="rgba(30,20,10,0.22)" />
      <g transform={`translate(0 ${run ? -Math.abs(Math.sin(ph)) * 8 : 0})`}>
        {!sit &&
          legs.map(([lx, i]) => (
            <g key={i} transform={`translate(${lx} -40) rotate(${legA(i)})`}>
              <Cut d={cutC([[-8, 0], [8, 0], [7, 40], [12, 44], [-8, 44]], `tl${i}`, 0.8, 8)} fill={i % 2 ? sheen : black} lift={1} edge={0.12} />
            </g>
          ))}
        {/* shaggy body */}
        <Cut d={cutC([[-52, -70], [-20, -82], [30, -80], [52, -62], [50, -34], [40, -26], [30, -34], [16, -22], [0, -32], [-14, -22], [-30, -32], [-44, -24], [-54, -44]], 'tbody', 3, 8)} fill={black} lift={2} edge={0.14} />
        <g transform={`translate(-50 -66) rotate(${-30 + tail})`}>
          <Cut d={cutC([[0, 0], [-34, -16], [-40, -6], [-30, 6]], 'ttail', 2, 6)} fill={black} lift={1} edge={0.12} />
        </g>
        {/* head */}
        <g transform={`translate(54 -84) rotate(${bark ? -8 * bark : 0})`}>
          <Cut d={cutC([[-22, -14], [0, -24], [22, -18], [34, -6], [44, 0], [42, 10], [26, 14], [6, 18], [-16, 12]], 'thead', 1.6, 6)} fill={black} lift={2} edge={0.14} />
          <Cut d={cutC([[-12, -16], [-4, -20], [0, 10], [-10, 26], [-20, 14]], 'tear', 2, 6)} fill={sheen} lift={1} edge={0.1} />
          <circle cx={46} cy={2} r={5} fill="#000" />
          <circle cx={18} cy={-6} r={4.5} fill="#E9E1D4" />
          <circle cx={19} cy={-6} r={2.6} fill="#000" />
          <circle cx={20} cy={-7} r={1} fill="#fff" />
          {bark > 0.2 && <path d="M40 10 L28 22 L22 14 Z" fill="#7A2E28" />}
        </g>
      </g>
    </g>
  );
};
