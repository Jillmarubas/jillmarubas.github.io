import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F} from './design';
import {Arrow, Body, Card, Circle, Column, Counter, Hand, HumLine, Key, Kicker, Lead, Piece, Source, e01, settle, useL} from './kit';
import {Bolt, Chip, Clock, Cloud, DataCentre, Globe, Hall, House, Phone, Rack, Bill} from './icons';
import {Bars, Gauge, LineChart} from './charts';
import {USMap, VAMap} from './maps';

/* ================================================================== COLD OPEN */
export const S0a: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <Piece key={i} x={560 + i * 270} y={620 + (i % 2) * 14} at={4 + i * 7} from="b" rot={(i - 1.5) * 1.5}>
          <House s={230} lit={i === 2 && f > L(1)} />
        </Piece>
      ))}
      <HumLine x={380} y={800} w={1160} at={30} amp={20} />
      <Piece x={960} y={200} at={14} from="none" shadow={false}>
        <Kicker text="Manassas, Virginia" at={14} />
      </Piece>
      <Piece x={1560} y={340} at={L(1)} from="r" rot={6}>
        <Clock s={150} f={f * 6} />
      </Piece>
      <Piece x={1420} y={440} at={L(1) + 10} from="none" shadow={false}>
        <Hand text="day and night" at={L(1) + 10} />
      </Piece>
    </>
  );
};

export const S0b: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => (
        <Piece key={i} x={220 + i * 170} y={760} at={i * 5} from="l" rot={(i - 1) * 2}>
          <House s={150} />
        </Piece>
      ))}
      <Piece x={1230} y={640} at={12} from="r" rot={-1.5} dur={40} lift={16}>
        <DataCentre s={360} w={3} f={f} />
      </Piece>
      <HumLine x={140} y={900} w={1660} at={20} amp={12} />
      <Column at={L(0) + 20} y={220} x={120} width={900}>
        <Lead text="No windows. No sign. Almost no people." at={L(0) + 24} size={42} />
      </Column>
      <Piece x={1230} y={340} at={L(1)} from="t" rot={-2}>
        <Card w={420} h={96} pad={0} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 60, color: C.ink}}>Data centre.</div>
        </Card>
      </Piece>
      <Piece x={1240} y={430} at={L(1) + 40} from="none" shadow={false}>
        <Hand text="the most boring building ever" at={L(1) + 40} size={46} />
      </Piece>
    </>
  );
};

export const S0c: React.FC = () => (
  <>
    <Piece x={960} y={480} at={0} from="t" rot={-4} dur={34}>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 520, color: C.ink, lineHeight: 1}}>?</div>
    </Piece>
    <Piece x={1260} y={760} at={14} from="none" shadow={false}>
      <Hand text="so here's the puzzle" at={14} size={60} />
    </Piece>
  </>
);

export const S0d: React.FC = () => {
  const L = useL();
  const pins = [
    {lon: -77.5, lat: 39.0},
    {lon: -84.4, lat: 33.7},
    {lon: -110.9, lat: 32.2},
    {lon: -90.0, lat: 35.1},
    {lon: -83.6, lat: 42.2},
    {lon: -96.8, lat: 32.8},
    {lon: -93.6, lat: 41.6},
    {lon: -112.0, lat: 33.4},
    {lon: -81.7, lat: 41.5},
    {lon: -86.8, lat: 36.2},
    {lon: -80.8, lat: 35.2},
    {lon: -88.0, lat: 43.0},
  ].map((p, i) => ({...p, at: L(0) + 30 + i * 5}));
  return (
    <>
      <Column at={L(0)} y={500} width={640}>
        <Kicker text="Blocked or delayed by locals · 2026" at={L(0)} />
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <Counter to={130} at={L(0) + 20} prefix="$" suffix="B" size={170} />
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink2}}>JAN–MAR</div>
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <Counter to={68} at={L(1) + 6} prefix="+$" suffix="B" size={120} color={C.ink2} />
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink2}}>APR–JUN</div>
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 12}}>
          <Counter to={843} at={L(2) + 4} size={90} color={C.hum} />
          <Body text="opposition groups, in 49 states" at={L(2) + 16} size={30} width={320} />
        </div>
      </Column>
      <Piece x={1330} y={520} at={L(0) - 4} from="r" rot={1} lift={6}>
        <Card w={1040} h={680} pad={20}>
          <USMap w={1000} at={L(0)} pins={pins} dots={{n: 420, at: L(2), dur: 60, skip: ['15']}} />
        </Card>
      </Piece>
      <Piece x={880} y={930} at={L(2) + 50} from="none" shadow={false}>
        <Hand text="(not Hawaii)" at={L(2) + 50} size={40} color={C.ink2} />
      </Piece>
      <Source text="Data Center Watch · Bloomberg, Sept 2026" at={L(0)} />
    </>
  );
};

