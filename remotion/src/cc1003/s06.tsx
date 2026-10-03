// Part 6 · You should know, Part 7 · Evals, Part 8 · Publish.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, R} from './design';
import {AText, At, Count, Draw, E, Layer, bounce, clamp, enter, kf, lerp, p01, tw} from './ae';
import {useS} from './timing';
import {Burst, Callout, ClaudeMark, Glass, Icon, IconTile, Rings} from './ui';
import {TermShot} from './shots';
import {FileCard} from './s02';

// ---------- 8.0–8.2 the built-in mod, a side agent reading along, a heads-up
export const YskExplain: React.FC = () => {
  const {t, w, L} = useS();
  const tCalled = w('called');
  const tSide = w('side');
  const tReads = w('reads');
  const tHeads = w('heads');
  const scroll = Math.max(0, t - L(1)) * 34;
  const scanY = ((t - tReads) * 140) % 380;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.ink3, opacity: p01(t, w('hidden') - 0.1, 0.3)}}>A HIDDEN HELPER{t > tCalled - 0.8 ? ' · A BUILT-IN MOD CALLED' : ''}</div>
        <AText t={t} text="“You should know”" at={tCalled - 0.05} size={92} by="char" stagger={0.025} />
      </div>
      {/* Claude's log */}
      <Layer t={t} at={enter(L(1) - 0.1, {from: 'l', dist: 200})} style={{left: 260, top: 360}}>
        <Glass w={860} h={480} pad={0} style={{overflow: 'hidden'}}>
          <div style={{padding: '14px 22px', borderBottom: `1px solid ${C.line}`, fontFamily: F.mono, fontSize: 20, color: C.ink3}}>Claude is working…</div>
          <div style={{position: 'relative', height: 420, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 26, right: 26, top: 20 - (scroll % 480), fontFamily: F.mono, fontSize: 22, lineHeight: '40px'}}>
              {Array.from({length: 24}, (_, i) => (
                <div key={i} style={{whiteSpace: 'nowrap', color: i % 4 === 0 ? C.ink : C.ink3}}>
                  <span style={{color: i % 4 === 0 ? C.green : C.ink4}}>{i % 4 === 0 ? '⏺ ' : '  ⎿ '}</span>
                  {['Edit(src/api/client.ts)', 'Updated 3 lines', 'Running tests', '12 passed', 'Read(config/prod.json)', 'Read 40 lines', 'Bash(npm run build)', 'Build finished'][i % 8]}
                </div>
              ))}
            </div>
            {t > tReads && <div style={{position: 'absolute', left: 0, right: 0, top: 20 + scanY, height: 40, background: 'linear-gradient(90deg, rgba(217,119,87,0), rgba(217,119,87,.18), rgba(217,119,87,0))', boxShadow: 'inset 0 1px 0 rgba(217,119,87,.6)'}} />}
          </div>
        </Glass>
      </Layer>
      {/* the side agent */}
      <At x={1380} y={470}>
        <Layer t={t} at={(tt) => ({s: bounce(tt, tSide - 0.05, 12, 200), y: Math.sin(tt * 2.2) * 6})} style={{left: -90, top: -90}}>
          <div style={{width: 180, height: 180, borderRadius: 90, display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at 35% 30%, #3a2a24, #18191d)', boxShadow: '0 0 0 2px rgba(217,119,87,.7), 0 0 60px rgba(217,119,87,.35)'}}>
            <Icon name="eye" size={96} color={C.orangeHi} width={1.6} p={p01(t, tSide, 0.6)} />
          </div>
          <div style={{textAlign: 'center', fontFamily: F.ui, fontWeight: 700, fontSize: 28, marginTop: 16, width: 180, opacity: p01(t, tSide + 0.2, 0.3)}}>side agent</div>
        </Layer>
      </At>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <Draw t={t} d="M1290 470 L1130 470" at={tReads} dur={0.4} stroke={C.orange} width={3} dash="8 10" />
      </svg>
      {/* heads-up */}
      <Layer t={t} at={(tt) => ({...enter(tHeads - 0.35, {from: 'r', dist: 260})(tt), r: Math.sin(Math.max(0, tt - tHeads) * 30) * 3 * (1 - p01(tt, tHeads, 0.6))})} style={{left: 1180, top: 640}}>
        <Glass w={600} pad={24} glow={0.7} style={{display: 'flex', gap: 18, alignItems: 'center'}}>
          <div style={{width: 64, height: 64, borderRadius: 18, background: C.orange, display: 'grid', placeItems: 'center', flex: 'none'}}>
            <Icon name="bell" size={36} color="#1a0e09" width={2.4} />
          </div>
          <div>
            <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 28}}>You should know</div>
            <div style={{fontFamily: F.ui, fontSize: 23, color: C.ink2, marginTop: 4}}>A heads-up about something you or Claude might have missed</div>
          </div>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 8.3–8.4 "/plugin enable cc-plugin-you-should-know@builtin" + study it
