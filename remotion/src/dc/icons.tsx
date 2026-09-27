import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from './design';

/*
 * Flat 2D vector icons (colorful edition). No outlines: each shape is two tones, a lit side and
 * a shaded side, with small highlights, like the night-forest scene. Same names, sizes and
 * aspect ratios as the paper edition (icons-paper.tsx), so every scene works unchanged.
 * Most icons animate on their own (lights blink, smoke rises, fans spin, things bob), so
 * every frame has some life in it even while a scene holds still.
 */
type P = {s?: number; f?: number; hot?: boolean; w?: number};

const useT = (f?: number) => {
  const cf = useCurrentFrame();
  return f ?? cf;
};
const Svg: React.FC<{s: number; w?: number; h?: number; children: React.ReactNode; vb?: string}> = ({s, w = 1, h = 1, children, vb}) => (
  <svg width={s * w} height={s * h} viewBox={vb ?? `0 0 ${200 * w} ${200 * h}`} style={{overflow: 'visible', display: 'block'}}>
    {children}
  </svg>
);
const shadow = (cx: number, cy: number, rx: number) => <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.12} fill={C.navy} opacity={0.14} />;

export const House: React.FC<P & {lit?: boolean}> = ({s = 160, lit}) => {
  const t = useCurrentFrame();
  const glow = lit ? 0.85 + 0.15 * Math.sin(t / 6) : 0;
  return (
    <Svg s={s}>
      {shadow(100, 186, 86)}
      <rect x="34" y="92" width="132" height="92" rx="6" fill={C.cream} />
      <rect x="100" y="92" width="66" height="92" fill="#F3DDB0" />
      <path d="M18 100 L100 26 L182 100 Z" fill={C.hum} />
      <path d="M100 26 L182 100 L100 100 Z" fill="#E0472A" />
      <rect x="132" y="40" width="18" height="36" fill={C.navy} />
      <rect x="84" y="128" width="32" height="56" rx="14" fill={C.teal} />
      <rect x="46" y="116" width="28" height="28" rx="6" fill={lit ? C.yellow : C.sky} opacity={lit ? glow : 1} />
      <rect x="126" y="116" width="28" height="28" rx="6" fill={C.sky} />
      {lit && <circle cx="60" cy="130" r="30" fill={C.yellow} opacity={0.18 * glow} />}
    </Svg>
  );
};

/** A windowless data-centre building. `w` = width multiple of its height. */
export const DataCentre: React.FC<P> = ({s = 200, w = 2.4, f, hot}) => {
  const t = useT(f);
  const W = 200 * w;
  const fans = Math.max(2, Math.round(w * 2.2));
  const leds = Math.floor((W - 60) / 30);
  return (
    <Svg s={s} w={w}>
      {shadow(W / 2, 194, W * 0.46)}
      <rect x="8" y="72" width={W - 16} height="118" rx="8" fill="#DCE6F0" />
      <rect x={W * 0.62} y="72" width={W * 0.38 - 8} height="118" fill="#C3D2E1" />
      <rect x="8" y="72" width={W - 16} height="14" rx="6" fill={hot ? C.hum : C.blue} />
      {Array.from({length: leds}, (_, i) => {
        const on = Math.sin(t * 0.35 + i * 1.9) > -0.2;
        return <rect key={i} x={30 + i * 30} y="104" width="18" height="6" rx="3" fill={on ? (i % 5 === 2 ? C.hum : C.teal) : '#9FB3C7'} />;
      })}
      {Array.from({length: leds}, (_, i) => {
        const on = Math.sin(t * 0.27 + i * 2.7 + 1) > 0;
        return <rect key={`b${i}`} x={30 + i * 30} y="124" width="18" height="6" rx="3" fill={on ? C.mint : '#9FB3C7'} />;
      })}
      <rect x={W / 2 - 20} y="146" width="40" height="44" rx="6" fill={C.navy} />
      {Array.from({length: fans}, (_, i) => {
        const cx = 34 + ((W - 68) * (i + 0.5)) / fans;
        return (
          <g key={i} transform={`translate(${cx} 58)`}>
            <rect x="-22" y="-8" width="44" height="22" rx="6" fill="#9FB3C7" />
            <g transform={`rotate(${t * 23 + i * 40})`}>
              <ellipse rx="15" ry="4" fill={C.navy} />
              <ellipse rx="4" ry="15" fill={C.navy} />
            </g>
          </g>
        );
      })}
    </Svg>
  );
};

