import React from 'react';
import {random} from 'remotion';
import {C, D, E, F} from '../theme';
import {Beat, Letters, mix, prog, Rise, useT} from '../lib/anim';
import {cue, para} from '../lib/timeline';
import {Chip, Glass, Label, Portrait} from '../components/ui';
import {Helix} from '../components/graphics';
import {display, glow, Stage} from '../components/Stage';
import {STORIES} from '../components/Chrome';

const ModelCard: React.FC<{d: number; maker: string; name: string; from: 'left' | 'right'}> = ({d, maker, name, from}) => {
  const t = useT();
  const p = prog(t, 0.3 + d, D.slow);
  return (
    <div style={{transform: `translateX(${(1 - p) * (from === 'left' ? -220 : 220)}px)`}}>
      <Glass d={d} y={0} style={{width: 450, height: 300, padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        <Label style={{color: C.accentHover}}>{maker}</Label>
        <div style={display(64, C.text, 800)}>{name}</div>
        <div style={{height: 6, width: 90, borderRadius: 6, background: C.accent}} />
      </Glass>
    </div>
  );
};

// Two launches, minutes apart: the two markers slide together on "minutes apart".
const MinutesApart: React.FC = () => {
  const t = useT();
  const at = cue('minutes apart');
  const p = prog(t, at, D.slow, E.glide);
  const line = prog(t, 1.2, D.slow, E.glide);
  const gap = mix(560, 70, p);
  return (
    <div style={{position: 'relative', width: 900, height: 120, opacity: line}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, height: 4, borderRadius: 4, background: 'rgba(255,255,255,.16)', transform: `scaleX(${line})`}} />
      {[-1, 1].map((s) => (
        <div key={s} style={{position: 'absolute', top: 26, left: 450 + (s * gap) / 2 - 16, width: 32, height: 32, borderRadius: 32, background: s < 0 ? C.accent : C.text, boxShadow: `0 0 24px ${s < 0 ? 'rgba(250,90,5,.9)' : 'rgba(255,255,255,.6)'}`}} />
      ))}
      <div style={{position: 'absolute', top: 82, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 26, letterSpacing: '.14em', color: C.accentHover, opacity: p}}>
        SEP 22 · MINUTES APART
      </div>
    </div>
  );
};

// "Risk to humanity", with a short digital stutter as it lands.
const Glitchy: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const t = useT();
  const k = t - at;
  const on = k > 0 && k < 0.35;
  const f = Math.floor(t * 30);
  const dx = on ? (random(`gx${f}`) - 0.5) * 30 : 0;
  const split = on ? 8 : 0;
  return (
    <div style={{position: 'relative', transform: `translateX(${dx}px)`}}>
      {split ? <div style={{position: 'absolute', inset: 0, transform: `translateX(${split}px)`, opacity: 0.6, mixBlendMode: 'screen', filter: 'hue-rotate(160deg)'}}>{children}</div> : null}
      {children}
    </div>
  );
};

export const Hook: React.FC = () => {
  const t = useT();
  const ringAt = cue("Here's your");
  const ring = prog(t, ringAt + 0.4, 1.4, E.glide);
  return (
    <>
      <Beat from={0.3} to={cue('Claude may')}>
        <Stage gap={60}>
          <Rise d={0.05}>
            <Chip accent dot={C.accent}>Two launches · one week</Chip>
          </Rise>
          <div style={{display: 'flex', gap: 40}}>
            <ModelCard d={0.15} maker="Anthropic" name="Claude Opus 5.5" from="left" />
            <ModelCard d={0.35} maker="OpenAI" name="GPT-6 Sol + Luna" from="right" />
          </div>
          <MinutesApart />
        </Stage>
      </Beat>

      <Beat from={cue('Claude may')} to={cue('And at the UN')}>
        <Stage gap={50}>
          <Rise d={0.05}>
            <Label style={{color: C.accentHover}}>Found in bacterial DNA</Label>
          </Rise>
          <Glass d={0.1} style={{padding: '70px 40px'}}>
            <Helix width={880} height={280} scanAt={cue('hidden')} />
          </Glass>
          <Rise at={cue('DNA', cue('bacterial'))}>
            <Chip dot={C.accent}>Something hidden · unknown system</Chip>
          </Rise>
        </Stage>
      </Beat>

      <Beat from={cue('And at the UN')} to={cue("Here's your")}>
        <Stage gap={44}>
          <Rise d={0.05}>
            <Chip dot={C.danger}>UN Security Council · New York</Chip>
          </Rise>
          <div style={{display: 'flex', gap: 36}}>
            {[
              {id: 'altman', name: 'Sam Altman', role: 'OpenAI', at: cue('OpenAI', cue('CEOs'))},
              {id: 'amodei', name: 'Dario Amodei', role: 'Anthropic', at: cue('Anthropic', cue('CEOs'))},
            ].map((p) => (
              <Glass key={p.id} at={p.at - 0.15} style={{padding: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: 380}}>
                <Portrait id={p.id} name={p.name} size={240} />
                <div style={display(44, C.text, 800)}>{p.name}</div>
                <Label style={{color: C.accentHover}}>CEO · {p.role}</Label>
              </Glass>
            ))}
          </div>
          <Glitchy at={cue('risk')}>
            <Letters at={cue('risk') - 0.05} text="RISK TO HUMANITY" style={{...display(104, C.accentHover), ...glow(), justifyContent: 'center'}} stagger={0.03} />
          </Glitchy>
        </Stage>
      </Beat>

      <Beat from={ringAt} to={para(1).start - 0.5}>
        <Stage gap={40}>
          <div style={{position: 'relative', display: 'grid', placeItems: 'center'}}>
            <svg width={300} height={300} style={{position: 'absolute'}}>
              <circle cx={150} cy={150} r={136} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={8} />
              <circle
                cx={150}
                cy={150}
                r={136}
                fill="none"
                stroke={C.accent}
                strokeWidth={8}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - ring}
                transform="rotate(-90 150 150)"
                style={{filter: 'drop-shadow(0 0 12px rgba(250,90,5,.8))'}}
              />
            </svg>
            <Rise d={0.2}>
              <div style={{...display(92, C.text), fontVariantNumeric: 'tabular-nums', width: 300, height: 300, display: 'grid', placeItems: 'center'}}>3:00</div>
            </Rise>
          </div>
          <Letters d={0.05} text="YOUR AI WEEK" style={{...display(132), justifyContent: 'center'}} />
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: 900}}>
            {STORIES.map((s, i) => (
              <Chip key={s} d={0.55 + i * 0.08} style={{justifyContent: 'flex-start', fontSize: 24}}>
                <span style={{color: C.accentHover}}>{String(i + 1).padStart(2, '0')}</span> {s}
              </Chip>
            ))}
          </div>
        </Stage>
      </Beat>
    </>
  );
};
