import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {TimeTraveler, TT} from './TimeTraveler';
import {Explorer, ExplorerId, SQUAD} from './Explorer';
import bulbs from './frontLights.json';

// The reverse shot of BasementTV: the camera sits where the TV is and looks back at the couch, so
// the four friends face us, eating popcorn. Left to right: Ria, Tank, the Traveler, Pip (the back
// view mirrored). Tank flicks popcorn up and catches it, the Traveler dips into Tank's bucket and
// eats, Pip hugs his bowl because the film is scary, Ria munches from her bag.
// Art: scripts/vectorcraft/basement_front.py. Light: the TV is behind the camera, so it lights their
// faces cool and flickering; the lamp on the right and the string lights warm the room.

export const BASEMENT_FRONT_DURATION = 240;
const W = 1920;
const H = 1080;
const HIP_Y = 645; // where they sit, on the seat cushions (screen px)
const SIZE = 520; // character size (a standard-height character in px)
const ink = TT.ink;
const pop = (n: number) => staticFile(`timetraveler/basement/pop${n}.svg`);
const Pop: React.FC<{n?: number; s?: number; rot?: number}> = ({n = 1, s = 26, rot = 0}) => (
  <image href={pop(n)} x={-s / 2} y={-s * 0.8} width={s} height={s} transform={`rotate(${rot})`} />
);

type Seat = {who: 'traveler' | ExplorerId; x: number; pants: string; knee: number};
const SEATS: Seat[] = [
  {who: 'ria', x: 604, pants: SQUAD.ria.pants, knee: 30},
  {who: 'tank', x: 830, pants: SQUAD.tank.pants, knee: 40},
  {who: 'traveler', x: 1076, pants: TT.pants, knee: 32},
  {who: 'pip', x: 1316, pants: SQUAD.pip.pants, knee: 24},
];

/** Rig placement: scale, the rig's top-left, and the hip line in rig units. */
const place = (who: Seat['who'], x: number) => {
  const height = who === 'traveler' ? 1 : SQUAD[who].height;
  const h = SIZE * height;
  const k = h / TT.viewH;
  const hip = who === 'traveler' ? 344 : SQUAD[who].torsoBottom;
  return {h, k, w: TT.viewW * k, left: x - (TT.viewW * k) / 2, top: HIP_Y - hip * k, hip};
};

/** Clip a rig at the hips (they sit; the legs are drawn separately, coming toward us). */
const Seated: React.FC<{who: Seat['who']; x: number; children: (size: number) => React.ReactNode; jitter?: number}> = ({who, x, children, jitter = 0}) => {
  const p = place(who, x);
  const pad = 260;
  return (
    <div style={{position: 'absolute', left: p.left - pad, top: p.top - pad, width: p.w + pad * 2, height: pad + (p.hip + 4) * p.k, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: pad + jitter, top: pad, filter: 'drop-shadow(0 0 2px rgba(255,200,140,0.35))'}}>{children(SIZE)}</div>
    </div>
  );
};

/** Seated legs seen from the front: thighs come toward us from the hips and narrow to the knees,
 *  the knees are the nearest point (a small cap, lit by the TV), the shins hang down behind the table. */
