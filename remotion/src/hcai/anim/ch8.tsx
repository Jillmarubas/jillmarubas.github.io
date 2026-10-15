// Chapter 8, "The answer" (30:29–33:44 on the film, 1829–2024 s): the cold open's question answered. The bottle and the
// drops measure different things; one question costs almost nothing; the cost is in billions of them, in places and in
// people; what governments and viewers can do; the chain from the cold open (power → water → metal → hands) returns as
// the full bill; back to The Dalles. The film's own night chat screens (1877.9–1883 and 2009.8–end) are left alone.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';
import {Bg, Bill, Cam, Caption, Chip, Clock, CloudShape, CoolingTower, DataCentre, Doc, Drop, Flow, Gavel, House, IconGrid, Label, NuclearPlant, Person, Pipe, Pop, PowerPlant, Put, Pylon, Rack, World, shade} from './lib';
import {settle} from '../kit';

/* ================================================================== local drawings */
const Q = 'What should I make for dinner?';
const SW = 1240;
const SH = 776;
const c01 = (x: number) => Math.max(0, Math.min(1, x));

/** The MacBook from the cold open (Laptop.tsx), drawn at full size; LaptopAt places and angles it. */
const Mac: React.FC<{children: React.ReactNode; glow?: number}> = ({children, glow = 0.6}) => (
  <div style={{position: 'relative', width: SW + 60, height: SH + 100}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: SW + 60, height: SH + 60, borderRadius: 34, background: '#0C0C0F', boxShadow: `0 0 ${140 * glow}px rgba(120,170,255,${0.45 * glow}), inset 0 0 0 3px #2A2B31`}}>
      <div style={{position: 'absolute', left: 30, top: 30, width: SW, height: SH, borderRadius: 8, overflow: 'hidden'}}>{children}</div>
    </div>
    <div style={{position: 'absolute', left: -90, top: SH + 56, width: SW + 240, height: 34, borderRadius: '4px 4px 26px 26px', background: 'linear-gradient(#DADDE4, #9EA3AF)', boxShadow: '0 20px 40px rgba(0,0,0,0.45)'}} />
  </div>
);
const LaptopAt: React.FC<{x: number; y: number; s: number; rx?: number; ry?: number; o?: number; glow?: number; children: React.ReactNode}> = ({x, y, s, rx = 0, ry = 0, o = 1, glow, children}) =>
  o <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, transform: `translate(-50%,-50%) perspective(2400px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`}}>
      <Mac glow={glow}>{children}</Mac>
    </div>
  );
/** The chat app from the cold open: the dinner question already sent, an answer area, and an optional dark "night" fade. */
const ChatScreen: React.FC<{q?: string; typed?: string; dark?: number; f?: number; children?: React.ReactNode}> = ({q = Q, typed, dark = 0, f = 0, children}) => (
  <div style={{position: 'absolute', inset: 0, background: '#FFFFFF', fontFamily: AF.body, color: '#1F2128', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 46, background: '#F4F4F7', borderBottom: '1px solid #E4E4EA'}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
        <div key={c} style={{position: 'absolute', top: 16, left: 18 + i * 23, width: 14, height: 14, borderRadius: 7, background: c}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 11, textAlign: 'center', fontWeight: 700, fontSize: 19, color: '#4A4D57'}}>Assistant</div>
    </div>
    <div style={{position: 'absolute', left: 0, top: 46, bottom: 0, width: 250, background: '#F7F7FA', borderRight: '1px solid #E8E8EE', padding: '22px 18px', boxSizing: 'border-box'}}>
      <div style={{background: '#FFFFFF', border: '1px solid #E1E1E8', borderRadius: 12, padding: '10px 14px', fontWeight: 700, fontSize: 18}}>+ New chat</div>
      {[150, 120, 170, 96, 140, 110].map((wd, i) => (
        <div key={i} style={{width: wd, height: 11, borderRadius: 6, background: '#E3E3EA', marginTop: i ? 20 : 30}} />
      ))}
    </div>
    <div style={{position: 'absolute', left: 250, top: 46, right: 0, bottom: 0}}>
      {q && <div style={{position: 'absolute', right: 60, top: 60, maxWidth: 600, background: '#EDEDF3', borderRadius: 22, padding: '14px 22px', fontSize: 30}}>{q}</div>}
      <div style={{position: 'absolute', left: 60, top: 170, width: 860}}>{children}</div>
      <div style={{position: 'absolute', left: 70, right: 70, bottom: 46, height: 70, borderRadius: 35, border: '2px solid #DCDCE4', background: '#FFFFFF', display: 'flex', alignItems: 'center', padding: '0 28px', fontSize: 27, color: typed ? '#1F2128' : '#9A9DA8'}}>
        {typed ?? 'Ask anything'}
        {typed !== undefined && Math.floor(f / 12) % 2 === 0 && <span style={{color: P.blue}}>|</span>}
      </div>
    </div>
    {dark > 0 && (
      <div style={{position: 'absolute', inset: 0, background: P.night, opacity: dark}}>
        <div style={{position: 'absolute', left: SW / 2 - 6, top: SH / 2 - 40, width: 12, height: 80, borderRadius: 6, background: P.white, opacity: Math.floor(f / 10) % 2 ? 1 : 0.15}} />
      </div>
    )}
  </div>
);
/** A plastic bottle (about 340 units tall, centred) filled with stacked layers of water, each a share of its height. */
const Bottle: React.FC<{layers: {v: number; c: string}[]}> = ({layers}) => {
  const id = React.useId();
  const body = 'M-24 -150 H24 V-122 C24 -100 62 -96 62 -60 V140 A20 20 0 0 1 42 160 H-42 A20 20 0 0 1 -62 140 V-60 C-62 -96 -24 -100 -24 -122 Z';
  let acc = 0;
  return (
    <g>
      <clipPath id={id}>
        <path d={body} />
      </clipPath>
      <path d={body} fill="rgba(255,255,255,0.18)" />
      <g clipPath={`url(#${id})`}>
        {layers.map((l, i) => {
          const h = 310 * l.v;
          const y = 160 - acc - h;
          acc += h;
          return <rect key={i} x={-70} y={y} width={140} height={h + 1} fill={l.c} />;
        })}
      </g>
      <path d={body} fill="none" stroke="#FFFFFF" strokeWidth={6} />
      <rect x={-30} y={-174} width={60} height={28} rx={6} fill={P.white} />
    </g>
  );
};
/** A label drawn inside a world (moves with the camera): a rounded pill with text. */
const WTag: React.FC<{x: number; y: number; text: string; size?: number; bg?: string; color?: string; o?: number}> = ({x, y, text, size = 44, bg = P.white, color = P.ink, o = 1}) => {
  if (o <= 0) return null;
  const wpx = text.length * size * 0.6 + size * 1.3;
  const h = size * 1.6;
  return (
    <g opacity={Math.min(1, o)} transform={`translate(${x},${y}) scale(${Math.min(1, 0.85 + 0.15 * o)})`}>
      <rect x={-wpx / 2} y={-h / 2} width={wpx} height={h} rx={h / 2} fill={bg} />
      <text y={size * 0.36} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};
/** White icons for chain links and bill rows, drawn in a 160-unit box around 0,0 (the cold open's Chain.tsx set plus more). */
type IconK = 'chat' | 'bolt' | 'drop' | 'rock' | 'hand' | 'building' | 'line' | 'river' | 'mine' | 'person' | 'grid';
const Icon: React.FC<{k: IconK; c?: string}> = ({k, c = P.white}) => {
  if (k === 'chat') return <path d="M-60 -45 H60 A20 20 0 0 1 80 -25 V25 A20 20 0 0 1 60 45 H-10 L-45 75 V45 H-60 A20 20 0 0 1 -80 25 V-25 A20 20 0 0 1 -60 -45 Z" fill={c} />;
  if (k === 'bolt') return <path d="M15 -80 L-50 10 H-5 L-20 80 L50 -15 H5 Z" fill={c} />;
  if (k === 'drop') return <path d="M0 -80 C0 -80 -55 -5 -55 25 A55 55 0 0 0 55 25 C55 -5 0 -80 0 -80 Z" fill={c} />;
  if (k === 'rock') return <path d="M-70 30 L-50 -35 L-5 -60 L50 -40 L75 15 L40 60 L-30 62 Z" fill={c} />;
  if (k === 'hand')
    return (
      <g fill={c}>
        <rect x={-45} y={-10} width={90} height={80} rx={30} />
        {[-38, -14, 10, 34].map((x, i) => (
          <rect key={x} x={x} y={-75 + (i === 0 || i === 3 ? 18 : 0)} width={20} height={80} rx={10} />
        ))}
        <rect x={-85} y={0} width={60} height={22} rx={11} transform="rotate(-35 -55 10)" />
      </g>
    );
  if (k === 'building')
    return (
      <g>
        <rect x={-85} y={-35} width={170} height={85} rx={6} fill={c} />
        {[-60, -20, 20, 60].map((x) => (
          <rect key={x} x={x - 12} y={-55} width={24} height={14} rx={3} fill={c} />
        ))}
        {[-62, -36, -10, 16, 42].map((x) => (
          <rect key={x} x={x} y={-18} width={18} height={56} rx={3} fill="rgba(0,0,0,0.35)" />
        ))}
      </g>
    );
  if (k === 'line' || k === 'grid')
    return (
      <g stroke={c} strokeWidth={9} fill="none" strokeLinecap="round">
        <path d="M-34 80 L-8 -75 L8 -75 L34 80" />
        <path d="M-62 -40 H62 M-46 0 H46" />
        <path d="M-27 55 L22 10 M27 55 L-22 10" />
      </g>
    );
  if (k === 'river')
    return (
      <g stroke={c} strokeWidth={14} fill="none" strokeLinecap="round">
        {[-40, 0, 40].map((y) => (
          <path key={y} d={`M-75 ${y} q19 -22 38 0 t38 0 t38 0 t38 0`} />
        ))}
      </g>
    );
  if (k === 'mine')
    return (
      <g>
        <path d="M-75 70 L-55 10 L-10 -15 L45 0 L75 70 Z" fill={c} />
        <g transform="translate(10,-30) rotate(30)">
          <rect x={-6} y={-60} width={12} height={110} rx={6} fill={c} />
          <path d="M-62 -48 Q0 -88 62 -48 Q0 -66 -62 -48 Z" fill={c} />
        </g>
      </g>
    );
  return (
    <g fill={c}>
      <circle cy={-45} r={30} />
      <rect x={-48} y={-5} width={96} height={85} rx={40} />
    </g>
  );
};
/** "What you can do" step marker, top left. */
const Badge: React.FC<{f: number; at: number; n: number; text: string}> = ({f, at: a, n, text}) => {
  const k = ease(f, a, 10);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 80, top: 70, display: 'flex', alignItems: 'center', gap: 16, opacity: k, transform: `translateX(${(1 - k) * -20}px)`}}>
      <div style={{width: 76, height: 76, borderRadius: 38, background: P.yellow, color: P.ink, fontFamily: AF.head, fontWeight: 800, fontSize: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.25)'}}>{n}</div>
      <Tag bg={P.white} color={P.ink} size={40}>{text}</Tag>
    </div>
  );
};
const Abs: React.FC<{x: number; y: number; o?: number; s?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, o = 1, s = 1, children, style}) =>
  o <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: Math.min(1, o), textAlign: 'center', ...style}}>{children}</div>
  );
const Big: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 80, color = P.white}) => (
  <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: size, color, lineHeight: 1.05, whiteSpace: 'nowrap', textShadow: '0 8px 30px rgba(0,0,0,0.3)'}}>{children}</div>
);

