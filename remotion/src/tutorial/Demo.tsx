// Sample tutorial that exercises every piece of the template: open an app from the Dock,
// zoom to a button, click, type a name, highlight and click Create, see the result.
// The app ("Flowbase") is fictional. Replace this file's steps with the real script's.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import './fonts';
import {MAC, SCREEN, ease} from './theme';
import {MacBook, Studio} from './MacBook';
import {DOCK_ICONS, Dock, DockItem, MenuBar, TITLEBAR_H, Wallpaper, Window, dockIconRect} from './Desktop';
import {Button, Caption, Cursor, Field, Highlight, Toast} from './kit';
import {CamKey, CursorKey, Rect, cameraAt, cameraTransform, centre, cursorAt, isOver, keystrokes, prog, typedAt} from './timeline';

export const DEMO_DURATION = 372;

const flowIcon: DockItem = {
  id: 'flow',
  bg: 'linear-gradient(180deg,#26282e,#101114)',
  glyph: (
    <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none">
      <path d="M15 16h9v16h9" stroke="#6fb3ff" strokeWidth={2.5} />
      <rect x={8} y={11} width={12} height={10} rx={3} fill={MAC.accent} />
      <rect x={28} y={27} width={12} height={10} rx={3} fill={MAC.green} />
    </svg>
  ),
};
const DOCK_ITEMS = [DOCK_ICONS.files, DOCK_ICONS.browser, DOCK_ICONS.notes, DOCK_ICONS.terminal, flowIcon, DOCK_ICONS.settings];

// ---------- Layout (screen points) ----------
const WIN: Rect = {x: 150, y: 70, w: 1212, h: 750};
const SIDEBAR_W = 210;
const CX = WIN.x + SIDEBAR_W; // content left
const CY = WIN.y + TITLEBAR_H; // content top
const NEW_BTN: Rect = {x: WIN.x + WIN.w - 32 - 156, y: CY + 26, w: 156, h: 36};
const SHEET: Rect = {x: WIN.x + (WIN.w - 470) / 2, y: WIN.y + 200, w: 470, h: 240};
const NAME_FIELD: Rect = {x: SHEET.x + 24, y: SHEET.y + 100, w: SHEET.w - 48, h: 38};
const CREATE_BTN: Rect = {x: SHEET.x + SHEET.w - 24 - 100, y: SHEET.y + SHEET.h - 24 - 34, w: 100, h: 34};
const CANCEL_BTN: Rect = {x: CREATE_BTN.x - 12 - 100, y: CREATE_BTN.y, w: 100, h: 34};
const FLOW_ICON = dockIconRect(4, DOCK_ITEMS.length);

// ---------- Timeline (frames at 30 fps) ----------
const T = {
  dockClick: 62,
  winOpen: 66,
  newClick: 122,
  sheetOpen: 126,
  fieldClick: 168,
  typeStart: 176,
  createClick: 254,
  sheetClose: 257,
  rowIn: 264,
  toast: 272,
};
const NAME = 'Lead follow-up';
const STROKES = keystrokes(NAME, T.typeStart);

const CURSOR: CursorKey[] = [
  {f: 34, x: 980, y: 560},
  {f: T.dockClick - 4, ...centre(FLOW_ICON)},
  {f: T.dockClick, ...centre(FLOW_ICON), click: true},
  {f: 112, x: NEW_BTN.x + 104, y: NEW_BTN.y + 20},
  {f: T.newClick, x: NEW_BTN.x + 104, y: NEW_BTN.y + 20, click: true},
  {f: 162, x: NAME_FIELD.x + 150, y: NAME_FIELD.y + 21},
  {f: T.fieldClick, x: NAME_FIELD.x + 150, y: NAME_FIELD.y + 21, click: true},
  {f: 200, x: NAME_FIELD.x + 360, y: NAME_FIELD.y - 34, dur: 22},
  {f: 246, x: CREATE_BTN.x + 58, y: CREATE_BTN.y + 19},
  {f: T.createClick, x: CREATE_BTN.x + 58, y: CREATE_BTN.y + 19, click: true},
  {f: 300, x: 1080, y: 520},
];

