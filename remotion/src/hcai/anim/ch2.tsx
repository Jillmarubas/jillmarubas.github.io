// Chapter 2, "The power" (355.8–653.9 s on the film) as 2D animation: 415 TWh and its share of the world, the IEA's
// 2030 projection, the US and Ireland, the always-on problem, Three Mile Island and its restart, big tech's nuclear
// deals, Colossus and its gas turbines in South Memphis, the companies' own emissions numbers, and the turn to water.
// Scenes are registered in SCENES_2 and placed by src/hcai/edits/ch2.json; the two `board map` scenes stay as they are.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';
import {Bg, Cam, Chip, Coin, CoolingTower, Counter, DataCentre, Doc, Factory, Fan, Flow, Globe, House, Meter, NuclearPlant, Person, Pipe, Pop, Put, Pylon, Sun, World, shade} from './lib';

/* ================================================================== local helpers */
type V = [number, number];
const C30 = Math.cos(Math.PI / 6);
const iso = (x: number, y: number, z = 0): V => [(x - y) * C30, (x + y) * 0.5 - z];
const pts = (a: V[]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const k01 = (v: number) => Math.max(0, Math.min(1, v));
const mix = (a: string, b: string, k: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, k01(k)));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};
const line = (a: V[]) => 'M' + a.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');

/** An isometric box (x, y on the ground, w × d footprint, h tall, standing on z0). */
const IsoBox: React.FC<{x: number; y: number; w: number; d: number; h: number; z0?: number; top: string; side: string; o?: number}> = ({x, y, w, d, h, z0 = 0, top, side, o = 1}) => {
  const T = [iso(x, y, z0 + h), iso(x + w, y, z0 + h), iso(x + w, y + d, z0 + h), iso(x, y + d, z0 + h)];
  const R = [iso(x + w, y, z0), iso(x + w, y + d, z0), iso(x + w, y + d, z0 + h), iso(x + w, y, z0 + h)];
  const L = [iso(x, y + d, z0), iso(x + w, y + d, z0), iso(x + w, y + d, z0 + h), iso(x, y + d, z0 + h)];
  return (
    <g opacity={o}>
      <polygon points={pts(L)} fill={shade(side, 0.82)} />
      <polygon points={pts(R)} fill={shade(side, 0.64)} />
      <polygon points={pts(T)} fill={top} />
    </g>
  );
};

/** A corner title (like lib's Label) that can also leave, with a readable sub-line. */
const Lbl: React.FC<{f: number; at: number; until?: number; title: React.ReactNode; sub?: string; bg?: string; color?: string; right?: boolean; size?: number; subC?: string}> = ({f, at: a, until, title, sub, bg = P.white, color = P.ink, right, size = 44, subC}) => {
  const k = ease(f, a, 10) * (until !== undefined ? 1 - ease(f, until, 8) : 1);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', top: 70, ...(right ? {right: 80, textAlign: 'right' as const} : {left: 80}), opacity: k, transform: `translateX(${(1 - k) * (right ? 20 : -20)}px)`}}>
      <Tag bg={bg} color={color} size={size}>
        {title}
      </Tag>
      {sub && (
        <Note style={{marginTop: 12, marginLeft: right ? 0 : 8, marginRight: right ? 8 : 0}} size={28} color={subC}>
          {sub}
        </Note>
      )}
    </div>
  );
};

