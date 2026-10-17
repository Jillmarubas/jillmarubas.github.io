// Scene kits: each shot frames one of these sets with its own camera and acting.
import React from 'react';
import {random} from 'remotion';
import {Plane, Shot, Cam, OZ, mix, W} from './look';
import {KansasSky, Prairie, House, Windmill, Shed, Fence, Cow, Horse, Tornado} from './kansas';
import {RoomShell, Stove, Shelf, Table, Bed, Trapdoor, Rug, RoomLight} from './interior';
import {OzSky, Hills, DomeHouse, FruitTree, FlowerBank, Brook, OzBird} from './ozland';
import TL from './timeline.json';

// ---------- timing helpers ----------
export const LINES = TL.lines as {line: number; speaker: string; start: number; dur: number; mouth?: number[]}[];
export const S = (n: number) => LINES[n - 1].start;
export const E = (n: number) => LINES[n - 1].start + LINES[n - 1].dur;
// mouth opening for a dialogue line at global time g
export const mouth = (n: number, g: number) => {
  const l = LINES[n - 1];
  if (!l.mouth) return 0;
  const i = Math.floor((g - l.start) * TL.fps);
  if (i < 0 || i >= l.mouth.length) return 0;
  return l.mouth[i - (i % 2)]; // on twos, like the drawings
};
// keyframes: [[t, v], ...] with ease in-out between
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
export const kf = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0 || 1));
  }
  return keys[keys.length - 1][1];
};
export const camKf = (t: number, keys: [number, Cam][]): Cam => ({
  x: kf(t, keys.map(([a, c]) => [a, c.x])),
  y: kf(t, keys.map(([a, c]) => [a, c.y])),
  z: kf(t, keys.map(([a, c]) => [a, c.z])),
});

// ---------- the farm ----------
// World layout on the 1000 plane: house at x 260..656 (ground y 820), windmill at 1500, shed + stock far right.
export const HOUSE = {x: 260, y: 820, ft: 22};
export const Farm: React.FC<{
  cam: Cam;
  t: number;
  storm?: number;
  wind?: number;
  windDir?: number;
  tornado?: {x: number; w: number; h: number; debris?: number};
  near?: React.ReactNode; // on the 1000 plane, in front of the house
  front?: React.ReactNode; // on a nearer plane (700)
  mid?: React.ReactNode; // the 1600 plane (far field)
  doorOpen?: number;
  rear?: number; // horses rearing
  shake?: number;
  still?: boolean; // nothing moves
  house?: boolean;
}> = ({cam, t, storm = 0, wind = 0, windDir = 1, tornado, near, front, mid, doorOpen = 0, rear = 0, shake = 0, still, house = true}) => {
  const tt = still ? 0 : t;
  return (
    <Shot cam={cam} shake={shake}>
      <Plane d={4000}>
        <KansasSky storm={storm} t={tt} />
      </Plane>
      {tornado && (
        <Plane d={2600}>
          <Tornado x={tornado.x} y={620} w={tornado.w} h={tornado.h} t={t} debris={tornado.debris ?? 1} />
        </Plane>
      )}
      <Plane d={1600}>
        <Prairie horizon={620} t={tt} wind={wind} windDir={windDir} tint={storm * 0.7} seed="far" />
        <Shed x={1250} y={640} ft={5} />
        <Cow x={1380} y={660} ft={5} t={tt} />
        <Cow x={1180} y={668} ft={5} t={tt + 3} flip col="#4A3A2E" />
        <Horse x={1500} y={664} ft={5} t={tt} rear={rear} />
        {mid}
      </Plane>
      <Plane d={1000}>
        <Windmill x={1500} y={760} ft={12} t={tt} speed={still ? 0 : 0.3 + wind * 1.4} />
        <Fence x0={-600} x1={2500} y={800} ft={12} y1={770} />
        {house && <House x={HOUSE.x} y={HOUSE.y} ft={HOUSE.ft} t={still ? 0 : t} paint={0.28} doorOpen={doorOpen} />}
        {near}
      </Plane>
      {front && <Plane d={700}>{front}</Plane>}
      {storm > 0 && <rect x={-200} y={-200} width={W + 400} height={1500} fill="#1E2A26" opacity={storm * 0.22} />}
    </Shot>
  );
};