export const S0e: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Piece x={960} y={430} at={6} from="none" shadow={false} dur={16}>
        <div style={{textAlign: 'center', width: 1500}}>
          <Kicker text="An explainer" at={6} />
          <div style={{height: 24}} />
          <Key text="Why people hate data centres" at={12} size={140} accent="hate" />
        </div>
      </Piece>
      <HumLine x={460} y={760} w={1000} at={30} amp={22} />
      <Piece x={960} y={900} at={40} from="b" rot={1}>
        <DataCentre s={120} w={3} f={f} />
      </Piece>
    </>
  );
};

/* ================================================================== CHAPTER 1: THE CLOUD HAS AN ADDRESS */
export const S1a: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const acts = ['stream a show', 'send a photo', 'ask an AI'];
  return (
    <>
      <Column at={L(0)} y={300} width={660}>
        <Lead text="To understand the anger," at={L(0)} />
        <Key text="start inside." at={L(0) + 14} size={96} />
      </Column>
      <Piece x={420} y={720} at={L(1) - 6} from="b" rot={-4}>
        <Phone s={260} />
      </Piece>
      {acts.map((a, i) => {
        const at = L(1) + 16 + i * 14;
        const k = settle((f - at - 10) / 40);
        return (
          <React.Fragment key={a}>
            <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
              <line x1={500} y1={660 + i * 50} x2={500 + 840 * k} y2={560 + i * 90} stroke={C.hum} strokeWidth={3} strokeDasharray="10 10" opacity={e01(f, at, 8)} />
            </svg>
            <Piece x={640 + i * 60} y={600 + i * 110} at={at} from="l" rot={-2 + i * 2}>
              <Card w={250} h={62} pad={0} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontWeight: 700, fontSize: 28, color: C.ink}}>
                {a}
              </Card>
            </Piece>
          </React.Fragment>
        );
      })}
      <Piece x={1550} y={680} at={L(1) + 40} from="r" rot={1}>
        <DataCentre s={200} w={2.2} f={f} />
      </Piece>
      <Piece x={1550} y={510} at={L(1) + 60} from="none" shadow={false}>
        <Hand text="a computer somewhere" at={L(1) + 60} size={48} />
      </Piece>
    </>
  );
};

export const S1b: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Piece x={1200} y={360} at={0} from="t" rot={-3} out={L(1) - 6}>
        <Cloud s={420} />
      </Piece>
      <Piece x={1200} y={200} at={14} from="none" shadow={false} out={L(1) - 6}>
        <Hand text='"the cloud"' at={14} size={60} />
      </Piece>
      <Column at={4} y={300} width={640}>
        <Lead text="The cloud isn't in the sky." at={6} />
      </Column>
      <Piece x={1200} y={520} at={L(1) - 4} from="t" rot={1} dur={34}>
        <DataCentre s={300} w={2.6} f={f} />
      </Piece>
      {[0, 1, 2, 3, 4].map((i) => (
        <Piece key={i} x={880 + i * 160} y={860} at={L(1) + 24 + i * 6} from={i % 2 ? 'r' : 'l'} rot={(i - 2) * 1.2}>
          <Rack s={250} f={f + i * 13} />
        </Piece>
      ))}
      <Column at={L(1) + 4} y={620} width={560}>
        <Key text="It's in buildings." at={L(1) + 8} size={86} />
        <Body text="Rows of servers, stacked in racks, running every second of every day." at={L(1) + 30} width={520} />
      </Column>
    </>
  );
};

