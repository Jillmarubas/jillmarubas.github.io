// Rounds 1–5 and their verdicts (chapters 7–16).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../gpt1010/design';
import {Draw} from '../gpt1010/ae';
import {Icon} from '../gpt1010/ui';
import {BikeExplorer, RouteMap} from '../gpt1010/widgets';
import {B, BR, ChatApp, Chip, GEM_GRAD, Logo, MacApp, Tile} from './brand';
import {ACC, AText, After, BigNum, BrandSide, E, Glass, Head, Kicker, Layer, List, RoundIntro, Stamp, Trio, Verdict, bounce, clamp, enter, lerp, p01} from './kit';
import {CUES, PROMPTS} from './cues';
import {useT} from './u';

/** A floating app window (illustration) with a brand header. */
export const Win: React.FC<{b: B; w?: number; h?: number; title?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({b, w = 720, h, title, children, style}) => (
  <div style={{width: w, height: h, borderRadius: 22, overflow: 'hidden', background: BR[b].app.bg, boxShadow: `0 0 0 1.5px rgba(255,255,255,.1), 0 40px 90px -30px rgba(0,0,0,.9)`, color: BR[b].app.text, fontFamily: F.ui, ...style}}>
    <div style={{height: 54, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', background: BR[b].app.side, boxShadow: `inset 0 -1px 0 ${BR[b].app.line}`}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />)}
      <Logo b={b} size={24} style={{marginLeft: 12}} />
      <span style={{fontSize: 18, fontWeight: 600, color: BR[b].app.text2}}>{title ?? BR[b].name}</span>
    </div>
    <div style={{position: 'relative', padding: 26}}>{children}</div>
  </div>
);

const lines = (n: number, p: number, col = 'rgba(255,255,255,.16)', w = 1) =>
  Array.from({length: n}).map((_, k) => <div key={k} style={{height: 12, borderRadius: 6, marginBottom: 14, background: col, width: `${(k === n - 1 ? 60 : 92 - (k % 3) * 8) * w * clamp(p * n - k)}%`}} />);

// ---------------------------------------------------------------- round 1
export const R1Iui: React.FC = () => {
  const {t, ww, L} = useT();
  const map = ww('map', L(2) + 2.5), dia = ww('diagram', L(2) + 5.5), side = ww('side', L(2) + 8);
  const intro = L(1) - 0.2;
  return (
    <AbsoluteFill>
      <RoundIntro t={t} until={L(1)} items={[{icon: 'chat', label: 'Quick questions', at: ww('questions', 2.4)}, {icon: 'clock', label: 'Ten times a day', at: ww('ten', 3.4)}]} />
      <After t={t} at={L(1)}>
      <Layer t={t} at={enter(intro, {from: 'l', dist: 100})} style={{left: 130, top: 170}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <Logo b="gpt" size={70} />
          <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 64, letterSpacing: '-0.03em'}}>Not just text any more</span>
        </div>
      </Layer>
      <div style={{position: 'absolute', left: 90, top: 330, transform: `scale(${lerp(0.7, 0.8, p01(t, map, 1))})`, transformOrigin: '0 0', opacity: p01(t, map - 0.3, 0.4)}}>
        <Win b="gpt" w={760} title="Road trip · 3 stops"><RouteMap t={t} p={p01(t, map, 1.2)} at={map + 0.3} /></Win>
      </div>
      <div style={{position: 'absolute', left: 720, top: 400, transform: 'scale(0.78)', transformOrigin: '0 0', opacity: p01(t, dia - 0.3, 0.4)}}>
        <Win b="gpt" w={760} title="How a 7-speed bike works"><BikeExplorer t={t} p={p01(t, dia, 1.2)} tab={2} tabAt={dia + 1.2} /></Win>
      </div>
      <div style={{position: 'absolute', left: 1330, top: 300, opacity: p01(t, side - 0.3, 0.4), transform: `translateY(${(1 - p01(t, side - 0.3, 0.6)) * 60}px)`}}>
        <Win b="gpt" w={500} title="Side by side">
          <div style={{display: 'flex', gap: 16}}>
            {['A', 'B'].map((x, k) => (
              <div key={x} style={{flex: 1, padding: 18, borderRadius: 14, background: BR.gpt.app.card, opacity: p01(t, side + k * 0.2, 0.3)}}>
                <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 30}}>Option {x}</div>
                <div style={{marginTop: 16}}>{lines(4, p01(t, side + 0.2 + k * 0.2, 0.8))}</div>
              </div>
            ))}
          </div>
        </Win>
      </div>
      <Layer t={t} at={enter(map - 0.5, {from: 'u', dist: 40})} style={{left: 130, top: 990}}>
        <Chip text="ILLUSTRATIONS" col={C.ink3} size={22} />
      </Layer>
    </After>
    </AbsoluteFill>
  );
};

export const R1Stream: React.FC = () => {
  const {t, ww, L} = useT();
  const s = L(3);
  const ans = 'Here are three good options, from cheapest to fastest. First, the airport train runs every';
  const n = Math.floor(clamp((t - s - 1.2) / 3) * ans.length);
  const feats = [{i: 'mic', l: 'Voice chat', at: ww('voice', L(4) + 1.5)}, {i: 'star', l: 'Image creation', at: ww('image', L(4) + 2.3)}, {i: 'layers', l: 'Memory', at: ww('memory', L(4) + 3.2)}];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 190, top: 180}}>
        <Win b="gpt" w={900} title="ChatGPT · GPT-6">
          <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, color: BR.gpt.app.text2}}>
            <div style={{width: 22, height: 22, borderRadius: 11, border: `3px solid ${BR.gpt.hi}`, borderTopColor: 'transparent', transform: `rotate(${t * 360}deg)`}} />
            Thinking…
          </div>
          <div style={{fontSize: 28, lineHeight: 1.5, marginTop: 20, minHeight: 130}}>{ans.slice(0, n)}<span style={{opacity: Math.floor(t * 3) % 2 ? 1 : 0, color: BR.gpt.hi}}>▍</span></div>
        </Win>
      </div>
      <Layer t={t} at={enter(ww('sooner', s + 3.8) - 0.4, {from: 'r', dist: 80})} style={{left: 1180, top: 260}}>
        <Glass pad={34} col={BR.gpt.col} w={540}>
          <Kicker t={t} at={0} text="FIRST WORDS" col={BR.gpt.hi} />
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 96, letterSpacing: '-0.04em', marginTop: 8}}>Sooner</div>
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink3, marginTop: 6}}>STARTS WHILE STILL THINKING</div>
        </Glass>
      </Layer>
      <div style={{position: 'absolute', left: 190, top: 640, display: 'flex', gap: 30}}>
        {feats.map((f) => (
          <Layer key={f.l} t={t} at={enter(f.at - 0.2, {from: 'd', dist: 60})} style={{position: 'relative'}}>
            <Glass pad={28} w={420}>
              <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <Icon name={f.i} size={52} color={BR.gpt.hi} />
                <span style={{fontFamily: F.ui, fontWeight: 800, fontSize: 38}}>{f.l}</span>
              </div>
            </Glass>
          </Layer>
        ))}
      </div>
      <Layer t={t} at={enter(ww('free', L(4) + 4.5) - 0.2, {from: 'd', dist: 40})} style={{left: 190, top: 820}}>
        <Chip text="ALL ON THE FREE PLAN · MORE ON PAID" col={BR.gpt.hi} size={28} />
      </Layer>
    </AbsoluteFill>
  );
};

