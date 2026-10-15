// Chapter 6, "Who pays?" (1435.6–1669.9 s on the film): new grid costs spread over every bill, PJM and its capacity
// auction ($28.92 → $269.92 per MW-day), an Ohio family's bill, land and power lines in Maryland, eminent domain, the
// hum next door, secret deals, Virginia's tax break ($928.6M, FY2023, JLARC), jobs, Loudoun's property tax, who wins
// and who pays, the pattern, and the other side. The four `board map` scenes of the old cut stay where they were.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, random, staticFile} from 'remotion';
import {geoAlbersUsa, geoPath} from 'd3-geo';
import type {Feature, FeatureCollection} from 'geojson';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';
import {
  Arrow, Bg, Bill, Bolt, Cam, CamKey, Caption, Clock, Coin, Counter, Crowd, DataCentre, Doc, Drop, Flow, Gavel, Globe, House,
  Label, Laptop, Meter, NuclearPlant, Person, Pop, PowerPlant, Put, Pylon, Rack, SolarPanel, Sun, Timeline, WindTurbine, World,
  camAt, shade,
} from './lib';

/* ================================================================== helpers */
type Pt = [number, number];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Where a world point lands on screen under a camera (ignores turn and tilt). */
const scr = (keys: CamKey[], t: number, x: number, y: number): Pt => {
  const [, cx, cy, z] = camAt(t, keys);
  return [960 + (x - cx) * z, 540 + (y - cy) * z];
};
const ptsStr = (a: Pt[]) => a.map((p) => p.join(',')).join(' ');
/** The first fraction k of a polyline. */
const partial = (pts: Pt[], k: number): Pt[] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = seg.reduce((a, b) => a + b, 0) * clamp01(k);
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < seg.length; i++) {
    if (d >= seg[i]) {
      out.push(pts[i + 1]);
      d -= seg[i];
    } else {
      const q = d / seg[i];
      out.push([lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]);
      break;
    }
  }
  return out;
};
/** A label drawn inside a world SVG, so it moves and scales with the camera. */
const WTag: React.FC<{x: number; y: number; text: string; bg?: string; color?: string; size?: number; k?: number}> = ({x, y, text, bg = P.white, color = P.ink, size = 40, k = 1}) => {
  if (k <= 0) return null;
  const w = text.length * size * 0.6 + size * 1.3;
  const h = size * 1.7;
  return (
    <g transform={`translate(${x},${y}) scale(${Math.min(1.1, k)})`} opacity={Math.min(1, k)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={bg} style={{filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.25))'}} />
      <text y={size * 0.36} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};
/** A screen-space tag pinned to a point (centred above it). */
const At: React.FC<{p: Pt; k: number; children: React.ReactNode}> = ({p, k, children}) =>
  k > 0 ? <div style={{position: 'absolute', left: p[0], top: p[1], transform: `translate(-50%,-100%) scale(${Math.min(1.1, k)})`, transformOrigin: '50% 100%', opacity: Math.min(1, k)}}>{children}</div> : null;
/** Reveals its children from the ground up, with a yellow build line on the edge. */
const Rise: React.FC<{id: string; k: number; x0: number; x1: number; ground: number; h: number; children: React.ReactNode}> = ({id, k, x0, x1, ground, h, children}) => {
  if (k <= 0) return null;
  const top = ground - h * k;
  return (
    <g>
      <clipPath id={id}>
        <rect x={x0} y={top} width={x1 - x0} height={h * k + 400} />
      </clipPath>
      <g clipPath={`url(#${id})`}>{children}</g>
      {k < 1 && <rect x={x0} y={top - 4} width={x1 - x0} height={8} rx={4} fill={P.yellow} />}
    </g>
  );
};
const Tree: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = P.green}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-6} y={-30} width={12} height={32} fill="#7A4E2D" />
    <circle cy={-54} r={34} fill={c} />
  </g>
);
const Barn: React.FC = () => (
  <g>
    <rect x={-80} y={-60} width={160} height={120} fill={P.red} />
    <path d="M-94 -58 L-60 -112 L60 -112 L94 -58 Z" fill={shade(P.red, 0.7)} />
    <rect x={-30} y={0} width={60} height={60} fill={P.cream} />
    <path d="M-30 0 L30 60 M30 0 L-30 60" stroke={P.red} strokeWidth={6} />
    <rect x={-16} y={-92} width={32} height={24} fill={P.cream} />
  </g>
);
const Capitol: React.FC<{c?: string}> = ({c = '#E8EEF9'}) => (
  <g>
    <rect x={-110} y={0} width={220} height={70} fill={c} />
    {[-90, -60, -30, 0, 30, 60, 90].map((x) => (
      <rect key={x} x={x - 6} y={8} width={12} height={56} fill={shade(c, 0.8)} />
    ))}
    <rect x={-122} y={66} width={244} height={14} fill={shade(c, 0.75)} />
    <path d="M-120 2 L0 -26 L120 2 Z" fill={shade(c, 0.9)} />
    <rect x={-46} y={-56} width={92} height={32} fill={c} />
    <path d="M-46 -56 A46 46 0 0 1 46 -56 Z" fill={c} />
    <rect x={-3} y={-128} width={6} height={28} fill={P.ink} />
  </g>
);
const School: React.FC = () => (
  <g>
    <rect x={-150} y={-50} width={300} height={110} fill="#F2C14E" />
    <rect x={-40} y={-110} width={80} height={60} fill="#F2C14E" />
    <path d="M-50 -108 L0 -150 L50 -108 Z" fill={P.red} />
    <circle cy={-82} r={16} fill={P.white} />
    {[-120, -80, 50, 90].map((x) => (
      <rect key={x} x={x} y={-30} width={30} height={30} fill="#9BD3FF" />
    ))}
    <rect x={-20} y={10} width={40} height={50} fill={shade(P.red, 0.8)} />
  </g>
);
const Substation: React.FC = () => (
  <g>
    <path d="M-130 60 V-40 H130 V60" stroke="#D5DBE6" strokeWidth={5} fill="none" strokeDasharray="8 7" />
    <path d="M-110 60 V-90 M110 60 V-90 M-110 -90 H110" stroke="#7C8AA8" strokeWidth={8} fill="none" />
    {[-60, 0, 60].map((x) => (
      <g key={x}>
        <rect x={x - 24} y={-6} width={48} height={66} rx={6} fill="#8E9AB3" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={x - 18 + i * 14} y={-32} width={7} height={26} rx={3} fill="#E8EEF9" />
        ))}
      </g>
    ))}
  </g>
);
/** A pen whose tip is at 0,0. */
const Pen: React.FC = () => (
  <g>
    <path d="M0 0 L6 -24 L130 -160 L148 -144 L24 -8 Z" fill="#20263F" />
    <path d="M0 0 L6 -24 L24 -8 Z" fill={P.yellow} />
    <path d="M118 -148 L130 -160 L148 -144 L136 -132 Z" fill={P.red} />
  </g>
);
const Bubble: React.FC<{text: string; w?: number; c?: string; color?: string; size?: number}> = ({text, w = 200, c = P.white, color = P.ink, size = 40}) => (
  <g>
    <rect x={-w / 2} y={-48} width={w} height={96} rx={30} fill={c} />
    <path d="M-30 44 L-50 86 L0 46 Z" fill={c} />
    <text y={size * 0.36} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={size} fill={color}>
      {text}
    </text>
  </g>
);
/** Low, wide rings: the hum. */
const Rings: React.FC<{x: number; y: number; f: number; k: number; n?: number; gap?: number; max?: number; c?: string; sw?: number; speed?: number}> = ({x, y, f, k, n = 7, gap = 170, max = 1200, c = P.sky, sw = 10, speed = 5}) =>
  k > 0 ? (
    <g>
      {Array.from({length: n}, (_, i) => {
        const r = (((f * speed + i * gap) % max) + max) % max;
        return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={c} strokeWidth={sw} opacity={(1 - r / max) * 0.7 * k} />;
      })}
    </g>
  ) : null;
/** A small worker in a hard hat. */
const Worker: React.FC<{c?: string; hat?: boolean}> = ({c = P.orange, hat = true}) => (
  <g>
    <rect x={-10} y={-4} width={20} height={26} rx={8} fill={c} />
    <circle cy={-14} r={9} fill="#C98E64" />
    {hat && <path d="M-11 -16 A11 11 0 0 1 11 -16 Z" fill={P.yellow} />}
  </g>
);
/** A map pin with its tip at 0,0. */
const MapPin: React.FC<{c?: string}> = ({c = P.red}) => (
  <g>
    <path d="M0 0 C-8 -18 -26 -30 -26 -50 A26 26 0 0 1 26 -50 C26 -30 8 -18 0 0 Z" fill={c} />
    <circle cy={-50} r={10} fill={shade(c, 0.5)} />
  </g>
);
/** Iso box (for the iso scenes). */
const isoP = (x: number, y: number, z = 0, ox = 960, oy = 260): Pt => [ox + (x - y) * 0.87, oy + (x + y) * 0.5 - z];
const IsoBox: React.FC<{x: number; y: number; w: number; d: number; h: number; top: string; side: string; ox?: number; oy?: number}> = ({x, y, w, d, h, top, side, ox, oy}) => {
  const q = (a: number, b: number, z: number) => isoP(a, b, z, ox, oy);
  return (
    <g>
      <polygon points={ptsStr([q(x, y + d, 0), q(x + w, y + d, 0), q(x + w, y + d, h), q(x, y + d, h)])} fill={shade(side, 0.82)} />
      <polygon points={ptsStr([q(x + w, y, 0), q(x + w, y + d, 0), q(x + w, y + d, h), q(x + w, y, h)])} fill={shade(side, 0.64)} />
      <polygon points={ptsStr([q(x, y, h), q(x + w, y, h), q(x + w, y + d, h), q(x, y + d, h)])} fill={top} />
    </g>
  );
};

/* ================================================================== the US map (pre-projected Albers, 975 × 610) */
const geoCache: Record<string, FeatureCollection> = {};
const useGeo = (name: string) => {
  const [g, setG] = useState<FeatureCollection | null>(geoCache[name] ?? null);
  const [h] = useState(() => (geoCache[name] ? null : delayRender(`ch6 geo ${name}`)));
  useEffect(() => {
    if (geoCache[name]) {
      if (!g) setG(geoCache[name]);
      if (h !== null) continueRender(h);
      return;
    }
    const load = async (n = 0): Promise<void> => {
      try {
        const r = await fetch(staticFile(`dc/geo/${name}.json`));
        geoCache[name] = await r.json();
        setG(geoCache[name]);
        if (h !== null) continueRender(h);
      } catch (e) {
        if (n < 6) return new Promise((res) => setTimeout(() => res(load(n + 1)), 500 * 2 ** n));
        throw e;
      }
    };
    load();
  }, [name, h, g]);
  return g;
};
type Shape = {name: string; d: string; c: Pt; a: number};
const shapeCache: Record<string, Shape[]> = {};
const planar = geoPath();
const shapes = (key: string, g: FeatureCollection | null): Shape[] => {
  if (!g) return [];
  if (!shapeCache[key])
    shapeCache[key] = g.features.map((ft) => ({
      name: String((ft.properties as {name: string}).name),
      d: planar(ft as Feature) ?? '',
      c: planar.centroid(ft as Feature) as Pt,
      a: planar.area(ft as Feature),
    }));
  return shapeCache[key];
};
const albers = geoAlbersUsa().scale(1300).translate([487.5, 305]);
// PJM's footprint: all or part of these 13 states, plus D.C.
const PJM = ['Illinois', 'Michigan', 'Indiana', 'Kentucky', 'Tennessee', 'Ohio', 'West Virginia', 'North Carolina', 'Virginia', 'Pennsylvania', 'Maryland', 'District of Columbia', 'Delaware', 'New Jersey'];
const MS = 2.4; // the map's scale in world units

