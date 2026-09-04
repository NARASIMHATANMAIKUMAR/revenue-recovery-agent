import React from 'react';

interface ValtixLogoProps {
  size?: number;
  showTagline?: boolean;
  className?: string;
  horizontal?: boolean;
}

export const ValtixLogo: React.FC<ValtixLogoProps> = ({
  size = 36,
  showTagline = true,
  className = '',
  horizontal = false,
}) => {
  return (
    <div className={`valtix-logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* Custom Vector Emblem */}
      <div
        className="valtix-logo-badge"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        {/* Glow Effect */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(99, 102, 241, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* SVG Stylized 'V' Logo Symbol */}
        <svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ zIndex: 1, filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
        >
          {/* Left Wing of V */}
          <path
            d="M5 6L14 26C14.5 27.1 15.5 27.1 16 26L20 17L12 6H5Z"
            fill="url(#v_grad_left)"
          />
          {/* Right Wing of V with Revenue Growth Arrow Notch */}
          <path
            d="M27 6L16 26C15.5 27.1 14.5 27.1 14 26L11 20.5L16.5 12H27Z"
            fill="url(#v_grad_right)"
          />
          {/* Glowing Center Core Spark */}
          <path
            d="M16 6L21 14H16L18.5 20L11 11H16L16 6Z"
            fill="url(#v_spark)"
            opacity="0.95"
          />

          <defs>
            <linearGradient id="v_grad_left" x1="5" y1="6" x2="20" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="v_grad_right" x1="27" y1="6" x2="11" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="0.6" stopColor="#818cf8" />
              <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="v_spark" x1="16" y1="6" x2="16" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text & Tagline */}
      <div style={{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', alignItems: horizontal ? 'baseline' : 'flex-start', gap: horizontal ? '0.6rem' : '0.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              fontWeight: 900,
              fontSize: '1.2rem',
              letterSpacing: '0.08em',
              background: 'linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'JetBrains Mono', 'Inter', monospace",
              lineHeight: 1.1
            }}
          >
            VALTIX
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '0.12rem 0.35rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            AI
          </span>
        </div>

        {showTagline && (
          <div
            style={{
              fontSize: '0.68rem',
              color: '#94a3b8',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}
          >
            Value-Aware Revenue Recovery Intelligence
          </div>
        )}
      </div>
    </div>
  );
};
