import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';

/** The graphics area: between the top bar and the captions, clear of the Shorts UI. */
export const Stage: React.FC<{children: React.ReactNode; gap?: number; style?: React.CSSProperties}> = ({children, gap = 36, style}) => (
  <AbsoluteFill style={{top: 250, height: 900, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap, padding: '0 60px', ...style}}>
    {children}
  </AbsoluteFill>
);

export const display = (size: number, color: string = C.text, weight = 900): React.CSSProperties => ({
  fontFamily: F.display,
  fontWeight: weight,
  fontSize: size,
  lineHeight: 0.98,
  letterSpacing: '-.035em',
  color,
});

export const glow = (color = 'rgba(250,90,5,.6)', r = 40) => ({textShadow: `0 0 ${r}px ${color}`});
