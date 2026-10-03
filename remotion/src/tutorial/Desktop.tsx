// macOS-style dark desktop: wallpaper, menu bar, Dock and windows. Generic, drawn in code:
// no Apple marks and no real app icons, so it can be reused for any tutorial.
import React from 'react';
import {interpolate} from 'remotion';
import {MAC, SCREEN, ease} from './theme';
import {Rect} from './timeline';

export const MENUBAR_H = 34;

export const Wallpaper: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: [
        'radial-gradient(70% 60% at 18% 88%, rgba(22,96,120,.55) 0%, rgba(22,96,120,0) 70%)',
        'radial-gradient(60% 55% at 86% 18%, rgba(38,72,140,.55) 0%, rgba(38,72,140,0) 70%)',
        'radial-gradient(50% 40% at 55% 55%, rgba(18,34,58,.9) 0%, rgba(18,34,58,0) 100%)',
        'linear-gradient(160deg, #0d1420 0%, #0a0f18 55%, #06090f 100%)',
      ].join(','),
    }}
  />
);

const Icon: React.FC<{d: React.ReactNode; w?: number}> = ({d, w = 18}) => (
  <svg width={w} height={16} viewBox={`0 0 ${w} 16`} fill="none" stroke={MAC.ui.text} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

export const MenuBar: React.FC<{app: string; menus?: string[]; clock?: string}> = ({app, menus = ['File', 'Edit', 'View', 'Window', 'Help'], clock = 'Sat 3 Oct  9:41'}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: SCREEN.w,
      height: MENUBAR_H,
      background: MAC.ui.menubar,
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 18px',
      gap: 22,
      fontFamily: MAC.font.ui,
      fontSize: 14,
      color: MAC.ui.text,
      zIndex: 50,
    }}
  >
    <span style={{fontWeight: 700}}>{app}</span>
    {menus.map((m) => (
      <span key={m} style={{fontWeight: 500}}>
        {m}
      </span>
    ))}
    <div style={{flex: 1}} />
    <Icon w={26} d={<><rect x={1} y={4} width={20} height={9} rx={2.5} /><rect x={3} y={6} width={13} height={5} rx={1} fill={MAC.ui.text} stroke="none" /><path d="M23.5 7v3" /></>} />
    <Icon d={<><path d="M2 6.5a10 10 0 0 1 14 0" /><path d="M4.8 9.3a6 6 0 0 1 8.4 0" /><circle cx={9} cy={12.4} r={1.2} fill={MAC.ui.text} stroke="none" /></>} />
    <Icon d={<><circle cx={7.5} cy={7} r={4.5} /><path d="M11 10.5l4 4" /></>} />
    <Icon d={<><rect x={1.5} y={2.5} width={15} height={4.5} rx={2.25} /><circle cx={12.5} cy={4.75} r={1.3} fill={MAC.ui.text} stroke="none" /><rect x={1.5} y={9} width={15} height={4.5} rx={2.25} /><circle cx={5.5} cy={11.25} r={1.3} fill={MAC.ui.text} stroke="none" /></>} />
    <span style={{fontWeight: 500, whiteSpace: 'pre'}}>{clock}</span>
  </div>
);

// ---------- Dock ----------
export type DockItem = {id: string; bg: string; glyph: React.ReactNode};
const G = (children: React.ReactNode) => (
  <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

// Generic app icons. Swap or add entries to match the apps the tutorial uses.
export const DOCK_ICONS: Record<string, DockItem> = {
  files: {id: 'files', bg: 'linear-gradient(180deg,#5ab0ff,#1f6fe0)', glyph: G(<path d="M10 16h11l3 3h14v15a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2z" fill="#dff0ff" />)},
  browser: {id: 'browser', bg: 'linear-gradient(180deg,#f4f6f8,#cfd6de)', glyph: G(<><circle cx={24} cy={24} r={14} stroke="#1d7cf2" strokeWidth={3} /><path d="M29 19l-3.5 7.5L19 29l3.5-7.5z" fill="#ff453a" /></>)},
  notes: {id: 'notes', bg: 'linear-gradient(180deg,#ffe066,#f5b800)', glyph: G(<><rect x={12} y={10} width={24} height={28} rx={3} fill="#fffbe6" /><path d="M16 18h16M16 24h16M16 30h10" stroke="#c9a400" strokeWidth={2} /></>)},
  terminal: {id: 'terminal', bg: 'linear-gradient(180deg,#3a3a3e,#151517)', glyph: G(<><path d="M14 18l6 6-6 6" stroke="#f5f5f7" strokeWidth={3} /><path d="M24 31h10" stroke="#f5f5f7" strokeWidth={3} /></>)},
  settings: {id: 'settings', bg: 'linear-gradient(180deg,#9a9ca3,#5d5f66)', glyph: G(<><circle cx={24} cy={24} r={9} stroke="#2a2b2f" strokeWidth={3} /><circle cx={24} cy={24} r={3} fill="#2a2b2f" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d="M24 10v5" stroke="#2a2b2f" strokeWidth={3.5} transform={`rotate(${a} 24 24)`} />)}</>)},
};

