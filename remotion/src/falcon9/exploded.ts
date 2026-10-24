// Exploded Falcon 9 for the thumbnail: every component as its own model, already laid horizontal (nose to the
// right) and pulled apart, plus label anchors (exploded.json). EffectCraft then only places models at the origin.
// node src/three-tools/run_glb_export.mjs src/falcon9/exploded.ts <out-dir>
import * as THREE from 'three';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {FILL, buildBooster, buildUpperStack, setFins, setLegs} from './model';

// A component: meshes whose own or an ancestor's name matches, moved along the axis (dy) and sideways (dx, dz
// in rocket space; -x ends up as "up" on screen once the rocket is laid on its side).
type Part = {id: string; label: string; match: RegExp; src: 'b' | 'u'; dy: number; dx?: number; dz?: number; side: 'up' | 'down'; perLeg?: boolean};
const PARTS: Part[] = [
  {id: 'engines', label: '9 Merlin 1D engines', match: /^merlin/, src: 'b', dy: -12, side: 'down'},
  {id: 'heat_shield', label: 'Heat shield', match: /^heat shield$/, src: 'b', dy: -8.5, side: 'up'},
  {id: 'octaweb', label: 'Octaweb thrust structure', match: /^octaweb/, src: 'b', dy: -5.5, side: 'down'},
  {id: 'engine_section', label: 'Engine section', match: /^engine section$/, src: 'b', dy: -2.5, side: 'up'},
  {id: 'rp1', label: 'RP-1 kerosene', match: /^RP-1 fill/, src: 'b', dy: 0, side: 'down'},
  {id: 'aft_dome', label: 'Aft dome', match: /^RP-1 aft dome$/, src: 'b', dy: -1.2, side: 'up'},
  {id: 'transfer_tube', label: 'LOX transfer tube', match: /^transfer tube/, src: 'b', dy: 0, dx: 6.5, side: 'down'},
  {id: 'common_dome', label: 'Common dome', match: /^common dome$/, src: 'b', dy: 2.5, side: 'up'},
  {id: 'lox', label: 'Liquid oxygen', match: /^LOX fill/, src: 'b', dy: 4.5, side: 'down'},
  {id: 'copvs', label: 'Helium tanks (COPVs)', match: /^helium COPVs$/, src: 'b', dy: 4.5, dx: 6.5, side: 'down'},
  {id: 'fwd_dome', label: 'Forward dome', match: /^LOX forward dome$/, src: 'b', dy: 6.5, side: 'up'},
  {id: 'skin', label: 'Aluminium-lithium tank skin', match: /^(tank skin|weld seam|raceway)$/, src: 'b', dy: 3, dx: -7, side: 'up'},
  {id: 'pushers', label: 'Separation pushers & latches', match: /^stage separation pushers$/, src: 'b', dy: 9, side: 'down'},
  {id: 'interstage', label: 'Interstage', match: /^interstage$/, src: 'b', dy: 11, side: 'up'},
  {id: 'thrusters', label: 'Nitrogen thrusters', match: /^nitrogen thrusters$/, src: 'b', dy: 11, dx: 4.5, side: 'down'},
  {id: 'fins', label: 'Titanium grid fins', match: /^grid fin \d$/, src: 'b', dy: 11, side: 'up', perLeg: true},
  {id: 'legs', label: 'Landing legs', match: /^leg \d$/, src: 'b', dy: -1, side: 'down', perLeg: true},
  {id: 'mvac', label: 'Merlin Vacuum engine', match: /^Merlin Vacuum nozzle$/, src: 'u', dy: 18, side: 'down'},
  {id: 'stage2', label: 'Second stage', match: /^second stage$/, src: 'u', dy: 21, side: 'up'},
  {id: 'fairing', label: 'Payload fairing', match: /^fairing$/, src: 'u', dy: 25, side: 'down'},
];
// Radial push for the legs and fins (each moves outward along its own direction).
const RADIAL = {legs: 3.2, fins: 2.6};
// Lay the rocket on its side: rocket +y -> screen right.
const LAY = new THREE.Matrix4().makeRotationZ(-Math.PI / 2);

function hits(o: THREE.Object3D, re: RegExp) {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (re.test(p.name)) return p;
  return null;
}

export async function exportParts() {
  const b = buildBooster();
  setFins(b, 1);
  setLegs(b, 0);
  // Fills full, as on the pad.
  b.rp1.scale.y = 1; b.lox.scale.y = 1;
  b.root.updateMatrixWorld(true);
  const u = buildUpperStack();
  u.updateMatrixWorld(true);
  const models: Record<string, THREE.Object3D> = {};
  const labels: {id: string; label: string; at: number[]; side: string}[] = [];
  for (const p of PARTS) {
    const out = new THREE.Group();
    const box = new THREE.Box3();
    const src = p.src === 'b' ? b.root : u;
    src.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const owner = hits(m, p.match);
      if (!owner) return;
      const off = new THREE.Vector3(p.dx || 0, p.dy, p.dz || 0);
      if (p.perLeg) {
        // Outward along the holder's own direction (its world position, flattened).
        const w = new THREE.Vector3().setFromMatrixPosition(owner.matrixWorld);
        const dir = new THREE.Vector3(w.x, 0, w.z).normalize();
        off.addScaledVector(dir, p.id === 'legs' ? RADIAL.legs : RADIAL.fins);
      }
      const mat = new THREE.Matrix4().multiplyMatrices(LAY, new THREE.Matrix4().makeTranslation(off.x, off.y, off.z).multiply(m.matrixWorld));
      const geo = m.geometry.clone().applyMatrix4(mat);
      const mm = (m.material as THREE.MeshStandardMaterial).clone();
      mm.side = THREE.DoubleSide;
      out.add(new THREE.Mesh(geo, mm));
      geo.computeBoundingBox();
      box.union(geo.boundingBox!);
    });
    if (!out.children.length) throw new Error(`exploded part matched nothing: ${p.id}`);
    models[`x_${p.id}`] = out;
    const c = box.getCenter(new THREE.Vector3());
    // Anchor on the edge facing its label (top edge for "up", bottom edge for "down").
    labels.push({id: p.id, label: p.label, at: [c.x, p.side === 'up' ? box.max.y : box.min.y, c.z], side: p.side});
  }
  const exporter = new GLTFExporter();
  const glb: Record<string, string> = {};
  for (const [name, obj] of Object.entries(models)) {
    const buf = (await exporter.parseAsync(obj, {binary: true})) as ArrayBuffer;
    const a = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000));
    glb[name] = btoa(s);
  }
  return {glb, rig: {labels, fill: FILL}};
}

(window as unknown as {exportParts: typeof exportParts}).exportParts = exportParts;
