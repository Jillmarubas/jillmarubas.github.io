// The Keeper: the fifteen shots. Times are in seconds from the start of each shot.
import React from 'react';
import {Cut, cut, ellipsePts, rectPts, Strip, W, H} from '../paperkite/kit';
import {Bird, Kid, KidPose, Look, blinkAt, handPos, walk} from '../paperkite/cast';
import {Sun} from '../paperkite/set';
import {AMBER, D, Dim, FlashOverlay, Glow, N, Pal, Plane, Rain, Shot, flash, lerpT, mix, palMix, rs, settle, useT, useTw} from './stage';
import {BigLamp, Bell, Boat, Cliff, Clouds, Lantern, Lighthouse, Rocks, SeaBand, Shards, VHouse, VLantern} from './props';

export const GIRL: Look = {coat: '#5D6B77', coatBack: '#4D5964', pants: '#3B3733', hair: '#3A2C24', style: 'bob', stripe: null};
export const GRANDPA: Look = {coat: '#A08A5A', coatBack: '#8A7650', pants: '#3E3A35', hair: '#D4CEC3', hat: '#A08A5A', beard: '#EEE8DD', stripe: null};
const VILLAGERS: Look[] = [
  {coat: '#7D8580', coatBack: '#6B726E', pants: '#3E3A35', hair: '#5A4A3E', hat: '#6B726E', stripe: null},
  {coat: '#8C7D72', coatBack: '#786B61', pants: '#3E3A35', hair: '#2E2824', style: 'bob', stripe: null},
  {coat: '#6E7A86', coatBack: '#5E6974', pants: '#3E3A35', hair: '#BDB5A8', hat: '#5E6974', stripe: null},
];

const SkyPlane: React.FC<{pal: Pal; fl?: number}> = ({pal, fl = 0}) => (
  <Plane d={5000}>
    <rect x={-3000} y={-3000} width={7000} height={8000} fill={mix(pal.sky, '#7E8A98', fl * 0.6)} />
  </Plane>
);

// The open sea, the boat and (optionally) the rocks, on six planes.
const SeaSet: React.FC<{
  t: number;
  pal: Pal;
  boat: {x: number; y: number; s: number; d?: number; rot?: number; flip?: boolean; lamp?: number; sx?: number};
  rocks?: {x: number; y: number; s: number; d?: number};
  lit?: number;
  calm?: number;
}> = ({t, pal, boat, rocks, lit = 0, calm = 0}) => {
  const k = 1 - calm * 0.7;
  const bob = Math.sin(t * 2.2) * 14 * k;
  const brot = (boat.rot ?? 0) + Math.sin(t * 1.7) * 7 * k;
  const bd = boat.d ?? 1500;
  return (
    <>
      <SkyPlane pal={pal} fl={lit} />
      <Clouds d={4200} pal={pal} t={t} y={260} />
      <SeaBand d={2600} base={1040} amp={22 * k} len={90} ph={t * 60} fill={pal.sea1} seed="s1" lift={1} />
      <SeaBand d={1900} base={1120} amp={30 * k} len={110} ph={-t * 90} fill={pal.sea2} seed="s2" />
      <Plane d={bd}>
        <Boat x={boat.x} y={boat.y + bob} s={boat.s} rot={brot} t={t} pal={pal} flip={boat.flip} lamp={boat.lamp ?? 1} sx={boat.sx} />
      </Plane>
      <SeaBand d={bd - 60} base={boat.y + 26 + bob * 0.4} amp={26 * k} len={100} ph={t * 120} fill={pal.sea3} seed="s3" />
      {rocks && (
        <Plane d={rocks.d ?? 1150}>
          <Rocks x={rocks.x} y={rocks.y} s={rocks.s} pal={pal} t={t} lit={lit} />
        </Plane>
      )}
      <SeaBand d={1000} base={1480} amp={44 * k} len={140} ph={-t * 150} fill={pal.sea4} seed="s4" lift={3} />
      <SeaBand d={700} base={1800} amp={60 * k} len={170} ph={t * 200} fill={pal.crest} seed="s5" lift={3} />
    </>
  );
};