/* ================================================================== 1829.0 "So, let's go back to the question… A bottle of water per conversation, or a few drops per question?" */
export const C8Split: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const push = ease(f, 0, w(1831.7));
  const out = ease(f, w(1831.75), 16);
  const L = ease(f, w(1831.9), 14);
  const R = ease(f, w(1834.15), 14);
  const lvl = ease(f, w(1832.2), 22);
  const look = (lerp(0, 7, L) - 14 * R) * (1 - ease(f, w(1836.4), 24));
  const neq = pop(f, w(1837.55), 12);
  return (
    <Bg c={P.navy}>
      {L > 0 && (
        <AbsoluteFill style={{transform: `perspective(2400px) rotateY(${look}deg)`}}>
          {/* left: the bottle */}
          <div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080, background: `linear-gradient(160deg, ${P.blue}, #173A9E)`, opacity: L, transform: `translateX(${(1 - L) * -240}px)`}}>
            <Abs x={480} y={150}>
              <Tag bg={P.white} color={P.ink} size={52}>A bottle of water</Tag>
              <Note style={{marginTop: 14}} size={30}>per conversation</Note>
            </Abs>
            <svg width={960} height={1080} style={{position: 'absolute', inset: 0}}>
              <g transform="translate(480,520) scale(1.15)">
                <Bottle layers={[{v: 0.92 * lvl, c: '#7FD3FF'}]} />
              </g>
            </svg>
            <Abs x={480} y={770} o={ease(f, w(1832.8), 10)}>
              <Big size={84}>~500 ml</Big>
              <Note style={{marginTop: 10}} size={26}>UC Riverside estimate, 2023</Note>
            </Abs>
          </div>
          {/* right: the drops */}
          <div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 1080, background: `linear-gradient(160deg, ${P.teal}, #00606F)`, opacity: R, transform: `translateX(${(1 - R) * 240}px)`}}>
            <Abs x={480} y={150}>
              <Tag bg={P.white} color={P.ink} size={52}>A few drops</Tag>
              <Note style={{marginTop: 14}} size={30}>per question</Note>
            </Abs>
            <svg width={960} height={1080} style={{position: 'absolute', inset: 0}}>
              {/* a teaspoon */}
              <rect x={560} y={596} width={260} height={22} rx={11} fill="#D7DCE6" transform="rotate(-8 560 606)" />
              <ellipse cx={480} cy={610} rx={110} ry={38} fill="#D7DCE6" />
              <ellipse cx={480} cy={604} rx={92} ry={26} fill="#AEB8CC" />
              {Array.from({length: 5}, (_, i) => {
                const land = w(1834.55) + i * 5;
                const k = c01((f - land + 10) / 10);
                if (k <= 0) return null;
                const x = 480 + (i - 2) * 30;
                return k < 1 ? (
                  <g key={i} transform={`translate(${x},${lerp(300, 590, k * k)}) scale(0.3)`}>
                    <Drop c="#7FD3FF" />
                  </g>
                ) : (
                  <circle key={i} cx={x} cy={602} r={12} fill="#7FD3FF" />
                );
              })}
            </svg>
            <Abs x={480} y={770} o={ease(f, w(1835.0), 10)}>
              <Big size={76}>0.26 ml ≈ 5 drops</Big>
              <Note style={{marginTop: 10}} size={26}>Google, Aug 2025 · one text prompt</Note>
            </Abs>
          </div>
          {/* not the same ruler */}
          {neq > 0 && (
            <Abs x={960} y={500} s={neq}>
              <div style={{width: 170, height: 170, borderRadius: 85, background: P.yellow, color: P.ink, fontFamily: AF.head, fontWeight: 800, fontSize: 130, lineHeight: '170px', boxShadow: '0 20px 50px rgba(0,0,0,0.35)'}}>≠</div>
            </Abs>
          )}
        </AbsoluteFill>
      )}
      {/* the laptop from the cold open, the question on its screen */}
      <LaptopAt x={960} y={lerp(590, 500, out)} s={lerp(lerp(0.6, 0.68, push), 0.12, out)} rx={lerp(12, 4, push)} ry={lerp(-18, -5, push)} o={1 - out}>
        <ChatScreen f={f}>
          <div style={{display: 'flex', gap: 10, marginTop: 10}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: '#9A9DA8', opacity: 0.4 + 0.6 * ((Math.floor(f / 6) + i) % 3 === 0 ? 1 : 0)}} />
            ))}
          </div>
        </ChatScreen>
      </LaptopAt>
      <Abs x={960} y={120} o={pop(f, w(1830.1), 12) * (1 - out)} s={Math.min(1.05, pop(f, w(1830.1), 12))}>
        <Tag bg={P.white} color={P.ink} size={58}>
          What does <span style={{color: P.red}}>one</span> question cost?
        </Tag>
      </Abs>
      <Caption f={f} at={w(1836.4)}>They're measuring different things</Caption>
    </Bg>
  );
};

/* ================================================================== 1839.0 the 2023 university estimate: older model, a whole conversation, the hidden power-plant water */
export const C8Older: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const onsite = 0.42 * ease(f, w(1843.8), 36);
  const hidden = 0.48 * ease(f, w(1847.8), 40);
  const plant = ease(f, w(1846.1), 12);
  return (
    <Bg c="#0E6C80" c2="#0A3E5E" angle={170}>
      <Cam f={f} t0={t0} keys={[[t0, 820, 540, 1.2, 10, 0], [1842.8, 820, 540, 1.1, 6, 0], [1844.0, 700, 560, 0.92, 0, 0], [1846.0, 720, 560, 0.92, 0, 0], [1847.4, 1270, 560, 0.66, -8, 3], [1850.9, 1290, 560, 0.64, -10, 3]]}>
        <World w={2700}>
          <rect x={-800} y={900} width={4400} height={600} fill="#08364A" />
          {/* one whole conversation: 10–50 questions */}
          {Array.from({length: 20}, (_, i) => {
            const k = pop(f, w(1843.0) + i * 1.3, 8);
            if (k <= 0) return null;
            const x = 170 + (i % 4) * 112, y = 340 + Math.floor(i / 4) * 82;
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${k})`}>
                <rect x={-46} y={-26} width={92} height={52} rx={18} fill={i % 2 ? P.white : '#DDF2FF'} />
                <path d={i % 2 ? 'M28 22 L42 38 L14 24 Z' : 'M-28 22 L-42 38 L-14 24 Z'} fill={i % 2 ? P.white : '#DDF2FF'} />
                <rect x={-30} y={-8} width={60} height={7} rx={3.5} fill="#AEB8CC" />
                <rect x={-30} y={5} width={38} height={7} rx={3.5} fill="#AEB8CC" />
              </g>
            );
          })}
          <WTag x={338} y={790} text="One whole conversation" size={46} o={ease(f, w(1843.4), 10)} />
          <WTag x={338} y={870} text="10–50 questions" size={42} bg={P.yellow} o={ease(f, w(1844.35), 10)} />
          <Flow pts={[[580, 540], [740, 540]]} f={f} c={P.white} n={3} r={9} speed={5} o={ease(f, w(1843.6), 10)} />
          {/* the older model */}
          <Put x={830} y={540} s={1.7}>
            <Rack f={f} busy={f > w(1843.6) ? 1 : 0} />
          </Put>
          <WTag x={830} y={790} text="Older model" size={46} bg={P.orange} color={P.white} o={ease(f, w(1842.0), 10)} />
          {/* cooling water on site → bottle */}
          <Pipe pts={[[910, 650], [1180, 650]]} f={f} flow={ease(f, w(1843.8), 10)} />
          <g transform="translate(1270,520) scale(1.2)">
            <Bottle layers={[{v: onsite, c: '#7FD3FF'}, {v: hidden, c: P.blue}]} />
          </g>
          <WTag x={1045} y={590} text="Cooling" size={34} bg="#7FD3FF" o={ease(f, w(1844.2), 10)} />
          <WTag x={1270} y={262} text="≈ 500 ml" size={50} o={ease(f, w(1849.3), 10)} />
          {/* the hidden water: at the power plant that makes the electricity */}
          <Put x={1990} y={600} s={1.6} f={f} at={w(1846.1)}>
            <PowerPlant f={f} />
          </Put>
          <Put x={2330} y={560} s={1.5} f={f} at={w(1846.4)}>
            <CoolingTower f={f} />
          </Put>
          <Flow pts={[[1990, 400], [1990, 170], [890, 170], [890, 360]]} f={f} c={P.yellow} n={9} r={11} speed={9} o={ease(f, w(1848.6), 12) * plant} />
          <WTag x={1450} y={110} text="Electricity" size={44} bg={P.yellow} o={ease(f, w(1849.9), 10)} />
          <Flow pts={[[2330, 700], [2330, 880], [1320, 880], [1320, 712]]} f={f} c="#4F8DFF" n={9} r={12} speed={8} o={ease(f, w(1847.7), 12)} />
          <WTag x={2160} y={980} text="Water used at the power plant" size={48} bg={P.blue} color={P.white} o={ease(f, w(1847.65), 10)} />
        </World>
      </Cam>
      <Label f={f} at={w(1839.07)} title="2023 · a university estimate" sub="UC Riverside · Making AI Less “Thirsty”" bg={P.ink} color={P.white} />
      <Caption f={f} at={w(1843.0)} until={w(1845.8)}>It counted a whole conversation, not one question</Caption>
      <Caption f={f} at={w(1846.2)} source="Li, Yang, Islam & Ren, UC Riverside, 2023">…and the hidden water at the power plants</Caption>
    </Bg>
  );
};

/* ================================================================== 1851.0 the newer company numbers: efficient models, one typical text question */
export const C8Newer: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const shrink = ease(f, w(1853.65), 22);
  const turn = lerp(9, -7, ease(f, w(1854.9), 30));
  return (
    <Bg c={P.plum}>
      <AbsoluteFill style={{transform: `perspective(2400px) rotateY(${turn}deg)`}}>
        {/* left: a newer chip, and how far the energy per prompt fell */}
        <svg width={960} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
          <g transform={`translate(480,420) scale(${1.5 * Math.min(1, pop(f, w(1852.8), 14))})`}>
            <Chip c="#1D6B3A" f={f} on={ease(f, w(1853.1), 10)} />
          </g>
        </svg>
        <Abs x={480} y={240} o={ease(f, w(1852.83), 10)}>
          <Tag bg={P.green} color={P.white} size={40}>Newer, more efficient models</Tag>
        </Abs>
        <div style={{position: 'absolute', left: 130, top: 640, width: 720, opacity: ease(f, w(1853.5), 10)}}>
          <Note size={26}>energy per text prompt (Google)</Note>
          {[
            ['a year earlier', 1, P.orange],
            ['2025', lerp(1, 1 / 33, shrink), P.grass],
          ].map(([t, v, c], i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 18}}>
              <div style={{width: 190, fontFamily: AF.head, fontWeight: 700, fontSize: 30, color: P.white, textAlign: 'right'}}>{t as string}</div>
              <div style={{width: 500 * (v as number), height: 40, borderRadius: 12, background: c as string}} />
            </div>
          ))}
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 60, color: P.grass, marginTop: 18, opacity: shrink}}>33× less in one year</div>
        </div>
        {/* right: one typical text question */}
        <Abs x={1440} y={250} o={pop(f, w(1855.5), 12)} s={Math.min(1, pop(f, w(1855.5), 12))}>
          <div style={{background: P.white, color: P.ink, fontFamily: AF.body, fontWeight: 600, fontSize: 36, borderRadius: 28, padding: '20px 34px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'}}>{Q}</div>
          <Note style={{marginTop: 14}} size={28}>1 typical text question</Note>
        </Abs>
        {[
          ['Google', '0.24 Wh · 0.26 ml of water', 1855.85, P.yellow],
          ['OpenAI', '0.34 Wh · ~1/15 teaspoon', 1856.25, P.sky],
        ].map(([n, v, a, c], i) => {
          const k = pop(f, w(a as number), 12);
          return k > 0 ? (
            <div key={i} style={{position: 'absolute', left: 1050, top: 450 + i * 150, display: 'flex', alignItems: 'center', gap: 20, opacity: Math.min(1, k), transform: `translateX(${(1 - Math.min(1, k)) * 40}px)`}}>
              <Tag bg={c as string} color={P.ink} size={38}>{n as string}</Tag>
              <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 42, color: P.white, whiteSpace: 'nowrap'}}>{v as string}</div>
            </div>
          ) : null;
        })}
        <Note style={{position: 'absolute', left: 1052, top: 760, opacity: ease(f, w(1856.6), 10)}} size={24}>
          Google, Aug 2025 · Sam Altman, OpenAI CEO, Jun 2025
        </Note>
      </AbsoluteFill>
      <Label f={f} at={w(1851.29)} title="The newer company numbers" bg={P.white} />
    </Bg>
  );
};

/* ================================================================== 1857.6 what they mostly don't include: images, videos, "reasoning" models */
const CardIcon: React.FC<{k: number; f: number}> = ({k, f}) => {
  if (k === 0)
    return (
      <g>
        <rect x={-90} y={-65} width={180} height={130} rx={12} fill="#DDF2FF" />
        <path d="M-80 55 L-25 -10 L15 30 L40 5 L80 55 Z" fill={P.green} />
        <circle cx={45} cy={-30} r={18} fill={P.yellow} />
      </g>
    );
  if (k === 1)
    return (
      <g>
        <rect x={-95} y={-65} width={190} height={130} rx={12} fill={P.ink} />
        {[-80, -45, -10, 25, 60].map((x) => (
          <g key={x}>
            <rect x={x} y={-58} width={18} height={12} rx={2} fill="#5B6B8C" />
            <rect x={x} y={46} width={18} height={12} rx={2} fill="#5B6B8C" />
          </g>
        ))}
        <path d="M-20 -28 L32 0 L-20 28 Z" fill={P.white} />
      </g>
    );
  // reasoning: a thought bubble whose dots keep cycling, and a timer ring that keeps going
  const sp = (f * 9) % 360;
  return (
    <g>
      <circle r={78} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={14} />
      <circle r={78} fill="none" stroke={P.pink} strokeWidth={14} strokeLinecap="round" strokeDasharray="160 400" transform={`rotate(${sp})`} />
      {[-28, 0, 28].map((x, i) => (
        <circle key={x} cx={x} cy={0} r={11} fill={P.white} opacity={(Math.floor(f / 5) % 3) === i ? 1 : 0.35} />
      ))}
    </g>
  );
};
export const C8NotCounted: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const tilt = lerp(18, 6, ease(f, 0, w(1863.0)));
  const long = ease(f, w(1863.3), 20);
  const cards: [string, number, string][] = [['Images', 1859.79, P.sky], ['Videos', 1860.75, P.orange], ['“Reasoning” models', 1861.95, P.pink]];
  return (
    <Bg c="#1E1650">
      <AbsoluteFill style={{transform: `perspective(2000px) rotateX(${tilt}deg) rotateY(${lerp(-6, 4, ease(f, 0, w(1865.0)))}deg)`, transformOrigin: '50% 70%'}}>
        {/* what the numbers measure */}
        <div style={{position: 'absolute', left: 130, top: 330, width: 500, height: 420, borderRadius: 30, border: `5px dashed ${P.grass}`, boxSizing: 'border-box', textAlign: 'center'}}>
          <Note style={{marginTop: 30}} size={26} color={P.grass}>what the numbers measure</Note>
          <div style={{margin: '70px auto 0', display: 'inline-block', background: P.white, color: P.ink, fontFamily: AF.head, fontWeight: 700, fontSize: 38, borderRadius: 26, padding: '18px 30px'}}>1 text question</div>
          <svg width={300} height={80} style={{display: 'block', margin: '30px auto 0'}}>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${50 + i * 50},40) scale(0.28)`}>
                <Drop c="#7FD3FF" />
              </g>
            ))}
          </svg>
        </div>
        <div style={{position: 'absolute', left: 740, top: 190, opacity: ease(f, w(1858.0), 10)}}>
          <Tag bg={P.red} color={P.white} size={44}>Mostly not included</Tag>
        </div>
        {cards.map(([name, a, c], i) => {
          const k = pop(f, w(a), 12);
          if (k <= 0) return null;
          const grow = i === 2 ? 1 + 0.12 * long : 1;
          return (
            <div key={name} style={{position: 'absolute', left: 740 + i * 360, top: 310, width: 330, height: 440, borderRadius: 30, background: shade(c, 0.55), boxShadow: `0 0 0 5px ${c}, 0 30px 60px rgba(0,0,0,0.4)`, opacity: Math.min(1, k), transform: `scale(${k * grow})`, transformOrigin: '50% 100%', textAlign: 'center'}}>
              <svg width={330} height={260} viewBox="-165 -130 330 260" style={{marginTop: 20}}>
                <CardIcon k={i} f={f} />
              </svg>
              <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: i === 2 ? 34 : 44, color: P.white, marginTop: 6, whiteSpace: 'nowrap'}}>{name}</div>
              {i === 2 && <Note style={{marginTop: 8, opacity: long}} size={24}>think longer first</Note>}
              <div style={{position: 'absolute', left: 40, top: 40, transform: `rotate(-12deg) scale(${pop(f, w(a) + 8, 10)})`, border: `5px solid ${P.white}`, borderRadius: 12, padding: '4px 14px', fontFamily: AF.head, fontWeight: 800, fontSize: 28, color: P.white, background: P.red}}>not counted</div>
            </div>
          );
        })}
      </AbsoluteFill>
      <Caption f={f} at={w(1863.3)}>“Reasoning” models think for much longer before answering</Caption>
    </Bg>
  );
};

