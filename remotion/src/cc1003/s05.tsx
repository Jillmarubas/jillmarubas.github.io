// Part 4 · Free credit, Part 5 · prompt-audit.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, R} from './design';
import {AText, At, Count, Draw, E, Layer, bounce, clamp, enter, kf, lerp, p01, tw} from './ae';
import {useS} from './timing';
import {CalendarPage, Callout, ClaudeMark, Glass, Icon, IconTile, Ring} from './ui';
import {TermShot, screenToFrame} from './shots';

const Kicker: React.FC<{t: number; at: number; text: string; y?: number}> = ({t, at, text, y = 150}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: F.mono, fontSize: 26, letterSpacing: '0.32em', color: C.orangeHi, opacity: p01(t, at, 0.4)}}>{text}</div>
);

// ---------- 6.0–6.1 deadlines; cloud sessions out of research preview
export const CloudIncluded: React.FC = () => {
  const {t, w, L} = useS();
  const tDead = w('deadlines');
  const tFree = w('free');
  const tPrev = w('preview');
  const tInc = w('included');
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(tFree - 0.1, {from: 'd', dist: 50, out: L(1) - 0.2})} style={{left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 32px', borderRadius: 999, background: `rgba(240,106,90,${0.12 * p01(t, tDead, 0.3)})`, boxShadow: `0 0 0 1.5px ${t > tDead ? 'rgba(240,106,90,.55)' : 'rgba(217,119,87,.55)'}`, fontFamily: F.ui, fontWeight: 700, fontSize: 40}}>
          <Icon name={t > tDead ? 'clock' : 'dollar'} size={40} color={t > tDead ? C.red : C.orangeHi} width={2.2} /> Free credit
          <span style={{color: '#F5B3AA', opacity: p01(t, tDead, 0.3), maxWidth: 400 * p01(t, tDead - 0.1, 0.4), overflow: 'hidden', whiteSpace: 'nowrap', display: 'inline-block'}}>· with deadlines</span>
        </div>
      </Layer>
      <At x={960} y={360}>
        <Layer t={t} at={enter(L(1) - 0.1, {from: 'z', s0: 0.5})} style={{left: -120, top: -120}}>
          <div style={{width: 240, height: 240, borderRadius: 70, display: 'grid', placeItems: 'center', background: 'linear-gradient(160deg,#26272c,#18191d)', boxShadow: '0 0 0 1.5px rgba(217,119,87,.5), 0 30px 60px -20px rgba(0,0,0,.8)'}}>
            <Icon name="cloud" size={150} color={C.orangeHi} width={1.4} p={p01(t, L(1), 0.8, E.inOut)} />
          </div>
        </Layer>
      </At>
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center'}}>
        <AText t={t} text="Cloud sessions" at={L(1) + 0.1} size={80} by="word" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', gap: 40}}>
        <Layer t={t} at={enter(tPrev - 0.3, {from: 'l', dist: 120})}>
          <div style={{position: 'relative', padding: '16px 30px', borderRadius: 14, fontFamily: F.mono, fontSize: 30, color: C.ink3, boxShadow: `0 0 0 1.5px ${C.line2}`, opacity: 1 - 0.5 * p01(t, tInc - 0.3, 0.3)}}>
            Research preview
            <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={360} height={70}>
              <Draw t={t} d="M10 36 L330 30" at={tPrev + 0.1} dur={0.3} stroke={C.red} width={5} />
            </svg>
          </div>
        </Layer>
        <Layer t={t} at={enter(tInc - 0.1, {from: 'r', dist: 120})}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 30px', borderRadius: 14, fontFamily: F.ui, fontWeight: 700, fontSize: 32, background: 'rgba(107,203,139,.12)', boxShadow: '0 0 0 1.5px rgba(107,203,139,.55)'}}>
            <Icon name="check" size={34} color={C.green} width={2.6} /> Included in your plan
          </div>
        </Layer>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6.2–6.3 bonus credit $100 / $250, spent first
export const BonusCredit: React.FC = () => {
  const {t, w, L} = useS();
  const tBonus = w('bonus');
  const t100 = w('hundred');
  const t250 = w('fifty');
  const tFirst = w('first');
  const outA = L(3) - 0.3;
  const card = (at: number, plan: string, amt: number, x: number, hot: boolean) => (
    <Layer t={t} at={(tt) => ({...enter(at - 0.15, {from: 'd', dist: 200, out: outA, to: 'u'})(tt), ry: lerp(-50, 0, p01(tt, at - 0.15, 0.8)), r: lerp(hot ? 6 : -6, 0, p01(tt, at - 0.15, 0.8))})} style={{left: x, top: 330}}>
      <div style={{width: 560, height: 340, borderRadius: 30, padding: 36, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', background: hot ? 'linear-gradient(135deg, #E08A6B 0%, #C4613F 55%, #8F4127 100%)' : 'linear-gradient(135deg, #3a3b42 0%, #24252a 60%, #18191d 100%)', boxShadow: '0 40px 80px -24px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,255,255,.25)'}}>
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0) ${tw(t, at + 0.2, 1.2, -20, 120)}%, rgba(255,255,255,.22) ${tw(t, at + 0.2, 1.2, -10, 130)}%, rgba(255,255,255,0) ${tw(t, at + 0.2, 1.2, 0, 140)}%)`}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <ClaudeMark size={56} style={{filter: hot ? 'brightness(0) invert(1)' : undefined}} />
          <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.2em', color: hot ? '#2a1209' : C.ink3}}>ONE-TIME BONUS</div>
        </div>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 130, color: hot ? '#fff' : C.ink, marginTop: 30, letterSpacing: '-0.04em'}}>
          $<Count t={t} at={at} dur={0.9} to={amt} />
        </div>
        <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 32, color: hot ? '#2a1209' : C.ink2}}>{plan}</div>
      </div>
    </Layer>
  );
  // spend order
  const drain = p01(t, tFirst + 0.2, 1.6, E.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center'}}>
        <AText t={t} text="Existing *Pro* or *Max* subscriber?" at={0.1} size={60} by="word" out={outA} />
        <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.24em', color: C.ink3, marginTop: 16, opacity: p01(t, tBonus, 0.3) * (1 - p01(t, outA, 0.3))}}>ONE-TIME BONUS CREDIT</div>
      </div>
      {card(t100, 'on Pro', 100, 300, false)}
      {card(t250, 'on Max', 250, 1060, true)}
      {/* credit is spent first */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
        <AText t={t} text="Spent *first*, before your plan" at={L(3)} size={60} by="word" />
      </div>
      <Layer t={t} at={enter(L(3) + 0.1, {from: 'd', dist: 120})} style={{left: 260, top: 360}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 60}}>
          <IconTile t={t} at={L(3) + 0.1} name="cloud" size={170} hot label="Cloud session" />
          <svg width={140} height={40}>
            <Draw t={t} d="M5 20 H130" at={tFirst} dur={0.3} stroke={C.orange} width={5} />
          </svg>
          {[['Bonus credit', 1 - drain, C.orange, '1st'], ['Plan usage', 1 - Math.max(0, p01(t, tFirst + 1.8, 1.4) * 0.3), 'rgba(244,241,236,.4)', '2nd']].map(([lb, v, c, n]) => (
            <div key={lb as string} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
              <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.2em', color: C.orangeHi}}>{n}</div>
              <div style={{width: 160, height: 260, borderRadius: 22, boxShadow: `inset 0 0 0 2px ${C.line2}`, position: 'relative', overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${(v as number) * 100}%`, background: c as string}} />
              </div>
              <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 28}}>{lb}</div>
            </div>
          ))}
        </div>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 6.4 "/claim-credit … by October seventh"
