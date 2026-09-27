import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {TypeText, WordRise} from '../promo/motion';
import '../promo/fonts';

/*
 * Three candidate animated backgrounds for ColaOrigin (the user picks one).
 * Each sits on the same grid paper and stays quiet (8-25 % ink) so the 3D objects and
 * the type stay the focus. Shown with the "prohibition" scene's type for context.
 */
export const BG_DURATION = 150;
const INK = (a: number) => `rgba(38,38,42,${a})`;
const ACCENT = (a: number) => `rgba(122,46,14,${a})`;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const soft = Easing.bezier(0.33, 0, 0.15, 1); // gentle ease-out, no snap
const e01 = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: soft});

const Paper: React.FC = () => (
  <AbsoluteFill
    style={{
      background: '#f3f1ec',
      backgroundImage: `linear-gradient(${INK(0.06)} 2px, transparent 2px), linear-gradient(90deg, ${INK(0.06)} 2px, transparent 2px)`,
      backgroundSize: '70px 70px',
    }}
  />
);

/* ---------------------------------------------------------------- A. Drafting table */
// Technical line art draws itself around the subject: construction circles, a dimension
// line measuring the glass, crosshairs and a scrolling ruler. Echoes references 3, 5, 6.
const Drafting: React.FC<{f: number}> = ({f}) => {
  const draw = (a: number, b: number) => 1 - e01(f, a, b);
  const rot = f * 0.12;
  const cx = 540, cy = 1010;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={430} fill="none" stroke={INK(0.2)} strokeWidth={2} strokeDasharray="14 12" pathLength={1000} strokeDashoffset={1000 * draw(0, 45)} />
      </g>
      <circle cx={cx} cy={cy} r={300} fill="none" stroke={INK(0.14)} strokeWidth={1.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={draw(10, 55)} />
      <g transform={`rotate(${-rot * 1.6} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={360} fill="none" stroke={ACCENT(0.35)} strokeWidth={2} strokeDasharray="2 18" pathLength={1000} strokeDashoffset={1000 * draw(20, 70)} />
      </g>
      {/* crosshair through the subject */}
      <line x1={cx} y1={cy - 520 * e01(f, 5, 40)} x2={cx} y2={cy + 520 * e01(f, 5, 40)} stroke={INK(0.16)} strokeWidth={1.5} />
      <line x1={cx - 520 * e01(f, 5, 40)} y1={cy} x2={cx + 520 * e01(f, 5, 40)} y2={cy} stroke={INK(0.16)} strokeWidth={1.5} />
      {/* construction diagonals */}
      {[-1, 1].map((s) => (
        <line key={s} x1={cx} y1={cy} x2={cx + s * 700 * e01(f, 25, 70)} y2={cy - 700 * e01(f, 25, 70)} stroke={INK(0.1)} strokeWidth={1.5} strokeDasharray="6 8" />
      ))}
      {/* dimension line measuring the hero */}
      <g opacity={e01(f, 40, 60)}>
        <line x1={cx - 160} y1={cy + 330} x2={cx - 160 + 320 * e01(f, 45, 75)} y2={cy + 330} stroke={ACCENT(0.6)} strokeWidth={2} />
        <line x1={cx - 160} y1={cy + 312} x2={cx - 160} y2={cy + 348} stroke={ACCENT(0.6)} strokeWidth={2} />
        <line x1={cx + 160} y1={cy + 312} x2={cx + 160} y2={cy + 348} stroke={ACCENT(0.6)} strokeWidth={2} opacity={e01(f, 70, 76)} />
        <text x={cx} y={cy + 318} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={24} fill={ACCENT(0.8)} letterSpacing={2} opacity={e01(f, 72, 86)}>
          Ø 7.4 cm
        </text>
      </g>
      {/* registration marks */}
      {[[160, 560], [920, 560], [160, 1460], [920, 1460]].map(([x, y], i) => (
        <g key={i} opacity={e01(f, 30 + i * 5, 45 + i * 5)} transform={`rotate(${f * 0.5} ${x} ${y})`}>
          <line x1={x - 18} y1={y} x2={x + 18} y2={y} stroke={INK(0.3)} strokeWidth={2} />
          <line x1={x} y1={y - 18} x2={x} y2={y + 18} stroke={INK(0.3)} strokeWidth={2} />
          <circle cx={x} cy={y} r={9} fill="none" stroke={INK(0.3)} strokeWidth={1.5} />
        </g>
      ))}
      {/* ruler scrolling down the right edge */}
      <g transform={`translate(1040 ${-((f * 1.2) % 70)})`} opacity={0.9}>
        {Array.from({length: 60}).map((_, i) => (
          <line key={i} x1={0} x2={i % 5 === 0 ? -34 : -16} y1={i * 35} y2={i * 35} stroke={INK(0.22)} strokeWidth={1.5} />
        ))}
      </g>
    </svg>
  );
};

/* ---------------------------------------------------------------- B. Kinetic type */
// Giant outlined words drift in alternating rows behind the scene, like the ghost words
// in references 1 and 3, but alive. A soft light sweep passes every 2.5 s.
const Kinetic: React.FC<{f: number}> = ({f}) => {
  const rows = ['PROHIBITION', '1886', 'ATLANTA', 'NO WINE', 'SYRUP'];
  const fadeIn = e01(f, 0, 30);
  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <div style={{position: 'absolute', left: -600, top: -200, width: 2400, transform: 'rotate(-8deg)'}}>
        {rows.map((w, i) => {
          const dir = i % 2 ? 1 : -1;
          const x = dir * f * (1.4 + i * 0.25) - 400;
          return (
            <div
              key={i}
              style={{
                whiteSpace: 'nowrap',
                fontFamily: 'Poppins',
                fontWeight: 800,
                fontSize: 250,
                lineHeight: 1.08,
                letterSpacing: -6,
                color: i === 2 ? ACCENT(0.07) : 'transparent',
                WebkitTextStroke: `2.5px ${i === 2 ? ACCENT(0.22) : INK(0.13)}`,
                transform: `translateX(${x}px)`,
              }}
            >
              {Array.from({length: 4}).map(() => `${w} · `).join('')}
            </div>
          );
        })}
      </div>
      <AbsoluteFill
        style={{
          background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.75) 50%, transparent 65%)',
          transform: `translateX(${((f % 75) / 75) * 2400 - 1200}px)`,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- C. Fizz and ephemera */
// Outlined bubbles rise with depth (bigger = nearer = faster and softer), over a halftone
// dot field whose dots swell in a slow travelling wave. Ties the background to the drink.
const Fizz: React.FC<{f: number}> = ({f}) => {
  const fadeIn = e01(f, 0, 25);
  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 16 * 28}).map((_, i) => {
          const c = i % 16, r = Math.floor(i / 16);
          const x = 35 + c * 70, y = 35 + r * 70;
          const wave = Math.sin((x + y) / 260 - f / 14);
          const rad = 2 + 3.2 * Math.max(0, wave) ** 2;
          return <circle key={i} cx={x} cy={y} r={rad} fill={INK(0.1 + 0.08 * Math.max(0, wave))} />;
        })}
        <g transform={`rotate(${f * 0.25} 540 1010)`}>
          <circle cx={540} cy={1010} r={400} fill="none" stroke={ACCENT(0.3)} strokeWidth={2} strokeDasharray="3 16" />
        </g>
      </svg>
      {Array.from({length: 34}).map((_, i) => {
        const depth = random(`d${i}`); // 0 far .. 1 near
        const size = 18 + depth * 110;
        const speed = 1.2 + depth * 4.5;
        const x0 = random(`x${i}`) * 1080;
        const y = 2050 - ((f * speed + random(`y${i}`) * 2200) % 2300);
        const x = x0 + Math.sin(f / (18 + depth * 10) + i) * (8 + depth * 22);
        const filled = random(`f${i}`) > 0.8;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              border: `${1.5 + depth * 2}px solid ${filled ? ACCENT(0.35) : INK(0.2 - depth * 0.08)}`,
              background: filled ? ACCENT(0.08) : 'radial-gradient(circle at 32% 30%, rgba(255,255,255,0.9) 0 8%, transparent 9%)',
              filter: `blur(${depth > 0.7 ? (depth - 0.7) * 14 : 0}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- preview frame */
const Scene: React.FC<{f: number; label: string}> = ({f, label}) => (
  <>
    <div style={{position: 'absolute', left: 90, right: 90, top: 150}}>
      <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 24, letterSpacing: '0.3em', color: '#7a7a80'}}>ATLANTA · 1886</div>
      <div style={{fontFamily: 'Caveat', fontWeight: 600, fontSize: 66, color: INK(1), marginTop: 14}}>
        <TypeText text="then the city voted" start={8} cps={1.8} />
      </div>
      <div style={{fontFamily: 'Inter', fontWeight: 800, fontStyle: 'italic', fontSize: 96, lineHeight: 1.02, letterSpacing: -2, color: INK(1)}}>
        <WordRise words={['to', 'ban', 'alcohol']} start={18} gap={5} />
      </div>
    </div>
    <div style={{position: 'absolute', left: 90, right: 90, top: 1560, fontFamily: 'Inter', fontWeight: 500, fontSize: 36, color: '#3a3a3e'}}>
      <TypeText text="So he remade the tonic as a syrup, without the wine." start={30} cps={3} trail={4} />
    </div>
    <div style={{position: 'absolute', right: 40, bottom: 40, fontFamily: 'Inter', fontWeight: 800, fontSize: 30, letterSpacing: '0.2em', color: '#fff', background: INK(0.85), padding: '10px 22px', borderRadius: 8}}>
      {label}
    </div>
  </>
);

const make = (Bg: React.FC<{f: number}>, label: string): React.FC => () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper />
      <Bg f={f} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 62%, rgba(60,50,40,0.14) 100%)'}} />
      <Scene f={f} label={label} />
    </AbsoluteFill>
  );
};

export const BgDrafting = make(Drafting, 'A · DRAFTING');
export const BgKinetic = make(Kinetic, 'B · KINETIC TYPE');
export const BgFizz = make(Fizz, 'C · FIZZ');
