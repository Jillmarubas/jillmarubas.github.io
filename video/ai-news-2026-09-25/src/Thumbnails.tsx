import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Field} from './components/Field';
import {C, F} from './theme';

// Three thumbnail variants for YouTube's Test & Compare, one variable apart:
// A = faces + stakes, B = price war, C = the mystery. Key content stays in the
// middle square (y 420-1500) so it survives the Shorts shelf's crop.

const shout = (size: number, color: string = C.text): React.CSSProperties => ({
  fontFamily: F.display,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 0.9,
  letterSpacing: '-.04em',
  color,
  textTransform: 'uppercase',
  textShadow: '0 10px 40px rgba(0,0,0,.65), 0 0 2px rgba(0,0,0,.9)',
});

const Tag: React.FC<{children: React.ReactNode; dot?: string; style?: React.CSSProperties}> = ({children, dot = C.accent, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 18,
      padding: '18px 34px',
      borderRadius: 999,
      background: 'rgba(12,10,8,.72)',
      border: '3px solid rgba(255,255,255,.2)',
      fontFamily: F.mono,
      fontWeight: 600,
      fontSize: 38,
      letterSpacing: '.12em',
      color: C.text,
      ...style,
    }}
  >
    <span style={{width: 20, height: 20, borderRadius: 20, background: dot, boxShadow: `0 0 20px ${dot}`}} />
    {children}
  </div>
);

const Brand: React.FC = () => (
  <div style={{position: 'absolute', top: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16}}>
    <div style={{width: 22, height: 22, borderRadius: 6, background: C.accent, boxShadow: '0 0 20px rgba(250,90,5,.9)'}} />
    <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 40, color: C.text, letterSpacing: '.02em'}}>AI NEWS TODAY</div>
  </div>
);

/** A face in full colour with the orange rim light of the field. */
const Face: React.FC<{src: string; size: number; style?: React.CSSProperties; pos?: string}> = ({src, size, style, pos = '50% 30%'}) => (
  <div
    style={{
      width: size,
      height: size * 1.18,
      borderRadius: 48,
      overflow: 'hidden',
      border: '5px solid rgba(255,255,255,.35)',
      boxShadow: '0 40px 90px rgba(0,0,0,.6), 0 0 80px rgba(250,90,5,.45)',
      position: 'relative',
      ...style,
    }}
  >
    <Img src={staticFile(`people/${src}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter: 'contrast(1.12) saturate(1.1)'}} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(200deg, rgba(250,90,5,.28), rgba(250,90,5,0) 45%)', mixBlendMode: 'screen'}} />
  </div>
);

const Plate: React.FC<{src: string; opacity?: number; pos?: string}> = ({src, opacity = 0.35, pos = '50% 50%'}) => (
  <AbsoluteFill style={{opacity}}>
    <Img src={staticFile(`plates/${src}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter: 'grayscale(1) contrast(1.2)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(160deg, rgba(250,90,5,.9), rgba(214,31,90,.75) 55%, rgba(124,58,190,.8))', mixBlendMode: 'color'}} />
  </AbsoluteFill>
);

const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(90% 60% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,.7) 100%)'}} />
);

/** A: the two CEOs, and the stakes. */
export const ThumbRisk: React.FC = () => (
  <AbsoluteFill style={{background: C.ground}}>
    <Field />
    <Plate src="un2" opacity={0.3} />
    <Vignette />
    <Brand />
    <AbsoluteFill style={{alignItems: 'center', top: 330}}>
      <Tag dot={C.danger}>WARNING AT THE UN</Tag>
    </AbsoluteFill>
    <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 0}}>
      <Face src="altman" size={470} style={{transform: 'rotate(-4deg) translateX(30px)', zIndex: 1}} pos="45% 25%" />
      <Face src="amodei" size={470} style={{transform: 'rotate(4deg) translateX(-30px)'}} pos="50% 30%" />
    </div>
    <div style={{position: 'absolute', top: 1090, left: 0, right: 0, textAlign: 'center'}}>
      <div style={shout(190)}>Risk to</div>
      <div style={{...shout(142, C.accentHover), textShadow: '0 0 60px rgba(250,90,5,.8), 0 10px 40px rgba(0,0,0,.7)'}}>humanity?</div>
    </div>
  </AbsoluteFill>
);

const PriceCard: React.FC<{maker: string; name: string; price: string; hot?: boolean}> = ({maker, name, price, hot}) => (
  <div
    style={{
      width: 440,
      padding: '40px 36px',
      borderRadius: 44,
      background: 'rgba(12,10,8,.62)',
      border: `4px solid ${hot ? 'rgba(250,90,5,.8)' : 'rgba(255,255,255,.22)'}`,
      boxShadow: hot ? '0 0 90px rgba(250,90,5,.45)' : '0 40px 90px rgba(0,0,0,.5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      backdropFilter: 'blur(28px)',
    }}
  >
    <div style={{fontFamily: F.mono, fontSize: 32, letterSpacing: '.12em', color: C.accentHover}}>{maker}</div>
    <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 64, lineHeight: 1, color: C.text}}>{name}</div>
    <div style={{...shout(170, hot ? C.accentHover : C.text), textShadow: hot ? '0 0 50px rgba(250,90,5,.8)' : undefined}}>{price}</div>
  </div>
);

