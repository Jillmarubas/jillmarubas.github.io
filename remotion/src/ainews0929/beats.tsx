// Beat map: which objects are on stage, cued to the exact word Asher says.
// Text is kept to a kicker, one stepped headline, numbers and sources. Objects carry the story.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Item} from './Stage3D';
import {Mood, ObjKind} from './objects3d';
import {blockOf, cue, cueNear, sectionEnd, sectionStart, SectionId} from './timeline';
import {Appear, Counter, Headline, Kicker, MonoPill, Quote, Small, Source, Tag} from './ui';
import {CodeCard, Flash, Press, Progress, Rain, Rings, Wave, XMark} from './props2d';
import {C, F} from './theme';

type O = Partial<Item>;
type Ctx = {
  at: number;
  out: number;
  o: (obj: ObjKind, x: number, y: number, size: number, at?: number, extra?: O) => Item;
  A: (at: number, left: number, top: number, node: React.ReactNode, opts?: {out?: number; center?: boolean; from?: 'below' | 'left' | 'right'}) => React.ReactNode;
};
type Built = {items?: Item[]; ui?: React.ReactNode[]; whoosh?: boolean};
export type Sfx = {at: number; file: 'whoosh' | 'impact' | 'tick' | 'pop'; vol?: number};

const defs: {at: number; build: (c: Ctx) => Built; impact?: boolean}[] = [];
const beat = (at: number, build: (c: Ctx) => Built, impact = false) => defs.push({at, build, impact});

const L = 150; // text column
const K_TOP = 250;
const H_TOP = 330;
const between = (a: number, b: number, from: number, to: number) => (f: number) => from + (to - from) * Math.min(1, Math.max(0, (f - a) / Math.max(1, b - a)));
const moodAt = (switchAt: number, before: Mood, after: Mood) => (f: number) => (f < switchAt ? before : after);
const text = (c: Ctx, kicker: string, lines: string[], color: string = C.ok, size = 88) => [
  c.A(c.at, L, K_TOP, <Kicker text={kicker} color={color} />),
  c.A(c.at + 3, L, H_TOP, <Headline lines={lines} at={c.at + 3} size={size} />),
];

// ============================== HOOK ==============================
{
  const h = (w: string, n = 1) => cue('hook', w, n);
  beat(0, (c) => ({
    items: [
      c.o('killswitch', 1330, 590, 360, c.at + 4, {p: (f) => (f >= h('switch') && f < h('switch') + 10 ? 1 : 0)}),
      c.o('orb', 1030, 330, 120, h('rogue'), {mood: 'err', seed: 1}),
      c.o('orb', 1660, 320, 110, h('rogue') + 4, {mood: 'err', seed: 2}),
      c.o('orb', 1700, 800, 100, h('rogue') + 8, {mood: 'err', seed: 3}),
    ],
    ui: [...text(c, 'Nvidia', ['A kill switch', 'for *rogue* agents'], C.err)],
  }));
  beat(h('OpenAI'), (c) => ({
    items: [
      c.o('pause', 1160, 520, 330, c.at),
      c.o('building', 1600, 600, 320, h('government')),
      c.o('orb', 1450, 330, 100, h('snooping'), {mood: 'warn', seed: 4, path: (f) => [Math.sin((f - h('snooping')) / 14) * 160, 0]}),
    ],
    ui: [...text(c, 'OpenAI', ['Training,', '*paused*'], C.warn)],
  }));
  beat(h('one-year-old'), (c) => ({
    items: [c.o('coins', 1330, 590, 440, c.at, {p: between(c.at, h('overnight.'), 0, 1)})],
    ui: [
      c.A(c.at, L, K_TOP, <Kicker text="A one-year-old startup" color={C.warn} />),
      c.A(h('ten-billion-dollar'), L, H_TOP, <Counter to={10} at={h('ten-billion-dollar')} prefix="$" suffix="B" size={220} />),
      c.A(h('overnight.'), L, H_TOP + 240, <Small size={36}>valued overnight</Small>),
    ],
  }));
  beat(h('wild'), (c) => ({
    items: [c.o('hourglass', 1330, 560, 440, c.at, {p: between(c.at, sectionEnd('hook'), 0.1, 0.9)})],
    ui: [
      c.A(h('48'), L, H_TOP - 30, <Counter to={48} at={h('48')} dur={18} size={260} />),
      c.A(h('hours'), L + 8, H_TOP + 230, <Small size={40} color={C.text1}>hours in AI</Small>),
    ],
  }));
}

// ============================== TITLE ==============================
{
  const t = Math.round(blockOf('title').start * 30);
  beat(
    t,
    (c) => ({
      items: [c.o('orb', 960, 420, 300, c.at + 2, {mood: 'ok', seed: 7})],
      ui: [
        c.A(c.at + 8, 960, 640, <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 120, letterSpacing: '-0.055em', color: C.text1, whiteSpace: 'nowrap'}}>AI News <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.12em', letterSpacing: 0}}>Daily</span></div>, {center: true}),
        c.A(c.at + 14, 960, 800, <MonoPill size={26}>TUESDAY · 29 SEPTEMBER 2026</MonoPill>, {center: true}),
      ],
    }),
    true,
  );
}

// ============================== PREVIEW ==============================
{
  const p = (w: string, n = 1) => cue('preview', w, n);
  const row: [ObjKind, string, number, string][] = [
    ['shield', "Nvidia's", 1, 'Nvidia'],
    ['pause', "OpenAI's", 2, 'OpenAI'],
    ['coins', 'funding', 4, 'Instinct'],
    ['mic', "ElevenLabs'", 3, 'ElevenLabs'],
    ['capitol', 'Washington', 5, 'Washington'],
  ];
  beat(sectionStart('preview'), (c) => ({
    items: row.map(([obj, w], i) => c.o(obj, 330 + i * 315, 500, 210, p(w), {seed: i, mood: 'ok', p: 1})),
    ui: [
      c.A(c.at, 960, 170, <Kicker text="Today · five stories" />, {center: true}),
      c.A(p('five'), 960, 800, <Small size={30}>agents · safety · money · voice · policy</Small>, {center: true}),
      ...row.map(([, w, , label], i) => c.A(p(w) + 6, 330 + i * 315, 650, <Tag text={`0${i + 1} ${label}`} mono size={22} />, {center: true})),
    ],
  }));
}

