import React from 'react';
import { Logo } from '../common/Logo';
import { Phone, Mail, MapPin, Shield, Truck, CreditCard, Sparkles } from 'lucide-react';
import { ProductCategory } from '../../types';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
  onSelectCategory?: (category: ProductCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-slate-800 mb-10 text-right">
          <div className="flex items-center gap-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-[#F97316] flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">گەیاندنی خێرا لە هەموو شارەکان</h4>
              <p className="text-xs text-slate-400">کاپتنەکانمان ئامادەن بۆ گەیاندنی داواکارییەکانت لە کەمترین کاتدا</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-[#2563EB] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">کوالیتی گەرەنتیکراوی کاڵاکان</h4>
              <p className="text-xs text-slate-400">هەموو فرۆشیار و مارکێت و چێشتخانەکانمان پشکنراون</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">پارەدانی ئاسان و متمانەپێکراو</h4>
              <p className="text-xs text-slate-400">پارەدان لە کاتی وەرگرتن (COD)، فاستپەی (FastPay) و FIB</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-right">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <Logo size="lg" variant="light" showTagline={true} />
            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              شاخی (Shakh) گەورەترین پلاتفۆرمی کڕین و فرۆشتن، داواکردنی خواردن، پێداویستی مارکێت، جلوبەرگ، مۆبایل، گۆشت و شیرەمەنی، و بازاڕی کڕین و فرۆشتنی ئۆتۆمبێلە لە کوردستان و عێراق.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs font-semibold text-[#F97316] font-latin">daim-post.online</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">بەشە سەرەکییەکان</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => onSelectCategory?.('food')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  چێشتخانە و خواردنە خێراکان
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory?.('market')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  مارکێت و سوپەرمارکێت
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory?.('clothes')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  جلوبەرگ و پێڵاو
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory?.('fresh_meat')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  گۆشتی تازەی کوردی و مریشک
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory?.('electronics')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  ئەلیکترۆنیات و مۆبایل
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory?.('cars')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  بازاڕی ئۆتۆمبێل و پێشانگاکان
                </button>
              </li>
            </ul>
          </div>

          {/* For Sellers & Drivers */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">بۆ فرۆشیار و شۆفێران</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => onNavigate('auth', 'register')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  تۆمارکردنی فرۆشگا لە شاخی
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('post-car-ad')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  دانانی ڕیکلامی ئۆتۆمبێل
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('auth', 'register')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  بوون بە شۆفێری گەیاندن
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller-dashboard')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  چوونەژوورەوەی فرۆشیاران
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  بەڕێوەبەرایەتی سەرەکی (Admin)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">پەیوەندی و پشتگیری</h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                <span>هەولێر، شەقامی ٦٠ مەتری - کوردستان</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                <span className="font-latin">0750 800 2000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                <span className="font-latin">shakh8002@gmail.com</span>
              </li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 text-[#F97316] text-xs font-bold border border-orange-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  پشتگیری ٢٤/٧ لە خزمەتتاندایە
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Shakh (شاخی) - daim-post.online. هەموو مافەکان پارێزراون.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-white cursor-pointer">یاساکان و مەرجەکان</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">سیاسەتی تایبەتمەندی</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">پەیوەندیکردن</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
