import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, Img, random, staticFile} from 'remotion';
import {geoAlbersUsa, geoEqualEarth, geoIdentity, geoMercator, geoPath} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import {C, F, FPS, H, W} from './design';
import {Accent, asset, clamp, e01, settle} from './kit';
import {interpolate} from 'remotion';

/*
 * Full-stage graphics ("boards"). Each gets the frame since the board appeared (f) and its updates:
 * the beats that drove it, with their local frame (at) and options. Boards draw on the paper, except
 * the chat screen, which is the black screen of the cold open.
 */
export type Upd = {at: number; o: Record<string, string>};
export type BoardProps = {f: number; ups: Upd[]; dur: number; docked: number};
const last = (ups: Upd[], f: number, key: string, dflt = '') => {
  let v = dflt;
  for (const u of ups) if (u.at <= f + 2 && u.o[key] !== undefined) v = u.o[key];
  return v;
};
const firstAt = (ups: Upd[], pred: (u: Upd) => boolean) => ups.find(pred)?.at ?? 0;
const Mono: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 22, color = C.ink2, style}) => (
  <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: size, letterSpacing: '0.12em', textTransform: 'uppercase', color, ...style}}>{children}</div>
);
const Big: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 120, color = C.ink, style}) => (
  <div style={{fontFamily: F.display, fontWeight: 900, fontSize: size, lineHeight: 1, color, letterSpacing: '-0.01em', ...style}}>{children}</div>
);

