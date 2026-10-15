// Chapter 5, "The rocks" (20:52–23:52 on the film): sand to silicon to wafers, TSMC and Taiwan's water, the 2021
// drought and the water trucks, gallium and germanium, copper and batteries, cobalt from the DR Congo, honest scale,
// and e-waste. The `board map` scenes between these (Taiwan, Taiwan–China, China, DR Congo, the world) stay as they are.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';
import {Arrow, Battery, Bg, Cam, Caption, Chip, Clock, Counter, DataCentre, Flow, Globe, House, Phone, Pickaxe, Pop, Put, Pylon, Rack, Rock, World} from './lib';

/* ================================================================== local helpers */
const C30 = Math.cos(Math.PI / 6);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const pts = (a: [number, number][]) => a.map((p) => p.join(',')).join(' ');
const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`;
};
type Pt = [number, number];
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 24): Pt[] =>
  Array.from({length: n + 1}, (_, i) => {
    const t = i / n, u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
  });
const COPPER = '#D1793B';
const COBALT = '#3D6BFF';

/** A pill label drawn inside an SVG world, so it moves with the camera. */
const STag: React.FC<{x: number; y: number; text: string; size?: number; bg?: string; color?: string; k?: number; anchor?: 'middle' | 'start' | 'end'}> = ({x, y, text, size = 32, bg = P.white, color = P.ink, k = 1, anchor = 'middle'}) => {
  if (k <= 0) return null;
  const wd = text.length * size * 0.58 + size * 1.2;
  const h = size * 1.6;
  const x0 = anchor === 'middle' ? -wd / 2 : anchor === 'start' ? 0 : -wd;
  return (
    <g transform={`translate(${x},${y}) scale(${k})`} opacity={Math.min(1, k)}>
      <rect x={x0} y={-h / 2} width={wd} height={h} rx={h / 2} fill={bg} />
      <text x={x0 + wd / 2} y={size * 0.36} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};
/** A periodic-table tile, in SVG (moves with the camera). */
const ElemS: React.FC<{x: number; y: number; k: number; n: number; sym: string; name: string; c: string; s?: number}> = ({x, y, k, n, sym, name, c, s = 1}) =>
  k > 0 ? (
    <g transform={`translate(${x},${y}) scale(${k * s})`} opacity={Math.min(1, k)}>
      <rect x={-100} y={-115} width={200} height={230} rx={20} fill={c} />
      <text x={-80} y={-72} fontFamily="Poppins" fontWeight={700} fontSize={32} fill={P.white}>
        {n}
      </text>
      <text y={34} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={100} fill={P.white}>
        {sym}
      </text>
      <text y={92} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={P.white}>
        {name}
      </text>
    </g>
  ) : null;
/** A periodic-table tile in screen space. */
const Elem: React.FC<{k: number; n: number; sym: string; name: string; c: string; size?: number; style?: React.CSSProperties}> = ({k, n, sym, name, c, size = 260, style}) =>
  k > 0 ? (
    <div style={{position: 'absolute', width: size, height: size * 1.15, background: c, borderRadius: size * 0.09, transform: `scale(${k})`, opacity: Math.min(1, k), boxShadow: '0 16px 40px rgba(0,0,0,0.3)', color: P.white, fontFamily: AF.head, ...style}}>
      <div style={{position: 'absolute', left: size * 0.09, top: size * 0.06, fontSize: Math.max(30, size * 0.13), fontWeight: 700}}>{n}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: size * 0.24, textAlign: 'center', fontSize: size * 0.46, fontWeight: 800, lineHeight: 1}}>{sym}</div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: size * 0.1, textAlign: 'center', fontSize: Math.max(30, size * 0.12), fontWeight: 700}}>{name}</div>
    </div>
  ) : null;
/** A place or title card with a readable sub line. */
const Lbl: React.FC<{f: number; at: number; title: string; sub?: string; x?: number; y?: number; bg?: string; color?: string; right?: boolean; size?: number}> = ({f, at: a, title, sub, x = 80, y = 70, bg = P.white, color = P.ink, right, size = 44}) => {
  const k = ease(f, a, 10);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', [right ? 'right' : 'left']: x, top: y, opacity: k, transform: `translateX(${(1 - k) * (right ? 20 : -20)}px)`, textAlign: right ? 'right' : 'left'}}>
      <Tag bg={bg} color={color} size={size}>
        {title}
      </Tag>
      {sub && <div style={{marginTop: 12, marginLeft: right ? 0 : 8, marginRight: right ? 8 : 0, fontFamily: AF.head, fontWeight: 600, fontSize: 30, color: P.white, textShadow: '0 2px 10px rgba(0,0,0,0.35)'}}>{sub}</div>}
    </div>
  );
};
/** A source line. */
const Src: React.FC<{children: React.ReactNode; style?: React.CSSProperties; color?: string}> = ({children, style, color}) => (
  <Note size={28} color={color} style={style}>
    {children}
  </Note>
);
/** Bottom captions in sequence: each one leaves just before the next arrives. */
const Caps: React.FC<{f: number; w: (a: number) => number; items: [number, React.ReactNode][]; dark?: boolean}> = ({f, w, items, dark}) => (
  <>
    {items.map(([a, c], i) => (
      <Caption key={i} f={f} at={w(a)} dark={dark} until={i < items.length - 1 ? w(items[i + 1][0]) - 6 : undefined}>
        {c}
      </Caption>
    ))}
  </>
);
/** A water tanker truck, side view, facing right. */
const TankTruck: React.FC<{c?: string}> = ({c = '#F4F7FC'}) => (
  <g>
    <rect x={-125} y={8} width={235} height={12} rx={4} fill="#3D4253" />
    <rect x={-120} y={-58} width={170} height={66} rx={33} fill={c} />
    <rect x={-112} y={-32} width={154} height={10} rx={5} fill={P.water} />
    <path d="M-35 -50 C-35 -50 -48 -34 -48 -27 A13 13 0 0 0 -22 -27 C-22 -34 -35 -50 -35 -50 Z" fill={P.water} transform="translate(0,6)" />
    <path d="M58 -44 H92 L114 -12 V20 H58 Z" fill={P.water} />
    <path d="M66 -36 H88 L102 -14 H66 Z" fill="#CFEAFF" />
    {[-92, -48, 88].map((x) => (
      <g key={x}>
        <circle cx={x} cy={24} r={17} fill={P.ink} />
        <circle cx={x} cy={24} r={7} fill="#9AA6BD" />
      </g>
    ))}
  </g>
);
/** An oil barrel. */
const Barrel: React.FC = () => (
  <g>
    <rect x={-62} y={-88} width={124} height={176} rx={14} fill="#2B3150" />
    {[-50, 0, 50].map((y) => (
      <rect key={y} x={-66} y={y - 6} width={132} height={12} rx={6} fill="#4A5277" />
    ))}
    <ellipse cy={-88} rx={62} ry={14} fill="#565E85" />
    <path d="M0 -36 C0 -36 -22 -6 -22 8 A22 22 0 0 0 22 8 C22 -6 0 -36 0 -36 Z" fill={P.yellow} />
  </g>
);
/** A clean-room worker in a full white suit with a visor. */
const Suit: React.FC<{f: number; i?: number}> = ({f, i = 0}) => {
  const a = Math.sin(f / 9 + i) * 18;
  return (
    <g>
      <rect x={-24} y={20} width={18} height={62} rx={9} fill="#E3E9F4" />
      <rect x={6} y={20} width={18} height={62} rx={9} fill="#E3E9F4" />
      <rect x={-34} y={-44} width={68} height={78} rx={26} fill="#F7F9FC" />
      <rect x={-50} y={-36} width={18} height={58} rx={9} fill="#EEF2F8" transform={`rotate(${-20 - a} -40 -30)`} />
      <rect x={32} y={-36} width={18} height={58} rx={9} fill="#EEF2F8" transform={`rotate(${30 + a} 40 -30)`} />
      <circle cy={-72} r={30} fill="#F7F9FC" />
      <rect x={-20} y={-84} width={40} height={20} rx={10} fill="#2B3150" />
      <rect x={-14} y={-80} width={12} height={5} rx={2.5} fill="#8FB4FF" />
    </g>
  );
};
/** A small electric car. */
const Car: React.FC<{c?: string}> = ({c = P.teal}) => (
  <g>
    <path d="M-100 10 L-80 -22 Q-60 -48 -20 -48 L30 -48 Q60 -48 80 -22 L104 -16 Q118 -12 118 4 V22 H-100 Z" fill={c} />
    <path d="M-62 -22 L-48 -40 H-6 V-22 Z M6 -22 V-40 H30 Q50 -40 64 -22 Z" fill="#CFEAFF" />
    {[-56, 70].map((x) => (
      <g key={x}>
        <circle cx={x} cy={24} r={20} fill={P.ink} />
        <circle cx={x} cy={24} r={8} fill="#9AA6BD" />
      </g>
    ))}
    <path d="M6 -4 L-10 14 H2 L-4 30 L14 10 H2 Z" fill={P.yellow} transform="translate(-30,-26) scale(1.2)" />
  </g>
);
/** One Eiffel Tower, base centred at 0,0, about 22 × 54. */
const Eiffel: React.FC<{c?: string}> = ({c = '#C9A86A'}) => (
  <g fill={c}>
    <path d="M-11 0 L-3.2 -30 L-1.4 -48 L0 -54 L1.4 -48 L3.2 -30 L11 0 L6.5 0 Q0 -11 -6.5 0 Z" />
    <rect x={-6.5} y={-19} width={13} height={2.4} />
    <rect x={-3.8} y={-33} width={7.6} height={2} />
  </g>
);
/** Iso cube for the cobalt share grid. */
const Cube: React.FC<{x: number; y: number; s?: number; c: string; k?: number}> = ({x, y, s = 26, c, k = 1}) => {
  if (k <= 0) return null;
  const h = s * 0.55;
  return (
    <g transform={`translate(${x},${y}) scale(${k})`}>
      <polygon points={pts([[0, -h], [s, 0], [0, h], [-s, 0]])} fill={mix(c, '#FFFFFF', 0.35)} />
      <polygon points={pts([[-s, 0], [0, h], [0, h + s * 0.9], [-s, s * 0.9]])} fill={c} />
      <polygon points={pts([[s, 0], [0, h], [0, h + s * 0.9], [s, s * 0.9]])} fill={mix(c, '#000000', 0.3)} />
    </g>
  );
};

/* ---------------------------------------------------------------- 20:52 "Every AI chip begins as sand... grown into a gleaming crystal cylinder." */
export const C5Sand: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const chipK = pop(f, w(1252.0), 10) * (1 - ease(f, w(1253.1), 10));
  const pile = ease(f, w(1253.1), 30);
  const mag = pop(f, w(1253.98), 12);
  const si = pop(f, w(1254.96), 12);
  const pour = ease(f, w(1255.5), 8) * (1 - ease(f, w(1257.2), 10));
  const melt = ease(f, w(1255.88), 16);
  const pure = ease(f, w(1256.1), w(1258.0) - w(1256.1));
  const perfect = pop(f, w(1258.06), 12);
  const grow = ease(f, w(1259.1), w(1261.3) - w(1259.1));
  const gleam = cl((f - w(1259.68)) / 22);
  const ingotTag = pop(f, w(1260.3), 12);
  const rodY = lerp(610, 240, grow);
  const pileTop = (x: number) => 800 - 300 * pile * Math.max(0, 1 - ((x - 420) / 360) ** 2);
  const crucible = (cx: number) => `M${cx - 140} 560 L${cx - 140} 720 Q${cx - 140} 770 ${cx - 90} 770 L${cx + 90} 770 Q${cx + 140} 770 ${cx + 140} 720 L${cx + 140} 560`;
  const meltPath = (cx: number, top: number) => `M${cx - 128} ${top} L${cx - 128} 720 Q${cx - 128} 758 ${cx - 88} 758 L${cx + 88} 758 Q${cx + 128} 758 ${cx + 128} 720 L${cx + 128} ${top} Z`;
  return (
    <Bg c="#F6C25A" c2="#E07B2C" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 420, 500, 1.25], [1253.3, 420, 520, 1.0], [1255.4, 520, 520, 1.0], [1256.4, 1320, 520, 1.0, -8, 3], [1258.7, 1320, 520, 1.0, -8, 3], [1259.5, 2220, 500, 1.0, 8, 3], [1261.3, 2220, 470, 1.12, 3, 2]]}>
        <World w={2700} h={1080}>
          <rect x={-800} y={800} width={4300} height={600} fill="#8E4417" />
          {/* 1 · sand */}
          <path d={`M60 800 Q420 ${800 - 600 * pile} 780 800 Z`} fill="#F7D58B" />
          {Array.from({length: 46}, (_, i) => {
            const x = 90 + random(`gx${i}`) * 660;
            const top = pileTop(x);
            if (top > 785) return null;
            return <circle key={i} cx={x} cy={lerp(top + 10, 792, random(`gy${i}`))} r={5 + random(`gr${i}`) * 4} fill={i % 3 ? '#E2A84E' : '#FFF0C2'} />;
          })}
          {f > w(1253.1) &&
            f < w(1255.6) &&
            Array.from({length: 26}, (_, i) => {
              const x = 420 + (random(`fx${i}`) - 0.5) * 120;
              const y = 430 + (((f - w(1253.1)) * 10 + random(`fy${i}`) * 380) % 380);
              return y < pileTop(x) ? <circle key={i} cx={x} cy={y} r={6} fill="#FFF0C2" /> : null;
            })}
          {chipK > 0 && (
            <Put x={420} y={430} s={1.3 * chipK}>
              <Chip c="#1D6B3A" f={f} on={1} />
            </Put>
          )}
          {/* a grain, close up */}
          {mag > 0 && (
            <g transform={`translate(840,390) scale(${mag})`}>
              <line x1={106} y1={106} x2={190} y2={190} stroke="#5B3A1E" strokeWidth={24} strokeLinecap="round" />
              <circle r={150} fill="#FFF3D1" stroke={P.white} strokeWidth={14} />
              {[[-50, -40, 44], [40, -50, 38], [-10, 30, 46], [70, 40, 34], [-75, 50, 30], [10, -100, 26]].map(([x, y, r], i) => (
                <g key={i}>
                  <path d={`M${x - r} ${y} Q${x - r} ${y - r} ${x} ${y - r * 0.9} Q${x + r} ${y - r} ${x + r * 0.9} ${y + r * 0.1} Q${x + r} ${y + r} ${x} ${y + r * 0.85} Q${x - r} ${y + r} ${x - r} ${y} Z`} fill={i % 2 ? '#F2C879' : '#EDB866'} stroke="#D89A3C" strokeWidth={4} />
                  <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.18} fill="#FFF8E0" />
                </g>
              ))}
              <text y={-176} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={36} fill={P.ink}>
                silica · SiO₂
              </text>
            </g>
          )}
          <ElemS x={110} y={320} k={si} n={14} sym="Si" name="Silicon" c={P.blue} />
          {/* 2 · melt and purify */}
          <polygon points="1230,130 1410,130 1350,230 1290,230" fill="#7C8AA8" />
          {pour > 0 &&
            Array.from({length: 16}, (_, i) => {
              const y = 230 + ((f * 9 + i * 26) % 400);
              return y < 640 ? <circle key={i} cx={1320 + Math.sin(i * 2.1) * 8} cy={y} r={6} fill="#FFF0C2" opacity={pour} /> : null;
            })}
          <rect x={1110} y={520} width={420} height={280} rx={22} fill="#2B3150" />
          {[560, 610, 660, 710].map((y, i) => (
            <rect key={y} x={1130} y={y} width={18} height={30} rx={6} fill={P.red} opacity={melt * (0.55 + 0.45 * Math.sin(f / 3 + i))} />
          ))}
          {[560, 610, 660, 710].map((y, i) => (
            <rect key={y} x={1492} y={y} width={18} height={30} rx={6} fill={P.red} opacity={melt * (0.55 + 0.45 * Math.sin(f / 3 + i + 1))} />
          ))}
          <path d={meltPath(1320, 640)} fill={mix('#F7D58B', '#FF9A2E', melt)} style={{filter: melt > 0.5 ? `drop-shadow(0 0 ${30 * melt}px #FF9A2E)` : undefined}} />
          <path d={crucible(1320)} stroke="#C8D0E0" strokeWidth={14} fill="none" strokeLinecap="round" />
          {melt > 0.3 &&
            Array.from({length: 22}, (_, i) => {
              const th = random(`im${i}`) * 0.85;
              const px = 1210 + random(`ix${i}`) * 220, py = 660 + random(`iy${i}`) * 85;
              const d = cl((pure - th) * 4);
              const x = lerp(px + Math.sin(f / 6 + i) * 4, 1650 + (i % 5) * 12 - 24, d);
              const y = lerp(py, 520 - (i % 3) * 8, d) - Math.sin(d * Math.PI) * 140;
              return <circle key={i} cx={x} cy={y} r={7} fill="#3A2A1E" opacity={1 - d * 0.3} />;
            })}
          <g opacity={ease(f, w(1256.1), 10)}>
            <rect x={1580} y={526} width={140} height={34} rx={8} fill="#3A3D55" />
            <text x={1650} y={610} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={P.ink}>
              impurities out
            </text>
          </g>
          <STag x={1320} y={890} k={perfect} size={36} text="Almost perfectly pure silicon" />
          {/* 3 · grow the crystal */}
          <rect x={2010} y={110} width={24} height={690} fill="#5B6B8C" />
          <rect x={2406} y={110} width={24} height={690} fill="#5B6B8C" />
          <rect x={2010} y={100} width={420} height={30} rx={8} fill="#7C8AA8" />
          <rect x={2050} y={600} width={340} height={200} rx={20} fill="#2B3150" />
          <path d={meltPath(2220, 640)} fill="#FFC75A" style={{filter: 'drop-shadow(0 0 26px #FF9A2E)'}} />
          <path d={crucible(2220)} stroke="#C8D0E0" strokeWidth={14} fill="none" strokeLinecap="round" />
          <line x1={2220} y1={130} x2={2220} y2={rodY} stroke="#AEB8CC" strokeWidth={10} />
          <rect x={2204} y={rodY - 6} width={32} height={18} rx={4} fill="#7C8AA8" />
          {640 - rodY > 70 && (
            <g>
              <polygon points={pts([[2212, rodY + 12], [2228, rodY + 12], [2292, rodY + 70], [2148, rodY + 70]])} fill="#C8D0E0" />
              <rect x={2148} y={rodY + 70} width={144} height={640 - rodY - 70} fill="#B7C2D6" />
              {[0, 1, 2, 3].map((j) => {
                const x = 2148 + ((j * 36 + f * 3) % 144);
                return <rect key={j} x={x} y={rodY + 70} width={Math.min(12, 2292 - x)} height={640 - rodY - 70} fill={P.white} opacity={0.35} />;
              })}
              {gleam > 0 && gleam < 1 && <rect x={lerp(2130, 2300, gleam)} y={rodY + 60} width={26} height={640 - rodY - 60} fill={P.white} opacity={Math.sin(gleam * Math.PI) * 0.9} transform={`skewX(-12)`} style={{transformOrigin: `${lerp(2130, 2300, gleam)}px ${rodY}px`}} />}
            </g>
          )}
          <path d="M2150 170 A70 18 0 1 0 2290 170" stroke={P.white} strokeWidth={6} fill="none" strokeDasharray="14 10" strokeDashoffset={-f * 2} opacity={ease(f, w(1259.1), 10)} />
          <STag x={2220} y={890} k={ingotTag} size={36} text="A single crystal of silicon" />
        </World>
      </Cam>
      <Caps
        f={f}
        w={w}
        items={[
          [1252.0, 'Every AI chip begins as sand'],
          [1253.9, 'Ordinary sand, rich in silicon'],
          [1255.88, 'Melted, then purified until it is almost perfect'],
          [1259.1, 'Then grown into one gleaming crystal cylinder'],
        ]}
      />
    </Bg>
  );
};

