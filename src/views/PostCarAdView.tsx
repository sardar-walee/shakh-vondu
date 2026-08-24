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
  Repeat
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
  const [seatMaterial, setSeatMaterial] = useState('leather');
  const [sunroof, setSunroof] = useState('sunroof');
  const [hasCamera360, setHasCamera360] = useState(true);
  const [hasRadar, setHasRadar] = useState(true);
  const [hasLeatherSeats, setHasLeatherSeats] = useState(true);
  const [hasKeylessEntry, setHasKeylessEntry] = useState(true);

  // Condition & History
  const [paintStatus, setPaintStatus] = useState('بۆیەی شەریکە / بێ بۆیاخ (Original Paint)');
  const [accidentStatus, setAccidentStatus] = useState('بێ لێدران و بێ ڕووداو (No Accident)');
  const [chassisStatus, setChassisStatus] = useState('شاسی کەپس و خاوێن (Clean Chassis)');
  const [airbagStatus, setAirbagStatus] = useState('ئێرباگ تەواو و تەقین نەکراو (Intact)');
  const [plateCity, setPlateCity] = useState('هەولێر (Erbil)');
  const [importSpecs, setImportSpecs] = useState('خلیجی / ناوخۆ');
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

  const handlePriceIqdChange = (val: number) => {
    setPriceIqd(val);
    setPriceUsd(Math.round(val / 1500));
  };

  const handlePriceUsdChange = (val: number) => {
    setPriceUsd(val);
    setPriceIqd(val * 1500);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateStep1() || !validateStep2()) {
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
      userName
    });

    setIsSubmitting(false);

    const generatedCarId = result.adId;
    if (result.success && generatedCarId) {
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
      onNavigate('car-detail', generatedCarId);
    } else {
      setErrorMessage(result.error || 'هەڵەیەک ڕوویدا لە دانانی ڕیکلام');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 text-right" dir="rtl">
      
      {/* Step Progress Tracker */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span className="p-2 bg-amber-100 text-amber-600 rounded-2xl">
                <Car className="w-6 h-6" />
              </span>
              <span>دانانی ڕیکلامی ئۆتۆمبێل (Shakh Auto)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">ئۆتۆمبێلەکەت بە هەموو وردەکارییە تەکنیکییەکان پیشانی هەزاران کڕیار بدە</p>
          </div>

          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60">
            خێراترین فرۆشتن لە کوردستان
          </span>
        </div>

        {/* 4-Step Indicator */}
        <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
          {[
            { num: 1, label: 'تایبەتمەندی ئۆتۆمبێل', icon: Car },
            { num: 2, label: 'وێنەکان (تا ٨)', icon: ImageIcon },
            { num: 3, label: 'پێداچوونەوە', icon: Eye },
            { num: 4, label: 'پاکێج و پارەدان', icon: CreditCard }
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
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-50 text-amber-700 ring-2 ring-amber-500/20 font-black'
                    : isPassed
                    ? 'bg-slate-50 text-slate-700 font-bold'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                    isCurrent
                      ? 'bg-amber-500 text-white shadow-xs'
                      : isPassed
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isPassed && step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-[11px] truncate max-w-full hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Vehicle Specifications */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 animate-fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span>هەنگاوی ١: زانیاری و تایبەتمەندییە تەکنیکییەکانی ئۆتۆمبێل</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ناونیشانی ڕیکلام (Title) *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="وەک: تۆیۆتا کامری ٢٠٢٣ کلین تایتڵ فول مواسەفات"
                required
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Brand & Model */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">کۆمپانیا / براند (Make) *</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              >
                {CAR_BRAND_PRESETS.map((b) => (
                  <option key={b} value={b.split(' ')[0]}>{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">مۆدێلی تەواو (Model) *</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="وەک: Camry SE, Land Cruiser VXR, Tucson..."
                required
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Year & Mileage */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ساڵی دروستکردن (Year) *</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1980}
                max={new Date().getFullYear() + 1}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-latin font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ڕۆیشتوو بە کیلۆمەتر (Mileage KM) *</label>
              <input
                type="number"
                value={mileageKm}
                onChange={(e) => setMileageKm(Number(e.target.value))}
                min={0}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-latin font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Prices IQD & USD */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">نرخ بە دیناری عێراقی (IQD) *</label>
              <div className="relative">
                <input
                  type="number"
                  value={priceIqd}
                  onChange={(e) => handlePriceIqdChange(Number(e.target.value))}
                  step={50000}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-latin font-bold focus:bg-white focus:outline-none focus:border-amber-500"
                />
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">د.ع</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">نرخ بە دۆلاری ئەمریکی (USD $)</label>
              <div className="relative">
                <input
                  type="number"
                  value={priceUsd}
                  onChange={(e) => handlePriceUsdChange(Number(e.target.value))}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-latin font-bold focus:bg-white focus:outline-none focus:border-amber-500"
                />
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">$</span>
              </div>
            </div>

            {/* City & Transmission */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">شار *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              >
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">جۆری گێڕ (Transmission) *</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as any)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="automatic">ئۆتۆماتیک (Automatic)</option>
                <option value="manual">عادی / دەستی (Manual)</option>
              </select>
            </div>

            {/* Fuel & Drivetrain */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">سووتەمەنی (Fuel Type) *</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as any)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="gasoline">بەنزین (Gasoline)</option>
                <option value="hybrid">هایبرید (Hybrid)</option>
                <option value="electric">کارەبایی (Electric EV)</option>
                <option value="diesel">دیزڵ / گاز (Diesel)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">دەبڵ ئەکسل (Drivetrain)</label>
              <select
                value={drivetrain}
                onChange={(e) => setDrivetrain(e.target.value as any)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              >
                {CAR_DRIVETRAINS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Colors */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ڕەنگی دەرەوە (Exterior Color) *</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="وەک: سپی بەفری، ڕەش مرواری، شینی نیڤی..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">دۆخی بۆیاخ (Paint Condition)</label>
              <select
                value={paintStatus}
                onChange={(e) => setPaintStatus(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              >
                {CAR_PAINT_CONDITIONS.map((p) => (
                  <option key={p.value} value={p.label}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">دۆخی لێدران و ڕووداو (Accidents)</label>
              <select
                value={accidentStatus}
                onChange={(e) => setAccidentStatus(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              >
                {CAR_ACCIDENT_CONDITIONS.map((a) => (
                  <option key={a.value} value={a.label}>{a.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">تابلۆ و شار</label>
              <input
                type="text"
                value={plateCity}
                onChange={(e) => setPlateCity(e.target.value)}
                placeholder="وەک: هەولێر، سلێمانی، دهۆک، بەغداد..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Trade Option Toggle */}
            <div className="sm:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">قبووڵکردنی موعارەزە / گۆڕینەوە (Allow Trade)</h4>
                  <p className="text-[11px] text-slate-500">ئایا ئامادەیت ئۆتۆمبێلەکەت بگۆڕیتەوە لەگەڵ ئۆتۆمبێلی تر بە سەرانە؟</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllowTrade(!allowTrade)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  allowTrade ? 'bg-amber-500' : 'bg-slate-300'
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
              <label className="text-xs font-bold text-slate-700">وەسفی تەواو و تێبینییەکان (Description)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="هەموو وردەکارییەکان، سێرڤیس، کەلوپەلی زیادە و تایبەتمەندییەکان بنووسە..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Seller Contact Info */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ناوی فرۆشیار *</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ژمارەی مۆبایل و واتسئەپ *</label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-latin font-bold focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>هەنگاوی داهاتوو: بارکردنی وێنەکان</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Photo Upload */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 animate-fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>هەنگاوی ٢: وێنەکانی ئۆتۆمبێل (تا ٨ وێنەی کوالیتی بەرز)</span>
          </h3>

          <ImageUpload
            images={images}
            onChange={setImages}
            maxImages={8}
            label="وێنەی پێشەوە، دواوە، ژوورەوە و لایەکانی ئۆتۆمبێل باربکە:"
            helperText="وێنەی ڕوون و کوالیتی بەرز لە شوێنی ڕووناک دابنێ. یەکەم وێنە وەک وێنەی سەرەکی دادەنرێت."
          />

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>هەنگاوی پێشوو</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (validateStep2()) setStep(3);
              }}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
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
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-500" />
              <span>هەنگاوی ٣: پێداچوونەوەی ڕیکلامی ئۆتۆمبێل (Live Preview)</span>
            </h3>

            {/* Car Preview Card */}
            <div className="max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden p-4 space-y-4">
              <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={images[0] || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-xs">
                  {year} • {brand}
                </span>
                <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-latin font-bold px-2 py-0.5 rounded-lg">
                  {mileageKm.toLocaleString()} کم
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-black text-slate-900">{title || `${brand} ${model} ${year}`}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{city} • {paintStatus}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">گێڕ</span>
                    <span className="text-slate-800">{transmission === 'automatic' ? 'ئۆتۆماتیک' : 'عادی'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">سووتەمەنی</span>
                    <span className="text-slate-800">{fuelType}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">ئەکسل</span>
                    <span className="text-slate-800 font-latin">{drivetrain}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-lg font-black text-amber-600 font-latin">
                      ${priceUsd.toLocaleString()} USD
                    </span>
                    <span className="text-xs text-slate-500 block font-latin font-bold">
                      ≈ {priceIqd.toLocaleString()} د.ع
                    </span>
                  </div>

                  <div className="text-left text-xs font-bold text-slate-600">
                    <span>{userName}</span>
                    <span className="block text-[11px] text-slate-400 font-latin">{userPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>هەنگاوی پێشوو</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>هەنگاوی داهاتوو: دیاریکردنی پاکێج و بڵاوکردنەوە</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Package Selection & Payment */}
      {step === 4 && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 animate-fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-500" />
            <span>هەنگاوی ٤: هەڵبژاردنی پاکێجی ڕیکلام و پارەدان</span>
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
                      ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20'
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
                    <p className="text-xl font-black text-amber-600 font-latin">
                      {pkg.price.toLocaleString()} د.ع
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">بۆ ماوەی {pkg.days} ڕۆژی تەواو</p>
                  </div>

                  <ul className="text-[11px] text-slate-600 space-y-1.5 mt-4 pt-3 border-t border-slate-100">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>پیشاندان لە بەشی ئۆتۆمبێلی شاخ</span>
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
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-600/20'
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
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>هەنگاوی پێشوو</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-amber-500/30 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'لە پرۆسەی تۆمارکردندایە...' : `تەواوکردنی پارەدان (${packagePrices[packageType].price.toLocaleString()} د.ع) و بڵاوکردنەوە`}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
