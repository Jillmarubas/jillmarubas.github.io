import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {CodePiece} from './codeArt';
import {ArtMode, ICE, MAMMOTH, PIECES, PieceId} from './pieces';
import {Expression, Pose, TimeTraveler} from './TimeTraveler';

// Ice Age establishing shot, 13 s at 30 fps.
// 0-200    slow pan along the valley; a mammoth walks in on the hills (the viewer sees it first)
// 190-390  the camera pushes in through the layers to the traveller at the cave mouth;
//          depth of field opens up, letterbox bars slide in, the light gets darker
// 205      he checks his watch; 230-330 it glitches; 335 he notices the mammoth
//
// art="code"   the original code-drawn pieces (fallback)
// art="vector" the VectorCraft pieces in public/timetraveler/vector/

export const ICE_AGE_DURATION = 390;
export type IceAgeProps = {art: ArtMode};

const W = 1920;
const H = 1080;
const ease = Easing.bezier(0.45, 0, 0.2, 1);

// ---------- camera ----------
// Each layer sits at a depth d (ground = 1). A point p on a layer lands on screen at
// C + s * (p - C - cam / d), with s = d / (d - z): far layers slide less and grow less as
// the camera moves forward, which is what makes it a camera move rather than a zoom.
const DEPTH = {far: 6, mid: 3.2, hills: 1.8, ground: 1, fore: 0.55} as const;
type Layer = keyof typeof DEPTH;

const CHAR_X = 1300; // feet, ground layer
const CHAR_Y = 806;
const CHAR_SIZE = 300;

const camera = (f: number) => {
  const pan = interpolate(f, [0, 210], [-260, 120], {extrapolateRight: 'clamp', easing: ease});
  const push = interpolate(f, [190, 389], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.25, 1)});
  // aim at the traveller's head by the end of the push
  const cx = interpolate(push, [0, 1], [pan, CHAR_X - W / 2]);
  const cy = interpolate(push, [0, 1], [0, CHAR_Y - CHAR_SIZE * 0.62 - H / 2]);
  return {cx, cy, z: push * 0.42, push};
};

const layerStyle = (layer: Layer, f: number): React.CSSProperties => {
  const {cx, cy, z, push} = camera(f);
  const d = DEPTH[layer];
  const s = d / (d - z);
  // depth of field: focus stays on the ground plane; blur in screen px, so divide by s
  const blurPx = {far: 0.6 + 5 * push, mid: 0.3 + 3.5 * push, hills: 2.2 * push, ground: 0, fore: 7 + 9 * push}[layer];
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    width: W,
    height: H,
    transformOrigin: '0 0',
    transform: `translate(${W / 2}px, ${H / 2}px) scale(${s}) translate(${-W / 2 - cx / d}px, ${-H / 2 - cy / d}px)`,
    filter: blurPx > 0.05 ? `blur(${(blurPx / s).toFixed(2)}px)` : undefined,
  };
};

// ---------- pieces ----------
const Piece: React.FC<{id: PieceId; art: ArtMode; x: number; y: number; scale?: number; flip?: boolean; style?: React.CSSProperties}> = ({
  id,
  art,
  x,
  y,
  scale = 1,
  flip = false,
  style,
}) => {
  const {w, h} = PIECES[id];
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        transformOrigin: '0 0',
        transform: `scale(${flip ? -scale : scale}, ${scale})${flip ? ` translateX(${-w}px)` : ''}`,
        ...style,
      }}
    >
      {art === 'vector' ? (
        <Img src={staticFile(`timetraveler/vector/${id}.svg`)} style={{position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'visible'}} />
      ) : (
        <CodePiece id={id} />
      )}
    </div>
  );
};

