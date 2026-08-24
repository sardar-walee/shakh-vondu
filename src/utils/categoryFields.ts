import { ProductCategory, Product } from '../types';

export interface CategoryFieldOption {
  label: string;
  value: string | number;
  labelEn?: string;
  labelAr?: string;
}

export interface CategoryFieldConfig {
  category: ProductCategory;
  labelKurdish: string;
  labelEn: string;
  labelAr: string;
  description: string;
  iconName: string;
  color: string;
  subcategories: { id: string; label: string; labelEn?: string; labelAr?: string }[];
  fields: {
    name: keyof Product | string;
    label: string;
    type: 'text' | 'number' | 'select' | 'tags' | 'colors' | 'boolean' | 'specs' | 'textarea';
    required?: boolean;
    placeholder?: string;
    options?: CategoryFieldOption[];
    helperText?: string;
    min?: number;
    max?: number;
    presets?: string[];
  }[];
}

export const CLOTHES_SIZE_PRESETS = [
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL',
  '28', '30', '32', '34', '36', '38', '40', '42', '44',
  '36 (Shoe)', '37 (Shoe)', '38 (Shoe)', '39 (Shoe)', '40 (Shoe)',
  '41 (Shoe)', '42 (Shoe)', '43 (Shoe)', '44 (Shoe)', '45 (Shoe)', '46 (Shoe)',
  'Free Size (قەبارەی ئازاد)'
];

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
  { name: 'پەمەیی (Pink)', hex: '#EC4899', value: 'پەمەیی / Pink' },
  { name: 'زێڕین (Gold)', hex: '#EAB308', value: 'زێڕین / Gold' },
  { name: 'زیوی (Silver)', hex: '#CBD5E1', value: 'زیوی / Silver' },
  { name: 'مۆر (Purple)', hex: '#9333EA', value: 'مۆر / Purple' },
  { name: 'پرتەقاڵی (Orange)', hex: '#EA580C', value: 'پرتەقاڵی / Orange' }
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
  'Land Rover / Range Rover (لاند ڕۆڤەر)',
  'Jeep (جیپ)',
  'GMC (جی ئێم سی)',
  'Volkswagen (فۆڵکسڤاگن)',
  'Chery (چیری)',
  'MG (ئێم جی)',
  'Dodge (دۆج)',
  'Cadillac (کادیلاک)',
  'Porsche (پۆڕشە)',
  'Honda (هۆندا)',
  'Mazda (مازدا)',
  'Mitsubishi (میتسوبیشی)',
  'Tesla (تێسلا)',
  'BYD (بی وای دی)',
  'Haval (هاڤاڵ)',
  'Geely (جیلی)',
  'Changan (چانگان)',
  'Suzuki (سوزوکی)'
];

export const CAR_BODY_TYPES = [
  { label: 'سێدان (Sedan)', value: 'sedan' },
  { label: 'ئێس یو ڤی / جیپ (SUV)', value: 'suv' },
  { label: 'کرۆس ئۆڤەر (Crossover)', value: 'crossover' },
  { label: 'هاچباک (Hatchback)', value: 'hatchback' },
  { label: 'کوپێ / سپۆرت (Coupe)', value: 'coupe' },
  { label: 'پیکاب (Pickup)', value: 'pickup' },
  { label: 'ڤان / مینی ڤان (Van)', value: 'van' },
  { label: 'کابریۆ / سەرباز (Convertible)', value: 'convertible' },
  { label: 'بارهەڵگر (Truck)', value: 'truck' }
];

export const CAR_DRIVETRAINS = [
  { label: 'چوار دەبڵ / فور ویل (4WD / 4x4)', value: '4WD' },
  { label: 'دەبڵ اکسلی هەمیشەیی (AWD)', value: 'AWD' },
  { label: 'تەنها پیشەوە (FWD)', value: 'FWD' },
  { label: 'تەنها دواوە (RWD)', value: 'RWD' }
];

