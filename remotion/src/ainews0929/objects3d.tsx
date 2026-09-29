// Object library for the news video. Everything is modelled in code, about 1 unit tall,
// centred on the origin. Materials follow reference/realism.md: metals get the room
// environment for reflections, plastics get a clearcoat, one key light for everything.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {random, useVideoConfig} from 'remotion';
import {C} from './theme';

export type Mood = 'azure' | 'ok' | 'warn' | 'err' | 'frost' | 'alarm';
// alarm: a saturated red for thumbnails only, where the pale signal red reads as pink at small sizes
export const MOOD: Record<Mood, string> = {azure: '#6f9bff', ok: C.ok, warn: C.warn, err: C.err, frost: C.frost, alarm: '#C8000F'};
export type ObjProps = {f: number; p: number; mood: Mood; seed: number};

// ---------- geometry cache (built once, reused every frame) ----------
const cache = new Map<string, THREE.BufferGeometry>();
const geo = (key: string, make: () => THREE.BufferGeometry) => {
  let g = cache.get(key);
  if (!g) cache.set(key, (g = make()));
  return g;
};
const rbox = (w: number, h: number, d: number, r = 0.06) => geo(`rb${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 4, r));
const lathe = (key: string, pts: [number, number][], seg = 64) => geo(key, () => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg));
const extrude = (key: string, shape: () => THREE.Shape, depth: number, bevel = 0.04) =>
  geo(key, () => {
    const g = new THREE.ExtrudeGeometry(shape(), {depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 6, curveSegments: 32});
    g.center();
    return g;
  });

// ---------- materials ----------
export const M = {
  chrome: () => <meshStandardMaterial color="#e9edf5" metalness={1} roughness={0.13} />,
  steel: () => <meshStandardMaterial color="#c9d2e0" metalness={1} roughness={0.34} />,
  graphite: () => <meshStandardMaterial color="#2a3242" metalness={0.6} roughness={0.32} />,
  gold: () => <meshStandardMaterial color="#e6b35a" metalness={1} roughness={0.2} />,
  frost: () => <meshPhysicalMaterial color="#eef2fa" roughness={0.32} clearcoat={1} clearcoatRoughness={0.12} />,
  marble: () => <meshPhysicalMaterial color="#f1f3f8" roughness={0.45} clearcoat={0.4} clearcoatRoughness={0.3} />,
  cobalt: () => <meshPhysicalMaterial color="#2b5cc0" roughness={0.3} clearcoat={1} clearcoatRoughness={0.1} />,
  deep: () => <meshPhysicalMaterial color="#0b2f7e" roughness={0.35} clearcoat={1} clearcoatRoughness={0.15} />,
  periwinkle: () => <meshPhysicalMaterial color="#a9bad4" roughness={0.3} clearcoat={1} clearcoatRoughness={0.1} />,
  glass: (tint = '#d6e4ff', opacity = 0.28) => (
    <meshPhysicalMaterial color={tint} transparent opacity={opacity} roughness={0.06} metalness={0} clearcoat={1} clearcoatRoughness={0.05} depthWrite={false} side={THREE.DoubleSide} />
  ),
  glow: (color: string, intensity = 1.4) => <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} roughness={0.4} toneMapped={false} />,
  paper: () => <meshStandardMaterial color="#f7f8fb" roughness={0.95} />,
};

// A rod between two points (cables, network edges, cage edges).
const Rod: React.FC<{a: [number, number, number]; b: [number, number, number]; r?: number; children: React.ReactNode}> = ({a, b, r = 0.02, children}) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const dir = vb.clone().sub(va);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[r, r, dir.length(), 12]} />
      {children}
    </mesh>
  );
};

const shieldShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0, 0.5);
  s.bezierCurveTo(0.16, 0.42, 0.34, 0.4, 0.42, 0.4);
  s.lineTo(0.42, 0.02);
  s.bezierCurveTo(0.42, -0.26, 0.22, -0.42, 0, -0.52);
  s.bezierCurveTo(-0.22, -0.42, -0.42, -0.26, -0.42, 0.02);
  s.lineTo(-0.42, 0.4);
  s.bezierCurveTo(-0.34, 0.4, -0.16, 0.42, 0, 0.5);
  return s;
};

// ---------- objects ----------
const Shield: React.FC<ObjProps> = ({mood, p}) => (
  <group>
    <mesh geometry={extrude('shield', shieldShape, 0.14, 0.05)}>{M.frost()}</mesh>
    <mesh geometry={extrude('shield-in', () => {
      const s = shieldShape();
      return new THREE.Shape(s.getPoints(64).map((v) => v.multiplyScalar(0.74)));
    }, 0.05, 0.02)} position={[0, 0.01, 0.12]}>
      {M.cobalt()}
    </mesh>
    {/* check mark: two strokes meeting at one vertex, drawn in with p */}
    <group position={[0, 0, 0.2]} scale={Math.max(0.001, p)}>
      {([[-0.19, 0.03], [0.2, 0.24]] as [number, number][]).map(([ex, ey], i) => {
        const vx = -0.05;
        const vy = -0.14;
        const len = Math.hypot(ex - vx, ey - vy);
        return (
          <mesh key={i} position={[(ex + vx) / 2, (ey + vy) / 2, 0]} rotation={[0, 0, Math.atan2(ey - vy, ex - vx) - Math.PI / 2]}>
            <capsuleGeometry args={[0.035, len, 8, 16]} />
            {M.glow(MOOD[mood], 1.1)}
          </mesh>
        );
      })}
    </group>
  </group>
);

const AgentOrb: React.FC<ObjProps> = ({f, mood, seed}) => {
  const {fps} = useVideoConfig();
  const t = f / fps;
  const glitch = mood === 'err' ? (random(`g${seed}-${Math.floor(f / 3)}`) - 0.5) * 0.08 : 0;
  return (
    <group position={[glitch, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.34, 64, 48]} />
        {M.frost()}
      </mesh>
      {/* visor band: the agent's "eye" */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <torusGeometry args={[0.335, 0.035, 16, 64, Math.PI * 0.9]} />
        {M.glow(MOOD[mood], 1.6)}
      </mesh>
      <group rotation={[1.1, t * 0.9 + seed, 0.35]}>
        <mesh>
          <torusGeometry args={[0.52, 0.014, 12, 96]} />
          {M.chrome()}
        </mesh>
        <mesh position={[0.52, 0, 0]}>
          <sphereGeometry args={[0.045, 24, 16]} />
          {M.glow(MOOD[mood], 1.2)}
        </mesh>
      </group>
    </group>
  );
};

const CUBE: [number, number, number][] = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [x, y, z] as [number, number, number])));
const Cage: React.FC<ObjProps> = ({p, mood, f, seed}) => {
  const s = 0.48;
  const edges: [number, number][] = [];
  CUBE.forEach((a, i) => CUBE.forEach((b, j) => j > i && a.filter((v, k) => v !== b[k]).length === 1 && edges.push([i, j])));
  const panel = Math.max(0.001, p);
  return (
    <group>
      {edges.map(([i, j]) => (
        <Rod key={`${i}-${j}`} a={CUBE[i].map((v) => v * s) as [number, number, number]} b={CUBE[j].map((v) => v * s) as [number, number, number]} r={0.022}>
          {M.chrome()}
        </Rod>
      ))}
      {CUBE.map((c, i) => (
        <mesh key={i} position={c.map((v) => v * s) as [number, number, number]}>
          <sphereGeometry args={[0.04, 16, 12]} />
          {M.chrome()}
        </mesh>
      ))}
      {/* glass walls slide shut as p goes 0 → 1 */}
      {[[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]].map(([x, y, z], i) => (
        <mesh key={i} position={[x * s, y * s, z * s]} rotation={[y ? Math.PI / 2 : 0, x ? Math.PI / 2 : 0, 0]} scale={[panel, panel, 1]}>
          <planeGeometry args={[s * 2, s * 2]} />
          {M.glass(mood === 'err' ? '#ffb4b4' : '#cfe0ff', 0.22)}
        </mesh>
      ))}
      <group scale={0.62}>
        <AgentOrb f={f} p={1} mood={mood} seed={seed} />
      </group>
    </group>
  );
};

const Chip: React.FC<ObjProps> = ({mood, f}) => {
  const pins = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < 9; i++) {
      const v = -0.48 + i * 0.12;
      out.push([v, 0, 0.64], [v, 0, -0.64], [0.64, 0, v], [-0.64, 0, v]);
    }
    return out;
  }, []);
  const pulse = 0.9 + 0.5 * Math.sin(f / 9);
  return (
    <group rotation={[0.85, 0.6, 0]} scale={0.95}>
      <mesh geometry={rbox(1.2, 0.1, 1.2, 0.04)}>{M.deep()}</mesh>
      <mesh geometry={rbox(0.74, 0.1, 0.74, 0.05)} position={[0, 0.09, 0]}>
        {M.steel()}
      </mesh>
      <mesh position={[0, 0.145, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.24, 48]} />
        {M.glow(MOOD[mood], pulse)}
      </mesh>
      {pins.map((pp, i) => (
        <mesh key={i} position={pp} rotation={[0, Math.abs(pp[0]) > 0.6 ? Math.PI / 2 : 0, 0]}>
          <boxGeometry args={[0.05, 0.03, 0.12]} />
          {M.gold()}
        </mesh>
      ))}
    </group>
  );
};

const Lens: React.FC<ObjProps> = ({f, mood}) => (
  <group>
    <mesh rotation={[0, 0, f / 40]}>
      <torusGeometry args={[0.5, 0.06, 24, 96]} />
      {M.chrome()}
    </mesh>
    <mesh rotation={[0, 0, -f / 25]}>
      <torusGeometry args={[0.38, 0.025, 16, 96, Math.PI * 1.5]} />
      {M.glow(MOOD[mood], 1.1)}
    </mesh>
    <mesh>
      <sphereGeometry args={[0.32, 48, 32]} />
      {M.graphite()}
    </mesh>
    <mesh position={[0, 0, 0.28]}>
      <circleGeometry args={[0.13, 48]} />
      {M.glow(MOOD[mood], 1.8)}
    </mesh>
    <mesh position={[0, 0, 0.05]}>
      <sphereGeometry args={[0.34, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
      {M.glass('#e5eeff', 0.2)}
    </mesh>
  </group>
);

const SLAB_MAT = [M.gold, M.deep, M.cobalt, M.periwinkle, M.frost];
const Slabs: React.FC<ObjProps> = ({p}) => (
  <group rotation={[0.55, 0.7, 0]}>
    {SLAB_MAT.map((mat, i) => {
      const k = Math.min(1, Math.max(0, p * SLAB_MAT.length - i));
      return (
        <mesh key={i} geometry={rbox(1.1, 0.13, 1.1, 0.05)} position={[0, -0.44 + i * 0.22 + (1 - k) * 0.5, 0]} scale={Math.max(0.001, k)}>
          {mat()}
        </mesh>
      );
    })}
  </group>
);

const Pause: React.FC<ObjProps> = () => (
  <group>
    <mesh geometry={rbox(1, 1, 0.22, 0.2)}>{M.cobalt()}</mesh>
    {[-0.15, 0.15].map((x) => (
      <mesh key={x} geometry={rbox(0.17, 0.5, 0.12, 0.06)} position={[x, 0, 0.13]}>
        {M.frost()}
      </mesh>
    ))}
  </group>
);

const pediment = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.74, 0);
  s.lineTo(0.74, 0);
  s.lineTo(0, 0.24);
  s.lineTo(-0.74, 0);
  return s;
};
const Building: React.FC<ObjProps> = ({mood}) => (
  <group rotation={[0.12, -0.35, 0]}>
    <mesh geometry={rbox(1.56, 0.08, 0.86, 0.02)} position={[0, -0.47, 0]}>{M.marble()}</mesh>
    <mesh geometry={rbox(1.44, 0.08, 0.76, 0.02)} position={[0, -0.39, 0]}>{M.marble()}</mesh>
    <mesh geometry={rbox(1.2, 0.62, 0.3, 0.02)} position={[0, -0.04, -0.18]}>{M.periwinkle()}</mesh>
    {[-0.55, -0.33, -0.11, 0.11, 0.33, 0.55].map((x) => (
      <mesh key={x} position={[x, -0.04, 0.2]}>
        <cylinderGeometry args={[0.055, 0.065, 0.62, 24]} />
        {M.marble()}
      </mesh>
    ))}
    <mesh geometry={rbox(1.44, 0.1, 0.78, 0.02)} position={[0, 0.32, 0]}>{M.marble()}</mesh>
    <mesh geometry={extrude('pediment', pediment, 0.62, 0.02)} position={[0, 0.49, 0]}>{M.marble()}</mesh>
    <mesh position={[0, 0.49, 0.36]}>
      <circleGeometry args={[0.05, 32]} />
      {M.glow(MOOD[mood], 1)}
    </mesh>
  </group>
);

const Key: React.FC<ObjProps> = () => (
  <group rotation={[0.3, -0.4, -0.5]}>
    <mesh position={[-0.42, 0, 0]}>
      <torusGeometry args={[0.2, 0.07, 24, 64]} />
      {M.gold()}
    </mesh>
    <mesh geometry={rbox(0.78, 0.08, 0.08, 0.03)} position={[0.16, 0, 0]}>{M.gold()}</mesh>
    {[0.34, 0.46].map((x, i) => (
      <mesh key={x} geometry={rbox(0.07, i ? 0.2 : 0.14, 0.07, 0.02)} position={[x, -0.1 - i * 0.03, 0]}>
        {M.gold()}
      </mesh>
    ))}
  </group>
);

const Repo: React.FC<ObjProps> = ({p}) => (
  <group rotation={[0.45, -0.5, 0]}>
    <mesh geometry={rbox(1.1, 0.05, 0.8, 0.02)} position={[0, -0.3, 0]}>{M.deep()}</mesh>
    {[
      [0, -0.12, 0.38, 1.1, 0.4, 0.05],
      [0, -0.12, -0.38, 1.1, 0.4, 0.05],
      [0.53, -0.12, 0, 0.05, 0.4, 0.8],
      [-0.53, -0.12, 0, 0.05, 0.4, 0.8],
    ].map(([x, y, z, w, h, d], i) => (
      <mesh key={i} geometry={rbox(w, h, d, 0.02)} position={[x, y, z]}>
        {M.cobalt()}
      </mesh>
    ))}
    <group position={[0, 0.08, -0.4]} rotation={[-0.3 - p * 1.2, 0, 0]}>
      <mesh geometry={rbox(1.14, 0.05, 0.84, 0.02)} position={[0, 0, 0.42]}>{M.periwinkle()}</mesh>
    </group>
  </group>
);

const Paper: React.FC<ObjProps> = ({seed}) => (
  <group rotation={[0.15, -0.3 + (random(`pp${seed}`) - 0.5) * 0.3, (random(`pr${seed}`) - 0.5) * 0.2]}>
    <mesh geometry={rbox(0.7, 0.92, 0.015, 0.01)}>{M.paper()}</mesh>
    {[0.3, 0.18, 0.06, -0.06, -0.18, -0.3].map((y, i) => (
      <mesh key={y} position={[-0.04 * (i % 2), y, 0.012]}>
        <planeGeometry args={[i === 0 ? 0.3 : 0.5 - 0.06 * (i % 3), 0.035]} />
        <meshStandardMaterial color={i === 0 ? '#2b5cc0' : '#a9bad4'} roughness={1} />
      </mesh>
    ))}
  </group>
);

const Lock: React.FC<ObjProps> = ({p, mood}) => (
  <group rotation={[0.1, -0.35, 0]}>
    <mesh geometry={rbox(0.74, 0.58, 0.3, 0.08)} position={[0, -0.18, 0]}>{M.gold()}</mesh>
    <mesh position={[0, 0.12 + p * 0.18, 0]}>
      <torusGeometry args={[0.23, 0.06, 20, 48, Math.PI]} />
      {M.chrome()}
    </mesh>
    {[-0.23, 0.23].map((x) => (
      <mesh key={x} position={[x, 0.1 + (x > 0 ? p * 0.18 : 0), 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12 + (x > 0 ? 0 : p * 0.36), 20]} />
        {M.chrome()}
      </mesh>
    ))}
    <mesh position={[0, -0.16, 0.16]}>
      <circleGeometry args={[0.07, 32]} />
      {M.glow(MOOD[mood], 1.2)}
    </mesh>
  </group>
);

// Abstract photo: soft sky + hills gradient, seeded, drawn to a canvas texture.
const photoTex = (seed: number) => {
  const key = `photo${seed}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 192;
  const g = c.getContext('2d')!;
  const hue = [214, 200, 35, 330, 160][seed % 5];
  const sky = g.createLinearGradient(0, 0, 0, 192);
  sky.addColorStop(0, `hsl(${hue},55%,72%)`);
  sky.addColorStop(1, `hsl(${hue + 20},40%,88%)`);
  g.fillStyle = sky;
  g.fillRect(0, 0, 256, 192);
  g.fillStyle = `hsla(${hue + 40},60%,92%,0.9)`;
  g.beginPath();
  g.arc(60 + random(`s${seed}`) * 140, 60, 18, 0, Math.PI * 2);
  g.fill();
  for (let k = 0; k < 2; k++) {
    g.fillStyle = `hsl(${hue - 10 + k * 15},35%,${40 + k * 14}%)`;
    g.beginPath();
    g.moveTo(0, 192);
    for (let x = 0; x <= 256; x += 16) g.lineTo(x, 120 + k * 22 + Math.sin(x / 30 + seed + k * 2) * 18);
    g.lineTo(256, 192);
    g.fill();
  }
  if (seed >= 100) {
    // portrait: a generic silhouette (no real person), so the print reads as someone's private photo
    g.fillStyle = `hsl(${hue + 200},30%,22%)`;
    g.beginPath();
    g.arc(128, 86, 30, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(128, 196, 70, 70, 0, Math.PI, 0);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
};
const texCache = new Map<string, THREE.Texture>();

const Photo: React.FC<ObjProps> = ({seed}) => (
  <group rotation={[0.05, -0.2, (random(`ph${seed}`) - 0.5) * 0.4]}>
    <mesh geometry={rbox(0.86, 0.7, 0.02, 0.01)}>{M.paper()}</mesh>
    <mesh position={[0, 0.04, 0.012]}>
      <planeGeometry args={[0.76, 0.54]} />
      <meshStandardMaterial map={photoTex(seed)} roughness={0.5} />
    </mesh>
  </group>
);

const Chain: React.FC<ObjProps> = ({f}) => (
  <group rotation={[0.3, f / 60, 0.4]}>
    {[-0.36, 0, 0.36].map((x, i) => (
      <mesh key={x} position={[x, 0, 0]} rotation={[i % 2 ? Math.PI / 2 : 0, 0, 0]} scale={[1.5, 1, 1]}>
        <torusGeometry args={[0.17, 0.05, 20, 48]} />
        {M.chrome()}
      </mesh>
    ))}
  </group>
);

const flap = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.5, 0);
  s.lineTo(0.5, 0);
  s.lineTo(0, -0.34);
  s.lineTo(-0.5, 0);
  return s;
};
const Envelope: React.FC<ObjProps> = ({seed}) => (
  <group rotation={[0.1, -0.25, (random(`en${seed}`) - 0.5) * 0.3]}>
    <mesh geometry={rbox(1, 0.64, 0.04, 0.02)}>{M.frost()}</mesh>
    <mesh geometry={extrude('flap', flap, 0.005, 0.005)} position={[0, 0.2, 0.03]}>{M.periwinkle()}</mesh>
    <mesh position={[0, 0.04, 0.045]}>
      <circleGeometry args={[0.07, 32]} />
      {M.glow(C.err, 0.8)}
    </mesh>
  </group>
);

