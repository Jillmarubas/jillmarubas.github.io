import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {TypeText, WordRise} from '../promo/motion';
import '../promo/fonts';
import {Assets, TonicWineBottle, CabinetCard, CocaLeaf, FountainGlass, HutchinsonBottle, KolaNut, Model, Nickel, PourStream, ReleaseWhenDrawn, useAssets} from './assets';

export const COLA_DURATION = 1800;
const KEY = 230; // key spotlight intensity
const ENV = 0.75; // HDRI fill
const CUTS = [0, 180, 390, 600, 780, 1050, 1260, 1470, 1650, COLA_DURATION];
const AMBER = '#d9a066';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const smooth = Easing.bezier(0.45, 0, 0.2, 1);
const e = (f: number, a: number, b: number, easing = smooth) => interpolate(f, [a, b], [0, 1], {...clamp, easing});
const sceneAt = (f: number) => CUTS.findIndex((c, i) => f >= c && f < CUTS[i + 1]);

type V3 = [number, number, number];
// One dolly move per scene: camera from -> to, looking from -> to (metres).
const SHOTS: {pos: [V3, V3]; look: [V3, V3]; aperture?: number}[] = [
  // distances follow subject size: ~4x the subject's height fills ~45% of the frame
  {pos: [[0.2, 0.12, 0.62], [0.13, 0.1, 0.48]], look: [[0, 0.06, 0], [0, 0.062, 0]]},
  {pos: [[0.05, 0.55, 0.38], [0.03, 0.45, 0.3]], look: [[0, 0, 0.02], [0, 0, 0.015]]},
  {pos: [[0.5, 0.24, 1.05], [0.15, 0.2, 0.92]], look: [[-0.03, 0.13, 0], [-0.04, 0.12, 0]]},
  {pos: [[0.05, 0.26, 0.95], [0.02, 0.22, 0.82]], look: [[0, 0.11, 0], [0, 0.1, 0]]},
  {pos: [[0.22, 0.14, 0.58], [0.16, 0.11, 0.46]], look: [[0.03, 0.055, 0.02], [0.035, 0.045, 0.025]]},
  {pos: [[-0.05, 0.62, 0.4], [0, 0.52, 0.32]], look: [[0, 0.02, 0], [0, 0.02, 0]]},
  {pos: [[0.1, 0.55, 0.42], [0.06, 0.46, 0.34]], look: [[0.02, 0, 0.02], [0.02, 0.01, 0.02]]},
  {pos: [[0.45, 0.12, 0.72], [-0.25, 0.12, 0.7]], look: [[0.06, 0.09, 0], [-0.04, 0.09, 0]]},
  {pos: [[0, 0.15, 4.6], [0, 0.1, 3.9]], look: [[0, 0, 0], [0, 0, 0]], aperture: 0},
];

/* ------------------------------------------------------------------ renderer */
const Post: React.FC<{focus: number; aperture: number}> = ({focus, aperture}) => {
  const {gl, scene, camera, size} = useThree();
  const {composer, bokeh} = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    const b = new BokehPass(scene, camera, {focus: 0.3, aperture: 0.002, maxblur: 0.008});
    c.addPass(b);
    c.addPass(new OutputPass());
    return {composer: c, bokeh: b};
  }, [gl, scene, camera]);
  composer.setSize(size.width, size.height);
  (bokeh.uniforms as Record<string, {value: number}>).focus.value = focus;
  (bokeh.uniforms as Record<string, {value: number}>).aperture.value = aperture;
  bokeh.enabled = aperture > 0;
  useFrame(() => composer.render(), 1);
  return null;
};

const Rig: React.FC<{f: number; scene: number; height: number; width: number}> = ({f, scene, width, height}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const shot = SHOTS[scene];
  const t = e(f, CUTS[scene], CUTS[scene + 1], Easing.bezier(0.33, 0, 0.3, 1));
  const lerp = (a: V3, b: V3) => a.map((v, i) => v + (b[i] - v) * t) as V3;
  const p = lerp(...shot.pos);
  const l = lerp(...shot.look);
  camera.position.set(...p);
  camera.lookAt(...l);
  camera.near = scene === 8 ? 0.1 : 0.01;
  camera.far = 60;
  // push the subject into the upper part of the frame, leaving the lower third for titles
  camera.setViewOffset(width, height, 0, height * 0.14, width, height);
  camera.updateProjectionMatrix();
  return null;
};

