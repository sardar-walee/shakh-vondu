import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Navigation,
  Compass,
  Info,
  Award,
  Gift,
  Sparkles,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useLanguage } from '../context/LanguageContext';
import { PaymentMethod, GeoLocation } from '../types';
import { CITIES } from '../data/seedData';
import { calculateDeliveryFee, CITY_NEIGHBORHOOD_DISTANCES } from '../utils/deliveryUtils';
import { GPSLocationPicker } from '../components/common/GPSLocationPicker';
import { calculateDistanceKm, KURDISTAN_CITIES_COORDS } from '../utils/geoUtils';

interface CartCheckoutViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CartCheckoutView: React.FC<CartCheckoutViewProps> = ({ onNavigate }) => {
  const { items, subtotal, clearCart, primarySellerName, primarySellerId } = useCart();
  const { currentUser, updateUserProfile } = useAuth();
  const { sellers, createOrder, getUserPointsWallet, pointsSettings, calculateDiscountFromPoints, redeemPoints } = useMarketplace();
  const { dir } = useLanguage();

  const [name, setName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Erbil (هەولێر)');
  const [area, setArea] = useState(currentUser?.area || 'بەختیاری');
  const [distanceKm, setDistanceKm] = useState<number>(3.5);
  const [address, setAddress] = useState(currentUser?.address || '');
  const [deliveryGeoLocation, setDeliveryGeoLocation] = useState<GeoLocation | null>(currentUser?.geoLocation || null);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Shakh Loyalty Points state
  const userPointsWallet = getUserPointsWallet(currentUser?.id || 'cust-demo', currentUser?.role || 'customer');
  const availablePoints = userPointsWallet?.totalPoints || 0;
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  // Primary seller from cart
  const primarySeller = useMemo(() => {
    if (!items.length) return null;
    const sId = primarySellerId || items[0].product.sellerId;
    return sellers.find(s => s.id === sId) || null;
  }, [items, primarySellerId, sellers]);

  // Delivery calculation based on seller's zone
  const deliveryCalc = useMemo(() => {
    return calculateDeliveryFee({
      seller: primarySeller,
      distanceKm,
      subtotal
    });
  }, [primarySeller, distanceKm, subtotal]);

  const activeDeliveryFee = deliveryCalc.deliveryFee;
  const PLATFORM_SERVICE_FEE = 250; // Fixed 250 IQD customer platform fee
  const calculatedGrandTotal = subtotal + activeDeliveryFee + PLATFORM_SERVICE_FEE;

  // Points redemption calculation
  const pointsRate = pointsSettings?.pointsPerIQD || 150;
  const maxPossibleDiscount = calculatedGrandTotal;
  const maxRedeemablePoints = Math.min(availablePoints, Math.floor(maxPossibleDiscount * pointsRate));

  const pointsDiscountIQD = usePoints && pointsToRedeem > 0
    ? Math.min(maxPossibleDiscount, Math.round(calculateDiscountFromPoints(pointsToRedeem)))
    : 0;

  const finalGrandTotal = Math.max(0, calculatedGrandTotal - pointsDiscountIQD);

  // Estimated points customer will earn on this order (2% reward)
  const estimatedEarnedPoints = Math.max(10, Math.round((subtotal * 0.02)));

  // Available neighborhood presets for the current city
  const cityNeighborhoods = CITY_NEIGHBORHOOD_DISTANCES[city] || [
    { name: 'ناوەندی شار', approxKm: 2.0 },
    { name: 'دەوروبەری شار', approxKm: 6.5 }
  ];

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800">سەبەتەکەت بەتاڵە</h2>
        <p className="text-xs text-slate-500 mt-2">سەرەتا چەند کاڵایەک بخەرە سەبەتەکەتەوە پێش تەواوکردنی داواکاری.</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-5 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
        >
          گەڕانەوە بۆ بەشەکان
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('تکایە هەموو زانیارییەکانی ناونیشان و ژمارە تەلەفۆن پڕبکەرەوە.');
      return;
    }

