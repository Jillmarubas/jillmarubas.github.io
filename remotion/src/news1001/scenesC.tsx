import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, F} from './design';
import {Logo3D} from './Logo3D';
import {USMap} from './maps';
import {Arrow, Counter, Hand, Kicker, Paper, Photo, Piece, Source, Stamp, Tape, clamp, e01, settle, useL} from './kit';
import {Bell, Brick, Bubble, CalPage, DataCentre, Doc, Folder, GPU, MoneyPile, Phone, PriceTag, Ring} from './props';
import {existsIrs} from './assets';

const seal = (n: string, s = 110) => <Img src={staticFile(`news1001/logos/${n}`)} style={{width: s, height: s}} />;

/* =================================================================== STORY 5: META'S TAX MOVE */

/** Line 0: a story about money: Meta and a research-credit tax form. */
export const T0: React.FC = () => (
  <AbsoluteFill>
    <Piece x={600} y={520} at={0} from="l" rot={-3} shadow={false}>
      <Logo3D name="meta" w={760} h={420} at={0} fit={0.92} />
    </Piece>
    <Piece x={1380} y={540} at={10} from="r" rot={3}>
      <Doc w={560} h={740} title="Form 6765" sub="Credit for increasing research activities" lines={13} seed="6765" seal={existsIrs ? seal('seal_irs.png', 100) : undefined} />
    </Piece>
  </AbsoluteFill>
);

/** Line 1: data centres and Nvidia chips labelled "experimental research investments". */
export const T1: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  return (
    <AbsoluteFill>
      <Piece x={560} y={480} at={0} from="l" rot={-2}>
        <DataCentre w={600} />
      </Piece>
      <Piece x={1360} y={480} at={10} from="r" rot={3}>
        <div style={{position: 'relative'}}>
          <GPU w={520} />
          <div style={{position: 'absolute', right: -40, top: -80}}>
            <Logo3D name="nvidia" w={150} h={150} at={14} fit={0.8} spin={0} />
          </div>
        </div>
      </Piece>
      {[560, 1360].map((x, i) => (
        <Piece key={x} x={x} y={760} at={L(0) + 90 + i * 10} from="drop" rot={[-6, 5][i]} z={10}>
          <div style={{background: '#F3E7C7', border: `3px solid ${C.ink}`, padding: '12px 22px', fontFamily: F.mono, fontWeight: 500, fontSize: 30, letterSpacing: '0.08em', color: C.ink, position: 'relative'}}>
            <Tape x={0} y={20} w={70} rot={-50} />
            “EXPERIMENTAL RESEARCH”
          </div>
        </Piece>
      ))}
      <div style={{position: 'absolute', left: 960, top: 940, transform: 'translateX(-50%)', opacity: e01(f, L(0) + 120, 10)}}>
        <Kicker text="claimed for bigger tax credits" at={L(0) + 120} color={C.ink} />
      </div>
      <Source text="The New York Times" />
    </AbsoluteFill>
  );
};

/** Line 2: research-credit savings: about $0.7B (2023) → $3.9B (2025). */
export const T2: React.FC = () => {
  const L = useL();
  const bars: {y: string; v: number; n: number; at: number}[] = [
    {y: '2023', v: 0.7, n: 3, at: L(0) + 70},
    {y: '2025', v: 3.9, n: 18, at: L(0) + 130},
  ];
  return (
    <AbsoluteFill>
      {bars.map((b, i) => (
        <Piece key={b.y} x={620 + i * 680} y={600} at={i * 8} from="b" shadow={false}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
            <Counter to={b.v} at={b.at} dur={30} decimals={1} prefix="$" suffix="B" size={i ? 150 : 110} color={i ? C.red : C.ink} />
            <MoneyPile n={b.n} at={b.at} dur={36} cols={3} w={110} />
            <div style={{fontFamily: F.mono, fontSize: 34, color: C.ink, letterSpacing: '0.1em'}}>{b.y}</div>
          </div>
        </Piece>
      ))}
      <Piece x={960} y={180} at={0} from="t" shadow={false}>
        <Logo3D name="meta" w={420} h={160} at={0} fit={0.9} spin={0} tilt={-8} />
      </Piece>
      <Arrow x1={860} y1={380} x2={1180} y2={300} at={L(0) + 140} />
      <Source text="The New York Times; Meta filings" />
    </AbsoluteFill>
  );
};

