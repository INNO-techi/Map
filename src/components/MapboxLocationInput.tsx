import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Clock, Navigation } from 'lucide-react';
import { Location } from '../types/route';
import { MapboxRouteService } from '../services/mapboxRouteService';
import { Language } from '../hooks/useLanguage';

interface MapboxLocationInputProps {
  label: string;
  placeholder: string;
  value: Location | null;
  onChange: (location: Location | null) => void;
  icon: React.ReactNode;
  language: Language;
}

// Popular Tanzania locations for quick access
const POPULAR_LOCATIONS = [
  { name: { sw: 'Kituo cha Jiji Dar es Salaam', en: 'Dar es Salaam City Center' }, lat: -6.7924, lng: 39.2083, category: 'city' },
  { name: { sw: 'Soko la Kariakoo', en: 'Kariakoo Market' }, lat: -6.8161, lng: 39.2694, category: 'market' },
  { name: { sw: 'Uwanja wa Ndege Dar es Salaam', en: 'Dar es Salaam Airport' }, lat: -6.8781, lng: 39.2026, category: 'transport' },
  { name: { sw: 'Kituo cha Basi Ubungo', en: 'Ubungo Bus Terminal' }, lat: -6.7833, lng: 39.2667, category: 'transport' },
  { name: { sw: 'Chuo Kikuu cha Dar es Salaam', en: 'University of Dar es Salaam' }, lat: -6.7749, lng: 39.2352, category: 'education' },
  { name: { sw: 'Hospitali ya Muhimbili', en: 'Muhimbili Hospital' }, lat: -6.8007, lng: 39.2608, category: 'hospital' },
  { name: { sw: 'Jiji la Mbeya', en: 'Mbeya City' }, lat: -8.9094, lng: 33.4606, category: 'city' },
  { name: { sw: 'Jiji la Arusha', en: 'Arusha City' }, lat: -3.3869, lng: 36.6830, category: 'city' },
  { name: { sw: 'Jiji la Dodoma', en: 'Dodoma City' }, lat: -6.1630, lng: 35.7516, category: 'city' },
  { name: { sw: 'Jiji la Mwanza', en: 'Mwanza City' }, lat: -2.5164, lng: 32.9175, category: 'city' },
  { name: { sw: 'Jiji la Tanga', en: 'Tanga City' }, lat: -5.0692, lng: 39.0962, category: 'city' },
  { name: { sw: 'Jiji la Morogoro', en: 'Morogoro City' }, lat: -6.8235, lng: 37.6536, category: 'city' },
  { name: { sw: 'Soko la Mwenge', en: 'Mwenge Market' }, lat: -6.7500, lng: 39.2200, category: 'market' },
  { name: { sw: 'Mlimani City Mall', en: 'Mlimani City Mall' }, lat: -6.7700, lng: 39.2300, category: 'shopping' },
  { name: { sw: 'Slipway Shopping Centre', en: 'Slipway Shopping Centre' }, lat: -6.8000, lng: 39.2700, category: 'shopping' },
  { name: { sw: 'Kivukoni Fish Market', en: 'Kivukoni Fish Market' }, lat: -6.8200, lng: 39.2900, category: 'market' }
];

