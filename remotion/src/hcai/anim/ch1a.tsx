// Chapter 1, "The cloud is a building", first half (1:40–3:31 on the film): the cloud, the buildings, the journey of a
// question, the GPU, parallel math, 700 W per chip, heat, the hot aisle.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';
import {Bg, Cam, Caption, Chip, CloudShape, Counter, DataCentre, Fan, Flow, House, IconGrid, Label, Laptop, Person, Pop, Put, Rack, Thermometer, World} from './lib';

/* ---------------------------------------------------------------- 1:40 "We call it the cloud" */
export const C1Cloud: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const gone = ease(f, w(109.6), 10);
  const bob = Math.sin(f / 22) * 10;
  const words: [string, number, number, number][] = [['soft', 105.55, 560, 300], ['white', 106.1, 1380, 330], ['floating', 106.95, 1320, 760]];
  const apps = ['Cloud storage', 'Cloud backup', 'Cloud gaming', 'Cloud photos'];
  return (
    <Bg c={P.sky} c2="#BDE6FF" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.25], [109.3, 960, 520, 1.0], [110.6, 960, 520, 1.6]]}>
        <World>
          {/* the marketing word on screens */}
          {apps.map((a, i) => {
            const k = pop(f, w(102.8) + i * 7, 12);
            const [x, y] = [[330, 260], [1590, 240], [300, 820], [1620, 830]][i];
            return k > 0 ? (
              <g key={a} transform={`translate(${x},${y}) scale(${k * (1 - gone)})`}>
                <rect x={-150} y={-60} width={300} height={120} rx={22} fill={P.white} />
                <g transform="translate(-95,0) scale(0.32)">
                  <CloudShape c={P.blue} />
                </g>
                <text x={-40} y={10} fontFamily="Poppins" fontWeight={700} fontSize={26} fill={P.ink}>
                  {a}
                </text>
              </g>
            ) : null;
          })}
          <Put x={960} y={520 + bob} s={2.6 * (1 - gone) + 0.001} f={f}>
            <CloudShape />
          </Put>
          {/* poof */}
          {gone > 0 &&
            Array.from({length: 14}, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const d = 80 + 360 * gone;
              return <circle key={i} cx={960 + Math.cos(a) * d} cy={520 + Math.sin(a) * d * 0.6} r={40 * (1 - gone) + 2} fill={P.white} opacity={1 - gone} />;
            })}
        </World>
      </Cam>
      {words.map(([t, a, x, y]) => (
        <Pop key={t} f={f} at={w(a)} x={x} y={y} size={64} color={P.navy} until={w(109.4)}>
          {t}
        </Pop>
      ))}
      {/* "It weighs nothing" */}
      <Pop f={f} at={w(108.1)} x={960} y={880} size={58} color={P.navy} until={w(109.4)}>
        <span style={{background: P.white, borderRadius: 24, padding: '8px 30px'}}>weight: 0 kg?</span>
      </Pop>
      <Pop f={f} at={w(109.65)} x={960} y={540} size={120} color={P.white}>
        There is no cloud.
      </Pop>
    </Bg>
  );
};

