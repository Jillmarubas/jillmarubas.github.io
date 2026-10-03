// Part 9 · Pro tips, the to-do list, outro.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, R} from './design';
import {AText, At, Count, Draw, E, Layer, bounce, clamp, enter, kf, lerp, p01, tw} from './ae';
import {useS} from './timing';
import {Burst, ClaudeMark, Glass, Icon, NameCard, Rings} from './ui';

// ---------- 11.0–11.2 Doug Safreno: one outstanding item at a time
export const TipDoug: React.FC = () => {
  const {t, w, L} = useS();
  const tLong = w('long');
  const tOne = w('one');
  const tAB = w('b');
  const tFast = w('faster');
  const collapse = p01(t, tOne - 0.2, 0.8, E.inOut);
  const vague = ['the thing in the API?', 'tests maybe', 'check config', 'that refactor', 'naming?', 'docs', 'old branch', 'perf?', 'review notes', 'edge cases', 'the migration', 'TODOs', 'lint', 'something in auth', 'release?'];
  const flip = Math.max(0, Math.floor((t - tAB - 0.4) / 0.42));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', opacity: p01(t, L(0) + 1.4, 0.4)}}>
        <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.orangeHi}}>FROM INSIDE ANTHROPIC</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, transform: 'translateY(-50%)', textAlign: 'center'}}>
        <AText t={t} text="Two quick tips from *Anthropic engineers*" at={L(0) + 1.3} size={76} by="word" out={L(1) - 0.35} />
      </div>
      <Layer t={t} at={enter(L(1) - 0.2, {from: 'l', dist: 200})} style={{left: 160, top: 230}}>
        <NameCard name="Doug Safreno" role="Engineer at Anthropic" w={400} />
      </Layer>
      {/* before: 15 vague items */}
      <div style={{position: 'absolute', left: 700, top: 230, width: 1060, height: 640}}>
        {vague.map((s, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          const x = lerp(col * 350, 290, collapse);
          const y = lerp(row * 120, 200, collapse);
          return (
            <div key={s} style={{position: 'absolute', left: x, top: y, width: 330, height: 100, borderRadius: 14, background: '#202126', boxShadow: `0 0 0 1px ${C.line2}`, display: 'flex', alignItems: 'center', padding: '0 22px', boxSizing: 'border-box', fontFamily: F.ui, fontSize: 26, color: C.ink3, opacity: p01(t, tLong - 0.2 + i * 0.04, 0.2) * (1 - collapse), filter: `blur(${collapse * 6}px)`}}>
              {s}
            </div>
          );
        })}
        {/* after: one item at a time with an a-or-b question */}
        {t > tOne - 0.1 && (
          <Layer t={t} at={(tt) => ({...enter(tOne, {from: 'z', s0: 0.7})(tt), x: 0, y: 0})} style={{left: 140, top: 60}}>
            <div style={{position: 'relative', width: 780, height: 500}}>
              {[2, 1, 0].map((k) => (
                <div key={k} style={{position: 'absolute', inset: 0, transform: `translate(${k * 16}px, ${k * 16}px)`, opacity: k ? 0.4 / k : 1}}>
                  <Glass w={780} h={500} glow={k === 0 ? 0.35 : 0}>
                    {k === 0 && (
                      <div key={flip} style={{opacity: p01(t, tAB - 0.4 + flip * 0.42, 0.15)}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 22, color: C.orangeHi, letterSpacing: '0.16em'}}>
                          <span>ITEM {Math.min(15, 1 + flip)} OF 15</span>
                          <span style={{color: C.ink3}}>ROUGH PRIORITY ORDER</span>
                        </div>
                        <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 40, marginTop: 30, lineHeight: 1.2}}>One outstanding item</div>
                        {[0.92, 0.8, 0.6].map((v, i) => <div key={i} style={{height: 14, borderRadius: 7, width: `${v * 100}%`, background: 'rgba(244,241,236,.2)', marginTop: 20}} />)}
                        <div style={{display: 'flex', gap: 20, marginTop: 44, opacity: p01(t, tAB - 0.3, 0.3)}}>
                          {['A', 'B'].map((x, i) => (
                            <div key={x} style={{flex: 1, height: 78, borderRadius: 16, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 40, background: (flip + i) % 2 === 0 && t > tAB + 0.3 ? C.orange : 'rgba(255,255,255,.07)', color: (flip + i) % 2 === 0 && t > tAB + 0.3 ? '#1a0e09' : C.ink}}>{x}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Glass>
                </div>
              ))}
            </div>
          </Layer>
        )}
      </div>
      <div style={{position: 'absolute', left: 840, top: 820, fontFamily: F.ui, fontWeight: 700, fontSize: 36, color: C.green, opacity: p01(t, tFast - 0.1, 0.3)}}>
        → moves through them much faster
      </div>
    </AbsoluteFill>
  );
};

