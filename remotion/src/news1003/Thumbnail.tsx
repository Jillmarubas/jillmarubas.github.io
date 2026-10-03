import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Bar, THUMB_RED, THUMB_YELLOW, Words} from '../thumbs/HighlightThumb';
import {Logo3D} from './Logo3D';
import {Brick} from './propsA';
import {Doc} from './propsB';

/*
 * YouTube thumbnails for AI News, 3 Oct 2026, built in Remotion (ElevenLabs is for voiceover only).
 * Approved style (SOP "Thumbnails"): real licensed photos of people in the script, cut out locally
 * with rembg, at most three accurate words in the yellow/red treatment. The field is Autopilot
 * Blue's dark ground with a cobalt bloom; `ink` is its darkest colour (#0C1016).
 */
const INK = '#0C1016';
const cut = (n: string) => staticFile(`news1003/cut/${n}.png`);
const Field: React.FC<{x?: number; y?: number}> = ({x = 70, y = 60}) => (
  <>
    <AbsoluteFill style={{background: `radial-gradient(70% 80% at ${x}% ${y}%, #1D4FA8 0%, #0F2550 40%, ${INK} 85%)`}} />
    <AbsoluteFill style={{background: 'radial-gradient(60% 50% at 70% 115%, rgba(46,134,255,.55), rgba(46,134,255,0) 70%)'}} />
  </>
);
const Grain: React.FC = () => <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, opacity: 0.07, mixBlendMode: 'overlay'}} />;
const Vignette: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 85% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />;
const Scrim: React.FC = () => <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(12,16,22,0.92) 0%, rgba(12,16,22,0.55) 36%, rgba(12,16,22,0) 52%)`}} />;
const Person: React.FC<{n: string; h: number; x: number; y: number; glow?: string; fade?: [number, number]}> = ({n, h, x, y, glow = 'rgba(46,134,255,0.5)', fade}) => {
  const mask = fade ? `linear-gradient(to bottom, #000 ${fade[0]}%, transparent ${fade[1]}%)` : undefined;
  return (
    <div style={{position: 'absolute', left: x, top: y, filter: `drop-shadow(6px 0 0 #fff) drop-shadow(-6px 0 0 #fff) drop-shadow(0 6px 0 #fff) drop-shadow(0 -6px 0 #fff) drop-shadow(0 26px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 70px ${glow}) contrast(1.06) saturate(1.08)`}}>
      <Img src={cut(n)} style={{display: 'block', height: h, WebkitMaskImage: mask, maskImage: mask}} />
    </div>
  );
};

/** A — AI WENT ROGUE: California's AG, arms crossed, beside the OpenAI mark and a subpoena. */
export const N3ThumbA: React.FC = () => (
  <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
    <Field />
    <div style={{position: 'absolute', left: 1020, top: 60, transform: 'rotate(-8deg)'}}>
      <Logo3D name="openai" w={460} h={420} at={-40} fit={0.85} />
    </div>
    <div style={{position: 'absolute', left: 1500, top: 470, transform: 'rotate(9deg)', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.5))'}}>
      <Doc w={360} title="Subpoena" lines={8} seed="t" />
    </div>
    <Person n="bonta" h={980} x={1060} y={250} />
    <Scrim />
    <div style={{position: 'absolute', left: 70, top: 190}}>
      <Words words={['AI', 'WENT', 'ROGUE']} style="marker" ink={INK} />
    </div>
    <Grain />
    <Vignette />
  </AbsoluteFill>
);

/** B — same photo, different words: OPENAI SUBPOENAED (highlighter). */
export const N3ThumbB: React.FC = () => {
  // three stacked lines, sized to fill the left side top to bottom without touching Bonta
  const base: React.CSSProperties = {fontFamily: 'Geist, sans-serif', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.92};
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Field />
      <div style={{position: 'absolute', left: 1250, top: 20, transform: 'rotate(-8deg)'}}>
        <Logo3D name="openai" w={420} h={380} at={-40} fit={0.85} />
      </div>
      <div style={{position: 'absolute', left: 1620, top: 480, transform: 'rotate(9deg)', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.5))'}}>
        <Doc w={330} title="Subpoena" lines={8} seed="t" />
      </div>
      <Person n="bonta" h={980} x={1225} y={250} />
      <Scrim />
      <div style={{...base, position: 'absolute', left: 64, top: 150, transform: 'rotate(-2deg)', transformOrigin: 'left center'}}>
        <div style={{fontSize: 252, color: INK}}>
          <Bar color={THUMB_YELLOW} rot={-1} pad="0.02em 0.3em 0.08em" ink={INK}>
            OPENAI
          </Bar>
        </div>
        <div style={{fontSize: 252, color: INK, marginTop: 40}}>
          <Bar color={THUMB_YELLOW} rot={1} pad="0.02em 0.3em 0.08em" ink={INK}>
            GETS
          </Bar>
        </div>
        <div style={{fontSize: 154, color: '#F4F6FB', marginTop: 56}}>
          <Bar color={THUMB_RED} rot={-1.5} pad="0.04em 0.26em 0.1em" ink={INK}>
            SUBPOENAED
          </Bar>
        </div>
      </div>
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};

/** C — a different story: AWS's CEO and the $1B brick. "$1B PEACE OFFERING". */
export const N3ThumbC: React.FC = () => (
  <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
    <Field x={72} y={50} />
    <div style={{position: 'absolute', left: 1080, top: 640, transform: 'rotate(-10deg)', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.55))', zIndex: 3}}>
      <Brick w={560} label="$1B" />
    </div>
    <Person n="garman" h={820} x={1150} y={140} fade={[80, 97]} />
    <div style={{position: 'absolute', left: 1020, top: 30}}>
      <Logo3D name="amazon" w={380} h={180} at={-40} fit={0.85} />
    </div>
    <Scrim />
    <div style={{position: 'absolute', left: 70, top: 190}}>
      <Words words={['$1B', 'PEACE', 'OFFERING']} style="marker" ink={INK} />
    </div>
    <Grain />
    <Vignette />
  </AbsoluteFill>
);

export {Bar, THUMB_RED, THUMB_YELLOW};
