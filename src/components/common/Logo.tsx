import React from 'react';
import { ShakhLogoSVG } from './ShakhLogoSVG';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'color';
  showTagline?: boolean;
  className?: string;
  useEmblemOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'color',
  showTagline = false,
  className = '',
  useEmblemOnly = false
}) => {
  const pixelSizeMap = {
    sm: 36,
    md: 46,
    lg: 60,
    xl: 80
  };

  const sizeMap = {
    sm: { text: 'text-xl', kurdish: 'text-lg', sub: 'text-[9px]' },
    md: { text: 'text-2xl', kurdish: 'text-xl', sub: 'text-[10px]' },
    lg: { text: 'text-3xl', kurdish: 'text-2xl', sub: 'text-xs' },
    xl: { text: 'text-4xl', kurdish: 'text-3xl', sub: 'text-sm' }
  };

  const isLight = variant === 'light';

  if (useEmblemOnly) {
    return (
      <div className={`inline-block group cursor-pointer transition-transform duration-300 hover:scale-105 ${className}`}>
        <ShakhLogoSVG size={pixelSizeMap[size]} showGlow={true} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}>
      {/* Official Circular Logo Emblem */}
      <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
        <ShakhLogoSVG size={pixelSizeMap[size]} showGlow={true} />
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
            بازاڕ و گەیاندنی کوردستان (daim-post.online)
          </span>
        )}
      </div>
    </div>
  );
};

