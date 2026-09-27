import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useL} from '../dc/kit';
import {K} from './art';
import {Banner, Bars, Bubble, Chip, Head, Panel, People, Ring, Src, Stat} from './ui';
import {Flags, P} from './world';

/*
 * One shot per scene of the voiceover (same boundaries as src/dc/scenes.tsx, so the whooshes in
 * the shared mix still land on the cuts). A shot is a camera target on the world, optional
 * camera moves keyed to later lines, pins that stand on the world, and the on-screen type.
 */
export type V = [number, number, number];
export type PinDef = {x: number; y: number; text: string; l: number; d?: number; c?: string};
export type Shot = {cam: V; keys?: [number, V, number?][]; ov?: React.FC; pins?: PinDef[]; fl?: Partial<Flags>};

/** Frame the world so the building line sits at screen height g. */
const c = (x: number, z: number, g = 800): V => [x, -(g - 540) / z, z];
/** Same, but put world x on the right third of the screen (text goes on the left). */
const r = (x: number, z: number, g = 800): V => c(x - 400 / z, z, g);
/** Same, with world x on the left third (text on the right). */
const l = (x: number, z: number, g = 800): V => c(x + 400 / z, z, g);
const sky = (x: number, z: number): V => [x, -900, z];

const card = (n: number, title: string, cam: V): Shot => ({cam, ov: () => <Banner n={n} title={title} />});

/* ------------------------------------------------------------------ cold open */
const S0a: Shot = {
  cam: r(P.home3, 1.0, 820),
  keys: [[1, r(P.home5, 1.05, 820)]],
  fl: {hum: 1},
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Manassas, Virginia" text="A sound that never stops." at={L(0)} />
        <Chip text="Not a siren" at={L(1)} x={330} y={520} c={K.purple} strike={L(1) + 22} />
        <Chip text="Not traffic" at={L(1) + 22} x={340} y={630} c={K.purple} from="r" strike={L(1) + 40} />
        <Chip text="A hum. Day and night." at={L(1) + 44} x={440} y={750} c={K.red} />
      </>
    );
  },
};
const S0b: Shot = {
  cam: l(P.hallA - 100, 1.05, 820),
  keys: [[1, c(P.hallB - 250, 0.85, 820)]],
  fl: {hum: 0.6},
  pins: [
    {x: P.hallA - 180, y: -120, text: 'No windows', l: 0, d: 20},
    {x: P.hallA + 60, y: -250, text: 'No sign', l: 0, d: 50, c: K.purple},
    {x: P.hallA + 200, y: -40, text: 'Almost no people', l: 0, d: 80, c: K.orange},
  ],
  ov: () => {
    const L = useL();
    return <Head k="Across the road" text="It's a data centre." sub="One of the most boring buildings ever designed." at={L(1)} x={1030} y={90} c={K.red} from="r" />;
  },
};
const S0c: Shot = {
  cam: c(P.hallA - 600, 0.42, 820),
  ov: () => <Head text="So here's the puzzle." at={4} x={560} y={180} size={80} c={K.yellow} from="t" />,
};
const S0d: Shot = {
  cam: r(P.hall, 0.9, 780),
  ov: () => {
    const L = useL();
    return (
      <>
        <Stat n={130} pre="$" suf="bn" label="blocked or delayed, Jan–Mar 2026" at={L(0)} x={380} y={230} from="l" />
        <Stat n={68} pre="$" suf="bn" label="more, April–June" at={L(1)} x={380} y={560} from="l" c={K.orange} />
        <Stat n={800} suf="+" label="groups fighting them, in every state but Hawaii" at={L(2)} x={1480} y={230} c={K.purple} w={640} />
        <Src text="Data Center Watch · Bloomberg, Sept 2026" at={L(0)} />
      </>
    );
  },
};
const S0e: Shot = {
  cam: r(P.hallB, 1.35, 780),
  ov: () => <Head text="Why would anyone get this angry at a box full of computers?" at={6} w={900} size={64} c={K.red} />,
};

