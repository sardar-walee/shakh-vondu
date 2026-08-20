import { SubscriptionPlan, PromoCoupon } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free_trial',
    name: '3-Month Free Trial',
    nameKu: 'تاقیکردنەوەی ۳ مانگ بێبەرامبەر',
    nameAr: 'تجربة مجانية لمدة 3 أشهر',
    description: 'Complimentary full-access trial for all retail store types (Mobile, Pharmacy, Clothing, Supermarket, Cosmetics, Auto Parts).',
    badge: 'دیاری سەرەتایی',
    priceMonthly: 0,
    priceYearly: 0,
    priceIqd: 0,
    durationMonths: 3,
    limits: {
      branches: 1,
      staffSeats: 'Unlimited',
      smsMonthly: 500,
      productsMax: 'Unlimited',
      aiInsights: true,
      customWebhook: false,
      dedicatedSmsSender: false,
      prioritySupport: false
    },
    highlightFeatures: [
      'تەواوی تایبەتمەندییەکان بۆ ماوەی ۳ مانگ بێبەرامبەر',
      'بەڕێوەبردنی تەواوی فرۆشگا و کۆگا و فرۆشتن',
      'پشتیوانی بەرهەمی مۆبایل، دەرمان، جلوبەرگ، مارکێت و جوانکاری',
      'سیستەمی کاشێری خێرا و ئایمای/دەرمان/بەرهەم',
      '٥٠٠ نامەی SMS ی بێبەرامبەر بۆ ئاگادارکردنەوەی کڕیار',
      'یانەی خاڵەکان و خەڵاتی کڕیاران'
    ],
    popular: false
  },
  {
    id: 'starter',
    name: '3-Month Renewal Plan',
    nameKu: 'پالانی نوێکردنەوەی ۳ مانگ',
    nameAr: 'تجديد لمدة 3 أشهر (25,000 دينار)',
    description: 'Quarterly store access for single or multi-branch retail businesses.',
    badge: 'سێ مانگ - 25,000',
    priceMonthly: 8333,
    priceYearly: 25000,
    priceIqd: 25000,
    durationMonths: 3,
    limits: {
      branches: 2,
      staffSeats: 'Unlimited',
      smsMonthly: 1000,
      productsMax: 'Unlimited',
      aiInsights: true,
      customWebhook: false,
      dedicatedSmsSender: false,
      prioritySupport: true
    },
    highlightFeatures: [
      'نوێکردنەوەی ۳ مانگ بە 25,000 دیناری عێراقی',
      'دەستڕاگەیشتنی تەواوی خاوەن کار و کارمەندان',
      'بەڕێوەبردنی بەرهەم، کۆگا، فرۆشتن و قەرزەکان',
      'دەرهێنانی فایلی ئێکسڵ (CSV) و باکئەپی سەر گۆگڵ/گیمەیل',
      'پشتیوانی و وەڵامدانەوەی خێرا'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: '6-Month Renewal Plan',
    nameKu: 'پالانی نوێکردنەوەی ٦ مانگ',
    nameAr: 'تجديد لمدة 6 أشهر (45,000 دينار)',
    description: 'Half-year store renewal plan with discounted rate.',
    badge: 'پێشنیازی تایبەت',
    priceMonthly: 7500,
    priceYearly: 45000,
    priceIqd: 45000,
    durationMonths: 6,
    limits: {
      branches: 5,
      staffSeats: 'Unlimited',
      smsMonthly: 2500,
      productsMax: 'Unlimited',
      aiInsights: true,
      customWebhook: true,
      dedicatedSmsSender: true,
      prioritySupport: true
    },
    highlightFeatures: [
      'نوێکردنەوەی ٦ مانگ بە 45,000 دیناری عێراقی',
      'داشکاندنی 5,000 دینار بە بەراورد بە سێ مانگی',
      'ناردنی نامەی ئۆتۆماتیکی (SMS) بۆ بەسەرچوونی قەرز و گەرەنتی',
      'پشتیوانی ڕاستەوخۆ و ڕاپۆرتی زۆر پێشکەوتووی دارایی'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: '1-Year Renewal Plan',
    nameKu: 'پالانی نوێکردنەوەی ۱ ساڵە (١٢ مانگ)',
    nameAr: 'تجديد لمدة سنة كاملة (60,000 دينار)',
    description: 'Full-year VIP store renewal with maximum savings and unlimited features.',
    badge: 'باشترین داشکاندن',
    priceMonthly: 5000,
    priceYearly: 60000,
    priceIqd: 60000,
    durationMonths: 12,
    limits: {
      branches: 'Unlimited',
      staffSeats: 'Unlimited',
      smsMonthly: 'Unlimited',
      productsMax: 'Unlimited',
      aiInsights: true,
      customWebhook: true,
      dedicatedSmsSender: true,
      prioritySupport: true
    },
    highlightFeatures: [
      'نوێکردنەوەی ۱ ساڵ (١٢ مانگ) بە 60,000 دیناری عێراقی',
      'گەورەترین داشکاندن (تەنها 5,000 دینار لە مانگێکدا!)',
      'دەستڕاگەیشتنی تەواو و بێسنوور بۆ هەموو لۆکەیشن و کارمەندەکان',
      'باکئەپی ئۆتۆماتیکی ڕۆژانە بۆ ئیمەیل و بەستنەوە بە دەروازەی SMS'
    ],
    popular: false
  }
];

export const PROMO_COUPONS: PromoCoupon[] = [
  {
    code: 'KURDISTAN2026',
    discountPercent: 25,
    description: '25% Special Kurdistan Launch Discount'
  },
  {
    code: 'MOBIPRO',
    discountFixed: 5000,
    description: '5,000 IQD Discount Coupon'
  }
];
