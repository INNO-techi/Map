import React from 'react';
import { Clock, MapPin, AlertTriangle, CheckCircle, AlertCircle, Zap, Star, ThumbsUp } from 'lucide-react';
import { Route } from '../types/route';
import { Language } from '../hooks/useLanguage';

interface RouteCardProps {
  route: Route;
  isSelected: boolean;
  onClick: () => void;
  language: Language;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, isSelected, onClick, language }) => {
  const translations = {
    duration: {
      sw: 'Muda',
      en: 'Duration'
    },
    distance: {
      sw: 'Umbali',
      en: 'Distance'
    },
    withCurrentTraffic: {
      sw: 'pamoja na msongamano wa sasa',
      en: 'with current traffic'
    },
    totalDistance: {
      sw: 'umbali wote',
      en: 'total distance'
    },
    delayDueToTraffic: {
      sw: 'kuchelewa kwa sababu ya msongamano',
      en: 'delay due to traffic'
    },
    normalTime: {
      sw: 'Muda wa kawaida:',
      en: 'Normal time:'
    },
    routeRecommendation: {
      sw: 'Ushauri wa Njia',
      en: 'Route Recommendation'
    },
    selectedRoute: {
      sw: 'NJIA ILIYOCHAGULIWA',
      en: 'SELECTED ROUTE'
    },
    lightTraffic: {
      sw: 'Msongamano mdogo',
      en: 'Light traffic'
    },
    moderateTraffic: {
      sw: 'Msongamano wa kati',
      en: 'Moderate traffic'
    },
    heavyTraffic: {
      sw: 'Msongamano mkubwa',
      en: 'Heavy traffic'
    }
  };

  const t = (key: string) => translations[key as keyof typeof translations]?.[language] || key;

  const getTrafficConfig = () => {
    switch (route.trafficLevel) {
      case 'light':
        return {
          icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
          text: t('lightTraffic'),
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          accentColor: 'from-emerald-400 to-green-500'
        };
      case 'moderate':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
          text: t('moderateTraffic'),
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          accentColor: 'from-amber-400 to-orange-500'
        };
      case 'heavy':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
          text: t('heavyTraffic'),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          accentColor: 'from-red-400 to-pink-500'
        };
    }
  };

  const trafficConfig = getTrafficConfig();

  const cardClasses = isSelected
    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-lg scale-[1.02]'
    : `${trafficConfig.bgColor} ${trafficConfig.borderColor} hover:shadow-lg hover:scale-[1.01]`;

  const smartScore = route.smartScore || 0;
  const recommendation = route.recommendation;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-400 to-green-500';
    if (score >= 70) return 'from-blue-400 to-indigo-500';
    if (score >= 50) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 touch-manipulation ${cardClasses}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-8 h-8 bg-gradient-to-r ${trafficConfig.accentColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 truncate text-lg">{route.summary}</h3>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          {/* Smart Score */}
          {smartScore > 0 && (
            <div className={`flex items-center gap-1 bg-gradient-to-r ${getScoreColor(smartScore)} text-white px-2 py-1 rounded-full`}>
              <Star className="w-3 h-3" />
              <span className="text-xs font-bold">{smartScore}</span>
            </div>
          )}
          {trafficConfig.icon}
          <span className="text-xs font-semibold text-gray-600 hidden sm:inline bg-white/60 px-2 py-1 rounded-full">
            {trafficConfig.text}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-600">{t('duration')}</span>
            </div>
            <div className="font-bold text-gray-900 text-lg">{route.durationInTraffic}</div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Umbali:</span>
            <span className="font-semibold text-gray-700">{route.distance}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Bila foleni:</span>
            <span className="font-semibold text-gray-700">{route.duration}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Kasi ya wastani:</span>
            <span className="font-semibold text-gray-700">
              {Math.round(parseFloat(route.distance) / (parseInt(route.duration) / 60))} km/h
            </span>
          </div>
        </div>
      </div>

      {/* Traffic Impact */}
      {route.duration !== route.durationInTraffic && (
        <div className="bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-orange-600" />
            <span className="text-xs font-semibold text-orange-800">
              +{Math.round((parseInt(route.durationInTraffic) - parseInt(route.duration)) / parseInt(route.duration) * 100)}% 
              {' '}{t('delayDueToTraffic')}
            </span>
          </div>
          <div className="text-xs text-orange-700 mt-1">
            {t('normalTime')} {route.duration}
          </div>
        </div>
      )}

      {/* Smart Recommendation */}
      {recommendation && (
        <div className={`px-3 py-2 rounded-lg mt-3 ${
          route.trafficLevel === 'light' 
            ? 'bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200'
            : route.trafficLevel === 'moderate'
            ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200'
            : 'bg-gradient-to-r from-red-100 to-pink-100 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {route.trafficLevel === 'light' ? (
              <ThumbsUp className="w-3 h-3 text-emerald-600" />
            ) : route.trafficLevel === 'moderate' ? (
              <AlertCircle className="w-3 h-3 text-amber-600" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-red-600" />
            )}
            <span className={`text-xs font-semibold ${
              route.trafficLevel === 'light' 
                ? 'text-emerald-800'
                : route.trafficLevel === 'moderate'
                ? 'text-amber-800'
                : 'text-red-800'
            }`}>
              {route.trafficLevel === 'light' ? '✅ Njia Bora' : 
               route.trafficLevel === 'moderate' ? '⚠️ Onyo' : 
               '🚨 Tahadhari'}
            </span>
          </div>
          <div className={`text-xs mt-1 ${
            route.trafficLevel === 'light' 
              ? 'text-emerald-700'
              : route.trafficLevel === 'moderate'
              ? 'text-amber-700'
              : 'text-red-700'
          }`}>
            {recommendation}
          </div>
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="mt-3 flex items-center justify-center">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
            <Zap className="w-3 h-3" />
            {t('selectedRoute')}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteCard;