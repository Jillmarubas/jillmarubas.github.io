import React from 'react';
import {evolvePath} from '@remotion/paths';
import {noise2D} from '@remotion/noise';
import {C, D, E, F} from '../theme';
import {mix, prog, useBeat, useT} from '../lib/anim';

/** A DNA double helix drawn from two phased sine strands. `scan` sweeps a highlight along it;
 *  `repeats` paints the highlighted stretch as a CRISPR-style repeat/spacer array. */
export const Helix: React.FC<{width?: number; height?: number; scanAt?: number; repeats?: number; style?: React.CSSProperties}> = ({
  width = 940,
  height = 300,
  scanAt,
  repeats,
  style,
}) => {
  const t = useT();
  const {from} = useBeat();
  const reveal = prog(t, from, 1.1, E.glide);
  const N = 44;
  const amp = height * 0.34;
  const cy = height / 2;
  const phase = t * 1.6;
  const scan = scanAt === undefined ? -1 : prog(t, scanAt, 1.4, E.glide);
  const hi0 = 0.52;
  const hi1 = 0.78;
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    if (u > reveal) break;
    const x = 20 + u * (width - 40);
    const a = u * Math.PI * 4.2 + phase;
    const yA = cy + amp * Math.sin(a);
    const yB = cy - amp * Math.sin(a);
    const zA = Math.cos(a);
    const inHi = scan >= 0 && u >= hi0 && u <= hi1 && scan > (u - hi0) / (hi1 - hi0);
    const repeatColor = repeats && inHi ? (Math.floor(((u - hi0) / (hi1 - hi0)) * repeats * 2) % 2 === 0 ? C.accent : C.amber) : null;
    const col = repeatColor ?? (inHi ? C.accent : 'rgba(243,239,233,.8)');
    dots.push(
      <g key={i}>
        <line x1={x} y1={yA} x2={x} y2={yB} stroke={inHi ? 'rgba(250,90,5,.7)' : 'rgba(255,255,255,.16)'} strokeWidth={inHi ? 4 : 3} />
        <circle cx={x} cy={yA} r={7 + 3 * zA} fill={col} opacity={0.55 + 0.45 * zA} />
        <circle cx={x} cy={yB} r={7 - 3 * zA} fill={col} opacity={0.55 - 0.45 * zA + 0.3} />
      </g>,
    );
  }
  const scanX = 20 + mix(hi0, hi1, Math.min(1, scan)) * (width - 40);
  return (
    <svg width={width} height={height} style={{overflow: 'visible', ...style}}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow)">{dots}</g>
      {scan > 0 && scan < 1 ? <rect x={scanX - 3} y={-20} width={6} height={height + 40} rx={3} fill={C.accentHover} opacity={0.9} /> : null}
      {scan >= 1 ? (
        <rect
          x={20 + hi0 * (width - 40) - 18}
          y={-24}
          width={(hi1 - hi0) * (width - 40) + 36}
          height={height + 48}
          rx={22}
          fill="rgba(250,90,5,.08)"
          stroke={C.accent}
          strokeWidth={3}
          strokeDasharray="14 10"
          strokeDashoffset={-t * 40}
        />
      ) : null}
    </svg>
  );
};

/** 950 agents as a 38 x 25 grid, lighting up in a wave and flickering while they search. */
export const AgentGrid: React.FC<{at: number}> = ({at}) => {
  const t = useT();
  const cols = 38;
  const rows = 25;
  const cell = 22;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wave = prog(t, at + (c + r * 0.6) * 0.022, 0.3);
      const flicker = 0.55 + 0.45 * noise2D('a', c * 0.35 + t * 1.3, r * 0.35);
      const hot = noise2D('h', c * 0.2, r * 0.2 + t * 0.4) > 0.62;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={c * cell}
          y={r * cell}
          width={12}
          height={12}
          rx={3}
          fill={hot ? C.accentHover : C.text}
          opacity={wave * (hot ? 1 : 0.22 + 0.5 * flicker)}
        />,
      );
    }
  }
  return (
    <svg width={cols * cell} height={rows * cell}>
      {cells}
    </svg>
  );
};

/** Three stages narrowing: 200,000 -> 3,500 -> 20. */
export const Funnel: React.FC<{at: number; steps: {label: string; value: string; w: number}[]; stepGap?: number}> = ({at, steps, stepGap = 0.5}) => {
  const t = useT();
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
      {steps.map((s, i) => {
        const p = prog(t, at + i * stepGap, D.slow);
        const last = i === steps.length - 1;
        return (
          <div
            key={i}
            style={{
              width: mix(s.w * 1.25, s.w, p),
              height: 128,
              borderRadius: 24,
              background: last ? 'linear-gradient(180deg, rgba(250,90,5,.95), rgba(194,69,10,.9))' : 'rgba(255,255,255,.06)',
              border: `2px solid ${last ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.16)'}`,
              boxShadow: last ? '0 20px 60px rgba(250,90,5,.35)' : 'inset 0 2px 0 rgba(255,255,255,.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
              opacity: p,
              filter: p < 0.999 ? `blur(${(1 - p) * 8}px)` : undefined,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 72, color: last ? '#0a0a0a' : C.text, letterSpacing: '-.03em'}}>{s.value}</span>
            {s.label ? <span style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '.1em', color: last ? 'rgba(10,10,10,.75)' : C.faint, textTransform: 'uppercase'}}>{s.label}</span> : null}
          </div>
        );
      })}
    </div>
  );
};

