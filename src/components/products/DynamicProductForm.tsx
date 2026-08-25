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
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  RotateCcw,
  Gift,
  HelpCircle,
  Truck,
  Heart,
  Percent,
  Sliders,
  X
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { ImageUpload } from '../common/ImageUpload';
import {
  CATEGORY_FIELD_CONFIGS,
  POPULAR_COLORS,
  CAR_BODY_TYPES,
  CAR_DRIVETRAINS,
  CAR_PAINT_CONDITIONS,
  CAR_ACCIDENT_CONDITIONS,
  validateProductCategoryFields,
  calculateSuggestedPoints
} from '../../utils/categoryFields';
import { useLanguage } from '../../context/LanguageContext';
import { useMarketplace } from '../../context/MarketplaceContext';

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
  const { t, currentLanguage } = useLanguage();
  const { sellers } = useMarketplace();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [hasDraftLoaded, setHasDraftLoaded] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  // Super Admin store assignment state
  const [currentSellerId, setCurrentSellerId] = useState<string>(
    initialData?.sellerId || sellerId || (isSuperAdmin ? 'admin-store' : 'store-1')
  );
  const [currentSellerName, setCurrentSellerName] = useState<string>(
    initialData?.sellerName || sellerName || (isSuperAdmin ? 'بەڕێوەبەرایەتی شاخ' : 'فرۆشگای من')
  );
  const [customSellerName, setCustomSellerName] = useState<string>('');

  // Category state
  const [category, setCategory] = useState<ProductCategory>(
    initialData?.category || allowedCategory || 'food'
  );

  // Core fields state
  const [title, setTitle] = useState(initialData?.title || '');
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>(initialData?.condition || 'new');
  const [price, setPrice] = useState<number>(initialData?.price || 15000);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(initialData?.discountPrice);
  const [stock, setStock] = useState<number>(initialData?.stock ?? 25);
  const [unit, setUnit] = useState<string>(initialData?.unit || 'دانە');
  const [rewardPoints, setRewardPoints] = useState<number>(
    initialData?.rewardPoints !== undefined ? initialData.rewardPoints : calculateSuggestedPoints(initialData?.price || 15000)
  );
  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800']
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(initialData?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured ?? false);

  // Category Specific - Clothes
  const [sizes, setSizes] = useState<string[]>(initialData?.sizes || (category === 'clothes' ? ['S', 'M', 'L', 'XL'] : []));
  const [colors, setColors] = useState<string[]>(initialData?.colors || (category === 'clothes' ? ['ڕەش / Black', 'سپی / White'] : []));
  const [gender, setGender] = useState<'men' | 'women' | 'kids' | 'unisex'>(initialData?.gender || 'unisex');
  const [material, setMaterial] = useState<string>(initialData?.material || '');
  const [fit, setFit] = useState<string>(initialData?.fit || 'regular');
  const [season, setSeason] = useState<string>(initialData?.season || 'all_season');

  // Category Specific - Electronics
  const [brand, setBrand] = useState<string>(initialData?.brand || '');
  const [model, setModel] = useState<string>(initialData?.model || '');
  const [storageCapacity, setStorageCapacity] = useState<string>(initialData?.storageCapacity || '');
  const [ramSize, setRamSize] = useState<string>(initialData?.ramSize || '');
  const [warrantyMonths, setWarrantyMonths] = useState<number | undefined>(initialData?.warrantyMonths);
  const [specs, setSpecs] = useState<Record<string, string>>(initialData?.specs || {});
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Category Specific - Cars
  const [year, setYear] = useState<number | undefined>(initialData?.year || (category === 'cars' ? new Date().getFullYear() : undefined));
  const [mileageKm, setMileageKm] = useState<number | undefined>(initialData?.mileageKm || (category === 'cars' ? 35000 : undefined));
  const [transmission, setTransmission] = useState<'automatic' | 'manual'>(initialData?.transmission || 'automatic');
  const [fuelType, setFuelType] = useState<'gasoline' | 'diesel' | 'hybrid' | 'electric'>(initialData?.fuelType || 'gasoline');
  const [bodyType, setBodyType] = useState<string>('sedan');
  const [drivetrain, setDrivetrain] = useState<string>('FWD');
  const [paintStatus, setPaintStatus] = useState<string>('original_paint');
  const [accidentStatus, setAccidentStatus] = useState<string>('none');

  // Category Specific - Food
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number | undefined>(initialData?.prepTimeMinutes || (category === 'food' ? 20 : undefined));
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients || []);
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [isSpicy, setIsSpicy] = useState<boolean>(initialData?.isSpicy ?? false);
  const [isVegetarian, setIsVegetarian] = useState<boolean>(initialData?.isVegetarian ?? false);

  // Category Specific - Fresh Meat
  const [meatType, setMeatType] = useState<string>(initialData?.meatType || 'lamb');
  const [cutType, setCutType] = useState<string>(initialData?.cutType || '');

  // Category Specific - Fruits & Veg
  const [origin, setOrigin] = useState<string>(initialData?.origin || '');
  const [isOrganic, setIsOrganic] = useState<boolean>(initialData?.isOrganic ?? false);

  // Category Specific - Dairy
  const [expiryInfo, setExpiryInfo] = useState<string>(initialData?.expiryInfo || '');
  const [fatPercentage, setFatPercentage] = useState<string>(initialData?.fatPercentage || 'full_fat');

  // Category Specific - Beauty
  const [skinType, setSkinType] = useState<string>(initialData?.skinType || 'all');
  const [volume, setVolume] = useState<string>(initialData?.volume || '');
  const [weight, setWeight] = useState<string>(initialData?.weight || '');

  // Tag inputs
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorInput, setCustomColorInput] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#2563EB');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Draft Key
  const draftKey = `shakh_draft_product_${sellerId}_${category}`;

  // Check for saved draft on initial mount
  useEffect(() => {
    if (!initialData && !hasDraftLoaded) {
      try {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title || parsed.description || parsed.price) {
            setDraftNotice('ڕەشنووسێکی پاشەکەوتکراوت هەیە. دەتەوێت بگەڕێیتەوە سەری؟');
          }
        }
      } catch (e) {}
    }
  }, [draftKey, initialData, hasDraftLoaded]);

  // Restore Draft function
  const handleRestoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        if (d.title) setTitle(d.title);
        if (d.subcategory) setSubcategory(d.subcategory);
        if (d.description) setDescription(d.description);
        if (d.price) setPrice(d.price);
        if (d.discountPrice) setDiscountPrice(d.discountPrice);
        if (d.stock !== undefined) setStock(d.stock);
        if (d.unit) setUnit(d.unit);
        if (d.images && d.images.length > 0) setImages(d.images);
        if (d.sizes) setSizes(d.sizes);
        if (d.colors) setColors(d.colors);
        if (d.brand) setBrand(d.brand);
        if (d.model) setModel(d.model);
        if (d.rewardPoints) setRewardPoints(d.rewardPoints);
        setHasDraftLoaded(true);
        setDraftNotice('ڕەشنووسەکەت بە سەرکەوتوویی بارکرایەوە 📝');
        setTimeout(() => setDraftNotice(null), 3000);
      }
    } catch (e) {}
  };

  // Save manual draft
  const handleSaveDraft = () => {
    try {
      const draftObj = {
        title,
        subcategory,
        description,
        condition,
        category,
        price,
        discountPrice,
        stock,
        unit,
        rewardPoints,
        images,
        sizes,
        colors,
        brand,
        model,
        year,
        mileageKm,
        transmission,
        fuelType,
        prepTimeMinutes,
        ingredients,
        meatType,
        cutType,
        origin,
        isOrganic,
        expiryInfo,
        fatPercentage,
        skinType,
        volume,
        weight,
        draftSavedAt: new Date().toISOString()
      };
      localStorage.setItem(draftKey, JSON.stringify(draftObj));
      setDraftNotice('ڕەشنووس بە سەرکەوتوویی پاشەکەوت کرا ✅');
      setTimeout(() => setDraftNotice(null), 3000);
    } catch (e) {}
  };

  // Discard draft
  const handleDiscardDraft = () => {
    localStorage.removeItem(draftKey);
    setDraftNotice(null);
  };

  // Auto calculate suggested points when price changes
  const handlePriceChange = (newPrice: number) => {
    setPrice(newPrice);
    if (!initialData || rewardPoints === undefined) {
      setRewardPoints(calculateSuggestedPoints(newPrice));
    }
  };

  // Handle Category Change
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

  const handleRemoveSpec = (keyToRemove: string) => {
    setSpecs(prev => {
      const next = { ...prev };
      delete next[keyToRemove];
      return next;
    });
  };

  // Tags & Presets Helpers
  const toggleSize = (s: string) => {
    if (sizes.includes(s)) {
      setSizes(sizes.filter(x => x !== s));
    } else {
      setSizes([...sizes, s]);
    }
  };

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSizeInput.trim()) return;
    if (!sizes.includes(customSizeInput.trim())) {
      setSizes([...sizes, customSizeInput.trim()]);
    }
    setCustomSizeInput('');
  };

  const toggleColor = (c: string) => {
    if (colors.includes(c)) {
      setColors(colors.filter(x => x !== c));
    } else {
      setColors([...colors, c]);
    }
  };

  const handleAddCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customColorInput.trim()) return;
    const formatted = `${customColorInput.trim()}`;
    if (!colors.includes(formatted)) {
      setColors([...colors, formatted]);
    }
    setCustomColorInput('');
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientInput.trim()) return;
    if (!ingredients.includes(newIngredientInput.trim())) {
      setIngredients([...ingredients, newIngredientInput.trim()]);
    }
    setNewIngredientInput('');
  };

  const handleRemoveIngredient = (ing: string) => {
    setIngredients(ingredients.filter(x => x !== ing));
  };

  // Step Validation & Navigation
  const validateStep = (stepNum: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepNum === 1) {
      if (!title.trim() || title.trim().length < 2) {
        errs.title = 'تکایە ناوی کاڵا بنووسە (لانیکەم ٢ پیت).';
      }
    } else if (stepNum === 2) {
      const currentCategoryConfig = CATEGORY_FIELD_CONFIGS[category];
      if (category === 'clothes') {
        if (sizes.length === 0) errs.sizes = 'تکایە لانیکەم یەک قەبارە (Size) دیاریبکە.';
        if (colors.length === 0) errs.colors = 'تکایە لانیکەم یەک ڕەنگ (Color) دیاریبکە.';
      } else if (category === 'electronics') {
        if (!brand.trim()) errs.brand = 'تکایە براندی ئامێرەکە بنووسە.';
        if (!model.trim()) errs.model = 'تکایە مۆدێلی ئامێرەکە بنووسە.';
      } else if (category === 'cars') {
        if (!brand.trim()) errs.brand = 'تکایە براندی ئۆتۆمبێل بنووسە.';
        if (!model.trim()) errs.model = 'تکایە مۆدێلی ئۆتۆمبێل بنووسە.';
      } else if (category === 'fresh_meat') {
        if (!cutType.trim()) errs.cutType = 'تکایە بەش یان پارچەی گۆشتەکە بنووسە.';
      }
    } else if (stepNum === 3) {
      if (!price || price <= 0) {
        errs.price = 'تکایە نرخی کاڵا بە دروستی بنووسە.';
      }
      if (discountPrice && discountPrice >= price) {
        errs.discountPrice = 'نرخی داشکاندن دەبێت کەمتر بێت لە نرخی بنەڕەتی.';
      }
      if (stock === undefined || stock < 0) {
        errs.stock = 'ژمارەی کاڵا ناتوانێت کەمتر بێت لە ٠.';
      }
    } else if (stepNum === 4) {
      if (images.length === 0) {
        errs.images = 'تکایە لانیکەم یەک وێنەی کاڵاکە باربکە.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(5, prev + 1) as any);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(1, prev - 1) as any);
  };

  // Final Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Full validation
    const candidateData: Partial<Product> = {
      title,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock),
      sizes,
      colors,
      brand,
      model,
      year: year ? Number(year) : undefined,
      mileageKm: mileageKm !== undefined ? Number(mileageKm) : undefined
    };

    const validation = validateProductCategoryFields(category, candidateData);
    if (!validation.isValid || images.length === 0) {
      const mergedErrors = { ...validation.errors };
      if (images.length === 0) mergedErrors.images = 'تکایە لانیکەم یەک وێنەی کاڵاکە باربکە.';
      setErrors(mergedErrors);
      // Jump to first invalid step
      if (mergedErrors.title) setActiveStep(1);
      else if (mergedErrors.sizes || mergedErrors.colors || mergedErrors.brand || mergedErrors.model) setActiveStep(2);
      else if (mergedErrors.price || mergedErrors.stock || mergedErrors.discountPrice) setActiveStep(3);
      else if (mergedErrors.images) setActiveStep(4);
      return;
    }

    const payload: Omit<Product, 'id' | 'createdAt'> = {
      sellerId: isSuperAdmin ? (currentSellerId === 'custom' ? `custom-${Date.now()}` : currentSellerId) : (sellerId || currentSellerId),
      sellerName: isSuperAdmin ? (currentSellerName || 'بەڕێوەبەرایەتی شاخ') : (sellerName || currentSellerName || 'فرۆشگای شاخ'),
      category,
      subcategory: subcategory || undefined,
      title: title.trim(),
      description: description.trim(),
      condition,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock),
      unit: unit.trim() || 'دانە',
      rewardPoints: Number(rewardPoints || 0),
      images,
      isAvailable,
      isFeatured,
      rating: initialData?.rating || 5.0,
      reviewCount: initialData?.reviewCount || 0,

      // Category fields
      sizes: category === 'clothes' ? sizes : undefined,
      colors: category === 'clothes' || category === 'cars' || category === 'electronics' ? colors : undefined,
      gender: category === 'clothes' ? gender : undefined,
      material: category === 'clothes' ? material : undefined,
      fit: category === 'clothes' ? fit : undefined,
      season: category === 'clothes' ? season : undefined,

      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      warrantyMonths: warrantyMonths ? Number(warrantyMonths) : undefined,
      storageCapacity: category === 'electronics' ? storageCapacity : undefined,
      ramSize: category === 'electronics' ? ramSize : undefined,
      specs: Object.keys(specs).length > 0 ? specs : undefined,

      year: year ? Number(year) : undefined,
      mileageKm: mileageKm !== undefined ? Number(mileageKm) : undefined,
      transmission: category === 'cars' ? transmission : undefined,
      fuelType: category === 'cars' ? fuelType : undefined,

      prepTimeMinutes: prepTimeMinutes ? Number(prepTimeMinutes) : undefined,
      ingredients: category === 'food' ? ingredients : undefined,
      isSpicy: category === 'food' ? isSpicy : undefined,
      isVegetarian: category === 'food' ? isVegetarian : undefined,

      meatType: category === 'fresh_meat' ? meatType : undefined,
      cutType: category === 'fresh_meat' ? cutType.trim() : undefined,

      origin: category === 'fruits_vegetables' || category === 'fresh_meat' || category === 'dairy' || category === 'market' ? origin.trim() : undefined,
      isOrganic: category === 'fruits_vegetables' ? isOrganic : undefined,

      expiryInfo: category === 'dairy' || category === 'beauty' || category === 'market' ? expiryInfo.trim() : undefined,
      fatPercentage: category === 'dairy' ? fatPercentage : undefined,

      skinType: category === 'beauty' ? skinType : undefined,
      volume: category === 'beauty' ? volume.trim() : undefined,
      weight: category === 'fresh_meat' || category === 'market' || category === 'fruits_vegetables' ? weight.trim() : undefined
    };

    // Clean up draft after successful save
    try {
      localStorage.removeItem(draftKey);
    } catch (e) {}

    await onSave(payload);
  };

  const currentCategoryConfig = CATEGORY_FIELD_CONFIGS[category];
  const discountPercentage = discountPrice && discountPrice < price ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const approxUsd = Math.round(price / 1500);

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      
      {/* Draft Notification Toast */}
      {draftNotice && (
        <div className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="font-bold">{draftNotice}</span>
          </div>
          <div className="flex items-center gap-2">
            {!hasDraftLoaded && (
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-3 py-1 bg-white text-blue-700 font-black rounded-xl hover:bg-blue-50 cursor-pointer shadow-xs"
              >
                بەردەوامبوون لە ڕەشنووس
              </button>
            )}
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="p-1 hover:bg-blue-700 rounded-lg text-blue-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header & Step Wizard Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-orange-100 text-orange-600">
                <Package className="w-5 h-5" />
              </span>
              <span>{initialData ? 'دەستکاریکردنی کاڵا' : 'زیادکردنی کاڵای نوێ (Professional Posting)'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              سیستەمی فەرمی شاخ بۆ تۆمارکردنی کاڵا بە وردەکاری پێشکەوتوو بەپێی بەشەکان
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>پاشەکەوتکردنی ڕەشنووس</span>
            </button>
          </div>
        </div>

        {/* 5-Step Progress Indicators */}
        <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
          {[
            { num: 1, label: 'زانیاری سەرەکی', icon: Info },
            { num: 2, label: 'تایبەتمەندییەکان', icon: Sliders },
            { num: 3, label: 'نرخ و پۆینت', icon: DollarSign },
            { num: 4, label: 'وێنەکان (تا ٨)', icon: ImageIcon },
            { num: 5, label: 'پێداچوونەوە', icon: Eye }
          ].map((s) => {
            const Icon = s.icon;
            const isPassed = activeStep >= s.num;
            const isCurrent = activeStep === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (activeStep > s.num || validateStep(activeStep)) {
                    setActiveStep(s.num as any);
                  }
                }}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-500/20 font-black'
                    : isPassed
                    ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold'
                    : 'bg-transparent text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                    isCurrent
                      ? 'bg-orange-500 text-white shadow-xs'
                      : isPassed
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isPassed && activeStep > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-[11px] truncate max-w-full hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* STEP 1: BASIC INFORMATION */}
        {activeStep === 1 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-6 animate-fade-in">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Info className="w-4 h-4 text-orange-500" />
              <span>هەنگاوی ١: زانیارییە سەرەکییەکانی کاڵا</span>
            </h3>

            {/* Super Admin Store Assignment Bar */}
            {isSuperAdmin && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50/60 dark:from-red-950/40 dark:to-orange-950/40 border border-red-200/80 dark:border-red-800/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-red-950 dark:text-red-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>دیاریکردنی فرۆشگا / چێشتخانەی بڵاوکەرەوە (Super Admin Store Assignment)</span>
                  </span>
                  <span className="text-[10px] font-black bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                    دەسەڵاتی سوپەر ئەدمین
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      هەڵبژاردنی فرۆشگا یان چێشتخانەی تۆمارکراو:
                    </label>
                    <select
                      value={currentSellerId}
                      onChange={(e) => {
                        const sid = e.target.value;
                        setCurrentSellerId(sid);
                        if (sid === 'admin-store') {
                          setCurrentSellerName('بەڕێوەبەرایەتی شاخ');
                        } else if (sid === 'custom') {
                          setCurrentSellerName(customSellerName || 'فرۆشگای تایبەت');
                        } else {
                          const matched = sellers.find(s => s.id === sid);
                          if (matched) {
                            setCurrentSellerName(matched.storeName);
                          }
                        }
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500 shadow-xs cursor-pointer"
                    >
                      <option value="admin-store">👑 بەڕێوەبەرایەتی شاخ (Shakh Official Management)</option>
                      <optgroup label="چێشتخانە و فرۆشگاکانی سیستەم">
                        {sellers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.storeName} ({s.category} - {s.city})
                          </option>
                        ))}
                      </optgroup>
                      <option value="custom">✏️ فرۆشگا / چێشتخانەی تر (ناوی تایبەت بنووسە)</option>
                    </select>
                  </div>

                  {currentSellerId === 'custom' ? (
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-1">
                        ناوی فرۆشگا / چێشتخانەی نوێ بنووسە:
                      </label>
                      <input
                        type="text"
                        value={customSellerName}
                        onChange={(e) => {
                          setCustomSellerName(e.target.value);
                          setCurrentSellerName(e.target.value);
                        }}
                        placeholder="وەک: چێشتخانەی کەبابی هەولێر، شاخ مۆبایل..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500 shadow-xs"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col justify-end">
                      <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">بڵاو دەبێتەوە بە ناوی:</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">{currentSellerName}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">بەشی سەرەکی (Category) *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(Object.keys(CATEGORY_FIELD_CONFIGS) as ProductCategory[]).map((catKey) => {
                  const cfg = CATEGORY_FIELD_CONFIGS[catKey];
                  const isSelected = category === catKey;
                  const isDisabled = !isSuperAdmin && Boolean(allowedCategory && catKey !== allowedCategory);

                  return (
                    <button
                      key={catKey}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleCategoryChange(catKey)}
                      className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 ring-2 ring-orange-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
                      } ${isDisabled ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{cfg.labelKurdish}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-latin truncate">{cfg.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategory Selector */}
            {currentCategoryConfig.subcategories && currentCategoryConfig.subcategories.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">بەشی لاوەکی / پۆلێن (Subcategory)</label>
                <div className="flex flex-wrap gap-2">
                  {currentCategoryConfig.subcategories.map((sub) => {
                    const isSelected = subcategory === sub.label || subcategory === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSubcategory(sub.label)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">ناوی کاڵا یان خواردن (Product Title) *</label>
                <span className="text-[10px] text-slate-400 font-latin">{title.length}/100</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="نموونە: تیشێرتی لۆکەی زارا، مۆبایلی ئایفۆن ١٥ پرۆ ماکس، کەبابی بەرخی تایبەت..."
                className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all ${
                  errors.title ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20' : 'border-slate-200 dark:border-slate-700 focus:border-orange-500'
                }`}
              />
              {errors.title && <p className="text-[11px] text-red-500 font-bold">{errors.title}</p>}
            </div>

            {/* Condition: New / Used / Refurbished */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">دۆخی کاڵا (Condition)</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: 'new', label: 'نوێ (Brand New)' },
                  { value: 'used', label: 'بەکارهاتوو (Used)' },
                  { value: 'refurbished', label: 'نوێکراوەتەوە (Refurbished)' }
                ].map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCondition(c.value as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      condition === c.value
                        ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-700 dark:text-orange-300 shadow-xs ring-2 ring-orange-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">وەسف و ڕوونکردنەوەی تەواو (Description)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="تایبەتمەندی، دۆخ، شێوازی بەکارهێنان و گرنگترین خاڵەکانی کاڵاکەت بنووسە بۆ کڕیار..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-orange-500 focus:outline-none text-xs sm:text-sm leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORY SPECIFICATIONS */}
        {activeStep === 2 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-6 animate-fade-in">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Sliders className="w-4 h-4 text-orange-500" />
              <span>هەنگاوی ٢: تایبەتمەندییە تایبەتەکانی ({currentCategoryConfig.labelKurdish})</span>
            </h3>

            {/* CLOTHES SPECIFIC FIELDS */}
            {category === 'clothes' && (
              <div className="space-y-5">
                {/* Sizes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">قەبارە بەردەستەکان (Available Sizes) *</label>
                    <span className="text-[11px] text-orange-600 dark:text-orange-400 font-bold">{sizes.length} قەبارە دیاریکراوە</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentCategoryConfig.fields.find(f => f.name === 'sizes')?.presets?.map((sz) => {
                      const isSelected = sizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSize(sz)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-latin transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-600/30'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Size */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      placeholder="قەبارەی تایبەت (وەک: 38/32, 4X, منداڵان ٣ ساڵ)..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 cursor-pointer"
                    >
                      زیادکردن
                    </button>
                  </div>
                  {errors.sizes && <p className="text-[11px] text-red-500 font-bold">{errors.sizes}</p>}
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">ڕەنگە بەردەستەکان (Colors) *</label>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">{colors.length} ڕەنگ دیاریکراوە</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {POPULAR_COLORS.map((c) => {
                      const isSelected = colors.includes(c.value);
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => toggleColor(c.value)}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-xs ring-2 ring-purple-500/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-xs flex-shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="truncate text-[11px]">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Color */}
                  <div className="flex gap-2 pt-1 items-center">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      placeholder="ناوی ڕەنگ (وەک: شینی ئاسمانی، زەیتوونی، برۆنزی)..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 cursor-pointer"
                    >
                      زیادکردن
                    </button>
                  </div>
                  {errors.colors && <p className="text-[11px] text-red-500 font-bold">{errors.colors}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">ڕەگەز (Target Gender)</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-purple-500"
                    >
                      <option value="men">پیاوان (Men)</option>
                      <option value="women">ئافرەتان (Women)</option>
                      <option value="kids">منداڵان (Kids)</option>
                      <option value="unisex">هاوبەش (Unisex)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">براند (Brand)</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="وەک: Zara, Nike, Adidas, Mango..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">قوماش و کەرەستە (Material)</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="وەک: ١٠٠٪ لۆکە، جینز، کەتان..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ELECTRONICS SPECIFIC FIELDS */}
            {category === 'electronics' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">کۆمپانیا / براند (Brand) *</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="وەک: Apple, Samsung, Sony, Xiaomi, Asus..."
                      className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border text-xs focus:outline-none ${
                        errors.brand ? 'border-red-400 bg-red-50/30' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                      }`}
                    />
                    {errors.brand && <p className="text-[11px] text-red-500 font-bold">{errors.brand}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">مۆدێلی تەواو (Model) *</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="وەک: iPhone 15 Pro Max 256GB, Galaxy S24..."
                      className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border text-xs focus:outline-none ${
                        errors.model ? 'border-red-400 bg-red-50/30' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                      }`}
                    />
                    {errors.model && <p className="text-[11px] text-red-500 font-bold">{errors.model}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">قەبارەی بیرگە (Storage)</label>
                    <select
                      value={storageCapacity}
                      onChange={(e) => setStorageCapacity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold font-latin focus:outline-none focus:border-blue-500"
                    >
                      <option value="">هەڵبژێرە (یان بنووسە)</option>
                      <option value="128GB">128 GB</option>
                      <option value="256GB">256 GB</option>
                      <option value="512GB">512 GB</option>
                      <option value="1TB">1 TB</option>
                      <option value="2TB">2 TB</option>
                      <option value="64GB">64 GB</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">ڕام (RAM)</label>
                    <select
                      value={ramSize}
                      onChange={(e) => setRamSize(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold font-latin focus:outline-none focus:border-blue-500"
                    >
                      <option value="">هەڵبژێرە</option>
                      <option value="8GB">8 GB</option>
                      <option value="12GB">12 GB</option>
                      <option value="16GB">16 GB</option>
                      <option value="32GB">32 GB</option>
                      <option value="6GB">6 GB</option>
                      <option value="4GB">4 GB</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">گارانتی (بە مانگ)</label>
                    <input
                      type="number"
                      value={warrantyMonths || ''}
                      onChange={(e) => setWarrantyMonths(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="١٢ مانگ"
                      min={0}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-latin focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Custom Specs Table */}
                <div className="space-y-2.5 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">تایبەتمەندییە وردەکان (Specs Key/Value)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="تایبەتمەندی (وەک: پاتری، کامێرا)..."
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="بها (وەک: 5000 mAh, 200MP)..."
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
                    >
                      زیادکردن
                    </button>
                  </div>

                  {Object.keys(specs).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {Object.entries(specs).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{k}: {v}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(k)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CARS SPECIFIC FIELDS */}
            {category === 'cars' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">کۆمپانیا / براند (Make) *</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="وەک: Toyota, Mercedes-Benz, BMW, Kia..."
                      className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border text-xs focus:outline-none ${
                        errors.brand ? 'border-red-400 bg-red-50/30' : 'border-slate-200 dark:border-slate-700 focus:border-amber-500'
                      }`}
                    />
                    {errors.brand && <p className="text-[11px] text-red-500 font-bold">{errors.brand}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">مۆدێل (Model) *</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="وەک: Land Cruiser, Camry, Tucson..."
                      className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border text-xs focus:outline-none ${
                        errors.model ? 'border-red-400 bg-red-50/30' : 'border-slate-200 dark:border-slate-700 focus:border-amber-500'
                      }`}
                    />
                    {errors.model && <p className="text-[11px] text-red-500 font-bold">{errors.model}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">ساڵی دروستکردن (Year) *</label>
                    <input
                      type="number"
                      value={year || ''}
                      onChange={(e) => setYear(Number(e.target.value))}
                      min={1980}
                      max={new Date().getFullYear() + 1}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-latin focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">ڕۆیشتن (کیلۆمەتر)</label>
                    <input
                      type="number"
                      value={mileageKm !== undefined ? mileageKm : ''}
                      onChange={(e) => setMileageKm(Number(e.target.value))}
                      min={0}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-latin focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">گێڕ (Transmission)</label>
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="automatic">ئۆتۆماتیک (Automatic)</option>
                      <option value="manual">عادی / دەستی (Manual)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">سووتەمەنی (Fuel)</label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="gasoline">بەنزین (Gasoline)</option>
                      <option value="hybrid">هایبرید (Hybrid)</option>
                      <option value="electric">کارەبایی (Electric)</option>
                      <option value="diesel">گاز / دیزڵ (Diesel)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">دەبڵ ئەکسل (Drivetrain)</label>
                    <select
                      value={drivetrain}
                      onChange={(e) => setDrivetrain(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      {CAR_DRIVETRAINS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">دۆخی بۆیاخ (Paint Condition)</label>
                    <select
                      value={paintStatus}
                      onChange={(e) => setPaintStatus(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      {CAR_PAINT_CONDITIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">دۆخی لێدران و ڕووداو (Accident)</label>
                    <select
                      value={accidentStatus}
                      onChange={(e) => setAccidentStatus(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      {CAR_ACCIDENT_CONDITIONS.map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* RESTAURANT / FOOD SPECIFIC FIELDS */}
            {category === 'food' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">کاتی ئامادەکردن (بە خولەک)</label>
                    <input
                      type="number"
                      value={prepTimeMinutes || ''}
                      onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                      placeholder="٢٠ خولەک"
                      min={5}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-latin focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">تیژی خواردن (Spicy)</label>
                    <button
                      type="button"
                      onClick={() => setIsSpicy(!isSpicy)}
                      className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSpicy ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300 ring-2 ring-red-500/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Flame className={`w-4 h-4 ${isSpicy ? 'text-red-600 fill-red-600' : 'text-slate-400'}`} />
                      <span>{isSpicy ? 'تیژە (Spicy)' : 'تیژ نییە (Mild)'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">گیاخۆری (Vegetarian)</label>
                    <button
                      type="button"
                      onClick={() => setIsVegetarian(!isVegetarian)}
                      className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isVegetarian ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{isVegetarian ? 'گیاخۆرییە (Vegetarian)' : 'ئاسایی / گۆشتخۆر'}</span>
                    </button>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">پێکهاتەکان (Ingredients)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newIngredientInput}
                      onChange={(e) => setNewIngredientInput(e.target.value)}
                      placeholder="پێکهاتە بنووسە (وەک: پەنیری مۆزارێلا، قارچک، سنگی مریشک)..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 cursor-pointer"
                    >
                      زیادکردن
                    </button>
                  </div>

                  {ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ingredients.map((ing) => (
                        <span key={ing} className="px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                          <span>{ing}</span>
                          <button type="button" onClick={() => handleRemoveIngredient(ing)} className="hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FRESH MEAT SPECIFIC FIELDS */}
            {category === 'fresh_meat' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">جۆری گۆشت (Meat Type) *</label>
                    <select
                      value={meatType}
                      onChange={(e) => setMeatType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-rose-500"
                    >
                      <option value="lamb">گۆشتی بەرخی خۆماڵی (Lamb)</option>
                      <option value="beef">گۆشتی گوێرەکە و مانگا (Beef)</option>
                      <option value="chicken">مریشکی تازەی سەربڕاو (Fresh Chicken)</option>
                      <option value="fish">ماسی تازەی روبار (Fresh Fish)</option>
                      <option value="turkey">گۆشتی قەل و پەلەوەر (Turkey)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">پارچە / بڕینی گۆشت (Cut) *</label>
                    <input
                      type="text"
                      value={cutType}
                      onChange={(e) => setCutType(e.target.value)}
                      placeholder="وەک: ڕان، پەراسو، فیلیە، دەست، هاڕاو، تیکە بۆ کەباب..."
                      className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border text-xs focus:outline-none ${
                        errors.cutType ? 'border-red-400 bg-red-50/30' : 'border-slate-200 dark:border-slate-700 focus:border-rose-500'
                      }`}
                    />
                    {errors.cutType && <p className="text-[11px] text-red-500 font-bold">{errors.cutType}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">سەرچاوەی سەربڕین (Origin & Halal)</label>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="وەک: سەربڕاوی ناوخۆی کوردستان (١٠٠٪ حەڵاڵ)..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">کێش یان قەبارەی پاکێج (Weight)</label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="وەک: ١ کیلۆگرام، ٥٠٠ گرام، نیو لاشە..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FRUITS & VEGETABLES */}
            {category === 'fruits_vegetables' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">سەرچاوە و ناوچەی بەرهەمهێنان (Origin)</label>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="وەک: باخچەکانی پێنجوێن، شارەزوور، بەردەڕەش..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">١٠٠٪ ئۆرگانیک و سروشتی</label>
                    <button
                      type="button"
                      onClick={() => setIsOrganic(!isOrganic)}
                      className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isOrganic ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Sparkles className={`w-4 h-4 ${isOrganic ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{isOrganic ? 'بەرهەمی ئۆرگانیکی مسۆگەر' : 'بەرهەمی ئاسایی'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DAIRY SPECIFIC FIELDS */}
            {category === 'dairy' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">ڕێژەی چەوری (Fat Content)</label>
                    <select
                      value={fatPercentage}
                      onChange={(e) => setFatPercentage(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-cyan-500"
                    >
                      <option value="full_fat">چەوری تەواو و سروشتی (Full Fat)</option>
                      <option value="medium_fat">نیوە چەوری (Medium Fat)</option>
                      <option value="low_fat">کەم چەوری (Low Fat)</option>
                      <option value="skimmed">بێ چەوری (Skimmed)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">ماوەی بەسەرچوون و پاراستن (Shelf Life)</label>
                    <input
                      type="text"
                      value={expiryInfo}
                      onChange={(e) => setExpiryInfo(e.target.value)}
                      placeholder="وەک: ٥ ڕۆژ لە ساردکەرەوە..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">سەرچاوەی شیرەمەنی (Origin)</label>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="وەک: ماستی مەڕی بەردەڕەش..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BEAUTY & COSMETICS */}
            {category === 'beauty' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">براند (Brand) *</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="وەک: The Ordinary, CeraVe, Maybelline..."
                      className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border text-xs focus:outline-none ${
                        errors.brand ? 'border-red-400 bg-red-50/30' : 'border-slate-200 dark:border-slate-700 focus:border-pink-500'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">گونجاو بۆ پێست (Skin Type)</label>
                    <select
                      value={skinType}
                      onChange={(e) => setSkinType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-pink-500"
                    >
                      <option value="all">سەرجەم جۆرەکان (All Skin Types)</option>
                      <option value="oily">پێستی چەور (Oily Skin)</option>
                      <option value="dry">پێستی وشک (Dry Skin)</option>
                      <option value="sensitive">پێستی هەستیار (Sensitive)</option>
                      <option value="combination">پێستی تێکەڵ (Combination)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">قەبارە / کێش (Volume/Weight)</label>
                    <input
                      type="text"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      placeholder="وەک: 30ml, 50ml, 100g..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MARKET / GROCERY */}
            {category === 'market' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">براند (Brand)</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="وەک: Nestle, Dano, Almarai..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">کێش یان قەبارەی پاکێج</label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="وەک: 800g, 1 Liter, 5 Kg..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">بەرواری بەسەرچوون (Expiry)</label>
                    <input
                      type="text"
                      value={expiryInfo}
                      onChange={(e) => setExpiryInfo(e.target.value)}
                      placeholder="وەک: 2026/12..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PRICE, STOCK, DELIVERY & REWARD POINTS */}
        {activeStep === 3 && (
          <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-fade-in">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <DollarSign className="w-4 h-4 text-orange-500" />
              <span>هەنگاوی ٣: نرخ، داشکاندن، کۆگا و پۆینتی شڕینی</span>
            </h3>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">نرخی بنەڕەتی (دیناری عێراقی) *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    min={250}
                    step={250}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-black font-latin bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none ${
                      errors.price ? 'border-red-400 bg-red-50/30' : 'border-slate-200 dark:border-slate-700 focus:border-orange-500'
                    }`}
                  />
                  <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">د.ع</span>
                </div>
                {errors.price && <p className="text-[11px] text-red-500 font-bold">{errors.price}</p>}
                <p className="text-[11px] text-slate-400 font-latin">≈ ${approxUsd.toLocaleString()} USD</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">نرخی داشکاندن (داشکاو)</label>
                  {discountPercentage > 0 && (
                    <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                      <Percent className="w-3 h-3" />
                      <span>{discountPercentage}٪ داشکاندن</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={discountPrice || ''}
                    onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="ئارەزوومەندانە"
                    min={250}
                    step={250}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-black font-latin bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none ${
                      errors.discountPrice ? 'border-red-400 bg-red-50/30' : 'border-slate-200 dark:border-slate-700 focus:border-orange-500'
                    }`}
                  />
                  <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">د.ع</span>
                </div>
                {errors.discountPrice && <p className="text-[11px] text-red-500 font-bold">{errors.discountPrice}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">ژمارەی بەردەست لە کۆگا (Stock) *</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  min={0}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-black font-latin bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Unit & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">یەکەی فرۆشتن (Unit of Sale)</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-orange-500 focus:outline-none"
                >
                  <option value="دانە">دانە (Piece)</option>
                  <option value="کیلۆگرام">کیلۆگرام (Kg)</option>
                  <option value="سندووق">سندووق / کارتۆن (Box)</option>
                  <option value="پاکێج">پاکێج / سێت (Pack)</option>
                  <option value="دەسک">دەسک (Bundle)</option>
                  <option value="مەتر">مەتر (Meter)</option>
                  <option value="لیتر">لیتر (Liter)</option>
                  <option value="دەرزەن">دەرزەن (Dozen)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">دۆخی بەردەستبوون لە فرۆشگا</label>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`w-full py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isAvailable
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300'
                  }`}
                >
                  <span>{isAvailable ? 'بەردەستە بۆ کڕین (Available)' : 'تەواوبووە / ناچالاکە (Out of Stock)'}</span>
                  <div className={`w-3.5 h-3.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </button>
              </div>
            </div>

            {/* Shakh Reward Points System Integration */}
            <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 dark:from-amber-950/30 dark:to-orange-950/30 p-5 rounded-3xl border border-amber-200/80 dark:border-amber-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">پۆینتی خەڵاتی شاخ بۆ کڕیار (Reward Points)</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      پۆینت دەدرێتە کڕیار لە کاتی کڕینی ئەم کاڵایە (١٥٠ پۆینت = ١ دیناری عێراقی)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRewardPoints(calculateSuggestedPoints(price))}
                  className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>پێشنیاری خۆکار</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(Number(e.target.value))}
                  min={0}
                  step={50}
                  className="w-40 px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-amber-300 dark:border-amber-700 text-sm font-black font-latin focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  پۆینت (بەرامبەر بە {Math.round(rewardPoints / 150)} دینار داشکاندن لە داهاتوودا)
                </span>
              </div>
            </div>

            {/* Featured Product Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">پیشاندان لە بەشی سەرەکی و تایبەتەکان (Featured)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">کاڵاکەت لە سەرەوەی ئەپ و بەشی VIP دەردەکەوێت</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isFeatured ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    isFeatured ? 'right-7' : 'right-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: IMAGES & MEDIA */}
        {activeStep === 4 && (
          <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-fade-in">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ImageIcon className="w-4 h-4 text-orange-500" />
              <span>هەنگاوی ٤: وێنە و میدیای کاڵا (تا ٨ وێنەی کوالیتی بەرز)</span>
            </h3>

            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={8}
              label="وێنەکانی کاڵا یان ئۆتۆمبێل (تا ٨ وێنە)"
              helperText="وێنەی ڕوون و جوان دابنێ. دەتوانیت لە ڕێگەی تیرەکان وێنەکان پێش و پاش بکەیت و یەکەم وێنە وەک وێنەی سەرەکی دادەنرێت."
            />
            {errors.images && <p className="text-[11px] text-red-500 font-bold">{errors.images}</p>}
          </div>
        )}

        {/* STEP 5: PREVIEW & PUBLISH */}
        {activeStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Eye className="w-4 h-4 text-orange-500" />
                <span>هەنگاوی ٥: پێداچوونەوە و بڵاوکردنەوە (Live Preview)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ئەمە ئەو شێوازەیە کە کڕیار لە ئەپ و وێبسایتدا کاڵاکەت دەبینێت:
              </p>

              {/* Product Preview Card */}
              <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden p-4 space-y-4">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={images[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800'}
                    alt={title || 'Product'}
                    className="w-full h-full object-cover"
                  />
                  {discountPercentage > 0 && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-xs">
                      {discountPercentage}٪ داشکاندن
                    </span>
                  )}
                  {rewardPoints > 0 && (
                    <span className="absolute bottom-3 right-3 bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      <span>+{rewardPoints} پۆینت</span>
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">{currentCategoryConfig.labelKurdish}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                      {isAvailable ? 'بەردەستە لە کۆگا' : 'تەواوبووە'}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 dark:text-slate-100">{title || 'ناوی کاڵا'}</h4>
                  
                  {description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{description}</p>
                  )}

                  {/* Dynamic Badges in Preview */}
                  {category === 'clothes' && sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold ml-1">قەبارە:</span>
                      {sizes.slice(0, 5).map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded">
                          {s}
                        </span>
                      ))}
                      {sizes.length > 5 && <span className="text-[10px] text-slate-400">+{sizes.length - 5} تر</span>}
                    </div>
                  )}

                  {category === 'cars' && (
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-bold pt-1">
                      {year && <span>ساڵ: {year}</span>}
                      {mileageKm !== undefined && <span>• {mileageKm.toLocaleString()} کم</span>}
                      {transmission && <span>• {transmission === 'automatic' ? 'ئۆتۆماتیک' : 'عادی'}</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      {discountPrice && discountPrice < price ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-latin">
                            {discountPrice.toLocaleString()} د.ع
                          </span>
                          <span className="text-xs text-slate-400 line-through font-latin">
                            {price.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-latin">
                          {price.toLocaleString()} د.ع
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">فرۆشیار: {sellerName || 'فرۆشگای شاخ'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div>
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 sm:px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>هەنگاوی پێشوو</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 sm:px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs sm:text-sm font-bold cursor-pointer transition-colors"
              >
                پاشگەزبوونەوە
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 sm:px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-95"
              >
                <span>هەنگاوی دواتر</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 sm:px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg hover:shadow-xl cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? 'پاشەکەوت دەکرێت...' : initialData ? 'نوێکردنەوەی کاڵا' : 'بڵاوکردنەوەی کاڵا لە شاخ'}</span>
              </button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
};
