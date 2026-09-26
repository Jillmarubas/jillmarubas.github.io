import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {Paper, TypeText, WordRise, clamp, ease, useSpr, whip} from '../promo/motion';
import '../promo/fonts';
import {bandTexture, cloudTexture, earthTexture, moonTexture, plainTexture} from './textures';

export const SPACE_DURATION = 480;
const INK = '#26262a';
const ACCENT = '#e8662c';
const PX = 304.5; // screen pixels per world unit at z = 0 (camera z 10, fov 35, 1920 tall)

const T = {
  script: {fontFamily: 'Caveat', fontWeight: 600, color: INK} as React.CSSProperties,
  bold: {fontFamily: 'Inter', fontWeight: 800, fontStyle: 'italic', color: INK, letterSpacing: -1} as React.CSSProperties,
  display: {fontFamily: 'Poppins', fontWeight: 700, color: INK, letterSpacing: -3, lineHeight: 1} as React.CSSProperties,
  body: {fontFamily: 'Inter', fontWeight: 500, fontSize: 32, lineHeight: 1.45, color: '#3a3a3e'} as React.CSSProperties,
  label: {fontFamily: 'Inter', fontWeight: 800, fontSize: 22, letterSpacing: 4, color: '#555'} as React.CSSProperties,
};

// Scene boundaries (global frames) and the frame each transition swaps content on.
const CUTS = [0, 100, 221, 320, 401, SPACE_DURATION];
const sceneAt = (f: number) => CUTS.findIndex((c, i) => f >= c && f < CUTS[i + 1]);

const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>
);

/* --------------------------------------------------------------- 3D helpers */

const useTextures = () =>
  useMemo(
    () => ({
      earth: earthTexture(),
      clouds: cloudTexture(),
      moon: moonTexture(),
      mercury: plainTexture(21, 150),
      venus: bandTexture(22, 205, 10),
      mars: plainTexture(23, 125),
      jupiter: bandTexture(24, 170, 45),
      saturn: bandTexture(25, 200, 22),
      uranus: bandTexture(26, 215, 6),
      neptune: bandTexture(27, 110, 14),
    }),
    [],
  );

type Tex = ReturnType<typeof useTextures>;

const Earth: React.FC<{r: number; spin: number; tex: Tex}> = ({r, spin, tex}) => (
  <group rotation={[0, 0, 0.41]}>
    <mesh rotation={[0, spin, 0]}>
      <sphereGeometry args={[r, 96, 64]} />
      <meshStandardMaterial map={tex.earth} roughness={0.75} metalness={0.05} />
    </mesh>
    <mesh rotation={[0, spin * 1.25, 0]}>
      <sphereGeometry args={[r * 1.015, 96, 64]} />
      <meshStandardMaterial color="#ffffff" alphaMap={tex.clouds} transparent depthWrite={false} roughness={1} />
    </mesh>
  </group>
);

const Moon: React.FC<{r: number; spin?: number; tex: Tex}> = ({r, spin = 0, tex}) => (
  <mesh rotation={[0, spin, 0]}>
    <sphereGeometry args={[r, 96, 64]} />
    <meshStandardMaterial map={tex.moon} bumpMap={tex.moon} bumpScale={3} roughness={0.95} />
  </mesh>
);

// A dashed line that draws itself on, as a fraction p of its length.
const DashedLine: React.FC<{points: THREE.Vector3[]; p: number; dash?: number; color?: string}> = ({points, p, dash = 0.07, color = '#2a2a2e'}) => {
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    const l = new THREE.Line(g, new THREE.LineDashedMaterial({color, dashSize: dash, gapSize: dash * 0.8}));
    l.computeLineDistances();
    return l;
  }, [points, dash, color]);
  line.geometry.setDrawRange(0, Math.floor(points.length * p));
  return <primitive object={line} />;
};

const circlePoints = (r: number, n = 240) =>
  Array.from({length: n + 1}, (_, i) => new THREE.Vector3(Math.cos((i / n) * Math.PI * 2) * r, 0, Math.sin((i / n) * Math.PI * 2) * r));