/* ---------------------------------------------------------------- 21:01 sliced into wafers, the clean room, billions of switches, thinner than a hair */
export const C5Wafer: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const slice = ease(f, w(1262.2), w(1263.5) - w(1262.2));
  const n = Math.floor(slice * 10);
  const right = 960 - n * 36;
  const carve = ease(f, w(1267.0), w(1268.7) - w(1267.0));
  const mag = pop(f, w(1267.3), 14);
  const hair = ease(f, w(1269.15), 10);
  const thin = pop(f, w(1269.56), 12);
  const beamX = 1840 + ((carve * 3) % 1) * 320;
  return (
    <Bg c="#5B3FA8" c2="#2A1B5E" angle={170}>
      <Cam f={f} t0={t0} keys={[[t0, 620, 540, 1.1, -14, 4], [1263.9, 760, 540, 0.95, -6, 2], [1264.7, 2020, 510, 0.82, 0, 0], [1266.3, 2020, 510, 0.82, 0, 0], [1267.6, 2100, 540, 1.9, 0, 0], [1269.2, 2100, 540, 2.0, 0, 0]]}>
        <World w={3000} h={1080}>
          {/* the ingot on its side, sliced by a wire saw */}
          <rect x={180} y={660} width={1300} height={30} rx={10} fill="#3B2A7A" />
          <rect x={200} y={460} width={Math.max(0, right - 200)} height={160} fill="#B7C2D6" />
          {[0, 1, 2].map((j) => (
            <rect key={j} x={200} y={480 + j * 40} width={Math.max(0, right - 200)} height={10} fill={P.white} opacity={0.25} />
          ))}
          <ellipse cx={200} cy={540} rx={28} ry={80} fill="#8E9AB3" />
          <ellipse cx={right} cy={540} rx={28} ry={80} fill="#DCE3F2" stroke="#9B8CFF" strokeWidth={4} />
          {slice > 0 && slice < 1 && (
            <g>
              <circle cx={right - 18} cy={380} r={26} fill="#7C8AA8" />
              <circle cx={right - 18} cy={700} r={26} fill="#7C8AA8" />
              <line x1={right - 18 + Math.sin(f) * 2} y1={380} x2={right - 18 + Math.sin(f) * 2} y2={700} stroke={P.yellow} strokeWidth={4} style={{filter: `drop-shadow(0 0 8px ${P.yellow})`}} />
            </g>
          )}
          {Array.from({length: n}, (_, i) => (
            <ellipse key={i} cx={1010 + i * 40} cy={560} rx={12} ry={80} fill="#DCE3F2" stroke="#9B8CFF" strokeWidth={3} />
          ))}
          <rect x={980} y={636} width={440} height={30} rx={8} fill="#5B6B8C" />
          <STag x={1200} y={390} k={pop(f, w(1263.14), 12)} size={38} text="Thin wafers" />
          {/* the clean room */}
          <rect x={1420} y={120} width={1200} height={780} rx={30} fill="#FFE07A" />
          <rect x={1420} y={120} width={1200} height={56} rx={20} fill="#F4F6FB" />
          {Array.from({length: 10}, (_, i) => (
            <line key={i} x1={1480 + i * 120} y1={190} x2={1480 + i * 120} y2={820} stroke={P.white} strokeWidth={5} strokeDasharray="30 40" strokeDashoffset={-f * 6} opacity={0.6} />
          ))}
          <rect x={1420} y={820} width={1200} height={80} fill="#E0B84F" />
          {/* lithography tool: light carves the pattern into the wafer */}
          <rect x={1900} y={200} width={200} height={90} rx={14} fill="#3A3D55" />
          {carve > 0 && carve < 1 && <polygon points={pts([[1960, 290], [2040, 290], [beamX + 40, 540], [beamX - 40, 540]])} fill="#B49CFF" opacity={0.6} />}
          <rect x={1860} y={730} width={280} height={90} rx={10} fill="#5B6B8C" />
          <rect x={1990} y={710} width={20} height={30} fill="#5B6B8C" />
          <circle cx={2000} cy={540} r={172} fill="#C8D0E0" stroke="#9B8CFF" strokeWidth={6} />
          {Array.from({length: 14 * 14}, (_, i) => {
            const cx = 2000 + ((i % 14) - 6.5) * 24, cy = 540 + (Math.floor(i / 14) - 6.5) * 24;
            if (Math.hypot(cx - 2000, cy - 540) > 150) return null;
            const lit = carve > (cx - 1830) / 340;
            return <rect key={i} x={cx - 10} y={cy - 10} width={20} height={20} rx={2} fill={lit ? ((i * 7) % 3 ? '#7B5CFF' : P.teal) : '#AEB8CC'} />;
          })}
          {/* robot arm */}
          {(() => {
            const a1 = -60 + Math.sin(f / 14) * 10, a2 = 70 + Math.sin(f / 10) * 14;
            const e: Pt = [1620 + Math.cos((a1 * Math.PI) / 180) * 160, 820 + Math.sin((a1 * Math.PI) / 180) * 160];
            const h: Pt = [e[0] + Math.cos(((a1 + a2) * Math.PI) / 180) * 130, e[1] + Math.sin(((a1 + a2) * Math.PI) / 180) * 130];
            return (
              <g stroke="#AEB8CC" strokeLinecap="round" fill="none">
                <polyline points={pts([[1620, 820], e, h])} strokeWidth={26} />
                <circle cx={e[0]} cy={e[1]} r={18} fill="#7C8AA8" stroke="none" />
                <rect x={h[0] - 30} y={h[1] - 8} width={60} height={16} rx={8} fill="#7C8AA8" stroke="none" />
              </g>
            );
          })()}
          <g transform="translate(1520,740) scale(1.3)">
            <Suit f={f} />
          </g>
          <g transform="translate(2460,740) scale(1.3)">
            <Suit f={f} i={2} />
          </g>
        </World>
      </Cam>
      {/* one die, magnified: rows of switches */}
      {mag > 0 && hair < 1 && (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 1 - hair}}>
          <line x1={810} y1={540} x2={1230} y2={470} stroke={P.white} strokeWidth={4} opacity={Math.min(1, mag)} />
          <g transform={`translate(1460,470) scale(${mag})`}>
            <clipPath id="c5die">
              <circle r={250} />
            </clipPath>
            <circle r={258} fill={P.white} />
            <g clipPath="url(#c5die)">
              <rect x={-260} y={-260} width={520} height={520} fill="#1B1446" />
              {Array.from({length: 12}, (_, i) => (
                <rect key={i} x={-250} y={-240 + i * 42} width={500} height={14} fill={P.teal} opacity={0.9} />
              ))}
              {Array.from({length: 16}, (_, j) => {
                const x = -240 + j * 32;
                return (x + 260) / 520 < ease(f, w(1267.82), 26) ? <rect key={j} x={x} y={-250} width={10} height={500} fill={P.yellow} /> : null;
              })}
            </g>
            <text y={300} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={34} fill={P.white}>
              one tiny part of one chip
            </text>
          </g>
        </svg>
      )}
      {/* a human hair next to one switch */}
      {hair > 0 && (
        <AbsoluteFill style={{background: P.night, opacity: hair}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <circle cx={620} cy={480} r={300} fill="#6B4128" />
            {Array.from({length: 7}, (_, i) => (
              <circle key={i} cx={620} cy={480} r={60 + i * 34} fill="none" stroke="#8D5A3B" strokeWidth={6} opacity={0.6} />
            ))}
            <text x={620} y={850} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.white}>
              A human hair, end on
            </text>
            <circle cx={1420} cy={480} r={3} fill={P.yellow} />
            <circle cx={1420} cy={480} r={30 + Math.sin(f / 4) * 6} fill="none" stroke={P.yellow} strokeWidth={4} />
            <text x={1420} y={580} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.yellow}>
              One switch
            </text>
          </svg>
          <Pop f={f} at={w(1269.56)} x={1420} y={300} size={56} color={P.white}>
            thousands of times thinner
          </Pop>
          <Src style={{position: 'absolute', left: 1120, width: 600, top: 650, textAlign: 'center', opacity: Math.min(1, thin)}}>illustration · not to scale</Src>
        </AbsoluteFill>
      )}
      <Caps
        f={f}
        w={w}
        items={[
          [1261.4, 'The cylinder is sliced into thin wafers'],
          [1264.3, 'One of the cleanest rooms on Earth'],
          [1266.4, 'Billions of tiny switches carved into each wafer'],
          [1269.18, 'Each switch: thousands of times thinner than a hair'],
        ]}
      />
    </Bg>
  );
};

