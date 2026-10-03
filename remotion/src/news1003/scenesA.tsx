import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, F, R} from './design';
import {Big, Counter, Cutout, e01, Kicker, Panel, Piece, Quote, Ring, Source, useL, useScene, useW} from './kit';
import {Logo3D} from './Logo3D';
import {Balance, Box3, Brick, CalPage, Chip, DataCentre, Gear, House, MemStack, PriceTag, RamStick, Tree, USMap} from './propsA';
import {Agent, Doc, Envelope, GlassBox, IDBadge, Laptop, Tangle, Tile} from './propsB';

/* Hook, preview, and story 1 (Nvidia's cheaper DGX Spark). */

/* ================================================================== HOOK */
export const H0: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tSub = w('subpoenaed', 0, 20);
  const tFired = w('fired', 0, 40);
  const tWarn = w('hundred', 0, 90);
  const tRogue = w('rogue', 0, 150);
  const t48 = w('fortyeight', 0, 220);
  const gone = e01(f, tFired + 24, 16);
  return (
    <AbsoluteFill>
      <Piece x={960} y={200} at={0} shadow={false}>
        <Logo3D name="openai" w={360} h={240} at={0} fit={0.8} />
      </Piece>
      <Piece x={330} y={600} at={tSub - 4} from="drop" rot={-4}>
        <Doc w={300} title="Subpoena" lines={8} seed="h0" />
      </Piece>
      {[0, 1, 2].map((i) => (
        <Piece key={i} x={650 + i * 110} y={600 + gone * 60} at={tFired - 2 + i * 3} rot={-5 + i * 5}>
          <div style={{opacity: 1 - gone * 0.65}}>
            <IDBadge w={130} title="Safety" />
          </div>
        </Piece>
      ))}
      <Piece x={1250} y={610} at={tWarn - 6}>
        <div style={{position: 'relative', width: 300, height: 260}}>
          {Array.from({length: 5}, (_, i) => {
            const k = e01(f, tWarn - 6 + i * 2, 12);
            return (
              <div key={i} style={{position: 'absolute', left: 30 + (i - 2) * 56 * k, top: 40 + Math.abs(i - 2) * 14 * k, transform: `rotate(${(i - 2) * 10 * k}deg)`}}>
                <Envelope w={240} />
              </div>
            );
          })}
        </div>
      </Piece>
      <Piece x={1640} y={600} at={tRogue - 8}>
        <GlassBox w={320} crack={e01(f, tRogue - 4, 10)}>
          <div style={{position: 'absolute', left: 70 + e01(f, tRogue + 2, 14) * 150, top: 80}}>
            <Agent w={110} />
          </div>
        </GlassBox>
      </Piece>
      <Piece x={960} y={940} at={t48 - 4}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <Counter to={48} at={t48 - 4} dur={14} size={96} color={C.blueInk} />
          <span style={{fontFamily: F.mono, fontSize: 28, letterSpacing: '0.1em', color: C.ink2}}>HOURS</span>
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

export const H1: React.FC = () => (
  <AbsoluteFill>
    <Piece x={960} y={230} at={2} shadow={false}>
      <Logo3D name="nvidia" w={300} h={240} at={2} fit={0.78} />
    </Piece>
    <Piece x={960} y={640} at={4} from="drop" shadow={false}>
      <Cutout src="cut/spark_oblique.png" w={820} />
    </Piece>
    <Piece x={960} y={960} at={12}>
      <Kicker text="DGX Spark" at={12} size={26} />
    </Piece>
  </AbsoluteFill>
);

export const H2: React.FC = () => {
  const w = useW();
  const tB = w('billion', 0, 20);
  return (
    <AbsoluteFill>
      <Piece x={1540} y={200} at={0} shadow={false}>
        <Logo3D name="amazon" w={420} h={200} at={0} fit={0.8} />
      </Piece>
      <Piece x={700} y={560} at={2}>
        <DataCentre w={820} />
      </Piece>
      {[0, 1, 2, 3].map((i) => (
        <Piece key={i} x={1180 + i * 190} y={700} at={6 + i * 2}>
          <House w={170} tone={i + 1} />
        </Piece>
      ))}
      <Piece x={1100} y={890} at={tB - 4} from="l">
        <Brick w={360} label="$1B" />
      </Piece>
      <Piece x={300} y={720} at={8}>
        <Tree w={120} seed={1} />
      </Piece>
    </AbsoluteFill>
  );
};

export const H3: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tHalf = w('half', 0, 60);
  const grid = e01(f, tHalf - 30, 16);
  return (
    <AbsoluteFill>
      <Piece x={960} y={520} at={0}>
        <Laptop w={1060}>
          <div style={{position: 'absolute', inset: 14, display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 8, opacity: grid}}>
            {Array.from({length: 54}, (_, i) => {
              const on = i % 2 === 0 && i < 52 ? e01(f, tHalf - 6 + (i % 9) * 1.2, 8) : 0;
              return <Tile key={i} w={102} on={on} seed={i} />;
            })}
          </div>
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 1 - grid}}>
            <Tile w={560} seed={1} />
          </div>
        </Laptop>
      </Piece>
      <Piece x={960} y={960} at={tHalf}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
          <Counter to={48} at={tHalf} dur={18} size={80} suffix="%" color={C.blueInk} />
          <span style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.08em', color: C.ink2}}>THOUGHT IT WAS HUMAN · 26 OF 54</span>
        </div>
      </Piece>
      <Source text="Tavus" at={tHalf} />
    </AbsoluteFill>
  );
};

