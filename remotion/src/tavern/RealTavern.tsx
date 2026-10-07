import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Loop, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import envelope from '../../public/tavern/envelope.json';
import '../promo/fonts';

/*
 * "Rainy Tavern Night", photoreal version: an AI-generated photoreal still (seedream-5-pro) animated by
 * an image-to-video model (kling-3-pro), made seamless by playing it forward then in reverse (loop.mp4, 10.07 s),
 * looped under the full track. Remotion adds the music-reactive warm light, grain, vignette, the title card and fades.
 */
export const REAL_TAVERN_FPS = 30;
export const REAL_TAVERN_FULL = envelope.frames;
export const REAL_TAVERN_TEST = 45 * REAL_TAVERN_FPS;
const LOOP_FRAMES = 302; // loop.mp4 = 10.0667 s at 30 fps

const envAt = (frame: number) => envelope.env[Math.min(envelope.env.length - 1, Math.max(0, Math.floor(frame)))];

const sinceOnset = (t: number) => {
  let last = -10;
  for (const o of envelope.onsets) {
    if (o <= t) last = o;
    else break;
  }
  return t - last;
};

export const RealTavern: React.FC<{frames?: number; sound?: boolean}> = ({frames = REAL_TAVERN_TEST, sound = true}) => {
  const frame = useCurrentFrame();
  const t = frame / REAL_TAVERN_FPS;
  const glow = Math.pow(envAt(frame), 1.4);
  const pulse = Math.max(0, 1 - sinceOnset(t) / 0.5) * 0.3;
  const light = Math.min(1, glow * 0.8 + pulse);

  // title card: in at 1 s, out by ~7.5 s
  const titleOp = interpolate(frame, [30, 66, 190, 232], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleRise = interpolate(frame, [30, 74], [16, 0], {easing: Easing.bezier(0.22, 1, 0.36, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeIn = interpolate(frame, [0, 45], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [frames - 75, frames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#050403'}}>
      {sound && <Audio src={staticFile('tavern/music.mp3')} />}

      {/* the photoreal animated plate, looped */}
      <AbsoluteFill style={{filter: `brightness(${1 + light * 0.07}) saturate(${1.02 + light * 0.06})`}}>
        <Loop durationInFrames={LOOP_FRAMES}>
          <OffthreadVideo src={staticFile('tavern/loop.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Loop>
      </AbsoluteFill>

      {/* music-reactive warm light blooming from the hearth (left) and the candles (right) */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 34% 40% at 24% 74%, rgba(255,150,50,${0.05 + light * 0.2}) 0%, rgba(255,150,50,0) 100%), radial-gradient(ellipse 14% 22% at 76% 78%, rgba(255,190,100,${0.03 + light * 0.1}) 0%, rgba(255,190,100,0) 100%)`,
          mixBlendMode: 'screen',
        }}
      />

      {/* soft vignette + film grain */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundPosition: `${(frame * 37) % 1024}px ${(frame * 53) % 1024}px`, opacity: 0.07, mixBlendMode: 'overlay'}} />

      {/* title card */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: titleOp, transform: `translateY(${titleRise}px)`}}>
        <div style={{textAlign: 'center', fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#F6E7C4', textShadow: '0 4px 40px rgba(0,0,0,0.8)'}}>
          <div style={{fontSize: 30, letterSpacing: 14, textTransform: 'uppercase', opacity: 0.85}}>tabletop ambience</div>
          <div style={{fontSize: 130, fontWeight: 600, marginTop: 8}}>Rainy Tavern Night</div>
          <div style={{fontSize: 34, opacity: 0.8, marginTop: 6}}>cozy fantasy music for your game</div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut)}} />
    </AbsoluteFill>
  );
};
