import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
  Store as StoreIcon, 
  UserCheck, 
  Mail, 
  Lock, 
  Phone, 
  Building2, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { BusinessType } from '../types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { updateProfileState, ensureAuthUser } = useAuth();
  const [accountType, setAccountType] = useState<'store_owner' | 'customer'>('store_owner');

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('mobile_electronics');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        currentUser = await ensureAuthUser();
      }

      const uid = currentUser?.uid || `user_${Date.now()}`;

      if (accountType === 'customer') {
        const customerProfile = {
          displayName: displayName || 'Customer',
          email: email || 'customer@mobistore.com',
          phone: phone || '',
          role: 'customer',
          createdAt: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'users', uid), customerProfile, { merge: true });
        } catch (dbErr) {
          console.warn("Customer DB write error:", dbErr);
        }

        updateProfileState(customerProfile);
        setIsLoading(false);
        navigate('/customer-portal');
      } else {
        // Store Owner registration
        const storeId = doc(collection(db, 'stores')).id;
        const trialEndDate = new Date();
        trialEndDate.setMonth(trialEndDate.getMonth() + 6);

        const storeData = {
          name: storeName || 'ShakhStore Branch',
          phone: phone || '0750 000 0000',
          businessType: businessType || 'mobile_electronics',
          ownerId: uid,
          subscriptionStatus: 'trial',
          trialEndDate: trialEndDate.toISOString(),
          createdAt: new Date().toISOString()
        };

        const ownerProfile = {
          displayName: displayName || 'Store Owner',
          email: email || 'owner@mobistore.com',
          phone: phone || '',
          role: 'owner',
          storeId: storeId,
          createdAt: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'stores', storeId), storeData);
          await setDoc(doc(db, 'users', uid), ownerProfile);
        } catch (dbErr) {
          console.warn("Store Owner DB write error:", dbErr);
        }

        updateProfileState(ownerProfile);
        setIsLoading(false);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'دروستکردنی هەژمار سەرکەوتوو نەبوو.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 backdrop-blur-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 mb-3">
            <StoreIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-100">دروستکردنی هەژماری نوێ</h1>
          <p className="text-xs text-slate-400 mt-1">تکایە جۆری هەژمارەکەت هەڵبژێرە بۆ بەردەوامبوون</p>
        </div>

        {/* Account Type Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setAccountType('store_owner')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
              accountType === 'store_owner'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            خاوەن دوکان (Store Owner)
          </button>

          <button
            type="button"
            onClick={() => setAccountType('customer')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
              accountType === 'customer'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            کڕیار (Customer Account)
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">ناوى تەواو</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ناو و پاشناوت بنووسە"
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email / Subscriber Gmail */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">ئیمەیل (Gmail Subscriber)</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute right-3 top-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ئیمەیلی بەشداربوو بنووسە (mobi@gmail.com)"
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">ژمارەی مۆبایل</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute right-3 top-3.5 text-slate-500" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0750 123 4567"
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Store Owner Specific Fields */}
          {accountType === 'store_owner' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ناوی دوکان / کۆمپانیا</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="ناوی دوکانەکەت بنووسە"
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">جۆری دوکان (Business Type)</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mobile_electronics">📱 مۆبایل و ئەلیکترۆنیات (Mobile & Electronics)</option>
                  <option value="pharmacy_medical">💊 دەرمانخانە و پێداویستی پزیشکی (Pharmacy & Medical)</option>
                  <option value="supermarket_grocery">🛒 مارکێت و خواردەمەنی (Supermarket & Grocery)</option>
                  <option value="clothing_fashion">👔 جلوبەرگ و مۆدە (Clothing & Fashion)</option>
                  <option value="auto_parts">🔧 کەلوپەلی ئۆتۆمبێل (Auto Parts & Hardware)</option>
                  <option value="restaurant_cafe">🍽️ چێشتخانە و کافێ (Restaurant & Cafe)</option>
                  <option value="cosmetics_perfumes">💄 کۆزمەتیک و بۆن (Cosmetics & Perfumes)</option>
                  <option value="general_retail">🏪 دوکانی گشتی (General Retail)</option>
                </select>
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">وشەی نهێنی</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute right-3 top-3.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="لانی کەم ٦ پیت بنووسە"
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-xl transition disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>لە دروستکردندایە...</span>
            ) : (
              <>
                <span>دروستکردنی هەژمار</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 pt-6 border-t border-slate-800 text-xs text-slate-400">
          هەژمارت هەیە؟{' '}
          <Link to="/login" className="text-blue-400 font-bold hover:underline">
            چوونە ژوورەوە
          </Link>
        </div>
      </div>
    </div>
  );
}
