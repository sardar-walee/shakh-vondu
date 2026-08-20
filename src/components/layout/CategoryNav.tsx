import React from 'react';
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
  Layers
} from 'lucide-react';
import { ProductCategory } from '../../types';

interface CategoryNavProps {
  activeCategory: ProductCategory | 'all';
  onSelectCategory: (category: ProductCategory | 'all') => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  const categories: { id: ProductCategory | 'all'; name: string; icon: React.ReactNode }[] = [
    { id: 'all', name: 'سەرەکی', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'food', name: 'خواردەمەنی', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'market', name: 'مارکێت', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'clothes', name: 'جلوبەرگ', icon: <Shirt className="w-3.5 h-3.5" /> },
    { id: 'fruits_vegetables', name: 'سەوزە و میوە', icon: <Apple className="w-3.5 h-3.5" /> },
    { id: 'fresh_meat', name: 'گۆشتی تازە', icon: <Beef className="w-3.5 h-3.5" /> },
    { id: 'dairy', name: 'شیرەمەنی', icon: <Milk className="w-3.5 h-3.5" /> },
    { id: 'electronics', name: 'ئەلیکترۆنیات', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'beauty', name: 'جوانی', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'cars', name: 'ئۆتۆمبێل', icon: <Car className="w-3.5 h-3.5" /> }
  ];

  return (
    <nav className="w-full bg-white border-b border-slate-100 sticky top-[72px] z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-6 sm:gap-8 justify-start md:justify-center overflow-x-auto py-2.5 scrollbar-none no-scrollbar">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 py-1 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[#F97316] font-bold border-b-2 border-[#F97316]'
                    : 'text-slate-600 hover:text-[#2563EB]'
                }`}
              >
                <span className={isActive ? 'text-[#F97316]' : 'text-slate-400'}>
                  {cat.icon}
                </span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

