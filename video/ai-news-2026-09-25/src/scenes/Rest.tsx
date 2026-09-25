import React from 'react';
import {C, D, E, F} from '../theme';
import {Beat, Count, Letters, mix, prog, Rise, useT} from '../lib/anim';
import {cue, DURATION, para, wordsOf} from '../lib/timeline';
import {BigQuoteMark, Chip, Glass, Label, PersonCard, SpokenQuote} from '../components/ui';
import {Globe, Pipeline, Shield} from '../components/graphics';
import {display, glow, Stage} from '../components/Stage';
import {STORIES} from '../components/Chrome';

export const Gemini: React.FC = () => (
  <>
    <Beat from={para(4).start + 0.1} to={cue('Gemini 4') - 0.2}>
      <Stage gap={36}>
        <Rise d={0.05}>
          <Chip>Google DeepMind</Chip>
        </Rise>
        <PersonCard id="kavukcuoglu" name="Koray Kavukcuoglu" role="Senior VP · Google DeepMind" at={cue("DeepMind's") - 0.1} style={{width: 920}} size={200} />
      </Stage>
    </Beat>

    <Beat from={cue('Gemini 4') - 0.2} to={cue('Expect')}>
      <Stage gap={60}>
        <Letters d={0.05} text="Gemini 4" style={{...display(190), ...glow('rgba(124,58,190,.6)', 60)}} />
        <Glass d={0.2} style={{padding: '50px 30px 30px'}}>
          <Pipeline
            at={cue('post-training') - 0.3}
            current={1}
            steps={[
              {label: 'Pre-training', sub: 'from July'},
              {label: 'Post-training', sub: 'now'},
              {label: 'Early release', sub: 'asap'},
            ]}
          />
        </Glass>
        <Rise at={cue('as soon as possible')}>
          <Chip accent dot={C.accent}>
            As soon as possible
          </Chip>
        </Rise>
      </Stage>
    </Beat>

    <Beat from={cue('Expect')} to={para(4).end + 0.3}>
      <Stage gap={30}>
        <Label style={{color: C.accentHover}}>Heavy focus on</Label>
        <Glass at={cue('coding') - 0.1} style={{width: 860, padding: '40px 50px', display: 'flex', alignItems: 'center', gap: 36}}>
          <span style={{fontFamily: F.mono, fontWeight: 600, fontSize: 80, color: C.accentHover}}>{'</>'}</span>
          <span style={display(84, C.text, 800)}>Coding</span>
        </Glass>
        <Glass at={cue('long-running') - 0.1} style={{width: 860, padding: '40px 50px', display: 'flex', alignItems: 'center', gap: 36}}>
          <span style={{fontFamily: F.mono, fontWeight: 600, fontSize: 80, color: C.accentHover}}>∞</span>
          <span style={display(76, C.text, 800)}>Long-running agents</span>
        </Glass>
      </Stage>
    </Beat>
  </>
);