// ============================== STINGERS ==============================
const STORY: [string, string[], ObjKind, Mood, string][] = [
  ['Nvidia', ['Guardrails for', '*rogue* agents'], 'shield', 'ok', C.ok],
  ['OpenAI', ['Agents gone', '*off-script*'], 'pause', 'warn', C.warn],
  ['ElevenLabs', ['Voices with', '*feeling*'], 'mic', 'azure', C.ice100],
  ['Instinct', ['A $10B', '*assistant*'], 'coins', 'warn', C.warn],
  ['Washington', ["Washington's", 'AI *reckoning*'], 'capitol', 'azure', C.ice100],
];
const firstCue: SectionId[] = ['s1', 's2', 's3', 's4', 's5'];
const heroOut = [cue('s1', 'Now,'), cue('s2', 'after'), cue('s3', 'Both'), cue('s4', 'Instinct'), cueNear('s5', 'This', 5.5)];
STORY.forEach(([name, lines, obj, mood, color], i) => {
  const at = Math.round(blockOf('stinger', i + 1).start * 30);
  beat(
    at,
    (c) => ({
      items: [c.o(obj, 1330, 560, 470, c.at + 4, {mood, p: between(c.at + 10, c.at + 40, 0, 1), out: heroOut[i] - 6})],
      ui: [
        c.A(c.at, L - 20, 150, <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: 460, letterSpacing: '-0.06em', color: 'rgba(244,246,251,.10)', lineHeight: 1}}>0{i + 1}</div>, {out: c.out}),
        c.A(c.at + 6, L, 520, <Kicker text={`Story 0${i + 1} · ${name}`} color={color} />, {out: sectionStart(firstCue[i]) - 4}),
        c.A(c.at + 9, L, 600, <Headline lines={lines} at={c.at + 9} size={96} />, {out: sectionStart(firstCue[i]) - 4}),
      ],
    }),
    true,
  );
});

// ============================== S1 · NVIDIA ==============================
{
  const k = (w: string, n = 1) => cue('s1', w, n);
  beat(sectionStart('s1'), (c) => ({
    items: [c.o('barrier', 1660, 830, 170, k('guardrails'), {seed: 2})],
    ui: [
      ...text(c, 'Nvidia · Monday', ['Open Agent', '*Safety* Platform'], C.ok, 84),
      c.A(c.at + 20, L, 900, <Source text="NVIDIA NEWSROOM · 28 SEP 2026" />),
    ],
  }));
  beat(k('Now,'), (c) => ({
    items: [
      c.o('bubble', 1060, 470, 280, k('chatbot.')),
      c.o('orb', 1500, 500, 300, c.at + 4, {mood: 'ok', seed: 5}),
      c.o('ticket', 1420, 250, 140, k('booking'), {seed: 1, drift: 0.5}),
      c.o('globe', 1760, 330, 150, k('browsing'), {seed: 2}),
    ],
    ui: [
      ...text(c, 'Quick refresher', ['Answers vs', '*actions*'], C.ok),
      c.A(k('chatbot.') + 6, 1060, 660, <Tag text="Chatbot · answers" />, {center: true}),
      c.A(k('agents', 2) + 6, 1500, 700, <Tag text="Agent · takes actions" color={C.ok} />, {center: true}),
      c.A(k('writing'), 1650, 690, <CodeCard at={k('writing')} />),
    ],
  }));
  beat(k('That'), (c) => ({
    items: [c.o('orb', 1330, 540, 400, c.at, {mood: moodAt(k('risky'), 'warn', 'err'), seed: 6})],
    ui: [...text(c, 'Autonomy', ['Powerful,', 'and *risky*'], C.warn)],
  }));
  beat(k('fix'), (c) => ({
    items: [c.o('chip', 1330, 560, 420, c.at, {mood: 'ok'})],
    ui: [
      c.A(c.at, L, K_TOP, <Kicker text="Nvidia's fix" color={C.ok} />),
      c.A(k('two'), L, H_TOP, <Counter to={2} at={k('two')} dur={8} size={220} />),
      c.A(k('parts.'), L + 150, H_TOP + 70, <Small size={44} color={C.text1}>parts</Small>),
    ],
  }));
  beat(k('OpenShell,'), (c) => ({
    items: [
      c.o('chip', 1330, 800, 300, c.at, {mood: 'ok', drift: 0.3}),
      c.o('cage', 1330, 470, 360, c.at + 4, {mood: 'ok', p: between(k('locked-down'), k('locked-down') + 20, 0, 1), drift: 0.4}),
    ],
    ui: [
      ...text(c, '01 · OpenShell', ['A locked-down', '*sandbox*'], C.ok),
      c.A(k('chips.'), L, 560, <Small size={32} width={560}>Agents run without privileges, on Nvidia's chips</Small>),
    ],
  }));
  beat(k('Sentry,'), (c) => ({
    items: [
      c.o('lens', 1080, 500, 340, c.at, {mood: moodAt(k('misbehaving'), 'ok', 'err')}),
      c.o('cage', 1600, 540, 330, k('quarantine'), {mood: 'err', p: between(k('quarantine'), k('quarantine') + 12, 0, 1), seed: 9}),
    ],
    ui: [
      ...text(c, '02 · Sentry', ['A hardware', '*watchdog*'], C.err),
      c.A(k('milliseconds.'), L, 580, <Tag text="Quarantine in milliseconds" color={C.err} size={30} />),
      c.A(c.at + 20, L, 900, <Source text="NVIDIA TECHNICAL BLOG · SENTRY ON BLUEFIELD-4" />),
    ],
  }));
  beat(k('CEO'), (c) => ({
    items: [c.o('slabs', 1400, 560, 460, c.at, {p: between(k('"full-stack'), k('up.', 2), 0.2, 1)})],
    ui: [c.A(k('"full-stack'), L, 300, <Quote text="Full-stack engineering." who="Jensen Huang · CEO, Nvidia" width={700} size={64} />), c.A(k('chip'), 1400, 880, <Tag text="from the chip level up" mono size={22} />, {center: true})],
  }));
  const names: [string, string, number][] = [
    ['Anthropic,', 'Anthropic', 1],
    ['Microsoft,', 'Microsoft', 1],
    ['Cisco,', 'Cisco', 1],
    ['Palantir,', 'Palantir', 1],
    ['Salesforce,', 'Salesforce', 1],
    ['JPMorgan', 'JPMorgan Chase', 1],
    ['SpaceX', 'SpaceX AI', 1],
  ];
  beat(k('more'), (c) => ({
    items: [c.o('tokens', 1330, 540, 168, c.at, {p: between(c.at, c.at + 60, 0, 1), shadow: false}), c.o('shield', 1330, 540, 240, c.at + 10, {mood: 'ok', p: 1})],
    ui: [
      c.A(c.at, L, 220, <Counter to={100} at={c.at} dur={40} suffix="+" size={220} />),
      c.A(c.at + 10, L + 6, 450, <Small size={34} color={C.text1}>organizations on board</Small>),
      c.A(k('Anthropic,'), L, 540, (
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, width: 720}}>
          {names.map(([w, label]) => (
            <NameTag key={label} at={k(w)} label={label} />
          ))}
        </div>
      )),
      c.A(c.at + 20, L, 900, <Source text="NVIDIA NEWSROOM · PARTNER LIST" />),
    ],
  }));
  beat(k("Anthropic's"), (c) => ({
    items: [c.o('chip', 1120, 560, 320, c.at, {mood: 'ok'}), c.o('network', 1600, 540, 320, k('software.'), {mood: 'ok', p: between(k('software.'), k('software.') + 30, 0, 1)})],
    ui: [
      ...text(c, "Anthropic's CCO", ['Another layer of', '*governance*'], C.ok, 80),
      c.A(k('hardware') + 6, 1120, 760, <Tag text="Hardware" />, {center: true}),
      c.A(k('software.') + 6, 1600, 760, <Tag text="Software" />, {center: true}),
    ],
  }));
  beat(k('When'), (c) => ({
    items: [c.o('tokens', 1330, 540, 168, c.at, {p: 1, shadow: false}), c.o('shield', 1330, 540, 300, c.at, {mood: 'ok', p: 1})],
    ui: [...text(c, 'Day one', ['The problem', 'is *real*'], C.ok)],
  }));
}

