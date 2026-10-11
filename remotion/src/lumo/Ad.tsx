// "Lumo" concept ad: a 24 s, colourful, fast-paced motion-graphics demo for a FICTIONAL habit app.
// Opens the "motion graphics with Opus 5.5" video. 1920×1080, 60 fps. Voice (Asher v4) starts at 0.6 s;
// beat times come from public/lumo/words.json (+0.6). Sound is mixed afterwards (scripts/mix_lumo.py).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import '../gpt1010/fonts';
import {E, bounce, clamp, kf, lerp, p01} from '../gpt1010/ae';
import {Icon} from '../gpt1010/ui';

export const LUMO_FPS = 60;
export const LUMO_DUR = 24;
const VO = 0.6;
const T = (s: number) => s + VO; // voice time → film time
const COL = {violet: '#7C3AED', pink: '#FF4FA3', orange: '#FF8A3D', yellow: '#FFD23F', mint: '#2EE6A8', sky: '#3BA8FF', ink: '#14102B', paper: '#FFF8EE'};
const F = {d: 'Geist, Inter, sans-serif', u: 'Inter, sans-serif', m: '"IBM Plex Mono", monospace'};

// beats (film seconds)
export const B = {
  logo: T(0.18), app: T(1.22), stick: T(3.02), tap: T(4.22) + 0.2, check: T(4.76), streak: T(5.92), nudge: T(7.34),
  water: T(9.12), steps: T(9.82), sleep: T(10.96), reading: T(11.4), place: T(12.3), color: T(13.76), lumo: T(15.06), wins: T(15.56), download: T(17.62), click: T(18.4),
};

// ---------------------------------------------------------------- pieces
const Logo: React.FC<{size?: number; t?: number}> = ({size = 160, t = 0}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.28, background: `linear-gradient(135deg, ${COL.yellow} 0%, ${COL.orange} 45%, ${COL.pink} 100%)`, boxShadow: `0 ${size * 0.08}px ${size * 0.25}px rgba(255,79,163,.45), inset 0 -${size * 0.06}px 0 rgba(0,0,0,.08)`, position: 'relative'}}>
    <svg viewBox="0 0 100 100" width={size} height={size} style={{position: 'absolute', inset: 0}}>
      <circle cx={50} cy={42} r={14} fill="#fff" />
      {Array.from({length: 8}).map((_, k) => {
        const a = (k / 8) * Math.PI * 2 + t * 0.6;
        return <line key={k} x1={50 + Math.cos(a) * 21} y1={42 + Math.sin(a) * 21} x2={50 + Math.cos(a) * 28} y2={42 + Math.sin(a) * 28} stroke="#fff" strokeWidth={5} strokeLinecap="round" />;
      })}
      <path d="M30 70 Q50 84 70 70" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" />
    </svg>
  </div>
);

const Word: React.FC<{size?: number; color?: string}> = ({size = 160, color = '#fff'}) => <span style={{fontFamily: F.d, fontWeight: 900, fontSize: size, letterSpacing: '-0.06em', color, lineHeight: 1}}>lumo</span>;

const Blobs: React.FC<{t: number; cols: string[]}> = ({t, cols}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {cols.map((c, k) => {
      const x = 960 + Math.cos(t * 0.7 + k * 2.1) * 620;
      const y = 540 + Math.sin(t * 0.9 + k * 1.7) * 360;
      return <div key={k} style={{position: 'absolute', left: x - 520, top: y - 520, width: 1040, height: 1040, borderRadius: '50%', background: c, filter: 'blur(140px)', opacity: 0.85}} />;
    })}
  </AbsoluteFill>
);

const HABITS = [
  {k: 'water', label: 'Water', sub: '6 / 8 glasses', col: COL.sky, icon: 'drop'},
  {k: 'steps', label: 'Steps', sub: '8,240 today', col: COL.orange, icon: 'feet'},
  {k: 'sleep', label: 'Sleep', sub: '7 h 45 m', col: COL.violet, icon: 'moon'},
  {k: 'reading', label: 'Reading', sub: '20 pages', col: COL.pink, icon: 'book'},
] as const;

