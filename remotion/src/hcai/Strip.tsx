import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import TIMING from './timing.json';
import STRIP from './strip.json';
import './fonts';
import {C, F, FPS, GRADE, H, W} from './design';
import {asset, Cutout, Kicker, Logo, Person, e01, inOut, settle} from './kit';
import {BOARDS, ChapterCard, TitleCard, Upd} from './specials';
import {fr, HC_CHAPTERS} from './Film';

/*
 * "The Hidden Cost of AI", calm edition. One visual per idea (scripts/hcai_strip.py picks them), shown four ways:
 * - strip: runs of real photos sit in the frames of a 35mm film strip that slides one frame per idea, with places,
 *   numbers and credits printed on the film's edge;
 * - board: charts, maps, the bill and the chain as full-screen motion graphics;
 * - type: key lines and numbers as kinetic typography (words rise in one by one, numbers count up);
 * - object: a single object, person or logo on the paper.
 * Scenes change with a short dissolve; the late-night chat screens and chapter cards stay full-screen.
 */
type Chap = {title: string; key: string; start: number; card: number; vo: number; end: number};
const T = TIMING as unknown as {duration: number; chapters: Chap[]; lines: {ch: number; i: number; start: number; end: number}[]};
type Frame = {ch: number; n: number; at: number; hold: number; kind: string; mode: string; ref: string; board?: {name: string; ups: Upd[]; dur: number}; captions: {at: number; text: string}[]};
type Night = {ch: number; start: number; end: number; ups: Upd[]};
const S = STRIP as unknown as {frames: Frame[]; nights: Night[]};
const FRAMES = S.frames;
const LEADIN = 0.35; // a scene starts changing a little before its word
const OUT = 0.4; // dissolve out of the previous scene
const ts = (f: Frame) => f.at - LEADIN;
const TAG_TOP = new Set(['eiffel', 'icons']);

/* ------------------------------------------------------------------ film strip: geometry and runs */
const FW = 1140; // frame window, 3:2
const FH = 760;
const DIV = 60;
const PITCH = FW + DIV;
const BORDER = 150;
const SH = FH + 2 * BORDER;
const HOLES = 8;
const Z0 = 0.8;
const EDGE = '#E2702A';
const SLIDE = 0.9;
// strip index of each photo frame, and the run (consecutive photo scenes in a chapter) it belongs to
const SI: Record<number, number> = {};
const RUN: Record<number, number> = {};
{
  let si = 0;
  let run = -1;
  FRAMES.forEach((f, i) => {
    if (f.mode !== 'strip') return;
    const prev = FRAMES[i - 1];
    if (!prev || prev.mode !== 'strip' || prev.ch !== f.ch) run++;
    SI[i] = si++;
    RUN[i] = run;
  });
}
type Move = {t0: number; d: number; a: number; b: number};
// the strip's position over time: each run slides in from the right, then one frame per idea
const plan: Move[] = [];
FRAMES.forEach((f, i) => {
  if (f.mode !== 'strip') return;
  const prev = plan[plan.length - 1];
  const first = !FRAMES[i - 1] || RUN[i - 1] !== RUN[i];
  const t0 = first || !prev ? ts(f) : Math.max(f.at - 0.4, prev.t0 + 0.25);
  const a = first || !prev ? SI[i] - 1.1 : posOf(prev, t0);
  plan.push({t0, d: SLIDE, a, b: SI[i]});
});
function posOf(m: Move, t: number) {
  return m.a + (m.b - m.a) * inOut(Math.min(1, Math.max(0, (t - m.t0) / m.d)));
}
const stripPos = (t: number) => {
  let m = plan[0];
  for (const p of plan) if (p.t0 <= t) m = p;
  return m ? posOf(m, t) : 0;
};

