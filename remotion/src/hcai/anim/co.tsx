// Cold open: the two scenes that were still photos, now animated like the rest.
import React from 'react';
import {AnimProps, P, at, ease} from './akit';
import {Bg, Cam, Caption, DataCentre, House, Label, PowerPlant, Pop, Put, World} from './lib';

const iso = (x: number, y: number): [number, number] => [960 + (x - y) * 0.87, 260 + (x + y) * 0.5];

/* 0:18 "It didn't come out of the air. It came from somewhere like this." A data-centre campus from the air. */
export const CoCampus: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  return (
    <Bg c="#8FD16B" c2="#5DBB4F" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 520, 0.7, 0, 0], [21.0, 960, 560, 1.05, 0, 0], [24.2, 1060, 560, 1.25, 0, 0]]}>
        <World>
          {/* roads */}
          {[200, 520, 840].map((y) => {
            const a = iso(-300, y), b = iso(1300, y);
            return <line key={y} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#6E7487" strokeWidth={40} />;
          })}
          {Array.from({length: 9}, (_, i) => {
            const [x, y] = iso(80 + (i % 3) * 420, 40 + Math.floor(i / 3) * 320);
            return (
              <Put key={i} x={x} y={y} s={1.15} f={f} at={i * 3}>
                <DataCentre f={f + i * 7} />
              </Put>
            );
          })}
          {/* the substation that feeds them */}
          <Put x={iso(1350, 950)[0]} y={iso(1350, 950)[1]} s={0.8} f={f} at={w(20.2)}>
            <PowerPlant f={f} smoke={0} />
          </Put>
        </World>
      </Cam>
      <Pop f={f} at={w(18.5)} x={960} y={540} size={76} until={w(21.6)}>
        <span style={{background: P.ink, borderRadius: 30, padding: '12px 34px'}}>It didn't come out of the air</span>
      </Pop>
      <Label f={f} at={w(19.9)} title="A data-centre campus" sub="windowless halls, power lines, cooling on every roof" bg={P.ink} color={P.white} />
      <Caption f={f} at={w(21.8)}>In 2021, a newspaper asked one small town a simple question</Caption>
    </Bg>
  );
};

/* 1:02 "...a neighborhood in Memphis that says it was never asked." */
export const CoBoxtown: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  return (
    <Bg c="#F6B26B" c2="#F7D9A6" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 760, 600, 1.15, 10, 0], [67.2, 1050, 560, 0.95, -6, 0]]}>
        <World>
          <rect x={-200} y={700} width={2400} height={500} fill="#7CC36A" />
          {/* homes in front */}
          {Array.from({length: 7}, (_, i) => (
            <Put key={i} x={180 + i * 210} y={760} s={1.1} f={f} at={i * 2}>
              <House c={[P.red, P.teal, P.purple, P.orange][i % 4]} />
            </Put>
          ))}
          {/* the fence and what's behind it: gas turbines */}
          <rect x={-200} y={640} width={2400} height={8} fill="#5B6B8C" />
          {Array.from({length: 4}, (_, i) => (
            <Put key={i} x={1250 + i * 230} y={600} s={0.75} f={f} at={w(62.6) + i * 4}>
              <PowerPlant f={f + i * 13} />
            </Put>
          ))}
        </World>
      </Cam>
      <Label f={f} at={w(62.4)} title="Boxtown, Memphis" sub="a neighbourhood next to an AI data centre's gas turbines" bg={P.ink} color={P.white} />
      <Pop f={f} at={w(63.9)} x={600} y={420} size={54} color={P.ink}>
        <span style={{background: P.white, borderRadius: 30, padding: '12px 30px'}}>“We were never asked.”</span>
      </Pop>
      <Caption f={f} at={w(65.9)}>And then it goes somewhere much closer</Caption>
    </Bg>
  );
};
