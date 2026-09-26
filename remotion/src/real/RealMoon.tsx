import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Audio, Easing, continueRender, delayRender, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import '../promo/fonts';
import {moonTexture} from '../space/textures';

export const REAL_DURATION = 330;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);

// Loads textures before the frame is captured, so no frame renders half-loaded.
const useTextures = () => {
  const [tex, setTex] = useState<Record<string, THREE.Texture> | null>(null);
  const [handle] = useState(() => delayRender('Loading NASA textures', {timeoutInMilliseconds: 120000}));
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const files = {
      moon: 'real/moon_color_4k.jpg',
      moonHeight: 'real/moon_height_4k.png',
      moonNormal: 'real/moon_normal_4k.jpg',
      earth: 'real/earth_day_4k.jpg',
      clouds: 'real/earth_clouds.jpg',
    };
    Promise.all(
      Object.entries(files).map(
        ([k, f]) =>
          new Promise<[string, THREE.Texture]>((res, rej) =>
            loader.load(
              staticFile(f),
              (t) => {
                if (k === 'moon' || k === 'earth') t.colorSpace = THREE.SRGBColorSpace;
                t.anisotropy = 8;
                res([k, t]);
              },
              undefined,
              rej,
            ),
          ),
      ),
    ).then((entries) => setTex(Object.fromEntries(entries)));
  }, []);
  useEffect(() => {
    if (tex) requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)));
  }, [tex, handle]);
  return tex;
};

const RealMoonMesh: React.FC<{r: number; tex: Record<string, THREE.Texture>; spin: number}> = ({r, tex, spin}) => (
  <mesh rotation={[0.12, spin, 0]}>
    <sphereGeometry args={[r, 512, 256]} />
    <meshStandardMaterial
      map={tex.moon}
      displacementMap={tex.moonHeight}
      displacementScale={r * 0.018}
      displacementBias={-r * 0.009}
      normalMap={tex.moonNormal}
      normalScale={new THREE.Vector2(1.1, 1.1)}
      roughness={1}
      metalness={0}
    />
  </mesh>
);

const OldMoonMesh: React.FC<{r: number; spin: number}> = ({r, spin}) => {
  const t = useMemo(moonTexture, []);
  return (
    <mesh rotation={[0.12, spin, 0]}>
      <sphereGeometry args={[r, 96, 64]} />
      <meshStandardMaterial map={t} bumpMap={t} bumpScale={3} roughness={0.95} />
    </mesh>
  );
};

// Thin blue rim of atmosphere: brighter where the surface turns away from the camera.
const atmosphereMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {sunDir: {value: new THREE.Vector3(1, 0, 0)}},
    vertexShader: `
      varying vec3 vNormal; varying vec3 vWorldNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 sunDir; varying vec3 vNormal; varying vec3 vWorldNormal;
      void main() {
        float rim = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
        float lit = smoothstep(-0.25, 0.5, dot(normalize(-vWorldNormal), sunDir));
        gl_FragColor = vec4(0.35, 0.6, 1.0, 1.0) * rim * lit * 1.1;
      }`,
  });

const Earth: React.FC<{r: number; tex: Record<string, THREE.Texture>; spin: number; sunDir: THREE.Vector3}> = ({r, tex, spin, sunDir}) => {
  const atmo = useMemo(atmosphereMaterial, []);
  atmo.uniforms.sunDir.value.copy(sunDir);
  return (
    <group rotation={[0, 0, 0.41]}>
      <mesh rotation={[0, spin, 0]}>
        <sphereGeometry args={[r, 128, 96]} />
        <meshStandardMaterial map={tex.earth} roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh rotation={[0, spin * 1.1, 0]}>
        <sphereGeometry args={[r * 1.008, 128, 96]} />
        <meshStandardMaterial color="#ffffff" alphaMap={tex.clouds} transparent depthWrite={false} roughness={1} />
      </mesh>
      <mesh material={atmo}>
        <sphereGeometry args={[r * 1.06, 96, 64]} />
      </mesh>
    </group>
  );
};