/* ---------------------------------------------------------------- 21:13 "almost all of the world's most advanced chips are made by one company, on one island" */
const ISLAND: Pt[] = Array.from({length: 28}, (_, i) => {
  const a = (i / 28) * Math.PI * 2;
  const r = 1 + 0.08 * Math.sin(a * 3 + 1) + 0.05 * Math.sin(a * 7);
  return [960 + Math.cos(a) * 200 * r * (Math.sin(a) > 0 ? 1.1 : 0.9), 560 + Math.sin(a) * 400 * r];
});
export const C5Island: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  return (
    <Bg c={P.water} c2="#0B4FA0" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 980, 600, 2.3, 0, 10], [1273.4, 980, 600, 2.3, 0, 10], [1275.9, 960, 560, 0.85, 0, 24]]}>
        <World>
          {Array.from({length: 26}, (_, i) => {
            const x = random(`wx${i}`) * 2400 - 240 + ((f * 1.5) % 120), y = random(`wy${i}`) * 1300 - 110;
            return <path key={i} d={`M${x} ${y} q20 -12 40 0 t40 0`} stroke="#BFE8FF" strokeWidth={5} fill="none" opacity={0.6} />;
          })}
          {/* chips leave for the whole world */}
          {Array.from({length: 14}, (_, i) => {
            const a = (i / 14) * Math.PI * 2 + 0.2;
            const d = ((f * 7 + i * 137) % 1000) + 60;
            return (
              <g key={i} transform={`translate(${980 + Math.cos(a) * d},${600 + Math.sin(a) * d}) scale(0.16)`} opacity={1 - d / 1060}>
                <Chip c="#1D6B3A" />
              </g>
            );
          })}
          <polygon points={pts(ISLAND.map(([x, y]) => [x + 10, y + 24]))} fill="#0A3E7A" />
          <polygon points={pts(ISLAND)} fill={P.grass} stroke="#F2D58B" strokeWidth={14} strokeLinejoin="round" />
          <polygon points={pts([[930, 230], [990, 380], [1050, 560], [1020, 760], [960, 820], [940, 600], [900, 400]])} fill={P.green} />
          {/* the fab: a long white block with roof units */}
          <g transform="translate(980,600)">
            <rect x={-70} y={-34} width={140} height={68} rx={6} fill="#E8EEF9" />
            <rect x={-70} y={-34} width={140} height={14} rx={6} fill="#B8C3D9" />
            {[-46, -16, 14, 44].map((x) => (
              <rect key={x} x={x - 9} y={-12} width={18} height={30} rx={3} fill={P.yellow} opacity={0.6 + 0.4 * Math.sin(f / 5 + x)} />
            ))}
          </g>
        </World>
      </Cam>
      <Pop f={f} at={w(1273.06)} x={960} y={150} size={58}>
        <span style={{background: P.ink, borderRadius: 26, padding: '10px 30px'}}>Almost all of the most advanced chips</span>
      </Pop>
      <Pop f={f} at={w(1275.74)} x={420} y={560} size={52} color={P.ink}>
        <span style={{background: P.white, borderRadius: 26, padding: '10px 30px'}}>One company</span>
      </Pop>
      <Pop f={f} at={w(1276.48)} x={1500} y={560} size={52} color={P.ink}>
        <span style={{background: P.yellow, borderRadius: 26, padding: '10px 30px'}}>One island</span>
      </Pop>
    </Bg>
  );
};

/* ---------------------------------------------------------------- 21:22 TSMC makes the vast majority of the most advanced chips, including most AI chips */
export const C5Tsmc: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const ai = pop(f, w(1285.18), 12);
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.0, 14, 4], [1287.9, 960, 540, 1.0, 2, 0]]}>
        <World>
          <text x={425} y={262} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={P.white} opacity={ease(f, w(1282.2), 10)}>
            Of every 100 of the most advanced chips
          </text>
          {Array.from({length: 100}, (_, i) => {
            const x = 140 + (i % 10) * 58, y = 290 + Math.floor(i / 10) * 58;
            const on = i < 90 && f >= w(1282.48) + i * 0.35;
            const k = ease(f, w(1282.1) + i * 0.15, 6);
            return (
              <g key={i} opacity={k}>
                <rect x={x} y={y} width={46} height={46} rx={7} fill={on ? P.yellow : '#4A3B8A'} />
                <rect x={x + 13} y={y + 13} width={20} height={20} rx={3} fill={on ? '#C98F00' : '#5E4FA0'} />
              </g>
            );
          })}
          <Arrow a={[740, 640]} b={[1010, 760]} f={f} at={w(1285.2)} c={P.yellow} wpx={8} />
          {ai > 0 && (
            <g>
              <Put x={1140} y={800} s={0.95 * ai}>
                <Chip c="#1D6B3A" f={f} on={1} />
              </Put>
              <STag x={1300} y={800} k={ai} size={36} anchor="start" text="AI chips: most of these too" bg={P.yellow} />
            </g>
          )}
        </World>
      </Cam>
      <Lbl f={f} at={0} title="TSMC" sub="Taiwan Semiconductor Manufacturing Company" bg={P.yellow} size={52} />
      <div style={{position: 'absolute', left: 820, top: 300}}>
        <Counter f={f} start={w(1282.48)} dur={30} to={90} prefix="~" suffix="%" size={170} color={P.yellow} />
        <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 44, color: P.white, marginTop: 8, opacity: ease(f, w(1282.6), 10)}}>of the world's most advanced chips</div>
        <Src style={{marginTop: 14, opacity: ease(f, w(1283.0), 10)}}>Source · TrendForce, industry estimates</Src>
      </div>
    </Bg>
  );
};

