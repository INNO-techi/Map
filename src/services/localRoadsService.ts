import { Route, Location, RouteRequest } from '../types/route';
import { calculateTrafficLevel, formatDuration, formatDistance } from '../utils/routeUtils';

interface LocalAreaData {
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  localRoads: {
    name: string;
    coordinates: [number, number][];
    type: 'main' | 'secondary' | 'local' | 'residential';
    trafficPattern: 'light' | 'moderate' | 'heavy';
    timeBasedTraffic: {
      morning: 'light' | 'moderate' | 'heavy';
      afternoon: 'light' | 'moderate' | 'heavy';
      evening: 'light' | 'moderate' | 'heavy';
      night: 'light' | 'moderate' | 'heavy';
    };
  }[];
  landmarks: {
    name: string;
    coordinates: [number, number];
    type: 'market' | 'hospital' | 'school' | 'mosque' | 'church' | 'bus_station';
  }[];
}

export class LocalRoadsService {
  private accessToken: string;
  private baseUrl = 'https://api.mapbox.com';

  // Tanzania local areas data
  private localAreas: LocalAreaData[] = [
    {
      name: 'Dar es Salaam',
      bounds: { north: -6.7, south: -6.9, east: 39.4, west: 39.1 },
      localRoads: [
        {
          name: 'Uhuru Street',
          coordinates: [[39.2083, -6.8161], [39.2094, -6.8151], [39.2105, -6.8141]],
          type: 'main',
          trafficPattern: 'heavy',
          timeBasedTraffic: { morning: 'heavy', afternoon: 'moderate', evening: 'heavy', night: 'light' }
        },
        {
          name: 'Kariakoo Street',
          coordinates: [[39.2694, -6.8161], [39.2704, -6.8151], [39.2714, -6.8141]],
          type: 'main',
          trafficPattern: 'heavy',
          timeBasedTraffic: { morning: 'heavy', afternoon: 'heavy', evening: 'heavy', night: 'moderate' }
        },
        {
          name: 'Msimbazi Street',
          coordinates: [[39.2583, -6.8061], [39.2594, -6.8051], [39.2605, -6.8041]],
          type: 'secondary',
          trafficPattern: 'moderate',
          timeBasedTraffic: { morning: 'moderate', afternoon: 'moderate', evening: 'moderate', night: 'light' }
        },
        {
          name: 'Nyerere Road',
          coordinates: [[39.2083, -6.7924], [39.2183, -6.7824], [39.2283, -6.7724]],
          type: 'main',
          trafficPattern: 'heavy',
          timeBasedTraffic: { morning: 'heavy', afternoon: 'moderate', evening: 'heavy', night: 'light' }
        },
        {
          name: 'Kilwa Road',
          coordinates: [[39.2083, -6.8024], [39.2183, -6.8124], [39.2283, -6.8224]],
          type: 'main',
          trafficPattern: 'moderate',
          timeBasedTraffic: { morning: 'moderate', afternoon: 'light', evening: 'moderate', night: 'light' }
        },
        {
          name: 'Mandela Road',
          coordinates: [[39.1983, -6.7924], [39.2083, -6.7824], [39.2183, -6.7724]],
          type: 'secondary',
          trafficPattern: 'light',
          timeBasedTraffic: { morning: 'light', afternoon: 'light', evening: 'moderate', night: 'light' }
        }
      ],
      landmarks: [
        { name: 'Kariakoo Market', coordinates: [39.2694, -6.8161], type: 'market' },
        { name: 'Muhimbili Hospital', coordinates: [39.2083, -6.7924], type: 'hospital' },
        { name: 'Ubungo Bus Terminal', coordinates: [39.2583, -6.7824], type: 'bus_station' },
        { name: 'University of Dar es Salaam', coordinates: [39.2083, -6.7724], type: 'school' }
      ]
    },
    {
      name: 'Mbeya',
      bounds: { north: -8.85, south: -8.95, east: 33.5, west: 33.4 },
      localRoads: [
        {
          name: 'Mbeya-Tunduma Road',
          coordinates: [[33.4606, -8.9094], [33.4706, -8.9194], [33.4806, -8.9294]],
          type: 'main',
          trafficPattern: 'moderate',
          timeBasedTraffic: { morning: 'moderate', afternoon: 'light', evening: 'moderate', night: 'light' }
        },
        {
          name: 'Uyole Street',
          coordinates: [[33.4506, -8.9094], [33.4516, -8.9104], [33.4526, -8.9114]],
          type: 'secondary',
          trafficPattern: 'light',
          timeBasedTraffic: { morning: 'light', afternoon: 'light', evening: 'light', night: 'light' }
        },
        {
          name: 'Market Street',
          coordinates: [[33.4606, -8.9194], [33.4616, -8.9184], [33.4626, -8.9174]],
          type: 'local',
          trafficPattern: 'moderate',
          timeBasedTraffic: { morning: 'moderate', afternoon: 'heavy', evening: 'moderate', night: 'light' }
        }
      ],
      landmarks: [
        { name: 'Mbeya Central Market', coordinates: [33.4606, -8.9194], type: 'market' },
        { name: 'Mbeya Referral Hospital', coordinates: [33.4506, -8.9094], type: 'hospital' },
        { name: 'Uyole Bus Stand', coordinates: [33.4506, -8.9194], type: 'bus_station' }
      ]
    }
  ];

