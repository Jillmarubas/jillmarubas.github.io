import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {TypeText, WordRise} from '../promo/motion';
import '../promo/fonts';
import TL from './timeline.json';
import {Assets, CabinetCard, CocaLeaf, FountainGlass, Globe, HutchinsonBottle, KolaNut, Model, Nickel, PourStream, ReleaseWhenDrawn, RubberStamp, TonicWineBottle, ghostTexture, inkTexture, liquidTop, paperTexture, useAssets} from './assets';
import {CamPose, MotionBlurRenderer, MotionProvider, Mover, Pose, V3, backOut, enter, inOut, inQuad, mix3} from './motion3d';

/*
 * ColaOrigin — see BRIEF.md (SOP step 1) and reference/breakdowns.md "Asset choreography".
 * The camera is locked flat on a paper wall; objects float in front of it, arrive from every
 * direction, overshoot and settle, keep drifting, and interact. Scenes are stations along the
 * wall; the camera whip-pans between them. Timing comes from timeline.json, which also drives
 * the soundtrack mix (scripts/mix_cola_audio.py).
 */
export const COLA_DURATION: number = TL.cuts[TL.cuts.length - 1];
const CUTS: number[] = TL.cuts;
const WHIP: number = TL.whip;
const EV = TL.events as Record<string, {f: number; d: number}>;
const E = (id: string) => EV[id];

const STEP = 0.6; // metres between stations along the wall
const WALL_Z = -0.12;
const CAM_Z = 1.25;
const FOV = 20;
const PX_PER_M = 1920 / (2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180));
const INK = '#26262a';
const ACCENT = '#7a2e0e';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const e01 = (f: number, a: number, b: number, easing = Easing.bezier(0.45, 0, 0.2, 1)) => interpolate(f, [a, b], [0, 1], {...clamp, easing});
const sceneAt = (f: number) => Math.max(0, CUTS.findIndex((c, i) => f >= c && f < CUTS[i + 1]));

/** Camera x: a whip pan of STEP metres straddling every cut. */
const camX = (t: number) => CUTS.slice(1, -1).reduce((x, c) => x + STEP * inOut((t - (c - WHIP)) / (2 * WHIP)), 0);
/** A gentle breathing zoom: eases in ~6 % over the first half of each scene and back out by the cut. */
const camZ = (t: number) => {
  const i = Math.max(0, CUTS.findIndex((c, k) => t >= c && t < CUTS[k + 1]));
  const u = Math.min(1, Math.max(0, (t - CUTS[i]) / (CUTS[i + 1] - CUTS[i])));
  return CAM_Z - 0.08 * Math.sin(Math.PI * u) ** 2;
};
const cam = (t: number): CamPose => ({pos: [camX(t) + 0.003 * Math.sin(t / 45), 0.002 * Math.sin(t / 57), camZ(t)], look: [camX(t), 0, WALL_Z]});

/* ------------------------------------------------------------------ light rig (follows the camera) */
const blindsTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d')!;
  x.fillStyle = '#fff';
  x.fillRect(0, 0, 512, 512);
  x.translate(256, 256);
  x.rotate(-0.62);
  x.filter = 'blur(10px)';
  x.fillStyle = 'rgba(0,0,0,0.62)';
  for (let i = -8; i <= 8; i++) x.fillRect(-500, i * 70, 1000, 30);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const LightRig: React.FC<{f: number}> = ({f}) => {
  const spot = useRef<THREE.SpotLight>(null);
  const target = useRef<THREE.Object3D>(null);
  const gobo = useMemo(blindsTexture, []);
  useLayoutEffect(() => {
    spot.current!.target = target.current!;
  }, []);
  return (
    <Mover f={f} radius={0} track={(t) => ({p: [camX(t), 0, 0]})}>
      <spotLight
        ref={spot}
        position={[-0.55, 0.78, 1.15]}
        angle={0.5}
        penumbra={0.3}
        decay={0}
        intensity={2.4}
        color="#fff4e6"
        map={gobo}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={3}
        shadow-bias={-0.0004}
        shadow-radius={9}
        shadow-blurSamples={8}
      />
      <object3D ref={target} position={[0, 0, WALL_Z]} />
    </Mover>
  );
};

