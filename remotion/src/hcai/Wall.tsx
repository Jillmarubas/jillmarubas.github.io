import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import TIMING from './timing.json';
import BEATS from './beats.json';
import './fonts';
import {C, F, FPS, GRADE, H, W} from './design';
import {Accent, asset, Cutout, Kicker, Logo, Num, Person, Photo, pieceSize, settle, Words, e01, inOut} from './kit';
import {BOARDS, ChapterCard, TitleCard, Upd} from './specials';
import {fr, HC_CHAPTERS} from './Film';

/*
 * "The Hidden Cost of AI", wall edition. Every chapter is one big paper wall. Each picture is pinned to the wall
 * on its word and the camera glides to it; earlier pictures stay pinned around it, so the chapter builds into a
 * map of everything it covered. Key words and numbers are paper labels pinned beside their picture. Charts and
 * maps are sheets on the wall, and pictures that arrive while one is up are pinned in columns beside it. A topic
 * change ("clear" in shots.txt) starts a new row, and the camera pulls back on the way to show the section so far.
 * The late-night chat screens, chapter cards and kickers stay fixed to the screen.
 */
type Beat = {ch: number; line: number; t: number; kind: string; ref?: string; [k: string]: string | number | undefined};
type Chap = {title: string; key: string; start: number; card: number; vo: number; end: number};
const T = TIMING as unknown as {duration: number; chapters: Chap[]; lines: {ch: number; i: number; start: number; end: number}[]};
const BT = BEATS as unknown as Beat[];
type Rect = {x: number; y: number; w: number; h: number};
type Pin = {
  id: number;
  kind: string; // p c h l (pictures), t n (labels), board
  ref: string;
  at: number; // seconds: when it lands on the wall
  w: number;
  h: number;
  x: number; // top-left on the wall
  y: number;
  rot: number;
  fs?: number; // label type size
  board?: {name: string; ups: Upd[]; dur: number; content: Rect}; // ups in frames from the board's start
};
type Group = {pins: Pin[]; dockTo: number; cluster: number; w: number; h: number; x: number; y: number};
type Focus = {at: number; group: number; first: boolean}; // first: the first focus of a new topic
type Night = {start: number; end: number; ups: Upd[]; pieces: {b: Beat; at: number}[]};
type WallData = {groups: Group[]; pins: Pin[]; focuses: Focus[]; clusterEnd: number[]; nights: Night[]; kickers: {at: number; text: string}[]};

const LEAD = 0.22; // pictures land a little before their word
const PICTURE = new Set(['p', 'c', 'h', 'l']);
const LABEL = new Set(['t', 'n']);
const opts = (b: Beat) => {
  const o: Record<string, string> = {};
  for (const [k, v] of Object.entries(b)) if (!['ch', 'line', 't', 'kind', 'ref'].includes(k)) o[k] = String(v);
  return o;
};
const labelSize = (kind: string, text: string): [number, number, number] => {
  const n = text.replace(/\*/g, '').length;
  const fs = kind === 'n' ? (n <= 6 ? 150 : n <= 10 ? 120 : 96) : n > 34 ? 58 : n > 22 ? 68 : n > 12 ? 82 : 100;
  const one = 84 + n * fs * (kind === 'n' ? 0.66 : 0.64); // Fraunces Black runs wide
  const lines = Math.max(1, Math.ceil(one / 1100));
  return [Math.min(1100, one), lines * fs * 1.06 + 44, fs];
};
const pictureKind = (b: Beat) => (b.kind === 'c' && asset(String(b.ref))?.type === 'p' ? 'p' : b.kind); // a pick can turn a cut-out into a print