/* ------------------------------------------------------------------ 1 · the cloud has an address */
const S1a: Shot = {
  cam: r(P.hallA, 1.15, 800),
  keys: [[1, r(P.hallB, 1.0, 800)]],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Start inside" text="What's in the box?" at={L(0)} />
        <Chip text="Stream a show" at={L(1)} x={330} y={520} c={K.red} />
        <Chip text="Send a photo" at={L(1) + 18} x={380} y={640} c={K.orange} from="r" />
        <Chip text="Ask an AI a question" at={L(1) + 36} x={470} y={760} c={K.purple} />
      </>
    );
  },
};
const S1b: Shot = {
  cam: sky(P.hallA + 300, 0.9),
  keys: [[1, r(P.hallB, 1.1, 820)]],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text={'We call it “the cloud”.'} sub="But it isn't in the sky." subAt={L(0) + 50} at={L(0)} x={560} y={330} c={K.blue} from="t" out={L(1) - 16} />
        <Panel title="Inside: servers in racks" at={L(1) + 10} x={520} y={560} w={760} h={420} c={K.navy} from="l">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16}}>
            {Array.from({length: 18}, (_, i) => (
              <Rack key={i} i={i} />
            ))}
          </div>
        </Panel>
      </>
    );
  },
};
const S1c: Shot = {
  cam: c(P.hallA + 300, 0.45, 820),
  keys: [[1, r(P.hallB, 0.7, 800)]],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="And many of them sit in one place." at={L(0)} x={560} y={120} c={K.blue} from="t" out={L(1) - 14} />
        <Head k="Loudoun County, Virginia" text={'“Data Center Alley”'} sub="One of the biggest clusters of data centres on Earth." subAt={L(2)} at={L(1)} c={K.red} />
        <Src text="Loudoun County" at={L(1)} />
      </>
    );
  },
};
const S1d: Shot = {
  cam: r(P.mae, 1.0, 800),
  keys: [
    [2, r(P.aol, 0.7, 820)],
    [3, c(5500, 0.34, 820), 0],
    [4, r(P.hallB, 0.55, 820)],
  ],
  pins: [
    {x: P.mae - 30, y: -250, text: 'Early 1990s: MAE-East', l: 1, d: 30, c: K.navy},
    {x: P.aol, y: -790, text: '1996: AOL HQ, Ashburn', l: 2, d: 20, c: K.blue},
  ],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Why here?" text="An accident of history." at={L(0)} out={L(1) - 10} />
        <Head text="An internet exchange: where networks swap traffic." at={L(1)} w={760} size={52} c={K.navy} out={L(3) - 10} />
        <Chip text="Fibre optic cable followed" at={L(2) + 50} x={400} y={560} c={K.purple} out={L(3) - 10} />
        <Head text="Close to the cables = faster connections." sub="So they kept clustering." subAt={L(4)} at={L(3)} w={780} size={56} c={K.orange} />
      </>
    );
  },
};
const S1e: Shot = {
  cam: c(P.hallA - 700, 0.62, 820),
  ov: () => <Head text="For years, nobody noticed them." sub="They were quiet neighbours." at={4} x={1040} y={100} c={K.green2} from="r" />,
};
const S1f: Shot = {
  cam: r(P.hallA, 1.4, 760),
  fl: {hot: 1},
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="Then AI changed the maths." at={L(0)} size={72} c={K.red} />
        <Chip text="Enormous computing" at={L(1)} x={330} y={520} c={K.purple} />
        <Chip text="→ enormous electricity" at={L(1) + 30} x={430} y={640} c={K.red} from="r" />
      </>
    );
  },
};
const S1g: Shot = {
  cam: l(4300, 0.8, 780),
  fl: {glow: 1},
  ov: () => {
    const L = useL();
    return (
      <>
        <Panel title="Share of all US electricity" at={L(0)} x={1330} y={500} w={900} h={640} c={K.blue}>
          <Bars
            w={840}
            h={380}
            max={13}
            data={[
              {label: '2023', v: 4.4, show: '4.4%', at: L(0) + 10},
              {label: '2028 (high)', v: 12, show: 'up to 12%', at: L(1), hot: true},
            ]}
          />
        </Panel>
        <Src text="Lawrence Berkeley National Laboratory / US DOE, 2024" at={L(0)} />
      </>
    );
  },
};
const S1h: Shot = {
  cam: c(6400, 0.3, 860),
  ov: () => (
    <>
      <Stat n={2} pre="×" label="Data-centre electricity worldwide, by 2030" at={4} x={960} y={330} c={K.blue} from="t" w={680} size={150} />
      <Src text="International Energy Agency, Energy and AI (base case)" />
    </>
  ),
};
const S1i: Shot = {
  cam: c(P.hallA - 400, 0.5, 820),
  fl: {glow: 1},
  pins: [
    {x: P.home3, y: -360, text: 'a small city', l: 0, d: 30, c: K.orange},
    {x: P.hallB, y: -420, text: 'one AI campus', l: 0, d: 10, c: K.red},
  ],
  ov: () => {
    const L = useL();
    return <Head text="From quiet neighbours to some of the grid's biggest customers." at={L(1)} x={460} y={80} w={1000} size={54} c={K.red} from="t" />;
  },
};
const S1j: Shot = {
  cam: c(5600, 0.36, 820),
  fl: {glow: 1},
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="When something that big plugs in, everyone on the grid feels it." at={L(0)} x={410} y={90} w={1100} size={54} from="t" out={L(1) - 10} />
        <Chip text="Reason #1: the bill" at={L(1) + 20} x={960} y={300} c={K.red} size={60} from="t" />
      </>
    );
  },
};

