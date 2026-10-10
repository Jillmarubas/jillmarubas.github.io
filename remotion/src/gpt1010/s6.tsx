// Part 4 · Composer predictions in Codex (explainer + tutorial). The Codex desktop app is drawn
// in code as an illustration.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from './design';
import {AText, At, E, Layer, bounce, clamp, enter, kf, lerp, p01} from './ae';
import {useS} from './timing';
import {WIN, screenToFrame} from './laptop';
import {AppShot} from './shot';
import {CGEO, Codex, G, ScreenCursor, typedAt} from './app';
import {CUES, PROMPTS} from './cues';
import {Callout, Glass, Icon, Keycap, StepBadge} from './ui';

const Bubble: React.FC<{y: number; text: string; p: number}> = ({y, text, p}) =>
  p <= 0 ? null : (
    <div style={{position: 'absolute', right: 1512 - (CGEO.colX + CGEO.colW), top: y, maxWidth: 560, padding: '10px 18px', borderRadius: 18, background: '#2E3034', fontSize: 16.5, lineHeight: 1.5, opacity: clamp(p * 2), transform: `translateY(${(1 - p) * 16}px)`}}>{text}</div>
  );
const Reply: React.FC<{y: number; p: number}> = ({y, p}) =>
  p <= 0 ? null : (
    <div style={{position: 'absolute', left: CGEO.colX, top: y, width: CGEO.colW, fontSize: 16.5, lineHeight: 1.6, opacity: clamp(p * 2)}}>
      Fixed the redirect loop. The session check now runs before the checkout route loads, so signed-in users go straight to checkout.
      <div style={{marginTop: 14, borderRadius: 12, background: '#232428', boxShadow: '0 0 0 1px rgba(255,255,255,.08)', padding: '12px 16px', fontFamily: F.mono, fontSize: 13.5}}>
        <div style={{color: G.text2, marginBottom: 6}}>2 files changed</div>
        <div>
          src/auth/session.ts <span style={{color: '#5FD48A'}}>+14</span> <span style={{color: C.red}}>−4</span>
        </div>
        <div>
          src/routes/checkout.ts <span style={{color: '#5FD48A'}}>+4</span> <span style={{color: C.red}}>−2</span>
        </div>
      </div>
    </div>
  );
const Y = CGEO.threadY;
const boxFocus = (z: number): [number, number, number] => [z, CGEO.colX + CGEO.colW / 2, CGEO.boxY - 40];

// ---------- 8.0–8.1 "Part four is a small one for Codex users. On October ninth, OpenAI added Composer predictions…"
export const CodexIntro: React.FC = () => {
  const {t, w, dur} = useS();
  const tSug = w('suggest');
  const ghost = p01(t, tSug - 0.1, 0.4);
  return (
    <AppShot
      t={t}
      app="Codex"
      swing={-24}
      cam={[[0, 0.86, 756, 472], [1.0, 1, 756, 472], [2.2, 1, 756, 472], [3.2, 1.45, CGEO.colX + 380, 420], [tSug - 0.3, 1.45, CGEO.colX + 380, 420], [tSug + 0.5, 1.9, ...boxFocus(1.9).slice(1)] as [number, number, number, number], [dur, 1.92, ...boxFocus(1.9).slice(1)] as [number, number, number, number]]}
      screen={() => (
        <Codex
          t={t}
          box={{ghost: ghost > 0 ? PROMPTS.ghost : '', hint: ghost, hot: ghost * 0.6}}
          thread={
            <>
              <Bubble y={Y + 10} text={PROMPTS.codex} p={1} />
              <Reply y={Y + 90} p={p01(t, w('replies') - 0.2, 0.5)} />
            </>
          }
        />
      )}
      over={(rig) => {
        const f = screenToFrame(rig, CGEO.colX + 330, CGEO.boxY + 30);
        return (
          <>
            <At x={960} y={130}>
              <Layer t={t} at={enter(w('ninth') - 0.2, {from: 'u', dist: 40})} style={{position: 'relative'}}>
                <Glass pad={0} r={999} style={{padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.ui, fontWeight: 700, fontSize: 28, whiteSpace: 'nowrap'}}>
                  <Icon name="calendar" size={28} color={C.accHi} /> 9 OCT · Composer predictions
                  <span style={{fontFamily: F.mono, fontSize: 18, padding: '4px 12px', borderRadius: 999, background: 'rgba(242,193,78,.18)', color: C.amber, opacity: p01(t, w('beta') - 0.1, 0.3)}}>BETA</span>
                </Glass>
              </Layer>
            </At>
            <Callout t={t} at={tSug + 0.6} x={f.x} y={f.y} dx={120} dy={-150} label="Suggested next message" sub="grey until you accept it" />
          </>
        );
      }}
    />
  );
};

