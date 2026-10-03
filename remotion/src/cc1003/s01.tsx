// Hook + The plan.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from './design';
import {AText, At, Camera, Draw, E, Layer, bounce, clamp, enter, kf, lerp, p01, tw} from './ae';
import {useS} from './timing';
import {LaptopRig, TERM} from './laptop';
import {Terminal} from './terminal';
import {Burst, ClaudeMark, Glass, Icon, IconTile, Rings} from './ui';

// ---------- 0.0 "What if you could add your own features … just by describing them?"
export const HookLaptop: React.FC = () => {
  const {t, w, dur} = useS();
  const a = 0;
  const ry = kf(t, [[a, 38], [a + 1.6, -8, E.out], [dur, -12]]);
  const rx = kf(t, [[a, 16], [a + 1.6, 4, E.out], [dur, 3]]);
  const z = kf(t, [[a, 0.62], [a + 1.6, 0.74, E.out], [dur, 0.78]]);
  const slide = kf(t, [[a, 520], [a + 1.6, 330, E.out], [dur, 320]]);
  const tDescribe = w('describing');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${slide}px)`}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '960px 560px', opacity: p01(t, a, 0.5)}}>
          <LaptopRig rig={{zoom: 1, x: 0, y: 0, rx, ry}} wake={clamp((t - 0.3) / 0.6)}>
            <div style={{position: 'absolute', left: TERM.x, top: TERM.y, width: TERM.w, height: TERM.h}}>
              <Terminal t={t} w={TERM.w} h={TERM.h} cmds={[{text: 'add a button that shows my token usage', at: tDescribe, enter: dur + 5}]} />
            </div>
          </LaptopRig>
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 300, width: 760}}>
        <AText t={t} text="What if you could add" at={w('what')} size={64} weight={800} by="word" color={C.ink2} />
        <AText t={t} text="your own" at={w('own') - 0.05} size={110} by="char" style={{marginTop: 18}} />
        <AText t={t} text="*features*" at={w('features') - 0.08} size={150} by="char" stagger={0.03} />
        <Layer t={t} at={enter(tDescribe - 0.1, {from: 'd', dist: 60})} style={{position: 'relative', marginTop: 34}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, padding: '16px 26px', borderRadius: 999, background: 'rgba(217,119,87,.14)', boxShadow: '0 0 0 1.5px rgba(217,119,87,.55)'}}>
            <Icon name="chat" size={36} color={C.orangeHi} p={p01(t, tDescribe, 0.6, E.inOut)} />
            <span style={{fontFamily: F.ui, fontWeight: 600, fontSize: 36, color: C.ink}}>just by describing them</span>
          </div>
        </Layer>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 0.1–0.2 "Not someday. Today. Claude Code just got mods."
export const HookMods: React.FC = () => {
  const {t, w} = useS();
  const tNot = w('not');
  const tToday = w('today');
  const tClaude = w('claude');
  const tMods = w('mods');
  const outA = tClaude - 0.25;
  const markB = bounce(t, tClaude - 0.05, 11, 120);
  return (
    <AbsoluteFill>
      {/* Not someday. → Today. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center'}}>
        <AText t={t} text="Not someday." at={tNot - 0.05} size={120} by="char" color={C.ink3} out={outA} />
        <svg width={1920} height={200} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 1 - p01(t, outA, 0.3)}}>
          <Draw t={t} d="M600 66 L1320 58" at={tToday - 0.25} dur={0.3} stroke={C.orange} width={10} />
        </svg>
      </div>
      <Layer t={t} at={(tt) => ({y: 0, s: lerp(1.9, 1, bounce(tt, tToday - 0.05, 12, 260)), o: clamp((tt - tToday + 0.05) * 8) * (1 - p01(tt, outA, 0.3, E.in)), blur: (1 - p01(tt, tToday - 0.05, 0.18)) * 18})} style={{left: 0, right: 0, top: 520, textAlign: 'center'}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 210, color: C.ink, letterSpacing: '-0.05em'}}>Today.</div>
      </Layer>
      <Layer t={t} at={enter(tToday + 0.25, {from: 'u', dist: 30, out: outA})} style={{left: 0, right: 0, top: 790, textAlign: 'center'}}>
        <span style={{fontFamily: F.mono, fontSize: 28, letterSpacing: '0.25em', color: C.orangeHi, padding: '10px 22px', borderRadius: 999, boxShadow: '0 0 0 1.5px rgba(217,119,87,.5)'}}>3 OCT 2026</span>
      </Layer>

      {/* Claude Code just got MODS */}
      <At x={960} y={360}>
        <div style={{position: 'relative'}}>
          <Rings t={t} at={tMods - 0.05} n={3} max={460} />
          <Burst t={t} at={tMods - 0.02} n={14} r0={140} r1={330} />
          <div style={{transform: `rotate(${(1 - markB) * -200}deg) scale(${markB})`, filter: `drop-shadow(0 0 ${40 + 30 * p01(t, tMods, 0.4)}px rgba(217,119,87,.55))`}}>
            <ClaudeMark size={210} />
          </div>
        </div>
      </At>
      <div style={{position: 'absolute', left: 0, right: 0, top: 545, textAlign: 'center'}}>
        <AText t={t} text="Claude Code just got" at={tClaude + 0.1} size={64} by="word" color={C.ink2} weight={800} />
      </div>
      <Layer t={t} at={(tt) => ({s: lerp(0.4, 1, bounce(tt, tMods - 0.06, 10, 200)), o: clamp((tt - tMods + 0.06) * 6)})} style={{left: 0, right: 0, top: 610, textAlign: 'center'}} size={600}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 300, color: C.orange, letterSpacing: '-0.05em', lineHeight: 1, textShadow: '0 0 60px rgba(217,119,87,.45)'}}>MODS</div>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 0.3 "I'll explain what changed, and then I'll show you exactly how … step by step."
export const HookPlan: React.FC = () => {
  const {t, w} = useS();
  const tE = w('explain');
  const tS = w('show');
  const tStep = w('step');
  const card = (at: number, from: 'l' | 'r', icon: string, kick: string, title: string, body: string) => (
    <Layer t={t} at={enter(at - 0.1, {from, dist: 220})}>
      <Glass w={640} h={420} glow={p01(t, at, 0.5) * (1 - p01(t, at + 1.2, 0.6))}>
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between'}}>
          <Icon name={icon} size={86} color={C.orangeHi} p={p01(t, at, 0.8, E.inOut)} />
          <div>
            <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.3em', color: C.orangeHi}}>{kick}</div>
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
      <div style={{position: 'absolute', left: 1030, top: 250}}>{card(tS, 'r', 'terminal', 'THEN', 'Show', 'Exactly how to use each feature')}</div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <Draw t={t} d="M905 460 L1015 460" at={tS - 0.2} dur={0.35} stroke={C.orange} width={5} />
        <Draw t={t} d="M995 442 L1017 460 L995 478" at={tS} dur={0.2} stroke={C.orange} width={5} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', gap: 40}}>
        {[1, 2, 3, 4, 5, 6].map((n, i) => {
          const b = bounce(t, tStep + i * 0.09, 12, 240);
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 40}}>
              <div style={{width: 64, height: 64, borderRadius: 32, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 30, color: i === 0 ? '#1a0e09' : C.ink, background: i === 0 ? C.orange : 'rgba(255,255,255,.08)', boxShadow: '0 0 0 1.5px rgba(255,255,255,.12)', transform: `scale(${b})`}}>{n}</div>
              {i < 5 && <div style={{width: 60, height: 3, background: C.ink4, transform: `scaleX(${p01(t, tStep + i * 0.09 + 0.1, 0.3)})`, transformOrigin: 'left'}} />}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 850, textAlign: 'center', fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.ink3, opacity: p01(t, tStep + 0.6, 0.4)}}>STEP BY STEP</div>
    </AbsoluteFill>
  );
};

// ---------- 1.* The plan: a roadmap that fills as each item is named.
export const Plan: React.FC = () => {
  const {t, w, L} = useS();
  const nodes = [
    {at: w('build'), icon: 'puzzle', label: 'Build your first mod', sub: 'Part 1'},
    {at: w('switch'), icon: 'chip', label: 'Switch models', sub: 'Opus · Sonnet 5.5'},
    {at: w('claim'), icon: 'cloud', label: 'Claim free credit', sub: 'before it expires'},
    {at: w('audit'), icon: 'clipboard', label: 'Audit your setup', sub: 'prompt-audit'},
    {at: w('hidden'), icon: 'eye', label: 'Hidden helper', sub: '"You should know"'},
  ];
  const X = [300, 630, 960, 1290, 1620];
  const tEnd = L(5);
  const fill = kf(t, [[0.2, 0], ...nodes.map((n, i): [number, number] => [n.at + 0.3, (X[i] - 200) / 1520]), [tEnd + 1.6, 1]]);
  const z = kf(t, [[0, 1.12], [tEnd, 1.02, E.inOut], [tEnd + 2.5, 0.96, E.inOut]]);
  return (
    <AbsoluteFill>
      <Camera cam={{z, y: 0}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
          <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.3em', color: C.orangeHi, opacity: p01(t, 0.1, 0.4)}}>THE PLAN</div>
          <AText t={t} text="Five things you'll do today" at={0.2} size={78} by="word" style={{marginTop: 14}} />
        </div>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <line x1={200} y1={620} x2={1720} y2={620} stroke="rgba(255,255,255,.1)" strokeWidth={4} strokeLinecap="round" />
          <line x1={200} y1={620} x2={200 + 1520 * fill} y2={620} stroke={C.orange} strokeWidth={4} strokeLinecap="round" />
        </svg>
        {nodes.map((n, i) => {
          const tick = tEnd + 0.15 + i * 0.16;
          const done = p01(t, tick, 0.3);
          return (
            <React.Fragment key={i}>
              <At x={X[i]} y={470}>
                <IconTile t={t} at={n.at - 0.05} name={n.icon} size={130} hot={t > n.at} />
              </At>
              <At x={X[i]} y={620}>
                <div style={{width: 40, height: 40, borderRadius: 20, background: t > n.at ? C.orange : '#1b1c20', boxShadow: '0 0 0 4px #0c0d10, 0 0 0 6px rgba(255,255,255,.12)', display: 'grid', placeItems: 'center', transform: `scale(${0.6 + 0.4 * bounce(t, n.at, 12, 260)})`}}>
                  {done > 0 && <Icon name="check" size={28} color="#1a0e09" width={3} p={done} />}
                </div>
              </At>
              <At x={X[i]} y={730}>
                <div style={{textAlign: 'center', width: 320, opacity: p01(t, n.at + 0.1, 0.4), transform: `translateY(${(1 - p01(t, n.at + 0.1, 0.5)) * 20}px)`}}>
                  <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 32, color: C.ink}}>{n.label}</div>
                  <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink3, marginTop: 6}}>{n.sub}</div>
                </div>
              </At>
            </React.Fragment>
          );
        })}
        <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center'}}>
          <AText t={t} text="What's new, and how to use *all* of it." at={w('know', 1) - 0.1} size={46} by="word" weight={800} color={C.ink2} />
        </div>
      </Camera>
    </AbsoluteFill>
  );
};
