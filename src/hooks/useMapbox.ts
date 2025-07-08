import { useState, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

export const useMapbox = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const initializeMapbox = useCallback(() => {
    if (!MAPBOX_ACCESS_TOKEN) {
      setLoadError('Mapbox access token is missing. Please add VITE_MAPBOX_ACCESS_TOKEN to your environment variables.');
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
      setIsLoaded(true);
      setLoadError(null);
    } catch (error) {
      console.error('Error initializing Mapbox:', error);
      setLoadError('Failed to initialize Mapbox. Please check your access token.');
    }
  }, []);

  useEffect(() => {
    initializeMapbox();
  }, [initializeMapbox]);

  return { isLoaded, loadError, retry: initializeMapbox };
};