const MapboxLocationInput: React.FC<MapboxLocationInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  icon,
  language
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const mapboxService = useRef(new MapboxRouteService());
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const translations = {
    popularLocations: {
      sw: 'Maeneo Maarufu ya Tanzania',
      en: 'Popular Tanzania Locations'
    },
    selectLocation: {
      sw: 'Chagua Mahali',
      en: 'Select Location'
    },
    cities: {
      sw: 'Miji',
      en: 'Cities'
    },
    markets: {
      sw: 'Masoko',
      en: 'Markets'
    },
    transport: {
      sw: 'Usafiri',
      en: 'Transport'
    },
    hospitals: {
      sw: 'Hospitali',
      en: 'Hospitals'
    },
    education: {
      sw: 'Elimu',
      en: 'Education'
    },
    shopping: {
      sw: 'Ununuzi',
      en: 'Shopping'
    }
  };

  const t = (key: string) => translations[key as keyof typeof translations]?.[language] || key;

  useEffect(() => {
    setInputValue(value?.address || '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    setShowPopular(false);
    setShowDropdown(false);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(async () => {
      if (newValue.length > 2) {
        try {
          const results = await mapboxService.current.searchPlaces(newValue);
          setSuggestions(results);
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSuggestionClick = (suggestion: any) => {
    const [lng, lat] = suggestion.center;
    const location: Location = {
      lat,
      lng,
      address: suggestion.place_name
    };
    onChange(location);
    setSuggestions([]);
    setShowSuggestions(false);
    setShowPopular(false);
    setShowDropdown(false);
  };

  const handlePopularLocationClick = (popularLocation: typeof POPULAR_LOCATIONS[0]) => {
    const location: Location = {
      lat: popularLocation.lat,
      lng: popularLocation.lng,
      address: popularLocation.name[language]
    };
    onChange(location);
    setShowPopular(false);
    setShowSuggestions(false);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setShowPopular(false);
    setShowDropdown(false);
  };

  const handleFocus = () => {
    if (inputValue.length === 0) {
      setShowPopular(true);
      setShowSuggestions(false);
      setShowDropdown(false);
    } else {
      setShowSuggestions(true);
      setShowPopular(false);
      setShowDropdown(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setShowPopular(false);
      setShowDropdown(false);
    }, 150);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setShowSuggestions(false);
    setShowPopular(false);
  };

  const groupedLocations = POPULAR_LOCATIONS.reduce((acc, location) => {
    const category = location.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(location);
    return acc;
  }, {} as Record<string, typeof POPULAR_LOCATIONS>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'city': return '🏙️';
      case 'market': return '🏪';
      case 'transport': return '🚌';
      case 'hospital': return '🏥';
      case 'education': return '🎓';
      case 'shopping': return '🛍️';
      default: return '📍';
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
      </label>
      <div className="relative">
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={toggleDropdown}
          className="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center hover:from-indigo-600 hover:to-purple-700 transition-all duration-200">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-12 pr-16 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 touch-manipulation bg-white/80 backdrop-blur-sm hover:border-indigo-300"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-12 flex items-center pr-4">
          {value && (
            <button
              onClick={handleClear}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      
      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-lg border-2 border-indigo-100 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-800">{t('selectLocation')}</span>
            </div>
          </div>
          
          {Object.entries(groupedLocations).map(([category, locations]) => (
            <div key={category} className="border-b border-indigo-50 last:border-b-0">
              <div className="px-4 py-2 bg-indigo-50">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <span className="text-sm font-semibold text-indigo-700">
                    {t(category as keyof typeof translations) || category}
                  </span>
                  <span className="text-xs text-indigo-500">({locations.length})</span>
                </div>
              </div>
              {locations.map((location, index) => (
                <button
                  key={`${category}-${index}`}
                  onClick={() => handlePopularLocationClick(location)}
                  className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{getCategoryIcon(category)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate">
                        {location.name[language]}
                      </div>
                      <div className="text-xs text-gray-500">
                        Tanzania • {t(category as keyof typeof translations)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      
      {/* Popular Locations */}
      {showPopular && (
        <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-lg border-2 border-indigo-100 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          <div className="px-4 py-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-800">{t('popularLocations')}</span>
            </div>
          </div>
          {POPULAR_LOCATIONS.map((location, index) => (
            <button
              key={index}
              onClick={() => handlePopularLocationClick(location)}
              className="w-full px-4 py-3 text-left hover:bg-indigo-50 border-b border-indigo-50 last:border-b-0 transition-colors touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">
                    {location.name[language]}
                  </div>
                  <div className="text-xs text-gray-500">
                    Tanzania
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-lg border-2 border-indigo-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.id}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-4 text-left hover:bg-indigo-50 border-b border-indigo-50 last:border-b-0 transition-colors touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">
                    {suggestion.text}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {suggestion.place_name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapboxLocationInput;