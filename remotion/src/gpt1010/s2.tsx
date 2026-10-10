// Part 1 · GPT-6 and Intelligent UI (explainer).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from './design';
import {AText, At, Camera, Draw, E, Layer, bounce, clamp, enter, kf, lerp, p01} from './ae';
import {useS} from './timing';
import {Burst, Glass, Icon, IconTile, OpenAIMark, Rings} from './ui';

const Chip: React.FC<{children: React.ReactNode; hot?: boolean; size?: number; style?: React.CSSProperties}> = ({children, hot, size = 28, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: `${size * 0.4}px ${size * 0.85}px`, borderRadius: 999, fontFamily: F.ui, fontWeight: 700, fontSize: size, color: hot ? '#fff' : C.ink, background: hot ? C.acc : 'rgba(255,255,255,.07)', boxShadow: hot ? '0 16px 40px -14px rgba(16,163,127,.8)' : '0 0 0 1.5px rgba(255,255,255,.12)', whiteSpace: 'nowrap', ...style}}>
    {children}
  </div>
);

const Lines: React.FC<{n: number; w: number; p?: number; gap?: number; h?: number; color?: string}> = ({n, w, p = 1, gap = 16, h = 12, color = 'rgba(255,255,255,.16)'}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap}}>
    {Array.from({length: n}, (_, i) => (
      <div key={i} style={{height: h, borderRadius: h / 2, background: color, width: w * (i === n - 1 ? 0.55 : 0.82 + 0.18 * Math.abs(Math.sin(i * 2.3))) * clamp(p * 1.5 - i / n / 2)}} />
    ))}
  </div>
);

// ---------- 2.0 "On October seventh, OpenAI brought GPT six to the Chat tab… With it comes Intelligent UI."
export const IuiIntro: React.FC = () => {
  const {t, w, dur} = useS();
  const tGpt = w('gpt');
  const tTab = w('tab');
  const tIui = w('intelligent');
  const up = p01(t, tIui - 0.2, 0.7, E.inOut);
  const z = kf(t, [[0, 1.06], [dur, 1, E.inOut]]);
  return (
    <AbsoluteFill>
      <Camera cam={{z, y: 0}}>
        <At x={960} y={lerp(240, 170, up)}>
          <Layer t={t} at={enter(w('october') - 0.1, {from: 'd', dist: 40})} style={{position: 'relative'}}>
            <Chip size={24}>
              <Icon name="calendar" size={26} color={C.accHi} /> 7 OCT 2026
            </Chip>
          </Layer>
        </At>
        <At x={960} y={lerp(440, 330, up)}>
          <div style={{transform: `scale(${lerp(1, 0.62, up)})`}}>
            <Layer t={t} at={(tt) => ({s: lerp(0.5, 1, bounce(tt, tGpt - 0.05, 11, 200)), o: clamp((tt - tGpt + 0.05) * 6)})} size={500} style={{position: 'relative'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 40, whiteSpace: 'nowrap'}}>
                <OpenAIMark size={150} />
                <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 210, letterSpacing: '-0.05em'}}>GPT-6</span>
              </div>
            </Layer>
          </div>
        </At>
        <At x={960} y={lerp(640, 470, up)}>
          <Layer t={t} at={enter(tTab - 0.35, {from: 'u', dist: 50})} style={{position: 'relative'}}>
            <div style={{display: 'flex', gap: 10, padding: 8, borderRadius: 22, background: 'rgba(255,255,255,.05)', boxShadow: '0 0 0 1.5px rgba(255,255,255,.1)', transform: `scale(${lerp(1, 0.85, up)})`}}>
              <div style={{padding: '14px 46px', borderRadius: 16, fontFamily: F.ui, fontWeight: 700, fontSize: 36, background: `rgba(16,163,127,${0.2 + 0.7 * p01(t, tTab, 0.3)})`, boxShadow: `0 0 ${40 * p01(t, tTab, 0.4)}px rgba(16,163,127,.6)`}}>Chat</div>
              <div style={{padding: '14px 46px', borderRadius: 16, display: 'grid', placeItems: 'center'}}>
                <div style={{width: 80, height: 12, borderRadius: 6, background: 'rgba(255,255,255,.12)'}} />
              </div>
            </div>
          </Layer>
        </At>
        <At x={960} y={720}>
          <div style={{position: 'relative'}}>
            <Rings t={t} at={tIui + 0.05} n={3} max={520} />
            <Burst t={t} at={tIui + 0.05} n={16} r0={200} r1={380} color={C.accHi} />
          </div>
        </At>
        <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center'}}>
          <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.3em', color: C.accHi, opacity: p01(t, w('comes') - 0.1, 0.3)}}>WITH IT COMES</div>
          <AText t={t} text="*Intelligent UI*" at={tIui - 0.05} size={160} by="char" stagger={0.03} style={{marginTop: 10}} />
        </div>
      </Camera>
    </AbsoluteFill>
  );
};

