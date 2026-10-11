// Hook, plan, "meet the three", every price, the free plans (chapters 0–6).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../gpt1010/design';
import {Count, Draw, kf} from '../gpt1010/ae';
import {CalendarPage, Icon} from '../gpt1010/ui';
import {BillSplitter} from '../gpt1010/widgets';
import {B, BR, ChatApp, Chip, Lockup, Logo, MacApp, ORDER, Tile} from './brand';
import {ACC, AText, BigNum, BrandSide, E, Glass, Head, Kicker, Layer, List, Stamp, Trio, bounce, clamp, enter, lerp, p01} from './kit';
import {useT} from './u';

// ---------------------------------------------------------------- 0 hook
export const HPrice: React.FC = () => {
  const {t, ww, L} = useT();
  const v = ww('twenty', L(0) + 2);
  return (
    <AbsoluteFill>
      <Head t={t} at={0.1} text="October 2026" y={110} size={34} color={C.ink3} />
      <Trio t={t} y={250} items={[{b: 'gpt', at: ww('chatgpt', 0.2), value: '$20', sub: 'PER MONTH', hot: v}, {b: 'claude', at: ww('claude', 0.6), value: '$20', sub: 'PER MONTH', hot: v + 0.12}, {b: 'gemini', at: ww('gemini', 1.0), value: '$19.99', sub: 'PER MONTH', hot: v + 0.24}]} />
    </AbsoluteFill>
  );
};

