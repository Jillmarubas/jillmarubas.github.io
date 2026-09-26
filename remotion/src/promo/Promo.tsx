import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Bill, Briefcase, Can, Coin, PageCurl} from './assets';
import {DashedRing, DotGrid, DrawPath, Paper, ScatterText, TypeText, WordRise, clamp, ease, useSpr, velocityBlur, whip} from './motion';
import './fonts';

const script = 'Caveat';
const sans = 'Inter';
const display = 'Poppins';

export type PromoProps = {
  brand: string;
  from: string;
  valuation: string;
  years: string;
  proof: string;
  notJust: string;
  product: string;
  insight: string;
  selling: string;
  idea: string;
  ideaBody: string;
  ctaSmall: string;
  ctaBig: string;
  sound: boolean;
};

export const PROMO_DURATION = 420;

const INK = '#28282c';
const S = {
  script: {fontFamily: script, fontWeight: 600, color: INK} as React.CSSProperties,
  bold: {fontFamily: sans, fontWeight: 800, fontStyle: 'italic', color: INK, letterSpacing: -1} as React.CSSProperties,
  body: {fontFamily: sans, fontWeight: 500, fontSize: 30, lineHeight: 1.45, color: '#3a3a3e'} as React.CSSProperties,
};

const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>
);

// Camera moves between scenes: whip pans with blur, a foreground bill wipe, and a fade.
const cam = (f: number) => {
  const t1 = interpolate(f, [84, 98], [0, 1], {...clamp, easing: whip});
  const t3 = interpolate(f, [262, 276], [0, 1], {...clamp, easing: whip});
  return {t1, t3};
};

/* ------------------------------------------------------------ scene 1: hook */
const Hook: React.FC<PromoProps> = (p) => {
  const f = useCurrentFrame();
  const enter = useSpr(10, 13, 110);
  const canX = (fr: number) => interpolate(fr, [10, 26], [900, 0], {...clamp, easing: ease});
  const blur = velocityBlur(canX, f, 0.12);
  const rot = interpolate(enter, [0, 1], [18, -22]);
  const bob = Math.sin(f / 14) * 6;
  const billDrift = interpolate(f, [30, 98], [0, 40]);
  return (
    <AbsoluteFill>
      <At x={-150 + billDrift} y={-40} style={{transform: 'rotate(22deg)', filter: 'blur(5px)', opacity: interpolate(f, [30, 40], [0, 1], clamp)}}>
        <Bill width={520} />
      </At>
      <At x={560} y={300} style={{...S.script, fontSize: 66}}>
        <TypeText text="watch how" start={18} cps={1.4} />
      </At>
      <At x={470} y={372} style={{...S.bold, fontStyle: 'normal', fontSize: 92}}>
        <WordRise words={p.brand.split(' ')} start={26} gap={6} />
      </At>
      <At x={540} y={950} style={{transform: `translate(${canX(f)}px, ${bob}px)`}}>
        <DashedRing size={700} start={24} id="ring1" />
        <div style={{position: 'absolute', left: -150, top: -307, transform: `rotate(${rot}deg)`, filter: `blur(${blur}px) drop-shadow(18px 30px 26px rgba(0,0,0,0.35))`}}>
          <Can brand={p.brand} dark />
        </div>
      </At>
      <At x={140} y={1330} style={{...S.script, fontSize: 60}}>
        <TypeText text="grew from" start={40} cps={1.2} />
      </At>
      <At x={140} y={1392} style={{...S.bold, fontSize: 84}}>
        <TypeText text={p.from} start={48} cps={0.9} trail={7} />
      </At>
      <At x={820} y={1660}>
        <PageCurl size={260} />
      </At>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ scene 2: the number */
const Bills: React.FC<{start: number; count: number}> = ({start, count}) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({length: count}).map((_, i) => {
        const s = start + i * 3.5 + random(`b${i}`) * 6;
        // depth: most bills fall behind the text, every fourth one sweeps past in front
        const z = i % 4 === 3 ? 1.35 + random(`z${i}`) * 0.4 : 0.45 + random(`z${i}`) * 0.45;
        const side = random(`s${i}`) < 0.5;
        const x0 = z > 1 ? random(`x${i}`) * 1080 : side ? random(`x${i}`) * 300 - 80 : 780 + random(`x${i}`) * 380;
        const drift = (random(`d${i}`) - 0.5) * 700;
        const dur = 50 / Math.sqrt(z);
        const y = (fr: number) => interpolate(fr, [s, s + dur], [-400, 2300], clamp);
        const t = interpolate(f, [s, s + dur], [0, 1], clamp);
        if (t <= 0 || t >= 1) return null;
        const spin = (random(`r${i}`) - 0.5) * 540 * t + random(`r0${i}`) * 180;
        const flip = Math.cos(t * Math.PI * (2 + random(`f${i}`) * 3));
        const depthBlur = Math.abs(z - 1) * 9 + velocityBlur(y, f, 0.05, 12);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x0 + drift * t,
              top: y(f),
              transform: `translate(-50%, -50%) scale(${z}) rotate(${spin}deg) scaleY(${0.35 + 0.65 * Math.abs(flip)})`,
              filter: `blur(${depthBlur}px) grayscale(0.4)`,
              zIndex: z > 1 ? 5 : -1,
              opacity: 0.95,
            }}
          >
            <Bill width={360} />
          </div>
        );
      })}
    </>
  );
};

