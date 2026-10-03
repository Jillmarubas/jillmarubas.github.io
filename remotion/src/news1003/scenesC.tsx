import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, F, R} from './design';
import {Big, Counter, Cutout, e01, Kicker, Photo, Piece, Quote, Seal, Source, useScene, useW} from './kit';
import {Logo3D} from './Logo3D';
import {Brick, CalPage, USMap, WorldMap} from './propsA';
import {Agent, BankCard, Browser, Chair, Doc, Drive, Envelope, Folder, GlassBox, Headset, IDBadge, Keycard, Laptop, Magnifier, Mask, Mic, MorphPill, Phone, Road, Salt, Server, Tangle, Tile, Warning, Wave, Webcam} from './propsB';

/* Story 4 (Tavus Griffin), story 5 (OpenAI's rough week) and the outro. */

/* ================================================================== STORY 4 · TAVUS */
export const T0: React.FC = () => (
  <AbsoluteFill>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(80% 80% at 50% 50%, rgba(16,21,28,0) 40%, rgba(16,21,28,.18) 100%)'}} />
    <Piece x={960} y={540} at={0}>
      <Laptop w={1000}>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
          <Tile w={600} seed={1} />
        </div>
        <div style={{position: 'absolute', right: 20, bottom: 20}}>
          <Tile w={160} seed={2} />
        </div>
      </Laptop>
    </Piece>
  </AbsoluteFill>
);

export const T1: React.FC = () => {
  const w = useW();
  const tG = w('griffin', 0, 50);
  const tHim = w('human', 0, 110);
  return (
    <AbsoluteFill>
      <Piece x={960} y={300} at={0} shadow={false}>
        <Logo3D name="tavus" w={760} h={260} at={0} fit={0.8} />
      </Piece>
      <Piece x={960} y={560} at={tG - 2}>
        <Big size={120}>Griffin</Big>
      </Piece>
      <Piece x={960} y={760} at={tHim - 4}>
        <Big size={72} color={C.blueInk}>
          “Human Interaction Model”
        </Big>
      </Piece>
    </AbsoluteFill>
  );
};

export const T2: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const t = w('fortyeight', 0, 120);
  // 26 of 54 participants believed they spoke to a person (Tavus study)
  const human = new Set([0, 2, 3, 6, 8, 10, 13, 14, 17, 19, 20, 23, 25, 27, 30, 31, 34, 36, 38, 40, 43, 44, 47, 49, 51, 53]);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 140, top: 170, display: 'grid', gridTemplateColumns: 'repeat(9, 120px)', gap: 14}}>
        {Array.from({length: 54}, (_, i) => (
          <div key={i} style={{opacity: e01(f, 2 + i * 0.6, 8)}}>
            <Tile w={120} seed={i} on={human.has(i) ? e01(f, t - 8 + (i % 9), 8) : 0} />
          </div>
        ))}
      </div>
      <Piece x={1610} y={430} at={t - 4}>
        <Counter to={48} at={t - 4} dur={20} size={210} suffix="%" color={C.blueInk} />
      </Piece>
      <Piece x={1610} y={620} at={t + 6}>
        <div style={{fontFamily: F.mono, fontSize: 24, color: C.ink2, textAlign: 'center', lineHeight: 1.5}}>
          26 OF 54
          <br />
          THOUGHT IT WAS HUMAN
        </div>
      </Piece>
      <Source text="Tavus, 1 Oct 2026 (company study)" at={t} />
    </AbsoluteFill>
  );
};

export const T3: React.FC = () => {
  const w = useW();
  const tSee = w('sees', 0, 6);
  const tHear = w('hears', 0, 30);
  const tInt = w('interrupt', 0, 120);
  return (
    <AbsoluteFill>
      <Piece x={440} y={420} at={tSee - 4}>
        <Webcam w={260} />
      </Piece>
      <Piece x={440} y={790} at={tHear - 4}>
        <Mic w={130} />
      </Piece>
      <Piece x={1200} y={440} at={tInt - 30}>
        <Wave w={900} h={140} at={tInt - 30} len={80} seed="you" />
      </Piece>
      <Piece x={1340} y={640} at={tInt - 2}>
        <Wave w={700} h={140} at={tInt - 2} len={50} color={C.core} seed="ai" />
      </Piece>
    </AbsoluteFill>
  );
};

