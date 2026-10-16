import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import TIMING from './timing.json';
import BEATS from './beats.json';
import './fonts';
import {C, FPS, GRADE, H, W} from './design';
import {asset, Cutout, Kicker, Logo, Num, Person, Photo, pieceSize, settle, Words, e01} from './kit';
import {BOARDS, ChapterCard, TitleCard, Upd} from './specials';

/*
 * "The Hidden Cost of AI": a 16:9 paper-collage documentary keyed to the voiceover word by word.
 * shots.txt → beats.json gives every visual beat a time. Within a scene (between "clear" beats) pieces
 * arrive on their words: the newest lands centre-stage, the one before steps aside and shrinks, older
 * ones leave toward the viewer. Full-stage graphics ("boards") take over the stage; pieces that arrive
 * while a board is up dock beside it.
 */
type Beat = {ch: number; line: number; t: number; kind: string; ref?: string; [k: string]: string | number | undefined};
type Chap = {title: string; key: string; start: number; card: number; vo: number; end: number};
const T = TIMING as unknown as {duration: number; chapters: Chap[]; lines: {ch: number; i: number; start: number; end: number}[]};
const B = BEATS as unknown as Beat[];
export const fr = (s: number) => Math.round(s * FPS);
export const HC_DURATION = fr(T.duration);
export const HC_CHAPTERS = T.chapters.map((c) => ({title: c.title, from: fr(c.start), to: fr(c.end)}));

const PIECE = new Set(['p', 'c', 'h', 'l', 't', 'n']);
type Piece = {b: Beat; at: number; idx: number; afterBoard: number}; // afterBoard: index of the board up when it arrived (-1 none)
type Board = {name: string; at: number; end: number; ups: Upd[]; dockAt: number};
type Scene = {ch: number; start: number; end: number; pieces: Piece[]; boards: Board[]; kickers: {at: number; text: string}[]};

const LEAD = 0.22; // pieces start moving a little before their word
const scenes: Scene[] = (() => {
  const out: Scene[] = [];
  T.chapters.forEach((ch, ci) => {
    const bs = B.filter((b) => b.ch === ci);
    let cur: Scene | null = null;
    const startScene = (t: number) => {
      if (cur) cur.end = t;
      cur = {ch: ci, start: t, end: ch.end, pieces: [], boards: [], kickers: []};
      out.push(cur);
    };
    for (const b of bs) {
      if (b.kind === 'clear' || !cur) startScene(b.kind === 'clear' ? b.t : ch.vo);
      if (b.kind === 'clear') continue;
      const s = cur!;
      if (b.kind === 's') continue;
      if (b.kind === 'k') {
        s.kickers.push({at: b.t, text: String(b.ref)});
        continue;
      }
      if (b.kind.startsWith('x:')) {
        const name = b.kind.slice(2);
        const o: Record<string, string> = {};
        for (const [k, v] of Object.entries(b)) if (!['ch', 'line', 't', 'kind', 'ref'].includes(k)) o[k] = String(v);
        const top = s.boards[s.boards.length - 1];
        if (top && top.name === name && top.end > b.t) top.ups.push({at: b.t - top.at, o});
        else {
          if (top && top.end > b.t) top.end = b.t;
          s.boards.push({name, at: b.t - 0.15, end: 1e9, ups: [{at: 0.15, o}], dockAt: 1e9});
        }
        continue;
      }
      if (PIECE.has(b.kind)) {
        const top = s.boards[s.boards.length - 1];
        const up = top && top.end > b.t ? s.boards.length - 1 : -1;
        if (up >= 0 && top.dockAt > b.t) top.dockAt = b.t - LEAD;
        s.pieces.push({b, at: b.t - LEAD, idx: s.pieces.length, afterBoard: up});
      }
    }
    if (cur) (cur as Scene).end = ch.end;
  });
  for (const s of out) for (const bd of s.boards) bd.end = Math.min(bd.end, s.end);
  // board update times are relative to the board start, in frames
  for (const s of out) for (const bd of s.boards) bd.ups = bd.ups.map((u) => ({at: fr(u.at), o: u.o}));
  return out;
})();