const Legs: React.FC<{seat: Seat}> = ({seat}) => {
  const p = place(seat.who, seat.x);
  const hipW = (seat.who === 'traveler' ? 74 : SQUAD[seat.who].hip + 6) * p.k;
  const r = seat.knee * (p.k * 0.9 + 0.1);
  const y0 = HIP_Y - 10;
  const ky = HIP_Y + r * 0.55;
  const lw = TT.line * p.k;
  const dark = 'rgba(0,0,0,0.25)';
  const fold = 'rgba(0,0,0,0.3)';
  return (
    <g>
      {[-1, 1].map((s) => {
        const kx = seat.x + s * (hipW * 0.5 + r * 0.15);
        const hx0 = seat.x + s * 3; // inner edge at the crotch
        const hx1 = seat.x + s * hipW; // outer edge at the hip
        const sw = r * 0.62; // shin half width
        return (
          <g key={s}>
            {/* shin, a little narrower toward the ankle */}
            <path d={`M${kx - sw} ${ky + r * 0.3} L${kx - sw * 0.85} 870 L${kx + sw * 0.85} 870 L${kx + sw} ${ky + r * 0.3} Z`} fill={seat.pants} stroke={ink} strokeWidth={lw} strokeLinejoin="round" />
            <path d={`M${kx + s * sw * 0.2} ${ky + r} L${kx + s * sw * 0.3} 870 L${kx + s * sw * 0.85} 870 L${kx + s * sw} ${ky + r * 0.4} Z`} fill={dark} />
            {/* thigh, foreshortened: wide at the hip, narrowing to the knee */}
            <path d={`M${hx0} ${y0} L${hx1} ${y0 - 2} Q${hx1 + s * 4} ${ky - r * 0.2} ${kx + s * r * 0.8} ${ky} L${kx - s * r * 0.8} ${ky} Q${hx0 + s * 2} ${ky - r * 0.5} ${hx0} ${y0} Z`} fill={seat.pants} stroke={ink} strokeWidth={lw} strokeLinejoin="round" />
            {/* creases pulling from the knee back toward the hip and crotch */}
            <path d={`M${kx - s * r * 0.3} ${ky - r * 0.45} Q${(kx + hx0) / 2} ${y0 + 6} ${hx0 + s * 6} ${y0 + 3}`} fill="none" stroke={fold} strokeWidth={lw * 0.55} strokeLinecap="round" />
            <path d={`M${kx + s * r * 0.4} ${ky - r * 0.5} Q${(kx + hx1) / 2} ${y0 + 4} ${hx1 - s * 8} ${y0 + 2}`} fill="none" stroke={fold} strokeWidth={lw * 0.45} strokeLinecap="round" />
            {/* knee cap: small, nearest to us; a spot of TV light, a fold under it */}
            <ellipse cx={kx} cy={ky + r * 0.1} rx={r * 0.82} ry={r * 0.62} fill={seat.pants} stroke={ink} strokeWidth={lw * 0.8} />
            <ellipse cx={kx - s * r * 0.15} cy={ky - r * 0.12} rx={r * 0.3} ry={r * 0.16} fill="rgba(210,230,255,0.35)" />
            <path d={`M${kx - r * 0.45} ${ky + r * 0.62} q${r * 0.45} ${r * 0.2} ${r * 0.9} 0`} fill="none" stroke={fold} strokeWidth={lw * 0.6} strokeLinecap="round" />
          </g>
        );
      })}
      {/* shadow in the lap between the thighs */}
      <path d={`M${seat.x - 5} ${y0} L${seat.x + 5} ${y0} L${seat.x + r * 0.5} ${ky} L${seat.x - r * 0.5} ${ky} Z`} fill="rgba(0,0,0,0.4)" />
    </g>
  );
};

