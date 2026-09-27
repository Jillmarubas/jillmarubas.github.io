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
  coin: {obv: THREE.Texture; rev: THREE.Texture; obvBump: THREE.Texture; revBump: THREE.Texture};
  photos: {pemberton: THREE.Texture; candler: THREE.Texture};
  earth: THREE.Texture[];
};

const MODELS = ['jug_01', 'wine_bottles_01', 'pocket_watch', 'round_spectacles'];

/**
 * Retry a download with backoff. On Lambda, up to ~200 renderers fetch the same files from S3
 * at once; one failed request must not kill the render. A browser load failure rejects with a
 * bare Event, so rethrow a real Error that names the file.
 */
const withRetry = async <T,>(what: string, load: () => Promise<T>, tries = 5): Promise<T> => {
  for (let i = 0; ; i++) {
    try {
      return await load();
    } catch (err) {
      if (i >= tries - 1) throw new Error(`Failed to load ${what} after ${tries} tries: ${err instanceof Error ? err.message : (err as Event)?.type ?? String(err)}`);
      await new Promise((r) => setTimeout(r, 500 * 2 ** i));
    }
  }
};

export const useAssets = () => {
  const [assets, setAssets] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender('Loading 3D assets', {timeoutInMilliseconds: 180000}));
  useEffect(() => {
    const tl = new THREE.TextureLoader();
    const tex = (p: string, srgb = true, repeat = 1) =>
      withRetry(p, () => tl.loadAsync(staticFile(p))).then((t) => {
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
      Promise.all(MODELS.map((m) => withRetry(m, () => gl.loadAsync(staticFile(`ph/${m}/${m}.gltf`))).then((g) => [m, g.scene] as const))),
      withRetry('studio HDRI', () => new HDRLoader().loadAsync(staticFile('ph/studio_small_09_1k.hdr'))),
      Promise.all([tex('archive/nickel_obverse.jpg'), tex('archive/nickel_reverse.jpg'), tex('archive/nickel_obverse_bump.png', false), tex('archive/nickel_reverse_bump.png', false)]),
      Promise.all([tex('archive/pemberton.jpg'), tex('archive/candler.jpg')]),
      Promise.all([tex('real/earth_day_2k.jpg'), tex('real/earth_clouds.jpg', false)]),
    ]).then(([models, hdr, coin, photos, earth]) => {
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      const gltf: Record<string, THREE.Group> = {};
      for (const [m, scene] of models) {
        scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            // scanned glass (lenses, bottles): pure transmission, not alpha blending, now that
            // the paper wall is real geometry the glass can refract
            for (const mat of (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshPhysicalMaterial[]) {
              if (mat.transmission > 0) {
                mat.transparent = false;
                mat.depthWrite = true;
                mat.thickness = Math.max(mat.thickness, 0.002);
                if (/spectacles_glass/.test(mat.name)) {
                  // thin clear lenses: a faint reflection, otherwise see-through
                  mat.transmission = 0;
                  mat.transparent = true;
                  mat.opacity = 0.14;
                  mat.depthWrite = false;
                  mat.map = null;
                  mat.normalMap = null;
                  mat.color.set('#ffffff');
                  mat.roughness = 0.0;
                  mat.envMapIntensity = 1.6;
                }
                mesh.castShadow = false;
              }
              // liquid inside a bottle must be opaque to be seen through the transmissive glass
              if (/wine_(red|light_red|clear)/.test(mat.name)) {
                mat.transmission = 0;
                mat.transparent = false;
                mat.color.set('#3b0a10');
                mat.roughness = 0.08;
                (mat as THREE.MeshPhysicalMaterial).clearcoat = 1;
              }
            }
          }
        });
        gltf[m] = scene;
      }
      setAssets({
        gltf,
        env: hdr,
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

const lathe = (pts: [number, number][], seg = 128) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

/** A closed glass profile (outer wall up, rounded lip, inner wall down) so the walls have real thickness. */
const glassProfile = (outer: (y: number) => number, h: number, wall: number, base: number, lip = wall / 2): [number, number][] => {
  const pts: [number, number][] = [[0, 0], [outer(0) - 0.002, 0], [outer(0), 0.0015]];
  for (let i = 1; i <= 24; i++) {
    const y = 0.0015 + ((h - lip - 0.0015) * i) / 24;
    pts.push([outer(y), y]);
  }
  const rTop = outer(h - lip) - lip;
  for (let i = 1; i < 10; i++) {
    const a = (Math.PI * i) / 10;
    pts.push([rTop + Math.cos(a) * lip, h - lip + Math.sin(a) * lip]);
  }
  for (let i = 24; i >= 0; i--) {
    const y = base + ((h - lip - base) * i) / 24;
    pts.push([outer(y) - wall, y]);
  }
  pts.push([0, base - 0.0005]);
  return pts;
};

const clearGlass = (attenuation = '#b9d6cf', distance = 0.05, rough = 0.02, thickness = 0.009) =>
  new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: rough,
    metalness: 0,
    transmission: 1,
    thickness,
    ior: 1.5,
    specularIntensity: 1,
    envMapIntensity: 1.3,
    attenuationColor: new THREE.Color(attenuation),
    attenuationDistance: distance,
  });

// Cola must be opaque: three.js does not show a transmissive object through another one.
const colaMat = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#1c0602',
    roughness: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    sheen: 0.5,
    sheenColor: new THREE.Color('#7a2208'),
    envMapIntensity: 1.4,
  });

