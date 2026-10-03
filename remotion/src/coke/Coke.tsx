import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {TypeText, WordRise, clamp, ease, DrawPath} from '../promo/motion';
import '../promo/fonts';
import {ApothecaryBottle, Coin, KolaNut, Leaf, Mortar, OldBottle, SodaGlass, SyrupJug, WineBottle} from './models';

export const COKE_DURATION = 1800;
const INK = '#26262a';
const ACCENT = '#a8541c'; // caramel: the drink's colour, not the brand's red
const FLOOR = -2;

// Scene boundaries and the transition used at each cut (SOP step 3.1: timeline first).
const CUTS = [0, 180, 390, 600, 780, 1050, 1260, 1470, 1650, COKE_DURATION];
const TRANS = ['', 'whipUp', 'defocus', 'flash', 'whipLeft', 'iris', 'defocus', 'whipUp', 'zoom'];
const sceneAt = (f: number) => CUTS.findIndex((c, i) => f >= c && f < CUTS[i + 1]);

const T = {
  script: {fontFamily: 'Caveat', fontWeight: 600, color: INK} as React.CSSProperties,
  bold: {fontFamily: 'Inter', fontWeight: 800, fontStyle: 'italic', color: INK, letterSpacing: -1} as React.CSSProperties,
  display: {fontFamily: 'Poppins', fontWeight: 700, color: INK, letterSpacing: -3, lineHeight: 1} as React.CSSProperties,
  body: {fontFamily: 'Inter', fontWeight: 500, fontSize: 34, lineHeight: 1.45, color: '#34343a'} as React.CSSProperties,
  label: {fontFamily: 'Inter', fontWeight: 800, fontSize: 24, letterSpacing: 8, color: '#6a6a70'} as React.CSSProperties,
};
const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>
);
const lin = (f: number, i: number[], o: number[]) => interpolate(f, i, o, clamp);
const eased = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: ease});

/* ---------------------------------------------------------------- 3D world */
const Environment: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.65;
    pmrem.dispose();
  }, [gl, scene]);
  return null;
};

const Camera: React.FC<{f: number; scene: number}> = ({f, scene}) => {
  const camera = useThree((s) => s.camera);
  const local = f - CUTS[scene];
  const len = CUTS[scene + 1] - CUTS[scene];
  const z = interpolate(local, [0, len], [10.2, 9.5]); // slow push-in every scene
  camera.position.set(0, 0.7, z);
  camera.lookAt(0, -0.45, 0);
  return null;
};

const useEarth = () => {
  const [tex, setTex] = useState<THREE.Texture[] | null>(null);
  const [handle] = useState(() => delayRender('earth textures', {timeoutInMilliseconds: 120000}));
  useEffect(() => {
    const l = new THREE.TextureLoader();
    Promise.all(['real/earth_day_4k.jpg', 'real/earth_clouds.jpg'].map((p) => l.loadAsync(staticFile(p)))).then((t) => {
      t[0].colorSpace = THREE.SRGBColorSpace;
      setTex(t);
    });
  }, []);
  useEffect(() => {
    if (tex) requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)));
  }, [tex, handle]);
  return tex;
};

const rise = (f: number, start: number) => {
  const p = eased(f, start, start + 16);
  return {y: (1 - p) * -1.2, s: 0.85 + 0.15 * p, o: p};
};

