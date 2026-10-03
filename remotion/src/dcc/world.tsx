import React from 'react';
import {interpolateColors, random} from 'remotion';
import * as A from './art';

const {K} = A;

/*
 * One big illustrated world for the "city world" edition. Everything the story visits sits on a
 * single panorama, left to right: a suburb, a data-centre campus, a farm with a well, a city
 * street, the grid and its power plant, the Tucson desert, Memphis, and a town hall next to an
 * old battlefield. The camera (Film.tsx) flies and zooms across it.
 * World units: the building line is y = 0, the sky is negative y, the road and river are below.
 */
export type Cam = {x: number; y: number; z: number};
export type Flags = {hum: number; hot: number; heat: number; gateway: number; tags: number; glow: number; loop: number};
export const NO_FLAGS: Flags = {hum: 0, hot: 0, heat: 0, gateway: 0, tags: 0, glow: 0, loop: 0};

export const WORLD_W = 14800;
/** Landmark x positions the shots aim at. */
export const P = {
  home1: 180, home2: 560, home3: 940, home4: 1300, home5: 1680, home6: 2080,
  sub: 2800, hallA: 3300, hallB: 3950, cool: 4520, crane: 4800,
  farm: 5130, well: 5320,
  cafe: 5620, city: 6400, mae: 7250, aol: 7580,
  plant: 8250, gridop: 8900, gridHomes: 9200,
  tucson: 9850, blue: 10500,
  colossus: 11350, turbines: 12000, boxtown: 12600,
  hall: 13250, field: 14100,
};
const DESERT = [9400, 10900];
const RIVER_GAPS = [DESERT, [12950, WORLD_W + 400]];

/* ------------------------------------------------------------------ sky, one palette per chapter */
const SKY_TOP = ['#5566D0', '#3FA9F5', '#48A6F0', '#56B4F0', '#1B2350', '#3FA9F5', '#5AA7E8', '#7CC4F5', '#6A5ACD'];
const SKY_BOT = ['#FFB88A', '#BFE8FF', '#CDEBFF', '#FFE3A8', '#4A4C8E', '#C2E9FF', '#FFD9A0', '#FFE9C7', '#FF9E7A'];
const SUN = ['#FFD27A', '#FFE680', '#FFE680', '#FFF1A0', '#F4F1FF', '#FFE680', '#FFD580', '#FFE9A0', '#FFC27A'];
const NIGHT = [0.28, 0, 0, 0, 1, 0, 0.08, 0, 0.3];
const CH = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const nightAt = (sky: number) => {
  const i = Math.floor(sky);
  const u = sky - i;
  return NIGHT[Math.min(8, i)] * (1 - u) + NIGHT[Math.min(8, i + 1)] * u;
};

/* ------------------------------------------------------------------ static layout */
type Item = {x: number; w: number; r: (t: number, fl: Flags, night: number) => React.ReactNode};
const at = (x: number, y: number, el: React.ReactNode, key?: string) => (
  <g key={key} transform={`translate(${x} ${y})`}>
    {el}
  </g>
);

const BACK: Item[] = [];
const MID: Item[] = [];
const FRONT: Item[] = [];

// suburb: a row of pines behind the houses
for (let x = 40; x < 2400; x += 150 + random(`pn${x}`) * 60) {
  const s = 0.9 + random(`ps${x}`) * 0.5;
  BACK.push({x, w: 80, r: (t) => at(x, -8, <A.Pine s={s} t={t} seed={x} />)});
}
// distant towers behind the city
[5480, 5760, 6040, 6320, 6600, 6880, 7160, 7440, 7700].forEach((x, i) => {
  const h = 520 + random(`ft${i}`) * 300;
  BACK.push({x, w: 180, r: (t) => at(x, -14, <A.Tower w={170} h={h} c1="#B9C9E6" c2="#A2B4D6" t={t} seed={i + 40} />)});
});
// mesas behind the desert
[9500, 9950, 10500, 10800].forEach((x, i) => {
  const w = 380 + random(`me${i}`) * 200;
  const h = 170 + random(`mh${i}`) * 110;
  BACK.push({
    x,
    w: w + 100,
    r: () => (
      <g key={`m${i}`} transform={`translate(${x} -4)`}>
        <path d={`M${-w / 2} 0 L${-w / 2 + 70} ${-h} L${w / 2 - 50} ${-h} L${w / 2 + 20} 0 Z`} fill="#E0976A" />
        <path d={`M${w / 2 - 110} ${-h} L${w / 2 - 50} ${-h} L${w / 2 + 20} 0 L${w / 2 - 80} 0 Z`} fill="#C97B52" />
        <rect x={-w / 2 + 70} y={-h} width={w - 120} height={14} fill="#F0B287" />
      </g>
    ),
  });
});
// the high-voltage line from the power plant to the campus (behind everything)
const PYLONS = [2980, 3640, 4300, 4960, 5620, 6280, 6940, 7600, 8000];
const PY_TOP = -390;
PYLONS.forEach((x) => BACK.push({x, w: 140, r: (t) => at(x, -20, <A.Pylon s={1.23} t={t + x} />)}));

