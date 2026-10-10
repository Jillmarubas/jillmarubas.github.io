// Every typed prompt, key press and mouse click in the film, in absolute seconds. Pure (no React):
// the scenes draw from these, and scripts/gpt1010_cues.mjs dumps them for the sound mixer, so the
// user's typing / Enter / click recordings land exactly where the picture shows them.
import {at} from './plan';

export type Typed = {text: string; at: number; enter?: number};

export const PROMPTS = {
  bill: 'Make me a bill splitter for 5 friends. The bill is $240.',
  bike: 'Explain how a 7-speed bike works. Show me the parts.',
  trip: 'Plan a 3-day road trip from Kuala Lumpur to Penang. Show the stops.',
  penang: 'What are the weekend weather and traffic like in Penang? Search the web.',
  notes: 'Transcribe this recording. Then list the decisions, open questions and next steps.',
  budget: 'What did they decide about the budget?',
  email: 'Draft a follow-up email from these notes.',
  codex: 'Fix the login redirect loop on the checkout page',
  ghost: 'Now add a test that covers the redirect',
  edit: ' after sign-in',
  comment: 'A bill splitter for our trip!',
};

export const CUES = (() => {
  const hook = at('HookApp');
  const open = at('TryOpen');
  const bill = at('TryBill');
  const bike = at('TryBike');
  const trip = at('TryMap');
  const reas = at('TipReasoning');
  const str = at('StreamDemo');
  const notes = at('NotesDemo');
  const use = at('CodexUse');
  const off = at('CodexOff');
  const out = at('Outro');
  return {
    HookApp: {plus: hook.w('splitter') + 0.45},
    TryOpen: {tab: open.w('tab') - 0.05},
    TryBill: {type: {text: PROMPTS.bill, at: bill.w('ask') - 0.1, enter: bill.Le(2) + 0.15}, plus: bill.w('change') + 0.1, tip: bill.w('happens') + 0.05},
    TryBike: {type: {text: PROMPTS.bike, at: bike.L(4) + 0.05, enter: bike.w('question') + 0.25}, tabs: [bike.w('example'), bike.w('explains') + 0.05, bike.w('diagram') + 0.05, bike.w('explore') + 0.1]},
    TryMap: {type: {text: PROMPTS.trip, at: trip.L(5) - 0.25, enter: trip.w('road') + 0.05}},
    TipReasoning: {open: reas.w('pro') + 0.35, pick: reas.w('levels') - 0.1},
    StreamDemo: {type: {text: PROMPTS.penang, at: str.w('ask') - 0.05, enter: str.Le(0) + 0.3}},
    NotesDemo: {
      plus: notes.w('attach') - 0.1,
      file: notes.w('file') + 0.05,
      type: {text: PROMPTS.notes, at: notes.w('say') - 0.25, enter: notes.Le(1) + 0.3},
      type2: {text: PROMPTS.budget, at: notes.w('ask') - 0.05, enter: notes.Le(2) + 0.2},
      type3: {text: PROMPTS.email, at: notes.w('turn') - 0.05, enter: notes.Le(3) + 0.25},
    },
    CodexUse: {
      update: use.w('latest') + 0.05,
      type: {text: PROMPTS.codex, at: use.w('send') - 0.1, enter: use.w('wait') + 0.05},
      tab: use.w('tab') + 0.02,
      edit: {text: PROMPTS.edit, at: use.w('edit') + 0.05, enter: use.w('send', 2) + 0.05},
    },
    CodexOff: {gear: off.w('default') - 0.05, toggle: off.w('settings') + 0.15},
    Outro: {like: out.w('like') - 0.03, sub: out.w('subscribe') - 0.03, comment: {text: PROMPTS.comment, at: out.w('comments') + 0.2}},
  };
})();

/** Flat list for the mixer: typed runs (with optional Enter), key taps and clicks. */
export const SOUND = () => {
  const c = CUES;
  const typed: Typed[] = [c.TryBill.type, c.TryBike.type, c.TryMap.type, c.StreamDemo.type, c.NotesDemo.type, c.NotesDemo.type2, c.NotesDemo.type3, c.CodexUse.type, c.CodexUse.edit, {text: c.Outro.comment.text, at: c.Outro.comment.at}];
  const keys = [c.CodexUse.tab]; // Tab: one key press
  const clicks = [c.HookApp.plus, c.TryOpen.tab, c.TryBill.plus, c.TryBill.tip, ...c.TryBike.tabs, c.TipReasoning.open, c.TipReasoning.pick, c.NotesDemo.plus, c.NotesDemo.file, c.CodexUse.update, c.CodexOff.gear, c.CodexOff.toggle, c.Outro.like, c.Outro.sub];
  return {typed, keys, clicks};
};