const World: React.FC<{f: number; scene: number; earth: THREE.Texture[] | null}> = ({f, scene, earth}) => {
  const s0 = CUTS[scene];
  return (
    <>
      <Environment />
      <Camera f={f} scene={scene} />
      <ambientLight intensity={0.12} />
      <directionalLight
        position={[-4.5, 6.5, 5]}
        intensity={2.3}
        color="#fff4e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {scene < 8 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.3} />
        </mesh>
      )}

      {scene === 0 && (
        <group position={[0, FLOOR, 0]} scale={1.35} rotation={[0, f * 0.004, 0]}>
          <SodaGlass fill={eased(f, 24, 120) * 0.86} frame={f} />
        </group>
      )}

      {scene === 1 && (
        <>
          <group position={[-0.95, FLOOR + rise(f, s0 + 8).y, 0.3]} scale={1.15 * rise(f, s0 + 8).s}>
            <Mortar />
          </group>
          <group position={[1.0, FLOOR + rise(f, s0 + 16).y, -0.4]} scale={1.2 * rise(f, s0 + 16).s} rotation={[0, -0.4 + f * 0.002, 0]}>
            <ApothecaryBottle label="TINCT." />
          </group>
        </>
      )}

      {scene === 2 && (
        <>
          <group position={[0.1, FLOOR + rise(f, s0 + 6).y, 0]} scale={1.05} rotation={[0, 0.3 + (f - s0) * 0.004, 0]}>
            <WineBottle />
          </group>
          {[0, 1, 2].map((i) => {
            const t = (f - s0) / 30;
            return (
              <group key={i} position={[-1.45 + i * 0.2, -1.5 + i * 0.55 + Math.sin(t + i) * 0.08, 0.7 - i * 0.3]} rotation={[0.4, 0.5 + i, -0.6 + i * 0.4 + Math.sin(t * 0.7 + i) * 0.1]}>
                <Leaf scale={0.8 * eased(f, s0 + 20 + i * 6, s0 + 36 + i * 6)} />
              </group>
            );
          })}
          {[0, 1, 2].map((i) => (
            <group key={i} position={[1.2 + i * 0.35, FLOOR + 0.22 + rise(f, s0 + 30 + i * 5).y * 0.3, 0.9 - i * 0.4]} scale={rise(f, s0 + 30 + i * 5).o}>
              <KolaNut seed={`k${i}`} />
            </group>
          ))}
        </>
      )}

      {scene === 3 && (
        <>
          {f < s0 + 80 && (
            <group position={[0, FLOOR - eased(f, s0 + 40, s0 + 76) * 2.4, 0]} scale={1.05} rotation={[0, 0.3 + (f - s0) * 0.004, eased(f, s0 + 40, s0 + 76) * 0.3]}>
              <WineBottle opacity={1 - eased(f, s0 + 46, s0 + 76)} />
            </group>
          )}
          <group position={[0, FLOOR + rise(f, s0 + 70).y, 0]} scale={1.25 * rise(f, s0 + 70).s} rotation={[0, -0.5 + (f - s0) * 0.003, 0]}>
            {f >= s0 + 66 && <SyrupJug />}
          </group>
        </>
      )}

      {scene === 4 && (
        <>
          <group position={[-0.45, FLOOR, 0]} scale={1.3} rotation={[0, f * 0.003, 0]}>
            <SodaGlass fill={eased(f, s0 + 20, s0 + 120) * 0.88} frame={f} />
          </group>
          {(() => {
            // the nickel drops, bounces twice, and settles
            const t = f - (s0 + 130);
            if (t < 0) return null;
            const h = t < 14 ? 3.2 * (1 - (t / 14) ** 2) : t < 24 ? 0.5 * Math.sin(((t - 14) / 10) * Math.PI) : t < 30 ? 0.12 * Math.sin(((t - 24) / 6) * Math.PI) : 0;
            const tilt = t < 30 ? (1 - t / 30) * 1.2 : 0;
            return (
              <group position={[0.85, FLOOR + 0.42 + h, 0.9]} rotation={[-Math.PI / 2 + 0.02 + tilt * 0.3, 0, tilt]}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                  <Coin big="5¢" small="FIVE CENTS" r={0.42} />
                </group>
              </group>
            );
          })()}
        </>
      )}

      {scene === 5 && (
        <>
          <group position={[-1.05 + (1 - eased(f, s0 + 8, s0 + 26)) * -2, -0.6, 0]} rotation={[0.15, 0.25 + Math.sin((f - s0) / 25) * 0.25, -0.35]}>
            <Leaf scale={1.5} />
          </group>
          <group position={[1.1 + (1 - eased(f, s0 + 14, s0 + 32)) * 2, -0.35, 0]} rotation={[(f - s0) * 0.01, (f - s0) * 0.015, 0]} scale={1.7}>
            <KolaNut seed="big" />
          </group>
        </>
      )}

      {scene === 6 && (
        <group position={[0.95, FLOOR, 0.2]}>
          {Array.from({length: 23}).map((_, i) => {
            const at = s0 + 40 + i * 3;
            const p = eased(f, at, at + 8);
            if (p <= 0) return null;
            return (
              <group key={i} position={[Math.sin(i * 1.7) * 0.03, 0.03 + i * 0.062 + (1 - p) * 1.5, Math.cos(i * 1.3) * 0.03]} rotation={[0, i * 0.7, 0]}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                  <Coin big="$" small="ONE DOLLAR" r={0.42} />
                </group>
              </group>
            );
          })}
        </group>
      )}

      {scene === 7 &&
        [-1.4, -0.7, 0, 0.7, 1.4].map((x, i) => {
          const r = rise(f, s0 + 10 + i * 6);
          return (
            <group key={i} position={[x, FLOOR + r.y * 0.6, -Math.abs(x) * 0.3]} scale={0.95 * r.s}>
              <OldBottle />
            </group>
          );
        })}

      {scene === 8 && earth && (
        <group position={[0, -0.9, 0]} scale={eased(f, s0 + 4, s0 + 24)} rotation={[0, 0, 0.41]}>
          <mesh rotation={[0, 3.6 + f * 0.006, 0]}>
            <sphereGeometry args={[1.55, 128, 96]} />
            <meshStandardMaterial map={earth[0]} roughness={0.65} />
          </mesh>
          <mesh rotation={[0, 3.6 + f * 0.0068, 0]}>
            <sphereGeometry args={[1.565, 128, 96]} />
            <meshStandardMaterial color="#fff" alphaMap={earth[1]} transparent depthWrite={false} />
          </mesh>
        </group>
      )}
    </>
  );
};