/* ---------------------------------------------------------------- 21:28 "making chips takes an enormous amount of water. Ultra-pure water to rinse every wafer, again and again." */
export const C5Water: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const loopK = ease(f, w(1294.6), 12);
  const steps = ['Pattern', 'Rinse', 'Etch', 'Rinse', 'Coat', 'Rinse'];
  const hot = Math.floor(Math.max(0, f - w(1294.6)) / 6) % steps.length;
  return (
    <Bg c="#0B3A5C" c2="#06213A" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 1450, 560, 0.6], [1290.4, 1450, 560, 0.6], [1292.5, 880, 580, 1.0, -10, 4], [1293.3, 880, 580, 1.0, -10, 4], [1294.1, 2000, 560, 1.15, 6, 4], [1294.7, 2000, 560, 1.15, 6, 4], [1296.1, 2240, 540, 0.95, 0, 2]]}>
        <World w={3200} h={1080}>
          <rect x={-800} y={880} width={4800} height={400} fill="#123A2A" />
          {/* river and reservoir */}
          <rect x={-600} y={640} width={1120} height={260} fill={P.water} />
          {Array.from({length: 8}, (_, i) => (
            <path key={i} d={`M${-500 + ((i * 130 + f * 3) % 1000)} ${680 + (i % 3) * 60} q20 -12 40 0 t40 0`} stroke="#BFE8FF" strokeWidth={6} fill="none" />
          ))}
          <text x={160} y={590} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={50} fill={P.white}>
            River & reservoirs
          </text>
          {/* the ultra-pure water plant */}
          <path d="M420 700 H660" stroke="#5B6B8C" strokeWidth={22} />
          <path d="M420 700 H660" stroke={P.water} strokeWidth={10} strokeDasharray="18 16" strokeDashoffset={-f * 4} />
          {[['Filter', '#5FA39A'], ['Purify', '#4FC3E8'], ['Ultra-pure', '#A8F4FF']].map(([name, c], i) => (
            <g key={name}>
              <rect x={660 + i * 170} y={460} width={120} height={270} rx={22} fill="#1B2350" stroke="#AEB8CC" strokeWidth={6} />
              <rect x={668 + i * 170} y={520 + Math.sin(f / 8 + i) * 6} width={104} height={202 - Math.sin(f / 8 + i) * 6} rx={14} fill={c} />
              <text x={720 + i * 170} y={784} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={P.white}>
                {name}
              </text>
              {i < 2 && <path d={`M${780 + i * 170} 680 H${830 + i * 170}`} stroke="#AEB8CC" strokeWidth={14} />}
            </g>
          ))}
          <text x={890} y={420} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={40} fill={P.sky}>
            Ultra-pure water plant
          </text>
          {/* the chip plant */}
          <rect x={1340} y={220} width={1560} height={660} rx={24} fill="#E8EEF9" opacity={0.12} stroke="#E8EEF9" strokeWidth={6} />
          <text x={1390} y={292} fontFamily="Poppins" fontWeight={800} fontSize={50} fill={P.white}>
            Chip plant
          </text>
          <path d="M1120 680 H1260 V320 H2000 V370" stroke="#AEB8CC" strokeWidth={20} fill="none" strokeLinejoin="round" />
          <path d="M1120 680 H1260 V320 H2000 V370" stroke="#A8F4FF" strokeWidth={8} fill="none" strokeLinejoin="round" strokeDasharray="18 16" strokeDashoffset={-f * 5} />
          <rect x={1960} y={364} width={80} height={30} rx={8} fill="#AEB8CC" />
          {Array.from({length: 18}, (_, i) => {
            const y = 400 + ((f * 9 + i * 23) % 140);
            return <circle key={i} cx={1950 + (i % 6) * 20} cy={y} r={6} fill="#A8F4FF" />;
          })}
          {/* the wafer spinning on its chuck */}
          <rect x={1985} y={580} width={30} height={90} fill="#7C8AA8" />
          <g transform="translate(2000,560) scale(1,0.22)">
            <circle r={170} fill="#C8D0E0" />
            <g transform={`rotate(${(f * 18) % 360})`}>
              {Array.from({length: 8}, (_, i) => (
                <rect key={i} x={-4} y={-165} width={8} height={165} fill="#9B8CFF" transform={`rotate(${i * 45})`} />
              ))}
            </g>
          </g>
          {Array.from({length: 10}, (_, i) => {
            const k = ((f / 14 + i / 10) % 1);
            const side = i % 2 ? 1 : -1;
            return <circle key={i} cx={2000 + side * (170 + k * 90)} cy={560 + k * 60 - Math.sin(k * Math.PI) * 30} r={6} fill="#A8F4FF" opacity={1 - k} />;
          })}
          <text x={2000} y={740} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={34} fill={P.white}>
            Rinse every wafer
          </text>
          {/* used water out */}
          <path d="M2000 670 V820 H3100" stroke="#5B6B8C" strokeWidth={18} fill="none" />
          <path d="M2000 670 V820 H3100" stroke="#6E8C9C" strokeWidth={8} fill="none" strokeDasharray="18 16" strokeDashoffset={-f * 5} />
          <text x={2700} y={790} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={P.white}>
            used water out
          </text>
          {/* the steps repeat: rinse after rinse */}
          <g transform="translate(2560,500)" opacity={loopK}>
            <circle r={150} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={10} />
            <circle r={150} fill="none" stroke={P.sky} strokeWidth={10} strokeDasharray="60 880" strokeDashoffset={-f * 10} strokeLinecap="round" />
            {steps.map((s, i) => {
              const a = (i / steps.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <text key={i} x={Math.cos(a) * 205} y={Math.sin(a) * 190 + 10} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={i === hot ? P.yellow : s === 'Rinse' ? P.sky : P.white}>
                  {s}
                </text>
              );
            })}
            <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={32} fill={P.white}>
              again
            </text>
            <text y={46} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={32} fill={P.white}>
              and again
            </text>
          </g>
        </World>
      </Cam>
      <Pop f={f} at={w(1288.42)} x={960} y={150} size={58} until={w(1290.0)}>
        <span style={{background: P.ink, borderRadius: 26, padding: '10px 30px'}}>Something most people don't know</span>
      </Pop>
      <Caps
        f={f}
        w={w}
        items={[
          [1290.06, 'Making chips takes an enormous amount of water'],
          [1292.65, 'Ultra-pure water rinses every wafer, again and again'],
        ]}
      />
    </Bg>
  );
};

