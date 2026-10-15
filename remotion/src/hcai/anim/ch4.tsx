// Chapter 4, "The hands" (905–1249 s on the film): what a model learns from, why people had to label the worst of
// it, the Sama/OpenAI contract in Nairobi (the work, the pay, the aftermath: petition, court, letters), RLHF, the
// labelling industry and its two tiers. Harm is shown through the work, the pay and the documents. Any harmful text is
// drawn as blurred bars and never written out. The night chat at 1120–1126 s is drawn by the film (Strip.tsx), not here.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';
import {Bg, Cam, Chip, Coin, Counter, Crowd, DataCentre, Flow, Gavel, Globe, IconGrid, Office, Person, Pop, Put, Rock, World, shade} from './lib';

/* ================================================================== local kit */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Rough width of a Poppins-bold label, for SVG tags. */
const tw = (s: string, size: number) =>
  [...s].reduce((a, ch) => a + (ch === ' ' ? 0.3 : /[A-Z0-9$%–]/.test(ch) ? 0.7 : /[iljtf.,'’:;!|()]/.test(ch) ? 0.34 : 0.6), 0) * size + size * 1.3;
const mix = (a: string, b: string, k: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, clamp01(k)));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};
const SKINS = ['#8D5A3B', '#6B4128', '#A86E4A', '#5A3520', '#C98E64'];
const C30 = Math.cos(Math.PI / 6);
const iso = (x: number, y: number, z = 0): [number, number] => [(x - y) * C30, (x + y) * 0.5 - z];
const pts = (a: [number, number][]) => a.map((p) => p.join(',')).join(' ');
/** Points along a quadratic curve (for Flow). */
const curve = (a: [number, number], c: [number, number], b: [number, number], n = 24): [number, number][] =>
  Array.from({length: n + 1}, (_, i) => {
    const k = i / n;
    return [lerp(lerp(a[0], c[0], k), lerp(c[0], b[0], k), k), lerp(lerp(a[1], c[1], k), lerp(c[1], b[1], k), k)];
  });

/** A rounded label drawn in SVG (world space). */
const STag: React.FC<{x: number; y: number; text: string; size?: number; bg?: string; color?: string; o?: number; anchor?: 'middle' | 'start' | 'end'}> = ({x, y, text, size = 34, bg = P.white, color = P.ink, o = 1, anchor = 'middle'}) => {
  if (o <= 0) return null;
  const wd = tw(text, size), h = size * 1.6;
  const x0 = anchor === 'middle' ? x - wd / 2 : anchor === 'start' ? x : x - wd;
  return (
    <g opacity={Math.min(1, o)}>
      <rect x={x0} y={y - h / 2} width={wd} height={h} rx={h / 2} fill={bg} />
      <text x={x0 + wd / 2} y={y + size * 0.36} textAnchor="middle" fontFamily={AF.head} fontWeight={700} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};
/** A rubber stamp that thumps down. */
const Stamp: React.FC<{x: number; y: number; text: string; k: number; rot?: number; c?: string; size?: number}> = ({x, y, text, k, rot = -8, c = P.red, size = 40}) => {
  if (k <= 0) return null;
  const wd = tw(text, size) + text.length * 2, h = size * 1.7;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${lerp(1.5, 1, Math.min(1, k))})`} opacity={Math.min(1, k)}>
      <rect x={-wd / 2} y={-h / 2} width={wd} height={h} rx={10} fill="rgba(16,8,14,0.85)" stroke={c} strokeWidth={6} />
      <text y={size * 0.36} textAnchor="middle" fontFamily={AF.head} fontWeight={800} fontSize={size} letterSpacing={2} fill={c}>
        {text}
      </text>
    </g>
  );
};
/** Corner title card (screen space), with a readable sub line. */
const Lab: React.FC<{f: number; at: number; title: string; sub?: string; bg?: string; color?: string; until?: number}> = ({f, at: a, title, sub, bg = P.white, color = P.ink, until}) => {
  const k = ease(f, a, 10) * (until !== undefined ? 1 - ease(f, until, 8) : 1);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 80, top: 70, opacity: k, transform: `translateX(${(1 - k) * -20}px)`}}>
      <Tag bg={bg} color={color} size={44}>
        {title}
      </Tag>
      {sub && (
        <Note style={{marginTop: 12, marginLeft: 8}} size={26}>
          {sub}
        </Note>
      )}
    </div>
  );
};
/** The fact line along the bottom. */
const Cap: React.FC<{f: number; at: number; until?: number; children: React.ReactNode}> = ({f, at: a, until, children}) => {
  const k = ease(f, a, 10) * (until !== undefined ? 1 - ease(f, until, 8) : 1);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, bottom: 70, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 20}px)`}}>
      <Tag bg={P.white} color={P.ink} size={42}>
        {children}
      </Tag>
    </div>
  );
};
/** A source line, top right (or bottom centre). */
const Src: React.FC<{f: number; at: number; children: React.ReactNode; bottom?: boolean; until?: number}> = ({f, at: a, children, bottom, until}) => {
  const k = ease(f, a, 10) * (until !== undefined ? 1 - ease(f, until, 8) : 1);
  if (k <= 0) return null;
  const pos = bottom ? ({left: 0, right: 0, bottom: 70, textAlign: 'center'} as const) : ({right: 70, top: 84, textAlign: 'right'} as const);
  return (
    <Note size={24} style={{position: 'absolute', opacity: k, ...pos}}>
      Source · {children}
    </Note>
  );
};
/** Text that must not be read: rows of blurred bars. */
const Redact: React.FC<{x: number; y: number; w: number; rows: number; seed: string; c?: string; gap?: number; h?: number; blur?: number; o?: number; reveal?: number}> = ({x, y, w, rows, seed, c = '#3A3D4A', gap = 30, h = 14, blur = 2.5, o = 1, reveal = 1}) => {
  const id = 'rd' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <g opacity={o}>
      <defs>
        <filter id={id} x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      </defs>
      <g filter={blur > 0 ? `url(#${id})` : undefined}>
        {Array.from({length: rows}, (_, i) => {
          const len = (i === rows - 1 && rows > 2 ? 0.45 : 0.68 + random(`${seed}${i}`) * 0.32) * w;
          const vis = clamp01(reveal * rows - i);
          return vis > 0 ? <rect key={i} x={x} y={y + i * gap} width={len * vis} height={h} rx={h / 2} fill={c} /> : null;
        })}
      </g>
    </g>
  );
};
/** A page of the internet; dark pages are the bad parts (no text, only bars). */
const Page: React.FC<{dark?: boolean; c?: string}> = ({dark, c}) => (
  <g>
    <rect x={-30} y={-40} width={60} height={80} rx={6} fill={c ?? (dark ? '#4B1F33' : P.white)} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-20} y={-26 + i * 15} width={i === 3 ? 24 : 40} height={6} rx={3} fill={dark ? '#7A3A55' : '#C5CCD8'} />
    ))}
  </g>
);
/** The model: a box of tiny settings. */
const Model: React.FC<{f: number; glow?: number; label?: string}> = ({f, glow = 0, label = 'AI model'}) => (
  <g>
    <rect x={-150} y={-150} width={300} height={300} rx={46} fill="#0F1A45" stroke={P.blue} strokeWidth={10} />
    {Array.from({length: 25}, (_, i) => {
      const x = -96 + (i % 5) * 48, y = -96 + Math.floor(i / 5) * 48;
      const a = random(`mk${i}`) * 6.28 + Math.sin(f / 9 + i) * 0.7 * glow;
      return (
        <g key={i} transform={`translate(${x},${y})`}>
          <circle r={16} fill="#2A3B7A" />
          <line x1={0} y1={0} x2={13 * Math.cos(a)} y2={13 * Math.sin(a)} stroke={P.yellow} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    })}
    {label && (
      <text y={210} textAnchor="middle" fontFamily={AF.head} fontWeight={800} fontSize={42} fill={P.white}>
        {label}
      </text>
    )}
  </g>
);
/** A person working at a laptop, seen from the front (the screen lights the face). */
const AtLaptop: React.FC<{f: number; c?: string; skin?: string; glow?: string; i?: number}> = ({f, c = P.blue, skin = SKINS[0], glow = P.sky, i = 0}) => (
  <g>
    <Person c={c} skin={skin} f={f} />
    <circle cy={-66} r={26} fill={glow} opacity={0.2 + 0.1 * Math.sin(f / 6 + i)} />
    <rect x={-95} y={14} width={190} height={16} rx={5} fill="#6B4A2E" />
    <path d="M-50 14 L-42 -36 H42 L50 14 Z" fill="#C9CDD6" />
    <circle cy={-11} r={6} fill="#9AA6BD" />
  </g>
);
/** A columned public building (parliament, court, government). */
const Columns: React.FC<{c?: string; dome?: boolean; n?: number}> = ({c = '#EFE7D6', dome = false, n = 6}) => {
  const W = 360;
  return (
    <g>
      {dome && (
        <g>
          <rect x={-4} y={-340} width={8} height={70} fill="#5B6B8C" />
          <path d="M-4 -340 H60 V-305 H-4 Z" fill={P.green} />
          <path d="M-110 -170 A110 110 0 0 1 110 -170 Z" fill={shade(c, 0.92)} />
        </g>
      )}
      <rect x={-W / 2 - 20} y={-86} width={W + 40} height={170} fill={shade(c, 0.55)} />
      <path d={`M${-W / 2 - 30} -110 L0 -190 L${W / 2 + 30} -110 Z`} fill={c} />
      <rect x={-W / 2 - 30} y={-112} width={W + 60} height={26} fill={shade(c, 0.85)} />
      {Array.from({length: n}, (_, i) => (
        <rect key={i} x={-W / 2 + i * (W / (n - 1)) - 14} y={-86} width={28} height={170} fill={shade(c, 0.97)} />
      ))}
      <rect x={-W / 2 - 40} y={84} width={W + 80} height={20} fill={shade(c, 0.8)} />
      <rect x={-W / 2 - 60} y={104} width={W + 120} height={20} fill={shade(c, 0.7)} />
    </g>
  );
};
const Hazard: React.FC = () => (
  <g>
    <rect x={-58} y={-58} width={116} height={116} rx={12} fill={P.yellow} stroke={P.ink} strokeWidth={8} transform="rotate(45)" />
    <rect x={-8} y={-46} width={16} height={56} rx={8} fill={P.ink} />
    <circle cy={32} r={10} fill={P.ink} />
  </g>
);
const Drum: React.FC = () => (
  <g>
    <rect x={-70} y={-100} width={140} height={200} rx={14} fill={P.blue} />
    <rect x={-70} y={-45} width={140} height={12} fill={shade(P.blue, 0.7)} />
    <rect x={-70} y={35} width={140} height={12} fill={shade(P.blue, 0.7)} />
    <ellipse cy={-100} rx={70} ry={16} fill="#6FA0FF" />
  </g>
);
const Book: React.FC = () => (
  <g>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={-70} y={10 - i * 32} width={140} height={28} rx={4} fill={[P.blue, P.orange, P.teal][i]} />
        <rect x={-60} y={20 - i * 32} width={120} height={6} fill="rgba(255,255,255,0.5)" />
      </g>
    ))}
  </g>
);
const HandIcon: React.FC<{c?: string}> = ({c = P.white}) => (
  <g fill={c}>
    <rect x={-45} y={-10} width={90} height={80} rx={30} />
    {[-38, -14, 10, 34].map((x, i) => (
      <rect key={x} x={x} y={-75 + (i === 0 || i === 3 ? 18 : 0)} width={20} height={80} rx={10} />
    ))}
    <rect x={-85} y={0} width={60} height={22} rx={11} transform="rotate(-35 -55 10)" />
  </g>
);
const ChatIcon: React.FC<{c?: string}> = ({c = P.white}) => (
  <path d="M-60 -45 H60 A20 20 0 0 1 80 -25 V25 A20 20 0 0 1 60 45 H-10 L-45 75 V45 H-60 A20 20 0 0 1 -80 25 V-25 A20 20 0 0 1 -60 -45 Z" fill={c} />
);
/** A clock face whose hand is set by angle (degrees). */
const Face: React.FC<{a: number; c?: string}> = ({a, c = P.white}) => (
  <g>
    <circle r={80} fill={c} stroke={P.yellow} strokeWidth={10} />
    {Array.from({length: 12}, (_, i) => (
      <rect key={i} x={-3} y={-70} width={6} height={12} rx={3} fill={P.ink} transform={`rotate(${i * 30})`} />
    ))}
    <rect x={-4} y={-58} width={8} height={58} rx={4} fill={P.red} transform={`rotate(${a})`} />
    <rect x={-5} y={-38} width={10} height={38} rx={5} fill={P.ink} transform={`rotate(${a / 12})`} />
    <circle r={7} fill={P.ink} />
  </g>
);

/* ================================================================== 908.7 "one uncomfortable fact... ALL of the internet" */
export const C4Fact: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const learn = ease(f, w(914.44), 12);
  const all = ease(f, w(916.4), 16);
  const G: [number, number] = [520, 560], M: [number, number] = [1420, 560];
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.12, 0, 0], [912.9, 960, 560, 1.1, 0, 0], [914.6, 980, 580, 0.95, -10, 4], [918.0, 980, 580, 0.9, 8, 2]]}>
        <World>
          <Put x={G[0]} y={G[1]} s={1.9}>
            <Globe f={f} />
          </Put>
          {Array.from({length: 16}, (_, i) => {
            const a = (i / 16) * Math.PI * 2 + f / 70;
            const dark = i % 3 === 0;
            const o = dark ? all : 1;
            return o > 0 ? (
              <g key={i} transform={`translate(${G[0] + Math.cos(a) * 285},${G[1] + Math.sin(a) * 135}) scale(0.62)`} opacity={o}>
                <Page dark={dark} />
              </g>
            ) : null;
          })}
          {learn > 0 &&
            Array.from({length: 18}, (_, i) => {
              const dark = i % 3 === 1;
              const o = (dark ? all : 1) * learn;
              if (o <= 0) return null;
              const k = ((((f - w(914.44)) / 44 + i / 18) % 1) + 1) % 1;
              const x = lerp(G[0] + 230, M[0] - 165, k);
              const y = G[1] - Math.sin(k * Math.PI) * 170 + (random(`c4py${i}`) - 0.5) * 160 * (1 - k);
              return (
                <g key={i} transform={`translate(${x},${y}) scale(0.55)`} opacity={o * Math.min(1, k * 6, (1 - k) * 6)}>
                  <Page dark={dark} />
                </g>
              );
            })}
          <STag x={G[0]} y={G[1] + 268} text="The internet" o={ease(f, w(915.24), 10)} size={40} />
          <Put x={M[0]} y={M[1]} s={1} f={f} at={w(913.78)}>
            <Model f={f} glow={learn} />
          </Put>
        </World>
      </Cam>
      <Pop f={f} at={w(910.76)} x={960} y={150} size={72} until={w(912.9)}>
        <span style={{background: P.ink, borderRadius: 30, padding: '10px 34px'}}>One uncomfortable fact</span>
      </Pop>
      <Cap f={f} at={w(913.18)} until={w(916.2)}>
        When an AI model learns from the internet…
      </Cap>
      <Pop f={f} at={w(916.4)} x={960} y={150} size={76}>
        <span style={{background: P.ink, borderRadius: 30, padding: '10px 34px'}}>
          …it learns from <span style={{color: P.yellow}}>ALL</span> of it
        </span>
      </Pop>
    </Bg>
  );
};

