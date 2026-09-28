import React from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';
import {BLUR_IN, C, DUR, F, FPS, R, RISE, STAGGER, WORD_FLOOR, depart, glide, settle} from '../theme';
import {Phrase, Section, Word} from '../timeline';

export type Mode = 'stage' | 'split' | 'photo';

// Settle Motion's "scroll is the playhead", with the voice as the playhead: a phrase lands
// with every word at word-floor, and each word brightens the moment Joey says it.
const LEAD = 2; // frames a word brightens before it is heard, so the eye lands with the ear
const PRE = 6; // frames a phrase is on screen, at floor, before its first word is spoken
const EXIT = 8; // depart runs one step shorter than the entrance

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ramp = (x: number, a: number, b: number, easing = settle) => interpolate(x, [a, b], [0, 1], {...clamp, easing});

// ---- counted numbers: the counter tick -------------------------------------------------
const COUNT = /^(["“]?)(\$?)(\d[\d,]*\.?\d*)(%|¢|M| GW| minutes| hours| countries)?([.,:;?!"”]*)$/;
export const isCountable = (t: string) => {
  const m = t.match(COUNT);
  if (!m) return false;
  return Boolean(m[2] || m[4] || m[3].includes(','));
};

// One digit column: a strip 0–9 that rolls to its digit on `glide`.
const DigitColumn: React.FC<{d: number; p: number}> = ({d, p}) => (
  <span style={{position: 'relative', display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', height: '1.1em', marginTop: '-0.05em'}}>
    <span style={{visibility: 'hidden', display: 'inline-block', paddingTop: '0.05em'}}>{d}</span>
    <span style={{position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', transform: `translateY(${-d * p * 1.1}em)`}}>
      {Array.from({length: 10}, (_, k) => (
        <span key={k} style={{height: '1.1em', lineHeight: '1.1em', display: 'block', paddingTop: '0.0em'}}>
          {k}
        </span>
      ))}
    </span>
  </span>
);

// Only the digits roll, each column on its own strip, right to left, 1 frame (30 ms) apart.
export const RollingNumber: React.FC<{text: string; local: number; dur?: number}> = ({text, local, dur = DUR.base}) => {
  const chars = [...text];
  const digitIdx = chars.map((c, i) => (/\d/.test(c) ? i : -1)).filter((i) => i >= 0);
  return (
    <span style={{whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i}>{c}</span>;
        const fromRight = digitIdx.length - 1 - digitIdx.indexOf(i);
        const p = ramp(local, fromRight, fromRight + dur, glide);
        return <DigitColumn key={i} d={Number(c)} p={p} />;
      })}
    </span>
  );
};

// The active marker: a mint rule that draws under a word on `glide` once it is said.
const Marker: React.FC<{local: number; color?: string}> = ({local, color = C.mint}) => {
  const p = ramp(local, 2, 2 + DUR.base, glide);
  return (
    <span
      style={{
        position: 'absolute',
        left: '0.02em',
        right: '0.3em',
        bottom: '-0.04em',
        height: '0.055em',
        minHeight: 3,
        background: color,
        transformOrigin: '0% 50%',
        transform: `scaleX(${p})`,
        borderRadius: 2,
      }}
    />
  );
};

type WordProps = {w: Word; spoken: number; arrive: number; color: string; marker: boolean; markerColor?: string};

// A word: it arrives with its phrase (rise + blur-in, 60 ms stagger), sits at word-floor,
// then brightens on `glide` when spoken. Numbers roll; the first key word gets the marker.
const WordView: React.FC<WordProps> = ({w, spoken, arrive, color, marker, markerColor}) => {
  const a = ramp(arrive, 0, DUR.slow);
  const lit = ramp(spoken, 0, 5, glide);
  const count = w.n && isCountable(w.t);
  const m = count ? w.t.match(COUNT) : null;
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'top',
        whiteSpace: 'nowrap',
        marginRight: '0.24em',
        fontWeight: w.k || w.n ? 600 : 500,
        color,
        // a counted number is never shown before it is said: it appears as it starts to roll
        opacity: a * (count ? lit : WORD_FLOOR + (1 - WORD_FLOOR) * lit),
        transform: `translateY(${(1 - a) * RISE.sm}px)`,
        filter: a < 1 ? `blur(${(1 - a) * BLUR_IN}px)` : undefined,
      }}
    >
      {m ? (
        <>
          {m[1]}
          {m[2]}
          <RollingNumber text={m[3]} local={spoken} />
          {m[4]}
          {m[5]}
        </>
      ) : (
        w.t
      )}
      {marker && spoken >= 0 ? <Marker local={spoken} color={markerColor} /> : null}
    </span>
  );
};

