// Chapter 3, "The water" (film 657–905 s): sweat and evaporative cooling, water use vs consumption, AI drinks twice,
// back to The Dalles (the cold open's isometric town), the trade-secret lawsuit, 355M gallons and 29% of the city's
// water, the fair point and the dry places, Montevideo 2023, the 2022 jumps at Microsoft and Google, a bottle or a
// few drops per answer, and the turn from machines to people. The board maps at 777.6 s and 817.8 s stay as they are.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';
import {Bars, Bg, Cam, Caption, Chip, CloudShape, CoolingTower, Counter, DataCentre, Doc, Drop, Fan, Flow, Gavel, House, Label, Person, Pipe, Pop, PowerPlant, Put, Pylon, Rack, Sun, Thermometer, World, shade} from './lib';

/* ================================================================== local drawings */
/** A tag placed in world space (inside a Cam): anchored at its bottom edge. */
const WTag: React.FC<{x: number; y: number; k: number; children: React.ReactNode; bg?: string; color?: string; size?: number; anchor?: 'c' | 'l' | 'r'}> = ({x, y, k, children, bg = P.white, color = P.ink, size = 40, anchor = 'c'}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : anchor === 'l' ? '0%' : '-100%'},-100%) scale(${k})`, transformOrigin: anchor === 'c' ? '50% 100%' : anchor === 'l' ? '0% 100%' : '100% 100%', opacity: Math.min(1, k)}}>
      <Tag bg={bg} color={color} size={size}>
        {children}
      </Tag>
    </div>
  );

/** A rubber stamp that slams down (screen space). */
const Stamp: React.FC<{text: string; k: number; x: number; y: number; rot: number; color?: string; size?: number}> = ({text, k, x, y, rot, color = P.red, size = 84}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.2, 1, Math.min(1, k))})`, opacity: Math.min(1, k * 2), border: `${size / 8.4}px solid ${color}`, borderRadius: size / 4.7, padding: `${size / 7}px ${size / 2.5}px`, fontFamily: AF.head, fontWeight: 800, fontSize: size, color, letterSpacing: '0.04em', whiteSpace: 'nowrap', background: 'rgba(255,248,236,0.95)'}}>
      {text}
    </div>
  );

/** A city hall: steps, columns and a pediment. */
const CityHall: React.FC = () => (
  <g>
    <rect x={-170} y={90} width={340} height={20} fill="#B8C3D9" />
    <rect x={-150} y={70} width={300} height={20} fill="#D5DBE6" />
    <rect x={-140} y={-40} width={280} height={110} fill="#F4F1E8" />
    {[-115, -70, -25, 25, 70, 115].map((x) => (
      <rect key={x} x={x - 9} y={-40} width={18} height={110} fill="#DCD6C6" />
    ))}
    <rect x={-150} y={-56} width={300} height={18} fill="#E6E0D0" />
    <path d="M-160 -56 L0 -130 L160 -56 Z" fill="#F4F1E8" />
    <path d="M-120 -64 L0 -116 L120 -64 Z" fill="#DCD6C6" />
    <line x1={0} y1={-130} x2={0} y2={-200} stroke="#7C8AA8" strokeWidth={5} />
    <path d="M0 -200 H46 V-176 H0 Z" fill={P.sky} />
  </g>
);

/** A folded local newspaper (generic: no masthead). */
const Paper: React.FC = () => (
  <g>
    <rect x={-120} y={-150} width={240} height={300} rx={6} fill="#F7F3EA" />
    <rect x={-100} y={-130} width={200} height={34} fill="#1C1B19" />
    <text x={0} y={-104} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={26} fill="#F7F3EA" letterSpacing={6}>
      NEWS
    </text>
    <rect x={-100} y={-80} width={200} height={22} rx={3} fill="#3A3833" />
    <rect x={-100} y={-50} width={150} height={22} rx={3} fill="#3A3833" />
    {Array.from({length: 7}, (_, i) => (
      <g key={i}>
        <rect x={-100} y={-12 + i * 20} width={92} height={8} rx={4} fill="#CFC8BA" />
        <rect x={8} y={-12 + i * 20} width={92} height={8} rx={4} fill="#CFC8BA" />
      </g>
    ))}
  </g>
);

/** A plastic bottle (about 440 units tall) filled to `level` (0–1), the surface rippling. */
const Bottle: React.FC<{level: number; f: number; c?: string}> = ({level, f, c = P.water}) => {
  const id = React.useId();
  const d = 'M-30 -200 H30 V-160 C30 -130 90 -120 90 -80 V170 Q90 200 60 200 H-60 Q-90 200 -90 170 V-80 C-90 -120 -30 -130 -30 -160 Z';
  const top = 200 - 400 * level;
  const wave = Array.from({length: 13}, (_, i) => `L${-100 + i * 17} ${top + Math.sin(f / 5 + i) * 4}`).join(' ');
  return (
    <g>
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
      <path d={d} fill="rgba(255,255,255,0.16)" />
      <path d={`M-100 ${top} ${wave} L104 220 L-100 220 Z`} fill={c} opacity={0.9} clipPath={`url(#${id})`} />
      <path d={d} fill="none" stroke={P.white} strokeWidth={6} />
      <rect x={-36} y={-236} width={72} height={36} rx={8} fill={P.blue} />
      <rect x={-90} y={-20} width={180} height={70} fill={P.white} opacity={0.85} />
      <text x={0} y={27} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={40} fill={P.ink}>
        500 ml
      </text>
    </g>
  );
};

/** A teaspoon, bowl centred on 0,0. With `slices` the bowl is marked in 15ths and `fill` of them hold water. */
const Spoon: React.FC<{slices?: number; fill?: number; f?: number}> = ({slices = 0, fill = 0, f = 0}) => {
  const id = React.useId();
  return (
    <g>
      <rect x={100} y={-14} width={330} height={28} rx={14} fill="#C9D2E6" transform="rotate(-6 100 0)" />
      <ellipse rx={130} ry={78} fill="#DCE3F2" />
      <ellipse rx={112} ry={62} fill="#AEB8CC" />
      <clipPath id={id}>
        <ellipse rx={112} ry={62} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {fill > 0 && <rect x={-112} y={-62} width={(224 / 15) * fill} height={124} fill={P.water} />}
        {slices > 0 &&
          Array.from({length: 14}, (_, i) => (
            <line key={i} x1={-112 + (224 / 15) * (i + 1)} y1={-62} x2={-112 + (224 / 15) * (i + 1)} y2={62} stroke={P.white} strokeWidth={2.5} opacity={slices} />
          ))}
      </g>
      <ellipse rx={112} ry={62} fill="none" stroke="#8F9AB4" strokeWidth={4} />
      {fill > 0 && <circle cx={-112 + 112 / 15} cy={-4 + Math.sin(f / 6) * 2} r={4} fill={P.white} opacity={0.8} />}
    </g>
  );
};

/** A kitchen tap; drops fall from the spout in colour `c`. */
const Tap: React.FC<{f: number; c?: string}> = ({f, c = P.water}) => (
  <g>
    <rect x={-20} y={-220} width={40} height={140} fill="#AEB8CC" />
    <path d="M-20 -100 H120 Q150 -100 150 -70 V-40 H110 V-60 H-20 Z" fill="#C9D2E6" />
    <rect x={-50} y={-250} width={100} height={34} rx={10} fill="#8F9AB4" />
    {Array.from({length: 4}, (_, i) => {
      const k = ((f / 18 + i / 4) % 1);
      return (
        <g key={i} transform={`translate(130,${-30 + k * 230}) scale(0.22)`} opacity={k < 0.92 ? 1 : 0}>
          <Drop c={c} />
        </g>
      );
    })}
    {/* a glass under it */}
    <path d="M60 140 L200 140 L188 260 L72 260 Z" fill="rgba(255,255,255,0.2)" stroke={P.white} strokeWidth={5} />
    <path d="M66 200 L194 200 L188 260 L72 260 Z" fill={c} opacity={0.85} />
  </g>
);

const Cactus: React.FC = () => (
  <g fill="#3E9B5C">
    <rect x={-18} y={-120} width={36} height={130} rx={18} />
    <rect x={-60} y={-80} width={28} height={60} rx={14} />
    <rect x={-60} y={-40} width={60} height={24} rx={12} />
    <rect x={32} y={-100} width={28} height={56} rx={14} />
    <rect x={0} y={-62} width={60} height={24} rx={12} />
  </g>
);

/* ================================================================== The Dalles, isometric (same town as the cold open) */
const C30 = Math.cos(Math.PI / 6);
const DX = 1500, DY = 200;
const iso = (x: number, y: number, z = 0): [number, number] => [(x - y) * C30 + DX, (x + y) * 0.5 - z + DY];
const pts = (a: [number, number][]) => a.map((p) => p.join(',')).join(' ');
type Box = {x: number; y: number; w: number; d: number; h: number; top: string; side: string};
const BoxShape: React.FC<{b: Box}> = ({b}) => {
  const {x, y, w, d, h} = b;
  const top = [iso(x, y, h), iso(x + w, y, h), iso(x + w, y + d, h), iso(x, y + d, h)];
  const right = [iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x + w, y, h)];
  const left = [iso(x, y + d, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x, y + d, h)];
  return (
    <g>
      <polygon points={pts(left)} fill={shade(b.side, 0.82)} />
      <polygon points={pts(right)} fill={shade(b.side, 0.64)} />
      <polygon points={pts(top)} fill={b.top} />
    </g>
  );
};
const ROOFS = [P.red, P.yellow, P.orange, P.teal, P.pink, P.purple, '#FF9F43'];
// the same houses as the cold open (same seeds)
const HOUSES: Box[] = [];
for (let i = 0; i < 6; i++)
  for (let j = 0; j < 5; j++) {
    if (random(`h${i}-${j}`) < 0.18) continue;
    HOUSES.push({x: 300 + i * 105 + random(`hx${i}${j}`) * 20, y: 380 + j * 110 + random(`hy${i}${j}`) * 20, w: 62, d: 58, h: 34 + random(`hh${i}${j}`) * 26, top: ROOFS[Math.floor(random(`r${i}${j}`) * ROOFS.length)], side: '#FFF1DC'});
  }
const DC1: Box = {x: 1040, y: 520, w: 330, d: 300, h: 74, top: '#DDE6F5', side: '#F4F7FC'};
const DC2: Box = {x: 1040, y: 880, w: 330, d: 200, h: 64, top: '#DDE6F5', side: '#F4F7FC'};
const DAM: Box = {x: 180, y: 30, w: 46, d: 214, h: 34, top: '#D5DBE6', side: '#B8C3D9'};
const TOWER = {x: 900, y: 300};
const PIPE: [number, number][] = [[TOWER.x, TOWER.y], [1205, TOWER.y], [1205, 520]];
const TREES = Array.from({length: 90}, (_, i) => ({x: -400 + random(`dt${i}`) * 2100, y: 270 + random(`du${i}`) * 1250, r: 16 + random(`dr${i}`) * 12})).filter(
  (t) => !(t.x > 1000 && t.x < 1410 && t.y > 480 && t.y < 1110) && !(t.x > 270 && t.x < 980 && t.y > 350 && t.y < 970) && !(t.x > -480 && t.x < 180 && t.y > 370 && t.y < 1030) && !(t.x > 560 && t.x < 960 && t.y < 340),
);
const RIDGES = Array.from({length: 4}, (_, r) => Array.from({length: 22}, (_, i) => ({x: -1500 + i * 240, z: 50 + random(`rg${r}-${i}`) * 120 + r * 30})));
const RESIDENTS: [number, number, string][] = [[400, 476, P.teal], [620, 696, P.pink], [820, 586, P.purple]];
const DC_TOP = iso(DC1.x + DC1.w / 2, DC1.y + DC1.d / 2, DC1.h + 40);
const TOWER_TOP = iso(TOWER.x, TOWER.y, 196);
const PIPE_MID = iso(1205, 410, 0);

