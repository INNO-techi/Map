import { Route, Location, RouteRequest } from '../types/route';
import { formatDuration, formatDistance } from '../utils/routeUtils';

export class SmartRouteService {
  private accessToken: string;
  private baseUrl = 'https://api.mapbox.com';

  constructor() {
    this.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  }

  async getSmartRoutes(request: RouteRequest): Promise<Route[]> {
    if (!this.accessToken || !request.origin || !request.destination) {
      console.error('❌ Missing required data for smart routes');
      return [];
    }

    console.log('🧠 Getting smart routes from:', request.origin.address, 'to:', request.destination.address);

    try {
      // Get traffic-aware route with alternatives
      const routes = await this.getTrafficAwareRoutes(request);
      
      if (routes.length > 0) {
        console.log('✅ Routes found:', routes.length);
        // Sort routes by traffic level (best routes first)
        const sortedRoutes = this.sortRoutesByTrafficLevel(routes);
        return sortedRoutes.slice(0, 3); // Return top 3 routes
      }

      return [];
    } catch (error) {
      console.error('❌ Error getting smart routes:', error);
      return [];
    }
  }

  private async getTrafficAwareRoutes(request: RouteRequest): Promise<Route[]> {
    const coordinates = `${request.origin!.lng},${request.origin!.lat};${request.destination!.lng},${request.destination!.lat}`;
    
    console.log('🛣️ Getting traffic-aware routes...');
    
    const params = new URLSearchParams({
      access_token: this.accessToken,
      geometries: 'geojson',
      steps: 'true',
      annotations: 'duration,distance,speed,congestion',
      overview: 'full',
      alternatives: 'true',
      continue_straight: 'false',
      language: 'en'
    });

    // Add route preferences
    const exclude = [];
    if (request.avoidHighways) exclude.push('motorway');
    if (request.avoidTolls) exclude.push('toll');
    if (exclude.length > 0) {
      params.append('exclude', exclude.join(','));
    }

    const url = `${this.baseUrl}/directions/v5/mapbox/driving-traffic/${coordinates}?${params}`;
    
    console.log('🌐 Requesting routes from Mapbox...');
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Mapbox API error:', {
          status: response.status,
          error: errorText
        });
        return [];
      }
      
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        console.log('✅ Routes received:', data.routes.length, 'alternatives');
        return data.routes.map((route: any, index: number) => 
          this.transformRouteWithTrafficAnalysis(route, index)
        );
      }

      console.log('⚠️ No routes found in response');
      return [];
    } catch (error) {
      console.error('❌ Network error:', error);
      return [];
    }
  }

  private transformRouteWithTrafficAnalysis(route: any, index: number): Route {
    const duration = route.duration;
    const distance = route.distance;
    
    console.log(`🔄 Transforming route ${index + 1}:`, {
      duration: Math.round(duration),
      distance: Math.round(distance)
    });
    
    // Analyze traffic conditions and get road recommendations
    const congestionData = route.legs?.[0]?.annotation?.congestion || [];
    const trafficAnalysis = this.analyzeTrafficConditions(congestionData);
    const durationInTraffic = Math.round(duration * trafficAnalysis.multiplier);
    
    // Get road recommendations based on traffic
    const roadRecommendations = this.generateRoadRecommendations(route, trafficAnalysis);

    const transformedRoute: Route = {
      id: `route-${index}`,
      summary: this.generateRouteSummary(trafficAnalysis, index),
      distance: formatDistance(distance),
      duration: formatDuration(duration),
      durationInTraffic: formatDuration(durationInTraffic),
      trafficLevel: trafficAnalysis.level,
      steps: this.transformStepsWithRoadNames(route.legs?.[0]?.steps || []),
      polyline: JSON.stringify(route.geometry),
      bounds: this.calculateBounds(route.geometry),
      smartScore: trafficAnalysis.score,
      recommendation: roadRecommendations.recommendation
    };

    console.log(`✅ Route ${index + 1} transformed:`, {
      summary: transformedRoute.summary,
      trafficLevel: transformedRoute.trafficLevel,
      score: transformedRoute.smartScore,
      recommendation: transformedRoute.recommendation
    });

    return transformedRoute;
  }

  private analyzeTrafficConditions(congestionData: string[]) {
    console.log('🚦 Analyzing traffic conditions:', {
      congestionPoints: congestionData.length
    });

    if (!congestionData.length) {
      return { level: 'light' as const, multiplier: 1.0, score: 95 };
    }
    
    const congestionCounts = congestionData.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = congestionData.length;
    const severeRatio = (congestionCounts.severe || 0) / total;
    const heavyRatio = (congestionCounts.heavy || 0) / total;
    const moderateRatio = (congestionCounts.moderate || 0) / total;
    const lightRatio = (congestionCounts.low || 0) / total;

    let level: 'light' | 'moderate' | 'heavy';
    let multiplier: number;
    let score: number;

    if (severeRatio > 0.3) {
      level = 'heavy';
      multiplier = 2.0;
      score = 25;
    } else if (heavyRatio > 0.4) {
      level = 'heavy';
      multiplier = 1.7;
      score = 35;
    } else if (moderateRatio > 0.5) {
      level = 'moderate';
      multiplier = 1.3;
      score = 65;
    } else if (lightRatio > 0.6) {
      level = 'light';
      multiplier = 1.05;
      score = 95;
    } else {
      level = 'moderate';
      multiplier = 1.2;
      score = 70;
    }

    console.log('📊 Traffic analysis result:', { 
      level, 
      multiplier, 
      score,
      ratios: { severeRatio, heavyRatio, moderateRatio, lightRatio }
    });
    
    return { level, multiplier, score };
  }

  private generateRoadRecommendations(route: any, trafficAnalysis: any) {
    const steps = route.legs?.[0]?.steps || [];
    const majorRoads = this.extractMajorRoads(steps);
    const routeDistance = route.distance;
    const routeDuration = route.duration;
    
    let recommendation = '';
    
    if (trafficAnalysis.level === 'light') {
      if (majorRoads.length > 0) {
        recommendation = `Njia bora! Pita ${majorRoads[0]} (${Math.round(routeDistance/1000)}km) - barabara wazi, hakuna msongamano. Utafika kwa wakati.`;
      } else {
        recommendation = `Njia nzuri sana! Barabara za mitaani (${Math.round(routeDistance/1000)}km) - hakuna msongamano mkubwa. Muda wa safari ${Math.round(routeDuration/60)} dakika.`;
      }
    } else if (trafficAnalysis.level === 'moderate') {
      if (majorRoads.length > 0) {
        recommendation = `Pita ${majorRoads[0]} (${Math.round(routeDistance/1000)}km) - msongamano wa kati. Ongeza dakika 5-10 kwenye safari yako.`;
      } else {
        recommendation = `Msongamano wa kati kwenye barabara za mitaani (${Math.round(routeDistance/1000)}km). Subiri dakika 5-10 zaidi kuliko kawaida.`;
      }
    } else {
      if (majorRoads.length > 0) {
        recommendation = `⚠️ Msongamano mkubwa kwenye ${majorRoads[0]} (${Math.round(routeDistance/1000)}km)! Fikiria njia nyingine au subiri hadi msongamano upungue.`;
      } else {
        recommendation = `🚨 Msongamano mkubwa kwenye barabara za mitaani (${Math.round(routeDistance/1000)}km)! Subiri au chagua njia nyingine.`;
      }
    }

    return { recommendation, majorRoads };
  }

  private extractMajorRoads(steps: any[]): string[] {
    const roadNames: string[] = [];
    
    steps.forEach(step => {
      const name = step.name;
      if (name && name !== '' && !name.includes('unnamed')) {
        // Keep original road names and add Swahili context
        let translatedName = name;
        
        // Add context for major roads in Tanzania
        if (name.toLowerCase().includes('nyerere')) {
          translatedName = `Barabara ya Nyerere (${name})`;
        } else if (name.toLowerCase().includes('uhuru')) {
          translatedName = `Mtaa wa Uhuru (${name})`;
        } else if (name.toLowerCase().includes('kariakoo')) {
          translatedName = `Eneo la Kariakoo (${name})`;
        } else if (name.toLowerCase().includes('road')) {
          translatedName = `${name.replace(/road/gi, 'Barabara')}`;
        }
        if (name.toLowerCase().includes('street')) {
          translatedName = `${name.replace(/street/gi, 'Mtaa')}`;
        }
        if (name.toLowerCase().includes('avenue')) {
          translatedName = `${name.replace(/avenue/gi, 'Njia')}`;
        }
        
        roadNames.push(translatedName);
      }
    });
    
    // Remove duplicates and return first 3 major roads
    return [...new Set(roadNames)].slice(0, 3);
  }

  private transformStepsWithRoadNames(steps: any[]): any[] {
    return steps.map(step => ({
      instruction: this.translateToSwahili(step.maneuver?.instruction || 'Endelea'),
      distance: formatDistance(step.distance),
      duration: formatDuration(step.duration),
      roadName: step.name || '',
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

  private generateRouteSummary(trafficAnalysis: any, index: number): string {
    const routeNames = [
      'Njia ya Haraka',
      'Njia Mbadala',
      'Njia ya Tatu'
    ];

    const trafficLabels = {
      'light': 'Hakuna Foleni',
      'moderate': 'Foleni Kidogo',
      'heavy': 'Foleni Nyingi'
    };

    return `${routeNames[index] || `Njia ${index + 1}`} - ${trafficLabels[trafficAnalysis.level]}`;
  }

  private sortRoutesByTrafficLevel(routes: Route[]): Route[] {
    return routes.sort((a, b) => {
      // Priority: light traffic first, then moderate, then heavy
      const trafficPriority = { light: 0, moderate: 1, heavy: 2 };
      const aTrafficScore = trafficPriority[a.trafficLevel];
      const bTrafficScore = trafficPriority[b.trafficLevel];
      
      if (aTrafficScore !== bTrafficScore) {
        return aTrafficScore - bTrafficScore;
      }
      
      // If same traffic level, sort by smart score
      const aScore = (a as any).smartScore || 0;
      const bScore = (b as any).smartScore || 0;
      
      if (aScore !== bScore) {
        return bScore - aScore; // Higher score first
      }
      
      // Finally, sort by duration
      return parseInt(a.durationInTraffic) - parseInt(b.durationInTraffic);
    });
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