// ---------- 8.2 "It is for personal ChatGPT Pro users aged eighteen and older, in the latest Codex desktop app…"
export const CodexWho: React.FC = () => {
  const {t, w} = useS();
  const rows = [
    {at: w('personal'), icon: 'users', label: 'Personal ChatGPT Pro'},
    {at: w('eighteen'), icon: 'check', label: 'Aged 18 and older'},
    {at: w('desktop'), icon: 'desktop', label: 'Latest Codex desktop app'},
    {at: w('local'), icon: 'terminal', label: 'Local and SSH threads'},
    {at: w('astra'), icon: 'chip', label: 'GPT-6 Astra or GPT-6.1 Sol'},
  ];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}>
        <AText t={t} text="Who can use it?" at={0.05} size={74} by="word" />
      </div>
      <div style={{position: 'absolute', left: 560, top: 260, width: 800}}>
        {rows.map((r, i) => {
          const b = bounce(t, r.at - 0.05, 12, 230);
          return (
            <Layer key={r.label} t={t} at={enter(r.at - 0.15, {from: 'r', dist: 120})} style={{position: 'relative', marginBottom: 22}}>
              <Glass pad={0} style={{padding: '20px 30px', display: 'flex', alignItems: 'center', gap: 24}}>
                <div style={{width: 60, height: 60, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'rgba(16,163,127,.16)', boxShadow: '0 0 0 1.5px rgba(16,163,127,.5)', transform: `scale(${b})`}}>
                  <Icon name={r.icon} size={34} color={C.accHi} />
                </div>
                <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 36}}>{r.label}</div>
                <div style={{marginLeft: 'auto', opacity: p01(t, r.at + 0.25, 0.2)}}>
                  <Icon name="check" size={40} color={C.accHi} width={2.8} p={p01(t, r.at + 0.25, 0.3)} />
                </div>
              </Glass>
            </Layer>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 8.3 "While it is in beta, the suggestions themselves are free… Anything you send still counts as normal."
export const CodexFree: React.FC = () => {
  const {t, w} = useS();
  const tSend = w('send');
  const tick = p01(t, tSend + 0.3, 0.6, E.out);
  const meter = (v: number, col: string) => (
    <div style={{marginTop: 40}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 20, color: C.ink3, marginBottom: 12}}>
        <span>CODEX LIMITS · CREDITS</span>
      </div>
      <div style={{height: 24, borderRadius: 12, background: 'rgba(255,255,255,.07)', overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${v * 100}%`, background: col, borderRadius: 12}} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(w('free') - 0.4, {from: 'l', dist: 180})} style={{left: 220, top: 250}}>
        <Glass w={700} h={540} pad={46} glow={p01(t, w('free'), 0.4)}>
          <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.accHi}}>WHILE IN BETA</div>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 70, letterSpacing: '-0.03em', marginTop: 16}}>Suggestions</div>
          <div style={{display: 'inline-block', marginTop: 20, padding: '10px 26px', borderRadius: 999, background: C.acc, fontFamily: F.display, fontWeight: 900, fontSize: 48, transform: `scale(${bounce(t, w('free'), 11, 220)})`}}>FREE</div>
          <div style={{fontFamily: F.ui, fontSize: 30, color: C.ink2, marginTop: 24, opacity: p01(t, w('limits') - 0.2, 0.3)}}>Don't use your limits or credits</div>
          {meter(0.32, 'rgba(255,255,255,.3)')}
        </Glass>
      </Layer>
      <Layer t={t} at={enter(w('anything') - 0.3, {from: 'r', dist: 180})} style={{left: 1000, top: 250}}>
        <Glass w={700} h={540} pad={46}>
          <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.ink3}}>WHEN YOU SEND</div>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 70, letterSpacing: '-0.03em', marginTop: 16}}>Your message</div>
          <div style={{display: 'inline-block', marginTop: 20, padding: '10px 26px', borderRadius: 999, boxShadow: '0 0 0 2px rgba(255,255,255,.3)', fontFamily: F.display, fontWeight: 900, fontSize: 48}}>NORMAL</div>
          <div style={{fontFamily: F.ui, fontSize: 30, color: C.ink2, marginTop: 24, opacity: p01(t, w('counts') - 0.2, 0.3)}}>Counts as usual</div>
          {meter(lerp(0.32, 0.4, tick), C.amber)}
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 9.0–9.2 "Step one. Update the Codex desktop app… Step two. Send a message… Step three. Press Tab to accept it."
export const CodexUse: React.FC = () => {
  const {t, w, L, loc, dur} = useS();
  const c = CUES.CodexUse;
  const tUp = loc(c.update);
  const tA = loc(c.type.at);
  const tE = loc(c.type.enter);
  const tTab = loc(c.tab);
  const eA = loc(c.edit.at);
  const eE = loc(c.edit.enter);
  const tSug = w('suggestion');
  const tReply = tE + 0.9;
  const ghostOn = t >= tSug - 0.1 && t < tTab;
  const accepted = t >= tTab;
  let text = '';
  if (t < tE) text = typedAt(c.type.text, tA, tE, t);
  else if (accepted && t < eE) text = PROMPTS.ghost + typedAt(c.edit.text, eA, eE, t);
  const sent2 = t >= eE;
  const btn = {x: WIN.x + WIN.w - 140, y: WIN.y + 80};
  const banner = (
    <div style={{position: 'absolute', left: 270, right: 0, top: 53, height: 50, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', background: t >= tUp ? 'rgba(16,163,127,.16)' : 'rgba(242,193,78,.12)', borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 14.5, zIndex: 3, opacity: 1 - p01(t, L(1) - 0.2, 0.3)}}>
      <Icon name={t >= tUp ? 'check' : 'download'} size={18} color={t >= tUp ? C.accHi : C.amber} width={2.2} />
      {t >= tUp ? 'Codex is up to date' : 'A new version of Codex is available'}
      {t < tUp + 0.2 && <div style={{marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, background: '#F4F4F4', color: '#111', fontWeight: 650, fontSize: 13.5}}>Restart to update</div>}
    </div>
  );
  return (
    <AppShot
      t={t}
      app="Codex"
      cam={[[0, 1.7, btn.x - 300, btn.y + 200], [L(1) - 0.3, 1.7, btn.x - 300, btn.y + 200], [L(1) + 0.3, 1.5, CGEO.colX + 380, 520], [tSug - 0.2, 1.5, CGEO.colX + 380, 520], [tSug + 0.5, ...boxFocus(1.9)], [dur, ...boxFocus(1.92)]]}
      screen={() => (
        <Codex
          t={t}
          banner={banner}
          box={{text, ghost: ghostOn ? PROMPTS.ghost : '', caret: (t > tA - 0.3 && t < tE) || (accepted && !sent2), hint: ghostOn ? 1 : 0, hot: ghostOn ? 0.6 : accepted && !sent2 ? 1 : 0}}
          thread={
            <>
              <Bubble y={Y + 10} text={PROMPTS.codex} p={p01(t, tE, 0.35)} />
              <Reply y={Y + 90} p={p01(t, tReply, 0.5)} />
              <Bubble y={Y + 330} text={PROMPTS.ghost + PROMPTS.edit} p={p01(t, eE, 0.35)} />
              <ScreenCursor t={t} keys={[[Math.max(0, tUp - 0.9), btn.x - 200, btn.y + 160], [tUp, btn.x + 10, btn.y + 2, true], [tUp + 0.8, btn.x - 60, btn.y + 140]]} />
            </>
          }
        />
      )}
      over={(rig) => {
        const f = screenToFrame(rig, CGEO.colX + 300, CGEO.boxY + 30);
        const press = t >= tTab && t < tTab + 0.18 ? 1 : 0;
        return (
          <>
            <div style={{position: 'absolute', right: 60, top: 54}}>
              <StepBadge t={t} at={0} n={1} label="Update Codex" out={L(1) - 0.3} />
            </div>
            <div style={{position: 'absolute', right: 60, top: 54}}>
              <StepBadge t={t} at={L(1) - 0.1} n={2} label="Send, then wait" out={L(2) - 0.3} />
            </div>
            <div style={{position: 'absolute', right: 60, top: 54}}>
              <StepBadge t={t} at={L(2) - 0.1} n={3} label="Tab to accept" />
            </div>
            <Callout t={t} at={tSug + 0.5} x={f.x} y={f.y} dx={140} dy={-160} label="A suggestion" sub="press Tab to take it" out={L(2) - 0.2} />
            <Layer t={t} at={enter(tTab - 0.6, {from: 'd', dist: 80, out: eA - 0.2})} style={{left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center'}}>
              <Keycap label="Tab" w={200} down={press} />
            </Layer>
            <Layer t={t} at={enter(w('accepting') - 0.2, {from: 'u', dist: 40, out: eA - 0.2})} style={{left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center'}}>
              <Glass pad={0} r={999} style={{padding: '14px 30px', fontFamily: F.ui, fontWeight: 700, fontSize: 32}}>
                Accepting <span style={{color: C.amber}}>doesn't send</span> it
              </Glass>
            </Layer>
            <Layer t={t} at={enter(w('read', 0) - 0.2, {from: 'd', dist: 50})} style={{left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center', opacity: t > eA - 0.2 ? 1 : 0}}>
              <Glass pad={0} r={999} style={{padding: '16px 34px', display: 'flex', gap: 30, fontFamily: F.ui, fontWeight: 700, fontSize: 32}}>
                {[['Read', w('read')], ['Edit', w('edit')], ['Send', w('send', 2)]].map(([s, a], i) => (
                  <span key={s as string} style={{color: t >= (a as number) ? C.accHi : C.ink3}}>
                    {i ? '→ ' : ''}
                    {s}
                  </span>
                ))}
              </Glass>
            </Layer>
          </>
        );
      }}
    />
  );
};

// ---------- 9.3 "Step four. Don't want it? It is on by default, so turn it off in settings."
export const CodexOff: React.FC = () => {
  const {t, loc, dur} = useS();
  const c = CUES.CodexOff;
  const tGear = loc(c.gear);
  const tTog = loc(c.toggle);
  const open = p01(t, tGear + 0.05, 0.35, E.out);
  const on = t < tTog;
  const knob = p01(t, tTog, 0.25, E.inOut);
  const gear = {x: WIN.x + 34, y: WIN.y + WIN.h - 34};
  const M = {x: 330, y: 170, w: 860, h: 600};
  const tog = {x: M.x + M.w - 70, y: M.y + 136};
  return (
    <AppShot
      t={t}
      app="Codex"
      cam={[[0, 1.35, 700, 560], [tGear, 1.35, 700, 560], [tGear + 0.5, 1.6, M.x + M.w / 2 + 40, M.y + 230], [dur, 1.62, M.x + M.w / 2 + 40, M.y + 230]]}
      screen={() => (
        <>
          <Codex t={t} thread={<><Bubble y={Y + 10} text={PROMPTS.codex} p={1} /><Reply y={Y + 90} p={1} /></>} box={{ghost: PROMPTS.ghost, hint: 1}} />
          <div style={{position: 'absolute', left: gear.x - 14, top: gear.y - 14, width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.06)'}}>
            <Icon name="gear" size={18} color={G.text2} width={2} />
          </div>
          {open > 0 && (
            <>
              <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.45 * open})`}} />
              <div style={{position: 'absolute', left: M.x, top: M.y, width: M.w, height: M.h, borderRadius: 14, background: '#1E1F22', boxShadow: '0 30px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.1)', opacity: open, transform: `scale(${lerp(0.94, 1, open)})`, fontFamily: F.ui, color: G.text, overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 210, background: '#18191B', padding: '20px 12px', boxSizing: 'border-box'}}>
                  <div style={{fontSize: 16, fontWeight: 700, padding: '0 10px 16px'}}>Settings</div>
                  <div style={{padding: '9px 12px', borderRadius: 8, fontSize: 14.5, background: 'rgba(255,255,255,.08)'}}>General</div>
                  {[70, 90, 60].map((wd) => (
                    <div key={wd} style={{padding: '14px 12px'}}>
                      <div style={{width: wd, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.12)'}} />
                    </div>
                  ))}
                </div>
                <div style={{position: 'absolute', left: 240, top: 26, right: 30}}>
                  <div style={{fontSize: 20, fontWeight: 700}}>General</div>
                  <div style={{fontSize: 12.5, letterSpacing: '0.08em', color: G.text3, marginTop: 34}}>COMPOSER</div>
                  <div style={{marginTop: 12, borderRadius: 12, background: '#25262A', padding: '16px 18px', display: 'flex', alignItems: 'center', boxShadow: `0 0 0 ${2 * p01(t, tTog - 0.6, 0.3)}px rgba(16,163,127,.7)`}}>
                    <div>
                      <div style={{fontSize: 15.5, fontWeight: 650}}>Show predictions</div>
                    </div>
                  </div>
                  {[220, 300].map((wd) => (
                    <div key={wd} style={{marginTop: 10, borderRadius: 12, background: '#25262A', padding: '22px 18px'}}>
                      <div style={{width: wd, height: 9, borderRadius: 5, background: 'rgba(255,255,255,.12)'}} />
                    </div>
                  ))}
                </div>
                <div style={{position: 'absolute', left: tog.x - M.x - 24, top: tog.y - M.y - 14, width: 48, height: 28, borderRadius: 14, background: on ? C.acc : `rgba(255,255,255,${0.18})`, transition: 'none'}}>
                  <div style={{position: 'absolute', top: 3, left: lerp(23, 3, knob), width: 22, height: 22, borderRadius: 11, background: '#fff'}} />
                </div>
              </div>
            </>
          )}
          <ScreenCursor t={t} keys={[[0, 520, 700], [tGear, gear.x, gear.y, true], [tTog, tog.x, tog.y, true], [dur, tog.x + 12, tog.y + 26]]} />
        </>
      )}
      over={() => (
        <>
          <div style={{position: 'absolute', right: 60, top: 54}}>
            <StepBadge t={t} at={0} n={4} label="Or switch it off" />
          </div>
          <Layer t={t} at={enter(tGear + 0.3, {from: 'd', dist: 50})} style={{left: 0, right: 0, top: 890, display: 'flex', justifyContent: 'center'}}>
            <Glass pad={0} r={999} style={{padding: '16px 32px', fontFamily: F.mono, fontSize: 28, whiteSpace: 'nowrap'}}>
              Settings › General › Composer › Show predictions: <span style={{color: on ? C.accHi : C.red}}>{on ? 'on' : 'off'}</span>
            </Glass>
          </Layer>
        </>
      )}
    />
  );
};

export {kf};
