// Exports the compressor (built by ../compressor.ts) as one glTF model per moving part, for the
// EffectCraft version. EffectCraft has no clipping planes, so every part that the Remotion/HyperFrames
// versions cut live is cut here once, at z = 0, and capped with a real solid "section" face.
// Runs in a browser page (canvas textures, GLTFExporter); see run_export.mjs.
import * as THREE from 'three';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {buildCompressor} from '../compressor';

type Part = {name: string; group: THREE.Group; pivot: [number, number, number]};

const KEY = 0.05; // mm: endpoints closer than this are the same point when chaining cut edges

// Section colours for cut faces, by the colour of the material that was cut.
const capColor = (m: THREE.MeshStandardMaterial) => {
  const hex = m.color.getHexString();
  if (hex.startsWith('c2') || hex.startsWith('c26')) return '#e0a072'; // copper
  if (hex === '17181b') return '#9a9ea5'; // shell steel under the paint
  if (hex === '5f6369') return '#bdb8b0'; // cast iron
  if (hex === '7d838b') return '#c9cdd2'; // laminations
  return '#d9dbde'; // steel
};

/** Clips a mesh's triangles to the half-space s·z ≤ 0 and caps the cut with flat faces. */
function clipAndCap(src: THREE.BufferGeometry, keepFront: boolean) {
  const g = src.index ? src.toNonIndexed() : src.clone();
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  const P = g.getAttribute('position');
  const N = g.getAttribute('normal');
  const U = g.getAttribute('uv');
  const sgn = keepFront ? 1 : -1; // keep where sgn * z >= 0
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const segs: [THREE.Vector3, THREE.Vector3][] = [];
  type V = {p: THREE.Vector3; n: THREE.Vector3; u: THREE.Vector2};
  const get = (i: number): V => ({
    p: new THREE.Vector3().fromBufferAttribute(P, i),
    n: new THREE.Vector3().fromBufferAttribute(N, i),
    u: U ? new THREE.Vector2().fromBufferAttribute(U, i) : new THREE.Vector2(),
  });
  const lerpV = (a: V, b: V, t: number): V => ({p: a.p.clone().lerp(b.p, t), n: a.n.clone().lerp(b.n, t).normalize(), u: a.u.clone().lerp(b.u, t)});
  for (let i = 0; i < P.count; i += 3) {
    const tri = [get(i), get(i + 1), get(i + 2)];
    const d = tri.map((v) => sgn * v.p.z);
    if (d.every((x) => x >= 0)) {
      for (const v of tri) pos.push(v.p.x, v.p.y, v.p.z), nor.push(v.n.x, v.n.y, v.n.z), uv.push(v.u.x, v.u.y);
      continue;
    }
    if (d.every((x) => x <= 0)) continue;
    const out: V[] = [];
    const cut: THREE.Vector3[] = [];
    for (let k = 0; k < 3; k++) {
      const a = tri[k];
      const b = tri[(k + 1) % 3];
      const da = d[k];
      const db = d[(k + 1) % 3];
      if (da >= 0) out.push(a);
      if ((da >= 0) !== (db >= 0)) {
        const v = lerpV(a, b, da / (da - db));
        v.p.z = 0;
        out.push(v);
        cut.push(v.p.clone());
      }
    }
    for (let k = 1; k + 1 < out.length; k++)
      for (const v of [out[0], out[k], out[k + 1]]) pos.push(v.p.x, v.p.y, v.p.z), nor.push(v.n.x, v.n.y, v.n.z), uv.push(v.u.x, v.u.y);
    if (cut.length === 2) segs.push([cut[0], cut[1]]);
  }
  const body = new THREE.BufferGeometry();
  body.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  body.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  body.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));

  // Chain the cut segments into closed loops.
  const key = (v: THREE.Vector3) => `${Math.round(v.x / KEY)},${Math.round(v.y / KEY)}`;
  const adj = new Map<string, {v: THREE.Vector3; to: string[]}>();
  for (const [a, b] of segs) {
    const ka = key(a);
    const kb = key(b);
    if (ka === kb) continue;
    if (!adj.has(ka)) adj.set(ka, {v: a, to: []});
    if (!adj.has(kb)) adj.set(kb, {v: b, to: []});
    adj.get(ka)!.to.push(kb);
    adj.get(kb)!.to.push(ka);
  }
  const used = new Set<string>();
  const loops: THREE.Vector2[][] = [];
  for (const start of adj.keys()) {
    if (used.has(start)) continue;
    const loop: THREE.Vector2[] = [];
    let cur = start;
    let prev = '';
    let closed = false;
    for (let guard = 0; guard < 100000; guard++) {
      used.add(cur);
      const node = adj.get(cur)!;
      loop.push(new THREE.Vector2(node.v.x, node.v.y));
      const next = node.to.find((k) => k !== prev && (!used.has(k) || (k === start && loop.length > 2)));
      if (!next) break;
      if (next === start) {
        closed = true;
        break;
      }
      prev = cur;
      cur = next;
    }
    if (closed && loop.length >= 3) loops.push(loop);
  }
  if (!loops.length) return {body, cap: null as THREE.BufferGeometry | null};
  // Outer contours and holes by nesting depth.
  const inside = (p: THREE.Vector2, poly: THREE.Vector2[]) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++)
      if (poly[i].y > p.y !== poly[j].y > p.y && p.x < ((poly[j].x - poly[i].x) * (p.y - poly[i].y)) / (poly[j].y - poly[i].y) + poly[i].x) c = !c;
    return c;
  };
  const depth = loops.map((l, i) => loops.filter((m, j) => j !== i && inside(l[0], m)).length);
  const cp: number[] = [];
  loops.forEach((outer, i) => {
    if (depth[i] % 2) return;
    const holes = loops.filter((h, j) => depth[j] === depth[i] + 1 && inside(h[0], outer));
    const tris = THREE.ShapeUtils.triangulateShape(outer, holes);
    const all = [...outer, ...holes.flat()];
    for (const [a, b, c] of tris) {
      const A = all[a];
      const B = all[b];
      const C = all[c];
      const area = (B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y);
      const ccw = keepFront ? area < 0 : area > 0; // face +z when the back half is kept
      const order = ccw ? [A, B, C] : [A, C, B];
      for (const v of order) cp.push(v.x, v.y, 0);
    }
  });
  const cap = new THREE.BufferGeometry();
  cap.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3));
  const nz = keepFront ? -1 : 1;
  cap.setAttribute('normal', new THREE.Float32BufferAttribute(new Array((cp.length / 3) * 3).fill(0).map((_, i) => (i % 3 === 2 ? nz : 0)), 3));
  cap.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((cp.length / 3) * 2).fill(0), 2));
  return {body, cap};
}

