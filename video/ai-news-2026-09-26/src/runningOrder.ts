// The running order, shared by the video (src/timeline.ts) and the audio synth
// (synth/build.mjs). No imports on purpose: Node loads this file directly.

export type Block =
  | {kind: 'vo'; id: string; start: number; len: number; story?: number}
  | {kind: 'card'; story: number; start: number; len: number}
  | {kind: 'sting'; start: number; len: number}
  | {kind: 'recap'; start: number; len: number}
  | {kind: 'end'; start: number; len: number};

export const CARD = 3.2;
export const STORY_IDS = ['03-story1', '04-story2', '05-story3', '06-story4', '07-story5'];

export const buildBlocks = (duration: (id: string) => number) => {
  const blocks: Block[] = [];
  let t = 0.6;
  const vo = (id: string, story: number | undefined, tail: number) => {
    const d = duration(id);
    blocks.push({kind: 'vo', id, start: t, len: d, story});
    t += d + tail;
  };
  vo('01-hook', undefined, 0.3);
  blocks.push({kind: 'sting', start: t, len: 3.6});
  t += 3.8;
  vo('02-preview', undefined, 0.6);
  STORY_IDS.forEach((id, i) => {
    blocks.push({kind: 'card', story: i + 1, start: t, len: CARD});
    t += CARD;
    vo(id, i + 1, 0.8);
  });
  blocks.push({kind: 'recap', start: t, len: 2.0});
  t += 2.0;
  vo('08-wrap', undefined, 0.6);
  vo('09-outro', undefined, 0.4);
  blocks.push({kind: 'end', start: t, len: 9});
  t += 9;
  return {blocks, total: t};
};
