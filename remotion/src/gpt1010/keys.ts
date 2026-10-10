// Keystroke times for typed commands. Pure (no React), so the sound mixer can import it too.
const rnd = (seed: string) => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
};
/** Times (s) of each keystroke typing `text` from `at`, finishing by `by` (Enter is at `by`). */
export const typeTimes = (text: string, at: number, by: number) => {
  const n = text.length;
  const natural = 1 / 15; // ~15 characters a second
  const span = Math.max(0.2, by - 0.18 - at);
  const step = Math.min(natural, span / Math.max(1, n));
  const out: number[] = [];
  let t = at;
  for (let i = 0; i < n; i++) {
    out.push(t);
    t += step * (0.7 + rnd(text + i) * 0.6) + (text[i] === ' ' ? step * 0.25 : 0);
  }
  // squeeze so the last key lands before Enter
  const last = out[n - 1] ?? at;
  const lim = by - 0.18;
  return last > lim ? out.map((x) => at + ((x - at) * (lim - at)) / Math.max(0.001, last - at)) : out;
};
