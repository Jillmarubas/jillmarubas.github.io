import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, F} from './design';
import {Logo3D} from './Logo3D';
import {Place3D} from './Places';
import {Arrow, Circle, Counter, Hand, Highlight, Kicker, Paper, Photo, Piece, Source, Stamp, clamp, e01, settle, useL, useScene} from './kit';
import {Bell, CalPage, Clipping, Doc, Door, Folder, Magnifier, MoneyPile, Scale, Shield, Sticky, Tape0} from './props';

/* =================================================================== HOOK */

/** "Washington just launched an investigation into OpenAI and Anthropic" */
export const H0: React.FC = () => {
  const L = useL();
  const sc = useScene();
  return (
    <AbsoluteFill>
      <Piece x={760} y={560} at={0} from="none" shadow={false}>
        <div style={{width: 1500, height: 1000}}>
          <Place3D which="ftc" w={1500} h={1000} at={0} dur={sc.dur} orbit={18} push={2} />
        </div>
      </Piece>
      <Piece x={170} y={110} at={6} from="none" shadow={false}>
        <Kicker text="Washington, D.C." at={6} />
      </Piece>
      <Piece x={1560} y={560} at={L(0) + 14} from="r" rot={4}>
        <Magnifier size={330}>
          <div style={{display: 'flex', gap: 0}}>
            <Logo3D name="openai" w={150} h={150} at={L(0) + 20} fit={0.8} />
            <Logo3D name="anthropic" w={150} h={150} at={L(0) + 26} fit={0.8} />
          </div>
        </Magnifier>
      </Piece>
    </AbsoluteFill>
  );
};

/** "six AI giants signed a safety pact with the White House" */
export const H1: React.FC = () => {
  const L = useL();
  const sc = useScene();
  const logos = ['anthropic', 'openai', 'google', 'meta', 'xai', 'nvidia'];
  return (
    <AbsoluteFill>
      <Piece x={760} y={470} at={0} from="none" shadow={false}>
        <div style={{width: 1400, height: 860}}>
          <Place3D which="whitehouse" w={1400} h={860} at={0} dur={sc.dur} orbit={10} push={3} cam={[0, 12, 36]} />
        </div>
      </Piece>
      <Piece x={1570} y={560} at={L(0) + 10} from="r" rot={3}>
        <Doc w={440} h={600} title="Safety pact" sub="Sep 29, 2026 · The White House" lines={9} seed="pact">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 110px)', gap: 12, marginTop: 6}}>
            {logos.map((n, i) => (
              <Logo3D key={n} name={n} w={110} h={110} at={L(0) + 18 + i * 5} fit={n === 'meta' ? 0.95 : 0.72} />
            ))}
          </div>
        </Doc>
      </Piece>
    </AbsoluteFill>
  );
};

/** "Google says it's got a model that beats GPT" */
export const H2: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const tip = interpolate(f, [L(0) + 10, L(0) + 34], [0, -1], {...clamp, easing: (x) => settle(x)}); // Google's side drops: it outweighs
  return (
    <AbsoluteFill>
      <Piece x={960} y={560} at={0} from="b" rot={-1}>
        <Scale
          w={900}
          tip={tip}
          left={<Logo3D name="google" w={210} h={210} at={2} fit={0.8} />}
          right={<Logo3D name="openai" w={210} h={210} at={6} fit={0.8} />}
        />
      </Piece>
    </AbsoluteFill>
  );
};

/** "and OpenAI is reportedly trying to raise thirty billion dollars while quietly delaying its IPO" */
export const H3: React.FC = () => {
  const L = useL();
  return (
    <AbsoluteFill>
      <Piece x={560} y={600} at={0} from="l" rot={-1} shadow={false}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
          <Counter to={30} at={4} dur={50} prefix="$" suffix="B" size={150} />
          <MoneyPile n={20} at={2} dur={50} cols={5} w={120} />
        </div>
      </Piece>
      <Piece x={1060} y={250} at={6} from="t" rot={4} shadow={false}>
        <Logo3D name="openai" w={220} h={220} at={6} fit={0.8} />
      </Piece>
      <Piece x={1460} y={560} at={L(0) + 56} from="r" rot={3}>
        <Bell w={300} ring={L(0) + 70} tag="IPO · POSTPONED" tagAt={L(0) + 80} />
      </Piece>
      <Source text="Bloomberg; Semafor" at={10} />
    </AbsoluteFill>
  );
};