const Mic: React.FC<ObjProps> = ({mood}) => (
  <group rotation={[0.15, 0, -0.12]}>
    <mesh position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.26, 48, 32]} />
      {M.graphite()}
    </mesh>
    <mesh position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.275, 24, 16]} />
      <meshStandardMaterial color="#e9edf5" metalness={1} roughness={0.2} wireframe />
    </mesh>
    <mesh position={[0, 0.06, 0]}>
      <torusGeometry args={[0.2, 0.035, 16, 48]} />
      {M.glow(MOOD[mood], 1.2)}
    </mesh>
    <mesh position={[0, -0.22, 0]}>
      <cylinderGeometry args={[0.19, 0.12, 0.56, 48]} />
      {M.chrome()}
    </mesh>
    <mesh position={[0, -0.5, 0]}>
      <cylinderGeometry args={[0.045, 0.045, 0.14, 16]} />
      {M.steel()}
    </mesh>
  </group>
);

const Globe: React.FC<ObjProps> = ({f}) => (
  <group rotation={[0.35, f / 70, 0.2]}>
    <mesh>
      <sphereGeometry args={[0.5, 64, 48]} />
      {M.glass('#cfe0ff', 0.2)}
    </mesh>
    <mesh>
      <sphereGeometry args={[0.2, 32, 24]} />
      {M.glow('#6f9bff', 1.3)}
    </mesh>
    {[-0.6, -0.3, 0, 0.3, 0.6].map((lat) => (
      <mesh key={lat} position={[0, 0.5 * Math.sin(lat), 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5 * Math.cos(lat), 0.008, 8, 96]} />
        {M.chrome()}
      </mesh>
    ))}
    {[0, 1, 2, 3, 4, 5].map((k) => (
      <mesh key={k} rotation={[0, (k * Math.PI) / 6, 0]}>
        <torusGeometry args={[0.5, 0.008, 8, 96]} />
        {M.chrome()}
      </mesh>
    ))}
  </group>
);

