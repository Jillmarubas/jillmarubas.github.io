import React, {useMemo} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import '@fontsource/inter/800.css';
import '@fontsource/fraunces/400-italic.css';
import {FPS, H, RENDER, W, createWorld} from './city3d.js';

const prog = (sec: number, start: number, dur: number) => Math.min(1, Math.max(0, (sec - start) / dur));
const quadOut = (t: number) => 1 - (1 - t) * (1 - t);
const cubicOut = (t: number) => 1 - Math.pow(1 - t, 3);
const quartOut = (t: number) => 1 - Math.pow(1 - t, 4);
const cubicIn = (t: number) => t * t * t;
const KW = 'THE EMPIRE BEGINS';

// Hands the shared scene to react-three-fiber and poses it for this frame.
const World: React.FC<{sec: number}> = ({sec}) => {
  const world = useMemo(() => createWorld(THREE), []);
  const {scene, gl} = useThree();
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  // Set before the first draw, so materials compile with fog (same as the HyperFrames host).
  scene.fog = world.scene.fog;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = RENDER.exposure;
  gl.outputColorSpace = THREE.SRGBColorSpace;
  world.renderAt(sec);
  // Copy the shared camera onto the canvas camera.
  const wc = world.camera;
  cam.fov = wc.fov;
  cam.near = wc.near;
  cam.far = wc.far;
  cam.position.copy(wc.position);
  cam.quaternion.copy(wc.quaternion);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return <primitive object={world.scene} />;
};

export const Demo3D: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  const blackIn = 1 - quadOut(prog(sec, 0, 0.8));
  const blackOut = prog(sec, 7.5, 0.5);
  const lead = quartOut(prog(sec, 1.0, 0.8));
  const countIn = quadOut(prog(sec, 1.4, 0.4));
  const year = Math.round(1950 + 37 * cubicOut(prog(sec, 1.4, 1.8)));
  const kw = quartOut(prog(sec, 3.2, 0.7));
  const out = cubicIn(prog(sec, 4.8, 0.7));
  const k = Math.floor(frame / 2);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <ThreeCanvas width={W} height={H} shadows gl={{antialias: true, preserveDrawingBuffer: true}}>
        <World sec={sec} />
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          opacity: 1 - out,
          transform: `translateY(${-20 * out}px)`,
          textShadow: '0 4px 30px rgba(0,0,0,0.55)',
        }}
      >
        <div style={{fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 46, color: '#efe6d8', opacity: lead, transform: `translateY(${20 * (1 - lead)}px)`, filter: `blur(${8 * (1 - lead)}px)`}}>
          The year is
        </div>
        <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 190, lineHeight: 1, color: '#fff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', opacity: countIn}}>
          {year}
        </div>
        <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 64, color: '#f2b45a', marginTop: 18, whiteSpace: 'nowrap', letterSpacing: '0.08em', opacity: kw}}>
          {KW.split('').map((ch, i) => (
            <span key={i} style={{display: 'inline-block', transform: `translateX(${(i - (KW.length - 1) / 2) * 1.12 * 64 * (1 - kw)}px)`}}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('demo25d/grain.png')})`, backgroundPosition: `${(k * 137) % 512}px ${(k * 271) % 512}px`, mixBlendMode: 'overlay', opacity: 0.22}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(blackIn, blackOut)}} />
    </AbsoluteFill>
  );
};