/** "It has been a wild forty-eight hours in AI…" */
export const H4: React.FC = () => {
  const f = useCurrentFrame();
  const days: [string, number][] = [
    ['SEP', 29],
    ['SEP', 30],
    ['OCT', 1],
  ];
  return (
    <AbsoluteFill>
      {days.map(([m, d], i) => (
        <Piece key={i} x={560 + i * 400} y={500 + (i % 2) * 30} at={i * 12} from={i % 2 ? 't' : 'b'} rot={[-6, 3, -2][i]}>
          <CalPage month={m} day={d} year="2026" w={300} mark={i === 2} markAt={40} />
        </Piece>
      ))}
      <Piece x={960} y={880} at={44} from="none" shadow={false}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 120, color: C.ink, opacity: e01(f, 44, 10)}}>
          48 <span style={{color: C.red}}>hours</span>
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

/* =================================================================== PREVIEW: seven folders */
const STORIES: {label: string; logo?: string; seal?: string; photos?: string[]; logo2?: string}[] = [
  {label: 'Gemini 4 "Argon"', logo: 'gemini'},
  {label: 'FTC investigation', seal: 'seal_ftc'},
  {label: 'White House accord', photos: ['amodei', 'brockman', 'pichai', 'zuckerberg', 'musk', 'huang']},
  {label: 'OpenAI vs Moonshot', logo: 'openai', logo2: 'kimi'},
  {label: 'Meta & taxes', logo: 'meta'},
  {label: '$30B & the IPO', logo: 'openai'},
  {label: 'DoorDash by text', logo: 'doordash'},
];
export const P0: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const pos = (i: number): [number, number] => [300 + (i % 4) * 440, i < 4 ? 330 : 760];
  return (
    <AbsoluteFill>
      {STORIES.map((s, i) => {
        const at = L(i) - 4;
        const [x, y] = pos(i);
        return (
          <Piece key={i} x={i < 4 ? x : x + 220} y={y} at={at} from={(['t', 'l', 'b', 'r'] as const)[i % 4]} rot={[-3, 2, -1, 3, -2, 1, -3][i]}>
            <Folder w={380} h={270} label={s.label} n={i + 1}>
              <div style={{position: 'absolute', right: 18, top: 16, display: 'flex', gap: 4}}>
                {s.logo && <Logo3D name={s.logo} w={s.logo === 'doordash' || s.logo === 'meta' ? 230 : 160} h={160} at={at + 6} fit={0.8} />}
                {s.logo2 && <Logo3D name={s.logo2} w={150} h={160} at={at + 10} fit={0.8} />}
                {s.seal && <Img src={staticFile(`news1001/logos/${s.seal}.svg`)} style={{width: 160, height: 160, opacity: e01(f, at + 6, 8)}} />}
                {s.photos && (
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 70px)', gap: 6, marginTop: 8}}>
                    {s.photos.map((p, k) => (
                      <Img key={p} src={staticFile(`news1001/people/${p}.jpg`)} style={{width: 70, height: 84, objectFit: 'cover', objectPosition: '50% 25%', border: `3px solid ${C.card}`, opacity: e01(f, at + 6 + k * 3, 6), filter: 'saturate(0.8)'}} />
                    ))}
                  </div>
                )}
              </div>
              {f >= L(7) + 10 + i * 4 && (
                <div style={{position: 'absolute', left: 110, top: 120}}>
                  <Stamp text="CONFIRMED" at={L(7) + 10 + i * 4} size={30} rot={-10 + (i % 3) * 4} />
                </div>
              )}
            </Folder>
          </Piece>
        );
      })}
    </AbsoluteFill>
  );
};

/* =================================================================== STORY 1: GEMINI 4 ARGON */

