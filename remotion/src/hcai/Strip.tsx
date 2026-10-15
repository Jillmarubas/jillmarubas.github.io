import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import TIMING from './timing.json';
import STRIP from './strip.json';
import './fonts';
import {C, F, FPS, GRADE, H, W} from './design';
import {asset, Cutout, Logo, Person, e01, inOut} from './kit';
import {BOARDS, ChapterCard, TitleCard, Upd} from './specials';
import {fr, HC_CHAPTERS} from './Film';

/*
 * "The Hidden Cost of AI", film-strip edition. One picture per idea (scripts/hcai_strip.py picks them), each in a
 * frame of a 35mm strip. When the narration moves to the next idea the strip slides one frame along; while a picture
 * is being explained it stays put, with a slow push-in. Charts and maps are frames too, and the camera leans in on
 * them so they read. Places, key numbers and image credits are printed on the film's edge. The late-night chat
 * screens and chapter cards stay full-screen.
 */
type Chap = {title: string; key: string; start: number; card: number; vo: number; end: number};
const T = TIMING as unknown as {duration: number; chapters: Chap[]; lines: {ch: number; i: number; start: number; end: number}[]};
type Frame = {ch: number; n: number; at: number; hold: number; kind: string; ref: string; board?: {name: string; ups: Upd[]; dur: number}; captions: {at: number; text: string}[]};
type Night = {ch: number; start: number; end: number; ups: Upd[]};
const S = STRIP as unknown as {frames: Frame[]; nights: Night[]};
const FRAMES = S.frames;

// the strip, in its own units (the camera scales it)
const FW = 1140; // frame window, 3:2
const FH = 760;
const DIV = 60; // black bar between frames
const PITCH = FW + DIV;
const BORDER = 150; // film edge above and below: print, perforations, margin
const SH = FH + 2 * BORDER;
const HOLES = 8; // perforations per frame
const Z0 = 0.8; // resting zoom: the strip with paper above and below
const ZB = (W / FW) * 0.95; // leaning in on a chart so it fills the screen
const EDGE = '#E2702A'; // edge-print orange, as on the reference film

/* ------------------------------------------------------------------ strip position and zoom over time */
type Move = {t0: number; d: number; a: {s: number; z: number}; b: {s: number; z: number}};
const SLIDE = 0.9; // seconds per frame advance
const plan: Move[] = (() => {
  const out: Move[] = [];
  const zOf = (f: Frame) => (f.kind === 'board' ? ZB : Z0);
  FRAMES.forEach((f, i) => {
    const target = {s: i, z: zOf(f)};
    if (!out.length) {
      out.push({t0: -1, d: 0.01, a: target, b: target});
      return;
    }
    const prev = out[out.length - 1];
    const t0 = Math.max(f.at - 0.4, prev.t0 + 0.25);
    const a = evalMove(prev, t0);
    out.push({t0, d: SLIDE, a, b: target});
  });
  return out;
})();
function evalMove(m: Move, t: number) {
  const u = Math.min(1, Math.max(0, (t - m.t0) / m.d));
  const e = inOut(u);
  const hold = Math.max(0, t - (m.t0 + m.d));
  return {s: m.a.s + (m.b.s - m.a.s) * e, z: (m.a.z + (m.b.z - m.a.z) * e) * (1 + 0.02 * Math.min(1, hold / 8))};
}
const stripAt = (t: number) => {
  let lo = 0;
  let hi = plan.length - 1;
  if (!plan.length) return {s: 0, z: Z0};
  if (t < plan[0].t0) return plan[0].b;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (plan[mid].t0 <= t) lo = mid;
    else hi = mid - 1;
  }
  return evalMove(plan[lo], t);
};

