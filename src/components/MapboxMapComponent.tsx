import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Route, Location } from '../types/route';
import { Navigation, MapPin, Clock, AlertTriangle, Layers, Eye, EyeOff, Zap } from 'lucide-react';
import { Language } from '../hooks/useLanguage';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapComponentProps {
  routes: Route[];
  selectedRoute: Route | null;
  origin: Location | null;
  destination: Location | null;
  onRouteSelect: (route: Route) => void;
  language: Language;
}

const MapboxMapComponent: React.FC<MapboxMapComponentProps> = ({
  routes,
  selectedRoute,
  origin,
  destination,
  onRouteSelect,
  language
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const routeSourceIds = useRef<string[]>([]);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);
  const [mapStyle, setMapStyle] = useState('streets-v12');

  const translations = {
    hideTraffic: {
      sw: 'Ficha Foleni',
      en: 'Hide Traffic'
    },
    showTraffic: {
      sw: 'Onyesha Foleni',
      en: 'Show Traffic'
    },
    mapType: {
      sw: 'Aina ya Ramani',
      en: 'Map Type'
    },
    streets: {
      sw: 'Mitaa',
      en: 'Streets'
    },
    satellite: {
      sw: 'Anga',
      en: 'Satellite'
    },
    light: {
      sw: 'Nyepesi',
      en: 'Light'
    },
    dark: {
      sw: 'Giza',
      en: 'Dark'
    },
    trafficLegend: {
      sw: 'Dalili za Msongamano',
      en: 'Traffic Legend'
    },
    lightTrafficLegend: {
      sw: 'Msongamano mdogo',
      en: 'Light traffic'
    },
    moderateTrafficLegend: {
      sw: 'Msongamano wa kati',
      en: 'Moderate traffic'
    },
    heavyTrafficLegend: {
      sw: 'Msongamano mkubwa',
      en: 'Heavy traffic'
    },
    severeTrafficLegend: {
      sw: 'Msongamano mkubwa sana',
      en: 'Severe traffic'
    },
    selectedRoute: {
      sw: 'Njia Iliyochaguliwa',
      en: 'Selected Route'
    },
    duration: {
      sw: 'Muda',
      en: 'Duration'
    },
    distance: {
      sw: 'Umbali',
      en: 'Distance'
    },
    traffic: {
      sw: 'Msongamano',
      en: 'Traffic'
    },
    startingPoint: {
      sw: 'Mahali pa Kuanzia',
      en: 'Starting Point'
    },
    destination: {
      sw: 'Mahali pa Kwenda',
      en: 'Destination'
    },
    noRoutesFound: {
      sw: 'Hakuna Njia Iliyopatikana',
      en: 'No Routes Found'
    },
    noRoutesFoundDesc: {
      sw: 'Tumeshindwa kupata njia kati ya mahali hapa. Jaribu mahali mengine.',
      en: 'Unable to find routes between these locations. Try different locations.'
    }
  };

  const t = (key: string) => translations[key as keyof typeof translations]?.[language] || key;

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: `mapbox://styles/mapbox/${mapStyle}`,
        center: [39.2083, -6.7924], // Dar es Salaam, Tanzania
        zoom: 13,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }), 'bottom-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add traffic layer
        if (showTrafficLayer) {
          addTrafficLayer();
        }
      });

      map.current.on('style.load', () => {
        if (showTrafficLayer) {
          addTrafficLayer();
        }
      });
    }

    const addTrafficLayer = () => {
      if (!map.current || !map.current.isStyleLoaded()) return;
      
      try {
        if (!map.current.getSource('mapbox-traffic')) {
          map.current.addSource('mapbox-traffic', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-traffic-v1'
          });
        }

        if (!map.current.getLayer('traffic')) {
          map.current.addLayer({
            id: 'traffic',
            type: 'line',
            source: 'mapbox-traffic',
            'source-layer': 'traffic',
            paint: {
              'line-width': 3,
              'line-color': [
                'case',
                ['==', ['get', 'congestion'], 'low'], '#10B981',
                ['==', ['get', 'congestion'], 'moderate'], '#F59E0B',
                ['==', ['get', 'congestion'], 'heavy'], '#EF4444',
                ['==', ['get', 'congestion'], 'severe'], '#DC2626',
                '#6B7280'
              ]
            }
          });
        }
      } catch (error) {
        console.error('Error adding traffic layer:', error);
      }
    };

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Toggle traffic layer
  const toggleTrafficLayer = () => {
    if (!map.current || !mapLoaded) return;
    
    if (showTrafficLayer) {
      if (map.current.getLayer('traffic')) {
        map.current.removeLayer('traffic');
      }
      if (map.current.getSource('mapbox-traffic')) {
        map.current.removeSource('mapbox-traffic');
      }
    } else {
      try {
        map.current.addSource('mapbox-traffic', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1'
        });

        map.current.addLayer({
          id: 'traffic',
          type: 'line',
          source: 'mapbox-traffic',
          'source-layer': 'traffic',
          paint: {
            'line-width': 3,
            'line-color': [
              'case',
              ['==', ['get', 'congestion'], 'low'], '#10B981',
              ['==', ['get', 'congestion'], 'moderate'], '#F59E0B',
              ['==', ['get', 'congestion'], 'heavy'], '#EF4444',
              ['==', ['get', 'congestion'], 'severe'], '#DC2626',
              '#6B7280'
            ]
          }
        });
      } catch (error) {
        console.error('Error adding traffic layer:', error);
      }
    }
    
    setShowTrafficLayer(!showTrafficLayer);
  };

  // Change map style
  const changeMapStyle = (style: string) => {
    if (!map.current) return;
    map.current.setStyle(`mapbox://styles/mapbox/${style}`);
    setMapStyle(style);
  };

  // Clear all markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Clear all route layers
  const clearRoutes = () => {
    if (!map.current) return;

    routeSourceIds.current.forEach(sourceId => {
      const outlineLayerId = `route-outline-${sourceId.split('-')[1]}`;
      const layerId = sourceId;
      
      try {
        if (map.current!.getLayer(outlineLayerId)) {
          map.current!.removeLayer(outlineLayerId);
        }
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
        if (map.current!.getSource(sourceId)) {
          map.current!.removeSource(sourceId);
        }
      } catch (error) {
        console.error('Error removing route layer:', error);
      }
    });
    
    routeSourceIds.current = [];
  };

  // Add route to map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    clearRoutes();

    if (routes.length === 0) return;

    console.log('Adding routes to map:', routes.length);

    // Add route layers
    routes.forEach((route, index) => {
      const isSelected = selectedRoute?.id === route.id;
      const color = isSelected ? '#4F46E5' : '#6366F1'; // Indigo colors
      const width = isSelected ? 10 : 7;
      const opacity = 1.0;
      const sourceId = `route-${index}`;

      try {
        const geometry = JSON.parse(route.polyline);
        
        console.log('Adding route geometry:', geometry);
        
        map.current!.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { 
              routeIndex: index,
              routeId: route.id,
              summary: route.summary
            },
            geometry
          }
        });
        
        routeSourceIds.current.push(sourceId);

        // Add route outline for better visibility
        map.current!.addLayer({
          id: `route-outline-${index}`,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': width + 6,
            'line-opacity': 0.8
          }
        });

        // Add main route line
        map.current!.addLayer({
          id: sourceId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': color,
            'line-width': width,
            'line-opacity': opacity
          }
        });

        // Add click handler
        map.current!.on('click', sourceId, () => {
          console.log('Route clicked:', route.id);
          onRouteSelect(route);
        });

        map.current!.on('mouseenter', sourceId, () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });

        map.current!.on('mouseleave', sourceId, () => {
          map.current!.getCanvas().style.cursor = '';
        });

        console.log('Successfully added route:', route.summary);
      } catch (error) {
        console.error('Error adding route to map:', error, route);
      }
    });

    // Auto-zoom to show all routes with proper padding
    if (routes.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidBounds = false;

      routes.forEach(route => {
        try {
          const geometry = JSON.parse(route.polyline);
          if (geometry.coordinates && geometry.coordinates.length > 0) {
            geometry.coordinates.forEach((coord: [number, number]) => {
              if (Array.isArray(coord) && coord.length === 2 && 
                  typeof coord[0] === 'number' && typeof coord[1] === 'number') {
                bounds.extend(coord);
                hasValidBounds = true;
              }
            });
          }
        } catch (error) {
          console.error('Error extending bounds:', error);
        }
      });

      if (hasValidBounds && !bounds.isEmpty()) {
        // Auto-zoom with animation like Bolt
        map.current!.fitBounds(bounds, { 
          padding: { top: 120, bottom: 120, left: 80, right: 80 },
          maxZoom: 16,
          duration: 2000 // Smooth 2-second animation
        });
      }
    }
  }, [routes, selectedRoute, onRouteSelect, mapLoaded]);

  // Add markers for origin and destination with Bolt-style design
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    clearMarkers();

    // Add origin marker (Green with Bolt-style design)
    if (origin) {
      const originEl = document.createElement('div');
      originEl.className = 'relative';
      originEl.innerHTML = `
        <div class="relative">
          <div class="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 border-4 border-white rounded-full shadow-2xl flex items-center justify-center animate-pulse">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-transparent border-t-emerald-500"></div>
          <div class="absolute top-0 left-0 w-16 h-16 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
          <div class="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
            📍 ${origin.address.length > 30 ? origin.address.substring(0, 30) + '...' : origin.address}
          </div>
        </div>
      `;
      
      const originMarker = new mapboxgl.Marker(originEl)
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`
            <div class="p-4 min-w-[250px] bg-white rounded-lg shadow-lg">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <strong class="text-emerald-700 font-bold text-lg">${t('startingPoint')}</strong>
              </div>
              <div class="text-sm text-gray-700 font-medium leading-relaxed">${origin.address}</div>
              <div class="mt-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                📍 Lat: ${origin.lat.toFixed(6)}, Lng: ${origin.lng.toFixed(6)}
              </div>
            </div>
          `))
        .addTo(map.current!);

      markersRef.current.push(originMarker);
    }

    // Add destination marker (Red with Bolt-style design)
    if (destination) {
      const destEl = document.createElement('div');
      destEl.className = 'relative';
      destEl.innerHTML = `
        <div class="relative">
          <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 border-4 border-white rounded-full shadow-2xl flex items-center justify-center animate-pulse">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-transparent border-t-red-500"></div>
          <div class="absolute top-0 left-0 w-16 h-16 bg-red-400 rounded-full animate-ping opacity-20"></div>
          <div class="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
            🎯 ${destination.address.length > 30 ? destination.address.substring(0, 30) + '...' : destination.address}
          </div>
        </div>
      `;
      
      const destMarker = new mapboxgl.Marker(destEl)
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`
            <div class="p-4 min-w-[250px] bg-white rounded-lg shadow-lg">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <strong class="text-red-700 font-bold text-lg">${t('destination')}</strong>
              </div>
              <div class="text-sm text-gray-700 font-medium leading-relaxed">${destination.address}</div>
              <div class="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                🎯 Lat: ${destination.lat.toFixed(6)}, Lng: ${destination.lng.toFixed(6)}
              </div>
            </div>
          `))
        .addTo(map.current!);

      markersRef.current.push(destMarker);
    }

    // If we have both origin and destination but no routes, auto-zoom to show both points
    if (origin && destination && routes.length === 0) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([origin.lng, origin.lat]);
      bounds.extend([destination.lng, destination.lat]);
      
      // Auto-zoom with animation like Bolt
      map.current!.fitBounds(bounds, { 
        padding: { top: 120, bottom: 120, left: 120, right: 120 },
        maxZoom: 15,
        duration: 2000 // Smooth 2-second animation
      });
    }
  }, [origin, destination, mapLoaded, routes.length, t]);

  const mapStyles = [
    { key: 'streets-v12', name: t('streets') },
    { key: 'satellite-streets-v12', name: t('satellite') },
    { key: 'light-v11', name: t('light') },
    { key: 'dark-v11', name: t('dark') }
  ];

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 space-y-3">
        {/* Traffic Toggle */}
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200">
          <button
            onClick={toggleTrafficLayer}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
              showTrafficLayer 
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {showTrafficLayer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {showTrafficLayer ? t('hideTraffic') : t('showTraffic')}
            </span>
          </button>
        </div>

        {/* Map Style Selector */}
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-gray-600" />
            <div className="text-sm font-semibold text-gray-700">{t('mapType')}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mapStyles.map(style => (
              <button
                key={style.key}
                onClick={() => changeMapStyle(style.key)}
                className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 font-medium ${
                  mapStyle === style.key
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        {/* Traffic Legend */}
        {showTrafficLayer && (
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl p-4 border border-gray-200 max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div className="text-sm font-bold text-gray-800">{t('trafficLegend')}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0 bg-emerald-500 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">{t('lightTrafficLegend')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0 bg-amber-500 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">{t('moderateTrafficLegend')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0 bg-red-500 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">{t('heavyTrafficLegend')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0 bg-red-700 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">{t('severeTrafficLegend')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Route Info Panel */}
      {selectedRoute && (
        <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:max-w-lg">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-800">{t('selectedRoute')}</div>
                <div className="text-xs text-gray-600">{selectedRoute.summary}</div>
              </div>
              {selectedRoute.smartScore && (
                <div className={`text-white px-2 py-1 rounded-full ${
                  selectedRoute.trafficLevel === 'light' 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : selectedRoute.trafficLevel === 'moderate'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-gradient-to-r from-red-400 to-pink-500'
                }`}>
                  <span className="text-xs font-bold">{selectedRoute.smartScore}</span>
                </div>
              )}
            </div>
            
            {/* Main Route Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">{t('duration')}</span>
                  </div>
                  <div className="text-xl font-bold text-blue-900">{selectedRoute.durationInTraffic}</div>
                  <div className="text-xs text-blue-600">pamoja na msongamano</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">{t('distance')}</span>
                  </div>
                  <div className="text-xl font-bold text-purple-900">{selectedRoute.distance}</div>
                  <div className="text-xs text-purple-600">umbali kamili</div>
                </div>
              </div>
            </div>

            {/* Traffic Status */}
            <div className={`rounded-lg p-3 mb-4 ${
              selectedRoute.trafficLevel === 'light' 
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200'
                : selectedRoute.trafficLevel === 'moderate'
                ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200'
                : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedRoute.trafficLevel === 'light' ? 'bg-emerald-500' :
                    selectedRoute.trafficLevel === 'moderate' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className={`text-sm font-bold ${
                    selectedRoute.trafficLevel === 'light' ? 'text-emerald-800' :
                    selectedRoute.trafficLevel === 'moderate' ? 'text-amber-800' :
                    'text-red-800'
                  }`}>
                    {selectedRoute.trafficLevel === 'light' ? 'Msongamano Mdogo' :
                     selectedRoute.trafficLevel === 'moderate' ? 'Msongamano wa Kati' : 
                     'Msongamano Mkubwa'}
                  </span>
                </div>
                <div className={`text-xs font-medium ${
                  selectedRoute.trafficLevel === 'light' ? 'text-emerald-600' :
                  selectedRoute.trafficLevel === 'moderate' ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {selectedRoute.trafficLevel === 'light' ? '🟢 Barabara Wazi' :
                   selectedRoute.trafficLevel === 'moderate' ? '🟡 Subiri Kidogo' : 
                   '🔴 Foleni Nyingi'}
                </div>
              </div>
            </div>

            {/* Route Details */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="text-xs font-bold text-gray-700 mb-2">📍 Taarifa za Njia:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Muda bila foleni:</span>
                  <span className="font-semibold text-gray-800">{selectedRoute.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kasi ya wastani:</span>
                  <span className="font-semibold text-gray-800">
                    {Math.round(parseFloat(selectedRoute.distance) / (parseInt(selectedRoute.duration) / 60))} km/h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ongezeko la muda:</span>
                  <span className={`font-semibold ${
                    selectedRoute.trafficLevel === 'light' ? 'text-emerald-600' :
                    selectedRoute.trafficLevel === 'moderate' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    +{Math.round(((parseInt(selectedRoute.durationInTraffic) - parseInt(selectedRoute.duration)) / parseInt(selectedRoute.duration)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Alama ya akili:</span>
                  <span className="font-semibold text-indigo-600">{selectedRoute.smartScore}/100</span>
                </div>
              </div>
            </div>

            {selectedRoute.recommendation && (
              <div className={`rounded-lg p-3 ${
                selectedRoute.trafficLevel === 'light' 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200'
                  : selectedRoute.trafficLevel === 'moderate'
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200'
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
              }`}>
                <div className={`text-xs font-medium ${
                  selectedRoute.trafficLevel === 'light' 
                    ? 'text-emerald-800'
                    : selectedRoute.trafficLevel === 'moderate'
                    ? 'text-amber-800'
                    : 'text-red-800'
                }`}>
                  {selectedRoute.trafficLevel === 'light' ? '🟢' : 
                   selectedRoute.trafficLevel === 'moderate' ? '🟡' : 
                   '🔴'} {' '}
                  {selectedRoute.recommendation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Routes Message */}
      {origin && destination && routes.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-200 text-center max-w-sm">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t('noRoutesFound')}</h3>
            <p className="text-sm text-gray-600">
              {t('noRoutesFoundDesc')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMapComponent;