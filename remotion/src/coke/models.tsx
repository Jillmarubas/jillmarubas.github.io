import React, {useMemo} from 'react';
import * as THREE from 'three';
import {random} from 'remotion';

// All models are original, built from primitives. Nothing here reproduces a brand's
// trademarked shapes (no contour bottle, no logo script).

const lathe = (pts: [number, number][], seg = 64) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

const glassMat = (tint = '#ffffff', rough = 0.04) =>
  new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness: rough,
    transmission: 1,
    thickness: 0.15,
    ior: 1.5,
    transparent: true,
    envMapIntensity: 1.2,
    side: THREE.DoubleSide,
  });

/* -------------------------------------------------------- soda glass with fizz */
export const SodaGlass: React.FC<{fill: number; frame: number; bubbles?: boolean}> = ({fill, frame, bubbles = true}) => {
  const g = useMemo(
    () => ({
      glass: lathe([
        [0.0, 0.0],
        [0.44, 0.0],
        [0.46, 0.04],
        [0.48, 0.2],
        [0.6, 1.9],
        [0.62, 1.95],
        [0.58, 1.95],
        [0.56, 1.88],
        [0.44, 0.24],
        [0.0, 0.2],
      ]),
      mat: glassMat(),
      liquid: new THREE.MeshPhysicalMaterial({color: '#5a2309', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, emissive: '#2a0e02', emissiveIntensity: 0.4}),
      foam: new THREE.MeshStandardMaterial({color: '#d9b48a', roughness: 0.9}),
      bubble: new THREE.MeshPhysicalMaterial({color: '#fff', roughness: 0, transmission: 0.6, transparent: true, opacity: 0.9}),
    }),
    [],
  );
  const h = 0.22 + 1.58 * fill;
  const rAt = (y: number) => 0.44 + ((y - 0.24) / (1.88 - 0.24)) * 0.12;
  return (
    <group>
      <mesh geometry={g.glass} material={g.mat} castShadow />
      {fill > 0.01 && (
        <>
          <mesh position={[0, (0.22 + h) / 2, 0]} material={g.liquid}>
            <cylinderGeometry args={[rAt(h) - 0.02, 0.43, h - 0.22, 48]} />
          </mesh>
          <mesh position={[0, h + 0.015, 0]} material={g.foam}>
            <cylinderGeometry args={[rAt(h) - 0.02, rAt(h) - 0.02, 0.03, 48]} />
          </mesh>
        </>
      )}
      {bubbles &&
        fill > 0.1 &&
        Array.from({length: 36}).map((_, i) => {
          const speed = 0.012 + random(`bs${i}`) * 0.02;
          const y = 0.25 + (((frame * speed + random(`by${i}`) * 3) % 1) * (h - 0.3));
          const a = random(`ba${i}`) * Math.PI * 2;
          const r = random(`br${i}`) * (rAt(y) - 0.08);
          return (
            <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} material={g.bubble}>
              <sphereGeometry args={[0.012 + random(`bz${i}`) * 0.018, 8, 6]} />
            </mesh>
          );
        })}
    </group>
  );
};

/* -------------------------------------------------------- pharmacy props */
export const Mortar: React.FC = () => {
  const g = useMemo(
    () => ({
      bowl: lathe([
        [0, 0],
        [0.5, 0],
        [0.62, 0.08],
        [0.7, 0.35],
        [0.66, 0.55],
        [0.58, 0.55],
        [0.6, 0.35],
        [0.45, 0.14],
        [0, 0.12],
      ]),
      stone: new THREE.MeshStandardMaterial({color: '#d8d4cc', roughness: 0.85}),
      wood: new THREE.MeshPhysicalMaterial({color: '#6b4a32', roughness: 0.45, clearcoat: 0.5}),
    }),
    [],
  );
  return (
    <group>
      <mesh geometry={g.bowl} material={g.stone} castShadow receiveShadow />
      <group position={[0.18, 0.55, 0]} rotation={[0, 0, -0.55]}>
        <mesh material={g.stone} castShadow>
          <capsuleGeometry args={[0.07, 0.9, 8, 16]} />
        </mesh>
      </group>
    </group>
  );
};

export const ApothecaryBottle: React.FC<{label?: string}> = ({label = 'TINCT.'}) => {
  const g = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const x = c.getContext('2d')!;
    x.fillStyle = '#efe6d2';
    x.fillRect(0, 0, 512, 256);
    x.strokeStyle = '#3a2a1a';
    x.lineWidth = 6;
    x.strokeRect(14, 14, 484, 228);
    x.fillStyle = '#3a2a1a';
    x.font = 'bold 72px Georgia';
    x.textAlign = 'center';
    x.fillText(label, 256, 150);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return {
      body: lathe([
        [0, 0],
        [0.42, 0],
        [0.45, 0.05],
        [0.45, 1.05],
        [0.3, 1.25],
        [0.14, 1.32],
        [0.14, 1.5],
        [0.17, 1.55],
        [0, 1.55],
      ]),
      glass: glassMat('#b8742e', 0.08),
      cork: new THREE.MeshStandardMaterial({color: '#a57c52', roughness: 0.95}),
      label: new THREE.MeshStandardMaterial({map: t, roughness: 0.9}),
    };
  }, [label]);
  return (
    <group>
      <mesh geometry={g.body} material={g.glass} castShadow />
      <mesh position={[0, 1.62, 0]} material={g.cork} castShadow>
        <cylinderGeometry args={[0.13, 0.11, 0.2, 24]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} material={g.label}>
        <cylinderGeometry args={[0.458, 0.458, 0.42, 48, 1, true, -0.9, 1.8]} />
      </mesh>
    </group>
  );
};