export const Rack: React.FC<P> = ({s = 200, f}) => {
  const t = useT(f);
  return (
    <Svg s={s} w={0.55}>
      <rect x="6" y="4" width="98" height="192" rx="8" fill={C.navy} />
      <rect x="70" y="4" width="34" height="192" rx="8" fill="#14223A" />
      {Array.from({length: 11}, (_, i) => (
        <g key={i}>
          <rect x="14" y={12 + i * 16.8} width="82" height="12" rx="3" fill="#2A3F63" />
          {[0, 1, 2].map((j) => {
            const on = Math.sin(t * (0.3 + j * 0.17) + i * 1.7 + j * 2.1) > 0.1;
            const col = j === 0 ? C.mint : j === 1 ? C.teal : i % 4 === 1 ? C.hum : C.yellow;
            return <circle key={j} cx={74 + j * 8} cy={18 + i * 16.8} r={2.4} fill={on ? col : '#3B5278'} />;
          })}
        </g>
      ))}
    </Svg>
  );
};

export const Chip: React.FC<P> = ({s = 160, hot = true}) => {
  const t = useCurrentFrame();
  const g = 0.75 + 0.25 * Math.sin(t / 7);
  return (
    <Svg s={s}>
      {hot && <circle cx="100" cy="100" r="92" fill={C.hum} opacity={0.14 * g} />}
      {Array.from({length: 6}, (_, i) => (
        <g key={i} fill="#9FB3C7">
          <rect x={48 + i * 19} y="20" width="8" height="24" rx="3" />
          <rect x={48 + i * 19} y="156" width="8" height="24" rx="3" />
          <rect x="20" y={48 + i * 19} width="24" height="8" rx="3" />
          <rect x="156" y={48 + i * 19} width="24" height="8" rx="3" />
        </g>
      ))}
      <rect x="40" y="40" width="120" height="120" rx="14" fill={C.navy} />
      <path d="M100 40 L160 40 L160 160 L100 160 Z" fill="#14223A" />
      <rect x="66" y="66" width="68" height="68" rx="10" fill={hot ? C.hum : C.teal} opacity={hot ? g : 1} />
      <rect x="74" y="74" width="24" height="10" rx="4" fill={C.card} opacity={0.5} />
    </Svg>
  );
};

export const Phone: React.FC<P> = ({s = 160}) => {
  const t = useCurrentFrame();
  return (
    <Svg s={s} w={0.55}>
      <rect x="6" y="4" width="98" height="192" rx="18" fill={C.navy} />
      <rect x="14" y="20" width="82" height="152" rx="8" fill={C.sky} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="22" y={32 + i * 34} width={40 + ((i * 17 + Math.floor(t / 20) * 13) % 30)} height="20" rx="6" fill={[C.pink, C.yellow, C.mint, C.blue][i]} />
      ))}
      <rect x="42" y="180" width="26" height="6" rx="3" fill="#3B5278" />
    </Svg>
  );
};

export const Cloud: React.FC<P> = ({s = 200}) => (
  <Svg s={s} h={0.6} vb="0 0 200 120">
    <circle cx="60" cy="70" r="36" fill={C.card} />
    <circle cx="105" cy="52" r="44" fill={C.card} />
    <circle cx="150" cy="74" r="32" fill="#EAF4FF" />
    <rect x="30" y="72" width="150" height="34" rx="17" fill={C.card} />
    <rect x="100" y="80" width="80" height="26" rx="13" fill="#EAF4FF" />
  </Svg>
);