const bubbleMat = () => new THREE.MeshStandardMaterial({color: '#7a5a42', roughness: 0.05, metalness: 0.2, envMapIntensity: 1.6});

/** Instanced spheres placed by a function of (index, frame); updated every render. */
const Instanced: React.FC<{count: number; mat: THREE.Material; place: (i: number, m: THREE.Matrix4) => void; castShadow?: boolean}> = ({count, mat, place, castShadow = false}) => {
  const ref = React.useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.SphereGeometry(1, 12, 8), []);
  React.useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      place(i, m);
      ref.current!.setMatrixAt(i, m);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, count]} castShadow={castShadow} frustumCulled={false} />;
};

/* ------------------------------------------------------------ 6.5 oz soda-fountain glass */
export const GLASS_H = 0.12;
const WALL = 0.0022;
const BASE = 0.013;
const outerR = (y: number) => 0.0285 + (y / GLASS_H) * 0.0085; // 5.7 cm base, 7.4 cm rim
export const liquidTop = (fill: number) => BASE + (GLASS_H - 0.012 - BASE) * fill;

export const FountainGlass: React.FC<{fill: number; frame: number; condensation?: boolean}> = ({fill, frame, condensation = true}) => {
  const m = useMemo(
    () => ({
      shell: lathe(glassProfile(outerR, GLASS_H, WALL, BASE)),
      glass: clearGlass(),
      cola: colaMat(),
      foam: new THREE.MeshStandardMaterial({color: '#cfa77c', roughness: 0.75}),
      bubble: bubbleMat(),
      drop: new THREE.MeshPhysicalMaterial({color: '#dfe8e6', roughness: 0.03, clearcoat: 1, transparent: true, opacity: 0.3, envMapIntensity: 1.3, depthWrite: false}),
    }),
    [],
  );
  const top = liquidTop(fill);
  const rin = (y: number) => outerR(y) - WALL;
  const liquid = useMemo(() => {
    if (fill < 0.01) return null;
    const pts: [number, number][] = [[0, BASE], [rin(BASE) - 0.0003, BASE]];
    for (let i = 1; i <= 8; i++) pts.push([rin(BASE + ((top - BASE) * i) / 8) - 0.0003, BASE + ((top - BASE) * i) / 8]);
    pts.push([rin(top) - 0.0015, top + 0.0012]); // meniscus climbs the wall
    pts.push([rin(top) - 0.004, top + 0.0003], [0, top]);
    return lathe(pts, 96);
  }, [fill, top]);
  return (
    <group>
      <mesh geometry={m.shell} material={m.glass} />
      {liquid && <mesh geometry={liquid} material={m.cola} castShadow />}
      {fill > 0.05 && (
        <>
          {/* foam collar */}
          <mesh position={[0, top + 0.0009, 0]} material={m.foam} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[rin(top) - 0.007, rin(top) - 0.0004, 96]} />
          </mesh>
          <Instanced
            count={90}
            mat={m.foam}
            place={(i, mm) => {
              const a = random(`fa${i}`) * Math.PI * 2;
              const r = rin(top) - 0.001 - random(`fr${i}`) * 0.005;
              const sz = 0.0006 + random(`fs${i}`) * 0.0011;
              mm.compose(new THREE.Vector3(Math.cos(a) * r, top + 0.001, Math.sin(a) * r), new THREE.Quaternion(), new THREE.Vector3(sz, sz * 0.7, sz));
            }}
          />
          {/* carbonation clinging to the inner wall and creeping upward */}
          <Instanced
            count={70}
            mat={m.bubble}
            place={(i, mm) => {
              const a = random(`ba${i}`) * Math.PI * 2;
              const rise = random(`bs${i}`) < 0.35 ? (frame * (0.00008 + random(`bv${i}`) * 0.0002)) % (top - BASE) : 0;
              const y = BASE + 0.002 + ((random(`by${i}`) * (top - BASE - 0.004) + rise) % (top - BASE - 0.003));
              const r = rin(y) - 0.0006;
              const sz = 0.0003 + random(`bz${i}`) * 0.0005;
              mm.compose(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), new THREE.Quaternion(), new THREE.Vector3(sz, sz, sz));
            }}
          />
        </>
      )}
      {condensation && fill > 0.3 && (
        <Instanced
          count={140}
          mat={m.drop}
          place={(i, mm) => {
            const a = random(`da${i}`) * Math.PI * 2;
            const y = 0.006 + Math.pow(random(`dy${i}`), 0.8) * (top - 0.004);
            const r = outerR(y) + 0.0002;
            const sz = 0.0003 + Math.pow(random(`dz${i}`), 2.5) * 0.0009;
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
            mm.compose(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), q, new THREE.Vector3(sz, sz * 1.25, sz * 0.45));
          }}
        />
      )}
    </group>
  );
};