const Stopwatch: React.FC<ObjProps> = ({p, mood}) => (
  <group rotation={[0.1, -0.3, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.46, 0.46, 0.14, 64]} />
      {M.chrome()}
    </mesh>
    <mesh position={[0, 0, 0.072]}>
      <circleGeometry args={[0.4, 64]} />
      {M.frost()}
    </mesh>
    {Array.from({length: 12}).map((_, i) => (
      <mesh key={i} position={[0.33 * Math.sin((i * Math.PI) / 6), 0.33 * Math.cos((i * Math.PI) / 6), 0.075]} rotation={[0, 0, -(i * Math.PI) / 6]}>
        <planeGeometry args={[0.02, i % 3 ? 0.04 : 0.08]} />
        <meshStandardMaterial color="#0b2f7e" />
      </mesh>
    ))}
    {/* progress arc and hand */}
    <mesh position={[0, 0, 0.076]} rotation={[0, 0, Math.PI / 2]} scale={[-1, 1, 1]}>
      <ringGeometry args={[0.24, 0.28, 64, 1, 0, Math.max(0.001, p * Math.PI * 2)]} />
      {M.glow(MOOD[mood], 1)}
    </mesh>
    <mesh position={[0.14 * Math.sin(p * Math.PI * 2), 0.14 * Math.cos(p * Math.PI * 2), 0.08]} rotation={[0, 0, -p * Math.PI * 2]}>
      <planeGeometry args={[0.025, 0.3]} />
      <meshStandardMaterial color="#0b2f7e" />
    </mesh>
    <mesh position={[0, 0.54, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.12, 24]} />
      {M.chrome()}
    </mesh>
  </group>
);