/** The five stories as a dissolving stack: the Autopilot veil ramp, objects instead of words. */
const STORY_OBJ: React.ReactNode[] = [
  <Cutout key="a" src="cut/spark_oblique.png" w={180} />,
  <Brick key="b" w={150} label="$1B" blue={false} />,
  <IDBadge key="c" w={80} title="FDE" />,
  <Tile key="d" w={150} seed={2} />,
  <Agent key="e" w={100} blue={false} />,
];
export const H4: React.FC = () => {
  const f = useCurrentFrame();
  const veil = [1, 0.62, 0.34, 0.2, 0.11];
  return (
    <AbsoluteFill>
      {STORY_OBJ.map((o, i) => (
        <Piece key={i} x={960} y={130 + i * 205} at={2 + i * 4}>
          <div style={{opacity: veil[i] * (0.7 + 0.3 * e01(f, 10 + i * 4, 30)), display: 'flex', justifyContent: 'center', width: 500, transform: 'scale(1.35)'}}>{o}</div>
        </Piece>
      ))}
    </AbsoluteFill>
  );
};

/* ================================================================== PREVIEW */
const TILES: {logo: string; fit: number; node: React.ReactNode}[] = [
  {logo: 'nvidia', fit: 0.7, node: <Cutout src="cut/spark_oblique.png" w={250} />},
  {logo: 'amazon', fit: 0.85, node: <USMap w={250} at={0} label={false} />},
  {logo: 'anthropic', fit: 0.85, node: <IDBadge w={100} title="Resident" />},
  {logo: 'tavus', fit: 0.85, node: <Tile w={230} seed={1} />},
  {logo: 'openai', fit: 0.75, node: <div style={{transform: 'scale(.4)'}}><Tangle w={560} k={0} /></div>},
];
const Preview: React.FC<{n: number}> = ({n}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {TILES.map((t, i) => {
        if (i > n) return null;
        const cur = i === n;
        const x = 225 + i * 367;
        return (
          <Piece key={i} x={x} y={540} at={cur ? 0 : -30} exit={n === 4}>
            <Panel w={330} h={460} r={R.lg} pad={0} blue={false} style={{opacity: cur ? 1 : 0.62, boxShadow: cur ? `inset 0 0 0 3px ${C.core}` : undefined}}>
              <div style={{position: 'absolute', top: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
                <Logo3D name={t.logo} w={240} h={130} at={cur ? 2 : -30} fit={t.fit} />
              </div>
              <div style={{position: 'absolute', top: 170, left: 0, right: 0, bottom: 30, display: 'grid', placeItems: 'center'}}>{t.node}</div>
              <div style={{position: 'absolute', left: 24, bottom: 18, fontFamily: F.mono, fontSize: 18, color: cur ? C.blueInk : C.ink3}}>{`0${i + 1}`}</div>
            </Panel>
          </Piece>
        );
      })}
    </AbsoluteFill>
  );
};
export const P0: React.FC = () => <Preview n={0} />;
export const P1: React.FC = () => <Preview n={1} />;
export const P2: React.FC = () => <Preview n={2} />;
export const P3: React.FC = () => <Preview n={3} />;
export const P4: React.FC = () => <Preview n={4} />;

/* ================================================================== STORY 1 · NVIDIA */
export const N0: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tB = w('prices', 0, 80) + 14;
  const up = e01(f, tB - 10, 22);
  return (
    <AbsoluteFill>
      <Piece x={420} y={260} at={0} shadow={false}>
        <Logo3D name="nvidia" w={380} h={260} at={0} fit={0.75} />
      </Piece>
      <Piece x={960} y={600} at={6} rot={-6}>
        <RamStick w={760} blue />
      </Piece>
      <Piece x={1500} y={330 - up * 60} at={tB - 14} rot={8}>
        <PriceTag price="$ ↑" w={300} />
      </Piece>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d={`M1300 820 C1400 ${760 - up * 200} 1470 ${620 - up * 160} 1560 ${520 - up * 140}`} fill="none" stroke={C.core} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - up} />
      </svg>
    </AbsoluteFill>
  );
};

