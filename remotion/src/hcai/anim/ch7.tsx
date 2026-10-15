// Chapter 7, "The other side" (27:50–30:26 on the film, 1673–1826 s): the three arguments for AI's footprint being
// fine (one question is tiny, it keeps getting more efficient, it could help fix things), weighed fairly with the
// published numbers drawn to scale, and then the Jevons paradox: 1865 coal, Nadella's post, and the IEA projection.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';
import {
  Battery,
  Bg,
  Bolt,
  Cam,
  Caption,
  Chip,
  Clock,
  Coin,
  Counter,
  DataCentre,
  Drop,
  Fan,
  Flow,
  Globe,
  House,
  Label,
  Office,
  Person,
  Pipe,
  Pop,
  Put,
  Pylon,
  Rack,
  SolarPanel,
  Sun,
  Thermometer,
  WindTurbine,
  World,
} from './lib';

/* ================================================================== local drawings */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Linear 0→1 between two frames (for things that must run at a steady rate, like a stopwatch). */
const lin = (f: number, a: number, b: number) => clamp01((f - a) / Math.max(1, b - a));

/** A chat bubble with two text lines. */
const Bubble: React.FC<{c?: string; w?: number; h?: number; ink?: string}> = ({c = P.white, w = 200, h = 110, ink = '#C5CCD8'}) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.3} fill={c} />
    <path d={`M${-w * 0.28} ${h / 2 - 4} L${-w * 0.36} ${h / 2 + 26} L${-w * 0.1} ${h / 2 - 4} Z`} fill={c} />
    <rect x={-w / 2 + 26} y={-h / 2 + 28} width={w * 0.62} height={13} rx={6.5} fill={ink} />
    <rect x={-w / 2 + 26} y={-h / 2 + 56} width={w * 0.38} height={13} rx={6.5} fill={ink} />
  </g>
);
/** A tick in a circle. */
const Check: React.FC<{size?: number; c?: string}> = ({size = 34, c = P.green}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{display: 'inline-block', verticalAlign: 'middle'}}>
    <circle cx={20} cy={20} r={20} fill={c} />
    <path d="M11 21 L17 27 L29 13" stroke={P.white} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
/** A kitchen oven; `on` lights the window. */
const Oven: React.FC<{f: number; on: number}> = ({f, on}) => (
  <g>
    <rect x={-120} y={-110} width={240} height={220} rx={14} fill="#E8EEF9" />
    <rect x={-120} y={-110} width={240} height={42} rx={14} fill="#B8C3D9" />
    {[-80, -45, 45, 80].map((x) => (
      <circle key={x} cx={x} cy={-89} r={11} fill="#5B6B8C" />
    ))}
    <rect x={-22} y={-98} width={44} height={18} rx={4} fill={P.ink} />
    <text x={0} y={-84} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={600} fontSize={14} fill={on ? P.orange : '#5B6B8C'}>
      {on ? '220°' : '—'}
    </text>
    <rect x={-96} y={-54} width={192} height={134} rx={10} fill="#22283F" />
    <rect x={-96} y={-54} width={192} height={134} rx={10} fill={P.orange} opacity={on * (0.55 + 0.2 * Math.sin(f / 3))} />
    {[0, 1].map((i) => (
      <path key={i} d={`M-80 ${-36 + i * 100} q20 -10 40 0 t40 0 t40 0 t40 0`} stroke={on ? P.red : '#3A3D55'} strokeWidth={6} fill="none" />
    ))}
    <rect x={-80} y={-64} width={160} height={8} rx={4} fill="#9FB0D3" />
  </g>
);
/** An LED bulb; `on` lights it. */
const Bulb: React.FC<{on: number}> = ({on}) => (
  <g>
    {on > 0 && <circle cy={-30} r={120} fill={P.yellow} opacity={0.18 * on} />}
    <path d="M0 -100 C55 -100 76 -55 66 -18 C58 10 36 26 32 52 H-32 C-36 26 -58 10 -66 -18 C-76 -55 -55 -100 0 -100 Z" fill={on ? P.yellow : '#3A3D55'} />
    <path d="M-18 40 L-10 -20 H10 L18 40" stroke={on ? '#C98A00' : '#5B6B8C'} strokeWidth={5} fill="none" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-30} y={56 + i * 14} width={60} height={10} rx={5} fill="#9AA6BD" />
    ))}
    <rect x={-14} y={98} width={28} height={10} rx={5} fill="#5B6B8C" />
  </g>
);
/** A stopwatch: `k` of one turn, a readout under it. */
const Stopwatch: React.FC<{k: number; text: string; c?: string}> = ({k, text, c = P.yellow}) => (
  <g>
    <rect x={-14} y={-104} width={28} height={22} rx={5} fill={P.white} />
    <circle r={86} fill={P.white} />
    <circle r={86} fill="none" stroke={c} strokeWidth={10} />
    <circle r={60} fill="none" stroke={c} strokeWidth={34} strokeDasharray={`${2 * Math.PI * 60 * k} 999`} transform="rotate(-90)" opacity={0.45} />
    <rect x={-4} y={-74} width={8} height={74} rx={4} fill={P.red} transform={`rotate(${k * 360})`} />
    <circle r={9} fill={P.ink} />
    <text y={140} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={52} fill={P.white}>
      {text}
    </text>
  </g>
);
/** A television playing a show. */
const TV: React.FC<{f: number}> = ({f}) => (
  <g>
    <rect x={-150} y={-95} width={300} height={190} rx={14} fill={P.ink} />
    <svg x={-138} y={-83} width={276} height={166} viewBox="0 0 276 166">
      <rect width={276} height={166} fill="#3D8BFF" />
      <rect y={110} width={276} height={56} fill={P.green} />
      <circle cx={220} cy={40} r={22} fill={P.yellow} />
      {[0, 1].map((i) => {
        const x = ((f * (3 + i * 2) + i * 140) % 340) - 40;
        return <rect key={i} x={x} y={74 - i * 10} width={40} height={44 + i * 10} rx={14} fill={i ? P.red : P.pink} />;
      })}
      <circle cx={138 + Math.sin(f / 6) * 80} cy={96 - Math.abs(Math.sin(f / 5)) * 50} r={12} fill={P.white} />
    </svg>
    <rect x={-40} y={95} width={80} height={14} fill="#2B3150" />
    <rect x={-80} y={109} width={160} height={10} rx={5} fill="#2B3150" />
  </g>
);
/** A Victorian steam engine: boiler, chimney with smoke, and a flywheel driven by a piston. */
const SteamEngine: React.FC<{f: number; c?: string; speed?: number}> = ({f, c = '#7A3B2E', speed = 1}) => {
  const a = (f * 0.18 * speed) % (Math.PI * 2);
  const cx = 120, cy = -20, r = 44;
  const crank: [number, number] = [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const head = 30 + Math.cos(a) * r * 0.6;
  return (
    <g>
      {Array.from({length: 5}, (_, j) => {
        const k = (f / 46 + j / 5) % 1;
        return <circle key={j} cx={-113 + k * 70} cy={-170 - k * 120} r={14 + k * 34} fill="#4A4040" opacity={(1 - k) * 0.75} />;
      })}
      <rect x={-132} y={-170} width={38} height={120} fill="#2B2424" />
      <rect x={-138} y={-176} width={50} height={14} rx={4} fill="#2B2424" />
      <rect x={-170} y={-70} width={230} height={120} rx={55} fill={c} />
      {[-120, -60, 0].map((x) => (
        <rect key={x} x={x} y={-70} width={12} height={120} fill="#C9A23A" />
      ))}
      <rect x={-170} y={14} width={64} height={36} rx={6} fill={P.orange} opacity={0.6 + 0.4 * Math.sin(f / 2.5)} />
      <rect x={20} y={-34} width={60} height={28} rx={6} fill="#5B4A44" />
      <line x1={head + 40} y1={-20} x2={crank[0]} y2={crank[1]} stroke="#C9CDD6" strokeWidth={9} strokeLinecap="round" />
      <g transform={`translate(${cx},${cy}) rotate(${(a * 180) / Math.PI})`}>
        <circle r={78} fill="none" stroke="#2B2424" strokeWidth={16} />
        {[0, 60, 120].map((d) => (
          <rect key={d} x={-78} y={-4} width={156} height={8} fill="#2B2424" transform={`rotate(${d})`} />
        ))}
      </g>
      <circle cx={crank[0]} cy={crank[1]} r={9} fill={P.yellow} />
      <rect x={-190} y={50} width={400} height={22} rx={4} fill="#2B2424" />
    </g>
  );
};
/** A pile of coal lumps (n lumps, a little pyramid). */
const Coal: React.FC<{n: number; s?: number}> = ({n, s = 1}) => {
  const lumps: [number, number][] = [];
  let row = 0, left = n;
  while (left > 0) {
    const inRow = Math.min(left, Math.max(1, 6 - row));
    for (let i = 0; i < inRow; i++) lumps.push([(i - (inRow - 1) / 2) * 34, -row * 26]);
    left -= inRow;
    row++;
  }
  return (
    <g transform={`scale(${s})`}>
      {lumps.map(([x, y], i) => (
        <path key={i} d={`M${x - 18} ${y} L${x - 10} ${y - 22} L${x + 8} ${y - 26} L${x + 19} ${y - 8} L${x + 12} ${y + 4} Z`} fill={i % 3 ? '#1B1B22' : '#33333D'} />
      ))}
    </g>
  );
};
/** A generic Victorian gentleman: dark coat and top hat. */
const Victorian: React.FC<{f: number}> = ({f}) => (
  <g>
    <Person c="#3A2E4A" skin="#E9B48A" f={f} />
    <rect x={-8} y={-40} width={16} height={34} fill={P.white} />
    <rect x={-23} y={-142} width={46} height={52} rx={4} fill={P.ink} />
    <rect x={-23} y={-104} width={46} height={8} fill={P.red} />
    <rect x={-38} y={-96} width={76} height={10} rx={5} fill={P.ink} />
  </g>
);
/** A wrench. */
const Wrench: React.FC<{c?: string}> = ({c = P.white}) => (
  <g fill={c}>
    <rect x={-10} y={-20} width={20} height={110} rx={10} />
    <path d="M-34 -40 A40 40 0 1 0 34 -40 L18 -40 L18 -66 A40 40 0 0 0 -18 -66 L-18 -40 Z" transform="translate(0,-10)" />
  </g>
);
/** A little rocket pointing up (rotate it to fly along a line). */
const Rocket: React.FC<{f: number}> = ({f}) => (
  <g>
    <path d={`M-12 34 L0 ${60 + Math.sin(f) * 10} L12 34 Z`} fill={P.orange} />
    <path d={`M-7 34 L0 ${48 + Math.sin(f * 1.3) * 6} L7 34 Z`} fill={P.yellow} />
    <path d="M0 -46 C22 -24 22 18 14 36 H-14 C-22 18 -22 -24 0 -46 Z" fill={P.white} />
    <circle cy={-6} r={9} fill={P.sky} />
    <path d="M-16 14 L-30 38 L-14 34 Z M16 14 L30 38 L14 34 Z" fill={P.red} />
  </g>
);
/** A dropper (pipette) with its tip at 0,0. */
const Dropper: React.FC = () => (
  <g>
    <rect x={-40} y={-260} width={80} height={90} rx={36} fill={P.red} />
    <rect x={-30} y={-180} width={60} height={20} rx={4} fill="#B8303A" />
    <path d="M-24 -160 H24 V-60 L6 0 H-6 L-24 -60 Z" fill="rgba(255,255,255,0.35)" stroke={P.white} strokeWidth={4} />
    <path d="M-20 -110 H20 V-62 L5 -6 H-5 L-20 -62 Z" fill={P.water} opacity={0.8} />
  </g>
);

/* ------------------------------------------------------------------ the three arguments, as a rail along the top */
const ARGS = ['A single question is tiny', 'AI is getting more efficient', 'AI could help fix it'];
const ArgRail: React.FC<{f: number; at: number; cur: number; lit: number; out?: number}> = ({f, at: a, cur, lit, out}) => {
  const k = ease(f, a, 10) * (out !== undefined ? 1 - ease(f, out, 10) : 1);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', gap: 22, opacity: k}}>
      {ARGS.map((t, i) => {
        const on = i === cur;
        const done = i < cur;
        const s = on ? 0.85 + 0.15 * pop(f, lit, 12) : 1;
        return (
          <div key={i} style={{transform: `scale(${s})`, opacity: i > cur ? 0.4 : 1}}>
            <Tag bg={on && f >= lit ? P.yellow : done ? P.white : 'rgba(255,255,255,0.14)'} color={(on && f >= lit) || done ? P.ink : P.white} size={30}>
              {done ? (
                <span style={{marginRight: 10}}>
                  <Check size={30} />
                </span>
              ) : null}
              {i + 1} · {t}
            </Tag>
          </div>
        );
      })}
    </div>
  );
};

