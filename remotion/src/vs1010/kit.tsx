// Reusable animated pieces for the comparison film. All times are local scene seconds.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../gpt1010/design';
import {AText, E, Layer, bounce, clamp, enter, lerp, p01} from '../gpt1010/ae';
import {Icon} from '../gpt1010/ui';
import {B, BR, Chip, Logo, Tile} from './brand';

export const ACC = '#F2C14E'; // the film's own accent (neutral between the three brands)

export const Kicker: React.FC<{t: number; at: number; text: string; col?: string; style?: React.CSSProperties}> = ({t, at, text, col = ACC, style}) => (
  <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.3em', color: col, opacity: p01(t, at, 0.35), transform: `translateY(${(1 - p01(t, at, 0.5)) * 16}px)`, ...style}}>{text}</div>
);

export const Glass: React.FC<{children: React.ReactNode; w?: number; pad?: number; r?: number; col?: string; style?: React.CSSProperties}> = ({children, w, pad = 30, r = 26, col, style}) => (
  <div style={{width: w, padding: pad, borderRadius: r, background: 'linear-gradient(160deg, rgba(36,39,42,.92) 0%, rgba(20,22,23,.92) 100%)', boxShadow: `0 0 0 1.5px ${col ? col + '66' : 'rgba(255,255,255,.10)'}, 0 30px 70px -20px rgba(0,0,0,.8)${col ? `, 0 0 60px ${col}22` : ''}`, boxSizing: 'border-box', ...style}}>
    {children}
  </div>
);

