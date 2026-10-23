// Cutaway demo: a fridge's hermetic reciprocating compressor, modelled in code.
// Everything is a pure function of time (seconds), so the 3D scene and the HTML labels agree
// on every frame. Model units are millimetres; the root group scales them to metres / 10.
import * as THREE from 'three';

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DURATION_S = 27;
export const MM = 0.01;

// Timeline (seconds).
export const T = {
  titleIn: 0.3,
  titleOut: 3.0,
  sliceA: 3.6,
  sliceB: 5.4,
  explode: 6.4,
  labels: [7.6, 8.4, 9.2, 10.0, 10.8],
  labelsOut: 12.4,
  reassemble: 12.7,
  cut: 13.8,
  motorOn: 14.3,
  fast: 19.2,
  fastFull: 21.2,
  pullBack: 22.9,
  outLabel: 23.9,
  end: 27,
};

// ---------- small maths ----------
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (s: number, a: number, d: number) => clamp01((s - a) / d);
export const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const outQ = (t: number) => 1 - Math.pow(1 - t, 4);
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

// ---------- mechanism ----------
const R_CRANK = 8; // crank throw (stroke 16 mm)
const L_ROD = 40; // con-rod length, centre to centre
const Y_AX = 133; // cylinder axis height
const X_VP = -62; // valve-plate face on the cylinder side
const BORE = 12;

// Crank angle phi (rad): 0 = top dead centre (piston closest to the valve plate).
// Speed: still, then one slow turn (0.22 rev/s), then speeding up to 1.6 rev/s.
const omega = (s: number) => {
  if (s < T.motorOn) return 0;
  if (s < T.motorOn + 0.5) return 0.22 * (s - T.motorOn) / 0.5;
  if (s < T.fast) return 0.22;
  if (s < T.fastFull) return lerp(0.22, 1.6, smooth((s - T.fast) / (T.fastFull - T.fast)));
  return 1.6;
};
const PHI_CACHE: number[] = [];
const DT = 1 / 600;
export const phiAt = (s: number) => {
  if (!PHI_CACHE.length) {
    let a = 0;
    for (let i = 0; i <= DURATION_S / DT + 2; i++) {
      PHI_CACHE.push(a);
      a += TAU * omega(i * DT) * DT;
    }
  }
  const i = Math.max(0, Math.min(PHI_CACHE.length - 2, Math.floor(s / DT)));
  const f = s / DT - i;
  return lerp(PHI_CACHE[i], PHI_CACHE[i + 1], clamp01(f));
};
export const speedUp = (s: number) => smooth(prog(s, T.fast, T.fastFull - T.fast));

// Piston-pin x for crank angle phi.
const pinX = (phi: number) => {
  const th = phi + Math.PI;
  return R_CRANK * Math.cos(th) - Math.sqrt(L_ROD * L_ROD - Math.pow(R_CRANK * Math.sin(th), 2));
};
const crownX = (phi: number) => pinX(phi) - 12;
const gapAt = (phi: number) => crownX(phi) - X_VP;

// Valve windows on the cycle (p = phi mod 2pi).
export const P_SUC = [0.6, Math.PI];
export const P_DIS = [5.0, TAU];
const bump = (p: number, a: number, b: number) => (p <= a || p >= b ? 0 : Math.pow(Math.sin((Math.PI * (p - a)) / (b - a)), 0.5));
export type Phase = 'expand' | 'suction' | 'compression' | 'discharge';
export const phaseOf = (phi: number): Phase => {
  const p = ((phi % TAU) + TAU) % TAU;
  if (p < P_SUC[0]) return 'expand';
  if (p < P_SUC[1]) return 'suction';
  if (p < P_DIS[0]) return 'compression';
  return 'discharge';
};