const Studio: React.FC<{a: Assets}> = ({a}) => {
  const {gl, scene} = useThree();
  useMemo(() => {
    // glass refraction at half resolution: invisible difference, half the cost
    (gl as THREE.WebGLRenderer & {transmissionResolutionScale: number}).transmissionResolutionScale = 0.5;
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromEquirectangular(a.env).texture;
    scene.environmentIntensity = 0.55;
    pm.dispose();
  }, [gl, scene, a]);
  return <hemisphereLight args={['#ffffff', '#d9d1c4', 1.15]} />;
};

/* ------------------------------------------------------------------ the paper wall */
const GHOSTS = ['1886', '1865', '1885', '1886', '5¢', 'C+K', '1888', '$1', ''];
const Wall: React.FC = () => {
  const {paper, ghosts} = useMemo(() => {
    const p = paperTexture();
    p.repeat.set(8 / 0.128, 1.6 / 0.128); // 1.6 cm grid, as in the references
    return {paper: p, ghosts: GHOSTS.map((g) => (g ? ghostTexture(g) : null))};
  }, []);
  return (
    <>
      <mesh position={[2.3, 0, WALL_Z]} receiveShadow>
        <planeGeometry args={[8, 1.6]} />
        <meshStandardMaterial map={paper} roughness={0.95} />
      </mesh>
      {ghosts.map(
        (g, i) =>
          g && (
            <mesh key={i} position={[i * STEP, 0.01, WALL_Z + 0.0004]} receiveShadow>
              <planeGeometry args={[0.3, 0.15]} />
              <meshStandardMaterial map={g} transparent opacity={0.085} depthWrite={false} roughness={1} />
            </mesh>
          ),
      )}
    </>
  );
};

