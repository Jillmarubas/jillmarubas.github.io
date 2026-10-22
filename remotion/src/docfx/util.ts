// Shared helpers for the documentary effects. Everything is a pure function of time and a seed,
// so frames render the same in any order (Remotion renders frames out of order).
export {E, clamp, lerp, p01, tw, kf} from '../cc1003/ae';
export type {Key, EaseFn} from '../cc1003/ae';

/** Seeded PRNG (mulberry32). Never use Math.random in a render. */
export const rng = (seed: number) => {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Stable hash of a few integers to 0..1 (for per-item, per-frame randomness). */
export const hash01 = (...n: number[]) => {
  let h = 2166136261;
  for (const v of n) {
    h ^= v | 0;
    h = Math.imul(h, 16777619);
    h ^= h >>> 13;
  }
  return ((h >>> 0) % 100000) / 100000;
};

/** Smoothstep. */
export const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Fractal value noise on a w×h grid, values ~0..1. Computed once per seed (useMemo it).
 * `scale` = size of the largest blobs in grid cells.
 */
export const fbmField = (w: number, h: number, seed: number, scale = 40, octaves = 4) => {
  const out = new Float32Array(w * h);
  const lattice = (ix: number, iy: number, o: number) => hash01(ix, iy, o, seed);
  let amp = 1;
  let total = 0;
  let s = scale;
  for (let o = 0; o < octaves; o++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const fx = x / s;
        const fy = y / s;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = fx - x0;
        const ty = fy - y0;
        const ux = tx * tx * (3 - 2 * tx);
        const uy = ty * ty * (3 - 2 * ty);
        const a = lattice(x0, y0, o);
        const b = lattice(x0 + 1, y0, o);
        const c = lattice(x0, y0 + 1, o);
        const d = lattice(x0 + 1, y0 + 1, o);
        out[y * w + x] += amp * (a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy);
      }
    }
    total += amp;
    amp *= 0.5;
    s = Math.max(1, s / 2);
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
};