export const N1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({length: 9}, (_, i) => {
        const x = 200 + ((i * 197) % 1520);
        const fall = e01(f, i * 2.5, 16, (t) => t * t);
        const y = -200 + fall * (640 + (i % 3) * 120);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${-30 + ((i * 37) % 60)}deg)`, filter: `drop-shadow(0 14px 22px rgba(10,58,140,.2)) blur(${(1 - fall) * 4}px)`}}>
            <RamStick w={300} blue={i === 4} />
          </div>
        );
      })}
      <Piece x={960} y={300} at={6}>
        <Big size={150}>“RAMpocalypse”</Big>
      </Piece>
    </AbsoluteFill>
  );
};

export const N2: React.FC = () => (
  <AbsoluteFill>
    <Piece x={660} y={560} at={0} from="drop" shadow={false}>
      <Cutout src="cut/spark_oblique.png" w={900} />
    </Piece>
    <Piece x={1500} y={430} at={10}>
      <Panel w={520} pad={14}>
        <div style={{width: 492, height: 277, borderRadius: R.md, overflow: 'hidden'}}>
          <SparkImg name="spark_front" />
        </div>
      </Panel>
    </Piece>
    <Piece x={1500} y={700} at={16}>
      <div style={{textAlign: 'center'}}>
        <Big size={64}>DGX Spark</Big>
        <div style={{fontFamily: F.mono, fontSize: 13, color: C.ink3, marginTop: 10}}>PHOTOS: DANIEL LU (DLLU) · CC BY-SA 4.0</div>
      </div>
    </Piece>
  </AbsoluteFill>
);

const SparkImg: React.FC<{name: string}> = ({name}) => <Img src={staticFile(`news1003/photos/${name}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;

export const N3: React.FC = () => {
  const f = useCurrentFrame();
  const fwd = e01(f, 26, 16);
  return (
    <AbsoluteFill>
      <Piece x={620} y={560} at={0} shadow={false}>
        <div style={{opacity: 1 - fwd * 0.45, transform: `scale(${1 - fwd * 0.12})`}}>
          <Cutout src="cut/spark_oblique.png" w={640} />
        </div>
      </Piece>
      <Piece x={1320} y={560} at={4} shadow={false}>
        <div style={{transform: `translateY(${fwd * 40}px) scale(${1 + fwd * 0.12})`, position: 'relative'}}>
          <div style={{position: 'absolute', left: '10%', right: '10%', bottom: -10, height: 60, borderRadius: '50%', background: 'rgba(5,113,248,.5)', filter: 'blur(26px)', opacity: fwd}} />
          <Cutout src="cut/spark_oblique.png" w={640} />
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

export const N4: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const t64 = w('sixtyfour', 0, 120);
  const k = e01(f, t64 - 6, 14);
  return (
    <AbsoluteFill>
      <Piece x={760} y={520} at={2}>
        <MemStack n={8} on={8 - Math.round(k * 4)} w={520} blue={k > 0.5} />
      </Piece>
      <Piece x={760} y={900} at={6}>
        <div style={{position: 'relative', height: 120, width: 600}}>
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 1 - k}}>
            <Big size={110}>128 GB</Big>
          </div>
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: k}}>
            <Big size={110} color={C.blueInk}>64 GB</Big>
          </div>
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