/** A phone outline with content. */
export const Phone: React.FC<{children: React.ReactNode; w?: number; style?: React.CSSProperties}> = ({children, w = 380, style}) => (
  <div style={{width: w, height: w * 2.05, borderRadius: w * 0.14, background: '#0B0B0C', boxShadow: '0 0 0 10px #1c1d20, 0 0 0 12px #3a3c41, 0 50px 100px -30px rgba(0,0,0,.9)', overflow: 'hidden', position: 'relative', ...style}}>
    <div style={{position: 'absolute', left: '50%', top: 14, width: w * 0.3, height: 30, marginLeft: -w * 0.15, borderRadius: 15, background: '#000', zIndex: 2}} />
    {children}
  </div>
);

/** A voice orb (animated). */
export const Orb: React.FC<{t: number; col: string; col2?: string; size?: number}> = ({t, col, col2 = '#fff', size = 220}) => {
  const k = 1 + 0.06 * Math.sin(t * 6) + 0.04 * Math.sin(t * 9.3);
  return <div style={{width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${col2} 0%, ${col} 45%, rgba(0,0,0,0) 72%)`, transform: `scale(${k})`, filter: 'blur(1px)', boxShadow: `0 0 80px ${col}88`}} />;
};

export const R1Gemini: React.FC = () => {
  const {t, ww, L} = useT();
  const live = ww('live', L(5) + 3);
  const sk = ww('skills', L(6) + 2.5);
  const gem = ww('gems', L(6) + 7.5);
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(0.1, {from: 'd', dist: 120})} style={{left: 220, top: 110}}>
        <Phone>
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
            <div style={{opacity: p01(t, live - 0.4, 0.5)}}><Orb t={t} col="#4E8DF5" col2="#C9B6FF" /></div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 120, textAlign: 'center', fontFamily: F.ui, fontWeight: 700, fontSize: 34, color: '#E3E3E3'}}>Gemini Live</div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center'}}><Chip text="FREE" col={BR.gemini.hi} size={22} /></div>
        </Phone>
      </Layer>
      <Layer t={t} at={enter(sk - 0.4, {from: 'r', dist: 120})} style={{left: 820, top: 230}}>
        <Glass w={880} pad={40} col={BR.gemini.col}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <Icon name="sparkle" size={56} color={BR.gemini.hi} />
              <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 64}}>Skills</span>
            </div>
            <Chip text="SEP 30" col={BR.gemini.hi} size={26} />
          </div>
          <div style={{fontFamily: F.ui, fontSize: 32, color: C.ink2, marginTop: 24, lineHeight: 1.4}}>Saved instructions that run on their own when your prompt matches</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 34, opacity: p01(t, gem - 0.3, 0.4)}}>
            <Chip text="GEMS" col={C.ink2} size={26} />
            <svg width={120} height={40}><Draw t={t} d="M5 20 L 105 20 M 85 6 L 108 20 L 85 34" at={gem - 0.1} dur={0.4} stroke={BR.gemini.hi} width={5} /></svg>
            <Chip text="SKILLS" col={BR.gemini.hi} size={26} solid />
          </div>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

export const R1Claude: React.FC = () => {
  const {t, L} = useT();
  const no = L(8);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 360, top: 180}}>
        <Win b="claude" w={1200} title="Claude">
          <div style={{fontSize: 30, lineHeight: 1.5, fontFamily: 'Georgia, serif', color: BR.claude.app.text}}>
            <div style={{opacity: p01(t, 0.3, 0.5)}}>Here's a clear, careful answer, with sources from the web.</div>
            <div style={{marginTop: 24}}>{lines(5, p01(t, 0.6, 2.5), 'rgba(255,240,220,.16)')}</div>
          </div>
          <div style={{display: 'flex', gap: 14, marginTop: 10}}>
            <Chip text="WEB SEARCH" col={BR.claude.hi} size={22} />
            <Chip text="MEMORY" col={BR.claude.hi} size={22} />
            <Chip text="EVERY PLAN" col={C.ink3} size={22} />
          </div>
        </Win>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 780, textAlign: 'center'}}>
        <Stamp t={t} at={no + 0.3} text="NO INTELLIGENT UI" col={C.ink2} icon="x" rot={-2} />
      </div>
    </AbsoluteFill>
  );
};

/** A try-it shot: a MacBook with a drawn app, the prompt typed in, the answer drawn. */
const TryShot: React.FC<{b: B; type: {text: string; at: number; enter?: number}; answer: (p: number) => React.ReactNode; side: string[]; cam?: [number, number, number, number][]; extra?: React.ReactNode; type2?: {text: string; at: number; enter?: number}; answer2?: (p: number) => React.ReactNode}> = ({b, type, answer, side, cam, extra, type2, answer2}) => {
  const {t, loc} = useT();
  const a = loc(type.at), e = loc(type.enter ?? 999);
  const second = type2 && t >= loc(type2.at) - 0.2;
  return (
    <AbsoluteFill>
      <MacApp t={t} cam={cam ?? [[0, 1.0, 756, 472], [a - 0.2, 1.0, 756, 472], [a + 0.6, 1.2, 756, 450], [e + 0.3, 1.2, 756, 450], [e + 1.0, 1.12, 756, 470]]} swing={-14}>
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

const optCard = (p: number, i: number, title: string, rows: string[]) => (
  <div key={i} style={{flex: 1, padding: 18, borderRadius: 16, background: BR.gpt.app.card, boxShadow: `inset 0 0 0 1px ${BR.gpt.app.line}`, opacity: clamp(p * 3 - i * 0.6), transform: `translateY(${(1 - clamp(p * 3 - i * 0.6)) * 20}px)`}}>
    <div style={{fontWeight: 700, fontSize: 22, marginBottom: 12}}>{title}</div>
    {rows.map((r, k) => <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 17, color: BR.gpt.app.text2, padding: '7px 0', borderTop: `1px solid ${BR.gpt.app.line}`}}><span>{['Cost', 'Time', 'Comfort'][k]}</span><span style={{color: BR.gpt.app.text}}>{r}</span></div>)}
  </div>
);

export const R1Try: React.FC = () => {
  const {t, ww, L} = useT();
  const others = ww('others', L(10) + 4);
  return (
    <TryShot b="gpt" type={CUES.R1Try.type} side={['Airport transfer', 'Dinner bill', 'Road trip']} answer={(p) => (
      <div>
        <div style={{fontSize: 19, color: BR.gpt.app.text2, marginBottom: 14, opacity: p}}>Three ways into the city. Tap one for details.</div>
        <div style={{display: 'flex', gap: 14}}>
          {optCard(p, 0, 'Train', ['$', 'Fast', '●●○'])}
          {optCard(p, 1, 'Bus', ['$', 'Slow', '●○○'])}
          {optCard(p, 2, 'Taxi', ['$$$', 'Medium', '●●●'])}
        </div>
      </div>
    )} extra={
      <div style={{position: 'absolute', right: 80, top: 640, display: 'flex', flexDirection: 'column', gap: 20, opacity: p01(t, others - 0.3, 0.4)}}>
        {(['claude', 'gemini'] as B[]).map((b) => (
          <Win key={b} b={b} w={420} title={`${BR[b].name} · a table`}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6}}>{Array.from({length: 9}).map((_, k) => <div key={k} style={{height: 18, borderRadius: 4, background: k < 3 ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.09)'}} />)}</div>
          </Win>
        ))}
      </div>
    } />
  );
};

export const V1: React.FC = () => {
  const {t, dur} = useT();
  return <Verdict t={t} dur={dur} n="1" win={['gpt']} label="Intelligent UI, even on the *free* plan" />;
};

// ---------------------------------------------------------------- round 2
export const R2Claude: React.FC = () => {
  const {t, ww, L} = useT();
  const tabs = [{l: 'Design', at: ww('design', L(1) + 4.5)}, {l: 'Slides', at: ww('slides', L(1) + 5.5)}, {l: 'Docs', at: ww('docs', L(1) + 6.3)}];
  const deck = ww('deck', L(2) + 1.5);
  const real = ww('real', L(2) + 3.5);
  return (
    <AbsoluteFill>
      <RoundIntro t={t} until={L(1)} items={[{icon: 'mail', label: 'Emails', at: ww('emails', 3)}, {icon: 'doc', label: 'Reports', at: ww('reports', 3.6)}, {icon: 'layers', label: 'Slides', at: ww('slides', 4.2)}]} />
      <After t={t} at={L(1)}>
      <BrandSide t={t} b="claude" at={L(1) - 0.3} x={120} y={260} />
      <Layer t={t} at={enter(L(1) + 1.5, {from: 'u', dist: 50})} style={{left: 700, top: 120}}>
        <Chip text="SEP 16 · IN ANY CONVERSATION" col={BR.claude.hi} size={26} />
      </Layer>
      <div style={{position: 'absolute', left: 700, top: 200}}>
        <Win b="claude" w={1080} title="Claude">
          <div style={{display: 'flex', gap: 12, marginBottom: 24}}>
            {tabs.map((x) => <div key={x.l} style={{opacity: p01(t, x.at - 0.2, 0.3), transform: `scale(${lerp(0.6, 1, bounce(t, x.at - 0.2, 12, 240))})`}}><Chip text={x.l.toUpperCase()} col={BR.claude.hi} size={24} solid={t > deck && x.l === 'Slides'} /></div>)}
          </div>
          <div style={{display: 'flex', gap: 18, height: 420}}>
            {[0, 1, 2].map((k) => {
              const p = p01(t, deck + k * 0.5, 0.6);
              return (
                <div key={k} style={{flex: 1, borderRadius: 14, background: '#F4EFE6', padding: 22, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
                  <div style={{height: 30, width: '70%', borderRadius: 6, background: BR.claude.col}} />
                  <div style={{marginTop: 26}}>{lines(4, p01(t, deck + k * 0.5 + 0.3, 1), 'rgba(40,30,20,.18)')}</div>
                  <div style={{marginTop: 20, height: 110, borderRadius: 10, background: 'rgba(217,119,87,.18)'}} />
                </div>
              );
            })}
          </div>
        </Win>
      </div>
      <div style={{position: 'absolute', left: 700, top: 900}}>
        <Stamp t={t} at={real} text="THE REAL FILE, NOT PASTE-ABLE TEXT" col={ACC} icon="check" rot={0} size={28} />
      </div>
    </After>
    </AbsoluteFill>
  );
};

export const R2Artifacts: React.FC = () => {
  const {t, ww, L} = useT();
  const art = L(3);
  const proj = L(4);
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(art - 0.2, {from: 'l', dist: 100})} style={{left: 160, top: 220}}>
        <Win b="claude" w={760} title="Artifact · Budget tracker">
          <div style={{display: 'flex', gap: 14, marginBottom: 18}}>{['Rent', 'Food', 'Travel'].map((x, k) => <div key={x} style={{flex: 1, padding: 14, borderRadius: 12, background: BR.claude.app.card}}><div style={{fontSize: 16, color: BR.claude.app.text2}}>{x}</div><div style={{height: 10, borderRadius: 5, marginTop: 10, background: BR.claude.col, width: `${[80, 45, 30][k] * p01(t, art + 0.5 + k * 0.2, 0.8)}%`}} /></div>)}</div>
          {lines(3, p01(t, art + 0.8, 1), 'rgba(255,240,220,.14)')}
        </Win>
        <div style={{marginTop: 26, opacity: p01(t, ww('free', art + 4.5) - 0.2, 0.3)}}><Chip text="ARTIFACTS · EVERY PLAN, INCLUDING FREE" col={BR.claude.hi} size={26} /></div>
      </Layer>
      <Layer t={t} at={enter(proj - 0.2, {from: 'r', dist: 100})} style={{left: 1020, top: 220}}>
        <Glass w={740} pad={36} col={BR.claude.col}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <Icon name="list" size={50} color={BR.claude.hi} />
            <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 56}}>Project</span>
          </div>
          <div style={{position: 'relative', height: 260, marginTop: 30}}>
            <List t={t} x={0} y={0} w={660} size={32} col={BR.claude.hi} items={[
              {text: 'brief.pdf', at: ww('files', proj + 2), icon: 'file'},
              {text: 'notes.docx', at: ww('files', proj + 2) + 0.2, icon: 'file'},
              {text: 'Instructions: plain English', at: ww('instructions', proj + 3), icon: 'edit'},
            ]} />
          </div>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

export const R2Gpt: React.FC = () => {
  const {t, ww, L} = useT();
  const g = ww('custom', L(5) + 2);
  return (
    <AbsoluteFill>
      <BrandSide t={t} b="gpt" plan="PLUS" price="$20" />
      <List t={t} x={760} y={300} w={1000} size={44} col={BR.gpt.hi} items={[{text: 'Projects', at: ww('projects', L(5) + 1), icon: 'list'}, {text: 'Custom GPTs', at: g, icon: 'gear'}]} />
      <Layer t={t} at={enter(ww('style', L(5) + 8) - 1.2, {from: 'd', dist: 80})} style={{left: 760, top: 560}}>
        <Glass w={920} pad={34} col={BR.gpt.col}>
          <div style={{fontFamily: F.mono, fontSize: 22, color: BR.gpt.hi, letterSpacing: '0.14em'}}>YOUR CUSTOM GPT</div>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 52, marginTop: 10}}>Company-style writer</div>
          <div style={{fontFamily: F.ui, fontSize: 28, color: C.ink2, marginTop: 10}}>Set up once · reuse for a task you repeat</div>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

export const R2Gemini: React.FC = () => {
  const {t, ww, L} = useT();
  const gm = ww('gmail', L(6) + 5);
  const doc = ww('docs', L(7) + 2);
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(0.1, {from: 'l', dist: 100})} style={{left: 150, top: 150}}>
        <Win b="gemini" w={1100} title="Mail · Gemini side panel">
          <div style={{display: 'flex', gap: 20, height: 560}}>
            <div style={{flex: 1}}>{Array.from({length: 7}).map((_, k) => <div key={k} style={{display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,.07)'}}><div style={{width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,.12)'}} /><div style={{flex: 1}}>{lines(2, 1, 'rgba(255,255,255,.12)')}</div></div>)}</div>
            <div style={{width: 380, borderRadius: 16, background: '#1E1F20', padding: 22, opacity: p01(t, gm - 0.3, 0.4), transform: `translateX(${(1 - p01(t, gm - 0.3, 0.5)) * 60}px)`}}>
              <div style={{fontSize: 22, fontWeight: 700, background: GEM_GRAD, WebkitBackgroundClip: 'text', color: 'transparent'}}>Gemini</div>
              <div style={{marginTop: 18}}>{lines(6, p01(t, gm + 0.3, 1.5))}</div>
            </div>
          </div>
        </Win>
      </Layer>
      <Layer t={t} at={enter(ww('plus', L(6) + 3) - 0.3, {from: 'r', dist: 80})} style={{left: 1300, top: 160}}>
        <Chip text="GOOGLE AI PLUS OR HIGHER" col={BR.gemini.hi} size={26} />
      </Layer>
      <Layer t={t} at={enter(doc - 0.4, {from: 'd', dist: 80})} style={{left: 1300, top: 760}}>
        <Glass pad={28} col={BR.gemini.col}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <Icon name="doc" size={50} color={BR.gemini.hi} />
            <span style={{fontFamily: F.ui, fontWeight: 800, fontSize: 34}}>Less copy & paste</span>
          </div>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

export const R2Try: React.FC = () => (
  <TryShot b="claude" type={CUES.R2Try.type} type2={CUES.R2Try.type2} side={['One-page plan', 'Budget tracker', 'Weekly notes']} answer={(p) => (
    <div style={{fontSize: 20, lineHeight: 1.5, color: BR.claude.app.text}}>
      <div style={{fontWeight: 700, fontSize: 24, opacity: p}}>One-page plan</div>
      <div style={{marginTop: 10}}>{lines(6, p, 'rgba(255,240,220,.14)')}</div>
    </div>
  )} answer2={(p) => (
    <div style={{display: 'flex', gap: 20, alignItems: 'flex-start'}}>
      <div style={{width: 420, borderRadius: 14, background: '#F4EFE6', padding: 24, color: '#222', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
        <div style={{fontWeight: 800, fontSize: 26}}>Q4 Plan</div>
        <div style={{fontSize: 15, color: '#8a6b55', marginTop: 4}}>3 goals · timeline</div>
        <div style={{marginTop: 16}}>{lines(5, p01(p, 0.2, 0.8), 'rgba(40,30,20,.16)')}</div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 12, background: BR.claude.app.card, opacity: p01(p, 0.6, 0.3), fontSize: 18}}>
        <Icon name="download" size={22} color={BR.claude.hi} /> plan.docx
      </div>
    </div>
  )} />
);

export const R2Trick: React.FC = () => {
  const {t, ww, L} = useT();
  const k = [{l: "Who it's for", i: 'users', at: ww('whos', L(10) + 3)}, {l: 'How long', i: 'clock', at: ww('long', L(10) + 4)}, {l: 'What format', i: 'layers', at: ww('format', L(10) + 5.5)}];
  return (
    <AbsoluteFill>
      <Head t={t} at={0.1} text="Works in *all three*" y={170} size={86} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', gap: 50}}>
        {k.map((x) => (
          <Layer key={x.l} t={t} at={enter(x.at - 0.2, {from: 'd', dist: 80})} style={{position: 'relative'}}>
            <Glass w={440} pad={40} col={ACC} style={{textAlign: 'center'}}>
              <Icon name={x.i} size={90} color={ACC} />
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 56, marginTop: 20}}>{x.l}</div>
            </Glass>
          </Layer>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const V2: React.FC = () => {
  const {t, dur, L} = useT();
  return <Verdict t={t} dur={dur} n="2" win={['claude']} label="Real documents, decks and *designs*" also={[{b: 'gemini', at: L(1), label: 'If your team lives in Google Docs'}]} />;
};

// ---------------------------------------------------------------- round 3
export const R3Flow: React.FC = () => {
  const {t, ww, L} = useT();
  const q = ww('question', L(1) + 3);
  const src = ww('sources', L(1) + 5, 1);
  const rep = ww('report', L(1) + 7);
  const N = 9;
  return (
    <AbsoluteFill>
      <RoundIntro t={t} until={L(1)} items={[{icon: 'target', label: 'A real answer', at: ww('real', 2.6)}, {icon: 'globe', label: 'With sources', at: ww('sources', 3.6)}]} />
      <After t={t} at={L(1)}>
      <Layer t={t} at={enter(q - 0.3, {from: 'l', dist: 80})} style={{left: 140, top: 430}}>
        <Glass pad={30} w={440}>
          <Icon name="search" size={50} color={ACC} />
          <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 36, marginTop: 14}}>A big question</div>
        </Glass>
      </Layer>
      {Array.from({length: N}).map((_, k) => {
        const p = p01(t, src - 0.2 + k * 0.1, 0.6);
        const y = 160 + k * 88;
        return (
          <div key={k} style={{position: 'absolute', left: lerp(600, 820, p), top: lerp(500, y, p), width: 280, height: 64, borderRadius: 12, background: 'rgba(255,255,255,.07)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.12)', opacity: clamp(p * 1.5), display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', boxSizing: 'border-box'}}>
            <Icon name="globe" size={28} color={C.ink2} />
            <div style={{flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,.18)'}} />
          </div>
        );
      })}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: N}).map((_, k) => <Draw key={k} t={t} d={`M1110 ${192 + k * 88} C 1220 ${192 + k * 88}, 1220 540, 1300 540`} at={rep - 0.8 + k * 0.05} dur={0.6} stroke={`${ACC}66`} width={2.5} />)}
      </svg>
      <Layer t={t} at={enter(rep - 0.2, {from: 'r', dist: 100})} style={{left: 1310, top: 330}}>
        <Glass pad={34} w={470} col={ACC}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 48}}>Report</div>
          <div style={{marginTop: 18}}>{lines(6, p01(t, rep, 1.5))}</div>
          <div style={{display: 'flex', gap: 8, marginTop: 6}}>{[1, 2, 3, 4].map((x) => <Chip key={x} text={`[${x}]`} col={ACC} size={18} />)}</div>
        </Glass>
      </Layer>
    </After>
    </AbsoluteFill>
  );
};

export const R3Who: React.FC = () => {
  const {t, L} = useT();
  return (
    <AbsoluteFill>
      <Head t={t} at={0.05} text="Who gets *deep research*" y={110} size={76} />
      <Trio t={t} y={300} size={200} items={[
        {b: 'gemini', at: L(3), value: 'FREE', sub: 'EVEN ON THE FREE PLAN', hot: L(3) + 0.3},
        {b: 'gpt', at: L(4), value: 'PLUS', sub: 'MORE · MOST ON PRO + AGENT MODE'},
        {b: 'claude', at: L(5), value: 'PRO', sub: 'FREE: NORMAL WEB SEARCH'},
      ]} />
    </AbsoluteFill>
  );
};

export const R3Context: React.FC = () => {
  const {t, ww, L} = useT();
  const m = ww('million', L(6) + 4);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 140, top: 140, display: 'flex', alignItems: 'center', gap: 20}}>
        <Logo b="gemini" size={64} />
        <Kicker t={t} at={0} text="AI PRO · READING" col={BR.gemini.hi} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 260}}><BigNum t={t} at={m - 0.3} value="1M" unit="tokens" label="A HUGE PILE OF DOCUMENTS AT ONCE" col={BR.gemini.hi} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', gap: 22}}>
        {Array.from({length: 9}).map((_, k) => {
          const p = p01(t, ww('pile', L(6) + 6) - 0.3 + k * 0.08, 0.5);
          return <div key={k} style={{width: 96, height: 124, borderRadius: 10, background: '#E9EEF6', opacity: p, transform: `translateY(${(1 - p) * -200}px) rotate(${(k - 4) * 4}deg)`, boxShadow: '0 10px 20px rgba(0,0,0,.5)', display: 'grid', placeItems: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 20, color: '#C0392B'}}>PDF</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

export const R3Check: React.FC = () => {
  const {t, ww, L} = useT();
  const c = ww('click', L(7) + 2);
  const wrong = ww('wrong', L(7) + 6.5);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 460, top: 200}}>
        <Glass w={1000} pad={40}>
          <div style={{fontFamily: F.ui, fontSize: 34, lineHeight: 1.6}}>
            The laptop has an all-day battery <span style={{padding: '2px 12px', borderRadius: 8, background: `${ACC}33`, color: ACC, fontFamily: F.mono, fontSize: 28}}>[3]</span> and weighs about…
          </div>
          <div style={{marginTop: 30}}>{lines(3, 1)}</div>
        </Glass>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center'}}>
        <Stamp t={t} at={wrong - 0.3} text="CHECK THE IMPORTANT FACTS" col={ACC} icon="eye" />
      </div>
      <div style={{position: 'absolute', left: 1080, top: 250, opacity: p01(t, c - 0.8, 0.3)}}>
        <svg width={40} height={52} viewBox="0 0 26 34" style={{transform: `translate(${lerp(200, 0, p01(t, c - 0.8, 0.7, E.inOut))}px, ${lerp(200, 0, p01(t, c - 0.8, 0.7, E.inOut))}px)`}}>
          <path d="M4 3 L4 26 L9.4 20.9 L13 29.4 L16.6 27.9 L13.1 19.6 L20.4 19.6 Z" fill="#000" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const R3Try: React.FC = () => {
  const {t, loc, L} = useT();
  const prog = clamp((t - L(9)) / 4);
  return (
    <TryShot b="gemini" type={CUES.R3Try.type} type2={CUES.R3Try.type2} side={['Budget laptops', 'Trip to Penang', 'Study plan']} answer={(p) => (
      <div style={{fontSize: 20}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, color: BR.gemini.app.text2}}><Icon name="search" size={24} color={BR.gemini.hi} /> Deep Research · reading sources</div>
        <div style={{height: 10, borderRadius: 5, background: 'rgba(255,255,255,.1)', marginTop: 16}}><div style={{height: 10, borderRadius: 5, width: `${(p * 0.3 + prog * 0.7) * 100}%`, background: GEM_GRAD}} /></div>
        <div style={{marginTop: 22}}>{lines(5, prog)}</div>
      </div>
    )} answer2={(p) => (
      <div style={{fontSize: 20, lineHeight: 1.5}}>
        <div style={{opacity: p}}>The longest battery life is on laptop C, rated at about…</div>
        <div style={{display: 'flex', gap: 10, marginTop: 14, opacity: p01(p, 0.4, 0.3)}}>{['[2]', '[5]'].map((x) => <Chip key={x} text={x} col={BR.gemini.hi} size={18} />)}</div>
      </div>
    )} extra={void loc} />
  );
};

export const V3: React.FC = () => {
  const {t, dur, ww, L} = useT();
  return <Verdict t={t} dur={dur} n="3" win={['gemini']} label="Deep Research is *free*" also={[{b: 'gpt', at: ww('pay', L(0) + 5), label: 'Strong if you pay'}, {b: 'claude', at: ww('pay', L(0) + 5) + 0.2, label: 'Strong if you pay'}]} />;
};

// ---------------------------------------------------------------- round 4
export const R4Nano: React.FC = () => {
  const {t, ww, L} = useT();
  const nb = ww('banana', L(1) + 4);
  const k4 = ww('four', L(1) + 7);
  const five = ww('five', L(1) + 9);
  const txt = ww('text', L(1) + 11.5);
  const tiles = ['#E8A87C', '#7FA7E8', '#C38D9E', '#85DCB0', '#E27D60', '#41B3A3'];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 140, top: 130, display: 'flex', alignItems: 'center', gap: 20}}>
        <Logo b="gemini" size={70} />
        <div style={{opacity: p01(t, nb - 0.3, 0.3), fontFamily: F.display, fontWeight: 900, fontSize: 70}}>Nano Banana Pro</div>
      </div>
      <div style={{position: 'absolute', left: 140, top: 300, display: 'grid', gridTemplateColumns: 'repeat(3, 300px)', gap: 20}}>
        {tiles.map((c, k) => {
          const p = p01(t, nb + k * 0.12, 0.5);
          return <div key={k} style={{height: 220, borderRadius: 18, background: `linear-gradient(135deg, ${c} 0%, #1b1d22 120%)`, opacity: p, transform: `scale(${lerp(0.7, 1, p)})`, boxShadow: '0 20px 40px rgba(0,0,0,.5)'}} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 1180, top: 300, display: 'flex', flexDirection: 'column', gap: 30}}>
        {[{v: '4K', l: 'UP TO 4K IMAGES', at: k4}, {v: '5', l: 'PEOPLE KEPT CONSISTENT', at: five}, {v: 'Aa', l: 'CLEAR TEXT IN IMAGES', at: txt}].map((x) => (
          <Layer key={x.v} t={t} at={enter(x.at - 0.3, {from: 'r', dist: 80})} style={{position: 'relative'}}>
            <Glass w={600} pad={28} col={BR.gemini.col}>
              <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
                <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 80, color: BR.gemini.hi, width: 140}}>{x.v}</span>
                <span style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.1em'}}>{x.l}</span>
              </div>
            </Glass>
          </Layer>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const R4Synth: React.FC = () => {
  const {t, ww, L} = useT();
  const s = ww('synthid', L(2) + 3);
  const ask = ww('upload', L(2) + 5.5);
  const scan = clamp((t - s) / 1.4);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 560, top: 180, width: 800, height: 560, borderRadius: 22, overflow: 'hidden', background: 'linear-gradient(135deg, #E8A87C 0%, #7FA7E8 60%, #1b1d22 120%)', boxShadow: '0 40px 90px rgba(0,0,0,.6)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: `${scan * 100}%`, height: 6, background: BR.gemini.hi, boxShadow: `0 0 30px ${BR.gemini.hi}`, opacity: scan > 0 && scan < 1 ? 1 : 0}} />
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.35) 1px, transparent 1px)', backgroundSize: '18px 18px', opacity: 0.6 * scan * (1 - p01(t, s + 2, 0.6))}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', gap: 30}}>
        <Stamp t={t} at={s + 0.4} text="SYNTHID · INVISIBLE WATERMARK" col={BR.gemini.hi} icon="eye" rot={0} size={30} />
      </div>
      <Layer t={t} at={enter(ask - 0.2, {from: 'd', dist: 60})} style={{left: 600, top: 910}}>
        <Chip text="ASK GEMINI: DID GOOGLE AI MAKE THIS?" col={C.ink2} size={26} />
      </Layer>
    </AbsoluteFill>
  );
};

