// Part 1 · Mods (explainer).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, R} from './design';
import {AText, At, Draw, E, Layer, bounce, clamp, enter, kf, lerp, p01, tw} from './ae';
import {useS} from './timing';
import {Burst, ClaudeMark, Glass, Icon} from './ui';

const CodeBars: React.FC<{t: number; at: number; n?: number; w?: number; per?: number}> = ({t, at, n = 9, w = 300, per = 0.09}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
    {Array.from({length: n}, (_, i) => {
      const indent = [0, 1, 2, 2, 1, 2, 3, 2, 0, 1, 1, 0][i % 12] * 26;
      const len = [0.7, 0.5, 0.85, 0.6, 0.4, 0.75, 0.55, 0.65, 0.3, 0.8, 0.5, 0.35][i % 12];
      const p = p01(t, at + i * per, 0.3, E.out);
      return <div key={i} style={{marginLeft: indent, height: 12, borderRadius: 6, width: (w - indent) * len * p, background: i % 4 === 1 ? 'rgba(217,119,87,.75)' : i % 3 === 0 ? 'rgba(127,167,232,.55)' : 'rgba(244,241,236,.32)'}} />;
    })}
  </div>
);

export const FileCard: React.FC<{t: number; at: number; name?: string; lines?: number; per?: number}> = ({t, at, name = 'mod.ts', lines = 9, per = 0.09}) => (
  <Glass w={400} pad={0} r={R.md} style={{overflow: 'hidden'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: `1px solid ${C.line}`, fontFamily: F.mono, fontSize: 22, color: C.ink2}}>
      <span style={{fontFamily: F.ui, fontWeight: 800, fontSize: 16, color: '#0d1b2a', background: '#7FA7E8', borderRadius: 5, padding: '3px 6px'}}>TS</span>
      {name}
    </div>
    <div style={{padding: '22px 24px 26px'}}>
      <CodeBars t={t} at={at} n={lines} per={per} />
    </div>
  </Glass>
);

// ---------- 2.0–2.1 "A mod is a small piece of TypeScript code inside a plugin that hooks directly into Claude Code."
export const ModAnatomy: React.FC = () => {
  const {t, w, L} = useS();
  const t0 = L(1);
  const tTS = w('typescript');
  const tPlugin = w('plugin');
  const tHook = w('hooks');
  const tCC = w('claude', 0);
  const plug = p01(t, tHook, 0.9, E.inOut);
  // cable from the plugin box (right edge) into the Claude Code socket
  const cable = 'M760 560 C 860 560, 900 470, 1000 470 S 1110 560, 1180 560';
  const snap = tHook + 0.9;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', opacity: p01(t, t0, 0.4)}}>
        <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.orangeHi}}>WHAT IS A MOD?</div>
      </div>
      {/* plugin box */}
      <Layer t={t} at={enter(tPlugin - 0.15, {from: 'l', dist: 200})} style={{left: 220, top: 300}}>
        <div style={{width: 540, height: 520, borderRadius: R.xl, border: '2.5px dashed rgba(244,241,236,.28)', position: 'relative'}}>
          <div style={{position: 'absolute', top: -20, left: 30, padding: '4px 16px', background: '#111215', fontFamily: F.mono, fontSize: 24, letterSpacing: '0.18em', color: C.ink2}}>PLUGIN</div>
        </div>
      </Layer>
      {/* mod.ts inside the plugin */}
      <Layer t={t} at={(tt) => ({...enter(tTS - 0.15, {from: 'z', s0: 0.5})(tt), r: lerp(-6, 0, p01(tt, tTS - 0.15, 0.6))})} style={{left: 290, top: 380}}>
        <FileCard t={t} at={tTS} />
      </Layer>
      <Layer t={t} at={enter(tTS + 0.15, {from: 'd', dist: 40})} style={{left: 290, top: 760}}>
        <div style={{fontFamily: F.ui, fontWeight: 600, fontSize: 28, color: C.ink2}}>
          a small piece of <span style={{color: C.orangeHi}}>TypeScript</span>
        </div>
      </Layer>
      {/* Claude Code */}
      <Layer t={t} at={enter(t0 + 0.2, {from: 'r', dist: 220})} style={{left: 1180, top: 300}}>
        <Glass w={540} h={520} r={R.xl} glow={p01(t, snap, 0.3) * (1 - p01(t, snap + 0.6, 0.8)) + 0.25 * p01(t, snap, 0.3)}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 26}}>
            <div style={{transform: `rotate(${tw(t, snap, 1.2, 0, 360, E.out)}deg)`}}>
              <ClaudeMark size={150} />
            </div>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 60, letterSpacing: '-0.03em'}}>Claude Code</div>
          </div>
        </Glass>
      </Layer>
      {/* cable + plug */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <Draw t={t} d={cable} at={tHook} dur={0.9} stroke={C.orange} width={7} />
      </svg>
      <div style={{position: 'absolute', left: 1180, top: 560}}>
        <Burst t={t} at={snap} n={10} r0={30} r1={110} width={5} />
      </div>
      <Layer t={t} at={enter(tHook + 0.4, {from: 'u', dist: 40})} style={{left: 830, top: 360}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: C.orangeHi}}>
          <Icon name="hook" size={34} color={C.orangeHi} p={plug} /> hooks in
        </div>
      </Layer>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center'}}>
        <AText t={t} text="Small code. *Big* reach." at={tCC + 0.4} size={54} by="word" color={C.ink2} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2.2 "It can pause or rewrite a tool call, draw new interface elements, add a new command, or even replace a built-in feature completely."