// suburb houses and gardens
[
  [P.home1, 4],
  [P.home2, 0],
  [P.home3, 2],
  [P.home4, 1],
  [P.home5, 3],
  [P.home6, 4],
].forEach(([x, st], i) => MID.push({x, w: 360, r: (t, _fl, n) => at(x, 0, <A.Home style={st} t={t} lit={n > 0.2} seed={i} />)}));
[370, 750, 1120, 1490, 1880, 2260].forEach((x, i) => MID.push({x, w: 180, r: (t) => at(x, 4, <A.RoundTree s={0.95 + (i % 3) * 0.12} t={t} seed={i} />)}));

// the campus: fence, substation, halls, cooling towers, a new hall going up
MID.push({
  x: 3650,
  w: 2600,
  r: () => (
    <g key="fence">
      <rect x={2440} y={-34} width={2480} height={4} fill={K.steel2} />
      {Array.from({length: 63}, (_, i) => (
        <rect key={i} x={2440 + i * 40} y={-44} width={4} height={44} fill={K.steel2} />
      ))}
    </g>
  ),
});
MID.push({x: P.sub, w: 560, r: (t) => at(P.sub, -2, <A.Substation t={t} />)});
MID.push({x: P.hallA, w: 700, r: (t, fl) => at(P.hallA, 0, <A.DataHall w={560} h={250} t={t} seed={1} hot={fl.hot > 0.5} />)});
MID.push({x: P.hallB, w: 700, r: (t, fl) => at(P.hallB, 0, <A.DataHall w={600} h={290} t={t} seed={2} hot={fl.hot > 0.5} />)});
MID.push({x: P.cool, w: 420, r: (t) => <g key="ct">{at(P.cool - 60, 0, <A.CoolingTower t={t} s={0.82} />)}{at(P.cool + 130, 0, <A.CoolingTower t={t + 30} s={0.7} />)}</g>});
MID.push({
  x: P.crane,
  w: 420,
  r: (t) => (
    <g key="crane" transform={`translate(${P.crane} 0)`}>
      {/* a hall under construction: bare steel frame */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-120 + i * 60} y={-190} width={8} height={190} fill={K.orange} />
      ))}
      <rect x={-124} y={-194} width={256} height={10} fill={K.orange} />
      <rect x={-124} y={-100} width={256} height={8} fill={K.orange} />
      {/* tower crane */}
      <rect x={140} y={-460} width={18} height={460} fill={K.yellow} />
      <g transform={`rotate(${Math.sin(t / 60) * 4} 149 -460)`}>
        <rect x={-150} y={-470} width={380} height={16} fill={K.yellow} />
        <rect x={180} y={-470} width={50} height={40} fill={K.navy} />
        <rect x={-70} y={-454} width={3} height={200 + Math.sin(t / 40) * 30} fill={K.navy} />
        <rect x={-86} y={-254 + Math.sin(t / 40) * 30} width={34} height={20} fill={K.steel2} />
      </g>
    </g>
  ),
});

// the farm with a well (Georgia)
MID.push({x: P.farm, w: 320, r: (t) => at(P.farm, 0, <A.Home style={4} t={t} seed={9} />)});
MID.push({
  x: P.well,
  w: 120,
  r: () => (
    <g key="well" transform={`translate(${P.well} 0)`}>
      <rect x={-40} y={-44} width={80} height={44} rx={8} fill="#9AA6B8" />
      <rect x={0} y={-44} width={40} height={44} fill="#7F8B9E" />
      <rect x={-36} y={-120} width={6} height={80} fill={K.trunk} />
      <rect x={30} y={-120} width={6} height={80} fill={K.trunk} />
      <path d="M-54 -116 L0 -150 L54 -116 Z" fill={K.red} />
      <rect x={-2} y={-116} width={4} height={50} fill={K.navy} />
      <rect x={-10} y={-70} width={20} height={16} rx={3} fill={K.trunk} />
    </g>
  ),
});

