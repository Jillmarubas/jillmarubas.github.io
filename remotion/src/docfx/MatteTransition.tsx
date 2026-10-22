import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {E, clamp, fbmField, sstep} from './util';

/**
 * Matte transition between two shots (a luma-matte transition built from procedural noise, so
 * no stock clip is needed).
 *
 * kind 'ink'      : an organic black ink/smoke front sweeps across (default left → right) and
 *                   the next shot appears behind it. Reference 7: about 0.3 s.
 * kind 'dissolve' : a fine-grain "melt" dissolve (statue → photo, legend → man). About 0.3 s.
 *
 * Both shots must be passed in; only `from` renders before `at`, only `to` after `at + dur`.
 */
const GW = 192;
const GH = 108;

export const MatteTransition: React.FC<{
  from: React.ReactNode;
  to: React.ReactNode;
  at: number;
  dur?: number;
  kind?: 'ink' | 'dissolve';
  direction?: 'lr' | 'rl' | 'tb' | 'bt';
  inkColor?: string;
  seed?: number;
}> = ({from, to, at, dur, kind = 'ink', direction = 'lr', inkColor = '#050505', seed = 11}) => {
  const {fps} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const d = dur ?? (kind === 'ink' ? 0.35 : 0.3);

  // Field: low values clear first. Ink = direction bias + big blobs; dissolve = fine grain.
  const field = useMemo(() => {
    const n = fbmField(GW, GH, seed, kind === 'ink' ? 22 : 5, kind === 'ink' ? 5 : 3);
    const f = new Float32Array(GW * GH);
    for (let y = 0; y < GH; y++)
      for (let x = 0; x < GW; x++) {
        const u = x / (GW - 1);
        const v = y / (GH - 1);
        const g = direction === 'lr' ? u : direction === 'rl' ? 1 - u : direction === 'tb' ? v : 1 - v;
        const i = y * GW + x;
        f[i] = kind === 'ink' ? 0.62 * g + 0.38 * n[i] : n[i];
      }
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of f) {
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
    for (let i = 0; i < f.length; i++) f[i] = (f[i] - lo) / (hi - lo);
    return f;
  }, [seed, kind, direction]);

  if (t < at) return <AbsoluteFill>{from}</AbsoluteFill>;
  if (t >= at + d) return <AbsoluteFill>{to}</AbsoluteFill>;

  const band = kind === 'ink' ? 0.09 : 0;
  const soft = kind === 'ink' ? 0.025 : 0.08;
  const p = -band - soft + (1 + 2 * band + 2 * soft) * E.inOut(clamp((t - at) / d));

  const mask = (fn: (v: number) => number) => {
    const c = document.createElement('canvas');
    c.width = GW;
    c.height = GH;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(GW, GH);
    for (let i = 0; i < field.length; i++) {
      img.data[i * 4 + 3] = Math.round(255 * fn(field[i]));
    }
    ctx.putImageData(img, 0, 0);
    return `url(${c.toDataURL()})`;
  };
  const maskStyle = (url: string): React.CSSProperties => ({
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
  });

  const fromMask = mask((v) => sstep(p + band, p + band + soft, v));
  const inkMask = band > 0 ? mask((v) => sstep(p - soft, p, v) * (1 - sstep(p + band, p + band + soft, v))) : '';

  return (
    <AbsoluteFill>
      <AbsoluteFill>{to}</AbsoluteFill>
      <AbsoluteFill style={maskStyle(fromMask)}>{from}</AbsoluteFill>
      {inkMask && <AbsoluteFill style={{background: inkColor, ...maskStyle(inkMask)}} />}
    </AbsoluteFill>
  );
};
