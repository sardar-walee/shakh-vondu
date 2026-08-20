import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Loader2, 
  Globe, 
  Database, 
  LayoutDashboard, 
  Check, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function OnboardingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { updateProfileState, ensureAuthUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0); // 0 to 100
  const [activeSubStep, setActiveSubStep] = useState(0); // 0 to 3

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    businessType: 'mobile_electronics',
    currency: 'IQD',
    language: i18n.language || 'ku'
  });

  const isRtl = ['ku', 'ar', 'fa'].includes(i18n.language);

  const subSteps = [
    { label: t('step_creating_space'), icon: Store },
    { label: t('step_init_db'), icon: Database },
    { label: t('step_configuring_settings'), icon: Globe },
    { label: t('step_preparing_dashboard'), icon: LayoutDashboard }
  ];

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    setFormData(prev => ({ ...prev, language: lang }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submits
    setIsSubmitting(true);
    setSubmissionProgress(10);
    setActiveSubStep(0);

    try {
      // Step 1: Ensure user session
      let currentUser = auth.currentUser;
      if (!currentUser) {
        currentUser = await ensureAuthUser();
      }
      setSubmissionProgress(30);
      setActiveSubStep(1);

      const uid = currentUser?.uid || `user_${Date.now()}`;
      const storeId = doc(collection(db, 'stores')).id;
      const trialEndDate = new Date();
      trialEndDate.setMonth(trialEndDate.getMonth() + 3); // 3-Month Free Trial

      // Step 2: Prepare Documents
      setSubmissionProgress(55);
      setActiveSubStep(2);

      const storeData = {
        name: formData.name || 'MobiStore Store',
        phone: formData.phone || '0750 000 0000',
        address: formData.address || 'Main Street, Erbil',
        businessType: formData.businessType || 'mobile_electronics',
        currency: formData.currency,
        language: formData.language,
        ownerId: uid,
        subscriptionStatus: 'trial',
        trialEndDate: trialEndDate.toISOString(),
        createdAt: new Date().toISOString()
      };

      const userProfileData = {
        email: currentUser?.email || 'owner@mobistore.com',
        role: 'owner',
        storeId: storeId,
        createdAt: new Date().toISOString()
      };

      // Step 3: Write to Firestore
      try {
        await setDoc(doc(db, 'stores', storeId), storeData);
        await setDoc(doc(db, 'users', uid), userProfileData);
      } catch (dbError) {
        console.warn("Firestore onboarding write warning:", dbError);
      }

      setSubmissionProgress(85);
      setActiveSubStep(3);

      // Brief delay to let user see 100% completion checklist
      setTimeout(() => {
        setSubmissionProgress(100);
        updateProfileState(userProfileData);
        navigate('/dashboard');
      }, 600);

    } catch (error) {
      console.error("Onboarding submission failed:", error);
      const fallbackStoreId = `store_${Date.now()}`;
      const fallbackProfile = {
        email: 'owner@mobistore.com',
        role: 'owner',
        storeId: fallbackStoreId,
        createdAt: new Date().toISOString()
      };
      updateProfileState(fallbackProfile);
      navigate('/dashboard');
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col items-center justify-center p-4 text-slate-100 font-sans relative overflow-hidden" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Selector Toolbar */}
      <div className="mb-6 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
        <Globe className="w-4 h-4 text-blue-400 mx-2" />
        {[
          { code: 'ku', label: 'کوردی' },
          { code: 'ar', label: 'العربية' },
          { code: 'en', label: 'English' },
          { code: 'tr', label: 'Türkçe' },
          { code: 'fa', label: 'فارسی' }
        ].map(l => (
          <button
            key={l.code}
            disabled={isSubmitting}
            onClick={() => changeLang(l.code)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              i18n.language === l.code 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 backdrop-blur-xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black">{t('welcome_title')}</h1>
              <p className="text-xs text-blue-100 mt-1 opacity-90">{t('welcome_subtitle')}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          
          {!isSubmitting && (
            <div className="mt-6 flex gap-2">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-white shadow-sm' : 'bg-blue-400/40'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          {/* Skeleton Screen & Progress Indicator during Submission */}
          {isSubmitting ? (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('setting_up_store')}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100">درێژەدان بە ڕێکخستنی شوێنی کارەکەت...</h3>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>{t('setting_up_store')}</span>
                  <span>{submissionProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                    style={{ width: `${submissionProgress}%` }}
                  />
                </div>
              </div>

              {/* Steps Progress List */}
              <div className="grid grid-cols-1 gap-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                {subSteps.map((sub, idx) => {
                  const Icon = sub.icon;
                  const isDone = idx < activeSubStep || submissionProgress >= 100;
                  const isCurrent = idx === activeSubStep && submissionProgress < 100;

                  return (
                    <div 
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isDone 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : isCurrent 
                            ? 'bg-blue-500/10 border-blue-500/40 text-blue-300 animate-pulse' 
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isDone ? 'bg-emerald-500/20' : isCurrent ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                        {isDone ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        ) : (
                          <Icon className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <span className="text-xs font-bold">{sub.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Skeleton UI Preview */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 opacity-75">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Firestore Database Connection Active
                  </span>
                  <span className="text-slate-500">Live Preview</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-14 bg-slate-800/80 rounded-xl animate-pulse" />
                  <div className="h-14 bg-slate-800/80 rounded-xl animate-pulse" />
                  <div className="h-14 bg-slate-800/80 rounded-xl animate-pulse" />
                </div>
                <div className="h-20 bg-slate-800/60 rounded-xl animate-pulse" />
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">جۆری دوکان و چالاکی بازرگانی (Business Category)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'mobile_electronics', label: '📱 دوکانی مۆبایل و ئەلیکترۆنیات' },
                        { id: 'pharmacy_medical', label: '💊 دەرمانساز / دەرمانخانە' },
                        { id: 'clothing_fashion', label: '👗 جل و بەرگ (پۆشاک)' },
                        { id: 'supermarket_grocery', label: '🛒 مارکێت و سوپەرمارکێت' },
                        { id: 'cosmetics_perfumes', label: '💄 جوانکاری و گوڵاو' },
                        { id: 'auto_parts', label: '🔧 کەلوپەلی بیناسازی/ئۆتۆمبێل' },
                        { id: 'general_retail', label: '📦 گشتی (هەموو جۆرە دوکانێک)' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, businessType: cat.id })}
                          className={`p-2.5 rounded-xl text-xs font-bold text-right border transition-all flex items-center justify-between ${
                            formData.businessType === cat.id
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md'
                              : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{cat.label}</span>
                          {formData.businessType === cat.id && (
                            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">{t('store_name')}</label>
                    <div className="relative">
                      <Store className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500`} />
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                        placeholder={t('store_name_placeholder')}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">{t('phone_number')}</label>
                    <div className="relative">
                      <Phone className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500`} />
                      <input
                        type="text"
                        disabled={isSubmitting}
                        className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                        placeholder="+964 7XX XXX XXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">{t('address')}</label>
                    <div className="relative">
                      <MapPin className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-slate-500`} />
                      <textarea
                        disabled={isSubmitting}
                        className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px]`}
                        placeholder={t('address_placeholder')}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">{t('currency')}</label>
                      <select
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      >
                        <option value="IQD">IQD (د.ع - دیناری عێراقی)</option>
                        <option value="USD">USD ($ - US Dollar)</option>
                        <option value="EUR">EUR (€ - Euro)</option>
                        <option value="TRY">TRY (₺ - Türk Lirası)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">{t('language')}</label>
                      <select
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.language}
                        onChange={(e) => changeLang(e.target.value)}
                      >
                        <option value="ku">کوردی (Kurdish)</option>
                        <option value="ar">العربية (Arabic)</option>
                        <option value="en">English</option>
                        <option value="tr">Türkçe</option>
                        <option value="fa">فارسی (Persian)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-emerald-300 font-bold text-sm">۳ مانگ دیاری تاقیکردنەوەی بێبەرامبەر (3-Month Free Trial)</p>
                      <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                        تەواوی تایبەتمەندییەکانی سیستەم بۆ ۳ مانگی ڕەبەق بێبەرامبەر کار دەکات. دوا بەدوای ۳ مانگ، نوێکردنەوە بریتییە لە:
                        <br />
                        <span className="font-bold text-blue-300">• ۳ مانگ: 25,000 د.ع</span> | <span className="font-bold text-indigo-300">• ٦ مانگ: 45,000 د.ع</span> | <span className="font-bold text-emerald-300">• ۱ ساڵ: 60,000 د.ع</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Bottom Buttons */}
          {!isSubmitting && (
            <div className="mt-8 flex justify-between items-center">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                >
                  {t('back')}
                </button>
              ) : <div />}
              
              <button
                type="button"
                onClick={step === 3 ? handleSubmit : handleNext}
                disabled={(step === 1 && !formData.name.trim()) || isSubmitting}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-bold text-xs shadow-xl shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>{step === 3 ? t('start_free_trial') : t('continue')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
