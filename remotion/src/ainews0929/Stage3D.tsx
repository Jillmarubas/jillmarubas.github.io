// One ThreeCanvas for the whole video, choreographed per the motion-video skill:
// objects glide in from a direction (no scale-in pops), settle softly and keep drifting,
// then exit toward the viewer, left to right, blurring as they near the lens.
// Every pose is a function of time, so MotionBlurRenderer can render true 3D motion blur.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {exitEase, MotionBlurRenderer, MotionProvider, Mover, Pose, settle, Track, V3} from '../cola/motion3d';
import {Mood, OBJ, ObjKind} from './objects3d';
import {H, W} from './theme';

// Camera: fov 30 at z = 12 shows 6.43 units vertically, so 1 unit ≈ 168 px.
const CAM_Z = 12;
export const PX = H / (2 * CAM_Z * Math.tan((15 * Math.PI) / 180));
export const toWorld = (x: number, y: number): [number, number] => [(x - W / 2) / PX, -(y - H / 2) / PX];

export type Item = {
  obj: ObjKind;
  x: number; // centre, px
  y: number;
  size: number; // rough height, px
  at: number; // absolute frame it arrives
  out: number; // absolute frame it starts leaving
  mood?: Mood | ((f: number) => Mood);
  seed?: number;
  p?: number | ((f: number) => number);
  rot?: [number, number, number];
  z?: number;
  drift?: number; // idle sway amount (0 = still)
  shadow?: boolean;
  path?: (f: number) => [number, number]; // px offset over time
};

const ENTER = 22; // frames: smooth glide with a long soft settle
const EXIT = 18;
const EXIT_Z = 10.4; // how close to the lens (camera at 12) objects get as they leave

type Dir = 'left' | 'right' | 'top' | 'bottom' | 'upLeft' | 'upRight' | 'downLeft' | 'downRight';
const RIGHT_SIDE: Dir[] = ['right', 'top', 'bottom', 'downRight', 'upRight'];
const LEFT_SIDE: Dir[] = ['left', 'top', 'bottom', 'upLeft', 'downLeft'];
// Off-frame start points, px (plus a little depth), so nothing appears out of thin air.
const startFor = (d: Dir, x: number, y: number): [number, number] => {
  const L = -260, R = W + 260, T = -260, B = H + 260;
  switch (d) {
    case 'left': return [L, y];
    case 'right': return [R, y];
    case 'top': return [x, T];
    case 'bottom': return [x, B];
    case 'upLeft': return [L, T + 200];
    case 'upRight': return [R, T + 200];
    case 'downLeft': return [L, B - 200];
    case 'downRight': return [R, B - 200];
  }
};

const trackFor = (it: Item, index: number, fps: number): Track => {
  const seed = it.seed ?? 0;
  const side = it.x >= W / 2 ? RIGHT_SIDE : LEFT_SIDE;
  const dir = side[(index + seed) % side.length];
  const [sx, sy] = startFor(dir, it.x, it.y);
  const r = it.rot ?? [0, 0, 0];
  const s = it.size / PX;
  const spinSign = sx < it.x ? -1 : 1;
  const drift = it.drift ?? 1;
  // exit: lag left→right, drift outward from the frame centre so it slips past the lens
  const lag = (it.x / W) * 8;
  let ox = it.x - W / 2, oy = -(it.y - H / 2) + 1;
  const ol = Math.hypot(ox, oy) || 1;
  ox /= ol;
  oy /= ol;
  return (t) => {
    const off = it.path ? it.path(t) : [0, 0];
    const [bx, by] = toWorld(it.x + off[0], it.y + off[1]);
    const [fx, fy] = toWorld(sx, sy);
    const k = settle((t - it.at) / ENTER);
    const hold = Math.max(0, t - it.at - ENTER);
    const calm = drift * Math.min(1, hold / 40); // drift fades in after landing
    const secs = t / fps;
    let p: V3 = [fx + (bx - fx) * k + calm * 0.02 * Math.sin(secs * 0.7 + seed * 2), fy + (by - fy) * k + calm * 0.035 * Math.sin(secs * 1.05 + seed), (it.z ?? 0) - 1.2 * (1 - k)];
    let rot: V3 = [r[0] + 0.25 * (1 - k), r[1] + spinSign * 1.1 * (1 - k) + calm * 0.12 * Math.sin(secs * 0.5 + seed), r[2] + spinSign * 0.3 * (1 - k)];
    let scale = t < it.at ? 0 : s;
    const x = (t - it.out - lag) / EXIT;
    if (x > 0) {
      const e = exitEase(Math.min(1, x));
      p = [p[0] + ox * 1.6 * e, p[1] + oy * 1.6 * e, p[2] + (EXIT_Z - p[2]) * e];
      rot = [rot[0] + 0.5 * e * oy, rot[1] + 0.7 * e * ox, rot[2] - 0.3 * e * ox];
      if (x >= 1) scale = 0;
    }
    return {p, r: rot, s: scale};
  };
};

