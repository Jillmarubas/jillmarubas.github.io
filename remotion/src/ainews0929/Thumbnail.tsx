// YouTube thumbnails for AI News Daily, 29 Sep 2026, leading with the leaked-photos story.
// One focal point: a rogue agent (red visor) on the right third, private photo prints spilling
// out toward the camera. Three words or fewer on the left. Variants change one variable each:
//   A  "53 PHOTOS LEAKED"  (the number)          · Cobalt Haze living gradient
//   B  "AI WENT ROGUE"     (the actor)           · same scene
//   C  "53 PHOTOS LEAKED"  (same text as A)      · darker alarm field
import React from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import './fonts';
import {LivingGradient, paletteFrom} from '../gradient/GradientLoop';
import {MotionBlurRenderer, MotionProvider, Mover, V3} from '../cola/motion3d';
import {OBJ} from './objects3d';
import {COBALT_GRADIENT} from './ui';
import {C, F} from './theme';

const TW = 1920;
const TH = 1080;
const CAM_Z = 12;
const PX = TH / (2 * CAM_Z * Math.tan((15 * Math.PI) / 180));
const w = (x: number, y: number, z = 0): V3 => {
  // screen px at depth z → world, so near objects land where they're drawn
  const k = (CAM_Z - z) / CAM_Z;
  return [((x - TW / 2) / PX) * k, (-(y - TH / 2) / PX) * k, z];
};

const Env: React.FC = () => {
  const {gl, scene} = useThree();
  React.useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.8;
    pm.dispose();
  }, [gl, scene]);
  return null;
};

// Photos fly out of the agent toward the viewer and to the left; the nearest ones fall out of focus.
const PHOTOS: {x: number; y: number; z: number; s: number; r: V3; seed: number}[] = [
  {x: 1120, y: 300, z: 0.5, s: 250, r: [0.2, 0.5, 0.35], seed: 101},
  {x: 1040, y: 640, z: 1.5, s: 270, r: [-0.25, 0.4, -0.3], seed: 103},
  {x: 1640, y: 250, z: 1.0, s: 230, r: [0.3, -0.5, -0.25], seed: 2},
  {x: 1700, y: 760, z: 3.0, s: 300, r: [-0.2, -0.45, 0.28], seed: 104},
  {x: 1250, y: 860, z: 5.6, s: 320, r: [0.12, 0.15, -0.3], seed: 102},
  {x: 1790, y: 470, z: 4.6, s: 280, r: [-0.1, -0.2, 0.32], seed: 4},
];

const Scene: React.FC = () => {
  const Orb = OBJ.orb;
  const Photo = OBJ.photo;
  return (
    <ThreeCanvas width={TW} height={TH} style={{position: 'absolute', inset: 0}} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08, alpha: true}} camera={{fov: 30, near: 0.1, far: 100, position: [0, 0, CAM_Z]}}>
      <MotionProvider>
        <Env />
        <directionalLight position={[-5, 6, 8]} intensity={2.4} color="#fff4ea" />
        <directionalLight position={[4, 3, -6]} intensity={1.8} color="#b8cbff" />
        <pointLight position={[1.9, 0.6, 1.5]} intensity={7} distance={6} color="#FF2E2E" />
        <hemisphereLight args={['#cfe0ff', '#0a2a6b', 0.55]} />
        <Mover track={() => ({p: w(1400, 510, 0), r: [0.12, -0.35, 0.08], s: 470 / PX})} f={0}>
          <Orb f={40} p={1} mood="alarm" seed={3} />
        </Mover>
        {PHOTOS.map((ph, i) => (
          <Mover key={i} track={() => ({p: w(ph.x, ph.y, ph.z), r: ph.r, s: (ph.s / PX) * ((CAM_Z - ph.z) / CAM_Z)})} f={0}>
            <Photo f={0} p={1} mood="err" seed={ph.seed} />
          </Mover>
        ))}
        <MotionBlurRenderer f={0} cam={() => ({pos: [0, 0, CAM_Z], look: [0, 0, 0]})} dof={{focus: CAM_Z, sharp: 7.2, soft: 4.2, maxPx: 34}} />
      </MotionProvider>
    </ThreeCanvas>
  );
};

const ALARM = paletteFrom([C.cobalt950, C.cobalt800, '#3B2F7A', '#5A2A5E'], 0);