// ---------- 11.3–11.4 Andrew Edstrom: too cautious → a bold write-up → 133 PRs
export const TipAndrew: React.FC = () => {
  const {t, w, L} = useS();
  const tCaut = w('cautious');
  const tWrite = w('writeup');
  const tMorning = w('morning');
  const tPR = w('pull');
  const night = p01(t, tMorning - 0.5, 0.8, E.inOut);
  const N = 133;
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(0.05, {from: 'l', dist: 200})} style={{left: 160, top: 230}}>
        <NameCard name="Andrew Edstrom" role="Engineer at Anthropic" w={400} />
      </Layer>
      {/* cautious: tiny steps, then stop and ask */}
      <Layer t={t} at={enter(tCaut - 0.6, {from: 'd', dist: 100, out: tWrite - 0.3})} style={{left: 760, top: 330}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              <div style={{width: 120, height: 120, borderRadius: 24, background: '#202126', boxShadow: `0 0 0 1px ${C.line2}`, display: 'grid', placeItems: 'center', opacity: p01(t, tCaut - 0.5 + i * 0.3, 0.2)}}>
                <Icon name="edit" size={50} color={C.ink2} />
              </div>
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 70, color: C.orangeHi, opacity: p01(t, tCaut - 0.35 + i * 0.3, 0.2)}}>?</div>
            </React.Fragment>
          ))}
        </div>
        <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 36, color: C.ink2, marginTop: 30, opacity: p01(t, tCaut, 0.3)}}>Too cautious: small changes, then stops to ask</div>
      </Layer>
      {/* the write-up */}
      <Layer t={t} at={(tt) => ({...enter(tWrite - 0.2, {from: 'r', dist: 240, out: tMorning - 0.3, to: 'l'})(tt), r: lerp(8, -3, p01(tt, tWrite - 0.2, 0.7))})} style={{left: 880, top: 250}}>
        <Glass w={560} h={560}>
          <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.orangeHi}}>A COLLEAGUE'S WRITE-UP</div>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 46, marginTop: 16, lineHeight: 1.05}}>A big, bold migration</div>
          {Array.from({length: 9}, (_, i) => <div key={i} style={{height: 14, borderRadius: 7, width: `${[90, 84, 96, 70, 88, 60, 92, 76, 50][i]}%`, background: 'rgba(244,241,236,.22)', marginTop: 20}} />)}
        </Glass>
      </Layer>
      <Layer t={t} at={enter(tWrite + 0.3, {from: 'r', dist: 120, out: tMorning - 0.3})} style={{left: 1480, top: 420}}>
        <div style={{textAlign: 'center'}}>
          <ClaudeMark size={110} />
          <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 26, color: C.ink2, marginTop: 14}}>reads it</div>
        </div>
      </Layer>
      {/* overnight → 133 PRs */}
      {t > tMorning - 0.6 && (
        <>
          <div style={{position: 'absolute', left: 1580, top: 230, opacity: p01(t, tMorning - 0.6, 0.3)}}>
            <div style={{transform: `rotate(${night * 180}deg)`, transformOrigin: '60px 60px', width: 120, height: 120}}>
              <div style={{position: 'absolute', opacity: 1 - night}}><Icon name="moon" size={120} color={C.ink2} width={1.6} /></div>
              <div style={{position: 'absolute', opacity: night, transform: 'rotate(180deg)'}}><Icon name="sun" size={120} color={C.orangeHi} width={1.6} /></div>
            </div>
          </div>
          <div style={{position: 'absolute', left: 740, top: 250, fontFamily: F.mono, fontSize: 24, letterSpacing: '0.24em', color: C.ink3, opacity: p01(t, tMorning, 0.3)}}>THE NEXT MORNING</div>
          <div style={{position: 'absolute', left: 740, top: 300, display: 'grid', gridTemplateColumns: 'repeat(19, 36px)', gap: 8}}>
            {Array.from({length: N}, (_, i) => {
              const on = p01(t, tPR - 1.0 + i * 0.012, 0.18);
              return <div key={i} style={{width: 36, height: 36, borderRadius: 8, background: i % 9 === 0 ? C.orange : 'rgba(107,203,139,.75)', opacity: on, transform: `scale(${on})`}} />;
            })}
          </div>
          <div style={{position: 'absolute', left: 740, top: 650, fontFamily: F.display, fontWeight: 900, fontSize: 150, letterSpacing: '-0.04em', lineHeight: 1}}>
            <Count t={t} at={tPR - 1.0} dur={1.8} to={N} />
            <span style={{fontSize: 56, fontWeight: 800, color: C.ink2}}> pull requests</span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------- 11.5 "don't just tell Claude to be bold. Show it what bold looks like."
export const TipLesson: React.FC = () => {
  const {t, w} = useS();
  const tTell = w('tell');
  const tShow = w('show');
  const card = (at: number, x: number, ok: boolean, title: string, sub: string) => (
    <Layer t={t} at={enter(at - 0.15, {from: ok ? 'r' : 'l', dist: 220})} style={{left: x, top: 300}}>
      <Glass w={640} h={440} glow={ok ? p01(t, at, 0.3) * 0.8 : 0} style={{opacity: ok ? 1 : lerp(1, 0.55, p01(t, tShow, 0.4))}}>
        <div style={{width: 110, height: 110, borderRadius: 30, display: 'grid', placeItems: 'center', background: ok ? 'rgba(107,203,139,.15)' : 'rgba(240,106,90,.15)'}}>
          <Icon name={ok ? 'check' : 'x'} size={70} color={ok ? C.green : C.red} width={2.6} p={p01(t, at, 0.4)} />
        </div>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 84, marginTop: 40, letterSpacing: '-0.03em'}}>{title}</div>
        <div style={{fontFamily: F.ui, fontSize: 30, color: C.ink2, marginTop: 10}}>{sub}</div>
      </Glass>
    </Layer>
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.32em', color: C.orangeHi, opacity: p01(t, 0.05, 0.4)}}>THE LESSON</div>
      </div>
      {card(tTell, 260, false, "Don't tell", '“Be bold.”')}
      {card(tShow, 1020, true, 'Show', 'an example of bold, done right')}
    </AbsoluteFill>
  );
};