/* --------------------------------------------------------------- scene 1: hook */
const HookScene: React.FC<{f: number; tex: Tex}> = ({f, tex}) => {
  const {fps} = useVideoConfig();
  const grow = interpolate(f, [4, 26], [0, 1], {...clamp, easing: ease});
  const ring = useMemo(() => circlePoints(2.45), []);
  const draw = interpolate(f, [22, 52], [0, 1], {...clamp, easing: ease});
  const a = (f / fps) * 0.9 + 0.2;
  return (
    <group position={[0, -0.55, 0]}>
      <group scale={grow} rotation={[0, (1 - grow) * -2, 0]}>
        <Earth r={1.45} spin={f * 0.012} tex={tex} />
      </group>
      <group rotation={[1.36, 0, -0.12]}>
        <DashedLine points={ring} p={draw} />
        <group position={[Math.cos(a) * 2.45, 0, Math.sin(a) * 2.45]} scale={draw > 0.95 ? 1 : draw}>
          <Moon r={0.34} tex={tex} spin={f * 0.01} />
        </group>
      </group>
    </group>
  );
};

/* --------------------------------------------------------------- scene 2: true scale */
const KM = 5.2 / 405700; // world units per km (Earth to Moon centre at apogee)
const PLANETS: [string, number, keyof Tex][] = [
  ['MERCURY', 2440, 'mercury'],
  ['VENUS', 6052, 'venus'],
  ['MARS', 3390, 'mars'],
  ['JUPITER', 69911, 'jupiter'],
  ['SATURN', 58232, 'saturn'],
  ['URANUS', 25362, 'uranus'],
  ['NEPTUNE', 24622, 'neptune'],
];
const COL_X = 0.85;
const EARTH_Y = -2.6;
const MOON_Y = 2.6;

const planetLayout = () => {
  let cursor = EARTH_Y + 6371 * KM;
  return PLANETS.map(([name, rKm, key]) => {
    const r = rKm * KM;
    const y = cursor + r;
    cursor += 2 * r;
    return {name, r, y, key};
  });
};

const ScaleScene: React.FC<{f: number; tex: Tex}> = ({f, tex}) => {
  const line = useMemo(() => [new THREE.Vector3(COL_X, EARTH_Y, 0), new THREE.Vector3(COL_X, MOON_Y, 0)], []);
  const draw = interpolate(f, [108, 136], [0, 1], {...clamp, easing: ease});
  const layout = useMemo(planetLayout, []);
  return (
    <group>
      <group position={[COL_X, EARTH_Y, 0]}>
        <Earth r={6371 * KM * 1} spin={f * 0.02} tex={tex} />
      </group>
      <group position={[COL_X, MOON_Y, 0]}>
        <Moon r={1737 * KM} tex={tex} />
      </group>
      <DashedLine points={Array.from({length: 200}, (_, i) => line[0].clone().lerp(line[1], i / 199))} p={draw} dash={0.05} />
      {layout.map((pl, i) => {
        const start = 150 + i * 5;
        const t = interpolate(f, [start, start + 14], [0, 1], {...clamp, easing: ease});
        if (t <= 0) return null;
        return (
          <group key={pl.name} position={[COL_X + (1 - t) * 3.2, pl.y, 0]} rotation={[0, f * 0.01, pl.name === 'SATURN' ? 0.45 : 0]}>
            <mesh>
              <sphereGeometry args={[pl.r, 64, 48]} />
              <meshStandardMaterial map={tex[pl.key]} roughness={0.85} />
            </mesh>
            {pl.name === 'SATURN' && (
              <mesh rotation={[-1.25, 0, 0]}>
                <ringGeometry args={[pl.r * 1.25, pl.r * 1.95, 96]} />
                <meshStandardMaterial color="#bdb7ab" side={THREE.DoubleSide} transparent opacity={0.85} roughness={0.9} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

/* --------------------------------------------------------------- scene 3: launch */
const Rocket: React.FC<{flame: number}> = ({flame}) => {
  const body = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0, 1.05],
          [0.08, 0.98],
          [0.18, 0.78],
          [0.24, 0.5],
          [0.26, 0.1],
          [0.26, -0.45],
          [0.22, -0.6],
          [0.16, -0.62],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        48,
      ),
    [],
  );
  return (
    <group>
      <mesh geometry={body}>
        <meshStandardMaterial color="#f2f2f0" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.2, 0.232, 0.08, 48]} />
        <meshStandardMaterial color="#2a2a2e" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.3, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.04, 32]} />
        <meshStandardMaterial color="#1e1e22" metalness={0.6} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 2 + Math.PI / 4, 0]}>
          <mesh position={[0.36, -0.42, 0]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[0.22, 0.34, 0.03]} />
            <meshStandardMaterial color={ACCENT} roughness={0.45} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.1, 0.16, 0.14, 32]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>
      <group position={[0, -0.78, 0]} scale={[1, flame, 1]}>
        <mesh position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.14, 0.9, 32]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.9} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.28, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.08, 0.55, 32]} />
          <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

