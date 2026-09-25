import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, F} from '../theme';
import {mix, prog, useT} from '../lib/anim';
import {cue, para} from '../lib/timeline';

// Real photographs behind the glass, one per story beat. They sit between the field and
// the stage, pushed into the field's orange duotone and faded at the edges, so they read
// as texture and place rather than competing with the graphics. All from Wikimedia Commons.
type Plate = {src: string; credit: string; from: number; to: number; pos?: string};

const CREDITS: Record<string, string> = {
  servers: 'Carl Lender · CC BY 2.0',
  phage: 'SnaxMikn · CC BY-SA 4.0',
  lab: 'Bill Branson, NCI · Public domain',
  un2: 'Jdforrester · CC BY 4.0',
  rayban: 'CCadio · CC BY 4.0',
  deepmind: 'Gciriani · CC BY-SA 4.0',
  cyber: 'jaydeep_ · CC0',
};

const plates = (): Plate[] => {
  const p = (src: string, from: number, to: number, pos?: string): Plate => ({src, credit: CREDITS[src], from, to, pos});
  return [
    p('servers', 0.3, cue('Claude may'), '60% 50%'),
    p('phage', cue('Claude may'), cue('And at the UN'), '38% 40%'),
    p('un2', cue('And at the UN'), cue("Here's your"), '50% 45%'),
    p('servers', para(1).start - 0.2, para(1).end + 0.3, '60% 50%'),
    p('phage', para(2).start - 0.2, cue('Scientists confirmed'), '38% 40%'),
    p('lab', cue('Scientists confirmed'), cue('Nobody knows') - 0.25, '45% 30%'),
    p('phage', cue('Nobody knows') - 0.25, para(2).end + 0.3, '38% 40%'),
    p('rayban', para(3).start - 0.2, para(3).end + 0.3, '40% 60%'),
    p('deepmind', para(4).start - 0.2, para(4).end + 0.3, '50% 40%'),
    p('cyber', para(5).start - 0.2, para(5).end + 0.3, '50% 50%'),
    p('un2', para(6).start - 0.2, para(6).end + 0.3, '50% 45%'),
  ];
};
const PLATES = plates();

export const Plates: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {PLATES.map((pl, i) => {
        if (t < pl.from - 0.1 || t > pl.to + 0.8) return null;
        const inP = prog(t, pl.from, 0.7);
        const outP = prog(t, pl.to, 0.6);
        const life = Math.max(0, Math.min(1, (t - pl.from) / Math.max(1, pl.to - pl.from)));
        return (
          <AbsoluteFill key={i} style={{opacity: 0.3 * inP * (1 - outP)}}>
            <AbsoluteFill
              style={{
                // top and bottom fade into the field; the captions and top bar sit on dark
                WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 4%, #000 22%, #000 58%, rgba(0,0,0,0) 80%)',
                maskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 4%, #000 22%, #000 58%, rgba(0,0,0,0) 80%)',
              }}
            >
              <Img
                src={staticFile(`plates/${pl.src}.jpg`)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: pl.pos ?? '50% 50%',
                  // slow push-in across the beat
                  transform: `scale(${mix(1.14, 1.04, life)}) translateY(${mix(10, -10, life)}px)`,
                  filter: 'grayscale(1) contrast(1.15) brightness(.9) blur(1.5px)',
                }}
              />
              <AbsoluteFill style={{background: 'linear-gradient(160deg, rgba(250,90,5,.9), rgba(214,31,90,.75) 55%, rgba(124,58,190,.8))', mixBlendMode: 'color'}} />
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/** The credit for whichever plate is up, small and quiet, above the Shorts UI. */
export const PlateCredit: React.FC = () => {
  const t = useT();
  const pl = PLATES.find((p) => t >= p.from && t < p.to);
  if (!pl) return null;
  const o = prog(t, pl.from + 0.4, 0.4) * (1 - prog(t, pl.to - 0.3, 0.3));
  return (
    <div style={{position: 'absolute', left: 60, top: 1488, fontFamily: F.mono, fontSize: 18, letterSpacing: '.08em', color: C.faint, opacity: 0.8 * o}}>
      BG PHOTO · {pl.credit.toUpperCase()}
    </div>
  );
};