export const BasementFront: React.FC = () => {
  const f = useCurrentFrame();
  const flicker = 0.9 + 0.06 * Math.sin(f * 0.7) + 0.04 * Math.sin(f * 1.9 + 1);

  // Tank: flick a piece up from his raised hand, catch it in his mouth (every 48 frames)
  const tossT = (f % 48) / 30;
  const flying = tossT < 1;
  const px = 246 + (150 - 246) * tossT;
  const py = 104 + (160 - 104) * tossT - 150 * tossT * (1 - tossT);

  // the Traveler: dip into the bucket, then the other hand to his mouth, on a 72-frame loop
  const tc = f % 72;
  const travelerProgress = tc < 24 ? 0 : tc < 32 ? (tc - 24) / 8 : tc < 60 ? 1 : 1 - (tc - 60) / 12;

  // Ria: hand from the bag to her mouth and back, out of step with the Traveler
  const rc = (f + 30) % 80;
  const riaProgress = rc < 30 ? 1 : rc < 40 ? 1 - (rc - 30) / 10 : rc < 62 ? 0 : (rc - 62) / 18;

  // Pip trembles a little
  const pipJitter = Math.sin(f * 2.1) * 1.2;

  return (
    <AbsoluteFill style={{background: '#0d0f12', overflow: 'hidden'}}>
      <Img src={staticFile('timetraveler/basement/bRoomF.svg')} style={{position: 'absolute', inset: 0, width: W, height: H}} />
      {/* the far end of the room falls off into the dark */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,6,10,0.55) 0%, rgba(4,6,10,0.25) 45%, rgba(4,6,10,0.1) 70%)'}} />
      {/* string-light glow */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
        <defs>
          <radialGradient id="bulb">
            <stop offset="0%" stopColor="#ffd9a0" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#ff9a40" stopOpacity={0} />
          </radialGradient>
        </defs>
        {(bulbs as {x: number; y: number}[]).map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={22 + 3 * Math.sin(f / 9 + i)} fill="url(#bulb)" opacity={0.55} />
        ))}
      </svg>
      <Img src={staticFile('timetraveler/basement/bCouchF.svg')} style={{position: 'absolute', inset: 0, width: W, height: H}} />

      {/* the four friends, from left to right */}
      <Seated who="ria" x={SEATS[0].x}>
        {(size) => (
          <Explorer who="ria" gear={false} size={size} expression="happy" pose="eat" fromPose="holdBowl" poseProgress={riaProgress} armBFront
            handA={<image href={staticFile('timetraveler/basement/bBag.svg')} x={-34} y={-70} width={68} height={83} />}
            handB={riaProgress > 0.5 ? <Pop n={2} s={22} rot={20} /> : undefined} />
        )}
      </Seated>
      <Seated who="tank" x={SEATS[1].x}>
        {(size) => (
          <Explorer who="tank" gear={false} size={size} expression="surprised" pose="toss" armBFront handB={!flying ? <Pop n={3} s={24} /> : undefined}>
            {flying && <image href={pop(3)} x={px - 12} y={py - 12} width={24} height={24} transform={`rotate(${tossT * 540} ${px} ${py})`} />}
          </Explorer>
        )}
      </Seated>
      <Seated who="traveler" x={SEATS[2].x}>
        {(size) => (
          <TimeTraveler gear={false} size={size} costume="none" expression="happy" seed="ttf" pose="snack" fromPose="reach" poseProgress={travelerProgress} armBFront
            handB={travelerProgress > 0.5 ? <Pop n={1} s={24} rot={-15} /> : undefined} />
        )}
      </Seated>
      <Seated who="pip" x={SEATS[3].x} jitter={pipJitter}>
        {(size) => (
          <Explorer who="pip" gear={false} size={size} expression="scared" pose="holdBowl">
            {/* the TV reflected in his glasses */}
            {[-1, 1].map((s) => (
              <rect key={s} x={150 + s * 33.75 - 12} y={150} width={18} height={11} rx={2} fill="#bfe8c8" opacity={0.45 * flicker} transform={`rotate(-8 ${150 + s * 33.75} 156)`} />
            ))}
          </Explorer>
        )}
      </Seated>

      {/* legs, the popcorn bucket on the seat between Tank and the Traveler, Pip's bowl */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {SEATS.map((s) => <Legs key={s.who} seat={s} />)}
        {/* popcorn dropped on the seat and the floor */}
        {Array.from({length: 18}).map((_, i) => {
          const onSeat = i < 10;
          const x = onSeat ? 500 + random(`cx${i}`) * 920 : 520 + random(`fx${i}`) * 880;
          const y = onSeat ? 652 + random(`cy${i}`) * 12 : 880 + random(`fy${i}`) * 40;
          return <image key={i} href={pop(1 + (i % 4))} x={x} y={y - 16} width={onSeat ? 16 : 20} height={onSeat ? 16 : 20} transform={`rotate(${random(`r${i}`) * 360} ${x + 8} ${y - 8})`} />;
        })}
      </svg>
      <Img src={staticFile('timetraveler/basement/bBucket.svg')} style={{position: 'absolute', left: 950 - 93, top: 650 - 198, width: 186, height: 198}} />
      <Img src={staticFile('timetraveler/basement/bBowl.svg')} style={{position: 'absolute', left: 1316 - 58 + pipJitter, top: 600, width: 116, height: 80}} />

      <Img src={staticFile('timetraveler/basement/bSideF.svg')} style={{position: 'absolute', inset: 0, width: W, height: H}} />
      {/* lamp glow at the right end of the couch */}
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.55, background: 'radial-gradient(circle at 88% 50%, rgba(255,190,110,0.65) 0%, rgba(255,160,80,0.2) 14%, rgba(0,0,0,0) 30%)'}} />
      <Img src={staticFile('timetraveler/basement/bTableF.svg')} style={{position: 'absolute', inset: 0, width: W, height: H}} />

      {/* the TV behind the camera: cool, flickering light on their faces and the front of the couch,
          tinted by the green forest on the screen */}
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.4 * flicker, background: 'radial-gradient(ellipse 48% 46% at 50% 52%, rgba(150,200,255,0.55) 0%, rgba(110,170,200,0.25) 50%, rgba(0,0,0,0) 100%)'}} />
      <AbsoluteFill style={{mixBlendMode: 'multiply', background: 'linear-gradient(180deg, rgba(120,140,170,1) 0%, rgba(200,210,225,1) 55%, rgba(150,160,180,1) 100%)', opacity: 0.55}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundSize: '1024px 1024px', mixBlendMode: 'overlay', opacity: 0.1}} />
    </AbsoluteFill>
  );
};