const Tile: React.FC<{t: number; at: number; title: string; icon: string; children: React.ReactNode; x: number}> = ({t, at, title, icon, children, x}) => (
  <Layer t={t} at={enter(at - 0.12, {from: 'd', dist: 160})} style={{left: x, top: 300}}>
    <Glass w={400} h={470} glow={p01(t, at, 0.3) * (1 - p01(t, at + 0.9, 0.6))}>
      <div style={{height: 230, borderRadius: R.md, background: 'rgba(0,0,0,.35)', boxShadow: `inset 0 0 0 1px ${C.line}`, position: 'relative', overflow: 'hidden'}}>{children}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 30}}>
        <Icon name={icon} size={40} color={C.orangeHi} p={p01(t, at, 0.6, E.inOut)} />
        <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 32, lineHeight: 1.15}}>{title}</div>
      </div>
    </Glass>
  </Layer>
);

export const ModPowers: React.FC = () => {
  const {t, w} = useS();
  const a1 = w('pause');
  const a2 = w('draw');
  const a3 = w('add');
  const a4 = w('replace');
  const rew = p01(t, w('rewrite'), 0.35);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center'}}>
        <AText t={t} text="What a mod can do" at={0.15} size={70} by="word" />
      </div>
      <Tile t={t} at={a1} x={100} title="Pause or rewrite a tool call" icon="pause">
        <div style={{position: 'absolute', left: 24, right: 24, top: 70, padding: '16px 18px', borderRadius: 12, background: '#16171b', fontFamily: F.mono, fontSize: 22, boxShadow: `inset 0 0 0 1px ${C.line2}`}}>
          <span style={{color: C.green}}>⏺ </span>
          <b>Bash</b>
          <span style={{color: C.ink2}}>(</span>
          <span style={{color: rew > 0.5 ? C.orangeHi : C.ink2}}>{rew > 0.5 ? 'npm test -- --ci' : 'npm test'}</span>
          <span style={{color: C.ink2}}>)</span>
        </div>
        <div style={{position: 'absolute', right: 30, top: 30, width: 44, height: 44, borderRadius: 22, background: C.orange, display: 'grid', placeItems: 'center', transform: `scale(${bounce(t, a1 + 0.1, 12, 260) * (1 - p01(t, w('rewrite') + 0.4, 0.3))})`}}>
          <Icon name="pause" size={22} color="#1a0e09" width={3} />
        </div>
        <div style={{position: 'absolute', left: 24, bottom: 26, fontFamily: F.mono, fontSize: 18, color: C.ink3, opacity: rew}}>rewritten before it runs</div>
      </Tile>
      <Tile t={t} at={a2} x={540} title="Draw new interface elements" icon="layers">
        <div style={{position: 'absolute', left: 24, right: 24, top: 64, height: 20, borderRadius: 10, overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,.06)'}}>
          {[['#7FA7E8', 0.18], ['#B9A3E8', 0.12], [C.orange, 0.32], ['#6BCB8B', 0.1]].map(([c, v], i) => (
            <div key={i} style={{width: `${(v as number) * 100 * p01(t, a2 + 0.15 + i * 0.12, 0.4)}%`, background: c as string}} />
          ))}
        </div>
        <div style={{position: 'absolute', left: 24, right: 24, top: 110, height: 52, borderRadius: 10, boxShadow: `inset 0 0 0 1.5px ${C.line2}`, fontFamily: F.mono, fontSize: 22, color: C.ink3, display: 'flex', alignItems: 'center', padding: '0 16px'}}>{'>'}</div>
      </Tile>
      <Tile t={t} at={a3} x={980} title="Add a new command" icon="plus">
        <div style={{position: 'absolute', left: 24, right: 24, top: 86, height: 58, borderRadius: 12, boxShadow: `inset 0 0 0 1.5px ${C.line2}`, display: 'flex', alignItems: 'center', padding: '0 18px', fontFamily: F.mono, fontSize: 28, color: C.orangeHi}}>
          {'> '}
          {'/my-command'.slice(0, Math.floor(clamp((t - a3 - 0.1) / 0.6) * 11))}
        </div>
      </Tile>
      <Tile t={t} at={a4} x={1420} title="Replace a built-in feature" icon="refresh">
        {(() => {
          const p = p01(t, a4 + 0.25, 0.6, E.inOut);
          return (
            <>
              <div style={{position: 'absolute', left: 60, top: 70, width: 232, height: 90, borderRadius: 14, background: '#2a2b31', display: 'grid', placeItems: 'center', fontFamily: F.mono, fontSize: 22, color: C.ink2, transform: `translateY(${p * 220}px) rotate(${p * 12}deg)`, opacity: 1 - p}}>built-in</div>
              <div style={{position: 'absolute', left: 60, top: 70, width: 232, height: 90, borderRadius: 14, background: 'rgba(217,119,87,.22)', boxShadow: '0 0 0 2px rgba(217,119,87,.8)', display: 'grid', placeItems: 'center', fontFamily: F.mono, fontSize: 22, color: C.orangeHi, transform: `translateY(${(1 - p) * -200}px)`, opacity: p}}>your mod</div>
            </>
          );
        })()}
      </Tile>
    </AbsoluteFill>
  );
};