/* ------------------------------------------------------------------ layout */
type Pose = {x: number; y: number; s: number; blur: number; o: number; z: number};
const pose = (role: number, idx: number, docked: boolean): Pose => {
  const left = idx % 2 === 0;
  if (docked) {
    if (role === 0) return {x: 1450, y: 540, s: 0.58, blur: 0, o: 1, z: 30};
    return {x: 1700, y: 220, s: 0.3, blur: 2, o: 0.85, z: 20};
  }
  if (role === 0) return {x: W / 2, y: 520, s: 1, blur: 0, o: 1, z: 30};
  if (role === 1) return {x: left ? 330 : W - 330, y: 610, s: 0.46, blur: 1.4, o: 1, z: 20};
  return {x: left ? 250 : W - 250, y: 250, s: 0.3, blur: 3, o: 0.7, z: 10};
};
const mix = (a: Pose, b: Pose, k: number): Pose => ({x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, s: a.s + (b.s - a.s) * k, blur: a.blur + (b.blur - a.blur) * k, o: a.o + (b.o - a.o) * k, z: k < 0.5 ? a.z : b.z});
const MOVE = 13; // frames for a role change
const ENTER = 14;
const EXIT = 20;

const PieceBody: React.FC<{b: Beat; big: boolean; seed: number; night?: boolean}> = ({b, big, seed, night}) => {
  const ref = String(b.ref);
  const kind = b.kind === 'c' && asset(ref)?.type === 'p' ? 'p' : b.kind; // a pick can turn a cut-out into a print
  const [w, h] = pieceSize(kind, ref, big);
  if (kind === 'p') return <Photo id={ref} w={w} h={h} seed={seed} />;
  if (kind === 'c') return <Cutout id={ref} w={w} h={h} />;
  if (kind === 'h') return <Person id={ref} w={w} h={h} />;
  if (kind === 'l') return <Logo id={ref} w={w} h={h} />;
  if (kind === 'n') return <Num text={ref} w={w} />;
  return <Words text={ref} w={w} night={night} />;
};

