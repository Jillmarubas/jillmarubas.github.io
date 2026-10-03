import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BLUE_FILL, C, F, R} from './design';
import {Big, Counter, e01, Kicker, Panel, Photo, Piece, Quote, Silhouette, Source, useScene, useW} from './kit';
import {Logo3D} from './Logo3D';
import {Box3, Brick, Bucket, CalPage, Certificate, DataCentre, DotField, Gauge, GradCap, HardHat, House, Lamp, School, Sign, TrainingCentre, Tree, WorldMap} from './propsA';
import {Bottle, Doc, Doors, IDBadge, Landmark, Person, Stethoscope, Toolbox, Tower, Weeks} from './propsB';

/* Story 2 (Amazon's Built Together) and story 3 (Anthropic's Claude Frontier Academy). */

/* ------------------------------------------------------------------ the data-centre town (a replica: low homes, street trees, a lamp, the hall behind) */
const Town: React.FC<{signs?: number; press?: number; at?: number}> = ({signs = 0, press = 0, at = 0}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 820, height: 260, background: 'linear-gradient(180deg, rgba(175,190,210,.55), rgba(205,221,236,0))'}} />
    <Piece x={960 + press * 0} y={520} at={at}>
      <DataCentre w={1180} />
    </Piece>
    {[0, 1, 2, 3, 4].map((i) => (
      <Piece key={i} x={260 + i * 350 + (i < 2 ? press * 60 : i > 2 ? -press * 60 : 0)} y={820 - press * 14} at={at + 4 + i * 2}>
        <House w={210} tone={i + 1} />
      </Piece>
    ))}
    {[0, 1, 2, 3].map((i) => (
      <Piece key={i} x={430 + i * 350} y={790} at={at + 8 + i}>
        <Tree w={110} seed={i} />
      </Piece>
    ))}
    <Piece x={110} y={760} at={at + 10}>
      <Lamp h={280} />
    </Piece>
    {Array.from({length: 5}, (_, i) => (
      <Piece key={i} x={420 + i * 280} y={1000} at={signs + i * 3} from="b">
        <Sign w={120} rot={-8 + i * 4} />
      </Piece>
    ))}
  </>
);

export const A0: React.FC = () => {
  const w = useW();
  const tB = w('backlash', 0, 140);
  return (
    <AbsoluteFill>
      <Town signs={tB - 4} />
      <Piece x={1720} y={170} at={4} shadow={false}>
        <Logo3D name="amazon" w={340} h={160} at={4} fit={0.8} />
      </Piece>
    </AbsoluteFill>
  );
};

export const A1: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tFive = w('fiveyear', 0, 14);
  const tB = w('onebilliondollar', 0, 30);
  const tName = w('built', 0, 80);
  return (
    <AbsoluteFill>
      <Piece x={960} y={190} at={0} shadow={false}>
        <Logo3D name="amazon" w={460} h={220} at={0} fit={0.82} />
      </Piece>
      <Piece x={620} y={560} at={tB - 4} from="l">
        <Brick w={520} label="$1B" />
      </Piece>
      <div style={{position: 'absolute', left: 1100, top: 470, display: 'flex', gap: 14}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const k = e01(f, tFive + i * 3, 9);
          return (
            <div key={i} style={{width: 112, height: 150, borderRadius: R.sm, background: C.surface, opacity: k, transform: `translateY(${(1 - k) * 30}px)`, display: 'grid', placeItems: 'center', fontFamily: F.mono, fontSize: 18, color: C.ink2, boxShadow: '0 12px 24px -10px rgba(10,58,140,.25)'}}>
              {`YR ${i + 1}`}
            </div>
          );
        })}
      </div>
      <Piece x={960} y={880} at={tName - 2}>
        <Big size={96}>“Built Together”</Big>
      </Piece>
    </AbsoluteFill>
  );
};

