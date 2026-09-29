// Prints the episode's audio timeline (VO clip starts, SFX cues) as JSON for the mixer.
// Build and run: npx esbuild scripts/dump_news_timeline.ts --bundle --platform=node --outfile=out/dump.cjs --log-level=error && node out/dump.cjs
import {BLOCKS, TOTAL_FRAMES} from '../src/ainews0929/timeline';
import {SFX} from '../src/ainews0929/beats';
import {FPS} from '../src/ainews0929/theme';

console.log(JSON.stringify({fps: FPS, totalFrames: TOTAL_FRAMES, blocks: BLOCKS, sfx: SFX.map((s) => ({at: s.at, file: s.file, vol: s.vol}))}));
