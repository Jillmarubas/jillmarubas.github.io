import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {hash01, kf} from './util';
import type {Key} from './util';

/**
 * Money / coin / paper rain with depth: near pieces are big, fast and out of focus, far ones
 * small and soft, and fast pieces get a 180° motion-blur smear. Reference 7: bills fall and fly
 * toward the lens; thickened, the rain becomes a particle wipe into the next shot.
 *
 * `density` is keyframes of 0..1 over local seconds, e.g. [[0, 0.3], [3, 0.3], [3.6, 1]] to
 * thicken into a wipe. Drawn on one 2D canvas, deterministic per frame.
 * The bill is a generic note drawn in code (no real currency design).
 */
type Kind = 'bill' | 'coin' | 'paper';

const makeSprite = (kind: Kind, blur: number) => {
  const pad = Math.ceil(blur * 2.5) + 2;
  const w = kind === 'coin' ? 120 : 240;
  const h = kind === 'coin' ? 120 : kind === 'bill' ? 108 : 150;
  const c = document.createElement('canvas');
  c.width = w + pad * 2;
  c.height = h + pad * 2;
  const g = c.getContext('2d')!;
  g.filter = blur > 0 ? `blur(${blur}px)` : 'none';
  g.translate(pad, pad);
  if (kind === 'bill') {
    g.fillStyle = '#b9c7a3';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#5f7350';
    g.lineWidth = 6;
    g.strokeRect(8, 8, w - 16, h - 16);
    g.lineWidth = 2;
    g.strokeRect(16, 16, w - 32, h - 32);
    g.fillStyle = '#8fa27c';
    g.beginPath();
    g.ellipse(w / 2, h / 2, 30, 36, 0, 0, Math.PI * 2);
    g.fill();
    for (const [x, y] of [[34, 30], [w - 34, 30], [34, h - 30], [w - 34, h - 30]]) {
      g.beginPath();
      g.arc(x, y, 12, 0, Math.PI * 2);
      g.stroke();
    }
  } else if (kind === 'coin') {
    const gr = g.createRadialGradient(w * 0.38, h * 0.35, 4, w / 2, h / 2, w / 2);
    gr.addColorStop(0, '#fff1b8');
    gr.addColorStop(0.45, '#e2b04a');
    gr.addColorStop(1, '#8a5a12');
    g.fillStyle = gr;
    g.beginPath();
    g.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#6e4510';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(w / 2, h / 2, w / 2 - 14, 0, Math.PI * 2);
    g.stroke();
  } else {
    g.fillStyle = '#ece4d2';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#9b927f';
    for (let y = 22; y < h - 14; y += 14) g.fillRect(16, y, w - 32 - (y % 28 ? 30 : 0), 3);
  }
  return c;
};

export const ParticleRain: React.FC<{
  kind?: Kind;
  count?: number;
  density?: Key[]; // 0..1 over local seconds
  mode?: 'fall' | 'toward';
  seed?: number;
  focusZ?: number; // depth in focus (1 = mid)
  speed?: number;
}> = ({kind = 'bill', count = 140, density = [[0, 1]], mode = 'fall', seed = 3, focusZ = 1.2, speed = 1}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const {fps, width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const sprites = useMemo(() => [0, 3, 8, 16].map((b) => makeSprite(kind, b)), [kind]);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext('2d')!;
    g.clearRect(0, 0, width, height);
    const t = frame / fps;
    const active = Math.round(count * Math.max(0, Math.min(1, kf(t, density))));
    const f = height * 0.9; // focal length in px
    const shutter = 0.5 / fps; // 180° shutter
    // Draw far first.
    type Item = {i: number; r: (k: number) => number; life: number; z0: number; age: number};
    const items: Item[] = [];
    for (let i = 0; i < active; i++) {
      const r = (k: number) => hash01(i, k, seed);
      const life = (mode === 'fall' ? 2.6 : 2.0) / speed * (0.8 + 0.4 * r(1));
      const z0 = mode === 'fall' ? 0.35 + 2.8 * r(2) : 3.5 + 1.5 * r(2);
      const age = (t + r(3) * life) % life;
      items.push({i, r, life, z0, age});
    }
    const pos = (it: Item, age: number) => {
      const {r, life, z0} = it;
      const u = age / life;
      const x = (r(4) - 0.5) * 3.2 + 0.12 * Math.sin(age * (2 + 3 * r(5)) + r(6) * 6.28);
      let y;
      let z = z0;
      if (mode === 'fall') {
        y = -1.1 + 2.4 * u;
      } else {
        z = z0 * (1 - u) + 0.15 * u;
        y = (r(7) - 0.5) * 1.6 + 0.6 * u;
      }
      return {sx: width / 2 + (x * f) / z, sy: height / 2 + (y * f) / z, z, rot: r(8) * 6.28 + age * (r(9) - 0.5) * 6, flip: Math.cos(age * (1 + 4 * r(10)) + r(11) * 6.28)};
    };
    items
      .map((it) => ({it, z: pos(it, it.age).z}))
      .sort((a, b) => b.z - a.z)
      .forEach(({it}) => {
        const p0 = pos(it, it.age);
        const p1 = pos(it, it.age + shutter);
        const v = Math.hypot(p1.sx - p0.sx, p1.sy - p0.sy);
        const dof = Math.abs(1 / p0.z - 1 / focusZ);
        const spr = sprites[dof < 0.25 ? 0 : dof < 0.7 ? 1 : dof < 1.6 ? 2 : 3];
        const scale = (0.32 / p0.z) * (kind === 'coin' ? 0.8 : 1);
        const samples = v > 6 ? 4 : 1;
        for (let s = 0; s < samples; s++) {
          const p = samples === 1 ? p0 : pos(it, it.age + (shutter * s) / (samples - 1));
          g.save();
          g.globalAlpha = (samples === 1 ? 1 : 0.4) * Math.min(1, p.z / 0.3);
          g.translate(p.sx, p.sy);
          g.rotate(p.rot);
          g.scale(scale, scale * (kind === 'coin' ? Math.abs(p.flip) * 0.8 + 0.2 : 0.35 + 0.65 * Math.abs(p.flip)));
          g.drawImage(spr, -spr.width / 2, -spr.height / 2);
          g.restore();
        }
      });
  }, [frame, fps, width, height, count, density, mode, seed, sprites, focusZ, kind, speed]);

  return (
    <AbsoluteFill>
      <canvas ref={ref} width={width} height={height} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
