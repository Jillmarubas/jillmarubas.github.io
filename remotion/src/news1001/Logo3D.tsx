import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {settle} from './kit';

/*
 * A company's official vector mark, extruded into a solid 3D object in its exact brand colours
 * (fills read straight from the SVG; gradient fills become vertex colours along the gradient).
 * It lies on the paper desk, lit by a warm key and a cool rim, with a soft contact shadow.
 */

type Grad = {x1: number; y1: number; x2: number; y2: number; stops: {o: number; c: THREE.Color}[]; units: string; radial?: {cx: number; cy: number; r: number; inv: number[] | null}};
type Part = {geo: THREE.ExtrudeGeometry; color: THREE.Color; vertex: boolean};

const cache = new Map<string, string>();
const useSvgText = (name: string) => {
  const [txt, setTxt] = useState<string | null>(cache.get(name) ?? null);
  const [handle] = useState(() => (cache.has(name) ? null : delayRender(`logo ${name}`)));
  useEffect(() => {
    if (txt) return;
    fetch(staticFile(`news1001/logos/${name}.svg`))
      .then((r) => r.text())
      .then((t) => {
        cache.set(name, t);
        setTxt(t);
        if (handle !== null) continueRender(handle);
      });
  }, [name, txt, handle]);
  return txt;
};

const gradients = (txt: string) => {
  const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
  const out = new Map<string, Grad>();
  const stopsOf = (g: Element) =>
    Array.from(g.querySelectorAll('stop')).map((s) => {
      const st = s.getAttribute('style') || '';
      const c = s.getAttribute('stop-color') || /stop-color:\s*([^;]+)/.exec(st)?.[1] || '#000';
      const o = parseFloat(s.getAttribute('offset') || '0');
      return {o: String(s.getAttribute('offset')).includes('%') ? o / 100 : o, c: new THREE.Color(c.trim())};
    });
  const num = (g: Element, a: string, d: number) => {
    const v = g.getAttribute(a);
    return v === null ? d : v.includes('%') ? parseFloat(v) / 100 : parseFloat(v);
  };
  doc.querySelectorAll('linearGradient').forEach((g) => {
    out.set(g.id, {x1: num(g, 'x1', 0), y1: num(g, 'y1', 0), x2: num(g, 'x2', 1), y2: num(g, 'y2', 0), stops: stopsOf(g), units: g.getAttribute('gradientUnits') || 'objectBoundingBox'});
  });
  doc.querySelectorAll('radialGradient').forEach((g) => {
    const m = /matrix\(([^)]+)\)/.exec(g.getAttribute('gradientTransform') || '');
    let inv: number[] | null = null;
    if (m) {
      const [a, b, c, d, e, f] = m[1].split(/[\s,]+/).map(Number);
      const det = a * d - b * c;
      inv = [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
    }
    out.set(g.id, {x1: 0, y1: 0, x2: 0, y2: 0, stops: stopsOf(g), units: g.getAttribute('gradientUnits') || 'objectBoundingBox', radial: {cx: num(g, 'cx', 0.5), cy: num(g, 'cy', 0.5), r: num(g, 'r', 0.5), inv}});
  });
  return out;
};

const sample = (g: Grad, t: number) => {
  const s = g.stops;
  if (t <= s[0].o) return s[0].c.clone();
  for (let i = 1; i < s.length; i++) {
    if (t <= s[i].o) {
      const k = (t - s[i - 1].o) / Math.max(1e-6, s[i].o - s[i - 1].o);
      return s[i - 1].c.clone().lerp(s[i].c, k);
    }
  }
  return s[s.length - 1].c.clone();
};

