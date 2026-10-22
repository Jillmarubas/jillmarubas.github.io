import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {E, clamp, hash01} from './util';

/**
 * Name title that "decodes": random glyphs settle into the real letters left to right, with a
 * strong glow (reference 7: "John D. Rzn" → "John D. Rockefeller", about 1.1 s).
 * Start it on the frame the narrator says the name. It leaves left to right (fade + blur).
 * Times are in seconds, local to the enclosing Sequence.
 */
export const DecodeTitle: React.FC<{
  text: string;
  at: number;
  dur?: number; // time for the whole string to resolve
  exitAt?: number;
  exitDur?: number;
  size?: number;
  color?: string;
  glow?: string; // glow colour; '' for none
  font?: string;
  weight?: number;
  seed?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  at,
  dur = 1.1,
  exitAt,
  exitDur = 0.5,
  size = 110,
  color = '#F6C59A',
  glow = '#FF6A1A',
  font = 'Fraunces, Georgia, serif',
  weight = 900,
  seed = 7,
  style,
}) => {
  const {fps} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  if (t < at) return null;
  const chars = [...text];
  const n = Math.max(1, chars.length - 1);
  const GLYPHS = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghkmnopqrstuvwxyz0123456789';
  const bucket = Math.floor(t * 15); // scrambled glyphs change 15 times a second
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        color,
        whiteSpace: 'pre',
        textAlign: 'center',
        letterSpacing: '0.01em',
        textShadow: glow
          ? `0 0 ${size * 0.12}px ${glow}, 0 0 ${size * 0.35}px ${glow}aa, 0 0 ${size * 0.8}px ${glow}55`
          : undefined,
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        if (ch === ' ') return <span key={i}> </span>;
        // Each letter starts scrambling a little after the previous one and resolves in order.
        const start = at + (i / n) * dur * 0.35;
        const resolve = at + (0.25 + 0.75 * (i / n)) * dur + (hash01(i, seed) - 0.5) * 0.08;
        if (t < start) return <span key={i} style={{opacity: 0}}>{ch}</span>;
        const shown =
          t >= resolve ? ch : GLYPHS[Math.floor(hash01(i, bucket, seed) * GLYPHS.length)];
        const appear = E.out(clamp((t - start) / 0.12));
        let o = (t >= resolve ? 1 : 0.75) * appear;
        let blur = 0;
        if (exitAt !== undefined && t >= exitAt) {
          const e = E.in(clamp((t - exitAt - (i / n) * exitDur * 0.6) / (exitDur * 0.4)));
          o *= 1 - e;
          blur = 10 * e;
        }
        return (
          <span key={i} style={{display: 'inline-block', opacity: o, filter: blur ? `blur(${blur}px)` : undefined}}>
            {shown}
          </span>
        );
      })}
    </div>
  );
};
