import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Grain} from './components/Field';
import {C, F} from './theme';

// YouTube thumbnails, 1280×720, in the video's Settle Motion look: night, grey photos in
// rounded panels, one heavy line of Instrument Sans, mint on exactly one live mark.
// Three variants for YouTube Studio's Test & Compare; each tests one idea (story, faces, stakes).
// Rules: ≤ 3 words, one focal point, readable at 200 px wide, real photos only, and nothing
// in the bottom-right corner, where YouTube prints the running time.

const photo = (key: string) => staticFile(`photos/${key}.jpg`);
const grey = 'grayscale(1) contrast(1.12) brightness(.95)';

const Brand: React.FC = () => (
  <div style={{position: 'absolute', left: 48, top: 40, display: 'flex', alignItems: 'center', gap: 12}}>
    <span style={{width: 12, height: 12, borderRadius: 6, background: C.mint}} />
    <span style={{fontFamily: F.sans, fontWeight: 600, fontSize: 24, letterSpacing: '0.06em', color: C.onNight}}>AI NEWS DAILY</span>
  </div>
);

const Haze: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      width: '80%',
      height: '130%',
      left: '-22%',
      top: '-50%',
      borderRadius: '50%',
      background: 'radial-gradient(closest-side, rgba(171,254,193,.16), rgba(18,27,21,.5) 55%, rgba(0,0,0,0))',
    }}
  />
);

const Marker: React.FC<{w: number}> = ({w}) => <div style={{height: 8, width: w, background: C.mint, borderRadius: 4, marginTop: 14}} />;

// 1 · the story hook: the escape
export const ThumbEscape: React.FC = () => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <Haze />
    <div style={{position: 'absolute', left: 600, top: 24, right: 24, bottom: 24, borderRadius: 26, overflow: 'hidden', border: `1px solid ${C.edge}`}}>
      <Img src={photo('datacenter')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 50%', filter: grey}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,0) 45%)'}} />
      {/* the one live mark: a dashed sandbox wall with the door open */}
      <div style={{position: 'absolute', left: 90, top: 150, width: 360, height: 360, borderRadius: 26, border: '5px dashed rgba(242,243,242,.9)'}} />
      <div style={{position: 'absolute', left: 438, top: 300, width: 28, height: 90, background: C.mint, borderRadius: 6}} />
    </div>
    <Brand />
    <div style={{position: 'absolute', left: 48, top: 170, width: 600}}>
      <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: 158, lineHeight: 0.9, letterSpacing: '-0.055em', color: C.onNight}}>
        It got
        <br />
        out.
      </div>
      <Marker w={250} />
      <div style={{fontFamily: F.mono, fontSize: 24, color: C.onNight2, marginTop: 26}}>OpenAI pauses training</div>
    </div>
    <Grain opacity={0.05} />
  </AbsoluteFill>
);

// 2 · the faces: two rivals, one warning
export const ThumbRivals: React.FC = () => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <Haze />
    {[
      {k: 'altman', x: 24, pos: '45% 28%'},
      {k: 'amodei', x: 652, pos: '58% 26%'},
    ].map((p) => (
      <div key={p.k} style={{position: 'absolute', left: p.x, top: 24, width: 604, height: 440, borderRadius: 26, overflow: 'hidden', border: `1px solid ${C.edge}`}}>
        <Img src={photo(p.k)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.pos, filter: grey}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,.6))'}} />
      </div>
    ))}
    <div style={{position: 'absolute', left: 48, top: 44, display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderRadius: 999, background: 'rgba(0,0,0,.6)', border: `1px solid ${C.pillEdge}`}}>
      <span style={{width: 12, height: 12, borderRadius: 6, background: C.mint}} />
      <span style={{fontFamily: F.mono, fontSize: 20, color: C.onNight}}>UN Security Council</span>
    </div>
    <div style={{position: 'absolute', left: 48, top: 470}}>
      <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: 150, lineHeight: 1, letterSpacing: '-0.055em', color: C.onNight}}>Same warning.</div>
    </div>
    <Grain opacity={0.05} />
  </AbsoluteFill>
);

// 3 · the stakes: a hotline between two superpowers
export const ThumbHotline: React.FC = () => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <Haze />
    <div style={{position: 'absolute', left: 24, top: 24, width: 640, bottom: 24, borderRadius: 26, overflow: 'hidden', border: `1px solid ${C.edge}`}}>
      <Img src={photo('trumpxi2')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '46% 60%', transform: 'scale(1.35)', transformOrigin: '46% 72%', filter: grey}} />
    </div>
    <div style={{position: 'absolute', left: 700, top: 40, display: 'flex', alignItems: 'center', gap: 12}}>
      <span style={{width: 12, height: 12, borderRadius: 6, background: C.mint}} />
      <span style={{fontFamily: F.sans, fontWeight: 600, fontSize: 24, letterSpacing: '0.06em', color: C.onNight}}>AI NEWS DAILY</span>
    </div>
    <div style={{position: 'absolute', left: 700, top: 190, width: 540}}>
      <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: 150, lineHeight: 0.9, letterSpacing: '-0.055em', color: C.onNight}}>
        AI
        <br />
        hotline
      </div>
      <Marker w={230} />
      <div style={{fontFamily: F.mono, fontSize: 24, color: C.onNight2, marginTop: 26}}>US × China</div>
    </div>
    <Grain opacity={0.05} />
  </AbsoluteFill>
);