/* ---------------------------------------------------------------- "There are buildings. Concrete, steel, copper and glass." */
export const C1Buildings: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const layers: [string, number, string][] = [['Concrete', 111.3, '#A9A39A'], ['Steel', 112.05, '#7C8AA8'], ['Copper', 112.95, '#D1793B'], ['Glass', 113.5, '#9FD4FF']];
  const many = ease(f, w(114.4), 24);
  return (
    <Bg c={P.navy}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.15, -10, 6], [114.3, 960, 560, 1.15, -10, 6], [115.6, 960, 520, 0.42, 0, 0]]}>
        <World w={1920} h={1080}>
          {/* thousands of them: copies spread out around the first */}
          {many > 0 &&
            Array.from({length: 120}, (_, i) => {
              const col = (i % 15) - 7, row = Math.floor(i / 15) - 4;
              if (col === 0 && row === 0) return null;
              const k = Math.max(0, Math.min(1, many * 2.2 - Math.hypot(col, row) * 0.12));
              return (
                <g key={i} transform={`translate(${960 + col * 360},${560 + row * 260}) scale(${0.9 * k})`} opacity={k}>
                  <DataCentre f={f + i * 3} />
                </g>
              );
            })}
          {/* the first building, layer by layer */}
          <g transform="translate(960,600) scale(2.2)">
            {ease(f, w(111.3), 10) > 0 && <rect x={-170} y={60} width={340} height={22} rx={4} fill="#A9A39A" opacity={ease(f, w(111.3), 10)} />}
            {ease(f, w(112.05), 10) > 0 && (
              <g opacity={ease(f, w(112.05), 10)} stroke="#7C8AA8" strokeWidth={6} fill="none">
                {[-150, -75, 0, 75, 150].map((x) => (
                  <line key={x} x1={x} y1={60} x2={x} y2={-60} />
                ))}
                <line x1={-150} y1={-60} x2={150} y2={-60} />
              </g>
            )}
            {ease(f, w(112.95), 10) > 0 && (
              <g opacity={ease(f, w(112.95), 10)}>
                {[0, 1, 2].map((i) => (
                  <path key={i} d={`M-150 ${20 - i * 22} Q0 ${40 - i * 22} 150 ${20 - i * 22}`} stroke="#D1793B" strokeWidth={5} fill="none" />
                ))}
              </g>
            )}
            {ease(f, w(113.5), 10) > 0 && (
              <g opacity={ease(f, w(113.5), 10) * (1 - many)}>
                <rect x={-150} y={-60} width={300} height={120} fill="#9FD4FF" opacity={0.35} />
              </g>
            )}
            {many > 0 && (
              <g opacity={many}>
                <DataCentre f={f} />
              </g>
            )}
          </g>
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 80, top: 80, display: 'flex', flexDirection: 'column', gap: 16}}>
        {layers.map(([name, t, c]) => {
          const k = ease(f, w(t), 8) * (1 - many);
          return k > 0 ? (
            <div key={name} style={{opacity: k, transform: `translateX(${(1 - k) * -30}px)`, display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{width: 34, height: 34, borderRadius: 8, background: c}} />
              <span style={{fontFamily: AF.head, fontWeight: 800, fontSize: 46, color: P.white}}>{name}</span>
            </div>
          ) : null;
        })}
      </div>
      <Pop f={f} at={w(114.5)} x={960} y={150} size={80}>
        Thousands of them
      </Pop>
    </Bg>
  );
};

