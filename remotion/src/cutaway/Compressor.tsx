import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/fraunces/400-italic.css';
import {ACCENT, FOV, FPS, H, P_DIS, P_SUC, T, W, anchors, blurSamples, buildCompressor, camAt, crankPhi, inOut, outQ, prog} from './compressor';
import {createMotionBlur} from './motionblur';

const INK = '#16181c';

const World: React.FC<{sec: number}> = ({sec}) => {
  const {gl, scene} = useThree();
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const model = useMemo(() => buildCompressor(), []);
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    return pm.fromScene(new RoomEnvironment(), 0.04).texture;
  }, [gl]);
  gl.localClippingEnabled = true;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.05;
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.environment = env;
  scene.environmentIntensity = 0.75;
  const blur = useMemo(() => createMotionBlur(gl, W, H), [gl]);
  const pose = (ts: number) => {
    model.update(ts);
    const c = camAt(ts);
    cam.fov = FOV;
    cam.near = 0.05;
    cam.far = 100;
    cam.position.copy(c.pos);
    cam.lookAt(c.target);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
  };
  pose(sec);
  // Priority 1 takes over drawing from react-three-fiber: the frame is drawn with motion blur.
  useFrame(() => blur.render(scene, cam, sec, FPS, blurSamples(sec), pose), 1);
  return (
    <>
      <directionalLight
        position={[-3.5, 6, 4.5]}
        intensity={2.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={4}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0008}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
      <directionalLight position={[4, 2.5, 3]} intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#c9ccd1', 0.35]} />
      <primitive object={model.root} />
    </>
  );
};

// Screen position of a world point for the current camera.
const projector = (sec: number) => {
  const c = camAt(sec);
  const cam = new THREE.PerspectiveCamera(FOV, W / H, 0.05, 100);
  cam.position.copy(c.pos);
  cam.lookAt(c.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return (v: THREE.Vector3) => {
    const p = v.clone().project(cam);
    return {x: (p.x * 0.5 + 0.5) * W, y: (-p.y * 0.5 + 0.5) * H};
  };
};

type LabelProps = {
  at: {x: number; y: number};
  to: {x: number; y: number};
  k: number; // 0..1 in, then out
  title: string;
  sub?: string;
  align: 'left' | 'right' | 'center';
  accent?: boolean;
};
// Dot on the part, a leader line, then the words. Spatial contiguity: the label sits next to its part.
const Label: React.FC<LabelProps> = ({at, to, k, title, sub, align, accent}) => {
  if (k <= 0) return null;
  const line = outQ(Math.min(1, k * 1.8));
  const text = outQ(Math.max(0, Math.min(1, k * 1.8 - 0.55)));
  const ex = at.x + (to.x - at.x) * line;
  const ey = at.y + (to.y - at.y) * line;
  const shift = (1 - text) * (align === 'right' ? -24 : align === 'left' ? 24 : 0);
  const tx = align === 'right' ? {left: to.x + 14} : align === 'left' ? {right: W - to.x + 14} : {left: to.x, transform: 'translateX(-50%)'};
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <line x1={at.x} y1={at.y} x2={ex} y2={ey} stroke={INK} strokeWidth={2.2} opacity={Math.min(1, k * 3)} />
        <circle cx={at.x} cy={at.y} r={7 * outQ(Math.min(1, k * 3))} fill={accent ? ACCENT : INK} stroke="#fff" strokeWidth={2.5} />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: to.y - (align === 'center' ? (sub ? 104 : 70) : 36),
          ...tx,
          opacity: text,
          textAlign: align === 'center' ? 'center' : align,
          whiteSpace: 'nowrap',
          translate: `${shift}px 0`,
          background: 'rgba(255,255,255,0.92)',
          padding: '10px 18px 12px',
          borderRadius: 14,
          boxShadow: '0 6px 24px rgba(20,24,30,0.12)',
        }}
      >
        <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 40, color: INK, letterSpacing: '-0.01em', lineHeight: 1.1}}>{title}</div>
        {sub && <div style={{fontFamily: 'Inter', fontWeight: 500, fontSize: 25, color: '#555b63', marginTop: 4}}>{sub}</div>}
      </div>
    </>
  );
};

// In for [t0, t1], with a quick fade.
const win = (s: number, t0: number, t1: number, fadeIn = 0.55, fadeOut = 0.3) => Math.min(prog(s, t0, fadeIn), 1 - prog(s, t1 - fadeOut, fadeOut));

