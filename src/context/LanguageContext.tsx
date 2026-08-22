import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ku' | 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ku: {
    // Brand & General
    'app.name': 'شاخ',
    'app.tagline': 'پلاتفۆرمی بازاڕ و گەیاندنی کوردستان و عێراق',
    'app.domain': 'daim-post.online',
    'currency': 'د.ع',
    'currency.full': 'دیناری عێراقی',
    'all': 'هەمووی',
    'search': 'گەڕان',
    'search.placeholder': 'بگەڕێ بۆ خواردن، مارکێت، جلوبەرگ، مۆبایل، ئۆتۆمبێل...',
    'select.city': 'شار هەڵبژێرە',
    'login': 'چوونەژوورەوە',
    'register': 'تۆمارکردن',
    'logout': 'چوونەدەرەوە',
    'profile': 'پڕۆفایل',
    'dashboard': 'داشبۆرد',
    'cart': 'سەبەتە',
    'favorites': 'دڵخوازەکان',
    'orders': 'داواکارییەکانم',
    'notifications': 'ئاگادارییەکان',
    'save': 'پاشەکەوتکردن',
    'cancel': 'پاشگەزبوونەوە',
    'delete': 'سڕینەوە',
    'edit': 'دەستکاری',
    'add': 'زیادکردن',
    'view_all': 'هەمووی ببینە',
    'view_store': 'سەردانی فرۆشگا',
    'contact_seller': 'پەیوەندی بە فرۆشیار',
    'call_now': 'پەیوەندی بکە',
    'whatsapp': 'واتسئەپ',
    'in_stock': 'لە کۆگا ماوە',
    'out_of_stock': 'تەواو بووە',
    'verified': 'پشتڕاستکراوە',
    'open_now': 'کراوەیە',
    'closed': 'داخراوە',

    // Categories
    'cat.food': 'چێشتخانە و خواردن',
    'cat.market': 'مارکێت و سوپەرمارکێت',
    'cat.clothes': 'جلوبەرگ و مۆدە',
    'cat.fruits_vegetables': 'سەوزە و میوە',
    'cat.fresh_meat': 'گۆشتی تازە',
    'cat.dairy': 'شیرەمەنی و ماست',
    'cat.electronics': 'ئەلیکترۆنیات',
    'cat.beauty': 'جوانی و مکیاژ',
    'cat.cars': 'ئۆتۆمبێل و گواستنەوە',

    // Roles
    'role.customer': 'کڕیار',
    'role.restaurant_owner': 'خاوەن چێشتخانە',
    'role.market_owner': 'خاوەن مارکێت',
    'role.clothes_seller': 'فرۆشیاری جلوبەرگ',
    'role.fruits_vegetables_seller': 'فرۆشیاری میوە و سەوزە',
    'role.fresh_meat_seller': 'فرۆشیاری گۆشتی تازە',
    'role.dairy_seller': 'فرۆشیاری شیرەمەنی',
    'role.electronics_seller': 'فرۆشیاری ئەلیکترۆنیات',
    'role.beauty_seller': 'فرۆشیاری جوانی و مکیاژ',
    'role.car_seller': 'فرۆشیاری ئۆتۆمبێل',
    'role.delivery_agent': 'شۆفێری گەیاندن',
    'role.admin': 'سووپەر ئەدمین (Super Admin)',

    // Order Statuses
    'status.pending': 'لە چاوەڕوانیدا',
    'status.accepted': 'پەسەندکرا',
    'status.preparing': 'لە ئامادەکردندا',
    'status.ready': 'ئامادەیە بۆ وەرگرتن',
    'status.picked_up': 'شۆفێر وەریگرت',
    'status.on_the_way': 'لە ڕێگادایە بۆ لات',
    'status.delivered': 'بە سەرکەوتوویی گەیەندرا',
    'status.cancelled': 'هەڵوەشێنرایەوە',

    // Car Ads
    'car.post_ad': 'ڕیکلامی ئۆتۆمبێل دابنێ',
    'car.packages': 'پاکێجەکانی ڕیکلامی ئۆتۆمبێل',
    'car.package.1_week': 'یەک هەفتە (٥,٠٠٠ دینار)',
    'car.package.15_days': '١٥ ڕۆژ (٧,٠٠٠ دینار)',
    'car.package.1_month': 'یەک مانگ (١٠,٠٠٠ دینار)',
    'car.year': 'ساڵ',
    'car.mileage': 'ڕۆیشتوو',
    'car.fuel': 'سووتەمەنی',
    'car.transmission': 'گێڕ',
    'car.color': 'ڕەنگ',
    'car.price_iqd': 'نرخ بە دینار',
    'car.price_usd': 'نرخ بە دۆلار',

    // Financial & Commission
    'commission.shakh': 'ڕێژەی کۆمسیۆنی شاخ',
    'wallet.balance': 'باڵانسی بەردەست',
    'wallet.total_sales': 'کۆی گشتی فرۆش',
    'wallet.net_earnings': 'قازانجی پاکی فرۆشیار',
    'wallet.pending': 'قازانجی لە پرۆسەدا'
  },
  en: {
    'app.name': 'Shakh',
    'app.tagline': 'Kurdistan & Iraq Marketplace & Fast Delivery',
    'app.domain': 'daim-post.online',
    'currency': 'IQD',
    'currency.full': 'Iraqi Dinar',
    'all': 'All',
    'search': 'Search',
    'search.placeholder': 'Search food, groceries, fashion, electronics, cars...',
    'select.city': 'Select City',
    'login': 'Sign In',
    'register': 'Sign Up',
    'logout': 'Sign Out',
    'profile': 'Profile',
    'dashboard': 'Dashboard',
    'cart': 'Cart',
    'favorites': 'Favorites',
    'orders': 'My Orders',
    'notifications': 'Notifications',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'view_all': 'View All',
    'view_store': 'Visit Store',
    'contact_seller': 'Contact Seller',
    'call_now': 'Call Now',
    'whatsapp': 'WhatsApp',
    'in_stock': 'In Stock',
    'out_of_stock': 'Out of Stock',
    'verified': 'Verified',
    'open_now': 'Open Now',
    'closed': 'Closed',

    'cat.food': 'Restaurants & Food',
    'cat.market': 'Supermarket & Groceries',
    'cat.clothes': 'Fashion & Clothes',
    'cat.fruits_vegetables': 'Fruits & Vegetables',
    'cat.fresh_meat': 'Fresh Meat',
    'cat.dairy': 'Dairy & Milk',
    'cat.electronics': 'Electronics & Mobiles',
    'cat.beauty': 'Beauty & Cosmetics',
    'cat.cars': 'Cars & Vehicles',

    'role.customer': 'Customer',
    'role.restaurant_owner': 'Restaurant Owner',
    'role.market_owner': 'Market Owner',
    'role.clothes_seller': 'Clothes Seller',
    'role.fruits_vegetables_seller': 'Fruits & Veg Seller',
    'role.fresh_meat_seller': 'Meat Seller',
    'role.dairy_seller': 'Dairy Seller',
    'role.electronics_seller': 'Electronics Seller',
    'role.beauty_seller': 'Beauty Seller',
    'role.car_seller': 'Car Seller',
    'role.delivery_agent': 'Delivery Agent',
    'role.admin': 'Super Admin',

    'status.pending': 'Pending',
    'status.accepted': 'Accepted',
    'status.preparing': 'Preparing',
    'status.ready': 'Ready for Pickup',
    'status.picked_up': 'Picked Up by Driver',
    'status.on_the_way': 'On The Way',
    'status.delivered': 'Delivered',
    'status.cancelled': 'Cancelled',

    'car.post_ad': 'Post Car Ad',
    'car.packages': 'Car Advertisement Packages',
    'car.package.1_week': '1 Week (5,000 IQD)',
    'car.package.15_days': '15 Days (7,000 IQD)',
    'car.package.1_month': '1 Month (10,000 IQD)',
    'car.year': 'Year',
    'car.mileage': 'Mileage',
    'car.fuel': 'Fuel',
    'car.transmission': 'Transmission',
    'car.color': 'Color',
    'car.price_iqd': 'Price in IQD',
    'car.price_usd': 'Price in USD',

    'commission.shakh': 'Shakh Commission Rate',
    'wallet.balance': 'Available Balance',
    'wallet.total_sales': 'Total Gross Sales',
    'wallet.net_earnings': 'Net Seller Earnings',
    'wallet.pending': 'Pending Earnings'
  },
  ar: {
    'app.name': 'شاخ',
    'app.tagline': 'منصة التسوق والتوصيل السريع في كردستان والعراق',
    'app.domain': 'daim-post.online',
    'currency': 'د.ع',
    'currency.full': 'دينار عراقي',
    'all': 'الكل',
    'search': 'بحث',
    'search.placeholder': 'ابحث عن مطاعم، سوبرماركت، ملابس، إلكترونيات، سيارات...',
    'select.city': 'اختر المدينة',
    'login': 'تسجيل الدخول',
    'register': 'إنشاء حساب',
    'logout': 'تسجيل الخروج',
    'profile': 'الملف الشخصي',
    'dashboard': 'لوحة التحكم',
    'cart': 'السلة',
    'favorites': 'المفضلة',
    'orders': 'طلباتي',
    'notifications': 'الإشعارات',
    'save': 'حفظ',
    'cancel': 'إلغاء',
    'delete': 'حذف',
    'edit': 'تعديل',
    'add': 'إضافة',
    'view_all': 'عرض الكل',
    'view_store': 'زيارة المتجر',
    'contact_seller': 'الاتصال بالبائع',
    'call_now': 'اتصل الآن',
    'whatsapp': 'واتساب',
    'in_stock': 'متوفر',
    'out_of_stock': 'نفذت الكمية',
    'verified': 'موثق',
    'open_now': 'مفتوح',
    'closed': 'مغلق',

    'cat.food': 'المطاعم والمأكولات',
    'cat.market': 'سوبرماركت ومواد غذائية',
    'cat.clothes': 'الملابس والأزياء',
    'cat.fruits_vegetables': 'خضار وفواكه طازجة',
    'cat.fresh_meat': 'اللحوم والدواجن',
    'cat.dairy': 'الألبان والأجبان',
    'cat.electronics': 'الإلكترونيات والموبايل',
    'cat.beauty': 'العناية والجمال',
    'cat.cars': 'السيارات والمركبات',

    'role.customer': 'زبون',
    'role.restaurant_owner': 'صاحب مطعم',
    'role.market_owner': 'صاحب ماركت',
    'role.clothes_seller': 'بائع ملابس',
    'role.fruits_vegetables_seller': 'بائع خضار وفواكه',
    'role.fresh_meat_seller': 'قصاب ولحوم',
    'role.dairy_seller': 'بائع ألبان',
    'role.electronics_seller': 'بائع إلكترونيات',
    'role.beauty_seller': 'بائع مستحضرات تجميل',
    'role.car_seller': 'بائع سيارات',
    'role.delivery_agent': 'مندوب توصيل',
    'role.admin': 'المشرف العام (Super Admin)',

    'status.pending': 'قيد الانتظار',
    'status.accepted': 'تم القبول',
    'status.preparing': 'قيد التحضير',
    'status.ready': 'جاهز للتسليم',
    'status.picked_up': 'تم الاستلام من قبل السائق',
    'status.on_the_way': 'في الطريق إليك',
    'status.delivered': 'تم التوصيل بنجاح',
    'status.cancelled': 'ملغي',

    'car.post_ad': 'أضف إعلان سيارة',
    'car.packages': 'باقات إعلانات السيارات',
    'car.package.1_week': 'أسبوع واحد (٥٠٠٠ دينار)',
    'car.package.15_days': '١٥ يوماً (٧٠٠٠ دينار)',
    'car.package.1_month': 'شهر كامل (١٠٠٠٠ دينار)',
    'car.year': 'الموديل/السنة',
    'car.mileage': 'المسافة المقطوعة',
    'car.fuel': 'نوع الوقود',
    'car.transmission': 'ناقل الحركة',
    'car.color': 'اللون',
    'car.price_iqd': 'السعر بالدينار',
    'car.price_usd': 'السعر بالدولار',

    'commission.shakh': 'نسبة عمولة شاخ',
    'wallet.balance': 'الرصيد المتاح',
    'wallet.total_sales': 'إجمالي المبيعات',
    'wallet.net_earnings': 'صافي أرباح البائع',
    'wallet.pending': 'أرباح معلقة'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('shakh_language') as Language;
    return saved && ['ku', 'en', 'ar'].includes(saved) ? saved : 'ku';
  });

  const dir = language === 'en' ? 'ltr' : 'rtl';

  useEffect(() => {
    localStorage.setItem('shakh_language', language);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['ku']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
