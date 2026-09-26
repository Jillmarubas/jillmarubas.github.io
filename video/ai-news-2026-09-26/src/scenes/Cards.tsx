import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import credits from '../../public/photos/credits.json';
import {Glass} from '../components/Glass';
import {C, F, depart, settle, snap} from '../theme';
import {STORIES} from '../timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Words that arrive one by one, on the same curve as the narration layer.
const Words: React.FC<{text: string; start: number; stagger?: number; style?: React.CSSProperties; accent?: string[]}> = ({
  text,
  start,
  stagger = 3,
  style,
  accent = [],
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={style}>
      {text.split(' ').map((w, i) => {
        const l = frame - start - i * stagger;
        const p = interpolate(l, [0, 12], [0, 1], {...clamp, easing: settle});
        const hot = accent.includes(w.replace(/[^\w.’-]/g, ''));
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.24em',
              color: hot ? C.accent : undefined,
              opacity: Math.min(1, p * 1.7),
              transform: `translateY(${(1 - p) * 0.55}em)`,
              filter: `blur(${(1 - p) * 12}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const exitOf = (frame: number, len: number) => interpolate(frame, [len - 9, len], [0, 1], {...clamp, easing: depart});

// ---- story title card -------------------------------------------------------------
const CARD_ACCENT: Record<number, string[]> = {
  1: ['GPT-6', 'Sol', 'Luna', 'half'],
  2: ['Claude', 'Opus', '5.5'],
  3: ['White', 'House', 'UK'],
  4: ['OpenAI', 'Medicare'],
  5: ['Oracle', 'force', 'majeure', 'Jupiter'],
};

export const StoryCard: React.FC<{n: number; len: number}> = ({n, len}) => {
  const frame = useCurrentFrame();
  const s = STORIES[n - 1];
  const x = exitOf(frame, len);
  const num = interpolate(frame, [0, 16], [0, 1], {...clamp, easing: snap});
  const rule = interpolate(frame, [6, 26], [0, 1], {...clamp, easing: settle});
  return (
    <AbsoluteFill style={{opacity: 1 - x, filter: x ? `blur(${x * 10}px)` : undefined, transform: `translateY(${-x * 30}px)`}}>
      {/* the story number, big and outlined, breaking the right edge on purpose */}
      <div
        style={{
          position: 'absolute',
          right: -60,
          top: 90,
          fontFamily: F.display,
          fontWeight: 900,
          fontSize: 760,
          lineHeight: 0.8,
          letterSpacing: '-0.06em',
          color: 'transparent',
          WebkitTextStroke: '3px rgba(250,90,5,.55)',
          transform: `translateX(${(1 - num) * 160}px) scale(${0.9 + 0.1 * num})`,
          opacity: num,
        }}
      >
        {String(n).padStart(2, '0')}
      </div>
      <div style={{position: 'absolute', left: 140, top: 330, width: 1180}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 34}}>
          <div style={{height: 3, width: 90 * rule, background: C.accent}} />
          <Words
            text={`Story ${String(n).padStart(2, '0')} / 05 · ${s.kicker}`}
            start={4}
            stagger={2}
            style={{fontFamily: F.mono, fontWeight: 500, fontSize: 24, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accentHi}}
          />
        </div>
        <Words
          text={s.title}
          start={10}
          stagger={3}
          accent={CARD_ACCENT[n]}
          style={{fontFamily: F.display, fontWeight: 900, fontSize: 96, lineHeight: 1.02, letterSpacing: '-0.02em', color: C.text}}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---- brand sting after the cold open -----------------------------------------------
export const BrandSting: React.FC<{len: number}> = ({len}) => {
  const frame = useCurrentFrame();
  const x = exitOf(frame, len);
  const letters = [...'AI NEWS DAILY'];
  const bar = interpolate(frame, [14, 40], [0, 1], {...clamp, easing: settle});
  return (
    <AbsoluteFill style={{opacity: 1 - x, filter: x ? `blur(${x * 10}px)` : undefined}}>
      <div style={{position: 'absolute', left: 140, top: 380}}>
        <div style={{display: 'flex', fontFamily: F.display, fontWeight: 900, fontSize: 168, letterSpacing: '-0.02em', color: C.text, lineHeight: 1}}>
          {letters.map((ch, i) => {
            const l = frame - 2 - i * 1.4;
            const p = interpolate(l, [0, 12], [0, 1], {...clamp, easing: snap});
            // letters rise from a mask, 40 ms apart, as in Settle Motion's brand rule
            return (
              <span key={i} style={{display: 'inline-block', overflow: 'hidden', height: '1em', width: ch === ' ' ? '0.3em' : undefined}}>
                <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, color: i < 2 ? C.accent : C.text}}>{ch}</span>
              </span>
            );
          })}
        </div>
        <div style={{height: 4, width: 980 * bar, background: C.accent, marginTop: 28, boxShadow: '0 0 30px rgba(250,90,5,.5)'}} />
        <Words
          text="Five AI stories · Saturday 26 September 2026"
          start={24}
          stagger={2}
          style={{fontFamily: F.mono, fontWeight: 500, fontSize: 28, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.text2, marginTop: 28}}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---- recap card -----------------------------------------------------------------
export const RecapCard: React.FC<{len: number}> = ({len}) => {
  const frame = useCurrentFrame();
  const x = exitOf(frame, len);
  return (
    <AbsoluteFill style={{opacity: 1 - x, filter: x ? `blur(${x * 10}px)` : undefined}}>
      <Words
        text="The recap"
        start={2}
        stagger={4}
        accent={['recap']}
        style={{position: 'absolute', left: 140, top: 400, fontFamily: F.display, fontWeight: 900, fontSize: 190, letterSpacing: '-0.03em', color: C.text}}
      />
    </AbsoluteFill>
  );
};

// ---- end card: subscribe + photo credits ----------------------------------------------
type Cr = Record<string, {title: string; artist: string; license: string}>;
const SUBJECT: Record<string, string> = {
  albanese: 'Anthony Albanese',
  altman: 'Sam Altman',
  amodei: 'Dario Amodei',
  whitehouse: 'The White House',
  whitehall: 'Cabinet Office, Whitehall',
  westminster: 'Palace of Westminster',
  canberra: 'Parliament House, Canberra',
  newmexico: 'Doña Ana Mountains, NM',
  bloom: 'Bloom Energy fuel cells',
  pipeline: 'Gas pipeline work, Finland',
  datacenter: 'CERN data centre',
  oraclehq: 'Oracle HQ, Redwood Shores',
};
export const EndCard: React.FC<{len: number}> = ({len}) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [len - 24, len], [1, 0], clamp);
  const panel = interpolate(frame, [20, 40], [0, 1], {...clamp, easing: settle});
  const list = Object.entries(credits as Cr).map(([k, c]) => ({...c, subject: SUBJECT[k] ?? c.title}));
  return (
    <AbsoluteFill style={{opacity: fadeOut}}>
      <div style={{position: 'absolute', left: 140, top: 190, width: 820}}>
        <Words
          text="Subscribe for tomorrow’s roundup."
          start={2}
          stagger={3}
          accent={['Subscribe']}
          style={{fontFamily: F.display, fontWeight: 900, fontSize: 96, lineHeight: 1.02, letterSpacing: '-0.02em', color: C.text}}
        />
        <Words
          text="Which story worries or excites you most? Tell us in the comments."
          start={22}
          stagger={2}
          style={{fontFamily: F.body, fontWeight: 500, fontSize: 34, lineHeight: 1.35, color: C.text2, marginTop: 34}}
        />
      </div>
      <div style={{position: 'absolute', left: 1060, top: 150, width: 720, opacity: panel, transform: `translateX(${(1 - panel) * 40}px)`}}>
        <Glass style={{padding: '34px 38px'}}>
          <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accentHi, marginBottom: 18}}>
            Photo credits · Wikimedia Commons
          </div>
          {list.map((c, i) => {
            const p = interpolate(frame, [28 + i * 2, 40 + i * 2], [0, 1], {...clamp, easing: settle});
            return (
              <div key={i} style={{fontFamily: F.mono, fontSize: 17, lineHeight: 1.6, color: C.text, opacity: p}}>
                <span style={{color: C.text2}}>{c.subject}</span> — {c.artist.replace(/ from .*$/, '')} · {c.license}
              </div>
            );
          })}
          <div style={{fontFamily: F.mono, fontSize: 15, color: C.text2, marginTop: 18, lineHeight: 1.5}}>
            Voice: ElevenLabs “Joey”. Music and sound: ElevenLabs. Reporting: Politico, Bloomberg, ABC News, Al Jazeera and company statements.
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};