/* ------------------------------------------------------------------ build: pins, groups and camera stops */
const build = (ci: number): WallData => {
  const ch = T.chapters[ci];
  const beats = BT.filter((b) => b.ch === ci);
  const groups: Group[] = [];
  const pins: Pin[] = [];
  const focuses: Focus[] = [];
  const nights: Night[] = [];
  const kickers: {at: number; text: string}[] = [];
  const clusterEnd: number[] = [];
  let cl = -1;
  let night: Night | null = null;
  let sheet = -1; // group index of the chart/map currently up in this topic
  let cur = -1; // group that labels attach to
  let firstOfCluster = true;
  const pin = (p: Omit<Pin, 'id' | 'x' | 'y' | 'rot'>): Pin => {
    const seed = `${ci}-${pins.length}`;
    const rot = p.kind === 'board' ? 0 : p.kind === 'p' ? (random(`r${seed}`) - 0.5) * 5 : p.kind === 't' || p.kind === 'n' ? (random(`r${seed}`) - 0.5) * 4 : (random(`r${seed}`) - 0.5) * 3;
    const out = {...p, id: pins.length, x: 0, y: 0, rot};
    pins.push(out);
    return out;
  };
  const focus = (at: number, group: number) => {
    const last = focuses[focuses.length - 1];
    focuses.push({at, group, first: firstOfCluster && (!last || last.group !== group)});
    firstOfCluster = false;
  };
  const newGroup = (p: Pin) => {
    groups.push({pins: [p], dockTo: sheet, cluster: cl, w: 0, h: 0, x: 0, y: 0});
    return groups.length - 1;
  };
  const closeNight = (t: number) => {
    if (night) night.end = t;
    night = null;
  };
  const newCluster = (t: number) => {
    if (cl >= 0) clusterEnd[cl] = t;
    cl++;
    closeNight(t);
    sheet = -1;
    cur = -1;
    firstOfCluster = true;
  };
  for (const b of beats) {
    if (b.kind === 'clear' || cl < 0) newCluster(b.kind === 'clear' ? b.t : ch.vo);
    if (b.kind === 'clear' || b.kind === 's') continue;
    if (b.kind === 'k') {
      kickers.push({at: b.t, text: String(b.ref)});
      continue;
    }
    const at = b.t - LEAD;
    if (b.kind.startsWith('x:')) {
      const name = b.kind.slice(2);
      const o = opts(b);
      if (night && name === 'chat') {
        (night as Night).ups.push({at: fr(b.t - (night as Night).start), o});
        continue;
      }
      if (name === 'chat' && o.mode !== 'mini' && !(sheet >= 0 && groups[sheet].pins[0].ref === 'chat')) {
        night = {start: b.t - 0.15, end: 1e9, ups: [{at: fr(0.15), o}], pieces: []};
        nights.push(night);
        sheet = -1;
        cur = -1;
        continue;
      }
      if (sheet >= 0 && groups[sheet].pins[0].ref === name) {
        const p = groups[sheet].pins[0];
        p.board!.ups.push({at: fr(b.t - p.at), o});
        focus(b.t - 0.1, sheet);
        continue;
      }
      // the part of the full-stage graphic that has content (the mini chat is a small card in the middle)
      const content = name === 'chat' ? {x: W / 2 - 520, y: H / 2 - 230, w: 1040, h: 480} : {x: 0, y: 0, w: W, h: H};
      const p = pin({kind: 'board', ref: name, at: b.t - 0.15, w: content.w, h: content.h, board: {name, ups: [{at: fr(0.15), o}], dur: 0, content}});
      sheet = -1;
      const gi = newGroup(p);
      sheet = gi;
      cur = -1;
      focus(p.at, gi);
      continue;
    }
    if (night) {
      (night as Night).pieces.push({b, at});
      continue;
    }
    if (PICTURE.has(b.kind)) {
      const kind = pictureKind(b);
      const [w, h] = pieceSize(kind, String(b.ref), true);
      const gi = newGroup(pin({kind, ref: String(b.ref), at, w, h}));
      cur = gi;
      focus(at, gi);
    } else if (LABEL.has(b.kind)) {
      const [w, h, fs] = labelSize(b.kind, String(b.ref));
      const p = pin({kind: b.kind, ref: String(b.ref), at, w, h, fs});
      if (cur >= 0 && groups[cur].pins.length < 3 && groups[cur].dockTo === sheet) groups[cur].pins.push(p);
      else cur = newGroup(p);
      focus(at, cur);
    }
  }
  if (cl >= 0) clusterEnd[cl] = ch.end;
  closeNight(ch.end);
  // a chart's time on stage: until the camera leaves it for good in this topic (the counter counts up over it)
  groups.forEach((g, gi) => {
    const p = g.pins[0];
    if (!p.board) return;
    const later = focuses.filter((q) => q.at > p.at && groups[q.group].cluster === g.cluster);
    const leave = later.find((q) => q.group !== gi && !later.some((r) => r.at > q.at && r.group === gi));
    p.board.dur = fr((leave ? leave.at : clusterEnd[g.cluster]) - p.at);
  });
  layout(groups);
  return {groups, pins, focuses, clusterEnd, nights, kickers};
};