/** Lines 3–4: Mark Zuckerberg; $4.1B of exercised options booked as research → ~$355M in credits. */
export const T3: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  return (
    <AbsoluteFill>
      <Piece x={380} y={520} at={0} from="l" rot={-3}>
        <Photo slug="zuckerberg" name="Mark Zuckerberg" role="CEO, Meta" w={380} h={480} at={0} />
      </Piece>
      <Piece x={940} y={420} at={L(1) - 4} from="t" rot={-2}>
        <div style={{width: 520, height: 330, background: '#EDE5CF', border: '14px double #6B7F5A', padding: 26, boxSizing: 'border-box', position: 'relative'}}>
          <div style={{fontFamily: F.display, fontStyle: 'italic', fontWeight: 600, fontSize: 30, color: '#3F5236'}}>Stock options exercised</div>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 104, color: '#3F5236', marginTop: 16}}>$4.1B</div>
          <div style={{fontFamily: F.mono, fontSize: 18, color: '#3F5236', marginTop: 8}}>tax years 2012–2013</div>
          <div style={{position: 'absolute', right: 20, bottom: 30}}>
            <Stamp text="RESEARCH" at={L(1) + 70} size={46} rot={-12} />
          </div>
        </div>
      </Piece>
      <Arrow x1={1220} y1={430} x2={1440} y2={600} at={L(1) + 100} bend={-0.2} />
      <Piece x={1560} y={700} at={L(1) + 110} from="r" rot={3} shadow={false}>
        <div style={{textAlign: 'center'}}>
          <Counter to={355} at={L(1) + 112} dur={30} prefix="≈$" suffix="M" size={120} color={C.red} />
          <Kicker text="in tax savings" at={L(1) + 118} color={C.ink} />
        </div>
      </Piece>
      <div style={{opacity: e01(f, L(1) + 110, 6)}}>
        <Source text="The New York Times; U.S. Tax Court filings" />
      </div>
    </AbsoluteFill>
  );
};

/** Line 5: Meta's argument: he built Facebook's early technology himself (2005). */
export const T4: React.FC = () => (
  <AbsoluteFill>
    <Piece x={760} y={540} at={0} from="b" rot={-1}>
      <OldLaptop />
    </Piece>
    <Piece x={1380} y={420} at={14} from="r" rot={4}>
      <div style={{width: 300, height: 220, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 120, color: C.ink, position: 'relative'}}>
        <Tape x={150} y={0} w={110} rot={-3} />
        2005
      </div>
    </Piece>
    <Piece x={1400} y={820} at={30} from="none" shadow={false}>
      <Hand text="his pay = research spending?" at={30} size={56} color={C.red} />
    </Piece>
  </AbsoluteFill>
);
const OldLaptop: React.FC = () => (
  <svg width={720} height={500} viewBox="0 0 720 500">
    <rect x={90} y={20} width={540} height={360} rx={18} fill="#BFC3C6" />
    <rect x={112} y={42} width={496} height={316} fill="#F5F6F8" />
    <rect x={112} y={42} width={496} height={40} fill="#3B5998" />
    {Array.from({length: 4}, (_, i) => (
      <g key={i} transform={`translate(132 ${100 + i * 64})`}>
        <rect width={44} height={44} fill="#C9CDD3" />
        <rect x={58} y={6} width={300 - i * 30} height={10} fill="#9AA3AE" />
        <rect x={58} y={26} width={220 + i * 20} height={8} fill="#C9CDD3" />
      </g>
    ))}
    <path d="M20 390 H700 L660 450 H60 Z" fill="#A9ADB0" />
    <rect x={300} y={398} width={120} height={10} rx={5} fill="#8E9397" />
  </svg>
);