export const gasState = (phi: number) => {
  const p = ((phi % TAU) + TAU) % TAU;
  const m0 = 0.14;
  const gMax = gapAt(Math.PI);
  const g5 = gapAt(P_DIS[0]);
  const g = gapAt(p);
  let mass = 1;
  let temp = 0.05;
  if (p < P_SUC[0]) {
    mass = m0;
    temp = lerp(1, 0.55, p / P_SUC[0]);
  } else if (p < P_SUC[1]) {
    const k = smooth((p - P_SUC[0]) / (P_SUC[1] - P_SUC[0]));
    mass = lerp(m0, 1, k);
    temp = lerp(0.55, 0.04, Math.min(1, k * 1.6));
  } else if (p < P_DIS[0]) {
    mass = 1;
    temp = clamp01((gMax / g - 1) / (gMax / g5 - 1)) * 0.92 + 0.04;
  } else {
    mass = lerp(1, m0, (p - P_DIS[0]) / (TAU - P_DIS[0]));
    temp = 1;
  }
  return {gap: g, mass, temp, suc: bump(p, P_SUC[0], P_SUC[1]), dis: bump(p, P_DIS[0], P_DIS[1])};
};

// ---------- shell profile ----------
// Radius (x semi-axis, mm) of the shell at height y; plan is an ellipse with z = 0.8 x.
const SHELL_ZK = 0.8;
const PROFILE: [number, number][] = (() => {
  const pts: [number, number][] = [[0.01, 10], [12, 10], [25, 10], [40, 10], [55, 10], [70, 10], [85, 10.2], [100, 10.5]];
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push([100 + 15 * Math.sin(a), 10 + 20 * (1 - Math.cos(a))]);
  }
  pts.push([115, 100], [118, 101], [118, 104], [115, 105]);
  for (let i = 1; i <= 24; i++) {
    const t = i / 24;
    const y = 105 + 100 * t;
    const r = 115 * Math.pow(1 - Math.pow(t, 2.4), 1 / 2.4);
    pts.push([Math.max(0.01, r), y]);
  }
  return pts;
})();

// Where the slice plane z = d cuts the shell (an arch), as points.
const rimPoints = (d: number) => {
  const left: THREE.Vector3[] = [];
  const right: THREE.Vector3[] = [];
  for (const [r, y] of PROFILE) {
    const rz = r * SHELL_ZK;
    if (rz <= Math.abs(d) + 0.01) continue;
    const x = r * Math.sqrt(1 - Math.pow(d / rz, 2));
    left.push(new THREE.Vector3(-x, y, d));
    right.push(new THREE.Vector3(x, y, d));
  }
  return [...left, ...right.reverse()];
};
const rimX = (y: number, d: number) => {
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [r0, y0] = PROFILE[i];
    const [r1, y1] = PROFILE[i + 1];
    if (y >= y0 && y <= y1 && y1 > y0) {
      const r = lerp(r0, r1, (y - y0) / (y1 - y0));
      const rz = r * SHELL_ZK;
      return r * Math.sqrt(Math.max(0, 1 - Math.pow(d / rz, 2)));
    }
  }
  return 0;
};

// ---------- pose: everything that moves ----------
export const sliceAt = (s: number) => lerp(96, 0, inOut(prog(s, T.sliceA, T.sliceB - T.sliceA)));

// Exploded-view offsets (mm). Each part leaves with its own delay and returns in reverse order.
const EXPLODE: Record<string, {v: [number, number, number]; delay: number}> = {
  stator: {v: [0, 16, 0], delay: 0},
  rotor: {v: [0, 48, 0], delay: 0.07},
  pump: {v: [0, 112, 0], delay: 0.14},
  plate: {v: [-30, 112, 0], delay: 0.22},
  head: {v: [-56, 112, 0], delay: 0.28},
  muffler: {v: [-105, 100, -20], delay: 0.32},
};
export const explodeK = (s: number, key: string) => {
  const e = EXPLODE[key];
  const out = inOut(prog(s, T.explode + e.delay, 1.0));
  const back = inOut(prog(s, T.reassemble + (0.32 - e.delay) * 0.8, 0.75));
  return out * (1 - back);
};
export const offset = (s: number, key: string) => {
  const k = explodeK(s, key);
  const v = EXPLODE[key].v;
  return new THREE.Vector3(v[0] * k, v[1] * k, v[2] * k);
};
const restPhi = 0.35;
export const crankPhi = (s: number) => restPhi + phiAt(s);