const HabitIcon: React.FC<{name: string; size: number; color?: string}> = ({name, size, color = '#fff'}) => {
  if (name === 'moon') return <Icon name="moon" size={size} color={color} width={2.4} />;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      {name === 'drop' && <path d="M12 2.5C9 7 6 10.2 6 14a6 6 0 0 0 12 0c0-3.8-3-7-6-11.5z" />}
      {name === 'feet' && <><ellipse cx={8} cy={8} rx={3} ry={4.5} /><ellipse cx={16} cy={13} rx={3} ry={4.5} /><circle cx={8} cy={15} r={1.6} /><circle cx={16} cy={20} r={1.6} /></>}
      {name === 'book' && <path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z" />}
    </svg>
  );
};

/** The phone with the Lumo app. `checked` 0..1 fills the first habit; `streak` number. */
const Phone: React.FC<{t: number; checked: number; streak: number; tapAt?: number; scale?: number}> = ({t, checked, streak, tapAt = -9, scale = 1}) => {
  const W = 420, H = 860;
  const tp = p01(t, tapAt - 0.25, 0.25) * (1 - p01(t, tapAt + 0.15, 0.25));
  return (
    <div style={{width: W, height: H, borderRadius: 64, background: '#0E0B1F', boxShadow: '0 0 0 10px #1d1a33, 0 0 0 12px rgba(255,255,255,.25), 0 60px 120px -30px rgba(20,16,43,.8)', overflow: 'hidden', position: 'relative', transform: `scale(${scale})`}}>
      <div style={{position: 'absolute', inset: 0, background: COL.paper}} />
      <div style={{position: 'absolute', left: '50%', top: 16, width: 120, height: 32, marginLeft: -60, borderRadius: 16, background: '#0E0B1F'}} />
      <div style={{position: 'absolute', left: 30, right: 30, top: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Logo size={46} t={t} /><Word size={40} color={COL.ink} /></div>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, background: '#FFE7D1'}}>
          <svg viewBox="0 0 24 24" width={24} height={24}><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-3 1-5 1-8z" fill={COL.orange} /></svg>
          <span style={{fontFamily: F.d, fontWeight: 900, fontSize: 26, color: COL.orange}}>{streak}</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 30, top: 160, fontFamily: F.d, fontWeight: 900, fontSize: 40, color: COL.ink, letterSpacing: '-0.03em'}}>Today</div>
      {HABITS.map((h, k) => {
        const done = k === 0 ? checked : k === 2 ? 1 : 0;
        return (
          <div key={h.k} style={{position: 'absolute', left: 24, right: 24, top: 230 + k * 130, height: 110, borderRadius: 28, background: '#fff', boxShadow: '0 8px 20px rgba(20,16,43,.08)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', transform: k === 0 ? `scale(${1 - tp * 0.04})` : undefined}}>
            <div style={{width: 64, height: 64, borderRadius: 20, background: h.col, display: 'grid', placeItems: 'center'}}><HabitIcon name={h.icon} size={36} /></div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: F.u, fontWeight: 800, fontSize: 28, color: COL.ink}}>{h.label}</div>
              <div style={{fontFamily: F.u, fontWeight: 600, fontSize: 18, color: 'rgba(20,16,43,.5)'}}>{h.sub}</div>
            </div>
            <div style={{width: 52, height: 52, borderRadius: 26, border: `4px solid ${h.col}`, background: done > 0 ? h.col : 'transparent', display: 'grid', placeItems: 'center', transform: `scale(${done > 0 && done < 1 ? 1 + 0.25 * Math.sin(done * Math.PI) : 1})`}}>
              {done > 0 && <svg viewBox="0 0 24 24" width={30} height={30}><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - done)} /></svg>}
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 24, right: 24, bottom: 40, height: 90, borderRadius: 28, background: COL.ink, display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
        {['check', 'chart', 'bell', 'users'].map((i, k) => <Icon key={i} name={i} size={34} color={k === 0 ? COL.yellow : 'rgba(255,255,255,.5)'} width={2.4} />)}
      </div>
      {/* finger tap */}
      {tp > 0 && <div style={{position: 'absolute', left: 340 - 40, top: 285 - 40, width: 80, height: 80, borderRadius: 40, background: 'rgba(20,16,43,.25)', transform: `scale(${0.6 + tp * 0.6})`}} />}
    </div>
  );
};

