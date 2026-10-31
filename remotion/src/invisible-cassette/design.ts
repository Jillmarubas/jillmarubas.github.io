// Small Print editorial design system (the user's brief, 29 Oct 2026). Dark look approved in that brief.
export const FPS = 24;
export const W = 1920;
export const H = 1080;

export const C = {
  void: '#0E1117', // desk surfaces and empty space
  voidLift: '#161B24',
  manila: '#E5D9C5', // folders, documents
  manilaShade: '#C9B999',
  gold: '#E5A93C', // key text, telemetry lines, warm rim light
  goldDeep: '#D4AF37',
  crimson: '#C0392B', // stamps, redactions, threat only
  highlighter: '#F1C40F', // evidence highlighter (multiply, 85 %)
  mono: '#D1D5DB', // telemetry and timestamps
  phosphor: '#F59E0B',
  ink: '#1A1712', // type on paper
  cyan: '#5FD3E6', // grid energy (Act II only)
} as const;

export const F = {
  display: '"Playfair Display", Georgia, serif', // headlines and title cards: uppercase, +50 to +100 tracking
  mono: '"Courier Prime", "Courier New", monospace', // telemetry, timestamps, metadata
  type: '"Special Elite", "Courier Prime", monospace', // typewriter quotes and document extracts
  ui: '"IBM Plex Sans Condensed", "Arial Narrow", sans-serif', // small labels and credits
} as const;

// Lighting: one overhead tungsten key; soft drop shadows (blur 25, distance 15-20, 40 %).
export const SHADOW = '0 18px 25px rgba(0,0,0,0.40)';
// Global finish: film grain 10-14 % overlay, vignette 15-20 %, dust motes in the lit area.
export const GRAIN = 0.12;
export const VIGNETTE = 0.18;
