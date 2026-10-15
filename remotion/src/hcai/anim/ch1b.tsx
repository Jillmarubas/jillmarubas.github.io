// Chapter 1, second half (3:41–4:19 on the chapter clip, 221–356 s on the film): data-centre scale next to homes,
// training vs inference, 800M weekly users, heavier questions, Stargate and $500B, chip → power → heat, two needs.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';
import {Bars, Bg, Bolt, Cam, Caption, Chip, Clock, Coin, Counter, DataCentre, Factory, Flow, House, IconGrid, Label, Laptop, Pop, Put, Pylon, World} from './lib';

/* ---------------------------------------------------------------- "Grey boxes the size of shopping malls, next to neighbourhoods, schools and farmland" */
export const C1Neighbours: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const iso = (x: number, y: number): [number, number] => [960 + (x - y) * 0.87, 300 + (x + y) * 0.5];
  return (
    <Bg c="#7ED957" c2="#4CB944" angle={180}>
      <Cam f={f} t0={t0} keys={[[t0, 960, 560, 1.25, 0, 0], [226.6, 960, 560, 0.95, 0, 0]]}>
        <World>
          {/* the data centre: one grey box as big as the whole street */}
          {(() => {
            const H = 90; // walls
            const up = (p: [number, number]): [number, number] => [p[0], p[1] - H];
            const s = (a: [number, number][]) => a.map((p) => p.join(',')).join(' ');
            const [a, b, c, d] = [iso(0, 0), iso(700, 0), iso(700, 420), iso(0, 420)];
            return (
              <g>
                <polygon points={s([d, c, up(c), up(d)])} fill="#AEB8CC" />
                <polygon points={s([b, c, up(c), up(b)])} fill="#8E9AB3" />
                <polygon points={s([up(a), up(b), up(c), up(d)])} fill="#D5DBE6" stroke="#9AA6BD" strokeWidth={3} />
              </g>
            );
          })()}
          {Array.from({length: 18}, (_, i) => {
            const [x, y] = iso(60 + (i % 6) * 105, 70 + Math.floor(i / 6) * 120);
            return <ellipse key={i} cx={x} cy={y - 90} rx={34} ry={18} fill="#8E9AB3" />;
          })}
          {/* neighbours: homes, a school, a farm */}
          {Array.from({length: 7}, (_, i) => {
            const [x, y] = iso(800 + (i % 2) * 120, 20 + i * 70);
            return (
              <Put key={i} x={x} y={y} s={0.5} f={f} at={w(222.7) + i * 2}>
                <House c={[P.red, P.orange, P.teal, P.purple][i % 4]} />
              </Put>
            );
          })}
          <Put x={iso(820, 560)[0]} y={iso(820, 560)[1]} s={0.9} f={f} at={w(224.2)}>
            <g>
              <rect x={-90} y={-40} width={180} height={80} fill="#F2C14E" />
              <path d="M-100 -38 L0 -80 L100 -38 Z" fill={P.red} />
              <rect x={-14} y={-30} width={28} height={20} fill={P.white} />
            </g>
          </Put>
          {Array.from({length: 6}, (_, r) => {
            const a = iso(-420, 80 + r * 60), b = iso(-60, 80 + r * 60);
            return f > w(225.0) ? <line key={r} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#C9A86A" strokeWidth={22} opacity={ease(f, w(225.0) + r, 8)} /> : null;
          })}
        </World>
      </Cam>
      <Label f={f} at={0} title="Loudoun County, Virginia" sub="more data-centre capacity than almost anywhere" bg={P.ink} color={P.white} />
      {[
        [222.7, 'Homes'],
        [224.2, 'School'],
        [225.0, 'Farmland'],
      ].map(([a, t], i) => (
        <div key={i} style={{position: 'absolute', right: 80, top: 80 + i * 90, opacity: ease(f, w(a as number), 8)}}>
          <Tag bg={P.white} color={P.ink} size={36}>{t as string}</Tag>
        </div>
      ))}
      <Caption f={f} at={w(221.2)}>One building, the size of a shopping mall</Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- training: the internet goes in, billions of settings, predict the next word */
export const C1Training: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const words: [string, number][] = [['dinner', 62], ['lunch', 18], ['tonight', 11], ['pasta', 9]];
  const pred = ease(f, w(243.9), 14);
  const kinds: [string, number, string][] = [['Books', 235.5, P.orange], ['Articles', 236.0, P.teal], ['Code', 237.1, P.purple], ['Conversations', 237.25, P.pink]];
  return (
    <Bg c={P.navy}>
      <Pop f={f} at={w(226.8)} x={960} y={200} size={90} until={w(229.5)}>
        Two jobs
      </Pop>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', gap: 120, opacity: ease(f, w(227.2), 10) * (1 - ease(f, w(229.5), 8))}}>
        <Tag bg={P.yellow} color={P.ink} size={60}>1 · Training</Tag>
        <Tag bg={P.sky} color={P.ink} size={60}>2 · Inference</Tag>
      </div>
      {f > w(229.4) && (
        <AbsoluteFill style={{opacity: ease(f, w(229.5), 10)}}>
          <Label f={f} at={w(229.6)} title="1 · Training" bg={P.yellow} />
          {/* the internet flows into the model */}
          {kinds.map(([k, a, c], i) => (
            <div key={k} style={{position: 'absolute', left: 120, top: 260 + i * 130, opacity: ease(f, w(a), 8)}}>
              <Tag bg={c} color={P.white} size={38}>{k}</Tag>
            </div>
          ))}
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {kinds.map(([k, a, c], i) => (
              <Flow key={k} pts={[[470, 300 + i * 130], [800, 300 + i * 130], [880, 540]]} f={f} c={c} n={4} r={9} speed={7} o={ease(f, w(a), 10)} />
            ))}
          </svg>
          {/* the model: a grid of tiny settings (knobs) being adjusted */}
          <div style={{position: 'absolute', left: 900, top: 230, width: 620, height: 620, borderRadius: 40, background: '#0F1A45', boxShadow: '0 0 0 6px #2F6BFF', padding: 30, boxSizing: 'border-box'}}>
            <Note size={20}>The model · billions of tiny settings</Note>
            <svg width={560} height={520} style={{marginTop: 14}}>
              {Array.from({length: 16 * 14}, (_, i) => {
                const x = 18 + (i % 16) * 34, y = 18 + Math.floor(i / 16) * 36;
                const a = (random(`k${i}`) * 300 + (f > w(240.8) ? Math.sin(f / 4 + i) * 60 : 0));
                return (
                  <g key={i} transform={`translate(${x},${y})`}>
                    <circle r={12} fill="#2A3B7A" />
                    <line x1={0} y1={0} x2={10 * Math.cos((a * Math.PI) / 180)} y2={10 * Math.sin((a * Math.PI) / 180)} stroke={P.yellow} strokeWidth={3} strokeLinecap="round" />
                  </g>
                );
              })}
            </svg>
          </div>
          {/* weeks or months */}
          <div style={{position: 'absolute', left: 1580, top: 260, textAlign: 'center', opacity: ease(f, w(239.7), 10)}}>
            <svg width={240} height={240} viewBox="-120 -120 240 240">
              <Clock f={f * 6} />
            </svg>
            <Note style={{marginTop: 10}}>runs for weeks or months</Note>
          </div>
          {/* predict the next word */}
          <div style={{position: 'absolute', left: 120, bottom: 80, width: 1680, opacity: pred}}>
            <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 52, color: P.white}}>
              What should I make for <span style={{color: P.yellow, borderBottom: `6px solid ${P.yellow}`}}>{pred > 0.6 ? 'dinner' : '____'}</span>?
            </div>
            <div style={{display: 'flex', gap: 30, marginTop: 20}}>
              {words.map(([wd, pct], i) => (
                <div key={wd} style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <span style={{fontFamily: AF.head, fontWeight: 700, fontSize: 30, color: P.white, width: 120, textAlign: 'right'}}>{wd}</span>
                  <div style={{width: 260 * (pct / 62) * ease(f, w(244.0) + i * 3, 12), height: 26, borderRadius: 13, background: i ? '#7C8AA8' : P.yellow}} />
                </div>
              ))}
            </div>
            <Note style={{marginTop: 10}}>illustration: the model scores every possible next word</Note>
          </div>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ---------------------------------------------------------------- "Think of training like building a factory. You do it once, and it's massively expensive." */
export const C1Factory: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const build = ease(f, w(246.5), 40);
  return (
    <Bg c="#3A2A7A">
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <rect x={0} y={780} width={1920} height={300} fill="#2A1B5E" />
        <clipPath id="c1build">
          <rect x={0} y={780 - 520 * build} width={1920} height={520 * build + 10} />
        </clipPath>
        <g clipPath="url(#c1build)">
          <Put x={960} y={680} s={2.6} f={f}>
            <Factory f={f} />
          </Put>
        </g>
        {/* the crane while it goes up */}
        <g opacity={1 - ease(f, w(248.2), 10)} stroke={P.yellow} strokeWidth={10} fill="none">
          <path d="M1500 780 V200 H1100 M1500 260 L1450 200" />
          <line x1={1160} y1={200} x2={1160} y2={200 + 300 * (1 - build)} />
        </g>
        {Array.from({length: 18}, (_, i) => (
          <g key={i} transform={`translate(${200 + (i % 6) * 70},${760 - Math.floor(i / 6) * 34})`} opacity={ease(f, w(249.2) + i * 1.2, 6)}>
            <Coin label="$" />
          </g>
        ))}
      </svg>
      <Label f={f} at={w(245.7)} title="Training = building the factory" bg={P.yellow} />
      <Pop f={f} at={w(248.3)} x={1460} y={880} size={64}>
        Once
      </Pop>
      <Caption f={f} at={w(249.2)}>Done once · massively expensive</Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- "Inference... The factory is built. Now it's producing. One answer at a time." */
export const C1Inference: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const run = f > w(258.4);
  return (
    <Bg c={P.teal} c2="#006E8A" angle={160}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Put x={560} y={600} s={2.2}>
          <Factory f={f} />
        </Put>
        {/* conveyor */}
        <rect x={780} y={700} width={1140} height={26} rx={13} fill="#0B3A4A" />
        {Array.from({length: 12}, (_, i) => (
          <circle key={i} cx={800 + i * 96} cy={713} r={9} fill="#5BC0BE" />
        ))}
        {/* answers come off the line, one at a time */}
        {run &&
          Array.from({length: 6}, (_, i) => {
            const x = 800 + ((f - w(258.4)) * 7 - i * 230);
            if (x < 790 || x > 1900) return null;
            return (
              <g key={i} transform={`translate(${x},640)`}>
                <rect x={-80} y={-50} width={160} height={90} rx={18} fill={P.white} />
                <rect x={-60} y={-28} width={110} height={10} rx={5} fill="#C5CCD8" />
                <rect x={-60} y={-8} width={80} height={10} rx={5} fill="#C5CCD8" />
              </g>
            );
          })}
      </svg>
      <Label f={f} at={w(252.4)} title="2 · Inference" sub="every time someone asks a question" bg={P.sky} />
      <Caption f={f} at={w(259.6)}>The factory is built. Now it produces, one answer at a time</Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- "what changed everything": 800M people a week */
export const C1Users: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const tip = ease(f, w(266.6), 30);
  const roles: [string, number, string][] = [['Students', 272.2, P.yellow], ['Coders', 272.7, P.sky], ['Doctors', 274.0, P.pink], ['People asking about dinner', 274.5, P.orange]];
  return (
    <Bg c={P.navy}>
      {/* a balance: training vs answering */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 1 - ease(f, w(267.2), 12)}}>
        <g transform={`translate(960,520) rotate(${lerp(-12, 14, tip)})`}>
          <rect x={-420} y={-8} width={840} height={16} rx={8} fill={P.white} />
          <g transform="translate(-380,-60)">
            <rect x={-110} y={-40} width={220} height={80} rx={20} fill={P.yellow} />
            <text textAnchor="middle" y={12} fontFamily="Poppins" fontWeight={800} fontSize={34} fill={P.ink}>Training</text>
          </g>
          <g transform="translate(380,-60)">
            <rect x={-110} y={-40} width={220} height={80} rx={20} fill={P.sky} />
            <text textAnchor="middle" y={12} fontFamily="Poppins" fontWeight={800} fontSize={34} fill={P.ink}>Answers</text>
          </g>
        </g>
        <path d="M960 520 L900 760 H1020 Z" fill="#7C8AA8" />
      </svg>
      <Pop f={f} at={w(262.6)} x={960} y={170} size={70} until={w(267.0)}>
        What changed everything?
      </Pop>
      {f > w(267.0) && (
        <AbsoluteFill style={{opacity: ease(f, w(267.1), 10)}}>
          <div style={{position: 'absolute', left: 120, top: 120}}>
            <Counter f={f} start={w(267.3)} dur={60} to={800000000} size={130} color={P.yellow} />
            <div style={{fontFamily: AF.head, fontWeight: 700, fontSize: 40, color: P.white, marginTop: 10}}>people use ChatGPT every week</div>
            <Note style={{marginTop: 10}}>Source · OpenAI, October 2025</Note>
          </div>
          <div style={{position: 'absolute', left: 120, top: 470}}>
            <IconGrid f={f} start={w(268.3)} n={160} hi={160} cols={32} size={30} gap={10} stagger={0.12} shape="person" color={P.sky} />
          </div>
          <div style={{position: 'absolute', right: 120, top: 480, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-end'}}>
            {roles.map(([r, a, c]) => (
              <div key={r} style={{opacity: ease(f, w(a), 8), transform: `scale(${pop(f, w(a), 10)})`}}>
                <Tag bg={c} color={P.ink} size={36}>{r}</Tag>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ---------------------------------------------------------------- "One answer is tiny. Billions of answers are not. And the questions are getting heavier." */
export const C1Tiny: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const many = ease(f, w(278.5), 30);
  return (
    <Bg c={P.night}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 1200}, (_, i) => {
          const x = 30 + (i % 48) * 39.5, y = 40 + Math.floor(i / 48) * 40;
          const show = i === 600 || random(`d${i}`) < many * 1.05;
          return show ? <circle key={i} cx={x} cy={y} r={i === 600 ? 14 : 8} fill={i === 600 ? P.yellow : P.sky} opacity={i === 600 ? 1 : 0.8} /> : null;
        })}
      </svg>
      <Pop f={f} at={w(277.4)} x={960} y={540} size={64} until={w(278.4)}>
        <span style={{background: P.ink, borderRadius: 20, padding: '6px 24px'}}>1 answer: tiny</span>
      </Pop>
      <Pop f={f} at={w(278.6)} x={960} y={540} size={84}>
        <span style={{background: P.ink, borderRadius: 24, padding: '8px 30px'}}>Billions are not</span>
      </Pop>
      <Caption f={f} at={w(280.5)}>And the questions are getting heavier</Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- text → image → video → reasoning; more math, more chips, more power */
export const C1Heavier: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const think = Math.max(0, f - w(296.8));
  const tail = ease(f, w(303.7), 10);
  return (
    <Bg c="#1E1650">
      <AbsoluteFill style={{opacity: 1 - tail}}>
        <Bars
          f={f}
          style={{left: 160, top: 120}}
          w={1600}
          h={560}
          barW={210}
          items={[
            {label: 'Text answer', value: 1, at: w(283.1), color: P.green, text: ''},
            {label: 'Image', value: 3, at: w(288.0), color: P.yellow, text: ''},
            {label: 'Video', value: 7, at: w(290.8), color: P.orange, text: ''},
            {label: '"Reasoning" model', value: 10, at: w(293.3), color: P.red, text: ''},
          ]}
        />
        <div style={{position: 'absolute', right: 140, top: 110, textAlign: 'right', opacity: ease(f, w(296.8), 10)}}>
          <Note>thinking before it answers</Note>
          <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 90, color: P.red, fontVariantNumeric: 'tabular-nums'}}>
            {Math.floor(think / 6) < 60 ? `${Math.floor(think / 6)} s` : `${Math.floor(think / 360)} min`}
          </div>
        </div>
        <Note style={{position: 'absolute', left: 170, top: 80, opacity: ease(f, w(283.2), 10)}} size={22}>
          Work per answer · illustration, not to scale
        </Note>
      </AbsoluteFill>
      {tail > 0 && (
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 120, opacity: tail}}>
          {[['More math', 304.0, P.sky], ['More chips', 305.1, P.yellow], ['More power', 305.8, P.orange]].map(([t, a, c]) => (
            <div key={t as string} style={{transform: `scale(${pop(f, w(a as number), 12)})`, fontFamily: AF.head, fontWeight: 800, fontSize: 80, color: c as string}}>
              {t as string}
            </div>
          ))}
        </div>
      )}
    </Bg>
  );
};

/* ---------------------------------------------------------------- "That's why the buildings keep getting bigger." */
export const C1Bigger: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  return (
    <Bg c={P.navy}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <rect x={0} y={860} width={1920} height={220} fill="#1B1446" />
        {[0.5, 0.85, 1.3, 1.9].map((s, i) => (
          <Put key={i} x={260 + i * 420 + (s - 1) * 60} y={860 - 60 * s} s={s} f={f} at={w(307.1) + i * 5}>
            <DataCentre f={f} />
          </Put>
        ))}
        <path d="M200 960 L1700 960" stroke={P.yellow} strokeWidth={8} markerEnd="url(#c1arr)" />
        <defs>
          <marker id="c1arr" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill={P.yellow} />
          </marker>
        </defs>
      </svg>
      <Caption f={f} at={w(307.4)}>So the buildings keep getting bigger</Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- Stargate: January 2025, three companies, up to $500B, Abilene */
export const C1Stargate: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const site = ease(f, w(322.9), 14);
  const cranes = ease(f, w(324.0), w(326.4) - w(324.0));
  return (
    <Bg c="#1B1446">
      <AbsoluteFill style={{opacity: 1 - site}}>
        <Label f={f} at={w(309.8)} title="January 2025" bg={P.yellow} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center', gap: 60}}>
          {[['OpenAI', 311.9], ['SoftBank', 312.4], ['Oracle', 313.4]].map(([n, a]) => (
            <div key={n as string} style={{transform: `scale(${pop(f, w(a as number), 12)})`}}>
              <Tag bg={P.white} color={P.ink} size={56}>{n as string}</Tag>
            </div>
          ))}
        </div>
        <Pop f={f} at={w(315.5)} x={960} y={500} size={140} color={P.yellow}>
          “Stargate”
        </Pop>
        <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: ease(f, w(317.5), 8)}}>
          <div style={{display: 'inline-block'}}>
            <Counter f={f} start={w(317.6)} dur={30} to={500} prefix="up to $" suffix=" billion" size={110} color={P.white} />
          </div>
          <Note style={{marginTop: 14}}>on AI infrastructure in the United States · OpenAI, 21 Jan 2025</Note>
        </div>
      </AbsoluteFill>
      {/* the first site: flat ground near Abilene, Texas, buildings rising */}
      {site > 0 && (
        <AbsoluteFill style={{opacity: site, background: 'linear-gradient(#F6B26B, #E8C38F)'}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect x={0} y={640} width={1920} height={440} fill="#C9A06A" />
            {[0, 1, 2, 3, 4].map((i) => {
              const k = Math.max(0, Math.min(1, cranes * 1.6 - i * 0.15));
              return (
                <g key={i} transform={`translate(${250 + i * 360},${760 - i * 20})`}>
                  <rect x={-150} y={-100 * k} width={300} height={100 * k} fill="#E8EEF9" />
                  <rect x={-150} y={-100 * k} width={300} height={14} fill="#B8C3D9" />
                </g>
              );
            })}
            {[500, 1300].map((x) => (
              <g key={x} stroke={P.yellow} strokeWidth={10} fill="none">
                <path d={`M${x} 760 V260 H${x - 320} M${x} 320 L${x - 60} 260`} />
                <line x1={x - 250} y1={260} x2={x - 250} y2={420 + Math.sin(f / 10) * 20} />
              </g>
            ))}
          </svg>
          <Label f={f} at={w(323.0)} title="Abilene, Texas" sub="the first Stargate site" bg={P.ink} color={P.white} />
        </AbsoluteFill>
      )}
    </Bg>
  );
};

/* ---------------------------------------------------------------- "$500 billion: more than the yearly economy of many countries. Buildings, chips and power." */
export const C1HalfTrillion: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const split = ease(f, w(333.2), 14);
  return (
    <Bg c={P.plum}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 60}, (_, i) => {
          const col = i % 10, row = Math.floor(i / 10);
          const k = ease(f, w(327.0) + i * 0.5, 8);
          const tx = lerp(560 + col * 80, [[560, 760], [960, 760], [1360, 760]][i % 3][0] + (col - 5) * 18, split);
          const ty = lerp(820 - row * 36, 640 - Math.floor(i / 3) * 12, split);
          return k > 0 ? (
            <g key={i} transform={`translate(${tx},${ty}) scale(0.6)`} opacity={k}>
              <Coin label="$" />
            </g>
          ) : null;
        })}
      </svg>
      <Pop f={f} at={w(327.0)} x={960} y={180} size={130} color={P.yellow}>
        $500,000,000,000
      </Pop>
      <Caption f={f} at={w(330.6)} until={w(333.0)}>More than the yearly economy of many countries</Caption>
      {split > 0 &&
        [['Buildings', 334.0, P.white], ['Chips', 334.3, P.yellow], ['Power', 335.0, P.orange]].map(([t, a, c], i) => (
          <div key={i} style={{position: 'absolute', left: 560 + i * 400 - 160, width: 320, top: 860, textAlign: 'center', transform: `scale(${pop(f, w(a as number), 12)})`}}>
            <Tag bg={c as string} color={P.ink} size={44}>{t as string}</Tag>
          </div>
        ))}
    </Bg>
  );
};

