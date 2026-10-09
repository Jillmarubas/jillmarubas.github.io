import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Loop, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import envelope from '../../public/tavern/envelope.json';
import '../promo/fonts';

/*
 * "Rainy Tavern Night" built from real AI video clips (the user's Gemini/Veo animations of each angle).
 * Each clip was made seamless with a 1.5 s end-to-start crossfade (veoN.mp4, 1920x1080, 30 fps, silent).
 * Angles cross-fade across the track; Remotion adds only a light music-reactive warmth, grain, vignette,
 * the title card and fades, so the motion itself stays real.
 */
export const VEO_FPS = 30;
export const VEO_FULL = envelope.frames;
export const VEO_TEST = 45 * VEO_FPS;
const XF = 60; // cross-fade between angles, frames

// add clips here as they arrive; frames = loop length at 30 fps
const CLIPS: {src: string; frames: number}[] = [{src: 'tavern/veo1.mp4', frames: 255}];

const envAt = (f: number) => envelope.env[Math.min(envelope.env.length - 1, Math.max(0, Math.floor(f)))];

export const VeoTavern: React.FC<{frames?: number; sound?: boolean}> = ({frames = VEO_TEST, sound = true}) => {
  const frame = useCurrentFrame();
  const light = Math.pow(envAt(frame), 1.4);
  // cycle through the angles; with one clip this is a single continuous scene
  const n = CLIPS.length;
  const segs = n === 1 ? 1 : n + 1; // return to the first angle at the end
  const segLen = frames / segs;
  const order = Array.from({length: segs}, (_, i) => CLIPS[i % n]);

  const titleOp = interpolate(frame, [30, 66, 190, 232], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleRise = interpolate(frame, [30, 74], [16, 0], {easing: Easing.bezier(0.22, 1, 0.36, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeIn = interpolate(frame, [0, 45], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [frames - 75, frames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#050403'}}>
      {sound && <Audio src={staticFile('tavern/music.mp3')} />}

      {order.map((c, i) => {
        const a = Math.round(i * segLen);
        const b = Math.round((i + 1) * segLen);
        const from = i === 0 ? a : a - XF / 2;
        const to = i === segs - 1 ? b : b + XF / 2;
        if (frame < from || frame >= to) return null;
        const op = i === 0 ? 1 : interpolate(frame, [a - XF / 2, a + XF / 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        // very slow push-in so long holds never feel frozen
        const p = (frame - from) / (to - from);
        const s = 1 + 0.04 * Easing.inOut(Easing.sin)(p);
        return (
          <AbsoluteFill key={i} style={{opacity: op, transform: `scale(${s})`}}>
            <Loop durationInFrames={c.frames}>
              <OffthreadVideo src={staticFile(c.src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </Loop>
          </AbsoluteFill>
        );
      })}

      {/* light warmth that swells with the music, then vignette + grain */}
      <AbsoluteFill style={{background: '#FF9A2E', opacity: 0.015 + light * 0.04, mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundPosition: `${(frame * 37) % 1024}px ${(frame * 53) % 1024}px`, opacity: 0.06, mixBlendMode: 'overlay'}} />

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