/* ------------------------------------------------------------------ layout on the wall */
const GAP = 150; // between pictures
const LGAP = 70; // picture to its labels
const ROWGAP = 240;
const TOPICGAP = 460;
const MAXW = 5600;
const sizeGroup = (g: Group) => {
  const [main, ...rest] = g.pins;
  if (main.kind === 't' || main.kind === 'n') {
    g.w = Math.max(...g.pins.map((p) => p.w));
    g.h = g.pins.reduce((s, p) => s + p.h, 0) + 40 * (g.pins.length - 1);
    let y = 0;
    for (const p of g.pins) {
      p.x = (g.w - p.w) / 2;
      p.y = y;
      y += p.h + 40;
    }
    return;
  }
  const lw = rest.length ? Math.max(...rest.map((p) => p.w)) : 0;
  const lh = rest.reduce((s, p) => s + p.h, 0) + 40 * Math.max(0, rest.length - 1);
  g.w = main.w + (rest.length ? LGAP + lw : 0);
  g.h = Math.max(main.h, lh);
  main.x = 0;
  main.y = (g.h - main.h) / 2;
  let y = (g.h - lh) / 2;
  for (const p of rest) {
    p.x = main.w + LGAP;
    p.y = y;
    y += p.h + 40;
  }
};
type Unit = {groups: number[]; w: number; h: number; place: (x: number, y: number) => void};
function layout(groups: Group[]) {
  groups.forEach(sizeGroup);
  const move = (g: Group, x: number, y: number) => {
    g.x = x;
    g.y = y;
  };
  // units: a chart with the pictures docked beside it (columns of two), or a single free group
  const units: Unit[][] = [];
  groups.forEach((g, gi) => {
    if (g.dockTo >= 0) return;
    while (units.length <= g.cluster) units.push([]);
    const docked = groups.map((d, di) => (d.dockTo === gi ? di : -1)).filter((di) => di >= 0);
    if (!g.pins[0].board || !docked.length) {
      units[g.cluster].push({groups: [gi], w: g.w, h: g.h, place: (x, y) => move(g, x, y)});
      return;
    }
    const cols: number[][] = [];
    docked.forEach((di, k) => (k % 2 === 0 ? cols.push([di]) : cols[cols.length - 1].push(di)));
    const colW = cols.map((c) => Math.max(...c.map((di) => groups[di].w)));
    const colH = cols.map((c) => c.reduce((s, di) => s + groups[di].h, 0) + GAP * (c.length - 1));
    const w = g.w + colW.reduce((s, cw) => s + cw + GAP, 0);
    const h = Math.max(g.h, ...colH);
    units[g.cluster].push({
      groups: [gi, ...docked],
      w,
      h,
      place: (x, y) => {
        move(g, x, y + (h - g.h) / 2);
        let cx = x + g.w + GAP;
        cols.forEach((c, k) => {
          let cy = y + (h - colH[k]) / 2;
          for (const di of c) {
            const d = groups[di];
            move(d, cx + (colW[k] - d.w) / 2, cy);
            cy += d.h + GAP;
          }
          cx += colW[k] + GAP;
        });
      },
    });
  });
  // rows: each topic starts a new row; long topics wrap; rows run left-right, then right-left (short moves)
  let y = 0;
  let dir = 1;
  let anchor = 0; // x where the last row ended: the next row starts there, so the camera never zigzags
  for (const topic of units) {
    if (!topic || !topic.length) continue;
    const rows: Unit[][] = [[]];
    let rw = 0;
    for (const u of topic) {
      if (rows[rows.length - 1].length && rw + GAP + u.w > MAXW) {
        rows.push([]);
        rw = 0;
      }
      rows[rows.length - 1].push(u);
      rw += (rw ? GAP : 0) + u.w;
    }
    for (const row of rows) {
      const rh = Math.max(...row.map((u) => u.h));
      const rw = row.reduce((s2, u) => s2 + u.w, 0) + GAP * (row.length - 1);
      // run right from the anchor (or left, alternating), kept inside the wall's width
      let x = dir > 0 ? Math.min(anchor, Math.max(0, MAXW - rw)) : Math.max(anchor, Math.min(MAXW, rw));
      for (const u of row) {
        const ux = dir > 0 ? x : x - u.w;
        u.place(ux, y + (rh - u.h) / 2);
        anchor = ux + u.w / 2;
        x = dir > 0 ? x + u.w + GAP : x - u.w - GAP;
      }
      y += rh + ROWGAP;
      dir = -dir;
    }
    y += TOPICGAP - ROWGAP;
  }
  // pins to wall coordinates
  for (const g of groups) for (const p of g.pins) {
    p.x += g.x;
    p.y += g.y;
  }
}