/** Line 6: the IRS disputes the timing: the options tie to 2008–2010 work, not 2005. */
export const T5: React.FC = () => {
  const f = useCurrentFrame();
  const years = Array.from({length: 7}, (_, i) => 2004 + i);
  const k = e01(f, 20, 20);
  return (
    <AbsoluteFill>
      <Piece x={960} y={480} at={0} from="t" rot={-0.5}>
        <div style={{width: 1400, height: 200, background: '#E7D7A8', position: 'relative'}}>
          {years.map((y, i) => (
            <div key={y} style={{position: 'absolute', left: 80 + i * 205, top: 0}}>
              <div style={{width: 3, height: 60, background: C.ink}} />
              <div style={{fontFamily: F.mono, fontSize: 28, color: C.ink, marginTop: 8, marginLeft: -30}}>{y}</div>
            </div>
          ))}
          <div style={{position: 'absolute', left: 285 - 50, top: 120, width: 100, height: 40, background: '#3B5998', opacity: 0.85}} />
          <div style={{position: 'absolute', left: 285 - 50, top: 166, fontFamily: F.sans, fontWeight: 700, fontSize: 20, color: C.ink}}>Meta: 2005</div>
          <div style={{position: 'absolute', left: 900, top: 120, width: 410 * k, height: 40, background: C.red}} />
          <div style={{position: 'absolute', left: 900, top: 166, fontFamily: F.sans, fontWeight: 700, fontSize: 20, color: C.red, opacity: k}}>IRS: 2008–2010</div>
        </div>
      </Piece>
      <Piece x={960} y={820} at={12} from="b" rot={2}>
        <div style={{background: C.card, padding: '20px 30px', display: 'flex', alignItems: 'center', gap: 24}}>
          {existsIrs ? seal('seal_irs.png', 120) : null}
          <div>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.ink}}>Internal Revenue Service</div>
            <Kicker text="U.S. Tax Court: not yet ruled" at={20} color={C.ink2} />
          </div>
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

/** Line 7: $18.74B in unrecognized tax benefits (June 30, 2026). */
export const T6: React.FC = () => (
  <AbsoluteFill>
    <Piece x={760} y={580} at={0} from="b" shadow={false}>
      <MoneyPile n={40} at={4} dur={60} cols={5} w={110} />
    </Piece>
    <Piece x={1420} y={460} at={10} from="r" rot={2} shadow={false}>
      <div>
        <Counter to={18.74} at={12} dur={50} decimals={2} prefix="$" suffix="B" size={160} color={C.ink} />
        <div style={{marginTop: 18}}>
          <Kicker text="unrecognized tax benefits · June 30, 2026" at={20} color={C.ink} />
        </div>
      </div>
    </Piece>
    <Piece x={1450} y={760} at={60} from="drop" rot={-6} z={10}>
      <div style={{background: '#F3E7C7', border: `3px solid ${C.red}`, padding: '12px 22px', fontFamily: F.hand, fontWeight: 600, fontSize: 52, color: C.red}}>could still be challenged</div>
    </Piece>
    <Source text="Meta 10-Q, quarter ended June 30, 2026" />
  </AbsoluteFill>
);

/* =================================================================== STORY 6: OPENAI: $30B, NO IPO */

/** Lines 0–1: raising ~$30B (Bloomberg, Semafor), and the IPO slips to 2027. */
export const O0: React.FC = () => {
  const L = useL();
  return (
    <AbsoluteFill>
      <Piece x={480} y={560} at={0} from="l" shadow={false}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
          <Counter to={30} at={6} dur={50} prefix="$" suffix="B" size={140} />
          <MoneyPile n={20} at={6} dur={50} cols={5} w={110} />
        </div>
      </Piece>
      <Piece x={960} y={260} at={4} from="t" shadow={false}>
        <Logo3D name="openai" w={260} h={260} at={4} fit={0.8} />
      </Piece>
      <Piece x={1260} y={620} at={L(1) - 4} from="r" rot={2}>
        <Bell w={280} ring={L(1) + 10} tag="POSTPONED" tagAt={L(1) + 16} />
      </Piece>
      <Piece x={1680} y={420} at={L(1) + 20} from="r" rot={-4}>
        <CalPage month="IPO" day={2027} w={240} />
      </Piece>
      <Source text="Bloomberg; Semafor" />
    </AbsoluteFill>
  );
};

