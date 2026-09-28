import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import credits from '../../public/photos/credits.json';
import {BLUR_IN, C, DUR, F, R, RISE, STAGGER, depart, glide, settle, snap} from '../theme';
import {RollingNumber} from './Kinetic';
import {PERF} from '../perf';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = (local: number, a: number, b: number, easing = settle) => interpolate(local, [a, b], [0, 1], {...clamp, easing});

type Credits = Record<string, {artist: string; license: string}>;
const credit = (key: string) => {
  const c = (credits as Credits)[key];
  return c ? `Photo: ${c.artist} · ${c.license} · Wikimedia Commons` : '';
};

// Settle eyebrow: mono, small, sentence case, a dot in front.
export const Label: React.FC<{children: React.ReactNode; color?: string; dot?: string; style?: React.CSSProperties}> = ({
  children,
  color = C.onNight2,
  dot,
  style,
}) => (
  <div style={{fontFamily: F.mono, fontWeight: 400, fontSize: 18, letterSpacing: '0.02em', color, display: 'flex', alignItems: 'center', gap: 12, ...style}}>
    {dot ? <span style={{width: 9, height: 9, borderRadius: 5, background: dot, flex: 'none'}} /> : null}
    {children}
  </div>
);

// A frosted-glass surface: backdrop blur over the moving gradient, a translucent dark fill, a lit
// top rim and depth. `nested` boxes (rows, nodes inside a panel) get fill and rim but no second
// blur: glass on glass re-blurs the blur and turns milky. `raised` marks the active nested box.
export const NightCard: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  radius?: number;
  raised?: boolean;
  nested?: boolean;
}> = ({style, children, radius = R.panel, raised, nested}) => {
  const inner = nested || raised;
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: radius,
        background: inner ? (raised ? 'rgba(242,243,242,.13)' : 'rgba(242,243,242,.055)') : 'linear-gradient(160deg, rgba(242,243,242,.10), rgba(242,243,242,.03) 40%, rgba(6,10,8,.30))',
        backdropFilter: inner || PERF.noBackdrop ? undefined : 'blur(26px) saturate(140%)',
        WebkitBackdropFilter: inner || PERF.noBackdrop ? undefined : 'blur(26px) saturate(140%)',
        border: `1px solid ${raised ? 'rgba(242,243,242,.32)' : inner ? 'rgba(242,243,242,.12)' : 'rgba(242,243,242,.22)'}`,
        boxShadow: inner
          ? 'inset 0 1px 0 rgba(255,255,255,.07)'
          : '0 28px 70px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.18), inset 0 -1px 0 rgba(0,0,0,.3)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Zoom on explain: a box zooms in as it arrives, then pushes in one small step each time an item
// in it is explained. `steps` are the panel-local frames at which items are said.
export const explainZoom = (local: number, steps: number[] = []) => {
  const arrive = 0.86 + 0.14 * ease(local, 0, DUR.slow);
  const push = Math.min(0.06, steps.reduce((z, at) => z + 0.02 * ease(local, at, at + DUR.base, glide), 0));
  return arrive * (1 + push);
};

// The item being explained right now zooms up a little on glide, and settles back once the next
// one takes over.
export const focusZoom = (local: number, at: number, until?: number, amount = 0.05) =>
  1 + amount * ease(local, at, at + DUR.base, glide) * (until === undefined ? 1 : 1 - ease(local, until, until + DUR.base, glide));

// A small Settle pill (the `.pill` in settle-motion.html).
export const Pill: React.FC<{children: React.ReactNode; live?: boolean; style?: React.CSSProperties}> = ({children, live, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: F.mono,
      fontSize: 17,
      padding: '10px 18px',
      borderRadius: 999,
      border: `1px solid ${C.pillEdge}`,
      color: C.onNight2,
      background: 'rgba(0,0,0,.45)',
      backdropFilter: PERF.noBackdrop ? undefined : 'blur(14px)',
      ...style,
    }}
  >
    {live ? <span style={{width: 9, height: 9, borderRadius: 5, background: C.mint}} /> : null}
    {children}
  </div>
);