/* ------------------------------------------------------------------ 2 · the bill */
const S2a: Shot = {
  cam: c(P.plant - 1400, 0.42, 820),
  fl: {glow: 1},
  pins: [
    {x: P.plant, y: -470, text: 'Power plants', l: 0, d: 30, c: K.navy},
    {x: 6940, y: -420, text: 'Lines', l: 0, d: 60, c: K.yellow},
    {x: P.home5, y: -300, text: 'Homes', l: 0, d: 90, c: K.blue},
  ],
  ov: () => <Head k="The grid" text="A shared system." at={10} x={90} y={80} c={K.blue} />,
};
const S2b: Shot = {
  cam: r(P.city, 0.62, 800),
  ov: () => (
    <>
      <Head text="Built for the busiest moment of the year." sub="Not the average day." at={4} c={K.orange} />
      <Panel title="Demand across a year" at={30} x={520} y={690} w={760} h={300} c={K.orange} from="l">
        <svg width={700} height={190} viewBox="0 0 700 190">
          <path d="M0 150 C 80 120, 120 90, 180 110 S 300 140, 360 100 S 450 10, 500 20 S 580 120, 700 130" fill="none" stroke={K.blue} strokeWidth={8} strokeLinecap="round" />
          <circle cx={500} cy={20} r={14} fill={K.red} />
          <line x1={0} x2={700} y1={20} y2={20} stroke={K.red} strokeWidth={4} strokeDasharray="14 10" />
          <text x={10} y={70} textAnchor="start" fontFamily="Poppins" fontWeight={800} fontSize={26} fill={K.red}>
            the grid must cover this
          </text>
        </svg>
      </Panel>
    </>
  ),
};
const S2c: Shot = {
  cam: r(P.gridop, 1.0, 800),
  ov: () => (
    <>
      <Head k="Eastern US grid operator" text="PJM" at={4} size={110} c={K.blue} />
      <Stat n={65} suf=" million" label="people it keeps the lights on for" at={24} x={420} y={640} c={K.blue} from="l" w={640} size={96} />
      <Src text="PJM Interconnection" />
    </>
  ),
};
const Seats: React.FC<{at: number; dcAt: number}> = ({at, dcAt}) => {
  const L = useL();
  void L;
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 44px)', gap: 12}}>
      {Array.from({length: 48}, (_, i) => (
        <SeatBox key={i} i={i} at={at} dcAt={dcAt} />
      ))}
    </div>
  );
};
const S2d: Shot = {
  cam: l(P.gridop, 0.95, 800),
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Once a year" text="An auction to keep power plants on standby." at={L(0)} x={1030} y={80} w={800} size={52} from="r" />
        <Panel title="Like reserving concert seats" at={L(1)} x={1430} y={660} w={800} h={420} c={K.purple}>
          <Seats at={L(1) + 10} dcAt={L(3)} />
          <div style={{marginTop: 26, fontFamily: 'Nunito', fontWeight: 800, fontSize: 30, color: K.navy}}>More people want seats → the price goes up.</div>
        </Panel>
        <Chip text="Each new campus: hundreds of megawatts" at={L(3)} x={1380} y={380} c={K.red} size={32} from="r" />
      </>
    );
  },
};
const S2e: Shot = {
  cam: l(P.plant, 0.9, 820),
  ov: () => {
    const L = useL();
    return (
      <>
        <Panel title="PJM capacity price · $ per MW-day" at={L(0)} x={1300} y={540} w={1020} h={820} c={K.red}>
          <div style={{height: 90}} />
          <Bars
            w={940}
            h={460}
            max={360}
            cap={{v: 329.17, label: 'PRICE CAP', at: L(3) + 10}}
            data={[
              {label: '2024/25', v: 28.92, show: '$28.92', at: L(1)},
              {label: '2025/26', v: 269.92, show: '$269.92', at: L(2)},
              {label: '2026/27', v: 329.17, show: '$329.17', at: L(3), hot: true},
            ]}
          />
        </Panel>
        <Chip text="almost 10× in a year" at={L(2) + 40} x={1380} y={250} c={K.yellow} size={34} />
        <Src text="PJM auction results via IEEFA / NRDC" />
      </>
    );
  },
};
const S2f: Shot = {
  cam: r(P.hallB, 0.8, 800),
  ov: () => (
    <>
      <Panel title="Share of the price jump from data centres" at={4} x={560} y={520} w={760} h={640} c={K.red} from="l">
        <div style={{display: 'flex', justifyContent: 'center', paddingTop: 20}}>
          <Ring share={0.63} at={16} size={420} label="in one auction" />
        </div>
      </Panel>
      <Src text="Monitoring Analytics (PJM market monitor), via Grid Shopper / IEEFA" />
    </>
  ),
};
const S2g: Shot = {
  cam: r(P.home4, 1.0, 800),
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="Who pays for capacity? Everyone on the grid." sub="Including you." at={L(0)} w={780} size={56} out={L(1) - 10} />
        <Stat n={44} pre="5–" suf="%" label="rise in household supply rates, depending on the utility" at={L(1)} x={420} y={420} c={K.red} from="l" w={640} />
        <Src text="Grid Shopper · NRDC" at={L(1)} />
      </>
    );
  },
};
const S2h: Shot = {
  cam: c(4600, 0.62, 820),
  fl: {glow: 1},
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Then there are the wires" text="New lines and substations cost billions, often spread across all customers." at={L(0)} x={90} y={80} w={1000} size={48} c={K.yellow} out={L(1) - 10} />
        <Bubble text="Big customers pay their fair share." at={L(1)} x={560} y={220} tail="r" c={K.blue} />
        <Chip text="Some states now require special contracts" at={L(1) + 60} x={1300} y={330} c={K.purple} size={32} from="r" />
      </>
    );
  },
};
const S2i: Shot = {
  cam: r(P.home2 + 60, 1.5, 760),
  keys: [[1, r(P.home2 + 60, 1.25, 760)]],
  ov: () => {
    const L = useL();
    return (
      <>
        <Chip text="From the kitchen table…" at={L(0)} x={380} y={140} c={K.orange} />
        <Bubble text="My bill went up." at={L(1)} x={430} y={330} w={620} />
        <Bubble text="The building down the road is new." at={L(1) + 40} x={470} y={560} w={700} c={K.red} />
        <Bubble text="And nobody asked me." at={L(2)} x={430} y={790} w={620} />
      </>
    );
  },
};
const S2j: Shot = {
  cam: [P.cool - 300, 60, 1.1],
  keys: [[1, r(P.cool, 0.9, 780)]],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="Paying for something you didn't choose." at={L(0)} x={90} y={90} c={K.purple} out={L(1) - 10} />
        <Head text="Including the next thing these buildings need…" at={L(1)} x={90} y={90} c={K.blue} />
      </>
    );
  },
};

