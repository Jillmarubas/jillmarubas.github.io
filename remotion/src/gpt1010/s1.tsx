// Hook + The plan.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from './design';
import {AText, At, Camera, Draw, E, Layer, bounce, clamp, enter, kf, lerp, p01} from './ae';
import {useS} from './timing';
import {LaptopRig, screenToFrame} from './laptop';
import {Asst, ChatGPT, GEO, ScreenCursor, Stream, UserMsg, camAt} from './app';
import {BILL, BillSplitter} from './widgets';
import {CUES} from './cues';
import {Burst, CalendarPage, Callout, Glass, Icon, IconTile, OpenAIMark, Rings} from './ui';

// ---------- 0.0–0.1 "ChatGPT just stopped answering only in text. Ask it to split a dinner bill…"
export const HookApp: React.FC = () => {
  const {t, w, dur, loc} = useS();
  const tAsk = w('ask');
  const tBuild = w('build');
  const tPlus = loc(CUES.HookApp.plus);
  // phase A: laptop on the right, headline on the left. Phase B: laptop centred, camera on the answer.
  const b = p01(t, tAsk - 0.3, 0.9, E.inOut);
  const ry = kf(t, [[0, 38], [1.6, -8, E.out], [tAsk - 0.3, -10], [tAsk + 0.6, 0, E.inOut]]);
  const rx = kf(t, [[0, 16], [1.6, 4, E.out], [tAsk - 0.3, 3], [tAsk + 0.6, 0, E.inOut]]);
  const z = kf(t, [[0, 0.62], [1.6, 0.74, E.out], [tAsk - 0.3, 0.77], [tAsk + 0.6, 1, E.inOut]]);
  const slide = kf(t, [[0, 520], [1.6, 330, E.out], [tAsk - 0.3, 320], [tAsk + 0.6, 0, E.inOut]]);
  const Y = GEO.threadY;
  const ansY = Y + 64;
  const rig = camAt(t, [[0, 1, 756, 472], [tAsk - 0.3, 1, 756, 472], [tAsk + 0.6, 1.5, GEO.cx, ansY + 150], [dur, 1.58, GEO.cx, ansY + 170]], {ry, rx});
  const collapse = p01(t, tAsk - 0.1, 0.5, E.inOut);
  const pW = p01(t, w('split') + 0.1, 1.0, E.out);
  const plus = {x: GEO.colX + BILL.plus.x, y: ansY + BILL.plus.y};
  const fr = screenToFrame({...rig, ry: 0, rx: 0}, GEO.colX + BILL.w, ansY + 300);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${slide}px)`}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '960px 560px', opacity: p01(t, 0, 0.5)}}>
          <LaptopRig rig={rig} app="Safari" wake={clamp((t - 0.3) / 0.6)}>
            <ChatGPT
              t={t}
              thread={
                <>
                  <UserMsg y={Y} text="Split a $240 dinner bill between 5 friends" p={p01(t, 0.4, 0.4)} />
                  <Asst y={ansY} p={1 - collapse}>
                    <div style={{transform: `scaleY(${1 - collapse})`, transformOrigin: '50% 0', filter: `blur(${collapse * 6}px)`}}>
                      <Stream p={p01(t, 0.8, 1.6, E.linear)} text="Sure. $240 divided by 5 is $48 each. If you add a 10% tip, the total becomes $264, so each person pays $52.80. If someone ordered more, you could split the shared dishes evenly and add each person's own items on top." />
                    </div>
                  </Asst>
                  <Asst y={ansY} p={pW}>
                    <BillSplitter t={t} p={pW} prevPeople={5} people={6} changeAt={tPlus} />
                  </Asst>
                  <ScreenCursor t={t} keys={[[tBuild + 0.3, plus.x + 120, plus.y + 160], [tPlus, plus.x, plus.y, true], [dur, plus.x + 10, plus.y + 18]]} />
                </>
              }
            />
          </LaptopRig>
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 330, width: 820, opacity: 1 - p01(t, tAsk - 0.4, 0.3)}}>
        <AText t={t} text="ChatGPT just stopped answering" at={w('chatgpt') - 0.1} size={60} weight={800} by="word" color={C.ink2} />
        <AText t={t} text="only in *text*" at={w('only') - 0.08} size={140} by="char" stagger={0.03} style={{marginTop: 18}} />
      </div>
      <Callout t={t} at={tBuild + 0.7} x={fr.x} y={fr.y} dx={150} dy={-60} label="Built inside the chat" sub="tap it, change it" />
    </AbsoluteFill>
  );
};

// ---------- 0.2 "This started rolling out on October seventh, and Free users are included."
export const HookDate: React.FC = () => {
  const {t, w} = useS();
  const tOct = w('october');
  const tFree = w('free');
  const fb = bounce(t, tFree - 0.05, 10, 200);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
        <AText t={t} text="Rolling out *now*" at={w('rolling') - 0.15} size={80} by="word" />
      </div>
      <div style={{position: 'absolute', left: 520, top: 340}}>
        <Layer t={t} at={(tt) => ({...enter(tOct - 0.25, {from: 'l', dist: 200})(tt), r: lerp(-12, -4, p01(tt, tOct - 0.25, 0.8))})}>
          <CalendarPage t={t} at={tOct} month="OCT" day="7" note="2026" />
        </Layer>
      </div>
      <At x={1220} y={500}>
        <div style={{position: 'relative'}}>
          <Rings t={t} at={tFree} n={3} max={300} />
          <Burst t={t} at={tFree} n={12} r0={130} r1={240} color={C.accHi} />
          <div style={{transform: `scale(${fb}) rotate(${(1 - fb) * 20}deg)`, opacity: clamp(fb * 3), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{padding: '22px 54px', borderRadius: 26, background: C.acc, fontFamily: F.display, fontWeight: 900, fontSize: 120, color: '#fff', letterSpacing: '-0.03em', boxShadow: '0 30px 70px -20px rgba(16,163,127,.7)'}}>FREE</div>
            <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 40, color: C.ink, marginTop: 24, opacity: p01(t, w('included') - 0.1, 0.3)}}>users included</div>
          </div>
        </div>
      </At>
    </AbsoluteFill>
  );
};

// ---------- 0.3 "Today I'll explain what changed. Then I'll show you how to use it, step by step."
export const HookPlan: React.FC = () => {
  const {t, w} = useS();
  const tE = w('explain');
  const tS = w('show');
  const tStep = w('step');
  const card = (at: number, from: 'l' | 'r', icon: string, kick: string, title: string, body: string) => (
    <Layer t={t} at={enter(at - 0.1, {from, dist: 220})}>
      <Glass w={640} h={420} glow={p01(t, at, 0.5) * (1 - p01(t, at + 1.2, 0.6))}>
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between'}}>
          <Icon name={icon} size={86} color={C.accHi} p={p01(t, at, 0.8, E.inOut)} />
          <div>
            <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.3em', color: C.accHi}}>{kick}</div>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 64, letterSpacing: '-0.03em', marginTop: 8}}>{title}</div>
            <div style={{fontFamily: F.ui, fontSize: 28, color: C.ink2, marginTop: 10}}>{body}</div>
          </div>
        </div>
      </Glass>
    </Layer>
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 250, top: 250}}>{card(tE, 'l', 'bulb', 'FIRST', 'Explain', 'What changed, and why it matters')}</div>
      <div style={{position: 'absolute', left: 1030, top: 250}}>{card(tS, 'r', 'cursor', 'THEN', 'Show', 'How to use it on your screen')}</div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <Draw t={t} d="M905 460 L1015 460" at={tS - 0.2} dur={0.35} stroke={C.acc} width={5} />
        <Draw t={t} d="M995 442 L1017 460 L995 478" at={tS} dur={0.2} stroke={C.acc} width={5} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', gap: 40}}>
        {[1, 2, 3, 4, 5].map((n, i) => {
          const b = bounce(t, tStep + i * 0.09, 12, 240);
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 40}}>
              <div style={{width: 64, height: 64, borderRadius: 32, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 30, color: '#fff', background: i === 0 ? C.acc : 'rgba(255,255,255,.08)', boxShadow: '0 0 0 1.5px rgba(255,255,255,.12)', transform: `scale(${b})`}}>{n}</div>
              {i < 4 && <div style={{width: 60, height: 3, background: C.ink4, transform: `scaleX(${p01(t, tStep + i * 0.09 + 0.1, 0.3)})`, transformOrigin: 'left'}} />}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 850, textAlign: 'center', fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.ink3, opacity: p01(t, tStep + 0.6, 0.4)}}>STEP BY STEP</div>
    </AbsoluteFill>
  );
};

// ---------- 1.* The plan: a roadmap that fills as each part is named.
export const Plan: React.FC = () => {
  const {t, w, dur} = useS();
  const nodes = [
    {at: w('one'), icon: 'sparkle', label: 'Intelligent UI', sub: 'GPT-6 in the Chat tab'},
    {at: w('two'), icon: 'bolt', label: 'Answers start sooner', sub: 'read while it thinks'},
    {at: w('three'), icon: 'mic', label: 'Audio uploads', sub: 'meetings · lectures'},
    {at: w('four'), icon: 'code', label: 'Codex predictions', sub: 'for Codex users'},
  ];
  const X = [360, 760, 1160, 1560];
  const fill = kf(t, [[0.2, 0], ...nodes.map((n, i): [number, number] => [n.at + 0.3, (X[i] - 240) / 1440]), [dur - 0.6, 1]]);
  const z = kf(t, [[0, 1.1], [dur, 0.98, E.inOut]]);
  return (
    <AbsoluteFill>
      <Camera cam={{z, y: 0}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
          <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.3em', color: C.accHi, opacity: p01(t, 0.1, 0.4)}}>THE PLAN</div>
          <AText t={t} text="Four updates, *explained and shown*" at={0.2} size={74} by="word" style={{marginTop: 14}} />
        </div>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <line x1={240} y1={620} x2={1680} y2={620} stroke="rgba(255,255,255,.1)" strokeWidth={4} strokeLinecap="round" />
          <line x1={240} y1={620} x2={240 + 1440 * fill} y2={620} stroke={C.acc} strokeWidth={4} strokeLinecap="round" />
        </svg>
        {nodes.map((n, i) => (
          <React.Fragment key={i}>
            <At x={X[i]} y={470}>
              <IconTile t={t} at={n.at - 0.05} name={n.icon} size={130} hot={t > n.at} />
            </At>
            <At x={X[i]} y={620}>
              <div style={{width: 40, height: 40, borderRadius: 20, background: t > n.at ? C.acc : '#1b1d1e', boxShadow: '0 0 0 4px #0b0d0d, 0 0 0 6px rgba(255,255,255,.12)', display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 20, transform: `scale(${0.6 + 0.4 * bounce(t, n.at, 12, 260)})`}}>{i + 1}</div>
            </At>
            <At x={X[i]} y={730}>
              <div style={{textAlign: 'center', width: 360, opacity: p01(t, n.at + 0.1, 0.4), transform: `translateY(${(1 - p01(t, n.at + 0.1, 0.5)) * 20}px)`}}>
                <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 34, color: C.ink}}>{n.label}</div>
                <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink3, marginTop: 6}}>{n.sub}</div>
              </div>
            </At>
          </React.Fragment>
        ))}
        <At x={960} y={900}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: p01(t, 0.6, 0.5), whiteSpace: 'nowrap'}}>
            <OpenAIMark size={30} />
            <span style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.ink3}}>SOURCE: OPENAI RELEASE NOTES · 6–9 OCT 2026</span>
          </div>
        </At>
      </Camera>
    </AbsoluteFill>
  );
};