// ---- photo: a night panel rises (105% → 0, scale .92 → 1, radius 32 → 18) --------------
export const PhotoFull: React.FC<{
  src: string;
  focal?: [number, number];
  zoom?: number;
  framed?: boolean;
  name?: string;
  role?: string;
  caption?: string;
  local: number;
  dur: number;
}> = ({src, focal = [50, 45], zoom = 1, framed, name, role, caption, local, dur}) => {
  const rise = ease(local, 0, DUR.slow);
  const push = interpolate(local, [0, Math.max(dur, 1)], [1.03, 1.1], clamp) * zoom;
  const tag = ease(local, 12, 12 + DUR.base);
  const img = (style: React.CSSProperties) => (
    <Img
      src={staticFile(`photos/${src}.jpg`)}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: `${focal[0]}% ${focal[1]}%`,
        transform: `scale(${push})`,
        transformOrigin: `${focal[0]}% ${focal[1]}%`,
        // near-monochrome, like the rest of the system: photos are graded to grey
        filter: 'grayscale(1) contrast(1.08) brightness(.9)',
        ...style,
      }}
    />
  );
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          ...(framed ? {left: 1060, top: 120, width: 740, height: 840} : {left: 28, top: 28, right: 28, bottom: 28}),
          borderRadius: 32 - 14 * rise,
          overflow: 'hidden',
          background: C.night2,
          border: '1px solid rgba(242,243,242,.18)',
          boxShadow: '0 28px 70px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.18)',
          transform: `translateY(${(1 - rise) * 105}%) scale(${0.92 + 0.08 * rise})`,
        }}
      >
        {img({})}
        {framed ? null : (
          <>
            {/* the words sit lower-left: darken there, and under the top chrome */}
            <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,.1) 50%, rgba(0,0,0,.88) 100%)'}} />
            <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.1) 62%, rgba(0,0,0,0) 100%)'}} />
          </>
        )}
      </div>
      {name || caption ? (
        <div
          style={{
            position: 'absolute',
            ...(framed ? {left: 1092, top: 152} : {left: 120, top: 150}),
            opacity: tag,
            transform: `translateY(${(1 - tag) * RISE.nudge}px)`,
          }}
        >
          <Pill live style={{background: 'rgba(0,0,0,.72)', color: C.onNight, fontFamily: F.sans, fontSize: 26, fontWeight: 500, padding: '12px 22px', letterSpacing: '-0.01em'}}>
            {name ?? caption}
            {role ? <span style={{fontFamily: F.mono, fontSize: 16, color: C.onNight2, marginLeft: 6}}>{role}</span> : null}
          </Pill>
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          right: framed ? 1920 - 1800 : 60,
          ...(framed ? {top: 976} : {bottom: 96}),
          fontFamily: F.mono,
          fontSize: 13,
          color: 'rgba(242,243,242,.62)',
          opacity: ease(local, 16, 32),
        }}
      >
        {credit(src)}
      </div>
    </AbsoluteFill>
  );
};

// ---- the card that holds a graphic in split mode: blur-in, 48 px rise ----------------------
export const PanelShell: React.FC<{label: string; local: number; children: React.ReactNode; live?: boolean; steps?: number[]}> = ({
  label,
  local,
  children,
  live,
  steps,
}) => {
  const p = ease(local, 0, DUR.slow);
  return (
    <div
      style={{
        position: 'absolute',
        left: 1040,
        top: 160,
        width: 760,
        height: 760,
        opacity: p,
        transform: `translateY(${(1 - p) * RISE.card}px) scale(${explainZoom(local, steps)})`,
        transformOrigin: '50% 50%',
        filter: p < 1 ? `blur(${(1 - p) * BLUR_IN}px)` : undefined,
      }}
    >
      <NightCard style={{position: 'absolute', inset: 0, padding: 48, display: 'flex', flexDirection: 'column'}}>
        <Label dot={live ? C.mint : C.onNight2}>{label}</Label>
        <div style={{flex: 1, position: 'relative', marginTop: 34}}>{children}</div>
      </NightCard>
    </div>
  );
};