/* ================================================================== 1866.0 "So both numbers are real. And both are incomplete." Two pieces of a much bigger puzzle. */
export const C8Both: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const X0 = 270, Y0 = 255, CW = 230, CH = 190;
  const miss: Record<string, string> = {'0,0': 'Images', '5,0': 'Video', '0,2': 'Reasoning', '5,2': 'Training', '1,1': 'Chips', '4,1': 'New grid'};
  const out = ease(f, w(1868.5), 22);
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.9], [1868.4, 960, 540, 1.9], [1869.4, 960, 570, 0.92]]}>
        <World>
          {Array.from({length: 18}, (_, i) => {
            const col = i % 6, row = Math.floor(i / 6);
            const x = X0 + col * CW, y = Y0 + row * CH;
            const filled = row === 1 && (col === 2 || col === 3);
            const lbl = miss[`${col},${row}`];
            return (
              <g key={i}>
                {filled ? (
                  <g>
                    <rect x={x + 6} y={y + 6} width={CW - 12} height={CH - 12} rx={18} fill={col === 2 ? P.blue : P.teal} />
                    <circle cx={x + CW - 6} cy={y + CH / 2} r={22} fill={col === 2 ? P.blue : P.teal} />
                    {col === 2 ? (
                      <g transform={`translate(${x + CW / 2},${y + CH / 2 - 8}) scale(0.38)`}>
                        <Bottle layers={[{v: 0.9, c: '#7FD3FF'}]} />
                      </g>
                    ) : (
                      [0, 1, 2, 3, 4].map((d) => (
                        <g key={d} transform={`translate(${x + 55 + d * 30},${y + CH / 2 - 10}) scale(0.2)`}>
                          <Drop c="#BFF5EE" />
                        </g>
                      ))
                    )}
                    <text x={x + CW / 2} y={y + CH - 22} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={22} fill={P.white}>
                      {col === 2 ? '~500 ml' : '0.26 ml'}
                    </text>
                    {/* real ✓ */}
                    <g transform={`translate(${x + CW / 2},${y + 34}) scale(${pop(f, w(1867.4) + (col - 2) * 4, 10)})`}>
                      <rect x={-56} y={-20} width={112} height={40} rx={20} fill={P.grass} />
                      <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={26} fill={P.ink}>
                        REAL ✓
                      </text>
                    </g>
                  </g>
                ) : (
                  <g opacity={out}>
                    <rect x={x + 8} y={y + 8} width={CW - 16} height={CH - 16} rx={18} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.45)" strokeWidth={4} strokeDasharray="14 10" />
                    {lbl && (
                      <text x={x + CW / 2} y={y + CH / 2 + 12} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill="rgba(255,255,255,0.75)">
                        {lbl}
                      </text>
                    )}
                    {!lbl && (
                      <text x={x + CW / 2} y={y + CH / 2 + 20} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={60} fill="rgba(255,255,255,0.3)">
                        ?
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </World>
      </Cam>
      <Pop f={f} at={w(1866.25)} x={960} y={130} size={76} until={w(1868.35)}>
        Both numbers are real
      </Pop>
      <Pop f={f} at={w(1868.5)} x={960} y={130} size={76} color={P.yellow}>
        Both are incomplete
      </Pop>
      <Note style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', opacity: out}} size={26}>
        illustration · the missing pieces are costs neither number counts
      </Note>
    </Bg>
  );
};

/* ================================================================== 1870.5 "Here's the answer… One question to AI costs almost nothing." The receipt for one question. */
export const C8Answer: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const print = ease(f, w(1874.35), w(1876.0) - w(1874.35));
  const stamp = pop(f, w(1876.3), 12);
  const dive = ease(f, w(1877.15), 16);
  const dark = ease(f, w(1877.25), 8);
  const rows: [string, string, number][] = [
    ['Energy', '0.24–0.34 Wh', 1874.85],
    ['Water', '0.26 ml ≈ 5 drops', 1875.35],
    ['Like streaming video for', '≈ 10–15 seconds', 1875.85],
  ];
  return (
    <Bg c={P.navy}>
      <AbsoluteFill style={{transform: `scale(${lerp(1, 3.2, dive)})`, transformOrigin: '700px 545px'}}>
        <LaptopAt x={700} y={570} s={0.58} rx={6} ry={lerp(14, 6, ease(f, 0, w(1877.0)))}>
          <ChatScreen f={f} dark={dark}>
            <div style={{fontSize: 30, lineHeight: 1.45, opacity: ease(f, w(1871.0), 12)}}>Here are three easy ideas: a quick vegetable stir-fry, a one-pan lemon chicken, or pasta with garlic and spinach.</div>
          </ChatScreen>
        </LaptopAt>
        {/* the receipt prints out beside it */}
        <div style={{position: 'absolute', left: 1190, top: 210, width: 620, overflow: 'hidden', height: 70 + 560 * print, opacity: (print > 0 ? 1 : 0) * (1 - dive)}}>
          <div style={{background: '#FFFDF6', borderRadius: 18, padding: '26px 34px', boxSizing: 'border-box', width: 620, boxShadow: '0 30px 60px rgba(0,0,0,0.35)', fontFamily: AF.mono, color: P.ink}}>
            <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 40, textAlign: 'center'}}>RECEIPT · 1 QUESTION</div>
            <div style={{borderTop: '3px dashed #C5CCD8', margin: '18px 0'}} />
            {rows.map(([k, v, a]) => (
              <div key={k} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 28, margin: '16px 0', opacity: ease(f, w(a), 8)}}>
                <span>{k}</span>
                <span style={{fontWeight: 700}}>{v}</span>
              </div>
            ))}
            <div style={{borderTop: '3px dashed #C5CCD8', margin: '18px 0'}} />
            <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: AF.head, fontWeight: 800, fontSize: 36}}>
              <span>TOTAL</span>
              <span style={{color: P.green, transform: `scale(${Math.max(0.001, stamp)})`, display: 'inline-block'}}>almost nothing</span>
            </div>
            <div style={{fontSize: 20, color: '#5B6B8C', marginTop: 20, lineHeight: 1.4}}>Google, Aug 2025 · Sam Altman, Jun 2025 · streaming: IEA, ~80 Wh per hour</div>
          </div>
        </div>
      </AbsoluteFill>
      <Pop f={f} at={w(1870.95)} x={960} y={110} size={80} until={w(1874.1)}>
        Here's the answer
      </Pop>
    </Bg>
  );
};

