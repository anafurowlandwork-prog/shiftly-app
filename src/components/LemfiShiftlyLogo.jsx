import React from 'react';

/**
 * Exact LemFi Typography for Shiftly with Speed Arrow attached to 'y'
 * 
 * Features:
 * - Top Line: "SHiFT" (Chunky modular slab block letters with custom notches & lowercase 'i')
 * - Bottom Line: "ly" with the 'y' extending seamlessly into the rightward speed arrow with motion dash cuts
 * - Pure white letter faces (#ffffff) with black 3D extruded drop shadow (#000000)
 * - Electric Royal Blue background (#0052ff)
 */
export default function LemfiShiftlyLogo({ 
  size = 180, 
  showBackground = true,
  className = '',
  style = {}
}) {
  return (
    <div 
      className={`lemfi-shiftly-logo ${className}`}
      style={{
        width: `${size}px`,
        height: `${size * 0.85}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: showBackground ? '#0052ff' : 'transparent',
        borderRadius: showBackground ? '20px' : '0px',
        padding: '12px 16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: showBackground ? '0 12px 28px rgba(0, 82, 255, 0.35)' : 'none',
        ...style
      }}
    >
      <svg 
        viewBox="0 0 620 440" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <filter id="lemfi3d-arrow-react" x="-20%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="2" dy="2" stdDeviation="0" floodColor="#000000" floodOpacity="1"/>
            <feDropShadow dx="4" dy="4" stdDeviation="0" floodColor="#000000" floodOpacity="1"/>
            <feDropShadow dx="6" dy="6" stdDeviation="0" floodColor="#000000" floodOpacity="1"/>
            <feDropShadow dx="8" dy="8" stdDeviation="0" floodColor="#000000" floodOpacity="1"/>
            <feDropShadow dx="10" dy="10" stdDeviation="0" floodColor="#000000" floodOpacity="1"/>
            <feDropShadow dx="12" dy="12" stdDeviation="0" floodColor="#000000" floodOpacity="1"/>
            <feDropShadow dx="14" dy="14" stdDeviation="0" floodColor="#000000" floodOpacity="1"/>
            <feDropShadow dx="16" dy="16" stdDeviation="0" floodColor="#000000" floodOpacity="1"/>
          </filter>
        </defs>

        <g transform="translate(20, 30)">
          {/* TOP ROW: SHiFT */}
          <g transform="translate(0, 0)">
            {/* S */}
            <path 
              d="M 0 30 L 30 0 L 90 0 L 90 36 L 36 36 L 36 56 L 85 65 L 90 115 L 60 145 L 0 145 L 0 108 L 54 108 L 54 90 L 5 80 Z" 
              fill="#ffffff" 
              filter="url(#lemfi3d-arrow-react)"
            />
            
            {/* H */}
            <path 
              d="M 108 0 L 144 0 L 144 50 L 170 50 L 170 0 L 206 0 L 206 145 L 170 145 L 170 86 L 144 86 L 144 145 L 108 145 Z" 
              fill="#ffffff" 
              filter="url(#lemfi3d-arrow-react)"
            />
            
            {/* i (Stepped pedestal like LemFi) */}
            <path 
              d="M 235 0 L 265 0 L 265 28 L 235 28 Z M 225 44 L 275 44 L 275 68 L 262 68 L 262 118 L 282 118 L 282 145 L 218 145 L 218 118 L 238 118 L 238 68 L 225 68 Z" 
              fill="#ffffff" 
              filter="url(#lemfi3d-arrow-react)"
            />
            
            {/* F */}
            <path 
              d="M 302 0 L 392 0 L 392 36 L 338 36 L 338 56 L 378 56 L 378 88 L 338 88 L 338 145 L 302 145 Z" 
              fill="#ffffff" 
              filter="url(#lemfi3d-arrow-react)"
            />
            
            {/* T */}
            <path 
              d="M 408 0 L 498 0 L 498 36 L 471 36 L 471 145 L 435 145 L 435 36 L 408 36 Z" 
              fill="#ffffff" 
              filter="url(#lemfi3d-arrow-react)"
            />
          </g>

          {/* BOTTOM ROW: ly WITH RIGHT-POINTING SPEED ARROW & DASH CUTOUTS */}
          <g transform="translate(160, 185)">
            {/* l */}
            <path 
              d="M 0 0 L 36 0 L 36 108 L 85 108 L 85 145 L 0 145 Z" 
              fill="#ffffff" 
              filter="url(#lemfi3d-arrow-react)"
            />

            {/* y with Speed Arrow + Motion Dashes */}
            <g filter="url(#lemfi3d-arrow-react)">
              <path 
                d="M 105 0 
                   L 142 0 
                   L 165 55 
                   L 188 0 
                   L 225 0 
                   L 190 82 
                   L 190 108
                   L 280 108
                   L 270 82
                   L 345 126
                   L 270 170
                   L 280 145
                   L 152 145 
                   L 152 82 Z" 
                fill="#ffffff" 
              />
              {/* Speed Dash Cutouts (1 dot + 1 dash in electric blue) */}
              <rect x="205" y="121" width="12" height="10" rx="4" fill="#0052ff" />
              <rect x="225" y="121" width="38" height="10" rx="4" fill="#0052ff" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
