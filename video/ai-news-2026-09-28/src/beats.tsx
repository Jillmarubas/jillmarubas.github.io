import React from 'react';
import {Mode, QuoteInfo} from './components/Kinetic';
import {
  ChipsPanel,
  ClaimsPanel,
  HotlinePanel,
  ListPanel,
  OrbitPanel,
  PhotoFull,
  SandboxPanel,
  StagesPanel,
  StatPanel,
  SubscribeMorph,
  TimelinePanel,
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

type PhotoOpts = {focal?: [number, number]; zoom?: number; framed?: boolean; name?: string; role?: string; caption?: string};
const photo = (src: string, o: PhotoOpts = {}) => (c: Ctx) => <PhotoFull src={src} {...o} local={c.local} dur={c.dur} />;

// staggered reveal that never fires before the panel has arrived (80 ms card stagger)
const st = (v: number, i: number) => Math.max(v, 10 + i * 3);

// Who said each long quote, in order of appearance per section (see Kinetic's QuotePanel).
export const QUOTES: Record<string, QuoteInfo[]> = {
  '03-story1': [{by: 'Micah Carroll, OpenAI'}],
  '05-story3': [{by: 'Sam Ross, CEO of Numeral'}],
  '06-story4': [
    {by: 'Dario Amodei · UN Security Council', narrow: true},
    {by: 'Sam Altman · UN Security Council', narrow: true},
  ],
  '08-story6': [{by: 'A White House official'}],
};

export const BEATS: Record<string, Beat[]> = {
  '01-hook': [
    {w: 0, mode: 'stage'},
    {w: 'OpenAI', mode: 'photo', sfx: 'shutter', media: photo('datacenter', {caption: 'Illustrative · a server hall', focal: [50, 55]})},
    {
      w: 'Google',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ChipsPanel
          label="The big three AI labs"
          title="The balance of power"
          local={c.local}
          chips={[
            {t: 'OpenAI', at: st(c.at('big'), 0)},
            {t: 'Anthropic', at: st(c.at('big'), 1) + 3},
            {t: 'Google', at: st(c.at('big'), 2) + 6, hi: true},
          ]}
        />
      ),
    },
    {w: 'two', mode: 'photo', sfx: 'shutter', media: photo('unsc', {caption: 'UN Security Council chamber', focal: [50, 60]})},
    {w: 'So', mode: 'stage', sfx: 'whoosh'},
  ],

  '02-preview': [
    {
      w: 0,
      mode: 'split',
      media: (c) => (
        <ListPanel
          label="Today · 6 stories"
          local={c.local}
          items={[
            {k: 'OpenAI', t: 'A second sandbox escape', at: c.at("OpenAI's")},
            {k: 'Google DeepMind', t: 'An early Gemini 4', at: c.at('Google')},
            {k: 'Numeral', t: '$100M for AI tax compliance', at: c.at('$100M')},
            {k: 'United Nations', t: 'Altman and Amodei, side by side', at: c.at('Sam')},
            {k: 'US × China', t: 'An actual AI hotline', at: c.at('US')},
            {k: 'Anthropic', t: 'Dinner at the White House', at: c.at("Anthropic's")},
          ]}
        />
      ),
    },
  ],

  '03-story1': [
    {
      w: 0,
      mode: 'split',
      media: (c) => (
        <ChipsPanel
          label="OpenAI · its most capable models"
          title="Paused, again"
          local={c.local}
          chips={[
            {t: 'Training', at: st(c.at('halted'), 0), hi: true},
            {t: 'Evaluation', at: st(c.at('halted'), 0) + 3},
            {t: 'Inference that uses tools', at: st(c.at('halted'), 0) + 6},
          ]}
          note="Scope as described in OpenAI’s incident report, 25 September 2026."
        />
      ),
    },
    {
      w: "Here's",
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => <SandboxPanel local={c.local} dnsAt={c.at('DNS')} outAt={c.at('chatbot,')} doorAt={c.at('side')} />,
    },
    {
      w: 'Now,',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <TimelinePanel
          label="Sept 20 · the response"
          local={c.local}
          nodes={[
            {date: '0:00', t: 'The agent reaches out through DNS', at: 8},
            {date: '+0:15', t: 'Monitoring flags the behaviour', at: c.at('15 minutes.')},
            {date: '+2:30', t: 'Someone pulls the plug, by hand', at: c.at('manually')},
          ]}
          bracket={{text: '2.5 h', at: c.at('2.5 hours'), from: 0, to: 2}}
        />
      ),
    },
    {w: 'According', mode: 'stage', sfx: 'whoosh'},
    {
      w: 'Around',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ClaimsPanel
          label="Also reported"
          local={c.local}
          items={[
            {t: 'OpenAI agents interacted with several U.S. government websites', at: 10},
            {t: 'In ways the company didn’t expect', at: c.at('expect,')},
          ]}
        />
      ),
    },
    {w: 'clear,', mode: 'stage', sfx: 'whoosh'},
    {
      w: "it's",
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <TimelinePanel
          label="Sandbox escapes · 2026"
          local={c.local}
          nodes={[
            {date: 'July', t: 'Agents break containment, reach Hugging Face', at: 8},
            {date: 'Sept 20', t: 'An agent reaches a chatbot through DNS', at: 20},
          ]}
          bracket={{text: '3 mo', at: c.at('3 months', 2), from: 0, to: 1}}
        />
      ),
    },
  ],

  '04-story2': [
    {w: 0, mode: 'stage'},
    {
      w: 'Koray',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ListPanel
          label="Google DeepMind · leadership"
          local={c.local}
          items={[
            {k: 'Head of Google DeepMind', t: 'Koray Kavukcuoglu', at: 8},
            {k: 'Co-founder · stepped back this summer', t: 'Demis Hassabis', at: c.at('Demis')},
          ]}
        />
      ),
    },
    {
      w: 'said',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <StagesPanel
          label="Google DeepMind · status"
          title="Gemini 4"
          local={c.local}
          stages={[
            {t: 'Pre-training', sub: 'Run began 21 July 2026', at: 10, state: 'done'},
            {t: 'Post-training', sub: 'Early phase · now', at: st(c.at('post-training'), 1), state: 'active'},
            {t: 'Release', sub: '“Much earlier” than year-end', at: c.at('earlier"'), state: 'next'},
          ]}
          note="Kavukcuoglu, at The Information’s AI Agenda Live summit, 23–24 Sept."
        />
      ),
    },
    {
      w: 'He',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ChipsPanel
          label="The plan"
          title="Ship early, iterate in public"
          local={c.local}
          chips={[
            {t: 'Ship an early version', at: st(c.at('ship'), 0)},
            {t: 'Refine on real user feedback', at: c.at('refine')},
            {t: 'Iterate in public', at: c.at('iterate'), hi: true},
          ]}
        />
      ),
    },
    {w: 'Why', mode: 'stage', sfx: 'whoosh'},
    {
      w: 'Because',
      nth: 2,
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <TimelinePanel
          label="Last flagship releases"
          local={c.local}
          nodes={[
            {date: 'Nov 2025', t: 'Google’s last true flagship', at: st(c.at('flagship'), 0)},
            {date: 'This month', t: 'OpenAI · GPT-6 Astra', at: c.at('GPT-6')},
            {date: 'This month', t: 'Anthropic · Claude updates', at: c.at('Claude')},
          ]}
          bracket={{text: '10 mo', at: c.at('GPT-6') + 12, from: 0, to: 1}}
        />
      ),
    },
    {
      w: 'If',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <OrbitPanel
          label="Frontier updates · within weeks"
          center="Frontier"
          bodies={['OpenAI', 'Anthropic', 'Google']}
          caption="Three labs, one compressed timeline."
          captionAt={c.at('compressed')}
          local={c.local}
        />
      ),
    },
  ],

  '05-story3': [
    {
      w: 0,
      mode: 'split',
      media: (c) => (
        <StatPanel label="Funding · 23 Sept" value="$100M" countAt={st(c.at('$100M'), 0)} line="into a company most people have never heard of" local={c.local} />
      ),
    },
    {
      w: 'Numeral,',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ChipsPanel
          label="Numeral · Series C"
          title="AI sales-tax compliance"
          local={c.local}
          chips={[
            {t: 'Insight Partners · lead', at: st(c.at('Insight'), 0), hi: true},
            {t: 'Salesforce Ventures', at: c.at('Salesforce')},
            {t: 'Benchmark', at: c.at('Benchmark,')},
            {t: 'Mayfield', at: c.at('Mayfield,')},
            {t: 'Y Combinator', at: c.at('Combinator.')},
          ]}
          note="Total raised: $157M, per Numeral."
        />
      ),
    },
    {
      w: 'wondering',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ListPanel
          label="What the software does"
          done
          local={c.local}
          items={[
            {k: 'Where is tax owed?', t: 'Tracking it', at: c.at('tracking')},
            {k: 'Returns and filings', t: 'Filing the paperwork', at: c.at('filing')},
            {k: 'Across 90+ countries', t: 'Handling exemptions', at: c.at('handling')},
          ]}
        />
      ),
    },
    {w: 'Their', mode: 'stage', sfx: 'whoosh'},
    {
      w: 'transaction',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => <StatPanel label="Numeral · transaction volume" value="+300%" countAt={st(c.at('300%'), 0)} line="year over year" note="Numeral reports +327%." local={c.local} />,
    },
    {
      w: 'track',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => <StatPanel label="On track for" value="80M+" countAt={st(c.at('80M'), 0)} line="transactions through its tax engine" local={c.local} />,
    },
    {w: 'flashy', mode: 'stage', sfx: 'whoosh'},
  ],

  '06-story4': [
    {w: 0, mode: 'photo', media: photo('unsc', {caption: 'UN Security Council · 23 Sept', focal: [50, 60]})},
    {w: 'Amodei', nth: 2, mode: 'split', sfx: 'shutter', media: photo('amodei', {framed: true, name: 'Dario Amodei', role: 'CEO, Anthropic', focal: [58, 30]})},
    {w: 'Altman,', nth: 2, mode: 'split', sfx: 'shutter', media: photo('altman', {framed: true, name: 'Sam Altman', role: 'CEO, OpenAI', focal: [45, 30]})},
    {w: 'Think', mode: 'stage', sfx: 'whoosh'},
    {
      w: 'Both',
      nth: 2,
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ListPanel
          label="What both asked for"
          done
          local={c.local}
          items={[
            {k: 'Testing', t: 'International safety standards', at: c.at('standards,')},
            {k: 'Transparency', t: 'Shared incident reporting', at: c.at('incident')},
            {k: 'Escalation', t: 'Secure channels to governments', at: c.at('channels')},
          ]}
        />
      ),
    },
    {w: 'rare', mode: 'stage', sfx: 'whoosh'},
  ],

  '07-story5': [
    {w: 0, mode: 'stage'},
    {w: 'Following', mode: 'photo', sfx: 'shutter', media: photo('trumpxi2', {caption: 'Xi Jinping and Donald Trump · Beijing, May 2026', focal: [45, 62]})},
    {
      w: 'White',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ChipsPanel
          label="Announced by the White House"
          title="US–China Super Intelligence Dialogue"
          local={c.local}
          chips={[
            {t: 'A standing dialogue', at: st(c.at('Dialogue,"'), 0)},
            {t: 'An AI incident channel', at: c.at('channel'), hi: true},
          ]}
        />
      ),
    },
    {w: 'think', mode: 'split', sfx: 'whoosh', media: (c) => <HotlinePanel label="The channel" lineAt={st(c.at('hotlines,'), 0)} local={c.local} />},
    {
      w: 'session',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <TimelinePanel
          label="What happens next"
          local={c.local}
          nodes={[
            {date: 'After the summit', t: 'Dialogue and channel announced', at: 8},
            {date: 'By November', t: 'The first session', at: st(c.at('November.'), 1)},
          ]}
        />
      ),
    },
    {
      w: 'define',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ClaimsPanel
          label="Not defined yet"
          local={c.local}
          items={[
            {t: 'What counts as an “incident”', at: 10, open: true},
            {t: 'How the notification process works', at: c.at('notification'), open: true},
          ]}
        />
      ),
    },
    {w: 'symbolically,', mode: 'stage', sfx: 'whoosh'},
  ],

  '08-story6': [
    {w: 0, mode: 'photo', media: photo('whitehouse', {caption: 'The White House · Washington', focal: [50, 45]})},
    {w: 'Anthropic', mode: 'split', sfx: 'shutter', media: photo('amodei', {framed: true, name: 'Dario Amodei', role: 'CEO, Anthropic', focal: [58, 30]})},
    {
      w: 'This',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <TimelinePanel
          label="Anthropic and the White House"
          local={c.local}
          nodes={[
            {date: 'This past year', t: 'Tension with the administration', at: 8},
            {date: 'State dinner for Xi', t: 'Amodei skipped it; Altman and Pichai went', at: st(c.at('skipped'), 1)},
            {date: 'Now', t: 'A private, one-on-one dinner with Trump', at: c.at('attend.')},
          ]}
        />
      ),
    },
    {w: 'official', mode: 'stage', sfx: 'whoosh'},
    {
      w: 'Whether',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <OrbitPanel
          label="The same political orbit"
          center="White House"
          bodies={['Anthropic', 'OpenAI', 'Google']}
          caption="Safety-first, and still pulled in."
          captionAt={c.at('orbit')}
          local={c.local}
        />
      ),
    },
  ],

  '09-wrap': [
    {
      w: 0,
      mode: 'split',
      media: (c) => (
        <ListPanel
          label="Recap · 6 stories"
          done
          local={c.local}
          items={[
            {k: 'OpenAI', t: 'Training paused after an escape', at: c.at('training')},
            {k: 'Google DeepMind', t: 'An early Gemini 4', at: c.at('Google')},
            {k: 'Numeral', t: '$100M for AI tax software', at: c.at('$100M')},
            {k: 'United Nations', t: 'Rivals agree on guardrails', at: c.at('two')},
            {k: 'US × China', t: 'An actual AI hotline', at: c.at('US')},
            {k: 'Anthropic', t: 'A private White House dinner', at: c.at("Anthropic's")},
          ]}
        />
      ),
    },
  ],

  '10-outro': [
    {w: 0, mode: 'stage'},
    {w: 'hit', mode: 'split', sfx: 'whoosh', media: (c) => <SubscribeMorph local={c.local} pressAt={c.at('subscribe')} />},
    {
      w: 'Drop',
      mode: 'split',
      sfx: 'whoosh',
      media: (c) => (
        <ChipsPanel
          label="Your pick, in the comments"
          title="Which gets the full breakdown?"
          local={c.local}
          chips={[
            {t: 'The sandbox escape', at: st(c.at('which'), 0)},
            {t: 'The Gemini 4 launch', at: st(c.at('which'), 0) + 4},
          ]}
        />
      ),
    },
    {w: 'Thanks', mode: 'stage', sfx: 'whoosh'},
  ],
};

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