/** The fact line along the bottom, with an optional source under it. */
const Cap: React.FC<{f: number; at: number; until?: number; children: React.ReactNode; source?: string; dark?: boolean}> = ({f, at: a, until, children, source, dark}) => {
  const k = ease(f, a, 10) * (until !== undefined ? 1 - ease(f, until, 8) : 1);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, bottom: 70, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 20}px)`}}>
      <Tag bg={dark ? P.ink : P.white} color={dark ? P.white : P.ink} size={40}>
        {children}
      </Tag>
      {source && (
        <Note style={{marginTop: 12}} size={26} color="rgba(255,255,255,0.75)">
          Source · {source}
        </Note>
      )}
    </div>
  );
};

/** A source line in the top-right corner. */
const Src: React.FC<{f: number; at: number; children: React.ReactNode}> = ({f, at: a, children}) => (
  <Note style={{position: 'absolute', right: 80, top: 84, opacity: ease(f, a, 10)}} size={26} color="rgba(255,255,255,0.75)">
    Source · {children}
  </Note>
);

/** A pill-shaped label drawn inside the SVG world (moves with the camera). */
const STag: React.FC<{x: number; y: number; text: string; size?: number; bg?: string; color?: string; k?: number}> = ({x, y, text, size = 36, bg = P.white, color = P.ink, k = 1}) => {
  if (k <= 0) return null;
  const wd = text.length * size * 0.6 + size * 1.3, h = size * 1.65;
  return (
    <g transform={`translate(${x},${y}) scale(${k})`} opacity={Math.min(1, k)}>
      <rect x={-wd / 2} y={-h / 2} width={wd} height={h} rx={h / 2} fill={bg} />
      <text y={size * 0.36} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};
const T: React.FC<{x: number; y: number; size?: number; c?: string; anchor?: 'start' | 'middle' | 'end'; o?: number; w?: number; children: React.ReactNode}> = ({x, y, size = 34, c = P.white, anchor = 'middle', o = 1, w = 800, children}) =>
  o > 0 ? (
    <text x={x} y={y} textAnchor={anchor} fontFamily="Poppins" fontWeight={w} fontSize={size} fill={c} opacity={o}>
      {children}
    </text>
  ) : null;

/** A reactor building: a block with a dome. */
const Dome: React.FC<{c?: string; glow?: number}> = ({c = '#E8EEF9', glow = 0}) => (
  <g>
    <rect x={-60} y={-60} width={120} height={100} fill={c} />
    <path d="M-60 -60 A60 52 0 0 1 60 -60 Z" fill={shade(c, 0.92)} />
    <rect x={-60} y={30} width={120} height={10} fill={shade(c, 0.72)} />
    {glow > 0 && <circle cy={-40} r={90} fill={P.yellow} opacity={0.25 * glow} />}
  </g>
);
/** A trailer-mounted gas turbine seen from the side, with its exhaust. */
const TurbineSide: React.FC<{f: number; smoke?: number; cab?: boolean}> = ({f, smoke = 1, cab = false}) => (
  <g>
    {Array.from({length: 4}, (_, j) => {
      const k = (f / 30 + j / 4) % 1;
      return <circle key={j} cx={90 + k * 50} cy={-130 - k * 90} r={12 + k * 26} fill="#B8BFCC" opacity={(1 - k) * 0.7 * smoke} />;
    })}
    <rect x={72} y={-124} width={34} height={70} fill="#8E9AB3" />
    <rect x={-130} y={-60} width={260} height={92} rx={8} fill="#F4F6FB" />
    <rect x={-130} y={-60} width={260} height={14} rx={6} fill="#C9D2E6" />
    {[-104, -66, -28].map((x) => (
      <rect key={x} x={x} y={-36} width={28} height={50} rx={4} fill="#C9D2E6" />
    ))}
    {cab && (
      <g>
        <path d="M130 -20 H178 L196 8 V32 H130 Z" fill={P.red} />
        <rect x={150} y={-12} width={26} height={18} fill="#9BB7E0" />
        <circle cx={170} cy={38} r={14} fill={P.ink} />
      </g>
    )}
    {[-96, -60, 90].map((x) => (
      <circle key={x} cx={x} cy={38} r={14} fill={P.ink} />
    ))}
  </g>
);
const Church: React.FC = () => (
  <g>
    <rect x={-90} y={-40} width={180} height={110} fill="#F2E3C9" />
    <path d="M-100 -38 L0 -100 L100 -38 Z" fill={P.red} />
    <rect x={-26} y={-180} width={52} height={100} fill="#F2E3C9" />
    <path d="M-34 -178 L0 -240 L34 -178 Z" fill={P.red} />
    <rect x={-4} y={-276} width={8} height={40} fill={P.white} />
    <rect x={-15} y={-264} width={30} height={8} fill={P.white} />
    <rect x={-18} y={18} width={36} height={52} rx={18} fill="#7A4E2D" />
    <circle cy={-130} r={12} fill="#9BB7E0" />
  </g>
);
/** A refinery: round tanks, a column, a flare stack. */
const Refinery: React.FC<{f: number}> = ({f}) => (
  <g>
    <rect x={30} y={-170} width={16} height={190} fill="#8E9AB3" />
    <path d={`M38 -172 q${-10 + Math.sin(f / 3) * 6} -30 0 -${48 + Math.sin(f / 2) * 8} q12 22 0 48 Z`} fill={P.orange} />
    <rect x={-20} y={-120} width={30} height={140} rx={8} fill="#C9D2E6" />
    {[-90, -40].map((x) => (
      <g key={x}>
        <rect x={x - 34} y={-30} width={68} height={50} fill="#DDE3EE" />
        <ellipse cx={x} cy={-30} rx={34} ry={12} fill="#F4F6FB" />
      </g>
    ))}
  </g>
);
/** A molecule of nitrogen oxide: NO, or NO2 when `two`. */
const Mol: React.FC<{two?: boolean; s?: number; rot?: number}> = ({two, s = 1, rot = 0}) => (
  <g transform={`scale(${s}) rotate(${rot})`}>
    <line x1={0} y1={0} x2={24} y2={0} stroke={P.white} strokeWidth={5} />
    {two && <line x1={0} y1={0} x2={-14} y2={20} stroke={P.white} strokeWidth={5} />}
    <circle r={16} fill={P.blue} />
    <circle cx={26} r={13} fill={P.red} />
    {two && <circle cx={-15} cy={22} r={13} fill={P.red} />}
  </g>
);
/** Lungs whose airways narrow as `tight` goes 0 → 1; breathing speeds up. */
const Lungs: React.FC<{f: number; tight: number}> = ({f, tight}) => {
  const b = 1 + 0.035 * Math.sin(f / lerp(16, 5, tight));
  const air = lerp(13, 4, tight);
  const lobe = 'M-22 -80 C-70 -96 -140 -20 -128 84 C-120 140 -46 136 -28 92 Z';
  return (
    <g transform={`scale(${b})`}>
      <path d={lobe} fill="#FF8FAE" />
      <path d={lobe} fill="#FF8FAE" transform="scale(-1,1)" />
      <rect x={-11} y={-160} width={22} height={90} rx={11} fill="#F1C9D4" />
      <g stroke="#8B1E3F" strokeWidth={air} strokeLinecap="round" fill="none">
        <path d="M0 -72 L-40 -36 L-74 6 M-40 -36 L-52 40 M-74 6 L-96 50 M-74 6 L-70 70" />
        <path d="M0 -72 L40 -36 L74 6 M40 -36 L52 40 M74 6 L96 50 M74 6 L70 70" />
      </g>
    </g>
  );
};

/* ================================================================== 359.2 "415 terawatt-hours... let's make it real" */
const DC1: V[] = Array.from({length: 14}, (_, i) => {
  const a = random(`c2a${i}`) * Math.PI * 2;
  const r = 40 + Math.sqrt(random(`c2r${i}`)) * 165;
  return [Math.cos(a) * r, Math.sin(a) * r * 0.85];
});
export const C2Twh: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const flow = ease(f, w(361.7), 12);
  const doubt = ease(f, w(366.4), 10) * (1 - ease(f, w(368.6), 10));
  return (
    <Bg c={P.night}>
      <Cam f={f} t0={t0} keys={[[t0, 600, 560, 1.55, -10, 4], [361.4, 640, 560, 1.2, -4, 2], [363.2, 960, 540, 1.0, 0, 0], [369.9, 990, 540, 1.04, 5, 0]]}>
        <World>
          <circle cx={600} cy={560} r={310} fill={P.blue} opacity={0.18} />
          <Put x={600} y={560} s={2.6}>
            <Globe f={f} />
          </Put>
          {flow > 0 &&
            DC1.filter((_, i) => i % 2 === 0).map(([x, y], i) => <Flow key={i} pts={[[600 + x, 560 + y], [980, 470 + y * 0.3], [1140, 450]]} f={f + i * 9} c={P.yellow} n={3} r={7} speed={8} o={flow} />)}
          {DC1.map(([x, y], i) => {
            const k = pop(f, w(360.53) + i * 1.7, 10);
            return k > 0 ? (
              <g key={i} transform={`translate(${600 + x},${560 + y}) scale(${k * 0.2})`}>
                <circle r={120} fill={P.yellow} opacity={0.3} />
                <DataCentre f={f + i * 5} busy={1} />
              </g>
            ) : null;
          })}
        </World>
      </Cam>
      <Lbl f={f} at={w(359.39)} title="2024" sub="data centres around the world" bg={P.yellow} />
      <div style={{position: 'absolute', left: 1180, top: 290, opacity: 1 - doubt * 0.55, filter: doubt > 0.01 ? `blur(${doubt * 3}px)` : undefined}}>
        <Counter f={f} start={w(362.25)} dur={30} to={415} size={210} color={P.yellow} />
        <div style={{opacity: ease(f, w(363.58), 8), fontFamily: AF.head, fontWeight: 800, fontSize: 76, color: P.white, lineHeight: 1.1}}>terawatt-hours</div>
        <div style={{opacity: ease(f, w(364.61), 8), fontFamily: AF.head, fontWeight: 600, fontSize: 40, color: P.white, marginTop: 10}}>of electricity, in one year</div>
      </div>
      {([[1150, 250], [1780, 330], [1720, 650]] as V[]).map(([x, y], i) => (
        <Pop key={i} f={f} at={w(366.63) + i * 4} x={x} y={y} size={110} color={P.sky} until={w(368.5)}>
          ?
        </Pop>
      ))}
      <Pop f={f} at={w(368.61)} x={1460} y={830} size={64}>
        <span style={{background: P.white, color: P.ink, borderRadius: 30, padding: '10px 34px'}}>Let's make it real</span>
      </Pop>
      <Src f={f} at={w(362.6)}>IEA, Energy and AI (2025)</Src>
    </Bg>
  );
};

/* ================================================================== 369.9 "1.5% of all the electricity on Earth... more than many countries... growing fast" */
const SPOTS: V[] = [[-225, -75], [-225, 75], [-75, -225], [-75, -75], [-75, 75], [-75, 225], [75, -225], [75, -75], [75, 75], [75, 225], [225, -75], [225, 75]];
const COUNTRIES = SPOTS.map(([sx, sy], i) => {
  const cx = sx + (random(`cx${i}`) - 0.5) * 50, cy = sy + (random(`cy${i}`) - 0.5) * 50;
  const d =
    Array.from({length: 9}, (_, j) => {
      const a = (j / 9) * Math.PI * 2;
      const r = 40 + random(`cr${i}-${j}`) * 30;
      return `${j ? 'L' : 'M'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r * 0.8).toFixed(1)}`;
    }).join(' ') + ' Z';
  return {d, o: random(`co${i}`)};
});
const RANK = COUNTRIES.map((c, i) => ({o: c.o, i})).sort((a, b) => a.o - b.o).map((x) => x.i);
export const C2Share: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const toGlobe = ease(f, w(374.7), 14);
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.06, -6, 6], [374.5, 960, 540, 1.0, 0, 0], [375.3, 960, 560, 1.1, 10, 0], [379.6, 960, 540, 0.95, -6, 0]]}>
        <World>
          {toGlobe < 1 && (
            <g opacity={1 - toGlobe}>
              {Array.from({length: 200}, (_, i) => {
                const c = i % 20, r = Math.floor(i / 20);
                const lit = i < 3;
                const k = lit ? pop(f, w(371.45) + i * 4, 10) : 1;
                return (
                  <rect
                    key={i}
                    x={140 + c * 56 + (24 - 24 * Math.min(1.2, k))}
                    y={250 + r * 56 + (24 - 24 * Math.min(1.2, k))}
                    width={48 * Math.min(1.2, k)}
                    height={48 * Math.min(1.2, k)}
                    rx={7}
                    fill={lit && k > 0 ? P.yellow : '#2A3B7A'}
                    style={lit && k > 0 ? {filter: `drop-shadow(0 0 14px ${P.yellow})`} : undefined}
                  />
                );
              })}
            </g>
          )}
          {toGlobe > 0 && (
            <g opacity={toGlobe} transform="translate(960,540)">
              <circle r={340} fill={P.water} />
              {[-60, -30, 0, 30, 60].map((d) => (
                <ellipse key={d} cy={d * 4.6} rx={340 * Math.cos((d * Math.PI) / 180)} ry={40 * Math.cos((d * Math.PI) / 180)} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} />
              ))}
              {COUNTRIES.map((c, i) => {
                const k = ease(f, w(375.45) + RANK.indexOf(i) * 3, 6);
                return <path key={i} d={c.d} fill={k > 0.5 ? P.yellow : '#1F8A50'} stroke={P.navy} strokeWidth={4} style={k > 0.5 ? {filter: `drop-shadow(0 0 12px ${P.yellow})`} : undefined} />;
              })}
              <circle r={340} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={5} />
            </g>
          )}
        </World>
      </Cam>
      <Lbl f={f} at={0} until={w(374.6)} title="World electricity, 2024" sub="200 squares · 1 square = 0.5%" />
      <div style={{position: 'absolute', left: 1340, top: 290, width: 520, opacity: ease(f, w(370.4), 10) * (1 - toGlobe)}}>
        <Counter f={f} start={w(370.53)} dur={22} to={1.5} decimals={1} suffix="%" size={170} color={P.yellow} />
        <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 42, color: P.white, lineHeight: 1.2, marginTop: 10}}>used by data centres</div>
        <Note style={{marginTop: 18, opacity: ease(f, w(372.1), 10)}} size={28}>
          the 3 yellow squares
        </Note>
      </div>
      <Cap f={f} at={w(374.81)} until={w(377.7)} source="IEA, Energy and AI (2025)">
        More than many entire countries use in a year
      </Cap>
      <Pop f={f} at={w(378.37)} x={960} y={970} size={60}>
        <span style={{background: P.yellow, color: P.ink, borderRadius: 30, padding: '8px 34px'}}>And it's growing fast ↗</span>
      </Pop>
    </Bg>
  );
};

/* ================================================================== 379.6 IEA: 945 TWh by 2030, more than double, about Japan, driven by AI */
export const C2Growth: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const B = 760, K = 0.5;
  const g24 = ease(f, w(380.3), 18);
  const g30 = ease(f, w(382.39), w(385.19) - w(382.39));
  const gJp = ease(f, w(392.03), 18);
  const ghostO = 1 - ease(f, w(393.6), 10);
  const ai = ease(f, w(394.27), 14);
  const h24 = 415 * K, h30 = 945 * K;
  return (
    <Bg c="#1E1650">
      <Cam f={f} t0={t0} keys={[[t0, 900, 560, 1.18, -16, 8], [384.5, 960, 540, 1.0, -8, 4], [391.5, 1120, 520, 1.04, 10, 4], [396.7, 1000, 530, 1.0, 0, 0]]}>
        <World>
          <rect x={300} y={B} width={1380} height={6} rx={3} fill="rgba(255,255,255,0.4)" />
          {/* 2024 */}
          <rect x={440} y={B - h24 * g24} width={240} height={h24 * g24} rx={10} fill={P.sky} />
          <T x={560} y={B - h24 + 56} size={46} c={P.ink} o={ease(f, w(380.8), 8)}>415</T>
          {/* 2030 */}
          <rect x={880} y={B - h30 * g30} width={240} height={h30 * g30} rx={10} fill={P.yellow} />
          {ai > 0 && <rect x={880} y={B - h30} width={240} height={h30 - h24} rx={10} fill={P.pink} opacity={ai} />}
          <T x={1000} y={B - h30 + 56} size={46} c={P.ink} o={ease(f, w(385.19), 8)}>945</T>
          {ai > 0 && (
            <g opacity={ai}>
              <T x={1000} y={B - h30 + 140} size={34}>AI: the</T>
              <T x={1000} y={B - h30 + 182} size={34}>biggest</T>
              <T x={1000} y={B - h30 + 224} size={34}>driver</T>
            </g>
          )}
          {/* two 2024s stacked: more than double */}
          {ghostO > 0 &&
            [0, 1].map((i) => {
              const d = ease(f, w(388.43) + i * 9, 16);
              if (d <= 0) return null;
              const x = lerp(440, 880, d), y = lerp(B - h24, B - h24 * (i + 1), d);
              return <rect key={i} x={x} y={y} width={240} height={h24} rx={10} fill="rgba(255,255,255,0.14)" stroke={P.white} strokeWidth={5} strokeDasharray="16 10" opacity={ghostO} />;
            })}
          <T x={1000} y={B - h30 - 30} size={40} o={ease(f, w(388.71), 8)}>more than ×2</T>
          {/* Japan today */}
          <rect x={1320} y={B - h30 * gJp} width={240} height={h30 * gJp} rx={10} fill="#F4F6FB" />
          <circle cx={1440} cy={B - h30 + 120} r={44} fill={P.red} opacity={ease(f, w(392.3), 8)} />
          <T x={1440} y={B - h30 + 56} size={46} c={P.ink} o={ease(f, w(392.4), 8)}>≈ 945</T>
          <T x={560} y={B + 52} size={38} o={g24}>2024</T>
          <T x={1000} y={B + 52} size={38} o={ease(f, w(382.39), 8)}>2030</T>
          <T x={1000} y={B + 92} size={28} c={P.steel} w={600} o={ease(f, w(382.39), 8)}>projected</T>
          <T x={1440} y={B + 52} size={38} o={ease(f, w(392.03), 8)}>Japan, today</T>
          <T x={1440} y={B + 92} size={28} c={P.steel} w={600} o={ease(f, w(392.03), 8)}>the whole country</T>
        </World>
      </Cam>
      <Lbl f={f} at={w(380.0)} title="International Energy Agency" sub="data centres · terawatt-hours a year" />
      <Cap f={f} at={w(388.13)} until={w(393.7)}>More than double: about what all of Japan uses today</Cap>
      <Cap f={f} at={w(393.83)} source="IEA, Energy and AI (2025)">
        And the biggest driver of that growth is AI
      </Cap>
    </Bg>
  );
};

/* ================================================================== 396.7 United States: 4.4% in 2023, up to 12% by 2028 */
const TILES = Array.from({length: 100}, (_, n) => ({n, i: n % 10, j: Math.floor(n / 10)})).sort((a, b) => a.i + a.j - (b.i + b.j));
export const C2US: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const S = 72, TW = 64;
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.08, -10, 0], [403, 960, 540, 1.0, 0, 0], [409.9, 960, 540, 1.04, 8, 0]]}>
        <World>
          <g transform="translate(1300,250) scale(0.72)">
            {TILES.map(({n, i, j}) => {
              const x = i * S, y = j * S;
              const k23 = n <= 4 ? pop(f, w(399.48) + n * 4, 10) : 0;
              const k28 = n >= 4 && n <= 11 ? pop(f, w(406.65) + (n - 4) * 3, 10) : 0;
              const base = [iso(x, y), iso(x + TW, y), iso(x + TW, y + TW), iso(x, y + TW)];
              return (
                <g key={n}>
                  <polygon points={pts(base)} fill="#26357A" />
                  {n < 4 && k23 > 0 && <IsoBox x={x} y={y} w={TW} d={TW} h={50 * k23} top={P.yellow} side={P.yellow} />}
                  {n === 4 && k23 > 0 && <IsoBox x={x} y={y} w={TW * 0.4} d={TW} h={50 * k23} top={P.yellow} side={P.yellow} />}
                  {n === 4 && k28 > 0 && <IsoBox x={x + TW * 0.4} y={y} w={TW * 0.6} d={TW} h={50 * k28} top={P.orange} side={P.orange} />}
                  {n > 4 && k28 > 0 && <IsoBox x={x} y={y} w={TW} d={TW} h={50 * k28} top={P.orange} side={P.orange} />}
                </g>
              );
            })}
          </g>
        </World>
      </Cam>
      <Lbl f={f} at={w(397.09)} title="United States" sub="1 tile = 1% of the country's electricity" />
      <div style={{position: 'absolute', left: 120, top: 250, opacity: ease(f, w(397.95), 10)}}>
        <Tag bg={P.yellow} color={P.ink} size={36}>2023</Tag>
        <Counter f={f} start={w(399.48)} dur={22} to={4.4} decimals={1} suffix="%" size={140} color={P.yellow} style={{marginTop: 12}} />
        <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 36, color: P.white, marginTop: 6}}>used by data centres</div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 560, opacity: ease(f, w(406.49), 10)}}>
        <Tag bg={P.orange} color={P.ink} size={36}>2028 estimate</Tag>
        <Counter f={f} start={w(408.37)} dur={18} from={4.4} to={12} prefix="up to " suffix="%" size={120} color={P.orange} style={{marginTop: 12}} />
        <Note style={{marginTop: 10, opacity: ease(f, w(409.2), 10)}} size={28}>
          the study's range: 6.7–12%
        </Note>
      </div>
      <Cap f={f} at={w(403.91)} source="LBNL, US Data Center Energy Usage Report (Dec 2024)">
        A US government-funded study: Lawrence Berkeley National Lab
      </Cap>
    </Bg>
  );
};

/* ================================================================== 409.9 Dublin at night; Ireland 21% vs all urban homes 18% */
const DUB = (() => {
  const out: {x: number; y: number; w: number; d: number; h: number; dc?: boolean}[] = [];
  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 7; j++) {
      if (j === 3) continue;
      out.push({x: i * 110, y: j * 110 + (j > 3 ? 40 : 0), w: 70, d: 70, h: 30 + random(`dh${i}-${j}`) * 90});
    }
  out.push({x: -320, y: 80, w: 220, d: 160, h: 40, dc: true}, {x: 1160, y: 520, w: 240, d: 180, h: 44, dc: true}, {x: 380, y: 860, w: 260, d: 150, h: 40, dc: true}, {x: 1180, y: 60, w: 200, d: 150, h: 40, dc: true});
  return out.sort((a, b) => a.x + a.y - (b.x + b.y));
})();
export const C2Ireland: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const dim = ease(f, w(412.5), 14);
  return (
    <Bg c="#0A1030">
      <Cam f={f} t0={t0} keys={[[t0, 900, 520, 1.25, -8, 6], [412.5, 1000, 560, 1.0, 0, 4], [423.0, 1040, 560, 0.95, 6, 4]]}>
        <World>
          <g transform="translate(856,100)">
            <polygon points={pts([iso(-700, -300), iso(1700, -300), iso(1700, 1200), iso(-700, 1200)])} fill="#141B45" />
            <polygon points={pts([iso(-700, 335), iso(1700, 335), iso(1700, 405), iso(-700, 405)])} fill="#1E4FA8" />
            {Array.from({length: 8}, (_, i) => {
              const x0 = ((i * 300 + f * 5) % 2400) - 700;
              return <polyline key={i} points={pts([iso(x0, 370), iso(x0 + 80, 370)])} stroke="#6FA8FF" strokeWidth={4} strokeLinecap="round" opacity={0.6} />;
            })}
            {DUB.map((b, n) => (
              <g key={n}>
                <IsoBox x={b.x} y={b.y} w={b.w} d={b.d} h={b.h} top={b.dc ? '#CFE3FF' : '#2A3B7A'} side={b.dc ? '#9DB8E8' : '#1B2550'} />
                {b.dc &&
                  Array.from({length: 6}, (_, q) => {
                    const [sx, sy] = iso(b.x + 30 + (q % 3) * 60, b.y + 40 + Math.floor(q / 3) * 60, b.h);
                    return <ellipse key={q} cx={sx} cy={sy} rx={18} ry={9} fill={P.sky} opacity={0.5 + 0.5 * Math.sin(f / 4 + q)} />;
                  })}
                {!b.dc &&
                  [0.25, 0.65].map((u) =>
                    [0.3, 0.65].map((v) => {
                      const [sx, sy] = iso(b.x + b.w * u, b.y + b.d, b.h * v);
                      const on = (Math.floor(f / 18 + n * 3.7 + u * 10 + v * 7) % 5) !== 0;
                      return <rect key={`${u}${v}`} x={sx - 4} y={sy - 6} width={9} height={11} fill={P.yellow} opacity={on ? 0.95 : 0.2} />;
                    }),
                  )}
              </g>
            ))}
          </g>
        </World>
      </Cam>
      <AbsoluteFill style={{background: 'rgba(8,12,40,0.7)', opacity: dim}} />
      <Lbl f={f} at={w(410.2)} until={w(412.3)} title="Dublin, Ireland" sub="some places are already feeling it" bg={P.ink} color={P.white} />
      <Lbl f={f} at={w(412.63)} title="Ireland's electricity, 2023" sub="share used by each" />
      {dim > 0 && (
        <AbsoluteFill style={{opacity: dim}}>
          <svg width={200} height={130} viewBox="-100 -80 200 130" style={{position: 'absolute', left: 100, top: 360}}>
            <g transform="scale(0.55)">
              <DataCentre f={f} busy={1} />
            </g>
          </svg>
          <div style={{position: 'absolute', left: 330, top: 360}}>
            <Meter f={f} start={w(414.55)} value={21} max={25} label="Data centres" text="21%" color={P.sky} w={1300} />
          </div>
          <svg width={200} height={130} viewBox="-100 -80 200 130" style={{position: 'absolute', left: 100, top: 590, opacity: ease(f, w(420.29), 10)}}>
            {[-55, 0, 55].map((x, i) => (
              <g key={x} transform={`translate(${x},${i === 1 ? -6 : 6}) scale(0.5)`}>
                <House c={[P.orange, P.red, P.teal][i]} on={1} />
              </g>
            ))}
          </svg>
          <div style={{position: 'absolute', left: 330, top: 590}}>
            <Meter f={f} start={w(420.29)} value={18} max={25} label="All homes in cities and towns" text="18%" color={P.orange} w={1300} />
          </div>
        </AbsoluteFill>
      )}
      <Cap f={f} at={w(418.99)} source="CSO Ireland (July 2024)">
        More than all the homes in Ireland's cities and towns combined
      </Cap>
    </Bg>
  );
};

/* ================================================================== 423.0 Dublin's grid stretched; new connections paused */
export const C2Dublin: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const stretch = ease(f, w(424.55), 16);
  const arrive = ease(f, w(426.6), 18);
  const stop = pop(f, w(426.83), 12);
  const dcs = [760, 1060, 1360];
  const A: V = [408, 572];
  return (
    <Bg c={P.night}>
      <Cam f={f} t0={t0} keys={[[t0, 860, 580, 1.12, -10, 6], [426.3, 1060, 580, 1.0, 6, 4], [430.1, 1180, 560, 1.08, 10, 2]]}>
        <World w={2400}>
          <rect x={-400} y={800} width={2800} height={400} fill="#0F2A2A" />
          <Put x={300} y={680} s={1.8}>
            <Pylon c="#9AA6BD" />
          </Put>
          {dcs.map((x, i) => {
            const B: V = [x - 100, 690];
            const sag = lerp(90, 6, stretch);
            const jit = Math.sin(f * 1.3 + i) * 4 * stretch;
            const mid: V = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + sag + jit];
            const curve: V[] = Array.from({length: 13}, (_, q) => {
              const u = q / 12;
              return [(1 - u) * (1 - u) * A[0] + 2 * u * (1 - u) * mid[0] + u * u * B[0], (1 - u) * (1 - u) * A[1] + 2 * u * (1 - u) * mid[1] + u * u * B[1]];
            });
            return (
              <g key={x}>
                <path d={line(curve)} stroke={mix(P.sky, P.red, stretch)} strokeWidth={6 + 3 * stretch} fill="none" />
                <Flow pts={curve} f={f + i * 7} c={P.yellow} n={4} r={7} speed={6 + 4 * stretch} line={false} />
                <Put x={x} y={740} s={0.9}>
                  <DataCentre f={f + i * 5} busy={1} />
                </Put>
              </g>
            );
          })}
          {/* the new one: no connection */}
          <Put x={lerp(2250, 1720, arrive)} y={740} s={0.9}>
            <DataCentre f={f} c="#9AA3B8" />
          </Put>
          {arrive > 0.9 && <path d="M1630 690 Q1580 640 1560 600" stroke={P.white} strokeWidth={6} strokeDasharray="14 12" fill="none" opacity={0.7} />}
          {stop > 0 && (
            <g transform={`translate(1510,600) scale(${stop})`}>
              <rect x={-12} y={-20} width={24} height={220} fill="#C9D2E6" />
              <rect x={-150} y={-90} width={300} height={100} rx={18} fill={P.red} />
              <T x={0} y={-50} size={30}>NO NEW</T>
              <T x={0} y={-12} size={30}>CONNECTIONS</T>
            </g>
          )}
        </World>
      </Cam>
      <Lbl f={f} at={w(423.15)} title="The grid around Dublin" sub="stretched to the limit" />
      <div style={{position: 'absolute', right: 80, top: 70, textAlign: 'right', opacity: ease(f, w(425.45), 10)}}>
        <Tag bg={P.white} color={P.ink} size={40}>EirGrid</Tag>
        <Note style={{marginTop: 12}} size={28}>Ireland's grid operator</Note>
      </div>
      <Cap f={f} at={w(427.25)} source="EirGrid · pause expected to last until 2028">
        New data centres near Dublin: effectively not connected, for years
      </Cap>
    </Bg>
  );
};

/* ================================================================== 430.1 the problem: enormous power, all day and night, clean */
const STARS = Array.from({length: 50}, (_, i) => [random(`sx${i}`) * 1920, random(`sy${i}`) * 560, 2 + random(`sr${i}`) * 3]);
export const C2Problem: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const n = ease(f, w(436.59), 26);
  const big = ease(f, w(434.6), 12);
  const ask = ease(f, w(439.94), 8);
  const clean = ease(f, w(441.6), 14);
  const needs: [string, number, string][] = [['1 · Enormous amounts of power', 433.31, P.yellow], ['2 · All day and all night', 436.07, P.sky], ['3 · Promised: clean', 441.53, P.grass]];
  return (
    <AbsoluteFill style={{background: `linear-gradient(${mix(P.sky, P.night, n)}, ${mix('#BDE6FF', '#1B2C6B', n)})`, overflow: 'hidden'}}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.1, -6, 4], [435.5, 900, 560, 1.0, 0, 2], [439.6, 780, 600, 1.1, -8, 4], [443.9, 960, 560, 1.0, 4, 0]]}>
        <World>
          {STARS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={P.white} opacity={n * (0.5 + 0.5 * Math.sin(f / 6 + i))} />
          ))}
          <g transform={`translate(${lerp(1000, 1250, n)},${lerp(260, 1150, n)})`}>
            <Sun f={f} />
          </g>
          <g transform={`translate(${lerp(260, 640, n)},${lerp(1150, 270, n)})`}>
            <circle r={62} fill="#F4F6FB" />
            <circle cx={26} cy={-14} r={54} fill={mix(P.sky, P.night, n)} />
          </g>
          <rect x={-200} y={820} width={2400} height={400} fill={mix(P.green, '#0F3B2A', n)} />
          <Put x={220} y={700} s={1.4}>
            <Pylon />
          </Put>
          <Flow pts={[[300, 620], [700, 600], [930, 680]]} f={f} c={P.yellow} n={4 + Math.round(8 * big)} r={8 + 5 * big} speed={7 + 4 * big} />
          {clean > 0 && <circle cx={1100} cy={700} r={360} fill="none" stroke={P.grass} strokeWidth={10} strokeDasharray="30 22" strokeDashoffset={-f * 3} opacity={clean * 0.8} />}
          <Put x={1100} y={740} s={2.0}>
            <DataCentre f={f} busy={1} />
          </Put>
          <Put x={560} y={790} s={1.3}>
            <House c={P.orange} on={n > 0.5 ? 1 : 0} />
          </Put>
          {ask > 0 && (
            <g opacity={ask}>
              <Flow pts={[[600, 760], [780, 700], [900, 700]]} f={f} c={P.sky} n={3} r={8} speed={6} />
              <g transform={`translate(560,610) scale(${pop(f, w(439.94), 10)})`}>
                <rect x={-50} y={-44} width={100} height={80} rx={20} fill={P.white} />
                <path d="M-14 34 L0 56 L14 34 Z" fill={P.white} />
                <T x={0} y={18} size={52} c={P.ink}>?</T>
              </g>
              <STag x={560} y={500} text="3:00 a.m." size={40} bg={P.yellow} k={pop(f, w(439.94), 10)} />
            </g>
          )}
        </World>
      </Cam>
      <Lbl f={f} at={w(430.29)} title="The problem" sub="what the tech companies face" />
      <div style={{position: 'absolute', right: 80, top: 210, display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'flex-end'}}>
        {needs.map(([t, a, c]) => (
          <div key={t} style={{opacity: ease(f, w(a), 8), transform: `scale(${Math.max(0.001, pop(f, w(a), 12))})`, transformOrigin: '100% 50%'}}>
            <Tag bg={c} color={P.ink} size={40}>{t}</Tag>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== 443.9 solar stops at night, wind doesn't blow on command: the gap */
const HX = (h: number) => 220 + h * (1480 / 24);
const solarY = (h: number) => 800 - (h > 6 && h < 18 ? 340 * Math.pow(Math.sin((Math.PI * (h - 6)) / 12), 1.2) : 0);
const windY = (h: number) => {
  const v = 0.45 + 0.24 * Math.sin(0.8 * h + 1) + 0.16 * Math.sin(2.1 * h + 0.5) - 0.42 * Math.exp(-((h - 14) ** 2) / 3);
  return 800 - 300 * Math.max(0.03, Math.min(1, v));
};
const HOURS = Array.from({length: 97}, (_, i) => i / 4);
export const C2Gap: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const sol = ease(f, w(444.08), 24);
  const night = ease(f, w(445.07), 10);
  const wind = ease(f, w(445.85), 24);
  const gap = ease(f, w(448.29), 14);
  const DY = 380;
  const best = HOURS.map((h): V => [HX(h), Math.max(DY, Math.min(solarY(h), windY(h)))]);
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 720, 560, 1.12, -12, 6], [447.5, 1100, 560, 1.04, 8, 4], [453.6, 960, 540, 1.0, 0, 0]]}>
        <World>
          {night > 0 &&
            [[0, 6], [18, 24]].map(([a, b]) => (
              <g key={a} opacity={night}>
                <rect x={HX(a)} y={260} width={HX(b) - HX(a)} height={540} fill="#050A24" opacity={0.6} />
                <T x={(HX(a) + HX(b)) / 2} y={300} size={32} c={P.steel}>night</T>
              </g>
            ))}
          <line x1={HX(0)} y1={800} x2={HX(24)} y2={800} stroke="rgba(255,255,255,0.5)" strokeWidth={4} />
          {[[0, 'midnight'], [6, '6 am'], [12, 'noon'], [18, '6 pm'], [24, 'midnight']].map(([h, t]) => (
            <T key={h as number} x={HX(h as number)} y={850} size={30} w={600} c={P.steel}>{t as string}</T>
          ))}
          {gap > 0 && <polygon points={pts([[HX(0), DY], [HX(24), DY], ...best.slice().reverse()])} fill={P.red} opacity={0.45 * gap} />}
          <path d={line(HOURS.map((h): V => [HX(h), solarY(h)]))} stroke={P.orange} strokeWidth={10} fill="none" pathLength={1} strokeDasharray={`${sol} 1`} strokeLinecap="round" />
          <path d={line(HOURS.map((h): V => [HX(h), windY(h)]))} stroke={P.teal} strokeWidth={10} fill="none" pathLength={1} strokeDasharray={`${wind} 1`} strokeLinecap="round" />
          <line x1={HX(0)} y1={DY} x2={HX(24)} y2={DY} stroke={P.yellow} strokeWidth={12} strokeLinecap="round" />
          <T x={HX(0) + 10} y={DY - 26} size={34} c={P.yellow} anchor="start">Data centre demand: flat, 24 hours</T>
          <T x={HX(12)} y={solarY(12) - 24} size={36} c={P.orange} o={sol}>Solar</T>
          <T x={HX(21.4)} y={windY(21.4) - 26} size={36} c={P.teal} o={wind}>Wind</T>
          {pop(f, w(446.97), 12) > 0 && (
            <g transform={`translate(${HX(14)},${windY(14) - 70}) scale(${pop(f, w(446.97), 12)})`}>
              <circle r={36} fill={P.white} />
              <T x={0} y={17} size={48} c={P.red}>?</T>
            </g>
          )}
          <T x={HX(3)} y={DY + 120} size={36} c={P.white} o={gap}>the gap</T>
        </World>
      </Cam>
      <Lbl f={f} at={0} until={w(448.0)} title="One day, hour by hour" sub="illustration, not measured data" />
      <Pop f={f} at={w(448.91)} x={960} y={150} size={62}>
        <span style={{background: P.grass, color: P.ink, borderRadius: 30, padding: '10px 36px'}}>Clean power that never turns off?</span>
      </Pop>
    </Bg>
  );
};

/* ================================================================== 453.6 Three Mile Island, 28 March 1979 */
const TP = (x: number, y: number, z = 0): V => {
  const [a, b] = iso(x, y, z);
  return [a + 873, b - 60];
};
type Piece = {x: number; y: number; kind: 'tower' | 'dome'; unit: 1 | 2};
const TMI: Piece[] = [
  {x: 360, y: 520, kind: 'tower', unit: 1},
  {x: 520, y: 520, kind: 'tower', unit: 1},
  {x: 440, y: 630, kind: 'dome', unit: 1},
  {x: 760, y: 520, kind: 'tower', unit: 2},
  {x: 920, y: 520, kind: 'tower', unit: 2},
  {x: 840, y: 630, kind: 'dome', unit: 2},
].sort((a, b) => a.x + a.y - (b.x + b.y)) as Piece[];
export const C2TMI: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const accident = ease(f, w(456.71), 10);
  const off2 = 1 - ease(f, w(460.6), 24);
  const inset = ease(f, w(459.8), 10) * (1 - ease(f, w(464.9), 10));
  const melt = ease(f, w(459.93), 36);
  const flee = ease(f, w(461.3), 10);
  const island = Array.from({length: 28}, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    return TP(650 + 440 * Math.cos(a), 575 + 115 * Math.sin(a));
  });
  return (
    <Bg c="#7ED957" c2="#4CB944" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 0.85, 0, 0], [457.3, 960, 540, 1.0, 0, 0], [459.8, 760, 560, 1.1, -6, 0], [461.4, 720, 640, 1.0, -4, 0], [464.6, 900, 520, 1.05, 0, 0], [469.0, 980, 470, 1.4, 5, 0]]}>
        <World>
          <polygon points={pts([TP(-1000, 380), TP(2400, 380), TP(2400, 770), TP(-1000, 770)])} fill={P.water} />
          {Array.from({length: 9}, (_, i) => {
            const x0 = ((i * 380 + f * 4) % 3400) - 1000;
            return <polyline key={i} points={pts([TP(x0, 420 + (i % 3) * 120), TP(x0 + 110, 420 + (i % 3) * 120)])} stroke="#BFE8FF" strokeWidth={6} strokeLinecap="round" />;
          })}
          <polygon points={pts(island)} fill="#C9B27A" />
          <polygon points={pts(island.map(([x, y]) => [x, y - 8] as V))} fill="#9FCF6A" />
          {/* the road out, over the bridge */}
          <polyline points={pts([TP(700, 680), TP(700, 1500)])} stroke="#5C5F6E" strokeWidth={34} />
          {flee > 0 &&
            Array.from({length: 10}, (_, i) => {
              const k = ((Math.max(0, f - w(461.3)) * 0.012 + i / 10) % 1);
              const [x, y] = TP(700, lerp(700, 1500, k));
              return <rect key={i} x={x - 16} y={y - 12} width={32} height={20} rx={6} fill={[P.red, P.yellow, P.white, P.blue][i % 4]} opacity={flee} />;
            })}
          {TMI.map((p, i) => {
            const [sx, sy] = TP(p.x, p.y);
            const steam = p.unit === 2 ? off2 : 1;
            return p.kind === 'tower' ? (
              <Put key={i} x={sx} y={sy - 80} s={0.8}>
                <CoolingTower f={f + i * 11} steam={steam} />
              </Put>
            ) : (
              <Put key={i} x={sx} y={sy - 32} s={0.8}>
                <Dome c={p.unit === 2 ? mix('#E8EEF9', '#F2B8A8', accident) : '#E8EEF9'} />
              </Put>
            );
          })}
          {accident > 0 && (
            <g>
              <ellipse cx={TP(840, 630)[0]} cy={TP(840, 630)[1] - 40} rx={120 + 20 * Math.sin(f / 3)} ry={60 + 10 * Math.sin(f / 3)} fill="none" stroke={P.red} strokeWidth={7} opacity={accident} />
              <STag x={TP(840, 630)[0] + 40} y={TP(840, 630)[1] + 70} text="Unit 2" size={34} bg={P.red} color={P.white} k={pop(f, w(456.71), 12)} />
            </g>
          )}
        </World>
      </Cam>
      <Lbl f={f} at={w(457.45)} title="Three Mile Island" sub="nuclear plant · Pennsylvania" subC={P.ink} />
      <div style={{position: 'absolute', right: 80, top: 70, transform: `scale(${Math.max(0.001, pop(f, w(454.25), 12))})`, transformOrigin: '100% 0'}}>
        <Tag bg={P.yellow} color={P.ink} size={48}>28 March 1979</Tag>
      </div>
      {inset > 0 && (
        <div style={{position: 'absolute', left: 1250, top: 200, width: 590, height: 600, borderRadius: 30, background: 'rgba(24,10,40,0.94)', boxShadow: `0 0 0 6px ${P.red}`, opacity: inset}}>
          <Note style={{margin: '26px 30px 0'}} size={28}>Inside Unit 2's reactor</Note>
          <svg width={590} height={420} viewBox="0 0 590 420">
            <circle cx={295} cy={330} r={160} fill={P.red} opacity={0.25 * melt * (0.7 + 0.3 * Math.sin(f / 3))} />
            {Array.from({length: 9}, (_, i) => {
              const x = 85 + i * 52;
              const mid = Math.abs(i - 4);
              const drop = mid < 3 ? melt * (220 - mid * 60) : 0;
              return (
                <g key={i}>
                  <rect x={x - 15} y={50} width={30} height={300 - drop} rx={8} fill="#7C8AA8" />
                  {drop > 0 && <rect x={x - 15} y={250 - drop} width={30} height={100} rx={8} fill={P.orange} opacity={melt} />}
                </g>
              );
            })}
            <ellipse cx={295} cy={370} rx={200 * melt} ry={34 * melt} fill={P.orange} />
          </svg>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 36, color: P.white, textAlign: 'center', opacity: ease(f, w(460.2), 10)}}>Part of the fuel melted</div>
        </div>
      )}
      <Cap f={f} at={w(461.41)} until={w(465.2)}>Thousands of families fled</Cap>
      <Cap f={f} at={w(465.35)}>For a generation, those cooling towers meant nuclear fear</Cap>
    </Bg>
  );
};

/* ================================================================== 469.0 Unit 2 never ran again; Unit 1 ran 40 more years, shut in 2019 for money */
export const C2Units: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const years = ease(f, w(474.47), w(476.21) - w(474.47));
  const quiet = ease(f, w(477.6), w(483.77) - w(477.6));
  const strike = ease(f, w(479.3), 10);
  return (
    <Bg c="#3A6FB0" c2="#9BD0FF" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 780, 560, 1.15, -8, 4], [471.9, 1300, 560, 1.15, 8, 4], [474.4, 960, 540, 1.0, 0, 0], [484.6, 1260, 560, 1.22, 4, 2]]}>
        <World>
          <rect x={-300} y={780} width={2600} height={40} fill="#6FBF5A" />
          <rect x={-300} y={820} width={2600} height={400} fill={P.water} />
          {/* Unit 2: closed since 1979 */}
          <g>
            <Put x={300} y={736} s={1.4}>
              <Dome c="#8A90A0" />
            </Put>
            {[520, 720].map((x) => (
              <Put key={x} x={x} y={630} s={1.5}>
                <CoolingTower f={f} c="#8A90A0" steam={0} />
              </Put>
            ))}
          </g>
          {/* Unit 1: ran until 2019 */}
          <g>
            <Put x={1180} y={736} s={1.4}>
              <Dome glow={0.5 * (1 - quiet)} />
            </Put>
            {[1400, 1600].map((x, i) => (
              <Put key={x} x={x} y={630} s={1.5}>
                <CoolingTower f={f + i * 13} steam={1 - quiet} />
              </Put>
            ))}
          </g>
          <STag x={520} y={420} text="Unit 2 · never ran again" size={34} bg={P.ink} color={P.white} k={pop(f, w(469.31), 12) * (1 - ease(f, w(477.2), 8))} />
          <STag x={1400} y={420} text={f < w(477.53) ? 'Unit 1 · kept running' : 'Unit 1 · shut down, 2019'} size={34} bg={f < w(477.53) ? P.yellow : P.red} color={f < w(477.53) ? P.ink : P.white} k={pop(f, w(472.11), 12)} />
        </World>
      </Cam>
      <Lbl f={f} at={0} title="Three Mile Island" sub="two reactors, one island" subC={P.ink} />
      <div style={{position: 'absolute', right: 80, top: 70, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16}}>
        <div style={{opacity: ease(f, w(478.67), 8), position: 'relative'}}>
          <Tag bg={P.white} color={P.ink} size={38}>Not because it was dangerous</Tag>
          <div style={{position: 'absolute', left: 10, top: '50%', height: 6, width: `${strike * 96}%`, background: P.red, borderRadius: 3}} />
        </div>
        <div style={{opacity: ease(f, w(480.25), 8), transform: `scale(${Math.max(0.001, pop(f, w(480.25), 12))})`, transformOrigin: '100% 50%'}}>
          <Tag bg={P.yellow} color={P.ink} size={38}>It couldn't make enough money</Tag>
        </div>
      </div>
      {/* 1979 → 2019 */}
      <div style={{position: 'absolute', left: 200, right: 200, bottom: 90, opacity: ease(f, w(474.1), 10)}}>
        <div style={{position: 'relative', height: 30, borderRadius: 15, background: 'rgba(16,19,34,0.45)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${years * 100}%`, borderRadius: 15, background: P.yellow}} />
          <div style={{position: 'absolute', left: `${years * 100}%`, bottom: 44, transform: 'translateX(-50%)', fontFamily: AF.head, fontWeight: 800, fontSize: 56, color: P.white, whiteSpace: 'nowrap'}}>{Math.round(1979 + 40 * years)}</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: AF.head, fontWeight: 700, fontSize: 32, color: P.white}}>
          <span>1979</span>
          <span style={{opacity: ease(f, w(474.91), 8)}}>40 more years</span>
          <span>2019</span>
        </div>
      </div>
    </Bg>
  );
};