const NameTag: React.FC<{at: number; label: string}> = ({at, label}) => (
  <Appear at={at} out={1e9} rise={16} style={{position: 'relative'}}>
    <Tag text={label} size={26} />
  </Appear>
);

// ============================== S2 · OPENAI ==============================
{
  const k = (w: string, n = 1) => cue('s2', w, n);
  beat(sectionStart('s2'), (c) => ({
    ui: [
      ...text(c, 'OpenAI', ['Training,', '*paused*'], C.warn),
      c.A(k('paused'), 1070, 850, <Progress label="TRAINING" at={c.at} stopAt={k('paused')} to={0.64} />),
      c.A(c.at + 20, L, 900, <Source text="NBC NEWS · DECRYPT · 26 SEP 2026" />),
    ],
  }));
  beat(k('after'), (c) => ({
    items: [
      c.o('building', 980, 600, 205, k('Census')),
      c.o('building', 1320, 600, 205, k('S.E.C.,')),
      c.o('building', 1660, 600, 205, k('Education')),
      c.o('orb', 1000, 330, 110, k('autonomously'), {mood: 'warn', seed: 3, path: (f) => [340 + Math.sin((f - k('autonomously')) / 20) * 340, Math.sin((f - k('autonomously')) / 7) * 20]}),
    ],
    ui: [
      ...text(c, 'U.S. government sites', ['Uninvited', '*visitors*'], C.warn),
      c.A(k('Census') + 6, 980, 760, <Tag text="Census Bureau" size={24} />, {center: true}),
      c.A(k('S.E.C.,') + 6, 1320, 760, <Tag text="SEC" size={24} />, {center: true}),
      c.A(k('Education') + 6, 1660, 760, <Tag text="Education Dept." size={24} />, {center: true}),
    ],
  }));
  beat(k('OpenAI', 2), (c) => {
    const up = k('pulled');
    const go = k('Census', 2);
    return {
      items: [
        c.o('repo', 1080, 690, 300, c.at, {p: between(k('GitHub'), k('GitHub') + 14, 0, 1)}),
        c.o('key', 1080, 640, 190, k('keys'), {path: (f) => {
          const a = Math.min(1, Math.max(0, (f - up) / 16));
          const b = Math.min(1, Math.max(0, (f - go) / 22));
          const ea = 1 - Math.pow(1 - a, 3);
          const eb = b * b * (3 - 2 * b);
          return [eb * 470, -ea * 260 + eb * 60];
        }, shadow: false}),
        c.o('building', 1650, 580, 320, k('Census', 2)),
      ],
      ui: [
        ...text(c, 'What happened', ['Keys from', '*public* code'], C.warn),
        c.A(k('GitHub') + 4, 1080, 880, <Tag text="Public GitHub repos" mono size={22} />, {center: true}),
        c.A(k('API,'), 1650, 800, <Tag text="Census data API" mono size={22} />, {center: true}),
      ],
    };
  });
  beat(k('separately'), (c) => ({
    items: [
      c.o('building', 1060, 580, 300, c.at),
      ...[0, 1, 2].map((i) =>
        c.o('paper', 1060, 520, 170, k('copied') + i * 5, {seed: i, shadow: false, path: (f) => {
          const t = Math.min(1, Math.max(0, (f - k('reposted') - i * 5) / 20));
          const e = t * t * (3 - 2 * t);
          return [e * (560 + i * 60), -e * 120 + i * 40 - 60 + Math.sin(e * Math.PI) * -120];
        }}),
      ),
    ],
    ui: [
      ...text(c, 'SEC.gov', ['Copied, then', '*reposted*'], C.warn),
      c.A(c.at + 6, 1060, 780, <Tag text="SEC.gov · public material" mono size={22} />, {center: true}),
    ],
  }));
  beat(cueNear('s2', 'To', 32.6), (c) => ({
    items: [c.o('lock', 1360, 540, 380, c.at, {mood: 'ok', p: 0})],
    ui: [
      ...text(c, 'To be clear', ['Public data,', 'not a *breach*'], C.ok),
      c.A(k('confirmed', 2), L, 560, <Small size={32} width={640}>SEC and Commerce Dept.: no private or nonpublic data exposed</Small>),
      c.A(c.at + 20, L, 900, <Source text="SEC · COMMERCE DEPT. VIA DECRYPT" />),
    ],
  }));
  beat(k('There'), (c) => {
    const hit = k('failed.');
    return {
      items: [
        c.o('building', 1580, 580, 360, c.at),
        c.o('orb', 1060, 500, 170, k('attempt'), {mood: moodAt(hit, 'warn', 'err'), seed: 8, path: (f) => {
          const go = Math.min(1, Math.max(0, (f - k('attempt')) / 30));
          const back = Math.min(1, Math.max(0, (f - hit) / 10));
          return [go * 300 - back * 220, 0];
        }}),
      ],
      ui: [
        ...text(c, 'Education Dept.', ['An attempt', 'that *failed*'], C.err),
        c.A(k('civil'), 1580, 800, <Tag text="Civil rights office" size={24} />, {center: true}),
        c.A(hit, 1360, 470, <XMark at={hit} size={140} />),
      ],
    };
  });
  beat(k("OpenAI's"), (c) => ({
    items: [c.o('building', 1520, 600, 330, c.at), c.o('orb', 1700, 330, 150, c.at + 6, {mood: 'azure', seed: 11})],
    ui: [
      c.A(c.at, L, K_TOP - 20, <Kicker text="OpenAI's explanation" color={C.warn} />),
      c.A(k('"often'), L, 330, <Quote text="…often turn to government sites as authoritative sources of public information." who="OpenAI" width={820} size={46} />),
      c.A(k('helpful'), 1520, 820, <Tag text="Trying to help. Overstepped." size={24} />, {center: true}),
    ],
  }));
  beat(k('Around', 2), (c) => ({
    items: [c.o('orb', 1700, 300, 140, c.at, {mood: 'err', seed: 15}), ...[0, 1, 2, 3, 4, 5].map((i) =>
      c.o('photo', 1330 + (i - 2.5) * 70, 520 + ((i % 2) - 0.5) * 60, 230, k('fifty-three') + i * 3, {seed: i, shadow: false, drift: 0.4, path: (f) => {
        const t = Math.max(0, (f - k('posting')) / 60);
        const e = Math.min(1, t);
        return [(i - 2.5) * 110 * e, -e * (120 + i * 30) + (i % 2) * 40 * e];
      }}),
    )],
    ui: [
      c.A(c.at, L, K_TOP, <Kicker text="Also disclosed" color={C.err} />),
      c.A(k('fifty-three'), L, H_TOP, <Counter to={53} at={k('fifty-three')} dur={20} size={240} />),
      c.A(k('images'), L + 6, H_TOP + 240, <Small size={36} color={C.text1}>private images from ChatGPT users</Small>),
      c.A(k('posting'), L, 700, <Tag text="posted to third-party hosting sites" color={C.err} size={26} />),
      c.A(c.at + 20, L, 900, <Source text="FORTUNE · 25 SEP · PETAPIXEL · 28 SEP" />),
    ],
  }));
  beat(k('reportedly', 2), (c) => ({
    items: [c.o('chain', 1360, 540, 380, c.at)],
    ui: [
      c.A(c.at, L, K_TOP, <Kicker text="Reportedly" color={C.warn} />),
      c.A(k('million'), L, H_TOP, <Counter to={1000000} at={k('million')} dur={30} prefix="~" size={170} />),
      c.A(k('links'), L + 6, H_TOP + 190, <Small size={34} width={640} color={C.text1}>links containing encoded user information</Small>),
    ],
  }));
  beat(k('OpenAI', 4), (c) => ({
    items: [0, 1, 2, 3].map((i) =>
      c.o('envelope', 1150, 540, 220, k('notified') + i * 4, {seed: i, shadow: false, path: (f) => {
        const t = Math.min(1, Math.max(0, (f - k('notified') - i * 4) / 26));
        const e = 1 - Math.pow(1 - t, 3);
        return [e * (300 + i * 110), e * (-220 + i * 150)];
      }}),
    ),
    ui: [...text(c, 'Notified', ['Dozens of', '*organizations*'], C.warn, 84), c.A(k('months.'), L, 560, <Small size={32} width={600}>A full review could take months</Small>)],
  }));
  beat(k('Training', 2), (c) => ({
    items: [c.o('pause', 1130, 540, 320, c.at), c.o('shield', 1560, 540, 360, k('safeguards.'), {mood: 'ok', p: between(k('safeguards.') + 6, k('safeguards.') + 26, 0, 1)})],
    ui: [...text(c, 'Still paused', ['Building in', '*safeguards*'], C.ok)],
  }));
  beat(k("It's", 2), (c) => ({
    items: [0, 1, 2].map((i) =>
      c.o('orb', 1150 + i * 260, 540, 180, c.at + i * 5, {mood: 'err', seed: 20 + i, path: (f) => [Math.sin(f / (9 + i * 3) + i) * 90, Math.cos(f / (7 + i * 2) + i * 2) * 80]}),
    ),
    ui: [...text(c, 'The lesson', ['Harder to', '*predict*'], C.err)],
  }));
}

