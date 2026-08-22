import { ProductCategory, Product } from '../types';

export interface CategoryFieldConfig {
  category: ProductCategory;
  labelKurdish: string;
  description: string;
  iconName: string;
  color: string;
  fields: {
    name: keyof Product | string;
    label: string;
    type: 'text' | 'number' | 'select' | 'tags' | 'colors' | 'boolean' | 'specs' | 'textarea';
    required?: boolean;
    placeholder?: string;
    options?: { label: string; value: string | number }[];
    helperText?: string;
    min?: number;
    max?: number;
    presets?: string[];
  }[];
}

export const CLOTHES_SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '30', '32', '34', '36', '38', '40', '42', '44'];

export const POPULAR_COLORS = [
  { name: 'ڕەش (Black)', hex: '#111827', value: 'ڕەش / Black' },
  { name: 'سپی (White)', hex: '#FFFFFF', border: true, value: 'سپی / White' },
  { name: 'شین (Blue)', hex: '#2563EB', value: 'شین / Blue' },
  { name: 'سوور (Red)', hex: '#DC2626', value: 'سوور / Red' },
  { name: 'سەوز (Green)', hex: '#16A34A', value: 'سەوز / Green' },
  { name: 'خۆڵەمێشی (Grey)', hex: '#64748B', value: 'خۆڵەمێشی / Grey' },
  { name: 'خاکی / بەژ (Beige)', hex: '#D4B996', value: 'خاکی / Beige' },
  { name: 'قاوەیی (Brown)', hex: '#78350F', value: 'قاوەیی / Brown' },
  { name: 'شینی تۆخ (Navy)', hex: '#1E3A8A', value: 'نیڤی / Navy' },
  { name: 'زەرد (Yellow)', hex: '#FACC15', value: 'زەرد / Yellow' },
  { name: 'پەمەیی (Pink)', hex: '#EC4899', value: 'پەمەیی / Pink' }
];

export const CAR_BRAND_PRESETS = [
  'Toyota (تۆیۆتا)',
  'Mercedes-Benz (مێرسیدس)',
  'BMW (بی ئێم دەبلیو)',
  'Hyundai (هیۆندای)',
  'Kia (کیا)',
  'Nissan (نیسان)',
  'Chevrolet (شێفرۆلێت)',
  'Ford (فۆرد)',
  'Lexus (لێکسس)',
  'Audi (ئۆدی)',
  'Land Rover (لاند ڕۆڤەر)',
  'Jeep (جیپ)',
  'GMC (جی ئێم سی)',
  'Volkswagen (فۆڵکسڤاگن)',
  'Chery (چیری)',
  'MG (ئێم جی)',
  'Dodge (دۆج)',
  'Cadillac (کادیلاک)'
];

export const ELECTRONICS_BRAND_PRESETS = [
  'Apple (ئەپڵ)',
  'Samsung (سامسۆنگ)',
  'Sony (سۆنی)',
  'Xiaomi (شیاومی)',
  'Anker (ئەنکەر)',
  'Huawei (هواوی)',
  'Dell (دێڵ)',
  'HP (ئێچ پی)',
  'Lenovo (لینۆڤۆ)',
  'Asus (ئەسوس)',
  'LG (ئێڵ جی)',
  'JBL (جەی بی ئێڵ)',
  'Bose (بۆس)',
  'PlayStation (پلەیستەیشن)',
  'Xbox (ئێکس بۆکس)',
  'Nintendo (نینتێندۆ)'
];

export const BEAUTY_BRAND_PRESETS = [
  'L\'Oreal Paris',
  'Maybelline New York',
  'The Ordinary',
  'CeraVe',
  'La Roche-Posay',
  'MAC Cosmetics',
  'Huda Beauty',
  'KIKO Milano',
  'Clinique',
  'Estee Lauder',
  'Neutrogena',
  'Garnier',
  'Dior Beauty',
  'Chanel Beauty'
];

