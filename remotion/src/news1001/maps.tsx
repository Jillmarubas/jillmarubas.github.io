import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, random, staticFile, useCurrentFrame} from 'remotion';
import {geoEqualEarth, geoIdentity, geoPath} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import {C, F} from './design';
import {e01} from './kit';

/* Paper maps from public-domain Natural Earth / Census shapes (public/dc/geo). */
type FC = FeatureCollection<Geometry, Record<string, unknown>>;
const cache: Record<string, FC> = {};
const useGeo = (name: string) => {
  const [g, setG] = useState<FC | null>(cache[name] ?? null);
  const [h] = useState(() => (cache[name] ? null : delayRender(`geo ${name}`)));
  useEffect(() => {
    if (cache[name]) return;
    fetch(staticFile(`dc/geo/${name}.json`))
      .then((r) => r.json())
      .then((j) => {
        cache[name] = j;
        setG(j);
        if (h !== null) continueRender(h);
      });
  }, [name, h]);
  return g;
};

const nameOf = (f: Feature<Geometry, Record<string, unknown>>) => String(f.properties?.name ?? f.properties?.NAME ?? f.id ?? '');

/** World map: every country in paper tones, the named ones lifted in colour, with red threads between points. */
export const WorldMap: React.FC<{w: number; h: number; at: number; hi?: Record<string, string>; threads?: {from: [number, number]; to: [number, number]; at: number}[]; pins?: {lon: number; lat: number; at: number}[]; center?: [number, number]; scale?: number}> = ({
  w,
  h,
  at,
  hi = {},
  threads = [],
  pins = [],
  center = [10, 25],
  scale = 1,
}) => {
  const f = useCurrentFrame();
  const geo = useGeo('world');
  if (!geo) return null;
  const proj = geoEqualEarth().rotate([-center[0], 0]).fitExtent([[10, 10], [w - 10, h - 10]], geo);
  proj.scale(proj.scale() * scale);
  const path = geoPath(proj);
  // the map is printed on its sheet: anything past the edge is trimmed, never spills onto the desk
  return (
    <svg width={w} height={h} style={{overflow: 'hidden', display: 'block'}}>
      {geo.features.map((ft, i) => {
        const n = nameOf(ft);
        const c = hi[n];
        const o = e01(f, at + (random(`w${i}`) * 10), 10);
        return <path key={i} d={path(ft) ?? ''} fill={c ?? '#DCD3C2'} stroke={C.card} strokeWidth={0.8} opacity={c ? 1 : o} />;
      })}
      {threads.map((t, i) => {
        const a = proj(t.from)!;
        const b = proj(t.to)!;
        const mx = (a[0] + b[0]) / 2;
        const my = Math.min(a[1], b[1]) - Math.abs(a[0] - b[0]) * 0.25;
        const k = e01(f, t.at, 16);
        return <path key={i} d={`M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`} fill="none" stroke={C.red} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />;
      })}
      {pins.map((p, i) => {
        const pt = proj([p.lon, p.lat]);
        if (!pt || f < p.at) return null;
        const k = e01(f, p.at, 6);
        return (
          <g key={i} transform={`translate(${pt[0]},${pt[1] - (1 - k) * 30})`} opacity={k}>
            <circle r={9} fill={C.red} stroke={C.card} strokeWidth={2.5} />
          </g>
        );
      })}
    </svg>
  );
};

/** US states (pre-projected Albers), paper style, with optional pins (pre-projected x/y in the 975×610 space). */
export const USMap: React.FC<{w: number; at: number; dots?: number; dotsAt?: number}> = ({w, at, dots = 0, dotsAt = 0}) => {
  const f = useCurrentFrame();
  const geo = useGeo('states');
  if (!geo) return null;
  const h = w * 0.63;
  const proj = geoIdentity().fitExtent([[0, 0], [w, h]], geo);
  const path = geoPath(proj);
  const shown = Math.floor(dots * e01(f, dotsAt, 30));
  // dots scattered inside the bounding shape (deterministic), only where a state is under them
  const pts: [number, number][] = [];
  for (let i = 0; pts.length < shown && i < dots * 6; i++) {
    const x = random(`ux${i}`) * w;
    const y = random(`uy${i}`) * h;
    pts.push([x, y]);
  }
  return (
    <svg width={w} height={h} style={{overflow: 'visible'}}>
      {geo.features.map((ft, i) => (
        <path key={i} d={path(ft) ?? ''} fill="#DCD3C2" stroke={C.card} strokeWidth={1.2} opacity={e01(f, at + random(`s${i}`) * 12, 10)} />
      ))}
      <g clipPath="url(#usclip)">
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.2} fill={C.red} opacity={0.75} />
        ))}
      </g>
      <defs>
        <clipPath id="usclip">
          {geo.features.map((ft, i) => (
            <path key={i} d={path(ft) ?? ''} />
          ))}
        </clipPath>
      </defs>
      <text x={w - 10} y={h + 26} textAnchor="end" fontFamily={F.mono} fontSize={13} fill={C.mute}>
        MAP: U.S. CENSUS (PUBLIC DOMAIN)
      </text>
    </svg>
  );
};