/** Line 2: reported valuations: $1.2T to $1.4T; the number is still moving. */
export const O1: React.FC = () => {
  const f = useCurrentFrame();
  const needle = 0.5 + 0.38 * Math.sin(f / 13) * Math.cos(f / 31);
  return (
    <AbsoluteFill>
      <Piece x={960} y={520} at={0} from="b" rot={-0.5}>
        <Paper w={1300} h={500} pad={60}>
          <Kicker text="Reported valuation of OpenAI" at={4} color={C.ink} />
          <div style={{position: 'relative', marginTop: 120, height: 30, background: '#D8D0BF', borderRadius: 15}}>
            <div style={{position: 'absolute', left: '0%', right: '0%', top: 0, bottom: 0, background: 'linear-gradient(90deg, rgba(200,38,29,0.35), rgba(200,38,29,0.8))', borderRadius: 15}} />
            <div style={{position: 'absolute', left: `${needle * 100}%`, top: -50, width: 8, height: 130, marginLeft: -4, background: C.ink}} />
            <div style={{position: 'absolute', left: 0, top: 60, fontFamily: F.display, fontWeight: 900, fontSize: 80, color: C.ink}}>$1.2T</div>
            <div style={{position: 'absolute', right: 0, top: 60, fontFamily: F.display, fontWeight: 900, fontSize: 80, color: C.ink}}>$1.4T</div>
          </div>
        </Paper>
      </Piece>
      <Piece x={1500} y={880} at={30} from="none" shadow={false}>
        <Hand text="still moving" at={30} size={64} color={C.red} />
      </Piece>
    </AbsoluteFill>
  );
};

/** Lines 3–4: others pulling back too: Oura, SB Energy, Nscale. */
export const O2: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const span = Math.max(30, (L(2) - L(1)) / 3);
  const cos = [
    {logo: 'oura', w: 420, extra: <Ring w={170} />},
    {logo: 'sbenergy', w: 440},
    {logo: 'nscale', w: 440},
  ];
  return (
    <AbsoluteFill>
      {cos.map((c, i) => {
        const at = L(1) + i * span - 6;
        const pull = e01(f, at + 30, 18);
        return (
          <Piece key={c.logo} x={420 + i * 540} y={520 + (i % 2) * 60} at={i === 0 ? 0 : at} from="b" rot={[-3, 2, -2][i]}>
            <div style={{transform: `translateY(${pull * 60}px) rotate(${pull * -4}deg)`}}>
              <div style={{width: 460, height: 300, background: '#F1E8D2', border: `3px dashed ${C.mute}`, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{position: 'absolute', top: 14, left: 20, fontFamily: F.mono, fontSize: 18, letterSpacing: '0.16em', color: C.ink2}}>IPO</div>
                {c.extra}
                <Logo3D name={c.logo} w={c.w} h={130} at={(i === 0 ? 0 : at) + 4} fit={0.9} spin={0} tilt={-8} />
                {f >= at + 40 && (
                  <div style={{position: 'absolute', right: 10, bottom: 10}}>
                    <Stamp text="DELAYED" at={at + 40} size={34} rot={-12} />
                  </div>
                )}
              </div>
            </div>
          </Piece>
        );
      })}
      <Source text="CNBC; TechCrunch; Reuters" />
    </AbsoluteFill>
  );
};

/** Line 5: even Anthropic, expected to go public this year, faces the same market. */
export const O3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Piece x={760} y={520} at={0} from="l" shadow={false}>
        <Logo3D name="anthropic" w={520} h={520} at={0} fit={0.78} />
      </Piece>
      <Piece x={1340} y={560} at={10} from="r" rot={3}>
        <Bell w={260} />
      </Piece>
      <AbsoluteFill style={{background: `linear-gradient(90deg, transparent 30%, rgba(233,225,210,${0.55 * e01(f, 20, 40)}) 70%)`}} />
      <Piece x={1380} y={880} at={30} from="none" shadow={false}>
        <Hand text="same uncertain market" at={30} size={56} color={C.ink} />
      </Piece>
    </AbsoluteFill>
  );
};

/* =================================================================== STORY 7: DOORDASH */