const Perfs: React.FC<{y: number}> = ({y}) => (
  <>
    {Array.from({length: HOLES}, (_, i) => (
      <div key={i} style={{position: 'absolute', left: (PITCH / HOLES) * i + (PITCH / HOLES - 62) / 2, top: y, width: 62, height: 84, borderRadius: 12, background: C.paper, boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.35)'}} />
    ))}
  </>
);
/** One frame of film at strip index si; empty (clear film) unless a photo of the current run sits in it. */
const Cell: React.FC<{si: number; fm?: Frame; f: number}> = ({si, fm, f}) => {
  const a = fm ? asset(fm.ref) : undefined;
  const caps = fm ? fm.captions.filter((c) => f >= fr(c.at) - 6) : [];
  const capO = caps.length ? e01(f, fr(caps[caps.length - 1].at) - 6, 10) : 0;
  const live = fm ? Math.max(0, f - fr(fm.at)) : 0;
  const k = fm ? Math.min(1, live / (fr(fm.hold) + 24)) : 0;
  const dir = random(`kb${si}`) > 0.5 ? 1 : -1;
  return (
    <div style={{position: 'absolute', left: si * PITCH, top: 0, width: PITCH, height: SH, background: '#111012'}}>
      <div style={{position: 'absolute', left: DIV / 2 + 14, top: 4, fontFamily: F.mono, fontWeight: 500, fontSize: 30, color: EDGE, letterSpacing: '0.04em'}}>{si + 1}</div>
      {a?.credit && (
        <div style={{position: 'absolute', right: DIV / 2 + 14, top: 10, maxWidth: FW - 140, fontFamily: F.mono, fontSize: 19, color: 'rgba(226,112,42,0.55)', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{a.credit}</div>
      )}
      <Perfs y={44} />
      <Perfs y={SH - 44 - 84} />
      <div style={{position: 'absolute', left: DIV / 2, top: BORDER, width: FW, height: FH, overflow: 'hidden', background: 'rgba(242,238,230,0.96)', boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.5)'}}>
        {a && <Img src={staticFile(a.src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * k}) translateX(${dir * 10 * k}px)`, filter: 'contrast(1.03) saturate(0.95)'}} />}
      </div>
      <div style={{position: 'absolute', left: DIV / 2 + 14, bottom: 6, display: 'flex', alignItems: 'baseline', gap: 30, width: FW - 28, whiteSpace: 'nowrap', overflow: 'hidden'}}>
        <span style={{fontFamily: F.mono, fontWeight: 500, fontSize: 26, color: EDGE}}>▷{si + 1}A</span>
        {caps.length > 0 && (
          <span style={{fontFamily: F.mono, fontWeight: 600, fontSize: 30, color: EDGE, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: capO, overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {caps.map((c) => c.text).join('  ·  ')}
          </span>
        )}
      </div>
    </div>
  );
};
const StripScene: React.FC<{run: number; f: number; t: number}> = ({run, f, t}) => {
  const s = stripPos(t);
  const idx = Object.keys(RUN).map(Number).filter((i) => RUN[i] === run);
  const byIdx: Record<number, Frame> = {};
  for (const i of idx) byIdx[SI[i]] = FRAMES[i];
  const s0 = Math.floor(s);
  const cx = s * PITCH + PITCH / 2;
  return (
    <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${W / 2}px,${H / 2}px) scale(${Z0}) translate(${-cx}px,${-SH / 2}px)`}}>
      <div style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 18px 30px rgba(29,27,24,0.35))'}}>
        {[s0 - 2, s0 - 1, s0, s0 + 1, s0 + 2, s0 + 3].map((si) => (
          <Cell key={si} si={si} fm={byIdx[si]} f={f} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ typography */
const typeSize = (n: number) => (n <= 10 ? 210 : n <= 18 ? 160 : n <= 30 ? 124 : 100);
const NUM = /^([^\d]*)([\d,]*\.?\d+)(.*)$/;
const Count: React.FC<{text: string; f: number}> = ({text, f}) => {
  const m = text.match(NUM);
  const val = m ? parseFloat(m[2].replace(/,/g, '')) : NaN;
  const year = m && /^(19|20)\d\d$/.test(m[2]);
  if (!m || isNaN(val) || val < 10 || year) return <>{text}</>;
  const k = settle(f / 30);
  const decimals = (m[2].split('.')[1] ?? '').length;
  const v = val * k;
  const shown = m[2].includes(',') ? Math.round(v).toLocaleString('en-US') : v.toFixed(decimals);
  return (
    <>
      {m[1]}
      {shown}
      {m[3]}
    </>
  );
};
const TypeScene: React.FC<{fm: Frame; f: number}> = ({fm, f}) => {
  const lf = f - fr(fm.at) + 6;
  const plain = fm.ref.replace(/\*/g, '');
  const num = fm.kind === 'n';
  const size = num ? Math.min(260, typeSize(plain.length) * 1.2, 1500 / (0.56 * plain.length)) : typeSize(plain.length); // a long number line stays inside the frame
  // words with their accent (an *accent* can span several words)
  const words: {w: string; hot: boolean}[] = [];
  let hot = false;
  for (const raw of fm.ref.split(/\s+/)) {
    let w = '';
    let wordHot = hot;
    for (const ch of raw) {
      if (ch === '*') {
        hot = !hot;
        wordHot = wordHot || hot;
      } else w += ch;
    }
    if (w) words.push({w, hot: wordHot});
  }
  const drift = 1 + 0.03 * Math.min(1, Math.max(0, lf) / (fr(fm.hold) + 24));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${drift})`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {num ? (
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: size, color: C.hum, letterSpacing: '-0.02em', lineHeight: 1, opacity: e01(lf, 0, 8), transform: `translateY(${(1 - settle(lf / 14)) * 50}px)`, fontVariantNumeric: 'tabular-nums', maxWidth: 1560, textAlign: 'center'}}>
          <Count text={plain} f={lf} />
        </div>
      ) : (
        <div style={{maxWidth: 1560, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: size, lineHeight: 1.04, color: C.ink, letterSpacing: '-0.01em'}}>
          {words.map(({w, hot: accent}, i) => {
            const k = settle((lf - i * 3) / 12);
            return (
              <span key={i} style={{display: 'inline-block', marginRight: '0.24em', color: accent ? C.hum : undefined, opacity: e01(lf - i * 3, 0, 8), transform: `translateY(${(1 - k) * 46}px) scale(${accent ? 1 + 0.12 * (1 - k) : 1})`}}>
                {w}
              </span>
            );
          })}
        </div>
      )}
      {/* a short rule drawn under the line once it's all in */}
      <div style={{width: 220, height: 8, marginTop: num ? 34 : 44, background: C.hum, transformOrigin: '0 50%', transform: `scaleX(${settle((lf - 8 - words.length * 3) / 14)})`}} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ objects and charts */
const ObjectScene: React.FC<{fm: Frame; f: number}> = ({fm, f}) => {
  const a = asset(fm.ref);
  if (!a) return null;
  const lf = f - fr(fm.at) + 6;
  const k = settle(lf / 14);
  const float = Math.sin(lf / 40 + fm.n) * 5;
  const drift = 1 + 0.03 * Math.min(1, Math.max(0, lf) / (fr(fm.hold) + 24));
  const r = a.w / a.h;
  const w = Math.min(980, 680 * r);
  const h = w / r;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{opacity: e01(lf, 0, 8), transform: `translateY(${(1 - k) * 40 + float}px) scale(${(0.92 + 0.08 * k) * drift})`, filter: 'drop-shadow(8px 16px 22px rgba(29,27,24,0.3))'}}>
        {fm.kind === 'h' ? <Person id={fm.ref} w={Math.min(w, 620)} h={Math.min(w, 620) / r} /> : fm.kind === 'l' ? <Logo id={fm.ref} w={640} h={360} /> : <Cutout id={fm.ref} w={w} h={h} />}
      </div>
    </AbsoluteFill>
  );
};
const BoardScene: React.FC<{fm: Frame; f: number}> = ({fm, f}) => {
  if (!fm.board) return null;
  const Comp = BOARDS[fm.board.name];
  if (!Comp) return null;
  const at = fr(fm.at);
  const drift = 1 + 0.025 * Math.min(1, Math.max(0, f - at) / (fr(fm.hold) + 24));
  return (
    <AbsoluteFill style={{transform: `scale(${drift})`}}>
      <Comp f={f - at} ups={fm.board.ups} dur={fm.board.dur} docked={0} />
    </AbsoluteFill>
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
const sceneAt = (t: number) => {
  let k = -1;
  for (let i = 0; i < FRAMES.length && ts(FRAMES[i]) <= t; i++) k = i;
  return k;
};
const Scene: React.FC<{i: number; f: number; t: number}> = ({i, f, t}) => {
  const fm = FRAMES[i];
  if (fm.mode === 'strip') return <StripScene run={RUN[i]} f={f} t={t} />;
  if (fm.mode === 'board') return <BoardScene fm={fm} f={f} />;
  if (fm.mode === 'type') return <TypeScene fm={fm} f={f} />;
  return <ObjectScene fm={fm} f={f} />;
};

export const HCStrip: React.FC<{offset?: number}> = ({offset = 0}) => {
  const f = useCurrentFrame() + offset;
  const t = f / FPS;
  const ci = chapterAt(t);
  const ch = T.chapters[ci];
  const k = sceneAt(t);
  const cur = k >= 0 ? FRAMES[k] : undefined;
  const prev = k > 0 ? FRAMES[k - 1] : undefined;
  // the previous scene dissolves out, unless the strip just slid on within the same run
  const sameRun = cur && prev && cur.mode === 'strip' && prev.mode === 'strip' && RUN[k] === RUN[k - 1];
  const outK = cur && prev && !sameRun && prev.ch === cur.ch ? Math.min(1, (t - ts(cur)) / OUT) : 1;
  const inK = cur ? Math.min(1, (t - ts(cur)) / OUT) : 0;
  const stripIn = cur?.mode === 'strip' && !sameRun ? inK : 1;
  const [br, sat] = GRADE[ci];
  const cardOn = ci > 0 && t < ch.vo + 0.1;
  const lastLine = T.lines.filter((l) => l.ch === 0).pop()!;
  const titleOn = ci === 0 && t > lastLine.end + 0.45;
  const kick = cur && cur.mode !== 'strip' ? cur.captions[0] : undefined;
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden', color: C.ink, filter: `brightness(${br}) saturate(${sat})`}}>
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('dc/paper_tile.jpg')})`, backgroundSize: '3840px 2160px', backgroundPosition: 'center'}} />
      {prev && outK < 1 && (
        <AbsoluteFill style={{opacity: 1 - outK, transform: `scale(${1 + 0.03 * outK})`, filter: outK > 0 ? `blur(${outK * 8}px)` : undefined}}>
          <Scene i={k - 1} f={f} t={t} />
        </AbsoluteFill>
      )}
      {cur && (
        <AbsoluteFill style={{opacity: cur.mode === 'strip' ? stripIn : 1}}>
          <Scene i={k} f={f} t={t} />
        </AbsoluteFill>
      )}
      {kick && (
        // charts with their own caption along the bottom get the tag at the top instead
        <AbsoluteFill style={{transform: cur!.board && TAG_TOP.has(cur!.board.name) ? `translateY(${-(H - 46 * 2 - 52)}px)` : undefined}}>
          <Kicker text={kick.text} o={e01(f, fr(Math.max(kick.at, cur!.at)), 10) * (1 - e01(f, fr(cur!.at + cur!.hold) - 10, 8))} />
        </AbsoluteFill>
      )}
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