// ============================== S3 · ELEVENLABS ==============================
{
  const k = (w: string, n = 1) => cue('s3', w, n);
  beat(sectionStart('s3'), (c) => ({
    ui: [
      ...text(c, 'ElevenLabs · Monday', ['Eleven v4 +', 'v4 *Turbo*'], C.ice100),
      c.A(k('models'), 1080, 850, <Wave w={520} h={120} seed={2} />),
      c.A(c.at + 20, L, 900, <Source text="ELEVENLABS BLOG · TECHCRUNCH · 28 SEP 2026" />),
    ],
  }));
  beat(k('The'), (c) => ({
    ui: [
      c.A(c.at, L, 190, <Kicker text="Emotional range" color={C.ice100} />),
      c.A(k('old'), L, 290, <OldTags strikeAt={k('you')} />),
      c.A(k('"said'), L, 420, <Direction text="said angrily, with a French accent" />),
      c.A(k('"whispered'), L, 590, <Direction text="whispered over light rain" />),
      c.A(k('interprets'), 1080, 850, <Wave w={520} h={120} seed={5} />),
      <Rain key="rain" at={k('"whispered')} out={k('Both') - 6} />,
    ],
  }));
  const hello = ['Hola', 'Bonjour', 'Ciao', 'Olá', 'Hallo', 'Merhaba'];
  beat(k('Both'), (c) => ({
    items: [c.o('globe', 1400, 540, 440, c.at)],
    ui: [
      c.A(k('ninety'), L, 250, <Counter to={90} at={k('ninety')} dur={20} suffix="+" size={220} />),
      c.A(k('languages,'), L + 6, 480, <Small size={36} color={C.text1} width={560}>languages, with a natural native accent</Small>),
      ...hello.map((w, i) => {
        const a = (i / hello.length) * Math.PI * 2 - 1.2;
        return c.A(k('speak') + i * 5, 1400 + Math.cos(a) * 360, 540 + Math.sin(a) * 300 - 22, <Tag text={w} size={26} />, {center: true});
      }),
    ],
  }));
  beat(k('Voice', 2), (c) => ({
    items: [c.o('stopwatch', 1030, 540, 340, c.at, {mood: 'ok', p: between(k('ten'), k('ten') + 45, 0, 1)})],
    ui: [
      c.A(c.at, L, K_TOP, <Kicker text="Voice cloning" color={C.ice100} />),
      c.A(k('ten'), L, H_TOP, <Counter to={10} at={k('ten')} dur={20} prefix="~" suffix=" s" size={200} />),
      c.A(k('audio,'), L + 6, H_TOP + 210, <Small size={32} color={C.text1} width={420}>of sample audio</Small>),
      c.A(k('sample'), 1320, 360, <Wave w={440} h={110} seed={8} label="sample · 10 s" />),
      c.A(k('clone'), 1320, 580, <Wave w={440} h={110} seed={8} color={C.ok} label="clone" />),
      c.A(k('verified'), 1320, 760, <Tag text="Verified consent required" color={C.ok} size={26} />),
    ],
  }));
  beat(cueNear('s3', 'The', 50.4), (c) => ({
    items: [c.o('phone', 1360, 540, 440, c.at, {mood: 'ok'})],
    ui: [
      c.A(k('phone'), 1360, 540, <Rings at={k('phone')} color={C.ok} size={640} />),
      c.A(c.at, L, K_TOP, <Kicker text="v4 Turbo · real time" color={C.ice100} />),
      c.A(k('tenth'), L, H_TOP, <Counter to={100} at={k('tenth')} dur={18} prefix="~" suffix=" ms" size={190} />),
      c.A(k('second.'), L + 6, H_TOP + 200, <Small size={32} color={C.text1} width={520}>median response time, for voice agents on calls</Small>),
    ],
  }));
  beat(k('If'), (c) => ({
    items: [c.o('mic', 1560, 520, 400, c.at, {mood: 'ok'})],
    ui: [
      ...text(c, 'The gap', ['Closing the', '*robotic* gap'], C.ice100),
      c.A(k('robotic-sounding'), L, 600, <MorphWave from={k('upgrade', 2)} />),
    ],
  }));
}