/* ---------------------------------------------------------------- the journey: street, highway, ocean floor, data centre */
// one long world, 5200 px wide: home | street | highway | ocean | data centre
const ROUTE: [number, number][] = [[300, 560], [520, 620], [620, 860], [1500, 860], [1800, 700], [2700, 700], [2900, 760], [3100, 980], [4100, 980], [4300, 760], [4700, 640]];
export const C1Journey: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const t = t0 + f / 24;
  const sent = ease(f, w(120.1), 8);
  const go = Math.max(0, Math.min(1, (t - 121.6) / (133.1 - 121.6)));
  return (
    <Bg c="#1B2C6B">
      <Cam f={f} t0={t0} keys={[[t0, 460, 600, 1.3], [119.6, 460, 600, 1.3], [121.2, 560, 650, 1.0], [125.3, 1050, 760, 0.95, -8, 4], [127.8, 1950, 720, 0.95, -8, 4], [129.7, 2600, 760, 0.9], [131.6, 3500, 860, 0.95, 8, 4], [133.3, 4560, 650, 1.1, 0, 0]]}>
        <World w={5200} h={1300}>
          {/* sky and ground strips */}
          <rect x={0} y={700} width={2800} height={600} fill="#3B2A1E" />
          <rect x={0} y={680} width={2800} height={40} fill="#5C5F6E" />
          <rect x={2800} y={600} width={1500} height={700} fill={P.water} opacity={0.85} />
          <rect x={2800} y={1000} width={1500} height={300} fill="#C9A86A" />
          <rect x={4300} y={680} width={900} height={620} fill="#3B2A1E" />
          {/* home */}
          <Put x={300} y={560} s={1.4}>
            <House c={P.orange} on={1} />
          </Put>
          <Put x={300} y={510} s={0.55}>
            <Laptop />
          </Put>
          {/* the street: cars above, cable below */}
          {[900, 1300].map((x, i) => (
            <rect key={x} x={((x + f * 6 * (i ? 1 : -1)) % 1600) + 600} y={650} width={110} height={36} rx={14} fill={i ? P.red : P.yellow} />
          ))}
          {/* the highway */}
          <rect x={1700} y={640} width={1100} height={60} fill="#3D4253" />
          {Array.from({length: 10}, (_, i) => (
            <rect key={i} x={1720 + ((i * 120 + f * 10) % 1080)} y={667} width={60} height={6} fill={P.white} />
          ))}
          {/* the ocean: fish and the cable on the seabed */}
          {Array.from({length: 8}, (_, i) => {
            const x = 2900 + ((random(`fx${i}`) * 1300 + f * (2 + i % 3)) % 1300);
            const y = 700 + random(`fy${i}`) * 220;
            return <path key={i} d={`M${x} ${y} q20 -14 40 0 q-20 14 -40 0 l-14 -10 v20 z`} fill={i % 2 ? P.yellow : P.orange} opacity={0.8} />;
          })}
          <Put x={4700} y={600} s={1.6} f={f}>
            <DataCentre f={f} busy={t > 133.0 ? 1 : 0} />
          </Put>
          {/* the cable and the light */}
          <path d={'M' + ROUTE.map((p) => p.join(',')).join(' L')} stroke="#11131C" strokeWidth={22} fill="none" strokeLinejoin="round" />
          <path d={'M' + ROUTE.map((p) => p.join(',')).join(' L')} stroke={P.sky} strokeWidth={6} fill="none" strokeLinejoin="round" opacity={0.6 * sent} />
          {go > 0 && go < 1 && <Flow pts={ROUTE} f={f} c={P.yellow} n={10} r={11} speed={22} line={false} />}
        </World>
      </Cam>
      <Label f={f} at={w(116.6)} title="Follow one question" sub="what should I make for dinner?" />
      {[
        [121.7, 'Pulses of light', 'your words, as flashes in glass fibre'],
        [125.6, 'Under your street', 'fibre-optic cable'],
        [128.3, 'Along highways', ''],
        [130.5, 'Across the ocean floor', 'undersea cables carry most data between continents'],
        [132.8, 'A data centre', ''],
      ].map(([a, title, sub], i, arr) => (
        <Caption key={i} f={f} at={w(a as number)} until={i < arr.length - 1 ? w(arr[i + 1][0] as number) - 6 : undefined}>
          {title}
          {sub ? <span style={{fontWeight: 500, opacity: 0.6}}> · {sub}</span> : null}
        </Caption>
      ))}
      <div style={{position: 'absolute', right: 70, top: 70, opacity: ease(f, w(121.8), 10), textAlign: 'right'}}>
        <Note size={20}>Light in fibre</Note>
        <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 54, color: P.yellow}}>~200,000 km/s</div>
      </div>
    </Bg>
  );
};

/* ---------------------------------------------------------------- "Inside that data center, your question lands on a very special kind of chip." */
export const C1DiveIn: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  return (
    <Bg c={P.night}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 540, 0.9], [134.5, 960, 560, 1.0], [135.6, 960, 560, 2.6], [136.8, 960, 520, 6.5], [137.6, 960, 506, 16]]}>
        <World>
          <rect x={0} y={760} width={1920} height={320} fill="#1B1446" />
          <Put x={960} y={640} s={3}>
            <DataCentre f={f} busy={1} />
          </Put>
          {/* inside: one rack, one server, one chip */}
          <g transform="translate(960,560)" opacity={ease(f, w(135.4), 8)}>
            <rect x={-120} y={-160} width={240} height={330} rx={10} fill="#121733" />
            <g transform="scale(0.9)">
              <Rack f={f} busy={1} />
            </g>
          </g>
          <g transform="translate(960,506) scale(0.06)" opacity={ease(f, w(136.6), 8)}>
            <Chip f={f} on={ease(f, w(137.5), 6)} />
          </g>
        </World>
      </Cam>
      <Caption f={f} at={w(134.0)}>Inside: rows of racks, servers, and chips</Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- "Explosions. Shadows. Water reflections." */