/* ---------------------------------------------------------------- text per scene */
const Counter: React.FC<{to: number; start: number; end: number; prefix?: string}> = ({to, start, end, prefix = ''}) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [start, end], [0, to], {...clamp, easing: ease}));
  return (
    <span style={{fontVariantNumeric: 'tabular-nums', opacity: f >= start ? 1 : 0}}>
      {prefix}
      {v.toLocaleString('en-US')}
    </span>
  );
};

const Ghost: React.FC<{text: string; start: number}> = ({text, start}) => {
  const f = useCurrentFrame();
  const p = eased(f, start, start + 24);
  return (
    <div
      style={{
        position: 'absolute',
        top: 520,
        width: 1080,
        textAlign: 'center',
        fontFamily: 'Poppins',
        fontWeight: 800,
        fontSize: 360,
        letterSpacing: -12,
        color: `rgba(38,38,42,${0.09 * p})`,
        transform: `translateY(${(1 - p) * 60}px)`,
      }}
    >
      {text}
    </div>
  );
};

const Head: React.FC<{s0: number; label?: string; script: string; bold: React.ReactNode; boldSize?: number}> = ({s0, label, script, bold, boldSize = 92}) => (
  <>
    {label && (
      <At x={90} y={170} style={T.label}>
        <TypeText text={label} start={s0 + 4} cps={2.5} />
      </At>
    )}
    <At x={90} y={230} style={{...T.script, fontSize: 64, width: 900}}>
      <TypeText text={script} start={s0 + 10} cps={1.8} />
    </At>
    <At x={90} y={312} style={{...T.bold, fontSize: boldSize, lineHeight: 1.05, width: 920}}>
      {bold}
    </At>
  </>
);

