// Sound effects, synthesised. Each returns a stereo buffer.
import {Biquad, SR, TAU, pan, reverb, rng, stereo} from './dsp.mjs';

const put = (buf, i, v, p = 0) => {
  const [gl, gr] = pan(p);
  buf[0][i] += v * gl; buf[1][i] += v * gr;
};

// Air whoosh: band-passed noise swept up then down, panning left to right.
export const whoosh = () => {
  const d = 1.2, buf = stereo(d), r = rng(7);
  const bp = new Biquad('bp', 400, 1.4), bp2 = new Biquad('bp', 800, 0.9);
  const peak = 0.52;
  for (let i = 0; i < buf[0].length; i++) {
    const s = i / SR, x = s / d;
    if ((i & 15) === 0) {
      const f = s < peak ? 350 * Math.pow(3200 / 350, s / peak) : 3200 * Math.pow(700 / 3200, (s - peak) / (d - peak));
      bp.set(f, 1.4); bp2.set(f * 0.6, 0.9);
    }
    const env = s < peak ? Math.pow(s / peak, 2.2) : Math.exp(-(s - peak) / 0.16);
    const n = r() * 2 - 1;
    put(buf, i, (bp.run(n) * 1.2 + bp2.run(n) * 0.6) * env, -0.8 + 1.6 * x);
  }
  return buf;
};

// Glassy UI tick: a bright sine pair with a click on the front.
export const tick = () => {
  const d = 0.3, buf = stereo(d), r = rng(11);
  for (let i = 0; i < buf[0].length; i++) {
    const s = i / SR;
    const click = s < 0.0015 ? (r() * 2 - 1) * (1 - s / 0.0015) * 0.5 : 0;
    const v = Math.sin(TAU * 2640 * s) * Math.exp(-s / 0.022) * 0.7 + Math.sin(TAU * 3960 * s) * Math.exp(-s / 0.06) * 0.3 + click;
    put(buf, i, v, 0.1);
  }
  return buf;
};

// Trailer impact: sub drop, a thump and a noise burst, with a short dark room.
export const impact = () => {
  const d = 2.5, dry = stereo(d), r = rng(13);
  const lp = new Biquad('lp', 900, 0.8);
  let ph = 0;
  for (let i = 0; i < dry[0].length; i++) {
    const s = i / SR;
    const f = 34 + 30 * Math.exp(-s / 0.18);
    ph += TAU * f / SR;
    const sub = Math.sin(ph) * Math.exp(-s / 0.9) * Math.min(1, s / 0.004);
    const thump = Math.sin(TAU * 105 * s) * Math.exp(-s / 0.06) * 0.6;
    const burst = lp.run(r() * 2 - 1) * Math.exp(-s / 0.09) * 0.8;
    put(dry, i, Math.tanh((sub + thump + burst) * 1.4));
  }
  const tail = reverb(dry, {room: 0.8, damp: 0.6});
  for (let c = 0; c < 2; c++) for (let i = 0; i < dry[c].length; i++) dry[c][i] += tail[c][i] * 0.35;
  return dry;
};

// Riser: noise through a climbing band-pass plus a saw gliding up an octave and a half.
export const riser = () => {
  const d = 1.6, buf = stereo(d), r = rng(17);
  const bp = new Biquad('bp', 400, 2), lp = new Biquad('lp', 800, 1.2);
  let a = 0, b = 0.5;
  for (let i = 0; i < buf[0].length; i++) {
    const s = i / SR, x = s / d;
    if ((i & 15) === 0) { bp.set(400 * Math.pow(15, x), 2); lp.set(600 + 5000 * x * x, 1.2); }
    const f = 220 * Math.pow(2, 1.5 * x);
    a += f / SR; b += (f * 1.005) / SR; a -= Math.floor(a); b -= Math.floor(b);
    const env = Math.pow(x, 2.4) * (s > d - 0.012 ? (d - s) / 0.012 : 1);
    const v = bp.run(r() * 2 - 1) * 1.1 + lp.run(a * 2 - 1 + b * 2 - 1) * 0.35;
    const w = 0.5 + 0.5 * Math.sin(TAU * (2 + 10 * x) * s); // a tremolo that speeds up
    put(buf, i, v * env * (0.75 + 0.25 * w), Math.sin(TAU * 0.7 * s) * 0.3);
  }
  return buf;
};

// Digital glitch: bit-crushed, sample-held squares cut into stutters.
export const glitch = () => {
  const d = 0.9, buf = stereo(d), r = rng(23);
  const slices = [];
  for (let t = 0; t < d - 0.05;) {
    const len = 0.02 + r() * 0.07;
    slices.push({t, len, f: 180 + r() * 1900, hold: 2 + Math.floor(r() * 18), bits: 3 + Math.floor(r() * 4), on: r() > 0.22, p: r() * 1.6 - 0.8});
    t += len;
  }
  let held = 0;
  for (const sl of slices) {
    if (!sl.on) continue;
    const i0 = Math.round(sl.t * SR), n = Math.round(sl.len * SR);
    const q = Math.pow(2, sl.bits);
    for (let k = 0; k < n && i0 + k < buf[0].length; k++) {
      const s = k / SR;
      if (k % sl.hold === 0) {
        const sq = Math.sin(TAU * sl.f * s) > 0 ? 1 : -1;
        held = Math.round((sq * 0.6 + (r() * 2 - 1) * 0.4) * q) / q;
      }
      const env = Math.min(1, k / 40) * Math.min(1, (n - k) / 40) * Math.exp(-(sl.t) / 0.7);
      put(buf, i0 + k, held * env * 0.8, sl.p);
    }
  }
  return buf;
};

// Camera shutter: two short mechanical clicks with a small metal resonance.
export const shutter = () => {
  const d = 0.35, buf = stereo(d), r = rng(29);
  const hits = [{t: 0, a: 1}, {t: 0.075, a: 0.7}];
  for (const h of hits) {
    const hp = new Biquad('hp', 1800, 0.7), bp = new Biquad('bp', 3300, 6);
    const i0 = Math.round(h.t * SR);
    for (let k = 0; k < 0.06 * SR; k++) {
      const s = k / SR;
      const n = r() * 2 - 1;
      const v = (hp.run(n) * Math.exp(-s / 0.004) + bp.run(n) * Math.exp(-s / 0.018) * 2.5) * h.a;
      put(buf, i0 + k, v, -0.1);
    }
  }
  return buf;
};
