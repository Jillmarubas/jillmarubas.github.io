import React from 'react';
import {Easing, random} from 'remotion';
import {Human, IceCream} from './cast';
import {HC, Hero, MC, Monster} from './giants';
import {Beam, Car, Debris, Dust, Fire, ParkGround, Road, Sea, SeeSaw, Shockwave, Skyline, Sky, Slide, Smoke, Sparks, Splash, StreetRow, SwingSet, Tint, shake} from './sets';

/*
 * The 27 shots of the monster short, in order (durations and sound cues live in
 * timeline.json). Each shot draws a full 1920x1080 frame from its local frame t.
 */
export type ShotProps = {t: number; d: number; mood: number};
const cl = (x: number) => Math.max(0, Math.min(1, x));
const io = Easing.bezier(0.45, 0, 0.2, 1);
const e = (t: number, a: number, len: number) => io(cl((t - a) / len));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const S = 30; // fps

/** Camera: a slow push from z0 to z1 around (x, y), plus shake. */
const Cam: React.FC<{t: number; d: number; z0?: number; z1?: number; x?: number; y?: number; x1?: number; y1?: number; sh?: number[]; children: React.ReactNode}> = ({t, d, z0 = 1, z1 = 1.06, x = 960, y = 540, x1, y1, sh = [0, 0], children}) => {
  const k = io(cl(t / d));
  const z = lerp(z0, z1, k);
  const cx = lerp(x, x1 ?? x, k);
  const cy = lerp(y, y1 ?? y, k);
  return <g transform={`translate(${960 + sh[0]} ${540 + sh[1]}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>;
};

const Gulls: React.FC<{t: number; n?: number; y?: number; flee?: boolean; seed?: number}> = ({t, n = 6, y = 260, flee, seed = 0}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const sp = flee ? 9 : 2.2;
      const x = ((random(`g${seed}${i}`) * 2200 + t * sp * (1 + (i % 3) * 0.2)) % 2400) - 200;
      const yy = y + random(`gy${seed}${i}`) * 180 - (flee ? t * 1.5 : 0) + Math.sin(t / 10 + i) * 8;
      const f = Math.sin(t / (flee ? 1.6 : 3) + i) * 12;
      return <path key={i} d={`M${x - 22} ${yy + f} Q ${x - 11} ${yy - 8} ${x} ${yy + 2} Q ${x + 11} ${yy - 8} ${x + 22} ${yy + f}`} stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

const Boat: React.FC<{t: number; rock?: number; s?: number; c?: string}> = ({t, rock = 1, s = 1, c = '#E8403A'}) => (
  <g transform={`scale(${s}) rotate(${Math.sin(t / 9) * 6 * rock})`}>
    <path d="M-90 0 L90 0 L64 40 L-70 40 Z" fill={c} />
    <rect x={-40} y={-44} width={70} height={44} rx={6} fill="#FFFFFF" />
    <rect x={-30} y={-36} width={20} height={14} rx={3} fill="#9FD8FF" />
    <rect x={0} y={-36} width={20} height={14} rx={3} fill="#9FD8FF" />
    <rect x={30} y={-90} width={6} height={90} fill="#6B4F3A" />
  </g>
);

const Lighthouse: React.FC = () => (
  <g>
    <path d="M-34 0 L-22 -230 L22 -230 L34 0 Z" fill="#FFFFFF" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${-31 + i * 3.5} ${-40 - i * 70} L${-28 + i * 3.5} ${-75 - i * 70} L${28 - i * 3.5} ${-75 - i * 70} L${31 - i * 3.5} ${-40 - i * 70} Z`} fill="#E8403A" />
    ))}
    <rect x={-26} y={-270} width={52} height={40} fill="#FFE680" />
    <path d="M-32 -270 L0 -300 L32 -270 Z" fill="#1E2A44" />
  </g>
);

/** A tower that breaks into slices and falls sideways. */
const Collapse: React.FC<{w: number; h: number; k: number; c1: string; c2: string; dir?: number; seed?: number}> = ({w, h, k, c1, c2, dir = 1, seed = 0}) => {
  const n = 7;
  const sh = h / n;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const fromTop = n - 1 - i;
        const kk = cl(k * 1.6 - (1 - fromTop / n) * 0.5);
        const y = -sh * (i + 1);
        const drop = kk * kk * (sh * (i + 1)) * 0.95;
        const side = kk * dir * (60 + fromTop * 40) * (0.6 + random(`c${seed}${i}`) * 0.8);
        const rot = kk * dir * (10 + fromTop * 9) * (0.5 + random(`cr${seed}${i}`));
        if (kk > 0.98 && i > 0) return null;
        return (
          <g key={i} transform={`translate(${side} ${drop}) rotate(${rot} 0 ${y + sh / 2})`}>
            <rect x={-w / 2} y={y} width={w} height={sh + 1} fill={c1} />
            <rect x={w / 2 - w * 0.28} y={y} width={w * 0.28} height={sh + 1} fill={c2} />
            {[0, 1, 2].map((j) => (
              <rect key={j} x={-w / 2 + 14 + j * ((w - 28) / 3)} y={y + sh * 0.25} width={(w - 28) / 3 - 12} height={sh * 0.45} rx={4} fill="#9FD8FF" />
            ))}
          </g>
        );
      })}
    </g>
  );
};

/* ================================================================== ACT 1: the playground */
/** Claude's mark: an orange spark of rounded rays. */
const ClaudeMark: React.FC<{k: number; t: number; size?: number}> = ({k, t, size = 120}) => {
  const rays = 12;
  return (
    <g transform={`rotate(${t * 0.3})`}>
      {Array.from({length: rays}, (_, i) => {
        const a = (i / rays) * 360 + (i % 2 ? 8 : 0);
        const len = size * (i % 3 === 0 ? 1 : i % 3 === 1 ? 0.78 : 0.88) * cl(k * 1.4 - i * 0.03);
        return <rect key={i} x={-size * 0.075} y={-len} width={size * 0.15} height={len} rx={size * 0.075} fill="#D97757" transform={`rotate(${a})`} />;
      })}
      <circle r={size * 0.14 * cl(k * 2)} fill="#D97757" />
    </g>
  );
};

