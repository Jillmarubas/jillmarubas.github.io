// Cold open 0:01–0:18. A MacBook with a chat app; the question is typed and sent, then the camera pulls back to show
// where it goes (router → fibre → data centre → back, in under a second); then back on the screen for the answer,
// which "weighs nothing, makes no sound" and seems to come out of the air.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AF, AnimProps, P, Tag, Note, at, ease, lerp, pop} from './akit';

const Q = 'What should I make for dinner?';
const A = 'Here are three easy ideas: a quick vegetable stir-fry, a one-pan lemon chicken, or pasta with garlic and spinach.';
const SW = 1240; // screen
const SH = 776;

const ChatApp: React.FC<{typed: string; sent: number; ans: string; caret: boolean; sending: number}> = ({typed, sent, ans, caret, sending}) => (
  <div style={{position: 'absolute', inset: 0, background: '#FFFFFF', fontFamily: AF.body, color: '#1F2128', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 46, background: '#F4F4F7', borderBottom: '1px solid #E4E4EA', display: 'flex', alignItems: 'center'}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
        <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c, marginLeft: i ? 9 : 18}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: 700, fontSize: 19, color: '#4A4D57'}}>Assistant</div>
    </div>
    <div style={{position: 'absolute', left: 0, top: 46, bottom: 0, width: 250, background: '#F7F7FA', borderRight: '1px solid #E8E8EE', padding: '22px 18px', boxSizing: 'border-box'}}>
      <div style={{background: '#FFFFFF', border: '1px solid #E1E1E8', borderRadius: 12, padding: '10px 14px', fontWeight: 700, fontSize: 18}}>+ New chat</div>
      {[150, 120, 170, 96, 140, 110].map((w, i) => (
        <div key={i} style={{width: w, height: 11, borderRadius: 6, background: '#E3E3EA', marginTop: i ? 20 : 30}} />
      ))}
    </div>
    <div style={{position: 'absolute', left: 250, top: 46, right: 0, bottom: 0}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: AF.head, fontWeight: 700, fontSize: 40, opacity: 1 - sent}}>What's on your mind tonight?</div>
      {sent > 0 && (
        <div style={{position: 'absolute', right: 60, top: 60 + (1 - sent) * 380, maxWidth: 560, background: '#EDEDF3', borderRadius: 22, padding: '14px 22px', fontSize: 26, opacity: sent}}>{Q}</div>
      )}
      {ans && <div style={{position: 'absolute', left: 60, top: 160, width: 760, fontSize: 27, lineHeight: 1.45}}>{ans}</div>}
      <div style={{position: 'absolute', left: 70, right: 70, bottom: 46, height: 70, borderRadius: 35, border: '2px solid #DCDCE4', background: '#FFFFFF', display: 'flex', alignItems: 'center', padding: '0 14px 0 28px', boxShadow: '0 6px 20px rgba(20,20,40,0.06)'}}>
        <div style={{flex: 1, fontSize: 27, color: typed ? '#1F2128' : '#9A9DA8'}}>
          {typed || (sent > 0 ? 'Ask anything' : '')}
          {caret && <span style={{color: P.blue}}>|</span>}
        </div>
        <div style={{width: 48, height: 48, borderRadius: 24, background: sending > 0 ? P.purple : typed ? '#1F2128' : '#D5D6DE', transform: `scale(${1 + 0.25 * Math.sin(Math.PI * sending)})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width={24} height={24} viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

/** A MacBook (screen, bezel, base) drawn at full size; the caller positions and scales it. */
const Mac: React.FC<{children: React.ReactNode; glow: number}> = ({children, glow}) => (
  <div style={{position: 'relative', width: SW + 60, height: SH + 60 + 40}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: SW + 60, height: SH + 60, borderRadius: 34, background: '#0C0C0F', boxShadow: `0 0 ${140 * glow}px rgba(120,170,255,${0.45 * glow}), inset 0 0 0 3px #2A2B31`}}>
      <div style={{position: 'absolute', left: 30, top: 30, width: SW, height: SH, borderRadius: 8, overflow: 'hidden'}}>{children}</div>
      <div style={{position: 'absolute', left: (SW + 60) / 2 - 60, top: 0, width: 120, height: 24, borderRadius: '0 0 12px 12px', background: '#0C0C0F'}} />
    </div>
    <div style={{position: 'absolute', left: -90, top: SH + 56, width: SW + 240, height: 34, borderRadius: '4px 4px 26px 26px', background: 'linear-gradient(#DADDE4, #9EA3AF)', boxShadow: '0 20px 40px rgba(0,0,0,0.45)'}}>
      <div style={{position: 'absolute', left: '50%', top: 0, width: 200, height: 12, marginLeft: -100, borderRadius: '0 0 12px 12px', background: '#B6BAC4'}} />
    </div>
  </div>
);

// where the question travels, in screen pixels: laptop → router → under the street → data centre
const PATH: [number, number][] = [
  [330, 610], [600, 650], [640, 760], [720, 880], [1380, 880], [1470, 760], [1540, 660],
];
const seg = PATH.slice(1).map((p, i) => Math.hypot(p[0] - PATH[i][0], p[1] - PATH[i][1]));
const total = seg.reduce((a, b) => a + b, 0);
const along = (u: number): [number, number] => {
  let d = Math.max(0, Math.min(1, u)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) {
      const k = d / seg[i];
      return [lerp(PATH[i][0], PATH[i + 1][0], k), lerp(PATH[i][1], PATH[i + 1][1], k)];
    }
    d -= seg[i];
  }
  return PATH[PATH.length - 1];
};