/* ================================================================== 1. "Argument number one: a single question is tiny." + Altman's 0.34 Wh */
export const C7Tiny: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const shrink = ease(f, w(1675.2), 16);
  const bob = Math.sin(f / 14) * 8;
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.12], [1676.4, 960, 560, 1.12], [1678.2, 960, 540, 1.0, -4, 0], [1684.3, 990, 540, 1.04, 5, 0]]}>
        <World>
          <Put x={420} y={540} s={2.0} f={f} at={w(1677.69)}>
            <Person c={P.sky} f={f} />
          </Put>
          <Flow pts={[[1010, 560], [1210, 560]]} f={f} c={P.yellow} n={3} r={9} speed={4} o={ease(f, w(1680.15), 10)} />
          <Put x={940} y={560 + bob} s={lerp(2.3, 0.55, shrink)} f={f} at={w(1674.4)}>
            <Bubble />
          </Put>
        </World>
        <div style={{position: 'absolute', left: 120, width: 600, top: 740, textAlign: 'center', opacity: ease(f, w(1677.69), 10)}}>
          <Tag bg={P.white} color={P.ink} size={44}>Sam Altman</Tag>
          <Note style={{marginTop: 12}} size={28}>
            OpenAI CEO · June 2025
          </Note>
        </div>
      </Cam>
      <ArgRail f={f} at={w(1673.39)} cur={0} lit={w(1673.89)} />
      <Pop f={f} at={w(1675.23)} x={940} y={420} size={90} color={P.yellow} until={w(1677.4)}>
        tiny
      </Pop>
      <div style={{position: 'absolute', left: 1240, top: 430, opacity: ease(f, w(1681.1), 8)}}>
        <Counter f={f} start={w(1681.15)} dur={24} to={0.34} decimals={2} suffix=" Wh" size={150} color={P.yellow} />
        <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 36, color: P.white, marginTop: 10, opacity: ease(f, w(1682.44), 10)}}>per average ChatGPT question</div>
      </div>
      <Caption f={f} at={w(1679.35)} source="Sam Altman, “The Gentle Singularity”, 10 June 2025">
        His figure for one average question
      </Caption>
    </Bg>
  );
};

/* ================================================================== 2. "about what an oven uses in roughly one second. Or an efficient LED bulb in a couple of minutes." */
export const C7Oven: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const ov = lin(f, w(1686.0), w(1686.0) + 24); // one real second
  const led = lin(f, w(1687.85), w(1690.25)); // two minutes, sped up
  const secs = Math.round(led * 120);
  const bar = (x: number, k: number, c: string) => (
    <g>
      <rect x={x} y={790} width={600} height={46} rx={23} fill="rgba(255,255,255,0.14)" />
      <rect x={x} y={790} width={Math.max(46 * Math.min(1, k * 8), 600 * k)} height={46} rx={23} fill={c} opacity={k > 0 ? 1 : 0} />
      <text x={x + 300} y={824} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={k > 0.55 ? P.ink : P.white}>
        {(0.34 * k).toFixed(2)} Wh
      </text>
    </g>
  );
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 600, 540, 1.22, 8, 0], [1686.9, 600, 540, 1.18, 8, 0], [1687.8, 960, 540, 1.0, 0, 0], [1690.9, 990, 540, 1.03, -4, 0]]}>
        <World>
          <Put x={470} y={470} s={1.45} f={f} at={w(1685.1)}>
            <Oven f={f} on={ease(f, w(1685.4), 6)} />
          </Put>
          <Put x={800} y={330} s={0.62} f={f} at={w(1685.6)}>
            <Stopwatch k={ov} text={`${ov.toFixed(1)} s`} c={P.orange} />
          </Put>
          {f > w(1685.1) && bar(170, ov, P.orange)}
          <text x={470} y={730} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.white} opacity={ease(f, w(1685.2), 10)}>
            Oven · about 1 second
          </text>
          <Put x={1400} y={440} s={1.5} f={f} at={w(1687.6)}>
            <Bulb on={ease(f, w(1688.3), 8)} />
          </Put>
          <Put x={1720} y={330} s={0.62} f={f} at={w(1687.8)}>
            <Stopwatch k={led} text={`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`} c={P.yellow} />
          </Put>
          {f > w(1687.6) && bar(1100, led, P.yellow)}
          <text x={1400} y={730} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.white} opacity={ease(f, w(1687.7), 10)}>
            LED bulb · a couple of minutes
          </text>
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', opacity: ease(f, 0, 8)}}>
        <Tag bg={P.white} color={P.ink} size={40}>
          1 question ≈ <span style={{color: P.purple}}>0.34 Wh</span>
        </Tag>
      </div>
      <Caption f={f} at={w(1689.4)} source="arithmetic on Altman's 0.34 Wh">
        Same energy: about 1,200 W for 1 second, or about 10 W for 2 minutes
      </Caption>
    </Bg>
  );
};

