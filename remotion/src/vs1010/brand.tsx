// The three brands, their marks, and a drawn chat app for each (illustrations, not screen
// recordings). Shared by every scene in "ChatGPT vs Claude vs Gemini" (AI News, 10 Oct 2026).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, F} from '../gpt1010/design';
import {E, clamp, kf, lerp, p01} from '../gpt1010/ae';
import {LaptopRig, WIN} from '../gpt1010/laptop';
import {camAt, typedAt} from '../gpt1010/app';
import {Icon} from '../gpt1010/ui';

export type B = 'gpt' | 'claude' | 'gemini';
export const BR: Record<B, {name: string; maker: string; col: string; hi: string; logo: string; app: {bg: string; side: string; card: string; line: string; text: string; text2: string; text3: string; bubble: string}}> = {
  gpt: {name: 'ChatGPT', maker: 'OpenAI', col: '#10A37F', hi: '#5FD4B0', logo: 'vs1010/logos/openai.svg', app: {bg: '#212121', side: '#181818', card: '#2A2A2A', line: 'rgba(255,255,255,.09)', text: '#ECECEC', text2: '#B4B4B4', text3: '#8A8A8A', bubble: '#303030'}},
  claude: {name: 'Claude', maker: 'Anthropic', col: '#D97757', hi: '#F0A383', logo: 'vs1010/logos/claude.svg', app: {bg: '#262624', side: '#1F1E1D', card: '#30302E', line: 'rgba(255,240,220,.10)', text: '#EDE9E0', text2: '#BDB7AB', text3: '#8C877E', bubble: '#141413'}},
  gemini: {name: 'Gemini', maker: 'Google', col: '#4E8DF5', hi: '#8AB4F8', logo: 'vs1010/logos/gemini.svg', app: {bg: '#131314', side: '#1E1F20', card: '#1E1F20', line: 'rgba(255,255,255,.09)', text: '#E3E3E3', text2: '#ABABAB', text3: '#7E7E7E', bubble: '#2C2D2F'}},
};
export const ORDER: B[] = ['gpt', 'claude', 'gemini'];
export const GEM_GRAD = 'linear-gradient(90deg, #4E8DF5 0%, #8E73E8 55%, #E86FA4 100%)';

/** The company mark on its own. */
export const Logo: React.FC<{b: B; size?: number; style?: React.CSSProperties}> = ({b, size = 120, style}) => (
  <Img src={staticFile(BR[b].logo)} style={{width: size, height: size, display: 'block', objectFit: 'contain', ...style}} />
);

/** Mark on a dark rounded tile with the brand's glow. */
export const Tile: React.FC<{b: B; size?: number; glow?: number; dim?: number}> = ({b, size = 200, glow = 0.5, dim = 0}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.24, background: 'linear-gradient(160deg, #24272A 0%, #141617 100%)', boxShadow: `0 0 0 1.5px rgba(255,255,255,.10), 0 ${size * 0.12}px ${size * 0.3}px -${size * 0.1}px rgba(0,0,0,.8), 0 0 ${size * 0.5}px ${BR[b].col}${Math.round(clamp(glow) * 120).toString(16).padStart(2, '0')}`, display: 'grid', placeItems: 'center', filter: dim ? `grayscale(${dim}) brightness(${1 - dim * 0.55})` : undefined}}>
    <Logo b={b} size={size * 0.56} />
  </div>
);

/** Logo + name lockup. */
export const Lockup: React.FC<{b: B; size?: number; sub?: string}> = ({b, size = 64, sub}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.32}}>
    <Logo b={b} size={size} />
    <div>
      <div style={{fontFamily: F.display, fontWeight: 800, fontSize: size * 0.82, letterSpacing: '-0.03em', color: C.ink, lineHeight: 1}}>{BR[b].name}</div>
      {sub && <div style={{fontFamily: F.mono, fontSize: size * 0.3, letterSpacing: '0.18em', color: C.ink3, marginTop: size * 0.12}}>{sub}</div>}
    </div>
  </div>
);