export const DOCK = {icon: 52, gap: 10, pad: 10, bottom: 8};
// Screen rectangle of the i-th icon (so the cursor can click it).
export const dockIconRect = (i: number, count: number): Rect => {
  const width = count * DOCK.icon + (count - 1) * DOCK.gap + DOCK.pad * 2;
  const x0 = (SCREEN.w - width) / 2 + DOCK.pad;
  const y = SCREEN.h - DOCK.bottom - DOCK.pad - DOCK.icon;
  return {x: x0 + i * (DOCK.icon + DOCK.gap), y, w: DOCK.icon, h: DOCK.icon};
};

export const Dock: React.FC<{items: DockItem[]; frame: number; cursor?: {x: number; y: number}; running?: string[]; bounce?: {id: string; f: number}}> = ({items, frame, cursor, running = [], bounce}) => {
  const first = dockIconRect(0, items.length);
  const last = dockIconRect(items.length - 1, items.length);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: first.x - DOCK.pad,
          top: first.y - DOCK.pad,
          width: last.x + last.w - first.x + DOCK.pad * 2,
          height: DOCK.icon + DOCK.pad * 2,
          borderRadius: 22,
          background: 'rgba(40,40,46,.48)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,.14)',
          zIndex: 40,
        }}
      />
      {items.map((it, i) => {
        const r = dockIconRect(i, items.length);
        // Magnify toward the cursor when it's over the Dock.
        const near = cursor && cursor.y > r.y - 40 ? Math.max(0, 1 - Math.abs(cursor.x - (r.x + r.w / 2)) / 130) : 0;
        const mag = 1 + 0.32 * ease.morph(near);
        const b = bounce && bounce.id === it.id ? frame - bounce.f : -1;
        const hop = b >= 0 && b < 24 ? -Math.abs(Math.sin((b / 24) * Math.PI * 2)) * 16 * (1 - b / 30) : 0;
        return (
          <React.Fragment key={it.id}>
            <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 12, background: it.bg, padding: 4, boxShadow: '0 4px 10px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.25)', transform: `translateY(${hop}px) scale(${mag})`, transformOrigin: '50% 100%', zIndex: 41}}>
              {it.glyph}
            </div>
            {running.includes(it.id) && <div style={{position: 'absolute', left: r.x + r.w / 2 - 2, top: r.y + r.h + 4, width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.75)', zIndex: 41}} />}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------- Window ----------
// `open` 0→1 grows the window out of `from` (usually its Dock icon), like the genie minimise in reverse.
export const Window: React.FC<{rect: Rect; open?: number; from?: {x: number; y: number}; title?: string; toolbar?: React.ReactNode; children: React.ReactNode; z?: number}> = ({rect, open = 1, from, title, toolbar, children, z = 10}) => {
  if (open <= 0) return null;
  const s = interpolate(open, [0, 1], [0.08, 1]);
  const ox = from ? from.x - rect.x : rect.w / 2;
  const oy = from ? from.y - rect.y : rect.h / 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        borderRadius: 12,
        overflow: 'hidden',
        background: MAC.ui.window,
        boxShadow: '0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.1)',
        transform: `scale(${s})`,
        transformOrigin: `${ox}px ${oy}px`,
        opacity: interpolate(open, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'}),
        fontFamily: MAC.font.ui,
        color: MAC.ui.text,
        zIndex: z,
      }}
    >
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: TITLEBAR_H, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 8, borderBottom: `1px solid ${MAC.ui.line}`, background: MAC.ui.titlebar, zIndex: 2}}>
        {MAC.lights.map((c) => (
          <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c, boxShadow: 'inset 0 0 0 .5px rgba(0,0,0,.3)'}} />
        ))}
        {title && <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 13, fontWeight: 600, color: MAC.ui.text2, pointerEvents: 'none'}}>{title}</div>}
        <div style={{flex: 1}} />
        {toolbar}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: TITLEBAR_H, bottom: 0}}>{children}</div>
    </div>
  );
};
export const TITLEBAR_H = 44;