/* ------------------------------------------------------------------ camera */
type Cam = {x: number; y: number; z: number};
type Move = {t0: number; d: number; a: Cam; b: Cam; lzMid: number | null};
const ZMAX = 1.3;
const union = (rs: Rect[]): Rect => {
  const x0 = Math.min(...rs.map((r) => r.x));
  const y0 = Math.min(...rs.map((r) => r.y));
  const x1 = Math.max(...rs.map((r) => r.x + r.w));
  const y1 = Math.max(...rs.map((r) => r.y + r.h));
  return {x: x0, y: y0, w: x1 - x0, h: y1 - y0};
};
const pinRect = (p: Pin): Rect => ({x: p.x, y: p.y, w: p.w, h: p.h});
const fit = (r: Rect, fill: number) => Math.min((fill * W) / r.w, (fill * H) / r.h);
/** Where the camera frames a group at time t: its picture and the labels pinned so far. */
const frameGroup = (g: Group, t: number): Cam => {
  const r = union(g.pins.filter((p, i) => i === 0 || p.at <= t + 0.01).map(pinRect));
  const z = g.pins[0].board ? Math.min(ZMAX, fit(r, 0.96)) : Math.min(ZMAX, Math.max(0.3, Math.min((0.8 * W) / r.w, (0.72 * H) / r.h)));
  return {x: r.x + r.w / 2, y: r.y + r.h / 2, z};
};
const viewRect = (c: Cam): Rect => ({x: c.x - W / 2 / c.z, y: c.y - H / 2 / c.z, w: W / c.z, h: H / c.z});
const evalMove = (m: Move, t: number): Cam => {
  const u = Math.min(1, Math.max(0, (t - m.t0) / m.d));
  const e = inOut(u);
  const la = Math.log(m.a.z);
  const lb = Math.log(m.b.z);
  let lz = la + (lb - la) * e;
  if (m.lzMid !== null) {
    const lc = 2 * m.lzMid - (la + lb) / 2;
    lz = (1 - e) * (1 - e) * la + 2 * e * (1 - e) * lc + e * e * lb;
  }
  const hold = Math.max(0, t - (m.t0 + m.d)); // a slow push-in while the camera rests on a picture
  return {x: m.a.x + (m.b.x - m.a.x) * e, y: m.a.y + (m.b.y - m.a.y) * e, z: Math.exp(lz) * (1 + 0.018 * Math.min(1, hold / 6))};
};
const planCamera = (w: WallData): Move[] => {
  const moves: Move[] = [];
  let prevT = -1e9;
  let lastGroup = -1;
  w.focuses.forEach((fo, i) => {
    const g = w.groups[fo.group];
    const target = frameGroup(g, fo.at);
    if (!moves.length) {
      moves.push({t0: fo.at - 1, d: 0.01, a: target, b: target, lzMid: null});
      prevT = fo.at;
      lastGroup = fo.group;
      return;
    }
    const prev = moves[moves.length - 1];
    let t0 = Math.max(fo.at - 0.35, prev.t0 + 0.2);
    let d = 0.8;
    let lzMid: number | null = null;
    const a0 = evalMove(prev, t0);
    const dist = (Math.hypot(target.x - a0.x, target.y - a0.y) * Math.min(a0.z, target.z)) / W; // in screen widths
    if (fo.group === lastGroup && dist < 0.05 && Math.abs(Math.log(target.z / a0.z)) < 0.05) return; // already there
    d = Math.min(1.4, Math.max(0.6, 0.55 + 0.3 * dist));
    if (fo.first && i > 0) {
      // a new topic: pull back to show the section so far, then travel on
      const prevGroups = w.groups.filter((q) => q.cluster === g.cluster - 1);
      const start = Math.max(prevT + 0.8, fo.at - 1.7, prev.t0 + prev.d);
      if (fo.at + 0.5 - start >= 1.1 && prevGroups.length) {
        t0 = start;
        d = fo.at + 0.5 - start;
        const r = union([...prevGroups.map((q) => ({x: q.x, y: q.y, w: q.w, h: q.h})), viewRect(target)]);
        lzMid = Math.log(Math.min(a0.z, target.z, fit(r, 0.92)));
      }
    }
    const a = evalMove(prev, t0);
    if (lzMid === null && dist > 1.2) lzMid = Math.log(Math.min(a.z, target.z, fit(union([viewRect(a), viewRect(target)]), 0.95)));
    moves.push({t0, d, a, b: target, lzMid});
    prevT = fo.at;
    lastGroup = fo.group;
  });
  return moves;
};