/* ------------------------------------------------------------------ fizz background (option C) */
// Drawn in wall coordinates onto a canvas that sits on the paper just around the camera view, so
// bubbles pan with the wall during whips, catch the window-blind light and blur with the motion.
const FZ_W = 0.34, FZ_H = 0.54, FZ_PPM = 4200; // metres, pixels per metre
const FZ_INK = (a: number) => `rgba(38,38,42,${a})`;
const FZ_ACC = (a: number) => `rgba(122,46,14,${a})`;
const FizzWall: React.FC<{f: number}> = ({f}) => {
  const {canvas, tex} = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = Math.round(FZ_W * FZ_PPM);
    c.height = Math.round(FZ_H * FZ_PPM);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return {canvas: c, tex: t};
  }, []);
  const cx = camX(f);
  const x = canvas.getContext('2d')!;
  const W = canvas.width, H = canvas.height;
  const toPx = (wx: number, wy: number): [number, number] => [(wx - cx + FZ_W / 2) * FZ_PPM, (FZ_H / 2 - wy) * FZ_PPM];
  x.clearRect(0, 0, W, H);
  x.filter = 'none';
  // halftone dots swelling in a slow travelling wave
  const step = 0.0176;
  for (let wx = Math.floor((cx - FZ_W / 2) / step) * step; wx < cx + FZ_W / 2; wx += step) {
    for (let wy = -FZ_H / 2 + step / 2; wy < FZ_H / 2; wy += step) {
      const [px, py] = toPx(wx + step / 2, wy);
      const wave = Math.max(0, Math.sin((wx - wy) / 0.065 - f / 14));
      x.fillStyle = FZ_INK(0.17 + 0.12 * wave);
      x.beginPath();
      x.arc(px, py, (2 + 3.2 * wave * wave) * (FZ_PPM / 3975), 0, Math.PI * 2);
      x.fill();
    }
  }
  // slow dashed ring behind each station's subject
  for (let i = 0; i < CUTS.length - 1; i++) {
    const [px, py] = toPx(i * STEP, -0.005);
    if (px < -600 || px > W + 600) continue;
    x.save();
    x.translate(px, py);
    x.rotate((f * 0.25 * Math.PI) / 180);
    x.strokeStyle = FZ_ACC(0.45);
    x.lineWidth = 2.6;
    x.setLineDash([3, 17]);
    x.beginPath();
    x.arc(0, 0, 0.1 * FZ_PPM, 0, Math.PI * 2);
    x.stroke();
    x.restore();
  }
  // rising bubbles: nearer ones are bigger, faster and softer
  x.setLineDash([]);
  for (let i = 0; i < 480; i++) {
    const depth = random(`d${i}`);
    const size = (0.0045 + depth * 0.028) / 2;
    const speed = (1.2 + depth * 4.5) / 3975;
    const bx = -0.2 + random(`x${i}`) * (STEP * (CUTS.length - 2) + 0.4) + Math.sin(f / (18 + depth * 10) + i) * (8 + depth * 22) / 3975;
    const by = -0.29 + ((f * speed + random(`y${i}`) * 0.6) % 0.6);
    if (Math.abs(bx - cx) > FZ_W / 2 + 0.04) continue;
    const [px, py] = toPx(bx, by);
    const filled = random(`f${i}`) > 0.8;
    x.filter = depth > 0.7 ? `blur(${(depth - 0.7) * 14}px)` : 'none';
    x.lineWidth = (1.5 + depth * 2) * (FZ_PPM / 3975);
    x.strokeStyle = filled ? FZ_ACC(0.5) : FZ_INK(0.32 - depth * 0.1);
    x.fillStyle = filled ? FZ_ACC(0.12) : 'rgba(0,0,0,0)';
    x.beginPath();
    x.arc(px, py, size * FZ_PPM, 0, Math.PI * 2);
    x.fill();
    x.stroke();
    if (!filled) {
      x.fillStyle = 'rgba(255,255,255,0.9)';
      x.beginPath();
      x.arc(px - size * FZ_PPM * 0.36, py - size * FZ_PPM * 0.4, size * FZ_PPM * 0.16, 0, Math.PI * 2);
      x.fill();
    }
  }
  x.filter = 'none';
  tex.needsUpdate = true;
  return (
    <mesh position={[cx, 0, WALL_Z + 0.0006]} receiveShadow>
      <planeGeometry args={[FZ_W, FZ_H]} />
      <meshStandardMaterial map={tex} transparent depthWrite={false} roughness={1} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ helpers */
const still = (to: Pose, drift = 1, seed = 0) => (t: number) => enter(t, -1000, 1, to, to, drift, seed);
const fillAt = (f: number, id: string, max = 0.86) => {
  const p = E(id);
  const x = Math.min(1, Math.max(0, (f - p.f) / p.d));
  return max * (1 - Math.pow(1 - x, 1.6));
};
/** Cola stream from above the frame into a glass whose base pose is known. */
const Pour: React.FC<{f: number; id: string; glass: Pose}> = ({f, id, glass}) => {
  const p = E(id);
  if (f < p.f || f > p.f + p.d + 8) return null;
  const surface = glass.p[1] + liquidTop(fillAt(f, id));
  const head = Math.max(surface, 0.32 - (f - p.f) * 0.07);
  const tail = f > p.f + p.d - 6 ? 0.32 - (f - (p.f + p.d - 6)) * 0.07 : 0.32;
  if (tail <= head) return null;
  return <PourStream from={tail} to={head} x={glass.p[0]} z={glass.p[2]} wobble={f * 1.7} />;
};

/* ------------------------------------------------------------------ stations */
const Station: React.FC<{i: number; f: number; a: Assets}> = ({i, f, a}) => {
  const g = a.gltf;
  const body = (() => {
    switch (i) {
      case 0: {
        const glassTo: Pose = {p: [0.05, -0.075, 0], r: [0.04, 0, -0.03]};
        const gl0 = E('s0.glass'), lf = E('s0.leaf'), kn = E('s0.kola');
        const glassTrack = (t: number) => enter(t, gl0.f, gl0.d, {p: [0.22, -0.42, 0.12], r: [0.7, 1.4, -1.0]}, glassTo, 0.5, 1);
        return (
          <>
            <Mover f={f} radius={0.07} track={glassTrack}>
              <FountainGlass fill={fillAt(f, 's0.pour')} frame={f} />
            </Mover>
            <Pour f={f} id="s0.pour" glass={glassTrack(f)} />
            <Mover f={f} track={(t) => enter(t, lf.f, lf.d, {p: [-0.26, 0.32, 0.1], r: [2.5, 1.5, 3.2]}, {p: [-0.078, 0.028, 0.03], r: [0.25, 0.45, 0.55]}, 1, 2)}>
              <CocaLeaf seed="h1" />
            </Mover>
            <Mover f={f} track={(t) => enter(t, kn.f, kn.d, {p: [-0.32, -0.06, 0.06], r: [0, 0.6, 6.5]}, {p: [-0.066, -0.074, 0.045], r: [0.5, 0.3, 0.25]}, 1, 3)}>
              <KolaNut seed="h2" />
            </Mover>
          </>
        );
      }
      case 1: {
        const c = E('s1.card'), w = E('s1.watch'), s = E('s1.specs');
        return (
          <>
            <Mover f={f} radius={0.09} track={(t) => enter(t, c.f, c.d, {p: [-0.32, 0.1, 0.12], r: [0.4, -1.3, 0.9]}, {p: [-0.005, 0.0, 0], r: [0.02, 0.1, -0.05]}, 1, 4)}>
              <CabinetCard photo={a.photos.pemberton} caption="J. S. Pemberton" />
            </Mover>
            <Mover f={f} track={(t) => enter(t, w.f, w.d, {p: [0.24, 0.36, 0.12], r: [0, 0, -5]}, {p: [0.078, -0.07, 0.05], r: [0.15, -0.4, 0.3]}, 1, 5)}>
              <Model scene={g.pocket_watch} scale={1.15} />
            </Mover>
            <Mover f={f} radius={0.08} track={(t) => enter(t, s.f, s.d, {p: [0.02, -0.4, 0.14], r: [1.2, 0.8, 0.6]}, {p: [-0.06, -0.098, 0.055], r: [0.2, 0.45, -0.12]}, 1, 6)}>
              <Model scene={g.round_spectacles} />
            </Mover>
          </>
        );
      }
      case 2: {
        const b = E('s2.bottle');
        const leaves = ['s2.leaf0', 's2.leaf1', 's2.leaf2'].map(E);
        const kolas = ['s2.kola0', 's2.kola1'].map(E);
        const leafTo: V3[] = [[-0.085, -0.058, 0.04], [-0.052, -0.094, 0.055], [-0.1, -0.02, 0.02]];
        const kolaFrom: V3[] = [[-0.22, -0.4, 0.1], [0.32, -0.32, 0.08]];
        const kolaTo: V3[] = [[0.072, -0.098, 0.05], [0.1, -0.062, 0.03]];
        return (
          <>
            <Mover f={f} radius={0.14} track={(t) => enter(t, b.f, b.d, {p: [0.36, 0.08, 0.06], r: [0.2, -1.6, -1.5]}, {p: [0.035, 0.0, -0.04], r: [0.05, 0.35, 0.42]}, 1, 7)}>
              <group position={[0, -0.13, 0]} scale={0.8}>
                <TonicWineBottle scene={g.wine_bottles_01} />
              </group>
            </Mover>
            {leaves.map((l, k) => (
              <Mover key={k} f={f} track={(t) => enter(t, l.f, l.d, {p: [-0.12 + k * 0.06, 0.36, 0.1], r: [2 + k, 1 + k, 3 - k]}, {p: leafTo[k], r: [0.3 + k * 0.2, 0.3 - k * 0.3, 0.4 + k * 0.7]}, 1, 8 + k)}>
                <CocaLeaf seed={`c${k}`} length={0.052 + k * 0.006} />
              </Mover>
            ))}
            {kolas.map((k0, k) => (
              <Mover key={k} f={f} track={(t) => enter(t, k0.f, k0.d, {p: kolaFrom[k], r: [0, 0, (k ? -1 : 1) * 6]}, {p: kolaTo[k], r: [0.4, k * 1.3, 0.2]}, 1, 11 + k)}>
                <KolaNut seed={`k${k}`} />
              </Mover>
            ))}
          </>
        );
      }
      case 3: {
        const st = E('s3.stamp'), kn = E('s3.knock'), j = E('s3.jug');
        const bottleTo: Pose = {p: [0.035, 0.0, -0.04], r: [0.05, 0.35, 0.42]};
        const hit = st.f + st.d;
        const stampTrack = (t: number): Pose => {
          const at: V3 = [-0.02, 0.075, WALL_Z - 0.0012];
          const atR: V3 = [Math.PI / 2, 0, -0.14];
          if (t < st.f) return {p: [0.12, 0.2, 0.75], r: [1.2, 0.4, -0.6], s: 0};
          if (t < hit) {
            const k = inQuad((t - st.f) / st.d);
            return {p: mix3([0.12, 0.2, 0.75], at, k), r: mix3([1.2, 0.4, -0.6], atR, k)};
          }
          if (t < hit + 5) return {p: at, r: atR};
          const k = 1 - (1 - Math.min(1, (t - hit - 5) / 14)) ** 2;
          return {p: mix3(at, [0.3, 0.36, 0.55], k), r: mix3(atR, [1.0, -0.4, 0.5], k)};
        };
        const bottleTrack = (t: number): Pose => {
          if (t < kn.f) return still(bottleTo, 1, 7)(t);
          const k = inQuad((t - kn.f) / kn.d);
          return {p: mix3(bottleTo.p, [-0.5, 0.12, 0.08], k), r: mix3(bottleTo.r!, [1.2, 2.5, 3.0], k)};
        };
        return (
          <>
            <Mover f={f} radius={0.14} track={bottleTrack}>
              <group position={[0, -0.13, 0]} scale={0.8}>
                <TonicWineBottle scene={g.wine_bottles_01} />
              </group>
            </Mover>
            <Mover f={f} radius={0.06} track={stampTrack}>
              <RubberStamp />
            </Mover>
            <Decal visible={f >= hit} />
            <Mover f={f} radius={0.1} track={(t) => ({p: [0.02, -0.108, 0.0], r: [0.1, -2.3 + 0.004 * Math.max(0, t - j.f), 0], s: t < j.f ? 0 : 0.72 * backOut((t - j.f) / j.d)})}>
              <Model scene={g.jug_01} />
            </Mover>
          </>
        );
      }
      case 4: {
        const gl0 = E('s4.glass'), c = E('s4.coin');
        const land = c.f + c.d;
        const glassTrack = (t: number) => enter(t, gl0.f, gl0.d, {p: [-0.36, 0.12, 0.12], r: [-0.6, -1.2, 1.0]}, {p: [0.05, -0.075, 0], r: [0.03, 0, 0.025]}, 0.5, 12);
        const coinTrack = (t: number): Pose => {
          const q = enter(t, c.f, c.d, {p: [0.36, 0.22, 0.4], r: [0, 0, 0]}, {p: [-0.052, -0.06, 0.3], r: [0, 0, 0]}, 1, 13);
          const x = Math.min(1, Math.max(0, (t - c.f) / c.d));
          q.r![0] += (1 - x) * Math.PI * 6; // flips through the air
          q.r![1] += t > land ? 14 * (1 - Math.exp(-(t - land) / 28)) : 0; // then spins down like a real coin
          return q;
        };
        return (
          <>
            <Mover f={f} radius={0.07} track={glassTrack}>
              <FountainGlass fill={fillAt(f, 's4.pour')} frame={f} />
            </Mover>
            <Pour f={f} id="s4.pour" glass={glassTrack(f)} />
            {f >= c.f - 1 && (
              <Mover f={f} radius={0.012} track={coinTrack}>
                <group rotation={[Math.PI / 2 - 0.3, 0, 0]}>
                  <Nickel a={a.coin} />
                </group>
              </Mover>
            )}
          </>
        );
      }
      case 5: {
        const l = E('s5.leaf'), k = E('s5.kola');
        return (
          <>
            <Mover f={f} track={(t) => enter(t, l.f, l.d, {p: [-0.34, 0.0, 0.1], r: [0.5, -1.5, 2]}, {p: [-0.058, -0.03, 0.035], r: [0.2, 0.35, 0.35]}, 1, 14)}>
              <CocaLeaf seed="n1" length={0.072} />
            </Mover>
            <Mover f={f} track={(t) => enter(t, k.f, k.d, {p: [0.34, -0.05, 0.1], r: [0, 0, -6]}, {p: [0.064, -0.034, 0.04], r: [0.5, -0.3, -0.2]}, 1, 15)}>
              <KolaNut seed="n2" size={0.044} />
            </Mover>
          </>
        );
      }
      case 6: {
        const c = E('s6.card'), cs = E('s6.coins');
        return (
          <>
            <Mover f={f} radius={0.09} track={(t) => enter(t, c.f, c.d, {p: [0.3, 0.36, 0.12], r: [0.6, 1.4, -1.1]}, {p: [-0.03, 0.0, 0], r: [0.02, -0.1, 0.04]}, 1, 16)}>
              <CabinetCard photo={a.photos.candler} caption="Asa G. Candler" />
            </Mover>
            <group position={[0.07, -0.085, 0.25]} rotation={[0.55, -0.4, 0]}>
              {Array.from({length: 12}).map((_, k) => {
                const at = cs.f + k * 4;
                return (
                  <Mover
                    key={k}
                    f={f}
                    radius={0.02}
                    track={(t) => ({p: [Math.sin(k * 2.1) * 0.0008, 0.001 + k * 0.00196 + (1 - inQuad((t - at) / 6)) * 0.1, Math.cos(k * 1.7) * 0.0008], r: [0, k * 0.9, 0], s: t < at ? 0 : 1})}
                  >
                    <Nickel a={a.coin} />
                  </Mover>
                );
              })}
            </group>
          </>
        );
      }
      case 7: {
        const xs = [-0.07, 0, 0.07];
        const pop = E('s7.pop');
        return (
          <>
            {['s7.b0', 's7.b1', 's7.b2'].map((id, k) => {
              const b = E(id);
              return (
                <Mover
                  key={k}
                  f={f}
                  radius={0.1}
                  track={(t) => {
                    const q = enter(t, b.f, b.d, {p: [xs[k], -0.42, 0.1], r: [0.4, 0, (k - 1) * 0.5]}, {p: [xs[k], -0.088, -0.01 * k], r: [0, 0.4 * k, (k - 1) * -0.05]}, 1, 17 + k);
                    if (k === 1 && t > pop.f) q.s = 1 + 0.05 * Math.exp(-(t - pop.f) / 5) * Math.sin((t - pop.f) * 1.4);
                    return q;
                  }}
                >
                  <HutchinsonBottle seed={`h${k}`} />
                </Mover>
              );
            })}
          </>
        );
      }
      default: {
        const ea = E('s8.earth');
        return (
          <Mover f={f} radius={0.08} track={(t) => ({p: [0, -0.03 + 0.003 * Math.sin(t / 30), 0.02], r: [0, 0, 0], s: t < ea.f ? 0 : backOut((t - ea.f) / ea.d)})}>
            <Globe earth={a.earth} spin={3.3 + f * 0.012} />
          </Mover>
        );
      }
    }
  })();
  return <group position={[i * STEP, 0, 0]}>{body}</group>;
};

const Decal: React.FC<{visible: boolean}> = ({visible}) => {
  const tex = useMemo(() => inkTexture('PROHIBITION'), []);
  return (
    <mesh position={[-0.02, 0.075, WALL_Z + 0.0008]} rotation={[0, 0, -0.14]} visible={visible} receiveShadow>
      <planeGeometry args={[0.13, 0.038]} />
      <meshStandardMaterial map={tex} transparent opacity={0.9} depthWrite={false} roughness={0.9} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ 2D type layers */
const TITLES: {kicker: string; lead: string; key: string; body: string}[] = [
  {kicker: 'THE ORIGIN STORY', lead: 'how a pharmacist invented', key: 'Coca-Cola', body: 'It began with a war wound, a tonic wine and a new law.'},
  {kicker: 'COLUMBUS, GEORGIA · 1865', lead: 'it starts with', key: 'John S. Pemberton', body: 'Wounded in the Civil War, he became dependent on morphine and searched for a substitute.'},
  {kicker: 'ATLANTA · 1885', lead: 'his first attempt', key: 'French Wine Coca', body: 'A tonic of wine, coca leaf and kola nut, sold for nerves and headaches.'},
  {kicker: 'ATLANTA · 1886', lead: 'then the city voted', key: 'to ban alcohol', body: 'So he remade the tonic as a syrup, without the wine.'},
  {kicker: "MAY 8, 1886 · JACOBS' PHARMACY", lead: 'first sold at a soda fountain for', key: '5¢ a glass', body: 'Syrup mixed with carbonated water, served in a 6.5-ounce glass. About nine glasses a day that first year.'},
  {kicker: 'THE NAME', lead: 'named after its two ingredients', key: 'Coca + Kola', body: 'Bookkeeper Frank M. Robinson chose the name and wrote it out in flowing Spencerian script.'},
  {kicker: 'NEW OWNER · 1888', lead: 'after Pemberton died', key: 'Asa G. Candler', body: 'He took control for about $2,300 and founded The Coca-Cola Company in 1892.'},
  {kicker: '1894 – 1903', lead: 'then it went', key: 'into the bottle', body: 'First bottled in Vicksburg, Mississippi, in 1894. National bottling rights sold for $1 in 1899. Cocaine removed by 1903.'},
  {kicker: 'TODAY', lead: 'from one soda fountain to', key: '200+ countries', body: ''},
];

const Type: React.FC<{f: number; scene: number}> = ({f, scene}) => {
  const s0 = CUTS[scene];
  const t = TITLES[scene];
  const k = e01(f, s0 + 6, s0 + 20);
  // type rides along with the whip pan, with blur proportional to its speed
  const off = -(camX(f) - scene * STEP) * PX_PER_M;
  const speed = Math.abs(camX(f + 0.5) - camX(f - 0.5)) * PX_PER_M;
  const cta = scene === 8 && f >= s0 + 80;
  const strike = e01(f, s0 + 100, s0 + 110);
  return (
    <AbsoluteFill style={{transform: `translateX(${off}px)`, filter: `blur(${Math.min(30, speed * 0.25)}px)`}}>
      {!cta ? (
        <div style={{position: 'absolute', left: 90, right: 90, top: 150}}>
          <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 24, letterSpacing: `${0.7 - 0.4 * k}em`, color: '#7a7a80', opacity: k}}>{t.kicker}</div>
          <div style={{fontFamily: 'Caveat', fontWeight: 600, fontSize: 66, color: INK, marginTop: 14}}>
            <TypeText text={t.lead} start={s0 + 10} cps={1.8} />
          </div>
          <div style={{fontFamily: 'Inter', fontWeight: 800, fontStyle: 'italic', fontSize: 96, lineHeight: 1.02, letterSpacing: -2, color: INK}}>
            <WordRise words={t.key.split(' ')} start={s0 + 20} gap={5} ink={scene === 4 ? [122, 46, 14] : [38, 38, 42]} />
          </div>
        </div>
      ) : (
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
          <div style={{fontFamily: 'Caveat', fontWeight: 600, fontSize: 72, color: INK}}>
            <TypeText text="follow for more" start={s0 + 84} cps={1.8} />
          </div>
          <div style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 124, color: INK, lineHeight: 1, letterSpacing: -3}}>
            <WordRise words={['ORIGIN', 'STORIES']} start={s0 + 92} gap={7} />
          </div>
        </div>
      )}
      {scene === 5 && (
        <div style={{position: 'absolute', top: 1320, left: 0, right: 0, textAlign: 'center', fontFamily: 'Caveat', fontWeight: 600, fontSize: 110, color: INK}}>
          <TypeText text="Coca" start={s0 + 24} cps={0.35} trail={8} />
          <span style={{opacity: e01(f, s0 + 44, s0 + 52), margin: '0 22px', color: '#9a9aa0'}}>+</span>
          <span style={{position: 'relative', display: 'inline-block'}}>
            <TypeText text="Kola" start={s0 + 54} cps={0.35} trail={8} />
            <svg width={70} height={120} style={{position: 'absolute', left: -4, top: 20, overflow: 'visible'}}>
              <line x1={0} y1={100} x2={60 * strike} y2={100 - 90 * strike} stroke={ACCENT} strokeWidth={7} strokeLinecap="round" />
            </svg>
            <span style={{position: 'absolute', left: 8, top: -90, color: ACCENT, opacity: e01(f, s0 + 110, s0 + 122)}}>C</span>
          </span>
        </div>
      )}
      {scene === 6 && f >= E('s6.coins').f && (
        <div style={{position: 'absolute', top: 1330, left: 90, fontFamily: 'Poppins', fontWeight: 700, fontSize: 118, color: ACCENT, letterSpacing: -4, fontVariantNumeric: 'tabular-nums'}}>
          ${Math.round(interpolate(f, [E('s6.coins').f, E('s6.coins').f + 50], [0, 2300], {...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1)})).toLocaleString('en-US')}
        </div>
      )}
      {t.body && (
        <div style={{position: 'absolute', left: 90, right: 90, top: 1560, fontFamily: 'Inter', fontWeight: 500, fontSize: 36, lineHeight: 1.45, color: '#3a3a3e'}}>
          <TypeText text={t.body} start={s0 + 40} cps={3} trail={4} />
        </div>
      )}
      {scene === 8 && (
        <div style={{position: 'absolute', left: 90, right: 90, bottom: 70, fontFamily: 'Inter', fontWeight: 500, fontSize: 19, lineHeight: 1.5, color: 'rgba(38,38,42,0.55)', opacity: e01(f, s0 + 20, s0 + 34)}}>
          Not affiliated with or endorsed by The Coca-Cola Company. Photos: public domain (Wikimedia Commons). Coin: Smithsonian NNC. 3D models &amp; HDRI: Poly Haven (CC0). Sound: Joseph Sardin, BigSoundBank (CC0). Earth: NASA.
        </div>
      )}
    </AbsoluteFill>
  );
};