/** Three brand tiles in a row; each can carry a value and a sub-line underneath. */
export type TrioItem = {b: B; at: number; value?: string; sub?: string; dim?: number; hot?: number; tag?: React.ReactNode};
export const Trio: React.FC<{t: number; items: TrioItem[]; y?: number; size?: number; gap?: number; valueSize?: number}> = ({t, items, y = 300, size = 220, gap = 140, valueSize = 92}) => {
  const W = items.length * size + (items.length - 1) * gap + 200;
  return (
    <div style={{position: 'absolute', left: (1920 - W) / 2, top: y, width: W, display: 'flex', justifyContent: 'center', gap}}>
      {items.map((it, k) => {
        const p = p01(t, it.at, 0.6, E.out);
        const b = bounce(t, it.at, 12, 200);
        const hot = it.hot !== undefined ? p01(t, it.hot, 0.4) : 0;
        return (
          <div key={k} style={{width: size + 100, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * 80}px) scale(${lerp(0.7, 1, b) * (1 + hot * 0.06)})`}}>
            <Tile b={it.b} size={size} glow={0.35 + hot * 0.6} dim={it.dim ?? 0} />
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 40, color: C.ink, marginTop: 26, letterSpacing: '-0.02em'}}>{BR[it.b].name}</div>
            {it.value && <div style={{fontFamily: F.display, fontWeight: 900, fontSize: valueSize, color: hot ? BR[it.b].hi : C.ink, marginTop: 10, letterSpacing: '-0.04em', whiteSpace: 'nowrap'}}>{it.value}</div>}
            {it.sub && <div style={{fontFamily: F.mono, fontSize: 24, color: C.ink3, marginTop: 8, letterSpacing: '0.06em', textAlign: 'center'}}>{it.sub}</div>}
            {it.tag && <div style={{marginTop: 16}}>{it.tag}</div>}
          </div>
        );
      })}
    </div>
  );
};

/** A feature list for one brand: rows slide in on their cue; `no` rows get a lock. */
export type Item = {at: number; text: string; icon?: string; sub?: string; no?: boolean; hot?: boolean};
export const List: React.FC<{t: number; items: Item[]; x?: number; y?: number; w?: number; size?: number; col?: string; gap?: number}> = ({t, items, x = 0, y = 0, w = 900, size = 40, col = ACC, gap = 22}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w}}>
    {items.map((it, k) => {
      const p = p01(t, it.at, 0.5, E.out);
      const b = bounce(t, it.at + 0.1, 12, 240);
      return (
        <div key={k} style={{display: 'flex', alignItems: 'center', gap: size * 0.55, marginBottom: gap, opacity: clamp(p * 1.6), transform: `translateX(${(1 - p) * 90}px)`, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined}}>
          <div style={{width: size * 1.6, height: size * 1.6, flex: 'none', borderRadius: size * 0.45, display: 'grid', placeItems: 'center', background: it.no ? 'rgba(240,106,90,.14)' : `${col}22`, boxShadow: `inset 0 0 0 1.5px ${it.no ? C.red : col}66`, transform: `scale(${lerp(0.6, 1, b)})`}}>
            <Icon name={it.no ? 'lock' : it.icon ?? 'check'} size={size * 0.85} color={it.no ? C.red : col} width={2.2} />
          </div>
          <div>
            <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: size, color: it.no ? C.ink2 : C.ink, letterSpacing: '-0.01em', textDecoration: it.no ? 'line-through' : undefined, textDecorationColor: 'rgba(240,106,90,.7)'}}>{it.text}</div>
            {it.sub && <div style={{fontFamily: F.mono, fontSize: size * 0.52, color: C.ink3, marginTop: 4}}>{it.sub}</div>}
          </div>
        </div>
      );
    })}
  </div>
);

/** Brand header used on the left of feature scenes. */
export const BrandSide: React.FC<{t: number; b: B; at?: number; plan?: string; price?: string; x?: number; y?: number}> = ({t, b, at = 0, plan, price, x = 150, y = 300}) => (
  <Layer t={t} at={enter(at, {from: 'l', dist: 140})} style={{left: x, top: y}}>
    <div style={{width: 520}}>
      <Tile b={b} size={240} glow={0.55} />
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 84, letterSpacing: '-0.04em', marginTop: 34, color: C.ink}}>{BR[b].name}</div>
      {plan && (
        <div style={{display: 'flex', gap: 16, alignItems: 'center', marginTop: 14}}>
          <Chip text={plan} col={BR[b].hi} size={28} />
          {price && <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 52, color: BR[b].hi}}>{price}</span>}
        </div>
      )}
    </div>
  </Layer>
);

/** Big number with unit and caption. */
export const BigNum: React.FC<{t: number; at: number; value: string; unit?: string; label?: string; col?: string; size?: number}> = ({t, at, value, unit, label, col = ACC, size = 260}) => {
  const p = p01(t, at, 0.7, E.out);
  const b = bounce(t, at, 11, 170);
  return (
    <div style={{textAlign: 'center', opacity: clamp(p * 1.5)}}>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: size, letterSpacing: '-0.06em', lineHeight: 0.9, color: col, transform: `scale(${lerp(0.6, 1, b)})`, textShadow: `0 0 80px ${col}55`}}>
        {value}
        {unit && <span style={{fontSize: size * 0.36, color: C.ink, marginLeft: size * 0.06, letterSpacing: '-0.03em'}}>{unit}</span>}
      </div>
      {label && <div style={{fontFamily: F.mono, fontSize: 30, letterSpacing: '0.2em', color: C.ink2, marginTop: 30, opacity: p01(t, at + 0.3, 0.4)}}>{label}</div>}
    </div>
  );
};

/** A settings row with a switch that flips at `flip` (p from on→off or off→on). */
export const Toggle: React.FC<{t: number; label: string; sub?: string; on0: boolean; flip?: number; col?: string; w?: number}> = ({t, label, sub, on0, flip, col = '#30D158', w = 980}) => {
  const p = flip === undefined ? 0 : p01(t, flip, 0.3, E.inOut);
  const on = on0 ? 1 - p : p;
  return (
    <div style={{width: w, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '26px 34px', borderRadius: 22, background: 'rgba(255,255,255,.05)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.08)', boxSizing: 'border-box'}}>
      <div>
        <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 36, color: C.ink}}>{label}</div>
        {sub && <div style={{fontFamily: F.ui, fontSize: 24, color: C.ink3, marginTop: 6}}>{sub}</div>}
      </div>
      <div style={{width: 110, height: 64, borderRadius: 32, background: on > 0.5 ? col : 'rgba(255,255,255,.18)', position: 'relative', transition: 'none'}}>
        <div style={{position: 'absolute', top: 5, left: lerp(5, 51, on), width: 54, height: 54, borderRadius: 27, background: '#fff', boxShadow: '0 3px 8px rgba(0,0,0,.4)'}} />
      </div>
    </div>
  );
};

/** Round verdict card: "ROUND N" kicker, the winner's tile big, a short label. */
export const Verdict: React.FC<{t: number; dur: number; n?: string; win: B[]; label: string; at?: number; also?: {b: B; at: number; label: string}[]}> = ({t, dur, n, win, label, at = 0.2, also = []}) => {
  const p = p01(t, at, 0.8, E.out);
  const b = bounce(t, at, 10, 160);
  const shift = also.length ? p01(t, also[0].at - 0.2, 0.7, E.inOut) : 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: lerp(170, 120, shift), textAlign: 'center'}}>
        <Kicker t={t} at={at} text={n ? `ROUND ${n} · WINNER` : 'VERDICT'} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: lerp(260, 200, shift), display: 'flex', justifyContent: 'center', gap: 60, transform: `scale(${lerp(1, 0.78, shift)})`, transformOrigin: '50% 0'}}>
        {win.map((w) => (
          <div key={w} style={{opacity: clamp(p * 1.5), transform: `scale(${lerp(0.5, 1, b)})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{position: 'relative'}}>
              <div style={{position: 'absolute', inset: -120, background: `radial-gradient(50% 50% at 50% 50%, ${BR[w].col}55 0%, rgba(0,0,0,0) 70%)`}} />
              <Tile b={w} size={300} glow={0.9} />
              <div style={{position: 'absolute', right: -26, top: -26, width: 92, height: 92, borderRadius: 46, background: ACC, display: 'grid', placeItems: 'center', transform: `scale(${bounce(t, at + 0.5, 9, 200)})`, boxShadow: '0 10px 30px rgba(0,0,0,.5)'}}>
                <Icon name="star" size={50} color="#111" fill="#111" />
              </div>
            </div>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 96, letterSpacing: '-0.04em', marginTop: 40}}>{BR[w].name}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: lerp(800, 690, shift), textAlign: 'center'}}>
        <AText t={t} text={label} at={at + 0.5} size={58} weight={700} by="word" color={C.ink2} accent={ACC} />
      </div>
      {also.length > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 830, display: 'flex', justifyContent: 'center', gap: 50}}>
          {also.map((a) => (
            <Layer key={a.b} t={t} at={enter(a.at, {from: 'd', dist: 60})} style={{position: 'relative'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '18px 30px', borderRadius: 999, background: 'rgba(255,255,255,.06)', boxShadow: `inset 0 0 0 1.5px ${BR[a.b].col}88`}}>
                <Logo b={a.b} size={48} />
                <span style={{fontFamily: F.ui, fontWeight: 700, fontSize: 34, color: C.ink}}>{a.label}</span>
              </div>
            </Layer>
          ))}
        </div>
      )}
      {void dur}
    </AbsoluteFill>
  );
};

