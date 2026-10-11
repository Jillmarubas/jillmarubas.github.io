// The apps on the laptop screen, drawn in code (illustrations, not screenshots): ChatGPT in a
// browser and the Codex desktop app. Everything here is in screen points (1512×945), so the
// camera and the cursor share one coordinate space.
import React from 'react';
import {C, F, FPS} from './design';
import {E, Key, clamp, kf, lerp, p01} from './ae';
import {Rig, WIN} from './laptop';
import {Cursor} from '../tutorial/kit';
import {cursorAt} from '../tutorial/timeline';
import {Icon, OpenAIMark} from './ui';
import {typeTimes} from './keys';

export const G = {bg: '#212121', side: '#181818', bubble: '#303030', comp: '#303030', card: '#2A2A2A', line: 'rgba(255,255,255,.09)', text: '#ECECEC', text2: '#B4B4B4', text3: '#8A8A8A'};

// Layout of the ChatGPT window (screen points).
export const CHROME = 44;
export const SIDE = 250;
export const GEO = (() => {
  const top = WIN.y + CHROME;
  const mainX = WIN.x + SIDE;
  const mainW = WIN.w - SIDE;
  const cx = mainX + mainW / 2;
  const colW = 720;
  const colX = cx - colW / 2;
  const header = top + 52;
  const compH = 58;
  const compY = WIN.y + WIN.h - 26 - compH;
  // a new chat: the composer sits in the middle under the greeting, then slides down on the first send
  const midY = Math.round(top + (WIN.h - CHROME) / 2 + 10);
  return {top, mainX, mainW, cx, colW, colX, header, threadY: header + 26, compY, compH, midY, helloY: midY - 120, midPlus: {x: colX + 30, y: midY + compH / 2}, chatTab: {x: cx - 46, y: top + 26}, plus: {x: colX + 30, y: compY + compH / 2}, send: {x: colX + colW - 30, y: compY + compH / 2}, picker: {x: WIN.x + SIDE + 92, y: top + 26}};
})();

/** Typed text at time t: `text` typed from `at`, finished just before `enter`. */
export const typedAt = (text: string, at: number, enter: number, t: number) => {
  if (t < at) return '';
  const tt = typeTimes(text, at, enter);
  return text.slice(0, tt.filter((x) => t >= x).length);
};

/** Camera keys [t, zoom, x, y] (screen points), eased in-out between keys. */
export const camAt = (t: number, keys: [number, number, number, number][], extra: Partial<Rig> = {}): Rig => {
  const k = (i: number) => kf(t, keys.map((c, j) => (j === 0 ? [c[0], c[i]] : [c[0], c[i], E.inOut]) as Key));
  return {zoom: k(1), x: k(2), y: k(3), ...extra};
};

/** macOS pointer on the screen. keys: [t, x, y, click?]. */
export const ScreenCursor: React.FC<{t: number; keys: [number, number, number, boolean?][]}> = ({t, keys}) => {
  const ks = keys.map(([tt, x, y, c], i) => {
    const p = keys[Math.max(0, i - 1)];
    const d = Math.hypot(x - p[1], y - p[2]);
    return {f: tt * FPS, x, y, click: c, dur: Math.round(clamp(26 + d / 20, 26, 60))};
  });
  if (t < keys[0][0]) return null;
  return <Cursor c={cursorAt(ks, t * FPS)} />;
};

// ---------------------------------------------------------------- browser window
const Lights: React.FC = () => (
  <div style={{display: 'flex', gap: 8}}>
    {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
      <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
    ))}
  </div>
);

export const Browser: React.FC<{url: string; children: React.ReactNode}> = ({url, children}) => (
  <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 0, overflow: 'hidden', background: G.bg, boxShadow: '0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.1)', fontFamily: F.ui, color: G.text}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: CHROME, background: '#2B2B2D', borderBottom: '1px solid rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', padding: '0 16px'}}>
      <Lights />
      <div style={{position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)', width: 420, height: 28, borderRadius: 8, background: '#1D1D1F', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: '#D0D0D0'}}>
        <Icon name="lock" size={12} color="#9a9a9a" width={2.4} />
        {url}
      </div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: CHROME, bottom: 0}}>{children}</div>
  </div>
);

// ---------------------------------------------------------------- ChatGPT
const SideItem: React.FC<{icon: string; label: string; hi?: boolean}> = ({icon, label, hi}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 10, background: hi ? 'rgba(255,255,255,.08)' : undefined, fontSize: 14, color: G.text}}>
    <Icon name={icon} size={17} color={G.text2} width={2} />
    {label}
  </div>
);