/* ================================================================== 918 "encyclopedias and poems... the darkest corners" */
export const C4Iceberg: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const deep: [number, number, number, string][] = [
    [920.88, 640, 930, 'Hate'],
    [921.84, 1270, 1130, 'Violence'],
    [922.94, 700, 1370, 'Abuse'],
  ];
  return (
    <Bg c="#7FD0FF">
      <Cam f={f} t0={t0} keys={[[t0, 960, 470, 1.1, 0, 0], [919.9, 960, 480, 1.06, 0, 0], [921.2, 960, 960, 0.95, 0, -5], [922.9, 960, 1180, 0.95, 0, -5], [924.3, 960, 1470, 0.95, 0, 0], [925.7, 960, 1500, 0.92, 0, 0], [927.8, 960, 1080, 0.47, 0, 0]]}>
        <World w={1920} h={2400}>
          <defs>
            <linearGradient id="c4sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1FA2FF" />
              <stop offset="0.4" stopColor="#0B3C8C" />
              <stop offset="1" stopColor="#03061A" />
            </linearGradient>
            <linearGradient id="c4ice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#BFE6FF" />
              <stop offset="0.45" stopColor="#3E6FA8" />
              <stop offset="1" stopColor="#0B1638" />
            </linearGradient>
          </defs>
          <rect x={-1800} y={-1400} width={5600} height={2002} fill="#7FD0FF" />
          <rect x={-1800} y={600} width={5600} height={2000} fill="url(#c4sea)" />
          <path d="M760 600 L1170 600 L1500 880 L1620 1300 L1430 1760 L920 1880 L440 1620 L320 1120 L520 800 Z" fill="url(#c4ice)" opacity={0.95} />
          {/* bubbles */}
          {Array.from({length: 16}, (_, i) => {
            const k = (f / 90 + random(`bb${i}`)) % 1;
            return <circle key={i} cx={300 + random(`bx${i}`) * 1320 + Math.sin(f / 10 + i) * 10} cy={1900 - k * 1250} r={5 + random(`br${i}`) * 8} fill="#BFE8FF" opacity={0.35 * (1 - k)} />;
          })}
          {/* the tip */}
          <path d="M790 602 L870 430 L955 352 L1045 425 L1130 602 Z" fill="#F4FBFF" />
          <path d="M955 352 L1045 425 L1130 602 L1000 602 Z" fill="#CFE6F5" />
          {Array.from({length: 16}, (_, i) => {
            const x0 = ((i * 330 + f * 3) % 5200) - 1600;
            return <rect key={i} x={x0} y={596} width={130} height={8} rx={4} fill="#DFF4FF" opacity={0.8} />;
          })}
          <Put x={900} y={548} s={0.55} f={f} at={w(918.1)}>
            <Book />
          </Put>
          <Put x={1032} y={548} s={0.7} f={f} at={w(919.3)}>
            <Page c={P.pink} />
          </Put>
          <STag x={560} y={420} text="Encyclopedias" o={ease(f, w(918.1), 10)} size={42} />
          <STag x={1360} y={440} text="Poems" o={ease(f, w(919.3), 10)} size={42} bg={P.pink} color={P.white} />
          {deep.map(([a, x, y, name]) => {
            const k = pop(f, w(a), 12);
            return k > 0 ? (
              <g key={name} transform={`translate(${x},${y + Math.sin(f / 20 + x) * 8}) scale(${k})`}>
                <rect x={-150} y={-90} width={300} height={180} rx={14} fill="#1A1028" stroke="#5A2A44" strokeWidth={4} />
                <Redact x={-120} y={-56} w={240} rows={4} seed={name} c="#6A2E48" gap={30} />
                <STag x={0} y={-122} text={name} size={42} bg={P.ink} color={P.white} />
              </g>
            ) : null;
          })}
          {(() => {
            const k = pop(f, w(924.2), 14);
            return k > 0 ? (
              <g transform={`translate(960,1660) scale(${k})`}>
                <rect x={-240} y={-80} width={480} height={160} rx={18} fill="#05040C" stroke="#3A1A2E" strokeWidth={4} />
                <Redact x={-200} y={-46} w={400} rows={4} seed="deep" c="#3A1A2E" gap={26} blur={4} />
                <STag x={0} y={-118} text="The darkest corners" size={44} bg="#05040C" color={P.white} />
              </g>
            ) : null;
          })()}
        </World>
      </Cam>
      <Lab f={f} at={0} title="What a model learns from" sub="illustration · bad text shown blurred" bg={P.ink} color={P.white} until={w(920.4)} />
      <Cap f={f} at={w(925.84)}>The part most of us never see</Cap>
    </Bg>
  );
};

/* ================================================================== 928.4 "early AI models could produce horrifying things... learned it from us" */
export const C4Early: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const typing = ease(f, w(930.08), w(931.5) - w(930.08));
  const stamps: [number, number, string][] = [
    [931.6, 500, 'RACIST RANT'],
    [932.74, 640, 'VIOLENT THREAT'],
    [934.26, 780, 'DESCRIPTION OF ABUSE'],
  ];
  const wrote = ease(f, w(936.6), 12);
  const learned = ease(f, w(937.64), 12);
  const us = ease(f, w(938.96), 10);
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.0, 8, 0], [935.4, 960, 540, 1.0, 0, 0], [936.9, 2860, 560, 0.95, -8, 0], [940.0, 2860, 560, 0.9, 0, 0]]}>
        <World w={3840}>
          {/* the chat window */}
          <rect x={360} y={150} width={1200} height={780} rx={34} fill="#14151C" stroke="#2A2C36" strokeWidth={14} />
          <STag x={420} y={215} text="Early AI model" size={34} anchor="start" />
          <rect x={1040} y={270} width={460} height={90} rx={28} fill={P.blue} />
          <Redact x={1080} y={306} w={380} rows={1} seed="q" c="#BFD3FF" blur={0} h={16} />
          <rect x={420} y={400} width={900} height={500} rx={30} fill="#2A1020" />
          <Redact x={460} y={440} w={820} rows={14} gap={32} seed="early" c="#7A2E45" reveal={typing} blur={3.5} />
          {stamps.map(([a, y, s]) => (
            <Stamp key={s} x={870} y={y} text={s} k={pop(f, w(a), 10)} rot={-6} size={42} />
          ))}
          {/* the loop: people write, the model learns it */}
          <g transform="translate(2200,560)">
            <Crowd n={12} cols={4} gap={90} hi={us > 0 ? 12 : 0} c={P.pink} f={f} />
          </g>
          <STag x={2200} y={950} text="Us" size={52} bg={P.pink} color={P.white} o={us} />
          <Flow pts={[[2400, 640], [2660, 640]]} f={f} c={P.white} n={4} r={9} speed={5} o={wrote} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} transform={`translate(${2790 + (i % 3) * 44},${560 + Math.floor(i / 3) * 70 - i * 4})`} opacity={wrote}>
              <Page dark={i === 1 || i === 5} />
            </g>
          ))}
          <STag x={2835} y={440} text="What we wrote online" size={36} o={wrote} />
          <Flow pts={[[2960, 640], [3250, 640]]} f={f} c={P.yellow} n={4} r={10} speed={6} o={learned} />
          <Put x={3460} y={600} s={0.8} f={f} at={w(937.9)}>
            <Model f={f} glow={1} />
          </Put>
        </World>
      </Cam>
      <Lab f={f} at={w(928.68)} title="Early AI models" until={w(935.5)} />
      <Cap f={f} at={w(930.44)} until={w(935.7)}>
        They could produce horrifying things · text hidden
      </Cap>
      <Cap f={f} at={w(935.86)} until={w(937.5)}>
        Not because anyone wanted them to
      </Cap>
      <Pop f={f} at={w(937.64)} x={960} y={130} size={64}>
        <span style={{background: P.ink, borderRadius: 30, padding: '10px 34px'}}>…because they learned it from us</span>
      </Pop>
    </Bg>
  );
};

/* ================================================================== 940 "how do you teach a machine... you show it examples... someone has to read them first" */
export const C4Teach: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const run = Math.max(0, f - w(941.8));
  const shield = ease(f, w(946.32), 8);
  const scan = ease(f, w(943.76), 10);
  const labels: [number, string, string][] = [
    [954.74, 'Violence', P.red],
    [956.16, 'Abuse', P.purple],
    [957.04, 'Hate', P.orange],
  ];
  const nLab = labels.filter(([a]) => f >= w(a)).length;
  const belt = Math.max(0, f - w(948.0));
  const stack = ease(f, w(950.4), w(958.0) - w(950.4));
  const spot = ease(f, w(958.32), 14);
  const stopX = 1300;
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 900, 520, 1.05, 0, 0], [947.7, 900, 520, 1.0, 0, 0], [949.2, 960, 1150, 0.48, 0, 0], [951.7, 960, 1150, 0.48, 0, 0], [953.1, 960, 1640, 0.95, 0, 4], [957.9, 960, 1640, 0.95, 0, 4], [959.3, 960, 1620, 1.3, 0, 0]]}>
        <World w={1920} h={2300}>
          {/* top: the machine has to learn to say no */}
          <rect x={60} y={500} width={1660} height={18} rx={9} fill="#22336E" />
          {run > 0 &&
            Array.from({length: 9}, (_, i) => {
              const dark = i % 2 === 0;
              const k = (run / 150 + i / 9) % 1;
              let x = lerp(60, 1700, k);
              let o = Math.min(1, k * 8, (1 - k) * 8);
              const stopK = (stopX - 60) / 1640;
              if (dark && shield > 0 && k > stopK) {
                x = stopX - (k - stopK) * 500;
                o *= clamp01(1 - (k - stopK) / 0.1);
              }
              return (
                <g key={i} transform={`translate(${x},440) scale(0.9)`} opacity={o}>
                  <Page dark={dark} />
                </g>
              );
            })}
          <g opacity={scan}>
            <rect x={520} y={330} width={90} height={220} rx={12} fill="none" stroke={P.sky} strokeWidth={10} />
            <rect x={530} y={340 + ((f * 4) % 200)} width={70} height={8} fill={P.sky} />
          </g>
          <STag x={565} y={270} text="Recognise" size={40} bg={P.sky} o={scan} />
          <Put x={940} y={440} s={0.7}>
            <Model f={f} glow={scan} />
          </Put>
          <g opacity={shield} transform={`translate(${stopX + 30},440)`}>
            <path d="M0 -110 L90 -75 V10 Q90 80 0 115 Q-90 80 -90 10 V-75 Z" fill={P.green} stroke={P.white} strokeWidth={8} />
            <path d="M-40 0 L-10 35 L45 -35" stroke={P.white} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <STag x={stopX + 30} y={270} text="Refuse" size={40} bg={P.green} color={P.white} o={shield} />
          <rect x={1520} y={385} width={220} height={110} rx={30} fill={shield > 0.5 ? P.white : '#C98A9A'} />
          <Redact x={1550} y={418} w={160} rows={2} seed="ans" blur={0} c={shield > 0.5 ? '#9FB0D3' : '#7A2E45'} />
          {/* the labelled examples go up to the model */}
          <Flow pts={[[1680, 1500], [1680, 820], [1100, 600]]} f={f} c={P.yellow} n={8} r={12} speed={9} o={ease(f, w(951.72), 12)} />
          {/* bottom: one person labels them */}
          <rect x={-200} y={1150} width={2320} height={1200} fill="#101B4A" />
          <rect x={60} y={1786} width={720} height={16} rx={8} fill="#2B3A7A" />
          <rect x={1160} y={1786} width={440} height={16} rx={8} fill="#2B3A7A" />
          {Array.from({length: 7}, (_, i) => {
            const k = ((belt / 120 + i / 7) % 1);
            return belt > 0 ? (
              <g key={i} transform={`translate(${lerp(80, 760, k)},1735)`} opacity={Math.min(1, k * 8, (1 - k) * 8)}>
                <rect x={-50} y={-40} width={100} height={80} rx={8} fill="#3A2030" />
                <Redact x={-38} y={-26} w={76} rows={3} gap={20} h={9} seed={`in${i}`} c="#7A3A55" blur={2} />
              </g>
            ) : null;
          })}
          {Array.from({length: 4}, (_, i) => {
            const k = ((belt / 90 + i / 4) % 1);
            const lab = nLab > 0 ? labels[i % nLab] : null;
            return belt > 0 ? (
              <g key={i} transform={`translate(${lerp(1180, 1580, k)},1735)`} opacity={Math.min(1, k * 8, (1 - k) * 8)}>
                <rect x={-50} y={-40} width={100} height={80} rx={8} fill="#3A2030" />
                <Redact x={-38} y={-26} w={76} rows={3} gap={20} h={9} seed={`out${i}`} c="#7A3A55" blur={2} />
                <rect x={-30} y={-58} width={60} height={30} rx={8} fill={lab ? lab[2] : '#7C8AA8'} />
              </g>
            ) : null;
          })}
          {[1620, 1720, 1820].map((x, s) =>
            Array.from({length: Math.floor(stack * 24 * (1 - s * 0.15))}, (_, j) => (
              <rect key={`${x}-${j}`} x={x - 44} y={1880 - j * 12} width={88} height={10} rx={3} fill={j % 3 === 0 ? labels[s][2] : '#3A2030'} />
            )),
          )}
          <STag x={1720} y={1530} text="Thousands of examples" size={40} o={ease(f, w(950.4), 10)} />
          <Put x={960} y={1660} s={1.3}>
            <AtLaptop f={f} c={P.teal} skin={SKINS[1]} glow={P.sky} />
          </Put>
          {labels.map(([a, name, c], i) => (
            <STag key={name} x={640 + i * 320} y={1400} text={name} size={44} bg={c} color={P.white} o={pop(f, w(a), 10)} />
          ))}
          <STag x={960} y={1300} text="Label:" size={34} bg="rgba(255,255,255,0.15)" color={P.white} o={ease(f, w(952.6), 10)} />
        </World>
      </Cam>
      {spot > 0 && <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 46%, transparent 0px, transparent 300px, rgba(5,8,25,0.75) 520px)', opacity: spot}} />}
      <Lab f={f} at={w(940.72)} title="AI companies had a problem" until={w(947.6)} />
      <Cap f={f} at={w(942.42)} until={w(945.8)}>
        How do you teach a machine to spot the worst content?
      </Cap>
      <Cap f={f} at={w(945.88)} until={w(947.8)}>
        …so it can refuse to repeat it
      </Cap>
      <Cap f={f} at={w(947.96)} until={w(952.0)}>
        You show it examples
      </Cap>
      <Cap f={f} at={w(952.22)} until={w(958.1)}>
        Each one labelled by a human
      </Cap>
      <Cap f={f} at={w(958.32)}>Someone has to read them first</Cap>
    </Bg>
  );
};

