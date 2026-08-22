import { UserProfile, SellerProfile, Product, CarAd, CarPackage, Order, Review } from '../types';

export const CITIES = [
  'Erbil (هەولێر)',
  'Sulaymaniyah (سلێمانی)',
  'Duhok (دهۆک)',
  'Bardarash (بەردەڕەش)',
  'Kirkuk (کەرکووک)',
  'Zakho (زاخۆ)',
  'Halabja (هەڵەبجە)',
  'Soran (سۆران)',
  'Ranya (ڕانیە)',
  'Kalar (کەلار)',
  'Baghdad (بەغداد)',
  'Mosul (مووسڵ)'
];

export const CAR_PACKAGES: CarPackage[] = [
  {
    id: '1_week',
    name: 'پاکێجی یەک هەفتە (٧ ڕۆژ)',
    durationDays: 7,
    priceIqd: 5000,
    features: [
      'نمایشکردن لە پەڕەی سەرەکی بۆ ٧ ڕۆژ',
      'پێگەی تایبەت لە گەڕان',
      'پەیوەندی ڕاستەوخۆ بە تەلەفۆن و واتسئەپ',
      'بارکردنی تا ٨ وێنەی کوالیتی بەرز'
    ]
  },
  {
    id: '15_days',
    name: 'پاکێجی ١٥ ڕۆژ (پێشنیارکراو)',
    durationDays: 15,
    priceIqd: 7000,
    features: [
      'نمایشکردن لە بەشی هەڵبژێردراو بۆ ١٥ ڕۆژ',
      'نیشانەی ئۆتۆمبێلی پشتڕاستکراوە (Verified)',
      'پەیوەندی ڕاستەوخۆ بە واتسئەپ و پەیوەندی',
      'ڕاپۆرتی سەردانیکەران و بینەران',
      'بارکردنی تا ١٢ وێنە'
    ]
  },
  {
    id: '1_month',
    name: 'پاکێجی یەک مانگ (٣٠ ڕۆژ - زۆرترین فرۆش)',
    durationDays: 30,
    priceIqd: 10000,
    features: [
      'نمایشکردنی VIP لە لوتکەی لیستەکان بۆ ٣٠ ڕۆژ',
      'بەرزترین ڕادەی بینین لە هەموو شارەکان',
      'پشتگیری ٢٤ کاتژمێری لە شاخی',
      'نیشانەی ئۆتۆمبێلی تایبەت (Featured VIP)',
      'بارکردنی بێ سنووری وێنەکان'
    ]
  }
];

export const INITIAL_PROFILES: UserProfile[] = [];
export const INITIAL_SELLERS: SellerProfile[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_CAR_ADS: CarAd[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_REVIEWS: Review[] = [];