export const Island: React.FC = () => (
  <>
    <Beat from={para(5).start + 0.1} to={cue('at a six-point-four')}>
      <Stage gap={34}>
        <div style={{display: 'flex', gap: 16}}>
          <Chip d={0.05} accent>
            Money check
          </Chip>
          <Chip at={cue('cybersecurity')}>Cybersecurity</Chip>
        </div>
        <Letters at={cue('cybersecurity')} text="Island" style={{...display(200), ...glow('rgba(255,162,58,.45)', 50)}} />
        <Rise at={cue('Island') + 0.2}>
          <Label>AI-powered enterprise browser</Label>
        </Rise>
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <div style={{...display(150, C.accentHover), ...glow()}}>
            <Count to={400} at={cue('four hundred million') - 0.1} format={(n) => `$${Math.round(n)}M`} />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            <Chip at={cue('raised')}>Series F</Chip>
            <Chip at={cue('dollars', cue('raised'))}>≈ RM1.6B</Chip>
          </div>
        </div>
      </Stage>
    </Beat>

    <Beat from={cue('at a six-point-four')} to={cue('AI, defending')}>
      <Stage gap={20}>
        <Label style={{color: C.accentHover}}>Valuation</Label>
        <div style={{...display(330, C.accentHover), ...glow('rgba(250,90,5,.7)', 70)}}>
          <Count to={6.4} at={cue('six-point-four')} dur={1.1} format={(n) => `$${n.toFixed(1)}B`} />
        </div>
        <Rise at={cue('valuation')}>
          <Chip>≈ RM26.2B</Chip>
        </Rise>
      </Stage>
    </Beat>

    <Beat from={cue('AI, defending')} to={para(5).end + 0.3}>
      <Stage gap={30}>
        <Shield at={cue('AI, defending')} />
        <Letters at={cue('defending')} text="AI vs AI" style={{...display(110), justifyContent: 'center'}} />
      </Stage>
    </Beat>
  </>
);

/** The US answer, stamped. */
const Stamp: React.FC<{at: number}> = ({at}) => {
  const t = useT();
  const p = prog(t, at, 0.3, E.settle);
  if (t < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        right: 30,
        bottom: -40,
        padding: '14px 34px',
        border: `6px solid ${C.danger}`,
        borderRadius: 16,
        fontFamily: F.display,
        fontWeight: 900,
        fontSize: 76,
        letterSpacing: '.04em',
        color: C.danger,
        background: 'rgba(40,6,6,.35)',
        transform: `rotate(-9deg) scale(${mix(1.8, 1, p)})`,
        opacity: p,
        boxShadow: '0 0 40px rgba(255,90,90,.35)',
      }}
    >
      REJECTED
    </div>
  );
};

export const UN: React.FC = () => {
  const t = useT();
  return (
    <>
      <Beat from={para(6).start + 0.1} to={cue("Anthropic's Dario")}>
        <Stage gap={30}>
          <Globe />
          <Letters at={cue('UN.', para(6).start) - 0.2} text="UN Security Council" style={{...display(96), justifyContent: 'center'}} stagger={0.03} />
          <Rise at={cue('UN.', para(6).start) + 0.2}>
            <Chip>New York</Chip>
          </Rise>
        </Stage>
      </Beat>

      <Beat from={cue("Anthropic's Dario")} to={cue("OpenAI's Sam")}>
        <Stage gap={34}>
          <PersonCard id="amodei" name="Dario Amodei" role="CEO · Anthropic" d={0.05} style={{width: 920}} size={200} />
          <Glass at={cue('If managed') - 0.3} style={{width: 920, padding: '26px 50px 46px'}}>
            <BigQuoteMark />
            <SpokenQuote words={wordsOf('"If managed poorly, I even believe AI could be a risk to humanity as a whole."')} size={64} hot={['poorly', 'risk', 'humanity']} />
          </Glass>
        </Stage>
      </Beat>

      <Beat from={cue("OpenAI's Sam")} to={cue('But the U.S.')}>
        <Stage gap={34}>
          <PersonCard id="altman" name="Sam Altman" role="CEO · OpenAI" d={0.05} style={{width: 920}} size={200} />
          <Glass at={cue('cannot') - 0.3} style={{width: 920, padding: '26px 50px 46px'}}>
            <BigQuoteMark />
            <SpokenQuote words={wordsOf('"cannot be made by labs in San Francisco alone."')} size={70} hot={['cannot', 'alone']} />
          </Glass>
        </Stage>
      </Beat>

      <Beat from={cue('But the U.S.')} to={cue('The builders')}>
        <Stage gap={40}>
          <Rise d={0.05}>
            <Chip dot={C.danger}>United States · at the UN</Chip>
          </Rise>
          <div style={{position: 'relative'}}>
            <Glass d={0.15} style={{width: 920, padding: '26px 50px 90px'}}>
              <BigQuoteMark />
              <SpokenQuote words={wordsOf('centralised control and global governance')} size={80} hot={['centralised', 'governance']} />
            </Glass>
            <Stamp at={cue('rejected')} />
          </div>
        </Stage>
      </Beat>

      <Beat from={cue('The builders')} to={para(6).end + 0.3}>
        <Stage gap={0}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center'}}>
            <Glass at={cue('builders') - 0.1} style={{width: 880, padding: '40px 50px'}}>
              <Label style={{color: C.success}}>The builders</Label>
              <div style={{...display(84, C.text, 800), marginTop: 14}}>Want guardrails</div>
            </Glass>
            {/* the tension between the two: a wire that hums */}
            <svg width={40} height={130}>
              <path
                d={`M20 0 ${Array.from({length: 13}, (_, i) => `L${20 + Math.sin(i * 1.7 + t * 30) * 7 * prog(t, cue('Governments'), 0.3)} ${i * 10}`).join(' ')} L20 130`}
                fill="none"
                stroke={C.accentHover}
                strokeWidth={4}
                opacity={prog(t, cue('builders'), D.base)}
              />
            </svg>
            <Glass at={cue('Governments') - 0.1} style={{width: 880, padding: '40px 50px'}}>
              <Label style={{color: C.danger}}>Governments</Label>
              <div style={{...display(84, C.accentHover, 800), marginTop: 14}}>“Not right now.”</div>
            </Glass>
          </div>
        </Stage>
      </Beat>
    </>
  );
};