/* ================================================================== 3. Google's Gemini: 0.24 Wh per median text prompt */
export const C7Gemini: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const MAX = 820; // px for 0.34 Wh
  const rows: {name: string; sub: string; wh: number; at: number; c: string}[] = [
    {name: 'ChatGPT', sub: 'average question · Altman', wh: 0.34, at: w(1693.3), c: '#9FB0D3'},
    {name: 'Gemini', sub: 'median text prompt · Google', wh: 0.24, at: w(1697.5), c: P.yellow},
  ];
  return (
    <Bg c={P.teal} c2="#00546E" angle={160}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.06, 0, 0], [1699.5, 960, 540, 1.0, -3, 0]]}>
        {rows.map((r, i) => {
          const k = ease(f, r.at, 24);
          const y = 330 + i * 200;
          return (
            <div key={r.name} style={{position: 'absolute', left: 0, top: y, width: 1920, height: 160, opacity: ease(f, r.at - 6, 10)}}>
              <div style={{position: 'absolute', left: 120, top: 18, width: 470, textAlign: 'right'}}>
                <Tag bg={i ? P.yellow : P.white} color={P.ink} size={44}>{r.name}</Tag>
                <Note style={{marginTop: 12}} size={26}>
                  {r.sub}
                </Note>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 640,
                  top: 30,
                  width: Math.max(8, MAX * (r.wh / 0.34) * k),
                  height: 80,
                  borderRadius: 40,
                  background: `repeating-linear-gradient(115deg, ${r.c} 0 34px, rgba(255,255,255,0.35) 34px 46px)`,
                  backgroundPosition: `${f * 3}px 0`,
                }}
              />
              <div style={{position: 'absolute', left: 640 + MAX * (r.wh / 0.34) * k + 26, top: 40, fontFamily: AF.head, fontWeight: 800, fontSize: 56, color: P.white, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
                {(r.wh * k).toFixed(2)} Wh
              </div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 640, top: 720, opacity: ease(f, w(1698.8), 10)}}>
          <Note size={28} color="rgba(255,255,255,0.85)">
            to scale · different firms, different methods (average vs median)
          </Note>
        </div>
      </Cam>
      <Label f={f} at={w(1691.09)} title="Google's own numbers" sub="Gemini · technical paper, August 2025" />
      <Caption f={f} at={w(1696.37)} source="Google technical paper, August 2025">
        About 0.24 watt-hours for a typical Gemini text prompt
      </Caption>
    </Bg>
  );
};

/* ================================================================== 4. "...about 0.26 millilitres of water, roughly five drops" */
const DROPS = [1701.9, 1702.35, 1702.8, 1703.25, 1703.7];
export const C7Drops: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const FALL = 14;
  const landed = DROPS.filter((d) => f >= w(d) + FALL).length;
  return (
    <Bg c="#0E3B6E">
      <Cam f={f} t0={t0} keys={[[t0, 960, 380, 1.45, 0, 0], [1701.6, 960, 420, 1.3, 0, 0], [1703.0, 960, 540, 1.0, 0, 6], [1704.9, 960, 540, 1.0, 0, 2]]}>
        <World>
          <Put x={960} y={330} s={1}>
            <Dropper />
          </Put>
          {/* the drop forming at the tip */}
          <Put x={960} y={345} s={0.12 + 0.1 * ((f % 12) / 12)}>
            <Drop c={P.sky} />
          </Put>
          {DROPS.map((d, i) => {
            const k = (f - w(d)) / FALL;
            if (k < 0 || k > 1) return null;
            return (
              <Put key={i} x={960} y={lerp(350, 790, k * k)} s={0.22}>
                <Drop c={P.sky} />
              </Put>
            );
          })}
          {/* the dish, a little more water with every drop */}
          <ellipse cx={960} cy={820} rx={230} ry={46} fill="rgba(255,255,255,0.22)" stroke={P.white} strokeWidth={5} />
          <ellipse cx={960} cy={822} rx={30 + landed * 30} ry={6 + landed * 5} fill={P.sky} opacity={landed ? 0.9 : 0} />
          {landed > 0 && f < w(DROPS[landed - 1]) + FALL + 14 && (
            <ellipse cx={960} cy={812} rx={40 + (f - w(DROPS[landed - 1]) - FALL) * 6} ry={10 + (f - w(DROPS[landed - 1]) - FALL)} fill="none" stroke={P.white} strokeWidth={3} opacity={1 - (f - w(DROPS[landed - 1]) - FALL) / 14} />
          )}
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 120, top: 330, opacity: ease(f, w(1699.6), 10)}}>
        <Tag bg={P.water} color={P.white} size={42}>Water per question</Tag>
        <Note style={{marginTop: 14}} size={28}>
          Gemini · median text prompt
        </Note>
      </div>
      <div style={{position: 'absolute', left: 1300, top: 300}}>
        <Counter f={f} start={w(1700.12)} dur={26} to={0.26} decimals={2} suffix=" ml" size={130} color={P.sky} />
        <div style={{display: 'flex', gap: 16, marginTop: 30, opacity: ease(f, w(1701.6), 8)}}>
          {DROPS.map((d, i) => (
            <svg key={i} width={70} height={100} viewBox="-60 -85 120 170">
              <Drop c={i < landed ? P.sky : 'rgba(255,255,255,0.18)'} />
            </svg>
          ))}
        </div>
        <Note style={{marginTop: 12, opacity: ease(f, w(1703.9), 10)}} size={28}>
          ≈ 0.05 ml a drop
        </Note>
      </div>
      <Caption f={f} at={w(1703.31)} source="Google technical paper, August 2025">
        Roughly five drops of water
      </Caption>
    </Bg>
  );
};

/* ================================================================== 5. "the energy per question had dropped about 33 times in a single year" */
export const C7Fall33: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const BASE = 800, H = 16, G = 3;
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 900, 600, 1.12, 0, 12], [1707.0, 860, 560, 1.0, -6, 6], [1710.1, 860, 540, 1.0, -2, 2]]}>
        <World>
          <rect x={300} y={BASE} width={900} height={6} rx={3} fill="rgba(255,255,255,0.4)" />
          {Array.from({length: 33}, (_, i) => {
            const k = ease(f, w(1705.6) + i * 0.6, 6);
            return k > 0 ? <rect key={i} x={450} y={BASE - (i + 1) * (H + G)} width={220} height={H} rx={4} fill={P.orange} opacity={k} transform={`translate(0,${(1 - k) * -30})`} /> : null;
          })}
          {f > w(1706.9) && <rect x={850} y={BASE - (H + G)} width={220} height={H} rx={4} fill={P.yellow} opacity={ease(f, w(1706.9), 8)} style={{filter: `drop-shadow(0 0 12px ${P.yellow})`}} />}
          <text x={560} y={BASE + 56} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={36} fill={P.white} opacity={ease(f, w(1705.7), 10)}>
            a year earlier
          </text>
          <text x={960} y={BASE + 56} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={36} fill={P.yellow} opacity={ease(f, w(1706.9), 10)}>
            a year later
          </text>
          <g opacity={ease(f, w(1706.9), 10)}>
            <path d={`M700 200 Q900 240 960 ${BASE - 40}`} stroke={P.white} strokeWidth={6} strokeDasharray="14 12" strokeDashoffset={-f * 2} fill="none" />
            <path d={`M960 ${BASE - 28} l-16 -30 h32 z`} fill={P.white} />
          </g>
        </World>
      </Cam>
      <Pop f={f} at={w(1707.51)} x={1500} y={400} size={220} color={P.yellow}>
        33×
      </Pop>
      <div style={{position: 'absolute', left: 1200, width: 600, top: 540, textAlign: 'center', opacity: ease(f, w(1707.9), 10)}}>
        <Tag bg={P.white} color={P.ink} size={40}>less energy per prompt</Tag>
        <Note style={{marginTop: 14}} size={26}>
          to scale · each block = one prompt today
        </Note>
      </div>
      <Caption f={f} at={w(1708.73)} source="Google technical paper, August 2025">
        In a single year
      </Caption>
    </Bg>
  );
};