export const R4Video: React.FC = () => {
  const {t, ww, L} = useT();
  const u = ww('ultra', L(3) + 4);
  const pr = clamp((t - 0.5) / 5);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 360, top: 160, width: 1200, height: 675, borderRadius: 24, overflow: 'hidden', background: `linear-gradient(${120 + t * 8}deg, #1b2a4a 0%, #4E8DF5 50%, #8E73E8 100%)`, boxShadow: '0 40px 90px rgba(0,0,0,.6)'}}>
        <div style={{position: 'absolute', left: 30, right: 30, bottom: 30, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.25)'}}><div style={{height: 8, borderRadius: 4, width: `${pr * 100}%`, background: '#fff'}} /></div>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 120, height: 120, marginLeft: -60, marginTop: -60, borderRadius: 60, background: 'rgba(0,0,0,.35)', display: 'grid', placeItems: 'center'}}><Icon name="play" size={60} color="#fff" fill="#fff" /></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center', gap: 24}}>
        <div style={{opacity: p01(t, 0.4, 0.3)}}><Chip text="AI PLUS & PRO · SHORT VIDEOS" col={BR.gemini.hi} size={26} /></div>
        <div style={{opacity: p01(t, u - 0.2, 0.3)}}><Chip text="ULTRA · FULL VEO 3.1" col={BR.gemini.hi} size={26} solid /></div>
      </div>
    </AbsoluteFill>
  );
};

