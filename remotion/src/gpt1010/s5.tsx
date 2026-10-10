// Part 3 · Audio uploads (explainer + tutorial: a recording to notes).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from './design';
import {AText, At, Draw, E, Layer, bounce, clamp, enter, kf, lerp, p01} from './ae';
import {useS} from './timing';
import {AppShot} from './shot';
import {Asst, ChatGPT, G, GEO, ScreenCursor, Status, UserMsg, typedAt} from './app';
import {FileChip, Wave} from './widgets';
import {CUES} from './cues';
import {CmdCard, Glass, Icon, IconTile, Ring, StepBadge} from './ui';

const FILE = {name: 'team-meeting.m4a', meta: 'Audio · 38 MB'};

// ---------- 6.0 "Part three landed on October sixth. You can now upload audio files to ChatGPT."
export const AudioDrop: React.FC = () => {
  const {t, w} = useS();
  const tUp = w('upload');
  const fly = p01(t, tUp - 0.1, 1.0, E.inOut);
  const x = lerp(560, 960, fly);
  const y = lerp(470, 760, fly) - Math.sin(Math.PI * fly) * 160;
  const s = lerp(2.2, 1.35, fly);
  const landed = t > tUp + 0.9;
  return (
    <AbsoluteFill>
      <At x={960} y={200}>
        <Layer t={t} at={enter(w('sixth') - 0.2, {from: 'd', dist: 40})} style={{position: 'relative'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 26px', borderRadius: 999, boxShadow: '0 0 0 1.5px rgba(255,255,255,.14)', fontFamily: F.ui, fontWeight: 700, fontSize: 28, whiteSpace: 'nowrap'}}>
            <Icon name="calendar" size={28} color={C.accHi} /> 6 OCT 2026
          </div>
        </Layer>
      </At>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center'}}>
        <AText t={t} text="Upload *audio* to ChatGPT" at={w('now') - 0.2} size={84} by="word" />
      </div>
      {/* composer */}
      <Layer t={t} at={enter(tUp - 0.5, {from: 'd', dist: 80})} style={{left: 460, top: 690, width: 1000}}>
        <div style={{height: 150, borderRadius: 44, background: G.comp, boxShadow: landed ? '0 0 0 3px rgba(16,163,127,.8), 0 0 50px rgba(16,163,127,.35)' : '0 0 0 1px rgba(255,255,255,.08)', position: 'relative'}}>
          <div style={{position: 'absolute', left: 34, bottom: 26, fontFamily: F.ui, fontSize: 30, color: G.text3}}>+ Ask anything</div>
        </div>
      </Layer>
      {t > 0.1 && (
        <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s}) rotate(${(1 - fly) * -6}deg)`, opacity: p01(t, w('audio') - 0.3, 0.3)}}>
          <FileChip name={FILE.name} meta={FILE.meta} w={280} p={p01(t, w('audio') - 0.2, 0.8)} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 6.1 "It can write a transcript, summarize the recording, and answer questions about it…"
export const AudioOutputs: React.FC = () => {
  const {t, w} = useS();
  const outs = [
    {at: w('transcript'), icon: 'doc', label: 'Transcript'},
    {at: w('summarize'), icon: 'list', label: 'Summary'},
    {at: w('answer'), icon: 'chat', label: 'Answers'},
  ];
  const uses = [
    {at: w('meetings'), icon: 'users', label: 'Meetings'},
    {at: w('interviews'), icon: 'mic', label: 'Interviews'},
    {at: w('lectures'), icon: 'bulb', label: 'Lectures'},
  ];
  return (
    <AbsoluteFill>
      <At x={960} y={200}>
        <Layer t={t} at={enter(0, {from: 'd', dist: 40})} style={{position: 'relative'}}>
          <FileChip name={FILE.name} meta={FILE.meta} w={300} />
        </Layer>
      </At>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {outs.map((o, i) => (
          <Draw key={i} t={t} d={`M960 250 C 960 300, ${[480, 960, 1440][i]} 290, ${[480, 960, 1440][i]} 340`} at={o.at - 0.25} dur={0.4} stroke={C.acc} width={3} />
        ))}
      </svg>
      {outs.map((o, i) => (
        <At key={o.label} x={[480, 960, 1440][i]} y={470}>
          <Layer t={t} at={enter(o.at - 0.15, {from: 'd', dist: 60})} style={{position: 'relative'}}>
            <Glass w={380} h={220} pad={30} glow={p01(t, o.at, 0.3) * (1 - p01(t, o.at + 1, 0.4))}>
              <Icon name={o.icon} size={64} color={C.accHi} p={p01(t, o.at, 0.6, E.inOut)} />
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 48, marginTop: 30}}>{o.label}</div>
            </Glass>
          </Layer>
        </At>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: F.mono, fontSize: 22, letterSpacing: '0.3em', color: C.ink3, opacity: p01(t, w('think') - 0.1, 0.3)}}>THINK</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 750, display: 'flex', justifyContent: 'center', gap: 80}}>
        {uses.map((u) => (
          <div key={u.label} style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <IconTile t={t} at={u.at - 0.1} name={u.icon} size={96} />
            <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 36, opacity: p01(t, u.at, 0.3)}}>{u.label}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6.2 "This one is for paid ChatGPT subscriptions and workspaces. It is not on the Free plan right now."
export const AudioPlans: React.FC = () => {
  const {t, w} = useS();
  const cols = [
    {at: w('paid'), ok: true, title: 'Paid plans', sub: 'subscriptions and workspaces', from: 'l' as const},
    {at: w('free'), ok: false, title: 'Free plan', sub: 'not right now', from: 'r' as const},
  ];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
        <AText t={t} text="Who can upload audio?" at={0.05} size={74} by="word" />
      </div>
      {cols.map((c, i) => {
        const b = bounce(t, c.at + 0.15, 11, 220);
        return (
          <Layer key={c.title} t={t} at={enter(c.at - 0.2, {from: c.from, dist: 200})} style={{left: i ? 1000 : 260, top: 320}}>
            <Glass w={660} h={480} pad={46} glow={c.ok ? p01(t, c.at, 0.4) : 0} style={{opacity: c.ok ? 1 : 0.85}}>
              <div style={{width: 120, height: 120, borderRadius: 60, display: 'grid', placeItems: 'center', background: c.ok ? C.acc : 'rgba(240,106,90,.18)', boxShadow: c.ok ? undefined : `0 0 0 3px ${C.red}`, transform: `scale(${b})`}}>
                <Icon name={c.ok ? 'check' : 'x'} size={70} color={c.ok ? '#fff' : C.red} width={3} />
              </div>
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 76, letterSpacing: '-0.03em', marginTop: 60}}>{c.title}</div>
              <div style={{fontFamily: F.ui, fontSize: 34, color: c.ok ? C.ink2 : C.red, marginTop: 10}}>{c.sub}</div>
            </Glass>
          </Layer>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 6.3 "Files can be up to five hundred twelve megabytes. MP3, WAV, M4A and FLAC. Files identified as video are not supported…"
export const AudioSpecs: React.FC = () => {
  const {t, w} = useS();
  const tMb = w('five');
  const fmts = [['MP3', w('m')], ['WAV', w('wave')], ['M4A', w('m', 1)], ['FLAC', w('flack')]] as [string, number][];
  const tVid = w('video');
  const v = p01(t, tMb - 0.2, 1.4, E.out);
  return (
    <AbsoluteFill>
      <At x={400} y={500}>
        <Layer t={t} at={enter(tMb - 0.4, {from: 'l', dist: 120})} style={{position: 'relative'}}>
          <Ring v={v} size={420} width={26} color={C.acc}>
            <div>
              <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.ink3}}>UP TO</div>
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 120, letterSpacing: '-0.04em', lineHeight: 1}}>{Math.round(512 * v)}</div>
              <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 40, color: C.accHi}}>MB</div>
            </div>
          </Ring>
        </Layer>
      </At>
      <div style={{position: 'absolute', left: 760, top: 300, width: 520}}>
        <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.ink3, opacity: p01(t, w('formats') - 0.2, 0.3), marginBottom: 26}}>COMMON FORMATS</div>
        <div style={{display: 'grid', gridTemplateColumns: '240px 240px', gap: 24}}>
          {fmts.map(([f, a]) => {
            const b = bounce(t, a - 0.08, 11, 240);
            return (
              <div key={f} style={{height: 120, borderRadius: 24, display: 'grid', placeItems: 'center', background: 'rgba(16,163,127,.14)', boxShadow: '0 0 0 2px rgba(16,163,127,.55)', fontFamily: F.display, fontWeight: 900, fontSize: 56, transform: `scale(${b})`, opacity: clamp(b * 3)}}>{f}</div>
            );
          })}
        </div>
      </div>
      <At x={1560} y={500}>
        <Layer t={t} at={enter(tVid - 0.3, {from: 'r', dist: 120})} style={{position: 'relative'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
            <div style={{position: 'relative', width: 200, height: 200, borderRadius: 40, background: 'rgba(240,106,90,.12)', boxShadow: `0 0 0 3px ${C.red}`, display: 'grid', placeItems: 'center'}}>
              <Icon name="video" size={110} color={C.ink2} />
              <svg width={200} height={200} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                <Draw t={t} d="M30 170 L170 30" at={w('supported') - 0.15} dur={0.3} stroke={C.red} width={10} />
              </svg>
            </div>
            <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 34, textAlign: 'center', width: 340}}>Video files not supported</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: C.accHi, opacity: p01(t, w('audioonly') - 0.2, 0.3), whiteSpace: 'nowrap'}}>
              <Icon name="check" size={32} color={C.accHi} width={2.6} /> use an audio-only file
            </div>
          </div>
        </Layer>
      </At>
    </AbsoluteFill>
  );
};

// ---------- 7.0–7.3 Recording to notes, on the laptop.
const Bullet: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', gap: 10, fontSize: 15.5, lineHeight: 1.5}}>
    <span style={{color: G.text3}}>•</span>
    <span>{children}</span>
  </div>
);
const NOTES = [
  {h: 'Decisions', items: ['Launch moves to 3 November', 'Budget capped at RM18,000']},
  {h: 'Open questions', items: ['Who owns the social posts?']},
  {h: 'Next steps', items: ['Aina: send the brief by Friday', 'Ravi: book the venue']},
];
export const NotesDemo: React.FC = () => {
  const {t, L, loc, dur} = useS();
  const c = CUES.NotesDemo;
  const tPlus = loc(c.plus);
  const tFile = loc(c.file);
  const steps = [c.type, c.type2, c.type3].map((x) => ({...x, at: loc(x.at), enter: loc(x.enter)}));
  const [s1, s2, s3] = steps;
  const Y = GEO.threadY;
  const pos = {u1: Y, a1: Y + 130, u2: Y + 500, a2: Y + 566, u3: Y + 668, a3: Y + 734};
  const scroll = kf(t, [[s2.enter, 0], [s2.enter + 0.6, 360, E.inOut], [s3.enter, 360], [s3.enter + 0.6, 560, E.inOut]]);
  const attached = t >= tFile;
  const typing = steps.find((s) => t >= s.at - 0.3 && t < s.enter + 0.05);
  const comp = typing ? typedAt(typing.text, typing.at, typing.enter, t) : '';
  const chip = <FileChip name={FILE.name} meta={FILE.meta} w={260} />;
  const menu = p01(t, tPlus, 0.2) * (1 - p01(t, tFile, 0.15));
  const pN = p01(t, s1.enter + 1.0, 1.2, E.linear);
  const badge = (n: number, at: number, label: string, out?: number) => (
    <div style={{position: 'absolute', right: 60, top: 54}}>
      <StepBadge t={t} at={at} n={n} label={label} out={out} />
    </div>
  );
  return (
    <AppShot
      t={t}
      cam={[[0, 1.6, GEO.cx, GEO.compY - 160], [s1.enter + 0.3, 1.6, GEO.cx, GEO.compY - 160], [s1.enter + 1.0, 1.5, GEO.cx, 480], [dur, 1.52, GEO.cx, 484]]}
      screen={() => (
        <ChatGPT
          t={t}
          tabHi={1}
          composer={{text: comp, caret: true, attach: attached && t < s1.enter ? chip : undefined, hot: typing ? 1 - p01(t, typing.enter, 0.3) : 0}}
          thread={
            <>
              <div style={{position: 'absolute', inset: 0, transform: `translateY(${-scroll}px)`}}>
                {t < s1.enter && <div style={{position: 'absolute', left: GEO.colX, width: GEO.colW, top: 400, textAlign: 'center', fontSize: 30, fontWeight: 500}}>What can I help with?</div>}
                <UserMsg y={pos.u1} text={c.type.text} p={p01(t, s1.enter, 0.35)} attach={chip} />
                {t > s1.enter + 0.2 && t < s1.enter + 1.0 && (
                  <Asst y={pos.a1}>
                    <Status t={t} label="Transcribing the recording" icon="mic" />
                  </Asst>
                )}
                <Asst y={pos.a1} p={pN}>
                  <div style={{fontSize: 15, color: G.text3, marginBottom: 10}}>Transcript ready · 42 min</div>
                  {NOTES.map((n, i) => (
                    <div key={n.h} style={{marginBottom: 14, opacity: clamp(pN * 3 - i)}}>
                      <div style={{fontSize: 17, fontWeight: 700, marginBottom: 4}}>{n.h}</div>
                      {n.items.map((it) => (
                        <Bullet key={it}>{it}</Bullet>
                      ))}
                    </div>
                  ))}
                </Asst>
                <UserMsg y={pos.u2} text={c.type2.text} p={p01(t, s2.enter, 0.35)} />
                <Asst y={pos.a2} p={p01(t, s2.enter + 0.6, 0.4)}>
                  They agreed to cap the budget at <b>RM18,000</b>, with RM2,000 kept aside for ads. Ravi will confirm the venue cost before Friday.
                </Asst>
                <UserMsg y={pos.u3} text={c.type3.text} p={p01(t, s3.enter, 0.35)} />
                <Asst y={pos.a3} p={p01(t, s3.enter + 0.6, 0.4)}>
                  <div style={{borderRadius: 16, background: G.card, boxShadow: '0 0 0 1px rgba(255,255,255,.09)', padding: '16px 20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: G.text3, marginBottom: 8}}>
                      <Icon name="mail" size={18} color={C.accHi} /> Email draft
                    </div>
                    <div style={{fontSize: 16, fontWeight: 700}}>Subject: Follow-up on the launch plan</div>
                    <div style={{fontSize: 15.5, lineHeight: 1.55, marginTop: 8, color: G.text}}>Hi team, thanks for today. We agreed to move the launch to 3 November and cap the budget at RM18,000. Aina will send the brief by Friday, and Ravi will book the venue.</div>
                  </div>
                </Asst>
              </div>
              {menu > 0 && (
                <div style={{position: 'absolute', left: GEO.plus.x - 14, top: GEO.compY - 104, width: 250, borderRadius: 14, background: '#2F2F2F', boxShadow: '0 12px 30px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.08)', padding: 6, opacity: menu, fontSize: 14.5}}>
                  {['Add photos & files', 'Take screenshot'].map((m, i) => (
                    <div key={m} style={{display: 'flex', gap: 10, alignItems: 'center', padding: '9px 12px', borderRadius: 9, background: i === 0 ? 'rgba(255,255,255,.08)' : undefined}}>
                      <Icon name={i ? 'desktop' : 'file'} size={16} color={G.text2} width={2} /> {m}
                    </div>
                  ))}
                </div>
              )}
              <ScreenCursor t={t} keys={[[Math.max(0, tPlus - 0.7), GEO.plus.x + 160, GEO.plus.y - 140], [tPlus, GEO.plus.x, GEO.plus.y, true], [tFile, GEO.plus.x + 60, GEO.compY - 82, true], [tFile + 0.6, GEO.plus.x + 120, GEO.compY - 30]]} />
            </>
          }
        />
      )}
      over={() => (
        <>
          {badge(1, 0, 'Attach your audio', L(1) - 0.3)}
          {badge(2, L(1) - 0.1, 'Say what you want', L(2) - 0.3)}
          {badge(3, L(2) - 0.1, 'Ask a follow-up', L(3) - 0.3)}
          {badge(4, L(3) - 0.1, 'Make it sendable')}
          {steps.map((s, i) => (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: s.text.length > 60 ? 850 : 870, display: 'flex', justifyContent: 'center'}}>
              <CmdCard t={t} at={s.at - 0.3} text={s.text} typed={typedAt(s.text, s.at, s.enter, t)} label="ASK THIS" done={t > s.enter} out={i < 2 ? steps[i + 1].at - 0.5 : s.enter + 1.2} />
            </div>
          ))}
          <Layer t={t} at={enter(0.2, {from: 'd', dist: 50, out: s1.at - 0.5})} style={{left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center'}}>
            <Glass pad={0} r={999} style={{padding: '16px 30px', fontFamily: F.mono, fontSize: 24}}>
              MP3 · WAV · M4A · FLAC <span style={{color: C.accHi}}>· up to 512 MB</span>
            </Glass>
          </Layer>
        </>
      )}
    />
  );
};

// ---------- 7.4 "Step five. Check it. OpenAI warns that transcripts can have mistakes… Check names, numbers and dates."
export const NotesCheck: React.FC = () => {
  const {t, w, dur} = useS();
  const checks = [
    {at: w('names'), label: 'Names', tok: 'Aina'},
    {at: w('numbers'), label: 'Numbers', tok: 'RM18,000'},
    {at: w('dates'), label: 'Dates', tok: '3 November'},
  ];
  const hi = (tok: string) => {
    const c = checks.find((x) => x.tok === tok)!;
    const p = p01(t, c.at - 0.05, 0.3);
    return <span style={{padding: '0 6px', borderRadius: 6, background: `rgba(242,193,78,${0.35 * p})`, boxShadow: p > 0 ? `0 0 0 ${2 * p}px rgba(242,193,78,.8)` : undefined}}>{tok}</span>;
  };
  const play = p01(t, w('recording') - 0.6, dur - w('recording') + 0.2, E.linear);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', right: 60, top: 54}}>
        <StepBadge t={t} at={0} n={5} label="Check it" />
      </div>
      <Layer t={t} at={enter(0.1, {from: 'l', dist: 140})} style={{left: 160, top: 210}}>
        <Glass w={980} h={640} pad={44}>
          <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.24em', color: C.ink3}}>TRANSCRIPT · {FILE.name}</div>
          <div style={{fontFamily: F.ui, fontSize: 32, lineHeight: 1.75, marginTop: 26, color: C.ink}}>
            <div><span style={{color: C.accHi, fontWeight: 700}}>Speaker 1:</span> So {hi('Aina')} sends the brief by Friday.</div>
            <div><span style={{color: C.accHi, fontWeight: 700}}>Speaker 2:</span> And we cap it at {hi('RM18,000')}.</div>
            <div><span style={{color: C.accHi, fontWeight: 700}}>Speaker 1:</span> Launch moves to {hi('3 November')}.</div>
          </div>
          <div style={{position: 'absolute', left: 44, right: 44, bottom: 40}}>
            <div style={{position: 'relative'}}>
              <Wave w={892} h={70} n={90} color="rgba(95,212,176,.55)" />
              <div style={{position: 'absolute', top: -6, bottom: -6, left: `${play * 100}%`, width: 3, background: '#fff', opacity: p01(t, w('recording') - 0.6, 0.2)}} />
            </div>
          </div>
        </Glass>
      </Layer>
      <Layer t={t} at={enter(w('warns') - 0.2, {from: 'u', dist: 50})} style={{left: 160, top: 120}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: C.amber, whiteSpace: 'nowrap'}}>
          <Icon name="bell" size={34} color={C.amber} /> Transcripts can have mistakes · accuracy varies by language
        </div>
      </Layer>
      <div style={{position: 'absolute', left: 1250, top: 300}}>
        <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.ink3, marginBottom: 30, opacity: p01(t, w('names') - 0.6, 0.3)}}>CHECK AGAINST THE AUDIO</div>
        {checks.map((c) => {
          const b = bounce(t, c.at, 12, 240);
          return (
            <div key={c.label} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 34, opacity: p01(t, c.at - 0.2, 0.2)}}>
              <div style={{width: 72, height: 72, borderRadius: 20, display: 'grid', placeItems: 'center', background: C.acc, transform: `scale(${b})`}}>
                <Icon name="check" size={44} color="#fff" width={3} p={p01(t, c.at + 0.05, 0.3)} />
              </div>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 56}}>{c.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