/* ------------------------------------------------------------------ what's inside a frame */
const fitBox = (aw: number, ah: number, mw: number, mh: number) => {
  const r = aw / ah;
  const w = Math.min(mw, mh * r);
  return [w, w / r];
};
const FrameContent: React.FC<{fm: Frame; f: number}> = ({fm, f}) => {
  const at = fr(fm.at);
  const a = asset(fm.ref);
  const live = Math.max(0, f - at);
  if (fm.kind === 'board' && fm.board) {
    const Comp = BOARDS[fm.board.name];
    if (!Comp) return null;
    const k = FW / W;
    return (
      <div style={{position: 'absolute', left: 0, top: (FH - H * k) / 2, width: W, height: H, transformOrigin: '0 0', transform: `scale(${k})`}}>
        <Comp f={f - at} ups={fm.board.ups} dur={fm.board.dur} docked={0} />
      </div>
    );
  }
  if (fm.kind === 'p') {
    // a slow push-in while it's being talked about
    const k = Math.min(1, live / (fr(fm.hold) + 24));
    const dir = random(`kb${fm.n}`) > 0.5 ? 1 : -1;
    return (
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        {a ? (
          <Img src={staticFile(a.src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * k}) translateX(${dir * 10 * k}px)`, filter: 'contrast(1.03) saturate(0.95)'}} />
        ) : null}
      </div>
    );
  }
  if (!a) return null;
  if (fm.kind === 'l') {
    return (
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Logo id={fm.ref} w={600} h={340} />
      </div>
    );
  }
  const [w, h] = fitBox(a.w, a.h, FW - 220, FH - 150);
  const float = Math.sin(live / 40 + fm.n) * 4;
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `translateY(${float}px)`, filter: 'drop-shadow(6px 12px 16px rgba(29,27,24,0.28))'}}>
        {fm.kind === 'h' ? <Person id={fm.ref} w={w} h={h} /> : <Cutout id={fm.ref} w={w} h={h} />}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ one frame of film */
const Perfs: React.FC<{y: number}> = ({y}) => (
  <>
    {Array.from({length: HOLES}, (_, i) => (
      <div key={i} style={{position: 'absolute', left: (PITCH / HOLES) * i + (PITCH / HOLES - 62) / 2, top: y, width: 62, height: 84, borderRadius: 12, background: C.paper, boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.35)'}} />
    ))}
  </>
);
const Cell: React.FC<{fm: Frame; f: number}> = ({fm, f}) => {
  const a = asset(fm.ref);
  const credit = fm.kind === 'board' || fm.kind === 'l' ? '' : a?.credit ?? '';
  const caps = fm.captions.filter((c) => f >= fr(c.at) - 6);
  const capO = caps.length ? e01(f, fr(caps[caps.length - 1].at) - 6, 10) : 0;
  return (
    <div style={{position: 'absolute', left: (fm.n - 1) * PITCH, top: 0, width: PITCH, height: SH, background: '#111012'}}>
      {/* edge print: frame number and credit along the top, the frame's tag along the bottom */}
      <div style={{position: 'absolute', left: DIV / 2 + 14, top: 4, fontFamily: F.mono, fontWeight: 500, fontSize: 30, color: EDGE, letterSpacing: '0.04em'}}>{fm.n}</div>
      {credit && (
        <div style={{position: 'absolute', right: DIV / 2 + 14, top: 10, maxWidth: FW - 140, fontFamily: F.mono, fontSize: 19, color: 'rgba(226,112,42,0.55)', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{credit}</div>
      )}
      <Perfs y={44} />
      <Perfs y={SH - 44 - 84} />
      <div style={{position: 'absolute', left: DIV / 2, top: BORDER, width: FW, height: FH, overflow: 'hidden', background: 'rgba(242,238,230,0.96)', boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.5)'}}>
        <FrameContent fm={fm} f={f} />
      </div>
      <div style={{position: 'absolute', left: DIV / 2 + 14, bottom: 6, display: 'flex', alignItems: 'baseline', gap: 30, width: FW - 28, whiteSpace: 'nowrap', overflow: 'hidden'}}>
        <span style={{fontFamily: F.mono, fontWeight: 500, fontSize: 26, color: EDGE}}>▷{fm.n}A</span>
        {caps.length > 0 && (
          <span style={{fontFamily: F.mono, fontWeight: 600, fontSize: 30, color: EDGE, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: capO, overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {caps.map((c) => c.text).join('  ·  ')}
          </span>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ full-screen moments */
const NightStage: React.FC<{n: Night; f: number}> = ({n, f}) => {
  const at = fr(n.start);
  const end = fr(n.end);
  const o = Math.min(1, (f - at) / 3) * (1 - Math.min(1, Math.max(0, (f - end) / 10)));
  if (o <= 0) return null;
  const Chat = BOARDS.chat;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: C.night}} />
      <Chat f={f - at} ups={n.ups} dur={end - at} docked={0} />
    </AbsoluteFill>
  );
};
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

export const HCStrip: React.FC<{offset?: number}> = ({offset = 0}) => {
  const f = useCurrentFrame() + offset;
  const t = f / FPS;
  const ci = chapterAt(t);
  const ch = T.chapters[ci];
  const {s, z} = stripAt(t);
  const i0 = Math.floor(s);
  const near = FRAMES.slice(Math.max(0, i0 - 2), i0 + 4);
  const [br, sat] = GRADE[ci];
  const cardOn = ci > 0 && t < ch.vo + 0.1;
  const lastLine = T.lines.filter((l) => l.ch === 0).pop()!;
  const titleOn = ci === 0 && t > lastLine.end + 0.45;
  // the strip's centre frame sits in the middle of the screen
  const cx = s * PITCH + PITCH / 2;
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden', color: C.ink, filter: `brightness(${br}) saturate(${sat})`}}>
      <AbsoluteFill style={{transformOrigin: '50% 50%', transform: `scale(${z / Z0})`}}>
        <AbsoluteFill style={{backgroundImage: `url(${staticFile('dc/paper_tile.jpg')})`, backgroundSize: '3840px 2160px', backgroundPosition: 'center'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${W / 2}px,${H / 2}px) scale(${z}) translate(${-cx}px,${-SH / 2}px)`}}>
        <div style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 18px 30px rgba(29,27,24,0.35))'}}>
          {near.map((fm) => (
            <Cell key={fm.n} fm={fm} f={f} />
          ))}
        </div>
      </AbsoluteFill>
      {S.nights.map((n, i) => (t >= n.start - 0.1 && t <= n.end + 1 ? <NightStage key={i} n={n} f={f} /> : null))}
      {cardOn && <AbsoluteFill style={{background: C.paper, opacity: 1 - e01(f - fr(ch.start), fr(ch.vo + 0.1 - ch.start) - 14, 14)}} />}
      {cardOn && <ChapterCard f={f - fr(ch.start)} n={ci} title={ch.title} dur={fr(ch.vo + 0.1 - ch.start)} />}
      {titleOn && <TitleCard f={f - fr(lastLine.end + 0.45)} />}
      <Lens />
    </AbsoluteFill>
  );
};

/** One chapter, for rendering the film in parts on Lambda (picture only; audio is muxed after). */
export const HCStripPart: React.FC<{part: number}> = ({part}) => <HCStrip offset={HC_CHAPTERS[part].from} />;
