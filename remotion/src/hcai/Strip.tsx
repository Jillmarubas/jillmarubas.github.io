import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import TIMING from './timing.json';
import STRIP from './strip.json';
import './fonts';
import {C, F, FPS, GRADE, H, W} from './design';
import {asset, Cutout, Kicker, Logo, Person, e01, inOut, settle} from './kit';
import {BOARDS, ChapterCard, TitleCard, Upd} from './specials';
import {fr, HC_CHAPTERS} from './Film';
import {ANIMS} from './anim';

/*
 * "The Hidden Cost of AI", calm edition. One visual per idea (scripts/hcai_strip.py picks them), shown four ways:
 * - strip: real photos, full frame; within a run each one pulls up like the next frame of film, with places,
 *   numbers and credits printed along the bottom edge;
 * - board: charts, maps, the bill and the chain as full-screen motion graphics;
 * - type: key lines and numbers as kinetic typography (words rise in one by one, numbers count up);
 * - object: a single object, person or logo on the paper;
 * - anim / anim3d / image: scenes rebuilt from review notes as 2D or 3D animations (src/hcai/anim, src/hcai/edits.json).
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
// scenes drawn as their own 2D or 3D animation (src/hcai/anim): saturated, so the chapter grade leaves them alone
const ANIMATED = new Set(['anim', 'anim3d', 'image']);

/* ------------------------------------------------------------------ photos: full frame, advancing like film */
// a run is consecutive photo scenes in a chapter; within a run each new photo pulls up into the gate like the next
// frame of film (a black frame line between them), the first one of a run dissolves in
const RUN: Record<number, number> = {};
{
  let run = -1;
  FRAMES.forEach((f, i) => {
    if (f.mode !== 'strip') return;
    const prev = FRAMES[i - 1];
    if (!prev || prev.mode !== 'strip' || prev.ch !== f.ch) run++;
    RUN[i] = run;
  });
}
const PULL = 0.55; // seconds for one frame to pull through
const LINE = 34; // the frame line between two photos
const EDGE = '#F08A3C';
const FullPhoto: React.FC<{fm: Frame; i: number; f: number}> = ({fm, i, f}) => {
  const a = asset(fm.ref);
  const caps = fm.captions.filter((c) => f >= fr(c.at) - 6);
  const capO = caps.length ? e01(f, fr(caps[caps.length - 1].at) - 6, 10) : 0;
  const live = Math.max(0, f - fr(fm.at) + fr(LEADIN));
  const k = Math.min(1, live / (fr(fm.hold) + 24));
  const dir = random(`kb${fm.n}`) > 0.5 ? 1 : -1;
  return (
    <AbsoluteFill style={{background: '#0E0D0F', overflow: 'hidden'}}>
      {a && <Img src={staticFile(a.src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + 0.08 * k}) translateX(${dir * 24 * k}px)`, filter: 'contrast(1.04) saturate(1.05)'}} />}
      <AbsoluteFill style={{background: 'linear-gradient(transparent 72%, rgba(10,9,8,0.62))'}} />
      <div style={{position: 'absolute', left: 56, right: 56, bottom: 40, display: 'flex', alignItems: 'baseline', gap: 30, whiteSpace: 'nowrap', overflow: 'hidden'}}>
        <span style={{fontFamily: F.mono, fontWeight: 500, fontSize: 26, color: EDGE}}>▷{i + 1}A</span>
        {caps.length > 0 && (
          <span style={{fontFamily: F.mono, fontWeight: 600, fontSize: 34, color: '#FFF4E8', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: capO, overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {caps.map((c) => c.text).join('  ·  ')}
          </span>
        )}
        {a?.credit && <span style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 18, color: 'rgba(255,244,232,0.6)'}}>{a.credit}</span>}
      </div>
    </AbsoluteFill>
  );
};
const StripScene: React.FC<{run: number; f: number; t: number}> = ({run, f, t}) => {
  const idx = Object.keys(RUN).map(Number).filter((i) => RUN[i] === run).sort((a, b) => a - b);
  let c = idx[0];
  for (const i of idx) if (ts(FRAMES[i]) <= t) c = i;
  const pos = idx.indexOf(c);
  const p = pos > 0 ? inOut(Math.min(1, Math.max(0, (t - ts(FRAMES[c])) / PULL))) : 1;
  const shift = (H + LINE) * p;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {pos > 0 && p < 1 && (
        <AbsoluteFill style={{transform: `translateY(${-shift}px)`}}>
          <FullPhoto fm={FRAMES[idx[pos - 1]]} i={idx[pos - 1]} f={f} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{transform: `translateY(${H + LINE - shift}px)`}}>
        <FullPhoto fm={FRAMES[c]} i={c} f={f} />
      </AbsoluteFill>
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
  if (ANIMATED.has(fm.mode)) {
    const A = ANIMS[fm.ref];
    return A ? <A f={f - fr(fm.at)} t0={fm.at} dur={fr(fm.hold)} /> : null;
  }
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
  const kick = cur && cur.mode !== 'strip' && !ANIMATED.has(cur.mode) ? cur.captions[0] : undefined;
  const grade = `brightness(${br}) saturate(${sat})`;
  const gradeOf = (fm?: Frame) => (fm && ANIMATED.has(fm.mode) ? undefined : grade);
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden', color: C.ink}}>
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('dc/paper_tile.jpg')})`, backgroundSize: '3840px 2160px', backgroundPosition: 'center', filter: grade}} />
      {prev && outK < 1 && (
        <AbsoluteFill style={{opacity: 1 - outK, transform: `scale(${1 + 0.03 * outK})`, filter: [gradeOf(prev), outK > 0 ? `blur(${outK * 8}px)` : ''].filter(Boolean).join(' ') || undefined}}>
          <Scene i={k - 1} f={f} t={t} />
        </AbsoluteFill>
      )}
      {cur && (
        <AbsoluteFill style={{opacity: cur.mode === 'strip' ? stripIn : 1, filter: gradeOf(cur)}}>
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