// ------------------------------------------------------------------ 1. Hook: a lantern in the storm
export const S1: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const fl = flash(t, [2.9]) * 0.45;
  return (
    <Shot cam={{x: 0, y: -40, z: rs(t, 0, 4.5, 0, 260)}}>
      <SeaSet t={tw} pal={N} boat={{x: 540, y: 1130, s: 0.5}} lit={fl} />
      <Rain t={tw} />
      <FlashOverlay v={fl} />
    </Shot>
  );
};

// ------------------------------------------------------------------ 2. Reveal: rocks the boat cannot see
export const S2: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const fl = flash(t, [2.5]);
  return (
    <Shot cam={{x: rs(t, 0, 4.2, 0, 700), y: -40, z: 260}}>
      <SeaSet t={tw} pal={N} boat={{x: 540 + tw * 14, y: 1130, s: 0.5}} rocks={{x: 1150, y: 1240, s: 1}} lit={fl} />
      <Rain t={tw} seed="r2" />
      <FlashOverlay v={fl} />
    </Shot>
  );
};

// ------------------------------------------------------------------ 3. The lighthouse: lamp dead, one window lit
const TowerSet: React.FC<{t: number; pal: Pal; lamp?: number; windowLit?: number; rain?: number}> = ({t, pal, lamp = 0, windowLit = 1, rain = 1}) => (
  <>
    <SkyPlane pal={pal} />
    <Clouds d={4200} pal={pal} t={t} y={300} />
    <SeaBand d={2600} base={1500} amp={18} len={90} ph={t * 50} fill={pal.sea1} seed="t1" lift={1} />
    <Plane d={1000}>
      <Cliff pal={pal} />
      <Lighthouse x={540} base={1610} pal={pal} windowLit={windowLit} lamp={lamp} t={t} />
    </Plane>
    <SeaBand d={850} base={1920} amp={40} len={130} ph={-t * 140} fill={pal.sea4} seed="t2" lift={3} />
    <Plane d={850}>
      {[0, 1].map((i) => {
        const k = (t * 0.7 + i * 0.5) % 1;
        return (
          <g key={i} opacity={(1 - k) * rain}>
            <Cut d={cut(ellipsePts(60 + i * 960, 1960 - k * 220, 80 + k * 80, 36 + k * 36, 16), `tsp${i}`, 4)} fill={pal.foam} lift={1} edge={0} />
          </g>
        );
      })}
    </Plane>
  </>
);

export const S3: React.FC = () => {
  const t = useT();
  const tw = useTw();
  return (
    <Shot cam={{x: 0, y: rs(t, 0.3, 4.7, 520, 10), z: 120}}>
      <TowerSet t={tw} pal={N} />
      <Rain t={tw} seed="r3" />
    </Shot>
  );
};

// ------------------------------------------------------------------ 4. At the window (Kuleshov: rocks, then her face)
const Coat: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0 -10 L0 20" stroke="#2A2622" strokeWidth={8} />
    <Cut d={cut([[-30, 20], [30, 20], [110, 120], [120, 520], [-120, 520], [-110, 120]], 'coatHang', 1.6, 18)} fill={mix(GRANDPA.coat!, '#000000', 0.45)} lift={2} />
    <Cut d={cut([[-30, 20], [0, 120], [30, 20]], 'coatCollar', 1)} fill={mix(GRANDPA.coat!, '#000000', 0.55)} lift={1} edge={0} />
  </g>
);

const RoomWall: React.FC<{hole: {x: number; y: number; r: number}; pal: Pal}> = ({hole, pal}) => {
  const {x, y, r} = hole;
  const d = `M-1000 -1000 H2200 V3000 H-1000 Z M${x + r} ${y} A${r} ${r} 0 1 0 ${x - r} ${y} A${r} ${r} 0 1 0 ${x + r} ${y} Z`;
  return (
    <>
      <path d={d} fill={pal.wall} fillRule="evenodd" filter="url(#lift2)" />
      {Array.from({length: 18}, (_, i) => (
        <Cut key={i} d={cut(rectPts(-60 + (i % 6) * 220 + (Math.floor(i / 6) % 2) * 110, 260 + Math.floor(i / 6) * 520, 180, 70), `stone${i}`, 2)} fill={pal.wall2} lift={0} edge={0.06} />
      ))}
      <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#2F2A25" strokeWidth={30} filter="url(#lift2)" />
      <path d={`M${x - r} ${y} H${x + r} M${x} ${y - r} V${y + r}`} stroke="#2F2A25" strokeWidth={14} />
    </>
  );
};

