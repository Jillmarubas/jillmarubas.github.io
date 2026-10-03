import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ThumbStyle, Words} from '../thumbs/HighlightThumb';

/*
 * YouTube thumbnails for "Claude Code Just Got Mods" (AI News, 3 Oct 2026), approved style
 * (SOP "Thumbnails"). The reaction photo is a FICTIONAL person generated with ElevenLabs at the
 * user's request on 3 Oct 2026 (an exception to the voiceover-only rule). The Claude symbol is
 * composited here (Wikimedia Commons, CC0). `ink` is the film's darkest colour.
 */
const INK = '#0B0C0F';
const Grain: React.FC = () => <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, opacity: 0.06, mixBlendMode: 'overlay'}} />;
const Vignette: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 85% at 55% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />;
const Scrim: React.FC = () => <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(11,12,15,0.94) 0%, rgba(11,12,15,0.6) 36%, rgba(11,12,15,0) 56%)'}} />;

const Thumb: React.FC<{photo: string; style: ThumbStyle; words: [string, string, string]; flip?: boolean}> = ({photo, style, words, flip}) => (
  <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
    <Img src={staticFile(`cc1003/thumb/${photo}.jpg`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: flip ? 'scaleX(-1)' : undefined, filter: 'contrast(1.08) saturate(1.12)'}} />
    <Scrim />
    {/* Claude symbol, top left, with a warm glow */}
    <div style={{position: 'absolute', left: 82, top: 70, display: 'flex', alignItems: 'center', gap: 22, filter: 'drop-shadow(0 0 30px rgba(217,119,87,.6)) drop-shadow(0 10px 20px rgba(0,0,0,.6))'}}>
      <Img src={staticFile('cc1003/claude.svg')} style={{width: 110, height: 110}} />
      <span style={{fontFamily: 'Geist, sans-serif', fontWeight: 900, fontSize: 64, color: '#F4F1EC', letterSpacing: '-0.03em'}}>Claude Code</span>
    </div>
    <div style={{position: 'absolute', left: 70, top: style === 'highlighter' ? 360 : 250, transform: style === 'highlighter' ? 'scale(0.9)' : 'scale(0.92)', transformOrigin: 'left top'}}>
      <Words words={words} style={style} ink={INK} />
    </div>
    <Grain />
    <Vignette />
  </AbsoluteFill>
);

const W: [string, string, string] = ['MODS', 'JUST', 'DROPPED'];
/** A — recommended: marker treatment. */
export const CCThumbA: React.FC = () => <Thumb photo="p1" style="marker" words={W} />;
/** B — same photo, highlighter words. */
export const CCThumbB: React.FC = () => <Thumb photo="p1" style="highlighter" words={W} />;
/** C — a different photo from the same set, same words. */
export const CCThumbC: React.FC = () => <Thumb photo="p2" style="marker" words={W} />;
