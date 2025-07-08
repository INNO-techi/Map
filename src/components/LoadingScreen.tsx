import React from 'react';
import { Route as RouteIcon, MapPin, Navigation, Zap } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center mx-auto animate-pulse">
            <RouteIcon className="w-12 h-12 text-white" />
          </div>
          
          {/* Floating Icons */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center animate-bounce">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-1/2 -right-8 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '1s' }}>
            <Zap className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          SmartRoute TZ
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-8">
          Mfumo wa Akili wa Uongozaji
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-500 text-sm">
          Inaandaa mfumo wa uongozaji wa akili...
        </p>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-1 gap-3 text-xs text-gray-600">
          <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-indigo-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Uongozaji wa Wakati Halisi</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-indigo-100">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span>Uchambuzi wa Msongamano</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-indigo-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Njia za Akili</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;