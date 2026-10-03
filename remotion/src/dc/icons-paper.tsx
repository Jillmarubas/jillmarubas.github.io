import React from 'react';
import {C} from './design';

/*
 * Icons drawn in code on a 200×200 grid: ink outlines, paper fills, the accent only where it
 * carries the point. Each takes `s` (rendered size in px) and optional `f` (frame) for the
 * few that move on their own (fans, rack lights, smoke).
 */
type P = {s?: number; f?: number; hot?: boolean; w?: number};
const sw = 5;
const Svg: React.FC<{s: number; w?: number; h?: number; children: React.ReactNode; vb?: string}> = ({s, w = 1, h = 1, children, vb}) => (
  <svg width={s * w} height={s * h} viewBox={vb ?? `0 0 ${200 * w} ${200 * h}`} style={{overflow: 'visible', display: 'block'}}>
    <g fill={C.card} stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
      {children}
    </g>
  </svg>
);

export const House: React.FC<P & {lit?: boolean}> = ({s = 160, lit}) => (
  <Svg s={s}>
    <path d="M30 95 L100 35 L170 95 L170 175 L30 175 Z" />
    <path d="M18 100 L100 28 L182 100" fill="none" />
    <rect x="85" y="125" width="30" height="50" />
    <rect x="48" y="112" width="26" height="24" fill={lit ? C.hum : C.card} />
    <rect x="126" y="112" width="26" height="24" />
    <rect x="130" y="45" width="16" height="26" />
  </Svg>
);

/** A windowless data-centre building. `w` = width multiple of its height. */
export const DataCentre: React.FC<P> = ({s = 200, w = 2.4, f = 0, hot}) => {
  const W = 200 * w;
  const fans = Math.max(2, Math.round(w * 2.2));
  return (
    <Svg s={s} w={w}>
      <rect x="6" y="70" width={W - 12} height="120" fill="#E4DED2" />
      {Array.from({length: Math.floor((W - 40) / 26)}, (_, i) => (
        <line key={i} x1={24 + i * 26} y1="92" x2={24 + i * 26} y2="168" stroke={C.mute} strokeWidth={3} />
      ))}
      <rect x={W / 2 - 18} y="150" width="36" height="40" fill={C.card} />
      {Array.from({length: fans}, (_, i) => {
        const cx = 30 + ((W - 60) * (i + 0.5)) / fans;
        return (
          <g key={i} transform={`translate(${cx} 56)`}>
            <rect x="-20" y="-6" width="40" height="20" fill={C.card} />
            <g transform={`rotate(${f * 23 + i * 40})`}>
              <line x1="-13" y1="0" x2="13" y2="0" strokeWidth={4} />
              <line x1="0" y1="-5" x2="0" y2="5" strokeWidth={4} />
            </g>
          </g>
        );
      })}
      {hot && <rect x="6" y="70" width={W - 12} height="10" fill={C.hum} stroke="none" />}
    </Svg>
  );
};

export const Rack: React.FC<P> = ({s = 200, f = 0}) => (
  <Svg s={s} w={0.55}>
    <rect x="8" y="6" width="94" height="188" fill="#2A2724" />
    {Array.from({length: 11}, (_, i) => (
      <g key={i}>
        <rect x="16" y={14 + i * 16.5} width="78" height="12" fill="#3A3632" stroke="#12100E" strokeWidth={2} />
        {[0, 1, 2].map((j) => {
          const on = Math.sin(f * (0.3 + j * 0.17) + i * 1.7 + j * 2.1) > 0.2;
          return <circle key={j} cx={78 + j * 6} cy={20 + i * 16.5} r={1.8} fill={on ? (j === 2 && i % 4 === 1 ? C.hum : '#CFE8C8') : '#554F48'} stroke="none" />;
        })}
      </g>
    ))}
  </Svg>
);

export const Chip: React.FC<P> = ({s = 160, hot = true}) => (
  <Svg s={s}>
    {Array.from({length: 6}, (_, i) => (
      <g key={i} strokeWidth={4}>
        <line x1={52 + i * 19} y1="22" x2={52 + i * 19} y2="42" />
        <line x1={52 + i * 19} y1="158" x2={52 + i * 19} y2="178" />
        <line x1="22" y1={52 + i * 19} x2="42" y2={52 + i * 19} />
        <line x1="158" y1={52 + i * 19} x2="178" y2={52 + i * 19} />
      </g>
    ))}
    <rect x="40" y="40" width="120" height="120" rx="6" fill="#2A2724" />
    <rect x="68" y="68" width="64" height="64" fill={hot ? C.hum : C.card} stroke={C.card} strokeWidth={3} />
  </Svg>
);

