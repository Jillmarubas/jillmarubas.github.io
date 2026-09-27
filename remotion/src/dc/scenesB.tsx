import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, F} from './design';
import {Arrow, Body, Card, Circle, Column, Counter, Hand, HumLine, Key, Kicker, Lead, Piece, Source, clamp, e01, settle, useL} from './kit';
import {Bill, Bolt, Contract, CoolingTower, DataCentre, Drop, Folder, Gavel, Hall, Heat, House, Plant, Pylon, Rack, Scale, Seat, Well} from './icons';
import {Bars, Donut, RangeBar} from './charts';
import {USMap} from './maps';

const PJM = ['10', '17', '18', '21', '24', '26', '34', '37', '39', '42', '47', '51', '54', '11'];

/* ================================================================== CHAPTER 2: THE BILL */
export const S2a: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={230} width={760}>
        <Lead text="Your power comes from" at={2} />
        <Key text="a shared system: the grid." at={12} size={84} accent="grid." />
      </Column>
      <Piece x={260} y={700} at={4} from="l" rot={-2}>
        <Plant s={220} />
      </Piece>
      {[0, 1, 2].map((i) => (
        <Piece key={i} x={620 + i * 260} y={690} at={10 + i * 6} from={(['t', 'b', 't'] as const)[i]} rot={0}>
          <Pylon s={230} />
        </Piece>
      ))}
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        <path d="M330 640 Q470 560 620 610 Q750 560 880 610 Q1010 560 1140 610 Q1320 560 1480 650" fill="none" stroke={C.hum} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e01(f, 30, 50)} />
      </svg>
      {[0, 1, 2, 3].map((i) => (
        <Piece key={i} x={1480 + (i % 2) * 190} y={640 + Math.floor(i / 2) * 190} at={24 + i * 4} from="r" rot={(i % 2) * 2 - 1}>
          <House s={150} />
        </Piece>
      ))}
    </>
  );
};

export const S2b: React.FC = () => {
  const f = useCurrentFrame();
  const n = 60;
  const pts = Array.from({length: n + 1}, (_, i) => {
    const u = i / n;
    const v = 0.45 + 0.12 * Math.sin(u * Math.PI * 8) + 0.38 * Math.exp(-(((u - 0.62) / 0.05) ** 2));
    return [u * 1100, 420 - v * 360] as const;
  });
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <>
      <Column at={0} y={230} width={620}>
        <Lead text="The grid has to be ready for" at={2} />
        <Key text="the busiest moment of the year." at={14} size={78} accent="busiest" />
      </Column>
      <Piece x={1260} y={640} at={0} from="r" rot={-1} lift={6}>
        <Card w={1180} h={560} pad={40}>
          <svg width={1100} height={440} style={{overflow: 'visible'}}>
            <line x1={0} x2={1100} y1={420} y2={420} stroke={C.ink} strokeWidth={2} />
            <path d={d} fill="none" stroke={C.ink} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e01(f, 10, 50)} />
            <line x1={0} x2={1100 * e01(f, 50, 24)} y1={30} y2={30} stroke={C.hum} strokeWidth={3} strokeDasharray="14 10" />
            <text x={0} y={16} fill={C.hum} style={{fontFamily: F.mono, fontSize: 20}} opacity={e01(f, 60, 10)}>
              MUST BE READY FOR THIS
            </text>
            <text x={1100} y={460} textAnchor="end" fill={C.ink2} style={{fontFamily: F.mono, fontSize: 18}} opacity={e01(f, 20, 10)}>
              DEMAND OVER A YEAR (ILLUSTRATIVE)
            </text>
          </svg>
          <div style={{position: 'absolute', left: 40 + 0.62 * 1100 - 40, top: 10}}>
            <Circle w={100} h={80} at={70} />
          </div>
        </Card>
      </Piece>
    </>
  );
};

export const S2c: React.FC = () => {
  const L = useL();
  return (
    <>
      <Piece x={1270} y={560} at={-4} from="r" rot={1} lift={6}>
        <Card w={1060} h={700} pad={30}>
          <USMap w={1000} at={0} fill={Object.fromEntries(PJM.map((id) => [id, C.hum]))} fillAt={L(0) + 20} />
        </Card>
      </Piece>
      <Column at={L(0)} y={460} width={600}>
        <Kicker text="Eastern US grid operator" at={L(0)} />
        <Key text="PJM" at={L(0) + 10} size={150} />
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
          <Counter to={65} at={L(0) + 40} size={110} suffix="M" />
          <Body text="people, in parts of 13 states + D.C." at={L(0) + 50} size={30} width={300} />
        </div>
      </Column>
      <Source text="PJM Interconnection" at={L(0)} />
    </>
  );
};

