import React from 'react';

/*
 * The two giants, original designs (not copies of any existing character):
 * - Monster: a charcoal-teal sea beast with pale crystal dorsal plates that glow cyan when it
 *   charges its breath. Faces LEFT. About 1000 units tall. Origin between the feet.
 * - Hero: a silver-and-red giant with gold trim, a diamond chest crystal and a finned helmet.
 *   Faces RIGHT. About 1000 units tall. Origin between the feet.
 */
export const MC = {
  skin: '#3D4F57',
  skin2: '#2B3A41',
  belly: '#7C8C80',
  belly2: '#65766B',
  plate: '#CFE6EA',
  glow: '#7FF0FF',
  eye: '#FFB22E',
  mouth: '#5A1622',
  teeth: '#F4F1E6',
};

export type MonsterProps = {
  t: number;
  walk?: number; // 0 = still, 1 = walking
  jaw?: number; // 0..1
  charge?: number; // 0..1 spikes glow
  tail?: number; // extra tail swing in degrees
  arms?: number; // 0 = resting, 1 = raised
  hurt?: number; // 0..1 lean back
  wet?: number; // 0..1 water dripping
};

export const Monster: React.FC<MonsterProps> = ({t, walk = 0, jaw = 0, charge = 0, tail = 0, arms = 0, hurt = 0, wet = 0}) => {
  const cyc = t * 0.09;
  const step = walk * Math.sin(cyc);
  const bob = walk * Math.abs(Math.cos(cyc)) * 14 + Math.sin(t / 26) * 4;
  const breathe = 1 + Math.sin(t / 20) * 0.01;
  const tailSway = Math.sin(t / 24) * 4 + tail;
  const lean = -hurt * 10 + Math.sin(t / 30) * 1;
  // dorsal plates along the back: [x, y, size, angle]
  const plates: [number, number, number, number][] = [
    [-150, -905, 70, -30],
    [-90, -895, 95, -18],
    [-20, -870, 120, -8],
    [55, -830, 130, 4],
    [125, -770, 125, 16],
    [185, -700, 110, 28],
    [235, -620, 92, 40],
    [270, -540, 75, 52],
  ];
  const tailPlates: [number, number, number, number][] = [
    [380, -420, 70, 60],
    [490, -330, 58, 66],
    [600, -245, 46, 72],
    [700, -170, 34, 76],
  ];
  const plateGlow = (i: number) => {
    // the glow runs from the tail up to the head
    const k = Math.max(0, Math.min(1, charge * 1.6 - (1 - i / 12) * 0.6));
    return k;
  };
  const plate = ([x, y, sz, a]: [number, number, number, number], i: number) => {
    const g = plateGlow(i);
    const flick = g > 0 ? 0.85 + 0.15 * Math.sin(t * 1.3 + i) : 1;
    return (
      <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
        {g > 0.05 && <path d={`M${-sz * 0.4} 0 L${-sz * 0.18} ${-sz * 0.7} L0 ${-sz * 0.45} L${sz * 0.12} ${-sz} L${sz * 0.3} ${-sz * 0.5} L${sz * 0.45} 0 Z`} fill={MC.glow} opacity={g * 0.55 * flick} transform="scale(1.35)" />}
        <path d={`M${-sz * 0.4} 0 L${-sz * 0.18} ${-sz * 0.7} L0 ${-sz * 0.45} L${sz * 0.12} ${-sz} L${sz * 0.3} ${-sz * 0.5} L${sz * 0.45} 0 Z`} fill={g > 0.05 ? mixHex(MC.plate, MC.glow, g) : MC.plate} />
        <path d={`M0 0 L${sz * 0.12} ${-sz} L${sz * 0.3} ${-sz * 0.5} L${sz * 0.45} 0 Z`} fill="#000" opacity={0.12 * (1 - g)} />
      </g>
    );
  };
  const drips = wet > 0.01 ? Array.from({length: 14}, (_, i) => {
    const u = ((t * 1.4 + i * 17) % 50) / 50;
    const x = -220 + ((i * 97) % 520);
    const y0 = -820 + ((i * 61) % 520);
    return <ellipse key={i} cx={x} cy={y0 + u * 260} rx={6} ry={14} fill="#BFEFFF" opacity={wet * (1 - u) * 0.9} />;
  }) : null;
  const leg = (x: number, a: number, lift: number, back: boolean) => (
    <g transform={`translate(${x} -330) rotate(${a})`}>
      <ellipse cx={0} cy={60} rx={105} ry={150} fill={back ? MC.skin2 : MC.skin} />
      <g transform={`translate(0 ${190 - lift})`}>
        <rect x={-62} y={0} width={124} height={140} rx={50} fill={back ? MC.skin2 : MC.skin} />
        <path d="M-95 140 Q-100 105 -60 100 L60 100 Q90 110 80 140 Z" fill={back ? MC.skin2 : MC.skin} />
        {[-92, -62, -32].map((cx) => (
          <path key={cx} d={`M${cx} 140 l -16 12 l 22 -2 Z`} fill={MC.teeth} />
        ))}
      </g>
    </g>
  );
  return (
    <g transform={`translate(0 ${-bob}) rotate(${lean} 60 -300)`}>
      <ellipse cx={80} cy={bob} rx={420} ry={30} fill="#000" opacity={0.18} />
      {/* back leg */}
      {leg(140, -step * 14, Math.max(0, -step) * 60, true)}
      {/* tail */}
      <g transform={`rotate(${tailSway} 230 -420)`}>
        <path d="M150 -520 C 330 -520, 520 -380, 900 -70 C 910 -60, 900 -50, 880 -56 C 560 -250, 380 -300, 170 -330 Z" fill={MC.skin} />
        <path d="M170 -330 C 380 -300, 560 -250, 880 -56 C 620 -200, 400 -250, 180 -290 Z" fill={MC.skin2} />
        {tailPlates.map((p, i) => plate(p, i))}
      </g>
      {/* body */}
      <g transform={`translate(40 -560) scale(${breathe}) translate(-40 560)`}>
        <ellipse cx={60} cy={-560} rx={240} ry={300} fill={MC.skin} transform="rotate(-12 60 -560)" />
        <ellipse cx={-60} cy={-520} rx={130} ry={240} fill={MC.belly} transform="rotate(-10 -60 -520)" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${-165 + i * 8} ${-700 + i * 60} q 100 18 200 0`} fill="none" stroke={MC.belly2} strokeWidth={8} strokeLinecap="round" transform="rotate(-10 -60 -520)" />
        ))}
        {/* scale texture */}
        {Array.from({length: 22}, (_, i) => (
          <circle key={i} cx={40 + ((i * 53) % 200)} cy={-780 + ((i * 89) % 440)} r={9} fill={MC.skin2} opacity={0.6} />
        ))}
      </g>
      {plates.map((p, i) => plate(p, i + 4))}
      {/* arm */}
      <g transform={`translate(-150 -650) rotate(${30 - arms * 70})`}>
        <rect x={-30} y={0} width={60} height={130} rx={30} fill={MC.skin} />
        <g transform="translate(0 120)">
          <circle r={36} fill={MC.skin} />
          {[-24, 0, 24].map((d) => (
            <path key={d} d={`M${d - 8} 20 l 8 34 l 8 -34 Z`} fill={MC.teeth} />
          ))}
        </g>
      </g>
      {/* front leg */}
      {leg(-10, step * 14, Math.max(0, step) * 60, false)}
      {/* neck and head */}
      <g transform={`rotate(${-jaw * 8 + hurt * 6} -120 -800)`}>
        <path d="M-40 -760 C -80 -860, -150 -900, -230 -900 L -120 -700 Z" fill={MC.skin} />
        <g transform="translate(-230 -900)">
          {/* lower jaw */}
          <g transform={`rotate(${-jaw * 30} 60 20)`}>
            <path d="M60 20 C 0 60, -120 70, -175 45 C -185 38, -178 26, -165 26 L 40 0 Z" fill={MC.skin2} />
            {[-150, -118, -86, -54, -22].map((x) => (
              <path key={x} d={`M${x} 30 l 9 -20 l 9 20 Z`} fill={MC.teeth} />
            ))}
            <path d="M40 4 C -20 40, -110 44, -160 30 L -150 22 C -90 30, -20 26, 30 0 Z" fill={MC.mouth} opacity={Math.min(1, jaw * 3)} />
          </g>
          {/* mouth inside when open */}
          {jaw > 0.05 && <path d={`M40 10 L -160 ${20 + jaw * 20} L -150 ${26 + jaw * 60} Q -40 ${40 + jaw * 80} 50 ${30 + jaw * 30} Z`} fill={MC.mouth} />}
          {jaw > 0.05 && charge > 0.3 && <circle cx={-80} cy={30 + jaw * 30} r={30 + charge * 30} fill={MC.glow} opacity={charge * 0.8} />}
          {/* skull */}
          <path d="M90 -30 C 60 -110, -60 -120, -130 -70 C -170 -45, -205 -20, -200 10 C -200 26, -185 30, -165 28 L 40 20 C 70 20, 95 5, 90 -30 Z" fill={MC.skin} />
          <path d="M90 -30 C 60 -110, -10 -118, -70 -100 C -10 -90, 40 -60, 60 20 C 80 12, 96 -8, 90 -30 Z" fill={MC.skin2} />
          {[-190, -158, -126, -94, -62, -30].map((x) => (
            <path key={x} d={`M${x} 22 l 9 22 l 9 -22 Z`} fill={MC.teeth} />
          ))}
          {/* brow ridge and eye */}
          <path d="M-110 -72 Q -60 -95 -20 -70 L -30 -58 Q -65 -76 -104 -60 Z" fill={MC.skin2} />
          <ellipse cx={-66} cy={-52} rx={20} ry={13} fill={MC.eye} />
          <ellipse cx={-66} cy={-52} rx={40} ry={26} fill={MC.eye} opacity={0.25 + 0.15 * Math.sin(t / 6)} />
          <rect x={-70} y={-64} width={7} height={24} rx={3} fill="#2A1206" />
          <circle cx={-186} cy={-6} r={6} fill={MC.skin2} />
        </g>
      </g>
      {drips}
    </g>
  );
};

/* ------------------------------------------------------------------ the hero */
export const HC = {
  silver: '#E3E9EF',
  silver2: '#B9C4CF',
  red: '#D8342F',
  red2: '#A92621',
  gold: '#F2C14E',
  crystal: '#5FE3FF',
  eye: '#FFF6C8',
  dark: '#2B3441',
};
export type HeroProps = {
  t: number;
  armL?: number; // back arm, degrees (0 down, 90 forward, 180 up)
  armR?: number; // front arm
  elbowL?: number;
  elbowR?: number;
  legA?: number; // front leg angle
  legB?: number; // back leg angle
  crouch?: number; // 0..1
  glow?: number; // 0..1 eyes and crystal intensity
  blink?: boolean; // crystal blinking (warning)
};

export const Hero: React.FC<HeroProps> = ({t, armL = 12, armR = -10, elbowL = 10, elbowR = 12, legA = 6, legB = -6, crouch = 0, glow = 1, blink}) => {
  const breathe = 1 + Math.sin(t / 18) * 0.008;
  const dip = crouch * 150;
  const crystalOn = blink ? (Math.floor(t / 6) % 2 ? 1 : 0.3) : 1;
  const limb = (x: number, y: number, len: number, ang: number, el: number, back: boolean, key: string, w = 70) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${-ang})`}>
      <rect x={-w / 2} y={0} width={w} height={len * 0.55} rx={w / 2} fill={back ? HC.silver2 : HC.silver} />
      <rect x={-w * 0.16} y={10} width={w * 0.32} height={len * 0.45} rx={w * 0.16} fill={back ? HC.red2 : HC.red} />
      <g transform={`translate(0 ${len * 0.5}) rotate(${-el})`}>
        <rect x={-w * 0.46} y={0} width={w * 0.92} height={len * 0.5} rx={w * 0.46} fill={back ? HC.silver2 : HC.silver} />
        <rect x={-w * 0.5} y={len * 0.08} width={w} height={26} rx={10} fill={HC.gold} opacity={back ? 0.7 : 1} />
        <circle cx={0} cy={len * 0.52} r={w * 0.5} fill={back ? HC.silver2 : HC.silver} />
      </g>
    </g>
  );
  const leg = (x: number, a: number, back: boolean, key: string) => (
    <g key={key} transform={`translate(${x} ${-430 + dip}) rotate(${-a})`}>
      <rect x={-52} y={0} width={104} height={250} rx={46} fill={back ? HC.silver2 : HC.silver} />
      <path d="M-20 20 L20 20 L28 230 L-28 230 Z" fill={back ? HC.red2 : HC.red} />
      <g transform={`translate(0 230) rotate(${crouch * -40 * (back ? -1 : 1)})`}>
        <rect x={-46} y={0} width={92} height={200 - dip * 0.1} rx={40} fill={back ? HC.silver2 : HC.silver} />
        <rect x={-48} y={60} width={96} height={22} rx={10} fill={HC.gold} opacity={back ? 0.7 : 1} />
        <path d="M-46 190 L70 190 Q86 200 80 214 L-50 214 Z" fill={back ? HC.red2 : HC.red} />
      </g>
    </g>
  );
  return (
    <g>
      <ellipse cx={0} cy={0} rx={260} ry={22} fill="#000" opacity={0.18} />
      {leg(-50, legB, true, 'lb')}
      {limb(-120, -800 + dip, 330, armL, elbowL, true, 'al')}
      {/* torso */}
      <g transform={`translate(0 ${dip}) translate(0 -620) scale(${breathe}) translate(0 620)`}>
        <path d="M-150 -860 Q 0 -900 150 -860 L 120 -460 Q 0 -430 -120 -460 Z" fill={HC.silver} />
        <path d="M-150 -860 L -60 -860 L -20 -600 L -100 -470 L -120 -460 Z" fill={HC.red} />
        <path d="M150 -860 L 60 -860 L 20 -600 L 100 -470 L 120 -460 Z" fill={HC.red} />
        <path d="M-60 -860 L 60 -860 L 20 -600 L -20 -600 Z" fill={HC.silver} />
        <rect x={-126} y={-480} width={252} height={34} rx={14} fill={HC.gold} />
        {/* chest crystal (diamond) */}
        <g transform="translate(0 -720)">
          <path d="M0 -58 L40 0 L0 58 L-40 0 Z" fill={HC.crystal} opacity={0.35 * glow * crystalOn} transform="scale(1.9)" />
          <path d="M0 -58 L40 0 L0 58 L-40 0 Z" fill={HC.dark} />
          <path d="M0 -46 L30 0 L0 46 L-30 0 Z" fill={HC.crystal} opacity={0.4 + 0.6 * glow * crystalOn} />
          <path d="M0 -46 L10 -8 L0 0 Z" fill="#fff" opacity={0.8} />
        </g>
        {/* shoulders */}
        <circle cx={-150} cy={-830} r={58} fill={HC.silver2} />
        <circle cx={150} cy={-830} r={58} fill={HC.silver} />
        <path d="M110 -870 Q 150 -900 200 -860 L 196 -836 Q 150 -870 116 -846 Z" fill={HC.gold} />
      </g>
      {leg(50, legA, false, 'lf')}
      {/* head */}
      <g transform={`translate(0 ${-960 + dip})`}>
        <rect x={-34} y={40} width={68} height={50} fill={HC.silver2} />
        <path d="M-78 10 C -84 -80, -40 -120, 0 -120 C 40 -120, 84 -80, 78 10 C 74 60, 30 86, 0 86 C -30 86, -74 60, -78 10 Z" fill={HC.silver} />
        {/* crest fin */}
        <path d="M-14 -118 L 0 -168 L 14 -118 L 10 40 L -10 40 Z" fill={HC.red} />
        <path d="M-6 -150 L 0 -168 L 6 -150 L 4 30 L -4 30 Z" fill={HC.gold} />
        {/* eyes */}
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 38} -8) rotate(${sd * -18})`}>
            <ellipse rx={32} ry={18} fill={HC.eye} opacity={0.25 * glow} transform="scale(1.7)" />
            <ellipse rx={30} ry={17} fill={HC.eye} opacity={0.5 + 0.5 * glow} />
            <ellipse rx={18} ry={8} fill="#fff" opacity={glow} />
          </g>
        ))}
        <path d="M-20 56 Q 0 64 20 56" stroke={HC.silver2} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      {limb(120, -800 + dip, 330, armR, elbowR, false, 'ar')}
    </g>
  );
};

function mixHex(a: string, b: string, k: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (sh: number) => Math.round(((pa >> sh) & 255) * (1 - k) + ((pb >> sh) & 255) * k);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
