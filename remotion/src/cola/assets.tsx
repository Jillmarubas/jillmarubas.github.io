import React, {useEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/examples/jsm/loaders/HDRLoader.js';
import {continueRender, delayRender, random, staticFile} from 'remotion';
import {useThree} from '@react-three/fiber';
import type {ThreeElements} from '@react-three/fiber';

// Units are metres. Dimensions follow the references gathered for this video:
//   fountain glass: 6.5 US fl oz (190 mL) serving  -> ~12 cm tall, 7.4 cm rim
//   Hutchinson bottle: 6 7/8 in x 2 1/2 in           -> 17.5 cm x 6.4 cm, wire-loop stopper
//   Liberty Head nickel (1883-1912): 21.2 mm x 1.95 mm, plain edge
//   coca leaf: elliptic, 2.5-7.5 cm long, two curved lines beside the midrib
//   kola nut (Cola nitida): two fleshy lobes, mottled red-brown to cream, ~3-4 cm
//   cabinet card photograph: 10.8 x 16.5 cm mount

export type Assets = {
  gltf: Record<string, THREE.Group>;
  env: THREE.Texture;
  wood: {map: THREE.Texture; normal: THREE.Texture; rough: THREE.Texture};
  coin: {obv: THREE.Texture; rev: THREE.Texture; obvBump: THREE.Texture; revBump: THREE.Texture};
  photos: {pemberton: THREE.Texture; candler: THREE.Texture};
  earth: THREE.Texture[];
};

const MODELS = ['jug_01', 'wine_bottles_01', 'binder_notebook', 'pocket_watch', 'round_spectacles', 'chemistry_set'];

export const useAssets = () => {
  const [assets, setAssets] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender('Loading 3D assets', {timeoutInMilliseconds: 180000}));
  useEffect(() => {
    const tl = new THREE.TextureLoader();
    const tex = (p: string, srgb = true, repeat = 1) =>
      tl.loadAsync(staticFile(p)).then((t) => {
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        if (repeat !== 1) {
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(repeat, repeat);
        }
        return t;
      });
    const gl = new GLTFLoader();
    Promise.all([
      Promise.all(MODELS.map((m) => gl.loadAsync(staticFile(`ph/${m}/${m}.gltf`)).then((g) => [m, g.scene] as const))),
      new HDRLoader().loadAsync(staticFile('ph/studio_small_09_1k.hdr')),
      Promise.all([tex('ph/dark_wood/Diffuse.jpg', true, 3), tex('ph/dark_wood/nor_gl.jpg', false, 3), tex('ph/dark_wood/Rough.jpg', false, 3)]),
      Promise.all([tex('archive/nickel_obverse.jpg'), tex('archive/nickel_reverse.jpg'), tex('archive/nickel_obverse_bump.png', false), tex('archive/nickel_reverse_bump.png', false)]),
      Promise.all([tex('archive/pemberton.jpg'), tex('archive/candler.jpg')]),
      Promise.all([tex('real/earth_day_4k.jpg'), tex('real/earth_clouds.jpg', false)]),
    ]).then(([models, hdr, wood, coin, photos, earth]) => {
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      const gltf: Record<string, THREE.Group> = {};
      for (const [m, scene] of models) {
        scene.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        gltf[m] = scene;
      }
      setAssets({
        gltf,
        env: hdr,
        wood: {map: wood[0], normal: wood[1], rough: wood[2]},
        coin: {obv: coin[0], rev: coin[1], obvBump: coin[2], revBump: coin[3]},
        photos: {pemberton: photos[0], candler: photos[1]},
        earth,
      });
    });
  }, []);
  return {assets, handle};
};

/**
 * Mount inside the ThreeCanvas. Remotion's canvas only redraws when the frame changes,
 * so after the assets arrive we force one render with the full scene before letting
 * Remotion capture the frame. Without this the first captured frames come out empty.
 */
