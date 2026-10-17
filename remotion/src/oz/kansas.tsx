// Kansas, circa 1900: prairie, sky and storm, the homestead, the windmill, the shed, fence and stock.
// Built to the measurements in ART-REFERENCE.md (dimensions in feet, drawn at `ft` px per foot).
import React from 'react';
import {random} from 'remotion';
import {Cut, Pt, ellipsePts, rectPts} from '../paperkite/kit';
import {cutC, mix, OZ, W} from './look';

// ---------- sky ----------
// storm: 0 = plain gray-blue midday, 1 = olive-green supercell
export const KansasSky: React.FC<{storm?: number; t: number; y1?: number}> = ({storm = 0, t, y1 = 1080}) => {
  const top = mix('#7E97A8', '#26302C', storm);
  const mid = mix('#A9B9BF', '#4E6150', storm);
  const low = mix('#D9DCD0', '#93A07E', storm);
  const clouds = 7;
  return (
    <g>
      <defs>
        <linearGradient id={`ks${Math.round(storm * 20)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.6" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
      </defs>
      <rect x={-1500} y={-1500} width={W + 3000} height={y1 + 1500} fill={`url(#ks${Math.round(storm * 20)})`} />
      {/* flat-bottomed fair-weather clouds (fade out as the storm builds) */}
      {storm < 0.95 &&
        Array.from({length: clouds}, (_, i) => {
          const cx = ((random(`kc${i}`) * 3200 + t * 8) % 3600) - 800;
          const cy = 120 + random(`kcy${i}`) * 260;
          const w = 260 + random(`kcw${i}`) * 300;
          const pts: Pt[] = [
            [-w / 2, 30], [-w * 0.44, 0], [-w * 0.3, -34], [-w * 0.1, -44], [w * 0.06, -64], [w * 0.26, -50], [w * 0.42, -18], [w / 2, 30],
          ];
          return <Cut key={i} d={cutC(pts.map(([x, y]) => [x + cx, y + cy]), `kcl${i}`, 2, 16)} fill="#EEF0EA" lift={1} edge={0.15} opacity={(1 - storm) * 0.92} />;
        })}
      {/* storm: layered shelf-cloud bands with ragged undersides, drifting */}
      {storm > 0.05 &&
        Array.from({length: 6}, (_, i) => {
          const yb = -200 + i * 110;
          const drift = (t * (6 + i * 4)) % 400;
          const pts: Pt[] = [];
          for (let k = 0; k <= 24; k++) {
            const xx = -1600 + k * 200 - drift;
            pts.push([xx, yb + 70 + Math.sin(k * 1.3 + i) * 26 + random(`sb${i}${k}`) * 30]);
          }
          pts.push([3600, yb - 400], [-1800, yb - 400]);
          return <Cut key={'s' + i} d={cutC(pts, `shelf${i}`, 4, 40)} fill={mix('#56665C', '#1E2622', i / 6)} lift={1} edge={0.08} opacity={storm} />;
        })}
    </g>
  );
};

// A supercell wall cloud with a tornado funnel and debris cloud. x,y = where the funnel touches the ground.
export const Tornado: React.FC<{x: number; y: number; w: number; h: number; t: number; debris?: number; rope?: number}> = ({x, y, w, h, t, debris = 1, rope = 0}) => {
  const sway = (k: number) => Math.sin(t * 0.9 + k * 2.2) * w * 0.25 * k;
  const N = 18;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const k = i / N; // 0 at ground, 1 at cloud base
    const half = w * (0.12 + 0.88 * Math.pow(k, 1.8 - rope)) * 0.5 + w * 0.06;
    const cx = x + sway(1 - k) * 0.6;
    left.push([cx - half, y - k * h]);
    right.push([cx + half, y - k * h]);
  }
  const funnel = [...left, ...right.reverse()];
  // spiral bands across the funnel (scroll upward to read as rotation)
  const bands = Array.from({length: 9}, (_, i) => {
    const k = ((i / 9 + t * 0.35) % 1);
    const half = w * (0.12 + 0.88 * Math.pow(k, 1.8)) * 0.5 + w * 0.06;
    const cx = x + sway(1 - k) * 0.6;
    const yy = y - k * h;
    return <path key={i} d={`M${cx - half} ${yy} Q${cx} ${yy + 18 + k * 30} ${cx + half} ${yy - 10}`} stroke="rgba(30,34,32,0.22)" strokeWidth={3 + k * 5} fill="none" />;
  });
  return (
    <g>
      {/* wall cloud */}
      <Cut d={cutC([[x - w * 4, y - h - 40], [x + w * 4, y - h - 40], [x + w * 3, y - h + 40], [x + w * 1.2, y - h + 70], [x - w * 1.4, y - h + 66], [x - w * 3.2, y - h + 30]], 'wallc', 8, 40)} fill="#2B332F" lift={2} edge={0.1} />
      <Cut d={cutC(funnel, 'funnel', 5, 24)} fill="#46504A" lift={2} edge={0.1} opacity={0.97} />
      {bands}
      {debris > 0 && (
        <g opacity={debris}>
          {[0, 1, 2].map((j) => {
            const pts: Pt[] = [];
            for (let k = 0; k < 22; k++) {
              const a = (k / 22) * Math.PI * 2;
              const rr = w * (1.1 + j * 0.25) * (0.75 + random(`dc${j}${k}${Math.floor(t * 6)}`) * 0.4);
              pts.push([x + Math.cos(a) * rr * 1.3, y - w * 0.35 - j * w * 0.2 + Math.sin(a) * rr * 0.55]);
            }
            return <Cut key={j} d={cutC(pts, `dust${j}${Math.floor(t * 6)}`, 6, 18)} fill={mix('#7A6A55', '#5E5546', j / 2)} lift={1} edge={0} opacity={0.55 - j * 0.12} />;
          })}
          {Array.from({length: 16}, (_, i) => {
            const a = t * 4 + i * 1.7;
            const r = w * (0.4 + random(`bd${i}`) * 1.2);
            const yy = y - random(`by${i}`) * h * 0.5;
            return <rect key={i} x={x + Math.cos(a) * r} y={yy} width={10} height={4} fill="#3A3026" transform={`rotate(${a * 60} ${x + Math.cos(a) * r} ${yy})`} />;
          })}
        </g>
      )}
    </g>
  );
};

// ---------- ground ----------
// Flat plowed prairie with furrows running to the horizon, sun-baked cracks in the foreground, gray grass tufts.
export const Prairie: React.FC<{horizon: number; t: number; wind?: number; windDir?: number; cracks?: boolean; tint?: number; seed?: string}> = ({horizon, t, wind = 0, windDir = 1, cracks = true, tint = 0, seed = 'pr'}) => {
  const ground = mix(OZ.dirt, '#5E5546', tint);
  const far = mix('#A69A80', '#6E6656', tint);
  const furrows = Array.from({length: 40}, (_, i) => {
    const xb = -2400 + i * 170;
    return <line key={i} x1={W / 2 + (xb - W / 2) * 0.02} y1={horizon} x2={xb} y2={1500} stroke="rgba(60,45,30,0.18)" strokeWidth={6} />;
  });
  return (
    <g>
      <rect x={-1500} y={horizon} width={W + 3000} height={1800} fill={ground} />
      <rect x={-1500} y={horizon} width={W + 3000} height={40} fill={far} />
      <g clipPath="">{furrows}</g>
      {/* grass bowing in waves before the storm */}
      {Array.from({length: 120}, (_, i) => {
        const gx = random(`${seed}gx${i}`) * (W + 1400) - 700;
        const k = random(`${seed}gy${i}`);
        const gy = horizon + 20 + Math.pow(k, 2) * 900;
        const sc = 0.3 + Math.pow(k, 2) * 1.6;
        const bend = wind * windDir * (18 + Math.sin(t * 3 - gx * 0.004) * 16);
        const col = mix(OZ.grass, OZ.grass2, random(`${seed}gc${i}`));
        return (
          <g key={i} transform={`translate(${gx} ${gy}) scale(${sc})`}>
            {[-14, -5, 4, 12].map((dx, j) => (
              <path key={j} d={`M${dx} 0 Q${dx + bend * 0.4} -24 ${dx + bend + (j - 1.5) * 5} -46`} stroke={col} strokeWidth={4} fill="none" strokeLinecap="round" />
            ))}
          </g>
        );
      })}
      {cracks &&
        Array.from({length: 26}, (_, i) => {
          const cx = random(`${seed}cx${i}`) * (W + 600) - 300;
          const cy = horizon + 240 + random(`${seed}cy${i}`) * 700;
          let d = `M${cx} ${cy}`;
          let px = cx;
          let py = cy;
          for (let j = 0; j < 5; j++) {
            px += (random(`${seed}c${i}${j}`) - 0.5) * 90;
            py += (random(`${seed}d${i}${j}`) - 0.5) * 30;
            d += ` L${px} ${py}`;
          }
          return <path key={i} d={d} stroke="rgba(50,36,24,0.35)" strokeWidth={3} fill="none" />;
        })}
    </g>
  );
};

// ---------- the homestead ----------
// 18 ft long side facing us, 14 ft gable end receding to the right (oblique 3/4 view).
// Walls 8 ft, roof 6:12, floor 16 in up on limestone blocks, clapboard at 4.5 in exposure,
// three 2-over-2 windows (2'6" x 5'), door 2'8" x 6'8", a stovepipe, a plank stoop.
export const House: React.FC<{x: number; y: number; ft: number; t?: number; doorOpen?: number; lit?: number; paint?: number; tilt?: number; spin?: number; noFound?: boolean}> = ({
  x,
  y,
  ft,
  t = 0,
  doorOpen = 0,
  lit = 0,
  paint = 0.25,
  tilt = 0,
  spin = 0,
  noFound,
}) => {
  const L = 18 * ft;
  const Hh = 8 * ft;
  const D = 14 * ft;
  const ox = D * 0.42; // oblique depth offset
  const oy = -D * 0.16;
  const fl = (16 / 12) * ft; // floor height
  const rise = 3.5 * ft; // 6:12 over 7 ft half-span
  const ov = 1 * ft; // eave overhang
  const base = -fl; // bottom of the wall
  const top = base - Hh; // top of the wall
  // spin: show more of the gable end as the house turns (0..1 swaps the faces)
  const sideK = 0.42 + Math.sin(spin) * 0.3;
  const sx = D * sideK;
  const wood = mix(OZ.wood, '#E9E4D8', paint * 0.35);
  const woodSide = mix(OZ.woodDark, '#CFC9BC', paint * 0.3);
  const clap = (x0: number, y0: number, w: number, h: number, dx = 0, dy = 0, key = '') =>
    Array.from({length: Math.floor(h / (0.375 * ft))}, (_, i) => {
      const yy = y0 + h - i * 0.375 * ft;
      return <line key={key + i} x1={x0} y1={yy} x2={x0 + w} y2={yy + dy * (w / (dx || w))} stroke="rgba(40,32,24,0.28)" strokeWidth={Math.max(1, ft * 0.06)} />;
    });
  const win = (wx: number, key: string) => {
    const ww = 2.5 * ft;
    const wh = 5 * ft;
    const wy = base - 2.5 * ft - wh;
    return (
      <g key={key}>
        <rect x={wx - ft * 0.3} y={wy - ft * 0.3} width={ww + ft * 0.6} height={wh + ft * 0.5} fill={OZ.woodLight} />
        <rect x={wx} y={wy} width={ww} height={wh} fill={lit ? mix(OZ.glass, '#F3D38A', lit) : OZ.glass} />
        {/* 2-over-2: meeting rail and one vertical muntin per sash */}
        <rect x={wx} y={wy + wh / 2 - ft * 0.08} width={ww} height={ft * 0.16} fill={OZ.woodLight} />
        <rect x={wx + ww / 2 - ft * 0.05} y={wy} width={ft * 0.1} height={wh} fill={OZ.woodLight} />
        <rect x={wx - ft * 0.35} y={wy + wh + ft * 0.1} width={ww + ft * 0.7} height={ft * 0.22} fill={OZ.woodDark} />
      </g>
    );
  };
  const doorW = (32 / 12) * ft;
  const doorH = (80 / 12) * ft;
  const doorX = L * 0.5 - doorW / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt} ${L / 2} ${top})`}>
      {/* limestone footing blocks */}
      {!noFound &&
        [0, 0.33, 0.66, 1].map((k, i) => (
          <Cut key={i} d={cutC(rectPts(k * L - ft * 0.6 + (k === 1 ? -ft * 0.6 : 0), base, ft * 1.2, fl), `stone${i}`, 0.8, 10)} fill="#B9B09C" lift={1} edge={0.2} />
        ))}
      {!noFound && <Cut d={cutC(rectPts(L + sx - ft * 1.2, base + oy * (sx / ox) * 0.95, ft * 1.2, fl), 'stoneS', 0.8, 10)} fill="#A59C88" lift={1} edge={0.2} />}
      {/* gable end (side wall + triangle) */}
      <Cut d={cutC([[L, base], [L + sx, base + oy * (sx / ox)], [L + sx, top + oy * (sx / ox)], [L + sx / 2, top + (oy * (sx / ox)) / 2 - rise], [L, top]], 'gable', 1.2, 20)} fill={woodSide} lift={1} />
      <g opacity={0.9}>{clap(L, top, sx, Hh, sx, oy * (sx / ox), 'cs')}</g>
      {/* front wall */}
      <Cut d={cutC(rectPts(0, top, L, Hh), 'front', 1.2, 24)} fill={wood} lift={1} />
      <rect x={0} y={top} width={L} height={Hh} fill="url(#grain)" opacity={0.7} />
      {clap(0, top, L, Hh)}
      {/* corner boards */}
      <rect x={0} y={top} width={ft * 0.4} height={Hh} fill={OZ.woodLight} />
      <rect x={L - ft * 0.4} y={top} width={ft * 0.4} height={Hh} fill={OZ.woodLight} />
      {/* remnants of white paint, blistered off */}
      {paint > 0 &&
        Array.from({length: 9}, (_, i) => (
          <Cut key={i} d={cutC(ellipsePts(random(`pp${i}`) * L, top + random(`pq${i}`) * Hh, ft * (0.6 + random(`pr${i}`)), ft * 0.3, 10), `paint${i}`, 1, 6)} fill="#E4DFD2" lift={0} edge={0} opacity={paint} />
        ))}
      {/* windows and door */}
      {win(L * 0.14, 'w1')}
      {win(L * 0.72, 'w2')}
      <rect x={doorX - ft * 0.3} y={base - doorH - ft * 0.3} width={doorW + ft * 0.6} height={doorH + ft * 0.3} fill={OZ.woodLight} />
      <rect x={doorX} y={base - doorH} width={doorW} height={doorH} fill={doorOpen > 0 ? '#1E1B18' : OZ.woodDark} />
      <g transform={`translate(${doorX} 0) scale(${1 - doorOpen * 0.85} 1)`}>
        <rect x={0} y={base - doorH} width={doorW} height={doorH} fill={OZ.woodDark} />
        {[0.25, 0.5, 0.75].map((k) => (
          <line key={k} x1={doorW * k} y1={base - doorH} x2={doorW * k} y2={base} stroke="rgba(30,24,18,0.4)" strokeWidth={ft * 0.06} />
        ))}
        <circle cx={doorW * 0.86} cy={base - doorH * 0.48} r={ft * 0.1} fill="#2A2420" />
      </g>
      {/* plank stoop */}
      <Cut d={cutC(rectPts(doorX - ft * 1.2, base - ft * 0.1, doorW + ft * 2.4, fl * 0.55), 'stoop', 0.8, 12)} fill={OZ.woodDark} lift={1} edge={0.2} />
      <Cut d={cutC(rectPts(doorX - ft * 0.9, base + fl * 0.45, doorW + ft * 1.8, fl * 0.55), 'step', 0.8, 12)} fill={OZ.woodDark} lift={1} edge={0.2} />
      {/* roof: front plane from the eave up to the ridge (ridge sits halfway back) */}
      <Cut
        d={cutC([[-ov, top + ft * 0.2], [L + ov, top + ft * 0.2], [L + ov + sx / 2, top + (oy * (sx / ox)) / 2 - rise], [-ov + sx / 2, top + (oy * (sx / ox)) / 2 - rise]], 'roof', 1.4, 24)}
        fill={OZ.roof}
        lift={2}
      />
      {/* shingle courses */}
      {Array.from({length: 7}, (_, i) => {
        const k = (i + 1) / 8;
        return (
          <line key={i} x1={-ov + (sx / 2) * k} y1={top + ft * 0.2 + ((oy * (sx / ox)) / 2 - rise - ft * 0.2) * k} x2={L + ov + (sx / 2) * k} y2={top + ft * 0.2 + ((oy * (sx / ox)) / 2 - rise - ft * 0.2) * k} stroke="rgba(25,22,20,0.35)" strokeWidth={Math.max(1, ft * 0.08)} />
        );
      })}
      {/* stovepipe through the roof */}
      <rect x={L * 0.62} y={top - rise * 0.9 - 3 * ft} width={ft * 0.5} height={3 * ft} fill="#2E2B28" />
      <rect x={L * 0.62 - ft * 0.12} y={top - rise * 0.9 - 3 * ft} width={ft * 0.74} height={ft * 0.3} fill="#232120" />
      {/* a thread of smoke on still days */}
      {t > 0 && <path d={`M${L * 0.62 + ft * 0.25} ${top - rise * 0.9 - 3 * ft} q${Math.sin(t) * 10} -30 ${ft * 0.6} -${ft * 2} t${ft * 0.8} -${ft * 2}`} stroke="rgba(220,220,214,0.35)" strokeWidth={ft * 0.5} fill="none" strokeLinecap="round" />}
    </g>
  );
};

// ---------- the windmill: Aermotor-type steel, 30 ft four-post tower, 8 ft wheel of 18 curved sails ----------
export const Windmill: React.FC<{x: number; y: number; ft: number; t: number; speed?: number}> = ({x, y, ft, t, speed = 0.6}) => {
  const Ht = 30 * ft;
  const b = 3 * ft; // half base
  const tp = 0.6 * ft; // half top
  const steel = '#8E9396';
  const legs: [number, number][] = [
    [-b, -tp],
    [b, tp],
  ];
  const braces = Array.from({length: 5}, (_, i) => {
    const k0 = i / 5;
    const k1 = (i + 1) / 5;
    const w0 = b + (tp - b) * k0;
    const w1 = b + (tp - b) * k1;
    return (
      <g key={i} stroke={steel} strokeWidth={Math.max(1, ft * 0.08)}>
        <line x1={-w0} y1={-Ht * k0} x2={w1} y2={-Ht * k1} />
        <line x1={w0} y1={-Ht * k0} x2={-w1} y2={-Ht * k1} />
        <line x1={-w1} y1={-Ht * k1} x2={w1} y2={-Ht * k1} />
      </g>
    );
  });
  const R = 4 * ft;
  const ang = t * speed * 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      {legs.map(([a, c], i) => (
        <line key={i} x1={a} y1={0} x2={c} y2={-Ht} stroke={steel} strokeWidth={Math.max(1.5, ft * 0.16)} />
      ))}
      {braces}
      {/* platform, gearbox, tail vane */}
      <rect x={-ft} y={-Ht - ft * 0.2} width={ft * 2} height={ft * 0.3} fill="#6F7477" />
      <rect x={-ft * 0.5} y={-Ht - ft * 1.4} width={ft * 1.4} height={ft * 1} fill="#7C8285" />
      <line x1={0} y1={-Ht - ft * 1} x2={-ft * 4.5} y2={-Ht - ft * 1} stroke={steel} strokeWidth={ft * 0.12} />
      <path d={`M${-ft * 4.5} ${-Ht - ft * 2.2} L${-ft * 8} ${-Ht - ft * 1.9} L${-ft * 8} ${-Ht - ft * 0.1} L${-ft * 4.5} ${-Ht + ft * 0.2} Z`} fill="#A9ADB0" stroke="#7C8285" strokeWidth={ft * 0.08} />
      {/* wheel, seen a little off-axis (ellipse) */}
      <g transform={`translate(${ft * 1.2} ${-Ht - ft * 0.9}) scale(0.55 1)`}>
        <circle r={R} fill="none" stroke={steel} strokeWidth={ft * 0.14} />
        <circle r={R * 0.45} fill="none" stroke={steel} strokeWidth={ft * 0.1} />
        {Array.from({length: 18}, (_, i) => (
          <g key={i} transform={`rotate(${ang + i * 20})`}>
            <path d={`M0 ${-R * 0.42} Q${R * 0.14} ${-R * 0.72} ${R * 0.05} ${-R}`} stroke="#B4B8BB" strokeWidth={ft * 0.55} fill="none" />
          </g>
        ))}
        <circle r={ft * 0.35} fill="#5B6063" />
      </g>
      {/* pump rod and stock tank */}
      <line x1={ft * 0.2} y1={-Ht} x2={ft * 0.2} y2={-ft} stroke="#5B6063" strokeWidth={ft * 0.08} />
      <Cut d={cutC(rectPts(-ft * 4, -2 * ft, ft * 8, 2 * ft), 'tank', 0.8, 14)} fill="#8E9396" lift={1} edge={0.25} />
      <rect x={-ft * 4} y={-2 * ft} width={ft * 8} height={ft * 0.3} fill="#6F7477" />
    </g>
  );
};

// A small frame shed with a lean-to roof (the cows' and horses' shelter).
export const Shed: React.FC<{x: number; y: number; ft: number}> = ({x, y, ft}) => {
  const L = 24 * ft;
  const Hh = 9 * ft;
  return (
    <g transform={`translate(${x} ${y})`}>
      <Cut d={cutC([[0, 0], [L, 0], [L, -Hh * 0.8], [0, -Hh]], 'shed', 1.2, 20)} fill={mix(OZ.wood, OZ.woodDark, 0.4)} lift={1} />
      {Array.from({length: 16}, (_, i) => (
        <line key={i} x1={(i * L) / 16} y1={0} x2={(i * L) / 16} y2={-Hh + (i / 16) * Hh * 0.2} stroke="rgba(30,24,18,0.3)" strokeWidth={Math.max(1, ft * 0.06)} />
      ))}
      <Cut d={cutC([[-ft, -Hh - ft * 0.4], [L + ft, -Hh * 0.8 - ft * 0.2], [L + ft, -Hh * 0.8 + ft * 0.4], [-ft, -Hh + ft * 0.2]], 'shedroof', 1, 20)} fill={OZ.roof} lift={2} />
      <rect x={L * 0.3} y={-Hh * 0.7} width={8 * ft} height={Hh * 0.7} fill="#2A2420" />
    </g>
  );
};

// Barbed-wire fence on Osage-orange posts: 4 ft high, 16.5 ft apart, three strands.
export const Fence: React.FC<{x0: number; x1: number; y: number; ft: number; y1?: number}> = ({x0, x1, y, ft, y1}) => {
  const n = Math.max(1, Math.round((x1 - x0) / (16.5 * ft)));
  const yy = (k: number) => y + ((y1 ?? y) - y) * k;
  return (
    <g>
      {[15, 28, 42].map((inch) => (
        <line key={inch} x1={x0} y1={yy(0) - (inch / 12) * ft} x2={x1} y2={yy(1) - (inch / 12) * ft} stroke="#4A433C" strokeWidth={Math.max(0.8, ft * 0.04)} strokeDasharray={`${ft * 0.4} ${ft * 0.1}`} />
      ))}
      {Array.from({length: n + 1}, (_, i) => {
        const k = i / n;
        const px = x0 + (x1 - x0) * k;
        return <Cut key={i} d={cutC([[px - ft * 0.2, yy(k)], [px + ft * 0.2, yy(k)], [px + ft * 0.15, yy(k) - 4 * ft], [px - ft * 0.25, yy(k) - 4.1 * ft]], `post${i}`, 0.6, 8)} fill="#6A5743" lift={1} edge={0.15} />;
      })}
    </g>
  );
};

// A cow in profile (about 5 ft at the shoulder, 8 ft long).
export const Cow: React.FC<{x: number; y: number; ft: number; flip?: boolean; t: number; col?: string}> = ({x, y, ft, flip, t, col = '#7A5A42'}) => {
  const s = ft;
  const head = Math.sin(t * 0.8) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {[-3, -2.2, 2.4, 3.1].map((lx, i) => (
        <rect key={i} x={lx - 0.25} y={-2.6} width={0.5} height={2.6} fill={i % 2 ? col : mix(col, '#000', 0.25)} />
      ))}
      <Cut d={cutC([[-4, -5], [-1, -5.3], [2.6, -5], [3.6, -4.2], [3.4, -2.6], [-3.6, -2.5], [-4.2, -3.6]], 'cowb', 0.08, 1)} fill={col} lift={0} edge={0} />
      <Cut d={cutC(ellipsePts(-1, -4, 1.1, 0.7, 10), 'cowspot', 0.05, 1)} fill="#EDE6D8" lift={0} edge={0} />
      <g transform={`translate(3.4 -4.6) rotate(${head + 20})`}>
        <Cut d={cutC([[0, -0.6], [1.6, -0.3], [2.2, 0.8], [1.6, 1.3], [0.2, 0.6]], 'cowh', 0.06, 1)} fill={col} lift={0} edge={0} />
        <path d="M0.4 -0.5 L0.1 -1.1 M0.9 -0.5 L1.1 -1.1" stroke="#E6DCC8" strokeWidth={0.15} />
      </g>
      <path d={`M-4 -4.6 Q-4.6 -3 -4.3 -1.6`} stroke={col} strokeWidth={0.18} fill="none" />
    </g>
  );
};

// A draft horse in profile, facing +x: about 5.3 ft at the withers, 8 ft nose to tail. Units are feet.
export const Horse: React.FC<{x: number; y: number; ft: number; flip?: boolean; t: number; rear?: number; walk?: number; col?: string}> = ({x, y, ft, flip, t, rear = 0, walk = 0, col = '#5B4030'}) => {
  const dark = mix(col, '#000', 0.3);
  const mane = '#2A1E16';
  const toss = Math.sin(t * 6) * 10 * rear;
  const ph = t * Math.PI * 2 * 0.7;
  // leg: hip/shoulder point, upper and lower angle (deg), drawn as two tapered segments plus a hoof
  const leg = (px: number, py: number, a: number, b: number, key: string, fill: string, hind: boolean) => (
    <g key={key} transform={`translate(${px} ${py}) rotate(${a})`}>
      <path d={hind ? 'M-0.42 0 L0.42 0 L0.22 1.5 L-0.2 1.5 Z' : 'M-0.36 0 L0.36 0 L0.2 1.35 L-0.2 1.35 Z'} fill={fill} />
      <g transform={`translate(0 ${hind ? 1.5 : 1.35}) rotate(${b})`}>
        <circle r={0.2} fill={fill} />
        <path d="M-0.18 0 L0.18 0 L0.14 1.25 L-0.14 1.25 Z" fill={fill} />
        <path d="M-0.22 1.25 L0.26 1.25 L0.3 1.55 L-0.24 1.55 Z" fill="#1C1814" />
      </g>
    </g>
  );
  const sw = (k: number) => Math.sin(ph + k) * 22 * walk;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -ft : ft} ${ft}) rotate(${-rear * 22} -3 -0.1)`}>
      <ellipse cx={0} cy={0} rx={4.2} ry={0.35} fill="rgba(30,20,10,0.2)" />
      {leg(-2.7, -3.4, sw(0) - rear * 10, Math.max(0, -sw(0)) * 0.8 + 6, 'hb', dark, true)}
      {leg(2.2, -3.6, sw(Math.PI) + rear * 50, 10 + rear * 70, 'fb', dark, false)}
      {/* barrel, chest and quarters */}
      <Cut d={cutC([[-3.5, -5.1], [-2.6, -5.5], [-0.6, -5.2], [1.6, -5.3], [2.5, -5.0], [3.1, -4.2], [3.0, -3.2], [2.4, -2.9], [0.4, -2.7], [-1.6, -2.8], [-2.9, -3.2], [-3.7, -4.0]], 'horseb', 0.05, 0.6)} fill={col} lift={0} edge={0} />
      {/* neck and head */}
      <g transform={`translate(2.4 -4.9) rotate(${toss})`}>
        <Cut d={cutC([[-0.6, 0.2], [0.2, -1.6], [0.8, -2.6], [1.3, -2.8], [2.6, -1.8], [2.8, -1.3], [2.4, -1.1], [1.4, -1.6], [1.0, -0.6], [0.8, 0.6]], 'horsen', 0.05, 0.6)} fill={col} lift={0} edge={0} />
        <path d="M0.2 -1.6 L0.8 -2.6 L1.0 -2.9" stroke={mane} strokeWidth={0.32} fill="none" strokeLinecap="round" />
        <path d="M-0.4 0.1 Q0 -1.0 0.5 -2.2" stroke={mane} strokeWidth={0.28} fill="none" />
        <circle cx={1.55} cy={-2.25} r={0.1} fill="#000" />
        <path d="M1.0 -2.9 L1.15 -3.3 L1.3 -2.85" fill={col} />
      </g>
      {/* tail */}
      <path d={`M-3.6 -4.8 Q${-4.5 + Math.sin(t * 2) * 0.3} -3.8 ${-4.1 + Math.sin(t * 2.4) * 0.2} -2.2`} stroke={mane} strokeWidth={0.42} fill="none" strokeLinecap="round" />
      {leg(-2.2, -3.4, -sw(0), Math.max(0, sw(0)) * 0.8 + 6, 'hf', col, true)}
      {leg(2.6, -3.6, -sw(Math.PI) + rear * 60, 10 + rear * 80, 'ff', col, false)}
    </g>
  );
};