export const N5: React.FC = () => {
  const w = useW();
  const tP = w('four', 0, 20);
  return (
    <AbsoluteFill>
      <Piece x={640} y={540} at={0} rot={-4}>
        <CalPage month="OCT" day={23} year="2026" w={340} />
      </Piece>
      <Piece x={1260} y={540} at={tP - 4} rot={6} from="r">
        <PriceTag price="$4,999" w={520} blue sub="64 GB · from" />
      </Piece>
    </AbsoluteFill>
  );
};

export const N6: React.FC = () => {
  const f = useCurrentFrame();
  const tip = 0.12 * Math.sin(f / 16) * e01(f, 20, 20);
  return (
    <AbsoluteFill>
      <Piece x={960} y={520} at={0}>
        <Balance w={1100} tip={tip} left={<Cutout src="cut/spark_oblique.png" w={300} />} right={<Cutout src="cut/spark_oblique.png" w={300} />} />
      </Piece>
      <Piece x={520} y={640} at={6}>
        <Kicker text="64 GB · $4,999" at={6} size={26} />
      </Piece>
      <Piece x={1400} y={640} at={10}>
        <Kicker text="128 GB · ?" at={10} size={26} />
      </Piece>
    </AbsoluteFill>
  );
};

export const N7: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tJ = w('jumped', 0, 40);
  const k = e01(f, tJ - 4, 22);
  const maxH = 620;
  const bar = (v: number) => (v / 9000) * maxH;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 520, right: 520, bottom: 200, height: 3, background: C.line}} />
      <Piece x={760} y={880 - bar(3999) / 2} at={2}>
        <div style={{width: 260, height: bar(3999), borderRadius: `${R.md}px ${R.md}px 0 0`, background: 'linear-gradient(160deg,#FDFDFE,#C9D2DE)'}} />
      </Piece>
      <Piece x={760} y={880 - bar(3999) - 60} at={6}>
        <Big size={60}>$3,999</Big>
      </Piece>
      <Piece x={760} y={930} at={6}>
        <Kicker text="128 GB · at launch" at={6} />
      </Piece>
      <div style={{position: 'absolute', left: 1030, width: 260, bottom: 200, height: bar(7000 + 2000 * 0) * k, borderRadius: `${R.md}px ${R.md}px 0 0`, background: `linear-gradient(160deg, ${C.face}, ${C.core} 62%)`}} />
      <div style={{position: 'absolute', left: 1030, width: 260, bottom: 200 + bar(7000) * k, height: bar(2000) * k, borderRadius: `${R.md}px ${R.md}px 0 0`, background: 'rgba(5,113,248,.25)', borderTop: `3px dashed ${C.core}`}} />
      <Piece x={1160} y={880 - bar(9000) * k - 60} at={tJ}>
        <Big size={60} color={C.blueInk}>
          $7,000–9,000
        </Big>
      </Piece>
      <Piece x={1160} y={930} at={tJ}>
        <Kicker text="128 GB · now, by retailer" at={tJ} />
      </Piece>
      <Source text="Tom's Hardware, Oct 2026" at={tJ} />
    </AbsoluteFill>
  );
};

