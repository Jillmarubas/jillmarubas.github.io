import React, {createContext, useContext, useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';
import {FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {Easing} from 'remotion';

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

/**
 * Scene exit: every object eases forward off the paper and past the viewer's eye, blurring
 * as it nears the lens (the depth-of-field pass in MotionBlurRenderer does the blur).
 * Objects leave left to right, a few frames apart, each drifting outward from the frame
 * centre so it slips past the camera instead of clipping through it.
 */
export type Exit = {start: number; d: number; z: number};
export const ExitContext = createContext<Exit | null>(null);
const exitEase = Easing.bezier(0.42, 0, 0.8, 0.55); // gentle start, still moving as it passes the lens
const withExit = (track: Track, ex: Exit): Track => {
  const b = track(ex.start);
  const lag = Math.min(1, Math.max(0, (b.p[0] + 0.1) / 0.2)) * 8;
  let dx = b.p[0], dy = b.p[1] + 0.01;
  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;
  return (t) => {
    const q = track(t);
    const x = (t - ex.start - lag) / ex.d;
    if (x <= 0) return q;
    const k = exitEase(Math.min(1, x));
    const p: V3 = [q.p[0] + dx * 0.11 * k, q.p[1] + dy * 0.11 * k, q.p[2] + (ex.z - q.p[2]) * k];
    const r0 = q.r ?? [0, 0, 0];
    const r: V3 = [r0[0] + 0.5 * k * dy, r0[1] + 0.7 * k * dx, r0[2] - 0.3 * k * dx];
    return {p, r, s: x >= 1 ? 0 : q.s};
  };
};

const apply = (o: THREE.Object3D, q: Pose) => {
  o.position.set(q.p[0], q.p[1], q.p[2]);
  if (q.r) o.rotation.set(q.r[0], q.r[1], q.r[2]);
  const s = q.s ?? 1;
  o.scale.setScalar(Math.max(1e-4, s));
  o.visible = s > 0.001;
};

export const Mover: React.FC<{track: Track; f: number; radius?: number; noExit?: boolean; children: React.ReactNode}> = ({track: base, f, radius = 0.05, noExit, children}) => {
  const reg = useContext(Registry)!;
  const ex = useContext(ExitContext);
  const track = ex && !noExit ? withExit(base, ex) : base;
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

/* ------------------------------------------------------------------ depth of field (near field only) */
const quadVS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
/** Blur amount 0..1 from depth: sharp on the paper and anything resting near it, fully soft close to the lens. */
const cocFS = `#include <packing>
uniform sampler2D depth; uniform float near, far, sharpAt, softAt; varying vec2 vUv;
void main(){
  float z = unpackRGBAToDepth(texture2D(depth, vUv));
  float d = z >= 0.9999 ? far : -perspectiveDepthToViewZ(z, near, far);
  gl_FragColor = vec4(smoothstep(sharpAt, softAt, d), 0.0, 0.0, 1.0);
}`;
/** Spread the near-field blur outward so a soft foreground object bleeds over the sharp paper behind it. */
const dilateFS = `uniform sampler2D coc; uniform vec2 px; uniform float r; varying vec2 vUv;
void main(){
  float m = 0.0;
  for (int i = -4; i <= 4; i++) for (int j = -4; j <= 4; j++) {
    vec2 o = vec2(float(i), float(j)) / 4.0;
    if (dot(o, o) > 1.0) continue;
    float c = texture2D(coc, vUv + o * px * r).r;
    m = max(m, c * (1.0 - 0.35 * length(o)));
  }
  gl_FragColor = vec4(max(m, texture2D(coc, vUv).r), 0.0, 0.0, 1.0);
}`;
/** Separable gather blur whose radius follows the (dilated) blur map. */
const blurFS = `uniform sampler2D tex; uniform sampler2D coc; uniform vec2 dir; uniform float maxPx; varying vec2 vUv;
void main(){
  float c = texture2D(coc, vUv).r;
  if (c < 0.004) { gl_FragColor = texture2D(tex, vUv); return; }
  vec4 acc = vec4(0.0); float wsum = 0.0;
  for (int i = -12; i <= 12; i++) {
    float u = float(i) / 12.0;
    float w = 1.0 - 0.5 * abs(u);
    acc += texture2D(tex, vUv + dir * u * c * maxPx) * w; wsum += w;
  }
  gl_FragColor = acc / wsum;
}`;

const SHUTTER = 0.5; // fraction of a frame the shutter is open
const PX_PER_SAMPLE = 3; // add a sample for every 3 px of travel during the shutter

export type Focus = {focus: number; sharp: number; soft: number; maxPx: number};
export const MotionBlurRenderer: React.FC<{f: number; cam: (t: number) => CamPose; maxSamples?: number; dof?: Focus}> = ({f, cam, maxSamples = 10, dof}) => {
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
    const mat = (fs: string, uniforms: Record<string, THREE.IUniform>) => new FullScreenQuad(new THREE.ShaderMaterial({uniforms, vertexShader: quadVS, fragmentShader: fs, depthTest: false, depthWrite: false}));
    const coc = mat(cocFS, {depth: {value: null}, near: {value: 0.1}, far: {value: 100}, sharpAt: {value: 1}, softAt: {value: 0.2}});
    const dilate = mat(dilateFS, {coc: {value: null}, px: {value: new THREE.Vector2()}, r: {value: 1}});
    const blur = mat(blurFS, {tex: {value: null}, coc: {value: null}, dir: {value: new THREE.Vector2()}, maxPx: {value: 1}});
    const depthMat = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking});
    const low = () => new THREE.WebGLRenderTarget(1, 1, {type: THREE.HalfFloatType});
    const dofT = {depth: new THREE.WebGLRenderTarget(1, 1), coc: low(), cocD: low(), tmp: null as THREE.WebGLRenderTarget | null, out: null as THREE.WebGLRenderTarget | null};
    return {add, output, coc, dilate, blur, depthMat, dofT, sample: null as THREE.WebGLRenderTarget | null, sampleFast: null as THREE.WebGLRenderTarget | null, accum: null as THREE.WebGLRenderTarget | null};
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
      const qx = Math.ceil(size.x / 4), qy = Math.ceil(size.y / 4);
      res.dofT.depth.setSize(qx, qy);
      res.dofT.coc.setSize(qx, qy);
      res.dofT.cocD.setSize(qx, qy);
      res.dofT.tmp?.dispose();
      res.dofT.out?.dispose();
      res.dofT.tmp = new THREE.WebGLRenderTarget(size.x, size.y, {type: THREE.HalfFloatType});
      res.dofT.out = new THREE.WebGLRenderTarget(size.x, size.y, {type: THREE.HalfFloatType});
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
    setAt(f);

    // Depth of field, only while something is close to the lens (the scene exits)
    let final = res.accum!;
    const near = dof && [...reg].some((e) => e.obj.visible && e.obj.getWorldPosition(new THREE.Vector3()).distanceTo(pcam.position) < dof.sharp);
    if (dof && near) {
      const T = res.dofT;
      const U = (q: FullScreenQuad) => (q.material as THREE.ShaderMaterial).uniforms;
      const prevOverride = scene.overrideMaterial;
      const prevShadow = gl.shadowMap.autoUpdate;
      gl.shadowMap.autoUpdate = false;
      scene.overrideMaterial = res.depthMat;
      gl.setRenderTarget(T.depth);
      gl.setClearColor(0xffffff, 1);
      gl.clear();
      gl.render(scene, pcam);
      scene.overrideMaterial = prevOverride;
      gl.shadowMap.autoUpdate = prevShadow;
      U(res.coc).depth.value = T.depth.texture;
      U(res.coc).near.value = pcam.near;
      U(res.coc).far.value = pcam.far;
      U(res.coc).sharpAt.value = dof.sharp;
      U(res.coc).softAt.value = dof.soft;
      gl.setRenderTarget(T.coc);
      res.coc.render(gl);
      U(res.dilate).coc.value = T.coc.texture;
      U(res.dilate).px.value.set(1 / T.coc.width, 1 / T.coc.height);
      U(res.dilate).r.value = (dof.maxPx * size.x) / 1080 / 4; // maxPx is measured at 1080 px wide
      gl.setRenderTarget(T.cocD);
      res.dilate.render(gl);
      U(res.blur).coc.value = T.cocD.texture;
      U(res.blur).maxPx.value = 1;
      U(res.blur).tex.value = res.accum!.texture;
      U(res.blur).dir.value.set(dof.maxPx / 1080, 0);
      gl.setRenderTarget(T.tmp);
      res.blur.render(gl);
      U(res.blur).tex.value = T.tmp!.texture;
      U(res.blur).dir.value.set(0, ((dof.maxPx / 1080) * size.x) / size.y);
      gl.setRenderTarget(T.out);
      res.blur.render(gl);
      final = T.out!;
    }
    gl.autoClear = autoClear;
    res.output.render(gl, null as unknown as THREE.WebGLRenderTarget, final, 0, false);
  }, 1);
  return null;
};

