import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';

// Rigged Jurassic creatures. Each part is a VectorCraft SVG in public/timetraveler/dinos/,
// drawn in its creature's shared box (scripts/vectorcraft/dinos.py), and turns around a joint:
// legs at the hips, tails at the base, heads at the neck, jaws at the hinge, wings at the shoulder.
// Movement rules from the research (research/jurassic.md): tails stay off the ground,
// theropods walk level with a slight tail sway, sauropods walk slowly on pillar legs.

export type DinoId = 'allosaurus' | 'stegosaurus' | 'diplodocus' | 'archaeopteryx' | 'rhamphorhynchus' | 'juramaia';
export type DinoAction = 'idle' | 'walk' | 'roar' | 'fly';

type Part = {
  id: string;
  pivot: [number, number];
  // rotation in degrees from the walk phase (radians) and the roar/open amount (0..1)
  rot?: (phase: number, open: number, t: number) => number;
  // nested parts move with this one (a jaw with its head)
  children?: Part[];
  bob?: boolean; // rides up and down with the body
};

type Rig = {w: number; h: number; stride: number; parts: Part[]; bobPx: number; label: string; evidence: string};

const sin = Math.sin;

export const RIGS: Record<DinoId, Rig> = {
  allosaurus: {
    w: 900, h: 520, stride: 0.9, bobPx: 6,
    label: 'Allosaurus', evidence: 'skin: pebbly scales (fossil) · colours: a guess',
    parts: [
      {id: 'alloTail', pivot: [345, 257], bob: true, rot: (p, _o, t) => sin(p) * 3 + sin(t / 40) * 1.5},
      {id: 'alloLegFar', pivot: [374, 250], rot: (p) => sin(p + Math.PI) * 18},
      {id: 'alloArmFar', pivot: [578, 258], bob: true, rot: (p) => sin(p) * 5},
      {id: 'alloBody', pivot: [450, 260], bob: true},
      {id: 'alloLegNear', pivot: [400, 256], rot: (p) => sin(p) * 18},
      {
        id: 'alloHeadGroup', pivot: [640, 165], bob: true, rot: (p, o, t) => sin(p * 2) * 2 + sin(t / 50) * 1.5 - o * 8,
        children: [
          {id: 'alloJaw', pivot: [684, 192], rot: (_p, o) => o * 24},
          {id: 'alloHead', pivot: [700, 150]},
        ],
      },
      {id: 'alloArmNear', pivot: [590, 262], bob: true, rot: (p) => sin(p + Math.PI) * 5},
    ],
  },
  stegosaurus: {
    w: 900, h: 520, stride: 0.6, bobPx: 3,
    label: 'Stegosaurus', evidence: 'skin: rosette scales · plates: grooved keratin (fossil) · colours: a guess',
    parts: [
      {id: 'stegTail', pivot: [262, 275], bob: true, rot: (p, o, t) => sin(p) * 4 + sin(t / 35) * 2 - o * 18},
      {id: 'stegLegBackFar', pivot: [430, 310], rot: (p) => sin(p + Math.PI) * 12},
      {id: 'stegLegFrontFar', pivot: [590, 310], rot: (p) => sin(p) * 12},
      {id: 'stegBody', pivot: [450, 260], bob: true},
      {id: 'stegHead', pivot: [612, 290], bob: true, rot: (p, _o, t) => sin(p * 2) * 2 + sin(t / 45) * 3},
      {id: 'stegLegBackNear', pivot: [390, 316], rot: (p) => sin(p) * 12},
      {id: 'stegLegFrontNear', pivot: [560, 316], rot: (p) => sin(p + Math.PI) * 12},
    ],
  },
  diplodocus: {
    w: 1600, h: 700, stride: 0.45, bobPx: 3,
    label: 'Diplodocus', evidence: 'skin: polygon scales + speckled pattern (fossil) · exact hues: a guess',
    parts: [
      {id: 'diploTail', pivot: [612, 370], bob: true, rot: (p, _o, t) => sin(p) * 2 + sin(t / 60) * 2.5},
      {id: 'diploNeck', pivot: [950, 340], bob: true, rot: (p, _o, t) => sin(p * 2) * 1 + sin(t / 70) * 3},
      {id: 'diploLegBackFar', pivot: [690, 430], rot: (p) => sin(p + Math.PI) * 9},
      {id: 'diploLegFrontFar', pivot: [930, 430], rot: (p) => sin(p) * 9},
      {id: 'diploBody', pivot: [780, 370], bob: true},
      {id: 'diploLegBackNear', pivot: [640, 440], rot: (p) => sin(p) * 9},
      {id: 'diploLegFrontNear', pivot: [890, 440], rot: (p) => sin(p + Math.PI) * 9},
    ],
  },
  archaeopteryx: {
    w: 420, h: 300, stride: 3.2, bobPx: 4,
    label: 'Archaeopteryx', evidence: 'feathers + clawed wings (fossil) · black wings (fossil)',
    parts: [
      {id: 'archWingFar', pivot: [236, 130], bob: true, rot: (p) => sin(p + 0.3) * 22},
      {id: 'archTail', pivot: [168, 168], bob: true, rot: (p) => sin(p * 0.5) * 4},
      {id: 'archBody', pivot: [230, 150], bob: true},
      {id: 'archWingNear', pivot: [236, 130], bob: true, rot: (p) => sin(p) * 26},
    ],
  },
  rhamphorhynchus: {
    w: 560, h: 320, stride: 2.6, bobPx: 8,
    label: 'Rhamphorhynchus', evidence: 'membrane wings + fuzz (fossil) · colours: a guess',
    parts: [
      {id: 'rhamWingFar', pivot: [300, 150], bob: true, rot: (p) => sin(p + 0.3) * 28},
      {id: 'rhamTail', pivot: [250, 170], bob: true, rot: (p) => sin(p * 0.5) * 5},
      {id: 'rhamBody', pivot: [320, 160], bob: true},
      {id: 'rhamWingNear', pivot: [300, 150], bob: true, rot: (p) => sin(p) * 32},
    ],
  },
  juramaia: {
    w: 320, h: 180, stride: 2.4, bobPx: 3,
    label: 'Juramaia', evidence: 'our ancestor: 7–10 cm, hair, climber (fossil)',
    parts: [
      {id: 'juraTail', pivot: [86, 112], bob: true, rot: (p, _o, t) => sin(p) * 8 + sin(t / 20) * 4},
      {id: 'juraBody', pivot: [180, 110], bob: true},
    ],
  },
};

