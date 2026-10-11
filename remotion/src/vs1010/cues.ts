// Every typed prompt, key press and mouse click, in absolute seconds. Pure (no React): the scenes draw
// from these and scripts/vs1010_cues.mjs dumps them for the mixer, so the user's typing / Enter / click
// recordings land exactly where the picture shows them.
import {at, line, wordAt, win} from './plan';

export type Typed = {text: string; at: number; enter?: number};

export const PROMPTS = {
  r1: 'Compare three ways to get from the airport to the city center. Show cost, time and comfort.',
  r2: 'Turn these notes into a one-page plan with a title, three goals and a timeline.',
  r2b: 'Make it a document I can download.',
  r3: 'Research the best budget laptops for students this year. Compare five, with prices in US dollars, and list your sources.',
  r3b: 'Which one has the best battery? Show me where you found that.',
  r4: 'Make a poster for a bake sale on Saturday. Big title, cupcakes, warm colors, and the text: Bake Sale, Saturday, 10 AM.',
  r5: 'Build me a simple tip calculator I can use in my browser. Explain how to open it.',
  r6: 'Find every email about my order from last week and tell me which ones need a reply.',
  r7: 'Summarize this in ten bullet points. Then list anything that looks like a deadline, a cost or a risk.',
  r7b: 'Where in the document does it say that?',
  comment: 'Gemini for research, Claude for docs!',
};

/** Absolute time of `word` in scene `name`, or `fb` (absolute) if the recogniser missed it. */
const sw = (name: string, word: string, fb: number, n = 0) => {
  try {
    return wordAt(win(name), word, n);
  } catch {
    return fb;
  }
};

export const CUES = (() => {
  const r1 = at('R1Try'), r2 = at('R2Try'), r3 = at('R3Try'), r4 = at('R4Try'), r5 = at('R5Try'), r6 = at('R6Try'), r7 = at('R7Try');
  const out = at('Outro');
  const L = (s: typeof r1, i: number) => s.L(i);
  return {
    R1Try: {type: {text: PROMPTS.r1, at: sw('R1Try', 'compare', L(r1, 9) + 1.6) + 0.1, enter: r1.Le(9) + 0.05}},
    R2Try: {type: {text: PROMPTS.r2, at: sw('R2Try', 'turn', L(r2, 8) + 2) + 0.05, enter: r2.Le(8) - 1.4}, type2: {text: PROMPTS.r2b, at: sw('R2Try', 'make', L(r2, 9) + 1) + 0.05, enter: sw('R2Try', 'download', L(r2, 9) + 2.5) + 0.35}},
    R3Try: {type: {text: PROMPTS.r3, at: sw('R3Try', 'research', L(r3, 8) + 0.8) + 0.05, enter: r3.Le(8) + 0.1}, type2: {text: PROMPTS.r3b, at: sw('R3Try', 'which', L(r3, 10) + 2.5) + 0.05, enter: r3.Le(10) - 0.3}},
    R4Try: {type: {text: PROMPTS.r4, at: sw('R4Try', 'make', L(r4, 7) + 1.6) + 0.05, enter: r4.Le(7) + 0.05}},
    R5Try: {type: {text: PROMPTS.r5, at: sw('R5Try', 'build', L(r5, 8) + 3) + 0.05, enter: r5.Le(8) + 0.05}},
    R6Try: {type: {text: PROMPTS.r6, at: sw('R6Try', 'find', L(r6, 6) + 2.5) + 0.05, enter: r6.Le(6) + 0.05}},
    R7Try: {type: {text: PROMPTS.r7, at: sw('R7Try', 'summarize', L(r7, 7) + 2) + 0.05, enter: r7.Le(7) + 0.05}, type2: {text: PROMPTS.r7b, at: sw('R7Try', 'where', L(r7, 8) + 0.7) + 0.05, enter: sw('R7Try', 'good', L(r7, 8) + 3) - 0.1}},
    R9Gpt: {flip: sw('R9Gpt', 'off', line(23, 2).start + 10) + 0.1},
    R9Claude: {inc: sw('R9Claude', 'incognito', line(23, 5).start + 1) + 0.1},
    R9Gemini: {flip: sw('R9Gemini', 'off', line(23, 7).start + 3) + 0.1},
    Outro: {like: out.L(0) + 1.0, sub: sw('Outro', 'subscribe', out.L(0) + 1.8) + 0.15, comment: {text: PROMPTS.comment, at: sw('Outro', 'comments', out.L(1) + 1.4) + 0.2}},
  };
})();

export const SOUND = () => {
  const c = CUES;
  const typed: Typed[] = [c.R1Try.type, c.R2Try.type, c.R2Try.type2, c.R3Try.type, c.R3Try.type2, c.R4Try.type, c.R5Try.type, c.R6Try.type, c.R7Try.type, c.R7Try.type2, {text: c.Outro.comment.text, at: c.Outro.comment.at}];
  const keys: number[] = [];
  const clicks = [c.R9Gpt.flip, c.R9Claude.inc, c.R9Gemini.flip, c.Outro.like, c.Outro.sub];
  return {typed, keys, clicks};
};
