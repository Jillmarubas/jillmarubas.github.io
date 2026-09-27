import React, {createContext, useContext, useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';
import {FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Choreography + true 3D motion blur.
 *
 * Every animated object is a <Mover> whose pose is a pure function of time (in frames,
 * fractional allowed). The renderer evaluates those functions at several instants inside
 * the shutter (180°, half a frame) and averages the renders, so fast entrances and whip
 * pans smear exactly like filmed motion. Still frames use one sample, so holds cost nothing.
 */
export type V3 = [number, number, number];
export type Pose = {p: V3; r?: V3; s?: number};
export type Track = (t: number) => Pose;
export type CamPose = {pos: V3; look: V3};

type Entry = {obj: THREE.Object3D; track: Track; radius: number};
const Registry = createContext<Set<Entry> | null>(null);

const apply = (o: THREE.Object3D, q: Pose) => {
  o.position.set(q.p[0], q.p[1], q.p[2]);
  if (q.r) o.rotation.set(q.r[0], q.r[1], q.r[2]);
  const s = q.s ?? 1;
  o.scale.setScalar(Math.max(1e-4, s));
  o.visible = s > 0.001;
};

export const Mover: React.FC<{track: Track; f: number; radius?: number; children: React.ReactNode}> = ({track, f, radius = 0.05, children}) => {
  const reg = useContext(Registry)!;
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const e = {obj: ref.current!, track, radius};
    reg.add(e);
    apply(ref.current!, track(f));
    return () => {
      reg.delete(e);
    };
  });
  return <group ref={ref}>{children}</group>;
};

export const MotionProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const reg = useMemo(() => new Set<Entry>(), []);
  return <Registry.Provider value={reg}>{children}</Registry.Provider>;
};

const SHUTTER = 0.5; // fraction of a frame the shutter is open
const PX_PER_SAMPLE = 3; // add a sample for every 3 px of travel during the shutter

export const MotionBlurRenderer: React.FC<{f: number; cam: (t: number) => CamPose; maxSamples?: number}> = ({f, cam, maxSamples = 10}) => {
  const reg = useContext(Registry)!;
  const {gl, scene, camera} = useThree();
  const res = useMemo(() => {
    const add = new FullScreenQuad(
      new THREE.ShaderMaterial({
        uniforms: {tex: {value: null}, w: {value: 1}},
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tex, vUv) * w; }',
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
        depthTest: false,
        depthWrite: false,
        transparent: true,
      }),
    );
    const output = new OutputPass();
    output.renderToScreen = true;
    return {add, output, sample: null as THREE.WebGLRenderTarget | null, sampleFast: null as THREE.WebGLRenderTarget | null, accum: null as THREE.WebGLRenderTarget | null};
  }, []);

  useFrame(() => {
    const size = gl.getDrawingBufferSize(new THREE.Vector2());
    if (!res.sample || res.sample.width !== size.x || res.sample.height !== size.y) {
      res.sample?.dispose();
      res.sampleFast?.dispose();
      res.accum?.dispose();
      // MSAA for still frames; blurred frames average several samples, which already smooths edges
      res.sample = new THREE.WebGLRenderTarget(size.x, size.y, {type: THREE.HalfFloatType, samples: 4});
      res.sampleFast = new THREE.WebGLRenderTarget(size.x, size.y, {type: THREE.HalfFloatType});
      res.accum = new THREE.WebGLRenderTarget(size.x, size.y, {type: THREE.HalfFloatType});
    }
    const pcam = camera as THREE.PerspectiveCamera;
    const setAt = (t: number) => {
      for (const e of reg) apply(e.obj, e.track(t));
      const c = cam(t);
      pcam.position.set(...c.pos);
      pcam.lookAt(...c.look);
      pcam.updateMatrixWorld();
      scene.updateMatrixWorld();
    };
    // how far (in pixels) does anything travel while the shutter is open?
    const probe = (t: number) => {
      setAt(t);
      const pts: THREE.Vector3[] = [new THREE.Vector3(pcam.position.x, pcam.position.y, 0).project(pcam)];
      for (const e of reg) {
        if (!e.obj.visible) continue;
        for (const o of [[0, 0, 0], [e.radius, 0, 0], [0, e.radius, 0], [0, 0, e.radius]] as V3[]) {
          pts.push(e.obj.localToWorld(new THREE.Vector3(...o).divideScalar(Math.max(1e-4, e.obj.scale.x))).project(pcam));
        }
      }
      return pts;
    };
    const a = probe(f - SHUTTER / 2);
    const b = probe(f + SHUTTER / 2);
    let travel = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      travel = Math.max(travel, Math.hypot(((a[i].x - b[i].x) * size.x) / 2, ((a[i].y - b[i].y) * size.y) / 2));
    }
    const n = Math.max(1, Math.min(maxSamples, Math.ceil(travel / PX_PER_SAMPLE)));

    // three.js clears the target before every draw by default, which would wipe the
    // accumulator between samples: take manual control of clearing for this loop.
    const autoClear = gl.autoClear;
    gl.autoClear = false;
    gl.setRenderTarget(res.accum);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    for (let k = 0; k < n; k++) {
      setAt(n === 1 ? f : f + ((k + 0.5) / n - 0.5) * SHUTTER);
      const target = n === 1 ? res.sample! : res.sampleFast!;
      gl.setRenderTarget(target);
      gl.setClearColor(0x000000, 0);
      gl.clear();
      gl.render(scene, pcam);
      (res.add.material as THREE.ShaderMaterial).uniforms.tex.value = target.texture;
      (res.add.material as THREE.ShaderMaterial).uniforms.w.value = 1 / n;
      gl.setRenderTarget(res.accum);
      res.add.render(gl);
    }
    gl.autoClear = autoClear;
    setAt(f);
    res.output.render(gl, null as unknown as THREE.WebGLRenderTarget, res.accum!, 0, false);
  }, 1);
  return null;
};

/* ------------------------------------------------------------------ easing for tracks */
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Fast in, ~3 % overshoot, settles by x = 1 (measured: references peak at 20-50 % of the move). */
export const settle = (x: number) => (x <= 0 ? 0 : x >= 1.4 ? 1 : 1 - Math.exp(-5.2 * x) * Math.cos(1.55 * Math.PI * x));
export const inOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const inQuad = (x: number) => clamp01(x) ** 2;
export const backOut = (x: number) => {
  const t = clamp01(x), c = 1.9;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
};
export const mix3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** Enter from `from` to `to` starting at frame `f0` over `d` frames, then drift gently forever. */
export const enter = (t: number, f0: number, d: number, from: Pose, to: Pose, drift = 1, seed = 0): Pose => {
  const x = (t - f0) / d;
  const k = settle(x);
  const hold = Math.max(0, t - f0 - d);
  const bob = drift * Math.min(1, hold / 20);
  const p = mix3(from.p, to.p, k);
  p[1] += bob * 0.0025 * Math.sin(hold / 23 + seed);
  p[0] += bob * 0.0015 * Math.sin(hold / 31 + seed * 2);
  const r = mix3(from.r ?? [0, 0, 0], to.r ?? [0, 0, 0], k);
  r[1] += bob * 0.004 * hold * 0.35;
  r[2] += bob * 0.03 * Math.sin(hold / 40 + seed);
  const s = (from.s ?? 1) + ((to.s ?? 1) - (from.s ?? 1)) * k;
  return {p, r, s: x < 0 ? (from.s ?? 1) : s};
};