const DIRS = ['l', 'r', 'b', 't'] as const;
const PieceView: React.FC<{p: Piece; sc: Scene; t: number; board: Board | undefined}> = ({p, sc, t, board}) => {
  const f = fr(t);
  const at = fr(p.at);
  // arrivals of newer pieces in the same docking context push this one back
  const newer = sc.pieces.filter((q) => q.idx > p.idx && q.afterBoard === p.afterBoard).map((q) => fr(q.at));
  const docked = p.afterBoard >= 0;
  const maxRole = docked ? 2 : 3;
  const isText = p.b.kind === 't' || p.b.kind === 'n';
  let role = 0;
  while (!isText && role < newer.length && newer[role] <= f) role++;
  // exit: pushed out, the board it sat beside ends, a new board arrives over it, or the scene clears
  let exitAt = fr(sc.end) - 2;
  if (newer.length >= maxRole) exitAt = Math.min(exitAt, newer[maxRole - 1]);
  if (isText && newer.length) exitAt = Math.min(exitAt, newer[0]);
  if (docked && board === undefined) exitAt = Math.min(exitAt, fr(sc.boards[p.afterBoard].end));
  if (docked) exitAt = Math.min(exitAt, fr(sc.boards[p.afterBoard].end));
  const nextBoard = sc.boards.find((bd) => fr(bd.at) > at);
  if (nextBoard && (!docked || sc.boards.indexOf(nextBoard) !== p.afterBoard)) exitAt = Math.min(exitAt, fr(nextBoard.at));
  if (f < at - 1) return null;
  const r = Math.min(role, maxRole - 1);
  const prev = pose(Math.max(0, r - 1), p.idx, docked);
  const curP = pose(r, p.idx, docked);
  const k = r === 0 ? 1 : settle((f - newer[r - 1]) / MOVE);
  const ps = mix(prev, curP, k);
  // entrance
  const ek = settle((f - at) / ENTER);
  const dir = DIRS[(p.idx + Math.floor(random(`d${sc.start}`) * 4)) % 4];
  const far = {l: [-W * 0.8, 0], r: [W * 0.8, 0], b: [0, H * 0.9], t: [0, -H * 0.9]}[dir];
  const textual = p.b.kind === 't' || p.b.kind === 'n';
  const dx = textual ? 0 : far[0] * (1 - ek);
  const dy = textual ? (1 - ek) * 50 : far[1] * (1 - ek);
  const eo = textual ? e01(f, at, 10) : f < at ? 0 : 1;
  const vel = textual ? 0 : Math.abs(far[0] + far[1]) * (settle((f - at) / ENTER) - settle((f - 1 - at) / ENTER));
  // drift once landed
  const seed = p.idx * 7.3 + sc.start;
  const hold = Math.max(0, f - at - ENTER);
  const amp = Math.min(1, hold / 30);
  const rot0 = p.b.kind === 'p' ? (random(`r${seed}`) - 0.5) * 6 : p.b.kind === 'c' ? (random(`r${seed}`) - 0.5) * 4 : 0;
  const spin = textual ? 0 : (random(`s${seed}`) > 0.5 ? 1 : -1) * 14 * (1 - ek);
  const driftX = amp * 4 * Math.sin(hold / 31 + seed);
  const driftY = amp * 6 * Math.sin(hold / 23 + seed * 2);
  const driftR = textual ? 0 : amp * 0.8 * Math.sin(hold / 41 + seed);
  // exit toward the viewer
  const lag = Math.min(1, Math.max(0, ps.x / W)) * 5;
  const xk = isText ? Math.min(1, Math.max(0, (f - exitAt + 4) / 10)) : Math.min(1, Math.max(0, (f - exitAt - lag) / EXIT));
  const ex = xk * xk * (3 - 2 * xk);
  if (ex >= 1) return null;
  const grow = 1 / (1 - 0.8 * ex);
  const ox = (ps.x - W / 2) * (grow - 1) * 1.2;
  const oy = (ps.y - H / 2) * (grow - 1) * 1.2;
  const blur = ps.blur + Math.min(12, vel * 0.05) + ex * ex * 34;
  const opacity = eo * ps.o * (1 - Math.max(0, (ex - 0.7) / 0.3));
  const lift = 10 + ex * 30;
  const shadow = textual ? '' : `drop-shadow(${6 + lift * 0.3}px ${10 + lift * 0.5}px ${12 + lift * 0.8}px rgba(29,27,24,${0.28 * (1 - ex)}))`;
  return (
    <div
      style={{
        position: 'absolute',
        left: ps.x,
        top: ps.y,
        zIndex: ps.z + Math.round(ex * 50),
        opacity,
        transform: `translate(-50%,-50%) translate(${dx + driftX + ox}px,${dy + driftY + oy}px) rotate(${rot0 + spin + driftR}deg) scale(${ps.s * grow})`,
        filter: `${shadow} ${blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : ''}`.trim() || undefined,
      }}
    >
      <PieceBody b={p.b} big={ps.s > 0.9} seed={seed} night={docked && sc.boards[p.afterBoard].name === 'chat' && sc.boards[p.afterBoard].ups[0].o.mode !== 'mini'} />
    </div>
  );
};