const Dalles: React.FC<{f: number; flow?: number; dam?: number; farm?: number; people?: number; townFlow?: number; infra?: number; glow?: number; ask?: number}> = ({f, flow = 1, dam = 0, farm = 0, people = 0, townFlow = 0, infra = 0, glow = 0, ask = 0}) => {
  const drawn = [...HOUSES.map((b) => ({b, o: b.x + b.y})), {b: DC1, o: DC1.x + DC1.y}, {b: DC2, o: DC2.x + DC2.y}].sort((a, b) => a.o - b.o);
  const streets: [number, number][][] = [[[900, 300], [900, 360], [270, 360]], [[960, 360], [960, 800]], ...[1, 2, 3, 4].map((j) => [[960, 360 + j * 110], [270, 360 + j * 110]] as [number, number][])];
  const isoLine = (p: [number, number][], z = 3) => pts(p.map(([x, y]) => iso(x, y, z)));
  const pylons: [number, number][] = [[420, 300], [700, 400], [950, 470]];
  const wire: [number, number][] = [iso(205, 244, 40), ...pylons.map(([x, y]) => iso(x, y, 72)), iso(1060, 540, 84)];
  return (
    <g>
      {/* the far bank: dry gold hills of the gorge */}
      <polygon points={pts([iso(-1500, -1300), iso(3500, -1300), iso(3500, 30), iso(-1500, 60)])} fill="#C9A86A" />
      {RIDGES.map((row, r) => {
        const y = -160 - r * 230;
        const top = row.map((p) => iso(p.x, y, p.z));
        return <polygon key={r} points={pts([iso(-1500, y), ...top, iso(3700, y)])} fill={shade('#C9A86A', 0.86 + r * 0.04)} />;
      }).reverse()}
      <polygon points={pts([iso(-1500, 220), iso(3500, 200), iso(3500, 2300), iso(-1500, 2300)])} fill={P.grass} />
      {/* the Columbia */}
      <polygon points={pts([iso(-1500, 60), iso(3500, 30), iso(3500, 210), iso(-1500, 240)])} fill={P.water} />
      {Array.from({length: 18}, (_, i) => {
        const x0 = ((i * 290 + f * 4) % 5000) - 1500;
        const y0 = 90 + (i % 4) * 32;
        return <polyline key={i} points={pts([iso(x0, y0), iso(x0 + 90, y0 - 2)])} stroke="#BFE8FF" strokeWidth={6} strokeLinecap="round" />;
      })}
      {/* the dam across the river, and its power line to the data centre */}
      <BoxShape b={DAM} />
      {Array.from({length: 5}, (_, i) => {
        const k = (f / 14 + i / 5) % 1;
        return <polyline key={i} points={pts([iso(232 + k * 160, 60 + i * 38), iso(262 + k * 160, 60 + i * 38)])} stroke={P.white} strokeWidth={5} strokeLinecap="round" opacity={1 - k} />;
      })}
      {pylons.map(([x, y], i) => {
        const [sx, sy] = iso(x, y);
        return (
          <g key={i} stroke="#7C8AA8" strokeWidth={4}>
            <line x1={sx - 10} y1={sy} x2={sx} y2={sy - 72} />
            <line x1={sx + 10} y1={sy} x2={sx} y2={sy - 72} />
            <line x1={sx - 16} y1={sy - 62} x2={sx + 16} y2={sy - 62} />
          </g>
        );
      })}
      <polyline points={pts(wire)} stroke="#5B6B8C" strokeWidth={3} fill="none" />
      {dam > 0 && <Flow pts={wire} f={f} c={P.yellow} n={10} r={8} speed={7} o={dam} />}
      {/* farm on the near bank, with an irrigation line */}
      <polygon points={pts([iso(-450, 400), iso(150, 400), iso(150, 1000), iso(-450, 1000)])} fill="#9BCB5A" />
      {Array.from({length: 12}, (_, i) => (
        <polyline key={i} points={pts([iso(-430 + i * 50, 410), iso(-430 + i * 50, 990)])} stroke="#5E9E3A" strokeWidth={10} strokeLinecap="round" />
      ))}
      <polyline points={pts([iso(-150, 300), iso(-150, 990)])} stroke="#5B6B8C" strokeWidth={6} />
      {farm > 0 &&
        Array.from({length: 7}, (_, i) => {
          const [sx, sy] = iso(-150, 450 + i * 80, 4);
          return (
            <g key={i} opacity={farm}>
              {Array.from({length: 6}, (_, j) => {
                const a = f / 6 + (j * Math.PI) / 3;
                return <circle key={j} cx={sx + Math.cos(a) * 26} cy={sy - 10 + Math.sin(a) * 13} r={4} fill="#BFE8FF" />;
              })}
            </g>
          );
        })}
      {/* streets, and the town's water pipes under them */}
      {[0, 1, 2, 3, 4, 5].map((j) => (
        <polygon key={j} points={pts([iso(270, 360 + j * 110), iso(960, 360 + j * 110), iso(960, 372 + j * 110), iso(270, 372 + j * 110)])} fill="#E9F7D9" opacity={0.9} />
      ))}
      {(townFlow > 0 || infra > 0) &&
        streets.map((s, i) => (
          <g key={i}>
            {infra > 0 && <polyline points={isoLine(s)} stroke={P.yellow} strokeWidth={16} fill="none" opacity={infra * (0.6 + 0.4 * Math.sin(f / 5))} strokeLinejoin="round" />}
            <polyline points={isoLine(s)} stroke="#5B6B8C" strokeWidth={8} fill="none" strokeLinejoin="round" />
            <polyline points={isoLine(s)} stroke={P.water} strokeWidth={4} strokeDasharray="12 10" strokeDashoffset={-f * 3} fill="none" opacity={Math.max(townFlow, infra)} strokeLinejoin="round" />
          </g>
        ))}
      {/* water works by the river (paid for in part by Google, it says) */}
      {infra > 0 && (
        <g opacity={infra}>
          <polyline points={isoLine([[640, 215], [640, 270], [900, 300]])} stroke={P.yellow} strokeWidth={16} fill="none" opacity={0.6 + 0.4 * Math.sin(f / 5)} />
          <polyline points={isoLine([[640, 215], [640, 270], [900, 300]])} stroke={P.water} strokeWidth={6} strokeDasharray="12 10" strokeDashoffset={-f * 3} fill="none" />
          {[[600, 262], [700, 262]].map(([x, y], i) => {
            const [sx, sy] = iso(x, y);
            return (
              <g key={i}>
                <rect x={sx - 36} y={sy - 40} width={72} height={40} fill="#B8C3D9" />
                <ellipse cx={sx} cy={sy} rx={36} ry={18} fill="#B8C3D9" />
                <ellipse cx={sx} cy={sy - 40} rx={36} ry={18} fill={P.water} stroke="#DDE6F5" strokeWidth={5} />
              </g>
            );
          })}
        </g>
      )}
      {/* the pipe from the town's water to the data centre */}
      {glow > 0 && <polyline points={isoLine(PIPE, 6)} stroke={P.yellow} strokeWidth={30} fill="none" strokeLinejoin="round" opacity={glow * (0.55 + 0.45 * Math.sin(f / 4))} />}
      <polyline points={isoLine(PIPE, 6)} stroke="#5B6B8C" strokeWidth={16} fill="none" strokeLinejoin="round" />
      <polyline points={isoLine(PIPE, 6)} stroke={P.water} strokeWidth={8} strokeDasharray="18 16" strokeDashoffset={-f * 4} fill="none" strokeLinejoin="round" opacity={flow} />
      {TREES.map((t, i) => {
        const [sx, sy] = iso(t.x, t.y);
        return (
          <g key={i}>
            <rect x={sx - 3} y={sy - 14} width={6} height={16} fill="#7A4E2D" />
            <circle cx={sx} cy={sy - 22} r={t.r} fill={i % 3 ? P.green : '#1A9A50'} />
          </g>
        );
      })}
      {/* the water tower */}
      {(() => {
        const [sx, sy] = iso(TOWER.x, TOWER.y);
        return (
          <g>
            {[-30, 30].map((dx) => (
              <line key={dx} x1={sx + dx} y1={sy} x2={sx + dx * 0.5} y2={sy - 120} stroke="#7C8AA8" strokeWidth={8} />
            ))}
            <rect x={sx - 52} y={sy - 190} width={104} height={74} rx={10} fill="#DDE6F5" />
            <ellipse cx={sx} cy={sy - 190} rx={52} ry={18} fill="#F4F7FC" />
            <ellipse cx={sx} cy={sy - 116} rx={52} ry={16} fill="#B7C4DD" />
            <rect x={sx - 52} y={sy - 172} width={104} height={20} fill={P.water} />
          </g>
        );
      })()}
      {drawn.map(({b}, i) => (
        <BoxShape key={i} b={b} />
      ))}
      {/* roof cooling units on both halls */}
      {[DC1, DC2].map((dc, n) =>
        Array.from({length: n ? 8 : 12}, (_, i) => {
          const x = dc.x + 30 + (i % 4) * 75;
          const y = dc.y + 30 + Math.floor(i / 4) * 85;
          const [sx, sy] = iso(x + 20, y + 20, dc.h);
          return (
            <g key={`${n}-${i}`} transform={`translate(${sx},${sy}) scale(1,0.5)`}>
              <circle r={26} fill="#9FB0D3" />
              <g transform={`rotate(${(f * 12 + i * 30) % 360})`}>
                <rect x={-22} y={-4} width={44} height={8} rx={4} fill="#5B6B8C" />
                <rect x={-4} y={-22} width={8} height={44} rx={4} fill="#5B6B8C" />
              </g>
            </g>
          );
        }),
      )}
      {/* people: gardeners with hoses, a farmer on the irrigation line */}
      {people > 0 &&
        [...RESIDENTS, [-150, 700, P.yellow] as [number, number, string]].map(([x, y, c], i) => {
          const [sx, sy] = iso(x, y);
          const s = 0.34;
          return (
            <g key={i} opacity={people}>
              <g transform={`translate(${sx},${sy - 80 * s}) scale(${s})`}>
                <Person c={c} f={f} />
              </g>
              {i < 3 && <path d={`M${sx + 14} ${sy - 36} q26 -26 52 14`} stroke="#BFE8FF" strokeWidth={5} fill="none" strokeDasharray="8 7" strokeDashoffset={-f * 2} strokeLinecap="round" />}
              {ask > 0 && (
                <text x={sx} y={sy - 80 - 12 * Math.sin(f / 8 + i)} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={54 * Math.min(1, ask)} fill={P.white} stroke={P.ink} strokeWidth={3} paintOrder="stroke" opacity={Math.min(1, ask)}>
                  ?
                </text>
              )}
            </g>
          );
        })}
    </g>
  );
};

