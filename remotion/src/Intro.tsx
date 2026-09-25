import {z} from 'zod';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const introSchema = z.object({
  name: z.string(),
  role: z.string(),
});

// Warm orange field under a dark surface, matching the site's frost-glass look.
export const Intro: React.FC<z.infer<typeof introSchema>> = ({name, role}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const rise = spring({frame, fps, config: {damping: 200}});
  const roleIn = spring({frame: frame - 15, fps, config: {damping: 200}});
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const drift = interpolate(frame, [0, durationInFrames], [0, 12]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${40 + drift}% 30%, #ff8a2a 0%, #c2410c 35%, #1a0d05 80%)`,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, Helvetica, Arial, sans-serif',
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          padding: '72px 96px',
          borderRadius: 40,
          background: 'rgba(16, 14, 12, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#fff',
          textAlign: 'center',
          transform: `translateY(${(1 - rise) * 40}px)`,
          opacity: rise,
        }}
      >
        <div style={{fontSize: 120, fontWeight: 700, letterSpacing: -3}}>
          {name}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 40,
            color: 'rgba(255, 255, 255, 0.75)',
            opacity: roleIn,
          }}
        >
          {role}
        </div>
      </div>
    </AbsoluteFill>
  );
};