export const Bolt: React.FC<P> = ({s = 120, hot = true}) => {
  const t = useCurrentFrame();
  const g = 0.8 + 0.2 * Math.sin(t / 4);
  return (
    <Svg s={s}>
      <circle cx="100" cy="100" r="86" fill={C.yellow} opacity={0.18 * g} />
      <path d="M115 12 L45 112 L95 112 L78 188 L155 80 L105 80 Z" fill={hot ? C.yellow : C.mute} />
      <path d="M115 12 L95 112 L78 188 L155 80 L105 80 Z" fill={hot ? C.orange : '#8FA3B8'} />
    </Svg>
  );
};

export const Drop: React.FC<P> = ({s = 120, hot}) => {
  const t = useCurrentFrame();
  const b = Math.sin(t / 10) * 3;
  return (
    <Svg s={s}>
      <g transform={`translate(0 ${b})`}>
        <path d="M100 14 C100 14 40 90 40 128 C40 162 68 188 100 188 C132 188 160 162 160 128 C160 90 100 14 100 14 Z" fill={hot ? C.hum : C.blue} />
        <path d="M100 14 C100 14 160 90 160 128 C160 162 132 188 100 188 Z" fill={hot ? '#E0472A' : '#2E62D9'} />
        <ellipse cx="76" cy="130" rx="12" ry="22" fill={C.card} opacity={0.6} />
      </g>
    </Svg>
  );
};

export const Turbine: React.FC<P> = ({s = 180, f, hot}) => {
  const t = useT(f);
  return (
    <Svg s={s}>
      {shadow(96, 186, 84)}
      <rect x="20" y="108" width="140" height="68" rx="14" fill={hot ? C.orange : C.steel} />
      <rect x="90" y="108" width="70" height="68" rx="0" fill={hot ? '#E8890F' : '#C3D2E1'} />
      <rect x="128" y="38" width="30" height="74" rx="4" fill={C.navy} />
      <rect x="36" y="126" width="46" height="10" rx="5" fill={C.card} opacity={0.6} />
      <rect x="36" y="146" width="46" height="10" rx="5" fill={C.card} opacity={0.4} />
      {[0, 1, 2].map((i) => {
        const u = ((t * 0.9 + i * 22) % 66) / 66;
        return <circle key={i} cx={143 + u * 22} cy={30 - u * 56} r={9 + u * 18} fill="#8C9BAE" opacity={0.55 * (1 - u)} />;
      })}
    </Svg>
  );
};

export const Gavel: React.FC<P> = ({s = 160}) => {
  const t = useCurrentFrame();
  const k = Math.max(0, Math.sin(t / 9)) * 10;
  return (
    <Svg s={s}>
      <rect x="22" y="166" width="116" height="22" rx="6" fill={C.orange} />
      <g transform={`rotate(${-35 - k} 100 100)`}>
        <rect x="42" y="48" width="96" height="48" rx="12" fill="#A0643A" />
        <rect x="42" y="72" width="96" height="24" rx="0" fill="#7E4B29" />
        <rect x="84" y="94" width="14" height="94" rx="6" fill="#A0643A" />
      </g>
    </Svg>
  );
};

export const Bill: React.FC<P & {up?: boolean}> = ({s = 170, up = true}) => {
  const t = useCurrentFrame();
  return (
    <Svg s={s} w={0.8}>
      <path d="M10 8 L150 8 L150 192 L130 180 L110 192 L90 180 L70 192 L50 180 L30 192 L10 180 Z" fill={C.card} />
      <path d="M100 8 L150 8 L150 192 L130 180 L110 192 L100 186 Z" fill="#EEF3F8" />
      <rect x="24" y="24" width="64" height="14" rx="5" fill={C.blue} />
      {[56, 74, 92, 110].map((y, i) => (
        <rect key={y} x="24" y={y} width={100 - i * 12} height="8" rx="4" fill={C.steel} />
      ))}
      <rect x="24" y="140" width="112" height="30" rx="8" fill={up ? C.hum : C.teal} />
      <text x="80" y="162" textAnchor="middle" fontFamily="Fredoka" fontWeight="700" fontSize="22" fill={C.card}>
        {up ? `$${(120 + (Math.floor(t / 4) % 9) * 7).toFixed(0)} ↑` : 'PAID'}
      </text>
    </Svg>
  );
};