/* ================================================================== 484.6 Sept 2024: Microsoft's 20-year deal; the reactor comes back */
export const C2Crane: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const docK = pop(f, w(486.89), 14) * (1 - ease(f, w(491.0), 10));
  const sign = ease(f, w(487.13), 14);
  const ghost = ease(f, w(489.31), 10);
  const back = ease(f, w(491.15), 30);
  const route: V[] = [[700, 560], [920, 470], [1160, 470], [1400, 680]];
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.0, 0, 0], [489.3, 960, 560, 0.96, -6, 4], [491.2, 620, 580, 1.2, -10, 4], [494.0, 960, 540, 1.0, 0, 0], [500.0, 1180, 540, 1.08, 8, 2]]}>
        <World>
          <rect x={-300} y={800} width={2600} height={400} fill="#1B2C6B" />
          <Put x={260} y={756} s={1.3}>
            <Dome glow={back} />
          </Put>
          {[460, 640].map((x, i) => (
            <Put key={x} x={x} y={660} s={1.4}>
              <CoolingTower f={f + i * 9} steam={back} />
            </Put>
          ))}
          {[920, 1160].map((x) => (
            <Put key={x} x={x} y={670} s={1.2}>
              <Pylon />
            </Put>
          ))}
          <path d={line(route)} stroke={P.yellow} strokeWidth={6} strokeDasharray="14 12" fill="none" opacity={ghost * 0.45 * (1 - back)} />
          {back > 0 && <Flow pts={route} f={f} c={P.yellow} n={8} r={10} speed={8} o={back} />}
          {[1500, 1780].map((x, i) => (
            <Put key={x} x={x} y={740} s={0.95}>
              <DataCentre f={f + i * 6} busy={back > 0.5 ? 1 : 0} />
            </Put>
          ))}
          <STag x={1640} y={590} text="Microsoft" size={38} k={pop(f, w(486.89), 12)} />
          {docK > 0 && (
            <g transform={`translate(960,250) scale(${1.4 * docK})`} opacity={Math.min(1, docK)}>
              <Doc title="Power deal" />
              <path d="M-50 72 q14 -26 28 0 t28 0 t28 0" stroke={P.blue} strokeWidth={4} fill="none" pathLength={1} strokeDasharray={`${sign} 1`} />
            </g>
          )}
          {docK > 0 &&
            Array.from({length: 20}, (_, i) => <rect key={i} x={700 + i * 26} y={405} width={20} height={26} rx={4} fill={ease(f, w(487.9) + i * 1.2, 4) > 0.5 ? P.yellow : '#2A3B7A'} opacity={Math.min(1, docK)} />)}
          <T x={680} y={432} size={40} anchor="end" o={ease(f, w(488.0), 8) * Math.min(1, docK)}>20 years</T>
        </World>
      </Cam>
      <Lbl f={f} at={w(485.15)} title="September 2024" bg={P.yellow} />
      <Cap f={f} at={w(492.9)} until={w(497.6)} source="Constellation, 20 Sep 2024">
        Unit 1, renamed Crane Clean Energy Center, to be brought back
      </Cap>
      <Pop f={f} at={w(498.35)} x={960} y={960} size={66}>
        <span style={{background: P.white, color: P.ink, borderRadius: 30, padding: '10px 36px'}}>
          largely to help power <span style={{color: P.pink}}>AI</span>
        </span>
      </Pop>
    </Bg>
  );
};

