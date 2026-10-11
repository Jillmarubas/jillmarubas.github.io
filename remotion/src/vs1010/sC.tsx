// Rounds 6–9, prompts, mistakes, tips, scoreboard, final verdict, outro (chapters 17–32).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../gpt1010/design';
import {Draw} from '../gpt1010/ae';
import {Icon} from '../gpt1010/ui';
import {B, BR, ChatApp, Chip, Cursor, GEM_GRAD, Logo, MacApp, ORDER, Tile} from './brand';
import {ACC, AText, After, BigNum, BrandSide, E, Glass, Head, Kicker, Layer, List, RoundIntro, Stamp, Toggle, Trio, Verdict, bounce, clamp, enter, lerp, p01} from './kit';
import {Orb, Phone, Win} from './sB';
import {CUES} from './cues';
import {useT} from './u';

const lines = (n: number, p: number, col = 'rgba(255,255,255,.16)') =>
  Array.from({length: n}).map((_, k) => <div key={k} style={{height: 12, borderRadius: 6, marginBottom: 14, background: col, width: `${(k === n - 1 ? 60 : 92 - (k % 3) * 8) * clamp(p * n - k)}%`}} />);

// ---------------------------------------------------------------- round 6
export const R6Gemini: React.FC = () => {
  const {t, ww, L} = useT();
  const win = ww('windows', L(1) + 7);
  const auto = ww('auto', L(2) + 3);
  return (
    <AbsoluteFill>
      <RoundIntro t={t} until={L(1)} items={[{icon: 'chat', label: 'Chatbots', at: ww('chatbots', 4)}, {icon: 'check', label: 'Doing tasks for you', at: ww('tasks', 5.5)}]} />
      <After t={t} at={L(1)}>
      <Layer t={t} at={enter(0.1, {from: 'l', dist: 100})} style={{left: 140, top: 140}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}><Logo b="gemini" size={70} /><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 64}}>Built into Google</span></div>
      </Layer>
      <div style={{position: 'absolute', left: 140, top: 290, display: 'flex', gap: 20}}>
        {[{i: 'mail', l: 'Gmail', at: ww('gmail', L(1) + 3)}, {i: 'video', l: 'Google Vids', at: ww('vids', L(1) + 4)}].map((x) => (
          <Layer key={x.l} t={t} at={enter(x.at - 0.2, {from: 'd', dist: 50})} style={{position: 'relative'}}>
            <Chip text={x.l.toUpperCase()} col={BR.gemini.hi} size={28} />
          </Layer>
        ))}
        <div style={{opacity: p01(t, L(1) + 2, 0.3)}}><Chip text="PAID PLANS" col={C.ink3} size={24} /></div>
      </div>
      <Layer t={t} at={enter(win - 0.4, {from: 'd', dist: 80})} style={{left: 140, top: 420}}>
        <Glass w={760} pad={36} col={BR.gemini.col}>
          <div style={{fontFamily: F.mono, fontSize: 22, color: BR.gemini.hi}}>SEP 10 · NEW</div>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 54, marginTop: 8}}>Gemini app for Windows</div>
          <div style={{display: 'flex', gap: 14, marginTop: 26, alignItems: 'center'}}>
            <Icon name="keyboard" size={40} color={BR.gemini.hi} />
            <span style={{fontFamily: F.ui, fontSize: 28, color: C.ink2}}>Opens with a keyboard shortcut · connects to Gmail & Drive</span>
          </div>
        </Glass>
      </Layer>
      <Layer t={t} at={enter(auto - 0.5, {from: 'r', dist: 100})} style={{left: 1000, top: 300}}>
        <Win b="gemini" w={780} title="Chrome · auto browse">
          <div style={{height: 380, position: 'relative'}}>
            {lines(3, 1)}
            <div style={{display: 'flex', gap: 14, marginTop: 20}}>{['Search', 'Compare', 'Add to cart'].map((x, k) => <div key={x} style={{padding: '14px 20px', borderRadius: 12, background: t > auto + 0.8 + k * 0.7 ? BR.gemini.col : 'rgba(255,255,255,.08)', fontSize: 20}}>{x}</div>)}</div>
            <div style={{position: 'absolute', left: 0, bottom: 0}}><Chip text="AI PRO & ULTRA" col={BR.gemini.hi} size={22} /></div>
          </div>
        </Win>
      </Layer>
      <Cursor t={t} keys={[[auto + 0.2, 1500, 900], [auto + 0.8, 1105, 610, true], [auto + 1.5, 1270, 610, true], [auto + 2.2, 1460, 610, true]]} />
    </After>
    </AbsoluteFill>
  );
};

export const R6Claude: React.FC = () => {
  const {t, ww, L} = useT();
  const pro = ww('chrome', L(3) + 5);
  const co = L(4);
  const tasks = ['Read the brief', 'Draft the report', 'Make the slides', 'Email the team'];
  return (
    <AbsoluteFill>
      <BrandSide t={t} b="claude" x={140} y={200} />
      <div style={{position: 'absolute', left: 140, top: 760, opacity: p01(t, 1.2, 0.3)}}><Chip text="CONNECTORS · EVERY PLAN" col={BR.claude.hi} size={26} /></div>
      <div style={{position: 'absolute', left: 760, top: 170, display: 'flex', gap: 20}}>
        {[{i: 'globe', l: 'Chrome'}, {i: 'doc', l: 'Word'}, {i: 'chart', l: 'Excel'}].map((x, k) => (
          <Layer key={x.l} t={t} at={enter(pro - 0.2 + k * 0.15, {from: 'u', dist: 50})} style={{position: 'relative'}}>
            <Glass pad={24} w={300} col={BR.claude.col}><div style={{display: 'flex', alignItems: 'center', gap: 14}}><Icon name={x.i} size={40} color={BR.claude.hi} /><span style={{fontFamily: F.ui, fontWeight: 800, fontSize: 32}}>{x.l}</span></div></Glass>
          </Layer>
        ))}
        <div style={{opacity: p01(t, pro + 0.4, 0.3), alignSelf: 'center'}}><Chip text="PRO" col={BR.claude.hi} size={26} solid /></div>
      </div>
      <Layer t={t} at={enter(co - 0.2, {from: 'd', dist: 80})} style={{left: 760, top: 370}}>
        <Glass w={980} pad={36} col={BR.claude.col}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 56}}>Cowork</span>
            <Chip text="SEP 16 · PRO & MAX" col={BR.claude.hi} size={24} />
          </div>
          <div style={{marginTop: 26}}>
            {tasks.map((x, k) => {
              const d = t > co + 3 + k * 1.2;
              return (
                <div key={x} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 0', borderTop: '1px solid rgba(255,255,255,.07)', opacity: p01(t, co + 1 + k * 0.3, 0.3)}}>
                  <div style={{width: 40, height: 40, borderRadius: 12, background: d ? BR.claude.col : 'rgba(255,255,255,.08)', display: 'grid', placeItems: 'center'}}>{d && <Icon name="check" size={26} color="#fff" width={3} />}</div>
                  <span style={{fontFamily: F.ui, fontSize: 32, color: d ? C.ink : C.ink2}}>{x}</span>
                </div>
              );
            })}
          </div>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