/* ================================================================== 1883.0 "The cost was never in one question. It's in billions of questions, every single day." */
export const C8Billions: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const lit = ease(f, w(1885.9), 30);
  const id = React.useId();
  return (
    <Bg c={P.night} pattern="none">
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 5.0], [1885.8, 960, 540, 4.0], [1887.7, 960, 540, 0.42], [1888.6, 960, 540, 0.38]]}>
        <World>
          <defs>
            <pattern id={id} width={36} height={36} patternUnits="userSpaceOnUse" patternTransform={`translate(${f * 0.8},0)`}>
              <circle cx={18} cy={18} r={7} fill={P.sky} />
            </pattern>
          </defs>
          <rect x={-5000} y={-4000} width={12000} height={9000} fill={`url(#${id})`} opacity={0.12 + 0.75 * lit} />
          <circle cx={960} cy={540} r={9} fill={P.yellow} style={{filter: `drop-shadow(0 0 6px ${P.yellow})`}} />
        </World>
      </Cam>
      <Pop f={f} at={w(1884.55)} x={960} y={720} size={56} until={w(1885.8)}>
        <span style={{background: P.yellow, color: P.ink, borderRadius: 24, padding: '8px 28px'}}>1 question</span>
      </Pop>
      <Pop f={f} at={w(1885.95)} x={960} y={500} size={96}>
        <span style={{background: P.ink, borderRadius: 30, padding: '12px 40px'}}>Billions of questions</span>
      </Pop>
      <div style={{position: 'absolute', right: 110, top: 90, textAlign: 'center', opacity: ease(f, w(1887.35), 8)}}>
        <svg width={200} height={200} viewBox="-100 -100 200 200">
          <Clock f={f * 14} />
        </svg>
        <div style={{marginTop: 12}}>
          <Tag bg={P.white} color={P.ink} size={36}>every single day</Tag>
        </div>
      </div>
      <Caption f={f} at={w(1883.4)} until={w(1885.8)}>The cost was never in one question</Caption>
      <Caption f={f} at={w(1886.6)} source="OpenAI, October 2025">800 million people use ChatGPT every week</Caption>
    </Bg>
  );
};

/* ================================================================== 1888.4 new power plants for tomorrow's questions; Memphis, The Dalles, Pennsylvania */
const Turbine: React.FC<{f: number; i: number}> = ({f, i}) => (
  <g>
    {Array.from({length: 3}, (_, j) => {
      const k = (f / 36 + j / 3 + i * 0.21) % 1;
      return <circle key={j} cx={46 + k * 30} cy={-120 - k * 90} r={12 + k * 26} fill="#C9CED8" opacity={(1 - k) * 0.8} />;
    })}
    <rect x={34} y={-120} width={24} height={80} fill="#8E9AB3" />
    <rect x={-70} y={-50} width={140} height={60} rx={28} fill="#B8C3D9" />
    <rect x={-70} y={-24} width={140} height={8} fill="#8E9AB3" />
    <rect x={-60} y={10} width={120} height={20} fill="#7C8AA8" />
  </g>
);
export const C8Places: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const X = [700, 2100, 3500, 4900];
  const rise = ease(f, w(1888.75), w(1890.2) - w(1888.75));
  const head = (x: number, a: number, t: string, s: string, c: string) => (
    <g>
      <WTag x={x} y={150} text={t} size={54} o={ease(f, w(a), 10)} />
      <WTag x={x} y={250} text={s} size={34} bg={c} color={P.white} o={ease(f, w(a) + 6, 10)} />
    </g>
  );
  return (
    <Bg c={P.sky} c2="#BDE6FF" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, X[0], 560, 0.92, 0, 0], [1891.0, X[0], 560, 1.0, 0, 0], [1891.85, X[1], 560, 0.95, -6, 0], [1893.2, X[1], 560, 0.97, -6, 0], [1893.85, X[2], 560, 0.95, 6, 0], [1894.55, X[2], 560, 0.97, 6, 0], [1895.2, X[3], 560, 0.95, 0, 0], [1896.4, X[3], 560, 1.04, 0, 0]]}>
        <World w={5600}>
          <rect x={-1200} y={780} width={8000} height={900} fill={P.grass} />
          {/* 0 · power plants being built for tomorrow */}
          <clipPath id="c8rise">
            <rect x={X[0] - 700} y={780 - 520 * rise} width={900} height={520 * rise + 2} />
          </clipPath>
          <g clipPath="url(#c8rise)">
            <Put x={X[0] - 380} y={700} s={2.0}>
              <PowerPlant f={f} smoke={rise} />
            </Put>
            <Put x={X[0] - 20} y={640} s={1.6}>
              <CoolingTower f={f} steam={rise} />
            </Put>
          </g>
          <g stroke={P.orange} strokeWidth={10} fill="none" opacity={1 - rise * 0.6}>
            <path d={`M${X[0] + 170} 780 V250 H${X[0] - 260} M${X[0] + 170} 310 L${X[0] + 110} 250`} />
            <line x1={X[0] - 200} y1={250} x2={X[0] - 200} y2={420 + Math.sin(f / 10) * 20} />
          </g>
          {[['2024', 415, '415 TWh'], ['2030', 945, '~945 TWh']].map(([y, v, t], i) => {
            const k = ease(f, w(1889.5) + i * 8, 18);
            const h = (v as number) * 0.4 * k;
            const x = X[0] + 300 + i * 170;
            return (
              <g key={i} opacity={ease(f, w(1889.5) + i * 8, 6)}>
                <rect x={x} y={780 - h} width={120} height={h} rx={8} fill={i ? P.red : P.orange} />
                <text x={x + 60} y={760 - h} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={36} fill={P.ink}>{t as string}</text>
                <text x={x + 60} y={830} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={P.ink}>{y as string}</text>
              </g>
            );
          })}
          {head(X[0], 1888.7, 'New power plants for tomorrow', 'data centres worldwide, electricity a year (IEA)', P.orange)}
          {/* 1 · Memphis: gas turbines next to homes */}
          {Array.from({length: 5}, (_, i) => (
            <Put key={i} x={X[1] - 560 + i * 150} y={830} s={0.9}>
              <House c={[P.red, P.teal, P.purple, P.orange][i % 4]} />
            </Put>
          ))}
          <rect x={X[1] - 30} y={700} width={8} height={90} fill="#5B6B8C" />
          {Array.from({length: 6}, (_, i) => (
            <Put key={i} x={X[1] + 90 + (i % 3) * 190} y={i < 3 ? 690 : 790} s={1.0} f={f} at={w(1891.8) + i * 2}>
              <Turbine f={f} i={i} />
            </Put>
          ))}
          {head(X[1], 1891.8, 'Memphis, Tennessee', '~35 gas turbines counted at an AI data centre (SELC)', P.red)}
          {/* 2 · The Dalles: the river and the water */}
          <rect x={X[2] - 700} y={860} width={1400} height={90} fill={P.water} />
          {Array.from({length: 6}, (_, i) => (
            <rect key={i} x={X[2] - 700 + ((i * 260 + f * 5) % 1400)} y={890} width={90} height={8} rx={4} fill="#BFE8FF" />
          ))}
          <Pipe pts={[[X[2] - 300, 880], [X[2] - 300, 760], [X[2] + 40, 760]]} f={f} />
          <Put x={X[2] + 260} y={700} s={1.9}>
            <DataCentre f={f} />
          </Put>
          <g>
            {[-30, 30].map((dx) => (
              <line key={dx} x1={X[2] - 480 + dx} y1={780} x2={X[2] - 480 + dx * 0.5} y2={600} stroke="#7C8AA8" strokeWidth={10} />
            ))}
            <rect x={X[2] - 545} y={480} width={130} height={110} rx={12} fill="#DDE6F5" />
            <rect x={X[2] - 545} y={520} width={130} height={30} fill={P.water} />
          </g>
          {head(X[2], 1893.45, 'The Dalles, Oregon', "Google used 29% of the city's water (2021)", P.blue)}
          {/* 3 · Pennsylvania: the reactor */}
          <Put x={X[3]} y={690} s={2.4}>
            <NuclearPlant f={f} />
          </Put>
          {head(X[3], 1894.7, 'Three Mile Island, Pennsylvania', 'a reactor restarting for Microsoft · 20-year deal, 2024', P.purple)}
        </World>
      </Cam>
    </Bg>
  );
};