// ---------- the one room ----------
export const Room: React.FC<{
  cam: Cam;
  t: number;
  L: RoomLight;
  shake?: number;
  tilt?: number;
  trap?: number;
  earUp?: number;
  door?: number;
  rattle?: number;
  lamp?: number;
  winLight?: number;
  children?: React.ReactNode; // people on the 1000 plane
  front?: React.ReactNode; // on the 700 plane
  bedFront?: boolean;
}> = ({cam, t, L, shake = 0, tilt = 0, trap = 0, earUp = 0, door = 0, rattle = 0, lamp = 0, winLight = 1, children, front, bedFront}) => (
  <Shot cam={cam} shake={shake} bg="#0B0A09">
    <g transform={`rotate(${tilt} 960 700)`}>
      <Plane d={1000}>
        <RoomShell L={L} t={t} winLight={winLight} doorOpen={door} />
        <Shelf L={L} t={t} rattle={rattle} />
        <Stove L={L} t={t} />
        <Bed L={L} x={12.6} which="big" />
        <Rug L={L} cx={760} cy={1000} />
        <Trapdoor L={L} open={trap} earUp={earUp} t={t} />
        <Table L={L} t={t} lamp={lamp} />
        {!bedFront && <Bed L={L} x={14.2} which="cot" front />}
        {children}
        {bedFront && <Bed L={L} x={14.2} which="cot" front />}
      </Plane>
      {front && <Plane d={700}>{front}</Plane>}
    </g>
  </Shot>
);

// ---------- the storm, from outside and inside the funnel ----------
export const Vortex: React.FC<{t: number; dark?: number; children?: React.ReactNode; cam: Cam; above?: number}> = ({t, dark = 0.6, children, cam, above = 0}) => (
  <Shot cam={cam} bg="#151816">
    <Plane d={3000}>
      <rect x={-2000} y={-2000} width={6000} height={5000} fill={mix('#3A4440', '#5F6E66', above)} />
      {/* curved cloud walls streaming around the eye */}
      {Array.from({length: 14}, (_, i) => {
        const a = t * 0.5 + i * 0.45;
        const r = 900 + (i % 4) * 160;
        const y = 540 + Math.sin(a) * 140 - above * 300;
        return <ellipse key={i} cx={960 + Math.cos(a) * r} cy={y} rx={700} ry={150 + (i % 3) * 40} fill={mix('#26302C', '#4B5A52', (i % 5) / 5)} opacity={0.85} />;
      })}
    </Plane>
    <Plane d={1800}>
      {Array.from({length: 40}, (_, i) => {
        const a = t * 1.6 + i * 0.7;
        const r = 500 + random(`v${i}`) * 700;
        return <rect key={i} x={960 + Math.cos(a) * r} y={540 + Math.sin(a) * r * 0.35 + (random(`vy${i}`) - 0.5) * 600} width={26} height={7} fill="#5A4E40" transform={`rotate(${a * 57})`} />;
      })}
    </Plane>
    <Plane d={1000}>{children}</Plane>
    <rect x={-200} y={-200} width={2400} height={1500} fill="#0C0F0E" opacity={dark * 0.35} />
  </Shot>
);

// ---------- Munchkin country ----------
export const OzLand: React.FC<{cam: Cam; t: number; children?: React.ReactNode; front?: React.ReactNode; birds?: number; houseOn?: boolean; bright?: number}> = ({cam, t, children, front, birds = 1, houseOn = false}) => (
  <Shot cam={cam} bg={OZ.skyO}>
    <Plane d={4000}>
      <OzSky t={t} />
    </Plane>
    <Plane d={2600}>
      <Hills y={600} k={0.15} seed="h1" amp={70} />
      {[-300, 200, 900, 1500, 2100].map((x, i) => (
        <DomeHouse key={i} x={x} y={600 - 10 + (i % 2) * 12} s={0.55} seed={`dh${i}`} />
      ))}
    </Plane>
    <Plane d={1900}>
      <Hills y={660} k={0.5} seed="h2" amp={50} />
      {Array.from({length: 9}, (_, i) => (
        <FruitTree key={i} x={-500 + i * 380 + random(`ft${i}`) * 120} y={650} s={0.45} seed={`ftf${i}`} t={t} />
      ))}
    </Plane>
    <Plane d={1400}>
      <Hills y={760} k={0.85} seed="h3" amp={30} />
      <Brook y={790} t={t} />
      {[-400, 260, 1700, 2300].map((x, i) => (
        <FruitTree key={i} x={x} y={770} s={0.9} seed={`ftn${i}`} t={t} />
      ))}
    </Plane>
    <Plane d={1000}>
      <rect x={-1500} y={880} width={W + 3000} height={900} fill={OZ.grassO} />
      <FlowerBank x0={-600} x1={300} y={900} seed="fb1" t={t} />
      <FlowerBank x0={1500} x1={2600} y={905} seed="fb2" t={t} />
      {houseOn && children}
      {!houseOn && children}
    </Plane>
    {birds > 0 &&
      Array.from({length: 7}, (_, i) => {
        const x = ((random(`bx${i}`) * 2600 + t * (120 + i * 18)) % 2800) - 400;
        const y = 220 + random(`by${i}`) * 260 + Math.sin(t * 2 + i) * 30;
        return (
          <Plane key={i} d={1200}>
            <OzBird x={x} y={y} s={0.9} t={t} col={['#D0211C', '#2546C9', '#F5D320', '#E8344A', '#2546C9', '#F28A1E', '#B24BCF'][i]} seed={`b${i}`} />
          </Plane>
        );
      })}
    {front && <Plane d={700}>{front}</Plane>}
  </Shot>
);