const Burst: React.FC<{t: number; at: number; x: number; y: number; cols?: string[]; r?: number; n?: number}> = ({t, at, x, y, cols = [COL.yellow, COL.pink, COL.mint, COL.sky], r = 220, n = 14}) => {
  const p = p01(t, at, 0.6, E.out);
  if (t < at || p >= 1) return null;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, k) => {
        const a = (k / n) * Math.PI * 2;
        const r0 = r * 0.35 + r * 0.65 * p, r1 = r * 0.2 + r * p;
        return <line key={k} x1={x + Math.cos(a) * r1} y1={y + Math.sin(a) * r1} x2={x + Math.cos(a) * r0 * 1.25} y2={y + Math.sin(a) * r0 * 1.25} stroke={cols[k % cols.length]} strokeWidth={12 * (1 - p)} strokeLinecap="round" />;
      })}
    </svg>
  );
};

const Pop: React.FC<{t: number; at: number; children: React.ReactNode; from?: number; style?: React.CSSProperties; rot?: number}> = ({t, at, children, from = 0.3, style, rot = 0}) => {
  const b = bounce(t, at, 9, 260);
  const o = clamp((t - at) * 12);
  return <div style={{opacity: o, transform: `scale(${lerp(from, 1, b)}) rotate(${rot * (1 - clamp(b))}deg)`, ...style}}>{children}</div>;
};