// the city street: towers behind, shops in front, the old exchange and a big HQ tower
[
  [5480, 240, 560, K.blue, K.blue2],
  [5800, 200, 420, K.purple, K.purple2],
  [6080, 260, 640, '#2FB39A', '#23917D'],
  [6380, 220, 480, K.orange, '#E07F24'],
  [6700, 240, 580, K.pink, '#D86E96'],
  [7000, 200, 440, K.blue, K.blue2],
].forEach(([x, w, h, c1, c2], i) =>
  MID.push({x: x as number, w: (w as number) + 40, r: (t) => at(x as number, 0, <A.Tower w={w as number} h={h as number} c1={c1 as string} c2={c2 as string} t={t} seed={i} roof />)}),
);
[
  [5640, 'CAFE', '#FFE0C2', K.red],
  [5930, 'BOOKS', '#DDEBFF', K.blue],
  [6230, 'MARKET', '#E3F6DF', '#2FB39A'],
  [6530, 'PHARMACY', '#FFF1D6', K.purple],
  [6830, 'PIZZA', '#FFE3EC', K.orange],
].forEach(([x, label, c, aw]) => MID.push({x: x as number, w: 280, r: (t) => at(x as number, 0, <A.Shop label={label as string} c={c as string} awning={aw as string} t={t} />)}));
MID.push({
  x: P.mae,
  w: 380,
  r: (t) => (
    <g key="mae" transform={`translate(${P.mae} 0)`}>
      <A.DataHall w={300} h={170} t={t} seed={7} />
      <rect x={-110} y={-236} width={160} height={40} rx={8} fill={K.navy} />
      <text x={-30} y={-209} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={20} fill={K.yellow}>
        MAE-EAST
      </text>
    </g>
  ),
});
MID.push({x: P.aol, w: 300, r: (t) => at(P.aol, 0, <A.Tower w={260} h={760} c1="#3F63D8" c2="#2D4CB5" t={t} seed={77} roof />)});

// the grid: power plant, grid operator, a few homes
MID.push({x: P.plant, w: 560, r: (t) => at(P.plant, 0, <A.PowerPlant t={t} />)});
MID.push({
  x: P.gridop,
  w: 300,
  r: (t) => (
    <g key="gridop" transform={`translate(${P.gridop} 0)`}>
      <A.Tower w={260} h={360} c1="#E9F0FA" c2="#CBD8EA" t={t} seed={88} roof />
      <rect x={-110} y={-420} width={220} height={40} rx={8} fill={K.blue} />
      <text x={0} y={-393} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={18} fill={K.white}>
        GRID OPERATOR
      </text>
    </g>
  ),
});
[9180, 9340].forEach((x, i) => MID.push({x, w: 300, r: (t, _f, n) => at(x, 0, <g transform="scale(0.7)"><A.Home style={i ? 2 : 1} t={t} lit={n > 0.2} seed={20 + i} /></g>)}));

// the desert: city hall, cacti, the Project Blue lot
MID.push({x: P.tucson, w: 700, r: () => at(P.tucson, 0, <A.TownHall label="CITY HALL" wall="#FFE7C7" roof="#E0976A" roof2="#C97B52" />)});
[9500, 10180, 10300, 10760].forEach((x, i) => MID.push({x, w: 120, r: () => at(x, 2, <A.Cactus s={0.8 + (i % 2) * 0.3} />)}));
MID.push({
  x: P.blue,
  w: 500,
  r: () => (
    <g key="blue" transform={`translate(${P.blue} 0)`}>
      {Array.from({length: 12}, (_, i) => (
        <rect key={i} x={-220 + i * 40} y={-60} width={4} height={60} fill={K.steel2} />
      ))}
      <rect x={-220} y={-50} width={444} height={4} fill={K.steel2} />
      <rect x={-6} y={-210} width={12} height={150} fill={K.navy} />
      <rect x={-130} y={-290} width={260} height={96} rx={10} fill={K.blue} />
      <text x={0} y={-252} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={K.white}>
        PROJECT BLUE
      </text>
      <text x={0} y={-218} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={16} fill={K.white} opacity={0.85}>
        COMING SOON
      </text>
    </g>
  ),
});

