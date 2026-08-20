import { DeliveryZoneSettings, ProductCategory, SellerProfile } from '../types';

export interface DeliveryCalculationResult {
  deliveryFee: number;
  isWithinRadius: boolean;
  isFreeDelivery: boolean;
  estimatedMinutes: number;
  statusText: string;
  statusType: 'in_range' | 'warning' | 'out_of_range';
  feeBreakdown: {
    baseFee: number;
    extraFee: number;
    distanceKm: number;
    thresholdKm: number;
  };
}

export const CATEGORY_DELIVERY_DEFAULTS: Record<Exclude<ProductCategory, 'cars'>, DeliveryZoneSettings> = {
  food: {
    minDistanceKm: 0,
    maxDistanceKm: 12,
    baseFee: 2500,
    baseDistanceThresholdKm: 3,
    perKmExtraFee: 250,
    freeDeliveryThreshold: 45000,
    isStrictRadius: true,
    estimatedMinutesBase: 25,
    estimatedMinutesPerKm: 2.0,
    coveredNeighborhoods: ['بەختیاری', 'ئاشتی', 'عەنکاوە', 'دریک سیتی', 'شۆڕش', 'وەزیران', 'گەڕەکی زانکۆ', 'تەیراوە', 'ئیسکان'],
    deliveryAvailabilityNote: 'گەیاندنی خێرا لە ٠ کم تا ١٢ کم بۆ خواردنی گەرم'
  },
  market: {
    minDistanceKm: 0,
    maxDistanceKm: 15,
    baseFee: 3000,
    baseDistanceThresholdKm: 4,
    perKmExtraFee: 200,
    freeDeliveryThreshold: 60000,
    isStrictRadius: true,
    estimatedMinutesBase: 30,
    estimatedMinutesPerKm: 1.8,
    coveredNeighborhoods: ['سەهۆڵەکە', 'باخی گشتی', 'تووی مەلیك', 'ئیبراھیم ئەحمەد', 'قڕگە', 'سەرچنار', 'ڕاپەڕین', 'کوردسات'],
    deliveryAvailabilityNote: 'گەیاندنی پێداویستی ماڵ لە ٠ کم تا ١٥ کم'
  },
  fresh_meat: {
    minDistanceKm: 0,
    maxDistanceKm: 18,
    baseFee: 3000,
    baseDistanceThresholdKm: 3,
    perKmExtraFee: 250,
    freeDeliveryThreshold: 50000,
    isStrictRadius: true,
    estimatedMinutesBase: 30,
    estimatedMinutesPerKm: 2.0,
    coveredNeighborhoods: ['مەڵکەندی', 'چوارباخ', 'تەوێڵە', 'عەقاری', 'سەرشەقام', 'کوردسات', 'هەواری شار'],
    deliveryAvailabilityNote: 'گەیاندنی تایبەت بە ساردکەرەوە لە ٠ کم تا ١٨ کم'
  },
  fruits_vegetables: {
    minDistanceKm: 0,
    maxDistanceKm: 20,
    baseFee: 2500,
    baseDistanceThresholdKm: 3,
    perKmExtraFee: 200,
    freeDeliveryThreshold: 40000,
    isStrictRadius: true,
    estimatedMinutesBase: 25,
    estimatedMinutesPerKm: 2.0,
    coveredNeighborhoods: ['ناوبازاڕ', 'کۆمەڵگەی بەردەڕەش', 'گەڕەکی ڕۆشنبیری', 'گەڕەکی ئاشتی', 'دارەتوو'],
    deliveryAvailabilityNote: 'گەیاندنی میوە و سەوزەی تازە لە ٠ کم تا ٢٠ کم'
  },
  dairy: {
    minDistanceKm: 0,
    maxDistanceKm: 16,
    baseFee: 2500,
    baseDistanceThresholdKm: 3,
    perKmExtraFee: 200,
    freeDeliveryThreshold: 40000,
    isStrictRadius: true,
    estimatedMinutesBase: 25,
    estimatedMinutesPerKm: 1.8,
    coveredNeighborhoods: ['گوڵان', 'مەنتکاوە', 'تەیراوە', 'ئیسکان', 'بەحرکە', 'شەقامی ١٠٠ مەتری'],
    deliveryAvailabilityNote: 'گەیاندنی بەرهەمی شیرەمەنی سروشتی لە ٠ کم تا ١٦ کم'
  },
  clothes: {
    minDistanceKm: 0,
    maxDistanceKm: 35,
    baseFee: 3500,
    baseDistanceThresholdKm: 5,
    perKmExtraFee: 150,
    freeDeliveryThreshold: 80000,
    isStrictRadius: false,
    estimatedMinutesBase: 45,
    estimatedMinutesPerKm: 1.5,
    coveredNeighborhoods: ['کەی ئاڕ ئۆ', 'ماسیكێ', 'نزارکێ', 'شاخکێ', 'سەرهەڵدان', 'مەلتە', 'سەنتەری دهۆک'],
    deliveryAvailabilityNote: 'گەیاندنی جلوبەرگ لە ٠ کم تا ٣٥ کم'
  },
  electronics: {
    minDistanceKm: 0,
    maxDistanceKm: 50,
    baseFee: 4000,
    baseDistanceThresholdKm: 5,
    perKmExtraFee: 150,
    freeDeliveryThreshold: 150000,
    isStrictRadius: false,
    estimatedMinutesBase: 40,
    estimatedMinutesPerKm: 1.2,
    coveredNeighborhoods: ['سەنتەری شار', 'قەڵات', 'شەقامی ٤٠ مەتری', 'شەقامی ١٠٠ مەتری', 'کەسنەزان', 'پیرمام'],
    deliveryAvailabilityNote: 'گەیاندنی پارێزراوی ئامێر و مۆبایل لە ٠ کم تا ٥٠ کم'
  },
  beauty: {
    minDistanceKm: 0,
    maxDistanceKm: 30,
    baseFee: 3000,
    baseDistanceThresholdKm: 4,
    perKmExtraFee: 200,
    freeDeliveryThreshold: 75000,
    isStrictRadius: false,
    estimatedMinutesBase: 35,
    estimatedMinutesPerKm: 1.5,
    coveredNeighborhoods: ['ئیمپایەر وۆڕڵد', 'فرۆکەخانە', 'گوندی ئیتاڵی', 'گوندی لوبنانی', 'ماس سیتی', 'شاری خەونەکان'],
    deliveryAvailabilityNote: 'گەیاندنی بۆن و مکیاژ لە ٠ کم تا ٣٠ کم'
  }
};

