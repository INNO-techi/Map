import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Route as RouteIcon, Loader2, Menu, X, Zap, Clock } from 'lucide-react';
import { useMapbox } from './hooks/useMapbox';
import { useGeolocation } from './hooks/useGeolocation';
import { useLanguage } from './hooks/useLanguage';
import MapboxLocationInput from './components/MapboxLocationInput';
import MapboxMapComponent from './components/MapboxMapComponent';
import RouteCard from './components/RouteCard';
import MapboxAPIKeyBanner from './components/MapboxAPIKeyBanner';
import LanguageToggle from './components/LanguageToggle';
import LoadingScreen from './components/LoadingScreen';
import { SmartRouteService } from './services/smartRouteService';
import { Route, Location, RouteRequest } from './types/route';

function App() {
  const { isLoaded, loadError } = useMapbox();
  const { currentLocation, isLoading: locationLoading, error: locationError, requestLocation } = useGeolocation();
  const { t, language, setLanguage } = useLanguage();
  
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [showAPIBanner, setShowAPIBanner] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const smartRouteService = new SmartRouteService();

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsInitializing(false);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (loadError) {
      setShowAPIBanner(true);
    }
  }, [loadError]);

  const handleGetRoutes = async () => {
    if (!origin || !destination || !isLoaded) return;

    setIsLoadingRoutes(true);
    try {
      console.log('🚀 Getting smart routes...');
      
      const routeRequest: RouteRequest = {
        origin,
        destination,
        avoidHighways: false,
        avoidTolls: false,
        optimizeForTraffic: true
      };

      const newRoutes = await smartRouteService.getSmartRoutes(routeRequest);
      
      if (newRoutes.length > 0) {
        console.log('✅ Routes received:', newRoutes.length);
        setRoutes(newRoutes);
        setSelectedRoute(newRoutes[0]); // Auto-select best route
      } else {
        console.log('❌ No routes found');
        setRoutes([]);
        setSelectedRoute(null);
      }
    } catch (error) {
      console.error('❌ Error getting routes:', error);
      setRoutes([]);
      setSelectedRoute(null);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Show loading screen during initialization
  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!isLoaded && !loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('loadingApp')}</h3>
          <p className="text-gray-600">{t('preparingExperience')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-indigo-100 relative z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <RouteIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SmartRoute TZ
                </h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
                  {t('appSubtitle')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LanguageToggle 
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
              
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 border border-indigo-100"
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6 text-indigo-600" />
                ) : (
                  <Menu className="w-6 h-6 text-indigo-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50
          w-full sm:w-96 lg:w-80 xl:w-96 bg-white/95 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          h-full lg:h-auto overflow-y-auto border-r border-indigo-100 lg:border-r-0
        `}>
          <div className="p-4 sm:p-6 space-y-6 h-full">
            {showAPIBanner && (
              <MapboxAPIKeyBanner onDismiss={() => setShowAPIBanner(false)} />
            )}


            {/* Location Inputs */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-indigo-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{t('planJourney')}</h2>
              </div>
              
              <div className="space-y-6">
                <MapboxLocationInput
                  label={t('startingPoint')}
                  placeholder={t('startingPointPlaceholder')}
                  value={origin}
                  onChange={setOrigin}
                  icon={<Navigation className="w-5 h-5 text-emerald-500" />}
                  language={language}
                />
                
                <div className="flex justify-center">
                  <button
                    onClick={handleSwapLocations}
                    className="p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-full transition-all duration-200 touch-manipulation group border-2 border-indigo-200 hover:border-indigo-300"
                    disabled={!origin || !destination}
                  >
                    <div className="w-5 h-5 border-2 border-indigo-400 group-hover:border-indigo-600 rounded rotate-45 transition-colors"></div>
                  </button>
                </div>
                
                <MapboxLocationInput
                  label={t('destination')}
                  placeholder={t('destinationPlaceholder')}
                  value={destination}
                  onChange={setDestination}
                  icon={<MapPin className="w-5 h-5 text-rose-500" />}
                  language={language}
                />
              </div>
            </div>

            {/* Suggest Route Button */}
            {origin && destination && !isLoadingRoutes && (
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-indigo-100 mt-6">
                {/* Location Summary */}
                <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                        <Navigation className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-emerald-700">{t('startingPoint')}</div>
                        <div className="text-sm font-bold text-gray-800 truncate">{origin.address}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-red-700">{t('destination')}</div>
                        <div className="text-sm font-bold text-gray-800 truncate">{destination.address}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleGetRoutes}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-6 px-8 rounded-2xl font-bold text-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 touch-manipulation shadow-2xl flex items-center justify-center gap-4 hover:scale-105 transform hover:shadow-3xl border-2 border-indigo-400"
                >
                  <RouteIcon className="w-8 h-8 animate-pulse" />
                  <span className="tracking-wide">
                    {language === 'sw' ? 'PENDEKEZA NJIA BORA' : 'SUGGEST BEST ROUTE'}
                  </span>
                  <Zap className="w-6 h-6 animate-bounce" />
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoadingRoutes && (
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-indigo-100">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-gray-700 font-medium">{t('findingBestRoute')}</div>
                    <div className="text-xs text-gray-500 mt-1">{t('analyzingTraffic')}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Route Results */}
            {routes.length > 0 && (
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-indigo-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <RouteIcon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {t('smartRoutes')} ({routes.length})
                  </h3>
                </div>
                <div className="space-y-4">
                  {routes.map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      isSelected={selectedRoute?.id === route.id}
                      onClick={() => {
                        setSelectedRoute(route);
                        setIsSidebarOpen(false);
                      }}
                      language={language}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Performance Stats */}
            {routes.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <div className="text-sm font-bold text-blue-800">{t('performanceStats')}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/60 rounded-lg p-2">
                    <div className="text-blue-600 font-medium">{t('routesAnalyzed')}</div>
                    <div className="text-blue-800 font-bold">{routes.length}</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2">
                    <div className="text-blue-600 font-medium">{t('avgAccuracy')}</div>
                    <div className="text-blue-800 font-bold">±3 min</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-white/90 backdrop-blur-lg rounded-none lg:rounded-2xl lg:shadow-2xl lg:m-6 lg:mr-8 overflow-hidden border border-indigo-100 lg:border-indigo-200">
            {isLoaded ? (
              <MapboxMapComponent
                routes={routes}
                selectedRoute={selectedRoute}
                origin={origin}
                destination={destination}
                onRouteSelect={setSelectedRoute}
                language={language}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
                <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-xl border border-indigo-100">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {t('mapsUnavailable')}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {loadError || t('mapsUnavailableDesc')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;