export const R6Gpt: React.FC = () => {
  const {t, ww, L} = useT();
  const ag = ww('agent', L(5) + 7);
  return (
    <AbsoluteFill>
      <BrandSide t={t} b="gpt" x={140} y={220} />
      <Layer t={t} at={enter(0.4, {from: 'r', dist: 100})} style={{left: 760, top: 220}}>
        <Glass w={960} pad={36} col={BR.gpt.col}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}><Icon name="clock" size={50} color={BR.gpt.hi} /><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 52}}>Scheduled task</span></div>
            <Chip text="PLUS" col={BR.gpt.hi} size={24} solid />
          </div>
          <div style={{fontFamily: F.ui, fontSize: 32, color: C.ink2, marginTop: 20}}>Every morning · 8:00 · News summary</div>
        </Glass>
      </Layer>
      <Layer t={t} at={enter(ag - 0.3, {from: 'd', dist: 80})} style={{left: 760, top: 520}}>
        <Win b="gpt" w={960} title="Agent mode · browser">
          <div style={{height: 220, position: 'relative'}}>
            {lines(3, clamp((t - ag) / 2))}
            <div style={{position: 'absolute', right: 0, bottom: 0}}><Chip text="MOST ON PRO" col={BR.gpt.hi} size={22} /></div>
          </div>
        </Win>
      </Layer>
    </AbsoluteFill>
  );
};

const TryShot2: React.FC<{b: B; type: {text: string; at: number; enter?: number}; type2?: {text: string; at: number; enter?: number}; answer: (p: number) => React.ReactNode; answer2?: (p: number) => React.ReactNode; side: string[]; extra?: React.ReactNode; pre?: React.ReactNode}> = ({b, type, type2, answer, answer2, side, extra}) => {
  const {t, loc} = useT();
  const a = loc(type.at), e = loc(type.enter ?? 999);
  const second = type2 && t >= loc(type2.at) - 0.2;
  return (
    <AbsoluteFill>
      <MacApp t={t} cam={[[0, 1.0, 756, 472], [a - 0.2, 1.0, 756, 472], [a + 0.6, 1.2, 756, 450], [e + 0.3, 1.2, 756, 450], [e + 1.0, 1.12, 756, 470]]} swing={-14}>
        {!second && <ChatApp b={b} t={t} prompt={type.text} typeAt={a} send={e} answer={answer} side={side} />}
        {second && type2 && answer2 && <ChatApp b={b} t={t} prompt={type2.text} typeAt={loc(type2.at)} send={loc(type2.enter ?? 999)} answer={answer2} side={side} />}
      </MacApp>
      <Layer t={t} at={enter(a - 0.3, {from: 'u', dist: 40})} style={{right: 110, top: 50}}>
        <div style={{display: 'flex', gap: 14}}>
          <Chip text="TRY THIS" col={ACC} size={28} solid />
          <Chip text="EXAMPLE PROMPT · ILLUSTRATION" col={C.ink3} size={22} />
        </div>
      </Layer>
      {extra}
    </AbsoluteFill>
  );
};

export const R6Try: React.FC = () => {
  const {t, ww, L} = useT();
  const perm = L(7);
  return (
    <TryShot2 b="gemini" type={CUES.R6Try.type} side={['Order emails', 'Trip to Penang', 'Study plan']} answer={(p) => (
      <div style={{fontSize: 19}}>
        {['Your order has shipped', 'Question about delivery', 'Refund request received', 'Rate your purchase'].map((s, k) => (
          <div key={s} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', marginBottom: 10, borderRadius: 12, background: BR.gemini.app.card, opacity: clamp(p * 4 - k * 0.6)}}>
            <span style={{display: 'flex', alignItems: 'center', gap: 12}}><Icon name="mail" size={22} color={BR.gemini.hi} />{s}</span>
            {(k === 1 || k === 2) && <Chip text="NEEDS A REPLY" col="#F2C14E" size={16} />}
          </div>
        ))}
      </div>
    )} extra={
      <Layer t={t} at={enter(perm - 0.2, {from: 'r', dist: 100})} style={{left: 1220, top: 600}}>
        <Glass w={600} pad={30} col={ACC}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Icon name="lock" size={44} color={ACC} /><span style={{fontFamily: F.ui, fontWeight: 800, fontSize: 32}}>Check what it can see</span></div>
          <div style={{fontFamily: F.ui, fontSize: 24, color: C.ink2, marginTop: 12, opacity: p01(t, ww('disconnect', perm + 3) - 0.2, 0.3)}}>Disconnect any time in settings</div>
        </Glass>
      </Layer>
    } />
  );
};

export const V6: React.FC = () => {
  const {t, ww, L} = useT();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center'}}><Kicker t={t} at={0.1} text="ROUND 6 · IT DEPENDS WHERE YOU WORK" /></div>
      <Trio t={t} y={280} items={[
        {b: 'gemini', at: ww('google', L(0) + 3), sub: 'YOU LIVE IN GOOGLE', hot: ww('google', L(0) + 3)},
        {b: 'claude', at: ww('microsoft', L(0) + 5), sub: 'YOU USE MICROSOFT 365', hot: ww('microsoft', L(0) + 5)},
        {b: 'gpt', at: ww('schedule', L(1) + 2), sub: 'TASKS ON A SCHEDULE', hot: ww('schedule', L(1) + 2)},
      ]} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- round 7
export const R7Gemini: React.FC = () => {
  const {t, ww, L} = useT();
  const m = ww('million', L(1) + 3);
  const tb = L(2);
  return (
    <AbsoluteFill>
      <RoundIntro t={t} until={L(1)} items={[{icon: 'file', label: 'Long PDFs', at: ww('pdfs', 3)}, {icon: 'chart', label: 'Spreadsheets', at: ww('spreadsheets', 4)}, {icon: 'mic', label: 'Recordings', at: ww('recordings', 5)}]} />
      <After t={t} at={L(1)}>
      <div style={{position: 'absolute', left: 140, top: 140, display: 'flex', alignItems: 'center', gap: 20}}><Logo b="gemini" size={64} /><Kicker t={t} at={0.1} text="HOLDS THE MOST AT ONCE" col={BR.gemini.hi} /></div>
      <div style={{position: 'absolute', left: 160, top: 300, width: 900}}>
        <div style={{fontFamily: F.mono, fontSize: 26, color: C.ink2, marginBottom: 20}}>CONTEXT · AI PRO</div>
        <div style={{height: 70, borderRadius: 35, background: 'rgba(255,255,255,.08)', overflow: 'hidden'}}><div style={{height: 70, width: `${p01(t, m - 0.3, 2.5, E.inOut) * 100}%`, background: GEM_GRAD}} /></div>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 120, marginTop: 24, color: BR.gemini.hi}}>1M tokens</div>
        <div style={{display: 'flex', gap: 16, marginTop: 20, opacity: p01(t, ww('book', L(1) + 6) - 0.2, 0.3)}}><Chip text="A WHOLE BOOK" col={C.ink2} size={26} /><Chip text="A FOLDER OF REPORTS" col={C.ink2} size={26} /></div>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 330}}><BigNum t={t} at={tb + 0.5} value="5" unit="TB" label="GOOGLE AI PRO STORAGE" col={BR.gemini.hi} size={240} /></div>
    </After>
    </AbsoluteFill>
  );
};