/* ---------------------------------------------------------------- "Every answer needs a chip. Every chip needs power. Every watt turns into heat." */
export const C1Loop: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const nodes: [number, number, string, string, number][] = [[360, 540, 'Answer', P.sky, 337.0], [960, 540, 'Chip', P.green, 337.9], [1560, 540, 'Power', P.yellow, 338.9]];
  const heat = ease(f, w(341.6), 16);
  return (
    <Bg c={P.navy}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Flow pts={[[480, 540], [840, 540]]} f={f} c={P.sky} n={4} r={10} speed={6} o={ease(f, w(337.6), 10)} />
        <Flow pts={[[1440, 540], [1080, 540]]} f={f} c={P.yellow} n={4} r={10} speed={6} o={ease(f, w(338.8), 10)} />
        {nodes.map(([x, y, , c, a]) => (
          <g key={x} transform={`translate(${x},${y}) scale(${pop(f, w(a), 12)})`}>
            <circle r={110} fill={c} />
            <g transform="scale(0.55)">{x === 960 ? <Chip c="#1D6B3A" f={f} on={heat} /> : x === 1560 ? <Bolt c={P.ink} /> : <Laptop />}</g>
          </g>
        ))}
        {Array.from({length: 6}, (_, i) => (
          <path key={i} d={`M${880 + i * 30} 400 q-20 -40 0 -80 t0 -80 t0 -80`} stroke={P.red} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="30 22" strokeDashoffset={f * 5} opacity={heat} />
        ))}
      </svg>
      {nodes.map(([x, , t, , a]) => (
        <div key={t} style={{position: 'absolute', left: x - 200, width: 400, top: 700, textAlign: 'center', opacity: ease(f, w(a), 8)}}>
          <Tag bg={P.white} color={P.ink} size={44}>{t}</Tag>
        </div>
      ))}
      <Pop f={f} at={w(342.5)} x={960} y={110} size={64} color={P.red}>
        …and every watt becomes heat
      </Pop>
    </Bg>
  );
};