export const YskEnable: React.FC = () => {
  const {w, L} = useS();
  const at = w('command') - 0.6;
  const en = L(4) - 0.2;
  const tStudy = w('study');
  return (
    <TermShot cmd="/plugin enable cc-plugin-you-should-know@builtin" at={at} enter={en} label="TURN IT ON" entries={[{at: en + 0.35, kind: 'ok', text: 'Enabled cc-plugin-you-should-know'}]} outY={330} slide={-360} slideAt={tStudy - 0.5}>
      {(rig, t) => (
        <div style={{position: 'absolute', left: 1330, top: 250}}>
          <Layer t={t} at={enter(tStudy - 0.3, {from: 'r', dist: 200})}>
            <div style={{position: 'relative'}}>
              <FileCard t={t} at={tStudy} name="you-should-know" lines={10} per={0.05} />
              <div style={{position: 'absolute', left: kf(t, [[tStudy, 60], [tStudy + 1.2, 230, E.inOut], [tStudy + 2.4, 120, E.inOut]]), top: kf(t, [[tStudy, 120], [tStudy + 1.2, 200, E.inOut], [tStudy + 2.4, 300, E.inOut]])}}>
                <Icon name="search" size={170} color={C.orange} width={1.6} />
              </div>
              <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.22em', color: C.orangeHi, marginTop: 24, opacity: p01(t, tStudy + 0.3, 0.3)}}>STUDY IT FOR IDEAS</div>
            </div>
          </Layer>
        </div>
      )}
    </TermShot>
  );
};

// ---------- 9.0–9.1 for API builders; an eval is a test that gives you a number
export const EvalWhat: React.FC = () => {
  const {t, w, L} = useS();
  const tTest = w('test');
  const tNum = w('number');
  const tBetter = w('better');
  const vers = [0.48, 0.61, 0.74];
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(L(0) + 1.3, {from: 'd', dist: 60, out: L(1) - 0.2})} style={{left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 34px', borderRadius: 999, boxShadow: '0 0 0 1.5px rgba(217,119,87,.55)', background: 'rgba(217,119,87,.1)', fontFamily: F.ui, fontWeight: 700, fontSize: 40}}>
          <ClaudeMark size={46} /> Building on the Claude API?
        </div>
      </Layer>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <AText t={t} text="An *eval* = a test that gives you a number" at={L(1)} size={62} by="word" />
      </div>
      <At x={560} y={590}>
        <Layer t={t} at={enter(tTest - 0.2, {from: 'l', dist: 200})} style={{left: -200, top: -210}}>
          <Glass w={400} h={420} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.2em', color: C.ink3}}>SCORE</div>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 150, color: C.orange}}>
              <Count t={t} at={tNum - 0.1} dur={1.0} to={74} />
              <span style={{fontSize: 70}}>%</span>
            </div>
            <div style={{fontFamily: F.mono, fontSize: 16, color: C.ink3}}>example number</div>
          </Glass>
        </Layer>
      </At>
      <Layer t={t} at={enter(tBetter - 0.5, {from: 'r', dist: 200})} style={{left: 900, top: 380}}>
        <Glass w={760} h={420}>
          <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 32}}>Is your app getting better?</div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 50, height: 260, marginTop: 30, paddingLeft: 30}}>
            {vers.map((v, i) => (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
                <div style={{width: 120, height: 240 * v * p01(t, tBetter - 0.3 + i * 0.18, 0.7), borderRadius: 12, background: i === 2 ? C.orange : 'rgba(244,241,236,.3)'}} />
                <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink3}}>v{i + 1}</div>
              </div>
            ))}
            <div style={{opacity: p01(t, tBetter + 0.4, 0.3), alignSelf: 'center'}}>
              <Icon name="chart" size={90} color={C.green} width={2} p={p01(t, tBetter + 0.4, 0.6)} />
            </div>
          </div>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 9.2 build-eval command
