import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {TypeText, WordRise} from '../promo/motion';
import '../promo/fonts';
import {Assets, TonicWineBottle, CabinetCard, CocaLeaf, FountainGlass, HutchinsonBottle, KolaNut, Model, Nickel, PourStream, ReleaseWhenDrawn, useAssets} from './assets';

export const COLA_DURATION = 1800;
const PAPER = '#f4f2ee';
const INK = '#26262a';
const ACCENT = '#7a2e0e'; // cola brown, one word or number at a time
const CUTS = [0, 180, 390, 600, 780, 1050, 1260, 1470, 1650, COLA_DURATION];
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
  {pos: [[-0.05, 0.85, 0.58], [0, 0.74, 0.5]], look: [[0, 0.02, 0.02], [0, 0.02, 0.02]]},
  {pos: [[0.1, 0.55, 0.42], [0.06, 0.46, 0.34]], look: [[0.02, 0, 0.02], [0.02, 0.01, 0.02]]},
  {pos: [[0.45, 0.12, 0.72], [-0.25, 0.12, 0.7]], look: [[0.06, 0.09, 0], [-0.04, 0.09, 0]]},
  {pos: [[0, 0.1, 7.2], [0, 0.1, 6.4]], look: [[0, 0.35, 0], [0, 0.35, 0]], aperture: 0},
];

/* ------------------------------------------------------------------ 3D stage (white studio) */
const Rig: React.FC<{f: number; scene: number; height: number; width: number}> = ({f, scene, width, height}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const shot = SHOTS[scene];
  const t = e(f, CUTS[scene], CUTS[scene + 1], Easing.bezier(0.33, 0, 0.3, 1));
  const lerp = (a: V3, b: V3) => a.map((v, i) => v + (b[i] - v) * t) as V3;
  camera.position.set(...lerp(...shot.pos));
  camera.lookAt(...lerp(...shot.look));
  camera.near = scene === 8 ? 0.1 : 0.01;
  camera.far = 60;
  // hero sits a little below centre: titles above, body copy below (SKILL.md layout)
  camera.setViewOffset(width, height, 0, -height * 0.05, width, height);
  camera.updateProjectionMatrix();
  return null;
};