  constructor() {
    this.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  }

  async getLocalRoutes(request: RouteRequest): Promise<Route[]> {
    if (!this.accessToken || !request.origin || !request.destination) {
      console.error('Missing required data for route calculation:', {
        hasToken: !!this.accessToken,
        hasOrigin: !!request.origin,
        hasDestination: !!request.destination,
        origin: request.origin?.address,
        destination: request.destination?.address
      });
      return [];
    }

    console.log('🗺️ Getting routes from:', request.origin.address, 'to:', request.destination.address);

    // Check if route is within local areas
    const localArea = this.findLocalArea(request.origin, request.destination);
    
    console.log('🏙️ Local area found:', localArea?.name || 'Long distance route');
    
    if (localArea) {
      return this.getLocalAreaRoutes(request, localArea);
    } else {
      return this.getLongDistanceRoutes(request);
    }
  }

  private findLocalArea(origin: Location, destination: Location): LocalAreaData | null {
    for (const area of this.localAreas) {
      const originInArea = this.isLocationInBounds(origin, area.bounds);
      const destinationInArea = this.isLocationInBounds(destination, area.bounds);
      
      if (originInArea && destinationInArea) {
        return area;
      }
    }
    return null;
  }

  private isLocationInBounds(location: Location, bounds: any): boolean {
    return location.lat >= bounds.south && 
           location.lat <= bounds.north && 
           location.lng >= bounds.west && 
           location.lng <= bounds.east;
  }

  private async getLocalAreaRoutes(request: RouteRequest, localArea: LocalAreaData): Promise<Route[]> {
    const routes: Route[] = [];
    
    console.log('🚗 Getting local area routes for:', localArea.name);
    
    // Get multiple route alternatives for local roads
    const routeTypes = [
      { profile: 'driving-traffic', name: 'Njia ya Haraka (Traffic-Aware)', priority: 1 },
      { profile: 'driving', name: 'Njia ya Kawaida', priority: 2 }
    ];

    for (const routeType of routeTypes) {
      try {
        const route = await this.getMapboxRoute(request, routeType.profile, localArea);
        if (route) {
          route.summary = `${routeType.name}`;
          route.id = `local-${routeType.profile}-${routes.length}`;
          
          // Add local area context to recommendation
          if (route.recommendation) {
            route.recommendation = `${route.recommendation} (${localArea.name})`;
          }
          
          routes.push(route);
          console.log('✅ Added route:', route.summary, 'Duration:', route.durationInTraffic);
        }
      } catch (error) {
        console.error(`❌ Error getting ${routeType.name}:`, error);
      }
    }

    console.log('📊 Total local routes found:', routes.length);
    
    // Add local roads analysis
    return this.enhanceWithLocalRoadsData(routes, localArea);
  }

  private async getLongDistanceRoutes(request: RouteRequest): Promise<Route[]> {
    const routes: Route[] = [];
    
    console.log('🛣️ Getting long distance routes');
    
    // For long distance, get multiple alternatives
    const routeProfiles = [
      'driving-traffic',
      'driving'
    ];

    for (const profile of routeProfiles) {
      try {
        const route = await this.getMapboxRoute(request, profile);
        if (route) {
          route.summary = profile === 'driving-traffic' ? 
            'Njia Bora (Bila Foleni)' : 
            'Njia ya Kawaida';
          route.id = `long-${profile}-${routes.length}`;
          routes.push(route);
          console.log('✅ Added long distance route:', route.summary, 'Duration:', route.durationInTraffic);
        }
      } catch (error) {
        console.error(`❌ Error getting long distance route:`, error);
      }
    }

    console.log('📊 Total long distance routes found:', routes.length);
    return routes;
  }

