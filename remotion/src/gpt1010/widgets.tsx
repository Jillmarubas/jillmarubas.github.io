// Interactive answer pieces ChatGPT builds inside the chat (illustrations drawn in code, in screen
// points): a bill splitter, a bike explorer with five tabs, a road-trip map, an audio file chip.
import React from 'react';
import {C, F} from './design';
import {Draw, E, bounce, clamp, lerp, p01, tw} from './ae';
import {G} from './app';
import {Icon} from './ui';

const Card: React.FC<{w: number; h: number; p: number; children: React.ReactNode; title: string; icon: string; tag?: string}> = ({w, h, p, children, title, icon, tag = 'Interactive'}) => (
  <div style={{position: 'relative', width: w, height: h * clamp(p * 1.4), overflow: 'hidden', borderRadius: 18, background: G.card, boxShadow: `0 0 0 1px rgba(255,255,255,.09), 0 16px 40px -12px rgba(0,0,0,.6)`, opacity: clamp(p * 3), transform: `scale(${lerp(0.96, 1, p)})`, transformOrigin: '50% 0'}}>
    <div style={{position: 'absolute', left: 22, top: 18, right: 22, display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 650}}>
      <Icon name={icon} size={20} color={C.accHi} width={2} />
      {title}
      <span style={{marginLeft: 'auto', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', color: C.accHi, padding: '3px 9px', borderRadius: 999, background: 'rgba(16,163,127,.16)'}}>{tag}</span>
    </div>
    {children}
  </div>
);

const reveal = (p: number, i: number) => ({opacity: clamp((p - 0.15 - i * 0.12) * 5), transform: `translateY(${(1 - clamp((p - 0.15 - i * 0.12) * 4)) * 10}px)`});

// ---------------------------------------------------------------- bill splitter
export const BILL = {w: 560, h: 374, plus: {x: 515, y: 153}, tip: [{x: 362, y: 213}, {x: 434, y: 213}, {x: 506, y: 213}]};

/** p: build 0..1 (rows appear in order). people / tip can change; `pressPlus` 0..1 presses + . */
export const BillSplitter: React.FC<{t: number; p: number; people: number; prevPeople?: number; changeAt?: number; tip?: number; tipAt?: number; prevTip?: number; total?: number}> = ({t, p, people, prevPeople = people, changeAt = 0, tip = 0, tipAt = 0, prevTip = 0, total = 240}) => {
  const each = (n: number, tp: number) => (total * (1 + tp / 100)) / n;
  const a = each(prevPeople, prevTip);
  const b = each(people, prevTip);
  const c = each(people, tip);
  const shown = t < changeAt ? a : t < tipAt || tipAt === 0 ? tw(t, changeAt, 0.5, a, b, E.out) : tw(t, tipAt, 0.5, b, c, E.out);
  const nShown = t < changeAt ? prevPeople : people;
  const tipShown = tipAt && t >= tipAt ? tip : prevTip;
  const pop = (at: number) => (at && t >= at ? 1 + 0.12 * Math.sin(Math.PI * clamp((t - at) / 0.25)) : 1);
  const row = (y: number, label: string, i: number, right: React.ReactNode) => (
    <div style={{position: 'absolute', left: 22, right: 22, top: y, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...reveal(p, i)}}>
      <span style={{fontSize: 16, color: G.text2}}>{label}</span>
      {right}
    </div>
  );
  const btn = (s: string) => <div style={{width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,.08)', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 500}}>{s}</div>;
  return (
    <Card w={BILL.w} h={BILL.h} p={p} title="Bill splitter" icon="dollar">
      {row(70, 'Total bill', 0, <div style={{width: 200, height: 46, borderRadius: 12, background: '#1F1F1F', boxShadow: '0 0 0 1px rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', padding: '0 16px', boxSizing: 'border-box', fontSize: 18, fontWeight: 600}}>RM {total.toFixed(2)}</div>)}
      {row(130, 'People', 1, (
        <div style={{display: 'flex', alignItems: 'center', gap: 0}}>
          {btn('−')}
          <div style={{width: 60, textAlign: 'center', fontSize: 22, fontWeight: 700, transform: `scale(${pop(changeAt)})`}}>{nShown}</div>
          {btn('+')}
        </div>
      ))}
      {row(190, 'Tip', 2, (
        <div style={{display: 'flex', gap: 8}}>
          {[0, 10, 15].map((v) => (
            <div key={v} style={{width: 64, height: 46, borderRadius: 12, display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 600, background: v === tipShown ? C.acc : 'rgba(255,255,255,.08)', color: v === tipShown ? '#fff' : G.text}}>{v}%</div>
          ))}
        </div>
      ))}
      <div style={{position: 'absolute', left: 22, right: 22, top: 256, height: 96, borderRadius: 14, background: 'rgba(16,163,127,.12)', boxShadow: '0 0 0 1px rgba(16,163,127,.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', ...reveal(p, 3)}}>
        <span style={{fontSize: 16, color: G.text2}}>Each person pays</span>
        <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 42, letterSpacing: '-0.02em', color: '#fff', fontVariantNumeric: 'tabular-nums', transform: `scale(${pop(changeAt) * pop(tipAt)})`}}>RM {shown.toFixed(2)}</span>
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- bike explorer
export const BIKE_TABS = ['Frame', 'Wheels', 'Drivetrain', 'Brakes', 'Cockpit'];
export const BIKE = {w: 720, h: 420, tab: (i: number) => ({x: 22 + 62 + i * 130, y: 78})};
const BIKE_INFO = [
  'The frame holds every other part. Its tubes form two triangles.',
  'Tyres grip the road. Spokes connect each rim to its hub.',
  'Pedals turn the chainring. The chain drives one of 7 rear cogs; shifting moves it to a bigger or smaller cog.',
  'Pull a lever and pads squeeze the wheel to slow you down.',
  'Handlebar, shifter and brake levers: where you steer, shift and stop.',
];
const PARTS: Record<number, string[]> = {
  0: ['M100 150 L200 155 L180 72 Z', 'M180 72 L305 70 L318 102 L200 155'],
  1: ['M100 80 A70 70 0 1 1 99.9 80', 'M340 80 A70 70 0 1 1 339.9 80', 'M100 150 L100 86', 'M100 150 L160 150', 'M100 150 L52 190', 'M340 150 L340 86', 'M340 150 L392 110', 'M340 150 L300 202'],
  2: ['M200 137 A18 18 0 1 1 199.9 137', 'M100 140 A10 10 0 1 1 99.9 140', 'M200 137 L100 140', 'M200 173 L100 160', 'M200 155 L222 186', 'M214 186 L232 186'],
  3: ['M86 84 L114 84', 'M326 84 L354 84', 'M314 58 C 300 40, 220 50, 180 72 L114 84', 'M322 56 L340 84'],
  4: ['M305 70 L312 52', 'M298 50 L330 50 L340 62', 'M160 66 L198 66', 'M180 72 L178 66'],
};
const FORK = 'M318 102 L340 150';

export const BikeExplorer: React.FC<{t: number; p: number; tab: number; tabAt?: number}> = ({t, p, tab, tabAt = 0}) => {
  const tp = p01(t, tabAt, 0.35);
  return (
    <Card w={BIKE.w} h={BIKE.h} p={p} title="How a 7-speed bike works" icon="gear">
      <div style={{position: 'absolute', left: 22, top: 60, display: 'flex', gap: 6, ...reveal(p, 0)}}>
        {BIKE_TABS.map((n, i) => (
          <div key={n} style={{width: 124, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 14.5, fontWeight: 600, background: i === tab ? `rgba(16,163,127,${0.25 + 0.6 * tp})` : 'rgba(255,255,255,.07)', color: i === tab ? '#fff' : G.text2}}>{n}</div>
        ))}
      </div>
      <svg width={440} height={250} viewBox="0 0 440 250" style={{position: 'absolute', left: 10, top: 118, overflow: 'visible', ...reveal(p, 1)}}>
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k}>
            {PARTS[k].map((d, j) => (
              <path key={j} d={d} fill="none" stroke={k === tab ? C.accHi : '#5d6063'} strokeWidth={k === tab ? 5 : 3.5} strokeLinecap="round" strokeLinejoin="round" style={{filter: k === tab ? `drop-shadow(0 0 ${8 * tp}px rgba(16,163,127,.8))` : undefined}} />
            ))}
          </g>
        ))}
        <path d={FORK} fill="none" stroke="#5d6063" strokeWidth={3.5} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: 470, top: 132, width: 228, ...reveal(p, 2)}}>
        <div style={{fontSize: 13, letterSpacing: '0.08em', color: C.accHi, fontWeight: 700}}>{BIKE_TABS[tab].toUpperCase()}</div>
        <div style={{fontSize: 16, lineHeight: 1.55, color: G.text, marginTop: 8, opacity: 0.4 + 0.6 * tp}}>{BIKE_INFO[tab]}</div>
        <div style={{display: 'flex', gap: 6, marginTop: 18}}>
          {BIKE_TABS.map((_, i) => (
            <div key={i} style={{width: i === tab ? 22 : 8, height: 8, borderRadius: 4, background: i === tab ? C.acc : 'rgba(255,255,255,.18)'}} />
          ))}
        </div>
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- road-trip map
export const MAP = {w: 720, h: 430};
const STOPS = [
  {n: 'Kuala Lumpur', d: 'Start', x: 330, y: 352},
  {n: 'Ipoh', d: 'Day 1', x: 226, y: 166},
  {n: 'Taiping', d: 'Day 2', x: 167, y: 135},
  {n: 'Penang', d: 'Day 3', x: 98, y: 66},
];
export const RouteMap: React.FC<{t: number; p: number; at: number}> = ({t, p, at}) => (
  <Card w={MAP.w} h={MAP.h} p={p} title="3-day road trip: Kuala Lumpur → Penang" icon="flag" tag="Map">
    <div style={{position: 'absolute', left: 14, top: 58, width: 440, height: 358, borderRadius: 12, overflow: 'hidden', background: '#16314A', ...reveal(p, 0)}}>
      <svg width={440} height={420} viewBox="0 0 440 420" style={{position: 'absolute', left: 0, top: -24}}>
        <path d="M118 0 L130 40 L116 76 L132 104 L148 150 L176 200 L224 258 L272 318 L318 372 L356 420 L440 420 L440 0 Z" fill="#23302A" />
        <path d="M84 52 C 96 44, 108 54, 104 70 C 100 84, 84 84, 82 72 Z" fill="#23302A" />
        {[60, 120, 180, 240, 300, 360].map((y) => (
          <line key={y} x1={0} x2={440} y1={y} y2={y} stroke="rgba(255,255,255,.04)" />
        ))}
        <Draw t={t} d="M330 352 C 300 300, 250 230, 226 166 C 210 150, 186 140, 167 135 C 140 120, 120 96, 98 66" at={at + 0.2} dur={1.4} stroke={C.accHi} width={4} />
        {STOPS.map((s, i) => {
          const b = bounce(t, at + 0.2 + i * 0.42, 11, 220);
          return (
            <g key={s.n} transform={`translate(${s.x} ${s.y}) scale(${b})`}>
              <circle r={11} fill={C.acc} stroke="#fff" strokeWidth={2.5} />
              <text x={0} y={4.5} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff" fontFamily={F.ui}>{i + 1}</text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', right: 8, bottom: 6, fontSize: 10.5, color: 'rgba(255,255,255,.4)'}}>Illustration</div>
    </div>
    <div style={{position: 'absolute', left: 476, top: 64, width: 226}}>
      {STOPS.map((s, i) => (
        <div key={s.n} style={{display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,.07)' : undefined, opacity: p01(t, at + 0.3 + i * 0.42, 0.3)}}>
          <div style={{width: 26, height: 26, borderRadius: 13, background: C.acc, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800}}>{i + 1}</div>
          <div>
            <div style={{fontSize: 16, fontWeight: 650}}>{s.n}</div>
            <div style={{fontSize: 13, color: G.text3}}>{s.d}</div>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// ---------------------------------------------------------------- audio file chip
export const Wave: React.FC<{w?: number; h?: number; n?: number; color?: string; p?: number; seed?: number}> = ({w = 120, h = 30, n = 24, color = C.accHi, p = 1, seed = 3}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
    {Array.from({length: n}, (_, i) => {
      const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + seed) * Math.cos(i * 0.45 + seed * 0.3));
      const bh = h * v * clamp(p * 1.5 - i / n / 2);
      return <rect key={i} x={(i * w) / n} y={(h - bh) / 2} width={(w / n) * 0.55} height={bh} rx={1.5} fill={color} />;
    })}
  </svg>
);

export const FileChip: React.FC<{name: string; meta: string; w?: number; p?: number}> = ({name, meta, w = 300, p = 1}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, width: w, padding: 8, borderRadius: 14, background: '#262626', boxShadow: '0 0 0 1px rgba(255,255,255,.1)', boxSizing: 'border-box'}}>
    <div style={{width: 40, height: 40, borderRadius: 10, background: '#E8505B', display: 'grid', placeItems: 'center'}}>
      <Wave w={24} h={20} n={6} color="#fff" p={p} />
    </div>
    <div style={{minWidth: 0}}>
      <div style={{fontSize: 14.5, fontWeight: 600, color: G.text, whiteSpace: 'nowrap'}}>{name}</div>
      <div style={{fontSize: 12.5, color: G.text3}}>{meta}</div>
    </div>
  </div>
);
