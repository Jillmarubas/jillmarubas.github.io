import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {settle} from './kit';

/*
 * Architect's paper models of the real places in the script, standing on the desk:
 * - The White House, north front (Pennsylvania Avenue side): 11-bay residence with the
 *   pedimented North Portico (four Ionic columns), alternating window pediments, balustrade,
 *   hipped roof and chimneys, low East and West terraces, the North Lawn with its round
 *   fountain, the semicircular drive, American elms, and the iron fence with stone piers.
 * - The FTC's Apex Building (600 Pennsylvania Ave NW): a triangular limestone block whose
 *   rounded east end carries a tall Ionic colonnade on a rusticated base, between Pennsylvania
 *   and Constitution Avenues, with street trees and lamps.
 * Materials are white card, green paper and felt, so the models belong in the paper world.
 */

const M = {
  card: new THREE.MeshStandardMaterial({color: '#F8F6F1', roughness: 0.9}),
  card2: new THREE.MeshStandardMaterial({color: '#EAE6DC', roughness: 0.92}),
  stone: new THREE.MeshStandardMaterial({color: '#E9DFCB', roughness: 0.95}),
  window: new THREE.MeshStandardMaterial({color: '#3F4650', roughness: 0.5, metalness: 0.1}),
  roof: new THREE.MeshStandardMaterial({color: '#9AA0A3', roughness: 0.85}),
  lawn: new THREE.MeshStandardMaterial({color: '#86A46B', roughness: 1}),
  lawn2: new THREE.MeshStandardMaterial({color: '#7A9A61', roughness: 1}),
  drive: new THREE.MeshStandardMaterial({color: '#D9D2C3', roughness: 1}),
  road: new THREE.MeshStandardMaterial({color: '#8E8A84', roughness: 1}),
  water: new THREE.MeshStandardMaterial({color: '#9FB8C4', roughness: 0.25, metalness: 0.1}),
  felt: new THREE.MeshStandardMaterial({color: '#5D7F48', roughness: 1}),
  felt2: new THREE.MeshStandardMaterial({color: '#6C8F52', roughness: 1}),
  trunk: new THREE.MeshStandardMaterial({color: '#7A6550', roughness: 1}),
  iron: new THREE.MeshStandardMaterial({color: '#2B2B2B', roughness: 0.6, metalness: 0.4}),
  lamp: new THREE.MeshStandardMaterial({color: '#FFE7B0', emissive: '#FFCF7A', emissiveIntensity: 0.6}),
  mulch: new THREE.MeshStandardMaterial({color: '#6E5642', roughness: 1}),
};

const Box: React.FC<{p: [number, number, number]; s: [number, number, number]; m: THREE.Material; r?: [number, number, number]}> = ({p, s, m, r}) => (
  <mesh position={p} rotation={r} material={m} castShadow receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

const Column: React.FC<{p: [number, number, number]; h: number; r: number; m?: THREE.Material}> = ({p, h, r, m = M.card}) => (
  <group position={p}>
    <mesh position={[0, r * 0.35, 0]} material={m} castShadow receiveShadow>
      <boxGeometry args={[r * 2.6, r * 0.7, r * 2.6]} />
    </mesh>
    <mesh position={[0, h / 2, 0]} material={m} castShadow receiveShadow>
      <cylinderGeometry args={[r * 0.88, r, h - r * 1.4, 20]} />
    </mesh>
    {/* Ionic capital: abacus + volutes */}
    <mesh position={[0, h - r * 0.35, 0]} material={m} castShadow>
      <boxGeometry args={[r * 2.7, r * 0.5, r * 2.7]} />
    </mesh>
    {[-1, 1].map((sx) => (
      <mesh key={sx} position={[sx * r * 1.15, h - r * 0.75, 0]} rotation={[Math.PI / 2, 0, 0]} material={m} castShadow>
        <cylinderGeometry args={[r * 0.38, r * 0.38, r * 2.2, 14]} />
      </mesh>
    ))}
  </group>
);

/** A felt-ball tree: a cluster of spheres on a trunk (American elm silhouette: wide vase crown). */
const Tree: React.FC<{p: [number, number, number]; s?: number; seed?: number}> = ({p, s = 1, seed = 1}) => {
  const balls = useMemo(() => {
    const rnd = (k: number) => {
      const x = Math.sin(seed * 91.7 + k * 12.9) * 43758.5;
      return x - Math.floor(x);
    };
    return Array.from({length: 9}, (_, k) => {
      const a = rnd(k) * Math.PI * 2;
      const rr = 0.4 + rnd(k + 20) * 0.9;
      return {x: Math.cos(a) * rr, z: Math.sin(a) * rr, y: 2.6 + rnd(k + 40) * 1.0, r: 0.75 + rnd(k + 60) * 0.5, m: rnd(k + 80) > 0.5 ? M.felt : M.felt2};
    });
  }, [seed]);
  return (
    <group position={p} scale={[s, s, s]}>
      <mesh position={[0, 1.2, 0]} material={M.trunk} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 2.4, 8]} />
      </mesh>
      {balls.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} material={b.m} castShadow receiveShadow>
          <sphereGeometry args={[b.r, 18, 14]} />
        </mesh>
      ))}
    </group>
  );
};