/* ------------------------------------------------------------------ chat */
export const Chat: React.FC<BoardProps> = ({f, ups}) => {
  const mode = last(ups, f, 'mode', 'type');
  const text = ups.find((u) => u.o.text)?.o.text ?? '';
  const t0 = firstAt(ups, () => true);
  const mini = ups[0].o.mode === 'mini';
  const blinkOnly = ups[0].o.mode === 'blink';
  const night = !mini;
  const typeStart = t0 + 10;
  const typed = blinkOnly || !text.length ? 0 : Math.floor(interpolate(f, [typeStart, typeStart + text.length * 2.2], [0, text.length], clamp));
  const ansAt = firstAt(ups, (u) => u.o.mode === 'answer');
  const sent = ansAt > 0 && f >= ansAt - 18;
  const answer = ups.find((u) => u.o.answer)?.o.answer ?? 'Here are three easy ideas: a quick vegetable stir-fry, a one-pan lemon chicken, or pasta with garlic and spinach.';
  const ansN = ansAt > 0 ? Math.floor(interpolate(f, [ansAt, ansAt + 30], [0, answer.length], clamp)) : 0;
  const blink = Math.floor(f / 12) % 2 === 0;
  const ink = night ? C.nightInk : C.ink;
  const box = (
    <div style={{width: mini ? 900 : 1180, display: 'flex', flexDirection: 'column', gap: 26}}>
      {sent && (
        <div style={{alignSelf: 'flex-end', maxWidth: '80%', background: night ? '#2A2A2E' : '#E9E4DA', color: ink, fontFamily: F.sans, fontWeight: 500, fontSize: mini ? 34 : 40, padding: '18px 26px', borderRadius: 22}}>{text}</div>
      )}
      {ansN > 0 && <div style={{alignSelf: 'flex-start', maxWidth: '86%', color: ink, fontFamily: F.sans, fontWeight: 500, fontSize: mini ? 32 : 38, lineHeight: 1.4}}>{answer.slice(0, ansN)}</div>}
      <div style={{border: `2px solid ${night ? '#3A3A40' : '#CFC8BA'}`, background: night ? '#1C1C20' : '#FFFFFF', borderRadius: 30, padding: mini ? '22px 30px' : '28px 36px', display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{flex: 1, fontFamily: F.sans, fontWeight: 500, fontSize: mini ? 34 : 42, color: sent ? (night ? '#6C6C74' : C.mute) : ink, minHeight: 50}}>
          {sent ? 'Ask anything' : blinkOnly ? '' : text.slice(0, typed)}
          {!sent && <span style={{opacity: blink ? 1 : 0, color: ink}}>|</span>}
        </div>
        <div style={{width: 58, height: 58, borderRadius: 29, background: typed > 0 && !sent ? (night ? C.nightInk : C.ink) : night ? '#3A3A40' : '#D8D2C6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width={26} height={26} viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" stroke={night ? '#121214' : '#fff'} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
  if (mini) {
    return (
      <div style={{position: 'absolute', left: W / 2 - 450, top: H / 2 - 160, opacity: e01(f, 0, 10), transform: `translateY(${(1 - settle(f / 14)) * 60}px)`}}>
        <div style={{background: C.card, padding: 40, borderRadius: 18, boxShadow: '0 30px 60px -20px rgba(29,27,24,0.35)'}}>{box}</div>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {box}
      {blinkOnly && text && (
        <div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.nightInk, opacity: e01(f, 30, 20), padding: '0 200px', lineHeight: 1.15}}>
          Would you still ask AI to plan your dinner… <span style={{color: C.hum}}>if you could see the bill?</span>
        </div>
      )}
      {blinkOnly && text && (
        <div style={{position: 'absolute', bottom: 130, left: 0, right: 0, textAlign: 'center', opacity: e01(f, 260, 24)}}>
          <Mono color="#8A8680">Sources and image credits in the description</Mono>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ maps */
type FC = FeatureCollection<Geometry, Record<string, unknown>>;
const geoCache: Record<string, FC> = {};
const useGeo = (name: string) => {
  const [g, setG] = useState<FC | null>(geoCache[name] ?? null);
  const [h] = useState(() => (geoCache[name] ? null : delayRender(`geo ${name}`)));
  useEffect(() => {
    if (geoCache[name]) return;
    const load = async (n = 0): Promise<void> => {
      try {
        const r = await fetch(staticFile(`dc/geo/${name}.json`));
        geoCache[name] = await r.json();
        setG(geoCache[name]);
        if (h !== null) continueRender(h);
      } catch (e) {
        if (n < 6) return new Promise((res) => setTimeout(() => res(load(n + 1)), 500 * 2 ** n));
        throw e;
      }
    };
    load();
  }, [name, h]);
  return g;
};
export const PLACES: Record<string, [number, number]> = {
  nairobi: [36.82, -1.29], the_dalles: [-121.18, 45.6], tmi: [-76.72, 40.15], memphis: [-90.05, 35.15], dublin: [-6.26, 53.35], taiwan: [121.0, 23.7],
  congo: [23.6, -2.9], kinshasa: [23.6, -2.9], loudoun: [-77.64, 39.09], phoenix: [-112.07, 33.45], texas: [-99.0, 31.5], spain: [-3.7, 40.4], chile: [-70.65, -33.45],
  montevideo: [-56.16, -34.9], manila: [120.98, 14.6], india: [78.9, 21.0], caracas: [-66.9, 10.5], china: [104.0, 35.0], maryland: [-76.8, 39.05], nj: [-74.4, 40.1],
  pa: [-77.6, 40.9], ohio: [-82.8, 40.3],
};
const VIEWS: Record<string, {rot?: number; c: [number, number]; s: number}> = {
  world: {c: [10, 15], s: 1},
  europe: {c: [-5, 53], s: 5.2},
  asia: {c: [112, 26], s: 3.0},
  africa: {c: [22, 0], s: 2.2},
};
type Pin = {k: string; label: string; at: number; side?: string};
const labelPos = (side?: string): React.CSSProperties =>
  side === 'l' ? {right: 24, top: -20} : side === 't' ? {left: -60, top: -62} : side === 'b' ? {left: -40, top: 20} : {left: 24, top: -20};
export const MapBoard: React.FC<BoardProps> = ({f, ups}) => {
  const view = last(ups, f, 'view', 'world');
  const pins: Pin[] = [];
  for (const u of ups)
    if (u.o.pins)
      for (const p of u.o.pins.split(',')) {
        const [k, label, side] = p.split(':');
        if (!pins.find((x) => x.k === k)) pins.push({k, label: label === 'on' ? '' : label, at: u.at, side});
        else if (label !== 'on') pins.find((x) => x.k === k)!.label = label;
      }
  return view === 'us' ? <USBoard f={f} pins={pins} /> : <WorldBoard f={f} pins={pins} view={view} ups={ups} />;
};
const WorldBoard: React.FC<{f: number; pins: Pin[]; view: string; ups: Upd[]}> = ({f, pins, view, ups}) => {
  const g = useGeo('world');
  if (!g) return null;
  // the view can change mid-board (e.g. world → pull out); ease between them
  const views = ups.filter((u) => u.o.view).map((u) => ({at: u.at, v: VIEWS[u.o.view] ?? VIEWS.world}));
  let cur = views[0]?.v ?? VIEWS[view] ?? VIEWS.world;
  for (let i = 1; i < views.length; i++) {
    const k = settle((f - views[i].at) / 30);
    if (k > 0) cur = {c: [cur.c[0] + (views[i].v.c[0] - cur.c[0]) * k, cur.c[1] + (views[i].v.c[1] - cur.c[1]) * k], s: cur.s + (views[i].v.s - cur.s) * k};
  }
  const push = 1 + 0.06 * settle(f / 240); // slow push-in
  const proj = geoEqualEarth().scale(330 * cur.s * push).center([0, 0]).rotate([-cur.c[0], 0]).translate([W / 2, H / 2]);
  const off = proj([cur.c[0], cur.c[1]])!;
  proj.translate([W / 2 - (off[0] - W / 2), H / 2 - (off[1] - H / 2)]);
  const path = geoPath(proj);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: e01(f, 0, 12)}}>
      <svg width={W} height={H}>
        {g.features.map((ft, i) => (
          <path key={i} d={path(ft as Feature) ?? ''} fill="#E3DDD1" stroke="#B9B1A2" strokeWidth={0.8} />
        ))}
      </svg>
      {pins.map((p) => {
        const ll = PLACES[p.k];
        if (!ll) return null;
        const xy = proj(ll);
        if (!xy) return null;
        const o = e01(f, p.at, 10);
        const pulse = (f - p.at) % 36 / 36;
        return (
          <div key={p.k} style={{position: 'absolute', left: xy[0], top: xy[1], opacity: o}}>
            <div style={{position: 'absolute', left: -30 * pulse - 8, top: -30 * pulse - 8, width: 16 + 60 * pulse, height: 16 + 60 * pulse, borderRadius: '50%', border: `3px solid ${C.hum}`, opacity: 1 - pulse}} />
            <div style={{position: 'absolute', left: -10, top: -10 - (1 - o) * 30, width: 20, height: 20, borderRadius: 10, background: C.hum, border: `4px solid ${C.card}`}} />
            {p.label && <div style={{position: 'absolute', ...labelPos(p.side), whiteSpace: 'nowrap', fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: C.ink, background: C.card, padding: '2px 12px', opacity: e01(f, p.at + 4, 10)}}>{p.label}</div>}
          </div>
        );
      })}
    </div>
  );
};
const albers = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const USBoard: React.FC<{f: number; pins: Pin[]; highlight?: string[]}> = ({f, pins, highlight}) => {
  const g = useGeo('states');
  if (!g) return null;
  const w = 1500;
  const h = w * (610 / 975);
  const proj = geoIdentity().fitSize([w, h], g);
  const path = geoPath(proj);
  const k = proj.scale();
  const [tx, ty] = proj.translate();
  const x0 = (W - w) / 2, y0 = (H - h) / 2 + 10;
  return (
    <div style={{position: 'absolute', left: x0, top: y0, width: w, height: h, opacity: e01(f, 0, 12)}}>
      <svg width={w} height={h}>
        {g.features.map((ft) => {
          const name = String((ft.properties as {name: string}).name);
          const hi = highlight?.includes(name);
          return <path key={name} d={path(ft as Feature) ?? ''} fill={hi ? C.hum : '#E3DDD1'} fillOpacity={hi ? 0.25 + 0.6 * e01(f, 8 + (highlight!.indexOf(name) % 14) * 2, 10) : 1} stroke="#B9B1A2" strokeWidth={1.2} />;
        })}
      </svg>
      {pins.map((p) => {
        const ll = PLACES[p.k];
        const q = ll && albers(ll);
        if (!q) return null;
        const x = q[0] * k + tx, y = q[1] * k + ty;
        const o = e01(f, p.at, 10);
        return (
          <div key={p.k} style={{position: 'absolute', left: x, top: y, opacity: o}}>
            <div style={{position: 'absolute', left: -11, top: -11 - (1 - o) * 30, width: 22, height: 22, borderRadius: 11, background: C.hum, border: `4px solid ${C.card}`}} />
            {p.label && <div style={{position: 'absolute', ...labelPos(p.side), whiteSpace: 'nowrap', fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: C.ink, background: C.card, padding: '2px 12px'}}>{p.label}</div>}
          </div>
        );
      })}
    </div>
  );
};
const PJM_STATES = ['Delaware', 'Illinois', 'Indiana', 'Kentucky', 'Maryland', 'Michigan', 'New Jersey', 'North Carolina', 'Ohio', 'Pennsylvania', 'Tennessee', 'Virginia', 'West Virginia', 'District of Columbia'];
export const PJMBoard: React.FC<BoardProps> = ({f}) => (
  <>
    <USBoard f={f} pins={[{k: 'loudoun', label: 'Data Center Alley', at: 40}]} highlight={PJM_STATES} />
    <div style={{position: 'absolute', right: 120, top: 120, textAlign: 'right', opacity: e01(f, 20, 14)}}>
      <Big size={96} color={C.hum}>PJM</Big>
      <Mono>13 states + Washington, D.C.</Mono>
    </div>
  </>
);

/* ------------------------------------------------------------------ the bill (illustration, generic) */
export const Bill: React.FC<BoardProps> = ({f, ups}) => {
  const circleAt = firstAt(ups, (u) => u.o.circle === '1');
  const ck = circleAt ? e01(f, circleAt, 16) : 0;
  const rows = [
    ['Energy charge', '$96.40'],
    ['Distribution', '$41.75'],
    ['Transmission', '$18.30'],
    ['Capacity', '$22.85'],
    ['Taxes & fees', '$9.12'],
  ];
  return (
    <div style={{position: 'absolute', left: W / 2 - 360, top: 110, width: 720, transform: `rotate(-2.5deg) translateY(${(1 - settle(f / 16)) * 500}px)`}}>
      <div style={{background: '#FFFFFF', padding: '48px 56px', boxShadow: '0 40px 70px -30px rgba(29,27,24,0.45)', fontFamily: F.sans}}>
        <Mono size={18}>Residential electricity statement · illustration</Mono>
        <Big size={64} style={{marginTop: 14}}>Your bill</Big>
        <div style={{height: 2, background: C.ink, margin: '24px 0'}} />
        {rows.map(([a, b]) => (
          <div key={a} style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, color: C.ink2, padding: '8px 0', fontWeight: 500}}>
            <span>{a}</span>
            <span style={{fontVariantNumeric: 'tabular-nums'}}>{b}</span>
          </div>
        ))}
        <div style={{height: 2, background: C.ink, margin: '20px 0'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative'}}>
          <span style={{fontSize: 36, fontWeight: 700, color: C.ink}}>Total due</span>
          <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 70, color: C.ink, position: 'relative'}}>
            $188.42
            <svg width={330} height={140} style={{position: 'absolute', left: -40, top: -26, overflow: 'visible'}}>
              <path d="M30 40 C 90 -10, 300 -6, 310 60 C 318 120, 80 132, 26 92 C -4 66, 30 30, 110 18" fill="none" stroke={C.hum} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ck} />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ chain (signature) */
const LINK_IMG: Record<string, string> = {power: 'pylon', water: 'water_drop', metal: 'copper_ore', hands: 'hands'};
export const Chain: React.FC<BoardProps> = ({f, ups}) => {
  const links = (ups[0].o.links ?? 'power,water,metal,hands').split(',');
  const hot = Number(last(ups, f, 'hot', '-1'));
  // link i appears at the first update with show > i (no show option: all at once)
  const linkAt = (i: number) => (ups.some((u) => u.o.show !== undefined) ? ups.find((u) => Number(u.o.show ?? -1) > i)?.at ?? 1e9 : i * 8);
  const n = links.length;
  const gap = 390;
  const x0 = W / 2 - ((n - 1) * gap) / 2;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {links.map((_, i) => {
          if (i === n - 1) return null;
          const k = e01(f, linkAt(i + 1), 14);
          return <line key={i} x1={x0 + i * gap + 110} y1={H / 2} x2={x0 + i * gap + 110 + (gap - 220) * k} y2={H / 2} stroke={C.ink} strokeWidth={10} strokeLinecap="round" strokeDasharray="34 18" />;
        })}
      </svg>
      {links.map((l, i) => {
        const k = settle((f - linkAt(i)) / 14);
        const a = asset(LINK_IMG[l]);
        const isHot = hot === i;
        return (
          <div key={l} style={{position: 'absolute', left: x0 + i * gap - 110, top: H / 2 - 110 + (1 - k) * 80, width: 220, height: 220, opacity: k}}>
            <div style={{width: 220, height: 220, borderRadius: 110, border: `10px solid ${isHot ? C.hum : C.ink}`, background: C.card, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {a ? <Img src={staticFile(a.src)} style={a.type === 'p' ? {width: '100%', height: '100%', objectFit: 'cover'} : {width: '78%', height: '78%', objectFit: 'contain'}} /> : null}
            </div>
            <Mono size={24} color={isHot ? C.hum : C.ink} style={{textAlign: 'center', marginTop: 22}}>
              {l}
            </Mono>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ grid of tiny chips (parallel math) */
export const Grid: React.FC<BoardProps> = ({f, ups}) => {
  const label = last(ups, f, 'label');
  const cols = 48, rows = 22, s = 30;
  const x0 = W / 2 - (cols * s) / 2, y0 = 170;
  const chip = asset('chip');
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {Array.from({length: cols * rows}, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const d = Math.hypot(c - cols / 2, r - rows / 2);
        const o = e01(f, d * 0.9, 8);
        const lit = Math.sin(f * 0.6 + i * 1.7) > 0.6;
        return <div key={i} style={{position: 'absolute', left: x0 + c * s, top: y0 + r * s, width: s - 8, height: s - 8, borderRadius: 3, background: lit ? C.hum : C.ink, opacity: o * (lit ? 0.95 : 0.75)}} />;
      })}
      {chip && null}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 120, textAlign: 'center', opacity: e01(f, 10, 12)}}>
        <span style={{background: C.card, padding: '10px 28px', fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.ink}}>{label}</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ counter */
export const Counter: React.FC<BoardProps> = ({f, ups, dur}) => {
  const to = Number(last(ups, f, 'to', '0'));
  const label = last(ups, f, 'label');
  const fast = Number(last(ups, f, 'fast', '0'));
  const u = Math.min(1, f / Math.max(24, Math.min(dur, 160)));
  const v = Math.floor(to * (fast ? u ** (1.6 - fast * 0.3) : settle(u)));
  const shake = fast ? Math.sin(f * 2.1) * fast * 1.5 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, transform: `translateX(${shake}px)`}}>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 190, color: C.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em'}}>{v.toLocaleString('en-US')}</div>
      <Mono size={28}>{label}</Mono>
    </div>
  );
};

/* ------------------------------------------------------------------ globe with a 1.5% wedge */
export const Globe: React.FC<BoardProps> = ({f, ups}) => {
  const g = useGeo('world');
  const light = last(ups, f, 'light') === '1';
  const lightAt = firstAt(ups, (u) => u.o.light === '1');
  if (!g) return null;
  const r = 360;
  const proj = geoMercator();
  void proj;
  const ortho = geoEqualEarth().scale(230).translate([W / 2 - 300, H / 2 + 20]).rotate([-20 + f * 0.15, 0]);
  const path = geoPath(ortho);
  const pct = 1.5;
  const ang = (pct / 100) * 360;
  const wk = e01(f, 12, 18);
  const a1 = (-90 + ang * wk) * (Math.PI / 180);
  const cx = W / 2 + 470, cy = H / 2;
  const big = ['United Kingdom', 'France', 'Italy', 'Spain', 'Mexico', 'Argentina', 'South Africa', 'Turkey', 'Thailand', 'Egypt', 'Poland', 'Vietnam'];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: e01(f, 0, 12)}}>
      <svg width={W} height={H}>
        {g.features.map((ft, i) => {
          const name = String((ft.properties as {name: string}).name);
          const idx = big.indexOf(name);
          const lit = light && idx >= 0 && f > lightAt + idx * 5;
          return <path key={i} d={path(ft as Feature) ?? ''} fill={lit ? C.hum : '#D9D2C4'} stroke="#B9B1A2" strokeWidth={0.6} />;
        })}
        <circle cx={cx} cy={cy} r={r * 0.62} fill="#E3DDD1" />
        <path d={`M ${cx} ${cy} L ${cx} ${cy - r * 0.62} A ${r * 0.62} ${r * 0.62} 0 0 1 ${cx + r * 0.62 * Math.cos(a1)} ${cy + r * 0.62 * Math.sin(a1)} Z`} fill={C.hum} />
      </svg>
      <div style={{position: 'absolute', left: cx - 200, top: cy + r * 0.62 + 30, width: 400, textAlign: 'center'}}>
        <Big size={88} color={C.hum}>~1.5%</Big>
        <Mono>of the world's electricity (2024)</Mono>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ bar charts (sourced values only) */
const SETS: Record<string, {title: string; unit: string; src: string; bars: {label: string; v: number; txt: string}[]}> = {
  twh: {title: 'Data-centre electricity', unit: 'TWh', src: 'IEA, Energy and AI (2025)', bars: [{label: '2024', v: 415, txt: '415 TWh'}, {label: '2030 (projected)', v: 945, txt: '~945 TWh'}, {label: 'Japan, all uses today', v: 945, txt: '≈ Japan'}]},
  ghg: {title: 'Emissions vs. baseline', unit: '%', src: 'Google 2024 Env. Report · Microsoft 2024 Sustainability Report', bars: [{label: 'Google vs 2019', v: 48, txt: '+48%'}, {label: 'Microsoft vs 2020', v: 29, txt: '+29%'}]},
  water: {title: 'Water consumption, 2022 vs 2021', unit: '%', src: 'AP News (2023) · company reports', bars: [{label: 'Microsoft', v: 34, txt: '+34%'}, {label: 'Google', v: 20, txt: '+20%'}]},
  pjm: {title: 'PJM capacity price', unit: '$/MW-day', src: 'PJM auction results (2024)', bars: [{label: '2024/25', v: 28.92, txt: '$28.92'}, {label: '2025/26', v: 269.92, txt: '$269.92'}]},
};
export const Bars: React.FC<BoardProps> = ({f, ups}) => {
  const set = SETS[last(ups, f, 'set', 'twh')];
  const show = Number(last(ups, f, 'show', '9'));
  const max = Math.max(...set.bars.map((b) => b.v));
  const bw = 260, gap = 120, base = 860, hMax = 560;
  const x0 = W / 2 - (set.bars.length * bw + (set.bars.length - 1) * gap) / 2;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: e01(f, 0, 10)}}>
      <div style={{position: 'absolute', left: x0, top: 110}}>
        <Mono size={24}>{set.title}</Mono>
      </div>
      <div style={{position: 'absolute', left: x0 - 20, top: base, width: set.bars.length * (bw + gap), height: 3, background: C.ink}} />
      {set.bars.map((b, i) => {
        const at = ups.find((u) => Number(u.o.show ?? 9) >= i + 1)?.at ?? 4 + i * 10;
        const vis = show >= i + 1;
        const k = vis ? settle((f - at) / 18) : 0;
        const h = (b.v / max) * hMax * k;
        const key = i === set.bars.length - 1 || set.bars.length === 2;
        return (
          <div key={i}>
            <div style={{position: 'absolute', left: x0 + i * (bw + gap), top: base - h, width: bw, height: h, boxSizing: 'border-box', background: i === 2 ? 'transparent' : key && i === 1 ? C.hum : C.ink, border: i === 2 ? `6px dashed ${C.ink2}` : undefined}} />
            <div style={{position: 'absolute', left: x0 + i * (bw + gap) - 80, top: base - h - 96, width: bw + 160, textAlign: 'center', whiteSpace: 'nowrap', opacity: e01(f, at + 10, 8)}}>
              <Big size={64} color={i === 1 ? C.hum : C.ink}>{vis ? b.txt : ''}</Big>
            </div>
            <div style={{position: 'absolute', left: x0 + i * (bw + gap) - 30, top: base + 20, width: bw + 60, textAlign: 'center', fontFamily: F.sans, fontWeight: 700, fontSize: 28, color: C.ink2, opacity: vis ? 1 : 0.3}}>{b.label}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: x0, top: base + 90}}>
        <Mono size={16}>Source · {set.src}</Mono>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ pie: a quarter of the town's water */
export const Pie: React.FC<BoardProps> = ({f, ups}) => {
  const pct = Number(ups[0].o.pct ?? 29);
  const k = e01(f, 4, 26);
  const r = 300, cx = W / 2 - 260, cy = H / 2;
  const a = ((pct / 100) * 360 * k - 90) * (Math.PI / 180);
  const large = pct * k > 50 ? 1 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: e01(f, 0, 10)}}>
      <svg width={W} height={H}>
        <circle cx={cx} cy={cy} r={r} fill="#C9D9E3" />
        <path d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)} Z`} fill={C.hum} />
      </svg>
      <div style={{position: 'absolute', left: cx + r + 90, top: cy - 140}}>
        <Big size={150} color={C.hum}>
          {Math.round(pct * k)}%
        </Big>
        <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 38, color: C.ink, marginTop: 14, maxWidth: 560}}>of The Dalles' water went to Google's data centres in 2021</div>
        <Mono size={16} style={{marginTop: 18}}>Source · The Oregonian (2022)</Mono>
      </div>
    </div>
  );
};

const Drop: React.FC<{h: number; style?: React.CSSProperties}> = ({h, style}) => (
  <svg width={h * 0.72} height={h} viewBox="0 0 72 100" style={style}>
    <path d="M36 2 C 36 2, 4 46, 4 66 A 32 32 0 0 0 68 66 C 68 46, 36 2, 36 2 Z" fill="#5AA9D6" />
    <path d="M22 62 C 20 72, 26 82, 36 84" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />
  </svg>
);
/* ------------------------------------------------------------------ split: a bottle per conversation, or a few drops per question */
export const Split: React.FC<BoardProps> = ({f, ups}) => {
  const show = Number(last(ups, f, 'show', '0'));
  const verdict = Number(last(ups, f, 'verdict', '0'));
  const q = last(ups, f, 'q') === '1';
  const at = (n: number) => ups.find((u) => Number(u.o.show ?? 0) >= n)?.at ?? 0;
  const bottle = asset('water_bottle');
  const side = (i: number) => {
    const vis = show >= i;
    const k = vis ? settle((f - at(i)) / 16) : 0;
    return {opacity: 0.25 + 0.75 * k, transform: `translateY(${(1 - k) * 40}px)`};
  };
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: W / 2 - 2, top: 90, width: 4, height: H - 180, background: C.ink, opacity: e01(f, 0, 12)}} />
      <div style={{position: 'absolute', left: 0, width: W / 2, top: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', ...side(1)}}>
        <div style={{height: 520, display: 'flex', alignItems: 'flex-end'}}>{bottle && <Img src={staticFile(bottle.src)} style={{height: 500, objectFit: 'contain'}} />}</div>
        <Big size={84}>~500 mL</Big>
        <Mono size={24} style={{marginTop: 12}}>per 10–50 questions · UC Riverside (2023)</Mono>
      </div>
      <div style={{position: 'absolute', left: W / 2, width: W / 2, top: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', ...side(2)}}>
        <div style={{height: 520, display: 'flex', alignItems: 'flex-end', gap: 30}}>
          {[0, 1, 2].map((i) => <Drop key={i} h={90} style={{marginBottom: 40}} />)}
        </div>
        <Big size={84}>~1/15 tsp</Big>
        <Mono size={24} style={{marginTop: 12}}>per question · Sam Altman (2025)</Mono>
      </div>
      {q && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', opacity: e01(f, at(2) + 40, 10)}}>
          <Big size={72} color={C.hum}>Both right?</Big>
        </div>
      )}
      {verdict > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center'}}>
          <span style={{background: C.ink, color: '#fff', padding: '14px 34px', fontFamily: F.display, fontWeight: 900, fontSize: 60}}>
            Both <span style={{color: C.hum}}>real</span>
            {verdict > 1 ? <> · both <span style={{color: C.hum}}>partial</span></> : null}
          </span>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ quote card */
export const Quote: React.FC<BoardProps> = ({f, ups}) => {
  const text = ups[0].o.text ?? '';
  const by = ups[0].o.by ?? '';
  const n = text.length ? Math.floor(interpolate(f, [8, 8 + text.length * 1.6], [0, text.length], clamp)) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 220px'}}>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 150, color: C.hum, lineHeight: 0.6, opacity: e01(f, 0, 8)}}>“</div>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: text.length > 30 ? 96 : 130, color: C.ink, textAlign: 'center', lineHeight: 1.05, minHeight: 140}}>{text.slice(0, n)}</div>
      <Mono size={26} style={{marginTop: 40, opacity: e01(f, 8 + text.length * 1.6, 12)}}>
        — {by}
      </Mono>
    </div>
  );
};

/* ------------------------------------------------------------------ money flow: OpenAI → Sama → workers */
export const Pay: React.FC<BoardProps> = ({f, ups}) => {
  const show = Number(last(ups, f, 'show', '1'));
  const at2 = ups.find((u) => u.o.show === '2')?.at ?? 1e9;
  const k1 = e01(f, 0, 12);
  const k2 = show >= 2 ? e01(f, at2, 14) : 0;
  const X = [330, 960, 1590], Y = H / 2 + 40;
  const box = (title: string, sub: string, x: number, o: number, hot?: boolean) => (
    <div style={{position: 'absolute', left: x - 170, top: Y - 90, width: 340, height: 180, background: C.card, border: `4px solid ${hot ? C.hum : C.ink}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <Big size={56}>{title}</Big>
      <Mono size={17} style={{marginTop: 10}}>{sub}</Mono>
    </div>
  );
  const flow = (x0: number, x1: number, amount: string, sub: string, o: number, hot?: boolean) => (
    <>
      <div style={{position: 'absolute', left: x0 + 170, top: Y - 3, width: (x1 - x0 - 340) * o, height: 6, background: hot ? C.hum : C.ink}} />
      <div style={{position: 'absolute', left: x0 + 170, width: x1 - x0 - 340, top: Y - 150, textAlign: 'center', whiteSpace: 'nowrap', opacity: o}}>
        <Big size={54} color={hot ? C.hum : C.ink}>{amount}</Big>
        <Mono size={16} style={{marginTop: 6}}>{sub}</Mono>
      </div>
    </>
  );
  // Sama and the workers start centred; the frame glides right as the client comes in on the left
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${-(X[2] - X[1]) / 2 * (1 - k2)}px)`}}>
      {box('OpenAI', 'client', X[0], k2)}
      {box('Sama', 'outsourcing firm', X[1], Math.max(k1, k2))}
      {box('Workers', 'Nairobi, Kenya', X[2], k1, true)}
      {flow(X[0], X[1], '~$12.50', 'per hour · contract', k2)}
      {flow(X[1], X[2], '$1.32–$2', 'per hour · take-home', k1, true)}
      </div>
      <Mono size={16} style={{position: 'absolute', left: 0, right: 0, bottom: 170, textAlign: 'center'}}>
        Source · TIME, Billy Perrigo (January 2023)
      </Mono>
    </div>
  );
};

/* ------------------------------------------------------------------ RLHF: people rank answers */
export const Rank: React.FC<BoardProps> = ({f, ups}) => {
  const show = Number(last(ups, f, 'show', '0'));
  const rows = [
    ['Here is a simple, safe recipe for…', 'Better', C.ink],
    ['idk, look it up yourself', 'Worse', C.ink2],
    ['[harmful instructions]', 'Harmful', C.hum],
  ];
  return (
    <div style={{position: 'absolute', left: W / 2 - 560, top: 230, width: 1120, display: 'flex', flexDirection: 'column', gap: 34}}>
      {rows.map(([t, tag, col], i) => {
        const at = ups.find((u) => Number(u.o.show ?? 0) >= i + 1)?.at ?? 1e9;
        const k = e01(f, i * 6, 12);
        const s = show >= i + 1 ? settle((f - at) / 10) : 0;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 30, opacity: k}}>
            <div style={{flex: 1, background: C.card, padding: '26px 34px', fontFamily: F.sans, fontWeight: 500, fontSize: 36, color: C.ink, borderRadius: 12, filter: i === 2 ? 'blur(3px)' : undefined}}>{t}</div>
            <div style={{width: 260, transform: `scale(${0.6 + 0.4 * s}) rotate(${-6 * s}deg)`, opacity: s, border: `5px solid ${col}`, color: col, fontFamily: F.display, fontWeight: 900, fontSize: 46, textAlign: 'center', padding: '8px 0'}}>{tag}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ two tiers */
export const Tiers: React.FC<BoardProps> = ({f, ups}) => {
  const show = Number(last(ups, f, 'show', '1'));
  const at2 = ups.find((u) => u.o.show === '2')?.at ?? 1e9;
  const people = (n: number, y: number, col: string, k: number, size: number) =>
    Array.from({length: n}, (_, i) => (
      <div key={i} style={{position: 'absolute', left: W / 2 - (n * (size + 10)) / 2 + i * (size + 10), top: y, opacity: e01(k, i * 0.7, 4)}}>
        <svg width={size} height={size * 1.6} viewBox="0 0 20 32">
          <circle cx={10} cy={6} r={5} fill={col} />
          <path d="M2 30 C2 16, 18 16, 18 30 Z" fill={col} />
        </svg>
      </div>
    ));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Mono size={26} color={C.ink} style={{position: 'absolute', left: 140, top: 180}}>Experts · well paid</Mono>
      {people(6, 160, C.ink, f, 54)}
      <div style={{position: 'absolute', left: 200, right: 200, top: 400, height: 4, background: C.ink, opacity: e01(f, 4, 10)}} />
      {show >= 2 && (
        <>
          <Mono size={26} color={C.hum} style={{position: 'absolute', left: 140, top: 470}}>A hidden army · a few dollars an hour</Mono>
          {[0, 1, 2].map((r) => (
            <React.Fragment key={r}>{people(30, 540 + r * 120, C.hum, f - at2 - r * 6, 40)}</React.Fragment>
          ))}
        </>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ crowd of people icons */
export const People: React.FC<BoardProps> = ({f, ups}) => {
  const n = Number(ups[0].o.n ?? 60);
  const cols = 15;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {Array.from({length: n}, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const o = e01(f, random(`pp${i}`) * 24, 6);
        return (
          <svg key={i} width={70} height={110} viewBox="0 0 20 32" style={{position: 'absolute', left: W / 2 - (cols * 96) / 2 + c * 96, top: 160 + r * 140, opacity: o}}>
            <circle cx={10} cy={6} r={5} fill={i % 7 === 3 ? C.hum : C.ink} />
            <path d="M2 30 C2 16, 18 16, 18 30 Z" fill={i % 7 === 3 ? C.hum : C.ink} />
          </svg>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ unreadable text (dark content, blurred) */
export const BlurText: React.FC<BoardProps> = ({f, ups}) => {
  const words = ups.filter((u) => u.at <= f + 2).map((u) => u.o.word);
  const lines = Array.from({length: 16}, (_, i) => i);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      {lines.map((i) => (
        <div key={i} style={{position: 'absolute', left: 120 + (i % 3) * 30, right: 120, top: 60 + i * 64 - (f * 1.2) % 64, height: 26, borderRadius: 13, background: C.ink, opacity: 0.18 + 0.1 * Math.sin(i), filter: 'blur(7px)', width: 900 + random(`bl${i}`) * 700}} />
      ))}
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, flexWrap: 'wrap', padding: 200}}>
        {words.map((w, i) => (
          <span key={i} style={{fontFamily: F.display, fontWeight: 900, fontSize: 96, color: i === words.length - 1 ? C.hum : C.ink, background: C.paper, padding: '0 18px', opacity: i === words.length - 1 ? 1 : 0.45}}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ labels stamped on examples */
export const Labels: React.FC<BoardProps> = ({f, ups}) => {
  const tags = ['', 'VIOLENCE', 'ABUSE', 'HATE'];
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 12}, (_, i) => {
        const c = i % 4, r = Math.floor(i / 4);
        const tag = i < 3 ? tags[i + 1] : tags[1 + (i % 3)];
        const at = ups.find((u) => Number(u.o.n) >= 1 + (i % 3) + 1)?.at ?? ups[0].at + 12 + i * 3;
        const s = settle((f - at - Math.floor(i / 3) * 3) / 8);
        return (
          <div key={i} style={{position: 'absolute', left: 230 + c * 380, top: 170 + r * 260, width: 330, height: 200, background: C.card, transform: `rotate(${(random(`lb${i}`) - 0.5) * 6}deg)`, opacity: e01(f, i * 2, 8)}}>
            {[0, 1, 2, 3].map((k) => (
              <div key={k} style={{margin: '22px 24px 0', height: 14, borderRadius: 7, background: C.mute, filter: 'blur(4px)'}} />
            ))}
            <div style={{position: 'absolute', right: 16, bottom: 18, transform: `rotate(-8deg) scale(${0.7 + 0.3 * s})`, opacity: s, border: `4px solid ${C.hum}`, color: C.hum, fontFamily: F.mono, fontWeight: 500, fontSize: 24, letterSpacing: '0.1em', padding: '4px 12px'}}>{tag}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ evaporative cooling diagram */
export const Cool: React.FC<BoardProps> = ({f, ups}) => {
  const step = Number(last(ups, f, 'step', '1'));
  const at = (n: number) => ups.find((u) => Number(u.o.step) >= n)?.at ?? 1e9;
  const rack = asset('server_room');
  const tower = asset('cooling_tower_cut');
  const steam = asset('steam');
  const k = (n: number) => (step >= n ? settle((f - at(n)) / 14) : 0);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 120, top: 380, width: 520, height: 360, opacity: k(1), transform: `translateX(${(1 - k(1)) * -80}px)`, background: '#fff', padding: 12}}>
        {rack && <Img src={staticFile(rack.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
        <Mono size={20} color={C.ink} style={{marginTop: 18}}>servers · hot air</Mono>
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d="M 660 560 C 820 560, 860 640, 1040 640" fill="none" stroke={C.hum} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k(2)} />
        <path d="M 1010 615 L 1045 640 L 1010 665" fill="none" stroke={C.hum} strokeWidth={10} strokeLinecap="round" opacity={k(2)} />
      </svg>
      <Mono size={20} color={C.ink} style={{position: 'absolute', left: 760, top: 680, opacity: k(2)}}>
        warm water
      </Mono>
      <div style={{position: 'absolute', left: 1080, top: 380, width: 520, height: 520, opacity: k(3), transform: `translateY(${(1 - k(3)) * 80}px)`}}>
        {tower && <Img src={staticFile(tower.src)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />}
      </div>
      <div style={{position: 'absolute', left: 1140, top: 60 + (1 - k(4)) * 200, width: 420, height: 380, opacity: k(4) * (0.7 + 0.3 * Math.sin(f / 9))}}>
        {steam && <Img src={staticFile(steam.src)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />}
        <Mono size={22} color={C.hum} style={{position: 'absolute', right: -60, top: 80}}>
          evaporated · gone
        </Mono>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ Taiwan Strait */
export const Strait: React.FC<BoardProps> = ({f}) => {
  const g = useGeo('world');
  if (!g) return null;
  const proj = geoMercator().center([119.8, 24.6]).scale(4200 * (1 + 0.05 * settle(f / 200))).translate([W / 2, H / 2]);
  const path = geoPath(proj);
  const a = proj([119.6, 25.0])!, b = proj([120.9, 24.6])!;
  const k = e01(f, 16, 18);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: e01(f, 0, 10)}}>
      <svg width={W} height={H}>
        {g.features.map((ft, i) => {
          const name = String((ft.properties as {name: string}).name);
          return <path key={i} d={path(ft as Feature) ?? ''} fill={name === 'Taiwan' ? C.hum : '#E3DDD1'} fillOpacity={name === 'Taiwan' ? 0.8 : 1} stroke="#B9B1A2" strokeWidth={1.2} />;
        })}
        <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * k} y2={a[1] + (b[1] - a[1]) * k} stroke={C.ink} strokeWidth={5} strokeDasharray="16 10" />
      </svg>
      <div style={{position: 'absolute', left: (a[0] + b[0]) / 2 - 150, top: (a[1] + b[1]) / 2 - 90, width: 300, textAlign: 'center', opacity: k}}>
        <span style={{background: C.card, padding: '4px 14px', fontFamily: F.display, fontWeight: 900, fontSize: 48, color: C.ink}}>~100 miles</span>
      </div>
      <div style={{position: 'absolute', left: a[0] - 420, top: a[1] - 60, fontFamily: F.display, fontWeight: 900, fontSize: 72, color: C.ink2, opacity: e01(f, 6, 10)}}>China</div>
      <div style={{position: 'absolute', left: b[0] + 140, top: b[1] + 40, fontFamily: F.display, fontWeight: 900, fontSize: 72, color: C.hum, opacity: e01(f, 10, 10)}}>Taiwan</div>
    </div>
  );
};

/* ------------------------------------------------------------------ 500 Eiffel Towers */
export const Eiffel: React.FC<BoardProps> = ({f}) => {
  const a = asset('eiffel');
  const cols = 50;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 500}, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const o = e01(f, i * 0.1, 4);
        return a ? <Img key={i} src={staticFile(a.src)} style={{position: 'absolute', left: 110 + c * 34, top: 150 + r * 72, height: 66, width: 30, objectFit: 'contain', opacity: o}} /> : <div key={i} style={{position: 'absolute', left: 110 + c * 34, top: 150 + r * 72, width: 14, height: 60, background: C.ink, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', opacity: o}} />;
      })}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center', opacity: e01(f, 50, 12)}}>
        <span style={{background: C.card, padding: '8px 30px', fontFamily: F.display, fontWeight: 900, fontSize: 64}}>
          ≈ <span style={{color: C.hum}}>500</span> Eiffel Towers of e-waste
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ a counted set of objects (e.g. ~35 turbines) */
export const Icons: React.FC<BoardProps> = ({f, ups}) => {
  const n = Number(ups[0].o.n ?? 35);
  const a = asset(ups[0].o.asset ?? 'generator');
  const label = ups[0].o.label ?? '';
  const cols = 7;
  const cw = 190, ch = 150;
  const x0 = W / 2 - (cols * cw) / 2, y0 = 120;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {Array.from({length: n}, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const k = settle((f - i * 1.6) / 10);
        return a ? <Img key={i} src={staticFile(a.src)} style={{position: 'absolute', left: x0 + c * cw + 10, top: y0 + r * ch + (1 - k) * -40, width: cw - 20, height: ch - 20, objectFit: 'contain', opacity: k}} /> : null;
      })}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', opacity: e01(f, n * 1.6, 12)}}>
        <span style={{background: C.card, padding: '8px 30px', fontFamily: F.display, fontWeight: 900, fontSize: 56, color: C.ink}}>{label}</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ five drops */
export const Drops: React.FC<BoardProps> = ({f, ups}) => {
  const n = Number(ups[0].o.n ?? 5);
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60}}>
      {Array.from({length: n}, (_, i) => {
        const k = settle((f - i * 5) / 12);
        return <Drop key={i} h={200} style={{opacity: k, transform: `translateY(${(1 - k) * -300}px)`}} />;
      })}
      <Mono size={28} style={{position: 'absolute', bottom: 200}}>0.26 mL ≈ five drops · Google (2025)</Mono>
    </div>
  );
};

/* ------------------------------------------------------------------ a stack of chat bubbles vs one hour of video */
export const Stack: React.FC<BoardProps> = ({f, ups}) => {
  const n = Number(ups[0].o.n ?? 235);
  const at1 = ups.find((u) => Number(u.o.show ?? 9) >= 1)?.at ?? 0;
  const at2 = ups.find((u) => Number(u.o.show ?? 9) >= 2)?.at ?? 1e9;
  const tv = asset('tv');
  const cols = 20;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 140, top: 300, width: 520, height: 420}}>{tv && <Img src={staticFile(tv.src)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />}</div>
      <Mono size={24} color={C.ink} style={{position: 'absolute', left: 180, top: 760}}>
        1 hour of streaming video
      </Mono>
      <div style={{position: 'absolute', left: 230, top: 160, opacity: e01(f, at1, 10), whiteSpace: 'nowrap'}}>
        <Big size={110} color={C.hum}>~80 Wh</Big>
      </div>
      <Big size={110} style={{position: 'absolute', left: 700, top: 440, opacity: e01(f, at2, 8)}}>=</Big>
      {Array.from({length: n}, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const o = e01(f, at2 + i * 0.25, 4);
        return <div key={i} style={{position: 'absolute', left: 860 + c * 48, top: 820 - r * 52, width: 40, height: 30, borderRadius: '10px 10px 10px 2px', background: i === n - 1 ? C.hum : C.ink, opacity: o}} />;
      })}
      <Mono size={24} color={C.ink} style={{position: 'absolute', left: 900, top: 880, opacity: e01(f, at2 + n * 0.25, 10)}}>
        ≈ {n} AI questions at 0.34 Wh
      </Mono>
    </div>
  );
};

/* ------------------------------------------------------------------ chapter card */
export const ChapterCard: React.FC<{f: number; n: number; title: string; dur: number}> = ({f, n, title, dur}) => {
  const k = settle(f / 16);
  const out = e01(f, dur - 12, 12);
  // which link of the chain (power, water, metal, hands) the chapter is about; -2 = the whole chain
  const hot = ({2: 0, 3: 1, 4: 3, 5: 2, 6: -2, 8: -2} as Record<number, number>)[n] ?? -1;
  const label = n === 8 ? 'The ending' : `Chapter ${n}`;
  const t = n === 6 ? 'WHO PAYS?' : title;
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 1 - out, transform: `scale(${1 + out * 0.4})`, filter: out > 0 ? `blur(${out * 20}px)` : undefined}}>
      <svg width={600} height={120} style={{opacity: k}}>
        {Array.from({length: 4}, (_, i) => (
          <rect key={i} x={30 + i * 140} y={30} width={120} height={60} rx={30} fill="none" stroke={hot === -2 || hot === i ? C.hum : C.ink} strokeWidth={10} />
        ))}
      </svg>
      <Mono size={30} color={C.hum} style={{marginTop: 30, opacity: k}}>
        {label}
      </Mono>
      <Big size={t.length > 16 ? 112 : 150} style={{marginTop: 18, transform: `translateY(${(1 - k) * 60}px)`, opacity: k, textAlign: 'center', whiteSpace: 'nowrap'}}>
        {t}
      </Big>
    </div>
  );
};
export const TitleCard: React.FC<{f: number}> = ({f}) => {
  const k = settle(f / 10);
  return (
    <div style={{position: 'absolute', inset: -10, background: C.night, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <Mono size={28} color={C.hum} style={{opacity: e01(f, 14, 12)}}>
        What it really takes to answer your question
      </Mono>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 150, whiteSpace: 'nowrap', color: C.nightInk, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 20, opacity: k, transform: `scale(${1.08 - 0.08 * k})`}}>
        The Hidden <span style={{color: C.hum}}>Cost</span> of AI
      </div>
    </div>
  );
};
export const BOARDS: Record<string, React.FC<BoardProps>> = {
  chat: Chat, map: MapBoard, pjm: PJMBoard, bill: Bill, chain: Chain, grid: Grid, counter: Counter, globe: Globe, bars: Bars, pie: Pie, split: Split, quote: Quote,
  pay: Pay, rank: Rank, tiers: Tiers, people: People, blurtext: BlurText, labels: Labels, cool: Cool, strait: Strait, eiffel: Eiffel, icons: Icons, drops: Drops, stack: Stack,
};
export {Accent, FPS};