/* ================================================================== 6. streaming one hour ≈ 80 Wh ≈ a couple of hundred AI questions */
export const C7Stream: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const BASE = 860, HMAX = 540; // 80 Wh
  const bar = ease(f, w(1714.4), 30);
  const n = 235; // 80 / 0.34
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 640, 520, 1.18, 6, 0], [1714.0, 760, 540, 1.08, 4, 0], [1716.3, 960, 540, 1.0, 0, 0], [1719.1, 980, 540, 1.02, -3, 0]]}>
        <World>
          <Put x={400} y={440} s={1.45} f={f} at={w(1710.85)}>
            <TV f={f} />
          </Put>
          <Put x={640} y={270} s={0.42} f={f} at={w(1711.49)}>
            <Clock f={f * 10} />
          </Put>
          <text x={400} y={680} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.white} opacity={ease(f, w(1711.2), 10)}>
            1 hour of video
          </text>
          <Flow pts={[[520, 600], [700, 600], [700, BASE - 20], [760, BASE - 20]]} f={f} c={P.yellow} n={5} r={8} speed={6} o={ease(f, w(1712.2), 10)} />
          {/* 80 Wh, to scale with one question next to it */}
          <rect x={780} y={BASE - HMAX * bar} width={130} height={HMAX * bar} rx={10} fill={P.yellow} />
          <text x={845} y={BASE - HMAX * bar - 22} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={50} fill={P.yellow} opacity={ease(f, w(1714.49), 10)}>
            {Math.round(80 * bar)} Wh
          </text>
          <g opacity={ease(f, w(1715.6), 10)}>
            <rect x={950} y={BASE - 3} width={130} height={3} fill={P.white} />
            <line x1={1015} y1={BASE - 8} x2={1015} y2={BASE - 120} stroke={P.white} strokeWidth={3} />
            <text x={940} y={BASE - 168} fontFamily="Poppins" fontWeight={800} fontSize={30} fill={P.white}>1 question</text>
            <text x={940} y={BASE - 132} fontFamily="Poppins" fontWeight={700} fontSize={28} fill="rgba(255,255,255,0.75)">0.34 Wh</text>
          </g>
          <rect x={760} y={BASE} width={360} height={5} fill="rgba(255,255,255,0.5)" />
          <Flow pts={[[910, 300], [1240, 300], [1240, 470]]} f={f} c={P.sky} n={4} r={8} speed={7} o={ease(f, w(1716.4), 10)} />
        </World>
        {/* the same energy as AI questions */}
        <div style={{position: 'absolute', left: 1270, top: 520, display: 'grid', gridTemplateColumns: 'repeat(20, 22px)', gap: 5}}>
          {Array.from({length: 240}, (_, i) => {
            const on = i < n && f >= w(1716.45) + i * 0.2;
            return <div key={i} style={{width: 22, height: 18, borderRadius: '8px 8px 8px 2px', background: on ? P.sky : 'transparent', transform: on ? `scale(${Math.min(1.1, pop(f, w(1716.45) + i * 0.2, 6))})` : undefined}} />;
          })}
        </div>
        <div style={{position: 'absolute', left: 1270, top: 300, opacity: ease(f, w(1716.4), 8)}}>
          <Counter f={f} start={w(1716.45)} dur={48} to={n} prefix="≈ " size={90} color={P.sky} />
          <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 32, color: P.white, marginTop: 4, whiteSpace: 'nowrap'}}>AI questions (80 ÷ 0.34)</div>
        </div>
      </Cam>
      <Caption f={f} at={w(1714.49)} source="IEA, George Kamiya (2020) · by some estimates">
        Streaming one hour of video ≈ 80 Wh ≈ a couple of hundred questions
      </Caption>
    </Bg>
  );
};

/* ================================================================== 7. "Argument number two: AI is getting more efficient. Fast." + chip generations */
export const C7Arg2: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const gens: [string, number, number][] = [['Older chip', 2, 3], ['Newer', 4, 5], ['Newest', 8, 7]];
  const chipsOn = w(1724.05);
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.0], [1723.4, 960, 560, 1.05], [1724.5, 960, 1600, 1.0, 0, 6], [1727.0, 990, 1600, 1.05, -6, 6]]}>
        <World w={1920} h={2200}>
          {/* the claim */}
          <g transform={`translate(960,470) scale(${pop(f, w(1721.59), 12)})`}>
            <text textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={120} fill={P.white}>
              More efficient.
            </text>
          </g>
          <g transform={`translate(960,690) scale(${pop(f, w(1722.49), 10)}) skewX(-12)`}>
            {[0, 1, 2].map((i) => (
              <rect key={i} x={-470 - i * 40 - ((f * 12) % 60)} y={-70 + i * 34} width={160} height={12} rx={6} fill={P.yellow} opacity={0.6} />
            ))}
            <text textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={190} fill={P.yellow}>
              Fast.
            </text>
          </g>
          {/* every new generation of chips: same power in, more work out */}
          <text x={960} y={1260} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={52} fill={P.yellow} opacity={ease(f, w(1725.9), 10)}>
            Same power in
          </text>
          {gens.map(([name, nOut, sp], i) => {
            const x = 420 + i * 520;
            return (
              <g key={name} opacity={ease(f, chipsOn + i * 4, 8)}>
                <Flow pts={[[x, 1300], [x, 1500]]} f={f} c={P.yellow} n={3} r={10} speed={4} />
                <Put x={x} y={1600} s={0.9}>
                  <Chip f={f} on={1} c={['#3A5A40', '#1D6B3A', P.green][i]} />
                </Put>
                <Flow pts={[[x + 100, 1600], [x + 330, 1600]]} f={f} c={P.grass} n={nOut} r={10} speed={sp} />
                <text x={x} y={1770} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.white}>
                  {name}
                </text>
              </g>
            );
          })}
          <text x={960} y={1870} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={52} fill={P.grass} opacity={ease(f, w(1725.43), 10)}>
            More work out
          </text>
        </World>
      </Cam>
      <ArgRail f={f} at={w(1719.27)} cur={1} lit={w(1719.55)} out={w(1723.6)} />
      <Note style={{position: 'absolute', right: 80, bottom: 70, opacity: ease(f, w(1724.6), 10)}} size={26}>
        illustration
      </Note>
    </Bg>
  );
};

/* ================================================================== 8. DeepSeek, early 2025: "a small fraction of what American companies were spending" */
export const C7DeepSeek: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const shock = w(1730.47);
  const phaseB = ease(f, w(1732.6), 14);
  return (
    <Bg c="#1B1446">
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.08], [1732.4, 960, 540, 1.0], [1733.6, 2880, 540, 1.0, -8, 4], [1738.3, 2880, 520, 0.96, 5, 4]]}>
        <World w={3840} h={1080}>
          {/* A: the shockwave through the industry */}
          <rect x={0} y={860} width={1920} height={220} fill="#120D33" />
          {Array.from({length: 4}, (_, j) => {
            const k = (f - shock - j * 9) / 40;
            if (k < 0 || k > 1) return null;
            return <circle key={j} cx={960} cy={380} r={60 + k * 1100} fill="none" stroke={P.yellow} strokeWidth={10 * (1 - k) + 2} opacity={1 - k} />;
          })}
          {[180, 420, 660, 1260, 1500, 1740].map((x, i) => {
            const d = Math.hypot(x - 960, 860 - 380);
            const hit = f - shock - ((d - 60) / 1100) * 40;
            const wob = hit > 0 && hit < 30 ? Math.sin(hit / 1.6) * 8 * (1 - hit / 30) : 0;
            return (
              <Put key={x} x={x} y={860} s={1.1} rot={wob} f={f} at={i * 2}>
                <Office f={f} floors={6 + (i % 3) * 2} c={['#3A4F8F', '#4A3F8F', '#2F5A8F'][i % 3]} />
              </Put>
            );
          })}
          {/* B: the claim: a small stack next to a tall one */}
          <rect x={1920} y={840} width={1920} height={240} fill="#120D33" />
          {Array.from({length: 3}, (_, i) => (
            <g key={i} transform={`translate(2400,${800 - i * 30}) scale(1.3)`} opacity={ease(f, w(1734.99) + i * 2, 6)}>
              <Coin label="$" />
            </g>
          ))}
          {Array.from({length: 19}, (_, i) => (
            <g key={i} transform={`translate(3260,${800 - i * 30}) scale(1.3)`} opacity={ease(f, w(1736.27) + i * 0.8, 5)}>
              <Coin label="$" />
            </g>
          ))}
          <text x={2400} y={910} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.yellow} opacity={ease(f, w(1735.0), 10)}>
            DeepSeek's claimed cost
          </text>
          <text x={3260} y={910} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.white} opacity={ease(f, w(1736.3), 10)}>
            US companies' spending
          </text>
          <g opacity={ease(f, w(1733.5), 10)}>
            <rect x={2220} y={480} width={360} height={90} rx={45} fill={P.white} />
            <text x={2400} y={538} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={34} fill={P.ink}>
              a powerful model
            </text>
            <path d="M2400 580 V700" stroke={P.white} strokeWidth={5} strokeDasharray="10 8" />
          </g>
        </World>
        <div style={{position: 'absolute', left: 960, top: 380, transform: `translate(-50%,-50%) scale(${pop(f, w(1729.87), 12)})`, opacity: 1 - phaseB, textAlign: 'center'}}>
          <Tag bg={P.yellow} color={P.ink} size={64}>DeepSeek</Tag>
          <Note style={{marginTop: 14}} size={30}>
            a Chinese AI company
          </Note>
        </div>
      </Cam>
      <Label f={f} at={w(1727.31)} title="Early 2025" bg={P.yellow} />
      <Caption f={f} at={w(1731.43)} until={w(1732.6)}>
        It shocked the industry
      </Caption>
      <Note style={{position: 'absolute', right: 80, top: 90, opacity: phaseB}} size={26}>
        illustration · DeepSeek's own claim, not to scale
      </Note>
    </Bg>
  );
};