const Router: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => (
  <div style={{position: 'absolute', left: x - 90, top: y - 50}}>
    <svg width={180} height={110} viewBox="0 0 180 110">
      <rect x={20} y={50} width={140} height={44} rx={14} fill={P.white} />
      <rect x={52} y={14} width={8} height={40} rx={4} fill={P.white} />
      <rect x={120} y={14} width={8} height={40} rx={4} fill={P.white} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={58 + i * 22} cy={72} r={6} fill={Math.floor(f / 5 + i) % 3 ? P.green : P.grass} />
      ))}
    </svg>
  </div>
);
const DataCentre: React.FC<{x: number; y: number; f: number; busy: number}> = ({x, y, f, busy}) => (
  <div style={{position: 'absolute', left: x - 190, top: y - 200}}>
    <svg width={380} height={300} viewBox="0 0 380 300">
      <rect x={10} y={40} width={360} height={250} rx={10} fill="#E8EEF9" />
      <rect x={10} y={40} width={360} height={36} rx={10} fill="#C5D2EA" />
      {[0, 1, 2, 3, 4].map((c) => (
        <g key={c}>
          <rect x={36 + c * 66} y={96} width={48} height={176} rx={6} fill={P.ink} />
          {Array.from({length: 9}, (_, r) => {
            const on = busy > 0 ? (Math.floor(f / 2 + c * 3 + r * 7) % 4 ? 1 : 0) : (r + c) % 4 === 0 ? 1 : 0;
            return <rect key={r} x={46 + c * 66} y={108 + r * 18} width={28} height={6} rx={3} fill={on ? (busy > 0 ? P.yellow : P.green) : '#2B3150'} />;
          })}
        </g>
      ))}
      {[60, 150, 240, 320].map((vx) => (
        <rect key={vx} x={vx} y={20} width={30} height={22} rx={4} fill="#9FB0D3" />
      ))}
    </svg>
  </div>
);
const Pulse: React.FC<{x: number; y: number; color: string}> = ({x, y, color}) => (
  <div style={{position: 'absolute', left: x - 18, top: y - 18, width: 36, height: 36, borderRadius: 18, background: color, boxShadow: `0 0 30px 12px ${color}`}} />
);

