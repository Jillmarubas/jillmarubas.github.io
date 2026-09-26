import React from 'react';
import {C, glassDepth} from '../theme';

// A frosted surface: blur + translucent dark fill + lit rim + depth.
// `nested` drops the backdrop blur — never glass on glass.
export const Glass: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  nested?: boolean;
  radius?: number;
}> = ({style, children, nested, radius = 18}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: radius,
      background: nested ? 'rgba(255,255,255,.05)' : C.glassStrong,
      backdropFilter: nested ? undefined : 'blur(20px) saturate(150%)',
      WebkitBackdropFilter: nested ? undefined : 'blur(20px) saturate(150%)',
      border: `1px solid ${C.rim}`,
      boxShadow: nested ? 'inset 0 1px 0 rgba(255,255,255,.12)' : glassDepth,
      ...style,
    }}
  >
    {children}
  </div>
);