/** Line 0: DoorDash's AI agent lives inside Apple's Messages app. */
export const D0: React.FC = () => (
  <AbsoluteFill>
    <Piece x={560} y={520} at={0} from="l" rot={-3} shadow={false}>
      <Logo3D name="doordash" w={720} h={300} at={0} fit={0.95} />
    </Piece>
    <Piece x={1260} y={540} at={10} from="b" rot={2}>
      <Phone w={380}>
        <Bubble me at={40} w={380}>
          hungry
        </Bubble>
        <Bubble at={60} w={380}>
          I can order for you. What sounds good?
        </Bubble>
      </Phone>
    </Piece>
    <Piece x={1640} y={300} at={20} from="r" rot={8} shadow={false}>
      <Logo3D name="imessage" w={220} h={220} at={20} fit={0.75} />
    </Piece>
  </AbsoluteFill>
);

/** Line 1: live with ~20,000 users in a U.S. iOS pilot. */
export const D1: React.FC = () => (
  <AbsoluteFill>
    <Piece x={760} y={560} at={0} from="b" rot={-0.5}>
      <Paper w={1100} h={760} pad={40}>
        <USMap w={1020} at={2} dots={200} dotsAt={12} />
      </Paper>
    </Piece>
    <Piece x={1520} y={300} at={8} from="r" rot={3} shadow={false}>
      <div style={{background: C.card, padding: '24px 36px'}}>
        <Counter to={20000} at={10} dur={40} size={110} color={C.red} />
        <Kicker text="users · U.S. iOS pilot" at={16} color={C.ink} />
      </div>
    </Piece>
  </AbsoluteFill>
);

