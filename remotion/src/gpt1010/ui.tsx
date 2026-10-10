// Shared motion-graphics pieces for the film: glass cards, a stroke icon set with trim-path
// reveals, part stingers, step badges, command cards, callouts, keycaps, calendars, gauges.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, F, R} from './design';
import {AText, Draw, E, Layer, bounce, clamp, enter, lerp, p01, tw} from './ae';

export const Glass: React.FC<{w?: number; h?: number; pad?: number; r?: number; glow?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, pad = 28, r = R.lg, glow = 0, children, style}) => (
  <div
    style={{
      width: w,
      height: h,
      padding: pad,
      boxSizing: 'border-box',
      borderRadius: r,
      background: 'linear-gradient(180deg, rgba(34,35,40,.86) 0%, rgba(20,21,25,.86) 100%)',
      boxShadow: `0 30px 70px -20px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(255,255,255,.07)${glow ? `, 0 0 ${60 * glow}px rgba(16,163,127,${0.35 * glow}), 0 0 0 1.5px rgba(16,163,127,${0.7 * glow})` : ''}`,
      backdropFilter: 'blur(18px)',
      position: 'relative',
      color: C.ink,
      fontFamily: F.ui,
      ...style,
    }}
  >
    {children}
  </div>
);

export const OpenAIMark: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 120, style}) => <Img src={staticFile('gpt1010/openai.svg')} style={{width: size, height: size, display: 'block', ...style}} />;