export const R7Audio: React.FC = () => {
  const {t, ww, L} = useT();
  const a = L(3);
  const mb = ww('megabytes', a + 6);
  const outs = [{l: 'Transcript', at: ww('transcript', a + 7.5)}, {l: 'Summary', at: ww('summary', a + 8.5)}, {l: 'Answers', at: ww('answers', a + 9.5)}];
  const chk = L(4);
  return (
    <AbsoluteFill>
      <BrandSide t={t} b="gpt" plan="PAID PLANS" x={140} y={220} />
      <Layer t={t} at={enter(0.4, {from: 'r', dist: 100})} style={{left: 760, top: 200}}>
        <Glass w={980} pad={34} col={BR.gpt.col}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}><Icon name="mic" size={50} color={BR.gpt.hi} /><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 50}}>meeting.m4a</span></div>
            <Chip text="OCT 6 · AUDIO UPLOADS" col={BR.gpt.hi} size={22} />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 4, marginTop: 24, height: 60}}>{Array.from({length: 60}).map((_, k) => <div key={k} style={{flex: 1, height: `${20 + 70 * Math.abs(Math.sin(k * 1.7))}%`, borderRadius: 3, background: k / 60 < p01(t, 0.6, 2.5) ? BR.gpt.hi : 'rgba(255,255,255,.15)'}} />)}</div>
          <div style={{marginTop: 20, opacity: p01(t, mb - 0.2, 0.3)}}><Chip text="UP TO 512 MB" col={ACC} size={26} solid /></div>
        </Glass>
      </Layer>
      <div style={{position: 'absolute', left: 760, top: 560, display: 'flex', gap: 24}}>
        {outs.map((o) => (
          <Layer key={o.l} t={t} at={enter(o.at - 0.2, {from: 'd', dist: 60})} style={{position: 'relative'}}>
            <Glass w={310} pad={26}><div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 34}}>{o.l}</div><div style={{marginTop: 16}}>{lines(3, p01(t, o.at, 0.8))}</div></Glass>
          </Layer>
        ))}
      </div>
      <div style={{position: 'absolute', left: 760, top: 870}}><Stamp t={t} at={chk + 0.3} text="CHECK NAMES AND NUMBERS" col={ACC} icon="eye" rot={0} size={28} /></div>
    </AbsoluteFill>
  );
};

export const R7Claude: React.FC = () => {
  const {t, L} = useT();
  const s = L(5);
  const bars = [0.4, 0.7, 0.55, 0.9, 0.65, 0.8];
  return (
    <AbsoluteFill>
      <BrandSide t={t} b="claude" plan="EVERY PLAN" x={140} y={220} />
      <Layer t={t} at={enter(0.3, {from: 'r', dist: 100})} style={{left: 760, top: 200}}>
        <Win b="claude" w={1000} title="sales.xlsx → chart">
          <div style={{display: 'flex', gap: 30}}>
            <div style={{width: 360}}>{Array.from({length: 6}).map((_, k) => <div key={k} style={{display: 'flex', gap: 6, marginBottom: 8}}>{[0, 1, 2].map((j) => <div key={j} style={{flex: 1, height: 26, borderRadius: 4, background: j === 0 ? 'rgba(255,240,220,.14)' : 'rgba(255,240,220,.07)'}} />)}</div>)}</div>
            <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', gap: 14, height: 240}}>{bars.map((v, k) => <div key={k} style={{flex: 1, height: `${v * 100 * p01(t, s + 2 + k * 0.15, 0.6)}%`, borderRadius: 8, background: BR.claude.col}} />)}</div>
          </div>
          <div style={{display: 'flex', gap: 12, marginTop: 20}}><Chip text="READS FILES" col={BR.claude.hi} size={20} /><Chip text="RUNS CODE" col={BR.claude.hi} size={20} /><Chip text="EVEN ON FREE" col={C.ink3} size={20} /></div>
        </Win>
      </Layer>
      <Layer t={t} at={enter(L(6), {from: 'd', dist: 60})} style={{left: 760, top: 720}}>
        <Glass w={1000} pad={30} col={BR.claude.col}><div style={{fontFamily: 'Georgia, serif', fontSize: 34, color: C.ink, lineHeight: 1.4}}>Careful writing for long reports you need to really understand</div></Glass>
      </Layer>
    </AbsoluteFill>
  );
};

export const R7Try: React.FC = () => {
  const {t} = useT();
  return (
    <TryShot2 b="claude" type={CUES.R7Try.type} type2={CUES.R7Try.type2} side={['annual-report.pdf', 'Q4 plan', 'Tip calculator']} answer={(p) => (
      <div style={{fontSize: 19, lineHeight: 1.5}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, opacity: p}}><Icon name="file" size={22} color={BR.claude.hi} /> annual-report.pdf · 84 pages</div>
        {['Deadline: filing due 30 Nov', 'Cost: new system budget', 'Risk: supplier delays'].map((x, k) => <div key={x} style={{padding: '10px 14px', marginBottom: 8, borderRadius: 10, background: ['rgba(242,193,78,.16)', 'rgba(95,212,176,.14)', 'rgba(240,106,90,.16)'][k], opacity: clamp(p * 3 - k * 0.5)}}>{x}</div>)}
        <div style={{marginTop: 8}}>{lines(3, p)}</div>
      </div>
    )} answer2={(p) => (
      <div style={{fontSize: 20, lineHeight: 1.5, opacity: p}}>
        <div>Section 4.2, page 37: “Filings are due by 30 November…”</div>
        <div style={{marginTop: 12}}><Chip text="PAGE 37" col={BR.claude.hi} size={18} /></div>
      </div>
    )} extra={void t} />
  );
};

export const V7: React.FC = () => {
  const {t, dur, ww, L} = useT();
  return <Verdict t={t} dur={dur} n="7" win={['gemini']} label="Holds the most at once" also={[{b: 'gpt', at: ww('recordings', L(0) + 3.5), label: 'Easiest for recordings'}]} />;
};

