import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, random, staticFile, useCurrentFrame} from 'remotion';
import {geoAlbersUsa, geoIdentity, geoMercator, geoPath} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import {C, F} from './design';
import {e01} from './kit';

/*
 * Maps from public-domain Census / Natural Earth shapes (us-atlas, world-atlas). US states and
 * counties are pre-projected (Albers USA, 975×610), so they're fitted with an identity projection;
 * lon/lat pins go through the same Albers USA projection and then the same fit.
 */
type FC = FeatureCollection<Geometry, Record<string, unknown>>;
const cache: Record<string, FC> = {};
const useGeo = (name: string) => {
  const [g, setG] = useState<FC | null>(cache[name] ?? null);
  const [h] = useState(() => (cache[name] ? null : delayRender(`geo ${name}`)));
  useEffect(() => {
    if (cache[name]) return;
    const load = async (n = 0): Promise<void> => {
      try {
        const r = await fetch(staticFile(`dc/geo/${name}.json`));
        cache[name] = await r.json();
        setG(cache[name]);
        if (h !== null) continueRender(h);
      } catch (e) {
        if (n < 5) return new Promise((res) => setTimeout(() => res(load(n + 1)), 500 * 2 ** n));
        throw e;
      }
    };
    load();
  }, [name, h]);
  return g;
};

const albers = geoAlbersUsa().scale(1300).translate([487.5, 305]);

/** Planar point-in-polygon for the pre-projected shapes. */
const inside = (pt: [number, number], geom: Geometry): boolean => {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  let hit = false;
  for (const poly of polys)
    for (const ring of poly as number[][][]) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) hit = !hit;
      }
    }
  return hit;
};

export type Pin = {lon: number; lat: number; label?: string; at: number; hot?: boolean; side?: 'l' | 'r'};

export const USMap: React.FC<{
  w: number;
  h?: number;
  at: number;
  fill?: Record<string, string>; // state FIPS -> colour
  fillAt?: number;
  dots?: {n: number; at: number; dur?: number; skip?: string[]};
  pins?: Pin[];
  stateLabels?: {id: string; text: string; at: number}[];
}> = ({w, h, at, fill = {}, fillAt, dots, pins = [], stateLabels = []}) => {
  const f = useCurrentFrame();
  const g = useGeo('states');
  if (!g) return null;
  const H = h ?? w * (610 / 975);
  const proj = geoIdentity().fitSize([w, H], g);
  const path = geoPath(proj);
  const k = proj.scale();
  const [tx, ty] = proj.translate();
  const toScreen = (lon: number, lat: number) => {
    const p = albers([lon, lat]);
    return p ? [p[0] * k + tx, p[1] * k + ty] : [0, 0];
  };
  // scattered dots inside states (e.g. opposition groups), deterministic
  const dotPts: [number, number, number][] = [];
  if (dots) {
    const feats = g.features.filter((ft) => Number(ft.id) <= 56 && !(dots.skip ?? []).includes(String(ft.id)));
    let tries = 0;
    while (dotPts.length < dots.n && tries < dots.n * 60) {
      const ft = feats[Math.floor(random(`s${tries}`) * feats.length)];
      const [[x0, y0], [x1, y1]] = geoPath().bounds(ft);
      const p: [number, number] = [x0 + random(`x${tries}`) * (x1 - x0), y0 + random(`y${tries}`) * (y1 - y0)];
      if (inside(p, ft.geometry)) dotPts.push([p[0] * k + tx, p[1] * k + ty, random(`d${tries}`)]);
      tries++;
    }
  }
  return (
    <div style={{position: 'relative', width: w, height: H}}>
      <svg width={w} height={H} style={{overflow: 'visible'}}>
        {g.features.map((ft, i) => {
          const id = String(ft.id);
          const draw = e01(f, at + (i % 12) * 1.5, 26);
          const col = fill[id];
          const fk = col ? e01(f, fillAt ?? at + 20, 18) : 0;
          return (
            <path
              key={id}
              d={path(ft as Feature) ?? ''}
              fill={col ? col : '#E9E4D9'}
              fillOpacity={col ? 0.25 + 0.75 * fk : draw}
              stroke={C.ink2}
              strokeWidth={1.2}
              strokeOpacity={draw}
            />
          );
        })}
        {dotPts.map(([x, y, r], i) => {
          const a = dots!.at + r * (dots!.dur ?? 40);
          const o = e01(f, a, 6);
          return <circle key={i} cx={x} cy={y} r={4.5 * o} fill={C.hum} opacity={0.9} />;
        })}
      </svg>
      {pins.map((p, i) => {
        const [x, y] = toScreen(p.lon, p.lat);
        const o = e01(f, p.at, 12);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, opacity: o}}>
            <div style={{position: 'absolute', left: -11, top: -11 - (1 - o) * 30, width: 22, height: 22, borderRadius: 11, background: p.hot === false ? C.ink : C.hum, border: `4px solid ${C.card}`}} />
            {p.label && (
              <div style={{position: 'absolute', top: -18, [p.side === 'l' ? 'right' : 'left']: 22, whiteSpace: 'nowrap', fontFamily: F.sans, fontWeight: 700, fontSize: 26, color: C.ink, background: C.card, padding: '2px 10px'}}>{p.label}</div>
            )}
          </div>
        );
      })}
      {stateLabels.map((s) => {
        const ft = g.features.find((x) => String(x.id) === s.id);
        if (!ft) return null;
        const [cx, cy] = path.centroid(ft as Feature);
        return (
          <div key={s.id} style={{position: 'absolute', left: cx, top: cy, transform: 'translate(-50%,-50%)', fontFamily: F.mono, fontSize: 20, fontWeight: 500, color: C.ink, opacity: e01(f, s.at, 10), letterSpacing: '0.08em'}}>
            {s.text}
          </div>
        );
      })}
    </div>
  );
};