export const CATEGORY_FIELD_CONFIGS: Record<ProductCategory, CategoryFieldConfig> = {
  clothes: {
    category: 'clothes',
    labelKurdish: 'جلوبەرگ و پۆشاک',
    description: 'قەبارە (Sizes)، ڕەنگەکان (Colors)، براند، قوماش و ڕەگەز',
    iconName: 'Shirt',
    color: 'purple',
    fields: [
      {
        name: 'sizes',
        label: 'قەبارەکانی بەردەست (Sizes) *',
        type: 'tags',
        required: true,
        placeholder: 'قەبارە بنووسە یان کلیک لەسەر پێشنیارەکان بکە...',
        presets: CLOTHES_SIZE_PRESETS,
        helperText: 'نموونە: S, M, L, XL یان قەبارەی پانتۆڵ 32, 34'
      },
      {
        name: 'colors',
        label: 'ڕەنگەکانی بەردەست (Colors) *',
        type: 'colors',
        required: true,
        helperText: 'ڕەنگە بەردەستەکانی ئەم مۆدێلە دیاریبکە'
      },
      {
        name: 'brand',
        label: 'براند (Brand)',
        type: 'text',
        placeholder: 'وەک: Zara, Nike, Adidas, LC Waikiki, Mango...'
      },
      {
        name: 'gender',
        label: 'ڕەگەز (Target Gender)',
        type: 'select',
        options: [
          { label: 'پیاوان (Men)', value: 'men' },
          { label: 'ئافرەتان (Women)', value: 'women' },
          { label: 'منداڵان (Kids)', value: 'kids' },
          { label: 'هاوبەش بۆ هەردووکیان (Unisex)', value: 'unisex' }
        ]
      },
      {
        name: 'material',
        label: 'جۆری قوماش یان کەرەستە (Material)',
        type: 'text',
        placeholder: 'وەک: ١٠٠٪ لۆکە (Cotton)، جینز، پێستی سروشتی، کەتان...'
      }
    ]
  },

  electronics: {
    category: 'electronics',
    labelKurdish: 'ئەلیکترۆنیات و تەکنەلۆجیا',
    description: 'براند (Brand)، مۆدێل (Model)، گارانتی و تایبەتمەندییە تەکنیکییەکان (Specs)',
    iconName: 'Smartphone',
    color: 'blue',
    fields: [
      {
        name: 'brand',
        label: 'براند و کۆمپانیا (Brand) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: Apple, Samsung, Sony, Xiaomi...',
        presets: ELECTRONICS_BRAND_PRESETS
      },
      {
        name: 'model',
        label: 'مۆدێلی ئامێر (Model) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: iPhone 15 Pro Max, Galaxy S24 Ultra, PS5 Slim, AirPods Pro 2...'
      },
      {
        name: 'warrantyMonths',
        label: 'ماوەی گارانتی (بە مانگ)',
        type: 'number',
        min: 0,
        max: 60,
        placeholder: '١٢'
      },
      {
        name: 'colors',
        label: 'ڕەنگەکانی بەردەست (Colors)',
        type: 'colors',
        helperText: 'ڕەنگە بەردەستەکانی ئامێرەکە دیاریبکە (وەک: ڕەش، تیتانیۆم، زیوی...)'
      },
      {
        name: 'specs',
        label: 'تایبەتمەندییە تەکنیکییەکان (Technical Specifications)',
        type: 'specs',
        helperText: 'وەک میمۆری، ڕام، باتری، شاشە، پڕۆسێسەر...'
      }
    ]
  },

  cars: {
    category: 'cars',
    labelKurdish: 'ئۆتۆمبێل و ماتۆڕ',
    description: 'براند/کۆمپانیا، مۆدێل، ساڵی دروستکردن (Year)، کیلۆمەتری ڕۆیشتوو (Mileage)، گێڕ و سووتەمەنی',
    iconName: 'Car',
    color: 'amber',
    fields: [
      {
        name: 'brand',
        label: 'کۆمپانیا / براند (Make / Brand) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: Toyota, Mercedes-Benz, BMW, Hyundai, Kia...',
        presets: CAR_BRAND_PRESETS
      },
      {
        name: 'model',
        label: 'مۆدێل (Model) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: Land Cruiser, Camry, Tucson, Elantra, C200, Patrol...'
      },
      {
        name: 'year',
        label: 'ساڵی دروستکردن (Model Year) *',
        type: 'number',
        required: true,
        min: 1980,
        max: new Date().getFullYear() + 1,
        placeholder: `${new Date().getFullYear()}`
      },
      {
        name: 'mileageKm',
        label: 'کیلۆمەتری ڕۆیشتوو (Mileage in KM) *',
        type: 'number',
        required: true,
        min: 0,
        max: 2000000,
        placeholder: '٤٥٠٠٠'
      },
      {
        name: 'transmission',
        label: 'جۆری گێڕ (Transmission) *',
        type: 'select',
        required: true,
        options: [
          { label: 'ئۆتۆماتیک (Automatic)', value: 'automatic' },
          { label: 'عادی / دەستی (Manual)', value: 'manual' }
        ]
      },
      {
        name: 'fuelType',
        label: 'جۆری سووتەمەنی (Fuel Type)',
        type: 'select',
        options: [
          { label: 'بەنزین (Gasoline)', value: 'gasoline' },
          { label: 'هایبرید / تێکەڵە (Hybrid)', value: 'hybrid' },
          { label: 'کارەبایی (Electric)', value: 'electric' },
          { label: 'گاز / دیزڵ (Diesel)', value: 'diesel' }
        ]
      },
      {
        name: 'colors',
        label: 'ڕەنگی دەرەوە (Exterior Color)',
        type: 'colors',
        helperText: 'ڕەنگی ئۆتۆمبێلەکە دیاریبکە'
      }
    ]
  },

  food: {
    category: 'food',
    labelKurdish: 'خواردن و ڕێستۆرانت',
    description: 'کاتی ئامادەکردن (Prep Time)، پێکهاتەکان (Ingredients)، تیژی و گیاخۆری',
    iconName: 'Utensils',
    color: 'orange',
    fields: [
      {
        name: 'prepTimeMinutes',
        label: 'کاتی خەمڵێنراو بۆ ئامادەکردن (بە خولەک)',
        type: 'number',
        min: 5,
        max: 180,
        placeholder: '٢٠'
      },
      {
        name: 'ingredients',
        label: 'پێکهاتە و دەرمانەکانی خواردن (Ingredients)',
        type: 'tags',
        placeholder: 'پێکهاتە بنووسە و ئینتەر بکە (وەک: گۆشتی بەرخ، قارچک، پەنیری مۆزارێلا...)',
        presets: ['گۆشتی بەرخ', 'سنگی مریشک', 'پەنیری مۆزارێلا', 'پیاز و سڵاتە', 'بەهاراتی تایبەت', 'سۆسی سیر', 'کەرە و زەیتوون', 'قارچک']
      },
      {
        name: 'isSpicy',
        label: 'ئایا ئەم خواردنە تیژە؟ (Spicy)',
        type: 'boolean',
        helperText: 'نیشان بدە کە خواردنەکە تیژ یان پڕ بەهاراتە'
      },
      {
        name: 'isVegetarian',
        label: 'ئایا خواردنی گیاخۆرییە؟ (Vegetarian)',
        type: 'boolean',
        helperText: 'بێ بەکارهێنانی گۆشت ئامادەکراوە'
      }
    ]
  },

  fresh_meat: {
    category: 'fresh_meat',
    labelKurdish: 'گۆشتی تازە و سەربڕاو',
    description: 'جۆری ئاژەڵ، پارچەی گۆشت (Cut)، سەرچاوەی سەربڕین و کێش',
    iconName: 'Beef',
    color: 'rose',
    fields: [
      {
        name: 'meatType',
        label: 'جۆری گۆشت (Meat Type) *',
        type: 'select',
        required: true,
        options: [
          { label: 'گۆشتی بەرخی خۆماڵی (Lamb)', value: 'lamb' },
          { label: 'گۆشتی گوێرەکە / مانگا (Beef)', value: 'beef' },
          { label: 'مریشکی تازەی سەربڕاو (Fresh Chicken)', value: 'chicken' },
          { label: 'گۆشتی قەل و پەلەوەر (Turkey/Poultry)', value: 'turkey' },
          { label: 'ماسی تازەی روبار (Fresh Fish)', value: 'fish' }
        ]
      },
      {
        name: 'cutType',
        label: 'بەش / پارچەی گۆشت (Cut / Part) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: ڕان (Leg)، پەراسو (Ribs)، فیلیە، دەست، تیکە بۆ کەباب، گۆشتی هاڕاو...'
      },
      {
        name: 'origin',
        label: 'سەرچاوە و سەربڕین (Origin)',
        type: 'text',
        placeholder: 'وەک: سەربڕاوی تازەی ناوخۆ بەردەڕەش / هەولێر (حەڵاڵ)'
      },
      {
        name: 'weight',
        label: 'کێشی هەر دانەیەک یان پاکێجێک',
        type: 'text',
        placeholder: 'وەک: ١ کیلۆگرام، ٥٠٠ گرام، نیو لاشە...'
      }
    ]
  },

  fruits_vegetables: {
    category: 'fruits_vegetables',
    labelKurdish: 'میوە و سەوزەی تازە',
    description: 'سەرچاوە و شوێنی بەرهەمهێنان (Origin)، کێش و ئۆرگانیک',
    iconName: 'Apple',
    color: 'emerald',
    fields: [
      {
        name: 'origin',
        label: 'سەرچاوە و بەرهەم (Origin)',
        type: 'text',
        placeholder: 'وەک: خۆماڵی کوردستانی (پێنجوێن، شارەزوور، بەردەڕەش)، هاوردە (تورکیا)...'
      },
      {
        name: 'isOrganic',
        label: 'ئایا ئەم بەرهەمە ١٠٠٪ ئۆرگانیک و سروشتییە؟',
        type: 'boolean',
        helperText: 'بێ دەرمان و کیمیایی قەدەغەکراو بەرهەمهاتووە'
      },
      {
        name: 'unit',
        label: 'یەکەی پێوانە (Unit)',
        type: 'select',
        options: [
          { label: 'کیلۆگرام (Kg)', value: 'کیلۆگرام' },
          { label: 'سندووق / کارتۆن (Box)', value: 'سندووق' },
          { label: 'دەسک (Bundle)', value: 'دەسک' },
          { label: 'دانە (Piece)', value: 'دانە' }
        ]
      }
    ]
  },

  dairy: {
    category: 'dairy',
    labelKurdish: 'شیرەمەنی و ماست',
    description: 'ماوەی بەسەرچوون (Expiry)، ڕێژەی چەوری، سەرچاوە و جۆری بەرهەم',
    iconName: 'Milk',
    color: 'cyan',
    fields: [
      {
        name: 'expiryInfo',
        label: 'ماوەی بەسەرچوون و پاراستن (Shelf Life / Expiry) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: ٥ ڕۆژ لە ساردکەرەوە، تا ١٠ ڕۆژ بەستوو...'
      },
      {
        name: 'fatPercentage',
        label: 'ڕێژەی چەوری (Fat Content)',
        type: 'select',
        options: [
          { label: 'چەوری تەواو و سروشتی (Full Fat)', value: 'full_fat' },
          { label: 'نیوە چەوری (Medium Fat)', value: 'medium_fat' },
          { label: 'کەم چەوری (Low Fat)', value: 'low_fat' },
          { label: 'بێ چەوری (Skimmed)', value: 'skimmed' }
        ]
      },
      {
        name: 'origin',
        label: 'سەرچاوەی شیر و ماست (Origin)',
        type: 'text',
        placeholder: 'وەک: ماستی مەڕی خۆماڵی بەردەڕەش، شیری فڕێشی هەولێر...'
      }
    ]
  },

  beauty: {
    category: 'beauty',
    labelKurdish: 'جوانی، مکیاج و چاودێری',
    description: 'براند (Brand)، جۆری پێست (Skin Type)، قەبارە (Volume) و بەسەرچوون',
    iconName: 'Sparkles',
    color: 'pink',
    fields: [
      {
        name: 'brand',
        label: 'براند و کۆمپانیا (Brand) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: The Ordinary, CeraVe, Maybelline, MAC...',
        presets: BEAUTY_BRAND_PRESETS
      },
      {
        name: 'skinType',
        label: 'گونجاو بۆ جۆری پێست (Suitable Skin Type)',
        type: 'select',
        options: [
          { label: 'سەرجەم جۆرەکانی پێست (All Skin Types)', value: 'all' },
          { label: 'پێستی چەور (Oily Skin)', value: 'oily' },
          { label: 'پێستی وشک (Dry Skin)', value: 'dry' },
          { label: 'پێستی هەستیار (Sensitive Skin)', value: 'sensitive' },
          { label: 'پێستی تێکەڵ (Combination Skin)', value: 'combination' }
        ]
      },
      {
        name: 'volume',
        label: 'قەبارە یان کێش (Volume / Size)',
        type: 'text',
        placeholder: 'وەک: 50ml, 100ml, 30g, 200ml...'
      },
      {
        name: 'expiryInfo',
        label: 'ماوەی بەکارهێنان دوای کردنەوە (PAO)',
        type: 'text',
        placeholder: 'وەک: ١٢ مانگ دوای کردنەوە (12M)...'
      }
    ]
  },

  market: {
    category: 'market',
    labelKurdish: 'مارکێت و پێداویستی ڕۆژانە',
    description: 'براند، کێش/قەبارە، بەرواری بەسەرچوون و سەرچاوە',
    iconName: 'ShoppingBag',
    color: 'blue',
    fields: [
      {
        name: 'brand',
        label: 'براند (Brand)',
        type: 'text',
        placeholder: 'وەک: Nestle, Dano, Almarai, Lipton, Tide...'
      },
      {
        name: 'weight',
        label: 'کێش یان قەبارەی پاکێج (Weight / Volume)',
        type: 'text',
        placeholder: 'وەک: 800g, 1 Liter, 5 Kg, 24 Pieces...'
      },
      {
        name: 'expiryInfo',
        label: 'زانیاری یان بەرواری بەسەرچوون (Expiry Date)',
        type: 'text',
        placeholder: 'وەک: 2026/12 یان تا ساڵێک لە بەرواری بەرهەمهێنان...'
      },
      {
        name: 'origin',
        label: 'وڵاتی بەرهەمهێنەر (Country of Origin)',
        type: 'text',
        placeholder: 'وەک: تورکیا، ئەڵمانیا، بەریتانیا، عێراق، ئیمارات...'
      }
    ]
  }
};