const Phone: React.FC<ObjProps> = ({mood, f}) => (
  <group rotation={[0.08, -0.35, 0.08]}>
    <mesh geometry={rbox(0.56, 1.1, 0.07, 0.08)}>{M.graphite()}</mesh>
    <mesh position={[0, 0, 0.037]}>
      <planeGeometry args={[0.5, 1.02]} />
      <meshStandardMaterial color="#123a8c" emissive="#1d4fb8" emissiveIntensity={0.7} roughness={0.2} />
    </mesh>
    <mesh position={[0, -0.1, 0.04]}>
      <circleGeometry args={[0.09 + 0.01 * Math.sin(f / 5), 32]} />
      {M.glow(MOOD[mood], 1.2)}
    </mesh>
  </group>
);

const Coin: React.FC<ObjProps> = () => (
  <group rotation={[Math.PI / 2 - 0.25, 0, 0]}>
    <mesh>
      <cylinderGeometry args={[0.42, 0.42, 0.08, 64]} />
      {M.gold()}
    </mesh>
    <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.34, 0.02, 12, 64]} />
      {M.gold()}
    </mesh>
  </group>
);

const CoinStack: React.FC<ObjProps> = ({p, seed}) => {
  const n = 9;
  return (
    <group rotation={[0.45, 0.4, 0]}>
      {Array.from({length: n}).map((_, i) => {
        const k = Math.min(1, Math.max(0, p * n - i));
        return (
          <mesh key={i} position={[(random(`cx${seed}${i}`) - 0.5) * 0.05, -0.46 + i * 0.1 + (1 - k) * 0.8, (random(`cz${seed}${i}`) - 0.5) * 0.05]} scale={Math.max(0.001, Math.min(1, k * 1.5))}>
            <cylinderGeometry args={[0.4, 0.4, 0.09, 64]} />
            {M.gold()}
          </mesh>
        );
      })}
    </group>
  );
};