const Number: React.FC<PromoProps> = (p) => {
  const f = useCurrentFrame();
  // bills with zIndex -1 sit behind everything in this scene
  const land = useSpr(88, 12, 100);
  const caseY = interpolate(land, [0, 1], [-260, 0]);
  const big = interpolate(f, [108, 124], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{isolation: 'isolate'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <DrawPath d="M -80 1250 C 300 1180, 700 900, 1180 420" start={108} duration={20} width={46} color="#9a9a9a" opacity={0.45} />
      </svg>
      <At x={540} y={320} style={{...S.bold, fontStyle: 'normal', fontSize: 58, letterSpacing: 2, transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
        <ScatterText text={`${p.valuation} DOLLAR`} start={98} duration={16} seed="val" />
      </At>
      <At
        x={540}
        y={360}
        style={{
          fontFamily: display,
          fontWeight: 700,
          fontSize: 270,
          lineHeight: 1,
          letterSpacing: -8,
          transform: `translateX(-50%) scale(${1.12 - 0.12 * big})`,
          color: `rgba(40,40,44,${0.15 + 0.85 * big})`,
          filter: `blur(${(1 - big) * 10}px)`,
        }}
      >
        brand
      </At>
      <At x={540} y={960} style={{transform: `translateY(${caseY}px)`}}>
        <DotGrid w={760} h={500} start={94} />
        <div style={{position: 'absolute', left: -320, top: -270, filter: `drop-shadow(0 34px 30px rgba(0,0,0,0.35)) blur(${velocityBlur((fr) => fr, 0) * 0}px)`}}>
          <Briefcase width={640} />
        </div>
      </At>
      <At x={540} y={1250} style={{...S.bold, fontSize: 76, transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
        <WordRise words={p.years.split(' ')} start={120} gap={4} />
      </At>
      <At x={170} y={1350} style={{...S.body, width: 740, textAlign: 'center'}}>
        <TypeText text={p.proof} start={130} cps={2.4} trail={4} />
      </At>
      <Bills start={110} count={16} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ scene 3: not just */
const NotJust: React.FC<PromoProps> = (p) => {
  const f = useCurrentFrame();
  const pop = useSpr(196, 12, 120);
  return (
    <AbsoluteFill>
      <At x={170} y={250} style={{...S.script, fontSize: 64}}>
        <TypeText text={p.notJust} start={200} cps={1.6} />
      </At>
      <At x={170} y={320} style={{...S.bold, fontSize: 104, whiteSpace: 'nowrap'}}>
        <WordRise words={p.product.split(' ')} start={206} gap={7} from="right" />
      </At>
      <At x={540} y={960} style={{transform: `translateY(${(1 - pop) * 140}px) scale(${0.85 + 0.15 * pop})`, opacity: pop}}>
        <DashedRing size={760} start={210} id="ring3" />
        <div style={{position: 'absolute', left: -230, top: -300, transform: 'rotate(-10deg)', filter: 'drop-shadow(18px 30px 26px rgba(0,0,0,0.3))'}}>
          <Can brand={p.brand} dark width={280} />
        </div>
        <div style={{position: 'absolute', left: -60, top: -290, transform: 'rotate(-10deg)', filter: 'drop-shadow(18px 30px 26px rgba(0,0,0,0.3))'}}>
          <Can brand={p.brand} dark={false} width={280} />
        </div>
      </At>
      <At x={170} y={1420} style={{...S.body, width: 740, textAlign: 'center'}}>
        <TypeText text={p.insight} start={218} cps={2.2} trail={4} />
      </At>
      <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: interpolate(f, [0, 1], [1, 1])}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ scene 4: the idea */
const Idea: React.FC<PromoProps> = (p) => {
  const f = useCurrentFrame();
  const coinX = (fr: number) => interpolate(fr, [266, 286], [900, 0], {...clamp, easing: ease});
  const bigX = (fr: number) => interpolate(fr, [270, 292], [700, 0], {...clamp, easing: ease});
  const letters = [...p.idea];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <DrawPath d="M 1100 60 C 900 380, 400 520, -60 600" start={282} duration={22} width={3} />
        <DrawPath d="M 1100 330 C 700 330, 300 280, -60 200" start={288} duration={22} width={2} />
        <DrawPath d="M 60 1860 C 200 1500, 600 1360, 1120 1330" start={292} duration={24} width={3} />
      </svg>
      <At x={740} y={470} style={{transform: `translateX(${coinX(f)}px)`}}>
        <DotGrid w={520} h={420} start={268} step={40} />
        <div
          style={{
            position: 'absolute',
            left: -190,
            top: -190,
            transform: `rotate(${-coinX(f) / 3}deg)`,
            filter: `blur(${velocityBlur(coinX, f, 0.1)}px) drop-shadow(14px 22px 18px rgba(0,0,0,0.35))`,
          }}
        >
          <Coin size={380} />
        </div>
      </At>
      <At x={930} y={1720} style={{transform: `translateX(${bigX(f)}px)`}}>
        <DotGrid w={600} h={500} start={274} step={40} />
        <div style={{position: 'absolute', left: -480, top: -480, transform: `rotate(${-bigX(f) / 6 + 12}deg)`, filter: 'blur(3px) drop-shadow(10px 20px 24px rgba(0,0,0,0.3))'}}>
          <Coin size={960} />
        </div>
      </At>
      <At x={960} y={870} style={{...S.script, fontSize: 60, transform: 'translateX(-100%)', whiteSpace: 'nowrap'}}>
        <TypeText text={p.selling} start={288} cps={1.4} />
      </At>
      <At x={960} y={930} style={{...S.bold, fontSize: 112, transform: 'translateX(-100%)', whiteSpace: 'nowrap', display: 'flex'}}>
        {letters.map((ch, i) => {
          const at = 296 + i * 2.2;
          const last = i === letters.length - 1;
          const o = interpolate(f, [at, at + 5], [0, 1], clamp);
          const drop = last ? interpolate(f, [at, at + 10], [70, 0], {...clamp, easing: ease}) : 0;
          return (
            <span key={i} style={{opacity: o, transform: `translateY(${drop}px)`, color: last ? `rgba(40,40,44,${0.3 + 0.7 * o})` : INK}}>
              {ch}
            </span>
          );
        })}
      </At>
      <At x={250} y={1090} style={{...S.body, width: 710, textAlign: 'right'}}>
        <TypeText text={p.ideaBody} start={306} cps={2.4} trail={4} />
      </At>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ scene 5: CTA */
const Cta: React.FC<PromoProps> = (p) => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
    <div style={{position: 'relative', top: -20}}>
      <div style={{...S.script, fontSize: 70, marginLeft: -20}}>
        <TypeText text={p.ctaSmall} start={360} cps={1.4} />
      </div>
      <div style={{fontFamily: display, fontWeight: 600, fontSize: 124, lineHeight: 1, color: INK, letterSpacing: -2}}>
        <WordRise words={p.ctaBig.split(' ')} start={368} gap={8} />
      </div>
    </div>
  </AbsoluteFill>
);

export const Promo: React.FC<PromoProps> = (p) => {
  const f = useCurrentFrame();
  const {t1, t3} = cam(f);
  const whipBlur1 = Math.sin(t1 * Math.PI) * 26;
  const whipBlur3 = Math.sin(t3 * Math.PI) * 26;

  // foreground bill wipe between scene 2 and 3
  const wipe = interpolate(f, [184, 206], [0, 1], {...clamp, easing: whip});
  const s2Out = interpolate(f, [190, 198], [1, 0], clamp);
  const s3In = interpolate(f, [194, 204], [0, 1], clamp);
  const s4Out = interpolate(f, [344, 352], [1, 0], clamp);
  const s5In = interpolate(f, [350, 360], [0, 1], clamp);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper />
      {f < 100 && (
        <AbsoluteFill style={{transform: `translateY(${t1 * 1920}px)`, filter: `blur(${whipBlur1}px)`}}>
          <Hook {...p} />
        </AbsoluteFill>
      )}
      {f >= 84 && f < 200 && (
        <AbsoluteFill style={{transform: `translateY(${(t1 - 1) * 1920}px)`, filter: `blur(${f < 100 ? whipBlur1 : 0}px)`, opacity: s2Out}}>
          <Number {...p} />
        </AbsoluteFill>
      )}
      {f >= 192 && f < 278 && (
        <AbsoluteFill style={{transform: `translateX(${-t3 * 1080}px)`, filter: `blur(${whipBlur3}px)`, opacity: s3In}}>
          <NotJust {...p} />
        </AbsoluteFill>
      )}
      {f >= 262 && f < 354 && (
        <AbsoluteFill style={{transform: `translateX(${(1 - t3) * 1080}px)`, filter: `blur(${f < 278 ? whipBlur3 : 0}px)`, opacity: s4Out}}>
          <Idea {...p} />
        </AbsoluteFill>
      )}
      {f >= 348 && (
        <AbsoluteFill style={{opacity: s5In}}>
          <Cta {...p} />
        </AbsoluteFill>
      )}
      {wipe > 0 && wipe < 1 && (
        <div
          style={{
            position: 'absolute',
            left: interpolate(wipe, [0, 1], [1500, -1400]),
            top: interpolate(wipe, [0, 1], [-700, 1500]),
            transform: 'rotate(58deg) scale(5.2)',
            filter: 'blur(9px) grayscale(0.3)',
            zIndex: 20,
          }}
        >
          <Bill width={520} />
        </div>
      )}
      {p.sound && <Audio src={staticFile('promo-sfx.wav')} />}
    </AbsoluteFill>
  );
};
