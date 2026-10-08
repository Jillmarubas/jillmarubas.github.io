import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';

/*
 * "Golden Fire" festival music video. Kling clips (public/gf/Cxx.mp4, 1284x716, silent) cut on the
 * song's beat grid (128.78 BPM, first beat at 0.06 s, 32-beat phrases). Each shot is
 * [clip, length in beats, start offset in the clip (s), playback rate]. On the drops every beat
 * gets a small zoom punch and each bar a warm flash; the three drops open with a white hit.
 */
export const GF_FPS = 30;
const SONG = 292.8;
export const GF_DURATION = Math.round(SONG * GF_FPS);
const BEAT = 60 / 128.78;
const PHASE = 0.06;
const beatTime = (b: number) => PHASE + b * BEAT;

type Shot = [clip: string, beats: number, offset: number, rate?: number];

const SHOTS: Shot[] = [
  // intro 0-32 (dusk, calm)
  ['C01_web', 8, 0], ['C02', 8, 0], ['C03', 8, 0.6], ['C01', 8, 0.8],
  // verse 32-96
  ['C04', 4, 0.3], ['C05', 4, 0], ['C06', 4, 0], ['C09', 4, 0.2],
  ['C08', 4, 0], ['C05', 4, 2.0], ['C04', 4, 2.2], ['C06', 4, 2.0],
  ['C07', 4, 0], ['C23', 4, 0.5], ['C09', 4, 2.2], ['C28', 4, 0],
  ['C17', 4, 0], ['C08', 4, 2.0], ['C11', 4, 0], ['C07', 4, 2.0],
  // pre-chorus 96-128
  ['C29', 4, 0], ['C10', 4, 0], ['C12', 4, 0], ['C11', 4, 2.0],
  ['C30', 4, 0], ['C28', 4, 2.0], ['C29', 4, 2.0], ['C12', 4, 1.8],
  // build 128-160, cuts speed up
  ['C10', 4, 1.5], ['C30', 4, 2.0], ['C11', 4, 1.0], ['C06', 4, 1.0],
  ['C28', 2, 3.0], ['C12', 2, 2.8], ['C29', 2, 3.0], ['C10', 2, 3.2], ['C11', 2, 3.0], ['C30', 2, 3.2],
  ['C05', 1, 3.5], ['C17', 1, 3.5], ['C09', 1, 3.5], ['C04', 1, 3.5],
  // drop 1 160-256
  ['C13', 4, 0], ['C15', 2, 0], ['C14', 2, 0], ['C17', 4, 1.0], ['C16', 4, 0],
  ['C19', 2, 0], ['C20', 2, 0], ['C21', 4, 0], ['C15', 2, 1.5], ['C14', 2, 1.5], ['C13', 4, 1.6],
  ['C22', 4, 0], ['C09', 4, 1.0], ['C16', 4, 2.0], ['C05', 2, 1.0], ['C10', 2, 1.0],
  ['C20', 4, 1.8], ['C21', 2, 2.0], ['C19', 2, 1.2], ['C15', 4, 3.0], ['C17', 4, 3.0],
  ['C14', 2, 3.0], ['C22', 2, 1.8], ['C13', 4, 3.0], ['C16', 4, 3.0], ['C20', 2, 3.0], ['C11', 2, 3.0],
  ['C21', 4, 3.0], ['C12', 4, 0.5], ['C15', 4, 0.5], ['C22', 4, 2.5],
  // main drop 256-320
  ['C18', 4, 0], ['C33', 2, 1.6], ['C14', 2, 0.8], ['C19', 2, 0.5], ['C20', 2, 0.8], ['C21', 2, 3.0], ['C15', 2, 0.6],
  ['C18', 4, 1.9], ['C22', 2, 0.6], ['C13', 2, 2.2], ['C16', 2, 1.0], ['C17', 2, 2.2], ['C34', 2, 0.5], ['C14', 2, 2.2],
  ['C33', 4, 2.9], ['C15', 2, 2.2], ['C20', 2, 2.2], ['C21', 2, 1.0], ['C22', 2, 3.0], ['C19', 2, 2.0], ['C13', 2, 1.0],
  ['C18', 4, 3.0], ['C14', 2, 3.2], ['C34', 2, 1.8], ['C16', 4, 1.2], ['C21', 2, 0.2], ['C20', 2, 0.2],
  // transition + break 320-416 (calm, 8-beat shots)
  ['C23', 8, 0.5], ['C24', 8, 0.3], ['C25', 8, 0], ['C26', 8, 0], ['C27', 8, 0.5], ['C25', 8, 1.2],
  ['C26', 8, 1.2], ['C07', 8, 0.5], ['C24', 8, 1.2, 0.8], ['C27', 8, 1.2], ['C25', 8, 0.6, 0.8], ['C26', 8, 0.4, 0.8],
  // build 2 416-512
  ['C28', 8, 0], ['C29', 8, 0], ['C30', 8, 0], ['C06', 8, 0.5],
  ['C10', 4, 0], ['C12', 4, 0], ['C11', 4, 0.5], ['C29', 4, 2.0], ['C28', 4, 2.5], ['C30', 4, 2.5], ['C09', 4, 0.5], ['C34', 4, 0],
  ['C05', 2, 2.0], ['C10', 2, 2.5], ['C11', 2, 2.5], ['C12', 2, 2.5], ['C06', 2, 3.0], ['C17', 2, 3.0], ['C29', 2, 3.5], ['C30', 2, 3.5],
  ['C28', 1, 3.5], ['C10', 1, 3.6], ['C04', 1, 3.6], ['C09', 1, 3.6], ['C05', 1, 3.6], ['C11', 1, 3.6], ['C12', 1, 3.0], ['C17', 1, 3.6],
  ['C29', 1, 3.6], ['C30', 1, 3.6], ['C06', 1, 3.6], ['C28', 1, 3.8], ['C10', 1, 3.8], ['C11', 1, 3.8], ['C05', 1, 3.8], ['C12', 1, 3.2],
  // final drop 512-576
  ['C31', 4, 0.5], ['C32', 4, 0], ['C33', 2, 2.0], ['C34', 2, 2.0], ['C18', 2, 0.8], ['C14', 2, 1.0],
  ['C31', 4, 2.4], ['C32', 2, 2.0], ['C20', 2, 1.4], ['C22', 2, 1.4], ['C15', 2, 1.4], ['C19', 2, 0.2], ['C21', 2, 0.4],
  ['C33', 4, 3.0], ['C34', 2, 3.0], ['C13', 2, 0.4], ['C16', 4, 2.6], ['C32', 4, 3.0], ['C18', 2, 2.6], ['C14', 2, 2.6],
  ['C31', 4, 3.0], ['C33', 2, 0.6], ['C34', 2, 0.2], ['C20', 2, 2.6], ['C22', 2, 2.6],
  // outro 576-end
  ['C35', 8, 0], ['C26', 8, 0.2, 0.8], ['C24', 8, 0, 0.7], ['C32', 8, 1.9, 0.8], ['C36', 21, 0, 0.5],
];