// ---------- 2.1 "Until now, almost every answer was text. Now ChatGPT can mix text, visuals and interactive parts…"
export const IuiBlocks: React.FC = () => {
  const {t, w} = useS();
  const tNow = w('now', 1);
  const morph = p01(t, tNow, 0.8, E.inOut);
  const blocks = [
    {at: w('graphics'), icon: 'star', label: 'Graphics'},
    {at: w('tappable'), icon: 'button', label: 'Tappable buttons'},
    {at: w('forms'), icon: 'form', label: 'Forms'},
    {at: w('charts'), icon: 'chart', label: 'Charts'},
  ];
  const bars = [0.5, 0.8, 0.62, 0.95, 0.72];
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(0.1, {from: 'l', dist: 160})} style={{left: 170, top: 210}}>
        <Glass w={700} h={640} pad={40}>
          <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.24em', color: morph > 0.5 ? C.accHi : C.ink3}}>{morph > 0.5 ? 'NOW · ONE ANSWER' : 'BEFORE · ANSWER'}</div>
          <div style={{marginTop: 30, position: 'relative', height: 500}}>
            <div style={{position: 'absolute', inset: 0, opacity: 1 - morph}}>
              <Lines n={14} w={620} p={p01(t, 0.2, 1.4, E.linear)} gap={20} h={13} />
            </div>
            <div style={{position: 'absolute', inset: 0, opacity: morph}}>
              <Lines n={3} w={620} gap={18} h={13} />
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 18, height: 170, marginTop: 30, padding: '0 10px', borderBottom: '2px solid rgba(255,255,255,.12)'}}>
                {bars.map((b, i) => (
                  <div key={i} style={{flex: 1, height: `${b * 100 * p01(t, tNow + 0.3 + i * 0.08, 0.6)}%`, borderRadius: '8px 8px 0 0', background: i === 3 ? C.acc : 'rgba(95,212,176,.35)'}} />
                ))}
              </div>
              <div style={{display: 'flex', gap: 14, marginTop: 30}}>
                {['Option A', 'Option B'].map((o, i) => (
                  <div key={o} style={{padding: '14px 26px', borderRadius: 14, fontFamily: F.ui, fontWeight: 650, fontSize: 24, background: i === 0 ? C.acc : 'rgba(255,255,255,.08)', transform: `scale(${bounce(t, tNow + 0.7 + i * 0.12, 12, 220)})`}}>{o}</div>
                ))}
              </div>
              <div style={{marginTop: 26, height: 56, borderRadius: 14, boxShadow: '0 0 0 1.5px rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', padding: '0 20px', fontFamily: F.ui, fontSize: 22, color: C.ink3, opacity: p01(t, tNow + 0.9, 0.4)}}>Type a value…</div>
            </div>
          </div>
        </Glass>
      </Layer>
      <div style={{position: 'absolute', left: 980, top: 200, width: 800}}>
        <AText t={t} text="Text + visuals + *interactive parts*" at={w('mix') - 0.1} size={54} by="word" />
        <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.ink3, marginTop: 16, opacity: p01(t, w('lists') - 0.1, 0.3)}}>OPENAI LISTS</div>
      </div>
      <div style={{position: 'absolute', left: 980, top: 400, display: 'grid', gridTemplateColumns: '360px 360px', rowGap: 40, columnGap: 40}}>
        {blocks.map((b) => (
          <div key={b.label} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p01(t, b.at - 0.1, 0.2)}}>
            <IconTile t={t} at={b.at - 0.1} name={b.icon} size={110} hot />
            <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 32, width: 200}}>{b.label}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2.2 "ChatGPT picks the format based on your question…"
