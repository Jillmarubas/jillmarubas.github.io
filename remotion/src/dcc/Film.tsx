import React from 'react';
import {AbsoluteFill, Easing, Sequence, useCurrentFrame} from 'remotion';
import TIMING from '../dc/timing.json';
import {FPS} from '../dc/design';
import {EXIT_LEN, SceneCtx, settle} from '../dc/kit';
import {SCENES} from '../dc/scenes';
import './fonts';
import {K} from './art';
import {PinDef, SHOTS, V} from './shots';
import {Cam, Flags, NO_FLAGS, World} from './world';

/*
 * "Why people hate data centres", city-world edition. The whole story plays out on one
 * illustrated panorama (world.tsx); every scene of the voiceover is a camera shot on it
 * (shots.tsx). Between shots the camera flies, zooming out a little for long trips; inside a
 * shot it keeps pushing in slowly. The scene boundaries match the other editions, so the
 * shared soundtrack (out/dc-mix.wav) lines up.
 */
type Line = {ch: number; i: number; start: number};
const T = TIMING as {duration: number; chapters: {start: number; end: number}[]; lines: Line[]};
const fr = (s: number) => Math.round(s * FPS);
export const CITY_DURATION = fr(T.duration);
export const CITY_CHAPTERS = T.chapters.map((c) => ({from: fr(c.start), to: fr(c.end)}));
if (SHOTS.length !== SCENES.length) throw new Error(`SHOTS ${SHOTS.length} != SCENES ${SCENES.length}`);

const LEAD = 10;
type Win = {from: number; dur: number; lines: number[]; ch: number};
const WINS: Win[] = (() => {
  const starts = SCENES.map((s) => (s.card ? fr(T.chapters[s.ch].start) : fr(T.lines.find((x) => x.ch === s.ch && x.i === s.from)!.start) - LEAD));
  return SCENES.map((s, k) => {
    const from = starts[k];
    const dur = (k + 1 < SCENES.length ? starts[k + 1] : CITY_DURATION) - from;
    const next = SCENES[k + 1];
    const lines = s.card ? [] : T.lines.filter((x) => x.ch === s.ch && x.i >= s.from && (!next || next.ch !== s.ch || next.card || x.i < next.from)).map((x) => fr(x.start) - from);
    return {from, dur, lines, ch: s.ch};
  });
})();

/* ------------------------------------------------------------------ camera */
const glide = Easing.bezier(0.45, 0, 0.2, 1);
const mix = (a: V, b: V, u: number, hop: number): Cam => {
  const e = glide(Math.min(1, Math.max(0, u)));
  const z = Math.exp(Math.log(a[2]) * (1 - e) + Math.log(b[2]) * e) * (1 - hop * Math.sin(Math.PI * e));
  return {x: a[0] + (b[0] - a[0]) * e, y: a[1] + (b[1] - a[1]) * e, z};
};
const flyLen = (a: V, b: V) => Math.round(Math.min(72, 30 + Math.abs(b[0] - a[0]) / 90 + Math.abs(Math.log(b[2] / a[2])) * 20));
const hopOf = (a: V, b: V) => Math.min(0.55, Math.abs(b[0] - a[0]) / 9000);

/** Where shot i's camera is at local frame t (its own keyed moves plus a slow push). */
const hold = (i: number, t: number): Cam => {
  const s = SHOTS[i];
  const w = WINS[i];
  let cur: Cam = {x: s.cam[0], y: s.cam[1], z: s.cam[2]};
  let base: V = s.cam;
  for (const [li, v, d = -8] of s.keys ?? []) {
    const k0 = (w.lines[li] ?? w.dur) + d;
    if (t < k0) break;
    const len = flyLen(base, v);
    cur = mix(base, v, (t - k0) / len, hopOf(base, v) * 0.6);
    base = v;
  }
  const push = 1 + 0.06 * Math.min(1, t / Math.max(1, w.dur));
  return {x: cur.x, y: cur.y, z: cur.z * push};
};
const toV = (c: Cam): V => [c.x, c.y, c.z];

