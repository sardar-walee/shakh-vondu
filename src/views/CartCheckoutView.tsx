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
  Info
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
  const { sellers, createOrder } = useMarketplace();
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
  const calculatedGrandTotal = subtotal + activeDeliveryFee;

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
      setErrorMessage(`داواکاری ناکرێت: ناونیشانەکەت (${distanceKm} کم) لە دەرەوەی سنوری گەیاندنی ئەم فرۆشگایەیە (${primarySeller?.deliveryZone?.maxDistanceKm || 15} کم).`);
      return;
    }

    setIsSubmitting(true);

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
      deliveryDistanceKm: distanceKm,
      deliveryZoneStatus: deliveryCalc.isWithinRadius ? 'within_radius' : 'custom_distance',
      total: calculatedGrandTotal,
      paymentMethod,
      customerNotes: notes,
      deliveryAddress: `${city} - ${area} - ${address} (دوری: ${distanceKm} کم)`,
      deliveryCity: city,
      deliveryGeoLocation: deliveryGeoLocation || undefined
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              زانیاری وەرگر
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ناوی تەواو *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ناوی کڕیار"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ژمارەی مۆبایل *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0750 xxx xxxx"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin focus:bg-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Location & Distance Zone Engine */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>ناونیشانی گەیاندن و هەژماری دوری (Delivery Zone)</span>
              </h3>
              {primarySeller?.deliveryZone && (
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                  سنوری فرۆشگا: ٠ - {primarySeller.deliveryZone.maxDistanceKm} کم
                </span>
              )}
            </div>

            {/* City Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">شار *</label>
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:border-orange-500 cursor-pointer"
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
              <label className="text-xs font-bold text-slate-700 block">
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
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
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

            {/* Distance Slider & Custom Input */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-orange-500" />
                  دوری دیاریکراو لە فرۆشگاوە:
                </span>
                <span className="text-sm font-black text-orange-600 font-latin bg-white px-3 py-1 rounded-xl border border-orange-200 shadow-2xs">
                  {distanceKm} کیلۆمەتر (km)
                </span>
              </div>

              <input
                type="range"
                min={0.5}
                max={Math.max(30, (primarySeller?.deliveryZone?.maxDistanceKm || 20) + 10)}
                step={0.5}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />

              {/* Status Banner */}
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 ${
                deliveryCalc.statusType === 'in_range'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : deliveryCalc.statusType === 'warning'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <div className="flex items-center gap-2">
                  {deliveryCalc.statusType === 'in_range' && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                  {deliveryCalc.statusType === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                  {deliveryCalc.statusType === 'out_of_range' && <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                  <span>{deliveryCalc.statusText}</span>
                </div>

                <span className="text-[11px] font-latin font-black flex-shrink-0">
                  ~{deliveryCalc.estimatedMinutes} خولەک
                </span>
              </div>
            </div>

            {/* Custom Neighborhood / Street text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ناوی گەڕەک (ئەگەر لە لیستەکەدا نییە) *</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="وەک: بەختیاری، ئاشتی، نزارکێ..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">تێبینی تایبەت بۆ شۆفێری گەیاندن</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="وەک: لە دەرگا مەدە، تەلەفۆن بکە..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ناونیشانی تەواو (شەقام، ژمارەی خانوو یان باڵەخانە) *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ڕوونکردنەوەی ناونیشان بە دیاری کراوی..."
                rows={2}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
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
                      ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
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
                      <span className="text-xs font-bold text-slate-900">{method.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{method.desc}</p>
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

            {/* Financial Totals */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>کۆی نرخی کاڵاکان:</span>
                <span className="font-bold text-slate-900 font-latin">{subtotal.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>کرێی گەیاندن ({distanceKm} کم):</span>
                <span className="font-bold text-slate-900 font-latin">
                  {deliveryCalc.isFreeDelivery ? 'بەخۆڕایی (Free)' : `${activeDeliveryFee.toLocaleString()} د.ع`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>کۆی گشتی بۆ دان:</span>
                <span className="text-orange-600 font-latin text-lg">{calculatedGrandTotal.toLocaleString()} د.ع</span>
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
                <span>لە دەرەوەی سنوری گەیاندنە</span>
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
