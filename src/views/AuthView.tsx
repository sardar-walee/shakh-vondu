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
import { UserRole, ProductCategory } from '../types';
import { Logo } from '../components/common/Logo';
import { CITIES } from '../data/seedData';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onNavigate: (view: string, param?: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login', onNavigate }) => {
  const { login, register, switchUserRole } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [category, setCategory] = useState<ProductCategory>('food');
  const [storeName, setStoreName] = useState('');
  const [city, setCity] = useState('Erbil (هەولێر)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onNavigate('home');
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
          city
        });
        if (res.success) {
          onNavigate('home');
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
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
        
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          
          {mode === 'register' && (
            <>
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">جۆری هەژمار دیاریبکە:</label>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`p-2.5 rounded-xl border font-bold transition-all ${
                      role === 'customer'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    کڕیار
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('restaurant_owner')}
                    className={`p-2.5 rounded-xl border font-bold transition-all ${
                      isSellerRole
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    فرۆشیار / چێشتخانە
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('delivery_agent')}
                    className={`p-2.5 rounded-xl border font-bold transition-all ${
                      role === 'delivery_agent'
                        ? 'border-teal-600 bg-teal-50 text-teal-700 ring-1 ring-teal-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    کاپتنی گەیاندن
                  </button>
                </div>
              </div>

              {/* Seller Category Sub-choice if Seller */}
              {isSellerRole && (
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-slate-700">پۆلی فرۆشگاکەت دیاریبکە:</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
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
                  <label className="text-xs font-bold text-slate-700">ناوی فرۆشگا یان چێشتخانە *</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="وەک: چێشتخانەی دیلان، مارکێتی گوڵان..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ناوی تەواو *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ناو و نازناو"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ژمارەی مۆبایل *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0750 xxx xxxx"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">شار *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ئیمەیڵ *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@shakh.com"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">تێپەڕەوشە (Password) *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin"
            />
          </div>

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

        {/* Quick Demo Switcher Prompt */}
        <div className="pt-2 text-center">
          <button
            onClick={() => switchUserRole('admin')}
            className="text-[11px] text-blue-600 hover:underline font-semibold"
          >
            چوونەژوورەوە بە هەژماری Super Admin بۆ تاقیکردنەوە
          </button>
        </div>

      </div>
    </div>
  );
};