export const Phone: React.FC<P> = ({s = 160}) => (
  <Svg s={s} w={0.55}>
    <rect x="8" y="6" width="94" height="188" rx="14" />
    <rect x="16" y="22" width="78" height="150" rx="3" fill="#E8E3D8" />
    <line x1="44" y1="183" x2="66" y2="183" />
  </Svg>
);

export const Cloud: React.FC<P> = ({s = 200}) => (
  <Svg s={s} h={0.6} vb="0 0 200 120">
    <path d="M45 105 C15 105 10 70 38 64 C35 35 72 25 88 45 C98 20 145 20 150 55 C182 52 192 102 158 105 Z" />
  </Svg>
);

export const Bolt: React.FC<P> = ({s = 120, hot = true}) => (
  <Svg s={s}>
    <path d="M115 12 L45 112 L95 112 L78 188 L155 80 L105 80 Z" fill={hot ? C.hum : C.card} />
  </Svg>
);

export const Drop: React.FC<P> = ({s = 120, hot}) => (
  <Svg s={s}>
    <path d="M100 14 C100 14 40 90 40 128 C40 162 68 188 100 188 C132 188 160 162 160 128 C160 90 100 14 100 14 Z" fill={hot ? C.hum : '#E1DCD1'} />
    <path d="M72 128 C72 146 82 158 96 162" fill="none" stroke={C.card} strokeWidth={7} />
  </Svg>
);

export const Turbine: React.FC<P> = ({s = 180, f = 0, hot}) => (
  <Svg s={s}>
    <rect x="20" y="110" width="140" height="62" rx="8" fill="#E4DED2" />
    <rect x="130" y="40" width="26" height="72" />
    <line x1="40" y1="130" x2="110" y2="130" stroke={C.mute} strokeWidth={3} />
    <line x1="40" y1="150" x2="110" y2="150" stroke={C.mute} strokeWidth={3} />
    {[0, 1, 2].map((i) => {
      const t = ((f * 0.9 + i * 22) % 66) / 66;
      return <circle key={i} cx={143 + t * 20} cy={32 - t * 50} r={8 + t * 16} fill={hot ? 'rgba(90,85,76,0.25)' : 'rgba(163,156,144,0.3)'} stroke="none" />;
    })}
    <rect x="12" y="172" width="156" height="10" fill={C.ink} />
  </Svg>
);

export const Gavel: React.FC<P> = ({s = 160}) => (
  <Svg s={s}>
    <g transform="rotate(-35 100 100)">
      <rect x="45" y="50" width="90" height="44" rx="6" fill="#C9B79A" />
      <rect x="84" y="94" width="14" height="92" fill="#C9B79A" />
    </g>
    <rect x="24" y="168" width="110" height="18" fill="#E4DED2" />
  </Svg>
);

export const Bill: React.FC<P & {up?: boolean}> = ({s = 170, up = true}) => (
  <Svg s={s} w={0.8}>
    <path d="M10 8 L150 8 L150 192 L130 180 L110 192 L90 180 L70 192 L50 180 L30 192 L10 180 Z" />
    <rect x="26" y="26" width="60" height="10" fill={C.ink} stroke="none" />
    {[56, 74, 92, 110].map((y) => (
      <line key={y} x1="26" y1={y} x2="134" y2={y} stroke={C.mute} strokeWidth={3} />
    ))}
    <text x="26" y="160" fontFamily="IBM Plex Mono" fontSize="26" fill={C.ink} stroke="none">TOTAL</text>
    <text x="134" y="160" textAnchor="end" fontFamily="Fraunces" fontWeight="900" fontSize="34" fill={up ? C.hum : C.ink} stroke="none">{up ? '↑$' : '$'}</text>
  </Svg>
);