export const R4Rest: React.FC = () => {
  const {t, ww, L} = useT();
  const g = L(4), c = L(5);
  const no = ww('pictures', L(6) + 1);
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(g - 0.3, {from: 'l', dist: 100})} style={{left: 140, top: 200}}>
        <Glass w={760} pad={40} col={BR.gpt.col}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}><Logo b="gpt" size={60} /><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 56}}>Images on every plan</span></div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 26, marginTop: 40, height: 240}}>
            {[{l: 'FREE', v: 0.25}, {l: 'GO', v: 0.45}, {l: 'PLUS', v: 0.65}, {l: 'PRO', v: 1}].map((x, k) => (
              <div key={x.l} style={{flex: 1, textAlign: 'center'}}>
                <div style={{height: 200 * x.v * p01(t, g + 0.6 + k * 0.4, 0.6), borderRadius: 10, background: `linear-gradient(180deg, ${BR.gpt.hi}, ${BR.gpt.col})`}} />
                <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink2, marginTop: 10}}>{x.l}</div>
              </div>
            ))}
          </div>
        </Glass>
      </Layer>
      <Layer t={t} at={enter(c - 0.3, {from: 'r', dist: 100})} style={{left: 1000, top: 200}}>
        <Glass w={780} pad={40} col={BR.claude.col}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}><Logo b="claude" size={60} /><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 56}}>Claude's plans list</span></div>
          <div style={{position: 'relative', height: 250, marginTop: 30}}>
            <List t={t} x={0} y={0} w={700} size={32} col={BR.claude.hi} gap={12} items={[
              {text: 'Designs, slides, docs', at: ww('designs', c + 2.5), icon: 'layers'},
              {text: 'Artifacts', at: ww('artifacts', c + 4), icon: 'doc'},
              {text: 'Photo or video generation', at: ww('photo', c + 5.5), no: true},
            ]} />
          </div>
        </Glass>
      </Layer>
      <div style={{position: 'absolute', left: 1000, top: 860, opacity: p01(t, no - 0.2, 0.3)}}><Chip text="NEED PICTURES? NOT CLAUDE" col={C.red} size={26} /></div>
    </AbsoluteFill>
  );
};

