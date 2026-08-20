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
    sm: { icon: 'w-7 h-7', text: 'text-lg', kurdish: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-2xl', kurdish: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 'w-11 h-11', text: 'text-3xl', kurdish: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-14 h-14', text: 'text-4xl', kurdish: 'text-3xl', sub: 'text-sm' }
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Mountain Peak & Delivery Icon */}
      <div className={`relative ${sizeMap[size].icon} flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#F97316] to-[#fb923c] shadow-sm`}>
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shakh Mountain Peak Symbol */}
          <path
            d="M50 18L18 78H82L50 18Z"
            fill="white"
            fillOpacity="0.95"
          />
          {/* Inner Mountain Valley & Arrow */}
          <path
            d="M50 42L35 78H65L50 42Z"
            fill="#F97316"
          />
          {/* Fast Delivery Blue Dot */}
          <circle cx="50" cy="32" r="7" fill="#2563EB" />
        </svg>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#2563EB] ring-2 ring-white"></span>
      </div>

      <div className="flex flex-col leading-none text-right">
        <div className="flex items-center gap-1.5 font-black">
          <span className={`${sizeMap[size].kurdish} ${isLight ? 'text-white' : 'text-slate-900'}`}>
            شاخی
          </span>
          <div className={`flex items-center font-latin tracking-tight font-black ${sizeMap[size].text}`}>
            <span className="text-[#F97316]">SH</span>
            <span className="text-[#2563EB]">AKH</span>
          </div>
        </div>
        {showTagline && (
          <span className={`font-medium ${sizeMap[size].sub} ${isLight ? 'text-slate-300' : 'text-slate-500'} mt-0.5`}>
            بازاڕ و گەیاندنی کوردستان
          </span>
        )}
      </div>
    </div>
  );
};