export const S2d: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const rows = 3;
  const cols = 8;
  return (
    <>
      <Column at={0} y={200} width={760}>
        <Lead text="Once a year, an auction:" at={2} />
        <Key text="pay plants to be ready." at={12} size={80} />
      </Column>
      <Piece x={330} y={620} at={8} from="l" rot={-4} out={L(1) - 4}>
        <Gavel s={220} />
      </Piece>
      {[0, 1, 2].map((i) => (
        <Piece key={i} x={700 + i * 230} y={640} at={14 + i * 6} from="b" rot={(i - 1) * 2} out={L(1) - 4}>
          <Plant s={170} />
          <div style={{position: 'absolute', top: -30, right: -10, background: C.card, fontFamily: F.mono, fontSize: 22, color: C.ink, padding: '4px 10px', transform: 'rotate(6deg)'}}>$ / MW-day</div>
        </Piece>
      ))}
      {/* the concert analogy */}
      {Array.from({length: rows * cols}, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const taken = (f > L(2) + 10 + i * 2 && i % 3 === 0) || (f > L(3) + 20 && r === 2);
        return (
          <Piece key={i} x={900 + c * 110} y={560 + r * 120} at={L(1) + i * 2} from={r % 2 ? 'r' : 'l'} rot={0} lift={3}>
            <Seat s={90} taken={taken} />
          </Piece>
        );
      })}
      <Piece x={500} y={660} at={L(1) + 10} from="none" shadow={false}>
        <Hand text="like reserving concert seats" at={L(1) + 10} size={52} />
      </Piece>
      {[0, 1, 2].map((i) => (
        <Piece key={i} x={300 + i * 150} y={850} at={L(2) + i * 8} from="l" rot={-2} lift={6}>
          <DataCentre s={70} w={1.6} f={f} />
        </Piece>
      ))}
      <Piece x={1320} y={400} at={L(2) + 20} from="t" rot={-4}>
        <Card w={260} h={92} pad={0} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 52, color: f > L(2) + 50 ? C.hum : C.ink}}>{f > L(2) + 50 ? 'price ↑↑' : 'price'}</div>
        </Card>
      </Piece>
      <Piece x={1320} y={930} at={L(3) + 24} from="none" shadow={false}>
        <Hand text="one data centre = a whole row" at={L(3) + 24} size={46} />
      </Piece>
    </>
  );
};

export const S2e: React.FC = () => {
  const L = useL();
  return (
    <>
      <Column at={0} y={280} width={560}>
        <Kicker text="PJM capacity price · $ per MW-day" at={2} />
        <Key text="Look at what happened." at={8} size={84} />
      </Column>
      <Piece x={1260} y={580} at={0} from="r" rot={-1} lift={6}>
        <Card w={1040} h={740} pad={60}>
          <div style={{height: 70}} />
          <Bars
            w={900}
            h={460}
            max={360}
            at={L(1) - 10}
            barW={170}
            cap={{value: 329.17, label: 'PRICE CAP', at: L(3) + 10}}
            data={[
              {label: '2024/25', value: 28.92, show: '$28.92', at: L(1)},
              {label: '2025/26', value: 269.92, show: '$269.92', at: L(2)},
              {label: '2026/27', value: 329.17, show: '$329.17', hot: true, at: L(3)},
            ]}
          />
        </Card>
      </Piece>
      <Piece x={1110} y={560} at={L(2) + 30} from="none" shadow={false}>
        <Hand text="almost 10×" at={L(2) + 30} size={64} />
      </Piece>
      <Source text="PJM auction results via IEEFA / NRDC" at={0} />
    </>
  );
};

export const S2f: React.FC = () => (
  <>
    <Column at={0} y={440} width={640}>
      <Kicker text="Independent market monitor" at={2} />
      <Key text="Data centres drove most of the jump" at={8} size={76} accent="most" />
      <Body text="Share of the 2025/26 auction's price increase attributed to data-centre demand." at={30} width={560} />
    </Column>
    <Piece x={1350} y={540} at={4} from="r" rot={2}>
      <Card w={620} h={620} pad={60}>
        <Donut share={0.63} at={14} size={500} label="of the increase" />
      </Card>
    </Piece>
    <Source text="Monitoring Analytics (PJM market monitor), via Grid Shopper / IEEFA" at={0} />
  </>
);