export const A2: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const t = w('threehundred', 0, 70);
  const shown = Math.floor(300 * e01(f, t - 4, 30, (x) => x));
  return (
    <AbsoluteFill>
      <Piece x={420} y={480} at={0} rot={-8}>
        <GradCap w={420} />
      </Piece>
      <Piece x={1230} y={470} at={8}>
        <DotField cols={25} rows={12} shown={shown} w={900} />
      </Piece>
      <Piece x={1230} y={850} at={t - 2}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <Counter to={300000} at={t - 2} dur={30} size={96} color={C.blueInk} />
          <span style={{fontFamily: F.mono, fontSize: 22, color: C.ink2, letterSpacing: '0.06em'}}>STUDENTS · 1 DOT = 1,000</span>
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

export const A3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 170, top: 210, display: 'grid', gridTemplateColumns: 'repeat(8, 130px)', gap: 26}}>
        {Array.from({length: 16}, (_, i) => {
          const k = e01(f, 2 + i * 1.6, 9);
          return (
            <div key={i} style={{opacity: k, transform: `translateY(${(1 - k) * 30}px)`, filter: 'drop-shadow(0 10px 16px rgba(10,58,140,.18))'}}>
              <TrainingCentre w={130} />
            </div>
          );
        })}
      </div>
      <Piece x={560} y={760} at={30}>
        <Counter to={16} at={30} dur={14} size={150} color={C.blueInk} />
      </Piece>
      <Piece x={1100} y={790} at={36} rot={-6}>
        <HardHat w={240} />
      </Piece>
      <Piece x={1520} y={790} at={42} rot={5}>
        <Certificate w={330} />
      </Piece>
    </AbsoluteFill>
  );
};

export const A4: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tS = w('schools', 0, 60);
  const tH = w('homes', 0, 90);
  return (
    <AbsoluteFill>
      <Piece x={560} y={470} at={0}>
        <School w={600} upgrade={e01(f, tS - 4, 12)} />
      </Piece>
      <Piece x={1380} y={470} at={6}>
        <House w={420} upgrade={e01(f, tH - 4, 12)} blue={false} tone={2} />
      </Piece>
      <Piece x={560} y={860} at={tS - 2}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
          <Counter to={300} at={tS - 2} dur={18} size={110} suffix="+" />
          <span style={{fontFamily: F.mono, fontSize: 24, color: C.ink2}}>SCHOOLS</span>
        </div>
      </Piece>
      <Piece x={1380} y={860} at={tH - 2}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
          <Counter to={30000} at={tH - 2} dur={22} size={110} suffix="+" color={C.blueInk} />
          <span style={{fontFamily: F.mono, fontSize: 24, color: C.ink2}}>HOMES</span>
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

export const A5: React.FC = () => (
  <AbsoluteFill>
    <Piece x={760} y={520} at={0}>
      <Photo slug="garman" name="Matt Garman" role="CEO, Amazon Web Services" w={440} h={460} pos="50% 30%" />
    </Piece>
    <Piece x={1380} y={420} at={10} shadow={false}>
      <Logo3D name="aws" w={380} h={240} at={10} fit={0.8} />
    </Piece>
  </AbsoluteFill>
);

export const A6: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const t = w('hundred', 0, 20);
  const shown = Math.floor(100 * e01(f, t - 2, 26, (x) => x));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 230, top: 170, display: 'grid', gridTemplateColumns: 'repeat(20, 52px)', gap: 18}}>
        {Array.from({length: 100}, (_, i) => (
          <div key={i} style={{width: 52, height: 52, opacity: i < shown ? 1 : 0.12}}>
            <svg viewBox="0 0 52 52" width={52} height={52}>
              <rect x={4} y={14} width={44} height={14} rx={4} fill={i < shown ? C.core : C.ink3} />
              <rect x={10} y={28} width={5} height={20} fill="#7B8695" />
              <rect x={37} y={28} width={5} height={20} fill="#7B8695" />
              <path d="M12 14 L20 28 M26 14 L34 28 M40 14 L46 24" stroke="#fff" strokeWidth={4} />
            </svg>
          </div>
        ))}
      </div>
      <Piece x={960} y={850} at={t + 8}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <Counter to={100} at={t + 8} dur={14} size={120} suffix="+" color={C.blueInk} />
          <span style={{fontFamily: F.mono, fontSize: 24, color: C.ink2, letterSpacing: '0.06em'}}>DATA CENTER MORATORIUMS</span>
        </div>
      </Piece>
      <Source text="AWS / Matt Garman, Oct 2026" at={t} />
    </AbsoluteFill>
  );
};