/* ================================================================== 1896.3 "some costs never fit into a watt-hour": Nairobi, Ohio, The Dalles */
export const C8WattHour: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const camX = 1920 * (ease(f, w(1900.0), 14) + ease(f, w(1902.75), 14) + ease(f, w(1905.45), 14));
  const swing = [1900.0, 1902.75, 1905.45].reduce((s, a) => s + Math.sin(Math.PI * ease(f, w(a), 14)), 0);
  const reading = 3410 + Math.floor(f * 1.7);
  // three costs fly at the meter and bounce off its window
  const toks: [IconK | 'moon' | 'bill' | 'gavel', number, number, string][] = [['moon', -300, 300, P.purple], ['bill', 2200, 300, P.orange], ['gavel', 960, 1300, P.blue]];
  const hitK = (i: number) => ease(f, w(1897.5) + i * 5, 14) - 0.55 * ease(f, w(1898.15) + i * 5, 16);
  const shake = Math.sin(f * 2.2) * 8 * (ease(f, w(1898.1), 3) - ease(f, w(1899.0), 6));
  const tide = ease(f, w(1907.7), 40);
  const hit = c01(Math.sin(Math.PI * c01((f - w(1906.75)) / 8)));
  const billK = ease(f, w(1903.9), 20);
  return (
    <Bg c={P.night} pattern="none">
      <AbsoluteFill style={{transform: `perspective(2200px) rotateY(${-5 * swing}deg) translateX(${-camX}px)`, transformOrigin: '50% 50%'}}>
        {/* 0 · the meter */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: `radial-gradient(ellipse at 50% 45%, ${P.navy}, ${P.night})`}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <g transform={`translate(${960 + shake},560)`}>
              <rect x={-230} y={-280} width={460} height={600} rx={40} fill="#3A4F8F" />
              <circle cy={-60} r={190} fill="#DDE6F5" />
              <circle cy={-60} r={190} fill="none" stroke="#9FB0D3" strokeWidth={14} />
              <rect x={-150} y={-170} width={300} height={70} rx={10} fill={P.ink} />
              <text x={0} y={-120} textAnchor="middle" fontFamily='"IBM Plex Mono", monospace' fontWeight={600} fontSize={50} fill={P.grass}>
                {String(reading).padStart(6, '0')}
              </text>
              <ellipse cy={30} rx={140} ry={22} fill="#7C8AA8" />
              <rect x={-12 + ((f * 9) % 260) - 130} y={22} width={24} height={16} rx={4} fill={P.red} />
              <text y={130} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={64} fill={P.white}>
                Wh
              </text>
              <rect x={-120} y={200} width={240} height={60} rx={10} fill="#2A3B7A" />
            </g>
            {toks.map(([k, sx, sy, c], i) => {
              const a = hitK(i);
              if (f < w(1897.4) + i * 5) return null;
              const x = lerp(sx, 960, a * 0.62), y = lerp(sy, 500, a * 0.62);
              return (
                <g key={i} transform={`translate(${x},${y})`}>
                  <circle r={84} fill={c} />
                  <g transform="scale(0.55)">
                    {k === 'moon' ? (
                      <path d="M20 -80 A80 80 0 1 0 80 30 A60 60 0 1 1 20 -80 Z" fill={P.white} />
                    ) : k === 'bill' ? (
                      <Bill total="$$$" hot={1} />
                    ) : (
                      <Gavel />
                    )}
                  </g>
                </g>
              );
            })}
            {f > w(1898.1) && f < w(1899.6) && (
              <g transform="translate(960,500)" stroke={P.red} strokeWidth={26} strokeLinecap="round" opacity={0.9}>
                <line x1={-70} y1={-70} x2={70} y2={70} />
                <line x1={70} y1={-70} x2={-70} y2={70} />
              </g>
            )}
          </svg>
          <Abs x={960} y={120} o={pop(f, w(1896.75), 12)}>
            <Tag bg={P.white} color={P.ink} size={52}>
              Some costs never fit into a <span style={{color: P.red}}>watt-hour</span>
            </Tag>
          </Abs>
        </div>
        {/* 1 · Nairobi */}
        <div style={{position: 'absolute', left: 1920, top: 0, width: 1920, height: 1080, background: 'linear-gradient(160deg, #2A1B5E, #120A2E)'}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect x={1000} y={200} width={640} height={440} rx={16} fill="#0B1638" stroke="#5B4A9A" strokeWidth={16} />
            <circle cx={1480} cy={300} r={50} fill="#FFF3C4" />
            <circle cx={1500} cy={285} r={44} fill="#0B1638" />
            {Array.from({length: 22}, (_, i) => (
              <rect key={i} x={1030 + random(`nx${i}`) * 560} y={500 + random(`ny${i}`) * 110} width={10} height={14} fill={P.yellow} opacity={0.4 + 0.6 * ((Math.floor(f / 9) + i) % 4 ? 1 : 0.2)} />
            ))}
            <line x1={1320} y1={200} x2={1320} y2={640} stroke="#5B4A9A" strokeWidth={10} />
            <rect x={300} y={720} width={620} height={110} rx={20} fill="#3A2A7A" />
            <rect x={300} y={690} width={180} height={60} rx={20} fill="#5B4A9A" />
            <Put x={720} y={620} s={1.8}>
              <Person c={P.pink} skin="#6B4128" />
            </Put>
            <g transform="translate(1320,820)">
              <circle r={70} fill={P.white} />
              <g transform="scale(0.8)">
                <Clock f={180 + f * 0.02} spin={1} />
              </g>
            </g>
          </svg>
          <div style={{position: 'absolute', left: 80, top: 70}}>
            <Tag bg={P.white} color={P.ink} size={44}>Nairobi, Kenya</Tag>
            <Note style={{marginTop: 12, marginLeft: 8}} size={26}>the people who label AI's worst content</Note>
          </div>
          <Abs x={960} y={930}>
            <Tag bg={P.pink} color={P.white} size={46}>Still can't sleep</Tag>
            <Note style={{marginTop: 12}} size={24}>140+ Kenyan content moderators diagnosed with PTSD · The Guardian, Dec 2024</Note>
          </Abs>
        </div>
        {/* 2 · Ohio */}
        <div style={{position: 'absolute', left: 3840, top: 0, width: 1920, height: 1080, background: `linear-gradient(160deg, #FFB86B, #F08A3C)`}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect x={150} y={700} width={900} height={40} rx={10} fill="#8B5A2B" />
            <rect x={200} y={740} width={30} height={220} fill="#6B4120" />
            <rect x={970} y={740} width={30} height={220} fill="#6B4120" />
            {[[300, P.blue, '#C98E64'], [500, P.teal, '#8D5A3B'], [900, P.purple, '#E9B48A']].map(([x, c, sk], i) => (
              <Put key={i} x={x as number} y={i === 1 ? 640 : 610} s={i === 1 ? 1.1 : 1.5}>
                <Person c={c as string} skin={sk as string} />
              </Put>
            ))}
            <g transform={`translate(700,560) scale(${lerp(1.3, 1.9, billK)}) rotate(-6)`}>
              <Bill total={billK > 0.5 ? '$$$' : '$'} hot={billK > 0.5 ? 1 : 0} />
            </g>
            {[['2024/25', 28.92, '$28.92'], ['2025/26', 269.92, '$269.92']].map(([y, v, t], i) => {
              const k = ease(f, w(1903.9) + i * 8, 18);
              const h = (v as number) * 1.45 * k;
              const x = 1280 + i * 230;
              return (
                <g key={i}>
                  <rect x={x} y={820 - h} width={150} height={Math.max(3, h)} rx={10} fill={i ? P.red : P.white} />
                  <text x={x + 75} y={800 - h} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={38} fill={P.ink}>{t as string}</text>
                  <text x={x + 75} y={870} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill={P.ink}>{y as string}</text>
                </g>
              );
            })}
          </svg>
          <div style={{position: 'absolute', left: 80, top: 70}}>
            <Tag bg={P.ink} color={P.white} size={44}>Ohio</Tag>
            <Note style={{marginTop: 12, marginLeft: 8}} size={26} color={P.ink}>a family staring at a bigger bill</Note>
          </div>
          <Note style={{position: 'absolute', left: 1180, top: 920, width: 640, whiteSpace: 'normal', lineHeight: 1.4}} size={24} color={P.ink}>
            Grid capacity price, $ per MW-day, in PJM, the grid Ohio is on · PJM auctions
          </Note>
        </div>
        {/* 3 · The Dalles: a town in court */}
        <div style={{position: 'absolute', left: 5760, top: 0, width: 1920, height: 1080, background: `linear-gradient(180deg, ${P.sky}, #9BD9FF)`}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect x={0} y={820} width={1920} height={260} fill={P.grass} />
            {[-60, 60].map((dx) => (
              <line key={dx} x1={420 + dx} y1={820} x2={420 + dx * 0.5} y2={520} stroke="#7C8AA8" strokeWidth={14} />
            ))}
            <rect x={300} y={300} width={240} height={230} rx={20} fill="#DDE6F5" />
            <clipPath id="c8tank">
              <rect x={300} y={300} width={240} height={230} rx={20} />
            </clipPath>
            <rect x={300} y={lerp(330, 470, tide)} width={240} height={230} fill={P.water} clipPath="url(#c8tank)" />
            <text x={420} y={290} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={34} fill={P.ink}>town water</text>
            <g transform="translate(1000,560)">
              <rect x={-200} y={-250} width={400} height={500} rx={10} fill={P.white} transform="rotate(-4)" />
              <g transform="rotate(-4)">
                <text y={-185} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={40} fill={P.ink}>NEWS</text>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <rect key={i} x={-160} y={-140 + i * 50} width={i % 3 === 2 ? 200 : 320} height={18} rx={9} fill="#D5DBE8" />
                ))}
              </g>
            </g>
            <g transform="translate(1520,640) scale(2.2)">
              <Gavel hit={hit} />
            </g>
          </svg>
          <div style={{position: 'absolute', left: 80, top: 70}}>
            <Tag bg={P.ink} color={P.white} size={44}>The Dalles, Oregon</Tag>
            <Note style={{marginTop: 12, marginLeft: 8}} size={26} color={P.ink}>a town that had to go to court to find out</Note>
          </div>
          <Abs x={960} y={950} o={ease(f, w(1908.3), 10)}>
            <Tag bg={P.blue} color={P.white} size={46}>Google: 29% of the city's water (2021)</Tag>
            <Note style={{marginTop: 12}} size={24} color={P.ink}>The Oregonian sued in 2021 · the city settled in Dec 2022</Note>
          </Abs>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};

/* ================================================================== 1910.5 "I'm not telling you to stop using AI. I use it. This channel is about it." */
export const C8NotStop: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const sign = pop(f, w(1912.15), 12);
  const strike = ease(f, w(1912.55), 10);
  const req = 'Help me check the numbers in this report';
  const n = Math.floor(c01((f - w(1913.7)) / (w(1915.4) - w(1913.7))) * req.length);
  return (
    <Bg c={P.teal} c2="#006E8A" angle={160}>
      <Cam f={f} t0={t0} keys={[[t0, 900, 560, 1.12, 8, 0], [1913.4, 900, 560, 1.0, 4, 0], [1916.6, 1040, 540, 0.95, -6, 0]]}>
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <g transform={`translate(470,520) scale(${sign}) rotate(${-8 * strike})`}>
            <rect x={-10} y={140} width={20} height={300} fill="#9AA6BD" />
            <path d="M-70 -170 L70 -170 L170 -70 L170 70 L70 170 L-70 170 L-170 70 L-170 -70 Z" fill={P.red} stroke={P.white} strokeWidth={12} />
            <text y={34} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={96} fill={P.white}>
              STOP
            </text>
            <line x1={-210} y1={210} x2={-210 + 420 * strike} y2={210 - 420 * strike} stroke={P.ink} strokeWidth={30} strokeLinecap="round" />
          </g>
        </svg>
        <LaptopAt x={1320} y={560} s={0.56} ry={-10} rx={4}>
          <ChatScreen q={n > 0 ? '' : Q} typed={req.slice(0, n)} f={f}>
            {n === 0 && <div style={{fontSize: 30, lineHeight: 1.45}}>Here are three easy ideas: a quick vegetable stir-fry, a one-pan lemon chicken…</div>}
          </ChatScreen>
        </LaptopAt>
      </Cam>
      <Pop f={f} at={w(1911.5)} x={960} y={120} size={70}>
        <span style={{background: P.ink, borderRadius: 30, padding: '10px 34px'}}>Not “stop using AI”</span>
      </Pop>
      <Caption f={f} at={w(1913.7)}>I use it. This channel is about it.</Caption>
    </Bg>
  );
};

/* ================================================================== 1916.6 "one of the most powerful tools humans have ever built… problems we can't solve alone" */
const ToolIcon: React.FC<{i: number; f: number}> = ({i, f}) => {
  if (i === 0)
    return (
      <g>
        <path d={`M0 -90 C30 -40 70 -10 50 40 C40 75 -40 75 -50 40 C-62 0 -20 -30 0 -90 Z`} fill={P.orange} transform={`scale(1,${1 + 0.05 * Math.sin(f / 3)})`} />
        <path d="M0 -20 C15 5 30 20 20 45 C10 60 -10 60 -20 45 C-28 25 -10 10 0 -20 Z" fill={P.yellow} />
        <rect x={-60} y={60} width={120} height={16} rx={8} fill="#8B5A2B" />
      </g>
    );
  if (i === 1)
    return (
      <g transform={`rotate(${f * 3})`}>
        <circle r={80} fill="none" stroke="#C9A86A" strokeWidth={16} />
        {[0, 45, 90, 135].map((a) => (
          <rect key={a} x={-80} y={-5} width={160} height={10} fill="#C9A86A" transform={`rotate(${a})`} />
        ))}
        <circle r={16} fill="#8B5A2B" />
      </g>
    );
  if (i === 2)
    return (
      <g transform="scale(0.85)">
        <Doc title="PRINT" />
      </g>
    );
  if (i === 3)
    return (
      <g>
        <circle cy={-20} r={62} fill={P.yellow} style={{filter: `drop-shadow(0 0 ${12 + 6 * Math.sin(f / 4)}px ${P.yellow})`}} />
        <rect x={-28} y={40} width={56} height={40} rx={8} fill="#9AA6BD" />
      </g>
    );
  if (i === 4)
    return (
      <g>
        <rect x={-90} y={-70} width={180} height={115} rx={8} fill="#0C0C0F" />
        <rect x={-80} y={-60} width={160} height={95} rx={3} fill={P.blue} />
        <path d="M-110 48 H110 L100 62 H-100 Z" fill="#C9CDD6" />
      </g>
    );
  return (
    <g>
      <circle r={95} fill={P.purple} style={{filter: `drop-shadow(0 0 20px ${P.purple})`}} />
      <g transform="scale(0.7)">
        <Icon k="chat" />
      </g>
    </g>
  );
};
export const C8Tools: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const tools: [string, number][] = [['Fire', 1916.95], ['The wheel', 1917.4], ['Printing', 1917.85], ['Electricity', 1918.3], ['Computers', 1918.8], ['AI', 1919.25]];
  const fly = ease(f, w(1920.4), 22);
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 700, 600, 0.85, 14, 6], [1919.5, 3150, 600, 0.85, -8, 6], [1920.3, 3500, 560, 0.9, -12, 4], [1922.8, 3560, 560, 0.95, -14, 4]]}>
        <World w={4400}>
          <line x1={0} y1={700} x2={3700} y2={700} stroke="rgba(255,255,255,0.35)" strokeWidth={10} />
          {tools.map(([t, a], i) => {
            const k = pop(f, w(a), 12);
            const x = 400 + i * 560;
            return k > 0 ? (
              <g key={t}>
                <circle cx={x} cy={700} r={18} fill={P.yellow} />
                <g transform={`translate(${x},520) scale(${k * (i === 5 ? 1.2 : 1)})`}>
                  <ToolIcon i={i} f={f} />
                </g>
                <text x={x} y={790} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={52} fill={P.white} opacity={Math.min(1, k)}>
                  {t}
                </text>
              </g>
            ) : null;
          })}
          {/* a problem too big to solve alone: a puzzle with one piece missing, which AI helps fill */}
          <g opacity={ease(f, w(1919.9), 10)}>
            {[0, 1, 2, 3].map((i) => {
              const x = 3880 + (i % 2) * 150, y = 380 + Math.floor(i / 2) * 150;
              if (i === 3) {
                const px = lerp(3360, x, fly), py = lerp(520, y, fly);
                return <rect key={i} x={px} y={py} width={140} height={140} rx={16} fill={P.yellow} opacity={fly > 0 ? 1 : 0} />;
              }
              return <rect key={i} x={x} y={y} width={140} height={140} rx={16} fill={P.sky} />;
            })}
            <rect x={4030} y={530} width={140} height={140} rx={16} fill="none" stroke={P.white} strokeWidth={5} strokeDasharray="14 10" opacity={1 - fly} />
          </g>
        </World>
      </Cam>
      <Pop f={f} at={w(1917.2)} x={960} y={130} size={60} until={w(1919.8)}>
        <span style={{background: P.ink, borderRadius: 30, padding: '10px 34px'}}>One of the most powerful tools ever built</span>
      </Pop>
      <Caption f={f} at={w(1920.0)}>It may help solve problems we can't solve alone</Caption>
    </Bg>
  );
};

