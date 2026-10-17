// "The Cyclone": every shot, in story order. t = seconds into the shot (on twos), g = film time.
import React from 'react';
import {Shot, Plane, useTw, useT, OZ, mix, rs, W} from './look';
import {Person, Toto, walkCycle, runCycle, blinkAt, Pose} from './human';
import {DOROTHY, DOROTHY_BONNET, EM, HENRY, MUNCH1, MUNCH2, MUNCH3, OLD_WOMAN} from './cast';
import {House, Tornado, KansasSky, Prairie, Horse} from './kansas';
import {ROOM} from './interior';
import {SilverFeet} from './ozland';
import {Farm, Room, Vortex, OzLand, HOUSE, S, E, kf, camKf, mouth} from './scenes';
import {Strip} from '../paperkite/kit';

type SP = {at: number};
const DAY = {day: 1, storm: 0, oz: 0};
const DUSK = {day: 0.55, storm: 0.6, oz: 0};
const DARK = {day: 0.18, storm: 1, oz: 0};
const MORN = {day: 1, storm: 0, oz: 1};
const DOOR_X = HOUSE.x + (18 * HOUSE.ft) / 2; // 458
const GROUND = HOUSE.y + 10;
const BEDY = 752; // feet point for Dorothy lying on her cot
const LIE = 'translate(1580 752) rotate(90)';

// ===== cold open: the house is flying =====
export const S01Flying: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const cam = {x: kf(tc, [[0, -60], [12, 40]]), y: kf(tc, [[0, 160], [12, -40]]), z: kf(tc, [[0, 80], [12, 260]])};
  return (
    <Vortex t={t} cam={cam}>
      <g transform={`translate(960 560) rotate(${Math.sin(t * 0.7) * 10 + t * 6}) translate(-198 -80)`}>
        <House x={0} y={0} ft={22} spin={t * 0.4} noFound paint={0.28} />
      </g>
    </Vortex>
  );
};

export const S02Inside: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const cam = {x: 40, y: 230, z: kf(tc, [[0, 380], [9, 520]])};
  return (
    <Room cam={cam} t={t} L={DARK} tilt={Math.sin(t * 0.9) * 5} shake={2} rattle={1}>
      <Person x={980} y={1010} h={560} look={DOROTHY} t={t} expr="scared" blink={blinkAt(t, 1)} bob={-260} hipF={80} knF={110} hipB={70} knB={120} shF={40} elF={90} shB={30} elB={80} head={8} wind={0.4} />
      <Toto x={1040} y={760} h={70} t={t} sit />
    </Room>
  );
};

// a title strip in the pause after the cold open
export const S02bTitle: React.FC<SP> = () => {
  const t = useTw();
  const o = rs(t, 0, 0.4) * (1 - rs(t, 1.9, 2.3));
  return (
    <Shot cam={{x: 0, y: 0, z: 0}} bg="#14110E">
      <g opacity={o}>
        <Strip x={960} y={500} text="The Cyclone" size={110} font="Fraunces" seed="title" />
        <Strip x={960} y={640} text="The Wonderful Wizard of Oz · Chapter One" size={44} font="Caveat" seed="sub" lift={1} />
      </g>
    </Shot>
  );
};

// ===== Kansas, before =====
export const S03Still: React.FC<SP> = () => {
  const t = useTw();
  return <Farm cam={{x: 120, y: -20, z: 60}} t={t} still />;
};

export const S04Farm: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const cam = {x: kf(tc, [[0, -260], [12, 120]]), y: -10, z: 120};
  const plow = walkCycle(t, 0.7, 0.9);
  return (
    <Farm
      cam={cam}
      t={t}
      mid={
        <g>
          <Horse x={1000 + t * 6} y={702} ft={12} t={t} walk={1} col="#6B4A34" />
          <Person x={860 + t * 6} y={702} h={70} look={HENRY} t={t} {...plow} shF={40} elF={30} shB={36} elB={30} lean={14} />
        </g>
      }
      near={<Person x={760} y={GROUND + 30} h={150} look={EM} t={t} shF={50} elF={70} shB={40} elB={70} lean={12} expr="stern" />}
    />
  );
};

export const S05Room: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const cam = {x: kf(tc, [[0, 0], [15, 0]]), y: kf(tc, [[0, -40], [15, 300]]), z: kf(tc, [[0, 0], [15, 420]])};
  return <Room cam={cam} t={t} L={DAY} />;
};

export const S06Doorway: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const cam = {x: DOOR_X - 960 + 20, y: kf(tc, [[0, 210], [8, 190]]), z: kf(tc, [[0, 640], [8, 700]])};
  return (
    <Farm
      cam={cam}
      t={t}
      doorOpen={1}
      near={<Person x={DOOR_X + 4} y={HOUSE.y - 30} h={98} look={DOROTHY} t={t} expr="calm" blink={blinkAt(t)} head={-4} shF={10} shB={-10} />}
    />
  );
};