const Body: React.FC<{text: string; start: number}> = ({text, start}) => (
  <At x={90} y={1640} style={{...T.body, width: 900}}>
    <TypeText text={text} start={start} cps={2.6} trail={4} />
  </At>
);

const Accent: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: ACCENT}}>{children}</span>;

const Text: React.FC<{scene: number; f: number}> = ({scene, f}) => {
  const s0 = CUTS[scene];
  switch (scene) {
    case 0:
      return (
        <>
          <Head s0={s0} label="THE ORIGIN STORY" script="how did a pharmacist in Atlanta" bold={<WordRise words={['invent', 'Coca-Cola?']} start={s0 + 30} gap={7} />} boldSize={104} />
          <Body text="It began with pain, a tonic wine and a new law." start={s0 + 70} />
        </>
      );
    case 1:
      return (
        <>
          <Ghost text="1865" start={s0 + 2} />
          <Head s0={s0} label="COLUMBUS, GEORGIA" script="it starts with" bold={<WordRise words={['a', 'wounded', 'pharmacist']} start={s0 + 24} gap={6} />} />
          <Body text="John Pemberton was injured in one of the last battles of the Civil War and became dependent on morphine. He began searching for a substitute." start={s0 + 50} />
        </>
      );
    case 2:
      return (
        <>
          <Ghost text="1885" start={s0 + 2} />
          <Head s0={s0} label="ATLANTA" script="his first attempt" bold={<WordRise words={['French', 'Wine', 'Coca']} start={s0 + 22} gap={6} />} />
          <Body text="A tonic of wine, coca leaf and kola nut, sold as a cure for nerves and headaches." start={s0 + 50} />
        </>
      );
    case 3: {
      const stamp = eased(f, s0 + 30, s0 + 38);
      return (
        <>
          <Ghost text="1886" start={s0 + 2} />
          <Head s0={s0} label="ATLANTA" script="then the city voted" bold={<WordRise words={['to', 'ban', 'alcohol']} start={s0 + 20} gap={6} />} />
          {stamp > 0 && (
            <At
              x={540}
              y={560}
              style={{
                transform: `translateX(-50%) rotate(-9deg) scale(${1.5 - 0.5 * stamp})`,
                opacity: stamp * 0.9,
                border: `8px solid ${ACCENT}`,
                color: ACCENT,
                padding: '10px 34px',
                fontFamily: 'Poppins',
                fontWeight: 800,
                fontSize: 86,
                letterSpacing: 10,
                borderRadius: 10,
                mixBlendMode: 'multiply',
              }}
            >
              PROHIBITION
            </At>
          )}
          <Body text="So Pemberton remade his tonic as a sweet syrup, without the wine." start={s0 + 84} />
        </>
      );
    }
    case 4:
      return (
        <>
          <Ghost text="MAY 8" start={s0 + 2} />
          <Head s0={s0} label="JACOBS' PHARMACY · 1886" script="first sold at a soda fountain for" bold={<WordRise words={['5¢', 'a', 'glass']} start={s0 + 26} gap={6} />} boldSize={120} />
          <At x={760} y={1060} style={{...T.display, fontSize: 150, color: ACCENT, textAlign: 'center', width: 260, opacity: lin(f, [s0 + 190, s0 + 200], [0, 1])}}>
            <Counter to={9} start={s0 + 190} end={s0 + 215} />
            <div style={{...T.label, fontSize: 22, letterSpacing: 4, marginTop: 8}}>GLASSES A DAY</div>
          </At>
          <Body text="Mixed with carbonated water, the syrup became a drink. In its first year it sold about 9 glasses a day." start={s0 + 60} />
        </>
      );
    case 5: {
      const strike = eased(f, s0 + 90, s0 + 104);
      return (
        <>
          <Head s0={s0} label="THE NAME" script="named after its two key ingredients" bold={<span />} />
          <At x={90} y={440} style={{...T.display, fontSize: 128, display: 'flex', gap: 26, alignItems: 'baseline'}}>
            <WordRise words={['COCA']} start={s0 + 24} />
            <span style={{opacity: lin(f, [s0 + 34, s0 + 44], [0, 1]), color: '#9a9aa0'}}>+</span>
            <span style={{position: 'relative'}}>
              <WordRise words={['KOLA']} start={s0 + 40} />
              <svg width={140} height={170} style={{position: 'absolute', left: -10, top: -10, overflow: 'visible'}}>
                <line x1={10} y1={140} x2={10 + 110 * strike} y2={140 - 120 * strike} stroke={ACCENT} strokeWidth={10} strokeLinecap="round" />
              </svg>
              <span style={{position: 'absolute', left: 16, top: -100, fontFamily: 'Caveat', fontWeight: 600, fontSize: 130, color: ACCENT, opacity: eased(f, s0 + 104, s0 + 116)}}>C</span>
            </span>
          </At>
          <Body text="Bookkeeper Frank M. Robinson suggested the name, swapped the K for a C, and wrote it out in Spencerian script, a popular handwriting style of the day." start={s0 + 70} />
        </>
      );
    }
    case 6:
      return (
        <>
          <Ghost text="1888" start={s0 + 2} />
          <Head s0={s0} label="NEW OWNER" script="Pemberton sold out and died in 1888" bold={<span />} />
          <At x={90} y={330} style={{...T.display, fontSize: 170, color: ACCENT}}>
            <Counter to={2300} start={s0 + 40} end={s0 + 110} prefix="$" />
          </At>
          <At x={96} y={520} style={{...T.bold, fontSize: 52, width: 620}}>
            <WordRise words={['is', 'about', 'what', 'Asa', 'Candler', 'paid', 'for', 'control']} start={s0 + 70} gap={3} />
          </At>
          <Body text="Candler formed The Coca-Cola Company in 1892 and grew a pharmacy drink into a national business." start={s0 + 110} />
        </>
      );
    case 7:
      return (
        <>
          <Ghost text="$1" start={s0 + 2} />
          <Head s0={s0} label="BOTTLING" script="in 1899, national bottling rights sold for" bold={<WordRise words={['one', 'dollar']} start={s0 + 30} gap={7} />} boldSize={120} />
          <Body text="It was first bottled in Vicksburg, Mississippi, in 1894. By 1903 the cocaine from the coca leaf had been removed from the recipe." start={s0 + 50} />
        </>
      );
    default: {
      const cta = f >= s0 + 90;
      return (
        <>
          {!cta ? (
            <>
              <Head s0={s0} label="TODAY" script="from one pharmacy fountain to" bold={<WordRise words={['200+', 'countries']} start={s0 + 22} gap={7} />} boldSize={120} />
            </>
          ) : (
            <>
              <At x={0} y={250} style={{...T.script, fontSize: 72, width: 1080, textAlign: 'center'}}>
                <TypeText text="follow for more" start={s0 + 92} cps={1.6} />
              </At>
              <At x={0} y={330} style={{...T.display, fontSize: 124, width: 1080, textAlign: 'center'}}>
                <WordRise words={['ORIGIN', 'STORIES']} start={s0 + 100} gap={7} />
              </At>
            </>
          )}
          <At x={90} y={1700} style={{fontFamily: 'Inter', fontWeight: 500, fontSize: 22, lineHeight: 1.5, color: '#6a6a70', width: 900, opacity: lin(f, [s0 + 30, s0 + 45], [0, 1])}}>
            Not affiliated with or endorsed by The Coca-Cola Company.
            <br />
            Sources: The Coca-Cola Company history; New Georgia Encyclopedia. Earth: NASA Blue Marble.
          </At>
        </>
      );
    }
  }
};

