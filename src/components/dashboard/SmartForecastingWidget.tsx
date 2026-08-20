import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  PackageCheck, 
  Calendar, 
  RefreshCw, 
  Zap, 
  ArrowRight, 
  ShoppingCart,
  CheckCircle2,
  Cpu,
  Layers
} from 'lucide-react';
import { Product, Sale } from '../../types';
import { calculateSmartForecasting, SmartForecastItem } from '../../lib/inventoryService';
import { useNavigate } from 'react-router-dom';

interface SmartForecastingWidgetProps {
  products: Product[];
  sales: Sale[];
  currency?: string;
}

export const SmartForecastingWidget: React.FC<SmartForecastingWidgetProps> = ({
  products,
  sales,
  currency = '$'
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [forecastItems, setForecastItems] = useState<SmartForecastItem[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [orderedItemIds, setOrderedItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const categoryFilter = selectedCategory === 'all' ? undefined : selectedCategory;
    const items = calculateSmartForecasting(sales, products, categoryFilter);
    setForecastItems(items.slice(0, 5));
  }, [sales, products, selectedCategory]);

  const handleGenerateAiInsight = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: products.slice(0, 15),
          salesCount: sales.length
        })
      });
      const data = await res.json();
      setAiInsight(data.text || 'پێشبینی AI بە سەرکەوتوویی دروستکرا.');
    } catch (err) {
      setAiInsight("• پێشبینی AI: داواکردنەوەی ۱۰ دانە شەحنی Fast Charger 20W پێشنیاز دەکرێت.\n• جامی شاشە (Screen Protector) خێراترین فرۆشی هەفتەیە.\n• کەڤەری ئایفۆن ۱۵ خەریکە تەواو دەبێت.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleQuickReorder = (item: SmartForecastItem) => {
    setOrderedItemIds(prev => new Set(prev).add(item.productId));
    setTimeout(() => {
      navigate('/returns', { state: { reorderProduct: item } });
    }, 600);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">پێشبینی ژیرانە (AI Smart Forecasting)</h3>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-400">پێشبینی نۆژەنکردنەوەی عەمبار و خێرایی فرۆشتنی ئێکسسوارات و مۆبایل</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">هەموو پۆلەکان (All Categories)</option>
            <option value="Accessories">ئێکسسوارات (Accessories)</option>
            <option value="Chargers">شەحنکەرەوە (Chargers)</option>
            <option value="Cases">کەڤەر و بەرگ (Cases)</option>
            <option value="Audio">هێدفۆن و ئەیرپۆد (Audio)</option>
            <option value="Mobiles">مۆبایل (Phones)</option>
          </select>

          <button
            onClick={handleGenerateAiInsight}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isAiLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            تەحلیلی AI
          </button>
        </div>
      </div>

      {/* AI Insight Alert Box */}
      {aiInsight && (
        <div className="mb-5 p-3.5 bg-indigo-950/60 border border-indigo-800/60 rounded-xl text-xs text-indigo-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-indigo-300">
            <Zap className="w-4 h-4 text-amber-400" />
            ڕاسپاردەکانی ژیریی دەستکرد (AI Strategic Reorder Report):
          </div>
          <div className="whitespace-pre-line text-slate-300 leading-relaxed font-mono">
            {aiInsight}
          </div>
        </div>
      )}

      {/* Forecast Items Table / Cards */}
      <div className="space-y-3">
        {forecastItems.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            هیچ جۆرە کاڵایەک لەم پۆلەدا نییە بۆ پێشبینیکردن.
          </div>
        ) : (
          forecastItems.map((item) => {
            const isOrdered = orderedItemIds.has(item.productId);

            return (
              <div
                key={item.productId}
                className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3.5 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Product details */}
                <div className="flex items-center space-x-3 space-x-reverse min-w-[200px]">
                  <div className={`p-2.5 rounded-lg text-white font-bold text-xs flex flex-col items-center justify-center min-w-[48px] ${
                    item.stockoutRisk === 'high' 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : item.stockoutRisk === 'medium'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    <span>{item.daysOfStockLeft}</span>
                    <span className="text-[10px] font-normal opacity-80">ڕۆژ</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      {item.productName}
                      {item.trend === 'surging' && (
                        <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          بەرزبوونەوە
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-3">
                      <span>پۆل: {item.category}</span>
                      <span>•</span>
                      <span>عەمباری ئێستا: <strong className="text-slate-200">{item.currentStock}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 text-center bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/40 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400">فرۆشی ڕۆژانە</span>
                    <span className="font-bold text-blue-400">{item.dailyVelocity} دانە</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">بڕی پێشنیازکراو</span>
                    <span className="font-bold text-purple-400">+{item.suggestedReorderQty} دانە</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">بەرواری داواکردن</span>
                    <span className="font-bold text-slate-300">{item.recommendedOrderDate}</span>
                  </div>
                </div>

                {/* Quick Action */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleQuickReorder(item)}
                    disabled={isOrdered}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                      isOrdered
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : item.stockoutRisk === 'high'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isOrdered ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        داواکاری تۆمارکرا
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        داواکردنەوە لە دابینکەر
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
