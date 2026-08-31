import { SubscriptionPlan } from '../types';

export const DEFAULT_SELLER_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'seller_free_starter',
    target: 'seller',
    name: 'ڕێککەوتنی ستاندارد (پۆستی بێسنوور + نیسبەی فرۆش)',
    nameEn: 'Standard Merchant (Free Posts + Commission on Sale)',
    price: 0,
    billingCycle: 'monthly',
    commissionRateDiscount: 0,
    maxProducts: 999999, // Unlimited posting
    isPopular: true,
    features: [
      '✅ دانان و بڵاوکردنەوەی کاڵا بە بێسنووری و بێ لیمیت (Unlimited Posts)',
      '✅ پۆستکردن ١٠٠٪ بێبەرامبەرە (سفر ٠ د.ع پێشەکی)',
      '📊 پێدانی نیسبە تەنها لە کاتی فرۆشتنی سەرکەوتوودا بەپێی ڕێککەوتن (١٠٪)',
      '⚡ داشبۆردی بەڕێوەبردنی کاڵاکان، ئۆردەر و شۆفێرانی فرۆشگا',
      '💬 دەسەڵاتی داواکردنی ڕێککەوتنی تایبەت و کەمکردنەوەی نیسبە لە شاخ'
    ]
  },
  {
    id: 'seller_pro_monthly',
    target: 'seller',
    name: 'ڕێککەوتنی نیسبەی کەمکراوە (Pro Merchant 5%)',
    nameEn: 'Pro Store (5% Commission Split)',
    price: 25000,
    billingCycle: 'monthly',
    commissionRateDiscount: 5, // lowers to 5%
    maxProducts: 999999,
    isPopular: false,
    features: [
      '✅ بڵاوکردنەوەی کاڵای بێسنوور بە بێبەرامبەری',
      '📉 نیسبەی فرۆشی کەمکراوە بۆ تەنها ٥٪ بۆ شاخ لەبری ١٠٪',
      '⭐ نیشانەی فرۆشگای باوەڕپێکراو (Verified Pro Badge)',
      '🚀 پێشینە لە ئەنجامی گەڕان و بەشی سەرەکی ئەپ',
      '📊 شیکاری وردی قازانج، ئاماری فرۆش و کڕیاران'
    ]
  },
  {
    id: 'seller_vip_enterprise',
    target: 'seller',
    name: 'ڕێککەوتنی زێڕینی VIP (سفر ٠٪ نیسبەی فرۆش)',
    nameEn: 'VIP Store (0% Commission)',
    price: 60000,
    billingCycle: 'monthly',
    commissionRateDiscount: 10, // lowers to 0%
    maxProducts: 999999,
    isPopular: false,
    features: [
      '✅ بەرهەم و کاڵای بێسنوور بە بێبەرامبەری',
      '👑 ٠٪ نیسبە لەسەر فرۆش (١٠٠٪ تەواوی قازانجی فرۆش بۆ خاوەن کار)',
      '🌟 نیشانەی زێڕینی VIP لە تەنیشت ناوی فرۆشگا',
      '📢 ڕیکلامی ناوبەناو لە نۆتیفیکەیشنی گشتی و بانەری شاخ',
      '📞 بەڕێوەبەری تایبەت لە شاخ و پشتیوانی خێرای ٢٤ کاتژمێری'
    ]
  },
  {
    id: 'seller_custom_agreement',
    target: 'seller',
    name: 'ڕێککەوتنی تایبەتی دووقۆڵی (Custom Agreement)',
    nameEn: 'Custom Negotiated Agreement',
    price: 0,
    billingCycle: 'custom',
    commissionRateDiscount: 0,
    maxProducts: 999999,
    isPopular: false,
    features: [
      '🤝 دیاریکردنی نیسبەی فرۆش بەپێی دانوستان و ڕێککەوتنی تایبەت لەگەڵ بەڕێوەبەرایەتی شاخ',
      '📝 دەسەڵاتی تەواوی سوپەر ئەدمین بۆ دانانی نیسبەی تایبەتی فرۆشگا',
      '🚚 مەرج و تایبەتمەندی تایبەتی گەیاندن و لۆجستی'
    ]
  }
];

export const DEFAULT_CAPTAIN_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'captain_standard',
    target: 'captain',
    name: 'ڕێککەوتنی کاپتنی ستاندارد (٧٠٪ کاپتن / ٣٠٪ شاخ)',
    nameEn: 'Standard Captain (70% Courier / 30% Shakh)',
    price: 0,
    billingCycle: 'monthly',
    captainCommissionCut: 30, // 30% to Shakh, 70% to Captain
    isPopular: true,
    features: [
      '🛵 ٧٠٪ قازانجی خاوێن لە هەر گەیاندنێک ڕاستەوخۆ بۆ کاپتن',
      '🏢 ٣٠٪ نیسبەی پلاتفۆرمی شاخ بۆ خزمەتگوزاری، سێرڤەر و بیمە',
      '📍 وەرگرتنی داواکارییە خێراکانی سەرجەم شار و گەڕەکەکان',
      '🪙 کۆکردنەوەی پۆینتی کاپتن و وەرگرتنی پاداشت لەسەر هەر گەیاندنێک'
    ]
  },
  {
    id: 'captain_pro_monthly',
    target: 'captain',
    name: 'ڕێککەوتنی کاپتنی زێڕین (١٠٠٪ کرێ بۆ کاپتن)',
    nameEn: 'VIP Captain (100% Net)',
    price: 20000,
    billingCycle: 'monthly',
    captainCommissionCut: 0, // 0% to Shakh, 100% to Captain
    isPopular: false,
    features: [
      '👑 ١٠٠٪ تەواوی کرێی گەیاندن بۆ کاپتن بەبێ هیچ لێبڕینێک',
      '⚡ پێشینەی سەرەکی لە پێدانی داواکارییە نزیک و گەورەکان',
      '🪙 پۆینت و پاداشتی دوو هێندە لەسەر هەر گەیاندنێک',
      '⭐ نیشانەی کاپتنی خێرا و متمانەپێکراو'
    ]
  },
  {
    id: 'captain_custom_agreement',
    target: 'captain',
    name: 'ڕێککەوتنی تایبەتی کاپتن (Custom Agreement)',
    nameEn: 'Custom Captain Agreement',
    price: 0,
    billingCycle: 'custom',
    captainCommissionCut: 0,
    isPopular: false,
    features: [
      '🤝 ڕێککەوتنی تایبەتی نیسبە لە نێوان کاپتن و بەڕێوەبەرایەتی شاخ',
      '⏰ دیاریکردنی شفت، ناوچەی تایبەت یان ڕێژەی دڵخواز بەپێی ڕێککەوتن'
    ]
  }
];