const isNight = (bd: Board) => bd.name === 'chat' && bd.ups[0].o.mode !== 'mini';
/** How much of the frame is the black chat screen at time t (fades with the board's exit). */
const nightAt = (t: number) => {
  let v = 0;
  for (const s of scenes)
    for (const bd of s.boards) {
      if (!isNight(bd) || t < bd.at || t > bd.end + 1) continue;
      v = Math.max(v, Math.min(1, (t - bd.at) * 24 / 3) * (1 - Math.min(1, Math.max(0, (t - bd.end) * 24 / 14))));
    }
  return v;
};
const BoardView: React.FC<{bd: Board; sc: Scene; t: number}> = ({bd, sc, t}) => {
  const f = fr(t);
  const at = fr(bd.at);
  const end = fr(bd.end);
  if (f < at || f > end + EXIT) return null;
  const Comp = BOARDS[bd.name];
  if (!Comp) return null;
  const lf = f - at;
  const dk = settle((f - fr(bd.dockAt)) / MOVE);
  const xk = Math.min(1, Math.max(0, (f - end) / EXIT));
  const ex = xk * xk * (3 - 2 * xk);
  const grow = 1 / (1 - 0.7 * ex);
  const chat = isNight(bd);
  const tx = -330 * dk;
  const s = 1 - 0.34 * dk;
  return (
    <AbsoluteFill style={{opacity: 1 - ex, transform: `translateX(${tx}px) scale(${s * grow})`, filter: ex > 0 ? `blur(${ex * 24}px)` : undefined, zIndex: chat ? 5 : 1}}>
      <Comp f={lf} ups={bd.ups} dur={end - at} docked={dk} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ film */
const Paper: React.FC<{ox: number; oy: number}> = ({ox, oy}) => (
  <AbsoluteFill style={{transform: `translate(${ox}px,${oy}px) scale(1.04)`}}>
    <Img src={staticFile('dc/paper.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </AbsoluteFill>
);
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

export const HCFilm: React.FC<{offset?: number}> = ({offset = 0}) => {
  const f = useCurrentFrame() + offset;
  const t = f / FPS;
  const ci = chapterAt(t);
  const ch = T.chapters[ci];
  // scenes on stage: the current one and any still leaving
  const live = scenes.filter((s) => t >= s.start - 0.5 && t <= s.end + 1.2 && s.ch === ci);
  const cur = live.filter((s) => t >= s.start).pop();
  const u = cur ? Math.min(1, (t - cur.start) / Math.max(1, cur.end - cur.start)) : 0;
  const dir = cur ? (random(`cam${cur.start}`) > 0.5 ? 1 : -1) : 1;
  const camX = dir * 26 * (u - 0.5);
  const camY = -10 * (u - 0.5);
  const camS = 1 + 0.035 * u;
  const [br, sat] = GRADE[ci];
  const night = nightAt(t);
  const cardOn = ci > 0 && t < ch.vo + 0.1;
  const lastLine = T.lines.filter((l) => l.ch === 0).pop()!;
  const titleOn = ci === 0 && t > lastLine.end + 0.45;
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden', color: C.ink, filter: `brightness(${br}) saturate(${sat})`}}>
      <Paper ox={camX * 0.3} oy={camY * 0.3} />
      {night > 0 && <AbsoluteFill style={{background: C.night, opacity: night}} />}
      <AbsoluteFill style={{transform: `translate(${camX}px,${camY}px) scale(${camS})`}}>
        {live.map((s) => (
          <React.Fragment key={s.start}>
            {s.boards.map((bd, i) => (
              <BoardView key={i} bd={bd} sc={s} t={t} />
            ))}
            {s.pieces.map((p) => (
              <PieceView key={p.idx} p={p} sc={s} t={t} board={s.boards.find((bd) => t >= bd.at && t < bd.end)} />
            ))}
            {s.kickers.map((k, i) => {
              const nxt = s.kickers[i + 1]?.at ?? 1e9;
              const end = Math.min(s.end, k.at + 9, nxt);
              const o = e01(f, fr(k.at), 10) * (1 - e01(f, fr(end) - 8, 8));
              return o > 0 ? <Kicker key={i} text={k.text} o={o} /> : null;
            })}
          </React.Fragment>
        ))}
      </AbsoluteFill>
      {cardOn && <ChapterCard f={f - fr(ch.start)} n={ci} title={ch.title} dur={fr(ch.vo + 0.1 - ch.start)} />}
      {titleOn && <TitleCard f={f - fr(lastLine.end + 0.45)} />}
      <Lens />
    </AbsoluteFill>
  );
};

/** One chapter, for rendering the film in parts on Lambda (picture only; audio is muxed after). */
export const HCPart: React.FC<{part: number}> = ({part}) => <HCFilm offset={HC_CHAPTERS[part].from} />;
