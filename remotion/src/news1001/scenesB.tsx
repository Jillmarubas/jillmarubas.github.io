import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, F} from './design';
import {Logo3D} from './Logo3D';
import {Place3D} from './Places';
import {WorldMap} from './maps';
import {Arrow, Counter, Hand, Kicker, Paper, Photo, Piece, Source, Stamp, Tape, clamp, e01, settle, useL, useScene} from './kit';
import {Badge, CalPage, Clipboard, Clipping, Doc, Flask, Folder, Gauge, Magnifier, Padlock, RoundTable, Scale} from './props';

const seal = (n: string, s = 110) => <Img src={staticFile(`news1001/logos/${n}.svg`)} style={{width: s, height: s}} />;

/* =================================================================== STORY 2: THE FTC PROBE */

/** Line 0: the FTC's headquarters; a sweeping probe of OpenAI, Anthropic and other labs. */
export const F0: React.FC = () => {
  const L = useL();
  const sc = useScene();
  return (
    <AbsoluteFill>
      <Piece x={800} y={560} at={0} from="none" shadow={false}>
        <div style={{width: 1500, height: 1000}}>
          <Place3D which="ftc" w={1500} h={1000} at={0} dur={sc.dur} orbit={-16} push={3} cam={[-20, 14, 24]} />
        </div>
      </Piece>
      <Piece x={330} y={120} at={8} from="none" shadow={false}>
        <div>
          <Kicker text="Federal Trade Commission" at={8} color={C.ink} />
          <Kicker text="Apex Building · 600 Pennsylvania Ave NW" at={14} size={17} />
        </div>
      </Piece>
      <Piece x={1640} y={360} at={L(0) + 60} from="r" rot={4}>
        <Folder w={360} h={420} label="OpenAI · Anthropic · other AI labs" color="#D9C9A3">
          <div style={{position: 'absolute', left: 30, top: 70, display: 'flex', flexDirection: 'column', gap: 6}}>
            <Logo3D name="openai" w={150} h={140} at={L(0) + 66} fit={0.75} spin={0} />
            <Logo3D name="anthropic" w={150} h={140} at={L(0) + 72} fit={0.75} spin={0} />
          </div>
          <div style={{position: 'absolute', right: 26, top: 90}}>{seal('seal_ftc', 120)}</div>
        </Folder>
      </Piece>
    </AbsoluteFill>
  );
};

/** Line 1: multiple outlets confirm it. */
export const F1: React.FC = () => (
  <AbsoluteFill>
    {['Reuters', 'New York Post', 'The Decoder', 'Seeking Alpha'].map((n, i) => (
      <Piece key={n} x={600 + i * 230} y={470 + (i % 2) * 90} at={i * 6} from={i % 2 ? 'b' : 't'} rot={[-7, 4, -3, 6][i]}>
        <Clipping w={520} h={330} label={n} seed={n} />
      </Piece>
    ))}
    <Piece x={980} y={560} at={34} from="none" shadow={false} z={30}>
      <Stamp text="CONFIRMED" at={34} size={92} rot={-9} />
    </Piece>
  </AbsoluteFill>
);