// A single bar for charts; p is its height 0 → 1 (1 = 1 unit tall).
const Bar: React.FC<ObjProps> = ({p, mood}) => {
  const h = Math.max(0.02, p);
  return (
    <group rotation={[0.2, -0.5, 0]}>
      <mesh geometry={rbox(0.5, 1, 0.5, 0.05)} position={[0, h / 2 - 0.5, 0]} scale={[1, h, 1]}>
        {mood === 'warn' ? M.gold() : M.cobalt()}
      </mesh>
    </group>
  );
};

const Card: React.FC<ObjProps> = ({mood}) => (
  <group rotation={[0.25, -0.45, 0.05]}>
    <mesh geometry={rbox(1, 0.62, 0.03, 0.05)}>{M.cobalt()}</mesh>
    <mesh geometry={rbox(0.17, 0.13, 0.01, 0.02)} position={[-0.28, 0.06, 0.02]}>{M.gold()}</mesh>
    <mesh position={[0.05, -0.17, 0.018]}>
      <planeGeometry args={[0.7, 0.05]} />
      {M.glow(MOOD[mood], 0.6)}
    </mesh>
  </group>
);

const Ticket: React.FC<ObjProps> = ({mood}) => (
  <group rotation={[0.2, -0.4, -0.08]}>
    <mesh geometry={rbox(1, 0.46, 0.03, 0.04)}>{M.frost()}</mesh>
    <mesh position={[0.34, 0, 0.018]}>
      <planeGeometry args={[0.2, 0.44]} />
      <meshStandardMaterial color="#2b5cc0" />
    </mesh>
    {[0.1, 0, -0.1].map((y, i) => (
      <mesh key={y} position={[-0.14, y, 0.018]}>
        <planeGeometry args={[i ? 0.5 : 0.3, 0.035]} />
        <meshStandardMaterial color={i ? '#a9bad4' : MOOD[mood]} />
      </mesh>
    ))}
  </group>
);

