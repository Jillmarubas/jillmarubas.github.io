// Shared look for the 2D and 3D scenes that replace cut-outs (review notes: saturated colour, informative, varied camera angles).
import React from 'react';
import {interpolate} from 'remotion';
import {FPS} from '../design';
import {settle} from '../kit';

/** Saturated palette. One scene uses a ground colour plus two or three of these. */
export const P = {
  night: '#0B1638',
  navy: '#14245C',
  blue: '#2F6BFF',
  sky: '#46B4FF',
  water: '#1FA2FF',
  teal: '#00B8A9',
  green: '#22B35E',
  grass: '#7ED957',
  yellow: '#FFC531',
  orange: '#FF7A1A',
  red: '#E5401F',
  pink: '#FF4F8B',
  purple: '#7B5CFF',
  plum: '#2A1B5E',
  white: '#FFFFFF',
  cream: '#FFF6E5',
  ink: '#101322',
  steel: '#AEB8CC',
};
export const AF = {head: 'Poppins, sans-serif', body: 'Inter, sans-serif', mono: '"IBM Plex Mono", monospace'};

/** Props every animated scene gets: f = frames since the scene started, t0 = its start on the film (s), dur = its length in frames. */
export type AnimProps = {f: number; t0: number; dur: number};
/** Frame (relative to the scene) of a moment on the film's timeline, e.g. when a word is spoken. */
export const at = (t0: number, abs: number) => (abs - t0) * FPS;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** 0→1 over d frames from a, eased. */
export const ease = (f: number, a: number, d: number) => settle(interpolate(f, [a, a + Math.max(1, d)], [0, 1], clamp));
/** 0→1 with a small overshoot, for things that pop in. */
export const pop = (f: number, a: number, d = 12) => {
  const x = interpolate(f, [a, a + d], [0, 1], clamp);
  return x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** A rounded label card used across the scenes. */
export const Tag: React.FC<{children: React.ReactNode; bg?: string; color?: string; size?: number; style?: React.CSSProperties}> = ({children, bg = P.white, color = P.ink, size = 34, style}) => (
  <div style={{display: 'inline-block', background: bg, color, fontFamily: AF.head, fontWeight: 700, fontSize: size, lineHeight: 1.15, padding: `${size * 0.32}px ${size * 0.6}px`, borderRadius: size * 0.5, whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', ...style}}>
    {children}
  </div>
);
/** Small caps line under a tag: sources, units. */
export const Note: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = 'rgba(255,255,255,0.8)', size = 20, style}) => (
  <div style={{fontFamily: AF.mono, fontWeight: 500, fontSize: size, letterSpacing: '0.08em', textTransform: 'uppercase', color, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