/* ---------------------------------------------------------------- camera moves between scenes */
const transition = (f: number) => {
  let tx = 0, ty = 0, scale = 1, blur = 0, flash = 0, iris = -1;
  CUTS.forEach((c, i) => {
    const type = TRANS[i];
    if (!type) return;
    const w = 9;
    if (f < c - w || f > c + w) return;
    const t = interpolate(f, [c - w, c + w], [0, 1], clamp);
    const bell = Math.sin(t * Math.PI);
    if (type === 'whipUp') {
      ty = t < 0.5 ? t * 2 * 1920 : (t - 1) * 2 * 1920;
      blur = bell * 30;
    } else if (type === 'whipLeft') {
      tx = t < 0.5 ? -t * 2 * 1080 : (1 - t) * 2 * 1080;
      blur = bell * 30;
    } else if (type === 'defocus') {
      blur = bell * 26;
    } else if (type === 'flash') {
      flash = bell;
      blur = bell * 10;
    } else if (type === 'zoom') {
      scale = t < 0.5 ? 1 + t * 1.6 : 0.6 + (t - 0.5) * 0.8;
      blur = bell * 24;
    } else if (type === 'iris') {
      iris = Math.abs(t - 0.5) * 2;
    }
  });
  return {tx, ty, scale, blur, flash, iris};
};

