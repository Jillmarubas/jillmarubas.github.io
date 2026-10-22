// Shared shot spec for the Remotion vs HyperFrames 2.5D demo.
// The HyperFrames version uses the same numbers, so both tools render the same shot.

export const FPS = 30;
export const DURATION = 8 * FPS;
export const W = 1920;
export const H = 1080;

// Lens: at this distance a 1:1 plane fills the frame (CSS `perspective: 1200px`).
export const D = 1200;

// Cut-out layers, back to front. `d` = distance from the camera at frame 0.
// Each plane is 2400x1350 apparent px at frame 0 (1.25x the frame).
// `lift` raises a plate (world px) so near layers stay in frame during the push-in.
export const LAYERS = [
  {name: 'sky', d: 7000, lift: 0},
  {name: 'mountains', d: 4200, lift: 0},
  {name: 'haze', d: 3300, lift: 0},
  {name: 'city', d: 2600, lift: 0},
  {name: 'hill', d: 1800, lift: 130},
  {name: 'foreground', d: 950, lift: 100},
] as const;
export const PLATE_W = 2400;
export const PLATE_H = 1350;

// Camera move, 0 s to 7.6 s, cubic ease in-out (GSAP "power2.inOut").
export const CAM = {
  start: 0,
  end: 7.6,
  x: [-90, 110], // track right
  y: [20, -20], // slight rise (CSS y points down)
  z: [0, 520], // push in
};

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

// Progress of a tween that runs from `start` for `dur` seconds.
export const prog = (sec: number, start: number, dur: number) =>
  Math.min(1, Math.max(0, (sec - start) / dur));
