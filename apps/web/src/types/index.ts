export type BusinessType = 'kirana' | 'supermarket' | 'pharmacy' | 'other';
export type DeviceType = 'camera' | 'sensor';
export type DeviceStatus = 'pending' | 'online' | 'offline';

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