// ---------- 2.3–2.4 "And the best part? You don't write the code. You describe what you want, and Claude writes the mod for you."
export const ModDescribe: React.FC = () => {
  const {t, w, L} = useS();
  const tBest = w('best');
  const tDont = w('dont');
  const tDescribe = w('describe');
  const tWrites = w('writes');
  const outA = tDescribe - 0.3;
  const msg = 'show my context as a bar';
  const typed = msg.slice(0, Math.floor(clamp((t - tDescribe) / 1.0) * msg.length));
  return (
    <AbsoluteFill>
      {/* A: the code you won't write */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center'}}>
        <AText t={t} text="The best part?" at={tBest - 0.1} size={56} by="word" color={C.ink3} out={outA} />
      </div>
      <Layer t={t} at={(tt) => ({...enter(tBest, {from: 'z', s0: 0.8, out: outA, to: 'z'})(tt), blur: p01(tt, tDont + 0.2, 0.6) * 6})} style={{left: 760, top: 330}}>
        <FileCard t={t} at={tBest + 0.1} lines={10} per={0.05} />
      </Layer>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: 1 - p01(t, outA, 0.3)}}>
        <Draw t={t} d="M720 330 L1200 790" at={tDont + 0.15} dur={0.3} stroke={C.red} width={12} />
        <Draw t={t} d="M1200 330 L720 790" at={tDont + 0.35} dur={0.3} stroke={C.red} width={12} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center'}}>
        <AText t={t} text="You don't write the code." at={tDont - 0.05} size={72} by="word" out={outA} />
      </div>

      {/* B: describe → Claude → mod.ts */}
      <Layer t={t} at={enter(tDescribe - 0.2, {from: 'l', dist: 200})} style={{left: 120, top: 380}}>
        <div style={{position: 'relative'}}>
          <div style={{width: 520, padding: '28px 32px', borderRadius: '30px 30px 30px 8px', background: '#F4F1EC', color: '#141414', fontFamily: F.ui, fontWeight: 600, fontSize: 36, minHeight: 120, boxShadow: '0 30px 60px -20px rgba(0,0,0,.8)'}}>
            “{typed}
            <span style={{opacity: typed.length < msg.length ? 1 : 0}}>|</span>
            {typed.length >= msg.length ? '”' : ''}
          </div>
          <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.ink3, marginTop: 22}}>YOU DESCRIBE IT</div>
        </div>
      </Layer>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <Draw t={t} d="M680 450 L820 450" at={tDescribe + 0.9} dur={0.3} stroke={C.orange} width={5} />
        <Draw t={t} d="M1100 450 L1240 450" at={tWrites - 0.1} dur={0.3} stroke={C.orange} width={5} />
      </svg>
      <At x={960} y={450}>
        <Layer t={t} at={(tt) => ({s: bounce(tt, tDescribe + 1.0, 11, 160), r: tw(tt, tDescribe + 1.0, 3, -90, 90, E.out)})} style={{left: -95, top: -95}}>
          <div style={{filter: 'drop-shadow(0 0 50px rgba(217,119,87,.5))'}}>
            <ClaudeMark size={190} />
          </div>
        </Layer>
      </At>
      <Layer t={t} at={enter(tWrites - 0.05, {from: 'r', dist: 200})} style={{left: 1290, top: 300}}>
        <FileCard t={t} at={tWrites + 0.2} name="context-bar.ts" lines={9} per={0.12} />
        <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.orangeHi, marginTop: 22}}>CLAUDE WRITES THE MOD</div>
      </Layer>
    </AbsoluteFill>
  );
};