// A row that blurs in at `at` (panel-local frame).
const Row: React.FC<{local: number; at: number; active?: boolean; zoomAt?: number; zoomUntil?: number; children: React.ReactNode}> = ({
  local,
  at,
  active,
  zoomAt,
  zoomUntil,
  children,
}) => {
  const p = ease(local, at, at + DUR.slow);
  const z = zoomAt === undefined ? 1 : focusZoom(local, zoomAt, zoomUntil);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * RISE.sm}px) scale(${z})`,
        transformOrigin: '0% 50%',
        position: 'relative',
        zIndex: z > 1.001 ? 2 : 1,
        filter: p < 1 ? `blur(${(1 - p) * BLUR_IN}px)` : undefined,
      }}
    >
      <NightCard raised={active} nested radius={18} style={{padding: '18px 22px'}}>
        {children}
      </NightCard>
    </div>
  );
};

// ---- a list: agenda, recap. With `done`, each row ticks to a mint check when said ------------
export const ListPanel: React.FC<{
  label: string;
  items: {k: string; t: string; at: number}[];
  local: number;
  done?: boolean;
}> = ({label, items, local, done}) => {
  const activeIdx = items.reduce((acc, it, i) => (local >= it.at ? i : acc), -1);
  return (
    <PanelShell label={label} local={local} steps={items.map((it) => it.at)}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {items.map((it, i) => {
          const said = local >= it.at;
          const tick = interpolate(local, [it.at + 4, it.at + 4 + DUR.base], [0, 1], {...clamp, easing: snap});
          return (
            <Row key={i} local={local} at={Math.min(it.at, 8 + i * STAGGER.card)} active={i === activeIdx} zoomAt={it.at} zoomUntil={items[i + 1]?.at}>
              <div style={{display: 'flex', gap: 18, alignItems: 'center'}}>
                <div style={{position: 'relative', width: 34, flex: 'none', fontFamily: F.mono, fontSize: 17, color: said ? C.onNight : C.floor}}>
                  {done && tick > 0 ? (
                    <div style={{width: 30, height: 30, borderRadius: 15, background: C.mint, color: C.mintInk, display: 'grid', placeItems: 'center', fontFamily: F.sans, fontWeight: 700, fontSize: 18, transform: `scale(${tick})`}}>
                      ✓
                    </div>
                  ) : (
                    String(i + 1).padStart(2, '0')
                  )}
                </div>
                <div style={{minWidth: 0}}>
                  <div style={{fontFamily: F.mono, fontSize: 15, color: said ? C.onNight2 : C.floor}}>{it.k}</div>
                  <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 28, lineHeight: 1.15, letterSpacing: '-0.02em', color: said ? C.onNight : C.floor, marginTop: 3}}>
                    {it.t}
                  </div>
                </div>
              </div>
            </Row>
          );
        })}
      </div>
    </PanelShell>
  );
};

// ---- one big figure, counted with the counter tick --------------------------------------------
export const StatPanel: React.FC<{
  label: string;
  value: string; // as displayed, e.g. "$100M", "+300%", "80M+"
  line: string;
  note?: string;
  countAt?: number;
  local: number;
}> = ({label, value, line, note, countAt = 8, local}) => {
  const lit = ease(local, countAt, countAt + 5, glide);
  return (
    <PanelShell label={label} local={local} steps={[countAt]}>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 500,
          fontSize: 210,
          lineHeight: 1,
          letterSpacing: '-0.055em',
          color: C.onNight,
          opacity: lit, // never visible before it is said
          transform: `scale(${1.18 - 0.18 * ease(local, countAt, countAt + DUR.slow)})`,
          transformOrigin: '0% 100%',
          marginTop: 30,
        }}
      >
        <RollingNumber text={value} local={local - countAt} dur={DUR.slow} />
      </div>
      <div style={{height: 3, width: 160, background: C.mint, marginTop: 26, transformOrigin: '0% 50%', transform: `scaleX(${ease(local, countAt + 8, countAt + 8 + DUR.base, glide)})`}} />
      <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 38, lineHeight: 1.15, letterSpacing: '-0.025em', color: C.onNight, marginTop: 28, opacity: ease(local, countAt + 10, countAt + 24)}}>
        {line}
      </div>
      {note ? (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, fontFamily: F.mono, fontSize: 15, color: C.onNight2, lineHeight: 1.55, opacity: ease(local, countAt + 20, countAt + 34)}}>
          {note}
        </div>
      ) : null}
    </PanelShell>
  );
};

// ---- chips (Settle `.tok`): who invested, what was asked for -----------------------------------
export const ChipsPanel: React.FC<{label: string; title?: string; chips: {t: string; at: number; hi?: boolean}[]; note?: string; local: number}> = ({
  label,
  title,
  chips,
  note,
  local,
}) => (
  <PanelShell label={label} local={local} steps={chips.map((c) => c.at)}>
    {title ? (
      <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 58, lineHeight: 1.02, color: C.onNight, marginBottom: 36, letterSpacing: '-0.04em', opacity: ease(local, 4, 16)}}>
        {title}
      </div>
    ) : null}
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
      {chips.map((c, i) => {
        const p = ease(local, c.at, c.at + DUR.base);
        return (
          <div
            key={i}
            style={{
              opacity: p,
              // each chip zooms in from 1.25 as it is named, and holds a little large while it is the one being said
              transform: `translateY(${(1 - p) * RISE.nudge}px) scale(${(1.25 - 0.25 * p) * focusZoom(local, c.at + DUR.base, chips[i + 1]?.at, 0.04)})`,
              transformOrigin: '0% 50%',
              filter: p < 1 ? `blur(${(1 - p) * BLUR_IN}px)` : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: F.sans,
              fontWeight: 500,
              fontSize: 28,
              letterSpacing: '-0.015em',
              padding: '14px 24px',
              borderRadius: 999,
              color: C.onNight,
              background: c.hi ? 'rgba(242,243,242,.12)' : 'rgba(242,243,242,.05)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08)',
              border: `1px solid ${c.hi ? 'rgba(242,243,242,.4)' : C.pillEdge}`,
            }}
          >
            {c.t}
          </div>
        );
      })}
    </div>
    {note ? (
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, fontFamily: F.mono, fontSize: 15, color: C.onNight2, lineHeight: 1.55, opacity: ease(local, 20, 34)}}>
        {note}
      </div>
    ) : null}
  </PanelShell>
);

// ---- a dated rail: Settle's pinned index. The marker glides to each node as it is said ---------
export const TimelinePanel: React.FC<{
  label: string;
  nodes: {date: string; t: string; at: number}[];
  bracket?: {text: string; at: number; from: number; to: number};
  local: number;
}> = ({label, nodes, bracket, local}) => {
  const top = 30;
  const gapY = Math.min(160, 520 / Math.max(1, nodes.length - 1));
  // marker position: glides between nodes as each arrives
  let pos = 0;
  nodes.forEach((n, i) => {
    if (i > 0) pos += ease(local, n.at, n.at + DUR.base, glide);
  });
  const shown = nodes.map((n) => local >= n.at);
  return (
    <PanelShell label={label} local={local} steps={nodes.map((n) => n.at)}>
      <div style={{position: 'absolute', left: 14, top: top + 12, width: 2, height: (nodes.length - 1) * gapY, background: 'rgba(242,243,242,.12)'}} />
      <div style={{position: 'absolute', left: 14, top: top + 12, width: 2, height: pos * gapY, background: C.onNight}} />
      <div style={{position: 'absolute', left: 4, top: top + 2 + pos * gapY, width: 22, height: 22, borderRadius: 11, background: C.mint, opacity: ease(local, nodes[0].at, nodes[0].at + 6)}} />
      {nodes.map((n, i) => {
        const p = ease(local, n.at, n.at + DUR.slow);
        const current = i === Math.round(pos);
        return (
          <div key={i} style={{position: 'absolute', left: 60, top: top + i * gapY - 6, right: bracket ? 170 : 0, opacity: p, transform: `translateY(${(1 - p) * RISE.nudge}px) scale(${focusZoom(local, n.at, nodes[i + 1]?.at, 0.06)})`, transformOrigin: '0% 50%', filter: p < 1 ? `blur(${(1 - p) * BLUR_IN}px)` : undefined}}>
            <div style={{fontFamily: F.mono, fontSize: 17, color: current ? C.onNight : C.onNight2}}>{n.date}</div>
            <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 31, lineHeight: 1.15, letterSpacing: '-0.02em', color: current && shown[i] ? C.onNight : 'rgba(242,243,242,.55)', marginTop: 6}}>{n.t}</div>
          </div>
        );
      })}
      {bracket
        ? (() => {
            const p = ease(local, bracket.at, bracket.at + DUR.slow);
            const y0 = top + bracket.from * gapY + 12;
            const y1 = top + bracket.to * gapY + 12;
            return (
              <div style={{position: 'absolute', right: 0, top: y0, height: y1 - y0, width: 150, opacity: p}}>
                <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 18, borderTop: `2px solid ${C.onNight}`, borderBottom: `2px solid ${C.onNight}`, borderRight: `2px solid ${C.onNight}`, borderRadius: '0 8px 8px 0', transformOrigin: '0% 50%', transform: `scaleY(${p})`}} />
                <div style={{position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', fontFamily: F.sans, fontWeight: 500, fontSize: 44, lineHeight: 1, letterSpacing: '-0.04em', color: C.onNight}}>
                  {bracket.text}
                </div>
              </div>
            );
          })()
        : null}
    </PanelShell>
  );
};

// ---- text claims, each with a status dot (open questions get an outlined one) -------------------
export const ClaimsPanel: React.FC<{label: string; items: {t: string; at: number; open?: boolean}[]; note?: string; local: number}> = ({
  label,
  items,
  note,
  local,
}) => (
  <PanelShell label={label} local={local} steps={items.map((it) => it.at)}>
    <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
      {items.map((it, i) => (
        <Row key={i} local={local} at={it.at} zoomAt={it.at} zoomUntil={items[i + 1]?.at}>
          <div style={{display: 'flex', gap: 18, alignItems: 'flex-start'}}>
            <div style={{marginTop: 11, width: 12, height: 12, borderRadius: 6, flex: 'none', background: it.open ? 'transparent' : C.onNight, border: `2px solid ${C.onNight}`}} />
            <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 30, lineHeight: 1.2, letterSpacing: '-0.02em', color: C.onNight}}>{it.t}</div>
          </div>
        </Row>
      ))}
    </div>
    {note ? (
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, fontFamily: F.mono, fontSize: 15, color: C.onNight2, lineHeight: 1.55, opacity: ease(local, 24, 38)}}>
        {note}
      </div>
    ) : null}
  </PanelShell>
);

// ---- the escape route: sandbox wall, a DNS side door, a public chatbot outside --------------------
// Settle's chart draw: the path draws left to right on `settle` over `slow`, as each part is said.
export const SandboxPanel: React.FC<{local: number; dnsAt: number; outAt: number; doorAt: number}> = ({local, dnsAt, outAt, doorAt}) => {
  const box = ease(local, 6, 6 + DUR.slow);
  const d1 = ease(local, dnsAt, dnsAt + DUR.slow);
  const d2 = ease(local, outAt, outAt + DUR.slow);
  const door = ease(local, doorAt, doorAt + DUR.base, glide);
  const node = (x: number, y: number, p: number, title: string, sub: string, live?: boolean) => (
    <div style={{position: 'absolute', left: x, top: y, opacity: p, transform: `translateY(${(1 - p) * RISE.nudge}px)`}}>
      <NightCard nested radius={16} style={{padding: '14px 18px', minWidth: 190}}>
        <Label dot={live ? C.mint : undefined} style={{fontSize: 14}}>{sub}</Label>
        <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 28, letterSpacing: '-0.02em', color: C.onNight, marginTop: 6}}>{title}</div>
      </NightCard>
    </div>
  );
  return (
    <PanelShell label="How the agent got out" local={local} steps={[dnsAt, outAt, doorAt]}>
      {/* the sandbox: a dashed wall */}
      <div style={{position: 'absolute', left: 0, top: 10, width: 380, height: 420, borderRadius: 22, border: '2px dashed rgba(242,243,242,.35)', opacity: box}} />
      <Label style={{position: 'absolute', left: 22, top: 26, fontSize: 15, opacity: box}}>Sandbox · locked down</Label>
      {node(40, 90, box, 'AI agent', 'Routine test', true)}
      {node(40, 300, d1, 'DNS resolver', 'Allowed: name lookups')}
      {node(470, 300, d2, 'Public chatbot', 'Outside')}
      <svg width={680} height={560} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d="M 130 190 L 130 292" stroke={C.onNight} strokeWidth={2.5} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d1} />
        <path d="M 290 350 L 462 350" stroke={C.mint} strokeWidth={3} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d2} />
      </svg>
      {/* the side door in the wall */}
      <div style={{position: 'absolute', left: 372, top: 322, width: 18, height: 56, background: C.night2, border: `2px solid ${C.mint}`, borderRadius: 4, opacity: door, transformOrigin: '50% 0%', transform: `scaleY(${door})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, opacity: door}}>
        <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 46, letterSpacing: '-0.04em', color: C.onNight, lineHeight: 1.05}}>A side door nobody had locked.</div>
        <div style={{fontFamily: F.mono, fontSize: 15, color: C.onNight2, marginTop: 12}}>DNS turns a web address into a location computers can find.</div>
      </div>
    </PanelShell>
  );
};