/* ================================================================== 500.0 Google and Amazon too; the size of the hunger */
type Lane = {y: number; name: string; at: number; deal: string; sub: string; c: string; icon: 'plant' | 'smr' | 'coin'; iat: number};
const LANES: Lane[] = [
  {y: 280, name: 'Microsoft', at: 500.21, deal: 'Restart Three Mile Island Unit 1', sub: '20-year power deal', c: P.sky, icon: 'plant', iat: 500.4},
  {y: 540, name: 'Google', at: 502.1, deal: 'Small modular reactors', sub: 'deal with Kairos Power', c: P.yellow, icon: 'smr', iat: 503.59},
  {y: 800, name: 'Amazon', at: 506.23, deal: 'Invested in a nuclear startup', sub: 'X-energy', c: P.orange, icon: 'coin', iat: 506.59},
];
const SMR: React.FC = () => (
  <g>
    <rect x={-18} y={-34} width={36} height={68} rx={16} fill="#E8EEF9" />
    <rect x={-18} y={-4} width={36} height={8} fill={P.yellow} />
  </g>
);
export const C2BigTech: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const join = ease(f, w(510.4), 16);
  const hunger = ease(f, w(515.3), 20);
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 900, 300, 1.1, -5, 2], [501.9, 900, 300, 1.1, -5, 2], [502.6, 900, 540, 1.1, -5, 2], [505.9, 900, 540, 1.1, -5, 2], [506.6, 900, 800, 1.1, -5, 2], [509.6, 900, 800, 1.1, -5, 2], [510.8, 960, 540, 0.95, 0, 0], [516.8, 1000, 540, 0.9, 4, 0]]}>
        <World>
          {LANES.map((l) => {
            const k = pop(f, w(l.at), 12);
            const ik = pop(f, w(l.iat), 12);
            return (
              <g key={l.name}>
                {k > 0 && (
                  <g transform={`translate(280,${l.y}) scale(${k})`}>
                    <rect x={-150} y={-38} width={300} height={76} rx={38} fill={P.white} />
                    <T x={0} y={15} size={40} c={P.ink}>{l.name}</T>
                  </g>
                )}
                {k > 0 && <Flow pts={[[440, l.y], [640, l.y]]} f={f} c={l.c} n={3} r={9} speed={5} o={Math.min(1, k)} />}
                {ik > 0 && (
                  <g transform={`translate(760,${l.y})`} opacity={Math.min(1, ik)}>
                    {l.icon === 'plant' && (
                      <g transform={`scale(${0.7 * ik})`}>
                        <NuclearPlant f={f} />
                      </g>
                    )}
                    {l.icon === 'smr' &&
                      [0, 1, 2, 3].map((i) => (
                        <g key={i} transform={`translate(${-82 + i * 55},0) scale(${pop(f, w(l.iat) + i * 3, 10)})`}>
                          <SMR />
                        </g>
                      ))}
                    {l.icon === 'coin' && (
                      <g>
                        {[0, 1, 2].map((i) => (
                          <g key={i} transform={`translate(-40,${34 - i * 16}) scale(0.5)`}>
                            <Coin />
                          </g>
                        ))}
                        <g transform="translate(50,0)">
                          <SMR />
                        </g>
                      </g>
                    )}
                  </g>
                )}
                <g opacity={ease(f, w(l.iat) + 4, 10) * (1 - join)}>
                  <T x={890} y={l.y - 4} size={38} anchor="start">{l.deal}</T>
                  <T x={890} y={l.y + 40} size={30} anchor="start" c={P.steel} w={600}>{l.sub}</T>
                </g>
                {join > 0 && <Flow pts={[[860, l.y], [1300, l.y], [1480, 560]]} f={f} c={l.c} n={5} r={9} speed={7} o={join} />}
              </g>
            );
          })}
          {join > 0 && (
            <g transform={`translate(1560,560) scale(${lerp(1.3, 2.0, hunger) * join})`}>
              <circle r={150} fill={P.yellow} opacity={0.15 + 0.1 * Math.sin(f / 4)} />
              <DataCentre f={f} busy={1} />
            </g>
          )}
        </World>
      </Cam>
      <Src f={f} at={w(502.2)}>company announcements, Sep–Oct 2024</Src>
      <Cap f={f} at={w(510.17)} until={w(514.1)}>The richest companies on Earth, bringing nuclear plants back</Cap>
      <Cap f={f} at={w(514.25)}>That tells you something about the size of the hunger</Cap>
    </Bg>
  );
};

