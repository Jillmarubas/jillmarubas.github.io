// A Claude Code session in a dark macOS terminal window. Drawn in code for editorial
// illustration; it shows the commands from the source email, not a real capture.
import React from 'react';
import {C, F} from './design';
import {E, clamp, p01} from './ae';
import {typeTimes} from './keys';

export type DiffLine = {t: '+' | '-' | ' '; s: string};
export type TEntry =
  | {at: number; kind: 'say'; text: string}
  | {at: number; kind: 'out'; text: string; color?: string}
  | {at: number; kind: 'ok'; text: string}
  | {at: number; kind: 'tool'; name: string; arg: string; lines?: string[]}
  | {at: number; kind: 'diff'; lines: DiffLine[]}
  | {at: number; kind: 'spin'; text: string; until: number}
  | {at: number; kind: 'note'; text: string};
export type TCmd = {text: string; at: number; enter: number; shell?: boolean};

const LH = 27;
const FS = 17;
const SPIN = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];

const rowsOf = (e: TEntry) => (e.kind === 'tool' ? 1 + (e.lines?.length ?? 0) : e.kind === 'diff' ? e.lines.length : e.kind === 'say' ? Math.ceil(e.text.length / 100) : 1) + 0.5;

export const typedAt = (c: TCmd, t: number) => {
  const times = typeTimes(c.text, c.at, c.enter);
  return c.text.slice(0, times.filter((x) => t >= x).length);
};

export const Terminal: React.FC<{
  t: number;
  w: number;
  h: number;
  cmds: TCmd[];
  entries?: TEntry[];
  model?: string;
  aboveInput?: React.ReactNode;
  aboveRows?: number;
  shell?: boolean; // plain shell prompt instead of the Claude Code input box
  title?: string;
}> = ({t, w, h, cmds, entries = [], model = 'Opus 5.5', aboveInput, aboveRows = 0, shell, title = 'claude — ~/my-app'}) => {
  // Everything in the log, in time order: submitted commands and entries.
  type Item = {at: number; node: React.ReactNode; rows: number};
  const items: Item[] = [];
  for (const c of cmds) {
    if (t >= c.enter) items.push({at: c.enter, rows: Math.ceil((c.text.length + 2) / 100) + 0.5, node: <UserLine text={c.text} shell={c.shell ?? shell} />});
  }
  for (const e of entries) {
    if (t >= e.at && !(e.kind === 'spin' && t >= e.until)) items.push({at: e.at, rows: rowsOf(e), node: <Entry e={e} t={t} />});
  }
  items.sort((a, b) => a.at - b.at);
  const active = cmds.find((c) => t >= c.at && t < c.enter);
  const typing = active ? typedAt(active, t) : '';
  const headerRows = shell ? 0 : 5.5;
  const total = headerRows + items.reduce((s, i) => s + i.rows, 0) + aboveRows + 4;
  const avail = (h - 44 - 24) / LH;
  const over = Math.max(0, total - avail);
  // ease the scroll so new lines push the log up smoothly
  const lastAt = items.length ? items[items.length - 1].at : 0;
  const scroll = over * LH * (0.35 + 0.65 * p01(t, lastAt, 0.25, E.out));
  return (
    <div style={{position: 'absolute', inset: 0, width: w, height: h, borderRadius: 12, overflow: 'hidden', background: '#101012', boxShadow: '0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.1)'}}>
      <div style={{height: 44, background: '#26262a', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 8, position: 'relative', zIndex: 2}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.ink3}}>{title}</div>
      </div>
      <div style={{position: 'absolute', left: 26, right: 26, top: 44 + 16, fontFamily: F.mono, fontSize: FS, lineHeight: `${LH}px`, color: C.ink, transform: `translateY(${-scroll}px)`}}>
        {!shell && <Welcome />}
        {items.map((i, k) => (
          <div key={k} style={{marginBottom: LH * 0.5, opacity: clamp((t - i.at) / 0.12)}}>
            {i.node}
          </div>
        ))}
        {aboveInput}
        {shell ? (
          <div style={{whiteSpace: 'pre'}}>
            <span style={{color: C.green}}>you@mac</span> <span style={{color: C.blue}}>~/my-app</span> % {typing}
            <Caret t={t} />
          </div>
        ) : (
          <>
            <div style={{border: `1.5px solid ${active ? 'rgba(255,255,255,.42)' : 'rgba(255,255,255,.22)'}`, borderRadius: 8, padding: '6px 14px', display: 'flex', whiteSpace: 'pre-wrap', minHeight: LH + 12}}>
              <span style={{color: C.ink3, marginRight: 10}}>{'>'}</span>
              <span style={{flex: 1}}>
                {typing ? <Hl text={typing} /> : null}
                <Caret t={t} />
              </span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.ink3, padding: '4px 4px 0'}}>
              <span>? for shortcuts</span>
              <span>{model}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Caret: React.FC<{t: number}> = ({t}) => <span style={{display: 'inline-block', width: 10, height: 20, marginLeft: 1, verticalAlign: -3, background: C.ink, opacity: Math.floor(t * 2.2) % 2 === 0 ? 0.9 : 0}} />;

// Slash commands and key words light up orange as they're typed.
const Hl: React.FC<{text: string}> = ({text}) => {
  const parts = text.split(/(\/[\w-]+(?:@\w+)?)/g);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i} style={{color: p.startsWith('/') ? C.orangeHi : undefined}}>
          {p}
        </span>
      ))}
    </>
  );
};