/* ================================================================== 9. "Argument number three: AI could help fix the very problems it creates." */
export const C7Arg3: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const fix = w(1741.13), probs = w(1742.03), creates = w(1742.49);
  const top: [number, number][] = [[700, 460], [960, 330], [1220, 460]];
  const bot: [number, number][] = [[1220, 700], [960, 830], [700, 700]];
  return (
    <Bg c={P.teal} c2="#00546E" angle={160}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 600, 1.1, 0, 0], [1743.9, 960, 580, 1.0, 6, 4]]}>
        <World>
          <Flow pts={top} f={f} c={P.red} n={4} r={10} speed={6} o={ease(f, creates, 10)} />
          <Flow pts={bot} f={f} c={P.grass} n={4} r={10} speed={6} o={ease(f, fix + 4, 10)} />
          <g transform={`translate(560,580) scale(${pop(f, w(1740.13), 12)})`}>
            <circle r={130} fill={P.navy} />
            <g transform="scale(0.8)">
              <Chip f={f} on={1} c="#1D6B3A" />
            </g>
          </g>
          <text x={560} y={770} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.white} opacity={ease(f, w(1740.13), 10)}>
            AI
          </text>
          {[
            [1320, 470, <Bolt c={P.yellow} key="b" />],
            [1470, 580, <Drop c={P.sky} key="d" />],
            [1320, 690, <Thermometer level={0.8} key="t" />],
          ].map(([x, y, el], i) => (
            <Put key={i} x={x as number} y={y as number} s={0.62} f={f} at={probs + i * 3}>
              {el as React.ReactNode}
            </Put>
          ))}
          <text x={1400} y={820} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={40} fill={P.white} opacity={ease(f, probs, 10)}>
            power · water · heat
          </text>
          <text x={960} y={300} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={40} fill={P.red} opacity={ease(f, creates, 10)}>
            creates
          </text>
          <Put x={960} y={870} s={0.5} f={f} at={fix} rot={-30 + Math.sin(f / 5) * 12}>
            <Wrench c={P.grass} />
          </Put>
          <text x={1060} y={890} fontFamily="Poppins" fontWeight={800} fontSize={40} fill={P.grass} opacity={ease(f, fix, 10)}>
            could help fix
          </text>
        </World>
      </Cam>
      <ArgRail f={f} at={w(1738.47)} cur={2} lit={w(1739.19)} />
    </Bg>
  );
};

/* ================================================================== 10. DeepMind 2016: cooling energy cut by up to 40% */
export const C7Cooling: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const cut = ease(f, w(1748.47), w(1751.79) - w(1748.47));
  const level = 1 - 0.4 * cut;
  const fanF = f * lerp(1, 0.6, cut);
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 860, 560, 1.12, -10, 6], [1748.3, 900, 560, 1.02, -4, 2], [1753.2, 920, 560, 1.0, 5, 2]]}>
        <World>
          {/* the hall in cross-section */}
          <rect x={140} y={380} width={940} height={460} rx={14} fill="#1B2C6B" stroke="#9FB0D3" strokeWidth={6} />
          {[260, 440, 620, 800, 960].map((x, i) => (
            <g key={x} transform={`translate(${x},620) scale(0.9)`}>
              <Rack f={f + i * 4} busy={1} />
            </g>
          ))}
          {/* roof cooling and the chilled-water loop */}
          {[300, 610, 920].map((x) => (
            <g key={x} transform={`translate(${x},320) scale(0.55)`}>
              <Fan f={fanF} />
            </g>
          ))}
          <Pipe pts={[[180, 800], [1040, 800], [1040, 420], [180, 420]]} f={f * lerp(1, 0.6, cut)} />
          {/* the AI controller */}
          <Put x={1450} y={380} s={1} f={f} at={w(1746.57)}>
            <g>
              <rect x={-170} y={-110} width={340} height={220} rx={24} fill={P.purple} />
              <g transform="translate(-90,0) scale(0.55)">
                <Chip f={f} on={1} c="#2A1B5E" />
              </g>
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${30 + i * 50},${-40 + (i % 2) * 70})`}>
                  <circle r={20} fill={P.white} />
                  <rect x={-3} y={-18} width={6} height={18} rx={3} fill={P.ink} transform={`rotate(${Math.sin(f / 9 + i * 2) * 70})`} />
                </g>
              ))}
            </g>
          </Put>
          <text x={1450} y={540} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={40} fill={P.white} opacity={ease(f, w(1747.45), 10)}>
            AI controls the cooling
          </text>
          <Flow pts={[[1280, 380], [1080, 330], [960, 330]]} f={f} c={P.pink} n={4} r={8} speed={6} o={ease(f, w(1747.8), 10)} />
        </World>
      </Cam>
      {/* energy used for cooling, to scale */}
      <div style={{position: 'absolute', left: 1180, top: 650, width: 640, opacity: ease(f, w(1748.6), 10)}}>
        <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 34, color: P.white, marginBottom: 12}}>Energy used for cooling</div>
        <div style={{position: 'relative', height: 60, borderRadius: 30, background: 'rgba(255,255,255,0.14)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${level * 100}%`, borderRadius: 30, background: P.sky}} />
          <div style={{position: 'absolute', left: `${level * 100}%`, right: 0, top: 0, bottom: 0, borderRadius: '0 30px 30px 0', border: `4px dashed ${P.pink}`, opacity: cut}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: AF.head, fontWeight: 800, fontSize: 36, color: P.white}}>
          <span>{Math.round(level * 100)}%</span>
          <span style={{color: P.pink, opacity: cut}}>up to −40%</span>
        </div>
      </div>
      <Label f={f} at={w(1744.69)} title="2016 · Google's DeepMind" sub="AI lab · Google data centres" />
      <Caption f={f} at={w(1751.79)} source="DeepMind blog, 20 July 2016">
        Cooling energy cut by up to 40%
      </Caption>
    </Bg>
  );
};

/* ================================================================== 11. weather, batteries, materials, power grids */
const PANELS: {title: string; at: number; c: string}[] = [
  {title: 'Forecast weather', at: 1755.05, c: '#2F6BFF'},
  {title: 'Design better batteries', at: 1756.43, c: '#16865A'},
  {title: 'Discover new materials', at: 1757.41, c: '#6A3FD6'},
  {title: 'Manage power grids', at: 1758.99, c: '#C2561A'},
];
export const C7Uses: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const cx = (i: number) => 600 + i * 860;
  return (
    <Bg c="#1E1650">
      <Cam f={f} t0={t0} keys={[[t0, 1890, 600, 0.5], [1754.4, 1890, 600, 0.5], [1755.3, 600, 600, 1.08], [1756.4, 1460, 600, 1.08, -5], [1757.4, 2320, 600, 1.08, -5], [1758.9, 3180, 600, 1.08, -5], [1759.9, 1890, 610, 0.5]]}>
        <World w={3800} h={1200}>
          {PANELS.map((p, i) => {
            const k = ease(f, w(p.at), 12);
            const x0 = cx(i);
            return (
              <g key={p.title} transform={`translate(${x0},600)`}>
                <rect x={-380} y={-290} width={760} height={580} rx={36} fill={k > 0 ? p.c : '#2C2470'} />
                <g opacity={k}>
                  {i === 0 && (
                    <g>
                      <g transform="translate(-140,-40) scale(1.25)">
                        <Globe f={f} />
                      </g>
                      {[0, 1, 2].map((j) => (
                        <circle key={j} cx={-140} cy={-40} r={40 + j * 34} fill="none" stroke={P.white} strokeWidth={5} strokeDasharray="30 18" strokeDashoffset={f * (2 + j)} opacity={0.75} />
                      ))}
                      {['☀', '☁', '☂'].map((_, j) => (
                        <g key={j} transform={`translate(${160 + (j % 2) * 0},${-160 + j * 110}) scale(0.45)`}>
                          {j === 0 ? <Sun f={f} /> : <path d="M-80 40 Q-120 40 -110 10 Q-100 -20 -65 -15 Q-55 -60 -5 -50 Q25 -80 65 -45 Q115 -45 110 0 Q120 40 80 40 Z" fill={P.white} />}
                          {j === 2 &&
                            [0, 1, 2].map((r) => <rect key={r} x={-50 + r * 40} y={50 + ((f * 3 + r * 13) % 40)} width={8} height={24} rx={4} fill={P.sky} />)}
                        </g>
                      ))}
                    </g>
                  )}
                  {i === 1 && (
                    <g>
                      <g transform="translate(0,-50) scale(2)">
                        <Battery level={0.25 + 0.7 * ((f / 60) % 1)} c={P.grass} />
                      </g>
                      <g transform="translate(0,-50) scale(0.5)">
                        <Bolt c={P.yellow} />
                      </g>
                    </g>
                  )}
                  {i === 2 &&
                    (() => {
                      const pts: [number, number, number][] = [];
                      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) pts.push([a, b, c]);
                      const ang = f / 30;
                      const pr = ([a, b, c]: [number, number, number]) => {
                        const x = a * Math.cos(ang) - c * Math.sin(ang);
                        const z = a * Math.sin(ang) + c * Math.cos(ang);
                        const y = b * Math.cos(0.5) - z * Math.sin(0.5);
                        return [x * 110, y * 110 - 50, z] as [number, number, number];
                      };
                      const P3 = pts.map(pr);
                      return (
                        <g>
                          {pts.map((p, ia) =>
                            pts.map((q, ib) => {
                              if (ib <= ia) return null;
                              const d = Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]);
                              return d === 1 ? <line key={`${ia}-${ib}`} x1={P3[ia][0]} y1={P3[ia][1]} x2={P3[ib][0]} y2={P3[ib][1]} stroke="rgba(255,255,255,0.6)" strokeWidth={5} /> : null;
                            }),
                          )}
                          {P3.map((p, j) => (
                            <circle key={j} cx={p[0]} cy={p[1]} r={16 + p[2] * 4} fill={(pts[j][0] + pts[j][1] + pts[j][2]) % 2 ? P.yellow : P.pink} />
                          ))}
                        </g>
                      );
                    })()}
                  {i === 3 && (
                    <g>
                      <g transform="translate(-250,-70) scale(0.55)">
                        <WindTurbine f={f} />
                      </g>
                      <g transform="translate(-250,-130) scale(0.6)">
                        <SolarPanel />
                      </g>
                      <g transform="translate(0,-60) scale(0.9)">
                        <Pylon c={P.white} />
                      </g>
                      <g transform="translate(250,-30) scale(0.9)">
                        <House c={P.teal} on={1} />
                      </g>
                      <Flow pts={[[-200, -160], [0, -140], [200, -60]]} f={f} c={P.yellow} n={5} r={9} speed={6} />
                    </g>
                  )}
                </g>
                <text y={230} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={64} fill={P.white} opacity={0.35 + 0.65 * k}>
                  {p.title}
                </text>
              </g>
            );
          })}
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', opacity: ease(f, w(1753.45), 10)}}>
        <Tag bg={P.white} color={P.ink} size={42}>AI is now being used to…</Tag>
      </div>
    </Bg>
  );
};