export const LeakThumb: React.FC<{lines: [string, string][]; dark?: boolean}> = ({lines, dark}) => (
  <AbsoluteFill style={{background: C.cobalt950, overflow: 'hidden'}}>
    <LivingGradient palette={dark ? ALARM : COBALT_GRADIENT} />
    {/* keep the text third deep so the words pop at any size */}
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(4,31,92,.82) 0%, rgba(4,31,92,.5) 38%, rgba(4,31,92,0) 60%)'}} />
    {/* the leak: a red bloom behind the agent and streaks toward the viewer */}
    <AbsoluteFill style={{background: `radial-gradient(circle at 73% 47%, rgba(255,90,90,${dark ? 0.55 : 0.42}) 0%, rgba(255,90,90,0) 30%)`}} />
    <svg width={TW} height={TH} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="streak" x1="0" x2="1">
          <stop offset="0" stopColor={C.err} stopOpacity={0} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      {PHOTOS.map((ph, i) => (
        <line key={i} x1={1400} y1={510} x2={1400 + (ph.x - 1400) * 0.86} y2={510 + (ph.y - 510) * 0.86} stroke="url(#streak)" strokeWidth={6 + ph.z * 1.2} strokeLinecap="round" opacity={0.7} />
      ))}
    </svg>
    <Scene />
    {/* three words, stacked, on the left third */}
    <div style={{position: 'absolute', left: 90, top: 150, fontFamily: F.sans, fontWeight: 600, fontSize: 190, lineHeight: 0.9, letterSpacing: '-0.05em', color: C.frost, textShadow: '0 10px 40px rgba(2,10,40,.65), 0 2px 0 rgba(2,10,40,.5)'}}>
      {lines.map(([t, c], i) => (
        <div key={i} style={{color: c, paddingLeft: i % 2 ? '0.4em' : 0}}>
          {t}
        </div>
      ))}
    </div>
    {/* the grain belongs to the gradient; a light vignette frames the subject */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 55% 50%, rgba(0,0,0,0) 55%, rgba(2,10,36,.45) 100%)'}} />
  </AbsoluteFill>
);

export const LeakThumbA: React.FC = () => <LeakThumb lines={[['53', C.frost], ['PHOTOS', C.frost], ['LEAKED', C.err]]} />;
export const LeakThumbB: React.FC = () => <LeakThumb lines={[['AI', C.frost], ['WENT', C.frost], ['ROGUE', C.err]]} />;
export const LeakThumbC: React.FC = () => <LeakThumb dark lines={[['53', C.frost], ['PHOTOS', C.frost], ['LEAKED', C.err]]} />;

// Photo variants: a generated shocked reaction (fictional person, no logos) full-bleed,
// a cobalt scrim on the text third, same three words and palette as A.
export const ShockThumb: React.FC<{src: string; lines: [string, string][]; flip?: boolean}> = ({src, lines, flip}) => (
  <AbsoluteFill style={{background: C.cobalt950, overflow: 'hidden'}}>
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: flip ? 'scaleX(-1)' : undefined}} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(4,31,92,.88) 0%, rgba(4,31,92,.62) 34%, rgba(4,31,92,0) 56%)'}} />
    <div style={{position: 'absolute', left: 90, top: 150, fontFamily: F.sans, fontWeight: 600, fontSize: 190, lineHeight: 0.9, letterSpacing: '-0.05em', color: C.frost, textShadow: '0 10px 40px rgba(2,10,40,.7), 0 2px 0 rgba(2,10,40,.5)'}}>
      {lines.map(([t, c], i) => (
        <div key={i} style={{color: c, paddingLeft: i % 2 ? '0.4em' : 0}}>
          {t}
        </div>
      ))}
    </div>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 60% 50%, rgba(0,0,0,0) 55%, rgba(2,10,36,.4) 100%)'}} />
  </AbsoluteFill>
);

const LEAK_WORDS: [string, string][] = [['53', C.frost], ['PHOTOS', C.frost], ['LEAKED', C.err]];
export const ShockThumbD: React.FC = () => <ShockThumb src="ainews0929/thumb/shock4.jpg" lines={LEAK_WORDS} />;
export const ShockThumbE: React.FC = () => <ShockThumb src="ainews0929/thumb/shock2.jpg" lines={LEAK_WORDS} />;
export const ShockThumbF: React.FC = () => <ShockThumb src="ainews0929/thumb/shock1.jpg" lines={LEAK_WORDS} />;