    if (deliveryCalc.statusType === 'out_of_range') {
      setErrorMessage(`داواکاری ناکرێت: بۆ ئێرە بەردەست نییە! (ناونیشانی دیاریکراو ${distanceKm} کم لە دەرەوەی سنوری گەیاندنی فرۆشگایەیە کە ${primarySeller?.deliveryZone?.maxDistanceKm || 12} کم).`);
      return;
    }

    setIsSubmitting(true);

    let appliedDiscount = 0;
    let redeemedPts = 0;

    if (usePoints && pointsToRedeem > 0) {
      redeemedPts = Math.min(pointsToRedeem, maxRedeemablePoints);
      if (redeemedPts > 0) {
        const res = redeemPoints(
          currentUser?.id || 'cust-demo',
          redeemedPts,
          `داشکاندنی سەر داواکاری بە بڕی ${calculateDiscountFromPoints(redeemedPts).toLocaleString()} د.ع`
        );
        if (res.success) {
          appliedDiscount = Math.round(calculateDiscountFromPoints(redeemedPts));
        } else {
          setErrorMessage(res.message);
          setIsSubmitting(false);
          return;
        }
      }
    }

    const orderItems = items.map(item => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: item.product.id,
      productTitle: item.product.title,
      productImage: item.product.images[0],
      price: item.product.discountPrice || item.product.price,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      specialInstructions: item.specialInstructions,
      total: (item.product.discountPrice || item.product.price) * item.quantity
    }));

    const result = await createOrder({
      items: orderItems,
      subtotal,
      deliveryFee: activeDeliveryFee,
      platformFee: PLATFORM_SERVICE_FEE,
      deliveryDistanceKm: distanceKm,
      deliveryZoneStatus: deliveryCalc.isWithinRadius ? 'within_radius' : 'custom_distance',
      total: Math.max(0, calculatedGrandTotal - appliedDiscount),
      paymentMethod,
      customerNotes: notes,
      deliveryAddress: `${city} - ${area} - ${address} (دوری: ${distanceKm} کم)`,
      deliveryCity: city,
      deliveryGeoLocation: deliveryGeoLocation || undefined,
      pointsUsed: redeemedPts,
      pointsDiscount: appliedDiscount,
      pointsEarned: estimatedEarnedPoints
    });

    setIsSubmitting(false);

    if (result.success && result.orderId) {
      clearCart();

      // Persist latest location and address back to currentUser profile in Firestore
      if (currentUser) {
        updateUserProfile({
          city,
          area,
          address,
          geoLocation: deliveryGeoLocation || undefined
        }).catch(() => {});
      }

      // Confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      onNavigate('order-tracking', result.orderId);
    } else {
      setErrorMessage(result.error || 'هەڵەیەک ڕوویدا لە تۆمارکردنی داواکاری');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      <div className="text-right">
        <h1 className="text-2xl font-black text-slate-900">تەواوکردنی کڕین و گەیاندن</h1>
        <p className="text-xs text-slate-500 mt-1">
          زانیاری ناونیشانەکەت بنووسە بۆ دیاریکردنی وردی دوری و خەرجی گەیاندن.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Delivery Address & Contact - 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Contact Details */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              زانیاری وەرگر
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">ناوی تەواو *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ناوی کڕیار"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-3 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">ژمارەی مۆبایل *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0750 xxx xxxx"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-3 text-xs font-latin focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Location & Distance Zone Engine */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>ناونیشانی گەیاندن و هەژماری دوری (Delivery Zone)</span>
              </h3>
              {primarySeller?.deliveryZone && (
                <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800">
                  سنوری فرۆشگا: ٠ - {primarySeller.deliveryZone.maxDistanceKm} کم
                </span>
              )}
            </div>

            {/* City Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">شار *</label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  const firstNeighbor = (CITY_NEIGHBORHOOD_DISTANCES[e.target.value] || [])[0];
                  if (firstNeighbor) {
                    setArea(firstNeighbor.name);
                    setDistanceKm(firstNeighbor.approxKm);
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500 cursor-pointer"
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* GPS Live Location Detection */}
            <GPSLocationPicker
              label="دیاریکردنی شوێنی وەرگرتنی داواکاری بە GPS (خێرا و ورد)"
              required={true}
              autoPrompt={true}
              initialCity={city}
              initialAddress={address}
              initialGeoLocation={deliveryGeoLocation}
              onLocationChange={(loc) => {
                if (loc.city) setCity(loc.city);
                if (loc.area) setArea(loc.area);
                if (loc.address) setAddress(loc.address);
                if (loc.geoLocation) {
                  setDeliveryGeoLocation(loc.geoLocation);

                  // Auto update user profile in database
                  if (currentUser) {
                    updateUserProfile({
                      city: loc.city || city,
                      area: loc.area || area,
                      address: loc.address || address,
                      geoLocation: loc.geoLocation
                    });
                  }

                  // Calculate distance if seller coords or city coords are available
                  const sellerCoords = primarySeller?.geoLocation || (primarySeller?.city ? KURDISTAN_CITIES_COORDS[primarySeller.city] : null);
                  if (sellerCoords && loc.geoLocation) {
                    const sLat = 'latitude' in sellerCoords ? sellerCoords.latitude : (sellerCoords as any).lat;
                    const sLng = 'longitude' in sellerCoords ? sellerCoords.longitude : (sellerCoords as any).lng;
                    const dist = calculateDistanceKm(
                      sLat,
                      sLng,
                      loc.geoLocation.latitude,
                      loc.geoLocation.longitude
                    );
                    if (dist > 0) setDistanceKm(Math.max(1, Math.min(dist, 50)));
                  }
                }
              }}
            />

            {/* Neighborhood Quick Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                دیاریکردنی خێرای گەڕەک و دوری لە {city}:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {cityNeighborhoods.map((n, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setArea(n.name);
                      setDistanceKm(n.approxKm);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      area === n.name
                        ? 'bg-orange-500 text-white font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{n.name}</span>
                    <span className={`text-[10px] font-latin ${area === n.name ? 'text-white/80' : 'text-slate-400'}`}>
                      ({n.approxKm} کم)
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Slider & Custom Manual Zone Input */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-orange-500" />
                  <span>دەستنیشانکردنی دەستیی زۆنی گەیاندن و دوری:</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">دوری بە کم:</span>
                  <input
                    type="number"
                    min={0.1}
                    max={60}
                    step={0.5}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Math.max(0.1, Number(e.target.value)))}
                    className="w-16 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1 text-center text-xs font-black font-latin text-orange-600 dark:text-orange-400 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Preset Zone Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'زۆنی ۱ (٠ - ٣ کم)', km: 2 },
                  { label: 'زۆنی ۲ (٣ - ٧ کم)', km: 5 },
                  { label: 'زۆنی ۳ (٧ - ١٢ کم)', km: 9 },
                  { label: `زۆنی ٤ (+١٢ کم - دەرەوە)`, km: (primarySeller?.deliveryZone?.maxDistanceKm || 12) + 3 }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDistanceKm(preset.km)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      distanceKm === preset.km
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-400'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min={0.5}
                max={Math.max(30, (primarySeller?.deliveryZone?.maxDistanceKm || 20) + 10)}
                step={0.5}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />

              {/* Status Banner */}
              {deliveryCalc.statusType === 'out_of_range' ? (
                <div className="bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-500 p-3.5 rounded-xl text-xs font-bold flex items-center justify-between gap-3 text-rose-800 dark:text-rose-200 shadow-xs animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    <div>
                      <span className="font-black text-rose-700 dark:text-rose-300 text-sm block">🔴 بۆ ئێرە بەردەست نییە</span>
                      <span className="text-[11px] font-normal text-rose-600 dark:text-rose-400">
                        دوری دیاریکراو ({distanceKm} کم) لە سنوری گەیاندنی ئەم فرۆشگایەیە ({primarySeller?.deliveryZone?.maxDistanceKm || 12} کم) زیاترە.
                      </span>
                    </div>
                  </div>
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md flex-shrink-0">
                    بەردەست نییە
                  </span>
                </div>
              ) : (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 ${
                  deliveryCalc.statusType === 'in_range'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {deliveryCalc.statusType === 'in_range' && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                    {deliveryCalc.statusType === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                    <span>{deliveryCalc.statusText}</span>
                  </div>

                  <span className="text-[11px] font-latin font-black flex-shrink-0">
                    ~{deliveryCalc.estimatedMinutes} خولەک
                  </span>
                </div>
              )}
            </div>

            {/* Custom Neighborhood / Street text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">ناوی گەڕەک (ئەگەر لە لیستەکەدا نییە) *</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="وەک: بەختیاری، ئاشتی، نزارکێ..."
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-3 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">تێبینی تایبەت بۆ شۆفێری گەیاندن</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="وەک: لە دەرگا مەدە، تەلەفۆن بکە..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-3 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">ناونیشانی تەواو (شەقام، ژمارەی خانوو یان باڵەخانە) *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ڕوونکردنەوەی ناونیشان بە دیاری کراوی..."
                rows={2}
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-3 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" />
              شێوازی پارەدان
            </h3>

            <div className="space-y-2.5">
              {[
                { id: 'cash_on_delivery' as PaymentMethod, title: 'پارەدان لە کاتی وەرگرتن (کاش / Cash on Delivery)', desc: 'پارەکە بە کاش ڕادەستی کاپتنی گەیاندن بکە لە کاتی گەیشتنی کاڵاکان', icon: <Banknote className="w-5 h-5 text-emerald-600" /> },
                { id: 'fib' as PaymentMethod, title: 'FIB (بانکی نێودەوڵەتی یەکەمی عێراق)', desc: 'پارەدانی ڕاستەوخۆ و پارێزراو لە ڕێگەی ئەپی FIB', icon: <CreditCard className="w-5 h-5 text-blue-600" /> },
                { id: 'fastpay' as PaymentMethod, title: 'فاستپەی (FastPay Wallet)', desc: 'پارەدان بە کەمترین خولەک لە ڕێگەی باڵانسی FastPay', icon: <CreditCard className="w-5 h-5 text-orange-500" /> },
                { id: 'zaincash' as PaymentMethod, title: 'زەین کاش (ZainCash)', desc: 'پارەدان بە باڵانسی جزدانی زەین کاش', icon: <CreditCard className="w-5 h-5 text-purple-600" /> }
              ].map(method => (
                <label
                  key={method.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/30 dark:bg-slate-900/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="mt-1 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{method.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Order Summary - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 sticky top-28 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">پوختەی داواکاری ({items.length})</h3>
              {primarySellerName && (
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                  {primarySellerName}
                </span>
              )}
            </div>

            {/* Items Mini List */}
            <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
              {items.map((item, idx) => {
                const itemPrice = item.product.discountPrice || item.product.price;
                return (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={item.product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">{item.product.title}</p>
                        <span className="text-[10px] text-slate-400 font-latin">
                          {item.quantity}x {itemPrice.toLocaleString()} د.ع
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 font-latin">
                      {(itemPrice * item.quantity).toLocaleString()} د.ع
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Delivery Distance Breakdown Card */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-orange-500" />
                  <span>دوری و خێرایی گەیاندن</span>
                </span>
                <span className="text-orange-600 font-latin font-black">{distanceKm} کم</span>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between font-latin">
                <span>کاتی گەیشتن:</span>
                <span className="font-bold text-slate-800">~{deliveryCalc.estimatedMinutes} خولەک</span>
              </div>
              {deliveryCalc.isFreeDelivery && (
                <div className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 p-1.5 rounded-lg text-center">
                  🎉 بەهۆی تێپەڕاندنی بڕی پێویست، گەیاندنت بەخۆڕاییە!
                </div>
              )}
            </div>

            {/* Shakh Points Rewards & Checkout Redemption Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 p-4 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">پۆینتی پاداشتی شاخ (Shakh Points)</span>
                </div>
                <span className="text-xs font-black font-latin bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-xl border border-amber-500/30">
                  🪙 {availablePoints.toLocaleString()} پۆینت بەردەستە
                </span>
              </div>

              {/* Earn forecast */}
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>پاش تەواوبوونی ئەم داواکارییە: <strong>+{estimatedEarnedPoints.toLocaleString()} پۆینت</strong> دەگەڕێتەوە بۆ هەژمارەکەت!</span>
              </div>

              {/* Redeem Checkbox */}
              {availablePoints > 0 && (
                <div className="pt-1 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => {
                        setUsePoints(e.target.checked);
                        if (e.target.checked && pointsToRedeem === 0) {
                          setPointsToRedeem(Math.min(availablePoints, 300));
                        }
                      }}
                      className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>بەکارهێنانی پۆینت بۆ وەرگرتنی داشکاندنی فوری</span>
                  </label>

                  {usePoints && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                        <span>پۆینتی بەکارهاتوو:</span>
                        <span className="font-bold text-amber-600 font-latin">{pointsToRedeem.toLocaleString()} Pts = {calculateDiscountFromPoints(pointsToRedeem).toLocaleString()} د.ع</span>
                      </div>
                      
                      <div className="flex gap-1.5 flex-wrap">
                        {[
                          { pts: 150, label: '150 پۆینت (1,000 د.ع)' },
                          { pts: 300, label: '300 پۆینت (2,000 د.ع)' },
                          { pts: 1500, label: '1.5k پۆینت (10,000 د.ع)' },
                          { pts: maxRedeemablePoints, label: 'هەمووی' }
                        ].map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            disabled={opt.pts > maxRedeemablePoints || opt.pts <= 0}
                            onClick={() => setPointsToRedeem(opt.pts)}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                              pointsToRedeem === opt.pts
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                            } ${opt.pts > maxRedeemablePoints || opt.pts <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Financial Totals */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>کۆی نرخی کاڵاکان:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-latin">{subtotal.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>کرێی گەیاندن ({distanceKm} کم):</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-latin">
                  {deliveryCalc.isFreeDelivery ? 'بەخۆڕایی (Free)' : `${activeDeliveryFee.toLocaleString()} د.ع`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span>کرێی خزمەتگوزاری پلاتفۆرمی شاخ:</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 font-bold">جێگیر</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-latin">
                  {PLATFORM_SERVICE_FEE.toLocaleString()} د.ع
                </span>
              </div>

              {pointsDiscountIQD > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    داشکاندنی پۆینتی شاخ ({pointsToRedeem} Pts):
                  </span>
                  <span className="font-latin">-{pointsDiscountIQD.toLocaleString()} د.ع</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>کۆی گشتی بۆ دان:</span>
                <span className="text-orange-600 dark:text-orange-400 font-latin text-lg">{finalGrandTotal.toLocaleString()} د.ع</span>
              </div>
            </div>

            {/* Guarantee Badge */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>داواکارییەکەت پارێزراوە و لە کاتی گەیشتندا دەپشکنرێت.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || deliveryCalc.statusType === 'out_of_range'}
              className="w-full py-4 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>لە پرۆسەی تۆمارکردندایە...</span>
              ) : deliveryCalc.statusType === 'out_of_range' ? (
                <span>🔴 بۆ ئێرە بەردەست نییە</span>
              ) : (
                <>
                  <span>پەسەندکردن و ناردنی داواکاری</span>
                  {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