export const A7: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tStop = w('stop', 0, 60);
  const tear = e01(f, tStop - 2, 14);
  return (
    <AbsoluteFill>
      <Piece x={330} y={560} at={0}>
        <svg width={300} height={300} viewBox="0 0 100 100">
          <path d="M8 34 L50 10 L92 34 Z" fill="#5E6B7C" />
          <rect x={12} y={34} width={76} height={6} fill="#C9D2DE" />
          {[18, 34, 50, 66, 82].map((x) => (
            <rect key={x} x={x - 3} y={40} width={6} height={44} fill="#E9EDF2" />
          ))}
          <rect x={6} y={84} width={88} height={8} fill="#C9D2DE" />
        </svg>
      </Piece>
      <Piece x={960} y={540} at={6} rot={-3}>
        <Doc w={380} title="NDA" lines={10} seed="nda" tear={tear} />
      </Piece>
      <Piece x={1560} y={560} at={8}>
        <DataCentre w={420} />
      </Piece>
    </AbsoluteFill>
  );
};

/** A meeting table seen from the front: officials seated behind it, residents in front; two empty seats fill as the doors open. */
export const A8: React.FC = () => {
  const f = useCurrentFrame();
  const fill = e01(f, 12, 14);
  const P = '#9AA7B8';
  const chair = '#3B4757';
  // seated person, upper body only (the table hides the rest); `o` fades a newly seated person in
  const Seated: React.FC<{x: number; y: number; s?: number; color?: string; o?: number}> = ({x, y, s = 1, color = P, o = 1}) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <path d="M-44 0 C-44 -46 -26 -62 0 -62 C26 -62 44 -46 44 0 Z" fill={color} />
      <circle cx={0} cy={-88} r={26} fill={color} />
    </g>
  );
  const ChairBack: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-40} y={-110} width={80} height={120} rx={20} fill={chair} />
    </g>
  );
  return (
    <AbsoluteFill>
      <Piece x={960} y={580} at={0}>
        <svg width={1300} height={640} viewBox="0 0 1300 640" style={{overflow: 'visible', display: 'block'}}>
          {/* far side: four seats behind the table, the middle two empty until they fill */}
          {[340, 540, 760, 960].map((x, i) => (
            <ChairBack key={x} x={x} y={222} s={0.9} />
          ))}
          <Seated x={340} y={236} s={0.9} />
          <Seated x={540} y={236} s={0.9} color={C.core} o={fill} />
          <Seated x={760} y={236} s={0.9} color={C.core} o={fill} />
          <Seated x={960} y={236} s={0.9} />
          {/* the table: top, then its front edge */}
          <ellipse cx={650} cy={316} rx={520} ry={80} fill="#D3DBE6" />
          <ellipse cx={650} cy={302} rx={520} ry={80} fill="#FBFCFD" />
          <ellipse cx={650} cy={302} rx={470} ry={62} fill="none" stroke="rgba(16,21,28,.05)" strokeWidth={2} />
          {/* papers on the table */}
          {[470, 650, 830].map((x, i) => (
            <rect key={x} x={x - 40} y={292 - (i % 2) * 6} width={80} height={30} rx={4} fill="#fff" stroke="#DCE3ED" strokeWidth={2} transform={`rotate(${-8 + i * 8} ${x} 300)`} />
          ))}
          {/* near side: three people with their backs to us, in chairs */}
          {[420, 650, 880].map((x) => (
            <g key={x}>
              <circle cx={x} cy={372} r={30} fill="#7B8695" />
              <path d={`M${x - 64} 494 C${x - 64} 432 ${x - 40} 410 ${x} 410 C${x + 40} 410 ${x + 64} 432 ${x + 64} 494 Z`} fill="#7B8695" />
              <rect x={x - 48} y={452} width={96} height={96} rx={22} fill={chair} />
            </g>
          ))}
        </svg>
      </Piece>
    </AbsoluteFill>
  );
};

