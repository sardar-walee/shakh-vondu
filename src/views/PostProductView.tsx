import React, { useState } from 'react';
import {
  PackagePlus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Store,
  Utensils,
  Smartphone,
  Shirt,
  ShoppingBag,
  Apple,
  Beef,
  Milk,
  Car,
  CheckCircle2,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductCategory, Product } from '../types';
import { DynamicProductForm } from '../components/products/DynamicProductForm';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface PostProductViewProps {
  onNavigate: (view: string, param?: string) => void;
  initialCategory?: ProductCategory;
}

export const PostProductView: React.FC<PostProductViewProps> = ({
  onNavigate,
  initialCategory
}) => {
  const { addProduct } = useMarketplace();
  const { currentUser, isSuperAdmin, sellerProfile } = useAuth();
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(
    initialCategory || sellerProfile?.category || currentUser?.category || 'food'
  );
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  const handleSave = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const result = await addProduct(productData);
    if (result && result.success) {
      setIsSavedSuccess(true);
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      alert(result?.error || 'هەڵەیەک ڕوویدا لە کاتی پاشەکەوتکردنی کاڵاکە.');
    }
  };

  const categories = [
    { id: 'food' as ProductCategory, label: 'چێشتخانە و خواردن (Food)', icon: Utensils, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { id: 'electronics' as ProductCategory, label: 'ئەلیکترۆنیات و مۆبایل (Electronics)', icon: Smartphone, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: 'market' as ProductCategory, label: 'مارکێت و سوپەرمارکێت (Supermarket)', icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: 'fruits_vegetables' as ProductCategory, label: 'سەوزە و میوەی فرێش (Fruits & Veg)', icon: Apple, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'dairy' as ProductCategory, label: 'شیرەمەنی و ماست (Dairy)', icon: Milk, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { id: 'cars' as ProductCategory, label: 'ئۆتۆمبێل و گواستنەوە (Cars & Auto)', icon: Car, color: 'text-amber-600 bg-amber-50 border-amber-200' }
  ];

  if (isSavedSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6" dir="rtl">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">کاڵاکە بە سەرکەوتوویی بڵاوکرایەوە! 🎉</h2>
          <p className="text-sm text-slate-600">
            کاڵاکەت ئێستا لە بەشی پەیوەندیدار بەردەستە و هەموو کڕیاران دەتوانن بیبینن و داوای بکەن.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate('category', selectedCategory)}
            className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs sm:text-sm cursor-pointer shadow-md transition-all active:scale-95"
          >
            بینینی بەشی {selectedCategory}
          </button>

          <button
            onClick={() => {
              setIsSavedSuccess(false);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs sm:text-sm cursor-pointer transition-all"
          >
            + بڵاوکردنەوەی کاڵایەکی تر
          </button>

          <button
            onClick={() => onNavigate(isSuperAdmin ? 'admin-dashboard' : 'home')}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl text-xs sm:text-sm cursor-pointer transition-all"
          >
            گەڕانەوە
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-right" dir="rtl">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <PackagePlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>بڵاوکردنەوەی کاڵا لە گشت بەشەکان</span>
              {isSuperAdmin && (
                <span className="text-[10px] font-black bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                  Super Admin
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              تۆمارکردنی خواردنی چێشتخانە، ئەلیکترۆنیات، جلوبەرگ، مارکێت و گشت پۆلەکان بە وردەکاری تەواو
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate(isSuperAdmin ? 'admin-dashboard' : 'home')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>گەڕانەوە</span>
        </button>
      </div>

      {/* Super Admin Universal Category Quick Selector */}
      {isSuperAdmin && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>هەڵبژاردنی خێرای بەش بۆ بڵاوکردنەوە (Super Admin Category Bar):</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              هەموو بەشەکان کراوەن
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isCurrent = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-2.5 rounded-2xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                    isCurrent
                      ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-500/20 font-black shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] truncate">{cat.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Embedded Dynamic Product Form */}
      <DynamicProductForm
        allowedCategory={isSuperAdmin ? undefined : selectedCategory}
        isSuperAdmin={isSuperAdmin}
        sellerName={isSuperAdmin ? 'بەڕێوەبەرایەتی شاخ' : (sellerProfile?.storeName || currentUser?.fullName || 'فرۆشگا')}
        sellerId={isSuperAdmin ? 'admin-store' : (sellerProfile?.id || `store-${currentUser?.id || 'guest'}`)}
        onSave={handleSave}
        onCancel={() => onNavigate(isSuperAdmin ? 'admin-dashboard' : 'home')}
      />

    </div>
  );
};
