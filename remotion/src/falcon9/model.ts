// Falcon 9 booster episode: every 3D part, modelled in code, in metres (+Y up, +Z toward the camera).
// Real dimensions come from research/falcon9-booster/facts.md. Where SpaceX publishes nothing (engine and
// leg proportions, the helium bottles' exact layout), the shapes are illustrative and sized to fit the
// real outer dimensions. No logos or markings: plain white, black and metal.
import * as THREE from 'three';

// ---------- real dimensions (facts.md) ----------
export const D = 3.66; // stage diameter (SpaceX User's Guide)
export const R = D / 2;
export const STAGE1 = 41.2; // first stage incl. engines (spec sheets)
export const INTERSTAGE_TOP = 47.7; // first stage + interstage
export const FAIRING_D = 5.2; // SpaceX User's Guide
export const FAIRING_H = 13.2; // SpaceX User's Guide
export const TOTAL = 70; // whole rocket (SpaceX User's Guide)
export const STAGE2_TOP = TOTAL - FAIRING_H; // the fairing sits on top of the second stage
export const PERSON = 1.75;

// Tank barrel split by propellant volume: LOX 287.4 t / 1,141 kg m⁻³ ≈ 252 m³,
// RP-1 123.5 t / 810 kg m⁻³ ≈ 152 m³ (masses: Wikipedia, Falcon 9 Block 5). RP-1 share ≈ 0.376.
export const ENGINE_BAY_TOP = 4.0; // top of the thrust section (illustrative)
export const TANK_TOP = 40.6; // top of the LOX tank, just below the interstage joint
const RP1_SHARE = 152 / (152 + 252);
export const COMMON_DOME = ENGINE_BAY_TOP + (TANK_TOP - ENGINE_BAY_TOP) * RP1_SHARE;
export const DOME_H = 0.95; // ellipsoidal tank heads (illustrative)

// ---------- materials ----------
export const MAT = {
  paint: () => new THREE.MeshStandardMaterial({color: '#f3f4f5', metalness: 0.05, roughness: 0.42, name: 'white paint'}),
  carbon: () => new THREE.MeshStandardMaterial({color: '#1b1c1f', metalness: 0.15, roughness: 0.48, name: 'carbon fibre'}),
  alLi: () => new THREE.MeshStandardMaterial({color: '#b9bec5', metalness: 0.85, roughness: 0.38, name: 'aluminium-lithium'}),
  titanium: () => new THREE.MeshStandardMaterial({color: '#8b8f96', metalness: 0.9, roughness: 0.42, name: 'titanium'}),
  steel: () => new THREE.MeshStandardMaterial({color: '#c4c8cd', metalness: 1, roughness: 0.3, name: 'steel'}),
  nozzle: () => new THREE.MeshStandardMaterial({color: '#3a3b3f', metalness: 0.7, roughness: 0.5, name: 'nozzle'}),
  copper: () => new THREE.MeshStandardMaterial({color: '#b8703f', metalness: 1, roughness: 0.35, name: 'copper chamber'}),
  heatShield: () => new THREE.MeshStandardMaterial({color: '#55585e', metalness: 0.2, roughness: 0.8, name: 'heat shield'}),
  copv: () => new THREE.MeshStandardMaterial({color: '#2a2c30', metalness: 0.3, roughness: 0.5, name: 'COPV carbon overwrap'}),
  lox: () => new THREE.MeshStandardMaterial({color: '#5aa7ff', metalness: 0, roughness: 0.1, transparent: true, opacity: 0.55, name: 'liquid oxygen'}),
  rp1: () => new THREE.MeshStandardMaterial({color: '#e0a64a', metalness: 0, roughness: 0.12, transparent: true, opacity: 0.6, name: 'RP-1 kerosene'}),
  orange: () => new THREE.MeshStandardMaterial({color: '#ff6a1a', metalness: 0.05, roughness: 0.35, name: 'helmet orange'}),
  workwear: () => new THREE.MeshStandardMaterial({color: '#2a2d33', metalness: 0, roughness: 0.8, name: 'workwear'}),
  skin: () => new THREE.MeshStandardMaterial({color: '#c98f6b', metalness: 0, roughness: 0.6, name: 'skin'}),
  deck: () => new THREE.MeshStandardMaterial({color: '#4b4e54', metalness: 0.4, roughness: 0.7, name: 'deck steel'}),
  marking: () => new THREE.MeshStandardMaterial({color: '#e9eaec', metalness: 0, roughness: 0.6, name: 'deck marking'}),
  glass: () => new THREE.MeshStandardMaterial({color: '#9fb4c8', metalness: 0.6, roughness: 0.15, name: 'glass'}),
  concrete: () => new THREE.MeshStandardMaterial({color: '#d9dadc', metalness: 0, roughness: 0.85, name: 'concrete'}),
};