/** Round stinger: big centre for 1.5 s, then a corner tag for the rest of the chapter. */
export const RoundTag: React.FC<{t: number; n?: string; label?: string; title: string; dur: number; full?: boolean}> = ({t, n, label = 'ROUND', title, dur, full = true}) => {
  const HOLD = full ? 1.5 : 0;
  const col = full ? p01(t, HOLD, 0.7, E.inOut) : 1;
  const out = p01(t, dur - 0.5, 0.4, E.in);
  const big = 1 - col;
  const x = lerp(960, 70, col);
  const y = lerp(540, 64, col);
  const s = lerp(1, 0.34, col);
  const numP = p01(t, 0, 0.9, E.inOut);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: '0 0', opacity: 1 - out, zIndex: 50}}>
      <div style={{position: 'absolute', transform: `translate(${-50 * big}%, -50%)`, display: 'flex', alignItems: 'center', gap: 46, whiteSpace: 'nowrap', width: 'max-content'}}>
        {n && (
          <svg width={n.length > 1 ? 300 : 170} height={240} viewBox={`0 0 ${n.length > 1 ? 300 : 170} 240`} style={{overflow: 'visible'}}>
            <text x={0} y={200} fontFamily={F.display} fontWeight={900} fontSize={240} fill="none" stroke={ACC} strokeWidth={3} strokeDasharray="900" strokeDashoffset={900 * (1 - numP)} letterSpacing="-10">{n}</text>
            <text x={0} y={200} fontFamily={F.display} fontWeight={900} fontSize={240} fill={ACC} opacity={p01(t, 0.55, 0.5)} letterSpacing="-10">{n}</text>
          </svg>
        )}
        <div>
          <div style={{fontFamily: F.mono, fontSize: 30, letterSpacing: '0.3em', color: C.ink3, marginBottom: 14, opacity: p01(t, 0.2, 0.4)}}>{label}</div>
          <AText t={t} text={title} at={0.25} size={118} by="char" stagger={0.018} accent={ACC} style={{whiteSpace: 'nowrap'}} />
          <div style={{height: 8, marginTop: 24, borderRadius: 4, background: ACC, width: `${p01(t, 0.45, 0.7, E.inOut) * 100}%`}} />
        </div>
      </div>
    </div>
  );
};