/* ================================================================== 1435.6 "someone has to build the new power plants. The new power lines. The new substations." */
export const C6Grid: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const G = 760;
  const keys: CamKey[] = [[t0, 1640, 600, 1.2], [1437.9, 1560, 590, 1.05], [1439.4, 1150, 560, 0.8, 6, 3], [1442.4, 1080, 560, 0.74, 0, 0]];
  const plug = ease(f, w(1436.95), 10);
  const live = ease(f, w(1437.8), 8);
  const plant = ease(f, w(1439.35), 20);
  const sub = ease(f, w(1441.8), 16);
  const pyl = [520, 760, 980];
  const pk = pyl.map((_, i) => pop(f, w(1440.75) + i * 4, 12));
  const top = (x: number): Pt => [x, G - 180 - 90];
  const wire = (a: Pt, b: Pt) => `M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + 40} ${b[0]} ${b[1]}`;
  const route: Pt[] = [[330, G - 150], top(520), top(760), top(980), [1180, G - 110], [1390, G - 60], [1450, G - 60]];
  return (
    <Bg c={P.sky} c2="#BDE6FF" angle={180}>
      <Cam f={f} t0={t0} keys={keys}>
        <World w={2400} h={1080}>
          <rect x={-600} y={G} width={3400} height={700} fill="#3FAE5A" />
          <rect x={-600} y={G} width={3400} height={18} fill="#2E8F48" />
          {/* the new power plant */}
          <Rise id="c6plant" k={plant} x0={100} x1={450} ground={G} h={520}>
            <g transform={`translate(260,${G - 60 * 1.8}) scale(1.8)`}>
              <PowerPlant f={f} smoke={plant > 0.95 ? 1 : 0} />
            </g>
          </Rise>
          {/* the new lines */}
          {pyl.map((x, i) =>
            pk[i] > 0 ? (
              <g key={x} transform={`translate(${x},${G}) scale(${Math.min(1, pk[i])}) translate(0,${-180}) scale(1.5)`}>
                <Pylon c="#4A5A7E" />
              </g>
            ) : null,
          )}
          {pk[2] > 0.5 && (
            <g stroke="#2B3150" strokeWidth={4} fill="none" opacity={ease(f, w(1441.0), 8)}>
              <path d={wire([330, G - 150], top(520))} />
              <path d={wire(top(520), top(760))} />
              <path d={wire(top(760), top(980))} />
              {sub > 0.5 && <path d={wire(top(980), [1180, G - 110])} />}
            </g>
          )}
          {/* the new substation */}
          <Rise id="c6sub" k={sub} x0={1030} x1={1330} ground={G} h={200}>
            <g transform={`translate(1180,${G - 72}) scale(1.2)`}>
              <Substation />
            </g>
          </Rise>
          {/* the plug and the data centre */}
          <rect x={1350} y={G - 90} width={50} height={70} rx={8} fill="#5B6B8C" />
          <path d={`M${1400 + 50 * (1 - plug)} ${G - 60} H1460`} stroke={P.ink} strokeWidth={14} strokeLinecap="round" />
          <rect x={1392 + 50 * (1 - plug)} y={G - 76} width={30} height={32} rx={6} fill={P.ink} />
          <g transform={`translate(1700,${G - 120}) scale(2)`}>
            <DataCentre f={f} busy={live > 0.5 ? 1 : 0} />
          </g>
          {live > 0 && live < 1 && <circle cx={1375} cy={G - 55} r={40 + 160 * live} fill="none" stroke={P.yellow} strokeWidth={10} opacity={1 - live} />}
          {sub > 0.6 && <Flow pts={route} f={f} c={P.yellow} n={8} r={10} speed={9} line={false} />}
          {/* labels */}
          <WTag x={1700} y={G + 90} text="Giant data centre" bg={P.ink} color={P.white} size={44} k={pop(f, w(1436.0), 12)} />
          <WTag x={270} y={G + 90} text="New power plant" size={46} k={pop(f, w(1439.5), 12)} />
          <WTag x={760} y={G + 90} text="New power lines" size={46} k={pop(f, w(1440.9), 12)} />
          <WTag x={1180} y={G + 90} text="New substation" size={46} k={pop(f, w(1441.9), 12)} />
        </World>
      </Cam>
      <Pop f={f} at={w(1438.2)} x={960} y={130} size={64} color={P.navy}>
        <span style={{background: P.white, borderRadius: 30, padding: '10px 34px'}}>Someone has to build…</span>
      </Pop>
    </Bg>
  );
};

/* ================================================================== "the cost of all that gets spread across everyone connected to the grid. Including you." */
export const C6Spread: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const rows = 4, cols = 7;
  const houses = Array.from({length: rows * cols}, (_, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const s = 0.55 + r * 0.12;
    return {x: 960 + (c - 3) * (170 + r * 34), y: 470 + r * 112, s, i};
  });
  const you = houses[rows * cols - 4];
  const pile: Pt = [960, 300];
  const keys: CamKey[] = [[t0, 960, 540, 1], [1448.55, 960, 540, 1], [1449.45, you.x, you.y - 40, 1.8]];
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={keys}>
        <World>
          {/* the wires: one trunk, a line along each street */}
          <path d={`M960 ${pile[1] + 40} V${houses[(rows - 1) * cols].y - 80}`} stroke="#3A4F8F" strokeWidth={8} />
          {Array.from({length: rows}, (_, r) => {
            const a = houses[r * cols], b = houses[r * cols + cols - 1];
            return <line key={r} x1={a.x} y1={a.y - 80 * a.s - 14} x2={b.x} y2={b.y - 80 * b.s - 14} stroke="#3A4F8F" strokeWidth={5} />;
          })}
          <Flow pts={[[960, pile[1] + 40], [960, houses[(rows - 1) * cols].y - 80]]} f={f} c={P.yellow} n={5} r={9} speed={8} line={false} o={ease(f, w(1445.8), 8)} />
          {houses.map((h) => (
            <g key={h.i} transform={`translate(${h.x},${h.y}) scale(${h.s})`}>
              <House c={[P.red, P.orange, P.teal, P.purple, P.pink][h.i % 5]} on={f > w(1446.6) + h.i * 0.6 ? 1 : 0} />
            </g>
          ))}
          {/* the pile of cost, then a coin to every home */}
          {Array.from({length: 7}, (_, j) => {
            const left = 1 - ease(f, w(1445.9) + 20, 20) * (j / 7);
            return ease(f, w(1444.1) + j * 2, 6) > 0 ? (
              <g key={j} transform={`translate(${pile[0]},${pile[1] - j * 16}) scale(${0.9 * left})`} opacity={ease(f, w(1444.1) + j * 2, 6)}>
                <Coin />
              </g>
            ) : null;
          })}
          {houses.map((h) => {
            const s0 = w(1445.9) + h.i * 1.1;
            const k = ease(f, s0, 16);
            if (k <= 0) return null;
            const x = lerp(pile[0], h.x, k), y = lerp(pile[1], h.y - 110 * h.s, k) - 140 * Math.sin(Math.PI * k);
            return (
              <g key={h.i} transform={`translate(${x},${y}) scale(${0.3 * h.s + 0.1})`}>
                <Coin />
              </g>
            );
          })}
          {/* you */}
          {f > w(1448.7) && (
            <g>
              <circle cx={you.x} cy={you.y - 20} r={100 + 8 * Math.sin(f / 3)} fill="none" stroke={P.yellow} strokeWidth={8} opacity={ease(f, w(1448.8), 6)} />
              <Put x={you.x + 135} y={you.y - 60} s={0.5} f={f} at={w(1448.9)}>
                <Bill total="↑" hot={1} />
              </Put>
            </g>
          )}
          <WTag x={you.x} y={you.y - 150} text="You" bg={P.yellow} size={44} k={pop(f, w(1448.85), 10)} />
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', opacity: ease(f, w(1444.1), 10) * (1 - ease(f, w(1448.7), 8))}}>
        <Tag bg={P.yellow} color={P.ink} size={38}>The cost of new plants, lines and substations</Tag>
      </div>
      <Caption f={f} at={w(1445.9)} until={w(1448.7)}>Often spread across everyone connected to the grid</Caption>
    </Bg>
  );
};

/* ================================================================== PJM: 65 million people, 13 states + D.C., Data Center Alley */
export const C6PJM: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const g = useGeo('states');
  const va = useGeo('va-counties');
  const t = t0 + f / 24;
  const keys: CamKey[] = [[t0, 1170, 720, 0.76], [1450.4, 1170, 720, 0.76], [1452.4, 1760, 610, 1.2], [1461.1, 1760, 610, 1.2], [1462.6, 1959, 640, 4.4]];
  const z = camAt(t, keys)[3];
  const sw = 1.8 / (MS * z);
  const st = shapes('states', g);
  const counties = shapes('va', va);
  const hl = ease(f, w(1453.3), 12);
  const order = st.filter((s) => PJM.includes(s.name)).sort((a, b) => a.c[0] - b.c[0]);
  const lights = ease(f, w(1454.3), 10);
  const zoomIn = ease(f, w(1461.2), 20);
  const dc = st.find((s) => s.name === 'District of Columbia');
  const lou = albers([-77.64, 39.09]) as Pt;
  const louW: Pt = [lou[0] * MS, lou[1] * MS];
  const louS = scr(keys, t, louW[0], louW[1]);
  const dcS = dc ? scr(keys, t, dc.c[0] * MS, dc.c[1] * MS) : ([0, 0] as Pt);
  return (
    <Bg c={P.night}>
      <Cam f={f} t0={t0} keys={keys}>
        <World w={2400} h={1500}>
          <g transform={`scale(${MS})`}>
            {st.map((s) => (
              <path key={s.name} d={s.d} fill={PJM.includes(s.name) ? lerp(0, 1, hl) > 0 ? '#2A4590' : '#22346E' : '#1C2A5C'} stroke="#4A60A0" strokeWidth={sw} />
            ))}
            {order.map((s, j) => {
              const k = pop(f, w(1458.2) + j * 2.2, 10);
              return <path key={s.name} d={s.d} fill={k > 0 ? P.yellow : P.sky} fillOpacity={k > 0 ? Math.min(1, k) * (1 - 0.2 * zoomIn) : 0.35 * hl} stroke={k > 0 ? '#B38600' : 'none'} strokeWidth={sw} />;
            })}
            {/* lights on in every PJM state */}
            {lights > 0 &&
              order.map((s) => {
                const n = Math.max(1, Math.min(6, Math.round(Math.sqrt(s.a) / 8)));
                const rr = Math.sqrt(s.a) * 0.22;
                return Array.from({length: n}, (_, i) => {
                  const on = (Math.floor(f / 6 + random(`b${s.name}${i}`) * 9) % 3) !== 0;
                  return <circle key={`${s.name}${i}`} cx={s.c[0] + (random(`x${s.name}${i}`) - 0.5) * 2 * rr} cy={s.c[1] + (random(`y${s.name}${i}`) - 0.5) * 2 * rr} r={2.2} fill={P.white} opacity={(on ? 0.95 : 0.3) * lights * (1 - zoomIn)} />;
                });
              })}
            {/* Virginia's counties and Loudoun when we fly in */}
            {zoomIn > 0 &&
              counties.map((c) => <path key={c.name + c.c[0]} d={c.d} fill={c.name === 'Loudoun' ? P.pink : 'none'} fillOpacity={c.name === 'Loudoun' ? ease(f, w(1461.6), 10) : 0} stroke="#B38600" strokeWidth={sw * 0.6} opacity={zoomIn} />)}
            {dc && f > w(1460.6) && <circle cx={dc.c[0]} cy={dc.c[1]} r={4 + 2 * Math.sin(f / 3)} fill="none" stroke={P.pink} strokeWidth={sw * 1.6} />}
          </g>
        </World>
      </Cam>
      <Label f={f} at={w(1452.5)} title="PJM" sub="the grid operator for the eastern US" bg={P.yellow} />
      <div style={{position: 'absolute', right: 90, top: 80, textAlign: 'right', opacity: ease(f, w(1455.9), 8) * (1 - zoomIn)}}>
        <Counter f={f} start={w(1455.9)} dur={20} to={65} prefix="~" suffix=" million" size={100} color={P.yellow} />
        <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 40, color: P.white, marginTop: 6}}>people keep their lights on</div>
      </div>
      <At p={[dcS[0] + 40, dcS[1] + 110]} k={pop(f, w(1460.6), 10) * (1 - zoomIn)}>
        <Tag bg={P.pink} color={P.white} size={30}>+ Washington, D.C.</Tag>
      </At>
      <Caption f={f} at={w(1458.2)} until={w(1461.2)} source="PJM · all or part of each state">
        13 states + Washington, D.C.
      </Caption>
      {f > w(1461.6) && (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <Put x={louS[0]} y={louS[1]} s={1.3} f={f} at={w(1461.6)}>
            <MapPin c={P.red} />
          </Put>
        </svg>
      )}
      <At p={[louS[0], louS[1] - 90]} k={pop(f, w(1462.2), 10)}>
        <div style={{textAlign: 'center'}}>
          <Tag bg={P.white} color={P.ink} size={44}>Data Center Alley</Tag>
          <Note style={{marginTop: 10}} size={22}>Loudoun County, Northern Virginia</Note>
        </div>
      </At>
    </Bg>
  );
};

