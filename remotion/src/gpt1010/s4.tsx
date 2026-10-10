// Part 2 · Answers start sooner (explainer + tutorial).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from './design';
import {AText, At, E, Layer, bounce, clamp, enter, kf, lerp, p01} from './ae';
import {useS} from './timing';
import {screenToFrame} from './laptop';
import {AppShot} from './shot';
import {Asst, ChatGPT, G, GEO, Status, UserMsg, typedAt} from './app';
import {CUES} from './cues';
import {Callout, CmdCard, Glass, Icon, StepBadge} from './ui';

const Lane: React.FC<{label: string; icon: string; y: number; t: number; at: number; children: React.ReactNode}> = ({label, icon, y, t, at, children}) => (
  <div style={{position: 'absolute', left: 200, top: y, width: 1520, opacity: p01(t, at, 0.3)}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.mono, fontSize: 22, letterSpacing: '0.2em', color: C.ink3, marginBottom: 18}}>
      <Icon name={icon} size={28} color={C.ink2} /> {label}
    </div>
    <div style={{position: 'relative', height: 70, borderRadius: 18, background: 'rgba(255,255,255,.05)', boxShadow: '0 0 0 1px rgba(255,255,255,.08)', overflow: 'hidden'}}>{children}</div>
  </div>
);
const stripes = 'repeating-linear-gradient(115deg, rgba(255,255,255,.10) 0 18px, rgba(255,255,255,.04) 18px 36px)';

// ---------- 4.0–4.1 "Part two is about waiting. With reasoning models, you had to wait for the thinking to finish…"
export const WaitOld: React.FC = () => {
  const {t, w} = useS();
  const tW = w('wait');
  const tF = w('finish');
  const tSaw = w('saw');
  const think = p01(t, tW - 0.3, tF - tW + 0.6, E.inOut);
  const ans = p01(t, tSaw - 0.1, 0.5);
  const secs = Math.floor(clamp(t - (tW - 0.3), 0, 99) * 3);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
        <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.3em', color: C.ink3, opacity: p01(t, 2.0, 0.3)}}>BEFORE · REASONING MODELS</div>
        <AText t={t} text="First you *wait*" at={2.1} size={96} by="word" style={{marginTop: 14}} />
      </div>
      <Lane label="THINKING" icon="hourglass" y={420} t={t} at={2.2}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${think * 74}%`, background: stripes, backgroundPosition: `${t * 90}px 0`, boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.12)', borderRadius: 18}} />
        <div style={{position: 'absolute', right: 24, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontFamily: F.mono, fontSize: 30, color: C.ink2, opacity: think > 0 && think < 1 ? 1 : 0.5}}>{secs}s</div>
      </Lane>
      <Lane label="ANSWER" icon="doc" y={620} t={t} at={2.4}>
        <div style={{position: 'absolute', left: '74%', top: 0, bottom: 0, width: `${ans * 26}%`, background: C.acc, borderRadius: 18}} />
        <div style={{position: 'absolute', left: 24, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontFamily: F.ui, fontSize: 28, color: C.ink3, opacity: 1 - ans}}>nothing to read yet…</div>
      </Lane>
      <div style={{position: 'absolute', left: 200 + 1520 * 0.74, top: 400, width: 3, height: 320, background: C.accHi, opacity: ans, transform: 'translateX(-1px)'}} />
      <Layer t={t} at={enter(tSaw + 0.2, {from: 'd', dist: 40})} style={{left: 200 + 1520 * 0.74 - 160, top: 760, width: 320, textAlign: 'center'}}>
        <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 32, color: C.accHi}}>then the answer</div>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 4.2 "GPT six doesn't make you wait like that. It starts writing while it is still thinking…"
export const WaitNew: React.FC = () => {
  const {t, w, dur} = useS();
  const blocks = [w('writing'), w('findings'), w('added'), w('goes')];
  const run = p01(t, w('thinking') - 0.4, dur - (w('thinking') - 0.4) - 0.6, E.linear);
  const tRead = w('read');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
        <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.3em', color: C.accHi, opacity: p01(t, w('gpt') - 0.1, 0.3)}}>NOW · GPT-6</div>
        <AText t={t} text="It writes *while it thinks*" at={w('writing') - 0.3} size={96} by="word" style={{marginTop: 14}} />
      </div>
      <Lane label="THINKING · USING TOOLS" icon="globe" y={420} t={t} at={0.1}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${lerp(4, 100, run)}%`, background: stripes, backgroundPosition: `${t * 90}px 0`, borderRadius: 18}} />
      </Lane>
      <Lane label="ANSWER" icon="doc" y={620} t={t} at={0.2}>
        {blocks.map((a, i) => {
          const b = bounce(t, a - 0.05, 13, 220);
          return <div key={i} style={{position: 'absolute', left: `${4 + i * 23.5}%`, top: 10, bottom: 10, width: '21.5%', borderRadius: 12, background: i === 0 ? C.acc : 'rgba(16,163,127,.45)', transform: `scaleX(${b})`, transformOrigin: 'left', opacity: clamp(b * 3), boxShadow: i === 0 && t > tRead ? `0 0 0 3px ${C.accHi}` : undefined}} />;
        })}
      </Lane>
      <Layer t={t} at={enter(tRead - 0.2, {from: 'd', dist: 40})} style={{left: 200, top: 770}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.ui, fontWeight: 700, fontSize: 34, color: C.ink}}>
          <Icon name="eye" size={42} color={C.accHi} p={p01(t, tRead, 0.6, E.inOut)} /> Read the first part early
        </div>
      </Layer>
      <Layer t={t} at={enter(w('again') - 0.2, {from: 'd', dist: 40})} style={{left: 1080, top: 770}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.ui, fontWeight: 700, fontSize: 34, color: C.ink}}>
          <Icon name="x" size={38} color={C.red} width={2.4} /> No need to ask again
        </div>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 4.3 "OpenAI gives one number… forty-four percent sooner with GPT six Instant than with GPT five point six Instant."