/* ================================================================== 657.3 "You sweat... it carries heat away. You cool down." */
const skinY = (x: number) => 720 - 80 * Math.sin((Math.PI * (x + 300)) / 2600);
export const C3Sweat: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const evap = ease(f, w(661.22), w(665.2) - w(661.22));
  const vap = evap > 0 ? Math.min(1, evap * 5) * (1 - ease(f, w(665.9), 20)) : 0;
  const heat = ease(f, w(664.12), 12);
  const cool = ease(f, w(665.63), 26);
  const drops = [460, 680, 900, 1120, 1340, 1560].map((x, i) => ({x, y: skinY(x) - 6, i}));
  const skin = 'M-400 ' + skinY(-400) + ' ' + Array.from({length: 26}, (_, i) => `L${-400 + i * 120} ${skinY(-400 + i * 120)}`).join(' ') + ' L2700 1500 L-400 1500 Z';
  return (
    <Bg c="#FF8A3D" c2="#FFC56B" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 1000, 660, 1.45, 0, 0], [659.6, 1000, 660, 1.45, 0, 0], [661.4, 980, 600, 1.15, -6, 4], [664.0, 960, 540, 1.0, 0, 0]]}>
        <World>
          <Put x={1640} y={190} s={1.1}>
            <Sun f={f} />
          </Put>
          {/* heat from the sun beating down */}
          {Array.from({length: 6}, (_, i) => (
            <path key={i} d={`M${300 + i * 240} 120 q20 60 0 120 t0 120 t0 120`} stroke={P.red} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="30 26" strokeDashoffset={-f * 4} opacity={0.35 * (1 - cool)} />
          ))}
          {/* the skin, side-on, with a faint flush that fades as you cool */}
          <path d={skin} fill="#D9966A" />
          <path d={skin} fill={P.red} opacity={0.28 * (1 - cool)} />
          {Array.from({length: 30}, (_, i) => {
            const x = -200 + i * 80 + random(`pore${i}`) * 30;
            return <circle key={i} cx={x} cy={skinY(x) + 40 + random(`pz${i}`) * 200} r={4} fill="#B97A52" />;
          })}
          {drops.map(({x, y, i}) => {
            const k = pop(f, w(659.6) + i * 3, 12) * (1 - Math.min(1, evap * (1 + i * 0.12)));
            return (
              <g key={i}>
                {k > 0.01 && (
                  <g transform={`translate(${x},${y - 26 * k}) scale(${0.34 * k})`}>
                    <Drop c="#CFEFFF" />
                  </g>
                )}
                {/* vapour rising off the skin, carrying heat (red) with it */}
                {vap > 0 &&
                  Array.from({length: 4}, (_, j) => {
                    const p = (f / 36 + j / 4 + i * 0.17) % 1;
                    return (
                      <g key={j} opacity={(1 - p) * vap}>
                        <circle cx={x + Math.sin(p * 6 + i) * 30} cy={y - 40 - p * 420} r={16 + p * 30} fill={P.white} opacity={0.7} />
                        {heat > 0 && <circle cx={x + Math.sin(p * 6 + i) * 30 + 8} cy={y - 40 - p * 420} r={10} fill={P.red} opacity={heat} />}
                      </g>
                    );
                  })}
              </g>
            );
          })}
          <Put x={1760} y={520} s={1.25}>
            <Thermometer level={lerp(0.85, 0.35, cool)} />
          </Put>
        </World>
        <WTag x={900} y={skinY(900) - 90} k={pop(f, w(660.96), 12) * (1 - ease(f, w(661.9), 8))} bg={P.white} size={38}>
          Sweat
        </WTag>
        <WTag x={1120} y={skinY(1120) - 240} k={pop(f, w(661.3), 12) * (1 - ease(f, w(664.1), 8))} bg={P.sky} size={38}>
          It evaporates ↑
        </WTag>
        <WTag x={1120} y={250} k={pop(f, w(664.34), 12)} bg={P.red} color={P.white} size={40}>
          …and carries heat away
        </WTag>
      </Cam>
      <Label f={f} at={w(657.4)} title="Your body on a hot day" sub="sweat is a cooling system" bg={P.ink} color={P.white} />
      <Caption f={f} at={w(665.58)} dark>
        Evaporating water takes heat with it. You cool down.
      </Caption>
    </Bg>
  );
};

/* ================================================================== 666.6 hot air → water → cooling tower → sky */
export const C3Loop: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const air = ease(f, w(670.43), 12);
  const hotW = ease(f, w(672.2), 12);
  const coolW = ease(f, w(674.0), 12);
  const steam = 0.25 + 0.75 * ease(f, w(676.41), 16);
  const heat = ease(f, w(678.75), 12);
  const out: [number, number][] = [[1180, 430], [1560, 430], [1560, 470], [1712, 470]];
  const back: [number, number][] = [[1690, 805], [1100, 805], [1100, 580]];
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 560, 580, 1.12, 10, 4], [670.3, 560, 580, 1.12, 10, 4], [671.9, 820, 540, 1.0, 4, 2], [673.6, 1300, 540, 0.9, -6, 2], [676.3, 1760, 430, 0.95, -10, 4], [678.6, 1760, 380, 0.95, -6, 2], [679.9, 1180, 520, 0.68, 0, 0]]}>
        <World w={2400} h={1200}>
          <rect x={-600} y={880} width={3600} height={500} fill="#0B1638" />
          {/* the data hall */}
          <rect x={120} y={300} width={840} height={580} rx={14} fill="#101B45" stroke="#2F6BFF" strokeWidth={6} />
          {[260, 430, 600, 770].map((x, i) => (
            <Put key={x} x={x} y={735} s={0.95}>
              <Rack f={f + i * 5} busy={1} />
            </Put>
          ))}
          {/* hot air rising off the servers, drawn to the heat exchanger */}
          {[260, 430, 600, 770].map((x, i) => (
            <path key={i} d={`M${x} 625 q-18 -40 0 -80 t0 -80 t0 -80`} stroke={P.orange} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="34 24" strokeDashoffset={f * 5} opacity={air} />
          ))}
          <Flow pts={[[200, 350], [940, 350], [1000, 420]]} f={f} c={P.orange} n={7} r={10} speed={7} o={air} />
          {/* heat exchanger: a coil where the hot air warms the water */}
          <rect x={980} y={340} width={200} height={240} rx={18} fill="#26357A" />
          <path d="M1010 380 H1150 V420 H1010 V460 H1150 V500 H1010 V540 H1150" stroke={hotW > 0.5 ? P.orange : P.water} strokeWidth={12} fill="none" strokeLinejoin="round" />
          {/* out to the tower, back cooled */}
          <Pipe pts={out} f={f} flow={hotW} c={P.orange} />
          <Pipe pts={back} f={f} flow={coolW} c={P.sky} />
          <Flow pts={out} f={f} c={P.orange} n={5} r={9} speed={6} o={hotW} line={false} />
          <Flow pts={back} f={f} c={P.sky} n={6} r={9} speed={6} o={coolW} line={false} />
          <Put x={1800} y={620} s={2.1}>
            <CoolingTower f={f} steam={steam} />
          </Put>
          {/* water spraying down inside the tower */}
          {[1750, 1785, 1820, 1855].map((x, i) => (
            <line key={x} x1={x} y1={500} x2={x} y2={790} stroke={P.sky} strokeWidth={5} strokeDasharray="16 18" strokeDashoffset={-f * 5 - i * 9} opacity={0.8 * coolW} />
          ))}
          <rect x={1660} y={792} width={280} height={30} rx={8} fill={P.water} opacity={0.85} />
          {/* some of it leaves as vapour, the heat with it */}
          {Array.from({length: 8}, (_, i) => {
            const p = (f / 40 + i / 8) % 1;
            const k = ease(f, w(676.41), 12);
            return (
              <g key={i} opacity={(1 - p) * k}>
                <g transform={`translate(${1790 + Math.sin(p * 5 + i) * 60},${380 - p * 420}) scale(0.18)`}>
                  <Drop c="#CFEFFF" />
                </g>
                {heat > 0 && <circle cx={1820 + Math.sin(p * 5 + i) * 60} cy={360 - p * 420} r={11} fill={P.red} opacity={heat} />}
              </g>
            );
          })}
        </World>
        <WTag x={540} y={270} k={pop(f, w(670.43), 12) * (1 - ease(f, w(673.3), 8)) + ease(f, w(679.6), 10)} bg={P.orange} color={P.ink} size={42}>
          1 · Hot air from the servers
        </WTag>
        <WTag x={1080} y={665} k={pop(f, w(671.93), 12)} bg={P.white} size={42}>
          2 · heats up water
        </WTag>
        <WTag x={1340} y={400} k={pop(f, w(673.58), 12)} bg={P.white} size={42}>
          3 · flows to a cooling tower
        </WTag>
        <WTag x={1400} y={900} k={pop(f, w(674.6), 12)} bg={P.sky} size={36}>
          cooled water goes round again
        </WTag>
        <WTag x={1800} y={150} k={pop(f, w(676.41), 12)} bg={P.white} size={42}>
          4 · some evaporates into the sky
        </WTag>
        <WTag x={1800} y={250} k={pop(f, w(678.75), 12)} bg={P.red} color={P.white} size={42}>
          …and the heat leaves with it
        </WTag>
      </Cam>
      <Label f={f} at={w(666.9)} title="Many data centres sweat too" sub="evaporative cooling" bg={P.yellow} />
    </Bg>
  );
};

