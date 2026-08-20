import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { 
  Smartphone, 
  ShieldCheck, 
  User, 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight,
  AlertCircle,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginWithDemo, updateProfileState, ensureAuthUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Safe Google Login with iframe popup restriction protection
  const handleGoogleLogin = async () => {
    if (isLoggingInGoogle) return; // Prevent double trigger
    setIsLoggingInGoogle(true);
    setErrorMessage(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const authUser = result.user;
      
      const userProfile = {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName || 'Google User',
        role: authUser.email?.toLowerCase() === 'shakh8002@gmail.com' ? 'superadmin' : 'owner',
        createdAt: new Date().toISOString()
      };

      updateProfileState(userProfile);
      
      if (userProfile.role === 'superadmin') {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.warn("Google popup login caught:", error);
      
      const code = error?.code || '';
      const msg = error?.message || String(error);

      if (
        code === 'auth/popup-blocked' || 
        code === 'auth/cancelled-popup-request' ||
        msg.includes('popup-blocked') ||
        msg.includes('cancelled-popup-request') ||
        msg.includes('Pending promise was never set') ||
        msg.includes('INTERNAL ASSERTION FAILED')
      ) {
        setErrorMessage(
          'بینەری گووگڵ ئاستەنگ کرا لەلایەن براوسەرەکەتەوە (Popup Blocked). تکایە لە خوارەوە لە ڕێگەی ئیمەیل یان چوونەژوورەوەی خێرا (Demo Login) بچۆ ژوورەوە.'
        );
      } else {
        setErrorMessage(`چوونە ژوورەوە لە ڕێگەی گووگڵ سەرکەوتوو نەبوو: ${msg}`);
      }
    } finally {
      setIsLoggingInGoogle(false);
    }
  };

  // Handle standard email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let role: 'superadmin' | 'owner' | 'customer' = 'owner';
      if (email.toLowerCase() === 'shakh8002@gmail.com') {
        role = 'superadmin';
      } else if (email.toLowerCase().includes('customer')) {
        role = 'customer';
      }

      await loginWithDemo(role, email);

      if (role === 'superadmin') {
        navigate('/super-admin');
      } else if (role === 'customer') {
        navigate('/customer-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'کێشەیەک ڕوویدا لە کاتی چوونە ژوورەوە.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo account trigger
  const handleQuickDemo = async (role: 'superadmin' | 'owner' | 'customer') => {
    setIsSubmitting(true);
    try {
      await loginWithDemo(role);
      if (role === 'superadmin') {
        navigate('/super-admin');
      } else if (role === 'customer') {
        navigate('/customer-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 backdrop-blur-md"
      >
        {/* App Logo */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-center text-slate-100 mb-1">ShakhStore Pro SaaS</h1>
        <p className="text-xs text-center text-slate-400 mb-6">سیستەمی بەڕێوەبردنی بەرهەم، فرۆشتن و کڕیاران</p>

        {/* Error notification banner if Google popup fails */}
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-bold flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-black">ئاگاداری چوونە ژوورەوە:</p>
              <p className="text-[11px] font-normal leading-relaxed text-amber-200/90">{errorMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Google Sign-in Option */}
        <button
          type="button"
          disabled={isLoggingInGoogle}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 py-3 rounded-2xl font-bold text-xs transition shadow-md disabled:opacity-50 cursor-pointer"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          <span>{isLoggingInGoogle ? 'تکایە چاوەڕێ بکە...' : 'چوونە ژوورەوە بە ئیمەیلی گووگڵ (Google)'}</span>
        </button>

        <div className="my-5 flex items-center gap-3 text-slate-600 text-xs">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span>یان بە ئیمەیل و وشەی نهێنی</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        {/* Standard Email / Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">ئیمەیل (Email)</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute right-3 top-3.5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="mobi@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">وشەی نهێنی (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute right-3 top-3.5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>چوونە ژوورەوە</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>

        {/* Quick Demo Accounts Selection */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            چوونەژوورەوەی خێرا (Quick Demo Login):
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickDemo('superadmin')}
              className="p-2.5 bg-slate-800/90 hover:bg-slate-800 border border-purple-500/30 rounded-xl text-center text-[10px] font-bold text-purple-300 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-purple-400" />
              سوپەر ئەدمین
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('owner')}
              className="p-2.5 bg-slate-800/90 hover:bg-slate-800 border border-blue-500/30 rounded-xl text-center text-[10px] font-bold text-blue-300 transition cursor-pointer"
            >
              <Building2 className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              خاوەن دوکان
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="p-2.5 bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/30 rounded-xl text-center text-[10px] font-bold text-emerald-300 transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              کڕیار
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center text-xs text-slate-400">
          هەژمارت نییە؟{' '}
          <Link to="/register" className="text-blue-400 font-bold hover:underline">
            دروستکردنی هەژماری نوێ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