const Stars: React.FC = () => {
  const pts = useMemo(() => {
    const n = 2400;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = random(`u${i}`) * 2 - 1;
      const th = random(`t${i}`) * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      pos.set([s * Math.cos(th) * 60, u * 60, s * Math.sin(th) * 60 - 30], i * 3);
      const b = 0.25 + Math.pow(random(`b${i}`), 6) * 0.75;
      col.set([b, b, b * (0.9 + random(`c${i}`) * 0.2)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({size: 2.2, sizeAttenuation: false, vertexColors: true}));
  }, []);
  return <primitive object={pts} />;
};

const World: React.FC<{f: number; tex: Record<string, THREE.Texture> | null}> = ({f, tex}) => {
  const {fps} = useVideoConfig();
  if (!tex) return null;
  const compare = f < 128;
  const spin = (f / fps) * 0.18;

  if (compare) {
    // Same lighting, same rotation: only the data changes.
    return (
      <>
        <ambientLight intensity={0.03} />
        <directionalLight position={[6, 2, 3]} intensity={3.4} />
        <Stars />
        <group position={[0, 1.45, 0]}>
          <OldMoonMesh r={1.2} spin={spin + 1.6} />
        </group>
        <group position={[0, -1.85, 0]}>
          <RealMoonMesh r={1.2} tex={tex} spin={spin + 1.6} />
        </group>
      </>
    );
  }

  // Cinematic: grazing sunlight across the terminator while Earth rises over the limb.
  const t = interpolate(f, [128, REAL_DURATION], [0, 1], clamp);
  const a = 2.55 - t * 0.2;
  const sun = new THREE.Vector3(Math.cos(a), 0.2, Math.sin(a)).normalize();
  const earthY = interpolate(f, [150, 318], [-0.6, 4.1], {...clamp, easing: ease});
  return (
    <>
      <ambientLight intensity={0.02} />
      <directionalLight position={sun.clone().multiplyScalar(20).toArray()} intensity={3.6} />
      {/* faint blue earthshine on the night side */}
      <directionalLight position={[0, 6, -10]} intensity={0.05} color="#8fb4ff" />
      <Stars />
      <group position={[2.5, earthY, -16]}>
        <Earth r={1.35} tex={tex} spin={spin * 0.6 + 3.9} sunDir={sun} />
      </group>
      <group position={[0.3, -2.25, 0]}>
        <RealMoonMesh r={2.6} tex={tex} spin={spin * 0.35 + 2.2} />
      </group>
    </>
  );
};

export const RealMoon: React.FC<{sound: boolean}> = ({sound}) => {
  const f = useCurrentFrame();
  const tex = useTextures();
  const {width, height} = useVideoConfig();
  const compare = f < 128;
  const camZ = compare ? interpolate(f, [0, 128], [10.5, 10.2]) : interpolate(f, [128, REAL_DURATION], [6.6, 5.7], {...clamp, easing: ease});
  const fadeIn = interpolate(f, [0, 12], [1, 0], clamp);
  const cut = interpolate(f, [116, 128, 140], [0, 1, 0], clamp);
  const fadeOut = interpolate(f, [REAL_DURATION - 18, REAL_DURATION - 1], [0, 1], clamp);
  const label = (text: string, sub: string, top: number, start: number) => {
    const o = interpolate(f, [start, start + 12], [0, 1], clamp) * interpolate(f, [110, 120], [1, 0], clamp);
    return (
      <div style={{position: 'absolute', left: 70, top, opacity: o, transform: `translateY(${(1 - o) * 14}px)`}}>
        <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 30, letterSpacing: 6, color: '#fff'}}>{text}</div>
        <div style={{fontFamily: 'Inter', fontWeight: 500, fontSize: 26, color: '#9aa0aa', marginTop: 6}}>{sub}</div>
      </div>
    );
  };
  const capO = interpolate(f, [170, 190], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <ThreeCanvas
        width={width}
        height={height}
        gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1}}
        camera={{fov: 35, near: 0.1, far: 200, position: [0, 0, camZ]}}
      >
        <CamPosition z={camZ} />
        <World f={f} tex={tex} />
      </ThreeCanvas>
      {label('BEFORE', 'procedural texture, made up craters', 150, 10)}
      {label('AFTER', 'NASA LRO colour + elevation data', 1030, 22)}
      <div style={{position: 'absolute', left: 70, top: 150, opacity: capO}}>
        <div style={{fontFamily: 'Caveat', fontWeight: 600, fontSize: 64, color: '#d7dbe2'}}>every crater is real</div>
        <div style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 120, color: '#fff', letterSpacing: -3, lineHeight: 1}}>Earthrise</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, opacity: capO, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))'}} />
      <div style={{position: 'absolute', left: 70, bottom: 70, opacity: capO * 0.8, fontFamily: 'Inter', fontWeight: 500, fontSize: 22, color: '#8a909a', lineHeight: 1.5}}>
        Moon: NASA / GSFC / Arizona State University (LRO)
        <br />
        Earth: NASA Visible Earth, Blue Marble
      </div>
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, cut, fadeOut)}} />
      {sound && <Audio src={staticFile('real-sfx.wav')} />}
    </AbsoluteFill>
  );
};

const CamPosition: React.FC<{z: number}> = ({z}) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(0, 0, z);
  camera.lookAt(0, 0, 0);
  return null;
};
