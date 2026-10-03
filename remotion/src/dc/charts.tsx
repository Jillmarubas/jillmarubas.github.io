import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F} from './design';
import {e01, settle} from './kit';

/*
 * Charts follow the dataviz skill: one axis, thin marks with 4 px rounded data-ends on the
 * baseline, a 2 px paper gap between fills, labels in ink (never the series colour), the accent
 * reserved for the one mark the narration is about, recessive grid, direct labels.
 */
const mono: React.CSSProperties = {fontFamily: F.mono, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase'};

export type BarDatum = {label: string; value: number; show?: string; hot?: boolean; at?: number};
export const Bars: React.FC<{data: BarDatum[]; max: number; w: number; h: number; at: number; stagger?: number; cap?: {value: number; label: string; at: number}; barW?: number}> = ({
  data,
  max,
  w,
  h,
  at,
  stagger = 10,
  cap,
  barW = 110,
}) => {
  const f = useCurrentFrame();
  const gap = (w - data.length * barW) / (data.length + 1);
  const y = (v: number) => h - (v / max) * h;
  return (
    <div style={{position: 'relative', width: w, height: h + 70}}>
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={0} x2={w} y1={h - g * h} y2={h - g * h} stroke={C.mute} strokeWidth={1} opacity={0.5 * e01(f, at, 20)} strokeDasharray="4 8" />
        ))}
        <line x1={0} x2={w * e01(f, at, 20)} y1={h} y2={h} stroke={C.ink} strokeWidth={2} />
        {data.map((d, i) => {
          const a = d.at ?? at + 8 + i * stagger;
          const k = settle((f - a) / 34);
          const bh = (d.value / max) * h * k;
          const x = gap + i * (barW + gap);
          return <path key={i} d={`M${x},${h} L${x},${h - bh + 4} Q${x},${h - bh} ${x + 4},${h - bh} L${x + barW - 4},${h - bh} Q${x + barW},${h - bh} ${x + barW},${h - bh + 4} L${x + barW},${h} Z`} fill={d.hot ? C.hum : C.rest} />;
        })}
        {cap && (
          <g opacity={e01(f, cap.at, 12)}>
            <line x1={-20} x2={w + 20} y1={y(cap.value)} y2={y(cap.value)} stroke={C.hum} strokeWidth={3} strokeDasharray="12 8" />
            <text x={-20} y={y(cap.value) - 12} textAnchor="start" fill={C.hum} style={{...mono, fontSize: 20}}>
              {cap.label}
            </text>
          </g>
        )}
      </svg>
      {data.map((d, i) => {
        const a = d.at ?? at + 8 + i * stagger;
        const k = settle((f - a) / 34);
        const x = gap + i * (barW + gap);
        const v = d.value * k;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x - 40, width: barW + 80, top: h - (v / max) * h - 62, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 46, color: C.ink, opacity: e01(f, a + 6, 10)}}>
              {d.show ? (k >= 0.999 ? d.show : '$' + v.toFixed(v < 100 ? 2 : 0)) : v.toFixed(1)}
            </div>
            <div style={{position: 'absolute', left: x - 40, width: barW + 80, top: h + 14, textAlign: 'center', ...mono, fontSize: 20, color: C.ink2, opacity: e01(f, a, 10)}}>{d.label}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** One share of a whole, as a thin donut: the share in the accent, the rest recessive. */
export const Donut: React.FC<{share: number; at: number; size?: number; label: string; sub?: string}> = ({share, at, size = 420, label, sub}) => {
  const f = useCurrentFrame();
  const k = settle((f - at) / 45);
  const r = size / 2 - 30;
  const c = 2 * Math.PI * r;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.rest} strokeWidth={46} opacity={0.45 * e01(f, at - 10, 14)} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.hum} strokeWidth={46} strokeDasharray={`${Math.max(0, c * share * k - 2)} ${c}`} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: size * 0.24, color: C.ink, lineHeight: 1}}>{Math.round(share * 100 * k)}%</div>
        <div style={{...mono, fontSize: 20, color: C.ink2, marginTop: 10, textAlign: 'center', maxWidth: size * 0.6}}>{label}</div>
        {sub && <div style={{...mono, fontSize: 16, color: C.mute, marginTop: 6}}>{sub}</div>}
      </div>
    </div>
  );
};