/* ================================================================== 1922.8 "we can't make good decisions about something we can't see… a lot of it is still hidden" */
export const C8Hidden: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const rows: [string, string][] = [
    ['One question', '≈ 5 drops'],
    ['Electricity, per data centre', '?'],
    ['Water, per town', '?'],
    ['New power lines', '?'],
    ['Who pays for the grid', '?'],
    ['Metals and mines', '?'],
  ];
  const slash = ease(f, w(1925.4), 10);
  return (
    <Bg c="#1E1650">
      <div style={{position: 'absolute', left: 560, top: 150, width: 820, transform: `perspective(2000px) rotateX(${lerp(16, 8, ease(f, 0, w(1930.0)))}deg) rotateY(${lerp(-12, -4, ease(f, 0, w(1930.0)))}deg)`, transformOrigin: '50% 0'}}>
        <div style={{background: '#FFFDF6', borderRadius: 18, padding: '28px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.45)', fontFamily: AF.mono, color: P.ink}}>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 44, textAlign: 'center'}}>THE BILL FOR AI</div>
          <div style={{borderTop: '3px dashed #C5CCD8', margin: '16px 0'}} />
          {rows.map(([k, v], i) => {
            const hide = i === 0 ? 0 : ease(f, w(1928.75) + (i - 1) * 2, 8);
            return (
              <div key={k} style={{position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: 32, padding: '14px 0', opacity: ease(f, i * 3, 8)}}>
                <span>{k}</span>
                <span style={{fontWeight: 700, color: i ? '#9AA6BD' : P.green}}>{v}</span>
                {hide > 0 && (
                  <div style={{position: 'absolute', left: 0, top: 10, bottom: 10, width: `${100 * hide}%`, background: P.ink, borderRadius: 6, color: P.white, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.2em'}}>
                    {hide > 0.9 ? 'HIDDEN' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* an eye that can't see */}
      <svg width={360} height={260} viewBox="-180 -130 360 260" style={{position: 'absolute', left: 110, top: 380, opacity: ease(f, w(1924.8), 10)}}>
        <path d="M-150 0 Q0 -120 150 0 Q0 120 -150 0 Z" fill={P.white} />
        <circle r={52} fill={P.blue} />
        <circle r={24} fill={P.ink} />
        <line x1={-140 * slash} y1={-100 * slash} x2={140 * slash} y2={100 * slash} stroke={P.red} strokeWidth={22} strokeLinecap="round" />
      </svg>
      <Caption f={f} at={w(1923.1)} until={w(1926.5)}>We can't make good decisions about what we can't see</Caption>
      <Caption f={f} at={w(1926.8)} source="Washington Post and local investigations, 2024–25: code names and NDAs on data-centre deals">Right now, a lot of it is still hidden</Caption>
    </Bg>
  );
};

/* ================================================================== 1930.6 Europe: large data centres must report their energy and water */
const Stars: React.FC<{r: number; f: number}> = ({r, f}) => (
  <g>
    <circle r={r + 60} fill="#1F3FB0" />
    {Array.from({length: 12}, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <path key={i} d="M0 -18 L5 -6 L18 -6 L8 2 L12 15 L0 7 L-12 15 L-8 2 L-18 -6 L-5 -6 Z" fill={P.yellow} transform={`translate(${Math.cos(a) * r},${Math.sin(a) * r}) scale(${1 + 0.08 * Math.sin(f / 6 + i)})`} />;
    })}
  </g>
);
export const C8EURules: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const fly = c01((f - w(1935.85)) / 14);
  const rows: [string, number][] = [['Energy used', 1936.55], ['Water used', 1937.2]];
  return (
    <Bg c={P.blue} c2="#173A9E" angle={160}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 1.08, -8, 2], [1934.0, 900, 560, 1.0, -4, 2], [1938.9, 1000, 560, 0.96, 6, 2]]}>
        <World>
          <Put x={1630} y={230} s={0.9} f={f} at={w(1932.85)}>
            <Stars r={92} f={f} />
          </Put>
          <Put x={520} y={650} s={2.3} f={f} at={w(1934.4)}>
            <DataCentre f={f} />
          </Put>
          {fly > 0 && fly < 1 && (
            <g transform={`translate(${lerp(640, 1180, fly)},${lerp(480, 470, fly) - Math.sin(Math.PI * fly) * 160}) rotate(${fly * 360})`}>
              <rect x={-30} y={-40} width={60} height={80} rx={6} fill={P.white} />
            </g>
          )}
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 1080, top: 380, width: 640, opacity: ease(f, w(1935.85), 10), background: P.white, borderRadius: 24, padding: '30px 40px', boxSizing: 'border-box', boxShadow: '0 30px 60px rgba(0,0,0,0.35)'}}>
        <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 40, color: P.ink}}>Data-centre report</div>
        <Note size={24} color="#5B6B8C" style={{marginTop: 6}}>sent to the EU</Note>
        {rows.map(([t, a]) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 26, fontFamily: AF.head, fontWeight: 700, fontSize: 38, color: P.ink}}>
            <div style={{width: 54, height: 54, borderRadius: 12, border: `5px solid ${P.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: P.green}}>
              <span style={{transform: `scale(${pop(f, w(a), 10)})`}}>✓</span>
            </div>
            {t}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 230, top: 250, opacity: ease(f, w(1934.0), 10)}}>
        <Tag bg={P.yellow} color={P.ink} size={42}>Large data centres must report</Tag>
      </div>
      <Label f={f} at={w(1932.85)} title="Europe" sub="new EU rules, made in Brussels" />
      <Caption f={f} at={w(1931.0)} until={w(1933.9)}>Some governments are starting to change that</Caption>
      <Note style={{position: 'absolute', left: 1080, top: 760, opacity: ease(f, w(1937.6), 10)}} size={24}>
        EU Energy Efficiency Directive · Delegated Reg. (EU) 2024/1364
      </Note>
    </Bg>
  );
};

/* ================================================================== 1939.0 the EU AI Act: makers of the biggest models must document their energy use */
export const C8AIAct: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const fill = ease(f, w(1945.3), w(1946.0) - w(1945.3));
  const rows: [string, number][] = [['How the model was built', 1944.5], ['What it was trained on', 1944.75], ['Energy it consumed', 1945.0]];
  return (
    <Bg c={P.plum}>
      <Cam f={f} t0={t0} keys={[[t0, 700, 540, 1.15, 10, 0], [1941.3, 700, 540, 1.1, 8, 0], [1942.7, 1000, 540, 1.0, 0, 0], [1944.2, 1240, 540, 1.04, -8, 0], [1947.5, 1290, 540, 1.08, -10, 0]]}>
        <World w={2000}>
          <Put x={380} y={560} s={2.3} f={f} at={w(1939.2)}>
            <Doc title="EU AI ACT" stamp="EU LAW" />
          </Put>
          {Array.from({length: 10}, (_, i) => (
            <Put key={i} x={720 + (i % 5) * 92} y={i < 5 ? 470 : 690} s={0.95} f={f} at={w(1942.6) + i * 1.5}>
              <Rack f={f + i * 5} busy={1} />
            </Put>
          ))}
          <WTag x={904} y={250} text="The biggest AI models" size={44} bg={P.yellow} o={ease(f, w(1942.85), 10)} />
        </World>
        <div style={{position: 'absolute', left: 1340, top: 300, width: 620, background: P.white, borderRadius: 24, padding: '30px 40px', boxSizing: 'border-box', boxShadow: '0 30px 60px rgba(0,0,0,0.35)', opacity: ease(f, w(1944.3), 10)}}>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 40, color: P.ink}}>Technical documentation</div>
          {rows.map(([t, a], i) => (
            <div key={t} style={{marginTop: 24, opacity: ease(f, w(a), 8)}}>
              <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 32, color: i === 2 ? P.red : P.ink}}>{t}</div>
              <div style={{height: 26, borderRadius: 13, background: '#E3E6EE', marginTop: 8, overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${100 * (i === 2 ? fill : 1)}%`, background: i === 2 ? P.red : '#9AA6BD'}} />
              </div>
            </div>
          ))}
          <Note size={24} color="#5B6B8C" style={{marginTop: 18}}>known or estimated</Note>
        </div>
      </Cam>
      <Label f={f} at={w(1939.25)} title="The EU's AI law" sub="the AI Act, Annex XI · general-purpose AI models" bg={P.white} />
      <Caption f={f} at={w(1941.5)}>Companies building the biggest models must document their energy use</Caption>
    </Bg>
  );
};