/** Line 2: it already knows your number, history and card, so "order my usual" just works. */
export const D2: React.FC = () => {
  const L = useL();
  const span = L(1) - L(0);
  const items: [string, React.ReactNode][] = [
    ['phone number', <div key="n" style={{fontFamily: F.mono, fontSize: 30, color: C.ink}}>(•••) •••-4821</div>],
    ['order history', <div key="h" style={{width: 160, height: 90, background: C.card, padding: 12, boxSizing: 'border-box'}}><div style={{height: 8, background: '#CFC8BA', marginBottom: 10}} /><div style={{height: 8, background: '#CFC8BA', width: '70%', marginBottom: 10}} /><div style={{height: 8, background: '#CFC8BA', width: '85%'}} /></div>],
    ['payment', <div key="p" style={{width: 170, height: 106, borderRadius: 12, background: 'linear-gradient(135deg,#1F2A44,#3B4E7A)'}} />],
  ];
  return (
    <AbsoluteFill>
      <Piece x={960} y={540} at={0} from="b">
        <Phone w={420}>
          <Bubble me at={span * 0.62} w={420}>
            order my usual
          </Bubble>
          <Bubble at={span * 0.75} w={420}>
            Your usual is on its way ✓
          </Bubble>
        </Phone>
      </Piece>
      {items.map(([label, el], i) => (
        <React.Fragment key={label}>
          <Piece x={[420, 420, 1500][i]} y={[300, 700, 500][i]} at={8 + i * (span * 0.18)} from={i === 2 ? 'r' : 'l'} rot={[-3, 2, 3][i]}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
              {el}
              <Kicker text={label} at={14 + i * (span * 0.18)} color={C.ink} size={18} />
            </div>
          </Piece>
          <Arrow x1={[560, 560, 1360][i]} y1={[320, 680, 500][i]} x2={[760, 760, 1160][i]} y2={[440, 600, 520][i]} at={20 + i * (span * 0.18)} bend={0.15} />
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

/** Line 3: Andy Fang: "Every other AI agent is meeting you for the first time. We've known you for years." */
export const D3: React.FC = () => {
  const L = useL();
  return (
    <AbsoluteFill>
      <Piece x={460} y={520} at={0} from="l" rot={-3}>
        <Photo slug="fang" name="Andy Fang" role="Co-founder, DoorDash" w={360} h={460} at={0} />
      </Piece>
      <Piece x={1230} y={520} at={L(0) + 50} from="none" shadow={false}>
        <div style={{width: 1000}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 200, color: C.red, lineHeight: 0.6, height: 80}}>“</div>
          <Hand text="Every other AI agent is meeting" at={L(0) + 52} size={74} color={C.ink} rot={-2} speed={0.4} />
          <Hand text="you for the first time." at={L(0) + 66} size={74} color={C.ink} rot={-2} speed={0.4} />
          <Hand text="We've known you for years." at={L(0) + 100} size={88} color={C.red} rot={-2} speed={0.4} />
        </div>
      </Piece>
    </AbsoluteFill>
  );
};

/** Line 4: text it a photo of a dish; it finds something similar nearby. */
export const D4: React.FC = () => {
  const f = useCurrentFrame();
  const pins = [
    [0.3, 0.4],
    [0.62, 0.3],
    [0.5, 0.68],
    [0.78, 0.6],
  ];
  return (
    <AbsoluteFill>
      <Piece x={760} y={540} at={0} from="b" rot={-2}>
        <Phone w={420}>
          {f >= 12 && (
            <div style={{alignSelf: 'flex-end', opacity: e01(f, 12, 8), borderRadius: 18, overflow: 'hidden', width: 260, border: '3px solid #34C759'}}>
              <Img src={staticFile('news1001/photos/ramen.jpg')} style={{width: 260, height: 195, objectFit: 'cover', display: 'block'}} />
            </div>
          )}
          <Bubble me at={22} w={420}>
            something like this?
          </Bubble>
          <Bubble at={40} w={420}>
            3 ramen spots near you
          </Bubble>
        </Phone>
      </Piece>
      <Piece x={1420} y={540} at={30} from="r" rot={3}>
        <div style={{width: 520, height: 440, background: '#E6E1D3', position: 'relative', overflow: 'hidden'}}>
          <svg width={520} height={440} style={{position: 'absolute'}}>
            {[80, 200, 330, 450].map((x) => (
              <rect key={x} x={x} y={0} width={18} height={440} fill="#F8F5EE" />
            ))}
            {[90, 230, 360].map((y) => (
              <rect key={y} x={0} y={y} width={520} height={18} fill="#F8F5EE" />
            ))}
            <rect x={240} y={260} width={70} height={80} fill="#B9C7A6" />
          </svg>
          {pins.map(([x, y], i) => {
            const k = e01(f, 46 + i * 6, 8);
            return <div key={i} style={{position: 'absolute', left: x * 520 - 18, top: y * 440 - 46 - (1 - k) * 40, opacity: k, width: 36, height: 46, background: i === 3 ? '#2F5D8A' : C.red, clipPath: 'path("M18 46 C 8 30, 0 24, 0 16 A 18 18 0 0 1 36 16 C 36 24, 28 30, 18 46 Z")'}} />;
          })}
        </div>
      </Piece>
      <div style={{position: 'absolute', left: 520, bottom: 26, fontFamily: F.mono, fontSize: 12, color: C.mute}}>Photo: Lusheeta (Japanese Wikipedia) · CC BY-SA 3.0</div>
    </AbsoluteFill>
  );
};

/** Line 5: Bloomberg's early test: pricing mismatches; to be ironed out for the waitlist. */
export const D5: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const iron = interpolate(f, [L(0) + 70, L(0) + 120], [-300, 300], {...clamp, easing: (x) => settle(x)});
  return (
    <AbsoluteFill>
      <Piece x={600} y={420} at={0} from="l" rot={-6}>
        <div style={{textAlign: 'center'}}>
          <PriceTag price="$16.99" w={300} />
          <Kicker text="in the app" at={6} color={C.ink} size={18} />
        </div>
      </Piece>
      <Piece x={1100} y={420} at={10} from="r" rot={7}>
        <div style={{textAlign: 'center'}}>
          <PriceTag price="$18.49" w={300} color="#F6D9D4" />
          <Kicker text="in the text" at={16} color={C.ink} size={18} />
        </div>
      </Piece>
      <Piece x={850} y={420} at={22} from="none" shadow={false}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 120, color: C.red}}>≠</div>
      </Piece>
      <Piece x={960} y={820} at={L(0) + 60} from="b" rot={0}>
        <div style={{width: 1000, height: 160, background: C.card, position: 'relative', overflow: 'hidden', clipPath: `polygon(0 ${20}%, 12% 0, 25% 25%, 40% 5%, 55% 22%, 70% 0, 85% 20%, 100% 6%, 100% 100%, 0 100%)`}}>
          <div style={{position: 'absolute', inset: 0, background: C.card, clipPath: `inset(0 ${50 - iron / 10}% 0 0)`}} />
        </div>
      </Piece>
      <div style={{position: 'absolute', left: 960 + iron - 120, top: 690, opacity: e01(f, L(0) + 66, 6)}}>
        <svg width={260} height={150} viewBox="0 0 260 150">
          <path d="M20 120 Q 40 40 140 30 L 240 30 L 240 120 Z" fill="#4A6FA5" />
          <path d="M120 30 Q 150 -10 220 10 L 230 30" fill="none" stroke="#2B2B2B" strokeWidth={14} strokeLinecap="round" />
          <rect x={10} y={118} width={240} height={16} rx={6} fill="#C9CDD3" />
        </svg>
      </div>
      <Source text="Bloomberg (test of the pilot); illustrative prices" />
    </AbsoluteFill>
  );
};

/** Lines 6–7: the enterprise side (MCP; Slack bots order for teams), tested at SpaceX, Cognition, Mercor. */
export const D6: React.FC = () => {
  const L = useL();
  const span = Math.max(30, (L(2) - L(1)) / 3);
  const cos: [string, number][] = [
    ['spacex', 1.0],
    ['cognition', 0.7],
    ['mercor', 0.7],
  ];
  return (
    <AbsoluteFill>
      <Piece x={330} y={330} at={0} from="l" rot={-3} shadow={false}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Logo3D name="mcp" w={240} h={240} at={0} fit={0.75} />
          <Kicker text="Model Context Protocol" at={6} color={C.ink} size={18} />
        </div>
      </Piece>
      <Piece x={330} y={760} at={14} from="l" rot={2} shadow={false}>
        <Logo3D name="slack" w={240} h={240} at={14} fit={0.75} />
      </Piece>
      <Arrow x1={470} y1={560} x2={720} y2={560} at={24} bend={0} />
      {cos.map(([n, fit], i) => (
        <Piece key={n} x={950 + i * 360} y={560} at={i === 0 ? 20 : L(1) + i * span - 4} from="b" rot={[-2, 3, -3][i]}>
          <LunchBag>
            <Logo3D name={n} w={260} h={140} at={(i === 0 ? 20 : L(1) + i * span - 4) + 4} fit={fit} spin={0} tilt={-6} />
          </LunchBag>
        </Piece>
      ))}
      <Piece x={1310} y={900} at={L(1) - 4} from="none" shadow={false}>
        <Kicker text="testing it internally" at={L(1)} color={C.ink} />
      </Piece>
    </AbsoluteFill>
  );
};
const LunchBag: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{width: 300, height: 380, position: 'relative'}}>
    <svg width={300} height={380} viewBox="0 0 300 380" style={{position: 'absolute'}}>
      <path d="M20 60 L280 60 L268 370 L32 370 Z" fill="#C9A878" />
      <path d="M20 60 L50 20 L250 20 L280 60 Z" fill="#B8946A" />
      <path d="M40 60 L56 370" stroke="rgba(0,0,0,0.08)" strokeWidth={6} />
      <path d="M260 60 L244 370" stroke="rgba(0,0,0,0.08)" strokeWidth={6} />
    </svg>
    <div style={{position: 'absolute', left: 20, top: 140, width: 260, display: 'flex', justifyContent: 'center'}}>{children}</div>
  </div>
);

