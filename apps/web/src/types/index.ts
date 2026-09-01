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
