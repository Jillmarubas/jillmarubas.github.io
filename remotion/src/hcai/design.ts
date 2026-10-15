// Tokens for "The Hidden Cost of AI": a warm paper-collage documentary (see DESIGN.md).
export const C = {
  paper: '#F2EEE6',
  card: '#FBF9F4',
  ink: '#1D1B18',
  ink2: '#5A554C',
  mute: '#A39C90',
  hum: '#E5401F', // the only accent: one word, one mark, one number at a time
  night: '#121214',
  nightInk: '#ECE8E1',
};
export const F = {display: 'Fraunces', sans: 'IBM Plex Sans', mono: 'IBM Plex Mono', hand: 'Caveat'};
export const W = 1920;
export const H = 1080;
export const FPS = 24;
/** Colour grade per chapter (brightness, saturation), following the tension curve of the script. */
export const GRADE: [number, number][] = [
  [0.97, 0.95], // cold open
  [1.03, 1.05], // 1 the cloud: bright, curious
  [0.97, 0.92], // 2 power: heavier
  [0.99, 0.9], // 3 water: cool
  [0.93, 0.72], // 4 hands: darkest, most restrained
  [0.97, 0.88], // 5 rocks
  [0.99, 0.95], // 6 who pays
  [1.04, 1.06], // 7 other side: lighter
  [0.98, 0.95], // ending
];