const OldTags: React.FC<{strikeAt: number}> = ({strikeAt}) => (
  <div style={{display: 'flex', gap: 12, position: 'relative'}}>
    {['<pitch +2>', '<rate 0.9>', '<emphasis>'].map((t) => (
      <div key={t} style={{fontFamily: F.mono, fontSize: 26, color: C.text2, padding: '10px 18px', borderRadius: 12, border: `1px dashed ${C.rim}`, background: C.glassSheet}}>
        {t}
      </div>
    ))}
    <Strike at={strikeAt} />
  </div>
);
const Strike: React.FC<{at: number}> = ({at}) => (
  <Appear at={at} out={1e9} rise={0} style={{left: -10, right: -10, top: 26, height: 4, background: C.err, borderRadius: 2}}>
    <span />
  </Appear>
);
const Direction: React.FC<{text: string}> = ({text: t}) => (
  <div style={{background: C.glassSheet, border: `1px solid ${C.rim}`, borderRadius: 24, padding: '22px 34px', boxShadow: '0 24px 60px rgba(2,14,48,.35), inset 0 1px 0 rgba(255,255,255,.3)'}}>
    <span style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 50, color: C.text1}}>“{t}”</span>
  </div>
);
const MorphWave: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame();
  const s = Math.min(1, Math.max(0, (f - from) / 24));
  return <Wave w={720} h={150} smooth={s} seed={4} color={s > 0.5 ? C.ok : C.frost} label={s > 0.5 ? 'natural' : 'robotic'} />;
};