export const S2g: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={200} width={900}>
        <Lead text="Who pays for capacity?" at={2} />
        <Key text="Everyone on the grid." at={20} size={86} />
      </Column>
      {Array.from({length: 7}, (_, i) => (
        <React.Fragment key={i}>
          <Piece x={260 + i * 220} y={560} at={10 + i * 4} from="b" rot={(i % 3) - 1}>
            <House s={150} lit={f > 50 + i * 4} />
          </Piece>
          <Arrow x1={260 + i * 220} y1={330} x2={260 + i * 220} y2={450} at={40 + i * 4} bend={0} />
        </React.Fragment>
      ))}
      <Piece x={1560} y={260} at={60} from="none" shadow={false}>
        <Hand text="including you" at={60} size={58} />
      </Piece>
      <Piece x={960} y={830} at={L(1)} from="b" rot={0} lift={6}>
        <Card w={1300} h={300} pad={50}>
          <RangeBar from={5} to={44} max={50} w={1200} at={L(1) + 16} caption="Rise in household supply rates across PJM utilities since June 2025" />
        </Card>
      </Piece>
      <Source text="Grid Shopper · NRDC" at={L(1)} />
    </>
  );
};

export const S2h: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={230} width={720}>
        <Lead text="Then there are the wires." at={2} />
        <Body text="New lines and substations cost billions, and those costs often get spread across all customers." at={16} width={640} />
      </Column>
      {[0, 1, 2, 3, 4].map((i) => (
        <Piece key={i} x={820 + i * 200} y={640 - i * 20} at={6 + i * 7} from="b" rot={0} out={L(1) - 4}>
          <Pylon s={200 - i * 10} />
        </Piece>
      ))}
      <Piece x={1740} y={520} at={30} from="r" rot={-1} out={L(1) - 4}>
        <DataCentre s={120} w={1.8} f={f} hot />
      </Piece>
      <Piece x={1250} y={620} at={L(1)} from="r" rot={4}>
        <Contract s={280} />
      </Piece>
      <Column at={L(1)} y={700} width={640}>
        <Kicker text="The industry's answer" at={L(1)} />
        <Key text="Large-load tariffs" at={L(1) + 10} size={76} />
        <Body text="Special contracts some states now require, to prove big users pay their share." at={L(1) + 24} width={600} />
      </Column>
    </>
  );
};

export const S2i: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Piece x={960} y={820} at={0} from="b" rot={0} shadow={false} lift={2}>
        <div style={{width: 1500, height: 30, background: '#CDBFA6', borderRadius: 3}} />
      </Piece>
      <Piece x={680} y={600} at={8} from="l" rot={-6}>
        <Bill s={300} />
      </Piece>
      <Piece x={1300} y={640} at={L(1)} from="r" rot={1}>
        <DataCentre s={200} w={2.4} f={f} />
      </Piece>
      <Piece x={1300} y={470} at={L(1) + 20} from="none" shadow={false}>
        <Hand text="new, down the road" at={L(1) + 20} size={48} color={C.ink2} />
      </Piece>
      <Column at={2} y={200} width={1200}>
        <Lead text="From a kitchen table, it looks simple." at={4} />
        <Key text={f > L(2) - 4 ? 'And nobody asked me.' : 'My bill went up.'} at={f > L(2) - 4 ? L(2) - 4 : L(1) - 10} size={92} accent="nobody" />
      </Column>
    </>
  );
};

export const S2j: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const drop = settle((f - L(1)) / 30);
  return (
    <>
      <Column at={0} y={380} width={1000}>
        <Body text="Paying for something you didn't choose." at={2} size={44} width={1000} />
      </Column>
      <HumLine x={120} y={560} w={1680} at={20} amp={6} color={C.ink2} width={2} />
      <div style={{position: 'absolute', left: 1500, top: 120 + drop * 430, opacity: e01(f, L(1), 6)}}>
        <Drop s={130} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        {[0, 1, 2, 3].map((i) => {
          const k = e01(f, L(1) + 30, 18);
          return <line key={i} x1={1565} y1={680} x2={1565 + Math.cos(-0.4 - i * 0.8) * 80 * k} y2={680 + Math.sin(-0.4 - i * 0.8) * 50 * k} stroke={C.ink2} strokeWidth={4} strokeLinecap="round" opacity={1 - e01(f, L(1) + 48, 12)} />;
        })}
      </svg>
    </>
  );
};

