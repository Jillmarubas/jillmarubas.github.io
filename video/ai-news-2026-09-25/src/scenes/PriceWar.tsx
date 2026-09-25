import React from 'react';
import {C, D, E, F} from '../theme';
import {Beat, Count, Letters, mix, prog, Rise, Strike, useT} from '../lib/anim';
import {cue, para} from '../lib/timeline';
import {Chip, Glass, Label} from '../components/ui';
import {display, glow, Stage} from '../components/Stage';

const P = () => para(1).start;

/** Old price struck through, new price counting down to its value. */
const PriceDrop: React.FC<{
  label: string;
  old: string;
  from: number;
  to: number;
  strikeAt: number;
  landAt: number;
  cut: string;
  format: (n: number) => string;
}> = ({label, old, from, to, strikeAt, landAt, cut, format}) => {
  const t = useT();
  const land = prog(t, landAt, D.slow);
  return (
    <Glass d={0.05} style={{width: 900, padding: '44px 56px', display: 'flex', flexDirection: 'column', gap: 26}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Label>{label}</Label>
        <Chip at={strikeAt} accent>
          {cut}
        </Chip>
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 48}}>
        <div style={{position: 'relative', ...display(120, C.faint, 800)}}>
          {old}
          <Strike at={strikeAt} />
        </div>
        <div style={{fontFamily: F.mono, fontSize: 60, color: C.faint, opacity: land}}>→</div>
        <div style={{...display(190, C.accentHover), ...glow(), opacity: land, transform: `scale(${mix(1.25, 1, land)})`, transformOrigin: 'left bottom'}}>
          <Count from={from} to={to} at={landAt} dur={0.8} format={format} />
        </div>
      </div>
    </Glass>
  );
};

/** Cost bars on the same task: Opus 5 at 100, Sol at 20 (OpenAI's figures). */
const CostBars: React.FC<{at: number}> = ({at}) => {
  const t = useT();
  const a = prog(t, at, 1, E.glide);
  const b = prog(t, cue('eighty percent'), 0.9, E.glide);
  const rows = [
    {name: 'Claude Opus 5', w: a, color: 'rgba(243,239,233,.5)', val: '100%'},
    {name: 'GPT-6 Sol', w: mix(a, 0.2, b), color: C.accent, val: b > 0.5 ? '~20%' : '100%'},
  ];
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 34, width: 800}}>
      <Label>Cost to hit the same score</Label>
      {rows.map((r) => (
        <div key={r.name} style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.display, fontWeight: 700, fontSize: 40, color: C.text}}>
            <span>{r.name}</span>
            <span style={{fontFamily: F.mono, fontSize: 30, color: C.faint}}>{r.val}</span>
          </div>
          <div style={{height: 40, borderRadius: 12, background: 'rgba(255,255,255,.06)', border: `2px solid ${C.rim}`, overflow: 'hidden'}}>
            <div style={{width: `${r.w * 100}%`, height: '100%', background: r.color, borderRadius: 10, boxShadow: r.color === C.accent ? '0 0 24px rgba(250,90,5,.7)' : undefined}} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const PriceWar: React.FC = () => {
  return (
    <>
      <Beat from={P() + 0.15} to={cue('and cut output')}>
        <Stage gap={34}>
          <div style={{display: 'flex', gap: 18}}>
            <Chip d={0.05} accent>Sep 22</Chip>
            <Chip d={0.13}>Anthropic</Chip>
          </div>
          <Letters at={cue('Claude', cue('launched'))} text="Claude Opus 5.5" style={{...display(150), justifyContent: 'center', textAlign: 'center'}} />
          <Rise at={cue('strongest')}>
            <Chip dot={C.success}>Strongest model yet · per Anthropic</Chip>
          </Rise>
        </Stage>
      </Beat>

      <Beat from={cue('and cut output')} to={cue('Minutes later')}>
        <Stage>
          <Label style={{color: C.accentHover}}>Claude Opus 5.5 · price</Label>
          <PriceDrop
            label="Output · per 1M tokens"
            old="$25"
            from={25}
            to={20}
            strikeAt={cue('twenty percent')}
            landAt={cue('twenty dollars') - 0.1}
            cut="−20%"
            format={(n) => `$${Math.round(n)}`}
          />
        </Stage>
      </Beat>

      <Beat from={cue('Minutes later')} to={cue("Sol's price")}>
        <Stage gap={40}>
          <div style={{display: 'flex', gap: 18}}>
            <Chip d={0.05} accent>Minutes later</Chip>
            <Chip at={cue('OpenAI', cue('Minutes later'))}>OpenAI</Chip>
          </div>
          <Letters at={cue('GPT-6')} text="GPT-6" style={{...display(210), ...glow('rgba(255,255,255,.25)', 30)}} />
          <div style={{display: 'flex', gap: 30}}>
            {[
              {n: 'Sol', at: cue('Sol and')},
              {n: 'Luna', at: cue('Luna', cue('Sol and'))},
            ].map((m) => (
              <Glass key={m.n} at={m.at} style={{width: 400, padding: '34px 40px', display: 'flex', flexDirection: 'column', gap: 10}}>
                <Label>GPT-6</Label>
                <div style={display(84, C.text, 800)}>{m.n}</div>
              </Glass>
            ))}
          </div>
        </Stage>
      </Beat>

      <Beat from={cue("Sol's price")} to={cue('Luna? Just')}>
        <Stage>
          <Label style={{color: C.accentHover}}>GPT-6 Sol · price</Label>
          <PriceDrop
            label="Input · per 1M tokens"
            old="$4"
            from={4}
            to={2}
            strikeAt={cue('in half')}
            landAt={cue('two dollars') - 0.1}
            cut="−50%"
            format={(n) => `$${Math.round(n)}`}
          />
        </Stage>
      </Beat>

      <Beat from={cue('Luna? Just')} to={cue('OpenAI claims')}>
        <Stage gap={30}>
          <Label style={{color: C.accentHover}}>GPT-6 Luna · input · per 1M tokens</Label>
          <div style={{...display(300, C.accentHover), ...glow('rgba(250,90,5,.7)', 60)}}>
            <Count from={1} to={0.1} at={cue('ten cents') - 0.15} dur={0.7} format={(n) => `$${n.toFixed(2)}`} />
          </div>
          <Rise at={cue('ten cents')}>
            <Chip accent>Ten cents</Chip>
          </Rise>
        </Stage>
      </Beat>

      <Beat from={cue('OpenAI claims')} to={cue('So the race')}>
        <Stage gap={44}>
          <Rise d={0.05}>
            <Chip dot={C.amber}>OpenAI's claim · computer-use tasks</Chip>
          </Rise>
          <Glass d={0.12} style={{padding: '50px 50px'}}>
            <CostBars at={cue('matches')} />
          </Glass>
          <Rise at={cue('eighty percent')}>
            <div style={{...display(120, C.accentHover), ...glow()}}>−80% cost</div>
          </Rise>
        </Stage>
      </Beat>

      <Beat from={cue('So the race')} to={para(1).end + 0.25}>
        <Stage gap={26}>
          <Rise at={cue('smartest')}>
            <div style={{position: 'relative', ...display(150, C.faint)}}>
              Smartest
              <Strike at={cue('anymore') + 0.1} thickness={14} />
            </div>
          </Rise>
          <Letters at={cue('cheapest') - 0.1} text="Cheapest" style={{...display(170, C.accentHover), ...glow()}} />
          <Rise at={cue('near the top')}>
            <div style={display(92, C.text, 800)}>near the top.</div>
          </Rise>
        </Stage>
      </Beat>
    </>
  );
};