// ---- a pipeline of stages: done (mint check) → active → next ---------------------------------------
export const StagesPanel: React.FC<{label: string; title: string; stages: {t: string; sub: string; at: number; state: 'done' | 'active' | 'next'}[]; note?: string; local: number}> = ({
  label,
  title,
  stages,
  note,
  local,
}) => (
  <PanelShell label={label} local={local} live steps={stages.map((x) => x.at)}>
    <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 84, lineHeight: 1, letterSpacing: '-0.05em', color: C.onNight, opacity: ease(local, 4, 18)}}>{title}</div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 38}}>
      {stages.map((s, i) => {
        const p = ease(local, s.at, s.at + DUR.slow);
        const tick = interpolate(local, [s.at + 6, s.at + 6 + DUR.base], [0, 1], {...clamp, easing: snap});
        const spin = (local * 12) % 360;
        return (
          <div key={i} style={{opacity: p, transform: `translateY(${(1 - p) * RISE.sm}px) scale(${focusZoom(local, s.at, stages[i + 1]?.at)})`, transformOrigin: '0% 50%', filter: p < 1 ? `blur(${(1 - p) * BLUR_IN}px)` : undefined}}>
            <NightCard nested raised={s.state === 'active'} radius={18} style={{padding: '18px 22px', display: 'flex', gap: 18, alignItems: 'center'}}>
              <div style={{width: 32, height: 32, flex: 'none', display: 'grid', placeItems: 'center'}}>
                {s.state === 'done' ? (
                  <div style={{width: 30, height: 30, borderRadius: 15, background: C.mint, color: C.mintInk, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 18, fontFamily: F.sans, transform: `scale(${tick})`}}>✓</div>
                ) : s.state === 'active' ? (
                  <div style={{width: 26, height: 26, borderRadius: 13, border: '3px solid rgba(242,243,242,.18)', borderTopColor: C.onNight, transform: `rotate(${spin}deg)`}} />
                ) : (
                  <div style={{width: 26, height: 26, borderRadius: 13, border: '2px dashed rgba(242,243,242,.35)'}} />
                )}
              </div>
              <div>
                <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: '-0.02em', color: s.state === 'next' ? C.onNight2 : C.onNight}}>{s.t}</div>
                <div style={{fontFamily: F.mono, fontSize: 15, color: C.onNight2, marginTop: 4}}>{s.sub}</div>
              </div>
            </NightCard>
          </div>
        );
      })}
    </div>
    {note ? (
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, fontFamily: F.mono, fontSize: 15, color: C.onNight2, lineHeight: 1.55, opacity: ease(local, 30, 44)}}>{note}</div>
    ) : null}
  </PanelShell>
);