const Studio: React.FC<{env: THREE.Texture; scene: number}> = ({env, scene}) => {
  const {gl, scene: s3} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    s3.environment = pm.fromEquirectangular(env).texture;
    pm.dispose();
    gl.setClearColor(PAPER, 0);
  }, [gl, s3, env]);
  s3.environmentIntensity = scene === 8 ? 0 : 0.9;
  s3.background = null;
  if (scene === 8) {
    return <directionalLight position={[-5, 1.5, 3]} intensity={3} color="#fff6ea" />;
  }
  return (
    <>
      {/* one soft key from upper left, shadows fall down-right (realism.md: white studio) */}
      <directionalLight
        position={[-0.6, 1.1, 0.5]}
        intensity={2.2}
        color="#fffaf2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-0.5}
        shadow-camera-right={0.5}
        shadow-camera-top={0.5}
        shadow-camera-bottom={-0.5}
        shadow-camera-near={0.1}
        shadow-camera-far={3}
        shadow-radius={6}
        shadow-bias={-0.0002}
        shadow-normalBias={0.002}
      />
      <ambientLight intensity={0.25} />
      {/* shadow-only floor: objects sit on the paper backdrop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <shadowMaterial opacity={0.22} />
      </mesh>
    </>
  );
};

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
            <group key={i} position={[-0.16 + i * 0.04, 0.002 + i * 0.001, -0.02 + (i % 2) * 0.03]} rotation={[0, i * 1.3, 0]}>
              <group rotation={[-Math.PI / 2 + 0.06, 0, 0]}>
                <CocaLeaf seed={`c${i}`} length={0.05 + i * 0.005} />
              </group>
            </group>
          ))}
          {[0, 1].map((i) => (
            <group key={i} position={[0.1 + i * 0.045, 0.011, 0.02 - i * 0.02]} rotation={[0, i * 1.1, 0]}>
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
            <group position={[0.075, 0.00098 + drop + Math.sin(tilt) * 0.0106, 0.02]} rotation={[0, wobble, 0]}>
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

/* ------------------------------------------------------------------ 2D layers */
const TITLES: {kicker: string; lead: string; key: string; body: string; ghost: string}[] = [
  {kicker: 'THE ORIGIN STORY', lead: 'how a pharmacist invented', key: 'Coca-Cola', body: 'It began with a war wound, a tonic wine and a new law.', ghost: '1886'},
  {kicker: 'COLUMBUS, GEORGIA · 1865', lead: 'it starts with', key: 'John S. Pemberton', body: 'Wounded in the Civil War, he became dependent on morphine and searched for a substitute.', ghost: '1865'},
  {kicker: 'ATLANTA · 1885', lead: 'his first attempt', key: 'French Wine Coca', body: 'A tonic of wine, coca leaf and kola nut, sold for nerves and headaches.', ghost: '1885'},
  {kicker: 'ATLANTA · 1886', lead: 'then the city voted', key: 'to ban alcohol', body: 'So he remade the tonic as a syrup, without the wine.', ghost: '1886'},
  {kicker: "MAY 8, 1886 · JACOBS' PHARMACY", lead: 'first sold at a soda fountain for', key: '5¢ a glass', body: 'Syrup mixed with carbonated water, served in a 6.5-ounce glass. About nine glasses a day that first year.', ghost: '5¢'},
  {kicker: 'THE NAME', lead: 'named after its two ingredients', key: 'Coca + Kola', body: 'Bookkeeper Frank M. Robinson chose the name and wrote it out in flowing Spencerian script.', ghost: 'C+K'},
  {kicker: 'NEW OWNER · 1888', lead: 'after Pemberton died', key: 'Asa G. Candler', body: 'He took control for about $2,300 and founded The Coca-Cola Company in 1892.', ghost: '1888'},
  {kicker: '1894 – 1903', lead: 'then it went', key: 'into the bottle', body: 'First bottled in Vicksburg, Mississippi, in 1894. National bottling rights sold for $1 in 1899. Cocaine removed by 1903.', ghost: '$1'},
  {kicker: 'TODAY', lead: 'from one soda fountain to', key: '200+ countries', body: '', ghost: ''},
];

const Backdrop: React.FC<{f: number; scene: number}> = ({f, scene}) => {
  const s0 = CUTS[scene];
  const g = e(f, s0 + 2, s0 + 26);
  return (
    <AbsoluteFill
      style={{
        background: PAPER,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.04) 2px, transparent 2px)',
        backgroundSize: '64px 64px',
      }}
    >
      {/* ghost word: 9 % ink, rises 40 px as it fades in; the hero overlaps it */}
      <div
        style={{
          position: 'absolute',
          top: 640,
          width: 1080,
          textAlign: 'center',
          fontFamily: 'Poppins',
          fontWeight: 800,
          fontSize: 380,
          letterSpacing: -14,
          color: `rgba(38,38,42,${0.09 * g})`,
          transform: `translateY(${(1 - g) * 40}px)`,
        }}
      >
        {TITLES[scene].ghost}
      </div>
    </AbsoluteFill>
  );
};