// ---- the transcript: Settle's scroll, with the voice as the playhead ------------------------------
// Consecutive phrases in the same layout are one column, laid out by the browser so lines can
// never collide. The column glides up (glide, 11 f) to bring each phrase to the reading line as
// it arrives; the phrase just read dims above it, and the one before that leaves.
const SIZES: Record<Mode, number> = {stage: 112, split: 78, photo: 86};
const READ = 0.16; // a phrase already read, above the reading line

type Run = {mode: Mode; ks: number[]};
const runsOf = (s: Section, modeOf: (k: number) => Mode): Run[] => {
  const runs: Run[] = [];
  s.phrases.forEach((p, k) => {
    if (p.quote) return;
    const mode = modeOf(k);
    const last = runs[runs.length - 1];
    if (last && last.mode === mode && last.ks[last.ks.length - 1] === k - 1) last.ks.push(k);
    else runs.push({mode, ks: [k]});
  });
  return runs;
};

const inOf = (p: Phrase) => Math.round(p.s * FPS) - LEAD - PRE;

const Transcript: React.FC<{s: Section; run: Run; next?: Phrase; frame: number}> = ({s, run, next, frame}) => {
  const {mode, ks} = run;
  const size = SIZES[mode];
  const refs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [box, setBox] = React.useState<{o: number; h: number}[] | null>(null);
  const [handle] = React.useState(() => delayRender(`measure ${s.id} run ${ks[0]}`));
  React.useLayoutEffect(() => {
    // measure once the fonts are in, so the line breaks are the real ones
    document.fonts.ready.then(() => {
      setBox(refs.current.map((el) => ({o: el?.offsetTop ?? 0, h: el?.offsetHeight ?? 0})));
      continueRender(handle);
    });
  }, [handle]);

  const last = s.phrases[ks[ks.length - 1]];
  const holdEnd = next ? inOf(next) - 4 : Math.round(s.duration * FPS) + 6;
  let exitAt = Math.max(Math.round(last.e * FPS) + 4, Math.min(holdEnd, Math.round(last.e * FPS) + Math.round(2.4 * FPS)));
  // when the next column arrives straight after (no pause in the voice), this one must be gone by
  // then: two columns share the reading line. Its last word still gets to light up first.
  if (next) {
    const lastLit = Math.round(s.words[last.b].s * FPS) - LEAD + 4;
    exitAt = Math.min(exitAt, Math.max(lastLit, inOf(next) - EXIT + 2));
  }
  const firstIn = inOf(s.phrases[ks[0]]);
  // stays mounted (hidden) outside its window, so there is always a layout to measure
  const active = frame >= firstIn - 1 && frame <= exitAt + EXIT;

  // where the column sits: phrase k's centre on y = 540 (bottom on y = 930 over photos)
  const target = (j: number) => {
    if (!box) return 0;
    const {o, h} = box[j];
    return mode === 'photo' ? o + h - 930 : o + h / 2 - 540;
  };
  let scroll = target(0);
  ks.forEach((k, j) => {
    if (j > 0) scroll += ramp(frame, inOf(s.phrases[k]), inOf(s.phrases[k]) + DUR.base, glide) * (target(j) - target(j - 1));
  });
  const x = ramp(frame, exitAt, exitAt + EXIT, depart);
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        ...(mode === 'stage' && {left: 140, width: 1600}),
        ...(mode === 'split' && {left: 120, width: 860}),
        ...(mode === 'photo' && {left: 120, width: 1400}),
        transform: `translateY(${-scroll - x * RISE.nudge}px)`,
        opacity: 1 - x,
        visibility: active ? 'visible' : 'hidden',
        filter: x > 0 && active ? `blur(${x * BLUR_IN}px)` : undefined,
        fontFamily: F.sans,
        fontSize: size,
        lineHeight: 1.0,
        letterSpacing: '-0.04em',
        color: C.onNight,
      }}
    >
      {ks.map((k, j) => {
        const p = s.phrases[k];
        const inAt = inOf(p);
        const nextIn = j + 1 < ks.length ? inOf(s.phrases[ks[j + 1]]) : Infinity;
        const next2In = j + 2 < ks.length ? inOf(s.phrases[ks[j + 2]]) : Infinity;
        const dim = nextIn === Infinity ? 0 : ramp(frame, nextIn, nextIn + DUR.base, glide);
        const gone = next2In === Infinity ? 0 : ramp(frame, next2In, next2In + EXIT, depart);
        const words = s.words.slice(p.a, p.b + 1);
        const firstKey = words.findIndex((w) => w.n || w.k);
        const visible = frame >= inAt - 1 && gone < 1;
        return (
          <div
            key={k}
            ref={(el) => {
              refs.current[j] = el;
            }}
            style={{paddingBottom: '0.22em', opacity: visible ? (1 - (1 - READ) * dim) * (1 - gone) : 0}}
          >
            {words.map((w, i) => {
              const spoken = frame - (Math.round(w.s * FPS) - LEAD);
              const arrive = frame - inAt - i * STAGGER.word;
              return <WordView key={i} w={w} spoken={spoken} arrive={arrive} color={C.onNight} marker={i === firstKey} />;
            })}
          </div>
        );
      })}
    </div>
  );
};

