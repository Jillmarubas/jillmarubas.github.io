import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import credits from '../../public/photos/credits.json';
import {C, F, settle, snap} from '../theme';
import {Glass} from './Glass';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = (local: number, a: number, b: number) => interpolate(local, [a, b], [0, 1], {...clamp, easing: settle});

type Credits = Record<string, {artist: string; license: string}>;
const credit = (key: string) => {
  const c = (credits as Credits)[key];
  return c ? `Photo: ${c.artist} · ${c.license} · Wikimedia Commons` : '';
};

export const Label: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({
  children,
  color = C.text2,
  style,
}) => (
  <div
    style={{
      fontFamily: F.mono,
      fontWeight: 500,
      fontSize: 20,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

// ---- full-bleed photograph ------------------------------------------------------
export const PhotoFull: React.FC<{
  src: string;
  focal?: [number, number];
  zoom?: number;
  framed?: boolean;
  name?: string;
  role?: string;
  local: number;
  dur: number;
}> = ({src, focal = [50, 40], zoom = 1, framed, name, role, local, dur}) => {
  const push = interpolate(local, [0, Math.max(dur, 1)], [1.04, 1.12], clamp) * zoom;
  const tag = ease(local, 10, 26);
  const frameIn = ease(local, 0, 18);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {framed ? (
        <>
          {/* portrait: the same photo, blurred, fills the frame; the sharp one sits in a frame */}
          <Img src={staticFile(`photos/${src}.jpg`)} style={{position: 'absolute', inset: -60, width: 'calc(100% + 120px)', height: 'calc(100% + 120px)', objectFit: 'cover', filter: 'blur(38px) brightness(.45) saturate(1.1)'}} />
          <div
            style={{
              position: 'absolute',
              left: 1100,
              top: 150,
              width: 640,
              height: 760,
              borderRadius: 18,
              overflow: 'hidden',
              border: `1px solid ${C.rimLit}`,
              boxShadow: '0 30px 80px rgba(0,0,0,.55)',
              opacity: frameIn,
              transform: `translateY(${(1 - frameIn) * 40}px)`,
            }}
          >
            <Img src={staticFile(`photos/${src}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focal[0]}% ${focal[1]}%`, transform: `scale(${push})`, transformOrigin: `${focal[0]}% ${focal[1]}%`}} />
          </div>
        </>
      ) : (
      <Img
        src={staticFile(`photos/${src}.jpg`)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${focal[0]}% ${focal[1]}%`,
          transform: `scale(${push})`,
          transformOrigin: `${focal[0]}% ${focal[1]}%`,
        }}
      />
      )}
      {/* grade toward the warm field, and darken the lower-left where the words sit */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,10,4,.10) 0%, rgba(10,8,6,.18) 45%, rgba(8,6,5,.86) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,6,5,.62) 0%, rgba(8,6,5,.12) 60%, rgba(8,6,5,0) 100%)'}} />
      <AbsoluteFill style={{background: 'rgba(250,90,5,.06)', mixBlendMode: 'soft-light'}} />
      {/* a scrim under the top chrome so the brand and label stay legible over bright skies */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,6,5,.62) 0%, rgba(8,6,5,0) 22%)'}} />
      {name ? (
        <div style={{position: 'absolute', left: 120, top: 150, opacity: tag, transform: `translateX(${(1 - tag) * -24}px)`}}>
          <Glass radius={10} style={{padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{width: 10, height: 10, borderRadius: 5, background: C.accent}} />
            <div>
              <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 30, color: C.text}}>{name}</div>
              {role ? <div style={{fontFamily: F.mono, fontSize: 18, color: C.text2, letterSpacing: '0.06em', marginTop: 2}}>{role}</div> : null}
            </div>
          </Glass>
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          right: 48,
          bottom: 92,
          fontFamily: F.mono,
          fontSize: 15,
          color: 'rgba(243,239,233,.72)',
          letterSpacing: '0.04em',
          opacity: ease(local, 14, 30),
        }}
      >
        {credit(src)}
      </div>
    </AbsoluteFill>
  );
};

// ---- the glass panel that holds a graphic in split mode ---------------------------
export const PanelShell: React.FC<{label: string; local: number; children: React.ReactNode}> = ({label, local, children}) => {
  const p = ease(local, 0, 16);
  return (
    <div
      style={{
        position: 'absolute',
        left: 1030,
        top: 170,
        width: 770,
        height: 740,
        opacity: Math.min(1, p * 1.4),
        transform: `translateX(${(1 - p) * 60}px) scale(${0.97 + 0.03 * p})`,
        filter: `blur(${(1 - p) * 10}px)`,
      }}
    >
      <Glass style={{position: 'absolute', inset: 0, padding: 48, display: 'flex', flexDirection: 'column'}}>
        <Label color={C.accentHi} style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{width: 8, height: 8, borderRadius: 4, background: C.accent, display: 'inline-block'}} />
          {label}
        </Label>
        <div style={{flex: 1, position: 'relative', marginTop: 28}}>{children}</div>
      </Glass>
    </div>
  );
};

// A row that slides in at `at` (panel-local frame) and lights up while active.
const Row: React.FC<{local: number; at: number; active?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({
  local,
  at,
  active,
  children,
  style,
}) => {
  const p = ease(local, at, at + 12);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 26}px)`,
        filter: `blur(${(1 - p) * 6}px)`,
        ...style,
      }}
    >
      <Glass
        nested
        radius={10}
        style={{
          padding: '18px 22px',
          borderColor: active ? 'rgba(250,90,5,.55)' : C.rim,
          background: active ? 'rgba(250,90,5,.12)' : 'rgba(255,255,255,.05)',
        }}
      >
        {children}
      </Glass>
    </div>
  );
};

// ---- agenda / recap list ------------------------------------------------------
export const ListPanel: React.FC<{
  label: string;
  items: {k: string; t: string; at: number}[];
  local: number;
  numbered?: boolean;
  progressive?: boolean;
}> = ({label, items, local, numbered = true, progressive = false}) => {
  const activeIdx = items.reduce((acc, it, i) => (local >= it.at ? i : acc), -1);
  return (
    <PanelShell label={label} local={local}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        {items.map((it, i) => (
          <Row key={i} local={local} at={progressive ? Math.max(it.at, 6) : Math.min(it.at, 8 + i * 4)} active={i === activeIdx}>
            <div style={{display: 'flex', gap: 18, alignItems: 'baseline'}}>
              {numbered ? (
                <div style={{fontFamily: F.mono, fontSize: 20, color: i === activeIdx ? C.accentHi : C.text2, width: 36}}>
                  {String(i + 1).padStart(2, '0')}
                </div>
              ) : null}
              <div>
                <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.1em', textTransform: 'uppercase', color: i === activeIdx ? C.accentHi : C.text2}}>
                  {it.k}
                </div>
                <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 27, lineHeight: 1.22, color: i <= activeIdx ? C.text : C.faint, marginTop: 4}}>
                  {it.t}
                </div>
              </div>
            </div>
          </Row>
        ))}
      </div>
    </PanelShell>
  );
};

// ---- horizontal bars (prices, benchmarks) ---------------------------------------
export const BarsPanel: React.FC<{
  label: string;
  unit?: string;
  groups: {name: string; at: number; bars: {k: string; v: number; text: string; hi?: boolean}[]}[];
  max: number;
  note?: string;
  local: number;
}> = ({label, unit, groups, max, note, local}) => (
  <PanelShell label={label} local={local}>
    {unit ? <div style={{fontFamily: F.mono, fontSize: 18, color: C.text2, marginTop: -12, marginBottom: 24}}>{unit}</div> : null}
    <div style={{display: 'flex', flexDirection: 'column', gap: 34}}>
      {groups.map((g, gi) => {
        const gp = ease(local, 8 + gi * 6, 20 + gi * 6);
        return (
          <div key={gi} style={{opacity: gp, transform: `translateY(${(1 - gp) * 20}px)`}}>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 38, color: C.text, marginBottom: 14, letterSpacing: '-0.01em'}}>{g.name}</div>
            {g.bars.map((b, bi) => {
              const bp = interpolate(local, [g.at + 6 + bi * 5, g.at + 26 + bi * 5], [0, 1], {...clamp, easing: snap});
              const w = Math.max(0.012, b.v / max) * 520 * Math.max(0, bp);
              return (
                <div key={bi} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10}}>
                  <div style={{fontFamily: F.mono, fontSize: 18, color: C.text2, width: 110, textTransform: 'uppercase', letterSpacing: '0.08em'}}>{b.k}</div>
                  {/* the empty track shows the scale before the value is spoken */}
                  <div style={{position: 'absolute', left: 126, width: 520, height: 34, borderRadius: 6, border: `1px dashed ${C.rim}`}} />
                  <div style={{height: 34, width: w, borderRadius: 6, background: b.hi ? `linear-gradient(90deg, ${C.accentDim}, ${C.accent})` : 'rgba(243,239,233,.22)', boxShadow: b.hi ? '0 0 24px rgba(250,90,5,.35)' : undefined}} />
                  <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 32, color: b.hi ? C.accentHi : C.text, opacity: ease(local, g.at + 14 + bi * 5, g.at + 24 + bi * 5), fontVariantNumeric: 'tabular-nums'}}>
                    {b.text}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
    {note ? (
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, fontFamily: F.mono, fontSize: 17, color: C.text2, lineHeight: 1.45, opacity: ease(local, 30, 44)}}>
        {note}
      </div>
    ) : null}
  </PanelShell>
);

// ---- one big figure --------------------------------------------------------------
export const StatPanel: React.FC<{
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  line: string;
  note?: string;
  img?: string;
  countAt?: number;
  local: number;
}> = ({label, value, decimals = 0, prefix = '', suffix = '', line, note, img, countAt = 6, local}) => {
  const p = interpolate(local, [countAt, countAt + 26], [0, 1], {...clamp, easing: settle});
  const pop = interpolate(local, [countAt, countAt + 14], [0, 1], {...clamp, easing: snap});
  return (
    <PanelShell label={label} local={local}>
      {img ? (
        <div style={{height: 250, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.rim}`, marginBottom: 30, opacity: ease(local, 4, 18)}}>
          <Img src={staticFile(`photos/${img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + local * 0.0006})`}} />
        </div>
      ) : null}
      <div
        style={{
          fontFamily: F.display,
          fontWeight: 900,
          fontSize: img ? 150 : 200,
          lineHeight: 0.95,
          letterSpacing: '-0.035em',
          color: C.accent,
          fontVariantNumeric: 'tabular-nums',
          transform: `scale(${0.85 + 0.15 * pop})`,
          transformOrigin: '0% 100%',
          opacity: 0.18 + 0.82 * Math.min(1, pop * 2),
          textShadow: '0 0 60px rgba(250,90,5,.35)',
        }}
      >
        {prefix}
        {(value * p).toFixed(decimals)}
        {suffix}
      </div>
      <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 34, lineHeight: 1.22, color: C.text, marginTop: 22, opacity: ease(local, countAt + 10, countAt + 24)}}>
        {line}
      </div>
      {note ? (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, fontFamily: F.mono, fontSize: 17, color: C.text2, lineHeight: 1.45, opacity: ease(local, countAt + 20, countAt + 34)}}>
          {note}
        </div>
      ) : null}
    </PanelShell>
  );
};

// ---- chips: where a model is available, who is investigating ----------------------
export const ChipsPanel: React.FC<{label: string; title?: string; chips: {t: string; at: number; hi?: boolean}[]; note?: string; local: number}> = ({
  label,
  title,
  chips,
  note,
  local,
}) => (
  <PanelShell label={label} local={local}>
    {title ? (
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 52, lineHeight: 1.02, color: C.text, marginBottom: 34, letterSpacing: '-0.015em', opacity: ease(local, 4, 16)}}>
        {title}
      </div>
    ) : null}
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 14}}>
      {chips.map((c, i) => {
        const p = interpolate(local, [c.at, c.at + 12], [0, 1], {...clamp, easing: snap});
        return (
          <div
            key={i}
            style={{
              opacity: Math.min(1, p * 2),
              transform: `scale(${0.7 + 0.3 * p})`,
              transformOrigin: '0% 50%',
              fontFamily: F.body,
              fontWeight: 600,
              fontSize: 28,
              padding: '14px 24px',
              borderRadius: 999,
              color: c.hi ? C.accentHi : C.text,
              background: c.hi ? 'rgba(250,90,5,.14)' : 'rgba(255,255,255,.06)',
              border: `1px solid ${c.hi ? 'rgba(250,90,5,.5)' : C.rim}`,
            }}
          >
            {c.t}
          </div>
        );
      })}
    </div>
    {note ? (
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, fontFamily: F.mono, fontSize: 17, color: C.text2, lineHeight: 1.45, opacity: ease(local, 20, 34)}}>
        {note}
      </div>
    ) : null}
  </PanelShell>
);

// ---- a dated timeline with an optional bracket --------------------------------------
export const TimelinePanel: React.FC<{
  label: string;
  nodes: {date: string; t: string; at: number; danger?: boolean}[];
  bracket?: {text: string; at: number; from: number; to: number};
  local: number;
}> = ({label, nodes, bracket, local}) => {
  const top = 40;
  const gapY = 150;
  return (
    <PanelShell label={label} local={local}>
      <div style={{position: 'absolute', left: 18, top: top + 8, width: 3, height: (nodes.length - 1) * gapY, background: C.rim}} />
      {nodes.map((n, i) => {
        const p = ease(local, n.at, n.at + 12);
        const dot = interpolate(local, [n.at, n.at + 12], [0, 1], {...clamp, easing: snap});
        // the rail fills down to each node as it appears
        const fill = i > 0 ? ease(local, n.at - 6, n.at + 6) : 0;
        return (
          <React.Fragment key={i}>
            {i > 0 ? (
              <div style={{position: 'absolute', left: 18, top: top + 8 + (i - 1) * gapY, width: 3, height: gapY * fill, background: C.accent}} />
            ) : null}
            <div style={{position: 'absolute', left: 8, top: top + i * gapY - 2, width: 24, height: 24, borderRadius: 12, background: n.danger ? C.danger : C.accent, transform: `scale(${dot})`, boxShadow: `0 0 22px ${n.danger ? 'rgba(255,90,90,.6)' : 'rgba(250,90,5,.5)'}`}} />
            <div style={{position: 'absolute', left: 64, top: top + i * gapY - 14, right: 150, opacity: p, transform: `translateX(${(1 - p) * 24}px)`}}>
              <div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 22, letterSpacing: '0.1em', textTransform: 'uppercase', color: n.danger ? C.danger : C.accentHi}}>{n.date}</div>
              <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 30, lineHeight: 1.2, color: C.text, marginTop: 6}}>{n.t}</div>
            </div>
          </React.Fragment>
        );
      })}
      {bracket ? (() => {
        const p = ease(local, bracket.at, bracket.at + 14);
        const y0 = top + bracket.from * gapY;
        const y1 = top + bracket.to * gapY + 20;
        return (
          <div style={{position: 'absolute', right: 0, top: y0, height: y1 - y0, width: 130, opacity: p}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 22, borderTop: `3px solid ${C.accent}`, borderBottom: `3px solid ${C.accent}`, borderRight: `3px solid ${C.accent}`, borderRadius: '0 8px 8px 0', transformOrigin: '0% 50%', transform: `scaleY(${p})`}} />
            <div style={{position: 'absolute', left: 36, top: '50%', transform: 'translateY(-50%)', fontFamily: F.display, fontWeight: 900, fontSize: 40, lineHeight: 1, color: C.accent}}>
              {bracket.text}
            </div>
          </div>
        );
      })() : null}
    </PanelShell>
  );
};

// ---- text claims with a status mark ----------------------------------------------
export const ClaimsPanel: React.FC<{label: string; items: {t: string; at: number; mark?: 'said' | 'warn'}[]; note?: string; local: number}> = ({
  label,
  items,
  note,
  local,
}) => (
  <PanelShell label={label} local={local}>
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {items.map((it, i) => (
        <Row key={i} local={local} at={it.at}>
          <div style={{display: 'flex', gap: 18, alignItems: 'flex-start'}}>
            <div style={{marginTop: 10, width: 12, height: 12, borderRadius: 6, flex: 'none', background: it.mark === 'warn' ? C.danger : C.accent}} />
            <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 28, lineHeight: 1.25, color: C.text}}>{it.t}</div>
          </div>
        </Row>
      ))}
    </div>
    {note ? (
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, fontFamily: F.mono, fontSize: 17, color: C.text2, lineHeight: 1.45, opacity: ease(local, 24, 38)}}>
        {note}
      </div>
    ) : null}
  </PanelShell>
);

// ---- tokens explainer: text breaking into billable chunks ----------------------------
export const TokensPanel: React.FC<{local: number; label: string}> = ({local, label}) => {
  const chunks = ['Prices', ' are', ' quot', 'ed', ' per', ' mill', 'ion', ' tok', 'ens', '.'];
  return (
    <PanelShell label={label} local={local}>
      <div style={{fontFamily: F.mono, fontSize: 18, color: C.text2, marginBottom: 26, opacity: ease(local, 4, 14)}}>
        1 token ≈ a short chunk of text
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
        {chunks.map((c, i) => {
          const at = 10 + i * 4;
          const p = interpolate(local, [at, at + 10], [0, 1], {...clamp, easing: snap});
          const hi = i % 2 === 0;
          return (
            <div
              key={i}
              style={{
                fontFamily: F.mono,
                fontWeight: 500,
                fontSize: 44,
                padding: '8px 12px',
                borderRadius: 8,
                whiteSpace: 'pre',
                color: hi ? C.accentHi : C.text,
                background: hi ? 'rgba(250,90,5,.14)' : 'rgba(255,255,255,.07)',
                border: `1px solid ${hi ? 'rgba(250,90,5,.4)' : C.rim}`,
                opacity: Math.min(1, p * 2),
                transform: `translateY(${(1 - p) * -20}px) scale(${0.8 + 0.2 * p})`,
              }}
            >
              {c}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, bottom: 0, right: 0, opacity: ease(local, 56, 70)}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.text, letterSpacing: '-0.02em'}}>
          10 tokens <span style={{color: C.accent}}>→</span> billed
        </div>
        <div style={{fontFamily: F.mono, fontSize: 18, color: C.text2, marginTop: 10}}>Prices below are per 1,000,000 tokens</div>
      </div>
    </PanelShell>
  );
};

// ---- two labs, ninety minutes apart ------------------------------------------------
export const RaceFlag: React.FC<{local: number}> = ({local}) => {
  const a = ease(local, 6, 18);
  const b = ease(local, 18, 30);
  const arc = ease(local, 26, 46);
  return (
    <PanelShell label="Sept 22 · same day" local={local}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, height: 3, background: C.rim}} />
      <div style={{position: 'absolute', left: 60, top: 230 - 40, width: 3, height: 80, background: C.accent, transform: `scaleY(${a})`}} />
      <div style={{position: 'absolute', left: 30, top: 60, opacity: a}}>
        <Label color={C.accentHi}>First</Label>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 54, color: C.text, marginTop: 6}}>Anthropic</div>
      </div>
      <div style={{position: 'absolute', left: 560, top: 230 - 40, width: 3, height: 80, background: C.text, transform: `scaleY(${b})`}} />
      <div style={{position: 'absolute', left: 430, top: 300, opacity: b, textAlign: 'left'}}>
        <Label>+90 min</Label>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 54, color: C.text, marginTop: 6}}>OpenAI</div>
      </div>
      <svg style={{position: 'absolute', left: 60, top: 120, overflow: 'visible'}} width={500} height={110}>
        <path d="M0 110 C 120 0, 380 0, 500 110" fill="none" stroke={C.accent} strokeWidth={3} strokeDasharray="620" strokeDashoffset={620 * (1 - arc)} />
      </svg>
      <div style={{position: 'absolute', left: 0, bottom: 0, fontFamily: F.display, fontWeight: 900, fontSize: 120, color: C.accent, letterSpacing: '-0.03em', opacity: arc, lineHeight: 1}}>
        90 min
      </div>
    </PanelShell>
  );
};