/* ================================================================== 681.0 "It's gone... water consumption, not just water use" */
export const C3Gone: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const x1 = pop(f, w(684.88), 10);
  const x2 = pop(f, w(686.82), 10);
  const defs = ease(f, w(692.0), 12);
  const Cross: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) =>
    k <= 0 ? null : (
      <g transform={`translate(${x},${y}) scale(${k})`}>
        <circle r={46} fill={P.white} />
        <path d="M-22 -22 L22 22 M22 -22 L-22 22" stroke={P.red} strokeWidth={12} strokeLinecap="round" />
      </g>
    );
  return (
    <Bg c="#2C7FB8" c2="#9BD3F0" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.0, 0, 0], [682.9, 1020, 500, 1.1, -6, 3], [686.0, 1220, 600, 1.05, 6, 2], [688.2, 1150, 440, 0.95, 0, 6], [691.8, 960, 540, 1.0, 0, 0]]}>
        <World w={2200} h={1200}>
          {/* green bank and the river */}
          <path d="M-400 820 Q300 760 900 800 T2400 780 V1300 H-400 Z" fill="#4FA35A" />
          <rect x={-400} y={920} width={2800} height={400} fill={P.water} />
          {Array.from({length: 12}, (_, i) => (
            <rect key={i} x={((i * 260 + f * 5) % 2800) - 400} y={960 + (i % 3) * 40} width={110} height={8} rx={4} fill="#BFE8FF" />
          ))}
          {/* river → data centre */}
          <Pipe pts={[[560, 1010], [560, 860]]} f={f} c={P.water} />
          <Put x={760} y={790} s={1.5}>
            <DataCentre f={f} busy={1} />
          </Put>
          <Put x={1090} y={740} s={1.15}>
            <CoolingTower f={f} steam={1.2} />
          </Put>
          {/* the town downstream */}
          {[1450, 1590, 1730, 1870].map((x, i) => (
            <Put key={x} x={x} y={800 - (i % 2) * 14} s={0.8}>
              <House c={[P.red, P.teal, P.purple, P.orange][i]} />
            </Put>
          ))}
          {/* vapour drifting up and away, off the top of the frame */}
          {Array.from({length: 16}, (_, i) => {
            const p = (f / 70 + i / 16) % 1;
            return <circle key={i} cx={1100 + p * 900 + Math.sin(i * 2 + p * 4) * 40} cy={600 - p * 900} r={34 + p * 50} fill={P.white} opacity={(1 - p) * 0.75} />;
          })}
          {/* back to the river? back to the town? */}
          <g opacity={1 - defs * 0.7}>
            <path d="M1180 420 Q1330 650 1250 900" stroke={P.white} strokeWidth={8} strokeDasharray="20 16" fill="none" opacity={ease(f, w(684.53), 10)} />
            <Cross x={1290} y={680} k={x1} />
            <path d="M1300 380 Q1600 450 1660 720" stroke={P.white} strokeWidth={8} strokeDasharray="20 16" fill="none" opacity={ease(f, w(686.7), 10)} />
            <Cross x={1550} y={480} k={x2} />
          </g>
        </World>
        <WTag x={1250} y={900} k={pop(f, w(685.5), 12) * (1 - defs)} bg={P.white} size={36}>
          back into the river?
        </WTag>
        <WTag x={1720} y={720} k={pop(f, w(687.0), 12) * (1 - defs)} bg={P.white} size={36}>
          back to the town?
        </WTag>
      </Cam>
      <Pop f={f} at={w(688.27)} x={1480} y={240} size={130} until={w(691.7)}>
        Gone
      </Pop>
      <Caption f={f} at={w(688.93)} until={w(691.8)} dark>
        Carried away as vapour
      </Caption>
      {defs > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center', gap: 50, opacity: defs}}>
          <div style={{width: 760, background: P.yellow, borderRadius: 30, padding: '30px 40px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', transform: `scale(${pop(f, w(693.4), 12)})`}}>
            <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 54, color: P.ink}}>Water consumption</div>
            <div style={{fontFamily: AF.head, fontWeight: 600, fontSize: 34, color: P.ink, marginTop: 8}}>taken out, and never comes back</div>
          </div>
          <div style={{width: 760, background: P.white, borderRadius: 30, padding: '30px 40px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', transform: `scale(${pop(f, w(694.9), 12)})`}}>
            <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 54, color: P.ink}}>Water use</div>
            <div style={{fontFamily: AF.head, fontWeight: 600, fontSize: 34, color: P.ink, marginTop: 8}}>taken out; some may flow back</div>
          </div>
        </div>
      )}
      <div style={{opacity: 1 - defs}}>
        <Label f={f} at={w(681.4)} title="The important part" bg={P.ink} color={P.white} />
      </div>
    </Bg>
  );
};

/* ================================================================== 695.9 power plants drink too: AI drinks twice */
export const C3Twice: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const plant = ease(f, w(698.5), 12);
  const water = ease(f, w(702.3), 14);
  const Badge: React.FC<{x: number; y: number; n: string; k: number}> = ({x, y, n, k}) =>
    k <= 0 ? null : (
      <g transform={`translate(${x},${y + Math.sin(f / 8) * 8}) scale(${1.1 * k})`}>
        <Drop c={P.water} />
        <path d="M0 -80 C0 -80 -55 -5 -55 25 A55 55 0 0 0 55 25 C55 -5 0 -80 0 -80 Z" fill="none" stroke={P.white} strokeWidth={6} />
        <text y={52} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={80} fill={P.white}>
          {n}
        </text>
      </g>
    );
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 2450, 600, 1.05, -8, 2], [698.3, 2450, 600, 1.05, -8, 2], [700.0, 900, 580, 0.95, 10, 3], [702.4, 1050, 580, 1.1, 6, 2], [704.4, 1650, 560, 0.55, 0, 2], [709.6, 1650, 560, 0.57, 0, 2]]}>
        <World w={3300} h={1300}>
          <rect x={-800} y={820} width={4900} height={700} fill="#1E3A3A" />
          <rect x={-800} y={930} width={4900} height={100} fill={P.water} />
          {Array.from({length: 14}, (_, i) => (
            <rect key={i} x={((i * 360 + f * 6) % 4900) - 800} y={955 + (i % 3) * 24} width={120} height={7} rx={4} fill="#BFE8FF" />
          ))}
          {/* the power plant and its cooling towers */}
          <Put x={560} y={720} s={1.9}>
            <PowerPlant f={f} />
          </Put>
          {[980, 1250].map((x, i) => (
            <Put key={x} x={x} y={640} s={1.6}>
              <CoolingTower f={f + i * 20} steam={0.5 + 0.8 * water} />
            </Put>
          ))}
          {/* river water up into the towers */}
          {[1000, 1270].map((x) => (
            <Pipe key={x} pts={[[x + 40, 985], [x + 40, 800]]} f={f} c={P.water} flow={0.4 + 0.6 * water} />
          ))}
          {/* the power line */}
          {[1640, 2030].map((x) => (
            <Put key={x} x={x} y={690} s={1.4}>
              <Pylon />
            </Put>
          ))}
          <Flow pts={[[700, 480], [1640, 610], [2030, 610], [2320, 640]]} f={f} c={P.yellow} n={10} r={11} speed={9} o={0.4 + 0.6 * plant} />
          {/* the data centre and its tower */}
          <Put x={2450} y={720} s={1.9}>
            <DataCentre f={f} busy={1} />
          </Put>
          <Put x={2880} y={660} s={1.25}>
            <CoolingTower f={f + 9} />
          </Put>
          <Pipe pts={[[2930, 985], [2930, 790]]} f={f} c={P.water} />
          <Badge x={2450} y={380} n="1" k={pop(f, w(706.65), 12)} />
          <Badge x={1110} y={270} n="2" k={pop(f, w(708.12), 12)} />
        </World>
        <WTag x={560} y={900} k={pop(f, w(698.6), 12)} bg={P.white} size={52}>
          Power plant
        </WTag>
        <WTag x={1130} y={1120} k={pop(f, w(702.77), 12)} bg={P.water} color={P.white} size={52}>
          river water for cooling
        </WTag>
        <WTag x={2560} y={900} k={pop(f, w(696.2), 12)} bg={P.white} size={52}>
          Data centre
        </WTag>
      </Cam>
      <Label f={f} at={w(696.41)} title="A second, hidden layer" sub="the electricity has a water bill too" bg={P.yellow} />
      <Caption f={f} at={w(704.38)}>
        AI drinks twice: at the data centre, and at the power plant
      </Caption>
    </Bg>
  );
};

