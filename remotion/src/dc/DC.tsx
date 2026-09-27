import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import TIMING from './timing.json';
import './fonts';
import {C, F, FPS, H, W} from './design';
import {EXIT_LEN, SceneCtx} from './kit';
import {SCENES} from './scenes';

/*
 * "Why people hate data centres": a 16:9 Vox-style explainer (script: SCRIPT.md, design:
 * DESIGN.md). Every scene is keyed to the voiceover through timing.json, which
 * scripts/dc_timing.py builds from the ElevenLabs takes. The desk (paper) stays put; pieces enter
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
const Lens: React.FC<{f: number}> = ({f}) => (
  <>
    {/* soft focus falling off toward the edges, so the eye stays in the middle */}
    <AbsoluteFill style={{backdropFilter: 'blur(5px)', WebkitMaskImage: 'radial-gradient(ellipse 72% 70% at 50% 50%, transparent 64%, black 100%)', maskImage: 'radial-gradient(ellipse 72% 70% at 50% 50%, transparent 64%, black 100%)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 48%, transparent 58%, rgba(60,44,28,0.20) 100%)'}} />
    <AbsoluteFill style={{backgroundImage: `url(${staticFile('dc/grain.png')})`, backgroundPosition: `${(f * 37) % 256}px ${(f * 61) % 256}px`, opacity: 0.06, mixBlendMode: 'multiply'}} />
  </>
);

/* ------------------------------------------------------------------ the film */
export const DCFilm: React.FC<{offset?: number}> = ({offset = 0}) => {
  const f = useCurrentFrame() + offset;
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <Img src={staticFile('dc/paper.jpg')} style={{position: 'absolute', width: W, height: H}} />
      {windows.map((w) => {
        if (f < w.from - 2 || f > w.from + w.dur + EXIT_LEN + 12) return null;
        const exitAt = w.dur - 14;
        return (
          <Sequence key={w.key} from={w.from - offset} durationInFrames={w.dur + EXIT_LEN + 12} layout="none">
            <SceneCtx.Provider value={{dur: w.dur, exitAt, lines: w.lines, seed: w.from}}>
              <Breathe dur={w.dur}>
                <w.C />
              </Breathe>
            </SceneCtx.Provider>
          </Sequence>
        );
      })}
      <Lens f={f} />
    </AbsoluteFill>
  );
};

/** A slow, barely-there push in and out over each scene (the user's "a bit of zoom"). */
const Breathe: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const u = Math.min(1, Math.max(0, f / Math.max(1, dur)));
  const s = 1 + 0.025 * Math.sin(Math.PI * u) ** 2;
  return <AbsoluteFill style={{transform: `scale(${s})`}}>{children}</AbsoluteFill>;
};

/** One chapter, for rendering the film in parts on Lambda (picture only; audio is muxed after). */
export const DCPart: React.FC<{part: number}> = ({part}) => <DCFilm offset={DC_CHAPTERS[part].from} />;