const shadowTex = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(2,12,44,0.55)');
  r.addColorStop(0.5, 'rgba(2,12,44,0.22)');
  r.addColorStop(1, 'rgba(2,12,44,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
};

const Env: React.FC = () => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.75;
    pm.dispose();
  }, [gl, scene]);
  return null;
};

const ItemMesh: React.FC<{it: Item; index: number; f: number; shadow: THREE.Texture}> = ({it, index, f, shadow}) => {
  const {fps} = useVideoConfig();
  const track = useMemo(() => trackFor(it, index, fps), [it, index, fps]);
  // contact shadow follows the object below it, fades in as it lands and away as it leaves
  const shadowTrack = useMemo<Track>(
    () => (t) => {
      const q = track(t);
      const land = settle((t - it.at) / ENTER);
      const leave = Math.min(1, Math.max(0, (t - it.out) / 6));
      const s = (q.s ?? 0) * land * (1 - leave);
      return {p: [q.p[0], q.p[1] - (it.size / PX) * 0.62, q.p[2] - 0.3], r: [0, 0, 0], s} as Pose;
    },
    [track, it],
  );
  const p = typeof it.p === 'function' ? it.p(f) : it.p ?? 1;
  const mood = typeof it.mood === 'function' ? it.mood(f) : it.mood ?? 'azure';
  const Comp = OBJ[it.obj];
  return (
    <>
      <Mover track={track} f={f} radius={0.5}>
        <Comp f={f - it.at} p={p} mood={mood} seed={it.seed ?? 0} />
      </Mover>
      {it.shadow !== false && (
        <Mover track={shadowTrack} f={f}>
          <mesh scale={[1.25, 0.3, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={shadow} transparent depthWrite={false} opacity={0.9} />
          </mesh>
        </Mover>
      )}
    </>
  );
};

const CAM = () => ({pos: [0, 0, CAM_Z] as V3, look: [0, 0, 0] as V3});

export const Stage3D: React.FC<{items: Item[]}> = ({items}) => {
  const f = useCurrentFrame();
  const shadow = useMemo(shadowTex, []);
  // keep items mounted from just before they arrive until they have left
  const live = items.map((it, i) => ({it, i})).filter(({it}) => f >= it.at - 1 && f < it.out + EXIT + 10);
  return (
    <ThreeCanvas
      width={W}
      height={H}
      style={{position: 'absolute', inset: 0}}
      gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, alpha: true}}
      camera={{fov: 30, near: 0.1, far: 100, position: [0, 0, CAM_Z]}}
    >
      <MotionProvider>
        <Env />
        {/* key: upper left, front. rim: behind, periwinkle. fill: cobalt sky / deep ground */}
        <directionalLight position={[-5, 6, 8]} intensity={2.3} color="#fff4ea" />
        <directionalLight position={[4, 3, -6]} intensity={1.7} color="#b8cbff" />
        <hemisphereLight args={['#cfe0ff', '#0a2a6b', 0.55]} />
        {live.map(({it, i}) => (
          <ItemMesh key={`${it.obj}-${it.at}-${i}`} it={it} index={i} f={f} shadow={shadow} />
        ))}
        <MotionBlurRenderer f={f} cam={CAM} maxSamples={8} dof={{focus: CAM_Z, sharp: 6, soft: 2.4, maxPx: 70}} />
      </MotionProvider>
    </ThreeCanvas>
  );
};