export const HCan: React.FC = () => {
  const {t, ww, L} = useT();
  const caps = [
    {i: 'chat', l: 'Chat', at: ww('chat', L(1) + 0.6)},
    {i: 'globe', l: 'Search the web', at: ww('search', L(1) + 1.2)},
    {i: 'file', l: 'Read your files', at: ww('files', L(1) + 2.2)},
    {i: 'search', l: 'Deep research', at: ww('deep', L(1) + 3.0)},
  ];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', gap: 40}}>
        {ORDER.map((b, k) => (
          <Layer key={b} t={t} at={enter(0.05 + k * 0.08, {from: 'u', dist: 60})} style={{position: 'relative'}}>
            <Tile b={b} size={130} glow={0.4} />
          </Layer>
        ))}
      </div>
      <Head t={t} at={0.2} text="All *three* can" y={370} size={62} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, display: 'flex', justifyContent: 'center', gap: 34}}>
        {caps.map((c) => {
          const p = p01(t, c.at, 0.5);
          return (
            <div key={c.l} style={{width: 330, height: 250, borderRadius: 28, background: 'rgba(255,255,255,.05)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * 60}px) scale(${lerp(0.8, 1, bounce(t, c.at, 12, 220))})`}}>
              <Icon name={c.i} size={86} color={ACC} width={2} />
              <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 36}}>{c.l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const HWhich: React.FC = () => {
  const {t, ww, L} = useT();
  const a = ww('use', L(2) + 1.2);
  const b2 = ww('pay', L(2) + 2.6);
  return (
    <AbsoluteFill>
      <Head t={t} at={0.05} text="Which one should you" y={250} size={86} color={C.ink2} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center', gap: 80, alignItems: 'baseline'}}>
        <div style={{opacity: p01(t, a - 0.1, 0.3), transform: `scale(${lerp(0.6, 1, bounce(t, a - 0.1, 11, 200))})`, fontFamily: F.display, fontWeight: 900, fontSize: 210, letterSpacing: '-0.06em', color: C.ink}}>use</div>
        <div style={{opacity: p01(t, b2 - 0.3, 0.3), fontFamily: F.display, fontWeight: 800, fontSize: 90, color: C.ink3}}>&amp;</div>
        <div style={{opacity: p01(t, b2 - 0.1, 0.3), transform: `scale(${lerp(0.6, 1, bounce(t, b2 - 0.1, 11, 200))})`, fontFamily: F.display, fontWeight: 900, fontSize: 210, letterSpacing: '-0.06em', color: ACC}}>pay for?</div>
      </div>
    </AbsoluteFill>
  );
};

export const HPromise: React.FC = () => {
  const {t, ww, L} = useT();
  const nos = [{l: 'HYPE', at: ww('hype', L(0) + 2.5)}, {l: 'SPONSOR', at: ww('sponsor', L(0) + 3.4)}];
  const pillars = [{i: 'target', l: 'Built for', at: ww('built', L(0) + 5)}, {i: 'dollar', l: 'What it costs', at: ww('costs', L(0) + 6)}, {i: 'users', l: "Who it's for", at: ww('whos', L(0) + 7)}];
  const off = ww('official', L(0) + 8) - 0.3;
  const fit = L(1);
  const fade = p01(t, fit - 0.3, 0.4, E.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - fade, transform: `scale(${1 - fade * 0.06})`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', gap: 60}}>
          {nos.map((n) => (
            <div key={n.l} style={{position: 'relative', fontFamily: F.display, fontWeight: 900, fontSize: 110, color: C.ink3, letterSpacing: '-0.03em', opacity: p01(t, n.at - 0.2, 0.3)}}>
              NO {n.l}
              <svg width={600} height={140} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <Draw t={t} d={`M0 70 L ${n.l.length * 70 + 200} 66`} at={n.at + 0.15} dur={0.3} stroke={C.red} width={10} />
              </svg>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center', gap: 40}}>
          {pillars.map((p) => (
            <Layer key={p.l} t={t} at={enter(p.at - 0.15, {from: 'd', dist: 80})} style={{position: 'relative'}}>
              <Glass w={420} pad={34} style={{textAlign: 'center'}}>
                <Icon name={p.i} size={80} color={ACC} />
                <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 44, marginTop: 18}}>{p.l}</div>
              </Glass>
            </Layer>
          ))}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center'}}>
          <Stamp t={t} at={off} text="FROM THEIR OWN PAGES · OCT 10, 2026" col={ACC} icon="check" />
        </div>
      </div>
      {fade > 0 && (
        <div style={{position: 'absolute', inset: 0}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center', gap: 50}}>
            {ORDER.map((b, k) => (
              <Layer key={b} t={t} at={enter(fit + k * 0.1, {from: 'z'})} style={{position: 'relative'}}>
                <Tile b={b} size={190} glow={0.5} />
              </Layer>
            ))}
          </div>
          <Head t={t} at={fit + 0.3} text="Which one fits *you*?" y={560} size={110} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 1 plan
export const Plan: React.FC = () => {
  const {t, ww, L} = useT();
  const rounds = ['everyday', 'writing', 'research', 'images', 'coding', 'working', 'big', 'voice', 'privacy'];
  const labels = ['Everyday answers', 'Writing & docs', 'Research', 'Images & video', 'Coding', 'Your apps', 'Big files', 'Voice', 'Privacy'];
  const rAt = rounds.map((r, k) => ww(r, L(2) + 1.2 + k * 1.2));
  const nodes = [
    {n: '1', l: 'Meet the three', at: ww('first', L(1)), i: 'users'},
    {n: '2', l: 'Every price', sub: '$0 → $500 / mo', at: ww('price', L(1) + 4), i: 'dollar'},
    {n: '3', l: 'Nine rounds', at: ww('nine', L(2)), i: 'flag'},
    {n: '4', l: 'My pick for you', at: ww('pick', L(4) + 1), i: 'target'},
  ];
  const promptAt = ww('prompt', L(3) + 1.5);
  return (
    <AbsoluteFill>
      <Kicker t={t} at={0.05} text="THE PLAN" style={{position: 'absolute', left: 160, top: 120}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Draw t={t} d="M230 330 L 1550 330" at={nodes[0].at} dur={L(4) + 1.2 - nodes[0].at} stroke="rgba(255,255,255,.14)" width={4} ease={E.linear} />
      </svg>
      {nodes.map((nd, k) => {
        const p = p01(t, nd.at - 0.1, 0.5);
        const x = 230 + k * 440;
        return (
          <div key={k} style={{position: 'absolute', left: x - 50, top: 280, width: 360, opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * 40}px)`}}>
            <div style={{width: 100, height: 100, borderRadius: 50, background: ACC, display: 'grid', placeItems: 'center', transform: `scale(${lerp(0.5, 1, bounce(t, nd.at - 0.1, 10, 220))})`, boxShadow: `0 0 40px ${ACC}66`}}>
              <Icon name={nd.i} size={52} color="#111" width={2.4} />
            </div>
            <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 44, marginTop: 28}}>{nd.l}</div>
            {nd.sub && <div style={{fontFamily: F.mono, fontSize: 26, color: C.ink3, marginTop: 8}}>{nd.sub}</div>}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 130, right: 130, top: 600, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18}}>
        {labels.map((l, k) => {
          const p = p01(t, rAt[k] - 0.1, 0.35);
          return (
            <div key={k} style={{opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * 30}px) scale(${lerp(0.7, 1, bounce(t, rAt[k] - 0.1, 12, 240))})`, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 26px', borderRadius: 999, background: 'rgba(255,255,255,.06)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.12)'}}>
              <span style={{fontFamily: F.mono, fontWeight: 700, fontSize: 26, color: ACC}}>{k + 1}</span>
              <span style={{fontFamily: F.ui, fontWeight: 700, fontSize: 32}}>{l}</span>
            </div>
          );
        })}
      </div>
      <Layer t={t} at={enter(promptAt - 0.2, {from: 'd', dist: 60})} style={{left: 640, top: 830}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 30px', borderRadius: 18, background: `${ACC}1A`, boxShadow: `inset 0 0 0 2px ${ACC}88`, width: 640}}>
          <Icon name="copy" size={40} color={ACC} />
          <span style={{fontFamily: F.ui, fontWeight: 700, fontSize: 32}}>A prompt to try in every round</span>
        </div>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 2 meet the three
const Who: React.FC<{t: number; b: B; at: number; x?: number; y?: number}> = ({t, b, at, x = 150, y = 150}) => (
  <Layer t={t} at={enter(at, {from: 'l', dist: 120})} style={{left: x, top: y}}>
    <Lockup b={b} size={110} sub={`MADE BY ${BR[b].maker.toUpperCase()}`} />
  </Layer>
);

export const MGpt: React.FC = () => {
  const {t, ww, L} = useT();
  const intro = L(1) - 0.3;
  const io = p01(t, intro, 0.4, E.inOut);
  return (
    <AbsoluteFill>
      {io < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - io}}>
          <Head t={t} at={0.05} text="Who's *who*" y={190} size={120} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 460, display: 'flex', justifyContent: 'center', gap: 100}}>
            {ORDER.map((b, k) => (
              <Layer key={b} t={t} at={enter(0.2 + k * 0.1, {from: 'z'})} style={{position: 'relative'}}>
                <Lockup b={b} size={90} sub={BR[b].maker.toUpperCase()} />
              </Layer>
            ))}
          </div>
        </div>
      )}
      {t > intro && (
        <>
          <Who t={t} b="gpt" at={intro} />
          <div style={{position: 'absolute', left: 190, top: 420}}>
            <CalendarPage t={t} at={ww('october', L(1) + 3)} month="OCT" day="7" note="GPT-6 ARRIVES" />
          </div>
          <div style={{position: 'absolute', left: 760, top: 430, display: 'flex', flexDirection: 'column', gap: 34}}>
            {[
              {m: 'GPT-6 Sol', who: 'PAID PLANS', at: ww('sol', L(1) + 8)},
              {m: 'GPT-6 Luna', who: 'FREE & GO', at: ww('luna', L(1) + 10)},
            ].map((r) => (
              <Layer key={r.m} t={t} at={enter(r.at - 0.2, {from: 'r', dist: 100})} style={{position: 'relative'}}>
                <Glass w={900} pad={34} col={BR.gpt.col}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 76, letterSpacing: '-0.03em'}}>{r.m}</span>
                    <Chip text={r.who} col={BR.gpt.hi} size={28} />
                  </div>
                </Glass>
              </Layer>
            ))}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

export const MIui: React.FC = () => {
  const {t, ww, L} = useT();
  const tag = ww('intelligent', L(2) + 1);
  return (
    <AbsoluteFill>
      <MacApp t={t} cam={[[0, 1.0, 756, 472], [2.2, 1.18, 756, 440]]} swing={-16}>
        <ChatApp b="gpt" t={t} prompt="Split a $240 dinner bill between 5 friends." send={-1} answerAt={0.4} answerDur={1.6} side={['Dinner bill', 'Road trip ideas', 'Bike gears']} model="ChatGPT · GPT-6" answer={(p) => (
          <div style={{transform: 'scale(1.15)', transformOrigin: '0 0'}}>
            <div style={{fontSize: 20, color: BR.gpt.app.text2, marginBottom: 18, opacity: p}}>Here's a splitter you can change:</div>
            <BillSplitter t={t} p={p} people={5} />
          </div>
        )} />
      </MacApp>
      <Layer t={t} at={enter(tag - 0.2, {from: 'u', dist: 60})} style={{right: 120, top: 60}}>
        <Chip text="INTELLIGENT UI · ILLUSTRATION" col={BR.gpt.hi} size={30} />
      </Layer>
    </AbsoluteFill>
  );
};

export const MClaude: React.FC = () => {
  const {t, ww, L} = useT();
  const ms = [
    {m: 'Opus 5.5', d: 'SEP 22', at: ww('opus', L(3) + 6)},
    {m: 'Sonnet 5.5', d: 'SEP 28', at: ww('sonnet', L(3) + 8.5)},
    {m: 'Haiku 5.5', d: 'OCT 7', at: ww('haiku', L(3) + 11)},
  ];
  const fam = ww('family', L(3) + 4);
  return (
    <AbsoluteFill>
      <Who t={t} b="claude" at={0.05} />
      <Kicker t={t} at={fam - 0.3} text="A NEW FAMILY IN THREE WEEKS" col={BR.claude.hi} style={{position: 'absolute', left: 160, top: 400}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Draw t={t} d="M230 640 L 1690 640" at={fam} dur={ms[2].at - fam} stroke={`${BR.claude.col}88`} width={5} ease={E.linear} />
      </svg>
      {ms.map((m, k) => {
        const x = 300 + k * 580;
        const p = p01(t, m.at - 0.2, 0.5);
        return (
          <div key={m.m} style={{position: 'absolute', left: x - 140, top: 600, width: 420, opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * 50}px)`}}>
            <div style={{width: 80, height: 80, borderRadius: 40, background: BR.claude.col, transform: `scale(${lerp(0.4, 1, bounce(t, m.at - 0.2, 10, 220))})`, marginLeft: 100, boxShadow: `0 0 40px ${BR.claude.col}88`}} />
            <div style={{fontFamily: F.mono, fontSize: 30, letterSpacing: '0.16em', color: BR.claude.hi, marginTop: 30}}>{m.d}</div>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 72, letterSpacing: '-0.03em', marginTop: 8}}>{m.m}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const MSizes: React.FC = () => {
  const {t, ww, L} = useT();
  const rows = [
    {m: 'Opus', d: 'Most capable', w: 1, i: 'star', at: ww('opus', L(4))},
    {m: 'Sonnet', d: 'Faster · cheaper', w: 0.7, i: 'bolt', at: ww('sonnet', L(4) + 2)},
    {m: 'Haiku', d: 'Smallest · fastest', w: 0.42, i: 'gauge', at: ww('haiku', L(4) + 4)},
  ];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 160, top: 120, display: 'flex', alignItems: 'center', gap: 20}}>
        <Logo b="claude" size={60} />
        <Kicker t={t} at={0} text="THREE SIZES" col={BR.claude.hi} />
      </div>
      {rows.map((r, k) => {
        const p = p01(t, r.at - 0.15, 0.8, E.out);
        return (
          <div key={r.m} style={{position: 'absolute', left: 160, top: 280 + k * 230, width: 1600}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 30, opacity: clamp(p * 2)}}>
              <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 80, letterSpacing: '-0.03em'}}>{r.m}</span>
              <span style={{fontFamily: F.mono, fontSize: 32, color: C.ink2}}>{r.d}</span>
            </div>
            <div style={{height: 30, borderRadius: 15, marginTop: 18, width: 1500 * r.w * p, background: `linear-gradient(90deg, ${BR.claude.col}, ${BR.claude.hi})`}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const MGemini: React.FC = () => {
  const {t, ww, L} = useT();
  const pro = ww('pro', L(5) + 4);
  const mil = ww('million', L(5) + 7);
  const pages = ww('pages', L(5) + 10);
  return (
    <AbsoluteFill>
      <Who t={t} b="gemini" at={0.05} />
      <Layer t={t} at={enter(pro - 0.4, {from: 'r', dist: 80})} style={{left: 1180, top: 190}}>
        <Chip text="TOP MODEL · GEMINI 3.1 PRO" col={BR.gemini.hi} size={30} />
      </Layer>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', opacity: p01(t, mil - 0.3, 0.4)}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 230, letterSpacing: '-0.06em', color: BR.gemini.hi, lineHeight: 0.9}}>
          <Count t={t} at={mil - 0.3} dur={1.4} to={1000000} />
        </div>
        <div style={{fontFamily: F.mono, fontSize: 34, letterSpacing: '0.24em', color: C.ink2, marginTop: 24}}>TOKENS OF CONTEXT</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, opacity: p01(t, pages - 0.6, 0.4)}}>
        {Array.from({length: 7}).map((_, k) => (
          <div key={k} style={{width: 70, height: 92, borderRadius: 8, background: '#E9EEF6', boxShadow: '0 10px 20px rgba(0,0,0,.4)', transform: `translateY(${(1 - p01(t, pages - 0.6 + k * 0.06, 0.4)) * 60}px) rotate(${(k - 3) * 3}deg)`}}>
            {[0, 1, 2, 3].map((j) => <div key={j} style={{height: 6, margin: '14px 10px 0', borderRadius: 3, background: '#B7C2D3', width: j === 3 ? 30 : undefined}} />)}
          </div>
        ))}
        <span style={{fontFamily: F.ui, fontWeight: 800, fontSize: 44, marginLeft: 20}}>1,000+ pages at once</span>
      </div>
    </AbsoluteFill>
  );
};

export const MGoogle: React.FC = () => {
  const {t, ww, L} = useT();
  const apps = [{i: 'mail', l: 'Gmail', at: ww('gmail', L(6) + 2)}, {i: 'doc', l: 'Docs', at: ww('docs', L(6) + 2.6)}, {i: 'cloud', l: 'Drive', at: ww('drive', L(6) + 3.2)}];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 960 - 130, top: 340}}>
        <Layer t={t} at={enter(0, {from: 'z'})} style={{position: 'relative'}}>
          <Tile b="gemini" size={260} glow={0.8} />
        </Layer>
      </div>
      {apps.map((a, k) => {
        const ang = -Math.PI / 2 + (k - 1) * 1.15 + Math.PI;
        const r = lerp(0, 430, p01(t, a.at - 0.3, 0.7, E.out));
        const x = 960 + Math.cos(ang) * r * 1.25;
        const y = 470 + Math.sin(ang) * r * 0.75;
        return (
          <div key={a.l} style={{position: 'absolute', left: x - 120, top: y - 90, width: 240, textAlign: 'center', opacity: p01(t, a.at - 0.3, 0.3)}}>
            <div style={{width: 130, height: 130, margin: '0 auto', borderRadius: 34, background: 'rgba(255,255,255,.07)', boxShadow: `inset 0 0 0 1.5px ${BR.gemini.col}88`, display: 'grid', placeItems: 'center'}}>
              <Icon name={a.i} size={70} color={BR.gemini.hi} />
            </div>
            <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 38, marginTop: 14}}>{a.l}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const MSources: React.FC = () => {
  const {t, ww, L} = useT();
  const week = ww('week', L(7) + 3);
  const src = ww('pricing', L(7) + 6);
  const chk = ww('checked', L(7) + 8.5);
  const links = ww('links', L(7) + 10);
  const pages = [
    {b: 'gpt' as B, u: 'chatgpt.com/pricing · help.openai.com'},
    {b: 'claude' as B, u: 'claude.com/pricing · support.claude.com'},
    {b: 'gemini' as B, u: 'gemini.google/subscriptions · release notes'},
  ];
  return (
    <AbsoluteFill>
      <Head t={t} at={week - 0.6} text="These apps change *every week*" y={110} size={70} />
      <div style={{position: 'absolute', left: 360, top: 300, display: 'flex', flexDirection: 'column', gap: 26}}>
        {pages.map((p, k) => (
          <Layer key={k} t={t} at={enter(src - 0.3 + k * 0.25, {from: 'r', dist: 100})} style={{position: 'relative'}}>
            <Glass w={1200} pad={28} col={BR[p.b].col}>
              <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
                <Logo b={p.b} size={60} />
                <span style={{fontFamily: F.mono, fontSize: 36, color: C.ink}}>{p.u}</span>
              </div>
            </Glass>
          </Layer>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center'}}>
        <Stamp t={t} at={chk} text="CHECKED OCT 10, 2026" col={ACC} icon="check" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 920, textAlign: 'center', opacity: p01(t, links - 0.2, 0.4)}}>
        <Chip text="LINKS IN THE DESCRIPTION ↓" col={C.ink2} size={28} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 3 prices
type Cell = {v: string; sub?: string; at: number; none?: boolean};
const Grid: React.FC<{t: number; rows: {label: string; at: number; cells: [Cell, Cell, Cell]; hot?: number}[]; y?: number; glowRow?: number; glowAt?: number}> = ({t, rows, y = 290, glowRow, glowAt = 0}) => {
  const X0 = 420, CW = 440;
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: 1920}}>
      <div style={{position: 'absolute', left: X0, top: 0, display: 'flex'}}>
        {ORDER.map((b) => (
          <div key={b} style={{width: CW, display: 'flex', justifyContent: 'center'}}>
            <Lockup b={b} size={64} />
          </div>
        ))}
      </div>
      {rows.map((r, k) => {
        const p = p01(t, r.at - 0.2, 0.4);
        const g = glowRow === k ? p01(t, glowAt, 0.4) : 0;
        return (
          <div key={k} style={{position: 'absolute', left: 120, top: 130 + k * 165, width: 1680, height: 140, opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * 30}px)`}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 24, background: `rgba(255,255,255,${0.035 + g * 0.05})`, boxShadow: `inset 0 0 0 1.5px ${g ? ACC + 'AA' : 'rgba(255,255,255,.08)'}`}} />
            <div style={{position: 'absolute', left: 40, top: 0, height: 140, display: 'flex', alignItems: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 32, letterSpacing: '0.18em', color: C.ink2}}>{r.label}</div>
            {r.cells.map((c, j) => {
              const q = p01(t, c.at, 0.4);
              return (
                <div key={j} style={{position: 'absolute', left: X0 - 120 + j * CW, width: CW, top: 0, height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: clamp(q * 1.5), transform: `scale(${lerp(0.6, 1, bounce(t, c.at, 12, 230))})`}}>
                  <div style={{fontFamily: F.display, fontWeight: 900, fontSize: c.none ? 60 : 66, letterSpacing: '-0.03em', color: c.none ? C.ink4 : C.ink}}>{c.none ? '—' : c.v}</div>
                  {c.sub && <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink3, marginTop: 4}}>{c.sub}</div>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const freeRow = (at: number) => ({label: 'FREE', at, cells: [{v: '$0', at}, {v: '$0', at: at + 0.12}, {v: '$0', at: at + 0.24}] as [Cell, Cell, Cell]});

export const PTable: React.FC = () => {
  const {t, ww, L} = useT();
  const free = L(1);
  const go = ww('eight', L(2) + 2.5);
  const plus = ww('four', L(2) + 4.5);
  const none = ww('doesnt', L(2) + 6.5);
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(0.1, {from: 'u', dist: 40})} style={{left: 0, right: 0, top: 90, textAlign: 'center'}}>
        <div style={{display: 'flex', justifyContent: 'center', gap: 20}}>
          <Chip text="US DOLLARS" col={ACC} size={28} solid />
          <Chip text="PER MONTH" col={C.ink2} size={28} />
          <Chip text="LOCAL PRICES VARY" col={C.ink2} size={28} />
        </div>
      </Layer>
      <Grid t={t} rows={[freeRow(free), {label: 'CHEAP', at: ww('cheap', L(2) + 1), cells: [{v: '$8', sub: 'GO', at: go}, {v: '', none: true, at: none}, {v: '$4.99', sub: 'AI PLUS', at: plus}]}]} />
    </AbsoluteFill>
  );
};

const PlanCard: React.FC<{t: number; b: B; plan: string; price: string; at: number; items: {text: string; at: number; no?: boolean; icon?: string}[]; w?: number; stamp?: {text: string; at: number}}> = ({t, b, plan, price, at, items, w = 780, stamp}) => (
  <Layer t={t} at={enter(at, {from: 'd', dist: 100})} style={{position: 'relative'}}>
    <Glass w={w} pad={40} col={BR[b].col} style={{minHeight: 640}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <Logo b={b} size={70} />
          <div>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: w < 600 ? 40 : 52, letterSpacing: '-0.03em', whiteSpace: 'nowrap'}}>{plan}</div>
            <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink3, letterSpacing: '0.14em'}}>{BR[b].name.toUpperCase()}</div>
          </div>
        </div>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: w < 600 ? 54 : 72, color: BR[b].hi, letterSpacing: '-0.04em'}}>{price}</div>
      </div>
      <div style={{height: 1.5, background: 'rgba(255,255,255,.1)', margin: '30px 0'}} />
      <div style={{position: 'relative', height: 420}}>
        <List t={t} items={items} size={34} col={BR[b].hi} gap={14} w={w - 80} />
      </div>
      {stamp && <div style={{position: 'absolute', right: 40, bottom: 40}}><Stamp t={t} at={stamp.at} text={stamp.text} icon="eye" /></div>}
    </Glass>
  </Layer>
);

export const PCheap: React.FC = () => {
  const {t, ww, L} = useT();
  const g = L(3), p = L(4);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', gap: 60}}>
        <PlanCard t={t} b="gpt" plan="Go" price="$8" at={0} items={[
          {text: 'More messages than Free', at: ww('messages', g + 1.5), icon: 'chat'},
          {text: 'More uploads', at: ww('uploads', g + 2.2), icon: 'file'},
          {text: 'More images', at: ww('images', g + 2.8), icon: 'star'},
          {text: 'More voice chats', at: ww('voice', g + 3.4), icon: 'mic'},
          {text: 'Longer memory', at: ww('memory', g + 5), icon: 'layers'},
        ]} stamp={{text: 'MAY SHOW ADS', at: ww('ads', g + 7.5)}} />
        <PlanCard t={t} b="gemini" plan="Google AI Plus" price="$4.99" at={p - 0.5} items={[
          {text: '2× the Free usage', at: ww('two', p + 1.5), icon: 'gauge'},
          {text: 'Video generation', at: ww('video', p + 3), icon: 'video'},
          {text: 'Gemini inside Gmail', at: ww('gmail', p + 4.5), icon: 'mail'},
          {text: '400 GB Google storage', at: ww('hundred', p + 6), icon: 'cloud'},
        ]} />
      </div>
    </AbsoluteFill>
  );
};

export const PMain: React.FC = () => {
  const {t, ww, L} = useT();
  const m = L(5);
  const a = ww('plus', m + 3.5), b = ww('pro', m + 6), c = ww('nineteen', m + 10);
  return (
    <AbsoluteFill>
      <Grid t={t} glowRow={2} glowAt={L(6)} rows={[freeRow(-1), {label: 'CHEAP', at: -1, cells: [{v: '$8', sub: 'GO', at: -1}, {v: '', none: true, at: -1}, {v: '$4.99', sub: 'AI PLUS', at: -1}]}, {label: 'MAIN', at: ww('main', m + 1), cells: [{v: '$20', sub: 'PLUS', at: a}, {v: '$20', sub: 'PRO · $17/MO YEARLY', at: b}, {v: '$19.99', sub: 'AI PRO', at: c}]}]} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center'}}>
        <Stamp t={t} at={L(6) + 0.3} text="ABOUT THE SAME PRICE" col={ACC} icon="check" rot={0} />
      </div>
    </AbsoluteFill>
  );
};

export const PMainFeat: React.FC = () => {
  const {t, ww, L} = useT();
  const a = L(7), b = L(8), c = L(9);
  const col = (k: number, start: number, end: number) => (t >= start - 0.3 && t < end ? 1 : 0.42) * 1;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center', gap: 34}}>
        {[
          {b: 'gpt' as B, plan: 'Plus', price: '$20', at: a, end: b, items: [
            {text: 'Advanced reasoning', at: ww('reasoning', a + 1.5)}, {text: 'More deep research', at: ww('deep', a + 2.5)}, {text: 'Projects', at: ww('projects', a + 3.5)}, {text: 'Scheduled tasks', at: ww('scheduled', a + 4.5)}, {text: 'Custom GPTs', at: ww('custom', a + 5.5)}, {text: 'More Codex', at: ww('codex', a + 7)}, {text: 'No ads', at: ww('ads', a + 10), icon: 'x'},
          ]},
          {b: 'claude' as B, plan: 'Pro', price: '$20', at: b, end: c, items: [
            {text: 'Claude Code', at: ww('code', b + 1.5)}, {text: 'Research', at: ww('research', b + 2.5)}, {text: 'Opus model', at: ww('opus', b + 3.5)}, {text: 'Chrome & Microsoft 365', at: ww('chrome', b + 4.5)}, {text: 'Hand off & schedule', at: ww('hand', b + 7)},
          ]},
          {b: 'gemini' as B, plan: 'AI Pro', price: '$19.99', at: c, end: 999, items: [
            {text: '4× the Free usage', at: ww('four', c + 1.5)}, {text: '1M-token context', at: ww('million', c + 3)}, {text: 'More video', at: ww('video', c + 5)}, {text: 'Jules for coding', at: ww('jules', c + 6)}, {text: '5 TB storage', at: ww('terabytes', c + 8)}, {text: 'YouTube Premium Lite', at: ww('youtube', c + 10)},
          ]},
        ].map((k, i) => (
          <div key={i} style={{opacity: lerp(0.42, 1, p01(t, k.at - 0.3, 0.3)) * (t >= k.end - 0.2 ? lerp(1, 0.55, p01(t, k.end - 0.2, 0.3)) : 1), transform: `scale(${t >= k.at - 0.3 && t < k.end ? 1 : 0.97})`}}>
            <PlanCard t={t} b={k.b} plan={k.plan} price={k.price} at={k.at - 0.4} w={540} items={k.items} />
          </div>
        ))}
      </div>
      {void col}
    </AbsoluteFill>
  );
};

export const PPower: React.FC = () => {
  const {t, ww, L} = useT();
  const a = L(11), b = L(12), c = L(13);
  const tierBox = (v: string, sub: string, at: number, hot?: boolean) => (
    <div style={{flex: 1, padding: '22px 10px', borderRadius: 18, background: hot ? `${ACC}22` : 'rgba(255,255,255,.05)', boxShadow: `inset 0 0 0 1.5px ${hot ? ACC : 'rgba(255,255,255,.1)'}`, textAlign: 'center', opacity: p01(t, at, 0.3), transform: `scale(${lerp(0.7, 1, bounce(t, at, 12, 230))})`}}>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 52, letterSpacing: '-0.03em'}}>{v}</div>
      <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink3, marginTop: 6}}>{sub}</div>
    </div>
  );
  const card = (b: B, name: string, at: number, boxes: React.ReactNode, foot: React.ReactNode) => (
    <Layer t={t} at={enter(at - 0.4, {from: 'd', dist: 100})} style={{position: 'relative'}}>
      <Glass w={540} pad={36} col={BR[b].col} style={{minHeight: 560}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <Logo b={b} size={60} />
          <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 50, letterSpacing: '-0.03em'}}>{name}</span>
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 40}}>{boxes}</div>
        <div style={{marginTop: 40}}>{foot}</div>
      </Glass>
    </Layer>
  );
  return (
    <AbsoluteFill>
      <Head t={t} at={0.05} text="The *power* tiers" y={90} size={74} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center', gap: 34}}>
        {card('gpt', 'ChatGPT Pro', a, <>{tierBox('$100', 'PRO 100', ww('hundred', a + 3))}{tierBox('$200', 'PRO 200', ww('hundred', a + 3.6, 1))}{tierBox('$500', 'PRO 500', ww('hundred', a + 4.4, 2), true)}</>, <div style={{opacity: p01(t, ww('ultrafast', a + 6), 0.3)}}><Chip text="ULTRAFAST: $500 ONLY" col={ACC} size={24} /></div>)}
        {card('claude', 'Claude Max', b, <>{tierBox('$100', '5× PRO', ww('hundred', b + 2.5))}{tierBox('$200', '20× PRO', ww('hundred', b + 5, 1))}</>, <div style={{opacity: p01(t, ww('credits', b + 8), 0.3)}}><Chip text="+ $100 / $200 API CREDITS" col={BR.claude.hi} size={24} /></div>)}
        {card('gemini', 'Google AI Ultra', c, <>{tierBox('$99.99', '5× AI PRO', ww('ninetynine', c + 3))}{tierBox('$199.99', '20× AI PRO', ww('times', c + 6, 1))}</>, <div style={{opacity: p01(t, ww('deep', c + 8), 0.3)}}><Chip text="FIRST ACCESS: DEEP THINK" col={BR.gemini.hi} size={24} /></div>)}
      </div>
    </AbsoluteFill>
  );
};

export const PAdvice: React.FC = () => {
  const {t, ww, L} = useT();
  const fr = ww('start', L(14) + 4);
  const up = ww('upgrade', L(14) + 5.5);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', opacity: lerp(1, 0.25, p01(t, fr - 0.4, 0.4))}}>
        <div style={{display: 'inline-block', position: 'relative', fontFamily: F.display, fontWeight: 900, fontSize: 96, color: C.ink2}}>
          POWER TIER
          <svg width={700} height={130} style={{position: 'absolute', left: -20, top: 0, overflow: 'visible'}}><Draw t={t} d="M0 70 L 650 60" at={ww('dont', L(14) + 2.5)} dur={0.3} stroke={C.red} width={12} /></svg>
        </div>
        <div style={{fontFamily: F.mono, fontSize: 30, color: C.ink3, marginTop: 10, letterSpacing: '0.14em'}}>UNLESS YOU USE AI ALL DAY FOR WORK</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 50}}>
        <div style={{opacity: p01(t, fr - 0.2, 0.3), transform: `scale(${lerp(0.6, 1, bounce(t, fr - 0.2, 11, 220))})`}}><Glass pad={40} col={ACC}><div style={{fontFamily: F.display, fontWeight: 900, fontSize: 90}}>Start free</div></Glass></div>
        <svg width={260} height={80} style={{opacity: p01(t, up - 0.6, 0.3)}}><Draw t={t} d="M10 40 L 230 40 M 200 15 L 235 40 L 200 65" at={up - 0.6} dur={0.5} stroke={ACC} width={8} /></svg>
        <div style={{opacity: p01(t, up - 0.1, 0.3), transform: `scale(${lerp(0.6, 1, bounce(t, up - 0.1, 11, 220))})`}}><Glass pad={40}><div style={{fontFamily: F.display, fontWeight: 900, fontSize: 70}}>Upgrade at a limit</div></Glass></div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 4 price verdict
export const VPrice: React.FC = () => {
  const {t, ww, L} = useT();
  const b = L(1);
  const sw = p01(t, b - 0.2, 0.5, E.inOut);
  const ch = ww('four', b + 4);
  const cl = ww('claude', b + 5.5);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <Kicker t={t} at={0.05} text={sw < 0.5 ? 'AT THE TOP' : 'AT THE BOTTOM'} />
      </div>
      <Trio t={t} y={270} items={[
        {b: 'gpt', at: 0.15, value: sw < 0.5 ? '$20' : '$8', sub: sw < 0.5 ? 'PLUS' : 'GO'},
        {b: 'claude', at: 0.3, value: sw < 0.5 ? '$20' : '—', sub: sw < 0.5 ? 'PRO' : 'NO CHEAP PLAN', dim: t > cl ? 0.6 : 0},
        {b: 'gemini', at: 0.45, value: sw < 0.5 ? '$19.99' : '$4.99', sub: sw < 0.5 ? 'AI PRO' : 'CHEAPEST PAID PLAN', hot: ch},
      ]} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: (1 - sw) * p01(t, ww('tie', 1.5) , 0.3)}}>
        <Stamp t={t} at={ww('tie', 1.5)} text="A TIE AT $20" col={ACC} icon="check" rot={0} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 5 free plans
