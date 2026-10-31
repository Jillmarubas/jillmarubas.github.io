// Scene 1, "The crash no human could see" (cold open) + title card. Pilot for style approval.
// Film time = voiceover time + VO_AT. Every beat is keyed to a word time from words.json.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import './fonts';
import {C, F, FPS} from './design';
import {Camera, Credit, Depth, Desk, Dust, E, Finish, Manila, Rise, Stamp, TypeOn, clamp, hash, lerp, p01, tw, useT, win} from './kit';

export const VO_AT = 4.0;
const v = (s: number) => s + VO_AT; // voiceover time → film time
export const S1_END = 124.5;
export const S1_DURATION = Math.round(S1_END * FPS);

// shot starts (film s): each cut lands on the first word of a line
const CUT = {desk: v(0), stakes: v(13.42), cards: v(23.08), floor: v(37.18), wire: v(52.14), back: v(66.22), snap: v(75.52), stamp: v(88.08), loop: v(91.0), dark: v(104.3), title: 109.0};

const SYMS = ['ACN', 'PG', 'MMM', 'AAPL', 'JNJ', 'GE', 'XOM', 'KO', 'IBM', 'WMT', 'HPQ', 'CAT', 'MCD', 'DIS', 'BA', 'T'];

/* ---------------------------------------------------------------- shared props */
const Tape: React.FC<{t: number; speed: number; up?: boolean; y?: number; rot?: number; o?: number}> = ({t, speed, up = false, y = 600, rot = -7, o = 1}) => {
  const off = (t * speed) % 2400;
  const items = Array.from({length: 48}).map((_, i) => SYMS[i % SYMS.length]);
  return (
    <div style={{position: 'absolute', left: -400, top: y, width: 2800, height: 92, transform: `rotate(${rot}deg)`, opacity: o, background: 'linear-gradient(#EADFCB, #D9CBB0)', boxShadow: '0 16px 24px rgba(0,0,0,0.45)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 20, left: up ? -2400 + off : -off, whiteSpace: 'nowrap', fontFamily: F.mono, fontWeight: 700, fontSize: 44, color: C.ink, letterSpacing: '0.06em'}}>
        {items.map((s, i) => (
          <span key={i} style={{marginRight: 46}}>
            {s} <span style={{color: up ? '#5E6B2A' : C.crimson}}>{up ? '▲' : '▼'}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const center: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center'};

/* ---------------------------------------------------------------- shots */
const ShotDesk: React.FC<{t: number}> = ({t}) => {
  const lt = t - CUT.desk;
  const plunge = p01(t, v(19.48), 1.3, E.in); // "evaporated": the tape slides off the desk into shadow
  return (
    <Camera z={tw(t, CUT.desk, CUT.cards - CUT.desk, 0, 120, E.inOut)} dutch={lerp(-0.5, 0.4, clamp(lt / 22))}>
      <Depth z={-240}>
        <Desk lamp={lerp(1, 0.75, p01(t, CUT.stakes, 8))} />
      </Depth>
      <Depth z={0}>
        <AbsoluteFill style={{transform: `translateY(${plunge * 900}px) rotate(${plunge * 16}deg)`, transformOrigin: '80% 60%', filter: `brightness(${1 - plunge * 0.7})`}}>
          <Tape t={t} speed={lerp(220, 900, clamp(lt / 19))} y={800} />
        </AbsoluteFill>
        {/* date and time, typed on the words that say them */}
        <div style={{...center, top: 250, fontFamily: F.mono, fontWeight: 700, fontSize: 92, color: C.gold, letterSpacing: '0.08em', opacity: win(t, v(0.18), CUT.stakes, 0.2, 0.6)}}>
          <TypeOn t={t} at={v(0.18)} text="MAY 6, 2010" cps={16} />
        </div>
        <div style={{...center, top: 372, fontFamily: F.mono, fontSize: 48, color: C.mono, letterSpacing: '0.12em', opacity: win(t, v(2.48), CUT.stakes, 0.2, 0.6)}}>
          <TypeOn t={t} at={v(2.48)} text="14:42 EDT" cps={14} />
        </div>
        {/* the stakes, on their words */}
        <div style={{...center, top: 300, fontFamily: F.display, fontWeight: 900, fontSize: 150, color: C.manila, letterSpacing: '0.06em', opacity: win(t, v(14.68), CUT.cards, 0.3, 0.5)}}>
          <Rise t={t} at={v(14.68)} text="36 MINUTES" />
        </div>
        <div style={{...center, top: 480, fontFamily: F.display, fontWeight: 900, fontSize: 120, color: C.gold, letterSpacing: '0.06em', opacity: win(t, v(16.84), CUT.cards, 0.3, 0.5)}}>
          <Rise t={t} at={v(16.84)} text="~$1 TRILLION" />
        </div>
      </Depth>
      <Depth z={160}>
        <Dust t={t} />
      </Depth>
    </Camera>
  );
};

const PriceCard: React.FC<{t: number; at: number; priceAt: number; name: string; price: string; color: string; from: number; rot: number; x: number}> = ({t, at, priceAt, name, price, color, from, rot, x}) => {
  const k = p01(t, at, 0.9);
  return (
    <div style={{position: 'absolute', left: x + (1 - k) * from, top: 300 + (1 - k) * 40, transform: `rotate(${rot * (1 - k * 0.6)}deg)`, opacity: clamp(k * 3)}}>
      <Manila w={640} h={400}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 26, borderBottom: '2px solid rgba(160,60,40,0.35)'}} />
        <div style={{position: 'absolute', left: 44, top: 70, fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.ink, letterSpacing: '0.06em'}}>{name}</div>
        <div style={{position: 'absolute', left: 44, top: 166, fontFamily: F.mono, fontSize: 26, color: '#5A4E3A', letterSpacing: '0.1em'}}>TRADED AT</div>
        <div style={{position: 'absolute', left: 40, top: 200, fontFamily: F.mono, fontWeight: 700, fontSize: 110, color, opacity: p01(t, priceAt, 0.25)}}>{price}</div>
      </Manila>
    </div>
  );
};

const ShotCards: React.FC<{t: number}> = ({t}) => (
  <Camera z={tw(t, CUT.cards, CUT.floor - CUT.cards, 0, 90, E.inOut)} x={tw(t, CUT.cards, CUT.floor - CUT.cards, -40, 40, E.inOut)} dutch={0.5}>
    <Depth z={-240}>
      <Desk lamp={0.8} />
    </Depth>
    <Depth z={0}>
      <PriceCard t={t} at={v(23.4)} priceAt={v(29.06)} name="ACCENTURE" price="$0.01" color={C.crimson} from={-1100} rot={-9} x={250} />
      <PriceCard t={t} at={v(31.52)} priceAt={v(33.0)} name="SOTHEBY'S" price="$100,000" color={C.gold} from={1100} rot={7} x={1030} />
      <div style={{...center, top: 800, fontFamily: F.mono, fontSize: 30, color: C.mono, letterSpacing: '0.06em', opacity: win(t, v(34.6), CUT.floor, 0.5, 0.4)}}>
        <TypeOn t={t} at={v(34.6)} text="Both trades were later cancelled." cps={28} />
      </div>
    </Depth>
    <Depth z={160}>
      <Dust t={t} />
    </Depth>
  </Camera>
);

/** A wall of electronic market boards, drawn (no data: bars and arrows only). `red` 0..1 turns them crimson. */
const Boards: React.FC<{t: number; red: number}> = ({t, red}) => (
  <div style={{position: 'absolute', left: -340, top: 40, width: 2600, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 22}}>
    {Array.from({length: 60}).map((_, i) => {
      const hot = hash(i * 3.1) < red;
      const col = hot ? C.crimson : C.phosphor;
      const flick = 0.75 + 0.25 * Math.sin(t * (8 + hash(i) * 9) + i);
      return (
        <div key={i} style={{height: 150, background: '#07080B', border: '2px solid #1E232C', padding: 14, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: `0 0 24px ${hot ? 'rgba(192,57,43,0.35)' : 'rgba(245,158,11,0.18)'}`}}>
          {[0, 1, 2].map((r) => (
            <div key={r} style={{display: 'flex', gap: 10, alignItems: 'center'}}>
              <div style={{height: 22, width: `${40 + hash(i * 7 + r) * 50}%`, background: col, opacity: flick * 0.85, filter: 'blur(0.6px)'}} />
              <div style={{color: col, fontFamily: F.mono, fontSize: 26, opacity: flick}}>{hot ? '▼' : '▲'}</div>
            </div>
          ))}
        </div>
      );
    })}
  </div>
);

const ShotFloor: React.FC<{t: number}> = ({t}) => {
  const comp = p01(t, v(48.4), 1.6, E.inOut); // "inside computers": the boards give way to light streaks
  return (
    <>
    <AbsoluteFill style={{background: '#050608'}} />
    <Camera z={tw(t, CUT.floor, CUT.wire - CUT.floor, 0, 260, E.inOut)} y={tw(t, CUT.floor, 9, 40, 0, E.inOut)} dutch={tw(t, CUT.floor, 14, -0.6, 0.6, E.inOut)}>
      <Depth z={-600}>
        <AbsoluteFill style={{opacity: 1 - comp, filter: 'blur(1px)'}}>
          <Boards t={t} red={clamp(p01(t, v(38.18), 9, E.inOut) * 1.1)} />
        </AbsoluteFill>
      </Depth>
      <Depth z={-200}>
        {/* light streaks: orders as light, flying past */}
        <AbsoluteFill style={{opacity: comp}}>
          {Array.from({length: 90}).map((_, i) => {
            const sp = 2600 + hash(i) * 2400;
            const x = ((hash(i + 1) * 3400 + (t - v(48.4)) * sp) % 3400) - 700;
            return <div key={i} style={{position: 'absolute', left: x, top: 60 + hash(i + 2) * 960, width: 160 + hash(i + 3) * 380, height: 2 + hash(i + 4) * 3, background: `linear-gradient(90deg, transparent, ${hash(i + 5) > 0.75 ? C.crimson : C.gold})`, opacity: 0.8}} />;
          })}
        </AbsoluteFill>
      </Depth>
      <Depth z={0}>
        <div style={{...center, top: 470, fontFamily: F.mono, fontSize: 44, letterSpacing: '0.3em', color: C.mono, opacity: win(t, v(50.16), CUT.wire, 0.25, 0.4)}}>
          <Rise t={t} at={v(50.16)} text="FRACTIONS OF A SECOND" stagger={0.02} />
        </div>
      </Depth>
    </Camera>
    <Credit text="Illustration" o={1 - comp} />
    </>
  );
};

const Strip: React.FC<{t: number; at: number; text: string; y: number; color?: string; rot: number}> = ({t, at, text, y, color = C.ink, rot}) => {
  const k = p01(t, at - 0.3, 0.6);
  return (
    <div style={{position: 'absolute', left: 360 + (1 - k) * -900, top: y, width: 1200, height: 120, transform: `rotate(${rot}deg)`, opacity: clamp(k * 2), background: 'linear-gradient(#EFE6D4, #DCCDB2)', boxShadow: '0 14px 22px rgba(0,0,0,0.45)'}}>
      <div style={{position: 'absolute', left: 40, top: 28, fontFamily: F.type, fontSize: 60, color, letterSpacing: '0.05em'}}>
        <TypeOn t={t} at={at} text={text} cps={20} />
      </div>
    </div>
  );
};

const ShotWire: React.FC<{t: number}> = ({t}) => (
  <Camera z={tw(t, CUT.wire, CUT.back - CUT.wire, 0, 100, E.inOut)} dutch={-0.4}>
    <Depth z={-240}>
      <Desk lamp={0.7} />
    </Depth>
    <Depth z={0}>
      <AbsoluteFill style={{opacity: lerp(1, 0.45, p01(t, v(64.0), 1.2))}}>
        <Strip t={t} at={v(52.42)} text="NO WAR DECLARED" y={250} rot={-2} />
        <Strip t={t} at={v(54.7)} text="NO BANK COLLAPSE" y={430} rot={1.5} />
        <Strip t={t} at={v(59.46)} text="GREECE: DEBT FEARS" y={610} rot={-1} color="#7A4A0E" />
      </AbsoluteFill>
    </Depth>
    <Depth z={160}>
      <Dust t={t} />
    </Depth>
  </Camera>
);

const ShotBack: React.FC<{t: number}> = ({t}) => (
  <Camera z={tw(t, CUT.back, CUT.snap - CUT.back, 0, 80, E.inOut)} dutch={0.3}>
    <Depth z={-240}>
      <Desk lamp={1} />
    </Depth>
    <Depth z={0}>
      <AbsoluteFill style={{transform: `translateY(${(1 - p01(t, CUT.back, 1.4)) * 700}px)`}}>
        <Tape t={t} speed={lerp(700, 160, p01(t, CUT.back, 6))} up y={640} rot={-5} />
      </AbsoluteFill>
      <div style={{...center, top: 330, fontFamily: F.display, fontWeight: 900, fontSize: 130, color: C.manila, letterSpacing: '0.08em', opacity: win(t, v(70.12), CUT.snap, 0.3, 0.4)}}>
        <Rise t={t} at={v(70.12)} text="RECOVERED" />
      </div>
    </Depth>
    <Depth z={160}>
      <Dust t={t} />
    </Depth>
  </Camera>
);

const Folder: React.FC = () => (
  <Manila w={1000} h={660} tone="#E0D0AE">
    <div style={{position: 'absolute', left: 60, top: 70, fontFamily: F.mono, fontSize: 24, color: '#5A4E3A', letterSpacing: '0.16em'}}>REPORT OF THE STAFFS OF THE CFTC AND SEC · 30 SEPT 2010</div>
    <div style={{position: 'absolute', left: 60, top: 130, right: 60, fontFamily: F.display, fontWeight: 700, fontSize: 58, color: C.ink, lineHeight: 1.12}}>Findings Regarding the Market Events of May 6, 2010</div>
    <div style={{position: 'absolute', left: 60, bottom: 60, right: 60, height: 3, background: 'rgba(90,78,58,0.4)'}} />
  </Manila>
);

const ShotSnap: React.FC<{t: number}> = ({t}) => {
  const drop = p01(t, CUT.snap + 0.15, 0.7);
  const folder = p01(t, v(80.38), 1.0);
  return (
    <Camera z={tw(t, CUT.snap, CUT.stamp - CUT.snap, 0, 140, E.inOut)} x={tw(t, v(80.38), 3, 0, 300, E.inOut)} dutch={-0.5}>
      <Depth z={-240}>
        <Desk lamp={0.65} />
      </Depth>
      <Depth z={0}>
        {/* the freeze-frame, as a Polaroid */}
        <div style={{position: 'absolute', left: 300, top: 120 + (1 - drop) * -120, transform: `rotate(${-6 + drop * 2}deg) scale(${1.08 - drop * 0.08})`, background: '#F2EEE6', padding: '34px 34px 150px', boxShadow: '0 26px 40px rgba(0,0,0,0.55)', filter: 'sepia(0.25)'}}>
          <div style={{width: 700, height: 520, overflow: 'hidden', position: 'relative', background: '#050608', filter: 'saturate(0.6) contrast(1.1)'}}>
            <div style={{transform: 'scale(0.55)', transformOrigin: '0 0', position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
              <Boards t={v(46)} red={0.8} />
            </div>
          </div>
          <div style={{position: 'absolute', left: 40, bottom: 46, fontFamily: F.mono, fontWeight: 700, fontSize: 36, color: '#2A2620', letterSpacing: '0.04em'}}>
            <TypeOn t={t} at={CUT.snap + 0.6} text="MAY 6, 2010 // 14:42:00 EDT" cps={22} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 820 + (1 - folder) * 1300, top: 250, transform: `rotate(${3 - folder * 1}deg)`}}>
          <Folder />
        </div>
      </Depth>
      <Depth z={160}>
        <Dust t={t} amt={0.7} />
      </Depth>
      {/* shutter flash: one soft 3-frame pulse (flash-safe) */}
      <AbsoluteFill style={{background: '#FFF6E6', opacity: 0.55 * win(t, CUT.snap - 0.02, CUT.snap + 0.14, 0.04, 0.1)}} />
    </Camera>
  );
};

const ShotStamp: React.FC<{t: number}> = ({t}) => {
  const hit = v(89.62);
  const shake = t > hit && t < hit + 0.12 ? Math.sin((t - hit) * 180) * 6 : 0;
  return (
    <Camera z={tw(t, CUT.stamp, 3, 140, 230, E.inOut)} x={360} y={shake + 40} dutch={-0.5}>
      <Depth z={-240}>
        <Desk lamp={0.5} />
      </Depth>
      <Depth z={0}>
        <div style={{position: 'absolute', left: 820, top: 250, transform: 'rotate(2deg)'}}>
          <Folder />
          <div style={{position: 'absolute', left: 150, top: 330}}>
            <Stamp t={t} at={hit} lines={['~$1 trillion erased', '36 minutes']} size={50} />
          </div>
        </div>
      </Depth>
    </Camera>
  );
};

const Ticket: React.FC<{label?: boolean}> = ({label = true}) => (
  <div style={{width: 380, height: 150, background: 'linear-gradient(#EFE6D4, #D8C9AE)', boxShadow: '0 14px 22px rgba(0,0,0,0.5)', padding: '20px 26px', fontFamily: F.mono, color: C.ink}}>
    <div style={{fontSize: 22, letterSpacing: '0.2em', color: '#6A5A40'}}>{label ? 'AUTOMATED ORDER' : 'ALGO'}</div>
    <div style={{fontSize: 46, fontWeight: 700, color: C.crimson, marginTop: 6}}>SELL</div>
    <div style={{fontSize: 20, letterSpacing: '0.08em'}}>E-MINI S&amp;P 500 FUTURES</div>
  </div>
);

const ShotLoop: React.FC<{t: number}> = ({t}) => {
  const ring = p01(t, v(94.88), 1.6, E.inOut);
  const spin = Math.max(0, t - v(94.88));
  const ang = spin * 18 + Math.max(0, t - v(99.94)) ** 2 * 26; // the loop speeds up on "feedback loop"
  const n = 12;
  return (
    <>
    <AbsoluteFill style={{background: C.void}} />
    <Camera z={tw(t, CUT.loop, CUT.dark - CUT.loop, 0, 200, E.inOut)} dutch={tw(t, CUT.loop, 13, 0.4, -0.8, E.inOut)}>
      <Depth z={-200}>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 40% 40% at 50% 50%, rgba(229,169,60,0.12), rgba(0,0,0,0) 70%)'}} />
      </Depth>
      <Depth z={0}>
        {Array.from({length: n}).map((_, i) => {
          const a = ((i / n) * 360 + ang) * (Math.PI / 180);
          const r = 400 * ring;
          const show = i === 0 ? p01(t, v(92.18), 0.6) : ring;
          const blur = clamp((t - v(99.94)) / 4) * 4;
          return (
            <div key={i} style={{position: 'absolute', left: 960 - 190 + Math.cos(a) * r, top: 540 - 75 + Math.sin(a) * r * 0.62, opacity: show, transform: `rotate(${Math.cos(a) * 8}deg)`, filter: `blur(${blur}px)`}}>
              <Ticket label={i === 0} />
            </div>
          );
        })}
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: ring * 0.7}}>
          <ellipse cx={960} cy={540} rx={400} ry={248} fill="none" stroke={C.gold} strokeWidth={2} strokeDasharray="10 14" strokeDashoffset={-ang * 4} />
        </svg>
      </Depth>
    </Camera>
    </>
  );
};

const ShotTitle: React.FC<{t: number}> = ({t}) => (
  <Camera z={tw(t, CUT.title, S1_END - CUT.title, 0, 110, E.inOut)} dutch={0.3}>
    <Depth z={-240}>
      <Desk lamp={0.9} />
    </Depth>
    <Depth z={0}>
      <div style={{position: 'absolute', left: 260, top: 130, transform: 'rotate(-1.5deg)'}}>
        <Manila w={1400} h={820} tone="#E6D8BE">
          <div style={{position: 'absolute', left: 80, top: 80, fontFamily: F.mono, fontSize: 26, color: '#6A5A40', letterSpacing: '0.2em'}}>SMALL PRINT · CASE FILE 01</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center'}}>
            <Stamp t={t} at={CUT.title + 1.1} lines={['The Ghost', 'in the System']} rot={-4} size={110} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: F.mono, fontSize: 34, color: '#3A3226', letterSpacing: '0.4em'}}>
            <TypeOn t={t} at={CUT.title + 3.2} text="AN INVESTIGATION" cps={12} />
          </div>
        </Manila>
      </div>
    </Depth>
    <Depth z={160}>
      <Dust t={t} />
    </Depth>
  </Camera>
);