export const EvalBuild: React.FC = () => {
  const {w, L, Le} = useS();
  const at = w('ask') - 0.1;
  const en = Le(2) + 0.25;
  return <TermShot cmd="/claude-api build-eval how often does our support bot send a ticket to the right team?" at={at} enter={en} label="ASK THE QUESTION YOU WANT A NUMBER FOR" />;
};

// ---------- 9.3 interview → real examples → grader → baseline
export const EvalPipeline: React.FC = () => {
  const {t, w} = useS();
  const steps = [
    ['chat', 'Interviews you', w('interviews')],
    ['doc', 'Pulls real examples', w('pulls')],
    ['check', 'Picks a grader', w('grader')],
    ['chart', 'Runs a baseline', w('baseline')],
  ] as [string, string, number][];
  const tApprove = w('approve');
  const X = [300, 740, 1180, 1620];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center'}}>
        <AText t={t} text="What Claude does next" at={0.05} size={64} by="word" />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {X.slice(0, 3).map((x, i) => (
          <Draw key={i} t={t} d={`M${x + 110} 470 L${X[i + 1] - 110} 470`} at={steps[i + 1][2] - 0.25} dur={0.3} stroke={C.orange} width={4} />
        ))}
      </svg>
      {steps.map(([ic, lb, at], i) => (
        <At key={lb} x={X[i]} y={500}>
          <IconTile t={t} at={at - 0.1} name={ic} size={170} hot={i === 3 ? t > tApprove : true} label={lb} />
        </At>
      ))}
      <At x={X[1]} y={760}>
        <div style={{display: 'flex', gap: 10, opacity: p01(t, steps[1][2] + 0.2, 0.3)}}>
          {['tickets', 'codebase'].map((s) => <span key={s} style={{fontFamily: F.mono, fontSize: 22, padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,.07)', color: C.ink2}}>{s}</span>)}
        </div>
      </At>
      <At x={X[3]} y={770}>
        <div style={{padding: '14px 30px', borderRadius: 14, fontFamily: F.ui, fontWeight: 800, fontSize: 30, background: t > tApprove ? C.green : 'rgba(255,255,255,.08)', color: t > tApprove ? '#0b1a10' : C.ink2, transform: `scale(${t > tApprove && t < tApprove + 0.15 ? 0.92 : 1})`, opacity: p01(t, tApprove - 0.6, 0.3)}}>
          {t > tApprove ? '✓ Approved' : 'Approve'}
        </div>
      </At>
    </AbsoluteFill>
  );
};

// ---------- 9.4–9.5 hillclimb: one step at a time, revert anything that only helps the training cases
export const EvalClimb: React.FC = () => {
  const {t, w, L} = useS();
  const cmd = '/claude-api hillclimb make each ticket cheaper to handle without getting more of them wrong';
  const typedN = Math.floor(clamp((t - 0.15) / 1.6) * cmd.length);
  const tChanges = w('changes');
  const tStep = w('step');
  const tUndo = w('undoes');
  const tTrain = w('training');
  // staircase: points climb; the 4th step is the overfit one and gets reverted
  const pts = [[0, 0], [1, 0.12], [2, 0.22], [3, 0.42], [4, 0.3], [5, 0.38]];
  const n = Math.floor(clamp((t - tStep + 0.2) / 0.45, 0, pts.length - 1));
  const undo = p01(t, tUndo, 0.5, E.inOut);
  const sx = (i: number) => 960 + i * 150;
  const sy = (v: number) => 800 - v * 900;
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(0.05, {from: 'd', dist: 80})} style={{left: 160, top: 160}}>
        <div style={{width: 1600, padding: '20px 30px', borderRadius: 20, background: 'rgba(14,14,17,.92)', boxShadow: `0 0 0 1.5px ${C.line2}`}}>
          <div style={{fontFamily: F.mono, fontSize: 16, letterSpacing: '0.22em', color: C.orangeHi, marginBottom: 10}}>TELL IT WHAT TO IMPROVE</div>
          <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 30, lineHeight: 1.35}}>
            <span style={{color: C.orangeHi}}>{cmd.slice(0, Math.min(typedN, 11))}</span>
            {cmd.slice(11, typedN)}
          </div>
        </div>
      </Layer>
      <div style={{position: 'absolute', left: 160, top: 430}}>
        {['prompts', 'skills', 'model'].map((s, i) => (
          <Layer key={s} t={t} at={enter(w(s === 'model' ? 'model' : s) - 0.1, {from: 'l', dist: 120})} style={{position: 'relative', marginBottom: 22}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 26px', width: 520, borderRadius: 16, background: '#202126', boxShadow: `0 0 0 1px ${C.line2}`, fontFamily: F.ui, fontWeight: 700, fontSize: 34}}>
              <Icon name={['doc', 'wand', 'chip'][i]} size={38} color={C.orangeHi} width={2} /> {s[0].toUpperCase() + s.slice(1)}
            </div>
          </Layer>
        ))}
        <div style={{fontFamily: F.ui, fontSize: 28, color: C.ink3, marginTop: 10, opacity: p01(t, tStep, 0.3)}}>changed one step at a time</div>
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: p01(t, tChanges - 0.2, 0.4)}}>
        <line x1={930} y1={820} x2={1780} y2={820} stroke={C.ink4} strokeWidth={2} />
        {pts.slice(1, n + 1).map(([i, v], k) => {
          const [pi, pv] = pts[k];
          const isOver = i === 3;
          const fade = isOver ? undo : 0;
          return (
            <g key={i} opacity={1 - fade * 0.85}>
              <path d={`M${sx(pi)} ${sy(pv)} L${sx(i)} ${sy(pv)} L${sx(i)} ${sy(v)}`} fill="none" stroke={isOver ? C.red : C.orange} strokeWidth={6} strokeLinejoin="round" />
              <circle cx={sx(i)} cy={sy(v)} r={11} fill={isOver ? C.red : C.orange} />
            </g>
          );
        })}
      </svg>
      {n >= 3 && (
        <div style={{position: 'absolute', left: sx(3) - 160, top: sy(0.42) - 110, width: 320, textAlign: 'center', fontFamily: F.ui, fontWeight: 700, fontSize: 24, color: C.red, opacity: p01(t, tTrain - 0.3, 0.3)}}>only helps the training cases</div>
      )}
      <div style={{position: 'absolute', left: sx(3) + 20, top: sy(0.42) - 20, opacity: undo}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 999, background: 'rgba(240,106,90,.15)', boxShadow: '0 0 0 1.5px rgba(240,106,90,.6)', fontFamily: F.ui, fontWeight: 800, fontSize: 26, color: C.red}}>
          <Icon name="undo" size={30} color={C.red} width={2.4} /> undone
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 10.0 publish to the Claude directory
export const PublishDir: React.FC = () => {
  const {t, w, L} = useS();
  const tDir = w('directory');
  const fly = p01(t, tDir - 0.6, 0.9, E.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <AText t={t} text="Built something good? *Publish it.*" at={L(0) + 1.4} size={66} by="word" />
      </div>
      <Layer t={t} at={enter(L(0) + 1.5, {from: 'r', dist: 200})} style={{left: 960, top: 300}}>
        <Glass w={760} h={560}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <ClaudeMark size={44} />
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 40}}>Claude directory</div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 30}}>
            {Array.from({length: 9}, (_, i) => (
              <div key={i} style={{height: 120, borderRadius: 16, background: i === 4 ? `rgba(217,119,87,${0.25 * p01(t, tDir + 0.3, 0.3)})` : 'rgba(255,255,255,.05)', boxShadow: i === 4 ? `inset 0 0 0 2px rgba(217,119,87,${p01(t, tDir + 0.3, 0.3)})` : `inset 0 0 0 1px ${C.line}`, opacity: p01(t, L(0) + 1.6 + i * 0.05, 0.3)}} />
            ))}
          </div>
        </Glass>
      </Layer>
      <div style={{position: 'absolute', left: lerp(300, 1222, fly), top: lerp(430, 556, fly), transform: `scale(${lerp(1.5, 1, fly)}) rotate(${lerp(-10, 0, fly)}deg)`, opacity: p01(t, L(0) + 1.5, 0.3)}}>
        <div style={{width: 210, height: 120, borderRadius: 16, background: C.orange, display: 'grid', placeItems: 'center', boxShadow: '0 20px 50px -14px rgba(217,119,87,.8)'}}>
          <Icon name="puzzle" size={64} color="#1a0e09" width={2.2} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 1230, top: 560}}>
        <Burst t={t} at={tDir + 0.3} n={10} r0={80} r1={170} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 10.1 repo → review → live