// ---------- helpers ----------
const lathe = (pts: [number, number][], seg = 96) => {
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(0.0005, r), y)), seg);
  g.computeVertexNormals();
  return g;
};
const cyl = (r: number, y0: number, y1: number, seg = 96, open = false, r1 = r) => {
  const g = new THREE.CylinderGeometry(r1, r, y1 - y0, seg, 1, open);
  g.translate(0, (y0 + y1) / 2, 0);
  return g;
};
const mesh = (g: THREE.BufferGeometry, m: THREE.Material, name?: string) => {
  const x = new THREE.Mesh(g, m);
  if (name) x.name = name;
  x.castShadow = true;
  x.receiveShadow = true;
  return x;
};
const group = (name: string, ...kids: THREE.Object3D[]) => {
  const g = new THREE.Group();
  g.name = name;
  for (const k of kids) g.add(k);
  return g;
};
// A closed ellipsoidal tank head profile from radius r at y0 bulging by h (h > 0 up, h < 0 down).
const headProfile = (r: number, y0: number, h: number, n = 16): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * (Math.PI / 2);
    pts.push([r * Math.cos(a), y0 + h * Math.sin(a)]);
  }
  return pts;
};

// ---------- Merlin engine (sea level) ----------
// Proportions are illustrative, sized so 9 bells fit the 3.66 m base (8 around 1).
export const MERLIN = {exitR: 0.46, length: 2.9, throatY: 2.05, chamberTop: 2.45};
export function buildMerlin(opts: {exploded?: number} = {}) {
  const e = opts.exploded ?? 0; // 0 = assembled, 1 = fully exploded (parts spread along +Y and outward)
  const m = MERLIN;
  // Nozzle bell: from the exit (y = 0) up to the throat.
  const bellPts: [number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const y = t * m.throatY;
    const r = 0.13 + (m.exitR - 0.13) * Math.pow(1 - t, 1.7);
    bellPts.push([r, y]);
  }
  const nozzleDS = MAT.nozzle();
  nozzleDS.side = THREE.DoubleSide;
  const bell = mesh(lathe(bellPts, 64), nozzleDS, 'nozzle bell');
  // Regenerative cooling tubes: thin stripes up the bell.
  const tubes = new THREE.Group();
  tubes.name = 'cooling tubes';
  // Combustion chamber + throat (copper-coloured liner).
  const chamber = mesh(
    lathe([[0.13, m.throatY - 0.15], [0.11, m.throatY], [0.2, m.throatY + 0.18], [0.2, m.chamberTop], [0.01, m.chamberTop]], 48),
    MAT.copper(),
    'combustion chamber',
  );
  // Injector with the central pintle.
  const injector = group(
    'injector',
    mesh(cyl(0.22, 0, 0.12, 48), MAT.steel(), 'injector plate'),
    mesh(cyl(0.045, -0.16, 0.0, 24), MAT.steel(), 'pintle'),
    mesh(lathe(headProfile(0.22, 0.12, 0.16), 48), MAT.steel(), 'injector dome'),
  );
  // Turbopump: shaft housing with LOX and fuel volutes and a turbine on top.
  const pump = group(
    'turbopump',
    mesh(cyl(0.14, 0, 0.7, 40), MAT.steel(), 'pump housing'),
    mesh(new THREE.TorusGeometry(0.17, 0.07, 16, 40).rotateX(Math.PI / 2).translate(0, 0.18, 0), MAT.steel(), 'LOX pump volute'),
    mesh(new THREE.TorusGeometry(0.16, 0.06, 16, 40).rotateX(Math.PI / 2).translate(0, 0.45, 0), MAT.alLi(), 'fuel pump volute'),
    mesh(cyl(0.19, 0.72, 0.86, 40), MAT.heatShield(), 'turbine'),
  );
  // Gas generator and its exhaust duct (dumps turbine exhaust out the side).
  const gg = group(
    'gas generator',
    mesh(cyl(0.07, 0, 0.32, 24), MAT.steel(), 'gas generator'),
    mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.08, -0.4, 0.05), new THREE.Vector3(0.28, -1.2, 0.1), new THREE.Vector3(0.42, -1.9, 0.1)]),
        32,
        0.06,
        12,
        false,
      ),
      MAT.nozzle(),
      'turbine exhaust duct',
    ),
  );
  // Propellant lines from pump to injector.
  const lines = group(
    'propellant lines',
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.15, -0.1, 0), new THREE.Vector3(-0.32, -0.2, 0)]), 16, 0.05, 10), MAT.alLi(), 'LOX line'),
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.1, 0.05, 0.12), new THREE.Vector3(-0.3, 0.02, 0.2)]), 16, 0.04, 10), MAT.steel(), 'fuel line'),
  );
  // Assemble, with an exploded offset per part.
  const root = group('merlin', bell, tubes, chamber, injector, pump, gg, lines);
  const place = (o: THREE.Object3D, base: [number, number, number], out: [number, number, number]) =>
    o.position.set(base[0] + out[0] * e, base[1] + out[1] * e, base[2] + out[2] * e);
  place(bell, [0, 0, 0], [0, -0.6, 0]);
  place(chamber, [0, 0, 0], [0, 0.1, 0]);
  place(injector, [0, m.chamberTop, 0], [0, 0.8, 0]);
  place(pump, [0.42, m.chamberTop - 0.25, 0], [1.1, 0.9, 0]);
  place(gg, [0.32, m.chamberTop - 0.1, 0.18], [0.7, 0.3, 0.8]);
  place(lines, [0.36, m.chamberTop + 0.05, 0], [0.6, 0.55, 0.2]);
  return root;
}

