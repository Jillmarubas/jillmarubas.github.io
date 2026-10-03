import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import TIMING from './timing.json';
import './fonts';
import {FPS} from './design';
import {Ground, Lens} from './Ground';
import {EXIT_LEN, SceneCtx} from './kit';
import {SCENES} from './scenes';

/*
 * "AI News, 3 Oct 2026": a 16:9 Vox-style news explainer in Autopilot Blue, 24 fps.
 * Every scene is keyed to the Asher voiceover through timing.json (scripts/news1003_timing.py),
 * down to the word. Picture only; the mixed soundtrack is muxed after the Lambda render.
 */
type Line = {ch: number; i: number; start: number; end: number; words: [string, number][]};
type Ch = {title: string; key: string; start: number; card: number; vo: number; end: number};
const T = TIMING as unknown as {duration: number; chapters: Ch[]; lines: Line[]};
export const fr = (s: number) => Math.round(s * FPS);
export const N3_DURATION = fr(T.duration);
export const N3_CHAPTERS = T.chapters.map((c) => ({title: c.title, key: c.key, from: fr(c.start), to: fr(c.end)}));

const LEAD = 7; // pieces start moving this many frames before their line is spoken
export type Win = {key: string; from: number; dur: number; lines: number[]; words: [string, number][]; C: React.FC; ch: number; card: boolean};
export const WINDOWS: Win[] = (() => {
  const starts = SCENES.map((s) => {
    if (s.card) return fr(T.chapters[s.ch].start);
    const l = T.lines.find((x) => x.ch === s.ch && x.i === s.from);
    if (!l) throw new Error(`no line ${s.ch}/${s.from}`);
    return fr(l.start) - LEAD;
  });
  return SCENES.map((s, k) => {
    const from = starts[k];
    const next = k + 1 < SCENES.length ? starts[k + 1] : N3_DURATION;
    const dur = next - from;
    const nextS = SCENES[k + 1];
    const mine = s.card ? [] : T.lines.filter((x) => x.ch === s.ch && x.i >= s.from && (!nextS || nextS.ch !== s.ch || nextS.card || x.i < nextS.from));
    const lines = mine.map((x) => fr(x.start) - from);
    const words = mine.flatMap((x) => x.words.map(([w, t]) => [w, fr(t) - from] as [string, number]));
    return {key: `${s.ch}-${s.from}-${k}`, from, dur, lines, words, C: s.C, ch: s.ch, card: !!s.card};
  });
})();

/** Each scene gets a slow push (up to 5 %) toward a different point of the frame. */
const camera = (f: number) => {
  const w = WINDOWS.find((x) => f >= x.from && f < x.from + x.dur) ?? WINDOWS[WINDOWS.length - 1];
  const u = Math.min(1, Math.max(0, (f - w.from) / Math.max(1, w.dur)));
  const k = Math.sin((Math.PI / 2) * u);
  const idx = WINDOWS.indexOf(w);
  const ox = [50, 42, 58, 46, 54, 50][idx % 6];
  const oy = [50, 46, 54, 48, 44, 52][idx % 6];
  return {scale: 1 + 0.05 * k, origin: `${ox}% ${oy}%`};
};

export const N3Film: React.FC<{offset?: number}> = ({offset = 0}) => {
  const f = useCurrentFrame() + offset;
  const cam = camera(f);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#EAEAEA'}}>
      <Ground f={f} />
      <AbsoluteFill style={{transform: `scale(${cam.scale})`, transformOrigin: cam.origin}}>
        {WINDOWS.map((w) => {
          if (f < w.from - 2 || f > w.from + w.dur + EXIT_LEN + 10) return null;
          const exitAt = w.dur - 8;
          return (
            <Sequence key={w.key} from={w.from - offset} durationInFrames={w.dur + EXIT_LEN + 10} layout="none">
              <SceneCtx.Provider value={{dur: w.dur, exitAt, lines: w.lines, words: w.words, seed: w.from}}>
                <Fade exitAt={exitAt}>
                  <w.C />
                </Fade>
              </SceneCtx.Provider>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <Lens />
      <Outro f={f} />
    </AbsoluteFill>
  );
};

/** Clears anything drawn straight on the ground after the pieces have flown out. */
const Fade: React.FC<{exitAt: number; children: React.ReactNode}> = ({exitAt, children}) => {
  const f = useCurrentFrame();
  const o = 1 - Math.min(1, Math.max(0, (f - exitAt - 6) / 12));
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/** The ground settles to its resting field at the very end. */
const Outro: React.FC<{f: number}> = ({f}) => {
  const k = Math.min(1, Math.max(0, (f - (N3_DURATION - 24)) / 18));
  return k > 0 ? <AbsoluteFill style={{background: '#EAEAEA', opacity: k}} /> : null;
};

/** One chapter, for rendering the film in parts on Lambda (picture only; audio is muxed after). */
export const N3Part: React.FC<{part: number}> = ({part}) => <N3Film offset={N3_CHAPTERS[part].from} />;