const Presents: React.FC<ShotProps> = ({t}) => {
  const logo = e(t, 6, 30);
  const name = e(t, 24, 22);
  const pres = e(t, 50, 20);
  const out = 1 - e(t, 100, 18);
  return (
    <g opacity={out}>
      <rect x={-400} y={-400} width={2800} height={2000} fill="#141413" />
      <rect x={-400} y={-400} width={2800} height={2000} fill="url(#presentsGlow)" opacity={logo} />
      <defs>
        <radialGradient id="presentsGlow" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor="#D97757" stopOpacity={0.22} />
          <stop offset="1" stopColor="#D97757" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(960 400) scale(${0.85 + 0.15 * logo})`}>
        <ClaudeMark k={logo} t={t} size={120} />
      </g>
      <text x={960} y={640} textAnchor="middle" fontFamily="Fraunces" fontWeight={600} fontSize={96} fill="#F5F0E8" letterSpacing={2} opacity={name} transform={`translate(0 ${(1 - name) * 20})`}>
        Opus 5.5
      </text>
      <text x={960} y={730} textAnchor="middle" fontFamily="Poppins" fontWeight={600} fontSize={34} fill="#D97757" letterSpacing={18} opacity={pres}>
        PRESENTS
      </text>
    </g>
  );
};

const Open: React.FC<ShotProps> = ({t, d, mood}) => {
  const title = e(t, 30, 24) * (1 - e(t, 150, 24));
  return (
    <>
      <Cam t={t} d={d} z0={1} z1={1.1} x={960} y={560} x1={1040}>
        <Sky mood={mood} t={t} horizon={640} />
        <Gulls t={t} />
        <Sea mood={mood} t={t} y={620} />
        <Skyline mood={mood} t={t} x={60} y={630} w={900} s={0.85} />
        <g transform="translate(1250 628)">
          <Lighthouse />
        </g>
        <g transform="translate(1500 650)">
          <Boat t={t} s={0.6} />
        </g>
        <ParkGround t={t} y={800} mood={mood} />
        <g transform="translate(700 860) scale(0.6)">
          <SwingSet t={t} a1={Math.sin(t / 14) * 30} a2={Math.sin(t / 14 + 2) * 26} kid1={<Human kid seed={3} t={t} emo="laugh" pose={{legs: 'sitHang', armL: 160, armR: 160, elbowL: 0, elbowR: 0}} />} kid2={<Human kid seed={8} girl t={t} emo="happy" pose={{legs: 'sitHang', armL: 160, armR: 160}} />} />
        </g>
        <g transform="translate(1180 880) scale(0.62)">
          <Slide />
        </g>
        <g transform="translate(1450 900) scale(0.6)">
          <Human kid seed={12} t={t} emo="laugh" pose={{legs: 'run'}} dir={-1} />
        </g>
        <g transform="translate(1560 900) scale(0.6)">
          <Human kid seed={21} t={t} emo="happy" pose={{legs: 'run'}} dir={-1} />
        </g>
      </Cam>
      <g opacity={title} transform={`translate(0 ${(1 - title) * 16})`}>
        <text x={966} y={238} textAnchor="middle" fontFamily="Fraunces" fontWeight={900} fontSize={112} fill="#1E3A5F" opacity={0.25}>
          The Giant from the Sea
        </text>
        <text x={960} y={230} textAnchor="middle" fontFamily="Fraunces" fontWeight={900} fontSize={112} fill="#FFFFFF">
          The Giant from the Sea
        </text>
      </g>
    </>
  );
};

const Swings: React.FC<ShotProps> = ({t, d, mood}) => {
  const a1 = Math.sin(t / 13) * 34;
  const a2 = Math.sin(t / 13 + 1.8) * 30;
  return (
    <Cam t={t} d={d} z0={1.05} z1={1.12} x={960} y={560}>
      <Sky mood={mood} t={t} horizon={600} />
      <Sea mood={mood} t={t} y={560} />
      <Skyline mood={mood} t={t} x={-100} y={570} w={900} s={0.6} />
      <ParkGround t={t} y={880} mood={mood} />
      <g transform="translate(960 960) scale(1.5)">
        <SwingSet
          t={t}
          a1={a1}
          a2={a2}
          kid1={<Human kid seed={3} t={t} emo="laugh" pose={{legs: 'sitHang', armL: 165, armR: 165}} look={-0.3} />}
          kid2={<Human kid seed={8} girl t={t} emo="happy" emoTo="laugh" emoK={cl(Math.sin(t / 13 + 1.8))} pose={{legs: 'sitHang', armL: 165, armR: 165}} />}
        />
      </g>
      <g transform="translate(360 1010) scale(1.3)">
        <Human kid seed={27} t={t} emo="happy" pose={{armR: 150, elbowR: 30, armL: 20}} />
      </g>
    </Cam>
  );
};

/** A point on the slide's surface (the path drawn in Slide) and its slope angle. */
const slidePoint = (u: number) => {
  const P0 = [-100, -300], P1 = [0, -300], P2 = [40, -60], P3 = [190, -20];
  const b = (k: number) => {
    const m = 1 - u;
    return m * m * m * P0[k] + 3 * m * m * u * P1[k] + 3 * m * u * u * P2[k] + u * u * u * P3[k];
  };
  const d = (k: number) => {
    const m = 1 - u;
    return 3 * m * m * (P1[k] - P0[k]) + 6 * m * u * (P2[k] - P1[k]) + 3 * u * u * (P3[k] - P2[k]);
  };
  return {x: b(0), y: b(1), a: (Math.atan2(d(1), d(0)) * 180) / Math.PI};
};

const SlideShot: React.FC<ShotProps> = ({t, d, mood}) => {
  // 0-1.6 s climb the ladder, 1.6-2.0 s sit at the top, 2.0-3.3 s slide, then land and cheer
  const climbEnd = 1.6 * S;
  const slideStart = 2.0 * S;
  const slideEnd = 3.3 * S;
  let kid: React.ReactNode;
  if (t < climbEnd) {
    const k = cl(t / climbEnd);
    const rung = Math.floor(k * 5.5);
    const y = -Math.min(5, rung) * 55 - (k * 5.5 - rung) * 20;
    kid = (
      <g transform={`translate(-147 ${y})`}>
        <Human kid seed={12} t={t} emo="happy" pose={{legs: 'walk', armL: 150 + Math.sin(t / 3) * 20, armR: 150 - Math.sin(t / 3) * 20}} speed={1.4} />
      </g>
    );
  } else if (t < slideEnd) {
    const u = t < slideStart ? 0 : io(cl((t - slideStart) / (slideEnd - slideStart)));
    const p = slidePoint(u);
    kid = (
      <g transform={`translate(${p.x} ${p.y}) rotate(${p.a * 0.85})`}>
        <Human kid seed={12} t={t} emo={u < 0.05 ? 'happy' : 'laugh'} emoTo="cheer" emoK={u} pose={{legs: 'sitHang', armL: 160, armR: 150 + Math.sin(t / 4) * 10}} />
      </g>
    );
  } else {
    const k = e(t, slideEnd, 12);
    kid = (
      <g transform={`translate(${190 + k * 40} -20) translate(0 ${20 * k})`}>
        <Human kid seed={12} t={t} emo="cheer" pose={{legs: k < 0.5 ? 'sitHang' : 'jump', armL: 170, armR: 165}} />
      </g>
    );
  }
  return (
    <Cam t={t} d={d} z0={1.08} z1={1.0} x={900} y={560}>
      <Sky mood={mood} t={t} horizon={620} />
      <Sea mood={mood} t={t} y={600} />
      <ParkGround t={t} y={880} mood={mood} />
      <g transform="translate(860 930) scale(1.7)">
        <Slide />
        {kid}
      </g>
      <g transform="translate(1540 1000) scale(1.4)">
        <Human kid seed={21} girl t={t} emo="laugh" pose={{armL: 100 + Math.sin(t / 3) * 25, armR: 100 - Math.sin(t / 3) * 25, elbowL: 60, elbowR: 60}} dir={-1} />
      </g>
    </Cam>
  );
};

const IceCreamShot: React.FC<ShotProps> = ({t, d, mood}) => {
  const q = 2.6 * S; // the first tremor
  const wob = t > q ? Math.sin(t * 1.4) * 10 * cl((t - q) / 10) : Math.sin(t / 10) * 2;
  const sh = t > q ? shake(t, q, 8, 60) : [0, 0];
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.08} x={960} y={560} sh={sh}>
      <Sky mood={mood} t={t} horizon={700} sun={[1650, 180]} />
      <g filter="url(#blurBg)">
        <Sea mood={mood} t={t} y={640} />
        <ParkGround t={t} y={760} mood={mood} />
      </g>
      <g transform="translate(900 1300) scale(4.6)">
        <Human kid seed={8} girl t={t} emo="happy" emoTo="worried" emoK={e(t, q + 6, 14)} look={t > q + 10 ? 0.9 : 0} pose={{armR: 110, elbowR: 70, armL: 40, elbowL: 50}} hold="teddy" />
      </g>
      <g transform={`translate(${900 + 4.6 * 45} ${1300 - 4.6 * 128})`}>
        <g transform="scale(2.6)">
          <IceCream wobble={wob} />
        </g>
      </g>
    </Cam>
  );
};

const Tremor: React.FC<ShotProps> = ({t, d, mood}) => {
  const sh = [Math.sin(t * 2.7) * 7, Math.cos(t * 3.3) * 5];
  return (
    <Cam t={t} d={d} z0={1.1} z1={1.2} sh={sh}>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#E9C98E" />
      {Array.from({length: 60}, (_, i) => (
        <circle key={i} cx={random(`sa${i}`) * 1920} cy={random(`sb${i}`) * 1080} r={3 + random(`sc${i}`) * 5} fill="#D2AE70" />
      ))}
      {/* a puddle with ripples */}
      <ellipse cx={760} cy={640} rx={380} ry={150} fill="#7FB8D8" />
      <ellipse cx={760} cy={640} rx={380} ry={150} fill="none" stroke="#5E9CC0" strokeWidth={8} />
      {[0, 1, 2, 3].map((k) => {
        const u = ((t * 1.3 + k * 12) % 48) / 48;
        return <ellipse key={k} cx={760} cy={640} rx={40 + u * 330} ry={16 + u * 130} fill="none" stroke="#FFFFFF" strokeWidth={6 * (1 - u) + 1} opacity={0.8 * (1 - u)} />;
      })}
      {/* hopping pebbles */}
      {Array.from({length: 9}, (_, i) => {
        const hop = Math.abs(Math.sin(t * 0.8 + i * 1.3)) * 22;
        return <ellipse key={i} cx={1150 + (i % 3) * 110 + random(`pb${i}`) * 60} cy={820 + Math.floor(i / 3) * 60 - hop} rx={18} ry={12} fill="#8C8F99" />;
      })}
      {/* a swing seat rattling on its chains */}
      <g transform={`translate(1500 0) rotate(${Math.sin(t * 1.9) * 5})`}>
        <path d="M-60 -20 L-60 560 M60 -20 L60 560" stroke="#6B7686" strokeWidth={8} strokeDasharray="14 8" />
        <rect x={-80} y={556} width={160} height={24} rx={10} fill="#FFC928" />
      </g>
      <Tint mood={mood} />
    </Cam>
  );
};

const Look: React.FC<ShotProps> = ({t, d, mood}) => {
  const k = e(t, 8, 18);
  const k2 = e(t, 2.2 * S, 14);
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.07}>
      <Sky mood={mood} t={t} horizon={1080} sun={[1700, 150]} />
      <rect x={-200} y={760} width={2400} height={500} fill="#5E9A5E" opacity={0.6} filter="url(#blurBg)" />
      {[
        [470, 3, false],
        [960, 8, true],
        [1450, 12, false],
      ].map(([x, seed, girl], i) => (
        <g key={i} transform={`translate(${x as number} ${1300 + (i === 1 ? 40 : 0)}) scale(${i === 1 ? 5 : 4.4})`}>
          <Human kid seed={seed as number} girl={girl as boolean} t={t + i * 7} emo="neutral" emoTo={k2 > 0.5 ? 'scared' : 'worried'} emoK={k2 > 0.5 ? k2 : k} look={lerp(0, 1, e(t, 4 + i * 4, 12))} lookY={-0.2} pose={{armL: 10, armR: i === 1 ? 60 : 5, elbowR: 50}} hold={i === 1 ? 'teddy' : 'none'} />
        </g>
      ))}
      <Tint mood={mood} />
    </Cam>
  );
};

const Bulge: React.FC<ShotProps> = ({t, d, mood}) => {
  const rise = e(t, 10, 110);
  const sh = shake(t, 0, 4, d * S);
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.12} x={1000} y={520} sh={sh}>
      <Sky mood={mood} t={t} horizon={560} />
      <Gulls t={t} flee n={10} y={260} />
      <Sea mood={mood} t={t} y={520} chop={1 + rise * 2} />
      {/* the dome of water swelling up out of the sea */}
      <g transform="translate(1180 524)">
        <path d={`M${-260 - rise * 220} 0 Q ${-120 - rise * 120} ${-40 - rise * 330} 0 ${-50 - rise * 360} Q ${120 + rise * 120} ${-40 - rise * 330} ${260 + rise * 220} 0 Z`} fill="#4E7890" />
        <path d={`M${-150 - rise * 120} 0 Q ${-60 - rise * 60} ${-30 - rise * 250} 0 ${-40 - rise * 290} Q ${40} ${-30 - rise * 200} ${60 + rise * 40} 0 Z`} fill="#7FB0C8" opacity={0.7} />
        {rise > 0.55 && <path d={`M-60 ${-rise * 300} l 40 -70 l 30 60 l 40 -90 l 30 80 Z`} fill="#CFE6EA" opacity={(rise - 0.55) * 2.2} />}
        {Array.from({length: 18}, (_, i) => {
          const x = -280 - rise * 220 + (i / 17) * (560 + rise * 440);
          const f = Math.sin(t / 3 + i * 1.7) * 10;
          return <circle key={i} cx={x} cy={-6 + f * 0.3} r={16 + rise * 18 + f * 0.4} fill="#FFFFFF" opacity={0.85} />;
        })}
        {Array.from({length: 12}, (_, i) => {
          const u = ((t * 1.2 + i * 9) % 40) / 40;
          return <circle key={`s${i}`} cx={(i - 6) * 40 * (1 + rise)} cy={-rise * 330 - u * 120} r={8 + u * 10} fill="#E8FAFF" opacity={(1 - u) * rise} />;
        })}
      </g>
      <g transform={`translate(640 ${560 + Math.sin(t / 5) * 10})`}>
        <Boat t={t * 2} rock={3} s={0.5} />
      </g>
      {/* the kids from behind, in silhouette */}
      {[
        [300, 1.2],
        [560, 1.35],
      ].map(([x, s], i) => (
        <g key={i} transform={`translate(${x} 1130) scale(${s})`} fill="#1E2A44">
          <circle cx={0} cy={-300} r={80} fill="#2B1D14" />
          <rect x={-90} y={-230} width={180} height={260} rx={70} fill={i ? '#3A5BA8' : '#C84A3A'} />
        </g>
      ))}
      <Tint mood={mood} />
    </Cam>
  );
};

/* ================================================================== ACT 2: it rises */
const Emerge: React.FC<ShotProps> = ({t, d, mood}) => {
  const rise = e(t, 10, 130);
  const sh = shake(t, 12, 16, 80);
  const y = 1060 + (1 - rise) * 900;
  return (
    <Cam t={t} d={d} z0={0.95} z1={1.05} x={960} y={600} y1={520} sh={sh}>
      <Sky mood={mood} t={t} horizon={820} />
      <Sea mood={mood} t={t} y={800} chop={3} />
      <g transform={`translate(1060 ${y}) scale(0.72)`}>
        <Monster t={t} wet={1} charge={0.25 + 0.1 * Math.sin(t / 8)} jaw={e(t, 150, 20) * 0.3} />
      </g>
      {/* water around its waist */}
      <rect x={-200} y={800} width={2400} height={600} fill="#2E4756" opacity={0.92} />
      {Array.from({length: 12}, (_, i) => {
        const x = 700 + i * 70;
        const f = Math.sin(t / 5 + i) * 14;
        return <ellipse key={i} cx={x} cy={806 + f * 0.3} rx={60} ry={16} fill="#FFFFFF" opacity={0.7} />;
      })}
      <Splash t={t} t0={12} x={1040} y={810} s={1.3} life={70} />
      <Splash t={t} t0={40} x={1300} y={810} s={0.8} life={60} />
      <Tint mood={mood} />
    </Cam>
  );
};

const Roar: React.FC<ShotProps> = ({t, d, mood}) => {
  const jaw = e(t, 12, 12) * (1 - e(t, 100, 16));
  const sh = shake(t, 16, 18, 70);
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.12} x={960} y={540} sh={sh}>
      <Sky mood={mood} t={t} clouds />
      {Array.from({length: 40}, (_, i) => {
        const x = (random(`rn${i}`) * 2200 + t * 4) % 2200;
        const y = (random(`ry${i}`) * 1200 + t * 38) % 1200 - 80;
        return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 40} stroke="#DDE6EE" strokeWidth={3} opacity={0.5} />;
      })}
      <g transform="translate(1500 2050) scale(1.75)">
        <Monster t={t} jaw={jaw} charge={0.2} wet={0.6} />
      </g>
      {/* hot breath mist */}
      {jaw > 0.3 &&
        Array.from({length: 10}, (_, i) => {
          const u = ((t * 1.1 + i * 9) % 40) / 40;
          return <circle key={i} cx={700 - u * 700} cy={520 + (i % 3) * 30 + u * 40} r={30 + u * 90} fill="#E6EEF2" opacity={0.35 * (1 - u) * jaw} />;
        })}
      <Tint mood={mood} />
    </Cam>
  );
};

const Scream: React.FC<ShotProps> = ({t, d, mood}) => {
  const momIn = e(t, 2.0 * S, 40);
  const drop = cl((t - 1.1 * S) / 30);
  return (
    <Cam t={t} d={d} z0={1.08} z1={1.0} sh={[Math.sin(t * 2.3) * 3, Math.cos(t * 2.9) * 2]}>
      <Sky mood={mood} t={t} horizon={640} />
      <Sea mood={mood} t={t} y={600} chop={3} />
      <g transform="translate(1600 700) scale(0.3)">
        <Monster t={t} jaw={0.4} wet={1} />
      </g>
      <rect x={-200} y={604} width={2400} height={220} fill="#3F5160" />
      <ParkGround t={t} y={860} mood={mood} />
      <g transform="translate(560 1040) scale(2)">
        <Human kid seed={3} t={t} emo="scream" pose={{armL: 150, armR: 150, elbowL: 100, elbowR: 100}} look={0.8} />
      </g>
      <g transform="translate(1020 1060) scale(2.2)">
        <Human kid seed={8} girl t={t} emo="scared" emoTo="cry" emoK={e(t, 30, 10)} pose={{armL: 20, armR: 30 + drop * 40}} hold="teddy" />
      </g>
      {/* the dropped ice cream */}
      <g transform={`translate(${1090 + drop * 40} ${780 + drop * drop * 260}) rotate(${drop * 160}) scale(1.8)`} opacity={1}>
        <IceCream />
      </g>
      {drop >= 1 && <ellipse cx={1150} cy={1052} rx={60} ry={14} fill="#FF9EC4" />}
      <g transform="translate(1400 1040) scale(2)">
        <Human kid seed={12} t={t} emo="scream" pose={{legs: 'run'}} dir={-1} speed={1.3} />
      </g>
      {/* mum running in */}
      <g transform={`translate(${lerp(-300, 760, momIn)} 1070) scale(2.1)`}>
        <Human seed={40} girl t={t} emo="scared" pose={{legs: momIn < 1 ? 'run' : 'stand', armL: 100, armR: 90, elbowL: 20, elbowR: 20}} />
      </g>
      <Tint mood={mood} />
    </Cam>
  );
};

const Wade: React.FC<ShotProps> = ({t, d, mood}) => {
  const x = lerp(1500, 1180, t / (d * S));
  const surge = ((t * 1.2) % 60) / 60;
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.04} x={1000} x1={900} y={540}>
      <Sky mood={mood} t={t} horizon={700} />
      <Skyline mood={mood} t={t} x={-120} y={700} w={880} s={1.1} />
      <Sea mood={mood} t={t} y={700} chop={3} />
      <g transform={`translate(${x} 900) scale(0.6)`}>
        <Monster t={t} walk={1} wet={0.8} charge={0.2} />
      </g>
      <rect x={-200} y={880} width={2400} height={400} fill="#3E3444" opacity={0.85} />
      {/* a wave rolling toward the harbour */}
      <path d={`M${x - 600 - surge * 300} 900 q 120 -${90 + surge * 40} 260 -10 q 60 40 140 10 L ${x - 60} 910 Z`} fill="#CFF1FF" opacity={0.85} />
      <Splash t={t} t0={(Math.floor(t / 42) * 42)} x={x - 40} y={890} s={0.45} life={40} />
      {[
        [520, 0],
        [820, 1],
      ].map(([bx, i]) => (
        <g key={i} transform={`translate(${bx - surge * 30} ${880 - Math.sin(t / 5 + i) * 30}) rotate(${Math.sin(t / 6 + i) * 25})`}>
          <Boat t={t} rock={4} s={0.8} c={i ? '#3A86E8' : '#E8403A'} />
        </g>
      ))}
      <Tint mood={mood} />
    </Cam>
  );
};

/* ================================================================== ACT 3: panic */
const crowd = (t: number, n: number, y: number, seed: number, emo: 'scream' | 'scared' = 'scream', speed = 1) =>
  Array.from({length: n}, (_, i) => {
    const r = random(`cw${seed}${i}`);
    const x = ((2600 - ((t * (7 + r * 4) * speed + i * 230) % 2600)) % 2600) - 300;
    const yy = y + (i % 3) * 40;
    return (
      <g key={i} transform={`translate(${x} ${yy}) scale(${1.15 + (i % 3) * 0.12})`}>
        <Human seed={seed * 100 + i} kid={i % 5 === 2} t={t + i * 3} emo={emo} pose={{legs: 'run', armL: i % 4 === 0 ? 160 : undefined, elbowL: 40}} speed={1.3} dir={-1} />
      </g>
    );
  });

const Panic: React.FC<ShotProps> = ({t, d, mood}) => {
  const siren = Math.floor(t / 6) % 2;
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.06} x={960} y={540}>
      <Sky mood={mood} t={t} horizon={700} />
      {/* the beast's head above the rooftops */}
      <Skyline mood={mood} t={t} x={1250} y={720} w={900} s={0.9} fire={1} broken={[2, 6]} />
      <g transform="translate(1680 1060) scale(0.8)">
        <Monster t={t} jaw={0.25 + 0.25 * Math.sin(t / 12)} charge={0.3} />
      </g>
      <StreetRow t={t} y={720} mood={mood} seed={2} n={6} />
      <Road y={720} t={t} />
      {[
        [300, '#FFC928', 1],
        [760, '#3A86E8', -1],
        [1250, '#FFFFFF', 1],
      ].map(([x, c, dr], i) => (
        <g key={i} transform={`translate(${x as number} 850) scale(2.4)`}>
          <Car color={c as string} t={0} dir={dr as 1 | -1} />
        </g>
      ))}
      {/* police car with flashing lights */}
      <g transform={`translate(${lerp(2300, 1600, e(t, 20, 60))} 930) scale(2.4)`}>
        <Car color="#FFFFFF" t={t} dir={-1} />
        <rect x={-30} y={-84} width={28} height={14} rx={4} fill={siren ? '#E8403A' : '#6B1F1F'} />
        <rect x={2} y={-84} width={28} height={14} rx={4} fill={siren ? '#2C2C8C' : '#3A86E8'} />
        <circle cx={-16} cy={-78} r={40} fill={siren ? '#E8403A' : '#3A86E8'} opacity={0.3} />
      </g>
      {crowd(t, 14, 1000, 1)}
      <Tint mood={mood} />
    </Cam>
  );
};

const Crash: React.FC<ShotProps> = ({t, d, mood}) => {
  const hit = 1.2 * S;
  const k = cl(t / hit);
  const carX = t < hit ? lerp(2200, 1060, io(k)) : 1060 + Math.min(30, (t - hit) * 2);
  const spin = t < hit ? k * k * -24 : -24 - Math.min(10, (t - hit) * 0.6);
  const sh = shake(t, hit, 20, 30);
  const crumple = t > hit ? 1 : 0;
  return (
    <Cam t={t} d={d} z0={1.12} z1={1.18} x={900} y={620} sh={sh}>
      <Sky mood={mood} t={t} horizon={660} />
      <StreetRow t={t} y={660} mood={mood} seed={4} />
      <Road y={660} t={t} />
      <g transform="translate(700 900) scale(2.5)">
        <Car color="#3A86E8" t={0} dir={1} kind="van" />
        {crumple > 0 && <path d="M60 -70 l 20 30 l -14 10 l 18 26" stroke="#1E2A44" strokeWidth={4} fill="none" />}
      </g>
      <g transform={`translate(${carX + 60} 930) rotate(${spin}) scale(2.5)`}>
        <Car color="#E8403A" t={t} dir={-1} kind="sport" />
        {crumple > 0 && <path d="M-80 -30 l -10 -20 l 16 -6" stroke="#1E2A44" strokeWidth={4} fill="none" />}
      </g>
      {t < hit && [0, 1, 2].map((i) => <path key={i} d={`M${carX + 120 + i * 20} ${1000 + i * 8} l 160 0`} stroke="#2B2B2B" strokeWidth={8} opacity={0.5} />)}
      <Sparks t={t} t0={hit} x={930} y={860} n={40} life={26} />
      <Debris t={t} t0={hit} x={930} y={850} n={30} spread={600} up={14} cols={['#BFEFFF', '#FFFFFF', '#9FD8FF']} size={16} g={1.2} seed={5} />
      <Dust t={t} t0={hit + 4} x={930} y={880} r={70} col="#8E8E96" life={60} />
      <Smoke t={t} x={1000} y={850} s={0.9} n={6} col="#5A5A60" />
      <g transform={`translate(${lerp(1250, 1500, e(t, hit - 6, 20))} 1030) scale(1.4)`}>
        <Human seed={71} t={t} emo={t > hit ? 'scream' : 'shock'} pose={{legs: t > hit - 6 ? 'run' : 'stand', armL: 150, armR: 140}} />
      </g>
      <g transform="translate(420 1040) scale(1.35)">
        <Human seed={73} girl t={t} emo={t > hit ? 'scream' : 'scared'} pose={{armL: 150, armR: 150, elbowL: 110, elbowR: 110}} look={1} />
      </g>
      <Tint mood={mood} />
    </Cam>
  );
};

const MomRun: React.FC<ShotProps> = ({t, d, mood}) => {
  const scroll = t * 9;
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.03}>
      <Sky mood={mood} t={t} horizon={640} />
      <g transform={`translate(${(scroll * 0.4) % 500} 0)`}>
        <StreetRow t={t} y={640} mood={mood} seed={6} x0={-700} n={12} />
      </g>
      <g transform={`translate(${scroll % 150} 0)`}>
        <Road y={640} t={t} />
      </g>
      <g transform={`translate(${(scroll * 1.6) % 2600 - 600} 0)`}>{crowd(t, 5, 1000, 3, 'scared', 0.2)}</g>
      {/* mum carrying the crying girl */}
      <g transform="translate(900 1060) scale(2.4)">
        <Human seed={40} girl t={t} emo="scared" pose={{legs: 'run', armL: 95, armR: 85, elbowL: 70, elbowR: 70}} dir={-1} speed={1.2} />
        <g transform={`translate(-26 ${-150 + Math.abs(Math.sin(t * 0.5)) * 6}) scale(0.62)`}>
          <Human kid seed={8} girl t={t} emo="cry" pose={{legs: 'sitHang', armL: 150 + Math.sin(t / 3) * 20, armR: 60}} dir={1} hold="teddy" />
        </g>
      </g>
      <Tint mood={mood} />
    </Cam>
  );
};

const ShadowShot: React.FC<ShotProps> = ({t, d, mood}) => {
  const dark = e(t, 0, 50);
  const land = 2.5 * S;
  // the sole comes down onto the far lane of the road (y 900) and stays planted
  const footY = t < land ? lerp(-1100, 900, Math.pow(cl((t - 30) / (land - 30)), 2.2)) : 900;
  const sh = shake(t, land, 30, 45);
  const jump = t > land ? Math.max(0, Math.sin(cl((t - land) / 16) * Math.PI)) * 50 : 0;
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.06} sh={sh}>
      <Sky mood={mood} t={t} horizon={700} />
      <StreetRow t={t} y={700} mood={mood} seed={8} />
      <Road y={700} t={t} />
      {[
        [240, '#FFC928'],
        [640, '#7D6BE0'],
      ].map(([x, c], i) => (
        <g key={i} transform={`translate(${x} ${880 - jump * (i ? 0.7 : 1)}) rotate(${jump * (i ? -0.2 : 0.15)}) scale(2.3)`}>
          <Car color={c as string} t={0} />
        </g>
      ))}
      {[
        [380, 81, false],
        [560, 82, true],
        [840, 83, false],
      ].map(([x, seed, kid], i) => (
        <g key={i} transform={`translate(${x as number} 1030) scale(${kid ? 1.5 : 1.3})`}>
          <Human seed={seed as number} kid={kid as boolean} t={t} emo="shock" emoTo="scream" emoK={e(t, land, 6)} lookY={-1} look={0.6} pose={{armL: t > land ? 160 : 30, armR: i === 1 ? 120 : 20, elbowR: 30}} dir={1} />
        </g>
      ))}
      {/* the shadow sweeps over the street */}
      <rect x={-200} y={-200} width={2400} height={1600} fill="#0B0E1A" opacity={dark * 0.45} />
      {/* the foot comes down: a scaly leg, a heel and three clawed toes; its sole is at footY */}
      <g transform={`translate(1450 ${footY}) scale(1.35)`}>
        <ellipse cx={0} cy={4} rx={260 * cl((t - land + 20) / 20)} ry={26} fill="#000" opacity={0.3} />
        <path d="M-170 -1400 L 170 -1400 L 190 -260 Q 190 -150 120 -130 L -130 -130 Q -190 -150 -180 -260 Z" fill={MC.skin} />
        <path d="M60 -1400 L 170 -1400 L 190 -260 Q 190 -150 120 -130 L 60 -130 Z" fill={MC.skin2} />
        {Array.from({length: 14}, (_, i) => (
          <ellipse key={i} cx={-120 + ((i * 67) % 240)} cy={-1300 + ((i * 131) % 1100)} rx={16} ry={10} fill={MC.skin2} opacity={0.7} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M-150 ${-420 - i * 70} q 150 30 300 0`} stroke={MC.skin2} strokeWidth={10} fill="none" strokeLinecap="round" />
        ))}
        {/* heel and toes resting on the road */}
        <path d="M-250 0 Q -262 -120 -170 -150 L 170 -150 Q 250 -130 240 0 Z" fill={MC.skin} />
        <path d="M-250 0 Q -262 -60 -220 -80 L 230 -80 Q 246 -40 240 0 Z" fill={MC.skin2} />
        {[-190, -60, 70].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={-40} rx={62} ry={44} fill={MC.skin} />
            <path d={`M${x - 70} -6 q -30 4 -44 26 q 26 -2 50 -4 Z`} fill={MC.teeth} />
          </g>
        ))}
      </g>
      {t > land && <path d="M1100 910 l 80 30 l -40 50 l 90 40 M1800 910 l -60 40 l 50 40 M1450 915 l 20 60 l -30 50" stroke="#1E2A44" strokeWidth={10} fill="none" />}
      <Dust t={t} t0={land} x={1060} y={905} r={80} col="#8E8174" life={60} spread={0.6} />
      <Dust t={t} t0={land} x={1840} y={905} r={80} col="#8E8174" life={60} spread={0.6} />
      <Debris t={t} t0={land} x={1450} y={890} n={30} spread={900} up={20} seed={9} />
      <Shockwave t={t} t0={land} x={1450} y={905} r={1400} life={26} />
      <Tint mood={mood} />
    </Cam>
  );
};

