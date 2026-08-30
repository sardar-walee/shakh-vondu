import { SubscriptionPlan } from '../types';

export const DEFAULT_SELLER_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'seller_free_starter',
    target: 'seller',
    name: 'پلانی بنەڕەتی (Starter)',
    nameEn: 'Starter Store',
    price: 0,
    billingCycle: 'monthly',
    commissionRateDiscount: 0,
    maxProducts: 50,
    isPopular: false,
    features: [
      'دانانی هەتا ٥٠ کاڵا و بەرهەم',
      'ڕێژەی کۆمسیۆنی ستاندارد (١٠٪ بۆ شاخ)',
      'داشبۆردی سەرەتایی بەڕێوەبردنی فرۆشگا',
      'وەرگرتنی داواکاری لە کاتی ڕاستەقینە',
      'پشتیوانی گشتی پلاتفۆرمی شاخ'
    ]
  },
  {
    id: 'seller_pro_monthly',
    target: 'seller',
    name: 'پلانی فرۆشیاری پێشکەوتوو (Pro Store)',
    nameEn: 'Pro Store Merchant',
    price: 25000,
    billingCycle: 'monthly',
    commissionRateDiscount: 5, // lowers to 5%
    maxProducts: 9999,
    isPopular: true,
    features: [
      'دانانی بەرهەمی بێسنوور (Unlimited Products)',
      'نیسبەی کەمکراوە: تەنها ٥٪ کۆمسیۆن بۆ شاخ!',
      'نیشانەی فرۆشگای باوەڕپێکراو (Verified Pro Badge)',
      'پێشینە لە ئەنجامی گەڕان و بەشی سەرەکی ئەپ',
      'شیکاری وردی فرۆش، کڕیاران و داهات',
      'ڕیکلامی ناوبەناو لە پەیج و نۆتیفیکەیشنی شاخ'
    ]
  },
  {
    id: 'seller_vip_enterprise',
    target: 'seller',
    name: 'پلانی زێڕین ڤی ئای پی (VIP Enterprise)',
    nameEn: 'VIP Enterprise Store',
    price: 60000,
    billingCycle: 'monthly',
    commissionRateDiscount: 10, // lowers to 0%
    maxProducts: 99999,
    isPopular: false,
    features: [
      'سفر ٠٪ کۆمسیۆن لە فرۆش (Zero Commission - هەموو قازانج بۆ خۆت!)',
      'بەرهەم و فرۆشگای بێسنوور',
      'نیشانەی زێڕینی VIP لە تەنیشت ناوی دوکان',
      'پیشاندانی تایبەت لە بەشی سەرەکی و بانەری بەرهەمەکان',
      'ئاگاداری ڕاستەوخۆ (FCM Push Notifications) بۆ کڕیاران لە کاتی کاڵای نوێ',
      'بەڕێوەبەری تایبەت لە شاخ و پشتیوانی ٢٤ کاتژمێری'
    ]
  },
  {
    id: 'seller_custom_agreement',
    target: 'seller',
    name: 'ڕێککەوتنی تایبەتی شاخ (Custom Agreement)',
    nameEn: 'Custom Negotiated Agreement',
    price: 0,
    billingCycle: 'custom',
    commissionRateDiscount: 0,
    maxProducts: 99999,
    isPopular: false,
    features: [
      'دیاریکردنی نرخ و کۆمسیۆن بەپێی ڕێککەوتنی دووقۆڵی لەگەڵ بەڕێوەبەرایەتی شاخ',
      'دەسەڵاتی تەواوی ئەدمین بۆ دەستکاریکردنی نیسبە و مەرجەکان',
      'مەرجی تایبەتی لۆجستی و گەیاندن'
    ]
  }
];

export const DEFAULT_CAPTAIN_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'captain_standard',
    target: 'captain',
    name: 'پلانی کاپتنی ستاندارد (Standard Captain)',
    nameEn: 'Standard Courier (70/30 Split)',
    price: 0,
    billingCycle: 'monthly',
    captainCommissionCut: 30, // 30% to Shakh, 70% to Captain
    isPopular: false,
    features: [
      '٧٠٪ قازانجی خاوێن لە هەر گەیاندنێک بۆ کاپتن',
      '٣٠٪ نیسبەی پلاتفۆرمی شاخ بۆ خزمەتگوزاری و بیمە',
      'وەرگرتنی داواکارییە ناوخۆییەکانی شار',
      'کۆکردنەوەی پۆینتی کاپتن و گۆڕینەوە بە پاداشت'
    ]
  },
  {
    id: 'captain_pro_monthly',
    target: 'captain',
    name: 'ئابوونەی کاپتنی زێڕین (VIP Captain 100%)',
    nameEn: 'Pro VIP Courier (100% Net)',
    price: 20000,
    billingCycle: 'monthly',
    captainCommissionCut: 0, // 0% to Shakh, 100% to Captain!
    isPopular: true,
    features: [
      '١٠٠٪ تەواوی کرێی گەیاندن بۆ کاپتن (٠٪ لێبڕین بۆ شاخ!)',
      'پێشینەی سەرەکی لە وەرگرتنی داواکارییە گەورەکان و فرۆشگاکان',
      'پۆینت و خەڵاتی دوو هێندە لەسەر هەر گەیاندنێک',
      'نیشانەی کاپتنی خێرا و ئەستێرەی زێڕین',
      'بیمەی تایبەتی پشتیوانی لە کاتی کێشە لە گەیاندن'
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
      'ڕێککەوتنی تایبەت لەگەڵ بەڕێوەبەرایەتی شاخ بۆ شفت، زۆن و نیسبە',
      'دیاریکردنی مووچە یان کرێی جێگیر بەپێی ڕێککەوتن'
    ]
  }
];