const GLASSES =
  'M40 90 C40 50 70 40 130 40 L250 40 C300 40 320 55 320 95 C320 150 290 170 230 170 L150 170 C80 170 40 145 40 90 Z ' +
  'M320 80 C350 62 390 62 420 80 ' +
  'M420 95 C420 55 440 40 490 40 L610 40 C670 40 700 50 700 90 C700 145 660 170 590 170 L510 170 C450 170 420 150 420 95 Z ' +
  'M40 70 L0 60 M700 70 L740 60';

/** Glasses as one drawn line. */
export const GlassesDraw: React.FC<{at: number; scale?: number}> = ({at, scale = 1}) => {
  const t = useT();
  const p = prog(t, at, 1.2, E.glide);
  const {strokeDasharray, strokeDashoffset} = evolvePath(p, GLASSES);
  const lens = prog(t, at + 0.9, D.slow);
  return (
    <svg width={740 * scale} height={210 * scale} viewBox="-4 20 748 170" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(250,90,5,.35)" />
          <stop offset="1" stopColor="rgba(124,58,190,.25)" />
        </linearGradient>
      </defs>
      <path d="M40 90 C40 50 70 40 130 40 L250 40 C300 40 320 55 320 95 C320 150 290 170 230 170 L150 170 C80 170 40 145 40 90 Z" fill="url(#lens)" opacity={lens} />
      <path d="M420 95 C420 55 440 40 490 40 L610 40 C670 40 700 50 700 90 C700 145 660 170 590 170 L510 170 C450 170 420 150 420 95 Z" fill="url(#lens)" opacity={lens} />
      <path d={GLASSES} fill="none" stroke={C.text} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
      {/* a highlight glint across the lenses once they're drawn */}
      <clipPath id="lenses">
        <path d="M40 90 C40 50 70 40 130 40 L250 40 C300 40 320 55 320 95 C320 150 290 170 230 170 L150 170 C80 170 40 145 40 90 Z M420 95 C420 55 440 40 490 40 L610 40 C670 40 700 50 700 90 C700 145 660 170 590 170 L510 170 C450 170 420 150 420 95 Z" />
      </clipPath>
      <g clipPath="url(#lenses)">
        <rect x={mix(-120, 780, prog(t, at + 1.3, 0.9, E.glide))} y={0} width={46} height={220} fill="rgba(255,255,255,.28)" transform="skewX(-20)" opacity={lens} />
      </g>
    </svg>
  );
};