export const Well: React.FC<P & {dry?: boolean}> = ({s = 180, dry}) => (
  <Svg s={s}>
    <line x1="40" y1="30" x2="40" y2="120" />
    <line x1="160" y1="30" x2="160" y2="120" />
    <path d="M28 34 L100 10 L172 34" fill="none" />
    <line x1="40" y1="52" x2="160" y2="52" />
    <line x1="100" y1="52" x2="100" y2="92" strokeWidth={3} />
    <path d="M84 92 L116 92 L112 118 L88 118 Z" fill="#C9B79A" />
    <rect x="28" y="120" width="144" height="62" fill="#E4DED2" />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={28} y1={140 + i * 20} x2={172} y2={140 + i * 20} stroke={C.mute} strokeWidth={3} />
    ))}
    {dry && <text x="100" y="112" textAnchor="middle" fontFamily="Caveat" fontWeight="600" fontSize="30" fill={C.hum} stroke="none">dry</text>}
  </Svg>
);

export const Fan: React.FC<P> = ({s = 140, f = 0}) => (
  <Svg s={s}>
    <circle cx="100" cy="100" r="86" fill="#E4DED2" />
    <g transform={`rotate(${f * 19} 100 100)`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} transform={`rotate(${a} 100 100)`} d="M100 100 C120 70 140 40 118 24 C96 30 92 70 100 100 Z" fill={C.card} />
      ))}
    </g>
    <circle cx="100" cy="100" r="12" fill={C.ink} />
  </Svg>
);