/**
 * Validates dynamic category fields for a given product
 */
export function validateProductCategoryFields(
  category: ProductCategory,
  data: Partial<Product>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const config = CATEGORY_FIELD_CONFIGS[category];

  if (!config) return { isValid: true, errors: {} };

  // Common core validation
  if (!data.title || !data.title.trim()) {
    errors.title = 'ناوی کاڵا پێویستە.';
  } else if (data.title.trim().length < 2) {
    errors.title = 'ناوی کاڵا دەبێت لانیکەم ٢ پیت بێت.';
  }

  if (data.price === undefined || data.price === null || data.price <= 0) {
    errors.price = 'نرخی کاڵا دەبێت لە ٠ زیاتر بێت.';
  }

  if (data.stock === undefined || data.stock === null || data.stock < 0) {
    errors.stock = 'ژمارەی کاڵا لە کۆگا ناتوانێت کەمتر بێت لە ٠.';
  }

  if (data.discountPrice && data.discountPrice >= (data.price || 0)) {
    errors.discountPrice = 'نرخی داشکاندن دەبێت کەمتر بێت لە نرخی بنەڕەتی.';
  }

  // Category specific validation
  config.fields.forEach(field => {
    const val = (data as any)[field.name];

    if (field.required) {
      if (val === undefined || val === null || val === '') {
        errors[field.name] = `تکایە خانەی (${field.label}) پڕبکەرەوە.`;
      } else if (Array.isArray(val) && val.length === 0) {
        errors[field.name] = `تکایە لانیکەم دانەیەک دیاریبکە بۆ (${field.label}).`;
      }
    }

    // Number range validation
    if (field.type === 'number' && val !== undefined && val !== null && val !== '') {
      const numVal = Number(val);
      if (isNaN(numVal)) {
        errors[field.name] = `خانەی (${field.label}) دەبێت ژمارەی دروست بێت.`;
      } else {
        if (field.min !== undefined && numVal < field.min) {
          errors[field.name] = `خانەی (${field.label}) ناتوانێت کەمتر بێت لە ${field.min}.`;
        }
        if (field.max !== undefined && numVal > field.max) {
          errors[field.name] = `خانەی (${field.label}) ناتوانێت زیاتر بێت لە ${field.max}.`;
        }
      }
    }
  });

  // Specific rules
  if (category === 'cars') {
    if (data.year && (data.year < 1980 || data.year > new Date().getFullYear() + 1)) {
      errors.year = `ساڵی دروستکردن دەبێت لە نێوان 1980 بۆ ${new Date().getFullYear() + 1} بێت.`;
    }
    if (data.mileageKm !== undefined && data.mileageKm < 0) {
      errors.mileageKm = 'کیلۆمەتری ڕۆیشتوو ناتوانێت نەرێنی (کەمتر لە ٠) بێت.';
    }
  }

  if (category === 'clothes') {
    if (!data.sizes || data.sizes.length === 0) {
      errors.sizes = 'تکایە لانیکەم یەک قەبارە (Size) دیاریبکە.';
    }
    if (!data.colors || data.colors.length === 0) {
      errors.colors = 'تکایە لانیکەم یەک ڕەنگ (Color) دیاریبکە.';
    }
  }

  if (category === 'electronics') {
    if (!data.brand || !data.brand.trim()) {
      errors.brand = 'تکایە براندی ئامێرەکە بنووسە.';
    }
    if (!data.model || !data.model.trim()) {
      errors.model = 'تکایە مۆدێلی ئامێرەکە بنووسە.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
