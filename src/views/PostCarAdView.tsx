import React, { useState } from 'react';
import {
  Car,
  Image as ImageIcon,
  CheckCircle,
  CreditCard,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Gauge,
  Calendar,
  Fuel,
  Settings,
  Eye,
  Check,
  Phone,
  User,
  MapPin,
  Flame,
  Star,
  Repeat,
  Upload,
  Clock,
  FileCheck2,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImageUpload } from '../components/common/ImageUpload';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { CarPackageType, PaymentMethod, CarAd } from '../types';
import { CITIES } from '../data/seedData';
import {
  CAR_BRAND_PRESETS,
  CAR_BODY_TYPES,
  CAR_DRIVETRAINS,
  CAR_PAINT_CONDITIONS,
  CAR_ACCIDENT_CONDITIONS
} from '../utils/categoryFields';

interface PostCarAdViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const PostCarAdView: React.FC<PostCarAdViewProps> = ({ onNavigate }) => {
  const { postCarAd } = useMarketplace();
  const { currentUser } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Core Vehicle Information
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [mileageKm, setMileageKm] = useState(25000);
  const [priceIqd, setPriceIqd] = useState(32500000);
  const [priceUsd, setPriceUsd] = useState(21500);
  const [city, setCity] = useState('Erbil (هەولێر)');
  const [transmission, setTransmission] = useState<'automatic' | 'manual'>('automatic');
  const [fuelType, setFuelType] = useState<'gasoline' | 'hybrid' | 'diesel' | 'electric'>('gasoline');
  const [bodyType, setBodyType] = useState('sedan');
  const [drivetrain, setDrivetrain] = useState<'FWD' | 'RWD' | 'AWD' | '4WD'>('FWD');
  const [engineSize, setEngineSize] = useState('2.5L');
  const [cylinders, setCylinders] = useState<number>(4);
  const [color, setColor] = useState('سپی بەفری (Pearl White)');
  const [interiorColor, setInteriorColor] = useState('بێژ / ڕەش');

  // Condition & History
  const [paintStatus, setPaintStatus] = useState('بۆیەی شەریکە / بێ بۆیاخ (Original Paint)');
  const [accidentStatus, setAccidentStatus] = useState('بێ لێدران و بێ ڕووداو (No Accident)');
  const [plateCity, setPlateCity] = useState('هەولێر (Erbil)');
  const [allowTrade, setAllowTrade] = useState(false);
  const [description, setDescription] = useState('');

