import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import credits from '../../public/photos/credits.json';
import {NightCard} from '../components/Panels';
import {BLUR_IN, C, DUR, F, RISE, STAGGER, WORD_FLOOR, depart, glide, settle} from '../theme';
import {STORIES} from '../timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ramp = (x: number, a: number, b: number, easing = settle) => interpolate(x, [a, b], [0, 1], {...clamp, easing});

// Words that arrive with a blur-in at word-floor, then brighten one by one, 60 ms apart:
// the scrub, driven by the clock on cards (there is no voice to follow here).
const Scrub: React.FC<{text: string; start: number; litAt?: number; style?: React.CSSProperties; color?: string}> = ({
  text,
  start,
  litAt,
  style,
  color = C.onNight,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  const lit0 = litAt ?? start + 8;
  return (
    <div style={style}>
      {words.map((w, i) => {
        const a = ramp(frame - start - i * STAGGER.word, 0, DUR.slow);
        const lit = ramp(frame - lit0 - i * STAGGER.word * 1.6, 0, 6, glide);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.24em',
              color,
              opacity: a * (WORD_FLOOR + (1 - WORD_FLOOR) * lit),
              transform: `translateY(${(1 - a) * RISE.sm}px)`,
              filter: a < 1 ? `blur(${(1 - a) * BLUR_IN}px)` : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// ---- story card: a paper panel rises over night, with the pinned index ----------------------------
export const StoryCard: React.FC<{n: number; len: number}> = ({n, len}) => {
  const frame = useCurrentFrame();
  const s = STORIES[n - 1];
  const rise = ramp(frame, 0, DUR.slow);
  const out = ramp(frame, len - DUR.base, len, depart);
  // the index marker glides from the previous story to this one
  const mk = ramp(frame, 14, 14 + DUR.base, glide);
  const markerRow = n - 1 - (n > 1 ? 1 - mk : 0);
  const rowH = 64;
  const line = ramp(frame, 22, 22 + DUR.slow);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 28,
          top: 28,
          right: 28,
          bottom: 28,
          borderRadius: 32 - 14 * rise,
          // light frosted glass: the moving gradient shows faintly through it
          background: 'rgba(250,252,251,.8)',
          backdropFilter: 'blur(30px) saturate(150%)',
          border: '1px solid rgba(255,255,255,.75)',
          overflow: 'hidden',
          transform: `translateY(${(1 - rise) * 105 - out * 40}%) scale(${0.92 + 0.08 * rise})`,
          opacity: 1 - out,
        }}
      >
        {/* pinned index */}
        <div style={{position: 'absolute', left: 92, top: 300, width: 470}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 2, height: rowH * 6, background: C.line}} />
          <div style={{position: 'absolute', left: -5, top: markerRow * rowH + 14, width: 12, height: 32, borderRadius: 6, background: C.ink}} />
          {STORIES.map((x, i) => {
            const cur = i === n - 1;
            const lit = cur ? ramp(frame, 18, 24, glide) : 0;
            return (
              <div key={i} style={{height: rowH, display: 'flex', alignItems: 'center', gap: 20, paddingLeft: 30, color: C.ink, opacity: (i < n - 1 ? 0.45 : WORD_FLOOR) + (1 - WORD_FLOOR) * lit}}>
                <span style={{fontFamily: F.mono, fontSize: 16}}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{fontFamily: F.sans, fontWeight: 500, fontSize: 27, letterSpacing: '-0.02em'}}>{x.short}</span>
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', left: 660, top: 300, width: 1080}}>
          <Scrub
            text={`Story ${String(n).padStart(2, '0')} / 06 · ${s.kicker}`}
            start={6}
            style={{fontFamily: F.mono, fontSize: 20, color: C.ink2}}
            color={C.ink}
          />
          <Scrub text={s.title} start={10} litAt={20} style={{fontFamily: F.sans, fontWeight: 500, fontSize: 104, lineHeight: 0.98, letterSpacing: '-0.045em', marginTop: 34}} color={C.ink} />
          <div style={{height: 2, background: C.ink, marginTop: 44, width: 1000, transformOrigin: '0% 50%', transform: `scaleX(${line})`}} />
        </div>
        <div style={{position: 'absolute', left: 92, top: 72, fontFamily: F.sans, fontWeight: 600, fontSize: 22, letterSpacing: '0.06em', color: C.ink}}>AI NEWS DAILY</div>
      </div>
    </AbsoluteFill>
  );
};

// ---- brand sting: Settle's logo intro, once per film ------------------------------------------------
// Letters rise out of a mask 40 ms apart on slow + settle, hold 250 ms, then the wordmark glides
// up into the top-left of the chrome at 42% scale. The chrome takes over at DOCK_AT.
const LETTERS = [...'AI NEWS DAILY'];
const LOGO_SIZE = 150;
const HOLD_AT = 2 + LETTERS.length * STAGGER.letter + DUR.slow; // last letter settled
const GLIDE_AT = Math.round(HOLD_AT + 8); // + 250 ms hold
export const DOCK_AT = GLIDE_AT + DUR.slow;

export const BrandSting: React.FC<{len: number}> = ({len}) => {
  const frame = useCurrentFrame();
  const g = ramp(frame, GLIDE_AT, DOCK_AT, glide);
  // from (140, 440) at 150 px to the chrome's (120, 54) at 25 px; ≈ the 42% of the rule, then tightened
  const scale = 1 - g * (1 - 25 / LOGO_SIZE);
  const x = 140 + (120 - 140) * g;
  const y = 440 + (54 - 440) * g;
  const x2 = ramp(frame, len - DUR.base, len, depart);
  return (
    <AbsoluteFill>
      {frame < DOCK_AT + 1 ? (
        <div style={{position: 'absolute', left: x, top: y, transformOrigin: '0% 0%', transform: `scale(${scale})`}}>
          <div style={{display: 'flex', fontFamily: F.sans, fontWeight: 600, fontSize: LOGO_SIZE, letterSpacing: '0.06em', color: C.onNight, lineHeight: 1}}>
            {LETTERS.map((ch, i) => {
              const p = ramp(frame - 2 - i * STAGGER.letter, 0, DUR.slow);
              return (
                <span key={i} style={{display: 'inline-block', overflow: 'hidden', height: '1.08em', width: ch === ' ' ? '0.3em' : undefined}}>
                  <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`}}>{ch}</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 140, top: 430, opacity: 1 - x2, transform: `translateY(${-x2 * RISE.nudge}px)`}}>
        <Scrub text="Six AI stories" start={DOCK_AT - 4} litAt={DOCK_AT + 6} style={{fontFamily: F.sans, fontWeight: 500, fontSize: 124, letterSpacing: '-0.045em', lineHeight: 1}} />
        <Scrub text="Monday · 28 September 2026" start={DOCK_AT + 4} litAt={DOCK_AT + 14} style={{fontFamily: F.mono, fontSize: 24, color: C.onNight2, marginTop: 30}} />
      </div>
    </AbsoluteFill>
  );
};

// ---- recap card -------------------------------------------------------------------------------
export const RecapCard: React.FC<{len: number}> = ({len}) => {
  const frame = useCurrentFrame();
  const x = ramp(frame, len - DUR.base + 2, len, depart);
  return (
    <AbsoluteFill style={{opacity: 1 - x, transform: `translateY(${-x * RISE.nudge}px)`}}>
      <Scrub text="The recap" start={2} litAt={8} style={{position: 'absolute', left: 140, top: 400, fontFamily: F.sans, fontWeight: 500, fontSize: 200, letterSpacing: '-0.055em'}} />
    </AbsoluteFill>
  );
};

// ---- end card: thanks + photo credits and sources -----------------------------------------------------
type Cr = Record<string, {title: string; artist: string; license: string}>;
const SUBJECT: Record<string, string> = {
  altman: 'Sam Altman',
  amodei: 'Dario Amodei',
  datacenter: 'CERN data centre (illustrative)',
  unsc: 'UN Security Council chamber',
  trumpxi2: 'Xi Jinping and Donald Trump',
  whitehouse: 'The White House',
};
export const EndCard: React.FC<{len: number}> = ({len}) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [len - 24, len], [1, 0], clamp);
  const panel = ramp(frame, 16, 16 + DUR.slow);
  const list = Object.entries(credits as Cr).map(([k, c]) => ({...c, subject: SUBJECT[k] ?? c.title}));
  return (
    <AbsoluteFill style={{opacity: fadeOut}}>
      <div style={{position: 'absolute', left: 140, top: 250, width: 800}}>
        <Scrub text="Thanks for watching." start={2} litAt={8} style={{fontFamily: F.sans, fontWeight: 500, fontSize: 104, lineHeight: 0.98, letterSpacing: '-0.045em'}} />
        <Scrub
          text="Sandbox escape or Gemini 4: which one should get the full breakdown? Tell me in the comments."
          start={18}
          litAt={26}
          style={{fontFamily: F.sans, fontWeight: 500, fontSize: 36, lineHeight: 1.25, letterSpacing: '-0.02em', color: C.onNight, marginTop: 40, maxWidth: 760}}
        />
      </div>
      <div style={{position: 'absolute', left: 1040, top: 150, width: 760, opacity: panel, transform: `translateY(${(1 - panel) * RISE.card}px)`, filter: panel < 1 ? `blur(${(1 - panel) * BLUR_IN}px)` : undefined}}>
        <NightCard style={{padding: '40px 44px'}}>
          <div style={{fontFamily: F.mono, fontSize: 16, color: C.onNight2, marginBottom: 20}}>Photos · Wikimedia Commons</div>
          {list.map((c, i) => {
            const p = ramp(frame, 24 + i * STAGGER.card, 24 + i * STAGGER.card + DUR.slow);
            return (
              <div key={i} style={{fontFamily: F.mono, fontSize: 15, lineHeight: 1.75, color: C.onNight, opacity: p}}>
                <span style={{color: C.onNight2}}>{c.subject}</span> — {c.artist.replace(/ from .*$/, '')} · {c.license}
              </div>
            );
          })}
          <div style={{height: 1, background: C.hair, margin: '24px 0'}} />
          <div style={{fontFamily: F.mono, fontSize: 14, color: C.onNight2, lineHeight: 1.65, opacity: ramp(frame, 50, 50 + DUR.slow)}}>
            Reporting: Fortune, Notebookcheck, 9to5Google, The Decoder, Numeral, CNN, ABC News, Bloomberg, Axios, CBS News, CNBC and The Hill. Voice: ElevenLabs “Joey”. Music and sound effects synthesised in code for this video.
          </div>
        </NightCard>
      </div>
    </AbsoluteFill>
  );
};