// ---------- 12.0 the to-do list
export const TodoList: React.FC = () => {
  const {t, w} = useS();
  const items = [
    ['Build a mod with one sentence', w('build'), ''],
    ['Switch to Sonnet for small tasks', w('switch'), ''],
    ['Claim your credit', w('claim'), 'by Oct 7'],
    ['Use your limit reset', w('use'), 'by Oct 22'],
    ['Run prompt-audit', w('run'), ''],
    ['Turn on “You should know”', w('turn'), ''],
  ] as [string, number, string][];
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(1.2, {from: 'd', dist: 120})} style={{left: 460, top: 190}}>
        <Glass w={1000} pad={40}>
          {items.map(([s, at, due], i) => {
            const done = p01(t, at + 0.15, 0.35);
            return (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '17px 0', borderBottom: i < items.length - 1 ? `1px solid ${C.line}` : undefined, opacity: lerp(0.35, 1, p01(t, at - 0.2, 0.3))}}>
                <div style={{width: 52, height: 52, borderRadius: 14, background: done > 0 ? C.orange : 'none', boxShadow: `inset 0 0 0 2.5px ${done > 0 ? C.orange : C.line2}`, display: 'grid', placeItems: 'center', transform: `scale(${1 + 0.15 * Math.sin(done * Math.PI)})`}}>
                  {done > 0 && <Icon name="check" size={36} color="#1a0e09" width={3} p={done} />}
                </div>
                <div style={{flex: 1, fontFamily: F.ui, fontWeight: 700, fontSize: 38, color: done > 0.5 ? C.ink : C.ink2}}>{s}</div>
                {due && <div style={{fontFamily: F.mono, fontSize: 26, padding: '8px 16px', borderRadius: 10, background: 'rgba(240,106,90,.14)', color: '#F5B3AA', boxShadow: '0 0 0 1px rgba(240,106,90,.45)'}}>{due}</div>}
              </div>
            );
          })}
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 12.1 "from a tool you use into a tool you shape"
export const UseShape: React.FC = () => {
  const {t, w} = useS();
  const tUse = w('use');
  const tShape = w('shape');
  const m = p01(t, tShape - 0.15, 0.5, E.inOut);
  return (
    <AbsoluteFill>
      <At x={960} y={330}>
        <div style={{transform: `scale(${bounce(t, 0.1, 12, 140)}) rotate(${tw(t, 0.1, 4, -30, 30, E.easy)}deg)`, filter: 'drop-shadow(0 0 50px rgba(217,119,87,.45))'}}>
          <ClaudeMark size={170} />
        </div>
      </At>
      <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center'}}>
        <AText t={t} text="Claude Code is turning from" at={0.15} size={54} by="word" color={C.ink2} />
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 130, letterSpacing: '-0.045em', marginTop: 24, opacity: p01(t, tUse - 0.4, 0.3)}}>
          a tool you{' '}
          <span style={{position: 'relative', display: 'inline-block', width: lerp(260, 400, m), textAlign: 'left'}}>
            <span style={{position: 'absolute', left: 0, opacity: 1 - m, filter: `blur(${m * 12}px)`, transform: `translateY(${-m * 40}px)`}}>use</span>
            <span style={{position: 'absolute', left: 0, opacity: m, filter: `blur(${(1 - m) * 12}px)`, transform: `translateY(${(1 - m) * 40}px)`, color: C.orange}}>shape</span>
            &nbsp;
          </span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 1240, top: 700}}>
        <Burst t={t} at={tShape + 0.1} n={12} r0={60} r1={160} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 13.* outro: like, subscribe, comment
