import React from 'react';
import {C, D, E, F} from '../theme';
import {Beat, Count, Letters, prog, Rise, Strike, useT} from '../lib/anim';
import {cue, para, wordsOf} from '../lib/timeline';
import {BigQuoteMark, Chip, Glass, Label, PersonCard, SpokenQuote, Tick} from '../components/ui';
import {AgentGrid, Funnel, Helix} from '../components/graphics';
import {display, glow, Stage} from '../components/Stage';

const Terminal: React.FC = () => {
  const t = useT();
  const text = 'FUNCTION: UNKNOWN';
  const at = cue('Nobody knows');
  const n = Math.floor(Math.max(0, (t - at) / 0.045));
  const blink = Math.floor(t * 2.5) % 2 === 0;
  return (
    <Glass d={0.05} style={{width: 900, padding: '44px 50px', display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={{display: 'flex', gap: 12}}>
        {[C.danger, C.amber, C.success].map((c) => (
          <span key={c} style={{width: 18, height: 18, borderRadius: 18, background: c, opacity: 0.8}} />
        ))}
      </div>
      <div style={{fontFamily: F.mono, fontSize: 30, color: C.faint}}>&gt; art.describe()</div>
      <div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 60, color: C.accentHover, letterSpacing: '.02em', ...glow('rgba(250,90,5,.5)', 24)}}>
        {text.slice(0, n)}
        <span style={{opacity: blink ? 1 : 0}}>█</span>
      </div>
    </Glass>
  );
};

