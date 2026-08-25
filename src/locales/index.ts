import { kuTranslations } from './ku';
import { kuBadiniTranslations } from './ku_badini';
import { arTranslations } from './ar';
import { enTranslations } from './en';
import { trTranslations } from './tr';
import { faTranslations } from './fa';

export type Language = 'ku' | 'ku_badini' | 'ar' | 'en' | 'tr' | 'fa';

export interface LanguageOption {
  code: Language;
  name: string; // Native name
  label: string; // Short code / display label
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ku', name: 'کوردی (سۆرانی)', label: 'کوردی', flag: '☀️', dir: 'rtl' },
  { code: 'ku_badini', name: 'کوردی (بادینی)', label: 'بادینی', flag: '🏔️', dir: 'rtl' },
  { code: 'ar', name: 'العربية', label: 'عربي', flag: '🌴', dir: 'rtl' },
  { code: 'en', name: 'English', label: 'EN', flag: '🇬🇧', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', label: 'TR', flag: '🇹🇷', dir: 'ltr' }
];

export const RTL_LANGUAGES: Language[] = ['ku', 'ku_badini', 'ar'];
export const LTR_LANGUAGES: Language[] = ['en', 'tr'];

export const translations: Record<Language, Record<string, string>> = {
  ku: kuTranslations,
  ku_badini: kuBadiniTranslations,
  ar: arTranslations,
  en: enTranslations,
  tr: trTranslations,
  fa: faTranslations
};

/**
 * Interpolate values into placeholders like #{key}, {key}, :key
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params || Object.keys(params).length === 0) return text;
  let result = text;
  for (const [key, value] of Object.entries(params)) {
    const valStr = String(value);
    result = result
      .replace(new RegExp(`#{${key}}`, 'g'), valStr)
      .replace(new RegExp(`{${key}}`, 'g'), valStr)
      .replace(new RegExp(`:${key}`, 'g'), valStr);
  }
  return result;
}

/**
 * Robust fallback translation resolver with interpolation support
 */
export function translate(
  keyOrText: string,
  lang: Language,
  params?: Record<string, string | number>
): string {
  if (!keyOrText) return '';
  const trimmed = keyOrText.trim();

  // Category aliases map
  const categoryAliases: Record<string, string> = {
    'cat.food': 'category.food',
    'cat.market': 'category.market',
    'cat.clothes': 'category.clothes',
    'cat.fruits_vegetables': 'category.fruits_vegetables',
    'cat.fresh_meat': 'category.fresh_meat',
    'cat.dairy': 'category.dairy',
    'cat.electronics': 'category.electronics',
    'cat.beauty': 'category.beauty',
    'cat.cars': 'category.cars',
    'cat.umrah': 'category.umrah'
  };

  const lookupKey = categoryAliases[trimmed] || trimmed;

  // 1. Check target language dictionary
  const langDict = translations[lang];
  if (langDict && langDict[lookupKey] !== undefined) {
    return interpolate(langDict[lookupKey], params);
  }

  // 2. Case-insensitive lookup in target language
  if (langDict) {
    const lower = lookupKey.toLowerCase();
    const matchKey = Object.keys(langDict).find(k => k.toLowerCase() === lower);
    if (matchKey && langDict[matchKey] !== undefined) {
      return interpolate(langDict[matchKey], params);
    }
  }

  // 3. Fallback to Kurdish Sorani
  const kuDict = translations['ku'];
  if (kuDict && kuDict[lookupKey] !== undefined) {
    return interpolate(kuDict[lookupKey], params);
  }

  // 4. Fallback to English
  const enDict = translations['en'];
  if (enDict && enDict[lookupKey] !== undefined) {
    return interpolate(enDict[lookupKey], params);
  }

  // 5. Fallback: if it was a cat. key, provide default Kurdish name
  const defaultNames: Record<string, string> = {
    'cat.food': 'چێشتخانە و خواردن',
    'cat.market': 'مارکێت و سوپەرمارکێت',
    'cat.clothes': 'جلوبەرگ و مۆدە',
    'cat.fruits_vegetables': 'سەوزە و میوە',
    'cat.fresh_meat': 'گۆشتی تازەی کوردی',
    'cat.dairy': 'شیرەمەنی و ماست',
    'cat.electronics': 'ئەلیکترۆنیات و مۆبایل',
    'cat.beauty': 'جوانی و مکیاژ',
    'cat.cars': 'بازاڕی ئۆتۆمبێل',
    'cat.umrah': 'گەشت و عومرە'
  };
  if (defaultNames[trimmed]) {
    return defaultNames[trimmed];
  }

  // 5. Fallback: return original text with interpolation applied
  return interpolate(trimmed, params);
}