export const IuiFormats: React.FC = () => {
  const {t, w} = useS();
  const cols = [
    {at: w('comparing'), out: w('side', 1), q: 'Comparing two phones?', label: 'Side by side'},
    {at: w('asking'), out: w('explore'), q: 'How does it work?', label: 'A diagram to explore'},
    {at: w('simple'), out: w('plain') + 0.1, q: 'Simple question?', label: 'Plain text'},
  ];
  const X = [330, 960, 1590];
  const card = (i: number, p: number) => {
    if (i === 0)
      return (
        <div style={{display: 'flex', gap: 18, justifyContent: 'center'}}>
          {['Phone A', 'Phone B'].map((n, k) => (
            <div key={n} style={{width: 150, padding: 14, borderRadius: 16, background: 'rgba(255,255,255,.06)', boxShadow: '0 0 0 1px rgba(255,255,255,.1)', transform: `translateY(${(1 - p01(p, k * 0.2, 0.6)) * 30}px)`, opacity: p01(p, k * 0.2, 0.4)}}>
              <div style={{height: 110, borderRadius: 14, border: '3px solid rgba(255,255,255,.25)', margin: '0 26px'}} />
              <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 20, textAlign: 'center', marginTop: 12}}>{n}</div>
              {[0.8, 0.6, 0.7].map((x, j) => (
                <div key={j} style={{height: 8, borderRadius: 4, marginTop: 10, width: `${x * 100}%`, background: j === k ? 'rgba(95,212,176,.6)' : 'rgba(255,255,255,.14)'}} />
              ))}
            </div>
          ))}
        </div>
      );
    if (i === 1)
      return (
        <svg width={360} height={220} viewBox="0 0 360 220" style={{display: 'block', margin: '0 auto', overflow: 'visible'}}>
          {[['M180 50 L80 160'], ['M180 50 L180 160'], ['M180 50 L280 160']].map(([d], k) => (
            <path key={k} d={d} stroke="rgba(255,255,255,.3)" strokeWidth={3} strokeDasharray="300" strokeDashoffset={300 * (1 - p01(p, 0.2 + k * 0.1, 0.5))} />
          ))}
          {[[180, 50], [80, 160], [180, 160], [280, 160]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={28 * bounce(p, 0.1 + k * 0.12, 12, 200)} fill={k === 0 ? C.acc : '#2b2e30'} stroke={k === 2 ? C.accHi : 'rgba(255,255,255,.25)'} strokeWidth={3} />
          ))}
        </svg>
      );
    return (
      <div style={{padding: '10px 20px'}}>
        <Lines n={4} w={330} p={p01(p, 0, 0.8, E.linear)} gap={18} h={12} />
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
        <AText t={t} text="ChatGPT *picks the format*" at={w('picks') - 0.2} size={74} by="word" />
      </div>
      {cols.map((c, i) => {
        const p = t - c.at;
        return (
          <At key={i} x={X[i]} y={560}>
            <Layer t={t} at={enter(c.at - 0.15, {from: 'd', dist: 100})} style={{position: 'relative'}}>
              <div style={{width: 500, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{padding: '16px 28px', borderRadius: 24, background: '#303030', fontFamily: F.ui, fontWeight: 600, fontSize: 30, whiteSpace: 'nowrap'}}>{c.q}</div>
                <svg width={40} height={70} style={{overflow: 'visible'}}>
                  <Draw t={t} d="M20 10 L20 56 M8 44 L20 58 L32 44" at={c.at + 0.25} dur={0.35} stroke={C.acc} width={4} />
                </svg>
                <Glass w={460} h={300} pad={24} glow={p01(t, c.out - 0.1, 0.4) * (1 - p01(t, c.out + 1.2, 0.5))}>
                  <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.18em', color: C.accHi, marginBottom: 18, opacity: p01(t, c.out - 0.2, 0.3)}}>{c.label.toUpperCase()}</div>
                  {card(i, Math.max(0, p - 0.4))}
                </Glass>
              </div>
            </Layer>
          </At>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 2.3 "Who gets it? The rollout started on October seventh for Plus, Pro, Business and Enterprise…"
export const IuiRollout: React.FC = () => {
  const {t, w, dur} = useS();
  const tSev = w('seventh');
  const tEig = w('eighth');
  const paid = [['Plus', w('plus')], ['Pro', w('pro')], ['Business', w('business')], ['Enterprise', w('enterprise')]] as [string, number][];
  const free = [['Free', w('free')], ['Go', w('go')]] as [string, number][];
  const fill = kf(t, [[tSev - 0.3, 0], [tSev + 0.3, 0.33, E.out], [tEig - 0.3, 0.33], [tEig + 0.4, 0.8, E.inOut]]);
  const tNote = w('rollout', 1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center'}}>
        <AText t={t} text="Who gets it?" at={w('who') - 0.15} size={80} by="word" />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <line x1={220} y1={420} x2={1700} y2={420} stroke="rgba(255,255,255,.1)" strokeWidth={4} strokeLinecap="round" />
        <line x1={220} y1={420} x2={220 + 1480 * fill} y2={420} stroke={C.acc} strokeWidth={4} strokeLinecap="round" />
        <line x1={220 + 1480 * 0.8} y1={420} x2={1700} y2={420} stroke={C.accHi} strokeWidth={4} strokeDasharray="10 14" opacity={p01(t, tEig + 0.4, 0.4)} />
      </svg>
      {[
        {x: 220 + 1480 * 0.33, at: tSev, d: 'OCT 7', items: paid, sub: 'Rollout starts'},
        {x: 220 + 1480 * 0.8, at: tEig, d: 'OCT 8', items: free, sub: 'Following, starting'},
      ].map((n, k) => (
        <React.Fragment key={k}>
          <At x={n.x} y={420}>
            <div style={{width: 46, height: 46, borderRadius: 23, background: t > n.at ? C.acc : '#1b1d1e', boxShadow: '0 0 0 5px #0b0d0d, 0 0 0 7px rgba(255,255,255,.14)', transform: `scale(${0.6 + 0.4 * bounce(t, n.at - 0.1, 11, 240)})`}} />
          </At>
          <At x={n.x} y={310}>
            <div style={{textAlign: 'center', opacity: p01(t, n.at - 0.2, 0.3), whiteSpace: 'nowrap'}}>
              <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.ink3}}>{n.sub.toUpperCase()}</div>
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 64, letterSpacing: '-0.03em', color: C.ink}}>{n.d}</div>
            </div>
          </At>
          <At x={n.x} y={560}>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', width: k === 0 ? 620 : 360}}>
              {n.items.map(([label, a]) => (
                <div key={label} style={{transform: `scale(${bounce(t, a - 0.08, 12, 240)})`}}>
                  <Chip hot={k === 0} size={30} style={k === 1 ? {boxShadow: '0 0 0 2px rgba(95,212,176,.6)'} : undefined}>
                    {label}
                  </Chip>
                </div>
              ))}
            </div>
          </At>
        </React.Fragment>
      ))}
      <Layer t={t} at={enter(tNote - 0.2, {from: 'd', dist: 60, out: dur - 0.6})} style={{left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center'}}>
        <Glass pad={0} r={999} style={{padding: '22px 38px', display: 'flex', alignItems: 'center', gap: 20}}>
          <Icon name="hourglass" size={40} color={C.amber} p={p01(t, tNote, 0.6, E.inOut)} />
          <span style={{fontFamily: F.ui, fontWeight: 650, fontSize: 34}}>A rollout: it may not be on your account <span style={{color: C.amber}}>yet</span></span>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 2.4 "Plus, Pro, Business and Enterprise use GPT six Sol. Free and Go use GPT six Luna."
export const IuiModels: React.FC = () => {
  const {t, w} = useS();
  const cards = [
    {at: w('sol'), first: w('plus'), icon: 'sun', name: 'Sol', plans: ['Plus', 'Pro', 'Business', 'Enterprise'], col: C.amber, from: 'l' as const},
    {at: w('luna'), first: w('free'), icon: 'moon', name: 'Luna', plans: ['Free', 'Go'], col: '#9DB4F0', from: 'r' as const},
  ];
  return (
    <AbsoluteFill>
      {cards.map((c, i) => (
        <Layer key={c.name} t={t} at={enter(c.first - 0.2, {from: c.from, dist: 220})} style={{left: i === 0 ? 220 : 1010, top: 230}}>
          <Glass w={690} h={560} pad={44} glow={p01(t, c.at - 0.1, 0.4)}>
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
              <Icon name={c.icon} size={96} color={c.col} p={p01(t, c.first, 0.8, E.inOut)} />
              <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.ink3, marginTop: 34}}>MODEL</div>
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 96, letterSpacing: '-0.04em', lineHeight: 1.05}}>
                GPT-6 <span style={{color: c.col, opacity: p01(t, c.at - 0.1, 0.3)}}>{c.name}</span>
              </div>
              <div style={{flex: 1}} />
              <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.ink3, marginBottom: 16}}>PLANS</div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
                {c.plans.map((p, k) => (
                  <div key={p} style={{transform: `scale(${bounce(t, c.first + k * 0.25, 12, 240)})`}}>
                    <Chip size={26}>{p}</Chip>
                  </div>
                ))}
              </div>
            </div>
          </Glass>
        </Layer>
      ))}
    </AbsoluteFill>
  );
};