/* ---------------------------------------------------------------- 21:36 Taiwan 2021: reservoirs dry up, fields go unwatered, water goes to the fabs, TSMC trucks it in */
const iso = (x: number, y: number, z = 0): Pt => [960 + (x - y) * C30, 120 + (x + y) * 0.5 - z];
type IBox = {x: number; y: number; w: number; d: number; h: number; top: string; side: string};
const IsoBox: React.FC<{b: IBox}> = ({b}) => {
  const {x, y, w: bw, d, h} = b;
  const top = [iso(x, y, h), iso(x + bw, y, h), iso(x + bw, y + d, h), iso(x, y + d, h)];
  const right = [iso(x + bw, y, 0), iso(x + bw, y + d, 0), iso(x + bw, y + d, h), iso(x + bw, y, h)];
  const left = [iso(x, y + d, 0), iso(x + bw, y + d, 0), iso(x + bw, y + d, h), iso(x, y + d, h)];
  return (
    <g>
      <polygon points={pts(left)} fill={mix(b.side, '#000000', 0.18)} />
      <polygon points={pts(right)} fill={mix(b.side, '#000000', 0.36)} />
      <polygon points={pts(top)} fill={b.top} />
    </g>
  );
};
const CRACKS = Array.from({length: 16}, (_, i) => {
  let x = 30 + random(`cx${i}`) * 390, y = 30 + random(`cy${i}`) * 390;
  const p: Pt[] = [[x, y]];
  for (let j = 0; j < 4; j++) {
    x += (random(`cdx${i}${j}`) - 0.5) * 90;
    y += (random(`cdy${i}${j}`) - 0.5) * 90;
    p.push([Math.max(5, Math.min(445, x)), Math.max(5, Math.min(445, y))]);
  }
  return p;
});
export const C5Drought: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const dry = ease(f, w(1301.8), 40);
  const stop = ease(f, w(1303.74), 8);
  const brown = ease(f, w(1304.0), 50);
  const toFab = ease(f, w(1306.54), 10);
  const trucks = ease(f, w(1308.85), 10);
  const s = lerp(0.94, 0.3, dry);
  const water: Pt[] = [[0, 0], [450, 0], [450, 450], [0, 450]].map(([x, y]) => iso(225 + (x - 225) * s, 225 + (y - 225) * s));
  const pipeA: Pt[] = [[450, 300], [600, 300], [600, 700], [450, 700]];
  const pipeB: Pt[] = [[600, 300], [700, 300]];
  const line = (p: Pt[]) => pts(p.map(([x, y]) => iso(x, y, 4)));
  const valve = iso(600, 640, 4);
  return (
    <Bg c="#F6B26B" c2="#F7D9A6" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 520, 0.9], [1300.9, 960, 520, 0.9], [1301.9, 940, 380, 1.3, 0, 6], [1302.8, 940, 380, 1.3, 0, 6], [1303.6, 600, 620, 1.2, -6, 4], [1306.2, 620, 620, 1.2, -6, 4], [1307.3, 1220, 660, 1.15, 6, 4], [1308.6, 1000, 620, 0.95, 4, 2], [1311.6, 980, 600, 0.9]]}>
        <World>
          <polygon points={pts([iso(-500, -300), iso(1500, -300), iso(1500, 1400), iso(-500, 1400)])} fill="#B9C76A" />
          {/* reservoir: water shrinks, mud cracks */}
          <polygon points={pts([iso(0, 0), iso(450, 0), iso(450, 450), iso(0, 450)])} fill="#B07A3E" stroke="#7A5428" strokeWidth={6} />
          {CRACKS.map((c, i) => (
            <polyline key={i} points={pts(c.map(([x, y]) => iso(x, y)))} stroke="#6E4520" strokeWidth={4} fill="none" opacity={dry} />
          ))}
          <polygon points={pts(water)} fill={P.water} />
          {/* fields: paddies, then dry */}
          {Array.from({length: 9}, (_, i) => {
            const x = 10 + (i % 3) * 150, y = 610 + Math.floor(i / 3) * 150;
            const c = mix(P.green, '#C9A85A', brown * (i === 4 ? 0.5 : 1));
            return (
              <g key={i}>
                <polygon points={pts([iso(x, y), iso(x + 130, y), iso(x + 130, y + 130), iso(x, y + 130)])} fill={c} />
                {[0.3, 0.6].map((k) => {
                  const a = iso(x + 10, y + 130 * k), b = iso(x + 120, y + 130 * k);
                  return <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#BFE8FF" strokeWidth={3} opacity={(1 - stop) * 0.8} />;
                })}
              </g>
            );
          })}
          {/* road */}
          <polygon points={pts([iso(-500, 500), iso(900, 500), iso(900, 560), iso(-500, 560)])} fill="#6E7487" />
          {Array.from({length: 14}, (_, i) => {
            const a = iso(-480 + i * 100, 530), b = iso(-440 + i * 100, 530);
            return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={P.white} strokeWidth={4} />;
          })}
          {/* pipes: one branch to the fields, one to the chip plants */}
          <polyline points={line([...pipeA])} stroke="#5B6B8C" strokeWidth={16} fill="none" strokeLinejoin="round" />
          <polyline points={line(pipeA)} stroke={P.water} strokeWidth={7} fill="none" strokeLinejoin="round" strokeDasharray="16 14" strokeDashoffset={-f * 4} opacity={1 - stop} />
          <polyline points={line(pipeB)} stroke="#5B6B8C" strokeWidth={16} fill="none" />
          <polyline points={line(pipeB)} stroke={P.water} strokeWidth={lerp(7, 11, toFab)} fill="none" strokeDasharray="16 14" strokeDashoffset={-f * lerp(4, 8, toFab)} />
          <circle cx={valve[0]} cy={valve[1]} r={16} fill="#3A3D55" />
          {stop > 0 && (
            <g transform={`translate(${valve[0]},${valve[1] - 50}) scale(${pop(f, w(1303.74), 10)})`}>
              <circle r={30} fill={P.red} />
              <path d="M-13 -13 L13 13 M13 -13 L-13 13" stroke={P.white} strokeWidth={8} strokeLinecap="round" />
            </g>
          )}
          {/* the chip plants */}
          <IsoBox b={{x: 700, y: 150, w: 350, d: 300, h: 90, top: '#DDE6F5', side: '#F4F7FC'}} />
          {Array.from({length: 8}, (_, i) => {
            const [sx, sy] = iso(740 + (i % 4) * 80, 200 + Math.floor(i / 4) * 140, 90);
            return (
              <g key={i} transform={`translate(${sx},${sy}) scale(1,0.5)`}>
                <circle r={22} fill="#9FB0D3" />
                <g transform={`rotate(${(f * 12 + i * 30) % 360})`}>
                  <rect x={-18} y={-4} width={36} height={8} rx={4} fill="#5B6B8C" />
                  <rect x={-4} y={-18} width={8} height={36} rx={4} fill="#5B6B8C" />
                </g>
              </g>
            );
          })}
          {/* the water trucks */}
          {trucks > 0 &&
            Array.from({length: 6}, (_, i) => {
              const u = ((Math.max(0, f - w(1308.85)) * 0.007 + i / 6) % 1);
              const [sx, sy] = iso(lerp(-500, 860, u), 530, 0);
              return (
                <g key={i} transform={`translate(${sx},${sy - 18}) skewY(30) scale(0.3)`} opacity={trucks * Math.min(1, (1 - u) * 8)}>
                  <TankTruck />
                </g>
              );
            })}
          <STag x={iso(225, 225)[0]} y={iso(225, 225)[1] - 20} size={30} text="Reservoir" bg={P.ink} color={P.white} />
          <STag x={iso(225, 825)[0]} y={iso(225, 825)[1]} size={30} text="Farm fields" bg={P.ink} color={P.white} />
          <STag x={iso(875, 300, 170)[0]} y={iso(875, 300, 170)[1]} size={30} text="Chip plants" bg={P.ink} color={P.white} />
        </World>
      </Cam>
      {/* the sun */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <g transform={`translate(960,150) scale(${0.8 + Math.sin(f / 10) * 0.04})`}>
          <g transform={`rotate(${(f / 2) % 360})`}>
            {Array.from({length: 12}, (_, i) => (
              <rect key={i} x={-5} y={-95} width={10} height={26} rx={5} fill={P.yellow} transform={`rotate(${i * 30})`} />
            ))}
          </g>
          <circle r={58} fill={P.yellow} />
        </g>
      </svg>
      <Lbl f={f} at={w(1296.3)} title="Taiwan, 2021" bg={P.ink} color={P.white} />
      <div style={{position: 'absolute', right: 80, top: 70, textAlign: 'right', opacity: ease(f, w(1299.38), 10), transform: `scale(${Math.min(1, pop(f, w(1299.38), 12))})`, transformOrigin: '100% 0'}}>
        <Tag bg={P.red} color={P.white} size={40}>
          Worst drought in about 56 years
        </Tag>
        <Src style={{marginTop: 12}} color={P.ink}>
          Source · Reuters, Bloomberg (2021)
        </Src>
      </div>
      <Caps
        f={f}
        w={w}
        items={[
          [1301.8, 'Reservoirs dried up'],
          [1302.98, 'Farmers were told to stop watering some fields'],
          [1305.9, '…so water could keep flowing to the factories'],
          [1308.3, 'And TSMC trucked in water to keep its chip plants running'],
        ]}
      />
    </Bg>
  );
};

/* ---------------------------------------------------------------- 21:51 "The world's AI depended, in part, on a fleet of water trucks driving across one island." */
export const C5Trucks: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const up = ease(f, w(1313.3), 12);
  const dep: Pt[] = [[1640, 560], [1400, 300], [700, 260]];
  return (
    <Bg c="#FF9F5A" c2="#FFD9A0" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 1200, 820, 1.55, -12, -6], [1313.1, 1150, 780, 1.4, -8, -4], [1314.4, 960, 560, 1.0, 0, 0], [1317.95, 960, 540, 0.94, 5, 0]]}>
        <World>
          {/* hills, near and far */}
          <path d={`M-400 760 Q${200 - ((f * 0.6) % 200)} 600 600 740 T1500 720 T2400 760 V1200 H-400 Z`} fill="#E58A4E" />
          <path d="M-400 820 Q300 720 900 820 T2400 800 V1200 H-400 Z" fill="#C8693A" />
          <rect x={-400} y={850} width={2800} height={110} fill="#4A4F63" />
          {Array.from({length: 16}, (_, i) => (
            <rect key={i} x={((i * 160 - f * 2) % 2560) + 2560 * (i * 160 - f * 2 < 0 ? 1 : 0) - 400} y={900} width={80} height={8} fill={P.white} />
          ))}
          <rect x={-400} y={960} width={2800} height={300} fill="#A9552C" />
          {/* the chip plant */}
          <g transform="translate(1700,770)">
            <rect x={-200} y={-160} width={400} height={240} rx={10} fill="#E8EEF9" />
            <rect x={-200} y={-160} width={400} height={28} rx={10} fill="#B8C3D9" />
            {[-150, -90, -30, 30, 90, 150].map((x) => (
              <rect key={x} x={x - 18} y={-110} width={36} height={60} rx={4} fill={P.yellow} opacity={0.6 + 0.4 * Math.sin(f / 4 + x)} />
            ))}
          </g>
          {/* chips go out to the world's AI */}
          <Flow pts={dep} f={f} c={P.yellow} n={9} r={12} speed={9} o={up} />
          <Put x={560} y={250} s={1.05} f={f} at={w(1313.4)}>
            <Globe f={f} />
          </Put>
          {/* the fleet */}
          {Array.from({length: 7}, (_, i) => {
            const x = ((f * 6 + i * 330) % 2300) - 400;
            return (
              <g key={i} transform={`translate(${x},${872 + (i % 2) * 34}) scale(${i % 2 ? 1.05 : 0.95})`}>
                <TankTruck />
              </g>
            );
          })}
          <STag x={560} y={420} k={pop(f, w(1313.62), 12)} size={38} text="The world's AI" bg={P.ink} color={P.white} />
          <STag x={1700} y={520} k={pop(f, w(1313.9), 12)} size={34} text="Chip plants" />
          <STag x={700} y={700} k={pop(f, w(1315.7), 12)} size={40} text="A fleet of water trucks" bg={P.water} color={P.white} />
        </World>
      </Cam>
      <Pop f={f} at={w(1311.88)} x={960} y={300} size={88} color={P.ink} until={w(1313.15)}>
        Think about that.
      </Pop>
      <Caption f={f} at={w(1314.16)}>The world's AI depended, in part, on water trucks</Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- 22:07 "...talked about oil. Chips also need rare materials. Take gallium and germanium..." */
export const C5Metals: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const out = ease(f, w(1329.2), 14);
  const ga = pop(f, w(1331.12), 14);
  const ge = pop(f, w(1331.88), 14);
  const chunk = (cx: number, cy: number, k: number, c: string, seed: string) =>
    k > 0 ? (
      <g transform={`translate(${cx},${cy}) scale(${k})`}>
        {[[-70, 10, 1], [10, -10, 1.3], [80, 20, 0.9]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
            <polygon points="-40,20 -30,-24 6,-40 40,-16 36,24 -6,36" fill={mix(c, '#000000', 0.25)} />
            <polygon points="-30,-24 6,-40 40,-16 2,-6" fill={mix(c, '#FFFFFF', 0.45)} />
            <polygon points="-40,20 -30,-24 2,-6 -6,36" fill={c} />
          </g>
        ))}
        {Array.from({length: 5}, (_, i) => {
          const tw = Math.max(0, Math.sin(f / 7 + random(`${seed}${i}`) * 6));
          return <path key={i} d="M0 -14 L3 -3 L14 0 L3 3 L0 14 L-3 3 L-14 0 L-3 -3 Z" fill={P.white} transform={`translate(${(random(`${seed}x${i}`) - 0.5) * 220},${(random(`${seed}y${i}`) - 0.5) * 90}) scale(${tw})`} />;
        })}
      </g>
    ) : null;
  return (
    <Bg c="#24345E" c2="#141D3D" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.05, -10, 0], [1330.0, 960, 540, 1.0, 6, 2]]}>
        <World>
          <g opacity={1 - out}>
            <Put x={600} y={500} s={1.5} f={f} at={0}>
              <Barrel />
            </Put>
            <Put x={1320} y={500} s={1.4} f={f} at={w(1327.8)}>
              <Chip c="#1D6B3A" f={f} on={1} />
            </Put>
            <text x={960} y={540} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={130} fill={P.white} opacity={ease(f, w(1327.84), 8)}>
              ≈
            </text>
            <STag x={600} y={760} size={40} text="Oil, then" />
            <STag x={1320} y={760} size={40} text="Chips, now" bg={P.yellow} k={pop(f, w(1327.9), 10)} />
          </g>
        </World>
      </Cam>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {chunk(700, 780, ga, '#9FB3CF', 'ga')}
        {chunk(1220, 780, ge, '#8D93A3', 'ge')}
      </svg>
      <Elem k={ga} n={31} sym="Ga" name="Gallium" c="#4E79C7" size={280} style={{left: 560, top: 230}} />
      <Elem k={ge} n={32} sym="Ge" name="Germanium" c="#6B6F8E" size={280} style={{left: 1080, top: 230}} />
      <Pop f={f} at={w(1327.84)} x={960} y={170} size={60} until={w(1329.0)}>
        Talked about like oil
      </Pop>
      <Caps
        f={f}
        w={w}
        items={[
          [1328.96, 'Chips also need rare materials'],
          [1332.92, 'Two metals used in chips and electronics'],
        ]}
      />
    </Bg>
  );
};

