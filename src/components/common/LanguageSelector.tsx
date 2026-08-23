import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language, SUPPORTED_LANGUAGES } from '../../locales';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'default' | 'compact' | 'minimal' | 'full';
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'default',
  showLabel = true
}) => {
  const { language, setLanguage, supportedLanguages, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentLang = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  const handleSelectLanguage = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  const getSubLabel = (code: Language): string => {
    switch (code) {
      case 'ku': return 'Kurdish (Sorani)';
      case 'ku_badini': return 'Kurdish (Badini)';
      case 'ar': return 'Arabic';
      case 'en': return 'English';
      case 'tr': return 'Turkish';
      case 'fa': return 'Persian';
      default: return '';
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-start ${className}`} dir={dir}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all duration-200 cursor-pointer select-none active:scale-95 ${
          isOpen
            ? 'bg-blue-50 dark:bg-slate-800 border-[#2563EB] text-[#2563EB] dark:text-blue-400 shadow-md ring-2 ring-blue-500/20'
            : 'bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs'
        }`}
        title={`Language: ${currentLang.name}`}
      >
        <div className="w-5 h-5 rounded-full bg-blue-500/10 dark:bg-blue-400/20 flex items-center justify-center flex-shrink-0 text-[#2563EB] dark:text-blue-400">
          <Globe className="w-3.5 h-3.5" />
        </div>

        <span className="text-sm leading-none">{currentLang.flag}</span>

        {showLabel && (
          <span className="text-xs font-bold whitespace-nowrap">
            {currentLang.label}
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#2563EB]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            dir === 'rtl' ? 'left-0' : 'right-0'
          }`}
        >
          {/* Header */}
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">
                زمانی سیستەم / Language
              </span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-400 font-latin">
              6 Languages
            </span>
          </div>

          {/* List of 6 Supported Languages */}
          <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
            {supportedLanguages.map(langItem => {
              const isSelected = language === langItem.code;
              return (
                <button
                  key={langItem.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectLanguage(langItem.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/90 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg flex-shrink-0 leading-none">
                      {langItem.flag}
                    </span>
                    <div className="text-start truncate">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="truncate">{langItem.name}</span>
                        {langItem.dir === 'rtl' && (
                          <span className={`text-[9px] px-1 py-0.2 rounded font-latin ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>
                            RTL
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] font-latin truncate ${
                        isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {getSubLabel(langItem.code)}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/80 mt-1 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
            <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
            <span className="truncate">Auto-adjusts text direction & layouts</span>
          </div>
        </div>
      )}
    </div>
  );
};
