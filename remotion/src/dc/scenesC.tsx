import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, F} from './design';
import {Arrow, Body, Card, Circle, Column, Counter, Hand, HumLine, Key, Kicker, Lead, Piece, Source, clamp, e01, settle, useL} from './kit';
import {Bill, Bolt, Cloud, Coin, Contract, DataCentre, Drop, Ear, Factory, Flag, Folder, Gavel, Globe, Hall, HardHat, Heat, House, Money, Pause, Person, Phone, Pipe, Plant, Speaker, Tree, Turbine, Well} from './icons';
import {Donut, Gauge, LineChart} from './charts';
import {USMap, VAMap, WorldMap} from './maps';

const PJM = ['10', '17', '18', '21', '24', '26', '34', '37', '39', '42', '47', '51', '54', '11'];

/* ================================================================== CHAPTER 4: THE NEIGHBOURS */
export const S4a: React.FC = () => (
  <>
    <HumLine x={160} y={560} w={1600} at={0} amp={60} width={4} draw={40} />
    <Column at={10} y={300} width={900}>
      <Key text="Remember that hum?" at={10} size={110} />
    </Column>
  </>
);

export const S4b: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const night = e01(f, L(1), 30) * (1 - e01(f, L(2) + 10, 20));
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `rgba(29,27,24,${0.28 * night})`}} />
      <Column at={0} y={200} width={900}>
        <Kicker text="Great Oak, Manassas, Virginia" at={2} />
        <Lead text="A constant, high-pitched whir from a nearby Amazon Web Services campus." at={10} size={40} />
      </Column>
      <Piece x={330} y={700} at={4} from="l" rot={-2}>
        <House s={240} lit={night > 0.3} />
      </Piece>
      <Piece x={740} y={660} at={20} from="none" shadow={false}>
        <Speaker s={170} f={f} />
      </Piece>
      <Piece x={1320} y={680} at={10} from="r" rot={1}>
        <DataCentre s={260} w={2.6} f={f * 2} />
      </Piece>
      <Piece x={1320} y={470} at={L(1)} from="none" shadow={false}>
        <Hand text="fans and chillers, all night" at={L(1)} size={50} color={night > 0.5 ? C.card : C.hum} />
      </Piece>
      <Piece x={1500} y={330} at={L(2)} from="t" rot={3}>
        <Card w={480} h={250} tape>
          <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2}}>COUNTY CODE · NOISE</div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{height: 12, width: `${90 - i * 12}%`, background: i === 2 ? C.hum : C.mute, marginTop: 20, opacity: i === 2 ? e01(f, L(2) + 20, 10) : 0.6}} />
          ))}
          <div style={{fontFamily: F.hand, fontSize: 38, color: C.hum, marginTop: 8}}>amended</div>
        </Card>
      </Piece>
    </>
  );
};