/* ---------------------------------------------------------------- 22:18 ~98% of gallium from China; 2023 restrictions; late-2024 US ban (footnote: suspended Nov 2025–Nov 2026); a weapon */
const US_P = bez([480, 580], [820, 580], [1150, 420], [1440, 420]);
const ROW_P = bez([480, 580], [820, 580], [1150, 720], [1440, 720]);
export const C5Gallium: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const top = ease(f, 0, 8) * (1 - ease(f, w(1350.0), 12));
  const restrict = ease(f, w(1342.94), 14);
  const ban = ease(f, w(1347.12), 10);
  const note = ease(f, w(1347.9), 12);
  const weapon = ease(f, w(1352.74), 12);
  const gate = (p: Pt, k: number, c: string) =>
    k > 0 ? (
      <g transform={`translate(${p[0]},${p[1]})`}>
        <rect x={-14} y={-75 * k} width={28} height={150 * k} rx={8} fill={c} />
      </g>
    ) : null;
  const usMid = US_P[12], rowMid = ROW_P[12];
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 580, 1.0], [1342.5, 960, 580, 1.0], [1349.0, 1000, 580, 1.05, -6, 3], [1355.4, 960, 580, 1.0, 0, 0]]}>
        <World>
          {/* routes: China to the US and to everyone else */}
          <polyline points={pts(US_P)} stroke="rgba(255,255,255,0.18)" strokeWidth={26} fill="none" strokeLinecap="round" />
          <polyline points={pts(ROW_P)} stroke="rgba(255,255,255,0.18)" strokeWidth={26} fill="none" strokeLinecap="round" />
          <Flow pts={ban > 0 ? US_P.slice(0, 12) : US_P} f={f} c="#C8D2E6" n={ban > 0 ? 4 : lerp(8, 4, restrict)} r={11} speed={lerp(8, 3.5, restrict)} line={false} o={1 - ban * 0.4} />
          <Flow pts={ROW_P} f={f} c="#C8D2E6" n={Math.round(lerp(8, 4, restrict))} r={11} speed={lerp(8, 3.5, restrict)} line={false} />
          {gate(rowMid, restrict * 0.6, P.yellow)}
          {gate(usMid, ban > 0 ? 1 : restrict * 0.6, ban > 0 ? P.red : P.yellow)}
          {ban > 0 && (
            <g transform={`translate(${usMid[0] + 50},${usMid[1] - 60}) scale(${pop(f, w(1347.12), 10)})`}>
              <circle r={30} fill={P.red} />
              <path d="M-13 -13 L13 13 M13 -13 L-13 13" stroke={P.white} strokeWidth={8} strokeLinecap="round" />
            </g>
          )}
          <g transform="translate(360,580)">
            <circle r={125 + weapon * Math.sin(f / 3) * 8} fill={P.red} style={{filter: weapon > 0 ? `drop-shadow(0 0 ${30 * weapon}px ${P.red})` : undefined}} />
            <text y={14} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={74} fill={P.white}>
              Ga
            </text>
            <text y={70} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={P.white}>
              Ge
            </text>
          </g>
          <STag x={360} y={765} size={40} text="China" bg={P.white} />
          <circle cx={1530} cy={420} r={80} fill={P.blue} />
          <circle cx={1530} cy={720} r={80} fill="#5B6B8C" />
          <STag x={1530} y={300} size={34} text="United States" />
          <STag x={1530} y={840} size={34} text="Rest of the world" />
          <STag x={rowMid[0]} y={(usMid[1] + rowMid[1]) / 2} k={pop(f, w(1341.24), 12)} size={32} text="2023 · exports restricted" bg={P.yellow} />
          <STag x={usMid[0]} y={usMid[1] - 118} k={pop(f, w(1345.64), 12)} size={32} text="Late 2024 · banned to the US" bg={P.red} color={P.white} />
        </World>
      </Cam>
      {/* ~98% */}
      {top > 0 && (
        <div style={{position: 'absolute', left: 80, top: 70, opacity: top, display: 'flex', alignItems: 'center', gap: 30}}>
          <Counter f={f} start={w(1338.42)} dur={24} to={98} prefix="~" suffix="%" size={120} color={P.yellow} />
          <div>
            <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 38, color: P.white}}>of the world's gallium comes from China</div>
            <Src style={{marginTop: 8}}>by some estimates · Source · USGS</Src>
          </div>
        </div>
      )}
      <Pop f={f} at={w(1352.74)} x={960} y={160} size={76}>
        A weapon in a <span style={{color: P.red}}>global tech war</span>
      </Pop>
      {/* the footnote the narration needs: the ban is history for now */}
      {note > 0 && (
        <div style={{position: 'absolute', left: 140, right: 140, bottom: 70, opacity: note, transform: `translateY(${(1 - note) * 20}px)`, background: 'rgba(255,255,255,0.95)', borderRadius: 22, padding: '16px 30px', borderLeft: `10px solid ${P.yellow}`}}>
          <div style={{fontFamily: AF.body, fontWeight: 700, fontSize: 30, color: P.ink}}>Update: China suspended the US ban from 9 Nov 2025 to 27 Nov 2026. Export licences are still required.</div>
          <Src style={{marginTop: 6}} color="#4A5277">
            Sources · USGS · Reuters, Dec 2024
          </Src>
        </div>
      )}
    </Bg>
  );
};

/* ---------------------------------------------------------------- 22:35 copper for wiring and power lines; batteries carry data centres through a power cut; cobalt and lithium */
export const C5Copper: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const cu = pop(f, w(1355.96), 12) * (1 - ease(f, w(1360.6), 10));
  const wire = ease(f, w(1356.96), 12);
  const line = ease(f, w(1359.2), 12);
  const batt = pop(f, w(1360.78), 12);
  const cut = ease(f, w(1363.7), 6);
  const level = 1 - 0.55 * ease(f, w(1363.9), 60);
  const cell = ease(f, w(1365.5), 12);
  const wires: Pt[] = [[-400, 560], [150, 532], [550, 532], [860, 560]];
  const sag = (p: Pt[]) => 'M' + p[0].join(',') + p.slice(1).map((q, i) => ` Q${(p[i][0] + q[0]) / 2},${Math.max(p[i][1], q[1]) + 50} ${q[0]},${q[1]}`).join('');
  const wireC = cut > 0 ? mix(COPPER, '#3A3D55', cut) : mix('#7C8AA8', COPPER, line);
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 1150, 620, 1.15, -8, 4], [1358.5, 1150, 620, 1.15, -8, 4], [1359.3, 900, 580, 0.8, 0, 2], [1360.4, 900, 580, 0.8, 0, 2], [1361.3, 1450, 600, 0.78, 6, 2], [1365.2, 1450, 600, 0.78, 6, 2], [1366.3, 2000, 680, 1.5, 0, 0]]}>
        <World w={2600} h={1080}>
          <rect x={-800} y={820} width={4200} height={400} fill="#0F1A45" />
          {[150, 550].map((x) => (
            <Put key={x} x={x} y={628} s={1.6}>
              <Pylon />
            </Put>
          ))}
          {[0, 34].map((dy) => (
            <path key={dy} d={sag(wires.map(([x, y]) => [x, y + dy] as Pt))} stroke={wireC} strokeWidth={8} fill="none" style={{filter: line > 0 && cut < 1 ? `drop-shadow(0 0 ${8 * line}px ${COPPER})` : undefined}} />
          ))}
          <Flow pts={wires} f={f} c={P.yellow} n={6} r={9} speed={7} line={false} o={line * (1 - cut)} />
          {/* the data centre, cut away */}
          <rect x={860} y={470} width={600} height={350} rx={14} fill="#E8EEF9" />
          <rect x={884} y={510} width={552} height={290} rx={8} fill="#141B42" />
          {[960, 1060, 1160, 1260, 1360].map((x, i) => (
            <Put key={x} x={x} y={705} s={0.85}>
              <Rack f={f + i * 5} busy={1} />
            </Put>
          ))}
          {[548, 572].map((y, i) => (
            <path key={y} d={`M884 ${y} H1436`} stroke={COPPER} strokeWidth={9} strokeDasharray={i ? '22 12' : undefined} strokeDashoffset={-f * 4} opacity={0.35 + 0.65 * wire} style={{filter: wire > 0 ? `drop-shadow(0 0 ${10 * wire}px ${COPPER})` : undefined}} />
          ))}
          {[960, 1060, 1160, 1260, 1360].map((x) => (
            <line key={x} x1={x} y1={572} x2={x} y2={612} stroke={COPPER} strokeWidth={6} opacity={0.35 + 0.65 * wire} />
          ))}
          <STag x={1160} y={430} size={34} text="Copper wiring" bg={COPPER} color={P.white} k={wire} />
          {/* the battery system */}
          {batt > 0 && (
            <g opacity={Math.min(1, batt)}>
              <rect x={1720} y={560} width={560} height={260} rx={14} fill="#3A4F8F" />
              {Array.from({length: 8}, (_, i) => (
                <Put key={i} x={1800 + (i % 4) * 135} y={630 + Math.floor(i / 4) * 110} s={0.62}>
                  <Battery level={level} c={cut > 0 ? P.green : '#7ED957'} />
                </Put>
              ))}
              <path d="M1720 760 H1460" stroke="#5B6B8C" strokeWidth={14} />
              <Flow pts={[[1720, 760], [1460, 760]]} f={f} c={P.green} n={4} r={10} speed={6} line={false} o={cut} />
              <STag x={2000} y={510} size={34} text="Battery system" bg={P.green} color={P.ink} />
            </g>
          )}
          {cut > 0 && (
            <g transform={`translate(380,420) scale(${pop(f, w(1363.7), 10)})`}>
              <STag x={0} y={0} size={36} text="Power cut" bg={P.red} color={P.white} />
            </g>
          )}
        </World>
      </Cam>
      {/* inside a battery: cobalt and lithium */}
      {cell > 0 && (
        <AbsoluteFill style={{opacity: cell}}>
          <div style={{position: 'absolute', inset: 0, background: 'rgba(11,22,56,0.7)'}} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <g transform="translate(1340,520)">
              <rect x={-120} y={-260} width={240} height={500} rx={60} fill="#AEB8CC" />
              <rect x={-40} y={-288} width={80} height={36} rx={10} fill="#7C8AA8" />
              {Array.from({length: 9}, (_, i) => (
                <rect key={i} x={-96} y={-220 + i * 50} width={192} height={22} rx={6} fill={i % 2 ? COBALT : '#C9D2E6'} opacity={0.6 + 0.4 * Math.sin(f / 5 + i)} />
              ))}
            </g>
            <text x={1340} y={820} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={P.white}>
              inside a battery cell
            </text>
          </svg>
          <Elem k={pop(f, w(1366.44), 12)} n={27} sym="Co" name="Cobalt" c={COBALT} size={250} style={{left: 300, top: 260}} />
          <Elem k={pop(f, w(1367.16), 12)} n={3} sym="Li" name="Lithium" c="#C0398A" size={250} style={{left: 610, top: 260}} />
        </AbsoluteFill>
      )}
      <Elem k={cu} n={29} sym="Cu" name="Copper" c={COPPER} size={220} style={{left: 80, top: 70}} />
      <Caps
        f={f}
        w={w}
        items={[
          [1356.0, 'Copper: the wiring in every data centre and every new power line'],
          [1360.4, 'Giant batteries keep data centres running if the power cuts out'],
          [1365.48, 'Many batteries use cobalt and lithium'],
        ]}
      />
    </Bg>
  );
};