/** B: two launches, one price war. */
export const ThumbPriceWar: React.FC = () => (
  <AbsoluteFill style={{background: C.ground}}>
    <Field />
    <Plate src="servers" opacity={0.28} />
    <Vignette />
    <Brand />
    <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center'}}>
      <div style={shout(230)}>Price</div>
      <div style={{...shout(260, C.accentHover), textShadow: '0 0 60px rgba(250,90,5,.8), 0 10px 40px rgba(0,0,0,.7)'}}>war</div>
    </div>
    <div style={{position: 'absolute', top: 870, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0}}>
      <div style={{transform: 'rotate(-3deg)'}}>
        <PriceCard maker="ANTHROPIC" name="Opus 5.5" price="$20" />
      </div>
      <div style={{...shout(120, C.text), margin: '0 -30px', zIndex: 2, width: 170, height: 170, borderRadius: 170, display: 'grid', placeItems: 'center', background: C.accent, color: '#0a0a0a', textShadow: 'none', fontSize: 76, boxShadow: '0 0 60px rgba(250,90,5,.9)'}}>VS</div>
      <div style={{transform: 'rotate(3deg)'}}>
        <PriceCard maker="OPENAI" name="GPT-6 Sol" price="$2" hot />
      </div>
    </div>
    <AbsoluteFill style={{alignItems: 'center', top: 1420}}>
      <Tag>LAUNCHED MINUTES APART</Tag>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** C: the mystery: something AI found inside a virus's DNA. */
export const ThumbMystery: React.FC = () => (
  <AbsoluteFill style={{background: C.ground}}>
    <Field />
    <Vignette />
    <Brand />
    <div style={{position: 'absolute', top: 360, left: 90, right: 90, height: 900, borderRadius: 56, overflow: 'hidden', border: '5px solid rgba(255,255,255,.3)', boxShadow: '0 50px 100px rgba(0,0,0,.6)'}}>
      <Img src={staticFile('plates/phage.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '42% 35%', transform: 'scale(1.35)', filter: 'grayscale(1) contrast(1.25) brightness(1.05)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(160deg, rgba(250,90,5,.55), rgba(124,58,190,.55))', mixBlendMode: 'color'}} />
      {/* the circle: on the phage's head, where its DNA is packed */}
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}} viewBox="0 0 900 900" preserveAspectRatio="none">
        <ellipse cx={430} cy={250} rx={170} ry={190} fill="none" stroke={C.accentHover} strokeWidth={14} style={{filter: 'drop-shadow(0 0 18px rgba(250,90,5,.95))'}} />
        <path d="M640 610 L560 420" stroke={C.accentHover} strokeWidth={16} strokeLinecap="round" />
        <path d="M530 470 L560 420 L605 455" fill="none" stroke={C.accentHover} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: 36, bottom: 30}}>
        <Tag dot={C.accent} style={{fontSize: 30}}>950 CLAUDE AGENTS</Tag>
      </div>
    </div>
    <div style={{position: 'absolute', top: 1300, left: 0, right: 0, textAlign: 'center'}}>
      <div style={shout(170)}>AI found</div>
      <div style={{...shout(230, C.accentHover), textShadow: '0 0 60px rgba(250,90,5,.8), 0 10px 40px rgba(0,0,0,.7)'}}>this?</div>
    </div>
  </AbsoluteFill>
);

/** A in 16:9, for the channel page and anywhere a landscape thumbnail is needed. */
export const ThumbRiskWide: React.FC = () => (
  <AbsoluteFill style={{background: C.ground}}>
    <AbsoluteFill style={{transform: 'scale(1)', }}>
      <Field />
    </AbsoluteFill>
    <Plate src="un2" opacity={0.32} />
    <AbsoluteFill style={{background: 'radial-gradient(80% 90% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,.7) 100%)'}} />
    <div style={{position: 'absolute', left: 40, top: 110, display: 'flex', gap: 0}}>
      <Face src="altman" size={290} style={{transform: 'rotate(-4deg) translateX(20px)', zIndex: 1}} pos="45% 25%" />
      <Face src="amodei" size={290} style={{transform: 'rotate(4deg) translateX(-20px)'}} pos="50% 30%" />
    </div>
    <div style={{position: 'absolute', right: 50, top: 170, width: 640, textAlign: 'right'}}>
      <div style={shout(120)}>Risk to</div>
      <div style={{...shout(94, C.accentHover), textShadow: '0 0 50px rgba(250,90,5,.8), 0 8px 30px rgba(0,0,0,.7)'}}>humanity?</div>
      <div style={{marginTop: 34}}>
        <Tag dot={C.danger} style={{fontSize: 26, padding: '12px 24px'}}>WARNING AT THE UN</Tag>
      </div>
    </div>
  </AbsoluteFill>
);
