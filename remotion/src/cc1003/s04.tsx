// Part 2 · Wrap-Up Allowance, Part 3 · Opus + Sonnet 5.5.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, R} from './design';
import {AText, At, Count, Draw, E, Layer, bounce, clamp, enter, kf, lerp, p01, tw} from './ae';
import {useS} from './timing';
import {Burst, ClaudeMark, Glass, Headline, Icon, IconTile, Ring, StatBar} from './ui';
import {TermShot, screenToFrame} from './shots';
import {Callout} from './ui';

const Kicker: React.FC<{t: number; at: number; text: string; y?: number; color?: string}> = ({t, at, text, y = 150, color = C.orangeHi}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: F.mono, fontSize: 26, letterSpacing: '0.32em', color, opacity: p01(t, at, 0.4)}}>{text}</div>
);

// A code card whose lines type in; `cut` freezes it mid-line, `resume` finishes it.
const CodeCard: React.FC<{t: number; at: number; cut?: number; resume?: number; done?: number; w?: number}> = ({t, at, cut, resume, done, w = 760}) => {
  const L = ['function saveSettings(user, prefs) {', '  const merged = { ...defaults, ...prefs };', '  validate(merged);', '  await db.users.update(user.id, {', '    settings: merged,', '  });', '  return merged;', '}'];
  const total = L.join('').length;
  const speed = 46; // chars per second
  let typedN = (t - at) * speed;
  if (cut !== undefined && t > cut) typedN = (cut - at) * speed + (resume !== undefined && t > resume ? (t - resume) * speed * 1.6 : 0);
  typedN = clamp(typedN, 0, total);
  let left = typedN;
  const shake = cut !== undefined && t > cut && t < cut + 0.25 ? Math.sin(t * 90) * 6 : 0;
  return (
    <Glass w={w} pad={0} style={{overflow: 'hidden', transform: `translateX(${shake}px)`}} glow={done !== undefined ? p01(t, done, 0.3) * 0.0 : 0}>
      <div style={{padding: '14px 22px', borderBottom: `1px solid ${C.line}`, fontFamily: F.mono, fontSize: 20, color: C.ink3, display: 'flex', justifyContent: 'space-between'}}>
        <span>settings.ts</span>
        {done !== undefined && t > done ? <span style={{color: C.green}}>✓ finished</span> : cut !== undefined && t > cut && (resume === undefined || t < resume) ? <span style={{color: C.red}}>✕ stopped</span> : <span style={{color: C.orangeHi}}>editing…</span>}
      </div>
      <div style={{padding: '20px 24px', fontFamily: F.mono, fontSize: 24, lineHeight: 1.6, minHeight: 330}}>
        {L.map((l, i) => {
          const n = Math.max(0, Math.min(l.length, Math.floor(left)));
          left -= l.length;
          return (
            <div key={i} style={{whiteSpace: 'pre', color: i % 3 === 0 ? C.ink : C.ink2, height: 38}}>
              {l.slice(0, n)}
            </div>
          );
        })}
      </div>
    </Glass>
  );
};

// ---------- 4.0–4.1 "nothing to set up … Claude Code has a five-hour usage limit."
export const LimitIntro: React.FC = () => {
  const {t, w, L} = useS();
  const tN = w('nothing');
  const tFive = w('fivehour');
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(tN - 0.1, {from: 'd', dist: 60, out: L(1) - 0.2})} style={{left: 0, right: 0, top: 480, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 32px', borderRadius: 999, background: 'rgba(107,203,139,.12)', boxShadow: '0 0 0 1.5px rgba(107,203,139,.55)', fontFamily: F.ui, fontWeight: 700, fontSize: 40, color: C.ink}}>
          <Icon name="check" size={40} color={C.green} width={2.6} p={p01(t, tN, 0.5)} /> Nothing to set up
        </div>
      </Layer>
      <At x={960} y={500}>
        <Layer t={t} at={enter(L(1) - 0.1, {from: 'z', s0: 0.5})} style={{left: -190, top: -190}}>
          <Ring v={tw(t, tFive, 2.2, 0, 0.82, E.inOut)} size={380} width={26}>
            <div>
              <Icon name="clock" size={64} color={C.ink2} />
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 92, marginTop: 6}}>5h</div>
              <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.ink3}}>USAGE LIMIT</div>
            </div>
          </Ring>
        </Layer>
      </At>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center'}}>
        <AText t={t} text="Claude Code's *five-hour* limit" at={L(1) + 0.2} size={56} by="word" />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4.2 "Before … Claude stopped right there, sometimes halfway through editing your code."