export const R4Try: React.FC = () => {
  const {t, ww, L} = useT();
  const chk = ww('check', L(8) + 0.5);
  return (
    <TryShot b="gemini" type={CUES.R4Try.type} side={['Bake sale poster', 'Logo ideas', 'Birthday card']} answer={(p) => (
      <div style={{width: 420, height: 520, borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(180deg, #FCE3C8 0%, #F6B98B 100%)', opacity: p, transform: `scale(${lerp(0.9, 1, p)})`, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,.5)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 64, color: '#7A2E1D', letterSpacing: '-0.02em'}}>BAKE SALE</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: '#9C4A2E'}}>Saturday · 10 AM</div>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{position: 'absolute', left: 70 + k * 100, top: 260}}>
            <div style={{width: 90, height: 60, borderRadius: '45px 45px 10px 10px', background: ['#F48FB1', '#FFF59D', '#CE93D8'][k]}} />
            <div style={{width: 74, height: 60, marginLeft: 8, background: '#C98A5A', clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)'}} />
          </div>
        ))}
      </div>
    )} extra={
      <div style={{position: 'absolute', left: 0, right: 0, top: 940, textAlign: 'center'}}>
        <Stamp t={t} at={chk} text="CHECK THE TEXT BEFORE YOU PRINT" col={ACC} icon="eye" rot={0} size={28} />
      </div>
    } />
  );
};

export const V4: React.FC = () => {
  const {t, dur} = useT();
  return <Verdict t={t} dur={dur} n="4" win={['gemini']} label="Images, text inside images, and *video*" />;
};

// ---------------------------------------------------------------- round 5
export const R5Cc: React.FC = () => {
  const {t, ww, L} = useT();
  const s = L(1);
  const ops = [{l: 'Read src/app.ts', at: ww('reads', s + 3)}, {l: 'Edit 3 files', at: ww('changes', s + 4.5)}, {l: 'Run npm test ✓', at: ww('runs', s + 5.5)}];
  const pro = ww('pro', L(2) + 1.5);
  const api = L(3);
  return (
    <AbsoluteFill>
      <RoundIntro t={t} until={L(1)} items={[{icon: 'code', label: 'Not a developer?', at: ww('developer', 3)}, {icon: 'wand', label: 'AI builds tools for you', at: ww('build', 4.5)}]} />
      <After t={t} at={L(1)}>
      <div style={{position: 'absolute', left: 140, top: 160}}>
        <div style={{width: 1000, borderRadius: 20, overflow: 'hidden', background: '#141413', boxShadow: '0 0 0 1.5px rgba(255,255,255,.1), 0 40px 90px rgba(0,0,0,.7)', fontFamily: F.mono}}>
          <div style={{height: 50, background: '#1F1E1D', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px'}}>{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />)}<span style={{marginLeft: 14, color: '#8C877E', fontSize: 18}}>Terminal · Claude Code</span></div>
          <div style={{padding: 30, fontSize: 28, lineHeight: 1.7}}>
            <div style={{color: BR.claude.hi}}>✻ Claude Code</div>
            {ops.map((o) => <div key={o.l} style={{opacity: p01(t, o.at - 0.2, 0.3), color: '#EDE9E0'}}><span style={{color: BR.claude.col}}>●</span> {o.l}</div>)}
            <div style={{opacity: p01(t, ops[2].at + 0.6, 0.3), color: '#8C877E'}}>Approve changes? (y/n)</div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 1240, top: 200, display: 'flex', flexDirection: 'column', gap: 24}}>
        <div style={{opacity: p01(t, pro - 0.2, 0.3)}}><Chip text="FROM PRO · $20" col={BR.claude.hi} size={30} solid /></div>
        <div style={{opacity: p01(t, pro + 0.5, 0.3)}}><Chip text="NOT ON FREE" col={C.red} size={28} /></div>
        <Layer t={t} at={enter(api, {from: 'r', dist: 80})} style={{position: 'relative'}}>
          <Glass w={540} pad={30} col={BR.claude.col}>
            <div style={{fontFamily: F.mono, fontSize: 22, color: BR.claude.hi}}>OCT 7</div>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 44, marginTop: 8}}>Monthly API credits</div>
            <div style={{fontFamily: F.ui, fontSize: 26, color: C.ink2, marginTop: 6}}>Max and Team plans</div>
          </Glass>
        </Layer>
      </div>
    </After>
    </AbsoluteFill>
  );
};