// ---------------------------------------------------------------- icons (24-unit stroke paths)
export const ICONS: Record<string, string[]> = {
  puzzle: ['M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4h-4a2 2 0 1 0-4 0H4v-4a2 2 0 1 0 0-4z'],
  plug: ['M9 2v5', 'M15 2v5', 'M6 7h12v4a6 6 0 0 1-12 0z', 'M12 17v5'],
  chip: ['M7 7h10v10H7z', 'M10 3v4', 'M14 3v4', 'M10 17v4', 'M14 17v4', 'M3 10h4', 'M3 14h4', 'M17 10h4', 'M17 14h4'],
  cloud: ['M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z'],
  clock: ['M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z', 'M12 7v5l3 2'],
  clipboard: ['M8 4h8v3H8z', 'M6 5H5v16h14V5h-1', 'M9 13l2 2 4-4'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z', 'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z'],
  check: ['M5 12.5l4.2 4.2L19 7'],
  x: ['M6 6l12 12', 'M18 6L6 18'],
  terminal: ['M3 5h18v14H3z', 'M7 10l3 2-3 2', 'M12 15h5'],
  desktop: ['M3 4h18v12H3z', 'M8 20h8', 'M12 16v4'],
  bolt: ['M13 2L4 14h7l-1 8 9-12h-7z'],
  bug: ['M8 9a4 4 0 0 1 8 0v5a4 4 0 0 1-8 0z', 'M12 9v9', 'M4 12h4', 'M16 12h4', 'M5 7l3 2', 'M19 7l-3 2', 'M5 18l3-2', 'M19 18l-3-2'],
  file: ['M6 3h8l4 4v14H6z', 'M14 3v4h4', 'M9 12h6', 'M9 16h6'],
  lock: ['M6 11h12v10H6z', 'M8 11V8a4 4 0 0 1 8 0v3'],
  flag: ['M5 21V4', 'M5 4h11l-2 4 2 4H5'],
  search: ['M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z', 'M15.5 15.5L21 21'],
  chart: ['M4 20V4', 'M4 20h16', 'M8 16l4-5 3 3 5-7'],
  users: ['M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M3 20a6 6 0 0 1 12 0', 'M16 4.5a3.5 3.5 0 0 1 0 6.5', 'M18 14a6 6 0 0 1 3 6'],
  branch: ['M6 3v12', 'M18 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z', 'M6 21a3 3 0 1 1 0-6 3 3 0 0 1 0 6z', 'M18 9a9 9 0 0 1-9 9'],
  keyboard: ['M2 6h20v12H2z', 'M6 10h.01', 'M10 10h.01', 'M14 10h.01', 'M18 10h.01', 'M7 14h10'],
  bell: ['M6 16V11a6 6 0 0 1 12 0v5l2 2H4z', 'M10 20a2 2 0 0 0 4 0'],
  refresh: ['M20 11a8 8 0 0 0-14.6-4.5L4 8', 'M4 3v5h5', 'M4 13a8 8 0 0 0 14.6 4.5L20 16', 'M20 21v-5h-5'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v5', 'M16 3v5'],
  rocket: ['M12 15l-3-3c1-5 4-8 10-9-1 6-4 9-9 10z', 'M9 12l-4 1 2-4 4-1', 'M12 15l-1 4 4-2 1-4', 'M6 18c-1 1-1 3-1 3s2 0 3-1'],
  target: ['M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z', 'M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z', 'M12 11.2a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6z'],
  thumb: ['M7 10v10H4V10z', 'M7 10l4-7a2 2 0 0 1 3 2l-1 4h6a2 2 0 0 1 2 2.3l-1.5 7A2 2 0 0 1 17.5 20H7'],
  chat: ['M4 5h16v11H9l-5 4z'],
  bulb: ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z'],
  play: ['M8 5v14l11-7z'],
  layers: ['M12 3l9 5-9 5-9-5z', 'M3 13l9 5 9-5'],
  gauge: ['M4 16a8 8 0 1 1 16 0', 'M12 16l4-5'],
  moon: ['M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z'],
  sun: ['M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z', 'M12 2v2', 'M12 20v2', 'M2 12h2', 'M20 12h2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'],
  pr: ['M6 3v18', 'M6 6a3 3 0 1 0 0-.01', 'M18 21a3 3 0 1 0 0-.01', 'M18 18V9a3 3 0 0 0-3-3h-4', 'M13 3l-3 3 3 3'],
  doc: ['M5 3h10l4 4v14H5z', 'M8 9h8', 'M8 13h8', 'M8 17h5'],
  cursor: ['M5 3l14 7-6 2-2 6z'],
  copy: ['M8 8h12v12H8z', 'M4 16V4h12'],
  star: ['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z'],
  dollar: ['M12 3v18', 'M16.5 7.5A4 4 0 0 0 12.5 6h-1.5a3 3 0 0 0 0 6h2a3 3 0 0 1 0 6H11a4 4 0 0 1-4-1.5'],
  gear: ['M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z', 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'M4.9 4.9l2.1 2.1', 'M17 17l2.1 2.1', 'M4.9 19.1L7 17', 'M17 7l2.1-2.1'],
  hook: ['M12 3v10a4 4 0 1 1-4-4'],
  scissors: ['M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z', 'M6 21a3 3 0 1 1 0-6 3 3 0 0 1 0 6z', 'M8.5 7.5L20 18', 'M8.5 16.5L20 6'],
  undo: ['M9 14L4 9l5-5', 'M4 9h10a6 6 0 0 1 0 12h-3'],
  globe: ['M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z', 'M3 12h18', 'M12 3c3 3.5 3 14.5 0 18', 'M12 3c-3 3.5-3 14.5 0 18'],
  pause: ['M8 5v14', 'M16 5v14'],
  edit: ['M4 20h4L19 9l-4-4L4 16z', 'M13 7l4 4'],
  plus: ['M12 5v14', 'M5 12h14'],
  wand: ['M4 20L16 8', 'M15 3v3', 'M19 7h3', 'M18 4l2-2', 'M13.5 5.5l5 5'],
  mic: ['M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z', 'M5 11a7 7 0 0 0 14 0', 'M12 18v3'],
  code: ['M8 7l-5 5 5 5', 'M16 7l5 5-5 5'],
  map: ['M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z', 'M9 3v15', 'M15 6v15'],
  sparkle: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', 'M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z'],
  mail: ['M3 6h18v12H3z', 'M3 7l9 6 9-6'],
  video: ['M3 7h12v10H3z', 'M15 10l6-3v10l-6-3z'],
  list: ['M9 6h11', 'M9 12h11', 'M9 18h11', 'M4.5 6h.01', 'M4.5 12h.01', 'M4.5 18h.01'],
  download: ['M12 4v11', 'M7 10l5 5 5-5', 'M4 20h16'],
  phone: ['M7 3h10v18H7z', 'M11 18h2'],
  form: ['M4 4h16v16H4z', 'M7 8h10', 'M7 12h10', 'M7 16h5'],
  button: ['M3 8h18v8H3z', 'M9 12h6'],
  hourglass: ['M6 3h12', 'M6 21h12', 'M7 3c0 5 10 5 10 9s-10 4-10 9', 'M17 3c0 5-10 5-10 9s10 4 10 9'],
};

/** Stroke icon; `p` draws it on (AE trim paths), 1 = fully drawn. */
export const Icon: React.FC<{name: keyof typeof ICONS | string; size?: number; color?: string; width?: number; p?: number; fill?: string}> = ({name, size = 48, color = C.ink, width = 1.8, p = 1, fill}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{display: 'block', overflow: 'visible'}}>
    {(ICONS[name] ?? []).map((d, i) => (
      <path key={i} d={d} pathLength={1} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={p >= 1 ? undefined : `${Math.max(0.0001, p)} 2`} fill={fill && p >= 1 ? fill : 'none'} />
    ))}
  </svg>
);

/** Round icon tile: draws its icon on, then sits with a soft acc rim. */
export const IconTile: React.FC<{t: number; at: number; name: string; size?: number; hot?: boolean; label?: string; sub?: string}> = ({t, at, name, size = 120, hot, label, sub}) => {
  const b = bounce(t, at, 13, 170);
  const p = p01(t, at + 0.08, 0.7, E.inOut);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, transform: `scale(${lerp(0.6, 1, b)})`, opacity: clamp(b * 2)}}>
      <div style={{width: size, height: size, borderRadius: size * 0.3, display: 'grid', placeItems: 'center', background: hot ? 'linear-gradient(160deg, rgba(16,163,127,.28), rgba(16,163,127,.08))' : 'linear-gradient(160deg, #26272c, #18191d)', boxShadow: `inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 1.5px ${hot ? 'rgba(16,163,127,.7)' : 'rgba(255,255,255,.08)'}, 0 24px 50px -18px rgba(0,0,0,.8)`}}>
        <Icon name={name} size={size * 0.48} color={hot ? C.accHi : C.ink} p={p} width={1.7} />
      </div>
      {label && <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: C.ink, textAlign: 'center', opacity: p01(t, at + 0.2, 0.4)}}>{label}</div>}
      {sub && <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink3, textAlign: 'center', opacity: p01(t, at + 0.3, 0.4), marginTop: -10}}>{sub}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- part stinger + corner tag
