// AI News Daily — 29 September 2026. 1920×1080, 30 fps, Cobalt Haze, VO by Asher.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import './fonts';
import {C, clamp, F} from './theme';
import {BLOCKS, TOTAL_FRAMES, blockOf, fr} from './timeline';
import {ITEMS, UI} from './beats';
import {Stage3D} from './Stage3D';
import {Appear, Field, glassBox, Lens, MonoPill, Source} from './ui';

const STORIES = ['Nvidia', 'OpenAI', 'ElevenLabs', 'Instinct', 'Washington'];
const storyStarts = STORIES.map((_, i) => fr(blockOf('stinger', i + 1).start));
const outroStart = fr(BLOCKS.find((b) => b.kind === 'vo' && b.id === 'outro')!.start);
const titleB = blockOf('title');
const endB = blockOf('end');

const HUD: React.FC = () => {
  const f = useCurrentFrame();
  const inTitle = f >= fr(titleB.start) - 6 && f < fr(titleB.start + titleB.len) - 6;
  const inEnd = f >= fr(endB.start) - 6;
  const o = interpolate(f, [8, 20], [0, 1], clamp) * (inTitle || inEnd ? 0 : 1);
  const cur = f >= outroStart ? -1 : storyStarts.filter((s) => f >= s).length - 1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{...glassBox('sheet', 999), position: 'absolute', left: 64, top: 48, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px'}}>
        <span style={{width: 12, height: 12, borderRadius: 6, background: C.ok, boxShadow: `0 0 12px ${C.ok}`}} />
        <span style={{fontFamily: F.sans, fontWeight: 500, fontSize: 26, color: C.text1, letterSpacing: '-0.01em'}}>
          AI News <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.12em'}}>Daily</span>
        </span>
      </div>
      <div style={{...glassBox('sheet', 999), position: 'absolute', right: 64, top: 52, padding: '12px 20px', fontFamily: F.mono, fontWeight: 500, fontSize: 20, letterSpacing: '0.18em', color: C.text2}}>29 SEP 2026</div>
      {/* story rail */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 44,
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          padding: 6,
          borderRadius: 999,
          ...glassBox('sheet', 999),
          opacity: cur >= 0 ? 1 : 0.85,
        }}
      >
        {STORIES.map((s, i) => (
          <div
            key={s}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 16,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: i === cur ? C.cobalt800 : C.text2,
              background: i === cur ? C.frost : 'transparent',
            }}
          >
            0{i + 1} {s}
          </div>
        ))}
      </div>
    </div>
  );
};

const SOURCES = [
  'NVIDIA Newsroom & Technical Blog · CNBC — 28 Sep',
  'NBC News · Decrypt · Fortune · PetaPixel — 25–28 Sep',
  'ElevenLabs blog · TechCrunch — 28 Sep',
  'BusinessWire · TechCrunch · Quartz — 26 Aug, 28 Sep · Axios — 20 Sep',
  'Associated Press — 27 Sep · Axios · ABC News — 24 Sep · Fortune — 23 Sep',
];

const EndCard: React.FC = () => {
  const at = fr(endB.start);
  return (
    <>
      <Appear at={at} out={1e9} style={{left: 0, right: 0, top: 300, textAlign: 'center'}}>
        <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 132, letterSpacing: '-0.055em', color: C.text1}}>
          AI News <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.12em', letterSpacing: 0}}>Daily</span>
        </div>
        <div style={{marginTop: 18}}>
          <MonoPill>THANKS FOR WATCHING</MonoPill>
        </div>
      </Appear>
      <Appear at={at + 10} out={1e9} style={{left: 0, right: 0, top: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        {SOURCES.map((s) => (
          <Source key={s} text={s} />
        ))}
      </Appear>
    </>
  );
};

export const AINews: React.FC<{sound: boolean}> = ({sound}) => {
  const f = useCurrentFrame();
  const fadeIn = interpolate(f, [0, 10], [1, 0], clamp);
  const fadeOut = interpolate(f, [TOTAL_FRAMES - 20, TOTAL_FRAMES - 1], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: C.cobalt950, overflow: 'hidden'}}>
      <Field />
      <Stage3D items={ITEMS} />
      {UI.filter((u) => f >= u.at - 2 && f <= u.out).map((u, i) => (
        <React.Fragment key={`${u.at}-${i}`}>{u.node}</React.Fragment>
      ))}
      <EndCard />
      <HUD />
      <Lens />
      <AbsoluteFill style={{background: C.cobalt950, opacity: Math.max(fadeIn, fadeOut)}} />
      {/* one mastered mix (scripts/mix_news_audio.py): voice -17.8 dBFS RMS, music ducked, cues over music, peaks -1 dBFS */}
      {sound && <Audio src={staticFile('ainews0929/mix.m4a')} />}
    </AbsoluteFill>
  );
};

export const AINEWS_DURATION = TOTAL_FRAMES;