export const Well: React.FC<P & {dry?: boolean}> = ({s = 180, dry}) => {
  const t = useCurrentFrame();
  const sw = Math.sin(t / 12) * 6;
  return (
    <Svg s={s}>
      {shadow(100, 186, 80)}
      <rect x="38" y="36" width="10" height="90" fill="#A0643A" />
      <rect x="152" y="36" width="10" height="90" fill="#A0643A" />
      <path d="M22 44 L100 8 L178 44 Z" fill={C.hum} />
      <path d="M100 8 L178 44 L100 44 Z" fill="#E0472A" />
      <rect x="38" y="54" width="124" height="8" rx="4" fill="#7E4B29" />
      <g transform={`rotate(${sw} 100 58)`}>
        <line x1="100" y1="58" x2="100" y2="92" stroke={C.navy} strokeWidth="3" />
        <path d="M84 92 L116 92 L112 118 L88 118 Z" fill={C.orange} />
      </g>
      <rect x="26" y="118" width="148" height="66" rx="10" fill="#B8C4D2" />
      <rect x="100" y="118" width="74" height="66" rx="0" fill="#9FAEBF" />
      {[0, 1].map((i) => (
        <rect key={i} x="26" y={136 + i * 22} width="148" height="4" fill={C.card} opacity={0.35} />
      ))}
      {dry && (
        <text x="100" y="112" textAnchor="middle" fontFamily="Caveat" fontWeight="600" fontSize="30" fill={C.hum}>
          dry
        </text>
      )}
    </Svg>
  );
};

export const Fan: React.FC<P> = ({s = 140, f}) => {
  const t = useT(f);
  return (
    <Svg s={s}>
      <circle cx="100" cy="100" r="88" fill={C.steel} />
      <g transform={`rotate(${t * 19} 100 100)`}>
        {[0, 72, 144, 216, 288].map((a, i) => (
          <path key={a} transform={`rotate(${a} 100 100)`} d="M100 100 C120 70 140 40 118 24 C96 30 92 70 100 100 Z" fill={i % 2 ? C.blue : C.teal} />
        ))}
      </g>
      <circle cx="100" cy="100" r="14" fill={C.navy} />
    </Svg>
  );
};