export const CompressorCutaway: React.FC<{sound?: boolean}> = ({sound = true}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const proj = projector(s);
  const a = anchors(s);
  const P = Object.fromEntries(Object.entries(a).map(([k, v]) => [k, proj(v)])) as Record<keyof typeof a, {x: number; y: number}>;
  const L = T.labels;
  const colR = 1330;
  const colL = 590;

  // Phase labels: first slow cycle only, driven by the crank angle so they match the piston.
  const phi = crankPhi(s);
  const firstCycle = phi < Math.PI * 2 + P_SUC[0];
  const phaseK = (a0: number, a1: number) => (s < T.cut || !firstCycle ? 0 : Math.min(Math.min(1, (phi - a0) / 0.35), 1 - Math.min(1, Math.max(0, (phi - a1 + 0.15) / 0.3))));
  const pk = (a0: number, a1: number) => Math.max(0, phaseK(a0, a1));
  const sucK = pk(P_SUC[0], P_SUC[1] + 0.1);
  const comK = pk(P_SUC[1] + 0.1, P_DIS[0] + 0.05);
  const disK = s > T.fast + 0.2 ? Math.max(0, 1 - prog(s, T.fast + 0.2, 0.3)) * pk(P_DIS[0] + 0.05, 99) : pk(P_DIS[0] + 0.05, 99);
  const cylTop = {x: P.cylinder.x, y: P.cylinder.y - 230};

  const titleIn = outQ(prog(s, T.titleIn, 0.7));
  const titleOut = inOut(prog(s, T.titleOut, 0.5));
  const endFade = prog(s, T.end - 0.55, 0.5);
  const k = Math.floor(frame / 2);

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 50% 45%, #fbfbfc 0%, #eceef1 60%, #dcdfe3 100%)'}}>
      <ThreeCanvas width={W} height={H} shadows gl={{antialias: true, preserveDrawingBuffer: true, alpha: true}}>
        <World sec={s} />
      </ThreeCanvas>

      {/* Title */}
      {s < T.titleOut + 0.6 && (
        <div style={{position: 'absolute', left: 110, top: 390, opacity: titleIn * (1 - titleOut), transform: `translateY(${(1 - titleIn) * 30}px) scale(${1 + 0.15 * titleOut})`, filter: `blur(${10 * titleOut}px)`}}>
          <div style={{fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 54, color: '#3b4048'}}>What’s inside a fridge</div>
          <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 104, color: INK, letterSpacing: '-0.03em', lineHeight: 1}}>COMPRESSOR</div>
          <div style={{height: 8, width: 150 * outQ(prog(s, T.titleIn + 0.5, 0.6)), background: ACCENT, marginTop: 22, borderRadius: 4}} />
        </div>
      )}

      {/* Cutaway + pre-training labels */}
      <Label at={P.shell} to={{x: P.shell.x + 150, y: P.shell.y - 110}} k={win(s, T.sliceB - 0.2, T.explode + 0.3)} title="Sealed steel shell" align="right" />
      <Label at={P.crank} to={{x: colR, y: P.crank.y - 40}} k={win(s, L[1], T.labelsOut)} title="Crankshaft" align="right" />
      <Label at={P.motor} to={{x: colR, y: P.motor.y + 10}} k={win(s, L[0], T.labelsOut)} title="Electric motor" align="right" />
      <Label at={P.springs} to={{x: colR, y: P.springs.y - 50}} k={win(s, L[4], T.labelsOut)} title="Springs" sub="soak up vibration" align="right" />
      <Label at={P.piston} to={{x: colL, y: P.piston.y - 40}} k={win(s, L[2], T.labelsOut)} title="Piston" align="left" />
      <Label at={P.valves} to={{x: colL, y: P.valves.y + 70}} k={win(s, L[3], T.labelsOut)} title="Valves" align="left" />

      {/* How it works: one phase at a time, pinned above the cylinder */}
      <Label at={P.cylinder} to={cylTop} k={sucK} title="1  Suction" sub="cool, low-pressure gas pulled in" align="center" accent />
      <Label at={P.cylinder} to={cylTop} k={comK} title="2  Compression" sub="squeezed into less space, it heats up" align="center" accent />
      <Label at={P.cylinder} to={cylTop} k={disK} title="3  Discharge" sub="hot, high-pressure gas pushed out" align="center" accent />
      <Label at={P.cylinder} to={{x: P.cylinder.x, y: P.cylinder.y - 230}} k={win(s, T.fastFull - 0.6, T.pullBack + 0.1)} title="Real speed: ~50 strokes a second" sub="fixed-speed motor on 50 Hz power" align="center" />

      {/* Close-up furniture */}
      {(() => {
        const kk = win(s, T.cut + 0.3, T.pullBack + 0.4, 0.4, 0.4);
        if (kk <= 0) return null;
        return (
          <>
            <div style={{position: 'absolute', left: 70, top: 64, opacity: kk, fontFamily: 'Inter', fontWeight: 700, fontSize: 24, letterSpacing: '0.14em', color: '#555b63', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.9)', padding: '10px 20px', borderRadius: 30}}>
              <div style={{width: 12, height: 12, borderRadius: 6, background: ACCENT}} />
              SLOW MOTION
            </div>
            <div style={{position: 'absolute', left: W / 2 - 230, bottom: 70, width: 460, opacity: kk, fontFamily: 'Inter', fontWeight: 700, fontSize: 24, color: '#555b63', display: 'flex', alignItems: 'center', gap: 16, letterSpacing: '0.08em', background: 'rgba(255,255,255,0.9)', padding: '12px 22px', borderRadius: 30}}>
              COLD
              <div style={{flex: 1, height: 10, borderRadius: 5, background: 'linear-gradient(90deg, #1f6fff, #a04bd0 50%, #ff3b12)'}} />
              HOT
            </div>
          </>
        );
      })()}

      <Label at={P.outlet} to={{x: P.outlet.x - 120, y: P.outlet.y - 150}} k={win(s, T.outLabel, T.end - 0.4)} title="To the condenser" sub="hot, high-pressure gas" align="left" accent />

      <AbsoluteFill style={{backgroundImage: `url(${staticFile('demo25d/grain.png')})`, backgroundPosition: `${(k * 137) % 512}px ${(k * 271) % 512}px`, mixBlendMode: 'overlay', opacity: 0.12}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 62%, rgba(40,44,52,0.16) 100%)'}} />
      <AbsoluteFill style={{background: '#eceef1', opacity: endFade}} />
      {sound && <Audio src={staticFile('cutaway/compressor_sfx.wav')} />}
    </AbsoluteFill>
  );
};