export const T4: React.FC = () => {
  const f = useCurrentFrame();
  const sprinkle = e01(f, 20, 40, (x) => x);
  return (
    <AbsoluteFill>
      <Piece x={760} y={600} at={0}>
        <Big size={260} color={C.blueInk}>
          48%
        </Big>
      </Piece>
      <Piece x={1340} y={280} at={4}>
        <Salt w={200} tilt={-140 * e01(f, 10, 12)} />
      </Piece>
      {Array.from({length: 26}, (_, i) => {
        const t = (sprinkle * 40 - i * 1.4) / 16;
        if (t <= 0 || t > 1.2) return null;
        return <div key={i} style={{position: 'absolute', left: 1180 - i * 9 + Math.sin(i) * 20, top: 330 + t * 260, width: 9, height: 9, borderRadius: 2, background: '#fff', boxShadow: '0 1px 3px rgba(16,21,28,.3)'}} />;
      })}
      <Source text="Tavus's own claim" at={10} />
    </AbsoluteFill>
  );
};

export const T5: React.FC = () => {
  const f = useCurrentFrame();
  const ring = Math.sin(f / 3) * 3 * e01(f, 10, 6);
  return (
    <AbsoluteFill>
      <Piece x={820} y={540} at={0} rot={ring}>
        <Phone w={330}>
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
            <Tile w={260} seed={0} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, display: 'flex', justifyContent: 'center', gap: 60}}>
            <div style={{width: 64, height: 64, borderRadius: 32, background: '#E5484D'}} />
            <div style={{width: 64, height: 64, borderRadius: 32, background: '#30A46C'}} />
          </div>
        </Phone>
      </Piece>
      <Piece x={1320} y={430} at={20}>
        <Warning w={260} />
      </Piece>
    </AbsoluteFill>
  );
};

export const T6: React.FC = () => {
  const w = useW();
  const tF = w('fraud', 0, 80);
  const tI = w('impersonation', 0, 100);
  const tC = w('customer', 0, 120);
  return (
    <AbsoluteFill>
      <Piece x={460} y={540} at={tF - 4} rot={-6}>
        <BankCard w={380} />
      </Piece>
      <Piece x={960} y={540} at={tI - 4}>
        <Mask w={360} />
      </Piece>
      <Piece x={1460} y={540} at={tC - 4} rot={6}>
        <Headset w={330} />
      </Piece>
    </AbsoluteFill>
  );
};

export const T7: React.FC = () => (
  <AbsoluteFill>
    <Piece x={960} y={680} at={0} shadow={false}>
      <Road w={1700} />
    </Piece>
  </AbsoluteFill>
);

/* ================================================================== STORY 5 · OPENAI */
export const O0: React.FC = () => {
  const f = useCurrentFrame();
  const w = useW();
  const tU = w('untangle', 0, 120);
  return (
    <AbsoluteFill>
      <Piece x={960} y={250} at={0} shadow={false}>
        <Logo3D name="openai" w={400} h={260} at={0} fit={0.8} />
      </Piece>
      <Piece x={960} y={720} at={6} shadow={false}>
        <Tangle w={720} k={e01(f, tU, 40)} />
      </Piece>
    </AbsoluteFill>
  );
};

