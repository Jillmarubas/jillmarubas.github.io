// Wrap (to-do list, the one-line takeaway) + outro.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from './design';
import {AText, Camera, Draw, E, Layer, bounce, clamp, enter, kf, lerp, p01} from './ae';
import {useS} from './timing';
import {typedAt} from './app';
import {CUES} from './cues';
import {Burst, Icon, OpenAIMark} from './ui';
import {FrameCursor} from './s3';

// ---------- 10.0 "So here's your to-do list. One… Five…"
export const Todo: React.FC = () => {
  const {t, w, Le, dur} = useS();
  const items = [
    {n: 'one', icon: 'dollar', text: 'Ask ChatGPT for a tool', sub: 'like a bill splitter'},
    {n: 'two', icon: 'gear', text: 'Ask it to explain with parts you can tap', sub: 'the bike demo'},
    {n: 'three', icon: 'mic', text: 'Paid plan? Upload one recording', sub: 'and ask for notes'},
    {n: 'four', icon: 'check', text: 'Check every transcript against the audio', sub: 'names · numbers · dates'},
    {n: 'five', icon: 'code', text: 'Codex on Pro: Tab on a prediction', sub: 'or switch it off'},
  ];
  const at = items.map((i) => w(i.n));
  const done = items.map((_, k) => (k < 4 ? at[k + 1] - 0.35 : Le(0) - 0.2));
  const y = kf(t, [[0, 0], [at[3], 0], [at[4], -60, E.inOut]]);
  return (
    <AbsoluteFill>
      <Camera cam={{z: kf(t, [[0, 1.04], [dur, 1, E.inOut]]), y: 0}}>
        <div style={{position: 'absolute', left: 300, top: 150 + y}}>
          <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.accHi, opacity: p01(t, 1.8, 0.3)}}>BEFORE YOU GO</div>
          <AText t={t} text="Your *to-do* list" at={1.9} size={80} by="word" style={{marginTop: 8}} />
          <div style={{marginTop: 40}}>
            {items.map((it, k) => {
              const tick = p01(t, done[k], 0.35, E.inOut);
              const b = bounce(t, done[k], 12, 240);
              return (
                <Layer key={k} t={t} at={enter(at[k] - 0.15, {from: 'r', dist: 120})} style={{position: 'relative', marginBottom: 26}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
                    <div style={{width: 76, height: 76, borderRadius: 22, display: 'grid', placeItems: 'center', background: tick > 0 ? C.acc : 'rgba(255,255,255,.06)', boxShadow: '0 0 0 2px rgba(255,255,255,.14)', transform: `scale(${tick > 0 ? b : 1})`}}>
                      {tick > 0 ? <Icon name="check" size={46} color="#fff" width={3} p={tick} /> : <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 36, color: C.ink2}}>{k + 1}</span>}
                    </div>
                    <Icon name={it.icon} size={46} color={C.accHi} />
                    <div>
                      <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 44, color: tick > 0.5 ? C.ink2 : C.ink}}>{it.text}</div>
                      <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink3, marginTop: 4}}>{it.sub}</div>
                    </div>
                  </div>
                </Layer>
              );
            })}
          </div>
        </div>
      </Camera>
    </AbsoluteFill>
  );
};

// ---------- 10.1 "ChatGPT is moving from writing answers to building them."
export const Morph: React.FC = () => {
  const {t, w} = useS();
  const tW = w('writing');
  const tB = w('building');
  const sw = p01(t, tB - 0.15, 0.4, E.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}>
        <AText t={t} text="ChatGPT is moving from" at={w('chatgpt') - 0.1} size={56} by="word" color={C.ink2} weight={800} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, height: 260, textAlign: 'center'}}>
        <div style={{position: 'absolute', left: 0, right: 0, opacity: p01(t, tW - 0.1, 0.25) * (1 - sw), transform: `translateY(${-sw * 80}px)`, filter: `blur(${sw * 10}px)`}}>
          <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 200, letterSpacing: '-0.05em', color: C.ink3}}>writing</span>
          <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 90, color: C.ink3}}> answers</span>
        </div>
        <svg width={1920} height={260} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 1 - sw}}>
          <Draw t={t} d="M520 140 L1160 130" at={tB - 0.45} dur={0.25} stroke={C.red} width={10} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, opacity: sw, transform: `translateY(${(1 - sw) * 80}px) scale(${lerp(0.9, 1, bounce(t, tB - 0.1, 10, 200))})`}}>
          <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 200, letterSpacing: '-0.05em', color: C.accHi, textShadow: '0 0 60px rgba(16,163,127,.5)'}}>building</span>
          <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 90, color: C.ink}}> them</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 960, top: 540}}>
        <Burst t={t} at={tB} n={16} r0={300} r1={480} color={C.accHi} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 11.* "If this helped, like and subscribe… what is the first tool you will ask ChatGPT to build? See you in the next one."