/** "PART 03 · Opus + Sonnet 5.5": a full-frame stinger at the chapter start that collapses into
 * a corner tag and stays for the rest of the chapter (so viewers always know where they are). */
export const PartTag: React.FC<{t: number; n?: string; title: string; dur: number; full?: boolean}> = ({t, n, title, dur, full = true}) => {
  const IN = 0;
  const HOLD = full ? 1.5 : 0;
  const col = full ? p01(t, HOLD, 0.7, E.inOut) : 1; // 0 = big centre, 1 = corner
  const out = p01(t, dur - 0.5, 0.4, E.in);
  const big = 1 - col;
  const x = lerp(960, 70, col);
  const y = lerp(540, 64, col);
  const s = lerp(1, 0.34, col);
  const numP = p01(t, IN, 0.9, E.inOut);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: '0 0', opacity: 1 - out, zIndex: 50}}>
      <div style={{position: 'absolute', transform: `translate(${-50 * big}%, -50%)`, display: 'flex', alignItems: 'center', gap: 46, whiteSpace: 'nowrap', width: 'max-content'}}>
        {n && (
          <svg width={300} height={240} viewBox="0 0 300 240" style={{overflow: 'visible'}}>
            <text x={0} y={200} fontFamily={F.display} fontWeight={900} fontSize={240} fill="none" stroke={C.acc} strokeWidth={3} strokeDasharray="900" strokeDashoffset={900 * (1 - numP)} letterSpacing="-10">
              {n}
            </text>
            <text x={0} y={200} fontFamily={F.display} fontWeight={900} fontSize={240} fill={C.acc} opacity={p01(t, IN + 0.55, 0.5)} letterSpacing="-10">
              {n}
            </text>
          </svg>
        )}
        <div>
          {n && <div style={{fontFamily: F.mono, fontSize: 30, letterSpacing: '0.3em', color: C.ink3, marginBottom: 14, opacity: p01(t, IN + 0.2, 0.4)}}>PART</div>}
          <AText t={t} text={title} at={IN + 0.25} size={118} by="char" stagger={0.018} style={{whiteSpace: 'nowrap'}} />
          <div style={{height: 8, marginTop: 24, borderRadius: 4, background: C.acc, width: `${p01(t, IN + 0.45, 0.7, E.inOut) * 100}%`}} />
        </div>
      </div>
    </div>
  );
};