const Titles: React.FC<{f: number; scene: number}> = ({f, scene}) => {
  const s0 = CUTS[scene];
  const t = TITLES[scene];
  const k = e(f, s0 + 6, s0 + 20);
  const cta = scene === 8 && f >= s0 + 80;
  return (
    <AbsoluteFill>
      {!cta ? (
        <div style={{position: 'absolute', left: 90, right: 90, top: 150}}>
          <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 24, letterSpacing: `${0.7 - 0.4 * k}em`, color: '#7a7a80', opacity: k}}>{t.kicker}</div>
          <div style={{fontFamily: 'Caveat', fontWeight: 600, fontSize: 66, color: INK, marginTop: 14}}>
            <TypeText text={t.lead} start={s0 + 10} cps={1.8} />
          </div>
          <div style={{fontFamily: 'Inter', fontWeight: 800, fontStyle: 'italic', fontSize: 96, lineHeight: 1.02, letterSpacing: -2, color: INK}}>
            <WordRise words={t.key.split(' ')} start={s0 + 20} gap={5} ink={scene === 4 ? [122, 46, 14] : [38, 38, 42]} />
          </div>
        </div>
      ) : (
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
          <div style={{fontFamily: 'Caveat', fontWeight: 600, fontSize: 72, color: INK}}>
            <TypeText text="follow for more" start={s0 + 84} cps={1.8} />
          </div>
          <div style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 124, color: INK, lineHeight: 1, letterSpacing: -3}}>
            <WordRise words={['ORIGIN', 'STORIES']} start={s0 + 92} gap={7} />
          </div>
        </div>
      )}
      {t.body && (
        <div style={{position: 'absolute', left: 90, right: 90, top: 1560, fontFamily: 'Inter', fontWeight: 500, fontSize: 36, lineHeight: 1.45, color: '#3a3a3e'}}>
          <TypeText text={t.body} start={s0 + 40} cps={3} trail={4} />
        </div>
      )}
      {scene === 8 && (
        <div style={{position: 'absolute', left: 90, right: 90, bottom: 70, fontFamily: 'Inter', fontWeight: 500, fontSize: 19, lineHeight: 1.5, color: 'rgba(38,38,42,0.55)', opacity: e(f, s0 + 20, s0 + 34)}}>
          Not affiliated with or endorsed by The Coca-Cola Company. Photos: public domain (Wikimedia Commons). Coin: Smithsonian NNC. 3D models &amp; HDRI: Poly Haven (CC0). Sound: Joseph Sardin, BigSoundBank (CC0). Earth: NASA.
        </div>
      )}
    </AbsoluteFill>
  );
};

const Stamp: React.FC<{f: number}> = ({f}) => {
  if (f < 640 || f >= 780) return null;
  const p = e(f, 640, 646, Easing.out(Easing.back(2)));
  return (
    <div
      style={{
        position: 'absolute',
        top: 420,
        left: '50%',
        transform: `translateX(-50%) rotate(-8deg) scale(${1.6 - 0.6 * p})`,
        opacity: p * 0.85,
        border: `7px solid ${ACCENT}`,
        color: ACCENT,
        padding: '6px 30px',
        fontFamily: 'Poppins',
        fontWeight: 800,
        fontSize: 84,
        letterSpacing: 10,
        borderRadius: 8,
        mixBlendMode: 'multiply',
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
    <div style={{position: 'absolute', top: 1360, right: 90, textAlign: 'right', opacity: e(f, 1300, 1312)}}>
      <div style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 130, color: ACCENT, lineHeight: 1, letterSpacing: -4, fontVariantNumeric: 'tabular-nums'}}>${v.toLocaleString('en-US')}</div>
    </div>
  );
};

