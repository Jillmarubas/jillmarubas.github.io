import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {Dino} from './Dino';
import {Explorer} from './Explorer';
import {TimeTraveler} from './TimeTraveler';

// Jurassic river forest, composed from detailed VectorCraft assets
// (scripts/vectorcraft/tree_detailed.py and landscape.py). Depth comes from atmospheric
// perspective: each depth band is faded into the mist as one group (so trees in a band never show
// through each other), with mist between the bands, light shafts and dust from the upper right,
// a sauropod herd as soft silhouettes in the haze, and a dark, dense foreground frame.
// Look guide: the user's landscape references, used as principles only.

export const JURASSIC_DURATION = 240;
const W = 1920;
const H = 1080;

type Box = {w: number; h: number; bx: number; by: number};
const BOX: Record<string, Box> = {
  araucaria11: {w: 1200, h: 1600, bx: 600, by: 1560},
  araucaria23: {w: 1200, h: 1600, bx: 600, by: 1560},
  araucaria37: {w: 1200, h: 1600, bx: 600, by: 1560},
  pTreeFernA: {w: 700, h: 900, bx: 350, by: 890},
  pTreeFernB: {w: 700, h: 900, bx: 350, by: 890},
  pCycad: {w: 600, h: 560, bx: 300, by: 550},
  pFernA: {w: 560, h: 320, bx: 280, by: 315},
  pFernB: {w: 560, h: 320, bx: 280, by: 315},
  pHorsetail: {w: 400, h: 440, bx: 200, by: 435},
  pRockA: {w: 520, h: 280, bx: 260, by: 275},
  pRockB: {w: 360, h: 200, bx: 180, by: 195},
  pLog: {w: 1240, h: 300, bx: 620, by: 210},
};

/** Place an asset by its base point (x, y) at scale s. */
const Prop: React.FC<{id: string; x: number; y: number; s: number; flip?: boolean}> = ({id, x, y, s, flip}) => {
  const b = BOX[id];
  return (
    <Img
      src={staticFile(`timetraveler/jurassic/${id}.svg`)}
      style={{position: 'absolute', left: x - b.bx * s, top: y - b.by * s, width: b.w * s, height: b.h * s, transform: flip ? 'scaleX(-1)' : undefined}}
    />
  );
};

const ARAUCARIAS = ['araucaria11', 'araucaria23', 'araucaria37'];

// seeded placements for each depth band
const band = (seed: string, n: number, x0: number, x1: number, y: number, yJit: number, s0: number, s1: number) =>
  Array.from({length: n}).map((_, i) => ({
    x: x0 + ((x1 - x0) * (i + random(`${seed}x${i}`) * 0.8)) / n,
    y: y + random(`${seed}y${i}`) * yJit,
    s: s0 + random(`${seed}s${i}`) * (s1 - s0),
    flip: random(`${seed}f${i}`) > 0.5,
    pick: random(`${seed}p${i}`),
  }));

const FAR = band('far', 16, -150, 2070, 650, 18, 0.15, 0.24);
const MID = band('mid', 11, -200, 2120, 760, 70, 0.26, 0.56);
const MID_FERNS = band('mf', 7, -100, 2050, 790, 14, 0.24, 0.34);
const MID_LOW = band('ml', 22, -60, 1980, 800, 20, 0.22, 0.34);
// a carpet of ferns and horsetails over the whole ground, bigger toward the camera
const CARPET = Array.from({length: 190}).map((_, i) => {
  const y = 770 + Math.pow(random(`cy${i}`), 1.3) * 280;
  return {x: -80 + random(`cx${i}`) * 2080, y, s: 0.22 + ((y - 770) / 300) * 0.62, flip: random(`cf${i}`) > 0.5, pick: random(`cp${i}`)};
}).sort((a, b) => a.y - b.y);

const Mist: React.FC<{top: number; height: number; opacity: number}> = ({top, height, opacity}) => (
  <div style={{position: 'absolute', left: -200, top, width: W + 400, height, background: 'linear-gradient(rgba(220,230,232,0), rgba(220,230,232,1) 55%, rgba(220,230,232,0))', opacity}} />
);