/* ---------------------------------------------------------------- the scene */
// Brightness follows tension: warm open, darker through the plunge, lift on the recovery, cold and dark into the loop.
const exposure = (t: number) => {
  if (t < CUT.desk) return 0; // pure black while the keyboards clatter
  if (t < CUT.desk + 0.6) return p01(t, CUT.desk, 0.6);
  if (t < CUT.back) return lerp(1, 0.82, clamp((t - CUT.stakes) / (CUT.back - CUT.stakes)));
  if (t < CUT.snap) return 0.96;
  if (t < CUT.dark) return lerp(0.9, 0.72, clamp((t - CUT.snap) / (CUT.dark - CUT.snap)));
  if (t < CUT.title) return 1 - p01(t, CUT.dark, 0.5); // snaps to black
  return Math.min(p01(t, CUT.title, 0.8), 1 - p01(t, S1_END - 0.8, 0.8));
};

export const S1: React.FC = () => {
  const t = useT();
  const shot =
    t < CUT.stakes ? <ShotDesk t={t} /> :
    t < CUT.cards ? <ShotDesk t={t} /> :
    t < CUT.floor ? <ShotCards t={t} /> :
    t < CUT.wire ? <ShotFloor t={t} /> :
    t < CUT.back ? <ShotWire t={t} /> :
    t < CUT.snap ? <ShotBack t={t} /> :
    t < CUT.stamp ? <ShotSnap t={t} /> :
    t < CUT.loop ? <ShotStamp t={t} /> :
    t < CUT.title ? <ShotLoop t={t} /> :
    <ShotTitle t={t} />;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {t >= CUT.desk - 0.05 ? shot : null}
      <Finish t={t} exposure={exposure(t)} />
    </AbsoluteFill>
  );
};