/** Muse Charm: a pebble on a key ring, swinging and glowing. Illustrative, not the product. */
export const Charm: React.FC<{at: number}> = ({at}) => {
  const t = useT();
  const p = prog(t, at, D.hero);
  const swing = Math.sin((t - at) * 2.6) * 14 * Math.exp(-Math.max(0, t - at) * 0.35) + Math.sin(t * 1.3) * 2;
  const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
  return (
    <div style={{width: 360, height: 460, position: 'relative', opacity: p, transform: `translateY(${(1 - p) * -120}px)`}}>
      <svg width={360} height={460} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g transform={`rotate(${swing} 180 40)`}>
          <circle cx={180} cy={60} r={42} fill="none" stroke="rgba(243,239,233,.8)" strokeWidth={9} />
          <rect x={172} y={100} width={16} height={46} rx={8} fill="rgba(243,239,233,.7)" />
          <ellipse cx={180} cy={290} rx={130} ry={150} fill="url(#peb)" stroke="rgba(255,255,255,.35)" strokeWidth={3} />
          <ellipse cx={180} cy={290} rx={62 + pulse * 8} ry={62 + pulse * 8} fill="none" stroke={C.accentHover} strokeWidth={6} opacity={0.5 + 0.5 * pulse} filter="url(#cg)" />
          <circle cx={180} cy={290} r={18} fill={C.accentHover} filter="url(#cg)" />
          <ellipse cx={130} cy={200} rx={40} ry={22} fill="rgba(255,255,255,.18)" transform="rotate(-30 130 200)" />
        </g>
        <defs>
          <radialGradient id="peb" cx="0.4" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#3a302a" />
            <stop offset="1" stopColor="#120e0b" />
          </radialGradient>
          <filter id="cg">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

const SHIELD = 'M200 20 L360 80 L360 200 C360 300 290 360 200 400 C110 360 40 300 40 200 L40 80 Z';

/** A shield drawing itself, with "AI" attacks bouncing off it. */
export const Shield: React.FC<{at: number}> = ({at}) => {
  const t = useT();
  const p = prog(t, at, 1, E.glide);
  const {strokeDasharray, strokeDashoffset} = evolvePath(p, SHIELD);
  const fill = prog(t, at + 0.7, D.slow);
  const attacks = [0, 1, 2].map((k) => {
    const start = at + 0.9 + k * 0.45;
    const a = prog(t, start, 0.35, E.depart);
    const b = prog(t, start + 0.35, 0.5, E.settle);
    const side = k % 2 === 0 ? -1 : 1;
    const y = 120 + k * 90;
    const x = t < start + 0.35 ? mix(side * 360, side * 190, a) : mix(side * 190, side * 330, b);
    const op = t < start ? 0 : t < start + 0.35 ? a : 1 - b;
    return (
      <div key={k} style={{position: 'absolute', left: 200 + x - 50, top: y, width: 100, textAlign: 'center', fontFamily: F.mono, fontWeight: 600, fontSize: 34, color: C.danger, opacity: op}}>
        AI
      </div>
    );
  });
  return (
    <div style={{position: 'relative', width: 400, height: 420}}>
      <svg width={400} height={420} style={{overflow: 'visible'}}>
        <path d={SHIELD} fill={`rgba(250,90,5,${0.18 * fill})`} stroke={C.accentHover} strokeWidth={10} strokeLinejoin="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
        <text x={200} y={240} textAnchor="middle" fontFamily="Archivo" fontWeight={900} fontSize={110} fill={C.text} opacity={fill}>
          AI
        </text>
      </svg>
      {attacks}
    </div>
  );
};

/** A wireframe globe, turning slowly. */
export const Globe: React.FC<{size?: number}> = ({size = 420}) => {
  const t = useT();
  const {from} = useBeat();
  const p = prog(t, from, D.hero);
  const r = size / 2 - 6;
  const rot = t * 0.5;
  const meridians = Array.from({length: 7}, (_, i) => {
    const a = (i / 7) * Math.PI + rot;
    return <ellipse key={i} cx={size / 2} cy={size / 2} rx={Math.abs(Math.cos(a)) * r} ry={r} fill="none" stroke="rgba(243,239,233,.35)" strokeWidth={2} />;
  });
  const parallels = [-0.66, -0.33, 0, 0.33, 0.66].map((k, i) => (
    <ellipse key={i} cx={size / 2} cy={size / 2 + k * r} rx={Math.sqrt(1 - k * k) * r} ry={Math.sqrt(1 - k * k) * r * 0.18} fill="none" stroke="rgba(243,239,233,.25)" strokeWidth={2} />
  ));
  return (
    <svg width={size} height={size} style={{opacity: p, transform: `scale(${mix(0.85, 1, p)})`}}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(214,31,90,.10)" stroke={C.accentHover} strokeWidth={4} />
      {meridians}
      {parallels}
    </svg>
  );
};

/** A three-stop pipeline with the current stage pulsing. */
export const Pipeline: React.FC<{at: number; steps: {label: string; sub: string}[]; current: number}> = ({at, steps, current}) => {
  const t = useT();
  const fill = prog(t, at + 0.2, 1.2, E.glide);
  const W = 900;
  const xs = steps.map((_, i) => 150 + (i * (W - 300)) / (steps.length - 1));
  const reach = mix(xs[0], xs[current], fill);
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <div style={{position: 'relative', width: W, height: 260}}>
      <div style={{position: 'absolute', left: xs[0], right: W - xs[xs.length - 1], top: 58, height: 8, borderRadius: 8, background: 'rgba(255,255,255,.12)'}} />
      <div style={{position: 'absolute', left: xs[0], width: reach - xs[0], top: 58, height: 8, borderRadius: 8, background: C.accent, boxShadow: '0 0 20px rgba(250,90,5,.8)'}} />
      {steps.map((s, i) => {
        const on = reach >= xs[i] - 1;
        const isCur = i === current;
        const pp = prog(t, at + i * 0.12, D.base);
        return (
          <div key={i} style={{position: 'absolute', left: xs[i] - 150, width: 300, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: pp}}>
            <div
              style={{
                width: 124,
                height: 124,
                borderRadius: 124,
                display: 'grid',
                placeItems: 'center',
                background: on ? (isCur ? C.accent : 'rgba(61,220,132,.16)') : 'rgba(255,255,255,.06)',
                border: `3px solid ${on ? (isCur ? 'rgba(255,255,255,.4)' : C.success) : C.rim}`,
                boxShadow: isCur && on ? `0 0 ${30 + 30 * pulse}px rgba(250,90,5,.7)` : undefined,
                transform: 'translateY(-4px)',
                fontFamily: F.display,
                fontWeight: 900,
                fontSize: 44,
                color: on ? (isCur ? '#0a0a0a' : C.success) : C.faint,
              }}
            >
              {on && !isCur ? '✓' : isCur && on ? '●' : '?'}
            </div>
            <div style={{marginTop: 22, fontFamily: F.display, fontWeight: 800, fontSize: 36, color: C.text, textAlign: 'center'}}>{s.label}</div>
            <div style={{marginTop: 8, fontFamily: F.mono, fontSize: 22, letterSpacing: '.1em', color: isCur ? C.accentHover : C.faint, textTransform: 'uppercase'}}>{s.sub}</div>
          </div>
        );
      })}
    </div>
  );
};