// ---------------------------------------------------------------- round 8
export const R8Gpt: React.FC = () => {
  const {t, ww, L} = useT();
  const paid = ww('paid', L(1) + 3);
  const free = ww('mini', L(1) + 7);
  const vid = L(2);
  return (
    <AbsoluteFill>
      <RoundIntro t={t} until={L(1)} items={[{icon: 'mic', label: 'Talk, don\'t type', at: ww('talking', 2.6)}, {icon: 'phone', label: 'On your phone', at: ww('phone', 4.2)}]} />
      <After t={t} at={L(1)}>
      <Layer t={t} at={enter(0.1, {from: 'd', dist: 120})} style={{left: 220, top: 110}}>
        <Phone>
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}><Orb t={t} col="#4AA3FF" col2="#E8F4FF" /></div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 100, textAlign: 'center', fontFamily: F.ui, fontWeight: 700, fontSize: 32, color: '#ECECEC'}}>ChatGPT Voice</div>
        </Phone>
      </Layer>
      <div style={{position: 'absolute', left: 820, top: 220, display: 'flex', flexDirection: 'column', gap: 26}}>
        {[{m: 'GPT-Live-1', s: 'PAID PLANS', at: paid}, {m: 'GPT-Live-1 mini', s: 'FREE · LIMITED', at: free}].map((x) => (
          <Layer key={x.m} t={t} at={enter(x.at - 0.3, {from: 'r', dist: 80})} style={{position: 'relative'}}>
            <Glass w={880} pad={30} col={BR.gpt.col}><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 60}}>{x.m}</span><Chip text={x.s} col={BR.gpt.hi} size={24} /></div></Glass>
          </Layer>
        ))}
        <Layer t={t} at={enter(vid, {from: 'd', dist: 60})} style={{position: 'relative'}}>
          <Glass w={880} pad={30}><div style={{display: 'flex', alignItems: 'center', gap: 18}}><Icon name="video" size={44} color={BR.gpt.hi} /><span style={{fontFamily: F.ui, fontWeight: 800, fontSize: 34}}>Video & screen share · Advanced voice</span></div><div style={{marginTop: 12}}><Chip text="PHONE APPS · ELIGIBLE SUBSCRIBERS" col={C.ink3} size={20} /></div></Glass>
        </Layer>
      </div>
    </After>
    </AbsoluteFill>
  );
};

export const R8Gemini: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(0.1, {from: 'd', dist: 120})} style={{left: 760, top: 90}}>
        <Phone w={400}>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #2a3a2f 0%, #1a1f24 100%)'}}>
            <div style={{position: 'absolute', left: 60, top: 260, width: 280, height: 220, borderRadius: 30, background: 'rgba(255,255,255,.08)', boxShadow: `inset 0 0 0 3px ${BR.gemini.hi}`}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 160, display: 'flex', justifyContent: 'center'}}><Orb t={t} col="#4E8DF5" col2="#C9B6FF" size={120} /></div>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', gap: 16}}>{['video', 'desktop'].map((i) => <div key={i} style={{width: 70, height: 70, borderRadius: 35, background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center'}}><Icon name={i} size={34} color="#fff" /></div>)}</div>
          </div>
        </Phone>
      </Layer>
      <div style={{position: 'absolute', left: 1280, top: 300, display: 'flex', flexDirection: 'column', gap: 20, opacity: p01(t, 0.6, 0.4)}}>
        <Chip text="GEMINI LIVE · FREE" col={BR.gemini.hi} size={30} solid />
        <Chip text="CAMERA" col={BR.gemini.hi} size={28} />
        <Chip text="SCREEN SHARE" col={BR.gemini.hi} size={28} />
        <Chip text="ANDROID & IPHONE" col={C.ink3} size={24} />
      </div>
    </AbsoluteFill>
  );
};

export const R8Claude: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill>
      <BrandSide t={t} b="claude" x={140} y={220} />
      <div style={{position: 'absolute', left: 820, top: 300, display: 'flex', alignItems: 'center', gap: 6, height: 200}}>
        {Array.from({length: 40}).map((_, k) => <div key={k} style={{width: 14, borderRadius: 7, height: 20 + 150 * Math.abs(Math.sin(t * 5 + k * 0.6)) * p01(t, 0.4, 0.5), background: BR.claude.col}} />)}
      </div>
      <div style={{position: 'absolute', left: 820, top: 580, display: 'flex', flexWrap: 'wrap', gap: 18, width: 960, opacity: p01(t, 0.8, 0.4)}}>
        <Chip text="VOICE MODE · EVERY PLAN" col={BR.claude.hi} size={28} solid />
        <Chip text="PHONE · DESKTOP · WEB" col={BR.claude.hi} size={26} />
        <Chip text="BETA" col={C.ink2} size={26} />
        <Chip text="FREE USES HAIKU" col={C.ink3} size={26} />
      </div>
    </AbsoluteFill>
  );
};

export const R8Try: React.FC = () => {
  const {t, L} = useT();
  const s = L(5);
  const steps = ['1. Rinse the rice and start it cooking.', '2. Season the chicken with salt and pepper.', '3. Pan-fry the chicken, about 6 minutes a side.', '4. Wilt the spinach in the same pan.'];
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(0.1, {from: 'u', dist: 40})} style={{right: 110, top: 50}}><div style={{display: 'flex', gap: 14}}><Chip text="TRY THIS" col={ACC} size={28} solid /><Chip text="SAY IT IN VOICE MODE · ILLUSTRATION" col={C.ink3} size={22} /></div></Layer>
      <Layer t={t} at={enter(0.2, {from: 'd', dist: 120})} style={{left: 300, top: 150}}>
        <Phone w={400}>
          <div style={{position: 'absolute', inset: 0, padding: '90px 26px', boxSizing: 'border-box', fontFamily: F.ui}}>
            <div style={{padding: 16, borderRadius: 18, background: '#2C2D2F', fontSize: 18, color: '#E3E3E3', opacity: p01(t, s + 1.5, 0.4)}}>“I'm cooking dinner for four with chicken, rice and spinach. Walk me through it one step at a time.”</div>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 50}}><Orb t={t} col={ACC} col2="#FFF6D8" size={150} /></div>
          </div>
        </Phone>
      </Layer>
      <div style={{position: 'absolute', left: 860, top: 230, width: 900}}>
        {steps.map((x, k) => {
          const at = s + 5 + k * 1.3;
          const p = p01(t, at, 0.4);
          return <div key={x} style={{fontFamily: F.ui, fontWeight: 700, fontSize: 38, padding: '22px 30px', marginBottom: 18, borderRadius: 20, background: k === Math.min(3, Math.floor((t - s - 5) / 1.3)) ? `${ACC}22` : 'rgba(255,255,255,.05)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.08)', opacity: p, transform: `translateX(${(1 - p) * 60}px)`}}>{x}</div>;
        })}
        <div style={{marginTop: 20, opacity: p01(t, L(6), 0.4)}}><Chip text="HANDS BUSY? USE VOICE" col={ACC} size={28} /></div>
      </div>
    </AbsoluteFill>
  );
};

export const V8: React.FC = () => {
  const {t, dur} = useT();
  return <Verdict t={t} dur={dur} n="8" win={['gemini']} label="Live with your camera, for *free*" />;
};

