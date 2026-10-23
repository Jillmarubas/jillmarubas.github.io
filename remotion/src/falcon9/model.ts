// Falcon 9 booster episode: every 3D part, modelled in code, in metres (+Y up, +Z toward the camera).
// Built as close to the real vehicle as public sources allow; research/falcon9-booster/facts.md lists the
// source for each feature ("3D model" table). Where SpaceX publishes nothing (exact engine and leg
// proportions, how many helium bottles and where), shapes are sized from photos and marked illustrative.
// No logos or markings: plain white, black and metal.
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
  // Two hydraulic gimbal actuators that steer the engine (the nozzle is gimbaled: User's Guide).
  const act = (x: number, z: number) => {
    const a = new THREE.Vector3(x * 0.55, 0.75, z * 0.55);
    const b = new THREE.Vector3(x * 0.2, 0, z * 0.2);
    const len = a.distanceTo(b);
    const g = new THREE.Group();
    const body = mesh(cyl(0.045, 0, len * 0.6, 16), MAT.steel(), 'actuator body');
    const rod = mesh(cyl(0.022, len * 0.55, len, 12), MAT.alLi(), 'actuator rod');
    g.add(body, rod);
    g.position.copy(b);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a.clone().sub(b).normalize());
    return g;
  };
  const gimbal = group('gimbal actuators', act(-1, 0.35), act(-0.35, -1));
  // Assemble, with an exploded offset per part.
  const root = group('merlin', bell, chamber, injector, pump, gg, lines, gimbal);
  const place = (o: THREE.Object3D, base: [number, number, number], out: [number, number, number]) =>
    o.position.set(base[0] + out[0] * e, base[1] + out[1] * e, base[2] + out[2] * e);
  place(bell, [0, 0, 0], [0, -0.6, 0]);
  place(chamber, [0, 0, 0], [0, 0.1, 0]);
  place(injector, [0, m.chamberTop, 0], [0, 0.8, 0]);
  place(pump, [0.42, m.chamberTop - 0.25, 0], [1.1, 0.9, 0]);
  place(gg, [0.32, m.chamberTop - 0.1, 0.18], [0.7, 0.3, 0.8]);
  place(lines, [0.36, m.chamberTop + 0.05, 0], [0.6, 0.55, 0.2]);
  place(gimbal, [0, m.chamberTop - 0.1, 0], [-0.9, 0.5, -0.4]);
  return root;
}

// ---------- booster (first stage) ----------
export const FIN_Y = 41.6; // grid fin hinge on the black interstage, fins folded up against it (photos)
// Legs: hinge at the base, stowed pointing up, swing down and out (Spaceflight Now / SpaceX). 128° gives
// a deployed span of about 18 m. A four-stage telescoping pusher runs from the engine section to the leg.
export const LEG = {hingeY: 1.6, length: 9.3, stowedDeg: 4, deployedDeg: 128};
export const PUSHER = {bodyY: 3.2, bodyX: -0.12, legS: 5.1, stages: 4, stageLen: 1.95, r0: 0.11, dr: 0.02};
/** Pusher tube poses in the leg holder's plane (x radial, y up from the hinge) for a leg at `deg`. */
export function pusherPose(deg: number) {
  const th = (deg * Math.PI) / 180;
  const ax = PUSHER.bodyX, ay = PUSHER.bodyY;
  const px = PUSHER.legS * Math.sin(th), py = PUSHER.legS * Math.cos(th);
  const dx = px - ax, dy = py - ay;
  const dist = Math.hypot(dx, dy);
  const phi = Math.atan2(dx, dy); // from +Y toward +X
  const n = PUSHER.stages;
  const step = Math.max(0, (dist - PUSHER.stageLen) / (n - 1));
  const out: {x: number; y: number; phi: number}[] = [];
  for (let i = 0; i < n; i++) out.push({x: ax + (dx / dist) * step * i, y: ay + (dy / dist) * step * i, phi});
  return out;
}
/** One pusher stage: a tube along +Y from the origin (stage 0 is the widest). */
export function buildPusherStage(i: number) {
  return mesh(cyl(PUSHER.r0 - PUSHER.dr * i, 0, PUSHER.stageLen, 24), i === 0 ? MAT.carbon() : MAT.steel(), `pusher stage ${i + 1}`);
}

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
  // Root spar and hinge fitting (hydraulically driven: a 2018 pump stall is in facts.md).
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.3, c * 0.9), MAT.titanium(), 'root spar'));
  g.add(mesh(cyl(0.09, -0.25, 0.25, 20).rotateX(Math.PI / 2), MAT.steel(), 'hinge pin'));
  return g;
}