// What she sees: nothing but gray prairie on every side. Slow pan, no tree, no house.
export const S07Prairie: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return (
    <Shot cam={{x: kf(tc, [[0, -500], [10, 500]]), y: 0, z: 0}}>
      <Plane d={4000}>
        <KansasSky t={t} />
      </Plane>
      <Plane d={1000}>
        <Prairie horizon={600} t={t} seed="pov" />
      </Plane>
    </Shot>
  );
};

export const S08Cracks: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return (
    <Shot cam={{x: kf(tc, [[0, -200], [9, 200]]), y: 300, z: kf(tc, [[0, 500], [9, 560]])}}>
      <Plane d={4000}>
        <KansasSky t={t} />
      </Plane>
      <Plane d={1000}>
        <Prairie horizon={520} t={t} seed="crk" />
      </Plane>
    </Shot>
  );
};

export const S09Paint: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return (
    <Farm cam={{x: kf(tc, [[0, -700], [12, -470]]), y: 160, z: kf(tc, [[0, 640], [12, 600]])}} t={t} />
  );
};

// ===== Aunt Em =====
const EmAtTub: React.FC<{t: number; expr: Pose['expr']; startle?: number; talk?: number; x?: number}> = ({t, expr, startle = 0, talk = 0, x = 820}) => (
  <g>
    {/* galvanized washtub on a bench */}
    <rect x={x + 30} y={GROUND - 40} width={110} height={8} fill="#5E4C3A" />
    <path d={`M${x + 34} ${GROUND - 70} L${x + 136} ${GROUND - 70} L${x + 128} ${GROUND - 40} L${x + 42} ${GROUND - 40} Z`} fill="#9AA0A3" />
    <Person
      x={x}
      y={GROUND + 6}
      h={150}
      look={EM}
      t={t}
      expr={expr}
      talk={talk}
      blink={blinkAt(t, 2)}
      lean={startle ? -4 * startle : 18}
      shF={startle ? kf(startle, [[0, 50], [1, 150]]) : 50 + Math.sin(t * 5) * 8}
      elF={startle ? kf(startle, [[0, 60], [1, 130]]) : 60}
      shB={40 + Math.sin(t * 5 + 1) * 8}
      elB={60}
      head={startle ? -8 * startle : 10}
    />
  </g>
);

export const S10Em: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return <Farm cam={{x: kf(tc, [[0, -60], [14, -30]]), y: 190, z: kf(tc, [[0, 640], [14, 700]])}} t={t} near={<EmAtTub t={t} expr="stern" />} />;
};

export const S11Startle: React.FC<SP> = () => {
  const t = useTw();
  const st = rs(t, 3.5, 4.2);
  return (
    <Farm
      cam={{x: -70, y: 180, z: 620}}
      t={t}
      near={
        <g>
          <EmAtTub t={t} expr={st > 0.5 ? 'scared' : 'stern'} startle={st} />
          <Person x={700 + rs(t, 0, 3) * 40} y={GROUND + 14} h={100} look={DOROTHY} t={t} expr="smile" talk={t > 3.2 && t < 5 ? 0.6 + Math.sin(t * 20) * 0.3 : 0} {...walkCycle(t, 1.2)} />
          <Toto x={650 + rs(t, 0, 3) * 50} y={GROUND + 16} h={20} t={t} run={t < 3 ? 1 : 0} />
        </g>
      }
    />
  );
};

export const S12EmSpeaks: React.FC<SP> = ({at}) => {
  const t = useTw();
  const g = at + t;
  return (
    <Farm
      cam={{x: -110, y: 190, z: kf(useT(), [[0, 760], [6, 790]])}}
      t={t}
      near={<EmAtTub t={t} expr="sad" talk={mouth(8, g)} startle={0.2} />}
    />
  );
};

// ===== Uncle Henry =====
export const S13Henry: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const plow = walkCycle(t, 0.7, 0.9);
  const hx = 520 + t * 10;
  return (
    <Shot cam={{x: kf(tc, [[0, -300], [16, -120]]), y: kf(tc, [[0, 40], [16, 170]]), z: kf(tc, [[0, 200], [16, 560]])}}>
      <Plane d={4000}>
        <KansasSky t={t} />
      </Plane>
      <Plane d={1000}>
        <Prairie horizon={600} t={t} seed="field" />
        <Horse x={hx + 400} y={822} ft={42} t={t} walk={1} col="#6B4A34" />
        {/* walking plow: beam and handles */}
        <path d={`M${hx + 60} ${716} L${hx + 120} ${808} L${hx + 200} ${822} M${hx + 140} ${790} L${hx + 250} ${760}`} stroke="#4A3A2A" strokeWidth={7} fill="none" />
        <path d={`M${hx + 120} ${808} L${hx + 170} ${826} L${hx + 210} ${816}`} fill="#7A7E80" stroke="#4A4E50" strokeWidth={3} />
        <Person x={hx} y={826} h={240} look={HENRY} t={t} {...plow} shF={50} elF={30} shB={46} elB={30} lean={16} expr="stern" blink={blinkAt(t, 1)} />
      </Plane>
    </Shot>
  );
};

