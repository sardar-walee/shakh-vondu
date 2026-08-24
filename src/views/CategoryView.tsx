import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  Star,
  Store,
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { ProductCategory, Product } from '../types';
import { ProductCard } from '../components/cards/ProductCard';
import { SellerCard } from '../components/cards/SellerCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CITIES } from '../data/seedData';

interface CategoryViewProps {
  category: ProductCategory;
  onNavigate: (view: string, param?: string) => void;
  selectedCity: string;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  onNavigate,
  selectedCity
}) => {
  const { products, sellers } = useMarketplace();
  const { isSuperAdmin, sellerProfile, canManageCategory } = useAuth();
  const { t, dir } = useLanguage();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<'default' | 'low_high' | 'high_low' | 'rating'>('default');
  const [activeTab, setActiveTab] = useState<'products' | 'sellers'>('products');

  // Category metadata & Subcategories
  const categoryConfig: Record<
    ProductCategory,
    { title: string; desc: string; bannerGradient: string; subcategories: string[] }
  > = {
    food: {
      title: 'چێشتخانە و خواردنەکان',
      desc: 'کەباب، خواردنی کوردی، فاست فوود، خواردنەوە و شیرینی بە گەرمی دەگاتە دەستت',
      bannerGradient: 'from-orange-600 to-amber-600',
      subcategories: ['کەباب و برژاوەکان', 'خواردنی کوردی', 'خواردنی خێرا', 'پیتزا و بەرگەر', 'شیرینی و شەربەت']
    },
    market: {
      title: 'مارکێت و سوپەرمارکێت',
      desc: 'هەموو پێداویستییەکی ڕۆژانەی ماڵ، بەرهەمە پاکوخاوێنەکان بە کەمترین نرخ',
      bannerGradient: 'from-blue-600 to-indigo-700',
      subcategories: ['ڕۆن و پێداویستی چێشتلێنان', 'قاوە و چا', 'پاقلەمەنی', 'شیرینی و پسکیت', 'پاککەرەوەکان']
    },
    clothes: {
      title: 'جلوبەرگ و مۆدە',
      desc: 'جلوبەرگی پیاوان، ئافرەتان و منداڵان بە دیزاینی هاوچەرخ و کوالیتی بەرز',
      bannerGradient: 'from-purple-600 to-pink-600',
      subcategories: ['چاکەت و قەمسەڵە', 'کۆت و جلوبەرگی ئافرەتان', 'کراس و پانتۆڵ', 'پێڵاو', 'ئێکسسوارات']
    },
    fruits_vegetables: {
      title: 'سەوزە و میوەی فرێش',
      desc: 'میوە و سەوزەی تازەی باخ و کێڵگەکانی کوردستان بە ڕێکوپێکی و پاکی',
      bannerGradient: 'from-emerald-600 to-teal-700',
      subcategories: ['میوەی تازە', 'سەوزەی تازە', 'سەوزەی کوڵاو', 'میوەی وشکراوە']
    },
    fresh_meat: {
      title: 'گۆشتی تازە و مریشک',
      desc: 'گۆشتی بەرخی خۆماڵی، گۆلی، مریشکی ڕۆژانە بە پشکنینی تەندروستی',
      bannerGradient: 'from-rose-600 to-red-700',
      subcategories: ['گۆشتی سوور', 'مریشک و باڵندە', 'ماسی', 'گۆشتی هاڕاو']
    },
    dairy: {
      title: 'شیرەمەنی و ماست',
      desc: 'ماستی مەڕ و بزن، پەنیر، قەیماغ و کەرەی کوردی سروشتی',
      bannerGradient: 'from-cyan-600 to-blue-700',
      subcategories: ['ماست و کەرە', 'پەنیر و قەیماغ', 'شیر و دۆ', 'بەرهەمی کێڵگە']
    },
    electronics: {
      title: 'ئەلیکترۆنیات و مۆبایل',
      desc: 'نوێترین مۆبایلەکان، لاپتۆپ، تەلەفزیۆن و کەلوپەلی زیرەک بە گەرەنتی',
      bannerGradient: 'from-indigo-600 to-blue-800',
      subcategories: ['مۆبایل و زیرەک', 'سەماعە و دەنگ', 'لاپتۆپ و تابلێت', 'ئێکسسوارات']
    },
    beauty: {
      title: 'جوانی و مکیاژ',
      desc: 'بۆن و مکیاژی ئۆرجینال، چاودێری پێست و قژ لە مارکە جیهانییەکان',
      bannerGradient: 'from-pink-600 to-rose-600',
      subcategories: ['عەتر و بۆن', 'چاودێری پێست', 'مکیاژ', 'چاودێری قژ']
    },
    cars: {
      title: 'ئۆتۆمبێل و گواستنەوە',
      desc: 'کڕین و فرۆشتنی ئۆتۆمبێلی خاوێن لە هەموو شارەکان بە نرخی گونجاو',
      bannerGradient: 'from-amber-600 to-orange-700',
      subcategories: ['تۆیۆتا', 'مێرسیدس', 'هیۆندای', 'کیا', 'بی ئێم دەبلیو']
    }
  };

  const config = categoryConfig[category] || categoryConfig.food;

  // Filter products by category, subcategory, search, and city
  let filteredProducts = products.filter(p => p.category === category && p.isAvailable !== false && p.productStatus !== 'hidden' && p.productStatus !== 'draft');

  if (selectedSubcategory !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.subcategory === selectedSubcategory);
  }

  if (searchFilter.trim() !== '') {
    filteredProducts = filteredProducts.filter(p =>
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.description.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }

  if (selectedCity && selectedCity !== 'all') {
    const cityPrefix = selectedCity.split(' ')[0].toLowerCase();
    filteredProducts = filteredProducts.filter(p => {
      if ((p as any).city && (p as any).city.toLowerCase().includes(cityPrefix)) return true;
      if ((p as any).sellerCity && (p as any).sellerCity.toLowerCase().includes(cityPrefix)) return true;
      const seller = sellers.find(s => s.id === p.sellerId || s.userId === p.sellerId || `store-${s.userId}` === p.sellerId || s.id === `store-${p.sellerId}`);
      if (seller && seller.city && seller.city.toLowerCase().includes(cityPrefix)) return true;
      if (!seller) return true;
      return false;
    });
  }

  // Sort
  if (priceSort === 'low_high') {
    filteredProducts.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (priceSort === 'high_low') {
    filteredProducts.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (priceSort === 'rating') {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // Filter sellers by category
  let categorySellers = sellers.filter(s => s.category === category);
  if (selectedCity && selectedCity !== 'all') {
    const cityPrefix = selectedCity.split(' ')[0].toLowerCase();
    categorySellers = categorySellers.filter(s => s.city && s.city.toLowerCase().includes(cityPrefix));
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Category Banner */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${config.bannerGradient} text-white p-8 sm:p-10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="max-w-2xl space-y-2 text-right">
          <div className="flex items-center gap-2 text-xs font-bold bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full">
            <span>شاخی</span>
            <span>•</span>
            <span>{t(`cat.${category}`)}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black">{config.title}</h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
            {config.desc}
          </p>
        </div>

        {/* Super Admin & Seller Post Action Button */}
        {(isSuperAdmin || canManageCategory(category)) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate(category === 'cars' ? 'post-car-ad' : 'post-product', category)}
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-white/90 text-xs sm:text-sm font-black shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-orange-600" />
              <span>+ بڵاوکردنەوە لەم بەشەدا</span>
              {isSuperAdmin && (
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                  Super Admin
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tabs Switcher: Products vs Stores */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('کاڵاکان')} ({filteredProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('sellers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sellers'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('فرۆشگا و شوێنەکان')} ({categorySellers.length})
          </button>
        </div>

        {/* Sort selector */}
        {activeTab === 'products' && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="hidden sm:inline font-semibold">{t('ڕیزبەندی بەپێی')}:</span>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as any)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
            >
              <option value="default">{t('نوێترین')}</option>
              <option value="low_high">{t('کەمترین نرخ')}</option>
              <option value="high_low">{t('بەرزترین نرخ')}</option>
              <option value="rating">{t('بەرزترین هەڵسەنگاندن')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Subcategory Pills & In-category Search */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Subcategory scroll list */}
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedSubcategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubcategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('هەموو پۆلەکان')}
              </button>
              {config.subcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSubcategory === sub
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t(sub)}
                </button>
              ))}
            </div>

            {/* Quick in-category search */}
            <div className="relative w-full sm:w-64 flex-shrink-0">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={t('گەڕان لەم بەشەدا...')}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-1.5 pr-8 pl-3 text-xs focus:bg-white focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      {activeTab === 'products' ? (
        filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-700">{t('هیچ کاڵایەک نەدۆزرایەوە')}</h3>
            <p className="text-xs text-slate-400 mt-1">{t('تکایە فلتەرەکان پاکبکەرەوە یان پۆلێکی تر هەڵبژێرە.')}</p>
            <button
              onClick={() => { setSelectedSubcategory('all'); setSearchFilter(''); }}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold"
            >
              {t('سڕینەوەی فلتەرەکان')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onNavigate('product-detail', product.id)}
                onSellerClick={(sId) => onNavigate('seller-store', sId)}
              />
            ))}
          </div>
        )
      ) : (
        categorySellers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-700">هیچ فرۆشگایەک نەدۆزرایەوە</h3>
            <p className="text-xs text-slate-400 mt-1">لە شارەکەتدا هێشتا فرۆشگا لەم بەشەدا تۆمار نەکراوە.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorySellers.map(seller => (
              <SellerCard
                key={seller.id}
                seller={seller}
                onClick={() => onNavigate('seller-store', seller.id)}
              />
            ))}
          </div>
        )
      )}

    </div>
  );
};