// Venetian-blind pattern projected by the key light (realism.md: gobo shadows).
const blindsTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d')!;
  x.fillStyle = '#000';
  x.fillRect(0, 0, 512, 512);
  x.filter = 'blur(6px)';
  x.fillStyle = '#fff';
  for (let i = 0; i < 9; i++) x.fillRect(0, 20 + i * 56, 512, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const Lights: React.FC<{scene: number; target: V3}> = ({scene, target}) => {
  const gobo = useMemo(blindsTexture, []);
  const tgt = useMemo(() => new THREE.Object3D(), []);
  tgt.position.set(...target);
  tgt.updateMatrixWorld();
  if (scene === 8) {
    return (
      <>
        <directionalLight position={[-5, 1.5, 3]} intensity={3.2} color="#fff3e2" />
        <ambientLight intensity={0.02} />
      </>
    );
  }
  return (
    <>
      <primitive object={tgt} />
      <spotLight
        position={[-0.75, 0.95, 0.55]}
        target={tgt}
        angle={0.42}
        penumbra={0.55}
        intensity={KEY}
        decay={2}
        color="#ffcf98"
        map={gobo}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00008}
        shadow-normalBias={0.002}
        shadow-camera-near={0.2}
        shadow-camera-far={3}
      />
      {/* cool rim from behind, separates objects from the dark */}
      <directionalLight position={[0.6, 0.5, -1]} intensity={0.9} color="#9fb6ff" />
    </>
  );
};

const Environment: React.FC<{env: THREE.Texture; intensity: number}> = ({env, intensity}) => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromEquirectangular(env).texture;
    pm.dispose();
  }, [gl, scene, env]);
  scene.environmentIntensity = intensity;
  scene.background = new THREE.Color('#050403');
  return null;
};

const Table: React.FC<{a: Assets}> = ({a}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[3, 3]} />
    <meshStandardMaterial map={a.wood.map} normalMap={a.wood.normal} roughnessMap={a.wood.rough} roughness={0.9} color="#b39a86" envMapIntensity={0.6} />
  </mesh>
);

/* ------------------------------------------------------------------ scenes */
const settle = (f: number, at: number, from: number) => (1 - e(f, at, at + 18, Easing.bezier(0.22, 1, 0.36, 1))) * from;

