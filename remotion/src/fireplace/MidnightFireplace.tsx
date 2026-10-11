import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {blackLevel, equalPower, grains, masterFade, PictureGrain} from '../ambience/kit';

/*
 * "Midnight Fireplace Sanctuary": sleep ambience, same rules as RainyNightSanctuary, no narration.
 * The Suno track plays whole as the bed; the 8 s Higgsfield fireplace clip plays once with its
 * own crackle in sync, then crackle and picture continue as seeded, crossfaded slices.
 *
 * Measured sources (ffmpeg ebur128 / astats):
 *   music.mp3      197.592 s, 48 kHz stereo, -16.5 LUFS, peak -3.4 dBFS, all energy < 1 kHz;
 *                  a slow B-major drone with its own 2 s fade-in and ~12 s fade-out.
 *   fireplace.mp4  8.000 s = 192 frames @ 24 fps, 1920x1080, AAC 48 kHz stereo: fire crackle
 *                  -36.7 LUFS, mostly 2-16 kHz; three hard pops at 0.63, 4.06 and 6.02 s that
 *                  reach 0 dBFS (clipped in the source); every other crackle peaks <= -10 dBFS.
 *                  The camera dollies slowly left (~90 px over the clip).
 */

export const FIRE_FPS = 24;
const sec = (s: number) => Math.round(s * FIRE_FPS);

export const FIRE_CLIP_FRAMES = 192; // 8.000 s, played once, whole, at native speed
/** The whole music track, so its own fade-out and return to the home chord are kept. */
export const FIRE_DURATION = Math.ceil(197.592 * FIRE_FPS); // 4743 = 197.625 s

/*
 * Linear gains. With no narration the music is the programme, so it sits higher than the brown
 * noise did under the voice (0.2): 0.4 puts it at about -24.5 LUFS, a few dB under the narrated
 * film, so the combined video gets quieter as it goes rather than louder. The crackle sits about
 * 16 dB under the music, as the rain did under the brown noise; it lives above 1 kHz, where the
 * music has nothing, so it stays audible. The three pops are ridden down to `pops`, which brings
 * them to about -14 dBFS, level with the ordinary crackles instead of 12 dB over them.
 */
export type FireplaceMix = {
  music: number;
  crackle: number;
  pops: number;
};

export const FIREPLACE_MIX: FireplaceMix = {
  music: 0.4,
  crackle: 0.65,
  pops: 0.15,
};

export type FireplaceProps = {mix: FireplaceMix};

const FADE_IN = sec(2);
const FADE_OUT = sec(6);
const PICTURE_FADE_IN = sec(1.5);

/* Pops in clip frames, inclusive, with a frame of margin either side (volume steps per frame). */
const POPS: [number, number][] = [
  [14, 16], // 0.63 s
  [96, 98], // 4.06 s
  [143, 146], // 6.02 s
];

/* Pop-free crackle, and the end of the clip where the camera has the least drift, [first, end). */
const CRACKLE_REGIONS: [number, number][] = [
  [18, 95],
  [100, 142],
  [148, 190],
];
const LOOP_PICTURE_REGIONS: [number, number][] = [[144, 192]];
const CRACKLE_XFADE = sec(0.5);
const PICTURE_DISSOLVE = 16;

export const CRACKLE_GRAINS = grains('crackle', CRACKLE_REGIONS, FIRE_CLIP_FRAMES - CRACKLE_XFADE, FIRE_DURATION, 32, 48, CRACKLE_XFADE);
export const FIRE_PICTURE_GRAINS = grains('fire-picture', LOOP_PICTURE_REGIONS, FIRE_CLIP_FRAMES - PICTURE_DISSOLVE, FIRE_DURATION, 32, 48, PICTURE_DISSOLVE);

const master = (f: number) => masterFade(f, FIRE_DURATION, FADE_IN, FADE_OUT);
const clipGain = (f: number, mix: FireplaceMix) => (POPS.some(([a, b]) => f >= a && f <= b) ? mix.pops : mix.crackle);

const CLIP = staticFile('fireplace/fireplace.mp4');

export const MidnightFireplace: React.FC<FireplaceProps> = ({mix}) => {
  const frame = useCurrentFrame();
  const black = blackLevel(frame, FIRE_DURATION, PICTURE_FADE_IN, FADE_OUT);

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {/* The clip, whole, with its crackle in sync; it hands over to the extension over its last 0.5 s. */}
      <Sequence durationInFrames={FIRE_CLIP_FRAMES} name="Higgsfield clip">
        <OffthreadVideo
          src={CLIP}
          volume={(f) => clipGain(f, mix) * equalPower(f, FIRE_CLIP_FRAMES, CRACKLE_XFADE, false) * master(f)}
        />
      </Sequence>

      {/* Picture after 8 s: muted slices of the clip's last 2 s, dissolved into each other. */}
      {FIRE_PICTURE_GRAINS.map((g, i) => (
        <Sequence key={`p${i}`} from={g.from} durationInFrames={g.len} name={`picture ${i}`}>
          <PictureGrain clip={CLIP} src={g.src} len={g.len} dissolve={PICTURE_DISSOLVE} />
        </Sequence>
      ))}

      {/* Crackle after 8 s: pop-free slices of the clip's audio, crossfaded. */}
      {CRACKLE_GRAINS.map((g, i) => (
        <Sequence key={`c${i}`} from={g.from} durationInFrames={g.len} name={`crackle ${i}`} layout="none">
          <Audio
            src={CLIP}
            trimBefore={g.src}
            trimAfter={g.src + g.len}
            volume={(f) => mix.crackle * equalPower(f, g.len, CRACKLE_XFADE) * master(g.from + f)}
          />
        </Sequence>
      ))}

      {/* The music: one pass, start to finish. */}
      <Audio src={staticFile('fireplace/music.mp3')} volume={(f) => mix.music * master(f)} name="Music" />

      <AbsoluteFill style={{backgroundColor: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};