/* ---------------------------------------------------------------- paper, gobo, grain */
const Paper: React.FC = () => (
  <AbsoluteFill
    style={{
      background: '#ebe7df',
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(40,35,30,0.035) 0 2px, transparent 2px 46px), radial-gradient(ellipse at 50% 40%, #f3efe7 0%, #e2ddd3 100%)',
    }}
  />
);

// Window-blind light: soft diagonal stripes over everything (realism.md, gobo shadows).
const Gobo: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill
    style={{
      background: 'repeating-linear-gradient(-38deg, rgba(60,45,30,0.0) 0 150px, rgba(60,45,30,0.55) 190px 290px, rgba(60,45,30,0.0) 330px 480px)',
      backgroundPosition: `${f * 0.35}px 0`,
      filter: 'blur(26px)',
      mixBlendMode: 'multiply',
      opacity: 0.32,
      transform: 'scale(1.3)',
    }}
  />
);

const Grain: React.FC<{f: number}> = ({f}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'multiply'}}>
    <filter id="g">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 97} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#g)" />
  </svg>
);

export const Coke: React.FC<{sound: boolean}> = ({sound}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const scene = sceneAt(f);
  const earth = useEarth();
  const tr = transition(f);
  const fadeIn = lin(f, [0, 10], [1, 0]);
  const fadeOut = lin(f, [COKE_DURATION - 16, COKE_DURATION - 1], [0, 1]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${tr.tx}px, ${tr.ty}px) scale(${tr.scale})`, filter: `blur(${tr.blur}px)`}}>
        <Paper />
        <Text scene={scene} f={f} />
        <AbsoluteFill style={{filter: 'drop-shadow(0 20px 30px rgba(40,30,20,0.18))'}}>
          <ThreeCanvas
            width={width}
            height={height}
            shadows
            gl={{antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05}}
            camera={{fov: 35, near: 0.1, far: 100, position: [0, 0.7, 10]}}
          >
            <World f={f} scene={scene} earth={earth} />
          </ThreeCanvas>
        </AbsoluteFill>
        <Gobo f={f} />
      </AbsoluteFill>
      <Grain f={f} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(25,18,10,0.42) 100%)'}} />
      {tr.flash > 0 && <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #fff6e2, #ffcf8a)', opacity: tr.flash * 0.95, mixBlendMode: 'screen'}} />}
      {tr.iris >= 0 && (
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, transparent ${tr.iris * 1150}px, #0b0a09 ${tr.iris * 1150 + 2}px)`}} />
      )}
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut)}} />
      {sound && <Audio src={staticFile('coke-sfx.wav')} />}
    </AbsoluteFill>
  );
};