export const CAR_PAINT_CONDITIONS = [
  { label: 'بۆیەی شەریکە / بێ بۆیاخ (Original Paint)', value: 'original_paint' },
  { label: 'بۆیاخی پارچەیی کەم (Partial Paint)', value: 'partial_paint' },
  { label: 'تەواو بۆیاخکراو (Full Paint)', value: 'full_paint' }
];

export const CAR_ACCIDENT_CONDITIONS = [
  { label: 'بێ لێدران و بێ ڕووداو (No Accident)', value: 'none' },
  { label: 'لێدرانی سووک / بێ کەلەپچە (Minor)', value: 'minor' },
  { label: 'لێدرانی ڕابردوو چاککراوەتەوە (Repaired)', value: 'major' }
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
  'Nintendo (نینتێندۆ)',
  'Canon (کانۆن)',
  'GoPro (گۆپرۆ)',
  'Dyson (دایسۆن)',
  'Philips (فیلیپس)'
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
  'Chanel Beauty',
  'Yves Saint Laurent',
  'NYX Professional',
  'Charlotte Tilbury',
  'Kérastase',
  'Olaplex'
];

export const GROCERY_BRAND_PRESETS = [
  'Nestle (نێستلە)',
  'Dano (دانۆ)',
  'Almarai (المراعي)',
  'Lipton (لیپتۆن)',
  'Tide (تاید)',
  'Ariel (ئاریێل)',
  'Pampers (پامپێرز)',
  'Nutella (نوتێلا)',
  'Kinder (کیندەر)',
  'Pepsi (پێپسی)',
  'Coca-Cola (کۆکاکۆلا)',
  'Pinar (پینار)',
  'Sütaş (سوتاش)',
  'Mahmood Rice (برنجی مەحموود)',
  'Altunsa (ئالتونسا)',
  'Zad (زاد)',
  'Zer (زێر)'
];

