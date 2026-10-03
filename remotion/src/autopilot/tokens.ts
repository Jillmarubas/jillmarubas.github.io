// Autopilot Blue, translated for Remotion. Source of truth: design-system/autopilot-blue/tokens.css.
// Rules that matter on video: ONE saturated (blue) object per scene, ground gradient runs
// top-to-floor (never diagonal), shadows are blue bloom (never grey), veil text is decoration only.
import {Easing} from 'remotion';

export const AUTOPILOT = {
  ground: {hi: '#EAEAEA', mid: '#DCE3ED', lo: '#CDDDEC', surface: '#F3F4F6', sunk: '#E3E6EB', line: '#D5D9E0'},
  ink: {1: '#10151C', 2: '#4B5563', 3: '#7B8695', rgb: '16,21,28'},
  blue: {core: '#0571F8', face: '#2082FD', lift: '#4D8FFC', veil: '#81A2F6', ink: '#0A50B8', rim: 'rgba(255,255,255,.55)'},
  // Alpha steps for the dissolving type stack, top line to bottom.
  veil: [0.62, 0.34, 0.2, 0.11, 0.05],
  bloom: {
    sm: '0 6px 18px -6px rgba(5,113,248,.35)',
    md: '0 18px 44px -14px rgba(5,113,248,.45)',
    lg: '0 34px 80px -22px rgba(5,113,248,.55)',
  },
  radius: {xs: 8, sm: 14, md: 22, lg: 34, xl: 52, pill: 999},
  font: {
    display: '"Instrument Sans", "Helvetica Neue", Arial, sans-serif',
    body: '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
} as const;

// The page wash: #EAEAEA across the top two-fifths, cooling to #CDDDEC at the floor,
// lit by one low blue bloom at 62% / 118%.
export const autopilotBackdrop = `radial-gradient(120% 90% at 62% 118%, rgba(129,162,246,.42) 0%, rgba(129,162,246,0) 62%), linear-gradient(180deg, ${AUTOPILOT.ground.hi} 0%, ${AUTOPILOT.ground.hi} 42%, ${AUTOPILOT.ground.mid} 74%, ${AUTOPILOT.ground.lo} 100%)`;

// Easings: morph for size/shape, swift for position, settle only for physical controls.
export const apEase = {
  swift: Easing.bezier(0.22, 1, 0.36, 1),
  morph: Easing.bezier(0.65, 0, 0.35, 1),
  settle: Easing.bezier(0.34, 1.2, 0.64, 1),
};

// Durations in frames at 30 fps (ms in comments).
export const apFrames = {tap: 4 /* 120 */, move: 7 /* 220 */, morph: 11 /* 380 */, stage: 19 /* 640 */};