export const Money: React.FC<P> = ({s = 170}) => (
  <Svg s={s} h={0.7} vb="0 0 200 140">
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(${i * 4} ${100 - i * 26})`}>
        <rect x="10" y="0" width="170" height="36" fill="#E6E2D2" />
        <circle cx="95" cy="18" r="11" fill="none" strokeWidth={3} />
      </g>
    ))}
  </Svg>
);

export const Person: React.FC<P & {outline?: boolean; hat?: boolean}> = ({s = 80, outline, hat}) => (
  <Svg s={s} w={0.5}>
    <circle cx="50" cy="44" r="26" fill={outline ? 'none' : C.ink2} stroke={C.ink2} strokeDasharray={outline ? '8 7' : undefined} />
    <path d="M10 190 C10 120 30 86 50 86 C70 86 90 120 90 190 Z" fill={outline ? 'none' : C.ink2} stroke={C.ink2} strokeDasharray={outline ? '8 7' : undefined} />
    {hat && <path d="M20 36 C22 8 78 8 80 36 L88 38 L12 38 Z" fill={C.hum} stroke={C.ink} strokeWidth={3} />}
  </Svg>
);

export const Globe: React.FC<P> = ({s = 170, f = 0}) => (
  <Svg s={s}>
    <circle cx="100" cy="100" r="84" fill="#E8E3D8" />
    {[-1, 0, 1].map((i) => (
      <ellipse key={i} cx="100" cy="100" rx={Math.abs(Math.cos(f / 40 + i)) * 84} ry="84" fill="none" strokeWidth={3} stroke={C.mute} />
    ))}
    <line x1="16" y1="100" x2="184" y2="100" strokeWidth={3} stroke={C.mute} />
    <ellipse cx="100" cy="60" rx="72" ry="10" fill="none" strokeWidth={3} stroke={C.mute} />
    <ellipse cx="100" cy="140" rx="72" ry="10" fill="none" strokeWidth={3} stroke={C.mute} />
    <circle cx="100" cy="100" r="84" fill="none" />
  </Svg>
);

export const Seat: React.FC<P & {taken?: boolean}> = ({s = 70, taken}) => (
  <Svg s={s}>
    <rect x="40" y="20" width="120" height="100" rx="14" fill={taken ? C.hum : '#E4DED2'} />
    <rect x="30" y="110" width="140" height="40" rx="8" fill={taken ? C.hum : '#E4DED2'} />
    <line x1="50" y1="150" x2="50" y2="185" />
    <line x1="150" y1="150" x2="150" y2="185" />
  </Svg>
);

export const Pylon: React.FC<P> = ({s = 200}) => (
  <Svg s={s} w={0.8}>
    <g fill="none">
      <path d="M80 8 L40 192 M80 8 L120 192 M55 120 L105 120 M62 80 L98 80 M48 160 L112 160 M55 120 L98 80 M105 120 L62 80 M48 160 L105 120 M112 160 L55 120" />
      <path d="M20 50 L140 50 M34 90 L126 90" />
    </g>
  </Svg>
);

export const Contract: React.FC<P> = ({s = 170}) => (
  <Svg s={s} w={0.78}>
    <rect x="8" y="6" width="140" height="188" />
    <rect x="24" y="24" width="80" height="12" fill={C.ink} stroke="none" />
    {[56, 72, 88, 104, 120].map((y) => (
      <line key={y} x1="24" y1={y} x2="132" y2={y} stroke={C.mute} strokeWidth={3} />
    ))}
    <path d="M28 166 C40 150 50 175 62 158 C70 148 76 170 92 160" fill="none" stroke={C.hum} strokeWidth={4} />
    <line x1="24" y1="176" x2="132" y2="176" strokeWidth={3} />
  </Svg>
);

export const Scale: React.FC<P & {tilt?: number}> = ({s = 220, tilt = 0}) => (
  <Svg s={s}>
    <line x1="100" y1="30" x2="100" y2="180" />
    <rect x="60" y="178" width="80" height="12" fill={C.ink} />
    <g transform={`rotate(${tilt} 100 40)`}>
      <line x1="20" y1="40" x2="180" y2="40" />
      <path d="M20 40 L2 100 L38 100 Z M180 40 L162 100 L198 100 Z" fill="none" strokeWidth={3} />
      <path d="M0 100 Q20 122 40 100 Z M160 100 Q180 122 200 100 Z" fill="#E4DED2" />
    </g>
  </Svg>
);

export const Speaker: React.FC<P> = ({s = 140, f = 0}) => (
  <Svg s={s}>
    <path d="M30 80 L60 80 L100 45 L100 155 L60 120 L30 120 Z" fill="#E4DED2" />
    {[0, 1, 2].map((i) => {
      const o = 0.3 + 0.7 * Math.abs(Math.sin(f / 8 - i * 0.6));
      return <path key={i} d={`M${120 + i * 22} ${70 - i * 16} Q${140 + i * 28} 100 ${120 + i * 22} ${130 + i * 16}`} fill="none" stroke={C.hum} opacity={o} />;
    })}
  </Svg>
);

export const Factory: React.FC<P & {f?: number}> = ({s = 200, f = 0}) => (
  <Svg s={s}>
    <path d="M10 185 L10 100 L55 75 L55 100 L100 75 L100 100 L145 75 L145 185 Z" fill="#E4DED2" />
    <rect x="152" y="40" width="26" height="145" />
    {[0, 1].map((i) => {
      const t = ((f * 0.7 + i * 30) % 60) / 60;
      return <circle key={i} cx={165 + t * 18} cy={30 - t * 40} r={9 + t * 12} fill="rgba(163,156,144,0.35)" stroke="none" />;
    })}
  </Svg>
);

export const Tree: React.FC<P> = ({s = 150}) => (
  <Svg s={s}>
    <rect x="92" y="120" width="16" height="66" fill="#C9B79A" />
    <circle cx="100" cy="85" r="58" fill="#D8D2C2" />
    <circle cx="70" cy="100" r="34" fill="#D8D2C2" />
    <circle cx="134" cy="104" r="30" fill="#D8D2C2" />
  </Svg>
);

export const Ear: React.FC<P> = ({s = 140}) => (
  <Svg s={s}>
    <path d="M70 150 C40 150 40 110 55 95 C35 60 60 20 100 20 C150 20 165 70 140 100 C125 118 118 125 112 150 C108 175 85 185 70 170" fill="#E8E3D8" />
    <path d="M78 95 C75 60 125 55 122 88" fill="none" />
  </Svg>
);

export const Folder: React.FC<P & {label?: string}> = ({s = 220, label = 'PROJECT BLUE'}) => (
  <Svg s={s} h={0.75} vb="0 0 200 150">
    <path d="M6 20 L70 20 L84 34 L194 34 L194 144 L6 144 Z" fill="#D9C9A6" />
    <g transform="rotate(-8 100 90)">
      <rect x="34" y="70" width="132" height="40" fill="none" stroke={C.hum} strokeWidth={4} />
      <text x="100" y="98" textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight="500" fontSize="17" fill={C.hum} stroke="none" letterSpacing="2">{label}</text>
    </g>
  </Svg>
);

export const CoolingTower: React.FC<P> = ({s = 200, f = 0}) => (
  <Svg s={s}>
    <path d="M50 185 C65 130 65 90 55 40 L145 40 C135 90 135 130 150 185 Z" fill="#E4DED2" />
    {[0, 1, 2, 3].map((i) => {
      const t = ((f * 0.6 + i * 17) % 68) / 68;
      return <circle key={i} cx={80 + i * 14 + t * 10} cy={34 - t * 60} r={12 + t * 18} fill="rgba(200,195,186,0.55)" stroke="none" />;
    })}
  </Svg>
);

export const Plant: React.FC<P> = ({s = 180}) => (
  <Svg s={s}>
    <rect x="20" y="100" width="110" height="85" fill="#E4DED2" />
    <rect x="140" y="40" width="22" height="145" />
    <rect x="40" y="120" width="20" height="20" />
    <rect x="80" y="120" width="20" height="20" />
    <path d="M10 185 L190 185" />
  </Svg>
);

export const Pause: React.FC<P> = ({s = 150}) => (
  <Svg s={s}>
    <circle cx="100" cy="100" r="84" fill={C.card} stroke={C.hum} />
    <rect x="70" y="60" width="20" height="80" fill={C.hum} stroke="none" />
    <rect x="110" y="60" width="20" height="80" fill={C.hum} stroke="none" />
  </Svg>
);

export const Coin: React.FC<P & {label?: string}> = ({s = 140, label = '$1'}) => (
  <Svg s={s}>
    <circle cx="100" cy="100" r="80" fill="#E6D9B4" />
    <circle cx="100" cy="100" r="64" fill="none" strokeWidth={3} />
    <text x="100" y="118" textAnchor="middle" fontFamily="Fraunces" fontWeight="900" fontSize={label.length > 3 ? 40 : 52} fill={C.ink} stroke="none">{label}</text>
  </Svg>
);

export const Flag: React.FC<P> = ({s = 120}) => (
  <Svg s={s}>
    <line x1="50" y1="20" x2="50" y2="186" />
    <path d="M50 26 L160 46 L50 70 Z" fill="#E4DED2" />
    <rect x="30" y="178" width="40" height="10" fill={C.ink} />
  </Svg>
);

export const Hall: React.FC<P> = ({s = 200}) => (
  <Svg s={s}>
    <path d="M20 70 L100 22 L180 70 Z" fill="#E4DED2" />
    <rect x="20" y="70" width="160" height="14" />
    {[38, 72, 106, 140].map((x) => (
      <rect key={x} x={x} y="84" width="18" height="80" />
    ))}
    <rect x="12" y="164" width="176" height="20" fill="#E4DED2" />
  </Svg>
);

export const Pipe: React.FC<P & {len?: number}> = ({s = 60, len = 6, f = 0}) => (
  <svg width={s * len} height={s} viewBox={`0 0 ${200 * len} 200`} style={{overflow: 'visible', display: 'block'}}>
    <rect x="0" y="60" width={200 * len} height="80" fill="#E4DED2" stroke={C.ink} strokeWidth={sw} />
    {Array.from({length: len * 2}, (_, i) => {
      const x = ((i * 100 + f * 12) % (200 * len)) | 0;
      return <path key={i} d={`M${x} 100 q 20 -22 40 0 t 40 0`} fill="none" stroke={C.hum} strokeWidth={8} opacity={0.8} />;
    })}
  </svg>
);

export const Heat: React.FC<P> = ({s = 160, f = 0}) => (
  <Svg s={s}>
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${60 + i * 40} 180 C${40 + i * 40} 140 ${80 + i * 40} 120 ${60 + i * 40} 80 C${40 + i * 40} 50 ${70 + i * 40} 30 ${60 + i * 40} 14`} fill="none" stroke={C.hum} strokeWidth={6} opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 10 + i))} />
    ))}
  </Svg>
);

export const Clock: React.FC<P> = ({s = 140, f = 0}) => (
  <Svg s={s}>
    <circle cx="100" cy="100" r="82" />
    <line x1="100" y1="100" x2={100 + 40 * Math.sin(f / 30)} y2={100 - 40 * Math.cos(f / 30)} />
    <line x1="100" y1="100" x2={100 + 62 * Math.sin(f / 2.5)} y2={100 - 62 * Math.cos(f / 2.5)} strokeWidth={3} stroke={C.hum} />
    <circle cx="100" cy="100" r="6" fill={C.ink} />
  </Svg>
);

export const HardHat: React.FC<P> = ({s = 120}) => (
  <Svg s={s}>
    <path d="M30 130 C30 60 170 60 170 130 Z" fill={C.hum} />
    <rect x="16" y="128" width="168" height="18" rx="6" fill={C.hum} />
    <line x1="100" y1="66" x2="100" y2="128" stroke={C.card} strokeWidth={6} />
  </Svg>
);