export const ReleaseWhenDrawn: React.FC<{handle: number; ready: boolean}> = ({handle, ready}) => {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    if (!ready) return;
    advance(performance.now());
    requestAnimationFrame(() => {
      advance(performance.now());
      continueRender(handle);
    });
  }, [ready, handle, advance]);
  return null;
};

/**
 * A single Bordeaux-shape wine bottle from the Poly Haven set, with the set's modern
 * labels replaced by a period-style printed label (1880s tonic-wine typography).
 */
const tonicLabel = () => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const x = c.getContext('2d')!;
  x.fillStyle = '#e4d6b4';
  x.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 1800; i++) {
    x.fillStyle = `rgba(120,90,50,${random(`p${i}`) * 0.08})`;
    x.fillRect(random(`px${i}`) * 1024, random(`py${i}`) * 512, 2, 2);
  }
  x.strokeStyle = '#5a3d22';
  x.lineWidth = 6;
  x.strokeRect(300, 40, 424, 432);
  x.lineWidth = 2;
  x.strokeRect(314, 54, 396, 404);
  x.fillStyle = '#3a2614';
  x.textAlign = 'center';
  x.font = 'italic 34px Georgia';
  x.fillText('Pemberton\u2019s', 512, 125);
  x.font = 'bold 64px Georgia';
  x.fillText('FRENCH', 512, 205);
  x.fillText('WINE COCA', 512, 275);
  x.font = 'italic 30px Georgia';
  x.fillText('Ideal Nerve & Tonic Stimulant', 512, 335);
  x.font = '26px Georgia';
  x.fillText('ATLANTA, GA.', 512, 410);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const TonicWineBottle: React.FC<{scene: THREE.Group} & ThreeElements['group']> = ({scene, ...props}) => {
  const obj = useMemo(() => {
    const root = scene.clone(true);
    const label = new THREE.MeshStandardMaterial({color: '#d9c9a4', roughness: 0.9});
    const printed = new THREE.MeshStandardMaterial({map: tonicLabel(), roughness: 0.85});
    root.traverse((o) => {
      if (/champagne|burgundy|alsace/.test(o.name)) o.visible = false;
      if (o.name === 'wine_bottles_01_bordeaux') o.position.set(0, 0, 0);
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const swap = (mat: THREE.Material) => (/vinea|clearwater|intertwine/.test(mat.name) ? label : mat);
        m.material = Array.isArray(m.material) ? m.material.map(swap) : swap(m.material);
      }
    });
    // a printed band wrapped round the body, just outside the original label
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0414, 0.0414, 0.085, 96, 1, true, -Math.PI * 0.4, Math.PI * 0.8), printed);
    band.position.set(0, 0.105, 0);
    root.add(band);
    return root;
  }, [scene]);
  return (
    <group {...props}>
      <primitive object={obj} />
    </group>
  );
};

/** A Poly Haven model, cloned so it can appear more than once. */
export const Model: React.FC<{scene: THREE.Group} & ThreeElements['group']> = ({scene, ...props}) => {
  const obj = useMemo(() => scene.clone(true), [scene]);
  return (
    <group {...props}>
      <primitive object={obj} />
    </group>
  );
};

const lathe = (pts: [number, number][], seg = 96) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

const glass = (tint = '#ffffff', rough = 0.015) =>
  new THREE.MeshPhysicalMaterial({
    color: tint,
    roughness: rough,
    transmission: 1,
    thickness: 0.004,
    ior: 1.52,
    specularIntensity: 1,
    envMapIntensity: 1.4,
    side: THREE.DoubleSide,
  });

const cola = () =>
  new THREE.MeshPhysicalMaterial({
    // opaque on purpose: three.js does not show a transmissive object through another
    // transmissive object, so liquid inside glass must be solid to be seen
    color: '#080201',
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    sheen: 0.35,
    sheenColor: new THREE.Color('#5a1a06'),
    emissive: new THREE.Color('#0a0200'),
    envMapIntensity: 1.6,
  });