export const A9: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tYear = w('year', 0, 60);
  const tCap = w('two', 1, 130);
  const zoom = e01(f, tCap + 10, 18);
  return (
    <AbsoluteFill>
      <Piece x={960} y={430} at={2}>
        <div style={{position: 'relative', width: 1500, height: 300}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: R.lg, background: 'linear-gradient(160deg,#FDFDFE,#C9D2DE 75%)'}} />
          <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: Math.max(4, 1500 * (0.2 / 220)), background: C.core, borderRadius: '0 34px 34px 0', opacity: e01(f, tYear, 8)}} />
          <div style={{position: 'absolute', left: 40, top: 36}}>
            <Big size={110}>$220B</Big>
            <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink2, marginTop: 12, letterSpacing: '0.06em'}}>AMAZON 2026 CAPITAL SPENDING (PLAN)</div>
          </div>
        </div>
      </Piece>
      <Piece x={1500} y={840} at={tYear} from="b">
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <div style={{width: 200 * (0.6 + 0.4 * zoom), height: 120, borderRadius: R.md, background: BLUE_FILL, boxShadow: `inset 1.5px 1.5px 0 ${C.rim}`}} />
          <div>
            <Big size={72} color={C.blueInk}>
              $200M / yr
            </Big>
            <div style={{fontFamily: F.mono, fontSize: 22, color: C.ink2, marginTop: 8}}>≈ 0.1 % · $1B ÷ 5 YEARS</div>
          </div>
        </div>
      </Piece>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: e01(f, tYear + 4, 10)}}>
        <path d="M1706 590 L1520 770" stroke={C.core} strokeWidth={3} strokeDasharray="8 8" />
      </svg>
      <Source text="Amazon Q2 2026 earnings; Built Together" at={tYear} />
    </AbsoluteFill>
  );
};

export const A10: React.FC = () => {
  const f = useCurrentFrame();
  const w = useW();
  const tDrop = w('drop', 0, 30);
  return (
    <AbsoluteFill>
      <Piece x={960} y={600} at={0}>
        <Bucket w={420} drop={e01(f, tDrop - 8, 14, (x) => x) + e01(f, tDrop + 6, 20, (x) => x)} />
      </Piece>
    </AbsoluteFill>
  );
};

export const A11: React.FC = () => {
  const f = useCurrentFrame();
  const sc = useScene();
  const p = e01(f, 10, sc.dur - 30);
  return (
    <AbsoluteFill>
      <Town press={p} at={0} />
      <Piece x={1700} y={200} at={8}>
        <Gauge w={300} v={0.3 + 0.6 * p} />
      </Piece>
    </AbsoluteFill>
  );
};

/* ================================================================== STORY 3 · ANTHROPIC */
export const C0: React.FC = () => {
  const f = useCurrentFrame();
  const w = useW();
  const tAcad = w('academy', 0, 60);
  const tM = w('hundredmilliondollar', 0, 120);
  return (
    <AbsoluteFill>
      <Piece x={420} y={240} at={0} shadow={false}>
        <Logo3D name="anthropic" w={420} h={200} at={0} fit={0.8} />
      </Piece>
      <Piece x={960} y={560} at={tAcad - 10}>
        <Doors w={480} open={e01(f, tAcad, 22)} />
      </Piece>
      <Piece x={1530} y={720} at={tM - 4} from="r">
        <Brick w={400} label="$100M" />
      </Piece>
      <Piece x={960} y={960} at={tAcad}>
        <Big size={60}>Claude Frontier Academy</Big>
      </Piece>
    </AbsoluteFill>
  );
};