export type DinoProps = {
  who: DinoId;
  action?: DinoAction;
  /** Width on screen in px. */
  width?: number;
  flip?: boolean;
  /** Roar or tail-swing amount 0..1 (overrides the automatic roar cycle). */
  open?: number;
  style?: React.CSSProperties;
};

const PartView: React.FC<{part: Part; rig: Rig; phase: number; open: number; t: number; bob: number}> = ({part, rig, phase, open, t, bob}) => {
  const deg = part.rot ? part.rot(phase, open, t) : 0;
  const [px, py] = part.pivot;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transformOrigin: `${px}px ${py}px`,
        transform: `translateY(${part.bob ? bob : 0}px) rotate(${deg}deg)`,
      }}
    >
      {part.children ? (
        part.children.map((c) => <PartView key={c.id} part={c} rig={rig} phase={phase} open={open} t={t} bob={0} />)
      ) : (
        <Img src={staticFile(`timetraveler/dinos/${part.id}.svg`)} style={{position: 'absolute', left: 0, top: 0, width: rig.w, height: rig.h}} />
      )}
    </div>
  );
};

export const Dino: React.FC<DinoProps> = ({who, action = 'walk', width, flip = false, open, style}) => {
  const t = useCurrentFrame();
  const rig = RIGS[who];
  const moving = action === 'walk' || action === 'fly';
  const phase = moving ? (t / 30) * Math.PI * 2 * rig.stride : 0;
  const breathe = Math.sin((t / 70) * Math.PI * 2);
  const bob = moving ? -Math.abs(Math.sin(phase)) * rig.bobPx : breathe * rig.bobPx * 0.4;
  // roar: open, hold, close over ~1.5 s, repeating
  const autoOpen = action === 'roar' ? Math.max(0, Math.sin(((t % 75) / 75) * Math.PI)) ** 0.6 : 0;
  const o = open ?? autoOpen;
  const scale = (width ?? rig.w) / rig.w;
  return (
    <div style={{position: 'relative', width: rig.w * scale, height: rig.h * scale, ...style}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: rig.w, height: rig.h, transformOrigin: '0 0', transform: `scale(${flip ? -scale : scale}, ${scale})${flip ? ` translateX(${-rig.w}px)` : ''}`}}>
        {rig.parts.map((p) => (
          <PartView key={p.id} part={p} rig={rig} phase={phase} open={o} t={t} bob={bob} />
        ))}
      </div>
    </div>
  );
};
