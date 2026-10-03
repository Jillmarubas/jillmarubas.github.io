// Render many preview stills from one bundle: node scripts/stills.mjs <Comp> <outdir> <scale> <sec> [sec...]
// Also writes <outdir>/sheet.jpg (contact sheet, 3 columns) when Pillow is available.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import {execSync} from 'node:child_process';

const [comp, outdir, scale, ...secs] = process.argv.slice(2);
fs.mkdirSync(outdir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => {}});
const browser = await openBrowser('chrome', {browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', chromiumOptions: {gl: 'swangle'}});
const composition = await selectComposition({serveUrl, id: comp, puppeteerInstance: browser});
const files = [];
const queue = [...secs];
const worker = async () => {
  while (queue.length) {
    const s = queue.shift();
    const frame = Math.min(composition.durationInFrames - 1, Math.round(parseFloat(s) * composition.fps));
    const out = path.join(outdir, `f${String(frame).padStart(6, '0')}.jpg`);
    await renderStill({composition, serveUrl, output: out, frame, scale: parseFloat(scale), imageFormat: 'jpeg', jpegQuality: 82, puppeteerInstance: browser});
    files.push(out);
  }
};
await Promise.all([worker(), worker(), worker(), worker()]);
await browser.close({silent: true});
files.sort();
try {
  execSync(`python3 -c "
import sys
from PIL import Image, ImageDraw
fs=sys.argv[1:]
ims=[Image.open(f) for f in fs]
w,h=ims[0].size
cols=3; rows=(len(ims)+cols-1)//cols
sheet=Image.new('RGB',(w*cols,h*rows),(30,30,30))
d=ImageDraw.Draw(sheet)
for i,(f,im) in enumerate(zip(fs,ims)):
  x,y=(i%cols)*w,(i//cols)*h; sheet.paste(im,(x,y)); d.text((x+8,y+6),'%.2fs'%(int(f[-10:-4])/60),fill=(255,255,0))
sheet.save('${outdir}/sheet.jpg',quality=80)
" ${files.join(' ')}`);
} catch (e) {
  console.error(String(e).slice(0, 300));
}
console.log('done', files.length);