export const LimitBefore: React.FC = () => {
  const {t, w} = useS();
  const tStop = w('stopped');
  const tHalf = w('halfway');
  return (
    <AbsoluteFill>
      <Kicker t={t} at={0.1} text="BEFORE" color={C.ink3} />
      <Layer t={t} at={enter(0.05, {from: 'l', dist: 200})} style={{left: 200, top: 260}}>
        <CodeCard t={t} at={0.35} cut={tStop} />
      </Layer>
      <At x={1440} y={480}>
        <Layer t={t} at={enter(0.2, {from: 'r', dist: 200})} style={{left: -150, top: -150}}>
          <Ring v={tw(t, 0.3, tStop - 0.3, 0.82, 1, E.easy)} size={300} width={22} color={t > tStop ? C.red : C.orange}>
            <div>
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 72}}>5h</div>
              <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.2em', color: t > tStop ? C.red : C.ink3}}>{t > tStop ? 'LIMIT HIT' : 'LIMIT'}</div>
            </div>
          </Ring>
        </Layer>
      </At>
      <Layer t={t} at={(tt) => ({s: lerp(2.4, 1, bounce(tt, tStop + 0.05, 14, 300)), r: -8, o: clamp((tt - tStop - 0.05) * 10)})} style={{left: 420, top: 470}} size={500}>
        <div style={{padding: '18px 34px', border: `6px solid ${C.red}`, borderRadius: 14, fontFamily: F.display, fontWeight: 900, fontSize: 72, letterSpacing: '0.04em', color: C.red, background: 'rgba(20,8,8,.6)'}}>STOPPED</div>
      </Layer>
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center'}}>
        <AText t={t} text="…halfway through a change" at={tHalf - 0.1} size={52} by="word" color={C.ink2} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4.3 "Now it uses a small, fixed amount from your weekly limit to finish what it was doing."
