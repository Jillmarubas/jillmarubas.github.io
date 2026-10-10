import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {ThumbStyle, Words} from '../thumbs/HighlightThumb';
import {LivingGradient} from '../gradient/GradientLoop';
import {Tile} from './brand';
import '../gpt1010/fonts';

/*
 * YouTube thumbnails for "ChatGPT vs Claude vs Gemini" (AI News, 10 Oct 2026), approved style (SOP
 * "Thumbnails"), built in Remotion: the three app tiles, one glowing, three words on the left.
 */
const INK = '#0B0B0D';
const Grain: React.FC = () => <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, opacity: 0.06, mixBlendMode: 'overlay'}} />;

const Hero: React.FC<{hot: 'gpt' | 'claude' | 'gemini' | 'none'}> = ({hot}) => (
  <div style={{position: 'absolute', left: 900, top: 230, width: 960, height: 640}}>
    {(['gpt', 'claude', 'gemini'] as const).map((b, k) => {
      const on = hot === b;
      const pos = [{x: 0, y: 60, r: -8}, {x: 330, y: 0, r: 0}, {x: 660, y: 60, r: 8}][k];
      return (
        <div key={b} style={{position: 'absolute', left: pos.x, top: pos.y, transform: `rotate(${pos.r}deg) scale(${on ? 1.12 : 1})`, zIndex: on ? 2 : 1, filter: hot !== 'none' && !on ? 'brightness(.55) grayscale(.4)' : undefined}}>
          <Tile b={b} size={300} glow={on ? 1 : 0.45} />
        </div>
      );
    })}
    <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontFamily: 'Geist, sans-serif', fontWeight: 900, fontSize: 150, letterSpacing: '-0.04em', color: '#F2C14E', textShadow: '0 10px 40px rgba(0,0,0,.7)'}}>VS</div>
  </div>
);

const Thumb: React.FC<{style: ThumbStyle; words: [string, string, string]; hot?: 'gpt' | 'claude' | 'gemini' | 'none'}> = ({style, words, hot = 'none'}) => (
  <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
    <LivingGradient palette={{edge: '#0B0B0D', mid: '#111216', glow: '#2A2210', haze: '#141826'}} loop={900} grain={0} />
    <Hero hot={hot} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(11,11,13,0.9) 0%, rgba(11,11,13,0.5) 38%, rgba(11,11,13,0) 52%)'}} />
    <div style={{position: 'absolute', left: 70, top: style === 'highlighter' ? 330 : 230, transform: 'scale(0.9)', transformOrigin: 'left top'}}>
      <Words words={words} style={style} ink={INK} />
    </div>
    <Grain />
  </AbsoluteFill>
);

/** A — recommended. */
export const VSThumbA: React.FC = () => <Thumb style="marker" words={['ONLY', 'NEED', 'ONE']} />;
/** B — same words, highlighter treatment. */
export const VSThumbB: React.FC = () => <Thumb style="highlighter" words={['ONLY', 'NEED', 'ONE']} />;
/** C — different words: the price tie. */
export const VSThumbC: React.FC = () => <Thumb style="marker" words={['SAME', '$20', 'PRICE?']} />;