/* ================================================================== CHAPTER 3: THE WATER */
export const S3a: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={320} width={620}>
        <Key text="Computers get hot." at={4} size={100} accent="hot." />
        <Body text="Tens of thousands of chips, packed together." at={20} width={520} />
      </Column>
      {[0, 1, 2, 3, 4].map((i) => (
        <React.Fragment key={i}>
          <Piece x={880 + i * 190} y={640} at={4 + i * 5} from={i % 2 ? 't' : 'b'} rot={(i - 2) * 0.8}>
            <Rack s={320} f={f + i * 9} />
          </Piece>
          <Piece x={880 + i * 190} y={360} at={24 + i * 5} from="none" shadow={false}>
            <Heat s={140} f={f + i * 7} />
          </Piece>
        </React.Fragment>
      ))}
    </>
  );
};

export const S3b: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const k = e01(f, L(1), 30);
  return (
    <>
      <Column at={0} y={250} width={680}>
        <Lead text="The cheapest way to cool them:" at={2} />
        <Key text="evaporate water." at={14} size={92} />
        <Hand text="like sweat on skin" at={34} size={46} />
      </Column>
      <Piece x={1320} y={560} at={4} from="r" rot={0}>
        <CoolingTower s={380} f={f} />
      </Piece>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1} opacity={k}>
        <path d={`M760 820 L1150 820`} stroke={C.ink} strokeWidth={60} strokeLinecap="butt" />
        <path d={`M1320 360 L1320 ${360 - 220 * k}`} stroke={C.mute} strokeWidth={48} />
        <path d={`M1490 820 L${1490 + 260 * k} 820`} stroke={C.ink} strokeWidth={12} />
        <text x={760} y={900} fill={C.ink} style={{fontFamily: F.mono, fontSize: 24}}>WATER IN</text>
        <text x={1360} y={180} fill={C.ink} style={{fontFamily: F.mono, fontSize: 24}}>~80% EVAPORATES</text>
        <text x={1500} y={870} fill={C.ink2} style={{fontFamily: F.mono, fontSize: 22}}>~20% OUT</text>
      </svg>
      <Column at={L(1) + 30} y={760} width={560}>
        <Body text="Most of it turns to vapour and leaves." at={L(1) + 30} width={520} />
      </Column>
      <Source text="MOST Policy Initiative" at={L(1)} />
    </>
  );
};

export const S3c: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const shown = Math.floor(interpolate(f, [20, 90], [0, 100], clamp)) + Math.floor(interpolate(f, [L(1), L(1) + 60], [0, 60], clamp));
  return (
    <>
      <Column at={0} y={400} width={600}>
        <Kicker text="A typical data centre" at={2} />
        <Counter to={300000} at={8} size={120} />
        <Body text="gallons of water a day: roughly what 1,000 homes use." at={20} width={520} />
      </Column>
      <Piece x={330} y={850} at={10} from="l" rot={-1}>
        <DataCentre s={120} w={2} f={f} />
      </Piece>
      <div style={{position: 'absolute', left: 820, top: 150, width: 1000, display: 'flex', flexWrap: 'wrap', gap: 6}}>
        {Array.from({length: 160}, (_, i) => (
          <div key={i} style={{opacity: i < shown ? 1 : 0, transform: `scale(${i < shown ? 1 : 0.4})`}}>
            <House s={44} />
          </div>
        ))}
      </div>
      <Piece x={1320} y={960} at={L(1)} from="none" shadow={false}>
        <Hand text="the biggest: millions of gallons" at={L(1)} size={50} />
      </Piece>
      <Source text="MOST Policy Initiative · industry estimates" at={0} />
    </>
  );
};

export const S3d: React.FC = () => {
  const L = useL();
  return (
    <>
      <Piece x={1280} y={560} at={-4} from="r" rot={-1} lift={6}>
        <Card w={1040} h={680} pad={20}>
          <USMap w={1000} at={0} fill={{'04': C.hum}} fillAt={10} pins={[{lon: -110.97, lat: 32.22, label: 'Tucson, Arizona', at: L(1) + 6, hot: false}]} />
        </Card>
      </Piece>
      <Column at={0} y={250} width={620}>
        <Lead text="Now picture it where water is already short." at={2} size={42} />
      </Column>
      <Piece x={430} y={620} at={L(1)} from="l" rot={-6}>
        <Folder s={380} />
      </Piece>
      <Piece x={440} y={880} at={L(2)} from="b" rot={2}>
        <Card w={520} h={150} pad={20} style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <Hall s={100} />
          <div>
            <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2}}>TUCSON CITY COUNCIL · 2025</div>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.ink}}>Walked away</div>
          </div>
        </Card>
      </Piece>
      <Source text="Grist" at={L(1)} />
    </>
  );
};