/* ------------------------------------------------------------------ 3 · the water */
const S3a: Shot = {
  cam: r(P.hallA + 50, 1.3, 780),
  fl: {hot: 1},
  ov: () => <Head text="Computers get hot." sub="Tens of thousands of chips, packed together." at={6} size={72} c={K.red} />,
};
const S3b: Shot = {
  cam: r(P.cool, 1.2, 760),
  keys: [[1, r(P.cool, 0.95, 820)]],
  pins: [{x: P.cool - 60, y: -520, text: 'water vapour', l: 1, d: 10, c: K.blue}],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="The cheap way to cool" text="Evaporate water, like sweat on skin." at={L(0)} c={K.blue} />
        <Chip text="Most of it never comes back" at={L(1)} x={420} y={560} c={K.red} />
      </>
    );
  },
};
const S3c: Shot = {
  cam: l(P.home3, 0.6, 800),
  ov: () => {
    const L = useL();
    return (
      <>
        <Stat n={300000} label="gallons a day at a typical data centre ≈ what 1,000 homes use" at={L(0)} x={1360} y={300} c={K.blue} w={780} size={120} />
        <Chip text="The biggest: millions" at={L(1)} x={1360} y={620} c={K.red} size={48} from="r" />
        <Src text="MOST Policy Initiative · industry estimates" />
      </>
    );
  },
};
const S3d: Shot = {
  cam: r(P.blue, 1.0, 800),
  keys: [
    [1, r(P.blue, 0.8, 800)],
    [2, r(P.tucson, 0.75, 800)],
  ],
  fl: {},
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="Now picture a place already short of water." at={L(0)} w={760} size={56} c={K.orange} out={L(1) - 10} />
        <Head k="Tucson, Arizona · 2025" text={'A huge project, codenamed “Project Blue”.'} at={L(1)} w={760} size={52} c={K.blue} out={L(2) - 10} />
        <Head text="Residents packed city meetings." sub="The council voted to walk away from it." subAt={L(2) + 60} at={L(2)} w={760} size={56} c={K.red} />
        <Src text="Grist" at={L(1)} />
      </>
    );
  },
};
const S3e: Shot = {
  cam: r(P.well, 1.3, 780),
  keys: [[3, r(P.hallB, 0.8, 800)]],
  pins: [{x: P.well, y: -170, text: 'wells failing?', l: 0, d: 40, c: K.red}],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Georgia, near a Meta data centre" text="Neighbours say their wells started failing after construction began." at={L(0)} w={820} size={48} c={K.orange} out={L(3) - 10} />
        <Bubble text="Our studies found no link. (Meta)" at={L(1)} x={560} y={700} w={640} c={K.blue} tail="r" out={L(3) - 10} />
        <Stat n={6} pre="up to " suf="M" label="gallons a day allowed by newer permits" at={L(3)} x={420} y={300} c={K.blue} from="l" w={640} />
        <Src text="SEHN · New York Times reporting (July 2025)" />
      </>
    );
  },
};
const S3f: Shot = {
  cam: r(P.hallB - 200, 0.85, 800),
  keys: [[1, c(6280, 0.5, 820)]],
  fl: {loop: 1},
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="To be fair" text="Closed-loop cooling barely consumes any water." at={L(0)} w={800} size={52} c={K.blue} out={L(1) - 10} />
        <Head text="But it uses more electricity." sub="So the problem moves back to the grid." at={L(1)} x={560} y={80} size={56} c={K.yellow} from="t" />
      </>
    );
  },
};
const S3g: Shot = {
  cam: c(P.hallB, 0.5, 820),
  ov: () => {
    const L = useL();
    return (
      <>
        <Chip text="Power" at={L(0)} x={640} y={250} c={K.yellow} size={72} />
        <Chip text="or" at={L(0) + 14} x={960} y={250} c={K.navy} size={48} from="t" />
        <Chip text="Water" at={L(0) + 24} x={1280} y={250} c={K.blue} size={72} from="r" />
        <Head text="Either way, the neighbours pay." at={L(1)} x={560} y={400} size={56} c={K.red} from="b" />
      </>
    );
  },
};