// ---- Settle's one loop: bodies on a tilted ellipse, 12 s per revolution, scaled by depth -------------
export const OrbitPanel: React.FC<{label: string; center: string; bodies: string[]; caption: string; local: number; captionAt?: number}> = ({
  label,
  center,
  bodies,
  caption,
  local,
  captionAt = 20,
}) => {
  const cx = 332;
  const cy = 250;
  const rx = 290;
  const ry = 92;
  const appear = ease(local, 6, 6 + DUR.slow);
  return (
    <PanelShell label={label} local={local} steps={[captionAt]}>
      <svg width={664} height={500} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: appear}}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(242,243,242,.18)" strokeWidth={1.5} strokeDasharray="4 8" transform={`rotate(-8 ${cx} ${cy})`} />
      </svg>
      {(() => {
        const items = bodies.map((b, i) => {
          const a = ((local / 360) * Math.PI * 2 + (i / bodies.length) * Math.PI * 2) % (Math.PI * 2);
          const x0 = Math.cos(a) * rx;
          const y0 = Math.sin(a) * ry;
          const tilt = (-8 * Math.PI) / 180;
          const x = cx + x0 * Math.cos(tilt) - y0 * Math.sin(tilt);
          const y = cy + x0 * Math.sin(tilt) + y0 * Math.cos(tilt);
          const depth = (Math.sin(a) + 1) / 2; // 0 back, 1 front
          return {b, x, y, depth, i};
        });
        const node = (it: (typeof items)[number]) => {
          const p = ease(local, 8 + it.i * STAGGER.card * 2, 8 + it.i * STAGGER.card * 2 + DUR.slow);
          const s = 0.7 + 0.4 * it.depth;
          return (
            <div
              key={it.b}
              style={{
                position: 'absolute',
                left: it.x,
                top: it.y,
                transform: `translate(-50%, -50%) scale(${s * p})`,
                opacity: p * (0.45 + 0.55 * it.depth),
                zIndex: Math.round(it.depth * 10) + (it.depth > 0.5 ? 20 : 0),
                fontFamily: F.sans,
                fontWeight: 500,
                fontSize: 30,
                letterSpacing: '-0.02em',
                color: C.onNight,
                padding: '12px 22px',
                borderRadius: 999,
                background: '#1D201D',
                border: '1px solid rgba(242,243,242,.2)',
                whiteSpace: 'nowrap',
              }}
            >
              {it.b}
            </div>
          );
        };
        return (
          <>
            {items.filter((it) => it.depth <= 0.5).map(node)}
            <div
              style={{
                position: 'absolute',
                left: cx,
                top: cy,
                zIndex: 15,
                transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * appear})`,
                opacity: appear,
                fontFamily: F.sans,
                fontWeight: 500,
                fontSize: 34,
                letterSpacing: '-0.03em',
                color: C.ink,
                background: C.paper,
                padding: '18px 30px',
                borderRadius: 999,
                whiteSpace: 'nowrap',
              }}
            >
              {center}
            </div>
            {items.filter((it) => it.depth > 0.5).map(node)}
          </>
        );
      })()}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, fontFamily: F.sans, fontWeight: 500, fontSize: 46, lineHeight: 1.05, letterSpacing: '-0.04em', color: C.onNight, opacity: ease(local, captionAt, captionAt + DUR.slow)}}>
        {caption}
      </div>
    </PanelShell>
  );
};

// ---- the hotline: two capitals, one line drawing between them, a pulse travelling along it ------------
export const HotlinePanel: React.FC<{local: number; lineAt: number; label: string}> = ({local, lineAt, label}) => {
  const a = ease(local, 6, 6 + DUR.slow);
  const line = ease(local, lineAt, lineAt + DUR.slow);
  const t = ((local - lineAt - DUR.slow) / 45) % 1;
  const pulse = local > lineAt + DUR.slow ? (t < 0 ? 0 : t) : -1;
  const end = (x: number, city: string, country: string) => (
    <div style={{position: 'absolute', left: x, top: 150, transform: 'translateX(-50%)', textAlign: 'left', opacity: a}}>
      <div style={{width: 26, height: 26, borderRadius: 13, background: C.onNight, margin: '0 auto 22px'}} />
      <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 40, letterSpacing: '-0.03em', color: C.onNight}}>{city}</div>
      <div style={{fontFamily: F.mono, fontSize: 15, color: C.onNight2, marginTop: 4}}>{country}</div>
    </div>
  );
  return (
    <PanelShell label={label} local={local} live={local > lineAt + DUR.slow} steps={[lineAt]}>
      <div style={{position: 'absolute', left: 110, top: 162, width: 444 * line, height: 2, background: C.onNight}} />
      {pulse >= 0 ? (
        <div style={{position: 'absolute', left: 110 + 444 * pulse - 9, top: 154, width: 18, height: 18, borderRadius: 9, background: C.mint, boxShadow: '0 0 24px rgba(171,254,193,.5)'}} />
      ) : null}
      {end(110, 'Washington', 'United States')}
      {end(554, 'Beijing', 'China')}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
        <div style={{fontFamily: F.mono, fontSize: 15, color: C.onNight2, opacity: ease(local, lineAt + 10, lineAt + 24)}}>Cold War hotline → AI incident channel</div>
        <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 52, lineHeight: 1.02, letterSpacing: '-0.045em', color: C.onNight, marginTop: 14, opacity: ease(local, lineAt + 14, lineAt + 30)}}>
          For AI mishaps, not missiles.
        </div>
      </div>
    </PanelShell>
  );
};

// ---- Settle's button morph, for the subscribe ask: press .96 → collapse → spin → mint "Subscribed ✓" ----
export const SubscribeMorph: React.FC<{local: number; pressAt: number}> = ({local, pressAt}) => {
  const inP = ease(local, 0, DUR.slow);
  const l = local - pressAt;
  const press = l >= 0 && l < 12 ? 1 - 0.04 * Math.sin((Math.min(l, 6) / 6) * Math.PI) : 1;
  const collapse = ease(l, 6, 6 + DUR.base, glide);
  const spinning = l >= 6 + DUR.base && l < 6 + DUR.base + 24;
  const success = interpolate(l, [6 + DUR.base + 24, 6 + DUR.base + 24 + DUR.base], [0, 1], {...clamp, easing: snap});
  const width = success > 0 ? 96 + (420 - 96) * success : 420 - (420 - 96) * collapse;
  const labelOut = ease(l, 0, DUR.quick, depart);
  return (
    <div style={{position: 'absolute', left: 1040, top: 400, width: 760, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 26, opacity: inP, transform: `translateY(${(1 - inP) * RISE.card}px)`}}>
      <Label>One tap · the next update</Label>
      <div
        style={{
          height: 96,
          width,
          borderRadius: 999,
          background: success > 0 ? C.mint : C.onNight,
          color: success > 0 ? C.mintInk : C.ink,
          display: 'grid',
          placeItems: 'center',
          transform: `scale(${press})`,
          fontFamily: F.sans,
          fontWeight: 500,
          fontSize: 36,
          letterSpacing: '-0.02em',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {success > 0 ? (
          <span style={{opacity: Math.min(1, success * 1.4)}}>Subscribed ✓</span>
        ) : spinning ? (
          <div style={{width: 36, height: 36, borderRadius: 18, border: '4px solid rgba(10,12,11,.18)', borderTopColor: C.ink, transform: `rotate(${(l * 14) % 360}deg)`}} />
        ) : (
          <span style={{opacity: 1 - labelOut, transform: `translateY(${-labelOut * RISE.nudge}px)`}}>Subscribe</span>
        )}
      </div>
    </div>
  );
};