const NET: [number, number, number][] = [[0, 0, 0], [-0.62, 0.34, 0.1], [0.6, 0.38, -0.1], [-0.5, -0.4, -0.1], [0.55, -0.36, 0.15], [0.05, 0.62, -0.2]];
const Network: React.FC<ObjProps> = ({p, mood, f}) => (
  <group rotation={[0.1, f / 120, 0]}>
    {NET.slice(1).map((n, i) => {
      const k = Math.min(1, Math.max(0, p * 5 - i));
      const end = n.map((v) => v * k) as [number, number, number];
      return (
        <group key={i}>
          {k > 0.02 && (
            <Rod a={[0, 0, 0]} b={end} r={0.012}>
              {M.glow(MOOD[mood], 0.9)}
            </Rod>
          )}
          <mesh position={end} scale={Math.max(0.001, k)}>
            <sphereGeometry args={[0.11, 32, 24]} />
            {i % 2 ? M.frost() : M.periwinkle()}
          </mesh>
        </group>
      );
    })}
    <mesh>
      <sphereGeometry args={[0.18, 48, 32]} />
      {M.cobalt()}
    </mesh>
  </group>
);

const Capitol: React.FC<ObjProps> = () => {
  const dome: [number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * (Math.PI / 2);
    dome.push([0.36 * Math.cos(a) + 0.0001, 0.34 * Math.sin(a)]);
  }
  return (
    <group rotation={[0.08, -0.25, 0]} position={[0, -0.05, 0]}>
      <mesh geometry={rbox(1.7, 0.14, 0.7, 0.02)} position={[0, -0.44, 0]}>{M.marble()}</mesh>
      <mesh geometry={rbox(1.5, 0.22, 0.6, 0.02)} position={[0, -0.26, 0]}>{M.marble()}</mesh>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.44, 0.46, 0.14, 48]} />
        {M.marble()}
      </mesh>
      {Array.from({length: 20}).map((_, i) => (
        <mesh key={i} position={[0.4 * Math.sin((i / 20) * Math.PI * 2), 0.07, 0.4 * Math.cos((i / 20) * Math.PI * 2)]}>
          <cylinderGeometry args={[0.022, 0.022, 0.18, 12]} />
          {M.marble()}
        </mesh>
      ))}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.03, 48]} />
        {M.marble()}
      </mesh>
      <mesh geometry={lathe('dome', dome)} position={[0, 0.18, 0]}>
        {M.marble()}
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.1, 24]} />
        {M.marble()}
      </mesh>
      <mesh position={[0, 0.63, 0]}>
        <sphereGeometry args={[0.035, 16, 12]} />
        {M.gold()}
      </mesh>
    </group>
  );
};

const Siren: React.FC<ObjProps> = ({f, mood}) => {
  const on = 0.6 + 0.9 * Math.max(0, Math.sin(f / 4));
  const bell: [number, number][] = [];
  for (let i = 0; i <= 20; i++) {
    const a = (i / 20) * (Math.PI / 2);
    bell.push([0.34 * Math.cos(a) + 0.0001, 0.5 * Math.sin(a)]);
  }
  return (
    <group rotation={[0.15, 0, 0]}>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.44, 0.48, 0.16, 48]} />
        {M.chrome()}
      </mesh>
      <mesh geometry={lathe('siren', bell)} position={[0, -0.32, 0]}>
        {M.glass(MOOD[mood], 0.55)}
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.14, 24, 16]} />
        {M.glow(MOOD[mood], on * 1.6)}
      </mesh>
      <group rotation={[0, f / 6, 0]}>
        <mesh position={[0.12, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.08, 0.2, 24, 1, true]} />
          {M.chrome()}
        </mesh>
      </group>
    </group>
  );
};

const Magnifier: React.FC<ObjProps> = () => (
  <group rotation={[0.2, -0.3, 0.6]}>
    <mesh position={[0, 0.16, 0]}>
      <torusGeometry args={[0.3, 0.05, 24, 64]} />
      {M.chrome()}
    </mesh>
    <mesh position={[0, 0.16, 0]}>
      <circleGeometry args={[0.3, 64]} />
      {M.glass('#e3ecff', 0.25)}
    </mesh>
    <mesh position={[0, -0.33, 0]}>
      <cylinderGeometry args={[0.05, 0.06, 0.46, 24]} />
      {M.graphite()}
    </mesh>
  </group>
);

const Hourglass: React.FC<ObjProps> = ({p}) => {
  const bulb: [number, number][] = [];
  for (let i = 0; i <= 30; i++) {
    const y = -0.44 + (i / 30) * 0.88;
    bulb.push([0.05 + 0.27 * Math.pow(Math.abs(y) / 0.44, 0.7), y]);
  }
  const top = Math.max(0.001, 1 - p);
  const bot = Math.max(0.001, p);
  return (
    <group rotation={[0.1, 0, 0.08]}>
      {[0.5, -0.5].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.07, 48]} />
          {M.gold()}
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.36 * Math.sin((i * Math.PI * 2) / 3), 0, 0.36 * Math.cos((i * Math.PI * 2) / 3)]}>
          <cylinderGeometry args={[0.025, 0.025, 0.94, 12]} />
          {M.gold()}
        </mesh>
      ))}
      <mesh geometry={lathe('hourglass', bulb)}>{M.glass('#e7efff', 0.26)}</mesh>
      <mesh position={[0, 0.06 + 0.16 * top, 0]} rotation={[Math.PI, 0, 0]} scale={[top, top, top]}>
        <coneGeometry args={[0.24, 0.3, 32]} />
        <meshStandardMaterial color={C.warn} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.44 + 0.15 * bot, 0]} scale={[Math.sqrt(bot), bot, Math.sqrt(bot)]}>
        <coneGeometry args={[0.3, 0.3, 32]} />
        <meshStandardMaterial color={C.warn} roughness={0.9} />
      </mesh>
    </group>
  );
};