const camera = (f: number): Cam => {
  let i = WINS.findIndex((w) => f >= w.from && f < w.from + w.dur);
  if (i < 0) i = WINS.length - 1;
  const t = f - WINS[i].from;
  const here = hold(i, t);
  // the opening: descend from the clouds
  const prev: V = i === 0 ? [SHOTS[0].cam[0] - 300, -1500, 0.55] : toV(hold(i - 1, WINS[i - 1].dur));
  const len = i === 0 ? 70 : flyLen(prev, toV(here));
  if (t >= len) return here;
  return mix(prev, toV(here), t / len, i === 0 ? 0 : hopOf(prev, toV(here)));
};

/* ------------------------------------------------------------------ flags and sky */
const FLAG_KEYS = Object.keys(NO_FLAGS) as (keyof Flags)[];
const flags = (f: number): Flags => {
  const out = {...NO_FLAGS};
  WINS.forEach((w, i) => {
    const fl = SHOTS[i].fl;
    if (!fl) return;
    const a = Math.min(1, Math.max(0, (f - w.from) / 24));
    const b = 1 - Math.min(1, Math.max(0, (f - w.from - w.dur) / 24));
    for (const k of FLAG_KEYS) if (fl[k]) out[k] = Math.max(out[k], fl[k]! * a * b);
  });
  return out;
};
const skyAt = (f: number) => {
  let c = 0;
  CITY_CHAPTERS.forEach((ch, i) => {
    if (f >= ch.from) c = i;
  });
  return c === 0 ? 0 : c - 1 + Math.min(1, Math.max(0, (f - CITY_CHAPTERS[c].from) / 45));
};

/* ------------------------------------------------------------------ pins on the world */
const Pin: React.FC<{p: PinDef; t: number; z: number; fade: number}> = ({p, t, z, fade}) => {
  const k = settle(t / 18);
  if (t < 0 || fade <= 0) return null;
  const c = p.c ?? K.red;
  const w = p.text.length * 17 + 56;
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${(1 / z) * (0.4 + 0.6 * k)})`} opacity={Math.min(1, t / 6) * fade}>
      <path d="M-14 -34 L0 0 L14 -34 Z" fill={c} />
      <circle r={10} fill={K.white} stroke={c} strokeWidth={5} />
      <rect x={-w / 2} y={-100} width={w} height={66} rx={33} fill={c} />
      <text x={0} y={-56} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={K.white}>
        {p.text}
      </text>
    </g>
  );
};

/* ------------------------------------------------------------------ the film */
export const CityFilm: React.FC<{offset?: number}> = ({offset = 0}) => {
  const f = useCurrentFrame() + offset;
  const cam = camera(f);
  const pins: React.ReactNode[] = [];
  WINS.forEach((w, i) => {
    const ps = SHOTS[i].pins;
    if (!ps || f < w.from || f > w.from + w.dur + 20) return;
    const fade = 1 - Math.min(1, Math.max(0, (f - w.from - w.dur + 14) / 16));
    ps.forEach((p, k) => pins.push(<Pin key={`${i}-${k}`} p={p} t={f - w.from - ((w.lines[p.l] ?? 0) + (p.d ?? 0))} z={cam.z} fade={fade} />));
  });
  return (
    <AbsoluteFill style={{background: K.sky2, overflow: 'hidden'}}>
      <World cam={cam} t={f} sky={skyAt(f)} fl={flags(f)}>
        {pins}
      </World>
      {WINS.map((w, i) => {
        const Ov = SHOTS[i].ov;
        if (!Ov || f < w.from - 2 || f > w.from + w.dur + EXIT_LEN + 12) return null;
        const exitAt = w.dur - 14;
        return (
          <Sequence key={i} from={w.from - offset} durationInFrames={w.dur + EXIT_LEN + 12} layout="none">
            <SceneCtx.Provider value={{dur: w.dur, exitAt, lines: w.lines, seed: w.from}}>
              <AbsoluteFill>
                <Ov />
              </AbsoluteFill>
            </SceneCtx.Provider>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 65%, rgba(30,42,68,0.14) 100%)'}} />
    </AbsoluteFill>
  );
};

export const CityPart: React.FC<{part: number}> = ({part}) => <CityFilm offset={CITY_CHAPTERS[part].from} />;

/** QA: two sample frames per shot, rendered as one short sequence. */
export const CITY_QA = WINS.flatMap((w) => [w.from + Math.round(w.dur * 0.4), w.from + Math.round(w.dur * 0.85)]);
export const CityQA: React.FC = () => {
  const f = useCurrentFrame();
  return <CityFilm offset={CITY_QA[f] - f} />;
};
