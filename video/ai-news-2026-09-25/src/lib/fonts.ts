import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// The portfolio's three families, bundled locally so the render never waits on the network.
const faces: [string, string, number][] = [
  ['Archivo', 'archivo-latin-500-normal.woff2', 500],
  ['Archivo', 'archivo-latin-700-normal.woff2', 700],
  ['Archivo', 'archivo-latin-800-normal.woff2', 800],
  ['Archivo', 'archivo-latin-900-normal.woff2', 900],
  ['IBM Plex Sans', 'ibm-plex-sans-latin-400-normal.woff2', 400],
  ['IBM Plex Sans', 'ibm-plex-sans-latin-500-normal.woff2', 500],
  ['IBM Plex Sans', 'ibm-plex-sans-latin-600-normal.woff2', 600],
  ['IBM Plex Mono', 'ibm-plex-mono-latin-400-normal.woff2', 400],
  ['IBM Plex Mono', 'ibm-plex-mono-latin-500-normal.woff2', 500],
  ['IBM Plex Mono', 'ibm-plex-mono-latin-600-normal.woff2', 600],
];

export const fontsReady = Promise.all(
  faces.map(([family, file, weight]) =>
    loadFont({family, url: staticFile(`fonts/${file}`), weight: String(weight), style: 'normal'}),
  ),
);
