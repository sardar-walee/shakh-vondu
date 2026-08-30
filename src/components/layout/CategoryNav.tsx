import React, { useRef } from 'react';
import {
  Utensils,
  ShoppingBag,
  Shirt,
  Apple,
  Beef,
  Milk,
  Smartphone,
  Sparkles,
  Car,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ProductCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface CategoryNavProps {
  activeCategory: ProductCategory | 'all';
  onSelectCategory: (category: ProductCategory | 'all') => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t, dir } = useLanguage();

  const categories: { id: ProductCategory | 'all'; name: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'all', name: t('هەموو بەشەکان'), icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'food', name: t('category.food'), icon: <Utensils className="w-3.5 h-3.5" />, badge: t('خێرا') },
    { id: 'market', name: t('category.market'), icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'fruits_vegetables', name: t('category.fruits_vegetables'), icon: <Apple className="w-3.5 h-3.5" />, badge: t('فرێش') },
    { id: 'dairy', name: t('category.dairy'), icon: <Milk className="w-3.5 h-3.5" /> },
    { id: 'electronics', name: t('category.electronics'), icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'cars', name: t('category.cars'), icon: <Car className="w-3.5 h-3.5" />, badge: t('VIP') }
  ];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="w-full bg-white dark:bg-[#0f172a]/95 border-b border-slate-200/80 dark:border-slate-800 sticky top-[72px] z-30 shadow-xs backdrop-blur-md transition-colors duration-300" dir={dir}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 relative flex items-center">
        
        {/* Right Scroll Arrow */}
        <button
          onClick={() => handleScroll(dir === 'rtl' ? 'right' : 'left')}
          className="hidden sm:flex z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all -mr-2 cursor-pointer"
          aria-label="Scroll start"
        >
          {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Scrollable Container with Smooth Touch */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-2 sm:gap-3 overflow-x-auto py-2.5 px-1 scrollbar-none no-scrollbar scroll-smooth snap-x"
        >
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer snap-start flex-shrink-0 ${
                  isActive
                    ? 'bg-[#FF5500] text-white shadow-md shadow-orange-500/35 scale-[1.02]'
                    : 'bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 border border-slate-200/60 dark:border-slate-700'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
                  {cat.icon}
                </span>
                <span>{cat.name}</span>
                {cat.badge && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white text-[#FF5500]'
                        : 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Left Scroll Arrow */}
        <button
          onClick={() => handleScroll(dir === 'rtl' ? 'left' : 'right')}
          className="hidden sm:flex z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all -ml-2 cursor-pointer"
          aria-label="Scroll end"
        >
          {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

      </div>
    </nav>
  );
};
