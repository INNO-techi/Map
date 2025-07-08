import { Route, Location, RouteRequest } from '../types/route';
import { calculateTrafficLevel, formatDuration, formatDistance } from '../utils/routeUtils';

export class MapboxRouteService {
  private accessToken: string;
  private baseUrl = 'https://api.mapbox.com';

  constructor() {
    this.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  }

  async getRoutes(request: RouteRequest): Promise<Route[]> {
    if (!this.accessToken || !request.origin || !request.destination) {
      return [];
    }

    try {
      const coordinates = `${request.origin.lng},${request.origin.lat};${request.destination.lng},${request.destination.lat}`;
      
      // Build query parameters
      const params = new URLSearchParams({
        access_token: this.accessToken,
        geometries: 'geojson',
        steps: 'true',
        annotations: 'duration,distance,speed',
        overview: 'full',
        alternatives: 'true',
        continue_straight: 'false'
      });

      // Add traffic optimization
      if (request.optimizeForTraffic) {
        params.append('annotations', 'duration,distance,speed,congestion');
      }

      // Add route preferences
      const exclude = [];
      if (request.avoidHighways) exclude.push('motorway');
      if (request.avoidTolls) exclude.push('toll');
      if (exclude.length > 0) {
        params.append('exclude', exclude.join(','));
      }

      const url = `${this.baseUrl}/directions/v5/mapbox/driving-traffic/${coordinates}?${params}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const routes = data.routes.map((route: any, index: number) => 
          this.transformRoute(route, index)
        );

        // Sort routes by traffic optimization if requested
        if (request.optimizeForTraffic) {
          routes.sort((a, b) => {
            const trafficPriority = { light: 0, moderate: 1, heavy: 2 };
            const aTrafficScore = trafficPriority[a.trafficLevel];
            const bTrafficScore = trafficPriority[b.trafficLevel];
            
            if (aTrafficScore !== bTrafficScore) {
              return aTrafficScore - bTrafficScore;
            }
            
            return parseInt(a.durationInTraffic) - parseInt(b.durationInTraffic);
          });
        }

        return routes;
      }
    } catch (error) {
      console.error('Error getting routes from Mapbox:', error);
    }

    return [];
  }

  private transformRoute(route: any, index: number): Route {
    const duration = route.duration;
    const distance = route.distance;
    
    // Estimate traffic impact based on congestion data
    const congestionData = route.legs?.[0]?.annotation?.congestion || [];
    const trafficMultiplier = this.calculateTrafficMultiplier(congestionData);
    const durationInTraffic = Math.round(duration * trafficMultiplier);

    return {
      id: `route-${index}`,
      summary: this.generateRouteSummary(route, index),
      distance: formatDistance(distance),
      duration: formatDuration(duration),
      durationInTraffic: formatDuration(durationInTraffic),
      trafficLevel: calculateTrafficLevel(duration, durationInTraffic),
      steps: route.legs?.[0]?.steps?.map((step: any) => ({
        instruction: step.maneuver?.instruction || 'Continue',
        distance: formatDistance(step.distance),
        duration: formatDuration(step.duration),
        polyline: JSON.stringify(step.geometry)
      })) || [],
      polyline: JSON.stringify(route.geometry),
      bounds: this.calculateBounds(route.geometry)
    };
  }

  private calculateTrafficMultiplier(congestionData: string[]): number {
    if (!congestionData.length) return 1.0;
    
    const congestionCounts = congestionData.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = congestionData.length;
    const heavyRatio = (congestionCounts.severe || 0) / total;
    const moderateRatio = (congestionCounts.heavy || 0) / total;
    
    // Calculate traffic multiplier based on congestion levels
    return 1.0 + (heavyRatio * 0.5) + (moderateRatio * 0.3);
  }

  private generateRouteSummary(route: any, index: number): string {
    const legs = route.legs || [];
    if (legs.length > 0 && legs[0].summary) {
      return legs[0].summary;
    }
    return `Route ${index + 1}`;
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

  async geocodeAddress(address: string): Promise<Location | null> {
    if (!this.accessToken) return null;

    try {
      // Focus geocoding on Tanzania
      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.accessToken}&limit=1&country=TZ&proximity=39.2083,-6.7924`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        
        return {
          lat,
          lng,
          address: feature.place_name
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }

    return null;
  }

  async searchPlaces(query: string): Promise<any[]> {
    if (!this.accessToken || query.length < 3) return [];

    try {
      // Focus search on Tanzania with bias towards Dar es Salaam and Mbeya
      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.accessToken}&limit=8&types=place,locality,neighborhood,address,poi&country=TZ&proximity=39.2083,-6.7924`;
      const response = await fetch(url);
      const data = await response.json();

      return data.features || [];
    } catch (error) {
      console.error('Places search error:', error);
      return [];
    }
  }
}