// Minimal DSP toolkit for synthesising the music bed and SFX in code.
// Everything is deterministic (seeded noise), so a rebuild gives the same audio.
import fs from 'node:fs';

export const SR = 48000;
export const TAU = Math.PI * 2;

export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const dbToGain = (db) => Math.pow(10, db / 20);

// xorshift32: reproducible noise and humanisation
export const rng = (seed = 0x9e3779b9) => {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
};

export const stereo = (seconds) => {
  const n = Math.ceil(seconds * SR);
  return [new Float32Array(n), new Float32Array(n)];
};
export const mono = (seconds) => new Float32Array(Math.ceil(seconds * SR));

// equal-power pan, p in [-1, 1]
export const pan = (p) => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)];

// ---- filters -----------------------------------------------------------------------
// RBJ biquad; call set() whenever the cutoff moves (every 16-32 samples is plenty)
export class Biquad {
  constructor(type = 'lp', f = 1000, q = 0.707) {
    this.type = type; this.x1 = this.x2 = this.y1 = this.y2 = 0;
    this.set(f, q);
  }
  set(f, q = this.q) {
    this.q = q;
    const w = TAU * Math.min(Math.max(f, 10), SR * 0.45) / SR;
    const cw = Math.cos(w), a = Math.sin(w) / (2 * q);
    let b0, b1, b2;
    if (this.type === 'lp') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; }
    else if (this.type === 'hp') { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; }
    else { b0 = a; b1 = 0; b2 = -a; } // band-pass, 0 dB peak
    const a0 = 1 + a;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
    this.a1 = (-2 * cw) / a0; this.a2 = (1 - a) / a0;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

// ---- effects applied to whole buffers ------------------------------------------------
// Freeverb-style: 8 damped combs + 4 allpasses per channel, stereo-spread
export const reverb = ([inL, inR], {room = 0.84, damp = 0.3, wet = 1} = {}) => {
  const combT = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => Math.round(d * SR / 44100));
  const apT = [556, 441, 341, 225].map((d) => Math.round(d * SR / 44100));
  const run = (inp, spread) => {
    const out = new Float32Array(inp.length);
    const combs = combT.map((d) => ({buf: new Float32Array(d + spread), i: 0, store: 0}));
    const aps = apT.map((d) => ({buf: new Float32Array(d + spread), i: 0}));
    for (let n = 0; n < inp.length; n++) {
      const x = inp[n] * 0.015;
      let acc = 0;
      for (const c of combs) {
        const y = c.buf[c.i];
        c.store = y * (1 - damp) + c.store * damp;
        c.buf[c.i] = x + c.store * room;
        if (++c.i >= c.buf.length) c.i = 0;
        acc += y;
      }
      for (const a of aps) {
        const b = a.buf[a.i];
        a.buf[a.i] = acc + b * 0.5;
        acc = b - acc;
        if (++a.i >= a.buf.length) a.i = 0;
      }
      out[n] = acc * wet;
    }
    return out;
  };
  return [run(inL, 0), run(inR, 23)];
};

// tempo-synced ping-pong delay
export const pingPong = ([inL, inR], {time, feedback = 0.42, tone = 3800}) => {
  const d = Math.round(time * SR);
  const n = inL.length;
  const oL = new Float32Array(n), oR = new Float32Array(n);
  const lpL = new Biquad('lp', tone), lpR = new Biquad('lp', tone);
  for (let i = 0; i < n; i++) {
    const fromR = i >= d ? oR[i - d] : 0;
    const fromL = i >= d ? oL[i - d] : 0;
    oL[i] = lpL.run((inL[i] + inR[i]) * 0.5 + fromR * feedback);
    oR[i] = lpR.run(fromL * feedback);
  }
  return [oL, oR];
};

export const mixInto = (dst, src, gain = 1) => {
  for (let c = 0; c < 2; c++) {
    const a = dst[c], b = src[c];
    for (let i = 0; i < a.length && i < b.length; i++) a[i] += b[i] * gain;
  }
};

// ---- output -----------------------------------------------------------------------
export const peakOf = (chs) => {
  let p = 0;
  for (const ch of chs) for (let i = 0; i < ch.length; i++) p = Math.max(p, Math.abs(ch[i]));
  return p;
};

export const normalizePeak = (chs, db = -1) => {
  const g = dbToGain(db) / (peakOf(chs) || 1);
  for (const ch of chs) for (let i = 0; i < ch.length; i++) ch[i] *= g;
  return chs;
};

// 16-bit PCM WAV with TPDF dither
export const writeWav = (path, chs) => {
  const n = chs[0].length, c = chs.length;
  const buf = Buffer.alloc(44 + n * c * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * c * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(c, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * c * 2, 28); buf.writeUInt16LE(c * 2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * c * 2, 40);
  const r = rng(12345);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < c; k++) {
      const d = (r() - r()) / 32768;
      const v = Math.max(-1, Math.min(1, chs[k][i] + d));
      buf.writeInt16LE(Math.round(v * 32767), o);
      o += 2;
    }
  }
  fs.writeFileSync(path, buf);
};