export const C1Games: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const px = 48; // the screen is drawn as pixels, each one worked out by the chip
  const cols = 26, rows = 14;
  const sweep = ease(f, w(147.0), 30);
  return (
    <Bg c={P.plum}>
      <div style={{position: 'absolute', left: 960 - (cols * px) / 2, top: 120, width: cols * px, height: rows * px, borderRadius: 18, overflow: 'hidden', boxShadow: '0 0 0 16px #12131A'}}>
        <svg width={cols * px} height={rows * px}>
          <rect width={cols * px} height={rows * px * 0.55} fill="#3D8BFF" />
          <rect y={rows * px * 0.55} width={cols * px} height={rows * px * 0.45} fill={P.water} />
          <circle cx={1000} cy={130} r={60} fill={P.yellow} />
          {/* a hero and the shadow */}
          <ellipse cx={420} cy={385} rx={60 * ease(f, w(146.8), 10)} ry={12} fill="rgba(0,0,0,0.45)" />
          <rect x={395} y={250} width={50} height={130} rx={20} fill={P.red} />
          <circle cx={420} cy={225} r={30} fill="#E9B48A" />
          {/* the reflection in the water */}
          <g opacity={ease(f, w(147.7), 10) * 0.55} transform={`translate(0,${770 + Math.sin(f / 6) * 3}) scale(1,-1)`}>
            <rect x={395} y={250} width={50} height={130} rx={20} fill={P.red} />
            <circle cx={1000} cy={130} r={60} fill={P.yellow} />
          </g>
          {/* an explosion */}
          {Array.from({length: 10}, (_, i) => {
            const k = ((f - w(145.9)) / 18 + i * 0.03) % 1;
            const a = (i / 10) * Math.PI * 2;
            return f > w(145.9) ? <circle key={i} cx={880 + Math.cos(a) * 90 * k} cy={300 + Math.sin(a) * 70 * k} r={34 * (1 - k)} fill={i % 2 ? P.orange : P.yellow} /> : null;
          })}
          {/* pixel grid, lit up as the chip computes them */}
          {Array.from({length: cols * rows}, (_, i) => {
            const c = i % cols, r = Math.floor(i / cols);
            const on = (c + r) / (cols + rows) < sweep;
            return <rect key={i} x={c * px} y={r * px} width={px} height={px} fill="none" stroke={on ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'} />;
          })}
        </svg>
      </div>
      {[['Explosions', 145.9], ['Shadows', 146.85], ['Water reflections', 147.75]].map(([t, a], i) => (
        <div key={i} style={{position: 'absolute', left: 260 + i * 470, top: 860, width: 440, textAlign: 'center', opacity: ease(f, w(a as number), 8)}}>
          <Tag bg={P.white} color={P.ink} size={40}>{t}</Tag>
        </div>
      ))}
      <Note style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', opacity: ease(f, w(148.2), 10)}} size={22}>
        Every pixel, worked out again 60 times a second
      </Note>
    </Bg>
  );
};