/* ------------------------------------------------------------------ 4 · the neighbours */
const S4a: Shot = {
  cam: c(P.home6 + 300, 0.7, 800),
  fl: {hum: 1},
  ov: () => <Head text="Remember that hum?" at={4} x={560} y={110} size={80} c={K.red} from="t" />,
};
const S4b: Shot = {
  cam: r(P.home5, 1.1, 800),
  keys: [
    [1, [P.hallA + 60, -360, 1.9]],
    [2, r(P.home4, 0.9, 800)],
  ],
  fl: {hum: 1},
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Great Oak, Manassas" text="A constant, high-pitched whir from an AWS campus." at={L(0)} w={800} size={50} c={K.purple} out={L(1) - 10} />
        <Chip text="Fans and chillers run all the time" at={L(1)} x={960} y={880} c={K.navy} from="b" out={L(2) - 10} />
        <Head text="Counties are rewriting their noise rules just to keep up." at={L(2)} w={800} size={52} c={K.red} />
      </>
    );
  },
};
const S4c: Shot = {
  cam: c(P.colossus + 250, 0.85, 800),
  keys: [[2, l(P.turbines, 0.9, 800)]],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Then there's the air" text="South Memphis: xAI's supercomputer, Colossus." sub="Built in a matter of months." subAt={L(1) + 50} at={L(0)} w={800} size={52} c={K.navy} out={L(2) - 10} />
        <Head text="Powered quickly by gas turbines. Dozens of them." at={L(2)} x={1030} y={90} w={800} size={52} c={K.orange} from="r" />
      </>
    );
  },
};
const S4d: Shot = {
  cam: l(P.turbines + 100, 0.85, 800),
  keys: [[1, r(P.boxtown, 1.0, 800)]],
  fl: {tags: 1},
  ov: () => {
    const L = useL();
    return (
      <>
        <Stat n={35} label="turbines counted running without permits" at={L(0)} x={1400} y={260} c={K.red} out={L(1) - 10} />
        <Head k="Boxtown" text="A historically Black community already living with heavy industry." at={L(1)} w={800} size={46} c={K.purple} out={L(2) - 10} />
        <Head text="Permits later granted for 15 turbines." sub="Residents and civil rights groups are still fighting." at={L(2)} w={800} size={50} c={K.orange} />
        <Src text="SELC · NBC News" />
      </>
    );
  },
};
const S4e: Shot = {
  cam: r(P.field, 0.75, 800),
  keys: [[4, r(P.hall, 0.85, 800)]],
  fl: {gateway: 1},
  pins: [{x: P.field, y: -380, text: 'Digital Gateway: ~2,100 acres', l: 1, d: 30, c: K.red}],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="And then there's land" text="Prince William County, Virginia" at={L(0)} w={780} size={52} c={K.green2} out={L(2) - 10} />
        <Chip text="Right next to a Civil War battlefield" at={L(2)} x={500} y={330} c={K.navy} out={L(4) - 10} />
        <Chip text="One of the largest campuses in the world" at={L(3)} x={530} y={450} c={K.red} out={L(4) - 10} />
        <Head text="Residents sued. A court voided the rezoning." sub="The developer gave up its appeal." at={L(4)} w={780} size={52} c={K.blue} />
      </>
    );
  },
};
const S4f: Shot = {
  cam: c(8000, 0.24, 880),
  ov: () => {
    const L = useL();
    return (
      <>
        <Chip text="Noise" at={L(0)} x={560} y={200} c={K.purple} size={64} />
        <Chip text="Air" at={L(0) + 16} x={960} y={200} c={K.orange} size={64} from="t" />
        <Chip text="Land" at={L(0) + 32} x={1340} y={200} c={K.green2} size={64} from="r" />
        <Head text="Factories and highways did all this too — but they brought lots of jobs." at={L(0) + 60} x={410} y={320} w={1100} size={48} c={K.navy} from="b" out={L(2) - 10} />
        <Head text="So what does a town actually get in return?" at={L(2)} x={410} y={320} w={1100} size={60} c={K.red} from="b" />
      </>
    );
  },
};