// ---------- highlighted words (on photo F): more contrast, yellow + red against the cobalt ----------
const YEL = '#FFD60A';
const RED = '#FF2A3D';
const INK = C.cobalt950;
const outline = (w: number, c: string) =>
  [`${w}px 0 0 ${c}`, `-${w}px 0 0 ${c}`, `0 ${w}px 0 ${c}`, `0 -${w}px 0 ${c}`, `${w * 0.7}px ${w * 0.7}px 0 ${c}`, `-${w * 0.7}px ${w * 0.7}px 0 ${c}`, `${w * 0.7}px -${w * 0.7}px 0 ${c}`, `-${w * 0.7}px -${w * 0.7}px 0 ${c}`].join(', ');
const drop = '0 18px 40px rgba(2,10,40,.55)';
// A marker stroke: slightly rotated bar with ragged ends, like a highlighter pass.
const Bar: React.FC<{color: string; rot: number; children: React.ReactNode; pad?: string}> = ({color, rot, children, pad = '0.02em 0.22em 0.08em'}) => (
  <span style={{position: 'relative', display: 'inline-block', transform: `rotate(${rot}deg)`}}>
    <span
      style={{
        position: 'absolute',
        inset: '8% -3% 0 -3%',
        background: color,
        clipPath: 'polygon(1.5% 6%, 98% 0%, 100% 48%, 98.5% 96%, 2% 100%, 0% 55%)',
        boxShadow: '0 16px 40px rgba(2,10,40,.45)',
        filter: 'drop-shadow(0 12px 22px rgba(2,10,40,.45))',
      }}
    />
    <span style={{position: 'relative', padding: pad}}>{children}</span>
  </span>
);

const Words: React.FC<{style: 'marker' | 'highlighter' | 'glow'}> = ({style}) => {
  const base: React.CSSProperties = {fontFamily: F.sans, fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.92};
  if (style === 'marker')
    return (
      <div style={{...base, transform: 'rotate(-3deg)', transformOrigin: 'left center'}}>
        <div style={{fontSize: 270, color: YEL, textShadow: `${outline(7, INK)}, ${drop}`}}>53</div>
        <div style={{fontSize: 172, color: C.frost, textShadow: `${outline(6, INK)}, ${drop}`}}>PHOTOS</div>
        <div style={{fontSize: 186, color: C.frost, marginTop: 18, marginLeft: -8}}>
          <Bar color={RED} rot={-1.5}>LEAKED</Bar>
        </div>
      </div>
    );
  if (style === 'highlighter')
    return (
      <div style={{...base, transform: 'rotate(-2deg)', transformOrigin: 'left center'}}>
        <div style={{fontSize: 176, color: INK}}>
          <Bar color={YEL} rot={-1} pad="0.02em 0.32em 0.08em">53 PHOTOS</Bar>
        </div>
        <div style={{fontSize: 200, color: C.frost, marginTop: 26}}>
          <Bar color={RED} rot={1.5} pad="0.02em 0.32em 0.08em">LEAKED</Bar>
        </div>
      </div>
    );
  return (
    <div style={{...base, transform: 'rotate(-3deg)', transformOrigin: 'left center'}}>
      <div style={{fontSize: 250, color: YEL, textShadow: `${outline(8, INK)}, ${drop}`}}>53</div>
      <div style={{fontSize: 170, color: YEL, textShadow: `${outline(7, INK)}, ${drop}`}}>PHOTOS</div>
      <div style={{fontSize: 196, color: RED, textShadow: `${outline(7, '#FFFFFF')}, 0 0 50px rgba(255,42,61,.85), ${drop}`}}>LEAKED</div>
    </div>
  );
};

export const HighlightThumb: React.FC<{style: 'marker' | 'highlighter' | 'glow'; src?: string}> = ({style, src = 'ainews0929/thumb/shock1.jpg'}) => (
  <AbsoluteFill style={{background: C.cobalt950, overflow: 'hidden'}}>
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    {/* punchier grade: a little more contrast and saturation than the raw image */}
    <AbsoluteFill style={{backdropFilter: 'contrast(1.08) saturate(1.15)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(4,31,92,.85) 0%, rgba(4,31,92,.55) 36%, rgba(4,31,92,0) 58%)'}} />
    <div style={{position: 'absolute', left: 80, top: style === 'highlighter' ? 250 : 110}}>
      <Words style={style} />
    </div>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 60% 50%, rgba(0,0,0,0) 55%, rgba(2,10,36,.4) 100%)'}} />
  </AbsoluteFill>
);
export const HighlightThumbG: React.FC = () => <HighlightThumb style="marker" />;
export const HighlightThumbH: React.FC = () => <HighlightThumb style="highlighter" />;
export const HighlightThumbI: React.FC = () => <HighlightThumb style="glow" />;