export type Composer = {text?: string; caret?: boolean; placeholder?: string; attach?: React.ReactNode; hot?: number; mid?: number};

/** ChatGPT in the browser. `thread` is laid out by the scene in screen points (absolute children). */
export const ChatGPT: React.FC<{t: number; thread?: React.ReactNode; composer?: Composer; tabHi?: number; model?: string; overlay?: React.ReactNode; cursor?: React.ReactNode; chats?: string[]}> = ({t, thread, composer = {}, tabHi = 0, model = 'GPT-6', overlay, cursor, chats = ['Weekend in Ipoh', 'Gym plan for October', 'Excel formula help', 'Birthday gift ideas', 'Rewrite my cover letter']}) => {
  const {text = '', caret = false, placeholder = 'Ask anything', attach, hot = 0, mid = 0} = composer;
  const compTop = lerp(GEO.compY, GEO.midY, mid);
  const ax = (x: number) => x - WIN.x;
  const ay = (y: number) => y - WIN.y - CHROME;
  const has = text.length > 0 || !!attach;
  const ch = GEO.compH + (attach ? 64 : 0);
  return (
    <Browser url="chatgpt.com">
      {/* sidebar */}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDE, background: G.side, padding: '14px 10px', boxSizing: 'border-box'}}>
        <div style={{padding: '4px 12px 14px'}}>
          <OpenAIMark size={24} />
        </div>
        <SideItem icon="edit" label="New chat" />
        <SideItem icon="search" label="Search chats" />
        <SideItem icon="layers" label="Library" />
        <div style={{fontSize: 12.5, color: G.text3, padding: '22px 12px 8px'}}>Chats</div>
        {chats.map((c, i) => (
          <div key={c} style={{padding: '8px 12px', fontSize: 14, color: i === 0 ? G.text : G.text2, borderRadius: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {c}
          </div>
        ))}
        <div style={{position: 'absolute', left: 10, right: 10, bottom: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px'}}>
          <div style={{width: 28, height: 28, borderRadius: 14, background: '#5B6CF0', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700}}>J</div>
          <div style={{fontSize: 14}}>Jill</div>
        </div>
      </div>
      {/* header: model + the Chat tab */}
      <div style={{position: 'absolute', left: SIDE, right: 0, top: 0, height: 52, display: 'flex', alignItems: 'center', padding: '0 18px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 17, fontWeight: 600, color: G.text, padding: '6px 10px', borderRadius: 10}}>
          ChatGPT <span style={{color: G.text2, fontWeight: 500}}>{model}</span> <span style={{fontSize: 12, color: G.text3}}>▾</span>
        </div>
        <div style={{position: 'absolute', left: ax(GEO.cx) - SIDE - 92, top: 11, display: 'flex', gap: 6, padding: 4, borderRadius: 12, background: 'rgba(255,255,255,.05)'}}>
          <div style={{width: 84, height: 24, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 13.5, fontWeight: 600, background: tabHi > 0 ? `rgba(16,163,127,${0.25 + 0.55 * tabHi})` : 'rgba(255,255,255,.12)', boxShadow: tabHi > 0 ? `0 0 ${18 * tabHi}px rgba(16,163,127,${0.6 * tabHi})` : undefined}}>Chat</div>
          <div style={{width: 84, height: 24, borderRadius: 8, display: 'grid', placeItems: 'center'}}>
            <div style={{width: 40, height: 7, borderRadius: 4, background: 'rgba(255,255,255,.12)'}} />
          </div>
        </div>
      </div>
      {/* thread (scene places its items in screen points) */}
      <div style={{position: 'absolute', left: SIDE, right: 0, top: 52, bottom: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -(WIN.x + SIDE), top: -(WIN.y + CHROME + 52), width: 1512, height: 945}}>{thread}</div>
      </div>
      {/* composer */}
      <div style={{position: 'absolute', left: ax(GEO.colX), top: ay(compTop) - (ch - GEO.compH), width: GEO.colW, height: ch, borderRadius: 28, background: G.comp, boxShadow: hot > 0 ? `0 0 0 ${2 * hot}px rgba(16,163,127,.85), 0 0 ${30 * hot}px rgba(16,163,127,.4)` : '0 0 0 1px rgba(255,255,255,.06)', boxSizing: 'border-box'}}>
        {attach && <div style={{position: 'absolute', left: 16, top: 12}}>{attach}</div>}
        <div style={{position: 'absolute', left: 14, bottom: 13, width: 32, height: 32, borderRadius: 16, display: 'grid', placeItems: 'center'}}>
          <Icon name="plus" size={20} color={G.text} width={2} />
        </div>
        <div style={{position: 'absolute', left: 56, right: 70, bottom: 17, fontSize: 16.5, color: text ? G.text : G.text3, whiteSpace: 'nowrap', overflow: 'hidden', display: 'flex', justifyContent: text.length > 62 ? 'flex-end' : 'flex-start'}}>
          <span style={{whiteSpace: 'pre'}}>{text || placeholder}</span>
          {caret && <span style={{display: 'inline-block', width: 2, height: 20, background: G.text, marginLeft: 1, opacity: Math.floor(t * 2.2) % 2 === 0 || text ? 1 : 0, order: text ? 0 : -1}} />}
        </div>
        <div style={{position: 'absolute', right: 12, bottom: 12, width: 34, height: 34, borderRadius: 17, background: has ? '#F4F4F4' : 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center'}}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <path d="M12 19V5M5 12l7-7 7 7" stroke={has ? '#111' : '#777'} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div style={{position: 'absolute', left: ax(GEO.colX), width: GEO.colW, top: ay(GEO.compY + GEO.compH + 6), opacity: 1 - mid, textAlign: 'center', fontSize: 11.5, color: G.text3}}>ChatGPT can make mistakes. Check important info.</div>
      {overlay}
      {/* the pointer sits above everything (header, thread, composer), in screen points */}
      <div style={{position: 'absolute', left: -WIN.x, top: -(WIN.y + CHROME), width: 1512, height: 945, zIndex: 100, pointerEvents: 'none'}}>{cursor}</div>
    </Browser>
  );
};

/** Right-aligned user message at screen y. p = appear 0..1. */
export const UserMsg: React.FC<{y: number; text: string; p?: number; attach?: React.ReactNode}> = ({y, text, p = 1, attach}) =>
  p <= 0 ? null : (
    <div style={{position: 'absolute', right: 1512 - (GEO.colX + GEO.colW), top: y, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, opacity: clamp(p * 2), transform: `translateY(${(1 - p) * 18}px)`}}>
      {attach}
      <div style={{maxWidth: 520, padding: '10px 18px', borderRadius: 20, background: G.bubble, fontSize: 16.5, lineHeight: 1.5, color: G.text}}>{text}</div>
    </div>
  );

/** Assistant content block at screen y (full column width). */
export const Asst: React.FC<{y: number; children: React.ReactNode; p?: number; x?: number; w?: number}> = ({y, children, p = 1, x = GEO.colX, w = GEO.colW}) =>
  p <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: clamp(p * 2), fontSize: 16.5, lineHeight: 1.6, color: G.text}}>{children}</div>
  );

/** Text that streams in word by word: shows the first fraction `p` of the words. */
export const Stream: React.FC<{text: string; p: number; style?: React.CSSProperties}> = ({text, p, style}) => {
  const words = text.split(' ');
  const n = Math.floor(words.length * clamp(p));
  if (n <= 0) return null;
  return <div style={style}>{words.slice(0, n).join(' ')}</div>;
};

/** "Thinking" / "Searching the web" status row with a shimmer. */
export const Status: React.FC<{t: number; label: string; done?: boolean; icon?: string}> = ({t, label, done, icon = 'globe'}) => {
  const sh = (t * 0.9) % 1.6;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 15.5, color: G.text2}}>
      {done ? <Icon name="check" size={16} color={C.accHi} width={2.6} /> : <Icon name={icon} size={16} color={G.text2} width={2} />}
      <span style={done ? undefined : {background: `linear-gradient(90deg, ${G.text3} ${(sh - 0.3) * 100}%, #fff ${sh * 100}%, ${G.text3} ${(sh + 0.3) * 100}%)`, WebkitBackgroundClip: 'text', color: 'transparent'}}>{label}</span>
    </div>
  );
};

