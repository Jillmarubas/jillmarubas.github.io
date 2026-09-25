import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, D, E, F, STAGGER} from '../theme';
import {prog, useT} from '../lib/anim';
import {WORDS, type Word} from '../lib/timeline';

// Words that carry the story get the accent and an underline that draws when spoken.
const KEY = new Set(
  [
    'claude', 'opus', '5.5', 'anthropic', 'openai', "openai's", 'gpt-6', 'sol', "sol's", 'luna', 'dna', 'un', 'ceos', 'humanity',
    'twenty', 'percent', 'dollars', 'half', 'ten', 'cents', 'eighty', 'cheapest', 'nine', 'hundred', 'fifty', 'twenty-one',
    'thousand', 'crispr-like', 'art', 'stanley', 'qi', 'kevin', 'blake', 'two-point-oh', 'meta', 'muse', 'charm', 'december',
    'ray-ban', 'forty-nine', 'three', 'zuckerberg', 'optimists', 'google', "deepmind's", 'gemini', '4', 'post-training',
    'coding', 'agents', 'island', 'four', 'million', 'six-point-four', 'billion', 'dario', 'amodei', 'sam', 'altman',
    'u.s.', 'guardrails', 'rejected', 'risk', 'strangest', 'wearables', 'minutes', 'twenty-second', 'computer-use',
  ].map((s) => s.toLowerCase()),
);
const clean = (s: string) => s.replace(/[“”".,:?!]/g, '');
const isKey = (w: string) => KEY.has(clean(w).toLowerCase());

type Page = {words: Word[]; start: number; end: number};

// Short pages, broken at punctuation, so a line never outruns the voice.
const buildPages = (): Page[] => {
  const pages: Word[][] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) pages.push(cur);
    cur = [];
  };
  WORDS.forEach((w, i) => {
    const prev = WORDS[i - 1];
    if (prev && prev.para !== w.para) flush();
    const chars = cur.reduce((n, x) => n + x.text.length + 1, 0) + w.text.length;
    if (cur.length >= 4 || chars > 24) flush();
    cur.push(w);
    if (/[.?!:]["”]?$/.test(w.text) || (/,["”]?$/.test(w.text) && cur.length >= 2)) flush();
  });
  flush();
  return pages.map((ws, i) => {
    const next = pages[i + 1];
    const last = ws[ws.length - 1];
    return {
      words: ws,
      start: ws[0].start - 0.12,
      end: next ? Math.min(next[0].start - 0.12, last.end + 0.7) : last.end + 1.2,
    };
  });
};
const PAGES = buildPages();

export const Captions: React.FC = () => {
  const t = useT();
  const page = PAGES.find((p) => t >= p.start && t < p.end + 0.2);
  if (!page) return null;
  const out = prog(t, page.end, 0.16, E.depart);
  return (
    <AbsoluteFill style={{top: 1170, height: 300, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
      <div
        style={{
          width: 920,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignContent: 'center',
          columnGap: 26,
          rowGap: 4,
          opacity: 1 - out,
          transform: `translateY(${-18 * out}px)`,
          filter: out > 0.001 ? `blur(${6 * out}px)` : undefined,
        }}
      >
        {page.words.map((w, i) => {
          // the page arrives with its words rising 60 ms apart at the floor opacity...
          const arrive = prog(t, page.start + i * STAGGER.word, D.base);
          // ...then each word lights up when it is spoken
          const lit = prog(t, w.start - 0.05, 0.22);
          const speaking = t >= w.start - 0.05 && t < w.end + 0.04;
          const key = isKey(w.text);
          const pop = speaking ? 1 + 0.04 * Math.sin(Math.min(1, (t - w.start + 0.05) / 0.18) * Math.PI) : 1;
          const underline = prog(t, w.start, D.base, E.glide);
          return (
            <span
              key={i}
              style={{
                position: 'relative',
                display: 'inline-block',
                fontFamily: F.display,
                fontWeight: 800,
                fontSize: 88,
                lineHeight: 1.08,
                letterSpacing: '-.025em',
                color: key && lit > 0.5 ? C.accentHover : C.text,
                opacity: arrive * (0.22 + 0.78 * lit),
                transform: `translateY(${(1 - arrive) * 24 + (1 - lit) * 6}px) scale(${pop})`,
                filter: arrive < 0.999 ? `blur(${(1 - arrive) * 8}px)` : undefined,
                textShadow:
                  key && lit > 0.5
                    ? '0 0 34px rgba(250,90,5,.55), 0 6px 24px rgba(0,0,0,.45)'
                    : '0 6px 24px rgba(0,0,0,.5)',
              }}
            >
              {w.text.replace(/"/g, '')}
              {key ? (
                <span
                  style={{
                    position: 'absolute',
                    left: 2,
                    right: 2,
                    bottom: 2,
                    height: 7,
                    borderRadius: 7,
                    background: C.accent,
                    transformOrigin: 'left center',
                    transform: `scaleX(${underline})`,
                    opacity: 0.9,
                  }}
                />
              ) : null}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