// ---- long quotes: a paper panel rises over night, and the whole quote scrubs in ink ----------
export type QuoteRun = {k0: number; k1: number};
export const quoteRuns = (s: Section): QuoteRun[] => {
  const runs: QuoteRun[] = [];
  s.phrases.forEach((p, k) => {
    if (!p.quote) return;
    const last = runs[runs.length - 1];
    if (last && last.k1 === k - 1) last.k1 = k;
    else runs.push({k0: k, k1: k});
  });
  return runs;
};

export type QuoteInfo = {by: string; narrow?: boolean};

// `narrow` leaves the right side free for a framed photo of the speaker.
const QuotePanel: React.FC<{s: Section; run: QuoteRun; next?: Phrase; frame: number; info?: QuoteInfo}> = ({s, run, next, frame, info}) => {
  const by = info?.by;
  const narrow = info?.narrow;
  const p0 = s.phrases[run.k0];
  const p1 = s.phrases[run.k1];
  // the panel rises 13 frames (≈420 ms) before its first word, as in Settle's panel rise
  const inAt = Math.round(p0.s * FPS) - LEAD - 13;
  const holdEnd = next ? Math.round(next.s * FPS) - LEAD - PRE - 4 : Math.round(s.duration * FPS) + 6;
  const exitAt = Math.max(Math.round(p1.e * FPS) + 8, Math.min(holdEnd, Math.round(p1.e * FPS) + Math.round(1.6 * FPS)));
  if (frame < inAt - 1 || frame > exitAt + DUR.base) return null;
  const rise = ramp(frame, inAt, inAt + DUR.slow);
  const out = ramp(frame, exitAt, exitAt + DUR.base, depart);
  const words = s.words.slice(p0.a, p1.b + 1);
  const n = words.length;
  const size = narrow ? (n > 12 ? 50 : 60) : n > 16 ? 64 : 76;
  const firstKey = words.findIndex((w) => w.n || w.k);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 120,
          right: narrow ? 900 : 120,
          top: 170,
          bottom: 150,
          borderRadius: 32 - 14 * rise,
          // light frosted glass: the moving gradient shows faintly through it
          background: 'rgba(250,252,251,.8)',
          backdropFilter: 'blur(30px) saturate(150%)',
          border: '1px solid rgba(255,255,255,.75)',
          color: C.ink,
          overflow: 'hidden',
          transform: `translateY(${(1 - rise) * 105 + out * 6}%) scale(${0.92 + 0.08 * rise})`,
          opacity: 1 - out,
          boxShadow: '0 40px 120px rgba(0,0,0,.5)',
          padding: narrow ? '56px 64px' : '64px 96px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ghost quote mark, the one big shape on the panel */}
        <div style={{position: 'absolute', right: 70, top: -60, fontFamily: F.sans, fontWeight: 600, fontSize: 520, lineHeight: 1, color: C.ink, opacity: 0.06}}>”</div>
        <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.04em', color: C.ink2, display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{width: 8, height: 8, borderRadius: 4, background: C.ink}} />
          {by ? `Quote · ${by}` : 'Quote'}
        </div>
        <div style={{flex: 1, display: 'flex', alignItems: 'center'}}>
          <div style={{fontFamily: F.sans, fontSize: size, lineHeight: 1.08, letterSpacing: '-0.035em', maxWidth: 1400}}>
            {words.map((w, j) => {
              const spoken = frame - (Math.round(w.s * FPS) - LEAD);
              const arrive = frame - (inAt + 13 - PRE) - Math.min(j, 12) * STAGGER.word;
              return <WordView key={j} w={w} spoken={spoken} arrive={arrive} color={C.ink} marker={j === firstKey} markerColor={C.ink} />;
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Renders a whole VO section's words, frame-accurate to the voice.
export const Kinetic: React.FC<{s: Section; modeOf: (phraseIndex: number) => Mode; quotes?: QuoteInfo[]}> = ({s, modeOf, quotes = []}) => {
  const frame = useCurrentFrame();
  const runs = React.useMemo(() => runsOf(s, modeOf), [s, modeOf]);
  const qruns = React.useMemo(() => quoteRuns(s), [s]);
  return (
    <AbsoluteFill>
      {runs.map((r, i) => (
        <Transcript key={`t${i}`} s={s} run={r} next={s.phrases[r.ks[r.ks.length - 1] + 1]} frame={frame} />
      ))}
      {qruns.map((r, i) => (
        <QuotePanel key={`q${i}`} s={s} run={r} next={s.phrases[r.k1 + 1]} frame={frame} info={quotes[i]} />
      ))}
    </AbsoluteFill>
  );
};