const build = (txt: string, depth: number, override?: Record<number, string>, bevel = true): {parts: Part[]; size: THREE.Vector3} => {
  const data = new SVGLoader().parse(txt);
  const grads = gradients(txt);
  const parts: Part[] = [];
  data.paths.forEach((p, i) => {
    const st = (p.userData?.style ?? {}) as {fill?: string; fillOpacity?: number; stroke?: string};
    const fill = override?.[i] ?? st.fill;
    if (!fill || fill === 'none' || st.fillOpacity === 0) return;
    const shapes = SVGLoader.createShapes(p);
    if (!shapes.length) return;
    const geo = new THREE.ExtrudeGeometry(shapes, {depth, bevelEnabled: bevel, bevelThickness: depth * 0.18, bevelSize: depth * 0.1, bevelSegments: 3, curveSegments: 18});
    const m = /url\(#([^)]+)\)/.exec(fill);
    if (m && grads.has(m[1])) {
      const g = grads.get(m[1])!;
      geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      const pos = geo.attributes.position;
      const cols = new Float32Array(pos.count * 3);
      const [x1, y1, x2, y2] = g.units === 'userSpaceOnUse' ? [g.x1, g.y1, g.x2, g.y2] : [bb.min.x + g.x1 * (bb.max.x - bb.min.x), bb.min.y + g.y1 * (bb.max.y - bb.min.y), bb.min.x + g.x2 * (bb.max.x - bb.min.x), bb.min.y + g.y2 * (bb.max.y - bb.min.y)];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const L = dx * dx + dy * dy || 1;
      for (let v = 0; v < pos.count; v++) {
        let t: number;
        if (g.radial) {
          let x = pos.getX(v);
          let y = pos.getY(v);
          if (g.radial.inv) {
            const q = g.radial.inv;
            [x, y] = [q[0] * x + q[2] * y + q[4], q[1] * x + q[3] * y + q[5]];
          } else if (g.units !== 'userSpaceOnUse') {
            x = (x - bb.min.x) / Math.max(1e-6, bb.max.x - bb.min.x);
            y = (y - bb.min.y) / Math.max(1e-6, bb.max.y - bb.min.y);
          }
          t = Math.min(1, Math.hypot(x - g.radial.cx, y - g.radial.cy) / g.radial.r);
        } else {
          t = Math.min(1, Math.max(0, ((pos.getX(v) - x1) * dx + (pos.getY(v) - y1) * dy) / L));
        }
        const c = sample(g, t).convertSRGBToLinear();
        cols[v * 3] = c.r;
        cols[v * 3 + 1] = c.g;
        cols[v * 3 + 2] = c.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      parts.push({geo, color: new THREE.Color('#ffffff'), vertex: true});
    } else {
      parts.push({geo, color: new THREE.Color(fill.startsWith('url') ? '#888' : fill), vertex: false});
    }
  });
  // centre and flip (SVG y points down)
  const box = new THREE.Box3();
  parts.forEach((p) => {
    p.geo.computeBoundingBox();
    box.union(p.geo.boundingBox!);
  });
  const c = box.getCenter(new THREE.Vector3());
  parts.forEach((p) => {
    p.geo.translate(-c.x, -c.y, 0);
    p.geo.scale(1, -1, 1);
  });
  return {parts, size: box.getSize(new THREE.Vector3())};
};

/*
 * One shared WebGL renderer for every logo in the film. Each <Logo3D> keeps its own scene and
 * draws the shared renderer's output into its own 2D canvas on every frame, so the film never
 * holds more than one WebGL context for logos (Chrome drops contexts past ~16, which blanked
 * logos in long sequential renders). If the context is ever lost, it's recreated.
 */
let shared: {r: THREE.WebGLRenderer; env: THREE.Texture} | null = null;
const getRenderer = () => {
  if (shared && !shared.r.getContext().isContextLost()) return shared;
  const canvas = document.createElement('canvas');
  const r = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, preserveDrawingBuffer: true});
  r.setPixelRatio(1);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.NoToneMapping;
  r.outputColorSpace = THREE.SRGBColorSpace;
  const pm = new THREE.PMREMGenerator(r);
  const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  pm.dispose();
  shared = {r, env};
  return shared;
};

const NO_BEVEL = new Set(['google']);