/** Lines 2–3: Andrew Ferguson; a Civil Investigative Demand: documents, testimony, within weeks. */
export const F2: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const unfold = e01(f, 20, 18);
  return (
    <AbsoluteFill>
      <Piece x={380} y={520} at={0} from="l" rot={-3}>
        <Photo slug="ferguson" name="Andrew Ferguson" role="Chair, FTC" w={380} h={470} at={0} />
      </Piece>
      <Piece x={1000} y={520} at={14} from="b" rot={1.5}>
        <div style={{transform: `perspective(1400px) rotateX(${(1 - unfold) * 70}deg)`, transformOrigin: '50% 0'}}>
          <Doc w={560} h={720} title="Civil Investigative Demand" sub="Legally binding · FTC Act" seal={seal('seal_ftc', 100)} lines={13} seed="cid" />
        </div>
      </Piece>
      {/* line 3: boxes of documents, the empty witness chair, "within weeks" */}
      <Piece x={1560} y={300} at={L(1)} from="r" rot={-3}>
        <FileBoxes />
      </Piece>
      <Piece x={1560} y={720} at={L(1) + 34} from="r" rot={2}>
        <WitnessChair />
      </Piece>
      <Piece x={1300} y={960} at={L(1) + 70} from="none" shadow={false}>
        <Hand text="expected within weeks" at={L(1) + 70} size={52} color={C.red} rot={-2} />
      </Piece>
    </AbsoluteFill>
  );
};
const FileBoxes: React.FC = () => (
  <svg width={420} height={260} viewBox="0 0 420 260">
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${i * 120} ${i === 1 ? 0 : 60})`}>
        <rect x={10} y={40} width={150} height={150} fill="#C9A878" />
        <polygon points="10,40 40,10 190,10 160,40" fill="#D9BD92" />
        <polygon points="160,40 190,10 190,160 160,190" fill="#B08E62" />
        <rect x={50} y={80} width={70} height={30} fill="#F3ECDD" />
        <rect x={60} y={90} width={50} height={4} fill="#8C857A" />
        <rect x={60} y={100} width={36} height={4} fill="#8C857A" />
      </g>
    ))}
  </svg>
);
const WitnessChair: React.FC = () => (
  <svg width={380} height={320} viewBox="0 0 380 320">
    <rect x={20} y={200} width={340} height={20} fill="#6E4A2E" />
    <rect x={30} y={220} width={16} height={90} fill="#5A3B23" />
    <rect x={334} y={220} width={16} height={90} fill="#5A3B23" />
    <rect x={180} y={60} width={140} height={130} rx={10} fill="#7A2E2E" />
    <rect x={190} y={190} width={120} height={14} fill="#5A1F1F" />
    <rect x={196} y={204} width={12} height={90} fill="#3B2A1C" />
    <rect x={292} y={204} width={12} height={90} fill="#3B2A1C" />
    <rect x={88} y={120} width={8} height={80} fill="#2B2B2B" />
    <path d="M92 120 Q 110 90 140 86" stroke="#2B2B2B" strokeWidth={6} fill="none" />
    <rect x={136} y={70} width={22} height={36} rx={10} fill="#2B2B2B" />
  </svg>
);

/** Lines 4–5: the pledge on Sep 29, the probe public on Sep 30. Self-policing one day, an investigation the next. */
export const F3: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  return (
    <AbsoluteFill>
      <Piece x={520} y={360} at={0} from="l" rot={-4}>
        <CalPage month="SEP" day={29} year="2026" w={280} />
      </Piece>
      <Piece x={1400} y={360} at={8} from="r" rot={3}>
        <CalPage month="SEP" day={30} year="2026" w={280} />
      </Piece>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M660 300 Q 960 180 1260 300" fill="none" stroke={C.red} strokeWidth={4} strokeDasharray="10 8" pathLength={1} opacity={e01(f, 22, 8)} />
      </svg>
      <Piece x={960} y={210} at={26} from="none" shadow={false}>
        <Kicker text="one day apart" at={26} color={C.red} />
      </Piece>
      {/* line 5: the pledge (signatures) vs the investigation folder */}
      <Piece x={520} y={790} at={L(1) - 2} from="b" rot={-2}>
        <Doc w={520} h={380} title="Voluntary pledge" sub="White House · Sep 29" lines={3} seed="vp">
          <Signatures at={L(1) + 6} />
        </Doc>
      </Piece>
      <Piece x={1400} y={790} at={L(1) + 30} from="b" rot={2}>
        <Folder w={460} h={330} label="Formal investigation · FTC · Sep 30" color="#C9A878">
          <div style={{position: 'absolute', right: 26, top: 40}}>{seal('seal_ftc', 140)}</div>
        </Folder>
      </Piece>
    </AbsoluteFill>
  );
};
const Signatures: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  return (
    <svg width={430} height={200}>
      {Array.from({length: 6}, (_, i) => {
        const x = 10 + (i % 3) * 140;
        const y = 40 + Math.floor(i / 3) * 90;
        const d = `M${x} ${y} c 12 -26, 24 22, 36 -6 s 18 -20, 30 4 s 22 10, 50 -10`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="#1F3A68" strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e01(f, at + i * 6, 10)} />
            <line x1={x} y1={y + 18} x2={x + 120} y2={y + 18} stroke={C.mute} strokeWidth={1.5} />
          </g>
        );
      })}
    </svg>
  );
};

/** Lines 6–7: don't use regulation to box out rivals; squeezing out smaller competitors. */
export const F4: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const open = e01(f, L(1) + 10, 20);
  const big = [
    {x: 640, y: 420},
    {x: 1280, y: 420},
    {x: 960, y: 260},
  ];
  return (
    <AbsoluteFill>
      {big.map((b, i) => (
        <Piece key={i} x={b.x - (i === 0 ? open * 160 : i === 1 ? -open * 160 : 0)} y={b.y - (i === 2 ? open * 120 : 0)} at={i * 6} from={(['l', 'r', 't'] as const)[i]} rot={[-6, 6, 0][i]}>
          <div style={{width: 360, height: 360, background: '#2E2B27', boxShadow: 'inset -18px -18px 0 rgba(0,0,0,0.25)'}} />
        </Piece>
      ))}
      <Piece x={960} y={560} at={20} from="b">
        <div style={{width: 150, height: 150, background: C.red, boxShadow: 'inset -10px -10px 0 rgba(0,0,0,0.2)'}} />
      </Piece>
      <Piece x={960} y={860} at={8} from="none" shadow={false}>
        <div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
          <Photo slug="ferguson" name="Ferguson" w={150} h={170} at={8} />
          <Hand text="regulation as a way to box out rivals?" at={14} size={50} color={C.ink} rot={-2} />
        </div>
      </Piece>
      <Piece x={1500} y={600} at={L(1) + 30} from="r" rot={-8}>
        <Magnifier size={260} />
      </Piece>
    </AbsoluteFill>
  );
};

/* =================================================================== STORY 3: THE WHITE HOUSE ACCORD */

/** Line 0: the White House. */
export const A0: React.FC = () => {
  const sc = useScene();
  return (
    <AbsoluteFill>
      <Piece x={960} y={540} at={0} from="none" shadow={false}>
        <div style={{width: 1920, height: 1080}}>
          <Place3D which="whitehouse" w={1920} h={1080} at={0} dur={sc.dur} orbit={-12} push={7} cam={[6, 10, 34]} look={[0, 3, 2]} />
        </div>
      </Piece>
      <Piece x={250} y={980} at={10} from="none" shadow={false}>
        <Kicker text="The White House · North Lawn" at={10} color={C.ink} />
      </Piece>
    </AbsoluteFill>
  );
};

/** Line 1: Sep 29, the "White House Accord on Super Intelligence". */
export const A1: React.FC = () => (
  <AbsoluteFill>
    <Piece x={880} y={540} at={0} from="b" rot={-1.5}>
      <Doc w={760} h={940} title="White House Accord on Super Intelligence" sub="The White House · September 29, 2026" seal={seal('seal_potus', 130)} lines={16} seed="acc" />
    </Piece>
    <Piece x={1500} y={330} at={20} from="none" shadow={false} z={20}>
      <Stamp text="SEP 29 2026" at={20} size={56} rot={8} color="#1F3A68" />
    </Piece>
    <Source text="Washington Examiner (full text); Al Jazeera" />
  </AbsoluteFill>
);

/** Lines 2–3: the six who signed: photo and company mark, one by one as they're named. */
const SIGNERS: {slug: string; name: string; co: string; logo: string; fit?: number}[] = [
  {slug: 'amodei', name: 'Dario Amodei', co: 'Anthropic', logo: 'anthropic'},
  {slug: 'brockman', name: 'Greg Brockman', co: 'OpenAI', logo: 'openai'},
  {slug: 'pichai', name: 'Sundar Pichai', co: 'Google', logo: 'google'},
  {slug: 'zuckerberg', name: 'Mark Zuckerberg', co: 'Meta', logo: 'meta', fit: 0.95},
  {slug: 'musk', name: 'Elon Musk', co: 'xAI', logo: 'xai'},
  {slug: 'huang', name: 'Jensen Huang', co: 'Nvidia', logo: 'nvidia'},
];
export const A2: React.FC = () => {
  const L = useL();
  // the voiceover names them in two lines of three, evenly
  const span0 = L(1) - L(0);
  const span1 = Math.max(60, L(2) - L(1));
  const at = (i: number) => (i < 3 ? L(0) + (i * span0) / 3 : L(1) + ((i - 3) * span1) / 3) - 4;
  return (
    <AbsoluteFill>
      {SIGNERS.map((s, i) => {
        const x = 200 + i * 304;
        return (
          <React.Fragment key={s.slug}>
            <Piece x={x} y={430 + (i % 2) * 40} at={at(i)} from={i % 2 ? 'b' : 't'} rot={[-3, 2, -2, 3, -1, 2][i]}>
              <Photo slug={s.slug} name={s.name} role={s.co} w={250} h={300} at={at(i)} />
            </Piece>
            <Piece x={x} y={860} at={at(i) + 6} from="none" shadow={false}>
              <Logo3D name={s.logo} w={s.logo === 'meta' ? 280 : 200} h={170} at={at(i) + 6} fit={s.fit ?? 0.72} />
            </Piece>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** Lines 4–5: what they committed to: monitoring, internal safety teams, outside auditors, regular meetings. */
export const A3: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const span = L(1) - L(0);
  return (
    <AbsoluteFill>
      <Piece x={330} y={500} at={0} from="l" rot={-3}>
        <Gauge w={340} v={0.35 + 0.25 * Math.sin(f / 18)} />
      </Piece>
      <Piece x={760} y={520} at={span * 0.5} from="t" rot={3}>
        <Badge w={240} label="Safety team" />
      </Piece>
      <Piece x={1200} y={520} at={L(1) - 2} from="b" rot={-2}>
        <Clipboard w={300} at={L(1) + 10} />
      </Piece>
      <Piece x={1620} y={520} at={L(1) + 50} from="r" rot={0}>
        <RoundTable w={380} n={6} />
      </Piece>
      {['monitoring', 'safety teams', 'outside auditors', 'regular meetings'].map((t, i) => (
        <Piece key={t} x={[330, 760, 1200, 1620][i]} y={850} at={[0, span * 0.5, L(1) - 2, L(1) + 50][i] + 8} from="none" shadow={false}>
          <Kicker text={t} at={[0, span * 0.5, L(1) - 2, L(1) + 50][i] + 8} color={C.ink} />
        </Piece>
      ))}
    </AbsoluteFill>
  );
};

/** Line 6: President Trump: self-regulation, backed by the Justice Department and FBI. */
export const A4: React.FC = () => (
  <AbsoluteFill>
    <Piece x={560} y={520} at={0} from="l" rot={-2}>
      <Photo slug="trump" name="Donald Trump" role="President" w={420} h={520} at={0} />
    </Piece>
    <Piece x={1200} y={430} at={24} from="t" rot={-4}>
      <div style={{background: C.card, padding: 26, borderRadius: '50%'}}>{seal('seal_doj', 260)}</div>
    </Piece>
    <Piece x={1560} y={600} at={34} from="r" rot={5}>
      <div style={{background: C.card, padding: 26, borderRadius: '50%'}}>{seal('seal_fbi', 260)}</div>
    </Piece>
    <Piece x={1380} y={900} at={46} from="none" shadow={false}>
      <Hand text={'"tremendous self-regulation"'} at={46} size={56} color={C.ink} />
    </Piece>
    <Source text="NBC News" />
  </AbsoluteFill>
);

/** Line 7: Toby Walsh: "incompetent and careless at managing themselves". */
export const A5: React.FC = () => {
  const L = useL();
  return (
    <AbsoluteFill>
      <Piece x={520} y={500} at={0} from="l" rot={-3}>
        <Photo slug="walsh" name="Toby Walsh" role="Chief Scientist, UNSW AI Institute · Sydney" w={300} h={300} at={0} tone={0.2} />
      </Piece>
      <Piece x={1230} y={520} at={L(0) + 70} from="none" shadow={false}>
        <div style={{width: 900}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 200, color: C.red, lineHeight: 0.6, height: 90}}>“</div>
          <Hand text="incompetent and careless" at={L(0) + 74} size={100} color={C.ink} rot={-2} />
          <Hand text="at managing themselves" at={L(0) + 96} size={80} color={C.ink} rot={-2} />
          <div style={{marginTop: 26}}>
            <Kicker text="to Al Jazeera" at={L(0) + 110} />
          </div>
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

/** Lines 8–9: vague, no independent enforcement; 20 countries + the EU proposed oversight; rejected as a "globalist scheme". */
export const A6: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  return (
    <AbsoluteFill>
      <Piece x={420} y={480} at={0} from="l" rot={-3}>
        <Doc w={440} h={560} title="The accord" sub="Enforcement:" lines={7} seed="acc2">
          <div style={{marginTop: 16, height: 110, border: `4px dashed ${C.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.hand, fontSize: 54, color: C.red, opacity: e01(f, 16, 10)}}>none</div>
        </Doc>
      </Piece>
      <Piece x={1260} y={460} at={L(1) - 4} from="r" rot={1}>
        <Paper w={1080} h={640} pad={20}>
          <WorldMap w={1040} h={560} at={L(1)} center={[0, 30]} scale={1.15} />
          <div style={{position: 'absolute', left: 60, top: 60, display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(250,246,238,0.92)', padding: '18px 26px'}}>
            <EUFlag w={170} at={L(1) + 6} />
            <div>
              <Counter to={20} at={L(1) + 10} dur={30} size={110} suffix=" countries" />
              <Kicker text="+ the European Union · UN General Assembly" at={L(1) + 20} color={C.ink} size={18} />
            </div>
          </div>
        </Paper>
      </Piece>
      <Piece x={1300} y={500} at={L(1) + 110} from="none" shadow={false} z={30}>
        <Stamp text="REJECTED" at={L(1) + 110} size={110} rot={-10} />
      </Piece>
      <Piece x={1260} y={900} at={L(1) + 128} from="none" shadow={false} z={31}>
        <Hand text={'"a globalist scheme" · Trump'} at={L(1) + 128} size={60} color={C.red} rot={-2} />
      </Piece>
    </AbsoluteFill>
  );
};