// ===== Toto =====
export const S14Toto: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const chase = t < 13;
  const dx = Math.sin(t * 1.1) * 140;
  const close = rs(tc, 12.5, 15);
  return (
    <Farm
      cam={{x: kf(tc, [[0, 80], [12, 60], [15, 186]]), y: kf(tc, [[0, 200], [15, 270]]), z: kf(tc, [[0, 560], [12, 600], [15, 900]])}}
      t={t}
      near={
        <g>
          <Person x={1000 + dx} y={GROUND + 30} h={100} flip={Math.cos(t * 1.1) < 0} look={DOROTHY} t={t} expr="smile" talk={chase ? 0.4 + Math.sin(t * 17) * 0.3 : 0} {...(chase ? runCycle(t, 0.9) : {})} wind={0.2} />
          <Toto x={1080 + Math.sin(t * 1.1 - 0.5) * 160} y={GROUND + 34} h={22} t={t} run={chase ? 1 : 0} flip={Math.cos(t * 1.1 - 0.5) < 0} bark={close > 0 ? 0 : Math.max(0, Math.sin(t * 6))} />
        </g>
      }
    />
  );
};

export const S15NotPlaying: React.FC<SP> = () => {
  const t = useTw();
  return (
    <Farm
      cam={{x: 160, y: 190, z: kf(useT(), [[0, 700], [4, 740]])}}
      t={t}
      storm={0.25}
      wind={0.3}
      near={
        <g>
          <Person x={1110} y={GROUND + 30} h={100} look={DOROTHY} t={t} expr="worried" head={-14} shF={60} elF={80} shB={50} elB={90} blink={blinkAt(t)} wind={0.3} />
          <Toto x={1124} y={GROUND - 22} h={18} t={t} sit />
        </g>
      }
    />
  );
};

// ===== the storm comes =====
export const S16HenrySky: React.FC<SP> = () => {
  const t = useTw();
  return (
    <Farm
      cam={{x: DOOR_X - 960 + 40, y: 220, z: kf(useT(), [[0, 700], [8, 760]])}}
      t={t}
      storm={0.45}
      wind={0.4}
      near={<Person x={DOOR_X + 30} y={HOUSE.y + 34} h={150} look={HENRY} t={t} expr="worried" bob={-58} hipF={84} knF={86} hipB={80} knB={90} shF={30} elF={60} head={-18} blink={blinkAt(t)} />}
    />
  );
};

export const S17North: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return <Farm cam={{x: kf(tc, [[0, 400], [7, 300]]), y: 40, z: 200}} t={t} storm={0.6} wind={rs(tc, 0, 3)} windDir={1} />;
};

export const S18South: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return <Farm cam={{x: kf(tc, [[0, 300], [8, 380]]), y: 20, z: 160}} t={t} storm={0.75} wind={1} windDir={Math.sin(tc * 1.4) > 0 ? -1 : 1} tornado={{x: 1650, w: kf(tc, [[0, 30], [8, 120]]), h: 520, debris: rs(tc, 3, 8)}} />;
};

export const S19HenryStands: React.FC<SP> = ({at}) => {
  const t = useTw();
  const g = at + t;
  const up = rs(t, 0, 1.2);
  return (
    <Farm
      cam={{x: DOOR_X - 960 + 40, y: 200, z: 760}}
      t={t}
      storm={0.8}
      wind={0.9}
      tornado={{x: 1600, w: 140, h: 520}}
      near={
        <Person
          x={DOOR_X + 30 + up * 20}
          y={HOUSE.y + 34 + up * 6}
          h={150}
          look={HENRY}
          t={t}
          flip={t > 2.3}
          expr={mouth(14, g) > 0.05 ? 'scared' : 'worried'}
          talk={mouth(14, g)}
          bob={-58 * (1 - up)}
          hipF={84 * (1 - up)}
          knF={86 * (1 - up)}
          hipB={80 * (1 - up)}
          knB={90 * (1 - up)}
          shF={t > 2.3 ? 120 : 20}
          elF={t > 2.3 ? 40 : 30}
          head={-10}
          wind={0.9}
        />
      }
    />
  );
};

export const S20HenryRuns: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return (
    <Farm
      cam={{x: kf(tc, [[0, 0], [5, 300]]), y: 60, z: 260}}
      t={t}
      storm={0.85}
      wind={1}
      rear={1}
      tornado={{x: 1500, w: 170, h: 520}}
      shake={1}
      near={<Person x={700 + t * 120} y={GROUND + 20} h={150} look={HENRY} t={t} {...runCycle(t)} expr="scared" wind={1} />}
    />
  );
};

export const S21EmDoor: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const step = rs(t, 0, 1.4);
  return (
    <Farm
      cam={{x: kf(tc, [[0, DOOR_X - 960], [5, DOOR_X - 900]]), y: kf(tc, [[0, 180], [5, 120]]), z: kf(tc, [[0, 700], [5, 620]])}}
      t={t}
      storm={0.9}
      wind={1}
      doorOpen={1}
      tornado={{x: 1350, w: 200, h: 540}}
      near={<Person x={DOOR_X + step * 10} y={HOUSE.y - 30} h={150} look={EM} t={t} expr={t > 2 ? 'scared' : 'worried'} head={-10} shF={t > 2 ? 60 : 10} elF={t > 2 ? 100 : 10} wind={0.8} blink={blinkAt(t)} />}
    />
  );
};