// ============================== S4 · INSTINCT ==============================
{
  const k = (w: string, n = 1) => cue('s4', w, n);
  beat(sectionStart('s4'), (c) => ({
    ui: [...text(c, 'The money story', ['Instinct', '*raises*'], C.warn)],
  }));
  beat(k('Instinct'), (c) => ({
    items: [
      c.o('orb', 1400, 250, 130, c.at, {mood: 'ok', seed: 16}),
      c.o('ticket', 1060, 500, 230, k('booking')),
      c.o('table', 1400, 520, 230, k('reservations,'), {p: 1}),
      c.o('card', 1740, 500, 230, k('bills')),
    ],
    ui: [
      ...text(c, 'Instinct · personal agent', ['An agent for', '*everyday* tasks'], C.warn, 80),
      c.A(k('booking') + 6, 1060, 700, <Tag text="Travel" />, {center: true}),
      c.A(k('reservations,') + 6, 1400, 700, <Tag text="Reservations" />, {center: true}),
      c.A(k('bills') + 6, 1740, 700, <Tag text="Bills" />, {center: true}),
    ],
  }));
  beat(k('just'), (c) => ({
    items: [c.o('coins', 1400, 580, 460, c.at, {p: between(c.at, k('billion') + 20, 0, 1), seed: 3})],
    ui: [
      c.A(c.at, L, K_TOP, <Kicker text="Series C" color={C.warn} />),
      c.A(k('billion'), L, H_TOP, <Counter to={1} at={k('billion')} dur={14} prefix="$" suffix="B" size={220} />),
      c.A(k('Sequoia'), L, 600, <Tag text="Sequoia Capital" size={26} />),
      c.A(k('Benchmark,'), L + 280, 600, <Tag text="Benchmark" size={26} />),
      c.A(k('Coatue.'), L + 500, 600, <Tag text="Coatue" size={26} />),
      c.A(c.at + 20, L, 900, <Source text="BUSINESSWIRE · TECHCRUNCH · 28 SEP 2026" />),
    ],
  }));
  beat(cueNear('s4', 'That', 18.3), (c) => ({
    items: [
      c.o('bar', 1560, 560, 520, k('ten'), {mood: 'warn', p: between(k('ten'), k('ten') + 24, 0, 1), drift: 0.2}),
      c.o('bar', 1160, 560, 520, k('two-and-a-half-billion-dollar'), {p: between(k('two-and-a-half-billion-dollar'), k('two-and-a-half-billion-dollar') + 18, 0, 0.25), drift: 0.2}),
    ],
    ui: [
      c.A(c.at, L, K_TOP, <Kicker text="Valuation" color={C.warn} />),
      c.A(k('ten') + 10, 1560, 215, <Tag text="$10B · Sep" color={C.warn} size={28} />, {center: true}),
      c.A(k('two-and-a-half-billion-dollar') + 10, 1160, 600, <Tag text="$2.5B · Aug" size={28} />, {center: true}),
      c.A(k('two-hundred-fifty-million-dollar'), L, 620, <Small size={30} width={560}>August: $250M Series B at $2.5B</Small>),
      c.A(k('quadrupled.'), L, H_TOP, <Counter to={4} at={k('quadrupled.')} dur={12} suffix="×" size={240} color={C.warn} />),
      c.A(c.at + 20, L, 900, <Source text="TECHCRUNCH · QUARTZ · 26 AUG / 28 SEP 2026" />),
    ],
  }));
  beat(cueNear('s4', 'The', 32.6), (c) => ({
    items: [c.o('orb', 1560, 520, 360, c.at, {mood: 'ok', seed: 12})],
    ui: [
      c.A(c.at, L, K_TOP - 20, <Kicker text="Founder" color={C.warn} />),
      c.A(cueNear('s4', '"the', 36.1), L, 330, <Quote text="The best personal agent that can handle the deeply personal nuances of everyday life." who="Noah Shinn · Founder, Instinct" width={860} size={46} />),
    ],
  }));
  beat(k('Instinct', 3), (c) => ({
    items: [
      c.o('phone', 1100, 540, 380, k('concierge'), {mood: 'ok'}),
      c.o('network', 1620, 520, 380, k('"trusted'), {mood: 'ok', p: between(k('"trusted'), k('agents.'), 0, 1)}),
    ],
    ui: [
      c.A(c.at, L, K_TOP, <Kicker text="New features" color={C.warn} />),
      c.A(k('phone'), 1100, 540, <Rings at={k('phone')} color={C.ok} size={520} />),
      c.A(k('calls') + 4, 1100, 800, <Tag text="Concierge phone calls" size={24} />, {center: true}),
      c.A(k('network"') + 4, 1620, 800, <Tag text="Trusted person network" size={24} />, {center: true}),
    ],
  }));
  beat(k("It's"), (c) => ({
    items: Array.from({length: 7}).map((_, i) =>
      c.o('coin', 1000 + i * 130, 540, 150, c.at + i * 4, {seed: i, shadow: false, path: (f) => [0, Math.sin((f - c.at) / 12 + i) * 30 + (i % 2) * 90 - 45]}),
    ),
    ui: [...text(c, 'Investors', ['Money is', '*chasing* agents'], C.warn)],
  }));
  beat(k('head-to-head'), (c) => ({
    items: [c.o('orb', 1130, 540, 320, c.at, {mood: 'ok', seed: 13}), c.o('orb', 1690, 540, 320, k('Muse,') - 12, {mood: 'azure', seed: 14})],
    ui: [
      ...text(c, 'Rivals', ['Head', 'to *head*'], C.warn),
      c.A(c.at + 6, 1130, 760, <Tag text="Instinct" color={C.ok} />, {center: true}),
      c.A(k('Muse,') - 6, 1690, 760, <Tag text="Meta · Muse" color={C.ice100} />, {center: true}),
      c.A(k("Meta's"), 1410, 520, <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 90, color: C.text1}}>vs</div>, {center: true}),
      c.A(c.at + 20, L, 900, <Source text="AXIOS · 20 SEP 2026" />),
    ],
  }));
}

