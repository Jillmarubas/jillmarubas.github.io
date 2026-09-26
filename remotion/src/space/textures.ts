import * as THREE from 'three';
import {random} from 'remotion';

// Procedural planet textures, generated once per page. Everything is original artwork.

const hash = (x: number, y: number, z: number, seed: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 19.3) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const noise3 = (x: number, y: number, z: number, seed: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  let v = 0;
  for (let dx = 0; dx < 2; dx++)
    for (let dy = 0; dy < 2; dy++)
      for (let dz = 0; dz < 2; dz++) {
        const w = (dx ? xf : 1 - xf) * (dy ? yf : 1 - yf) * (dz ? zf : 1 - zf);
        v += w * hash(xi + dx, yi + dy, zi + dz, seed);
      }
  return v;
};
const fbm = (x: number, y: number, z: number, seed: number, oct = 5) => {
  let a = 0.5, f = 1, v = 0;
  for (let i = 0; i < oct; i++) {
    v += a * noise3(x * f, y * f, z * f, seed);
    a *= 0.5;
    f *= 2.03;
  }
  return v;
};

// Sample on the sphere so the texture has no seam.
const sphereCanvas = (w: number, h: number, shade: (x: number, y: number, z: number, lat: number) => [number, number, number]) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  for (let j = 0; j < h; j++) {
    const lat = Math.PI * (j / h - 0.5);
    for (let i = 0; i < w; i++) {
      const lon = (i / w) * Math.PI * 2;
      const x = Math.cos(lat) * Math.cos(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon);
      const [r, g, b] = shade(x, y, z, lat);
      const k = (j * w + i) * 4;
      img.data[k] = r;
      img.data[k + 1] = g;
      img.data[k + 2] = b;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
};

const tex = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

export const earthTexture = () =>
  tex(
    sphereCanvas(768, 384, (x, y, z, lat) => {
      const n = fbm(x * 1.8 + 3, y * 1.8, z * 1.8, 1);
      const ice = Math.abs(lat) > 1.2;
      if (ice) return [236, 238, 240];
      if (n > 0.52) {
        const d = fbm(x * 6, y * 6, z * 6, 2);
        const v = 120 + d * 90;
        return [v, v * 0.98, v * 0.9];
      }
      const depth = 40 + n * 80;
      return [depth * 0.8, depth * 0.95, depth * 1.25];
    }),
  );

export const cloudTexture = () => {
  const c = sphereCanvas(512, 256, (x, y, z) => {
    const n = fbm(x * 3 + 9, y * 5, z * 3, 7, 4);
    const v = Math.max(0, n - 0.5) * 2.2;
    return [255 * v, 255 * v, 255 * v];
  });
  const t = new THREE.CanvasTexture(c);
  return t;
};

export const moonTexture = () => {
  const c = sphereCanvas(768, 384, (x, y, z) => {
    const n = fbm(x * 2.5, y * 2.5, z * 2.5, 11);
    const fine = fbm(x * 14, y * 14, z * 14, 12, 3);
    const v = 110 + n * 90 + fine * 30 - (n > 0.55 ? 45 : 0);
    return [v, v, v];
  });
  const ctx = c.getContext('2d')!;
  // craters: dark floor, bright rim
  for (let i = 0; i < 260; i++) {
    const cx = random(`cx${i}`) * c.width;
    const cy = c.height * (0.12 + random(`cy${i}`) * 0.76);
    const r = 2 + Math.pow(random(`cr${i}`), 3) * 26;
    const depth = 0.25 + random(`cd${i}`) * 0.3;
    // draw three times so craters wrap across the texture seam
    for (const ox of [-c.width, 0, c.width]) {
      const g = ctx.createRadialGradient(cx + ox - r * 0.2, cy - r * 0.2, r * 0.1, cx + ox, cy, r);
      g.addColorStop(0, `rgba(60,60,60,${depth})`);
      g.addColorStop(0.75, `rgba(90,90,90,${depth * 0.45})`);
      g.addColorStop(0.9, `rgba(230,230,230,${depth * 0.8})`);
      g.addColorStop(1, 'rgba(230,230,230,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx + ox, cy, r, r * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return tex(c);
};

export const bandTexture = (seed: number, base: number, contrast: number) =>
  tex(
    sphereCanvas(512, 256, (x, y, z) => {
      const band = Math.sin(y * 18 + fbm(x * 2, y * 2, z * 2, seed) * 5);
      const v = base + band * contrast + fbm(x * 8, y * 8, z * 8, seed + 1, 3) * 20;
      return [v, v * 0.97, v * 0.9];
    }),
  );

export const plainTexture = (seed: number, base: number) =>
  tex(
    sphereCanvas(256, 128, (x, y, z) => {
      const v = base + (fbm(x * 3, y * 3, z * 3, seed) - 0.5) * 70;
      return [v, v, v];
    }),
  );