/* =================================================================== OUTRO */

/** Lines 0–1: the seven stories close one by one. */
const RECAP: {label: string; logo?: string; seal?: string}[] = [
  {label: 'Federal investigation', seal: 'seal_ftc.svg'},
  {label: 'White House safety pact', seal: 'seal_potus.svg'},
  {label: 'A new frontier model', logo: 'gemini'},
  {label: 'U.S.–China distillation dispute', logo: 'kimi'},
  {label: 'Meta tax story', logo: 'meta'},
  {label: '$30B OpenAI round', logo: 'openai'},
  {label: 'DoorDash by text', logo: 'doordash'},
];
export const E0: React.FC = () => {
  const L = useL();
  const span0 = (L(1) - L(0)) / 3;
  const span1 = (L(2) - L(1)) / 4;
  const at = (i: number) => (i < 3 ? L(0) + i * span0 : L(1) + (i - 3) * span1);
  return (
    <AbsoluteFill>
      {RECAP.map((r, i) => (
        <Piece key={i} x={300 + (i % 4) * 440 + (i >= 4 ? 220 : 0)} y={i < 4 ? 330 : 760} at={at(i)} from={(['t', 'l', 'b', 'r'] as const)[i % 4]} rot={[-3, 2, -1, 3, -2, 1, -3][i]}>
          <Folder w={360} h={250} label={r.label} n={i + 1}>
            <div style={{position: 'absolute', right: 16, top: 16}}>
              {r.logo && <Logo3D name={r.logo} w={r.logo === 'doordash' || r.logo === 'meta' ? 220 : 150} h={150} at={at(i) + 6} fit={0.8} spin={0} />}
              {r.seal && <Img src={staticFile(`news1001/logos/${r.seal}`)} style={{width: 140, height: 140}} />}
            </div>
          </Folder>
        </Piece>
      ))}
    </AbsoluteFill>
  );
};