// ---------- booster (first stage) ----------
export const FIN_Y = 39.4; // grid fin hinge height (illustrative, "near the top")
export const LEG = {hingeY: 1.6, length: 9.3, stowedDeg: 4, deployedDeg: 120};

/** One grid fin: a titanium frame with a waffle lattice. Hinge at the local origin; the fin extends along
 * +X (radially), its chord along Z, and air flows through the lattice along Y. Deployed = this pose. */
export function buildGridFin() {
  const g = group('grid fin');
  const w = 1.5; // span (radial)
  const c = 1.2; // chord
  const t = 0.18; // lattice depth (along the airflow)
  const x0 = 0.15;
  const titanium = MAT.titanium();
  const bar = (ax: number, az: number, bx: number, bz: number, thick: number) => {
    const len = Math.hypot(bx - ax, bz - az);
    const m = mesh(new THREE.BoxGeometry(len, t, thick), titanium);
    m.position.set((ax + bx) / 2, 0, (az + bz) / 2);
    m.rotation.y = -Math.atan2(bz - az, bx - ax);
    g.add(m);
  };
  // Frame.
  bar(x0, -c / 2, x0 + w, -c / 2, 0.06);
  bar(x0, c / 2, x0 + w, c / 2, 0.06);
  bar(x0, -c / 2, x0, c / 2, 0.06);
  bar(x0 + w, -c / 2, x0 + w, c / 2, 0.06);
  // Diagonal lattice clipped to the frame: lines x - z = k and x + z = k.
  const inRect = (x: number, z: number) => x >= x0 - 1e-6 && x <= x0 + w + 1e-6 && z >= -c / 2 - 1e-6 && z <= c / 2 + 1e-6;
  for (const sgn of [1, -1]) {
    for (let k = -2; k <= 2.5; k += 0.13) {
      // Points on the rectangle edges where x + sgn*z = k (+ offset so the grid is centred on the fin).
      const kk = k + x0 + w / 2 - 0.9;
      const pts: [number, number][] = [];
      for (const z of [-c / 2, c / 2]) {
        const x = kk - sgn * z;
        if (inRect(x, z)) pts.push([x, z]);
      }
      for (const x of [x0, x0 + w]) {
        const z = (kk - x) * sgn;
        if (inRect(x, z)) pts.push([x, z]);
      }
      if (pts.length >= 2) bar(pts[0][0], pts[0][1], pts[1][0], pts[1][1], 0.025);
    }
  }
  // Hinge actuator at the root.
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.35, 0.4), MAT.heatShield(), 'fin actuator'));
  return g;
}