export const Speed44: React.FC = () => {
  const {t, w} = useS();
  const tRace = w('average') - 0.2;
  const grow = (stop: number) => Math.min(stop, p01(t, tRace, 2.2, E.linear));
  const t44 = w('fortyfour');
  const rows = [
    {name: 'GPT-5.6 Instant', stop: 1, col: 'rgba(255,255,255,.22)', at: w('five')},
    {name: 'GPT-6 Instant', stop: 0.56, col: C.acc, at: w('gpt')},
  ];
  const big = bounce(t, t44 - 0.05, 10, 180);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
        <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.26em', color: C.accHi, opacity: p01(t, w('number') - 0.2, 0.3)}}>ONE NUMBER · QUESTIONS THAT NEED A WEB SEARCH</div>
        <AText t={t} text="Time to the *first words*" at={w('first') - 0.3} size={78} by="word" style={{marginTop: 14}} />
      </div>
      <div style={{position: 'absolute', left: 180, top: 380, width: 940}}>
        {rows.map((r, i) => {
          const g = grow(r.stop);
          return (
            <div key={r.name} style={{marginBottom: 56, opacity: p01(t, tRace - 0.3, 0.3)}}>
              <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 32, color: i ? C.ink : C.ink2, marginBottom: 14}}>{r.name}</div>
              <div style={{position: 'relative', height: 64}}>
                <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${g * 100}%`, borderRadius: 14, background: r.col, boxShadow: i ? '0 0 40px rgba(16,163,127,.45)' : undefined}} />
                {g >= r.stop && (
                  <div style={{position: 'absolute', left: `${r.stop * 100}%`, top: 0, bottom: 0, marginLeft: 18, display: 'flex', alignItems: 'center', gap: 10, fontFamily: F.mono, fontSize: 22, color: i ? C.accHi : C.ink3, whiteSpace: 'nowrap'}}>
                    <Icon name="flag" size={26} color={i ? C.accHi : C.ink3} /> first words
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div style={{fontFamily: F.mono, fontSize: 19, color: C.ink3, marginTop: -16, opacity: p01(t, tRace, 0.4)}}>average time · shorter is better</div>
      </div>
      <At x={1630} y={520}>
        <div style={{textAlign: 'center', transform: `scale(${big})`, opacity: clamp(big * 3)}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 200, letterSpacing: '-0.05em', color: C.accHi, lineHeight: 1, textShadow: '0 0 60px rgba(16,163,127,.5)'}}>44%</div>
          <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 56}}>sooner</div>
        </div>
      </At>
      <Layer t={t} at={enter(w('measurement') - 0.4, {from: 'd', dist: 40})} style={{left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center'}}>
        <Glass pad={0} r={999} style={{padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.mono, fontSize: 22, letterSpacing: '0.08em', color: C.ink2}}>
          <Icon name="chart" size={28} color={C.amber} /> SOURCE: OPENAI'S OWN MEASUREMENT
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 5.* "Step one. Ask a question that needs fresh information… Watch the top… Keep reading as more arrives."
const SECTIONS = [
  {h: 'Weekend weather', n: 3},
  {h: 'Traffic', n: 3},
  {h: 'Good times to drive', n: 2},
];
export const StreamDemo: React.FC = () => {
  const {t, w, L, loc, dur} = useS();
  const c = CUES.StreamDemo.type;
  const tA = loc(c.at);
  const tE = loc(c.enter);
  const Y = GEO.threadY;
  const ay = Y + 96;
  const secAt = [tE + 1.1, w('arrives') - 0.2, w('finish') - 1.2];
  const done = w('finish') + 0.2;
  const sy = (i: number) => ay + 48 + i * 132;
  const scroll = 0;
  return (
    <AppShot
      t={t}
      cam={[[0, 1.75, GEO.cx, GEO.compY - 140], [tE + 0.1, 1.75, GEO.cx, GEO.compY - 140], [tE + 0.8, 1.8, GEO.cx, ay + 120], [L(2), 1.8, GEO.cx, ay + 120], [L(2) + 1.0, 1.5, GEO.cx, ay + 230], [dur, 1.52, GEO.cx, ay + 236]]}
      screen={() => (
        <ChatGPT
          t={t}
          tabHi={1}
          composer={{text: t < tE ? typedAt(c.text, tA, tE, t) : '', caret: true, hot: p01(t, tA - 0.3, 0.3) * (1 - p01(t, tE, 0.3))}}
          thread={
            <div style={{position: 'absolute', inset: 0, transform: `translateY(${-scroll}px)`}}>
              <UserMsg y={Y} text={c.text} p={p01(t, tE, 0.35)} />
              {t > tE + 0.2 && (
                <Asst y={ay}>
                  <Status t={t} label={t > done ? 'Searched the web · 6 sources' : 'Searching the web'} done={t > done} />
                </Asst>
              )}
              {SECTIONS.map((s, i) => {
                const p = p01(t, secAt[i], 1.6, E.linear);
                if (p <= 0) return null;
                return (
                  <Asst key={s.h} y={sy(i)}>
                    <div style={{fontSize: 18, fontWeight: 700, marginBottom: 12, opacity: clamp(p * 6)}}>{s.h}</div>
                    {Array.from({length: s.n}, (_, k) => (
                      <div key={k} style={{height: 11, borderRadius: 6, marginBottom: 13, background: 'rgba(255,255,255,.2)', width: `${(k === s.n - 1 ? 55 : 92 - k * 6) * clamp(p * s.n - k)}%`}} />
                    ))}
                  </Asst>
                );
              })}
            </div>
          }
        />
      )}
      over={(rig) => {
        const f = screenToFrame(rig, GEO.colX + 220, ay + 10);
        return (
          <>
            <div style={{position: 'absolute', right: 60, top: 54}}>
              <StepBadge t={t} at={0} n={1} label="Ask for fresh info" out={L(1) - 0.3} />
            </div>
            <div style={{position: 'absolute', right: 60, top: 54}}>
              <StepBadge t={t} at={L(1) - 0.1} n={2} label="Watch the top" out={L(2) - 0.3} />
            </div>
            <div style={{position: 'absolute', right: 60, top: 54}}>
              <StepBadge t={t} at={L(2) - 0.1} n={3} label="Keep reading" />
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 850, display: 'flex', justifyContent: 'center'}}>
              <CmdCard t={t} at={tA - 0.3} text={c.text} typed={typedAt(c.text, tA, tE, t)} label="ASK THIS" done={t > tE} out={tE + 1.1} />
            </div>
            <Callout t={t} at={w('top') + 0.1} x={f.x} y={f.y} dx={330} dy={0} label="Still searching…" sub="but already writing" out={L(2) - 0.2} />
            <Layer t={t} at={enter(w('second') - 0.2, {from: 'd', dist: 50})} style={{left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center'}}>
              <Glass pad={0} r={999} style={{padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.ui, fontWeight: 700, fontSize: 30}}>
                <Icon name="x" size={30} color={C.red} width={2.4} /> No second prompt needed. Let it finish.
              </Glass>
            </Layer>
          </>
        );
      }}
    />
  );
};

export {kf, G};
