// Paper props for The Keeper: boat, rocks, sea, lighthouse, lamp, bell, lanterns, village.
import React from 'react';
import {random} from 'remotion';
import {Cut, cut, ellipsePts, rectPts, bandPts} from '../paperkite/kit';
import {AMBER, AMBER_HI, Glow, Pal, Plane, mix} from './stage';

// ---------- the boat ----------
export const Boat: React.FC<{x: number; y: number; s?: number; rot?: number; t: number; pal: Pal; flip?: boolean; lamp?: number; sx?: number}> = ({
  x,
  y,
  s = 1,
  rot = 0,
  t,
  pal,
  flip,
  lamp = 1,
  sx,
}) => {
  const swing = Math.sin(t * 3.1) * 22;
  const hull = mix('#2B2723', '#6E5E4E', palDay(pal));
  const cabin = mix('#38322D', '#C9BBA6', palDay(pal));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${(sx ?? (flip ? -1 : 1)) * s} ${s})`}>
      <path d="M-20 -40 L-20 -300" stroke={hull} strokeWidth={9} />
      <Cut d={cut(rectPts(-110, -130, 120, 100), 'cabin', 1.2)} fill={cabin} lift={2} />
      <Cut d={cut(rectPts(-86, -110, 40, 34), 'cabWin', 0.8, 10)} fill={lamp > 0.1 ? mix('#5A5048', AMBER, lamp) : '#5A5048'} lift={1} edge={0.15} />
      <Cut d={cut([[-190, -40], [190, -40], [140, 40], [-150, 40]], 'hull2', 1.4)} fill={hull} lift={2} />
      <Cut d={cut(rectPts(-180, -46, 368, 14), 'rail', 1, 16)} fill={mix('#4A433C', '#8F7E6A', palDay(pal))} lift={1} edge={0.1} />
      {/* the lantern on the mast */}
      <g transform={`translate(-20 -300) rotate(${swing})`}>
        <path d="M0 0 L0 40" stroke={hull} strokeWidth={4} />
        <Glow x={0} y={66} r={150} a={lamp} />
        <Cut d={cut(rectPts(-16, 40, 32, 46), 'lan', 0.6, 10)} fill={lamp > 0.1 ? AMBER : '#5A5048'} lift={2} edge={0.3} />
        <path d="M-16 40 h32 M-16 86 h32" stroke={hull} strokeWidth={6} />
      </g>
    </g>
  );
};
// how far a palette is toward day (sky brightness)
const palDay = (p: Pal) => {
  const v = parseInt(p.sky.slice(1, 3), 16);
  return Math.max(0, Math.min(1, (v - 0x34) / (0xee - 0x34)));
};

// ---------- rocks ----------
export const Rocks: React.FC<{x: number; y: number; s?: number; pal: Pal; t: number; lit?: number}> = ({x, y, s = 1, pal, t, lit = 0}) => {
  const c1 = mix(pal.rock, '#4A5059', lit);
  const c2 = mix(pal.rock2, '#59606A', lit);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Cut d={cut([[-330, 60], [-260, -120], [-200, -60], [-140, -260], [-60, -90], [10, -330], [90, -150], [150, -220], [240, -40], [320, 60]], 'rockA', 2.2, 18)} fill={c2} lift={2} />
      <Cut d={cut([[-240, 60], [-170, -40], [-90, 10], [-30, -170], [60, -30], [130, -110], [220, 60]], 'rockB', 2, 16)} fill={c1} lift={2} />
      {[0, 1, 2].map((i) => {
        const k = ((t * 0.9 + i / 3) % 1);
        return (
          <g key={i} opacity={1 - k}>
            <Cut d={cut(ellipsePts(-200 + i * 190, 40 - k * 120, 60 + k * 70, 20 + k * 30, 14), `spray${i}`, 3)} fill={pal.foam} lift={1} edge={0} />
          </g>
        );
      })}
    </g>
  );
};

// ---------- the sea: stacked wavy paper bands on their own planes ----------
export const SeaBand: React.FC<{d: number; base: number; amp: number; len: number; ph: number; fill: string; seed: string; lift?: 0 | 1 | 2 | 3}> = ({
  d,
  base,
  amp,
  len,
  ph,
  fill,
  seed,
  lift = 2,
}) => (
  <Plane d={d}>
    <Cut d={cut(bandPts((x) => base + amp * Math.sin((x + ph) / len) + amp * 0.35 * Math.sin((x - ph * 0.6) / (len * 0.43)), -1800, 3400, 2600, 30), seed, 2, 20)} fill={fill} lift={lift} />
  </Plane>
);

export const Clouds: React.FC<{d: number; pal: Pal; t: number; y?: number}> = ({d, pal, t, y = 200}) => (
  <Plane d={d}>
    {[0, 1, 2, 3, 4].map((i) => (
      <Cut
        key={i}
        d={cut(ellipsePts(-900 + i * 700 + t * (12 + i * 4), y + (i % 2) * 160, 420, 120, 26), `cl${i}`, 6, 30)}
        fill={i % 2 ? pal.cloud : pal.cloud2}
        lift={1}
        edge={0.08}
      />
    ))}
  </Plane>
);

// ---------- the lighthouse on its cliff ----------
export const Cliff: React.FC<{pal: Pal}> = ({pal}) => (
  <>
    <Cut d={cut([[-600, 2400], [-600, 1700], [120, 1640], [260, 1600], [820, 1590], [980, 1660], [1180, 1880], [1700, 2400]], 'cliffA', 3, 26)} fill={pal.cliff} lift={2} />
    <Cut d={cut([[200, 2400], [300, 1760], [700, 1700], [980, 1780], [1300, 2400]], 'cliffB', 3, 26)} fill={pal.cliff2} lift={2} />
  </>
);

export const Lighthouse: React.FC<{x: number; base: number; pal: Pal; windowLit?: number; lamp?: number; t: number}> = ({x, base, pal, windowLit = 0, lamp = 0, t}) => {
  const top = base - 1180;
  return (
    <g>
      <Cut d={cut([[x - 140, base], [x + 140, base], [x + 95, top], [x - 95, top]], 'tower', 1.6, 22)} fill={pal.tower} lift={2} />
      <Cut d={cut([[x + 10, base], [x + 140, base], [x + 95, top], [x + 6, top]], 'towerShade', 1.2, 22)} fill={pal.towerShade} lift={0} edge={0} />
      <Cut d={cut(rectPts(x - 34, base - 120, 68, 120), 'door', 1)} fill={pal.cap} lift={1} />
      {/* her window, halfway up */}
      <Glow x={x} y={base - 640} r={240} a={windowLit * 0.9} />
      <Cut d={cut([[x - 34, base - 600], [x - 34, base - 660], [x, base - 690], [x + 34, base - 660], [x + 34, base - 600]], 'twin', 0.8, 10)} fill={mix(pal.glass, AMBER, windowLit)} lift={1} />
      {/* gallery, lamp room, cap */}
      <Cut d={cut(rectPts(x - 150, top - 26, 300, 30), 'gallery', 1.2)} fill={pal.cap} lift={2} />
      <path d={`M${x - 150} ${top - 26} v-60 h300 v60 M${x - 100} ${top - 86} v60 M${x - 50} ${top - 86} v60 M${x} ${top - 86} v60 M${x + 50} ${top - 86} v60 M${x + 100} ${top - 86} v60`} stroke={pal.cap} strokeWidth={6} fill="none" />
      <Glow x={x} y={top - 140} r={520} a={lamp} />
      <Cut d={cut(rectPts(x - 85, top - 230, 170, 204), 'lamproom', 1)} fill={mix(pal.glass, AMBER_HI, lamp)} lift={1} />
      <path d={`M${x - 28} ${top - 230} v204 M${x + 28} ${top - 230} v204`} stroke={pal.cap} strokeWidth={8} />
      <Cut d={cut([[x - 115, top - 226], [x, top - 330], [x + 115, top - 226]], 'dome', 1.2)} fill={pal.cap} lift={2} />
      <path d={`M${x} ${top - 330} v-40`} stroke={pal.cap} strokeWidth={6} />
      {/* the bell under the gallery, seen tiny from outside */}
      <g transform={`translate(${x + 150} ${top - 6}) rotate(${Math.sin(t * 2) * 2})`}>
        <path d="M0 -10 L0 8" stroke={pal.cap} strokeWidth={4} />
        <Cut d={cut([[-16, 40], [-12, 14], [-8, 6], [8, 6], [12, 14], [16, 40]], 'tbell', 0.6, 8)} fill={mix('#6C5E44', '#8C7A55', 0.5)} lift={1} edge={0.15} />
      </g>
    </g>
  );
};

// ---------- a hand lantern ----------
export const Lantern: React.FC<{x: number; y: number; s?: number; on?: number; t: number}> = ({x, y, s = 1, on = 1, t}) => {
  const flick = on > 0 ? 0.88 + 0.12 * Math.sin(t * 23) * Math.sin(t * 7.3) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow x={0} y={44} r={260} a={on * flick} />
      <path d="M-14 0 Q0 -18 14 0" stroke="#2A2622" strokeWidth={4} fill="none" />
      <Cut d={cut(rectPts(-22, 6, 44, 70), 'hl', 0.6, 10)} fill={on > 0.05 ? mix('#5D564E', AMBER, on) : '#5D564E'} lift={2} edge={0.3} />
      {on > 0.05 && <Cut d={cut([[-6, 56], [0, 26 - 6 * flick], [6, 56]], 'hlf', 0.4, 6)} fill={AMBER_HI} lift={0} edge={0} />}
      <path d="M-24 6 h48 M-24 76 h48 M0 6 v70" stroke="#2A2622" strokeWidth={5} />
    </g>
  );
};

// ---------- the big lamp (a Fresnel lens) ----------
export const BigLamp: React.FC<{x: number; y: number; s?: number; flame?: number; t: number}> = ({x, y, s = 1, flame = 0, t}) => {
  const fl = flame * (0.9 + 0.1 * Math.sin(t * 19));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Cut d={cut(rectPts(-170, 230, 340, 120), 'lampbase', 1.4)} fill="#3B3632" lift={2} />
      <Glow x={0} y={20} r={620} a={fl} />
      {Array.from({length: 7}, (_, i) => {
        const yy = -230 + i * 66;
        const w = 150 - Math.abs(i - 3) * 18;
        return <Cut key={i} d={cut(ellipsePts(0, yy + 30, w, 36, 22), `ring${i}`, 1.1)} fill={mix('#56636B', '#F8E2A8', fl)} opacity={0.88} lift={1} edge={0.45} />;
      })}
      {fl > 0.05 && <Cut d={cut([[-24, 80], [0, 80 - 90 * fl], [24, 80]], 'wick', 0.8, 8)} fill={AMBER_HI} lift={0} edge={0} />}
      <Cut d={cut([[-120, -250], [0, -330], [120, -250]], 'lamptop', 1.2)} fill="#3B3632" lift={2} />
    </g>
  );
};

// ---------- the bell ----------
export const Bell: React.FC<{x: number; y: number; s?: number; angle: number; pal: Pal}> = ({x, y, s = 1, angle, pal}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Cut d={cut(rectPts(-260, -40, 520, 46), 'beam', 1.4, 20)} fill={pal.wood} lift={2} />
    <g transform={`rotate(${angle} 0 0)`}>
      <Cut d={cut(rectPts(-20, 0, 40, 40), 'yoke', 1)} fill={pal.cap} lift={2} />
      <Cut
        d={cut([[-150, 330], [-130, 290], [-110, 150], [-90, 70], [-50, 36], [50, 36], [90, 70], [110, 150], [130, 290], [150, 330]], 'bell', 1.4, 16)}
        fill="#8A7650"
        lift={3}
      />
      <Cut d={cut([[-150, 330], [150, 330], [150, 350], [-150, 350]], 'lip', 1, 16)} fill="#6D5D3F" lift={1} edge={0.2} />
      <Cut d={cut(ellipsePts(0, 372, 30, 30, 14), 'clapper', 0.8)} fill="#4A3F2C" lift={2} edge={0.2} />
    </g>
  </g>
);

// ---------- village ----------
export const VHouse: React.FC<{x: number; base: number; w: number; h: number; lit: number; seed: string; pal: Pal}> = ({x, base, w, h, lit, seed, pal}) => {
  const wall = mix('#4C4E55', '#D8CEBE', palDayP(pal));
  const roof = mix('#2C2E33', '#8E8173', palDayP(pal));
  return (
    <g>
      <Cut d={cut(rectPts(x - w / 2, base - h, w, h), `${seed}w`, 1.2)} fill={wall} lift={2} />
      <Cut d={cut([[x - w / 2 - 16, base - h + 4], [x, base - h - w * 0.45], [x + w / 2 + 16, base - h + 4]], `${seed}r`, 1.2)} fill={roof} lift={2} />
      <Glow x={x} y={base - h * 0.55} r={w * 1.1} a={lit * 0.7} />
      <Cut d={cut(rectPts(x - w * 0.18, base - h * 0.7, w * 0.36, h * 0.32), `${seed}win`, 0.8, 10)} fill={mix('#2E3138', AMBER, lit)} lift={1} edge={0.2} />
    </g>
  );
};
const palDayP = (p: Pal) => {
  const v = parseInt(p.sky.slice(1, 3), 16);
  return Math.max(0, Math.min(1, (v - 0x34) / (0xee - 0x34)));
};

// A villager's lantern: a warm dot with a tiny dark figure under it.
export const VLantern: React.FC<{x: number; y: number; s?: number; a?: number; seed: string; figure?: boolean}> = ({x, y, s = 1, a = 1, seed, figure = true}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={a}>
    <Glow x={0} y={0} r={90} a={1} />
    {figure && <Cut d={cut([[-16, 20], [-12, 120], [12, 120], [16, 20], [0, 6]], `${seed}b`, 0.8, 10)} fill="#23262C" lift={1} edge={0} />}
    {figure && <Cut d={cut(ellipsePts(0, 0, 11, 11, 10), `${seed}h`, 0.5)} fill="#23262C" lift={1} edge={0} />}
    <Cut d={cut(rectPts(14, -14, 16, 22), `${seed}l`, 0.4, 8)} fill={AMBER} lift={1} edge={0.3} />
  </g>
);

export const Shards: React.FC<{t: number; at: number; x: number; y: number}> = ({t, at, x, y}) => {
  const k = t - at;
  if (k < 0 || k > 0.9) return null;
  return (
    <g opacity={1 - k / 0.9}>
      {Array.from({length: 9}, (_, i) => {
        const a = random(`sha${i}`) * Math.PI * 2;
        const v = 500 + random(`shv${i}`) * 700;
        const px = x + Math.cos(a) * v * k;
        const py = y + Math.sin(a) * v * k + 900 * k * k;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${k * 600 * (i % 2 ? 1 : -1)}) scale(${1 + k * 2})`}>
            <Cut d={cut([[-20, -12], [24, -4], [-6, 18]], `sh${i}`, 0.5, 8)} fill="#B9C6CC" opacity={0.85} lift={3} edge={0.6} />
          </g>
        );
      })}
    </g>
  );
};

