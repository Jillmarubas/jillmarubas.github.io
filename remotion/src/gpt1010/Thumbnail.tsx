import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ThumbStyle, Words} from '../thumbs/HighlightThumb';
import {LivingGradient} from '../gradient/GradientLoop';
import {GRADIENT} from './design';
import {BillSplitter} from './widgets';
import './fonts';

/*
 * YouTube thumbnails for "ChatGPT Now Builds Answers You Can Click" (AI News, 10 Oct 2026), approved
 * style (SOP "Thumbnails"), built entirely in Remotion: no generated photo (ElevenLabs stays
 * voiceover-only). The hero is the film's own bill-splitter answer, big, with the cursor on "+".
 * The OpenAI mark is composited here (editorial use). `ink` is the film's darkest colour.
 */
const INK = '#0A0C0C';
const Grain: React.FC = () => <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, opacity: 0.06, mixBlendMode: 'overlay'}} />;
const Vignette: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 85% at 55% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)'}} />;

const Hero: React.FC<{people: number}> = ({people}) => (
  <div style={{position: 'absolute', left: 1010, top: 250, transform: 'scale(1.55) rotate(4deg)', transformOrigin: '0 0', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,.7)) drop-shadow(0 0 70px rgba(16,163,127,.45))'}}>
    <div style={{fontFamily: 'Inter, sans-serif', color: '#ECECEC'}}>
      <BillSplitter t={10} p={1} people={people} prevPeople={people} />
    </div>
    {/* cursor on "+" */}
    <svg width={52} height={68} viewBox="0 0 26 34" style={{position: 'absolute', left: 515, top: 153, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.6))'}}>
      <path d="M4 3 L4 26 L9.4 20.9 L13 29.4 L16.6 27.9 L13.1 19.6 L20.4 19.6 Z" fill="#000" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
    <div style={{position: 'absolute', left: 489, top: 127, width: 52, height: 52, borderRadius: 26, border: '4px solid #5FD4B0', opacity: 0.85}} />
  </div>
);

const Thumb: React.FC<{style: ThumbStyle; words: [string, string, string]; people?: number}> = ({style, words, people = 6}) => (
  <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
    <LivingGradient palette={GRADIENT} loop={900} grain={0} />
    <AbsoluteFill style={{background: 'radial-gradient(50% 60% at 78% 50%, rgba(16,163,127,.35), rgba(16,163,127,0) 70%)'}} />
    <Hero people={people} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(10,12,12,0.92) 0%, rgba(10,12,12,0.55) 40%, rgba(10,12,12,0) 58%)'}} />
    <div style={{position: 'absolute', left: 82, top: 70, display: 'flex', alignItems: 'center', gap: 22, filter: 'drop-shadow(0 0 30px rgba(16,163,127,.6)) drop-shadow(0 10px 20px rgba(0,0,0,.6))'}}>
      <Img src={staticFile('gpt1010/openai.svg')} style={{width: 100, height: 100}} />
      <span style={{fontFamily: 'Geist, sans-serif', fontWeight: 900, fontSize: 70, color: '#F1F4F3', letterSpacing: '-0.03em'}}>ChatGPT</span>
    </div>
    <div style={{position: 'absolute', left: 70, top: style === 'highlighter' ? 380 : 260, transform: 'scale(0.9)', transformOrigin: 'left top'}}>
      <Words words={words} style={style} ink={INK} />
    </div>
    <Grain />
    <Vignette />
  </AbsoluteFill>
);

/** A — recommended: marker treatment. */
export const GPTThumbA: React.FC = () => <Thumb style="marker" words={['NOT', 'JUST', 'TEXT']} />;
/** B — same image, highlighter words. */
export const GPTThumbB: React.FC = () => <Thumb style="highlighter" words={['NOT', 'JUST', 'TEXT']} />;
/** C — different words: what it does. */
export const GPTThumbC: React.FC = () => <Thumb style="marker" words={['IT', 'BUILDS', 'TOOLS']} />;
