import React from 'react';

/**
 * Shiftly Official Logo & Brandmark Component
 * Featuring the locked-in S-Monogram and the chunky 3D extruded block font.
 */
export default function ShiftlyLogo({ 
  size = 36, 
  variant = 'inline', 
  theme = 'light',
  className = '',
  style = {}
}) {
  const logoImg = (
    <img 
      src="/assets/logo.png" 
      alt="Shiftly Logo" 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0
      }} 
    />
  );

  if (variant === 'icon-only') {
    return (
      <div className={`shiftly-logo-icon ${className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        {logoImg}
      </div>
    );
  }

  // LemFi-style 3D block wordmark
  if (variant === 'lemfi-3d') {
    return (
      <div className={`shiftly-brandmark-lemfi ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', ...style }}>
        {logoImg}
        <span 
          className="lemfi-3d-title-dark" 
          style={{ 
            fontSize: `${Math.max(20, size * 0.65)}px`,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-heading)'
          }}
        >
          SHIFTLY
        </span>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`shiftly-brandmark-stacked ${className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', ...style }}>
        {logoImg}
        <span 
          className="lemfi-3d-title-dark" 
          style={{ 
            fontSize: `${Math.max(18, size * 0.52)}px`,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-heading)'
          }}
        >
          SHIFTLY
        </span>
      </div>
    );
  }

  // Default: 'inline' with 3D block font
  return (
    <div className={`shiftly-brandmark-inline ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', ...style }}>
      {logoImg}
      <span 
        className="lemfi-3d-title-dark" 
        style={{ 
          fontSize: `${Math.max(18, size * 0.58)}px`,
          letterSpacing: '-0.02em',
          fontFamily: 'var(--font-heading)'
        }}
      >
        SHIFTLY
      </span>
    </div>
  );
}