/* ================================================================== "Every year, PJM holds an auction to make sure there will be enough power plants available in the future." */
export const C6Auction: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const B = 820;
  const hit = (() => {
    const d = f - w(1465.9);
    return d < 0 ? 0 : d < 4 ? d / 4 : d < 10 ? 1 - (d - 4) / 6 : 0;
  })();
  const bidders: {x: number; c: string; el: React.ReactNode}[] = [
    {x: 200, c: P.orange, el: <g transform={`translate(0,${-60 * 0.95}) scale(0.95)`}><PowerPlant f={f} /></g>},
    {x: 430, c: P.purple, el: <g transform={`translate(0,${-96 * 0.8}) scale(0.8)`}><NuclearPlant f={f} /></g>},
    {x: 650, c: P.teal, el: <g transform={`translate(0,${-160}) scale(1)`}><WindTurbine f={f} /></g>},
    {x: 860, c: P.blue, el: <g transform="translate(0,-60)"><SolarPanel /></g>},
    {x: 1070, c: P.red, el: <g transform={`translate(0,${-60 * 0.95}) scale(0.95)`}><PowerPlant f={f + 20} /></g>},
  ];
  const box = {x0: 1370, x1: 1750, need: B - 5 * 66};
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 900, 560, 1.1, -10, 6], [1467.2, 1000, 560, 0.98, 0, 3], [1470.2, 1120, 560, 1.03, 8, 0]]}>
        <World>
          <rect x={-300} y={B} width={2500} height={500} fill="#1E1446" />
          {/* the auctioneer */}
          <g transform="translate(640,330)">
            <path d="M-130 -40 H130 L100 120 H-100 Z" fill="#4B3A9A" />
            <rect x={-150} y={-60} width={300} height={30} rx={10} fill="#6B5AC0" />
            <text y={60} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={54} fill={P.yellow}>PJM</text>
            <g transform="translate(160,-120) scale(0.8)">
              <Gavel hit={hit} />
            </g>
          </g>
          {hit > 0 && <circle cx={760} cy={240} r={30 + 80 * hit} fill="none" stroke={P.yellow} strokeWidth={6} opacity={hit} />}
          {/* the bidders: power plants, paddles up */}
          {bidders.map((b, i) => {
            const k = pop(f, w(1464.1) + i * 3, 12);
            const up = ease(f, w(1466.2) + i * 4, 8);
            return k > 0 ? (
              <g key={i} transform={`translate(${b.x},${B}) scale(${Math.min(1, k)})`}>
                {b.el}
                <g transform={`translate(70,${-40 - 90 * up + Math.sin(f / 5 + i) * 6 * up})`}>
                  <rect x={-3} y={0} width={6} height={70} fill="#C9D2E6" />
                  <rect x={-46} y={-50} width={92} height={54} rx={10} fill={b.c} />
                  <text y={-12} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={P.white}>MW</text>
                </g>
              </g>
            ) : null;
          })}
          {/* the future: the power that will be needed, filled by promised plants */}
          <g opacity={ease(f, w(1467.3), 10)}>
            <rect x={box.x0} y={box.need - 60} width={box.x1 - box.x0} height={B - box.need + 60} fill="rgba(255,255,255,0.06)" stroke="#9C8CFF" strokeWidth={4} strokeDasharray="14 10" rx={12} />
            <line x1={box.x0 - 20} x2={box.x1 + 20} y1={box.need} y2={box.need} stroke={P.yellow} strokeWidth={6} strokeDasharray="20 12" />
          </g>
          {bidders.map((b, i) => {
            const k = ease(f, w(1467.6) + i * 5, 14);
            if (k <= 0) return null;
            const x = lerp(b.x - 60, box.x0 + 20, k), y = lerp(B - 220, B - (i + 1) * 66, k) - 120 * Math.sin(Math.PI * k);
            return <rect key={i} x={x} y={y} width={box.x1 - box.x0 - 40} height={58} rx={10} fill={b.c} />;
          })}
          <WTag x={(box.x0 + box.x1) / 2} y={box.need - 110} text="Power needed in future" size={36} k={pop(f, w(1467.4), 12)} />
          <WTag x={(box.x0 + box.x1) / 2} y={B + 70} text="Enough ✓" bg={P.green} color={P.white} size={40} k={pop(f, w(1469.2), 12)} />
        </World>
      </Cam>
      <Label f={f} at={w(1464.0)} title="Every year: an auction" sub="power plants bid to be available in the future" bg={P.yellow} />
    </Bg>
  );
};

/* ================================================================== "the price in that auction jumped from about $29 to about $270. Almost ten times higher in one year." */
const PX = 560 / 269.92;
export const C6Price: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const B = 780;
  const small = 28.92 * PX;
  const k1 = ease(f, w(1473.3), 12);
  const k2 = ease(f, w(1474.7), w(1476.4) - w(1474.7));
  const v2 = lerp(28.92, 269.92, k2);
  const stack = f - w(1477.4);
  return (
    <Bg c="#1E1650">
      <Cam f={f} t0={t0} keys={[[t0, 1000, 580, 1.06, -6, 4], [1476.8, 1000, 540, 0.98, 0, 0], [1479.85, 1080, 540, 1.0, 5, 0]]}>
        <World>
          <rect x={-200} y={B} width={2400} height={8} fill="rgba(255,255,255,0.4)" />
          {/* 2024/25 */}
          <rect x={430} y={B - small * k1} width={260} height={small * k1} rx={10} fill={P.sky} />
          <text x={560} y={B - small - 26} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={60} fill={P.white} opacity={ease(f, w(1473.4), 8)}>$28.92</text>
          <text x={560} y={B + 60} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={40} fill={P.white} opacity={ease(f, 0, 10)}>2024/25</text>
          {/* 2025/26 */}
          {k2 > 0 && <rect x={930} y={B - v2 * PX} width={260} height={v2 * PX} rx={10} fill={P.orange} />}
          {k2 > 0 && (
            <text x={1060} y={B - v2 * PX - 26} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={72} fill={P.yellow}>
              ${v2.toFixed(2)}
            </text>
          )}
          <text x={1060} y={B + 60} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={40} fill={P.white} opacity={ease(f, 0, 10)}>2025/26</text>
          <text x={1060} y={B + 104} textAnchor="middle" fontFamily="Poppins" fontWeight={500} fontSize={30} fill="rgba(255,255,255,0.75)" opacity={ease(f, w(1475.2), 8)}>set at the July 2024 auction</text>
          <Arrow a={[700, B - small - 90]} b={[915, B - 520]} f={f} at={w(1474.7)} c={P.yellow} wpx={8} />
          {/* the small bar, stacked until it matches */}
          {stack > 0 &&
            Array.from({length: 10}, (_, i) => {
              const k = ease(f, w(1477.4) + i * 2.5, 6);
              const h = (i < 9 ? 1 : 0.33) * small;
              return k > 0 ? <rect key={i} x={1290} y={B - i * small - h} width={200} height={h - 4} rx={6} fill={P.sky} opacity={k} stroke="#0B1638" strokeWidth={3} /> : null;
            })}
          {stack > 0 && (
            <text x={1660} y={B - 300} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={120} fill={P.yellow} opacity={ease(f, w(1477.9), 8)}>
              ×9.3
            </text>
          )}
        </World>
      </Cam>
      <Label f={f} at={2} title="PJM capacity price" sub="dollars per megawatt-day" bg={P.white} />
      <Caption f={f} at={w(1477.5)} source="PJM 2025/26 Base Residual Auction results, July 2024">
        Almost ten times higher in one year
      </Caption>
    </Bg>
  );
};

/* ================================================================== "PJM's independent market monitor said data center demand was a major reason. And in 2025..." */
export const C6Monitor: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const B = 860;
  const mv = ease(f, w(1480.6), w(1481.9) - w(1480.6));
  const lx = lerp(1560, 770, mv) + Math.sin(f / 9) * 8 * mv, ly = lerp(420, 560, mv);
  const keys: CamKey[] = [[t0, 960, 540, 1], [1485.4, 960, 540, 1], [1486.8, 960, 940, 0.92]];
  return (
    <Bg c="#1E1650">
      <Cam f={f} t0={t0} keys={keys}>
        <World w={1920} h={1600}>
          <rect x={-200} y={B} width={2400} height={8} fill="rgba(255,255,255,0.4)" />
          <rect x={640} y={B - 600} width={260} height={600} rx={10} fill={P.orange} />
          <text x={770} y={B - 626} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={72} fill={P.yellow}>$269.92</text>
          {/* the monitor's magnifying glass shows what is inside the price */}
          <clipPath id="c6lens">
            <circle cx={lx} cy={ly} r={160} />
          </clipPath>
          <g clipPath="url(#c6lens)">
            <rect x={lx - 170} y={ly - 170} width={340} height={340} fill="#2A1B5E" />
            {[-80, 0, 80].map((dy, i) => (
              <g key={i} transform={`translate(${lx + (i - 1) * 30},${ly + dy}) scale(0.5)`}>
                <DataCentre f={f + i * 9} busy={1} />
              </g>
            ))}
          </g>
          <circle cx={lx} cy={ly} r={160} fill="none" stroke="#E8EEF9" strokeWidth={22} />
          <rect x={lx + 120} y={ly + 100} width={40} height={190} rx={18} fill="#8E9AB3" transform={`rotate(-40 ${lx + 140} ${ly + 110})`} />
          <WTag x={lx + 430} y={ly - 120} text="Data-centre demand" bg={P.white} size={42} k={pop(f, w(1482.6), 12)} />
          <g transform={`translate(${lx + 430},${ly + 10}) rotate(-6)`} opacity={ease(f, w(1484.0), 6)}>
            <rect x={-230} y={-50} width={460} height={100} rx={14} fill="none" stroke={P.red} strokeWidth={8} />
            <text y={20} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={56} fill={P.red}>A MAJOR REASON</text>
          </g>
          {/* and in 2025: bills */}
          {Array.from({length: 6}, (_, i) => (
            <g key={i}>
              <g transform={`translate(${310 + i * 260},1340) scale(1.2)`}>
                <House c={[P.red, P.teal, P.orange, P.purple, P.pink, P.blue][i]} on={1} />
              </g>
              <Put x={310 + i * 260} y={1180} s={0.55} f={f} at={w(1486.8) + i * 3}>
                <Bill total="↑" hot={1} />
              </Put>
            </g>
          ))}
          <WTag x={960} y={1010} text="2025: bills go up" bg={P.yellow} size={48} k={pop(f, w(1485.6), 12)} />
        </World>
      </Cam>
      <AbsoluteFill style={{opacity: 1 - ease(f, w(1485.3), 8)}}>
        <Label f={f} at={w(1480.0)} title="PJM's Independent Market Monitor" sub="Monitoring Analytics · watches the market" bg={P.white} />
      </AbsoluteFill>
    </Bg>
  );
};