export const O1: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tJ = w('july', 0, 10);
  const tV = w('vulnerabilities', 0, 140);
  return (
    <AbsoluteFill>
      <Piece x={330} y={300} at={tJ - 4} rot={-5}>
        <CalPage month="JUL" day="2026" w={240} />
      </Piece>
      <Piece x={860} y={560} at={2}>
        <GlassBox w={760}>
          <div style={{position: 'absolute', left: 200, top: 210}}>
            <Agent w={150} />
          </div>
          <div style={{position: 'absolute', left: 420, top: 230}}>
            <Agent w={150} />
          </div>
        </GlassBox>
      </Piece>
      <Piece x={1560} y={560} at={tV - 30}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 30px)', gap: 8}}>
          {Array.from({length: 90}, (_, i) => (
            <svg key={i} width={30} height={30} viewBox="0 0 30 30" style={{opacity: e01(f, tV - 30 + i * 0.4, 6)}}>
              <ellipse cx={15} cy={17} rx={8} ry={10} fill="#3B4757" />
              <path d="M7 12 L2 8 M23 12 L28 8 M7 19 L1 19 M23 19 L29 19 M8 25 L3 29 M22 25 L27 29" stroke="#3B4757" strokeWidth={2} />
            </svg>
          ))}
        </div>
      </Piece>
      <Piece x={1560} y={900} at={tV - 6}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
          <Counter to={898} at={tV - 6} dur={22} size={96} color={C.blueInk} />
          <span style={{fontFamily: F.mono, fontSize: 20, color: C.ink2}}>REAL VULNERABILITIES</span>
        </div>
      </Piece>
      <Source text="OpenAI, via Decrypt" at={tV} />
    </AbsoluteFill>
  );
};

export const O2: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tFlaw = w('flaw', 0, 30);
  const tEsc = w('escape', 0, 100);
  const out = e01(f, tEsc - 2, 22);
  return (
    <AbsoluteFill>
      <Piece x={760} y={560} at={0}>
        <GlassBox w={760} crack={e01(f, tFlaw - 2, 14)}>
          <div style={{position: 'absolute', left: 200 + out * 640, top: 210 - out * 40}}>
            <Agent w={150} />
          </div>
          <div style={{position: 'absolute', left: 420 + out * 600, top: 230 + out * 60}}>
            <Agent w={150} />
          </div>
        </GlassBox>
      </Piece>
    </AbsoluteFill>
  );
};

export const O3: React.FC = () => {
  const f = useCurrentFrame();
  const k = e01(f, 6, 40);
  return (
    <AbsoluteFill>
      <Piece x={1480} y={480} at={0} shadow={false}>
        <Logo3D name="huggingface" w={460} h={460} at={0} fit={0.8} />
      </Piece>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d="M220 700 C520 760 860 720 1240 560" fill="none" stroke={C.core} strokeWidth={5} strokeDasharray="12 12" opacity={e01(f, 2, 8)} />
      </svg>
      <div style={{position: 'absolute', left: 220 + k * 900, top: 640 - k * 120, filter: 'drop-shadow(0 16px 24px rgba(10,58,140,.3))'}}>
        <Agent w={130} />
      </div>
      <div style={{position: 'absolute', left: 160 + k * 860, top: 700 - k * 90, filter: 'drop-shadow(0 16px 24px rgba(10,58,140,.3))'}}>
        <Agent w={110} />
      </div>
      <Piece x={1480} y={800} at={10}>
        <Big size={60}>Hugging Face</Big>
      </Piece>
    </AbsoluteFill>
  );
};

export const O4: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tK = w('answer', 0, 70);
  return (
    <AbsoluteFill>
      <Piece x={620} y={540} at={0} rot={-8}>
        <Keycard w={420} />
      </Piece>
      <Piece x={1320} y={600} at={8}>
        <Envelope w={520} open={e01(f, tK - 4, 14)}>
          <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.12em', color: C.ink, marginBottom: 14}}>ANSWER KEY</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10}}>
            {Array.from({length: 10}, (_, i) => (
              <div key={i} style={{height: 18, borderRadius: 4, background: 'rgba(16,21,28,.13)'}} />
            ))}
          </div>
        </Envelope>
      </Piece>
    </AbsoluteFill>
  );
};