/* ================================================================== 709.6 back to The Dalles: hydropower, cool climate */
export const C3Dalles: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const dam = ease(f, w(714.6), 12);
  const cool = ease(f, w(716.38), 16);
  const reasons: [string, number, string][] = [['Cheap hydropower', 714.05, P.yellow], ['Cool climate', 716.38, P.sky], ['= a perfect place for a data centre', 717.89, P.green]];
  return (
    <AbsoluteFill style={{background: `linear-gradient(${P.sky}, #9BD9FF)`, overflow: 'hidden'}}>
      <Cam f={f} t0={t0} keys={[[t0, 1750, 760, 0.42, 0, 0], [711.2, 1820, 840, 0.6, 0, 0], [713.4, 1960, 990, 0.85, -4, 4], [714.7, 1720, 720, 0.6, 4, 4], [719.6, 1800, 800, 0.55, 0, 0]]}>
        <World w={3600} h={2200}>
          <Dalles f={f} dam={dam} />
        </World>
        <WTag x={DC_TOP[0]} y={DC_TOP[1]} k={pop(f, w(711.27), 12)} bg={P.ink} color={P.white} size={60}>
          Google · here since the mid-2000s
        </WTag>
        <WTag x={iso(1100, 125)[0]} y={iso(1100, 125)[1]} k={pop(f, w(715.6), 12)} bg={P.water} color={P.white} size={60}>
          Columbia River
        </WTag>
        <WTag x={iso(203, 30, 40)[0]} y={iso(203, 30, 40)[1]} k={pop(f, w(714.6), 12)} bg={P.yellow} size={60}>
          hydropower dam
        </WTag>
      </Cam>
      {/* cool air drifting down the gorge */}
      {cool > 0 &&
        [0, 1, 2].map((i) => (
          <svg key={i} width={360} height={200} viewBox="-130 -90 260 150" style={{position: 'absolute', left: ((i * 700 + f * 3) % 2400) - 400, top: 230 + i * 70, opacity: 0.85 * cool}}>
            <CloudShape c={P.white} />
          </svg>
        ))}
      <Label f={f} at={w(710.3)} title="The Dalles, Oregon" sub="population ~16,000 · on the Columbia River" bg={P.ink} color={P.white} />
      <div style={{position: 'absolute', right: 80, bottom: 90, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-end'}}>
        {reasons.map(([t, a, c]) => (
          <div key={t} style={{opacity: ease(f, w(a), 8), transform: `scale(${pop(f, w(a), 12)})`, transformOrigin: '100% 50%'}}>
            <Tag bg={c} color={P.ink} size={40}>
              {t}
            </Tag>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== 719.6 more water rights, the question, "trade secret", sued */
export const C3Secret: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const go = ease(f, w(721.72), w(723.3) - w(721.72));
  const docX = lerp(560, 1640, go), docY = 520 - Math.sin(Math.PI * go) * 160;
  const rights = ease(f, w(722.63), 12);
  const secret = pop(f, w(729.67), 8);
  const court = pop(f, w(732.4), 8);
  const hit = Math.max(0, Math.min(1, (f - w(732.2)) / 6));
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 600, 560, 1.1, 8, 2], [721.6, 600, 560, 1.1, 8, 2], [722.9, 1200, 540, 0.8, 0, 2], [724.2, 1150, 620, 0.95, -4, 4], [728.0, 1200, 560, 0.8, 0, 0], [733.8, 1200, 560, 0.84, 0, 0]]}>
        <World w={2400} h={1200}>
          <rect x={-600} y={760} width={3600} height={600} fill="#0F1C4A" />
          <Put x={500} y={660} s={1.5}>
            <CityHall />
          </Put>
          <Put x={1850} y={660} s={1.7}>
            <DataCentre f={f} />
          </Put>
          {/* the extra water, once the rights are granted */}
          <Pipe pts={[[700, 800], [1600, 800]]} f={f} c={P.water} flow={rights} />
          {go > 0 && (
            <g transform={`translate(${docX},${docY}) scale(0.9) rotate(${-8 + 16 * go})`}>
              <Doc title="WATER RIGHTS" />
            </g>
          )}
          {/* the local paper */}
          <Put x={1150} y={1000} s={1.2} f={f} at={w(724.3)}>
            <Paper />
          </Put>
        </World>
        <WTag x={500} y={410} k={pop(f, w(720.77), 12)} bg={P.white} size={40}>
          City of The Dalles
        </WTag>
        <WTag x={1850} y={490} k={pop(f, w(721.91), 12)} bg={P.ink} color={P.white} size={40}>
          Google
        </WTag>
        <WTag x={1150} y={760} k={pop(f, w(724.43), 12) * (1 - ease(f, w(728.0), 8))} bg={P.white} size={40}>
          The Oregonian · a local newspaper
        </WTag>
        <WTag x={1150} y={640} k={pop(f, w(725.53), 12) * (1 - ease(f, w(728.0), 8))} bg={P.yellow} size={44}>
          How much water is Google already using?
        </WTag>
        <WTag x={560} y={330} k={pop(f, w(728.3), 12) * (1 - ease(f, w(729.6), 6))} bg={P.white} size={40}>
          That's a trade secret.
        </WTag>
      </Cam>
      <Label f={f} at={w(719.9)} title="2021" sub="the city plans to give Google more water rights" bg={P.yellow} />
      <Stamp text="TRADE SECRET" k={secret * (1 - ease(f, w(732.2), 6))} x={960} y={520} rot={-6} size={96} />
      <Pop f={f} at={w(730.65)} x={960} y={680} size={60} until={w(732.2)}>
        <span style={{background: P.ink, borderRadius: 26, padding: '8px 30px'}}>Google's secret</span>
      </Pop>
      {court > 0 && (
        <svg width={420} height={320} viewBox="-120 -110 240 200" style={{position: 'absolute', left: 1360, top: 600}}>
          <Gavel hit={hit} />
        </svg>
      )}
      <Stamp text="TAKEN TO COURT" k={court} x={900} y={560} rot={4} size={90} />
    </Bg>
  );
};

/* ================================================================== 733.8 the case goes back and forth; settled late 2022 */
export const C3Court: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const t = t0 + f / 24;
  const run = Math.max(0, Math.min(1, (t - 734.3) / (738.6 - 734.3)));
  const ph = run * Math.PI * 5; // the papers cross the room five times
  const docX = 960 - Math.cos(ph) * 520;
  const docY = 400 - Math.abs(Math.sin(ph)) * 170;
  const settled = pop(f, w(738.88), 8);
  const release = ease(f, w(739.5), 14);
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.0, -8, 6], [740.3, 960, 540, 1.1, 6, 2]]}>
        <World>
          <rect x={-200} y={640} width={2400} height={500} fill="#1E1446" />
          <Put x={380} y={540} s={1.0}>
            <Paper />
          </Put>
          <Put x={1540} y={560} s={1.1}>
            <CityHall />
          </Put>
          {run > 0 && run < 1 && (
            <g transform={`translate(${docX},${docY}) scale(1.1) rotate(${Math.sin(ph) * 20})`}>
              <Doc title="FILING" />
            </g>
          )}
          {/* the numbers come out */}
          {release > 0 &&
            [0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${lerp(1540, 760 + i * 200, release)},${lerp(520, 330 + i * 30, release)}) rotate(${-10 + i * 10}) scale(${0.5 + 0.35 * release})`}>
                <Doc title="WATER USE" />
              </g>
            ))}
        </World>
      </Cam>
      {/* timeline: 2021 → late 2022 */}
      <div style={{position: 'absolute', left: 260, right: 260, top: 830}}>
        <div style={{position: 'relative', height: 120}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 30, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.25)'}} />
          <div style={{position: 'absolute', left: 0, width: `${run * 100}%`, top: 30, height: 10, borderRadius: 5, background: P.yellow}} />
          <div style={{position: 'absolute', left: `${run * 100}%`, top: 17, width: 36, height: 36, marginLeft: -18, borderRadius: 18, background: P.yellow}} />
          <div style={{position: 'absolute', left: -60, top: 64, fontFamily: AF.head, fontWeight: 800, fontSize: 40, color: P.white}}>2021 · lawsuit</div>
          <div style={{position: 'absolute', right: -60, top: 64, fontFamily: AF.head, fontWeight: 800, fontSize: 40, color: P.yellow, opacity: ease(f, w(737.0), 8)}}>late 2022 · settled</div>
        </div>
      </div>
      <Label f={f} at={w(734.1)} title="More than a year in court" sub="the case went back and forth" bg={P.white} />
      <Stamp text="SETTLED" k={settled} x={1180} y={300} rot={-5} size={80} color={P.green} />
      <Pop f={f} at={w(739.6)} x={1400} y={560} size={48}>
        <span style={{background: P.white, color: P.ink, borderRadius: 24, padding: '8px 26px'}}>the numbers, released</span>
      </Pop>
    </Bg>
  );
};

/* ================================================================== 740.3 355 million gallons: the cold open's question answered */
export const C3Gallons: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const ans = ease(f, w(746.5), 8);
  return (
    <AbsoluteFill style={{background: `linear-gradient(${P.sky}, #9BD9FF)`, overflow: 'hidden'}}>
      <Cam f={f} t0={t0} keys={[[t0, 1916, 980, 0.98, 0, 0], [743.0, 1960, 940, 1.02, -3, 3], [748.0, 1980, 930, 1.08, -4, 3]]}>
        <World w={3600} h={2200}>
          <Dalles f={f} glow={ease(f, w(744.6), 14)} />
        </World>
        <WTag x={DC_TOP[0]} y={DC_TOP[1]} k={1} bg={P.ink} color={P.white} size={30}>
          Google data centres
        </WTag>
        <WTag x={TOWER_TOP[0]} y={TOWER_TOP[1]} k={1} bg={P.water} color={P.white} size={28}>
          Town water
        </WTag>
        <div style={{position: 'absolute', left: PIPE_MID[0] + 24, top: PIPE_MID[1] - 30}}>
          <div style={{position: 'absolute', opacity: 1 - ans, whiteSpace: 'nowrap'}}>
            <Tag bg={P.white} color={P.water} size={34}>? gallons a day</Tag>
          </div>
          <div style={{position: 'absolute', opacity: ans, transform: `scale(${Math.max(0.01, pop(f, w(746.5), 12))})`, transformOrigin: '0 50%', whiteSpace: 'nowrap'}}>
            <Tag bg={P.yellow} color={P.ink} size={34}>≈ 973,000 gallons a day</Tag>
          </div>
        </div>
      </Cam>
      <Label f={f} at={w(740.5)} title="2021 · The Dalles" sub="what Google's data centres used" bg={P.ink} color={P.white} />
      <div style={{position: 'absolute', right: 80, top: 60, textAlign: 'right', background: 'rgba(11,22,56,0.82)', borderRadius: 30, padding: '24px 36px', opacity: ease(f, w(744.3), 8)}}>
        <Counter f={f} start={w(744.6)} dur={36} to={355000000} size={104} color={P.yellow} />
        <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 40, color: P.white, opacity: ease(f, w(746.63), 8)}}>gallons of water in one year</div>
        <Note style={{marginTop: 8, opacity: ease(f, w(747.0), 8)}} size={20}>
          ≈ 1.34 billion litres · ÷ 365 days ≈ 973,000 gallons a day
        </Note>
        <Note style={{marginTop: 6, opacity: ease(f, w(747.0), 8)}} size={20}>
          Source · The Oregonian, December 2022
        </Note>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== 748.05 more than a quarter of the city's water; nearly tripled */
export const C3Quarter: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const share = ease(f, w(748.98), 24);
  const lvl = 0.9;
  const tank = {x: 200, y: 200, w: 500, h: 660};
  const top = tank.y + tank.h * (1 - lvl);
  const gH = tank.h * lvl * 0.29 * share;
  const wave = Array.from({length: 14}, (_, i) => `L${tank.x + i * 40} ${top + Math.sin(f / 6 + i * 0.8) * 7}`).join(' ');
  return (
    <Bg c={P.navy}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="c3tank">
            <rect x={tank.x} y={tank.y} width={tank.w} height={tank.h} rx={40} />
          </clipPath>
        </defs>
        {/* water coming in from the river */}
        <Flow pts={[[450, 40], [450, 260]]} f={f} c={P.sky} n={4} r={10} speed={7} />
        <rect x={tank.x} y={tank.y} width={tank.w} height={tank.h} rx={40} fill="rgba(255,255,255,0.08)" />
        <g clipPath="url(#c3tank)">
          <path d={`M${tank.x} ${top} ${wave} L${tank.x + tank.w + 40} ${tank.y + tank.h} L${tank.x} ${tank.y + tank.h} Z`} fill={P.water} />
          <rect x={tank.x} y={tank.y + tank.h - gH} width={tank.w} height={gH} fill={P.orange} />
          {share > 0 && <rect x={tank.x} y={tank.y + tank.h - gH - 4} width={tank.w} height={8} fill={P.white} opacity={0.8} />}
        </g>
        <rect x={tank.x} y={tank.y} width={tank.w} height={tank.h} rx={40} fill="none" stroke={P.white} strokeWidth={8} />
        {/* the drain toward the data centres */}
        <Flow pts={[[700, 790], [860, 790]]} f={f} c={P.orange} n={3} r={10} speed={5} o={share} />
      </svg>
      <div style={{position: 'absolute', left: 760, top: 400, opacity: ease(f, w(749.6), 10)}}>
        <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 44, color: P.white}}>The rest of the city</div>
        <Note size={22}>homes, businesses, everyone else · 71%</Note>
      </div>
      <div style={{position: 'absolute', left: 900, top: 740, opacity: share}}>
        <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 44, color: P.orange}}>Google · 29%</div>
        <Note size={22}>its data centres</Note>
      </div>
      <Label f={f} at={w(748.1)} title="All the water the city used, 2021" bg={P.white} x={200} y={60} size={38} />
      <div style={{position: 'absolute', left: 1240, top: 150, opacity: ease(f, w(748.5), 8), transform: `scale(${pop(f, w(748.5), 12)})`, transformOrigin: '0 50%'}}>
        <Tag bg={P.orange} color={P.ink} size={44}>More than a quarter</Tag>
      </div>
      <div style={{position: 'absolute', left: 1240, top: 260, opacity: ease(f, w(752.3), 8)}}>
        <Tag bg={P.yellow} color={P.ink} size={40}>Nearly tripled in five years</Tag>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: ease(f, w(752.3), 8)}}>
      <Bars
        f={f}
        style={{left: 1160, top: 380}}
        w={640}
        h={360}
        barW={150}
        items={[
          {label: '2016', value: 1, at: w(752.4), color: '#7C8AA8', text: '≈ ⅓'},
          {label: '2021', value: 2.9, at: w(752.9), color: P.orange, text: '355M gal'},
        ]}
      />
      </div>
      <Note style={{position: 'absolute', left: 200, bottom: 50}} size={20}>
        Source · The Oregonian, Dec 2022 · 2016 bar drawn at about a third of 2021 (“nearly tripled”)
      </Note>
    </Bg>
  );
};

/* ================================================================== 755.1 a quarter of a town's water, and they weren't allowed to know */
export const C3Know: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  return (
    <AbsoluteFill style={{background: `linear-gradient(${P.sky}, #9BD9FF)`, overflow: 'hidden'}}>
      <Cam f={f} t0={t0} keys={[[t0, 1420, 800, 1.1, 6, 4], [756.5, 1440, 800, 1.1, 6, 4], [757.8, 2000, 940, 0.92, -4, 4], [759.0, 2000, 940, 0.92, -4, 4], [760.4, 1320, 720, 0.82, 4, 4], [762.7, 1340, 730, 0.86, 2, 4]]}>
        <World w={3600} h={2200}>
          <Dalles f={f} people={1} farm={1} townFlow={1} glow={ease(f, w(756.62), 12)} ask={pop(f, w(760.22), 12)} />
        </World>
        <WTag x={PIPE_MID[0] + 30} y={PIPE_MID[1] - 10} k={pop(f, w(756.7), 12) * (1 - ease(f, w(759.6), 8))} bg={P.yellow} size={40} anchor="l">
          ¼ of the water → one company
        </WTag>
      </Cam>
      <Label f={f} at={w(755.3)} title="A quarter of a town's water" sub="homes, gardens, farms… and one company" bg={P.ink} color={P.white} />
      <Caption f={f} at={w(758.6)}>
        Until a newspaper went to court, residents weren't allowed to know
      </Caption>
    </AbsoluteFill>
  );
};