/* ------------------------------------------------------------------ 5 · the deal */
const S5a: Shot = {
  cam: r(P.crane, 0.8, 800),
  keys: [[1, r(P.hallB, 1.1, 800)]],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Cost to build" text="Hundreds of millions of dollars. Sometimes billions." at={L(0)} w={780} size={52} c={K.yellow} out={L(1) - 10} />
        <Head text="Once running, they need surprisingly few people." at={L(1)} w={780} size={52} c={K.blue} out={L(2) - 10} />
        <Chip text="Construction: hundreds, even thousands of jobs" at={L(2)} x={560} y={200} c={K.orange} size={32} />
        <Chip text="…which end when the building is finished" at={L(2) + 70} x={560} y={320} c={K.navy} size={32} from="r" />
      </>
    );
  },
};
const S5b: Shot = {
  cam: l(P.hallA, 1.0, 800),
  ov: () => {
    const L = useL();
    return (
      <>
        <Panel title="Full-time jobs at a typical large data centre" at={L(0)} x={1340} y={500} w={820} h={560} c={K.blue}>
          <div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: 110, color: K.blue, lineHeight: 1, marginBottom: 20}}>≈50</div>
          <People n={50} at={L(0) + 10} hollowFrom={25} hollowAt={L(0) + 110} cols={13} s={40} />
          <div style={{marginTop: 18, fontFamily: 'Nunito', fontWeight: 800, fontSize: 28, color: K.navy}}>About half of them are contractors.</div>
        </Panel>
        <Src text="JLARC, via Good Jobs First" />
      </>
    );
  },
};
const S5c: Shot = {
  cam: r(P.hall, 0.85, 800),
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="Many states hand them big tax breaks." at={L(0)} w={760} size={52} c={K.purple} />
        <Stat n={1.9} dec={1} pre="$" suf="bn" label="Virginia's sales tax exemption, 2025" at={L(1)} x={400} y={560} c={K.red} from="l" w={620} />
        <Chip text="> $1 million per new job (Good Jobs First)" at={L(2)} x={500} y={860} c={K.navy} size={32} />
        <Src text="JLARC · Good Jobs First" at={L(1)} />
      </>
    );
  },
};
const S5d: Shot = {
  cam: l(P.city, 0.7, 800),
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="But here's the other side, and it matters." at={L(0)} x={1030} y={90} w={800} size={52} from="r" c={K.green2} />
        <Stat n={6} pre="$" label="of labour income for every $1 of tax given up" at={L(1)} x={1400} y={560} c={K.green2} w={660} />
        <Src text="JLARC, via Cardinal News" at={L(1)} />
      </>
    );
  },
};
const S5e: Shot = {
  cam: c(P.hallA - 900, 0.55, 820),
  keys: [[2, r(P.home3, 0.95, 800)]],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Loudoun County" text="Data Center Alley itself" at={L(0)} w={700} size={56} c={K.blue} out={L(2) - 10} />
        <Panel title="Local taxes from data centres" at={L(1)} x={1380} y={470} w={700} h={560} c={K.blue} out={L(2) - 10}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Ring share={0.38} at={L(1) + 16} size={330} c={K.green2} label="of the general fund" />
            <div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: 44, color: K.navy, marginTop: 14}}>≈ $1.3bn a year</div>
          </div>
        </Panel>
        <Head text="Homeowner property tax rate: cut every year for a decade." at={L(2)} w={780} size={50} c={K.green2} />
        <Chip text="A great deal. For the right place." at={L(3)} x={520} y={520} c={K.blue} size={36} />
        <Src text="Loudoun County budget · Yahoo Finance" at={L(1)} />
      </>
    );
  },
};
const S5f: Shot = {
  cam: c(6000, 0.25, 880),
  pins: [
    {x: P.hallA, y: -380, text: 'tax money → one county', l: 1, d: 0, c: K.green2},
    {x: P.plant, y: -560, text: 'power lines', l: 1, d: 40, c: K.red},
    {x: P.gridop, y: -560, text: 'capacity prices', l: 1, d: 60, c: K.red},
    {x: P.tucson, y: -480, text: 'water', l: 1, d: 80, c: K.red},
  ],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="The benefits and the costs often don't land in the same place." at={L(0)} x={410} y={70} w={1100} size={50} from="t" out={L(2) - 10} />
        <Head text="That mismatch is the heart of this story." at={L(2)} x={410} y={70} w={1100} size={60} c={K.red} from="t" />
      </>
    );
  },
};

/* ------------------------------------------------------------------ 6 · who decides */
const S6a: Shot = {
  cam: c(4500, 0.3, 860),
  keys: [[2, c(9000, 0.24, 880)]],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="Every fight in this video has a pattern." at={L(0)} x={410} y={80} w={1100} size={56} from="t" out={L(1) - 10} />
        <Head k="The benefits" text="Global and invisible: faster apps, smarter AI, profits." at={L(1)} x={90} y={80} w={820} size={46} c={K.blue} />
        <Head k="The costs" text="Local and very visible:" at={L(2)} x={1010} y={80} w={820} size={46} c={K.red} from="r" />
        <Chip text="A hum." at={L(2) + 30} x={1180} y={420} c={K.purple} from="r" />
        <Chip text="A bill." at={L(2) + 44} x={1440} y={420} c={K.orange} from="r" />
        <Chip text="A dry well." at={L(2) + 60} x={1210} y={530} c={K.blue} from="r" />
        <Chip text="A field that's gone." at={L(2) + 76} x={1400} y={640} c={K.green2} from="r" />
      </>
    );
  },
};
const S6b: Shot = {
  cam: r(P.blue, 1.25, 780),
  ov: () => (
    <>
      <Head k="Residents often find out late" text="Projects arrive with code names." sub="The details come after the deal is shaped." subAt={60} at={4} w={780} size={56} c={K.blue} />
    </>
  ),
};
const S6c: Shot = {
  cam: r(P.hall, 0.95, 800),
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="This fight doesn't split neatly between left and right." at={L(0)} w={800} size={50} c={K.purple} />
        <Chip text="Rural conservatives: land and taxes" at={L(1)} x={430} y={560} c={K.red} size={32} />
        <Chip text="Environmentalists: water and gas" at={L(1) + 40} x={430} y={680} c={K.green2} size={32} from="r" />
        <Chip text="Standing side by side" at={L(1) + 80} x={330} y={800} c={K.navy} size={32} />
      </>
    );
  },
};
const S6d: Shot = {
  cam: r(P.hall, 0.7, 820),
  ov: () => {
    const L = useL();
    return (
      <>
        <Stat n={30} pre="~" label="states with new rules on where data centres go and what they use" at={L(0)} x={420} y={280} c={K.blue} from="l" w={660} />
        <Head k="Near Detroit" text="A utility authority paused new water and sewer service to data centres for a year." at={L(1)} x={90} y={560} w={820} size={40} c={K.orange} />
        <Src text="Data Center Watch · Tom's Hardware" />
      </>
    );
  },
};
const S6e: Shot = {
  cam: r(P.crane, 0.9, 800),
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="Meanwhile, the industry keeps building. More, and faster." at={L(0)} w={800} size={50} c={K.yellow} out={L(1) - 10} />
        <Head text="So this isn't really a fight about whether data centres should exist." at={L(1)} w={800} size={50} c={K.navy} />
      </>
    );
  },
};
const S6f: Shot = {
  cam: c(P.home4 + 600, 0.55, 820),
  ov: () => {
    const L = useL();
    return (
      <>
        <Chip text="Your phone depends on them. So does almost everything online." at={L(0)} x={960} y={160} c={K.blue} size={36} from="t" out={L(1) - 10} />
        <Head text="It's a fight about who pays, and who gets a say." at={L(1)} x={410} y={120} w={1100} size={64} c={K.red} from="t" />
      </>
    );
  },
};

