import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import TIMING from './timing.json';
import './fonts';
import {C, FPS} from './design';
import {World} from './world';
import {EXIT_LEN, SceneCtx} from './kit';
import {SCENES} from './scenes';

/*
 * "Why people hate data centres": a 16:9 Vox-style explainer (script: SCRIPT.md, design:
 * DESIGN.md), colorful 2D vector edition. Every scene is keyed to the voiceover through timing.json, which
 * scripts/dc_timing.py builds from the ElevenLabs takes. An animated vector world sits behind everything; pieces enter
 * from the sides and leave toward the viewer at each scene change.
 */
type Line = {ch: number; i: number; start: number; end: number};
const T = TIMING as {duration: number; chapters: {title: string; start: number; card: number; vo: number; end: number}[]; lines: Line[]};
const fr = (s: number) => Math.round(s * FPS);
export const DC_DURATION = fr(T.duration);
export const DC_CHAPTERS = T.chapters.map((c) => ({title: c.title, from: fr(c.start), to: fr(c.end)}));

const LEAD = 10; // pieces start moving this many frames before their line is spoken
type Win = {key: string; from: number; dur: number; lines: number[]; C: React.FC; ch: number};
const windows: Win[] = (() => {
  const starts = SCENES.map((s) => {
    if (s.card) return fr(T.chapters[s.ch].start);
    const l = T.lines.find((x) => x.ch === s.ch && x.i === s.from)!;
    return fr(l.start) - LEAD;
  });
  return SCENES.map((s, k) => {
    const from = starts[k];
    const next = k + 1 < SCENES.length ? starts[k + 1] : DC_DURATION;
    const dur = next - from;
    const lines = s.card ? [] : T.lines.filter((x) => x.ch === s.ch && x.i >= s.from && (k + 1 >= SCENES.length || SCENES[k + 1].ch !== s.ch || SCENES[k + 1].card || x.i < SCENES[k + 1].from)).map((x) => fr(x.start) - from);
    return {key: `${s.ch}-${s.from}-${k}`, from, dur, lines, C: s.C, ch: s.ch};
  });
})();

/* ------------------------------------------------------------------ lens layers */
// Colorful vector edition: crisp edges, no grain; only a very light vignette to hold the eye.
const Lens: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 85% at 50% 48%, transparent 62%, rgba(27,43,69,0.12) 100%)'}} />;

/** The animated vector world, cross-fading to the next chapter's palette at each chapter start. */
const Backdrop: React.FC<{f: number}> = ({f}) => {
  let c = 0;
  DC_CHAPTERS.forEach((ch, i) => {
    if (f >= ch.from) c = i;
  });
  const into = Math.min(1, Math.max(0, (f - DC_CHAPTERS[c].from) / 24));
  return (
    <>
      {c > 0 && into < 1 && <World theme={c - 1} f={f} />}
      <AbsoluteFill style={{opacity: c > 0 ? into : 1}}>
        <World theme={c} f={f} />
      </AbsoluteFill>
    </>
  );
};

/* ------------------------------------------------------------------ the film */
/**
 * The camera: every scene gets a slow zoom in and back out (up to 9 %), each toward a different
 * point of the frame, so the whole world (backdrop and pieces together) pushes and pulls.
 */
const camera = (f: number) => {
  const w = windows.find((x) => f >= x.from && f < x.from + x.dur) ?? windows[windows.length - 1];
  const u = Math.min(1, Math.max(0, (f - w.from) / Math.max(1, w.dur)));
  const k = Math.sin(Math.PI * u) ** 2;
  const idx = windows.indexOf(w);
  const ox = [50, 38, 62, 45, 58, 50][idx % 6];
  const oy = [50, 44, 56, 48, 42, 52][idx % 6];
  return {scale: 1 + 0.09 * k, origin: `${ox}% ${oy}%`};
};

export const DCFilm: React.FC<{offset?: number}> = ({offset = 0}) => {
  const f = useCurrentFrame() + offset;
  const cam = camera(f);
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
     <AbsoluteFill style={{transform: `scale(${cam.scale})`, transformOrigin: cam.origin}}>
      <Backdrop f={f} />
      {windows.map((w) => {
        if (f < w.from - 2 || f > w.from + w.dur + EXIT_LEN + 12) return null;
        const exitAt = w.dur - 14;
        return (
          <Sequence key={w.key} from={w.from - offset} durationInFrames={w.dur + EXIT_LEN + 12} layout="none">
            <SceneCtx.Provider value={{dur: w.dur, exitAt, lines: w.lines, seed: w.from}}>
              <Breathe dur={w.dur} exitAt={exitAt}>
                <w.C />
              </Breathe>
            </SceneCtx.Provider>
          </Sequence>
        );
      })}
     </AbsoluteFill>
      <Lens />
    </AbsoluteFill>
  );
};

/** A slow, barely-there push in and out over each scene (the user's "a bit of zoom"). */
const Breathe: React.FC<{dur: number; exitAt: number; children: React.ReactNode}> = ({dur, exitAt, children}) => {
  const f = useCurrentFrame();
  const u = Math.min(1, Math.max(0, f / Math.max(1, dur)));
  void u;
  // pieces fly out toward the viewer on their own; this clears anything drawn straight on the desk
  const o = 1 - Math.min(1, Math.max(0, (f - exitAt - 8) / 16));
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/** One chapter, for rendering the film in parts on Lambda (picture only; audio is muxed after). */
export const DCPart: React.FC<{part: number}> = ({part}) => <DCFilm offset={DC_CHAPTERS[part].from} />;