const World: React.FC<{f: number; scene: number; a: Assets}> = ({f, scene, a}) => {
  const s0 = CUTS[scene];
  const g = a.gltf;
  switch (scene) {
    case 0:
      return (
        <>
          <FountainGlass fill={0.86} frame={f} />
          <group position={[-0.12, 0.001, -0.14]} rotation={[0, 0.8, 0]}>
            <group rotation={[-Math.PI / 2 + 0.05, 0, 0]}>
              <CocaLeaf dry seed="d1" />
            </group>
          </group>
          <group position={[0.1, 0.017, -0.2]}>
            <KolaNut seed="k0" />
          </group>
        </>
      );
    case 1:
      return (
        <>
          <group position={[0, 0.001 + settle(f, s0 + 4, 0.06), 0]} rotation={[0, 0.12, 0]}>
            <CabinetCard photo={a.photos.pemberton} caption="J. S. Pemberton" />
          </group>
          <Model scene={g.pocket_watch} position={[0.095, 0.008, 0.065]} rotation={[-Math.PI / 2, 0, 0.6]} />
          <Model scene={g.round_spectacles} position={[-0.1, 0, 0.09]} rotation={[0, 0.9, 0]} />
        </>
      );
    case 2:
      return (
        <>
          <TonicWineBottle scene={g.wine_bottles_01} position={[0.02, 0, -0.02]} rotation={[0, 0, 0]} />
          <Model scene={g.chemistry_set} position={[-0.26, 0, -0.22]} rotation={[0, 0.5, 0]} />
          {[0, 1, 2, 3].map((i) => (
            <group key={i} position={[-0.09 + i * 0.045, 0.002 + i * 0.001, 0.13 + (i % 2) * 0.02]} rotation={[0, i * 1.3, 0]}>
              <group rotation={[-Math.PI / 2 + 0.06, 0, 0]}>
                <CocaLeaf seed={`c${i}`} length={0.05 + i * 0.005} />
              </group>
            </group>
          ))}
          {[0, 1].map((i) => (
            <group key={i} position={[0.1 + i * 0.045, 0.011, 0.12 - i * 0.02]} rotation={[0, i * 1.1, 0]}>
              <KolaNut seed={`k${i}`} />
            </group>
          ))}
        </>
      );
    case 3: {
      const out = e(f, s0 + 30, s0 + 80);
      return (
        <>
          <TonicWineBottle scene={g.wine_bottles_01} position={[0.02 - out * 0.35, 0, -0.02 - out * 0.3]} rotation={[0, 0, 0]} />
          <Model scene={g.jug_01} position={[0.03 + (1 - e(f, s0 + 60, s0 + 110)) * 0.4, 0, 0.02]} rotation={[0, -2.2, 0]} scale={0.95} />
        </>
      );
    }
    case 4: {
      const pour = e(f, s0 + 10, s0 + 100, Easing.linear);
      const streamOn = f > s0 + 6 && f < s0 + 104;
      // the nickel drops, spins like a real coin and settles reverse-up
      const t = f - (s0 + 150);
      const drop = t < 0 ? null : t < 9 ? 0.22 * (1 - (t / 9) ** 2) : 0;
      const spinDecay = t < 9 ? 1 : Math.max(0, 1 - (t - 9) / 55);
      const tilt = t < 9 ? 0.7 : 0.5 * spinDecay * spinDecay;
      const wobble = t * (0.55 + 0.9 * (1 - spinDecay));
      return (
        <>
          <FountainGlass fill={0.05 + 0.81 * pour} frame={f} />
          {streamOn && <PourStream length={0.34 - (0.017 + 0.09 * pour)} top={0.36} />}
          {drop !== null && (
            <group position={[0.07, 0.00098 + drop + Math.sin(tilt) * 0.0106, 0.12]} rotation={[0, wobble, 0]}>
              <group rotation={[tilt, 0, 0]}>
                <Nickel a={a.coin} />
              </group>
            </group>
          )}
        </>
      );
    }
    case 5:
      return (
        <>
          <Model scene={g.binder_notebook} position={[0, 0, 0]} rotation={[0, 0.25, 0]} />
          <group position={[-0.1, 0.027, 0.03]} rotation={[0, 0.5, 0]}>
            <group rotation={[-Math.PI / 2 + 0.04, 0, 0]}>
              <CocaLeaf seed="n1" length={0.06} />
            </group>
          </group>
          <group position={[0.1, 0.037, 0.0]}>
            <KolaNut seed="n2" />
          </group>
        </>
      );
    case 6:
      return (
        <>
          <group position={[-0.02, 0.001 + settle(f, s0 + 4, 0.06), 0]} rotation={[0, -0.1, 0]}>
            <CabinetCard photo={a.photos.candler} caption="Asa G. Candler" />
          </group>
          {Array.from({length: 14}).map((_, i) => {
            const at = s0 + 50 + i * 5;
            const p = e(f, at, at + 7, Easing.in(Easing.quad));
            if (p <= 0) return null;
            return (
              <group key={i} position={[0.095 + Math.sin(i * 2.1) * 0.0012, 0.00098 + i * 0.00196 + (1 - p) * 0.08, 0.06 + Math.cos(i * 1.7) * 0.0012]} rotation={[0, i * 0.9, 0]}>
                <Nickel a={a.coin} />
              </group>
            );
          })}
        </>
      );
    case 7:
      return (
        <>
          {[-0.09, 0, 0.09].map((x, i) => (
            <group key={i} position={[x, 0, (i % 2) * -0.04]} rotation={[0, i, 0]}>
              <HutchinsonBottle level={0.72} />
            </group>
          ))}
        </>
      );
    default: {
      const grow = e(f, s0, s0 + 30);
      return (
        <group scale={0.85 + 0.15 * grow} rotation={[0, 0, 0.41]}>
          <mesh rotation={[0, 3.3 + f * 0.004, 0]}>
            <sphereGeometry args={[1, 128, 96]} />
            <meshStandardMaterial map={a.earth[0]} roughness={0.65} />
          </mesh>
          <mesh rotation={[0, 3.3 + f * 0.0046, 0]}>
            <sphereGeometry args={[1.008, 128, 96]} />
            <meshStandardMaterial color="#fff" alphaMap={a.earth[1]} transparent depthWrite={false} />
          </mesh>
        </group>
      );
    }
  }
};

