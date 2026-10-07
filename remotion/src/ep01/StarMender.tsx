import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Loop, OffthreadVideo, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';

/*
 * The Late Night Story, test episode: "The Star-Mender of Hollowmere".
 * Picture: the user's Gemini/Veo clips, slowed to 0.75x and made seamless (public/ep01/*.mp4).
 * Sound: Suno Speech narration (3 takes, take 1 trimmed) + ElevenLabs effects, pre-mixed to public/ep01/mix.mp3.
 * Scene cuts are timed to the narration's word timestamps.
 */
export const SM_FPS = 30;
export const SM_DURATION = Math.round(325.2 * SM_FPS);
const XF = 60; // 2 s cross-fade

const SCENES: {src: string; loop: number; from: number; to: number; zoom: [number, number]; origin: string}[] = [
  {src: 'ep01/village.mp4', loop: 355, from: 0, to: 48, zoom: [1.0, 1.08], origin: '50% 60%'},
  {src: 'ep01/climb.mp4', loop: 275, from: 48, to: 88, zoom: [1.02, 1.1], origin: '65% 50%'},
  {src: 'ep01/lantern.mp4', loop: 275, from: 88, to: 155.5, zoom: [1.0, 1.1], origin: '60% 35%'},
  {src: 'ep01/pip1.mp4', loop: 275, from: 155.5, to: 181, zoom: [1.0, 1.06], origin: '50% 30%'},
  {src: 'ep01/pip2.mp4', loop: 275, from: 181, to: 207.5, zoom: [1.06, 1.0], origin: '50% 30%'},
  {src: 'ep01/sleep.mp4', loop: 275, from: 207.5, to: 325.2, zoom: [1.1, 1.0], origin: '65% 55%'},
];

const fontHandle = delayRender('cinzel');
const cinzel = new FontFace('CinzelD', `url(${staticFile('fonts/CinzelDecorative-700-normal.woff2')}) format('woff2')`, {weight: '700'});
const corm = new FontFace('CG', `url(${staticFile('fonts/CormorantGaramond-500-italic.woff2')}) format('woff2')`, {style: 'italic', weight: '500'});
Promise.all([cinzel.load(), corm.load()]).then((f) => {
  f.forEach((x) => document.fonts.add(x));
  continueRender(fontHandle);
});

export const StarMender: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / SM_FPS;
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

  const titleOp = interpolate(t, [2, 4, 9, 11.5], [0, 1, 1, 0], clamp);
  const titleRise = interpolate(t, [2, 4.5], [14, 0], {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)});
  const fadeIn = interpolate(frame, [0, 45], [1, 0], clamp);
  const toBlack = interpolate(t, [314.5, 317.5], [0, 1], clamp);
  const logoOp = interpolate(t, [317.5, 319.5, 323.5, 325.2], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('ep01/mix.mp3')} />
      {SCENES.map((s, i) => {
        const a = Math.round(s.from * SM_FPS);
        const b = Math.round(s.to * SM_FPS);
        const start = i === 0 ? a : a - XF / 2;
        const end = i === SCENES.length - 1 ? b : b + XF / 2;
        if (frame < start || frame >= end) return null;
        const op = i === 0 ? 1 : interpolate(frame, [a - XF / 2, a + XF / 2], [0, 1], clamp);
        const p = (frame - start) / (end - start);
        const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * Easing.inOut(Easing.sin)(p);
        return (
          <AbsoluteFill key={i} style={{opacity: op, transform: `scale(${z})`, transformOrigin: s.origin}}>
            <Loop durationInFrames={s.loop}>
              <OffthreadVideo src={staticFile(s.src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </Loop>
          </AbsoluteFill>
        );
      })}

      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundPosition: `${(frame * 37) % 1024}px ${(frame * 53) % 1024}px`, opacity: 0.05, mixBlendMode: 'overlay'}} />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: titleOp, transform: `translateY(${titleRise}px)`}}>
        <div style={{textAlign: 'center', color: '#fff', textShadow: '0 4px 40px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.6)'}}>
          <div style={{fontFamily: 'CG', fontStyle: 'italic', fontSize: 46, color: '#f3e6c9'}}>The Late Night Story presents</div>
          <div style={{fontFamily: 'CinzelD', fontWeight: 700, fontSize: 104, marginTop: 10, letterSpacing: 3}}>The Star-Mender</div>
          <div style={{fontFamily: 'CinzelD', fontWeight: 700, fontSize: 64, marginTop: 4, letterSpacing: 6, color: '#ffe6a8'}}>of Hollowmere</div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, toBlack)}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: logoOp}}>
        <Img src={staticFile('ep01/logo.png')} style={{width: 720, height: 720}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
