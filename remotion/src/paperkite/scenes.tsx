// The eight scenes of "The Paper Kite". Every scene is one SVG sheet; frames are stepped on twos.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, H, PaperDefs, Pt, Strip, W, cut, ellipsePts, enter, lerp, ramp, snap, towardViewer, useStep, burstPts, Cut} from './kit';
import {Bird, Kid, KidPose, Kite, KiteString, blinkAt, handPos, walk} from './cast';
import {Band, Cloud, Fence, Flower, House, Pine, Range, STARS, Sky, Smoke, Star, Sun, Tree, Tuft, mix} from './set';

const Sheet: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <PaperDefs />
      {children}
    </svg>
  </AbsoluteFill>
);

// Point on the kite where the string ties on, given its transform.
const kiteTie = (x: number, y: number, rot: number, s: number): Pt => {
  const a = (rot * Math.PI) / 180;
  return [x - Math.sin(a) * 20 * s, y + Math.cos(a) * 20 * s];
};

// ---------------------------------------------------------------- 0. Title
export const TitleScene: React.FC<{dur: number}> = ({dur}) => {
  const f = useStep();
  const sun = enter(f, 2, 'top', 700, 16);
  const c1 = enter(f, 4, 'left', 800, 16);
  const c2 = enter(f, 8, 'right', 800, 16);
  const hills = enter(f, 0, 'bottom', 600, 16);
  const kite = enter(f, 10, 'tl', 1100, 20);
  const s1 = enter(f, 20, 'left', 1000, 14);
  const s2 = enter(f, 25, 'right', 1000, 14);
  const s3 = enter(f, 30, 'bottom', 900, 14);
  const ex = dur - 20;
  const out = (i: number, cx: number, cy: number) => towardViewer(f, ex + i * 2, cx, cy);
  const o = [out(0, 820, 380), out(1, 250, 560), out(2, 540, 760), out(3, 540, 1120), out(4, 540, 1280), out(5, 540, 1520), out(6, 820, 700)];
  return (
    <Sheet>
      <Sky color={C.paper} />
      <g transform={o[0].transform} style={o[0].style}>
        <g transform={`translate(${sun.x} ${sun.y})`}>
          <Sun x={820} y={380} f={f} r={105} />
        </g>
      </g>
      <g transform={o[1].transform} style={o[1].style}>
        <g transform={`translate(${c1.x + f * 0.4} ${c1.y})`}>
          <Cloud x={250} y={560} s={0.9} seed="tc1" />
        </g>
      </g>
      <g transform={o[6].transform} style={o[6].style}>
        <g transform={`translate(${c2.x - f * 0.3} ${c2.y})`}>
          <Cloud x={840} y={720} s={0.7} seed="tc2" />
        </g>
      </g>
      <g transform={`translate(0 ${hills.y})`}>
        <Band f={(x) => 1640 + 50 * Math.sin(x / 160)} fill={C.sage1} seed="th1" />
        <Band f={(x) => 1740 + 40 * Math.sin(x / 120 + 2)} fill={C.sage2} seed="th2" lift={2} />
      </g>
      <g transform={o[2].transform} style={o[2].style}>
        <g transform={`translate(${kite.x} ${kite.y}) rotate(${kite.rot * 3})`}>
          <Kite x={540} y={720} rot={Math.sin(f * 0.12) * 8} scale={1.05} f={f} />
        </g>
      </g>
      <g transform={o[3].transform} style={o[3].style}>
        <g transform={`translate(${s1.x} ${s1.y})`}>
          <Strip x={540} y={1120} text="a little paper story" size={72} font="Caveat" seed="st1" rot={-3} />
        </g>
      </g>
      <g transform={o[4].transform} style={o[4].style}>
        <g transform={`translate(${s2.x} ${s2.y})`}>
          <Strip x={540} y={1280} text="The Paper" size={130} font="Fraunces" seed="st2" rot={2} padX={0.3} />
        </g>
      </g>
      <g transform={o[5].transform} style={o[5].style}>
        <g transform={`translate(${s3.x} ${s3.y})`}>
          <Strip x={560} y={1520} text="Kite" size={210} font="Fraunces" color={C.accent} seed="st3" rot={-2} padX={0.3} lift={3} />
        </g>
      </g>
    </Sheet>
  );
};

