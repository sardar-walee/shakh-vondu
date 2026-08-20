import React, { useState } from 'react';
import { BusinessType, Product, Sale } from '../../types';
import { 
  Pill, 
  Shirt, 
  ShoppingBag, 
  Smartphone, 
  Wrench, 
  Utensils, 
  Sparkles, 
  Store as StoreIcon,
  AlertCircle,
  Calendar,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Layers,
  Filter,
  Eye,
  EyeOff,
  Settings2,
  ArrowUpRight,
  Package,
  Activity,
  Award,
  Thermometer,
  ShieldAlert,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DynamicBusinessWidgetsProps {
  businessType: BusinessType;
  products?: Product[];
  sales?: Sale[];
  currency?: string;
  onBusinessTypeChange?: (type: BusinessType) => void;
}

export const DynamicBusinessWidgets: React.FC<DynamicBusinessWidgetsProps> = ({
  businessType: initialType,
  products = [],
  sales = [],
  currency = '$',
  onBusinessTypeChange
}) => {
  const [selectedType, setSelectedType] = useState<BusinessType>(initialType || 'mobile_electronics');
  const [showSettings, setShowSettings] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>({
    widget1: true,
    widget2: true,
    widget3: true,
  });

  const handleTypeSelect = (type: BusinessType) => {
    setSelectedType(type);
    if (onBusinessTypeChange) {
      onBusinessTypeChange(type);
    }
  };

  const toggleWidget = (id: string) => {
    setVisibleWidgets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      {/* Header Selector & Customizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
            {selectedType === 'pharmacy_medical' && <Pill className="w-6 h-6" />}
            {selectedType === 'clothing_fashion' && <Shirt className="w-6 h-6" />}
            {selectedType === 'supermarket_grocery' && <ShoppingBag className="w-6 h-6" />}
            {selectedType === 'mobile_electronics' && <Smartphone className="w-6 h-6" />}
            {selectedType === 'auto_parts' && <Wrench className="w-6 h-6" />}
            {selectedType === 'restaurant_cafe' && <Utensils className="w-6 h-6" />}
            {selectedType === 'cosmetics_perfumes' && <Sparkles className="w-6 h-6" />}
            {selectedType === 'general_retail' && <StoreIcon className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                داشبۆردی گوونجاو (Dynamic Grid)
              </span>
            </div>
            <h2 className="text-base font-black text-white mt-1">
              {selectedType === 'pharmacy_medical' && 'دەرمانخانە و پێداویستی پزیشکی (Pharmacy Dashboard)'}
              {selectedType === 'clothing_fashion' && 'جلوبەرگ و مۆدە (Clothing & Apparel Dashboard)'}
              {selectedType === 'supermarket_grocery' && 'مارکێت و خواردەمەنی (Supermarket Dashboard)'}
              {selectedType === 'mobile_electronics' && 'مۆبایل و ئەلیکترۆنیات (Mobile Shop Dashboard)'}
              {selectedType === 'auto_parts' && 'کەلوپەلی ئۆتۆمبێل (Auto Parts Dashboard)'}
              {selectedType === 'restaurant_cafe' && 'چێشتخانە و کافێ (Restaurant Dashboard)'}
              {selectedType === 'cosmetics_perfumes' && 'کۆزمەتیک و بۆن (Cosmetics Dashboard)'}
              {selectedType === 'general_retail' && 'دوکانی گشتی (General Retail Dashboard)'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ویدجێت و ئامارەکان خۆکارانە بەپێی جۆری دوکانەکەت دەگۆڕێن
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Business Type Quick Switcher */}
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => handleTypeSelect('pharmacy_medical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedType === 'pharmacy_medical' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              دەرمانخانە
            </button>

            <button
              onClick={() => handleTypeSelect('clothing_fashion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedType === 'clothing_fashion' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              جلوبەرگ
            </button>

            <button
              onClick={() => handleTypeSelect('supermarket_grocery')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedType === 'supermarket_grocery' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              مارکێت
            </button>

            <button
              onClick={() => handleTypeSelect('mobile_electronics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedType === 'mobile_electronics' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              مۆبایل
            </button>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            title="دەستکاری کردنی گرید (Customize Grid)"
          >
            <Settings2 className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">گرید</span>
          </button>
        </div>
      </div>

      {/* Settings Bar */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              <span className="font-bold">دیاری کردنی ویدجێتە دیارەکان (Widget Visibility):</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleWidget('widget1')}
                className={`px-3 py-1 rounded-lg font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  visibleWidgets.widget1 ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {visibleWidgets.widget1 ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                ویدجێتی ۱ (سەرەکی)
              </button>

              <button
                onClick={() => toggleWidget('widget2')}
                className={`px-3 py-1 rounded-lg font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  visibleWidgets.widget2 ? 'bg-purple-600/20 text-purple-300 border-purple-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {visibleWidgets.widget2 ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                ویدجێتی ۲ (ئامار)
              </button>

              <button
                onClick={() => toggleWidget('widget3')}
                className={`px-3 py-1 rounded-lg font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  visibleWidgets.widget3 ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {visibleWidgets.widget3 ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                ویدجێتی ۳ (ئاگاداری)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Render Based on Selected Business Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {selectedType === 'pharmacy_medical' && (
          <PharmacyWidgets visible={visibleWidgets} currency={currency} />
        )}

        {selectedType === 'clothing_fashion' && (
          <ClothingWidgets visible={visibleWidgets} currency={currency} />
        )}

        {selectedType === 'supermarket_grocery' && (
          <SupermarketWidgets visible={visibleWidgets} currency={currency} />
        )}

        {selectedType === 'mobile_electronics' && (
          <MobileWidgets visible={visibleWidgets} currency={currency} />
        )}

        {['auto_parts', 'restaurant_cafe', 'cosmetics_perfumes', 'general_retail'].includes(selectedType) && (
          <GeneralBusinessWidgets type={selectedType} visible={visibleWidgets} currency={currency} />
        )}
      </div>
    </div>
  );
};

/* ---------------- PHARMACY WIDGETS ---------------- */
function PharmacyWidgets({ visible, currency }: { visible: Record<string, boolean>; currency: string }) {
  const expiringDrugs = [
    { name: 'Amoxicillin 500mg Capsules', batch: 'BAT-2024-902', daysLeft: 18, stock: 45, status: 'urgent' },
    { name: 'Paracetamol Syrup 120mg/5ml', batch: 'BAT-2024-118', daysLeft: 34, stock: 22, status: 'warning' },
    { name: 'Omeprazole 20mg Gastro-Resistant', batch: 'BAT-2024-441', daysLeft: 52, stock: 80, status: 'warning' },
    { name: 'Augmentin 1g Tablets (14s)', batch: 'BAT-2024-009', daysLeft: 64, stock: 12, status: 'normal' },
  ];

  return (
    <>
      {visible.widget1 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">دەرمانی نزیک لە بەسەرچوون</h3>
                  <p className="text-[10px] text-gray-400">Expiring Drugs Alert (&lt; 60 Days)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[10px] font-black rounded-full border border-rose-100">
                ٤ بەرهەم
              </span>
            </div>

            <div className="space-y-2.5">
              {expiringDrugs.map((drug, i) => (
                <div key={i} className="p-2.5 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-gray-800 text-[11px]">{drug.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">پاتش: {drug.batch} | کۆگا: {drug.stock}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black font-mono ${
                    drug.status === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {drug.daysLeft} ڕۆژ ماوە
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer">
            داشکاندنی بەپەلە بۆ بەسەرچووەکان
          </button>
        </div>
      )}

      {visible.widget2 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-blue-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">ڕێژەی دەرماننامە (Rx Ratio)</h3>
                  <p className="text-[10px] text-gray-400">Prescription vs OTC Supplement Sales</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 my-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>دەرمانی پزیشکی (Prescription Rx)</span>
                  <span className="text-blue-600">68%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>ڤیتامین و کۆزمەتیک (OTC & Supplements)</span>
                  <span className="text-purple-600">32%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-purple-600 h-3 rounded-full" style={{ width: '32%' }}></div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-[11px] text-blue-900 font-medium">
                💡 زۆرترین فرۆشی ئەم هەفتەیە: **ئەنتیبایۆتیک و دەرمانی پەستانی خوێن**.
              </div>
            </div>
          </div>

          <div className="text-[10px] font-bold text-gray-400 text-center">
            نوێکردنەوەی خۆکارانەی کۆگا بەپێی بارکۆد
          </div>
        </div>
      )}

      {visible.widget3 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">پلەی گەرمی ساردکەرەوە (Cold Chain)</h3>
                  <p className="text-[10px] text-gray-400">Insulin & Biological Storage (2-8°C)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                ئاسایی (4.2°C)
              </span>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">ئەنسولین (Lantus / Novorapid)</span>
                <span className="font-mono font-bold text-emerald-400">32 دانە</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">ڤاکسین و دەرزی تایبەت</span>
                <span className="font-mono font-bold text-emerald-400">18 دانە</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                <span>سنسۆری زیرەک: بەستراوە</span>
                <span className="text-blue-400 font-bold">حاڵەت: پارێزراو</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer">
            بینینی لیستی دەرماننامەکان
          </button>
        </div>
      )}
    </>
  );
}

/* ---------------- CLOTHING WIDGETS ---------------- */
function ClothingWidgets({ visible, currency }: { visible: Record<string, boolean>; currency: string }) {
  const topSizes = [
    { size: 'Medium (M)', percentage: 38, count: 142, color: 'bg-purple-600' },
    { size: 'Large (L)', percentage: 29, count: 108, color: 'bg-indigo-600' },
    { size: 'X-Large (XL)', percentage: 18, count: 68, color: 'bg-blue-600' },
    { size: 'Small (S)', percentage: 15, count: 56, color: 'bg-amber-600' },
  ];

  return (
    <>
      {visible.widget1 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-purple-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">قەبارە پرفرۆشەکان (Top Sizes)</h3>
                  <p className="text-[10px] text-gray-400">Size Breakdown & Demand Rate</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {topSizes.map((s, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-800">
                    <span>{s.size}</span>
                    <span className="text-gray-500 font-mono">{s.count} دانە ({s.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${s.color}`} style={{ width: `${s.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-purple-50/60 border border-purple-100 rounded-xl text-[10px] font-bold text-purple-900 text-center">
            🔥 پێشنیار: **M و L** زۆرترین داواکارییان لەسەرە، بڕی کۆگا زیاد بکە.
          </div>
        </div>
      )}

      {visible.widget2 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">داواکاری ڕەنگەکان (Color Trend)</h3>
                  <p className="text-[10px] text-gray-400">Bestselling Color Distribution</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 my-2">
              <div className="p-3 bg-gray-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block">ڕەش (Black)</span>
                  <span className="text-[10px] text-gray-400">42% فرۆش</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-black border border-white/40"></div>
              </div>

              <div className="p-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block">سپی (White)</span>
                  <span className="text-[10px] text-gray-500">28% فرۆش</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-white border border-gray-400"></div>
              </div>

              <div className="p-3 bg-blue-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block">شینی تۆخ (Navy)</span>
                  <span className="text-[10px] text-blue-200">18% فرۆش</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-blue-950 border border-blue-400"></div>
              </div>

              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block">بێجی (Beige)</span>
                  <span className="text-[10px] text-amber-700">12% فرۆش</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-amber-300 border border-amber-500"></div>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer">
            فلتەرکردنی مەخزەن بەپێی قەبارە و ڕەنگ
          </button>
        </div>
      )}

      {visible.widget3 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-pink-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-pink-50 text-pink-600 rounded-2xl border border-pink-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">کولێکۆنی وەرزی (Seasonal Velocity)</h3>
                  <p className="text-[10px] text-gray-400">Summer 2026 Collection Sell-Through</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-tr from-purple-900 to-indigo-950 text-white rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span>تەواوبوونی کۆگا (Sell-Through):</span>
                <span className="font-black text-emerald-400">74%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '74%' }}></div>
              </div>
              <p className="text-[10px] text-purple-200">
                کولێکۆنی هاوینە لە قۆناغی کۆتاییدایە. پێشنیار دەکرێت حاسڵکردنی داشکاندن چالاک بکرێت.
              </p>
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer">
            چاپکردنی لێبڵی نرخ و QR
          </button>
        </div>
      )}
    </>
  );
}

/* ---------------- SUPERMARKET WIDGETS ---------------- */
function SupermarketWidgets({ visible, currency }: { visible: Record<string, boolean>; currency: string }) {
  const localBrands = [
    { name: 'ئەسپی ڕەش (Black Horse)', sales: '1,420,000 IQD', share: '34%' },
    { name: 'زێڕ (Zerr)', sales: '980,000 IQD', share: '24%' },
    { name: 'شەباب (Shabab)', sales: '820,000 IQD', share: '20%' },
    { name: 'مەحموود (Mahmood)', sales: '650,000 IQD', share: '16%' },
  ];

  return (
    <>
      {visible.widget1 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-amber-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">بڕاندە سەرەکییەکان (Top Market Brands)</h3>
                  <p className="text-[10px] text-gray-400">Local Grocery Brands Performance</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {localBrands.map((b, i) => (
                <div key={i} className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-800 text-[11px] block">{b.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{b.sales}</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-black text-[10px] rounded-lg">
                    {b.share}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer">
            بینینی هەموو بەرھەمەکانی ئەسپی ڕەش و زێڕ
          </button>
        </div>
      )}

      {visible.widget2 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-rose-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">خواردەمەنی بەسەرچوو (Perishables)</h3>
                  <p className="text-[10px] text-gray-400">Dairy & Fresh Grocery Expiry Warnings</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-black text-[10px] rounded-full">
                ۳ بڕگە
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-800">ماست و شیرەمەنی Kalleh</p>
                  <p className="text-[10px] text-gray-400">بەسەرچوون: لە ۳ ڕۆژی تردا</p>
                </div>
                <span className="font-mono font-bold text-rose-600 text-xs">14 د.ع</span>
              </div>

              <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-800">سەمون و نانی توست</p>
                  <p className="text-[10px] text-gray-400">بەسەرچوون: لە ۲ ڕۆژی تردا</p>
                </div>
                <span className="font-mono font-bold text-amber-600 text-xs">28 د.ع</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer">
            حاسڵکردنی داشکاندنی بەپەلە (Off 50%)
          </button>
        </div>
      )}

      {visible.widget3 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">فرۆشتنی بە کێش (Bulk Weight)</h3>
                  <p className="text-[10px] text-gray-400">Kilograms / Liters Sold Today</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-950 text-white rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-200">برنجی فەل (ئەسپی ڕەش):</span>
                <span className="font-bold text-emerald-400 font-mono">180 Kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-200">شەکر و ئارد:</span>
                <span className="font-bold text-emerald-400 font-mono">95 Kg</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-emerald-900">
                <span className="text-white font-bold">کۆی کێش:</span>
                <span className="font-black text-white font-mono">275 Kg</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer">
            چاپکردنی بارکۆدی تەرازوو
          </button>
        </div>
      )}
    </>
  );
}

/* ---------------- MOBILE WIDGETS ---------------- */
function MobileWidgets({ visible, currency }: { visible: Record<string, boolean>; currency: string }) {
  return (
    <>
      {visible.widget1 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-blue-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">گەرەنتی و ئایمای (IMEI & Warranty)</h3>
                  <p className="text-[10px] text-gray-400">Active Phone Warranty Tracker</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-black text-[10px] rounded-full">
                182 ئامێر
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">iPhone 15 Pro Max 256GB</p>
                  <p className="text-[10px] font-mono text-gray-400">IMEI: 358912093810291</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  11 مانگ گەرەنتی
                </span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">Samsung Galaxy S24 Ultra</p>
                  <p className="text-[10px] font-mono text-gray-400">IMEI: 351982093810994</p>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                  15 ڕۆژ ماوە
                </span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer">
            گەڕان بەپێی ژمارەی ئایمای (IMEI Search)
          </button>
        </div>
      )}

      {visible.widget2 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-purple-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">بەشی مارکێتی مۆبایل (Brand Share)</h3>
                  <p className="text-[10px] text-gray-400">Apple vs Samsung vs Xiaomi</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 my-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-800 mb-1">
                  <span>Apple (iPhone)</span>
                  <span className="text-gray-600">52%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-slate-900 h-2.5 rounded-full" style={{ width: '52%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-800 mb-1">
                  <span>Samsung</span>
                  <span className="text-gray-600">31%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '31%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-800 mb-1">
                  <span>Xiaomi / Honor / Other</span>
                  <span className="text-gray-600">17%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '17%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition cursor-pointer">
            بینینی زیادکراوەکانی لاوەکی (Accessories)
          </button>
        </div>
      )}

      {visible.widget3 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">قازانجی کێبڵ و بارگاویکەر</h3>
                  <p className="text-[10px] text-gray-400">High Margin Accessories Attachment</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-900 text-white rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-200">ڕێژەی لکاندن لەگەڵ مۆبایل:</span>
                <span className="font-bold text-emerald-300">84%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-200">ناوەندی قازانج:</span>
                <span className="font-bold text-emerald-300">55% Profit Margin</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer">
            دابینکردنی بارگاویکەرەکان
          </button>
        </div>
      )}
    </>
  );
}

/* ---------------- GENERAL / AUTO PARTS WIDGETS ---------------- */
function GeneralBusinessWidgets({ type, visible, currency }: { type: BusinessType; visible: Record<string, boolean>; currency: string }) {
  return (
    <>
      {visible.widget1 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-sm">گونجان لەگەڵ ئۆتۆمبێلەکان</h3>
                <p className="text-[10px] text-gray-400">Vehicle Compatibility Matrix</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-gray-50 rounded-xl flex justify-between font-bold">
                <span>Toyota Camry / Corolla</span>
                <span className="text-blue-600">42%</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl flex justify-between font-bold">
                <span>Hyundai Elantra / Tucson</span>
                <span className="text-indigo-600">34%</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl flex justify-between font-bold">
                <span>Kia Optima / Sportage</span>
                <span className="text-purple-600">24%</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer">
            گەڕان بەپێی کۆدی کەلوپەل (Part #)
          </button>
        </div>
      )}

      {visible.widget2 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-sm">پارچە خێرا فرۆشراوەکان</h3>
                <p className="text-[10px] text-gray-400">Filters, Oils & Brake Pads</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              فلتەری ڕۆن و پادەکانی ئیستۆپ زۆرترین گۆڕانکارییان بەسەردا هاتوو لەم مانگەدا.
            </p>
          </div>
          <button className="w-full mt-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer">
            داواکردنی پارچەی نوێ
          </button>
        </div>
      )}

      {visible.widget3 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-sm">بەراوردی قازانجی بەرهەمەکان</h3>
                <p className="text-[10px] text-gray-400">Profit Margin Leaderboard</p>
              </div>
            </div>
            <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-3 rounded-2xl">
              تێکڕای قازانجی نەقد: +28.4% لە بەراورد بە مانگی پێشوو.
            </p>
          </div>
          <button className="w-full mt-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer">
            بینینی ڕاپۆرتی بڕاندەکان
          </button>
        </div>
      )}
    </>
  );
}