export const Outro: React.FC = () => {
  const {t, w, L, dur} = useS();
  const tLike = w('like');
  const tSub = w('subscribe');
  const tComments = w('comments');
  const tSee = w('see');
  const liked = t > tLike + 0.05;
  const subbed = t > tSub + 0.05;
  const cx = kf(t, [[0, 1300], [tLike - 0.05, 790, E.inOut], [tSub - 0.35, 790], [tSub - 0.05, 1110, E.inOut], [tComments, 1500, E.inOut]]);
  const cy = kf(t, [[0, 900], [tLike - 0.05, 555, E.inOut], [tSub - 0.05, 555, E.inOut], [tComments, 980, E.inOut]]);
  const press = (at: number) => (t > at - 0.05 && t < at + 0.12 ? 0.82 : 1);
  const msg = "What's the first mod you'll build?";
  const typed = msg.slice(0, Math.floor(clamp((t - tComments - 0.2) / 1.3) * msg.length));
  const end = p01(t, tSee - 0.2, 0.6, E.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - end * 0.9, transform: `scale(${1 - end * 0.08})`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
          <AText t={t} text="Daily AI news, explained and *shown*" at={0.1} size={64} by="word" />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center', gap: 40}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 40px', borderRadius: 999, background: liked ? C.orange : 'rgba(255,255,255,.08)', color: liked ? '#1a0e09' : C.ink, fontFamily: F.ui, fontWeight: 800, fontSize: 40, transform: `scale(${press(tLike) * (liked ? 1 + 0.1 * Math.sin(p01(t, tLike, 0.3) * Math.PI) : 1)})`}}>
            <Icon name="thumb" size={44} color={liked ? '#1a0e09' : C.ink} width={2.2} fill={liked ? '#1a0e09' : undefined} /> Like
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 40px', borderRadius: 999, background: subbed ? 'rgba(255,255,255,.12)' : C.ink, color: subbed ? C.ink : '#111', fontFamily: F.ui, fontWeight: 800, fontSize: 40, transform: `scale(${press(tSub)})`}}>
            {subbed && <Icon name="bell" size={40} color={C.ink} width={2.2} />} {subbed ? 'Subscribed' : 'Subscribe'}
          </div>
        </div>
        <div style={{position: 'absolute', left: 760, top: 500}}>
          <Burst t={t} at={tLike} n={10} r0={60} r1={140} />
        </div>
        <Layer t={t} at={enter(tComments - 0.1, {from: 'd', dist: 100})} style={{left: 560, top: 720}}>
          <div style={{width: 800, display: 'flex', gap: 20, alignItems: 'flex-start'}}>
            <div style={{width: 64, height: 64, borderRadius: 32, background: '#2a2b31', flex: 'none', display: 'grid', placeItems: 'center'}}>
              <Icon name="chat" size={34} color={C.ink2} />
            </div>
            <div style={{flex: 1, padding: '20px 26px', borderRadius: '8px 26px 26px 26px', background: 'rgba(34,35,40,.92)', boxShadow: `0 0 0 1px ${C.line2}`, fontFamily: F.ui, fontWeight: 600, fontSize: 36, minHeight: 50}}>
              {typed}
              <span style={{opacity: typed.length < msg.length ? 1 : 0, color: C.orange}}>|</span>
            </div>
          </div>
        </Layer>
        <svg width={40} height={52} viewBox="0 0 26 34" style={{position: 'absolute', left: cx, top: cy, transform: `scale(${Math.min(press(tLike), press(tSub)) * 1.5})`, filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.5))', opacity: p01(t, 0.3, 0.3)}}>
          <path d="M4 3 L4 26 L9.4 20.9 L13 29.4 L16.6 27.9 L13.1 19.6 L20.4 19.6 Z" fill="#000" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
        </svg>
      </div>
      {/* end card */}
      {end > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: end, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
          <div style={{transform: `scale(${lerp(0.7, 1, end)})`, filter: 'drop-shadow(0 0 50px rgba(217,119,87,.5))'}}>
            <ClaudeMark size={150} />
          </div>
          <AText t={t} text="See you in the *next one*." at={tSee} size={96} by="word" />
          <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.ink3, opacity: p01(t, tSee + 0.8, 0.5)}}>AI NEWS DAILY · 3 OCT 2026</div>
          <div style={{fontFamily: F.mono, fontSize: 16, color: C.ink3, opacity: p01(t, tSee + 1.2, 0.5), marginTop: 30}}>Source: “This week in Claude Code” email, Claude Code team, 3 Oct 2026 · Claude symbol: Wikimedia Commons (CC0)</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
