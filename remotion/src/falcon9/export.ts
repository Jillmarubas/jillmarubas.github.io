// Exports the Falcon 9 parts (model.ts) as glTF models for EffectCraft, one file per animated part,
// plus "_cut" versions (back half only, z <= 0, with solid section faces) for the cutaway shots.
// Runs in a browser page: node src/three-tools/run_glb_export.mjs src/falcon9/export.ts <out-dir>
import * as THREE from 'three';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {clipAndCap} from '../three-tools/clip';
import {FILL, FLUID, HIGHLIGHT, LEG, PUSHER, R, SEAM_YS, buildBooster, buildBus, buildBuilding, buildDroneship, buildGridFin, buildLeg, buildMerlin, buildPusherStage, buildTechnician, buildUpperStack, setFins, setLegs} from './model';

const CUT_TOL = 0.0005; // metres

// Section colour for a cut face: a lighter tone of what was cut.
// Fluids keep their full colour on the cut face, so each propellant reads as one strong colour.
const capMat = (m: THREE.MeshStandardMaterial) =>
  /liquid oxygen|RP-1|highlight/.test(m.name)
    ? new THREE.MeshStandardMaterial({color: m.color.clone(), emissive: m.emissive.clone(), emissiveIntensity: m.emissiveIntensity * 1.6, metalness: 0, roughness: 0.6, name: `${m.name} (cut)`})
    : new THREE.MeshStandardMaterial({color: m.color.clone().lerp(new THREE.Color('#ffffff'), 0.45), metalness: 0.1, roughness: 0.8, name: `${m.name} (cut)`, transparent: m.transparent, opacity: m.opacity});