export const S4: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const turned = tw >= 4.5;
  const pose: KidPose = {
    x: 450,
    y: 1660,
    scale: 1.6,
    flip: turned,
    armFront: turned ? -20 : -104,
    armBack: 14,
    headTilt: turned ? 0 : -5,
    expr: 'worried',
    blink: blinkAt(Math.round(tw * 23.976), 12),
    look: GIRL,
  };
  const lh = handPos(pose, 'back');
  const blink = Math.floor(tw * 2.2) % 3 !== 0 ? 1 : 0.35;
  return (
    <Shot cam={{x: rs(t, 0, 4.6, 0, -55), y: rs(t, 0, 4.6, 0, 120), z: rs(t, 0, 4.6, 0, 330)}} bg={N.sky}>
      <Plane d={2600}>
        <rect x={-1000} y={-1000} width={3000} height={4000} fill={N.sky} />
        <Cut d={cut([[-800, 960], [2200, 940], [2200, 3000], [-800, 3000]], 'farsea', 3, 30)} fill={N.sea2} lift={1} />
        <Glow x={800} y={930} r={80} a={blink} />
        <circle cx={800} cy={930} r={6} fill={AMBER} opacity={blink} />
      </Plane>
      <Plane d={1000}>
        <RoomWall hole={{x: 720, y: 860, r: 230}} pal={N} />
        {Array.from({length: 7}, (_, i) => {
          const yy = 700 + ((i * 53 + tw * 220) % 300);
          const xx = 600 + i * 40;
          return <path key={i} d={`M${xx} ${yy} l4 46`} stroke="rgba(210,220,230,0.4)" strokeWidth={3} />;
        })}
        <Coat x={150} y={640} />
      </Plane>
      <Plane d={900}>
        <Dim>
          <Kid {...pose} />
        </Dim>
        <Lantern x={lh[0] - 4} y={lh[1] - 10} s={1.5} t={tw} />
      </Plane>
      <Plane d={1000}>
        <Cut d={cut(rectPts(-400, 1640, 1900, 600), 'floor4', 2, 30)} fill="#2F2B27" lift={2} />
      </Plane>
    </Shot>
  );
};

// ------------------------------------------------------------------ 5. The climb (tracking up the spiral stair)
const STAIR: [number, number, number][] = [
  // time, x, y (feet)
  [0.2, 170, 1760],
  [2.5, 860, 1330],
  [4.8, 230, 880],
  [6.6, 860, 440],
];
const stairAt = (t: number) => {
  for (let i = 0; i < STAIR.length - 1; i++) {
    const [t0, x0, y0] = STAIR[i];
    const [t1, x1, y1] = STAIR[i + 1];
    if (t <= t1) {
      const k = Math.max(0, (t - t0) / (t1 - t0));
      return {x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, seg: i, moving: t >= t0};
    }
  }
  const [, x, y] = STAIR[STAIR.length - 1];
  return {x, y, seg: 2, moving: false};
};