/** A range on one axis (e.g. "rates rose 5–44 %"). */
export const RangeBar: React.FC<{from: number; to: number; max: number; w: number; at: number; unit?: string; caption: string}> = ({from, to, max, w, at, unit = '%', caption}) => {
  const f = useCurrentFrame();
  const k = settle((f - at) / 40);
  const x0 = (from / max) * w;
  const x1 = x0 + ((to - from) / max) * w * k;
  return (
    <div style={{position: 'relative', width: w, height: 180}}>
      <svg width={w} height={100} style={{overflow: 'visible'}}>
        <line x1={0} x2={w} y1={60} y2={60} stroke={C.mute} strokeWidth={2} />
        {[0, 10, 20, 30, 40, 50].map((t) => (
          <g key={t}>
            <line x1={(t / max) * w} x2={(t / max) * w} y1={52} y2={68} stroke={C.mute} strokeWidth={2} />
            <text x={(t / max) * w} y={100} textAnchor="middle" fill={C.ink2} style={{...mono, fontSize: 18}}>
              {t}
              {unit}
            </text>
          </g>
        ))}
        <rect x={x0} y={42} width={Math.max(0, x1 - x0)} height={36} rx={4} fill={C.hum} />
        <circle cx={x0} cy={60} r={12} fill={C.ink} opacity={e01(f, at, 8)} />
        <circle cx={x1} cy={60} r={12} fill={C.ink} opacity={e01(f, at + 30, 8)} />
        <text x={x0} y={24} textAnchor="middle" fill={C.ink} style={{fontFamily: F.display, fontWeight: 900, fontSize: 40}} opacity={e01(f, at, 10)}>
          {from}
          {unit}
        </text>
        <text x={x1} y={24} textAnchor="middle" fill={C.ink} style={{fontFamily: F.display, fontWeight: 900, fontSize: 40}} opacity={e01(f, at + 30, 10)}>
          {Math.round(from + (to - from) * k)}
          {unit}
        </text>
      </svg>
      <div style={{...mono, fontSize: 20, color: C.ink2, marginTop: 20}}>{caption}</div>
    </div>
  );
};

/** A single line over time, drawn on; the last point gets the accent. */
export const LineChart: React.FC<{pts: {x: string; y: number}[]; min: number; max: number; w: number; h: number; at: number; fmt: (v: number) => string}> = ({pts, min, max, w, h, at, fmt}) => {
  const f = useCurrentFrame();
  const k = e01(f, at, 60);
  const X = (i: number) => (i / (pts.length - 1)) * w;
  const Y = (v: number) => h - ((v - min) / (max - min)) * h;
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i)},${Y(p.y)}`).join(' ');
  const last = pts.length - 1;
  return (
    <svg width={w} height={h + 60} style={{overflow: 'visible'}}>
      <line x1={0} x2={w} y1={h} y2={h} stroke={C.ink} strokeWidth={2} />
      <path d={d} fill="none" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      {[0, last].map((i) => (
        <g key={i} opacity={e01(f, at + (i ? 58 : 0), 10)}>
          <circle cx={X(i)} cy={Y(pts[i].y)} r={10} fill={i ? C.hum : C.ink} stroke={C.card} strokeWidth={3} />
          <text x={X(i)} y={Y(pts[i].y) - 24} textAnchor={i ? 'end' : 'start'} fill={C.ink} style={{fontFamily: F.display, fontWeight: 900, fontSize: 44}}>
            {fmt(pts[i].y)}
          </text>
        </g>
      ))}
      {pts.map((p, i) =>
        i % Math.ceil(pts.length / 6) === 0 || i === last ? (
          <text key={i} x={X(i)} y={h + 36} textAnchor="middle" fill={C.ink2} style={{...mono, fontSize: 18}} opacity={e01(f, at, 20)}>
            {p.x}
          </text>
        ) : null,
      )}
    </svg>
  );
};

/** A dial reading a fixed share, e.g. "85 % minimum". */
export const Gauge: React.FC<{value: number; at: number; size?: number; label: string; showValue?: boolean}> = ({value, at, size = 380, label, showValue = true}) => {
  const f = useCurrentFrame();
  const k = settle((f - at) / 40) * value;
  const r = size / 2 - 30;
  const ang = Math.PI * (1 - k);
  const arc = (a0: number, a1: number) => `M${size / 2 + r * Math.cos(a0)},${size / 2 - r * Math.sin(a0)} A${r},${r} 0 0 1 ${size / 2 + r * Math.cos(a1)},${size / 2 - r * Math.sin(a1)}`;
  return (
    <div style={{position: 'relative', width: size, height: size * 0.62}}>
      <svg width={size} height={size * 0.62} style={{overflow: 'visible'}}>
        <path d={arc(Math.PI, 0)} fill="none" stroke={C.rest} strokeOpacity={0.4} strokeWidth={34} />
        <path d={arc(Math.PI, Math.max(ang, 0.0001))} fill="none" stroke={C.hum} strokeWidth={34} />
        <line x1={size / 2} y1={size / 2} x2={size / 2 + (r - 60) * Math.cos(ang)} y2={size / 2 - (r - 60) * Math.sin(ang)} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <circle cx={size / 2} cy={size / 2} r={12} fill={C.ink} />
      </svg>
      {showValue && <div style={{position: 'absolute', left: 0, right: 0, top: size * 0.52, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: size * 0.2, color: C.ink}}>{Math.round(k * 100)}%</div>}
      <div style={{textAlign: 'center', fontFamily: F.mono, fontSize: 20, color: C.ink2, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: showValue ? size * 0.2 : 8}}>{label}</div>
    </div>
  );
};
