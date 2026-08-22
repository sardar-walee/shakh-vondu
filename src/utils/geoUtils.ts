export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  area?: string;
  address?: string;
  mapUrl?: string;
}

export const KURDISTAN_CITIES_COORDS: Record<string, { lat: number; lng: number; kurdishName: string }> = {
  'Erbil (هەولێر)': { lat: 36.1901, lng: 44.0091, kurdishName: 'هەولێر' },
  'Sulaymaniyah (سلێمانی)': { lat: 35.5558, lng: 45.4351, kurdishName: 'سلێمانی' },
  'Duhok (دهۆک)': { lat: 36.8679, lng: 42.9886, kurdishName: 'دهۆک' },
  'Kirkuk (کەرکووک)': { lat: 35.4681, lng: 44.3922, kurdishName: 'کەرکووک' },
  'Halabja (هەڵەبجە)': { lat: 35.1778, lng: 45.9861, kurdishName: 'هەڵەبجە' },
  'Zakho (زاخۆ)': { lat: 37.1439, lng: 42.6865, kurdishName: 'زاخۆ' },
  'Soran (سۆران)': { lat: 36.6534, lng: 44.5428, kurdishName: 'سۆران' },
  'Akre (ئاکرێ)': { lat: 36.7412, lng: 43.8942, kurdishName: 'ئاکرێ' },
  'Bardarash (بەردەڕەش)': { lat: 36.4252, lng: 43.6781, kurdishName: 'بەردەڕەش' },
  'Ranya (ڕانیە)': { lat: 36.2551, lng: 44.8824, kurdishName: 'ڕانیە' },
  'Kalar (کەلار)': { lat: 34.6339, lng: 45.3189, kurdishName: 'کەلار' },
  'Shaqlawa (شەقڵاوە)': { lat: 36.4022, lng: 44.3006, kurdishName: 'شەقڵاوە' },
  'Koya (کۆیە)': { lat: 36.0833, lng: 44.6292, kurdishName: 'کۆیە' },
  'Chamchamal (چەمچەماڵ)': { lat: 35.5342, lng: 44.8344, kurdishName: 'چەمچەماڵ' }
};

// Calculate distance between two coordinates in Kilometers (Haversine Formula)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Find closest Kurdistan city for a given coordinate
export function findClosestCity(lat: number, lng: number): string {
  let minDistance = Infinity;
  let closestCity = 'Erbil (هەولێر)';

  for (const [cityName, coords] of Object.entries(KURDISTAN_CITIES_COORDS)) {
    const dist = calculateDistanceKm(lat, lng, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = cityName;
    }
  }

  return closestCity;
}

// Request browser GPS position
export function getCurrentGPSPosition(): Promise<GeoCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('سیستەمی GPS لە وێبگەڕەکەتدا بەردەست نییە.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const matchedCity = findClosestCity(latitude, longitude);
        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        resolve({
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          accuracy: Math.round(accuracy),
          city: matchedCity,
          address: `لۆکەیشنی GPS (${matchedCity})`,
          mapUrl
        });
      },
      (error) => {
        let msg = 'هەڵەیەک ڕوویدا لە وەرگرتنی لۆکەیشن';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'ڕێگەپێدانی GPS لە وێبگەڕەکەتدا ڕەتکرایەوە. تکایە لە ڕێکخستنی وێبگەڕ ڕێگە بە Location بدە.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'زانیاری شوێن لەم کاتەدا بەردەست نییە.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'کاتی وەرگرتنی شوێن بەسەرچوو.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000
      }
    );
  });
}

// Match user typed location to approximate coordinates
export function guessCoordinatesFromText(query: string, defaultCity = 'Erbil (هەولێر)'): GeoCoordinates {
  const normalized = query.toLowerCase().trim();
  
  for (const [cityName, coords] of Object.entries(KURDISTAN_CITIES_COORDS)) {
    const kurd = coords.kurdishName.toLowerCase();
    const eng = cityName.toLowerCase();
    if (normalized.includes(kurd) || normalized.includes(eng)) {
      return {
        latitude: coords.lat,
        longitude: coords.lng,
        city: cityName,
        address: query,
        mapUrl: `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
      };
    }
  }

  const base = KURDISTAN_CITIES_COORDS[defaultCity] || KURDISTAN_CITIES_COORDS['Erbil (هەولێر)'];
  return {
    latitude: base.lat,
    longitude: base.lng,
    city: defaultCity,
    address: query,
    mapUrl: `https://www.google.com/maps?q=${base.lat},${base.lng}`
  };
}
