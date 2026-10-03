// Tokens for "AI News, 3 Oct 2026": the Autopilot Blue design system (design-system/autopilot-blue),
// translated for a 1920x1080, 24 fps film. See DESIGN.md.
import {AUTOPILOT as AP} from '../autopilot/tokens';

export const C = {
  hi: AP.ground.hi, // #EAEAEA, the resting field (top two-fifths)
  mid: AP.ground.mid, // #DCE3ED
  lo: AP.ground.lo, // #CDDDEC, the floor; the light source lives here
  surface: AP.ground.surface, // #F3F4F6, panels on the wash
  sunk: AP.ground.sunk, // #E3E6EB
  line: AP.ground.line, // #D5D9E0
  ink: AP.ink[1], // #10151C
  ink2: AP.ink[2], // #4B5563
  ink3: AP.ink[3], // #7B8695
  inkRgb: AP.ink.rgb,
  core: AP.blue.core, // #0571F8, the ONE saturated object per view
  face: AP.blue.face, // #2082FD, lit plane / gradient origin
  lift: AP.blue.lift, // #4D8FFC, edge catching light on overlap
  veil: AP.blue.veil, // #81A2F6, bloom on the floor; never a fill
  blueInk: AP.blue.ink, // #0A50B8, blue text at body size
  rim: AP.blue.rim, // white 55 %, the only hard line (overlapping blue planes)
};
export const BLOOM = AP.bloom;
export const R = AP.radius;
export const F = {display: 'Instrument Sans', body: 'Hanken Grotesk', mono: 'IBM Plex Mono'};
export const W = 1920;
export const H = 1080;
export const FPS = 24;
/** The cobalt object's fill: lit plane to body, top-left light. */
export const BLUE_FILL = `linear-gradient(160deg, ${C.face}, ${C.core} 62%)`;
/** Neutral solid object fill (greys carry the same blue bias as the ground). */
export const GREY_FILL = 'linear-gradient(160deg, #FDFDFE, #E6EAF0 70%)';
