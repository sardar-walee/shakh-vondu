import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Truck,
  MapPin,
  Store,
  Navigation,
  Compass,
  Locate,
  Clock,
  CheckCircle,
  ExternalLink,
  Phone,
  Radio,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Play,
  Pause,
  Maximize2
} from 'lucide-react';
import { Order, SellerProfile, GeoLocation } from '../../types';
import { calculateDistanceKm, guessCoordinatesFromText, KURDISTAN_CITIES_COORDS } from '../../utils/geoUtils';

interface LiveOrderTrackingMapProps {
  order: Order;
  seller?: SellerProfile;
  className?: string;
  height?: string;
}

export const LiveOrderTrackingMap: React.FC<LiveOrderTrackingMapProps> = ({
  order,
  seller,
  className = '',
  height = 'h-96 sm:h-[450px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{
    store?: L.Marker;
    customer?: L.Marker;
    courier?: L.Marker;
    polyline?: L.Polyline;
  }>({});

  const [useLiveBrowserGps, setUseLiveBrowserGps] = useState(false);
  const [liveGpsCoords, setLiveGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simProgress, setSimProgress] = useState<number>(() => {
    if (order.status === 'delivered') return 1;
    if (order.status === 'on_the_way') return 0.55;
    if (order.status === 'picked_up') return 0.2;
    return 0;
  });
  const [currentSpeed, setCurrentSpeed] = useState<number>(38); // km/h demo telemetry

  // Determine Store Coordinates
  const storeCoords = useMemo(() => {
    if (order.sellerGeoLocation?.latitude && order.sellerGeoLocation?.longitude) {
      return { lat: order.sellerGeoLocation.latitude, lng: order.sellerGeoLocation.longitude };
    }
    if (seller?.geoLocation?.latitude && seller?.geoLocation?.longitude) {
      return { lat: seller.geoLocation.latitude, lng: seller.geoLocation.longitude };
    }
    const guessed = guessCoordinatesFromText(
      order.sellerAddress || seller?.address || order.sellerName,
      order.deliveryCity || 'Erbil (هەولێر)'
    );
    return { lat: guessed.latitude, lng: guessed.longitude };
  }, [order, seller]);

  // Determine Customer Delivery Coordinates
  const customerCoords = useMemo(() => {
    if (order.deliveryGeoLocation?.latitude && order.deliveryGeoLocation?.longitude) {
      return { lat: order.deliveryGeoLocation.latitude, lng: order.deliveryGeoLocation.longitude };
    }
    const guessed = guessCoordinatesFromText(
      order.deliveryAddress || order.customerAddress || 'Erbil',
      order.deliveryCity || 'Erbil (هەولێر)'
    );
    return { lat: guessed.latitude, lng: guessed.longitude };
  }, [order]);

  // Calculate Courier Position based on live GPS or simulation progress
  const courierCoords = useMemo(() => {
    if (useLiveBrowserGps && liveGpsCoords) {
      return liveGpsCoords;
    }
    // Interpolate linearly along path from store to customer
    const lat = storeCoords.lat + (customerCoords.lat - storeCoords.lat) * simProgress;
    const lng = storeCoords.lng + (customerCoords.lng - storeCoords.lng) * simProgress;
    return { lat, lng };
  }, [storeCoords, customerCoords, simProgress, useLiveBrowserGps, liveGpsCoords]);

  // Calculate distances & ETA
  const totalDistanceKm = useMemo(() => {
    return calculateDistanceKm(storeCoords.lat, storeCoords.lng, customerCoords.lat, customerCoords.lng) || 4.2;
  }, [storeCoords, customerCoords]);

  const remainingDistanceKm = useMemo(() => {
    const dist = calculateDistanceKm(courierCoords.lat, courierCoords.lng, customerCoords.lat, customerCoords.lng);
    return Math.max(0, Math.round(dist * 10) / 10);
  }, [courierCoords, customerCoords]);

  const estimatedMinutesLeft = useMemo(() => {
    if (order.status === 'delivered') return 0;
    const speed = currentSpeed || 35;
    const hours = remainingDistanceKm / speed;
    const mins = Math.ceil(hours * 60) + 4; // 4 mins buffer
    return Math.max(2, mins);
  }, [remainingDistanceKm, currentSpeed, order.status]);

  // Handle Real-time Browser Geolocation tracking toggle
  useEffect(() => {
    let watchId: number | null = null;
    if (useLiveBrowserGps && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLiveGpsCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setGpsError(null);
          if (pos.coords.speed) {
            setCurrentSpeed(Math.round(pos.coords.speed * 3.6));
          }
        },
        (err) => {
          setGpsError(err.message || 'نەتوانرا شوێنی جی پی ئێسی ڕاستەوخۆ وەربگیرێت.');
          setUseLiveBrowserGps(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [useLiveBrowserGps]);

  // Simulation Interval for live moving marker demo when on the way
  useEffect(() => {
    if (!isSimulating || useLiveBrowserGps || order.status === 'delivered' || order.status === 'cancelled') {
      return;
    }

    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 0.98) {
          return 0.98;
        }
        return prev + 0.015;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, useLiveBrowserGps, order.status]);

  // Initialize & Update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map centered between store & customer
      const midLat = (storeCoords.lat + customerCoords.lat) / 2;
      const midLng = (storeCoords.lng + customerCoords.lng) / 2;

      const map = L.map(mapContainerRef.current, {
        center: [midLat, midLng],
        zoom: 13,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Custom Zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // 1. Create or Update Store Marker
    const storeHtml = `
      <div className="relative group">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-110 transition-transform">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
          ${order.sellerName || 'فرۆشگا'}
        </div>
      </div>
    `;
    const storeIcon = L.divIcon({
      html: storeHtml,
      className: 'custom-map-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (!markersRef.current.store) {
      markersRef.current.store = L.marker([storeCoords.lat, storeCoords.lng], { icon: storeIcon }).addTo(map);
      markersRef.current.store.bindPopup(`<b>${order.sellerName}</b><br/>شوێنی فرۆشگا`);
    } else {
      markersRef.current.store.setLatLng([storeCoords.lat, storeCoords.lng]);
    }

    // 2. Create or Update Customer Marker
    const customerHtml = `
      <div className="relative group">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-110 transition-transform">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        </div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-emerald-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
          ${order.customerName || 'شوێنی ڕادەستکردن'}
        </div>
      </div>
    `;
    const customerIcon = L.divIcon({
      html: customerHtml,
      className: 'custom-map-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (!markersRef.current.customer) {
      markersRef.current.customer = L.marker([customerCoords.lat, customerCoords.lng], { icon: customerIcon }).addTo(map);
      markersRef.current.customer.bindPopup(`<b>${order.customerName}</b><br/>${order.deliveryAddress || 'ناونیشانی کڕیار'}`);
    } else {
      markersRef.current.customer.setLatLng([customerCoords.lat, customerCoords.lng]);
    }

    // 3. Create or Update Courier Pulsing Marker
    const courierDriverName = order.driverName || 'کاپتنی شاخ';
    const courierHtml = `
      <div className="relative group">
        <!-- Pulsing Radar Glow -->
        <div className="absolute -inset-2 rounded-full bg-teal-500/30 animate-ping"></div>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-xl border-2 border-white transform hover:scale-110 transition-transform relative z-10">
          <svg class="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-teal-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-lg flex items-center gap-1 border border-teal-400/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>${courierDriverName}</span>
        </div>
      </div>
    `;
    const courierIcon = L.divIcon({
      html: courierHtml,
      className: 'custom-map-icon',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (!markersRef.current.courier) {
      markersRef.current.courier = L.marker([courierCoords.lat, courierCoords.lng], { icon: courierIcon }).addTo(map);
      markersRef.current.courier.bindPopup(`<b>${courierDriverName}</b><br/>مۆبایل: ${order.driverPhone || 'دیارینەکراوە'}`);
    } else {
      markersRef.current.courier.setLatLng([courierCoords.lat, courierCoords.lng]);
    }

    // 4. Update Polyline Route Path
    const pathCoords: L.LatLngExpression[] = [
      [storeCoords.lat, storeCoords.lng],
      [courierCoords.lat, courierCoords.lng],
      [customerCoords.lat, customerCoords.lng]
    ];

    if (!markersRef.current.polyline) {
      markersRef.current.polyline = L.polyline(pathCoords, {
        color: '#0d9488',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8
      }).addTo(map);
    } else {
      markersRef.current.polyline.setLatLngs(pathCoords);
    }

  }, [storeCoords, customerCoords, courierCoords, order]);

  // Handle Recenter / Fit All Bounds
  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([
      [storeCoords.lat, storeCoords.lng],
      [courierCoords.lat, courierCoords.lng],
      [customerCoords.lat, customerCoords.lng]
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  const handleCenterOnCourier = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([courierCoords.lat, courierCoords.lng], 15, { animate: true });
  };

  // Google Maps External Directions Link
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${storeCoords.lat},${storeCoords.lng}&destination=${customerCoords.lat},${customerCoords.lng}&travelmode=driving`;

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Live Courier Telemetry Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                  شوێنپێهەڵگرتنی زینووی GPS
                </span>
                {order.status === 'on_the_way' && (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                    لە ڕێگادایە
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold mt-1 text-slate-100 flex items-center gap-2">
                <span>کاپتن: {order.driverName || 'شۆفێری سەرپەرشتیار'}</span>
                {order.storeDriverVehicle && (
                  <span className="text-xs text-slate-400 font-latin font-normal">({order.storeDriverVehicle})</span>
                )}
              </h4>
            </div>
          </div>

          {/* Quick External Map Navigation */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <ExternalLink className="w-4 h-4" />
            <span>نەخشەی دەرەکی Google Maps</span>
          </a>

        </div>

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-slate-800">
          <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 text-center">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">کاتی مەزەندەکراو (ETA)</span>
            <div className="text-sm sm:text-base font-black text-amber-400 font-latin flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{order.status === 'delivered' ? 'گەیشتووە ✓' : `${estimatedMinutesLeft} خولەک`}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 text-center">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">دووری ماوە</span>
            <div className="text-sm sm:text-base font-black text-teal-400 font-latin flex items-center justify-center gap-1">
              <Navigation className="w-4 h-4 text-teal-400" />
              <span>{remainingDistanceKm} KM</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 text-center">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">خێرایی ڕاستەوخۆ</span>
            <div className="text-sm sm:text-base font-black text-cyan-400 font-latin flex items-center justify-center gap-1">
              <Radio className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>{order.status === 'delivered' ? '0 km/h' : `${currentSpeed} km/h`}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Map Display Box with Overlay Controls */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-900 group">
        
        {/* Leaflet Container */}
        <div ref={mapContainerRef} className={`w-full ${height} z-0`} />

        {/* Floating Map Controls overlay top right */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
          
          <button
            onClick={handleCenterOnCourier}
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="فوکەس بکە لەسەر شۆفێر"
          >
            <Locate className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">فوکەس لە کاپتن</span>
          </button>

          <button
            onClick={handleFitBounds}
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="بینینی هەموو شوێنەکان"
          >
            <Maximize2 className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline">سەرجەم شوێنەکان</span>
          </button>

          <button
            onClick={() => setUseLiveBrowserGps(!useLiveBrowserGps)}
            className={`p-2.5 rounded-2xl shadow-md border flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              useLiveBrowserGps
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="چالاککردنی GPS ی ڕاستەوخۆ لە وێبگەڕدا"
          >
            <Radio className={`w-4 h-4 ${useLiveBrowserGps ? 'animate-pulse text-white' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{useLiveBrowserGps ? 'GPS چالاکە' : 'GPSی مۆبایلەکەت'}</span>
          </button>

        </div>

        {/* Floating Live Simulation Controller (Bottom Bar overlay) */}
        <div className="absolute bottom-3 left-3 right-14 sm:right-auto z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm text-right space-y-2">
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>پێشکەوتنی گەیاندن:</span>
            </span>

            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="text-[10px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-1 cursor-pointer"
            >
              {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isSimulating ? 'ڕاگرتنی جوڵە' : 'دەستپێکردنی جوڵە'}</span>
            </button>
          </div>

          {/* Progress Slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={simProgress}
            onChange={(e) => {
              setSimProgress(parseFloat(e.target.value));
              setIsSimulating(false);
            }}
            className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />

          <div className="flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400 font-latin">
            <span>فرۆشگا ({order.sellerName})</span>
            <span>{Math.round(simProgress * 100)}%</span>
            <span>ماڵەوە ({order.customerName})</span>
          </div>

        </div>

        {/* GPS Error banner if any */}
        {gpsError && (
          <div className="absolute top-3 left-3 z-[400] bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>{gpsError}</span>
          </div>
        )}

      </div>

      {/* Map Legend & Information Footnote */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-500 border border-white"></div>
            <span className="font-bold text-slate-700 dark:text-slate-300">فرۆشگا</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-teal-600 border border-white animate-pulse"></div>
            <span className="font-bold text-slate-700 dark:text-slate-300">کاپتن</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-600 border border-white"></div>
            <span className="font-bold text-slate-700 dark:text-slate-300">شوێنی کڕیار</span>
          </div>
        </div>

        {order.driverPhone && (
          <a
            href={`tel:${order.driverPhone}`}
            className="text-teal-600 dark:text-teal-400 hover:underline font-bold flex items-center gap-1"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>پەیوەندیکردنی خێرا: <span className="font-latin">{order.driverPhone}</span></span>
          </a>
        )}
      </div>

    </div>
  );
};
