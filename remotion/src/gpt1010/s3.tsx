// Part 1 · Try Intelligent UI (tutorial): ChatGPT on the laptop, prompts typed in sync with the
// voice, and the answers it builds (bill splitter, bike explorer, road-trip map).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from './design';
import {AText, At, Draw, E, Layer, bounce, clamp, enter, p01} from './ae';
import {useS} from './timing';
import {screenToFrame} from './laptop';
import {AppShot} from './shot';
import {Asst, ChatGPT, G, GEO, ScreenCursor, Status, UserMsg, typedAt} from './app';
import {BIKE, BILL, BikeExplorer, BillSplitter, MAP, RouteMap} from './widgets';
import {CUES} from './cues';
import {Callout, Glass, Icon, StepBadge} from './ui';
import {Cursor} from '../tutorial/kit';
import {cursorAt} from '../tutorial/timeline';
import {FPS} from './design';

const Badge: React.FC<{t: number; at: number; n: number; label: string; out?: number}> = (p) => (
  <div style={{position: 'absolute', right: 60, top: 54}}>
    <StepBadge {...p} />
  </div>
);

/** Cursor in frame space (bigger than the on-screen one). keys: [t, x, y, click?] */
export const FrameCursor: React.FC<{t: number; keys: [number, number, number, boolean?][]; scale?: number}> = ({t, keys, scale = 1.7}) => {
  if (t < keys[0][0]) return null;
  const ks = keys.map(([tt, x, y, c]) => ({f: tt * FPS, x: x / scale, y: y / scale, click: c, dur: 34}));
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${scale})`, transformOrigin: '0 0', zIndex: 80}}>
      <Cursor c={cursorAt(ks, t * FPS)} />
    </div>
  );
};

const compFocus = (z: number): [number, number, number] => [z, GEO.cx, GEO.midY - 30];
const Hello: React.FC<{o?: number}> = ({o = 1}) => (
  <div style={{position: 'absolute', left: GEO.colX, width: GEO.colW, top: GEO.helloY, textAlign: 'center', fontSize: 30, fontWeight: 500, color: G.text, opacity: o}}>What can I help with?</div>
);

// ---------- 3.0–3.1 "Here's how to try it. Step one. Open ChatGPT and make sure you are in the Chat tab."
export const TryOpen: React.FC = () => {
  const {t, w, L, loc, dur} = useS();
  const tTab = loc(CUES.TryOpen.tab);
  const tab = GEO.chatTab;
  return (
    <AppShot
      t={t}
      swing={-26}
      cam={[[0, 0.84, 756, 472], [1.0, 1, 756, 472], [Math.max(1.2, L(1) + 0.2), 1, 756, 472], [L(1) + 1.2, 1.9, tab.x, tab.y + 200], [dur, 1.95, tab.x, tab.y + 200]]}
      screen={() => (
        <ChatGPT
          cursor={<ScreenCursor t={t} keys={[[L(1) + 0.3, tab.x + 220, tab.y + 330], [tTab, tab.x - 6, tab.y + 2, true], [dur, tab.x + 2, tab.y + 10]]} />}
          t={t}
          tabHi={p01(t, tTab, 0.3)}
          composer={{caret: true, mid: 1}}
          thread={
            <>
              <Hello />
            </>
          }
          overlay={null}
        />
      )}
      over={(rig) => {
        const f = screenToFrame(rig, tab.x + 44, tab.y);
        return (
          <>
            <Badge t={t} at={L(1) - 0.1} n={1} label="Open the Chat tab" />
            <Callout t={t} at={tTab + 0.15} x={f.x + 20} y={f.y} dx={180} dy={90} label="Chat tab" sub="GPT-6 lives here" />
            <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(60% 50% at 50% 42%, rgba(6,8,8,.85), rgba(6,8,8,.4))', opacity: 1 - p01(t, L(1) - 0.3, 0.3)}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: 1 - p01(t, L(1) - 0.3, 0.3)}}>
              <AText t={t} text="Here's how to *try it*" at={0.05} size={96} by="word" />
            </div>
          </>
        );
      }}
    />
  );
};

// ---------- 3.2–3.3 "Step two. Ask for a tool, not an essay… Step three. Use what it builds."
export const TryBill: React.FC = () => {
  const {t, w, L, loc, dur} = useS();
  const c = CUES.TryBill;
  const tA = loc(c.type.at);
  const tE = loc(c.type.enter);
  const tPlus = loc(c.plus);
  const tTip = loc(c.tip);
  const Y = GEO.threadY;
  const wy = Y + 92;
  const pW = p01(t, tE + 1.0, 0.9);
  const tab = GEO.chatTab;
  const plus = {x: GEO.colX + BILL.plus.x, y: wy + BILL.plus.y};
  const tip = {x: GEO.colX + BILL.tip[1].x, y: wy + BILL.tip[1].y};
  return (
    <AppShot
      t={t}
      cam={[[0, 1.95, tab.x, tab.y + 200], [Math.max(0.5, tA - 0.2), ...compFocus(1.75)], [tE + 0.1, ...compFocus(1.75)], [tE + 0.8, 1.55, GEO.cx, wy + 190], [L(3), 1.55, GEO.cx, wy + 190], [L(3) + 0.8, 1.8, GEO.colX + 360, wy + 200], [dur, 1.82, GEO.colX + 360, wy + 200]]}
      screen={() => (
        <ChatGPT
          cursor={<ScreenCursor t={t} keys={[[L(3), plus.x + 160, plus.y + 220], [tPlus, plus.x, plus.y, true], [tTip, tip.x, tip.y, true], [dur, tip.x + 14, tip.y + 30]]} />}
          t={t}
          tabHi={1}
          composer={{text: t < tE ? typedAt(c.type.text, tA, tE, t) : '', caret: true, hot: p01(t, tA - 0.3, 0.3) * (1 - p01(t, tE, 0.3)), mid: 1 - p01(t, tE, 0.45, E.inOut)}}
          thread={
            <>
              <Hello o={t < tE ? 1 : 0} />
              <UserMsg y={Y} text={c.type.text} p={p01(t, tE, 0.35)} />
              {t > tE + 0.2 && t < tE + 1.1 && (
                <Asst y={wy}>
                  <Status t={t} label="Building a bill splitter" icon="sparkle" />
                </Asst>
              )}
              <Asst y={wy} p={pW}>
                <BillSplitter t={t} p={pW} prevPeople={5} people={6} changeAt={tPlus} tip={10} tipAt={tTip} />
              </Asst>
            </>
          }
        />
      )}
      over={(rig) => {
        const r = screenToFrame(rig, GEO.colX + BILL.w - 30, wy + 300);
        return (
          <>
            <Badge t={t} at={0} n={2} label="Ask for a tool" out={L(3) - 0.3} />
            <Badge t={t} at={L(3) - 0.1} n={3} label="Use what it builds" />
            <Layer t={t} at={enter(w('essay') - 0.1, {from: 'l', dist: 80, out: tE + 0.6})} style={{left: 110, top: 300}}>
              <Glass pad={28} style={{width: 420}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.ui, fontWeight: 700, fontSize: 34}}>
                  <Icon name="check" size={38} color={C.accHi} width={2.6} /> a tool
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.ui, fontWeight: 700, fontSize: 34, color: C.ink3, marginTop: 16}}>
                  <Icon name="x" size={38} color={C.red} width={2.6} /> <s>an essay</s>
                </div>
              </Glass>
            </Layer>
            <Callout t={t} at={tPlus + 0.35} x={r.x} y={r.y} dx={130} dy={-40} label="Updates instantly" sub="6 people · then +10% tip" />
          </>
        );
      }}
    />
  );
};

/** One "try it" laptop shot: new chat, type the prompt, the answer builds below the bubble. */
const TryShot: React.FC<{
  n: number;
  label: string;
  type: {text: string; at: number; enter: number};
  wy: number;
  wh: number;
  widget: (t: number, p: number, tE: number) => React.ReactNode;
  status: string;
  cursor?: (tE: number) => [number, number, number, boolean?][] | null;
  over?: (rig: Parameters<typeof screenToFrame>[0], tE: number) => React.ReactNode;
}> = ({n, label, type, wy, wh, widget, status, cursor, over}) => {
  const {t, loc, dur} = useS();
  const tA = loc(type.at);
  const tE = loc(type.enter);
  const pW = p01(t, tE + 0.75, 0.8);
  const ks = cursor?.(tE);
  return (
    <AppShot
      t={t}
      cam={[[0, ...compFocus(1.75)], [tE + 0.1, ...compFocus(1.75)], [tE + 0.8, 1.5, GEO.cx, wy + wh / 2 - 10], [dur, 1.54, GEO.cx, wy + wh / 2 - 10]]}
      screen={() => (
        <ChatGPT
          cursor={ks && <ScreenCursor t={t} keys={ks} />}
          t={t}
          tabHi={1}
          composer={{text: t < tE ? typedAt(type.text, tA, tE, t) : '', caret: true, hot: p01(t, tA - 0.3, 0.3) * (1 - p01(t, tE, 0.3)), mid: 1 - p01(t, tE, 0.45, E.inOut)}}
          thread={
            <>
              <Hello o={t < tE ? 1 : 0} />
              <UserMsg y={GEO.threadY} text={type.text} p={p01(t, tE, 0.35)} />
              {t > tE + 0.2 && t < tE + 0.85 && (
                <Asst y={wy}>
                  <Status t={t} label={status} icon="sparkle" />
                </Asst>
              )}
              <Asst y={wy} p={pW}>
                {widget(t, pW, tE)}
              </Asst>
            </>
          }
        />
      )}
      over={(rig) => (
        <>
          <Badge t={t} at={0.1} n={n} label={label} />
          {over?.(rig, tE)}
        </>
      )}
    />
  );
};

// ---------- 3.4 "Step four. Now try a learning question… a seven-speed bike into five systems you can tap through."
export const TryBike: React.FC = () => {
  const {loc} = useS();
  const c = CUES.TryBike;
  const taps = c.tabs.map(loc);
  const wy = GEO.threadY + 70;
  const tabPt = (i: number) => ({x: GEO.colX + BIKE.tab(i).x, y: wy + BIKE.tab(i).y});
  return (
    <TryShot
      n={4}
      label="Ask a learning question"
      type={c.type}
      wy={wy}
      wh={BIKE.h}
      status="Drawing the parts"
      widget={(t, p) => <BikeExplorer t={t} p={p} tab={taps.filter((x) => t >= x).length} tabAt={[0, ...taps].filter((x) => t >= x).pop()} />}
      cursor={() => [[taps[0] - 0.4, tabPt(0).x, tabPt(0).y + 120], ...taps.map((x, i): [number, number, number, boolean] => [x, tabPt(i + 1).x, tabPt(i + 1).y, true]), [taps[3] + 1.5, tabPt(4).x + 10, tabPt(4).y + 20]]}
    />
  );
};

// ---------- 3.5 "Step five. Try a plan. OpenAI says road trip stops can appear on a map."
export const TryMap: React.FC = () => {
  const {t, w} = useS();
  const c = CUES.TryMap;
  const wy = GEO.threadY + 96;
  return (
    <TryShot
      n={5}
      label="Try a plan"
      type={c.type}
      wy={wy}
      wh={MAP.h}
      status="Mapping the stops"
      widget={(tt, p, tE) => <RouteMap t={tt} p={p} at={tE + 1.0} />}
      over={(rig) => {
        const f = screenToFrame(rig, GEO.colX + 330, wy + 58 + 352 - 24);
        return <Callout t={t} at={w('map') - 0.1} x={f.x} y={f.y} dx={-200} dy={60} label="Stops on a map" sub="example route" />;
      }}
    />
  );
};

// ---------- 3.6 "Two tips. First, ChatGPT chooses the format…"
export const TipFormat: React.FC = () => {
  const {t, w} = useS();
  const rows = [
    {at: w('judged') - 0.3, icon: 'doc', text: 'Text may be the best answer'},
    {at: w('rollout') - 0.3, icon: 'hourglass', text: "The rollout hasn't reached you yet"},
  ];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.3em', color: C.accHi, opacity: p01(t, w('tips') - 0.2, 0.3)}}>TIP 1 OF 2</div>
        <AText t={t} text="ChatGPT *chooses* the format" at={w('chooses') - 0.25} size={84} by="word" style={{marginTop: 16}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center'}}>
        <Layer t={t} at={enter(w('plain') - 0.2, {from: 'd', dist: 60})}>
          <div style={{padding: '18px 34px', borderRadius: 22, background: '#303030', fontFamily: F.ui, fontSize: 34, fontWeight: 600, display: 'flex', gap: 16, alignItems: 'center'}}>
            Got plain text?
            <Icon name="doc" size={38} color={C.ink2} />
          </div>
        </Layer>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center', gap: 50}}>
        {rows.map((r, i) => (
          <Layer key={i} t={t} at={enter(r.at, {from: i ? 'r' : 'l', dist: 140})}>
            <Glass w={640} h={230} pad={36}>
              <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.24em', color: C.ink3}}>{i === 0 ? 'MAYBE' : 'OR'}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 22}}>
                <Icon name={r.icon} size={64} color={i ? C.amber : C.accHi} p={p01(t, r.at + 0.1, 0.7, E.inOut)} />
                <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 36, lineHeight: 1.2}}>{r.text}</div>
              </div>
            </Glass>
          </Layer>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3.7 "Second, Intelligent UI works from Instant up to Extra High reasoning. The Pro reasoning option does not support it…"
export const TipReasoning: React.FC = () => {
  const {t, w, loc, dur} = useS();
  const tIn = w('instant');
  const tXh = w('extra');
  const tPro = w('pro');
  const tOpen = loc(CUES.TipReasoning.open);
  const tPick = loc(CUES.TipReasoning.pick);
  const fill = p01(t, tIn, Math.max(0.4, tXh - tIn + 0.4), E.inOut);
  const sel = t >= tPick ? 'xh' : t >= tOpen ? 'pro' : 'none';
  const proX = 1520;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center'}}>
        <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.3em', color: C.accHi, opacity: p01(t, 0, 0.3)}}>TIP 2 OF 2</div>
        <AText t={t} text="Check your *reasoning level*" at={0.05} size={80} by="word" style={{marginTop: 16}} />
      </div>
      {/* the supported span */}
      <div style={{position: 'absolute', left: 200, top: 430, width: 1080}}>
        <div style={{height: 22, borderRadius: 11, background: 'rgba(255,255,255,.07)', overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${fill * 100}%`, borderRadius: 11, background: `linear-gradient(90deg, ${C.accDeep}, ${C.acc})`, boxShadow: '0 0 30px rgba(16,163,127,.5)'}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 26}}>
          {[['Instant', tIn], ['Extra High', tXh]].map(([n, a], i) => (
            <div key={n as string} style={{transform: `scale(${bounce(t, (a as number) - 0.1, 12, 220)})`, transformOrigin: i ? '100% 0' : '0 0'}}>
              <div style={{padding: '16px 30px', borderRadius: 18, fontFamily: F.ui, fontWeight: 700, fontSize: 34, background: i === 1 && sel === 'xh' ? C.acc : 'rgba(255,255,255,.08)', boxShadow: '0 0 0 1.5px rgba(255,255,255,.14)'}}>{n}</div>
            </div>
          ))}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 40, fontFamily: F.ui, fontWeight: 650, fontSize: 32, opacity: p01(t, tXh + 0.4, 0.3)}}>
          <Icon name="check" size={38} color={C.accHi} width={2.8} /> Intelligent UI works across this range
        </div>
      </div>
      {/* Pro: not supported */}
      <At x={proX} y={520}>
        <Layer t={t} at={enter(tPro - 0.15, {from: 'r', dist: 120})} style={{position: 'relative'}}>
          <div style={{position: 'relative', padding: '22px 40px', borderRadius: 20, fontFamily: F.ui, fontWeight: 800, fontSize: 40, background: sel === 'pro' ? 'rgba(240,106,90,.2)' : 'rgba(255,255,255,.06)', boxShadow: `0 0 0 2px ${C.red}`, color: sel === 'xh' ? C.ink3 : C.ink, whiteSpace: 'nowrap'}}>
            Pro reasoning
            <svg width={340} height={100} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <Draw t={t} d="M20 70 L300 20" at={w('support') - 0.1} dur={0.3} stroke={C.red} width={6} />
            </svg>
          </div>
          <div style={{textAlign: 'center', marginTop: 18, fontFamily: F.mono, fontSize: 22, letterSpacing: '0.16em', color: C.red, opacity: p01(t, w('support'), 0.3)}}>NOT SUPPORTED</div>
        </Layer>
      </At>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <Draw t={t} d="M1420 600 C 1380 700, 1250 700, 1200 560" at={w('switch') - 0.1} dur={0.6} stroke={C.accHi} width={5} />
        <Draw t={t} d="M1186 586 L1200 556 L1226 576" at={w('switch') + 0.4} dur={0.2} stroke={C.accHi} width={5} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', opacity: p01(t, w('switch') - 0.1, 0.3)}}>
        <span style={{fontFamily: F.ui, fontWeight: 700, fontSize: 40}}>Using Pro? <span style={{color: C.accHi}}>Switch levels first.</span></span>
      </div>
      <FrameCursor t={t} keys={[[tOpen - 0.8, 1640, 760], [tOpen, proX, 520, true], [tPick, 1180, 520, true], [dur, 1190, 540]]} />
    </AbsoluteFill>
  );
};

export {clamp};
