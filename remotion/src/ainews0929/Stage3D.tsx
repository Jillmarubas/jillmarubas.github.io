// One ThreeCanvas for the whole video. Items arrive with Cobalt Haze's glass ease, idle
// with a slow drift, and depart downward. One key light (upper left, front) everywhere.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Mood, OBJ, ObjKind} from './objects3d';
import {clamp, depart, glass, H, W} from './theme';

// Camera: fov 30 at z = 12 shows 6.43 units vertically, so 1 unit ≈ 168 px.
export const PX = H / (2 * 12 * Math.tan((15 * Math.PI) / 180));
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

const ItemMesh: React.FC<{it: Item; f: number; shadow: THREE.Texture}> = ({it, f, shadow}) => {
  const {fps} = useVideoConfig();
  const e = interpolate(f, [it.at, it.at + 16], [0, 1], {...clamp, easing: glass});
  const x = interpolate(f, [it.out, it.out + 11], [0, 1], {...clamp, easing: depart});
  if (e <= 0 || x >= 1) return null;
  const seed = it.seed ?? 0;
  const t = f / fps;
  const drift = it.drift ?? 1;
  const off = it.path ? it.path(f) : [0, 0];
  const [wx, wy] = toWorld(it.x + off[0], it.y + off[1]);
  const s = (it.size / PX) * Math.max(0.001, e * (1 - x));
  const bob = Math.sin(t * 1.1 + seed * 1.7) * 0.05 * drift;
  const rise = (1 - e) * -0.5 - x * 0.6;
  const ry = (1 - e) * -1.1 + x * 0.9 + Math.sin(t * 0.55 + seed) * 0.16 * drift;
  const p = typeof it.p === 'function' ? it.p(f) : it.p ?? 1;
  const Comp = OBJ[it.obj];
  const r = it.rot ?? [0, 0, 0];
  return (
    <group position={[wx, wy + bob + rise, it.z ?? 0]}>
      <group scale={s} rotation={[r[0], r[1] + ry, r[2]]}>
        <Comp f={f - it.at} p={p} mood={typeof it.mood === 'function' ? it.mood(f) : it.mood ?? 'azure'} seed={seed} />
      </group>
      {it.shadow !== false && (
        <mesh position={[0, -s * 0.62 - bob - rise * 0.2, -0.3]} scale={[s * 1.25 * (1 - bob), s * 0.3, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={shadow} transparent depthWrite={false} opacity={0.9 * e * (1 - x)} />
        </mesh>
      )}
    </group>
  );
};

export const Stage3D: React.FC<{items: Item[]}> = ({items}) => {
  const f = useCurrentFrame();
  const shadow = useMemo(shadowTex, []);
  const live = items.filter((it) => f >= it.at && f < it.out + 12);
  return (
    <ThreeCanvas
      width={W}
      height={H}
      style={{position: 'absolute', inset: 0}}
      gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, alpha: true}}
      camera={{fov: 30, near: 0.1, far: 100, position: [0, 0, 12]}}
    >
      <Env />
      {/* key: upper left, front. rim: behind, periwinkle. fill: cobalt sky / deep ground */}
      <directionalLight position={[-5, 6, 8]} intensity={2.3} color="#fff4ea" />
      <directionalLight position={[4, 3, -6]} intensity={1.7} color="#b8cbff" />
      <hemisphereLight args={['#cfe0ff', '#0a2a6b', 0.55]} />
      {live.map((it, i) => (
        <ItemMesh key={`${it.obj}-${it.at}-${i}`} it={it} f={f} shadow={shadow} />
      ))}
    </ThreeCanvas>
  );
};
