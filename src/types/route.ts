export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  polyline: string;
}

export interface Route {
  id: string;
  summary: string;
  distance: string;
  duration: string;
  durationInTraffic: string;
  trafficLevel: 'light' | 'moderate' | 'heavy';
  steps: RouteStep[];
  polyline: string;
  bounds: google.maps.LatLngBounds;
  smartScore?: number;
  recommendation?: string;
}

export interface RouteRequest {
  origin: Location | null;
  destination: Location | null;
  avoidHighways: boolean;
  avoidTolls: boolean;
  optimizeForTraffic: boolean;
}