export const PourStream: React.FC<{from: number; to: number; x: number; z: number; wobble: number}> = ({from, to, x, z, wobble}) => {
  const mat = useMemo(colaMat, []);
  const len = from - to;
  if (len <= 0) return null;
  return (
    <mesh position={[x + Math.sin(wobble) * 0.0004, to + len / 2, z]} material={mat} castShadow>
      <cylinderGeometry args={[0.0028, 0.0034, len, 24, 1, true]} />
    </mesh>
  );
};

/* ------------------------------------------------------------ Hutchinson bottle (c. 1890s) */
// 6 7/8 in x 2 1/2 in (17.5 x 6.4 cm), heavy aqua glass, blob lip, internal wire-loop stopper
const hutchOuter = (y: number) => {
  if (y < 0.11) return 0.032;
  if (y < 0.146) return 0.032 - ((y - 0.11) / 0.036) ** 1.4 * 0.017;
  return 0.0145;
};
export const HutchinsonBottle: React.FC<{level?: number; seed?: string}> = ({level = 0.72, seed = 'h'}) => {
  const m = useMemo(() => {
    const geo = lathe(glassProfile(hutchOuter, 0.163, 0.0032, 0.009, 0.0016), 96);
    // hand-blown glass is never perfectly round
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const a = Math.atan2(z, x);
      const k = 1 + 0.012 * Math.sin(a * 3 + y * 60 + random(seed) * 6) + 0.006 * Math.sin(y * 140);
      p.setXYZ(i, x * k, y, z * k);
    }
    geo.computeVertexNormals();
    return {
      geo,
      glass: clearGlass('#5fb8a3', 0.018, 0.0, 0.004),
      cola: colaMat(),
      wire: new THREE.MeshStandardMaterial({color: '#7b7b75', metalness: 1, roughness: 0.4}),
      gasket: new THREE.MeshStandardMaterial({color: '#2a2724', roughness: 0.8}),
    };
  }, [seed]);
  const h = 0.009 + 0.1 * level;
  return (
    <group>
      <mesh geometry={m.geo} material={m.glass} />
      <mesh position={[0, 0.009 + (h - 0.009) / 2, 0]} material={m.cola} castShadow>
        <cylinderGeometry args={[0.0284, 0.0284, h - 0.009, 64]} />
      </mesh>
      {/* blob lip */}
      <mesh position={[0, 0.167, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.glass}>
        <torusGeometry args={[0.0142, 0.0042, 20, 64]} />
      </mesh>
      {/* rubber gasket seated in the neck, held by the spring-wire loop */}
      <mesh position={[0, 0.152, 0]} material={m.gasket} castShadow>
        <cylinderGeometry args={[0.0098, 0.0098, 0.006, 32]} />
      </mesh>
      <mesh position={[0, 0.176, 0]} rotation={[0, Math.PI / 2, 0]} material={m.wire} castShadow>
        <torusGeometry args={[0.0105, 0.0011, 12, 48, Math.PI * 1.2]} />
      </mesh>
      <mesh position={[0, 0.164, 0]} material={m.wire}>
        <cylinderGeometry args={[0.0011, 0.0011, 0.024, 8]} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------ coca leaf */
// Elliptic, 2.5-7.5 cm, pointed apex; waxy upper side; two curved lines either side of the midrib.
const leafMaps = (() => {
  let cache: {map: THREE.Texture; normal: THREE.Texture} | null = null;
  return () => {
    if (cache) return cache;
    const W = 512, H = 1024;
    const col = document.createElement('canvas');
    col.width = W; col.height = H;
    const x = col.getContext('2d')!;
    const g = x.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#2c4520'); g.addColorStop(0.45, '#46682c'); g.addColorStop(0.5, '#6b8a45'); g.addColorStop(0.55, '#46682c'); g.addColorStop(1, '#2c4520');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 2600; i++) {
      x.fillStyle = `rgba(${random(`lr${i}`) > 0.5 ? '20,35,12' : '110,140,70'},${random(`la${i}`) * 0.06})`;
      x.beginPath(); x.arc(random(`lx${i}`) * W, random(`ly${i}`) * H, 2 + random(`ls${i}`) * 6, 0, Math.PI * 2); x.fill();
    }
    // height map for veins: lighter = raised
    const hgt = document.createElement('canvas');
    hgt.width = W; hgt.height = H;
    const y = hgt.getContext('2d')!;
    y.fillStyle = '#808080'; y.fillRect(0, 0, W, H);
    const vein = (ctx: CanvasRenderingContext2D, style: string, w: number, path: () => void) => { ctx.strokeStyle = style; ctx.lineWidth = w; ctx.beginPath(); path(); ctx.stroke(); };
    for (const [ctx, main, side, lines] of [[x, '#8fa964', 'rgba(150,175,110,0.45)', 'rgba(24,40,14,0.5)'], [y, '#3a3a3a', '#6a6a6a', '#9a9a9a']] as const) {
      vein(ctx, main, 9, () => { ctx.moveTo(W / 2, H); ctx.lineTo(W / 2, 20); });
      for (let i = 0; i < 16; i++) {
        const yy = 90 + i * 52;
        for (const s of [-1, 1]) vein(ctx, side, 2.5, () => { ctx.moveTo(W / 2, yy + 26); ctx.quadraticCurveTo(W / 2 + s * 110, yy + 6, W / 2 + s * 240, yy - 40); });
      }
      for (const s of [-1, 1]) vein(ctx, lines, 4, () => { ctx.moveTo(W / 2, H * 0.93); ctx.bezierCurveTo(W / 2 + s * 118, H * 0.72, W / 2 + s * 118, H * 0.25, W / 2, H * 0.06); });
    }
    const img = y.getImageData(0, 0, W, H).data;
    const nc = document.createElement('canvas');
    nc.width = W; nc.height = H;
    const nx = nc.getContext('2d')!;
    const out = nx.createImageData(W, H);
    const at = (i: number, j: number) => img[((Math.min(H - 1, Math.max(0, j)) * W) + Math.min(W - 1, Math.max(0, i))) * 4] / 255;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const dx = (at(i + 1, j) - at(i - 1, j)) * 3, dy = (at(i, j + 1) - at(i, j - 1)) * 3;
      const l = Math.hypot(dx, dy, 1), k = (j * W + i) * 4;
      out.data[k] = ((-dx / l) * 0.5 + 0.5) * 255; out.data[k + 1] = ((dy / l) * 0.5 + 0.5) * 255; out.data[k + 2] = (1 / l) * 255; out.data[k + 3] = 255;
    }
    nx.putImageData(out, 0, 0);
    const map = new THREE.CanvasTexture(col); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
    const normal = new THREE.CanvasTexture(nc);
    cache = {map, normal};
    return cache;
  };
})();