/* ================================================================== 516.8 nuclear is slow; the AI race isn't waiting */
export const C2Slow: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const X = (yr: number) => 300 + yr * (1400 / 12);
  const yrs = 10.5 * ease(f, w(520.51), w(522.81) - w(520.51));
  const race = ease(f, w(524.27), 16);
  const aiX = lerp(X(0), X(12) + 20, race);
  return (
    <Bg c="#16122E">
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.0, 0, 0], [520.4, 760, 500, 1.1, -8, 4], [522.9, 1240, 500, 1.1, 8, 4], [524.1, 900, 640, 1.04, -6, 4], [527.3, 1000, 580, 1.0, 0, 0]]}>
        <World>
          <line x1={X(0)} y1={250} x2={X(12)} y2={250} stroke="rgba(255,255,255,0.5)" strokeWidth={4} />
          {Array.from({length: 7}, (_, i) => (
            <g key={i}>
              <line x1={X(i * 2)} y1={238} x2={X(i * 2)} y2={262} stroke="rgba(255,255,255,0.5)" strokeWidth={4} />
              <T x={X(i * 2)} y={222} size={30} w={600} c={P.steel}>{i === 6 ? '12 years' : `${i * 2}`}</T>
            </g>
          ))}
          {/* lane 1: a new reactor */}
          <rect x={X(0)} y={520} width={X(12) - X(0)} height={16} rx={8} fill="#2A2650" />
          <rect x={X(0)} y={520} width={X(yrs) - X(0)} height={16} rx={8} fill={P.orange} />
          <T x={X(0)} y={600} size={38} anchor="start">New nuclear reactor</T>
          <g transform={`translate(${X(yrs)},470) scale(0.7)`}>
            <Dome c="#E8EEF9" />
            <g stroke={P.yellow} strokeWidth={8} fill="none">
              <path d="M80 60 V-150 H-60 M80 -120 L50 -150" />
              <line x1={-40} y1={-150} x2={-40} y2={-90 + Math.sin(f / 6) * 10} />
            </g>
          </g>
          <T x={X(yrs) + 90} y={480} size={36} anchor="start" c={P.orange} o={ease(f, w(520.8), 8)}>
            {yrs >= 10 ? '10+ years' : `${Math.floor(yrs)} years`}
          </T>
          {/* lane 2: the AI race */}
          <rect x={X(0)} y={760} width={X(12) - X(0)} height={16} rx={8} fill="#2A2650" />
          <T x={X(0)} y={840} size={38} anchor="start">The AI race</T>
          {race > 0 &&
            Array.from({length: 6}, (_, i) => <line key={i} x1={aiX - 90 - i * 60} y1={740 + (i % 3) * 18} x2={aiX - 50 - i * 60} y2={740 + (i % 3) * 18} stroke={P.sky} strokeWidth={6} strokeLinecap="round" opacity={race * (1 - i / 6)} />)}
          <g transform={`translate(${aiX},768) scale(0.45)`}>
            <Chip f={f} on={1} c="#1D6B3A" />
          </g>
        </World>
      </Cam>
      <Lbl f={f} at={w(517.99)} title="Nuclear's big weakness" sub="illustration · build times vary" />
      <Pop f={f} at={w(519.31)} x={1500} y={130} size={84} color={P.orange} until={w(523.8)}>
        It's slow.
      </Pop>
      <Cap f={f} at={w(521.87)} until={w(524.1)}>New reactors take years, sometimes more than a decade</Cap>
      <Cap f={f} at={w(524.39)}>And the AI race is not waiting years</Cap>
    </Bg>
  );
};