const CAMERA: CamKey[] = [
  {f: 0, zoom: 1},
  {f: 112, zoom: 1.9, x: NEW_BTN.x - 60, y: NEW_BTN.y + 140},
  {f: 152, zoom: 1.75, ...centre(SHEET), dur: 26},
  {f: 296, zoom: 1, dur: 32},
];

const CAPTIONS = [
  {start: 22, end: 92, text: 'Open Flowbase from the Dock.'},
  {start: 96, end: 160, text: 'Click New workflow in the top-right corner.'},
  {start: 166, end: 236, text: 'Give it a name you will recognise later.'},
  {start: 240, end: 350, text: 'Click Create, and your workflow is ready.'},
];

const ROWS = [
  {name: 'New lead → CRM', trigger: 'Webhook', status: 'Active', last: '2 min ago'},
  {name: 'Invoice reminders', trigger: 'Schedule', status: 'Active', last: '1 h ago'},
  {name: 'Weekly report', trigger: 'Schedule', status: 'Paused', last: '3 days ago'},
];

const Row: React.FC<{r: (typeof ROWS)[number]; y: number; glow?: number; opacity?: number}> = ({r, y, glow = 0, opacity = 1}) => (
  <div style={{position: 'absolute', left: 32, right: 32, top: y, height: 54, display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', alignItems: 'center', padding: '0 18px', borderRadius: 10, background: `rgba(10,132,255,${0.14 * glow})`, boxShadow: glow ? `inset 0 0 0 1px rgba(10,132,255,${0.6 * glow})` : 'none', borderBottom: `1px solid ${MAC.ui.line}`, fontSize: 15, opacity}}>
    <span style={{fontWeight: 600}}>{r.name}</span>
    <span style={{color: MAC.ui.text2}}>{r.trigger}</span>
    <span style={{display: 'flex', alignItems: 'center', gap: 8, color: MAC.ui.text2}}>
      <span style={{width: 8, height: 8, borderRadius: 4, background: r.status === 'Active' ? MAC.green : MAC.ui.text3}} />
      {r.status}
    </span>
    <span style={{color: MAC.ui.text3}}>{r.last}</span>
  </div>
);

const FlowbaseApp: React.FC<{frame: number; cur: {x: number; y: number}}> = ({frame, cur}) => {
  const sheetIn = prog(frame, T.sheetOpen, 10);
  const sheetOut = prog(frame, T.sheetClose, 8, ease.morph);
  const sheet = Math.min(sheetIn, 1 - sheetOut);
  const rowIn = prog(frame, T.rowIn, 14);
  const glow = rowIn * (1 - prog(frame, T.rowIn + 50, 30, ease.morph));
  const typed = typedAt(NAME, STROKES, frame);
  const press = (f: number) => (frame >= f && frame < f + 7 ? Math.sin(((frame - f) / 7) * Math.PI) : 0);
  // Content-local copies of screen rects (the window's children are positioned inside it).
  const local = (r: Rect): Rect => ({x: r.x - WIN.x, y: r.y - CY, w: r.w, h: r.h});
  const rowsTop = 120;
  return (
    <>
      {/* Sidebar */}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDEBAR_W, background: MAC.ui.sidebar, borderRight: `1px solid ${MAC.ui.line}`, padding: '18px 12px', fontSize: 14}}>
        <div style={{fontSize: 11, fontWeight: 600, color: MAC.ui.text3, letterSpacing: '.06em', padding: '0 10px 8px'}}>WORKSPACE</div>
        {['Workflows', 'Runs', 'Connections', 'Templates', 'Settings'].map((s, i) => (
          <div key={s} style={{padding: '8px 10px', borderRadius: 7, marginBottom: 2, fontWeight: i === 0 ? 600 : 500, color: i === 0 ? MAC.ui.text : MAC.ui.text2, background: i === 0 ? 'rgba(255,255,255,.08)' : 'none'}}>
            {s}
          </div>
        ))}
      </div>
      {/* Main */}
      <div style={{position: 'absolute', left: SIDEBAR_W, top: 0, right: 0, bottom: 0}}>
        <div style={{position: 'absolute', left: 32, top: 28, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em'}}>Workflows</div>
        <div style={{position: 'absolute', left: 32, top: 64, fontSize: 14, color: MAC.ui.text2}}>{3 + (rowIn > 0.5 ? 1 : 0)} workflows</div>
        <div style={{position: 'absolute', left: 32, right: 32, top: rowsTop - 30, display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', padding: '0 18px', fontSize: 12, fontWeight: 600, color: MAC.ui.text3, letterSpacing: '.04em'}}>
          <span>NAME</span>
          <span>TRIGGER</span>
          <span>STATUS</span>
          <span>LAST RUN</span>
        </div>
        {rowIn > 0 && <Row r={{name: NAME, trigger: 'Manual', status: 'Active', last: 'Just now'}} y={rowsTop - 8 + (1 - rowIn) * -16} glow={glow} opacity={rowIn} />}
        {ROWS.map((r, i) => (
          <Row key={r.name} r={r} y={rowsTop + (i + rowIn) * 62 - 8} />
        ))}
      </div>
      <Button rect={local(NEW_BTN)} label={<><span style={{fontSize: 18, marginTop: -2}}>+</span> New workflow</>} hover={isOver(NEW_BTN, cur)} press={press(T.newClick)} />

      {/* New workflow sheet */}
      {sheet > 0 && (
        <>
          <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.42 * sheet})`}} />
          <div style={{position: 'absolute', left: SHEET.x - WIN.x, top: SHEET.y - CY, width: SHEET.w, height: SHEET.h, borderRadius: 14, background: '#2a2a2d', boxShadow: '0 24px 60px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.12)', opacity: sheet, transform: `translateY(${(1 - sheet) * -18}px) scale(${interpolate(sheet, [0, 1], [0.96, 1])})`}}>
            <div style={{position: 'absolute', left: 24, top: 22, fontSize: 19, fontWeight: 700}}>New workflow</div>
            <div style={{position: 'absolute', left: 24, top: 52, fontSize: 14, color: MAC.ui.text2}}>Start from a blank canvas.</div>
            <div style={{position: 'absolute', left: 24, top: 80, fontSize: 13, fontWeight: 600, color: MAC.ui.text2}}>Name</div>
          </div>
          <div style={{position: 'absolute', inset: 0, opacity: sheet, transform: `translateY(${(1 - sheet) * -18}px)`}}>
            <Field rect={local(NAME_FIELD)} text={typed} placeholder="Untitled workflow" focused={frame >= T.fieldClick && frame < T.sheetClose} frame={frame} />
            <Button rect={local(CANCEL_BTN)} label="Cancel" kind="secondary" />
            <Button rect={local(CREATE_BTN)} label="Create" hover={isOver(CREATE_BTN, cur)} press={press(T.createClick)} />
          </div>
        </>
      )}
    </>
  );
};

export const TutorialDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = prog(frame, 0, 28);
  const wake = interpolate(frame, [14, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cam = cameraAt(CAMERA, frame);
  const cur = cursorAt(CURSOR, frame);
  const winOpen = prog(frame, T.winOpen, 16, ease.morph);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: cameraTransform(cam), transformOrigin: '0 0'}}>
        <Studio />
        <AbsoluteFill style={{transform: `translateY(${(1 - enter) * 90}px)`, opacity: enter, filter: enter < 1 ? `blur(${(1 - enter) * 8}px)` : undefined}}>
          <MacBook wake={wake}>
            <Wallpaper />
            <MenuBar app={frame >= T.winOpen ? 'Flowbase' : 'Finder'} />
            <Window rect={WIN} open={winOpen} from={centre(FLOW_ICON)} title="Flowbase">
              <FlowbaseApp frame={frame} cur={cur} />
            </Window>
            <Dock items={DOCK_ITEMS} frame={frame} cursor={cur} running={frame >= T.winOpen ? ['files', 'flow'] : ['files']} bounce={{id: 'flow', f: T.dockClick}} />
            <Highlight rect={CREATE_BTN} frame={frame} start={222} end={252} />
            <Toast frame={frame} start={T.toast} end={340} title="Workflow created" body={`"${NAME}" is ready to build.`} icon={<div style={{width: '100%', height: '100%', borderRadius: 9, background: flowIcon.bg, padding: 3}}>{flowIcon.glyph}</div>} screenW={SCREEN.w} />
            <Cursor c={cur} />
          </MacBook>
        </AbsoluteFill>
      </AbsoluteFill>
      {CAPTIONS.map((c) => (
        <Caption key={c.text} frame={frame} {...c} />
      ))}
    </AbsoluteFill>
  );
};