const rocketY = (f: number) =>
  f < 246 ? -2.05 : interpolate(f, [246, 318], [-2.05, 6.5], {...clamp, easing: (t) => t * t * t});

const LaunchScene: React.FC<{f: number}> = ({f}) => {
  const ignite = interpolate(f, [232, 244], [0, 1], clamp);
  const shake = f > 232 && f < 262 ? (random(`sh${f}`) - 0.5) * 0.03 : 0;
  const flame = ignite * (0.85 + random(`fl${f}`) * 0.35) * (f > 246 ? 1.4 : 1);
  const y = rocketY(f);
  return (
    <group position={[-0.75 + shake, 0, 0]}>
      {/* launch pad */}
      <mesh position={[0, -2.9, 0]}>
        <boxGeometry args={[1.5, 0.12, 0.8]} />
        <meshStandardMaterial color="#3a3a3e" roughness={0.6} />
      </mesh>
      <mesh position={[0.62, -2.0, 0]}>
        <boxGeometry args={[0.07, 1.75, 0.07]} />
        <meshStandardMaterial color="#6a6a6e" roughness={0.6} />
      </mesh>
      <group position={[0, y, 0]}>
        <Rocket flame={flame} />
      </group>
      {/* smoke: puffs spawned along the path, growing and drifting outward */}
      {Array.from({length: 70}).map((_, i) => {
        const born = 234 + i * 1.2;
        const age = f - born;
        if (age < 0 || age > 60) return null;
        const side = random(`sd${i}`) - 0.5;
        const by = Math.min(rocketY(born) - 1.2, 1.5);
        const r = 0.12 + age * 0.012 + random(`sr${i}`) * 0.1;
        return (
          <mesh key={i} position={[side * (0.4 + age * 0.03), Math.max(-2.85, by) + age * 0.004, random(`sz${i}`) - 0.5]}>
            <sphereGeometry args={[r, 20, 14]} />
            <meshStandardMaterial color="#d9d9d6" roughness={1} transparent opacity={interpolate(age, [0, 6, 60], [0, 0.8, 0], clamp)} />
          </mesh>
        );
      })}
    </group>
  );
};

/* --------------------------------------------------------------- scene 4 & 5 */
const MoonScene: React.FC<{f: number; tex: Tex}> = ({f, tex}) => {
  const enter = interpolate(f, [320, 340], [0, 1], {...clamp, easing: ease});
  return (
    <group position={[1.05 + (1 - enter) * 1.5, -1.2, -1]} rotation={[0.2, Math.PI + f * 0.004, 0]}>
      <Moon r={2.3} tex={tex} />
    </group>
  );
};

const OutroScene: React.FC<{f: number; tex: Tex}> = ({f, tex}) => {
  const ring = useMemo(() => circlePoints(1.35), []);
  const draw = interpolate(f, [408, 432], [0, 1], {...clamp, easing: ease});
  const a = f * 0.04;
  const pop = interpolate(f, [402, 418], [0, 1], {...clamp, easing: ease});
  return (
    <group position={[0, 0.9, 0]} scale={pop}>
      <Earth r={0.62} spin={f * 0.015} tex={tex} />
      <group rotation={[1.25, 0, -0.25]}>
        <DashedLine points={ring} p={draw} />
        <group position={[Math.cos(a) * 1.35, 0, Math.sin(a) * 1.35]}>
          <Moon r={0.17} tex={tex} />
        </group>
      </group>
    </group>
  );
};