/* ================================================================== the bill goes up; a family in Ohio who has never used a chatbot */
export const C6Family: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const keys: CamKey[] = [[t0, 840, 640, 2.9], [1494.6, 840, 640, 2.9], [1496.1, 1010, 560, 0.95, -4, 0], [1502.2, 1060, 560, 0.95, 4, 0], [1504.6, 1000, 610, 1.1, 0, 0]];
  const circ = ease(f, w(1492.6), 22);
  const per = 2 * Math.PI * Math.sqrt((96 * 96 + 36 * 36) / 2);
  const ang = -Math.PI / 2 + circ * Math.PI * 2;
  const pen: Pt = [96 * Math.cos(ang), 79 + 36 * Math.sin(ang)];
  const penIn = ease(f, w(1492.3), 8) * (1 - ease(f, w(1494.3), 8));
  const blink = Math.floor(f / 8) % 2;
  const wireP: Pt[] = [[900, 610], [1220, 420], [1380, 470], [1560, 600], [1700, 640]];
  return (
    <Bg c="#1B2C6B" c2="#2A1B5E" angle={180}>
      <Cam f={f} t0={t0} keys={keys}>
        <World w={2000} h={1100}>
          {/* outside: hills, a pole, far-off data centres */}
          <path d="M1200 860 Q1500 600 1900 640 Q2100 660 2300 700 V1100 H1200 Z" fill="#23315F" />
          <rect x={-400} y={860} width={2800} height={300} fill="#2E5E3E" />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${1660 + i * 120},${640 - i * 14}) scale(0.42)`}>
              <DataCentre f={f + i * 7} busy={1} />
            </g>
          ))}
          <rect x={1374} y={470} width={12} height={390} fill="#7A4E2D" />
          <polyline points={ptsStr(wireP.slice(1))} stroke="#0B1638" strokeWidth={5} fill="none" />
          {/* the house, cut away */}
          <path d="M340 335 L800 120 L1260 335 Z" fill={P.orange} />
          <rect x={380} y={330} width={840} height={530} fill="#FFE7C2" />
          <rect x={380} y={330} width={840} height={530} fill="none" stroke="#FFF1DC" strokeWidth={20} />
          <rect x={460} y={420} width={160} height={130} rx={8} fill="#26386F" />
          <rect x={600} y={720} width={480} height={22} rx={6} fill="#A86B34" />
          <rect x={630} y={742} width={16} height={118} fill="#8B5A2B" />
          <rect x={1034} y={742} width={16} height={118} fill="#8B5A2B" />
          <g transform={`translate(520,${860 - 80})`}>
            <Person c={P.teal} f={f} />
          </g>
          <g transform={`translate(1150,${860 - 80})`}>
            <Person c={P.purple} f={f} skin="#8D5A3B" />
          </g>
          <g transform={`translate(1070,${860 - 80 * 0.62}) scale(0.62)`}>
            <Person c={P.yellow} f={f} skin="#8D5A3B" />
          </g>
          {/* the laptop: no chatbot question, ever */}
          <g transform="translate(985,668) scale(0.62)">
            <Laptop
              screen={
                <g>
                  <rect x={-70} y={-20} width={140} height={34} rx={17} fill="#E3E8F2" />
                  {blink ? <rect x={-56} y={-12} width={4} height={18} fill={P.ink} /> : null}
                </g>
              }
            />
          </g>
          {f > w(1496.9) && (
            <g transform="translate(985,640)" opacity={ease(f, w(1496.9), 6)}>
              <circle r={62} fill="none" stroke={P.red} strokeWidth={10} />
              <line x1={-44} y1={44} x2={44} y2={-44} stroke={P.red} strokeWidth={10} />
            </g>
          )}
          {/* the bill */}
          <g transform="translate(820,600) rotate(-4)">
            <Bill total="↑" hot={f > w(1492.55) ? 1 : 0} />
            <text y={-89} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={15} fill={P.white}>ELECTRICITY BILL</text>
            <text x={-60} y={86} fontFamily="Poppins" fontWeight={800} fontSize={18} fill={f > w(1492.55) ? P.white : P.ink}>TOTAL</text>
            {circ > 0 && <ellipse cx={0} cy={79} rx={96} ry={36} fill="none" stroke={P.red} strokeWidth={5} strokeDasharray={`${per * circ} ${per}`} />}
            {penIn > 0 && (
              <g transform={`translate(${pen[0]},${pen[1]}) scale(0.55)`} opacity={penIn}>
                <Pen />
              </g>
            )}
          </g>
          <Arrow a={[960, 740]} b={[960, 560]} f={f} at={w(1492.6)} c={P.red} wpx={9} />
          {/* the money goes out along the wire to the data centres */}
          {f > w(1500.9) && <Flow pts={wireP} f={f} c={P.yellow} n={7} r={11} speed={7} line={false} o={ease(f, w(1500.9), 10)} />}
          <WTag x={985} y={540} text="Never used a chatbot" bg={P.ink} color={P.white} size={30} k={pop(f, w(1497.2), 12)} />
          <WTag x={1640} y={520} text="AI data centres" bg={P.white} size={40} k={pop(f, w(1502.4), 12)} />
        </World>
      </Cam>
      <Label f={f} at={w(1495.2)} title="A family in Ohio" sub="has never typed a question into a chatbot" bg={P.white} />
      <Caption f={f} at={w(1499.3)}>…but may still pay for the AI boom on their power bill</Caption>
    </Bg>
  );
};

/* ================================================================== "the cost isn't money. It's land." Power travels from where it's made to where it's used. */
export const C6Land: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const t = t0 + f / 24;
  const out = ease(f, w(1508.4), 10);
  const flip = ease(f, w(1506.95), 12);
  const sx = Math.cos(Math.PI * flip);
  const G = 760;
  const keys: CamKey[] = [[t0, 1500, 560, 0.64], [1512.8, 1500, 560, 0.64], [1514.4, 2450, 600, 0.95], [1515.8, 2300, 590, 0.9], [1518.6, 1500, 560, 0.64]];
  const pyl = [2200, 1950, 1700, 1450, 1200, 950, 700];
  const pk = pyl.map((_, i) => pop(f, w(1515.9) + i * 5, 12));
  const arm = (x: number, dy: number): Pt => [x, G - 156 + dy];
  const sag = (a: Pt, b: Pt) => `M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${a[1] + 34} ${b[0]} ${b[1]}`;
  const dcs = [2380, 2560, 2740, 2470, 2650];
  const flowPts: Pt[] = [[330, G - 150], ...pyl.slice().reverse().map((x) => arm(x, -78)), [2330, G - 70]];
  void t;
  return (
    <Bg c={P.sky} c2="#BDE6FF" angle={180}>
      <Cam f={f} t0={t0} keys={keys}>
        <World w={3000} h={1080}>
          <path d={`M-800 ${G} Q-300 ${G - 60} 200 ${G} T1200 ${G} T2200 ${G} T3200 ${G} T4200 ${G} V1700 H-800 Z`} fill={P.grass} />
          {/* farms and forests between */}
          {[760, 1040, 1300, 1560, 1820, 2080].map((x, i) => (
            <g key={x}>
              <path d={`M${x} ${G + 10} L${x + 240} ${G + 10} L${x + 280} ${G + 180} L${x - 40} ${G + 180} Z`} fill={['#A8D85A', '#C9B458', '#5FBF4A'][i % 3]} />
              {[1, 2, 3, 4].map((r) => (
                <line key={r} x1={x - 8 * r} y1={G + 10 + r * 34} x2={x + 240 + 8 * r} y2={G + 10 + r * 34} stroke="rgba(0,0,0,0.12)" strokeWidth={6} />
              ))}
            </g>
          ))}
          {[[900, 0], [1350, 1], [1620, 0], [2060, 1]].map(([x, k]) =>
            Array.from({length: 4}, (_, j) => <Tree key={`${x}${j}`} x={x + j * 48 - 70} y={G + 4} s={1.1 + (j % 2) * 0.3} c={k ? '#1A9A50' : P.green} />),
          )}
          <g transform={`translate(1150,${G - 60})`}>
            <Barn />
          </g>
          <g transform={`translate(1820,${G - 60}) scale(0.9)`}>
            <Barn />
          </g>
          {/* where power is made */}
          <Put x={260} y={G - 60 * 1.6} s={1.6} f={f} at={w(1510.2)}>
            <PowerPlant f={f} />
          </Put>
          <Put x={480} y={G - 160 * 1.1} s={1.1} f={f} at={w(1510.4)}>
            <WindTurbine f={f} />
          </Put>
          {/* where it's used */}
          {dcs.map((x, i) => (
            <Put key={x} x={x} y={(i > 2 ? G - 30 : G) - 48} s={0.8} f={f} at={i === 0 ? w(1511.4) : w(1513.85) + i * 3}>
              <DataCentre f={f + i * 5} busy={1} />
            </Put>
          ))}
          {/* the new lines, built out from the data centres */}
          {pyl.map((x, i) =>
            pk[i] > 0 ? (
              <g key={x} transform={`translate(${x},${G}) scale(${Math.min(1, pk[i])}) translate(0,${-156}) scale(1.3)`}>
                <Pylon c="#4A5A7E" />
              </g>
            ) : null,
          )}
          <g stroke="#2B3150" strokeWidth={4} fill="none">
            {pyl.slice(1).map((x, i) =>
              pk[i + 1] > 0.6 ? (
                <g key={x}>
                  <path d={sag(arm(x, -78), arm(pyl[i], -78))} />
                  <path d={sag(arm(x, -26), arm(pyl[i], -26))} />
                </g>
              ) : null,
            )}
            {pk[0] > 0.6 && <path d={sag(arm(2200, -78), [2330, G - 70])} />}
            {pk[6] > 0.6 && <path d={sag([330, G - 150], arm(700, -78))} />}
          </g>
          {f > w(1518.7) && <Flow pts={flowPts} f={f} c={P.yellow} n={12} r={12} speed={14} line={false} />}
          <WTag x={370} y={G + 110} text="Where power is made" bg={P.ink} color={P.white} size={46} k={pop(f, w(1510.0), 12)} />
          <WTag x={2560} y={G + 110} text="Where it's used" bg={P.ink} color={P.white} size={46} k={pop(f, w(1511.4), 12)} />
          <WTag x={2560} y={G - 200} text="Northern Virginia" bg={P.white} size={46} k={pop(f, w(1514.6), 12)} />
          <WTag x={1450} y={G - 330} text="New high-voltage lines" bg={P.yellow} size={46} k={pop(f, w(1516.4), 12)} />
        </World>
      </Cam>
      <Caption f={f} at={w(1508.7)} until={w(1515.6)}>Power travels from where it's made to where it's used</Caption>
      <Caption f={f} at={w(1516.0)}>When data centres cluster, new lines are built to bring power in</Caption>
      {/* the opening beat: a coin turns into a field */}
      {out < 1 && (
        <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, ${P.teal}, #006E8A)`, opacity: 1 - out}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <g transform={`translate(960,470) scale(${2.6 * Math.abs(sx) + 0.02},2.6)`}>
              {sx >= 0 ? (
                <g>
                  <circle r={110} fill="#C98A00" />
                  <circle r={100} fill={P.yellow} />
                  <text y={34} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={100} fill="#B07800">$</text>
                </g>
              ) : (
                <g>
                  <rect x={-110} y={-110} width={220} height={220} rx={20} fill="#5FBF4A" />
                  {[-70, -35, 0, 35, 70].map((y) => (
                    <line key={y} x1={-96} x2={96} y1={y} y2={y} stroke="#3F9A33" strokeWidth={8} />
                  ))}
                  <path d="M-110 90 H110 M-90 70 V110 M-30 70 V110 M30 70 V110 M90 70 V110" stroke="#8B5A2B" strokeWidth={6} />
                </g>
              )}
            </g>
          </svg>
          <Pop f={f} at={w(1506.1)} x={960} y={860} size={70} until={w(1507.2)}>
            <span style={{textDecoration: 'line-through', textDecorationColor: P.red, textDecorationThickness: 8}}>Money</span>
          </Pop>
          <Pop f={f} at={w(1507.3)} x={960} y={860} size={90} color={P.yellow}>
            Land
          </Pop>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== Maryland: ~67 miles across family farms and forests, toward Virginia's data centres */