/** A small pill. */
export const Chip: React.FC<{text: string; col?: string; solid?: boolean; size?: number; style?: React.CSSProperties}> = ({text, col = C.ink2, solid, size = 26, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', padding: `${size * 0.3}px ${size * 0.62}px`, borderRadius: 999, fontFamily: F.mono, fontWeight: 600, fontSize: size, letterSpacing: '0.08em', color: solid ? '#0B0C0D' : col, background: solid ? col : 'rgba(255,255,255,.06)', boxShadow: solid ? undefined : `inset 0 0 0 1.5px ${col}55`, whiteSpace: 'nowrap', ...style}}>
    {text}
  </span>
);

// ---------------------------------------------------------------- drawn chat apps (screen points 1512×945)
export type AppProps = {
  b: B;
  t: number;
  prompt?: string; // the user's message
  typeAt?: number; // local time typing starts
  send?: number; // local time Enter is pressed
  answer?: (p: number) => React.ReactNode; // the reply, drawn from p 0→1 after send
  side?: string[];
  model?: string;
  answerAt?: number; // reply starts (default send + 0.5)
  answerDur?: number;
};

const SIDE_W = 260;
export const APP = {colX: SIDE_W + 150, colW: 1512 - SIDE_W - 300};

export const ChatApp: React.FC<AppProps> = ({b, t, prompt = '', typeAt = 0, send = 999, answer, side = [], model, answerAt, answerDur = 1.6}) => {
  const a = BR[b].app;
  const sent = t >= send;
  const typed = sent ? '' : typedAt(prompt, typeAt, send, t);
  const pa = p01(t, answerAt ?? send + 0.45, answerDur, E.out);
  const greet = b === 'claude' ? 'How can I help you today?' : b === 'gemini' ? 'Hello, there' : 'What can I help with?';
  const comp = (y: number) => (
    <div style={{position: 'absolute', left: APP.colX, top: y, width: APP.colW, minHeight: 64, borderRadius: b === 'gpt' ? 32 : 22, background: b === 'claude' ? '#30302E' : a.bubble, boxShadow: `inset 0 0 0 1px ${a.line}`, padding: '20px 28px', boxSizing: 'border-box', fontSize: 22, color: typed ? a.text : a.text3, display: 'flex', alignItems: 'center', gap: 16}}>
      <Icon name="plus" size={26} color={a.text2} />
      <span style={{flex: 1}}>
        {typed || (sent ? (b === 'gemini' ? 'Ask Gemini' : 'Reply…') : b === 'gemini' ? 'Ask Gemini' : 'Ask anything')}
        {!sent && typed && typed.length < prompt.length && Math.floor(t * 2.4) % 2 === 0 && <span style={{color: BR[b].hi}}>|</span>}
      </span>
      <div style={{width: 40, height: 40, borderRadius: 20, background: typed ? (b === 'gemini' ? '#E3E3E3' : b === 'claude' ? BR.claude.col : '#ECECEC') : 'rgba(255,255,255,.12)', display: 'grid', placeItems: 'center'}}>
        <Icon name="rocket" size={20} color="#111" />
      </div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, background: a.bg, fontFamily: b === 'claude' ? F.ui : F.ui, color: a.text, overflow: 'hidden'}}>
      {/* sidebar */}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDE_W, background: a.side, boxShadow: `inset -1px 0 0 ${a.line}`, padding: '22px 18px', boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30}}>
          <Logo b={b} size={30} />
          <span style={{fontWeight: 700, fontSize: 20}}>{BR[b].name}</span>
        </div>
        <div style={{fontSize: 16, color: a.text2, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center'}}>
          <Icon name="edit" size={18} color={a.text2} /> New chat
        </div>
        <div style={{fontSize: 13, color: a.text3, margin: '26px 0 10px', letterSpacing: '0.04em'}}>Recent</div>
        {side.map((s, i) => (
          <div key={i} style={{fontSize: 16, color: a.text2, padding: '9px 10px', borderRadius: 8, background: i === 0 && sent ? 'rgba(255,255,255,.06)' : undefined, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {s}
          </div>
        ))}
      </div>
      {/* top bar */}
      <div style={{position: 'absolute', left: SIDE_W + 28, top: 18, fontSize: 19, fontWeight: 600, color: a.text2}}>{model ?? BR[b].name}</div>
      {/* empty state */}
      {!sent && (
        <>
          <div style={{position: 'absolute', left: APP.colX, width: APP.colW, top: 300, textAlign: 'center', fontSize: b === 'claude' ? 40 : 36, fontFamily: b === 'claude' ? 'Georgia, serif' : F.ui, fontWeight: b === 'claude' ? 400 : 500, ...(b === 'gemini' ? {background: GEM_GRAD, WebkitBackgroundClip: 'text', color: 'transparent'} : {})}}>
            {greet}
          </div>
          {comp(390)}
        </>
      )}
      {sent && (
        <>
          <div style={{position: 'absolute', right: 1512 - APP.colX - APP.colW, top: 70, maxWidth: 620, padding: '16px 22px', borderRadius: 22, background: a.bubble, fontSize: 21, lineHeight: 1.4, color: a.text}}>{prompt}</div>
          <div style={{position: 'absolute', left: APP.colX, top: 70 + 46 + Math.ceil(prompt.length / 50) * 30 + 40, width: APP.colW}}>{answer?.(pa)}</div>
          {comp(911 - 110)}
        </>
      )}
    </div>
  );
};

/** A MacBook shot of a chat app with a camera that eases in. cam keys: [t, zoom, x, y] in screen points. */
export const MacApp: React.FC<{t: number; cam?: [number, number, number, number][]; swing?: number; children: React.ReactNode; app?: string}> = ({t, cam = [[0, 1, 756, 472]], swing = 0, children, app}) => {
  const ry = swing ? kf(t, [[0, swing], [1.0, 0, E.out]]) : 0;
  const rx = swing ? kf(t, [[0, 6], [1.0, 0, E.out]]) : 0;
  const rig = camAt(t, cam, {ry, rx});
  return (
    <AbsoluteFill>
      <LaptopRig rig={rig} app={app ?? 'Safari'}>
        {children}
      </LaptopRig>
    </AbsoluteFill>
  );
};

/** Cursor (drawn on top of everything; SOP: cursor on top). Keys: [t, x, y, click?] in frame px. */
export const Cursor: React.FC<{t: number; keys: [number, number, number, boolean?][]}> = ({t, keys}) => {
  if (!keys.length || t < keys[0][0] - 0.3) return null;
  let x = keys[0][1], y = keys[0][2];
  for (let i = 1; i < keys.length; i++) {
    const [t1, x1, y1] = keys[i];
    const [t0, x0, y0] = keys[i - 1];
    const p = p01(t, t1 - 0.55, 0.55, E.inOut);
    if (t >= t1 - 0.55) { x = lerp(x0, x1, p); y = lerp(y0, y1, p); }
    void t0;
  }
  const click = keys.find((k) => k[3] && t >= k[0] && t < k[0] + 0.35);
  const pr = click ? p01(t, click[0], 0.35) : 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, zIndex: 80, pointerEvents: 'none'}}>
      {click && <div style={{position: 'absolute', left: -30 * pr - 4, top: -30 * pr - 4, width: 60 * pr + 8, height: 60 * pr + 8, borderRadius: '50%', border: `3px solid rgba(255,255,255,${0.8 * (1 - pr)})`}} />}
      <svg width={40} height={52} viewBox="0 0 26 34" style={{position: 'absolute', left: -6, top: -4, transform: `scale(${click ? 0.9 : 1})`, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.6))'}}>
        <path d="M4 3 L4 26 L9.4 20.9 L13 29.4 L16.6 27.9 L13.1 19.6 L20.4 19.6 Z" fill="#000" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
