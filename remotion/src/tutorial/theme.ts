// Dark-mode MacBook tutorial look. Colours follow macOS dark appearance; the one accent is
// system blue, used for the thing being explained (button, highlight ring, click ripple).
import {Easing} from 'remotion';

export const FPS = 30;

export const MAC = {
  // Stage behind the laptop.
  studio: {top: '#15171b', floor: '#07080a', spot: 'rgba(120,150,200,.16)'},
  // Laptop body (space black aluminium).
  body: {edge: '#2b2d31', face: '#1a1b1e', bezel: '#050506', hinge: '#0e0f11', lip: '#3a3c41'},
  // macOS dark appearance.
  ui: {
    window: '#1e1e20',
    sidebar: '#252528',
    titlebar: '#2a2a2d',
    raised: '#2c2c2f',
    field: '#141416',
    line: 'rgba(255,255,255,.09)',
    lineStrong: 'rgba(255,255,255,.16)',
    text: '#f5f5f7',
    text2: 'rgba(235,235,245,.62)',
    text3: 'rgba(235,235,245,.34)',
    menubar: 'rgba(22,22,26,.62)',
  },
  accent: '#0A84FF',
  accentSoft: 'rgba(10,132,255,.22)',
  green: '#30D158',
  lights: ['#ff5f57', '#febc2e', '#28c840'],
  font: {
    ui: 'Inter, "Helvetica Neue", Arial, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
} as const;

// House easings: ease-in-out for glides, snap-and-settle for arrivals.
export const ease = {
  glide: Easing.bezier(0.45, 0, 0.2, 1),
  swift: Easing.bezier(0.22, 1, 0.36, 1),
  morph: Easing.bezier(0.65, 0, 0.35, 1),
};

// The screen is laid out in macOS points: everything on screen (windows, cursor, camera focus)
// uses this coordinate space, so a script step can say "cursor to 640, 410".
export const SCREEN = {w: 1512, h: 945};

// Where the laptop sits on the 1920×1080 stage.
export const LAPTOP = (() => {
  const screenW = 1312;
  const scale = screenW / SCREEN.w;
  const screenH = SCREEN.h * scale;
  const bezel = {side: 18, top: 22, bottom: 22};
  const lidW = screenW + bezel.side * 2;
  const lidH = screenH + bezel.top + bezel.bottom;
  const lidX = (1920 - lidW) / 2;
  const lidY = 52;
  return {scale, screenW, screenH, bezel, lidW, lidH, lidX, lidY, screenX: lidX + bezel.side, screenY: lidY + bezel.top};
})();

// Screen point → stage point (for the camera).
export const toStage = (x: number, y: number) => ({x: LAPTOP.screenX + x * LAPTOP.scale, y: LAPTOP.screenY + y * LAPTOP.scale});