export const ClaimCredit: React.FC = () => {
  const {w} = useS();
  const at = w('type') - 0.05;
  const en = w('credit', 0) + 0.4;
  const tOct = w('october');
  return (
    <TermShot cmd="/claim-credit" at={at} enter={en} label="CLAIM YOUR BONUS CREDIT" slide={-330} slideAt={tOct - 0.4}>
      {(rig, t) => (
        <div style={{position: 'absolute', left: 1440, top: 230}}>
          <Layer t={t} at={(tt) => ({...enter(tOct - 0.2, {from: 'r', dist: 200})(tt), r: lerp(14, -4, p01(tt, tOct - 0.2, 0.8))})}>
            <CalendarPage t={t} at={tOct} month="OCT" day="7" note="CLAIM BY THIS DATE" />
          </Layer>
        </div>
      )}
    </TermShot>
  );
};

// ---------- 6.5–6.6 +20% limits, one reset; Settings › Usage by Oct 22
export const SecondFreebie: React.FC = () => {
  const {t, w, L} = useS();
  const tTw = w('twenty');
  const tReset = w('reset');
  const tSet = w('settings');
  const tUse = w('usage');
  const tOct = w('october');
  const outA = L(6) - 0.3;
  const g = tw(t, tTw - 0.1, 1.2, 1, 1.2, E.out);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <AText t={t} text="A second *freebie*" at={0.1} size={70} by="word" out={outA} />
      </div>
      <At x={620} y={560}>
        <Layer t={t} at={enter(0.3, {from: 'l', dist: 200, out: outA, to: 'l'})} style={{left: -200, top: -200}}>
          <Ring v={0.75 * g / 1.2 + 0.1} size={400} width={28}>
            <div>
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 96}}>
                +<Count t={t} at={tTw - 0.1} dur={1.0} to={20} />%
              </div>
              <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.16em', color: C.ink3}}>5-HOUR LIMITS</div>
              <div style={{fontFamily: F.ui, fontSize: 22, color: C.ink3, marginTop: 6}}>for everyone</div>
            </div>
          </Ring>
        </Layer>
      </At>
      <At x={1300} y={560}>
        <Layer t={t} at={enter(tReset - 0.4, {from: 'r', dist: 200, out: outA, to: 'r'})} style={{left: -230, top: -200}}>
          <Glass w={460} h={400} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
            <div style={{transform: `rotate(${tw(t, tReset, 1.2, 0, 360, E.inOut)}deg)`}}>
              <Icon name="refresh" size={130} color={C.orangeHi} width={1.6} p={p01(t, tReset - 0.3, 0.7)} />
            </div>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 46, textAlign: 'center'}}>1 full limit reset</div>
            <div style={{fontFamily: F.ui, fontSize: 24, color: C.ink3}}>Pro · Max · Team</div>
          </Glass>
        </Layer>
      </At>
      {/* where to find it */}
      <Layer t={t} at={enter(L(6) - 0.1, {from: 'd', dist: 160})} style={{left: 250, top: 300}}>
        <Glass w={980} h={500} pad={0} style={{overflow: 'hidden'}}>
          <div style={{height: 54, display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderBottom: `1px solid ${C.line}`, background: '#232328'}}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />)}
          </div>
          <div style={{display: 'flex', height: 446}}>
            <div style={{width: 300, borderRight: `1px solid ${C.line}`, padding: 22}}>
              {['General', 'Usage', 'Account'].map((s) => {
                const on = s === 'Usage' && t > tUse;
                return (
                  <div key={s} style={{padding: '14px 18px', borderRadius: 12, marginBottom: 6, fontFamily: F.ui, fontWeight: 600, fontSize: 28, color: on ? C.ink : C.ink3, background: on ? 'rgba(217,119,87,.18)' : 'none', boxShadow: on ? 'inset 0 0 0 1.5px rgba(217,119,87,.6)' : 'none'}}>{s}</div>
                );
              })}
            </div>
            <div style={{flex: 1, padding: 34}}>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 44, opacity: t > tUse ? 1 : 0.3}}>{t > tUse ? 'Usage' : 'Settings'}</div>
              {t > tUse && (
                <div style={{marginTop: 30, opacity: p01(t, tUse + 0.1, 0.3)}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 24px', borderRadius: 16, background: 'rgba(255,255,255,.05)', boxShadow: `inset 0 0 0 1px ${C.line2}`}}>
                    <span style={{fontFamily: F.ui, fontWeight: 600, fontSize: 28}}>One-time limit reset</span>
                    <span style={{fontFamily: F.ui, fontWeight: 700, fontSize: 24, padding: '10px 18px', borderRadius: 10, background: C.orange, color: '#1a0e09'}}>Available</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Glass>
      </Layer>
      <div style={{position: 'absolute', left: 990, top: 812, fontFamily: F.mono, fontSize: 16, color: C.ink3, opacity: p01(t, L(6), 0.3)}}>illustration</div>
      <div style={{position: 'absolute', left: 250, top: 830, fontFamily: F.mono, fontSize: 34, color: C.ink, opacity: p01(t, tSet - 0.1, 0.3)}}>
        Settings <span style={{color: C.orangeHi, opacity: p01(t, tUse - 0.1, 0.2)}}>› Usage</span>
      </div>
      {/* cursor clicking the path */}
      {t > L(6) && (() => {
        const cx = kf(t, [[L(6), 900], [tSet, 560, E.inOut], [tUse - 0.1, 400, E.inOut]]);
        const cy = kf(t, [[L(6), 800], [tSet, 700, E.inOut], [tUse - 0.1, 480, E.inOut]]);
        const press = t > tUse - 0.1 && t < tUse + 0.1 ? 0.85 : 1;
        return (
          <svg width={40} height={52} viewBox="0 0 26 34" style={{position: 'absolute', left: cx, top: cy, transform: `scale(${press * 1.4})`, filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.5))'}}>
            <path d="M4 3 L4 26 L9.4 20.9 L13 29.4 L16.6 27.9 L13.1 19.6 L20.4 19.6 Z" fill="#000" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
          </svg>
        );
      })()}
      <div style={{position: 'absolute', left: 1380, top: 300}}>
        <Layer t={t} at={(tt) => ({...enter(tOct - 0.2, {from: 'r', dist: 200})(tt), r: lerp(14, 4, p01(tt, tOct - 0.2, 0.8))})}>
          <CalendarPage t={t} at={tOct} month="OCT" day="22" note="USE YOUR RESET BY" />
        </Layer>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7.0 two models in ten days; old instructions work against you
export const AuditWhy: React.FC = () => {
  const {t, w, L} = useS();
  const tTen = w('ten');
  const tOld = w('old');
  const tAgainst = w('against');
  const pull = p01(t, tAgainst - 0.1, 0.8, E.inOut);
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(L(0) + 1.4, {from: 'd', dist: 100})} style={{left: 260, top: 240}}>
        <div style={{width: 1400, position: 'relative', height: 220}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 110, height: 4, background: C.ink4}} />
          {[['Sonnet 5.5', 0.38], ['Opus 5.5', 0.62]].map(([n, x], i) => (
            <div key={n as string} style={{position: 'absolute', left: `${(x as number) * 100}%`, top: 0, transform: `translate(-50%, ${(1 - bounce(t, L(0) + 1.6 + i * 0.25, 12, 200)) * -80}px)`, opacity: p01(t, L(0) + 1.6 + i * 0.25, 0.2), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
              <div style={{padding: '10px 20px', borderRadius: 999, background: '#24252b', boxShadow: '0 0 0 1.5px rgba(217,119,87,.6)', fontFamily: F.ui, fontWeight: 700, fontSize: 28, whiteSpace: 'nowrap'}}>{n}</div>
              <div style={{width: 22, height: 22, borderRadius: 11, background: C.orange, marginTop: 30}} />
            </div>
          ))}
          <svg width={1400} height={220} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <Draw t={t} d="M430 170 L430 190 L970 190 L970 170" at={tTen - 0.1} dur={0.5} stroke={C.orangeHi} width={3} />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: F.mono, fontSize: 28, color: C.orangeHi, opacity: p01(t, tTen + 0.2, 0.3)}}>10 days</div>
        </div>
      </Layer>
      {/* old instructions pulling backwards */}
      <Layer t={t} at={enter(tOld - 0.2, {from: 'd', dist: 120})} style={{left: 560, top: 560}}>
        <div style={{position: 'relative'}}>
          <Glass w={800} pad={26} style={{transform: `translateX(${-pull * 40}px) rotate(${-pull * 2}deg)`}}>
            <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink3, marginBottom: 14}}>CLAUDE.md</div>
            {['Always explain every step in detail', 'Read files in /old-src first', 'Never ask follow-up questions'].map((s, i) => (
              <div key={s} style={{fontFamily: F.mono, fontSize: 24, color: pull > 0.3 ? '#F5B3AA' : C.ink2, marginBottom: 8, whiteSpace: 'nowrap'}}>- {s}</div>
            ))}
          </Glass>
          <svg width={300} height={80} style={{position: 'absolute', left: -280, top: 80, overflow: 'visible', opacity: pull}}>
            <Draw t={t} d="M260 40 H30" at={tAgainst} dur={0.4} stroke={C.red} width={6} />
            <Draw t={t} d="M60 15 L30 40 L60 65" at={tAgainst + 0.3} dur={0.2} stroke={C.red} width={6} />
          </svg>
          <div style={{position: 'absolute', left: -280, top: 150, fontFamily: F.ui, fontWeight: 700, fontSize: 28, color: C.red, opacity: pull}}>working against you</div>
        </div>
      </Layer>
      <div style={{position: 'absolute', left: 560, top: 820, fontFamily: F.mono, fontSize: 18, color: C.ink3, opacity: p01(t, tOld, 0.3)}}>example instructions, for illustration</div>
    </AbsoluteFill>
  );
};