// ---------- mammoth ----------
const Mammoth: React.FC<{art: ArtMode; f: number}> = ({art, f}) => {
  const {w, h} = PIECES.mammothBody;
  const step = (f / 30) * Math.PI * 2 * 0.4; // slow, heavy stride
  const legAngle = (phase: number) => Math.sin(step + phase) * 13;
  const bob = Math.abs(Math.sin(step)) * -5;
  const rot = (id: PieceId, deg: number, [px, py]: readonly [number, number]) => (
    <div key={id} style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: `${px}px ${py}px`, transform: `rotate(${deg}deg)`}}>
      <Piece id={id} art={art} x={0} y={0} />
    </div>
  );
  const hips = MAMMOTH.hips;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h}}>
      {rot('mammothLegFrontFar', legAngle(Math.PI), hips.mammothLegFrontFar)}
      {rot('mammothLegBackFar', legAngle(0), hips.mammothLegBackFar)}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${bob}px)`}}>
        <Piece id="mammothBody" art={art} x={0} y={0} />
      </div>
      {rot('mammothLegFrontNear', legAngle(0), hips.mammothLegFrontNear)}
      {rot('mammothLegBackNear', legAngle(Math.PI), hips.mammothLegBackNear)}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${bob}px)`}}>
        {rot('mammothHead', Math.sin(step * 2) * 2.5, MAMMOTH.neck)}
        {rot('mammothTusks', Math.sin(step * 2) * 2.5, MAMMOTH.neck)}
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${MAMMOTH.neck[0]}px ${MAMMOTH.neck[1]}px`, transform: `rotate(${Math.sin(step * 2) * 2.5}deg)`}}>
          {rot('mammothTrunk', Math.sin(step * 1.3 + 0.8) * 7, MAMMOTH.trunkRoot)}
        </div>
      </div>
    </div>
  );
};

// ---------- fire, smoke and snow (code-drawn in both versions; they're animation, not art) ----------
const Fire: React.FC<{f: number; x: number; y: number}> = ({f, x, y}) => {
  const flame = (k: number, wBase: number, hBase: number, color: string) => {
    const hh = hBase * (1 + 0.12 * Math.sin(f * 0.5 + k) + 0.06 * Math.sin(f * 1.3 + k * 2));
    const lean = Math.sin(f * 0.21 + k) * 10;
    return <path key={color} d={`M${-wBase} 0 Q${-wBase * 0.9} ${-hh * 0.55} ${lean} ${-hh} Q${wBase * 0.9} ${-hh * 0.55} ${wBase} 0 Z`} fill={color} stroke={ICE.ink} strokeWidth={k === 0 ? ICE.line : 0} strokeLinejoin="round" />;
  };
  return (
    <svg style={{position: 'absolute', left: x - 120, top: y - 200, overflow: 'visible'}} width={240} height={220} viewBox="-120 -200 240 220">
      {flame(0, 54, 150, '#ff7a2a')}
      {flame(1.7, 36, 108, '#ffb43b')}
      {flame(3.1, 18, 62, '#fff2b0')}
    </svg>
  );
};

const Smoke: React.FC<{f: number; x: number; y: number}> = ({f, x, y}) => (
  <>
    {Array.from({length: 6}).map((_, i) => {
      const t = ((f + i * 25) % 150) / 150;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x - 30 + Math.sin(t * 5 + i) * 26 + t * 60,
            top: y - 220 - t * 360,
            width: 60 + t * 90,
            height: 60 + t * 90,
            borderRadius: '50%',
            background: '#c9d4e2',
            opacity: 0.35 * Math.sin(t * Math.PI),
            filter: 'blur(10px)',
          }}
        />
      );
    })}
  </>
);

const Snow: React.FC<{f: number; count: number; size: number; speed: number; seed: string; opacity: number}> = ({f, count, size, speed, seed, opacity}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: count}).map((_, i) => {
      const x0 = random(`${seed}x${i}`) * (W + 400) - 200;
      const y0 = random(`${seed}y${i}`) * H;
      const r = size * (0.6 + random(`${seed}r${i}`) * 0.8);
      const y = (y0 + f * speed * (0.7 + random(`${seed}s${i}`) * 0.6)) % (H + 40) - 20;
      const x = x0 + Math.sin(f / 40 + i) * 18 - f * speed * 0.25;
      return <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" opacity={opacity} />;
    })}
  </svg>
);

// ---------- the scene ----------
const PINES_HILLS: [number, number, number][] = [
  [-200, 470, 0.55], [-60, 490, 0.62], [380, 445, 0.6], [1480, 460, 0.58], [1640, 480, 0.66], [2260, 470, 0.6],
];
const PINES_GROUND: [number, number, number][] = [
  [-280, 420, 1.05], [-80, 470, 0.9], [640, 440, 1.0], [1960, 430, 1.1], [2160, 470, 0.95],
];

export const IceAgeScene: React.FC<IceAgeProps> = ({art = 'vector'}) => {
  const f = useCurrentFrame();
  const {push} = camera(f);

  // character beats
  let pose: Pose = 'shiver';
  let fromPose: Pose | undefined;
  let poseT = 1;
  let expression: Expression = 'cold';
  if (f >= 205 && f < 340) {
    fromPose = 'shiver';
    pose = 'checkWatch';
    poseT = interpolate(f, [205, 214], [0, 1], {extrapolateRight: 'clamp', easing: ease});
    expression = f < 230 ? 'neutral' : 'worried';
  } else if (f >= 340) {
    fromPose = 'checkWatch';
    pose = 'panic';
    poseT = interpolate(f, [340, 348], [0, 1], {extrapolateRight: 'clamp', easing: ease});
    expression = f < 352 ? 'surprised' : 'scared';
  }
  const glitch = f >= 230 && f < 330;

  // mammoth walks right-to-left along the hills, toward the traveller
  const mammothX = interpolate(f, [0, 389], [2400, 2060]);

  // colour script: darker and a touch heavier as the camera closes in
  const letterbox = interpolate(f, [185, 225], [0, 118], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const fireGlow = 0.5 + 0.08 * Math.sin(f * 0.6) + 0.05 * Math.sin(f * 1.7);

  return (
    <AbsoluteFill style={{background: ICE.skyTop, overflow: 'hidden'}}>
      {/* sky: no parallax */}
      <AbsoluteFill style={{background: `linear-gradient(${ICE.skyTop} 0%, ${ICE.skyMid} 45%, ${ICE.skyLow} 72%)`}} />
      <div style={{position: 'absolute', left: 1460 - push * 40, top: 120, width: 120, height: 120, borderRadius: '50%', background: '#f4f1e4', boxShadow: '0 0 80px 30px rgba(244,241,228,0.35)'}} />

      <div style={layerStyle('far', f)}>
        <Piece id="farMountains" art={art} x={-200} y={300} />
      </div>
      <div style={layerStyle('mid', f)}>
        <Piece id="midMountains" art={art} x={-300} y={390} />
      </div>
      <div style={{...layerStyle('mid', f), filter: undefined}}>
        <div style={{position: 'absolute', left: -400, top: 560, width: 3000, height: 200, background: `linear-gradient(rgba(182,200,222,0), rgba(182,200,222,0.55))`}} />
      </div>
      <div style={layerStyle('hills', f)}>
        {PINES_HILLS.map(([x, y, s], i) => (
          <Piece key={i} id="pine" art={art} x={x} y={y + (1 - s) * 400} scale={s} />
        ))}
        <div style={{position: 'absolute', left: mammothX, top: 452, width: 560, height: 420, transformOrigin: '0 0', transform: 'scale(-0.52, 0.52)'}}>
          <Mammoth art={art} f={f} />
        </div>
        <Piece id="hills" art={art} x={-450} y={600} />
      </div>
      <Snow f={f} count={70} size={2.2} speed={1.2} seed="far" opacity={0.7} />

      {/* ground plane: cave, fire, traveller */}
      <div style={layerStyle('ground', f)}>
        {PINES_GROUND.map(([x, y, s], i) => (
          <Piece key={i} id="pine" art={art} x={x} y={y + (1 - s) * 400} scale={s} />
        ))}
        <svg width={3000} height={500} style={{position: 'absolute', left: -500, top: 720}} viewBox="0 0 3000 500">
          <path d="M0 60 Q400 20 800 50 Q1300 90 1700 40 Q2200 0 3000 50 L3000 500 L0 500 Z" fill={ICE.snow} stroke={ICE.ink} strokeWidth={ICE.line} />
          <path d="M200 140 Q500 120 760 150 M1900 120 Q2200 100 2500 130" fill="none" stroke={ICE.snowShade} strokeWidth={8} strokeLinecap="round" />
        </svg>
        <Piece id="cave" art={art} x={1000} y={392} />
        {/* warm light pooling round the fire */}
        <div style={{position: 'absolute', left: 1080 - 420, top: 760 - 300, width: 840, height: 600, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,170,80,0.55), rgba(255,140,60,0))', opacity: fireGlow, mixBlendMode: 'screen'}} />
        <Smoke f={f} x={1080} y={760} />
        <Piece id="logs" art={art} x={970} y={712} />
        <Fire f={f} x={1080} y={748} />
        <div style={{position: 'absolute', left: CHAR_X - 95, top: CHAR_Y - 16, width: 190, height: 32, borderRadius: '50%', background: 'rgba(40,50,80,0.25)'}} />
        <div style={{position: 'absolute', left: CHAR_X - (CHAR_SIZE * 300) / 520 / 2, top: CHAR_Y - CHAR_SIZE + 6}}>
          <TimeTraveler size={CHAR_SIZE} costume="iceAge" pose={pose} fromPose={fromPose} poseProgress={poseT} expression={expression} watchGlitch={glitch} flip />
        </div>
      </div>
      <Snow f={f} count={40} size={3.6} speed={2} seed="mid" opacity={0.85} />

      {/* foreground framing, out of focus */}
      <div style={layerStyle('fore', f)}>
        <Piece id="rock" art={art} x={-560} y={740} />
        <Piece id="rock" art={art} x={1880} y={820} scale={0.9} flip />
        <Piece id="branch" art={art} x={1240} y={-70} />
      </div>
      <div style={{position: 'absolute', inset: 0, filter: 'blur(3px)'}}>
        <Snow f={f} count={14} size={9} speed={4} seed="near" opacity={0.9} />
      </div>

      {/* finish: grade, vignette, grain, letterbox */}
      <AbsoluteFill style={{background: '#0b1226', opacity: 0.04 + 0.12 * push}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 52%, rgba(0,0,0,0) ${58 - 14 * push}%, rgba(6,10,24,${0.45 + 0.2 * push}) 100%)`}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundSize: '1024px 1024px', mixBlendMode: 'overlay', opacity: 0.08}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: letterbox, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: W, height: letterbox, background: '#000'}} />
    </AbsoluteFill>
  );
};
