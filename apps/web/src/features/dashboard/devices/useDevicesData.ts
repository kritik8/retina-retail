import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfiguredSupabase } from '@/lib/supabase';
import type { Device, DeviceStatus } from '@/types';

// Bump this version whenever device names change — forces localStorage cache refresh
const DEVICES_CACHE_VERSION = 'v2';

const INITIAL_MOCK_DEVICES: Device[] = [
  {
    id: 'cam-1',
    shop_id: 'shop-demo',
    device_name: 'Beauty & Skincare Section',
    device_type: 'camera',
    pairing_code: 'RET-A001',
    status: 'online',
    last_heartbeat: '2s ago',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'cam-2',
    shop_id: 'shop-demo',
    device_name: 'Main Entrance',
    device_type: 'camera',
    pairing_code: 'RET-A002',
    status: 'online',
    last_heartbeat: 'Just now',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'cam-3',
    shop_id: 'shop-demo',
    device_name: 'Accessories & Display Wall',
    device_type: 'camera',
    pairing_code: 'RET-A003',
    status: 'online',
    last_heartbeat: '1s ago',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'cam-4',
    shop_id: 'shop-demo',
    device_name: 'Checkout Counter',
    device_type: 'camera',
    pairing_code: 'RET-A004',
    status: 'online',
    last_heartbeat: '5s ago',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cam-5',
    shop_id: 'shop-demo',
    device_name: 'Fragrance & Gifting Aisle',
    device_type: 'camera',
    pairing_code: 'RET-A005',
    status: 'online',
    last_heartbeat: '3s ago',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export function useDevicesData(shopId?: string) {
  const queryClient = useQueryClient();

  const devicesQuery = useQuery<Device[]>({
    queryKey: ['devices', shopId],
    queryFn: async () => {
      if (!shopId) return [];

      if (isConfiguredSupabase) {
        const { data, error } = await supabase
          .from('devices')
          .select('*')
          .eq('shop_id', shopId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching devices:', error);
          throw error;
        }
        return data || [];
      } else {
        // Clear stale localStorage cache if version doesn't match
        const cacheKey = `retina_devices_${shopId}`;
        const versionKey = `retina_devices_version_${shopId}`;
        const storedVersion = localStorage.getItem(versionKey);
        if (storedVersion !== DEVICES_CACHE_VERSION) {
          localStorage.removeItem(cacheKey);
          localStorage.setItem(versionKey, DEVICES_CACHE_VERSION);
        }
        const stored = localStorage.getItem(cacheKey);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(cacheKey, JSON.stringify(INITIAL_MOCK_DEVICES));
        return INITIAL_MOCK_DEVICES;
      }
    },
    refetchInterval: 3000,
    enabled: Boolean(shopId),
  });

  // Helper to persist local devices array when Supabase is not configured
  const saveLocalDevices = (newDevices: Device[]) => {
    if (shopId) {
      localStorage.setItem(`retina_devices_${shopId}`, JSON.stringify(newDevices));
    }
    queryClient.setQueryData(['devices', shopId], newDevices);
  };

  // Add Device Mutation
  const addDeviceMutation = useMutation({
    mutationFn: async (newDevice: Omit<Device, 'id' | 'created_at'>) => {
      if (isConfiguredSupabase && shopId) {
        const { data, error } = await supabase
          .from('devices')
          .insert([{ ...newDevice, shop_id: shopId }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const mockNew: Device = {
          ...newDevice,
          id: `dev-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        const current = devicesQuery.data || INITIAL_MOCK_DEVICES;
        const updated = [mockNew, ...current];
        saveLocalDevices(updated);
        return mockNew;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices', shopId] });
    },
  });

  // Update Status Mutation (e.g. simulate device connecting)
  const updateDeviceStatusMutation = useMutation({
    mutationFn: async ({ deviceId, status }: { deviceId: string; status: DeviceStatus }) => {
      if (isConfiguredSupabase) {
        const { error } = await supabase
          .from('devices')
          .update({ status, last_heartbeat: new Date().toISOString() })
          .eq('id', deviceId);

        if (error) throw error;
      } else {
        const current = devicesQuery.data || [];
        const updated = current.map((d) =>
          d.id === deviceId ? { ...d, status, last_heartbeat: 'Just now' } : d
        );
        saveLocalDevices(updated);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices', shopId] });
    },
  });

  // Delete Device Mutation
  const deleteDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      if (isConfiguredSupabase) {
        const { error } = await supabase.from('devices').delete().eq('id', deviceId);
        if (error) throw error;
      } else {
        const current = devicesQuery.data || [];
        const updated = current.filter((d) => d.id !== deviceId);
        saveLocalDevices(updated);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices', shopId] });
    },
  });

  return {
    devices: devicesQuery.data || [],
    isLoading: devicesQuery.isLoading,
    addDevice: addDeviceMutation.mutateAsync,
    updateDeviceStatus: updateDeviceStatusMutation.mutateAsync,
    deleteDevice: deleteDeviceMutation.mutateAsync,
  };
}
