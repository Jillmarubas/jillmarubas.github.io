import React from 'react';

/** Placeholder art drawn in code (no real people): use real licensed cut-outs in films. */
const Rim: React.FC<{id: string; rim: string}> = ({id, rim}) => (
  <defs>
    <linearGradient id={`${id}-f`} x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stopColor="#2a2420" />
      <stop offset="1" stopColor="#0d0b0a" />
    </linearGradient>
    <filter id={`${id}-g`} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" />
    </filter>
    <linearGradient id={`${id}-r`} x1="0" x2="1">
      <stop offset="0" stopColor={rim} stopOpacity="0" />
      <stop offset="1" stopColor={rim} />
    </linearGradient>
  </defs>
);

const PROFILE =
  'M 120 600 L 120 470 C 120 430 100 420 95 380 C 70 330 60 250 90 180 C 120 100 200 70 260 90 C 300 105 318 150 320 190 L 345 250 L 330 262 C 335 280 332 290 325 300 C 333 312 330 322 322 332 C 318 350 315 365 300 375 C 280 385 260 385 250 395 L 255 470 C 300 490 360 520 400 560 L 400 600 Z';

/** Head-and-shoulders profile facing right (flip to face left). */
export const ProfileHead: React.FC<{flip?: boolean; rim?: string; id: string}> = ({flip, rim = '#ff8a3d', id}) => (
  <svg viewBox="0 0 400 600" style={{height: '100%', transform: flip ? 'scaleX(-1)' : undefined, overflow: 'visible'}}>
    <Rim id={id} rim={rim} />
    <path d={PROFILE} fill={`url(#${id}-r)`} filter={`url(#${id}-g)`} opacity={0.55} transform="translate(6,-4)" />
    <path d={PROFILE} fill={`url(#${id}-f)`} />
  </svg>
);

/** Back view: head and shoulders (for over-the-shoulder shots). */
export const ShouldersBack: React.FC<{rim?: string; id: string}> = ({rim = '#9fb6ff', id}) => (
  <svg viewBox="0 0 600 520" style={{height: '100%', overflow: 'visible'}}>
    <Rim id={id} rim={rim} />
    <g filter={`url(#${id}-g)`} opacity={0.45} transform="translate(-5,-6)">
      <ellipse cx="300" cy="170" rx="88" ry="108" fill={rim} />
      <path d="M 30 520 C 50 390 180 335 300 325 C 420 335 550 390 570 520 Z" fill={rim} />
    </g>
    <ellipse cx="300" cy="170" rx="88" ry="108" fill={`url(#${id}-f)`} />
    <rect x="255" y="250" width="90" height="90" fill="#141110" />
    <path d="M 30 520 C 50 390 180 335 300 325 C 420 335 550 390 570 520 Z" fill={`url(#${id}-f)`} />
  </svg>
);

/** Front bust silhouette; `hat` adds a top hat for variety. */
export const Bust: React.FC<{hat?: boolean; rim?: string; id: string}> = ({hat, rim = '#ffd27a', id}) => (
  <svg viewBox="0 0 300 420" style={{height: '100%', overflow: 'visible'}}>
    <Rim id={id} rim={rim} />
    <g filter={`url(#${id}-g)`} opacity={0.5} transform="translate(4,-5)">
      <ellipse cx="150" cy="150" rx="62" ry="78" fill={rim} />
      <path d="M 10 420 C 20 300 90 255 150 250 C 210 255 280 300 290 420 Z" fill={rim} />
    </g>
    <ellipse cx="150" cy="150" rx="62" ry="78" fill={`url(#${id}-f)`} />
    <path d="M 10 420 C 20 300 90 255 150 250 C 210 255 280 300 290 420 Z" fill={`url(#${id}-f)`} />
    {hat && <path d="M 92 92 L 208 92 L 196 18 L 104 18 Z M 70 96 L 230 96 L 230 108 L 70 108 Z" fill="#100d0b" />}
  </svg>
);

/** A stack of gold bars (for foreground sweeps). */
export const GoldBars: React.FC = () => (
  <svg viewBox="0 0 420 520" style={{height: '100%', overflow: 'visible'}}>
    <defs>
      <linearGradient id="gold" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fff0b0" />
        <stop offset="0.45" stopColor="#e3ad45" />
        <stop offset="1" stopColor="#7d4f10" />
      </linearGradient>
    </defs>
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M ${30 + (i % 2) * 20} ${430 - i * 100} L ${390 - (i % 2) * 20} ${430 - i * 100} L ${360 - (i % 2) * 20} ${350 - i * 100} L ${60 + (i % 2) * 20} ${350 - i * 100} Z`} fill="url(#gold)" />
    ))}
  </svg>
);