const World: React.FC<{f: number; scene: number}> = ({f, scene}) => {
  const tex = useTextures();
  // In the Moon scene the sun swings round so the shadow line sweeps across the craters.
  const sunAngle = scene === 3 ? interpolate(f, [320, 400], [2.3, 1.2]) : 2.4;
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[Math.cos(sunAngle) * 8, 3, Math.sin(sunAngle) * 8]} intensity={3.2} />
      <directionalLight position={[4, -2, 5]} intensity={0.35} color="#dfe6ff" />
      {scene === 0 && <HookScene f={f} tex={tex} />}
      {scene === 1 && <ScaleScene f={f} tex={tex} />}
      {scene === 2 && <LaunchScene f={f} />}
      {scene === 3 && <MoonScene f={f} tex={tex} />}
      {scene === 4 && <OutroScene f={f} tex={tex} />}
    </>
  );
};

/* --------------------------------------------------------------- text layers */
const Counter: React.FC<{from: number; to: number; start: number; end: number; decimals?: number}> = ({from, to, start, end, decimals = 0}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [start, end], [from, to], {...clamp, easing: ease});
  return <span style={{fontVariantNumeric: 'tabular-nums'}}>{v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}</span>;
};

const Fade: React.FC<{start: number; children: React.ReactNode}> = ({start, children}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [start, start + 10], [0, 1], {...clamp, easing: ease});
  return <span style={{opacity: p, display: 'inline-block', transform: `translateY(${(1 - p) * 20}px)`}}>{children}</span>;
};

const Text: React.FC<{scene: number}> = ({scene}) => {
  const layout = useMemo(planetLayout, []);
  if (scene === 0)
    return (
      <>
        <At x={90} y={190} style={{...T.script, fontSize: 70}}>
          <TypeText text="ever wondered" start={14} cps={1.4} />
        </At>
        <At x={90} y={270} style={{...T.bold, fontSize: 96, lineHeight: 1.05, width: 900}}>
          <WordRise words={['how', 'far', 'away']} start={24} gap={5} />
          <br />
          <WordRise words={['the', 'Moon', 'is?']} start={36} gap={5} />
        </At>
        <At x={90} y={1600} style={{...T.body, width: 900}}>
          <TypeText text="Hint: almost every diagram you've seen draws it way too close." start={56} cps={2.4} trail={4} />
        </At>
      </>
    );
  if (scene === 1)
    return (
      <>
        <At x={70} y={380} style={{...T.script, fontSize: 60}}>
          <TypeText text="on average it's" start={106} cps={1.5} />
        </At>
        <At x={70} y={450} style={{...T.display, fontSize: 118}}>
          <Counter from={0} to={384400} start={112} end={146} />
        </At>
        <At x={74} y={580} style={{...T.bold, fontSize: 64, color: ACCENT}}>
          <Fade start={130}>kilometres</Fade>
        </At>
        <At x={70} y={760} style={{...T.body, width: 430}}>
          <TypeText text="At its farthest, every other planet in the solar system fits in the gap. Here they are, to scale." start={150} cps={2.6} trail={4} />
        </At>
        {/* labels next to the tiny Earth and Moon */}
        <At x={540 + COL_X * PX - 150} y={960 - EARTH_Y * PX - 12} style={T.label}>
          <Fade start={104}>EARTH ▸</Fade>
        </At>
        <At x={540 + COL_X * PX - 138} y={960 - MOON_Y * PX - 12} style={T.label}>
          <Fade start={118}>MOON ▸</Fade>
        </At>
        {layout
          .filter((p) => p.name === 'JUPITER')
          .map((p, i) => (
            <At key={p.name} x={70} y={960 - p.y * PX - 12} style={T.label}>
              <Fade start={172 + i * 6}>{p.name} ——</Fade>
            </At>
          ))}
      </>
    );
  if (scene === 2)
    return (
      <>
        <At x={560} y={330} style={{...T.script, fontSize: 60}}>
          <TypeText text="to break free you need" start={226} cps={1.6} />
        </At>
        <At x={560} y={400} style={{...T.display, fontSize: 150}}>
          <Fade start={248}>
            <Counter from={0} to={11.2} start={250} end={280} decimals={1} />
          </Fade>
        </At>
        <At x={566} y={552} style={{...T.bold, fontSize: 64, color: ACCENT}}>
          <Fade start={262}>km / second</Fade>
        </At>
        <At x={560} y={680} style={{...T.body, width: 440}}>
          <TypeText text="That's about 33 times the speed of sound." start={276} cps={2.2} trail={4} />
        </At>
      </>
    );
  if (scene === 3)
    return (
      <>
        <At x={80} y={260} style={{...T.script, fontSize: 60}}>
          <TypeText text="even so, Apollo crews needed" start={326} cps={1.8} />
        </At>
        <At x={80} y={330} style={{...T.display, fontSize: 170}}>
          <WordRise words={['3', 'days']} start={340} gap={6} />
        </At>
        <At x={80} y={560} style={{...T.body, width: 560}}>
          <TypeText text="Moonlight makes the same trip to your eyes in about 1.3 seconds." start={352} cps={2.4} trail={4} />
        </At>
      </>
    );
  return (
    <>
      <At x={0} y={1180} style={{...T.script, fontSize: 70, width: 1080, textAlign: 'center'}}>
        <TypeText text="follow for more" start={414} cps={1.5} />
      </At>
      <At x={0} y={1260} style={{...T.display, fontSize: 132, width: 1080, textAlign: 'center'}}>
        <WordRise words={['SPACE', 'FACTS']} start={424} gap={7} />
      </At>
    </>
  );
};

