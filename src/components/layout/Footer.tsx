import React from 'react';
import { Logo } from '../common/Logo';
import { Phone, Mail, MapPin, Shield, Truck, CreditCard, Sparkles } from 'lucide-react';
import { ProductCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
  onSelectCategory?: (category: ProductCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  const { t, dir } = useLanguage();

  return (
    <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-slate-800 mb-10 text-start">
          <div className="flex items-center gap-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-[#F97316] flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('footer.trust.fast_delivery_title')}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{t('footer.trust.fast_delivery_desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-[#2563EB] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('footer.trust.quality_title')}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{t('footer.trust.quality_desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('footer.trust.payment_title')}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{t('footer.trust.payment_desc')}</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-start">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <Logo size="lg" variant="light" showTagline={true} />
            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              {t('app.tagline')}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs font-semibold text-[#F97316] font-latin">daim-post.online</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">{t('footer.main_sections')}</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => onSelectCategory?.('food')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  {t('category.food')}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory?.('market')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  {t('category.market')}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory?.('clothes')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  {t('category.clothes')}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory?.('fresh_meat')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  {t('category.fresh_meat')}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory?.('electronics')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  {t('category.electronics')}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory?.('cars')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  {t('category.cars')}
                </button>
              </li>
            </ul>
          </div>

          {/* For Sellers & Drivers */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">{t('footer.for_sellers_drivers')}</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => onNavigate('auth', 'register')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  {t('footer.register_store')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('post-car-ad')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  {t('footer.post_car')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('auth', 'register')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  {t('footer.become_driver')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller-dashboard')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  {t('footer.seller_login')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-[#F97316] transition-colors cursor-pointer">
                  {t('footer.admin_portal')}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">{t('footer.contact_support')}</h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                <span>بەردەڕەش ناو بازاڕ</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                <span dir="ltr" className="font-latin inline-block font-bold">
                  0750 479 6924
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                <span dir="ltr" className="font-latin inline-block">
                  shakh8002@gmail.com
                </span>
              </li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 text-[#F97316] text-xs font-bold border border-orange-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('footer.support_24_7')}
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {t('app.name')} - {t('app.domain')}. {t('footer.all_rights_reserved')}</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => onNavigate('user-profile')} className="hover:text-white cursor-pointer transition-colors">
              {t('footer.terms')}
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('user-profile')} className="hover:text-white cursor-pointer transition-colors">
              {t('footer.feedback')}
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('user-profile')} className="hover:text-white cursor-pointer transition-colors">
              {t('footer.contact_us')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