const WALLS = T.chapters.map((_, ci) => build(ci));
const PLANS = WALLS.map(planCamera);
const camAt = (ci: number, t: number): Cam => {
  const moves = PLANS[ci];
  if (!moves.length) return {x: 0, y: 0, z: 1};
  let lo = 0;
  let hi = moves.length - 1;
  if (t < moves[0].t0) return moves[0].b;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (moves[mid].t0 <= t) lo = mid;
    else hi = mid - 1;
  }
  return evalMove(moves[lo], t);
};

/* ------------------------------------------------------------------ pieces on the wall */
const Label: React.FC<{p: Pin}> = ({p}) => (
  <div style={{width: p.w, height: p.h, background: C.card, boxSizing: 'border-box', padding: '20px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
    <div style={{fontFamily: F.display, fontWeight: 900, fontSize: p.fs, lineHeight: 1.04, color: p.kind === 'n' ? C.hum : C.ink, textAlign: 'center', letterSpacing: p.kind === 'n' ? '-0.02em' : '-0.01em', whiteSpace: p.w < 1100 ? 'nowrap' : undefined}}>
      <Accent text={p.ref} />
    </div>
    <div style={{position: 'absolute', top: -13, left: '50%', width: 110, height: 28, marginLeft: -55, background: 'rgba(236,226,200,0.85)', transform: `rotate(${-p.rot * 1.5}deg)`}} />
  </div>
);
const Body: React.FC<{p: Pin}> = ({p}) => {
  if (p.kind === 'p') return <Photo id={p.ref} w={p.w} h={p.h} seed={p.id} />;
  if (p.kind === 'c') return <Cutout id={p.ref} w={p.w} h={p.h} />;
  if (p.kind === 'h') return <Person id={p.ref} w={p.w} h={p.h} />;
  if (p.kind === 'l') return <Logo id={p.ref} w={p.w} h={p.h} />;
  return <Label p={p} />;
};
const PinView: React.FC<{p: Pin; f: number}> = ({p, f}) => {
  const at = fr(p.at);
  if (p.board) {
    const Comp = BOARDS[p.board.name];
    if (!Comp) return null;
    return (
      <div style={{position: 'absolute', left: p.x - p.board.content.x, top: p.y - p.board.content.y, width: W, height: H, opacity: e01(f, at - 2, 8)}}>
        <Comp f={f - at} ups={p.board.ups} dur={p.board.dur} docked={0} />
      </div>
    );
  }
  // pulled onto the wall: drops in from a little above, slightly large and turned, and settles flat
  const k = settle((f - at) / 12);
  const lift = 1 - k;
  const turn = (random(`t${p.id}`) > 0.5 ? 1 : -1) * 6 * lift;
  const shadow = `drop-shadow(${5 + 16 * lift}px ${9 + 30 * lift}px ${12 + 26 * lift}px rgba(29,27,24,${0.24 + 0.12 * lift}))`;
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x,
        top: p.y,
        width: p.w,
        height: p.h,
        opacity: e01(f, at - 1, 5),
        transform: `translateY(${-70 * lift}px) rotate(${p.rot + turn}deg) scale(${1 + 0.1 * lift})`,
        filter: shadow,
      }}
    >
      <Body p={p} />
    </div>
  );
};

