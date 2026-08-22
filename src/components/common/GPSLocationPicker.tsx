import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Sparkles
} from 'lucide-react';
import { GeoCoordinates, getCurrentGPSPosition, guessCoordinatesFromText, findClosestCity } from '../../utils/geoUtils';

interface GPSLocationPickerProps {
  label?: string;
  required?: boolean;
  initialCity?: string;
  initialAddress?: string;
  initialGeoLocation?: GeoCoordinates | null;
  autoPrompt?: boolean;
  onLocationChange: (location: {
    city: string;
    area: string;
    address: string;
    geoLocation?: GeoCoordinates;
    distanceKm?: number;
  }) => void;
  showDistanceCalculation?: boolean;
  baseKm?: number;
  className?: string;
}

export const GPSLocationPicker: React.FC<GPSLocationPickerProps> = ({
  label = 'دیاریکردنی شوێن بە GPS یان نووسینی ناونیشان',
  required = false,
  initialCity = 'Erbil (هەولێر)',
  initialAddress = '',
  initialGeoLocation = null,
  autoPrompt = false,
  onLocationChange,
  showDistanceCalculation = false,
  baseKm = 3.5,
  className = ''
}) => {
  const [city, setCity] = useState(initialCity);
  const [address, setAddress] = useState(initialAddress);
  const [geoLocation, setGeoLocation] = useState<GeoCoordinates | null>(initialGeoLocation);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [hasAutoPrompted, setHasAutoPrompted] = useState(false);

  // Sync initial props
  useEffect(() => {
    if (initialCity && !geoLocation) setCity(initialCity);
  }, [initialCity]);

  useEffect(() => {
    if (initialAddress && !address) setAddress(initialAddress);
  }, [initialAddress]);

  useEffect(() => {
    if (initialGeoLocation) setGeoLocation(initialGeoLocation);
  }, [initialGeoLocation]);

  // Handle Fetching GPS Location
  const handleGetGPS = async (isAuto = false) => {
    setIsLoadingGPS(true);
    setGpsStatus('idle');
    setStatusMessage('لە پەیوەندیکردن بە سەتەلایت و وەرگرتنی لۆکەیشنی GPS...');

    try {
      const coords = await getCurrentGPSPosition();
      setGeoLocation(coords);
      setGpsStatus('success');

      const detectedCity = coords.city || city;
      setCity(detectedCity);

      const generatedAddress = address || `شوێنی دەستنیشانکراو بە GPS (${detectedCity})`;
      setAddress(generatedAddress);

      setStatusMessage(`شوێنی GPS بە سەرکەوتوویی وەرگیرا (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);

      onLocationChange({
        city: detectedCity,
        area: 'ناوەندی شار',
        address: generatedAddress,
        geoLocation: coords
      });
    } catch (err: any) {
      // If user denied in auto mode, silently inform without loud intrusive error
      if (isAuto && err.message?.includes('ڕەتکرایەوە')) {
        setGpsStatus('idle');
        setStatusMessage('دەتوانیت دوگمەی GPS دابگریت یان ناونیشانەکەت بنووسیت.');
      } else {
        setGpsStatus('error');
        setStatusMessage(err.message || 'نەتوانرا شوێن بە GPS دەستنیشان بکرێت');
      }
    } finally {
      setIsLoadingGPS(false);
    }
  };

  // Browser Geolocation auto-prompt when mounted if enabled and no coords exist yet
  useEffect(() => {
    if (autoPrompt && !hasAutoPrompted && !geoLocation && typeof window !== 'undefined' && 'geolocation' in navigator) {
      setHasAutoPrompted(true);
      handleGetGPS(true);
    }
  }, [autoPrompt, hasAutoPrompted, geoLocation]);

  // Handle manual typing of address - auto-guess coordinates & city
  const handleAddressTyping = (text: string) => {
    setAddress(text);
    if (text.trim().length > 2) {
      const guessed = guessCoordinatesFromText(text, city);
      setGeoLocation(guessed);
      if (guessed.city && guessed.city !== city) {
        setCity(guessed.city);
      }
      setGpsStatus('success');
      setStatusMessage(`شوێن دیاریکرا بەپێی ناونیشان: ${text}`);

      onLocationChange({
        city: guessed.city || city,
        area: text,
        address: text,
        geoLocation: guessed
      });
    } else {
      onLocationChange({
        city,
        area: text,
        address: text,
        geoLocation: geoLocation || undefined
      });
    }
  };

  return (
    <div className={`space-y-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-right ${className}`}>
      
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>

        {geoLocation && (
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>GPS چالاکە</span>
          </span>
        )}
      </div>

      {/* GPS Action Button */}
      <button
        type="button"
        onClick={() => handleGetGPS(false)}
        disabled={isLoadingGPS}
        className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
      >
        {isLoadingGPS ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>لە وەرگرتنی لۆکەیشنی GPS...</span>
          </>
        ) : (
          <>
            <Compass className="w-4 h-4 animate-pulse" />
            <span>دیاریکردنی ڕاستەوخۆی شوێنی ئێستام بە GPS (خێرا و ورد)</span>
          </>
        )}
      </button>

      {/* Status Alert Message */}
      {statusMessage && (
        <div
          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 ${
            gpsStatus === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : gpsStatus === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {gpsStatus === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
            {gpsStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span className="text-[11px]">{statusMessage}</span>
          </div>

          {geoLocation?.mapUrl && (
            <a
              href={geoLocation.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-600 dark:text-blue-400 underline font-bold flex items-center gap-0.5 shrink-0"
            >
              <span>نەخشە</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Manual Street/Neighborhood input with Real-Time coordinate sync */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
            یان ناونیشان و گەڕەک بنووسە (بەردەڕەش، ئاکرێ، بەختیاری، هتد):
          </label>
        </div>
        <input
          type="text"
          value={address}
          onChange={(e) => handleAddressTyping(e.target.value)}
          placeholder="وەک: بەردەڕەش، نزیک فلکەی سەرەکی یان ناوی گەڕەک"
          required={required}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>

      {geoLocation && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
          <span className="font-latin">
            Lat: {geoLocation.latitude.toFixed(4)}, Lng: {geoLocation.longitude.toFixed(4)}
          </span>
          {geoLocation.accuracy && (
            <span>وردبینی: ±{geoLocation.accuracy} مەتر</span>
          )}
        </div>
      )}

    </div>
  );
};