export const PublishFlow: React.FC = () => {
  const {t, w} = useS();
  const steps = [
    ['branch', 'Point it at your repo', w('repository')],
    ['clock', 'Watch it go through review', w('review')],
    ['rocket', 'Pick when it goes live', w('live')],
  ] as [string, string, number][];
  const X = [420, 960, 1500];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.orangeHi, opacity: p01(t, 0.1, 0.4)}}>THE NEW DEVELOPER PORTAL</div>
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Draw t={t} d={`M${X[0] + 120} 470 L${X[1] - 120} 470`} at={steps[1][2] - 0.3} dur={0.35} stroke={C.orange} width={4} />
        <Draw t={t} d={`M${X[1] + 120} 470 L${X[2] - 120} 470`} at={steps[2][2] - 0.3} dur={0.35} stroke={C.orange} width={4} />
      </svg>
      {steps.map(([ic, lb, at], i) => (
        <At key={lb} x={X[i]} y={510}>
          <IconTile t={t} at={at - 0.1} name={ic} size={190} hot label={lb} />
        </At>
      ))}
      <At x={X[1]} y={760}>
        <div style={{width: 260, height: 12, borderRadius: 6, background: 'rgba(255,255,255,.08)', overflow: 'hidden', opacity: p01(t, steps[1][2], 0.3)}}>
          <div style={{width: `${p01(t, steps[1][2] + 0.2, 1.6, E.inOut) * 100}%`, height: '100%', background: C.orange}} />
        </div>
      </At>
      <At x={X[2]} y={770}>
        <div style={{width: 110, height: 60, borderRadius: 30, background: t > steps[2][2] + 0.4 ? C.green : 'rgba(255,255,255,.12)', position: 'relative', opacity: p01(t, steps[2][2], 0.3)}}>
          <div style={{position: 'absolute', top: 6, left: lerp(6, 56, p01(t, steps[2][2] + 0.3, 0.3, E.back)), width: 48, height: 48, borderRadius: 24, background: '#fff'}} />
        </div>
      </At>
    </AbsoluteFill>
  );
};