export const LimitNow: React.FC = () => {
  const {t, w} = useS();
  const tSmall = w('small');
  const tWeekly = w('weekly');
  const tFinish = w('finish');
  const fly = p01(t, tWeekly + 0.25, 0.9, E.inOut);
  return (
    <AbsoluteFill>
      <Kicker t={t} at={0.1} text="NOW · WRAP-UP ALLOWANCE" />
      {/* weekly limit bar */}
      <Layer t={t} at={enter(0.1, {from: 'u', dist: 80})} style={{left: 360, top: 230}}>
        <div style={{width: 1200}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.ui, fontWeight: 600, fontSize: 28, color: C.ink2, marginBottom: 12}}>
            <span>Weekly limit</span>
            <span style={{fontFamily: F.mono, fontSize: 22, color: C.orangeHi, opacity: p01(t, tSmall, 0.3)}}>small, fixed amount</span>
          </div>
          <div style={{height: 34, borderRadius: 17, background: 'rgba(255,255,255,.07)', position: 'relative', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '58%', background: 'rgba(244,241,236,.28)'}} />
            <div style={{position: 'absolute', left: '58%', top: 0, bottom: 0, width: '5%', background: C.orange, opacity: 1 - fly, boxShadow: `0 0 ${20 * p01(t, tSmall, 0.3)}px ${C.orange}`}} />
          </div>
        </div>
      </Layer>
      {/* the slice flies down into the task */}
      {fly > 0 && fly < 1 && (
        <div style={{position: 'absolute', left: lerp(360 + 1200 * 0.58, 960 - 30, fly), top: lerp(272, 470, fly), width: 60, height: 34, borderRadius: 10, background: C.orange, boxShadow: `0 0 30px ${C.orange}`, transform: `rotate(${fly * 180}deg)`}} />
      )}
      <Layer t={t} at={enter(0.2, {from: 'd', dist: 160})} style={{left: 580, top: 380}}>
        <CodeCard t={t} at={-3.5} cut={-1.6} resume={tWeekly + 1.1} done={tFinish + 0.5} />
      </Layer>
      <div style={{position: 'absolute', left: 1400, top: 640}}>
        <Burst t={t} at={tFinish + 0.5} n={10} r0={40} r1={120} color={C.green} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4.4–4.5 plans, then "No more broken, half-finished changes."
export const LimitPlans: React.FC = () => {
  const {t, w, L} = useS();
  const tPro = w('pro');
  const tMax = w('max');
  const tEvery = w('every');
  const outA = L(5) - 0.25;
  const row = (at: number, plan: string, what: string, vis: React.ReactNode) => (
    <Layer t={t} at={enter(at - 0.1, {from: 'l', dist: 200, out: outA, to: 'u'})}>
      <Glass w={1240} h={170} style={{display: 'flex', alignItems: 'center', gap: 40}}>
        <div style={{width: 360, fontFamily: F.display, fontWeight: 800, fontSize: 48, letterSpacing: '-0.02em'}}>{plan}</div>
        <div style={{flex: 1, fontFamily: F.ui, fontSize: 32, color: C.ink2}}>{what}</div>
        {vis}
      </Glass>
    </Layer>
  );
  return (
    <AbsoluteFill>
      <Kicker t={t} at={0.1} text="WHO GETS IT" />
      <div style={{position: 'absolute', left: 340, top: 300}}>
        {row(tPro, 'Pro', 'Once a week', (
          <div style={{display: 'flex', gap: 10}}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} style={{width: 46, height: 60, borderRadius: 10, display: 'grid', placeItems: 'center', fontFamily: F.mono, fontSize: 20, background: i === 2 && t > w('once') ? C.orange : 'rgba(255,255,255,.07)', color: i === 2 && t > w('once') ? '#1a0e09' : C.ink3}}>{d}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 340, top: 510}}>
        {row(tMax, 'Max · Team Premium', 'Every time you hit the limit', (
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 92, color: C.orange, transform: `scale(${0.5 + 0.5 * bounce(t, tEvery, 10, 200)})`, opacity: p01(t, tEvery, 0.2)}}>∞</div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, transform: 'translateY(-50%)', textAlign: 'center'}}>
        <AText t={t} text="No more *half-finished* changes." at={L(5) - 0.05} size={96} by="word" />
      </div>
      <At x={960} y={720}>
        <div style={{opacity: p01(t, L(5) + 0.6, 0.3)}}>
          <Icon name="check" size={110} color={C.green} width={2.4} p={p01(t, L(5) + 0.6, 0.5)} />
        </div>
      </At>
    </AbsoluteFill>
  );
};