/** A triangular pediment: base width w, height h, depth d (front face at z=0). */
const Pediment: React.FC<{p: [number, number, number]; w: number; h: number; d: number; m?: THREE.Material}> = ({p, w, h, d, m = M.card}) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(0, h);
    s.lineTo(-w / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, {depth: d, bevelEnabled: false});
    g.translate(0, 0, -d);
    return g;
  }, [w, h, d]);
  return <mesh geometry={geo} position={p} material={m} castShadow receiveShadow />;
};
/** A segmental (arched) pediment. */
const Segment: React.FC<{p: [number, number, number]; w: number; h: number; d: number}> = ({p, w, h, d}) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.quadraticCurveTo(0, h * 2, -w / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, {depth: d, bevelEnabled: false, curveSegments: 16});
    g.translate(0, 0, -d);
    return g;
  }, [w, h, d]);
  return <mesh geometry={geo} position={p} material={M.card} castShadow receiveShadow />;
};
/** A hipped roof over a w×d block, ridge height h. */
const HipRoof: React.FC<{p: [number, number, number]; w: number; d: number; h: number; m?: THREE.Material}> = ({p, w, d, h, m = M.roof}) => {
  const geo = useMemo(() => {
    const r = (w - d) / 2;
    const v = [
      [-w / 2, 0, -d / 2], [w / 2, 0, -d / 2], [w / 2, 0, d / 2], [-w / 2, 0, d / 2],
      [-r, h, 0], [r, h, 0],
    ];
    const idx = [0, 4, 5, 0, 5, 1, 1, 5, 2, 2, 5, 4, 2, 4, 3, 3, 4, 0];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(idx.flatMap((i) => v[i]), 3));
    g.computeVertexNormals();
    return g;
  }, [w, d, h]);
  return <mesh geometry={geo} position={p} material={m} castShadow receiveShadow />;
};
const flagTex = () => {
  const c = document.createElement('canvas');
  c.width = 190;
  c.height = 100;
  const g = c.getContext('2d')!;
  for (let i = 0; i < 13; i++) {
    g.fillStyle = i % 2 ? '#FFFFFF' : '#B22234';
    g.fillRect(0, (i * 100) / 13, 190, 100 / 13 + 0.5);
  }
  g.fillStyle = '#3C3B6E';
  g.fillRect(0, 0, 76, 54);
  g.fillStyle = '#FFFFFF';
  for (let r = 0; r < 9; r++) for (let k = 0; k < (r % 2 ? 5 : 6); k++) g.fillRect(6 + k * 12 + (r % 2 ? 6 : 0), 4 + r * 5.6, 2, 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/* ------------------------------------------------------------------ White House, north front */
const Window: React.FC<{p: [number, number, number]; w: number; h: number; ped?: 'tri' | 'seg' | 'flat'}> = ({p, w, h, ped = 'flat'}) => (
  <group position={p}>
    <Box p={[0, 0, 0.02]} s={[w + 0.18, h + 0.18, 0.06]} m={M.card2} />
    <Box p={[0, 0, 0.05]} s={[w, h, 0.04]} m={M.window} />
    <Box p={[0, 0, 0.08]} s={[0.05, h, 0.02]} m={M.card} />
    <Box p={[0, h * 0.1, 0.08]} s={[w, 0.05, 0.02]} m={M.card} />
    {ped === 'tri' && <Pediment p={[0, h / 2 + 0.16, 0.16]} w={w + 0.45} h={0.36} d={0.1} />}
    {ped === 'seg' && <Segment p={[0, h / 2 + 0.16, 0.16]} w={w + 0.45} h={0.2} d={0.1} />}
    {ped !== 'flat' && <Box p={[0, h / 2 + 0.1, 0.07]} s={[w + 0.4, 0.1, 0.12]} m={M.card} />}
  </group>
);

const WhiteHouseModel: React.FC = () => {
  const FLAG = useMemo(flagTex, []);
  const W0 = 16.8; // 168 ft
  const D0 = 8.5;
  const H0 = 5.2; // north elevation (state floor + second floor)
  const bays = 11;
  const bayW = W0 / bays;
  return (
    <group>
      {/* ground: the President's Park lawn running off in every direction */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} material={M.lawn2} receiveShadow>
        <planeGeometry args={[700, 700]} />
      </mesh>
      <Box p={[0, -0.05, 8]} s={[46, 0.1, 30]} m={M.lawn} />
      {/* Pennsylvania Avenue (pedestrian plaza) */}
      <Box p={[0, -0.04, 22]} s={[46, 0.09, 4]} m={M.drive} />
      {/* semicircular drive */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 6.2]} material={M.drive} receiveShadow>
        <ringGeometry args={[7.2, 8.4, 64, 1, Math.PI, Math.PI]} />
      </mesh>
      <Box p={[-7.8, 0.01, 13]} s={[1.2, 0.02, 13.6]} m={M.drive} />
      <Box p={[7.8, 0.01, 13]} s={[1.2, 0.02, 13.6]} m={M.drive} />
      {/* fountain */}
      <mesh position={[0, 0.15, 12.5]} material={M.card} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 2.3, 0.3, 48]} />
      </mesh>
      <mesh position={[0, 0.28, 12.5]} material={M.water}>
        <cylinderGeometry args={[2.0, 2.0, 0.06, 48]} />
      </mesh>
      <mesh position={[0, 0.6, 12.5]} material={M.card} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 0.7, 12]} />
      </mesh>
      {/* residence block */}
      <Box p={[0, H0 / 2, -D0 / 2]} s={[W0, H0, D0]} m={M.card} />
      {/* string course + cornice + balustrade */}
      <Box p={[0, 2.55, 0.06]} s={[W0 + 0.1, 0.14, 0.14]} m={M.card2} />
      <Box p={[0, H0 + 0.1, -D0 / 2]} s={[W0 + 0.35, 0.22, D0 + 0.35]} m={M.card2} />
      {Array.from({length: 54}, (_, i) => (
        <Box key={i} p={[-W0 / 2 + 0.15 + (i * (W0 - 0.3)) / 53, H0 + 0.48, 0.1]} s={[0.09, 0.5, 0.09]} m={M.card} />
      ))}
      <Box p={[0, H0 + 0.78, 0.1]} s={[W0 + 0.2, 0.1, 0.2]} m={M.card2} />
      {/* hipped roof + chimneys */}
      <HipRoof p={[0, H0 + 0.2, -D0 / 2]} w={W0 - 0.6} d={D0 - 0.6} h={1.5} />
      {[-5.5, -2.3, 2.3, 5.5].map((x) => (
        <Box key={x} p={[x, H0 + 1.6, -D0 / 2]} s={[0.55, 1.4, 0.4]} m={M.card} />
      ))}
      {/* flag on the roof */}
      <mesh position={[0, H0 + 2.8, -D0 / 2]} material={M.iron}>
        <cylinderGeometry args={[0.03, 0.03, 2.6, 6]} />
      </mesh>
      <mesh position={[0.55, H0 + 3.75, -D0 / 2]}>
        <planeGeometry args={[1.1, 0.58]} />
        <meshStandardMaterial map={FLAG} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      {/* windows: state floor (alternating pediments) and second floor */}
      {Array.from({length: bays}, (_, i) => {
        const x = -W0 / 2 + bayW * (i + 0.5);
        if (i >= 4 && i <= 6) return null; // behind the portico
        return (
          <group key={i}>
            <Window p={[x, 1.25, 0]} w={0.7} h={1.5} ped={i % 2 === 0 ? 'tri' : 'seg'} />
            <Window p={[x, 3.85, 0]} w={0.7} h={1.2} />
          </group>
        );
      })}
      {/* North Portico: four Ionic columns, entablature, pediment */}
      <group position={[0, 0, 0]}>
        <Box p={[0, 0.12, 2.2]} s={[5.8, 0.24, 4.6]} m={M.card2} />
        {[-2.35, -0.8, 0.8, 2.35].map((x) => (
          <Column key={x} p={[x, 0.24, 4.1]} h={4.6} r={0.26} />
        ))}
        {[-2.35, 2.35].map((x) => (
          <Column key={`b${x}`} p={[x, 0.24, 1.6]} h={4.6} r={0.26} />
        ))}
        <Box p={[0, 5.05, 2.3]} s={[5.9, 0.5, 4.5]} m={M.card} />
        <Pediment p={[0, 5.3, 4.55]} w={6.0} h={1.25} d={4.5} />
        <Box p={[0, 5.32, 4.56]} s={[6.1, 0.1, 0.1]} m={M.card2} />
        {/* the lantern hanging in the portico */}
        <mesh position={[0, 3.9, 3.0]} material={M.lamp}>
          <sphereGeometry args={[0.2, 12, 10]} />
        </mesh>
        {/* doorway */}
        <Box p={[0, 1.3, 0.04]} s={[1.2, 2.2, 0.06]} m={M.window} />
      </group>
      {/* East and West terraces (low colonnades) */}
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <Box p={[sx * 12.6, 0.75, -5.2]} s={[8, 1.5, 2.6]} m={M.card} />
          {Array.from({length: 7}, (_, i) => (
            <Box key={i} p={[sx * (9.0 + i * 1.15), 0.75, -3.85]} s={[0.2, 1.4, 0.2]} m={M.card2} />
          ))}
        </group>
      ))}
      {/* clipped hedges and flower beds along the north front */}
      {[-1, 1].map((sx) => (
        <group key={`h${sx}`}>
          <Box p={[sx * 5.6, 0.3, 0.9]} s={[5.0, 0.6, 0.9]} m={M.felt2} />
          <Box p={[sx * 5.6, 0.05, 1.6]} s={[5.0, 0.1, 0.4]} m={M.mulch} />
        </group>
      ))}
      {/* elms on the North Lawn */}
      {[
        [-12, 7, 1.15],
        [-15.5, 12, 1.0],
        [-11, 15, 1.1],
        [-17, 4, 0.95],
        [12, 7.5, 1.1],
        [15.5, 12.5, 1.05],
        [11.5, 16, 1.0],
        [17, 3.5, 0.95],
        [-6, 17.5, 0.8],
        [6, 17.5, 0.8],
      ].map(([x, z, s], i) => (
        <Tree key={i} p={[x, 0, z]} s={s} seed={i + 3} />
      ))}
      {/* fence along Pennsylvania Avenue: stone piers + iron pickets */}
      {Array.from({length: 13}, (_, i) => (
        <Box key={i} p={[-21 + i * 3.5, 0.55, 19.8]} s={[0.5, 1.1, 0.5]} m={M.card2} />
      ))}
      {Array.from({length: 140}, (_, i) => (
        <Box key={`p${i}`} p={[-21 + i * 0.3, 0.5, 19.8]} s={[0.04, 1.0, 0.04]} m={M.iron} />
      ))}
      <Box p={[0, 0.95, 19.8]} s={[42, 0.05, 0.05]} m={M.iron} />
      <Box p={[0, 0.15, 19.8]} s={[42, 0.05, 0.05]} m={M.iron} />
      {/* gates at the drive */}
      {[-7.8, 7.8].map((x) => (
        <group key={x}>
          <Box p={[x - 0.9, 0.8, 19.8]} s={[0.6, 1.6, 0.6]} m={M.card} />
          <Box p={[x + 0.9, 0.8, 19.8]} s={[0.6, 1.6, 0.6]} m={M.card} />
          <mesh position={[x - 0.9, 1.75, 19.8]} material={M.lamp}>
            <sphereGeometry args={[0.18, 12, 10]} />
          </mesh>
          <mesh position={[x + 0.9, 1.75, 19.8]} material={M.lamp}>
            <sphereGeometry args={[0.18, 12, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ FTC Apex Building */
const windowTexture = (cols: number, rows: number) => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ECE3D0';
  g.fillRect(0, 0, c.width, c.height);
  const cw = c.width / cols;
  const rh = c.height / rows;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      g.fillStyle = '#D9CDB4';
      g.fillRect(k * cw + cw * 0.22, r * rh + rh * 0.16, cw * 0.56, rh * 0.68);
      g.fillStyle = '#4A5059';
      g.fillRect(k * cw + cw * 0.27, r * rh + rh * 0.2, cw * 0.46, rh * 0.6);
      g.fillStyle = '#ECE3D0';
      g.fillRect(k * cw + cw * 0.495, r * rh + rh * 0.2, cw * 0.01, rh * 0.6);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

const ApexModel: React.FC = () => {
  const {body, base, mat} = useMemo(() => {
    // footprint: wide west front on 6th St, narrowing east to a rounded apex
    const s = new THREE.Shape();
    s.moveTo(-9, -4.2);
    s.lineTo(5.5, -1.9);
    s.absarc(6.1, 0, 2.0, -Math.PI / 2 + 0.3, Math.PI / 2 - 0.3, false);
    s.lineTo(-9, 4.2);
    s.lineTo(-9, -4.2);
    const body = new THREE.ExtrudeGeometry(s, {depth: 6.2, bevelEnabled: false, curveSegments: 32});
    body.rotateX(-Math.PI / 2);
    const base = new THREE.ExtrudeGeometry(s, {depth: 1.6, bevelEnabled: false, curveSegments: 32});
    base.rotateX(-Math.PI / 2);
    base.scale(1.02, 1, 1.03);
    const tex = windowTexture(16, 4);
    tex.repeat.set(0.07, 0.16);
    const mat = new THREE.MeshStandardMaterial({map: tex, roughness: 0.95});
    return {body, base, mat};
  }, []);
  return (
    <group>
      {/* ground: the downtown pavement running off in every direction */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} material={M.drive} receiveShadow>
        <planeGeometry args={[700, 700]} />
      </mesh>
      <Box p={[0, -0.05, 0]} s={[40, 0.1, 26]} m={M.drive} />
      {/* the avenues continue past the frame */}
      <Box p={[0, -0.04, -8.5]} s={[400, 0.06, 4.4]} m={M.road} />
      <Box p={[0, -0.04, 8.5]} s={[400, 0.06, 4.4]} m={M.road} />
      {/* Pennsylvania Ave (north) and Constitution Ave (south) */}
      <Box p={[0, -0.025, -8.5]} s={[40, 0.06, 4.4]} m={M.road} />
      <Box p={[0, -0.025, 8.5]} s={[40, 0.06, 4.4]} m={M.road} />
      {Array.from({length: 18}, (_, i) => (
        <Box key={i} p={[-18 + i * 2.2, 0.0, -8.5]} s={[1, 0.02, 0.12]} m={M.card} />
      ))}
      <mesh geometry={base} material={M.stone} castShadow receiveShadow />
      <mesh geometry={body} material={mat} position={[0, 1.6, 0]} castShadow receiveShadow />
      {/* cornice + attic */}
      <mesh geometry={base} material={M.card2} position={[0, 7.8, 0]} scale={[1.0, 0.12, 1.0]} castShadow />
      {/* apex colonnade: six Ionic columns around the rounded east end */}
      {Array.from({length: 6}, (_, i) => {
        const a = -Math.PI / 2 + 0.55 + (i * (Math.PI - 1.1)) / 5;
        return <Column key={i} p={[6.1 + Math.cos(a) * 2.35, 1.6, Math.sin(a) * 2.35]} h={4.6} r={0.24} m={M.stone} />;
      })}
      <mesh position={[6.1, 6.45, 0]} material={M.stone} castShadow>
        <cylinderGeometry args={[2.65, 2.65, 0.55, 40, 1, false, 0, Math.PI]} />
      </mesh>
      {/* street trees and lamps */}
      {Array.from({length: 7}, (_, i) => (
        <Tree key={`n${i}`} p={[-14 + i * 4.4, 0, -5.6]} s={0.55} seed={i + 30} />
      ))}
      {Array.from({length: 7}, (_, i) => (
        <Tree key={`s${i}`} p={[-14 + i * 4.4, 0, 5.8]} s={0.55} seed={i + 50} />
      ))}
      {Array.from({length: 6}, (_, i) => (
        <group key={`l${i}`} position={[-12 + i * 4.4, 0, -6.4]}>
          <Box p={[0, 0.9, 0]} s={[0.08, 1.8, 0.08]} m={M.iron} />
          <mesh position={[0, 1.9, 0]} material={M.lamp}>
            <sphereGeometry args={[0.16, 10, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ the canvas */
const Rig: React.FC<{which: 'whitehouse' | 'ftc'; at: number; orbit: number; push: number; dur: number}> = ({which, at, orbit, push, dur}) => {
  const f = useCurrentFrame();
  const k = settle((f - at) / 26);
  const u = Math.min(1, Math.max(0, (f - at) / Math.max(1, dur)));
  return (
    <group rotation={[0, THREE.MathUtils.degToRad(orbit * (u - 0.5)), 0]} scale={[0.9 + 0.1 * k, 0.9 + 0.1 * k, 0.9 + 0.1 * k]} position={[0, -6 * (1 - k), push * u]}>
      {which === 'whitehouse' ? <WhiteHouseModel /> : <ApexModel />}
    </group>
  );
};

export const Place3D: React.FC<{which: 'whitehouse' | 'ftc'; w: number; h: number; at?: number; dur?: number; orbit?: number; push?: number; cam?: [number, number, number]; look?: [number, number, number]}> = ({
  which,
  w,
  h,
  at = 0,
  dur = 200,
  orbit = 14,
  push = 3,
  cam,
  look,
}) => {
  const camPos = cam ?? (which === 'whitehouse' ? [0, 14, 34] : [22, 16, 22]);
  const target = look ?? (which === 'whitehouse' ? [0, 2, 3] : [0, 2, 0]);
  return (
    <ThreeCanvas
      width={w}
      height={h}
      shadows={{type: THREE.PCFSoftShadowMap}}
      gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}
      camera={{position: camPos as [number, number, number], fov: 30, near: 0.5, far: 400}}
      onCreated={({camera}) => camera.lookAt(...(target as [number, number, number]))}
      style={{background: 'transparent'}}
    >
      <LookAt target={target as [number, number, number]} />
      <fog attach="fog" args={['#E9E1D2', 60, 190]} />
      <hemisphereLight args={['#FFF6E8', '#B8A890', 0.55]} />
      <directionalLight position={[-18, 26, 14]} intensity={2.4} color="#FFE9CC" castShadow shadow-mapSize={[4096, 4096]} shadow-radius={4} shadow-bias={-0.0002} shadow-normalBias={0.04} shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} shadow-camera-near={5} shadow-camera-far={90} />
      <directionalLight position={[20, 10, -12]} intensity={0.5} color="#C9D8FF" />
      <Rig which={which} at={at} orbit={orbit} push={push} dur={dur} />
    </ThreeCanvas>
  );
};

const LookAt: React.FC<{target: [number, number, number]}> = ({target}) => {
  const {camera} = useThree();
  camera.lookAt(...target);
  return null;
};