export const S5: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const g = stairAt(tw);
  const gs = stairAt(Math.max(0, t - 0.25)); // the camera follows a beat behind
  const w = g.moving && tw < 6.6 ? walk(Math.round(tw * 23.976), 0.5, 26) : {legFront: 0, legBack: 0, armFront: 0, armBack: 0, bob: 0};
  const pose: KidPose = {x: g.x, y: g.y, scale: 0.95, flip: g.seg === 1, ...w, armFront: -38, expr: 'worried', blink: blinkAt(Math.round(tw * 23.976), 4), look: GIRL};
  const h = handPos(pose);
  const fl = flash(t, [3.2]);
  const steps: [number, number][] = [];
  for (let i = 0; i < STAIR.length - 1; i++) {
    const [, x0, y0] = STAIR[i];
    const [, x1, y1] = STAIR[i + 1];
    for (let k = 0; k <= 8; k++) steps.push([x0 + ((x1 - x0) * k) / 8, y0 + ((y1 - y0) * k) / 8]);
  }
  return (
    <Shot cam={{x: (gs.x - 540) * 0.35, y: gs.y - 250 - 960, z: 80}} bg={N.wall2}>
      <Plane d={1300}>
        <rect x={-1500} y={-2000} width={4200} height={5600} fill={N.wall2} />
        {Array.from({length: 30}, (_, i) => (
          <Cut key={i} d={cut(rectPts(-300 + (i % 6) * 300 + (Math.floor(i / 6) % 2) * 150, -500 + Math.floor(i / 6) * 520, 240, 80), `ws${i}`, 2)} fill={N.wall} lift={0} edge={0.05} />
        ))}
        {[
          [300, 1500],
          [800, 1050],
          [300, 620],
          [800, 200],
        ].map(([x, y], i) => (
          <Cut key={i} d={cut(rectPts(x - 22, y - 80, 44, 160), `slit${i}`, 1)} fill={mix('#1F242C', '#C9D3DD', fl)} lift={1} />
        ))}
      </Plane>
      <Plane d={1000}>
        {steps.map(([x, y], i) => (
          <Cut key={i} d={cut(rectPts(x - 62, y - 2, 124, 30), `step${i}`, 1, 14)} fill="#5E5850" lift={2} />
        ))}
        <Dim>
          <Kid {...pose} />
        </Dim>
        <Lantern x={h[0]} y={h[1] - 10} s={0.95} t={tw} />
      </Plane>
      <Plane d={820}>
        <Cut d={cut(rectPts(490, -1400, 76, 4200), 'column', 1.4, 30)} fill="#3F3B36" lift={3} />
      </Plane>
      <FlashOverlay v={fl * 0.5} />
    </Shot>
  );
};

// ------------------------------------------------------------------ 6. The lamp room
const LampRoom: React.FC<{t: number; fl?: number}> = ({t, fl = 0}) => (
  <>
    <Plane d={2400}>
      <rect x={-1500} y={-1500} width={4000} height={5000} fill={mix(N.sky, '#9AA6B4', fl * 0.7)} />
      <Cut d={cut([[-1500, 1180], [2500, 1160], [2500, 3500], [-1500, 3500]], 'lrsea', 3, 30)} fill={N.sea2} lift={1} />
    </Plane>
    <Plane d={1000}>
      {[-20, 360, 720, 1100].map((x, i) => (
        <Cut key={i} d={cut(rectPts(x - 18, -600, 36, 2000), `mul${i}`, 1, 30)} fill="#24272D" lift={2} />
      ))}
      <Cut d={cut(rectPts(-600, 560, 2300, 30), 'hbar', 1, 30)} fill="#24272D" lift={2} />
      <Cut d={cut(rectPts(-600, 1260, 2300, 300), 'lowwall', 2, 30)} fill="#36383D" lift={2} />
      <Cut d={cut(rectPts(-600, 1540, 2300, 900), 'lrfloor', 2, 30)} fill="#2C2A27" lift={2} />
      <Rain t={t} density={0.5} seed="lrr" color="rgba(200,210,220,0.25)" />
    </Plane>
  </>
);

export const S6a: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const lift = rs(tw, 0, 0.9, 0, 1);
  const flame = rs(tw, 1.0, 1.7, 0, 0.55);
  const pose: KidPose = {x: 250, y: 1560, scale: 1.3, armFront: -20 - 62 * lift, armBack: 10, headTilt: -6, expr: flame > 0.4 ? 'happy' : 'worried', blink: blinkAt(Math.round(tw * 23.976), 30), look: GIRL};
  const h = handPos(pose);
  return (
    <Shot cam={{x: 20, y: 0, z: rs(t, 0, 2.5, 0, 160)}}>
      <LampRoom t={tw} />
      <Plane d={1000}>
        <BigLamp x={620} y={980} flame={flame} t={tw} />
        <Dim>
          <Kid {...pose} />
        </Dim>
        <Lantern x={h[0]} y={h[1] - 10} s={1.3} t={tw} />
      </Plane>
    </Shot>
  );
};