export const CocaLeaf: React.FC<{length?: number; seed?: string}> = ({length = 0.058, seed = 'l'}) => {
  const {geo, mat} = useMemo(() => {
    const L = length, W = L * 0.5;
    const g = new THREE.PlaneGeometry(W, L, 24, 48);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / (W / 2); // -1..1 across
      const y = p.getY(i) / L + 0.5; // 0 stem .. 1 tip
      const half = Math.pow(Math.sin(Math.PI * Math.pow(y, 0.9)), 0.8) * (1 - 0.18 * y);
      p.setX(i, x * half * (W / 2));
      p.setY(i, (y - 0.5) * L);
      const cup = -x * x * W * 0.16;
      const curl = Math.sin(y * Math.PI) * L * 0.06 + (y - 0.5) ** 2 * L * 0.08;
      const wave = Math.sin(y * 17 + random(seed) * 6) * 0.0006 * Math.abs(x);
      p.setZ(i, cup + curl + wave);
    }
    g.computeVertexNormals();
    const {map, normal} = leafMaps();
    const m = new THREE.MeshPhysicalMaterial({map, normalMap: normal, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35, sheen: 0.25, sheenColor: new THREE.Color('#9cc070'), side: THREE.DoubleSide});
    return {geo: g, mat: m};
  }, [length, seed]);
  return (
    <group>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {/* short petiole */}
      <mesh position={[0, -length / 2 - 0.004, 0.0005]} material={mat}>
        <cylinderGeometry args={[0.0007, 0.0009, 0.009, 8]} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------ kola nut (Cola nitida): two fleshy lobes */
const kolaMaps = (seed: string) => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d')!;
  x.fillStyle = '#7e3326';
  x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 700; i++) {
    const r = 4 + random(`${seed}r${i}`) * 34;
    const tone = random(`${seed}c${i}`);
    x.fillStyle = tone > 0.82 ? 'rgba(226,196,168,0.22)' : tone > 0.4 ? 'rgba(150,62,44,0.3)' : 'rgba(70,24,16,0.32)';
    x.beginPath();
    x.ellipse(random(`${seed}x${i}`) * 512, random(`${seed}y${i}`) * 512, r, r * (0.5 + random(`${seed}e${i}`)), random(`${seed}o${i}`) * 3, 0, Math.PI * 2);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const KolaNut: React.FC<{seed: string; size?: number}> = ({seed, size = 0.036}) => {
  const {geo, mat} = useMemo(() => {
    const g = new THREE.SphereGeometry(0.5, 96, 64);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      v.y *= 0.66;
      v.z *= 0.8;
      const n = 1 + 0.045 * Math.sin(v.x * 13 + random(seed) * 5) * Math.cos(v.z * 11) + 0.025 * Math.sin(v.y * 29 + v.x * 17) + 0.06 * Math.max(0, v.x) ** 2;
      v.multiplyScalar(n);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    const map = kolaMaps(seed);
    return {geo: g, mat: new THREE.MeshPhysicalMaterial({map, bumpMap: map, bumpScale: 1.2, roughness: 0.38, clearcoat: 0.55, clearcoatRoughness: 0.3, sheen: 0.3, sheenColor: new THREE.Color('#c98a74')})};
  }, [seed]);
  // two cotyledons pressed together along a visible seam
  return (
    <group scale={size}>
      <mesh geometry={geo} material={mat} position={[-0.255, 0, 0]} scale={[0.5, 1, 1]} castShadow receiveShadow />
      <mesh geometry={geo} material={mat} position={[0.255, 0.01, 0]} scale={[0.5, 0.95, 0.97]} rotation={[0, Math.PI + 0.12, 0.05]} castShadow receiveShadow />
    </group>
  );
};

/* ------------------------------------------------------------ rubber stamp + ink impression */
export const RubberStamp: React.FC = () => {
  const m = useMemo(
    () => ({
      wood: new THREE.MeshPhysicalMaterial({color: '#7a4a26', roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2}),
      rubber: new THREE.MeshStandardMaterial({color: '#5a1a12', roughness: 0.9}),
      knob: lathe([[0, 0.02], [0.009, 0.021], [0.007, 0.03], [0.006, 0.042], [0.013, 0.05], [0.016, 0.058], [0.012, 0.066], [0, 0.068]], 48),
    }),
    [],
  );
  return (
    <group>
      <mesh position={[0, 0.0035, 0]} material={m.rubber} castShadow>
        <boxGeometry args={[0.078, 0.004, 0.026]} />
      </mesh>
      <mesh position={[0, 0.013, 0]} material={m.wood} castShadow>
        <boxGeometry args={[0.082, 0.015, 0.03]} />
      </mesh>
      <mesh geometry={m.knob} material={m.wood} castShadow />
    </group>
  );
};

export const inkTexture = (text: string, color = '#7a2e0e') => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 300;
  const x = c.getContext('2d')!;
  x.strokeStyle = color;
  x.fillStyle = color;
  x.lineWidth = 22;
  x.strokeRect(24, 24, 976, 252);
  x.font = '800 150px Poppins';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(text, 512, 156);
  // worn ink: knock out random specks
  x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 2200; i++) {
    x.fillStyle = `rgba(0,0,0,${0.3 + random(`ik${i}`) * 0.7})`;
    x.beginPath();
    x.arc(random(`ix${i}`) * 1024, random(`iy${i}`) * 300, 0.8 + random(`is${i}`) * 3.2, 0, Math.PI * 2);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/* ------------------------------------------------------------ paper wall */
export const paperTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const x = c.getContext('2d')!;
  x.fillStyle = '#f3f1ec';
  x.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 9000; i++) {
    x.fillStyle = `rgba(${random(`pp${i}`) > 0.5 ? '120,110,95' : '255,255,255'},${random(`pa${i}`) * 0.05})`;
    x.fillRect(random(`px${i}`) * 1024, random(`py${i}`) * 1024, 1 + random(`pw${i}`) * 3, 1);
  }
  x.strokeStyle = 'rgba(40,40,44,0.075)';
  x.lineWidth = 3;
  for (let i = 0; i <= 8; i++) {
    x.beginPath(); x.moveTo(i * 128, 0); x.lineTo(i * 128, 1024); x.stroke();
    x.beginPath(); x.moveTo(0, i * 128); x.lineTo(1024, i * 128); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
};