const Welcome: React.FC = () => (
  <div style={{border: `1.5px solid ${C.orange}`, borderRadius: 8, padding: '8px 16px', marginBottom: LH * 0.6, width: 620}}>
    <div>
      <span style={{color: C.orange}}>✻</span> Welcome to <b>Claude Code</b>!
    </div>
    <div style={{color: C.ink3, fontSize: 15, marginTop: 6}}>  /help for help, /status for your current setup</div>
    <div style={{color: C.ink3, fontSize: 15}}>  cwd: ~/my-app</div>
  </div>
);

const UserLine: React.FC<{text: string; shell?: boolean}> = ({text, shell}) =>
  shell ? (
    <div style={{whiteSpace: 'pre-wrap'}}>
      <span style={{color: C.green}}>you@mac</span> <span style={{color: C.blue}}>~/my-app</span> % {text}
    </div>
  ) : (
    <div style={{whiteSpace: 'pre-wrap', color: C.ink2, background: 'rgba(255,255,255,.05)', borderRadius: 6, padding: '0 10px'}}>
      <span style={{color: C.ink3}}>{'> '}</span>
      <Hl text={text} />
    </div>
  );

const Entry: React.FC<{e: TEntry; t: number}> = ({e, t}) => {
  switch (e.kind) {
    case 'say':
      return (
        <div style={{display: 'flex', whiteSpace: 'pre-wrap'}}>
          <span style={{color: C.ink, marginRight: 10}}>⏺</span>
          <span>{e.text}</span>
        </div>
      );
    case 'out':
      return <div style={{whiteSpace: 'pre', color: e.color ?? C.ink}}>{e.text}</div>;
    case 'ok':
      return (
        <div style={{whiteSpace: 'pre', color: C.green}}>
          ✓ <span style={{color: C.ink}}>{e.text}</span>
        </div>
      );
    case 'note':
      return <div style={{whiteSpace: 'pre', color: C.ink3}}>  ⎿  {e.text}</div>;
    case 'tool':
      return (
        <div>
          <div style={{whiteSpace: 'pre'}}>
            <span style={{color: C.green, marginRight: 10}}>⏺</span>
            <b>{e.name}</b>({e.arg})
          </div>
          {(e.lines ?? []).map((l, i) => (
            <div key={i} style={{whiteSpace: 'pre', color: C.ink3, opacity: clamp((t - e.at - 0.15 - i * 0.12) / 0.1)}}>
              {i === 0 ? '  ⎿  ' : '     '}
              {l}
            </div>
          ))}
        </div>
      );
    case 'diff':
      return (
        <div>
          {e.lines.map((l, i) => (
            <div key={i} style={{whiteSpace: 'pre', opacity: clamp((t - e.at - i * 0.07) / 0.08), color: l.t === '+' ? '#B9F0C8' : l.t === '-' ? '#F5B3AA' : C.ink2, background: l.t === '+' ? 'rgba(80,190,120,.14)' : l.t === '-' ? 'rgba(240,106,90,.14)' : 'none'}}>
              {'     '}
              {l.t} {l.s}
            </div>
          ))}
        </div>
      );
    case 'spin': {
      const g = SPIN[Math.floor((t - e.at) * 9) % SPIN.length];
      const secs = Math.max(1, Math.floor(t - e.at));
      return (
        <div style={{whiteSpace: 'pre', color: C.orange}}>
          {g} <span style={{color: C.orangeHi}}>{e.text}…</span>
          <span style={{color: C.ink3}}> ({secs}s · esc to interrupt)</span>
        </div>
      );
    }
  }
};
