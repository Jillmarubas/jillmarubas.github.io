import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {E, clamp, lerp} from './util';
import type {EaseFn} from './util';

const useT = () => {
  const {fps, width, height} = useVideoConfig();
  return {t: useCurrentFrame() / fps, fps, width, height};
};

/** Horizontal speed-based blur so fast moves smear (a stand-in for a 180° shutter). */
const smear = (pxPerFrame: number) => Math.min(18, Math.abs(pxPerFrame) * 0.35);

/**
 * Lineup entrance: supporting photos (cut-outs) slide in from both frame edges toward their
 * spots, landing on the line that names them. Reference 7: rivals slide in beside the subject.
 * Back-row items can be dimmer and smaller. Positions are the item's centre-bottom in px.
 */
export type EntranceItem = {node: React.ReactNode; side: 'l' | 'r'; x: number; y: number; at: number; height: number; dim?: number};
export const SideEntrance: React.FC<{items: EntranceItem[]; dur?: number; ease?: EaseFn}> = ({items, dur = 0.7, ease = E.out}) => {
  const {t, fps, width} = useT();
  return (
    <AbsoluteFill>
      {items.map((it, i) => {
        const off = it.side === 'l' ? -it.height * 0.6 : width + it.height * 0.6;
        const xAt = (tt: number) => lerp(off, it.x, ease(clamp((tt - it.at) / dur)));
        const x = xAt(t);
        const v = xAt(t) - xAt(t - 1 / fps);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: it.y,
              height: it.height,
              transform: 'translate(-50%, -100%)',
              filter: `blur(${smear(v)}px) brightness(${1 - (it.dim ?? 0)})`,
              opacity: t < it.at ? 0 : 1,
            }}
          >
            {it.node}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Face-off: two giant profiles facing each other at the frame edges, the conflict scene between
 * them. They creep toward each other through the shot (tension) with a slow push-in.
 * Pass cut-outs facing inward (left one looks right). Reference 7, clip 2.
 */
export const FaceOff: React.FC<{left: React.ReactNode; right: React.ReactNode; center?: React.ReactNode; dur: number; close?: number; push?: number}> = ({
  left,
  right,
  center,
  dur,
  close = 70,
  push = 0.05,
}) => {
  const {t, height} = useT();
  const p = E.easy(clamp(t / dur));
  const side = (from: 'l' | 'r', node: React.ReactNode) => (
    <div
      style={{
        position: 'absolute',
        bottom: -height * 0.08,
        [from === 'l' ? 'left' : 'right']: -height * 0.18 + close * p,
        height: height * 1.15,
      }}
    >
      {node}
    </div>
  );
  return (
    <AbsoluteFill style={{transform: `scale(${1 + push * p})`}}>
      {center && <AbsoluteFill>{center}</AbsoluteFill>}
      {side('l', left)}
      {side('r', right)}
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,.55), transparent 22%, transparent 78%, rgba(0,0,0,.55))'}} />
    </AbsoluteFill>
  );
};

/**
 * Over-the-shoulder: the subject's back/shoulders big and soft in the foreground, looking at
 * the target behind (eyeline in one frame). Slides up into place and drifts.
 */
export const OverShoulder: React.FC<{node: React.ReactNode; at: number; dur?: number; x?: number; blur?: number; size?: number}> = ({
  node,
  at,
  dur = 0.9,
  x = 0.3,
  blur = 7,
  size = 1.0,
}) => {
  const {t, width, height} = useT();
  if (t < at) return null;
  const p = E.out(clamp((t - at) / dur));
  return (
    <div
      style={{
        position: 'absolute',
        left: width * x,
        bottom: lerp(-height * 0.6, -height * 0.12, p),
        height: height * size,
        transform: `translateX(-50%) translateX(${(t - at) * 6}px)`,
        filter: `blur(${blur}px)`,
      }}
    >
      {node}
    </div>
  );
};

/**
 * Foreground sweep: a near prop (gold bars, a column, a railing) crossing the frame fast and out
 * of focus, the strongest depth cue (reference 7: about 160 px/s at 1080p).
 */
export const ForegroundSweep: React.FC<{node: React.ReactNode; at: number; dur: number; fromX: number; toX: number; y: number; height: number; blur?: number; ease?: EaseFn}> = ({
  node,
  at,
  dur,
  fromX,
  toX,
  y,
  height,
  blur = 12,
  ease = E.easy,
}) => {
  const {t, fps} = useT();
  if (t < at || t > at + dur) return null;
  const xAt = (tt: number) => lerp(fromX, toX, ease(clamp((tt - at) / dur)));
  const v = xAt(t) - xAt(t - 1 / fps);
  return (
    <div style={{position: 'absolute', left: xAt(t), top: y, height, transform: 'translate(-50%, -50%)', filter: `blur(${blur + smear(v)}px)`}}>
      {node}
    </div>
  );
};

/**
 * Colour-temperature tint for story turns: cold void ↔ warm skin and wood. Blend 'soft-light'
 * keeps blacks and whites. Animate `from`→`to` opacity over [at, at + dur].
 */
export const Tint: React.FC<{color: string; from?: number; to?: number; at?: number; dur?: number; blend?: React.CSSProperties['mixBlendMode']}> = ({
  color,
  from = 0.6,
  to = 0.6,
  at = 0,
  dur = 0.4,
  blend = 'soft-light',
}) => {
  const {t} = useT();
  const o = lerp(from, to, E.inOut(clamp((t - at) / dur)));
  return <AbsoluteFill style={{background: color, mixBlendMode: blend, opacity: o, pointerEvents: 'none'}} />;
};

/** Grain + vignette finish used on every documentary shot. */
export const DocFinish: React.FC<{grainSrc: string; vignette?: number; grain?: number}> = ({grainSrc, vignette = 0.6, grain = 0.18}) => {
  const {fps} = useVideoConfig();
  const k = Math.floor(useCurrentFrame() / Math.max(1, Math.round(fps / 15)));
  return (
    <>
      <AbsoluteFill style={{backgroundImage: `url(${grainSrc})`, backgroundPosition: `${(k * 137) % 512}px ${(k * 271) % 512}px`, mixBlendMode: 'overlay', opacity: grain}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,${vignette}) 100%)`}} />
    </>
  );
};