// ---------------------------------------------------------------- shared: the town
const Town: React.FC<{f: number; sky: string; sun: Pt; lit?: number; children?: React.ReactNode; birdsAt?: number}> = ({f, sky, sun, lit = 0, children, birdsAt = 40}) => (
  <>
    <Sky color={sky} />
    <Sun x={sun[0]} y={sun[1]} f={f} />
    <Cloud x={260 + f * 0.5} y={420} s={0.8} seed="cl1" />
    <Cloud x={860 - f * 0.35} y={640} s={0.6} seed="cl2" />
    {[0, 1, 2].map((i) => (
      <Bird key={i} x={-120 + (f - birdsAt) * 6 + i * 70} y={560 + i * 46 - (f - birdsAt) * 1.2} f={f + i * 2} scale={0.7} seed={`b${i}`} />
    ))}
    <Band f={(x) => 1180 + 40 * Math.sin(x / 170)} fill={C.sage1} seed="tf1" />
    <Band f={(x) => 1320 + 50 * Math.sin(x / 230 + 1)} fill={C.sage2} seed="tf2" />
    <Smoke x={300 + 150 * 0.18 + 15} y={1560 - 260 - 75 + 18} f={f} seed="sm1" />
    <Smoke x={700 + 160 * 0.18 + 15} y={1560 - 280 - 80 + 18} f={f + 9} seed="sm2" />
    <House x={110} base={1560} w={170} h={200} wall="#E9E0CF" roof={C.roof} seed="h1" lit={lit} />
    <House x={300} base={1560} w={150} h={260} wall="#D9CDB8" roof={C.roof2} seed="h2" lit={lit} chimney />
    <House x={490} base={1560} w={190} h={210} wall="#E4DACA" roof={C.roof3} seed="h3" lit={lit} />
    <House x={700} base={1560} w={160} h={280} wall="#D2C8B8" roof={C.roof} seed="h4" lit={lit} chimney />
    <House x={905} base={1560} w={180} h={220} wall="#E7DDCB" roof={C.roof2} seed="h5" lit={lit} />
    <Tree x={1010} base={1580} s={0.95} seed="tr1" sway={Math.sin(f * 0.1) * 2} />
    <Band f={(x) => 1545 + 10 * Math.sin(x / 90)} fill="#DED4C2" seed="tg" lift={2} />
    <Cut d={cut([[380, 1555], [700, 1555], [900, 1930], [180, 1930]], 'path', 2, 24)} fill="#E9E1D2" lift={0} edge={0} />
    {children}
    <Fence y={1760} x0={-20} x1={260} seed="fl" />
    <Fence y={1760} x0={850} x1={1100} seed="fr" />
    <Tuft x={300} y={1900} s={1.2} seed="tt1" />
    <Tuft x={790} y={1910} s={1.4} seed="tt2" lean={-6} />
  </>
);

// ---------------------------------------------------------------- 1. Morning in the town
export const TownMorning: React.FC<{dur: number}> = () => {
  const f = useStep();
  const walking = f < 112;
  const x = lerp(-180, 530, ramp(f, 8, 112, 0, 1, (t) => t));
  const w = walking ? walk(f, 0.42, 22) : {legFront: 0, legBack: 0, armFront: 0, armBack: 0, bob: 0};
  const lift = ramp(f, 132, 146, 0, 1, snap);
  const pose: KidPose = {
    x,
    y: 1700,
    legFront: w.legFront,
    legBack: w.legBack,
    armBack: w.armBack,
    armFront: lerp(-25 + w.armFront * 0.2, -160, lift),
    bob: w.bob + (f > 150 && f < 170 ? Math.abs(Math.sin((f - 150) * 0.32)) * 36 : 0),
    headTilt: walking ? 0 : ramp(f, 114, 124, 0, -14),
    expr: f > 132 ? 'joy' : 'happy',
    blink: blinkAt(f, 20),
  };
  const [hx, hy] = handPos(pose);
  const kite = <Kite x={hx + 6} y={hy - 70 * (1 - lift) - 125 * lift} rot={lerp(-24, 0, lift)} scale={0.6} f={f} tail={0.5} />;
  return (
    <Sheet>
      <Town f={f} sky="#EEE7DA" sun={[220, lerp(900, 640, ramp(f, 0, 120))]} birdsAt={70}>
        {lift > 0.5 && kite}
        <Kid {...pose} />
        {lift <= 0.5 && kite}
      </Town>
    </Sheet>
  );
};

