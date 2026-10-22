// HyperFrames host for the compressor cutaway. Bundled with esbuild into assets/cutaway.js
// (see build.sh). It runs the very same scene code as the Remotion version (../compressor.ts),
// and moves the HTML labels from the same camera maths, on every hf-seek.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {FOV, H, P_DIS, P_SUC, T, W, anchors, buildCompressor, camAt, crankPhi, outQ, prog} from '../compressor';

type P = {x: number; y: number};
type Align = 'left' | 'right' | 'center';

const win = (s: number, t0: number, t1: number, fadeIn = 0.55, fadeOut = 0.3) => Math.min(prog(s, t0, fadeIn), 1 - prog(s, t1 - fadeOut, fadeOut));

export function createHost(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, preserveDrawingBuffer: true});
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;

  // Same lights as the Remotion version.
  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(-3.5, 6, 4.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {left: -3, right: 3, top: 4, bottom: -2});
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.55);
  fill.position.set(4, 2.5, 3);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight('#ffffff', '#c9ccd1', 0.35));

  const model = buildCompressor();
  scene.add(model.root);
  const cam = new THREE.PerspectiveCamera(FOV, W / H, 0.05, 100);

  const placeCam = (s: number) => {
    const c = camAt(s);
    cam.position.copy(c.pos);
    cam.lookAt(c.target);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
  };
  const project = (v: THREE.Vector3): P => {
    const p = v.clone().project(cam);
    return {x: (p.x * 0.5 + 0.5) * W, y: (-p.y * 0.5 + 0.5) * H};
  };

  // One label = a dot on the part, a leader line, and a white card with the words.
  const label = (id: string, at: P, to: P, k: number, align: Align) => {
    const root = document.getElementById(id);
    if (!root) return;
    const line = root.querySelector('line')!;
    const dot = root.querySelector('circle')!;
    const card = root.querySelector('.card') as HTMLElement;
    root.style.opacity = k > 0 ? '1' : '0';
    if (k <= 0) return;
    const l = outQ(Math.min(1, k * 1.8));
    const tx = outQ(Math.max(0, Math.min(1, k * 1.8 - 0.55)));
    line.setAttribute('x1', String(at.x));
    line.setAttribute('y1', String(at.y));
    line.setAttribute('x2', String(at.x + (to.x - at.x) * l));
    line.setAttribute('y2', String(at.y + (to.y - at.y) * l));
    line.setAttribute('opacity', String(Math.min(1, k * 3)));
    dot.setAttribute('cx', String(at.x));
    dot.setAttribute('cy', String(at.y));
    dot.setAttribute('r', String(7 * outQ(Math.min(1, k * 3))));
    const shift = (1 - tx) * (align === 'right' ? -24 : align === 'left' ? 24 : 0);
    const hasSub = !!card.querySelector('.sub');
    const top = to.y - (align === 'center' ? (hasSub ? 104 : 70) : 36);
    card.style.opacity = String(tx);
    card.style.top = `${top}px`;
    if (align === 'right') {
      card.style.left = `${to.x + 14 + shift}px`;
      card.style.right = '';
      card.style.transform = '';
    } else if (align === 'left') {
      card.style.left = '';
      card.style.right = `${W - to.x + 14 - shift}px`;
      card.style.transform = '';
    } else {
      card.style.left = `${to.x}px`;
      card.style.right = '';
      card.style.transform = 'translateX(-50%)';
    }
  };

  const updateLabels = (s: number) => {
    const a = anchors(s);
    const P = Object.fromEntries(Object.entries(a).map(([k, v]) => [k, project(v)])) as Record<keyof typeof a, P>;
    const L = T.labels;
    const colR = 1330;
    const colL = 590;
    label('lab-shell', P.shell, {x: P.shell.x + 150, y: P.shell.y - 110}, win(s, T.sliceB - 0.2, T.explode + 0.3), 'right');
    label('lab-crank', P.crank, {x: colR, y: P.crank.y - 40}, win(s, L[1], T.labelsOut), 'right');
    label('lab-motor', P.motor, {x: colR, y: P.motor.y + 10}, win(s, L[0], T.labelsOut), 'right');
    label('lab-springs', P.springs, {x: colR, y: P.springs.y - 50}, win(s, L[4], T.labelsOut), 'right');
    label('lab-piston', P.piston, {x: colL, y: P.piston.y - 40}, win(s, L[2], T.labelsOut), 'left');
    label('lab-valves', P.valves, {x: colL, y: P.valves.y + 70}, win(s, L[3], T.labelsOut), 'left');

    // Phase labels follow the crank angle, first slow turn only.
    const phi = crankPhi(s);
    const firstCycle = phi < Math.PI * 2 + P_SUC[0];
    const pk = (a0: number, a1: number) =>
      Math.max(0, s < T.cut || !firstCycle ? 0 : Math.min(Math.min(1, (phi - a0) / 0.35), 1 - Math.min(1, Math.max(0, (phi - a1 + 0.15) / 0.3))));
    const cylTop = {x: P.cylinder.x, y: P.cylinder.y - 230};
    const disK = pk(P_DIS[0] + 0.05, 99) * (s > T.fast + 0.2 ? Math.max(0, 1 - prog(s, T.fast + 0.2, 0.3)) : 1);
    label('lab-suction', P.cylinder, cylTop, pk(P_SUC[0], P_SUC[1] + 0.1), 'center');
    label('lab-compression', P.cylinder, cylTop, pk(P_SUC[1] + 0.1, P_DIS[0] + 0.05), 'center');
    label('lab-discharge', P.cylinder, cylTop, disK, 'center');
    label('lab-speed', P.piston, {x: P.piston.x, y: P.piston.y - 230}, win(s, T.fastFull - 0.6, T.pullBack + 0.1), 'center');
    label('lab-outlet', P.outlet, {x: P.outlet.x - 120, y: P.outlet.y - 150}, win(s, T.outLabel, T.end - 0.4), 'left');
  };

  const renderAt = (s: number) => {
    model.update(s);
    placeCam(s);
    renderer.render(scene, cam);
    updateLabels(s);
  };
  return {renderAt};
}