/** Big centred stinger backdrop dim, visible only while the PartTag is full-frame. */
export const PartDim: React.FC<{t: number}> = ({t}) => {
  const o = 1 - p01(t, 1.5, 0.6, E.inOut);
  return o > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(8,9,11,${0.82 * o})`, zIndex: 40}} /> : null;
};

// ---------------------------------------------------------------- steps, commands, callouts
export const StepBadge: React.FC<{t: number; at: number; n: number; label: string; out?: number}> = ({t, at, n, label, out}) => (
  <Layer t={t} at={enter(at, {from: 'r', dist: 120, out, to: 'r'})} style={{right: 0}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 28px 14px 14px', borderRadius: 999, background: 'rgba(22,23,27,.9)', boxShadow: '0 0 0 1.5px rgba(16,163,127,.6), 0 20px 50px -16px rgba(0,0,0,.8)', whiteSpace: 'nowrap'}}>
      <div style={{width: 58, height: 58, borderRadius: 29, background: C.acc, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 34, color: '#03140e'}}>{n}</div>
      <div>
        <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.24em', color: C.accHi}}>STEP {n}</div>
        <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: C.ink}}>{label}</div>
      </div>
    </div>
  </Layer>
);

/** The command being typed, big and readable, typed in sync with the terminal. */
export const CmdCard: React.FC<{t: number; at: number; text: string; typed: string; out?: number; label?: string; done?: boolean}> = ({t, at, text, typed, out, label = 'TYPE THIS', done}) => {
  const big = text.length > 60;
  return (
    <Layer t={t} at={enter(at, {from: 'd', dist: 90, out, to: 'd'})}>
      <div style={{padding: big ? '20px 30px' : '22px 34px', borderRadius: 20, background: 'rgba(14,14,17,.92)', boxShadow: `0 0 0 1.5px ${done ? 'rgba(107,203,139,.7)' : 'rgba(255,255,255,.14)'}, 0 30px 70px -20px rgba(0,0,0,.85)`, maxWidth: 1500}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.mono, fontSize: 16, letterSpacing: '0.22em', color: done ? C.green : C.accHi, marginBottom: 10}}>
          {done ? '✓ ' : ''}
          {label}
        </div>
        <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: big ? 30 : 46, color: C.ink, whiteSpace: 'pre-wrap', lineHeight: 1.35}}>
          {typed.split(/(\/[\w-]+(?:@\w+)?)/g).map((s, i) => (
            <span key={i} style={{color: s.startsWith('/') ? C.accHi : undefined}}>
              {s}
            </span>
          ))}
          <span style={{display: 'inline-block', width: big ? 14 : 22, height: big ? 30 : 46, verticalAlign: big ? -5 : -8, marginLeft: 2, background: C.acc, opacity: typed.length < text.length || Math.floor(t * 2.2) % 2 === 0 ? 1 : 0}} />
        </div>
      </div>
    </Layer>
  );
};

/** Dot on a point, an elbow leader line drawn on, and a label. (x, y) = target; side = label side. */
export const Callout: React.FC<{t: number; at: number; x: number; y: number; dx?: number; dy?: number; label: string; sub?: string; out?: number; hot?: boolean}> = ({t, at, x, y, dx = 220, dy = -120, label, sub, out, hot = true}) => {
  const o = out === undefined ? 1 : 1 - p01(t, out, 0.3, E.in);
  if (t < at || o <= 0) return null;
  const pd = bounce(t, at, 12, 220);
  const ex = x + dx;
  const ey = y + dy;
  const mid = x + dx * 0.35;
  const col = hot ? C.acc : C.ink;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none', zIndex: 60}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <circle cx={x} cy={y} r={9 * pd} fill={col} />
        <circle cx={x} cy={y} r={9 + 26 * p01(t, at, 0.8)} fill="none" stroke={col} strokeWidth={2} opacity={1 - p01(t, at, 0.8)} />
        <Draw t={t} d={`M${x} ${y} L${mid} ${ey} L${ex} ${ey}`} at={at + 0.1} dur={0.45} stroke={col} width={2.5} />
      </svg>
      <div style={{position: 'absolute', left: dx >= 0 ? ex + 14 : undefined, right: dx < 0 ? 1920 - ex + 14 : undefined, top: ey, transform: 'translateY(-50%)', opacity: p01(t, at + 0.4, 0.3), whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: C.ink, textAlign: dx >= 0 ? 'left' : 'right'}}>{label}</div>
        {sub && <div style={{fontFamily: F.mono, fontSize: 19, color: hot ? C.accHi : C.ink3, textAlign: dx >= 0 ? 'left' : 'right', marginTop: 4}}>{sub}</div>}
      </div>
    </div>
  );
};

export const Keycap: React.FC<{label: string; down?: number; w?: number}> = ({label, down = 0, w = 120}) => (
  <div style={{width: w, height: 104, borderRadius: 18, background: 'linear-gradient(180deg,#2c2d33,#1b1c20)', boxShadow: `0 ${10 - down * 7}px 0 #0c0c0e, 0 ${18 - down * 10}px 30px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.14)`, transform: `translateY(${down * 7}px)`, display: 'grid', placeItems: 'center', fontFamily: F.ui, fontWeight: 600, fontSize: 30, color: C.ink}}>{label}</div>
);

