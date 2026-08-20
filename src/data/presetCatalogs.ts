export interface PresetProductItem {
  name: string;
  category: string;
  brand: string;
  unit?: string;
  weightOrSize?: string;
  sellingPrice: number;
  purchasePrice: number;
  barcode?: string;
}

export interface BrandPreset {
  id: string;
  name: string;
  nameKu: string;
  logoEmoji: string;
  items: PresetProductItem[];
}

export const SUPERMARKET_BRANDS: BrandPreset[] = [
  {
    id: 'aspi_rash',
    name: 'ئەسپی ڕەش (Black Horse)',
    nameKu: 'براند و بەرهەمەکانی ئەسپی ڕەش',
    logoEmoji: '🐎',
    items: [
      { name: 'برنجی ئەسپی ڕەش 5کگم', category: 'برنج و دانەوێڵە', brand: 'ئەسپی ڕەش', weightOrSize: '5 kg', sellingPrice: 12500, purchasePrice: 10500, barcode: '869012345601' },
      { name: 'برنجی ئەسپی ڕەش 10کگم', category: 'برنج و دانەوێڵە', brand: 'ئەسپی ڕەش', weightOrSize: '10 kg', sellingPrice: 24000, purchasePrice: 21000, barcode: '869012345602' },
      { name: 'زەیتی ئەسپی ڕەش 1 لیتر', category: 'زەیت و ڕوون', brand: 'ئەسپی ڕەش', weightOrSize: '1 L', sellingPrice: 2250, purchasePrice: 1800, barcode: '869012345603' },
      { name: 'ساواری ئەسپی ڕەش 1کگم', category: 'برنج و دانەوێڵە', brand: 'ئەسپی ڕەش', weightOrSize: '1 kg', sellingPrice: 1750, purchasePrice: 1350, barcode: '869012345604' },
      { name: 'ڕوونی کوردی/نەباتی ئەسپی ڕەش 1کگم', category: 'زەیت و ڕوون', brand: 'ئەسپی ڕەش', weightOrSize: '1 kg', sellingPrice: 3500, purchasePrice: 2800, barcode: '869012345605' },
      { name: 'خواردنەوەی گازداری ئەسپی ڕەش', category: 'خواردنەوەکان', brand: 'ئەسپی ڕەش', weightOrSize: '250 ml', sellingPrice: 500, purchasePrice: 350, barcode: '869012345606' }
    ]
  },
  {
    id: 'zerr',
    name: 'زێڕ (Zerr)',
    nameKu: 'براند و بەرهەمەکانی زێڕ',
    logoEmoji: '✨',
    items: [
      { name: 'برنجی زێڕی ڕەسەن 5کگم', category: 'برنج و دانەوێڵە', brand: 'زێڕ', weightOrSize: '5 kg', sellingPrice: 13000, purchasePrice: 11000, barcode: '869098765401' },
      { name: 'دۆشاوی تەماتەی زێڕ 800گڕام', category: 'دۆشاو و بەهارات', brand: 'زێڕ', weightOrSize: '800 g', sellingPrice: 2000, purchasePrice: 1550, barcode: '869098765402' },
      { name: 'زەیتی خواردن دروستکردنی زێڕ 1 لیتر', category: 'زەیت و ڕوون', brand: 'زێڕ', weightOrSize: '1 L', sellingPrice: 2250, purchasePrice: 1850, barcode: '869098765403' },
      { name: 'اوی میوەی سروشتی زێڕ 1 لیتر', category: 'خواردنەوەکان', brand: 'زێڕ', weightOrSize: '1 L', sellingPrice: 1500, purchasePrice: 1100, barcode: '869098765404' }
    ]
  },
  {
    id: 'shabab',
    name: 'شەباب (Shabab)',
    nameKu: 'براند و بەرهەمەکانی شەباب',
    logoEmoji: '🌟',
    items: [
      { name: 'برنجی شەباب 10کگم', category: 'برنج و دانەوێڵە', brand: 'شەباب', weightOrSize: '10 kg', sellingPrice: 22500, purchasePrice: 19500, barcode: '869055544401' },
      { name: 'زەیتی دوورپێوی شەباب 1 لیتر', category: 'زەیت و ڕوون', brand: 'شەباب', weightOrSize: '1 L', sellingPrice: 2000, purchasePrice: 1600, barcode: '869055544402' },
      { name: 'ڕوونی بەرەکەتی شەباب 1کگم', category: 'زەیت و ڕوون', brand: 'شەباب', weightOrSize: '1 kg', sellingPrice: 3250, purchasePrice: 2600, barcode: '869055544403' },
      { name: 'ماکەرۆنی و سپاگێتی شەباب 500گڕام', category: 'پاستا و مەکەرۆنی', brand: 'شەباب', weightOrSize: '500 g', sellingPrice: 1000, purchasePrice: 700, barcode: '869055544404' }
    ]
  },
  {
    id: 'mahmood',
    name: 'مەحموود (Mahmood Tea & Rice)',
    nameKu: 'بەرهەمەکانی چا و برنجی مەحموود',
    logoEmoji: '☕',
    items: [
      { name: 'چای مەحموود هێلدار 400گڕام', category: 'چا و قاوە', brand: 'مەحموود', weightOrSize: '400 g', sellingPrice: 4500, purchasePrice: 3700, barcode: '869077788801' },
      { name: 'برنجی مەحموودی ڕەسەن 10کگم', category: 'برنج و دانەوێڵە', brand: 'مەحموود', weightOrSize: '10 kg', sellingPrice: 25000, purchasePrice: 21500, barcode: '869077788802' },
      { name: 'چای مەحموود فەل 1کگم', category: 'چا و قاوە', brand: 'مەحموود', weightOrSize: '1 kg', sellingPrice: 10000, purchasePrice: 8500, barcode: '869077788803' }
    ]
  },
  {
    id: 'dilnia',
    name: 'دڵنیا (Dilnia)',
    nameKu: 'بەرهەمەکانی دڵنیا',
    logoEmoji: '🌻',
    items: [
      { name: 'زەیتی دەوارەی دڵنیا 1 لیتر', category: 'زەیت و ڕوون', brand: 'دڵنیا', weightOrSize: '1 L', sellingPrice: 2250, purchasePrice: 1800, barcode: '869011122201' },
      { name: 'برنجی هیندی دڵنیا 5کگم', category: 'برنج و دانەوێڵە', brand: 'دڵنیا', weightOrSize: '5 kg', sellingPrice: 12000, purchasePrice: 10000, barcode: '869011122202' }
    ]
  }
];

