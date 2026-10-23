// Exports the Falcon 9 parts (model.ts) as glTF models for EffectCraft, one file per animated part,
// plus "_cut" versions (back half only, z <= 0, with solid section faces) for the cutaway shots.
// Runs in a browser page: node src/three-tools/run_glb_export.mjs src/falcon9/export.ts <out-dir>
import * as THREE from 'three';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {clipAndCap} from '../three-tools/clip';
import {LEG, PUSHER, buildBooster, buildBus, buildBuilding, buildDroneship, buildGridFin, buildLeg, buildMerlin, buildPusherStage, buildTechnician, buildUpperStack, setLegs} from './model';

const CUT_TOL = 0.0005; // metres

// Section colour for a cut face: a lighter tone of what was cut.
const capMat = (m: THREE.MeshStandardMaterial) =>
  new THREE.MeshStandardMaterial({color: m.color.clone().lerp(new THREE.Color('#ffffff'), 0.45), metalness: 0.1, roughness: 0.8, name: `${m.name} (cut)`, transparent: m.transparent, opacity: m.opacity});

/** Copies every mesh under `src` into a new group, baked into `frame` space; optionally cut at z = 0. */
function bake(src: THREE.Object3D, frame: THREE.Object3D | null, cut: 'none' | 'back' = 'none') {
  src.updateMatrixWorld(true);
  const inv = frame ? frame.matrixWorld.clone().invert() : new THREE.Matrix4();
  const out = new THREE.Group();
  src.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = m.material as THREE.MeshStandardMaterial;
    const geo = m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
    if (cut === 'none') {
      out.add(new THREE.Mesh(geo, mat));
      return;
    }
    const {body, cap} = clipAndCap(geo, false, CUT_TOL);
    if (body.getAttribute('position').count) {
      // Cut open surfaces must show their inside.
      const m2 = mat.clone();
      if (!cap) m2.side = THREE.DoubleSide;
      out.add(new THREE.Mesh(body, m2));
    }
    if (cap) out.add(new THREE.Mesh(cap, capMat(mat)));
  });
  return out;
}

export async function exportParts() {
  const parts: Record<string, THREE.Object3D> = {};
  const rig: Record<string, unknown> = {};

  const b = buildBooster();
  b.root.updateMatrixWorld(true);
  // Tank domes are open surfaces: show both sides.
  b.tanks.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (m) m.side = THREE.DoubleSide;
  });
  parts.booster_shell = bake(b.shell, null);
  parts.booster_shell_cut = bake(b.shell, null, 'back');
  parts.booster_tanks = bake(b.tanks, null);
  parts.booster_tanks_cut = bake(b.tanks, null, 'back');
  parts.lox = bake(b.lox, b.lox);
  parts.lox_cut = bake(b.lox, b.lox, 'back');
  parts.rp1 = bake(b.rp1, b.rp1);
  parts.rp1_cut = bake(b.rp1, b.rp1, 'back');
  parts.engines = bake(b.engines, null);
  parts.thrusters = bake(b.thrusters, null);
  rig.lox = b.lox.position.toArray();
  rig.rp1 = b.rp1.position.toArray();
  rig.fins = b.fins.map((h) => ({pos: h.position.toArray(), yaw: h.rotation.y}));
  rig.legs = b.legs.map((h) => ({pos: h.position.toArray(), yaw: h.rotation.y}));

  parts.grid_fin = bake(buildGridFin(), null);
  parts.leg = bake(buildLeg(), null);
  for (let j = 0; j < PUSHER.stages; j++) parts[`leg_pusher_${j + 1}`] = bake(buildPusherStage(j), null);
  rig.leg = LEG;
  rig.pusher = PUSHER;
  // Height of the booster origin above the ground when it stands on deployed legs.
  setLegs(b, 1);
  b.root.updateMatrixWorld(true);
  let minY = Infinity;
  for (const l of b.legs) minY = Math.min(minY, new THREE.Box3().setFromObject(l).min.y);
  rig.standY = -minY;

  const up = buildUpperStack();
  parts.upper_stack = bake(up, null);
  parts.upper_stack_cut = bake(up, null, 'back');

  // Merlin: the whole engine, plus each part in place (assembled positions baked in) for the exploded view.
  const merlin = buildMerlin();
  merlin.updateMatrixWorld(true);
  parts.merlin = bake(merlin, null);
  for (const child of merlin.children) parts[`merlin_${child.name.replace(/\s+/g, '_')}`] = bake(child, null);

  parts.technician = bake(buildTechnician(), null);
  parts.bus = bake(buildBus(), null);
  parts.building = bake(buildBuilding(14), null);
  parts.droneship = bake(buildDroneship(), null);

  const exporter = new GLTFExporter();
  const glb: Record<string, string> = {};
  for (const [name, obj] of Object.entries(parts)) {
    const buf = (await exporter.parseAsync(obj, {binary: true})) as ArrayBuffer;
    const u = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
    glb[name] = btoa(s);
  }
  return {glb, rig};
}

(window as unknown as {exportParts: typeof exportParts}).exportParts = exportParts;
