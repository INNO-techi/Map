import React from 'react';
import { Settings, SignalHigh as Highway, DollarSign, Zap } from 'lucide-react';
import { RouteRequest } from '../types/route';
import { Language } from '../hooks/useLanguage';

interface RouteOptionsProps {
  options: RouteRequest;
  onChange: (options: RouteRequest) => void;
  language: Language;
}

const RouteOptions: React.FC<RouteOptionsProps> = ({ options, onChange, language }) => {
  const translations = {
    routePreferences: {
      sw: 'Chaguo za Safari',
      en: 'Route Preferences'
    },
    avoidTraffic: {
      sw: 'Epuka Foleni za Msongamano',
      en: 'Avoid Traffic Jams'
    },
    avoidTrafficDesc: {
      sw: 'Chagua njia bila msongamano mkubwa',
      en: 'Choose routes without heavy traffic'
    },
    localRoads: {
      sw: 'Njia za Mitaani',
      en: 'Local Roads'
    },
    localRoadsDesc: {
      sw: 'Tumia barabara za mitaani badala ya highway',
      en: 'Use local roads instead of highways'
    },
    avoidTolls: {
      sw: 'Epuka Ada za Barabara',
      en: 'Avoid Toll Roads'
    },
    avoidTollsDesc: {
      sw: 'Okoa pesa kwa kuepuka ada za barabara',
      en: 'Save money by avoiding toll roads'
    }
  };

  const t = (key: string) => translations[key as keyof typeof translations]?.[language] || key;

  const handleToggle = (key: keyof RouteRequest) => {
    if (typeof options[key] === 'boolean') {
      onChange({
        ...options,
        [key]: !options[key]
      });
    }
  };

  const optionConfigs = [
    {
      key: 'optimizeForTraffic' as keyof RouteRequest,
      icon: <Zap className="w-5 h-5 text-white" />,
      title: t('avoidTraffic'),
      description: t('avoidTrafficDesc'),
      bgGradient: 'from-blue-500 to-indigo-600',
      hoverBg: 'hover:from-blue-600 hover:to-indigo-700'
    },
    {
      key: 'avoidHighways' as keyof RouteRequest,
      icon: <Highway className="w-5 h-5 text-white" />,
      title: t('localRoads'),
      description: t('localRoadsDesc'),
      bgGradient: 'from-emerald-500 to-green-600',
      hoverBg: 'hover:from-emerald-600 hover:to-green-700'
    },
    {
      key: 'avoidTolls' as keyof RouteRequest,
      icon: <DollarSign className="w-5 h-5 text-white" />,
      title: t('avoidTolls'),
      description: t('avoidTollsDesc'),
      bgGradient: 'from-amber-500 to-orange-600',
      hoverBg: 'hover:from-amber-600 hover:to-orange-700'
    }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-indigo-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{t('routePreferences')}</h3>
      </div>
      
      <div className="space-y-4">
        {optionConfigs.map((config) => (
          <label
            key={config.key}
            className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 cursor-pointer touch-manipulation border-2 border-transparent hover:border-indigo-200"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className={`w-10 h-10 bg-gradient-to-r ${config.bgGradient} ${config.hoverBg} rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110`}>
                {config.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 text-base group-hover:text-indigo-900 transition-colors">
                  {config.title}
                </div>
                <div className="text-sm text-gray-600 group-hover:text-indigo-700 transition-colors">
                  {config.description}
                </div>
              </div>
            </div>
            <div className="relative flex-shrink-0 ml-4">
              <input
                type="checkbox"
                checked={options[config.key] as boolean}
                onChange={() => handleToggle(config.key)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                options[config.key] 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                  : 'bg-gray-300'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 mt-0.5 ${
                  options[config.key] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RouteOptions;