/* ---------------------------------------------------------------- "two things to survive: electricity, and a way to get rid of heat" */
export const C1TwoThings: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  return (
    <Bg c="#1B1446">
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Put x={960} y={640} s={2.4}>
          <DataCentre f={f} busy={1} />
        </Put>
        <Put x={240} y={560} s={1.4} f={f} at={w(347.2)}>
          <Pylon />
        </Put>
        <Flow pts={[[260, 450], [600, 450], [700, 600]]} f={f} c={P.yellow} n={6} r={12} speed={8} o={ease(f, w(347.3), 10)} />
        {Array.from({length: 5}, (_, i) => (
          <path key={i} d={`M${1300 + i * 60} 430 q-25 -50 0 -100 t0 -100 t0 -100`} stroke={P.red} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray="34 24" strokeDashoffset={f * 5} opacity={ease(f, w(349.0), 10)} />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 120, top: 120, transform: `scale(${pop(f, w(347.2), 12)})`, transformOrigin: '0 0'}}>
        <Tag bg={P.yellow} color={P.ink} size={56}>1 · Electricity</Tag>
      </div>
      <div style={{position: 'absolute', right: 120, top: 120, transform: `scale(${pop(f, w(349.0), 12)})`, transformOrigin: '100% 0'}}>
        <Tag bg={P.red} color={P.white} size={56}>2 · Get rid of heat</Tag>
      </div>
      <Caption f={f} at={w(345.4)}>What every one of these buildings needs to survive</Caption>
    </Bg>
  );
};

/* ---------------------------------------------------------------- "Let's start with electricity, because this is where the story gets strange." */
export const C1Strange: React.FC<AnimProps> = ({f, t0}) => {
  const w = (a: number) => at(t0, a);
  const k = ease(f, 0, 30);
  return (
    <Bg c={P.night}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(960,520) scale(${lerp(1.6, 3.2, k)}) rotate(${Math.sin(f / 8) * 3})`}>
          <Bolt c={P.yellow} />
        </g>
      </svg>
      <Pop f={f} at={w(353.4)} x={960} y={900} size={80}>
        …where it gets <span style={{color: P.yellow}}>strange</span>
      </Pop>
    </Bg>
  );
};