/** One landing leg: carbon-fibre beam with a foot and a telescoping strut; hinge at local origin, leg along +Y when stowed. */
export function buildLeg() {
  const g = group('landing leg');
  const L = LEG.length;
  const beam = new THREE.Shape();
  beam.moveTo(-0.32, 0);
  beam.lineTo(0.32, 0);
  beam.lineTo(0.22, L);
  beam.lineTo(-0.22, L);
  beam.closePath();
  const beamGeo = new THREE.ExtrudeGeometry(beam, {depth: 0.28, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2});
  beamGeo.translate(0, 0, -0.14);
  g.add(mesh(beamGeo, MAT.carbon(), 'leg beam'));
  const foot = mesh(cyl(0.42, L - 0.05, L + 0.12, 32), MAT.heatShield(), 'foot');
  g.add(foot);
  return g;
}

export type BoosterParts = {
  root: THREE.Group;
  shell: THREE.Group; // outer skin + interstage (cut for cutaways)
  tanks: THREE.Group; // domes, transfer tube, COPVs
  lox: THREE.Mesh; // propellant fills (scale y to drain)
  rp1: THREE.Mesh;
  engines: THREE.Group; // 9 Merlins + octaweb + heat shield
  fins: THREE.Group[]; // rotate about local Y-axis hinge to deploy
  legs: THREE.Group[]; // rotate about local Z to deploy
  thrusters: THREE.Group;
};

export function buildBooster(): BoosterParts {
  const root = group('booster');
  // --- shell: engine skirt + tank barrel (Al-Li, painted white) + interstage (black carbon) ---
  const shell = group('shell');
  const ringWall = (r0: number, r1: number, y0: number, y1: number) => lathe([[r0, y0], [r1, y0], [r1, y1], [r0, y1], [r0, y0]], 128);
  shell.add(mesh(ringWall(R - 0.025, R, 4.0, TANK_TOP), MAT.paint(), 'tank skin'));
  shell.add(mesh(ringWall(R - 0.025, R, TANK_TOP, INTERSTAGE_TOP), MAT.carbon(), 'interstage'));
  shell.add(mesh(ringWall(R - 0.025, R + 0.02, 1.4, 4.0), MAT.carbon(), 'engine section'));
  root.add(shell);

  // --- tanks: domes, common dome, transfer tube, helium COPVs ---
  const tanks = group('tanks');
  const alLi = MAT.alLi();
  const rIn = R - 0.02;
  tanks.add(mesh(lathe(headProfile(rIn, ENGINE_BAY_TOP + DOME_H * 0.2, -DOME_H)), alLi, 'RP-1 aft dome'));
  tanks.add(mesh(lathe(headProfile(rIn, COMMON_DOME, -DOME_H)), alLi, 'common dome'));
  tanks.add(mesh(lathe(headProfile(rIn, TANK_TOP - 0.2, DOME_H * 0.8)), alLi, 'LOX forward dome'));
  tanks.add(mesh(cyl(0.22, ENGINE_BAY_TOP - 0.6, COMMON_DOME - DOME_H + 0.1, 40), alLi, 'LOX transfer tube (double wall)'));
  // Helium COPVs (illustrative count and placement) in the LOX tank.
  const copvs = group('helium COPVs');
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const c = mesh(new THREE.CapsuleGeometry(0.32, 0.6, 8, 24), MAT.copv(), 'COPV');
    c.position.set(Math.cos(a) * 1.05, TANK_TOP - 2.4, Math.sin(a) * 1.05);
    copvs.add(c);
  }
  tanks.add(copvs);
  root.add(tanks);
  // Propellant fills (base at the bottom of each tank, scale.y = fill fraction).
  const rpH = COMMON_DOME - DOME_H - ENGINE_BAY_TOP;
  const rp1 = mesh(cyl(rIn - 0.03, 0, rpH, 96), MAT.rp1(), 'RP-1 fill');
  rp1.position.y = ENGINE_BAY_TOP;
  const loxH = TANK_TOP - 0.2 - COMMON_DOME;
  const lox = mesh(cyl(rIn - 0.03, 0, loxH, 96), MAT.lox(), 'LOX fill');
  lox.position.y = COMMON_DOME;
  rp1.castShadow = lox.castShadow = false;
  root.add(rp1, lox);

  // --- engines: octaweb, heat shield, 9 Merlins (8 around 1) ---
  const engines = group('engines');
  engines.add(mesh(cyl(R, 1.35, 1.55, 96), MAT.heatShield(), 'heat shield'));
  engines.add(mesh(cyl(R - 0.1, 1.55, 3.9, 8), MAT.steel(), 'octaweb (thrust structure)'));
  const ring = 1.27; // ring radius for the 8 outer engines
  for (let i = 0; i < 9; i++) {
    const m = buildMerlin();
    m.name = i === 0 ? 'merlin centre' : `merlin ${i}`;
    const a = ((i - 1) / 8) * Math.PI * 2;
    if (i > 0) m.position.set(Math.cos(a) * ring, 0.35, Math.sin(a) * ring);
    else m.position.set(0, 0.35, 0);
    m.scale.setScalar(0.9);
    engines.add(m);
  }
  root.add(engines);

  // --- grid fins: four, hinged at the top, stowed flat against the interstage ---
  const fins: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const holder = group(`grid fin ${i + 1}`);
    holder.position.set(Math.cos(a) * R, FIN_Y, Math.sin(a) * R);
    holder.rotation.y = -a; // local +X points radially outward
    const fin = buildGridFin();
    fin.rotation.z = Math.PI / 2; // stowed: folded up along the body
    holder.add(fin);
    holder.userData.fin = fin;
    root.add(holder);
    fins.push(holder);
  }

  // --- landing legs: four, hinged at the base, stowed up along the engine section and tank ---
  const legs: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const holder = group(`leg ${i + 1}`);
    holder.position.set(Math.cos(a) * (R + 0.2), LEG.hingeY, Math.sin(a) * (R + 0.2));
    holder.rotation.y = -a; // local +X radially outward
    const leg = buildLeg();
    leg.rotation.z = (-LEG.stowedDeg * Math.PI) / 180; // stowed: pointing up
    holder.add(leg);
    holder.userData.leg = leg;
    root.add(holder);
    legs.push(holder);
  }

  // --- cold-gas (nitrogen) thruster pods near the top ---
  const thrusters = group('nitrogen thrusters');
  for (const s of [1, -1]) {
    const pod = mesh(new THREE.BoxGeometry(0.35, 0.5, 0.3).translate(s * (R + 0.12), TANK_TOP + 0.6, 0), MAT.heatShield(), 'thruster pod');
    thrusters.add(pod);
  }
  root.add(thrusters);
  return {root, shell, tanks, lox, rp1, engines, fins, legs, thrusters};
}