// ============================== S5 · WASHINGTON ==============================
{
  const k = (w: string, n = 1) => cue('s5', w, n);
  beat(sectionStart('s5'), (c) => ({
    ui: [...text(c, 'Policy', ['Washington is', '*watching*'], C.ice100)],
  }));
  beat(cueNear('s5', 'This', 5.5), (c) => ({
    items: [c.o('siren', 1360, 540, 380, c.at, {mood: 'warn'})],
    ui: [
      ...text(c, 'Associated Press', ['Sounding the', '*alarm*'], C.warn),
      c.A(k('OpenAI'), 1080, 800, <Tag text="OpenAI" size={26} />, {center: true}),
      c.A(k('Anthropic'), 1640, 800, <Tag text="Anthropic" size={26} />, {center: true}),
      c.A(k('shape'), L, 560, <Small size={32} width={600}>…while pushing to shape what regulation looks like</Small>),
      c.A(c.at + 20, L, 900, <Source text="ASSOCIATED PRESS · 27 SEP 2026" />),
    ],
  }));
  beat(k('Anthropic', 2), (c) => ({
    items: [c.o('chip', 1320, 640, 320, c.at, {mood: 'azure'}), c.o('magnifier', 1500, 440, 320, k('testing'))],
    ui: [
      ...text(c, 'The CEOs', ['Test it', '*before* release'], C.ice100),
      c.A(k('Dario'), L, 560, <Tag text="Dario Amodei · Anthropic" size={26} />),
      c.A(k('Sam'), L, 640, <Tag text="Sam Altman · OpenAI" size={26} />),
    ],
  }));
  beat(k('notably,'), (c) => ({
    items: [c.o('paper', 1180, 540, 380, k('engineer'), {seed: 4}), c.o('pause', 1600, 560, 280, k('pause'))],
    ui: [...text(c, 'This month', ['An engineer', '*quits*'], C.warn), c.A(k('pause'), L, 560, <Small size={32} width={600}>calling for a pause on superhuman systems</Small>)],
  }));
  beat(k('But'), (c) => ({
    items: [c.o('hourglass', 1360, 540, 440, c.at, {p: between(c.at, k('One'), 0.2, 0.8)})],
    ui: [...text(c, 'The wrinkle', ['Skeptical of', 'the *timing*'], C.warn)],
  }));
  beat(k('One'), (c) => {
    const flip = k('right');
    return {
      items: [c.o('scale', 1360, 560, 520, c.at, {p: (f) => (f < flip ? -0.7 + 0.1 * Math.sin(f / 15) : -0.7 + 1.4 * Math.min(1, (f - flip) / 16)), drift: 0.2})],
      ui: [
        c.A(c.at, L, K_TOP, <Kicker text="Former OpenAI policy lead" color={C.warn} />),
        c.A(k('existential'), 1040, 330, <Tag text="Existential risk" size={26} />, {center: true}),
        c.A(k('right'), 1680, 330, <Tag text="Problems right now" color={C.err} size={26} />, {center: true}),
        c.A(k('photos'), 1680, 860, <Tag text="Leaked photos" size={22} mono />, {center: true}),
        c.A(k('databases.'), 1680, 930, <Tag text="Government databases" size={22} mono />, {center: true}),
        c.A(c.at + 4, L, H_TOP, <Headline lines={['What gets', '*distracted*?']} at={c.at + 4} size={84} />),
      ],
    };
  });
  beat(k("It's"), (c) => ({
    items: [c.o('siren', 1120, 540, 300, c.at, {mood: 'warn'}), c.o('gavel', 1640, 560, 320, k('rules'), {p: between(k('rules'), k('rules') + 12, 0, 1)})],
    ui: [
      ...text(c, 'The tension', ['Worried, or', 'shaping the *rules*?'], C.warn, 80),
      c.A(k('worried,'), 1120, 770, <Tag text="Worried" size={26} />, {center: true}),
      c.A(k('rules') + 6, 1640, 770, <Tag text="Shaping the rules" size={26} />, {center: true}),
      c.A(k('public?', 2), L, 600, <Tag text="…right before some go public?" size={26} />),
    ],
  }));
  beat(cueNear('s5', 'That', 74.5), (c) => ({
    items: [c.o('calendar', 1130, 520, 360, c.at), c.o('building', 1620, 580, 340, k('White'), {mood: 'frost'})],
    ui: [
      c.A(k('September'), 1130, 505, <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: 110, color: C.cobalt800, letterSpacing: '-0.05em', lineHeight: 1}}>29</div>, {center: true}),
      c.A(k('September') + 3, 1130, 612, <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 24, color: C.cobalt600, letterSpacing: '0.2em'}}>SEP 2026</div>, {center: true}),
      ...text(c, 'Today', ['At the White', '*House*'], C.ice100),
      c.A(k('Trump'), L, 560, <Tag text="President Trump" size={26} />),
      c.A(k('Johnson'), L, 640, <Tag text="Speaker Mike Johnson" size={26} />),
      c.A(k('White') + 6, 1620, 800, <Tag text="White House · AI executives" size={24} />, {center: true}),
    ],
  }));
  beat(k('reportedly'), (c) => ({
    items: [c.o('table', 1360, 600, 520, c.at, {p: between(k('Sam', 2), k('Hassabis.'), 0.34, 1)})],
    ui: [
      c.A(c.at, L, K_TOP, <Kicker text="Reportedly attending" color={C.warn} />),
      c.A(k('Sam', 2), L, 360, <Tag text="Sam Altman · OpenAI" size={28} />),
      c.A(k('Dario', 2), L, 450, <Tag text="Dario Amodei · Anthropic" size={28} />),
      c.A(k('Demis'), L, 540, <Tag text="Demis Hassabis · Google DeepMind" size={28} />),
      c.A(c.at + 20, L, 900, <Source text="AXIOS · ABC NEWS · UNCONFIRMED BY COMPANIES" />),
    ],
  }));
  beat(cueNear('s5', 'The', 92.9), (c) => ({
    items: [
      c.o('gavel', 1000, 520, 250, k('regulation,', 2), {p: between(k('regulation,', 2), k('regulation,', 2) + 12, 0, 1)}),
      c.o('shield', 1340, 520, 250, k('safety', 2), {mood: 'ok', p: between(k('safety', 2), k('safety', 2) + 20, 0, 1)}),
      c.o('globe', 1680, 520, 250, k('ahead')),
    ],
    ui: [
      c.A(c.at, L, K_TOP, <Kicker text="On the agenda" color={C.ice100} />),
      c.A(k('regulation,', 2) + 6, 1000, 720, <Tag text="Regulation" size={26} />, {center: true}),
      c.A(k('guardrails,'), 1340, 720, <Tag text="Safety guardrails" size={26} />, {center: true}),
      c.A(k('China.'), 1680, 720, <Tag text="Staying ahead of China" size={26} />, {center: true}),
    ],
  }));
  beat(k('Trump', 2), (c) => ({
    items: [c.o('globe', 1560, 540, 400, c.at)],
    ui: [
      c.A(c.at, L, K_TOP - 20, <Kicker text="At the UN · 23 Sep" color={C.warn} />),
      c.A(k('"globalist'), L, 340, <Quote text="A globalist scheme." who="President Trump, on international AI oversight" width={780} size={64} />),
      c.A(c.at + 20, L, 900, <Source text="FORTUNE · SCIENTIFIC AMERICAN · 23 SEP 2026" />),
    ],
  }));
  beat(k('so'), (c) => {
    const bang = k('flashpoint');
    return {
      items: [
        c.o('rocket', 1100, 520, 320, c.at, {path: (f) => [Math.min(1, Math.max(0, (f - c.at) / Math.max(1, bang - c.at))) * 180, 0]}),
        c.o('barrier', 1600, 580, 250, c.at + 6),
      ],
      ui: [
        ...text(c, 'Build fast vs guardrails', ['A real', '*flashpoint*'], C.err),
        <Flash key="flash" at={bang} />,
        c.A(k('build-fast'), 1100, 780, <Tag text="Build fast" size={26} />, {center: true}),
        c.A(k('guardrails.', 2), 1600, 780, <Tag text="Guardrails" size={26} />, {center: true}),
        c.A(k('Definitely'), L, 580, <Small size={34} color={C.text1}>One to watch.</Small>),
      ],
    };
  });
}

