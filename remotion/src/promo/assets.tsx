import React from 'react';

// All artwork is drawn in SVG so the template needs no image files.
// Swap any of these for a transparent PNG of your own product via <Img>.

const Moon: React.FC<{x: number; y: number; r: number; color: string; bg: string}> = ({x, y, r, color, bg}) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={color} />
    <circle cx={x + r * 0.42} cy={y - r * 0.28} r={r * 0.86} fill={bg} />
  </g>
);

export const Can: React.FC<{brand: string; dark?: boolean; width?: number}> = ({brand, dark = true, width = 300}) => {
  const id = dark ? 'canD' : 'canL';
  const body = dark ? ['#101012', '#3a3a3f', '#1a1a1d', '#050506'] : ['#bdbdbd', '#ffffff', '#e4e4e4', '#9a9a9a'];
  const ink = dark ? '#f2f2f2' : '#141416';
  return (
    <svg width={width} height={width * 2.05} viewBox="0 0 300 615" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1">
          <stop offset="0" stopColor={body[0]} />
          <stop offset="0.28" stopColor={body[1]} />
          <stop offset="0.62" stopColor={body[2]} />
          <stop offset="1" stopColor={body[3]} />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" x2="1">
          <stop offset="0" stopColor="#8d8d8d" />
          <stop offset="0.3" stopColor="#f4f4f4" />
          <stop offset="0.7" stopColor="#c4c4c4" />
          <stop offset="1" stopColor="#6f6f6f" />
        </linearGradient>
      </defs>
      {/* lid and neck */}
      <ellipse cx="150" cy="22" rx="118" ry="18" fill={`url(#${id}-metal)`} />
      <path d="M32 22 Q30 48 18 62 L282 62 Q270 48 268 22 Z" fill={`url(#${id}-metal)`} />
      {/* body */}
      <rect x="18" y="58" width="264" height="520" rx="10" fill={`url(#${id}-body)`} />
      <path d="M18 570 Q20 598 40 604 L260 604 Q280 598 282 570 Z" fill={`url(#${id}-metal)`} />
      {/* label */}
      <Moon x={150} y={190} r={46} color={ink} bg={body[1]} />
      <text x="150" y="315" textAnchor="middle" fill={ink} fontFamily="Poppins" fontWeight={800} fontSize={50} textLength={brand.length > 5 ? 224 : undefined} lengthAdjust="spacingAndGlyphs">
        {brand.toUpperCase()}
      </text>
      <text x="150" y="352" textAnchor="middle" fill={ink} fontFamily="Inter" fontWeight={600} fontSize={17} letterSpacing={5} opacity={0.8}>
        COLD BREW · NO. 7
      </text>
      <line x1="70" x2="230" y1="380" y2="380" stroke={ink} strokeWidth={2} opacity={0.5} />
      {Array.from({length: 7}).map((_, i) => (
        <circle key={i} cx={78 + i * 24} cy={420} r={4} fill={ink} opacity={0.5} />
      ))}
      <text x="150" y="520" textAnchor="middle" fill={ink} fontFamily="Inter" fontWeight={500} fontSize={15} letterSpacing={3} opacity={0.65}>
        12 FL OZ · 355 ML
      </text>
      {/* specular streak */}
      <rect x="70" y="64" width="18" height="508" fill="#fff" opacity={dark ? 0.12 : 0.5} />
    </svg>
  );
};

// A fictional banknote with its own design (not modelled on any real currency).
export const Bill: React.FC<{width?: number}> = ({width = 520}) => (
  <svg width={width} height={width * 0.46} viewBox="0 0 520 240">
    <rect x="0" y="0" width="520" height="240" rx="6" fill="#e3e6df" />
    <rect x="12" y="12" width="496" height="216" rx="4" fill="none" stroke="#5d6559" strokeWidth={3} />
    <rect x="22" y="22" width="476" height="196" rx="3" fill="none" stroke="#8c9388" strokeWidth={1.5} strokeDasharray="2 3" />
    {Array.from({length: 9}).map((_, i) => (
      <path
        key={i}
        d={`M 30 ${60 + i * 16} C 140 ${40 + i * 16}, 240 ${90 + i * 16}, 490 ${55 + i * 16}`}
        stroke="#a6ad9f"
        strokeWidth={1}
        fill="none"
        opacity={0.6}
      />
    ))}
    <circle cx="260" cy="120" r="62" fill="#d2d7cd" stroke="#5d6559" strokeWidth={3} />
    <Moon x={260} y={120} r={34} color="#4d554a" bg="#d2d7cd" />
    <text x="40" y="66" fontFamily="Poppins" fontWeight={800} fontSize={40} fill="#4d554a">100</text>
    <text x="480" y="210" textAnchor="end" fontFamily="Poppins" fontWeight={800} fontSize={40} fill="#4d554a">100</text>
    <text x="400" y="66" textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={14} letterSpacing={3} fill="#5d6559">ONE HUNDRED</text>
    <text x="120" y="206" textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={12} letterSpacing={2} fill="#5d6559">MOON RESERVE</text>
  </svg>
);