export const S22EmScreams: React.FC<SP> = ({at}) => {
  const t = useTw();
  const g = at + t;
  return (
    <Farm
      cam={{x: DOOR_X - 960 - 10, y: 150, z: 760}}
      t={t}
      storm={0.95}
      wind={1}
      doorOpen={1}
      shake={2}
      tornado={{x: 1300, w: 220, h: 540}}
      near={<Person x={DOOR_X} y={HOUSE.y - 30} h={150} look={EM} t={t} expr="scared" talk={mouth(16, g)} shF={130} elF={60} shB={20} lean={-4} wind={1} />}
    />
  );
};

// ===== inside: Toto hides, the trapdoor =====
export const S23TotoHides: React.FC<SP> = () => {
  const t = useTw();
  const jump = rs(t, 0.6, 1.2);
  const run = rs(t, 1.2, 3.2);
  return (
    <Room cam={{x: 120, y: 200, z: 260}} t={t} L={DUSK} rattle={0.3}>
      <Person x={900} y={1000} h={480} look={DOROTHY} t={t} expr={jump > 0.5 ? 'scared' : 'worried'} shF={jump > 0.5 ? 70 : 50} elF={jump > 0.5 ? 20 : 90} shB={40} elB={90} blink={blinkAt(t)} />
      {run < 1 && <Toto x={930 + jump * 120 + run * 760} y={jump < 1 ? 760 - Math.sin(jump * Math.PI) * 120 + jump * 200 : 960} h={60} t={t} run={run > 0 ? 1 : 0} />}
    </Room>
  );
};

export const S24DorothyCalls: React.FC<SP> = ({at}) => {
  const t = useTw();
  const g = at + t;
  return (
    <Room cam={{x: 320, y: 240, z: 420}} t={t} L={DUSK} rattle={0.4}>
      <Person x={1300} y={1080} h={460} look={DOROTHY} t={t} expr="scared" talk={mouth(18, g)} bob={-150} hipF={80} knF={120} hipB={60} knB={110} lean={30} shF={70} elF={10} shB={50} elB={20} wind={0.2} />
      <g transform="translate(1700 1150)">
        <circle cx={0} cy={0} r={4} fill="#E9E1D4" />
      </g>
    </Room>
  );
};

export const S25Trapdoor: React.FC<SP> = () => {
  const t = useTw();
  const open = rs(t, 0.4, 1.4);
  const down = rs(t, 1.8, 5);
  const catchT = rs(t, 6, 8);
  return (
    <Room cam={{x: 0, y: 260, z: 300}} t={t} L={DUSK} trap={open} rattle={0.5}>
      {down < 1 && <Person x={960 + 10} y={940 + down * 520} h={560} look={EM} t={t} expr="scared" shF={30} elF={60} lean={20 - down * 20} />}
      <Person x={1400 - catchT * 260} y={1010} h={470} look={DOROTHY} t={t} flip expr="worried" bob={-140 * (1 - catchT)} hipF={70 * (1 - catchT)} knF={100 * (1 - catchT)} shF={60 + catchT * 20} elF={40 + catchT * 50} shB={50} elB={80} />
      {catchT > 0.6 && <Toto x={1220 - catchT * 240} y={790} h={56} t={t} flip sit />}
    </Room>
  );
};

export const S26Halfway: React.FC<SP> = () => {
  const t = useTw();
  const walk = rs(t, 0, 3);
  return (
    <Room cam={{x: 0, y: 220, z: 280}} t={t} L={DUSK} trap={1} rattle={rs(t, 2.6, 3.2)} shake={t > 2.8 ? 3 : 0.5}>
      <Person x={1300 - walk * 220} y={1000} h={470} flip look={DOROTHY} t={t} expr={t > 2.8 ? 'scared' : 'worried'} {...walkCycle(t, 1.3)} shF={70} elF={90} shB={60} elB={90} wind={t > 2.8 ? 0.6 : 0} />
      <Toto x={1240 - walk * 220} y={800} h={52} t={t} flip sit />
    </Room>
  );
};

export const S27Falls: React.FC<SP> = () => {
  const t = useTw();
  const fall = rs(t, 0.2, 0.9);
  return (
    <Room cam={{x: -40, y: 320, z: 460}} t={t} L={DUSK} trap={1} rattle={1} shake={6 - t} tilt={Math.sin(t * 7) * 2 * (1 - rs(t, 2, 5))}>
      <Person x={1060} y={1020 + fall * 30} h={470} flip look={DOROTHY} t={t} expr="scared" bob={-220 * fall} hipF={90 * fall} knF={40 * fall} hipB={90 * fall} knB={60 * fall} lean={-10 * fall} shF={70 + fall * 40} elF={60} shB={70} elB={80} wind={0.6} />
      <Toto x={1000} y={830 + fall * 160} h={52} t={t} flip sit />
    </Room>
  );
};

