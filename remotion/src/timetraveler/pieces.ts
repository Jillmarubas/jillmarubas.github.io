// Every art piece of the Ice Age scene, with the size of its drawing box (its SVG viewBox).
// The code-drawn version (codeArt.tsx) and the VectorCraft version
// (public/timetraveler/vector/<id>.svg) are both drawn in this same box, so swapping one
// for the other never moves anything in the scene.

export const PIECES = {
  farMountains: {w: 2400, h: 420},
  midMountains: {w: 2600, h: 440},
  hills: {w: 2900, h: 320},
  pine: {w: 240, h: 400},
  cave: {w: 720, h: 440},
  logs: {w: 220, h: 90},
  rock: {w: 700, h: 400},
  branch: {w: 900, h: 380},
  // mammoth parts all share the mammoth's own box, so they line up by stacking them
  mammothBody: {w: 560, h: 420},
  mammothHead: {w: 560, h: 420},
  mammothTrunk: {w: 560, h: 420},
  mammothTusks: {w: 560, h: 420},
  mammothLegFrontNear: {w: 560, h: 420},
  mammothLegFrontFar: {w: 560, h: 420},
  mammothLegBackNear: {w: 560, h: 420},
  mammothLegBackFar: {w: 560, h: 420},
} as const;

export type PieceId = keyof typeof PIECES;
export type ArtMode = 'code' | 'vector';

// Mammoth rig, in the mammoth box (it faces right).
export const MAMMOTH = {
  hips: {
    mammothLegFrontNear: [372, 262],
    mammothLegFrontFar: [340, 256],
    mammothLegBackNear: [190, 262],
    mammothLegBackFar: [222, 256],
  },
  neck: [400, 170], // the head nods around this point
  trunkRoot: [474, 200], // the trunk swings from here
} as const;

// The scene's look. One ink colour and line weight for everything, matching the character.
export const ICE = {
  ink: '#2a1b12',
  line: 5, // px at layer scale 1, the same as the character's outline at size 300
  skyTop: '#22355a',
  skyMid: '#5b7aa6',
  skyLow: '#b6c8de',
  far: '#8ea6c4',
  farShade: '#7891b2',
  farSnow: '#e3ecf5',
  mid: '#6d89ae',
  midShade: '#5a7499',
  midSnow: '#eaf0f7',
  hill: '#e6eef7',
  hillShade: '#c3d3e6',
  snow: '#f3f7fb',
  snowShade: '#d2deeb',
  pine: '#2f5d50',
  pineDark: '#234538',
  bark: '#6b4428',
  rock: '#767c8c',
  rockDark: '#585d6b',
  cave: '#1c1922',
  log: '#7a4a2a',
  logEnd: '#c99a64',
  fur: '#7b4a2c',
  furDark: '#5a341e',
  furLight: '#9b6a44',
  tusk: '#f3e6c8',
} as const;
