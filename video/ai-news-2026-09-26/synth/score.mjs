// The music bed, arranged against the video's running order.
import {Biquad, SR, pingPong, reverb, rng, stereo} from './dsp.mjs';
import {bass, clap, glass, hat, keys, kick, pad, pulse} from './instruments.mjs';

export const BPM = 100;
const BEAT = 60 / BPM;
const STEP = BEAT / 4; // 16th
const BAR = BEAT * 4;

// A minor, i–VI–III–VII; the breach story swaps in i–VI–iv–V(sus) for more tension
const MAIN = [
  {root: 45, keys: [60, 64, 67, 71]}, // Am9 (C E G B over A)
  {root: 41, keys: [57, 60, 64, 67]}, // Fmaj9
  {root: 48, keys: [55, 59, 60, 64]}, // Cmaj7
  {root: 43, keys: [59, 62, 64, 67]}, // G6
];
const DARK = [
  {root: 45, keys: [60, 64, 67, 71]}, // Am9
  {root: 41, keys: [57, 60, 64, 67]}, // Fmaj9
  {root: 38, keys: [57, 60, 64, 65]}, // Dm9
  {root: 40, keys: [57, 59, 62, 64]}, // E7sus4
];
const ARP = [0, -1, 2, 1, 3, -1, 2, 0, 1, -1, 3, 2, 0, -1, 1, 3];
const HAT_VEL = [0.3, 0.14, 0.55, 0.16, 0.3, 0.14, 0.55, 0.18, 0.3, 0.14, 0.55, 0.16, 0.3, 0.14, 0.6, 0.2];

// What plays at time t, derived from the blocks.
const arrangement = (blocks) => {
  const vo = (id) => blocks.find((b) => b.kind === 'vo' && b.id === id);
  const hook = vo('01-hook');
  const sting = blocks.find((b) => b.kind === 'sting');
  const end = blocks.find((b) => b.kind === 'end');
  const breaks = blocks.filter((b) => b.kind === 'card' || b.kind === 'recap');
  return (t) => {
    if (t >= end.start) return {stop: true};
    if (t >= sting.start - 0.05 && t < sting.start + sting.len) return {drums: 'none', pulse: false, keys: false, arp: false, prog: MAIN};
    for (const b of breaks) {
      if (t >= b.start - 0.3 && t < b.start + b.len - 0.25) return {drums: 'none', pulse: true, cut: 650, keys: true, arp: false, prog: MAIN, held: true};
    }
    if (t < hook.start + hook.len + 0.3) {
      // cold open: tense, the filter opening across the hook
      return {drums: 'light', pulse: true, cut: 550 + 750 * Math.min(1, t / (hook.len + 0.6)), keys: false, arp: false, prog: MAIN};
    }
    const cur = [...blocks].reverse().find((b) => b.kind === 'vo' && t >= b.start - 0.3);
    const id = cur ? cur.id : '02-preview';
    switch (id) {
      case '02-preview': return {drums: 'full', pulse: true, cut: 1300, keys: true, arp: false, prog: MAIN};
      case '03-story1':
      case '04-story2':
      case '07-story5':
      case '08-wrap': return {drums: 'full', pulse: true, cut: 1500, keys: true, arp: true, prog: MAIN};
      case '05-story3': return {drums: 'full', pulse: true, cut: 1150, keys: true, arp: false, prog: MAIN};
      case '06-story4': return {drums: 'light', pulse: true, cut: 800, keys: true, arp: false, prog: DARK};
      case '09-outro': return {drums: 'light', pulse: false, keys: true, arp: true, prog: MAIN};
      default: return {drums: 'full', pulse: true, cut: 1300, keys: true, arp: false, prog: MAIN};
    }
  };
};