/* ================================================================== 961 "OpenAI hired... Sama... San Francisco... Nairobi... 'ethical AI'" */
export const C4Sama: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const arc = curve([760, 640], [1600, 120], [2440, 640]);
  const ad0 = ease(f, w(971.9), 10), ad2 = ease(f, w(975.32), 10);
  return (
    <Bg c="#1B2C6B">
      <Cam f={f} t0={t0} keys={[[t0, 760, 560, 1.05, 8, 0], [968.9, 760, 560, 1.05, 0, 0], [970.4, 2440, 600, 1.05, -8, 0], [971.8, 2440, 600, 1.05, 0, 0], [973.4, 1600, 640, 0.62, 0, 0]]}>
        <World w={3200}>
          {Array.from({length: 40}, (_, i) => (
            <circle key={i} cx={random(`sx${i}`) * 3400 - 100} cy={random(`sy${i}`) * 700 - 200} r={2 + random(`sr${i}`) * 3} fill={P.white} opacity={0.3 + 0.3 * Math.sin(f / 12 + i)} />
          ))}
          <circle cx={1600} cy={2900} r={2250} fill="#1D4E9E" />
          <ellipse cx={700} cy={860} rx={420} ry={70} fill="#2E8B57" />
          <ellipse cx={2500} cy={860} rx={420} ry={70} fill="#2E8B57" />
          <Put x={700} y={860} s={1.3}>
            <Office f={f} />
          </Put>
          <Put x={2500} y={860} s={1.3}>
            <Office f={f} floors={6} c="#2F7D6B" />
          </Put>
          <g transform="translate(2500,905)">
            <Crowd n={10} cols={5} gap={78} hi={10} c={P.orange} f={f} />
          </g>
          <Flow pts={arc} f={f} c={P.yellow} n={8} r={11} speed={9} o={ease(f, w(969.34), 12)} />
          <STag x={430} y={330} text="OpenAI" size={48} o={pop(f, w(961.96), 10)} />
          {(() => {
            const k = ease(f, w(962.62), 12);
            return k > 0 ? (
              <g>
                <line x1={575} y1={330} x2={lerp(575, 865, k)} y2={330} stroke={P.white} strokeWidth={8} strokeLinecap="round" />
                <path d="M0 0 L-24 -16 L-24 16 Z" fill={P.white} transform={`translate(${lerp(575, 875, k)},330)`} />
              </g>
            ) : null;
          })()}
          <STag x={720} y={268} text="hired" size={30} bg="rgba(255,255,255,0.2)" color={P.white} o={ease(f, w(962.62), 10)} />
          <STag x={985} y={408} text="outsourcing company" size={30} bg="rgba(255,255,255,0.2)" color={P.white} o={ease(f, w(963.24), 10)} />
          <STag x={985} y={330} text="Sama" size={48} bg={P.yellow} o={pop(f, w(964.94), 10)} />
          <STag x={700} y={565} text="Based in San Francisco" size={36} bg={P.ink} color={P.white} o={ease(f, w(968.06), 10)} />
          <STag x={2500} y={615} text="Workers in Nairobi, Kenya" size={36} bg={P.ink} color={P.white} o={ease(f, w(970.1), 10)} />
        </World>
      </Cam>
      <Lab f={f} at={w(961.04)} title="Late 2021" until={w(971.6)} />
      {ad0 > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', opacity: ad0}}>
          <Note size={28}>How Sama described itself</Note>
          <div style={{display: 'inline-block', marginTop: 14, background: P.yellow, borderRadius: 30, padding: '14px 40px', fontFamily: AF.head, fontWeight: 800, fontSize: 64, color: P.ink, transform: `scale(${pop(f, w(973.08), 12)})`}}>“Ethical AI”</div>
          <div style={{marginTop: 16, fontFamily: AF.head, fontWeight: 700, fontSize: 42, color: P.white, opacity: ad2}}>“…helping lift people out of poverty”</div>
        </div>
      )}
    </Bg>
  );
};

/* ================================================================== 978 "TIME... young Kenyans, many recent graduates... read text passages and label them" */
const DESKS = Array.from({length: 20}, (_, n) => ({i: n % 5, j: Math.floor(n / 5)})).sort((a, b) => a.i * 200 + a.j * 190 - (b.i * 200 + b.j * 190));
const OFF: [number, number] = [960, 250];
const PICK = iso(470, 200, 72);
export const C4Office: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const fly = ease(f, w(983.0), 14);
  const ui = ease(f, w(987.15), 10);
  const dark = ease(f, w(988.66), 20);
  const cats: [number, string][] = [
    [992.06, 'Child sexual abuse'],
    [994.64, 'Murder'],
    [995.28, 'Suicide'],
    [996.12, 'Torture'],
    [997.22, 'Self-harm'],
  ];
  const active = cats.reduce((n, [a], i) => (f >= w(a) ? i : n), -1);
  const tx = OFF[0] + PICK[0], ty = OFF[1] + PICK[1];
  const sweep = ease(f, w(980.96), 30);
  return (
    <Bg c="#1A2150">
      <Cam f={f} t0={t0} keys={[[t0, 1000, 600, 0.74, 0, 0], [983.1, 1000, 600, 0.76, 0, 0], [984.2, 980, 600, 0.95, 0, 0], [986.6, 1080, 560, 1.05, 0, 0], [987.5, tx, ty, 5.0, 0, 0]]}>
        <World>
          <g transform={`translate(${OFF[0]},${OFF[1]})`}>
            <polygon points={pts([iso(-120, -80), iso(1080, -80), iso(1080, 820), iso(-120, 820)])} fill="#2B3570" />
            {DESKS.map(({i, j}) => {
              const X = i * 200, Y = j * 190;
              const top = [iso(X, Y, 34), iso(X + 140, Y, 34), iso(X + 140, Y + 70, 34), iso(X, Y + 70, 34)];
              const front = [iso(X, Y + 70, 0), iso(X + 140, Y + 70, 0), iso(X + 140, Y + 70, 34), iso(X, Y + 70, 34)];
              const side = [iso(X + 140, Y, 0), iso(X + 140, Y + 70, 0), iso(X + 140, Y + 70, 34), iso(X + 140, Y, 34)];
              const frame = [iso(X + 25, Y + 10, 40), iso(X + 115, Y + 10, 40), iso(X + 115, Y + 10, 105), iso(X + 25, Y + 10, 105)];
              const scr = [iso(X + 32, Y + 10, 47), iso(X + 108, Y + 10, 47), iso(X + 108, Y + 10, 98), iso(X + 32, Y + 10, 98)];
              const pick = i === 2 && j === 1;
              const glow = 0.75 + 0.2 * Math.sin(f / 5 + i * 3 + j);
              const [px, py] = iso(X + 70, Y + 112, 40);
              return (
                <g key={`${i}-${j}`}>
                  <polygon points={pts(front)} fill="#8B6A44" />
                  <polygon points={pts(side)} fill="#6E5236" />
                  <polygon points={pts(top)} fill="#C9A06A" />
                  <polygon points={pts(frame)} fill={P.ink} />
                  <polygon points={pts(scr)} fill={pick ? '#BFE6FF' : '#7FC4FF'} opacity={glow} stroke={pick && f > w(986.4) ? P.yellow : 'none'} strokeWidth={3} />
                  <g transform={`translate(${px},${py}) scale(0.42)`}>
                    <Person c={[P.teal, P.orange, P.purple, P.pink, P.blue][(i + j * 2) % 5]} skin={SKINS[(i * 3 + j) % 4]} f={f} />
                  </g>
                </g>
              );
            })}
          </g>
        </World>
      </Cam>
      {/* the investigation */}
      {fly < 1 && (
        <AbsoluteFill style={{opacity: 1 - fly, transform: `scale(${1 + fly * 1.6})`}}>
          <div style={{position: 'absolute', left: 420, top: 150, width: 1080, height: 700, background: P.cream, borderRadius: 18, boxShadow: '0 40px 90px rgba(0,0,0,0.5)', transform: `translateY(${(1 - ease(f, 0, 14)) * 60}px) rotate(-1.5deg)`, padding: '44px 60px', boxSizing: 'border-box', overflow: 'hidden'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
              <Tag bg={P.ink} color={P.white} size={50}>
                TIME
              </Tag>
              <div>
                <Note color={P.ink} size={28}>
                  Investigation
                </Note>
                <Note color="rgba(16,19,34,0.7)" size={28}>
                  18 January 2023
                </Note>
              </div>
            </div>
            <svg width={960} height={500} style={{marginTop: 30}}>
              <rect x={0} y={0} width={880} height={36} rx={10} fill={P.ink} />
              <rect x={0} y={52} width={620} height={36} rx={10} fill={P.ink} />
              <Redact x={0} y={140} w={940} rows={9} gap={36} h={14} seed="time" c="#B9B3A6" blur={0} />
              {sweep > 0 && (
                <g transform={`translate(${lerp(60, 860, sweep)},${260 + Math.sin(sweep * 9) * 60})`}>
                  <circle r={70} fill="rgba(70,180,255,0.18)" stroke={P.ink} strokeWidth={10} />
                  <rect x={46} y={46} width={22} height={90} rx={10} fill={P.ink} transform="rotate(-45 50 50)" />
                </g>
              )}
            </svg>
          </div>
        </AbsoluteFill>
      )}
      <Cap f={f} at={w(979.24)} until={w(982.9)}>
        It revealed what that job looked like
      </Cap>
      <div style={{position: 'absolute', right: 80, top: 80, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 18, opacity: 1 - ui}}>
        <div style={{opacity: ease(f, w(984.34), 10)}}>
          <Tag bg={P.white} color={P.ink} size={40}>
            Young Kenyans
          </Tag>
        </div>
        <div style={{opacity: ease(f, w(985.5), 10)}}>
          <Tag bg={P.yellow} color={P.ink} size={40}>
            Many recent graduates
          </Tag>
        </div>
      </div>
      {/* one screen, up close */}
      {ui > 0 && (
        <AbsoluteFill style={{opacity: ui, background: '#0B0F1E'}}>
          <div style={{position: 'absolute', left: 160, top: 100, width: 1600, height: 840, borderRadius: 28, background: '#EEF1F7', overflow: 'hidden', boxShadow: '0 0 0 18px #1C2133'}}>
            <div style={{height: 80, background: '#2A3150', display: 'flex', alignItems: 'center', padding: '0 36px', gap: 20}}>
              <span style={{fontFamily: AF.head, fontWeight: 700, fontSize: 32, color: P.white}}>Read · label · next</span>
              <span style={{marginLeft: 'auto', fontFamily: AF.mono, fontSize: 28, color: 'rgba(255,255,255,0.8)', opacity: ease(f, w(988.66), 10)}}>from the darkest parts of the internet</span>
            </div>
            <svg width={1600} height={470}>
              <Redact x={60} y={50} w={1480} rows={11} gap={36} h={16} seed="psg" c={mix('#9AA3B8', '#5A2440', dark)} blur={4} reveal={ease(f, w(987.42), 30)} />
            </svg>
            <div style={{position: 'absolute', left: 60, top: 560, fontFamily: AF.mono, fontSize: 28, color: '#5B6B8C', letterSpacing: '0.08em'}}>PASSAGE BLURRED FOR THIS FILM</div>
            <div style={{position: 'absolute', left: 60, top: 630, fontFamily: AF.head, fontWeight: 700, fontSize: 32, color: P.ink, opacity: ease(f, w(991.04), 10)}}>Label it:</div>
            <div style={{position: 'absolute', left: 60, right: 60, top: 690, display: 'flex', gap: 18, flexWrap: 'wrap'}}>
              {cats.map(([a, name], i) => {
                const k = pop(f, w(a), 10);
                return k > 0 ? (
                  <div key={name} style={{position: 'relative', transform: `scale(${k})`, fontFamily: AF.head, fontWeight: 700, fontSize: 32, padding: '14px 26px', borderRadius: 18, background: i === active ? '#3A4468' : '#D5DBE8', color: i === active ? P.white : '#3A4468'}}>
                    {name}
                    {i === active && (
                      <svg width={44} height={52} viewBox="0 0 44 52" style={{position: 'absolute', right: -14, bottom: -30}}>
                        <path d="M4 2 L4 42 L14 32 L22 50 L30 46 L22 29 L38 29 Z" fill={P.white} stroke={P.ink} strokeWidth={3} />
                      </svg>
                    )}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== 998 "150 to 250 passages in a nine-hour shift. Sit with that." */
const HOURS = Array.from({length: 9}, (_, h) => ({
  a: Math.round((150 * (h + 1)) / 9) - Math.round((150 * h) / 9),
  b: Math.round((250 * (h + 1)) / 9) - Math.round((250 * h) / 9),
}));
export const C4Quota: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const sweep = ease(f, w(1005.13), w(1006.9) - w(1005.13));
  const dim = ease(f, w(1007.3), 14);
  const bars = ease(f, w(1004.38), 10);
  return (
    <Bg c="#0E4A5A" c2="#0A2238" angle={180}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center'}}>
        <Note size={30} style={{opacity: ease(f, w(999.74), 10)}}>
          Workers were expected to read and label
        </Note>
        <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 170, lineHeight: 1.05, color: P.yellow, fontVariantNumeric: 'tabular-nums', marginTop: 6}}>
          <span style={{display: 'inline-block', transform: `scale(${pop(f, w(1001.46), 12)})`}}>150</span>
          <span style={{display: 'inline-block', transform: `scale(${pop(f, w(1003.02), 12)})`}}>–250</span>
        </div>
        <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 46, color: P.white}}>
          <span style={{opacity: ease(f, w(1003.66), 10)}}>passages</span>
          <span style={{opacity: ease(f, w(1005.0), 10)}}> in a nine-hour shift</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 135, top: 440, display: 'flex', gap: 15, opacity: bars * (1 - 0.35 * dim)}}>
        {HOURS.map(({a, b}, h) => {
          const on = sweep * 9 - h;
          return (
            <div key={h} style={{width: 170, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{width: 170, height: 290, borderRadius: 20, background: on > 0 ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(4, 26px)', gap: 9, padding: '18px 0', boxSizing: 'border-box', justifyContent: 'center', alignContent: 'start'}}>
                {Array.from({length: 28}, (_, s) => {
                  const lit = on * 28 > s;
                  const c = s < a ? P.white : s < b ? P.yellow : 'transparent';
                  return <div key={s} style={{width: 26, height: 26, borderRadius: 6, background: lit ? c : s < b ? 'rgba(255,255,255,0.1)' : 'transparent'}} />;
                })}
              </div>
              <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 30, color: P.white, marginTop: 10}}>hour {h + 1}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 135, top: 830, display: 'flex', gap: 40, alignItems: 'center', opacity: ease(f, w(1006.0), 10)}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: AF.head, fontWeight: 700, fontSize: 30, color: P.white}}>
          <span style={{width: 26, height: 26, borderRadius: 6, background: P.white}} /> 150 a shift
        </span>
        <span style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: AF.head, fontWeight: 700, fontSize: 30, color: P.white}}>
          <span style={{width: 26, height: 26, borderRadius: 6, background: P.yellow}} /> up to 250
        </span>
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: ease(f, w(1004.38), 10)}}>
        <g transform="translate(1720,860) scale(0.55)">
          <Face a={(f - w(1004.38)) * (sweep < 1 ? 60 : 6)} />
        </g>
      </svg>
      <Src f={f} at={w(998.16)}>TIME, January 2023</Src>
      <Cap f={f} at={w(1006.9)}>About one passage every 2 to 4 minutes, all day</Cap>
    </Bg>
  );
};