export const S28Strange: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return (
    <Room cam={{x: 70, y: 220, z: kf(tc, [[0, 640], [5, 720]])}} t={t} L={DUSK} trap={1} tilt={Math.sin(t * 0.8) * 2}>
      <Person x={1060} y={1050} h={470} flip look={DOROTHY} t={t} expr="amazed" bob={-220} hipF={90} knF={40} hipB={90} knB={60} lean={-10} shF={60} elF={80} shB={60} elB={80} blink={blinkAt(t, 1.2)} head={-10} />
      <Toto x={1000} y={990} h={52} t={t} flip sit />
    </Room>
  );
};

// ===== up into the cyclone =====
export const S29Lift: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const rise = rs(tc, 1.5, 9, 0, 1);
  const spin = t * 1.6;
  return (
    <Shot cam={{x: 0, y: kf(tc, [[0, 0], [9, -260]]), z: 0}} shake={3 * (1 - rise)}>
      <Plane d={4000}>
        <KansasSky storm={1} t={t} />
      </Plane>
      <Plane d={1600}>
        <Prairie horizon={620} t={t} wind={1} tint={0.8} seed="lift" />
      </Plane>
      <Plane d={1300}>
        <Tornado x={960} y={760} w={520} h={900} t={t} />
      </Plane>
      <Plane d={1000}>
        <g transform={`translate(960 ${780 - rise * 520}) rotate(${Math.sin(spin) * 8}) translate(-198 -60)`}>
          <House x={0} y={0} ft={22} spin={spin} noFound={rise > 0.05} paint={0.28} />
        </g>
      </Plane>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#1E2A26" opacity={0.25} />
    </Shot>
  );
};

export const S30Center: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return (
    <Vortex t={t} cam={{x: 0, y: kf(tc, [[0, 200], [14, -100]]), z: kf(tc, [[0, -200], [14, 100]])}}>
      <g transform={`translate(960 ${640 - tc * 14}) rotate(${Math.sin(t * 0.5) * 6}) translate(-198 -80)`}>
        <House x={0} y={0} ft={22} spin={t * 0.3} noFound paint={0.28} />
      </g>
    </Vortex>
  );
};

export const S31Top: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return (
    <Shot cam={{x: kf(tc, [[0, -300], [14, 300]]), y: 0, z: 0}} bg="#2B3330">
      <Plane d={4000}>
        <rect x={-2000} y={-2000} width={6000} height={5000} fill="#2E3834" />
      </Plane>
      <Plane d={2000}>
        {Array.from({length: 7}, (_, i) => (
          <ellipse key={i} cx={-600 + i * 520 + Math.sin(t * 0.3 + i) * 40} cy={820 + (i % 2) * 50} rx={420} ry={140} fill={mix('#3A4540', '#556660', (i % 3) / 3)} />
        ))}
      </Plane>
      <Plane d={1000}>
        {/* the house, carried as easily as a feather */}
        <g transform={`translate(${760 + tc * 26} ${420 + Math.sin(t * 0.8) * 30}) rotate(${Math.sin(t * 0.6) * 8}) scale(0.6) translate(-198 -80)`}>
          <House x={0} y={0} ft={22} spin={1.2 + Math.sin(t * 0.4) * 0.5} noFound paint={0.28} />
        </g>
      </Plane>
      <Plane d={800}>
        {Array.from({length: 5}, (_, i) => (
          <ellipse key={i} cx={-400 + i * 700 - tc * 30} cy={1000} rx={500} ry={160} fill="#26302C" />
        ))}
      </Plane>
    </Shot>
  );
};

export const S32Rocked: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const rock = Math.sin(t * 0.9) * 4;
  return (
    <Room cam={{x: 60, y: 260, z: kf(tc, [[0, 300], [15, 420]])}} t={t} L={DARK} trap={1} tilt={rock} rattle={0.15} lamp={0.4}>
      <Person x={1060} y={1050} h={470} flip look={DOROTHY} t={t} expr={tc > 8 ? 'calm' : 'worried'} bob={-220} hipF={90} knF={40} hipB={90} knB={60} lean={-10 - rock} shF={60} elF={90} shB={60} elB={90} blink={blinkAt(t)} head={-rock} />
      <Toto x={1000} y={990} h={52} t={t} flip sit />
    </Room>
  );
};

export const S33TotoFalls: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const fallT = 9.2;
  const px = 700 + Math.sin(t * 0.9) * 400;
  const x = t < fallT - 1.5 ? px : kf(t, [[fallT - 1.5, 700 + Math.sin((fallT - 1.5) * 0.9) * 400], [fallT, 960]]);
  const fell = t > fallT;
  return (
    <Room cam={{x: kf(tc, [[0, -60], [10, 0]]), y: kf(tc, [[0, 220], [10, 320]]), z: kf(tc, [[0, 260], [10, 480]])}} t={t} L={DARK} trap={1} tilt={Math.sin(t * 0.9) * 3} lamp={0.4}>
      {!fell && <Toto x={x} y={930 + (t > fallT - 0.4 ? (t - fallT + 0.4) * 120 : 0)} h={58} t={t} run={1} flip={Math.cos(t * 0.9) < 0} bark={Math.max(0, Math.sin(t * 7))} />}
      <Person x={1260} y={1050} h={470} flip look={DOROTHY} t={t} expr={fell ? 'scared' : 'worried'} bob={-220} hipF={90} knF={40} hipB={90} knB={60} shF={fell ? 100 : 40} elF={20} blink={blinkAt(t)} />
    </Room>
  );
};