/* ------------------------------------------------------------------ easing for tracks */
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/**
 * Smooth glide: gentle acceleration, long soft landing, no overshoot.
 * cubic-bezier(0.33, 0, 0.15, 1) — peak speed about a third of the way in, then a slow settle
 * (the user found the earlier snap-and-overshoot too abrupt).
 */
const glide = Easing.bezier(0.33, 0, 0.15, 1);
export const settle = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : glide(x));
export const inOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const inQuad = (x: number) => clamp01(x) ** 2;
/** Pop in place: same smooth glide, used for scale-ins. */
export const backOut = (x: number) => settle(x);
export const mix3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** Enter from `from` to `to` starting at frame `f0` over `d` frames, then drift gently forever. */
export const enter = (t: number, f0: number, d: number, from: Pose, to: Pose, drift = 1, seed = 0): Pose => {
  const x = (t - f0) / d;
  const k = settle(x);
  const hold = Math.max(0, t - f0 - d);
  const bob = drift * Math.min(1, hold / 40); // drift fades in gently after landing
  const p = mix3(from.p, to.p, k);
  p[1] += bob * 0.0025 * Math.sin(hold / 23 + seed);
  p[0] += bob * 0.0015 * Math.sin(hold / 31 + seed * 2);
  const r = mix3(from.r ?? [0, 0, 0], to.r ?? [0, 0, 0], k);
  r[1] += bob * 0.004 * hold * 0.35;
  r[2] += bob * 0.03 * Math.sin(hold / 40 + seed);
  const s = (from.s ?? 1) + ((to.s ?? 1) - (from.s ?? 1)) * k;
  return {p, r, s: x < 0 ? (from.s ?? 1) : s};
};