/* ================================================================== ACT 4: destruction */
const Smash: React.FC<ShotProps> = ({t, d, mood}) => {
  const hit = 1.2 * S;
  const tail = t < hit ? -e(t, 10, 26) * 40 : -40 + e(t, hit + 10, 40) * 40;
  const col = cl((t - hit) / 90);
  const sh = shake(t, hit, 14, 40);
  return (
    <Cam t={t} d={d} z0={0.92} z1={0.98} x={960} y={500} sh={sh}>
      <Sky mood={mood} t={t} horizon={900} />
      <Skyline mood={mood} t={t} x={-200} y={900} w={2400} s={1.2} fire={1} broken={[3, 8, 20]} />
      <g transform="translate(900 1020) scale(0.72)">
        <Monster t={t} tail={tail} jaw={e(t, 4.3 * S, 10) * 0.9} walk={0} charge={0.2} />
      </g>
      <g transform="translate(1640 1000)">
        <Collapse w={240} h={720} k={col} c1="#7FB2F0" c2="#5B8FD0" dir={1} seed={2} />
      </g>
      <g transform="translate(300 1000)">
        <Collapse w={220} h={560} k={0} c1="#FFD166" c2="#E8B640" />
      </g>
      <Debris t={t} t0={hit} x={1600} y={500} n={40} spread={900} up={16} seed={11} size={40} />
      <Dust t={t} t0={hit + 20} x={1700} y={960} r={200} col="#8E8174" life={100} />
      <Smoke t={t} x={1650} y={700} s={2} n={6} />
      <rect x={-200} y={990} width={2400} height={400} fill="#3E3444" />
      <Tint mood={mood} />
    </Cam>
  );
};

