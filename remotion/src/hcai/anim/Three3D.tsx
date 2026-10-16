// The cold open's 3D scenes: a glass of water ("...over water. Hold on to that.") and a figure thinking, with
// question marks gathering above its head ("the question everyone argues about... What does ONE question cost?").
import React, {useMemo} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';

/** Studio reflections without an HDR file. Set while rendering so the first frame already has them. */
const Env: React.FC = () => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  }, [gl, scene]);
  return null;
};
const Cam: React.FC<{pos: [number, number, number]; look: [number, number, number]}> = ({pos, look}) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(...pos);
  camera.lookAt(...look);
  return null;
};

/* ------------------------------------------------------------------ glass of water */
const glassProfile = [
  [0, 0], [0.56, 0], [0.6, 0.05], [0.71, 1.72], [0.69, 1.74], [0.66, 1.72], [0.555, 0.13], [0, 0.13],
].map(([x, y]) => new THREE.Vector2(x, y));
const waterProfile = (h: number) => [[0, 0.13], [0.553, 0.13], [0.555 + (0.105 * (h - 0.13)) / 1.59, h], [0, h]].map(([x, y]) => new THREE.Vector2(x, y));
const backdrop = () => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 1024, 0);
  g.addColorStop(0, P.night);
  g.addColorStop(0.5, P.navy);
  g.addColorStop(1, P.plum);
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 512);
  x.fillStyle = 'rgba(120,200,255,0.55)';
  for (let i = 0; i < 6; i++) x.fillRect(80 + i * 160, 0, 10, 512); // light strips the glass bends
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const GlassScene: React.FC<{f: number}> = ({f}) => {
  const tex = useMemo(backdrop, []);
  const glass = useMemo(() => new THREE.LatheGeometry(glassProfile, 96), []);
  const water = useMemo(() => new THREE.LatheGeometry(waterProfile(1.25), 96), []);
  const a = lerp(0.55, -0.45, ease(f, 0, 92));
  const d = 5.5;
  const wob = Math.sin(f / 7) * 0.025;
  return (
    <>
      <Env />
      <Cam pos={[Math.sin(a) * d, lerp(1.6, 2.4, ease(f, 0, 92)), Math.cos(a) * d]} look={[0, 0.85, 0]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <directionalLight position={[-3, 2, -4]} intensity={3} color={P.sky} />
      <mesh position={[0, 1.5, -3.2]}>
        <planeGeometry args={[14, 7]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#18224A" roughness={0.25} metalness={0.2} />
      </mesh>
      <mesh geometry={glass}>
        <meshPhysicalMaterial color="#ffffff" transmission={1} roughness={0.04} thickness={0.35} ior={1.5} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={water}>
        <meshPhysicalMaterial color={P.water} transmission={0.35} roughness={0.08} thickness={1.2} ior={1.33} side={THREE.DoubleSide} emissive={P.water} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 1.25, 0]} rotation={[-Math.PI / 2 + wob, 0, wob]}>
        <circleGeometry args={[0.64, 64]} />
        <meshPhysicalMaterial color="#9EDBFF" transmission={0.6} roughness={0.05} ior={1.33} thickness={0.2} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} position={[i ? 0.18 : -0.15, 1.2 + Math.sin(f / 13 + i) * 0.03, i ? -0.1 : 0.12]} rotation={[0.4 + i, f / 90 + i, 0.3]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshPhysicalMaterial color="#E8F6FF" transmission={0.9} roughness={0.15} thickness={0.3} ior={1.31} />
        </mesh>
      ))}
    </>
  );
};
export const Glass: React.FC<AnimProps> = ({f, t0}) => {
  const {width, height} = useVideoConfig();
  const w = (abs: number) => at(t0, abs);
  return (
    <AbsoluteFill style={{background: P.night}}>
      <ThreeCanvas width={width} height={height} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping}} camera={{fov: 32, near: 0.1, far: 50, position: [0, 1.4, 4.2]}}>
        <GlassScene f={f} />
      </ThreeCanvas>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 80, textAlign: 'center', opacity: ease(f, w(37.05), 10)}}>
        <Tag bg={P.white} color={P.ink} size={40}>Hold on to that</Tag>
        <Note style={{marginTop: 12, opacity: ease(f, w(38.6), 10)}} color={P.white} size={24}>
          What the court records showed · Chapter 3, The water
        </Note>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ the thinker */
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const Limb: React.FC<{a: THREE.Vector3; b: THREE.Vector3; r: number; mat: THREE.Material}> = ({a, b, r, mat}) => {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
  const mid = a.clone().add(b).multiplyScalar(0.5);
  return (
    <mesh position={mid} quaternion={q} material={mat}>
      <capsuleGeometry args={[r, Math.max(0.01, len), 8, 16]} />
    </mesh>
  );
};
const QMark: React.FC<{color: string; s: number}> = ({color, s}) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({color, roughness: 0.35, metalness: 0.05}), [color]);
  return (
    <group scale={s}>
      <mesh material={mat} position={[0, 0.28, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.2, 0.07, 16, 48, Math.PI * 1.5]} />
      </mesh>
      <mesh material={mat} position={[0, -0.01, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.2, 24]} />
      </mesh>
      <mesh material={mat} position={[0, -0.24, 0]}>
        <sphereGeometry args={[0.085, 24, 16]} />
      </mesh>
    </group>
  );
};
// where the question marks gather, and when (film time) each appears
const MARKS: {p: [number, number, number]; c: string; t: number; s: number}[] = [
  {p: [0, 3.0, 0], c: P.red, t: 83.6, s: 1.3},
  {p: [-0.75, 2.75, 0.2], c: P.yellow, t: 84.4, s: 0.95},
  {p: [0.8, 2.85, -0.1], c: P.purple, t: 84.85, s: 1.0},
  {p: [-0.4, 3.45, -0.3], c: P.pink, t: 85.45, s: 0.8},
  {p: [0.5, 3.5, 0.3], c: P.teal, t: 85.75, s: 0.85},
  {p: [1.25, 3.3, 0.1], c: P.orange, t: 86.05, s: 0.7},
  {p: [-1.2, 3.25, -0.1], c: P.water, t: 86.35, s: 0.75},
];
const ThinkerScene: React.FC<{f: number; t0: number}> = ({f, t0}) => {
  const body = useMemo(() => new THREE.MeshStandardMaterial({color: P.teal, roughness: 0.55}), []);
  const k = ease(f, 0, 300);
  const ang = lerp(0.7, -0.35, k);
  const d = lerp(8.4, 7.2, k);
  const breathe = 1 + Math.sin(f / 18) * 0.012;
  // shoulders, elbows, hands: one hand under the chin, the other arm across the body
  const shR = V(0.36, 1.78, 0.02), shL = V(-0.36, 1.78, 0.02);
  const elR = V(0.36, 1.32, 0.34), elL = V(-0.3, 1.35, 0.26);
  const hR = V(0.08, 1.96, 0.3), hL = V(0.36, 1.3, 0.36);
  return (
    <>
      <Env />
      <Cam pos={[Math.sin(ang) * d, lerp(2.2, 2.9, k), Math.cos(ang) * d]} look={[0, 2.25, 0]} />
      <hemisphereLight args={['#ffffff', P.plum, 0.7]} />
      <directionalLight position={[3, 6, 4]} intensity={2.4} />
      <directionalLight position={[-4, 3, -3]} intensity={1.6} color={P.pink} />
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.12, 64]} />
        <meshStandardMaterial color={P.yellow} roughness={0.5} />
      </mesh>
      <group scale={[1, breathe, 1]}>
        <Limb a={V(0.17, 0.2, 0)} b={V(0.17, 0.98, 0)} r={0.13} mat={body} />
        <Limb a={V(-0.17, 0.2, 0)} b={V(-0.17, 0.98, 0)} r={0.13} mat={body} />
        {[0.17, -0.17].map((x) => (
          <mesh key={x} position={[x, 0.19, 0.08]} material={body}>
            <boxGeometry args={[0.2, 0.1, 0.36]} />
          </mesh>
        ))}
        <mesh position={[0, 1.08, 0]} material={body}>
          <sphereGeometry args={[0.26, 24, 16]} />
        </mesh>
        <Limb a={V(0, 1.15, 0)} b={V(0, 1.72, 0.06)} r={0.3} mat={body} />
        <Limb a={V(0, 1.9, 0.06)} b={V(0, 2.02, 0.08)} r={0.09} mat={body} />
        <mesh position={[0, 2.26, 0.12]} material={body} rotation={[0.25, 0, 0.12]}>
          <sphereGeometry args={[0.27, 32, 24]} />
        </mesh>
        <Limb a={shR} b={elR} r={0.1} mat={body} />
        <Limb a={elR} b={hR} r={0.09} mat={body} />
        <Limb a={shL} b={elL} r={0.1} mat={body} />
        <Limb a={elL} b={hL} r={0.09} mat={body} />
      </group>
      {MARKS.map((m, i) => {
        const o = pop(f, (m.t - t0) * 24, 14);
        if (o <= 0) return null;
        return (
          <group key={i} position={[m.p[0], m.p[1] + Math.sin(f / 16 + i) * 0.06, m.p[2]]} rotation={[0, Math.sin(f / 30 + i) * 0.6, Math.sin(f / 24 + i) * 0.12]}>
            <QMark color={m.c} s={m.s * o} />
          </group>
        );
      })}
    </>
  );
};
const LINE = ['What', 'does', 'ONE', 'question', 'to', 'AI', 'actually', 'cost?'];
const WORD_T = [88.27, 88.39, 88.53, 88.75, 89.27, 89.82, 90.03, 90.83];
export const Thinker: React.FC<AnimProps> = ({f, t0}) => {
  const {width, height} = useVideoConfig();
  const w = (abs: number) => at(t0, abs);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #4B39C9, ${P.plum} 65%, #130B2E)`}}>
      <ThreeCanvas width={width} height={height} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, alpha: true}} camera={{fov: 34, near: 0.1, far: 60, position: [0, 2.2, 6]}}>
        <ThinkerScene f={f} t0={t0} />
      </ThreeCanvas>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, background: `linear-gradient(transparent, rgba(19,11,46,${0.85 * ease(f, w(88.0), 12)}))`}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: AF.head, fontWeight: 800, fontSize: 76, color: P.white, textShadow: '0 8px 30px rgba(0,0,0,0.4)'}}>
        {LINE.map((word, i) => {
          const k = ease(f, w(WORD_T[i]) - 4, 8);
          return (
            <span key={i} style={{display: 'inline-block', marginRight: '0.25em', opacity: k, transform: `translateY(${(1 - k) * 30}px)`, color: word === 'ONE' ? P.yellow : undefined}}>
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
