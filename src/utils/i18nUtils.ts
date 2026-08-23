import { Language } from '../context/LanguageContext';

/**
 * Utility to extract localized text from a string or multilingual record object.
 * Example structure for multilingual record:
 * {
 *   ku: "بەرگەر",
 *   ku_badini: "بەرگەر",
 *   ar: "برغر",
 *   en: "Burger",
 *   tr: "Burger",
 *   fa: "برگر"
 * }
 */
export function getLocalizedText(
  value: string | Record<string, string> | undefined | null,
  lang: Language,
  fallback: string = ''
): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  
  if (typeof value === 'object') {
    if (value[lang] && typeof value[lang] === 'string' && value[lang].trim() !== '') {
      return value[lang];
    }
    // Fallbacks chain
    if (value['ku'] && typeof value['ku'] === 'string' && value['ku'].trim() !== '') {
      return value['ku'];
    }
    if (value['ku_badini'] && typeof value['ku_badini'] === 'string' && value['ku_badini'].trim() !== '') {
      return value['ku_badini'];
    }
    if (value['ar'] && typeof value['ar'] === 'string' && value['ar'].trim() !== '') {
      return value['ar'];
    }
    if (value['en'] && typeof value['en'] === 'string' && value['en'].trim() !== '') {
      return value['en'];
    }
    // Any available language
    const keys = Object.keys(value);
    for (const key of keys) {
      if (value[key] && typeof value[key] === 'string' && value[key].trim() !== '') {
        return value[key];
      }
    }
  }

  return fallback;
}

/**
 * Formats numbers according to language locale without modifying identifiers
 */
export function formatNumber(num: number | string, lang: Language): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return String(num || '');

  const localeMap: Record<Language, string> = {
    ku: 'ckb-IQ',
    ku_badini: 'ckb-IQ',
    ar: 'ar-IQ',
    en: 'en-US',
    tr: 'tr-TR',
    fa: 'fa-IR'
  };

  try {
    return new Intl.NumberFormat(localeMap[lang] || 'en-US').format(n);
  } catch (e) {
    return n.toLocaleString();
  }
}

/**
 * Formats currency (Iraqi Dinar) according to language locale
 */
export function formatCurrency(amount: number, lang: Language): string {
  const formatted = formatNumber(amount, lang);
  
  const symbolMap: Record<Language, string> = {
    ku: 'د.ع',
    ku_badini: 'د.ع',
    ar: 'د.ع',
    en: 'IQD',
    tr: 'IQD',
    fa: 'د.ع'
  };

  const symbol = symbolMap[lang] || 'IQD';

  // LTR languages place symbol after or before
  if (lang === 'en' || lang === 'tr') {
    return `${formatted} ${symbol}`;
  }
  return `${formatted} ${symbol}`;
}

/**
 * Formats dates based on selected language
 */
export function formatDate(dateInput: string | Date | number, lang: Language): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const localeMap: Record<Language, string> = {
    ku: 'ckb-IQ',
    ku_badini: 'ckb-IQ',
    ar: 'ar-IQ',
    en: 'en-US',
    tr: 'tr-TR',
    fa: 'fa-IR'
  };

  try {
    return new Intl.DateTimeFormat(localeMap[lang] || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (e) {
    return date.toLocaleDateString();
  }
}