export const N8: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tCore = w('twentycore', 0, 50);
  const tCx = w('connect', 0, 110);
  const lit = Math.floor(20 * e01(f, tCore - 4, 26, (x) => x));
  return (
    <AbsoluteFill>
      <Piece x={560} y={500} at={0}>
        <Chip w={420} lit={lit} />
      </Piece>
      <Piece x={560} y={830} at={tCore - 2}>
        <Big size={56}>20-core Arm CPU</Big>
      </Piece>
      <Piece x={1340} y={470} at={tCx - 20} shadow={false}>
        <div style={{position: 'relative'}}>
          <Cutout src="cut/spark_rear.png" w={760} />
          <div style={{position: 'absolute', left: '77%', top: '64%', width: 160, height: 60}}>
            <Ring w={170} h={70} at={tCx} />
          </div>
        </div>
      </Piece>
      <Piece x={1340} y={830} at={tCx}>
        <Big size={56}>ConnectX-7</Big>
      </Piece>
    </AbsoluteFill>
  );
};

export const N9: React.FC = () => {
  const f = useCurrentFrame();
  const w = useW();
  const tPool = w('pool', 0, 70);
  const cable = e01(f, 16, 18);
  const merge = e01(f, tPool - 6, 18);
  return (
    <AbsoluteFill>
      <Piece x={520} y={360} at={0} shadow={false}>
        <Cutout src="cut/spark_oblique.png" w={480} />
      </Piece>
      <Piece x={1400} y={360} at={4} shadow={false}>
        <Cutout src="cut/spark_oblique.png" w={480} />
      </Piece>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d="M720 420 C900 560 1020 560 1200 420" fill="none" stroke={C.core} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cable} />
      </svg>
      <Piece x={520 + merge * 440} y={820} at={8}>
        <MemStack n={4} w={300} />
      </Piece>
      <Piece x={1400 - merge * 440} y={820 - merge * 84} at={10}>
        <MemStack n={4} w={300} blue={merge > 0.9} />
      </Piece>
      <Piece x={960} y={1000} at={tPool + 6}>
        <Big size={54} color={C.blueInk}>
          64 + 64 GB
        </Big>
      </Piece>
    </AbsoluteFill>
  );
};

export const N10: React.FC = () => {
  const f = useCurrentFrame();
  const w = useW();
  const tFit = w('need', 0, 50);
  const tNot = w('using', 0, 150);
  const drop = e01(f, tFit - 4, 18);
  return (
    <AbsoluteFill>
      <Piece x={960} y={560} at={0}>
        <div style={{position: 'relative', width: 880, height: 440}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 440, height: 440, borderRadius: R.lg, border: `4px solid ${C.core}`, background: 'rgba(5,113,248,.06)'}} />
          <div style={{position: 'absolute', left: 440, top: 0, width: 440, height: 440, borderRadius: R.lg, border: `4px dashed ${C.ink3}`, opacity: 1 - 0.6 * e01(f, tNot - 8, 14)}} />
          <div style={{position: 'absolute', left: 60, top: 60 - (1 - drop) * 300, opacity: drop}}>
            <Box3 w={240} h={220} d={0.3} blue />
          </div>
          <div style={{position: 'absolute', left: 120, top: 456, fontFamily: F.display, fontWeight: 600, fontSize: 52, color: C.blueInk}}>64 GB</div>
          <div style={{position: 'absolute', left: 560, top: 456, fontFamily: F.display, fontWeight: 600, fontSize: 52, color: C.ink3}}>+64 GB</div>
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

export const N11: React.FC = () => {
  const f = useCurrentFrame();
  const sc = useScene();
  const slow = 1 - 0.7 * e01(f, 0, sc.dur);
  const rot = f * 1.6 * slow;
  return (
    <AbsoluteFill>
      <Piece x={520} y={560} at={0} shadow={false}>
        <Gear r={170} rot={rot} />
      </Piece>
      <Piece x={1400} y={560} at={2} shadow={false}>
        <Gear r={170} rot={-rot} />
      </Piece>
      <div style={{position: 'absolute', left: 520, width: 880, top: 400, height: 320, borderRadius: 160, border: `14px solid #2A3442`, boxSizing: 'border-box', opacity: e01(f, 4, 10)}} />
      {Array.from({length: 7}, (_, i) => {
        const x = 560 + ((i * 130 + f * 2.2 * slow) % 800);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: 368, opacity: e01(f, 6, 10)}}>
            <Chip w={70} lit={i === 3 ? 20 : 0} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