// glTF wants standard PBR; keep colour, metalness, roughness, opacity and the base-colour map.
const toStd = (m: THREE.Material) => {
  const s = m as THREE.MeshPhysicalMaterial;
  return new THREE.MeshStandardMaterial({
    color: s.color,
    metalness: s.metalness,
    roughness: s.roughness,
    map: s.map ?? null,
    transparent: s.transparent && s.opacity < 1,
    opacity: s.opacity,
    side: THREE.FrontSide,
  });
};

/** Copies a mesh into `into` (geometry baked into `frame` space), cutting it when its material was cut. */
function addMesh(into: THREE.Group, mesh: THREE.Mesh, frame: THREE.Matrix4, keepFront: boolean | null) {
  const mat = mesh.material as THREE.MeshStandardMaterial;
  if (mat.side === THREE.BackSide) return; // the live version's flat cap trick: replaced by real caps
  if ((mat as THREE.Material).type === 'MeshBasicMaterial' || (mat as THREE.Material).type === 'ShadowMaterial') return;
  const m = new THREE.Matrix4().copy(frame).invert().multiply(mesh.matrixWorld);
  const geo = mesh.geometry.clone().applyMatrix4(m);
  const cut = keepFront !== null && !!mat.clippingPlanes && mat.clippingPlanes.length > 0;
  if (!cut) {
    into.add(new THREE.Mesh(geo, toStd(mat)));
    return;
  }
  const {body, cap} = clipAndCap(geo, keepFront!);
  if (mesh.userData.innerColor && body.getAttribute('position').count) {
    // Thick shell: faces whose normal points toward the axis are the inside (bare grey steel).
    const [outer, inner] = splitByNormal(body);
    into.add(new THREE.Mesh(outer, toStd(mat)));
    into.add(new THREE.Mesh(inner, new THREE.MeshStandardMaterial({color: mesh.userData.innerColor, metalness: 0.55, roughness: 0.55})));
  } else if (body.getAttribute('position').count) into.add(new THREE.Mesh(body, toStd(mat)));
  if (cap) into.add(new THREE.Mesh(cap, new THREE.MeshStandardMaterial({color: capColor(mat), metalness: 0.15, roughness: 0.8})));
}