/* ================================================================== 762.7 to be fair: infrastructure, and a big river. Not a desert. */
export const C3Fair: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const river = ease(f, w(768.55), 14);
  const riverPath: [number, number][] = [iso(-1500, 135), iso(3500, 120)];
  return (
    <AbsoluteFill style={{background: `linear-gradient(${P.sky}, #9BD9FF)`, overflow: 'hidden'}}>
      <Cam f={f} t0={t0} keys={[[t0, 1750, 780, 0.7, 0, 0], [764.8, 1860, 700, 1.05, -6, 4], [768.3, 1860, 700, 1.0, -4, 4], [770.2, 1800, 500, 0.36, 0, 0], [772.5, 1800, 500, 0.34, 0, 0]]}>
        <World w={3600} h={2200}>
          <Dalles f={f} infra={ease(f, w(765.13), 14)} />
          {river > 0 && <Flow pts={riverPath} f={f} c={P.white} n={18} r={22} speed={14} o={river} line={false} />}
        </World>
        <WTag x={iso(650, 262)[0]} y={iso(650, 262, 60)[1]} k={pop(f, w(765.9), 12) * (1 - ease(f, w(768.6), 8))} bg={P.yellow} size={36}>
          local water works and pipes
        </WTag>
        <WTag x={iso(-600, 135)[0]} y={iso(-600, 135)[1]} k={pop(f, w(770.3), 12)} bg={P.water} color={P.white} size={90}>
          Columbia River system
        </WTag>
      </Cam>
      <Label f={f} at={w(763.0)} title="To be fair" sub="Google's side of it" bg={P.white} />
      <Caption f={f} at={w(764.6)} until={w(768.3)}>
        Google: it also paid for local water infrastructure
      </Caption>
      <Caption f={f} at={w(768.55)} until={w(770.9)}>
        And the area has a lot of water from the river
      </Caption>
      <Caption f={f} at={w(771.1)}>
        The Dalles is not a desert
      </Caption>
    </AbsoluteFill>
  );
};

/* ================================================================== 772.5 "But many data centers are being built in places that are." */
export const C3Deserts: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const dry = ease(f, w(772.63), 26);
  return (
    <Bg c="#F2A65A" c2="#FBD9A0" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.1, 0, 8], [777.6, 1080, 520, 0.92, -8, 4]]}>
        <World w={2400} h={1200}>
          <Put x={1650} y={260} s={1.5}>
            <Sun f={f} />
          </Put>
          <rect x={-400} y={700} width={3200} height={600} fill="#4FA35A" />
          {/* the ground dries out from the right */}
          <rect x={lerp(2800, -400, dry)} y={700} width={3400} height={600} fill="#D9A15B" />
          {dry > 0 &&
            Array.from({length: 26}, (_, i) => {
              const x = -300 + (i % 13) * 230 + random(`ck${i}`) * 60;
              const y = 760 + Math.floor(i / 13) * 170 + random(`cy${i}`) * 50;
              return x > lerp(2800, -400, dry) ? <path key={i} d={`M${x} ${y} l40 20 l-10 40 l50 10 M${x + 40} ${y + 20} l40 -20`} stroke="#A9733A" strokeWidth={6} fill="none" strokeLinecap="round" /> : null;
            })}
          {/* heat shimmer */}
          {Array.from({length: 7}, (_, i) => (
            <path key={i} d={`M${100 + i * 330} 690 q20 -40 0 -80 t0 -80`} stroke={P.white} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="22 20" strokeDashoffset={f * 3} opacity={0.4 * dry} />
          ))}
          {[[480, 700], [1100, 720], [1700, 700]].map(([x, y], i) => (
            <Put key={i} x={x} y={y} s={1.4} f={f} at={w(773.1) + i * 6}>
              <DataCentre f={f + i * 5} />
            </Put>
          ))}
          {[[200, 790], [820, 830], [1420, 800], [2050, 820]].map(([x, y], i) => (
            <Put key={i} x={x} y={y} s={0.8} f={f} at={w(774.86) + i * 3}>
              <Cactus />
            </Put>
          ))}
        </World>
      </Cam>
      <Caption f={f} at={w(773.2)} dark>
        But many are being built in places that are dry
      </Caption>
    </Bg>
  );
};

/* ================================================================== 786.27 Uruguay 2023: reservoirs low, salty tap water, bottled water */
export const C3Uruguay: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const low = ease(f, w(789.4), w(797.4) - w(789.4));
  const level = lerp(0.85, 0.16, low);
  const salt = ease(f, w(795.0), 14);
  const tapC = salt > 0.5 ? '#9DB59A' : P.water;
  const valley = 'M120 360 L420 880 L980 880 L1300 360 Z';
  const yTop = 880 - 520 * level;
  return (
    <Bg c="#F4B860" c2="#FBE0B0" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 820, 560, 0.98, 6, 2], [792.5, 1100, 560, 0.78, 0, 2], [794.4, 1820, 500, 1.1, -6, 2], [796.4, 1500, 560, 0.72, 0, 0], [798.3, 2700, 580, 1.0, -8, 3], [800.2, 2760, 580, 1.04, -4, 3]]}>
        <World w={3300} h={1200}>
          <rect x={-600} y={360} width={4400} height={900} fill="#B98A50" />
          {/* the reservoir in cross-section */}
          <clipPath id="c3res">
            <path d={valley} />
          </clipPath>
          <path d={valley} fill="#8A6236" />
          <rect x={0} y={yTop} width={1400} height={900} fill={P.water} clipPath="url(#c3res)" />
          {/* cracks on the exposed bed */}
          {Array.from({length: 10}, (_, i) => {
            const y = 420 + i * 46;
            if (y > yTop - 10) return null;
            const xl = 120 + ((y - 360) / 520) * 300;
            return <path key={i} d={`M${xl + 30} ${y} l30 12 l-8 18 M${1300 - ((y - 360) / 520) * 320 - 40} ${y} l-28 14 l6 16`} stroke="#5C3F1E" strokeWidth={5} fill="none" strokeLinecap="round" />;
          })}
          {/* gauge */}
          <rect x={1340} y={360} width={40} height={520} rx={20} fill="rgba(0,0,0,0.25)" />
          <rect x={1340} y={yTop} width={40} height={880 - yTop} rx={20} fill={level < 0.35 ? P.red : P.water} />
          <Put x={300} y={200} s={1.0}>
            <Sun f={f} />
          </Put>
          {/* the pipe from the reservoir to the city's taps */}
          <Pipe pts={[[1000, 840], [1500, 840], [1500, 300], [1700, 300]]} f={f} c={tapC} flow={0.9} />
          <Put x={1820} y={520} s={1.3}>
            <Tap f={f} c={tapC} />
          </Put>
          {salt > 0 &&
            Array.from({length: 10}, (_, i) => (
              <rect key={i} x={1930 + random(`sx${i}`) * 140} y={560 + random(`sy${i}`) * 100} width={12} height={12} fill={P.white} opacity={salt} transform={`rotate(45 ${1936 + random(`sx${i}`) * 140} ${566 + random(`sy${i}`) * 100})`} />
            ))}
          {/* the queue for bottled water */}
          <rect x={3020} y={520} width={220} height={360} fill="#E5401F" />
          <rect x={3020} y={490} width={220} height={40} fill="#B8301A" />
          {Array.from({length: 12}, (_, i) => (
            <rect key={i} x={3040 + (i % 4) * 50} y={560 + Math.floor(i / 4) * 90} width={30} height={70} rx={8} fill={P.sky} />
          ))}
          {Array.from({length: 6}, (_, i) => (
            <g key={i} transform={`translate(${2900 - i * 120},${800 + (i % 2) * 6}) scale(0.9)`} opacity={ease(f, w(798.43) + i * 2, 8) || (f > w(797.5) ? 0.15 : 0)}>
              <Person c={[P.teal, P.purple, P.pink, P.blue, P.green, P.orange][i]} skin={['#C98E64', '#8D5A3B', '#E9B48A', '#6B4128', '#F1C9A5', '#C98E64'][i]} f={f} />
              <rect x={34} y={-20} width={22} height={56} rx={6} fill={P.sky} />
            </g>
          ))}
        </World>
        <WTag x={700} y={330} k={pop(f, w(789.6), 12) * (1 - ease(f, w(793.0), 8))} bg={P.white} size={40}>
          reservoirs running low
        </WTag>
        <WTag x={1820} y={250} k={pop(f, w(793.29), 12) * (1 - ease(f, w(797.6), 8))} bg={P.white} size={40}>
          Montevideo, the capital
        </WTag>
        <WTag x={2010} y={820} k={pop(f, w(795.34), 12)} bg="#9DB59A" color={P.ink} size={40}>
          tap water turned salty
        </WTag>
        <WTag x={2600} y={560} k={pop(f, w(798.6), 12)} bg={P.white} size={40}>
          queues for bottled water
        </WTag>
      </Cam>
      <Label f={f} at={w(787.5)} title="Uruguay, 2023" sub="its worst drought in decades" bg={P.ink} color={P.white} />
    </Bg>
  );
};