const DebrisShot: React.FC<ShotProps> = ({t, d, mood}) => (
  <Cam t={t} d={d} z0={1.05} z1={1.1} sh={[Math.sin(t * 2.1) * 4, Math.cos(t * 2.6) * 3]}>
    <Sky mood={mood} t={t} horizon={660} />
    <StreetRow t={t} y={660} mood={mood} seed={10} />
    <Road y={660} t={t} />
    <Debris t={t} t0={0} x={900} y={-300} n={40} spread={2600} up={0} seed={21} size={70} g={0.7} />
    <Debris t={t} t0={20} x={1200} y={-300} n={30} spread={2200} up={0} seed={22} size={50} g={0.75} />
    {/* a slab slams down */}
    <g transform={`translate(1200 ${Math.min(900, -400 + Math.pow(Math.max(0, t - 18), 2) * 0.9)}) rotate(12)`}>
      <rect x={-220} y={-60} width={440} height={120} fill="#8C8F99" />
      <rect x={-200} y={-40} width={120} height={40} fill="#9FD8FF" />
    </g>
    <Dust t={t} t0={50} x={1200} y={940} r={170} col="#9A8E82" life={60} />
    {crowd(t, 10, 1000, 5)}
    <Tint mood={mood} />
  </Cam>
);

const Breath: React.FC<ShotProps> = ({t, d, mood}) => {
  const charge = e(t, 0, 60);
  const fire = 2.0 * S;
  const k = cl((t - fire) / 10);
  const boom = 2.8 * S;
  const sh = shake(t, boom, 22, 40);
  const mouth: [number, number] = [1300 + -380 * 0.75, 1000 - 870 * 0.75];
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.05} sh={sh}>
      <Sky mood={mood} t={t} horizon={1000} />
      <Skyline mood={mood} t={t} x={-100} y={1000} w={2200} s={1.1} fire={1} broken={[2, 14]} />
      <g transform="translate(260 1000)">
        <Collapse w={240} h={640} k={t > boom ? cl((t - boom) / 70) * 0.7 : 0} c1="#FF8A6A" c2="#E0674A" dir={-1} seed={4} />
      </g>
      <g transform="translate(1300 1000) scale(0.75)">
        <Monster t={t} charge={charge} jaw={e(t, fire - 10, 10)} />
      </g>
      {t >= fire && t < boom + 40 && <Beam t={t} x1={mouth[0]} y1={mouth[1]} x2={300} y2={420} col={MC.glow} w={46} k={k} />}
      {t > boom && (
        <g>
          <circle cx={300} cy={420} r={80 + (t - boom) * 8} fill="#FFFFFF" opacity={Math.max(0, 1 - (t - boom) / 20)} />
          <g transform="translate(300 440)">
            <Fire t={t} s={2.4} />
          </g>
          <Smoke t={t} x={300} y={420} s={2.2} n={7} />
        </g>
      )}
      <Debris t={t} t0={boom} x={300} y={420} n={40} spread={1000} up={18} seed={31} size={34} />
      <rect x={-200} y={-200} width={2400} height={1600} fill={MC.glow} opacity={charge * 0.08 + (t > boom && t < boom + 8 ? 0.4 : 0)} />
      <Tint mood={mood} />
    </Cam>
  );
};