const ROUTE: Pt[] = [[150, 160], [560, 360], [900, 470], [1250, 700], [1600, 830], [1950, 1060], [2280, 1240]];
export const C6Route: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const k = lerp(0.3, 1, ease(f, w(1527.4), w(1531.4) - w(1527.4)));
  const drawn = partial(ROUTE, k);
  const gen = ease(f, w(1534.1), 12);
  const cw = 200, ch = 160;
  const forest = (c: number, r: number) => [[6, 4], [4, 3], [8, 5], [2, 1], [10, 7], [3, 6], [9, 2]].some(([a, b]) => a === c && b === r) || random(`fo${c}-${r}`) < 0.16;
  return (
    <Bg c="#3E8E3A">
      <Cam f={f} t0={t0} keys={[[t0, 900, 640, 0.74, 0, 26], [1531.2, 1500, 860, 0.8, 0, 26], [1534.2, 1750, 960, 0.86, 0, 22]]}>
        <World w={2400} h={1440}>
          {Array.from({length: 12 * 9}, (_, i) => {
            const c = i % 12, r = Math.floor(i / 12);
            const x = c * cw, y = r * ch;
            if (forest(c, r))
              return (
                <g key={i}>
                  <rect x={x} y={y} width={cw} height={ch} fill="#1F6E3A" />
                  {Array.from({length: 6}, (_, j) => (
                    <circle key={j} cx={x + 30 + random(`tx${i}${j}`) * 140} cy={y + 30 + random(`ty${i}${j}`) * 100} r={26 + random(`tr${i}${j}`) * 14} fill={j % 2 ? '#2E8F48' : '#1A7A3E'} />
                  ))}
                </g>
              );
            const col = ['#7ED957', '#A8D85A', '#C9B458', '#8CCB5E', '#5FBF4A'][Math.floor(random(`fc${i}`) * 5)];
            return (
              <g key={i}>
                <rect x={x} y={y} width={cw} height={ch} fill={col} stroke="#3E8E3A" strokeWidth={6} />
                {[1, 2, 3, 4].map((s) => (
                  <line key={s} x1={x + 10} x2={x + cw - 10} y1={y + s * 32} y2={y + s * 32} stroke="rgba(0,0,0,0.1)" strokeWidth={6} />
                ))}
                {random(`fh${i}`) < 0.14 && (
                  <g transform={`translate(${x + 60},${y + 70}) scale(0.5)`}>
                    <Barn />
                  </g>
                )}
              </g>
            );
          })}
          {/* the proposed route */}
          <polyline points={ptsStr(drawn)} stroke={P.white} strokeWidth={30} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={ptsStr(drawn)} stroke={P.red} strokeWidth={16} fill="none" strokeLinejoin="round" strokeDasharray="44 22" strokeDashoffset={-f * 2} />
          {drawn.length > 1 && (
            <circle cx={drawn[drawn.length - 1][0]} cy={drawn[drawn.length - 1][1]} r={22 + 6 * Math.sin(f / 3)} fill={P.red} />
          )}
          {[0, 1, 2].map((i) => (
            <Put key={i} x={2120 + i * 130} y={1350 - i * 20} s={0.5} f={f} at={w(1531.3) + i * 3}>
              <DataCentre f={f + i * 4} busy={1} />
            </Put>
          ))}
          <WTag x={700} y={520} text="Family farms" bg={P.white} size={52} k={pop(f, w(1527.0), 12)} />
          <WTag x={1250} y={590} text="Forests" bg={P.white} size={52} k={pop(f, w(1527.5), 12)} />
          <WTag x={1880} y={1220} text="Toward Virginia's data centres" bg={P.ink} color={P.white} size={50} k={pop(f, w(1531.3), 12)} />
        </World>
      </Cam>
      <Label f={f} at={w(1527.3)} title="Maryland Piedmont Reliability Project" sub="proposed power line · route drawn as an illustration" bg={P.white} />
      <div style={{position: 'absolute', right: 90, top: 200, textAlign: 'right', opacity: ease(f, w(1527.3), 8)}}>
        <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 96, color: P.white, textShadow: '0 6px 20px rgba(0,0,0,0.4)'}}>~{Math.round(67 * k)} miles</div>
        <Note style={{marginTop: 4}} size={22}>Newsweek · some reports say ~70</Note>
      </div>
      {/* the same families, for generations */}
      {gen > 0 && (
        <AbsoluteFill style={{opacity: gen}}>
          <Bg c="#F6B26B" c2="#F7D9A6" angle={180}>
            <Cam f={f} t0={t0} keys={[[1534.1, 960, 560, 1.0], [1538.0, 1010, 570, 1.08]]}>
              <World>
                <rect x={-200} y={760} width={2400} height={500} fill="#7CC36A" />
                {[0, 1, 2, 3].map((r) => (
                  <line key={r} x1={-200} x2={2200} y1={800 + r * 50} y2={800 + r * 50} stroke="#5FAF4F" strokeWidth={10} />
                ))}
                <g transform="translate(520,640) scale(1.8)">
                  <Barn />
                </g>
                <g transform={`translate(980,${760 - 50 * 1.9}) scale(1.9)`}>
                  <House c={P.red} />
                </g>
                {[1300, 1460, 1610].map((x, i) => {
                  const s = [1.05, 1.0, 0.66][i];
                  return (
                    <Put key={x} x={x} y={760 - 80 * s} s={s} f={f} at={w([1535.6, 1535.95, 1536.7][i])}>
                      <Person c={[P.purple, P.teal, P.orange][i]} skin={['#E9B48A', '#C98E64', '#C98E64'][i]} f={f} />
                    </Put>
                  );
                })}
              </World>
            </Cam>
            <div style={{position: 'absolute', left: 1180, top: 300, display: 'flex', gap: 24, opacity: ease(f, w(1536.7), 8)}}>
              {['Grandparent', 'Parent', 'Child'].map((n) => (
                <Tag key={n} bg={P.white} color={P.ink} size={30}>{n}</Tag>
              ))}
            </div>
            <Caption f={f} at={w(1534.3)}>Some of these farms have been in the same family for generations</Caption>
          </Bg>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== steel towers across the fields; eminent domain, even if the owner says no */
export const C6Eminent: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const G = 780;
  const ghost = ease(f, w(1540.5), 10);
  const solid = ease(f, w(1549.5), 8);
  const towers = [1000, 1380, 1760];
  const hit = (() => {
    const d = f - w(1549.4);
    return d < 0 ? 0 : d < 4 ? d / 4 : d < 10 ? 1 - (d - 4) / 6 : 0;
  })();
  const card = ease(f, w(1543.4), 12);
  return (
    <Bg c="#F6B26B" c2="#F7D9A6" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 760, 620, 1.15, 0, -6], [1541.0, 1100, 560, 0.95, 4, -3], [1550.1, 980, 560, 1.0, 0, 0]]}>
        <World w={2200} h={1080}>
          <rect x={-300} y={G} width={2800} height={500} fill="#7CC36A" />
          {[0, 1, 2, 3, 4].map((r) => (
            <line key={r} x1={-300} x2={2500} y1={G + 30 + r * 46} y2={G + 30 + r * 46} stroke="#5FAF4F" strokeWidth={12} />
          ))}
          <g transform={`translate(560,${G - 60 * 1.3}) scale(1.3)`}>
            <Barn />
          </g>
          {/* steel towers, first proposed (dashed), then built */}
          {ghost > 0 &&
            towers.map((x, i) => (
              <g key={x} opacity={ghost}>
                <g transform={`translate(${x},${G - 240}) scale(2)`} opacity={0.65 * (1 - solid)} strokeDasharray="10 8">
                  <Pylon c={P.white} />
                </g>
                {solid > 0 && (
                  <g transform={`translate(${x},${G - 240}) scale(2)`} opacity={solid}>
                    <Pylon c="#4A5A7E" />
                  </g>
                )}
                {i < towers.length - 1 && (
                  <path d={`M${x} ${G - 360} Q${x + 190} ${G - 320} ${towers[i + 1]} ${G - 360}`} stroke={solid > 0.5 ? '#2B3150' : P.white} strokeWidth={4} fill="none" strokeDasharray={solid > 0.5 ? undefined : '12 10'} />
                )}
              </g>
            ))}
          {/* the fence and the farmer */}
          <path d={`M60 ${G - 30} H900`} stroke="#8B5A2B" strokeWidth={10} />
          <path d={`M60 ${G - 70} H900`} stroke="#8B5A2B" strokeWidth={10} />
          {[80, 260, 440, 620, 800].map((x) => (
            <rect key={x} x={x} y={G - 100} width={16} height={110} fill="#6B4128" />
          ))}
          <g transform={`translate(330,${G - 80 * 1.4}) scale(1.4) rotate(5)`}>
            <Person c={P.blue} f={f} />
          </g>
          <WTag x={330} y={G + 120} text="Landowner" bg={P.white} size={40} k={pop(f, w(1538.1), 12)} />
          {f > w(1549.1) && (
            <g transform={`translate(170,${G - 250}) scale(${pop(f, w(1549.1), 10)})`}>
              <Bubble text="No." w={180} c={P.white} color={P.red} size={56} />
            </g>
          )}
        </World>
      </Cam>
      <Caption f={f} at={w(1538.1)} until={w(1543.2)}>Steel towers, proposed across their fields</Caption>
      {card > 0 && (
        <div style={{position: 'absolute', left: 90, top: 80, width: 860, background: P.ink, borderRadius: 30, padding: '30px 36px', boxSizing: 'border-box', opacity: card, transform: `translateY(${(1 - card) * -20}px)`, boxShadow: '0 20px 50px rgba(0,0,0,0.3)'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Tag bg={P.yellow} color={P.ink} size={46}>Eminent domain</Tag>
            <svg width={160} height={120} viewBox="-90 -60 180 160">
              <Gavel hit={hit} />
            </svg>
          </div>
          <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 40, color: P.white, marginTop: 16, lineHeight: 1.3, opacity: ease(f, w(1545.4), 8)}}>The law lets a project use private land…</div>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 40, color: P.pink, marginTop: 8, lineHeight: 1.3, opacity: ease(f, w(1548.7), 8)}}>…even if the owner says no.</div>
        </div>
      )}
    </Bg>
  );
};