/* ================================================================== 12. "the tech giants are some of the biggest buyers of solar and wind power in the world" */
export const C7Buyers: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const sol = w(1763.65), wind = w(1764.27);
  return (
    <Bg c={P.sky} c2="#BDE6FF" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 600, 1.2, 0, 10], [1762.4, 960, 580, 1.08, -4, 8], [1765.5, 960, 560, 1.0, 4, 4]]}>
        <World>
          <rect x={-400} y={640} width={2720} height={700} fill={P.grass} />
          <rect x={-400} y={640} width={2720} height={18} fill="#5DBB4F" />
          <Put x={1600} y={200} s={0.9}>
            <Sun f={f} />
          </Put>
          {/* solar field */}
          {Array.from({length: 9}, (_, i) => (
            <Put key={i} x={190 + (i % 3) * 190 + Math.floor(i / 3) * 30} y={720 + Math.floor(i / 3) * 90} s={0.75} f={f} at={sol - 10 + i * 1.5}>
              <SolarPanel />
            </Put>
          ))}
          {/* wind */}
          {[1380, 1560, 1740].map((x, i) => (
            <Put key={x} x={x} y={480 + i * 20} s={1.1 - i * 0.08} f={f + i * 10} at={wind - 10 + i * 3}>
              <WindTurbine f={f + i * 10} />
            </Put>
          ))}
          {/* the data centres they feed */}
          <Put x={900} y={560} s={1.25}>
            <DataCentre f={f} />
          </Put>
          <Flow pts={[[520, 700], [700, 620], [760, 580]]} f={f} c={P.yellow} n={5} r={10} speed={6} o={ease(f, sol, 10)} />
          <Flow pts={[[1380, 560], [1200, 600], [1090, 580]]} f={f} c={P.yellow} n={5} r={10} speed={6} o={ease(f, wind, 10)} />
        </World>
        <div style={{position: 'absolute', left: 900, top: 340, transform: 'translate(-50%,0)', opacity: ease(f, w(1761.13), 10)}}>
          <Tag bg={P.ink} color={P.white} size={40}>Tech giants</Tag>
        </div>
        <div style={{position: 'absolute', left: 320, top: 480, transform: `translate(-50%,0) scale(${pop(f, sol, 12)})`}}>
          <Tag bg={P.yellow} color={P.ink} size={40}>Solar</Tag>
        </div>
        <div style={{position: 'absolute', left: 1560, top: 250, transform: `translate(-50%,0) scale(${pop(f, wind, 12)})`}}>
          <Tag bg={P.white} color={P.ink} size={40}>Wind</Tag>
        </div>
      </Cam>
      <Caption f={f} at={w(1762.45)} dark>
        Some of the biggest buyers of solar and wind power in the world
      </Caption>
    </Bg>
  );
};

/* ================================================================== 13. "These are real points. They matter." */
export const C7Real: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const ticks = [w(1765.91), w(1766.2), w(1766.5)];
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.06, -4, 0], [1768.9, 960, 540, 1.0, 4, 0]]}>
        <div style={{position: 'absolute', left: 0, width: 1920, top: 330, display: 'flex', justifyContent: 'center', gap: 50}}>
          {ARGS.map((t, i) => (
            <div key={t} style={{width: 500, height: 260, borderRadius: 34, background: P.white, padding: '34px 30px', boxSizing: 'border-box', transform: `translateY(${Math.sin(f / 16 + i) * 6}px)`, position: 'relative'}}>
              <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 70, color: P.purple, lineHeight: 1}}>{i + 1}</div>
              <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 40, color: P.ink, marginTop: 14, lineHeight: 1.15}}>{t}</div>
              <div style={{position: 'absolute', right: -20, top: -20, transform: `scale(${pop(f, ticks[i], 10)})`}}>
                <Check size={84} />
              </div>
            </div>
          ))}
        </div>
      </Cam>
      <Pop f={f} at={w(1765.91)} x={960} y={170} size={84}>
        Real points.
      </Pop>
      <Pop f={f} at={w(1767.23)} x={960} y={760} size={84} color={P.yellow}>
        They matter.
      </Pop>
    </Bg>
  );
};

/* ================================================================== 14. "But there's a problem. And it has a name. In 1865... William Stanley Jevons noticed something strange." */
export const C7Name: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const past = ease(f, w(1772.09), 18);
  const named = ease(f, w(1774.51), 10);
  return (
    <Bg c={P.night}>
      {/* 1865: smoke over an English town */}
      <AbsoluteFill style={{opacity: past, background: 'linear-gradient(#F2B36B, #F7D9A6)'}}>
        <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.0], [1772.2, 960, 560, 1.0], [1778.6, 1100, 540, 1.12, -4, 0]]}>
          <World>
            <rect x={-200} y={760} width={2400} height={400} fill="#8E6A4E" />
            {[120, 330, 560, 1650, 1850].map((x, i) => (
              <g key={x}>
                {Array.from({length: 4}, (_, j) => {
                  const k = (f / 50 + j / 4 + i * 0.2) % 1;
                  return <circle key={j} cx={x + 20 + k * 90} cy={330 - k * 200} r={20 + k * 40} fill="#5A4A4A" opacity={(1 - k) * 0.6} />;
                })}
                <rect x={x} y={340} width={40} height={420} fill="#4A3030" />
                <rect x={x - 60} y={560 + (i % 2) * 40} width={160} height={200} fill="#6A4030" />
              </g>
            ))}
            <Put x={1340} y={590} s={2.0} f={f} at={w(1774.51)}>
              <Victorian f={f} />
            </Put>
            {f > w(1776.63) && (
              <g transform={`translate(1430,${270 + Math.sin(f / 6) * 6}) scale(${pop(f, w(1776.63), 12)})`}>
                <circle r={60} fill={P.white} />
                <text y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={90} fill={P.red}>
                  ?
                </text>
              </g>
            )}
          </World>
        </Cam>
        <Label f={f} at={w(1772.23)} title="1865 · Britain" sub="steam engines run on coal" bg={P.ink} color={P.white} />
      </AbsoluteFill>
      {/* the problem and its name */}
      <Pop f={f} at={w(1769.65)} x={960} y={380} size={100} color={P.white} until={w(1771.9)}>
        But there's a <span style={{color: P.red}}>problem</span>
      </Pop>
      <div
        style={{
          position: 'absolute',
          left: lerp(960, 640, past),
          top: lerp(620, 480, past),
          transform: `translate(-50%,-50%) scale(${pop(f, w(1771.03), 12)})`,
          textAlign: 'center',
        }}
      >
        <div style={{background: P.white, borderRadius: 30, padding: '22px 44px', boxShadow: '0 16px 40px rgba(0,0,0,0.35)', minWidth: 520}}>
          <Note size={26} color="rgba(16,19,34,0.6)">
            it has a name
          </Note>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 64, color: P.ink, marginTop: 6, whiteSpace: 'nowrap'}}>
            {named > 0 ? (
              <span style={{opacity: named}}>William Stanley Jevons</span>
            ) : (
              <span style={{letterSpacing: '0.2em', color: '#C5CCD8'}}>? ? ?</span>
            )}
          </div>
          <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 32, color: '#5B6B8C', marginTop: 6, opacity: ease(f, w(1773.29), 10)}}>English economist</div>
        </div>
        <Note style={{marginTop: 16, opacity: ease(f, w(1775.4), 10)}} size={26} color={P.ink}>
          wrote “The Coal Question” (1865)
        </Note>
      </div>
    </Bg>
  );
};