const Hide: React.FC<ShotProps> = ({t, d, mood}) => {
  const star = e(t, 3.3 * S, 20);
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.08} x={900} y={560}>
      <Sky mood={mood} t={t} horizon={640} sun={[-400, -400]} />
      {star > 0 && (
        <g transform="translate(1500 180)">
          <circle r={90 * star} fill="#FFF6C8" opacity={0.25} />
          <path d={`M0 ${-70 * star} L ${10 * star} 0 L 0 ${70 * star} L ${-10 * star} 0 Z`} fill="#FFFFFF" transform={`rotate(${t * 2})`} />
          <path d={`M${-70 * star} 0 L 0 ${10 * star} L ${70 * star} 0 L 0 ${-10 * star} Z`} fill="#FFFFFF" transform={`rotate(${t * 2})`} />
          <circle r={14 * star} fill="#FFFFFF" />
        </g>
      )}
      <Sea mood={mood} t={t} y={600} />
      <Skyline mood={mood} t={t} x={100} y={610} w={1300} s={0.7} fire={1} broken={[2, 5, 9, 13]} />
      <ParkGround t={t} y={820} mood={mood} />
      <g transform="translate(560 1000) scale(2.1)">
        <Slide />
      </g>
      {/* huddled together on the grass beside the slide */}
      <g transform="translate(900 950) scale(2)">
        <Human seed={40} girl t={t} emo="worried" pose={{legs: 'sit', armL: 80, armR: 75, elbowL: 50, elbowR: 60}} />
      </g>
      <g transform="translate(1080 970) scale(2)">
        <Human kid seed={8} girl t={t} emo="cry" emoTo="hopeful" emoK={e(t, 3.5 * S, 16)} lookY={t > 3.4 * S ? -1 : 0} look={t > 3.4 * S ? 0.8 : 0} pose={{legs: 'sit', armL: 60, armR: 50}} hold="teddy" />
      </g>
      <g transform="translate(1250 970) scale(2)">
        <Human kid seed={3} t={t} emo="scared" emoTo="shock" emoK={e(t, 3.6 * S, 10)} lookY={t > 3.5 * S ? -1 : 0} pose={{legs: 'sit', armL: 70, armR: 70, elbowL: 50}} />
      </g>
      <Tint mood={mood} />
    </Cam>
  );
};

