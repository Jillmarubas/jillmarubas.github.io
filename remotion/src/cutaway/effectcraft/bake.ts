// Bakes the compressor cutaway's animation, frame by frame, into anim.jsx for the EffectCraft build.
// Same maths as the Remotion and HyperFrames versions (../compressor.ts), so all three match.
// node: npx esbuild bake.ts --bundle --platform=node ... (see build.sh)
import fs from 'node:fs';
import * as THREE from 'three';
import {DURATION_S, FPS, MM, P_DIS, P_SUC, T, anchors, camAt, crankPhi, explodeK, gasState, offset, outQ, prog, speedUp} from '../compressor';

export const S = 4; // EffectCraft px per model millimetre (Model Scale)
const OX = 960;
const OY = 540;
// World millimetres (three.js, +Y up, +Z to the camera) -> EffectCraft comp space (+Y down, +Z away).
const ec = (x: number, y: number, z: number) => [+(OX + S * x).toFixed(3), +(OY - S * y).toFixed(3), +(-S * z).toFixed(3)];
const ecV = (v: THREE.Vector3) => ec(v.x, v.y, v.z);
const unitsToMm = (v: THREE.Vector3) => v.clone().multiplyScalar(1 / MM);

const R_CRANK = 8;
const L_ROD = 40;
const Y_AX = 133;
const X_VP = -62;
const BORE = 12;
const pinX = (phi: number) => {
  const th = phi + Math.PI;
  return R_CRANK * Math.cos(th) - Math.sqrt(L_ROD * L_ROD - Math.pow(R_CRANK * Math.sin(th), 2));
};
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const win = (s: number, t0: number, t1: number, fadeIn = 0.55, fadeOut = 0.3) => Math.min(prog(s, t0, fadeIn), 1 - prog(s, t1 - fadeOut, fadeOut));

// Gas paths (same points as compressor.ts), in pump space.
const cr = (pts: number[][]) => new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'centripetal');
const disTubePts = [[-72, 125, -21], [-70, 116, -44], [-40, 108, -66], [0, 104, -76], [40, 100, -66], [62, 93, -44], [44, 86, -66], [0, 80, -78], [-46, 76, -76], [-78, 72, -62], [-92, 70, -56], [-126, 70, -75]];
const sucCurve = cr([[-58, 100, -46], [-58, 122, -40], [-66, 146, -36], [-72, 146, -22], [-72, 145, -6], [-66, 145, 0], [-60, 144, 0], [-55, 140, 0]]);
const disPath = cr([[-58, 128, 0], [-63.5, 124, 0], [-70, 123, 0], [-72, 124, -12], ...disTubePts]);

export const N_CYL = 40;
export const N_SUC = 16;
export const N_DIS = 40;
const COLD = new THREE.Color('#1f6fff');
const HOT = new THREE.Color('#ff3b12');

const frames = Math.round(DURATION_S * FPS);
const out: Record<string, number[][] | number[]> = {};
const push = (k: string, v: number[] | number) => {
  if (!out[k]) out[k] = [];
  (out[k] as unknown[]).push(v);
};

