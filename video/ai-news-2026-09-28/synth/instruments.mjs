// Instruments: each writes one note/hit into stereo buffers at time t (seconds).
import {Biquad, SR, TAU, mtof, pan, rng} from './dsp.mjs';

const noise = rng(0xa11ce);
const n2 = () => noise() * 2 - 1;
const idx = (t) => Math.round(t * SR);

// ---- drums -------------------------------------------------------------------------
export const kick = (buf, t, vel = 1) => {
  const i0 = idx(t), len = Math.round(0.42 * SR);
  let ph = 0;
  for (let k = 0; k < len; k++) {
    const s = k / SR;
    const f = 44 + 88 * Math.exp(-s / 0.028); // pitch drops from ~132 Hz to 44 Hz
    ph += TAU * f / SR;
    const amp = Math.exp(-s / 0.19) * (s < 0.002 ? s / 0.002 : 1);
    const click = s < 0.004 ? n2() * (1 - s / 0.004) * 0.25 : 0;
    const v = (Math.tanh(Math.sin(ph) * 1.6) * amp + click) * vel;
    if (i0 + k < buf[0].length) { buf[0][i0 + k] += v; buf[1][i0 + k] += v; }
  }
};

export const clap = (buf, t, vel = 1) => {
  const i0 = idx(t), len = Math.round(0.32 * SR);
  const bp = new Biquad('bp', 1500, 1.1), hp = new Biquad('hp', 600, 0.7);
  for (let k = 0; k < len; k++) {
    const s = k / SR;
    // three quick bursts then a tail, like a hand clap
    const bursts = [0, 0.011, 0.022].reduce((a, o) => a + (s >= o ? Math.exp(-(s - o) / 0.006) : 0), 0) * 0.5;
    const env = bursts + Math.exp(-s / 0.09) * 0.55;
    const body = Math.sin(TAU * 185 * s) * Math.exp(-s / 0.03) * 0.25;
    const v = (hp.run(bp.run(n2())) * env * 1.6 + body) * vel;
    if (i0 + k < buf[0].length) { buf[0][i0 + k] += v * 0.92; buf[1][i0 + k] += v; }
  }
};

export const hat = (buf, t, vel = 1, open = false, p = 0.25) => {
  const i0 = idx(t), len = Math.round((open ? 0.32 : 0.07) * SR);
  const hp = new Biquad('hp', 7200, 0.9), bp = new Biquad('bp', 10500, 0.8);
  const [gl, gr] = pan(p);
  for (let k = 0; k < len; k++) {
    const s = k / SR;
    const env = Math.exp(-s / (open ? 0.11 : 0.018));
    const v = (hp.run(n2()) * 0.6 + bp.run(n2()) * 0.8) * env * vel;
    if (i0 + k < buf[0].length) { buf[0][i0 + k] += v * gl; buf[1][i0 + k] += v * gr; }
  }
};

// ---- bass: sub sine + a soft-saturated upper voice for small speakers --------------
export const bass = (buf, t, dur, midi, vel = 1) => {
  const i0 = idx(t), len = Math.round((dur + 0.08) * SR);
  const f = mtof(midi);
  const lp = new Biquad('lp', 520, 0.8);
  for (let k = 0; k < len; k++) {
    const s = k / SR;
    const att = Math.min(1, s / 0.006);
    const rel = s > dur ? Math.exp(-(s - dur) / 0.025) : 1;
    const sub = Math.sin(TAU * f / 2 * s) * 0.7;
    const up = lp.run(Math.tanh(Math.sin(TAU * f * s) * 2.2)) * 0.45;
    const v = (sub + up) * att * rel * (0.85 + 0.15 * Math.exp(-s / 0.12)) * vel;
    if (i0 + k < buf[0].length) { buf[0][i0 + k] += v; buf[1][i0 + k] += v; }
  }
};