export const CATEGORY_FIELD_CONFIGS: Record<ProductCategory, CategoryFieldConfig> = {
  clothes: {
    category: 'clothes',
    labelKurdish: 'جلوبەرگ و پۆشاک',
    labelEn: 'Clothing & Fashion',
    labelAr: 'الملابس والأزياء',
    description: 'قەبارە (Sizes)، ڕەنگەکان (Colors)، براند، قوماش، ستایل و ڕەگەز',
    iconName: 'Shirt',
    color: 'purple',
    subcategories: [
      { id: 'men_shirts', label: 'کراس و تی شێرتی پیاوان', labelEn: 'Men Shirts', labelAr: 'قمصان وتيشيرتات رجالية' },
      { id: 'men_pants', label: 'پانتۆڵ و جینزی پیاوان', labelEn: 'Men Pants & Jeans', labelAr: 'بناطيل رجالية' },
      { id: 'women_dresses', label: 'جلوبەرگ و عەزیەی ئافرەتان', labelEn: 'Women Dresses', labelAr: 'فساتين نسائية' },
      { id: 'women_tops', label: 'تی شێرت و بۆدی ئافرەتان', labelEn: 'Women Tops', labelAr: 'بلايز نسائية' },
      { id: 'kids_wear', label: 'پۆشاکی منداڵان', labelEn: 'Kids Fashion', labelAr: 'أزياء أطفال' },
      { id: 'shoes', label: 'پێڵاو و پێڵاوی وەرزشی', labelEn: 'Shoes & Sneakers', labelAr: 'أحذية وأحذية رياضية' },
      { id: 'bags_accessories', label: 'جانتا، پشتێن و ئێکسسوارات', labelEn: 'Bags & Accessories', labelAr: 'حقائب وإكسسوارات' },
      { id: 'jackets_coats', label: 'چاکەت و قەمسەڵە', labelEn: 'Jackets & Coats', labelAr: 'جاكيتات ومعاطف' },
      { id: 'traditional', label: 'جلوبەرگی کوردی و نەریتی', labelEn: 'Traditional Kurdish Clothes', labelAr: 'أزياء كوردية تقليدية' }
    ],
    fields: [
      {
        name: 'sizes',
        label: 'قەبارەکانی بەردەست (Sizes) *',
        type: 'tags',
        required: true,
        placeholder: 'قەبارە بنووسە یان کلیک لەسەر پێشنیارەکان بکە...',
        presets: CLOTHES_SIZE_PRESETS,
        helperText: 'نموونە: S, M, L, XL یان قەبارەی پانتۆڵ 32, 34 یان پێڵاو 42'
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
        placeholder: 'وەک: Zara, Nike, Adidas, LC Waikiki, Mango, H&M, Puma...'
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
        placeholder: 'وەک: ١٠٠٪ لۆکە (Cotton)، جینز (Denim)، پێستی سروشتی، کەتان، ئاوریشم...'
      },
      {
        name: 'fit',
        label: 'شێوازی لەبەرکردن (Fit Style)',
        type: 'select',
        options: [
          { label: 'ئاسایی (Regular Fit)', value: 'regular' },
          { label: 'تەسک (Slim Fit)', value: 'slim' },
          { label: 'فراوان و ئازاد (Oversized / Relaxed)', value: 'oversized' },
          { label: 'تایبەت (Custom / Tailored)', value: 'custom' }
        ]
      },
      {
        name: 'season',
        label: 'وەرز (Season)',
        type: 'select',
        options: [
          { label: 'چوار وەرزە (All Seasons)', value: 'all_season' },
          { label: 'هاوینە (Summer)', value: 'summer' },
          { label: 'زستانە (Winter)', value: 'winter' },
          { label: 'بەهار و پایز (Spring/Autumn)', value: 'spring_autumn' }
        ]
      }
    ]
  },

  electronics: {
    category: 'electronics',
    labelKurdish: 'ئەلیکترۆنیات و تەکنەلۆجیا',
    labelEn: 'Electronics & Gadgets',
    labelAr: 'الإلكترونيات والتكنولوجيا',
    description: 'براند، مۆدێل، گارانتی، ڕام، میمۆری و تایبەتمەندییە تەکنیکییەکان (Specs)',
    iconName: 'Smartphone',
    color: 'blue',
    subcategories: [
      { id: 'smartphones', label: 'مۆبایلی زیرەک (Smartphones)', labelEn: 'Smartphones', labelAr: 'هواتف ذكية' },
      { id: 'tablets_ipads', label: 'تابلێت و ئایپاد (Tablets)', labelEn: 'Tablets', labelAr: 'أجهزة لوحية' },
      { id: 'laptops_pcs', label: 'لاپتۆپ و کۆمپیوتەر (Laptops & PC)', labelEn: 'Laptops & Computers', labelAr: 'لابتوبات وحواسيب' },
      { id: 'smartwatches', label: 'کاتژمێری زیرەک و وەرزشی', labelEn: 'Smartwatches', labelAr: 'ساعات ذكية' },
      { id: 'audio_headphones', label: 'هێدفۆن، سپیکەر و هێدستی بێوایەر', labelEn: 'Headphones & Audio', labelAr: 'سماعات وصوتيات' },
      { id: 'tvs_monitors', label: 'تەلەفزیۆنی زیرەک و مۆنیتەر', labelEn: 'Smart TVs & Monitors', labelAr: 'شاشات وتلفزيونات' },
      { id: 'gaming', label: 'کۆنسۆڵی یاری و ئێکسسواراتی گەیمینگ', labelEn: 'Gaming Consoles & Gear', labelAr: 'أجهزة ألعاب وملحقاتها' },
      { id: 'chargers_accessories', label: 'بارگاوی کەرەوە، کەیبڵ و پاوەربانک', labelEn: 'Chargers & Powerbanks', labelAr: 'شواحن وبنوك طاقة' }
    ],
    fields: [
      {
        name: 'brand',
        label: 'براند و کۆمپانیا (Brand) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: Apple, Samsung, Sony, Xiaomi, Asus...',
        presets: ELECTRONICS_BRAND_PRESETS
      },
      {
        name: 'model',
        label: 'مۆدێلی تەواوی ئامێر (Model) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: iPhone 15 Pro Max, Galaxy S24 Ultra, MacBook Pro M3, PS5...'
      },
      {
        name: 'condition',
        label: 'دۆخی ئامێر (Condition)',
        type: 'select',
        options: [
          { label: 'نوێی کارتۆن نەکراوە (Brand New Sealed)', value: 'new' },
          { label: 'بەکارهاتووی زۆر پاک (Used - Like New)', value: 'used_like_new' },
          { label: 'بەکارهاتووی ئاسایی (Used - Good)', value: 'used_good' },
          { label: 'نوێکراوەتەوە بە گارانتی (Refurbished)', value: 'refurbished' }
        ]
      },
      {
        name: 'storageCapacity',
        label: 'قەبارەی میمۆری / بیرگە (Storage)',
        type: 'select',
        options: [
          { label: '128 GB', value: '128GB' },
          { label: '256 GB', value: '256GB' },
          { label: '512 GB', value: '512GB' },
          { label: '1 TB', value: '1TB' },
          { label: '2 TB', value: '2TB' },
          { label: '64 GB', value: '64GB' },
          { label: '32 GB', value: '32GB' }
        ]
      },
      {
        name: 'ramSize',
        label: 'قەبارەی ڕام (RAM)',
        type: 'select',
        options: [
          { label: '8 GB RAM', value: '8GB' },
          { label: '12 GB RAM', value: '12GB' },
          { label: '16 GB RAM', value: '16GB' },
          { label: '32 GB RAM', value: '32GB' },
          { label: '6 GB RAM', value: '6GB' },
          { label: '4 GB RAM', value: '4GB' }
        ]
      },
      {
        name: 'warrantyMonths',
        label: 'ماوەی گارانتی فەرمی (بە مانگ)',
        type: 'number',
        min: 0,
        max: 60,
        placeholder: '١٢'
      },
      {
        name: 'colors',
        label: 'ڕەنگەکانی بەردەست (Colors)',
        type: 'colors',
        helperText: 'ڕەنگە بەردەستەکانی ئامێرەکە دیاریبکە'
      },
      {
        name: 'specs',
        label: 'تایبەتمەندییە تەکنیکییە زیاترەکان (Custom Specs)',
        type: 'specs',
        helperText: 'وەک پاتری، پڕۆسێسەر، کامێرا، شاشە OLED 120Hz...'
      }
    ]
  },

  cars: {
    category: 'cars',
    labelKurdish: 'ئۆتۆمبێل و ماتۆڕ',
    labelEn: 'Vehicles & Motors',
    labelAr: 'السيارات والمركبات',
    description: 'براند، مۆدێل، ساڵ، کیلۆمەتری ڕۆیشتوو، گێڕ، دەبڵ ئەکسل، دۆخی بۆیاخ و تابلۆ',
    iconName: 'Car',
    color: 'amber',
    subcategories: [
      { id: 'sedans', label: 'سێدان و ساڵۆن', labelEn: 'Sedans', labelAr: 'سيارات سيدان' },
      { id: 'suvs', label: 'جیپ و ئێس یو ڤی (SUV)', labelEn: 'SUVs & 4x4', labelAr: 'دفع رباعي وجيب' },
      { id: 'pickups', label: 'پیکاب و دوو کابینە', labelEn: 'Pickups', labelAr: 'بيك آب' },
      { id: 'sports', label: 'سپۆرت و کوپێ', labelEn: 'Sports & Coupe', labelAr: 'رياضية وكوبيه' },
      { id: 'hybrid_ev', label: 'هایبرید و کارەبایی (EV)', labelEn: 'Hybrid & Electric', labelAr: 'هايبرد وكهربائية' },
      { id: 'vans_buses', label: 'ڤان، پاس و بازرگانی', labelEn: 'Vans & Commercial', labelAr: 'فانات وتجارية' },
      { id: 'motorcycles', label: 'ماتۆڕسکیل و دەستەکان', labelEn: 'Motorcycles', labelAr: 'دراجات نارية' }
    ],
    fields: [
      {
        name: 'brand',
        label: 'کۆمپانیا / براند (Make / Brand) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: Toyota, Mercedes-Benz, BMW, Hyundai, Kia, Nissan...',
        presets: CAR_BRAND_PRESETS
      },
      {
        name: 'model',
        label: 'مۆدێلی تەواو (Model) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: Land Cruiser VXR, Camry SE, Tucson, Elantra, C200...'
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
        placeholder: '٣٥٠٠٠'
      },
      {
        name: 'transmission',
        label: 'جۆری گێڕ (Transmission) *',
        type: 'select',
        required: true,
        options: [
          { label: 'ئۆتۆماتیک (Automatic)', value: 'automatic' },
          { label: 'عادی / دەستی (Manual)', value: 'manual' },
          { label: 'سی ڤی تی (CVT)', value: 'cvt' },
          { label: 'دوو کلاچ (DCT)', value: 'dct' }
        ]
      },
      {
        name: 'fuelType',
        label: 'جۆری سووتەمەنی (Fuel Type)',
        type: 'select',
        options: [
          { label: 'بەنزین (Gasoline)', value: 'gasoline' },
          { label: 'هایبرید / تێکەڵە (Hybrid)', value: 'hybrid' },
          { label: 'کارەبایی تەواو (Electric EV)', value: 'electric' },
          { label: 'گاز / دیزڵ (Diesel)', value: 'diesel' },
          { label: 'پلاگین هایبرید (PHEV)', value: 'plug_in_hybrid' }
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
    labelEn: 'Food & Restaurants',
    labelAr: 'المأكولات والمطاعم',
    description: 'کاتی ئامادەکردن (Prep Time)، پێکهاتەکان، پلەی تیژی، گیاخۆری و کالۆری',
    iconName: 'Utensils',
    color: 'orange',
    subcategories: [
      { id: 'fast_food', label: 'فاست فوود، بەرگەر و پیتزا', labelEn: 'Fast Food & Burgers', labelAr: 'وجبات سريعة وبرغر' },
      { id: 'kurdish_traditional', label: 'خواردنی کوردی و تەقلیدی (قۆزی، شلە، برنج)', labelEn: 'Traditional Kurdish Dishes', labelAr: 'أطباق شرقية وكوردية' },
      { id: 'grill_bbq', label: 'کەباب و برژاوەکان (BBQ Grills)', labelEn: 'Kebabs & Grills', labelAr: 'مشاوي وكباب' },
      { id: 'desserts_sweets', label: 'شیرینی و کێک', labelEn: 'Desserts & Cakes', labelAr: 'حلويات وكيك' },
      { id: 'breakfast', label: 'تاشتە و نانی بەیانی', labelEn: 'Breakfast & Brunch', labelAr: 'فطور وصباحيات' },
      { id: 'beverages', label: 'شەربەتی سروشتی و خواردنەوەکان', labelEn: 'Juices & Beverages', labelAr: 'عصائر ومشروبات' }
    ],
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
        placeholder: 'پێکهاتە بنووسە و ئینتەر بکە...',
        presets: ['گۆشتی بەرخ', 'سنگی مریشک', 'پەنیری مۆزارێلا', 'پیاز و سڵاتە', 'بەهاراتی تایبەت', 'سۆسی سیر', 'قارچک', 'زەیتوون']
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
    labelEn: 'Fresh Meat & Poultry',
    labelAr: 'اللحوم الطازجة والدواجن',
    description: 'جۆری ئاژەڵ، پارچەی گۆشت (Cut)، سەرچاوەی سەربڕین، حەڵاڵ و کێش',
    iconName: 'Beef',
    color: 'rose',
    subcategories: [
      { id: 'fresh_lamb', label: 'گۆشتی بەرخی خۆماڵی', labelEn: 'Fresh Local Lamb', labelAr: 'لحم خروف محلي' },
      { id: 'fresh_beef', label: 'گۆشتی گوێرەکە و مانگا', labelEn: 'Fresh Beef & Veal', labelAr: 'لحم بقر وعجل' },
      { id: 'fresh_chicken', label: 'مریشکی تازەی سەربڕاو', labelEn: 'Fresh Slaughtered Chicken', labelAr: 'دجاج طازج مذبوح' },
      { id: 'fresh_fish', label: 'ماسی تازەی روبار و بەنداو', labelEn: 'Fresh Fish', labelAr: 'سمك طازج' },
      { id: 'minced_meat', label: 'گۆشتی هاڕاو و بەرگەر', labelEn: 'Minced Meat', labelAr: 'لحم مفروم' },
      { id: 'poultry', label: 'قەل، مراوی و پەلەوەر', labelEn: 'Turkey & Poultry', labelAr: 'دواجن وبط' }
    ],
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
        placeholder: 'وەک: ڕان (Leg)، پەراسو (Ribs)، فیلیە، دەست، تیکە بۆ کەباب، هاڕاو...'
      },
      {
        name: 'origin',
        label: 'سەرچاوە و سەربڕین (Origin)',
        type: 'text',
        placeholder: 'وەک: سەربڕاوی تازەی ناوخۆ (حەڵاڵی مسۆگەر)'
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
    labelEn: 'Fruits & Fresh Produce',
    labelAr: 'الفواكه والخضروات الطازجة',
    description: 'سەرچاوە، جۆر، بەرهەمی ناوخۆ/هاوردە، ١٠٠٪ ئۆرگانیک و یەکەی پێوانە',
    iconName: 'Apple',
    color: 'emerald',
    subcategories: [
      { id: 'fresh_fruits', label: 'میوەی فڕێش و وەرزی', labelEn: 'Fresh Seasonal Fruits', labelAr: 'فواكه موسمية طازجة' },
      { id: 'fresh_vegetables', label: 'سەوزەوات و پاقلەمەنی', labelEn: 'Fresh Vegetables', labelAr: 'خضروات طازجة' },
      { id: 'leafy_greens', label: 'سەوزەی پەلکدار (کەرەوز، جەرجیر، تەڕەتۆڵکە)', labelEn: 'Leafy Greens & Herbs', labelAr: 'ورقيات وأعشاب' },
      { id: 'organic_produce', label: 'بەرهەمی ئۆرگانیکی باخچەی کوردستانی', labelEn: '100% Organic Produce', labelAr: 'منتجات عضوية 100%' }
    ],
    fields: [
      {
        name: 'origin',
        label: 'سەرچاوە و بەرهەم (Origin)',
        type: 'text',
        placeholder: 'وەک: خۆماڵی کوردستانی (پێنجوێن، شارەزوور، بەردەڕەش)، هاوردە...'
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
    labelEn: 'Dairy & Fresh Milk',
    labelAr: 'الألبان والأجبان الطازجة',
    description: 'ماوەی بەسەرچوون (Expiry)، ڕێژەی چەوری، پلەی ساردکەرەوە و سەرچاوە',
    iconName: 'Milk',
    color: 'cyan',
    subcategories: [
      { id: 'fresh_milk', label: 'شیری تازە (مەڕ، بزن، مانگا)', labelEn: 'Fresh Milk', labelAr: 'حليب طازج' },
      { id: 'yogurt_mast', label: 'ماست و دەو (مەڕ و بزن)', labelEn: 'Yogurt & Mast', labelAr: 'لبن وزبادي' },
      { id: 'cheeses', label: 'پەنیری کوردی، مۆزارێلا و هۆڵەندی', labelEn: 'Cheeses', labelAr: 'أجبان متنوعة' },
      { id: 'butter_cream', label: 'کەرە، قەیماغ و کرێمی سروشتی', labelEn: 'Butter & Clotted Cream', labelAr: 'زبدة وقشطة طبيعية' }
    ],
    fields: [
      {
        name: 'expiryInfo',
        label: 'ماوەی بەسەرچوون و پاراستن (Shelf Life / Expiry) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: ٥ ڕۆژ لە ساردکەرەوە (2-4°C)...'
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
    labelEn: 'Beauty & Cosmetics',
    labelAr: 'الجمال والعناية الشخصية',
    description: 'براند، جۆری پێست، قەبارە (Volume)، ڕەسەنایەتی و بەسەرچوون',
    iconName: 'Sparkles',
    color: 'pink',
    subcategories: [
      { id: 'skincare', label: 'چاودێری پێست و سیرۆم', labelEn: 'Skincare & Serums', labelAr: 'العناية بالبشرة' },
      { id: 'makeup', label: 'مکیاج، فاوەندەیشن و سووراو', labelEn: 'Makeup & Cosmetics', labelAr: 'مكياج ومستحضرات تجميل' },
      { id: 'haircare', label: 'چاودێری قژ، شامپۆ و زەیت', labelEn: 'Haircare & Shampoo', labelAr: 'العناية بالشعر' },
      { id: 'perfumes', label: 'بۆن و عەتری ئۆرجینال', labelEn: 'Original Perfumes', labelAr: 'عطور أصلية' }
    ],
    fields: [
      {
        name: 'brand',
        label: 'براند و کۆمپانیا (Brand) *',
        type: 'text',
        required: true,
        placeholder: 'وەک: The Ordinary, CeraVe, Maybelline, MAC, Dior...',
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
    labelEn: 'Supermarket & Grocery',
    labelAr: 'السوبرماركت والمواد الغذائية',
    description: 'براند، کێش/قەبارە، بەرواری بەسەرچوون، بارکۆد و سەرچاوە',
    iconName: 'ShoppingBag',
    color: 'blue',
    subcategories: [
      { id: 'pantry_staples', label: 'برنج، زەیت، شەکر و پاقلەمەنی', labelEn: 'Rice, Oil & Staples', labelAr: 'أرز، زيت وبقوليات' },
      { id: 'snacks_sweets', label: 'چپس، شوکولاتە و بیسکیت', labelEn: 'Snacks & Chocolate', labelAr: 'سناكات وشوكولاتة' },
      { id: 'beverages_hot_cold', label: 'چای، قاوە و شەربەت', labelEn: 'Tea, Coffee & Drinks', labelAr: 'شاي، قهوة ومشروبات' },
      { id: 'cleaning_detergents', label: 'مەوادی پاککەرەوە و تاید', labelEn: 'Cleaning & Detergents', labelAr: 'منظفات ومساحيق غسيل' },
      { id: 'personal_hygiene', label: 'شامپۆ، سابوون و پێداویستی پاکوخاوێنی', labelEn: 'Personal Hygiene', labelAr: 'عناية شخصية ونظافة' }
    ],
    fields: [
      {
        name: 'brand',
        label: 'براند (Brand)',
        type: 'text',
        placeholder: 'وەک: Nestle, Dano, Almarai, Lipton, Tide...',
        presets: GROCERY_BRAND_PRESETS
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

/**
 * Calculates suggested reward points based on price
 * Standard: ~1.5% equivalent in points (where 150 points = 1 IQD)
 */
export function calculateSuggestedPoints(priceIqd: number): number {
  if (!priceIqd || priceIqd <= 0) return 0;
  // 1.5% of price converted to points: (price * 0.015) * 150 points per IQD
  const points = Math.round(priceIqd * 0.015 * 150);
  return Math.min(100000, Math.max(10, points));
}