for (let f = 0; f < frames; f++) {
  const s = f / FPS;
  const c = camAt(s);
  push('camPos', ecV(unitsToMm(c.pos)));
  push('camPoi', ecV(unitsToMm(c.target)));
  for (const k of ['stator', 'rotor', 'pump', 'plate', 'head', 'muffler']) push(k, ecV(offset(s, k)));
  const pump = offset(s, 'pump');
  const plate = offset(s, 'plate');
  const phi = crankPhi(s);
  const th = phi + Math.PI;
  push('crankAngle', +((th * 180) / Math.PI).toFixed(4)); // three rotation.y = -th
  const xp = pinX(phi);
  push('piston', ec(xp - 1 + pump.x, Y_AX + pump.y, pump.z));
  const px = R_CRANK * Math.cos(th);
  const pz = R_CRANK * Math.sin(th);
  push('rod', ec(px + pump.x, Y_AX + pump.y, pz + pump.z));
  push('rodAngle', +((Math.atan2(pz, xp - px) * 180) / Math.PI).toFixed(4)); // three rotation.y
  const gas = gasState(phi);
  const valveK = s >= T.cut ? 1 : 0;
  push('reedSuc', ec(-61.2 + plate.x, 153 + plate.y, plate.z));
  push('reedDis', ec(-65.8 + plate.x, 116 + plate.y, plate.z));
  push('reedSucAngle', +((0.42 * gas.suc * valveK * 180) / Math.PI).toFixed(4)); // three rotation.z
  push('reedDisAngle', +((0.42 * gas.dis * valveK * 180) / Math.PI).toFixed(4));
  // The front of the shell lifts off toward the camera (EffectCraft has no live cut).
  const lift = outQ(prog(s, T.sliceA, T.sliceB - T.sliceA));
  push('shellFront', ec(0, 40 * lift, 260 * lift));
  push('shellFrontOpacity', +(100 * (1 - prog(s, T.sliceA + 0.5, 1.1))).toFixed(2));
  const xray = prog(s, T.cut, 0.01) * (1 - prog(s, T.pullBack + 0.6, 1.2));
  push('mufflerOpacity', +(100 * (1 - 0.72 * xray)).toFixed(2));
  push('distubeOpacity', explodeK(s, 'pump') < 0.01 ? 100 : 0);

  // Gas: chamber dots crowd with the piston and warm with compression; stream dots ride their paths.
  const show = s >= T.cut ? 1 : 0;
  const fastK = speedUp(s);
  const col = COLD.clone().lerp(HOT, gas.temp).convertLinearToSRGB(); // EffectCraft colours are sRGB
  push('gasColor', [+col.r.toFixed(4), +col.g.toFixed(4), +col.b.toFixed(4), 1]);
  const gapLen = Math.max(1, gas.gap - 1.6);
  for (let i = 0; i < N_CYL; i++) {
    const on = show * Math.min(1, Math.max(0, gas.mass * N_CYL - i));
    const u = rnd(i, 1);
    const rr = Math.sqrt(rnd(i, 2)) * (BORE - 2);
    const an = rnd(i, 3) * Math.PI * 2;
    const jig = Math.sin(s * (5 + 4 * rnd(i, 4)) + i) * 1.2;
    push(`gc${i}`, ec(X_VP + 0.8 + u * gapLen + pump.x, Y_AX + rr * Math.sin(an) + jig * 0.6 + pump.y, rr * Math.cos(an) + jig * 0.6 + pump.z));
    push(`gcS${i}`, +(100 * on * (0.85 + 0.3 * rnd(i, 5))).toFixed(2));
  }
  const sucK = show * Math.max(gas.suc, fastK * 0.85);
  for (let i = 0; i < N_SUC; i++) {
    const u = (i / N_SUC + s * (0.35 + 0.55 * fastK)) % 1;
    const p = sucCurve.getPointAt(u).add(pump);
    push(`gs${i}`, ecV(p));
    push(`gsS${i}`, +(100 * sucK * Math.min(1, Math.min(u, 1 - u) * 8) * 0.9).toFixed(2));
  }
  const disK = show * Math.max(gas.dis, fastK * 0.9, prog(s, T.pullBack, 0.3));
  const grow = 1.1 + 1.3 * prog(s, T.pullBack, 1.6);
  for (let i = 0; i < N_DIS; i++) {
    const u = (i / N_DIS + s * (0.16 + 0.26 * fastK)) % 1;
    const p = disPath.getPointAt(u).add(pump);
    push(`gd${i}`, ecV(p));
    push(`gdS${i}`, +(100 * disK * Math.min(1, Math.min(u, 1 - u) * 12) * grow).toFixed(2));
  }

  // Label anchors (3D nulls) and how far in each label is (0..1).
  const a = anchors(s);
  for (const [k, v] of Object.entries(a)) push(`A_${k}`, ecV(unitsToMm(v)));
  const L = T.labels;
  const firstCycle = phi < Math.PI * 2 + P_SUC[0];
  const pk = (a0: number, a1: number) => Math.max(0, s < T.cut || !firstCycle ? 0 : Math.min(Math.min(1, (phi - a0) / 0.35), 1 - Math.min(1, Math.max(0, (phi - a1 + 0.15) / 0.3))));
  const k: Record<string, number> = {
    shell: win(s, T.sliceB - 0.2, T.explode + 0.3),
    crank: win(s, L[1], T.labelsOut),
    motor: win(s, L[0], T.labelsOut),
    springs: win(s, L[4], T.labelsOut),
    piston: win(s, L[2], T.labelsOut),
    valves: win(s, L[3], T.labelsOut),
    suction: pk(P_SUC[0], P_SUC[1] + 0.1),
    compression: pk(P_SUC[1] + 0.1, P_DIS[0] + 0.05),
    discharge: pk(P_DIS[0] + 0.05, 99) * (s > T.fast + 0.2 ? Math.max(0, 1 - prog(s, T.fast + 0.2, 0.3)) : 1),
    speed: win(s, T.fastFull - 0.6, T.pullBack + 0.1),
    outlet: win(s, T.outLabel, T.end - 0.4),
  };
  for (const [n, v] of Object.entries(k)) push(`K_${n}`, +Math.max(0, v).toFixed(4));
}

const meta = {fps: FPS, frames, S, N_CYL, N_SUC, N_DIS, T, zoom: 540 / Math.tan((15 * Math.PI) / 180)};
fs.writeFileSync(process.argv[2], `// Generated by remotion/src/cutaway/effectcraft/bake.ts. Do not edit.\nvar META = ${JSON.stringify(meta)};\nvar ANIM = ${JSON.stringify(out)};\n`);
console.log('frames', frames, 'tracks', Object.keys(out).length);