/* ------------------------------------------------------------------ titles */
const TITLES: {kicker: string; title: string; body: string}[] = [
  {kicker: 'THE ORIGIN OF', title: 'Coca-Cola', body: "How a pharmacist's tonic became a global drink."},
  {kicker: '1865', title: 'John S. Pemberton', body: 'An Atlanta pharmacist wounded in the Civil War, he became dependent on morphine and searched for a substitute.'},
  {kicker: '1885', title: 'French Wine Coca', body: 'His first tonic: wine, coca leaf and kola nut, sold for nerves and headaches.'},
  {kicker: '1886', title: 'Atlanta goes dry', body: 'Local prohibition forced him to remake the tonic as a syrup, without the alcohol.'},
  {kicker: 'MAY 8, 1886', title: "Jacobs' Pharmacy", body: 'Mixed with carbonated water and sold for 5¢ a 6.5-ounce glass. About nine glasses a day that first year.'},
  {kicker: 'THE NAME', title: 'Coca + Kola', body: 'Bookkeeper Frank M. Robinson named it after its two ingredients and penned it in flowing Spencerian script.'},
  {kicker: '1888', title: 'Asa G. Candler', body: "After Pemberton's death, Candler gained control for about $2,300 and founded The Coca-Cola Company in 1892."},
  {kicker: '1894 – 1903', title: 'Into the bottle', body: 'First bottled in Vicksburg, Mississippi, in 1894. National bottling rights sold for $1 in 1899. Cocaine removed by 1903.'},
  {kicker: 'TODAY', title: 'Sold in 200+ countries', body: 'From one soda fountain in Atlanta.'},
];

const Titles: React.FC<{f: number; scene: number}> = ({f, scene}) => {
  const s0 = CUTS[scene];
  const len = CUTS[scene + 1] - s0;
  const t = TITLES[scene];
  const k = e(f, s0 + 8, s0 + 22);
  const out = 1 - e(f, s0 + len - 10, s0 + len - 2);
  const cta = scene === 8 && f >= s0 + 80;
  return (
    <AbsoluteFill style={{opacity: out}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 900, background: 'linear-gradient(transparent, rgba(5,4,3,0.82) 45%, rgba(5,4,3,0.95))'}} />
      {!cta ? (
        <div style={{position: 'absolute', left: 90, right: 90, bottom: 190}}>
          <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 28, letterSpacing: `${0.9 - 0.55 * k}em`, color: AMBER, opacity: k}}>{t.kicker}</div>
          <div style={{fontFamily: 'Cormorant Garamond', fontWeight: 600, fontSize: scene === 0 ? 150 : 104, lineHeight: 1.02, color: '#f4ecdf', marginTop: 14}}>
            <WordRise words={t.title.split(' ')} start={s0 + 14} gap={5} ink={[244, 236, 223]} />
          </div>
          <div style={{fontFamily: 'Inter', fontWeight: 500, fontSize: 36, lineHeight: 1.45, color: 'rgba(244,236,223,0.82)', marginTop: 22, maxWidth: 880}}>
            <TypeText text={t.body} start={s0 + 34} cps={3.2} trail={4} />
          </div>
        </div>
      ) : (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 300, textAlign: 'center'}}>
          <div style={{fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontWeight: 500, fontSize: 64, color: AMBER}}>
            <TypeText text="follow for more" start={s0 + 84} cps={1.8} />
          </div>
          <div style={{fontFamily: 'Cormorant Garamond', fontWeight: 600, fontSize: 124, color: '#f4ecdf', lineHeight: 1}}>
            <WordRise words={['Origin', 'Stories']} start={s0 + 92} gap={7} ink={[244, 236, 223]} />
          </div>
        </div>
      )}
      {scene === 8 && (
        <div style={{position: 'absolute', left: 90, right: 90, bottom: 70, fontFamily: 'Inter', fontWeight: 500, fontSize: 19, lineHeight: 1.5, color: 'rgba(244,236,223,0.5)', opacity: e(f, s0 + 20, s0 + 34)}}>
          Not affiliated with or endorsed by The Coca-Cola Company. Photos: public domain (Wikimedia Commons). Coin: Smithsonian NNC. 3D models &amp; HDRI: Poly Haven (CC0). Sound: Joseph Sardin, BigSoundBank (CC0). Earth: NASA.
        </div>
      )}
    </AbsoluteFill>
  );
};