export const WineBottle: React.FC<{opacity?: number}> = ({opacity = 1}) => {
  const g = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 320;
    const x = c.getContext('2d')!;
    x.fillStyle = '#ece3cf';
    x.fillRect(0, 0, 512, 320);
    x.fillStyle = '#2a1d12';
    x.textAlign = 'center';
    x.font = 'italic 40px Georgia';
    x.fillText('tonic wine', 256, 90);
    x.font = 'bold 64px Georgia';
    x.fillText('COCA · KOLA', 256, 175);
    x.font = '28px Georgia';
    x.fillText('ATLANTA · 1885', 256, 245);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return {
      body: lathe([
        [0, 0],
        [0.36, 0],
        [0.38, 0.05],
        [0.38, 1.45],
        [0.3, 1.75],
        [0.13, 1.95],
        [0.12, 2.5],
        [0.15, 2.55],
        [0, 2.55],
      ]),
      label: t,
    };
  }, []);
  return (
    <group>
      <mesh geometry={g.body} castShadow>
        <meshPhysicalMaterial color="#27391f" roughness={0.1} transmission={0.55} thickness={0.4} ior={1.5} transparent opacity={opacity} envMapIntensity={1.3} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.386, 0.386, 0.6, 48, 1, true, -1.1, 2.2]} />
        <meshStandardMaterial map={g.label} roughness={0.9} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 2.45, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.22, 24]} />
        <meshStandardMaterial color="#5e2b22" roughness={0.6} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

export const SyrupJug: React.FC = () => {
  const body = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.5, 0],
        [0.58, 0.1],
        [0.62, 0.6],
        [0.55, 0.95],
        [0.32, 1.15],
        [0.14, 1.2],
        [0.14, 1.38],
        [0, 1.38],
      ]),
    [],
  );
  return (
    <group>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial color="#e9e1d0" roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.56, 48, 16, 0, Math.PI * 2, 0, 0.62]} />
        <meshPhysicalMaterial color="#6b3a1c" roughness={0.3} clearcoat={0.8} />
      </mesh>
      <mesh position={[0.56, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.05, 16, 32, Math.PI * 1.3]} />
        <meshPhysicalMaterial color="#e9e1d0" roughness={0.35} clearcoat={0.8} />
      </mesh>
    </group>
  );
};

/* -------------------------------------------------------- ingredients */
const leafShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.28, 0.2, 0.3, 0.75, 0, 1.1);
  s.bezierCurveTo(-0.3, 0.75, -0.28, 0.2, 0, 0);
  return s;
};

export const Leaf: React.FC<{scale?: number}> = ({scale = 1}) => {
  const g = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(leafShape(), {depth: 0.01, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 24});
    // gentle curl along the length
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const x = p.getX(i);
      p.setZ(i, p.getZ(i) + Math.sin(y * 2.4) * 0.08 - x * x * 0.6);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  return (
    <group scale={scale}>
      <mesh geometry={g} castShadow>
        <meshPhysicalMaterial color="#5d7447" roughness={0.45} sheen={0.4} clearcoat={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.55, 0.03]}>
        <cylinderGeometry args={[0.006, 0.01, 1.1, 6]} />
        <meshStandardMaterial color="#9fb07c" roughness={0.6} />
      </mesh>
    </group>
  );
};

export const KolaNut: React.FC<{seed: string}> = ({seed}) => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(0.28, 48, 32);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = 1 + 0.12 * Math.sin(v.x * 9 + random(seed) * 6) * Math.cos(v.y * 7) + 0.18 * Math.max(0, v.z) ;
      v.multiplyScalar(n);
      v.y *= 0.8;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, [seed]);
  return (
    <mesh geometry={geo} castShadow>
      <meshPhysicalMaterial color="#8a4a2c" roughness={0.55} clearcoat={0.35} />
    </mesh>
  );
};

/* -------------------------------------------------------- money */
const coinFace = (big: string, small: string) => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(200, 180, 30, 256, 256, 256);
  g.addColorStop(0, '#f2f2ee');
  g.addColorStop(1, '#8d8d88');
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 512);
  x.strokeStyle = '#5a5a56';
  x.lineWidth = 10;
  x.beginPath();
  x.arc(256, 256, 220, 0, Math.PI * 2);
  x.stroke();
  x.fillStyle = '#4a4a46';
  x.textAlign = 'center';
  x.font = 'bold 190px Georgia';
  x.fillText(big, 256, 320);
  x.font = 'bold 40px Georgia';
  x.fillText(small, 256, 420);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const Coin: React.FC<{big?: string; small?: string; r?: number}> = ({big = '5¢', small = 'FIVE CENTS', r = 0.55}) => {
  const face = useMemo(() => coinFace(big, small), [big, small]);
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[r, r, r * 0.13, 96]} />
        <meshStandardMaterial attach="material-0" color="#b9b9b3" metalness={1} roughness={0.35} />
        <meshStandardMaterial attach="material-1" map={face} metalness={0.9} roughness={0.3} />
        <meshStandardMaterial attach="material-2" map={face} metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
};

/* -------------------------------------------------------- 1890s straight-sided bottle */
export const OldBottle: React.FC = () => {
  const body = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.3, 0],
        [0.32, 0.04],
        [0.32, 1.25],
        [0.24, 1.5],
        [0.12, 1.66],
        [0.11, 1.95],
        [0.14, 2.0],
        [0, 2.0],
      ]),
    [],
  );
  const mat = useMemo(() => glassMat('#cfe7e2', 0.06), []);
  return (
    <group>
      <mesh geometry={body} material={mat} castShadow />
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.25, 32]} />
        <meshPhysicalMaterial color="#5a2309" roughness={0.12} clearcoat={1} emissive="#2a0e02" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
};