/** Splits a non-indexed geometry into outward-facing and axis-facing triangles. */
function splitByNormal(g: THREE.BufferGeometry) {
  const P = g.getAttribute('position');
  const N = g.getAttribute('normal');
  const U = g.getAttribute('uv');
  const parts = [{p: [] as number[], n: [] as number[], u: [] as number[]}, {p: [] as number[], n: [] as number[], u: [] as number[]}];
  for (let i = 0; i < P.count; i += 3) {
    let d = 0;
    for (let k = 0; k < 3; k++) d += N.getX(i + k) * P.getX(i + k) + N.getZ(i + k) * P.getZ(i + k) + N.getY(i + k) * (P.getY(i + k) - 100) * 0.3;
    const t = parts[d < 0 ? 1 : 0];
    for (let k = 0; k < 3; k++) {
      t.p.push(P.getX(i + k), P.getY(i + k), P.getZ(i + k));
      t.n.push(N.getX(i + k), N.getY(i + k), N.getZ(i + k));
      t.u.push(U ? U.getX(i + k) : 0, U ? U.getY(i + k) : 0);
    }
  }
  return parts.map((t) => {
    const o = new THREE.BufferGeometry();
    o.setAttribute('position', new THREE.Float32BufferAttribute(t.p, 3));
    o.setAttribute('normal', new THREE.Float32BufferAttribute(t.n, 3));
    o.setAttribute('uv', new THREE.Float32BufferAttribute(t.u, 2));
    return o;
  });
}

/** A closed, 2.5 mm thick shell (outer surface up, inner surface down) so the cut gets a real edge. */
function thickShell(paint: THREE.Mesh) {
  // Rebuild from the paint mesh's lathe parameters.
  const lathe = paint.geometry as THREE.LatheGeometry;
  const pts = (lathe.parameters.points as THREE.Vector2[]).map((p) => p.clone());
  const inner = pts.map((p) => new THREE.Vector2(Math.max(0.01, p.x - 2.5), p.y + (p.y < 60 ? 2.5 : p.y > 150 ? -2.5 : 0))).reverse();
  const g = new THREE.LatheGeometry([...pts, ...inner, pts[0].clone()], 128);
  g.scale(1, 1, 0.8);
  g.computeVertexNormals();
  return g;
}