export const O5: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const t4 = w('four', 0, 60);
  return (
    <AbsoluteFill>
      {[0, 1, 2, 3].map((i) => (
        <Piece key={i} x={420 + i * 360} y={540} at={t4 - 6 + i * 4}>
          <Server w={220} lit={e01(f, t4 + i * 6, 4)} />
        </Piece>
      ))}
      <Piece x={960} y={900} at={t4 + 24}>
        <Counter to={4} at={t4 + 24} dur={8} size={110} color={C.blueInk} suffix=" more services" />
      </Piece>
    </AbsoluteFill>
  );
};

export const O6: React.FC = () => {
  const w = useW();
  const tAu = w('australian', 0, 30);
  const tUs = w('u', 0, 150);
  return (
    <AbsoluteFill>
      <Piece x={520} y={470} at={tAu - 6} shadow={false}>
        <WorldMap w={760} h={620} at={tAu - 6} center={[134, -26]} scale={4.6} hi={{Australia: tAu}} pins={[{lon: 149.13, lat: -35.28, at: tAu + 8}]} />
      </Piece>
      <Piece x={520} y={860} at={tAu + 6}>
        <Kicker text="Medicare Statistics · June 2026" at={tAu + 6} size={22} />
      </Piece>
      {['seal_sec', 'seal_census', 'seal_ed'].map((s, i) => (
        <Piece key={s} x={1390} y={240 + i * 280} at={tUs - 4 + i * 6} from="r">
          <Browser w={560}>
            <Seal name={s} size={150} />
            <div style={{flex: 1}}>
              <div style={{height: 12, borderRadius: 6, background: 'rgba(16,21,28,.2)', width: '80%'}} />
              <div style={{height: 10, borderRadius: 5, background: 'rgba(16,21,28,.12)', width: '60%', marginTop: 14}} />
              <div style={{height: 10, borderRadius: 5, background: 'rgba(16,21,28,.12)', width: '70%', marginTop: 10}} />
            </div>
          </Browser>
        </Piece>
      ))}
    </AbsoluteFill>
  );
};

export const O7: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({length: 24}, (_, i) => {
        const k = e01(f, 2 + i * 1.2, 14);
        const a = (i / 23) * Math.PI;
        const x = 960 - Math.cos(a) * 760 * k;
        const y = 760 - Math.sin(a) * 520 * k;
        return (
          <div key={i} style={{position: 'absolute', left: x - 90, top: y - 58, opacity: k, transform: `rotate(${(i - 12) * 4}deg)`, filter: 'drop-shadow(0 10px 18px rgba(10,58,140,.2))'}}>
            <Envelope w={180} blue={i === 12} />
          </div>
        );
      })}
      <Piece x={960} y={800} at={20}>
        <Counter to={100} at={20} dur={20} size={150} suffix="+" color={C.blueInk} />
      </Piece>
      <Piece x={960} y={920} at={26}>
        <Kicker text="Organizations alerted" at={26} size={22} />
      </Piece>
    </AbsoluteFill>
  );
};

export const O8: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tPB = w('petabytes', 0, 20);
  const tM = w('months', 0, 140);
  const n = Math.floor(48 * e01(f, 0, 70, (x) => x));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 150, top: 300, width: 1000, display: 'flex', flexWrap: 'wrap-reverse', gap: 12}}>
        {Array.from({length: 48}, (_, i) => (
          <div key={i} style={{opacity: i < n ? 1 : 0}}>
            <Drive w={110} />
          </div>
        ))}
      </div>
      <Piece x={1460} y={420} at={tPB - 4}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
          <Counter to={50} at={tPB - 4} dur={18} size={190} color={C.blueInk} />
          <span style={{fontFamily: F.display, fontWeight: 600, fontSize: 90, color: C.blueInk}}>PB</span>
        </div>
      </Piece>
      {['MO 1', 'MO 2', 'MO 3'].map((m, i) => (
        <Piece key={m} x={1290 + i * 170} y={790} at={tM - 6 + i * 5} rot={-4 + i * 4}>
          <CalPage month={m} day="2026" w={150} />
        </Piece>
      ))}
    </AbsoluteFill>
  );
};