export const C1: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const t = w('ten', 0, 20);
  const shown = Math.floor(100 * e01(f, t - 2, 28, (x) => x));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 200, top: 170, display: 'grid', gridTemplateColumns: 'repeat(20, 50px)', gap: 12}}>
        {Array.from({length: 100}, (_, i) => (
          <div key={i} style={{opacity: i < shown ? 1 : 0.15}}>
            <Person w={50} blue={i < shown} />
          </div>
        ))}
      </div>
      <Piece x={560} y={890} at={t}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
          <Counter to={10000} at={t} dur={28} size={110} color={C.blueInk} />
          <span style={{fontFamily: F.mono, fontSize: 20, color: C.ink2}}>ENGINEERS · 1 = 100</span>
        </div>
      </Piece>
      <Piece x={1500} y={840} at={t + 20} rot={4}>
        <CalPage month="DEC" day={31} year="2027" w={240} />
      </Piece>
    </AbsoluteFill>
  );
};

export const C2: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tScarce = w('scarce', 0, 160);
  return (
    <AbsoluteFill>
      <Piece x={460} y={720} at={0} rot={-4}>
        <Toolbox w={360} />
      </Piece>
      <Piece x={460} y={400} at={6} shadow={false}>
        <Logo3D name="claude" w={260} h={260} at={6} fit={0.75} />
      </Piece>
      <Piece x={1300} y={560} at={10}>
        <Tower w={300} lit={f > tScarce - 6 ? [7, 33, 58] : [7, 33, 58, 12, 21, 40, 47, 63].slice(0, 3 + Math.floor(e01(f, 30, 60) * 0))} />
      </Piece>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d="M640 640 C860 640 980 520 1120 520" fill="none" stroke={C.core} strokeWidth={5} strokeDasharray="10 10" opacity={e01(f, 20, 10)} />
      </svg>
    </AbsoluteFill>
  );
};

export const C3: React.FC = () => (
  <AbsoluteFill>
    <Piece x={680} y={540} at={0} rot={-10}>
      <Stethoscope w={380} />
    </Piece>
    <Piece x={1260} y={520} at={6} rot={4}>
      <IDBadge w={330} title="Claude Resident Engineer" />
    </Piece>
  </AbsoluteFill>
);

export const C4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Piece x={960} y={560} at={0}>
        <div style={{position: 'relative', width: 1100, height: 440}}>
          <div style={{position: 'absolute', left: 100, right: 100, top: 210, height: 60, borderRadius: 30, background: 'linear-gradient(180deg,#FBFCFD,#D3DBE6)'}} />
          {Array.from({length: 6}, (_, i) => (
            <div key={i} style={{position: 'absolute', left: 150 + i * 140, top: 100, opacity: e01(f, 6 + i * 2, 9)}}>
              <Person w={90} blue={i === 2} />
            </div>
          ))}
          <div style={{position: 'absolute', left: 470, top: 300, display: 'flex', gap: 10}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{width: 46, height: 46, borderRadius: 10, background: e01(f, 24 + i * 6, 6) > 0.5 ? BLUE_FILL : C.surface}} />
            ))}
          </div>
        </div>
      </Piece>
      <Piece x={1720} y={210} at={10} shadow={false}>
        <Logo3D name="anthropic" w={300} h={140} at={10} fit={0.8} />
      </Piece>
    </AbsoluteFill>
  );
};

