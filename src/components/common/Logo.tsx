import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'color';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'color',
  showTagline = false,
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-xl', kurdish: 'text-lg', sub: 'text-[9px]', peakSvg: 'w-5 h-5' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', kurdish: 'text-xl', sub: 'text-[10px]', peakSvg: 'w-6 h-6' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', kurdish: 'text-2xl', sub: 'text-xs', peakSvg: 'w-8 h-8' },
    xl: { icon: 'w-16 h-16', text: 'text-4xl', kurdish: 'text-3xl', sub: 'text-sm', peakSvg: 'w-10 h-10' }
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      {/* Animated Mountain Peak & Delivery Icon Container */}
      <div className={`relative ${sizeMap[size].icon} flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF4500] via-[#FF6600] to-[#FF8800] shadow-[0_0_20px_rgba(255,85,0,0.5)] group-hover:shadow-[0_0_28px_rgba(255,85,0,0.8)] transition-all duration-300 overflow-hidden`}>
        
        {/* Animated Shimmer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        {/* Ambient Glow Pulse Aura */}
        <div className="absolute -inset-1 rounded-2xl bg-[#FF5500]/30 blur-sm group-hover:blur-md animate-pulse pointer-events-none" />

        {/* SVG Mountain Peak ("شاخ") Symbol */}
        <svg
          viewBox="0 0 100 100"
          className={`${sizeMap[size].peakSvg} relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Back Mountain Peak (Blue) */}
          <path
            d="M25 80 L52 32 L78 80 Z"
            fill="#1E3A8A"
            fillOpacity="0.8"
          />

          {/* Foreground Main Mountain Peak (Shakh) - Pristine White with Orange Glow */}
          <path
            d="M50 14 L16 80 L84 80 Z"
            fill="white"
            className="animate-mountain-pulse"
          />

          {/* Snow Cap on Top of Shakh Peak */}
          <path
            d="M50 14 L41 34 L50 30 L59 34 Z"
            fill="#3B82F6"
          />

          {/* Inner Mountain Cutout / Valley Arrow */}
          <path
            d="M50 42 L34 80 L66 80 Z"
            fill="#FF5500"
          />

          {/* Center Shining Star / Sparkle */}
          <circle cx="50" cy="28" r="4" fill="#FFFFFF" className="animate-ping" />
          <circle cx="50" cy="28" r="4" fill="#3B82F6" />
        </svg>

        {/* Floating Glowing Blue Fast-Delivery Beacon */}
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#2563EB] ring-2 ring-white dark:ring-slate-900 animate-beacon-glow z-20 shadow-[0_0_10px_rgba(37,99,235,0.9)]"></span>
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col leading-none text-right">
        <div className="flex items-center gap-1.5 font-black">
          {/* Kurdish "شاخ" in Glowing Orange */}
          <span className={`${sizeMap[size].kurdish} font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF3300] via-[#FF5500] to-[#FF7700] drop-shadow-[0_2px_10px_rgba(255,85,0,0.3)] group-hover:drop-shadow-[0_2px_16px_rgba(255,85,0,0.6)] transition-all duration-300`}>
            شاخ
          </span>

          {/* English "SHAKH" in Deep Blue & White */}
          <span dir="ltr" className={`inline-block font-latin tracking-tight font-black ${sizeMap[size].text}`}>
            <span className="text-[#FF5500] drop-shadow-[0_1px_4px_rgba(255,85,0,0.4)]">SH</span>
            <span className={isLight ? 'text-white' : 'text-[#2563EB] dark:text-blue-400'}>AKH</span>
          </span>
        </div>

        {showTagline && (
          <span className={`font-semibold ${sizeMap[size].sub} ${isLight ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'} mt-1 flex items-center gap-1 justify-end`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse"></span>
            بازاڕ و گەیاندنی کوردستان
          </span>
        )}
      </div>
    </div>
  );
};
