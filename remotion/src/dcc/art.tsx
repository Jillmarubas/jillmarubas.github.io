import React from 'react';
import {random} from 'remotion';

/*
 * Art library for the "city world" edition: original 2.5D flat-vector pieces drawn in the style
 * of the user's references (a flat city street, flat houses, an isometric data-centre diagram,
 * a crowd of flat people). Front views with a visible side face for depth, no outlines,
 * two-tone shading, rounded details. Everything takes `t` (frame) so it can animate.
 * Coordinates: each piece is drawn with its base centre at (0,0), growing upward.
 */
export const K = {
  sky1: '#3FA9F5',
  sky2: '#A9DEFF',
  road: '#4A4F5A',
  road2: '#3B3F48',
  walk: '#C9CFDA',
  grass: '#5CC56E',
  grass2: '#43A95A',
  green2: '#23A36A',
  tree: '#4CC06A',
  tree2: '#2F9A4E',
  trunk: '#8A5A36',
  navy: '#1E2A44',
  white: '#FFFFFF',
  win: '#9FD8FF',
  win2: '#6FBFF5',
  lit: '#FFD75E',
  red: '#E8403A',
  red2: '#C42F2A',
  blue: '#3A86E8',
  blue2: '#2C6BC4',
  yellow: '#FFC928',
  orange: '#FF9A3C',
  purple: '#7D6BE0',
  purple2: '#5E4FC0',
  pink: '#F28AB0',
  cream: '#FFF1D6',
  sand: '#F2C98A',
  sand2: '#E3AE67',
  steel: '#DDE5EE',
  steel2: '#B7C4D3',
  concrete: '#C8CDD6',
  concrete2: '#A9B0BC',
  water: '#4FB6F5',
  skin: ['#F5CBA7', '#E0A983', '#C68A5E', '#9A6440', '#6E4527'],
  hair: ['#2B1D14', '#5A3A22', '#1E1E1E', '#C98B3F', '#8E8E8E', '#D9A441'],
  cloth: ['#E8403A', '#3A86E8', '#FFC928', '#7D6BE0', '#2FB39A', '#F28AB0', '#FF9A3C', '#1E2A44', '#FFFFFF', '#8BC34A'],
};