export const S1c: React.FC = () => {
  const L = useL();
  return (
    <>
      <Piece x={1260} y={560} at={-2} from="r" rot={-1} lift={6}>
        <Card w={1120} h={720} pad={10}>
          <VAMap w={1100} at={0} fill={{'51107': C.hum}} fillAt={L(1) + 10} labels={[{id: '51107', text: 'Loudoun County', at: L(1) + 20, dx: 150, dy: -20}]} />
        </Card>
      </Piece>
      <Column at={L(1)} y={440} width={560}>
        <Kicker text="Loudoun County, Virginia" at={L(1)} />
        <Key text="Data Center Alley" at={L(1) + 22} size={96} accent="Alley" />
        <Body text="One of the biggest concentrations of data centres on Earth." at={L(2)} width={500} />
      </Column>
      <Piece x={1500} y={130} at={L(1) - 6} from="none" shadow={false}>
        <Hand text="look at this ↓" at={L(1) - 6} size={58} />
      </Piece>
      <Source text="Loudoun County · US Census (map)" at={L(1)} />
    </>
  );
};

export const S1d: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const beads = Array.from({length: 18}, (_, i) => i);
  return (
    <>
      <Column at={0} y={200} width={700}>
        <Key text="Why here?" at={4} size={110} />
        <Lead text="An accident of history." at={L(0) + 30} size={44} />
      </Column>
      <Piece x={430} y={640} at={L(1)} from="l" rot={-3}>
        <Card w={460} h={300} tape>
          <div style={{display: 'flex', gap: 20, alignItems: 'center'}}>
            <Hall s={140} />
            <div>
              <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink2}}>1992</div>
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 52, color: C.ink}}>MAE-East</div>
            </div>
          </div>
          <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 24, color: C.ink2, marginTop: 14}}>An early exchange where networks swap traffic</div>
        </Card>
      </Piece>
      <Piece x={960} y={560} at={L(2)} from="b" rot={2}>
        <Card w={380} h={220} tape>
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink2}}>1996</div>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 50, color: C.ink, lineHeight: 1.05}}>AOL moves to Ashburn</div>
        </Card>
      </Piece>
      {/* fibre: three lines drawn across, then boxes snap onto them like beads */}
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M1180 ${300 + i * 90} C1400 ${260 + i * 110}, 1600 ${360 + i * 60}, 1860 ${320 + i * 100}`} fill="none" stroke={C.hum} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e01(f, L(2) + 20 + i * 8, 40)} />
        ))}
      </svg>
      {beads.map((i) => {
        const row = i % 3;
        const at = (i < 6 ? L(3) : L(4)) + (i % 6) * 5;
        return (
          <Piece key={i} x={1240 + (i % 6) * 100 + row * 20} y={300 + row * 95 + ((i * 7) % 3) * 6} at={at} from={(['t', 'r', 'b'] as const)[row]} rot={(i % 5) - 2} lift={4}>
            <DataCentre s={52} w={1.4} f={f} />
          </Piece>
        );
      })}
      <Piece x={1500} y={760} at={L(3)} from="none" shadow={false}>
        <Hand text="close to the cables = faster" at={L(3) + 6} size={48} />
      </Piece>
    </>
  );
};

export const S1e: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <Piece key={i} x={900 + i * 200} y={700} at={i * 5} from="b" rot={(i - 2) * 1.5} style={{opacity: 0.55}}>
          {i % 2 ? <DataCentre s={120} w={1.6} f={f} /> : <House s={140} />}
        </Piece>
      ))}
      <Column at={2} y={420} width={700}>
        <Lead text="For years, nobody noticed." at={6} />
        <Key text="Quiet neighbours." at={20} size={100} />
      </Column>
    </>
  );
};

export const S1f: React.FC = () => {
  const L = useL();
  return (
    <>
      <Column at={0} y={300} width={640}>
        <Lead text="Then" at={2} size={52} />
        <Key text="AI changed the maths." at={8} size={104} accent="AI" />
      </Column>
      <Piece x={1320} y={380} at={2} from="r" rot={8} dur={34}>
        <Chip s={300} />
      </Piece>
      {Array.from({length: 10}, (_, i) => (
        <Piece key={i} x={1000 + (i % 5) * 150} y={700 + Math.floor(i / 5) * 150} at={L(1) + i * 4} from="b" rot={(i % 3) - 1} lift={5}>
          <Chip s={120} />
        </Piece>
      ))}
      <Piece x={420} y={780} at={L(1) + 30} from="l" rot={-2}>
        <Card w={440} h={330} pad={20}>
          <Gauge value={0.92} at={L(1) + 40} size={400} label="power demand" showValue={false} />
        </Card>
      </Piece>
    </>
  );
};

export const S1g: React.FC = () => {
  const L = useL();
  return (
    <>
      <Column at={0} y={330} width={620}>
        <Kicker text="Share of all US electricity" at={2} />
        <Key text="4.4% → up to 12%" at={10} size={92} accent="12%" />
        <Body text="Used by data centres in 2023, and the government's own projection for 2028." at={24} width={560} />
      </Column>
      <Piece x={1300} y={560} at={0} from="r" rot={-1} lift={6}>
        <Card w={900} h={640} pad={50}>
          <Bars
            w={800}
            h={420}
            max={13}
            at={6}
            barW={150}
            data={[
              {label: '2023', value: 4.4, show: '4.4%'},
              {label: '2028 · low', value: 6.7, show: '6.7%', at: L(1)},
              {label: '2028 · high', value: 12, show: '12%', hot: true, at: L(1) + 16},
            ]}
          />
        </Card>
      </Piece>
      <Source text="Lawrence Berkeley National Laboratory / US DOE, 2024" at={0} />
    </>
  );
};

export const S1h: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Piece x={360} y={620} at={0} from="l" rot={-6}>
        <Globe s={330} f={f} />
      </Piece>
      <Column at={4} y={260} width={700} x={120}>
        <Kicker text="Data centres worldwide" at={4} />
        <Key text="Roughly double by 2030" at={12} size={80} accent="double" />
      </Column>
      <Piece x={1250} y={600} at={6} from="r" rot={1} lift={6}>
        <Card w={900} h={520} pad={60}>
          <LineChart
            w={760}
            h={330}
            min={0}
            max={1000}
            at={16}
            fmt={(v) => `${v} TWh`}
            pts={[
              {x: '2024', y: 415},
              {x: '2030 (projected)', y: 945},
            ]}
          />
        </Card>
      </Piece>
      <Source text="International Energy Agency, Energy and AI (base case)" at={0} />
    </>
  );
};

export const S1i: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const grow = 1 + 0.45 * settle((f - L(1)) / 40);
  return (
    <>
      <Column at={0} y={250} width={760}>
        <Key text="One AI campus ≈ a small city" at={4} size={84} accent="city" />
      </Column>
      <Piece x={560} y={720} at={6} from="l" rot={-1}>
        <div style={{transform: `scale(${grow})`, transformOrigin: 'bottom center'}}>
          <DataCentre s={220} w={2.2} f={f} hot />
        </div>
      </Piece>
      {Array.from({length: 9}, (_, i) => (
        <Piece key={i} x={1060 + (i % 5) * 150} y={620 + Math.floor(i / 5) * 170} at={10 + i * 3} from="r" rot={(i % 3) - 1} lift={5}>
          <House s={130} />
        </Piece>
      ))}
      <Piece x={1380} y={430} at={20} from="t" rot={2}>
        <Bolt s={120} />
      </Piece>
      <Column at={L(1)} y={930} x={120} width={1300}>
        <Body text="From quiet neighbours to some of the biggest customers on the grid." at={L(1)} width={1300} />
      </Column>
    </>
  );
};

export const S1j: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const houses = Array.from({length: 12}, (_, i) => [900 + (i % 6) * 160, 560 + Math.floor(i / 6) * 200] as const);
  return (
    <>
      <Piece x={330} y={560} at={0} from="l" rot={-1}>
        <DataCentre s={200} w={2} f={f} hot />
      </Piece>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        {houses.map(([x, y], i) => (
          <path key={i} d={`M540 560 C700 ${400 + i * 20}, ${x - 150} ${y - 140}, ${x} ${y - 50}`} fill="none" stroke={C.ink2} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e01(f, 10 + i * 3, 30)} />
        ))}
      </svg>
      {houses.map(([x, y], i) => (
        <Piece key={i} x={x} y={y} at={14 + i * 3} from="b" rot={(i % 3) - 1} lift={4}>
          <House s={110} />
        </Piece>
      ))}
      <Column at={4} y={200} width={900}>
        <Lead text="When something that big plugs into the grid," at={6} size={42} />
        <Key text="everyone feels it." at={30} size={80} />
      </Column>
      <Piece x={1500} y={330} at={L(1)} from="t" rot={-8} dur={26}>
        <Bill s={200} />
      </Piece>
      <Piece x={1260} y={250} at={L(1) + 30} from="none" shadow={false}>
        <Hand text="reason #1: the bill" at={L(1) + 30} size={56} />
      </Piece>
      <Arrow x1={1300} y1={280} x2={1400} y2={330} at={L(1) + 50} />
    </>
  );
};

export {Circle};