/* ================================================================== 800.2 protests; Google redesigns for air cooling */
export const C3Protest: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const plan = ease(f, w(802.25), 12);
  const swap = ease(f, w(812.53), 18);
  const less = ease(f, w(815.0), 18);
  const pipe = ease(f, w(807.5), 12);
  return (
    <Bg c="#1F3B73">
      <Cam f={f} t0={t0} keys={[[t0, 2300, 540, 1.0, -6, 2], [803.4, 2300, 540, 1.0, -6, 2], [804.6, 900, 600, 0.95, 8, 3], [806.4, 1550, 560, 0.62, 0, 2], [811.0, 1550, 560, 0.64, 0, 2], [812.4, 2420, 520, 1.12, -8, 4], [817.8, 2440, 520, 1.16, -6, 4]]}>
        <World w={3100} h={1200}>
          <rect x={-800} y={820} width={4700} height={600} fill="#132650" />
          {/* the planned data centre, as a blueprint */}
          <g opacity={plan}>
            <rect x={1980} y={480} width={560} height={300} rx={10} fill="rgba(70,180,255,0.15)" stroke={P.sky} strokeWidth={6} strokeDasharray="22 14" />
            {Array.from({length: 8}, (_, i) => (
              <line key={i} x1={2000 + i * 70} y1={500} x2={2000 + i * 70} y2={760} stroke={P.sky} strokeWidth={2} opacity={0.5} />
            ))}
            {/* evaporative tower, swapped for fans */}
            <g opacity={1 - swap} transform="translate(2700,640) scale(1.3)">
              <path d="M-70 100 C-45 30 -45 -40 -55 -100 L55 -100 C45 -40 45 30 70 100 Z" fill="rgba(70,180,255,0.15)" stroke={P.sky} strokeWidth={5} strokeDasharray="16 10" />
              {Array.from({length: 4}, (_, j) => {
                const k = (f / 50 + j / 4) % 1;
                return <circle key={j} cx={k * 30} cy={-120 - k * 90} r={24 + k * 30} fill={P.white} opacity={(1 - k) * 0.6} />;
              })}
            </g>
            {swap > 0 &&
              [0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${2650 + i * 130},${700 - (i % 2) * 120}) scale(${0.62 * swap})`}>
                  <Fan f={f} c={P.sky} />
                </g>
              ))}
          </g>
          {/* water heading for the site */}
          <Pipe pts={[[1500, 900], [1980, 900], [1980, 780]]} f={f} c={P.water} flow={pipe * (1 - less * 0.85)} />
          {/* protesters */}
          {Array.from({length: 10}, (_, i) => {
            const x = 380 + (i % 5) * 150 + (i > 4 ? 70 : 0);
            const y = 780 + (i > 4 ? 60 : 0);
            const k = ease(f, w(803.5) + i * 1.5, 8);
            const lift = Math.sin(f / 7 + i) * 8;
            return (
              <g key={i} opacity={k} transform={`translate(${x},${y})`}>
                <line x1={36} y1={-40} x2={36} y2={-200 + lift} stroke="#8B5A2B" strokeWidth={6} />
                <g transform={`translate(36,${-230 + lift})`}>
                  <rect x={-50} y={-40} width={100} height={70} rx={8} fill={P.white} />
                  <g transform="translate(0,-4) scale(0.32)">
                    <Drop c={P.water} />
                  </g>
                </g>
                <Person c={[P.red, P.yellow, P.teal, P.pink, P.orange][i % 5]} skin={['#C98E64', '#8D5A3B', '#E9B48A', '#6B4128', '#F1C9A5'][i % 5]} f={f + i * 3} wave={0.6} />
              </g>
            );
          })}
          {/* a family buying water */}
          <g opacity={ease(f, w(808.72), 10)}>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${1250 + i * 90},${800 + (i ? 20 : 0)}) scale(${i ? 0.7 : 0.95})`}>
                <Person c={[P.purple, P.green, P.orange][i]} skin="#C98E64" f={f} />
                <rect x={30} y={-24} width={24} height={60} rx={6} fill={P.sky} />
              </g>
            ))}
          </g>
        </World>
        <WTag x={2260} y={450} k={pop(f, w(802.43), 12) * (1 - ease(f, w(814.8), 8))} bg={P.white} size={50}>
          Google's planned data centre
        </WTag>
        <WTag x={700} y={470} k={pop(f, w(804.6), 12) * (1 - ease(f, w(810.8), 8))} bg={P.yellow} size={52}>
          Protesters in the streets
        </WTag>
        <WTag x={1340} y={640} k={pop(f, w(809.48), 12) * (1 - ease(f, w(811.0), 8))} bg={P.white} size={50}>
          families buying water in bottles
        </WTag>
        <WTag x={2790} y={520} k={pop(f, w(813.5), 12)} bg={P.sky} size={40}>
          redesign: air cooling
        </WTag>
        <WTag x={2260} y={450} k={pop(f, w(815.05), 12)} bg={P.yellow} size={44}>
          far less water
        </WTag>
      </Cam>
      <Label f={f} at={w(800.5)} title="Montevideo, 2023" sub="at the same time, a data centre plan" bg={P.white} />
      <Caption f={f} at={w(813.9)} source="The Guardian, July 2023">
        Google later said it would redesign for air cooling
      </Caption>
    </Bg>
  );
};

/* ================================================================== 824.31 Chile: air cooling; then 2022 water jumps at Microsoft and Google */
export const C3Growth: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const fansOut = ease(f, w(825.6), 12);
  const chart = ease(f, w(828.2), 12);
  const sway = lerp(-12, 6, ease(f, w(828.3), w(842.5) - w(828.3)));
  return (
    <Bg c={P.navy}>
      {fansOut < 1 && (
        <AbsoluteFill style={{opacity: 1 - fansOut}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {[560, 960, 1360].map((x, i) => (
              <g key={x} transform={`translate(${x},520) scale(1.5)`}>
                <Fan f={f + i * 4} c={P.sky} />
              </g>
            ))}
            {Array.from({length: 9}, (_, i) => (
              <path key={i} d={`M${380 + i * 140} 720 q30 40 0 80 t0 80`} stroke={P.sky} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="26 20" strokeDashoffset={-f * 6} opacity={0.6} />
            ))}
          </svg>
          <div style={{position: 'absolute', left: 80, top: 70}}>
            <Tag bg={P.white} color={P.ink} size={44}>Chile: switch to air cooling</Tag>
            <Note style={{marginTop: 12, marginLeft: 8}}>after a court pushed back on Google's permit near Santiago · Reuters, Sep 2024</Note>
          </div>
        </AbsoluteFill>
      )}
      <Pop f={f} at={w(828.46)} x={960} y={540} size={200} color={P.sky} until={w(832.2)}>
        2022
      </Pop>
      <Pop f={f} at={w(825.9)} x={960} y={540} size={90} until={w(828.1)}>
        Not just one company
      </Pop>
      {chart > 0 && (
        <AbsoluteFill style={{opacity: chart}}>
          <div style={{position: 'absolute', inset: 0, transform: `perspective(2200px) rotateY(${sway}deg)`, transformOrigin: '50% 50%'}}>
            {/* drops falling into the bars */}
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
              {Array.from({length: 10}, (_, i) => {
                const p = (f / 30 + i / 10) % 1;
                return (
                  <g key={i} transform={`translate(${720 + (i % 2) * 480 + (random(`gd${i}`) - 0.5) * 120},${200 + p * 300}) scale(0.16)`} opacity={(1 - p) * 0.8}>
                    <Drop c={P.sky} />
                  </g>
                );
              })}
            </svg>
            <Bars
              f={f}
              style={{left: 560, top: 250}}
              w={800}
              h={420}
              barW={200}
              items={[
                {label: 'Microsoft', value: 34, at: w(833.86), color: P.sky, text: '+34%'},
                {label: 'Google', value: 20, at: w(837.03), color: P.yellow, text: '+~20%'},
              ]}
            />
          </div>
          <Label f={f} at={w(828.46)} title="2022: water consumption vs 2021" sub="the year AI started to explode" bg={P.white} />
          <Caption f={f} at={w(838.95)} source="AP News, 9 Sep 2023">
            Outside researchers: a big part of that was likely AI
          </Caption>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== 842.5 how much water does one answer use? */
export const C3OneAnswer: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const wild = ease(f, w(847.4), 10);
  const ang = lerp(Math.sin(f / 20) * 8, Math.sin(f / 3.2) * 78, wild);
  return (
    <Bg c={P.night}>
      <div style={{position: 'absolute', left: 140, top: 380, width: 560, background: P.white, borderRadius: 30, padding: '26px 32px', fontFamily: AF.body, fontSize: 38, color: P.ink, transform: `scale(${pop(f, 0, 12)})`, transformOrigin: '0 50%'}}>
        What should I make for dinner?
      </div>
      <Note style={{position: 'absolute', left: 150, top: 560}} size={24}>
        one question, one answer
      </Note>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Flow pts={[[720, 440], [830, 520]]} f={f} c={P.sky} n={3} r={8} speed={4} />
        <g transform={`translate(940,${560 + Math.sin(f / 10) * 12}) scale(1.4)`}>
          <Drop c={P.water} />
          <text y={50} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={80} fill={P.white}>
            ?
          </text>
        </g>
        {/* the gauge */}
        <g transform="translate(1480,700)">
          <path d="M-300 0 A300 300 0 0 1 300 0" stroke="rgba(255,255,255,0.18)" strokeWidth={50} fill="none" />
          <path d="M-300 0 A300 300 0 0 1 0 -300" stroke={P.sky} strokeWidth={50} fill="none" opacity={0.7} />
          <path d="M0 -300 A300 300 0 0 1 300 0" stroke={P.water} strokeWidth={50} fill="none" opacity={0.9} />
          <g transform={`rotate(${ang})`}>
            <rect x={-8} y={-270} width={16} height={270} rx={8} fill={P.yellow} />
          </g>
          <circle r={28} fill={P.yellow} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 1080, top: 760, width: 200, textAlign: 'center', fontFamily: AF.head, fontWeight: 700, fontSize: 32, color: P.white}}>a few drops</div>
      <div style={{position: 'absolute', left: 1680, top: 760, width: 200, textAlign: 'center', fontFamily: AF.head, fontWeight: 700, fontSize: 32, color: P.white}}>a bottle</div>
      <Pop f={f} at={w(842.65)} x={960} y={170} size={76}>
        How much water per <span style={{color: P.sky}}>answer</span>?
      </Pop>
      <Caption f={f} at={w(846.75)}>Here's where it gets confusing</Caption>
    </Bg>
  );
};

/* ================================================================== 848.8 UC Riverside 2023: 10–50 questions ≈ a 500 ml bottle */
export const C3Bottle: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const fill = ease(f, w(855.6), w(860.4) - w(855.6));
  const pour = f > w(855.4) && f < w(860.8);
  const n = Math.round(lerp(0, 18, ease(f, w(853.9), w(856.0) - w(853.9))));
  return (
    <Bg c="#0F4C81" c2="#0B2A55" angle={160}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.0, 6, 2], [861.5, 1060, 540, 1.08, -6, 2]]}>
        <World>
          {/* each question adds a little water */}
          {pour &&
            Array.from({length: 8}, (_, i) => {
              const p = (f / 22 + i / 8) % 1;
              const x = lerp(640, 1340, p), y = lerp(480 + (i % 4) * 60, 290, p) - Math.sin(Math.PI * p) * 160;
              return (
                <g key={i} transform={`translate(${x},${y}) scale(0.16)`}>
                  <Drop c={P.sky} />
                </g>
              );
            })}
          <Put x={1360} y={590} s={1.45}>
            <Bottle level={lerp(0.04, 0.93, fill)} f={f} />
          </Put>
        </World>
      </Cam>
      {/* the conversation: 10–50 questions */}
      <div style={{position: 'absolute', left: 140, top: 250, width: 520, display: 'flex', flexWrap: 'wrap', gap: 14}}>
        {Array.from({length: 18}, (_, i) => (
          <div key={i} style={{width: 150, height: 54, borderRadius: 20, background: i % 2 ? P.white : '#BFE8FF', opacity: i < n ? 1 : 0, transform: `scale(${i < n ? 1 : 0.6})`}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 140, top: 720, opacity: ease(f, w(854.93), 8)}}>
        <Tag bg={P.yellow} color={P.ink} size={44}>10 to 50 questions</Tag>
      </div>
      <div style={{position: 'absolute', right: 120, top: 420, textAlign: 'left', opacity: ease(f, w(858.67), 10)}}>
        <Tag bg={P.white} color={P.ink} size={44}>≈ 500 ml</Tag>
        <Note style={{marginTop: 14}} size={24}>≈ 10–50 ml per question</Note>
      </div>
      <Label f={f} at={w(850.5)} title="University of California, Riverside" sub="researchers' estimate, 2023" bg={P.white} />
      <Caption f={f} at={w(857.86)} source="Li, Yang, Islam & Ren, “Making AI Less Thirsty” (2023)">
        One chat could “drink” about a 500 ml bottle of water
      </Caption>
    </Bg>
  );
};