/* ================================================================== 1009 "Nine hours. One screen... the words are still there behind your eyes" */
export const C4Shift: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const t = t0 + f / 24;
  const day = clamp01((t - 1009.4) / 8);
  const hand = t < 1011.5 ? Math.max(0, t - 1009.38) * 2400 : 2.12 * 2400 + (t - 1011.5) * 36;
  const scroll = Math.max(0, f - w(1011.34)) * 2.4;
  const noSkip = ease(f, w(1013.68), 8);
  const eyes = ease(f, w(1017.6), 10), sh = ease(f, w(1019.14), 10);
  const ghost = ease(f, w(1024.52), 20);
  const pulse = 0.55 + 0.45 * Math.sin(f / 4);
  return (
    <Bg c="#1E2440">
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.05, 0, 0], [1012.0, 1000, 520, 1.1, 4, 0], [1016.9, 1000, 520, 1.1, 0, 0], [1017.7, 600, 640, 1.3, 0, 0], [1020.5, 600, 640, 1.3, 0, 0], [1022.0, 2880, 560, 1.0, -6, 0], [1024.4, 2880, 560, 1.0, 0, 0], [1026.8, 2880, 540, 1.2, 0, 0]]}>
        <World w={3840}>
          <defs>
            <clipPath id="c4shiftscr">
              <rect x={790} y={190} width={860} height={460} rx={8} />
            </clipPath>
            <radialGradient id="c4lamp">
              <stop offset="0" stopColor="#FFD27A" stopOpacity={0.6} />
              <stop offset="1" stopColor="#FFD27A" stopOpacity={0} />
            </radialGradient>
          </defs>
          {/* the office */}
          <rect x={-400} y={-300} width={2320} height={1700} fill="#1E2440" />
          <rect x={90} y={90} width={520} height={320} rx={12} fill={mix('#9BD9FF', '#0B1638', day)} stroke="#3A4468" strokeWidth={14} />
          <line x1={350} y1={90} x2={350} y2={410} stroke="#3A4468" strokeWidth={10} />
          <circle cx={lerp(200, 520, day)} cy={lerp(170, 330, day)} r={36} fill={mix('#FFE07A', '#E9EEF7', day)} />
          <g transform="translate(1780,190) scale(0.85)">
            <Face a={hand} />
          </g>
          <rect x={-400} y={700} width={2320} height={44} fill="#7A5A3A" />
          <rect x={-400} y={744} width={2320} height={500} fill="#151A30" />
          <rect x={1170} y={680} width={100} height={24} fill="#5B6B8C" />
          <rect x={760} y={160} width={920} height={520} rx={22} fill="#0C0C10" />
          <rect x={790} y={190} width={860} height={460} rx={8} fill="#E9EDF5" />
          <g clipPath="url(#c4shiftscr)">
            {Array.from({length: 6}, (_, i) => {
              const y = 215 + ((((i * 200 - scroll) % 1200) + 1200) % 1200) - 200;
              return (
                <g key={i}>
                  <rect x={815} y={y} width={810} height={170} rx={10} fill="#D5DBE8" />
                  <Redact x={840} y={y + 26} w={760} rows={4} gap={32} h={14} seed={`sh${i}`} c="#6A5A70" blur={3} />
                </g>
              );
            })}
            <rect x={790} y={580} width={860} height={70} fill="#E9EDF5" />
            <rect x={1440} y={592} width={180} height={48} rx={24} fill="#C9CFDB" />
            <text x={1530} y={626} textAnchor="middle" fontFamily={AF.head} fontWeight={700} fontSize={30} fill="#7C8AA8">
              Skip
            </text>
            {noSkip > 0 && <line x1={1440} y1={640} x2={lerp(1440, 1620, noSkip)} y2={lerp(640, 592, noSkip)} stroke={P.red} strokeWidth={8} strokeLinecap="round" />}
            <rect x={820} y={592} width={300} height={48} rx={24} fill={P.blue} />
            <text x={970} y={626} textAnchor="middle" fontFamily={AF.head} fontWeight={700} fontSize={30} fill={P.white}>
              Label · next
            </text>
          </g>
          {/* the worker, from behind */}
          <rect x={300} y={720} width={440} height={460} rx={150} fill={P.teal} />
          <rect x={480} y={660} width={80} height={80} fill="#6B4128" />
          <circle cx={520} cy={610} r={92} fill="#2B1D16" />
          {eyes > 0 && <circle cx={560} cy={600} r={130} fill="none" stroke={P.orange} strokeWidth={8} opacity={eyes * pulse} strokeDasharray="20 14" />}
          {sh > 0 && <path d="M320 790 Q520 690 720 790" stroke={P.orange} strokeWidth={16} fill="none" strokeLinecap="round" opacity={sh * pulse} />}
          <STag x={820} y={430} text="Eyes ache" size={40} bg={P.orange} color={P.white} o={eyes} />
          <STag x={170} y={760} text="Shoulders tighten" size={40} bg={P.orange} color={P.white} o={sh} />
          {/* home */}
          <rect x={1920} y={-300} width={1920} height={1180} fill="#7A3B2E" />
          <rect x={1920} y={880} width={1920} height={400} fill="#4A2620" />
          <rect x={2120} y={180} width={300} height={240} rx={10} fill="#0B1638" stroke="#5A2A22" strokeWidth={12} />
          <circle cx={2880} cy={330} r={420} fill="url(#c4lamp)" />
          <line x1={2880} y1={-300} x2={2880} y2={220} stroke="#2B1D16" strokeWidth={6} />
          <path d="M2810 270 L2950 270 L2920 215 L2840 215 Z" fill="#E5A23A" />
          {[[2560, 700, 1.0, P.orange, SKINS[3]], [2880, 690, 1.1, P.teal, '#6B4128'], [3190, 735, 0.8, P.yellow, SKINS[2]]].map(([x, y, s, c, sk], i) => (
            <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
              <Person c={c as string} skin={sk as string} f={f} />
            </g>
          ))}
          <rect x={2300} y={760} width={1160} height={34} rx={6} fill="#A86B34" />
          <rect x={2340} y={794} width={1080} height={120} fill="#8B5A2B" />
          {[2560, 2880, 3190].map((x) => (
            <ellipse key={x} cx={x} cy={760} rx={70} ry={14} fill={P.white} />
          ))}
          {ghost > 0 &&
            [[2700, 520], [3060, 540], [2740, 400], [3020, 410]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x + Math.sin(f / 14 + i) * 12},${y + Math.cos(f / 17 + i) * 8})`} opacity={ghost * 0.6}>
                <Redact x={-90} y={-20} w={180} rows={3} gap={20} h={10} seed={`gh${i}`} c="#F2E6DA" blur={4} />
              </g>
            ))}
        </World>
      </Cam>
      <Cap f={f} at={w(1009.38)} until={w(1011.2)}>
        Nine hours. One screen.
      </Cap>
      <Cap f={f} at={w(1011.34)} until={w(1013.2)}>
        Passage after passage
      </Cap>
      <Cap f={f} at={w(1013.36)} until={w(1014.85)}>
        You can't skip one
      </Cap>
      <Cap f={f} at={w(1014.94)} until={w(1017.4)}>
        Skipping isn't doing your job
      </Cap>
      <Cap f={f} at={w(1020.64)} until={w(1024.4)}>
        You go home. You sit down to eat with your family.
      </Cap>
      <Cap f={f} at={w(1024.52)}>…and the words are still there, behind your eyes</Cap>
    </Bg>
  );
};

/* ================================================================== 1027 "recurring visions... two words" */
export const C4Visions: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const rec = Math.max(0, f - w(1031.66));
  const card = ease(f, w(1029.24), 12);
  const dimK = ease(f, w(1034.9), 14);
  const quote = pop(f, w(1034.98), 14);
  return (
    <Bg c="#24124A">
      <Cam f={f} t0={t0} keys={[[t0, 900, 560, 1.08, 6, 0], [1033.4, 960, 540, 1.0, -6, 0], [1036.3, 980, 540, 0.96, 0, 0]]}>
        <World>
          <g opacity={1 - dimK * 0.55}>
            <g transform="translate(520,600)">
              <path d="M-230 520 Q-230 200 0 180 Q230 200 230 520 Z" fill="#3A2A6A" />
              <rect x={-40} y={110} width={80} height={90} fill="#120A2A" />
              <circle r={130} fill="#120A2A" />
              <path d="M118 -30 L150 10 L120 18 Z" fill="#120A2A" />
            </g>
            {rec > 0 && (
              <circle cx={520} cy={600} r={250} fill="none" stroke={P.pink} strokeWidth={8} strokeDasharray="40 26" strokeDashoffset={-f * 4} opacity={0.7} />
            )}
            {rec > 0 &&
              Array.from({length: 5}, (_, k) => {
                const ph = (rec / 34 + k / 5) % 1;
                const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
                const r = lerp(150, 330, ph);
                return (
                  <g key={k} transform={`translate(${520 + Math.cos(a) * r},${600 + Math.sin(a) * r}) scale(0.32)`} opacity={(1 - ph) * 0.8}>
                    <rect x={-210} y={-150} width={420} height={300} rx={20} fill="#E9EDF5" />
                    <Redact x={-170} y={-110} w={340} rows={6} gap={36} h={16} seed="vis" c="#6A4A70" blur={3} />
                  </g>
                );
              })}
            <g transform={`translate(1130,520) scale(${card})`} opacity={card}>
              <rect x={-210} y={-150} width={420} height={300} rx={20} fill="#E9EDF5" />
              <Redact x={-170} y={-110} w={340} rows={6} gap={36} h={16} seed="vis" c="#6A4A70" blur={4} />
              <text y={200} textAnchor="middle" fontFamily={AF.mono} fontSize={28} fill="rgba(255,255,255,0.75)">
                ONE PASSAGE · BLURRED
              </text>
            </g>
            <STag x={520} y={260} text="Recurring visions" size={40} bg={P.pink} color={P.white} o={ease(f, w(1031.66), 10)} />
          </g>
        </World>
      </Cam>
      <Lab f={f} at={w(1027.74)} title="One worker, speaking to TIME" sub="he labelled text for OpenAI through Sama" until={w(1034.8)} />
      <Cap f={f} at={w(1029.24)} until={w(1033.3)}>
        One passage left him with recurring visions
      </Cap>
      <Cap f={f} at={w(1033.42)} until={w(1034.9)}>
        He described the work in two words
      </Cap>
      {quote > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', transform: `scale(${quote})`, opacity: Math.min(1, quote)}}>
          <div style={{display: 'inline-block', background: P.white, borderRadius: 34, padding: '34px 70px', fontFamily: AF.head, fontWeight: 800, fontSize: 96, color: P.ink, boxShadow: '0 30px 70px rgba(0,0,0,0.4)'}}>“That was torture.”</div>
          <Note size={28} style={{marginTop: 22}}>
            Sama worker, to TIME · January 2023
          </Note>
        </div>
      )}
    </Bg>
  );
};

/* ================================================================== 1036 "So what were they paid? $1.32–$2 an hour... OpenAI paid Sama ~$12.50" */
export const C4Pay: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const nodes: [number, string, string, number][] = [
    [360, 'OpenAI', P.sky, 1038.3],
    [960, 'Sama', P.yellow, 1038.6],
    [1560, 'Workers', P.pink, 1039.38],
  ];
  const X0 = 520, PX = 100;
  const wk1 = ease(f, w(1041.25), 14), wk2 = ease(f, w(1043.16), 14), big = ease(f, w(1049.54), 28);
  const row1 = ease(f, w(1046.24), 10);
  return (
    <Bg c={P.navy}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Flow pts={[[480, 250], [840, 250]]} f={f} c={P.yellow} n={7} r={13} speed={6} o={big} />
        <Flow pts={[[1080, 250], [1440, 250]]} f={f} c={P.yellow} n={2} r={8} speed={4} o={wk1} />
        {nodes.map(([x, name, c, a]) => {
          const k = pop(f, w(a), 12);
          return k > 0 ? (
            <g key={name} transform={`translate(${x},250) scale(${k})`}>
              <circle r={110} fill={c} />
              {name === 'Workers' ? (
                <g transform="translate(0,-40) scale(0.9)">
                  <Crowd n={6} cols={3} gap={62} hi={6} c={P.white} f={f} />
                </g>
              ) : (
                <g transform="translate(0,30) scale(0.55)">
                  <Office f={f} floors={6} c={shade(c, 0.5)} />
                </g>
              )}
              <STag x={0} y={160} text={name} size={38} />
            </g>
          ) : null;
        })}
        <STag x={660} y={170} text="Contract" size={32} bg="rgba(255,255,255,0.18)" color={P.white} o={row1} />
      </svg>
      <Pop f={f} at={w(1036.5)} x={960} y={560} size={90} until={w(1038.0)}>
        So what were they paid?
      </Pop>
      {/* per hour of work, on one scale */}
      <div style={{position: 'absolute', left: 70, top: 580, width: 420, textAlign: 'right', fontFamily: AF.head, fontWeight: 700, fontSize: 36, color: P.white, opacity: row1}}>OpenAI paid Sama</div>
      <div style={{position: 'absolute', left: X0, top: 560, width: 12.5 * PX * big, height: 90, borderRadius: 16, background: P.sky, opacity: row1}} />
      <div style={{position: 'absolute', left: X0 + 30, top: 572, opacity: ease(f, w(1050.0), 10)}}>
        <Counter f={f} start={w(1049.54)} dur={28} to={12.5} decimals={2} prefix="$" suffix=" an hour" size={60} color={P.ink} />
      </div>
      <div style={{position: 'absolute', left: 70, top: 760, width: 420, textAlign: 'right', fontFamily: AF.head, fontWeight: 700, fontSize: 36, color: P.white, opacity: ease(f, w(1039.38), 10)}}>Workers took home</div>
      <div style={{position: 'absolute', left: X0, top: 740, width: 1.32 * PX * wk1, height: 90, borderRadius: '16px 0 0 16px', background: P.pink}} />
      <div style={{position: 'absolute', left: X0 + 132, top: 740, width: 0.68 * PX * wk2, height: 90, borderRadius: '0 16px 16px 0', background: P.pink, opacity: 0.5}} />
      <div style={{position: 'absolute', left: X0 + 230, top: 748, fontFamily: AF.head, fontWeight: 800, fontSize: 60, color: P.white, whiteSpace: 'nowrap'}}>
        <span style={{opacity: wk1}}>$1.32</span>
        <span style={{opacity: wk2}}>–$2</span>
        <span style={{opacity: ease(f, w(1043.62), 10), fontSize: 40}}> an hour</span>
      </div>
      <Note size={28} style={{position: 'absolute', left: X0, top: 852, opacity: ease(f, w(1044.36), 10)}}>
        take-home, depending on their role
      </Note>
      <div style={{position: 'absolute', left: 1180, top: 755, opacity: ease(f, w(1050.9), 10)}}>
        <Tag bg={P.yellow} color={P.ink} size={36}>
          ≈ 11–16% of the hourly rate
        </Tag>
      </div>
      <Src f={f} at={w(1038.04)} bottom>
        TIME, January 2023 · OpenAI–Sama contract rate per hour of work
      </Src>
    </Bg>
  );
};

/* ================================================================== 1052 "counseling rare and not enough... Sama disputed that" */
export const C4Counsel: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const turn = lerp(5, -5, ease(f, w(1055.8), 30));
  const bubble: React.CSSProperties = {position: 'absolute', width: 700, background: P.white, borderRadius: 36, padding: '30px 40px', boxSizing: 'border-box', fontFamily: AF.head, fontWeight: 700, fontSize: 52, lineHeight: 1.2, color: P.ink, boxShadow: '0 20px 50px rgba(0,0,0,0.3)'};
  const flick = 0.6 + 0.4 * Math.abs(Math.sin(f / 9));
  return (
    <Bg c={P.navy}>
      <AbsoluteFill style={{transform: `perspective(2400px) rotateY(${turn}deg)`}}>
        <div style={{position: 'absolute', left: -200, top: -60, width: 1155, height: 1200, background: '#3B1E4A'}} />
        <div style={{position: 'absolute', left: 965, top: -60, width: 1155, height: 1200, background: '#13406B'}} />
        {/* workers */}
        <div style={{position: 'absolute', left: 0, width: 955, top: 130, textAlign: 'center', transform: `scale(${pop(f, w(1052.12), 12)})`}}>
          <Tag bg={P.pink} color={P.white} size={44}>
            Workers said
          </Tag>
        </div>
        <div style={{...bubble, left: 128, top: 260, opacity: ease(f, w(1053.1), 10)}}>
          Counselling was <span style={{color: P.red, opacity: ease(f, w(1054.38), 8)}}>rare</span>
          <span style={{opacity: ease(f, w(1054.68), 8)}}> and not enough</span>
        </div>
        <svg width={955} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
          <g transform="translate(478,720)" opacity={ease(f, w(1053.1), 10)}>
            <rect x={-130} y={-170} width={260} height={340} rx={10} fill="#5A3A6A" />
            <rect x={-110} y={-150} width={220} height={320} fill="#2A1636" />
            <rect x={-110} y={166} width={220} height={6} fill={P.yellow} opacity={flick * 0.7} />
            <circle cx={80} cy={10} r={10} fill={P.yellow} />
            <STag x={0} y={-215} text="Counselling" size={32} bg={P.ink} color={P.white} />
          </g>
        </svg>
        {/* Sama */}
        <div style={{position: 'absolute', left: 965, width: 955, top: 130, textAlign: 'center', transform: `scale(${pop(f, w(1056.18), 12)})`}}>
          <Tag bg={P.yellow} color={P.ink} size={44}>
            Sama disputed that
          </Tag>
        </div>
        <div style={{...bubble, left: 1092, top: 260, opacity: ease(f, w(1057.82), 10)}}>Wellness support was available</div>
        <svg width={955} height={1080} style={{position: 'absolute', left: 965, top: 0}}>
          <g transform={`translate(478,730) rotate(${f * 1.5})`} opacity={ease(f, w(1058.0), 10)}>
            <circle r={150} fill="none" stroke={P.white} strokeWidth={60} />
            {[0, 90, 180, 270].map((a) => (
              <path key={a} d="M-26 -180 L26 -180 L26 -120 L-26 -120 Z" fill={P.red} transform={`rotate(${a})`} />
            ))}
          </g>
        </svg>
      </AbsoluteFill>
      <Src f={f} at={w(1052.5)} bottom>
        TIME, January 2023
      </Src>
    </Bg>
  );
};

/* ================================================================== 1060 "Feb 2022, Sama ended the contract eight months early. The story didn't end." */
export const C4Ended: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const M = 110, X0 = 400;
  const xm = (m: number) => X0 + m * M; // months after Nov 2021
  const cut = xm(3), end = xm(11);
  const show = ease(f, w(1060.4), 16);
  const snip = ease(f, w(1062.76), 8);
  const lost = ease(f, w(1064.52), 14);
  const more = ease(f, w(1066.1), 24);
  const after: [number, string, string, number][] = [
    [xm(14), 'Jan 2023', 'TIME investigation', 1066.6],
    [xm(20), 'Jul 2023', 'Petition to parliament', 1067.1],
    [xm(30), 'May 2024', 'Open letter', 1067.6],
  ];
  return (
    <Bg c="#20175A">
      <Cam f={f} t0={t0} keys={[[t0, 1000, 540, 1.0, 0, 0], [1064.2, 1000, 540, 1.0, 0, 0], [1065.2, 1020, 520, 0.95, 0, 0], [1066.0, 1020, 520, 0.95, 0, 0], [1068.4, 2600, 540, 0.7, -4, 0]]}>
        <World w={4000}>
          <line x1={200} y1={600} x2={lerp(end + 60, 3950, more)} y2={600} stroke="rgba(255,255,255,0.5)" strokeWidth={6} />
          {more > 0 && <line x1={end} y1={600} x2={lerp(end, 3950, more)} y2={600} stroke={P.yellow} strokeWidth={10} strokeDasharray="4 26" strokeLinecap="round" />}
          {Array.from({length: 33}, (_, m) => (
            <rect key={m} x={xm(m) - 2} y={590} width={4} height={20} fill="rgba(255,255,255,0.5)" />
          ))}
          {[['2022', 2], ['2023', 14], ['2024', 26]].map(([y, m]) => (
            <text key={y} x={xm(m as number)} y={668} textAnchor="middle" fontFamily={AF.head} fontWeight={700} fontSize={40} fill={P.white}>
              {y}
            </text>
          ))}
          <STag x={X0} y={735} text="Late 2021" size={34} bg="rgba(255,255,255,0.18)" color={P.white} />
          <STag x={X0 - 30} y={395} text="OpenAI → Sama contract" size={40} anchor="start" o={1 - more} />
          <g opacity={show}>
            <g transform={`translate(0,${lost * 40})`} opacity={1 - 0.65 * lost}>
              <rect x={cut} y={470} width={(end - cut) * show} height={80} rx={14} fill="none" stroke={P.white} strokeWidth={5} strokeDasharray="18 12" />
            </g>
            <rect x={X0} y={470} width={(cut - X0) * Math.min(1, show * 3)} height={80} rx={14} fill={P.yellow} />
          </g>
          {snip > 0 && <line x1={cut} y1={430} x2={cut} y2={lerp(430, 630, snip)} stroke={P.red} strokeWidth={10} strokeLinecap="round" />}
          {snip > 0 && (
            <g transform={`translate(${cut},${lerp(400, 640, snip)}) scale(0.9)`}>
              <circle cx={-22} cy={-40} r={18} fill="none" stroke={P.white} strokeWidth={8} />
              <circle cx={22} cy={-40} r={18} fill="none" stroke={P.white} strokeWidth={8} />
              <path d={`M-14 -26 L${8 - 10 * Math.sin(f / 2)} 30 M14 -26 L${-8 + 10 * Math.sin(f / 2)} 30`} stroke={P.white} strokeWidth={8} strokeLinecap="round" />
            </g>
          )}
          <STag x={cut} y={330} text="February 2022: Sama ends it" size={38} bg={P.red} color={P.white} o={ease(f, w(1060.52), 10) * (1 - more)} />
          {lost > 0 && <path d={`M${cut + 10} 455 Q${cut + 10} 435 ${cut + 40} 435 H${end - 40} Q${end - 10} 435 ${end - 10} 455`} fill="none" stroke={P.orange} strokeWidth={6} opacity={lost} />}
          <STag x={(cut + end) / 2 + 60} y={250} text="8 months early" size={48} bg={P.orange} color={P.white} o={ease(f, w(1064.94), 10) * (1 - more)} />
          {after.map(([x, d, e, a], i) => {
            const k = pop(f, w(a), 12);
            return k > 0 ? (
              <g key={d}>
                <circle cx={x} cy={600} r={22 * k} fill={P.yellow} />
                <STag x={x} y={i % 2 ? 760 : 450} text={e} size={48} bg={P.white} o={k} />
                <STag x={x} y={i % 2 ? 860 : 350} text={d} size={44} bg={P.yellow} o={k} />
              </g>
            ) : null;
          })}
        </World>
      </Cam>
      <Cap f={f} at={w(1066.08)}>But the story didn't end when the contract did</Cap>
    </Bg>
  );
};

/* ================================================================== 1069 "a petition asking parliament to investigate... a real health hazard" */
export const C4Petition: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const go = ease(f, w(1074.48), 20);
  const docX = lerp(700, 1300, go), docY = lerp(560, 640, go) - Math.sin(go * Math.PI) * 200, docS = lerp(1.0, 0.45, go);
  const mag = ease(f, w(1075.64), 10);
  const d1 = ease(f, w(1077.22), 10), d2 = ease(f, w(1080.58), 10);
  return (
    <Bg c="#173A5C">
      <Cam f={f} t0={t0} keys={[[t0, 780, 540, 1.0, 6, 0], [1076.6, 780, 540, 0.95, 0, 0], [1077.8, 2420, 540, 1.0, -4, 0], [1085.6, 2420, 560, 0.98, 0, 0]]}>
        <World w={3400}>
          <rect x={-400} y={860} width={4200} height={400} fill="#0F2A44" />
          <g opacity={1 - ease(f, w(1077.0), 12)}>
          <g transform="translate(330,640)">
            <Crowd n={6} cols={3} gap={92} hi={6} c={P.orange} f={f} />
          </g>
          <STag x={330} y={480} text="Former workers" size={36} o={ease(f, w(1070.78), 10)} />
          <Put x={1300} y={740} s={1.15}>
            <Columns dome />
          </Put>
          <STag x={1300} y={300} text="Kenya's parliament" size={38} bg={P.ink} color={P.white} o={ease(f, w(1073.94), 10)} />
          {(() => {
            const k = pop(f, w(1072.86), 12);
            return k > 0 ? (
              <g transform={`translate(${docX},${docY}) scale(${docS * k}) rotate(${-4 + go * 4})`}>
                <rect x={-120} y={-160} width={240} height={320} rx={10} fill={P.white} />
                <text y={-110} textAnchor="middle" fontFamily={AF.head} fontWeight={800} fontSize={36} fill={P.ink}>
                  Petition
                </text>
                <Redact x={-90} y={-70} w={180} rows={4} gap={24} h={10} seed="pet" c="#C5CCD8" blur={0} />
                {Array.from({length: 6}, (_, i) => (
                  <path key={i} d={`M${-90 + (i % 2) * 100} ${50 + Math.floor(i / 2) * 32} q12 -18 24 0 t24 0 t24 -4`} stroke={P.blue} strokeWidth={4} fill="none" />
                ))}
              </g>
            ) : null;
          })()}
          {mag > 0 && (
            <g transform={`translate(${1300 + Math.cos(f / 8) * 40},${560 + Math.sin(f / 8) * 30})`} opacity={mag}>
              <circle r={70} fill="rgba(70,180,255,0.2)" stroke={P.white} strokeWidth={12} />
              <rect x={46} y={46} width={26} height={100} rx={12} fill={P.white} transform="rotate(-45 50 50)" />
            </g>
          )}
          <STag x={1300} y={980} text="“Investigate”" size={40} bg={P.yellow} o={mag} />
          </g>
          {/* what they asked for */}
          <rect x={1760} y={130} width={1320} height={390} rx={30} fill={P.white} opacity={ease(f, w(1076.9), 10)} />
          <text x={1820} y={210} fontFamily={AF.head} fontWeight={800} fontSize={44} fill={P.ink} opacity={ease(f, w(1076.9), 10)}>
            They asked for:
          </text>
          <g opacity={d1}>
            <circle cx={1850} cy={300} r={30} fill={P.green} />
            <text x={1850} y={313} textAnchor="middle" fontFamily={AF.head} fontWeight={800} fontSize={36} fill={P.white}>1</text>
            <text x={1905} y={314} fontFamily={AF.head} fontWeight={700} fontSize={42} fill={P.ink}>Laws to protect people who do this work</text>
          </g>
          <g opacity={d2}>
            <circle cx={1850} cy={420} r={30} fill={P.orange} />
            <text x={1850} y={433} textAnchor="middle" fontFamily={AF.head} fontWeight={800} fontSize={36} fill={P.white}>2</text>
            <text x={1905} y={434} fontFamily={AF.head} fontWeight={700} fontSize={42} fill={P.ink}>The work recognised as a health hazard</text>
          </g>
          <Put x={2150} y={720} s={1.2} f={f} at={w(1081.86)}>
            <g>
              <rect x={-130} y={-90} width={260} height={170} rx={14} fill={P.ink} />
              <rect x={-116} y={-76} width={232} height={142} rx={6} fill="#BFE6FF" opacity={0.8 + 0.15 * Math.sin(f / 6)} />
              <rect x={-16} y={80} width={32} height={30} fill="#5B6B8C" />
              <g transform="translate(0,-8) scale(0.5)">
                <Hazard />
              </g>
            </g>
          </Put>
          <text x={2420} y={745} textAnchor="middle" fontFamily={AF.head} fontWeight={800} fontSize={90} fill={P.white} opacity={ease(f, w(1082.54), 10)}>
            =
          </text>
          <Put x={2680} y={720} s={1.1} f={f} at={w(1083.6)}>
            <g>
              <Drum />
              <g transform="translate(0,-5) scale(0.5)">
                <Hazard />
              </g>
            </g>
          </Put>
          <STag x={2150} y={910} text="Reading the worst text" size={36} o={ease(f, w(1082.14), 10)} />
          <STag x={2680} y={910} text="Dangerous chemicals" size={36} o={ease(f, w(1083.9), 10)} />
        </World>
      </Cam>
      <Lab f={f} at={w(1069.12)} title="2023 · Kenya" sub="a petition from former workers" until={w(1076.7)} />
      <Src f={f} at={w(1078.5)}>TIME / Guardian, July 2023</Src>
    </Bg>
  );
};

/* ================================================================== 1085 "took those companies to court... diagnosed with PTSD" */
export const C4Court: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const hit = f > w(1091.48) ? Math.max(0, 1 - Math.abs(Math.sin(((f - w(1091.48)) / 10) * Math.PI)) * (f - w(1091.48) < 20 ? 1 : 0)) : 0;
  const gavelUp = f < w(1091.48) ? 0 : f - w(1091.48) < 20 ? Math.abs(Math.sin(((f - w(1091.48)) / 10) * Math.PI)) : 0;
  const file = ease(f, w(1092.54), 16);
  return (
    <Bg c="#3A2A4A">
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.0, 0, 8], [1091.8, 960, 540, 1.05, 0, 6], [1093.2, 700, 560, 0.92, 6, 4], [1097.0, 700, 560, 0.9, 0, 2]]}>
        <World>
          <rect x={-300} y={-200} width={2520} height={1500} fill="#3A2A4A" />
          {Array.from({length: 12}, (_, i) => (
            <rect key={i} x={-300 + i * 220} y={120} width={200} height={500} rx={8} fill="#45325A" />
          ))}
          <rect x={-300} y={640} width={2520} height={600} fill="#2A1E36" />
          <Put x={960} y={340} s={0.9}>
            <Person c={P.ink} skin={SKINS[1]} f={f} />
          </Put>
          <rect x={640} y={340} width={640} height={220} rx={10} fill="#7A4A2A" />
          <rect x={640} y={340} width={640} height={24} fill="#946039" />
          <g transform={`translate(1160,300) scale(0.6) rotate(${-gavelUp * 30} 40 60)`}>
            <Gavel hit={1 - hit * 0} />
          </g>
          <g transform="translate(500,640)" opacity={ease(f, w(1086.26), 10)}>
            <Crowd n={3} cols={3} gap={110} hi={3} c={P.orange} f={f} />
          </g>
          <rect x={200} y={760} width={620} height={46} rx={8} fill="#946039" />
          <g opacity={ease(f, w(1088.16), 10)}>
            {[1300, 1520].map((x, i) => (
              <g key={x} transform={`translate(${x},660) scale(0.55)`}>
                <Person c={i ? '#3A4F8F' : P.ink} skin={SKINS[4]} f={f} />
              </g>
            ))}
          </g>
          <rect x={1100} y={760} width={620} height={46} rx={8} fill="#946039" />
          <STag x={510} y={880} text="Former content moderators" size={36} bg={P.orange} color={P.white} o={ease(f, w(1086.76), 10)} />
          <STag x={1410} y={880} text="Big tech companies" size={36} o={ease(f, w(1088.32), 10)} />
        </World>
      </Cam>
      <Lab f={f} at={w(1085.88)} title="Kenya · in court" sub="former moderators v. tech companies" until={w(1092.4)} />
      {file > 0 && (
        <div style={{position: 'absolute', left: lerp(1980, 1080, file), top: 170, width: 740, height: 620, transform: 'rotate(2deg)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 260, height: 70, background: '#E8C98A', borderRadius: '18px 18px 0 0'}} />
          <div style={{position: 'absolute', left: 0, top: 50, width: 740, height: 570, background: '#F2DCA8', borderRadius: '0 18px 18px 18px', boxShadow: '0 30px 70px rgba(0,0,0,0.45)', padding: '40px 46px', boxSizing: 'border-box'}}>
            <Note color={P.ink} size={28}>
              Medical file · former moderator
            </Note>
            <svg width={650} height={150} style={{marginTop: 16}}>
              <Redact x={0} y={10} w={640} rows={4} gap={34} h={14} seed="med" c="#C9B07A" blur={0} />
            </svg>
            <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 36, color: P.ink, marginTop: 6}}>Diagnosis:</div>
            <div style={{display: 'inline-block', marginTop: 14, transform: `rotate(-5deg) scale(${lerp(1.5, 1, Math.min(1, pop(f, w(1095.35), 10)))})`, opacity: Math.min(1, pop(f, w(1095.35), 10)), border: `6px solid ${P.red}`, borderRadius: 12, padding: '6px 26px', fontFamily: AF.head, fontWeight: 800, fontSize: 64, color: P.red}}>PTSD</div>
            <div style={{fontFamily: AF.head, fontWeight: 600, fontSize: 30, color: P.ink, marginTop: 16, opacity: ease(f, w(1095.66), 10)}}>post-traumatic stress disorder</div>
          </div>
        </div>
      )}
      <Cap f={f} at={w(1092.54)} until={w(1095.2)}>
        Several said they had been diagnosed with…
      </Cap>
      <Src f={f} at={w(1095.9)} bottom>
        Guardian, Dec 2024: more than 140 Kenyan moderators diagnosed with PTSD
      </Src>
    </Bg>
  );
};

/* ================================================================== 1097 "'ghost work'... makes technology look automatic... humans kept out of sight" */
export const C4Ghost: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const panel = ease(f, w(1102.4), 12);
  const open = ease(f, w(1105.96), 30);
  const seen = ease(f, w(1106.32), 36);
  return (
    <Bg c="#1A1440">
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 24}, (_, i) => {
          const col = i % 8, row = Math.floor(i / 8);
          return (
            <g key={i} transform={`translate(${240 + col * 205 + (row % 2) * 60},${430 + row * 200}) scale(${0.62 + row * 0.08})`} opacity={lerp(0.1, 1, seen)}>
              <AtLaptop f={f} c={seen > 0.5 ? [P.teal, P.orange, P.purple, P.pink, P.blue][(i * 3) % 5] : '#C9D2E6'} skin={seen > 0.5 ? SKINS[i % 5] : '#E6ECF7'} glow={P.sky} i={i} />
            </g>
          );
        })}
      </svg>
      {/* the product: it looks automatic */}
      {panel > 0 && (
        <div style={{position: 'absolute', left: 560, top: 330, width: 800, height: 600, transformOrigin: '0% 50%', transform: `perspective(1800px) rotateY(${-82 * open}deg) translateY(${(1 - panel) * 40}px)`, opacity: panel * (1 - 0.7 * open)}}>
          <div style={{width: '100%', height: '100%', background: P.white, borderRadius: 40, boxShadow: '0 40px 90px rgba(0,0,0,0.45)', padding: 44, boxSizing: 'border-box', position: 'relative'}}>
            <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 36, color: P.ink}}>Your AI app</div>
            <div style={{marginTop: 30, marginLeft: 'auto', width: 380, height: 70, borderRadius: 26, background: '#DCE6FF'}} />
            <div style={{marginTop: 24, width: 560, borderRadius: 26, background: '#EEF1F7', padding: '24px 28px', boxSizing: 'border-box', fontFamily: AF.body, fontWeight: 600, fontSize: 38, color: P.ink}}>Done! Here's your answer.</div>
            <div style={{position: 'absolute', left: 44, bottom: 44, opacity: ease(f, w(1104.5), 10)}}>
              <Tag bg={P.purple} color={P.white} size={40}>
                Looks automatic
              </Tag>
            </div>
            <svg width={800} height={600} style={{position: 'absolute', inset: 0}}>
              {[[690, 90], [720, 460], [610, 520]].map(([x, y], i) => {
                const s = 0.6 + 0.4 * Math.abs(Math.sin(f / 8 + i * 2));
                return <path key={i} d="M0 -30 L8 -8 L30 0 L8 8 L0 30 L-8 8 L-30 0 L-8 -8 Z" fill={P.yellow} transform={`translate(${x},${y}) scale(${s})`} />;
              })}
            </svg>
          </div>
        </div>
      )}
      <Pop f={f} at={w(1100.84)} x={960} y={150} size={110}>
        “Ghost work”
      </Pop>
      <Note size={28} style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center', opacity: ease(f, w(1101.3), 10)}}>
        what researchers call this hidden workforce
      </Note>
      <Lab f={f} at={w(1097.32)} title="Researchers have a name for it" until={w(1100.6)} />
      <Cap f={f} at={w(1105.96)}>…because the humans doing it are kept out of sight</Cap>
    </Bg>
  );
};

/* ================================================================== 1109 "OpenAI said... necessary to make AI safe... had not set the targets" → "the connection" */
export const C4Targets: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const conn = ease(f, w(1117.78), 16);
  const line = ease(f, w(1118.48), 18);
  return (
    <Bg c={P.navy}>
      <div style={{position: 'absolute', left: 260, top: lerp(170, 70, conn), width: 1400, transform: `scale(${lerp(1, 0.78, conn)})`, transformOrigin: '50% 0%', opacity: ease(f, w(1109.14), 10)}}>
        <Tag bg={P.sky} color={P.ink} size={48}>
          OpenAI said
        </Tag>
        {[
          [1111.3, 'This work was a necessary part of making AI safe', P.green],
          [1114.96, 'It had not set the productivity targets', P.orange],
        ].map(([a, text, c], i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 28, marginTop: 40, opacity: ease(f, w(a as number), 10), transform: `translateX(${(1 - ease(f, w(a as number), 12)) * 40}px)`}}>
            <svg width={90} height={90} viewBox="-50 -50 100 100">
              {i === 0 ? (
                <g>
                  <path d="M0 -44 L38 -30 V4 Q38 32 0 46 Q-38 32 -38 4 V-30 Z" fill={c as string} />
                  <path d="M-16 0 L-4 14 L18 -12" stroke={P.white} strokeWidth={8} fill="none" strokeLinecap="round" />
                </g>
              ) : (
                <g>
                  {[42, 28, 14].map((r, j) => (
                    <circle key={r} r={r} fill={j % 2 ? P.white : (c as string)} />
                  ))}
                  <line x1={-40} y1={-40} x2={40} y2={40} stroke={P.white} strokeWidth={10} strokeLinecap="round" />
                </g>
              )}
            </svg>
            <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 50, color: P.white}}>{text as string}</div>
          </div>
        ))}
      </div>
      {conn > 0 && (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: conn}}>
          <g transform="translate(400,760) scale(1.05)">
            <AtLaptop f={f} c={P.teal} skin={SKINS[1]} />
          </g>
          <path d={`M520 700 Q960 ${560} ${lerp(520, 1380, line)} ${lerp(700, 700, line)}`} stroke={P.yellow} strokeWidth={8} strokeDasharray="18 16" fill="none" strokeDashoffset={-f * 3} />
          <g transform="translate(1500,730)" opacity={line}>
            <rect x={-160} y={-90} width={320} height={160} rx={36} fill={P.white} />
            <path d="M-80 70 L-110 120 L-30 70 Z" fill={P.white} />
            <Redact x={-120} y={-50} w={240} rows={3} gap={30} h={14} seed="bub" c="#9FB0D3" blur={0} />
          </g>
          <text x={960} y={950} textAnchor="middle" fontFamily={AF.head} fontWeight={800} fontSize={54} fill={P.white} opacity={ease(f, w(1118.48), 10)}>
            The connection most people never make
          </text>
        </svg>
      )}
      <Src f={f} at={w(1109.6)} until={w(1117.6)} bottom>
        OpenAI statement to TIME, January 2023
      </Src>
    </Bg>
  );
};

/* ================================================================== 1126.3 "reinforcement learning from human feedback... rank them... millions of times" */
export const C4Rlhf: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const words: [string, number, boolean][] = [
    ['Reinforcement', 1128.66, false],
    ['Learning', 1129.18, false],
    ['from', 1129.86, false],
    ['Human', 1130.2, true],
    ['Feedback', 1130.56, false],
  ];
  const a = 1 - ease(f, w(1131.6), 10);
  const b = ease(f, w(1131.7), 10) * (1 - ease(f, w(1139.2), 12));
  const c = ease(f, w(1139.24), 12);
  const rank = ease(f, w(1134.58), 18);
  // cards: 0 better, 1 worse, 2 harmful; before ranking they sit harmful, better, worse
  const slot0 = [1, 2, 0], slot1 = [0, 1, 2];
  const badges: [number, string, string][] = [
    [1135.42, 'Better', P.green],
    [1136.64, 'Worse', P.orange],
    [1137.7, 'Harmful', P.red],
  ];
  const needle = ease(f, w(1140.88), 30);
  return (
    <Bg c="#162A66">
      {a > 0 && (
        <AbsoluteFill style={{opacity: a}}>
          <Note size={30} style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', opacity: ease(f, w(1127.96), 10)}}>
            Part of it comes from a method called
          </Note>
          <div style={{position: 'absolute', left: 120, right: 120, top: 330, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 30px'}}>
            {words.map(([t, at0, hi]) => (
              <span key={t} style={{fontFamily: AF.head, fontWeight: 800, fontSize: hi ? 120 : 96, color: hi ? P.yellow : P.white, transform: `scale(${pop(f, w(at0), 12)})`, display: 'inline-block', borderBottom: hi ? `10px solid ${P.yellow}` : undefined}}>
                {t}
              </span>
            ))}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', opacity: ease(f, w(1130.8), 10)}}>
            <Tag bg={P.white} color={P.ink} size={48}>
              RLHF
            </Tag>
          </div>
        </AbsoluteFill>
      )}
      {b > 0 && (
        <AbsoluteFill style={{opacity: b}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <g transform="translate(270,640) scale(1.5)">
              <AtLaptop f={f} c={P.pink} skin={SKINS[0]} />
            </g>
            <rect x={600} y={180} width={1200} height={84} rx={30} fill={P.blue} />
            <text x={640} y={235} fontFamily={AF.body} fontWeight={600} fontSize={36} fill={P.white}>
              How do I fix a flat bike tyre?
            </text>
            <text x={1770} y={234} textAnchor="end" fontFamily={AF.mono} fontSize={26} fill="rgba(255,255,255,0.75)">
              EXAMPLE
            </text>
            {[0, 1, 2].map((card) => {
              const y = 330 + lerp(slot0[card], slot1[card], rank) * 190;
              const [ba, bt, bc] = badges[card];
              const bk = pop(f, w(ba), 10);
              return (
                <g key={card} transform={`translate(600,${y})`}>
                  <rect width={1200} height={160} rx={24} fill={card === 2 ? '#3A1A2E' : P.white} />
                  <Redact x={130} y={36} w={760} rows={3} gap={34} h={16} seed={`ans${card}`} c={card === 2 ? '#7A2E45' : '#9FB0D3'} blur={card === 2 ? 4 : 0} />
                  <circle cx={66} cy={80} r={40} fill={rank > 0.5 ? bc : '#7C8AA8'} />
                  <text x={66} y={95} textAnchor="middle" fontFamily={AF.head} fontWeight={800} fontSize={42} fill={P.white}>
                    {rank > 0.5 ? card + 1 : '?'}
                  </text>
                  {bk > 0 && (
                    <g transform={`translate(1060,80) scale(${bk})`}>
                      <STag x={0} y={0} text={bt} size={40} bg={bc} color={P.white} />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
          <Pop f={f} at={w(1132.86)} x={960} y={95} size={52}>
            People read AI answers and rank them
          </Pop>
        </AbsoluteFill>
      )}
      {c > 0 && (
        <AbsoluteFill style={{opacity: c}}>
          <div style={{position: 'absolute', left: 120, top: 220}}>
            <IconGrid f={f} start={w(1139.3)} n={600} hi={600} cols={30} size={18} gap={8} stagger={0.05} shape="square" color={[P.green, P.orange, P.red][Math.floor(f / 3) % 3]} />
            <Note size={28} style={{marginTop: 24}}>
              each square: one ranking · illustration
            </Note>
          </div>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <Flow pts={[[920, 420], [1250, 420]]} f={f} c={P.yellow} n={6} r={11} speed={8} />
            <Put x={1490} y={400} s={0.8}>
              <Model f={f} glow={1} />
            </Put>
            <g transform="translate(1490,820)" opacity={ease(f, w(1140.6), 10)}>
              <path d="M-200 0 A200 200 0 0 1 200 0" stroke="rgba(255,255,255,0.2)" strokeWidth={40} fill="none" />
              <path d="M-200 0 A200 200 0 0 1 200 0" stroke={P.green} strokeWidth={40} fill="none" strokeDasharray={`${Math.PI * 200 * needle} 1400`} />
              <line x1={0} y1={0} x2={170 * Math.cos(Math.PI * (1 - needle))} y2={-170 * Math.sin(Math.PI * (1 - needle))} stroke={P.white} strokeWidth={10} strokeLinecap="round" />
              <circle r={16} fill={P.white} />
              <text x={-200} y={60} textAnchor="middle" fontFamily={AF.head} fontWeight={700} fontSize={30} fill={P.white}>raw</text>
              <text x={200} y={60} textAnchor="middle" fontFamily={AF.head} fontWeight={700} fontSize={30} fill={P.white}>careful</text>
            </g>
          </svg>
          <Pop f={f} at={w(1139.38)} x={960} y={110} size={60}>
            Do that millions of times…
          </Pop>
          <Cap f={f} at={w(1140.88)}>…and the AI learns how to behave</Cap>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== 1143 "every 'please', every 'I'm sorry'... shaped by human hands" */
export const C4Please: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const h0 = ease(f, w(1143.5), 8), h1 = ease(f, w(1144.68), 8), h2 = ease(f, w(1147.22), 10);
  const threads = ease(f, w(1146.8), 14);
  const hl = (k: number): React.CSSProperties => ({background: `rgba(255,197,49,${0.9 * k})`, borderRadius: 10, padding: '0 6px'});
  const places: [number, string][] = [
    [400, 'Small apartments'],
    [960, 'Internet cafés'],
    [1520, 'Kitchen tables'],
  ];
  return (
    <Bg c={P.teal} c2="#0A4D63" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 380, 1.12, 0, 0], [1146.5, 960, 380, 1.12, 0, 0], [1148.0, 960, 880, 0.6, 0, 0], [1150.0, 960, 880, 0.58, 0, 0]]}>
        <div style={{position: 'absolute', left: 300, top: 110, width: 1320, background: P.white, borderRadius: 44, padding: '46px 56px', boxSizing: 'border-box', fontFamily: AF.body, fontWeight: 500, fontSize: 46, lineHeight: 1.7, color: P.ink, boxShadow: `0 0 0 ${10 * h2}px ${P.yellow}, 0 30px 70px rgba(0,0,0,0.3)`}}>
          <div>
            <span style={hl(h1)}>I'm sorry, I can't help with that.</span>
          </div>
          <div>Here's a safer way to start, if it helps.</div>
          <div>
            <span style={hl(h0)}>Please</span> let me know if there's more I can do.
          </div>
        </div>
        <World h={2000}>
          {places.map(([x], i) => (
            <Flow key={x} pts={[[[560, 960, 1360][i], 560], [[560, 960, 1360][i], 800], [x, 1040]]} f={f} c={P.yellow} n={5} r={10} speed={7} o={threads} />
          ))}
          {places.map(([x, name], i) => (
            <g key={name} opacity={threads}>
              <rect x={x - 250} y={1040} width={500} height={360} rx={30} fill={['#5A3A6A', '#2A3150', '#7A3B2E'][i]} />
              {i === 0 && (
                <g>
                  <rect x={x - 220} y={1250} width={170} height={90} rx={12} fill="#C9D2E6" />
                  <rect x={x - 220} y={1230} width={60} height={40} rx={10} fill={P.white} />
                  <rect x={x + 120} y={1080} width={100} height={90} rx={6} fill="#0B1638" />
                  <g transform={`translate(${x + 60},1270) scale(0.8)`}>
                    <AtLaptop f={f} c={P.orange} skin={SKINS[0]} />
                  </g>
                </g>
              )}
              {i === 1 &&
                [-150, 0, 150].map((dx, j) => (
                  <g key={dx} transform={`translate(${x + dx},1270) scale(0.62)`}>
                    <AtLaptop f={f} c={[P.blue, P.pink, P.green][j]} skin={SKINS[j + 1]} i={j} />
                  </g>
                ))}
              {i === 2 && (
                <g>
                  <path d={`M${x - 200} 1130 h50 v30 h-50 Z`} fill="#E5A23A" />
                  <g transform={`translate(${x},1270) scale(0.85)`}>
                    <AtLaptop f={f} c={P.purple} skin={SKINS[3]} />
                  </g>
                  <rect x={x - 230} y={1290} width={460} height={20} rx={6} fill="#A86B34" />
                </g>
              )}
              <STag x={x} y={1450} text={name} size={50} />
            </g>
          ))}
        </World>
      </Cam>
      <Cap f={f} at={w(1148.22)}>…shaped by human hands</Cap>
    </Bg>
  );
};

/* ================================================================== 1150 "a giant industry... Scale AI... Meta invested over $14 billion... huge networks" */
const SKYLINE: [number, number][] = [[230, 200], [400, 300], [560, 160], [730, 380], [960, 560], [1190, 340], [1360, 220], [1530, 290], [1700, 180]];
const NET = Array.from({length: 46}, (_, i) => [140 + random(`nx${i}`) * 1640, 1010 + random(`ny${i}`) * 880] as [number, number]);
export const C4Industry: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const scale = ease(f, w(1155.53), 10);
  const meta = ease(f, w(1160.18), 10);
  const net = ease(f, w(1164.42), 16);
  return (
    <Bg c={P.night}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.05, 0, 0], [1164.3, 960, 540, 1.0, 0, 0], [1165.5, 960, 1120, 0.7, 0, 6]]}>
        <World h={2100}>
          <rect x={-800} y={820} width={3520} height={1400} fill="#120D30" />
          <rect x={-800} y={812} width={3520} height={12} fill="#3A2F7A" />
          {SKYLINE.map(([x, h], i) => {
            const k = ease(f, w(1150.26) + i * 3, 16);
            const tower = i === 4;
            const W = tower ? 210 : 130;
            const hh = h * k;
            return k > 0 ? (
              <g key={i}>
                <rect x={x - W / 2} y={820 - hh} width={W} height={hh} fill={tower ? '#3A4F8F' : '#2A3570'} stroke={tower && scale > 0 ? P.yellow : 'none'} strokeWidth={6} />
                {Array.from({length: Math.floor(hh / 34)}, (_, r) =>
                  Array.from({length: tower ? 5 : 3}, (_, c) => (
                    <rect key={`${r}-${c}`} x={x - W / 2 + 18 + c * 38} y={820 - hh + 16 + r * 34} width={20} height={16} fill={(r * 5 + c * 3 + i + Math.floor(f / 20)) % 4 ? '#8FB4FF' : P.yellow} opacity={0.8} />
                  )),
                )}
              </g>
            ) : null;
          })}
          <STag x={960} y={205} text="Scale AI" size={50} bg={P.yellow} o={scale} />
          <STag x={960} y={128} text="one of the biggest players" size={32} bg="rgba(255,255,255,0.18)" color={P.white} o={ease(f, w(1156.68), 10) * (1 - ease(f, w(1158.6), 8))} />
          <STag x={1530} y={440} text="Meta" size={48} o={meta} />
          <Flow pts={[[1460, 440], [1250, 420], [1075, 380]]} f={f} c={P.yellow} n={6} r={13} speed={7} o={ease(f, w(1160.44), 10)} />
          {/* underneath: the workers */}
          <g opacity={net}>
            {NET.map(([x, y], i) => {
              const [x2, y2] = i % 5 === 0 ? [960, 822] : NET[(i * 7 + 3) % NET.length];
              return <line key={`l${i}`} x1={x} y1={y} x2={x2} y2={y2} stroke="#5A4FB0" strokeWidth={3} opacity={0.7} />;
            })}
            {NET.filter((_, i) => i % 5 === 0).map(([x, y], i) => (
              <Flow key={`f${i}`} pts={[[x, y], [960, 822]]} f={f} c={P.yellow} n={2} r={7} speed={5} line={false} />
            ))}
            {NET.map(([x, y], i) => (
              <g key={i} transform={`translate(${x},${y}) scale(0.26)`}>
                <Person c={[P.teal, P.orange, P.pink, P.sky][i % 4]} skin={SKINS[i % 5]} f={f} />
              </g>
            ))}
          </g>
        </World>
      </Cam>
      <Pop f={f} at={w(1151.62)} x={960} y={150} size={72} until={w(1155.2)}>
        <span style={{background: P.ink, borderRadius: 30, padding: '10px 34px'}}>A giant industry</span>
      </Pop>
      <Lab f={f} at={w(1158.9)} title="2025" sub="Meta invests in Scale AI" until={w(1164.3)} />
      <div style={{position: 'absolute', right: 80, top: 70, textAlign: 'right', opacity: (1 - net)}}>
        <Counter f={f} start={w(1161.26)} dur={30} to={14} prefix="$" suffix=" billion+" size={110} color={P.yellow} />
        <Note size={26} style={{marginTop: 8, opacity: ease(f, w(1162.6), 10)}}>
          ≈ $14.3B for 49% · Reuters, 12 Jun 2025
        </Note>
      </div>
    </Bg>
  );
};

/* ================================================================== 1176.7 "Philippines... Remotasks... far below minimum wage... delayed or cancelled" */
export const C4Remotasks: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const box = (f % 60) / 60;
  const objs: [number, number, number, number][] = [
    [380, 560, 200, 110],
    [700, 590, 220, 120],
    [960, 470, 70, 170],
  ];
  const cur = Math.floor(f / 60) % objs.length;
  const below = ease(f, w(1185.4), 16);
  return (
    <Bg c="#0E4A5A" c2="#0A2238" angle={160}>
      <Cam f={f} t0={t0} keys={[[t0, 900, 540, 1.0, 6, 0], [1184.2, 900, 540, 1.0, 0, 0], [1185.3, 2660, 560, 1.0, -5, 0], [1189.9, 2660, 560, 0.96, 0, 0]]}>
        <World w={3400}>
          {/* the laptop and the task */}
          <rect x={260} y={140} width={1300} height={760} rx={30} fill="#0C0C10" />
          <path d="M180 900 H1640 L1600 950 H220 Z" fill="#C9CDD6" />
          <rect x={290} y={170} width={1240} height={700} fill="#F4F6FB" />
          <rect x={290} y={170} width={1240} height={74} fill="#2A3150" />
          <STag x={318} y={207} text="Remotasks" size={34} bg={P.yellow} anchor="start" o={ease(f, w(1182.9), 10)} />
          <text x={1500} y={218} textAnchor="end" fontFamily={AF.mono} fontSize={28} fill="rgba(255,255,255,0.85)" opacity={ease(f, w(1180.4), 10)}>
            a Scale AI platform
          </text>
          <rect x={320} y={270} width={820} height={570} rx={10} fill="#9BD9FF" />
          <rect x={320} y={620} width={820} height={220} fill="#6E7487" />
          {Array.from({length: 6}, (_, i) => (
            <rect key={i} x={340 + i * 140} y={720} width={70} height={10} fill={P.white} />
          ))}
          <rect x={380} y={560} width={200} height={110} rx={20} fill={P.red} />
          <rect x={700} y={590} width={220} height={120} rx={20} fill={P.blue} />
          <g transform="translate(995,560) scale(0.85)">
            <Person c={P.green} skin={SKINS[2]} f={f} />
          </g>
          {objs.map(([x, y, bw, bh], i) => {
            const done = i < cur || (i === cur && box > 0.6);
            const k = i === cur ? clamp01(box / 0.6) : i < cur ? 1 : 0;
            if (k <= 0 && !done) return null;
            return <rect key={i} x={x - 10} y={y - 10} width={(bw + 20) * k} height={bh + 20} fill="none" stroke={P.yellow} strokeWidth={6} strokeDasharray="16 10" />;
          })}
          <rect x={1170} y={270} width={330} height={570} rx={10} fill="#E3E8F2" />
          {['Car', 'Person', 'Bike'].map((t, i) => (
            <STag key={t} x={1335} y={330 + i * 90} text={t} size={32} bg={i === (cur === 2 ? 1 : 0) ? P.yellow : P.white} />
          ))}
          <rect x={1200} y={760} width={270} height={56} rx={28} fill={P.blue} />
          <text x={1335} y={798} textAnchor="middle" fontFamily={AF.head} fontWeight={700} fontSize={30} fill={P.white}>
            Submit
          </text>
          <STag x={910} y={1010} text="AI labelling, task after task" size={36} o={ease(f, w(1178.16), 10)} />
          {/* the pay */}
          <line x1={2030} y1={880} x2={2720} y2={880} stroke={P.white} strokeWidth={6} />
          <line x1={2030} y1={400} x2={2720} y2={400} stroke={P.yellow} strokeWidth={8} strokeDasharray="22 14" opacity={ease(f, w(1186.28), 10)} />
          <STag x={2375} y={340} text="Minimum wage" size={40} bg={P.yellow} o={ease(f, w(1186.28), 10)} />
          <rect x={2295} y={880 - 170 * below} width={160} height={170 * below} rx={10} fill={P.pink} />
          <STag x={2375} y={650} text="What many said they got" size={32} bg={P.pink} color={P.white} o={ease(f, w(1185.2), 10)} />
          {below > 0 && (
            <g opacity={below}>
              <line x1={2690} y1={420} x2={2690} y2={690} stroke={P.orange} strokeWidth={6} />
              <path d="M2690 710 l-16 -26 h32 Z" fill={P.orange} />
              <STag x={2720} y={540} text="far below" size={36} bg={P.orange} color={P.white} anchor="start" />
            </g>
          )}
          <text x={2375} y={930} textAnchor="middle" fontFamily={AF.mono} fontSize={28} fill="rgba(255,255,255,0.7)">
            ILLUSTRATION · NOT TO SCALE
          </text>
          <g opacity={ease(f, w(1187.34), 10)}>
            <rect x={3000} y={300} width={460} height={480} rx={26} fill={P.white} />
            <text x={3040} y={370} fontFamily={AF.head} fontWeight={800} fontSize={40} fill={P.ink}>
              Payments
            </text>
            {[0, 1].map((r) => (
              <g key={r}>
                <rect x={3040} y={430 + r * 160} width={380} height={120} rx={16} fill="#EEF1F7" />
                <text x={3064} y={500 + r * 160} fontFamily={AF.head} fontWeight={700} fontSize={32} fill={P.ink}>
                  Payment
                </text>
              </g>
            ))}
          </g>
          <Stamp x={3290} y={490} text="DELAYED" k={pop(f, w(1188.2), 10)} c={P.orange} size={34} rot={-8} />
          <Stamp x={3290} y={650} text="CANCELLED" k={pop(f, w(1188.96), 10)} c={P.red} size={34} rot={-6} />
        </World>
      </Cam>
      <Lab f={f} at={0} title="The Philippines" sub="Washington Post report, August 2023" until={w(1184.3)} />
      <Cap f={f} at={w(1184.34)} until={w(1187.2)}>
        Many said they were paid far below the minimum wage
      </Cap>
      <Cap f={f} at={w(1187.34)}>…and payments were often delayed or cancelled</Cap>
    </Bg>
  );
};

/* ================================================================== 1189.9 "nearly a hundred Kenyan data workers wrote an open letter... modern-day slavery" */
export const C4Letter: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const letter = pop(f, w(1193.9), 14);
  const sent = ease(f, w(1194.86), 12);
  return (
    <Bg c={P.navy}>
      <div style={{position: 'absolute', left: 110, top: 220}}>
        <IconGrid f={f} start={w(1191.32)} n={97} hi={97} cols={10} size={42} gap={10} stagger={0.4} shape="person" color={P.orange} />
      </div>
      <Note size={28} style={{position: 'absolute', left: 110, top: 760, opacity: ease(f, w(1192.98), 10)}}>
        about 97 signed
      </Note>
      {letter > 0 && (
        <div style={{position: 'absolute', left: 720, top: 170, width: 520, height: 620, background: P.cream, borderRadius: 14, transform: `rotate(-2deg) scale(${letter})`, boxShadow: '0 30px 70px rgba(0,0,0,0.4)', padding: '40px 44px', boxSizing: 'border-box'}}>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 44, color: P.ink}}>An open letter</div>
          <div style={{fontFamily: AF.head, fontWeight: 600, fontSize: 30, lineHeight: 1.25, color: P.ink, marginTop: 12, opacity: ease(f, w(1194.58), 10)}}>To the President of the United States</div>
          <svg width={440} height={360} style={{marginTop: 20}}>
            <Redact x={0} y={10} w={430} rows={5} gap={30} h={12} seed="let" c="#C9C1B0" blur={0} />
            {Array.from({length: 9}, (_, i) => (
              <path key={i} d={`M${(i % 3) * 145} ${200 + Math.floor(i / 3) * 50} q14 -20 28 0 t28 0 t30 -6`} stroke={P.blue} strokeWidth={4} fill="none" />
            ))}
          </svg>
        </div>
      )}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Flow pts={curve([1250, 380], [1420, 160], [1560, 400])} f={f} c={P.yellow} n={5} r={11} speed={6} o={sent} />
        <Put x={1600} y={600} s={0.95} f={f} at={w(1194.86)}>
          <Columns n={7} />
        </Put>
        <STag x={1600} y={760} text="Washington, D.C." size={36} o={ease(f, w(1195.3), 10)} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 840, textAlign: 'center'}}>
        <div style={{fontFamily: AF.head, fontWeight: 600, fontSize: 36, color: P.white, opacity: ease(f, w(1197.36), 10)}}>They said their working conditions amounted to</div>
        <div style={{display: 'inline-block', marginTop: 10, transform: `scale(${pop(f, w(1199.24), 12)})`}}>
          <Tag bg={P.red} color={P.white} size={60}>
            “modern-day slavery”
          </Tag>
        </div>
      </div>
      <Lab f={f} at={w(1190.12)} title="2024" sub="Kenyan data workers" />
      <Src f={f} at={w(1191.0)}>CBS News / Guardian, May 2024</Src>
    </Bg>
  );
};

/* ================================================================== 1200.7 "to be fair... doctors, lawyers, scientists... paid very well" */
export const C4Experts: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const ex: [number, string, string, number, string][] = [
    [300, 'Doctors', P.white, 1205.0, 'cross'],
    [700, 'Lawyers', P.navy, 1205.8, 'scales'],
    [1100, 'Scientists', P.purple, 1206.24, 'flask'],
  ];
  const coins = ease(f, w(1207.2), 24);
  const train = ease(f, w(1208.52), 12);
  return (
    <Bg c="#46B4FF" c2="#1F7FD6" angle={180}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <rect x={0} y={740} width={1920} height={340} fill="#1B5FAE" />
        {ex.map(([x, , c, a, icon], i) => {
          const k = pop(f, w(a), 12);
          return k > 0 ? (
            <g key={i}>
              <g transform={`translate(${x},580) scale(${1.5 * k})`}>
                <Person c={c} skin={SKINS[(i + 2) % 5]} f={f} />
                {icon === 'cross' && <path d="M-6 -30 h12 v10 h10 v12 h-10 v10 h-12 v-10 h-10 v-12 h10 Z" fill={P.red} />}
              </g>
              <g transform={`translate(${x + 95},${390}) scale(${k})`}>
                <circle r={46} fill={P.white} />
                {icon === 'cross' && <path d="M-10 -30 h20 v20 h20 v20 h-20 v20 h-20 v-20 h-20 v-20 h20 Z" fill={P.red} />}
                {icon === 'scales' && (
                  <g stroke={P.ink} strokeWidth={5} fill="none">
                    <path d="M0 -30 V28 M-30 -18 H30 M-30 -18 L-40 6 H-20 Z M30 -18 L20 6 H40 Z" />
                  </g>
                )}
                {icon === 'flask' && <path d="M-10 -30 h20 v18 l22 36 q4 10 -8 10 h-48 q-12 0 -8 -10 l22 -36 Z" fill={P.green} />}
              </g>
              {Array.from({length: Math.round(coins * 8)}, (_, j) => (
                <g key={j} transform={`translate(${x + 150},${700 - j * 15}) scale(0.45)`}>
                  <Coin />
                </g>
              ))}
            </g>
          ) : null;
        })}
        {ex.map(([x], i) => (
          <Flow key={i} pts={[[x, 440], [x + 300, 300], [1500, 360]]} f={f} c={P.yellow} n={4} r={9} speed={7} o={train} />
        ))}
        <Put x={1640} y={420} s={0.8} f={f} at={w(1208.52)}>
          <Model f={f} glow={1} label="More advanced models" />
        </Put>
        {ex.map(([x, name, , a]) => (
          <STag key={name} x={x} y={800} text={name} size={44} o={ease(f, w(a), 10)} />
        ))}
      </svg>
      <Pop f={f} at={w(1201.0)} x={960} y={140} size={68} until={w(1203.3)}>
        <span style={{background: P.ink, borderRadius: 30, padding: '10px 34px'}}>To be fair, the picture is changing</span>
      </Pop>
      <Pop f={f} at={w(1207.52)} x={700} y={140} size={68}>
        <span style={{background: P.yellow, color: P.ink, borderRadius: 30, padding: '10px 34px'}}>Paid very well</span>
      </Pop>
      <Cap f={f} at={w(1210.64)}>Some workers say it changed their lives for the better</Cap>
    </Bg>
  );
};

/* ================================================================== 1214 "a two-tier system: experts on top... a hidden army underneath" */
export const C4TwoTier: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const tags: [number, number, string, string][] = [
    [1219.76, 1012, 'A hidden army', P.white],
    [1220.96, 1475, 'The hardest, most traumatic work', P.pink],
    [1223.0, 1935, 'A few dollars an hour', P.yellow],
  ];
  return (
    <Bg c="#46B4FF">
      <Cam f={f} t0={t0} keys={[[t0, 960, 500, 1.05, 0, 0], [1218.3, 960, 500, 1.05, 0, 0], [1220.0, 960, 1300, 0.5, 0, 0], [1224.5, 960, 1320, 0.48, 0, 0]]}>
        <World h={2400}>
          <rect x={-1200} y={-800} width={4320} height={1500} fill="#46B4FF" />
          <rect x={-1200} y={700} width={4320} height={2000} fill="#3A2A1E" />
          <rect x={-1200} y={690} width={4320} height={20} fill={P.green} />
          {/* top tier */}
          <rect x={560} y={330} width={800} height={370} rx={16} fill="#E8F4FF" stroke={P.white} strokeWidth={8} />
          {[720, 960, 1200].map((x, i) => (
            <g key={x} transform={`translate(${x},600) scale(0.95)`}>
              <AtLaptop f={f} c={[P.white, P.navy, P.purple][i]} skin={SKINS[(i + 2) % 5]} />
            </g>
          ))}
          <STag x={960} y={270} text="Experts on top" size={48} bg={P.ink} color={P.white} o={ease(f, w(1216.26), 10)} />
          <g opacity={ease(f, w(1217.28), 10)}>
            {Array.from({length: 6}, (_, j) => (
              <g key={j} transform={`translate(1500,${660 - j * 16}) scale(0.6)`}>
                <Coin />
              </g>
            ))}
            <STag x={1500} y={520} text="Well paid" size={44} bg={P.yellow} />
          </g>
          {/* underneath */}
          <rect x={120} y={780} width={1680} height={1520} rx={20} fill="#0E1230" />
          {Array.from({length: 72}, (_, n) => {
            const c = n % 12, r = Math.floor(n / 12);
            return (
              <g key={n} transform={`translate(${220 + c * 135},${900 + r * 230}) scale(0.55)`}>
                <AtLaptop f={f} c={['#3A4F8F', '#2B5A6B', '#5A3A6A'][n % 3]} skin={SKINS[n % 5]} glow={P.sky} i={n} />
              </g>
            );
          })}
          {tags.map(([a, y, t, c]) => (
            <STag key={t} x={960} y={y} text={t} size={62} bg={P.ink} color={c} o={pop(f, w(a), 12)} />
          ))}
        </World>
      </Cam>
      <Pop f={f} at={w(1215.35)} x={960} y={130} size={72} until={w(1218.3)}>
        <span style={{background: P.ink, borderRadius: 30, padding: '10px 34px'}}>A two-tier system</span>
      </Pop>
      <Note size={26} style={{position: 'absolute', right: 80, top: 80, opacity: ease(f, w(1219.0), 10)}}>
        illustration · not to scale
      </Note>
    </Bg>
  );
};

/* ================================================================== 1224.5 "billions... trillions... a young graduate in Nairobi who can't sleep" */
const CHART = Array.from({length: 30}, (_, i) => [240 + i * 50, 820 - i * 19 - Math.sin(i * 1.7) * 30 - random(`ch${i}`) * 30] as [number, number]);
export const C4Money: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const chart = ease(f, w(1230.3), 30);
  const n = Math.max(2, Math.round(chart * CHART.length));
  const off = f > w(1236.6);
  return (
    <Bg c={P.night}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.0, 0, 0], [1232.0, 960, 540, 1.0, 0, 0], [1233.7, 3300, 640, 0.9, -6, 0], [1234.7, 3300, 620, 0.9, 0, 0], [1236.4, 3300, 590, 2.5, 0, 0]]}>
        <World w={4400}>
          <rect x={-1000} y={-600} width={3200} height={2200} fill="#3A2A7A" />
          {Array.from({length: 22}, (_, i) => (
            <g key={i} transform={`translate(${160 + random(`cx${i}`) * 1600},${880 + random(`cy${i}`) * 120}) scale(${0.8 + random(`cs${i}`) * 0.6})`} opacity={ease(f, w(1227.92) + i, 8)}>
              <Coin />
            </g>
          ))}
          {chart > 0 && <polyline points={pts(CHART.slice(0, n))} fill="none" stroke={P.green} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />}
          <STag x={620} y={330} text="Billions in investment" size={52} bg={P.yellow} o={pop(f, w(1228.74), 12)} />
          <STag x={1230} y={700} text="Trillions in stock market value" size={52} bg={P.green} color={P.white} o={pop(f, w(1230.3), 12)} />
          {/* Nairobi at night */}
          <rect x={2200} y={-600} width={2600} height={2200} fill="#070B22" />
          {Array.from({length: 50}, (_, i) => (
            <circle key={i} cx={2250 + random(`st${i}`) * 2100} cy={-100 + random(`sv${i}`) * 500} r={2 + random(`sz${i}`) * 2} fill={P.white} opacity={0.4 + 0.3 * Math.sin(f / 10 + i)} />
          ))}
          <circle cx={3900} cy={120} r={60} fill="#E9EEF7" />
          {[[2300, 360, 300], [2650, 260, 260], [3650, 300, 320], [3990, 420, 260]].map(([x, y, bw], i) => (
            <g key={i}>
              <rect x={x} y={y} width={bw} height={1300} fill="#141B3D" />
              {Array.from({length: 18}, (_, j) => (
                <rect key={j} x={x + 30 + (j % 3) * 80} y={y + 40 + Math.floor(j / 3) * 110} width={40} height={50} fill={(i * 7 + j * 3) % 11 === 0 ? '#5A6AB0' : '#1E2650'} />
              ))}
            </g>
          ))}
          <rect x={3050} y={320} width={500} height={1300} fill="#1E2650" />
          <rect x={3150} y={480} width={300} height={220} fill="#2A3570" />
          <rect x={3150} y={630} width={150} height={70} fill="#C9D2E6" />
          <g transform="translate(3240,640) scale(0.55)">
            <Person c={P.teal} skin={SKINS[1]} f={f} />
          </g>
          <g transform="translate(3410,530) scale(0.22)">
            <Face a={(f / 24) * 6 + 1300} />
          </g>
          <rect x={3360} y={600} width={70} height={50} rx={4} fill={P.ink} />
          <rect x={3365} y={605} width={60} height={40} fill={off ? '#0B0F1E' : '#9FD4FF'} />
          <rect x={3150} y={480} width={300} height={220} fill="none" stroke="#3A4468" strokeWidth={10} />
          <line x1={3300} y1={480} x2={3300} y2={700} stroke="#3A4468" strokeWidth={6} />
        </World>
      </Cam>
      <Lab f={f} at={w(1225.72)} title="The cost of AI" sub="the way we usually talk about it" until={w(1232.0)} />
      <Pop f={f} at={w(1227.92)} x={960} y={540} size={110} until={w(1228.7)}>
        Money
      </Pop>
      <Cap f={f} at={w(1232.96)} until={w(1234.0)}>
        We rarely talk about…
      </Cap>
      <Cap f={f} at={w(1234.1)}>A young graduate in Nairobi who can't sleep</Cap>
    </Bg>
  );
};

/* ================================================================== 1237 "only one link in the chain... before there's a chip... a rock in the ground" */
export const C4Chain: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const Y = 520;
  const links: [number, string, string, string][] = [
    [500, 'Rock', '#8A7F76', 'rock'],
    [1150, 'Chip', P.green, 'chip'],
    [1800, 'Data centre', P.sky, 'dc'],
    [2450, 'Chatbot', P.purple, 'chat'],
    [3100, 'Hands', P.pink, 'hand'],
  ];
  const ground = ease(f, w(1245.8), 14);
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 3100, 560, 1.0, -10, 0], [1238.3, 3100, 560, 1.0, 0, 0], [1239.4, 1800, 600, 0.5, 0, 0], [1240.7, 1800, 600, 0.5, 0, 0], [1241.7, 2450, 580, 0.95, -12, 0], [1242.5, 2450, 580, 0.95, 0, 0], [1243.3, 1800, 580, 0.95, -12, 0], [1244.1, 1800, 580, 0.95, 0, 0], [1244.9, 1150, 580, 0.95, -12, 0], [1245.6, 1150, 580, 0.95, 0, 0], [1246.5, 560, 640, 1.05, 0, 4]]}>
        <World w={3600}>
          {ground > 0 && (
            <g opacity={ground}>
              <rect x={-1500} y={560} width={5600} height={1200} fill="#5A3A22" />
              {[640, 760, 900, 1040].map((y, i) => (
                <path key={y} d={`M-1500 ${y} Q1200 ${y + 40} 4100 ${y - 10}`} stroke={['#6E4A2E', '#4A2E1A', '#7A5434', '#3E2614'][i]} strokeWidth={18} fill="none" />
              ))}
              <rect x={-1500} y={548} width={5600} height={24} fill="#3E8E41" />
            </g>
          )}
          {links.slice(0, -1).map(([x], i) => {
            const nx = links[i + 1][0];
            return Array.from({length: 3}, (_, j) => {
              const cx = x + 150 + ((j + 0.5) * (nx - x - 300)) / 3;
              return j % 2 === 0 ? (
                <rect key={`${i}-${j}`} x={cx - 60} y={Y - 30} width={120} height={60} rx={30} fill="none" stroke="#C9D2E6" strokeWidth={16} />
              ) : (
                <rect key={`${i}-${j}`} x={cx - 40} y={Y - 9} width={80} height={18} rx={9} fill="#8F9AB4" />
              );
            });
          })}
          {links.map(([x, name, c, icon], i) => {
            const hot = i === 4 && f < w(1240.8);
            return (
              <g key={name}>
                <circle cx={x} cy={Y} r={150} fill="none" stroke="#DCE3F2" strokeWidth={28} />
                <circle cx={x} cy={Y} r={112} fill={c} stroke={hot ? P.white : 'none'} strokeWidth={12} style={hot ? {filter: `drop-shadow(0 0 30px ${P.pink})`} : undefined} />
                <g transform={`translate(${x},${Y})`}>
                  {icon === 'rock' && (
                    <g transform="scale(0.9)">
                      <Rock c="#5E554E" c2={P.sky} />
                    </g>
                  )}
                  {icon === 'chip' && (
                    <g transform="scale(0.55)">
                      <Chip c="#1D6B3A" f={f} on={1} />
                    </g>
                  )}
                  {icon === 'dc' && (
                    <g transform="scale(0.6)">
                      <DataCentre f={f} />
                    </g>
                  )}
                  {icon === 'chat' && <ChatIcon />}
                  {icon === 'hand' && <HandIcon />}
                </g>
                <text x={x} y={Y + 230} textAnchor="middle" fontFamily={AF.head} fontWeight={800} fontSize={56} fill={P.white}>
                  {name}
                </text>
              </g>
            );
          })}
        </World>
      </Cam>
      <Cap f={f} at={w(1237.24)} until={w(1240.6)}>
        Even the workers are only one link in the chain
      </Cap>
      {[
        [1241.6, 1243.0, 'Before the chatbot…'],
        [1243.0, 1244.6, '…before the data centre…'],
        [1244.7, 1245.8, '…before the chip…'],
      ].map(([a, u, t]) => (
        <Pop key={t as string} f={f} at={w(a as number)} x={960} y={130} size={64} until={w(u as number)}>
          <span style={{background: P.ink, borderRadius: 30, padding: '10px 34px'}}>{t as string}</span>
        </Pop>
      ))}
      <Cap f={f} at={w(1245.92)}>There's a rock in the ground</Cap>
    </Bg>
  );
};

export const SCENES_4: Record<string, React.FC<AnimProps>> = {
  c4fact: C4Fact,
  c4iceberg: C4Iceberg,
  c4early: C4Early,
  c4teach: C4Teach,
  c4sama: C4Sama,
  c4office: C4Office,
  c4quota: C4Quota,
  c4shift: C4Shift,
  c4visions: C4Visions,
  c4pay: C4Pay,
  c4counsel: C4Counsel,
  c4ended: C4Ended,
  c4petition: C4Petition,
  c4court: C4Court,
  c4ghost: C4Ghost,
  c4targets: C4Targets,
  c4rlhf: C4Rlhf,
  c4please: C4Please,
  c4industry: C4Industry,
  c4remotasks: C4Remotasks,
  c4letter: C4Letter,
  c4experts: C4Experts,
  c4twotier: C4TwoTier,
  c4money: C4Money,
  c4chain: C4Chain,
};