// ---------------------------------------------------------------- 2. Up the hill, the kite climbs
const hill2 = (x: number) => 1300 + 470 * smooth(Math.min(1, Math.max(0, x / 1080)));
const smooth = (t: number) => t * t * (3 - 2 * t);

export const HillRun: React.FC<{dur: number}> = () => {
  const f = useStep();
  const running = f < 124;
  const kx = lerp(940, 330, ramp(f, 10, 124, 0, 1, (t) => t));
  const r = running && f >= 10 ? walk(f, 0.6, 34) : {legFront: 0, legBack: 0, armFront: 0, armBack: 0, bob: 0};
  const pose: KidPose = running
    ? {x: kx, y: hill2(kx), flip: true, lean: f >= 10 ? 12 : 0, ...r, armFront: 55, expr: 'happy', blink: blinkAt(f)}
    : {x: kx, y: hill2(kx), flip: false, armFront: -132, armBack: 10, headTilt: -12, expr: f > 140 ? 'joy' : 'happy', blink: blinkAt(f, 30)};
  const [hx, hy] = handPos(pose);
  // the kite drags, lifts, then climbs high and sways
  const up = ramp(f, 34, 150, 0, 1, snap);
  const ground: Pt = [kx + 230, hill2(kx + 230) - 60];
  const sky: Pt = [790, 470];
  const ktx = lerp(ground[0], sky[0], up) + Math.sin(f * 0.11) * 30 * up;
  const kty = lerp(ground[1], sky[1], up) + Math.cos(f * 0.09) * 20 * up;
  const krot = lerp(70, 0, ramp(f, 30, 70)) + Math.sin(f * 0.13) * 10;
  const tie = kiteTie(ktx, kty, krot, 0.8);
  return (
    <Sheet>
      <Sky color="#ECE6DA" />
      <Sun x={190} y={320} f={f} r={95} />
      <Cloud x={720 - f * 0.4} y={300} s={0.75} seed="hc1" />
      <Cloud x={300 + f * 0.3} y={760} s={0.55} seed="hc2" />
      <Band f={(x) => 1240 + 36 * Math.sin(x / 140)} fill={C.sage1} seed="hf1" />
      <g transform="translate(560 0) scale(0.45)">
        {[0, 1, 2].map((i) => (
          <House key={i} x={800 + i * 220} base={2800 + (i % 2) * 20} w={180} h={200 + i * 30} wall="#E4DACA" roof={C.roof} seed={`fh${i}`} />
        ))}
      </g>
      <Band f={(x) => hill2(x)} fill={C.sage2} seed="hill" lift={2} />
      <Tree x={150} base={hill2(150) + 20} s={0.9} seed="ht" sway={Math.sin(f * 0.1) * 3} />
      {[620, 760, 980].map((x, i) => (
        <Flower key={i} x={x} y={hill2(x) + 50 + i * 10} seed={`hfl${i}`} />
      ))}
      <KiteString from={[hx, hy]} to={tie} sag={lerp(10, 90, up)} />
      <Kite x={ktx} y={kty} rot={krot} scale={0.8} f={f} tail={0.4 + up} tailDir={-0.6 * up} />
      <Kid {...pose} />
      <Tuft x={80} y={1920} s={1.6} seed="ht1" />
      <Tuft x={540} y={1930} s={1.3} seed="ht2" lean={8} />
      <Tuft x={1000} y={1925} s={1.5} seed="ht3" />
    </Sheet>
  );
};

// ---------------------------------------------------------------- 3. The gust: the string snaps
const hill3 = (x: number) => 1640 + 260 * smooth(Math.min(1, Math.max(0, x / 1080)));
export const SNAP_AT = 64;

