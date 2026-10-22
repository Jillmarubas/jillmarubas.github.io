import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Img,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import '@fontsource/inter/800.css';
import '@fontsource/fraunces/400-italic.css';
import {
  CAM,
  D,
  FPS,
  H,
  LAYERS,
  PLATE_H,
  PLATE_W,
  W,
  easeInOutCubic,
  easeOutCubic,
  easeOutQuart,
  prog,
} from './shot';

// Loads every layer texture once; the render waits until they're ready.
const useTextures = () => {
  const [tex, setTex] = useState<Record<string, THREE.Texture> | null>(null);
  const [handle] = useState(() => delayRender('Loading 2.5D layers'));
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    Promise.all(
      LAYERS.map(
        (l) =>
          new Promise<[string, THREE.Texture]>((resolve, reject) =>
            loader.load(
              staticFile(`demo25d/${l.name}.png`),
              (t) => {
                t.colorSpace = THREE.SRGBColorSpace;
                t.anisotropy = 8;
                resolve([l.name, t]);
              },
              undefined,
              reject,
            ),
          ),
      ),
    ).then((entries) => {
      setTex(Object.fromEntries(entries));
      continueRender(handle);
    });
  }, [handle]);
  return tex;
};

const Scene: React.FC<{sec: number}> = ({sec}) => {
  const tex = useTextures();
  return (
    <ThreeCanvas
      width={W}
      height={H}
      flat
      camera={{position: [0, 0, D], fov: (2 * Math.atan(H / 2 / D) * 180) / Math.PI, near: 1, far: 20000}}
      gl={{antialias: true}}
    >
      <CameraRig sec={sec} />
      {tex &&
        LAYERS.map((l, i) => {
          const k = l.d / D;
          return (
            <mesh key={l.name} position={[0, l.lift, D - l.d]} renderOrder={i}>
              <planeGeometry args={[PLATE_W * k, PLATE_H * k]} />
              <meshBasicMaterial
                map={tex[l.name]}
                transparent
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          );
        })}
    </ThreeCanvas>
  );
};

// Moves the canvas's camera to this frame's position (a real 3D camera move).
const CameraRig: React.FC<{sec: number}> = ({sec}) => {
  const camera = useThree((s) => s.camera);
  const t = easeInOutCubic(prog(sec, CAM.start, CAM.end - CAM.start));
  const x = CAM.x[0] + (CAM.x[1] - CAM.x[0]) * t;
  const y = CAM.y[0] + (CAM.y[1] - CAM.y[0]) * t;
  const z = CAM.z[0] + (CAM.z[1] - CAM.z[0]) * t;
  camera.position.set(x, -y, D - z);
  camera.updateMatrixWorld();
  return null;
};


// Same shot with CSS 3D (perspective + translateZ), the method HyperFrames uses.
const CssScene: React.FC<{sec: number}> = ({sec}) => {
  const t = easeInOutCubic(prog(sec, CAM.start, CAM.end - CAM.start));
  const x = CAM.x[0] + (CAM.x[1] - CAM.x[0]) * t;
  const y = CAM.y[0] + (CAM.y[1] - CAM.y[0]) * t;
  const z = CAM.z[0] + (CAM.z[1] - CAM.z[0]) * t;
  return (
    <AbsoluteFill style={{perspective: D, perspectiveOrigin: '50% 50%', overflow: 'hidden'}}>
      <AbsoluteFill
        style={{transformStyle: 'preserve-3d', transform: `translate3d(${-x}px, ${-y}px, ${z}px)`}}
      >
        {LAYERS.map((l) => (
          <Img
            key={l.name}
            src={staticFile(`demo25d/${l.name}.png`)}
            style={{
              position: 'absolute',
              left: (W - PLATE_W) / 2,
              top: (H - PLATE_H) / 2,
              width: PLATE_W,
              height: PLATE_H,
              transform: `translate3d(0, ${-l.lift}px, ${D - l.d}px) scale(${l.d / D})`,
            }}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const KW = 'THE EMPIRE BEGINS';
const quadOut = (t: number) => 1 - (1 - t) * (1 - t);
const cubicIn = (t: number) => t * t * t;

export const Demo25D: React.FC<{engine: 'three' | 'css'}> = ({engine}) => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;

  const blackIn = 1 - quadOut(prog(sec, 0, 0.8));
  const blackOut = prog(sec, 7.5, 0.5);

  const lead = easeOutQuart(prog(sec, 1.2, 0.8));
  const countIn = quadOut(prog(sec, 1.6, 0.4));
  const year = Math.round(1950 + 37 * easeOutCubic(prog(sec, 1.6, 1.8)));
  const kw = easeOutQuart(prog(sec, 4.0, 0.7));
  const out = cubicIn(prog(sec, 6.6, 0.8));

  // Grain jumps to a new position every 2 frames.
  const k = Math.floor(frame / 2);
  const gx = (k * 137) % 512;
  const gy = (k * 271) % 512;

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {engine === 'three' ? <Scene sec={sec} /> : <CssScene sec={sec} />}

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
        <div
          style={{
            fontFamily: 'Fraunces',
            fontStyle: 'italic',
            fontSize: 46,
            color: '#efe6d8',
            opacity: lead,
            transform: `translateY(${20 * (1 - lead)}px)`,
            filter: `blur(${8 * (1 - lead)}px)`,
          }}
        >
          The year is
        </div>
        <div
          style={{
            fontFamily: 'Inter',
            fontWeight: 800,
            fontSize: 190,
            lineHeight: 1,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            opacity: countIn,
          }}
        >
          {year}
        </div>
        <div
          style={{
            fontFamily: 'Inter',
            fontWeight: 800,
            fontSize: 64,
            color: '#f2b45a',
            marginTop: 18,
            whiteSpace: 'nowrap',
            letterSpacing: '0.08em',
            opacity: kw,
          }}
        >
          {/* Keyword "tracks in": each letter starts spread out and slides home. */}
          {KW.split('').map((ch, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transform: `translateX(${(i - (KW.length - 1) / 2) * 1.12 * 64 * (1 - kw)}px)`,
              }}
            >
              {ch === ' ' ? '\u00a0' : ch}
            </span>
          ))}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('demo25d/grain.png')})`,
          backgroundPosition: `${gx}px ${gy}px`,
          mixBlendMode: 'overlay',
          opacity: 0.22,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(blackIn, blackOut)}} />
    </AbsoluteFill>
  );
};