export const TagDim: React.FC<{t: number}> = ({t}) => {
  const o = 1 - p01(t, 1.5, 0.6, E.inOut);
  return o > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(8,9,11,${0.85 * o})`, zIndex: 40}} /> : null;
};

/** Centered headline helper. */
export const Head: React.FC<{t: number; at: number; text: string; y?: number; size?: number; color?: string; by?: 'char' | 'word'; out?: number}> = ({t, at, text, y = 160, size = 88, color, by = 'word', out}) => (
  <div style={{position: 'absolute', left: 120, right: 120, top: y, textAlign: 'center'}}>
    <AText t={t} text={text} at={at} size={size} by={by} color={color} accent={ACC} out={out} />
  </div>
);

/** A warning / note stamp. */
export const Stamp: React.FC<{t: number; at: number; text: string; col?: string; icon?: string; size?: number; rot?: number}> = ({t, at, text, col = C.red, icon = 'eye', size = 34, rot = -4}) => {
  const b = bounce(t, at, 10, 220);
  const p = p01(t, at, 0.25);
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 14, border: `3px solid ${col}`, color: col, fontFamily: F.mono, fontWeight: 700, fontSize: size, letterSpacing: '0.12em', transform: `rotate(${rot}deg) scale(${lerp(1.6, 1, b)})`, opacity: p, background: `${col}14`}}>
      <Icon name={icon} size={size * 1.1} color={col} width={2.4} /> {text}
    </div>
  );
};

export {AText, E, Layer, bounce, clamp, enter, lerp, p01};

/** What a round covers, shown under the stinger while the round's first line plays; gone by `until`. */
export const RoundIntro: React.FC<{t: number; until: number; items: {icon: string; label: string; at: number}[]}> = ({t, until, items}) => {
  const o = 1 - p01(t, until - 0.45, 0.4, E.inOut);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', gap: 40, opacity: o, transform: `scale(${1 - (1 - o) * 0.05})`}}>
      {items.map((it) => {
        const p = p01(t, it.at - 0.15, 0.45);
        return (
          <div key={it.label} style={{width: 360, height: 300, borderRadius: 30, background: 'rgba(255,255,255,.05)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * 60}px) scale(${lerp(0.8, 1, bounce(t, it.at - 0.15, 12, 220))})`}}>
            <Icon name={it.icon} size={100} color={ACC} width={1.8} />
            <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 40, textAlign: 'center'}}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Gate: children fade in at `at`. */
export const After: React.FC<{t: number; at: number; children: React.ReactNode}> = ({t, at, children}) => {
  const o = p01(t, at - 0.3, 0.4);
  return o > 0 ? <div style={{position: 'absolute', inset: 0, opacity: o}}>{children}</div> : null;
};