export async function exportParts() {
  const model = buildCompressor();
  model.update(0); // rest pose: closed shell (slice plane far away), assembled, crank at rest
  const root = model.root;
  root.scale.setScalar(1); // export in millimetres
  root.updateMatrixWorld(true);
  // The clipping-plane flag on each material says what was cut; the plane itself isn't exported.
  const byName = (o: THREE.Object3D) => o as THREE.Group;
  const children = root.children;
  // Groups in the order buildCompressor adds them.
  const groups = children.filter((c) => c.type === 'Group') as THREE.Group[];
  const [stator, rotorOff, pump, plate, head, muffler] = groups.map(byName);
  const crank = rotorOff.children[0] as THREE.Group;
  const pumpSubs = pump.children.filter((c) => c.type === 'Group') as THREE.Group[];
  const [piston, rod] = pumpSubs;
  const pivots = plate.children.filter((c) => c.type === 'Group') as THREE.Group[];
  const [sucPivot, disPivot] = pivots;

  const ident = new THREE.Matrix4();
  const parts: Part[] = [];
  const make = (name: string, objs: THREE.Object3D[], frameObj: THREE.Object3D | null, keepFront: boolean | null, skip: (o: THREE.Object3D) => boolean = () => false) => {
    const g = new THREE.Group();
    g.name = name;
    const frame = frameObj ? frameObj.matrixWorld.clone() : ident;
    for (const o of objs)
      o.traverse((x) => {
        if (skip(x)) return;
        if ((x as THREE.Mesh).isMesh && !(x as THREE.InstancedMesh).isInstancedMesh) addMesh(g, x as THREE.Mesh, frame, keepFront);
      });
    const p = new THREE.Vector3().setFromMatrixPosition(frame);
    parts.push({name, group: g, pivot: [p.x, p.y, p.z]});
  };
  const inside = (o: THREE.Object3D, anc: THREE.Object3D) => {
    for (let x: THREE.Object3D | null = o; x; x = x.parent) if (x === anc) return true;
    return false;
  };

  // Static body: everything at root level except the shell surfaces, the live-only helpers and gas.
  const meshes = children.filter((c) => (c as THREE.Mesh).isMesh) as THREE.Mesh[];
  const paint = meshes[0];
  const loose = meshes.filter((m) => {
    if (m === paint) return false;
    const mat = m.material as THREE.Material;
    if ((m as THREE.InstancedMesh).isInstancedMesh) return false;
    if (mat.type === 'ShadowMaterial' || mat.type === 'MeshBasicMaterial') return false; // ground, blob
    if ((mat as THREE.MeshStandardMaterial).side === THREE.BackSide) return false; // shell inside
    if ((mat as THREE.MeshStandardMaterial).emissive && m.geometry.type === 'BufferGeometry' && !m.geometry.getAttribute('position')) return false; // rim
    return m.geometry.getAttribute('position') !== undefined;
  });
  const shellMesh = new THREE.Mesh(thickShell(paint), paint.material);
  shellMesh.userData.innerColor = '#7b8087';
  shellMesh.updateMatrixWorld(true);
  const disTube = loose.find((m) => m.geometry.type === 'TubeGeometry' && (m.geometry as THREE.TubeGeometry).parameters.tubularSegments === 240 && (m.geometry as THREE.TubeGeometry).parameters.radius === 2.6);
  make('body', [shellMesh, ...loose.filter((m) => m !== disTube)], null, false);
  make('shellFront', [shellMesh], null, true);
  make('stator', [stator], null, false);
  make('crank', [crank], crank, null, (x) => (x as THREE.Mesh).isMesh && ((x as THREE.Mesh).material as THREE.Material).transparent === true);
  make('pump', [pump], null, false, (x) => inside(x, piston) || inside(x, rod));
  make('piston', [piston], piston, null);
  make('rod', [rod], rod, null);
  make('plate', [plate], null, false, (x) => inside(x, sucPivot) || inside(x, disPivot));
  make('reedSuc', [sucPivot], sucPivot, null);
  make('reedDis', [disPivot], disPivot, null);
  make('head', [head], null, false);
  make('muffler', [muffler], null, null);
  // The muffler goes see-through in the close-up (layer opacity), so it needs glTF alpha blending.
  parts[parts.length - 1].group.traverse((x) => {
    const m = (x as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (m) m.transparent = true;
  });
  if (disTube) make('distube', [disTube], null, null);

  const exporter = new GLTFExporter();
  const out: Record<string, string> = {};
  for (const p of parts) {
    const buf = (await exporter.parseAsync(p.group, {binary: true})) as ArrayBuffer;
    let s = '';
    const u = new Uint8Array(buf);
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
    out[p.name] = btoa(s);
  }
  return {glb: out, pivots: Object.fromEntries(parts.map((p) => [p.name, p.pivot]))};
}

(window as unknown as {exportParts: typeof exportParts}).exportParts = exportParts;
