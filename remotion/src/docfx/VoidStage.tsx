import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {E, clamp, hash01, lerp} from './util';

/**
 * A symbolic 3D object floating in a dark void: dust motes, far stars, a soft key light from
 * above and a glow pool under the object. The camera recedes and eases into a hold.
 * Reference 7, clip 2: the White House miniature during "battles against US Presidents".
 * Put a place's 3D replica (built from reference photos, never a traced photo) as `children`.
 */
export const VoidStage: React.FC<{
  children: React.ReactNode;
  recede?: [number, number]; // camera distance start → end
  recedeDur?: number; // seconds to reach the hold
  height?: number; // camera height
  target?: number; // look-at height
  orbit?: [number, number]; // camera angle (degrees) start → end, for a slow drift around
  dust?: number;
  glow?: string;
}> = ({children, recede = [9, 14], recedeDur = 3, height = 1.4, target = 1.0, orbit = [0, 0], dust = 260, glow = '#ffcf8a'}) => {
  const {fps, width, height: H} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  return (
    <AbsoluteFill style={{background: '#040507'}}>
      <ThreeCanvas width={width} height={H} gl={{antialias: true, preserveDrawingBuffer: true}}>
        <VoidRig t={t} recede={recede} recedeDur={recedeDur} height={height} target={target} orbit={orbit} />
        <fog attach="fog" args={['#040507', 12, 40]} />
        <hemisphereLight args={['#6d7a99', '#0a0806', 0.35]} />
        <spotLight position={[1.5, 9, 3]} angle={0.45} penumbra={0.9} intensity={110} distance={30} decay={1.6} color={'#ffe7c4'} />
        <directionalLight position={[-4, 3, -6]} intensity={0.9} color={'#9fb6ff'} />
        <GlowPool color={glow} />
        <Dust t={t} count={dust} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const VoidRig: React.FC<{t: number; recede: [number, number]; recedeDur: number; height: number; target: number; orbit: [number, number]}> = ({t, recede, recedeDur, height, target, orbit}) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const p = E.out(clamp(t / recedeDur));
  const dist = lerp(recede[0], recede[1], p);
  const a = (lerp(orbit[0], orbit[1], E.easy(clamp(t / Math.max(recedeDur, 4)))) * Math.PI) / 180;
  cam.fov = 30;
  cam.near = 0.1;
  cam.far = 200;
  cam.position.set(Math.sin(a) * dist, height + dist * 0.12, Math.cos(a) * dist);
  cam.lookAt(0, target, 0);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return null;
};

const GlowPool: React.FC<{color: string}> = ({color}) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, color);
    gr.addColorStop(0.35, color + '66');
    gr.addColorStop(1, color + '00');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  }, [color]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <planeGeometry args={[9, 9]} />
      <meshBasicMaterial map={tex} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/** Dust motes near the object and far stars; positions are a pure function of time. */
const Dust: React.FC<{t: number; count: number}> = ({t, count}) => {
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const far = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      const th = hash01(i, 1) * Math.PI * 2;
      const ph = Math.acos(2 * hash01(i, 2) - 1);
      const r = 60;
      p.set([r * Math.sin(ph) * Math.cos(th), Math.abs(r * Math.cos(ph)) * 0.6 + 2, r * Math.sin(ph) * Math.sin(th)], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = (k: number) => hash01(i, k, 77);
    pos.set(
      [
        (r(1) - 0.5) * 12 + Math.sin(t * 0.3 + r(4) * 6) * 0.15,
        ((r(2) * 6 + t * (0.05 + 0.1 * r(5))) % 6) - 0.5,
        (r(3) - 0.5) * 12,
      ],
      i * 3,
    );
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return (
    <>
      <points geometry={geo}>
        <pointsMaterial size={0.035} color={'#e9d9bf'} transparent opacity={0.7} depthWrite={false} />
      </points>
      <points geometry={far}>
        <pointsMaterial size={0.12} color={'#cfd8ff'} transparent opacity={0.5} sizeAttenuation depthWrite={false} fog={false} />
      </points>
    </>
  );
};

/**
 * A generic neoclassical building (steps, portico with columns, pediment, two wings, lit
 * windows). A stand-in to show the stage; for a real place, model its actual shape.
 */
export const ClassicalBuilding: React.FC<{stone?: string}> = ({stone = '#b4ad9f'}) => {
  const win = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = '#000';
    g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 2; y++)
      for (let x = 0; x < 4; x++) {
        g.fillStyle = hash01(x, y, 5) > 0.35 ? '#ffcf86' : '#191510';
        g.fillRect(x * 32 + 10, y * 64 + 16, 12, 30);
      }
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    return tx;
  }, []);
  const pediment = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.35, 0);
    s.lineTo(1.35, 0);
    s.lineTo(0, 0.55);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, {depth: 0.5, bevelEnabled: false});
  }, []);
  const stoneMat = <meshStandardMaterial color={stone} roughness={0.85} />;
  const wingMat = (rx: number) => {
    const m = win.clone();
    m.repeat.set(rx, 1);
    m.needsUpdate = true;
    return <meshStandardMaterial color={stone} roughness={0.85} emissive={'#ffffff'} emissiveMap={m} emissiveIntensity={0.9} />;
  };
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.06 + i * 0.12, 0.9 - i * 0.12]}>
          <boxGeometry args={[3.2 - i * 0.2, 0.12, 1.2]} />
          {stoneMat}
        </mesh>
      ))}
      <mesh position={[0, 1.1, -0.2]}>
        <boxGeometry args={[2.4, 1.6, 1.6]} />
        {wingMat(3)}
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 2.4, 0.95, -0.35]}>
          <boxGeometry args={[2.4, 1.3, 1.2]} />
          {wingMat(4)}
        </mesh>
      ))}
      {[-1.05, -0.63, -0.21, 0.21, 0.63, 1.05].map((x) => (
        <mesh key={x} position={[x, 1.02, 0.75]}>
          <cylinderGeometry args={[0.09, 0.1, 1.45, 16]} />
          {stoneMat}
        </mesh>
      ))}
      <mesh position={[0, 1.8, 0.55]}>
        <boxGeometry args={[2.7, 0.14, 0.6]} />
        {stoneMat}
      </mesh>
      <mesh geometry={pediment} position={[0, 1.87, 0.3]}>
        {stoneMat}
      </mesh>
      <mesh position={[0, 1.95, -0.2]}>
        <boxGeometry args={[2.5, 0.08, 1.7]} />
        {stoneMat}
      </mesh>
    </group>
  );
};