/* ================================================================== ACT 5: the hero */
const Arrival: React.FC<ShotProps> = ({t, d, mood}) => {
  const land = 2.9 * S;
  const fall = cl(t / land);
  const bx = lerp(1700, 900, io(fall));
  const by = lerp(-200, 900, Math.pow(fall, 1.8));
  const rise = e(t, land + 12, 40);
  const sh = shake(t, land, 30, 50);
  return (
    <Cam t={t} d={d} z0={0.95} z1={1.05} x={960} y={560} sh={sh}>
      <Sky mood={mood} t={t} horizon={1000} />
      <Skyline mood={mood} t={t} x={-200} y={1000} w={2400} s={1.15} fire={1} broken={[4, 11, 19]} />
      <g transform="translate(1720 1010) scale(0.45)">
        <Monster t={t} jaw={t > land ? 0.3 : 0.1} charge={0.1} />
      </g>
      {t < land && (
        <g>
          <line x1={bx + 400} y1={by - 600} x2={bx} y2={by} stroke={HC.crystal} strokeWidth={70} strokeLinecap="round" opacity={0.3} />
          <line x1={bx + 200} y1={by - 300} x2={bx} y2={by} stroke="#FFFFFF" strokeWidth={30} strokeLinecap="round" opacity={0.8} />
          <circle cx={bx} cy={by} r={90} fill="#FFFFFF" />
          <circle cx={bx} cy={by} r={180} fill={HC.crystal} opacity={0.35} />
        </g>
      )}
      {t >= land && (
        <g transform="translate(900 1010) scale(0.66)">
          <Hero t={t} turn={0.85} crouch={1 - rise} armL={lerp(40, 70, rise)} armR={lerp(-20, 80, rise)} elbowL={lerp(10, 80, rise)} elbowR={lerp(10, 100, rise)} glow={lerp(0.4, 1, rise)} legA={lerp(30, 14, rise)} legB={lerp(-30, -14, rise)} />
        </g>
      )}
      <Shockwave t={t} t0={land} x={900} y={1000} r={1800} life={30} col={HC.crystal} />
      <Dust t={t} t0={land} x={900} y={990} r={220} col="#A89A8C" life={90} />
      <Debris t={t} t0={land} x={900} y={980} n={40} spread={1600} up={22} seed={41} size={30} />
      {t > land && t < land + 10 && <rect x={-200} y={-200} width={2400} height={1600} fill="#FFFFFF" opacity={1 - (t - land) / 10} />}
      <rect x={-200} y={1000} width={2400} height={400} fill="#243A66" />
      <Tint mood={mood} />
    </Cam>
  );
};