type Rig = {scene: THREE.Scene; camera: THREE.PerspectiveCamera; group: THREE.Group; dispose: () => void};
const makeRig = (name: string, txt: string, w: number, h: number, fit: number, depthRatio: number, gloss: number, override?: Record<number, string>): Rig => {
  const scene = new THREE.Scene();
  const viewH = 6;
  const camera = new THREE.PerspectiveCamera(2 * THREE.MathUtils.radToDeg(Math.atan(viewH / 2 / 10)), w / h, 0.1, 100);
  camera.position.set(0, -1.2, 10);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight('#ffffff', 1.85));
  const key = new THREE.DirectionalLight('#fff6ea', 1.75);
  key.position.set(-4, 6, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 8;
  key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, {left: -6, right: 6, top: 6, bottom: -6});
  scene.add(key);
  const rim = new THREE.DirectionalLight('#cfe0ff', 0.8);
  rim.position.set(5, -3, 4);
  scene.add(rim);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({opacity: 0.28}));
  plane.position.z = -0.02;
  plane.receiveShadow = true;
  scene.add(plane);
  // the mark
  const probe = new SVGLoader().parse(txt);
  const bb = new THREE.Box3();
  probe.paths.forEach((p) => SVGLoader.createShapes(p).forEach((sh) => sh.getPoints(8).forEach((pt) => bb.expandByPoint(new THREE.Vector3(pt.x, pt.y, 0)))));
  const sz = bb.getSize(new THREE.Vector3());
  const big = Math.max(sz.x, sz.y) || 1;
  const b = build(txt, big * depthRatio, override, !NO_BEVEL.has(name));
  const group = new THREE.Group();
  // fill `fit` of the box along whichever axis binds first (wide wordmarks use the width)
  const scale = Math.min(((viewH * w) / h) * fit / (sz.x || 1), (viewH * fit) / (sz.y || 1));
  const inner = new THREE.Group();
  inner.scale.setScalar(scale);
  const mats: THREE.Material[] = [];
  b.parts.forEach((p, i) => {
    const cap = new THREE.MeshBasicMaterial({color: p.color, vertexColors: p.vertex, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -i * 2, polygonOffsetUnits: -i * 2});
    const side = new THREE.MeshPhysicalMaterial({color: p.color, vertexColors: p.vertex, roughness: 0.38, metalness: 0, clearcoat: gloss, clearcoatRoughness: 0.2, envMapIntensity: 0.35});
    mats.push(cap, side);
    const m = new THREE.Mesh(p.geo, [cap, side]);
    m.castShadow = true;
    m.receiveShadow = true;
    inner.add(m);
  });
  group.add(inner);
  scene.add(group);
  return {
    scene,
    camera,
    group,
    dispose: () => {
      b.parts.forEach((p) => p.geo.dispose());
      mats.forEach((m) => m.dispose());
      plane.geometry.dispose();
      (plane.material as THREE.Material).dispose();
      key.shadow.map?.dispose();
    },
  };
};

/**
 * Render a 3D logo in a box of w×h px. `fit` is how much of the box the mark fills (0..1).
 */
export const Logo3D: React.FC<{name: string; w: number; h: number; at?: number; fit?: number; depth?: number; tilt?: number; spin?: number; override?: Record<number, string>; gloss?: number}> = ({
  name,
  w,
  h,
  at = 0,
  fit = 0.78,
  depth = 0.12,
  tilt = -16,
  spin = 70,
  override,
  gloss = 0.6,
}) => {
  const txt = useSvgText(name);
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const rig = useMemo(() => (txt ? makeRig(name, txt, w, h, fit, depth, gloss, override) : null), [name, txt, w, h, fit, depth, gloss, override]);
  useEffect(() => () => rig?.dispose(), [rig]);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!rig || !c) return;
    const k = settle((f - at) / 20);
    rig.group.position.set(0, 0, 0.35 + (1 - k) * 2.2);
    rig.group.rotation.set(THREE.MathUtils.degToRad(tilt + 4 * Math.sin(f / 40)), THREE.MathUtils.degToRad((1 - k) * spin + 9 * Math.sin(f / 52 + 1)), 0);
    rig.group.scale.setScalar(0.6 + 0.4 * k);
    const {r, env} = getRenderer();
    rig.scene.environment = env;
    r.setSize(w, h, false);
    r.setClearColor(0x000000, 0);
    r.clear();
    r.render(rig.scene, rig.camera);
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, w, h);
    g.drawImage(r.domElement, 0, 0, w, h);
  });
  if (f < at - 1) return null;
  return <canvas ref={ref} width={w} height={h} style={{width: w, height: h, display: 'block'}} />;
};