/* ================================================================== 527.3 Colossus: an old factory in Memphis, ~4 months, not enough grid power */
const RACKS = Array.from({length: 72}, (_, i) => ({c: i % 12, r: Math.floor(i / 12)}));
export const C2Colossus: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const roof = ease(f, w(533.85), 18);
  const short = ease(f, w(542.55), 14);
  const H = 110;
  return (
    <Bg c="#8FD16B" c2="#5DBB4F" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 0.85, 0, 0], [532.4, 960, 560, 1.0, 0, 0], [534.0, 960, 520, 1.22, -6, 4], [538.2, 960, 560, 1.0, 0, 0], [542.5, 1120, 540, 1.05, 6, 0], [545.5, 1160, 540, 1.08, 6, 0]]}>
        <World>
          <g transform="translate(796,360)">
            <polygon points={pts([iso(-260, -260), iso(1000, -260), iso(1000, 600), iso(-260, 600)])} fill="#7A8194" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <polygon key={i} points={pts([iso(-200 + i * 40, 420), iso(-180 + i * 40, 420), iso(-180 + i * 40, 560), iso(-200 + i * 40, 560)])} fill="#E8EEF9" opacity={0.6} />
            ))}
            {/* the building; with the roof off you see the racks */}
            <IsoBox x={0} y={0} w={700} d={320} h={H} top={roof > 0.3 ? '#1B1F3A' : '#8C3B2A'} side="#B4553A" />
            {roof > 0.3 &&
              RACKS.map(({c, r}, i) => {
                const k = pop(f, w(534.1) + i * 0.5, 8);
                return k > 0 ? <IsoBox key={i} x={30 + c * 55} y={30 + r * 46} w={34} d={22} h={34 * k} z0={H} top={Math.floor(f / 4 + i) % 5 ? '#2B3150' : P.sky} side={P.ink} /> : null;
              })}
            {roof < 1 && (
              <g transform={`translate(0,${-260 * roof})`} opacity={1 - roof}>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const x0 = i * 116.6, x1 = x0 + 116.6;
                  return (
                    <g key={i}>
                      <polygon points={pts([iso(x0, 0, H), iso(x1, 0, H + 50), iso(x1, 320, H + 50), iso(x0, 320, H)])} fill="#9A4430" />
                      <polygon points={pts([iso(x1, 0, H), iso(x1, 320, H), iso(x1, 320, H + 50), iso(x1, 0, H + 50)])} fill="#9FD4FF" />
                      <polygon points={pts([iso(x0, 320, H), iso(x1, 320, H), iso(x1, 320, H + 50)])} fill="#8C3B2A" />
                    </g>
                  );
                })}
              </g>
            )}
            {/* the grid line: a trickle */}
            <Put x={iso(980, -120)[0]} y={iso(980, -120)[1] - 60} s={0.9}>
              <Pylon c={P.ink} />
            </Put>
            <line x1={iso(980, -120)[0] - 54} y1={iso(980, -120)[1] - 114} x2={iso(700, 60, H)[0]} y2={iso(700, 60, H)[1]} stroke={P.ink} strokeWidth={6} />
            {short > 0 && <Flow pts={[[iso(980, -120)[0] - 54, iso(980, -120)[1] - 114], iso(700, 60, H)]} f={f} c={P.yellow} n={2} r={6} speed={2} o={short} />}
          </g>
          <STag x={520} y={760} text="old factory" size={32} k={pop(f, w(532.45), 12) * (1 - ease(f, w(537.6), 8))} />
        </World>
      </Cam>
      <Lbl f={f} at={w(527.99)} title="Memphis, Tennessee" sub="2024" bg={P.ink} color={P.white} subC={P.ink} />
      <div style={{position: 'absolute', right: 80, top: 70, textAlign: 'right', opacity: ease(f, w(528.83), 10) * (1 - ease(f, w(537.8), 8))}}>
        <Tag bg={P.ink} color={P.white} size={44}>xAI</Tag>
        <Note style={{marginTop: 12}} size={28} color={P.ink}>Elon Musk's AI company</Note>
      </div>
      <Pop f={f} at={w(538.33)} x={960} y={190} size={110} color={P.yellow} until={w(542.4)}>
        <span style={{background: P.ink, borderRadius: 30, padding: '6px 40px'}}>“Colossus”</span>
      </Pop>
      <Cap f={f} at={w(535.4)} until={w(540.0)} dark>One of the largest AI supercomputers in the world</Cap>
      <div style={{position: 'absolute', right: 90, top: 300, textAlign: 'right', opacity: ease(f, w(540.6), 10)}}>
        <div style={{background: P.ink, borderRadius: 28, padding: '22px 34px', display: 'inline-block'}}>
          <Counter f={f} start={w(540.77)} dur={26} to={122} suffix=" days" size={96} color={P.yellow} />
          <Note style={{marginTop: 10}} size={28}>about four months, Musk said</Note>
        </div>
      </div>
      {short > 0 && (
        <div style={{position: 'absolute', left: 80, top: 330, width: 560, opacity: short, background: P.ink, borderRadius: 28, padding: '22px 30px'}}>
          <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 30, color: P.white}}>Power it needed</div>
          <div style={{height: 26, borderRadius: 13, background: P.red, marginTop: 8}} />
          <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 30, color: P.white, marginTop: 16}}>From the grid, at first</div>
          <div style={{height: 26, width: `${lerp(100, 30, ease(f, w(543.6), 16))}%`, borderRadius: 13, background: P.yellow, marginTop: 8}} />
          <Note style={{marginTop: 12}} size={26}>illustration</Note>
        </div>
      )}
      <Cap f={f} at={w(542.71)} dark>Not enough power from the grid to run it right away</Cap>
    </Bg>
  );
};

