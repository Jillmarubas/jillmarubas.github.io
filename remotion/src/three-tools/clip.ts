// Cutting tools for exporting 3D parts to tools without clipping planes (EffectCraft):
// clip a closed mesh at z = 0 and cap the cut with a real flat face.
// Shared by the compressor cutaway and the Falcon 9 episode.
import * as THREE from 'three';

export const KEY = 0.05; // default join tolerance (the compressor is modelled in mm)

/** Clips a mesh's triangles to the half-space s·z ≤ 0 and caps the cut with flat faces. */
/** tol: endpoints closer than this (model units) are one point when chaining cut edges. */
export function clipAndCap(src: THREE.BufferGeometry, keepFront: boolean, tol = KEY) {
  const g = src.index ? src.toNonIndexed() : src.clone();
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  const P = g.getAttribute('position') as THREE.BufferAttribute;
  const N = g.getAttribute('normal') as THREE.BufferAttribute;
  const U = g.getAttribute('uv') as THREE.BufferAttribute | undefined;
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
  const key = (v: THREE.Vector3) => `${Math.round(v.x / tol)},${Math.round(v.y / tol)}`;
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

/** Splits a non-indexed geometry into outward-facing and axis-facing triangles. */
export function splitByNormal(g: THREE.BufferGeometry) {
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