/* ---------------------------------------------------------------- 22:48 "Around 70% of the world's cobalt comes from the Democratic Republic of the Congo." */
export const C5Cobalt: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const tagK = pop(f, w(1370.86), 12);
  return (
    <Bg c="#103A66" c2="#0B1638" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 640, 1.0, -10, 26], [1372.35, 960, 620, 1.06, -2, 16]]}>
        <World>
          {Array.from({length: 100}, (_, i) => {
            const col = Math.floor(i / 5), row = i % 5;
            const x = 300 + col * 70 + row * 0, y = 520 + row * 64;
            const on = i < 70;
            const k = pop(f, w(1368.2) + i * 0.4, 8);
            return <Cube key={i} x={x} y={y + (on ? Math.sin(f / 6 + i) * 3 : 0)} c={on ? COBALT : '#5B6B8C'} k={k} />;
          })}
          {tagK > 0 && (
            <g opacity={Math.min(1, tagK)}>
              <path d="M276 470 V440 H1250 V470" stroke={P.orange} strokeWidth={6} fill="none" />
              <path d="M1300 470 V440 H1650 V470" stroke="#AEB8CC" strokeWidth={6} fill="none" />
              <STag x={763} y={392} size={36} text="DR Congo" bg={P.orange} color={P.ink} k={tagK} />
              <STag x={1475} y={392} size={32} text="Everyone else" bg="#AEB8CC" k={tagK} />
            </g>
          )}
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 120, top: 70}}>
        <Counter f={f} start={w(1368.2)} dur={24} to={70} prefix="~" suffix="%" size={150} color="#8FB0FF" />
        <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 44, color: P.white, marginTop: 6, opacity: ease(f, w(1369.4), 10)}}>of the world's cobalt</div>
        <Src style={{marginTop: 10, opacity: ease(f, w(1369.6), 10)}}>Source · USGS</Src>
      </div>
      <Caption f={f} at={w(1370.26)}>comes from the Democratic Republic of the Congo</Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- 23:00 to be honest: most cobalt goes to phones and electric cars; AI's demand makes it part of the chain */
export const C5Honest: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const grow = ease(f, w(1387.56), w(1390.9) - w(1387.56));
  const chain = ease(f, w(1391.12), 30);
  const dests: [number, string, number, number][] = [[230, 'Phones', 46, 1383.0], [470, 'Electric cars', 60, 1384.04], [730, 'AI: data centres', lerp(8, 30, grow), 1385.04]];
  const stream = (y: number) => bez([800, 520], [1000, 520], [1000, y], [1180, y], 20);
  const chainPath: Pt[] = [[430, 520], [800, 520], ...stream(730).slice(1)];
  const seg = chainPath.slice(1).map((p, i) => Math.hypot(p[0] - chainPath[i][0], p[1] - chainPath[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const along = (d: number): [number, number, number] => {
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i]) {
        const k = d / seg[i], a = chainPath[i], b = chainPath[i + 1];
        return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI];
      }
      d -= seg[i];
    }
    return [...chainPath[chainPath.length - 1], 0];
  };
  return (
    <Bg c="#1E1650">
      <Cam f={f} t0={t0} keys={[[t0, 760, 520, 1.0, -10, 3], [1385.0, 880, 520, 1.0, -4, 2], [1394.0, 960, 520, 0.98, 0, 0]]}>
        <World>
          {/* mine → cobalt */}
          <path d="M430 520 H800" stroke={COBALT} strokeWidth={80} strokeLinecap="round" />
          <path d="M430 520 H800" stroke={P.white} strokeWidth={6} strokeDasharray="20 30" strokeDashoffset={-f * 4} opacity={0.4} />
          {dests.map(([y, , wd, a]) => (
            <g key={y} opacity={ease(f, w(a) - 10, 10)}>
              <polyline points={pts(stream(y))} stroke={COBALT} strokeWidth={wd} fill="none" strokeLinecap="round" />
              <polyline points={pts(stream(y))} stroke={P.white} strokeWidth={Math.min(6, wd / 3)} fill="none" strokeDasharray="20 30" strokeDashoffset={-f * 4} opacity={0.4} />
            </g>
          ))}
          <g transform="translate(320,520)">
            <ellipse cy={60} rx={120} ry={34} fill="#120C30" />
            <g transform="scale(0.9)">
              <Rock c="#6E655E" c2={COBALT} />
            </g>
            <g transform="translate(70,-60) scale(0.6)">
              <Pickaxe />
            </g>
          </g>
          <STag x={320} y={680} size={30} text="Hand-dug mines · DR Congo" />
          <Cube x={800} y={500} s={56} c={COBALT} />
          <STag x={800} y={680} size={30} text="Cobalt" bg={COBALT} color={P.white} />
          <Put x={1250} y={230} s={0.55} f={f} at={w(1383.0)}>
            <Phone />
          </Put>
          <Put x={1260} y={470} s={0.75} f={f} at={w(1384.04)}>
            <Car />
          </Put>
          <Put x={1260} y={730} s={0.5} f={f} at={w(1385.04)}>
            <DataCentre f={f} busy={1} />
          </Put>
          {dests.map(([y, name, , a]) => (
            <STag key={name} x={1360} y={y} k={pop(f, w(a), 10)} size={32} anchor="start" text={name} bg={name.startsWith('AI') ? P.yellow : P.white} />
          ))}
          {[['More batteries', 1388.44], ['More devices', 1389.3], ['More power storage', 1390.44]].map(([t, a], i) => (
            <STag key={t as string} x={900} y={790 + i * 62} k={pop(f, w(a as number), 10)} size={30} text={`+ ${t}`} bg={P.yellow} />
          ))}
          {/* the same chain */}
          {chain > 0 &&
            Array.from({length: Math.floor(total / 46)}, (_, i) => {
              const d = i * 46 + 23;
              if (d / total > chain) return null;
              const [x, y, ang] = along(d);
              return <rect key={i} x={-26} y={i % 2 ? -8 : -15} width={52} height={i % 2 ? 16 : 30} rx={i % 2 ? 8 : 15} fill="none" stroke="#DCE3F2" strokeWidth={7} transform={`translate(${x},${y}) rotate(${ang})`} />;
            })}
        </World>
      </Cam>
      {/* what the narration just said, kept on screen soberly, with its source */}
      <div style={{position: 'absolute', left: 80, top: 70, width: 660, background: 'rgba(255,255,255,0.94)', borderRadius: 22, padding: '18px 26px', borderLeft: `10px solid ${P.orange}`, opacity: ease(f, 0, 10) * (1 - 0.35 * ease(f, w(1386.4), 20))}}>
        <div style={{fontFamily: AF.body, fontWeight: 600, fontSize: 30, lineHeight: 1.3, color: P.ink}}>Human rights groups have documented people, including children, digging by hand in dangerous mines.</div>
        <Src style={{marginTop: 10}} color="#4A5277">
          Amnesty International 2016, 2023
        </Src>
      </div>
      <Src style={{position: 'absolute', right: 80, top: 80, opacity: ease(f, w(1383.0), 10)}}>illustration · widths not to scale</Src>
      <Caps
        f={f}
        w={w}
        items={[
          [1381.62, 'Most of it goes into phones and electric cars, not AI'],
          [1386.42, 'But AI drives demand for more batteries, devices and storage'],
          [1391.12, 'So AI becomes part of that same chain'],
        ]}
      />
    </Bg>
  );
};

/* ---------------------------------------------------------------- 23:14 the end of the chain: chips replaced every few years; the old ones become waste */
const SWAPS = [1399.04, 1400.8, 1402.4];
const GEN = ['#5B6B8C', '#2F6BFF', '#7B5CFF', '#FF4F8B'];
export const C5Waste: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const done = SWAPS.filter((s) => f >= w(s) + 18).length;
  const heapH = 60 + done * 34;
  const ewaste = pop(f, w(1403.36), 12);
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 300, 1.15], [1395.4, 960, 300, 1.15], [1396.5, 980, 600, 0.95, -8, 4], [1404.1, 1000, 600, 1.0, 6, 2]]}>
        <World w={1920} h={1200}>
          {/* the last links of the chain */}
          {Array.from({length: 9}, (_, i) => {
            const x = -100 + i * 120;
            return i % 2 === 0 ? <rect key={i} x={x - 60} y={226} width={120} height={60} rx={30} fill="none" stroke="#C9D2E6" strokeWidth={16} /> : <rect key={i} x={x - 40} y={248} width={80} height={18} rx={9} fill="#8F9AB4" />;
          })}
          <g transform={`translate(1000,256) rotate(${Math.sin(f / 9) * 10})`}>
            <rect x={-10} y={-34} width={150} height={68} rx={34} fill="none" stroke={P.yellow} strokeWidth={18} />
          </g>
          <STag x={1050} y={140} size={40} text="The end of the chain" bg={P.yellow} k={pop(f, w(1394.64), 12)} />
          {/* the server board */}
          <rect x={430} y={500} width={420} height={280} rx={18} fill="#1D6B3A" />
          {Array.from({length: 8}, (_, i) => (
            <path key={i} d={`M${450 + i * 50} 520 V560 H${470 + i * 46}`} stroke="#58C27D" strokeWidth={4} fill="none" opacity={0.6} />
          ))}
          <rect x={540} y={560} width={200} height={160} rx={12} fill="#0F3D22" />
          <Put x={1040} y={460} s={0.55} f={f} at={w(1396.26)}>
            <Clock f={f * 3} />
          </Put>
          {/* chips: installed, replaced, thrown out */}
          {GEN.map((c, g) => {
            const inAt = g === 0 ? -1 : SWAPS[g - 1];
            const outAt = SWAPS[g];
            const kin = g === 0 ? 1 : ease(f, w(inAt) + 6, 16);
            const kout = outAt === undefined ? 0 : ease(f, w(outAt), 18);
            if (kin <= 0) return null;
            let x = lerp(-200, 640, kin), y = 640, r = 0, s = 0.82;
            if (kout > 0) {
              const hx = 1380 + (g % 3) * 70 - 40, hy = 900 - heapH + 10 - g * 6;
              x = lerp(640, hx, kout);
              y = lerp(640, hy, kout) - Math.sin(kout * Math.PI) * 220;
              r = kout * (160 + g * 40);
              s = lerp(0.82, 0.5, kout);
            }
            const life = g === done ? 1 - 0.6 * ease(f, w(g === 0 ? 1396.4 : (inAt as number) + 1), 50) : 1;
            return (
              <g key={g} transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
                <Chip c={c} f={f} on={kout > 0 ? 0 : life} />
              </g>
            );
          })}
          <STag x={640} y={450} size={34} text="Newer, faster model" bg={P.sky} k={pop(f, w(1400.8), 10)} />
          {/* the scrap heap */}
          <path d={`M1180 900 Q1450 ${900 - heapH * 2} 1720 900 Z`} fill="#3A3D55" />
          {Array.from({length: 4 + done * 4}, (_, i) => (
            <rect key={i} x={1250 + random(`hx${i}`) * 380} y={900 - heapH * 0.9 * random(`hy${i}`) - 10} width={44} height={24} rx={4} fill={['#1D6B3A', '#5B6B8C', '#2F6BFF', '#7B5CFF'][i % 4]} transform={`rotate(${random(`hr${i}`) * 80 - 40} ${1272 + random(`hx${i}`) * 380} ${900 - heapH * 0.5})`} opacity={0.9} />
          ))}
          <rect x={-200} y={900} width={2400} height={300} fill="#1B1446" />
          <STag x={1450} y={900 - heapH - 90} size={40} text="E-waste" bg={P.red} color={P.white} k={ewaste} />
        </World>
      </Cam>
      <Caps
        f={f}
        w={w}
        items={[
          [1395.94, "AI chips don't last forever"],
          [1398.0, 'Companies replace them every few years with faster, newer models'],
          [1402.62, 'The old ones become waste'],
        ]}
      />
    </Bg>
  );
};