// ---------------------------------------------------------------- round 9
export const R9Intro: React.FC = () => {
  const {t, ww, L} = useT();
  const sw = ww('switches', L(1) + 5);
  return (
    <AbsoluteFill>
      <Head t={t} at={0.2} text="The round *nobody* talks about" y={120} size={74} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', gap: 50}}>
        {ORDER.map((b, k) => (
          <Layer key={b} t={t} at={enter(L(1) + k * 0.2, {from: 'd', dist: 80})} style={{position: 'relative'}}>
            <Glass w={460} pad={30} col={BR[b].col}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Logo b={b} size={50} /><span style={{fontFamily: F.ui, fontWeight: 800, fontSize: 34}}>Memory</span></div>
              <div style={{marginTop: 20}}>{['Likes short answers', 'Works in marketing', 'Lives in Penang'].map((x, j) => <div key={x} style={{fontFamily: F.ui, fontSize: 26, color: C.ink2, padding: '8px 0', borderTop: '1px solid rgba(255,255,255,.07)', opacity: p01(t, L(1) + 0.6 + j * 0.3 + k * 0.1, 0.3)}}>{x}</div>)}</div>
            </Glass>
          </Layer>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', justifyContent: 'center', opacity: p01(t, sw - 0.2, 0.3)}}><Toggle t={t} label="Know where the switches are" on0={false} flip={sw + 0.3} w={900} /></div>
    </AbsoluteFill>
  );
};

export const R9Gpt: React.FC = () => {
  const {t, loc, L} = useT();
  const flip = loc(CUES.R9Gpt.flip);
  const tmp = L(3);
  return (
    <AbsoluteFill>
      <BrandSide t={t} b="gpt" x={140} y={220} />
      <Layer t={t} at={enter(0.3, {from: 'r', dist: 100})} style={{left: 760, top: 200}}>
        <Glass w={1040} pad={36}>
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink3, letterSpacing: '0.16em', marginBottom: 18}}>SETTINGS › DATA CONTROLS</div>
          <Toggle t={t} label="Improve the model for everyone" sub="Whether your chats can help train OpenAI's models" on0 flip={flip} w={968} />
          <div style={{fontFamily: F.ui, fontSize: 24, color: C.ink2, marginTop: 16, opacity: p01(t, flip + 0.5, 0.3)}}>Off · your chat history stays</div>
        </Glass>
      </Layer>
      <Layer t={t} at={enter(tmp - 0.2, {from: 'd', dist: 80})} style={{left: 760, top: 560}}>
        <Glass w={1040} pad={32} col={BR.gpt.col}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Icon name="clock" size={44} color={BR.gpt.hi} /><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 48}}>Temporary chat</span></div>
          <div style={{display: 'flex', gap: 14, marginTop: 18}}>{['NO HISTORY', 'NO MEMORIES', 'NO TRAINING'].map((x, k) => <div key={x} style={{opacity: p01(t, tmp + 1.5 + k * 0.9, 0.3)}}><Chip text={x} col={BR.gpt.hi} size={22} /></div>)}</div>
        </Glass>
      </Layer>
      <Cursor t={t} keys={[[flip - 1.2, 1700, 980], [flip, 1688, 382, true]]} />
    </AbsoluteFill>
  );
};

export const R9Claude: React.FC = () => {
  const {t, ww, loc, L} = useT();
  const yrs = ww('five', L(4) + 10);
  const inc = loc(CUES.R9Claude.inc);
  return (
    <AbsoluteFill>
      <BrandSide t={t} b="claude" x={140} y={220} />
      <Layer t={t} at={enter(0.3, {from: 'r', dist: 100})} style={{left: 760, top: 200}}>
        <Glass w={1040} pad={36}>
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink3, letterSpacing: '0.16em', marginBottom: 18}}>PRIVACY › MODEL IMPROVEMENT</div>
          <Toggle t={t} label="Help improve Claude" sub="Off unless you choose to allow it" on0={false} />
          <div style={{display: 'flex', gap: 14, marginTop: 18, opacity: p01(t, yrs - 0.3, 0.3)}}><Chip text="IF YOU OPT IN: DE-IDENTIFIED, UP TO 5 YEARS" col={BR.claude.hi} size={22} /></div>
          <div style={{display: 'flex', gap: 14, marginTop: 12, opacity: p01(t, ww('flagged', L(4) + 6) - 0.2, 0.3)}}><Chip text="SAFETY-FLAGGED CHATS MAY BE REVIEWED" col={C.ink3} size={20} /></div>
        </Glass>
      </Layer>
      <Layer t={t} at={enter(inc - 0.4, {from: 'd', dist: 80})} style={{left: 760, top: 610}}>
        <Glass w={1040} pad={32} col={BR.claude.col}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Icon name="eye" size={44} color={BR.claude.hi} /><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 48}}>Incognito chat</span></div>
          <div style={{display: 'flex', gap: 14, marginTop: 18}}>{['NOT IN HISTORY', 'NOT IN MEMORY', 'NO TRAINING'].map((x, k) => <div key={x} style={{opacity: p01(t, inc + 1 + k * 0.9, 0.3)}}><Chip text={x} col={BR.claude.hi} size={22} /></div>)}</div>
        </Glass>
      </Layer>
      <Cursor t={t} keys={[[inc - 1.2, 1700, 1000], [inc, 860, 680, true]]} />
    </AbsoluteFill>
  );
};

export const R9Gemini: React.FC = () => {
  const {t, ww, loc, L} = useT();
  const rev = ww('reviewed', L(6) + 5);
  const yrs = ww('three', L(6) + 9);
  const flip = loc(CUES.R9Gemini.flip);
  const h = ww('seventytwo', L(7) + 6);
  return (
    <AbsoluteFill>
      <BrandSide t={t} b="gemini" x={140} y={220} />
      <Layer t={t} at={enter(0.3, {from: 'r', dist: 100})} style={{left: 760, top: 180}}>
        <Glass w={1040} pad={36}>
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink3, letterSpacing: '0.16em', marginBottom: 18}}>GEMINI APPS ACTIVITY</div>
          <Toggle t={t} label="Keep Activity" sub="On: a sample of chats is reviewed by people" on0 flip={flip} w={968} />
          <div style={{display: 'flex', gap: 14, marginTop: 18}}>
            <div style={{opacity: p01(t, rev - 0.2, 0.3)}}><Chip text="HUMAN REVIEWERS" col={C.red} size={22} /></div>
            <div style={{opacity: p01(t, yrs - 0.2, 0.3)}}><Chip text="REVIEWED CHATS: UP TO 3 YEARS, EVEN IF DELETED" col={C.red} size={22} /></div>
          </div>
        </Glass>
      </Layer>
      <div style={{position: 'absolute', left: 900, top: 610}}><BigNum t={t} at={h - 0.3} value="72" unit="hours" label="TEMPORARY / ACTIVITY-OFF CHATS KEPT" col={BR.gemini.hi} size={180} /></div>
      <Cursor t={t} keys={[[flip - 1.2, 1700, 1000], [flip, 1688, 362, true]]} />
    </AbsoluteFill>
  );
};