  private async getMapboxRoute(request: RouteRequest, profile: string, localArea?: LocalAreaData): Promise<Route | null> {
    const coordinates = `${request.origin!.lng},${request.origin!.lat};${request.destination!.lng},${request.destination!.lat}`;
    
    console.log('🌐 Requesting Mapbox route:', { 
      profile, 
      from: request.origin!.address, 
      to: request.destination!.address,
      coordinates 
    });
    
    const params = new URLSearchParams({
      access_token: this.accessToken,
      geometries: 'geojson',
      steps: 'true',
      annotations: 'duration,distance,speed,congestion',
      overview: 'full',
      alternatives: 'false', // Get single best route
      continue_straight: 'false',
      language: 'en' // Use English for better compatibility
    });

    // Add route preferences
    const exclude = [];
    if (request.avoidHighways) exclude.push('motorway');
    if (request.avoidTolls) exclude.push('toll');
    if (exclude.length > 0) {
      params.append('exclude', exclude.join(','));
    }

    // For local areas, prefer local roads
    if (localArea) {
      params.append('approaches', 'unrestricted;unrestricted');
      params.append('radiuses', '1000;1000'); // 1km radius for local routing
    }

    const url = `${this.baseUrl}/directions/v5/mapbox/${profile}/${coordinates}?${params}`;
    
    console.log('🔗 Mapbox API request URL constructed');
    
    try {
      const response = await fetch(url);
    
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Mapbox API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return null;
      }
    
      const data = await response.json();
    
      console.log('📍 Mapbox response received:', {
        routesFound: data.routes?.length || 0,
        hasGeometry: !!(data.routes?.[0]?.geometry),
        distance: data.routes?.[0]?.distance,
        duration: data.routes?.[0]?.duration
      });

      if (data.routes && data.routes.length > 0) {
        const transformedRoute = this.transformToRoute(data.routes[0], localArea);
        console.log('🔄 Route transformed successfully:', {
          id: transformedRoute.id,
          summary: transformedRoute.summary,
          distance: transformedRoute.distance,
          duration: transformedRoute.durationInTraffic,
          trafficLevel: transformedRoute.trafficLevel,
          smartScore: transformedRoute.smartScore
        });
        return transformedRoute;
      }

      console.log('⚠️ No routes found in Mapbox response');
      return null;
    } catch (error) {
      console.error('❌ Network error calling Mapbox API:', error);
      return null;
    }
  }

  private transformToRoute(mapboxRoute: any, localArea?: LocalAreaData): Route {
    const duration = mapboxRoute.duration;
    const distance = mapboxRoute.distance;
    
    // Analyze traffic conditions
    const congestionData = mapboxRoute.legs?.[0]?.annotation?.congestion || [];
    const trafficAnalysis = this.analyzeLocalTraffic(congestionData, localArea);
    const durationInTraffic = Math.round(duration * trafficAnalysis.multiplier);

    return {
      id: `route-${Date.now()}`,
      summary: localArea ? `Njia ya Mitaani (${localArea.name})` : 'Njia ya Safari',
      distance: formatDistance(distance),
      duration: formatDuration(duration),
      durationInTraffic: formatDuration(durationInTraffic),
      trafficLevel: trafficAnalysis.level,
      steps: this.transformSteps(mapboxRoute.legs?.[0]?.steps || []),
      polyline: JSON.stringify(mapboxRoute.geometry),
      bounds: this.calculateBounds(mapboxRoute.geometry),
      smartScore: this.calculateLocalSmartScore(trafficAnalysis, duration, distance, localArea),
      recommendation: this.generateLocalRecommendation(trafficAnalysis, localArea)
    };
  }

  private analyzeLocalTraffic(congestionData: string[], localArea?: LocalAreaData) {
    const currentHour = new Date().getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    
    if (currentHour >= 6 && currentHour < 12) timeOfDay = 'morning';
    else if (currentHour >= 12 && currentHour < 17) timeOfDay = 'afternoon';
    else if (currentHour >= 17 && currentHour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Base analysis from congestion data
    let level: 'light' | 'moderate' | 'heavy' = 'light';
    let multiplier = 1.0;

    if (congestionData.length > 0) {
      const heavyCount = congestionData.filter(c => c === 'severe' || c === 'heavy').length;
      const ratio = heavyCount / congestionData.length;
      
      if (ratio > 0.4) {
        level = 'heavy';
        multiplier = 1.8;
      } else if (ratio > 0.2) {
        level = 'moderate';
        multiplier = 1.4;
      } else {
        level = 'light';
        multiplier = 1.1;
      }
    }

    // Enhance with local area knowledge
    if (localArea) {
      const localTrafficPattern = this.getLocalTrafficPattern(localArea, timeOfDay);
      if (localTrafficPattern === 'heavy') {
        level = 'heavy';
        multiplier = Math.max(multiplier, 1.6);
      } else if (localTrafficPattern === 'moderate') {
        level = level === 'light' ? 'moderate' : level;
        multiplier = Math.max(multiplier, 1.3);
      }
    }

    return { level, multiplier };
  }

  private getLocalTrafficPattern(localArea: LocalAreaData, timeOfDay: string): 'light' | 'moderate' | 'heavy' {
    // Average traffic pattern for the area at this time
    const patterns = localArea.localRoads.map(road => 
      road.timeBasedTraffic[timeOfDay as keyof typeof road.timeBasedTraffic]
    );
    
    const heavyCount = patterns.filter(p => p === 'heavy').length;
    const moderateCount = patterns.filter(p => p === 'moderate').length;
    
    if (heavyCount > patterns.length / 2) return 'heavy';
    if (moderateCount > patterns.length / 3) return 'moderate';
    return 'light';
  }

  private transformSteps(steps: any[]): any[] {
    return steps.map(step => ({
      instruction: this.translateToSwahili(step.maneuver?.instruction || 'Endelea'),
      distance: formatDistance(step.distance),
      duration: formatDuration(step.duration),
      polyline: JSON.stringify(step.geometry)
    }));
  }

  private translateToSwahili(instruction: string): string {
    const translations: Record<string, string> = {
      'Continue': 'Endelea',
      'Turn left': 'Geuka kushoto',
      'Turn right': 'Geuka kulia',
      'Keep left': 'Shika kushoto',
      'Keep right': 'Shika kulia',
      'Make a U-turn': 'Rudi nyuma',
      'Head': 'Elekea',
      'Arrive': 'Fika',
      'Exit': 'Toka',
      'Enter': 'Ingia',
      'Merge': 'Jiunga',
      'Continue straight': 'Endelea moja kwa moja',
      'Slight left': 'Geuka kidogo kushoto',
      'Slight right': 'Geuka kidogo kulia',
      'Sharp left': 'Geuka kwa nguvu kushoto',
      'Sharp right': 'Geuka kwa nguvu kulia'
    };

    let translated = instruction;
    Object.entries(translations).forEach(([english, swahili]) => {
      translated = translated.replace(new RegExp(english, 'gi'), swahili);
    });

    return translated;
  }

  private calculateLocalSmartScore(trafficAnalysis: any, duration: number, distance: number, localArea?: LocalAreaData): number {
    let score = 85; // Base score for local routes

    // Traffic level impact
    if (trafficAnalysis.level === 'light') score += 10;
    else if (trafficAnalysis.level === 'moderate') score += 0;
    else score -= 15;

    // Local area bonus
    if (localArea) score += 5;

    // Distance efficiency
    if (distance < 5000) score += 5; // Short local routes
    else if (distance > 50000) score -= 10; // Very long routes

    // Time efficiency
    if (duration < 1800) score += 5; // Under 30 minutes
    else if (duration > 7200) score -= 10; // Over 2 hours

    return Math.max(0, Math.min(100, score));
  }

  private generateLocalRecommendation(trafficAnalysis: any, localArea?: LocalAreaData): string {
    const areaName = localArea?.name || 'eneo hili';
    
    const recommendations = {
      'light': [
        `Njia nzuri sana katika ${areaName}! Hakuna msongamano.`,
        `Safari rahisi. Utafika kwa wakati.`,
        `Barabara ni wazi. Endelea haraka!`
      ],
      'moderate': [
        `Kuna msongamano kidogo. Subiri dakika chache.`,
        `Hali ya kawaida ya msongamano.`,
        `Njia nzuri lakini kuna msongamano kidogo.`
      ],
      'heavy': [
        `Msongamano mkubwa. Fikiria njia nyingine.`,
        `Foleni nyingi. Subiri au chagua njia nyingine.`,
        `Hali ngumu ya msongamano sasa hivi.`
      ]
    };

    const levelRecommendations = recommendations[trafficAnalysis.level];
    return levelRecommendations[Math.floor(Math.random() * levelRecommendations.length)];
  }

  private enhanceWithLocalRoadsData(routes: Route[], localArea: LocalAreaData): Route[] {
    return routes.map(route => {
      // Add local landmarks information if recommendation exists
      if (route.recommendation) {
        const nearbyLandmarks = this.findNearbyLandmarks(route, localArea);
        if (nearbyLandmarks.length > 0) {
          route.recommendation += ` Utapita karibu na ${nearbyLandmarks[0].name}.`;
        }
      }

      return route;
    });
  }

  private findNearbyLandmarks(route: Route, localArea: LocalAreaData): any[] {
    // Simple implementation - in real app, you'd check if route passes near landmarks
    return localArea.landmarks.slice(0, 1); // Return first landmark for demo
  }

  private calculateBounds(geometry: any): any {
    const coordinates = geometry.coordinates;
    let minLng = Infinity, minLat = Infinity;
    let maxLng = -Infinity, maxLat = -Infinity;

    coordinates.forEach(([lng, lat]: [number, number]) => {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    });

    return {
      southwest: { lat: minLat, lng: minLng },
      northeast: { lat: maxLat, lng: maxLng }
    };
  }
}