/** "So Google just dropped Gemini 4, codenamed Argon…" */
export const G0: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Piece x={700} y={540} at={0} from="none" shadow={false}>
        <Logo3D name="gemini" w={760} h={760} at={0} fit={0.82} spin={120} />
      </Piece>
      <Piece x={1380} y={520} at={14} from="r" rot={5}>
        <div style={{width: 300, height: 340, background: C.card, border: `6px solid ${C.ink}`, padding: 22, boxSizing: 'border-box', position: 'relative'}}>
          <div style={{fontFamily: F.mono, fontSize: 30, color: C.ink}}>18</div>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 150, color: C.ink, lineHeight: 1, marginTop: 4}}>Ar</div>
          <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 34, color: C.ink}}>Argon</div>
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink2, marginTop: 4}}>39.948</div>
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 60% 40%, rgba(160,120,255,${0.18 + 0.1 * Math.sin(f / 6)}), transparent 70%)`}} />
        </div>
      </Piece>
      <Piece x={1380} y={830} at={26} from="none" shadow={false}>
        <Hand text={'codename "Argon"'} at={26} size={58} color={C.red} />
      </Piece>
    </AbsoluteFill>
  );
};

/** Lines 1–2: cyber partners first, through a government pre-release program, then paying subscribers. */
export const G1: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const open = e01(f, L(1) + 50, 16);
  const crowd = Array.from({length: 9}, (_, i) => i);
  return (
    <AbsoluteFill>
      {/* the door: ajar for the security partners, then wide open for paying subscribers */}
      <Piece x={960} y={500} at={0} from="b">
        <Door w={330} open={Math.max(0.32 * Math.sin(Math.PI * e01(f, 14, 50)), open)} inside={<Logo3D name="gemini" w={220} h={220} at={6} fit={0.75} spin={0} />} />
      </Piece>
      {/* three cyber-defence partners pass through first */}
      {[0, 1, 2].map((i) => {
        const k = e01(f, 20 + i * 10, 26);
        return (
          <div key={i} style={{position: 'absolute', left: 300 + k * 560 + i * 20, top: 420 + i * 70, opacity: 1 - e01(f, 40 + i * 10, 8)}}>
            <Shield w={110} color={['#2F5D8A', '#3E6E52', '#6B4A8A'][i]} />
          </div>
        );
      })}
      {/* everyone else waits behind the rope */}
      <Piece x={430} y={830} at={10} from="l" shadow={false}>
        <svg width={520} height={190}>
          {crowd.map((i) => (
            <g key={i} transform={`translate(${30 + i * 52}, ${40 + (i % 2) * 14})`}>
              <circle cx={20} cy={20} r={18} fill="#8C857A" />
              <rect x={2} y={42} width={36} height={80} rx={14} fill="#8C857A" />
            </g>
          ))}
          <line x1={0} y1={110} x2={520} y2={110} stroke={C.red} strokeWidth={8} />
        </svg>
      </Piece>
      <Piece x={1510} y={300} at={L(1) + 4} from="r" rot={3}>
        <Doc w={420} h={300} title="Pre-release testing" sub="voluntary · U.S. government" lines={4} seed="pre" seal={<Img src={staticFile('news1001/logos/seal_potus.svg')} style={{width: 90, height: 90}} />} />
      </Piece>
      <Piece x={1500} y={760} at={L(1) + 34} from="r" rot={-4}>
        <div style={{width: 340, height: 210, borderRadius: 18, background: 'linear-gradient(135deg,#1F2A44,#3B4E7A)', position: 'relative', padding: 24, boxSizing: 'border-box'}}>
          <div style={{width: 56, height: 42, borderRadius: 8, background: '#C9A24A'}} />
          <div style={{position: 'absolute', bottom: 24, left: 24, fontFamily: F.mono, color: '#DDE3F0', fontSize: 22, letterSpacing: '0.1em'}}>•••• 2026</div>
          <div style={{position: 'absolute', right: 20, bottom: 14}}>
            <Logo3D name="google" w={90} h={90} at={L(1) + 40} fit={0.75} spin={0} />
          </div>
        </div>
      </Piece>
      <Piece x={1500} y={930} at={L(1) + 40} from="none" shadow={false}>
        <Kicker text="paying subscribers" at={L(1) + 40} />
      </Piece>
    </AbsoluteFill>
  );
};

/** Lines 3–4: long, complex work (code, law, finance, security); a long tape, not a sticky note. */
export const G2: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const len = interpolate(f, [L(1), L(1) + 80], [60, 860], {...clamp, easing: (x) => settle(x)});
  const items = [
    {x: 330, y: 330, el: <CodeSheet />, at: 6},
    {x: 760, y: 300, el: <LawBook />, at: 22},
    {x: 330, y: 760, el: <Ledger />, at: 40},
    {x: 760, y: 760, el: <Lock />, at: 60},
  ];
  return (
    <AbsoluteFill>
      {items.map((it, i) => (
        <Piece key={i} x={it.x} y={it.y} at={it.at} from={(['l', 't', 'b', 'r'] as const)[i]} rot={[-4, 3, 2, -3][i]}>
          {it.el}
        </Piece>
      ))}
      <Piece x={1340} y={100 + len / 2} at={L(1) - 4} from="t" rot={-2}>
        <Tape0 len={len} w={180} seed="long" />
      </Piece>
      <Piece x={1700} y={540} at={L(1) + 30} from="r" rot={6}>
        <Sticky w={190} text="quick Q?" rot={0} />
      </Piece>
      {f > L(1) + 50 && (
        <div style={{position: 'absolute', left: 1610, top: 440, width: 190, height: 190}}>
          <svg width={190} height={190} style={{position: 'absolute'}}>
            <line x1={10} y1={10} x2={180} y2={180} stroke={C.red} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e01(f, L(1) + 50, 8)} />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
const CodeSheet: React.FC = () => (
  <div style={{width: 340, height: 260, background: '#1E2227', padding: 22, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12}}>
    {[0.6, 0.85, 0.4, 0.75, 0.55, 0.9, 0.35].map((w, i) => (
      <div key={i} style={{display: 'flex', gap: 10, marginLeft: (i % 3) * 24}}>
        <div style={{height: 10, width: `${w * 50}%`, background: ['#C678DD', '#61AFEF', '#98C379', '#E5C07B'][i % 4], borderRadius: 3}} />
        <div style={{height: 10, width: `${(1 - w) * 40}%`, background: '#5C6370', borderRadius: 3}} />
      </div>
    ))}
  </div>
);
const LawBook: React.FC = () => (
  <svg width={320} height={250} viewBox="0 0 320 250">
    <rect x={10} y={20} width={300} height={210} rx={6} fill="#6B1F1F" />
    <rect x={10} y={20} width={40} height={210} fill="#4E1515" />
    <rect x={90} y={60} width={180} height={50} fill="none" stroke="#C9A24A" strokeWidth={3} />
    <rect x={110} y={140} width={140} height={6} fill="#C9A24A" />
    <rect x={130} y={160} width={100} height={6} fill="#C9A24A" />
    <path d="M150 190 h60 M180 180 v20" stroke="#C9A24A" strokeWidth={4} />
  </svg>
);
const Ledger: React.FC = () => (
  <div style={{width: 330, height: 250, background: '#F4F1E6', padding: 18, boxSizing: 'border-box', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 27px, rgba(47,93,138,0.25) 27px 28px), linear-gradient(90deg, transparent 230px, rgba(200,38,29,0.5) 230px 232px, transparent 232px)'}}>
    <svg width={290} height={210}>
      <polyline points="0,180 50,150 90,160 140,100 190,120 240,60 290,40" fill="none" stroke="#2F5D8A" strokeWidth={5} />
    </svg>
  </div>
);
const Lock: React.FC = () => (
  <svg width={260} height={260} viewBox="0 0 260 260">
    <rect x={10} y={10} width={240} height={240} rx={24} fill="#22313F" />
    <path d="M95 120 V92 a35 35 0 0 1 70 0 V120" fill="none" stroke="#C7D3DD" strokeWidth={14} />
    <rect x={70} y={118} width={120} height={92} rx={12} fill="#C9A24A" />
    <circle cx={130} cy={156} r={11} fill="#22313F" />
  </svg>
);

/** Line 5: the benchmark Google cites (DeepSWE v1.1). */
export const G3: React.FC = () => {
  const f = useCurrentFrame();
  const bars = [
    {name: 'Gemini 4 Argon', v: 77.9, logo: 'gemini', hi: true},
    {name: 'GPT-6 Astra', v: 74.1, logo: 'openai', hi: false},
  ];
  const base = 860;
  const scale = 7.2; // px per point
  return (
    <AbsoluteFill>
      <Piece x={960} y={540} at={0} from="b" rot={-0.5}>
        <Paper w={1100} h={820} pad={0}>
          <div style={{position: 'absolute', left: 60, top: 46}}>
            <Kicker text="DeepSWE v1.1 · software engineering benchmark" at={4} color={C.ink} />
          </div>
          {[60, 70, 80].map((g) => (
            <div key={g} style={{position: 'absolute', left: 60, right: 60, top: base - 60 - (g - 50) * scale * 1.6, height: 1, background: 'rgba(25,23,20,0.15)'}}>
              <div style={{position: 'absolute', left: -2, top: -24, fontFamily: F.mono, fontSize: 16, color: C.mute}}>{g}%</div>
            </div>
          ))}
          {bars.map((b, i) => {
            const k = e01(f, 10 + i * 10, 26);
            const hgt = (b.v - 50) * scale * 1.6 * k;
            return (
              <div key={i} style={{position: 'absolute', left: 260 + i * 380, bottom: 820 - base + 60, width: 220, height: hgt, background: b.hi ? C.red : '#8C857A'}}>
                <div style={{position: 'absolute', top: -84, width: '100%', textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 68, color: b.hi ? C.red : C.ink, opacity: e01(f, 30 + i * 10, 8)}}>{(b.v * k).toFixed(1)}</div>
                <div style={{position: 'absolute', bottom: -64, width: 320, left: -50, textAlign: 'center', fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: C.ink}}>{b.name}</div>
              </div>
            );
          })}
          {bars.map((b, i) => (
            <div key={`l${i}`} style={{position: 'absolute', left: 260 + i * 380 + 40, top: base - 60 - (b.v - 50) * scale * 1.6 * e01(f, 10 + i * 10, 26) - 290}}>
              <Logo3D name={b.logo} w={140} h={140} at={20 + i * 10} fit={0.8} spin={0} />
            </div>
          ))}
        </Paper>
      </Piece>
      <Source text="Google, via VentureBeat · Google's own figures" />
    </AbsoluteFill>
  );
};

/** Line 6: Tulsee Doshi. No freely licensed photo of her exists, so a named card stands in. */
export const G4: React.FC = () => (
  <AbsoluteFill>
    <Piece x={600} y={520} at={0} from="l" rot={-3}>
      <div style={{width: 460, background: C.card, padding: 16, boxSizing: 'border-box'}}>
        <div style={{width: 428, height: 500, background: 'linear-gradient(180deg,#CFC7B8,#B8AF9F)', position: 'relative', overflow: 'hidden'}}>
          <svg width={428} height={500} style={{position: 'absolute', left: 0, top: 0}}>
            <circle cx={214} cy={190} r={92} fill="#8E8578" />
            <path d="M54 500 C 60 340, 368 340, 374 500 Z" fill="#8E8578" />
          </svg>
          <div style={{position: 'absolute', right: 18, top: 18}}>
            <Logo3D name="gemini" w={110} h={110} at={6} fit={0.75} spin={0} />
          </div>
        </div>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.ink, marginTop: 14}}>Tulsee Doshi</div>
        <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.1em', color: C.ink2, textTransform: 'uppercase', marginTop: 6, lineHeight: 1.35}}>Head of product, Gemini model · Google DeepMind</div>
      </div>
    </Piece>
    <Piece x={1320} y={520} at={14} from="none" shadow={false}>
      <div style={{width: 700}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 200, color: C.red, lineHeight: 0.6, height: 90}}>“</div>
        <Hand text="incredibly well-rounded" at={18} size={104} rot={-3} color={C.ink} />
        <div style={{marginTop: 22}}>
          <Kicker text="to CNBC" at={30} />
        </div>
      </div>
    </Piece>
  </AbsoluteFill>
);

/** Lines 7–8: a year after Gemini 3; the June target scrapped, straight to 4. */
export const G5: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const months = ['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'];
  const k = e01(f, 8, 40);
  return (
    <AbsoluteFill>
      <Piece x={960} y={300} at={0} from="t" rot={-1}>
        <div style={{width: 1500, height: 170, background: '#E7D7A8', position: 'relative'}}>
          {months.map((m, i) => (
            <div key={m} style={{position: 'absolute', left: 60 + i * 136, top: 0, height: 170}}>
              <div style={{width: 3, height: i % 3 === 0 ? 60 : 36, background: C.ink}} />
              <div style={{fontFamily: F.mono, fontSize: 18, color: C.ink, marginTop: 8, marginLeft: -16}}>{m}</div>
            </div>
          ))}
          <div style={{position: 'absolute', left: 60, top: 118, height: 10, width: 1360 * k, background: C.red}} />
          <div style={{position: 'absolute', left: 30, top: 136, fontFamily: F.sans, fontWeight: 700, fontSize: 22, color: C.ink}}>Gemini 3 · Nov 2025</div>
          <div style={{position: 'absolute', right: 30, top: 136, fontFamily: F.sans, fontWeight: 700, fontSize: 22, color: C.ink, opacity: k}}>Gemini 4 · Sep 30, 2026</div>
        </div>
      </Piece>
      <Piece x={560} y={720} at={L(1) - 2} from="l" rot={-5}>
        <CalPage month="JUNE" day="3.5" year="2026" w={300} cross={L(1) + 30} />
      </Piece>
      <Arrow x1={760} y1={690} x2={1220} y2={700} at={L(1) + 50} bend={-0.25} />
      <Piece x={1400} y={720} at={L(1) + 62} from="drop" rot={4}>
        <div style={{width: 300, height: 300, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 230, color: C.ink}}>4</div>
          <div style={{position: 'absolute', right: -30, top: -30}}>
            <Logo3D name="gemini" w={130} h={130} at={L(1) + 66} fit={0.8} spin={0} />
          </div>
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

/** Line 9: Bloomberg's report: some staff think it does worse in real use than on benchmarks. */
export const G6: React.FC = () => (
  <AbsoluteFill>
    <Piece x={820} y={520} at={0} from="r" rot={-2}>
      <Clipping
        w={900}
        h={560}
        label="Bloomberg · report"
        seed="bbg"
        hl={
          <div style={{position: 'relative', fontFamily: F.display, fontWeight: 900, fontSize: 50, color: C.ink, lineHeight: 1.1, marginBottom: 10}}>
            <div style={{position: 'relative', display: 'inline-block'}}>
              <Highlight w={780} h={56} at={18} dur={16} />
              <span style={{position: 'relative'}}>worse in real use</span>
            </div>
            <br />
            <span style={{position: 'relative'}}>than on benchmarks</span>
          </div>
        }
      />
    </Piece>
    <Piece x={1560} y={720} at={30} from="r" rot={6}>
      <Sticky w={240} text="some employees say" />
    </Piece>
  </AbsoluteFill>
);

/** Line 10: a contender at the top of the leaderboard (for now). */
export const G7: React.FC = () => {
  const f = useCurrentFrame();
  const steps = [
    {x: 960, h: 300, n: 1},
    {x: 700, h: 200, n: 2},
    {x: 1220, h: 140, n: 3},
  ];
  return (
    <AbsoluteFill>
      {steps.map((s, i) => (
        <Piece key={i} x={s.x} y={960 - s.h / 2} at={i * 6} from="b">
          <div style={{width: 260, height: s.h, background: i === 0 ? '#D9CFBC' : '#CFC6B4', display: 'flex', justifyContent: 'center', paddingTop: 16, boxSizing: 'border-box', fontFamily: F.display, fontWeight: 900, fontSize: 80, color: C.ink2}}>{s.n}</div>
        </Piece>
      ))}
      <Piece x={960} y={480} at={16} from="drop" shadow={false}>
        <Logo3D name="gemini" w={300} h={300} at={16} fit={0.8} />
      </Piece>
      <Piece x={1250} y={370} at={40} from="r" rot={8}>
        <Sticky w={170} text="for now?" color="#F7E27A" />
      </Piece>
      <div style={{position: 'absolute', left: 820, top: 340, opacity: e01(f, 52, 6)}}>
        <Circle w={290} h={290} at={52} />
      </div>
    </AbsoluteFill>
  );
};