/* ================================================================== "Farmers who would never use the data centers. Hosting the power lines that feed them." */
export const C6Farmers: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const t = t0 + f / 24;
  const keys: CamKey[] = [[t0, 780, 560, 1.15], [1552.4, 900, 620, 1.0], [1556.8, 1150, 700, 0.88]];
  const pyX = [-300, -80, 140, 360, 580, 800];
  const LY = 420;
  const top = (x: number, dy: number): Pt => {
    const [px, py] = isoP(x, LY);
    return [px, py - 96 + dy * 0.8];
  };
  const fields = [['#A8D85A', '#C9B458', '#7ED957'], ['#5FBF4A', '#A8D85A', '#C9B458'], ['#C9B458', '#7ED957', '#5FBF4A']];
  const farmer = isoP(250, 680);
  const dcTop = isoP(1200, 450, 120);
  const sFarmer = scr(keys, t, farmer[0], farmer[1] - 150);
  const sDc = scr(keys, t, dcTop[0], dcTop[1] - 30);
  const wire = [...pyX.map((x) => top(x, -60)), isoP(1000, LY, 60)];
  return (
    <Bg c="#7ED957" c2="#4CB944" angle={180}>
      <Cam f={f} t0={t0} keys={keys}>
        <World w={2200} h={1500}>
          {fields.map((row, r) =>
            row.map((c, j) => {
              const x = -300 + j * 330, y = r * 300;
              return <polygon key={`${r}${j}`} points={ptsStr([isoP(x, y), isoP(x + 320, y), isoP(x + 320, y + 290), isoP(x, y + 290)])} fill={c} />;
            }),
          )}
          {[0, 1, 2].map((r) =>
            Array.from({length: 8}, (_, s) => {
              const y = r * 300 + 30 + s * 32;
              const a = isoP(-300, y), b = isoP(680, y);
              return <line key={`${r}-${s}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(0,0,0,0.08)" strokeWidth={5} />;
            }),
          )}
          <g transform={`translate(${isoP(-120, 760)[0]},${isoP(-120, 760)[1] - 60})`}>
            <Barn />
          </g>
          <g transform={`translate(${farmer[0]},${farmer[1] - 64}) scale(0.8)`}>
            <Person c={P.blue} f={f} />
          </g>
          {/* the data centres the lines feed */}
          <IsoBox x={1000} y={250} w={420} d={180} h={110} top="#DDE6F5" side="#F4F7FC" />
          <IsoBox x={1000} y={470} w={420} d={180} h={110} top="#DDE6F5" side="#F4F7FC" />
          {Array.from({length: 8}, (_, i) => {
            const [x, y] = isoP(1040 + (i % 4) * 100, 290 + Math.floor(i / 4) * 220, 110);
            return (
              <g key={i} transform={`translate(${x},${y}) scale(1,0.5)`}>
                <circle r={22} fill="#9FB0D3" />
                <rect x={-18} y={-4} width={36} height={8} rx={4} fill="#5B6B8C" transform={`rotate(${(f * 12 + i * 30) % 360})`} />
              </g>
            );
          })}
          {/* the line across the farm */}
          {pyX.map((x) => {
            const [px, py] = isoP(x, LY);
            return (
              <g key={x} transform={`translate(${px},${py - 96}) scale(0.8)`}>
                <Pylon c="#4A5A7E" />
              </g>
            );
          })}
          <polyline points={ptsStr(wire)} stroke="#2B3150" strokeWidth={4} fill="none" />
          <Flow pts={wire} f={f} c={P.yellow} n={10} r={10} speed={9} line={false} o={ease(f, w(1554.9), 10)} />
        </World>
      </Cam>
      <At p={sFarmer} k={pop(f, w(1551.5), 12)}>
        <Tag bg={P.white} color={P.ink} size={36}>Farmer · never uses them</Tag>
      </At>
      <At p={sDc} k={pop(f, w(1552.7), 12)}>
        <Tag bg={P.ink} color={P.white} size={36}>Data centres</Tag>
      </At>
      <Caption f={f} at={w(1553.6)}>Farmers host the power lines that feed them</Caption>
    </Bg>
  );
};

/* ================================================================== "what it's like to live next door": a constant low hum, day and night */
export const C6NextDoor: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const hum = ease(f, w(1564.3), 14);
  const day = ease(f, w(1567.6), 6) * (1 - ease(f, w(1568.1), 8));
  return (
    <Bg c="#1A1446" c2="#3A2580" angle={180}>
      <AbsoluteFill style={{background: P.sky, opacity: day * 0.6}} />
      <Cam f={f} t0={t0} keys={[[t0, 1000, 800, 1.55], [1559.0, 1000, 770, 1.45], [1560.6, 1000, 560, 0.92], [1564.3, 1000, 520, 0.95], [1566.0, 1000, 400, 1.15], [1568.6, 1000, 520, 1.0]]}>
        <World w={2000} h={1100}>
          {Array.from({length: 50}, (_, i) => (
            <circle key={i} cx={random(`sx${i}`) * 2000} cy={random(`sy${i}`) * 300} r={2 + random(`sr${i}`) * 2} fill={P.white} opacity={(Math.floor(f / 7 + i) % 5 ? 0.8 : 0.3) * (1 - day)} />
          ))}
          <ellipse cx={1000} cy={520} rx={760} ry={300} fill={P.purple} opacity={0.35} style={{filter: 'blur(40px)'}} />
          <g transform="translate(1000,560) scale(3.4)">
            <DataCentre f={f} c="#C9D3EA" busy={1} />
          </g>
          <Rings x={1000} y={300} f={f - w(1564.3)} k={hum} n={7} gap={170} max={1150} c={P.sky} sw={12} speed={5} />
          <rect x={-200} y={860} width={2400} height={300} fill="#14102E" />
          <rect x={-200} y={890} width={2400} height={70} fill="#2B2550" />
          {Array.from({length: 12}, (_, i) => (
            <rect key={i} x={-100 + i * 200} y={922} width={90} height={8} fill="#5A507F" />
          ))}
          {Array.from({length: 9}, (_, i) => (
            <g key={i} transform={`translate(${100 + i * 225},${860 - 50 * 1.4}) scale(1.4)`}>
              <House c={[P.red, P.teal, P.orange, P.purple, P.pink][i % 5]} on={1} />
            </g>
          ))}
          <WTag x={1000} y={160} text="Cooling equipment" bg={P.white} size={40} k={pop(f, w(1566.2), 12)} />
        </World>
      </Cam>
      <Label f={f} at={w(1560.7)} title="Northern Virginia" sub="living next door to data centres" bg={P.white} />
      {f > w(1567.5) && (
        <div style={{position: 'absolute', right: 90, top: 70, display: 'flex', alignItems: 'center', gap: 20, opacity: ease(f, w(1567.6), 6)}}>
          <svg width={150} height={150} viewBox="-100 -100 200 200">
            {day > 0.3 ? <Sun f={f} /> : <path d="M20 -70 A75 75 0 1 0 60 50 A60 60 0 1 1 20 -70 Z" fill="#FFF3B0" />}
          </svg>
          <Tag bg={P.white} color={P.ink} size={36}>Day and night</Tag>
        </div>
      )}
      <Caption f={f} at={w(1563.0)} source="local reporting, Loudoun and Prince William counties">
        Residents complain of a constant low hum
      </Caption>
    </Bg>
  );
};

/* ================================================================== "a sound you feel in your chest... hard to fall asleep, even with the windows shut" */
export const C6Sleep: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const shut = ease(f, w(1575.6), 10);
  const chest = ease(f, w(1569.8), 10);
  const zzz = ease(f, w(1572.6), 10);
  const broken = ease(f, w(1573.9), 8);
  return (
    <Bg c="#2A1B5E">
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.04, -4, 0], [1577.45, 1000, 560, 1.12, 4, 0]]}>
        <World>
          <rect x={-100} y={-100} width={2200} height={960} fill="#3A2A7A" />
          <rect x={-100} y={860} width={2200} height={400} fill="#251A55" />
          {/* the window: the data centre glows outside */}
          <rect x={250} y={250} width={400} height={360} fill="#140E33" />
          <ellipse cx={450} cy={560} rx={190} ry={70} fill={P.purple} opacity={0.6} style={{filter: 'blur(14px)'}} />
          <g transform="translate(450,560) scale(0.8)">
            <DataCentre f={f} c="#9FA9C7" busy={1} />
          </g>
          <rect x={250} y={250} width={400} height={180} fill="rgba(160,200,255,0.18)" stroke="#E8EEF9" strokeWidth={14} />
          {/* the lower sash slides down when the window is shut */}
          <rect x={250} y={lerp(260, 430, shut)} width={400} height={180} fill="rgba(160,200,255,0.18)" stroke="#E8EEF9" strokeWidth={14} />
          <rect x={236} y={236} width={428} height={388} fill="none" stroke="#FFF1DC" strokeWidth={16} />
          {/* low waves keep coming through the wall, shut window or not */}
          {Array.from({length: 6}, (_, i) => {
            const x = 660 + ((f * 6 + i * 240) % 1400);
            const d = Array.from({length: 13}, (_, j) => `${j ? 'L' : 'M'}${x + Math.sin(j * 0.9 + f / 6) * 22} ${180 + j * 55}`).join(' ');
            return <path key={i} d={d} stroke={P.sky} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.65 * (1 - (x - 660) / 1400)} />;
          })}
          <g transform="translate(790,330) scale(0.55)">
            <Clock f={f * 4} />
          </g>
          {/* the bed */}
          <rect x={880} y={720} width={760} height={90} rx={12} fill="#8B5A2B" />
          <rect x={880} y={670} width={760} height={60} rx={14} fill={P.white} />
          <rect x={900} y={610} width={150} height={66} rx={30} fill="#E8EEF9" />
          <circle cx={990} cy={600} r={44} fill="#C98E64" />
          <circle cx={978} cy={590} r={8} fill={P.white} />
          <circle cx={1004} cy={590} r={8} fill={P.white} />
          <circle cx={979} cy={591} r={4} fill={P.ink} />
          <circle cx={1005} cy={591} r={4} fill={P.ink} />
          <path d="M1040 640 Q1200 600 1640 640 V700 H1040 Z" fill={P.blue} />
          {chest > 0 &&
            [0, 1, 2].map((i) => {
              const r = ((f * 2 + i * 30) % 90) + 10;
              return <circle key={i} cx={1170} cy={640} r={r} fill="none" stroke={P.yellow} strokeWidth={6} opacity={chest * (1 - r / 100)} />;
            })}
          {zzz > 0 &&
            ['Z', 'z', 'z'].map((c, i) => (
              <text key={i} x={1060 + i * 46 + broken * (i - 1) * 40} y={520 - i * 40 + Math.sin(f / 6 + i) * 6 + broken * 40} fontFamily="Poppins" fontWeight={800} fontSize={60 - i * 8} fill={P.white} opacity={zzz * (1 - broken * 0.75)}>
                {c}
              </text>
            ))}
          {broken > 0 && <line x1={1040} y1={540} x2={1220} y2={420} stroke={P.red} strokeWidth={10} opacity={broken} strokeLinecap="round" />}
          <WTag x={450} y={690} text="Window shut" bg={P.white} size={34} k={pop(f, w(1576.1), 12)} />
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 1060, top: 80, opacity: ease(f, w(1569.8), 10) * (1 - ease(f, w(1572.4), 10)), display: 'flex', flexDirection: 'column', gap: 24, background: 'rgba(11,22,56,0.75)', padding: '26px 30px', borderRadius: 24}}>
        <Meter f={f} start={w(1569.9)} value={9} max={10} label="Felt in your chest" text="a lot" color={P.yellow} w={700} />
        <Meter f={f} start={w(1570.8)} value={3.5} max={10} label="Heard" text="less" color={P.sky} w={700} />
        <Note size={20}>Low sound: illustration</Note>
      </div>
      <Caption f={f} at={w(1572.6)}>Hard to fall asleep, even with the windows shut</Caption>
    </Bg>
  );
};

/* ================================================================== secret deals: code names, NDAs, residents learn the company only after approval */
export const C6Secret: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const sign = ease(f, w(1584.6), 24);
  const ok = pop(f, w(1592.3), 10);
  const reveal = ease(f, w(1592.5), 12);
  const intro = 1 - ease(f, w(1579.9), 10);
  return (
    <Bg c="#0E5A6A" c2="#083C48" angle={160}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.12, 0, 10], [1586.0, 960, 540, 1.0, -4, 6], [1593.45, 960, 540, 1.04, 0, 4]]}>
        <World>
          {/* the folder */}
          <g opacity={ease(f, w(1577.6), 10)}>
            <path d="M240 150 H440 L470 180 H880 V600 H240 Z" fill="#D9A95B" />
            <rect x={240} y={180} width={640} height={420} rx={10} fill="#E8C38F" />
            {f > w(1582.3) && <rect x={300} y={232} width={520} height={84} rx={10} fill={P.yellow} opacity={ease(f, w(1582.3), 6)} />}
            <text x={560} y={296} textAnchor="middle" fontFamily='"IBM Plex Mono", monospace' fontWeight={700} fontSize={64} fill={P.ink}>PROJECT X</text>
            <text x={290} y={420} fontFamily="Poppins" fontWeight={700} fontSize={40} fill={P.ink}>Company:</text>
            <rect x={515} y={386} width={330} height={46} rx={6} fill={P.ink} opacity={1 - reveal} />
            <text x={520} y={421} fontFamily="Poppins" fontWeight={800} fontSize={34} fill={P.red} opacity={reveal}>named only now</text>
            <g transform="translate(560,520) rotate(-8)" opacity={ease(f, w(1579.1), 6) * (1 - ok)}>
              <rect x={-210} y={-40} width={420} height={80} rx={10} fill="none" stroke={P.red} strokeWidth={7} />
              <text y={18} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={48} fill={P.red}>CONFIDENTIAL</text>
            </g>
            {ok > 0 && (
              <g transform={`translate(560,520) rotate(-8) scale(${ok})`}>
                <rect x={-190} y={-40} width={380} height={80} rx={10} fill="none" stroke={P.green} strokeWidth={7} />
                <text y={18} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={48} fill={P.green}>APPROVED</text>
              </g>
            )}
          </g>
          <WTag x={560} y={100} text="Code name" bg={P.yellow} size={38} k={pop(f, w(1582.4), 12)} />
          {/* the NDA */}
          <Put x={1300} y={370} s={1.7} f={f} at={w(1584.3)}>
            <Doc title="NDA" />
            <path d={`M-50 70 q10 -20 20 0 t20 0 t20 0 t20 0`} stroke={P.blue} strokeWidth={3} fill="none" strokeDasharray={`${90 * sign} 200`} />
          </Put>
          <WTag x={1300} y={150} text="Officials sign NDAs" bg={P.white} size={36} k={pop(f, w(1583.9), 12)} />
          {/* residents */}
          <g transform="translate(1720,330)" opacity={ease(f, w(1587.4), 10)}>
            <Crowd n={6} cols={3} gap={80} f={f} />
          </g>
          {f > w(1588.7) &&
            [0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${1640 + i * 80},${250 + Math.sin(f / 6 + i) * 6}) scale(${pop(f, w(1588.7) + i * 3, 10) * 0.45})`}>
                <Bubble text="?" w={100} size={60} />
              </g>
            ))}
          <WTag x={1720} y={160} text="Residents" bg={P.white} size={36} k={pop(f, w(1587.5), 12)} />
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 210, top: 770}}>
        <Timeline
          f={f}
          w={1500}
          items={[
            {year: 'Deal', label: 'under a code name', at: w(1581.4)},
            {year: 'NDA', label: 'officials sign', at: w(1584.3)},
            {year: 'Approved', label: 'the project goes ahead', at: w(1592.1), color: P.green},
            {year: 'Revealed', label: 'which company it is', at: w(1592.6), color: P.pink},
          ]}
        />
      </div>
      {intro > 0 && (
        <Pop f={f} at={w(1577.6)} x={960} y={540} size={80} until={w(1579.9)}>
          <span style={{background: P.ink, borderRadius: 30, padding: '12px 36px'}}>Many arrive in secret</span>
        </Pop>
      )}
    </Bg>
  );
};

