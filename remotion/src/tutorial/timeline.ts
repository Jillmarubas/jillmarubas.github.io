// Cursor and camera paths. Both are lists of keys that say where things ARRIVE at frame f,
// so a key can be pinned to the word in the voiceover ("…click New workflow" → f of "New").
import {interpolate, random} from 'remotion';
import {ease, LAPTOP, toStage} from './theme';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------- Cursor ----------
// x, y in screen points. `click` presses at f. `dur` overrides the glide length (frames).
export type CursorKey = {f: number; x: number; y: number; click?: boolean; dur?: number};
export type CursorState = {x: number; y: number; press: number; ripple: number; visible: number; moving: boolean};

// Glide length grows with distance, like a real hand: 12 f for a hop, up to 28 f across the screen.
const glideFrames = (d: number) => clamp(Math.round(12 + d / 45), 12, 28);

export const cursorAt = (keys: CursorKey[], frame: number): CursorState => {
  let x = keys[0].x;
  let y = keys[0].y;
  let moving = false;
  for (let i = 1; i < keys.length; i++) {
    const p = keys[i - 1];
    const k = keys[i];
    if (frame >= k.f) {
      x = k.x;
      y = k.y;
      continue;
    }
    const d = Math.hypot(k.x - p.x, k.y - p.y);
    const dur = Math.min(k.dur ?? glideFrames(d), k.f - p.f);
    const start = k.f - dur;
    if (frame > start && d > 0) {
      const t = ease.glide((frame - start) / dur);
      // A slight arc: hands never move the mouse in a ruler-straight line.
      const bow = Math.sin(Math.PI * t) * Math.min(d * 0.07, 36) * (random(`bow${i}`) > 0.5 ? 1 : -1);
      const nx = -(k.y - p.y) / d;
      const ny = (k.x - p.x) / d;
      x = lerp(p.x, k.x, t) + nx * bow;
      y = lerp(p.y, k.y, t) + ny * bow;
      moving = true;
    }
    break;
  }
  // Most recent click at or before this frame.
  let since = Infinity;
  for (const k of keys) if (k.click && frame >= k.f) since = Math.min(since, frame - k.f);
  const press = since <= 6 ? Math.sin((Math.PI * since) / 6) : 0;
  const ripple = since <= 16 ? since / 16 : 0;
  const visible = interpolate(frame, [keys[0].f, keys[0].f + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return {x, y, press, ripple, visible, moving};
};

export type Rect = {x: number; y: number; w: number; h: number};
export const centre = (r: Rect) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});
export const isOver = (r: Rect, c: {x: number; y: number}) => c.x >= r.x && c.x <= r.x + r.w && c.y >= r.y && c.y <= r.y + r.h;

// ---------- Camera ----------
// zoom 1 = whole laptop. x, y = screen point to centre on (ignored at zoom 1).
export type CamKey = {f: number; zoom: number; x?: number; y?: number; dur?: number};
export type CamState = {zoom: number; fx: number; fy: number};

const STAGE = {w: 1920, h: 1080};
const camTarget = (k: CamKey) => {
  if (k.zoom <= 1 || k.x === undefined || k.y === undefined) return {zoom: k.zoom, fx: STAGE.w / 2, fy: STAGE.h / 2};
  const s = toStage(k.x, k.y);
  // Never show past the edge of the stage.
  const hw = STAGE.w / 2 / k.zoom;
  const hh = STAGE.h / 2 / k.zoom;
  return {zoom: k.zoom, fx: clamp(s.x, hw, STAGE.w - hw), fy: clamp(s.y, hh, STAGE.h - hh)};
};

export const cameraAt = (keys: CamKey[], frame: number): CamState => {
  let cur = camTarget(keys[0]);
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    const next = camTarget(k);
    const dur = k.dur ?? 26;
    if (frame >= k.f) {
      cur = next;
      continue;
    }
    if (frame > k.f - dur) {
      const t = ease.glide((frame - (k.f - dur)) / dur);
      // Zoom in log space so pushes in and out feel the same speed.
      const zoom = Math.exp(lerp(Math.log(cur.zoom), Math.log(next.zoom), t));
      cur = {zoom, fx: lerp(cur.fx, next.fx, t), fy: lerp(cur.fy, next.fy, t)};
    }
    break;
  }
  return cur;
};

export const cameraTransform = (c: CamState) => `translate(${STAGE.w / 2}px, ${STAGE.h / 2}px) scale(${c.zoom}) translate(${-c.fx}px, ${-c.fy}px)`;

// ---------- Typing ----------
// Keystroke frames for `text` starting at `start`: about 13 characters a second, slightly uneven.
export const keystrokes = (text: string, start: number, seed = 'type') => {
  const out: number[] = [];
  let f = start;
  for (let i = 0; i < text.length; i++) {
    out.push(f);
    f += 1.6 + random(`${seed}${i}`) * 1.6 + (text[i] === ' ' ? 1 : 0);
  }
  return out;
};
export const typedAt = (text: string, strokes: number[], frame: number) => text.slice(0, strokes.filter((s) => frame >= s).length);

// Progress 0→1 of an event that starts at f and lasts dur frames.
export const prog = (frame: number, f: number, dur: number, e = ease.swift) => e(clamp((frame - f) / dur, 0, 1));

export {LAPTOP};