export const C5: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const t12 = w('twelveweek', 0, 20);
  const n = 12 * e01(f, t12, 80, (x) => x);
  const flip = e01(f, t12 + 90, 12);
  return (
    <AbsoluteFill>
      <Piece x={760} y={400} at={0}>
        <Weeks total={12} n={n} w={1300} />
      </Piece>
      <Piece x={760} y={640} at={t12}>
        <Big size={64}>12 weeks</Big>
      </Piece>
      <Piece x={1640} y={560} at={6} rot={4}>
        <div style={{transform: `scaleX(${Math.max(0.02, Math.abs(Math.cos(flip * Math.PI)))})`}}>
          {flip < 0.5 ? <IDBadge w={260} title="Claude Resident Engineer" /> : <IDBadge w={260} title="Claude Frontier Deployed Engineer" blue />}
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

const COHORT: [string, number, string][] = [
  ['accenture', 0.82, 'accenture'],
  ['bain', 0.8, 'bain'],
  ['deloitte', 0.8, 'deloitte'],
  ['mckinsey', 0.8, 'mckinsey'],
  ['morganstanley', 0.8, 'morgan'],
  ['', 0, 'novo'],
];
export const C6: React.FC = () => {
  const w = useW();
  const sc = useScene();
  return (
    <AbsoluteFill>
      {COHORT.map(([logo, fit, word], i) => {
        const t = Math.min(w(word, 0, 10 + i * 16), sc.dur - 40 + i * 2);
        const x = 380 + (i % 3) * 580;
        const y = 350 + Math.floor(i / 3) * 380;
        return (
          <Piece key={i} x={x} y={y} at={t - 4}>
            <Panel w={520} h={290} r={R.lg} pad={0}>
              <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
                {logo ? <Logo3D name={logo} w={480} h={250} at={t - 4} fit={fit} tilt={-6} depth={0.035} shadowOpacity={0.08} /> : <div style={{fontFamily: F.display, fontWeight: 600, fontSize: 60, color: '#001965', letterSpacing: '-0.02em'}}>Novo Nordisk</div>}
              </div>
            </Panel>
          </Piece>
        );
      })}
    </AbsoluteFill>
  );
};

export const C7: React.FC = () => {
  const w = useW();
  const tSF = w('san', 0, 6);
  const tNY = w('york', 0, 26);
  const tL = w('london', 0, 46);
  return (
    <AbsoluteFill>
      <Piece x={960} y={330} at={0} shadow={false}>
        <WorldMap w={1500} h={480} at={0} center={[-40, 30]} scale={1.9} pins={[{lon: -122.42, lat: 37.77, at: tSF}, {lon: -74.0, lat: 40.71, at: tNY}, {lon: -0.13, lat: 51.5, at: tL}]} />
      </Piece>
      {[
        ['sf', tSF, 'San Francisco', 380],
        ['ny', tNY, 'New York', 960],
        ['ldn', tL, 'London', 1540],
      ].map(([k, t, name, x]) => (
        <React.Fragment key={k as string}>
          <Piece x={x as number} y={810} at={(t as number) - 2}>
            <Landmark which={k as 'sf'} h={330} blue={k === 'ny'} />
          </Piece>
          <Piece x={x as number} y={1010} at={t as number}>
            <Kicker text={name as string} at={t as number} size={22} />
          </Piece>
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

export const C8: React.FC = () => {
  const w = useW();
  const tQ = w('trains', 0, 60);
  return (
    <AbsoluteFill>
      <Piece x={460} y={520} at={0}>
        <Silhouette name="Steve Corfield" role="Global Head of Business Development & Partnerships, Anthropic" w={380} h={420} />
      </Piece>
      <Piece x={1260} y={480} at={tQ - 4}>
        <Quote text="trains people the way our own engineers learn" at={tQ} size={68} width={980} />
      </Piece>
      <Source text="Anthropic, 2 Oct 2026" at={tQ} />
    </AbsoluteFill>
  );
};

export const C9: React.FC = () => {
  const f = useCurrentFrame();
  const w = useW();
  const tP = w('people', 0, 120);
  return (
    <AbsoluteFill>
      <Piece x={960} y={560} at={0}>
        <div style={{position: 'relative'}}>
          <Bottle w={380} />
          {Array.from({length: 5}, (_, i) => {
            const y = 470 - ((f * 3 + i * 90) % 450);
            return (
              <div key={i} style={{position: 'absolute', left: 150, top: y, opacity: y < 30 ? 0 : 1}}>
                <Box3 w={70} h={46} blue={i === 2} />
              </div>
            );
          })}
        </div>
      </Piece>
      {Array.from({length: 9}, (_, i) => (
        <Piece key={i} x={1300 + (i % 3) * 110} y={420 + Math.floor(i / 3) * 150} at={tP - 6 + i * 2}>
          <Person w={80} />
        </Piece>
      ))}
    </AbsoluteFill>
  );
};