export const R9Advice: React.FC = () => {
  const {t, L} = useT();
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(0.1, {from: 'z'})} style={{left: 460, top: 180}}>
        <Glass w={1000} pad={50} col={C.red} style={{textAlign: 'center'}}>
          <Icon name="lock" size={110} color={C.red} />
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 72, marginTop: 20}}>Don't type anything confidential</div>
          <div style={{fontFamily: F.mono, fontSize: 24, color: C.ink3, marginTop: 14}}>GOOGLE'S OWN ADVICE · GOOD FOR ALL THREE</div>
        </Glass>
      </Layer>
      <Layer t={t} at={enter(L(9), {from: 'd', dist: 60})} style={{left: 560, top: 760}}>
        <Glass w={800} pad={28}><div style={{display: 'flex', alignItems: 'center', gap: 18}}><Icon name="users" size={44} color={ACC} /><span style={{fontFamily: F.ui, fontWeight: 800, fontSize: 32}}>At work? Business plans have different rules</span></div></Glass>
      </Layer>
    </AbsoluteFill>
  );
};

export const V9: React.FC = () => {
  const {t, dur, L} = useT();
  return (
    <AbsoluteFill>
      <Verdict t={t} dur={dur} n="9" win={['claude']} label="Trains on your chats only if you *allow* it" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 920, textAlign: 'center'}}><Stamp t={t} at={L(1)} text="CHECK YOUR SETTINGS TODAY" col={ACC} icon="gear" rot={0} size={30} /></div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- prompts, mistakes, tips
const Cards: React.FC<{t: number; items: {n: string; text: string; sub?: string; at: number}[]; col?: string; icon?: string; w?: number}> = ({t, items, col = ACC, icon, w = 1500}) => {
  const cur = items.reduce((a, it, k) => (t >= it.at - 0.3 ? k : a), -1);
  return (
    <div style={{position: 'absolute', left: (1920 - w) / 2, top: 220, width: w}}>
      {items.map((it, k) => {
        const p = p01(t, it.at - 0.3, 0.5);
        const on = k === cur;
        return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 30, padding: on ? '30px 36px' : '18px 36px', marginBottom: 16, borderRadius: 24, background: on ? `${col}1F` : 'rgba(255,255,255,.04)', boxShadow: `inset 0 0 0 ${on ? 2 : 1.5}px ${on ? col : 'rgba(255,255,255,.08)'}`, opacity: clamp(p * 1.5) * (on ? 1 : 0.62), transform: `translateX(${(1 - p) * 80}px)`}}>
            <div style={{width: on ? 90 : 64, height: on ? 90 : 64, flex: 'none', borderRadius: 20, background: on ? col : 'rgba(255,255,255,.08)', display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 900, fontSize: on ? 48 : 32, color: on ? '#111' : C.ink2}}>{icon ? <Icon name={icon} size={on ? 50 : 34} color={on ? '#111' : C.ink2} width={2.4} /> : it.n}</div>
            <div>
              <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: on ? 44 : 32, color: C.ink, lineHeight: 1.2}}>{it.text}</div>
              {it.sub && on && <div style={{fontFamily: F.mono, fontSize: 24, color: C.ink3, marginTop: 8}}>{it.sub}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Prompts: React.FC = () => {
  const {t, L} = useT();
  return (
    <AbsoluteFill>
      <Kicker t={t} at={0.1} text="5 PROMPTS · WORK IN ALL THREE · ALSO IN THE DESCRIPTION" style={{position: 'absolute', left: 210, top: 120}} />
      <Cards t={t} items={[
        {n: '1', text: '“Explain this like I\'m new to it, then give me one everyday example.”', sub: 'THE FASTEST WAY TO LEARN ANYTHING', at: L(1)},
        {n: '2', text: '“Ask me five questions first, then write it.”', sub: 'COVER LETTERS, SPEECHES, ANYTHING PERSONAL', at: L(2)},
        {n: '3', text: '“Give me three versions: short, medium and detailed.”', sub: 'PICK INSTEAD OF REWRITING', at: L(3)},
        {n: '4', text: '“What\'s wrong with this, and how would you fix it?”', sub: 'HONEST FEEDBACK ON YOUR WORK', at: L(4)},
        {n: '5', text: '“Check your answer. What might be wrong or missing?”', sub: 'CATCHES A LOT OF MISTAKES', at: L(5)},
      ]} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', opacity: p01(t, L(6), 0.4)}}><Chip text="SAME PROMPT · TWO APPS · COMPARE" col={ACC} size={28} /></div>
    </AbsoluteFill>
  );
};

export const Mistakes: React.FC = () => {
  const {t, L} = useT();
  return (
    <AbsoluteFill>
      <Kicker t={t} at={0.1} text="3 MISTAKES TO AVOID" col={C.red} style={{position: 'absolute', left: 210, top: 140}} />
      <Cards t={t} col={C.red} icon="x" items={[
        {n: '1', text: 'Paying before you need to', sub: 'UPGRADE WHEN YOU KEEP HITTING A LIMIT', at: L(1)},
        {n: '2', text: 'Trusting numbers, names and dates', sub: 'IF IT MATTERS, CHECK THE SOURCE', at: L(2)},
        {n: '3', text: 'One-line prompts', sub: 'WHO YOU ARE · WHAT YOU NEED · WHO IT\'S FOR · FORMAT', at: L(3)},
      ]} />
    </AbsoluteFill>
  );
};

const Tips: React.FC<{b: B; items: {text: string; sub?: string; i: number}[]}> = ({b, items}) => {
  const {t, L} = useT();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 210, top: 110, display: 'flex', alignItems: 'center', gap: 22}}>
        <Logo b={b} size={64} />
        <Kicker t={t} at={0.1} text={`PRO TIPS · ${BR[b].name.toUpperCase()}`} col={BR[b].hi} />
      </div>
      <Cards t={t} col={BR[b].hi} items={items.map((x, k) => ({n: String(k + 1), text: x.text, sub: x.sub, at: L(x.i)}))} />
    </AbsoluteFill>
  );
};

export const TipsGpt: React.FC = () => <Tips b="gpt" items={[
  {text: 'Use projects', sub: 'FILES + INSTRUCTIONS FOR ONE PIECE OF WORK', i: 1},
  {text: 'Too many visuals? Pick a simpler layout', sub: 'IN PERSONALIZATION', i: 2},
  {text: 'Temporary chat for private questions', sub: 'NOT REMEMBERED', i: 3},
  {text: 'Set up a scheduled task', sub: 'PLUS · e.g. WEEKDAYS AT 8: AI NEWS IN 2 MINUTES', i: 4},
  {text: 'Check what it remembers', sub: 'REVIEW · CORRECT · DELETE', i: 5},
]} />;

export const TipsClaude: React.FC = () => <Tips b="claude" items={[
  {text: 'Ask for the real file', sub: 'DOCUMENT · SLIDE DECK · DESIGN', i: 1},
  {text: 'Use projects for ongoing work', sub: 'UP TO 5 ON FREE', i: 2},
  {text: 'Memory off for one chat, or Incognito', sub: 'PLUS MENU · BEFORE YOUR FIRST MESSAGE', i: 3},
  {text: 'Connect the apps you already use', sub: 'EVEN ON FREE · ONLY WHAT YOU ALLOW', i: 4},
  {text: 'Think out loud in voice mode', sub: 'ON YOUR PHONE', i: 5},
]} />;

