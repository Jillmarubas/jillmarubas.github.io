// Teardown Lab profile picture: an exploded electric motor, same studio look as the cutaway demo.
// Render: npx remotion still src/brand/index.ts TeardownAvatar out/avatar.png --gl=swangle
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

export const AV = 1600;
const ACCENT = '#ff6a1a';

const stripes = () => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#a3a9b1';
  g.fillRect(0, 0, 512, 64);
  g.fillStyle = '#5b6168';
  for (let i = 0; i < 18; i++) g.fillRect((i / 18) * 512, 0, 9, 64);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// Motor parts along +x (the motor axis), then the whole group is tilted into a diagonal.
export function buildMotor() {
  const root = new THREE.Group();
  const motor = new THREE.Group();
  root.add(motor);
  const M = {
    dark: new THREE.MeshPhysicalMaterial({color: '#202227', metalness: 0.35, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3}),
    steel: new THREE.MeshPhysicalMaterial({color: '#c6cacf', metalness: 1, roughness: 0.3}),
    copper: new THREE.MeshPhysicalMaterial({color: '#c26f43', metalness: 1, roughness: 0.32}),
    accent: new THREE.MeshPhysicalMaterial({color: ACCENT, metalness: 0.1, roughness: 0.38, clearcoat: 0.5}),
    rotor: new THREE.MeshPhysicalMaterial({color: '#ffffff', metalness: 0.85, roughness: 0.4, map: stripes()}),
  };
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number) => {
    const mesh = new THREE.Mesh(g, m);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.x = x;
    motor.add(mesh);
    return mesh;
  };
  // Lathe profile (r, x) around the motor axis.
  const lathe = (pts: [number, number][], seg = 96) => {
    const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
    g.rotateZ(-Math.PI / 2); // lathe axis y -> +x
    g.computeVertexNormals();
    return g;
  };
  const cyl = (r: number, len: number, seg = 96, open = false) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg, 1, open);
    g.rotateZ(-Math.PI / 2);
    return g;
  };

  const GAP = 0.56;
  // 1. Rear end cap with bearing boss.
  add(lathe([[0.01, -0.12], [0.62, -0.12], [0.7, -0.06], [0.7, 0.1], [0.3, 0.12], [0.22, 0.2], [0.01, 0.2]]), M.dark, -2 * GAP - 0.25);
  // 2. Housing with cooling fins.
  const housing = new THREE.Group();
  housing.position.x = -GAP + 0.05;
  motor.add(housing);
  const hg = new THREE.CylinderGeometry(0.66, 0.66, 0.78, 96, 1, true);
  hg.rotateZ(-Math.PI / 2);
  const hm = new THREE.Mesh(hg, M.dark);
  hm.material = M.dark;
  (hm.material as THREE.Material).side = THREE.DoubleSide;
  hm.castShadow = hm.receiveShadow = true;
  housing.add(hm);
  for (let i = 0; i < 7; i++) {
    const f = new THREE.TorusGeometry(0.69, 0.035, 12, 96);
    f.rotateY(Math.PI / 2);
    const fm = new THREE.Mesh(f, M.dark);
    fm.position.x = -0.33 + i * 0.11;
    fm.castShadow = true;
    housing.add(fm);
  }
  // 3. Copper stator coil.
  const coil = new THREE.TorusGeometry(0.42, 0.15, 32, 96);
  coil.rotateY(Math.PI / 2);
  coil.scale(1.6, 1, 1);
  add(coil, M.copper, 0.32);
  // 4. Rotor on the shaft.
  add(cyl(0.3, 0.5), M.rotor, 0.32 + GAP + 0.05);
  add(cyl(0.3, 0.05), M.steel, 0.32 + GAP + 0.05 - 0.27);
  add(cyl(0.3, 0.05), M.steel, 0.32 + GAP + 0.05 + 0.27);
  add(cyl(0.07, 1.5), M.steel, 0.32 + GAP + 0.05);
  // 5. Front end cap: the one orange part.
  add(lathe([[0.01, 0.12], [0.62, 0.12], [0.7, 0.06], [0.7, -0.1], [0.3, -0.12], [0.2, -0.22], [0.12, -0.22], [0.12, -0.3], [0.01, -0.3]]), M.accent, 0.32 + 2 * GAP + 0.45);

  motor.position.x = -0.3;
  // Tilt the axis into a rising diagonal.
  root.rotation.z = Math.PI * 0.16;
  root.rotation.y = -Math.PI * 0.09;
  return root;
}

const Scene: React.FC = () => {
  const {gl, scene, camera} = useThree();
  const motor = useMemo(() => buildMotor(), []);
  const env = useMemo(() => new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04).texture, [gl]);
  scene.environment = env;
  scene.environmentIntensity = 0.7;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.05;
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = 22;
  cam.position.set(0.9, 2.4, 16.2);
  cam.lookAt(0.02, -0.05, 0);
  cam.updateProjectionMatrix();
  return (
    <>
      <directionalLight position={[-3, 6, 5]} intensity={2.4} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-bias={-0.0006} shadow-normalBias={0.02} shadow-radius={6} />
      <directionalLight position={[4, 1.5, 3]} intensity={0.5} />
      <hemisphereLight args={['#ffffff', '#c9ccd1', 0.35]} />
      <primitive object={motor} />
      <mesh rotation-x={-Math.PI / 2} position-y={-1.45} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.13} />
      </mesh>
    </>
  );
};

export const TeardownAvatar: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #ffffff 0%, #f2f3f5 55%, #e3e6ea 100%)'}}>
    <ThreeCanvas width={AV} height={AV} shadows gl={{antialias: true, preserveDrawingBuffer: true, alpha: true}}>
      <Scene />
    </ThreeCanvas>
  </AbsoluteFill>
);