/** Pose helpers. fin: 0 stowed → 1 deployed; leg: 0 stowed → 1 deployed. */
export function setFins(b: BoosterParts, k: number) {
  for (const f of b.fins) (f.userData.fin as THREE.Object3D).rotation.z = (Math.PI / 2) * (1 - k);
}
export function setLegs(b: BoosterParts, k: number) {
  const deg = LEG.stowedDeg + (LEG.deployedDeg - LEG.stowedDeg) * k;
  for (const l of b.legs) (l.userData.leg as THREE.Object3D).rotation.z = (-deg * Math.PI) / 180;
}
export function setPropellant(b: BoosterParts, lox: number, rp1: number) {
  b.lox.scale.y = Math.max(0.001, lox);
  b.rp1.scale.y = Math.max(0.001, rp1);
}

// ---------- second stage + fairing ----------
export function buildUpperStack() {
  const root = group('second stage + fairing');
  const s2Bottom = INTERSTAGE_TOP - 1.2; // second stage tank starts inside the interstage
  root.add(mesh(cyl(R, s2Bottom, STAGE2_TOP, 128), MAT.paint(), 'second stage'));
  // Merlin Vacuum: big bell inside the interstage (illustrative size).
  root.add(mesh(lathe([[1.5, s2Bottom - 4.2], [0.5, s2Bottom - 1.0], [0.2, s2Bottom - 0.4], [0.25, s2Bottom]], 64), MAT.nozzle(), 'Merlin Vacuum nozzle'));
  // Fairing: cylinder + ogive nose, 5.2 m wide, 13.2 m tall.
  const fr = FAIRING_D / 2;
  const fPts: [number, number][] = [[R, STAGE2_TOP], [fr, STAGE2_TOP + 1.4], [fr, STAGE2_TOP + 6.2]];
  for (let i = 1; i <= 16; i++) {
    const t = i / 16;
    fPts.push([fr * Math.cos(t * (Math.PI / 2)) ** 0.8, STAGE2_TOP + 6.2 + (FAIRING_H - 6.2) * Math.sin(t * (Math.PI / 2))]);
  }
  root.add(mesh(lathe(fPts, 96), MAT.paint(), 'fairing'));
  return root;
}