const Stamp: React.FC<{f: number}> = ({f}) => {
  const p = e(f, 640, 646, Easing.out(Easing.back(2)));
  if (f < 640 || f > 772) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 300,
        left: '50%',
        transform: `translateX(-50%) rotate(-8deg) scale(${1.6 - 0.6 * p})`,
        opacity: p * 0.9,
        border: `7px solid ${AMBER}`,
        color: AMBER,
        padding: '8px 30px',
        fontFamily: 'Cormorant Garamond',
        fontWeight: 600,
        fontSize: 96,
        letterSpacing: 12,
        borderRadius: 8,
        background: 'rgba(8,6,4,0.55)',
        textShadow: '0 2px 12px rgba(0,0,0,0.6)',
      }}
    >
      PROHIBITION
    </div>
  );
};

const Candler2300: React.FC<{f: number}> = ({f}) => {
  if (f < 1300 || f >= 1470) return null;
  const v = Math.round(interpolate(f, [1300, 1370], [0, 2300], {...clamp, easing: smooth}));
  return (
    <div style={{position: 'absolute', top: 250, right: 70, textAlign: 'right', padding: '18px 26px', background: 'rgba(8,6,4,0.6)', borderRadius: 6, opacity: e(f, 1300, 1312) * (1 - e(f, 1458, 1468))}}>
      <div style={{fontFamily: 'Cormorant Garamond', fontWeight: 600, fontSize: 150, color: AMBER, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>${v.toLocaleString('en-US')}</div>
      <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 22, letterSpacing: '0.35em', color: 'rgba(244,236,223,0.7)'}}>FOR CONTROL</div>
    </div>
  );
};