export const S6b: React.FC = () => {
  const t = useT();
  const tw = useTw();
  return (
    <Shot cam={{x: rs(t, 0, 1.1, 0, 30), y: -20, z: 150}}>
      <SeaSet t={tw + 3} pal={N} boat={{x: 430, y: 1150, s: 0.9, d: 1300}} rocks={{x: 860, y: 1260, s: 1.25, d: 1100}} />
      <Rain t={tw} seed="r6b" />
    </Shot>
  );
};

export const S6c: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const burst = 0.25;
  const out = tw > 0.95;
  const flicker = (v: number) => (tw < 0.5 ? v : tw < 0.95 ? v * (Math.floor(tw * 20) % 2 ? 0.35 : 0.8) : 0);
  const pose: KidPose = {
    x: 250,
    y: 1560,
    scale: 1.3,
    armFront: tw > burst ? -60 : -82,
    armBack: tw > burst ? -40 : 10,
    lean: tw > burst ? -6 : 0,
    headTilt: 6,
    hairBlow: tw > burst ? 1 : 0,
    expr: tw > burst ? 'shocked' : 'happy',
    look: GIRL,
  };
  const h = handPos(pose);
  return (
    <Shot cam={{x: -40, y: 0, z: 260}}>
      <LampRoom t={tw} />
      <Plane d={1000}>
        <BigLamp x={620} y={980} flame={flicker(0.55)} t={tw} />
        <Dim>
          <Kid {...pose} />
        </Dim>
        <Lantern x={h[0]} y={h[1] - 10} s={1.3} t={tw} on={flicker(1)} />
        <Shards t={tw} at={burst} x={170} y={300} />
      </Plane>
      {tw > burst && <Rain t={tw} density={1.3} slant={0.7} seed="gust" />}
      {out && <rect width={W} height={H} fill="#0E1116" opacity={0.35} />}
    </Shot>
  );
};

export const S6d: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const fl = flash(t, [0.15]);
  return (
    <Shot cam={{x: 0, y: 0, z: rs(t, 0, 1, 120, 200)}}>
      <SeaSet t={tw + 6} pal={N} boat={{x: 360, y: 1180, s: 1.0, d: 1200}} rocks={{x: 640, y: 1330, s: 1.7, d: 900}} lit={fl} />
      <Rain t={tw} seed="r6d" density={1.2} />
      <FlashOverlay v={fl} />
    </Shot>
  );
};

export const S6e: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const fl = flash(t, [1.3]);
  const up = rs(tw, 2.0, 2.5, 0, 1, settle);
  const pose: KidPose = {
    x: 380,
    y: 1560,
    scale: 1.3,
    bob: -60 * (1 - up),
    legFront: -55 * (1 - up),
    legBack: 45 * (1 - up),
    armFront: tw > 2.0 ? lerpT(10, -70, up) : 10,
    armBack: 10,
    headTilt: tw < 1.6 ? 22 : -16,
    expr: 'worried',
    blink: blinkAt(Math.round(tw * 23.976), 8),
    look: GIRL,
  };
  return (
    <Shot cam={{x: 60, y: 0, z: 120}}>
      <LampRoom t={tw} fl={fl} />
      <Plane d={1000}>
        <BigLamp x={620} y={980} flame={0} t={tw} />
        <path d="M880 -200 L880 1380" stroke={mix('#6B5D4A', '#C9B898', fl)} strokeWidth={14} strokeLinecap="round" />
        <Cut d={cut(ellipsePts(880, 1390, 16, 22, 10), 'ropeEnd', 0.6)} fill={mix('#6B5D4A', '#C9B898', fl)} lift={1} edge={0} />
        <Dim>
          <Kid {...pose} />
        </Dim>
        <Lantern x={300} y={1490} s={1.1} t={tw} on={0} />
      </Plane>
      <rect width={W} height={H} fill="#0E1116" opacity={0.35 * (1 - fl)} />
      <FlashOverlay v={fl} />
    </Shot>
  );
};

