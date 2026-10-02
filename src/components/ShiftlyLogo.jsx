import React from 'react';

/**
 * Shiftly Official Logo & Brandmark Component
 * Featuring the official 3D extruded Shiftly brandmark in HD.
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
      src="/shiftly-logo-hd.png" 
      alt="Shiftly Official Logo" 
      style={{ 
        width: `${size}px`, 
        height: `${size * 0.88}px`, 
        borderRadius: '9px',
        objectFit: 'cover',
        display: 'block',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0, 82, 255, 0.22)',
        border: '1.5px solid rgba(255, 255, 255, 0.8)'
      }} 
    />
  );

  // Pure Icon / Badge Only (Official Logo Emblem)
  if (variant === 'icon-only' || variant === 'badge' || variant === 'brandmark') {
    return (
      <div 
        className={`shiftly-logo-badge ${className}`} 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...style 
        }}
      >
        {logoImg}
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
            fontSize: `${Math.max(16, size * 0.48)}px`,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-heading)'
          }}
        >
          SHIFTLY
        </span>
      </div>
    );
  }

  // Default: 'inline' — Displays the Official Shiftly Logo Emblem with optional bold title
  return (
    <div 
      className={`shiftly-brandmark-inline ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '9px', 
        ...style 
      }}
    >
      {logoImg}
      <span 
        className="lemfi-3d-title-dark" 
        style={{ 
          fontSize: `${Math.max(18, size * 0.58)}px`,
          letterSpacing: '-0.03em',
          fontFamily: 'var(--font-heading)',
          color: '#09090b',
          fontWeight: 900
        }}
      >
        SHIFTLY
      </span>
    </div>
  );
}