/* ------------------------------------------------------------------ the coal chart (screen coordinates; scene 15 draws it 1920 px to the right) */
const CH = {x0: 240, x1: 1680, y0: 860, y1: 260, p0: [300, 560] as [number, number], exp: [1620, 790] as [number, number]};
const ACTUAL = `M${CH.p0[0]} ${CH.p0[1]} C 800 545, 1200 470, 1620 280`;
const CoalChart: React.FC<{f: number; exp: number; act: number}> = ({f, exp, act}) => {
  const e = [lerp(CH.p0[0], CH.exp[0], exp), lerp(CH.p0[1], CH.exp[1], exp)];
  return (
    <g>
      <path d={`M${CH.x0} ${CH.y1} V${CH.y0} H${CH.x1}`} stroke={P.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
      <text x={CH.x0 + 20} y={CH.y1 - 10} fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.ink}>
        Britain's coal use
      </text>
      <text x={CH.x1} y={CH.y0 + 50} textAnchor="end" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={P.ink}>
        engines get more efficient →
      </text>
      <text x={CH.x0 + 24} y={CH.y0 - 24} fontFamily="IBM Plex Mono" fontWeight={600} fontSize={28} fill="rgba(16,19,34,0.6)">
        ILLUSTRATION
      </text>
      <circle cx={CH.p0[0]} cy={CH.p0[1]} r={14} fill={P.ink} />
      {exp > 0 && (
        <g>
          <line x1={CH.p0[0]} y1={CH.p0[1]} x2={e[0]} y2={e[1]} stroke="#4A5578" strokeWidth={10} strokeDasharray="26 18" strokeLinecap="round" strokeDashoffset={-f} />
          <text x={CH.exp[0] - 10} y={CH.exp[1] + 54} textAnchor="end" fontFamily="Poppins" fontWeight={800} fontSize={40} fill="#4A5578" opacity={exp}>
            expected: less
          </text>
        </g>
      )}
      {act > 0 && (
        <g>
          <path d={ACTUAL} pathLength={1} stroke={P.red} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={`${act} 2`} />
          <text x={1660} y={455} textAnchor="end" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.red} opacity={clamp01(act * 3 - 2)}>
            actual: more
          </text>
        </g>
      )}
    </g>
  );
};

/* ================================================================== 15. "Steam engines were getting much more efficient. ... you'd expect Britain to use less coal." */
export const C7Steam: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const less = ease(f, w(1781.45), 16);
  const exp = ease(f, w(1784.21), w(1785.6) - w(1784.21));
  return (
    <Bg c="#F6B26B" c2="#F7D9A6" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 520, 1.12, 0, 8], [1783.4, 960, 540, 1.0, -6, 4], [1784.3, 2880, 540, 1.0, 0, 0], [1786.4, 2880, 540, 1.0, 0, 0]]}>
        <World w={3840} h={1080}>
          <rect x={0} y={700} width={1920} height={380} fill="#8E6A4E" />
          {[0, 1].map((i) => {
            const x = 520 + i * 880;
            const n = i ? Math.round(lerp(10, 4, less)) : 10;
            return (
              <g key={i}>
                <Put x={x} y={560} s={1.2} f={f} at={w(1778.73) + i * 6}>
                  <SteamEngine f={f + i * 7} c={i ? '#2F5A8F' : '#7A3B2E'} />
                </Put>
                <Put x={x - 260} y={790} s={1.6}>
                  <Coal n={n} />
                </Put>
                <Flow pts={[[x - 250, 640], [x - 170, 600]]} f={f} c={P.ink} n={i ? 1 : 3} r={8} speed={3} line={false} />
                <text x={x} y={870} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.white} opacity={ease(f, w(1779.2) + i * 6, 10)}>
                  {i ? 'Newer engine' : 'Older engine'}
                </text>
                <text x={x} y={920} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={i ? P.yellow : 'rgba(255,255,255,0.8)'} opacity={ease(f, w(1781.3), 10)}>
                  {i ? 'same work · less coal' : 'same work · more coal'}
                </text>
              </g>
            );
          })}
          <g transform="translate(1920,0)">
            <rect x={0} y={0} width={1920} height={1080} fill="#F7D9A6" />
            <CoalChart f={f} exp={exp} act={0} />
          </g>
        </World>
      </Cam>
      <Label f={f} at={w(1780.41)} title="Steam engines: much more efficient" bg={P.ink} color={P.white} />
    </Bg>
  );
};

/* ================================================================== 16. "It used more." ... "That's called the Jevons paradox." */
export const C7More: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const act = ease(f, w(1786.6), 22);
  const cheap = w(1789.49), eff = w(1790.47), more = w(1791.45);
  return (
    <Bg c="#F7D9A6" c2="#F6B26B" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.0], [1787.9, 960, 540, 1.0], [1789.0, 1350, 560, 0.78, -4, 0], [1795.5, 1350, 560, 0.8, 3, 0]]}>
        <World w={2600} h={1080}>
          <CoalChart f={f} exp={1} act={act} />
          {/* along the red line: more and more engines */}
          {Array.from({length: 7}, (_, i) => {
            const x = 520 + i * 170;
            const y = 520 - i * 34 - (i > 4 ? (i - 4) * 30 : 0);
            return (
              <Put key={i} x={x} y={y - 60} s={0.32} f={f} at={more + i * 2}>
                <SteamEngine f={f + i * 5} c={P.red} />
              </Put>
            );
          })}
          {/* why: cheaper + more efficient → far more use */}
          <g transform={`translate(2110,330) scale(${pop(f, cheap, 12)})`}>
            <rect x={-260} y={-50} width={520} height={100} rx={50} fill={P.white} />
            <text y={16} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={48} fill={P.ink}>
              cheaper
            </text>
          </g>
          <g transform={`translate(2110,460) scale(${pop(f, eff, 12)})`}>
            <rect x={-260} y={-50} width={520} height={100} rx={50} fill={P.white} />
            <text y={16} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={48} fill={P.ink}>
              more efficient
            </text>
          </g>
          <g opacity={ease(f, more, 10)}>
            <path d="M2110 530 V600" stroke={P.ink} strokeWidth={8} />
            <path d="M2110 625 l-22 -30 h44 z" fill={P.ink} />
            <rect x={1850} y={640} width={520} height={110} rx={55} fill={P.red} />
            <text x={2110} y={712} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={52} fill={P.white}>
              far more use
            </text>
          </g>
        </World>
      </Cam>
      <Pop f={f} at={w(1786.77)} x={960} y={150} size={100} color={P.red} until={w(1788.6)}>
        It used more.
      </Pop>
      <Pop f={f} at={w(1793.97)} x={960} y={110} size={96} color={P.ink}>
        <span style={{background: P.yellow, borderRadius: 30, padding: '8px 36px'}}>The Jevons paradox</span>
      </Pop>
    </Bg>
  );
};

/* ================================================================== 17. January 2025: right after DeepSeek, Nadella posts about Jevons */
export const C7Post: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const quote = 'Jevons paradox strikes again!';
  const typed = Math.round(quote.length * lin(f, w(1803.79), w(1804.9)));
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 520, 1.0, 0, 0], [1801.8, 960, 520, 1.0, 0, 0], [1803.0, 960, 560, 1.1, 8, 4], [1805.7, 960, 560, 1.16, -4, 4]]}>
        <World>
          <line x1={360} y1={230} x2={1560} y2={230} stroke="rgba(255,255,255,0.3)" strokeWidth={8} strokeLinecap="round" />
          <line x1={560} y1={230} x2={lerp(560, 1360, ease(f, w(1800.2), 40))} y2={230} stroke={P.yellow} strokeWidth={8} strokeLinecap="round" opacity={ease(f, w(1800.2), 6)} />
          {f > w(1798.79) &&
            [0, 1, 2].map((j) => {
              const k = ((f - w(1798.79)) / 36 + j / 3) % 1;
              return <circle key={j} cx={560} cy={230} r={24 + k * 80} fill="none" stroke={P.yellow} strokeWidth={6} opacity={(1 - k) * 0.8} />;
            })}
          <circle cx={560} cy={230} r={20 * pop(f, w(1798.79), 12)} fill={P.yellow} />
          <circle cx={1360} cy={230} r={20 * pop(f, w(1803.13), 12)} fill={P.white} />
          <text x={560} y={300} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={36} fill={P.yellow} opacity={ease(f, w(1798.79), 10)}>
            DeepSeek's announcement
          </text>
          <text x={1360} y={300} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={36} fill={P.white} opacity={ease(f, w(1803.13), 10)}>
            a post online
          </text>
        </World>
        <div style={{position: 'absolute', left: 460, top: 400, width: 1000, borderRadius: 34, background: P.white, padding: '34px 44px', boxSizing: 'border-box', opacity: ease(f, w(1800.19), 10), transform: `translateY(${(1 - ease(f, w(1800.19), 14)) * 40}px)`, boxShadow: '0 30px 70px rgba(0,0,0,0.4)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
            <svg width={100} height={100} viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} fill="#D5DBE8" />
              <circle cx={50} cy={40} r={18} fill="#9AA6BD" />
              <path d="M18 86 C24 62 76 62 82 86 Z" fill="#9AA6BD" />
            </svg>
            <div>
              <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 46, color: P.ink, lineHeight: 1.1, opacity: ease(f, w(1802.11), 10)}}>Satya Nadella</div>
              <div style={{fontFamily: AF.head, fontWeight: 600, fontSize: 32, color: '#5B6B8C', opacity: ease(f, w(1800.19), 10)}}>CEO, Microsoft</div>
            </div>
          </div>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 64, color: P.ink, marginTop: 26, minHeight: 80, whiteSpace: 'nowrap'}}>
            {quote.slice(0, typed)}
            <span style={{opacity: Math.floor(f / 8) % 2 && typed < quote.length ? 1 : 0, color: P.blue}}>|</span>
          </div>
        </div>
      </Cam>
      <Label f={f} at={w(1795.85)} title="January 2025" bg={P.yellow} />
      <Note style={{position: 'absolute', left: 0, right: 0, bottom: 80, textAlign: 'center', opacity: ease(f, w(1804.4), 10)}} size={26}>
        Source · Satya Nadella on X · news coverage, 27 January 2025
      </Note>
    </Bg>
  );
};