/** The EU flag: twelve gold stars in a circle on blue. */
const EUFlag: React.FC<{w: number; at: number}> = ({w, at}) => {
  const f = useCurrentFrame();
  const h = (w * 2) / 3;
  return (
    <svg width={w} height={h} viewBox="0 0 300 200">
      <rect width={300} height={200} fill="#003399" />
      {Array.from({length: 12}, (_, i) => {
        const a = (i * Math.PI) / 6;
        const x = 150 + Math.sin(a) * 66;
        const y = 100 - Math.cos(a) * 66;
        const pts = Array.from({length: 10}, (_, k) => {
          const r = k % 2 ? 4.6 : 11.1;
          const t = (k * Math.PI) / 5 - Math.PI / 2;
          return `${x + Math.cos(t) * r},${y + Math.sin(t) * r}`;
        }).join(' ');
        return <polygon key={i} points={pts} fill="#FFCC00" opacity={e01(f, at + i * 1.5, 4)} />;
      })}
    </svg>
  );
};

/* =================================================================== STORY 4: OPENAI vs MOONSHOT */

/** Line 0: OpenAI and Moonshot face off. */
export const M0: React.FC = () => (
  <AbsoluteFill>
    <Piece x={520} y={520} at={0} from="l" rot={-4} shadow={false}>
      <Logo3D name="openai" w={560} h={560} at={0} fit={0.78} />
    </Piece>
    <Piece x={1400} y={520} at={6} from="r" rot={4} shadow={false}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Logo3D name="kimi" w={460} h={460} at={6} fit={0.78} />
        <Logo3D name="moonshot" w={560} h={130} at={12} fit={0.95} spin={0} tilt={-10} />
      </div>
    </Piece>
    <Piece x={960} y={520} at={18} from="drop" shadow={false}>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 140, color: C.red}}>vs</div>
    </Piece>
  </AbsoluteFill>
);