// Label anchors in world units.
export const anchors = (s: number) => {
  const d = sliceAt(s);
  const phi = crankPhi(s);
  const w = (v: THREE.Vector3) => v.multiplyScalar(MM);
  const pump = offset(s, 'pump');
  return {
    shell: w(new THREE.Vector3(rimX(165, d), 165, d)),
    motor: w(new THREE.Vector3(56, 74, 0).add(offset(s, 'stator'))),
    crank: w(new THREE.Vector3(R_CRANK * Math.cos(phi + Math.PI), 133, 0).add(offset(s, 'rotor'))),
    piston: w(new THREE.Vector3(pinX(phi) - 1, Y_AX + 11, 0).add(pump)),
    valves: w(new THREE.Vector3(-63.5, 157, 0).add(offset(s, 'plate'))),
    springs: w(new THREE.Vector3(46, 30, 38)),
    cylinder: w(new THREE.Vector3(-56, Y_AX + 10, 0).add(pump)),
    outlet: w(new THREE.Vector3(-128, 70, -76)),
  };
};

// ---------- camera ----------
type CamKey = {t: number; tx: number; ty: number; az: number; el: number; r: number; cut?: boolean};
const CAM: CamKey[] = [
  {t: 0, tx: -1.3, ty: 0.98, az: 34, el: 13, r: 6.6},
  {t: 3.3, tx: -0.55, ty: 0.98, az: 22, el: 11, r: 6.1},
  {t: 6.3, tx: 0, ty: 1.02, az: 12, el: 9, r: 5.7},
  {t: 7.7, tx: -0.05, ty: 1.45, az: 5, el: 9, r: 6.5},
  {t: 12.6, tx: -0.05, ty: 1.45, az: -7, el: 9, r: 6.4},
  {t: 13.79, tx: 0, ty: 1.02, az: -10, el: 9, r: 6.0},
  {t: 13.8, tx: -0.5, ty: 1.36, az: 8, el: 7, r: 2.45, cut: true},
  {t: 22.9, tx: -0.48, ty: 1.37, az: -3, el: 8, r: 2.3},
  {t: 25.0, tx: -0.12, ty: 0.98, az: 16, el: 11, r: 5.9},
  {t: 27.1, tx: -0.08, ty: 0.98, az: 21, el: 11, r: 5.7},
];
export const FOV = 30;
export const camAt = (s: number) => {
  let i = 0;
  while (i < CAM.length - 2 && s >= CAM[i + 1].t) i++;
  const a = CAM[i];
  const b = CAM[i + 1];
  const k = b.cut ? (s >= b.t ? 1 : 0) : inOut(prog(s, a.t, b.t - a.t));
  const m = (f: keyof CamKey) => lerp(a[f] as number, b[f] as number, k);
  const az = (m('az') * Math.PI) / 180;
  const el = (m('el') * Math.PI) / 180;
  const r = m('r');
  const target = new THREE.Vector3(m('tx'), m('ty'), 0);
  const pos = new THREE.Vector3(target.x + r * Math.cos(el) * Math.sin(az), target.y + r * Math.sin(el), r * Math.cos(el) * Math.cos(az));
  return {pos, target};
};

// ---------- materials ----------
const std = (color: string, metalness: number, roughness: number, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  new THREE.MeshPhysicalMaterial({color, metalness, roughness, ...extra});

const stripeTexture = (dark: string, light: string, n: number, skew: number) => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = light;
  g.fillRect(0, 0, 512, 64);
  g.fillStyle = dark;
  for (let i = 0; i < n; i++) {
    const x = (i / n) * 512;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + 5, 0);
    g.lineTo(x + 5 + skew, 64);
    g.lineTo(x + skew, 64);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const blobTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,0.55)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.22)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
};

// ---------- scene ----------
export const COLD = new THREE.Color('#1f6fff');
export const HOT = new THREE.Color('#ff3b12');
export const ACCENT = '#ff6a1a';