/** One landing leg: carbon-fibre / aluminium-honeycomb beam with black thermal coating and a foot pad;
 * hinge at the local origin, leg along +Y when stowed. The pad is level with the ground when deployed. */
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
  // Spine rib down the outside face (photos show a raised centre section).
  g.add(mesh(new THREE.BoxGeometry(0.22, L * 0.92, 0.12).translate(0, L * 0.48, 0.18), MAT.carbon(), 'leg spine'));
  g.add(mesh(cyl(0.12, -0.3, 0.3, 20).rotateX(Math.PI / 2), MAT.steel(), 'hinge pin'));
  // Foot pad: a disc tilted so it sits flat on the deck at the deployed angle.
  g.add(mesh(cyl(0.16, L - 0.3, L + 0.12, 16), MAT.steel(), 'foot post'));
  const pad = mesh(cyl(0.5, -0.06, 0.06, 32), MAT.heatShield(), 'foot pad');
  pad.position.set(0, L + 0.12, 0);
  pad.rotation.z = (LEG.deployedDeg * Math.PI) / 180; // undoes the leg's tilt: flat on the deck when deployed
  g.add(pad);
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
  legs: THREE.Group[]; // rotate about local Z to deploy; userData.pusher = the four pusher stages
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
  // Raceway: the black cable and pressure-line tray up the side (Block 5 thermal coating: Wikipedia).
  const rwA = -Math.PI / 8; // between a leg and a grid fin
  const raceway = mesh(new THREE.BoxGeometry(0.16, TANK_TOP - 4.0, 0.42).translate(R + 0.06, (TANK_TOP + 4.0) / 2, 0), MAT.carbon(), 'raceway');
  raceway.rotation.y = -rwA;
  shell.add(raceway);
  root.add(shell);

  // --- tanks: domes, common dome, transfer tube, helium COPVs ---
  const tanks = group('tanks');
  const alLi = MAT.alLi();
  const rIn = R - 0.02;
  // Bare aluminium-lithium inside face of the tank wall (paint is on the outside only).
  tanks.add(mesh(cyl(R - 0.026, ENGINE_BAY_TOP + 0.05, TANK_TOP - 0.05, 128, true), MAT.alLi(), 'tank wall, inside'));
  tanks.add(mesh(lathe(headProfile(rIn, ENGINE_BAY_TOP + DOME_H * 0.2, -DOME_H)), alLi, 'RP-1 aft dome'));
  tanks.add(mesh(lathe(headProfile(rIn, COMMON_DOME, -DOME_H)), alLi, 'common dome'));
  tanks.add(mesh(lathe(headProfile(rIn, TANK_TOP - 0.2, DOME_H * 0.8)), alLi, 'LOX forward dome'));
  // Double-wall LOX transfer tube through the middle of the RP-1 tank (User's Guide).
  const ttY0 = ENGINE_BAY_TOP - 0.6, ttY1 = COMMON_DOME - DOME_H + 0.1;
  tanks.add(mesh(cyl(0.24, ttY0, ttY1, 40, true), alLi, 'transfer tube outer wall'));
  tanks.add(mesh(cyl(0.18, ttY0 - 0.05, ttY1 + 0.05, 40), MAT.steel(), 'transfer tube inner wall'));
  // RP-1 tank is skin-and-stringer (the LOX tank is monocoque): stringers inside the wall (Wikipedia).
  const stringerMat = MAT.alLi();
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const st = mesh(new THREE.BoxGeometry(0.05, COMMON_DOME - ENGINE_BAY_TOP - 0.3, 0.035).translate(rIn - 0.03, (COMMON_DOME + ENGINE_BAY_TOP) / 2, 0), stringerMat, 'stringer');
    st.rotation.y = -a;
    tanks.add(st);
  }
  // Helium COPVs inside the LOX tank, held by struts (both stages carry them in LOX: Spaceflight101).
  // How many and where on the first stage is not published: three here, illustrative.
  const copvs = group('helium COPVs');
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const cx = Math.cos(a) * 1.05, cz = Math.sin(a) * 1.05, cy = TANK_TOP - 2.4;
    copvs.add(mesh(new THREE.CapsuleGeometry(0.32, 0.6, 8, 24).translate(cx, cy, cz), MAT.copv(), 'COPV'));
    for (const dy of [-0.35, 0.35]) {
      const st = mesh(cyl(0.025, 0, rIn - 1.05 - 0.28, 8).rotateZ(-Math.PI / 2).translate(0.28, dy, 0), MAT.steel(), 'COPV strut');
      st.position.set(cx, cy, cz);
      st.rotation.y = -a;
      copvs.add(st);
    }
  }
  tanks.add(copvs);
  // Stage separation: a centre pusher on the forward dome plus four pneumatic pushers on the interstage ring (User's Guide).
  const sep = group('stage separation pushers');
  sep.add(mesh(cyl(0.16, TANK_TOP + DOME_H * 0.8 - 0.25, TANK_TOP + 3.2, 24), MAT.steel(), 'centre pusher'));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    sep.add(mesh(cyl(0.07, INTERSTAGE_TOP - 1.6, INTERSTAGE_TOP - 0.9, 16).translate(Math.cos(a) * (R - 0.25), 0, Math.sin(a) * (R - 0.25)), MAT.steel(), 'pneumatic pusher'));
  }
  tanks.add(sep);
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
  engines.add(mesh(cyl(R - 0.1, 1.55, 1.75, 8), MAT.steel(), 'octaweb lower plate'));
  engines.add(mesh(cyl(R - 0.1, 3.7, 3.9, 8), MAT.steel(), 'octaweb upper plate'));
  // Octaweb: an eight-sided thrust structure, bolted together (Wikipedia, Block 5); radial beams between engines.
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) / 8) * Math.PI * 2;
    const beam = mesh(new THREE.BoxGeometry(R - 0.2, 2.0, 0.08).translate((R - 0.2) / 2, 2.72, 0), MAT.alLi(), 'octaweb beam');
    beam.rotation.y = -a;
    engines.add(beam);
  }
  engines.add(mesh(cyl(0.55, 1.75, 3.7, 8, true), MAT.alLi(), 'octaweb centre ring'));
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
    const pusher = [...Array(PUSHER.stages)].map((_, j) => buildPusherStage(j));
    holder.add(...pusher);
    holder.userData.pusher = pusher;
    root.add(holder);
    legs.push(holder);
  }

  // --- cold-gas (nitrogen) thruster pods near the top ---
  const thrusters = group('nitrogen thrusters');
  for (const s of [1, -1]) {
    // Pod between two grid fins on the interstage, with nozzles facing sideways and fore/aft.
    const pod = group('thruster pod');
    pod.add(mesh(new THREE.BoxGeometry(0.3, 0.7, 0.55).translate(R + 0.12, 0, 0), MAT.carbon(), 'pod housing'));
    for (const [dy, dz, rx] of [[0.2, 0.3, Math.PI / 2], [0.2, -0.3, -Math.PI / 2], [-0.2, 0, 0]] as const) {
      const nz = mesh(lathe([[0.03, 0], [0.06, 0.1]], 16), MAT.steel(), 'thruster nozzle');
      if (rx) nz.rotation.x = rx;
      else nz.rotation.z = -Math.PI / 2;
      nz.position.set(R + 0.27, dy, dz);
      pod.add(nz);
    }
    pod.position.y = 44.2;
    pod.rotation.y = s > 0 ? 0 : Math.PI;
    thrusters.add(pod);
  }
  root.add(thrusters);
  const parts = {root, shell, tanks, lox, rp1, engines, fins, legs, thrusters};
  setLegs(parts, 0);
  return parts;
}

/** Pose helpers. fin: 0 stowed → 1 deployed; leg: 0 stowed → 1 deployed. */
export function setFins(b: BoosterParts, k: number) {
  for (const f of b.fins) (f.userData.fin as THREE.Object3D).rotation.z = (Math.PI / 2) * (1 - k);
}
export function setLegs(b: BoosterParts, k: number) {
  const deg = LEG.stowedDeg + (LEG.deployedDeg - LEG.stowedDeg) * k;
  const pose = pusherPose(deg);
  for (const l of b.legs) {
    (l.userData.leg as THREE.Object3D).rotation.z = (-deg * Math.PI) / 180;
    (l.userData.pusher as THREE.Object3D[]).forEach((p, j) => {
      p.position.set(pose[j].x, pose[j].y, 0);
      p.rotation.z = -pose[j].phi;
    });
  }
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