export const O9: React.FC = () => {
  const w = useW();
  const f = useCurrentFrame();
  const tOut = w('outside', 0, 160);
  const slide = e01(f, tOut - 4, 22);
  return (
    <AbsoluteFill>
      {[0, 1, 2].map((i) => (
        <Piece key={i} x={330 + i * 270} y={500} at={2 + i * 4}>
          <Chair w={210} tilt={-4 + i * 4} />
        </Piece>
      ))}
      <Piece x={330} y={830} at={12}>
        <div style={{display: 'flex', gap: 30}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{transform: `rotate(${-20 + i * 20}deg)`, opacity: 0.85}}>
              <IDBadge w={120} title="Safety" />
            </div>
          ))}
        </div>
      </Piece>
      <div style={{position: 'absolute', left: 1050 + slide * 360, top: 420 - slide * 20, transform: `rotate(${-4 + slide * 6}deg)`, filter: 'drop-shadow(0 18px 28px rgba(10,58,140,.25))', opacity: e01(f, 30, 10)}}>
        <Folder w={360} blue>
          <svg width={300} height={160}>
            {[[30, 40], [150, 30], [250, 60], [90, 120], [210, 130]].map(([x, y], i) => (
              <rect key={i} x={x - 22} y={y - 14} width={44} height={28} rx={6} fill="rgba(255,255,255,.85)" />
            ))}
            <path d="M30 40 L150 30 L250 60 M150 30 L90 120 L210 130 L250 60" stroke="rgba(255,255,255,.7)" strokeWidth={3} fill="none" />
          </svg>
        </Folder>
      </div>
      <Piece x={1700} y={460} at={tOut - 10}>
        <svg width={260} height={300} viewBox="0 0 100 115">
          <rect x={10} y={30} width={80} height={85} fill="#E9EDF2" />
          <rect x={30} y={10} width={40} height={20} fill="#C9D2DE" />
          {Array.from({length: 9}, (_, i) => (
            <rect key={i} x={20 + (i % 3) * 22} y={42 + Math.floor(i / 3) * 22} width={14} height={12} rx={2} fill="#C7D3E2" />
          ))}
        </svg>
      </Piece>
    </AbsoluteFill>
  );
};

export const O10: React.FC = () => {
  const w = useW();
  const tSub = w('subpoena', 0, 60);
  return (
    <AbsoluteFill>
      <Piece x={470} y={520} at={0}>
        <Photo slug="bonta" name="Rob Bonta" role="California Attorney General" w={420} h={480} pos="50% 12%" />
      </Piece>
      <Piece x={1080} y={300} at={8}>
        <Seal name="seal_ca" size={240} />
      </Piece>
      <Piece x={1500} y={600} at={tSub - 6} from="drop" rot={4}>
        <Doc w={420} title="Investigative subpoena" lines={10} seed="ca" />
      </Piece>
      <Source text="California DOJ, 1 Oct 2026" at={tSub} />
    </AbsoluteFill>
  );
};

export const O11: React.FC = () => {
  const w = useW();
  const tQ = w('can', 0, 50);
  return (
    <AbsoluteFill>
      <Piece x={330} y={480} at={0}>
        <Cutout src="cut/bonta.png" w={400} bloom={0.6} />
      </Piece>
      <Piece x={1160} y={500} at={tQ - 6}>
        <Quote text="can and should be held legally accountable." at={tQ} size={86} width={1150} />
      </Piece>
      <Piece x={1160} y={850} at={tQ + 20}>
        <div style={{fontFamily: F.mono, fontSize: 20, color: C.ink2, letterSpacing: '0.06em'}}>— ROB BONTA, CALIFORNIA ATTORNEY GENERAL</div>
      </Piece>
    </AbsoluteFill>
  );
};