/* ================================================================== 861.5 Altman 2025: 1/15 of a teaspoon per average question */
export const C3Teaspoon: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const sl = ease(f, w(869.63), 10);
  const filled = ease(f, w(870.2), 8);
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.0, 6, 2], [869.4, 1080, 560, 1.12, -4, 2], [871.4, 1160, 560, 1.22, 0, 0]]}>
        <World>
          <Put x={520} y={600} s={1.55} f={f} at={w(865.13)}>
            <Doc title="Blog · June 2025" />
          </Put>
          <Put x={1240} y={560} s={1.5} f={f} at={w(866.6)}>
            <Spoon slices={sl} fill={filled} f={f} />
          </Put>
        </World>
        <WTag x={1240} y={400} k={pop(f, w(869.63), 12)} bg={P.yellow} size={46}>
          1/15 of a teaspoon
        </WTag>
        <WTag x={1240} y={790} k={pop(f, w(870.6), 12)} bg={P.white} size={32}>
          ≈ 0.3 ml · a teaspoon is about 5 ml
        </WTag>
      </Cam>
      <div style={{position: 'absolute', left: 120, top: 120, opacity: ease(f, w(864.98), 8), transform: `scale(${pop(f, w(864.98), 12)})`, transformOrigin: '0 0'}}>
        <Tag bg={P.white} color={P.ink} size={52}>Sam Altman</Tag>
        <Note style={{marginTop: 12, marginLeft: 8}} size={26}>CEO, OpenAI</Note>
      </div>
      <Pop f={f} at={w(862.0)} x={960} y={540} size={80} until={w(864.7)}>
        But in 2025…
      </Pop>
      <Caption f={f} at={w(867.4)} source="Sam Altman, “The Gentle Singularity”, 10 June 2025">
        The average ChatGPT question uses about 1/15 of a teaspoon
      </Caption>
    </Bg>
  );
};

/* ================================================================== 871.4 a bottle, or a few drops? Keep the question. */
export const C3Compare: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const shrink = ease(f, w(878.43), 18);
  const q = pop(f, w(876.46), 12);
  const qx = 960, qy = lerp(540, 860, shrink);
  return (
    <Bg c={P.night}>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${lerp(0, -40, shrink)}px) scale(${lerp(1, 0.56, shrink)})`, transformOrigin: '50% 0%'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080, background: P.sky}} />
        <div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 1080, background: P.navy}} />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <Put x={480} y={470} s={1.2} f={f} at={w(871.65)}>
            <Bottle level={0.92} f={f} />
          </Put>
          <Put x={1400} y={480} s={1.2} f={f} at={w(873.2)}>
            <Spoon />
          </Put>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${1340 + i * 40},${470 + (i % 2) * 14}) scale(${0.12 * pop(f, w(873.43) + i * 3, 10)})`}>
              <Drop c={P.water} />
            </g>
          ))}
        </svg>
        <div style={{position: 'absolute', left: 0, width: 960, top: 790, textAlign: 'center', opacity: ease(f, w(872.0), 8)}}>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 110, color: P.ink}}>10–50 ml</div>
          <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 34, color: P.ink}}>per question · UC Riverside, 2023</div>
        </div>
        <div style={{position: 'absolute', left: 960, width: 960, top: 790, textAlign: 'center', opacity: ease(f, w(873.58), 8)}}>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 110, color: P.yellow}}>≈ 0.3 ml</div>
          <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 34, color: P.white}}>per question · Altman, 2025</div>
        </div>
        <Pop f={f} at={w(874.6)} x={960} y={300} size={56} until={w(876.3)}>
          <span style={{background: P.red, borderRadius: 26, padding: '10px 30px'}}>30–150× apart</span>
        </Pop>
      </div>
      {/* the question, carried into your head */}
      {shrink > 0 && (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: shrink}}>
          <circle cx={960} cy={860} r={150} fill="#2A3B7A" />
          <path d="M860 1000 Q960 1060 1060 1000 L1100 1100 H820 Z" fill="#2A3B7A" />
        </svg>
      )}
      {q > 0 && (
        <div style={{position: 'absolute', left: qx, top: qy, transform: `translate(-50%,-50%) scale(${q * lerp(1, 0.75, shrink)})`, fontFamily: AF.head, fontWeight: 800, fontSize: 240, color: P.yellow, textShadow: '0 10px 40px rgba(0,0,0,0.4)'}}>?</div>
      )}
      <div style={{position: 'absolute', left: 1180, top: 820, opacity: ease(f, w(881.75), 10), transform: `scale(${pop(f, w(881.75), 12)})`, transformOrigin: '0 50%'}}>
        <Tag bg={P.white} color={P.ink} size={44}>We'll settle it before the end</Tag>
      </div>
      <div style={{position: 'absolute', left: 120, top: 830, opacity: ease(f, w(878.6), 10)}}>
        <Tag bg={P.yellow} color={P.ink} size={40}>Keep this question</Tag>
      </div>
    </Bg>
  );
};

/* ================================================================== 884.6 so far: machines. Water drains to darkness. */
export const C3Machines: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const drain = ease(f, w(884.83), w(887.2) - w(884.83));
  const dim = ease(f, w(890.74), 16);
  const lvl = lerp(0, 1120, drain);
  const wave = Array.from({length: 25}, (_, i) => `L${i * 80} ${lvl + Math.sin(f / 6 + i * 0.7) * 16}`).join(' ');
  const items: [number, string, number][] = [[480, 'Power plants', 887.48], [960, 'Cooling towers', 888.24], [1440, 'Chips', 889.38]];
  return (
    <Bg c={P.night}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.0, 0, 0], [894.9, 960, 520, 1.12, 0, 4]]}>
        <World>
          <g opacity={1 - dim * 0.8}>
            <Put x={480} y={520} s={1.5} f={f} at={w(887.48)}>
              <PowerPlant f={f} />
            </Put>
            <Put x={960} y={540} s={1.3} f={f} at={w(888.24)}>
              <CoolingTower f={f} />
            </Put>
            <Put x={1440} y={520} s={1.0} f={f} at={w(889.38)}>
              <Chip f={f} on={1} c="#1D6B3A" />
            </Put>
          </g>
        </World>
      </Cam>
      {/* the water level sinks away */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d={`M0 ${lvl} ${wave} L1920 1080 L0 1080 Z`} fill={P.water} opacity={0.9} />
      </svg>
      {items.map(([x, t, a]) => (
        <div key={t} style={{position: 'absolute', left: x - 220, width: 440, top: 760, textAlign: 'center', opacity: ease(f, w(a), 8) * (1 - dim * 0.8)}}>
          <Tag bg={P.white} color={P.ink} size={42}>{t}</Tag>
        </div>
      ))}
      <div style={{opacity: 1 - dim}}>
        <Label f={f} at={w(885.8)} title="So far: machines" bg={P.yellow} />
      </div>
      <Pop f={f} at={w(891.4)} x={960} y={540} size={76}>
        The part that surprised me most…
      </Pop>
    </Bg>
  );
};

/* ================================================================== 894.9 built by people. Millions of them. */
export const C3People: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const machines = ease(f, w(897.2), 10) * (1 - ease(f, w(898.9), 12));
  const one = pop(f, w(899.46), 12);
  const many = ease(f, w(900.24), w(901.6) - w(900.24));
  const grey = ease(f, w(902.72), 20);
  const skins = ['#C98E64', '#8D5A3B', '#E9B48A', '#6B4128', '#F1C9A5'];
  const shirts = [P.yellow, P.pink, P.teal, P.orange, P.sky, P.purple];
  return (
    <Bg c={P.night}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.15, 0, 0], [899.3, 1000, 540, 1.2, 0, 0], [901.7, 1060, 540, 0.62, 0, 0], [905.4, 1060, 540, 0.56, 0, 0]]}>
        <World>
          {/* millions of people: rings spreading out from the first one */}
          {many > 0 &&
            Array.from({length: 74 * 32}, (_, i) => {
              const c = (i % 74) - 37, r = Math.floor(i / 74) - 16;
              const x = 1110 + c * 64, y = 560 + r * 84;
              const d = Math.hypot(c, r * 1.3) / 40;
              if (d > many || (c === 0 && r === 0)) return null;
              const fill = grey > 0 ? `rgba(124,138,168,${lerp(1, 0.45, grey)})` : shirts[i % shirts.length];
              return (
                <g key={i} transform={`translate(${x},${y})`}>
                  <circle cy={-22} r={13} fill={grey > 0.5 ? fill : skins[i % skins.length]} />
                  <rect x={-17} y={-6} width={34} height={36} rx={14} fill={fill} />
                </g>
              );
            })}
          {/* the phone and the AI on it */}
          <g opacity={1 - many * 0.9}>
            <Put x={880} y={540} s={1.8} f={f} at={w(895.53)}>
              <g>
                <rect x={-45} y={-90} width={90} height={180} rx={16} fill={P.ink} />
                <rect x={-38} y={-78} width={76} height={150} rx={8} fill="#F4F6FB" />
                <rect x={-30} y={-62} width={50} height={20} rx={8} fill={P.sky} />
                <rect x={-20} y={-32} width={50} height={36} rx={8} fill="#D5DBE8" />
                <rect x={-30} y={12} width={44} height={18} rx={8} fill={P.sky} />
              </g>
            </Put>
            {machines > 0 &&
              [[580, 360], [1240, 380], [620, 760]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x},${y}) scale(${0.8 * machines})`} opacity={machines}>
                  {i === 0 ? <Chip f={f} on={1} c="#1D6B3A" /> : i === 1 ? <Rack f={f} busy={1} /> : <CoolingTower f={f} />}
                </g>
              ))}
          </g>
          {one > 0 && (
            <g transform={`translate(1110,560) scale(${0.95 * one})`}>
              <Person c={grey > 0 ? `rgb(${lerp(255, 124, grey)},${lerp(197, 138, grey)},${lerp(49, 168, grey)})` : P.yellow} f={f} />
            </g>
          )}
        </World>
      </Cam>
      <Pop f={f} at={w(895.4)} x={960} y={150} size={60} until={w(898.8)}>
        The AI you use every day…
      </Pop>
      <Pop f={f} at={w(899.1)} x={960} y={150} size={72} until={w(900.1)}>
        …was built by <span style={{color: P.yellow}}>people</span>
      </Pop>
      <Pop f={f} at={w(900.24)} x={960} y={150} size={84} until={w(902.6)}>
        <span style={{background: P.ink, borderRadius: 26, padding: '6px 30px'}}>Millions of them</span>
      </Pop>
      <Caption f={f} at={w(902.72)} dark>
        And most of them, you will never hear about
      </Caption>
    </Bg>
  );
};

export const SCENES_3: Record<string, React.FC<AnimProps>> = {
  c3sweat: C3Sweat,
  c3loop: C3Loop,
  c3gone: C3Gone,
  c3twice: C3Twice,
  c3dalles: C3Dalles,
  c3secret: C3Secret,
  c3court: C3Court,
  c3gallons: C3Gallons,
  c3quarter: C3Quarter,
  c3know: C3Know,
  c3fair: C3Fair,
  c3deserts: C3Deserts,
  c3uruguay: C3Uruguay,
  c3protest: C3Protest,
  c3growth: C3Growth,
  c3oneanswer: C3OneAnswer,
  c3bottle: C3Bottle,
  c3teaspoon: C3Teaspoon,
  c3compare: C3Compare,
  c3machines: C3Machines,
  c3people: C3People,
};