// ---------------------------------------------------------------- Codex desktop app
export const CODEX = {sideW: 270, top: WIN.y + 40};
export const CGEO = (() => {
  const mainX = WIN.x + CODEX.sideW;
  const mainW = WIN.w - CODEX.sideW;
  const colW = 760;
  const colX = mainX + (mainW - colW) / 2;
  const boxH = 96;
  const boxY = WIN.y + WIN.h - 24 - boxH;
  return {mainX, mainW, colX, colW, boxY, boxH, threadY: WIN.y + 40 + 60};
})();

/** The Codex desktop app (illustration): thread list, a thread, and the message box. */
export const Codex: React.FC<{t: number; thread?: React.ReactNode; box?: {text?: string; ghost?: string; caret?: boolean; hint?: number; hot?: number}; overlay?: React.ReactNode; banner?: React.ReactNode; cursor?: React.ReactNode}> = ({t, thread, box = {}, overlay, banner, cursor}) => {
  const {text = '', ghost = '', caret = false, hint = 0, hot = 0} = box;
  const ax = (x: number) => x - WIN.x;
  const ay = (y: number) => y - WIN.y;
  return (
    <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 0, overflow: 'hidden', background: '#1A1B1E', boxShadow: '0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.1)', fontFamily: F.ui, color: G.text}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: CODEX.sideW, background: '#141517', borderRight: '1px solid rgba(255,255,255,.06)', padding: '14px 12px', boxSizing: 'border-box'}}>
        <Lights />
        <div style={{display: 'flex', alignItems: 'center', gap: 10, margin: '22px 6px 18px', fontSize: 16, fontWeight: 700}}>
          <OpenAIMark size={20} /> Codex
        </div>
        <div style={{fontSize: 12, color: G.text3, padding: '0 8px 8px', letterSpacing: '0.04em'}}>THREADS</div>
        {[
          ['Fix login redirect', 'local', true],
          ['Add dark mode toggle', 'local', false],
          ['Migrate API to v2', 'SSH', false],
          ['Write unit tests', 'local', false],
        ].map(([n, k, hi]) => (
          <div key={n as string} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', borderRadius: 9, background: hi ? 'rgba(255,255,255,.07)' : undefined, fontSize: 14, color: hi ? G.text : G.text2}}>
            <span>{n}</span>
            <span style={{fontFamily: F.mono, fontSize: 11, color: G.text3, padding: '2px 6px', borderRadius: 5, boxShadow: '0 0 0 1px rgba(255,255,255,.12)'}}>{k}</span>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: CODEX.sideW, right: 0, top: 0, height: 52, display: 'flex', alignItems: 'center', padding: '0 22px', borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 15, fontWeight: 600}}>
        Fix login redirect <span style={{marginLeft: 12, fontFamily: F.mono, fontSize: 12, color: G.text3}}>~/shop-app · local</span>
        <span style={{marginLeft: 'auto', fontSize: 13, color: G.text2, fontWeight: 500}}>GPT-6 Astra</span>
      </div>
      {banner}
      <div style={{position: 'absolute', left: CODEX.sideW, right: 0, top: 53, bottom: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -(WIN.x + CODEX.sideW), top: -(WIN.y + 53), width: 1512, height: 945}}>{thread}</div>
      </div>
      <div style={{position: 'absolute', left: ax(CGEO.colX), top: ay(CGEO.boxY), width: CGEO.colW, height: CGEO.boxH, borderRadius: 18, background: '#25262A', boxShadow: hot > 0 ? `0 0 0 ${2 * hot}px rgba(16,163,127,.85), 0 0 ${30 * hot}px rgba(16,163,127,.35)` : '0 0 0 1px rgba(255,255,255,.08)', padding: '16px 20px', boxSizing: 'border-box', fontSize: 16.5, lineHeight: 1.5}}>
        <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
        {caret && <span style={{display: 'inline-block', width: 2, height: 20, verticalAlign: -4, background: G.text, opacity: Math.floor(t * 2.2) % 2 === 0 ? 1 : 0}} />}
        {ghost && <span style={{color: '#7C7F86', whiteSpace: 'pre-wrap'}}>{ghost}</span>}
        {!text && !ghost && !caret && <span style={{color: G.text3}}>Ask Codex anything</span>}
        <div style={{position: 'absolute', left: 20, bottom: 12, display: 'flex', gap: 10, alignItems: 'center', fontSize: 12.5, color: G.text3}}>
          {hint > 0 && (
            <span style={{opacity: hint, display: 'flex', alignItems: 'center', gap: 6}}>
              <span style={{fontFamily: F.mono, fontSize: 11.5, padding: '1px 7px', borderRadius: 5, boxShadow: '0 0 0 1px rgba(255,255,255,.25)', color: G.text2}}>Tab</span> to accept
            </span>
          )}
        </div>
        <div style={{position: 'absolute', right: 12, bottom: 12, width: 32, height: 32, borderRadius: 16, background: text ? '#F4F4F4' : 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center'}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
            <path d="M12 19V5M5 12l7-7 7 7" stroke={text ? '#111' : '#777'} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {overlay}
      <div style={{position: 'absolute', left: -WIN.x, top: -WIN.y, width: 1512, height: 945, zIndex: 100, pointerEvents: 'none'}}>{cursor}</div>
    </div>
  );
};

export {lerp, p01};
