import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  currentLocation: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    currentLocation: null,
    isLoading: false,
    error: null
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        isLoading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          currentLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          isLoading: false,
          error: null
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setState({
          currentLocation: null,
          isLoading: false,
          error: errorMessage
        });
      },
      options
    );
  }, []);

  // Auto-request location on mount if permission is already granted
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          requestLocation();
        }
      });
    }
  }, [requestLocation]);

  return {
    ...state,
    requestLocation
  };
};