export const Money: React.FC<P> = ({s = 170}) => {
  const t = useCurrentFrame();
  return (
    <Svg s={s} h={0.7} vb="0 0 200 140">
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${i * 4 + Math.sin(t / 15 + i) * 2} ${100 - i * 26})`}>
          <rect x="10" y="0" width="170" height="36" rx="6" fill={C.green} />
          <rect x="95" y="0" width="85" height="36" rx="6" fill="#2E9A60" />
          <circle cx="95" cy="18" r="11" fill={C.mint} />
          <text x="95" y="24" textAnchor="middle" fontFamily="Fredoka" fontWeight="700" fontSize="16" fill="#1E6B43">
            $
          </text>
        </g>
      ))}
    </Svg>
  );
};

export const Person: React.FC<P & {outline?: boolean; hat?: boolean}> = ({s = 80, outline, hat}) => {
  const t = useCurrentFrame();
  const bob = Math.sin(t / 8 + s) * 2;
  const body = outline ? 'none' : C.blue;
  const head = outline ? 'none' : '#F2B48C';
  const dash = outline ? '8 7' : undefined;
  return (
    <Svg s={s} w={0.5}>
      <g transform={`translate(0 ${bob})`}>
        <circle cx="50" cy="44" r="26" fill={head} stroke={outline ? C.mute : 'none'} strokeWidth={4} strokeDasharray={dash} />
        <path d="M10 190 C10 120 30 86 50 86 C70 86 90 120 90 190 Z" fill={body} stroke={outline ? C.mute : 'none'} strokeWidth={4} strokeDasharray={dash} />
        {!outline && <path d="M50 86 C70 86 90 120 90 190 L50 190 Z" fill="#2E62D9" />}
        {hat && <path d="M20 36 C22 8 78 8 80 36 L88 38 L12 38 Z" fill={C.yellow} />}
      </g>
    </Svg>
  );
};

export const Globe: React.FC<P> = ({s = 170, f}) => {
  const t = useT(f);
  const shift = (t * 0.8) % 200;
  return (
    <Svg s={s}>
      <defs>
        <clipPath id="globe-clip">
          <circle cx="100" cy="100" r="84" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="84" fill={C.blue} />
      <g clipPath="url(#globe-clip)">
        {[-200, 0].map((o) => (
          <g key={o} transform={`translate(${o + shift} 0)`}>
            <path d="M20 60 C40 40 70 44 80 62 C90 80 60 96 44 90 C30 84 16 76 20 60 Z" fill={C.green} />
            <path d="M110 90 C130 70 170 78 176 104 C180 130 150 150 128 140 C112 132 100 110 110 90 Z" fill={C.green} />
            <path d="M60 130 C74 122 90 130 88 148 C86 162 70 166 62 156 C56 148 52 138 60 130 Z" fill={C.green} />
          </g>
        ))}
        <path d="M100 16 A84 84 0 0 1 100 184 Z" fill={C.navy} opacity={0.18} />
      </g>
    </Svg>
  );
};

export const Seat: React.FC<P & {taken?: boolean}> = ({s = 70, taken}) => (
  <Svg s={s}>
    <rect x="40" y="18" width="120" height="104" rx="22" fill={taken ? C.hum : C.steel} />
    <rect x="30" y="108" width="140" height="42" rx="14" fill={taken ? '#E0472A' : '#C3D2E1'} />
    <rect x="46" y="150" width="12" height="36" rx="4" fill={C.navy} />
    <rect x="142" y="150" width="12" height="36" rx="4" fill={C.navy} />
  </Svg>
);

export const Pylon: React.FC<P> = ({s = 200}) => {
  const t = useCurrentFrame();
  const spark = ((t * 3) % 160) / 160;
  return (
    <Svg s={s} w={0.8}>
      <g stroke={C.navy} strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M80 8 L40 192 M80 8 L120 192 M55 120 L105 120 M62 80 L98 80 M48 160 L112 160 M55 120 L98 80 M105 120 L62 80 M48 160 L105 120 M112 160 L55 120" />
        <path d="M18 50 L142 50 M32 90 L128 90" stroke={C.ink2} />
      </g>
      <circle cx={18 + spark * 124} cy={50} r="6" fill={C.yellow} />
    </Svg>
  );
};

export const Contract: React.FC<P> = ({s = 170}) => {
  const t = useCurrentFrame();
  const k = Math.min(1, ((t % 90) / 60));
  return (
    <Svg s={s} w={0.78}>
      <rect x="8" y="6" width="140" height="188" rx="10" fill={C.card} />
      <rect x="90" y="6" width="58" height="188" rx="0" fill="#EEF3F8" />
      <rect x="22" y="24" width="84" height="14" rx="5" fill={C.purple} />
      {[56, 72, 88, 104, 120].map((y) => (
        <rect key={y} x="22" y={y} width="112" height="7" rx="3" fill={C.steel} />
      ))}
      <path d="M26 166 C38 150 48 175 60 158 C68 148 74 170 90 160" fill="none" stroke={C.blue} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      <rect x="22" y="174" width="112" height="4" rx="2" fill={C.navy} />
    </Svg>
  );
};

export const Scale: React.FC<P & {tilt?: number}> = ({s = 220, tilt = 0}) => (
  <Svg s={s}>
    <rect x="94" y="30" width="12" height="152" rx="5" fill={C.navy} />
    <rect x="56" y="176" width="88" height="16" rx="6" fill={C.purple} />
    <g transform={`rotate(${tilt} 100 40)`}>
      <rect x="16" y="34" width="168" height="10" rx="5" fill={C.navy} />
      <path d="M20 40 L4 98 M20 40 L36 98 M180 40 L164 98 M180 40 L196 98" stroke={C.ink2} strokeWidth={3} />
      <path d="M0 98 Q20 124 40 98 Z" fill={C.yellow} />
      <path d="M160 98 Q180 124 200 98 Z" fill={C.blue} />
    </g>
    <circle cx="100" cy="36" r="10" fill={C.hum} />
  </Svg>
);

export const Speaker: React.FC<P> = ({s = 140, f}) => {
  const t = useT(f);
  return (
    <Svg s={s}>
      <path d="M26 78 L60 78 L102 42 L102 158 L60 122 L26 122 Z" fill={C.purple} />
      <path d="M60 78 L102 42 L102 158 L60 122 Z" fill="#5E43D6" />
      {[0, 1, 2].map((i) => {
        const o = 0.3 + 0.7 * Math.abs(Math.sin(t / 8 - i * 0.6));
        return <path key={i} d={`M${120 + i * 22} ${70 - i * 16} Q${142 + i * 28} 100 ${120 + i * 22} ${130 + i * 16}`} fill="none" stroke={C.hum} strokeWidth={8} strokeLinecap="round" opacity={o} />;
      })}
    </Svg>
  );
};

export const Factory: React.FC<P & {f?: number}> = ({s = 200, f}) => {
  const t = useT(f);
  return (
    <Svg s={s}>
      {shadow(96, 188, 90)}
      <path d="M10 186 L10 100 L55 74 L55 100 L100 74 L100 100 L145 74 L145 186 Z" fill={C.orange} />
      <path d="M100 100 L145 74 L145 186 L100 186 Z" fill="#E8890F" />
      {[30, 70, 110].map((x) => (
        <rect key={x} x={x} y="126" width="22" height="22" rx="4" fill={C.yellow} opacity={0.6 + 0.4 * Math.sin(t / 7 + x)} />
      ))}
      <rect x="150" y="36" width="28" height="150" rx="4" fill={C.navy} />
      {[0, 1, 2].map((i) => {
        const u = ((t * 0.7 + i * 20) % 60) / 60;
        return <circle key={i} cx={164 + u * 22} cy={28 - u * 46} r={9 + u * 14} fill="#AAB6C4" opacity={0.6 * (1 - u)} />;
      })}
    </Svg>
  );
};

export const Tree: React.FC<P> = ({s = 150}) => {
  const t = useCurrentFrame();
  const sw = Math.sin(t / 18 + s) * 3;
  return (
    <Svg s={s}>
      {shadow(100, 188, 50)}
      <rect x="92" y="118" width="16" height="70" rx="4" fill="#7E4B29" />
      <g transform={`rotate(${sw} 100 188)`}>
        <path d="M100 8 L160 90 L130 90 L172 150 L28 150 L70 90 L40 90 Z" fill={C.green} />
        <path d="M100 8 L160 90 L130 90 L172 150 L100 150 Z" fill="#2E9A60" />
        <rect x="56" y="112" width="60" height="6" rx="3" fill={C.mint} opacity={0.6} />
      </g>
    </Svg>
  );
};

export const Ear: React.FC<P> = ({s = 140}) => {
  const t = useCurrentFrame();
  return (
    <Svg s={s}>
      <path d="M70 150 C40 150 40 110 55 95 C35 60 60 20 100 20 C150 20 165 70 140 100 C125 118 118 125 112 150 C108 175 85 185 70 170" fill="#F2B48C" />
      <path d="M78 95 C75 60 125 55 122 88" fill="none" stroke="#D98E62" strokeWidth={10} strokeLinecap="round" />
      {[0, 1].map((i) => (
        <path key={i} d={`M${160 + i * 18} ${60 - i * 10} Q${176 + i * 20} 90 ${160 + i * 18} ${120 + i * 10}`} fill="none" stroke={C.hum} strokeWidth={6} strokeLinecap="round" opacity={0.4 + 0.6 * Math.abs(Math.sin(t / 7 - i))} />
      ))}
    </Svg>
  );
};

export const Folder: React.FC<P & {label?: string}> = ({s = 220, label = 'PROJECT BLUE'}) => (
  <Svg s={s} h={0.75} vb="0 0 200 150">
    <path d="M6 20 L70 20 L84 34 L194 34 L194 144 L6 144 Z" fill={C.yellow} />
    <path d="M100 34 L194 34 L194 144 L100 144 Z" fill={C.orange} />
    <g transform="rotate(-8 100 90)">
      <rect x="30" y="70" width="140" height="40" rx="8" fill={C.card} />
      <text x="100" y="97" textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight="500" fontSize="16" fill={C.hum} letterSpacing="2">
        {label}
      </text>
    </g>
  </Svg>
);

export const CoolingTower: React.FC<P> = ({s = 200, f}) => {
  const t = useT(f);
  return (
    <Svg s={s}>
      {shadow(100, 188, 70)}
      <path d="M50 186 C65 130 65 90 55 40 L145 40 C135 90 135 130 150 186 Z" fill={C.steel} />
      <path d="M100 40 L145 40 C135 90 135 130 150 186 L100 186 Z" fill="#C3D2E1" />
      <rect x="60" y="150" width="80" height="8" rx="4" fill={C.blue} opacity={0.7} />
      {[0, 1, 2, 3].map((i) => {
        const u = ((t * 0.6 + i * 17) % 68) / 68;
        return <circle key={i} cx={80 + i * 14 + u * 10} cy={34 - u * 64} r={12 + u * 20} fill={C.card} opacity={0.85 * (1 - u)} />;
      })}
    </Svg>
  );
};

export const Plant: React.FC<P> = ({s = 180}) => {
  const t = useCurrentFrame();
  return (
    <Svg s={s}>
      {shadow(100, 188, 90)}
      <rect x="18" y="98" width="116" height="88" rx="8" fill={C.teal} />
      <rect x="76" y="98" width="58" height="88" fill="#12918A" />
      <rect x="140" y="36" width="24" height="150" rx="4" fill={C.navy} />
      {[40, 84].map((x) => (
        <rect key={x} x={x} y="120" width="22" height="22" rx="4" fill={C.yellow} opacity={0.7 + 0.3 * Math.sin(t / 6 + x)} />
      ))}
      {[0, 1].map((i) => {
        const u = ((t * 0.7 + i * 30) % 60) / 60;
        return <circle key={i} cx={152 + u * 18} cy={28 - u * 44} r={8 + u * 12} fill="#AAB6C4" opacity={0.6 * (1 - u)} />;
      })}
    </Svg>
  );
};

export const Pause: React.FC<P> = ({s = 150}) => {
  const t = useCurrentFrame();
  const p = 1 + 0.05 * Math.sin(t / 6);
  return (
    <Svg s={s}>
      <g transform={`translate(100 100) scale(${p}) translate(-100 -100)`}>
        <circle cx="100" cy="100" r="86" fill={C.hum} />
        <rect x="68" y="58" width="22" height="84" rx="6" fill={C.card} />
        <rect x="110" y="58" width="22" height="84" rx="6" fill={C.card} />
      </g>
    </Svg>
  );
};

export const Coin: React.FC<P & {label?: string}> = ({s = 140, label = '$1'}) => {
  const t = useCurrentFrame();
  const sq = 0.85 + 0.15 * Math.abs(Math.cos(t / 14));
  return (
    <Svg s={s}>
      <g transform={`translate(100 100) scale(${sq} 1) translate(-100 -100)`}>
        <circle cx="100" cy="100" r="84" fill={C.orange} />
        <circle cx="100" cy="100" r="70" fill={C.yellow} />
        <path d="M100 30 A70 70 0 0 1 100 170 Z" fill="#FFB020" />
        <text x="100" y="118" textAnchor="middle" fontFamily="Fredoka" fontWeight="700" fontSize={label.length > 3 ? 44 : 56} fill="#9A5A00">
          {label}
        </text>
      </g>
    </Svg>
  );
};

export const Flag: React.FC<P> = ({s = 120}) => {
  const t = useCurrentFrame();
  const wv = Math.sin(t / 6) * 8;
  return (
    <Svg s={s}>
      <rect x="46" y="16" width="8" height="172" rx="3" fill={C.navy} />
      <path d={`M54 24 Q100 ${14 + wv} 160 40 Q110 ${56 - wv} 54 70 Z`} fill={C.hum} />
      <rect x="30" y="178" width="40" height="12" rx="4" fill={C.navy} />
    </Svg>
  );
};

export const Hall: React.FC<P> = ({s = 200}) => (
  <Svg s={s}>
    {shadow(100, 188, 90)}
    <path d="M16 70 L100 20 L184 70 Z" fill={C.purple} />
    <path d="M100 20 L184 70 L100 70 Z" fill="#5E43D6" />
    <rect x="20" y="70" width="160" height="16" rx="3" fill={C.cream} />
    {[38, 72, 110, 144].map((x) => (
      <rect key={x} x={x} y="86" width="18" height="80" rx="3" fill={C.cream} />
    ))}
    <rect x="12" y="164" width="176" height="22" rx="4" fill="#E8D4A8" />
  </Svg>
);

export const Pipe: React.FC<P & {len?: number}> = ({s = 60, len = 6, f}) => {
  const t = useT(f);
  return (
    <svg width={s * len} height={s} viewBox={`0 0 ${200 * len} 200`} style={{overflow: 'visible', display: 'block'}}>
      <rect x="0" y="56" width={200 * len} height="88" rx="44" fill={C.steel} />
      <rect x="0" y="100" width={200 * len} height="44" rx="22" fill="#C3D2E1" />
      {Array.from({length: len * 2}, (_, i) => {
        const x = (i * 100 + t * 12) % (200 * len);
        return <circle key={i} cx={x} cy={100} r={16} fill={i % 2 ? C.hum : C.orange} opacity={0.85} />;
      })}
    </svg>
  );
};

export const Heat: React.FC<P> = ({s = 160, f}) => {
  const t = useT(f);
  return (
    <Svg s={s}>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${60 + i * 40} 180 C${40 + i * 40} 140 ${80 + i * 40} 120 ${60 + i * 40} 80 C${40 + i * 40} 50 ${70 + i * 40} 30 ${60 + i * 40} 14`}
          fill="none"
          stroke={[C.hum, C.orange, C.yellow][i]}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.4 + 0.6 * Math.abs(Math.sin(t / 10 + i))}
          transform={`translate(0 ${-((t * 1.5 + i * 10) % 20)})`}
        />
      ))}
    </Svg>
  );
};

export const Clock: React.FC<P> = ({s = 140, f}) => {
  const t = useT(f);
  return (
    <Svg s={s}>
      <circle cx="100" cy="100" r="86" fill={C.yellow} />
      <circle cx="100" cy="100" r="70" fill={C.card} />
      <line x1="100" y1="100" x2={100 + 38 * Math.sin(t / 30)} y2={100 - 38 * Math.cos(t / 30)} stroke={C.navy} strokeWidth={8} strokeLinecap="round" />
      <line x1="100" y1="100" x2={100 + 56 * Math.sin(t / 2.5)} y2={100 - 56 * Math.cos(t / 2.5)} stroke={C.hum} strokeWidth={5} strokeLinecap="round" />
      <circle cx="100" cy="100" r="8" fill={C.navy} />
    </Svg>
  );
};

export const HardHat: React.FC<P> = ({s = 120}) => (
  <Svg s={s}>
    <path d="M30 130 C30 60 170 60 170 130 Z" fill={C.yellow} />
    <path d="M100 66 C140 70 170 96 170 130 L100 130 Z" fill={C.orange} />
    <rect x="16" y="126" width="168" height="18" rx="8" fill={C.orange} />
  </Svg>
);