/* ================================================================== 1954.7 "…the cost of the grid they depend on. So what can you actually do?" */
export const C8Grid: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const q = ease(f, w(1956.55), 12);
  const wire = (a: [number, number], b: [number, number]) => `M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + 60} ${b[0]} ${b[1]}`;
  const tops: [number, number][] = [[260, 500], [700, 470], [1140, 470], [1580, 500]];
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 900, 600, 1.0, -10, 8], [1958.6, 1020, 580, 1.08, 6, 4]]}>
        <World>
          <rect x={-400} y={830} width={2800} height={500} fill="#1B1446" />
          {tops.map(([x], i) => (
            <Put key={i} x={x} y={720} s={1.8}>
              <Pylon c="#9FB0D3" />
            </Put>
          ))}
          {tops.slice(1).map((b, i) => (
            <path key={i} d={wire(tops[i], b)} stroke="#9FB0D3" strokeWidth={4} fill="none" />
          ))}
          <Flow pts={[[260, 520], [700, 490], [1140, 490], [1580, 520]]} f={f} c={P.yellow} n={10} r={10} speed={9} line={false} />
          <Put x={1780} y={790} s={1.6}>
            <DataCentre f={f} busy={1} />
          </Put>
          {[0, 1, 2].map((i) => (
            <Put key={i} x={60 + i * 150} y={820} s={0.9}>
              <House c={[P.red, P.teal, P.orange][i]} on={1} />
            </Put>
          ))}
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 80, top: 70, opacity: ease(f, 0, 10) * (1 - q)}}>
        <Tag bg={P.yellow} color={P.ink} size={44}>Ohio: a special electricity tariff for data centres</Tag>
        <Note style={{marginTop: 12, marginLeft: 8}} size={26}>approved by the state regulator (PUCO), July 2025</Note>
      </div>
      {q > 0 && (
        <AbsoluteFill style={{background: `rgba(11,22,56,${0.75 * q})`}}>
          <Pop f={f} at={w(1956.6)} x={960} y={540} size={100} color={P.white}>
            So what can <span style={{color: P.yellow}}>you</span> actually do?
          </Pop>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ================================================================== 1958.6 1 · ask your local officials one simple question */
export const C8Ask: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const up = ease(f, w(1959.3), 10);
  return (
    <Bg c="#F6B26B" c2="#F7D9A6" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 600, 0.95, 6, 4], [1963.5, 960, 600, 1.0, 0, 4], [1969.1, 980, 620, 1.04, -6, 4]]}>
        <World>
          <rect x={-400} y={860} width={2800} height={500} fill="#C9895A" />
          {/* citizen at the podium */}
          <Put x={300} y={700} s={1.5}>
            <Person c={P.blue} skin="#8D5A3B" up={up} />
          </Put>
          <path d="M210 760 H390 L370 900 H230 Z" fill="#8B5A2B" />
          {/* the proposal on an easel */}
          <g opacity={ease(f, w(1962.7), 10)}>
            <line x1={640} y1={900} x2={700} y2={600} stroke="#8B5A2B" strokeWidth={12} />
            <line x1={940} y1={900} x2={880} y2={600} stroke="#8B5A2B" strokeWidth={12} />
            <rect x={590} y={520} width={400} height={250} rx={10} fill={P.white} />
            <text x={790} y={570} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={32} fill={P.red}>PROPOSED</text>
            <g transform="translate(790,680) scale(0.95)">
              <DataCentre f={f} />
            </g>
          </g>
          {/* local officials */}
          {[1230, 1450, 1670].map((x, i) => (
            <Put key={x} x={x} y={640} s={1.2}>
              <Person c={[P.purple, P.teal, P.red][i]} skin={['#E9B48A', '#6B4128', '#C98E64'][i]} />
            </Put>
          ))}
          <rect x={1080} y={690} width={740} height={190} rx={10} fill="#7A4E2D" />
        </World>
        <div style={{position: 'absolute', left: 1450, top: 780, transform: 'translate(-50%,-50%)', opacity: ease(f, w(1959.65), 10)}}>
          <Tag bg={P.white} color={P.ink} size={36}>Local officials</Tag>
        </div>
      </Cam>
      {/* the question, built word by word */}
      <div style={{position: 'absolute', left: 260, top: 180, width: 1400, background: P.white, borderRadius: 36, padding: '30px 44px', boxSizing: 'border-box', boxShadow: '0 24px 50px rgba(0,0,0,0.25)', opacity: ease(f, w(1960.3), 10), fontFamily: AF.head, fontWeight: 800, color: P.ink}}>
        <Note color="#5B6B8C" size={26}>one simple question, when a data centre is proposed near you</Note>
        <div style={{fontSize: 52, marginTop: 14, lineHeight: 1.2}}>
          <span style={{opacity: ease(f, w(1964.1), 8)}}>How much </span>
          <span style={{color: P.blue, opacity: ease(f, w(1964.6), 8)}}>water </span>
          <span style={{opacity: ease(f, w(1964.95), 8)}}>and </span>
          <span style={{color: P.orange, opacity: ease(f, w(1965.25), 8)}}>power </span>
          <span style={{opacity: ease(f, w(1965.6), 8)}}>will it use?</span>
        </div>
        <div style={{fontSize: 52, marginTop: 6, lineHeight: 1.2, opacity: ease(f, w(1967.4), 8)}}>
          And <span style={{color: P.red}}>who pays</span> for the new grid?
        </div>
        <svg width={40} height={40} style={{position: 'absolute', left: 60, bottom: -34}}>
          <path d="M0 0 H40 L6 40 Z" fill={P.white} />
        </svg>
      </div>
      <Badge f={f} at={w(1958.7)} n={1} text="Ask your local officials" />
    </Bg>
  );
};

/* ================================================================== 1969.1 2 · support journalists, like that newspaper in Oregon */
export const C8Press: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const hit = c01(Math.sin(Math.PI * c01((f - w(1972.95)) / 8)));
  const num = pop(f, w(1973.5), 14);
  return (
    <Bg c={P.sky} c2="#9BD9FF" angle={180}>
      <div style={{position: 'absolute', left: 300, top: 230, width: 980, height: 640, background: '#FFFDF6', borderRadius: 14, boxShadow: '0 30px 70px rgba(0,0,0,0.3)', transform: `perspective(2000px) rotateX(${lerp(14, 4, ease(f, 0, w(1974.4)))}deg) rotate(-3deg) scale(${lerp(0.94, 1.02, ease(f, 0, w(1974.4)))})`, padding: '30px 46px', boxSizing: 'border-box', fontFamily: AF.head, color: P.ink}}>
        <div style={{textAlign: 'center', fontWeight: 800, fontSize: 60, letterSpacing: '0.02em', borderBottom: `5px solid ${P.ink}`, paddingBottom: 10, opacity: ease(f, w(1971.1), 10)}}>The Oregonian</div>
        {num > 0 ? (
          <div style={{marginTop: 40, transform: `scale(${num})`, transformOrigin: '0 50%'}}>
            <div style={{fontWeight: 800, fontSize: 92, color: P.blue, lineHeight: 1}}>355 million gallons</div>
            <div style={{fontWeight: 700, fontSize: 40, marginTop: 14}}>Google's water use in The Dalles, 2021</div>
          </div>
        ) : (
          <div style={{marginTop: 50}}>
            {[0, 1].map((i) => (
              <div key={i} style={{height: 44, width: i ? 520 : 820, background: '#C5CCD8', borderRadius: 10, marginTop: 20}} />
            ))}
          </div>
        )}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{height: 16, width: [860, 780, 820, 600][i], background: '#E3E6EE', borderRadius: 8, marginTop: i ? 18 : 46}} />
        ))}
      </div>
      <svg width={600} height={600} viewBox="-150 -150 300 300" style={{position: 'absolute', left: 1240, top: 400}}>
        <g transform="scale(1.4)">
          <Gavel hit={hit} />
        </g>
      </svg>
      <Abs x={1530} y={330} o={ease(f, w(1972.7), 8)}>
        <Tag bg={P.ink} color={P.white} size={40}>They went to court</Tag>
      </Abs>
      <Badge f={f} at={w(1969.3)} n={2} text="Support journalists" />
      <Caption f={f} at={w(1971.2)} source="The Oregonian/OregonLive, Dec 2022">The newspaper sued in 2021; the city settled in 2022</Caption>
    </Bg>
  );
};

/* ================================================================== 1974.5 3 · use AI with your eyes open. Not with guilt. With awareness. */
export const C8Eyes: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const open = ease(f, w(1976.2), 12);
  const lid = 60 * open + 4;
  const guilt = ease(f, w(1977.7), 10);
  const strike = ease(f, w(1978.3), 8);
  const aware = pop(f, w(1978.9), 12);
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 600, 1.05, 0, 8], [1980.3, 960, 560, 0.97, 0, 2]]}>
        <LaptopAt x={960} y={640} s={0.56} rx={6}>
          <ChatScreen f={f}>
            <div style={{fontSize: 30, lineHeight: 1.45}}>Here are three easy ideas: a quick vegetable stir-fry, a one-pan lemon chicken, or pasta with garlic and spinach.</div>
            <div style={{display: 'inline-block', marginTop: 26, background: '#EAF7EE', border: `3px solid ${P.green}`, borderRadius: 16, padding: '10px 20px', fontSize: 28, fontWeight: 700, color: '#146B38', opacity: ease(f, w(1976.6), 10)}}>
              this answer: ≈ 0.3 Wh · ≈ 5 drops of water
            </div>
          </ChatScreen>
        </LaptopAt>
      </Cam>
      {/* an eye opening */}
      <svg width={340} height={200} viewBox="-170 -100 340 200" style={{position: 'absolute', left: 790, top: 70, opacity: ease(f, w(1975.9), 8)}}>
        <clipPath id="c8eye">
          <path d={`M-150 0 Q0 ${-2 * lid} 150 0 Q0 ${2 * lid} -150 0 Z`} />
        </clipPath>
        <path d={`M-150 0 Q0 ${-2 * lid} 150 0 Q0 ${2 * lid} -150 0 Z`} fill={P.white} />
        <g clipPath="url(#c8eye)">
          <circle r={50} fill={P.teal} />
          <circle r={22} fill={P.ink} />
        </g>
        <path d={`M-150 0 Q0 ${-2 * lid} 150 0`} fill="none" stroke={P.yellow} strokeWidth={8} />
      </svg>
      <Abs x={250} y={560} o={guilt}>
        <div style={{position: 'relative'}}>
          <Tag bg="#5B6B8C" color={P.white} size={50}>Guilt</Tag>
          <div style={{position: 'absolute', left: -10, top: '50%', height: 10, width: `${110 * strike}%`, background: P.red, borderRadius: 5, transform: 'rotate(-8deg)'}} />
        </div>
      </Abs>
      <Abs x={1670} y={560} o={aware} s={Math.max(0.001, aware)}>
        <Tag bg={P.yellow} color={P.ink} size={56}>Awareness</Tag>
      </Abs>
      <Badge f={f} at={w(1974.7)} n={3} text="Use AI with your eyes open" />
    </Bg>
  );
};