/** Tear-off calendar page; ring drawn around the date. */
export const CalendarPage: React.FC<{t: number; at: number; month: string; day: string; note?: string; ring?: boolean}> = ({t, at, month, day, note, ring = true}) => (
  <div style={{position: 'relative', width: 300, height: 330}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', background: '#F4F1EC', boxShadow: '0 40px 80px -24px rgba(0,0,0,.85)'}}>
      <div style={{height: 92, background: C.acc, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 48, letterSpacing: '0.12em', color: '#03140e'}}>{month}</div>
      <div style={{display: 'grid', placeItems: 'center', height: 238, fontFamily: F.display, fontWeight: 900, fontSize: 168, color: '#141414', letterSpacing: '-0.05em'}}>{day}</div>
    </div>
    {ring && (
      <svg width={400} height={400} viewBox="0 0 400 400" style={{position: 'absolute', left: -50, top: -20, overflow: 'visible'}}>
        <Draw t={t} d="M200 110 C 300 105, 340 190, 320 260 C 300 330, 140 340, 95 280 C 55 220, 90 130, 190 118 L 215 125" at={at + 0.3} dur={0.7} stroke={C.acc} width={7} />
      </svg>
    )}
    {note && <div style={{position: 'absolute', top: 350, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 22, letterSpacing: '0.14em', color: C.accHi, opacity: p01(t, at + 0.6, 0.4)}}>{note}</div>}
  </div>
);

/** Circular gauge with a sweeping arc. v in 0..1 (can exceed 1 to show growth). */
export const Ring: React.FC<{v: number; size?: number; width?: number; color?: string; track?: string; children?: React.ReactNode}> = ({v, size = 320, width = 22, color = C.acc, track = 'rgba(255,255,255,.08)', children}) => {
  const r = (size - width) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={width} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={`${c * clamp(v)} ${c}`} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center'}}>{children}</div>
    </div>
  );
};