export const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '36', '38', '40', '42', '44', '46', '48'];

export const CLOTHING_COLORS = [
  { nameKu: 'ڕەش (Black)', code: '#000000' },
  { nameKu: 'سپی (White)', code: '#FFFFFF' },
  { nameKu: 'شینی تۆخ (Navy Blue)', code: '#000080' },
  { nameKu: 'سواغی/کراوە (Sky Blue)', code: '#87CEEB' },
  { nameKu: 'سوور (Red)', code: '#FF0000' },
  { nameKu: 'سەوز (Green)', code: '#008000' },
  { nameKu: 'زەرد (Yellow)', code: '#FFFF00' },
  { nameKu: 'بۆر (Grey)', code: '#808080' },
  { nameKu: 'نیلی/کەهوایی (Indego)', code: '#4B0082' },
  { nameKu: 'دارچینی/قاوەیی (Brown)', code: '#A52A2A' }
];

export const CLOTHING_BRANDS = ['Zara', 'LC Waikiki', 'Nike', 'Adidas', 'Defacto', 'Koton', 'Mango', 'Puma', 'H&M', 'کاستۆم (دەستی)'];

export const PHARMACY_DOSAGES = ['500 mg', '250 mg', '100 mg', '50 mg', '10 mg', '5 mg', '100 ml', '200 ml', '10 ml Drop'];