// ------------------------------------------------------------------ 7. She rings the bell
export const RINGS = [0.4, 1.6, 2.8, 4.0];
export const S7: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const ph = (tw - 0.1) / 1.2;
  const pull = Math.max(0, Math.sin(ph * Math.PI * 2));
  const angle = 26 * Math.sin(ph * Math.PI * 2 - 0.6) * rs(tw, 0, 0.5, 0.4, 1);
  const shake = RINGS.reduce((m, r) => (t >= r && t < r + 0.35 ? m + Math.exp(-(t - r) * 12) : m), 0);
  const pose: KidPose = {
    x: 500,
    y: 1780,
    scale: 1.35,
    armFront: -172 + pull * 18,
    armBack: -165 + pull * 18,
    bob: -34 * pull,
    headTilt: tw > 4.15 ? 20 : -8,
    hairBlow: 0.8,
    expr: tw > 3.2 ? 'worried' : 'neutral',
    look: GIRL,
  };
  const h = handPos(pose);
  // the rope hangs from a lever on the bell's yoke, so it swings with the bell
  const ar = (angle * Math.PI) / 180;
  const lever: [number, number] = [560 + 1.25 * (130 * Math.cos(ar) - 30 * Math.sin(ar)), 300 + 1.25 * (130 * Math.sin(ar) + 30 * Math.cos(ar))];
  return (
    <Shot cam={{x: Math.sin(t * 90) * 7 * shake, y: 80 + Math.cos(t * 77) * 7 * shake, z: 60}}>
      <SkyPlane pal={N} />
      <Clouds d={4200} pal={N} t={tw} y={420} />
      <Plane d={2600}>
        {Array.from({length: 7}, (_, i) => (
          <VHouse key={i} x={-200 + i * 260} base={2000} w={150} h={120 + (i % 3) * 30} lit={0} seed={`bh${i}`} pal={N} />
        ))}
      </Plane>
      <Plane d={1000}>
        <path d={`M${lever[0]} ${lever[1]} L${h[0]} ${h[1]}`} stroke="#7A6A55" strokeWidth={12} strokeLinecap="round" />
        <Bell x={560} y={300} s={1.25} angle={angle} pal={N} />
        <Dim>
          <Kid {...pose} />
        </Dim>
      </Plane>
      <Plane d={850}>
        <Cut d={cut(rectPts(-400, 1640, 2000, 26), 'rail1', 1.2, 30)} fill="#1E2126" lift={3} />
        {Array.from({length: 10}, (_, i) => (
          <Cut key={i} d={cut(rectPts(-300 + i * 180, 1640, 22, 500), `bal${i}`, 1, 20)} fill="#1E2126" lift={3} />
        ))}
      </Plane>
      <Rain t={tw} seed="r7" slant={0.4} />
    </Shot>
  );
};

// ------------------------------------------------------------------ 8. The village answers
const DOORS: [number, number][] = [
  [80, 1600],
  [220, 1560],
  [360, 1620],
  [500, 1570],
  [160, 1720],
  [320, 1760],
  [470, 1730],
  [620, 1680],
];
const JETTY = (k: number): [number, number] => [300 + 640 * k, 1440 - 380 * k];

export const S8: React.FC = () => {
  const t = useT();
  const tw = useTw();
  return (
    <Shot cam={{x: 40, y: rs(t, 0, 5.6, 150, 0), z: rs(t, 0, 5.6, 320, 0)}}>
      <SkyPlane pal={N} />
      <Clouds d={4200} pal={N} t={tw} y={160} />
      <Plane d={2600}>
        <Cut d={cut([[-1500, 760], [2600, 740], [2600, 3600], [-1500, 3600]], 'vsea', 3, 30)} fill={N.sea2} lift={1} />
        <g transform="translate(1080 820) scale(0.42)">
          <Rocks x={0} y={0} pal={N} t={tw} />
        </g>
        <Glow x={880} y={830} r={60} a={0.9} />
        <circle cx={880} cy={830} r={6} fill={AMBER} />
      </Plane>
      <Plane d={1200}>
        <Cut d={cut([[-800, 1500], [120, 1380], [380, 1460], [700, 1560], [900, 1900], [900, 3000], [-800, 3000]], 'shore', 3, 26)} fill={N.cliff} lift={2} />
        <Cut d={cut([[270, 1450], [960, 1050], [985, 1080], [300, 1485]], 'jetty', 1.6, 20)} fill={N.wood} lift={2} />
        {DOORS.map(([x, base], i) => (
          <VHouse key={i} x={x} base={base} w={120} h={100 + (i % 3) * 22} lit={rs(tw, 0.3 + i * 0.22, 0.6 + i * 0.22)} seed={`vh${i}`} pal={N} />
        ))}
        {Array.from({length: 9}, (_, i) => {
          const start = 1.5 + i * 0.28;
          const k = rs(tw, start, start + 2.4);
          if (tw < start) return null;
          const door = DOORS[i % DOORS.length];
          const [jx, jy] = JETTY(0.08 + (i / 8) * 0.88);
          const x = lerpT(door[0], jx, k);
          const y = lerpT(door[1] - 20, jy - 24, k) - Math.sin(k * Math.PI) * 30;
          return <VLantern key={i} x={x} y={y - 60} s={0.55} seed={`vl${i}`} />;
        })}
      </Plane>
      <Plane d={520}>
        <Cut d={cut(rectPts(-500, 1820, 2100, 30), 'frail', 1.4, 30)} fill="#15181C" lift={3} />
        {Array.from({length: 8}, (_, i) => (
          <Cut key={i} d={cut(rectPts(-380 + i * 240, 1820, 26, 400), `fbal${i}`, 1, 20)} fill="#15181C" lift={3} />
        ))}
      </Plane>
      <Rain t={tw} seed="r8" density={0.8} />
    </Shot>
  );
};