// ---------------------------------------------------------------- the ad
export const LumoAd: React.FC = () => {
  const t = useCurrentFrame() / LUMO_FPS;
  // background palette per beat
  const bg = t < B.app ? [COL.violet, COL.pink, COL.orange] : t < B.tap - 0.3 ? [COL.pink, COL.orange, COL.yellow] : t < B.nudge - 0.3 ? [COL.mint, COL.sky, COL.violet] : t < B.water - 0.2 ? [COL.yellow, COL.orange, COL.pink] : t < B.place ? [COL.sky, COL.violet, COL.pink] : t < B.lumo - 0.3 ? [COL.orange, COL.pink, COL.violet] : [COL.violet, COL.pink, COL.orange];
  const flash = (at: number) => Math.max(0, 1 - Math.abs(t - at) * 8);
  const shake = (at: number, k = 14) => (t > at && t < at + 0.25 ? Math.sin((t - at) * 90) * k * (1 - (t - at) / 0.25) : 0);
  const sh = shake(B.stick) + shake(B.lumo, 10);
  return (
    <AbsoluteFill style={{background: COL.ink, fontFamily: F.u, overflow: 'hidden'}}>
      <Blobs t={t} cols={bg} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,.18) 2px, transparent 2px)', backgroundSize: '38px 38px', opacity: 0.35, transform: `translateY(${(t * 40) % 38}px)`}} />
      <AbsoluteFill style={{transform: `translate(${sh}px, ${sh * 0.6}px)`}}>
        {/* 0 — burst + logo */}
        {t < B.app + 0.2 && (
          <AbsoluteFill style={{opacity: 1 - p01(t, B.app - 0.1, 0.3)}}>
            {[COL.yellow, COL.pink, COL.mint, COL.sky].map((c, k) => {
              const p = p01(t, k * 0.08, 0.9, E.out);
              return <div key={c} style={{position: 'absolute', left: 960 - 1200 * p, top: 540 - 1200 * p, width: 2400 * p, height: 2400 * p, borderRadius: '50%', border: `${40 * (1 - p) + 4}px solid ${c}`, opacity: 1 - p}} />;
            })}
            <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40}}>
              <Pop t={t} at={B.logo} rot={-40}><Logo size={260} t={t} /></Pop>
              <Pop t={t} at={B.logo + 0.15}><Word size={240} /></Pop>
            </div>
            <Burst t={t} at={B.logo} x={770} y={460} r={260} />
          </AbsoluteFill>
        )}
        {/* 1 — phone + "habits that stick" */}
        {t >= B.app - 0.3 && t < B.tap - 0.2 && (
          <AbsoluteFill>
            <div style={{position: 'absolute', left: 1180, top: 110, transform: `translateY(${lerp(900, 0, p01(t, B.app - 0.3, 0.55, E.out))}px) rotate(${lerp(18, -4, p01(t, B.app - 0.3, 0.7, E.out))}deg)`}}>
              <Phone t={t} checked={0} streak={29} />
            </div>
            <div style={{position: 'absolute', left: 150, top: 300}}>
              <Pop t={t} at={T(2.78)} from={0.6}><div style={{fontFamily: F.d, fontWeight: 900, fontSize: 150, color: '#fff', letterSpacing: '-0.05em', lineHeight: 0.95, textShadow: '0 10px 30px rgba(20,16,43,.25)'}}>habits</div></Pop>
              <div style={{fontFamily: F.d, fontWeight: 800, fontSize: 70, color: '#fff', opacity: p01(t, T(1.7), 0.2), marginTop: 6}}>that actually</div>
              <Pop t={t} at={B.stick} from={2.2} rot={-18} style={{marginTop: 20, display: 'inline-block'}}>
                <div style={{padding: '10px 40px 20px', borderRadius: 26, background: COL.yellow, transform: 'rotate(-6deg)', boxShadow: '0 16px 0 rgba(20,16,43,.2)', fontFamily: F.d, fontWeight: 900, fontSize: 170, color: COL.ink, letterSpacing: '-0.05em'}}>stick.</div>
              </Pop>
            </div>
            <Burst t={t} at={B.stick} x={420} y={760} cols={[COL.yellow, '#fff', COL.pink]} />
          </AbsoluteFill>
        )}
        {/* 2 — tap, check, streak */}
        {t >= B.tap - 0.3 && t < B.nudge - 0.2 && (
          <AbsoluteFill>
            <div style={{position: 'absolute', left: 960 - 210, top: 110, transform: `scale(${kf(t, [[B.tap - 0.3, 0.8], [B.tap, 1.08, E.out], [B.streak, 1.08], [B.streak + 0.3, 0.92, E.inOut]])}) translateX(${lerp(0, -330, p01(t, B.streak - 0.2, 0.4, E.inOut))}px)`, transformOrigin: '50% 40%'}}>
              <Phone t={t} checked={p01(t, B.check, 0.35, E.out)} streak={t < B.streak ? 29 : 30} tapAt={B.tap + 0.25} />
            </div>
            <Burst t={t} at={B.check + 0.1} x={1080} y={300} cols={[COL.sky, COL.mint, COL.yellow]} r={180} />
            <div style={{position: 'absolute', left: 1080, top: 300, opacity: p01(t, B.streak - 0.1, 0.2), transform: `scale(${lerp(0.4, 1, bounce(t, B.streak - 0.1, 9, 220))})`}}>
              <svg viewBox="0 0 24 24" width={260} height={260}><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-3 1-5 1-8z" fill={COL.orange} /><path d="M12 11c.5 2 3 3 3 6a3 3 0 0 1-6 0c0-1.5 1-2.5 1.5-3.5.2 1 .6 1.5 1 1.5 0-1.5.5-2.5.5-4z" fill={COL.yellow} /></svg>
              <div style={{fontFamily: F.d, fontWeight: 900, fontSize: 200, color: '#fff', lineHeight: 0.9, letterSpacing: '-0.05em', marginTop: -10}}>{Math.round(lerp(1, 30, p01(t, B.streak, 0.9, E.out)))}</div>
              <div style={{fontFamily: F.d, fontWeight: 800, fontSize: 56, color: '#fff'}}>day streak</div>
            </div>
          </AbsoluteFill>
        )}
        {/* 3 — nudge */}
        {t >= B.nudge - 0.3 && t < B.water - 0.1 && (
          <AbsoluteFill>
            <div style={{position: 'absolute', left: 960 - 210, top: 110, transform: 'scale(0.92)'}}><Phone t={t} checked={1} streak={30} /></div>
            <div style={{position: 'absolute', left: 420, top: kf(t, [[B.nudge - 0.3, -300], [B.nudge + 0.05, 150, E.out]]), transform: `scale(${lerp(0.8, 1, bounce(t, B.nudge, 8, 240))}) rotate(${Math.sin(Math.max(0, t - B.nudge) * 18) * 3 * Math.max(0, 1 - (t - B.nudge) * 2)}deg)`}}>
              <div style={{width: 1080, padding: '28px 34px', borderRadius: 40, background: 'rgba(255,255,255,.96)', boxShadow: '0 30px 80px rgba(20,16,43,.35)', display: 'flex', alignItems: 'center', gap: 26}}>
                <Logo size={96} t={t} />
                <div>
                  <div style={{fontFamily: F.u, fontWeight: 700, fontSize: 26, color: 'rgba(20,16,43,.5)'}}>LUMO · now</div>
                  <div style={{fontFamily: F.d, fontWeight: 900, fontSize: 54, color: COL.ink, letterSpacing: '-0.02em'}}>Glass of water? You're 2 away.</div>
                </div>
              </div>
            </div>
          </AbsoluteFill>
        )}
        {/* 4 — four habits slam in */}
        {t >= B.water - 0.2 && t < B.color + 0.2 && (
          <AbsoluteFill>
            {HABITS.map((h, k) => {
              const at = B[h.k];
              const into = p01(t, B.place - 0.1, 0.6, E.inOut); // fly into the phone
              const gx = 330 + (k % 2) * 660, gy = 120 + Math.floor(k / 2) * 440;
              const px = 960 - 180 + (k % 2) * 200, py = 380 + Math.floor(k / 2) * 200;
              const x = lerp(gx, px, into), y = lerp(gy, py, into), s = lerp(1, 0.28, into);
              if (t < at - 0.05) return null;
              return (
                <div key={h.k} style={{position: 'absolute', left: x, top: y, width: 600, height: 400, transform: `scale(${s * lerp(1.6, 1, bounce(t, at, 10, 300))}) rotate(${(k % 2 ? 4 : -4) * (1 - into)}deg)`, transformOrigin: '0 0', borderRadius: 60, background: h.col, boxShadow: '0 30px 0 rgba(20,16,43,.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
                  <HabitIcon name={h.icon} size={150} />
                  <div style={{fontFamily: F.d, fontWeight: 900, fontSize: 96, color: '#fff', letterSpacing: '-0.04em'}}>{h.label}</div>
                </div>
              );
            })}
            {t > B.place - 0.2 && (
              <div style={{position: 'absolute', left: 960 - 240, top: 230, width: 480, height: 640, borderRadius: 70, border: '12px solid #fff', boxShadow: '0 40px 80px rgba(20,16,43,.35)', background: 'rgba(255,248,238,.18)', opacity: p01(t, B.place - 0.2, 0.3), transform: `scale(${lerp(1.3, 1, p01(t, B.place - 0.2, 0.5, E.out))})`, zIndex: -1}}>
                <div style={{position: 'absolute', left: '50%', top: 18, width: 110, height: 28, marginLeft: -55, borderRadius: 14, background: '#fff'}} />
              </div>
            )}
            {HABITS.map((h) => <AbsoluteFill key={h.k} style={{background: h.col, opacity: flash(B[h.k]) * 0.35, pointerEvents: 'none'}} />)}
            <div style={{position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', opacity: p01(t, B.place, 0.2) * (1 - p01(t, B.color - 0.1, 0.2))}}>
              <span style={{fontFamily: F.d, fontWeight: 900, fontSize: 80, color: '#fff', letterSpacing: '-0.03em'}}>all in one place</span>
            </div>
          </AbsoluteFill>
        )}
        {/* 5 — all in colour: splash wipe */}
        {t >= B.color - 0.3 && t < B.lumo + 0.4 && (
          <AbsoluteFill>
            {[COL.yellow, COL.mint, COL.sky, COL.violet, COL.pink, COL.orange].map((c, k) => {
              const p = p01(t, B.color - 0.2 + k * 0.08, 0.6, E.out);
              const cx = [300, 1600, 900, 200, 1500, 960][k], cy = [200, 300, 900, 800, 900, 540][k];
              return <div key={c} style={{position: 'absolute', left: cx - 1500 * p, top: cy - 1500 * p, width: 3000 * p, height: 3000 * p, borderRadius: '50%', background: c}} />;
            })}
            <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: p01(t, B.color + 0.1, 0.15)}}>
              <span style={{fontFamily: F.d, fontWeight: 900, fontSize: 260, color: '#fff', letterSpacing: '-0.06em', textShadow: '0 14px 0 rgba(20,16,43,.15)'}}>all in color</span>
            </div>
          </AbsoluteFill>
        )}
        {/* 6 — logo lockup + tagline */}
        {t >= B.lumo - 0.1 && (
          <AbsoluteFill>
            <div style={{position: 'absolute', left: 0, right: 0, top: lerp(300, 200, p01(t, B.download - 0.3, 0.5, E.inOut)), display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 46}}>
              <Pop t={t} at={B.lumo} rot={25} from={0.2}><Logo size={300} t={t} /></Pop>
              <Pop t={t} at={B.lumo + 0.1} from={0.4}><Word size={300} /></Pop>
            </div>
            <Burst t={t} at={B.lumo} x={700} y={450} r={320} n={18} />
            <div style={{position: 'absolute', left: 0, right: 0, top: lerp(700, 560, p01(t, B.download - 0.3, 0.5, E.inOut)), textAlign: 'center'}}>
              {['Small', 'wins,', 'every', 'day.'].map((w, k) => {
                const at = B.wins + k * 0.22;
                return <span key={w} style={{display: 'inline-block', margin: '0 16px', fontFamily: F.d, fontWeight: 900, fontSize: 110, color: k === 1 ? COL.yellow : '#fff', letterSpacing: '-0.04em', opacity: clamp((t - at) * 10), transform: `translateY(${(1 - bounce(t, at, 10, 260)) * 60}px)`}}>{w}</span>;
              })}
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', justifyContent: 'center'}}>
              <Pop t={t} at={B.download} from={0.5}>
                <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '30px 64px', borderRadius: 999, background: '#fff', boxShadow: '0 14px 0 rgba(20,16,43,.25)', transform: `scale(${t > B.click && t < B.click + 0.15 ? 0.92 : 1}) translateY(${t > B.click && t < B.click + 0.15 ? 8 : 0}px)`}}>
                  <Icon name="download" size={56} color={COL.pink} width={3} />
                  <span style={{fontFamily: F.d, fontWeight: 900, fontSize: 64, color: COL.ink}}>Get Lumo — free</span>
                </div>
              </Pop>
            </div>
            <Burst t={t} at={B.click} x={960} y={860} r={240} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontFamily: F.m, fontSize: 22, letterSpacing: '0.2em', color: 'rgba(255,255,255,.8)', opacity: p01(t, B.click + 0.5, 0.4)}}>CONCEPT AD · FICTIONAL BRAND · EVERY FRAME MADE WITH CODE</div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      {/* cut flashes */}
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(B.app - 0.25), flash(B.tap - 0.25), flash(B.nudge - 0.25), flash(B.lumo - 0.05)) * 0.7, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
