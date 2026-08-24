import React, { useState } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Shield,
  Save,
  Check,
  Award,
  Gift,
  Sparkles,
  History,
  Coins,
  FileText,
  MessageSquare,
  Star,
  Send,
  AlertCircle,
  CheckCircle2,
  Car,
  Store,
  Truck,
  Building2,
  HelpCircle,
  Package,
  Heart,
  LogOut,
  ShieldCheck,
  ArrowLeft,
  ChevronLeft,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useLanguage } from '../context/LanguageContext';
import { RoleBadge } from '../components/common/Badge';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { CITIES } from '../data/seedData';
import { FeedbackType, UserRole, GeoLocation } from '../types';
import { GPSLocationPicker } from '../components/common/GPSLocationPicker';

interface UserProfileViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onNavigate }) => {
  const {
    currentUser,
    updateUserProfile,
    logout,
    isSuperAdmin,
    isSeller,
    isDeliveryAgent
  } = useAuth();
  const {
    getUserPointsWallet,
    getUserPointsHistory,
    redeemPoints,
    pointsSettings,
    calculateDiscountFromPoints,
    calculatePointsRequiredForDiscount,
    userFeedbacks,
    submitUserFeedback
  } = useMarketplace();
  const { t, dir } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'terms' | 'feedback'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Erbil (هەولێر)');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [area, setArea] = useState(currentUser?.area || '');
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(currentUser?.geoLocation || null);
  const [savedToast, setSavedToast] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState('');