export const Briefcase: React.FC<{width?: number}> = ({width = 620}) => (
  <svg width={width} height={width * 0.9} viewBox="0 0 620 560" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id="leather" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2c2c30" />
        <stop offset="1" stopColor="#0c0c0e" />
      </linearGradient>
      <linearGradient id="lining" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4f4f4" />
        <stop offset="1" stopColor="#cfcfcf" />
      </linearGradient>
    </defs>
    {/* open lid, tilted back */}
    <path d="M110 40 L520 20 L560 250 L90 270 Z" fill="url(#leather)" />
    <path d="M130 62 L505 44 L538 236 L112 252 Z" fill="url(#lining)" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${128 - i * 4} ${100 + i * 52} L${512 + i * 6} ${84 + i * 50} L${516 + i * 6} ${104 + i * 50} L${126 - i * 4} ${120 + i * 52} Z`} fill="#222" opacity={0.85} />
    ))}
    {/* base tray with cash bricks */}
    <path d="M60 270 L570 250 L600 330 L40 352 Z" fill="#1b1b1e" />
    {Array.from({length: 3}).map((_, row) =>
      Array.from({length: 5}).map((__, col) => {
        const x = 78 + col * 98 + row * 6;
        const y = 262 + row * 26 - col * 4;
        return (
          <g key={`${row}-${col}`}>
            <rect x={x} y={y} width={92} height={34} rx={3} fill="#e6e9e2" stroke="#9aa196" />
            <rect x={x + 38} y={y} width={16} height={34} fill="#6d7569" />
          </g>
        );
      }),
    )}
    {/* front body */}
    <path d="M40 352 L600 330 L600 500 Q600 520 580 522 L62 540 Q40 540 40 520 Z" fill="url(#leather)" />
    <path d="M40 360 L600 338" stroke="#4a4a4f" strokeWidth={3} />
    <rect x="260" y="372" width="110" height="18" rx="4" fill="#9e9e9e" />
    <rect x="120" y="366" width="34" height="42" rx="4" fill="#bdbdbd" />
    <rect x="476" y="360" width="34" height="42" rx="4" fill="#bdbdbd" />
  </svg>
);

export const Coin: React.FC<{size?: number; label?: string}> = ({size = 400, label = 'IN COFFEE WE TRUST · MOON MINT ·'}) => (
  <svg width={size} height={size} viewBox="0 0 400 400">
    <defs>
      <radialGradient id="silver" cx="0.38" cy="0.32" r="0.8">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.45" stopColor="#c9c9c9" />
        <stop offset="1" stopColor="#5e5e5e" />
      </radialGradient>
      <radialGradient id="silverIn" cx="0.6" cy="0.7" r="0.8">
        <stop offset="0" stopColor="#f0f0f0" />
        <stop offset="1" stopColor="#8c8c8c" />
      </radialGradient>
      <path id="ring" d="M200 200 m-150 0 a150 150 0 1 1 300 0 a150 150 0 1 1 -300 0" />
    </defs>
    <circle cx="200" cy="200" r="196" fill="url(#silver)" />
    {Array.from({length: 150}).map((_, i) => {
      const a = (i / 150) * Math.PI * 2;
      return (
        <line key={i} x1={200 + Math.cos(a) * 188} y1={200 + Math.sin(a) * 188} x2={200 + Math.cos(a) * 196} y2={200 + Math.sin(a) * 196} stroke="#555" strokeWidth={1.4} />
      );
    })}
    <circle cx="200" cy="200" r="178" fill="url(#silverIn)" stroke="#777" strokeWidth={2} />
    <text fontFamily="Poppins" fontWeight={700} fontSize={24} letterSpacing={6} fill="#4c4c4c">
      <textPath href="#ring">{label}</textPath>
    </text>
    <circle cx="200" cy="200" r="118" fill="none" stroke="#8a8a8a" strokeWidth={2} />
    <Moon x={200} y={196} r={70} color="#6e6e6e" bg="#c8c8c8" />
    {[0, 1, 2, 3, 4].map((i) => {
      const a = -Math.PI / 2 + ((i - 2) * Math.PI) / 9;
      return <circle key={i} cx={200 + Math.cos(a) * 100} cy={206 + Math.sin(a) * 100} r={5} fill="#6e6e6e" />;
    })}
  </svg>
);

export const PageCurl: React.FC<{size?: number}> = ({size = 260}) => (
  <svg width={size} height={size} viewBox="0 0 260 260">
    <defs>
      <linearGradient id="curl" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.55" stopColor="#bdbdbd" />
        <stop offset="1" stopColor="#3c3c3c" />
      </linearGradient>
    </defs>
    <path d="M260 40 L260 260 L40 260 Q150 190 260 40 Z" fill="#000" opacity={0.18} />
    <path d="M260 70 Q170 150 70 260 L150 260 Q200 170 260 150 Z" fill="url(#curl)" />
  </svg>
);