// ---------- 5.0–5.1 "Next, two new models. Opus five point five is now the default."
export const ModelPicker: React.FC = () => {
  const {t, w, L} = useS();
  const tOpus = w('opus');
  const tDef = w('default');
  const sel = p01(t, tDef - 0.1, 0.3);
  const items = [
    ['Opus 5.5', 'The new default'],
    ['Sonnet 5.5', 'Fast, fewer tokens'],
  ];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center'}}>
        <AText t={t} text="Two new models" at={L(0) + 1.3} size={84} by="word" />
      </div>
      <Layer t={t} at={enter(tOpus - 0.3, {from: 'd', dist: 140})} style={{left: 560, top: 360}}>
        <Glass w={800} pad={14}>
          <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.2em', color: C.ink3, padding: '10px 16px 14px'}}>SELECT MODEL</div>
          {items.map(([n, d], i) => (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '22px 22px', borderRadius: 14, background: i === 0 ? `rgba(217,119,87,${0.16 * sel})` : 'transparent', boxShadow: i === 0 ? `inset 0 0 0 1.5px rgba(217,119,87,${0.7 * sel})` : 'none', opacity: p01(t, tOpus - 0.1 + i * 0.12, 0.3)}}>
              <ClaudeMark size={46} />
              <div style={{flex: 1}}>
                <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 38}}>{n}</div>
                <div style={{fontFamily: F.ui, fontSize: 24, color: C.ink3}}>{d}</div>
              </div>
              {i === 0 && (
                <div style={{display: 'flex', alignItems: 'center', gap: 12, opacity: sel}}>
                  <span style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.16em', padding: '6px 12px', borderRadius: 8, background: C.orange, color: '#1a0e09'}}>DEFAULT</span>
                  <Icon name="check" size={40} color={C.orangeHi} width={2.6} p={sel} />
                </div>
              )}
            </div>
          ))}
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 5.2–5.3 "roughly Fable 5.1 level … 30% faster than Opus 5 … 40% less."
export const OpusStats: React.FC = () => {
  const {t, w} = useS();
  const tFable = w('fable');
  const tFaster = w('faster');
  const tCost = w('costs');
  const bars = (at: number, a: [string, number, string], b: [string, number, string], max: number) => (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 34, height: 300}}>
      {[a, b].map(([lb, v, txt], i) => (
        <div key={lb} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 130}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 34, color: i ? C.orangeHi : C.ink2, opacity: p01(t, at + 0.6, 0.3)}}>{txt}</div>
          <div style={{width: 110, height: (v / max) * 220 * p01(t, at + i * 0.15, 0.9), borderRadius: 12, background: i ? C.orange : 'rgba(244,241,236,.28)', boxShadow: i ? `0 0 30px rgba(217,119,87,.4)` : 'none'}} />
          <div style={{fontFamily: F.ui, fontWeight: 600, fontSize: 22, color: C.ink3, textAlign: 'center', height: 56}}>{lb}</div>
        </div>
      ))}
    </div>
  );
  const card = (at: number, from: 'l' | 'd' | 'r', title: string, foot: string, body: React.ReactNode, x: number) => (
    <Layer t={t} at={enter(at - 0.12, {from, dist: 160})} style={{left: x, top: 270}}>
      <Glass w={520} h={560} glow={p01(t, at, 0.3) * (1 - p01(t, at + 1, 0.6))}>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 44, letterSpacing: '-0.02em'}}>{title}</div>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 30}}>{body}</div>
        <div style={{position: 'absolute', left: 28, bottom: 24, fontFamily: F.mono, fontSize: 18, color: C.ink3}}>{foot}</div>
      </Glass>
    </Layer>
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center'}}>
        <AText t={t} text="*Opus 5.5* in three numbers" at={0.15} size={64} by="word" />
      </div>
      {card(tFable, 'l', 'Fable-level', 'Anthropic: "on most work"', bars(tFable, ['Fable 5.1', 1, '≈'], ['Opus 5.5', 1, '≈'], 1), 130)}
      {card(tFaster, 'd', '30%+ faster', 'than Opus 5 · "over 30%"', bars(tFaster, ['Opus 5', 1, '1×'], ['Opus 5.5', 1.3, '1.3×+'], 1.3), 700)}
      {card(tCost, 'r', '40% cheaper', 'than Opus 5', bars(tCost, ['Opus 5', 1, '100%'], ['Opus 5.5', 0.6, '60%'], 1), 1270)}
    </AbsoluteFill>
  );
};

// ---------- 5.4 "shorter replies and sticks closer to what you asked."
export const OpusReplies: React.FC = () => {
  const {t, w} = useS();
  const tShort = w('shorter');
  const tStick = w('sticks');
  const shrink = p01(t, tShort + 0.1, 0.8, E.inOut);
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(0.05, {from: 'l', dist: 200})} style={{left: 220, top: 260}}>
        <div style={{width: 760, borderRadius: '28px 28px 28px 8px', background: 'rgba(34,35,40,.9)', boxShadow: `0 0 0 1px ${C.line2}`, padding: 34, overflow: 'hidden', height: lerp(520, 190, shrink)}}>
          <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.2em', color: C.ink3, marginBottom: 20}}>REPLY</div>
          {Array.from({length: 9}, (_, i) => (
            <div key={i} style={{height: 16, borderRadius: 8, marginBottom: 18, width: `${[92, 85, 96, 70, 88, 94, 60, 82, 50][i]}%`, background: i < 2 ? 'rgba(244,241,236,.6)' : 'rgba(244,241,236,.22)', opacity: i < 2 ? 1 : 1 - shrink}} />
          ))}
        </div>
        <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 40, marginTop: 26, opacity: p01(t, tShort, 0.3)}}>Shorter replies</div>
      </Layer>
      <At x={1420} y={500}>
        <Layer t={t} at={enter(tStick - 0.15, {from: 'r', dist: 200})} style={{left: -170, top: -200}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{position: 'relative'}}>
              <Icon name="target" size={340} color={C.orange} width={1.2} p={p01(t, tStick, 0.7, E.inOut)} />
            </div>
            <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 40, marginTop: 20, textAlign: 'center'}}>Sticks to what
              <br />
              you asked
            </div>
          </div>
        </Layer>
      </At>
    </AbsoluteFill>
  );
};

