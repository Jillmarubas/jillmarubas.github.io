// A dark-mode, space-black laptop seen straight on, sitting on a dark studio desk.
// Drawn in code (no product photos, no logos). Screen content is laid out in SCREEN points.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {LAPTOP, MAC, SCREEN} from './theme';

export const Studio: React.FC = () => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${MAC.studio.top} 0%, #0e1013 58%, ${MAC.studio.floor} 100%)`}}>
    {/* One soft key light from above, pooling on the desk behind the laptop. */}
    <AbsoluteFill style={{background: `radial-gradient(60% 55% at 50% 38%, ${MAC.studio.spot} 0%, rgba(0,0,0,0) 70%)`}} />
    {/* Desk edge: the floor plane starts just under the laptop base. */}
    <div style={{position: 'absolute', left: 0, right: 0, top: LAPTOP.lidY + LAPTOP.lidH + 6, bottom: 0, background: 'linear-gradient(180deg, rgba(255,255,255,.035) 0%, rgba(0,0,0,0) 40%)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(130% 100% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
  </AbsoluteFill>
);

// `wake` 0→1 fades the display up from black, like the lid just opened.
export const MacBook: React.FC<{children: React.ReactNode; wake?: number}> = ({children, wake = 1}) => {
  const {lidX, lidY, lidW, lidH, bezel, screenW, screenH, scale} = LAPTOP;
  const baseW = lidW + 128;
  const baseY = lidY + lidH - 2;
  const notchW = 190 * scale;
  const notchH = 32 * scale;
  return (
    <>
      {/* Contact shadow on the desk. */}
      <div style={{position: 'absolute', left: (1920 - baseW * 1.04) / 2, top: baseY + 4, width: baseW * 1.04, height: 46, borderRadius: '50%', background: 'radial-gradient(50% 50% at 50% 30%, rgba(0,0,0,.85) 0%, rgba(0,0,0,0) 100%)', filter: 'blur(6px)'}} />
      {/* Screen light spilling onto the desk. */}
      <div style={{position: 'absolute', left: lidX + 80, top: baseY + 10, width: lidW - 160, height: 90, borderRadius: '50%', background: `radial-gradient(50% 50% at 50% 0%, rgba(120,160,230,${0.1 * wake}) 0%, rgba(0,0,0,0) 100%)`, filter: 'blur(10px)'}} />

      {/* Lid: aluminium rim around a black glass bezel. */}
      <div
        style={{
          position: 'absolute',
          left: lidX - 3,
          top: lidY - 3,
          width: lidW + 6,
          height: lidH + 6,
          // Round on top, nearly square at the hinge so the lid meets the base with no gap.
          borderRadius: '30px 30px 5px 5px',
          background: `linear-gradient(180deg, #4a4c52 0%, ${MAC.body.edge} 12%, #1c1d20 100%)`,
          boxShadow: '0 40px 90px -30px rgba(0,0,0,.9), 0 0 0 1px rgba(0,0,0,.6)',
        }}
      />
      <div style={{position: 'absolute', left: lidX, top: lidY, width: lidW, height: lidH, borderRadius: '27px 27px 3px 3px', background: MAC.body.bezel, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.06)'}} />

      {/* Display. */}
      <div style={{position: 'absolute', left: lidX + bezel.side, top: lidY + bezel.top, width: screenW, height: screenH, borderRadius: '12px 12px 4px 4px', overflow: 'hidden', background: '#000'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${scale})`, transformOrigin: '0 0', filter: wake < 1 ? `brightness(${wake})` : undefined}}>
          {children}
        </div>
        {/* Glass: a faint diagonal reflection of the key light. */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(118deg, rgba(255,255,255,.055) 0%, rgba(255,255,255,.015) 34%, rgba(255,255,255,0) 52%)', pointerEvents: 'none'}} />
      </div>

      {/* Camera housing (the notch) cuts into the top of the display. */}
      <div style={{position: 'absolute', left: (1920 - notchW) / 2, top: lidY + bezel.top - 1, width: notchW, height: notchH + 1, background: MAC.body.bezel, borderRadius: `0 0 ${9 * scale}px ${9 * scale}px`}}>
        <div style={{position: 'absolute', left: notchW / 2 - 4, top: notchH / 2 - 4, width: 8, height: 8, borderRadius: 4, background: 'radial-gradient(circle at 35% 35%, #2a3550 0%, #0a0c12 60%)', boxShadow: '0 0 0 1.5px #111318'}} />
      </div>

      {/* Base: the front lip of the keyboard deck, wider than the lid, with the opening notch. */}
      <div style={{position: 'absolute', left: (1920 - baseW) / 2, top: baseY, width: baseW, height: 20, borderRadius: '4px 4px 22px 22px / 4px 4px 14px 14px', background: `linear-gradient(180deg, #5a5d63 0%, ${MAC.body.lip} 18%, #232428 60%, #0d0e10 100%)`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18)'}}>
        <div style={{position: 'absolute', left: baseW / 2 - 110, top: 0, width: 220, height: 7, borderRadius: '0 0 10px 10px', background: 'linear-gradient(180deg, #17181b 0%, #2a2b2f 100%)'}} />
      </div>
    </>
  );
};

// Placeholder for a real screenshot: drop a PNG in public/tutorial/ and show it full-screen.
export const ScreenImage: React.FC<{src: string}> = ({src}) => <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: SCREEN.w, height: SCREEN.h, objectFit: 'cover'}} />;