export const FIntro: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill>
      <Head t={t} at={0.05} text="What *free* gets you" y={120} size={96} />
      <Trio t={t} y={330} items={ORDER.map((b, k) => ({b, at: 0.5 + k * 0.15, value: '$0', sub: 'FREE PLAN'}))} />
    </AbsoluteFill>
  );
};

const FreeScene: React.FC<{b: B; left: Item2[]; right: Item2[]}> = ({b, left, right}) => {
  const {t} = useT();
  return (
    <AbsoluteFill>
      <BrandSide t={t} b={b} plan="FREE" price="$0" />
      <List t={t} items={left} x={720} y={300} w={580} size={42} col={BR[b].hi} gap={26} />
      <List t={t} items={right} x={1320} y={300} w={560} size={42} col={BR[b].hi} gap={26} />
    </AbsoluteFill>
  );
};
type Item2 = {text: string; at: number; no?: boolean; icon?: string};

export const FGpt: React.FC = () => {
  const {ww, L} = useT();
  const a = L(1), c = L(2);
  return <FreeScene b="gpt" left={[
    {text: 'GPT-6 Luna', at: ww('luna', a + 2), icon: 'chip'},
    {text: 'Intelligent UI', at: ww('intelligent', a + 3.5), icon: 'layers'},
    {text: 'Web search', at: ww('search', a + 8), icon: 'globe'},
    {text: 'Images', at: ww('images', a + 9.5), icon: 'star'},
    {text: 'Voice chats', at: ww('voice', a + 10.5), icon: 'mic'},
  ]} right={[
    {text: 'Lower limits', at: ww('lower', a + 12), icon: 'gauge'},
    {text: 'Ads may appear', at: ww('ads', c + 1.5), no: true},
    {text: 'Audio uploads (paid)', at: ww('audio', c + 4.5), no: true},
  ]} />;
};