const Grain: React.FC<{f: number}> = ({f}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.055, mixBlendMode: 'multiply'}}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 113} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

/* ------------------------------------------------------------------ assembly */
export const ColaOrigin: React.FC<{sound: boolean}> = ({sound}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const scene = sceneAt(f);
  const {assets: a, handle} = useAssets();
  const live = CUTS.slice(0, -1).map((c, i) => i).filter((i) => f >= CUTS[i] - WHIP - 1 && f < CUTS[i + 1] + WHIP + 1);
  const fade = Math.max(interpolate(f, [0, 8], [1, 0], clamp), interpolate(f, [COLA_DURATION - 14, COLA_DURATION - 1], [0, 1], clamp));
  return (
    <AbsoluteFill style={{background: '#f3f1ec', overflow: 'hidden'}}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{type: THREE.VSMShadowMap}}
        gl={{antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0}}
        camera={{fov: FOV, near: 0.05, far: 10, position: [0, 0, CAM_Z]}}
      >
        <MotionProvider>
          {a && (
            <>
              <Studio a={a} />
              <LightRig f={f} />
              <Wall />
              <FizzWall f={f} />
              {live.map((i) => (
                <Station key={i} i={i} f={f} a={a} />
              ))}
              <MotionBlurRenderer f={f} cam={cam} maxSamples={6} />
            </>
          )}
          <ReleaseWhenDrawn handle={handle} ready={!!a} />
        </MotionProvider>
      </ThreeCanvas>
      {/* soft focus: blur only the picture around the edges so the eye stays in the middle; type stays sharp */}
      <AbsoluteFill
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          maskImage: 'radial-gradient(ellipse 78% 58% at 50% 52%, transparent 62%, black 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 78% 58% at 50% 52%, transparent 62%, black 100%)',
        }}
      />
      <Type f={f} scene={scene} />
      <Grain f={f} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 62%, rgba(60,50,40,0.16) 100%)'}} />
      <AbsoluteFill style={{background: '#f3f1ec', opacity: fade}} />
      {sound && <Audio src={staticFile('cola-mix.wav')} />}
    </AbsoluteFill>
  );
};