export const Outro: React.FC = () => {
  const t = useT();
  const subAt = cue('subscribe');
  const press = prog(t, subAt + 0.35, 0.1) - prog(t, subAt + 0.45, 0.1);
  const done = prog(t, subAt + 0.5, D.base, E.snap);
  return (
    <Beat from={para(7).start - 0.1} to={DURATION + 1} exit="none">
      <Stage gap={34}>
        <Letters d={0.05} text="Which story matters most?" style={{...display(92), justifyContent: 'center', textAlign: 'center', width: 940}} stagger={0.025} />
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: 920}}>
          {STORIES.map((s, i) => (
            <Chip key={s} at={cue('story matters') + 0.1 + i * 0.08} style={{justifyContent: 'flex-start', fontSize: 24}}>
              <span style={{color: C.accentHover}}>{String(i + 1).padStart(2, '0')}</span> {s}
            </Chip>
          ))}
        </div>
        <Rise at={cue('Tell me')}>
          <Glass at={cue('Tell me')} style={{padding: '26px 40px', display: 'flex', alignItems: 'center', gap: 22, borderRadius: 999}}>
            <svg width={44} height={44} viewBox="0 0 24 24">
              <path d="M4 5h16v11H9l-5 4z" fill="none" stroke={C.text} strokeWidth={2} strokeLinejoin="round" />
            </svg>
            <span style={{fontFamily: F.body, fontWeight: 500, fontSize: 38, color: C.text}}>Tell me in the comments</span>
          </Glass>
        </Rise>
        <Rise at={subAt - 0.1}>
          <div
            style={{
              padding: '30px 70px',
              borderRadius: 999,
              background: done > 0.5 ? 'rgba(255,255,255,.1)' : 'linear-gradient(180deg,rgba(250,90,5,.95),rgba(194,69,10,.9))',
              border: `2px solid ${done > 0.5 ? C.rimLit : 'rgba(255,255,255,.26)'}`,
              boxShadow: '0 20px 50px rgba(250,90,5,.35), inset 0 2px 0 rgba(255,255,255,.3)',
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: 56,
              letterSpacing: '.02em',
              color: done > 0.5 ? C.text : '#0a0a0a',
              transform: `scale(${1 - 0.04 * press})`,
            }}
          >
            {done > 0.5 ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}
          </div>
        </Rise>
      </Stage>
    </Beat>
  );
};
