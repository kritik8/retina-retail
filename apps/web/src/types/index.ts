export type BusinessType = 'kirana' | 'supermarket' | 'pharmacy' | 'other';
export type DeviceType = 'camera' | 'sensor';
export type DeviceStatus = 'pending' | 'online' | 'offline';
export type ZoneCategory = 'entrance' | 'aisle' | 'checkout' | 'storage' | 'other';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  shop_name: string;
  business_type: BusinessType;
  address: string;
  city: string;
  state: string;
  pincode: string;
  number_of_counters: number;
  expected_cameras: number;
  created_at: string;
}

export interface Device {
  id: string;
  shop_id: string;
  device_name: string;
  device_type: DeviceType;
  pairing_code: string;
  status: DeviceStatus;
  last_heartbeat: string | null;
  created_at: string;
}

export interface StoreZone {
  id: string;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  cameraId: string | null;
  category: ZoneCategory;
  density?: number; // 0-100 live value
  shopperCount?: number;
}

export interface StoreLayoutConfig {
  zones: StoreZone[];
  gridColumns?: number;
  gridRows?: number;
}

export interface StoreLayout {
  id?: string;
  shop_id: string;
  layout_json: StoreLayoutConfig;
  updated_at?: string;
}

export interface ShopperParticle {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  zoneId: string;
}

export interface UserSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
    };
  } | null;
  profile: Profile | null;
  shop: Shop | null;
  isLoading: boolean;
}

export type CongestionRiskLevel = 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface StoreState {
  occupancy: number;
  queueLength: number;
  incomingRate: number;
  outgoingRate: number;
  serviceRate: number;
  density: number;
  congestionRisk: CongestionRiskLevel;
}

export interface PredictionDriver {
  label: string;
  changePercent?: number;
  changeAbsolute?: number;
}

export interface Prediction {
  horizonMinutes: number;
  predictedQueue: number;
  risk: CongestionRiskLevel;
  timeToThreshold: number;
  reliability: 'High' | 'Moderate' | 'Low';
  drivers: PredictionDriver[];
  historicalSeries: { t: string; value: number }[];
  forecastSeries: { t: string; value: number; upperBand: number; lowerBand: number }[];
}

export interface BottleneckDiagnosis {
  primaryBottleneck: 'checkout' | 'entrance' | 'aisle' | 'zone' | 'flow_imbalance';
  bottleneckZoneId?: string;
  bottleneckZoneName?: string;
  severity: CongestionRiskLevel;
  arrivalRate: number;
  serviceRate: number;
  imbalance: number;
  contributingFactors: { label: string; score: number; detail: string }[];
  timeline: { time: string; status: string; description: string; risk: CongestionRiskLevel }[];
  recommendation: string;
}

export interface SimulationRequest {
  interventionType: 'add_checkout' | 'increase_staffing' | 'redirect_checkout' | 'redirect_traffic';
  additionalCounters?: 1 | 2 | 3;
}

export interface SimulationTimeSeriesPoint {
  t: number; // minutes from now (0, 2, 5, 7, 10, 15, etc.)
  value: number; // queue length
}

export interface SimulationResult {
  baseline: {
    peakQueue: number;
    timeSeries: SimulationTimeSeriesPoint[];
  };
  simulation: {
    peakQueue: number;
    timeSeries: SimulationTimeSeriesPoint[];
  };
  queueReductionPercent: number;
  thresholdAvoided: boolean;
  timeToThreshold?: number;
  additionalCounters?: number;
  baseCapacity: number;
  simulatedCapacity: number;
}

export interface Recommendation {
  action: string;
  rationale: string;
  interventionType: SimulationRequest['interventionType'];
  suggestedCounters?: 1 | 2 | 3;
}

export interface InterventionLogEntry {
  id: string;
  timestamp: string;
  action: string;
  rationale: string;
  interventionType: string;
  details?: Record<string, any>;
  status: 'logged';
}