// ---------- 5.5–5.6 Sonnet 5.5
export const SonnetCard: React.FC = () => {
  const {t, w, L} = useS();
  const tFaster = w('faster');
  const tTokens = w('tokens');
  const tBug = w('bug');
  const tRepro = w('reproduce');
  const outA = L(6) - 0.25;
  const stack = 1 - p01(t, tTokens - 0.1, 1.0, E.inOut) * 0.55;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center'}}>
        <AText t={t} text="*Sonnet 5.5*" at={0.1} size={88} by="char" />
      </div>
      <Layer t={t} at={enter(tFaster - 0.15, {from: 'l', dist: 200, out: outA, to: 'l'})} style={{left: 220, top: 330}}>
        <Glass w={700} h={420}>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 52}}>30%+ faster</div>
          <div style={{fontFamily: F.ui, fontSize: 26, color: C.ink3, marginBottom: 40}}>than Sonnet 5</div>
          <StatBar t={t} at={tFaster} label="Sonnet 5" v={1} max={1.3} color="rgba(244,241,236,.35)" w={620} />
          <div style={{height: 26}} />
          <StatBar t={t} at={tFaster + 0.2} label="Sonnet 5.5" v={1.3} max={1.3} valueText="1.3×+" w={620} />
        </Glass>
      </Layer>
      <Layer t={t} at={enter(tTokens - 0.2, {from: 'r', dist: 200, out: outA, to: 'r'})} style={{left: 1000, top: 330}}>
        <Glass w={700} h={420}>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 52}}>Far fewer tokens</div>
          <div style={{fontFamily: F.ui, fontSize: 26, color: C.ink3}}>per task</div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 200, marginTop: 30}}>
            {Array.from({length: 12}, (_, i) => (
              <div key={i} style={{flex: 1, height: `${(40 + ((i * 37) % 60)) * stack}%`, borderRadius: 8, background: i % 3 === 0 ? C.orange : 'rgba(244,241,236,.3)'}} />
            ))}
          </div>
        </Glass>
      </Layer>
      {/* best for well-defined jobs */}
      <Layer t={t} at={enter(L(6) - 0.05, {from: 'd', dist: 160})} style={{left: 460, top: 330}}>
        <Glass w={1000} h={440} style={{display: 'flex', gap: 50, alignItems: 'center'}}>
          <div style={{width: 260, height: 260, borderRadius: 60, display: 'grid', placeItems: 'center', background: 'rgba(240,106,90,.12)', boxShadow: '0 0 0 1.5px rgba(240,106,90,.5)'}}>
            <Icon name="bug" size={160} color={C.red} width={1.4} p={p01(t, tBug - 0.1, 0.7, E.inOut)} />
          </div>
          <div>
            <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.24em', color: C.orangeHi}}>BEST FOR</div>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 52, lineHeight: 1.05, margin: '8px 0 22px'}}>Well-defined jobs</div>
            {['Fixing a bug you can', 'already reproduce'].map((s, i) => (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.ui, fontSize: 30, color: C.ink2, marginBottom: 10, opacity: p01(t, tRepro - 0.4 + i * 0.15, 0.3)}}>
                {i === 0 ? <Icon name="check" size={30} color={C.green} width={2.6} p={p01(t, tRepro - 0.3, 0.3)} /> : <span style={{width: 30}} />} {s}
              </div>
            ))}
          </div>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 5.7 "To use Sonnet, type slash model sonnet."