export const Enzyme: React.FC = () => {
  const t = useT();
  const qMark = prog(t, para(2).start + 0.1, 1.1, E.glide);
  return (
    <>
      <Beat from={para(2).start + 0.1} to={cue('About nine')}>
        <Stage gap={20}>
          <svg width={330} height={420} viewBox="0 0 110 140">
            <path
              d="M20 40 C20 12 90 8 90 40 C90 66 56 68 56 92 L56 102"
              fill="none"
              stroke={C.accentHover}
              strokeWidth={12}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - qMark}
              style={{filter: 'drop-shadow(0 0 14px rgba(250,90,5,.8))'}}
            />
            <circle cx={56} cy={126} r={8} fill={C.accentHover} opacity={prog(t, para(2).start + 0.9, D.base)} />
          </svg>
          <Letters at={cue('strangest')} text="Strangest story of the week" style={{...display(76, C.text, 800), justifyContent: 'center', textAlign: 'center', width: 900}} stagger={0.025} />
        </Stage>
      </Beat>

      <Beat from={cue('About nine')} to={cue('They narrowed')}>
        <Stage gap={30}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 26}}>
            <div style={{...display(170, C.accentHover), ...glow()}}>
              <Count to={950} at={cue('nine hundred')} dur={1} format={(n) => Math.round(n).toString()} />
            </div>
            <div style={display(64, C.text, 800)}>Claude agents</div>
          </div>
          <Glass d={0.1} style={{padding: 34}}>
            <AgentGrid at={cue('nine hundred')} />
          </Glass>
          <div style={{display: 'flex', gap: 18}}>
            <Chip at={cue('DNA database')}>Massive DNA database</Chip>
            <Chip at={cue('twenty-one')} accent dot={C.accent}>
              21 hours
            </Chip>
          </div>
        </Stage>
      </Beat>

      <Beat from={cue('They narrowed')} to={cue('and flagged')}>
        <Stage gap={40}>
          <Label style={{color: C.accentHover}}>Reverse transcriptase candidates</Label>
          <Funnel
            at={cue('two hundred thousand') - 0.1}
            stepGap={(cue('twenty', cue('down to just')) - cue('two hundred thousand')) / 2}
            steps={[
              {value: '200,000', label: 'candidates', w: 900},
              {value: '3,500', label: 'shortlist', w: 620},
              {value: '20', label: 'finalists', w: 360},
            ]}
          />
        </Stage>
      </Beat>

      <Beat from={cue('and flagged')} to={cue('Scientists confirmed')}>
        <Stage gap={46}>
          <Label style={{color: C.accentHover}}>One finalist's neighbouring DNA</Label>
          <Glass d={0.05} style={{padding: '70px 40px'}}>
            <Helix width={880} height={260} scanAt={cue('flagged')} repeats={4} />
          </Glass>
          <Rise at={cue('CRISPR-like')}>
            <Chip accent dot={C.accent}>
              CRISPR-like array · new enzyme system
            </Chip>
          </Rise>
        </Stage>
      </Beat>

      <Beat from={cue('Scientists confirmed')} to={cue('Nobody knows') - 0.25}>
        <Stage gap={36}>
          <Rise at={cue('confirmed')}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 30px', borderRadius: 999, background: 'rgba(61,220,132,.12)', border: '2px solid rgba(61,220,132,.5)'}}>
              <Tick at={cue('confirmed') + 0.1} />
              <span style={{fontFamily: F.mono, fontSize: 28, letterSpacing: '.12em', color: C.success}}>CONFIRMED IN THE LAB</span>
            </div>
          </Rise>
          <Letters at={cue('ART') - 0.05} text="ART" style={{...display(300, C.accentHover), ...glow('rgba(250,90,5,.7)', 60)}} stagger={0.07} />
          <Rise at={cue('ART') + 0.3}>
            <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 46, color: C.text, textAlign: 'center', lineHeight: 1.25}}>
              <span style={{color: C.accentHover}}>A</span>rray-associated <span style={{color: C.accentHover}}>R</span>everse
              <br />
              <span style={{color: C.accentHover}}>T</span>ranscriptases
            </div>
          </Rise>
        </Stage>
      </Beat>

      <Beat from={cue('Nobody knows') - 0.25} to={cue("Stanford's")}>
        <Stage>
          <Label style={{color: C.accentHover}}>The catch</Label>
          <Terminal />
        </Stage>
      </Beat>

      <Beat from={cue("Stanford's")} to={cue('Microbiologist')}>
        <Stage gap={40}>
          <PersonCard id="qi" name="Stanley Qi" role="Stanford" d={0.05} style={{width: 900}} />
          <Glass d={0.25} style={{width: 900, padding: '30px 50px 50px'}}>
            <BigQuoteMark />
            <SpokenQuote words={wordsOf('incredibly exciting.')} size={96} hot={['incredibly', 'exciting']} />
          </Glass>
        </Stage>
      </Beat>

      <Beat from={cue('Microbiologist')} to={cue('A cool proof')}>
        <Stage gap={40}>
          <PersonCard id="blake" name="Kevin Blake" role="Microbiologist" d={0.05} style={{width: 900}} />
          <Glass d={0.25} style={{width: 900, padding: '30px 50px 50px'}}>
            <BigQuoteMark />
            <SpokenQuote words={wordsOf("CRISPR-like sequences aren't that rare.", cue('Microbiologist'))} size={70} hot={['rare']} />
          </Glass>
        </Stage>
      </Beat>

      <Beat from={cue('A cool proof')} to={para(2).end + 0.25}>
        <Stage gap={40}>
          <Rise at={cue('proof')}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 30px', borderRadius: 999, background: 'rgba(61,220,132,.12)', border: '2px solid rgba(61,220,132,.5)'}}>
              <Tick at={cue('proof') + 0.1} />
              <span style={{fontFamily: F.mono, fontSize: 28, letterSpacing: '.12em', color: C.success}}>PROOF OF CONCEPT</span>
            </div>
          </Rise>
          <Rise at={cue('gene editing') - 0.1}>
            <div style={{position: 'relative', ...display(112, C.text), whiteSpace: 'nowrap'}}>
              Gene editing 2.0
              <Strike at={cue('two-point-oh') + 0.15} thickness={14} />
            </div>
          </Rise>
          <Letters at={cue('Not yet') - 0.05} text="Not yet." style={{...display(120, C.accentHover), ...glow()}} />
        </Stage>
      </Beat>
    </>
  );
};
