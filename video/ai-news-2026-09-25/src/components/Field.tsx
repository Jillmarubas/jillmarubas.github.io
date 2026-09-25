import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {noise2D} from '@remotion/noise';
import {useT} from '../lib/anim';
import {PARAS} from '../lib/timeline';

// The frost glass field: six radial blooms over a warm floor, drifting slowly,
// with grain so the wide gradients never band. Same stops as frost-glass-layer.html.
const BLOOMS = [
  {x: 12, y: 8, w: 44, h: 38, rgb: [250, 90, 5], a: 0.62},
  {x: 84, y: 12, w: 40, h: 34, rgb: [255, 162, 58], a: 0.44},
  {x: 78, y: 54, w: 42, h: 38, rgb: [214, 31, 90], a: 0.42},
  {x: 16, y: 60, w: 40, h: 34, rgb: [124, 58, 190], a: 0.36},
  {x: 54, y: 92, w: 46, h: 40, rgb: [250, 90, 5], a: 0.44},
  {x: 50, y: 44, w: 70, h: 60, rgb: [250, 90, 5], a: 0.16},
];

// Per-story mood: multipliers on the six blooms. The enzyme leans violet, the money
// story amber, the UN story magenta, so each segment reads differently at a glance.
const MOODS: number[][] = [
  [1, 1, 1, 1, 1, 1], // hook
  [1.1, 1.1, 0.8, 0.8, 1.1, 1.2], // price war
  [0.7, 0.6, 1.1, 1.6, 0.8, 0.8], // enzyme
  [1, 1.2, 1.2, 1, 1, 1], // meta
  [0.8, 0.9, 1, 1.4, 1, 0.9], // gemini
  [1.1, 1.5, 0.7, 0.7, 1.2, 1.3], // island
  [0.8, 0.6, 1.5, 1.2, 0.8, 0.9], // UN
  [1, 1, 1, 1, 1, 1], // outro
];

const moodAt = (t: number) => {
  let i = 0;
  while (i < PARAS.length - 1 && t >= PARAS[i + 1].start - 0.4) i++;
  const next = MOODS[i];
  const prev = MOODS[Math.max(0, i - 1)];
  const p = interpolate(t, [PARAS[i].start - 0.4, PARAS[i].start + 1.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return next.map((v, k) => prev[k] + (v - prev[k]) * p);
};

// The field is nothing but soft gradients, so it is painted at quarter resolution
// and scaled up: indistinguishable on screen, and about four times cheaper to render.
const CW = 351; // 130% of 1080, / 4
const CH = 624; // 130% of 1920, / 4

const paint = (ctx: CanvasRenderingContext2D, t: number) => {
  const mood = moodAt(t);
  // warm floor, 160deg
  const ang = (160 * Math.PI) / 180;
  const dx = Math.sin(ang);
  const dy = -Math.cos(ang);
  const half = (Math.abs(CW * dx) + Math.abs(CH * dy)) / 2;
  const floor = ctx.createLinearGradient(CW / 2 - dx * half, CH / 2 - dy * half, CW / 2 + dx * half, CH / 2 + dy * half);
  floor.addColorStop(0, '#1a0d05');
  floor.addColorStop(0.45, '#0d0a08');
  floor.addColorStop(1, '#140a10');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = floor;
  ctx.fillRect(0, 0, CW, CH);
  // blooms, last to first so the first (the brightest) sits on top, as in CSS
  for (let i = BLOOMS.length - 1; i >= 0; i--) {
    const b = BLOOMS[i];
    const cx = ((b.x + noise2D(`x${i}`, t * 0.035, 0) * 7) / 100) * CW;
    const cy = ((b.y + noise2D(`y${i}`, 0, t * 0.035) * 6) / 100) * CH;
    const rx = (b.w / 100) * CW;
    const ry = (b.h / 100) * CH;
    const a = Math.min(0.85, b.a * mood[i]);
    const [r, g, bl] = b.rgb;
    ctx.setTransform(rx, 0, 0, ry, cx, cy);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    grad.addColorStop(0, `rgba(${r},${g},${bl},${a})`);
    grad.addColorStop(0.7, `rgba(${r},${g},${bl},0)`);
    grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(-1, -1, 2, 2);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

export const Field: React.FC = () => {
  const t = useT();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) paint(ctx, t);
  }, [t]);
  // the 52s drift from the CSS keyframes, as a function of time
  const drift = (Math.sin((t / 52) * Math.PI) + 1) / 2;
  return (
    <AbsoluteFill className="field" style={{background: '#0a0a0a', overflow: 'hidden'}}>
      <canvas
        ref={ref}
        width={CW}
        height={CH}
        style={{
          position: 'absolute',
          left: '-15%',
          top: '-15%',
          width: '130%',
          height: '130%',
          transform: `translate3d(${2.5 * drift}%, ${-2.5 * drift}%, 0) scale(${1 + 0.08 * drift})`,
        }}
      />
      {/* vignette, so the frame edges settle into the dark */}
      <AbsoluteFill style={{background: 'radial-gradient(120% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.5) 100%)'}} />
      <AbsoluteFill
        style={{
          // static grain: animated grain would double the file size for no visible gain at this opacity
          opacity: 0.03,
          backgroundImage: `url(${staticFile('img/grain.png')})`,
          backgroundRepeat: 'repeat',
        }}
      />
      {/* keeps the grain tile preloaded so the first frame has it */}
      <Img src={staticFile('img/grain.png')} style={{display: 'none'}} />
    </AbsoluteFill>
  );
};
