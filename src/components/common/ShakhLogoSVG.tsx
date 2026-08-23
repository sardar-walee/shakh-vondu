import React from 'react';

interface ShakhLogoSVGProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

export const ShakhLogoSVG: React.FC<ShakhLogoSVGProps> = ({
  className = '',
  size = 120,
  showGlow = true
}) => {
  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={`select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Neon Ring Glow Filter */}
        <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Sun Glow Filter */}
        <filter id="sunGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Text Drop Shadow */}
        <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.8" />
        </filter>

        {/* Outer Ring Gradient */}
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="50%" stopColor="#FF4500" />
          <stop offset="100%" stopColor="#FF7A00" />
        </linearGradient>

        {/* Sun Gradient */}
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB700" />
          <stop offset="60%" stopColor="#FF5500" />
          <stop offset="100%" stopColor="#CC2200" />
        </radialGradient>

        {/* Shakh Text Gradient */}
        <linearGradient id="shakhTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Daim Post Text Gradient */}
        <linearGradient id="daimTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF7700" />
          <stop offset="100%" stopColor="#FFAA00" />
        </linearGradient>

        {/* Curved Path for dime-post.online */}
        <path
          id="textArcPath"
          d="M 85 340 A 185 185 0 0 0 415 340"
          fill="none"
        />
      </defs>

      {/* Outer Ambient Glow Circle */}
      {showGlow && (
        <circle
          cx="250"
          cy="250"
          r="230"
          fill="none"
          stroke="#FF5500"
          strokeWidth="12"
          opacity="0.3"
          filter="url(#orangeGlow)"
        />
      )}

      {/* Main Circular Background Badge */}
      <circle cx="250" cy="250" r="225" fill="#0A0A0C" />
      <circle cx="250" cy="250" r="222" fill="#141418" />

      {/* Outer Double Neon Ring */}
      <circle
        cx="250"
        cy="250"
        r="215"
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="10"
        filter={showGlow ? 'url(#orangeGlow)' : undefined}
      />
      <circle
        cx="250"
        cy="250"
        r="206"
        fill="none"
        stroke="#FF3300"
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Setting Sun Background Disc */}
      <circle cx="250" cy="175" r="95" fill="url(#sunGrad)" filter="url(#sunGlow)" opacity="0.9" />

      {/* Sun Speed Rays behind Mountains */}
      <path d="M 110 160 L 190 160" stroke="#FF7700" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <path d="M 90 180 L 160 180" stroke="#FF5500" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      <path d="M 310 160 L 390 160" stroke="#FF7700" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <path d="M 340 180 L 410 180" stroke="#FF5500" strokeWidth="5" strokeLinecap="round" opacity="0.8" />

      {/* MOUNTAIN RANGE */}
      <g filter="url(#textShadow)">
        {/* Left Background Peak */}
        <polygon points="105,285 195,180 285,285" fill="#121216" />
        <polygon points="195,180 195,285 285,285" fill="#1A1A22" />
        <polygon points="195,180 170,220 195,210 220,220" fill="#FFFFFF" />

        {/* Right Background Peak */}
        <polygon points="260,285 345,175 425,285" fill="#181820" />
        <polygon points="345,175 345,285 425,285" fill="#22222E" />
        <polygon points="345,175 320,215 345,205 370,215" fill="#E2E8F0" />

        {/* Central Main High Snow Peak (SHAKH Peak) */}
        <polygon points="150,285 250,115 350,285" fill="#0F0F14" />
        {/* Lit Snow Side */}
        <polygon points="250,115 150,285 250,285" fill="#FFFFFF" />
        {/* Shadowed Rock Face */}
        <polygon points="250,115 250,285 350,285" fill="#1E1E26" />

        {/* Jagged Ridge Shading on Main Peak */}
        <polygon points="250,115 210,185 235,175 190,245 220,235 150,285 250,285" fill="#F8FAFC" />
        <polygon points="250,115 280,170 260,180 300,230 280,240 350,285 250,285" fill="#2A2A36" />
      </g>

      {/* BADGE RIBBON / TEXT BANNER BASE */}
      {/* SHAKH TEXT */}
      <g filter="url(#textShadow)">
        {/* Black Text Outline Backdrop */}
        <text
          x="250"
          y="312"
          textAnchor="middle"
          fill="#000000"
          stroke="#000000"
          strokeWidth="16"
          strokeLinejoin="round"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="82"
          fontStyle="italic"
          letterSpacing="4"
        >
          SHAKH
        </text>

        {/* Main White SHAKH Fill */}
        <text
          x="250"
          y="312"
          textAnchor="middle"
          fill="url(#shakhTextGrad)"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="82"
          fontStyle="italic"
          letterSpacing="4"
        >
          SHAKH
        </text>
      </g>

      {/* DAIM POST SUBTITLE */}
      <g filter="url(#textShadow)">
        {/* Speed Lines next to DAIM POST */}
        <line x1="100" y1="342" x2="155" y2="342" stroke="#FF5500" strokeWidth="5" strokeLinecap="round" />
        <line x1="115" y1="352" x2="165" y2="352" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round" />

        <line x1="345" y1="342" x2="400" y2="342" stroke="#FF5500" strokeWidth="5" strokeLinecap="round" />
        <line x1="335" y1="352" x2="385" y2="352" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round" />

        <text
          x="250"
          y="352"
          textAnchor="middle"
          fill="url(#daimTextGrad)"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="32"
          fontStyle="italic"
          letterSpacing="3"
        >
          DAIM POST
        </text>
      </g>

      {/* MOVING PACKAGE / DELIVERY BOX ICON */}
      <g transform="translate(205, 362) scale(0.9)" filter="url(#textShadow)">
        {/* Speed Trails */}
        <path d="M 0 18 L -35 18" stroke="#FF5500" strokeWidth="4" strokeLinecap="round" />
        <path d="M 5 26 L -42 26" stroke="#FF7700" strokeWidth="5" strokeLinecap="round" />
        <path d="M 12 34 L -30 34" stroke="#FF9900" strokeWidth="4" strokeLinecap="round" />

        {/* 3D Package Cube */}
        {/* Top Face */}
        <polygon points="45,5 75,18 45,30 15,18" fill="#FF8C00" />
        {/* Left Face */}
        <polygon points="15,18 45,30 45,55 15,42" fill="#E65100" />
        {/* Right Face */}
        <polygon points="45,30 75,18 75,42 45,55" fill="#FF6D00" />
        {/* Tape Line */}
        <path d="M 45,5 L 45,30 L 45,55" stroke="#FFA726" strokeWidth="2.5" fill="none" />
      </g>

      {/* CURVED BOTTOM DOMAIN TEXT: dime-post.online / daim-post.online */}
      <text fill="#FFFFFF" fontWeight="800" fontSize="23" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="2">
        <textPath href="#textArcPath" startOffset="50%" textAnchor="middle">
          daim-post.online
        </textPath>
      </text>
    </svg>
  );
};