/* ------------------------------------------------------------------ 7 · can it be fixed */
const S7a: Shot = {
  cam: c(P.home5 + 400, 0.7, 800),
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="Is there a version neighbours wouldn't hate?" at={L(0)} x={460} y={100} w={1000} size={60} c={K.blue} from="t" />
        <Chip text="Some places are already trying." at={L(1)} x={960} y={400} c={K.green2} from="b" />
      </>
    );
  },
};
const S7b: Shot = {
  cam: l(P.plant + 150, 0.9, 800),
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Ohio" text="A new rule for the biggest new data centres." at={L(0)} x={1030} y={90} w={800} size={48} c={K.red} from="r" out={L(1) - 10} />
        <Stat n={85} suf="%" label="of the power they reserve, paid for up to 12 years, used or not" at={L(1)} x={1410} y={420} c={K.blue} w={700} out={L(2) - 10} />
        <Head text="If you ask the grid to build for you, you pay for it. Not your neighbours." at={L(2)} x={1030} y={90} w={800} size={50} c={K.green2} from="r" />
        <Src text="PUCO / AEP Ohio, via POWER Magazine" at={L(1)} />
      </>
    );
  },
};
const S7c: Shot = {
  cam: c(P.hallA - 1200, 0.55, 820),
  fl: {heat: 1},
  pins: [
    {x: P.hallA - 200, y: -120, text: 'waste heat', l: 0, d: 40, c: K.red},
    {x: P.home4 + 40, y: -330, text: 'warm homes', l: 0, d: 80, c: K.orange},
  ],
  ov: () => <Head k="Then there's the heat" text="The warmth cooling systems throw away could heat homes instead." at={4} x={410} y={80} w={1100} size={52} c={K.orange} from="t" />,
};
const S7d: Shot = {
  cam: c(P.home4, 0.8, 820),
  fl: {heat: 1},
  ov: () => {
    const L = useL();
    return (
      <>
        <Stat n={11000} label="homes heated by Meta's data centre in Odense, Denmark" at={L(0)} x={420} y={250} c={K.orange} from="l" w={660} />
        <Stat n={40} suf="%" label="of district heating for ~250,000 people: Microsoft + Fortum, Finland" at={L(1)} x={1500} y={250} c={K.red} w={660} />
        <Src text="Eurelectric · Fortum · Meta" />
      </>
    );
  },
};
const S7e: Shot = {
  cam: r(P.hallB, 0.75, 800),
  fl: {loop: 1},
  ov: () => (
    <Panel title="The less glamorous fixes" at={4} x={520} y={500} w={780} h={520} c={K.green2} from="l">
      {['Closed-loop cooling to save water', 'Real noise limits', 'Build next to new power, not a stretched grid'].map((t, i) => (
        <Check key={t} text={t} at={30 + i * 40} />
      ))}
    </Panel>
  ),
};
const S7f: Shot = {
  cam: r(P.hall, 0.9, 800),
  keys: [[2, c(P.hall - 200, 0.6, 800)]],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head k="Maybe the biggest fix" text="Tell people early. Before the land is bought. Before the deal is done." at={L(0)} w={800} size={48} c={K.blue} out={L(1) - 10} />
        <Chip text="It won't make a data centre invisible." at={L(1)} x={520} y={240} c={K.navy} size={34} out={L(2) - 10} />
        <Bubble text="Why is this being done to us?" at={L(2)} x={560} y={200} w={660} c={K.red} tail="r" />
        <Bubble text="What do we get, and what does it cost?" at={L(2) + 90} x={1300} y={470} w={700} c={K.green2} />
      </>
    );
  },
};