/* ================================================================== 1980.4 "The cloud was never a cloud. It's a building. A power line. A river. A mine. A person." The cold open's chain returns. */
const LINKS: {x: number; c: string; k: IconK; name: string; word?: number}[] = [
  {x: 500, c: P.purple, k: 'chat', name: 'Your question'},
  {x: 1100, c: P.sky, k: 'building', name: 'A building', word: 1982.45},
  {x: 1700, c: P.orange, k: 'line', name: 'A power line', word: 1983.3},
  {x: 2300, c: P.water, k: 'river', name: 'A river', word: 1984.45},
  {x: 2900, c: '#B4683A', k: 'mine', name: 'A mine', word: 1985.45},
  {x: 3500, c: P.pink, k: 'person', name: 'A person', word: 1986.5},
];
const CKEYS: [number, number, number, number, number][] = [
  [1980.3, 2000, 0.36, 0, 0],
  [1981.3, 2000, 0.36, 0, 0],
  [1982.3, 1100, 0.86, -22, 4],
  [1983.15, 1700, 0.86, -22, 4],
  [1984.3, 2300, 0.86, -22, 4],
  [1985.3, 2900, 0.86, -22, 4],
  [1986.35, 3500, 0.86, -22, 4],
  [1987.7, 3400, 0.8, -8, 2],
];
const chainCam = (t: number) => {
  let i = 0;
  while (i < CKEYS.length - 2 && t >= CKEYS[i + 1][0]) i++;
  const a = CKEYS[i];
  const b = CKEYS[i + 1];
  const k = settle(c01((t - a[0]) / (b[0] - a[0])));
  return {cx: lerp(a[1], b[1], k), s: lerp(a[2], b[2], k), ry: lerp(a[3], b[3], k), rx: lerp(a[4], b[4], k)};
};
export const C8Chain: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const t = t0 + f / 24;
  const {cx, s, ry, rx} = chainCam(t);
  const gone = ease(f, w(1981.1), 12);
  const reveal = ease(f, w(1981.0), 14);
  const Y = 540;
  return (
    <Bg c={P.plum}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1, opacity: reveal, transformOrigin: '0 0', transform: `translate(960px,540px) perspective(2200px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s}) translate(${-cx}px,${-Y}px)`}}>
        <svg width={4000} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {LINKS.slice(0, -1).map((l, i) => {
            const gap = LINKS[i + 1].x - l.x - 300;
            const n = Math.max(1, Math.round(gap / 120));
            return Array.from({length: n}, (_, j) => {
              const x = l.x + 150 + (j + 0.5) * (gap / n) - 70;
              return j % 2 === 0 ? (
                <rect key={`${i}-${j}`} x={x} y={Y - 34} width={140} height={68} rx={34} fill="none" stroke="#C9D2E6" strokeWidth={18} />
              ) : (
                <rect key={`${i}-${j}`} x={x + 30} y={Y - 10} width={80} height={20} rx={10} fill="#8F9AB4" />
              );
            });
          })}
          {LINKS.map((l, i) => {
            const o = l.word ? pop(f, w(l.word), 12) : 1;
            const hot = Math.abs(cx - l.x) < 120 && s > 0.6;
            return (
              <g key={i} transform={`translate(${l.x},${Y})`}>
                <circle r={160} fill="none" stroke="#DCE3F2" strokeWidth={30} />
                <circle r={160} fill="none" stroke="#8F9AB4" strokeWidth={6} />
                {o > 0 && (
                  <g transform={`scale(${o})`}>
                    <circle r={118} fill={l.c} stroke={hot ? P.white : 'none'} strokeWidth={10} />
                    <g transform="scale(0.85)">
                      <Icon k={l.k} />
                    </g>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        {LINKS.map((l, i) => {
          const o = l.word ? c01(pop(f, w(l.word) + 3, 10)) : 1;
          return (
            <div key={i} style={{position: 'absolute', left: l.x - 300, width: 600, top: Y + 190, textAlign: 'center', opacity: o}}>
              <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 60, color: P.white}}>{l.name}</div>
            </div>
          );
        })}
      </div>
      {/* the cloud, which turns out to be all of that */}
      {gone < 1 && (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <g transform={`translate(960,${500 + Math.sin(f / 20) * 8}) scale(${3 * (1 - gone) + 0.001})`} opacity={1 - gone}>
            <CloudShape />
          </g>
          {gone > 0 &&
            Array.from({length: 14}, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const d = 80 + 420 * gone;
              return <circle key={i} cx={960 + Math.cos(a) * d} cy={500 + Math.sin(a) * d * 0.6} r={40 * (1 - gone) + 2} fill={P.white} opacity={1 - gone} />;
            })}
        </svg>
      )}
      <Pop f={f} at={w(1980.5)} x={960} y={900} size={80} until={w(1982.2)}>
        The cloud was never a cloud
      </Pop>
    </Bg>
  );
};

/* ================================================================== 1987.7 "the more of us who know that… the people who build AI will have to show us the full bill" */
export const C8FullBill: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const rows: [IconK, string, string, string, string][] = [
    ['bolt', P.orange, 'Power', '415 TWh used by data centres in 2024', 'IEA'],
    ['drop', P.water, 'Water', '355 million gallons in one town, 2021', 'The Oregonian'],
    ['rock', '#B4683A', 'Metal', "~70% of the world's cobalt: DR Congo", 'USGS'],
    ['hand', P.pink, 'Hands', '$1.32–$2 an hour, Nairobi', 'TIME'],
    ['grid', P.purple, 'Grid', '$28.92 → $269.92 per MW-day', 'PJM'],
  ];
  const T0 = 1990.6;
  const step = 0.55;
  const print = c01((t0 + f / 24 - T0) / (step * 6));
  const stamp = pop(f, w(1993.9), 12);
  return (
    <Bg c="#1B1446">
      <div style={{position: 'absolute', left: 110, top: 180, opacity: ease(f, w(1987.9), 10)}}>
        <Tag bg={P.white} color={P.ink} size={40}>The more of us who know…</Tag>
      </div>
      <div style={{position: 'absolute', left: 120, top: 300}}>
        <IconGrid f={f} start={w(1988.0)} n={70} hi={70} cols={10} size={48} gap={12} stagger={0.5} shape="person" color={P.yellow} />
      </div>
      <Note style={{position: 'absolute', left: 120, top: 760, opacity: ease(f, w(1990.6), 10)}} size={26}>…the more they'll have to show us</Note>
      {/* the bill prints out */}
      <div style={{position: 'absolute', left: 820, top: 110, width: 1000, height: 120 + 700 * print, overflow: 'hidden', transform: `perspective(2200px) rotateY(${lerp(-10, -3, ease(f, 0, w(1995.0)))}deg)`, transformOrigin: '0 0'}}>
        <div style={{background: '#FFFDF6', borderRadius: 18, padding: '24px 40px', width: 1000, boxSizing: 'border-box', boxShadow: '0 30px 70px rgba(0,0,0,0.45)', color: P.ink}}>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 42, textAlign: 'center'}}>THE BILL FOR AI · ITEMISED</div>
          <div style={{borderTop: '3px dashed #C5CCD8', margin: '14px 0'}} />
          {rows.map(([k, c, name, val, src], i) => (
            <div key={name} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '10px 0', opacity: ease(f, w(T0 + step * i), 6)}}>
              <svg width={64} height={64} viewBox="-100 -100 200 200">
                <circle r={100} fill={c} />
                <g transform="scale(0.62)">
                  <Icon k={k} />
                </g>
              </svg>
              <div style={{width: 130, fontFamily: AF.head, fontWeight: 800, fontSize: 34}}>{name}</div>
              <div style={{flex: 1, fontFamily: AF.head, fontWeight: 600, fontSize: 30}}>{val}</div>
              <div style={{fontFamily: AF.mono, fontSize: 22, color: '#5B6B8C'}}>{src}</div>
            </div>
          ))}
          <div style={{borderTop: '3px dashed #C5CCD8', margin: '14px 0'}} />
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: AF.head, fontWeight: 800, fontSize: 40, opacity: ease(f, w(T0 + step * 5), 6)}}>
            <span>TOTAL</span>
            <span style={{color: P.red}}>still not shown in full</span>
          </div>
        </div>
      </div>
      {stamp > 0 && (
        <div style={{position: 'absolute', left: 1320, top: 905, transform: `translate(-50%,-50%) rotate(-6deg) scale(${stamp})`, border: `8px solid ${P.red}`, borderRadius: 18, padding: '8px 30px', fontFamily: AF.head, fontWeight: 800, fontSize: 84, color: P.red, background: 'rgba(255,253,246,0.85)', whiteSpace: 'nowrap'}}>
          THE FULL BILL
        </div>
      )}
    </Bg>
  );
};

/* ================================================================== 1995.4 "Back in The Dalles, the town got its answer. And Google kept building." */
const C30 = Math.cos(Math.PI / 6);
const iso = (x: number, y: number, z = 0): [number, number] => [(x - y) * C30, (x + y) * 0.5 - z];
const pts = (a: [number, number][]) => a.map((p) => p.join(',')).join(' ');
type Box = {x: number; y: number; w: number; d: number; h: number; top: string; side: string};
const BoxShape: React.FC<{b: Box}> = ({b}) => {
  const {x, y, w, d, h} = b;
  if (h <= 0.5) return null;
  return (
    <g>
      <polygon points={pts([iso(x, y + d, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x, y + d, h)])} fill={shade(b.side, 0.82)} />
      <polygon points={pts([iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x + w, y, h)])} fill={shade(b.side, 0.64)} />
      <polygon points={pts([iso(x, y, h), iso(x + w, y, h), iso(x + w, y + d, h), iso(x, y + d, h)])} fill={b.top} />
    </g>
  );
};
const ROOFS = [P.red, P.yellow, P.orange, P.teal, P.pink, P.purple];
const HOMES: Box[] = [];
for (let i = 0; i < 6; i++)
  for (let j = 0; j < 5; j++) {
    if (random(`c8h${i}-${j}`) < 0.18) continue;
    HOMES.push({x: 300 + i * 105 + random(`c8hx${i}${j}`) * 20, y: 380 + j * 110 + random(`c8hy${i}${j}`) * 20, w: 62, d: 58, h: 34 + random(`c8hh${i}${j}`) * 26, top: ROOFS[Math.floor(random(`c8r${i}${j}`) * ROOFS.length)], side: '#FFE7CC'});
  }
export const C8Dalles: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const k = ease(f, 0, w(2002.5));
  const sc = lerp(0.74, 0.92, k);
  const F = iso(lerp(760, 1180, k), lerp(640, 660, k));
  const tx = 960 - F[0] * sc;
  const ty = 600 - F[1] * sc;
  const grow = ease(f, w(1998.75), w(1999.9) - w(1998.75));
  const DC1: Box = {x: 1040, y: 520, w: 330, d: 300, h: 74, top: '#E4E9F4', side: '#F4F7FC'};
  const DC2: Box = {x: 1040, y: 880, w: 330, d: 260, h: 74 * grow, top: '#E4E9F4', side: '#F4F7FC'};
  const drawn = [...HOMES, DC1, DC2].sort((a, b) => a.x + a.y - (b.x + b.y));
  const crane = iso(1420, 1010, 0);
  return (
    <Bg c="#FF7A59" c2="#FFD39A" angle={180} pattern="none">
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <circle cx={1500} cy={260} r={110} fill="#FFE9B0" opacity={0.9} />
        <g transform={`translate(${tx},${ty}) scale(${sc})`}>
          <polygon points={pts([iso(-200, -100), iso(1900, -160), iso(1900, 40), iso(-200, 70)])} fill="#B8705A" />
          <polygon points={pts([iso(0, 0), iso(1800, 0), iso(1800, 1500), iso(0, 1500)])} fill="#C9A86A" />
          <polygon points={pts([iso(0, 70), iso(1800, 40), iso(1800, 200), iso(0, 230)])} fill="#F59E5B" />
          {Array.from({length: 8}, (_, i) => {
            const x0 = ((i * 240 + f * 4) % 1900) - 100;
            return <polyline key={i} points={pts([iso(x0, 125), iso(x0 + 90, 122)])} stroke="#FFE1B0" strokeWidth={6} strokeLinecap="round" />;
          })}
          <polyline points={pts([[900, 300], [1205, 300], [1205, 520]].map(([x, y]) => iso(x, y, 6)))} stroke="#5B6B8C" strokeWidth={16} fill="none" />
          <polyline points={pts([[900, 300], [1205, 300], [1205, 520]].map(([x, y]) => iso(x, y, 6)))} stroke={P.water} strokeWidth={8} strokeDasharray="18 16" strokeDashoffset={-f * 4} fill="none" />
          {drawn.map((b, i) => (
            <BoxShape key={i} b={b} />
          ))}
          {grow > 0 && grow < 1 && (
            <g stroke={P.yellow} strokeWidth={8} fill="none">
              <path d={`M${crane[0]} ${crane[1]} V${crane[1] - 260} H${crane[0] - 260}`} />
              <line x1={crane[0] - 200} y1={crane[1] - 260} x2={crane[0] - 200} y2={crane[1] - 160 + Math.sin(f / 8) * 15} />
            </g>
          )}
        </g>
      </svg>
      <Label f={f} at={w(1995.7)} title="The Dalles, Oregon" sub="back where the story started" bg={P.ink} color={P.white} />
      <div style={{position: 'absolute', right: 80, top: 70, textAlign: 'right', opacity: ease(f, w(1997.0), 10), transform: `translateY(${(1 - ease(f, w(1997.0), 10)) * 20}px)`}}>
        <Tag bg={P.white} color={P.ink} size={38}>The town's answer</Tag>
        <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 64, color: P.ink, marginTop: 12}}>~355M gallons in 2021</div>
        <Note style={{marginTop: 6}} size={26} color={P.ink}>29% of the city's water · The Oregonian, Dec 2022</Note>
      </div>
      <Caption f={f} at={w(1998.65)} dark>And Google kept building</Caption>
    </Bg>
  );
};

export const SCENES_8: Record<string, React.FC<AnimProps>> = {
  c8split: C8Split,
  c8older: C8Older,
  c8newer: C8Newer,
  c8notcounted: C8NotCounted,
  c8both: C8Both,
  c8answer: C8Answer,
  c8billions: C8Billions,
  c8places: C8Places,
  c8watthour: C8WattHour,
  c8notstop: C8NotStop,
  c8tools: C8Tools,
  c8hidden: C8Hidden,
  c8eurules: C8EURules,
  c8aiact: C8AIAct,
  c8grid: C8Grid,
  c8ask: C8Ask,
  c8press: C8Press,
  c8eyes: C8Eyes,
  c8chain: C8Chain,
  c8fullbill: C8FullBill,
  c8dalles: C8Dalles,
};