export const Gust: React.FC<{dur: number}> = () => {
  const f = useStep();
  const gust = ramp(f, 30, 58);
  const calm = ramp(f, 104, 130);
  const snapped = f >= SNAP_AT;
  const expr = f < 38 ? 'happy' : f < SNAP_AT ? 'worried' : f < 110 ? 'shocked' : 'worried';
  const reach = snapped ? ramp(f, SNAP_AT, SNAP_AT + 8, 0, 1, snap) * (1 - calm) : 0;
  const pose: KidPose = {
    x: 330,
    y: hill3(330),
    scale: 1.45,
    armFront: lerp(-134, -160, reach) + (snapped ? 0 : Math.sin(f * 0.9) * 6 * gust) + calm * 110,
    armBack: lerp(8, -70, reach) + calm * 50,
    lean: snapped ? 8 * reach : -7 * gust,
    headTilt: -14 + calm * 6,
    hairBlow: gust * (1 - calm * 0.8),
    expr,
    blink: !snapped && blinkAt(f, 10),
    bob: snapped ? Math.max(0, Math.sin((f - SNAP_AT) * 0.35)) * 26 * (f < SNAP_AT + 10 ? 1 : 0) : 0,
  };
  const [hx, hy] = handPos(pose);
  // kite: tugging, then free and gone up-right
  const t = Math.max(0, f - SNAP_AT);
  const kx = 810 + Math.sin(f * 0.13) * (20 + 40 * gust) + t * t * 0.55 + t * 4;
  const ky = 400 + Math.cos(f * 0.17) * (14 + 30 * gust) - t * t * 0.38 - t * 3;
  const krot = Math.sin(f * 0.21) * (8 + 18 * gust) + t * 9;
  const tie = kiteTie(kx, ky, krot, 0.9);
  // the broken string: the hand's half falls slack, the kite's half trails away
  const fall = Math.min(1, t / 14);
  const loose: Pt = [lerp(560, 640, fall), lerp(820, 1500, fall * fall)];
  return (
    <Sheet>
      <Sky color={mix('#ECE6DA', '#E2DED6', gust)} />
      <Cloud x={700 + f * (1 + gust * 4)} y={760} s={0.9} seed="gc1" />
      <Cloud x={120 + f * (1 + gust * 5)} y={420} s={0.6} seed="gc2" />
      <Band f={(x) => 1420 + 40 * Math.sin(x / 150)} fill={C.sage1} seed="gf1" />
      <Band f={hill3} fill={C.sage2} seed="ghill" lift={2} />
      {snapped ? (
        <>
          <KiteString from={[hx, hy]} to={loose} sag={60 + fall * 120} />
          <KiteString from={tie} to={[tie[0] - 140, tie[1] + 180]} sag={-30} opacity={1 - Math.min(1, t / 26)} />
        </>
      ) : (
        <KiteString from={[hx, hy]} to={tie} sag={lerp(60, 10, gust)} />
      )}
      <Kite x={kx} y={ky} rot={krot} scale={0.9} f={f * (1 + gust)} tail={1 + gust} tailDir={-1} />
      <Kid {...pose} />
      {/* "!" cut from paper */}
      {f >= SNAP_AT + 2 && f < 104 && (
        <g transform={`translate(${hx - 40} 760) scale(${ramp(f, SNAP_AT + 2, SNAP_AT + 8, 0.2, 1, snap)}) rotate(8)`}>
          <Cut d={cut([[-16, -90], [16, -90], [8, 10], [-8, 10]], 'bang1', 1, 12)} fill={C.ink} lift={2} />
          <Cut d={cut(ellipsePts(0, 40, 14, 14, 12), 'bang2', 0.8)} fill={C.ink} lift={2} />
        </g>
      )}
      {/* wind: paper streamers and tumbling leaves */}
      {[0, 1, 2, 3, 4].map((i) => {
        const at = 28 + i * 7;
        const x = -700 + (f - at) * 70;
        if (f < at || x > W + 200) return null;
        const y = 560 + i * 230;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${-4 + i * 2})`}>
            <Cut d={cut([[0, 0], [520, -20], [600, -6], [520, 6], [0, 14]], `ws${i}`, 1.4, 22)} fill={C.white} lift={3} />
          </g>
        );
      })}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const at = 34 + i * 5;
        const x = -80 + (f - at) * (38 + i * 4);
        if (f < at || x > W + 100) return null;
        const y = 1500 - (f - at) * (6 + i) + Math.sin(f * 0.5 + i) * 40;
        return (
          <g key={`l${i}`} transform={`translate(${x} ${y}) rotate(${(f - at) * 25})`}>
            <Cut d={cut([[-26, 0], [0, -12], [26, 0], [0, 12]], `lf${i}`, 0.8, 10)} fill={i % 2 ? C.sage3 : C.sage4} lift={3} edge={0.15} />
          </g>
        );
      })}
      <Tuft x={120} y={1930} s={1.8} seed="gt1" lean={18 * gust * (1 - calm)} />
      <Tuft x={920} y={1935} s={1.6} seed="gt2" lean={18 * gust * (1 - calm)} />
    </Sheet>
  );
};

// ---------------------------------------------------------------- 4. Over the sea
export const Sea: React.FC<{dur: number}> = ({dur}) => {
  const f = useStep();
  const t = f / dur;
  const waveTop = (base: number, amp: number, len: number, ph: number) => (x: number) => base + amp * Math.sin((x + ph) / len);
  const bands = [
    {base: 1240, amp: 14, len: 70, ph: f * 1.2, fill: C.sea1},
    {base: 1380, amp: 18, len: 90, ph: -f * 1.8, fill: C.sea2},
    {base: 1540, amp: 22, len: 110, ph: f * 2.4, fill: C.sea3},
    {base: 1720, amp: 26, len: 130, ph: -f * 3.2, fill: C.sea4},
  ];
  // the kite crosses, with a loop-the-loop in the middle
  let kx = -180 + t * 1460;
  let ky = 660 + 90 * Math.sin(t * Math.PI * 2.4);
  let krot = 14 + Math.sin(f * 0.15) * 8;
  const lt = (t - 0.4) / 0.2;
  if (lt > 0 && lt < 1) {
    const a = io01(lt) * Math.PI * 2;
    kx += 150 * Math.sin(a) - 120 * Math.sin(a / 2);
    ky += -150 * (1 - Math.cos(a));
    krot += (a * 180) / Math.PI;
  }
  const boatX = 860 - f * 1.4;
  const bTop = waveTop(bands[1].base, bands[1].amp, bands[1].len, bands[1].ph);
  const whale = ramp(f, 96, 120, 0, 1, snap) * (1 - ramp(f, 150, 172));
  return (
    <Sheet>
      <Sky color="#ECE3D5" />
      <Sun x={810} y={lerp(470, 560, t)} f={f} r={100} />
      <Cloud x={300 - f * 0.9} y={330} s={0.7} seed="sc1" />
      <Cloud x={980 - f * 1.1} y={860} s={0.5} seed="sc2" />
      {[0, 1, 2].map((i) => (
        <Bird key={i} x={-60 + f * (3.2 + i * 0.4) + i * 90} y={960 + i * 40 + Math.sin(f * 0.2 + i) * 12} f={f + i * 2} scale={0.6} seed={`g${i}`} />
      ))}
      {bands.slice(0, 2).map((b, i) => (
        <Band key={i} f={waveTop(b.base, b.amp, b.len, b.ph)} fill={b.fill} seed={`sea${i}`} lift={i ? 2 : 1} />
      ))}
      <g transform={`translate(${boatX} ${bTop(boatX) - 6}) rotate(${Math.cos((boatX + bands[1].ph) / bands[1].len) * 8})`}>
        <path d="M0 -20 L0 -230" stroke={C.ink} strokeWidth={6} />
        <Cut d={cut([[6, -220], [120, -40], [6, -40]], 'sail1', 1.2)} fill={C.white} lift={2} />
        <Cut d={cut([[-6, -180], [-80, -40], [-6, -40]], 'sail2', 1.2)} fill="#E5DCCB" lift={2} />
        <Cut d={cut([[-120, -30], [130, -30], [90, 30], [-90, 30]], 'hull', 1.2)} fill={C.roof} lift={2} />
      </g>
      <Band f={waveTop(bands[2].base, bands[2].amp, bands[2].len, bands[2].ph)} fill={bands[2].fill} seed="sea2" lift={2} />
      {whale > 0 && (
        <g transform={`translate(300 ${lerp(1840, 1640, whale)}) rotate(${Math.sin(f * 0.2) * 6})`}>
          <Cut d={cut([[-18, 140], [-14, 20], [-110, -40], [-60, -30], [0, 0], [60, -30], [110, -40], [14, 20], [18, 140]], 'whale', 1.2, 14)} fill="#7D8B90" lift={2} />
        </g>
      )}
      <Band f={waveTop(bands[3].base, bands[3].amp, bands[3].len, bands[3].ph)} fill={bands[3].fill} seed="sea3" lift={3} />
      {f >= 150 && f < 176 &&
        [0, 1, 2, 3, 4].map((i) => {
          const s = (f - 150) / 26;
          return (
            <Cut
              key={i}
              d={cut(ellipsePts(300 + (i - 2) * 40 * (0.5 + s), 1680 - Math.sin(s * Math.PI) * (90 + i * 16), 12, 12, 10), `sp${i}`, 0.6)}
              fill={C.white}
              lift={2}
              edge={0}
            />
          );
        })}
      <Kite x={kx} y={ky} rot={krot} scale={0.75} f={f} tail={1.2} tailDir={-0.8} />
    </Sheet>
  );
};
const io01 = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// ---------------------------------------------------------------- 5. Mountains into the night
export const Night: React.FC<{dur: number}> = ({dur}) => {
  const f = useStep();
  const n = ramp(f, 20, 130);
  const t = f / dur;
  const kx = -180 + t * 1440;
  const ky = 700 + 70 * Math.sin(t * Math.PI * 2) + t * 60;
  const lit = ramp(f, 100, 130);
  return (
    <Sheet>
      <Sky color={mix('#DCC9BF', '#454D5C', n)} />
      {STARS.map((s, i) => {
        const at = 96 + i * 2;
        if (f < at) return null;
        const pop = ramp(f, at, at + 6, 0.2, 1, snap) * (Math.floor((f + i * 3) / 6) % 4 === 0 ? 0.8 : 1);
        return (
          <g key={i} transform={`translate(${s.x} ${s.y}) scale(${pop}) translate(${-s.x} ${-s.y})`}>
            <Star x={s.x} y={s.y} r={s.r} seed={`st${i}`} />
          </g>
        );
      })}
      <g transform={`translate(0 ${lerp(1240, 470, ramp(f, 40, 190))})`}>
        <Cut d={cut(ellipsePts(770, 0, 92, 92), 'moon', 1.4)} fill="#EFE6CF" lift={2} />
        <circle cx={740} cy={-24} r={16} fill="#E0D5BB" />
        <circle cx={800} cy={26} r={11} fill="#E0D5BB" />
        <circle cx={790} cy={-38} r={7} fill="#E0D5BB" />
      </g>
      <g transform={`translate(${-f * 0.5} 0)`}>
        <Range base={1260} peaks={[[80, 420], [360, 540], [640, 380], [900, 600], [1180, 450]]} fill={mix('#C9B6B0', '#5B6372', n)} snow={mix('#F3ECE0', '#C9CCCF', n)} seed="r1" />
      </g>
      <g transform={`translate(${-f * 1.1} 0)`}>
        <Range base={1440} peaks={[[-40, 300], [260, 380], [560, 280], [860, 420], [1180, 320]]} fill={mix('#B3A39F', '#4C5463', n)} seed="r2" lift={2} />
      </g>
      <g transform={`translate(${-f * 2} 0)`}>
        <Range base={1620} peaks={[[100, 220], [420, 300], [760, 240], [1100, 280], [1400, 220]]} fill={mix('#9D8F8D', '#3F4655', n)} seed="r3" lift={2} />
      </g>
      <Kite x={kx} y={ky} rot={10 + Math.sin(f * 0.12) * 10} scale={0.7} f={f} tail={0.9} tailDir={-0.6} />
      <g transform={`translate(${-f * 3.2} 0)`}>
        {[0, 1, 2, 3].map((i) => (
          <House key={i} x={360 + i * 420} base={1800} w={120} h={110} wall={mix('#D8CDB9', '#59606C', n)} roof={mix(C.roof, '#2F3540', n)} seed={`nh${i}`} lit={lit} />
        ))}
        {Array.from({length: 14}, (_, i) => (
          <Pine key={i} x={-40 + i * 130 + (i % 3) * 18} base={1940 - (i % 2) * 30} s={1 + (i % 3) * 0.25} fill={mix('#867B78', '#333A47', n)} seed={`pn${i}`} />
        ))}
      </g>
      <Band f={(x) => 1880 + 14 * Math.sin(x / 80)} fill={mix('#8A7F7B', '#2D333F', n)} seed="nground" lift={3} />
    </Sheet>
  );
};

// ---------------------------------------------------------------- 6. Dawn: the kite comes home
export const CATCH_AT = 150;
export const Dawn: React.FC<{dur: number}> = () => {
  const f = useStep();
  const lookAround = f < 50;
  const flip = lookAround && Math.floor(f / 18) % 2 === 1;
  const armsUp = ramp(f, 108, 124, 0, 1, snap);
  const caught = f >= CATCH_AT;
  const hop = caught && f < CATCH_AT + 40 ? Math.abs(Math.sin((f - CATCH_AT) * 0.24)) * 40 : 0;
  const pose: KidPose = {
    x: 560,
    y: 1700,
    flip,
    armFront: lerp(0, -168, armsUp),
    armBack: lerp(4, -150, armsUp),
    headTilt: lookAround ? -4 : ramp(f, 50, 60, -4, -16),
    expr: f < 88 ? 'worried' : f < CATCH_AT ? 'happy' : 'joy',
    blink: blinkAt(f, 5),
    bob: hop,
  };
  const [hx, hy] = handPos(pose);
  // the kite falls like a leaf, swinging side to side, into the kid's hands
  const p = ramp(f, 46, CATCH_AT, 0, 1, (x) => x);
  const fx = lerp(160, hx, p) + 240 * Math.sin(p * Math.PI * 3) * (1 - p);
  const fy = lerp(-220, hy - 120, Math.pow(p, 0.9));
  const frot = caught ? 0 : 34 * Math.cos(p * Math.PI * 3) * (1 - p);
  const kx = caught ? hx + 4 : fx;
  const ky = caught ? hy - 120 : fy;
  return (
    <Sheet>
      <Town f={f + 400} sky="#F1E4D8" sun={[220, lerp(1120, 760, ramp(f, 0, 200))]} lit={1 - ramp(f, 0, 70)} birdsAt={120}>
        {caught && <Kite x={kx} y={ky} rot={frot} scale={0.62} f={f} tail={0.6} />}
        <Kid {...pose} />
        {f >= 46 && !caught && <Kite x={kx} y={ky} rot={frot} scale={0.62} f={f} tail={1.4} />}
        {caught &&
          [0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 + 0.4;
            const s = ramp(f, CATCH_AT + i, CATCH_AT + 8 + i, 0, 1, snap) * (1 - ramp(f, CATCH_AT + 22, CATCH_AT + 32));
            if (s <= 0) return null;
            const r = 150 + s * 40;
            return <Star key={i} x={kx + Math.cos(a) * r} y={ky - 40 + Math.sin(a) * r} r={18 * s + 2} seed={`sp${i}`} fill={C.white} />;
          })}
      </Town>
    </Sheet>
  );
};

// ---------------------------------------------------------------- 7. End card
export const EndCard: React.FC<{dur: number}> = () => {
  const f = useStep();
  const kite = enter(f, 4, 'top', 900, 18);
  const s1 = enter(f, 10, 'left', 1000, 14);
  const s2 = enter(f, 15, 'right', 1000, 14);
  const s3 = enter(f, 20, 'bottom', 900, 14);
  const s4 = enter(f, 40, 'bottom', 700, 14);
  const hills = enter(f, 0, 'bottom', 500, 16);
  return (
    <Sheet>
      <Sky color={C.paper} />
      <Cut d={cut(burstPts(540, 560, 300, 250, 22, f * 0.004), 'endBurst', 1.6, 18)} fill="#EFE6D6" lift={1} />
      <g transform={`translate(${kite.x} ${kite.y})`}>
        <Kite x={540} y={540} rot={Math.sin(f * 0.12) * 10} scale={0.85} f={f} />
      </g>
      <g transform={`translate(${s1.x} ${s1.y})`}>
        <Strip x={540} y={1010} text="some things always" size={74} font="Caveat" seed="e1" rot={-2} />
      </g>
      <g transform={`translate(${s2.x} ${s2.y})`}>
        <Strip x={540} y={1160} text="find their way" size={108} font="Fraunces" seed="e2" rot={1.5} padX={0.3} />
      </g>
      <g transform={`translate(${s3.x} ${s3.y})`}>
        <Strip x={540} y={1350} text="home" size={200} font="Fraunces" color={C.accent} seed="e3" rot={-2} padX={0.3} lift={3} />
      </g>
      <g transform={`translate(${s4.x} ${s4.y})`}>
        <Strip x={540} y={1560} text="the end" size={58} font="Caveat" seed="e4" rot={3} />
      </g>
      <g transform={`translate(0 ${hills.y})`}>
        <Band f={(x) => 1720 + 40 * Math.sin(x / 150)} fill={C.sage1} seed="eh1" />
        <Band f={(x) => 1810 + 34 * Math.sin(x / 110 + 1)} fill={C.sage2} seed="eh2" lift={2} />
      </g>
    </Sheet>
  );
};