/* ================================================================== 545.5 they brought their own: gas turbines; SELC counted ~35 */
const UNITS = Array.from({length: 35}, (_, i) => ({c: i % 5, r: Math.floor(i / 5)}));
export const C2Turbines: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const cut = ease(f, w(547.0), 12);
  const toAir = ease(f, w(551.45), 12);
  const scan = ease(f, w(555.81), 10);
  const counted = Math.round(35 * ease(f, w(556.4), 36));
  return (
    <Bg c="#3A3550">
      {/* A: trucks bring the turbines, then one cut open */}
      {toAir < 1 && (
        <AbsoluteFill style={{opacity: 1 - toAir}}>
          <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.0, 8, 4], [546.9, 960, 560, 1.0, 4, 2], [548.0, 960, 560, 1.0, 0, 0], [551.5, 960, 540, 1.05, -6, 2]]}>
            <World>
              <rect x={-300} y={820} width={2600} height={400} fill="#4A4560" />
              <rect x={-300} y={830} width={2600} height={10} fill="#77708F" />
              {cut < 1 &&
                [0, 1, 2].map((i) => {
                  const k = ease(f, w(545.5) + i * 6, 30);
                  return (
                    <g key={i} transform={`translate(${lerp(-500 - i * 420, 380 + i * 520, k)},760)`} opacity={1 - cut}>
                      <TurbineSide f={f + i * 7} cab />
                    </g>
                  );
                })}
              {cut > 0 && (
                <g opacity={cut}>
                  <rect x={360} y={430} width={1100} height={260} rx={40} fill="#E8EEF9" />
                  <rect x={380} y={450} width={1060} height={220} rx={30} fill="#273055" />
                  <Flow pts={[[220, 560], [470, 560]]} f={f} c={P.sky} n={4} r={9} speed={6} />
                  {[0, 1, 2, 3, 4].map((i) => (
                    <rect key={i} x={500 + i * 40} y={480 + i * 8} width={14} height={160 - i * 16} rx={6} fill="#AEB8CC" opacity={0.6 + 0.4 * Math.sin(f + i)} />
                  ))}
                  <path d={`M790 560 q30 ${-50 - Math.sin(f / 2) * 14} 60 0 q-30 50 -60 0 Z`} fill={P.orange} />
                  <path d={`M805 560 q16 ${-28 - Math.sin(f / 2) * 8} 30 0 q-16 26 -30 0 Z`} fill={P.yellow} />
                  <Flow pts={[[820, 900], [820, 670]]} f={f} c={P.teal} n={4} r={9} speed={5} />
                  <g transform="translate(1010,560) scale(0.85)">
                    <Fan f={f} />
                  </g>
                  <rect x={1100} y={552} width={120} height={16} fill="#AEB8CC" />
                  <rect x={1220} y={490} width={190} height={140} rx={16} fill={P.blue} />
                  {[0, 1, 2, 3].map((i) => (
                    <rect key={i} x={1240 + i * 42} y={505} width={14} height={110} rx={7} fill="#D1793B" />
                  ))}
                  <Flow pts={[[1320, 490], [1320, 300], [1560, 300]]} f={f} c={P.yellow} n={5} r={10} speed={7} />
                  <rect x={1460} y={330} width={60} height={110} fill="#8E9AB3" />
                  {Array.from({length: 5}, (_, j) => {
                    const k = (f / 30 + j / 5) % 1;
                    return <circle key={j} cx={1490 + k * 60} cy={310 - k * 160} r={18 + k * 34} fill="#B8BFCC" opacity={(1 - k) * 0.8} />;
                  })}
                  <T x={300} y={520} size={32} anchor="end" o={cut}>Air in</T>
                  <T x={820} y={950} size={34} c={P.teal} o={ease(f, w(550.4), 8)}>Methane gas in</T>
                  <T x={820} y={420} size={32} o={ease(f, w(550.23), 8)}>Burns</T>
                  <T x={1010} y={730} size={32} o={cut}>Turbine spins</T>
                  <T x={1315} y={680} size={32} o={ease(f, w(549.31), 8)}>Generator</T>
                  <T x={1600} y={290} size={34} c={P.yellow} anchor="start" o={ease(f, w(549.31), 8)}>Electricity</T>
                  <T x={1560} y={150} size={32} c={P.steel} anchor="start" o={ease(f, w(550.5), 8)}>Exhaust</T>
                </g>
              )}
            </World>
          </Cam>
          <Pop f={f} at={w(545.81)} x={960} y={170} size={72} until={w(546.9)}>
            So they brought their own
          </Pop>
          <Lbl f={f} at={w(547.05)} title="Gas turbines" sub="portable power generators" />
        </AbsoluteFill>
      )}
      {/* B: from above, parked next to the building, counted from aerial images */}
      {toAir > 0 && (
        <AbsoluteFill style={{opacity: toAir, background: '#6E7487'}}>
          <Cam f={f} t0={t0} keys={[[551.4, 960, 560, 1.25, 0, 18], [553.4, 1000, 560, 1.0, 0, 8], [559.9, 1040, 560, 0.96, 0, 0]]}>
            <World>
              <rect x={-200} y={-200} width={2400} height={1500} fill="#7A8194" />
              <rect x={260} y={260} width={760} height={560} rx={10} fill="#D5DBE6" />
              {Array.from({length: 24}, (_, i) => (
                <circle key={i} cx={330 + (i % 6) * 125} cy={330 + Math.floor(i / 6) * 130} r={26} fill="#9FB0D3" />
              ))}
              <T x={640} y={560} size={40} c={P.ink}>the xAI building</T>
              {UNITS.map(({c, r}, i) => {
                const k = ease(f, w(551.63) + i * 0.8, 10);
                if (k <= 0) return null;
                const x = 1110 + c * 130, y = 290 + r * 75;
                const n = i + 1;
                return (
                  <g key={i} transform={`translate(${lerp(x + 600, x, k)},${y})`}>
                    <circle cx={86} cy={0} r={22 + 8 * Math.sin(f / 5 + i)} fill="#C9CED8" opacity={0.6} />
                    <rect x={-50} y={-22} width={100} height={44} rx={6} fill="#F4F6FB" />
                    <circle cx={34} r={9} fill="#5B6B8C" />
                    {n <= counted && (
                      <g>
                        <circle cx={-18} r={19} fill={P.yellow} />
                        <text x={-18} y={8} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={22} fill={P.ink}>{n}</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </World>
          </Cam>
          {scan > 0 && (
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: scan}}>
              {([[100, 100, 1, 1], [1820, 100, -1, 1], [100, 980, 1, -1], [1820, 980, -1, -1]] as [number, number, number, number][]).map(([x, y, sx, sy], i) => (
                <path key={i} d={`M${x} ${y + sy * 70} V${y} H${x + sx * 70}`} stroke={P.white} strokeWidth={8} fill="none" />
              ))}
              <rect x={100} y={180 + ((f * 9) % 760)} width={1720} height={4} fill={P.white} opacity={0.4} />
            </svg>
          )}
          <Lbl f={f} at={w(554.15)} title="Southern Environmental Law Center" sub="looked at aerial images" bg={P.ink} color={P.white} size={40} />
          <Cap f={f} at={w(557.29)} dark source="Southern Environmental Law Center (Apr 2025)">
            They counted around 35 gas turbines
          </Cap>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== 559.9 "Now, look at where this happened." */
export const C2Street: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  return (
    <Bg c="#F6B26B" c2="#F7D9A6" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 760, 640, 1.15, 10, -4], [564.4, 1240, 600, 1.0, -6, -2]]}>
        <World w={2400}>
          {/* industry behind */}
          {[300, 560, 1500, 1720, 2050].map((x, i) => (
            <g key={x}>
              <rect x={x} y={300 + (i % 2) * 60} width={34} height={320} fill="#8E8A9E" />
              {Array.from({length: 3}, (_, j) => {
                const k = (f / 40 + j / 3 + i * 0.2) % 1;
                return <circle key={j} cx={x + 17 + k * 50} cy={290 + (i % 2) * 60 - k * 120} r={14 + k * 30} fill="#D9D3E0" opacity={(1 - k) * 0.7} />;
              })}
            </g>
          ))}
          <rect x={800} y={420} width={620} height={220} fill="#A9A6B8" />
          <rect x={800} y={420} width={620} height={24} fill="#8E8A9E" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${1460 + i * 130},606) scale(0.45)`}>
              <TurbineSide f={f + i * 9} />
            </g>
          ))}
          <rect x={-200} y={640} width={2800} height={500} fill="#7CC36A" />
          <rect x={-200} y={880} width={2800} height={80} fill="#6E7487" />
          {/* homes and a church in front */}
          {[120, 400, 680, 1600, 1880, 2160].map((x, i) => (
            <Put key={x} x={x} y={800} s={1.8} f={f} at={i * 2}>
              <House c={[P.red, P.teal, P.purple, P.orange][i % 4]} />
            </Put>
          ))}
          <Put x={1140} y={790} s={1.3}>
            <Church />
          </Put>
        </World>
      </Cam>
      <Lbl f={f} at={w(560.51)} title="South Memphis" sub="homes and a church · industry behind" bg={P.ink} color={P.white} subC={P.ink} />
    </Bg>
  );
};

/* ================================================================== 571.07 Boxtown: refineries, a steel mill, trucks; high asthma rates */
export const C2Pollution: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const O: V = [900, 300];
  const at2 = (x: number, y: number, z = 0): V => {
    const p = iso(x, y, z);
    return [p[0] + O[0], p[1] + O[1]];
  };
  const homes = Array.from({length: 20}, (_, i) => ({x: 200 + (i % 5) * 110, y: 260 + Math.floor(i / 5) * 110})).sort((a, b) => a.x + a.y - (b.x + b.y));
  return (
    <Bg c="#8FD16B" c2="#5DBB4F" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 590, 0.86, -8, 0], [577.6, 960, 590, 0.8, 8, 0]]}>
        <World>
          {/* highway */}
          <polyline points={pts([at2(-600, 820), at2(1500, 820)])} stroke="#5C5F6E" strokeWidth={70} />
          {Array.from({length: 5}, (_, i) => {
            const k = ((f * 0.004 + i / 5) % 1);
            const [x, y] = at2(lerp(-600, 1500, k), 820);
            return (
              <g key={i} transform={`translate(${x},${y - 20}) scale(0.4)`} opacity={ease(f, w(572.71), 10)}>
                <TurbineSide f={0} smoke={0} cab />
              </g>
            );
          })}
          {/* refinery, steel mill */}
          <Put x={at2(-150, 400)[0]} y={at2(-150, 400)[1]} s={1.3} f={f} at={w(571.29)}>
            <Refinery f={f} />
          </Put>
          <Put x={at2(500, -120)[0]} y={at2(500, -120)[1]} s={1.2} f={f} at={w(571.97)}>
            <g>
              <Factory f={f} c="#8E8A9E" />
              <rect x={-90} y={20} width={150} height={20} fill={P.orange} opacity={0.6 + 0.4 * Math.sin(f / 3)} />
            </g>
          </Put>
          {/* the neighbourhood */}
          {homes.map((h, i) => {
            const [x, y] = at2(h.x, h.y);
            return (
              <Put key={i} x={x} y={y} s={0.55}>
                <House c={[P.red, P.orange, P.teal, P.purple, P.yellow][i % 5]} />
              </Put>
            );
          })}
          {/* the turbines site */}
          <Put x={at2(900, 250)[0]} y={at2(900, 250)[1]} s={0.55}>
            <g>
              <rect x={-150} y={-60} width={300} height={120} rx={8} fill="#D5DBE6" />
              {[0, 1, 2, 3].map((i) => (
                <g key={i} transform={`translate(${-120 + i * 80},90) scale(0.28)`}>
                  <TurbineSide f={f + i * 5} />
                </g>
              ))}
            </g>
          </Put>
          <STag x={at2(-150, 400)[0]} y={at2(-150, 400)[1] + 80} text="Refineries" size={32} k={pop(f, w(571.29), 12)} />
          <STag x={at2(500, -120)[0]} y={at2(500, -120)[1] + 110} text="A steel mill" size={32} k={pop(f, w(571.97), 12)} />
          <STag x={at2(300, 820)[0]} y={at2(300, 820)[1] - 70} text="Heavy truck traffic" size={32} k={pop(f, w(572.71), 12)} />
          <STag x={at2(900, 250)[0]} y={at2(900, 250)[1] + 90} text="xAI turbines" size={30} bg={P.ink} color={P.white} k={pop(f, w(571.6), 12)} />
        </World>
      </Cam>
      <Lbl f={f} at={0} title="Boxtown, South Memphis" sub="a historically Black community" bg={P.ink} color={P.white} subC={P.ink} right />
      <Cap f={f} at={w(574.31)} dark>The county already struggled with high asthma rates</Cap>
    </Bg>
  );
};

/* ================================================================== 577.6 nitrogen oxides: harder breathing, children and the elderly */
export const C2NOx: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const tight = ease(f, w(581.55), 24);
  const haze = ease(f, w(580.4), 30);
  return (
    <Bg c="#3A2A5E">
      <Cam f={f} t0={t0} keys={[[t0, 700, 600, 1.12, -10, 4], [581.0, 960, 560, 1.0, 0, 2], [585.5, 1100, 580, 1.08, 8, 2]]}>
        <World>
          <rect x={-300} y={820} width={2600} height={400} fill="#2A4A3A" />
          <Put x={300} y={760} s={1.2}>
            <TurbineSide f={f} />
          </Put>
          <ellipse cx={1400} cy={640} rx={600} ry={200} fill="#C9A88A" opacity={0.25 * haze} />
          {Array.from({length: 22}, (_, i) => {
            const k = ((f * 0.006 + i / 22) % 1);
            const x = 400 + k * 1400;
            const y = 600 - 140 * Math.sin(k * Math.PI * 0.8) + 160 * k + Math.sin(f / 7 + i) * 18;
            return (
              <g key={i} transform={`translate(${x},${y})`} opacity={Math.min(1, k * 6) * (1 - Math.max(0, k - 0.85) * 6)}>
                <Mol two={i % 2 === 1} s={0.9} rot={(f * 2 + i * 40) % 360} />
              </g>
            );
          })}
          {[1250, 1560].map((x, i) => (
            <Put key={x} x={x} y={760} s={1.5}>
              <House c={[P.teal, P.orange][i]} />
            </Put>
          ))}
          <Put x={1100} y={790} s={0.6}>
            <Person c={P.yellow} skin="#8D5A3B" />
          </Put>
          <g transform="translate(1780,770) scale(0.95)">
            <Person c={P.purple} skin="#6B4128" />
            <circle cy={-84} r={22} fill="#D9DEE8" opacity={0.9} />
            <line x1={52} y1={-10} x2={66} y2={80} stroke="#8B5A2B" strokeWidth={8} strokeLinecap="round" />
          </g>
          <STag x={1100} y={680} text="Children" size={32} bg={P.yellow} k={pop(f, w(583.35), 12)} />
          <STag x={1760} y={620} text="Older people" size={32} bg={P.purple} color={P.white} k={pop(f, w(584.13), 12)} />
        </World>
      </Cam>
      <Lbl f={f} at={w(577.67)} title="What gas turbines release" sub="nitrogen oxides (NOx)" />
      <div style={{position: 'absolute', left: 80, top: 240, opacity: ease(f, w(578.65), 10), background: 'rgba(16,19,34,0.7)', borderRadius: 26, padding: '20px 28px', display: 'flex', gap: 30, alignItems: 'center'}}>
        {[false, true].map((two) => (
          <div key={String(two)} style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <svg width={90} height={80} viewBox="-40 -30 90 80">
              <Mol two={two} />
            </svg>
            <span style={{fontFamily: AF.head, fontWeight: 800, fontSize: 40, color: P.white}}>{two ? 'NO₂' : 'NO'}</span>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 80, top: 70, width: 420, textAlign: 'center', opacity: ease(f, w(580.81), 12)}}>
        <svg width={420} height={330} viewBox="-210 -175 420 330">
          <Lungs f={f} tight={tight} />
        </svg>
        <Tag bg={P.pink} color={P.ink} size={38}>Breathing gets harder</Tag>
      </div>
    </Bg>
  );
};

/* ================================================================== 585.5 packed public meetings; a permit for fewer turbines */
export const C2Meetings: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const toPermit = ease(f, w(589.5), 12);
  const stamp = pop(f, w(591.13), 12);
  const fewer = ease(f, w(592.61), 16);
  return (
    <Bg c={P.plum}>
      {toPermit < 1 && (
        <AbsoluteFill style={{opacity: 1 - toPermit}}>
          <Cam f={f} t0={t0} keys={[[t0, 1100, 560, 1.15, 8, 4], [589.5, 900, 560, 1.0, -6, 4]]}>
            <World>
              <rect x={-200} y={180} width={2400} height={620} fill="#3A2A7A" />
              <rect x={-200} y={800} width={2400} height={400} fill="#4E3A2A" />
              <rect x={1500} y={560} width={300} height={40} fill="#6B4A2E" />
              <rect x={1600} y={470} width={100} height={130} fill="#8B5A2B" />
              <rect x={1645} y={420} width={8} height={60} fill={P.ink} />
              <rect x={1450} y={240} width={400} height={90} rx={14} fill={P.white} />
              <T x={1650} y={300} size={36} c={P.ink}>Public meeting</T>
              {/* a TV with the news */}
              <rect x={150} y={250} width={300} height={190} rx={14} fill={P.ink} />
              <rect x={166} y={266} width={268} height={130} rx={6} fill={P.blue} />
              <T x={300} y={345} size={44}>NEWS</T>
              <rect x={166} y={400} width={268} height={26} fill={P.red} />
              {Array.from({length: 40}, (_, i) => {
                const k = pop(f, w(585.53) + i * 0.6, 8);
                const c = i % 10, r = Math.floor(i / 10);
                return k > 0 ? (
                  <g key={i} transform={`translate(${560 + c * 92 + (r % 2) * 40},${620 + r * 60}) scale(${0.62 * k})`}>
                    <Person c={[P.red, P.teal, P.yellow, P.orange, P.sky][(i * 3) % 5]} skin={['#8D5A3B', '#6B4128', '#C98E64', '#E9B48A'][i % 4]} f={f + i} wave={i % 7 === 0 ? 1 : 0} />
                  </g>
                ) : null;
              })}
              {pop(f, w(587.33), 12) > 0 && (
                <g transform={`translate(760,430) scale(${pop(f, w(587.33), 12)})`}>
                  <rect x={-280} y={-50} width={560} height={90} rx={30} fill={P.white} />
                  <path d="M-30 38 L-10 80 L20 38 Z" fill={P.white} />
                  <T x={0} y={12} size={32} c={P.ink}>“We found out from the news”</T>
                </g>
              )}
            </World>
          </Cam>
          <Lbl f={f} at={w(585.6)} title="Residents packed public meetings" />
        </AbsoluteFill>
      )}
      {toPermit > 0 && (
        <AbsoluteFill style={{opacity: toPermit}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <g transform="translate(440,540) scale(2.3) rotate(-4)">
              <Doc title="Air permit" />
              {stamp > 0 && (
                <g transform={`rotate(-14) translate(0,42) scale(${stamp})`}>
                  <rect x={-66} y={-20} width={132} height={40} rx={6} fill="none" stroke={P.green} strokeWidth={5} />
                  <text y={9} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={20} fill={P.green}>APPROVED</text>
                </g>
              )}
            </g>
            {Array.from({length: 35}, (_, i) => {
              const c = i % 7, r = Math.floor(i / 7);
              const gone = i >= 15 ? fewer : 0;
              return (
                <g key={i} transform={`translate(${900 + c * 125},${300 + r * 100}) scale(${0.36 * (1 - 0.3 * gone)})`} opacity={1 - 0.8 * gone}>
                  <TurbineSide f={f + i * 3} smoke={1 - gone} />
                </g>
              );
            })}
            <T x={1275} y={830} size={44} o={fewer}>35 counted → 15 permitted</T>
          </svg>
          <Lbl f={f} at={w(589.91)} title="Shelby County Health Department" sub="local health officials" size={40} />
          <Cap f={f} at={w(591.69)} source="Shelby County Health Dept permit, 2 July 2025">
            A permit for a smaller number of turbines: 15
          </Cap>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== 594.6 the company's case vs the neighbours' worries: both can be true */
export const C2Claims: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const claims: [string, number][] = [['Adding pollution controls', 596.13], ['Investing in the local grid', 597.47], ['Jobs and money for Memphis', 600.33]];
  const worries = ['Gas turbines by homes', 'Nitrogen oxides', 'High asthma rates'];
  const added = claims.reduce((s, [, a]) => s + ease(f, w(a), 14), 0);
  const level = ease(f, w(602.79), 20);
  const th = lerp(-12 + 4 * added, Math.sin(f / 9) * 1.5, level);
  const r = (th * Math.PI) / 180;
  const L: V = [960 - 560 * Math.cos(r), 380 - 560 * Math.sin(r)];
  const R: V = [960 + 560 * Math.cos(r), 380 + 560 * Math.sin(r)];
  const pan = (p: V, items: string[], ks: number[], c: string, head: string, hk: number) => {
    const py = p[1] + 170;
    return (
      <g>
        <line x1={p[0]} y1={p[1]} x2={p[0] - 200} y2={py} stroke={P.steel} strokeWidth={4} />
        <line x1={p[0]} y1={p[1]} x2={p[0] + 200} y2={py} stroke={P.steel} strokeWidth={4} />
        <path d={`M${p[0] - 240} ${py} H${p[0] + 240} Q${p[0]} ${py + 60} ${p[0] - 240} ${py} Z`} fill={P.steel} />
        {items.map((t, i) =>
          ks[i] > 0 ? (
            <g key={t} transform={`translate(${p[0]},${py - 40 - i * 76}) scale(${ks[i]})`}>
              <rect x={-230} y={-32} width={460} height={64} rx={32} fill={c} />
              <T x={0} y={11} size={30} c={P.ink}>{t}</T>
            </g>
          ) : null,
        )}
        <T x={p[0]} y={py - 40 - 3 * 76 + 10} size={32} c={P.white} o={hk}>{head}</T>
      </g>
    );
  };
  return (
    <Bg c={P.navy}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d="M960 380 L880 900 H1040 Z" fill="#5B6B8C" />
        <rect x={840} y={890} width={240} height={24} rx={8} fill="#5B6B8C" />
        <g transform={`rotate(${th} 960 380)`}>
          <rect x={390} y={372} width={1140} height={16} rx={8} fill={P.white} />
        </g>
        <circle cx={960} cy={380} r={20} fill={P.yellow} />
        {pan(L, worries, [1, 1, 1], '#FF9F8A', 'Neighbours’ worries', 1)}
        {pan(R, claims.map(([t]) => t), claims.map(([, a]) => pop(f, w(a), 12)), P.grass, 'What xAI says', ease(f, w(594.75), 10))}
      </svg>
      <Pop f={f} at={w(604.09)} x={960} y={150} size={70} color={P.yellow}>
        Both can be true
      </Pop>
      <Cap f={f} at={w(605.65)}>That's what makes this story hard</Cap>
    </Bg>
  );
};

/* ================================================================== 608.3 zoom out; Google: net zero by 2030, emissions +48% vs 2019 */
export const C2Google: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const toChart = ease(f, w(610.1), 12);
  const X = (y: number) => 300 + (y - 2019) * 120;
  const Y = (v: number) => 800 - v * 2.6;
  const promise = ease(f, w(611.43), w(612.61) - w(611.43));
  const actual = ease(f, w(616.57), w(617.55) - w(616.57));
  return (
    <Bg c="#1B1446">
      {toChart < 1 && (
        <AbsoluteFill style={{opacity: 1 - toChart}}>
          <Cam f={f} t0={t0} keys={[[t0, 900, 470, 5, 0, 0], [609.9, 960, 540, 1.0, 0, 0]]}>
            <World>
              <Put x={960} y={540} s={3.2}>
                <Globe f={f} />
              </Put>
              <circle cx={900} cy={470} r={10} fill={P.red} />
              <circle cx={900} cy={470} r={26} fill="none" stroke={P.red} strokeWidth={4} />
            </World>
          </Cam>
          <Pop f={f} at={w(608.6)} x={960} y={940} size={64}>
            The big picture
          </Pop>
        </AbsoluteFill>
      )}
      {toChart > 0 && (
        <AbsoluteFill style={{opacity: toChart}}>
          <Cam f={f} t0={t0} keys={[[610.0, 800, 560, 1.12, -10, 6], [617.0, 960, 540, 1.0, 0, 2], [626.8, 1000, 540, 1.04, 6, 0]]}>
            <World>
              <line x1={X(2019)} y1={Y(0)} x2={X(2030)} y2={Y(0)} stroke="rgba(255,255,255,0.55)" strokeWidth={4} />
              <line x1={X(2019)} y1={Y(100)} x2={X(2030)} y2={Y(100)} stroke="rgba(255,255,255,0.3)" strokeWidth={3} strokeDasharray="10 10" />
              <T x={X(2030) + 20} y={Y(100) + 10} size={28} anchor="start" w={600} c={P.steel}>2019 level</T>
              <T x={X(2030) + 20} y={Y(0) + 10} size={28} anchor="start" w={600} c={P.steel}>zero</T>
              {[2019, 2023, 2030].map((y) => (
                <T key={y} x={X(y)} y={Y(0) + 50} size={34} w={700}>{y}</T>
              ))}
              <path d={line([[X(2019), Y(100)], [X(2019) + (X(2030) - X(2019)) * promise, Y(100 - 100 * promise)]])} stroke={P.grass} strokeWidth={10} strokeDasharray="22 14" fill="none" />
              <T x={X(2027)} y={Y(25) - 30} size={32} c={P.grass} o={ease(f, w(612.61), 8)}>promise: net zero by 2030</T>
              <path d={line([[X(2019), Y(100)], [X(2019) + (X(2023) - X(2019)) * actual, Y(100 + 48 * actual)]])} stroke={P.red} strokeWidth={14} strokeLinecap="round" fill="none" />
              <circle cx={X(2019)} cy={Y(100)} r={14} fill={P.white} />
              {actual > 0.98 && <circle cx={X(2023)} cy={Y(148)} r={16} fill={P.red} />}
              <T x={X(2023) + 40} y={Y(148) + 10} size={64} c={P.red} anchor="start" o={ease(f, w(617.4), 8)}>+{Math.round(48 * ease(f, w(617.55), 18))}%</T>
              <T x={X(2023) + 40} y={Y(148) + 52} size={30} anchor="start" w={600} c={P.white} o={ease(f, w(618.8), 8)}>greenhouse gas, vs 2019</T>
              {pop(f, w(614.23), 12) > 0 && (
                <g transform={`translate(${X(2028)},300) scale(${pop(f, w(614.23), 12)})`}>
                  <Doc title="Google 2024" />
                  <T x={0} y={130} size={28} w={600}>its own environmental report</T>
                </g>
              )}
            </World>
          </Cam>
          <Lbl f={f} at={w(610.27)} title="Google" sub="emissions, 2019 = 100 · promise line is illustrative" />
          <Cap f={f} at={w(621.67)} source="Google Environmental Report 2024">
            Google said a major reason: data centres and the energy for AI
          </Cap>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== 626.8 Microsoft: carbon negative by 2030, emissions +29% vs 2020; their own numbers */
export const C2Microsoft: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const X = (y: number) => 300 + (y - 2020) * 132;
  const Y = (v: number) => 760 - v * 2.6;
  const promise = ease(f, w(628.35), w(629.5) - w(628.35));
  const actual = ease(f, w(630.73), w(631.65) - w(630.73));
  const sum = ease(f, w(634.87), 14);
  return (
    <Bg c="#1B1446">
      {sum < 1 && (
        <AbsoluteFill style={{opacity: 1 - sum}}>
          <Cam f={f} t0={t0} keys={[[t0, 900, 560, 1.1, 8, 6], [632.0, 960, 540, 1.0, 0, 2], [634.9, 980, 540, 1.04, -4, 0]]}>
            <World>
              <line x1={X(2020)} y1={Y(0)} x2={X(2030)} y2={Y(0)} stroke="rgba(255,255,255,0.55)" strokeWidth={4} />
              <line x1={X(2020)} y1={Y(100)} x2={X(2030)} y2={Y(100)} stroke="rgba(255,255,255,0.3)" strokeWidth={3} strokeDasharray="10 10" />
              <T x={X(2030) + 20} y={Y(100) + 10} size={28} anchor="start" w={600} c={P.steel}>2020 level</T>
              <T x={X(2030) + 20} y={Y(0) + 10} size={28} anchor="start" w={600} c={P.steel}>zero</T>
              {[2020, 2023, 2030].map((y) => (
                <T key={y} x={X(y)} y={Y(-25) + 60} size={34} w={700}>{y}</T>
              ))}
              <rect x={X(2020)} y={Y(0)} width={X(2030) - X(2020)} height={Y(-25) - Y(0)} fill={P.grass} opacity={0.12 * promise} />
              <path d={line([[X(2020), Y(100)], [X(2020) + (X(2030) - X(2020)) * promise, Y(100 - 125 * promise)]])} stroke={P.grass} strokeWidth={10} strokeDasharray="22 14" fill="none" />
              <T x={X(2026)} y={Y(-10) + 6} size={32} c={P.grass} o={ease(f, w(628.95), 8)}>promise: carbon negative by 2030</T>
              <path d={line([[X(2020), Y(100)], [X(2020) + (X(2023) - X(2020)) * actual, Y(100 + 29 * actual)]])} stroke={P.red} strokeWidth={14} strokeLinecap="round" fill="none" />
              <circle cx={X(2020)} cy={Y(100)} r={14} fill={P.white} />
              {actual > 0.98 && <circle cx={X(2023)} cy={Y(129)} r={16} fill={P.red} />}
              <T x={X(2023) + 40} y={Y(129) + 10} size={64} c={P.red} anchor="start" o={ease(f, w(631.6), 8)}>+{Math.round(29 * ease(f, w(631.65), 18))}%</T>
              <T x={X(2023) + 40} y={Y(129) + 52} size={30} anchor="start" w={600} o={ease(f, w(632.8), 8)}>vs its 2020 starting point</T>
            </World>
          </Cam>
          <Lbl f={f} at={w(626.89)} title="Microsoft" sub="emissions, 2020 = 100 · promise line is illustrative" />
        </AbsoluteFill>
      )}
      {sum > 0 && (
        <AbsoluteFill style={{opacity: sum, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 70, paddingTop: 60}}>
          {[
            ['Google', '+48%', 'vs 2019', 'Environmental Report 2024', 635.0],
            ['Microsoft', '+29%', 'vs 2020', 'Sustainability Report 2024', 635.4],
          ].map(([n, v, base, rep, a]) => (
            <div key={n as string} style={{width: 640, background: P.white, borderRadius: 36, padding: '36px 40px', boxSizing: 'border-box', transform: `scale(${Math.max(0.001, pop(f, w(a as number), 12))})`, display: 'flex', gap: 30, alignItems: 'center'}}>
              <svg width={150} height={200} viewBox="-75 -100 150 200">
                <Doc c="#EEF2F8" title={(n as string).slice(0, 9)} />
              </svg>
              <div>
                <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 44, color: P.ink}}>{n as string}</div>
                <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 110, lineHeight: 1, color: P.red}}>{v as string}</div>
                <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 32, color: P.ink}}>{base as string}</div>
                <Note style={{marginTop: 8, whiteSpace: 'normal'}} size={26} color="#5B6B8C">{rep as string}</Note>
              </div>
            </div>
          ))}
        </AbsoluteFill>
      )}
      <Pop f={f} at={w(636.65)} x={960} y={190} size={66} color={P.yellow}>
        From the companies themselves
      </Pop>
      <Cap f={f} at={w(630.6)} until={w(634.7)} source="Microsoft 2024 Sustainability Report (+29.1%)">
        Emissions went up about 29%
      </Cap>
    </Bg>
  );
};

/* ================================================================== 639.2 electricity is half the problem: every watt becomes heat, heat needs water */
export const C2Heat: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const heat = ease(f, w(643.25), 14);
  const water = ease(f, w(646.99), 14);
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 420, 560, 1.2, -8, 4], [642.6, 900, 560, 1.08, 0, 2], [645.3, 1560, 540, 1.0, 6, 2], [650.2, 1820, 520, 1.1, 0, 0]]}>
        <World w={2600}>
          <rect x={-300} y={820} width={3200} height={400} fill="#1B1446" />
          <Put x={260} y={680} s={1.6}>
            <Pylon c="#9AA6BD" />
          </Put>
          <Flow pts={[[300, 560], [700, 560]]} f={f} c={P.yellow} n={5} r={11} speed={8} o={ease(f, w(639.41), 10)} />
          <Put x={860} y={560} s={1.3}>
            <Chip f={f} on={1} c="#1D6B3A" />
          </Put>
          {Array.from({length: 6}, (_, i) => (
            <path key={i} d={`M1020 ${400 + i * 60} q30 -24 60 0 t60 0 t60 0 t60 0`} stroke={P.red} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="40 26" strokeDashoffset={-f * 5} opacity={heat} />
          ))}
          <Put x={1640} y={620} s={2.1}>
            <CoolingTower f={f / 2} steam={1} />
          </Put>
          <rect x={1950} y={780} width={600} height={60} rx={20} fill={P.water} opacity={water} />
          {water > 0 && <Pipe pts={[[2000, 790], [1800, 790], [1740, 760]]} f={f} flow={water} />}
          {water > 0 &&
            Array.from({length: 6}, (_, i) => {
              const k = ((f / 26 + i / 6) % 1);
              return (
                <g key={i} transform={`translate(${2050 + i * 70},${560 + k * 200}) scale(0.32)`} opacity={water * (1 - k)}>
                  <path d="M0 -80 C0 -80 -55 -5 -55 25 A55 55 0 0 0 55 25 C55 -5 0 -80 0 -80 Z" fill={P.water} />
                </g>
              );
            })}
          <STag x={300} y={330} text="Electricity" size={40} bg={P.yellow} k={pop(f, w(639.41), 12)} />
          <STag x={1140} y={330} text="Heat" size={40} bg={P.red} color={P.white} k={pop(f, w(644.05), 12)} />
          <STag x={2230} y={500} text="Water" size={44} bg={P.water} color={P.white} k={pop(f, w(647.13), 12)} />
        </World>
      </Cam>
      <Lbl f={f} at={w(640.39)} until={w(644.6)} title="Electricity: only half the problem" />
      <Lbl f={f} at={w(642.61)} until={w(648.3)} title="Almost every watt becomes heat" bg={P.red} color={P.white} right />
      <Cap f={f} at={w(645.21)} until={w(648.3)}>To fight heat at this scale, you need water</Cap>
      <Cap f={f} at={w(648.47)} dark>Which brings us back to a small town in Oregon…</Cap>
    </Bg>
  );
};

export const SCENES_2: Record<string, React.FC<AnimProps>> = {
  c2twh: C2Twh,
  c2share: C2Share,
  c2growth: C2Growth,
  c2us: C2US,
  c2ireland: C2Ireland,
  c2dublin: C2Dublin,
  c2problem: C2Problem,
  c2gap: C2Gap,
  c2tmi: C2TMI,
  c2units: C2Units,
  c2crane: C2Crane,
  c2bigtech: C2BigTech,
  c2slow: C2Slow,
  c2colossus: C2Colossus,
  c2turbines: C2Turbines,
  c2street: C2Street,
  c2pollution: C2Pollution,
  c2nox: C2NOx,
  c2meetings: C2Meetings,
  c2claims: C2Claims,
  c2google: C2Google,
  c2microsoft: C2Microsoft,
  c2heat: C2Heat,
};