export const R5Codex: React.FC = () => {
  const {t, ww, L} = useT();
  const pred = L(5);
  const tab = ww('tab', pred + 7.5);
  const ghost = 'Now add a test for the login page';
  return (
    <AbsoluteFill>
      <BrandSide t={t} b="gpt" plan="CODEX" x={140} y={250} />
      <List t={t} x={760} y={240} w={900} size={38} col={BR.gpt.hi} items={[{text: 'In ChatGPT plans', at: ww('included', L(4) + 2), icon: 'check'}, {text: 'More on Plus · most on Pro', at: ww('most', L(4) + 4), icon: 'gauge'}]} />
      <Layer t={t} at={enter(pred, {from: 'd', dist: 80})} style={{left: 760, top: 520}}>
        <Glass w={1000} pad={30} col={BR.gpt.col}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{fontFamily: F.mono, fontSize: 22, color: BR.gpt.hi}}>OCT 9 · COMPOSER PREDICTIONS · BETA · PRO</span>
          </div>
          <div style={{marginTop: 20, padding: '22px 26px', borderRadius: 18, background: '#2A2A2A', fontSize: 30, fontFamily: F.ui}}>
            <span style={{color: t > tab ? '#ECECEC' : 'rgba(236,236,236,.35)'}}>{ghost}</span>
            {t <= tab && <span style={{marginLeft: 16, padding: '4px 12px', borderRadius: 8, background: 'rgba(255,255,255,.12)', fontFamily: F.mono, fontSize: 20}}>Tab</span>}
          </div>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

export const R5Jules: React.FC = () => {
  const {t, ww, L} = useT();
  const all = L(7);
  return (
    <AbsoluteFill>
      <Layer t={t} at={enter(0.1, {from: 'l', dist: 100})} style={{left: 160, top: 180}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}><Logo b="gemini" size={70} /><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 70}}>Google</span></div>
      </Layer>
      <div style={{position: 'absolute', left: 160, top: 330, display: 'flex', gap: 30}}>
        {[{l: 'Jules', s: 'CODING AGENT · HIGHER LIMITS ON AI PRO', at: ww('jules', 1)}, {l: 'Antigravity', s: 'CODING APP', at: ww('antigravity', 4)}].map((x) => (
          <Layer key={x.l} t={t} at={enter(x.at - 0.3, {from: 'd', dist: 80})} style={{position: 'relative'}}>
            <Glass w={760} pad={34} col={BR.gemini.col}>
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 64}}>{x.l}</div>
              <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink3, marginTop: 8}}>{x.s}</div>
            </Glass>
          </Layer>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, opacity: p01(t, all - 0.2, 0.4)}}>
        <Head t={t} at={all} text="All three write & explain code, *free*" y={0} size={60} />
        <div style={{display: 'flex', justifyContent: 'center', gap: 40, marginTop: 120}}>{(['gpt', 'claude', 'gemini'] as B[]).map((b, k) => <div key={b} style={{opacity: p01(t, all + 0.4 + k * 0.12, 0.3)}}><Tile b={b} size={110} /></div>)}</div>
      </div>
    </AbsoluteFill>
  );
};