export const Laptop: React.FC<AnimProps> = ({f, t0}) => {
  const w = (abs: number) => at(t0, abs);
  // the screen
  const nType = Math.floor(Math.max(0, Math.min(1, (f - w(3.2)) / (w(5.7) - w(3.2)))) * Q.length);
  const sending = Math.max(0, Math.min(1, (f - w(6.25)) / 8));
  const sent = ease(f, w(6.35), 10);
  const typed = sent > 0 ? '' : Q.slice(0, nType);
  const ans = A.slice(0, Math.floor(Math.max(0, Math.min(1, (f - w(11.2)) / (w(13.0) - w(11.2)))) * A.length));
  const caret = sent === 0 && Math.floor(f / 12) % 2 === 0;
  // camera: an angled push-in on the laptop, a pull-back to show the journey, back in for the answer
  const push = ease(f, 0, w(6.2));
  const out = ease(f, w(6.45), 16);
  const back = ease(f, w(10.85), 18);
  const air = ease(f, w(15.8), 40);
  const s = lerp(lerp(lerp(0.78, 0.92, push), 0.2, out), 0.66, back);
  const cx = lerp(lerp(960, 250, out), 720, back);
  const cy = lerp(lerp(500, 600, out), 520 - 40 * air, back);
  const rx = lerp(lerp(lerp(16, 4, push), 0, out), 6, back);
  const ry = lerp(lerp(lerp(-20, -4, push), 0, out), 10, back);
  // the journey
  const jo = out * (1 - back);
  const goU = Math.max(0, Math.min(1, (f - w(6.75)) / (w(8.4) - w(6.75))));
  const busy = f >= w(8.4) && f < w(9.4) ? 1 : 0;
  const backU = Math.max(0, Math.min(1, (f - w(9.4)) / (w(10.7) - w(9.4))));
  const ring = Math.max(0, Math.min(1, (f - w(6.43)) / (w(10.73) - w(6.43))));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 80% at 50% 40%, ${P.navy} 0%, ${P.night} 70%)`, overflow: 'hidden'}}>
      {/* desk */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, bottom: 0, background: 'linear-gradient(#2A1B5E, #1A1040)', opacity: 1 - jo}} />
      {/* journey diagram (behind the laptop, which becomes its first stop) */}
      <AbsoluteFill style={{opacity: jo}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <rect x={0} y={820} width={1920} height={260} fill="#1B1446" />
          <path d={'M' + PATH.map((p) => p.join(',')).join(' L')} stroke={P.sky} strokeOpacity={0.35} strokeWidth={10} fill="none" strokeLinejoin="round" />
          <path d={'M' + PATH.map((p) => p.join(',')).join(' L')} stroke={P.sky} strokeWidth={4} strokeDasharray="14 18" strokeDashoffset={-f * 3} fill="none" strokeLinejoin="round" />
        </svg>
        <Router x={620} y={640} f={f} />
        <DataCentre x={1640} y={640} f={f} busy={busy} />
        {[
          [250, 'Your laptop', 'You hit enter'],
          [620, 'Home router', 'Wi-Fi'],
          [1050, 'Fibre-optic cable', 'Pulses of light, under the street'],
          [1640, 'Data centre', busy ? 'GPUs working on your answer' : 'Thousands of computers'],
        ].map(([x, a, b], i) => (
          <div key={i} style={{position: 'absolute', left: (x as number) - 300, width: 600, top: i === 2 ? 920 : 760, textAlign: 'center', opacity: ease(f, w(6.6) + i * 6, 10)}}>
            <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 38, color: P.white}}>{a}</div>
            <Note style={{marginTop: 4}} color="rgba(255,255,255,0.75)">{b as string}</Note>
          </div>
        ))}
        {goU > 0 && goU < 1 && <Pulse x={along(goU)[0]} y={along(goU)[1]} color={P.yellow} />}
        {backU > 0 && backU < 1 && <Pulse x={along(1 - backU)[0]} y={along(1 - backU)[1]} color={P.grass} />}
        {/* stopwatch */}
        <div style={{position: 'absolute', left: 960 - 150, top: 70, width: 300, textAlign: 'center'}}>
          <svg width={180} height={180} viewBox="0 0 180 180">
            <circle cx={90} cy={90} r={70} stroke="rgba(255,255,255,0.18)" strokeWidth={16} fill="none" />
            <circle cx={90} cy={90} r={70} stroke={ring >= 1 ? P.grass : P.yellow} strokeWidth={16} fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 70 * ring} 999`} transform="rotate(-90 90 90)" />
            <rect x={80} y={4} width={20} height={14} rx={4} fill={P.white} />
          </svg>
          <div style={{marginTop: -128, height: 128, fontFamily: AF.head, fontWeight: 800, fontSize: 40, color: P.white, transform: `scale(${ring >= 1 ? pop(f, w(10.73), 12) : 1})`}}>{ring >= 1 ? '< 1 s' : ''}</div>
          <Note style={{marginTop: 10}}>{ring >= 1 ? 'there and back' : 'round trip'}</Note>
        </div>
      </AbsoluteFill>
      {/* the laptop */}
      <div style={{position: 'absolute', left: cx, top: cy, transform: `translate(-50%,-50%) perspective(2400px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`, transformOrigin: '50% 50%'}}>
        <Mac glow={1 - 0.6 * jo}>
          <ChatApp typed={typed} sent={sent} ans={ans} caret={caret} sending={sending} />
        </Mac>
      </div>
      {/* what the answer weighs, and the sound it makes */}
      {[
        [13.55, 'Weight', '0 g', P.yellow],
        [14.5, 'Sound', '0 dB', P.pink],
      ].map(([t, k, v, c], i) => {
        const o = pop(f, w(t as number), 12);
        return (
          <div key={i} style={{position: 'absolute', left: 1420, top: 330 + i * 190, opacity: Math.min(1, o) * back, transform: `scale(${o})`, transformOrigin: '0 50%'}}>
            <Note color="rgba(255,255,255,0.75)">{k as string}</Note>
            <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 96, color: c as string, lineHeight: 1}}>{v as string}</div>
          </div>
        );
      })}
      {/* "like the answer came out of the air" */}
      {[0, 1, 2, 3].map((i) => {
        const o = air * (0.85 - i * 0.12);
        const x = 300 + i * 420 + Math.sin((f + i * 40) / 50) * 30;
        const y = 120 + (i % 2) * 90 - air * 40;
        return (
          <svg key={i} width={360} height={160} viewBox="0 0 360 160" style={{position: 'absolute', left: x, top: y, opacity: o}}>
            <path d="M60 130 Q10 130 20 95 Q25 65 65 70 Q80 25 135 35 Q170 0 215 30 Q265 15 285 60 Q345 60 335 105 Q330 130 290 130 Z" fill={P.white} />
          </svg>
        );
      })}
      {air > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', opacity: air}}>
          <Tag bg={P.white} color={P.ink} size={36}>Out of thin air?</Tag>
        </div>
      )}
    </AbsoluteFill>
  );
};