/* --------------------------------------------------------------- camera moves */
const stageTransform = (f: number) => {
  // whip up (1), zoom punch (2), whip left (3), soft fade (4)
  const w1 = interpolate(f, [92, 108], [0, 1], {...clamp, easing: whip});
  const w2 = interpolate(f, [212, 230], [0, 1], {...clamp, easing: whip});
  const w3 = interpolate(f, [312, 328], [0, 1], {...clamp, easing: whip});
  const w4 = interpolate(f, [394, 408], [0, 1], clamp);
  const bell = (t: number) => Math.sin(t * Math.PI);
  let tx = 0, ty = 0, scale = 1, blur = 0, opacity = 1;
  if (w1 > 0 && w1 < 1) {
    ty = w1 < 0.5 ? w1 * 2 * 1920 : (w1 - 1) * 2 * 1920;
    blur = bell(w1) * 30;
  }
  if (w2 > 0 && w2 < 1) {
    scale = w2 < 0.5 ? 1 + w2 * 1.6 : 0.6 + (w2 - 0.5) * 0.8;
    blur = bell(w2) * 26;
    opacity = 0.4 + 0.6 * Math.abs(w2 - 0.5) * 2;
  }
  if (w3 > 0 && w3 < 1) {
    tx = w3 < 0.5 ? -w3 * 2 * 1080 : (1 - w3) * 2 * 1080;
    blur = bell(w3) * 30;
  }
  if (w4 > 0 && w4 < 1) opacity = Math.abs(w4 - 0.5) * 2;
  return {transform: `translate(${tx}px, ${ty}px) scale(${scale})`, filter: `blur(${blur}px)`, opacity};
};

export const Space: React.FC<{sound: boolean}> = ({sound}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const scene = sceneAt(f);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper />
      <AbsoluteFill style={stageTransform(f)}>
        <AbsoluteFill style={{filter: 'drop-shadow(0 34px 34px rgba(0,0,0,0.28))'}}>
          <ThreeCanvas
            width={width}
            height={height}
            gl={{antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping}}
            camera={{fov: 35, near: 0.1, far: 100, position: [0, 0, 10]}}
          >
            <World f={f} scene={scene} />
          </ThreeCanvas>
        </AbsoluteFill>
        <Text scene={scene} />
      </AbsoluteFill>
      {sound && <Audio src={staticFile('space-sfx.wav')} />}
    </AbsoluteFill>
  );
};