export const FClaude: React.FC = () => {
  const {ww, L} = useT();
  const a = L(3), c = L(4);
  return <FreeScene b="claude" left={[
    {text: 'Sonnet & Haiku', at: ww('sonnet', a + 1.5), icon: 'chip'},
    {text: 'Opus', at: ww('opus', a + 4.5), no: true},
    {text: 'Web search', at: ww('search', a + 6), icon: 'globe'},
    {text: 'Memory', at: ww('memory', a + 7), icon: 'layers'},
    {text: 'Connected apps', at: ww('connected', a + 8.5), icon: 'plug'},
  ]} right={[
    {text: 'Artifacts', at: ww('artifacts', a + 9.5), icon: 'doc'},
    {text: 'Up to 5 projects', at: ww('five', c + 1), icon: 'list'},
    {text: 'Claude Code', at: ww('code', c + 3.5), no: true},
    {text: 'Research', at: ww('research', c + 4.5), no: true},
  ]} />;
};

export const FGemini: React.FC = () => {
  const {ww, L} = useT();
  const a = L(5);
  return <FreeScene b="gemini" left={[
    {text: 'Image creation & editing', at: ww('image', a + 3.5), icon: 'star'},
    {text: 'Gemini Live (voice)', at: ww('live', a + 5.5), icon: 'mic'},
    {text: 'Canvas', at: ww('canvas', a + 7), icon: 'edit'},
    {text: 'Gems', at: ww('gems', a + 7.8), icon: 'sparkle'},
  ]} right={[
    {text: 'Deep Research', at: ww('deep', a + 9), icon: 'search'},
    {text: '15 GB storage', at: ww('fifteen', L(6)), icon: 'cloud'},
    {text: 'Video generation', at: ww('video', L(7) + 0.8), no: true},
  ]} />;
};

// ---------------------------------------------------------------- 6 free verdict
export const VFree: React.FC = () => {
  const {t, ww, L} = useT();
  const g = ww('gpt', L(1) + 3);
  const c = ww('writing', L(1) + 5);
  const all = L(2);
  const sw = p01(t, all - 0.2, 0.4, E.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
        <Kicker t={t} at={0.05} text={sw < 0.5 ? 'BEST FREE PLAN' : 'USE ALL THREE'} />
      </div>
      <Trio t={t} y={250} items={[
        {b: 'gpt', at: sw < 0.5 ? g - 0.2 : all, value: sw < 0.5 ? undefined : '$0', sub: sw < 0.5 ? 'BETTER WITH GPT-6' : undefined},
        {b: 'gemini', at: 0.2, value: sw < 0.5 ? undefined : '$0', sub: sw < 0.5 ? 'MOST FEATURES · DEEP RESEARCH' : undefined, hot: sw < 0.5 ? 0.3 : undefined},
        {b: 'claude', at: sw < 0.5 ? c - 0.2 : all, value: sw < 0.5 ? undefined : '$0', sub: sw < 0.5 ? 'WRITING & DOCUMENTS' : undefined},
      ]} />
    </AbsoluteFill>
  );
};

export {kf};