export const CITY_NEIGHBORHOOD_DISTANCES: Record<string, { name: string; approxKm: number }[]> = {
  'Erbil (هەولێر)': [
    { name: 'بەختیاری (Bakhtiyari)', approxKm: 2.5 },
    { name: 'عەنکاوە (Ainkawa)', approxKm: 4.0 },
    { name: 'دریک سیتی (Dream City)', approxKm: 3.2 },
    { name: 'ئاشتی (Ashti)', approxKm: 3.8 },
    { name: 'شۆڕش (Shorish)', approxKm: 4.5 },
    { name: 'وەزیران (Waziran)', approxKm: 2.0 },
    { name: 'ئیمپایەر وۆڕڵد (Empire World)', approxKm: 5.0 },
    { name: 'گەڕەکی زانکۆ (Zanko)', approxKm: 6.2 },
    { name: 'شەقامی ٦٠ مەتری (60m Street)', approxKm: 3.0 },
    { name: 'شەقامی ١٠٠ مەتری (100m Street)', approxKm: 5.5 },
    { name: 'بەحرکە (Baharka)', approxKm: 11.0 },
    { name: 'کەسنەزان (Kasnazan)', approxKm: 14.5 },
    { name: 'پیرمام / سەلاحەدین (Pirmam)', approxKm: 22.0 },
  ],
  'Sulaymaniyah (سلێمانی)': [
    { name: 'سەهۆڵەکە / سالم (Salim St)', approxKm: 1.5 },
    { name: 'باخی گشتی (Public Park)', approxKm: 2.0 },
    { name: 'مەڵکەندی (Malkandi)', approxKm: 2.5 },
    { name: 'تووی مەلیك (Tuwi Malik)', approxKm: 3.5 },
    { name: 'ئیبراھیم ئەحمەد (Ibrahim Ahmad)', approxKm: 4.2 },
    { name: 'سەرچنار (Sarchnar)', approxKm: 5.8 },
    { name: 'قڕگە (Qrga)', approxKm: 6.5 },
    { name: 'ڕاپەڕین (Raperin)', approxKm: 8.0 },
    { name: 'کوردسات (Kurdsat)', approxKm: 4.8 },
    { name: 'هەواری شار (Hawari Shar)', approxKm: 9.5 },
    { name: 'تاسڵوجە (Tasluja)', approxKm: 16.0 },
  ],
  'Duhok (دهۆک)': [
    { name: 'کەی ئاڕ ئۆ (KRO)', approxKm: 2.0 },
    { name: 'ناوبازاڕ (City Center)', approxKm: 1.5 },
    { name: 'ماسیكێ (Masike)', approxKm: 3.5 },
    { name: 'نزارکێ (Nizarqe)', approxKm: 4.0 },
    { name: 'شاخکێ (Shakhke)', approxKm: 5.0 },
    { name: 'سەرهەڵدان (Sarhaldan)', approxKm: 4.2 },
    { name: 'مەلتە (Malta)', approxKm: 6.0 },
    { name: 'سێمێل (Semel)', approxKm: 14.0 },
  ],
  'Bardarash (بەردەڕەش)': [
    { name: 'ناوبازاڕ (Central)', approxKm: 1.0 },
    { name: 'کۆمەڵگەی بەردەڕەش (Bardarash Complex)', approxKm: 2.5 },
    { name: 'گەڕەکی ڕۆشنبیری (Roshnbiri)', approxKm: 2.0 },
    { name: 'گەڕەکی ئاشتی (Ashti)', approxKm: 3.0 },
    { name: 'دارەتوو (Daratu)', approxKm: 7.5 },
    { name: 'ڕۆڤیا (Rovia)', approxKm: 15.0 },
  ],
  'Kirkuk (کەرکووک)': [
    { name: 'ڕەحیماوا (Rahimawa)', approxKm: 3.0 },
    { name: 'شۆڕیجە (Shorija)', approxKm: 2.5 },
    { name: 'ئازادی (Azadi)', approxKm: 4.0 },
    { name: 'قادسیە (Qadisiya)', approxKm: 5.5 },
  ],
  'Zakho (زاخۆ)': [
    { name: 'پردی دەلال (Delal Bridge)', approxKm: 1.5 },
    { name: 'بێدارۆ (Bedaro)', approxKm: 3.0 },
    { name: 'شەعبانیە (Shabaniya)', approxKm: 4.5 },
  ],
  'Halabja (هەڵەبجە)': [
    { name: 'سەنتەری هەڵەبجە (Center)', approxKm: 1.5 },
    { name: 'سیروان (Sirwan)', approxKm: 6.0 },
    { name: 'عەنەب (Anab)', approxKm: 4.0 },
  ],
  'Soran (سۆران)': [
    { name: 'دیانا (Diana)', approxKm: 2.5 },
    { name: 'ناوبازاڕ (Bazaar)', approxKm: 1.0 },
    { name: 'خەلیفان (Khalifan)', approxKm: 12.0 },
  ]
};

