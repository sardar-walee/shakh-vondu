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
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImageUpload } from '../components/common/ImageUpload';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { CarPackageType, PaymentMethod } from '../types';
import { CITIES } from '../data/seedData';

interface PostCarAdViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const PostCarAdView: React.FC<PostCarAdViewProps> = ({ onNavigate }) => {
  const { postCarAd } = useMarketplace();
  const { currentUser } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2023);
  const [mileageKm, setMileageKm] = useState(25000);
  const [priceIqd, setPriceIqd] = useState(32500000);
  const [priceUsd, setPriceUsd] = useState(21500);
  const [city, setCity] = useState('Erbil (هەولێر)');
  const [transmission, setTransmission] = useState<'automatic' | 'manual'>('automatic');
  const [fuelType, setFuelType] = useState<'gasoline' | 'hybrid' | 'diesel' | 'electric'>('gasoline');
  const [color, setColor] = useState('سپی بەفری');
  const [damageStatus, setDamageStatus] = useState('بێ لێدران و بێ بۆیاخ (خاوێن)');
  const [licensePlateStatus, setLicensePlateStatus] = useState('تابلۆی هەولێر - ژینگە و سەنەوی نوێیە');
  const [description, setDescription] = useState('');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '0750 123 4567');
  const [userName, setUserName] = useState(currentUser?.fullName || 'خاوەن ئۆتۆمبێل');

  // Images
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
  ]);

  // Package & Payment
  const [packageType, setPackageType] = useState<CarPackageType>('1_month');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('fastpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const packagePrices: Record<CarPackageType, { price: number; days: number; name: string; isVip?: boolean }> = {
    '1_week': { price: 5000, days: 7, name: 'پاکێجی بنەڕەتی (٧ ڕۆژ)' },
    '15_days': { price: 7000, days: 15, name: 'پاکێجی پێشنیارکراو (١٥ ڕۆژ)' },
    '1_month': { price: 10000, days: 30, name: 'پاکێجی تایبەتی VIP (٣٠ ڕۆژ)', isVip: true }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !brand.trim() || !model.trim()) {
      setErrorMessage('تکایە هەموو زانیارییە سەرەکییەکان پڕبکەرەوە.');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('تکایە لانیکەم ١ وێنەی ئۆتۆمبێلەکە باربکە.');
      return;
    }

    setIsSubmitting(true);

    const result = await postCarAd({
      title,
      brand,
      model,
      year: Number(year),
      mileageKm: Number(mileageKm),
      priceIqd: Number(priceIqd),
      priceUsd: Number(priceUsd),
      city,
      transmission,
      fuelType,
      color,
      damageStatus,
      licensePlateStatus,
      description,
      images,
      packageType,
      packagePrice: packagePrices[packageType].price,
      userPhone,
      userName
    });

    setIsSubmitting(false);

    if (result.success && result.carId) {
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
      onNavigate('car-detail', result.carId);
    } else {
      setErrorMessage(result.error || 'هەڵەیەک ڕوویدا لە دانانی ڕیکلام');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      {/* Step Progress Tracker */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="text-right">
          <h1 className="text-2xl font-black text-slate-900">دانانی ڕیکلامی ئۆتۆمبێل</h1>
          <p className="text-xs text-slate-500 mt-1">ئۆتۆمبێلەکەت لە گەورەترین بازاڕی کوردستان پیشانی هەزاران کڕیار بدە</p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-orange-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>1</span>
            <span>زانیاری ئۆتۆمبێل</span>
          </div>

          <div className="h-0.5 flex-1 mx-4 bg-slate-200" />

          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-orange-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>2</span>
            <span>وێنەکان</span>
          </div>

          <div className="h-0.5 flex-1 mx-4 bg-slate-200" />

          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 3 ? 'text-orange-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>3</span>
            <span>پاکێج و پارەدان</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Car Specifications */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
            زانیاری و تایبەتمەندییە سەرەکییەکان
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">ناونیشانی ڕیکلام (Title) *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="وەک: تۆیۆتا کامری ٢٠٢٣ کلین تایتڵ"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">کۆمپانیا (Brand) *</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:bg-white focus:outline-hidden"
              >
                {['Toyota', 'Mercedes-Benz', 'Hyundai', 'BMW', 'Kia', 'Nissan', 'Ford', 'Chevrolet', 'Audi', 'Lexus', 'Jeep', 'Volkswagen'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">مۆدێل (Model) *</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="وەک: Camry, Tucson, Sonata, Elantra..."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ساڵی دروستکردن (Year) *</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ڕۆیشتوو بە کیلۆمەتر (Mileage) *</label>
              <input
                type="number"
                value={mileageKm}
                onChange={(e) => setMileageKm(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">نرخ بە دیناری عێراقی (IQD) *</label>
              <input
                type="number"
                value={priceIqd}
                onChange={(e) => setPriceIqd(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">نرخ بە دۆلاری ئەمریکی (USD - ئارەزوومەندانە)</label>
              <input
                type="number"
                value={priceUsd}
                onChange={(e) => setPriceUsd(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">شار *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:bg-white focus:outline-hidden"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">گێڕ *</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:bg-white focus:outline-hidden"
              >
                <option value="automatic">ئۆتۆماتیک (Automatic)</option>
                <option value="manual">عادی (Manual)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">سووتەمەنی *</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:bg-white focus:outline-hidden"
              >
                <option value="gasoline">بەنزین (Gasoline)</option>
                <option value="hybrid">هایبرید (Hybrid)</option>
                <option value="diesel">دیزڵ (Diesel)</option>
                <option value="electric">کارەبایی (Electric)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ڕەنگ *</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">دۆخی بۆیاخ و لێدران *</label>
              <input
                type="text"
                value={damageStatus}
                onChange={(e) => setDamageStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">تابلۆ و بەڵگەنامە *</label>
              <input
                type="text"
                value={licensePlateStatus}
                onChange={(e) => setLicensePlateStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">ڕوونکردنەوەی زیاتر (Description) *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="هەموو وردەکارییەکان، ئۆپشنەکان و تێبینییەکان بنووسە..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ناوی فرۆشیار *</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ژمارەی مۆبایل و واتسئەپ *</label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
            >
              هەنگاوی داهاتوو: بارکردنی وێنەکان ←
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Photo Upload */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
            وێنەی ئۆتۆمبێل باربکە
          </h3>

          <ImageUpload
            images={images}
            onChange={setImages}
            maxImages={8}
            label="وێنەی پێشەوە، دواوە، ژوورەوە و لایەکانی ئۆتۆمبێل باربکە:"
            helperText="وێنەی ڕوون و کوالیتی بەرز یارمەتی فرۆشتنی خێراتری ئۆتۆمبێلەکەت دەدات."
          />

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              ← هەنگاوی پێشوو
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
            >
              هەنگاوی داهاتوو: دیاریکردنی پاکێج ←
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Package Selection & Payment */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
            هەڵبژاردنی پاکێجی ڕیکلام و پارەدان
          </h3>

          {/* Package Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(packagePrices) as [CarPackageType, typeof packagePrices['1_week']][]).map(([key, pkg]) => {
              const isSelected = packageType === key;
              return (
                <div
                  key={key}
                  onClick={() => setPackageType(key)}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/40 shadow-md ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {pkg.isVip && (
                    <span className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                      ★ پێشنیاری شاخی (VIP)
                    </span>
                  )}

                  <div>
                    <h4 className="text-xs font-black text-slate-900 mb-1">{pkg.name}</h4>
                    <p className="text-xl font-black text-orange-600 font-latin">
                      {pkg.price.toLocaleString()} د.ع
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">بۆ ماوەی {pkg.days} ڕۆژی تەواو</p>
                  </div>

                  <ul className="text-[11px] text-slate-600 space-y-1.5 mt-4 pt-3 border-t border-slate-100">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>پیشاندان لە پەڕەی سەرەکی</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>پەیوەندی ڕاستەوخۆ بە واتسئەپ</span>
                    </li>
                    {pkg.isVip && (
                      <li className="flex items-center gap-1.5 font-bold text-amber-700">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>نیشانەی تایبەتی VIP لەسەر وێنە</span>
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-700 block">شێوازی پارەدانی پارەی ڕیکلام:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    paymentMethod === m.id
                      ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-600/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              ← هەنگاوی پێشوو
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-orange-500/30 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'لە پرۆسەی تۆمارکردندایە...' : `تەواوکردنی پارەدان (${packagePrices[packageType].price.toLocaleString()} د.ع) و بڵاوکردنەوە`}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