/* ------------------------------------------------------------ 6.5 oz fountain glass */
const GLASS_H = 0.12;
const rimR = (y: number) => 0.028 + (y / GLASS_H) * 0.009; // flared tumbler, 5.6 cm base -> 7.4 cm rim

export const FountainGlass: React.FC<{fill: number; frame: number}> = ({fill, frame}) => {
  const m = useMemo(
    () => ({
      shell: lathe([
        [0, 0],
        [0.027, 0],
        [0.0285, 0.002],
        [rimR(0.02), 0.02],
        [rimR(GLASS_H), GLASS_H],
        [rimR(GLASS_H) - 0.0022, GLASS_H],
        [rimR(0.018) - 0.0022, 0.018],
        [0, 0.016],
      ]),
      glass: glass(),
      cola: cola(),
      foam: new THREE.MeshStandardMaterial({color: '#caa27a', roughness: 0.85}),
      bubble: new THREE.MeshPhysicalMaterial({color: '#fff', roughness: 0, transmission: 0.9, ior: 1.0, thickness: 0.001, envMapIntensity: 2}),
    }),
    [],
  );
  const top = 0.017 + (GLASS_H - 0.03) * fill;
  const r0 = rimR(0.017) - 0.0024;
  const r1 = rimR(top) - 0.0024;
  return (
    <group>
      <mesh geometry={m.shell} material={m.glass} castShadow renderOrder={2} />
      {fill > 0.02 && (
        <>
          <mesh position={[0, (0.017 + top) / 2, 0]} material={m.cola} castShadow>
            <cylinderGeometry args={[r1, r0, top - 0.017, 96]} />
          </mesh>
          <mesh position={[0, top + 0.0012, 0]} material={m.foam}>
            <cylinderGeometry args={[r1, r1, 0.0024, 96]} />
          </mesh>
          {Array.from({length: 60}).map((_, i) => {
            const sp = 0.004 + random(`s${i}`) * 0.009;
            const y = 0.018 + (((frame * sp + random(`y${i}`)) % 1) * (top - 0.02));
            const a = random(`a${i}`) * Math.PI * 2;
            const edge = random(`e${i}`) > 0.45; // most bubbles cling near the wall
            const r = (edge ? 0.85 + random(`r${i}`) * 0.12 : random(`r${i}`) * 0.8) * (rimR(y) - 0.003);
            return (
              <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} material={m.bubble}>
                <sphereGeometry args={[0.0005 + random(`z${i}`) * 0.0009, 8, 6]} />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
};

export const PourStream: React.FC<{length: number; top: number}> = ({length, top}) => {
  const mat = useMemo(cola, []);
  if (length <= 0) return null;
  return (
    <mesh position={[0, top - length / 2, 0]} material={mat}>
      <cylinderGeometry args={[0.0035, 0.0028, length, 24]} />
    </mesh>
  );
};

/* ------------------------------------------------------------ Hutchinson bottle */
export const HutchinsonBottle: React.FC<{level?: number}> = ({level = 0.7}) => {
  const m = useMemo(
    () => ({
      body: lathe([
        [0, 0.003],
        [0.029, 0],
        [0.032, 0.006],
        [0.032, 0.112],
        [0.029, 0.126],
        [0.019, 0.142],
        [0.0135, 0.152],
        [0.0135, 0.163],
        [0.0165, 0.166],
        [0.017, 0.172],
        [0.0135, 0.175],
        [0.0105, 0.175],
        [0.0105, 0.16],
        [0.029, 0.11],
        [0.029, 0.006],
        [0, 0.006],
      ]),
      glass: glass('#bfe3dc', 0.03),
      wire: new THREE.MeshStandardMaterial({color: '#6b6b66', metalness: 1, roughness: 0.45}),
      cola: cola(),
    }),
    [],
  );
  const h = 0.006 + 0.1 * level;
  return (
    <group>
      <mesh geometry={m.body} material={m.glass} castShadow renderOrder={2} />
      <mesh position={[0, 0.006 + h / 2, 0]} material={m.cola}>
        <cylinderGeometry args={[0.0282, 0.0282, h, 64]} />
      </mesh>
      {/* the Hutchinson's spring-wire loop sticks up out of the mouth */}
      <mesh position={[0, 0.186, 0]} rotation={[0, Math.PI / 2, 0]} material={m.wire}>
        <torusGeometry args={[0.011, 0.0011, 12, 48, Math.PI * 1.25]} />
      </mesh>
      <mesh position={[0, 0.172, 0]} material={m.wire}>
        <cylinderGeometry args={[0.0011, 0.0011, 0.03, 8]} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------ coca leaf */
const leafTexture = (dry: boolean) => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 256, 0);
  const base = dry ? ['#4e4a28', '#625a32', '#4e4a28'] : ['#23391a', '#35512a', '#23391a'];
  g.addColorStop(0, base[0]);
  g.addColorStop(0.5, base[1]);
  g.addColorStop(1, base[2]);
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 512);
  // midrib
  x.strokeStyle = dry ? '#7d7650' : '#5f7a45';
  x.lineWidth = 5;
  x.beginPath();
  x.moveTo(128, 505);
  x.lineTo(128, 8);
  x.stroke();
  // the two curved lines either side of the midrib that identify coca
  x.strokeStyle = dry ? 'rgba(60,55,30,0.55)' : 'rgba(30,45,20,0.55)';
  x.lineWidth = 2.5;
  for (const s of [-1, 1]) {
    x.beginPath();
    x.moveTo(128, 470);
    x.bezierCurveTo(128 + s * 52, 380, 128 + s * 52, 140, 128, 40);
    x.stroke();
  }
  // side veins
  x.strokeStyle = 'rgba(20,30,10,0.25)';
  x.lineWidth = 1.2;
  for (let i = 0; i < 14; i++) {
    const y = 60 + i * 30;
    for (const s of [-1, 1]) {
      x.beginPath();
      x.moveTo(128, y + 10);
      x.quadraticCurveTo(128 + s * 60, y, 128 + s * 118, y - 20);
      x.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const CocaLeaf: React.FC<{length?: number; dry?: boolean; seed?: string}> = ({length = 0.055, dry = false, seed = 'l'}) => {
  const {geo, mat} = useMemo(() => {
    // elliptic leaf, width ~ 0.5 x length, pointed tip
    const L = length;
    const W = L * 0.48;
    const g = new THREE.PlaneGeometry(W, L, 16, 32);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i) / L + 0.5; // 0 at stem, 1 at tip
      const half = Math.sin(Math.PI * Math.pow(y, 0.85)) * 0.5 * (1 - 0.15 * y);
      p.setX(i, (x / (W / 2)) * half * W);
      // cupped across, curled along its length, a little random warp
      const u = x / (W / 2);
      p.setZ(i, -u * u * W * 0.18 + Math.sin(y * Math.PI) * L * 0.05 + (random(seed) - 0.5) * 0.002 * y);
    }
    g.computeVertexNormals();
    const m = new THREE.MeshPhysicalMaterial({map: leafTexture(dry), roughness: dry ? 0.85 : 0.55, sheen: 0.15, clearcoat: dry ? 0 : 0.2, clearcoatRoughness: 0.4, side: THREE.DoubleSide});
    return {geo: g, mat: m};
  }, [length, dry, seed]);
  return <mesh geometry={geo} material={mat} castShadow receiveShadow />;
};

/* ------------------------------------------------------------ kola nut: two lobes */
const kolaTexture = (seed: string) => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d')!;
  x.fillStyle = '#8c4a32';
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 160; i++) {
    const r = 6 + random(`${seed}r${i}`) * 26;
    x.fillStyle = random(`${seed}c${i}`) > 0.55 ? 'rgba(214,170,140,0.35)' : 'rgba(96,40,26,0.35)';
    x.beginPath();
    x.arc(random(`${seed}x${i}`) * 256, random(`${seed}y${i}`) * 256, r, 0, Math.PI * 2);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const KolaNut: React.FC<{seed: string; size?: number}> = ({seed, size = 0.034}) => {
  const {geo, mat} = useMemo(() => {
    const g = new THREE.SphereGeometry(0.5, 48, 32);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      v.y *= 0.62; // flattened
      v.z *= 0.78;
      const n = 1 + 0.06 * Math.sin(v.x * 11 + random(seed) * 5) * Math.cos(v.z * 9);
      v.multiplyScalar(n);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return {geo: g, mat: new THREE.MeshPhysicalMaterial({map: kolaTexture(seed), roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.5})};
  }, [seed]);
  // two cotyledons pressed together, with a visible seam
  return (
    <group scale={size}>
      <mesh geometry={geo} material={mat} position={[-0.26, 0, 0]} scale={[0.52, 1, 1]} castShadow receiveShadow />
      <mesh geometry={geo} material={mat} position={[0.26, 0, 0]} scale={[0.52, 0.96, 0.98]} rotation={[0, 0.1, 0]} castShadow receiveShadow />
    </group>
  );
};

/* ------------------------------------------------------------ Liberty Head nickel */
export const Nickel: React.FC<{a: Assets['coin']}> = ({a}) => {
  const mats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({color: '#c9c9c3', metalness: 1, roughness: 0.32});
    const face = (map: THREE.Texture, bump: THREE.Texture) =>
      new THREE.MeshStandardMaterial({map, bumpMap: bump, bumpScale: 1.4, metalness: 0.95, roughness: 0.34, color: '#e8e8e2'});
    return [edge, face(a.rev, a.revBump), face(a.obv, a.obvBump)];
  }, [a]);
  return (
    <mesh material={mats} castShadow receiveShadow>
      <cylinderGeometry args={[0.0106, 0.0106, 0.00195, 96]} />
    </mesh>
  );
};

/* ------------------------------------------------------------ cabinet card photograph */
export const CabinetCard: React.FC<{photo: THREE.Texture; caption?: string}> = ({photo, caption = ''}) => {
  const {mount, print} = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 540;
    c.height = 825;
    const x = c.getContext('2d')!;
    const g = x.createLinearGradient(0, 0, 540, 825);
    g.addColorStop(0, '#e9dfc8');
    g.addColorStop(1, '#d6c7a6');
    x.fillStyle = g;
    x.fillRect(0, 0, 540, 825);
    x.strokeStyle = '#b89c62';
    x.lineWidth = 3;
    x.strokeRect(22, 22, 496, 781);
    x.fillStyle = '#6a5433';
    x.textAlign = 'center';
    x.font = 'italic 30px Georgia';
    x.fillText(caption, 270, 770);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    const im = photo.image as HTMLImageElement;
    const aspect = im.width / im.height;
    return {mount: t, print: aspect};
  }, [photo, caption]);
  const pw = 0.092;
  const ph = Math.min(0.13, pw / print);
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.108, 0.165, 0.0015]} />
        <meshStandardMaterial attach="material-0" color="#cbb994" roughness={0.9} />
        <meshStandardMaterial attach="material-1" color="#cbb994" roughness={0.9} />
        <meshStandardMaterial attach="material-2" color="#cbb994" roughness={0.9} />
        <meshStandardMaterial attach="material-3" color="#cbb994" roughness={0.9} />
        <meshStandardMaterial attach="material-4" map={mount} roughness={0.9} color="#d8ccb4" />
        <meshStandardMaterial attach="material-5" color="#b9a67f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.012, 0.0008]}>
        <planeGeometry args={[pw, ph]} />
        <meshStandardMaterial map={photo} roughness={0.7} color="#d9cbb0" />
      </mesh>
    </group>
  );
};