/* ================================================================== 18. "His point: as AI gets cheaper, demand for it will skyrocket." */
export const C7Demand: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const cheap = ease(f, w(1807.65), 20);
  const rocket = lin(f, w(1809.1), w(1810.6));
  const curve = (k: number): [number, number] => [300 + 1300 * k, 820 - 560 * Math.pow(k, 2.6)];
  const pts = Array.from({length: 41}, (_, i) => curve((i / 40) * rocket));
  const tip = curve(rocket);
  const tip2 = curve(Math.max(0, rocket - 0.02));
  const ang = (Math.atan2(tip[1] - tip2[1], tip[0] - tip2[0]) * 180) / Math.PI + 90;
  return (
    <Bg c="#1B1446">
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.0, 0, 6], [1809.0, 960, 560, 1.0, -4, 6], [1810.9, 1180, 480, 1.12, 4, 8]]}>
        <World>
          <path d="M240 260 V860 H1700" stroke={P.white} strokeWidth={8} fill="none" strokeLinecap="round" />
          <text x={1700} y={910} textAnchor="end" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={P.white}>
            time →
          </text>
          {cheap > 0 && (
            <g>
              <line x1={300} y1={330} x2={lerp(300, 1600, cheap)} y2={lerp(330, 780, cheap)} stroke={P.grass} strokeWidth={12} strokeLinecap="round" />
              <text x={330} y={300} fontFamily="Poppins" fontWeight={800} fontSize={42} fill={P.grass}>
                cost of an AI answer
              </text>
            </g>
          )}
          {rocket > 0 && (
            <g>
              <polyline points={pts.map((p) => p.join(',')).join(' ')} stroke={P.orange} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <g transform={`translate(${tip[0]},${tip[1]}) rotate(${ang}) scale(1.3)`}>
                <Rocket f={f} />
              </g>
              <text x={1180} y={470} textAnchor="end" fontFamily="Poppins" fontWeight={800} fontSize={48} fill={P.orange} opacity={ease(f, w(1809.4), 10)}>
                demand
              </text>
            </g>
          )}
        </World>
      </Cam>
      <Label f={f} at={w(1805.83)} title="His point" sub="the Jevons paradox, applied to AI" />
      <Note style={{position: 'absolute', right: 80, bottom: 70}} size={26}>
        illustration
      </Note>
    </Bg>
  );
};

/* ================================================================== 19. IEA: data-centre electricity could more than double by 2030 */
export const C7Double: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const BASE = 820, PX = 560 / 945;
  const a = ease(f, w(1813.33), 20);
  const b = ease(f, w(1815.67), w(1816.8) - w(1815.67));
  const v2030 = Math.round(lerp(415, 945, b));
  const per = ease(f, w(1818.49), 24);
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 900, 600, 1.12, 0, 10], [1815.5, 900, 580, 1.04, -4, 6], [1820.3, 960, 540, 1.0, 4, 2]]}>
        <World>
          <rect x={300} y={BASE} width={860} height={6} rx={3} fill="rgba(255,255,255,0.5)" />
          {[
            [480, 415 * a, '2024', P.sky, a > 0 ? `${Math.round(415 * a)} TWh` : ''],
            [880, (b > 0 ? v2030 : 0) * 1, '2030', P.yellow, b > 0 ? `~${v2030} TWh` : ''],
          ].map(([x, v, yr, c, txt]) => (
            <g key={yr as string}>
              <rect x={(x as number) - 120} y={BASE - (v as number) * PX} width={240} height={(v as number) * PX} rx={14} fill={c as string} />
              <text x={x as number} y={BASE - (v as number) * PX - 24} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={50} fill={c as string}>
                {txt as string}
              </text>
              <text x={x as number} y={BASE + 56} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={P.white} opacity={yr === '2024' ? ease(f, w(1813.3), 10) : ease(f, w(1816.37), 10)}>
                {yr as string}
              </text>
            </g>
          ))}
          <text x={880} y={BASE - 60} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={30} fill={P.ink} opacity={ease(f, w(1817.0), 10)}>
            ≈ Japan today
          </text>
          {/* each answer, meanwhile */}
          <g opacity={ease(f, w(1818.03), 10)}>
            <Put x={1330} y={600} s={0.8}>
              <Bubble />
            </Put>
            <rect x={1440} y={580} width={340} height={40} rx={20} fill="rgba(255,255,255,0.14)" />
            <rect x={1440} y={580} width={340 * lerp(1, 0.4, per)} height={40} rx={20} fill={P.grass} />
            <text x={1260} y={720} fontFamily="Poppins" fontWeight={800} fontSize={34} fill={P.grass}>
              each answer: more efficient
            </text>
          </g>
        </World>
      </Cam>
      <Label f={f} at={w(1812.15)} title="International Energy Agency" sub="data-centre electricity, worldwide" />
      <Pop f={f} at={w(1816.19)} x={1500} y={330} size={76} color={P.yellow}>
        more than double
      </Pop>
      <Note style={{position: 'absolute', left: 1260, width: 480, top: 400, textAlign: 'center', opacity: ease(f, w(1816.8), 10)}} size={26}>
        945 ÷ 415 ≈ 2.3× · to scale
      </Note>
      <Caption f={f} at={w(1815.63)} source="IEA, Energy and AI (April 2025) · per-answer bar is an illustration">
        Data-centre electricity could more than double by 2030
      </Caption>
    </Bg>
  );
};

/* ================================================================== 20. "Each question gets cheaper. So we ask a lot more questions." */
export const C7Loop: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const cheap = ease(f, w(1821.2), 14);
  const many = ease(f, w(1822.6), w(1824.4) - w(1822.6));
  const total = ease(f, w(1822.6), w(1825.4) - w(1822.6));
  return (
    <Bg c={P.night}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 900}, (_, i) => {
          const x = 90 + (i % 45) * 36 + (Math.floor(i / 45) % 2) * 18;
          const y = 260 + Math.floor(i / 45) * 32;
          if (y > 880 || x > 1660) return null;
          const show = random(`q${i}`) < many * 1.02;
          return show ? <rect key={i} x={x - 12} y={y - 9} width={24} height={18} rx={7} fill={i % 9 ? P.sky : P.yellow} opacity={0.85} /> : null;
        })}
        <g transform={`translate(860,${560 + Math.sin(f / 10) * 8}) scale(${lerp(1.9, 0.9, cheap) * (1 - many) + 0.001})`} opacity={1 - many}>
          <Bubble />
        </g>
        <g opacity={1 - many}>
          <rect x={660} y={740} width={400} height={40} rx={20} fill="rgba(255,255,255,0.14)" />
          <rect x={660} y={740} width={400 * lerp(1, 0.35, cheap)} height={40} rx={20} fill={P.grass} />
          <text x={660} y={820} fontFamily="Poppins" fontWeight={800} fontSize={32} fill={P.grass}>
            energy and cost per question
          </text>
        </g>
        {/* the total keeps climbing */}
        <rect x={1730} y={300} width={70} height={560} rx={35} fill="rgba(255,255,255,0.14)" />
        <rect x={1730} y={860 - 560 * (0.2 + 0.8 * total)} width={70} height={560 * (0.2 + 0.8 * total)} rx={35} fill={P.orange} />
        <text x={1765} y={270} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={32} fill={P.orange}>
          total
        </text>
      </svg>
      <Pop f={f} at={w(1820.71)} x={900} y={150} size={80} until={w(1822.4)}>
        Each question gets <span style={{color: P.grass}}>cheaper</span>
      </Pop>
      <Pop f={f} at={w(1822.59)} x={900} y={150} size={80}>
        So we ask a lot <span style={{color: P.orange}}>more</span>
      </Pop>
      <Note style={{position: 'absolute', left: 90, bottom: 70}} size={26}>
        illustration
      </Note>
    </Bg>
  );
};

export const SCENES_7: Record<string, React.FC<AnimProps>> = {
  c7tiny: C7Tiny,
  c7oven: C7Oven,
  c7gemini: C7Gemini,
  c7drops: C7Drops,
  c7fall33: C7Fall33,
  c7stream: C7Stream,
  c7arg2: C7Arg2,
  c7deepseek: C7DeepSeek,
  c7arg3: C7Arg3,
  c7cooling: C7Cooling,
  c7uses: C7Uses,
  c7buyers: C7Buyers,
  c7real: C7Real,
  c7name: C7Name,
  c7steam: C7Steam,
  c7more: C7More,
  c7post: C7Post,
  c7demand: C7Demand,
  c7double: C7Double,
  c7loop: C7Loop,
};
