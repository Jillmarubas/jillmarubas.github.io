import React from 'react';
import {C, F} from '../theme';
import {Beat, Count, Letters, Rise} from '../lib/anim';
import {cue, para, wordsOf} from '../lib/timeline';
import {BigQuoteMark, Chip, Glass, Inner, Label, PersonCard, SpokenQuote, Tick} from '../components/ui';
import {Charm, GlassesDraw} from '../components/graphics';
import {display, glow, Stage} from '../components/Stage';

const Task: React.FC<{at: number; text: string}> = ({at, text}) => (
  <Rise at={at} y={24}>
    <Inner style={{display: 'flex', alignItems: 'center', gap: 22, padding: '24px 30px', width: 760}}>
      <Tick at={at + 0.2} size={40} color={C.accentHover} />
      <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 50, color: C.text}}>{text}</span>
    </Inner>
  </Rise>
);

export const Meta: React.FC = () => (
  <>
    <Beat from={para(3).start + 0.1} to={cue('Its AI agent')}>
      <Stage gap={50}>
        <Letters d={0.05} text="Meta Connect" style={{...display(140), justifyContent: 'center'}} />
        <GlassesDraw at={para(3).start + 0.3} />
        <Rise at={cue('wearables')}>
          <Chip accent dot={C.accent}>
            All in on wearables
          </Chip>
        </Rise>
      </Stage>
    </Beat>

    <Beat from={cue('Its AI agent')} to={cue('Then came')}>
      <Stage gap={28}>
        <Label style={{color: C.accentHover}}>Meta's AI agent</Label>
        <Letters at={cue('Muse', cue('agent')) - 0.1} text="Muse" style={{...display(200, C.text), ...glow('rgba(250,90,5,.45)', 50)}} />
        <Glass d={0.35} style={{padding: 34, display: 'flex', flexDirection: 'column', gap: 18}}>
          <Task at={cue('book')} text="Book a restaurant" />
          <Task at={cue('order')} text="Order groceries" />
          <Task at={cue('plan')} text="Plan a trip" />
        </Glass>
        <Rise at={cue('plan') + 0.3}>
          <Label>With OpenTable · Spotify · Ticketmaster</Label>
        </Rise>
      </Stage>
    </Beat>

    <Beat from={cue('Then came')} to={cue('New Ray-Ban')}>
      <Stage gap={10}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <Charm at={cue('Muse Charm') - 0.2} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
            <Letters at={cue('Muse Charm')} text="Muse Charm" style={{...display(104), width: 480}} />
            <Chip at={cue('keychain-sized')}>Keychain-sized</Chip>
            <Chip at={cue('no glasses')}>No glasses needed</Chip>
            <Chip at={cue('December')} accent dot={C.accent}>
              Launches December
            </Chip>
          </div>
        </div>
        <Label style={{fontSize: 20, opacity: 0.8}}>Illustration</Label>
      </Stage>
    </Beat>

    <Beat from={cue('New Ray-Ban')} to={cue('And Zuckerberg')}>
      <Stage gap={40}>
        <Letters at={cue('Ray-Ban')} text="Ray-Ban Meta Audio" style={{...display(96), justifyContent: 'center'}} stagger={0.03} />
        <GlassesDraw at={cue('Ray-Ban') + 0.2} scale={0.9} />
        <div style={{display: 'flex', alignItems: 'center', gap: 34}}>
          <div style={{...display(170, C.accentHover), ...glow()}}>
            <Count to={349} at={cue('three hundred forty-nine') - 0.1} dur={1} format={(n) => `$${Math.round(n)}`} />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            <Chip at={cue('forty-nine')}>≈ RM1,430</Chip>
            <Chip at={cue('dollars', cue('forty-nine'))} accent>
              October
            </Chip>
          </div>
        </div>
      </Stage>
    </Beat>

    <Beat from={cue('And Zuckerberg')} to={para(3).end + 0.3}>
      <Stage gap={36}>
        <PersonCard id="zuckerberg" name="Mark Zuckerberg" role="CEO · Meta" d={0.1} style={{width: 900}} />
        <Rise at={cue('pushed back')}>
          <Chip dot={C.danger}>Pushing back on AI doom</Chip>
        </Rise>
        <Glass at={cue('We are') - 0.3} style={{width: 900, padding: '30px 50px 50px'}}>
          <BigQuoteMark />
          <SpokenQuote words={wordsOf('"We are optimists, because we believe in people."')} size={74} hot={['optimists', 'people']} />
        </Glass>
      </Stage>
    </Beat>
  </>
);