/** Person named in the script with no licensed photo: a named silhouette card (SOP rule 3). */
export const NameCard: React.FC<{name: string; role: string; quote?: string; w?: number}> = ({name, role, quote, w = 420}) => (
  <Glass w={w} pad={18} r={R.xl}>
    <div style={{height: w * 0.86, borderRadius: R.lg, overflow: 'hidden', background: 'linear-gradient(180deg,#2a2b31,#18191d)', position: 'relative'}}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" style={{position: 'absolute', bottom: 0}}>
        <circle cx={50} cy={40} r={17} fill="#3a3c44" />
        <path d="M14 100 C16 72 31 62 50 62 C69 62 84 72 86 100 Z" fill="#3a3c44" />
      </svg>
    </div>
    <div style={{padding: '18px 8px 6px'}}>
      <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em'}}>{name}</div>
      <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.1em', color: C.accHi, marginTop: 6, textTransform: 'uppercase'}}>{role}</div>
      {quote && <div style={{fontFamily: F.ui, fontSize: 22, color: C.ink2, marginTop: 14, lineHeight: 1.35}}>{quote}</div>}
      <div style={{fontFamily: F.mono, fontSize: 13, color: C.ink3, marginTop: 12}}>No licensed photo available</div>
    </div>
  </Glass>
);

/** Shape-layer burst: radial strokes flying out from a centre. */
export const Burst: React.FC<{t: number; at: number; n?: number; r0?: number; r1?: number; color?: string; width?: number}> = ({t, at, n = 12, r0 = 120, r1 = 260, color = C.acc, width = 6}) => {
  const p = p01(t, at, 0.7, E.out);
  if (p <= 0 || p >= 1) return null;
  const head = lerp(r0, r1, p);
  const tail = lerp(r0, r1, p01(t, at + 0.12, 0.7, E.out));
  return (
    <svg width={2 * r1 + 40} height={2 * r1 + 40} viewBox={`${-r1 - 20} ${-r1 - 20} ${2 * r1 + 40} ${2 * r1 + 40}`} style={{position: 'absolute', left: -r1 - 20, top: -r1 - 20, overflow: 'visible'}}>
      {Array.from({length: n}, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * tail} y1={Math.sin(a) * tail} x2={Math.cos(a) * head} y2={Math.sin(a) * head} stroke={color} strokeWidth={width * (1 - p * 0.6)} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/** Expanding rings (shockwave). */
export const Rings: React.FC<{t: number; at: number; n?: number; max?: number; color?: string; every?: number}> = ({t, at, n = 3, max = 420, color = C.acc, every = 0.18}) => (
  <svg width={max * 2} height={max * 2} style={{position: 'absolute', left: -max, top: -max, overflow: 'visible'}}>
    {Array.from({length: n}, (_, i) => {
      const p = p01(t, at + i * every, 1.1, E.out);
      if (p <= 0 || p >= 1) return null;
      return <circle key={i} cx={max} cy={max} r={max * p} fill="none" stroke={color} strokeWidth={3 * (1 - p) + 0.5} opacity={1 - p} />;
    })}
  </svg>
);

/** Big kinetic headline, centred, with an optional small kicker above. */
export const Headline: React.FC<{t: number; at: number; text: string; kicker?: string; size?: number; out?: number; y?: number; by?: 'char' | 'word'}> = ({t, at, text, kicker, size = 120, out, y = 540, by = 'char'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', textAlign: 'center'}}>
    {kicker && (
      <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.3em', color: C.accHi, marginBottom: 24, opacity: Math.min(p01(t, at, 0.4), out === undefined ? 1 : 1 - p01(t, out, 0.3))}}>
        {kicker}
      </div>
    )}
    <AText t={t} text={text} at={at + (kicker ? 0.1 : 0)} size={size} by={by} out={out} />
  </div>
);

/** Thin labelled progress/stat bar. */
export const StatBar: React.FC<{t: number; at: number; label: string; v: number; max?: number; color?: string; valueText?: string; w?: number}> = ({t, at, label, v, max = 1, color = C.acc, valueText, w = 760}) => {
  const p = p01(t, at, 1.0, E.out);
  return (
    <div style={{width: w}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.ui, fontSize: 28, fontWeight: 600, color: C.ink2, marginBottom: 12}}>
        <span>{label}</span>
        <span style={{color: C.ink, fontWeight: 700, opacity: p01(t, at + 0.5, 0.3)}}>{valueText}</span>
      </div>
      <div style={{height: 26, borderRadius: 13, background: 'rgba(255,255,255,.07)', overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${(v / max) * p * 100}%`, borderRadius: 13, background: color, boxShadow: `0 0 24px ${color}55`}} />
      </div>
    </div>
  );
};

export {tw};