export const TipsGemini: React.FC = () => <Tips b="gemini" items={[
  {text: 'Turn repeat tasks into skills', sub: 'RUNS WHEN YOUR PROMPT MATCHES', i: 1},
  {text: 'Deep Research for big decisions', sub: 'EVEN ON FREE · ASK FOR SOURCES', i: 2},
  {text: 'Canvas for drafts you keep editing', sub: 'OPEN NEXT TO THE CHAT', i: 3},
  {text: 'Try the Gemini app for Windows', sub: 'ONE KEYBOARD SHORTCUT', i: 4},
  {text: 'Keep confidential things out', sub: 'OR USE A TEMPORARY CHAT', i: 5},
]} />;

// ---------------------------------------------------------------- scoreboard, persona, verdict, outro
export const Score: React.FC = () => {
  const {t, ww, L} = useT();
  const s = L(1);
  const chips: {b: B; l: string; at: number}[] = [
    {b: 'gpt', l: 'Everyday answers', at: ww('everyday', s + 1)},
    {b: 'claude', l: 'Writing & docs', at: ww('writing', s + 3)},
    {b: 'claude', l: 'Coding', at: ww('coding', s + 4.5)},
    {b: 'claude', l: 'Privacy', at: ww('privacy', s + 5.5)},
    {b: 'gemini', l: 'Research', at: ww('research', s + 7)},
    {b: 'gemini', l: 'Images & video', at: ww('images', s + 8)},
    {b: 'gemini', l: 'Big files', at: ww('big', s + 9)},
    {b: 'gemini', l: 'Voice', at: ww('voice', s + 10)},
  ];
  const tally = L(2);
  const pts: Record<B, number> = {gpt: 1, claude: 3, gemini: 4};
  return (
    <AbsoluteFill>
      <Kicker t={t} at={0.05} text="THE SCOREBOARD" style={{position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center'}} />
      <div style={{position: 'absolute', left: 160, top: 170, width: 1600, display: 'flex', gap: 40}}>
        {ORDER.map((b) => (
          <div key={b} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Tile b={b} size={150} glow={0.4} />
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 130, color: BR[b].hi, marginTop: 10, opacity: p01(t, tally + (b === 'gemini' ? 0.6 : b === 'claude' ? 1.4 : 2.2), 0.3), transform: `scale(${bounce(t, tally + (b === 'gemini' ? 0.6 : b === 'claude' ? 1.4 : 2.2), 10, 200)})`}}>{pts[b]}</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6, width: 460}}>
              {chips.filter((c) => c.b === b).map((c) => (
                <div key={c.l} style={{padding: '14px 22px', borderRadius: 16, background: `${BR[b].col}22`, boxShadow: `inset 0 0 0 1.5px ${BR[b].col}88`, fontFamily: F.ui, fontWeight: 700, fontSize: 30, opacity: p01(t, c.at - 0.2, 0.3), transform: `translateY(${(1 - p01(t, c.at - 0.2, 0.4)) * -60}px)`}}>{c.l}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 980, textAlign: 'center', opacity: p01(t, ww('apps', s + 11) - 0.2, 0.3)}}><Chip text="YOUR APPS: DEPENDS WHERE YOU WORK" col={C.ink3} size={24} /></div>
    </AbsoluteFill>
  );
};

export const Persona: React.FC = () => {
  const {t, L} = useT();
  const ps: {b: B; who: string; plan: string; price: string; why: string; i: number; icon: string}[] = [
    {b: 'gemini', who: 'Student', plan: 'Gemini free', price: '$0', why: 'Deep Research · Canvas · images', i: 4, icon: 'bulb'},
    {b: 'gpt', who: 'One app for everything', plan: 'ChatGPT Plus', price: '$20', why: 'Intelligent UI · voice · Codex · no ads', i: 5, icon: 'star'},
    {b: 'claude', who: 'Writer or builder', plan: 'Claude Pro', price: '$20', why: 'Claude Code · Design, Slides & Docs', i: 6, icon: 'edit'},
    {b: 'gemini', who: 'Lives in Google', plan: 'Google AI Pro', price: '$19.99', why: 'Gmail, Docs, Drive · video · 5 TB', i: 7, icon: 'mail'},
    {b: 'gemini', who: 'Tight budget', plan: 'Google AI Plus', price: '$4.99', why: 'Cheapest paid plan of the three', i: 8, icon: 'dollar'},
  ];
  const cur = ps.reduce((a, p, k) => (t >= L(p.i) - 0.3 ? k : a), -1);
  return (
    <AbsoluteFill>
      <Head t={t} at={0.1} text="Which one fits *you*" y={90} size={70} />
      {cur < 0 && <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', gap: 50}}>{ORDER.map((b, k) => <Layer key={b} t={t} at={enter(0.3 + k * 0.1, {from: 'z'})} style={{position: 'relative'}}><Tile b={b} size={180} /></Layer>)}</div>}
      <div style={{position: 'absolute', left: 140, top: 250, width: 1640, display: 'flex', flexWrap: 'wrap', gap: 24}}>
        {ps.map((p, k) => {
          const a = p01(t, L(p.i) - 0.3, 0.5);
          const on = k === cur;
          return (
            <div key={k} style={{width: on ? 1640 : 396, opacity: clamp(a * 1.5) * (on ? 1 : 0.6), order: on ? -1 : k, transform: `translateY(${(1 - a) * 60}px)`}}>
              <Glass pad={on ? 40 : 22} col={on ? BR[p.b].col : undefined}>
                <div style={{display: 'flex', alignItems: 'center', gap: on ? 40 : 16}}>
                  <Icon name={p.icon} size={on ? 90 : 40} color={BR[p.b].hi} />
                  <div style={{flex: 1}}>
                    <div style={{fontFamily: F.mono, fontSize: on ? 28 : 18, color: C.ink3, letterSpacing: '0.12em'}}>{p.who.toUpperCase()}</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 6}}><Logo b={p.b} size={on ? 60 : 30} /><span style={{fontFamily: F.display, fontWeight: 900, fontSize: on ? 72 : 30}}>{p.plan}</span></div>
                    {on && <div style={{fontFamily: F.ui, fontSize: 32, color: C.ink2, marginTop: 14}}>{p.why}</div>}
                  </div>
                  <div style={{fontFamily: F.display, fontWeight: 900, fontSize: on ? 110 : 40, color: BR[p.b].hi}}>{p.price}</div>
                </div>
              </Glass>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const OneTip: React.FC = () => {
  const {t, ww, L} = useT();
  const one = ww('one', L(9) + 5, 1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center', gap: 70}}>
        {[0, 1].map((k) => (
          <div key={k} style={{opacity: k === 1 ? 1 - p01(t, one - 0.4, 0.5) : 1, transform: `translateX(${k === 1 ? p01(t, one - 0.4, 0.6) * 200 : 0}px)`}}>
            <Glass w={460} pad={40} style={{textAlign: 'center'}}>
              <Icon name="dollar" size={90} color={ACC} />
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 64, marginTop: 16}}>Plan {k + 1}</div>
              {k === 1 && <svg width={420} height={120} style={{position: 'absolute', left: 20, top: 120, overflow: 'visible'}}><Draw t={t} d="M10 60 L 400 50" at={ww('dont', 1) + 0.2} dur={0.3} stroke={C.red} width={10} /></svg>}
            </Glass>
          </div>
        ))}
      </div>
      <Head t={t} at={ww('month', L(9) + 4) - 0.3} text="Use one for a *full month* first" y={760} size={72} />
    </AbsoluteFill>
  );
};

export const Final: React.FC = () => {
  const {t, ww, L} = useT();
  const free = L(1);
  const week = ww('week', L(1) + 3);
  const pay = L(2);
  const ch = L(3);
  const sw = p01(t, ch - 0.3, 0.5, E.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - sw}}>
        <Head t={t} at={0.1} text="My pick for *most people*" y={110} size={76} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 50}}>
          {(['gemini', 'gpt'] as B[]).map((b, k) => <Layer key={b} t={t} at={enter(free + k * 0.2, {from: 'z'})} style={{position: 'relative', textAlign: 'center'}}><Tile b={b} size={200} glow={0.6} /><div style={{marginTop: 18}}><Chip text="FREE" col={BR[b].hi} size={26} /></div></Layer>)}
          <svg width={200} height={80} style={{opacity: p01(t, week - 0.3, 0.3)}}><Draw t={t} d="M10 40 L 170 40 M 140 15 L 175 40 L 140 65" at={week - 0.3} dur={0.4} stroke={ACC} width={7} /></svg>
          <div style={{opacity: p01(t, week - 0.1, 0.3)}}><Glass pad={30}><div style={{fontFamily: F.display, fontWeight: 900, fontSize: 56}}>1 week</div></Glass></div>
        </div>
        <Head t={t} at={pay} text="Then pay for the one you *keep opening*" y={720} size={64} />
      </div>
      {sw > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: sw}}>
          <Head t={t} at={ch} text="These apps change *every week*" y={150} size={80} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center', gap: 40}}>
            {[{b: 'gpt' as B, l: 'GPT-6', d: '3 DAYS AGO', at: ww('gpt', ch + 4)}, {b: 'claude' as B, l: '3 new models', d: 'IN 3 WEEKS', at: ww('three', ch + 6, 1)}].map((x) => (
              <Layer key={x.l} t={t} at={enter(x.at - 0.3, {from: 'd', dist: 80})} style={{position: 'relative'}}>
                <Glass w={600} pad={36} col={BR[x.b].col}><div style={{display: 'flex', alignItems: 'center', gap: 20}}><Logo b={x.b} size={70} /><div><div style={{fontFamily: F.display, fontWeight: 900, fontSize: 60}}>{x.l}</div><div style={{fontFamily: F.mono, fontSize: 24, color: C.ink3}}>{x.d}</div></div></div></Glass>
              </Layer>
            ))}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', opacity: p01(t, ww('updated', ch + 12) - 0.4, 0.4)}}><Stamp t={t} at={ww('updated', ch + 12) - 0.4} text="I'LL KEEP YOU UPDATED" col={ACC} icon="bell" rot={0} /></div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Outro: React.FC = () => {
  const {t, ww, loc, dur} = useT();
  const c = CUES.Outro;
  const tLike = loc(c.like), tSub = loc(c.sub), tCom = loc(c.comment.at);
  const tSee = ww('see', dur - 3.5);
  const liked = t > tLike + 0.05, subbed = t > tSub + 0.05;
  const press = (a: number) => (t > a - 0.05 && t < a + 0.12 ? 0.92 : 1);
  const n = Math.floor(clamp((t - tCom) / 1.6) * c.comment.text.length);
  const end = p01(t, tSee - 0.2, 0.6, E.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - end * 0.92, transform: `scale(${1 - end * 0.08})`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', gap: 40}}>{ORDER.map((b) => <Tile key={b} b={b} size={120} glow={0.3} />)}</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 40}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 40px', borderRadius: 999, background: liked ? ACC : 'rgba(255,255,255,.08)', color: liked ? '#111' : C.ink, fontFamily: F.ui, fontWeight: 800, fontSize: 40, transform: `scale(${press(tLike)})`}}><Icon name="thumb" size={44} color={liked ? '#111' : '#fff'} width={2.2} fill={liked ? '#111' : undefined} /> Like</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 40px', borderRadius: 999, background: subbed ? 'rgba(255,255,255,.12)' : C.ink, color: subbed ? C.ink : '#111', fontFamily: F.ui, fontWeight: 800, fontSize: 40, transform: `scale(${press(tSub)})`}}>{subbed && <Icon name="bell" size={40} color={C.ink} width={2.2} />} {subbed ? 'Subscribed' : 'Subscribe'}</div>
        </div>
        <Layer t={t} at={enter(tCom - 0.6, {from: 'd', dist: 100})} style={{left: 520, top: 690}}>
          <div style={{width: 880, display: 'flex', gap: 20, alignItems: 'flex-start'}}>
            <div style={{width: 64, height: 64, borderRadius: 32, background: '#2a2c2e', flex: 'none', display: 'grid', placeItems: 'center'}}><Icon name="chat" size={34} color={C.ink2} /></div>
            <div style={{flex: 1, padding: '20px 26px', borderRadius: '8px 26px 26px 26px', background: 'rgba(30,33,34,.92)', boxShadow: `0 0 0 1px ${C.line2}`, fontFamily: F.ui, fontWeight: 600, fontSize: 36, minHeight: 50}}>
              <span style={{color: n ? C.ink : C.ink3}}>{n ? c.comment.text.slice(0, n) : 'Which one do you use, and why?'}</span>
            </div>
          </div>
        </Layer>
        <Cursor t={t} keys={[[0.3, 1400, 900], [tLike, 790, 520, true], [tSub, 1120, 520, true], [tCom, 1500, 960]]} />
      </div>
      {end > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: end, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
          <div style={{display: 'flex', gap: 30, transform: `scale(${lerp(0.7, 1, end)})`}}>{ORDER.map((b) => <Logo key={b} b={b} size={110} />)}</div>
          <AText t={t} text="See you in the *next one*." at={tSee} size={96} by="word" accent={ACC} />
          <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.ink3, opacity: p01(t, tSee + 0.8, 0.5)}}>AI NEWS · 10 OCT 2026</div>
          <div style={{fontFamily: F.mono, fontSize: 16, color: C.ink3, opacity: p01(t, tSee + 1.2, 0.5), marginTop: 30, textAlign: 'center', lineHeight: 1.6}}>
            Sources: OpenAI, Anthropic and Google pricing, help and release-notes pages, checked 10 Oct 2026
            <br />
            App screens are illustrations drawn for this video · example prompts are ours · no sponsor
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export {BigNum, Trio, Kicker, AText, Glass};