export const ghostTexture = (text: string) => {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 1024;
  const x = c.getContext('2d')!;
  x.fillStyle = '#26262a';
  x.font = '800 760px Poppins';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(text, 1024, 560);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/* ------------------------------------------------------------ globe */
export const Globe: React.FC<{earth: THREE.Texture[]; spin: number; r?: number}> = ({earth, spin, r = 0.07}) => {
  const atmo = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'varying vec3 vN; void main(){ float k = pow(0.72 - dot(vN, vec3(0.,0.,1.)), 3.0); gl_FragColor = vec4(0.4,0.65,1.0,1.0) * k * 1.2; }',
      }),
    [],
  );
  return (
    <group rotation={[0, 0, 0.41]}>
      <mesh rotation={[0, spin, 0]} castShadow>
        <sphereGeometry args={[r, 128, 96]} />
        <meshStandardMaterial map={earth[0]} roughness={0.7} />
      </mesh>
      <mesh rotation={[0, spin * 1.15, 0]}>
        <sphereGeometry args={[r * 1.01, 128, 96]} />
        <meshStandardMaterial color="#fff" alphaMap={earth[1]} transparent depthWrite={false} />
      </mesh>
      <mesh material={atmo}>
        <sphereGeometry args={[r * 1.07, 64, 48]} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------ Liberty Head nickel */
export const Nickel: React.FC<{a: Assets['coin']}> = ({a}) => {
  const mats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({color: '#c9c9c3', metalness: 1, roughness: 0.32});
    const face = (map: THREE.Texture, bump: THREE.Texture) =>
      new THREE.MeshStandardMaterial({map, bumpMap: bump, bumpScale: 1.4, metalness: 0.95, roughness: 0.3, color: '#f4f4ee', envMapIntensity: 2});
    return [edge, face(a.rev, a.revBump), face(a.obv, a.obvBump)];
  }, [a]);
  return (
    <mesh material={mats} castShadow receiveShadow>
      <cylinderGeometry args={[0.0106, 0.0106, 0.00195, 96]} />
    </mesh>
  );
};