export const SwitchModel: React.FC = () => {
  const {w} = useS();
  const at = w('type') - 0.1;
  const enter = w('sonnet', 1) + 0.35;
  return (
    <ModelTerm at={at} enterAt={enter} />
  );
};
const ModelTerm: React.FC<{at: number; enterAt: number}> = ({at, enterAt}) => {
  const {t} = useS();
  return (
    <TermShot cmd="/model sonnet" at={at} enter={enterAt} model={t > enterAt + 0.3 ? 'Sonnet 5.5' : 'Opus 5.5'} entries={[{at: enterAt + 0.3, kind: 'note', text: 'Set model to Sonnet 5.5'}]} outY={330} label="SWITCH TO SONNET">
      {(rig, tt) => {
        const p = screenToFrame(rig, 1320, 118 + 27 * 9.2);
        return <Callout t={tt} at={enterAt + 0.5} x={p.x} y={p.y} dx={-320} dy={170} label="Now on Sonnet 5.5" sub="shown in the status line" />;
      }}
    </TermShot>
  );
};

// ---------- 5.8 Rule of thumb: sort tasks into lanes.
export const RuleOfThumb: React.FC = () => {
  const {t, w} = useS();
  const tBig = w('big');
  const tSmall = w('small');
  const tSave = w('save');
  const big = ['Design a new feature', 'Refactor the whole module'];
  const small = ['Fix the failing test', 'Rename a function', 'Bug with a clear repro'];
  const lane = (x: number, title: string, sub: string, at: number, hot: boolean) => (
    <Layer t={t} at={enter(at - 0.3, {from: 'u', dist: 80})} style={{left: x, top: 230}}>
      <div style={{width: 700, height: 640, borderRadius: R.xl, border: `2px solid ${hot ? 'rgba(217,119,87,.45)' : C.line2}`, background: 'rgba(16,17,20,.55)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '24px 30px', borderBottom: `1px solid ${C.line}`}}>
          <ClaudeMark size={40} />
          <div>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 44}}>{title}</div>
            <div style={{fontFamily: F.ui, fontSize: 24, color: C.ink3}}>{sub}</div>
          </div>
        </div>
      </div>
    </Layer>
  );
  return (
    <AbsoluteFill>
      {lane(200, 'Opus', 'big, open-ended work', tBig, false)}
      {lane(1020, 'Sonnet', 'small, clear tasks', tSmall, true)}
      {big.map((s, i) => (
        <Layer key={s} t={t} at={(tt) => ({x: lerp(700, 0, p01(tt, tBig + i * 0.25, 0.7, E.out)), y: 0, r: lerp(10, 0, p01(tt, tBig + i * 0.25, 0.7)), o: p01(tt, tBig + i * 0.25, 0.2)})} style={{left: 240, top: 380 + i * 190}}>
          <div style={{width: 620, height: 160, borderRadius: 20, background: '#24252b', boxShadow: `0 0 0 1px ${C.line2}`, padding: 26, fontFamily: F.ui, fontWeight: 700, fontSize: 34, boxSizing: 'border-box'}}>{s}</div>
        </Layer>
      ))}
      {small.map((s, i) => (
        <Layer key={s} t={t} at={(tt) => ({x: lerp(-700, 0, p01(tt, tSmall + i * 0.2, 0.7, E.out)), y: 0, o: p01(tt, tSmall + i * 0.2, 0.2)})} style={{left: 1060, top: 380 + i * 110}}>
          <div style={{width: 620, height: 90, borderRadius: 16, background: 'rgba(217,119,87,.14)', boxShadow: '0 0 0 1px rgba(217,119,87,.45)', padding: '0 26px', display: 'flex', alignItems: 'center', fontFamily: F.ui, fontWeight: 600, fontSize: 30, boxSizing: 'border-box'}}>{s}</div>
        </Layer>
      ))}
      <Layer t={t} at={enter(tSave - 0.1, {from: 'd', dist: 60})} style={{left: 1110, top: 760}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.ui, fontWeight: 700, fontSize: 32, color: C.green}}>
          <Icon name="gauge" size={40} color={C.green} width={2.2} /> saves your usage
        </div>
      </Layer>
    </AbsoluteFill>
  );
};
