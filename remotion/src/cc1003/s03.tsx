// Part 1 · Build your first mod (tutorial on the laptop).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, R} from './design';
import {AText, At, Count, Draw, E, Key, Layer, bounce, clamp, enter, kf, lerp, p01, tw} from './ae';
import {useS} from './timing';
import {LaptopRig, TERM, screenToFrame} from './laptop';
import {Terminal, TEntry, TCmd, typedAt} from './terminal';
import {Callout, CmdCard, Glass, Icon, IconTile, Keycap, StepBadge} from './ui';

const LYDIA = 'create a mod that draws my context window as a stacked bar above the prompt, one color per category like /context, toggled with /context-bar';

// The stacked context bar Lydia's mod draws above the prompt.
export const CONTEXT_CATS: [string, string, number][] = [
  ['System prompt', '#8E8A85', 0.08],
  ['System tools', '#7FA7E8', 0.14],
  ['Memory files', '#B9A3E8', 0.06],
  ['Messages', '#D97757', 0.27],
  ['Free space', 'rgba(255,255,255,.08)', 0.45],
];
export const ContextBar: React.FC<{t: number; at: number; off?: number; legend?: boolean}> = ({t, at, off, legend = true}) => {
  const pin = p01(t, at, 0.5);
  const pout = off === undefined ? 0 : p01(t, off, 0.3, E.in);
  const show = pin * (1 - pout);
  if (show <= 0) return null;
  let acc = 0;
  return (
    <div style={{marginBottom: 12, opacity: clamp(show * 2), transform: `scaleY(${lerp(0.3, 1, show)})`, transformOrigin: 'bottom'}}>
      <div style={{display: 'flex', height: 18, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,.05)'}}>
        {CONTEXT_CATS.map(([n, c, v], i) => {
          const p = p01(t, at + 0.1 + i * 0.08, 0.45);
          acc += v;
          return <div key={n} style={{width: `${v * 100 * p}%`, background: c}} />;
        })}
      </div>
      {legend && (
        <div style={{display: 'flex', gap: 22, fontSize: 14, color: C.ink3, marginTop: 6}}>
          {CONTEXT_CATS.map(([n, c, v]) => (
            <span key={n}>
              <span style={{display: 'inline-block', width: 10, height: 10, background: c, borderRadius: 2, marginRight: 6, boxShadow: `inset 0 0 0 1px ${C.line2}`}} />
              {n} {Math.round(v * 100)}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const BuildMod: React.FC = () => {
  const {t, w, L, Le, dur} = useS();
  // ---- timeline keyed to the voice
  const s1 = w('step', 0), s2 = w('step', 1), s3 = w('step', 2), s4 = w('step', 3);
  const vType = w('make');
  const vEnter = w('two', 0) - 0.15;
  const launch = L(3) - 0.55; // `claude` typed and launched between step one and step two
  const lyd = w('asked');
  const lydEnter = w('work', 1) - 0.1;
  const tWrites = w('writes');
  const tLoads = w('loads');
  const cb1 = w('type', 0);
  const cb1Enter = w('colored') - 0.15;
  const cb2 = w('again') - 0.75;
  const cb2Enter = w('hide') - 0.05;

  const shellCmds: TCmd[] = [
    {text: 'claude --version', at: vType, enter: vEnter, shell: true},
    {text: 'claude', at: launch - 0.55, enter: launch, shell: true},
  ];
  const shellEntries: TEntry[] = [{at: vEnter + 0.25, kind: 'out', text: '2.1.287 (Claude Code)'}];
  const cmds: TCmd[] = [
    {text: LYDIA, at: lyd, enter: lydEnter},
    {text: '/context-bar', at: cb1, enter: cb1Enter},
    {text: '/context-bar', at: cb2, enter: cb2Enter},
  ];
  const entries: TEntry[] = [
    {at: lydEnter + 0.2, kind: 'spin', text: 'Writing the mod', until: tWrites},
    {at: tWrites, kind: 'tool', name: 'Write', arg: 'mods/context-bar.ts', lines: ['Created a context-bar mod in your plugin']},
    {at: tLoads, kind: 'ok', text: 'Mod loaded into this session · new command: /context-bar'},
  ];
  const barOn = cb1Enter + 0.2;
  const barOff = cb2Enter + 0.1;
  const claudeOn = t >= launch;

  // ---- camera. Framing helpers: keep the terminal's left text edge at 140 px, and put a
  // given screen row at a chosen height of the frame.
  const fxL = (z: number) => 122 + 820 / (0.8677 * z);
  const fyAt = (z: number, sy: number, frac: number) => sy - (frac * 1080 - 540) / (0.8677 * z);
  const rk = (keys: Key[]) => kf(t, keys);
  type CK = {t: number; z: number; x: number; y: number};
  const CAM: CK[] = [
    {t: 0, z: 0.72, x: 756, y: 472},
    {t: 1.2, z: 1, x: 756, y: 472},
    {t: vType - 0.1, z: 1, x: 756, y: 472},
    {t: vType + 0.45, z: 2.2, x: fxL(2.2), y: fyAt(2.2, 150, 0.42)},
    {t: L(2) - 0.1, z: 2.2, x: fxL(2.2), y: fyAt(2.2, 150, 0.42)},
    {t: L(2) + 0.5, z: 1, x: 756, y: 472},
    {t: L(3) + 0.1, z: 1, x: 756, y: 472},
    {t: L(3) + 0.7, z: 1.8, x: fxL(1.8), y: fyAt(1.8, 285, 0.5)},
    {t: L(4) - 0.1, z: 1.8, x: fxL(1.8), y: fyAt(1.8, 285, 0.5)},
    {t: L(4) + 0.5, z: 1, x: 756, y: 472},
    {t: lyd - 0.2, z: 1, x: 756, y: 472},
    {t: lyd + 0.4, z: 1.7, x: fxL(1.7), y: fyAt(1.7, 300, 0.42)},
    {t: lydEnter + 0.1, z: 1.7, x: fxL(1.7), y: fyAt(1.7, 300, 0.42)},
    {t: lydEnter + 0.6, z: 1.55, x: fxL(1.55), y: fyAt(1.55, 390, 0.45)},
    {t: tLoads, z: 1.55, x: fxL(1.55), y: fyAt(1.55, 430, 0.45)},
    {t: cb1 - 0.3, z: 1.55, x: fxL(1.55), y: fyAt(1.55, 430, 0.45)},
    {t: cb1 + 0.3, z: 1.8, x: fxL(1.8), y: fyAt(1.8, 500, 0.5)},
    {t: barOn + 0.4, z: 1.8, x: fxL(1.8), y: fyAt(1.8, 515, 0.5)},
  ];
  const ck = (f: (c: CK) => number) => rk(CAM.map((c, i) => (i === 0 ? [c.t, f(c)] : [c.t, f(c), E.inOut]) as Key));
  const zoom = ck((c) => c.z);
  const fx = ck((c) => c.x);
  const fy = ck((c) => c.y);
  const ry = rk([[0, -24], [1.2, 0, E.out]]);
  const slide = rk([[L(2) - 0.2, 0], [L(2) + 0.4, -250, E.inOut], [L(3) - 0.2, -250], [L(3) + 0.4, 0, E.inOut], [L(4) - 0.2, 0], [L(4) + 0.4, -300, E.inOut], [lyd - 0.3, -300], [lyd + 0.3, 0, E.inOut]]);
  const rig = {zoom, x: fx, y: fy, ry};

  // overlay helpers
  const vTyped = typedAt(shellCmds[0], t);
  const lydTyped = typedAt(cmds[0], t);
  const cbTyped = t < cb2 ? typedAt(cmds[1], t) : typedAt(cmds[2], t);
  const verPt = screenToFrame(rig, 122 + 270, 118 + 27 * 1.7);
  const barPt = screenToFrame(rig, 122 + 300, 500);
  const writePt = screenToFrame(rig, 122 + 260, 118 + 27 * 8.8);
  const loadPt = screenToFrame(rig, 122 + 470, 118 + 27 * 11.5);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${slide}px)`}}>
        <LaptopRig rig={rig} app={claudeOn ? 'Terminal — claude' : 'Terminal'}>
          <div style={{position: 'absolute', left: TERM.x, top: TERM.y, width: TERM.w, height: TERM.h}}>
            {!claudeOn ? (
              <Terminal t={t} w={TERM.w} h={TERM.h} shell cmds={shellCmds} entries={shellEntries} title="zsh — ~/my-app" />
            ) : (
              <Terminal t={t} w={TERM.w} h={TERM.h} cmds={cmds} entries={entries} aboveRows={t > barOn && t < barOff ? 2 : 0} aboveInput={<ContextBar t={t} at={barOn} off={barOff} />} />
            )}
          </div>
        </LaptopRig>
      </div>

      {/* step badges */}
      <div style={{position: 'absolute', right: 70, top: 56}}>
        <StepBadge t={t} at={s1 - 0.1} n={1} label="Check your version" out={L(3) - 0.5} />
      </div>
      <div style={{position: 'absolute', right: 70, top: 56}}>
        <StepBadge t={t} at={s2 - 0.1} n={2} label="Describe it in plain English" out={s3 - 0.5} />
      </div>
      <div style={{position: 'absolute', right: 70, top: 56}}>
        <StepBadge t={t} at={s3 - 0.1} n={3} label="Let Claude work" out={s4 - 0.5} />
      </div>
      <div style={{position: 'absolute', right: 70, top: 56}}>
        <StepBadge t={t} at={s4 - 0.1} n={4} label="Test it" />
      </div>

      {/* step 1: version */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 850, display: 'flex', justifyContent: 'center'}}>
        <CmdCard t={t} at={vType - 0.2} text="claude --version" typed={vTyped} out={L(2) - 0.3} label="IN YOUR TERMINAL" done={t > vEnter} />
      </div>
      <Callout t={t} at={vEnter + 0.45} x={verPt.x} y={verPt.y} dx={260} dy={-150} label="2.1.287 or later" sub="mods need this version" out={L(2) - 0.2} />
      {/* works in both */}
      {[['terminal', 'Terminal', w('terminal'), 1180], ['desktop', 'Desktop app', w('desktop'), 1480]].map(([ic, lb, at, x]) => (
        <div key={lb as string} style={{position: 'absolute', left: x as number, top: 300, width: 260, display: 'flex', justifyContent: 'center'}}>
          <Layer t={t} at={enter((at as number) - 0.1, {from: 'r', dist: 120, out: L(3) - 0.4})}>
            <IconTile t={t} at={at as number} name={ic as string} size={170} hot label={lb as string} />
          </Layer>
        </div>
      ))}
      <Layer t={t} at={enter(w('version', 1) - 0.1, {from: 'd', dist: 60, out: L(3) - 0.4})} style={{left: 1290, top: 640}}>
        <div style={{padding: '14px 26px', borderRadius: 999, background: 'rgba(107,203,139,.14)', boxShadow: '0 0 0 1.5px rgba(107,203,139,.6)', fontFamily: F.mono, fontSize: 30, color: C.green}}>✓ from v2.1.287 onward</div>
      </Layer>

      {/* step 2: Lydia + /context every time */}
      <Layer t={t} at={enter(w('lydias') - 0.1, {from: 'r', dist: 160, out: lyd - 0.3})} style={{left: 1190, top: 220}}>
        <Glass w={620} pad={26}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{width: 64, height: 64, borderRadius: 32, background: '#2a2b31', display: 'grid', placeItems: 'center'}}>
              <Icon name="users" size={34} color={C.ink2} />
            </div>
            <div>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 36}}>Lydia</div>
              <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.1em', color: C.orangeHi}}>CLAUDE CODE TEAM · FROM THE EMAIL</div>
            </div>
          </div>
          <div style={{marginTop: 22, fontFamily: F.ui, fontSize: 26, color: C.ink2}}>Wanted her context usage without typing</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14}}>
            <span style={{fontFamily: F.mono, fontSize: 34, color: C.orangeHi}}>/context</span>
            {[0, 1, 2].map((i) => {
              const at = w('context') + i * 0.55;
              return (
                <span key={i} style={{fontFamily: F.mono, fontSize: 24, padding: '4px 12px', borderRadius: 8, background: 'rgba(255,255,255,.08)', opacity: p01(t, at, 0.2), transform: `scale(${bounce(t, at, 12, 260)})`}}>
                  ×{i + 1}
                </span>
              );
            })}
            <span style={{fontFamily: F.ui, fontSize: 24, color: C.ink3, opacity: p01(t, w('every'), 0.3)}}>every time</span>
          </div>
        </Glass>
      </Layer>
      <div style={{position: 'absolute', left: 0, right: 0, top: 830, display: 'flex', justifyContent: 'center'}}>
        <CmdCard t={t} at={lyd - 0.2} text={LYDIA} typed={lydTyped} out={s3 + 0.6} label="LYDIA'S PROMPT, IN PLAIN ENGLISH" done={t > lydEnter} />
      </div>

      {/* step 3: callouts on the log */}
      <Callout t={t} at={tWrites + 0.2} x={writePt.x} y={writePt.y} dx={420} dy={250} label="Claude writes the mod" sub="TypeScript, inside a plugin" out={tLoads} />
      <Callout t={t} at={tLoads + 0.2} x={loadPt.x} y={loadPt.y} dx={260} dy={180} label="…and loads it into your session" sub="ready to use right away" out={cb1 - 0.4} />

      {/* step 4: /context-bar */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center'}}>
        <CmdCard t={t} at={cb1 - 0.2} text="/context-bar" typed={cbTyped} label={t < cb2 ? 'SHOW THE BAR' : 'TYPE IT AGAIN TO HIDE IT'} done={(t > cb1Enter && t < cb2) || t > cb2Enter} />
      </div>
      <Callout t={t} at={barOn + 0.35} x={barPt.x} y={barPt.y} dx={420} dy={230} label="Your context window" sub="one colour per category" out={cb2Enter} />
    </AbsoluteFill>
  );
};

// ---------- 3.8 "That's a brand new feature, built in one sentence."
export const OneSentence: React.FC = () => {
  const {t, w} = useS();
  const a = w('brand');
  const b = w('one');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 70}}>
        <Layer t={t} at={enter(b - 0.15, {from: 'l', dist: 200})}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 240, color: C.ink, lineHeight: 1}}>1</div>
            <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 40, color: C.ink2}}>sentence</div>
          </div>
        </Layer>
        <Layer t={t} at={enter(b + 0.15, {from: 'z', s0: 0.2})}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 160, color: C.orange}}>=</div>
        </Layer>
        <Layer t={t} at={enter(a - 0.1, {from: 'r', dist: 200})}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 240, color: C.orange, lineHeight: 1, textShadow: '0 0 60px rgba(217,119,87,.4)'}}>1</div>
            <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 40, color: C.ink2}}>brand-new feature</div>
          </div>
        </Layer>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3.9 "Now think about what you'd want. A shortcut … fifty times a day. A piece of UI you wish existed."
export const Ideas: React.FC = () => {
  const {t, w} = useS();
  const tThink = w('think');
  const tShort = w('shortcut');
  const tFifty = w('fifty');
  const tPiece = w('piece');
  const press = (k: number) => {
    const ph = (t - tShort - 0.3 - k * 0.11) % 0.33;
    return t > tShort + 0.3 && ph >= 0 && ph < 0.12 ? Math.sin((ph / 0.12) * Math.PI) : 0;
  };
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center'}}>
        <AText t={t} text="What would *you* build?" at={tThink - 0.1} size={84} by="word" />
      </div>
      <Layer t={t} at={enter(tShort - 0.15, {from: 'l', dist: 200})} style={{left: 180, top: 300}}>
        <Glass w={740} h={520}>
          <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.orangeHi}}>A SHORTCUT</div>
          <div style={{display: 'flex', gap: 18, marginTop: 50, justifyContent: 'center'}}>
            <Keycap label="⌘" down={press(0)} />
            <Keycap label="⇧" down={press(1)} />
            <Keycap label="K" down={press(2)} />
          </div>
          <div style={{textAlign: 'center', marginTop: 56, fontFamily: F.display, fontWeight: 900, fontSize: 96, color: C.ink}}>
            ×<Count t={t} at={tFifty - 0.2} dur={1.0} to={50} />
            <span style={{fontFamily: F.ui, fontWeight: 600, fontSize: 36, color: C.ink3}}> a day</span>
          </div>
        </Glass>
      </Layer>
      <Layer t={t} at={enter(tPiece - 0.15, {from: 'r', dist: 200})} style={{left: 1000, top: 300}}>
        <Glass w={740} h={520}>
          <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.orangeHi}}>UI YOU WISH EXISTED</div>
          <svg width={680} height={400} viewBox="0 0 680 400" style={{marginTop: 20}}>
            <Draw t={t} d="M20 30 H660 V370 H20 Z" at={tPiece} dur={0.7} stroke="rgba(244,241,236,.5)" width={3} />
            <Draw t={t} d="M20 80 H660" at={tPiece + 0.3} dur={0.4} stroke="rgba(244,241,236,.35)" width={2} />
            <Draw t={t} d="M50 120 H400" at={tPiece + 0.45} dur={0.4} stroke={C.orange} width={18} />
            <Draw t={t} d="M50 170 H560" at={tPiece + 0.55} dur={0.4} stroke="rgba(244,241,236,.35)" width={10} />
            <Draw t={t} d="M50 205 H480" at={tPiece + 0.65} dur={0.4} stroke="rgba(244,241,236,.35)" width={10} />
            <Draw t={t} d="M470 290 H620 V340 H470 Z" at={tPiece + 0.8} dur={0.5} stroke={C.orange} width={3} />
            <Draw t={t} d="M50 290 C 120 250, 180 340, 250 290 S 380 260, 420 300" at={tPiece + 0.9} dur={0.6} stroke="rgba(127,167,232,.8)" width={4} />
          </svg>
        </Glass>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- 3.10 "If you get stuck, Anthropic has sample mods on GitHub you can copy and change."
export const Samples: React.FC = () => {
  const {t, w} = useS();
  const a = w('stuck');
  const tSample = w('sample');
  const tCopy = w('copy');
  const rows = ['claude-code/', 'claude-code/mods/', 'sample mods you can copy'];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <AText t={t} text="Stuck? Start from a sample." at={a - 0.1} size={70} by="word" />
      </div>
      <Layer t={t} at={enter(tSample - 0.2, {from: 'd', dist: 160})} style={{left: 460, top: 320}}>
        <Glass w={1000} pad={0} r={R.lg} style={{overflow: 'hidden'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 30px', borderBottom: `1px solid ${C.line}`}}>
            <Icon name="branch" size={36} color={C.ink2} />
            <span style={{fontFamily: F.mono, fontSize: 28, color: C.ink2}}>anthropics / <b style={{color: C.ink}}>claude-code-playground</b></span>
          </div>
          {rows.map((r, i) => (
            <div key={r} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '22px 30px', borderBottom: i < rows.length - 1 ? `1px solid ${C.line}` : undefined, fontFamily: F.mono, fontSize: 28, color: i === 1 ? C.orangeHi : C.ink2, background: i === 1 ? 'rgba(217,119,87,.08)' : undefined, opacity: p01(t, tSample + 0.15 + i * 0.15, 0.3)}}>
              <Icon name={i < 2 ? 'layers' : 'file'} size={30} color={i === 1 ? C.orangeHi : C.ink3} />
              {r}
            </div>
          ))}
        </Glass>
      </Layer>
      <Layer t={t} at={enter(tCopy - 0.1, {from: 'r', dist: 120})} style={{left: 1320, top: 720}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 28px', borderRadius: 999, background: C.orange, color: '#1a0e09', fontFamily: F.ui, fontWeight: 800, fontSize: 32, boxShadow: '0 20px 50px -14px rgba(217,119,87,.7)'}}>
          <Icon name="copy" size={32} color="#1a0e09" width={2.4} /> Copy &amp; change
        </div>
      </Layer>
    </AbsoluteFill>
  );
};