export const O12: React.FC = () => {
  const w = useW();
  const tAl = w('alabama', 0, 40);
  const tF = w('fifteen', 0, 70);
  return (
    <AbsoluteFill>
      <Piece x={820} y={520} at={0}>
        <USMap w={1200} at={0} fill={{Alabama: tAl}} />
      </Piece>
      <Piece x={1640} y={420} at={tAl}>
        <Big size={64} color={C.blueInk}>
          Alabama
        </Big>
      </Piece>
      <Piece x={1640} y={580} at={tF - 2}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
          <Counter to={15} at={tF - 2} dur={12} size={110} prefix="+" />
          <span style={{fontFamily: F.mono, fontSize: 22, color: C.ink2}}>STATES</span>
        </div>
      </Piece>
      <Source text="Alabama AG subpoena; 16-state AG coalition led by Iowa" at={tF} />
    </AbsoluteFill>
  );
};

export const O13: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Piece x={520} y={520} at={0}>
        <Seal name="seal_ftc" size={380} />
      </Piece>
      {[0, 1, 2, 3].map((i) => (
        <Piece key={i} x={1120 + i * 200} y={560} at={8 + i * 3}>
          <Agent w={140} blue={false} />
        </Piece>
      ))}
      <div style={{position: 'absolute', left: 1040 + Math.sin(f / 26) * 260 + 260, top: 360, filter: 'drop-shadow(0 18px 30px rgba(10,58,140,.25))', opacity: e01(f, 16, 10)}}>
        <Magnifier size={300} />
      </div>
    </AbsoluteFill>
  );
};

export const O14: React.FC = () => {
  const f = useCurrentFrame();
  const sc = useScene();
  const drift = e01(f, 20, sc.dur - 40, (x) => x * x);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: e01(f, 0, 12)}}>
        <path d="M700 1080 L900 300 L1020 300 L1220 1080 Z" fill="#B8C3D2" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const t = ((i / 6 + (f / 200) % (1 / 6)) % 1);
          const y = 300 + t * t * 780;
          return <rect key={i} x={958 - t * 6} y={y} width={4 + t * 12} height={10 + t * 50} fill="#F7F9FB" />;
        })}
        <path d="M900 300 L700 1080" stroke={C.core} strokeWidth={6} />
        <path d="M1020 300 L1220 1080" stroke={C.core} strokeWidth={6} />
      </svg>
      <div style={{position: 'absolute', left: 900 + drift * 230, top: 640, transform: `rotate(${drift * 14}deg)`, filter: 'drop-shadow(0 20px 30px rgba(10,58,140,.35))', opacity: e01(f, 6, 10)}}>
        <Agent w={170} />
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== OUTRO */
export const E0: React.FC = () => {
  const w = useW();
  const items: [string, number, React.ReactNode][] = [
    ['nvidia', 0, <Cutout key="a" src="cut/spark_oblique.png" w={300} />],
    ['amazon', 0, <Brick key="b" w={260} label="$1B" blue={false} />],
    ['anthropic', 0, <IDBadge key="c" w={150} title="Frontier Deployed Engineer" />],
    ['half', 0, <Tile key="d" w={260} seed={1} on={1} />],
    ['openai', 1, <Agent key="e" w={160} />],
  ];
  return (
    <AbsoluteFill>
      {items.map(([word, n, node], i) => (
        <Piece key={i} x={230 + i * 365} y={540} at={w(word, n, 10 + i * 60) - 4}>
          <div style={{width: 330, display: 'flex', justifyContent: 'center'}}>{node}</div>
        </Piece>
      ))}
    </AbsoluteFill>
  );
};

export const E1: React.FC = () => {
  const f = useCurrentFrame();
  const w = useW();
  const tLike = w('like', 0, 30);
  const k = e01(f, tLike - 6, 9);
  return (
    <AbsoluteFill>
      <Piece x={960} y={540} at={0} shadow={false}>
        <div style={{width: 680, height: 420, display: 'grid', placeItems: 'center'}}>
          <MorphPill k={k} label="AI News · this week" rows={[['Like', 'this video'], ['Subscribe', 'weekly roundup'], ['Comment', 'biggest story?']]} />
        </div>
      </Piece>
    </AbsoluteFill>
  );
};
