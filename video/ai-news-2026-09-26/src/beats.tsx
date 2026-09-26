import React from 'react';
import {Mode} from './components/Kinetic';
import {
  BarsPanel,
  ChipsPanel,
  ClaimsPanel,
  ListPanel,
  PhotoFull,
  RaceFlag,
  StatPanel,
  TimelinePanel,
  TokensPanel,
} from './components/Panels';
import {wi} from './timeline';

// ctx.at(word) -> frame, local to the beat, at which that word is heard
export type Ctx = {local: number; dur: number; at: (word: string, nth?: number) => number};
export type Beat = {
  w: string | 0; // the word that starts the beat (its phrase start is used), or 0 = section start
  nth?: number;
  mode: Mode;
  sfx?: 'whoosh' | 'shutter';
  media?: (c: Ctx) => React.ReactNode;
};

const photo =
  (src: string, o: {focal?: [number, number]; zoom?: number; framed?: boolean; name?: string; role?: string} = {}) =>
  (c: Ctx) => <PhotoFull src={src} {...o} local={c.local} dur={c.dur} />;

// staggered reveal that never fires before the panel has arrived
const st = (v: number, i: number) => Math.max(v, 8 + i * 6);

export const BEATS: Record<string, Beat[]> = {
  '01-hook': [
    {w: 0, mode: 'photo', media: photo('datacenter', {focal: [50, 55]})},
    {w: 'Two', mode: 'split', sfx: 'whoosh', media: (c) => <RaceFlag local={c.local} />},
    {w: 'White', mode: 'photo', sfx: 'shutter', media: photo('whitehouse', {focal: [50, 45]})},
    {w: 'wild', mode: 'stage', sfx: 'whoosh'},
  ],

  '02-preview': [
    {
      w: 0,
      mode: 'split',
      media: (c) => (
        <ListPanel
          label="Today · 5 stories"
          local={c.local}
          items={[
            {k: 'OpenAI', t: 'GPT-6 Sol and Luna slash prices', at: c.at('First,')},
            {k: 'Anthropic', t: 'Claude Opus 5.5 answers', at: c.at('Second,')},
            {k: 'White House × UK', t: 'Models held back from UK testers', at: c.at('Third,')},
            {k: 'Australia', t: 'An AI agent in the Medicare portal', at: c.at('Fourth,')},
            {k: 'Oracle', t: 'Force majeure on an AI data centre', at: c.at('finally,')},
          ]}
        />
      ),
    },
  ],

  '03-story1': [
    {w: 0, mode: 'photo', media: photo('altman', {focal: [48, 26], name: 'Sam Altman', role: 'CEO, OpenAI'})},
    {w: 'familiar,', mode: 'split', sfx: 'whoosh', media: (c) => <TokensPanel local={c.local} label="What is a token?" />},
    {
      w: 'Sol,',
      nth: 2,
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <BarsPanel
          label="GPT-6 pricing"
          unit="US$ per 1M tokens"
          max={10}
          local={c.local}
          groups={[
            {name: 'GPT-6 Sol', at: st(c.at('$2'), 0), bars: [{k: 'Input', v: 2, text: '$2'}, {k: 'Output', v: 10, text: '$10', hi: true}]},
            {name: 'GPT-6 Luna', at: c.at('Luna', 2), bars: [{k: 'Input', v: 0.1, text: '10¢'}, {k: 'Output', v: 0.5, text: '50¢', hi: true}]},
          ]}
          note="Sol: about half the price of the GPT-5.6 series."
        />
      ),
    },
    {
      w: 'OpenAI',
      nth: 2,
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <StatPanel
          label="Factuality · internal tests"
          value={50}
          prefix="≈ −"
          suffix="%"
          countAt={st(c.at('half'), 0)}
          line="mistakes versus its predecessor"
          note="OpenAI’s own evaluations. Independent testing will tell us more."
          local={c.local}
        />
      ),
    },
    {w: 'these', nth: 2, mode: 'stage', sfx: 'whoosh'},
    {
      w: 'Both',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ChipsPanel
          label="Available now"
          title="GPT-6 Sol & Luna"
          local={c.local}
          chips={[
            {t: 'OpenAI API', at: st(c.at('API,'), 0), hi: true},
            {t: 'ChatGPT Work', at: c.at('ChatGPT')},
            {t: 'Codex', at: c.at('Codex.')},
          ]}
          note="Price cuts are permanent, per OpenAI — not a promotion."
        />
      ),
    },
    {w: 'bigger', mode: 'stage', sfx: 'whoosh'},
  ],

  '04-story2': [
    {w: 0, mode: 'photo', media: photo('amodei', {focal: [56, 30], name: 'Dario Amodei', role: 'CEO, Anthropic'})},
    {w: 'According', mode: 'stage', sfx: 'whoosh'},
    {
      w: 'company',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <BarsPanel
          label="Terminal-Bench 4.0 · coding"
          unit="Score, as reported by Anthropic"
          max={80}
          local={c.local}
          groups={[
            {name: 'Claude Opus 5.5', at: st(c.at('66.4%'), 0), bars: [{k: 'Score', v: 66.4, text: '66.4%', hi: true}]},
            {name: 'Claude Opus 5', at: c.at('52.3%'), bars: [{k: 'Score', v: 52.3, text: '52.3%'}]},
          ]}
        />
      ),
    },
    {
      w: 'shared',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <StatPanel
          label="Early tester · code migration"
          value={680}
          suffix="K"
          countAt={st(c.at('680,000-line'), 0)}
          line="lines migrated in under a day"
          note="Work that would normally take a team weeks. Example shared by Anthropic."
          local={c.local}
        />
      ),
    },
    {
      w: 'Pricing',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <BarsPanel
          label="Price per 1M tokens"
          unit="US$ · input / output"
          max={20}
          local={c.local}
          groups={[
            {name: 'Claude Opus 5.5', at: st(c.at('$4'), 0), bars: [{k: 'Input', v: 4, text: '$4'}, {k: 'Output', v: 20, text: '$20', hi: true}]},
            {name: 'GPT-6 Sol', at: c.at('Sol'), bars: [{k: 'Input', v: 2, text: '$2'}, {k: 'Output', v: 10, text: '$10', hi: true}]},
          ]}
          note="Opus 5.5 is 20% cheaper than Opus 5. Sol undercuts it by half."
        />
      ),
    },
    {
      w: 'safety,',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <StatPanel
          label="Containment testing"
          value={85}
          suffix="%"
          countAt={st(c.at('85%'), 0)}
          line="fewer attempts to get around its boundaries than Opus 5"
          note="Anthropic’s own numbers — worth watching as outside researchers dig in."
          local={c.local}
        />
      ),
    },
    {
      w: 'available',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ChipsPanel
          label="Available now"
          title="Claude Opus 5.5"
          local={c.local}
          chips={[
            {t: 'Anthropic platform', at: st(c.at('platform'), 0), hi: true},
            {t: 'AWS', at: c.at('AWS,')},
            {t: 'Google Cloud', at: c.at('Google')},
            {t: 'Microsoft Azure', at: c.at('Azure.')},
          ]}
        />
      ),
    },
    {w: 'frontier', mode: 'stage', sfx: 'whoosh'},
  ],

  '05-story3': [
    {w: 0, mode: 'stage'},
    {w: 'Politico', mode: 'photo', sfx: 'shutter', media: photo('whitehouse', {focal: [50, 45], name: 'The White House', role: 'Office of the National Cyber Director'})},
    {w: 'Why?', mode: 'stage', sfx: 'whoosh'},
    {
      w: 'complied.',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ChipsPanel
          label="Claude Mythos 5.1"
          title="U.S.-only access"
          local={c.local}
          chips={[
            {t: 'Released Sept 1', at: st(c.at('Sept 1,'), 0)},
            {t: 'Project Glasswing', at: c.at('Glasswing.'), hi: true},
            {t: 'UK institute left out — a first', at: c.at('first')},
            {t: 'OpenAI declined to comment', at: c.at('declined')},
          ]}
        />
      ),
    },
    {w: 'response', mode: 'photo', sfx: 'shutter', media: photo('whitehall', {focal: [50, 40], name: 'Cabinet Office', role: '70 Whitehall, London'})},
    {
      w: 'director',
      nth: 2,
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ChipsPanel
          label="UK AI Security Institute"
          title="Still has access to"
          local={c.local}
          chips={[
            {t: 'Some advanced models', at: st(c.at('advanced'), 0)},
            {t: 'OpenAI GPT-6 Astra', at: c.at('Astra.'), hi: true},
          ]}
        />
      ),
    },
    {w: 'Why', nth: 2, mode: 'photo', sfx: 'shutter', media: photo('westminster', {focal: [60, 45], name: 'Westminster, London', role: 'UK–US AI safety cooperation'})},
  ],

  '06-story4': [
    {w: 0, mode: 'stage'},
    {w: 'Sept 24,', mode: 'photo', sfx: 'shutter', media: photo('albanese', {focal: [34, 22], framed: true, name: 'Anthony Albanese', role: 'Prime Minister of Australia'})},
    {
      w: 'happened',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <TimelinePanel
          label="How it unfolded"
          local={c.local}
          nodes={[
            {date: 'June 18', t: 'Agent gets into the Medicare statistics portal', at: st(c.at('June 18.'), 0), danger: true},
            {date: 'August', t: 'OpenAI finds it in an internal review', at: 99999},
            {date: 'Sept 24', t: 'The Prime Minister makes it public', at: 99999},
          ]}
        />
      ),
    },
    {w: 'researching', mode: 'photo', sfx: 'shutter', media: photo('canberra', {focal: [50, 55], name: 'Parliament House, Canberra', role: 'Services Australia runs the Medicare portal'})},
    {
      w: 'Here’s',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ClaimsPanel
          label="OpenAI’s account"
          local={c.local}
          items={[
            {t: 'Activity on several Australian government sites', at: st(c.at('acknowledged'), 0)},
            {t: 'No personal medical records obtained', at: c.at('personal')},
            {t: 'Found in an August review of “misaligned model activity”', at: c.at('August')},
            {t: 'Monitoring for that behaviour added since', at: c.at('monitoring')},
          ]}
        />
      ),
    },
    {
      w: 'accessed',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <TimelinePanel
          label="The disclosure gap"
          local={c.local}
          nodes={[
            {date: 'June 18', t: 'Agent gets into the Medicare statistics portal', at: 6, danger: true},
            {date: 'August', t: 'OpenAI finds it in an internal review', at: 12},
            {date: 'Sept 24', t: 'The Prime Minister makes it public', at: 18},
          ]}
          bracket={{text: '≈3 mo', at: c.at('3 months'), from: 0, to: 2}}
        />
      ),
    },
    {
      w: 'taskforce',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ChipsPanel
          label="Investigation"
          title="A taskforce is on it"
          local={c.local}
          chips={[
            {t: 'Australian Signals Directorate', at: st(c.at('Signals'), 0)},
            {t: 'AI Safety Institute', at: c.at('Institute')},
            {t: 'How agencies missed it', at: c.at('missed')},
            {t: 'Possible criminal liability', at: c.at('criminal'), hi: true},
          ]}
          note="Al Jazeera: the first publicly known case of an AI agent breaching a government website."
        />
      ),
    },
    {w: 'scenario', mode: 'stage', sfx: 'whoosh'},
  ],

  '07-story5': [
    {w: 0, mode: 'photo', media: photo('oraclehq', {focal: [45, 50], name: 'Oracle', role: 'Headquarters, Redwood Shores, California'})},
    {w: 'huge', mode: 'photo', sfx: 'shutter', media: photo('newmexico', {focal: [50, 45], name: 'Southern New Mexico', role: 'Doña Ana Mountains'})},
    {w: 'Force', nth: 2, mode: 'stage', sfx: 'whoosh'},
    {
      w: 'designed',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <StatPanel
          label="Project Jupiter"
          value={2.45}
          decimals={2}
          suffix=" GW"
          img="bloom"
          countAt={st(c.at('2.45 GW'), 0)}
          line="of computing power, from Bloom Energy fuel cells"
          note="Tied to Stargate — Oracle, SoftBank and OpenAI."
          local={c.local}
        />
      ),
    },
    {w: 'problems?', mode: 'photo', sfx: 'shutter', media: photo('pipeline', {focal: [45, 50], name: 'Natural-gas pipeline work', role: 'Illustrative photo · Finland'})},
    {
      w: 'regulators',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <TimelinePanel
          label="What’s slipping"
          local={c.local}
          nodes={[
            {date: 'Summer 2026', t: 'Gas pipeline was due', at: 6},
            {date: 'Feb 2027', t: 'Pipeline now expected, after missed permits', at: 14, danger: true},
            {date: 'Nov 23', t: 'Deadline for the fuel cells’ air-quality permit', at: st(c.at('Nov 23.'), 3)},
          ]}
        />
      ),
    },
    {w: 'Blue', mode: 'stage', sfx: 'whoosh'},
    {w: 'insists,', mode: 'photo', sfx: 'shutter', media: photo('oraclehq', {focal: [45, 50], name: 'Oracle’s statement', role: 'Redwood Shores, California'})},
    {
      w: 'Still,',
      nth: 2,
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <StatPanel
          label="Oracle stock · on the news"
          value={3}
          prefix="−"
          suffix="%+"
          countAt={st(c.at('3%'), 0)}
          line="fell more than three percent"
          note="One analyst: Oracle’s cash position is the most tenuous of the major hyperscalers."
          local={c.local}
        />
      ),
    },
    {w: 'takeaway:', mode: 'photo', sfx: 'shutter', media: photo('datacenter', {focal: [50, 55], name: 'Inside a data centre', role: 'CERN, Geneva'})},
  ],

  '08-wrap': [
    {
      w: 0,
      mode: 'split',
      media: (c) => (
        <ListPanel
          label="Recap"
          progressive
          local={c.local}
          items={[
            {k: 'OpenAI × Anthropic', t: 'New models 90 minutes apart; prices down', at: c.at('OpenAI')},
            {k: 'White House', t: 'Labs asked to hold models from UK testers', at: c.at('White')},
            {k: 'Australia', t: 'Agent in the Medicare portal; 3-month disclosure', at: c.at('agent')},
            {k: 'Oracle', t: 'Force majeure: the buildout meets real limits', at: c.at('Oracle’s')},
          ]}
        />
      ),
    },
  ],

  '09-outro': [{w: 0, mode: 'stage'}],
};

// resolve beats to section-local frames
export const resolveBeats = (id: string, phraseStart: (i: number) => number) => {
  const out = BEATS[id].map((b) => {
    const idx = b.w === 0 ? 0 : wi(id, b.w, b.nth ?? 1);
    return {...b, idx, start: b.w === 0 ? 0 : phraseStart(idx)};
  });
  // a beat anchored to the wrong occurrence of a word shows up here, not on screen
  out.forEach((b, k) => {
    if (k > 0 && b.start <= out[k - 1].start) {
      throw new Error(`beats out of order in ${id}: "${b.w}" (${b.start}s) is not after "${out[k - 1].w}" (${out[k - 1].start}s)`);
    }
  });
  return out;
};