// Memphis: the supercomputer hall, the turbines, Boxtown
MID.push({
  x: P.colossus,
  w: 900,
  r: (t, fl) => (
    <g key="col" transform={`translate(${P.colossus} 0)`}>
      <A.DataHall w={760} h={300} t={t} seed={5} hot={fl.hot > 0.5} />
      <rect x={-120} y={-270} width={240} height={46} rx={8} fill={K.navy} />
      <text x={0} y={-238} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={26} fill={K.white}>
        COLOSSUS
      </text>
    </g>
  ),
});
[11860, 12040, 12220].forEach((x, i) =>
  MID.push({x, w: 200, r: (t, fl) => <g key={`gt${x}`}>{at(x, -40, <g transform="scale(0.85)"><A.GasTurbine t={t} seed={i + 3} /></g>)}{at(x - 70, 0, <g><A.GasTurbine t={t} seed={i + 9} /><g opacity={fl.tags} transform="translate(-40 -130)"><rect x={-60} y={-20} width={120} height={34} rx={9} fill={K.red} /><text x={0} y={4} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={15} fill={K.white}>NO PERMIT</text></g></g>)}</g>}),
);
[12520, 12760].forEach((x, i) => MID.push({x, w: 280, r: (t, _f, n) => at(x, 0, <g transform="scale(0.75)"><A.Home style={i ? 1 : 4} t={t} lit={n > 0.2} seed={30 + i} /></g>)}));

// the town hall and the battlefield
MID.push({x: P.hall, w: 700, r: () => at(P.hall, 0, <A.TownHall />)});
MID.push({x: P.hall + 420, w: 140, r: (t) => at(P.hall + 420, 0, <A.Flag t={t} />)});
MID.push({x: P.hall - 420, w: 200, r: (t) => at(P.hall - 420, 4, <A.RoundTree t={t} seed={4} />)});
MID.push({
  x: P.field,
  w: 1400,
  r: (t) => (
    <g key="field" transform={`translate(${P.field} 0)`}>
      {/* split-rail fence, a cannon, a monument */}
      {Array.from({length: 17}, (_, i) => (
        <rect key={i} x={-640 + i * 80} y={-50} width={8} height={50} fill={K.trunk} />
      ))}
      <rect x={-640} y={-42} width={1288} height={6} fill={K.trunk} />
      <rect x={-640} y={-24} width={1288} height={6} fill={K.trunk} />
      <rect x={-18} y={-280} width={36} height={280} fill="#E9E4D8" />
      <path d="M-18 -280 L0 -320 L18 -280 Z" fill="#E9E4D8" />
      <rect x={-50} y={-30} width={100} height={30} fill="#D6D0C0" />
      <g transform="translate(-340 0)">
        <rect x={-70} y={-54} width={120} height={20} rx={10} fill="#3B3F48" transform="rotate(-10 -10 -44)" />
        <circle cx={-10} cy={-22} r={22} fill={K.trunk} />
        <circle cx={-10} cy={-22} r={8} fill="#5A3A22" />
      </g>
      {at(360, 0, <A.Flag t={t} />)}
      {[-520, 460, 600].map((x, i) => at(x, 2, <A.RoundTree s={0.8} t={t} seed={i + 12} />, `ft${i}`))}
    </g>
  ),
});

// front: street lamps, bushes
for (let x = 300; x < WORLD_W; x += 620) {
  const desert = x > DESERT[0] && x < DESERT[1];
  FRONT.push({x, w: 60, r: (t, _f, n) => at(x, 146, <A.StreetLamp t={t} on={n > 0.2} />)});
  if (!desert) FRONT.push({x: x + 250, w: 100, r: () => at(x + 250, 172, <A.Bush s={0.8} />)});
}
// crowds (reference 4): outside the town hall, at Tucson city hall, in Boxtown
const crowd = (cx: number, n: number, spread: number, seed: number, signs: string[]) =>
  Array.from({length: n}, (_, i) => {
    const x = cx - spread / 2 + (i / Math.max(1, n - 1)) * spread + (random(`cx${seed}${i}`) - 0.5) * 40;
    const y = 150 + (i % 3) * 26 + random(`cy${seed}${i}`) * 10;
    const sign = i % 4 === 1 ? signs[(i >> 2) % signs.length] : undefined;
    return {x, y, seed: seed * 100 + i, sign, wave: i % 5 === 3, dir: (random(`cd${seed}${i}`) > 0.5 ? 1 : -1) as 1 | -1};
  }).sort((a, b) => a.y - b.y);