/** Line 2: like, subscribe, comment. */
export const E1: React.FC = () => {
  const f = useCurrentFrame();
  const L = useL();
  const span = L(1) - L(0);
  const press = (at: number) => 1 - 0.12 * Math.sin(Math.min(1, Math.max(0, (f - at) / 6)) * Math.PI);
  return (
    <AbsoluteFill>
      <Piece x={520} y={520} at={0} from="l" rot={-3}>
        <div style={{transform: `scale(${press(span * 0.12)})`}}>
          <div style={{width: 300, height: 300, background: C.card, borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={170} height={170} viewBox="0 0 24 24">
              <path d="M2 21h4V9H2v12zm20-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 1 6.59 7.59C6.22 7.95 6 8.45 6 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" fill={f > span * 0.12 ? C.red : C.ink} />
            </svg>
          </div>
        </div>
      </Piece>
      <Piece x={1100} y={520} at={span * 0.25} from="b" rot={2}>
        <div style={{transform: `scale(${press(span * 0.36)})`, background: f > span * 0.36 ? '#5A544A' : C.red, color: '#fff', fontFamily: F.sans, fontWeight: 700, fontSize: 64, padding: '40px 70px', borderRadius: 24, letterSpacing: '0.04em'}}>{f > span * 0.36 ? 'Subscribed' : 'Subscribe'}</div>
      </Piece>
      <Piece x={1620} y={520} at={span * 0.55} from="r" rot={4}>
        <svg width={260} height={240} viewBox="0 0 260 240">
          <path d="M20 20 H240 V170 H90 L40 220 V170 H20 Z" fill={C.card} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
          {[60, 95, 130].map((y, i) => (
            <rect key={y} x={50} y={y - 6} width={i === 2 ? 100 : 160} height={12} rx={6} fill={C.mute} />
          ))}
        </svg>
      </Piece>
    </AbsoluteFill>
  );
};

/** Line 3: "Thanks for watching": the desk lamp switches off (the film fades in N1Film). */
export const E2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Piece x={960} y={480} at={0} from="t" shadow={false}>
        <svg width={420} height={520} viewBox="0 0 420 520">
          <ellipse cx={210} cy={500} rx={150} ry={18} fill="#3B3A37" />
          <rect x={200} y={250} width={18} height={250} fill="#3B3A37" transform="rotate(-10 210 500)" />
          <path d="M110 120 L310 120 L360 250 L60 250 Z" fill="#2E4A3A" />
          <ellipse cx={210} cy={250} rx={150} ry={22} fill={`rgba(255,226,160,${1 - e01(f, 40, 4)})`} />
        </svg>
      </Piece>
    </AbsoluteFill>
  );
};

void Brick;
void Folder;
void Doc;
