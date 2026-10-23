import React from 'react';
import {random, useCurrentFrame} from 'remotion';

// The recurring time-traveler. One SVG, drawn in a 300 x 520 box with the feet at the
// bottom centre. Everything that moves (blink, breath, sway, talking, the watch glitch)
// comes from the current frame, so a render always looks the same.

export type Expression = 'neutral' | 'happy' | 'surprised' | 'worried' | 'scared' | 'determined' | 'cold';
export type Costume = 'none' | 'iceAge' | 'rome' | 'egypt';
export type Pose = 'idle' | 'wave' | 'point' | 'panic' | 'shiver' | 'checkWatch';

export type TimeTravelerProps = {
  expression?: Expression;
  costume?: Costume;
  pose?: Pose;
  /** Blend from this pose into `pose` as poseProgress goes 0 -> 1 (6-10 frames looks natural). */
  fromPose?: Pose;
  poseProgress?: number;
  talking?: boolean;
  watchGlitch?: boolean;
  /** Mirror left/right. */
  flip?: boolean;
  /** Height on screen in px. */
  size?: number;
  /** Seeds the blink timing so two characters on screen don't blink together. */
  seed?: string;
  style?: React.CSSProperties;
};

// Locked design values. The Ice Age art matches these line weights.
export const TT = {
  viewW: 300,
  viewH: 520,
  line: 8, // outline width in the 520-high box
  ink: '#2a1b12',
  skin: '#ffffff',
  skinShade: '#e6ebf1',
  hair: '#4a2e1c',
  hairLight: '#6e4630',
  hoodie: '#f6c443',
  hoodieShade: '#dfa52a',
  pants: '#34405e',
  shoe: '#2f2f38',
  sole: '#f2f2f2',
  pack: '#8a5a33',
  packDark: '#6b4325',
  watch: '#2d6cdf',
  watchFace: '#8fdcff',
  blush: '#ff9a9a',
} as const;

/** Outline width in screen px for a character drawn `size` px tall. */
export const ttLineAt = (size: number) => (TT.line * size) / TT.viewH;

const {ink, line: LW} = TT;

// ---------- arms ----------
// Angles in degrees. 0 = hanging straight down, positive = swinging away from the body.
// `elbow` is added to the upper-arm angle for the forearm.
type ArmPose = {upper: number; elbow: number};
type PoseDef = {a: ArmPose; b: ArmPose; headTilt: number; lookX: number; lookY: number};