const CROWDS = [
  ...crowd(P.hall, 22, 760, 1, ['HEAR US', 'OUR TOWN', 'VOTE NO', 'SAVE OUR LAND']),
  ...crowd(P.tucson, 14, 560, 2, ['WATER FIRST', 'NO BLUE', 'ASK US']),
  ...crowd(P.boxtown - 20, 9, 420, 3, ['CLEAN AIR', 'WE BREATHE']),
];
CROWDS.forEach((c) => FRONT.push({x: c.x, w: 60, r: (t) => at(c.x, c.y, <A.Person seed={c.seed} t={t} sign={c.sign} wave={c.wave} dir={c.dir} />, `cr${c.seed}`)}));

/* ------------------------------------------------------------------ moving things */
const CARS = Array.from({length: 34}, (_, i) => ({
  x0: random(`car${i}`) * WORLD_W,
  v: (i % 2 ? -1 : 1) * (5 + random(`cv${i}`) * 3),
  color: [K.red, K.yellow, K.blue, '#2FB39A', K.purple, K.orange, K.white, K.pink][i % 8],
  kind: (['sedan', 'sport', 'van', 'sedan'] as const)[i % 4],
}));
const WALKERS = Array.from({length: 46}, (_, i) => ({
  x0: random(`wk${i}`) * WORLD_W,
  v: (i % 2 ? -1 : 1) * (1.1 + random(`wv${i}`) * 0.5),
  back: i % 3 === 0,
  seed: 500 + i,
  bag: i % 5 === 0,
  phone: i % 7 === 2,
}));
const wrap = (x: number) => ((x % (WORLD_W + 600)) + WORLD_W + 600) % (WORLD_W + 600) - 300;

const Bird: React.FC<{t: number; ph: number}> = ({t, ph}) => {
  const k = Math.sin(t / 3 + ph) * 12;
  return <path d={`M-18 ${k} Q-9 -6 0 2 Q9 -6 18 ${k}`} fill="none" stroke={K.navy} strokeWidth={4} strokeLinecap="round" />;
};