/* ---------------------------------------------------------------- 23:24 "A 2024 study in Nature Computational Science... 1.2 to 5 million tonnes of electronic waste by 2030" */
export const C5Study: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const lo = ease(f, w(1412.37), 18);
  const hi = ease(f, w(1412.84), 26);
  const base = 830, maxH = 500;
  const bar = (x: number, k: number, v: number, label: string, txt: string, c: string, key: string) => {
    const h = (maxH * v * k) / 5;
    return (
      <g>
        <rect x={x} y={base - h} width={230} height={h} fill={c} />
        {Array.from({length: Math.floor(h / 24)}, (_, i) => (
          <rect key={i} x={x + 8 + (i % 2) * 14} y={base - 24 * (i + 1) + 4} width={200} height={14} rx={4} fill={mix(c, '#000000', 0.25)} />
        ))}
        {k > 0 &&
          Array.from({length: 5}, (_, i) => {
            const y = base - h - 240 + ((f * 7 + i * 50) % 240);
            return <rect key={`${key}${i}`} x={x + 30 + i * 36} y={y} width={30} height={14} rx={3} fill={mix(c, '#FFFFFF', 0.2)} opacity={0.8} />;
          })}
        <text x={x + 115} y={base - h - 30} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={50} fill={P.white} opacity={ease(f, 0, 1) * Math.min(1, k * 3)}>
          {txt}
        </text>
        <text x={x + 115} y={base + 50} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={P.white} opacity={Math.min(1, k * 3)}>
          {label}
        </text>
      </g>
    );
  };
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.04, 10, 0], [1416.3, 980, 540, 1.0, -4, 0]]}>
        <World>
          {bar(950, lo, 1.2, 'Low estimate', '1.2 million t', '#3FA36B', 'l')}
          {bar(1400, hi, 5, 'High estimate', '5 million t', P.green, 'h')}
          <line x1={900} y1={base} x2={1700} y2={base} stroke={P.white} strokeWidth={4} />
        </World>
      </Cam>
      {/* the paper */}
      <div style={{position: 'absolute', left: 110, top: 170, width: 520, height: 640, background: P.white, borderRadius: 18, boxShadow: '0 20px 50px rgba(0,0,0,0.35)', transform: `rotate(-3deg) scale(${Math.min(1, pop(f, w(1404.56), 14))})`, overflow: 'hidden'}}>
        <div style={{background: '#B5172E', padding: '24px 28px', fontFamily: AF.head, fontWeight: 800, fontSize: 36, lineHeight: 1.15, color: P.white}}>Nature Computational Science</div>
        <div style={{padding: '22px 28px'}}>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 32, color: P.ink, opacity: ease(f, w(1406.6), 10)}}>2024 · Wang et al.</div>
          {Array.from({length: 9}, (_, i) => (
            <div key={i} style={{height: 12, borderRadius: 6, background: '#D5DBE8', width: i % 3 === 2 ? '60%' : '100%', marginTop: 18}} />
          ))}
        </div>
        <div style={{position: 'absolute', left: 120, top: 470, transform: `rotate(-12deg) scale(${pop(f, w(1408.72), 12)})`, border: `6px solid ${P.red}`, borderRadius: 12, padding: '6px 22px', fontFamily: AF.head, fontWeight: 800, fontSize: 44, color: P.red}}>ESTIMATE</div>
      </div>
      <div style={{position: 'absolute', left: 800, top: 80, opacity: ease(f, w(1409.6), 10), transform: `scale(${Math.min(1, pop(f, w(1409.6), 12))})`, transformOrigin: '0 50%'}}>
        <Tag bg={P.yellow} color={P.ink} size={46}>
          E-waste from generative AI
        </Tag>
      </div>
      <Pop f={f} at={w(1415.46)} x={1640} y={250} size={64} color={P.yellow}>
        by 2030
      </Pop>
      <Caption f={f} at={w(1413.69)}>
        Between 1.2 and 5 million tonnes of electronic waste
      </Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- 23:36 "roughly the weight of 500 Eiffel Towers... So far, everything... happens far away." */
export const C5Eiffel: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const away = ease(f, w(1421.62), w(1423.6) - w(1421.62));
  const globe = ease(f, w(1421.9), 24);
  return (
    <Bg c="#1E2E7A" c2="#0B1638" angle={180}>
      <AbsoluteFill style={{transform: `scale(${lerp(1, 0.08, away)})`, opacity: 1 - away}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {/* five million tonnes of scrap */}
          <rect x={170} y={860 - 500} width={230} height={500} fill={P.green} />
          {Array.from({length: 20}, (_, i) => (
            <rect key={i} x={178 + (i % 2) * 14} y={860 - 24 * (i + 1) + 4} width={200} height={14} rx={4} fill={mix(P.green, '#000000', 0.25)} />
          ))}
          <text x={285} y={330} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={46} fill={P.white}>
            5 million t
          </text>
          <text x={530} y={640} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={120} fill={P.white} opacity={ease(f, w(1417.78), 8)}>
            ≈
          </text>
          {Array.from({length: 500}, (_, i) => {
            const x = 660 + (i % 50) * 24, y = 330 + Math.floor(i / 50) * 56;
            const k = ease(f, w(1418.26) + i * 0.06, 6);
            return k > 0 ? (
              <g key={i} transform={`translate(${x},${y + 50}) scale(${k})`}>
                <Eiffel c={i === 0 ? P.yellow : '#E2B97A'} />
              </g>
            ) : null;
          })}
          <line x1={640} y1={884} x2={1860} y2={884} stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
        </svg>
        <div style={{position: 'absolute', left: 120, top: 80, opacity: ease(f, w(1416.38), 10)}}>
          <Tag bg={P.white} color={P.ink} size={40}>
            High end: 5 million tonnes
          </Tag>
        </div>
        <Pop f={f} at={w(1419.0)} x={1260} y={210} size={68} color={P.yellow}>
          ≈ 500 Eiffel Towers
        </Pop>
        <Src style={{position: 'absolute', left: 0, right: 0, top: 920, textAlign: 'center', opacity: ease(f, w(1419.6), 10)}}>1 Eiffel Tower ≈ 10,100 t · 500 × 10,100 t ≈ 5 million t · Wang et al. 2024</Src>
      </AbsoluteFill>
      {globe > 0 && (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: globe}}>
          <g transform={`translate(960,520) scale(${lerp(0.6, 2.6, globe)})`}>
            <Globe f={f} />
          </g>
          {[[760, 360], [1180, 470], [1020, 690], [840, 590]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={14 + Math.sin(f / 4 + i) * 3} fill={P.yellow} opacity={ease(f, w(1422.3) + i * 4, 8)} />
          ))}
        </svg>
      )}
      <Pop f={f} at={w(1423.28)} x={960} y={930} size={72}>
        <span style={{background: P.ink, borderRadius: 26, padding: '8px 30px'}}>…all far away</span>
      </Pop>
    </Bg>
  );
};

/* ---------------------------------------------------------------- 23:50 "Here's where it stops being far away." */
export const C5Here: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const drop = ease(f, 2, 14);
  const bounce = Math.abs(Math.sin(Math.max(0, f - 16) / 3)) * Math.max(0, 1 - (f - 16) / 18) * 30;
  return (
    <Bg c={P.sky} c2="#BDE6FF" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 600, 1.2, 0, -4], [1432.3, 960, 560, 1.0, 0, 0]]}>
        <World>
          <rect x={-400} y={760} width={2800} height={600} fill={P.grass} />
          <rect x={-400} y={830} width={2800} height={70} fill="#8D93A3" />
          {[[-100, 300], [700, 300], [1500, 300], [2300, 300]].map(([x], i) => (
            <Put key={i} x={x} y={520} s={1.4}>
              <Pylon />
            </Put>
          ))}
          <path d="M-100 440 Q300 500 700 440 T1500 440 T2300 440" stroke="#5B6B8C" strokeWidth={5} fill="none" />
          <Flow pts={[[-100, 440], [700, 440], [1500, 440], [2300, 440]]} f={f} c={P.yellow} n={10} r={7} speed={10} line={false} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Put key={i} x={60 + i * 300} y={700} s={1.5}>
              <House c={[P.red, P.orange, P.teal, P.purple][i % 4]} on={i === 3 ? 1 : 0} />
            </Put>
          ))}
          {/* the pin on one home */}
          <g transform={`translate(960,${lerp(-200, 560, drop) - bounce})`}>
            <path d="M0 0 C-50 -60 -60 -90 -60 -110 A60 60 0 0 1 60 -110 C60 -90 50 -60 0 0 Z" fill={P.red} />
            <circle cy={-110} r={24} fill={P.white} />
          </g>
        </World>
      </Cam>
      <Pop f={f} at={w(1430.45)} x={960} y={190} size={96} color={P.navy}>
        Close to home
      </Pop>
    </Bg>
  );
};

export const SCENES_5: Record<string, React.FC<AnimProps>> = {
  c5sand: C5Sand,
  c5wafer: C5Wafer,
  c5island: C5Island,
  c5tsmc: C5Tsmc,
  c5water: C5Water,
  c5drought: C5Drought,
  c5trucks: C5Trucks,
  c5metals: C5Metals,
  c5gallium: C5Gallium,
  c5copper: C5Copper,
  c5cobalt: C5Cobalt,
  c5honest: C5Honest,
  c5waste: C5Waste,
  c5study: C5Study,
  c5eiffel: C5Eiffel,
  c5here: C5Here,
};
