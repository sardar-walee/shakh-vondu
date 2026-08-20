import React, { useState } from 'react';
import { 
  Trophy, 
  Hourglass, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  Percent, 
  ArrowUpRight, 
  CheckCircle2, 
  Package,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { Product, Sale } from '../../types';
import { calculateTopSellingProducts, calculateSlowMovingProducts } from '../../lib/inventoryService';

interface ProductVelocityCardsProps {
  products: Product[];
  sales: Sale[];
  currency?: string;
  onApplyDiscount?: (productId: string, discountPercent: number) => void;
}

export const ProductVelocityCards: React.FC<ProductVelocityCardsProps> = ({
  products,
  sales,
  currency = '$',
  onApplyDiscount
}) => {
  const topSelling = calculateTopSellingProducts(sales, products, 5);
  const slowMoving = calculateSlowMovingProducts(sales, products, 30).slice(0, 5);

  const [appliedDiscountIds, setAppliedDiscountIds] = useState<Set<string>>(new Set());

  const handleDiscountClick = (productId: string, discountPercent: number) => {
    setAppliedDiscountIds(prev => new Set(prev).add(productId));
    if (onApplyDiscount) {
      onApplyDiscount(productId, discountPercent);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Top Selling Products Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-500 rounded-xl text-slate-950 font-bold shadow-lg shadow-amber-500/20">
                <Trophy className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">پڕفرۆشترین بەرهەمەکان (Top Selling Items)</h3>
                <p className="text-xs text-slate-400">کاڵاکان بەپێی بڕی فرۆش و داھاتی بەدەستهاتوو</p>
              </div>
            </div>

            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              خێراترین جووڵە
            </span>
          </div>

          {/* List */}
          <div className="space-y-3">
            {topSelling.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                هیچ مامەڵەیەکی فرۆشتن تۆمار نەکراوە بۆ دیاریکردنی پڕفرۆشترینەکان.
              </div>
            ) : (
              topSelling.map((item, index) => (
                <div
                  key={item.productId}
                  className="bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center ${
                      index === 0 
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                        : index === 1
                        ? 'bg-slate-300 text-slate-900'
                        : index === 2
                        ? 'bg-amber-700 text-amber-100'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      #{index + 1}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{item.productName}</h4>
                      <p className="text-[11px] text-slate-400">
                        {item.category} • عەمبار: <span className="text-slate-200">{item.currentStock}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left rtl:text-right">
                    <span className="block text-xs font-bold text-amber-400">
                      {item.totalQuantitySold} دانە فرۆشراوە
                    </span>
                    <span className="block text-[11px] font-medium text-slate-400">
                      داهات: {currency}{item.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. Slow Moving Stock Alerts Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2.5 bg-gradient-to-tr from-rose-600 to-red-600 rounded-xl text-white shadow-lg shadow-rose-600/20">
                <Hourglass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">کاڵا لەسەرخۆ و ڕاوەستاوەکان (Slow Moving Stock)</h3>
                <p className="text-xs text-slate-400">کاڵاکان کە لە ۳۰ ڕۆژی ڕابردوودا نەفرۆشراون</p>
              </div>
            </div>

            <span className="px-2.5 py-1 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              سەرمایەی ڕاوەستاو
            </span>
          </div>

          {/* List */}
          <div className="space-y-3">
            {slowMoving.length === 0 ? (
              <div className="text-center py-8 text-emerald-400 text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                هەموو بەرهەمەکانی عەمبار لە جووڵەی باشدا هەنگاو دەنێن!
              </div>
            ) : (
              slowMoving.map((item) => {
                const isDiscounted = appliedDiscountIds.has(item.productId);

                return (
                  <div
                    key={item.productId}
                    className="bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 transition flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{item.productName}</h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{item.daysWithoutSale} ڕۆژە نەفرۆشراوە</span>
                        <span>•</span>
                        <span className="text-rose-400 font-semibold">
                          سەرمایە: {currency}{item.capitalLocked.toLocaleString()}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDiscountClick(item.productId, item.suggestedDiscountPercent)}
                      disabled={isDiscounted}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${
                        isDiscounted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30'
                      }`}
                    >
                      {isDiscounted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          داشکاندن کاراکرا
                        </>
                      ) : (
                        <>
                          <Percent className="w-3.5 h-3.5" />
                          داشکاندنی {item.suggestedDiscountPercent}%
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
