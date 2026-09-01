import type { StoreLayoutConfig } from '@/types';

export const defaultKiranaLayout: StoreLayoutConfig = {
  zones: [
    {
      id: 'zone-entrance',
      name: 'Main Entrance & Pedestrian Portal',
      x: 35,
      y: 78,
      width: 30,
      height: 18,
      cameraId: 'cam-01',
      category: 'entrance',
      density: 45,
      shopperCount: 8,
    },
    {
      id: 'zone-aisle-1',
      name: 'Aisle 1: Rice, Grains & Staples',
      x: 8,
      y: 12,
      width: 38,
      height: 28,
      cameraId: 'cam-02',
      category: 'aisle',
      density: 85,
      shopperCount: 14,
    },
    {
      id: 'zone-aisle-2',
      name: 'Aisle 2: Snacks & Beverages',
      x: 54,
      y: 12,
      width: 38,
      height: 28,
      cameraId: 'cam-04',
      category: 'aisle',
      density: 60,
      shopperCount: 9,
    },
    {
      id: 'zone-checkout',
      name: 'POS Express & Main Checkout Zone',
      x: 8,
      y: 48,
      width: 42,
      height: 22,
      cameraId: 'cam-03',
      category: 'checkout',
      density: 92,
      shopperCount: 18,
    },
    {
      id: 'zone-dairy',
      name: 'Dairy & Cold Storage Section',
      x: 58,
      y: 48,
      width: 34,
      height: 22,
      cameraId: null,
      category: 'storage',
      density: 30,
      shopperCount: 4,
    },
  ],
};

export function getDefaultLayoutForShop(): StoreLayoutConfig {
  return defaultKiranaLayout;
}