// ---------- the Teardown Lab technician (1.75 m) ----------
export function buildTechnician() {
  const g = group('technician');
  const ww = MAT.workwear();
  const cap = (r: number, len: number, x: number, y: number, z: number, m: THREE.Material, rotZ = 0, name?: string) => {
    const c = mesh(new THREE.CapsuleGeometry(r, len, 6, 16), m, name);
    c.position.set(x, y, z);
    c.rotation.z = rotZ;
    g.add(c);
    return c;
  };
  cap(0.075, 0.72, -0.1, 0.45, 0, ww, 0, 'left leg');
  cap(0.075, 0.72, 0.1, 0.45, 0, ww, 0, 'right leg');
  cap(0.19, 0.42, 0, 1.12, 0, ww, 0, 'torso');
  cap(0.055, 0.5, -0.3, 1.1, 0, ww, 0.25, 'left arm');
  cap(0.055, 0.5, 0.3, 1.1, 0, ww, -0.25, 'right arm');
  const head = mesh(new THREE.SphereGeometry(0.11, 24, 16), MAT.skin(), 'head');
  head.position.set(0, 1.55, 0);
  g.add(head);
  const helmet = mesh(new THREE.SphereGeometry(0.135, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.orange(), 'safety helmet');
  helmet.position.set(0, 1.585, 0);
  g.add(helmet);
  const brim = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.015, 24).translate(0, 1.585, 0.02), MAT.orange(), 'helmet brim');
  g.add(brim);
  return g;
}

// ---------- scale props ----------
export function buildBus() {
  const g = group('bus (12 m)');
  g.add(mesh(new THREE.BoxGeometry(12, 3.0, 2.55).translate(0, 1.85, 0), MAT.paint(), 'bus body'));
  g.add(mesh(new THREE.BoxGeometry(11.6, 0.9, 2.58).translate(0, 2.3, 0), MAT.glass(), 'bus windows'));
  for (const x of [-4, 4]) for (const z of [-1.2, 1.2]) g.add(mesh(cyl(0.5, -0.15, 0.15, 24).rotateX(Math.PI / 2).translate(x, 0.5, z), MAT.carbon(), 'wheel'));
  return g;
}
/** A building of n storeys at 3 m each (14 storeys ≈ 42 m ≈ the booster). */
export function buildBuilding(storeys = 14) {
  const g = group(`building (${storeys} storeys)`);
  const h = storeys * 3;
  g.add(mesh(new THREE.BoxGeometry(14, h, 14).translate(0, h / 2, 0), MAT.concrete(), 'building'));
  for (let i = 1; i < storeys; i++) g.add(mesh(new THREE.BoxGeometry(14.06, 1.4, 14.06).translate(0, i * 3 - 1.1, 0), MAT.glass(), `floor ${i}`));
  return g;
}
/** Droneship deck (illustrative ~ 91 m x 52 m) with a plain target ring (no logos). */
export function buildDroneship() {
  const g = group('droneship');
  g.add(mesh(new THREE.BoxGeometry(91, 3, 52).translate(0, -1.5, 0), MAT.deck(), 'deck'));
  g.add(mesh(new THREE.RingGeometry(14, 15.2, 96).rotateX(-Math.PI / 2).translate(0, 0.01, 0), MAT.marking(), 'target ring'));
  g.add(mesh(new THREE.CircleGeometry(1.2, 48).rotateX(-Math.PI / 2).translate(0, 0.01, 0), MAT.marking(), 'target centre'));
  for (const z of [-26.5, 26.5]) g.add(mesh(new THREE.BoxGeometry(91, 2.5, 1).translate(0, 1.25, z), MAT.deck(), 'blast wall'));
  return g;
}
