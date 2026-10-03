import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import TIMING from './timing.json';
import './fonts';
import {FPS} from './design';
import {Desk, Lens} from './Desk';
import {EXIT_LEN, SceneCtx} from './kit';
import {SCENES} from './scenes';

/*
 * "AI News, 1 Oct 2026": a 16:9 Vox-style news explainer in the paper-collage look, 24 fps.
 * Every scene is keyed to the Asher voiceover through timing.json (scripts/news1001_timing.py).
 * Picture only; the mixed soundtrack is muxed after the Lambda render.
 */
type Line = {ch: number; i: number; start: number; end: number};
type Ch = {title: string; key: string; start: number; card: number; vo: number; end: number};
const T = TIMING as unknown as {duration: number; chapters: Ch[]; lines: Line[]};
export const fr = (s: number) => Math.round(s * FPS);
export const N1_DURATION = fr(T.duration);
export const N1_CHAPTERS = T.chapters.map((c) => ({title: c.title, key: c.key, from: fr(c.start), to: fr(c.end)}));

const LEAD = 8; // pieces start moving this many frames before their line is spoken
export type Win = {key: string; from: number; dur: number; lines: number[]; C: React.FC; ch: number; card: boolean};
export const WINDOWS: Win[] = (() => {
  const starts = SCENES.map((s) => {
    if (s.card) return fr(T.chapters[s.ch].start);
    const l = T.lines.find((x) => x.ch === s.ch && x.i === s.from);
    if (!l) throw new Error(`no line ${s.ch}/${s.from}`);
    return fr(l.start) - LEAD;
  });
  return SCENES.map((s, k) => {
    const from = starts[k];
    const next = k + 1 < SCENES.length ? starts[k + 1] : N1_DURATION;
    const dur = next - from;
    const nextS = SCENES[k + 1];
    const lines = s.card ? [] : T.lines.filter((x) => x.ch === s.ch && x.i >= s.from && (!nextS || nextS.ch !== s.ch || nextS.card || x.i < nextS.from)).map((x) => fr(x.start) - from);
    return {key: `${s.ch}-${s.from}-${k}`, from, dur, lines, C: s.C, ch: s.ch, card: !!s.card};
  });
})();

/** Each scene gets a slow push (up to 6 %) toward a different point of the frame. */
const camera = (f: number) => {
  const w = WINDOWS.find((x) => f >= x.from && f < x.from + x.dur) ?? WINDOWS[WINDOWS.length - 1];
  const u = Math.min(1, Math.max(0, (f - w.from) / Math.max(1, w.dur)));
  const k = Math.sin((Math.PI / 2) * u);
  const idx = WINDOWS.indexOf(w);
  const ox = [50, 40, 60, 46, 56, 50][idx % 6];
  const oy = [50, 44, 56, 48, 42, 52][idx % 6];
  return {scale: 1 + 0.06 * k, origin: `${ox}% ${oy}%`};
};

export const N1Film: React.FC<{offset?: number}> = ({offset = 0}) => {
  const f = useCurrentFrame() + offset;
  const cam = camera(f);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${cam.scale})`, transformOrigin: cam.origin}}>
        <Desk f={f} />
        {WINDOWS.map((w) => {
          if (f < w.from - 2 || f > w.from + w.dur + EXIT_LEN + 10) return null;
          const exitAt = w.dur - 10;
          return (
            <Sequence key={w.key} from={w.from - offset} durationInFrames={w.dur + EXIT_LEN + 10} layout="none">
              <SceneCtx.Provider value={{dur: w.dur, exitAt, lines: w.lines, seed: w.from}}>
                <Fade exitAt={exitAt}>
                  <w.C />
                </Fade>
              </SceneCtx.Provider>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <Lens f={f} />
      <Outro f={f} />
    </AbsoluteFill>
  );
};

/** Clears anything drawn straight on the desk after the pieces have flown out. */
const Fade: React.FC<{exitAt: number; children: React.ReactNode}> = ({exitAt, children}) => {
  const f = useCurrentFrame();
  const o = 1 - Math.min(1, Math.max(0, (f - exitAt - 6) / 12));
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/** The lamp clicks off at the very end. */
const Outro: React.FC<{f: number}> = ({f}) => {
  const end = N1_DURATION;
  const k = Math.min(1, Math.max(0, (f - (end - 30)) / 6));
  return k > 0 ? <AbsoluteFill style={{background: '#050403', opacity: k}} /> : null;
};

/** One chapter, for rendering the film in parts on Lambda (picture only; audio is muxed after). */
export const N1Part: React.FC<{part: number}> = ({part}) => <N1Film offset={N1_CHAPTERS[part].from} />;