/* ------------------------------------------------------------ cabinet card photograph */
// 10.8 x 16.5 cm mount, faces +z (toward the camera), gently curled like old card stock
export const CabinetCard: React.FC<{photo: THREE.Texture; caption?: string}> = ({photo, caption = ''}) => {
  const {mountTex, geo, printGeo} = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 540;
    c.height = 825;
    const x = c.getContext('2d')!;
    const g = x.createLinearGradient(0, 0, 540, 825);
    g.addColorStop(0, '#e9dfc8');
    g.addColorStop(1, '#d4c3a0');
    x.fillStyle = g;
    x.fillRect(0, 0, 540, 825);
    for (let i = 0; i < 2500; i++) {
      x.fillStyle = `rgba(110,85,50,${random(`cm${i}`) * 0.07})`;
      x.fillRect(random(`cx${i}`) * 540, random(`cy${i}`) * 825, 2, 2);
    }
    x.strokeStyle = '#a88c52';
    x.lineWidth = 4;
    x.strokeRect(20, 20, 500, 785);
    x.fillStyle = '#6a5433';
    x.textAlign = 'center';
    x.font = 'italic 30px Georgia';
    x.fillText(caption, 270, 770);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    const curl = (geo: THREE.BufferGeometry, amt: number) => {
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + (p.getX(i) / 0.054) ** 2 * amt);
      geo.computeVertexNormals();
      return geo;
    };
    const im = photo.image as HTMLImageElement;
    const pw = 0.09, ph = Math.min(0.125, pw / (im.width / im.height));
    return {mountTex: t, geo: curl(new THREE.BoxGeometry(0.108, 0.165, 0.0016, 24, 1, 1), -0.0025), printGeo: curl(new THREE.PlaneGeometry(pw, ph, 24, 1), -0.0025).translate(0, 0.012, 0.0009)};
  }, [photo, caption]);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial attach="material-0" color="#c9b58e" roughness={0.9} />
        <meshStandardMaterial attach="material-1" color="#c9b58e" roughness={0.9} />
        <meshStandardMaterial attach="material-2" color="#c9b58e" roughness={0.9} />
        <meshStandardMaterial attach="material-3" color="#c9b58e" roughness={0.9} />
        <meshStandardMaterial attach="material-4" map={mountTex} roughness={0.85} />
        <meshStandardMaterial attach="material-5" color="#b9a67f" roughness={0.9} />
      </mesh>
      <mesh geometry={printGeo} receiveShadow>
        <meshPhysicalMaterial map={photo} roughness={0.45} clearcoat={0.3} clearcoatRoughness={0.4} color="#efe2c8" />
      </mesh>
    </group>
  );
};
