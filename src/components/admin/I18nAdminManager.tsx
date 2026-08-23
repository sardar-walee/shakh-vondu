import React, { useState } from 'react';
import { Languages, Search, Edit3, Plus, Check, Globe, RefreshCw, AlertCircle, Save } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language, SUPPORTED_LANGUAGES, translations } from '../../locales';

export const I18nAdminManager: React.FC = () => {
  const { language, customOverrides, setCustomOverride, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'custom' | 'untranslated'>('all');

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Combine base translations + custom overrides for selected language
  const baseDict = translations[selectedLang] || {};
  const kuDict = translations['ku'] || {};
  const overridesDict = customOverrides[selectedLang] || {};

  // Build key list
  const allKeys = Array.from(new Set([
    ...Object.keys(kuDict),
    ...Object.keys(baseDict),
    ...Object.keys(overridesDict)
  ]));

  const filteredKeys = allKeys.filter(key => {
    const q = searchQuery.toLowerCase().trim();
    const currentVal = overridesDict[key] || baseDict[key] || '';
    const kuVal = kuDict[key] || '';

    const matchesSearch = !q ||
      key.toLowerCase().includes(q) ||
      currentVal.toLowerCase().includes(q) ||
      kuVal.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterMode === 'custom') {
      return Boolean(overridesDict[key]);
    }
    if (filterMode === 'untranslated') {
      return !currentVal || currentVal === key;
    }

    return true;
  });

  const handleSaveTranslation = (key: string, value: string) => {
    setCustomOverride(selectedLang, key, value);
    setToastMsg(`وەرگێڕان بۆ [${key}] بەسەرکەوتوویی پاشەکەوت کرا.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    setCustomOverride(selectedLang, newKey.trim(), newValue.trim());
    setNewKey('');
    setNewValue('');
    setToastMsg(`کلیل و وەرگێڕانی نوێ بەسەرکەوتوویی زیادکرا.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-[#2563EB] flex items-center justify-center font-bold">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              بەڕێوەبردنی زمانەکان و وەرگێڕانەکانی سیستەم (Multilingual i18n Hub)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              دەستکاری ڕاستەوخۆی وشەکان، کلیلی وەرگێڕانەکان و دۆزینەوەی دەقە وەرنەگێڕدراوەکان بۆ ٦ زمانەکە.
            </p>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Language Selector Bar */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
          زمانی ئامانج بۆ دەستکاری:
        </label>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => setSelectedLang(l.code)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedLang === l.code
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add New Key Form */}
      <form onSubmit={handleAddKey} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#2563EB]" />
          <span>زیادکردنی کلیلی وەرگێڕانی نوێ / Add New Translation Key</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="کلیل یان دەقی کوردی (e.g. auth.welcome)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2563EB]"
          />
          <input
            type="text"
            placeholder={`وەرگێڕانی بۆ ${selectedLang.toUpperCase()}`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2563EB]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            زیادکردنی وەرگێڕان
          </button>
        </div>
      </form>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="گەڕان بۆ کلیل یان دەق..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pr-9 pl-3 text-xs font-bold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'all' ? 'bg-[#2563EB] text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            هەمووی ({allKeys.length})
          </button>
          <button
            onClick={() => setFilterMode('custom')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'custom' ? 'bg-[#2563EB] text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            دەستکارییەکان ({Object.keys(overridesDict).length})
          </button>
        </div>
      </div>

      {/* Translations Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3">کلیل / دەقی سەرەکی</th>
              <th className="p-3">دەقی کوردی (Fallback)</th>
              <th className="p-3">وەرگێڕان ({selectedLang.toUpperCase()})</th>
              <th className="p-3 text-center">کردار</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredKeys.slice(0, 50).map(key => (
              <TranslationRow
                key={key}
                translationKey={key}
                kuValue={kuDict[key] || key}
                currentValue={overridesDict[key] || baseDict[key] || ''}
                isCustom={Boolean(overridesDict[key])}
                onSave={(val) => handleSaveTranslation(key, val)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {filteredKeys.length > 50 && (
        <p className="text-[11px] text-slate-400 text-center">
          نیشاندانی ٥٠ کلیلی یەکەم لە سەرجەم {filteredKeys.length} کلیل. گەڕان بەکاربهێنە بۆ کلیلی تر.
        </p>
      )}
    </div>
  );
};

interface TranslationRowProps {
  translationKey: string;
  kuValue: string;
  currentValue: string;
  isCustom: boolean;
  onSave: (value: string) => void;
}

const TranslationRow: React.FC<TranslationRowProps> = ({
  translationKey,
  kuValue,
  currentValue,
  isCustom,
  onSave
}) => {
  const [val, setVal] = useState(currentValue);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 dir-ltr text-left">
        {translationKey}
      </td>
      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
        {kuValue}
      </td>
      <td className="p-3">
        {isEditing ? (
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-[#2563EB] rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200"
            autoFocus
          />
        ) : (
          <span className={`font-bold ${isCustom ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
            {val || <span className="text-slate-400 italic">بێ وەرگێڕان</span>}
          </span>
        )}
      </td>
      <td className="p-3 text-center">
        {isEditing ? (
          <button
            onClick={() => {
              onSave(val);
              setIsEditing(false);
            }}
            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 mx-auto"
          >
            <Save className="w-3 h-3" />
            <span>پاشەکەوت</span>
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 mx-auto cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>دەستکاری</span>
          </button>
        )}
      </td>
    </tr>
  );
};