export function buildCompressor() {
  const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), 200);
  const planes = [clip];
  const root = new THREE.Group();
  root.scale.setScalar(MM);

  const M = {
    paint: std('#17181b', 0.25, 0.4, {clearcoat: 0.7, clearcoatRoughness: 0.35, clippingPlanes: planes}),
    shellIn: new THREE.MeshStandardMaterial({color: '#7b8087', metalness: 0.55, roughness: 0.55, side: THREE.BackSide, clippingPlanes: planes}),
    steel: std('#c3c7cc', 1, 0.28),
    steelC: std('#b6bac0', 1, 0.32, {clippingPlanes: planes}),
    iron: std('#5f6369', 0.7, 0.55, {clippingPlanes: planes}),
    copper: std('#c26f43', 1, 0.33),
    copperC: std('#c26f43', 1, 0.36, {clippingPlanes: planes}),
    lam: std('#7d838b', 0.85, 0.42, {clippingPlanes: planes}),
    alu: std('#d3d7dc', 1, 0.35),
    rubber: std('#141416', 0, 0.85),
    base: std('#2f3236', 0.5, 0.5),
    plastic: std('#2a2d32', 0, 0.62, {transparent: true}),
    reed: std('#4a5a72', 1, 0.3),
    oil: new THREE.MeshPhysicalMaterial({color: '#d29a36', metalness: 0, roughness: 0.15, transparent: true, opacity: 0.55, clippingPlanes: planes}),
    rim: new THREE.MeshStandardMaterial({color: '#a9adb3', metalness: 0.8, roughness: 0.35, emissive: new THREE.Color(ACCENT), emissiveIntensity: 0}),
  };
  const cap = (color: string) => new THREE.MeshBasicMaterial({color, side: THREE.BackSide, clippingPlanes: planes});
  const CAP = {steel: cap('#d9dbde'), iron: cap('#bdb8b0'), copper: cap('#e0a072'), lam: cap('#c9cdd2')};

  const all: THREE.Mesh[] = [];
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D) => {
    const x = new THREE.Mesh(g, m);
    x.castShadow = true;
    x.receiveShadow = true;
    parent.add(x);
    all.push(x);
    return x;
  };
  // A clipped solid: shaded outside + flat "cut face" colour seen through the section.
  const solid = (g: THREE.BufferGeometry, m: THREE.Material, c: THREE.Material, parent: THREE.Object3D) => {
    const a = mesh(g, m, parent);
    const b = new THREE.Mesh(g, c);
    parent.add(b);
    return a;
  };
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    return g;
  };
  const cylY = (r: number, y0: number, y1: number, seg = 48) => {
    const g = new THREE.CylinderGeometry(r, r, y1 - y0, seg);
    g.translate(0, (y0 + y1) / 2, 0);
    return g;
  };

  // --- shell, base, outside parts ---
  const shellGeo = new THREE.LatheGeometry(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 128);
  shellGeo.scale(1, 1, SHELL_ZK);
  shellGeo.computeVertexNormals();
  mesh(shellGeo, M.paint, root);
  const shellIn = new THREE.Mesh(shellGeo, M.shellIn);
  root.add(shellIn);

  const rim = new THREE.Mesh(new THREE.BufferGeometry(), M.rim);
  root.add(rim);

  const basePlate = new THREE.Shape();
  basePlate.moveTo(-140, -62);
  basePlate.lineTo(140, -62);
  basePlate.lineTo(140, 62);
  basePlate.lineTo(-140, 62);
  basePlate.closePath();
  const bg = new THREE.ExtrudeGeometry(basePlate, {depth: 4, bevelEnabled: true, bevelSize: 2, bevelThickness: 1, bevelSegments: 2});
  bg.rotateX(-Math.PI / 2);
  bg.translate(0, 5, 0);
  mesh(bg, M.base, root).receiveShadow = false; // seen through the cut floor; shadow speckle there flickered
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    mesh(cylY(11, 0, 7, 32).translate(sx * 122, 0, sz * 46), M.rubber, root);
    mesh(cylY(11, 10, 15, 32).translate(sx * 122, 0, sz * 46), M.rubber, root);
  }
  // Tube stubs (suction, process, discharge) and the terminal / relay cover.
  const stub = (from: THREE.Vector3, dir: THREE.Vector3, len: number, r: number) => {
    const to = from.clone().addScaledVector(dir, len);
    const g = new THREE.TubeGeometry(new THREE.LineCurve3(from, to), 1, r, 20, false);
    return mesh(g, M.copper, root);
  };
  stub(new THREE.Vector3(-110, 72, -8), new THREE.Vector3(-1, 0, -0.1).normalize(), 40, 4.8);
  stub(new THREE.Vector3(-103, 76, -34), new THREE.Vector3(-1, 0, -0.35).normalize(), 32, 3.2);
  stub(new THREE.Vector3(-90, 70, -56), new THREE.Vector3(-0.6, 0, -0.32).normalize(), 40, 3.2);
  mesh(box(110, 140, 38, 86, -24, 24), std('#1d1f23', 0, 0.55), root);
  mesh(box(138, 146, 50, 74, -8, 8), std('#1d1f23', 0, 0.55), root);

  // Oil in the sump.
  const oil = new THREE.Mesh(new THREE.CircleGeometry(98, 64).rotateX(-Math.PI / 2).scale(1, 1, SHELL_ZK).translate(0, 19, 0), M.oil);
  root.add(oil);

  // --- springs ---
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      pts.push(new THREE.Vector3(sx * 46 + 7 * Math.cos(t * TAU * 5.5), 14 + 32 * t, sz * 38 + 7 * Math.sin(t * TAU * 5.5)));
    }
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 2.0, 10, false), M.steel, root);
  }

  // --- stator: laminated stack + copper end turns ---
  const stator = new THREE.Group();
  root.add(stator);
  const sq = new THREE.Shape();
  const hw = 58;
  const hd = 50;
  const cr = 14;
  sq.moveTo(-hw + cr, -hd);
  sq.lineTo(hw - cr, -hd);
  sq.quadraticCurveTo(hw, -hd, hw, -hd + cr);
  sq.lineTo(hw, hd - cr);
  sq.quadraticCurveTo(hw, hd, hw - cr, hd);
  sq.lineTo(-hw + cr, hd);
  sq.quadraticCurveTo(-hw, hd, -hw, hd - cr);
  sq.lineTo(-hw, -hd + cr);
  sq.quadraticCurveTo(-hw, -hd, -hw + cr, -hd);
  const hole = new THREE.Path();
  hole.absarc(0, 0, 27, 0, TAU, true);
  sq.holes.push(hole);
  const slice = new THREE.ExtrudeGeometry(sq, {depth: 3.4, bevelEnabled: false, curveSegments: 24});
  slice.rotateX(-Math.PI / 2);
  for (let i = 0; i < 10; i++) solid(slice.clone().translate(0, 48 + i * 4, 0), M.lam, CAP.lam, stator);
  for (const y of [42, 94]) {
    const g = new THREE.TorusGeometry(35, 8.5, 20, 64);
    g.rotateX(Math.PI / 2);
    g.scale(1, 0.85, 1);
    g.translate(0, y, 0);
    solid(g, M.copperC, CAP.copper, stator);
  }

  // --- rotor + crankshaft (spins) ---
  const rotorOff = new THREE.Group();
  root.add(rotorOff);
  const crank = new THREE.Group();
  rotorOff.add(crank);
  const rotorMat = std('#ffffff', 0.85, 0.42, {map: stripeTexture('#5d636b', '#9aa0a8', 28, 14)});
  mesh(new THREE.CylinderGeometry(25.5, 25.5, 32, 64, 1, true).translate(0, 68, 0), rotorMat, crank);
  // Plain sleeve that fades in as the rotor speeds up: stands in for motion blur so the
  // stripes don't strobe (wagon-wheel effect) at full speed.
  const rotorBlurMat = new THREE.MeshPhysicalMaterial({color: '#80868e', metalness: 0.85, roughness: 0.45, transparent: true, opacity: 0});
  const rotorBlur = mesh(new THREE.CylinderGeometry(25.7, 25.7, 32, 64, 1, true).translate(0, 68, 0), rotorBlurMat, crank);
  rotorBlur.castShadow = false;
  mesh(cylY(25.5, 48, 52, 64), M.alu, crank);
  mesh(cylY(25.5, 84, 88, 64), M.alu, crank);
  mesh(cylY(9, 24, 122), M.steel, crank);
  const web = new THREE.Shape();
  web.absarc(0, 0, 19, Math.PI * 0.5, Math.PI * 1.5, false);
  web.absarc(8, 0, 8.5, -Math.PI * 0.5, Math.PI * 0.5, false);
  const wg = new THREE.ExtrudeGeometry(web, {depth: 6, bevelEnabled: true, bevelSize: 0.8, bevelThickness: 0.8, bevelSegments: 2, curveSegments: 24});
  wg.rotateX(-Math.PI / 2);
  wg.translate(0, 120, 0);
  mesh(wg, M.steel, crank);
  mesh(cylY(6, 126, 139).translate(R_CRANK, 0, 0), M.steel, crank);
  const pick = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 26, 0), new THREE.Vector3(5, 14, 3)), 1, 2.4, 12, false);
  mesh(pick, M.steel, crank);

  // --- pump: frame, cylinder, piston, rod ---
  const pump = new THREE.Group();
  root.add(pump);
  solid(box(-46, 50, 104, 116, -46, 46), M.iron, CAP.iron, pump);
  const hub = new THREE.LatheGeometry([new THREE.Vector2(9.6, 92), new THREE.Vector2(17, 92), new THREE.Vector2(17, 120), new THREE.Vector2(9.6, 120), new THREE.Vector2(9.6, 92)], 64);
  solid(hub, M.iron, CAP.iron, pump);
  const sleeve = new THREE.LatheGeometry([new THREE.Vector2(BORE, 0), new THREE.Vector2(21, 0), new THREE.Vector2(21, 38), new THREE.Vector2(BORE, 38), new THREE.Vector2(BORE, 0)], 64);
  sleeve.rotateZ(Math.PI / 2);
  sleeve.translate(-24, Y_AX, 0);
  solid(sleeve, M.iron, CAP.iron, pump);
  solid(box(-50, -24, 110, 118, -18, 18), M.iron, CAP.iron, pump);

  const piston = new THREE.Group();
  pump.add(piston);
  const pg = new THREE.CylinderGeometry(BORE - 0.3, BORE - 0.3, 22, 48);
  pg.rotateZ(Math.PI / 2);
  mesh(pg, M.steel, piston);
  for (const dx of [-7, -4.5]) {
    const ring = new THREE.TorusGeometry(BORE - 0.2, 0.5, 8, 48);
    ring.rotateY(Math.PI / 2);
    ring.translate(dx, 0, 0);
    mesh(ring, std('#7d8289', 1, 0.4), piston);
  }
  const rod = new THREE.Group();
  pump.add(rod);
  mesh(box(4, L_ROD - 4, -3.5, 3.5, -4, 4), M.alu, rod);
  mesh(cylY(10.5, -4, 4, 40), M.alu, rod);
  mesh(cylY(6.5, -4, 4, 32).translate(L_ROD, 0, 0), M.alu, rod);

  // Valve plate with its two reed valves.
  const plate = new THREE.Group();
  root.add(plate);
  solid(box(-65, -62, 110, 156, -23, 23), M.steelC, CAP.steel, plate);
  const sucPivot = new THREE.Group();
  sucPivot.position.set(-61.2, 153, 0);
  plate.add(sucPivot);
  mesh(box(-0.5, 0.5, -15, 0, -6, 6), M.reed, sucPivot);
  const disPivot = new THREE.Group();
  disPivot.position.set(-65.8, 116, 0);
  plate.add(disPivot);
  mesh(box(-0.5, 0.5, 0, 15, -6, 6), M.reed, disPivot);
  // Port holes drawn as dark discs on the plate faces.
  for (const [x, y] of [[-61.6, 145], [-65.4, 124]]) {
    const g = new THREE.CircleGeometry(4.2, 32);
    g.rotateY(x > -63 ? Math.PI / 2 : -Math.PI / 2);
    g.translate(x, y, 0);
    plate.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({color: '#202326'})));
  }

  // Cylinder head: hollow, split into suction (top) and discharge (bottom) chambers.
  const head = new THREE.Group();
  root.add(head);
  for (const g of [
    // Walls are inset a little where they meet, so no two faces share a plane (z-fighting flicker).
    box(-80, -77.2, 110.2, 155.8, -22.8, 22.8),
    box(-80, -65.3, 153, 156, -23, 23),
    box(-80, -65.3, 110, 113, -23, 23),
    box(-79.8, -65.3, 113.2, 152.8, -23, -20),
    box(-79.8, -65.3, 113.2, 152.8, 20, 23),
    box(-77.4, -65.3, 132, 135, -19.8, 19.8),
  ])
    solid(g, M.iron, CAP.iron, head);

  // Suction muffler (plastic), see-through during the close-up.
  const muffler = new THREE.Group();
  root.add(muffler);
  const mg = new THREE.ExtrudeGeometry(
    (() => {
      const s = new THREE.Shape();
      s.moveTo(-80, 118);
      s.lineTo(-48, 118);
      s.lineTo(-48, 152);
      s.quadraticCurveTo(-48, 158, -54, 158);
      s.lineTo(-74, 158);
      s.quadraticCurveTo(-80, 158, -80, 152);
      s.closePath();
      return s;
    })(),
    {depth: 22, bevelEnabled: true, bevelSize: 2.5, bevelThickness: 2.5, bevelSegments: 3},
  );
  mg.translate(0, 0, -50);
  mesh(mg, M.plastic, muffler);
  mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-72, 146, -27), new THREE.Vector3(-72, 146, -19)), 1, 5, 20, false), M.plastic, muffler);
  mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-58, 118, -40), new THREE.Vector3(-58, 108, -44)), 1, 5, 20, false), M.plastic, muffler);

  // Discharge line: a looped tube from the head out to the shell.
  const disCurve = new THREE.CatmullRomCurve3(
    [
      [-72, 125, -21],
      [-70, 116, -44],
      [-40, 108, -66],
      [0, 104, -76],
      [40, 100, -66],
      [62, 93, -44],
      [44, 86, -66],
      [0, 80, -78],
      [-46, 76, -76],
      [-78, 72, -62],
      [-92, 70, -56],
      [-126, 70, -75],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    'centripetal',
  );
  const disTube = mesh(new THREE.TubeGeometry(disCurve, 240, 2.6, 12, false), M.steel, root);

  // Suction path for the gas: shell space -> muffler -> suction chamber -> valve -> cylinder.
  const sucCurve = new THREE.CatmullRomCurve3(
    [
      [-58, 100, -46],
      [-58, 122, -40],
      [-66, 146, -36],
      [-72, 146, -22],
      [-72, 145, -6],
      [-66, 145, 0],
      [-60, 144, 0],
      [-55, 140, 0],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    'centripetal',
  );
  const disPath = new THREE.CatmullRomCurve3(
    [[-58, 128, 0], [-63.5, 124, 0], [-70, 123, 0], [-72, 124, -12], [-72, 125, -21], ...disCurve.points.slice(1).map((p) => [p.x, p.y, p.z])].map(
      (p) => (p instanceof THREE.Vector3 ? p : new THREE.Vector3(p[0] as number, p[1] as number, p[2] as number)),
    ),
    false,
    'centripetal',
  );

  // Gas particles.
  const N_CYL = 70;
  const N_SUC = 34;
  const N_DIS = 90;
  const gasMat = new THREE.MeshBasicMaterial({color: '#ffffff', toneMapped: false});
  const dot = new THREE.SphereGeometry(1.25, 10, 8);
  const gasCyl = new THREE.InstancedMesh(dot, gasMat, N_CYL);
  const gasSuc = new THREE.InstancedMesh(dot, gasMat, N_SUC);
  const gasDis = new THREE.InstancedMesh(dot, gasMat, N_DIS);
  for (const g of [gasCyl, gasSuc, gasDis]) {
    g.frustumCulled = false;
    root.add(g);
  }
  const rnd = (i: number, k: number) => {
    const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const tmpM = new THREE.Matrix4();
  const tmpC = new THREE.Color();
  const put = (g: THREE.InstancedMesh, i: number, p: THREE.Vector3, scale: number, col: THREE.Color) => {
    tmpM.makeScale(scale, scale, scale).setPosition(p);
    g.setMatrixAt(i, tmpM);
    g.setColorAt(i, col);
  };

  // Soft contact shadow under the base.
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(420, 300), new THREE.MeshBasicMaterial({map: blobTexture(), transparent: true, depthWrite: false}));
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.3;
  root.add(blob);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.ShadowMaterial({opacity: 0.16}));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  let rimD = NaN;
  const update = (s: number) => {
    // Section plane and its rim.
    const d = sliceAt(s);
    clip.constant = d;
    if (Math.abs(d - rimD) > 0.01) {
      rimD = d;
      rim.geometry.dispose();
      const pts = rimPoints(d);
      rim.geometry = pts.length > 3 ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 300, 1.8, 8, false) : new THREE.BufferGeometry();
    }
    const sweep = prog(s, T.sliceA, 0.25) * (1 - prog(s, T.sliceB - 0.1, 0.6));
    M.rim.emissiveIntensity = 1.6 * sweep;
    M.rim.color.set('#a9adb3').lerp(new THREE.Color(ACCENT), sweep);

    // Exploded view.
    stator.position.copy(offset(s, 'stator'));
    rotorOff.position.copy(offset(s, 'rotor'));
    pump.position.copy(offset(s, 'pump'));
    plate.position.copy(offset(s, 'plate'));
    head.position.copy(offset(s, 'head'));
    muffler.position.copy(offset(s, 'muffler'));
    disTube.visible = explodeK(s, 'pump') < 0.01;

    // Mechanism.
    const phi = crankPhi(s);
    const th = phi + Math.PI;
    crank.rotation.y = -th;
    rotorBlurMat.opacity = Math.min(1, speedUp(s) * 1.4);
    rotorBlur.visible = rotorBlurMat.opacity > 0.001;
    const xp = pinX(phi);
    piston.position.set(xp - 1, Y_AX, 0);
    const px = R_CRANK * Math.cos(th);
    const pz = R_CRANK * Math.sin(th);
    rod.position.set(px, Y_AX, pz);
    rod.rotation.y = Math.atan2(-(0 - pz), xp - px);
    const gas = gasState(phi);
    const valveK = s >= T.cut ? 1 : 0;
    sucPivot.rotation.z = 0.42 * gas.suc * valveK;
    disPivot.rotation.z = 0.42 * gas.dis * valveK;

    // X-ray muffler during the close-up.
    const xray = prog(s, T.cut, 0.01) * (1 - prog(s, T.pullBack + 0.6, 1.2));
    M.plastic.opacity = 1 - 0.72 * xray;
    M.plastic.depthWrite = M.plastic.opacity > 0.99;

    // Gas.
    const show = s >= T.cut ? 1 : 0;
    const fastK = speedUp(s);
    const col = tmpC.copy(COLD).lerp(HOT, gas.temp);
    const gapLen = Math.max(1, gas.gap - 1.6);
    const off = pump.position;
    for (let i = 0; i < N_CYL; i++) {
      const on = show * Math.min(1, Math.max(0, gas.mass * N_CYL - i)); // fractional: fades, no popping
      const u = rnd(i, 1);
      const rr = Math.sqrt(rnd(i, 2)) * (BORE - 2);
      const an = rnd(i, 3) * TAU;
      const jig = Math.sin(s * (5 + 4 * rnd(i, 4)) + i) * 1.2;
      const p = new THREE.Vector3(X_VP + 0.8 + u * gapLen, Y_AX + rr * Math.sin(an) + jig * 0.6, rr * Math.cos(an) + jig * 0.6).add(off);
      put(gasCyl, i, p, on * (0.85 + 0.3 * rnd(i, 5)), col);
    }
    const sucK = show * Math.max(gas.suc, fastK * 0.85);
    for (let i = 0; i < N_SUC; i++) {
      const u = (i / N_SUC + s * lerp(0.35, 0.9, fastK)) % 1;
      const p = sucCurve.getPointAt(u).add(off);
      tmpC.copy(COLD).lerp(HOT, 0.04);
      put(gasSuc, i, p, sucK * Math.min(1, Math.min(u, 1 - u) * 8) * 0.9, tmpC);
    }
    const disK = show * Math.max(gas.dis, fastK * 0.9, prog(s, T.pullBack, 0.3));
    for (let i = 0; i < N_DIS; i++) {
      const u = (i / N_DIS + s * lerp(0.16, 0.42, fastK)) % 1;
      const p = disPath.getPointAt(u).add(off);
      tmpC.copy(HOT).lerp(new THREE.Color('#ff7a2e'), u * 0.5);
      const ends = Math.min(1, Math.min(u, 1 - u) * 12); // grow in / shrink out at the ends of the path
      put(gasDis, i, p, disK * ends * lerp(1.1, 2.4, prog(s, T.pullBack, 1.6)), tmpC);
    }
    for (const g of [gasCyl, gasSuc, gasDis]) {
      g.instanceMatrix.needsUpdate = true;
      if (g.instanceColor) g.instanceColor.needsUpdate = true;
    }
  };

  return {root, update, meshes: all};
}
