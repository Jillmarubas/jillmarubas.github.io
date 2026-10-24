// Teardown Lab YouTube banner, 2560x1440. Phones show only the middle 1546x423 ("safe strip"),
// desktop the full-width 2560x423 strip, TVs the whole image. Name, tagline and face sit in the safe strip.
import React, {useMemo} from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import '@fontsource/inter/500.css';
import '@fontsource/inter/800.css';
import {buildMotor} from './Avatar';

export const BW = 2560;
export const BH = 1440;
const SAFE = {x: (BW - 1546) / 2, y: (BH - 423) / 2, w: 1546, h: 423};
const INK = '#16181c';
const ACCENT = '#ff6a1a';

const MotorScene: React.FC = () => {
  const {gl, scene, camera} = useThree();
  const motor = useMemo(() => {
    const m = buildMotor();
    const holder = new THREE.Group();
    holder.add(m);
    holder.scale.setScalar(0.52);
    holder.position.set(5.3, -0.02, 0);
    return holder;
  }, []);
  scene.environment = useMemo(() => new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04).texture, [gl]);
  scene.environmentIntensity = 0.7;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.05;
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = 22;
  cam.position.set(0.9, 1.4, 16);
  cam.lookAt(0.9, 0, 0);
  cam.updateProjectionMatrix();
  return (
    <>
      <directionalLight position={[-1, 6, 5]} intensity={2.4} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={0} shadow-camera-right={8} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-bias={-0.0006} shadow-normalBias={0.02} shadow-radius={6} />
      <directionalLight position={[6, 1.5, 3]} intensity={0.5} />
      <hemisphereLight args={['#ffffff', '#c9ccd1', 0.35]} />
      <primitive object={motor} />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.92} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.12} />
      </mesh>
    </>
  );
};

export const TeardownBanner: React.FC<{guides?: boolean}> = ({guides = false}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 70% at 50% 50%, #ffffff 0%, #f2f3f5 55%, #e1e4e8 100%)'}}>
    {/* Blueprint grid, fading out toward the edges */}
    <AbsoluteFill
      style={{
        backgroundImage:
          'linear-gradient(#dfe3e8 2px, transparent 2px), linear-gradient(90deg, #dfe3e8 2px, transparent 2px), linear-gradient(#eceef1 1px, transparent 1px), linear-gradient(90deg, #eceef1 1px, transparent 1px)',
        backgroundSize: '200px 200px, 200px 200px, 40px 40px, 40px 40px',
        backgroundPosition: '80px 20px',
        WebkitMaskImage: 'radial-gradient(ellipse 55% 60% at 50% 50%, #000 30%, transparent 100%)',
        opacity: 0.9,
      }}
    />
    <ThreeCanvas width={BW} height={BH} shadows gl={{antialias: true, preserveDrawingBuffer: true, alpha: true}}>
      <MotorScene />
    </ThreeCanvas>
    {/* Technician: face inside the safe strip, body fading out below */}
    <Img
      src={staticFile('brand/technician.png')}
      style={{
        position: 'absolute',
        width: 760,
        height: 760,
        left: 470,
        top: 500,
        WebkitMaskImage: 'linear-gradient(180deg, #000 70%, transparent 97%)',
        filter: 'drop-shadow(0 18px 30px rgba(20,24,30,0.18))',
      }}
    />
    {/* Name and tagline */}
    <div style={{position: 'absolute', left: 1150, top: SAFE.y + 96}}>
      <div style={{width: 120, height: 12, background: ACCENT, borderRadius: 6, marginBottom: 26}} />
      <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 120, lineHeight: 0.95, letterSpacing: '-0.035em', color: INK, whiteSpace: 'nowrap'}}>
        Teardown <span style={{color: ACCENT}}>Lab</span>
      </div>
      <div style={{fontFamily: 'Inter', fontWeight: 500, fontSize: 44, color: '#4b5159', marginTop: 22, whiteSpace: 'nowrap'}}>
        What’s inside everyday machines
      </div>
    </div>
    {guides && (
      <>
        <div style={{position: 'absolute', left: SAFE.x, top: SAFE.y, width: SAFE.w, height: SAFE.h, border: '4px dashed red'}} />
        <div style={{position: 'absolute', left: 0, top: SAFE.y, width: BW, height: SAFE.h, border: '4px dashed blue'}} />
      </>
    )}
  </AbsoluteFill>
);