/** Line 1: ~16,000 requests from Moonshot-linked accounts, aimed at OpenAI's reasoning. */
export const M1: React.FC = () => {
  const f = useCurrentFrame();
  const slips = Array.from({length: 26}, (_, i) => i);
  return (
    <AbsoluteFill>
      <Piece x={1540} y={520} at={0} from="r" shadow={false}>
        <Logo3D name="openai" w={420} h={420} at={0} fit={0.78} spin={0} />
      </Piece>
      {Array.from({length: 6}, (_, i) => (
        <Piece key={i} x={220 + (i % 2) * 210} y={220 + Math.floor(i / 2) * 260} at={i * 3} from="l" rot={(i % 3) - 1}>
          <Laptop />
        </Piece>
      ))}
      {slips.map((i) => {
        const t = ((f - 20 - i * 4) % 60) / 60;
        if (f < 20 + i * 4) return null;
        const sy = 220 + (i % 3) * 260;
        const x = interpolate(t, [0, 1], [420, 1450]);
        const y = interpolate(t, [0, 1], [sy, 520]) + Math.sin(t * Math.PI) * -80;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 60, height: 40, background: C.card, transform: `rotate(${t * 220 + i * 13}deg)`, boxShadow: '2px 3px 6px rgba(0,0,0,0.25)', opacity: t < 0.9 ? 1 : (1 - t) * 10}} />;
      })}
      <Piece x={940} y={150} at={10} from="none" shadow={false}>
        <div style={{textAlign: 'center'}}>
          <Counter to={16000} at={12} dur={50} size={130} color={C.red} />
          <Kicker text="API requests · July 24–25" at={20} color={C.ink} />
        </div>
      </Piece>
      <Source text="OpenAI" />
    </AbsoluteFill>
  );
};
const Laptop: React.FC = () => (
  <svg width={200} height={150} viewBox="0 0 200 150">
    <rect x={30} y={10} width={140} height={96} rx={6} fill="#2B2D30" />
    <rect x={38} y={18} width={124} height={80} fill="#3E5B78" />
    <path d="M10 112 H190 L176 132 H24 Z" fill="#8E9397" />
  </svg>
);

