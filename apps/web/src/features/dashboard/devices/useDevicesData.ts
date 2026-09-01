import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfiguredSupabase } from '@/lib/supabase';
import type { Device, DeviceStatus } from '@/types';

const INITIAL_MOCK_DEVICES: Device[] = [
  {
    id: 'dev-01',
    shop_id: 'shop-demo',
    device_name: 'Main Entrance Optics #1',
    device_type: 'camera',
    pairing_code: 'RET-89A1',
    status: 'online',
    last_heartbeat: '2 min ago',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'dev-02',
    shop_id: 'shop-demo',
    device_name: 'Aisle A3 Rice & Grains Vision',
    device_type: 'camera',
    pairing_code: 'RET-89A2',
    status: 'online',
    last_heartbeat: 'Just now',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'dev-03',
    shop_id: 'shop-demo',
    device_name: 'Checkout POS Queue Sensor',
    device_type: 'camera',
    pairing_code: 'RET-89A3',
    status: 'online',
    last_heartbeat: '1 min ago',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'dev-04',
    shop_id: 'shop-demo',
    device_name: 'Backroom Inventory Gateway',
    device_type: 'camera',
    pairing_code: 'RET-89A4',
    status: 'online',
    last_heartbeat: '4 min ago',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'dev-05',
    shop_id: 'shop-demo',
    device_name: 'Side Exit Pedestrian Sensor',
    device_type: 'sensor',
    pairing_code: 'RET-89A5',
    status: 'offline',
    last_heartbeat: '14 min ago',
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
        const stored = localStorage.getItem(`retina_devices_${shopId}`);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(`retina_devices_${shopId}`, JSON.stringify(INITIAL_MOCK_DEVICES));
        return INITIAL_MOCK_DEVICES;
      }
    },
    refetchInterval: 3000, // Poll every 3 seconds for real-time status changes
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