// Balance scale: p is the tilt, -1 (left down) … 1 (right down).
const Scale: React.FC<ObjProps> = ({p}) => {
  const a = -p * 0.35;
  const arm = 0.62;
  const pan: [number, number][] = [
    [0.0001, 0],
    [0.2, 0.01],
    [0.26, 0.07],
  ];
  return (
    <group position={[0, -0.05, 0]}>
      <mesh position={[0, -0.47, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.06, 48]} />
        {M.gold()}
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.84, 16]} />
        {M.gold()}
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.06, 24, 16]} />
        {M.gold()}
      </mesh>
      <group position={[0, 0.34, 0]} rotation={[0, 0, a]}>
        <mesh geometry={rbox(arm * 2 + 0.1, 0.04, 0.04, 0.015)}>{M.gold()}</mesh>
      </group>
      {[-1, 1].map((s) => {
        const x = s * arm * Math.cos(a);
        const y = 0.34 + s * arm * Math.sin(a);
        return (
          <group key={s} position={[x, y, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.4, 6]} />
              {M.gold()}
            </mesh>
            <mesh geometry={lathe('pan', pan, 48)} position={[0, -0.42, 0]}>
              {M.gold()}
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const Calendar: React.FC<ObjProps> = () => (
  <group rotation={[0.12, -0.3, 0]}>
    <mesh geometry={rbox(0.9, 1, 0.1, 0.07)}>{M.frost()}</mesh>
    <mesh geometry={rbox(0.9, 0.26, 0.11, 0.07)} position={[0, 0.37, 0.005]}>{M.glow(C.err, 0.35)}</mesh>
    {[-0.22, 0.22].map((x) => (
      <mesh key={x} position={[x, 0.52, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.06, 0.018, 12, 32]} />
        {M.chrome()}
      </mesh>
    ))}
  </group>
);

const Table: React.FC<ObjProps> = ({p}) => (
  <group rotation={[0.55, 0, 0]} position={[0, 0.05, 0]}>
    <mesh position={[0, -0.05, 0]}>
      <cylinderGeometry args={[0.72, 0.72, 0.06, 64]} />
      {M.frost()}
    </mesh>
    <mesh position={[0, -0.4, 0]}>
      <cylinderGeometry args={[0.08, 0.2, 0.66, 32]} />
      {M.chrome()}
    </mesh>
    {[-0.9, 0, 0.9].map((a, i) => {
      const k = Math.min(1, Math.max(0, p * 3 - i));
      return (
        <group key={a} rotation={[0, a + Math.PI, 0]}>
          <group position={[0, 0, 0.92]} scale={Math.max(0.001, k)}>
            <mesh geometry={rbox(0.3, 0.05, 0.28, 0.02)} position={[0, -0.12, 0]}>{M.graphite()}</mesh>
            <mesh geometry={rbox(0.3, 0.36, 0.05, 0.02)} position={[0, 0.06, 0.13]}>{M.graphite()}</mesh>
          </group>
        </group>
      );
    })}
  </group>
);

const Gavel: React.FC<ObjProps> = ({p}) => {
  const hit = Math.sin(Math.min(1, p) * Math.PI);
  return (
    <group rotation={[0.25, -0.5, 0]}>
      <mesh position={[-0.26, -0.48, 0]}>
        <cylinderGeometry args={[0.3, 0.32, 0.08, 48]} />
        {M.graphite()}
      </mesh>
      {/* pivot at the handle's end, bottom right */}
      <group position={[0.42, -0.3, 0]} rotation={[0, 0, -(0.55 - hit * 0.45)]}>
        <mesh position={[-0.34, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.04, 0.68, 16]} />
          {M.graphite()}
        </mesh>
        <mesh position={[-0.7, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.42, 32]} />
          {M.gold()}
        </mesh>
        {[-0.2, 0.2].map((y) => (
          <mesh key={y} position={[-0.7, y, 0]}>
            <cylinderGeometry args={[0.135, 0.135, 0.04, 32]} />
            {M.gold()}
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Rocket: React.FC<ObjProps> = ({f}) => {
  const body: [number, number][] = [
    [0.0001, -0.42],
    [0.16, -0.4],
    [0.2, -0.2],
    [0.2, 0.1],
    [0.15, 0.3],
    [0.0001, 0.52],
  ];
  return (
    <group rotation={[0, 0, -0.75]}>
      <mesh geometry={lathe('rocket', body)}>{M.frost()}</mesh>
      <mesh position={[0, 0.12, 0.17]}>
        <circleGeometry args={[0.07, 32]} />
        {M.glow('#6f9bff', 1.2)}
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} geometry={rbox(0.03, 0.22, 0.14, 0.01)} position={[0.2 * Math.sin((i * Math.PI * 2) / 3), -0.36, 0.2 * Math.cos((i * Math.PI * 2) / 3)]} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
          {M.cobalt()}
        </mesh>
      ))}
      <mesh position={[0, -0.56, 0]} rotation={[Math.PI, 0, 0]} scale={[1, 1 + 0.2 * Math.sin(f / 2), 1]}>
        <coneGeometry args={[0.12, 0.3, 24]} />
        {M.glow(C.warn, 2)}
      </mesh>
    </group>
  );
};

const Barrier: React.FC<ObjProps> = () => (
  <group rotation={[0.1, -0.4, 0]}>
    {[-0.55, 0.55].map((x) => (
      <mesh key={x} geometry={rbox(0.1, 0.9, 0.1, 0.03)} position={[x, -0.05, 0]}>
        {M.steel()}
      </mesh>
    ))}
    {[0.2, -0.12].map((y) => (
      <group key={y} position={[0, y, 0.07]}>
        <mesh geometry={rbox(1.4, 0.2, 0.05, 0.03)}>{M.frost()}</mesh>
        {[-0.45, -0.15, 0.15, 0.45].map((x) => (
          <mesh key={x} position={[x, 0, 0.03]} rotation={[0, 0, 0.6]}>
            <planeGeometry args={[0.1, 0.24]} />
            {M.glow(C.warn, 0.5)}
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

const KillSwitch: React.FC<ObjProps> = ({p}) => (
  <group rotation={[0.55, -0.3, 0]}>
    <mesh geometry={rbox(1.1, 0.3, 1.1, 0.1)} position={[0, -0.3, 0]}>{M.graphite()}</mesh>
    <mesh position={[0, -0.12, 0]}>
      <cylinderGeometry args={[0.4, 0.42, 0.08, 64]} />
      {M.gold()}
    </mesh>
    <group position={[0, -0.02 - p * 0.08, 0]}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.16, 64]} />
        {M.glow(C.err, 0.5 + p * 1.2)}
      </mesh>
      <mesh position={[0, 0.08, 0]} scale={[1, 0.35, 1]}>
        <sphereGeometry args={[0.3, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {M.glow(C.err, 0.6 + p * 1.2)}
      </mesh>
    </group>
  </group>
);

const Bubble: React.FC<ObjProps> = ({f}) => (
  <group rotation={[0.1, -0.3, 0]}>
    <mesh geometry={rbox(1.1, 0.7, 0.2, 0.18)}>{M.frost()}</mesh>
    <mesh position={[-0.3, -0.4, 0]} rotation={[0, 0, 0.5]}>
      <coneGeometry args={[0.1, 0.22, 24]} />
      {M.frost()}
    </mesh>
    {[-0.24, 0, 0.24].map((x, i) => (
      <mesh key={x} position={[x, 0.02 * Math.sin(f / 5 - i), 0.12]}>
        <sphereGeometry args={[0.06, 24, 16]} />
        {M.cobalt()}
      </mesh>
    ))}
  </group>
);

const Bell: React.FC<ObjProps> = ({f}) => {
  const prof: [number, number][] = [
    [0.0001, 0.4],
    [0.1, 0.38],
    [0.2, 0.2],
    [0.25, -0.1],
    [0.38, -0.3],
    [0.4, -0.34],
  ];
  return (
    <group rotation={[0, 0, Math.sin(f / 3) * 0.25 * Math.max(0, Math.sin(f / 20))]}>
      <mesh geometry={lathe('bell', prof)}>{M.gold()}</mesh>
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.07, 24, 16]} />
        {M.gold()}
      </mesh>
    </group>
  );
};

// A hundred partner tokens: scattered, then pulling into a ring (p = 0 → 1).
const Tokens: React.FC<ObjProps> = ({p, f}) => {
  const n = 100;
  const pts = useMemo(
    () =>
      Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const ring = [Math.cos(a) * (1.25 + (i % 3) * 0.14), Math.sin(a) * (1.25 + (i % 3) * 0.14), (i % 3) * -0.1];
        const far = [(random(`tx${i}`) - 0.5) * 9, (random(`ty${i}`) - 0.5) * 5, -1 - random(`tz${i}`) * 3];
        return {ring, far, d: random(`td${i}`) * 0.4};
      }),
    [],
  );
  return (
    <group rotation={[0, 0, f / 400]}>
      {pts.map(({ring, far, d}, i) => {
        const k = Math.min(1, Math.max(0, (p - d) / 0.6));
        const e = 1 - Math.pow(1 - k, 3);
        return (
          <mesh key={i} position={[far[0] + (ring[0] - far[0]) * e, far[1] + (ring[1] - far[1]) * e, far[2] + (ring[2] - far[2]) * e]} rotation={[Math.PI / 2, 0, 0]} scale={Math.max(0.001, Math.min(1, p * 3))}>
            <cylinderGeometry args={[0.07, 0.07, 0.025, 24]} />
            {i % 7 === 0 ? M.gold() : i % 2 ? M.frost() : M.periwinkle()}
          </mesh>
        );
      })}
    </group>
  );
};

export const OBJ = {
  shield: Shield,
  orb: AgentOrb,
  cage: Cage,
  chip: Chip,
  lens: Lens,
  slabs: Slabs,
  pause: Pause,
  building: Building,
  key: Key,
  repo: Repo,
  paper: Paper,
  lock: Lock,
  photo: Photo,
  chain: Chain,
  envelope: Envelope,
  mic: Mic,
  globe: Globe,
  stopwatch: Stopwatch,
  phone: Phone,
  coin: Coin,
  coins: CoinStack,
  bar: Bar,
  card: Card,
  ticket: Ticket,
  network: Network,
  capitol: Capitol,
  siren: Siren,
  magnifier: Magnifier,
  hourglass: Hourglass,
  scale: Scale,
  calendar: Calendar,
  table: Table,
  gavel: Gavel,
  rocket: Rocket,
  barrier: Barrier,
  killswitch: KillSwitch,
  bubble: Bubble,
  bell: Bell,
  tokens: Tokens,
} satisfies Record<string, React.FC<ObjProps>>;
export type ObjKind = keyof typeof OBJ;