  // Feedback Form State
  const [fbType, setFbType] = useState<FeedbackType>('feature_request');
  const [fbTitle, setFbTitle] = useState('');
  const [fbMessage, setFbMessage] = useState('');
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbSubmitMsg, setFbSubmitMsg] = useState('');

  const pointsWallet = getUserPointsWallet(currentUser?.id || 'cust-demo', currentUser?.role || 'customer');
  const pointsHistory = getUserPointsHistory(currentUser?.id || 'cust-demo');

  // My submitted feedbacks
  const myFeedbacks = userFeedbacks.filter(f => f.userId === (currentUser?.id || 'cust-demo'));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      fullName,
      phone,
      city,
      address,
      area,
      geoLocation: geoLocation || undefined
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleRedeemDiscount = (pts: number, discountIqd: number) => {
    const res = redeemPoints(currentUser?.id || 'cust-demo', pts, `کۆپۆنی داشکاندنی ${discountIqd.toLocaleString()} د.ع بۆ کڕینی کاڵا`);
    setRedeemMsg(res.message);
    setTimeout(() => setRedeemMsg(''), 4000);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbTitle.trim() || !fbMessage.trim()) return;

    const res = await submitUserFeedback({
      userId: currentUser?.id || 'cust-demo',
      userName: currentUser?.fullName || 'بەکارهێنەری شاخ',
      userPhone: currentUser?.phone || '',
      userRole: currentUser?.role || 'customer',
      feedbackType: fbType,
      title: fbTitle,
      message: fbMessage,
      rating: fbRating
    });

    setFbSubmitMsg(res.message);
    setFbTitle('');
    setFbMessage('');
    setTimeout(() => setFbSubmitMsg(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20" dir={dir}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-start">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t('profile')} & {t('dashboard')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('app.tagline')}</p>
        </div>

        <button
          onClick={() => {
            if (currentUser) {
              logout();
            } else {
              onNavigate('auth', 'login');
            }
          }}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{currentUser ? t('logout') : t('login')}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4 text-amber-400" />
          <span>پڕۆفایلی هەژمار و پۆینت</span>
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'terms'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-400" />
          <span>یاسا و مەرجەکانی شاخ بۆ هەموو بەشداربووان</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>فیدباک و پێشنیار بۆ بەرەوپێشبردن ({userFeedbacks.length})</span>
        </button>
      </div>

      {/* TAB 1: Profile & Points */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {savedToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>زانیارییەکان بە سەرکەوتوویی پاشەکەوت کران!</span>
            </div>
          )}

          {redeemMsg && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{redeemMsg}</span>
            </div>
          )}

          {/* Customer Points Wallet & Agreement Rewards Card */}
          <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-black">پۆینتی پاداشتی شاخ (Shakh Customer Rewards)</h2>
                  <p className="text-xs text-amber-200/80">پۆینتەکان بەپێی ڕێککەوتنی شاخ و خاوەن کار لەسەر کڕینەکانت زیاد دەبن</p>
                </div>
              </div>
              <span className="text-2xl font-black font-latin text-amber-400 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 self-start sm:self-auto">
                {pointsWallet.totalPoints.toLocaleString()} <span className="text-xs font-sans text-amber-200">پۆینت</span>
              </span>
            </div>

            {/* Quick Redemption Offers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>گۆڕینی پۆینت بۆ کۆپۆنی داشکاندن (ڕێژە: {pointsSettings.pointsPerIQD} پۆینت = ١ د.ع):</span>
                </h3>
                <span className="text-[11px] text-amber-300 font-latin font-bold bg-amber-900/40 px-2 py-0.5 rounded-lg border border-amber-500/30">
                  {pointsSettings.pointsPerIQD} Pts = 1 IQD
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 300 pts = 2 IQD */}
                <div className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 space-y-2 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-300">داشکاندنی ٢ د.ع</span>
                    <span className="font-latin font-bold text-slate-300">300 پۆینت</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    بڕی داشکاندن: {calculateDiscountFromPoints(300).toLocaleString()} د.ع ({300} / {pointsSettings.pointsPerIQD})
                  </p>
                  <button
                    onClick={() => handleRedeemDiscount(300, calculateDiscountFromPoints(300))}
                    disabled={pointsWallet.totalPoints < 300}
                    className={`w-full py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      pointsWallet.totalPoints >= 300
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-white/10 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {pointsWallet.totalPoints >= 300 ? 'وەرگرتنی کۆپۆن' : 'پۆینتی تەواوت نییە'}
                  </button>
                </div>

                {/* 1,500 pts = 10 IQD */}
                <div className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 space-y-2 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-300">داشکاندنی ١٠ د.ع</span>
                    <span className="font-latin font-bold text-slate-300">1,500 پۆینت</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    بڕی داشکاندن: {calculateDiscountFromPoints(1500).toLocaleString()} د.ع ({1500} / {pointsSettings.pointsPerIQD})
                  </p>
                  <button
                    onClick={() => handleRedeemDiscount(1500, calculateDiscountFromPoints(1500))}
                    disabled={pointsWallet.totalPoints < 1500}
                    className={`w-full py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      pointsWallet.totalPoints >= 1500
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-white/10 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {pointsWallet.totalPoints >= 1500 ? 'وەرگرتنی کۆپۆن' : 'پۆینتی تەواوت نییە'}
                  </button>
                </div>

                {/* 3,000 pts = 20 IQD */}
                <div className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 space-y-2 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-300">داشکاندنی ٢٠ د.ع</span>
                    <span className="font-latin font-bold text-slate-300">3,000 پۆینت</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    بڕی داشکاندن: {calculateDiscountFromPoints(3000).toLocaleString()} د.ع ({3000} / {pointsSettings.pointsPerIQD})
                  </p>
                  <button
                    onClick={() => handleRedeemDiscount(3000, calculateDiscountFromPoints(3000))}
                    disabled={pointsWallet.totalPoints < 3000}
                    className={`w-full py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      pointsWallet.totalPoints >= 3000
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-white/10 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {pointsWallet.totalPoints >= 3000 ? 'وەرگرتنی کۆپۆن' : 'پۆینتی تەواوت نییە'}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Points History */}
            {pointsHistory.length > 0 && (
              <div className="border-t border-white/10 pt-4 space-y-2">
                <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  مێژووی پۆینتەکانت بەپێی ڕێککەوتنی شاخ و خاوەن کار:
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {pointsHistory.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl text-xs">
                      <div>
                        <p className="font-bold text-white text-[11px]">{tx.description}</p>
                        <span className="text-[10px] text-slate-400 font-latin">{new Date(tx.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`font-black font-latin text-xs ${tx.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            
            {/* User Card & Account Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
                  {fullName ? fullName.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{fullName || 'بەکارهێنەر'}</h3>
                  <p className="text-xs text-slate-400 font-latin">{currentUser?.email}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <RoleBadge role={currentUser?.role || 'customer'} />
                    {isSuperAdmin && (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                        Super Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Account Navigation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {isSuperAdmin && (
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="p-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                  <span>داشبۆردی ئەدمین</span>
                </button>
              )}

              {isSeller && (
                <button
                  onClick={() => onNavigate('seller-dashboard')}
                  className="p-3 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Store className="w-5 h-5 text-orange-600" />
                  <span>داشبۆردی فرۆشیار</span>
                </button>
              )}

              {isDeliveryAgent && (
                <button
                  onClick={() => onNavigate('delivery-dashboard')}
                  className="p-3 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Truck className="w-5 h-5 text-teal-600" />
                  <span>داشبۆردی شۆفێر</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('customer-orders')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Package className="w-5 h-5 text-slate-600" />
                <span>داواکارییەکانم</span>
              </button>

              <button
                onClick={() => onNavigate('favorites')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Heart className="w-5 h-5 text-rose-500" />
                <span>دڵخوازەکانم</span>
              </button>
            </div>

            {/* Language Selector Preference Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <LanguageSwitcher variant="full" />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4 text-orange-500" />
                <span>دەستکاری زانیاری پڕۆفایل و ناونیشان:</span>
              </h4>

              <form onSubmit={handleSave} className="space-y-4 text-right">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ناوی تەواو:</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ژمارەی مۆبایل:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin text-right focus:bg-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">شار:</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:bg-white focus:outline-hidden"
                    >
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">گەڕەک / ناوچە:</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* GPS Location Component */}
                <GPSLocationPicker
                  label="دیاریکردنی لۆکەیشنی GPS ی سەرەکی بۆ هەژمارەکەت"
                  autoPrompt={!currentUser?.geoLocation}
                  initialCity={city}
                  initialAddress={address}
                  initialGeoLocation={geoLocation}
                  onLocationChange={(loc) => {
                    if (loc.city) setCity(loc.city);
                    if (loc.area) setArea(loc.area);
                    if (loc.address) setAddress(loc.address);
                    if (loc.geoLocation) {
                      setGeoLocation(loc.geoLocation);
                      updateUserProfile({
                        city: loc.city || city,
                        area: loc.area || area,
                        address: loc.address || address,
                        geoLocation: loc.geoLocation
                      });
                    }
                  }}
                />

                <button
                  type="submit"
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>پاشەکەوتکردنی گۆڕانکارییەکان</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: Shakh Platform Rules & Regulations for All Participants */}
      {activeTab === 'terms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-8 text-right">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>یاسا و مەرجە گشتییەکانی پلاتفۆرمی شاخ (Shakh Rules & Terms)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ئەم یاسا و مەرجانە پارێزگاری لە مافی سەرجەم بەشداربووانی شاخ دەکەن (کڕیاران، خاوەن کارەکان، کاپتانانی گەیاندن و فرۆشیارانی ئۆتۆمبێل).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            
            {/* 1. Customers Rules */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                <span>١. یاسا و مەرجەکانی کڕیاران (Customer Rules)</span>
              </h3>
              <ul className="text-xs text-slate-700 space-y-2 pr-4 list-disc leading-relaxed font-medium">
                <li>پێویستە کڕیار ناونیشانی ورد و ژمارەی مۆبایلی ڕاستەقینەی خۆی تۆمار بکات.</li>
                <li>داواکارییەکان ڕاستەوخۆ دەگەنە خاوەن کار، کڕیار مافی هەڵوەشاندنەوەی هەیە تەنها پێش دەستپێکردنی ئامادەکردنی خواردن یان کاڵاکە.</li>
                <li>کڕیاران لەسەر هەر داواکارییەک پۆینتی پاداشت بەدەستدەهێنن بەپێی ڕێککەوتنی شاخ و خاوەن کار.</li>
                <li>ڕێزگرتن لە کاپتنی گەیاندن و ئامادەبوونی کڕیار لە کاتی گەیشتنی مەندوب.</li>
              </ul>
            </div>

            {/* 2. Merchants & Store Owners Rules */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-600" />
                <span>٢. یاسا و مەرجەکانی خاوەن کار و فرۆشگاکان (Merchant Rules)</span>
              </h3>
              <ul className="text-xs text-slate-700 space-y-2 pr-4 list-disc leading-relaxed font-medium">
                <li>پابەندبوونی تەواو بە کوالیتی، خاوێنی و بەراوردی نرخەکان بەپێی نرخی بازاڕ.</li>
                <li>دیاریکردنی ئاستی ڕێککەوتننامەی پۆینت (Standard, Silver, Gold, VIP) لەگەڵ شاخ بۆ بەخشینی پۆینت بە کڕیاران و گەشەی فرۆشگا.</li>
                <li>پێویستە داواکارییەکان لە کاتی دیاریکراودا ئامادە بکرێن تاوەکو کاپتنی گەیاندن بەبێ دواکەوتن بیگەیەنێت.</li>
                <li>قەدەغەیە فرۆشیار نرخی کاڵا لە پلاتفۆرمی شاخ بەرزتر بکات لە نرخی ئاسایی فرۆشگاکەی.</li>
              </ul>
            </div>

            {/* 3. Delivery Captains Rules */}
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>٣. یاسا و مەرجەکانی کاپتان و مەندوبانی گەیاندن (Delivery Captain Rules)</span>
              </h3>
              <ul className="text-xs text-slate-700 space-y-2 pr-4 list-disc leading-relaxed font-medium">
                <li>پاراستنی سەلامەتی، خاوێنی و گەرمی/ساردی کاڵاکان لە کاتی گواستنەوەیاندا.</li>
                <li>سیستەمی شاخ ۸٠٪ی قازانجی خاوێن لە کرێی گەیاندن بۆ کاپتان دەهێڵێتەوە و تەنها ۲٠٪ لێبڕینی پلاتفۆرمە.</li>
                <li>کاپتانەکان بۆنسی پۆینتی سەرباری لەسەر هەر داواکارییەکی گەیەندراو بەدەستدەهێنن.</li>
                <li>مەندوب بەرپرسە لە مامەڵەی شایستە و پەیوەندی بەڕێزانە لەگەڵ کڕیار و خاوەن کارەکان.</li>
              </ul>
            </div>

            {/* 4. Car Sellers Rules */}
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-rose-600" />
                <span>٤. یاسا و مەرجەکانی فرۆشیارانی ئۆتۆمبێل (Car Sellers Terms)</span>
              </h3>
              <ul className="text-xs text-slate-700 space-y-2 pr-4 list-disc leading-relaxed font-medium">
                <li>ڕاستگۆیی تەواو لە دانانی زانیاری ئۆتۆمبێل (مۆدێل، ساڵ، کیلۆمەتر، تەقەڵ و بۆیاخ).</li>
                <li className="font-bold text-rose-800 bg-rose-100/80 p-2 rounded-xl">
                  ⚠️ کاتێک ئۆتۆمبێلەکە فرۆشرا: پێویستە خاوەن ڕیکلام دەستبەجێ دۆخی ئۆتۆمبێلەکەی بگۆڕێت بۆ "فرۆشرا" (Sold). لەگەڵ ئەمەدا، سیستەمەکە ئۆتۆماتیکی زانیاری پەیوەندی و ژمارەی تەلەفۆنی فرۆشیار دەشارێتەوە تاوەکو هیچ ناڕەحەتییەک بۆ فرۆشیار و کڕیاران دروست نەبێت.
                </li>
                <li>پابەندبوون بە ماوەی دیاریکراوی پاکێجی ڕیکلام (٧ ڕۆژ، ١٥ ڕۆژ یان ٣٠ ڕۆژی VIP).</li>
              </ul>
            </div>

            {/* 5. Platform Guarantee */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>٥. بەرپرسیارییەتی دارایی و پشتگیری شاخ</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                پلاتفۆرمی شاخ بەیەکگەیشتنی کڕیار و خاوەن کار ئاسان دەکات و گرەنتی پاداشتی پۆینت و شەفافییەت دەکات. هەر کێشەیەک لە جێبەجێکردنی داواکارییەکان دروست بێت لە ڕێگەی تیمی پشتگیری شاخ بە خێرایی چارەسەر دەکرێت.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: User Feedback & Project Improvement Suggestions */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          
          {/* Feedback Form Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-right">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-emerald-600" />
                <span>فیدباک و سەرنجەکان بۆ بەرەوپێشبردنی پڕۆژەی شاخ</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                ڕاو سەرنج و پێشنیارەکانت بە ڕاستەوخۆ دەگاتە تیمی بەڕێوەبەری شاخ بۆ گەشەپێدان و بەرەوپێشبردنی سیستەمەکە.
              </p>
            </div>

            {fbSubmitMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{fbSubmitMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">جۆری فیدباک / پێشنیار:</label>
                  <select
                    value={fbType}
                    onChange={(e) => setFbType(e.target.value as FeedbackType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold focus:bg-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="feature_request">💡 پێشنیاری تایبەتمەندی و بەشی نوێ</option>
                    <option value="category_suggestion">📦 پێشنیاری زیادکردنی کاڵا و بەشی نوێ</option>
                    <option value="bug_report">🐞 گوزارشت لە کێشەیەکی تەکنیکی</option>
                    <option value="general_review">⭐️ ڕا و سەرنجی گشتی لەسەر خزمەتگوزارییەکان</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">هەڵسەنگاندن (Stars):</label>
                  <div className="flex items-center gap-2 pt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFbRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star className={`w-6 h-6 ${star <= fbRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold font-latin text-slate-500 mr-2">({fbRating}/5)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">سەردێڕی فیدباک یان پێشنیار:</label>
                <input
                  type="text"
                  required
                  value={fbTitle}
                  onChange={(e) => setFbTitle(e.target.value)}
                  placeholder="سەردێڕێکی کورت و ڕوون بنووسە..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ناواخنی سەرنج و پێشنیارەکەت بە وردی:</label>
                <textarea
                  required
                  rows={4}
                  value={fbMessage}
                  onChange={(e) => setFbMessage(e.target.value)}
                  placeholder="ڕاو سەرنجەکانت بە درێژی بنووسە بۆ بەرەوپێشبردنی پڕۆژەکە..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>ناردنی فیدباک بۆ تیمی بەڕێوەبەری شاخ</span>
              </button>
            </form>
          </div>

          {/* User's Previous Feedbacks */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-right">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <span>مێژووی فیدباکە نێردراوەکانی تۆ ({myFeedbacks.length})</span>
            </h3>

            {myFeedbacks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">هیچ فیدباکێک پێشتر نە نێردراوە.</p>
            ) : (
              <div className="space-y-3">
                {myFeedbacks.map(fb => (
                  <div key={fb.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-900">{fb.title}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        fb.status === 'implemented'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fb.status === 'reviewed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {fb.status === 'implemented' ? 'جێبەجێکراوە' : fb.status === 'reviewed' ? 'پێداچوونەوەی بۆ کراوە' : 'لە چاوەڕوانیدایە'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{fb.message}</p>

                    {fb.adminResponse && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
                        <span className="font-bold block text-[#2563EB] mb-0.5">وەڵامی تیمی بەڕێوەبەری شاخ:</span>
                        {fb.adminResponse}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-latin">
                      <span>{new Date(fb.createdAt).toLocaleString()}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{fb.rating}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