export const renderMusic = (blocks, total) => {
  const at = arrangement(blocks);
  const r = rng(0xbeef);
  const hum = () => (r() - 0.5) * 0.008; // ±4 ms of human timing
  const drums = stereo(total), bassBus = stereo(total), pumped = stereo(total);
  const glassDry = stereo(total), revSend = stereo(total), dlySend = stereo(total);
  const kicks = [];
  const end = blocks.find((b) => b.kind === 'end');
  const sting = blocks.find((b) => b.kind === 'sting');

  const steps = Math.floor(end.start / STEP);
  let lastHeldBar = -1;
  let wasHeld = false;
  for (let n = 0; n < steps; n++) {
    const t = n * STEP;
    const st = at(t);
    if (st.stop) break;
    const s16 = n % 16, bar = Math.floor(n / 16);
    const chord = st.prog[bar % 4];

    // a break (story card) usually starts mid-bar: land the held chord on its first step
    if (st.held && !wasHeld && s16 !== 0) {
      chord.keys.forEach((m, i) => keys(pumped, revSend, t + i * 0.006, BAR - STEP * s16, m, 0.3));
      bass(bassBus, t, BAR - STEP * s16 - 0.1, chord.root, 0.6);
    }
    wasHeld = Boolean(st.held);

    // drums
    if (st.drums === 'full') {
      if (s16 === 0 || s16 === 8 || s16 === 11 || (s16 === 14 && bar % 4 === 3)) {
        const v = s16 === 11 ? 0.62 : 1;
        kick(drums, t + hum() * 0.3, v); kicks.push(t);
      }
      if (s16 === 4 || s16 === 12) clap(drums, t + hum(), 0.5);
      hat(drums, t + hum(), HAT_VEL[s16] * (0.9 + r() * 0.2), s16 === 14 && bar % 2 === 1, s16 % 4 === 2 ? 0.3 : -0.15);
    } else if (st.drums === 'light') {
      if (s16 === 0 || s16 === 8) { kick(drums, t, 0.8); kicks.push(t); }
      if (s16 % 2 === 0) hat(drums, t + hum(), s16 % 4 === 2 ? 0.42 : 0.2, false, 0.2);
    }

    // bass
    if (st.drums !== 'none') {
      const pat = {0: [0, 0.3], 3: [0, 0.13], 6: [0, 0.22], 10: [7, 0.2], 14: [12, 0.12]};
      if (pat[s16]) bass(bassBus, t, pat[s16][1], chord.root + pat[s16][0], s16 === 0 ? 1 : 0.8);
    } else if (st.held && s16 === 0 && bar !== lastHeldBar) {
      bass(bassBus, t, BAR - 0.2, chord.root, 0.6);
    }

    // pulse
    if (st.pulse && s16 % 2 === 0) {
      const tones = [12, 19, 24, 19];
      pulse(pumped, t, STEP * 1.6, chord.root + tones[(s16 / 2) % 4], s16 % 4 === 0 ? 0.9 : 0.65, st.cut, (s16 / 2) % 2 ? 0.35 : -0.35);
    }

    // keys: the chord on the bar, a lighter stab on the and-of-three
    if (st.keys && s16 === 0 && bar !== lastHeldBar) {
      chord.keys.forEach((m, i) => keys(pumped, revSend, t + i * 0.006, BAR - 0.12, m, 0.3));
      if (st.held) lastHeldBar = bar;
    }
    if (st.keys && !st.held && st.drums === 'full' && s16 === 10) {
      chord.keys.slice(2).forEach((m) => keys(pumped, revSend, t + hum(), STEP * 1.5, m, 0.16));
    }

    // arp
    if (st.arp && ARP[s16] >= 0) {
      const m = chord.keys[ARP[s16]] + 12;
      glass(glassDry, dlySend, t + hum() * 0.5, m, s16 % 4 === 0 ? 0.5 : 0.34, s16 % 2 ? 0.45 : -0.45);
    }
  }

  // the brand sting: one chord stab with the impact
  MAIN[0].keys.forEach((m, i) => keys(pumped, revSend, sting.start + 0.02 + i * 0.008, 2.6, m - 12 * (i === 0 ? 1 : 0), 0.4));
  bass(bassBus, sting.start + 0.02, 2.4, MAIN[0].root, 0.8);

  // the end card: a resolving Am9 pad with the keys and a long bass note
  pad(pumped, revSend, end.start, 5.5, [45, 52, 55, 60, 64, 71], 0.7);
  MAIN[0].keys.forEach((m, i) => keys(pumped, revSend, end.start + i * 0.03, 4.5, m, 0.26));
  bass(bassBus, end.start, 5.2, 45, 0.7);

  // side-chain pump: keys, pulse and pad dip under each kick
  let k = 0;
  for (let i = 0; i < pumped[0].length; i++) {
    const t = i / SR;
    while (k + 1 < kicks.length && kicks[k + 1] <= t) k++;
    const d = kicks.length && t >= kicks[k] ? t - kicks[k] : 9;
    const g = 1 - 0.38 * Math.exp(-d / 0.11);
    pumped[0][i] *= g; pumped[1][i] *= g;
  }

  // effects: glass → tempo delay (dotted eighth) → a little reverb; keys → reverb
  const dly = pingPong(dlySend, {time: STEP * 3, feedback: 0.4, tone: 4200});
  for (let c = 0; c < 2; c++) for (let i = 0; i < dly[c].length; i++) revSend[c][i] += dly[c][i] * 0.3;
  const rev = reverb(revSend, {room: 0.86, damp: 0.35});

  // mix
  const out = stereo(total);
  const hp = [new Biquad('hp', 30, 0.7), new Biquad('hp', 30, 0.7)];
  for (let c = 0; c < 2; c++) {
    for (let i = 0; i < out[c].length; i++) {
      let v = drums[c][i] * 0.85 + bassBus[c][i] * 0.5 + pumped[c][i] * 0.42 + glassDry[c][i] * 0.11 + dly[c][i] * 0.2 + rev[c][i] * 0.55;
      v = hp[c].run(v);
      out[c][i] = Math.tanh(v * 0.9); // gentle bus saturation catches the odd peak
    }
  }
  return out;
};
