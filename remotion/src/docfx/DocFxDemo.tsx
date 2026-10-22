import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/900.css';
import {ArchiveParallax} from '../parallax/ArchiveParallax';
import {DecodeTitle} from './DecodeTitle';
import {MatteTransition} from './MatteTransition';
import {ParticleRain} from './ParticleRain';
import {DocFinish, FaceOff, ForegroundSweep, OverShoulder, SideEntrance, Tint} from './Layers';
import {ClassicalBuilding, VoidStage} from './VoidStage';
import {Bust, GoldBars, ProfileHead, ShouldersBack} from './Shapes';
import {E, clamp} from './util';

export const FPS = 30;
export const DURATION = 16 * FPS;
const s = (sec: number) => Math.round(sec * FPS);
const GRAIN = staticFile('demo25d/grain.png');

// Shot A: archive photo, slow 2.5D pull-back (method B), decode title on the "name".
const ShotA: React.FC = () => (
  <AbsoluteFill>
    <ArchiveParallax dir="demodepth" move={{x: [-30, 30], y: [10, -6], z: [-60, 120], fov: [50, 48.5]}} />
    <Tint color="#ff4a12" from={0.55} to={0.55} />
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 170}}>
      <DecodeTitle text="THE DUST BOWL" at={1.0} dur={1.1} exitAt={3.3} size={120} />
    </AbsoluteFill>
    <DocFinish grainSrc={GRAIN} />
  </AbsoluteFill>
);

// Shot B: a place as a 3D model in a void; then the eyeline over-the-shoulder.
const ShotB: React.FC = () => (
  <AbsoluteFill>
    <VoidStage recede={[9, 15]} recedeDur={3.2} orbit={[-8, 6]}>
      <ClassicalBuilding />
    </VoidStage>
    <Tint color="#2f5f8f" from={0.5} to={0.5} />
    <OverShoulder node={<ShouldersBack id="sb" />} at={2.0} x={0.3} size={0.95} blur={6} />
    <DocFinish grainSrc={GRAIN} />
  </AbsoluteFill>
);

// Shot C: face-off. Two profiles creep toward each other around the conflict scene.
const ShotC: React.FC = () => (
  <AbsoluteFill>
    <FaceOff
      dur={3.8}
      center={
        <AbsoluteFill>
          <Img src={staticFile('demodepth/photo.png')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(3px) brightness(0.55)'}} />
          <Tint color="#ff3b0f" from={0.7} to={0.7} />
        </AbsoluteFill>
      }
      left={<ProfileHead id="pl" />}
      right={<ProfileHead id="pr" flip rim="#ffb35c" />}
    />
    <DocFinish grainSrc={GRAIN} />
  </AbsoluteFill>
);

// Shot D: lineup slides in from both edges; gold bars sweep past in the foreground; coin rain.
const ShotD: React.FC = () => {
  const {fps} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  return (
    <AbsoluteFill style={{background: '#120c06'}}>
      <Img src={staticFile('demodepth/clean.png')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45) sepia(0.6)', transform: `scale(${1.05 + 0.02 * t})`}} />
      <SideEntrance
        items={[
          {node: <Bust id="b1" hat />, side: 'l', x: 520, y: 1000, at: 0.5, height: 520, dim: 0.25},
          {node: <Bust id="b2" />, side: 'r', x: 1400, y: 1000, at: 0.65, height: 520, dim: 0.25},
          {node: <Bust id="b3" />, side: 'l', x: 760, y: 1080, at: 0.8, height: 640},
          {node: <Bust id="b4" hat />, side: 'r', x: 1160, y: 1080, at: 0.95, height: 640},
        ]}
      />
      <ParticleRain kind="coin" count={70} density={[[0, 0], [1.6, 0], [2.0, 0.6]]} focusZ={1.4} seed={9} />
      <ForegroundSweep node={<GoldBars />} at={0.1} dur={2.8} fromX={420} toX={-260} y={760} height={700} blur={14} />
      <Tint color="#d9a441" from={0.45} to={0.45} />
      <DocFinish grainSrc={GRAIN} />
      <AbsoluteFill style={{background: '#000', opacity: E.in(clamp((t - 3.2) / 0.5))}} />
    </AbsoluteFill>
  );
};

export const DocFxDemo: React.FC = () => {
  const {fps} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  // Particle wipe B → C: money rain thickens, a short dip to black, then C.
  const dip = Math.max(0, 1 - Math.abs(t - 8.45) / 0.12);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* A → B: ink wipe at 3.85 s */}
      <Sequence durationInFrames={s(8.45)}>
        <MatteTransition
          at={3.85}
          from={<Sequence durationInFrames={s(4.2)}><ShotA /></Sequence>}
          to={<Sequence from={s(3.85)}><ShotB /></Sequence>}
        />
      </Sequence>
      <Sequence from={s(7.3)} durationInFrames={s(1.5)}>
        <ParticleRain kind="bill" mode="toward" count={260} density={[[0, 0], [0.4, 0.25], [1.1, 1], [1.4, 0]]} focusZ={2.5} seed={4} />
      </Sequence>
      {/* C → D: fine "melt" dissolve at 11.9 s */}
      <Sequence from={s(8.45)}>
        <MatteTransition
          kind="dissolve"
          at={11.9 - 8.45}
          from={<ShotC />}
          to={<Sequence from={s(11.9 - 8.45)}><ShotD /></Sequence>}
        />
      </Sequence>
      <AbsoluteFill style={{background: '#000', opacity: dip}} />
      {/* Sound on the transitions (synchresis): CC0 whoosh, see public/sfx */}
      <Sequence from={s(3.7)}><Audio src={staticFile('sfx/whoosh7.mp3')} volume={0.8} /></Sequence>
      <Sequence from={s(8.1)}><Audio src={staticFile('sfx/whoosh7.mp3')} volume={0.7} /></Sequence>
      <Sequence from={s(11.8)}><Audio src={staticFile('sfx/whoosh7.mp3')} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