// ------------------------------------------------------------------ 9. The boat turns for home
export const S9: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const dawn = rs(t, 0.4, 6, 0, 0.55);
  const pal = palMix(dawn);
  const bx = lerpT(1250, 120, rs(t, 0.2, 6, 0, 1, (x) => x));
  const turn = rs(tw, 0.3, 0.9); // a paper puppet turns by flipping through edge-on
  const sx = Math.cos(turn * Math.PI);
  const camX = (lerpT(1250, 120, rs(Math.max(0, t - 0.4), 0.2, 6, 0, 1, (x) => x)) - 540) / 0.714;
  return (
    <Shot cam={{x: camX, y: -30, z: 150}}>
      <SeaSet t={tw} pal={pal} boat={{x: bx, y: 1150, s: 0.62, d: 1400, sx}} calm={dawn} />
      <Plane d={1700}>
        <g transform="translate(1900 1150) scale(0.9)">
          <Rocks x={0} y={0} pal={pal} t={tw} />
        </g>
      </Plane>
      <Plane d={1150}>
        <Cut d={cut(rectPts(-1500, 1250, 1900, 44), 'jetty9', 1.6, 24)} fill={pal.wood} lift={2} />
        {Array.from({length: 12}, (_, i) => (
          <g key={i}>
            <Cut d={cut(rectPts(-1450 + i * 150, 1270, 22, 240), `pile${i}`, 1, 20)} fill={mix(pal.wood, '#000000', 0.3)} lift={1} />
            <VLantern x={-1400 + i * 150} y={1150} s={0.85} seed={`jl${i}`} a={1 - dawn * 0.6} />
          </g>
        ))}
      </Plane>
      <Rain t={tw} seed="r9" density={Math.max(0.1, 1 - dawn * 1.6)} />
    </Shot>
  );
};

