import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../locales';

interface LanguageSwitcherProps {
  variant?: 'pills' | 'dropdown' | 'mobile' | 'full';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  className = ''
}) => {
  const { language, setLanguage, supportedLanguages, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  if (variant === 'pills') {
    return (
      <div className={`flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold border border-slate-200/80 dark:border-slate-700/80 ${className}`}>
        {supportedLanguages.map(l => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer text-[11px] font-bold flex items-center gap-1 ${
              language === l.code
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60'
            }`}
            title={l.name}
          >
            <span>{l.flag}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'mobile' || variant === 'full') {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block px-1 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>زمانی سیستەم / System Language</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {supportedLanguages.map(l => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
              }}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                language === l.code
                  ? 'bg-blue-50 dark:bg-blue-900/40 border-[#2563EB] text-[#2563EB] dark:text-blue-400 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{l.flag}</span>
                <span className="truncate">{l.name}</span>
              </div>
              {language === l.code && <Check className="w-4 h-4 text-[#2563EB]" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default Dropdown Variant
  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
        aria-label="Language selector"
      >
        <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
        <span>{currentLangObj.flag}</span>
        <span className="font-bold">{currentLangObj.label}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 ${
            dir === 'rtl' ? 'left-0' : 'right-0'
          }`}
        >
          <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
            Select Language
          </div>
          <div className="space-y-0.5">
            {supportedLanguages.map(l => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  language === l.code
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                </div>
                {language === l.code && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