/* ---------------------------------------------------------------- "millions of simple math problems at the same time... all modern AI is, underneath" */
export const C1Parallel: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const math = ease(f, w(161.8), 12);
  return (
    <Bg c={P.navy}>
      {/* a CPU: a few big workers, one problem after another */}
      <div style={{position: 'absolute', left: 120, top: 150, width: 760, opacity: ease(f, 0, 10) * (1 - math)}}>
        <Tag bg={P.white} color={P.ink} size={40}>Ordinary chip (CPU)</Tag>
        <Note style={{marginTop: 12}}>a few strong cores, one step after another</Note>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 160px)', gap: 20, marginTop: 40}}>
          {Array.from({length: 8}, (_, i) => {
            const on = Math.floor(f / 10) % 8 === i;
            return <div key={i} style={{height: 140, borderRadius: 18, background: on ? P.sky : '#2A3B7A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: AF.head, fontWeight: 800, fontSize: 34, color: P.white}}>{on ? '2+3' : ''}</div>;
          })}
        </div>
      </div>
      {/* a GPU: thousands of small workers, all at once */}
      <div style={{position: 'absolute', left: 1000, top: 150, width: 800, opacity: ease(f, w(150.0), 10) * (1 - math)}}>
        <Tag bg={P.yellow} color={P.ink} size={40}>GPU</Tag>
        <Note style={{marginTop: 12}}>thousands of small cores, all at the same time</Note>
        <div style={{marginTop: 40}}>
          <IconGrid f={f} start={w(153.8)} n={480} hi={480} cols={30} size={18} gap={8} stagger={0.03} shape="square" color={Math.floor(f / 4) % 2 ? P.yellow : P.orange} />
        </div>
      </div>
      <Caption f={f} at={w(153.9)} until={w(161.6)}>
        Millions of simple sums at the same time
      </Caption>
      {/* "that is all modern AI really is underneath. Math." */}
      {math > 0 && (
        <AbsoluteFill style={{opacity: math}}>
          <div style={{position: 'absolute', left: 140, top: 200, width: 700, background: P.white, borderRadius: 28, padding: '28px 34px', fontFamily: AF.body, fontSize: 36, color: P.ink}}>
            What should I make for dinner?
          </div>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <Flow pts={[[860, 260], [1100, 260], [1100, 540]]} f={f} c={P.yellow} n={5} r={8} speed={8} />
          </svg>
          {/* the words become numbers, the numbers multiply */}
          <div style={{position: 'absolute', left: 940, top: 420, width: 860, fontFamily: AF.mono, fontSize: 30, lineHeight: 1.45, color: P.sky, whiteSpace: 'pre', overflow: 'hidden', height: 470}}>
            {Array.from({length: 11}, (_, r) =>
              Array.from({length: 6}, (_, c) => (random(`m${r}-${c}-${Math.floor(f / 3)}`) * 2 - 1).toFixed(2).padStart(6)).join('  ×'),
            ).join('\n')}
          </div>
          <Pop f={f} at={w(162.0)} x={480} y={640} size={150} color={P.yellow}>
            Math.
          </Pop>
          <Caption f={f} at={w(163.5)}>An unbelievable amount of it, all at once</Caption>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ---------------------------------------------------------------- "Nvidia's H100 can draw up to 700 watts. That's one chip." */
export const C1Watts: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const bulbs = Math.floor(7 * ease(f, w(173.3), 30));
  return (
    <Bg c="#1E1650">
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Flow pts={[[960, -20], [960, 330]]} f={f} c={P.yellow} n={6} r={12} speed={10} o={ease(f, w(172.2), 10)} />
        <Put x={960} y={430} s={1.5} f={f} at={w(169.9)}>
          <Chip f={f} on={ease(f, w(172.3), 10)} c="#1D6B3A" />
        </Put>
        {/* seven 100-watt light bulbs */}
        {Array.from({length: 7}, (_, i) => {
          const on = i < bulbs;
          const x = 960 + (i - 3) * 200;
          return (
            <g key={i} transform={`translate(${x},830)`} opacity={ease(f, w(173.2) + i * 3, 8)}>
              <circle r={50} fill={on ? P.yellow : '#3A3D55'} style={{filter: on ? `drop-shadow(0 0 30px ${P.yellow})` : undefined}} />
              <rect x={-22} y={44} width={44} height={36} rx={6} fill="#9AA6BD" />
            </g>
          );
        })}
      </svg>
      <Label f={f} at={w(170.0)} title="Nvidia H100" sub="one of the most popular AI chips" />
      <div style={{position: 'absolute', right: 120, top: 260, textAlign: 'right'}}>
        <Counter f={f} start={w(173.0)} dur={22} to={700} suffix=" W" size={150} color={P.yellow} />
        <Note style={{marginTop: 8, opacity: ease(f, w(173.6), 10)}}>up to · Nvidia datasheet</Note>
      </div>
      <Caption f={f} at={w(175.1)}>That's one chip: as much as seven old 100-watt bulbs, all day and night</Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- "tens of thousands... hundreds of thousands" */
export const C1Scale: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const big = ease(f, w(183.9), 20);
  return (
    <Bg c={P.navy}>
      <div style={{position: 'absolute', left: 120, top: 150, transform: `scale(${lerp(1, 0.55, big)})`, transformOrigin: '0 0'}}>
        <IconGrid f={f} start={w(179.1)} n={800} hi={800} cols={40} size={18} gap={6} stagger={0.02} shape="square" color={P.yellow} />
      </div>
      {big > 0 && (
        <div style={{position: 'absolute', left: 120 + 1000 * 0.55, top: 150, opacity: big}}>
          <IconGrid f={f} start={w(184.0)} n={1600} hi={1600} cols={50} size={10} gap={4} stagger={0.006} shape="square" color={P.orange} />
        </div>
      )}
      <div style={{position: 'absolute', left: 120, top: 70, display: 'flex', gap: 40}}>
        <Tag bg={P.yellow} color={P.ink} size={38}>Large AI data centre: tens of thousands of chips</Tag>
      </div>
      <Pop f={f} at={w(184.0)} x={1250} y={190} size={40} color={P.white}>
        <span style={{background: P.orange, borderRadius: 30, padding: '10px 28px'}}>Newest "AI factories": hundreds of thousands</span>
      </Pop>
      <div style={{position: 'absolute', left: 120, bottom: 70, opacity: ease(f, w(180.5), 10)}}>
        <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 52, color: P.white}}>
          100,000 chips × 700 W = <span style={{color: P.yellow}}>70 megawatts</span>
        </div>
        <Note style={{marginTop: 8}}>the chips alone, before cooling and everything else</Note>
      </div>
    </Bg>
  );
};

/* ---------------------------------------------------------------- "Almost every watt that goes into a chip comes out as heat." */
export const C1Heat: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const heat = ease(f, w(192.3), 20);
  return (
    <Bg c={P.navy}>
      <AbsoluteFill style={{background: '#7A1530', opacity: heat * 0.7}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Flow pts={[[100, 540], [760, 540]]} f={f} c={P.yellow} n={8} r={14} speed={9} o={ease(f, w(190.2), 10)} />
        <Put x={960} y={540} s={1.6}>
          <Chip f={f} on={1} c="#1D6B3A" />
        </Put>
        {Array.from({length: 7}, (_, i) => {
          const y = 300 + i * 80;
          return <path key={i} d={`M1180 ${y} q40 -30 80 0 t80 0 t80 0 t80 0 t80 0 t80 0`} stroke={P.red} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="60 40" strokeDashoffset={-f * 6} opacity={heat} />;
        })}
        <Put x={1820} y={540} s={1.1}>
          <Thermometer level={0.25 + 0.7 * heat} />
        </Put>
      </svg>
      <div style={{position: 'absolute', left: 120, top: 380, opacity: ease(f, w(190.2), 10)}}>
        <Tag bg={P.yellow} color={P.ink} size={44}>Electricity in</Tag>
      </div>
      <div style={{position: 'absolute', left: 1230, top: 180, opacity: heat}}>
        <Tag bg={P.red} color={P.white} size={44}>Heat out</Tag>
      </div>
      <Label f={f} at={w(186.5)} title="The part nobody advertises" sub="physics" />
      <Caption f={f} at={w(192.2)}>Almost every watt in comes out as heat</Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- the hot aisle: oven door, warm air, the roar, the floor */
export const C1HotAisle: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const shake = f > w(205.8) ? Math.sin(f * 2.3) * 4 : 0;
  const walk = ease(f, w(194.4), w(198.3) - w(194.4));
  return (
    <Bg c="#16122E">
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.0, 0, 8], [198.3, 960, 560, 1.15, -12, 8], [202.8, 1100, 520, 1.3, 10, 6], [208.0, 960, 560, 1.05, 0, 4]]}>
        <World>
          <g transform={`translate(${shake},0)`}>
            {/* cold aisle | rack row | hot aisle | rack row | cold aisle */}
            <rect x={0} y={200} width={480} height={700} fill="#123A73" />
            <rect x={1440} y={200} width={480} height={700} fill="#123A73" />
            <rect x={720} y={200} width={480} height={700} fill="#6E1630" />
            {[600, 1320].map((x) => (
              <g key={x}>
                {Array.from({length: 3}, (_, i) => (
                  <g key={i} transform={`translate(${x},${330 + i * 220}) scale(0.95)`}>
                    <Rack f={f + i * 5} busy={1} />
                  </g>
                ))}
              </g>
            ))}
            {/* cold air in (blue), hot air out (red) */}
            <Flow pts={[[100, 560], [500, 560]]} f={f} c={P.sky} n={4} r={10} speed={5} />
            <Flow pts={[[1820, 560], [1420, 560]]} f={f} c={P.sky} n={4} r={10} speed={5} />
            {Array.from({length: 5}, (_, i) => (
              <path key={i} d={`M${760 + i * 90} 880 q-30 -60 0 -120 t0 -120 t0 -120 t0 -120`} stroke={P.orange} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="40 30" strokeDashoffset={f * 5} opacity={ease(f, w(195.3), 10)} />
            ))}
            {/* the visitor */}
            <g transform={`translate(${lerp(-80, 900, walk)},780) scale(1.1)`}>
              <Person c={P.teal} f={f} />
              {f > w(204.7) && <rect x={-34} y={-90} width={68} height={16} rx={8} fill={P.yellow} />}
            </g>
            {/* fans along the top */}
            {[240, 960, 1680].map((x) => (
              <g key={x} transform={`translate(${x},130) scale(0.55)`}>
                <Fan f={f} />
              </g>
            ))}
          </g>
        </World>
      </Cam>
      <div style={{position: 'absolute', left: 80, top: 60, display: 'flex', gap: 20}}>
        <Tag bg={P.sky} color={P.ink} size={32}>Cold aisle</Tag>
        <Tag bg={P.red} color={P.white} size={32}>Hot aisle</Tag>
      </div>
      {[
        [198.3, 'Like opening an oven door'],
        [199.5, 'Warm air pushes against your face'],
        [202.85, 'Fans so loud workers wear ear protection'],
        [205.85, 'The floor vibrates'],
      ].map(([a, text], i, arr) => (
        <Caption key={i} f={f} at={w(a as number)} until={i < arr.length - 1 ? w(arr[i + 1][0] as number) - 4 : undefined}>
          {text}
        </Caption>
      ))}
    </Bg>
  );
};

/* ---------------------------------------------------------------- "This is what 'the cloud' sounds like." */
export const C1Sound: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const k = ease(f, w(208.4), 14);
  return (
    <Bg c={P.night}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g transform="translate(960,420) scale(1.6)" opacity={1 - k * 0.6}>
          <CloudShape c={P.white} />
        </g>
        {Array.from({length: 96}, (_, i) => {
          const x = 60 + i * 19;
          const a = (0.25 + 0.75 * random(`a${i}-${Math.floor(f / 2)}`)) * k * (1 - Math.abs(i - 48) / 70);
          return <rect key={i} x={x} y={600 - 200 * a} width={10} height={400 * a + 4} rx={5} fill={i % 7 ? P.sky : P.yellow} />;
        })}
      </svg>
      <Caption f={f} at={w(208.4)}>What "the cloud" sounds like: a constant roar</Caption>
    </Bg>
  );
};