// ============================== OUTRO ==============================
{
  const k = (w: string, n = 1) => cue('outro', w, n);
  const row: [ObjKind, string, string][] = [
    ['shield', 'Nvidia', 'Nvidia'],
    ['pause', 'OpenAI', 'OpenAI'],
    ['mic', 'ElevenLabs', 'ElevenLabs'],
    ['coins', 'Instinct', 'Instinct'],
    ['capitol', 'Washington', 'Washington'],
  ];
  beat(sectionStart('outro'), (c) => ({
    items: row.map(([obj, w], i) => c.o(obj, 330 + i * 315, 500, 210, k(w), {seed: i, mood: 'ok', p: 1})),
    ui: [c.A(c.at, 960, 170, <Kicker text="Today's roundup" />, {center: true}), ...row.map(([, w, label], i) => c.A(k(w) + 6, 330 + i * 315, 650, <Tag text={label} size={24} />, {center: true}))],
  }));
  beat(k('If'), (c) => ({
    items: [c.o('bell', 1500, 520, 360, k('subscribe'))],
    ui: [
      c.A(c.at, L, 280, <Press at={k('like')} label="Like" icon="like" />),
      c.A(k('subscribe') - 4, L, 420, <Press at={k('subscribe')} label="Subscribe" icon="sub" />),
      c.A(k('comments') - 4, L, 560, <Press at={k('comments') + 4} label="Which story next?" icon="chat" />),
    ],
  }));
  beat(k('Thanks'), (c) => ({
    items: [c.o('orb', 960, 420, 300, c.at, {mood: 'ok', seed: 30})],
    ui: [c.A(c.at + 4, 960, 650, <Headline lines={['See you in the', '*next one*']} at={c.at + 4} size={96} />, {center: true})],
  }));
}

// ============================== finalize ==============================
defs.sort((a, b) => a.at - b.at);
export const ITEMS: Item[] = [];
export const UI: {at: number; out: number; node: React.ReactNode}[] = [];
export const SFX: Sfx[] = [];
let key = 0;
defs.forEach((d, i) => {
  const next = defs[i + 1]?.at ?? Math.round(blockOf('end').start * 30);
  const out = next - 6;
  const ctx: Ctx = {
    at: d.at,
    out,
    o: (obj, x, y, size, at = d.at, extra = {}) => ({obj, x, y, size, at, out, ...extra}),
    A: (at, left, top, node, opts = {}) => (
      <Appear key={`ui${key++}`} at={at} out={opts.out ?? out} from={opts.from} style={{left, top}}>
        {opts.center ? <div style={{transform: 'translateX(-50%)'}}>{node}</div> : node}
      </Appear>
    ),
  };
  const b = d.build(ctx);
  ITEMS.push(...(b.items ?? []));
  UI.push({at: d.at, out: out + 12, node: <React.Fragment key={`b${i}`}>{b.ui}</React.Fragment>});
  SFX.push({at: d.at, file: d.impact ? 'impact' : 'whoosh', vol: d.impact ? 0.5 : 0.28});
});
