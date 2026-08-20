import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    grandTotal,
    primarySellerName
  } = useCart();
  const { dir } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-base">سەبەتەی کڕین ({items.length})</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Seller notice if items exist */}
          {items.length > 0 && primarySellerName && (
            <div className="px-6 py-2.5 bg-orange-50 border-b border-orange-100 flex items-center gap-2 text-xs font-bold text-orange-800">
              <Store className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>داواکردن لە: {primarySellerName}</span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <ShoppingBag className="w-16 h-16 text-slate-300 mb-3 stroke-[1.5]" />
                <h4 className="text-base font-bold text-slate-700">سەبەتەکەت بەتاڵە</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  سەیری چێشتخانەکان، مارکێت و بەشە جیاوازەکان بکە و کاڵا دڵخوازەکانت هەڵبژێرە.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-4 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20"
                >
                  گەڕان لە بەشەکان
                </button>
              </div>
            ) : (
              items.map((item, index) => {
                const unitPrice = item.product.discountPrice || item.product.price;
                return (
                  <div
                    key={`${item.product.id}-${index}`}
                    className="flex gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-red-600 p-0.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Variant details if selected */}
                        {(item.selectedSize || item.selectedColor) && (
                          <div className="flex gap-2 text-[10px] text-slate-500 mt-0.5">
                            {item.selectedSize && <span>قەبارە: {item.selectedSize}</span>}
                            {item.selectedColor && <span>ڕەنگ: {item.selectedColor}</span>}
                          </div>
                        )}

                        <div className="text-xs font-black text-orange-600 font-latin mt-1">
                          {unitPrice.toLocaleString()} د.ع
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-800 font-latin">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-900 font-latin">
                          {(unitPrice * item.quantity).toLocaleString()} د.ع
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>کۆی کاڵاکان:</span>
                  <span className="font-bold text-slate-900 font-latin">{subtotal.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between">
                  <span>کرێی گەیاندن:</span>
                  <span className="font-bold text-slate-900 font-latin">{deliveryFee.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>کۆی گشتی:</span>
                  <span className="text-orange-600 font-latin text-base">{grandTotal.toLocaleString()} د.ع</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>تەواوکردنی کڕین و داواکاری</span>
                {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