export const S34TotoCry: React.FC<SP> = ({at}) => {
  const t = useTw();
  const g = at + t;
  return (
    <Room cam={{x: 260, y: 220, z: 560}} t={t} L={DARK} trap={1} tilt={Math.sin(t * 0.9) * 3} lamp={0.4}>
      <Person x={1260} y={1050} h={470} flip look={DOROTHY} t={t} expr="scared" talk={mouth(27, g)} bob={-220} hipF={90} knF={40} hipB={90} knB={60} shF={110} elF={20} lean={-6} />
    </Room>
  );
};

export const S35Ear: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return (
    <Room cam={{x: 0, y: kf(tc, [[0, 330], [12, 360]]), z: kf(tc, [[0, 620], [12, 700]])}} t={t} L={DARK} trap={1} earUp={rs(t, 1, 3)} tilt={Math.sin(t * 0.9) * 2} lamp={0.4} />
  );
};

export const S36Rescue: React.FC<SP> = () => {
  const t = useTw();
  const crawl = rs(t, 0, 3);
  const pull = rs(t, 3.5, 5.5);
  const close = rs(t, 7, 8.5);
  return (
    <Room cam={{x: 0, y: 300, z: 480}} t={t} L={DARK} trap={1 - close} earUp={1 - pull} tilt={Math.sin(t * 0.9) * 2} lamp={0.4}>
      <Person x={1260 - crawl * 160} y={1040} h={470} flip look={DOROTHY} t={t} expr={pull > 0.9 ? 'smile' : 'worried'} bob={-250} hipF={100} knF={120} hipB={95} knB={120} lean={50} shF={80 + pull * 40} elF={20} shB={70} elB={20} />
      {pull > 0 && <Toto x={960 + pull * 100} y={950 - pull * 60} h={56} t={t} sit flip />}
    </Room>
  );
};

export const S37Lonely: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  return (
    <Room cam={{x: 0, y: 140, z: kf(tc, [[0, 140], [14, 60]])}} t={t} L={{day: kf(tc, [[0, 0.18], [14, 0.08]]), storm: 1, oz: 0}} tilt={Math.sin(t * 0.7) * 2.5} lamp={0.5}>
      <Person x={1100} y={1050} h={470} flip look={DOROTHY} t={t} expr="sad" bob={-220} hipF={90} knF={40} hipB={90} knB={60} shF={60} elF={100} shB={60} elB={100} blink={blinkAt(t)} head={14} />
      <Toto x={1040} y={990} h={52} t={t} flip sit />
    </Room>
  );
};

export const S38Whisper: React.FC<SP> = ({at}) => {
  const t = useTw();
  const g = at + t;
  const lick = g > S(31);
  return (
    <Room cam={{x: 150, y: 250, z: 760}} t={t} L={DARK} tilt={Math.sin(t * 0.7) * 2} lamp={0.6}>
      <Person x={1100} y={1050} h={470} flip look={DOROTHY} t={t} expr={lick ? 'smile' : 'scared'} talk={mouth(30, g) * 0.5} bob={-220} hipF={90} knF={40} hipB={90} knB={60} shF={60} elF={100} shB={60} elB={100} blink={blinkAt(t)} head={18} />
      <Toto x={1040} y={990} h={52} t={t} flip sit bark={lick ? Math.max(0, Math.sin(t * 9)) * 0.5 : 0} />
    </Room>
  );
};

export const S39Sleep: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const crawl = rs(t, 0, 5);
  const lie = rs(t, 5.5, 8);
  const asleep = t > 14;
  const dim = kf(tc, [[0, 0.18], [18, 0.04]]);
  return (
    <Room cam={{x: kf(tc, [[0, 400], [18, 800]]), y: kf(tc, [[0, 240], [18, 230]]), z: kf(tc, [[0, 300], [18, 460]])}} t={t} L={{day: dim, storm: 1, oz: 0}} tilt={Math.sin(t * 0.7) * 2} lamp={0.3 * (1 - rs(tc, 14, 18))} bedFront={lie < 0.5}>
      {lie < 0.5 ? (
        <Person x={1100 + crawl * 280} y={1050} h={470} look={DOROTHY} t={t} expr="calm" bob={-250} hipF={100} knF={120} hipB={95} knB={120} lean={50} shF={80 + Math.sin(t * 3) * 20} elF={20} shB={70 - Math.sin(t * 3) * 20} elB={20} />
      ) : (
        <g transform={LIE}>
          <Person x={0} y={0} h={440} flip look={DOROTHY} t={t} expr={asleep ? 'asleep' : 'calm'} blink={t > 11 && !asleep ? Math.sin(t * 3) > 0 : false} shadow={0} shF={-6} elF={30} />
        </g>
      )}
      {lie > 0.5 && <Toto x={1440} y={BEDY + 10} h={50} t={t} sit />}
    </Room>
  );
};