export const S4c: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const haze = e01(f, 0, 40);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(150,142,128,${0.22 * haze}) 0%, rgba(150,142,128,0) 70%)`}} />
      <Column at={0} y={190} width={1000}>
        <Key text="Then there's the air." at={2} size={90} />
      </Column>
      <Column at={L(1)} y={400} width={620}>
        <Kicker text="South Memphis, Tennessee" at={L(1)} />
        <Body text="xAI built an AI supercomputer, Colossus, in a matter of months." at={L(1) + 8} width={560} />
      </Column>
      <Piece x={1260} y={560} at={L(1) + 6} from="b" rot={0} dur={22}>
        <div style={{position: 'relative'}}>
          <DataCentre s={230} w={2.6} f={f} />
          <div style={{position: 'absolute', top: -40, left: 0, fontFamily: F.mono, fontSize: 22, color: C.ink}}>COLOSSUS</div>
        </div>
      </Piece>
      {Array.from({length: 8}, (_, i) => (
        <Piece key={i} x={820 + i * 140} y={880} at={L(2) + i * 5} from={i % 2 ? 'b' : 'r'} rot={0} lift={5}>
          <Turbine s={130} f={f + i * 5} hot />
        </Piece>
      ))}
      <Piece x={460} y={880} at={L(2) + 10} from="none" shadow={false}>
        <Hand text="gas turbines, dozens" at={L(2) + 10} size={50} />
      </Piece>
    </>
  );
};

export const S4d: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={330} width={620}>
        <Kicker text="Southern Environmental Law Center" at={0} />
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
          <Counter to={35} at={4} size={200} color={C.hum} />
          <Body text="turbines running without permits" at={14} width={300} />
        </div>
      </Column>
      {Array.from({length: 12}, (_, i) => (
        <Piece key={i} x={960 + (i % 6) * 150} y={260 + Math.floor(i / 6) * 180} at={4 + i * 2} from="t" rot={0} lift={4}>
          <div style={{position: 'relative'}}>
            <Turbine s={120} f={f + i * 7} hot />
            <div style={{position: 'absolute', top: -6, right: -16, background: C.hum, color: C.card, fontFamily: F.mono, fontSize: 14, padding: '2px 6px', opacity: e01(f, 20 + i * 3, 6)}}>NO PERMIT</div>
          </div>
        </Piece>
      ))}
      <Piece x={1140} y={820} at={L(1)} from="l" rot={-1}>
        <div style={{display: 'flex', gap: 14}}>
          {[0, 1, 2, 3].map((i) => (
            <House key={i} s={110} />
          ))}
        </div>
      </Piece>
      <Piece x={1140} y={700} at={L(1) + 12} from="none" shadow={false}>
        <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink}}>BOXTOWN · A HISTORICALLY BLACK COMMUNITY</div>
      </Piece>
      <Piece x={430} y={800} at={L(2)} from="b" rot={-3}>
        <Card w={440} h={200} tape>
          <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2}}>SHELBY COUNTY PERMIT</div>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 68, color: C.ink}}>15 turbines</div>
          <div style={{fontFamily: F.hand, fontSize: 34, color: C.hum}}>still being fought</div>
        </Card>
      </Piece>
      <Source text="SELC · NBC News" at={0} />
    </>
  );
};

export const S4e: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const peel = e01(f, L(4) + 20, 30);
  return (
    <>
      <Column at={0} y={170} width={900}>
        <Key text="And then there's land." at={2} size={86} />
      </Column>
      {[0, 1, 2, 3, 4].map((i) => (
        <Piece key={i} x={180 + i * 120} y={820 + (i % 2) * 30} at={4 + i * 4} from="b" rot={(i % 3) - 1} lift={4}>
          <Tree s={130} />
        </Piece>
      ))}
      <Piece x={1260} y={580} at={L(1) - 6} from="r" rot={1} lift={6}>
        <Card w={1000} h={640} pad={10}>
          <VAMap
            w={980}
            at={L(1) - 6}
            focus={['51153', '51107', '51059', '51061', '51179', '51683', '51685']}
            fill={{'51153': peel > 0.5 ? '#CFC9BC' : C.ink2}}
            fillAt={L(1) + 10}
            labels={[{id: '51153', text: 'Prince William County', at: L(1) + 14, dy: 60}]}
          />
        </Card>
      </Piece>
      <Column at={L(1)} y={470} width={560}>
        <Kicker text="The Digital Gateway" at={L(1)} />
        <Counter to={2100} at={L(1) + 10} size={120} />
        <Body text="acres of planned data centres" at={L(1) + 16} width={500} />
      </Column>
      <Piece x={1150} y={420} at={L(2)} from="t" rot={-4}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, background: C.card, padding: '6px 14px 6px 6px'}}>
          <Flag s={70} />
          <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 24, color: C.ink}}>Manassas battlefield</div>
        </div>
      </Piece>
      <Piece x={1500} y={170} at={L(3)} from="none" shadow={false} out={L(4)}>
        <Hand text="one of the world's largest" at={L(3)} size={50} />
      </Piece>
      <Piece x={1640} y={870} at={L(4)} from="r" rot={6}>
        <Gavel s={200} />
      </Piece>
      <Piece x={1480} y={170} at={L(4) + 20} from="none" shadow={false}>
        <Hand text="rezoning voided" at={L(4) + 20} size={56} />
      </Piece>
    </>
  );
};

export const S4f: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={200} width={1100}>
        <Key text="Noise. Air. Land." at={2} size={100} />
        <Lead text="None of these is new." at={24} />
      </Column>
      {[Ear, Cloud, Tree].map((Ic, i) => (
        <Piece key={i} x={300 + i * 260} y={640} at={6 + i * 8} from={(['l', 'b', 'r'] as const)[i]} rot={(i - 1) * 3} out={L(2) - 4}>
          <Ic s={200} />
        </Piece>
      ))}
      <Piece x={1340} y={620} at={L(1) - 10} from="r" rot={0} out={L(2) - 4}>
        <Factory s={260} f={f} />
      </Piece>
      <Piece x={1340} y={860} at={L(1)} from="b" rot={0} out={L(2) - 4}>
        <div style={{display: 'flex', gap: 6}}>
          {Array.from({length: 14}, (_, i) => (
            <Person key={i} s={60} />
          ))}
        </div>
      </Piece>
      <Piece x={1340} y={420} at={L(1) + 10} from="none" shadow={false} out={L(2) - 4}>
        <Hand text="...but they came with jobs" at={L(1) + 10} size={50} />
      </Piece>
      <Column at={L(3) - 6} y={680} x={420} width={1100}>
        <Key text="What does a town get in return?" at={L(3) - 4} size={88} accent="return?" />
      </Column>
    </>
  );
};

/* ================================================================== CHAPTER 5: THE DEAL */
export const S5a: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={200} width={900}>
        <Lead text="Data centres cost a fortune to build." at={2} />
        <Key text="Hundreds of millions. Sometimes billions." at={16} size={70} />
      </Column>
      {[0, 1, 2].map((i) => (
        <Piece key={i} x={300 + i * 220} y={660 - i * 20} at={10 + i * 8} from="l" rot={(i - 1) * 3} out={L(2) - 4}>
          <Money s={220} />
        </Piece>
      ))}
      <Piece x={1320} y={640} at={4} from="r" rot={0}>
        <DataCentre s={200} w={2.4} f={f} />
      </Piece>
      {[0, 1, 2].map((i) => (
        <Piece key={i} x={1180 + i * 80} y={860} at={L(1) + 10 + i * 6} from="b" rot={0} out={L(2) - 4}>
          <Person s={70} />
        </Piece>
      ))}
      <Piece x={1560} y={440} at={L(1) + 20} from="none" shadow={false} out={L(2) - 4}>
        <Hand text="surprisingly few people" at={L(1) + 20} size={50} />
      </Piece>
      {Array.from({length: 18}, (_, i) => {
        const walk = settle((f - (L(2) + 60 + i * 3)) / 40);
        return (
          <div key={i} style={{position: 'absolute', left: 120 + (i % 9) * 110 + walk * (1400 + i * 20), top: 740 + Math.floor(i / 9) * 150, opacity: e01(f, L(2) + i * 2, 10) * (1 - walk)}}>
            <Person s={80} hat />
          </div>
        );
      })}
      <Piece x={640} y={1000} at={L(2) + 30} from="none" shadow={false}>
        <Hand text="construction jobs end when the building is done" at={L(2) + 30} size={44} />
      </Piece>
    </>
  );
};

export const S5b: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={380} width={620}>
        <Kicker text="Virginia's own auditors" at={2} />
        <Counter to={50} at={8} size={200} />
        <Body text="full-time workers at a typical large data centre, about half of them contractors." at={16} width={560} />
      </Column>
      <div style={{position: 'absolute', left: 900, top: 230, width: 900, display: 'flex', flexWrap: 'wrap', gap: 14}}>
        {Array.from({length: 50}, (_, i) => (
          <div key={i} style={{opacity: e01(f, 10 + i * 1.2, 8), transform: `translateY(${(1 - e01(f, 10 + i * 1.2, 8)) * 30}px)`}}>
            <Person s={80} outline={i % 2 === 1 && f > 60} />
          </div>
        ))}
      </div>
      <Source text="JLARC, via Good Jobs First" at={0} />
    </>
  );
};

export const S5c: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Piece x={330} y={600} at={0} from="l" rot={-1}>
        <Hall s={260} />
      </Piece>
      <Piece x={1560} y={620} at={4} from="r" rot={1}>
        <DataCentre s={180} w={2} f={f} />
      </Piece>
      {Array.from({length: 6}, (_, i) => {
        const k = settle((f - (14 + i * 6)) / 40);
        return (
          <div key={i} style={{position: 'absolute', left: 480 + k * 900, top: 580 - Math.sin(k * Math.PI) * 180, opacity: e01(f, 14 + i * 6, 4) * (1 - e01(f, 54 + i * 6, 6))}}>
            <Coin s={90} label="$" />
          </div>
        );
      })}
      <Column at={0} y={200} width={1000}>
        <Lead text="States hand them big tax breaks." at={2} />
      </Column>
      <Column at={L(1)} y={870} width={800}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
          <Counter to={1.9} decimals={1} prefix="$" suffix="B" at={L(1) + 6} size={140} />
          <Body text="Virginia's exemption, one year (2025)" at={L(1) + 12} width={380} />
        </div>
      </Column>
      <Piece x={1340} y={330} at={L(2)} from="t" rot={-3}>
        <Card w={560} h={200} pad={24}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 100, color: C.hum, lineHeight: 1}}>$1.2M</div>
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink2}}>PER NEW JOB</div>
        </Card>
      </Piece>
      <Source text="Good Jobs First" at={L(1)} />
    </>
  );
};

export const S5d: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const flip = e01(f, 0, 20);
  const grow = settle((f - L(1) - 30) / 40);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: C.card, opacity: 0.4 * (1 - flip), transform: `scaleX(${1 - flip})`, transformOrigin: 'right'}} />
      <Column at={0} y={200} width={1100}>
        <Key text="But here's the other side." at={4} size={92} />
      </Column>
      <Piece x={560} y={660} at={L(1)} from="l" rot={-4}>
        <Coin s={260} label="$1" />
      </Piece>
      <Arrow x1={760} y1={640} x2={1080} y2={640} at={L(1) + 20} bend={-0.2} />
      <Piece x={1340} y={660} at={L(1) + 30} from="r" rot={3}>
        <div style={{transform: `scale(${0.6 + 0.4 * grow})`}}>
          <Coin s={300} label="$6.10" />
        </div>
      </Piece>
      <Column at={L(1) + 50} y={930} x={120} width={1600}>
        <Body text="Virginia's own study: labour income produced per dollar of exemption, one of the state's best incentives." at={L(1) + 50} width={1600} />
      </Column>
      <Source text="JLARC, via Cardinal News" at={L(1)} />
    </>
  );
};

export const S5e: React.FC = () => {
  const L = useL();
  return (
    <>
      <Piece x={470} y={520} at={-2} from="l" rot={-1} lift={6} out={L(1) - 4}>
        <Card w={760} h={500} pad={10}>
          <VAMap w={740} at={0} fill={{'51107': C.hum}} fillAt={10} labels={[{id: '51107', text: 'Loudoun', at: 20, dx: 90}]} />
        </Card>
      </Piece>
      <Column at={0} y={200} x={960} width={800}>
        <Lead text="And look at Loudoun County," at={2} />
        <Key text="Data Center Alley itself." at={12} size={76} />
      </Column>
      <Piece x={520} y={580} at={L(1)} from="l" rot={-1}>
        <Card w={620} h={600} pad={50}>
          <Donut share={0.38} at={L(1) + 16} size={520} label="of the general fund" sub="≈ $1.3B a year" />
        </Card>
      </Piece>
      <Piece x={1340} y={640} at={L(2)} from="r" rot={1}>
        <Card w={820} h={520} pad={60}>
          <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2, marginBottom: 40}}>HOMEOWNER TAX RATE · $ PER $100 · CUT EVERY YEAR</div>
          <LineChart
            w={680}
            h={280}
            min={0.7}
            max={1.2}
            at={L(2) + 10}
            fmt={(v) => `$${v.toFixed(3)}`}
            pts={[
              {x: '2016', y: 1.145},
              {x: '2026', y: 0.805},
            ]}
          />
        </Card>
      </Piece>
      <Piece x={1340} y={300} at={L(3)} from="none" shadow={false}>
        <Hand text="a great deal, for the right place ✓" at={L(3)} size={54} />
      </Piece>
      <Source text="Loudoun County budget · Yahoo Finance" at={L(1)} />
    </>
  );
};

export const S5f: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={220} width={700}>
        <Lead text="The catch:" at={2} />
        <Key text="benefits and costs land in different places." at={10} size={70} />
      </Column>
      <Piece x={1260} y={600} at={0} from="r" rot={1} lift={6}>
        <Card w={1040} h={680} pad={20}>
          <USMap w={1000} at={0} fill={Object.fromEntries(PJM.map((id) => [id, id === '51' ? C.ink : C.hum]))} fillAt={L(1)} pins={[{lon: -77.64, lat: 39.09, label: 'tax money → one county', at: L(1) - 6, hot: false, side: 'l'}]} />
        </Card>
      </Piece>
      <Piece x={1100} y={900} at={L(1) + 20} from="none" shadow={false}>
        <div style={{background: C.card, padding: '4px 12px', fontFamily: F.sans, fontWeight: 700, fontSize: 24, color: C.hum}}>power lines, capacity prices, water → everyone</div>
      </Piece>
      <Column at={L(2)} y={760} width={620}>
        <Key text="That mismatch is the story." at={L(2)} size={64} accent="mismatch" />
      </Column>
      <HumLine x={120} y={960} w={640} at={L(2) + 10} amp={10} flat={e01(f, L(2) + 30, 20)} />
    </>
  );
};

/* ================================================================== CHAPTER 6: WHO DECIDES? */
export const S6a: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={150} width={1600}>
        <Lead text="Look back at every fight, and there's a pattern." at={2} />
      </Column>
      <div style={{position: 'absolute', left: 959, top: 260, width: 2, height: 700, background: C.mute, opacity: e01(f, L(1), 20)}} />
      <Piece x={480} y={300} at={L(1)} from="none" shadow={false}>
        <Kicker text="Benefits · global, invisible" at={L(1)} />
      </Piece>
      {[<Globe key="g" s={110} f={f} />, <Phone key="p" s={110} />, <Money key="m" s={110} />].map((el, i) => (
        <Piece key={i} x={300 + i * 180} y={560} at={L(1) + 10 + i * 6} from="l" rot={(i - 1) * 4} lift={4} style={{opacity: 0.8}}>
          {el}
        </Piece>
      ))}
      <Piece x={1440} y={300} at={L(2)} from="none" shadow={false}>
        <Kicker text="Costs · local, very visible" at={L(2)} color={C.hum} />
      </Piece>
      <Piece x={1180} y={560} at={L(2) + 8} from="r" rot={-3}>
        <Bill s={200} />
      </Piece>
      <Piece x={1440} y={600} at={L(2) + 14} from="t" rot={2}>
        <Well s={230} dry />
      </Piece>
      <Piece x={1700} y={560} at={L(2) + 20} from="b" rot={1}>
        <Tree s={200} />
      </Piece>
      <HumLine x={1040} y={850} w={820} at={L(2) + 4} amp={24} />
    </>
  );
};

export const S6b: React.FC = () => (
  <>
    <Column at={0} y={250} width={760}>
      <Lead text="And often, residents find out late." at={2} />
      <Body text="Projects arrive with code names. The details come after the deal is shaped." at={20} width={640} />
    </Column>
    {['PROJECT BLUE', 'PROJECT ████', 'PROJECT ██████'].map((l, i) => (
      <Piece key={l} x={1100 + i * 230} y={520 + i * 90} at={6 + i * 10} from={(['r', 't', 'b'] as const)[i]} rot={-6 + i * 5}>
        <Folder s={360} label={l} />
      </Piece>
    ))}
  </>
);

export const S6c: React.FC = () => {
  const L = useL();
  return (
    <>
      <Column at={0} y={220} width={1300}>
        <Key text="Not left versus right." at={2} size={100} />
      </Column>
      <Piece x={560} y={680} at={L(1)} from="l" rot={-1}>
        <Card w={620} h={330} pad={30}>
          <div style={{display: 'flex', gap: 8}}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Person key={i} s={90} />
            ))}
          </div>
          <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: C.ink, marginTop: 20}}>Rural conservatives</div>
          <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2}}>LAND · TAXES</div>
        </Card>
      </Piece>
      <Piece x={1340} y={680} at={L(1) + 16} from="r" rot={1}>
        <Card w={620} h={330} pad={30}>
          <div style={{display: 'flex', gap: 8}}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Person key={i} s={90} />
            ))}
          </div>
          <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: C.ink, marginTop: 20}}>Environmentalists</div>
          <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2}}>WATER · GAS</div>
        </Card>
      </Piece>
      <Piece x={950} y={900} at={L(1) + 40} from="none" shadow={false}>
        <Hand text="standing together" at={L(1) + 40} size={56} />
      </Piece>
    </>
  );
};

export const S6d: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={300} width={640}>
        <Lead text="And they're winning more often." at={2} />
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
          <Counter to={30} at={10} size={180} prefix="≈" />
          <Body text="states with new rules on where data centres go and what they use" at={20} width={340} />
        </div>
      </Column>
      <div style={{position: 'absolute', left: 960, top: 180, width: 820, display: 'flex', flexWrap: 'wrap', gap: 12, opacity: 1 - e01(f, L(1) - 6, 12)}}>
        {Array.from({length: 50}, (_, i) => {
          const on = i < 30 && f > 16 + i * 2;
          return <div key={i} style={{width: 70, height: 70, background: on ? C.hum : '#E4DED2', border: `2px solid ${C.ink2}`, opacity: e01(f, 4 + i, 8)}} />;
        })}
        <div style={{fontFamily: F.mono, fontSize: 18, color: C.ink2, marginTop: 10}}>ONE SQUARE PER STATE · ILLUSTRATIVE, NOT A MAP</div>
      </div>
      <Piece x={1320} y={560} at={L(1)} from="r" rot={1} lift={6}>
        <Card w={1000} h={640} pad={20}>
          <USMap w={960} at={L(1)} fill={{'26': C.ink2}} fillAt={L(1) + 6} pins={[{lon: -83.61, lat: 42.24, label: 'Ypsilanti, Michigan', at: L(1) + 16, side: 'l'}]} />
        </Card>
      </Piece>
      <Piece x={1600} y={260} at={L(1) + 26} from="t" rot={-4}>
        <Pause s={150} />
      </Piece>
      <Piece x={1560} y={900} at={L(1) + 40} from="none" shadow={false}>
        <Hand text="no new water service, for a year" at={L(1) + 40} size={44} />
      </Piece>
      <Source text="Data Center Watch · Tom's Hardware" at={0} />
    </>
  );
};

export const S6e: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const n = 40;
  const k = e01(f, 0, 70);
  const pts = Array.from({length: n + 1}, (_, i) => `${(i / n) * 1700},${-Math.pow(i / n, 1.8) * 200 + Math.sin(i) * 6}`).slice(0, Math.max(2, Math.round(k * n) + 1));
  return (
    <>
      <svg style={{position: 'absolute', left: 110, top: 330, overflow: 'visible'}} width={1} height={1} opacity={1 - e01(f, L(2) - 8, 12)}>
        <polyline points={pts.join(' ')} fill="none" stroke={C.ink} strokeWidth={4} />
        <text x={0} y={40} fill={C.ink2} style={{fontFamily: F.mono, fontSize: 20}}>PLANNED BUILD-OUT (ILLUSTRATIVE)</text>
      </svg>
      <Column at={0} y={620} width={1400}>
        <Body text="Demand for computing isn't slowing down." at={4} size={44} width={1400} />
      </Column>
      <Column at={L(1)} y={820} width={1400}>
        <Key text="So is this about whether they should exist?" at={L(1)} size={60} />
      </Column>
    </>
  );
};

export const S6f: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Piece x={340} y={560} at={0} from="b" rot={-4}>
        <Phone s={300} />
      </Piece>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={440} y1={520 + i * 40} x2={440 + 700 * e01(f, 20 + i * 6, 30)} y2={380 + i * 160} stroke={C.hum} strokeWidth={3} strokeDasharray="10 10" />
        ))}
      </svg>
      {[0, 1, 2].map((i) => (
        <Piece key={i} x={1240} y={380 + i * 160} at={30 + i * 6} from="r" rot={0} lift={4} out={L(1) - 4}>
          <DataCentre s={90} w={1.8} f={f} />
        </Piece>
      ))}
      <Column at={L(1)} y={440} x={760} width={1060}>
        <Kicker text="It's a fight about" at={L(1)} />
        <Key text="who pays," at={L(1) + 8} size={130} />
        <Key text="and who gets a say." at={L(1) + 30} size={130} accent="say." />
      </Column>
    </>
  );
};

/* ================================================================== CHAPTER 7: CAN IT BE FIXED? */
export const S7a: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={200} width={1300}>
        <Key text="A version neighbours wouldn't hate?" at={2} size={80} />
      </Column>
      <Piece x={420} y={700} at={6} from="l" rot={-2} out={L(1) - 4}>
        <House s={230} />
      </Piece>
      <Piece x={1000} y={700} at={12} from="r" rot={1} out={L(1) - 4}>
        <DataCentre s={200} w={2.4} f={f} />
      </Piece>
      <Piece x={1420} y={620} at={L(1)} from="r" rot={1} lift={6}>
        <Card w={900} h={600} pad={20}>
          <WorldMap w={860} h={560} at={L(1)} focus={['840', '208', '246']} fill={{'840': '#D8D2C4', '208': C.hum, '246': C.hum}} fillAt={L(1) + 10} labels={[{id: '208', text: 'Denmark', at: L(1) + 20, dx: -40, dy: 30}, {id: '246', text: 'Finland', at: L(1) + 24}]} />
        </Card>
      </Piece>
      <Piece x={420} y={650} at={L(1) + 4} from="none" shadow={false}>
        <Hand text="some places are trying" at={L(1) + 4} size={56} />
      </Piece>
    </>
  );
};

export const S7b: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={220} width={760}>
        <Kicker text="Start with the bill · Ohio" at={2} />
        <Body text="Regulators approved a rule for the biggest new data centres (over 25 MW)." at={10} width={640} />
      </Column>
      <Piece x={430} y={690} at={6} from="l" rot={-3} out={L(2) - 4}>
        <Contract s={320} />
      </Piece>
      <Piece x={1300} y={470} at={L(1)} from="r" rot={1}>
        <Card w={880} h={520} pad={40}>
          <div style={{display: 'flex', gap: 40, alignItems: 'center'}}>
            <Gauge value={0.85} at={L(1) + 10} size={420} label="minimum they pay for" />
            <div>
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 110, color: C.ink, lineHeight: 1}}>12</div>
              <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink2}}>YEARS, EVEN IF UNUSED</div>
            </div>
          </div>
        </Card>
      </Piece>
      <Piece x={1300} y={900} at={L(2)} from="b" rot={0}>
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <DataCentre s={110} w={2} f={f} />
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 46, color: C.ink, whiteSpace: 'nowrap'}}>
            ask the grid to build for you → <span style={{color: C.hum}}>you pay</span>
          </div>
        </div>
      </Piece>
      <Source text="PUCO / AEP Ohio, via POWER Magazine" at={L(1)} />
    </>
  );
};

export const S7c: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Column at={0} y={220} width={900}>
        <Lead text="Then there's the heat." at={2} />
        <Key text="Waste heat could warm homes." at={12} size={84} accent="homes." />
      </Column>
      <Piece x={380} y={740} at={6} from="l" rot={-1}>
        <DataCentre s={170} w={2} f={f} />
      </Piece>
      <Piece x={380} y={560} at={16} from="none" shadow={false}>
        <Heat s={140} f={f} />
      </Piece>
      <Piece x={960} y={760} at={20} from="none" shadow={false}>
        <Pipe s={60} len={5} f={f} />
      </Piece>
      {[0, 1, 2, 3].map((i) => (
        <Piece key={i} x={1400 + (i % 2) * 200} y={660 + Math.floor(i / 2) * 200} at={26 + i * 5} from="r" rot={(i % 2) * 2 - 1}>
          <House s={160} lit={f > 60 + i * 5} />
        </Piece>
      ))}
    </>
  );
};

export const S7d: React.FC = () => {
  const L = useL();
  return (
    <>
      <Piece x={520} y={560} at={0} from="l" rot={-2}>
        <Card w={760} h={700} pad={30}>
          <WorldMap w={700} h={420} at={0} focus={['208']} fill={{'208': C.hum}} fillAt={8} />
          <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2, marginTop: 10}}>ODENSE, DENMARK · META</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
            <Counter to={11000} at={14} size={100} />
            <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 28, color: C.ink}}>homes heated, up to</div>
          </div>
        </Card>
      </Piece>
      <Piece x={1400} y={560} at={L(1)} from="r" rot={2}>
        <Card w={760} h={700} pad={30}>
          <WorldMap w={700} h={420} at={L(1)} focus={['246']} fill={{'246': C.hum}} fillAt={L(1) + 8} />
          <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2, marginTop: 10}}>ESPOO REGION, FINLAND · MICROSOFT + FORTUM</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
            <Counter to={40} at={L(1) + 14} size={100} suffix="%" />
            <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 28, color: C.ink}}>of district heating for ~250,000 people</div>
          </div>
        </Card>
      </Piece>
      <Source text="Eurelectric · Fortum · Meta" at={0} />
    </>
  );
};

export const S7e: React.FC = () => {
  const f = useCurrentFrame();
  const items: [React.ReactNode, string][] = [
    [
      <svg key="l" width={150} height={150} viewBox="-100 -100 200 200">
        <circle r={70} fill="none" stroke={C.ink} strokeWidth={14} />
        <circle cx={70 * Math.cos(f / 10)} cy={70 * Math.sin(f / 10)} r={10} fill={C.card} stroke={C.ink} strokeWidth={4} />
      </svg>,
      'Closed-loop cooling',
    ],
    [<Speaker key="s" s={150} f={f} />, 'Real noise limits'],
    [<Plant key="p" s={150} />, 'Build next to new power'],
  ];
  return (
    <>
      <Column at={0} y={200} width={1300}>
        <Lead text="Other fixes are less glamorous." at={2} />
      </Column>
      {items.map(([ic, label], i) => (
        <Piece key={i} x={420 + i * 540} y={620} at={10 + i * 12} from={(['l', 'b', 'r'] as const)[i]} rot={(i - 1) * 2}>
          <Card w={420} h={380} pad={30} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
            {ic}
            <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 32, color: C.ink, textAlign: 'center'}}>{label}</div>
            <div style={{fontFamily: F.hand, fontSize: 60, color: C.hum, lineHeight: 0.6, opacity: e01(f, 30 + i * 12, 8)}}>✓</div>
          </Card>
        </Piece>
      ))}
    </>
  );
};

export const S7f: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const strike = e01(f, L(2) + 60, 16);
  return (
    <>
      <Column at={0} y={200} width={900}>
        <Lead text="Maybe the biggest one:" at={2} />
        <Key text="tell people early." at={12} size={100} accent="early." />
      </Column>
      <Piece x={1320} y={420} at={6} from="r" rot={-4} out={L(1) - 4}>
        <Folder s={380} />
      </Piece>
      <Piece x={1320} y={740} at={20} from="b" rot={0} out={L(1) - 4}>
        <Hall s={240} />
      </Piece>
      <Piece x={700} y={620} at={30} from="none" shadow={false} out={L(1) - 4}>
        <Hand text="before the land is bought" at={30} size={52} />
      </Piece>
      <Column at={L(2) - 6} y={560} x={200} width={1520}>
        <div style={{position: 'relative', display: 'inline-block'}}>
          <Key text={'"Why is this being done to us?"'} at={L(2)} size={70} />
          <div style={{position: 'absolute', left: 0, top: '52%', height: 8, width: `${strike * 100}%`, background: C.hum}} />
        </div>
        <Key text={'"What do we get, and what does it cost?"'} at={L(2) + 70} size={70} accent="cost" />
      </Column>
    </>
  );
};

/* ================================================================== ENDING */
export const S8a: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const land = settle((f - L(1)) / 36);
  return (
    <>
      <Column at={0} y={200} width={900}>
        <Lead text="For years, the internet felt weightless." at={4} />
      </Column>
      <div style={{position: 'absolute', left: 1080, top: 260 + land * 360, opacity: e01(f, 6, 16) * (1 - land)}}>
        <Cloud s={380} />
      </div>
      <Piece x={1270} y={760} at={L(1) + 20} from="t" rot={0} dur={20} exit={false}>
        <DataCentre s={220} w={2.4} f={f} />
      </Piece>
      <Piece x={520} y={760} at={10} from="l" rot={-1} exit={false}>
        <House s={240} />
      </Piece>
      <Column at={L(1)} y={420} width={760}>
        <Key text="The cloud has an address." at={L(1) + 30} size={84} accent="address." />
      </Column>
    </>
  );
};

export const S8b: React.FC = () => {
  const L = useL();
  const f = useCurrentFrame();
  const icons = [Bolt, Drop, Tree];
  const lit = f > L(1) + 10;
  const hum = 1 - e01(f, L(1), 40);
  const credits = e01(f, L(2) + 120, 14);
  return (
    <>
      <Piece x={520} y={760} at={-12} from="none" rot={-1} exit={false}>
        <House s={240} lit={lit} />
      </Piece>
      <Piece x={1270} y={760} at={-12} from="none" rot={0} exit={false}>
        <DataCentre s={220} w={2.4} f={f} />
      </Piece>
      {icons.map((Ic, i) => {
        const a = f / 60 + (i * Math.PI * 2) / 3;
        return (
          <div key={i} style={{position: 'absolute', left: 1270 + Math.cos(a) * 380 - 50, top: 520 + Math.sin(a) * 140 - 50, opacity: e01(f, 6 + i * 6, 12) * (1 - e01(f, L(1), 20))}}>
            <Ic s={100} />
          </div>
        );
      })}
      <HumLine x={380} y={900} w={1160} at={0} amp={22} flat={1 - hum} />
      <Column at={L(1)} y={250} width={1400}>
        <Lead text="More and more, it's somebody's neighbour." at={L(1)} />
      </Column>
      <Column at={L(2)} y={420} width={1600}>
        <Key text="The question is whether that neighbour gets a say." at={L(2)} size={76} accent="say." />
      </Column>
      <div style={{position: 'absolute', inset: -40, background: C.paper, opacity: credits, zIndex: 50}} />
      <div style={{position: 'absolute', left: 240, top: 300, width: 1440, opacity: credits, zIndex: 51}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 90, color: C.ink}}>Why people hate data centres</div>
        <div style={{fontFamily: F.mono, fontSize: 24, color: C.ink2, marginTop: 40, lineHeight: 1.8, letterSpacing: '0.06em'}}>
          RESEARCH: DATA CENTER WATCH · BLOOMBERG · LAWRENCE BERKELEY NATIONAL LABORATORY · IEA · PJM · IEEFA · NRDC · MONITORING ANALYTICS · MOST POLICY INITIATIVE · GRIST · SEHN · SELC · JLARC · GOOD JOBS FIRST · CARDINAL NEWS · LOUDOUN COUNTY · PUCO · EURELECTRIC · FORTUM
        </div>
        <div style={{fontFamily: F.mono, fontSize: 20, color: C.mute, marginTop: 30, letterSpacing: '0.06em'}}>MAPS: US CENSUS (US-ATLAS), NATURAL EARTH · VOICE: ELEVENLABS · ALL GRAPHICS DRAWN IN CODE</div>
      </div>
    </>
  );
};

export {Arrow, Circle, Counter, Drop, Flag, HardHat, interpolate, clamp};