const NameScript: React.FC<{f: number}> = ({f}) => {
  if (f < 1050 || f >= 1260) return null;
  const strike = e(f, 1150, 1162);
  return (
    <div style={{position: 'absolute', top: 260, left: 0, right: 0, textAlign: 'center', fontFamily: 'Caveat', fontWeight: 600, fontSize: 130, color: '#f4ecdf', textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>
      <TypeText text="Coca" start={1070} cps={0.35} trail={8} />
      <span style={{opacity: e(f, 1090, 1098), margin: '0 24px', color: AMBER}}>+</span>
      <span style={{position: 'relative', display: 'inline-block'}}>
        <TypeText text="Kola" start={1100} cps={0.35} trail={8} />
        <svg width={70} height={120} style={{position: 'absolute', left: -4, top: 20, overflow: 'visible'}}>
          <line x1={0} y1={100} x2={60 * strike} y2={100 - 90 * strike} stroke={AMBER} strokeWidth={7} strokeLinecap="round" />
        </svg>
        <span style={{position: 'absolute', left: 8, top: -90, color: AMBER, opacity: e(f, 1162, 1174)}}>C</span>
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ sound: real CC0 recordings + music bed */
type Cue = {at: number; src: string; vol: number; from?: number; len?: number};
const CUES: Cue[] = [
  {at: 4, src: 'sfx/soda_pour.wav', vol: 1, len: 176},
  ...[180, 390, 600, 780, 1050, 1260, 1470, 1650].map((c, i) => ({at: c - 6, src: i % 2 ? 'sfx/whoosh8.wav' : 'sfx/whoosh7.wav', vol: 0.7})),
  {at: 186, src: 'sfx/page_turn.wav', vol: 0.7},
  {at: 395, src: 'sfx/bottle_table.wav', vol: 1, from: 0, len: 40},
  {at: 470, src: 'sfx/cork.wav', vol: 1},
  {at: 640, src: 'sfx/bottle_table.wav', vol: 1, from: 0, len: 14},
  {at: 790, src: 'sfx/soda_pour.wav', vol: 0.95},
  {at: 930, src: 'sfx/coin_spin.wav', vol: 1, from: 0, len: 110},
  {at: 1056, src: 'sfx/page_turn.wav', vol: 0.8},
  {at: 1070, src: 'sfx/typewriter.wav', vol: 0.8, from: 30, len: 90},
  {at: 1266, src: 'sfx/page_turn.wav', vol: 0.7},
  {at: 1310, src: 'sfx/coins.wav', vol: 0.8, from: 0, len: 90},
  {at: 1480, src: 'sfx/bottle_table.wav', vol: 1, from: 0, len: 70},
  {at: 1560, src: 'sfx/cork.wav', vol: 1},
  {at: 1650, src: 'sfx/whoosh1.wav', vol: 0.9, from: 0, len: 90},
  {at: 1765, src: 'sfx/type_bell.wav', vol: 0.9},
];

export const Sound: React.FC<{music?: boolean}> = ({music = true}) => (
  <>
    {music && <Audio src={staticFile('cola-music.wav')} volume={0.3} />}
    {CUES.map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={c.len ?? 200} layout="none">
        <Audio src={staticFile(c.src)} volume={c.vol} trimBefore={c.from ?? 0} />
      </Sequence>
    ))}
  </>
);

/* ------------------------------------------------------------------ assembly */
const Grain: React.FC<{f: number}> = ({f}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.09, mixBlendMode: 'overlay'}}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 113} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

export const ColaOrigin: React.FC<{sound: boolean}> = ({sound}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const scene = sceneAt(f);
  const {assets: a, handle} = useAssets();
  const shot = SHOTS[scene];
  const t = e(f, CUTS[scene], CUTS[scene + 1], Easing.bezier(0.33, 0, 0.3, 1));
  const cam = shot.pos[0].map((v, i) => v + (shot.pos[1][i] - v) * t);
  const look = shot.look[0].map((v, i) => v + (shot.look[1][i] - v) * t) as V3;
  const focus = Math.hypot(cam[0] - look[0], cam[1] - look[1], cam[2] - look[2]);
  // dip through black at each cut, warm light-leak on the May 8 cut
  const dip = Math.max(...CUTS.slice(1, -1).map((c) => 1 - Math.min(1, Math.abs(f - c) / 6)), 0);
  const leak = Math.max(0, 1 - Math.abs(f - 780) / 10);
  const fade = Math.max(interpolate(f, [0, 12], [1, 0], clamp), interpolate(f, [COLA_DURATION - 18, COLA_DURATION - 1], [0, 1], clamp));
  return (
    <AbsoluteFill style={{background: '#050403', overflow: 'hidden'}}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{type: THREE.PCFSoftShadowMap}}
        gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0}}
        camera={{fov: 32, near: 0.01, far: 60, position: [0, 0.1, 0.5]}}
      >
        {a && (
          <>
            <Environment env={a.env} intensity={scene === 8 ? 0 : ENV} />
            <Rig f={f} scene={scene} width={width} height={height} />
            <Lights scene={scene} target={look} />
            {scene !== 8 && <Table a={a} />}
            <World f={f} scene={scene} a={a} />
            <Post focus={focus} aperture={shot.aperture ?? 0.0022} />
          </>
        )}
        <ReleaseWhenDrawn handle={handle} ready={!!a} />
      </ThreeCanvas>
      <NameScript f={f} />
      <Stamp f={f} />
      <Candler2300 f={f} />
      <Titles f={f} scene={scene} />
      <Grain f={f} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 30%, #ffd9a0, #ff9a4a 60%, transparent 100%)', mixBlendMode: 'screen', opacity: leak * 0.85}} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(dip, fade)}} />
      {sound && <Sound />}
    </AbsoluteFill>
  );
};
