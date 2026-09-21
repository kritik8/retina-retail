import React, { createContext } from 'react';
import type { UserSession, Shop } from '@/types';

export interface AuthContextType extends UserSession {
  loginWithGoogle: () => Promise<void>;
  demoLogin: () => void;
  logout: () => Promise<void>;
  refreshShop: () => Promise<Shop | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Permanent demo identity injected at boot — no login required ──────────────
const DEMO_USER: UserSession['user'] = {
  id: 'demo-user-sih-2024',
  email: 'owner@thefaceshop.in',
  user_metadata: {
    full_name: 'Store Manager',
    name: 'Store Manager',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
};

const DEMO_SHOP: Shop = {
  id: 'shop-demo-001',
  owner_id: 'demo-user-sih-2024',
  shop_name: 'The Face Shop — Sector 18',
  business_type: 'supermarket',
  address: 'Sector 18 Market',
  city: 'Noida',
  state: 'Uttar Pradesh',
  pincode: '201301',
  number_of_counters: 4,
  expected_cameras: 5,
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always authenticated — demo mode for SIH judges
  const noop = async () => {};

  return (
    <AuthContext.Provider
      value={{
        user: DEMO_USER,
        profile: null,
        shop: DEMO_SHOP,
        isLoading: false,
        loginWithGoogle: noop,
        demoLogin: () => {},
        logout: noop,
        refreshShop: async () => DEMO_SHOP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