/* ------------------------------------------------------------------ the world */
export const World: React.FC<{cam: Cam; t: number; sky: number; fl: Flags; children?: React.ReactNode}> = ({cam, t, sky, fl, children}) => {
  const {x: cx, y: cy, z} = cam;
  const L = cx - 960 / z - 500;
  const R = cx + 960 / z + 500;
  const vis = (it: Item) => it.x + it.w / 2 > L && it.x - it.w / 2 < R;
  const n = nightAt(sky);
  const top = interpolateColors(sky, CH, SKY_TOP);
  const bot = interpolateColors(sky, CH, SKY_BOT);
  const sun = interpolateColors(sky, CH, SUN);
  const draw = (arr: Item[]) => arr.filter(vis).map((it, i) => <React.Fragment key={i}>{it.r(t, fl, n)}</React.Fragment>);
  const inDesert = (x: number) => x > DESERT[0] && x < DESERT[1];

  // parallax hills (far layer): placed at x * p, drawn in their own transform
  const p = 0.35;
  const zp = Math.pow(z, 0.45);
  const hills = [];
  for (let i = -6; i < 40; i++) {
    const fx = i * 190;
    const wx = fx / p;
    const hL = cx * p - 960 / zp - 300;
    const hR = cx * p + 960 / zp + 300;
    if (fx < hL || fx > hR) continue;
    const h = 140 + random(`hl${i}`) * 170;
    const w = 260 + random(`hw${i}`) * 160;
    const c = inDesert(wx) ? ['#EFC49A', '#E4B083'] : ['#8FD6A0', '#7CC98F'];
    hills.push(<ellipse key={i} cx={fx} cy={-20} rx={w} ry={h} fill={c[Math.abs(i) % 2]} />);
  }

  // high-voltage wires with moving sparks
  const wires = [];
  for (let i = 0; i < PYLONS.length - 1; i++) {
    const a = PYLONS[i];
    const b = PYLONS[i + 1];
    if (b < L || a > R) continue;
    for (const dy of [0, 49]) {
      const y = PY_TOP + dy + 20 * 0 - 20;
      wires.push(<path key={`${i}-${dy}`} d={`M${a - 98} ${y} Q${(a + b) / 2} ${y + 60} ${b - 98} ${y}`} fill="none" stroke={K.navy} strokeWidth={3} opacity={0.55} />);
      wires.push(<path key={`g${i}-${dy}`} d={`M${a - 98} ${y} Q${(a + b) / 2} ${y + 60} ${b - 98} ${y}`} fill="none" stroke={K.yellow} strokeWidth={7} strokeLinecap="round" strokeDasharray="10 70" strokeDashoffset={t * 6} opacity={0.35 + 0.65 * fl.glow} />);
    }
  }

  // river (and a dry wash in the desert)
  const riverY = 232;
  const riverH = 118;
  const ripples = [];
  for (let x = Math.floor(L / 140) * 140; x < R; x += 140) {
    if (RIVER_GAPS.some(([a, b]) => x > a && x < b)) continue;
    const u = Math.sin(t / 12 + x * 0.05);
    ripples.push(<rect key={x} x={x + 20 + u * 16} y={riverY + 30 + ((x / 140) % 3) * 26} width={60} height={6} rx={3} fill={K.white} opacity={0.55} />);
  }

  // clouds, birds, a plane
  const clouds = [];
  for (let i = 0; i < 22; i++) {
    const x = wrap(i * 720 + random(`cl${i}`) * 300 + t * 0.35);
    if (x < L - 200 || x > R) continue;
    clouds.push(<g key={i} transform={`translate(${x} ${-980 + random(`cy${i}`) * 300}) scale(${0.8 + random(`cs${i}`) * 0.7})`} opacity={1 - n * 0.55}>
      <A.Cloud />
    </g>);
  }
  const birds = [];
  for (let fk = 0; fk < 9; fk++) {
    const bx = wrap(fk * 1700 + t * 2.4);
    const by = -620 - (fk % 3) * 90 + Math.sin(t / 40 + fk) * 20;
    if (bx < L || bx > R) continue;
    for (let j = 0; j < 5; j++) birds.push(<g key={`${fk}-${j}`} transform={`translate(${bx - j * 44} ${by + (j % 2 ? 26 : 0) + j * 6}) scale(0.9)`}><Bird t={t} ph={j + fk} /></g>);
  }
  const planeX = wrap(t * 7 + 5200);

  const cars = CARS.map((c, i) => {
    const x = wrap(c.x0 + c.v * t);
    if (x < L || x > R) return null;
    return <g key={i} transform={`translate(${x} ${c.v < 0 ? 72 : 118}) scale(0.9)`}><A.Car color={c.color} dir={c.v < 0 ? -1 : 1} t={t} kind={c.kind} /></g>;
  });
  const walkers = (back: boolean) =>
    WALKERS.filter((w) => w.back === back).map((w, i) => {
      const x = wrap(w.x0 + w.v * t);
      if (x < L || x > R) return null;
      return <g key={i} transform={`translate(${x} ${back ? 20 : 148}) scale(${back ? 0.8 : 1})`}><A.Person seed={w.seed} walking dir={w.v < 0 ? -1 : 1} t={t} bag={w.bag} phone={w.phone} /></g>;
    });

  // flows around the campus, like reference 1: power (yellow), water (blue), heat (red)
  const flow = (d: string, c: string, o: number, key: string, w = 12) => (
    <g key={key} opacity={o}>
      <path d={d} fill="none" stroke={c} strokeWidth={w + 8} strokeLinecap="round" opacity={0.25} />
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeDasharray="26 22" strokeDashoffset={-t * 3} />
    </g>
  );
  const flows = cx > 1200 && cx < 6800 && [
    flow(`M${P.sub + 120} -150 C ${P.sub + 260} -250, ${P.hallA - 260} -300, ${P.hallA - 180} -290`, K.yellow, 0.9, 'p1'),
    flow(`M${P.sub + 120} -150 C ${P.sub + 500} -420, ${P.hallB - 300} -420, ${P.hallB - 200} -330`, K.yellow, 0.9, 'p2'),
    flow(`M${P.cool - 220} ${riverY + 40} C ${P.cool - 240} 120, ${P.cool - 160} -20, ${P.cool - 110} -40`, K.water, 0.95, 'w1'),
  ];
  const hot = fl.hot;
  const heatWaves = [P.hallA, P.hallB, P.colossus].filter((x) => x > L && x < R).map((x) =>
    [0, 1, 2].map((k) => {
      const u = ((t * 0.9 + k * 20) % 60) / 60;
      return <path key={`${x}-${k}`} d={`M${x - 150 + k * 140} ${-330 - u * 160} q 20 -20 0 -40 q -20 -20 0 -40`} fill="none" stroke={K.red} strokeWidth={8} strokeLinecap="round" opacity={hot * (1 - u) * 0.9} />;
    }),
  );
  // the hum: arcs rolling out of the campus toward the houses
  const hum = fl.hum > 0.01 && [0, 1, 2, 3, 4].map((k) => {
    const u = ((t * 1.1 + k * 24) % 120) / 120;
    const r = 80 + u * 1200;
    return <path key={k} d={`M${P.hallA - 200 - r * 0.2} ${-220 - r * 0.55} A ${r} ${r * 0.7} 0 0 0 ${P.hallA - 200 - r * 0.2} ${-220 + r * 0.25}`} transform={`translate(${-r * 0.55} 0)`} fill="none" stroke={K.red} strokeWidth={10} strokeLinecap="round" opacity={fl.hum * (1 - u) * 0.8} />;
  });
  // waste heat piped to the houses (chapter 7)
  const heatPipe = fl.heat > 0.01 && (
    <g opacity={fl.heat}>
      <path d={`M${P.hallA - 200} -60 L ${P.hallA - 200} 8 L 120 8`} fill="none" stroke={K.red2} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${P.hallA - 200} -60 L ${P.hallA - 200} 8 L 120 8`} fill="none" stroke={K.orange} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      {[P.home1, P.home2, P.home3, P.home4, P.home5, P.home6].map((x) => (
        <g key={x}>
          <path d={`M${x + 40} 8 L ${x + 40} -40`} stroke={K.orange} strokeWidth={18} strokeLinecap="round" />
          {[0, 1].map((k) => {
            const u = ((t * 0.8 + k * 30 + x) % 60) / 60;
            return <path key={k} d={`M${x - 30 + k * 50} ${-250 - u * 90} q 14 -14 0 -28 q -14 -14 0 -28`} fill="none" stroke={K.orange} strokeWidth={7} strokeLinecap="round" opacity={(1 - u) * 0.9} />;
          })}
        </g>
      ))}
      <path d={`M${P.hallA - 200} -60 L ${P.hallA - 200} 8 L 120 8`} fill="none" stroke={K.yellow} strokeWidth={10} strokeLinecap="round" strokeDasharray="16 34" strokeDashoffset={t * 5} />
    </g>
  );
  // closed-loop cooling (chapter 3): a loop of pipe circling between the halls and a chiller
  const loop = fl.loop > 0.01 && (
    <g opacity={fl.loop}>
      <rect x={P.hallA - 120} y={-420} width={P.hallB - P.hallA + 300} height={160} rx={70} fill="none" stroke={K.water} strokeWidth={14} />
      <rect x={P.hallA - 120} y={-420} width={P.hallB - P.hallA + 300} height={160} rx={70} fill="none" stroke={K.white} strokeWidth={6} strokeDasharray="12 40" strokeDashoffset={-t * 4} />
    </g>
  );
  // the Digital Gateway: planned plots and ghost halls over the battlefield
  const gateway = fl.gateway > 0.01 && (
    <g opacity={fl.gateway}>
      {[-420, 0, 420].map((dx, i) => (
        <g key={i} transform={`translate(${P.field + dx} 0)`} opacity={Math.min(1, fl.gateway * 3 - i * 0.6)}>
          <rect x={-180} y={-230} width={360} height={230} fill={K.red} opacity={0.12} />
          <rect x={-180} y={-230} width={360} height={230} fill="none" stroke={K.red} strokeWidth={6} strokeDasharray="20 14" />
        </g>
      ))}
    </g>
  );

  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="dcc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#dcc-sky)" />
      {/* sun or moon */}
      <g transform={`translate(${1500 - (cx % 4000) * 0.02} ${200 + n * 20})`}>
        <circle r={150} fill={sun} opacity={0.18} />
        <circle r={96} fill={sun} opacity={0.35} />
        <circle r={66} fill={sun} />
        {n > 0.5 && <circle cx={26} cy={-14} r={56} fill={top} opacity={(n - 0.5) * 2} />}
      </g>
      {n > 0.2 &&
        Array.from({length: 60}, (_, i) => (
          <circle key={i} cx={random(`sx${i}`) * 1920} cy={random(`sy${i}`) * 560} r={1.5 + random(`sr${i}`) * 2} fill="#fff" opacity={(n - 0.2) * (0.5 + 0.5 * Math.sin(t / 10 + i))} />
        ))}
      {/* far hills (parallax) */}
      <g transform={`translate(960 ${540 - z * cy}) scale(${zp}) translate(${-cx * p} 0)`}>{hills}</g>
      {/* the world */}
      <g transform={`translate(960 540) scale(${z}) translate(${-cx} ${-cy})`}>
        {clouds}
        {birds}
        {planeX > L && planeX < R && <g transform={`translate(${planeX} -1060)`}><A.Plane /></g>}
        {/* ground */}
        <rect x={L} y={-20} width={R - L} height={2400} fill={K.grass} />
        {inDesert(cx) || (DESERT[0] < R && DESERT[1] > L) ? <rect x={DESERT[0]} y={-20} width={DESERT[1] - DESERT[0]} height={2400} fill={K.sand} /> : null}
        {draw(BACK)}
        {wires}
        {flows}
        {draw(MID)}
        {heatWaves}
        {hum}
        {loop}
        {gateway}
        {/* back sidewalk, road, front sidewalk */}
        <rect x={L} y={0} width={R - L} height={26} fill={K.walk} />
        {heatPipe}
        {walkers(true)}
        <rect x={L} y={26} width={R - L} height={100} fill={K.road} />
        {Array.from({length: Math.ceil((R - L) / 120)}, (_, i) => {
          const x = Math.floor(L / 120) * 120 + i * 120;
          return <rect key={i} x={x} y={74} width={60} height={6} rx={3} fill="#E8E0C0" />;
        })}
        <rect x={L} y={126} width={R - L} height={26} fill={K.walk} />
        {cars}
        {/* river segments */}
        {[[L, R]].map(() => {
          const segs: [number, number][] = [];
          let s = L;
          for (const [a, b] of RIVER_GAPS) {
            if (b < s || a > R) continue;
            if (a > s) segs.push([s, Math.min(a, R)]);
            s = Math.max(s, b);
          }
          if (s < R) segs.push([s, R]);
          return segs.map(([a, b]) => (
            <g key={a}>
              <rect x={a} y={riverY - 8} width={b - a} height={riverH + 16} fill="#3E9FE0" />
              <rect x={a} y={riverY} width={b - a} height={riverH} fill={K.water} />
            </g>
          ));
        })}
        {DESERT[0] < R && DESERT[1] > L && (
          <g>
            <rect x={DESERT[0]} y={riverY} width={DESERT[1] - DESERT[0]} height={riverH} fill={K.sand2} />
            {Array.from({length: 12}, (_, i) => (
              <path key={i} d={`M${DESERT[0] + 60 + i * 120} ${riverY + 30} l 30 20 l -16 24 l 36 18`} fill="none" stroke="#C98F4E" strokeWidth={4} />
            ))}
          </g>
        )}
        {ripples}
        {/* the far bank: a footpath, trees and flower beds so wide shots have a foreground */}
        <rect x={L} y={riverY + riverH + 60} width={R - L} height={34} rx={17} fill="#E9D9A6" />
        {Array.from({length: Math.ceil((R - L) / 260) + 1}, (_, i) => {
          const x = Math.floor(L / 260) * 260 + i * 260;
          const rr = random(`fb${x}`);
          const sandy = x > DESERT[0] && x < DESERT[1];
          return (
            <g key={`fb${x}`}>
              {rr > 0.45 ? at(x + rr * 80, riverY + riverH + 250, sandy ? <A.Cactus s={0.7} /> : <A.RoundTree s={0.9 + rr * 0.4} t={t} seed={x} />) : at(x, riverY + riverH + 200, <A.Bush s={0.9} />)}
              {[0, 1, 2].map((k) => (
                <circle key={k} cx={x + 120 + k * 22} cy={riverY + riverH + 140 + (k % 2) * 10} r={7} fill={[K.pink, K.yellow, K.white][(k + i) % 3]} />
              ))}
              <rect x={x} y={riverY + riverH + 330} width={250} height={40} rx={20} fill={i % 2 ? K.grass2 : '#6BD07C'} />
              <rect x={x + 20} y={riverY + riverH + 400} width={220} height={40} rx={20} fill={i % 2 ? '#6BD07C' : K.grass2} />
            </g>
          );
        })}
        {walkers(false)}
        {draw(FRONT)}
        {children}
      </g>
      {/* night tint */}
      {n > 0.01 && <rect width={1920} height={1080} fill="#1B1F5A" opacity={n * 0.32} style={{mixBlendMode: 'multiply'}} />}
    </svg>
  );
};