// ===== landing =====
export const S40Shock: React.FC<SP> = () => {
  const t = useTw();
  const hit = t > 0.3;
  return (
    <Room cam={{x: 800, y: 230, z: 430}} t={t} L={{day: hit ? 0.25 : 0.05, storm: 1, oz: 0}} shake={hit ? Math.max(0, 14 - t * 10) : 0} rattle={hit ? Math.max(0, 1 - t * 0.6) : 0}>
      <g transform={`translate(1580 ${BEDY - (hit && t < 0.6 ? 20 : 0)}) rotate(90)`}>
        <Person x={0} y={0} h={440} flip look={DOROTHY} t={t} expr={hit ? 'scared' : 'asleep'} shadow={0} shF={hit ? 30 : -6} elF={30} />
      </g>
    </Room>
  );
};

export const S41Silence: React.FC<SP> = () => {
  const t = useTw();
  return (
    <Room cam={{x: 800, y: 230, z: 430}} t={t} L={{day: 0.25, storm: 0, oz: 0}} winLight={0}>
      <g transform={LIE}>
        <Person x={0} y={0} h={440} flip look={DOROTHY} t={t} expr="worried" shadow={0} shF={-6} elF={30} blink={blinkAt(t)} />
      </g>
    </Room>
  );
};

export const S42Sunshine: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const sit = rs(t, 0.5, 2.5);
  const sun = rs(tc, 8, 12);
  return (
    <Room cam={{x: kf(tc, [[0, 800], [15, 640]]), y: kf(tc, [[0, 230], [15, 200]]), z: kf(tc, [[0, 430], [15, 340]])}} t={t} L={{day: 0.25 + sun * 0.75, storm: 0, oz: sun}} winLight={sun}>
      {sit < 1 ? (
        <g transform={`translate(1580 ${BEDY}) rotate(${90 - sit * 90})`}>
          <Person x={0} y={0} h={440} flip look={DOROTHY} t={t} expr="worried" shadow={0} shF={-6} elF={30} />
        </g>
      ) : (
        <Person x={1500} y={BEDY + 110} h={440} flip look={DOROTHY} t={t} expr={sun > 0.5 ? 'amazed' : 'calm'} bob={-200} hipF={90} knF={90} hipB={90} knB={90} shF={20} elF={40} head={sun > 0.3 ? -16 : 0} blink={blinkAt(t)} />
      )}
      <Toto x={1430} y={BEDY + 10} h={50} t={t} flip sit bark={t > 3 && t < 5 ? 0.4 : 0} />
    </Room>
  );
};

export const S43Door: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const run = rs(t, 0.3, 3.2);
  const open = rs(t, 3.4, 4.6);
  const doorX = ROOM.BX0 + 3 * ROOM.FT + 60;
  return (
    <Room cam={{x: kf(tc, [[0, 0], [5, -560]]), y: 120, z: kf(tc, [[0, 160], [5, 360]])}} t={t} L={MORN} door={open}>
      <Person x={kf(run, [[0, 1300], [1, doorX + 40]])} y={kf(run, [[0, 960], [1, 800]])} h={kf(run, [[0, 470], [1, 400]])} flip look={DOROTHY} t={t} expr="calm" {...(run > 0 && run < 1 ? runCycle(t) : {shF: open > 0 ? 100 : 10, elF: 20})} />
      <Toto x={kf(run, [[0, 1400], [1, doorX + 120]])} y={kf(run, [[0, 970], [1, 806]])} h={kf(run, [[0, 50], [1, 42]])} t={t} flip run={run > 0 && run < 1 ? 1 : 0} />
      {/* colour floods through the open door */}
      {open > 0 && <rect x={-400} y={-400} width={2800} height={1900} fill="#FFF1C2" opacity={open * 0.18} style={{mixBlendMode: 'screen'}} />}
    </Room>
  );
};

export const S44Amazed: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const eyes = rs(tc, 1, 6);
  return (
    <OzLand cam={{x: -790, y: kf(tc, [[0, 250], [8, 230]]), z: kf(tc, [[0, 600], [8, 700]])}} t={t}>
      <House x={-80} y={900} ft={26} paint={0.28} doorOpen={1} />
      <Person x={155} y={858} h={170} flip={false} look={DOROTHY} t={t} expr="amazed" talk={tc < 1.5 ? 0.6 : 0} shF={20 + eyes * 30} elF={60} shB={10} head={-4 - eyes * 6} blink={blinkAt(t)} />
    </OzLand>
  );
};

// Five views of Munchkin country for the long description.
export const S45Oz: React.FC<SP & {view: number}> = ({view}) => {
  const t = useTw();
  const tc = useT();
  const V = [
    {x: [-400, 200], y: [0, -20], z: [0, 40]}, // the whole country, from behind Dorothy
    {x: [-700, -300], y: [-40, 40], z: [300, 420]}, // patches of grass and fruit trees
    {x: [300, 700], y: [160, 220], z: [520, 560]}, // banks of gorgeous flowers
    {x: [-100, 400], y: [-260, -200], z: [200, 260]}, // birds in the trees
    {x: [0, 500], y: [120, 160], z: [380, 460]}, // the brook
  ][view];
  return (
    <OzLand cam={{x: kf(tc, [[0, V.x[0]], [10, V.x[1]]]), y: kf(tc, [[0, V.y[0]], [10, V.y[1]]]), z: kf(tc, [[0, V.z[0]], [10, V.z[1]]])}} t={t} birds={view === 3 ? 2 : 1}>
      {view === 0 && (
        <g>
          <House x={-120} y={900} ft={26} paint={0.28} doorOpen={1} />
          <Person x={130} y={900} h={170} look={DOROTHY} t={t} expr="amazed" shF={20} shB={10} head={-6} />
          <Toto x={220} y={905} h={38} t={t} sit />
        </g>
      )}
    </OzLand>
  );
};