const HeroFace: React.FC<ShotProps> = ({t, d, mood}) => {
  const g = e(t, 18, 12);
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.1} x={960} y={540}>
      <Sky mood={mood} t={t} clouds={false} sun={[-500, -500]} />
      <Smoke t={t} x={200} y={1100} s={3} n={6} col="#3B3450" />
      <Smoke t={t + 30} x={1600} y={1100} s={3} n={6} col="#3B3450" />
      <g transform="translate(960 3100) scale(2.9)">
        <Hero t={t} glow={0.2 + g * 0.8} armL={20} armR={20} />
      </g>
      {/* lens flare off the eyes */}
      {g > 0 &&
        [-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${960 + sd * 110} ${3100 - 2.9 * 968})`} opacity={g * (0.7 + 0.3 * Math.sin(t / 3))}>
            <ellipse rx={400 * g} ry={8} fill="#FFFFFF" />
            <circle r={60} fill="#FFFFFF" opacity={0.4} />
          </g>
        ))}
      <Tint mood={mood} />
    </Cam>
  );
};

const Cheer: React.FC<ShotProps> = ({t, d, mood}) => {
  const k = e(t, 1.0 * S, 10);
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.05}>
      <Sky mood={mood} t={t} horizon={1080} sun={[1500, 200]} />
      {[
        [460, 3, false],
        [960, 8, true],
        [1460, 12, false],
      ].map(([x, seed, girl], i) => (
        <g key={i} transform={`translate(${x as number} ${1380 - k * 60}) scale(${i === 1 ? 4.2 : 3.8})`}>
          <Human kid seed={seed as number} girl={girl as boolean} t={t + i * 5} emo={i === 1 ? 'cry' : 'shock'} emoTo={i === 1 ? 'happy' : 'cheer'} emoK={k} lookY={-0.6} pose={{armL: lerp(20, 170, k), armR: lerp(20, 165, k), elbowL: 10, elbowR: 10, legs: k > 0.5 ? 'jump' : 'stand'}} hold={i === 1 ? 'teddy' : 'none'} />
        </g>
      ))}
      <Tint mood={mood} />
    </Cam>
  );
};

/* ================================================================== ACT 6: the fight */
const Arena: React.FC<{t: number; mood: number; fire?: boolean}> = ({t, mood}) => (
  <>
    <Sky mood={mood} t={t} horizon={1010} />
    <Skyline mood={mood} t={t} x={-200} y={1010} w={2400} s={1.1} fire={1} broken={[3, 9, 16, 22]} />
    <rect x={-400} y={1000} width={2800} height={500} fill="#2A3558" />
    {Array.from({length: 8}, (_, i) => {
      const u = ((t * 0.8 + i * 40) % 320) / 320;
      return <circle key={i} cx={-200 + u * 2400} cy={900 + Math.sin(i + t / 30) * 60} r={120} fill="#B9AFC8" opacity={0.12} />;
    })}
  </>
);

const FaceOff: React.FC<ShotProps> = ({t, d, mood}) => (
  <Cam t={t} d={d} z0={0.95} z1={1.04} sh={shake(t, 1.8 * S, 8, 50)}>
    <Arena t={t} mood={mood} />
    <g transform="translate(560 1010) scale(0.62)">
      <Hero t={t} turn={0.85} armL={70} armR={80} elbowL={80} elbowR={100} legA={16} legB={-16} crouch={0.15} />
    </g>
    <g transform="translate(1420 1010) scale(0.62)">
      <Monster t={t} jaw={e(t, 1.8 * S, 10) * (1 - e(t, 3.6 * S, 12))} charge={0.3} arms={0.5} />
    </g>
    <Tint mood={mood} />
  </Cam>
);

const Clash: React.FC<ShotProps> = ({t, d, mood}) => {
  const meet = 1.8 * S;
  const k = io(cl(t / meet));
  const hx = lerp(520, 800, k);
  const mx = lerp(1460, 1180, k);
  const p1 = e(t, meet - 8, 8) * (1 - e(t, meet + 14, 10));
  const hit2 = 3.2 * S;
  const p2 = e(t, hit2 - 8, 8) * (1 - e(t, hit2 + 14, 10));
  const recoil = e(t, meet, 10) * (1 - e(t, meet + 30, 20)) + e(t, hit2, 10);
  const sh = [shake(t, meet, 26, 30), shake(t, hit2, 26, 30)].reduce((a, b) => [a[0] + b[0], a[1] + b[1]]);
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.1} x={1000} y={640} sh={sh}>
      <Arena t={t} mood={mood} />
      <g transform={`translate(${hx} 1010) scale(0.7)`}>
        <Hero t={t} turn={0.85} armR={lerp(60, 92, Math.max(p1, p2))} elbowR={lerp(100, 0, Math.max(p1, p2))} armL={70} elbowL={90} legA={k < 1 ? 20 + Math.sin(t * 0.3) * 14 : 18} legB={k < 1 ? -20 - Math.sin(t * 0.3) * 14 : -18} crouch={0.1} />
      </g>
      <g transform={`translate(${mx + recoil * 90} 1010) scale(0.7)`}>
        <Monster t={t} walk={k < 1 ? 1 : 0} hurt={recoil} jaw={recoil * 0.8} arms={0.6} />
      </g>
      {[meet, hit2].map((h, i) => (
        <g key={i}>
          <Sparks t={t} t0={h} x={1000} y={400} n={36} col="#FFFFFF" life={20} seed={50 + i} />
          <Shockwave t={t} t0={h} x={1000} y={400} r={500} life={16} />
          {t > h && t < h + 5 && <circle cx={1000} cy={400} r={200} fill="#FFFFFF" opacity={1 - (t - h) / 5} />}
        </g>
      ))}
      <Tint mood={mood} />
    </Cam>
  );
};

const TailShot: React.FC<ShotProps> = ({t, d, mood}) => {
  const swipe = e(t, 6, 22);
  const jump = cl((t - 16) / 56);
  const hx = lerp(700, 360, jump);
  const hy = 1010 - Math.sin(jump * Math.PI) * 360;
  const land = 2.4 * S;
  return (
    <Cam t={t} d={d} z0={1.0} z1={1.04} sh={shake(t, land, 20, 40)}>
      <Arena t={t} mood={mood} />
      <g transform={`translate(1250 1010) scale(0.7) scale(-1 1)`}>
        <Monster t={t} tail={-swipe * 55 + e(t, 40, 30) * 55} jaw={0.4} charge={0.3} />
      </g>
      <g transform={`translate(${hx} ${hy}) scale(0.62) rotate(${jump < 1 ? -jump * 360 : 0} 0 -500)`}>
        <Hero t={t} turn={0.85} crouch={jump >= 1 ? 1 - e(t, land, 30) : 0.5} armL={100} armR={100} elbowL={40} elbowR={40} legA={jump < 1 ? 60 : 20} legB={jump < 1 ? 30 : -20} />
      </g>
      {Array.from({length: 6}, (_, i) => (
        <path key={i} d={`M${900 - i * 40} ${700 + i * 40} q -200 -60 -420 40`} stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={swipe > 0 && swipe < 1 ? 0.5 : 0} />
      ))}
      <Dust t={t} t0={land} x={360} y={1000} r={140} col="#A89A8C" life={60} />
      {t > land && <path d="M260 1010 l 60 30 l -30 40 l 70 40 M430 1010 l -40 40 l 50 30" stroke="#101626" strokeWidth={10} fill="none" />}
      <Tint mood={mood} />
    </Cam>
  );
};

const Beams: React.FC<ShotProps> = ({t, d, mood}) => {
  const fire = 1.6 * S;
  const boom = 5.6 * S;
  const k = cl((t - fire) / 10);
  // the meeting point pushes back and forth, then the hero wins
  const meetX = t < boom - 30 ? 980 + Math.sin((t - fire) / 9) * 90 : lerp(980, 1500, e(t, boom - 30, 30));
  const mouth: [number, number] = [1500 - 380 * 0.66, 1010 - 870 * 0.66];
  const hand: [number, number] = [400 + 330 * 0.66, 1010 - 760 * 0.66];
  const sh = [Math.sin(t * 2.5) * (t > fire ? 6 : 0), Math.cos(t * 3.1) * (t > fire ? 5 : 0)];
  const flash = t > boom ? Math.max(0, 1 - (t - boom) / 40) : 0;
  return (
    <Cam t={t} d={d} z0={0.98} z1={1.06} sh={t > boom ? shake(t, boom, 30, 40) : sh}>
      <Arena t={t} mood={mood} />
      <g transform="translate(400 1010) scale(0.66)">
        <Hero t={t} turn={0.85} armR={90} elbowR={0} armL={20} elbowL={110} legA={20} legB={-20} crouch={0.12} glow={1} />
      </g>
      <g transform="translate(1500 1010) scale(0.66)">
        <Monster t={t} charge={e(t, 0, 40)} jaw={e(t, fire - 10, 10)} hurt={t > boom ? 1 : 0} />
      </g>
      {t >= fire && t < boom + 4 && (
        <g>
          <Beam t={t} x1={hand[0]} y1={hand[1]} x2={meetX} y2={420} col={HC.gold} w={40} k={k} />
          <Beam t={t + 5} x1={mouth[0]} y1={mouth[1]} x2={meetX} y2={420} col={MC.glow} w={46} k={k} />
          {k >= 1 && (
            <g>
              <circle cx={meetX} cy={420} r={120 + Math.sin(t) * 20} fill="#FFFFFF" opacity={0.9} />
              <circle cx={meetX} cy={420} r={240 + Math.sin(t * 0.7) * 30} fill="#FFE8A8" opacity={0.3} />
              <Sparks t={t % 20} t0={0} x={meetX} y={420} n={30} life={20} seed={Math.floor(t / 20)} />
            </g>
          )}
        </g>
      )}
      <Debris t={t} t0={boom} x={1500} y={500} n={40} spread={1600} up={18} seed={61} size={36} />
      <Tint mood={mood} />
      {flash > 0 && <rect x={-400} y={-400} width={2800} height={2000} fill="#FFFFFF" opacity={flash} />}
    </Cam>
  );
};

const End: React.FC<ShotProps> = ({t, d, mood}) => {
  const txt = e(t, 2.1 * S, 18);
  return (
    <>
      <Cam t={t} d={d} z0={1.08} z1={1.0} x={960} y={540}>
        <Sky mood={mood} t={t} horizon={880} sun={[960, 760]} />
        <Skyline mood={mood} t={t} x={-200} y={880} w={2400} s={1.0} fire={1} broken={[3, 9, 16, 22, 27]} />
        <g transform="translate(700 880) scale(0.5)" opacity={0.95}>
          <g filter="url(#silhouette)">
            <Hero t={t} turn={0.85} armL={10} armR={-6} />
          </g>
        </g>
        <g transform="translate(1450 890) scale(0.42)">
          <g filter="url(#silhouette)">
            <Monster t={t} jaw={e(t, 20, 12) * (1 - e(t, 70, 16))} hurt={0.4} />
          </g>
        </g>
        <path d="M-400 880 Q 400 830 1200 900 T 2400 880 L 2400 1400 L -400 1400 Z" fill="#2B2140" />
        {/* the kids on the hill, watching */}
        {[
          [260, 3],
          [360, 8],
          [450, 12],
        ].map(([x, seed], i) => (
          <g key={i} transform={`translate(${x} 1010) scale(1.3)`} filter="url(#silhouette)">
            <Human kid seed={seed} t={t} emo="hopeful" pose={{armR: i === 1 ? 160 : 10}} girl={i === 1} hold={i === 1 ? 'teddy' : 'none'} />
          </g>
        ))}
        <Tint mood={mood} />
      </Cam>
      <g opacity={txt}>
        <text x={960} y={260} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={110} fill="#000" opacity={0.3} transform="translate(6 8)">
          TO BE CONTINUED…
        </text>
        <text x={960} y={260} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={110} fill="#FFFFFF" letterSpacing={3}>
          TO BE CONTINUED…
        </text>
      </g>
    </>
  );
};

export const SHOT_COMPONENTS: Record<string, React.FC<ShotProps>> = {
  presents: Presents,
  open: Open,
  swings: Swings,
  slide: SlideShot,
  icecream: IceCreamShot,
  tremor: Tremor,
  look: Look,
  bulge: Bulge,
  emerge: Emerge,
  roar: Roar,
  scream: Scream,
  wade: Wade,
  panic: Panic,
  crash: Crash,
  momrun: MomRun,
  shadow: ShadowShot,
  smash: Smash,
  debris: DebrisShot,
  breath: Breath,
  hide: Hide,
  arrival: Arrival,
  heroface: HeroFace,
  cheer: Cheer,
  faceoff: FaceOff,
  clash: Clash,
  tail: TailShot,
  beams: Beams,
  end: End,
};

// keep tree-shaking honest for components used only in some shots
void SeeSaw;