/* ------------------------------------------------------------------ the late-night chat screens */
const NightPiece: React.FC<{b: Beat}> = ({b}) => {
  const ref = String(b.ref);
  const kind = pictureKind(b);
  const [w, h] = pieceSize(kind, ref, false);
  if (kind === 'p') return <Photo id={ref} w={w} h={h} seed={1} />;
  if (kind === 'c') return <Cutout id={ref} w={w} h={h} />;
  if (kind === 'h') return <Person id={ref} w={w} h={h} />;
  if (kind === 'l') return <Logo id={ref} w={w} h={h} />;
  if (kind === 'n') return <Num text={ref} w={w} />;
  return <Words text={ref} w={w} night />;
};
const NightStage: React.FC<{n: Night; f: number}> = ({n, f}) => {
  const at = fr(n.start);
  const end = fr(n.end);
  const o = Math.min(1, (f - at) / 3) * (1 - Math.min(1, Math.max(0, (f - end) / 14)));
  if (o <= 0) return null;
  const Chat = BOARDS.chat;
  const first = n.pieces[0];
  const dk = first ? settle((f - fr(first.at)) / 13) : 0;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: C.night}} />
      <AbsoluteFill style={{transform: `translateX(${-330 * dk}px) scale(${1 - 0.34 * dk})`}}>
        <Chat f={f - at} ups={n.ups} dur={end - at} docked={dk} />
      </AbsoluteFill>
      {n.pieces.map((p, i) => {
        const pa = fr(p.at);
        const next = n.pieces[i + 1] ? fr(n.pieces[i + 1].at) : 1e9;
        if (f < pa - 1 || f > next + 10) return null;
        const k = settle((f - pa) / 14);
        const out = Math.min(1, Math.max(0, (f - next) / 10));
        return (
          <div key={i} style={{position: 'absolute', left: 1450, top: 540, opacity: k * (1 - out), transform: `translate(-50%,-50%) translateY(${(1 - k) * 40}px) scale(${0.58 * (1 + 0.15 * out)})`}}>
            <NightPiece b={p.b} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ film */
const Lens: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 48%, transparent 58%, rgba(29,27,24,0.22) 100%)', pointerEvents: 'none'}} />
    <AbsoluteFill style={{backgroundImage: `url(${staticFile('dc/grain.png')})`, backgroundSize: '512px 512px', opacity: 0.09, mixBlendMode: 'multiply'}} />
  </>
);
const chapterAt = (t: number) => {
  let c = 0;
  T.chapters.forEach((ch, i) => {
    if (t >= ch.start) c = i;
  });
  return c;
};
const TILE = [3840, 2160];

export const HCWall: React.FC<{offset?: number; overview?: number}> = ({offset = 0, overview}) => {
  const f0 = useCurrentFrame() + offset;
  const ci = overview ?? chapterAt(f0 / FPS);
  const ch = T.chapters[ci];
  const wall = WALLS[ci];
  // overview (QA): the whole chapter wall with everything pinned
  const all = overview !== undefined ? union(wall.groups.map((g) => ({x: g.x, y: g.y, w: g.w, h: g.h}))) : null;
  const f = all ? fr(ch.end) + 100 : f0;
  const t = f / FPS;
  const cam = all ? {x: all.x + all.w / 2, y: all.y + all.h / 2, z: fit(all, 0.96)} : camAt(ci, t);
  const v = viewRect(cam);
  const mx = v.w * 0.2;
  const my = v.h * 0.2;
  const onScreen = (p: Pin) => {
    const r = p.board ? {x: p.x - p.board.content.x, y: p.y - p.board.content.y, w: W, h: H} : p;
    return r.x < v.x + v.w + mx && r.x + r.w > v.x - mx && r.y < v.y + v.h + my && r.y + r.h > v.y - my;
  };
  const [br, sat] = GRADE[ci];
  const cardOn = !all && ci > 0 && t < ch.vo + 0.1;
  const lastLine = T.lines.filter((l) => l.ch === 0).pop()!;
  const titleOn = !all && ci === 0 && t > lastLine.end + 0.45;
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden', color: C.ink, filter: `brightness(${br}) saturate(${sat})`}}>
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('dc/paper_tile.jpg')})`,
          backgroundSize: `${TILE[0] * cam.z}px ${TILE[1] * cam.z}px`,
          backgroundPosition: `${W / 2 - cam.x * cam.z}px ${H / 2 - cam.y * cam.z}px`,
        }}
      />
      <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${W / 2}px,${H / 2}px) scale(${cam.z}) translate(${-cam.x}px,${-cam.y}px)`}}>
        {wall.pins.filter((p) => fr(p.at) <= f + 2 && onScreen(p)).map((p) => (
          <PinView key={p.id} p={p} f={f} />
        ))}
      </AbsoluteFill>
      {!all && wall.nights.map((n, i) => (t >= n.start - 0.1 && t <= n.end + 1 ? <NightStage key={i} n={n} f={f} /> : null))}
      {!all && wall.kickers.map((k, i) => {
        const nxt = wall.kickers[i + 1]?.at ?? 1e9;
        const cl = wall.clusterEnd.find((e) => e > k.at) ?? ch.end;
        const end = Math.min(cl, k.at + 9, nxt);
        const o = e01(f, fr(k.at), 10) * (1 - e01(f, fr(end) - 8, 8));
        return o > 0 ? <Kicker key={i} text={k.text} o={o} /> : null;
      })}
      {cardOn && <ChapterCard f={f - fr(ch.start)} n={ci} title={ch.title} dur={fr(ch.vo + 0.1 - ch.start)} />}
      {titleOn && <TitleCard f={f - fr(lastLine.end + 0.45)} />}
      <Lens />
    </AbsoluteFill>
  );
};

/** One chapter, for rendering the film in parts on Lambda (picture only; audio is muxed after). */
export const HCWallPart: React.FC<{part: number}> = ({part}) => <HCWall offset={HC_CHAPTERS[part].from} />;
/** For checking the layout: the whole wall of one chapter at time t, pins drawn as they stand then. */
export const wallStats = () => WALLS.map((w, ci) => ({ci, pins: w.pins.length, groups: w.groups.length, moves: PLANS[ci].length, bbox: union(w.groups.map((g) => ({x: g.x, y: g.y, w: g.w, h: g.h})))}));
