// Drawn (2D) objects that sit on glass: waveforms, code, rain, call rings, marks, buttons.
import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {C, clamp, F, glass} from './theme';
import {glassBox} from './ui';

// Waveform on a glass card; `smooth` 0 = jagged/robotic, 1 = natural.
export const Wave: React.FC<{w: number; h: number; smooth?: number; color?: string; seed?: number; label?: string}> = ({w, h, smooth = 1, color = C.frost, seed = 1, label}) => {
  const f = useCurrentFrame();
  const bars = 48;
  return (
    <div style={{...glassBox('panel', 24), width: w, height: h, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 5, position: 'relative'}}>
      {Array.from({length: bars}).map((_, i) => {
        const natural = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.37 + f / 6 + seed) * Math.sin(i * 0.11 + f / 11));
        const robot = random(`r${seed}-${i}-${Math.floor(f / 4)}`) > 0.5 ? 0.9 : 0.2;
        const v = robot + (natural - robot) * smooth;
        return <div key={i} style={{flex: 1, height: `${Math.max(6, v * (h - 60))}px`, borderRadius: 4, background: color, opacity: 0.55 + 0.45 * v}} />;
      })}
      {label && (
        <div style={{position: 'absolute', left: 24, top: -40, fontFamily: F.mono, fontSize: 20, letterSpacing: '0.1em', color: C.text2, textTransform: 'uppercase'}}>{label}</div>
      )}
    </div>
  );
};

export const CodeCard: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const lines = [0.7, 0.45, 0.85, 0.55, 0.3, 0.65];
  return (
    <div style={{...glassBox('panel', 22), width: 300, padding: '22px 26px'}}>
      <div style={{display: 'flex', gap: 8, marginBottom: 16}}>
        {[C.err, C.warn, C.ok].map((c) => (
          <span key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
        ))}
      </div>
      {lines.map((l, i) => {
        const k = interpolate(f, [at + i * 3, at + i * 3 + 8], [0, 1], clamp);
        return <div key={i} style={{height: 12, marginBottom: 12, borderRadius: 6, width: `${l * 100 * k}%`, marginLeft: i % 3 ? 26 : 0, background: i % 2 ? C.periwinkle200 : C.ok}} />;
      })}
    </div>
  );
};

export const Rain: React.FC<{at: number; out: number}> = ({at, out}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 10, out - 10, out], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o * 0.55, overflow: 'hidden'}}>
      {Array.from({length: 70}).map((_, i) => {
        const x = random(`rx${i}`) * 1920;
        const sp = 28 + random(`rs${i}`) * 18;
        const y = ((random(`ry${i}`) * 1200 + (f - at) * sp) % 1300) - 150;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 2, height: 60, borderRadius: 1, background: 'linear-gradient(transparent, rgba(244,246,251,.8))', transform: 'rotate(12deg)'}} />;
      })}
    </div>
  );
};

// Expanding rings (a phone ringing, a signal).
export const Rings: React.FC<{at: number; color?: string; size?: number}> = ({at, color = C.ok, size = 520}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return (
    <div style={{position: 'absolute', left: -size / 2, top: -size / 2, width: size, height: size}}>
      {[0, 1, 2].map((k) => {
        const t = ((f - at + k * 18) % 54) / 54;
        return <div key={k} style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${color}`, transform: `scale(${0.35 + t * 0.65})`, opacity: (1 - t) * 0.8}} />;
      })}
    </div>
  );
};

export const XMark: React.FC<{at: number; size?: number}> = ({at, size = 120}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [at, at + 7], [0, 1], {...clamp, easing: glass});
  const b = interpolate(f, [at + 4, at + 11], [0, 1], {...clamp, easing: glass});
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', left: -size / 2, top: -size / 2, filter: `drop-shadow(0 0 12px ${C.err})`}}>
      <line x1={18} y1={18} x2={82} y2={82} stroke={C.err} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - a} />
      <line x1={82} y1={18} x2={18} y2={82} stroke={C.err} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - b} />
    </svg>
  );
};

export const Progress: React.FC<{label: string; at: number; stopAt: number; to: number; w?: number}> = ({label, at, stopAt, to, w = 520}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [at, stopAt], [to * 0.55, to], clamp);
  const stopped = f >= stopAt;
  return (
    <div style={{...glassBox('panel', 20), width: w, padding: '18px 22px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 20, letterSpacing: '0.1em', color: C.text2, marginBottom: 12}}>
        <span>{label}</span>
        <span style={{color: stopped ? C.warn : C.text2}}>{stopped ? 'PAUSED' : `${Math.round(v * 100)}%`}</span>
      </div>
      <div style={{height: 14, borderRadius: 7, background: 'rgba(255,255,255,.12)'}}>
        <div style={{height: 14, borderRadius: 7, width: `${v * 100}%`, background: stopped ? C.warn : C.frost}} />
      </div>
    </div>
  );
};

export const Flash: React.FC<{at: number; color?: string}> = ({at, color = 'rgba(247,205,134,.9)'}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 3, at + 12], [0, 1, 0], clamp);
  if (o <= 0) return null;
  return <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 60% 50%, ${color}, rgba(0,0,0,0) 60%)`, mixBlendMode: 'screen', opacity: o}} />;
};

// Like / Subscribe glass buttons that press when cued.
export const Press: React.FC<{at: number; label: string; icon: 'like' | 'sub' | 'chat'}> = ({at, label, icon}) => {
  const f = useCurrentFrame();
  const press = interpolate(f, [at, at + 4, at + 12], [0, 1, 0], clamp);
  const on = f >= at + 4;
  const ico =
    icon === 'like' ? (
      <path d="M8 20h3V10H8zm5 0h7l2-7v-2h-6l1-5-1-1-5 5z" fill={on ? C.cobalt800 : C.frost} />
    ) : icon === 'sub' ? (
      <path d="M4 6h16v12H4z M10 9v6l5-3z" fill={on ? C.cobalt800 : C.frost} fillRule="evenodd" />
    ) : (
      <path d="M4 5h16v11H9l-5 4z" fill={on ? C.cobalt800 : C.frost} />
    );
  return (
    <div
      style={{
        ...glassBox('modal', 999),
        display: 'inline-flex',
        alignItems: 'center',
        gap: 16,
        padding: '20px 36px 20px 28px',
        background: on ? C.frost : C.glassModal,
        transform: `scale(${1 - press * 0.08})`,
      }}
    >
      <svg width={40} height={40} viewBox="0 0 24 24">
        {ico}
      </svg>
      <span style={{fontFamily: F.sans, fontWeight: 600, fontSize: 36, color: on ? C.cobalt800 : C.frost, letterSpacing: '-0.02em'}}>{label}</span>
    </div>
  );
};