  // Seller info
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '0750 123 4567');
  const [userName, setUserName] = useState(currentUser?.fullName || 'خاوەن ئۆتۆمبێل');

  // Images (up to 8)
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
  ]);

  // Package & Payment Proof
  const [packageType, setPackageType] = useState<CarPackageType>('1_month');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('fastpay');
  const [paymentSenderPhone, setPaymentSenderPhone] = useState(currentUser?.phone || '');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [paymentReceiptImages, setPaymentReceiptImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const packagePrices: Record<CarPackageType, { price: number; days: number; name: string; isVip?: boolean }> = {
    '1_week': { price: 5000, days: 7, name: 'پاکێجی بنەڕەتی (٧ ڕۆژ)' },
    '15_days': { price: 7000, days: 15, name: 'پاکێجی پێشنیارکراو (١٥ ڕۆژ)' },
    '1_month': { price: 10000, days: 30, name: 'پاکێجی تایبەتی VIP (٣٠ ڕۆژ)', isVip: true }
  };

  const paymentAccounts: Record<string, { title: string; number: string; owner: string }> = {
    fastpay: { title: 'فاستپەی (FastPay)', number: '0750 800 2000', owner: 'شاخی ئۆتۆ (Shakh Auto)' },
    fib: { title: 'بانکی یەکەمی عێراقی (FIB)', number: 'IQ99FIBB0000001234567890', owner: 'Shakh Platform LTD' },
    zaincash: { title: 'زەین کاش (ZainCash)', number: '0780 123 4567', owner: 'شاخی پلاتفۆرم' },
    asiapay: { title: 'ئاسیاپەی (AsiaPay)', number: '0770 123 4567', owner: 'شاخی ئۆتۆ' }
  };

  const handlePriceIqdChange = (val: number) => {
    setPriceIqd(val);
    setPriceUsd(Math.round(val / 1500));
  };

  const handlePriceUsdChange = (val: number) => {
    setPriceUsd(val);
    setPriceIqd(val * 1500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(key);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const validateStep1 = () => {
    if (!title.trim()) {
      setErrorMessage('تکایە ناونیشانی ڕیکلام بنووسە.');
      return false;
    }
    if (!brand.trim() || !model.trim()) {
      setErrorMessage('تکایە براند و مۆدێلی ئۆتۆمبێل دیاریبکە.');
      return false;
    }
    if (!priceIqd || priceIqd <= 0) {
      setErrorMessage('تکایە نرخی ئۆتۆمبێل بنووسە.');
      return false;
    }
    if (!userPhone.trim()) {
      setErrorMessage('تکایە ژمارەی تەلەفۆن بنووسە.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const validateStep2 = () => {
    if (images.length === 0) {
      setErrorMessage('تکایە لانیکەم ١ وێنەی ئۆتۆمبێلەکە باربکە.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const validateStep4 = () => {
    if (paymentReceiptImages.length === 0 && !paymentTransactionId.trim()) {
      setErrorMessage('تکایە وێنەی وەسڵی پارەدان (Receipt Screenshot) یان کۆدی مامەڵە (Transaction ID) بنووسە.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateStep1() || !validateStep2() || !validateStep4()) {
      return;
    }

    setIsSubmitting(true);

    const result = await postCarAd({
      userId: currentUser?.id || 'guest-car-seller',
      title: title.trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      mileageKm: Number(mileageKm),
      priceIqd: Number(priceIqd),
      priceUsd: Number(priceUsd),
      city,
      transmission,
      fuelType,
      color,
      damageStatus: `${paintStatus} • ${accidentStatus}`,
      licensePlateStatus: `تابلۆی ${plateCity} - سەنەوی نوێ`,
      description: description.trim(),
      images,
      packageType,
      packagePrice: packagePrices[packageType].price,
      userPhone,
      userName,
      paymentProofUrl: paymentReceiptImages[0] || '',
      paymentSenderPhone: paymentSenderPhone.trim(),
      paymentMethodUsed: paymentMethod,
      paymentRef: paymentTransactionId.trim() || `TX-${Date.now().toString().substring(6)}`,
      adminApprovalStatus: 'pending'
    });

    setIsSubmitting(false);

    if (result.success && result.adId) {
      setCreatedAdId(result.adId);
      setIsSuccessModalOpen(true);
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      setErrorMessage(result.error || 'هەڵەیەک ڕوویدا لە دانانی ڕیکلام');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 text-right" dir="rtl">
      
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <span className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl shadow-md">
                <Car className="w-6 h-6" />
              </span>
              <span>دانانی ڕیکلامی ئۆتۆمبێل (Shakh Auto)</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
              ئۆتۆمبێلەکەت بە هەموو وردەکارییە تەکنیکییەکان پیشانی هەزاران کڕیاری کوردستان بدە
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-2 rounded-2xl border border-amber-200 dark:border-amber-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>خێراترین کڕین و فرۆشتن</span>
          </span>
        </div>

        {/* 4-Step Indicator */}
        <div className="grid grid-cols-4 gap-2 border-t border-slate-100 dark:border-slate-700/80 pt-4">
          {[
            { num: 1, label: 'تایبەتمەندی ئۆتۆمبێل', icon: Car },
            { num: 2, label: 'وێنەکان (تا ٨)', icon: ImageIcon },
            { num: 3, label: 'پێداچوونەوە', icon: Eye },
            { num: 4, label: 'پاکێج و وەسڵی پارەدان', icon: CreditCard }
          ].map((s) => {
            const isPassed = step >= s.num;
            const isCurrent = step === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (step > s.num) setStep(s.num as any);
                }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/40 font-black'
                    : isPassed
                    ? 'bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 font-bold'
                    : 'text-slate-400 dark:text-slate-500 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-transform ${
                    isCurrent
                      ? 'bg-amber-500 text-white shadow-md scale-105'
                      : isPassed
                      ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  {isPassed && step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-[11px] font-bold truncate max-w-full hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs sm:text-sm font-black flex items-center gap-2.5 animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Vehicle Specifications */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 animate-fade-in">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3.5 flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-500" />
            <span>هەنگاوی ١: زانیاری و تایبەتمەندییە تەکنیکییەکانی ئۆتۆمبێل</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                ناونیشانی ڕیکلام (Title) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="وەک: تۆیۆتا کامری ٢٠٢٣ کلین تایتڵ فول مواسەفات"
                required
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Brand & Model */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                کۆمپانیا / براند (Make) *
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
              >
                {CAR_BRAND_PRESETS.map((b) => (
                  <option key={b} value={b.split(' ')[0]} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                مۆدێلی تەواو (Model) *
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="وەک: Camry SE, Land Cruiser VXR, Tucson..."
                required
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Year & Mileage */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                ساڵی دروستکردن (Year) *
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1980}
                max={new Date().getFullYear() + 1}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-latin font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                ڕۆیشتوو بە کیلۆمەتر (Mileage KM) *
              </label>
              <input
                type="number"
                value={mileageKm}
                onChange={(e) => setMileageKm(Number(e.target.value))}
                min={0}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-latin font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Prices IQD & USD */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                نرخ بە دیناری عێراقی (IQD) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={priceIqd}
                  onChange={(e) => handlePriceIqdChange(Number(e.target.value))}
                  step={50000}
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 pr-4 pl-12 text-xs sm:text-sm font-latin font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 transition-all"
                />
                <span className="absolute left-3.5 top-3.5 text-xs font-black text-amber-600 dark:text-amber-400">د.ع</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                نرخ بە دۆلاری ئەمریکی (USD $)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={priceUsd}
                  onChange={(e) => handlePriceUsdChange(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 pr-4 pl-10 text-xs sm:text-sm font-latin font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 transition-all"
                />
                <span className="absolute left-3.5 top-3.5 text-xs font-black text-emerald-600 dark:text-emerald-400 font-latin">$</span>
              </div>
            </div>

            {/* City & Transmission */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">شار *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">جۆری گێڕ (Transmission) *</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="automatic" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">ئۆتۆماتیک (Automatic)</option>
                <option value="manual" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">عادی / دەستی (Manual)</option>
              </select>
            </div>

            {/* Fuel & Drivetrain */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">سووتەمەنی (Fuel Type) *</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="gasoline" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">بەنزین (Gasoline)</option>
                <option value="hybrid" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">هایبرید (Hybrid)</option>
                <option value="electric" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">کارەبایی (Electric EV)</option>
                <option value="diesel" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">دیزڵ / گاز (Diesel)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">دەبڵ ئەکسل (Drivetrain)</label>
              <select
                value={drivetrain}
                onChange={(e) => setDrivetrain(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {CAR_DRIVETRAINS.map((d) => (
                  <option key={d.value} value={d.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">{d.label}</option>
                ))}
              </select>
            </div>

            {/* Colors */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">ڕەنگی دەرەوە (Exterior Color) *</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="وەک: سپی بەفری، ڕەش مرواری، شینی نیڤی..."
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">دۆخی بۆیاخ (Paint Condition)</label>
              <select
                value={paintStatus}
                onChange={(e) => setPaintStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {CAR_PAINT_CONDITIONS.map((p) => (
                  <option key={p.value} value={p.label} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">{p.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">دۆخی لێدران و ڕووداو (Accidents)</label>
              <select
                value={accidentStatus}
                onChange={(e) => setAccidentStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {CAR_ACCIDENT_CONDITIONS.map((a) => (
                  <option key={a.value} value={a.label} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">{a.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">تابلۆ و شار</label>
              <input
                type="text"
                value={plateCity}
                onChange={(e) => setPlateCity(e.target.value)}
                placeholder="وەک: هەولێر، سلێمانی، دهۆک، بەغداد..."
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Trade Option Toggle */}
            <div className="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Repeat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">قبووڵکردنی موعارەزە / گۆڕینەوە (Allow Trade)</h4>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ئایا ئامادەیت ئۆتۆمبێلەکەت بگۆڕیتەوە لەگەڵ ئۆتۆمبێلی تر بە سەرانە؟</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllowTrade(!allowTrade)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  allowTrade ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowTrade ? 'right-7' : 'right-1'
                  }`}
                />
              </button>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">وەسفی تەواو و تێبینییەکان (Description)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="هەموو وردەکارییەکان، سێرڤیس، کەلوپەلی زیادە و تایبەتمەندییەکان بنووسە..."
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Seller Contact Info */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">ناوی فرۆشیار *</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">ژمارەی مۆبایل و واتسئەپ *</label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm font-latin font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>هەنگاوی داهاتوو: بارکردنی وێنەکان</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Photo Upload */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 animate-fade-in">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-500" />
            <span>هەنگاوی ٢: وێنەکانی ئۆتۆمبێل (تا ٨ وێنەی کوالیتی بەرز)</span>
          </h3>

          <ImageUpload
            images={images}
            onChange={setImages}
            maxImages={8}
            label="وێنەی پێشەوە، دواوە، ژوورەوە و لایەکانی ئۆتۆمبێل باربکە:"
            helperText="وێنەی ڕوون و کوالیتی بەرز لە شوێنی ڕووناک دابنێ. یەکەم وێنە وەک وێنەی سەرەکی دادەنرێت."
          />

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>هەنگاوی پێشوو</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (validateStep2()) setStep(3);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>هەنگاوی داهاتوو: پێداچوونەوە</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Live Preview */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-500" />
              <span>هەنگاوی ٣: پێداچوونەوەی ڕیکلامی ئۆتۆمبێل (Live Preview)</span>
            </h3>

            {/* Car Preview Card */}
            <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden p-4 space-y-4">
              <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={images[0] || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md">
                  {year} • {brand}
                </span>
                <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-latin font-bold px-2.5 py-1 rounded-lg">
                  {mileageKm.toLocaleString()} کم
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-slate-100">{title || `${brand} ${model} ${year}`}</h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{city} • {paintStatus}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">گێڕ</span>
                    <span className="text-slate-800 dark:text-slate-200">{transmission === 'automatic' ? 'ئۆتۆماتیک' : 'عادی'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">سووتەمەنی</span>
                    <span className="text-slate-800 dark:text-slate-200">{fuelType}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">ئەکسل</span>
                    <span className="text-slate-800 dark:text-slate-200 font-latin">{drivetrain}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-latin">
                      ${priceUsd.toLocaleString()} USD
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block font-latin">
                      ≈ {priceIqd.toLocaleString()} د.ع
                    </span>
                  </div>

                  <div className="text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{userName}</span>
                    <span className="block text-[11px] text-slate-400 font-latin">{userPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>هەنگاوی پێشوو</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>هەنگاوی داهاتوو: پاکێج و بەڵگەی پارەدان</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Package Selection & Payment Proof */}
      {step === 4 && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-7 animate-fade-in">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              <span>هەنگاوی ٤: پاکێجی ڕیکلام و بارکردنی بەڵگەی پارەدان</span>
            </h3>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-xl">
              تەسدیقی سوپەر ئەدمین
            </span>
          </div>

          {/* Package Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">
              ١. هەڵبژاردنی ماوە و پاکێجی ڕیکلام:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.entries(packagePrices) as [CarPackageType, typeof packagePrices['1_week']][]).map(([key, pkg]) => {
                const isSelected = packageType === key;
                return (
                  <div
                    key={key}
                    onClick={() => setPackageType(key)}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {pkg.isVip && (
                      <span className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                        ★ پێشنیاری شاخی (VIP)
                      </span>
                    )}

                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 mb-1">{pkg.name}</h4>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-latin">
                        {pkg.price.toLocaleString()} د.ع
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">بۆ ماوەی {pkg.days} ڕۆژی تەواو</p>
                    </div>

                    <ul className="text-[11px] font-bold text-slate-600 dark:text-slate-300 space-y-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>پیشاندان لە بەشی ئۆتۆمبێلی شاخ</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>پەیوەندی ڕاستەوخۆ بە کڕیاران</span>
                      </li>
                      {pkg.isVip && (
                        <li className="flex items-center gap-1.5 font-black text-amber-700 dark:text-amber-300">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span>نیشانەی تایبەتی VIP لەسەر وێنە</span>
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">
              ٢. ڕێگەی ناردنی پارەکە دیاریبکە:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'fastpay' as PaymentMethod, name: 'فاستپەی (FastPay)' },
                { id: 'fib' as PaymentMethod, name: 'بانکی FIB' },
                { id: 'zaincash' as PaymentMethod, name: 'زەین کاش' },
                { id: 'asiapay' as PaymentMethod, name: 'ئاسیاپەی' }
              ].map(m => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3.5 rounded-2xl border text-xs font-black text-center transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 ring-2 ring-amber-600/30'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Official Transfer Account Details Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>زانیاری هەژماری فەرمی بۆ ناردنی پارە:</span>
              </span>
              <span className="text-xs font-black text-emerald-400 font-latin">
                بڕی پێویست: {packagePrices[packageType].price.toLocaleString()} د.ع
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">ڕێگەی ناردن: <span className="font-bold text-white">{paymentAccounts[paymentMethod]?.title}</span></p>
                <p className="text-base font-black font-latin text-amber-300 tracking-wider mt-0.5">
                  {paymentAccounts[paymentMethod]?.number}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">ناوی وەرگر: <span className="font-bold text-slate-200">{paymentAccounts[paymentMethod]?.owner}</span></p>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(paymentAccounts[paymentMethod]?.number || '', paymentMethod)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedAccount === paymentMethod ? 'کۆپی کرا! ✓' : 'کۆپیکردنی ژمارە'}</span>
              </button>
            </div>
          </div>

          {/* Payment Proof Receipt Screenshot Upload */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>٣. بارکردنی وەسڵ / بەڵگەی ناردنی پارە (Payment Proof Screenshot) *</span>
              </label>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                تکایە سکرینشۆت یان وێنەی وەسڵی ناردنی پارەکە باربکە بۆ ئەوەی لەلایەن سوپەر ئەدمین پشتڕاست بکرێتەوە.
              </p>
            </div>

            <ImageUpload
              images={paymentReceiptImages}
              onChange={setPaymentReceiptImages}
              maxImages={1}
              label="وێنەی وەسڵ یان سکرینشۆتی حەواڵە باربکە:"
              helperText="وێنەی ڕوون لەسەر ئەنجامدانی حەواڵەکە بنێرە تا دەستبەجێ ڕیکلامەکەت پەسەند بکرێت."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">ژمارەی تەلەفۆن / هەژماری نێرەر (Sender Phone)</label>
                <input
                  type="tel"
                  value={paymentSenderPhone}
                  onChange={(e) => setPaymentSenderPhone(e.target.value)}
                  placeholder="ژمارەی مۆبایلەکەت کە پارەت پێ ناردووە"
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3 text-xs sm:text-sm font-latin font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 dark:text-slate-100 block">کۆدی حەواڵە / Transaction Reference ID</label>
                <input
                  type="text"
                  value={paymentTransactionId}
                  onChange={(e) => setPaymentTransactionId(e.target.value)}
                  placeholder="وەک: TX-984729 یان ژمارەی وەسڵ"
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-2xl p-3 text-xs sm:text-sm font-latin font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>هەنگاوی پێشوو</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-amber-500/30 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'لە پرۆسەی تۆمارکردندایە...'
                  : `ناردنی وەسڵ (${packagePrices[packageType].price.toLocaleString()} د.ع) و تۆمارکردن`}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* Success Modal upon Submission */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-5 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                ڕیکلامەکەت بە سەرکەوتوویی تۆمارکرا!
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                بەڵگەی وەسڵی پارەدانەکەت بە سەرکەوتوویی نێردرا بۆ سوپەر ئەدمین. دوای پێداچوونەوە و وردبینی، دەستبەجێ ڕیکلامەکەت لە شاخی ئۆتۆ بڵاودەبێتەوە.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs font-black text-amber-800 dark:text-amber-300">
              دۆخی ئێستا: لە چاوەڕوانی تەسدیقکردنی پارەدان (Pending Approval)
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  onNavigate('car-marketplace');
                }}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-black transition-colors cursor-pointer"
              >
                بازاڕی ئۆتۆمبێل
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  if (createdAdId) {
                    onNavigate('car-detail', createdAdId);
                  } else {
                    onNavigate('car-marketplace');
                  }
                }}
                className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                بینینی ڕیکلامەکەم
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