const POSES: Record<Pose, PoseDef> = {
  idle: {a: {upper: 12, elbow: -10}, b: {upper: 12, elbow: -10}, headTilt: 0, lookX: 0, lookY: 0},
  wave: {a: {upper: 12, elbow: -10}, b: {upper: 145, elbow: 35}, headTilt: -4, lookX: 0, lookY: 0},
  point: {a: {upper: 10, elbow: -8}, b: {upper: 92, elbow: 0}, headTilt: -3, lookX: 3, lookY: 0},
  panic: {a: {upper: 150, elbow: 30}, b: {upper: 150, elbow: 30}, headTilt: 0, lookX: 0, lookY: -1},
  shiver: {a: {upper: -8, elbow: -105}, b: {upper: -8, elbow: -105}, headTilt: 0, lookX: 0, lookY: 1},
  checkWatch: {a: {upper: 38, elbow: -118}, b: {upper: 12, elbow: -10}, headTilt: -9, lookX: -3, lookY: 4},
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixPose = (p: PoseDef, q: PoseDef, t: number): PoseDef => ({
  a: {upper: lerp(p.a.upper, q.a.upper, t), elbow: lerp(p.a.elbow, q.a.elbow, t)},
  b: {upper: lerp(p.b.upper, q.b.upper, t), elbow: lerp(p.b.elbow, q.b.elbow, t)},
  headTilt: lerp(p.headTilt, q.headTilt, t),
  lookX: lerp(p.lookX, q.lookX, t),
  lookY: lerp(p.lookY, q.lookY, t),
});

const UPPER = 60;
const FORE = 54;
const rad = (d: number) => (d * Math.PI) / 180;

/** Shoulder, elbow and wrist points. side -1 = viewer's left arm (wears the watch), +1 = right. */
const armPoints = (side: -1 | 1, p: ArmPose, sx: number, sy: number) => {
  const dir = (deg: number) => [side * Math.sin(rad(deg)), Math.cos(rad(deg))];
  const [ux, uy] = dir(p.upper);
  const ex = sx + ux * UPPER;
  const ey = sy + uy * UPPER;
  const [fx, fy] = dir(p.upper + p.elbow);
  return {ex, ey, wx: ex + fx * FORE, wy: ey + fy * FORE, foreAngle: Math.atan2(fy, fx)};
};

const Arm: React.FC<{side: -1 | 1; pose: ArmPose; sleeve: string; watch?: boolean; glitch: number; frame: number}> = ({
  side,
  pose,
  sleeve,
  watch,
  glitch,
  frame,
}) => {
  const sx = 150 + side * 52;
  const sy = 224;
  const {ex, ey, wx, wy, foreAngle} = armPoints(side, pose, sx, sy);
  const d = `M${sx} ${sy} L${ex} ${ey} L${wx} ${wy}`;
  // watch sits a little before the hand along the forearm
  const wt = 0.78;
  const watchX = lerp(ex, wx, wt);
  const watchY = lerp(ey, wy, wt);
  const watchDeg = (foreAngle * 180) / Math.PI;
  const hue = glitch > 0 ? (frame * 9) % 360 : 0;
  return (
    <g>
      <path d={d} fill="none" stroke={ink} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={sleeve} strokeWidth={36 - LW * 2} strokeLinecap="round" strokeLinejoin="round" />
      {watch && (
        <g transform={`translate(${watchX} ${watchY}) rotate(${watchDeg})`}>
          {glitch > 0 && (
            <circle r={26 + 4 * Math.sin(frame * 0.45)} fill={TT.watchFace} opacity={0.25 * glitch} />
          )}
          <rect x={-9} y={-17} width={18} height={34} rx={4} fill={TT.watch} stroke={ink} strokeWidth={LW * 0.75} />
          <circle r={11} fill={TT.watchFace} stroke={ink} strokeWidth={LW * 0.75}
            style={glitch > 0 ? {filter: `hue-rotate(${hue}deg)`} : undefined} />
          <path d="M0 0 L0 -6 M0 0 L4 2" stroke={ink} strokeWidth={2.5} strokeLinecap="round" />
          {glitch > 0 &&
            [0, 1, 2].map((k) => {
              const r = random(`g${k}-${Math.floor(frame / 3)}`);
              const r2 = random(`h${k}-${Math.floor(frame / 3)}`);
              return (
                <rect
                  key={k}
                  x={-20 + r * 26}
                  y={-22 + r2 * 40}
                  width={10 + r2 * 16}
                  height={3}
                  fill={k === 1 ? '#ff4fd8' : '#4ff2ff'}
                  opacity={0.8 * glitch}
                />
              );
            })}
        </g>
      )}
      <circle cx={wx} cy={wy} r={13} fill={TT.skin} stroke={ink} strokeWidth={LW * 0.8} />
    </g>
  );
};

// ---------- face ----------
type Face = {brow: number; browY: number; eye: number; mouth: Mouth; blush: number};
type Mouth = 'smile' | 'grin' | 'o' | 'wobble' | 'scream' | 'flat' | 'chatter';
const FACES: Record<Expression, Face> = {
  neutral: {brow: 0, browY: 0, eye: 1, mouth: 'smile', blush: 0},
  happy: {brow: -6, browY: -3, eye: 1, mouth: 'grin', blush: 0.5},
  surprised: {brow: 4, browY: -9, eye: 1.18, mouth: 'o', blush: 0},
  worried: {brow: 16, browY: -3, eye: 1.05, mouth: 'wobble', blush: 0},
  scared: {brow: 22, browY: -7, eye: 1.22, mouth: 'scream', blush: 0},
  determined: {brow: -18, browY: 2, eye: 0.95, mouth: 'flat', blush: 0},
  cold: {brow: 12, browY: -2, eye: 1, mouth: 'chatter', blush: 0.9},
};

const mouthPath = (m: Mouth, open: number, frame: number): React.ReactNode => {
  const s = {stroke: ink, strokeWidth: LW * 0.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  if (open > 0.5) {
    return (
      <g>
        <ellipse cx={0} cy={4} rx={13} ry={11} fill="#5a1f1f" {...s} />
        <ellipse cx={0} cy={10} rx={7} ry={3.5} fill="#ff7b7b" />
      </g>
    );
  }
  switch (m) {
    case 'smile':
      return <path d="M-14 0 Q0 11 14 0" fill="none" {...s} />;
    case 'grin':
      return <path d="M-18 -2 Q0 22 18 -2 Z" fill="#5a1f1f" {...s} />;
    case 'o':
      return <ellipse cx={0} cy={4} rx={9} ry={12} fill="#5a1f1f" {...s} />;
    case 'wobble':
      return <path d="M-14 6 Q-7 0 0 5 Q7 10 14 4" fill="none" {...s} />;
    case 'scream':
      return <path d="M-15 10 Q-14 -6 0 -6 Q14 -6 15 10 Q0 4 -15 10 Z" fill="#5a1f1f" {...s} />;
    case 'flat':
      return <path d="M-13 3 L13 1" fill="none" {...s} />;
    case 'chatter': {
      const j = Math.sin(frame * 2.1) * 1.5;
      return (
        <g transform={`translate(${j} 0)`}>
          <rect x={-15} y={-5} width={30} height={14} rx={5} fill="#fff" {...s} />
          <path d="M-15 2 L-10 -2 L-5 6 L0 -2 L5 6 L10 -2 L15 2" fill="none" stroke={ink} strokeWidth={2.5} strokeLinejoin="round" />
        </g>
      );
    }
  }
};

// Messy hair: a ring of tufts around the top of the head plus a jagged fringe.
const HAIR = (() => {
  const cx = 150;
  const cy = 128;
  const pts: string[] = [];
  const start = -198;
  const end = 18;
  const n = 11;
  const tip = (i: number) => 104 + (i % 3 === 1 ? 10 : 0) + (i % 4 === 0 ? -6 : 0);
  for (let i = 0; i <= n; i++) {
    const a = rad(start + ((end - start) * i) / n);
    const aMid = rad(start + ((end - start) * (i + 0.5)) / n + (i % 2 ? 6 : -4));
    const vx = cx + Math.cos(a) * 82;
    const vy = cy + Math.sin(a) * 82;
    if (i === 0) pts.push(`M${vx.toFixed(1)} ${vy.toFixed(1)}`);
    else pts.push(`L${vx.toFixed(1)} ${vy.toFixed(1)}`);
    if (i < n) {
      const r = tip(i);
      pts.push(`Q${(cx + Math.cos(aMid) * (r - 14)).toFixed(1)} ${(cy + Math.sin(aMid) * (r - 14)).toFixed(1)} ${(cx + Math.cos(aMid) * r).toFixed(1)} ${(cy + Math.sin(aMid) * r).toFixed(1)}`);
    }
  }
  // fringe back across the forehead, tufts pointing down
  const fringe = [
    [226, 128], [214, 102], [204, 118], [190, 88], [176, 112], [160, 84], [146, 110], [128, 86], [116, 112], [100, 92], [90, 120], [76, 112],
  ];
  fringe.forEach(([x, y]) => pts.push(`L${x} ${y}`));
  pts.push('Z');
  return pts.join(' ');
})();

// ---------- costumes ----------
const FurCape: React.FC = () => {
  // jagged lower edge
  const edge: string[] = [];
  const left = 66;
  const right = 234;
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const x = left + ((right - left) * i) / steps;
    const y = 286 + (i % 2 ? 18 : 0) - Math.abs(i - steps / 2) * 3;
    edge.push(`L${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const d = `M84 206 Q150 178 216 206 L236 286 ${edge.reverse().join(' ')} L64 286 Z`;
  return (
    <g>
      <path d={d} fill="#9a6b43" stroke={ink} strokeWidth={LW} strokeLinejoin="round" />
      {[96, 122, 150, 178, 204].map((x, i) => (
        <path key={i} d={`M${x} ${226 + (i % 2) * 8} l6 14 l6 -12`} fill="none" stroke="#c99f70" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <circle cx={150} cy={214} r={9} fill="#e9d2a5" stroke={ink} strokeWidth={LW * 0.7} />
    </g>
  );
};

const FurBoot: React.FC<{x: number}> = ({x}) => (
  <path
    d={`M${x - 26} 462 l6 -8 l6 7 l7 -9 l7 8 l7 -9 l7 8 l6 -7 l6 9 L${x + 24} 492 Q${x} 500 ${x - 30} 494 Z`}
    fill="#9a6b43"
    stroke={ink}
    strokeWidth={LW * 0.8}
    strokeLinejoin="round"
  />
);

const RomeCape: React.FC<{frame: number}> = ({frame}) => {
  const w = Math.sin(frame / 22) * 6;
  return (
    <path
      d={`M92 212 Q150 196 208 212 L${238 + w} 410 Q150 ${428 + w} ${62 - w} 410 Z`}
      fill="#c23a2b"
      stroke={ink}
      strokeWidth={LW}
      strokeLinejoin="round"
    />
  );
};

const Laurel: React.FC = () => (
  <g>
    {Array.from({length: 7}).map((_, i) => {
      const a = rad(-200 + i * 12);
      const b = rad(20 - i * 12);
      return (
        <React.Fragment key={i}>
          <ellipse cx={150 + Math.cos(a) * 86} cy={128 + Math.sin(a) * 86} rx={11} ry={5} transform={`rotate(${-200 + i * 12 + 60} ${150 + Math.cos(a) * 86} ${128 + Math.sin(a) * 86})`} fill="#7cb342" stroke={ink} strokeWidth={3} />
          <ellipse cx={150 + Math.cos(b) * 86} cy={128 + Math.sin(b) * 86} rx={11} ry={5} transform={`rotate(${20 - i * 12 - 60} ${150 + Math.cos(b) * 86} ${128 + Math.sin(b) * 86})`} fill="#7cb342" stroke={ink} strokeWidth={3} />
        </React.Fragment>
      );
    })}
  </g>
);

const EgyptCollar: React.FC = () => (
  <g>
    {[
      ['#2f6fc0', 0],
      ['#f2c14e', 12],
      ['#3fb8a8', 24],
    ].map(([c, o]) => (
      <path
        key={String(c)}
        d={`M${96 - Number(o) * 0.3} 212 Q150 ${262 + Number(o)} ${204 + Number(o) * 0.3} 212`}
        fill="none"
        stroke={String(c)}
        strokeWidth={12}
        strokeLinecap="round"
      />
    ))}
    <path d="M90 210 Q150 300 210 210" fill="none" stroke={ink} strokeWidth={LW * 0.7} strokeLinecap="round" />
  </g>
);

const EgyptBand: React.FC = () => (
  <g>
    <path d="M74 122 Q150 96 226 122" fill="none" stroke={ink} strokeWidth={16} strokeLinecap="round" />
    <path d="M74 122 Q150 96 226 122" fill="none" stroke="#f2c14e" strokeWidth={8} strokeLinecap="round" />
    <circle cx={150} cy={106} r={7} fill="#2f6fc0" stroke={ink} strokeWidth={3} />
  </g>
);

// ---------- the character ----------
export const TimeTraveler: React.FC<TimeTravelerProps> = ({
  expression = 'neutral',
  costume = 'none',
  pose = 'idle',
  fromPose,
  poseProgress = 1,
  talking = false,
  watchGlitch = false,
  flip = false,
  size = 400,
  seed = 'tt',
  style,
}) => {
  const frame = useCurrentFrame();
  const p = fromPose ? mixPose(POSES[fromPose], POSES[pose], Math.min(1, Math.max(0, poseProgress))) : POSES[pose];
  const face = FACES[expression];

  // idle life
  const breath = Math.sin((frame / 90) * Math.PI * 2);
  const sway = Math.sin((frame / 130) * Math.PI * 2) * 2 + p.headTilt;
  const shiver = pose === 'shiver' ? Math.sin(frame * 2.3) * 1.6 : 0;
  const panicShake = pose === 'panic' ? Math.sin(frame * 1.7) * 6 : 0;
  const waveSwing = pose === 'wave' ? Math.sin(frame / 4) * 22 : 0;
  const armB = {...p.b, elbow: p.b.elbow + waveSwing + panicShake};
  const armA = {...p.a, elbow: p.a.elbow - panicShake};

  // blink: about every 3.5-5 s, closed for 4 frames
  const period = 110 + Math.floor(random(seed + 'p') * 40);
  const cycle = Math.floor(frame / period);
  const offset = Math.floor(random(`${seed}-${cycle}`) * (period - 8));
  const t = frame - cycle * period - offset;
  const eyeOpen = t >= 0 && t < 4 ? 0.12 : 1;

  // talking: mouth flaps on an uneven rhythm (~8 per second)
  const flap = talking ? (Math.sin(frame * 1.9) + Math.sin(frame * 1.13 + 1) > 0.2 ? 1 : 0) : 0;

  const glitch = watchGlitch ? 1 : 0;
  const sleeve = TT.hoodie;
  const width = (size * TT.viewW) / TT.viewH;

  return (
    <svg
      width={width}
      height={size}
      viewBox={`0 0 ${TT.viewW} ${TT.viewH}`}
      style={{overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined, ...style}}
    >
      <g transform={`translate(${shiver} 0)`}>
        {/* the Roman cape hangs behind everything, legs included */}
        {costume === 'rome' && <g transform={`translate(0 ${breath * 1.6})`}><RomeCape frame={frame} /></g>}
        {/* legs and shoes */}
        <g>
          <rect x={110} y={340} width={34} height={140} rx={10} fill={TT.pants} stroke={ink} strokeWidth={LW} />
          <rect x={156} y={340} width={34} height={140} rx={10} fill={TT.pants} stroke={ink} strokeWidth={LW} />
          {costume === 'iceAge' ? (
            <>
              <FurBoot x={124} />
              <FurBoot x={176} />
            </>
          ) : (
            <>
              <path d="M96 494 Q96 466 126 466 Q150 466 152 494 Z" fill={costume === 'rome' || costume === 'egypt' ? '#a87443' : TT.shoe} stroke={ink} strokeWidth={LW} strokeLinejoin="round" />
              <path d="M148 494 Q150 466 174 466 Q204 466 204 494 Z" fill={costume === 'rome' || costume === 'egypt' ? '#a87443' : TT.shoe} stroke={ink} strokeWidth={LW} strokeLinejoin="round" />
              <rect x={94} y={490} width={60} height={10} rx={5} fill={TT.sole} stroke={ink} strokeWidth={LW * 0.7} />
              <rect x={146} y={490} width={60} height={10} rx={5} fill={TT.sole} stroke={ink} strokeWidth={LW * 0.7} />
            </>
          )}
        </g>

        {/* upper body breathes */}
        <g transform={`translate(0 ${breath * 1.6}) `}>
          {/* backpack behind the body */}
          <rect x={68} y={214} width={164} height={130} rx={34} fill={TT.pack} stroke={ink} strokeWidth={LW} />
          <rect x={60} y={270} width={22} height={56} rx={9} fill={TT.packDark} stroke={ink} strokeWidth={LW * 0.8} />
          <rect x={218} y={270} width={22} height={56} rx={9} fill={TT.packDark} stroke={ink} strokeWidth={LW * 0.8} />

          {/* hoodie */}
          <path d="M96 214 Q150 192 204 214 Q222 222 224 250 L226 344 Q150 364 74 344 L76 250 Q78 222 96 214 Z" fill={TT.hoodie} stroke={ink} strokeWidth={LW} strokeLinejoin="round" />
          <path d="M80 330 Q150 348 220 330" fill="none" stroke={TT.hoodieShade} strokeWidth={6} strokeLinecap="round" />
          <path d="M114 290 Q150 282 186 290 L192 330 Q150 338 108 330 Z" fill={TT.hoodieShade} stroke={ink} strokeWidth={LW * 0.7} strokeLinejoin="round" />
          {/* backpack straps */}
          <path d="M104 214 Q98 260 106 312" fill="none" stroke={ink} strokeWidth={22} strokeLinecap="round" />
          <path d="M104 214 Q98 260 106 312" fill="none" stroke={TT.pack} strokeWidth={22 - LW * 1.5} strokeLinecap="round" />
          <path d="M196 214 Q202 260 194 312" fill="none" stroke={ink} strokeWidth={22} strokeLinecap="round" />
          <path d="M196 214 Q202 260 194 312" fill="none" stroke={TT.pack} strokeWidth={22 - LW * 1.5} strokeLinecap="round" />
          {/* hood bunched round the neck */}
          <path d="M98 212 Q150 236 202 212 Q206 196 186 192 L114 192 Q94 196 98 212 Z" fill={TT.hoodie} stroke={ink} strokeWidth={LW} strokeLinejoin="round" />
          {/* drawstrings */}
          <path d="M138 222 L134 262 M162 222 L166 262" stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <circle cx={134} cy={265} r={4} fill="#fff" stroke={ink} strokeWidth={2.5} />
          <circle cx={166} cy={265} r={4} fill="#fff" stroke={ink} strokeWidth={2.5} />

          {costume === 'iceAge' && <FurCape />}
          {costume === 'egypt' && <EgyptCollar />}

          {/* arms in front */}
          <Arm side={-1} pose={armA} sleeve={sleeve} watch glitch={glitch} frame={frame} />
          <Arm side={1} pose={armB} sleeve={sleeve} glitch={0} frame={frame} />

          {/* head */}
          <g transform={`rotate(${sway} 150 196)`}>
            <circle cx={150} cy={128} r={80} fill={TT.skin} stroke={ink} strokeWidth={LW} />
            <path d="M202 176 Q230 140 222 100 Q236 150 196 186 Z" fill={TT.skinShade} />
            <path d={HAIR} fill={TT.hair} stroke={ink} strokeWidth={LW} strokeLinejoin="round" />
            <path d="M112 72 Q128 62 146 66 M170 64 Q186 62 198 74" fill="none" stroke={TT.hairLight} strokeWidth={5} strokeLinecap="round" />
            {costume === 'rome' && <Laurel />}
            {costume === 'egypt' && <EgyptBand />}

            {/* brows */}
            <g transform={`translate(0 ${face.browY})`}>
              <path d="M110 112 L134 112" transform={`rotate(${face.brow} 122 112)`} stroke={ink} strokeWidth={LW * 0.9} strokeLinecap="round" />
              <path d="M166 112 L190 112" transform={`rotate(${-face.brow} 178 112)`} stroke={ink} strokeWidth={LW * 0.9} strokeLinecap="round" />
            </g>
            {/* eyes */}
            {[122, 178].map((x) => (
              <g key={x} transform={`translate(${x + p.lookX} ${142 + p.lookY}) scale(${face.eye} ${face.eye * eyeOpen})`}>
                <ellipse rx={9.5} ry={13} fill={ink} />
                {eyeOpen > 0.5 && <circle cx={-3} cy={-5} r={3.5} fill="#fff" />}
              </g>
            ))}
            {/* cheeks */}
            {face.blush > 0 && (
              <>
                <ellipse cx={100} cy={168} rx={13} ry={8} fill={TT.blush} opacity={0.55 * face.blush} />
                <ellipse cx={200} cy={168} rx={13} ry={8} fill={TT.blush} opacity={0.55 * face.blush} />
              </>
            )}
            {/* mouth */}
            <g transform={`translate(${150 + p.lookX * 0.6} ${178 + p.lookY * 0.5})`}>{mouthPath(face.mouth, flap, frame)}</g>
          </g>
        </g>
      </g>
    </svg>
  );
};