// ------------------------------------------------------------------ 10. Dawn on the jetty: home
export const S10: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const f = Math.round(tw * 23.976);
  const gx = lerpT(1180, 640, rs(tw, 0.3, 2.2, 0, 1, (x) => x));
  const gWalk = tw < 2.2 && tw > 0.3 ? walk(f, 0.42, 20) : {legFront: 0, legBack: 0, armFront: 0, armBack: 0, bob: 0};
  const hug = tw >= 2.4;
  const grandpa: KidPose = {
    x: gx,
    y: 1660,
    scale: 1.3,
    flip: true,
    ...gWalk,
    armFront: hug ? -72 : gWalk.armFront,
    armBack: hug ? -58 : gWalk.armBack,
    headTilt: hug ? 12 : 0,
    expr: hug ? 'happy' : 'neutral',
    blink: blinkAt(f, 40),
    look: GRANDPA,
  };
  const kx = lerpT(-140, 500, rs(tw, 0.6, 2.4, 0, 1, (x) => x));
  const run = tw < 2.4 && tw > 0.6 ? walk(f, 0.7, 34) : {legFront: 0, legBack: 0, armFront: 0, armBack: 0, bob: 0};
  const hop = hug && tw < 3.1 ? Math.abs(Math.sin((tw - 2.4) * 4.5)) * 30 : 0;
  const girl: KidPose = {
    x: kx,
    y: 1680,
    scale: 1.0,
    ...run,
    lean: hug ? 0 : 10,
    armFront: hug ? -78 : run.armFront,
    armBack: hug ? -62 : run.armBack,
    bob: hop + run.bob,
    headTilt: hug ? -10 : 0,
    expr: hug ? 'joy' : 'happy',
    blink: blinkAt(f, 22),
    look: GIRL,
  };
  return (
    <Shot cam={{x: rs(t, 0, 5.5, 0, 20), y: rs(t, 0, 5.5, 0, 60), z: rs(t, 0, 5.5, 0, 140)}} bg={D.sky}>
      <SkyPlane pal={D} />
      <Plane d={4000}>
        <Sun x={820} y={720} f={f} r={110} />
      </Plane>
      <Clouds d={3600} pal={D} t={tw} y={420} />
      <Plane d={2600}>
        <Cut d={cut([[-1500, 1080], [2600, 1060], [2600, 3600], [-1500, 3600]], 'dsea', 3, 30)} fill={D.sea2} lift={1} />
        <g transform="translate(-60 0) scale(0.28) translate(0 1700)">
          <Cliff pal={D} />
          <Lighthouse x={540} base={1610} pal={D} t={tw} />
        </g>
      </Plane>
      {[0, 1, 2].map((i) => (
        <Plane key={i} d={2000}>
          <Bird x={-100 + tw * (110 + i * 18) + i * 120} y={560 + i * 50} f={f + i * 2} scale={0.7} seed={`dg${i}`} />
        </Plane>
      ))}
      <Plane d={1300}>
        <Boat x={900} y={1360 + Math.sin(tw * 1.5) * 6} s={0.85} t={tw} pal={D} lamp={0.15} />
        <Cut d={cut([[-900, 1390], [2200, 1380], [2200, 3000], [-900, 3000]], 'dsea2', 2, 30)} fill={D.sea3} lift={2} />
        {[
          [120, 0],
          [300, 1],
          [1030, 2],
        ].map(([x, k]) => (
          <g key={x}>
            <Kid x={x} y={1470} scale={0.78} flip={x > 600} expr="happy" look={VILLAGERS[k]} armFront={-30} blink={blinkAt(f, x)} />
            <VLantern x={x + (x > 600 ? -60 : 60)} y={1290} s={0.6} a={0.5} seed={`dl${x}`} figure={false} />
          </g>
        ))}
      </Plane>
      <Plane d={1000}>
        <Cut d={cut(rectPts(-700, 1500, 2500, 900), 'deck', 2, 30)} fill="#B9A78D" lift={2} />
        {Array.from({length: 12}, (_, i) => (
          <path key={i} d={`M${-600 + i * 200} 1500 L${-640 + i * 200} 2400`} stroke="#A39177" strokeWidth={4} />
        ))}
        <Kid {...grandpa} />
        <Kid {...girl} />
      </Plane>
    </Shot>
  );
};

// ------------------------------------------------------------------ 11. The lamp glows once, by itself
export const S11: React.FC = () => {
  const t = useT();
  const tw = useTw();
  const lamp = tw < 1.9 ? 0 : tw < 2.25 ? rs(tw, 1.9, 2.25, 0, 0.85) : rs(tw, 2.25, 3.0, 0.85, 0.25);
  const title = rs(t, 1.5, 2.1, 0, 1, settle);
  return (
    <Shot cam={{x: 0, y: rs(t, 0.1, 2.0, 300, -680), z: 120}} bg={D.sky}>
      <TowerSet t={tw} pal={D} lamp={lamp} windowLit={0} rain={0} />
      <g transform={`translate(0 ${(1 - title) * 500})`} opacity={title}>
        <Strip x={540} y={1560} text="The Keeper" size={120} font="Fraunces" seed="title" rot={-2} padX={0.32} lift={3} />
      </g>
    </Shot>
  );
};