export function getDefaultDeliveryZone(category: ProductCategory): DeliveryZoneSettings {
  if (category === 'cars') {
    // Return empty fallback (not used for cars)
    return {
      minDistanceKm: 0,
      maxDistanceKm: 0,
      baseFee: 0,
      baseDistanceThresholdKm: 0,
      perKmExtraFee: 0,
      isStrictRadius: false,
      estimatedMinutesBase: 0,
      estimatedMinutesPerKm: 0,
      coveredNeighborhoods: []
    };
  }
  return CATEGORY_DELIVERY_DEFAULTS[category] || CATEGORY_DELIVERY_DEFAULTS.food;
}

export function calculateDeliveryFee({
  seller,
  distanceKm,
  subtotal
}: {
  seller?: SellerProfile | null;
  distanceKm: number;
  subtotal: number;
}): DeliveryCalculationResult {
  const zone: DeliveryZoneSettings = seller?.deliveryZone || (seller?.category ? getDefaultDeliveryZone(seller.category) : CATEGORY_DELIVERY_DEFAULTS.food);

  const roundedDistance = Math.max(0.1, Number(distanceKm.toFixed(1)));
  const isWithinRadius = roundedDistance <= zone.maxDistanceKm && roundedDistance >= (zone.minDistanceKm || 0);

  // Check free delivery threshold
  const isFreeDelivery = !!zone.freeDeliveryThreshold && zone.freeDeliveryThreshold > 0 && subtotal >= zone.freeDeliveryThreshold;

  let deliveryFee = 0;
  let extraFee = 0;

  if (isFreeDelivery) {
    deliveryFee = 0;
  } else {
    // Base fee
    deliveryFee = zone.baseFee;
    
    // Extra distance calculation
    if (roundedDistance > zone.baseDistanceThresholdKm) {
      const extraKm = roundedDistance - zone.baseDistanceThresholdKm;
      extraFee = Math.round(extraKm * zone.perKmExtraFee);
      deliveryFee += extraFee;
    }

    // Out of radius surcharge if not strict
    if (!isWithinRadius && !zone.isStrictRadius) {
      const outDistance = roundedDistance - zone.maxDistanceKm;
      const surcharge = Math.round(outDistance * (zone.perKmExtraFee * 1.5));
      extraFee += surcharge;
      deliveryFee += surcharge;
    }
  }

  // Estimated delivery time
  const calculatedMinutes = Math.round(zone.estimatedMinutesBase + (roundedDistance * zone.estimatedMinutesPerKm));
  const estimatedMinutes = Math.max(15, Math.min(120, calculatedMinutes));

  let statusText = '';
  let statusType: 'in_range' | 'warning' | 'out_of_range' = 'in_range';

  if (isWithinRadius) {
    statusType = 'in_range';
    statusText = `لە سنوری ڕێپێدراوی گەیاندندایە (${zone.minDistanceKm} - ${zone.maxDistanceKm} کم)`;
  } else if (!zone.isStrictRadius) {
    statusType = 'warning';
    statusText = `لە دەرەوەی سنوری ئاساییە (${zone.maxDistanceKm} کم)، نرخی گەیاندنی زیادە هەژمارکراوە`;
  } else {
    statusType = 'out_of_range';
    statusText = `لە دەرەوەی سنوری گەیاندنی ئەم فرۆشگایەیە (تەنها لە ٠ تا ${zone.maxDistanceKm} کم دەگەیەنێت)`;
  }

  return {
    deliveryFee,
    isWithinRadius,
    isFreeDelivery,
    estimatedMinutes,
    statusText,
    statusType,
    feeBreakdown: {
      baseFee: zone.baseFee,
      extraFee,
      distanceKm: roundedDistance,
      thresholdKm: zone.baseDistanceThresholdKm
    }
  };
}