export const R5Try: React.FC = () => {
  const {t, ww, L} = useT();
  const gpt = ww('interactive', L(9) + 4);
  const gem = ww('canvas', L(9) + 7);
  const calc = (b: B, p: number) => (
    <div style={{width: 380, borderRadius: 16, background: BR[b].app.card, padding: 22, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, boxShadow: `inset 0 0 0 1px ${BR[b].app.line}`, color: BR[b].app.text}}>
      <div style={{fontWeight: 700, fontSize: 22}}>Tip calculator</div>
      {['Bill', 'Tip %', 'People'].map((r, k) => <div key={r} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${BR[b].app.line}`, fontSize: 18}}><span style={{color: BR[b].app.text2}}>{r}</span><span>{['$84.00', '18%', '3'][k]}</span></div>)}
      <div style={{marginTop: 10, padding: 14, borderRadius: 12, background: `${BR[b].col}22`, display: 'flex', justifyContent: 'space-between', fontSize: 20}}><span>Each</span><b>$33.04</b></div>
    </div>
  );
  return (
    <TryShot b="claude" type={CUES.R5Try.type} side={['Tip calculator', 'Budget tracker', 'Q4 plan']} answer={(p) => calc('claude', p)} extra={
      <div style={{position: 'absolute', right: 70, top: 300, display: 'flex', flexDirection: 'column', gap: 24}}>
        <div style={{opacity: p01(t, gpt - 0.3, 0.4), transform: 'scale(0.8)', transformOrigin: '100% 0'}}><Win b="gpt" w={440} title="ChatGPT · interactive answer">{calc('gpt', 1)}</Win></div>
        <div style={{opacity: p01(t, gem - 0.3, 0.4), transform: 'scale(0.8)', transformOrigin: '100% 0'}}><Win b="gemini" w={440} title="Gemini · Canvas">{calc('gemini', 1)}</Win></div>
      </div>
    } />
  );
};

export const V5: React.FC = () => {
  const {t, dur, L} = useT();
  return <Verdict t={t} dur={dur} n="5" win={['claude']} label="Claude Code from *$20*" also={[{b: 'gpt', at: L(1), label: 'Codex is right there if you pay'}]} />;
};

export {AText, Kicker, PROMPTS};
