import { useState, useEffect } from 'react';

export type Language = 'sw' | 'en';

interface Translations {
  [key: string]: {
    sw: string;
    en: string;
  };
}

const translations: Translations = {
  // App General
  appSubtitle: {
    sw: 'Mfumo wa akili wa uongozaji wa barabara',
    en: 'Intelligent traffic-aware navigation'
  },
  loadingApp: {
    sw: 'Inapakia SmartRoute TZ',
    en: 'Loading SmartRoute TZ'
  },
  preparingExperience: {
    sw: 'Inaandaa mfumo wa uongozaji wa akili...',
    en: 'Preparing your intelligent navigation experience...'
  },
  
  // Location
  currentLocation: {
    sw: 'Mahali Nilipo Sasa',
    en: 'Current Location'
  },
  
  // Journey Planning
  planJourney: {
    sw: 'Panga Safari Yako',
    en: 'Plan Your Journey'
  },
  startingPoint: {
    sw: 'Mahali pa Kuanzia',
    en: 'Starting Point'
  },
  startingPointPlaceholder: {
    sw: 'Chagua mahali pa kuanzia...',
    en: 'Choose starting point...'
  },
  destination: {
    sw: 'Mahali pa Kwenda',
    en: 'Destination'
  },
  destinationPlaceholder: {
    sw: 'Chagua mahali pa kwenda...',
    en: 'Choose destination...'
  },
  
  // Route Analysis
  findingBestRoute: {
    sw: 'Natafuta njia bora...',
    en: 'Finding best route...'
  },
  suggestRoute: {
    sw: 'Pendekeza Njia',
    en: 'Suggest Route'
  },
  analyzingTraffic: {
    sw: 'Nakagua msongamano na barabara',
    en: 'Analyzing traffic and roads'
  },
  smartRoutes: {
    sw: 'Njia za Akili',
    en: 'Smart Routes'
  },
  
  // Route Options
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
  },
  
  // Traffic Levels
  lightTraffic: {
    sw: 'Msongamano Mdogo',
    en: 'Light Traffic'
  },
  moderateTraffic: {
    sw: 'Msongamano wa Kati',
    en: 'Moderate Traffic'
  },
  heavyTraffic: {
    sw: 'Msongamano Mkubwa',
    en: 'Heavy Traffic'
  },
  
  // Map Controls
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
  
  // Traffic Legend
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
  
  // Route Info
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
  
  // Performance
  performanceStats: {
    sw: 'Takwimu za Utendaji',
    en: 'Performance Stats'
  },
  routesAnalyzed: {
    sw: 'Njia Zilichunguzwa',
    en: 'Routes Analyzed'
  },
  avgAccuracy: {
    sw: 'Usahihi wa Wastani',
    en: 'Avg Accuracy'
  },
  
  // Errors
  mapsUnavailable: {
    sw: 'Ramani Haipatikani',
    en: 'Maps Unavailable'
  },
  mapsUnavailableDesc: {
    sw: 'Imeshindwa kupakia ramani. Tafadhali kagua muunganisho wako wa mtandao na usanidi wa token.',
    en: 'Unable to load maps. Please check your internet connection and token configuration.'
  },
  noRoutesFound: {
    sw: 'Hakuna Njia Iliyopatikana',
    en: 'No Routes Found'
  },
  noRoutesFoundDesc: {
    sw: 'Tumeshindwa kupata njia kati ya mahali hapa. Jaribu mahali mengine.',
    en: 'Unable to find routes between these locations. Try different locations.'
  },
  
  // Location Permission
  locationPermissionTitle: {
    sw: 'Ruhusa ya Mahali',
    en: 'Location Permission'
  },
  locationPermissionDesc: {
    sw: 'SmartRoute TZ inahitaji ruhusa ya mahali ili kukupa uongozaji wa sahihi. Tutahifadhi mahali pako kwa usalama na hakutakuwa na matumizi mengine.',
    en: 'SmartRoute TZ needs location permission to provide accurate navigation. We will keep your location secure and will not use it for other purposes.'
  },
  allowLocation: {
    sw: 'Ruhusu Mahali',
    en: 'Allow Location'
  },
  skipForNow: {
    sw: 'Ruka Kwa Sasa',
    en: 'Skip For Now'
  },
  
  // Popular Locations
  popularLocations: {
    sw: 'Maeneo Maarufu ya Tanzania',
    en: 'Popular Tanzania Locations'
  },
  
  // Route Recommendations
  routeRecommendation: {
    sw: 'Ushauri wa Njia',
    en: 'Route Recommendation'
  },
  
  // Language
  language: {
    sw: 'Lugha',
    en: 'Language'
  },
  swahili: {
    sw: 'Kiswahili',
    en: 'Swahili'
  },
  english: {
    sw: 'Kiingereza',
    en: 'English'
  }
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('sw'); // Default to Swahili

  useEffect(() => {
    const savedLanguage = localStorage.getItem('smartroute-language') as Language;
    if (savedLanguage && (savedLanguage === 'sw' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('smartroute-language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return {
    language,
    setLanguage: changeLanguage,
    t
  };
};