// ---------- 10.2 reaches everyone using Claude
export const PublishReach: React.FC = () => {
  const {t, w} = useS();
  const tEveryone = w('everyone');
  const tNot = w('not');
  const dots = Array.from({length: 90}, (_, i) => {
    const a = i * 2.39996;
    const r = 120 + Math.sqrt(i / 90) * 360;
    return {x: Math.cos(a) * r, y: Math.sin(a) * r * 0.62, inner: r < 230};
  });
  return (
    <AbsoluteFill>
      <At x={960} y={560}>
        <div style={{position: 'relative'}}>
          <Rings t={t} at={tEveryone} n={3} max={560} every={0.22} />
          <div style={{position: 'absolute', left: -160, top: -100, width: 320, height: 200, borderRadius: '50%', boxShadow: `0 0 0 2px ${C.line2}`, opacity: p01(t, 0.1, 0.4)}} />
          <div style={{position: 'absolute', left: -500 * p01(t, tEveryone, 0.9), top: -310 * p01(t, tEveryone, 0.9), width: 1000 * p01(t, tEveryone, 0.9), height: 620 * p01(t, tEveryone, 0.9), borderRadius: '50%', boxShadow: `0 0 0 2px rgba(217,119,87,.6)`}} />
          {dots.map((d, i) => {
            const on = d.inner ? p01(t, 0.2 + i * 0.01, 0.3) : p01(t, tEveryone + 0.2 + i * 0.008, 0.3);
            return <div key={i} style={{position: 'absolute', left: d.x - 7, top: d.y - 7, width: 14, height: 14, borderRadius: 7, background: d.inner ? C.ink2 : C.orange, opacity: on, transform: `scale(${on})`}} />;
          })}
          <div style={{position: 'absolute', left: -40, top: -40}}>
            <ClaudeMark size={80} />
          </div>
        </div>
      </At>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
        <AText t={t} text="Everyone using *Claude*" at={tEveryone - 0.05} size={72} by="word" />
        <div style={{fontFamily: F.ui, fontSize: 32, color: C.ink3, marginTop: 14, opacity: p01(t, tNot, 0.3)}}>not just Claude Code users</div>
      </div>
    </AbsoluteFill>
  );
};