export const Outro: React.FC = () => {
  const {t, w, loc} = useS();
  const c = CUES.Outro;
  const tLike = loc(c.like);
  const tSub = loc(c.sub);
  const tCom = loc(c.comment.at);
  const tSee = w('see');
  const liked = t > tLike + 0.05;
  const subbed = t > tSub + 0.05;
  const press = (at: number) => (t > at - 0.05 && t < at + 0.12 ? 0.92 : 1);
  const typed = typedAt(c.comment.text, tCom, tCom + 99, t);
  const end = p01(t, tSee - 0.2, 0.6, E.inOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - end * 0.92, transform: `scale(${1 - end * 0.08})`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
          <AText t={t} text="AI news, explained and *shown*" at={0.1} size={64} by="word" />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center', gap: 40}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 40px', borderRadius: 999, background: liked ? C.acc : 'rgba(255,255,255,.08)', fontFamily: F.ui, fontWeight: 800, fontSize: 40, transform: `scale(${press(tLike) * (liked ? 1 + 0.1 * Math.sin(p01(t, tLike, 0.3) * Math.PI) : 1)})`}}>
            <Icon name="thumb" size={44} color="#fff" width={2.2} fill={liked ? '#fff' : undefined} /> Like
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 40px', borderRadius: 999, background: subbed ? 'rgba(255,255,255,.12)' : C.ink, color: subbed ? C.ink : '#111', fontFamily: F.ui, fontWeight: 800, fontSize: 40, transform: `scale(${press(tSub)})`}}>
            {subbed && <Icon name="bell" size={40} color={C.ink} width={2.2} />} {subbed ? 'Subscribed' : 'Subscribe'}
          </div>
        </div>
        <div style={{position: 'absolute', left: 760, top: 545}}>
          <Burst t={t} at={tLike} n={10} r0={60} r1={140} color={C.accHi} />
        </div>
        <Layer t={t} at={enter(w('comments') - 0.2, {from: 'd', dist: 100})} style={{left: 520, top: 720}}>
          <div style={{width: 880, display: 'flex', gap: 20, alignItems: 'flex-start'}}>
            <div style={{width: 64, height: 64, borderRadius: 32, background: '#2a2c2e', flex: 'none', display: 'grid', placeItems: 'center'}}>
              <Icon name="chat" size={34} color={C.ink2} />
            </div>
            <div style={{flex: 1, padding: '20px 26px', borderRadius: '8px 26px 26px 26px', background: 'rgba(30,33,34,.92)', boxShadow: `0 0 0 1px ${C.line2}`, fontFamily: F.ui, fontWeight: 600, fontSize: 36, minHeight: 50}}>
              <span style={{color: typed ? C.ink : C.ink3}}>{typed || 'What will you ask it to build?'}</span>
              <span style={{opacity: typed.length < c.comment.text.length && Math.floor(t * 2.2) % 2 === 0 ? 1 : 0, color: C.acc}}>|</span>
            </div>
          </div>
        </Layer>
        <FrameCursor t={t} keys={[[0.3, 1300, 900], [tLike, 790, 548, true], [tSub, 1110, 548, true], [tCom, 1500, 980]]} />
      </div>
      {end > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: end, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
          <div style={{transform: `scale(${lerp(0.7, 1, end)})`, filter: 'drop-shadow(0 0 50px rgba(16,163,127,.5))'}}>
            <OpenAIMark size={140} />
          </div>
          <AText t={t} text="See you in the *next one*." at={tSee} size={96} by="word" />
          <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.ink3, opacity: p01(t, tSee + 0.8, 0.5)}}>AI NEWS DAILY · 10 OCT 2026</div>
          <div style={{fontFamily: F.mono, fontSize: 16, color: C.ink3, opacity: p01(t, tSee + 1.2, 0.5), marginTop: 30, textAlign: 'center', lineHeight: 1.6}}>
            Sources: OpenAI ChatGPT release notes (6, 7 and 9 Oct 2026) · OpenAI, “GPT-6 and Intelligent UI for everyone” (7 Oct 2026) · OpenAI Help Center
            <br />
            Screens are illustrations drawn for this video · example prompts are ours
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export {clamp};
