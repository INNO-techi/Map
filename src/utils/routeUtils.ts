import { Route, Location } from '../types/route';

export const calculateTrafficLevel = (duration: number, durationInTraffic: number): 'light' | 'moderate' | 'heavy' => {
  const ratio = durationInTraffic / duration;
  if (ratio <= 1.2) return 'light';
  if (ratio <= 1.5) return 'moderate';
  return 'heavy';
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatDistance = (meters: number): string => {
  const km = meters / 1000;
  if (km < 1) {
    return `${Math.round(meters)}m`;
  }
  return `${km.toFixed(1)}km`;
};

export const geocodeAddress = async (address: string): Promise<Location | null> => {
  if (!window.google) return null;
  
  const geocoder = new google.maps.Geocoder();
  
  try {
    const result = await geocoder.geocode({ address });
    if (result.results[0]) {
      const location = result.results[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng(),
        address: result.results[0].formatted_address
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return null;
};

export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Current Location'
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    );
  });
};