export const S3e: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={200} width={900}>
        <Kicker text="Newton County, Georgia" at={2} />
        <Lead text="Neighbours say their wells started failing." at={8} />
      </Column>
      <Piece x={420} y={640} at={4} from="l" rot={-2}>
        <Well s={300} dry />
      </Piece>
      <Piece x={1000} y={660} at={12} from="b" rot={1}>
        <DataCentre s={170} w={2.2} f={f} />
      </Piece>
      <Piece x={1000} y={520} at={20} from="none" shadow={false}>
        <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink2}}>META DATA CENTRE</div>
      </Piece>
      <Piece x={1560} y={420} at={L(1)} from="r" rot={3}>
        <Card w={420} h={170} tape>
          <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2}}>META SAYS</div>
          <div style={{fontFamily: F.display, fontWeight: 600, fontStyle: 'italic', fontSize: 40, color: C.ink, lineHeight: 1.1}}>its own studies found no link.</div>
        </Card>
      </Piece>
      <Piece x={1500} y={800} at={L(3)} from="b" rot={-2}>
        <Card w={560} h={230} pad={30}>
          <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2}}>NEWER PERMITS ALLOW UP TO</div>
          <Counter to={6} at={L(3) + 12} size={110} suffix="M" color={C.hum} />
          <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2}}>GALLONS A DAY</div>
        </Card>
      </Piece>
      <Source text="SEHN · New York Times reporting (July 2025)" at={0} />
    </>
  );
};

export const S3f: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const a = f * 0.05;
  return (
    <>
      <Column at={0} y={300} width={640}>
        <Lead text="To be fair:" at={2} />
        <Key text="closed-loop cooling" at={10} size={84} />
        <Body text="Newer designs circulate the same water and consume very little." at={24} width={560} />
      </Column>
      <Piece x={1260} y={520} at={6} from="r" rot={0}>
        <svg width={520} height={520} viewBox="-260 -260 520 520" style={{overflow: 'visible'}}>
          <circle r={200} fill="none" stroke={C.ink} strokeWidth={26} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const t = a + (i * Math.PI) / 3;
            return <circle key={i} cx={200 * Math.cos(t)} cy={200 * Math.sin(t)} r={10} fill={C.card} />;
          })}
          <text textAnchor="middle" y={12} fill={C.ink} style={{fontFamily: F.mono, fontSize: 26}}>SAME WATER, AGAIN</text>
        </svg>
      </Piece>
      <Piece x={1700} y={860} at={L(1)} from="r" rot={-6}>
        <Bolt s={160} />
      </Piece>
      <Column at={L(1)} y={820} width={900}>
        <Key text="But it uses more electricity." at={L(1) + 4} size={64} accent="electricity." />
      </Column>
      <Arrow x1={1460} y1={700} x2={1640} y2={820} at={L(1) + 20} />
    </>
  );
};

export const S3g: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const tilt = interpolate(f, [L(1), L(1) + 30], [0, 12], {...clamp, easing: (x) => settle(x)});
  return (
    <>
      <Column at={0} y={250} width={700}>
        <Key text="Power or water." at={4} size={110} />
        <Lead text="Every data centre makes a trade." at={20} />
      </Column>
      <Piece x={1260} y={520} at={4} from="t" rot={0}>
        <div style={{position: 'relative'}}>
          <Scale s={520} tilt={tilt} />
          <div style={{position: 'absolute', left: -10, top: 150 + tilt * 3, transform: 'scale(0.9)'}}>
            <Bolt s={120} />
          </div>
          <div style={{position: 'absolute', left: 400, top: 150 - tilt * 3}}>
            <Drop s={110} />
          </div>
        </div>
      </Piece>
      {[0, 1, 2, 3, 4].map((i) => (
        <Piece key={i} x={900 + i * 180} y={930} at={L(1) + i * 5} from="b" rot={(i % 3) - 1}>
          <House s={130} />
        </Piece>
      ))}
      <Piece x={480} y={880} at={L(1) + 20} from="none" shadow={false}>
        <Hand text="the neighbours pay either way" at={L(1) + 20} size={50} />
      </Piece>
    </>
  );
};
