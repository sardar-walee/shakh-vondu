import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Language,
  LanguageOption,
  SUPPORTED_LANGUAGES,
  RTL_LANGUAGES,
  translate
} from '../locales';

const STORAGE_KEY = 'shakh_language';
const OVERRIDES_STORAGE_KEY = 'shakh_i18n_overrides';
const LEGACY_STORAGE_KEYS = ['language', 'locale', 'selected_language'];

const VALID_LANGUAGES: Language[] = ['ku', 'ku_badini', 'ar', 'en', 'tr'];

interface LanguageContextType {
  language: Language;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  t: (keyOrText: string, params?: Record<string, string | number>) => string;
  supportedLanguages: LanguageOption[];
  customOverrides: Record<string, Record<string, string>>;
  setCustomOverride: (lang: Language, key: string, value: string) => void;
}

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_LANGUAGES.includes(saved as Language)) {
      return saved as Language;
    }

    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyVal = localStorage.getItem(legacyKey);
      if (legacyVal) {
        if (VALID_LANGUAGES.includes(legacyVal as Language)) {
          try {
            localStorage.setItem(STORAGE_KEY, legacyVal);
          } catch {}
          return legacyVal as Language;
        }
        if (legacyVal === 'ku_sorani') {
          try {
            localStorage.setItem(STORAGE_KEY, 'ku');
          } catch {}
          return 'ku';
        }
      }
    }

    const browserLang = navigator.language?.toLowerCase() || '';
    if (browserLang.startsWith('ar')) return 'ar';
    if (browserLang.startsWith('tr')) return 'tr';
    if (browserLang.startsWith('fa')) return 'fa';
    if (browserLang.startsWith('en')) return 'en';
  } catch (e) {
    console.warn('Failed to read language preference from storage:', e);
  }
  return 'ku';
}

// Immediately apply initial language direction to HTML to avoid layout flash
if (typeof document !== 'undefined') {
  try {
    const initLang = getInitialLanguage();
    const initDir = RTL_LANGUAGES.includes(initLang) ? 'rtl' : 'ltr';
    document.documentElement.dir = initDir;
    document.documentElement.lang = initLang === 'ku_badini' ? 'ku' : initLang;
    if (initDir === 'rtl') {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
  } catch (e) {
    console.warn('Initial document language setup skipped:', e);
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [customOverrides, setCustomOverrides] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem(OVERRIDES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const dir: 'rtl' | 'ltr' = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';

  const applyLanguageEffects = useCallback((lang: Language) => {
    const computedDir: 'rtl' | 'ltr' = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Failed to save language to localStorage:', e);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.dir = computedDir;
      document.documentElement.lang = lang === 'ku_badini' ? 'ku' : lang;
      if (computedDir === 'rtl') {
        document.documentElement.classList.add('rtl');
        document.documentElement.classList.remove('ltr');
      } else {
        document.documentElement.classList.add('ltr');
        document.documentElement.classList.remove('rtl');
      }
      if (document.body) {
        document.body.dir = computedDir;
      }
    }
  }, []);

  useEffect(() => {
    applyLanguageEffects(language);
  }, [language, applyLanguageEffects]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && VALID_LANGUAGES.includes(e.newValue as Language)) {
        setLanguageState(e.newValue as Language);
        applyLanguageEffects(e.newValue as Language);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [applyLanguageEffects]);

  const setLanguage = useCallback((lang: Language) => {
    if (VALID_LANGUAGES.includes(lang)) {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {
        console.warn('Failed to save language to localStorage:', e);
      }
      setLanguageState(lang);
      applyLanguageEffects(lang);
    }
  }, [applyLanguageEffects]);

  const setCustomOverride = useCallback((lang: Language, key: string, value: string) => {
    setCustomOverrides(prev => {
      const updated = {
        ...prev,
        [lang]: {
          ...(prev[lang] || {}),
          [key]: value
        }
      };
      try {
        localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save translation override:', e);
      }
      return updated;
    });
  }, []);

  const t = useCallback((keyOrText: string, params?: Record<string, string | number>): string => {
    if (!keyOrText) return '';
    const trimmed = keyOrText.trim();

    // Check custom overrides first
    if (customOverrides[language]?.[trimmed]) {
      let val = customOverrides[language][trimmed];
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          val = val
            .replace(new RegExp(`#{${k}}`, 'g'), String(v))
            .replace(new RegExp(`{${k}}`, 'g'), String(v));
        }
      }
      return val;
    }

    return translate(trimmed, language, params);
  }, [language, customOverrides]);

  return (
    <LanguageContext.Provider value={{
      language,
      currentLanguage: language,
      setLanguage,
      dir,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
      customOverrides,
      setCustomOverride
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to observe language changes and dynamically update document direction & attributes
 */
export const useDirectionObserver = () => {
  const { language, dir } = useLanguage();

  useEffect(() => {
    const computedDir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
    const htmlEl = document.documentElement;

    htmlEl.setAttribute('dir', computedDir);
    htmlEl.setAttribute('lang', language === 'ku_badini' ? 'ku' : language);
    
    if (computedDir === 'rtl') {
      htmlEl.classList.add('rtl');
      htmlEl.classList.remove('ltr');
    } else {
      htmlEl.classList.add('ltr');
      htmlEl.classList.remove('rtl');
    }

    if (document.body) {
      document.body.setAttribute('dir', computedDir);
    }
  }, [language, dir]);

  return { language, dir, isRtl: dir === 'rtl' };
};

export const useDirection = () => {
  const { dir } = useLanguage();
  return { dir, isRtl: dir === 'rtl', isLtr: dir === 'ltr' };
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export type { Language };