const Group: React.FC<{cam: number; depth: number; haze: string; opacity: number; children: React.ReactNode}> = ({cam, depth, haze, opacity, children}) => (
  <AbsoluteFill style={{transform: `translateX(${-cam / depth}px)`, filter: haze, opacity}}>{children}</AbsoluteFill>
);

export const JurassicLandscape: React.FC<{squad?: boolean}> = ({squad = true}) => {
  const f = useCurrentFrame();
  const cam = Math.sin(f / 120) * 50;
  return (
    <AbsoluteFill style={{background: '#dfe7e4', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 72% 6%, #fff4d6 0%, #eef0e0 20%, #cddbd9 52%, #aebfc2 100%)'}} />
      <Group cam={cam} depth={10} haze="none" opacity={1}>
        <Img src={staticFile('timetraveler/jurassic/jFar.svg')} style={{position: 'absolute', left: -240, top: 0, width: 2400, height: H}} />
      </Group>
      <Mist top={430} height={300} opacity={0.8} />
      {/* pterosaurs far off */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: 900 + i * 80 + Math.sin(f / 30 + i) * 20, top: 170 + i * 28, opacity: 0.5, filter: 'brightness(0.5) saturate(0.3)'}}>
          <Dino who="rhamphorhynchus" action="fly" width={74 - i * 12} />
        </div>
      ))}
      {/* far forest: small, pale, low contrast */}
      <Group cam={cam} depth={5} haze="saturate(0.5) brightness(1.12) contrast(0.72)" opacity={0.6}>
        {FAR.map((p, i) => (p.pick > 0.3 ? <Prop key={i} id={ARAUCARIAS[i % 3]} x={p.x} y={p.y} s={p.s} flip={p.flip} /> : <Prop key={i} id={i % 2 ? 'pTreeFernA' : 'pTreeFernB'} x={p.x} y={p.y} s={p.s * 0.9} flip={p.flip} />))}
      </Group>
      <Mist top={560} height={240} opacity={0.75} />
      {/* the herd, soft silhouettes in the haze */}
      <Group cam={cam} depth={3.5} haze="brightness(0.42) saturate(0.35) contrast(0.85) blur(1.5px)" opacity={0.5}>
        <div style={{position: 'absolute', left: 760, top: 420}}><Dino who="diplodocus" action="walk" width={720} /></div>
        <div style={{position: 'absolute', left: 1210, top: 500}}><Dino who="diplodocus" action="walk" width={520} flip /></div>
      </Group>
      <Mist top={620} height={220} opacity={0.6} />
      {/* mid forest */}
      <Group cam={cam} depth={2.2} haze="saturate(0.78) brightness(1.04) contrast(0.9)" opacity={0.9}>
        {MID.filter((_, i) => i !== 5).sort((a, b) => a.y - b.y).map((p, i) => <Prop key={i} id={ARAUCARIAS[(i + 1) % 3]} x={p.x} y={p.y} s={p.s} flip={p.flip} />)}
        {MID_FERNS.map((p, i) => <Prop key={i} id={i % 2 ? 'pTreeFernA' : 'pTreeFernB'} x={p.x} y={p.y} s={p.s} flip={p.flip} />)}
        {MID_LOW.map((p, i) => <Prop key={i} id={p.pick > 0.75 ? 'pHorsetail' : p.pick > 0.35 ? 'pFernA' : 'pFernB'} x={p.x} y={p.y + 10} s={p.s * 0.8} flip={p.flip} />)}
      </Group>
      <Mist top={720} height={150} opacity={0.35} />
      {/* ground, stream and the mossy log bridge */}
      <Group cam={cam} depth={1.2} haze="none" opacity={1}>
        <Img src={staticFile('timetraveler/jurassic/jRiver.svg')} style={{position: 'absolute', left: -240, top: 0, width: 2400, height: H}} />
        {CARPET.filter((p) => !(p.x > 880 && p.x < 1420 && p.y > 800)).map((p, i) => (
          <Prop key={i} id={p.pick > 0.96 ? 'pHorsetail' : p.pick > 0.5 ? 'pFernA' : 'pFernB'} x={p.x} y={p.y} s={p.pick > 0.96 ? p.s * 0.7 : p.s} flip={p.flip} />
        ))}
        <Prop id="pLog" x={1040} y={880} s={0.62} />
        <Prop id="pRockA" x={760} y={930} s={0.4} />
        <Prop id="pRockB" x={1460} y={900} s={0.45} />
        <Prop id="pFernA" x={640} y={900} s={0.5} />
        <Prop id="pFernB" x={1560} y={890} s={0.46} flip />
        <Prop id="pHorsetail" x={1700} y={880} s={0.5} />
        <Prop id="pCycad" x={1820} y={900} s={0.5} />
      </Group>
      <Mist top={680} height={180} opacity={0.8} />
      {/* the squad on the near bank, looking at the herd */}
      {squad && <div style={{position: 'absolute', left: 330 - cam / 1.1, top: 735, display: 'flex', gap: 16, alignItems: 'flex-end'}}>
        <TimeTraveler costume="jurassic" size={170} pose="point" expression="surprised" flip />
        <Explorer who="tank" size={170} expression="surprised" flip />
        <Explorer who="pip" size={170} expression="scared" pose="panic" flip />
        <Explorer who="ria" size={170} expression="determined" flip />
      </div>}
      {/* near plants and a big monkey-puzzle trunk framing the left */}
      <Group cam={cam} depth={1} haze="none" opacity={1}>
        <Prop id="araucaria11" x={110} y={1190} s={1.05} />
        <Prop id="pTreeFernA" x={1880} y={1110} s={0.95} flip />
        <Prop id="pRockA" x={260} y={1085} s={0.8} />
        <Prop id="pCycad" x={1330} y={1110} s={0.72} />
        <Prop id="pRockB" x={1540} y={1080} s={0.7} flip />
        {[60, 380, 640, 880, 1520, 1680, 1990].map((x, i) => (
          <Prop key={i} id={i % 2 ? 'pFernA' : 'pFernB'} x={x} y={1100} s={x > 300 && x < 800 ? 0.55 : 0.9 + (i % 3) * 0.12} flip={i % 2 === 0} />
        ))}
      </Group>
      {/* light shafts and dust from the upper right */}
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.7}}>
        {[[1120, 240, 0.42], [1330, 170, 0.34], [1520, 300, 0.3], [930, 130, 0.22], [1700, 140, 0.2]].map(([x, w, o], i) => (
          <div key={i} style={{position: 'absolute', left: x, top: -220, width: w, height: 1500, transformOrigin: 'top center', transform: `rotate(${22 + i * 2.5}deg)`, background: 'linear-gradient(rgba(255,240,205,0.95), rgba(255,240,205,0.15) 70%, rgba(255,240,205,0))', opacity: o + Math.sin(f / 50 + i) * 0.05, filter: 'blur(20px)'}} />
        ))}
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
        {Array.from({length: 80}).map((_, i) => {
          const x = 800 + random(`dx${i}`) * 900 + Math.sin(f / 40 + i) * 12;
          const y = ((random(`dy${i}`) * 900 + f * (0.2 + random(`ds${i}`) * 0.3)) % 900) + 60;
          return <circle key={i} cx={x} cy={y} r={1 + random(`dr${i}`) * 2.2} fill="#fff4d6" opacity={0.55} />;
        })}
      </svg>
      {/* dark foreground frame */}
      <AbsoluteFill style={{transform: `translateX(${-cam / 0.6}px)`, filter: 'blur(2.5px)'}}>
        <Img src={staticFile('timetraveler/jurassic/jFront.svg')} style={{position: 'absolute', left: -240, top: 0, width: 2400, height: H}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 56% 46%, rgba(0,0,0,0) 50%, rgba(6,16,12,0.55) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundSize: '1024px 1024px', mixBlendMode: 'overlay', opacity: 0.08}} />
    </AbsoluteFill>
  );
};