/** Copies every mesh under `src` into a new group, baked into `frame` space; optionally cut at z = 0. */
function bake(src: THREE.Object3D, frame: THREE.Object3D | null, cut: 'none' | 'back' | 'front' = 'none') {
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
    const {body, cap} = clipAndCap(geo, cut === 'front', CUT_TOL);
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

// ---------- highlights ----------
// A highlight is a glowing copy of a part, grown by `pad` metres on every side so it never shares a surface
// with the part (shared surfaces z-fight and flicker). EffectCraft fades its layer opacity on the spoken word.
const hlMat = (color: string) =>
  new THREE.MeshStandardMaterial({color, emissive: color, emissiveIntensity: 0.9, metalness: 0, roughness: 0.6, name: `highlight ${color}`});
function grow(geo: THREE.BufferGeometry, pad: number) {
  geo.computeBoundingBox();
  const b = geo.boundingBox!;
  const c = b.getCenter(new THREE.Vector3());
  const sz = b.getSize(new THREE.Vector3());
  const k = (v: number) => (v > 1e-6 ? (v + 2 * pad) / v : 1);
  geo.translate(-c.x, -c.y, -c.z).scale(k(sz.x), k(sz.y), k(sz.z)).translate(c.x, c.y, c.z);
  return geo;
}
/** Meshes under `src` whose own name or an ancestor's name matches `match`, baked into `frame` space and grown. */
function bakeHighlight(src: THREE.Object3D, frame: THREE.Object3D | null, match: RegExp | null, color: string, pad: number, cut: 'none' | 'back') {
  src.updateMatrixWorld(true);
  const inv = frame ? frame.matrixWorld.clone().invert() : new THREE.Matrix4();
  const out = new THREE.Group();
  const mat = hlMat(color);
  src.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    let hit = match === null;
    for (let p: THREE.Object3D | null = m; p && !hit; p = p.parent) hit = match!.test(p.name);
    if (!hit) return;
    let geo = grow(m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld)), pad);
    const mm = mat.clone();
    mm.side = THREE.DoubleSide;
    if (cut === 'back') {
      // Cut at z = +pad, so the highlight's own section face sits just in front of the part's (z = 0).
      geo.translate(0, 0, -pad);
      const {body, cap} = clipAndCap(geo, false, CUT_TOL);
      if (!body.getAttribute('position').count) return;
      body.translate(0, 0, pad);
      out.add(new THREE.Mesh(body, mm));
      if (cap) out.add(new THREE.Mesh(cap.translate(0, 0, pad), mm));
      return;
    }
    out.add(new THREE.Mesh(geo, mm));
  });
  if (!out.children.length) throw new Error(`highlight matched nothing: ${match}`);
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
  // Front halves, which slide off toward the camera when a cutaway opens.
  parts.booster_shell_front = bake(b.shell, null, 'front');
  parts.booster_tanks_front = bake(b.tanks, null, 'front');
  // Helium in the space the propellant leaves (ullage): a violet column per tank, base at its own origin.
  const he = new THREE.MeshStandardMaterial({color: FLUID.helium, emissive: FLUID.helium, emissiveIntensity: 0.35, roughness: 0.6, transparent: true, opacity: 0.45, side: THREE.DoubleSide, name: 'helium'});
  for (const [k, src] of [['ullage_lox', b.lox], ['ullage_rp1', b.rp1]] as const) {
    const m = new THREE.Mesh((src.geometry as THREE.BufferGeometry).clone().scale(0.995, 1, 0.995), he);
    parts[k] = bake(m, m);
    parts[`${k}_cut`] = bake(m, m, 'back');
  }
  parts.lox = bake(b.lox, b.lox);
  parts.lox_cut = bake(b.lox, b.lox, 'back');
  parts.rp1 = bake(b.rp1, b.rp1);
  parts.rp1_cut = bake(b.rp1, b.rp1, 'back');
  // Fixed bowl and crown pieces of each fill (booster space).
  for (const [k, n] of [['lox_base', 'LOX fill base'], ['lox_crown', 'LOX fill crown'], ['rp1_base', 'RP-1 fill base'], ['rp1_crown', 'RP-1 fill crown']]) {
    const m = b.fills.getObjectByName(n)!;
    parts[k] = bake(m, null);
    parts[`${k}_cut`] = bake(m, null, 'back');
  }
  parts.engines = bake(b.engines, null);
  // The thrust structure without the engines, for shots where each Merlin moves on its own (gimbal, engine out).
  const frame = new THREE.Group();
  for (const c of b.engines.children) if (!/^merlin/.test(c.name)) frame.add(c.clone());
  parts.engines_frame = bake(frame, null);
  rig.engines = b.engines.children.filter((c) => /^merlin/.test(c.name)).map((c) => ({name: c.name, pos: c.position.toArray(), scale: c.scale.x}));
  parts.thrusters = bake(b.thrusters, null);
  rig.lox = b.lox.position.toArray();
  rig.rp1 = b.rp1.position.toArray();
  rig.fill = FILL;
  rig.fins = b.fins.map((h) => ({pos: h.position.toArray(), yaw: h.rotation.y}));
  rig.legs = b.legs.map((h) => ({pos: h.position.toArray(), yaw: h.rotation.y}));

  // Highlights on the booster (booster space; name, mesh-name pattern, colour, pad in metres).
  const O = HIGHLIGHT;
  const boosterHl: [string, THREE.Object3D, RegExp, string, number][] = [
    ['interstage', b.shell, /^interstage$/, O, 0.03],
    ['tank_skin', b.shell, /^tank skin$/, O, 0.03],
    ['raceway', b.shell, /^raceway$/, O, 0.03],
    ['engine_section', b.shell, /^engine section$/, O, 0.03],
    ['common_dome', b.tanks, /^common dome$/, O, 0.04],
    ['transfer_tube', b.tanks, /^transfer tube/, FLUID.lox, 0.03],
    ['copvs', b.tanks, /^COPV$/, FLUID.helium, 0.03],
    ['stringers', b.tanks, /^stringer$/, O, 0.012],
    ['pushers', b.tanks, /pusher$/, O, 0.03],
    ['latches', b.tanks, /^separation latch$/, O, 0.03],
    ['lox', b.root, /^LOX fill/, FLUID.lox, 0.02], // a full tank
    ['rp1', b.root, /^RP-1 fill/, FLUID.rp1, 0.02],
    ['engines', b.engines, /^merlin/, O, 0.025],
    ['engine_centre', b.engines, /^merlin centre$/, O, 0.025],
    ['engines_three', b.engines, /^merlin (centre|1|5)$/, O, 0.025],
    ['engines_outer', b.engines, /^merlin [1-8]$/, O, 0.025],
    ['octaweb', b.engines, /^octaweb/, O, 0.03],
    ['heat_shield', b.engines, /^heat shield$/, O, 0.03],
    ['gimbals', b.engines, /^gimbal actuators$/, O, 0.015],
    ['thrusters', b.thrusters, /^thruster pod$/, FLUID.nitrogen, 0.03],
  ];
  for (const [name, src, re, col, pad] of boosterHl) {
    parts[`hl_${name}`] = bakeHighlight(src, null, re, col, pad, 'none');
    parts[`hl_${name}_cut`] = bakeHighlight(src, null, re, col, pad, 'back');
  }
  // Fill highlights that drain with the fuel: the column in its own space (scale it like the fill) plus the bowl.
  for (const [k, col, n] of [['lox', FLUID.lox, 'LOX fill'], ['rp1', FLUID.rp1, 'RP-1 fill']] as const) {
    const column = k === 'lox' ? b.lox : b.rp1;
    parts[`hl_${k}_column`] = bakeHighlight(column, column, null, col, 0.02, 'none');
    parts[`hl_${k}_column_cut`] = bakeHighlight(column, column, null, col, 0.02, 'back');
    const base = b.fills.getObjectByName(`${n} base`)!;
    parts[`hl_${k}_base`] = bakeHighlight(base, null, null, col, 0.02, 'none');
    parts[`hl_${k}_base_cut`] = bakeHighlight(base, null, null, col, 0.02, 'back');
  }
  // Weld seams get their own fatter rings (growing a thin ring would only move it outward).
  const seams = new THREE.Group();
  for (const y of SEAM_YS) seams.add(new THREE.Mesh(new THREE.TorusGeometry(R + 0.006, 0.04, 8, 128).rotateX(Math.PI / 2).translate(0, y, 0), hlMat(O)));
  parts.hl_weld_seams = seams;
  parts.hl_weld_seams_cut = bakeHighlight(seams, null, null, O, 0.01, 'back');

  // Whole boosters as one rigid model (no fills), for shots that turn the booster: EffectCraft 0.14 does not
  // compose 3D rotations through parents, so fins and legs (which carry their own angles) must be baked in.
  for (const [k, fin, leg] of [['stowed', 0, 0], ['finsout', 1, 0], ['landed', 1, 1]] as const) {
    const a = buildBooster();
    setFins(a, fin);
    setLegs(a, leg);
    a.root.remove(a.lox, a.rp1, a.fills);
    a.root.updateMatrixWorld(true);
    parts[`assembly_${k}`] = bake(a.root, null);
    parts[`assembly_${k}_cut`] = bake(a.root, null, 'back');
    if (k === 'landed') parts.hl_leg1_landed_red = bakeHighlight(a.root, null, /^leg 1$/, '#dc2a1e', 0.03, 'none'); // the 2024 failed leg
    if (k === 'finsout') parts.hl_fins_out = bakeHighlight(a.root, null, /^grid fin \d$/, O, 0.03, 'none'); // all four, rigid
  }
  parts.grid_fin = bake(buildGridFin(), null);
  parts.hl_grid_fin = bakeHighlight(buildGridFin(), null, null, O, 0.025, 'none');
  parts.hl_leg = bakeHighlight(buildLeg(), null, null, O, 0.03, 'none');
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
  parts.hl_upper_stack = bakeHighlight(up, null, null, O, 0.04, 'none');
  parts.hl_second_stage = bakeHighlight(up, null, /^(second stage|Merlin Vacuum nozzle)$/, O, 0.04, 'none');

  // Merlin: the whole engine, plus each part in place (assembled positions baked in) for the exploded view.
  const merlin = buildMerlin();
  merlin.updateMatrixWorld(true);
  parts.merlin = bake(merlin, null);
  parts.hl_merlin = bakeHighlight(merlin, null, null, O, 0.02, 'none');
  parts.hl_merlin_red = bakeHighlight(merlin, null, null, '#dc2a1e', 0.02, 'none');
  for (const child of merlin.children) {
    const n = child.name.replace(/\s+/g, '_');
    parts[`merlin_${n}`] = bake(child, null);
    parts[`hl_merlin_${n}`] = bakeHighlight(child, null, null, O, 0.012, 'none');
  }
  // The propellant lines highlight in their fluid's colour.
  parts.hl_merlin_lox_line = bakeHighlight(merlin, null, /^LOX line$/, FLUID.lox, 0.012, 'none');
  parts.hl_merlin_fuel_line = bakeHighlight(merlin, null, /^fuel line$/, FLUID.rp1, 0.012, 'none');

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