const NameScript: React.FC<{f: number}> = ({f}) => {
  if (f < 1050 || f >= 1260) return null;
  const strike = e(f, 1150, 1162);
  return (
    <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', fontFamily: 'Caveat', fontWeight: 600, fontSize: 120, color: INK}}>
      <TypeText text="Coca" start={1070} cps={0.35} trail={8} />
      <span style={{opacity: e(f, 1090, 1098), margin: '0 24px', color: '#9a9aa0'}}>+</span>
      <span style={{position: 'relative', display: 'inline-block'}}>
        <TypeText text="Kola" start={1100} cps={0.35} trail={8} />
        <svg width={70} height={120} style={{position: 'absolute', left: -4, top: 20, overflow: 'visible'}}>
          <line x1={0} y1={100} x2={60 * strike} y2={100 - 90 * strike} stroke={ACCENT} strokeWidth={7} strokeLinecap="round" />
        </svg>
        <span style={{position: 'absolute', left: 8, top: -90, color: ACCENT, opacity: e(f, 1162, 1174)}}>C</span>
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
// Transitions straddle each cut (SOP 3.1), 18 frames, vocabulary from SKILL.md.
const TRANS = ['', 'whipUp', 'defocus', 'whipLeft', 'flash', 'whipUp', 'defocus', 'whipLeft', 'defocus'];
const transition = (f: number) => {
  let tx = 0, ty = 0, blur = 0, flash = 0;
  CUTS.forEach((c, i) => {
    const type = TRANS[i];
    if (!type || f < c - 9 || f > c + 9) return;
    const t = interpolate(f, [c - 9, c + 9], [0, 1], clamp);
    const bell = Math.sin(t * Math.PI);
    if (type === 'whipUp') { ty = t < 0.5 ? t * 2 * 1920 : (t - 1) * 2 * 1920; blur = bell * 30; }
    if (type === 'whipLeft') { tx = t < 0.5 ? -t * 2 * 1080 : (1 - t) * 2 * 1080; blur = bell * 30; }
    if (type === 'defocus') blur = bell * 28;
    if (type === 'flash') { flash = bell; blur = bell * 10; }
  });
  return {tx, ty, blur, flash};
};

// Window-blind light across paper and objects (breakdown 3; realism.md gobo shadows).
const Blinds: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill
    style={{
      background: 'repeating-linear-gradient(-38deg, rgba(90,70,50,0) 0 170px, rgba(90,70,50,0.55) 210px 300px, rgba(90,70,50,0) 340px 500px)',
      backgroundPosition: `${f * 0.3}px 0`,
      filter: 'blur(28px)',
      mixBlendMode: 'multiply',
      opacity: 0.2,
      transform: 'scale(1.35)',
    }}
  />
);

const Grain: React.FC<{f: number}> = ({f}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.06, mixBlendMode: 'multiply'}}>
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
  const tr = transition(f);
  const fade = Math.max(interpolate(f, [0, 10], [1, 0], clamp), interpolate(f, [COLA_DURATION - 16, COLA_DURATION - 1], [0, 1], clamp));
  return (
    <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${tr.tx}px, ${tr.ty}px)`, filter: `blur(${tr.blur}px)`}}>
        <Backdrop f={f} scene={scene} />
        <AbsoluteFill style={{filter: 'drop-shadow(0 18px 24px rgba(60,50,40,0.12))'}}>
          <ThreeCanvas
            width={width}
            height={height}
            shadows={{type: THREE.PCFSoftShadowMap}}
            gl={{antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0}}
            camera={{fov: 32, near: 0.01, far: 60, position: [0, 0.1, 0.5]}}
          >
            {a && (
              <>
                <Studio env={a.env} scene={scene} />
                <Rig f={f} scene={scene} width={width} height={height} />
                <World f={f} scene={scene} a={a} />
              </>
            )}
            <ReleaseWhenDrawn handle={handle} ready={!!a} />
          </ThreeCanvas>
        </AbsoluteFill>
        <Blinds f={f} />
        <NameScript f={f} />
        <Stamp f={f} />
        <Candler2300 f={f} />
        <Titles f={f} scene={scene} />
      </AbsoluteFill>
      <Grain f={f} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(60,50,40,0.18) 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 30%, #fff1d6, #ffbf80 60%, transparent 100%)', mixBlendMode: 'screen', opacity: tr.flash * 0.9}} />
      <AbsoluteFill style={{background: PAPER, opacity: fade}} />
      {sound && <Sound />}
    </AbsoluteFill>
  );
};