/** Lines 2–3: "distillation": questions in, answers dripping into a smaller, cheaper model. */
export const M2: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const qs = Array.from({length: 10}, (_, i) => i);
  return (
    <AbsoluteFill>
      <Piece x={960} y={540} at={0} from="b">
        <div style={{position: 'relative'}}>
          <Flask w={360} fill={0.15 + 0.4 * e01(f, L(1), 120)} drip={L(1) + 10} />
        </div>
      </Piece>
      <Piece x={960} y={130} at={6} from="none" shadow={false}>
        <Hand text="distillation" at={6} size={84} color={C.red} rot={-2} />
      </Piece>
      <Piece x={350} y={520} at={L(1) - 6} from="l" shadow={false}>
        <div style={{textAlign: 'center'}}>
          <Logo3D name="openai" w={360} h={360} at={L(1) - 6} fit={0.8} spin={0} />
          <Kicker text="powerful model" at={L(1)} color={C.ink} />
        </div>
      </Piece>
      {qs.map((i) => {
        const t = e01(f, L(1) + 8 + i * 7, 26);
        if (t <= 0 || t >= 1) return null;
        return (
          <div key={i} style={{position: 'absolute', left: interpolate(t, [0, 1], [520, 840]), top: 380 + Math.sin(i) * 60 - Math.sin(t * Math.PI) * 60, fontFamily: F.display, fontWeight: 900, fontSize: 54, color: C.ink, opacity: Math.sin(t * Math.PI)}}>
            ?
          </div>
        );
      })}
      <Piece x={1560} y={720} at={L(1) + 50} from="r" rot={3}>
        <div style={{textAlign: 'center'}}>
          <div style={{width: 210, height: 160, background: '#CFC6B4', border: `6px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 70, color: C.ink}}>$</div>
          <div style={{marginTop: 10}}>
            <Kicker text="cheaper copy" at={L(1) + 56} color={C.ink} />
          </div>
        </div>
      </Piece>
      <Arrow x1={1080} y1={860} x2={1440} y2={760} at={L(1) + 56} bend={0.2} />
    </AbsoluteFill>
  );
};

/** Line 4: Anthropic's report (Sep 10) named Alibaba, Moonshot and DeepSeek. */
export const M3: React.FC = () => {
  const names: [string, number][] = [
    ['alibaba', 0.7],
    ['kimi', 0.7],
    ['deepseek', 0.95],
  ];
  return (
    <AbsoluteFill>
      <Piece x={700} y={540} at={0} from="l" rot={-2}>
        <Doc w={620} h={820} title="Report: distillation attacks on Claude" sub="Anthropic · Sep 10, 2026" lines={14} seed="ant" seal={<Logo3D name="anthropic" w={130} h={110} at={4} fit={0.8} spin={0} />} />
      </Piece>
      {names.map(([n, fit], i) => (
        <Piece key={n} x={1440} y={250 + i * 290} at={20 + i * 12} from="r" rot={[-3, 2, -2][i]}>
          <div style={{background: C.card, width: 380, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
            <Tape x={190} y={0} w={110} rot={-3} />
            <Logo3D name={n} w={n === 'deepseek' ? 360 : 220} h={200} at={24 + i * 12} fit={fit} spin={0} />
          </div>
        </Piece>
      ))}
      <Arrow x1={1010} y1={420} x2={1230} y2={260} at={30} bend={0.15} />
      <Arrow x1={1010} y1={540} x2={1230} y2={540} at={42} bend={0} />
      <Arrow x1={1010} y1={660} x2={1230} y2={820} at={54} bend={-0.15} />
      <Source text="Anthropic report, Sep 10, 2026" />
    </AbsoluteFill>
  );
};

/** Line 5: a pattern: US labs accuse Chinese companies. */
export const M4: React.FC = () => (
  <AbsoluteFill>
    <Piece x={960} y={540} at={0} from="b" rot={0.5}>
      <Paper w={1560} h={860} pad={20}>
        <WorldMap
          w={1520}
          h={820}
          at={2}
          center={[-150, 30]}
          scale={1.08}
          hi={{'United States of America': '#9FB2C4', China: '#D9A39B'}}
          threads={[
            {from: [-100, 40], to: [110, 34], at: 14},
            {from: [-120, 37], to: [116, 40], at: 22},
            {from: [-77, 39], to: [121, 31], at: 30},
          ]}
        />
      </Paper>
    </Piece>
  </AbsoluteFill>
);

/** Lines 6–7: back in July, Greg Brockman: Kimi K3 is "pretty good"; not sure if it was distilled. */
export const M5: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  return (
    <AbsoluteFill>
      <Piece x={500} y={520} at={0} from="l" rot={-3}>
        <Photo slug="brockman" name="Greg Brockman" role="President, OpenAI" w={380} h={460} at={0} />
      </Piece>
      <Piece x={1260} y={360} at={30} from="none" shadow={false}>
        <div>
          <Kicker text="July 22, 2026 · on Kimi K3" at={30} color={C.red} />
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 200, color: C.red, lineHeight: 0.6, height: 80, marginTop: 20}}>“</div>
          <Hand text="pretty good" at={L(0) + 120} size={130} color={C.ink} rot={-3} />
        </div>
      </Piece>
      <Piece x={1300} y={800} at={L(1) - 4} from="b" rot={3}>
        <div style={{position: 'relative'}}>
          <Flask w={200} fill={0.3} />
          <div style={{position: 'absolute', left: 150, top: -40, fontFamily: F.display, fontWeight: 900, fontSize: 160, color: C.red, opacity: e01(f, L(1) + 8, 8), transform: `rotate(${Math.sin(f / 10) * 6}deg)`}}>?</div>
        </div>
      </Piece>
      <Source text="Bloomberg Law" />
    </AbsoluteFill>
  );
};

/** Line 8: a forceful accusation vs an executive hedging. */
export const M6: React.FC = () => {
  const f = useCurrentFrame();
  const tip = interpolate(f, [6, 40], [0, -0.6], {...clamp, easing: (x) => settle(x)}) + 0.15 * Math.sin(f / 14); // the accusation weighs more
  return (
    <AbsoluteFill>
      <Piece x={960} y={560} at={0} from="b">
        <Scale
          w={980}
          tip={tip}
          left={
            <div style={{background: C.card, width: 200, height: 150, padding: 14, boxSizing: 'border-box', position: 'relative'}}>
              <div style={{fontFamily: F.mono, fontSize: 15, color: C.red, letterSpacing: '0.1em'}}>ACCUSATION</div>
              <div style={{position: 'absolute', right: 8, bottom: 4}}>
                <Logo3D name="openai" w={90} h={90} at={4} fit={0.8} spin={0} />
              </div>
            </div>
          }
          right={<Img src={staticFile('news1001/people/brockman.jpg')} style={{width: 150, height: 180, objectFit: 'cover', objectPosition: '50% 20%', border: `8px solid ${C.card}`, filter: 'saturate(0.75)'}} />}
        />
      </Piece>
    </AbsoluteFill>
  );
};

/** Line 9: it feeds the administration's push on AI and intellectual property. */
export const M7: React.FC = () => (
  <AbsoluteFill>
    <Piece x={760} y={540} at={0} from="l" rot={-2}>
      <Doc w={600} h={760} title="Intellectual property" sub="AI models · weights · outputs" lines={12} seed="ip" seal={seal('seal_potus', 100)} />
    </Piece>
    <Piece x={900} y={700} at={20} from="drop" z={10}>
      <Padlock w={220} />
    </Piece>
    <Piece x={1470} y={480} at={30} from="r" rot={4}>
      <div style={{width: 420, height: 300, background: C.card, padding: 16, boxSizing: 'border-box', position: 'relative'}}>
        <Tape x={210} y={-2} w={110} rot={-3} />
        <WorldMap w={388} h={268} at={30} center={[-150, 30]} scale={1.1} hi={{'United States of America': '#9FB2C4', China: '#D9A39B'}} threads={[{from: [-100, 40], to: [110, 34], at: 40}]} />
      </div>
    </Piece>
  </AbsoluteFill>
);

void random;