// absolute frame ranges of every shot
const TIMELINE = (() => {
  let beat = 0;
  return SHOTS.map(([clip, beats, offset, rate = 1], i) => {
    const from = i === 0 ? 0 : Math.round(beatTime(beat) * GF_FPS);
    beat += beats;
    const to = Math.min(GF_DURATION, Math.round(beatTime(beat) * GF_FPS));
    return {clip, from, to, offset, rate};
  });
})();

// beat ranges where the beat punches are active
const HOT: [number, number][] = [[160, 256], [256, 320], [512, 576]];
const DROPS = [160, 256, 512];

const fontHandle = delayRender('fonts');
const geist = new FontFace('GeistBlack', `url(${staticFile('fonts/Geist-900-normal.woff2')}) format('woff2')`, {weight: '900'});
const inter = new FontFace('InterMed', `url(${staticFile('fonts/Inter-500-normal.woff2')}) format('woff2')`, {weight: '500'});
Promise.all([geist.load(), inter.load()]).then((f) => {
  f.forEach((x) => document.fonts.add(x));
  continueRender(fontHandle);
});

export const GoldenFire: React.FC<{from?: number}> = () => {
  const frame = useCurrentFrame();
  const t = frame / GF_FPS;
  const b = (t - PHASE) / BEAT;
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

  const hot = HOT.some(([a, z]) => b >= a && b < z);
  const sinceBeat = b - Math.floor(b);
  const punch = hot ? interpolate(sinceBeat, [0, 0.35], [1.035, 1], {...clamp, easing: Easing.out(Easing.quad)}) : 1;
  const barFlash = hot && Math.floor(b) % 4 === 0 ? interpolate(sinceBeat, [0, 0.5], [0.22, 0], clamp) : 0;
  const dropHit = Math.max(...DROPS.map((d) => (b >= d ? interpolate(b, [d, d + 1.5], [0.85, 0], clamp) : 0)));

  const titleOp = interpolate(t, [2.5, 4, 11, 13.5], [0, 1, 1, 0], clamp);
  const titleScale = interpolate(t, [2.5, 13.5], [0.96, 1.04], clamp);
  const fadeIn = interpolate(frame, [0, 30], [1, 0], clamp);
  const fadeOut = interpolate(t, [SONG - 4, SONG - 0.3], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('gf/music.mp3')} />

      <AbsoluteFill style={{transform: `scale(${punch})`}}>
        {TIMELINE.map((s, i) => (
          <Sequence key={i} from={s.from} durationInFrames={s.to - s.from}>
            <OffthreadVideo
              src={staticFile(`gf/${s.clip}.mp4`)}
              startFrom={Math.round(s.offset * GF_FPS)}
              playbackRate={s.rate}
              muted
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </Sequence>
        ))}
      </AbsoluteFill>

      {/* warm grade, flashes, vignette, grain */}
      <AbsoluteFill style={{background: '#ff9a2e', opacity: 0.06, mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{background: '#ffb347', opacity: barFlash, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: '#fff4e0', opacity: dropHit}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundPosition: `${(frame * 37) % 1024}px ${(frame * 53) % 1024}px`, opacity: 0.05, mixBlendMode: 'overlay'}} />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: titleOp}}>
        <div style={{textAlign: 'center', transform: `scale(${titleScale})`}}>
          <div style={{fontFamily: 'GeistBlack', fontWeight: 900, fontSize: 168, letterSpacing: 18, color: '#ffd77a', textShadow: '0 0 40px rgba(255,140,30,0.9), 0 0 120px rgba(255,90,0,0.6), 0 6px 30px rgba(0,0,0,0.8)'}}>
            GOLDEN FIRE
          </div>
          <div style={{fontFamily: 'InterMed', fontSize: 34, letterSpacing: 16, color: '#fff3dc', marginTop: 10, textTransform: 'uppercase', textShadow: '0 2px 20px rgba(0,0,0,0.9)'}}>
            official music video
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut)}} />
    </AbsoluteFill>
  );
};