/* ------------------------------------------------------------------ ending */
const S8a: Shot = {
  cam: sky(P.hallA + 400, 0.8),
  keys: [[1, r(P.hallB, 0.9, 800)]],
  ov: () => {
    const L = useL();
    return (
      <>
        <Head text="For years, the internet felt weightless." at={L(0)} x={560} y={330} size={60} from="t" out={L(1) - 10} />
        <Head text="But the cloud has an address." at={L(1)} size={72} c={K.red} />
      </>
    );
  },
};
const S8b: Shot = {
  cam: r(P.hallA, 0.8, 800),
  keys: [
    [1, c(P.home6 + 200, 0.55, 800)],
    [2, c(7000, 0.23, 880)],
  ],
  fl: {hum: 0.5},
  ov: () => {
    const L = useL();
    return (
      <>
        <Chip text="Power" at={L(0)} x={280} y={200} c={K.yellow} out={L(1) - 10} />
        <Chip text="Water" at={L(0) + 14} x={280} y={320} c={K.blue} out={L(1) - 10} />
        <Chip text="Land" at={L(0) + 28} x={280} y={440} c={K.green2} out={L(1) - 10} />
        <Chip text="Noise" at={L(0) + 50} x={280} y={560} c={K.purple} out={L(1) - 10} />
        <Head text="More and more, it's somebody's neighbour." at={L(1)} x={410} y={120} w={1100} size={60} c={K.navy} from="t" out={L(2) - 10} />
        <Head text="Does that neighbour get to have a say?" at={L(2)} x={410} y={120} w={1100} size={70} c={K.red} from="t" />
      </>
    );
  },
};

/* ------------------------------------------------------------------ small parts */
const Rack: React.FC<{i: number}> = ({i}) => {
  const L = useL();
  void L;
  return (
    <div style={{height: 150, borderRadius: 10, background: K.navy, padding: 8, display: 'flex', flexDirection: 'column', gap: 6}}>
      {Array.from({length: 7}, (_, k) => (
        <RackRow key={k} seed={i * 7 + k} />
      ))}
    </div>
  );
};
const RackRow: React.FC<{seed: number}> = ({seed}) => {
  const f = useCurrentFrame();
  const on = Math.sin(f / 4 + seed * 1.7) > 0;
  return (
    <div style={{flex: 1, borderRadius: 3, background: '#2E3D5E', display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 5}}>
      <div style={{width: 6, height: 6, borderRadius: 3, background: on ? '#2FB39A' : '#51607A'}} />
      <div style={{width: 6, height: 6, borderRadius: 3, background: !on ? K.blue : '#51607A'}} />
    </div>
  );
};
const SeatBox: React.FC<{i: number; at: number; dcAt: number}> = ({i, at, dcAt}) => {
  const f = useCurrentFrame();
  const o = Math.min(1, Math.max(0, (f - at - i * 0.8) / 10));
  const dc = i >= 22 && f >= dcAt + (i - 22) * 1.5;
  const taken = i < 22 && f >= at + 40 + i * 1.5;
  return <div style={{width: 44, height: 40, borderRadius: '12px 12px 6px 6px', background: dc ? K.red : taken ? K.blue : '#E3EAF3', opacity: o}} />;
};
const Check: React.FC<{text: string; at: number}> = ({text, at}) => {
  const f = useCurrentFrame();
  const o = Math.min(1, Math.max(0, (f - at) / 12));
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 34, opacity: o, transform: `translateX(${(1 - o) * -40}px)`}}>
      <div style={{width: 60, height: 60, borderRadius: 18, background: K.green2, color: K.white, fontFamily: 'Poppins', fontWeight: 800, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>✓</div>
      <div style={{fontFamily: 'Nunito', fontWeight: 800, fontSize: 36, color: K.navy, lineHeight: 1.2}}>{text}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ in scene order (matches SCENES) */
export const SHOTS: Shot[] = [
  S0a, S0b, S0c, S0d, S0e,
  card(1, 'The cloud has an address', c(P.hallA, 0.4, 860)), S1a, S1b, S1c, S1d, S1e, S1f, S1g, S1h, S1i, S1j,
  card(2, 'The bill', c(P.plant - 500, 0.4, 860)), S2a, S2b, S2c, S2d, S2e, S2f, S2g, S2h, S2i, S2j,
  card(3, 'The water', c(P.cool, 0.45, 860)), S3a, S3b, S3c, S3d, S3e, S3f, S3g,
  card(4, 'The neighbours', c(P.home4, 0.45, 860)), S4a, S4b, S4c, S4d, S4e, S4f,
  card(5, 'The deal', c(P.hallB, 0.4, 860)), S5a, S5b, S5c, S5d, S5e, S5f,
  card(6, 'Who decides?', c(P.hall - 400, 0.42, 860)), S6a, S6b, S6c, S6d, S6e, S6f,
  card(7, 'Can it be fixed?', c(P.home5, 0.45, 860)), S7a, S7b, S7c, S7d, S7e, S7f,
  S8a, S8b,
];