/** Virginia's counties, with a few highlighted (FIPS: Loudoun 51107, Prince William 51153). */
export const VAMap: React.FC<{w: number; at: number; fill?: Record<string, string>; fillAt?: number; labels?: {id: string; text: string; at: number; dx?: number; dy?: number}[]; focus?: string[]}> = ({
  w,
  at,
  fill = {},
  fillAt,
  labels = [],
  focus,
}) => {
  const f = useCurrentFrame();
  const g = useGeo('va-counties');
  if (!g) return null;
  const target = focus ? {type: 'FeatureCollection', features: g.features.filter((x) => focus.includes(String(x.id)))} : g;
  const H = w * 0.62;
  const proj = geoIdentity().fitExtent(
    [
      [w * 0.04, H * 0.04],
      [w * 0.96, H * 0.96],
    ],
    target as FC,
  );
  const path = geoPath(proj);
  return (
    <div style={{position: 'relative', width: w, height: H, overflow: 'hidden'}}>
      <svg width={w} height={H}>
        {g.features.map((ft, i) => {
          const id = String(ft.id);
          const col = fill[id];
          const o = e01(f, at + (i % 20), 20);
          return <path key={id} d={path(ft as Feature) ?? ''} fill={col ?? '#E9E4D9'} fillOpacity={col ? e01(f, fillAt ?? at + 20, 16) * 0.85 + 0.15 : o} stroke={C.ink2} strokeWidth={1.4} strokeOpacity={o} />;
        })}
      </svg>
      {labels.map((l) => {
        const ft = g.features.find((x) => String(x.id) === l.id);
        if (!ft) return null;
        const [cx, cy] = path.centroid(ft as Feature);
        return (
          <div key={l.id} style={{position: 'absolute', left: cx + (l.dx ?? 0), top: cy + (l.dy ?? 0), transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap', fontFamily: F.sans, fontWeight: 700, fontSize: 28, color: C.ink, background: C.card, padding: '2px 12px', opacity: e01(f, l.at, 10)}}>
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

/** Part of the world (Mercator crop around `focus` countries by ISO numeric id). */
export const WorldMap: React.FC<{w: number; h: number; at: number; focus: string[]; fill?: Record<string, string>; fillAt?: number; labels?: {id: string; text: string; at: number; dx?: number; dy?: number}[]}> = ({
  w,
  h,
  at,
  focus,
  fill = {},
  fillAt,
  labels = [],
}) => {
  const f = useCurrentFrame();
  const g = useGeo('world');
  if (!g) return null;
  const target = {type: 'FeatureCollection', features: g.features.filter((x) => focus.includes(String(x.id)))} as FC;
  const proj = geoMercator().fitExtent(
    [
      [w * 0.12, h * 0.12],
      [w * 0.88, h * 0.88],
    ],
    target,
  );
  const path = geoPath(proj);
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden'}}>
      <svg width={w} height={h}>
        {g.features.map((ft) => {
          const id = String(ft.id);
          const col = fill[id];
          const d = path(ft as Feature);
          if (!d) return null;
          return <path key={id + (ft.properties?.name as string)} d={d} fill={col ?? '#E9E4D9'} fillOpacity={col ? 0.2 + 0.8 * e01(f, fillAt ?? at + 20, 16) : e01(f, at, 20)} stroke={C.ink2} strokeWidth={1.2} strokeOpacity={e01(f, at, 20)} />;
        })}
      </svg>
      {labels.map((l) => {
        const ft = g.features.find((x) => String(x.id) === l.id);
        if (!ft) return null;
        const [cx, cy] = path.centroid(ft as Feature);
        return (
          <div key={l.id} style={{position: 'absolute', left: cx + (l.dx ?? 0), top: cy + (l.dy ?? 0), transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap', fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: C.ink, background: C.card, padding: '2px 12px', opacity: e01(f, l.at, 10)}}>
            {l.text}
          </div>
        );
      })}
    </div>
  );
};
