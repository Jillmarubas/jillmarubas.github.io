import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';

/*
 * "The Star-Mender of Hollowmere", slideshow version (no looping video).
 * Each shot is one of the user's stills with a slow Ken Burns move (zoom about a focus point),
 * cross-faded every 20-30 s. Wide shots and close crops of the same still alternate so the
 * picture changes without any motion ever repeating. Audio is the same pre-mixed track.
 */
export const SMS_FPS = 30;
export const SMS_DURATION = Math.round(325.2 * SMS_FPS);
const XF = 75; // 2.5 s cross-fade

type Shot = {src: string; from: number; to: number; z: [number, number]; origin: string};
const SHOTS: Shot[] = [
  {src: 'ep01/s_village.jpg', from: 0, to: 48, z: [1.0, 1.12], origin: '50% 55%'},
  {src: 'ep01/s_climb.jpg', from: 48, to: 68, z: [1.0, 1.08], origin: '60% 50%'},
  {src: 'ep01/s_climb.jpg', from: 68, to: 90, z: [1.35, 1.48], origin: '62% 47%'},
  {src: 'ep01/s_lantern.jpg', from: 90, to: 112, z: [1.0, 1.08], origin: '60% 40%'},
  {src: 'ep01/s_lantern.jpg', from: 112, to: 134, z: [1.5, 1.62], origin: '63% 33%'},
  {src: 'ep01/s_lantern.jpg', from: 134, to: 157, z: [1.4, 1.22], origin: '58% 14%'},
  {src: 'ep01/s_pip.jpg', from: 157, to: 182, z: [1.0, 1.08], origin: '55% 40%'},
  {src: 'ep01/s_pip.jpg', from: 182, to: 208, z: [1.45, 1.56], origin: '62% 30%'},
  {src: 'ep01/s_sleep.jpg', from: 208, to: 240, z: [1.0, 1.08], origin: '60% 55%'},
  {src: 'ep01/s_sleep.jpg', from: 240, to: 268, z: [1.6, 1.72], origin: '63% 47%'},
  {src: 'ep01/s_sleep.jpg', from: 268, to: 292, z: [1.6, 1.48], origin: '82% 76%'},
  {src: 'ep01/s_sleep.jpg', from: 292, to: 325.2, z: [1.15, 1.0], origin: '60% 55%'},
];

const fontHandle = delayRender('fonts');
const cinzel = new FontFace('CinzelD', `url(${staticFile('fonts/CinzelDecorative-700-normal.woff2')}) format('woff2')`, {weight: '700'});
const corm = new FontFace('CG', `url(${staticFile('fonts/CormorantGaramond-500-italic.woff2')}) format('woff2')`, {style: 'italic', weight: '500'});
Promise.all([cinzel.load(), corm.load()]).then((f) => {
  f.forEach((x) => document.fonts.add(x));
  continueRender(fontHandle);
});

export const StarMenderSlides: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / SMS_FPS;
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

  const titleOp = interpolate(t, [2, 4, 9, 11.5], [0, 1, 1, 0], clamp);
  const titleRise = interpolate(t, [2, 4.5], [14, 0], {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)});
  const fadeIn = interpolate(frame, [0, 45], [1, 0], clamp);
  const toBlack = interpolate(t, [314.5, 317.5], [0, 1], clamp);
  const logoOp = interpolate(t, [317.5, 319.5, 323.5, 325.2], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('ep01/mix.mp3')} />
      {SHOTS.map((s, i) => {
        const a = Math.round(s.from * SMS_FPS);
        const b = Math.round(s.to * SMS_FPS);
        const start = i === 0 ? a : a - XF / 2;
        const end = i === SHOTS.length - 1 ? b : b + XF / 2;
        if (frame < start || frame >= end) return null;
        const op = i === 0 ? 1 : interpolate(frame, [a - XF / 2, a + XF / 2], [0, 1], clamp);
        const p = (frame - start) / (end - start);
        const z = s.z[0] + (s.z[1] - s.z[0]) * Easing.inOut(Easing.sin)(p);
        return (
          <AbsoluteFill key={i} style={{opacity: op, overflow: 'hidden'}}>
            <Img src={staticFile(s.src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, transformOrigin: s.origin}} />
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