// ---------- 2.5 "Why does this matter? Some answers are easier to see than to read…"
export const IuiWhy: React.FC = () => {
  const {t, w} = useS();
  const tSee = w('see');
  const tRead = w('read');
  const tFits = w('fits');
  const days = ['Day 1', 'Day 2', 'Day 3'];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center'}}>
        <AText t={t} text="Why does this *matter*?" at={w('why') - 0.15} size={74} by="word" />
      </div>
      <Layer t={t} at={enter(tSee - 0.5, {from: 'l', dist: 140})} style={{left: 200, top: 300}}>
        <div style={{opacity: 1 - 0.55 * p01(t, tRead + 0.2, 0.5)}}>
          <Glass w={680} h={520} pad={40}>
            <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.ink3, marginBottom: 26}}>READ IT</div>
            <Lines n={16} w={600} gap={14} h={11} p={p01(t, tSee - 0.4, 1, E.linear)} />
          </Glass>
        </div>
      </Layer>
      <Layer t={t} at={enter(tRead - 0.1, {from: 'r', dist: 140})} style={{left: 1040, top: 300}}>
        <Glass w={680} h={520} pad={40} glow={p01(t, tFits - 0.1, 0.5)}>
          <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.accHi, marginBottom: 40}}>SEE IT</div>
          <div style={{position: 'relative', height: 360}}>
            <svg width={600} height={360} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <Draw t={t} d="M100 90 C 220 90, 200 260, 300 260 C 400 260, 380 90, 500 90" at={tFits - 0.3} dur={0.8} stroke={C.acc} width={5} />
            </svg>
            {days.map((d, i) => {
              const x = [100, 300, 500][i];
              const y = [90, 260, 90][i];
              const b = bounce(t, w('plan') + i * 0.2, 12, 220);
              return (
                <div key={d} style={{position: 'absolute', left: x - 80, top: y - 50, width: 160, height: 100, borderRadius: 18, background: i === 1 ? C.acc : '#26292b', boxShadow: '0 0 0 1.5px rgba(255,255,255,.14)', display: 'grid', placeItems: 'center', transform: `scale(${b})`}}>
                  <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 30}}>{d}</div>
                </div>
              );
            })}
          </div>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};