const munchWalk = (t: number, k: number, i: number) => (k < 1 ? walkCycle(t + i * 0.3, 1.1, 0.8) : {});
export const S46Munchkins: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const k = rs(t, 0, 22);
  const group = [
    {c: MUNCH1, dx: 0},
    {c: OLD_WOMAN, dx: 70},
    {c: MUNCH2, dx: 140},
    {c: MUNCH3, dx: 210},
  ];
  return (
    <OzLand cam={{x: kf(tc, [[0, 700], [24, 300]]), y: kf(tc, [[0, 0], [24, 120]]), z: kf(tc, [[0, 160], [24, 420]])}} t={t}>
      {group.map((m, i) => (
        <Person key={i} x={1900 - k * 900 + m.dx} y={900 + (i % 2) * 8} h={150 + k * 40} flip look={m.c} t={t} expr="smile" {...munchWalk(t, k, i)} blink={blinkAt(t, i)} />
      ))}
    </OzLand>
  );
};

export const S47Bow: React.FC<SP> = () => {
  const t = useTw();
  const bow = rs(t, 2, 3.5) * (1 - rs(t, 4.6, 5.4));
  return (
    <OzLand cam={{x: 140, y: 180, z: 520}} t={t}>
      <House x={-120} y={900} ft={26} paint={0.28} doorOpen={1} />
      <Person x={660} y={910} h={190} look={DOROTHY} t={t} expr="amazed" shF={10} blink={blinkAt(t)} />
      <Toto x={720} y={914} h={38} t={t} sit />
      <Person x={1000} y={910} h={190} flip look={MUNCH1} t={t} expr="smile" blink={blinkAt(t, 1)} />
      <Person x={1150} y={914} h={186} flip look={MUNCH2} t={t} expr="smile" blink={blinkAt(t, 2)} />
      <Person x={1260} y={906} h={190} flip look={MUNCH3} t={t} expr="smile" blink={blinkAt(t, 3)} />
      <Person x={860} y={916} h={186} flip look={OLD_WOMAN} t={t} expr="smile" lean={bow * 50} head={bow * 20} shF={bow * 40} blink={blinkAt(t, 0.5)} />
    </OzLand>
  );
};

export const S48Welcome: React.FC<SP> = ({at}) => {
  const t = useTw();
  const g = at + t;
  return (
    <OzLand cam={{x: kf(useT(), [[0, -20], [11, -50]]), y: 280, z: 700}} t={t}>
      <Person x={1000} y={910} h={190} flip look={MUNCH1} t={t} expr="smile" blink={blinkAt(t, 1)} />
      <Person x={860} y={916} h={186} flip look={OLD_WOMAN} t={t} expr="smile" talk={mouth(41, g)} shF={30 + Math.sin(t * 1.4) * 10} elF={60} blink={blinkAt(t, 0.5)} />
    </OzLand>
  );
};

export const S49LooksBehind: React.FC<SP> = () => {
  const t = useTw();
  const turn = t > 0.6;
  return (
    <OzLand cam={{x: -230, y: 240, z: 780}} t={t}>
      <House x={-120} y={900} ft={26} paint={0.28} doorOpen={1} />
      <Person x={660} y={910} h={190} flip={turn} look={DOROTHY} t={t} expr="worried" head={turn ? 8 : 0} blink={blinkAt(t)} />
    </OzLand>
  );
};

export const S50Feet: React.FC<SP> = () => {
  const t = useTw();
  const tc = useT();
  const shine = rs(tc, 4.5, 5.2) * (1 - rs(tc, 7, 9));
  const card = rs(tc, 9.5, 10.5);
  return (
    <>
      <OzLand cam={{x: kf(tc, [[0, -560], [5, -610]]), y: kf(tc, [[0, 150], [5, 330]]), z: kf(tc, [[0, 500], [5, 780]])}} t={t} birds={0}>
        <SilverFeet x={330} y={895} s={0.42} t={t} shine={shine} />
        <House x={-120} y={900} ft={26} paint={0.28} doorOpen={1} />
      </OzLand>
      {card > 0 && (
        <Shot cam={{x: 0, y: 0, z: 0}} bg="transparent">
          <rect x={0} y={0} width={W} height={1080} fill="#14110E" opacity={card} />
          <g opacity={rs(tc, 10.5, 11.3)}>
            <Strip x={960} y={540} text="To be continued" size={84} font="Fraunces" seed="tbc" />
          </g>
        </Shot>
      )}
    </>
  );
};

export {S, E};