/* ================================================================== "many states compete to attract data centers with big tax breaks" */
export const C6TaxRace: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const caps: Pt[] = [[260, 420], [520, 800], [1400, 800], [1660, 420], [960, 190]];
  const dc: Pt = [960, 520 + Math.sin(f / 10) * 12];
  return (
    <Bg c={P.navy}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {caps.map((p, i) => (
          <Flow key={i} pts={[p, dc]} f={f} c={P.yellow} n={4} r={8} speed={5} o={ease(f, w(1596.3) + i * 4, 8)} />
        ))}
        <g transform={`translate(${dc[0]},${dc[1]}) scale(1.3)`}>
          <DataCentre f={f} />
        </g>
        {caps.map((p, i) => (
          <Put key={i} x={p[0]} y={p[1]} s={0.85} f={f} at={w(1593.8) + i * 3}>
            <Capitol />
          </Put>
        ))}
        {caps.map((p, i) => (
          <WTag key={i} x={p[0]} y={p[1] - 150} text="TAX BREAK" bg={P.yellow} size={34} k={pop(f, w(1596.4) + i * 4, 12)} />
        ))}
      </svg>
      <Caption f={f} at={w(1593.7)}>Many states compete for data centres with big tax breaks</Caption>
    </Bg>
  );
};

/* ================================================================== Virginia's sales-tax break: $928.6M (FY2023, JLARC). "What do towns get back?" */
export const C6JLARC: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const items: [string, number][] = [['Servers', 300], ['Racks', 220], ['Cooling gear', 260]];
  return (
    <Bg c="#1E1650">
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 14}, (_, i) => {
          const y = ((f * (3 + (i % 3)) + random(`cy${i}`) * 1200) % 1300) - 100;
          return (
            <g key={i} transform={`translate(${650 + random(`cx${i}`) * 1250},${y}) scale(0.35)`} opacity={0.35}>
              <Coin />
            </g>
          );
        })}
        <g transform={`translate(0,${(1 - ease(f, 0, 14)) * 60})`}>
          <path d="M150 150 H600 V860 L570 890 L540 860 L510 890 L480 860 L450 890 L420 860 L390 890 L360 860 L330 890 L300 860 L270 890 L240 860 L210 890 L180 860 L150 890 Z" fill={P.white} />
          <text x={375} y={220} textAnchor="middle" fontFamily='"IBM Plex Mono", monospace' fontWeight={700} fontSize={34} fill={P.ink}>RECEIPT</text>
          <g transform="translate(375,330) scale(0.45)">
            <Rack f={f} busy={1} />
          </g>
          {items.map(([n, l], i) => (
            <g key={n}>
              <text x={190} y={470 + i * 70} fontFamily="Poppins" fontWeight={700} fontSize={32} fill={P.ink}>{n}</text>
              <rect x={600 - 40 - l * 0.5} y={448 + i * 70} width={l * 0.5} height={14} rx={7} fill="#D5DBE8" />
            </g>
          ))}
          <line x1={180} x2={570} y1={680} y2={680} stroke="#D5DBE8" strokeWidth={4} strokeDasharray="10 8" />
          <text x={190} y={740} fontFamily="Poppins" fontWeight={800} fontSize={34} fill={P.ink}>Sales tax</text>
          <text x={560} y={740} textAnchor="end" fontFamily="Poppins" fontWeight={800} fontSize={40} fill={P.red}>$0</text>
          <g transform="translate(375,810) rotate(-10)" opacity={ease(f, w(1606.6), 6)}>
            <rect x={-130} y={-34} width={260} height={68} rx={10} fill="none" stroke={P.red} strokeWidth={7} />
            <text y={16} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.red}>EXEMPT</text>
          </g>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 690, top: 200, opacity: ease(f, 0, 10)}}>
        <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 40, color: P.white, maxWidth: 1130, lineHeight: 1.25}}>Virginia's sales-tax break for data-centre equipment</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 30}}>
          <Counter f={f} start={w(1606.5)} dur={28} to={928.6} decimals={1} prefix="$" suffix="M" size={140} color={P.yellow} />
          <span style={{fontFamily: AF.head, fontWeight: 700, fontSize: 54, color: P.white, opacity: ease(f, w(1607.4), 8), whiteSpace: 'nowrap'}}>(FY2023, JLARC)</span>
        </div>
        <div style={{fontFamily: AF.head, fontWeight: 600, fontSize: 36, color: 'rgba(255,255,255,0.85)', marginTop: 24, opacity: ease(f, w(1607.3), 10)}}>sales tax the state did not collect, in one year</div>
        <Note style={{marginTop: 16, opacity: ease(f, w(1607.3), 10)}} size={20}>Source · JLARC (Virginia's legislative watchdog), Dec 2024</Note>
      </div>
      <Caption f={f} at={w(1608.7)}>What do towns get back?</Caption>
    </Bg>
  );
};

