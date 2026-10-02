import React from 'react';

/**
 * Shiftly Official Logo & Brandmark Component
 * Featuring the official 3D extruded Shiftly brandmark in HD.
 */
export default function ShiftlyLogo({ 
  size = 70, 
  variant = 'badge', 
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
        height: `${Math.round(size * 0.88)}px`, 
        borderRadius: `${Math.max(12, Math.round(size * 0.20))}px`,
        objectFit: 'cover',
        display: 'block',
        flexShrink: 0,
        boxShadow: '0 8px 24px rgba(0, 82, 255, 0.38), 0 3px 10px rgba(0, 0, 0, 0.16)',
        border: '2.5px solid #ffffff',
        transition: 'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s ease'
      }} 
    />
  );

  // Standalone Brandmark / Badge (Default)
  if (variant === 'badge' || variant === 'icon-only' || variant === 'brandmark' || variant === 'standalone') {
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

  // Fallback 'inline' with wordmark if explicitly requested
  return (
    <div 
      className={`shiftly-brandmark-inline ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '12px', 
        ...style 
      }}
    >
      {logoImg}
      <span 
        className="lemfi-3d-title-dark" 
        style={{ 
          fontSize: `${Math.max(20, size * 0.52)}px`,
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