/* ------------------------------------------------------------------ people */
export type PersonKind = {seed: number; walking?: boolean; dir?: 1 | -1; bag?: boolean; phone?: boolean; sign?: string; wave?: boolean};
/** A flat person about 110 units tall. Walks with swinging legs/arms when `walking`. */
export const Person: React.FC<PersonKind & {t: number; s?: number}> = ({seed, walking, dir = 1, bag, phone, sign, wave, t, s = 1}) => {
  const r = (k: string) => random(`${seed}-${k}`);
  const skin = K.skin[Math.floor(r('s') * K.skin.length)];
  const hair = K.hair[Math.floor(r('h') * K.hair.length)];
  const top = K.cloth[Math.floor(r('t') * K.cloth.length)];
  const bottom = ['#1E2A44', '#3B4A66', '#6B4F3A', '#2C6BC4', '#555'][Math.floor(r('b') * 5)];
  const skirt = r('k') > 0.72;
  const longHair = r('l') > 0.55;
  const tall = 0.92 + r('z') * 0.16;
  const ph = r('p') * 6;
  const sw = walking ? Math.sin(t / 4 + ph) : 0;
  const leg = sw * 20;
  const bob = walking ? Math.abs(Math.cos(t / 4 + ph)) * 2.5 : Math.sin(t / 20 + ph) * 0.8;
  const armA = walking ? -sw * 24 : wave ? -150 + Math.sin(t / 3 + ph) * 25 : 6;
  const armB = walking ? sw * 24 : -6;
  const limb = (x: number, y: number, len: number, ang: number, col: string, w = 9) => (
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>
      <rect x={-w / 2} y={0} width={w} height={len} rx={w / 2} fill={col} />
    </g>
  );
  return (
    <g transform={`scale(${s * dir * tall} ${s * tall}) translate(0 ${-bob})`}>
      <ellipse cx={0} cy={bob + 2} rx={20} ry={4} fill={K.navy} opacity={0.18} />
      {/* legs */}
      {limb(-5, -48, 48, leg, bottom, 10)}
      {limb(5, -48, 48, -leg, bottom, 10)}
      <rect x={-12} y={-4 + Math.max(0, leg * 0.1)} width={14} height={6} rx={3} fill={K.navy} transform={`rotate(${leg * 0.3} -5 -2)`} />
      {skirt && <path d="M-15 -52 L15 -52 L20 -26 L-20 -26 Z" fill={top} />}
      {/* back arm */}
      {limb(-12, -86, 36, armB, skin, 8)}
      {/* body */}
      <rect x={-15} y={-92} width={30} height={46} rx={11} fill={top} />
      <rect x={1} y={-92} width={14} height={46} rx={7} fill="#000" opacity={0.1} />
      {bag && <rect x={10} y={-60} width={18} height={22} rx={4} fill={K.trunk} />}
      {/* front arm */}
      {limb(12, -86, 36, armA, skin, 8)}
      {phone && <rect x={10} y={-66} width={8} height={13} rx={2} fill={K.navy} />}
      {/* head */}
      <rect x={-4} y={-100} width={8} height={10} fill={skin} />
      <circle cx={0} cy={-110} r={14} fill={skin} />
      <path d={longHair ? 'M-15 -110 C -16 -130 16 -130 15 -110 L 16 -92 L 10 -92 L 10 -112 L -10 -112 L -10 -92 L -16 -92 Z' : 'M-15 -110 C -16 -130 16 -130 15 -112 C 8 -118 -8 -118 -15 -110 Z'} fill={hair} />
      {sign && (
        <g transform="translate(0 -150)">
          <rect x={-2} y={0} width={4} height={60} fill={K.trunk} />
          <rect x={-42} y={-30} width={84} height={34} rx={4} fill={K.white} />
          <text x={0} y={-8} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={13} fill={K.red} transform={dir === -1 ? 'scale(-1 1)' : undefined}>
            {sign}
          </text>
        </g>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ vehicles */
export const Car: React.FC<{color: string; dir?: 1 | -1; t: number; kind?: 'sedan' | 'sport' | 'van'}> = ({color, dir = 1, t, kind = 'sedan'}) => {
  const wheel = (x: number) => (
    <g transform={`translate(${x} -14) rotate(${t * 20 * dir})`}>
      <circle r={14} fill="#222" />
      <circle r={6} fill="#aaa" />
      <rect x={-1.5} y={-6} width={3} height={12} fill="#666" />
    </g>
  );
  return (
    <g transform={`scale(${dir} 1)`}>
      <ellipse cx={0} cy={0} rx={80} ry={6} fill={K.navy} opacity={0.2} />
      {kind === 'van' ? (
        <>
          <rect x={-78} y={-78} width={150} height={62} rx={12} fill={color} />
          <rect x={30} y={-70} width={36} height={24} rx={6} fill={K.win} />
          <rect x={-66} y={-70} width={80} height={20} rx={5} fill={K.win2} />
        </>
      ) : (
        <>
          <path d={kind === 'sport' ? 'M-82 -18 L-80 -34 L-40 -40 L-10 -58 L40 -58 L70 -38 L84 -34 L84 -18 Z' : 'M-80 -18 L-80 -40 L-50 -44 L-30 -68 L36 -68 L56 -44 L82 -40 L82 -18 Z'} fill={color} />
          <path d={kind === 'sport' ? 'M-6 -54 L36 -54 L58 -40 L-30 -40 Z' : 'M-24 -64 L8 -64 L8 -46 L-40 -46 Z M14 -64 L32 -64 L48 -46 L14 -46 Z'} fill={K.win} />
          <rect x={70} y={-36} width={12} height={6} rx={3} fill={K.lit} />
        </>
      )}
      {wheel(-48)}
      {wheel(48)}
    </g>
  );
};

export const Plane: React.FC = () => (
  <g>
    <path d="M-90 0 C -60 -14 60 -14 96 -4 C 104 0 96 8 88 8 L -80 8 Z" fill={K.white} />
    <path d="M-70 -4 L-88 -34 L-72 -34 L-40 -4 Z" fill={K.blue} />
    <path d="M-10 2 L-50 36 L-30 36 L30 2 Z" fill="#DCE8F5" />
    {[-40, -20, 0, 20, 40, 60].map((x) => (
      <circle key={x} cx={x} cy={-2} r={3} fill={K.blue2} />
    ))}
  </g>
);

/* ------------------------------------------------------------------ nature */
export const RoundTree: React.FC<{s?: number; t: number; seed?: number}> = ({s = 1, t, seed = 0}) => (
  <g transform={`scale(${s})`}>
    <rect x={-6} y={-70} width={12} height={70} rx={4} fill={K.trunk} />
    <g transform={`rotate(${Math.sin(t / 22 + seed) * 2.5} 0 -60)`}>
      <circle cx={0} cy={-110} r={50} fill={K.tree} />
      <circle cx={-30} cy={-86} r={30} fill={K.tree} />
      <circle cx={30} cy={-88} r={32} fill={K.tree2} />
      <path d="M0 -160 A50 50 0 0 1 0 -60 Z" fill={K.tree2} opacity={0.6} />
    </g>
  </g>
);

export const Pine: React.FC<{s?: number; t: number; seed?: number}> = ({s = 1, t, seed = 0}) => (
  <g transform={`scale(${s}) rotate(${Math.sin(t / 26 + seed) * 1.5})`}>
    <rect x={-6} y={-40} width={12} height={40} fill={K.trunk} />
    <path d="M0 -220 L60 -40 L-60 -40 Z" fill={K.tree} />
    <path d="M0 -220 L60 -40 L0 -40 Z" fill={K.tree2} />
  </g>
);

export const Bush: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`}>
    <circle cx={-20} cy={-18} r={22} fill={K.tree} />
    <circle cx={14} cy={-22} r={26} fill={K.tree2} />
    <rect x={-42} y={-18} width={80} height={18} rx={9} fill={K.tree} />
  </g>
);

export const Cactus: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} fill="#3BA06A">
    <rect x={-12} y={-140} width={24} height={140} rx={12} />
    <rect x={-50} y={-100} width={18} height={50} rx={9} />
    <rect x={-50} y={-62} width={44} height={16} rx={8} />
    <rect x={32} y={-118} width={18} height={46} rx={9} />
    <rect x={6} y={-82} width={44} height={16} rx={8} />
    <rect x={0} y={-140} width={12} height={140} rx={6} fill="#2E8756" />
  </g>
);

export const Cloud: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} fill={K.white}>
    <circle cx={0} cy={0} r={46} />
    <circle cx={54} cy={-22} r={62} />
    <circle cx={118} cy={0} r={42} />
    <rect x={-46} y={0} width={206} height={44} rx={22} />
  </g>
);

/* ------------------------------------------------------------------ homes (five styles, like reference 3) */
export const Home: React.FC<{style: number; t: number; lit?: boolean; seed?: number}> = ({style, t, lit, seed = 0}) => {
  const glow = (i: number) => (lit ? (Math.sin(t / 9 + i + seed) > -0.6 ? K.lit : K.win) : K.win);
  const win = (x: number, y: number, w: number, h: number, i: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={glow(i)} />
      <rect x={x + w / 2 - 1.5} y={y} width={3} height={h} fill={K.white} opacity={0.8} />
    </g>
  );
  const smoke = (x: number, y: number) =>
    [0, 1, 2].map((k) => {
      const u = ((t * 0.7 + k * 22 + seed * 13) % 66) / 66;
      return <circle key={k} cx={x + u * 20} cy={y - u * 70} r={6 + u * 14} fill={K.white} opacity={0.7 * (1 - u)} />;
    });
  switch (style % 5) {
    case 0: // lilac house with garage (ref row 1 left)
      return (
        <g>
          <rect x={-150} y={-150} width={210} height={150} fill="#C9D3F5" />
          <path d="M-164 -150 L-130 -210 L60 -210 L80 -150 Z" fill={K.purple} />
          <rect x={60} y={-110} width={100} height={110} fill={K.purple2} />
          <rect x={70} y={-90} width={80} height={90} fill="#E8ECF4" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={70} y={-80 + i * 20} width={80} height={3} fill={K.steel2} />
          ))}
          {win(-130, -120, 60, 44, 1)}
          {win(-20, -120, 50, 44, 2)}
          <rect x={-58} y={-86} width={34} height={86} rx={3} fill="#8E2F5C" />
          <circle cx={-40} cy={-176} r={12} fill={K.win} />
          <rect x={-120} y={-236} width={20} height={34} fill="#C9D3F5" />
          {smoke(-110, -240)}
          <Bush s={0.9} />
        </g>
      );
    case 1: // mustard two-storey with dormer (ref row 2 left)
      return (
        <g>
          <rect x={-130} y={-190} width={260} height={190} fill="#C8425E" />
          <rect x={30} y={-190} width={100} height={190} fill="#A93650" />
          <path d="M-150 -190 L-100 -270 L100 -270 L150 -190 Z" fill={K.yellow} />
          <rect x={-30} y={-252} width={60} height={50} fill="#C8425E" />
          {win(-18, -242, 36, 30, 1)}
          {[-110, -70, -30, 10, 50, 90].map((x, i) => win(x, -170, 22, 22, i + 2))}
          {win(-100, -110, 50, 50, 8)}
          {win(-40, -110, 50, 50, 9)}
          <rect x={50} y={-90} width={46} height={90} rx={4} fill={K.yellow} />
          <rect x={80} y={-300} width={14} height={40} fill="#A93650" />
          {smoke(86, -300)}
        </g>
      );
    case 2: // blue townhouse with balcony (ref row 2 middle)
      return (
        <g>
          <rect x={-80} y={-240} width={160} height={240} fill="#D6E6FF" />
          <path d="M-96 -240 L0 -310 L96 -240 Z" fill={K.purple} />
          <circle cx={0} cy={-262} r={16} fill={K.win} />
          <rect x={-80} y={-150} width={160} height={14} fill={K.orange} />
          {[-72, -48, -24, 0, 24, 48, 72].map((x) => (
            <rect key={x} x={x - 2} y={-176} width={4} height={26} fill={K.orange} />
          ))}
          {win(-60, -226, 70, 60, 1)}
          {win(20, -100, 44, 60, 2)}
          <rect x={-56} y={-96} width={40} height={96} rx={4} fill={K.white} />
          <rect x={30} y={-340} width={16} height={50} fill={K.orange} />
          {smoke(38, -340)}
        </g>
      );
    case 3: // purple modern with garage and deck (ref row 2 right)
      return (
        <g>
          <path d="M-150 -170 L150 -230 L150 0 L-150 0 Z" fill={K.purple2} />
          <rect x={-150} y={-100} width={140} height={100} fill={K.purple} />
          <rect x={-140} y={-80} width={120} height={80} fill="#E8ECF4" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-140} y={-66 + i * 22} width={120} height={3} fill={K.steel2} />
          ))}
          <rect x={-150} y={-112} width={150} height={12} fill={K.orange} />
          {win(20, -190, 44, 40, 1)}
          {win(80, -196, 44, 40, 2)}
          {win(20, -120, 44, 40, 3)}
          <rect x={80} y={-100} width={40} height={100} rx={4} fill={K.yellow} />
        </g>
      );
    default: // cream cottage with red roof and fence
      return (
        <g>
          <rect x={-110} y={-140} width={220} height={140} fill={K.cream} />
          <rect x={20} y={-140} width={90} height={140} fill="#F0DDB8" />
          <path d="M-130 -140 L0 -230 L130 -140 Z" fill={K.red} />
          <path d="M0 -230 L130 -140 L0 -140 Z" fill={K.red2} />
          {win(-86, -110, 46, 46, 1)}
          {win(46, -110, 46, 46, 2)}
          <rect x={-20} y={-96} width={40} height={96} rx={18} fill={K.blue} />
          <rect x={60} y={-236} width={18} height={50} fill={K.navy} />
          {smoke(69, -240)}
          {[-150, -135, -120, 125, 140, 155].map((x) => (
            <rect key={x} x={x} y={-40} width={8} height={40} rx={3} fill={K.yellow} />
          ))}
          <rect x={-152} y={-28} width={40} height={6} fill={K.yellow} />
          <rect x={120} y={-28} width={44} height={6} fill={K.yellow} />
        </g>
      );
  }
};

/* ------------------------------------------------------------------ city buildings (ref 2) */
export const Tower: React.FC<{w: number; h: number; c1: string; c2: string; t: number; seed: number; roof?: boolean}> = ({w, h, c1, c2, t, seed, roof}) => {
  const cols = Math.max(2, Math.floor((w - 20) / 34));
  const rows = Math.max(2, Math.floor((h - 40) / 44));
  return (
    <g>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={c1} />
      <rect x={w / 2 - w * 0.28} y={-h} width={w * 0.28} height={h} fill={c2} />
      {roof && <rect x={-w / 2 - 6} y={-h - 14} width={w + 12} height={16} fill={c2} />}
      {Array.from({length: rows}, (_, j) =>
        Array.from({length: cols}, (_, i) => {
          const on = Math.sin(t / 15 + i * 1.3 + j * 2.1 + seed) > 0.55;
          return <rect key={`${i}-${j}`} x={-w / 2 + 12 + i * ((w - 24) / cols)} y={-h + 20 + j * 44} width={(w - 24) / cols - 10} height={28} rx={3} fill={on ? K.lit : K.win} opacity={0.95} />;
        }),
      )}
    </g>
  );
};

export const Shop: React.FC<{label: string; c: string; awning: string; t: number}> = ({label, c, awning, t}) => (
  <g>
    <rect x={-130} y={-190} width={260} height={190} fill={c} />
    <rect x={40} y={-190} width={90} height={190} fill="#000" opacity={0.08} />
    <rect x={-110} y={-176} width={220} height={34} rx={6} fill={K.white} />
    <text x={0} y={-152} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={20} fill={awning}>
      {label}
    </text>
    {Array.from({length: 8}, (_, i) => (
      <path key={i} d={`M${-130 + i * 32.5} -136 L${-97.5 + i * 32.5} -136 L${-97.5 + i * 32.5} -110 Q${-113.75 + i * 32.5} -96 ${-130 + i * 32.5} -110 Z`} fill={i % 2 ? awning : K.white} />
    ))}
    <rect x={-110} y={-96} width={140} height={80} rx={4} fill={K.win} />
    <rect x={50} y={-96} width={56} height={96} rx={4} fill={K.navy} />
    <rect x={-110} y={-96} width={140} height={80} fill={K.white} opacity={0.15 + 0.1 * Math.sin(t / 10)} />
  </g>
);

export const StreetLamp: React.FC<{t: number; on?: boolean}> = ({on}) => (
  <g>
    <rect x={-4} y={-170} width={8} height={170} fill={K.navy} />
    <rect x={-16} y={-190} width={32} height={24} rx={6} fill={K.navy} />
    <rect x={-10} y={-184} width={20} height={12} rx={3} fill={on ? K.lit : '#E8E0C0'} />
  </g>
);

/* ------------------------------------------------------------------ the data-centre campus (ref 1) */
/** One data-hall block with a top face, side face, window-less walls, LED strips and rooftop units. */
export const DataHall: React.FC<{w: number; h: number; t: number; seed: number; hot?: boolean}> = ({w, h, t, seed, hot}) => {
  const d = 60; // depth offset for the top/side faces
  const leds = Math.floor((w - 40) / 36);
  return (
    <g>
      <path d={`M${-w / 2} ${-h} L${-w / 2 + d} ${-h - d * 0.5} L${w / 2 + d} ${-h - d * 0.5} L${w / 2} ${-h} Z`} fill={K.steel} />
      <path d={`M${w / 2} 0 L${w / 2} ${-h} L${w / 2 + d} ${-h - d * 0.5} L${w / 2 + d} ${-d * 0.5} Z`} fill={K.steel2} />
      <rect x={-w / 2} y={-h} width={w} height={h} fill="#E8EEF5" />
      <rect x={-w / 2} y={-h} width={w} height={16} fill={hot ? K.red : K.blue} />
      {[0, 1, 2].map((row) =>
        Array.from({length: leds}, (_, i) => {
          const on = Math.sin(t * 0.3 + i * 1.7 + row * 2.3 + seed) > -0.3;
          return <rect key={`${row}-${i}`} x={-w / 2 + 24 + i * 36} y={-h + 44 + row * 30} width={22} height={7} rx={3} fill={on ? [K.blue, '#2FB39A', K.blue][row] : K.steel2} />;
        }),
      )}
      <rect x={-24} y={-80} width={48} height={80} rx={5} fill={K.navy} />
      {/* rooftop cooling units with spinning fans */}
      {Array.from({length: Math.max(2, Math.floor(w / 110))}, (_, i) => {
        const x = -w / 2 + 50 + i * 110 + d * 0.5;
        return (
          <g key={i} transform={`translate(${x} ${-h - d * 0.25})`}>
            <rect x={-34} y={-30} width={68} height={30} rx={4} fill={K.concrete2} />
            <g transform={`translate(0 -38) scale(1 0.45) rotate(${t * 18 + i * 30})`}>
              <circle r={24} fill={K.concrete} />
              <rect x={-22} y={-4} width={44} height={8} rx={4} fill={K.navy} />
              <rect x={-4} y={-22} width={8} height={44} rx={4} fill={K.navy} />
            </g>
          </g>
        );
      })}
    </g>
  );
};

export const Substation: React.FC<{t: number}> = ({t}) => (
  <g>
    <path d="M-260 0 L-200 -60 L260 -60 L200 0 Z" fill={K.red} />
    <path d="M200 0 L260 -60 L260 -40 L200 20 Z" fill={K.red2} />
    <rect x={-260} y={0} width={460} height={20} fill={K.red2} />
    {[-170, -60, 50].map((x, i) => (
      <g key={x} transform={`translate(${x} -40)`}>
        <rect x={-38} y={-80} width={76} height={80} rx={6} fill="#8C96A6" />
        <rect x={10} y={-80} width={28} height={80} fill="#6F7A8B" />
        {[-24, 0, 24].map((dx) => (
          <g key={dx}>
            <rect x={dx - 5} y={-120} width={10} height={40} fill="#E8EEF5" />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={dx - 9} y={-116 + k * 12} width={18} height={5} rx={2} fill="#B7C4D3" />
            ))}
          </g>
        ))}
        <circle cx={0} cy={-100} r={6} fill={Math.sin(t / 5 + i) > 0 ? K.yellow : '#8C96A6'} />
      </g>
    ))}
  </g>
);

export const Pylon: React.FC<{s?: number; t: number}> = ({s = 1, t}) => {
  const spark = ((t * 3) % 100) / 100;
  return (
    <g transform={`scale(${s})`}>
      <g stroke={K.red} strokeWidth={7} strokeLinecap="round" fill="none">
        <path d="M-50 0 L0 -300 L50 0 M-38 -80 L38 -80 M-26 -160 L26 -160 M-38 -80 L26 -160 M38 -80 L-26 -160" />
        <path d="M-80 -240 L80 -240 M-60 -200 L60 -200" />
      </g>
      <circle cx={-80 + spark * 160} cy={-240} r={7} fill={K.yellow} />
    </g>
  );
};

export const CoolingTower: React.FC<{t: number; s?: number}> = ({t, s = 1}) => (
  <g transform={`scale(${s})`}>
    <path d="M-100 0 C -80 -120 -80 -200 -90 -300 L90 -300 C 80 -200 80 -120 100 0 Z" fill="#7FB8F0" />
    <path d="M0 -300 L90 -300 C 80 -200 80 -120 100 0 L0 0 Z" fill={K.blue} />
    <ellipse cx={0} cy={-300} rx={90} ry={18} fill={K.blue2} />
    <rect x={-100} y={-40} width={200} height={10} fill={K.white} opacity={0.4} />
    {[0, 1, 2, 3].map((k) => {
      const u = ((t * 0.6 + k * 17) % 68) / 68;
      return <circle key={k} cx={-30 + k * 20 + u * 16} cy={-320 - u * 150} r={24 + u * 40} fill={K.white} opacity={0.85 * (1 - u)} />;
    })}
  </g>
);

export const PowerPlant: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect x={-240} y={-200} width={360} height={200} fill="#9AA6B8" />
    <rect x={40} y={-200} width={80} height={200} fill="#7F8B9E" />
    {[-200, -120, -40].map((x) => (
      <rect key={x} x={x} y={-160} width={56} height={40} rx={4} fill={K.lit} opacity={0.6 + 0.4 * Math.sin(t / 8 + x)} />
    ))}
    {[150, 220].map((x, i) => (
      <g key={x}>
        <rect x={x - 22} y={-420} width={44} height={420} fill="#B7C4D3" />
        <rect x={x - 22} y={-420} width={44} height={20} fill={K.red} />
        <rect x={x - 22} y={-360} width={44} height={16} fill={K.red} />
        {[0, 1, 2].map((k) => {
          const u = ((t * 0.8 + k * 20 + i * 9) % 60) / 60;
          return <circle key={k} cx={x + u * 30} cy={-440 - u * 120} r={16 + u * 30} fill="#DDE3EA" opacity={0.8 * (1 - u)} />;
        })}
      </g>
    ))}
  </g>
);

export const GasTurbine: React.FC<{t: number; seed: number; tag?: boolean}> = ({t, seed, tag}) => (
  <g>
    <rect x={-80} y={-80} width={160} height={80} rx={14} fill={K.orange} />
    <rect x={20} y={-80} width={60} height={80} rx={0} fill="#E58427" />
    <rect x={40} y={-170} width={34} height={94} fill={K.navy} />
    {[0, 1, 2].map((k) => {
      const u = ((t * 0.9 + k * 22 + seed * 7) % 66) / 66;
      return <circle key={k} cx={57 + u * 24} cy={-180 - u * 90} r={12 + u * 26} fill="#8C9BAE" opacity={0.6 * (1 - u)} />;
    })}
    {tag && (
      <g transform="translate(-40 -120)">
        <rect x={-56} y={-18} width={112} height={30} rx={8} fill={K.red} />
        <text x={0} y={3} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={14} fill={K.white}>
          NO PERMIT
        </text>
      </g>
    )}
  </g>
);

export const TownHall: React.FC<{label?: string; wall?: string; roof?: string; roof2?: string}> = ({label = 'TOWN HALL', wall = K.cream, roof = K.purple, roof2 = K.purple2}) => (
  <g>
    <rect x={-300} y={-260} width={600} height={260} fill={wall} />
    <path d="M-330 -260 L0 -400 L330 -260 Z" fill={roof} />
    <path d="M0 -400 L330 -260 L0 -260 Z" fill={roof2} />
    <circle cx={0} cy={-310} r={34} fill={K.white} />
    <rect x={-2} y={-334} width={4} height={24} fill={K.navy} />
    {[-240, -150, -60, 30, 120, 210].map((x) => (
      <rect key={x} x={x} y={-240} width={30} height={220} fill={K.white} />
    ))}
    <rect x={-340} y={-20} width={680} height={20} fill="#E3D2AC" />
    <rect x={-60} y={-140} width={120} height={140} rx={60} fill={K.navy} />
    <text x={0} y={-270} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={26} fill={roof2}>
      {label}
    </text>
  </g>
);

export const WaterTower: React.FC = () => (
  <g>
    {[-50, 50].map((x) => (
      <rect key={x} x={x - 5} y={-220} width={10} height={220} fill={K.navy} />
    ))}
    <rect x={-80} y={-340} width={160} height={120} rx={20} fill={K.blue} />
    <rect x={0} y={-340} width={80} height={120} rx={0} fill={K.blue2} />
    <path d="M-90 -340 L0 -390 L90 -340 Z" fill={K.blue2} />
  </g>
);

export const Flag: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect x={-4} y={-220} width={8} height={220} fill={K.navy} />
    <path d={`M4 -216 Q60 ${-230 + Math.sin(t / 6) * 10} 120 -196 Q60 ${-170 - Math.sin(t / 6) * 10} 4 -160 Z`} fill={K.red} />
  </g>
);