/* ================================================================== construction jobs for a while; then a few dozen permanent workers */
export const C6Jobs: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const G = 820;
  const done = ease(f, w(1615.6), 18);
  const stay = (i: number) => i % 4 === 0;
  return (
    <Bg c="#1B2C6B">
      <Cam f={f} t0={t0} keys={[[t0, 900, 560, 1.1, -6, 4], [1615.4, 900, 560, 1.0, 0, 2], [1620.5, 960, 560, 1.05, 6, 0]]}>
        <World>
          <rect x={-300} y={G} width={2600} height={400} fill="#2A3B7A" />
          <g transform={`translate(1330,${G - 60 * 2.4}) scale(2.4)`}>
            <DataCentre f={f} busy={done > 0.5 ? 1 : 0} />
          </g>
          {/* scaffolding and crane while it's being built */}
          <g opacity={1 - done} stroke={P.orange} strokeWidth={6} fill="none">
            {Array.from({length: 9}, (_, i) => (
              <line key={i} x1={980 + i * 87} y1={G} x2={980 + i * 87} y2={G - 330} />
            ))}
            {[0, 1, 2, 3].map((r) => (
              <line key={r} x1={970} x2={1690} y1={G - 30 - r * 95} y2={G - 30 - r * 95} />
            ))}
          </g>
          <g opacity={1 - done} stroke={P.yellow} strokeWidth={12} fill="none">
            <path d={`M1780 ${G} V230 H1150 M1780 300 L1710 230`} />
            <line x1={1260} y1={230} x2={1260} y2={430 + Math.sin(f / 10) * 30} strokeWidth={4} />
          </g>
          {/* the workers */}
          {Array.from({length: 120}, (_, i) => {
            const c = i % 15, r = Math.floor(i / 15);
            const k = pop(f, w(1611.7) + i * 0.25, 8);
            if (k <= 0) return null;
            const leave = stay(i) ? 0 : ease(f, w(1615.5) + (i % 15) * 1.2, 30);
            const x = 120 + c * 52 + (r % 2) * 20 - leave * 900;
            const y = 470 + r * 44;
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${1.4 * Math.min(1, k)})`} opacity={1 - leave}>
                <Worker c={stay(i) && done > 0.5 ? P.teal : P.orange} hat={!(stay(i) && done > 0.5)} />
              </g>
            );
          })}
          <WTag x={520} y={400} text="Many construction jobs" bg={P.yellow} size={42} k={pop(f, w(1612.5), 12) * (1 - ease(f, w(1615.4), 8))} />
          <WTag x={520} y={400} text="A few dozen permanent workers" bg={P.teal} color={P.white} size={42} k={pop(f, w(1618.5), 12)} />
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 90, top: 70, width: 760, opacity: ease(f, w(1613.5), 10)}}>
        <Meter f={f} start={w(1613.6)} value={10} max={10} label="Construction" text={done > 0.5 ? 'over' : 'only for a while'} color={P.orange} w={760} />
      </div>
      <Caption f={f} at={w(1617.3)} source="JLARC 2024 · worker counts on screen are an illustration">
        Once it's running: maybe a few dozen permanent jobs
      </Caption>
    </Bg>
  );
};

/* ================================================================== the other side: Loudoun's property tax pays for schools and lower rates */
export const C6Loudoun: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const G = 820;
  const flip = ease(f, w(1621.9), 12);
  const sx = Math.cos(Math.PI * flip);
  const out = ease(f, w(1623.3), 10);
  const down = ease(f, w(1635.4), 12);
  return (
    <Bg c={P.teal} c2="#006E8A" angle={160}>
      <Cam f={f} t0={t0} keys={[[1623.3, 720, 600, 1.15, -6, 3], [1631.5, 960, 560, 0.95, 0, 2], [1636.85, 1250, 560, 1.05, 6, 0]]}>
        <World>
          <rect x={-300} y={G} width={2600} height={400} fill="#0B5E52" />
          {[[230, G - 48, 0.8], [480, G - 48, 0.8], [360, G - 110, 0.7]].map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
              <DataCentre f={f + i * 9} busy={1} />
            </g>
          ))}
          <g transform={`translate(960,${G - 80 * 1.4}) scale(1.4)`}>
            <Capitol c="#F4F7FC" />
          </g>
          <Put x={1530} y={430} s={1.1} f={f} at={w(1633.3)}>
            <School />
          </Put>
          {[1400, 1580, 1760].map((x, i) => (
            <Put key={x} x={x} y={G - 50} s={1.0} f={f} at={w(1634.0) + i * 3}>
              <House c={[P.orange, P.purple, P.red][i]} />
            </Put>
          ))}
          <Flow pts={[[600, 720], [800, 720]]} f={f} c={P.yellow} n={4} r={13} speed={5} o={ease(f, w(1624.1), 10)} />
          <Flow pts={[[1120, 640], [1300, 500], [1390, 470]]} f={f} c={P.yellow} n={4} r={11} speed={5} o={ease(f, w(1633.2), 10)} />
          <Flow pts={[[1120, 760], [1340, 760]]} f={f} c={P.yellow} n={4} r={11} speed={5} o={ease(f, w(1634.0), 10)} />
          <WTag x={700} y={650} text="Property tax" bg={P.yellow} size={40} k={pop(f, w(1625.1), 12)} />
          <WTag x={960} y={G + 80} text="County budget" bg={P.white} size={40} k={pop(f, w(1630.6), 12)} />
          <WTag x={1530} y={280} text="Schools" bg={P.white} size={40} k={pop(f, w(1633.4), 12)} />
          <WTag x={1580} y={G + 80} text="Lower homeowner tax rates" bg={P.white} size={36} k={pop(f, w(1634.3), 12)} />
          {down > 0 && <Arrow a={[1880, 600]} b={[1880, 600 + 160 * down + 1]} f={f} at={w(1635.4)} c={P.green} wpx={12} />}
        </World>
      </Cam>
      <Label f={f} at={w(1625.9)} title="Loudoun County, Virginia" sub="data centres pay a lot of property tax" bg={P.white} />
      <Caption f={f} at={w(1628.3)} until={w(1633.0)} source="Loudoun County FY2025 budget documents">
        Data centres bring in a large share of the county's tax money
      </Caption>
      {/* the opening beat: the coin's other side */}
      {out < 1 && (
        <AbsoluteFill style={{background: P.navy, opacity: 1 - out}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <g transform={`translate(960,540) scale(${Math.abs(sx) + 0.02},1)`}>
              <circle r={260} fill={sx >= 0 ? shade(P.red, 0.7) : shade(P.green, 0.7)} />
              <circle r={240} fill={sx >= 0 ? P.red : P.green} />
              <text y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={86} fill={P.white}>
                {sx >= 0 ? 'COSTS' : 'BENEFITS'}
              </text>
            </g>
          </svg>
          <Pop f={f} at={w(1620.7)} x={960} y={150} size={64}>
            To be fair: there's another side
          </Pop>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== "Some communities win. Some pay. The people who pay are not the people who decided." */
export const C6WinPay: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const L = ease(f, -8, 12), R = ease(f, w(1638.3), 12);
  const b = ease(f, w(1640.0), 12);
  return (
    <Bg c={P.navy}>
      <AbsoluteFill style={{opacity: 1 - b}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080, background: 'linear-gradient(160deg, #22B35E, #11743A)', transform: `translateX(${(1 - L) * -960}px)`}}>
          <svg width={960} height={1080}>
            <rect y={780} width={960} height={300} fill="#0F6A33" />
            <g transform="translate(330,640) scale(1.3)">
              <School />
            </g>
            {[640, 820].map((x, i) => (
              <g key={x} transform={`translate(${x},${780 - 50})`}>
                <House c={[P.orange, P.purple][i]} on={1} />
              </g>
            ))}
            <Flow pts={[[480, 100], [480, 480]]} f={f} c={P.yellow} n={5} r={14} speed={7} />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', transform: `scale(${pop(f, w(1637.5), 12)})`}}>
            <Tag bg={P.white} color={P.green} size={64}>Some win</Tag>
          </div>
        </div>
        <div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 1080, background: 'linear-gradient(160deg, #E5401F, #8E2412)', transform: `translateX(${(1 - R) * 960}px)`}}>
          <svg width={960} height={1080}>
            <rect y={780} width={960} height={300} fill="#6B1C0E" />
            {[200, 520, 840].map((x) => (
              <g key={x} transform={`translate(${x},${780 - 180}) scale(1.5)`}>
                <Pylon c="#FFD9C9" />
              </g>
            ))}
            <g transform="translate(480,520) scale(1.3)">
              <Bill total="↑" hot={1} />
            </g>
            <Rings x={480} y={520} f={f} k={1} n={5} gap={120} max={600} c="#FFD9C9" sw={6} />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', transform: `scale(${pop(f, w(1638.9), 12)})`}}>
            <Tag bg={P.white} color={P.red} size={64}>Some pay</Tag>
          </div>
        </div>
      </AbsoluteFill>
      {b > 0 && (
        <AbsoluteFill style={{opacity: b}}>
          <Cam f={f} t0={t0} keys={[[1640.0, 1250, 540, 1.15], [1642.3, 960, 560, 0.95]]}>
            <World>
              {/* who decided: a few people and a signed deal */}
              <rect x={220} y={640} width={520} height={30} rx={8} fill="#A86B34" />
              {[320, 480, 640].map((x, i) => (
                <g key={x} transform={`translate(${x},${640 - 40}) scale(0.8)`}>
                  <Person c={[P.steel, '#7C8AA8', P.steel][i]} f={f} />
                </g>
              ))}
              <g transform="translate(480,590) scale(0.5) rotate(-6)">
                <Doc title="DEAL" stamp="SIGNED" />
              </g>
              {/* who pays: everyone else */}
              <g transform="translate(1440,420)">
                <Crowd n={24} cols={8} gap={80} hi={24} c={P.red} f={f} />
              </g>
              <text x={960} y={600} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={200} fill={P.yellow} opacity={ease(f, w(1642.3), 6)} transform={`translate(960,560) scale(${pop(f, w(1642.3), 10) || 0.001}) translate(-960,-560)`}>
                ≠
              </text>
              <WTag x={1440} y={330} text="Who pays" bg={P.red} color={P.white} size={50} k={pop(f, w(1641.5), 12)} />
              <WTag x={480} y={390} text="Who decided" bg={P.white} size={50} k={pop(f, w(1642.9), 12)} />
            </World>
          </Cam>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== the pattern: Memphis, The Dalles, Nairobi; benefits spread worldwide, costs land on places */
export const C6Pattern: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const g = ease(f, w(1649.8), 14);
  const cards: {x: number; at: number; title: string; line: string; bg: string; art: React.ReactNode}[] = [
    {
      x: 330, at: 1645.5, title: 'Memphis', line: 'gas turbines next to Boxtown', bg: '#F6B26B',
      art: (
        <g>
          {[-120, 0, 120].map((x, i) => (
            <g key={x} transform={`translate(${x},20) scale(0.6)`}>
              <PowerPlant f={f + i * 11} />
            </g>
          ))}
        </g>
      ),
    },
    {
      x: 960, at: 1647.3, title: 'The Dalles', line: 'over a quarter of the town’s water', bg: P.sky,
      art: (
        <g>
          {[-34, 34].map((dx) => (
            <line key={dx} x1={-60 + dx} y1={90} x2={-60 + dx * 0.5} y2={-20} stroke="#5B6B8C" strokeWidth={8} />
          ))}
          <rect x={-110} y={-90} width={100} height={74} rx={10} fill="#DDE6F5" />
          <g transform={`translate(90,${10 + Math.sin(f / 6) * 6}) scale(0.9)`}>
            <Drop />
          </g>
        </g>
      ),
    },
    {
      x: 1590, at: 1648.1, title: 'Nairobi', line: 'data workers paid under $2 an hour', bg: P.pink,
      art: (
        <g>
          <rect x={-120} y={-90} width={180} height={120} rx={10} fill={P.ink} />
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} x={-104} y={-74 + r * 26} width={r % 2 ? 100 : 140} height={10} rx={5} fill={r === 1 ? P.red : '#3A3D4A'} />
          ))}
          <g transform="translate(110,10) scale(0.7)">
            <Person c={P.teal} f={f} skin="#6B4128" />
          </g>
        </g>
      ),
    },
  ];
  return (
    <Bg c={P.plum}>
      <AbsoluteFill style={{opacity: 1 - g}}>
        <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.0, -8, 0], [1649.0, 960, 540, 0.96, 8, 0]]}>
          {cards.map((c) => {
            const k = pop(f, w(c.at), 12);
            return k > 0 ? (
              <div key={c.title} style={{position: 'absolute', left: c.x - 270, top: 230, width: 540, height: 600, borderRadius: 34, background: c.bg, transform: `scale(${k})`, boxShadow: '0 30px 60px rgba(0,0,0,0.35)', overflow: 'hidden'}}>
                <svg width={540} height={330} viewBox="-270 -165 540 330">
                  {c.art}
                </svg>
                <div style={{padding: '0 34px'}}>
                  <Tag bg={P.ink} color={P.white} size={46}>{c.title}</Tag>
                  <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 32, color: P.ink, marginTop: 20, lineHeight: 1.25}}>{c.line}</div>
                </div>
              </div>
            ) : null;
          })}
        </Cam>
        <Label f={f} at={0} title="The same pattern" sub="chapters 2, 3 and 4" bg={P.yellow} />
      </AbsoluteFill>
      {g > 0 && (
        <AbsoluteFill style={{opacity: g}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {Array.from({length: 28}, (_, i) => {
              const a = (i / 28) * Math.PI * 2;
              const d = 340 + (((f - w(1650.3)) * 7 + i * 37) % 700);
              return f > w(1650.3) ? <circle key={i} cx={960 + Math.cos(a) * d} cy={560 + Math.sin(a) * d * 0.8} r={11} fill={P.yellow} opacity={0.9 * (1 - (d - 340) / 700)} style={{filter: `drop-shadow(0 0 10px ${P.yellow})`}} /> : null;
            })}
            <g transform="translate(960,560) scale(3.2)">
              <Globe f={f} />
            </g>
            {[[-130, -60], [60, 40], [170, 130]].map(([x, y], i) => {
              const k = ease(f, w(1653.3) + i * 4, 10);
              return k > 0 ? (
                <g key={i} transform={`translate(${960 + x},${560 + y - (1 - k) * 200}) scale(1.5)`} opacity={k}>
                  <MapPin c={P.red} />
                </g>
              ) : null;
            })}
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', opacity: ease(f, w(1650.4), 10)}}>
            <Tag bg={P.yellow} color={P.ink} size={44}>Benefits: spread across the whole world</Tag>
          </div>
          <Caption f={f} at={w(1653.3)}>Costs: specific places, specific people</Caption>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== "only fair to give the other side its full say... some strong answers. And some of them are true." */
export const C6OtherSide: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const tilt = lerp(-14, -5, ease(f, w(1667.9), 24)) + Math.sin(f / 14) * 1.2;
  const rad = (tilt * Math.PI) / 180;
  const piv: Pt = [960, 330];
  const end = (s: number): Pt => [piv[0] + Math.cos(rad) * 440 * s, piv[1] + Math.sin(rad) * 440 * s];
  const [lx, ly] = end(-1), [rx, ry] = end(1);
  const right = ease(f, w(1662.3), 10);
  return (
    <Bg c={P.navy}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d={`M${piv[0]} ${piv[1]} L900 900 H1020 Z`} fill="#7C8AA8" />
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={P.white} strokeWidth={16} strokeLinecap="round" />
        <circle cx={piv[0]} cy={piv[1]} r={20} fill={P.yellow} />
        {/* left pan: the costs */}
        <g transform={`translate(${lx},${ly})`}>
          <line x1={-150} y1={240} x2={0} y2={0} stroke="#C9D2E6" strokeWidth={4} />
          <line x1={150} y1={240} x2={0} y2={0} stroke="#C9D2E6" strokeWidth={4} />
          <path d="M-190 240 H190 Q170 300 0 300 Q-170 300 -190 240 Z" fill="#AEB8CC" />
          <g transform="translate(-110,180) scale(0.45)"><Bill total="↑" hot={1} /></g>
          <g transform="translate(-20,190) scale(0.55)"><Drop /></g>
          <g transform="translate(70,180) scale(0.6)"><Bolt /></g>
          <g transform="translate(140,170) scale(0.5)"><Pylon c={P.white} /></g>
          <g transform="translate(-40,110) scale(0.5)"><Coin label="$" /></g>
        </g>
        {/* right pan: the industry's answers */}
        <g transform={`translate(${rx},${ry})`}>
          <line x1={-150} y1={240} x2={0} y2={0} stroke="#C9D2E6" strokeWidth={4} />
          <line x1={150} y1={240} x2={0} y2={0} stroke="#C9D2E6" strokeWidth={4} />
          <path d="M-190 240 H190 Q170 300 0 300 Q-170 300 -190 240 Z" fill={right > 0 ? P.sky : '#AEB8CC'} />
          {[-110, 0, 110].map((x, i) => {
            const k = pop(f, w(1666.2) + i * 4, 12);
            const ok = i < 2 && f > w(1668.1) + i * 4;
            return k > 0 ? (
              <g key={x} transform={`translate(${x},${150 - i * 14}) scale(${0.6 * Math.min(1.1, k)})`}>
                <Bubble text={ok ? '✓' : '…'} w={150} c={ok ? P.green : P.white} color={ok ? P.white : P.ink} size={60} />
              </g>
            ) : null;
          })}
        </g>
      </svg>
      <div style={{position: 'absolute', left: lx - 220, width: 440, top: ly + 340, textAlign: 'center', opacity: ease(f, w(1659.9), 10)}}>
        <Tag bg={P.red} color={P.white} size={40}>The costs</Tag>
      </div>
      <div style={{position: 'absolute', left: rx - 280, width: 560, top: ry + 340, textAlign: 'center', opacity: ease(f, w(1664.1), 10)}}>
        <Tag bg={P.sky} color={P.ink} size={40}>The AI industry's answers</Tag>
      </div>
      <Pop f={f} at={w(1661.0)} x={960} y={110} size={60}>
        The other side gets its full say
      </Pop>
      <Caption f={f} at={w(1667.7)}>Some strong answers. Some of them true.</Caption>
    </Bg>
  );
};

export const SCENES_6: Record<string, React.FC<AnimProps>> = {
  c6grid: C6Grid,
  c6spread: C6Spread,
  c6pjm: C6PJM,
  c6auction: C6Auction,
  c6price: C6Price,
  c6monitor: C6Monitor,
  c6family: C6Family,
  c6land: C6Land,
  c6route: C6Route,
  c6eminent: C6Eminent,
  c6farmers: C6Farmers,
  c6nextdoor: C6NextDoor,
  c6sleep: C6Sleep,
  c6secret: C6Secret,
  c6taxrace: C6TaxRace,
  c6jlarc: C6JLARC,
  c6jobs: C6Jobs,
  c6loudoun: C6Loudoun,
  c6winpay: C6WinPay,
  c6pattern: C6Pattern,
  c6otherside: C6OtherSide,
};