// ---------- 7.1 /checkup prompt-audit
export const AuditCmd: React.FC = () => {
  const {w} = useS();
  const at = w('type') - 0.05;
  const en = w('audit', 1) + 0.35;
  return <TermShot cmd="/checkup prompt-audit" at={at} enter={en} label="RUN THE AUDIT" entries={[{at: en + 0.3, kind: 'spin', text: 'Reading CLAUDE.md, skills, agents, commands', until: en + 30}]} outY={330} />;
};

// ---------- 7.2–7.3 reads your files, flags three kinds of problems
export const AuditScan: React.FC = () => {
  const {t, w, L} = useS();
  const files = [['CLAUDE.md', w('claude', 1)], ['Skills', w('skills')], ['Agents', w('agents')], ['Custom commands', w('commands')]] as [string, number][];
  const scan = p01(t, files[0][1], files[3][1] - files[0][1] + 0.6, E.easy);
  const flags = [
    ['Written for older models', w('instructions'), 'chip'],
    ["Paths that don't exist", w('paths'), 'search'],
    ['Rules that contradict', w('contradict'), 'scissors'],
  ] as [string, number, string][];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center'}}>
        <AText t={t} text="What prompt-audit checks" at={0.1} size={64} by="word" />
      </div>
      <div style={{position: 'absolute', left: 180, top: 280}}>
        {files.map(([n, at], i) => (
          <Layer key={n} t={t} at={enter(at - 0.15, {from: 'l', dist: 160})} style={{position: 'relative', marginBottom: 22}}>
            <Glass w={560} h={118} pad={22} style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <Icon name="file" size={52} color={C.ink2} />
              <div style={{fontFamily: F.mono, fontSize: 32}}>{n}</div>
              <div style={{marginLeft: 'auto', opacity: p01(t, at + 0.4, 0.2)}}>
                <Icon name="check" size={34} color={C.green} width={2.6} p={p01(t, at + 0.4, 0.3)} />
              </div>
            </Glass>
          </Layer>
        ))}
        {scan > 0 && scan < 1 && <div style={{position: 'absolute', left: -20, width: 600, top: scan * 560, height: 4, background: C.orange, boxShadow: `0 0 30px 8px rgba(217,119,87,.5)`}} />}
      </div>
      <div style={{position: 'absolute', left: 900, top: 290}}>
        {flags.map(([n, at, ic], i) => (
          <Layer key={n} t={t} at={enter(at - 0.12, {from: 'r', dist: 200})} style={{position: 'relative', marginBottom: 30}}>
            <Glass w={840} h={150} glow={p01(t, at, 0.3) * (1 - p01(t, at + 0.8, 0.5))} style={{display: 'flex', alignItems: 'center', gap: 26}}>
              <div style={{width: 92, height: 92, borderRadius: 24, background: 'rgba(217,119,87,.16)', display: 'grid', placeItems: 'center'}}>
                <Icon name="flag" size={48} color={C.orangeHi} width={2} p={p01(t, at, 0.5)} />
              </div>
              <div>
                <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.2em', color: C.orangeHi}}>FLAG {i + 1}</div>
                <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 40}}>{n}</div>
              </div>
            </Glass>
          </Layer>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7.4–7.5 changes nothing by itself: report + patch; you decide
export const AuditReport: React.FC = () => {
  const {t, w, L} = useS();
  const tNot = w('doesnt');
  const tRep = w('report');
  const tPatch = w('patch');
  const tDecide = w('decide');
  const fixes = ['Update the old instruction', 'Remove the stale path', 'Keep one of the two rules'];
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(tNot - 0.15, {from: 'u', dist: 80})} style={{left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 30px', borderRadius: 999, background: 'rgba(255,255,255,.06)', boxShadow: `0 0 0 1.5px ${C.line2}`, fontFamily: F.ui, fontWeight: 700, fontSize: 36}}>
          <Icon name="lock" size={38} color={C.orangeHi} width={2.2} p={p01(t, tNot, 0.5)} /> Changes nothing by itself
        </div>
      </Layer>
      {[['report.md', 'Findings', tRep, 260, 'doc'], ['changes.patch', 'Suggested edits', tPatch, 260 + 400, 'edit']].map(([n, d, at, x, ic]) => (
        <Layer key={n as string} t={t} at={(tt) => ({...enter((at as number) - 0.15, {from: 'd', dist: 180})(tt), r: lerp(-8, 0, p01(tt, (at as number) - 0.15, 0.7))})} style={{left: x as number, top: 320}}>
          <Glass w={360} h={440} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
            <Icon name={ic as string} size={130} color={C.ink} width={1.3} p={p01(t, at as number, 0.7)} />
            <div style={{fontFamily: F.mono, fontSize: 32}}>{n}</div>
            <div style={{fontFamily: F.ui, fontSize: 26, color: C.ink3}}>{d}</div>
          </Glass>
        </Layer>
      ))}
      <Layer t={t} at={enter(L(5) - 0.1, {from: 'r', dist: 200})} style={{left: 1110, top: 320}}>
        <Glass w={620} h={440}>
          <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.24em', color: C.orangeHi, marginBottom: 26}}>YOU DECIDE</div>
          {fixes.map((s, i) => {
            const on = i !== 1 && t > tDecide + 0.2 + i * 0.3;
            return (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 0', borderBottom: i < 2 ? `1px solid ${C.line}` : undefined}}>
                <div style={{width: 40, height: 40, borderRadius: 10, boxShadow: `inset 0 0 0 2px ${on ? C.orange : C.line2}`, background: on ? C.orange : 'none', display: 'grid', placeItems: 'center'}}>
                  {on && <Icon name="check" size={28} color="#1a0e09" width={3} />}
                </div>
                <span style={{fontFamily: F.ui, fontSize: 28, color: on ? C.ink : C.ink2}}>{s}</span>
              </div>
            );
          })}
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 7.6 "run this today"
export const AuditToday: React.FC = () => {
  const {t, w} = useS();
  const tRun = w('run');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center'}}>
        <AText t={t} text="Been using Claude Code a while?" at={0.05} size={54} by="word" color={C.ink2} />
      </div>
      <Layer t={t} at={(tt) => ({s: lerp(1.6, 1, bounce(tt, tRun - 0.05, 12, 220)), o: clamp((tt - tRun + 0.05) * 6)})} style={{left: 0, right: 0, top: 460, textAlign: 'center'}} size={800}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 150, letterSpacing: '-0.045em'}}>
          Run it <span style={{color: C.orange}}>today.</span>
        </div>
      </Layer>
      <Layer t={t} at={enter(tRun + 0.3, {from: 'd', dist: 50})} style={{left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: F.mono, fontSize: 40, padding: '16px 30px', borderRadius: 16, background: 'rgba(14,14,17,.9)', boxShadow: `0 0 0 1.5px ${C.line2}`}}>
          <span style={{color: C.orangeHi}}>/checkup</span> prompt-audit
        </div>
      </Layer>
    </AbsoluteFill>
  );
};
