// Overlay pieces for screen tutorials: cursor, button, highlight ring, typed field, toast, caption.
import React from 'react';
import {interpolate} from 'remotion';
import {MAC, ease} from './theme';
import {CursorState, Rect, prog} from './timeline';

// macOS arrow pointer, tip at (x, y). Lives inside the screen so it zooms with the camera.
export const Cursor: React.FC<{c: CursorState}> = ({c}) => (
  <>
    {c.ripple > 0 && (
      <div
        style={{
          position: 'absolute',
          left: c.x - 28,
          top: c.y - 28,
          width: 56,
          height: 56,
          borderRadius: 28,
          border: `3px solid ${MAC.accent}`,
          background: MAC.accentSoft,
          transform: `scale(${0.2 + ease.swift(c.ripple) * 0.9})`,
          opacity: (1 - c.ripple) * 0.9,
          zIndex: 90,
        }}
      />
    )}
    <svg
      width={26}
      height={34}
      viewBox="0 0 26 34"
      style={{position: 'absolute', left: c.x - 4, top: c.y - 3, transform: `scale(${1 - c.press * 0.14})`, transformOrigin: '4px 3px', opacity: c.visible, filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.45))', zIndex: 91}}
    >
      <path d="M4 3 L4 26 L9.4 20.9 L13 29.4 L16.6 27.9 L13.1 19.6 L20.4 19.6 Z" fill="#000" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  </>
);

export const Button: React.FC<{rect: Rect; label: React.ReactNode; kind?: 'primary' | 'secondary'; hover?: boolean; press?: number; z?: number}> = ({rect, label, kind = 'primary', hover, press = 0, z}) => (
  <div
    style={{
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.w,
      height: rect.h,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      fontFamily: MAC.font.ui,
      fontSize: 14,
      fontWeight: 600,
      color: kind === 'primary' ? '#fff' : MAC.ui.text,
      background: kind === 'primary' ? MAC.accent : MAC.ui.raised,
      boxShadow: kind === 'primary' ? 'inset 0 1px 0 rgba(255,255,255,.22), 0 1px 2px rgba(0,0,0,.4)' : `inset 0 0 0 1px ${MAC.ui.lineStrong}`,
      filter: `brightness(${(hover ? 1.12 : 1) - press * 0.22})`,
      transform: `scale(${1 - press * 0.03})`,
      zIndex: z,
    }}
  >
    {label}
  </div>
);

// Draws a ring around the part being explained and dims everything else.
export const Highlight: React.FC<{rect: Rect; frame: number; start: number; end: number; pad?: number; dim?: number}> = ({rect, frame, start, end, pad = 8, dim = 0.5}) => {
  if (frame < start || frame > end + 10) return null;
  const pin = prog(frame, start, 12);
  const pout = 1 - prog(frame, end, 10, ease.morph);
  const p = Math.min(pin, pout);
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x - pad,
        top: rect.y - pad,
        width: rect.w + pad * 2,
        height: rect.h + pad * 2,
        borderRadius: 12,
        border: `3px solid ${MAC.accent}`,
        boxShadow: `0 0 0 9999px rgba(0,0,0,${dim * p}), 0 0 24px rgba(10,132,255,${0.55 * p})`,
        transform: `scale(${interpolate(pin, [0, 1], [1.18, 1])})`,
        opacity: p,
        zIndex: 80,
        pointerEvents: 'none',
      }}
    />
  );
};

// Text field with a blinking caret while focused.
export const Field: React.FC<{rect: Rect; text: string; placeholder?: string; focused?: boolean; frame: number}> = ({rect, text, placeholder, focused, frame}) => (
  <div
    style={{
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.w,
      height: rect.h,
      borderRadius: 7,
      background: MAC.ui.field,
      boxShadow: focused ? `0 0 0 3.5px rgba(10,132,255,.5), inset 0 0 0 1px ${MAC.accent}` : `inset 0 0 0 1px ${MAC.ui.lineStrong}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      fontFamily: MAC.font.ui,
      fontSize: 15,
      color: text ? MAC.ui.text : MAC.ui.text3,
    }}
  >
    <span style={{whiteSpace: 'pre'}}>{text || (focused ? '' : placeholder)}</span>
    {focused && <span style={{width: 1.5, height: 18, marginLeft: 1, background: MAC.ui.text, opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0}} />}
  </div>
);

// macOS-style notification banner sliding in from the top-right corner.
export const Toast: React.FC<{frame: number; start: number; end: number; title: string; body: string; icon?: React.ReactNode; screenW: number; top?: number}> = ({frame, start, end, title, body, icon, screenW, top = 46}) => {
  if (frame < start || frame > end + 12) return null;
  const pin = prog(frame, start, 14);
  const pout = prog(frame, end, 12, ease.morph);
  const w = 360;
  return (
    <div
      style={{
        position: 'absolute',
        left: screenW - w - 16 + (1 - pin) * (w + 30) + pout * (w + 30),
        top,
        width: w,
        borderRadius: 16,
        padding: '12px 14px',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        background: 'rgba(44,44,48,.82)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 12px 30px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.12)',
        fontFamily: MAC.font.ui,
        color: MAC.ui.text,
        zIndex: 85,
      }}
    >
      {icon && <div style={{width: 38, height: 38, flex: 'none'}}>{icon}</div>}
      <div>
        <div style={{fontSize: 14, fontWeight: 700}}>{title}</div>
        <div style={{fontSize: 13, color: MAC.ui.text2, marginTop: 2}}>{body}</div>
      </div>
    </div>
  );
};

// Subtitle for the voiceover line, on the stage (not zoomed). Words rise in one after another.
export const Caption: React.FC<{frame: number; start: number; end: number; text: string}> = ({frame, start, end, text}) => {
  if (frame < start || frame > end + 8) return null;
  const out = 1 - prog(frame, end, 8, ease.morph);
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', opacity: out, zIndex: 100}}>
      <div style={{maxWidth: 1400, padding: '14px 26px', borderRadius: 18, background: 'rgba(10,11,14,.72)', backdropFilter: 'blur(16px)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.08)', fontFamily: MAC.font.ui, fontSize: 34, fontWeight: 600, color: '#f5f5f7', letterSpacing: '-0.01em', textAlign: 'center'}}>
        {words.map((w, i) => {
          const p = prog(frame, start + i * 2, 9);
          return (
            <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 14}px)`, filter: `blur(${(1 - p) * 4}px)`, marginRight: i < words.length - 1 ? '0.28em' : 0}}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
