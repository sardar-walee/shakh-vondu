import React, { useState, useEffect } from 'react';
import {
  Package,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  Car,
  Shirt,
  Smartphone,
  Utensils,
  Beef,
  Apple,
  Milk,
  ShoppingBag,
  Info,
  Calendar,
  Gauge,
  Clock,
  Flame,
  Shield,
  Palette,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { ImageUpload } from '../common/ImageUpload';
import {
  CATEGORY_FIELD_CONFIGS,
  POPULAR_COLORS,
  validateProductCategoryFields
} from '../../utils/categoryFields';

interface DynamicProductFormProps {
  initialData?: Product | null;
  allowedCategory?: ProductCategory;
  isSuperAdmin?: boolean;
  sellerName?: string;
  sellerId: string;
  onSave: (productData: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const DynamicProductForm: React.FC<DynamicProductFormProps> = ({
  initialData,
  allowedCategory,
  isSuperAdmin,
  sellerName,
  sellerId,
  onSave,
  onCancel,
  isSubmitting = false
}) => {
  // Category state
  const [category, setCategory] = useState<ProductCategory>(
    initialData?.category || allowedCategory || 'clothes'
  );

  // Core fields state
  const [title, setTitle] = useState(initialData?.title || '');
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState<number>(initialData?.price || 15000);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(initialData?.discountPrice);
  const [stock, setStock] = useState<number>(initialData?.stock ?? 25);
  const [unit, setUnit] = useState<string>(initialData?.unit || 'دانە');
  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600']
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(initialData?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured ?? false);

  // Dynamic category fields state
  // Clothes
  const [sizes, setSizes] = useState<string[]>(initialData?.sizes || (category === 'clothes' ? ['S', 'M', 'L', 'XL'] : []));
  const [colors, setColors] = useState<string[]>(initialData?.colors || (category === 'clothes' ? ['ڕەش / Black', 'سپی / White', 'شین / Blue'] : []));
  const [gender, setGender] = useState<'men' | 'women' | 'kids' | 'unisex'>(initialData?.gender || 'unisex');
  const [material, setMaterial] = useState<string>(initialData?.material || '');

  // Electronics & Common
  const [brand, setBrand] = useState<string>(initialData?.brand || '');
  const [model, setModel] = useState<string>(initialData?.model || '');
  const [warrantyMonths, setWarrantyMonths] = useState<number | undefined>(initialData?.warrantyMonths);
  const [specs, setSpecs] = useState<Record<string, string>>(initialData?.specs || {});
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Cars
  const [year, setYear] = useState<number | undefined>(initialData?.year || (category === 'cars' ? new Date().getFullYear() : undefined));
  const [mileageKm, setMileageKm] = useState<number | undefined>(initialData?.mileageKm || (category === 'cars' ? 35000 : undefined));
  const [transmission, setTransmission] = useState<'automatic' | 'manual'>(initialData?.transmission || 'automatic');
  const [fuelType, setFuelType] = useState<'gasoline' | 'diesel' | 'hybrid' | 'electric'>(initialData?.fuelType || 'gasoline');

  // Food
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number | undefined>(initialData?.prepTimeMinutes || (category === 'food' ? 20 : undefined));
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients || []);
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [isSpicy, setIsSpicy] = useState<boolean>(initialData?.isSpicy ?? false);
  const [isVegetarian, setIsVegetarian] = useState<boolean>(initialData?.isVegetarian ?? false);

  // Meat
  const [meatType, setMeatType] = useState<string>(initialData?.meatType || 'lamb');
  const [cutType, setCutType] = useState<string>(initialData?.cutType || '');

  // Fruits & Veg
  const [origin, setOrigin] = useState<string>(initialData?.origin || '');
  const [isOrganic, setIsOrganic] = useState<boolean>(initialData?.isOrganic ?? false);

  // Dairy
  const [expiryInfo, setExpiryInfo] = useState<string>(initialData?.expiryInfo || '');
  const [fatPercentage, setFatPercentage] = useState<string>(initialData?.fatPercentage || 'full_fat');

  // Beauty
  const [skinType, setSkinType] = useState<string>(initialData?.skinType || 'all');
  const [volume, setVolume] = useState<string>(initialData?.volume || '');
  const [weight, setWeight] = useState<string>(initialData?.weight || '');

  // Custom Tag Input
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorInput, setCustomColorInput] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Reset category-specific defaults on category change if creating new
  const handleCategoryChange = (newCat: ProductCategory) => {
    if (!isSuperAdmin && allowedCategory && newCat !== allowedCategory) return;
    setCategory(newCat);
    setErrors({});

    if (!initialData) {
      if (newCat === 'clothes') {
        if (sizes.length === 0) setSizes(['S', 'M', 'L', 'XL']);
        if (colors.length === 0) setColors(['ڕەش / Black', 'سپی / White']);
      } else if (newCat === 'cars') {
        if (!year) setYear(new Date().getFullYear());
        if (!mileageKm) setMileageKm(0);
      } else if (newCat === 'food') {
        if (!prepTimeMinutes) setPrepTimeMinutes(20);
      }
    }
  };

  // Spec pair helpers
  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    setSpecs(prev => ({ ...prev, [newSpecKey.trim()]: newSpecValue.trim() }));
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const handleRemoveSpec = (key: string) => {
    setSpecs(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Tag helpers
  const toggleSize = (s: string) => {
    setSizes(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]));
  };

  const handleAddCustomSize = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!customSizeInput.trim()) return;
    if (!sizes.includes(customSizeInput.trim())) {
      setSizes(prev => [...prev, customSizeInput.trim()]);
    }
    setCustomSizeInput('');
  };

  const toggleColor = (cName: string) => {
    setColors(prev => (prev.includes(cName) ? prev.filter(x => x !== cName) : [...prev, cName]));
  };

  const handleAddCustomColor = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!customColorInput.trim()) return;
    if (!colors.includes(customColorInput.trim())) {
      setColors(prev => [...prev, customColorInput.trim()]);
    }
    setCustomColorInput('');
  };

  const handleAddIngredient = (e?: React.KeyboardEvent | React.MouseEvent, predefined?: string) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    const item = predefined || newIngredientInput.trim();
    if (!item) return;
    if (!ingredients.includes(item)) {
      setIngredients(prev => [...prev, item]);
    }
    if (!predefined) setNewIngredientInput('');
  };

  const handleRemoveIngredient = (ing: string) => {
    setIngredients(prev => prev.filter(i => i !== ing));
  };

  // Form Submit with comprehensive validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productPayload: Omit<Product, 'id' | 'createdAt'> = {
      sellerId,
      sellerName: sellerName || 'فرۆشگای شاخی',
      category,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      subcategory: subcategory.trim() || undefined,
      stock: Number(stock),
      unit: unit.trim() || 'دانە',
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600'],
      isAvailable,
      isFeatured,

      // Category Specific Dynamic Fields
      sizes: category === 'clothes' ? sizes : undefined,
      colors: ['clothes', 'electronics', 'cars'].includes(category) ? colors : undefined,
      brand: ['clothes', 'electronics', 'cars', 'beauty', 'market'].includes(category) ? (brand.trim() || undefined) : undefined,
      gender: category === 'clothes' ? gender : undefined,
      material: category === 'clothes' ? (material.trim() || undefined) : undefined,

      model: ['electronics', 'cars'].includes(category) ? (model.trim() || undefined) : undefined,
      specs: category === 'electronics' ? specs : undefined,
      warrantyMonths: category === 'electronics' && warrantyMonths ? Number(warrantyMonths) : undefined,

      year: category === 'cars' && year ? Number(year) : undefined,
      mileageKm: category === 'cars' && mileageKm !== undefined ? Number(mileageKm) : undefined,
      transmission: category === 'cars' ? transmission : undefined,
      fuelType: category === 'cars' ? fuelType : undefined,

      prepTimeMinutes: category === 'food' && prepTimeMinutes ? Number(prepTimeMinutes) : undefined,
      ingredients: category === 'food' ? ingredients : undefined,
      isSpicy: category === 'food' ? isSpicy : undefined,
      isVegetarian: category === 'food' ? isVegetarian : undefined,

      meatType: category === 'fresh_meat' ? meatType : undefined,
      cutType: category === 'fresh_meat' ? (cutType.trim() || undefined) : undefined,

      origin: ['fresh_meat', 'fruits_vegetables', 'dairy', 'market'].includes(category) ? (origin.trim() || undefined) : undefined,
      isOrganic: category === 'fruits_vegetables' ? isOrganic : undefined,

      expiryInfo: ['dairy', 'beauty', 'market'].includes(category) ? (expiryInfo.trim() || undefined) : undefined,
      fatPercentage: category === 'dairy' ? fatPercentage : undefined,

      skinType: category === 'beauty' ? skinType : undefined,
      volume: category === 'beauty' ? (volume.trim() || undefined) : undefined,
      weight: ['fresh_meat', 'market'].includes(category) ? (weight.trim() || undefined) : undefined
    };

    const validationResult = validateProductCategoryFields(category, productPayload);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      // Scroll to first error
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setErrors({});
    await onSave(productPayload);
  };

  const currentCategoryConfig = CATEGORY_FIELD_CONFIGS[category];

  const getCategoryIcon = (cat: ProductCategory) => {
    switch (cat) {
      case 'clothes': return <Shirt className="w-4 h-4" />;
      case 'electronics': return <Smartphone className="w-4 h-4" />;
      case 'cars': return <Car className="w-4 h-4" />;
      case 'food': return <Utensils className="w-4 h-4" />;
      case 'fresh_meat': return <Beef className="w-4 h-4" />;
      case 'fruits_vegetables': return <Apple className="w-4 h-4" />;
      case 'dairy': return <Milk className="w-4 h-4" />;
      case 'beauty': return <Sparkles className="w-4 h-4" />;
      default: return <ShoppingBag className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Top Header & Preview Toggle */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span>{initialData ? 'دەستکاری کاڵا بەپێی بەش' : 'زیادکردنی کاڵای نوێ (سیستەمی داینامیک)'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            خانە و تایبەتمەندییەکان بە شێوەی ئۆتۆماتیکی لەگەڵ بەشی دیاریکراو دەگونجێن.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Eye className="w-4 h-4 text-blue-600" />
          <span>{showPreview ? 'شاردنەوەی پێشبینین' : 'پێشبینینی کاڵا (Live Preview)'}</span>
        </button>
      </div>

      {/* Global Form Validation Error Alert */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1 animate-shake">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>تکایە ئەم هەڵانەی خوارەوە چاک بکە پێش پاشەکەوتکردن:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pr-2 pt-1 text-[11px]">
            {Object.values(errors).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Live Preview Card */}
      {showPreview && (
        <div className="p-4 rounded-3xl bg-slate-50 border-2 border-dashed border-orange-300 space-y-3">
          <span className="text-xs font-black text-orange-700 flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>پێشبینینی ڕاستەوخۆ (پێش پاشەکەوتکردن):</span>
          </span>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-start">
            <img
              src={images[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600'}
              alt={title || 'پێشبینین'}
              className="w-full sm:w-28 h-28 rounded-xl object-cover border border-slate-100 flex-shrink-0"
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-bold text-[10px]">
                  {currentCategoryConfig.labelKurdish}
                </span>
                {subcategory && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                    {subcategory}
                  </span>
                )}
                {brand && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] font-latin">
                    {brand}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-slate-900">{title || 'ناوی کاڵا لێرە دەردەکەوێت'}</h4>
              <p className="text-xs text-slate-500 line-clamp-1">{description || 'ڕوونکردنەوەی کاڵا...'}</p>
              
              <div className="flex items-center gap-3 pt-1">
                <span className="text-sm font-black text-orange-600 font-latin">
                  {(discountPrice || price || 0).toLocaleString()} د.ع
                </span>
                {discountPrice && (
                  <span className="text-xs text-slate-400 line-through font-latin">
                    {(price || 0).toLocaleString()} د.ع
                  </span>
                )}
              </div>

              {/* Preview category attributes */}
              <div className="pt-1.5 flex flex-wrap gap-1.5 text-[10px]">
                {category === 'clothes' && sizes.length > 0 && (
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">
                    قەبارەکان: {sizes.join(', ')}
                  </span>
                )}
                {category === 'clothes' && colors.length > 0 && (
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">
                    ڕەنگەکان: {colors.length} ڕەنگ
                  </span>
                )}
                {category === 'electronics' && model && (
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold font-latin">
                    مۆدێل: {model}
                  </span>
                )}
                {category === 'cars' && (
                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold font-latin">
                    ساڵ: {year} • ڕۆیشتوو: {mileageKm?.toLocaleString()} کم • گێڕ: {transmission === 'automatic' ? 'ئۆتۆماتیک' : 'دەستی'}
                  </span>
                )}
                {category === 'food' && prepTimeMinutes && (
                  <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-bold font-latin">
                    ئامادەکردن: {prepTimeMinutes} خولەک
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Category Selector */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>بەشی کاڵا (Category Selection) *</span>
            </label>
            {!isSuperAdmin && allowedCategory && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                تایبەت بە فرۆشگاکەت ({allowedCategory})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {(Object.keys(CATEGORY_FIELD_CONFIGS) as ProductCategory[]).map((catKey) => {
              const cfg = CATEGORY_FIELD_CONFIGS[catKey];
              const isSelected = category === catKey;
              const isDisabled = !isSuperAdmin && !!allowedCategory && allowedCategory !== catKey;

              return (
                <button
                  key={catKey}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleCategoryChange(catKey)}
                  className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                      : isDisabled
                      ? 'border-slate-200 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {getCategoryIcon(catKey)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{cfg.labelKurdish}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 pt-1">
            {currentCategoryConfig.description}
          </p>
        </div>

        {/* Step 2: Core Product Information */}
        <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200">
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <Tag className="w-4 h-4 text-orange-500" />
            <span>زانیارییە سەرەکییەکان (Core Details)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ناوی کاڵا *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="وەک: قەمیسی مارکەی زارا، ئایفۆن ١٥ پڕۆ ماکس..."
                required
                className={`w-full bg-slate-50 border rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden ${
                  errors.title ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-orange-500'
                }`}
              />
              {errors.title && <p className="text-[10px] text-rose-600 font-bold">{errors.title}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">پۆلی لاوەکی (Subcategory)</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="وەک: قەمیس، کەباب، مۆبایل، پێڵاو..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">نرخ بە دینار (IQD) *</label>
              <input
                type="number"
                min="0"
                step="250"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className={`w-full bg-slate-50 border rounded-xl p-3 text-xs font-latin ${
                  errors.price ? 'border-rose-500' : 'border-slate-200 focus:border-orange-500'
                }`}
              />
              {errors.price && <p className="text-[10px] text-rose-600 font-bold">{errors.price}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">نرخی داشکاندن (ئارەزوومەندانە)</label>
              <input
                type="number"
                min="0"
                step="250"
                value={discountPrice || ''}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="داشکاندن بە دینار"
                className={`w-full bg-slate-50 border rounded-xl p-3 text-xs font-latin ${
                  errors.discountPrice ? 'border-rose-500' : 'border-slate-200 focus:border-orange-500'
                }`}
              />
              {errors.discountPrice && <p className="text-[10px] text-rose-600 font-bold">{errors.discountPrice}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ژمارە لە کۆگا (Stock) *</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ڕوونکردنەوە و وەسفی کاڵا</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="وەسفی وردی کاڵاکە بۆ کڕیاران..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-orange-500"
            />
          </div>
        </div>

        {/* Step 3: DYNAMIC Category Specific Fields */}
        <div className="space-y-5 bg-orange-50/40 p-5 sm:p-6 rounded-2xl border-2 border-orange-200/80 shadow-xs">
          
          <div className="flex items-center justify-between border-b border-orange-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500 text-white">
                {getCategoryIcon(category)}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  تایبەتمەندییە داینامیکییەکانی بەشی ({currentCategoryConfig.labelKurdish})
                </h4>
                <p className="text-[11px] text-slate-500">
                  ئەم خانانە تایبەتن بەم بەشە و یارمەتی کڕیار دەدەن بە باشترین شێوە کاڵاکە هەڵبژێرێت.
                </p>
              </div>
            </div>
          </div>

          {/* CLOTHES DYNAMIC FIELDS */}
          {category === 'clothes' && (
            <div className="space-y-5">
              
              {/* Sizes */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <span>قەبارەکانی بەردەست (Sizes) *</span>
                </label>
                
                <div className="flex flex-wrap gap-1.5">
                  {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '30', '32', '34', '36', '38', '40', '42'].map(s => {
                    const isSelected = sizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-latin transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-xs scale-105'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        {s} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>

                {/* Custom size input */}
                <div className="flex items-center gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={handleAddCustomSize}
                    placeholder="قەبارەی تایبەت زیادبکە..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    زیادکردن
                  </button>
                </div>
                {errors.sizes && <p className="text-[10px] text-rose-600 font-bold">{errors.sizes}</p>}
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800">ڕەنگەکانی بەردەست (Colors) *</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_COLORS.map(c => {
                    const isSelected = colors.includes(c.value);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => toggleColor(c.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs ring-2 ring-purple-500'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom color input */}
                <div className="flex items-center gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    onKeyDown={handleAddCustomColor}
                    placeholder="ڕەنگی تر (وەک: زیوی، بڕۆنزی...)"
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    زیادکردن
                  </button>
                </div>
                {errors.colors && <p className="text-[10px] text-rose-600 font-bold">{errors.colors}</p>}
              </div>

              {/* Brand, Gender, Material */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-orange-200/60">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">براند (Brand)</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="وەک: Zara, LC Waikiki, Nike, Mango..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-latin"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ڕەگەز (Target Gender)</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="unisex">هاوبەش (Unisex)</option>
                    <option value="men">پیاوان (Men)</option>
                    <option value="women">ئافرەتان (Women)</option>
                    <option value="kids">منداڵان (Kids)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">جۆری قوماش (Material)</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="وەک: ١٠٠٪ لۆکە، جینز، کەتان..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

            </div>
          )}

          {/* ELECTRONICS DYNAMIC FIELDS */}
          {category === 'electronics' && (
            <div className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">براند (Brand) *</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="وەک: Apple, Samsung, Sony, Xiaomi..."
                    required
                    className={`w-full bg-white border rounded-xl p-2.5 text-xs font-latin ${
                      errors.brand ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.brand && <p className="text-[10px] text-rose-600 font-bold">{errors.brand}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">مۆدێلی ئامێر (Model) *</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="وەک: iPhone 15 Pro Max, Galaxy S24 Ultra..."
                    required
                    className={`w-full bg-white border rounded-xl p-2.5 text-xs font-latin ${
                      errors.model ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.model && <p className="text-[10px] text-rose-600 font-bold">{errors.model}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ماوەی گارانتی (بە مانگ)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={warrantyMonths || ''}
                    onChange={(e) => setWarrantyMonths(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="١٢ مانگ"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-latin"
                  />
                </div>
              </div>

              {/* Key-Value Technical Specs */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800">
                    تایبەتمەندییە تەکنیکییەکان (Technical Specifications)
                  </label>
                  <span className="text-[10px] text-slate-400">وەک میمۆری، ڕام، باتری، شاشە...</span>
                </div>

                {/* Existing Specs */}
                {Object.keys(specs).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(specs).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-500 ml-1.5">{k}:</span>
                          <span className="font-black text-slate-900 font-latin">{v}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(k)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new spec */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="ناوی تایبەتمەندی (وەک: Storage, RAM, Battery)"
                    className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-latin"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="بڕ / وەسف (وەک: 256GB, 8GB RAM, 5000mAh)"
                    className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-latin"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>زیادکردن</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* CARS DYNAMIC FIELDS */}
          {category === 'cars' && (
            <div className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">کۆمپانیا / براند (Make) *</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Toyota, Mercedes, BMW, Hyundai..."
                    required
                    className={`w-full bg-white border rounded-xl p-2.5 text-xs font-latin ${
                      errors.brand ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.brand && <p className="text-[10px] text-rose-600 font-bold">{errors.brand}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">مۆدێل (Model) *</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Camry, Land Cruiser, Tucson, C-Class..."
                    required
                    className={`w-full bg-white border rounded-xl p-2.5 text-xs font-latin ${
                      errors.model ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.model && <p className="text-[10px] text-rose-600 font-bold">{errors.model}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">ساڵی دروستکردن (Year) *</label>
                  <input
                    type="number"
                    min="1980"
                    max={new Date().getFullYear() + 1}
                    value={year || ''}
                    onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder={`${new Date().getFullYear()}`}
                    required
                    className={`w-full bg-white border rounded-xl p-2.5 text-xs font-latin ${
                      errors.year ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.year && <p className="text-[10px] text-rose-600 font-bold">{errors.year}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">ڕۆیشتوو بە کیلۆمەتر (Mileage) *</label>
                  <input
                    type="number"
                    min="0"
                    value={mileageKm ?? ''}
                    onChange={(e) => setMileageKm(e.target.value !== '' ? Number(e.target.value) : undefined)}
                    placeholder="٤٥٠٠٠"
                    required
                    className={`w-full bg-white border rounded-xl p-2.5 text-xs font-latin ${
                      errors.mileageKm ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.mileageKm && <p className="text-[10px] text-rose-600 font-bold">{errors.mileageKm}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">جۆری گێڕ (Transmission) *</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="automatic">ئۆتۆماتیک (Automatic)</option>
                    <option value="manual">عادی / دەستی (Manual)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">جۆری سووتەمەنی (Fuel Type)</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="gasoline">بەنزین (Gasoline)</option>
                    <option value="hybrid">هایبرید / تێکەڵە (Hybrid)</option>
                    <option value="electric">کارەبایی (Electric)</option>
                    <option value="diesel">گاز / دیزڵ (Diesel)</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* FOOD DYNAMIC FIELDS */}
          {category === 'food' && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">کاتی ئامادەکردن (بە خولەک)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={prepTimeMinutes || ''}
                    onChange={(e) => setPrepTimeMinutes(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="٢٠ خولەک"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-latin"
                  />
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSpicy}
                      onChange={(e) => setIsSpicy(e.target.checked)}
                      className="w-4 h-4 text-orange-500 rounded border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Flame className="w-4 h-4 text-rose-500" />
                      <span>تیژە (Spicy)</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVegetarian}
                      onChange={(e) => setIsVegetarian(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      🥗 گیاخۆرییە (Vegetarian)
                    </span>
                  </label>
                </div>
              </div>

              {/* Ingredients tag manager */}
              <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200">
                <label className="text-xs font-black text-slate-800">پێکهاتەکان (Ingredients)</label>
                <div className="flex flex-wrap gap-1.5">
                  {ingredients.map(ing => (
                    <span key={ing} className="bg-orange-50 border border-orange-200 text-orange-800 text-xs px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-bold">
                      <span>{ing}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ing)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1 max-w-md">
                  <input
                    type="text"
                    value={newIngredientInput}
                    onChange={(e) => setNewIngredientInput(e.target.value)}
                    onKeyDown={(e) => handleAddIngredient(e)}
                    placeholder="پێکهاتەی تر زیادبکە..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleAddIngredient(e)}
                    className="px-3 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    زیادکردن
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* FRESH MEAT DYNAMIC FIELDS */}
          {category === 'fresh_meat' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800">جۆری گۆشت (Meat Type) *</label>
                <select
                  value={meatType}
                  onChange={(e) => setMeatType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="lamb">گۆشتی بەرخی خۆماڵی (Lamb)</option>
                  <option value="beef">گۆشتی گوێرەکە / مانگا (Beef)</option>
                  <option value="chicken">مریشکی تازەی سەربڕاو (Fresh Chicken)</option>
                  <option value="turkey">قەل و پەلەوەر (Turkey)</option>
                  <option value="fish">ماسی تازەی ناوخۆ (Fresh Fish)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800">بەش یان پارچەی گۆشت (Cut) *</label>
                <input
                  type="text"
                  value={cutType}
                  onChange={(e) => setCutType(e.target.value)}
                  placeholder="وەک: ڕان، پەراسو، فیلیە، دەست، هاڕاو..."
                  required
                  className={`w-full bg-white border rounded-xl p-2.5 text-xs ${
                    errors.cutType ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {errors.cutType && <p className="text-[10px] text-rose-600 font-bold">{errors.cutType}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">سەرچاوە و سەربڕین</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="سەربڕاوی تازەی بەردەڕەش / هەولێر (حەڵاڵ)"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>
          )}

          {/* FRUITS & VEGETABLES DYNAMIC FIELDS */}
          {category === 'fruits_vegetables' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">سەرچاوە و وڵات (Origin)</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="خۆماڵی کوردستانی (پێنجوێن، بەردەڕەش...)"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">یەکەی پێوانە</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="کیلۆگرام">کیلۆگرام (Kg)</option>
                  <option value="سندووق">سندووق / کارتۆن (Box)</option>
                  <option value="دەسک">دەسک (Bundle)</option>
                  <option value="دانە">دانە (Piece)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOrganic}
                    onChange={(e) => setIsOrganic(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    🌿 ١٠٠٪ ئۆرگانیک و سروشتی
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* DAIRY DYNAMIC FIELDS */}
          {category === 'dairy' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800">ماوەی بەسەرچوون (Expiry Info) *</label>
                <input
                  type="text"
                  value={expiryInfo}
                  onChange={(e) => setExpiryInfo(e.target.value)}
                  placeholder="وەک: ٥ ڕۆژ لە ساردکەرەوە..."
                  required
                  className={`w-full bg-white border rounded-xl p-2.5 text-xs ${
                    errors.expiryInfo ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {errors.expiryInfo && <p className="text-[10px] text-rose-600 font-bold">{errors.expiryInfo}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ڕێژەی چەوری</label>
                <select
                  value={fatPercentage}
                  onChange={(e) => setFatPercentage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="full_fat">چەوری تەواو (Full Fat)</option>
                  <option value="medium_fat">نیوە چەوری (Medium Fat)</option>
                  <option value="low_fat">کەم چەوری (Low Fat)</option>
                  <option value="skimmed">بێ چەوری (Skimmed)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">سەرچاوەی ماست و شیر</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="خۆماڵی گوندەکانی بەردەڕەش / هەولێر"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>
          )}

          {/* BEAUTY DYNAMIC FIELDS */}
          {category === 'beauty' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800">براند (Brand) *</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="The Ordinary, CeraVe, Maybelline..."
                  required
                  className={`w-full bg-white border rounded-xl p-2.5 text-xs font-latin ${
                    errors.brand ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {errors.brand && <p className="text-[10px] text-rose-600 font-bold">{errors.brand}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">گونجاو بۆ پێستی</label>
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="all">تەواوی جۆرەکان (All)</option>
                  <option value="oily">پێستی چەور (Oily)</option>
                  <option value="dry">پێستی وشک (Dry)</option>
                  <option value="sensitive">پێستی هەستیار (Sensitive)</option>
                  <option value="combination">تێکەڵ (Combination)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">قەبارە / کێش</label>
                <input
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="وەک: 50ml, 100ml, 30g..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-latin"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">بەسەرچوون دوای کردنەوە</label>
                <input
                  type="text"
                  value={expiryInfo}
                  onChange={(e) => setExpiryInfo(e.target.value)}
                  placeholder="12M دوای کردنەوە"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-latin"
                />
              </div>
            </div>
          )}

          {/* MARKET DYNAMIC FIELDS */}
          {category === 'market' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">براند (Brand)</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Nestle, Dano, Almarai, Lipton..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-latin"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">کێش / قەبارە (Weight)</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="800g, 1 Liter, 500ml..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-latin"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">بەرواری بەسەرچوون</label>
                <input
                  type="text"
                  value={expiryInfo}
                  onChange={(e) => setExpiryInfo(e.target.value)}
                  placeholder="2026/12"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-latin"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">وڵاتی بەرهەمهێنەر</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="تورکیا، ئەڵمانیا، ئیمارات..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>
          )}

        </div>

        {/* Step 4: Images & Media */}
        <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200">
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <ImageIcon className="w-4 h-4 text-orange-500" />
            <span>وێنەکانی کاڵا (Images)</span>
          </h4>

          <ImageUpload
            images={images}
            onChange={setImages}
            maxImages={4}
            label="وێنەی کاڵا باربکە یان لە پێشنیارەکان هەڵبژێرە:"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            پاشگەزبوونەوە
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>خەریکی پاشەکەوتکردنە...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{initialData ? 'پاشەکەوتکردنی گۆڕانکارییەکان' : 'بڵاوکردنەوەی کاڵا'}</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
