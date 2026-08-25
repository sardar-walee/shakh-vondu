import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Phone,
  Store,
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, ProductCategory, GeoLocation } from '../types';
import { Logo } from '../components/common/Logo';
import { CITIES } from '../data/seedData';
import { GPSLocationPicker } from '../components/common/GPSLocationPicker';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onNavigate: (view: string, param?: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login', onNavigate }) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [category, setCategory] = useState<ProductCategory>('food');
  const [storeName, setStoreName] = useState('');
  const [city, setCity] = useState('Erbil (هەولێر)');
  const [area, setArea] = useState('ناوەندی شار');
  const [address, setAddress] = useState('');
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [acceptedShakhRules, setAcceptedShakhRules] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && role === 'delivery_agent' && !acceptedShakhRules) {
      setError('پێویستە یاسا و ڕێنماییەکانی کاپتنی شاخ پەسەند بکەیت.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onNavigate('user-profile');
        } else {
          setError(res.error || 'هەڵەیەک ڕوویدا لە کاتی چوونەژوورەوە');
        }
      } else {
        const res = await register({
          email,
          password,
          fullName,
          phone,
          role,
          category: role.includes('seller') || role === 'restaurant_owner' || role === 'market_owner' ? category : undefined,
          storeName: storeName || fullName,
          city,
          area: area || 'ناوەندی شار',
          address: address || ('شارستانی ' + city),
          geoLocation: geoLocation || undefined
        });
        if (res.success) {
          onNavigate('user-profile');
        } else {
          setError(res.error || 'هەڵەیەک ڕوویدا لە دروستکردنی هەژمار');
        }
      }
    } catch (err: any) {
      setError(err.message || 'هەڵەیەک ڕوویدا');
    } finally {
      setLoading(false);
    }
  };

  const isSellerRole = [
    'restaurant_owner',
    'market_owner',
    'clothes_seller',
    'fruits_vegetables_seller',
    'fresh_meat_seller',
    'dairy_seller',
    'electronics_seller',
    'beauty_seller',
    'car_seller'
  ].includes(role);

  return (
    <div className="max-w-lg mx-auto my-6 sm:my-10 space-y-6 pb-16">
      
      <div className="text-center space-y-3">
        <div className="inline-block">
          <Logo size="lg" showTagline={true} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          {mode === 'login' ? 'چوونەژوورەوە بۆ هەژمارەکەت' : 'دروستکردنی هەژماری نوێ'}
        </h1>
        <p className="text-xs text-slate-500">
          {mode === 'login'
            ? 'تکایە ئیمەیڵ و تێپەڕەوشەکەت بنووسە بۆ بەردەوامبوون'
            : 'پەیوەندی بکە بە گەورەترین بازاڕ و خزمەتگوزاری گەیاندن لە کوردستان'}
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-6">
        
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          
          {mode === 'register' && (
            <>
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">جۆری هەژمار دیاریبکە:</label>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`p-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                      role === 'customer'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 ring-1 ring-orange-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    کڕیار
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('restaurant_owner')}
                    className={`p-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                      isSellerRole
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    فرۆشیار / چێشتخانە
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('delivery_agent')}
                    className={`p-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                      role === 'delivery_agent'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 ring-1 ring-teal-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    کاپتنی گەیاندن
                  </button>
                </div>
              </div>

              {/* Seller Category Sub-choice if Seller */}
              {isSellerRole && (
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">پۆلی فرۆشگاکەت دیاریبکە:</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100"
                  >
                    <option value="restaurant_owner">چێشتخانە و خواردن (Food)</option>
                    <option value="market_owner">مارکێت و سوپەرمارکێت (Market)</option>
                    <option value="clothes_seller">جلوبەرگ و مۆدە (Clothes)</option>
                    <option value="fruits_vegetables_seller">سەوزە و میوە (Fruits & Vegetables)</option>
                    <option value="fresh_meat_seller">گۆشتی تازە (Fresh Meat)</option>
                    <option value="dairy_seller">شیرەمەنی (Dairy)</option>
                    <option value="electronics_seller">ئەلیکترۆنیات و مۆبایل (Electronics)</option>
                    <option value="beauty_seller">جوانی و مکیاژ (Beauty)</option>
                  </select>
                </div>
              )}

              {isSellerRole && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">ناوی فرۆشگا یان چێشتخانە *</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="وەک: چێشتخانەی دیلان، مارکێتی گوڵان..."
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">ناوی تەواو *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ناو و نازناو"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">ژمارەی مۆبایل *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0750 xxx xxxx"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-latin text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* City Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">شار *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-semibold text-slate-900 dark:text-slate-100"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* GPS & Live Location Picker */}
              <GPSLocationPicker
                label={role === 'customer' ? 'دیاریکردنی شوێنی کڕیار بە GPS (داواکردنی ڕاستەوخۆ)' : isSellerRole ? 'دیاریکردنی شوێنی فرۆشگا بە GPS' : 'دیاریکردنی شوێنی کاپتن بە GPS'}
                required={true}
                autoPrompt={true}
                initialCity={city}
                initialAddress={address}
                initialGeoLocation={geoLocation}
                onLocationChange={(loc) => {
                  if (loc.city) setCity(loc.city);
                  if (loc.area) setArea(loc.area);
                  if (loc.address) setAddress(loc.address);
                  if (loc.geoLocation) setGeoLocation(loc.geoLocation);
                }}
              />
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">ئیمەیڵ *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@shakh.com"
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-latin text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">تێپەڕەوشە (Password) *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-latin text-slate-900 dark:text-slate-100"
            />
          </div>

          {mode === 'register' && role === 'delivery_agent' && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-3 text-xs text-teal-900 my-2">
              <div className="flex items-center gap-2 font-black text-teal-800 border-b border-teal-200 pb-2">
                <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span>یاسا و ڕێنماییەکانی کاپتنی شاخ (یاسای شاخ)</span>
              </div>

              <ul className="space-y-2 text-[11px] leading-relaxed text-teal-900 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-teal-700">١.</span>
                  <span><strong>یاسای ٢٠٪ی شاخ:</strong> لە سەدا بیستی (۲۰٪) کرێی گەیاندن دەچێت بۆ سیستەمی شاخ و ٨٠٪ی تەواوی کرێی گەیاندنەکە بە نێت دەبێتە قازانجی کاپتن.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-teal-700">٢.</span>
                  <span><strong>کۆکردنەوەی پۆینت:</strong> لە بەرامبەر هەر گەیاندنێک ۲٥ پۆینتی سەرەتایی + ۱ پۆینت بۆ هەر ۵۰۰ د.ع کرێی گەیاندن وەردەگریت.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-teal-700">٣.</span>
                  <span><strong>ئامانەت و بەڕێوەبردن:</strong> کاپتن بەرپرسە لە پاراستنی باری کڕیار و گەیاندنی بە تازەیی و لە کاتی دیاریکراودا.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-teal-700">٤.</span>
                  <span><strong>پاکتاوی نەقد:</strong> ڕادەستکردنەوەی نەقدی (COD) فرۆشیاران بە شێوەی ڕێکخراو.</span>
                </li>
              </ul>

              <label className="flex items-center gap-2 pt-2 border-t border-teal-200/80 cursor-pointer text-[11px] font-bold text-teal-900">
                <input
                  type="checkbox"
                  checked={acceptedShakhRules}
                  onChange={(e) => setAcceptedShakhRules(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500 accent-teal-600 cursor-pointer"
                />
                <span>یاساکانی شاخم خوێندەوە و هەموو مەرجەکان پەسەند دەکەم</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading
              ? 'تکایە چاوەڕێبە...'
              : mode === 'login'
              ? 'چوونەژوورەوە'
              : 'تەواوکردنی تۆمارکردن'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs">
          {mode === 'login' ? (
            <p className="text-slate-600">
              هەژمارت نییە؟{' '}
              <button
                onClick={() => setMode('register')}
                className="text-orange-600 font-bold hover:underline cursor-pointer"
              >
                دروستکردنی هەژماری نوێ
              </button>
            </p>
          ) : (
            <p className="text-slate-600">
              پێشتر هەژمارت هەبووە؟{' '}
              <button
                onClick={() => setMode('login')}
                className="text-orange-600 font-bold hover:underline cursor-pointer"
              >
                چوونەژوورەوە
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