// ---- pulse: two detuned saws, filter envelope ---------------------------------------
export const pulse = (buf, t, dur, midi, vel = 1, cutoff = 1400, p = 0) => {
  const i0 = idx(t), len = Math.round((dur + 0.06) * SR);
  const f = mtof(midi);
  const lp = new Biquad('lp', cutoff, 1.4), lp2 = new Biquad('lp', cutoff * 1.4, 0.7);
  const [gl, gr] = pan(p);
  let a = 0, b = 0.37;
  const fa = f * Math.pow(2, 6 / 1200), fb = f * Math.pow(2, -6 / 1200);
  for (let k = 0; k < len; k++) {
    const s = k / SR;
    if ((k & 15) === 0) lp.set(cutoff * (0.35 + 0.9 * Math.exp(-s / 0.07)));
    a += fa / SR; b += fb / SR; a -= Math.floor(a); b -= Math.floor(b);
    const saw = (a * 2 - 1) + (b * 2 - 1);
    const env = Math.min(1, s / 0.003) * (s > dur ? Math.exp(-(s - dur) / 0.02) : 1) * Math.exp(-s / 0.35);
    const v = lp2.run(lp.run(saw)) * env * vel * 0.5;
    if (i0 + k < buf[0].length) { buf[0][i0 + k] += v * gl; buf[1][i0 + k] += v * gr; }
  }
};

// ---- electric piano: 2-operator FM with a decaying index ------------------------------
export const keys = (dry, send, t, dur, midi, vel = 1) => {
  const i0 = idx(t), len = Math.round((dur + 1.2) * SR);
  const f = mtof(midi);
  const [gl, gr] = pan(Math.max(-0.6, Math.min(0.6, (midi - 62) / 14)));
  const lp = new Biquad('lp', 2600, 0.7);
  for (let k = 0; k < len; k++) {
    const s = k / SR;
    const index = 0.25 + 1.6 * Math.exp(-s / 0.35);
    const mod = Math.sin(TAU * f * s) * index;
    const trem = 1 + 0.12 * Math.sin(TAU * 4.6 * s);
    const env = Math.min(1, s / 0.004) * Math.exp(-s / 1.6) * (s > dur ? Math.exp(-(s - dur) / 0.25) : 1);
    const v = lp.run(Math.sin(TAU * f * s + mod)) * env * trem * vel;
    const j = i0 + k;
    if (j < dry[0].length) {
      dry[0][j] += v * gl; dry[1][j] += v * gr;
      send[0][j] += v * gl * 0.5; send[1][j] += v * gr * 0.5;
    }
  }
};

// ---- glassy arp: sine + soft 3rd partial, short decay, into the delay -----------------
export const glass = (dry, send, t, midi, vel = 1, p = 0) => {
  const i0 = idx(t), len = Math.round(0.5 * SR);
  const f = mtof(midi);
  const [gl, gr] = pan(p);
  for (let k = 0; k < len; k++) {
    const s = k / SR;
    const env = Math.min(1, s / 0.002) * Math.exp(-s / 0.16);
    const v = (Math.sin(TAU * f * s) + 0.18 * Math.sin(TAU * 3 * f * s) * Math.exp(-s / 0.05)) * env * vel;
    const j = i0 + k;
    if (j < dry[0].length) {
      dry[0][j] += v * gl; dry[1][j] += v * gr;
      send[0][j] += v * gl; send[1][j] += v * gr;
    }
  }
};

// ---- pad: detuned saws, slow attack, for the last chord --------------------------------
export const pad = (dry, send, t, dur, midis, vel = 1) => {
  const i0 = idx(t), len = Math.round((dur + 2) * SR);
  const voices = midis.flatMap((m, vi) => [-7, 0, 7].map((c, ci) => ({f: mtof(m) * Math.pow(2, c / 1200), ph: (vi * 3 + ci) * 0.137, p: ((vi + ci) % 3) - 1})));
  const lpL = new Biquad('lp', 1400, 0.7), lpR = new Biquad('lp', 1400, 0.7);
  for (let k = 0; k < len; k++) {
    const s = k / SR;
    if ((k & 31) === 0) { const c = 900 + 700 * Math.min(1, s / 3); lpL.set(c); lpR.set(c); }
    let l = 0, r = 0;
    for (const v of voices) {
      v.ph += v.f / SR; v.ph -= Math.floor(v.ph);
      const x = v.ph * 2 - 1;
      l += x * (1 - v.p * 0.5); r += x * (1 + v.p * 0.5);
    }
    const env = Math.min(1, s / 1.2) * (s > dur ? Math.exp(-(s - dur) / 0.9) : 1) * vel / voices.length;
    const j = i0 + k;
    if (j < dry[0].length) {
      const a = lpL.run(l) * env, b = lpR.run(r) * env;
      dry[0][j] += a; dry[1][j] += b; send[0][j] += a; send[1][j] += b;
    }
  }
};
