import React, { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { useDevicesData } from './useDevicesData';
import { AddDeviceModal } from './components/AddDeviceModal';
import { DeviceDetailDrawer } from './components/DeviceDetailDrawer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Camera,
  Plus,
  Wifi,
  WifiOff,
  Activity,
  Layers,
} from 'lucide-react';
import type { Device } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  online:  'var(--status-ok)',
  pending: 'var(--status-warn)',
  offline: 'var(--status-err)',
};

const STATUS_BG: Record<string, string> = {
  online:  'var(--status-ok-bg)',
  pending: 'var(--status-warn-bg)',
  offline: 'var(--status-err-bg)',
};

const TABS = ['all', 'online', 'pending', 'offline'] as const;
type Tab = typeof TABS[number];

export const DevicesPage: React.FC = () => {
  const { shop } = useAuth();
  const { devices, isLoading, addDevice, updateDeviceStatus, deleteDevice } = useDevicesData(shop?.id);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const counts = {
    all:     devices.length,
    online:  devices.filter(d => d.status === 'online').length,
    pending: devices.filter(d => d.status === 'pending').length,
    offline: devices.filter(d => d.status === 'offline').length,
  };

  const filteredDevices = devices.filter(d =>
    activeTab === 'all' ? true : d.status === activeTab
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-0.5">
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--fg)' }}>
            Edge Devices
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--fg-muted)' }}>
            Vision sensor nodes for {shop?.shop_name}
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} variant="primary" size="sm">
          <Plus className="w-3.5 h-3.5" />
          Add Camera
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Nodes',     value: counts.all,     icon: Camera,   status: '' },
          { label: 'Online & Active', value: counts.online,  icon: Activity, status: 'online' },
          { label: 'Pending Pairing', value: counts.pending, icon: Wifi,     status: 'pending' },
          { label: 'Offline',         value: counts.offline, icon: WifiOff,  status: 'offline' },
        ].map(({ label, value, icon: Icon, status }) => (
          <div
            key={label}
            className="p-4 rounded-[10px] flex items-center justify-between"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                {label}
              </span>
              <div
                className="font-mono text-[22px] font-semibold mt-0.5"
                style={{ color: status ? STATUS_COLORS[status] : 'var(--fg)' }}
              >
                {value}
              </div>
            </div>
            <Icon className="w-4 h-4" style={{ color: 'var(--fg-subtle)', opacity: 0.4 }} />
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div
        className="flex items-center gap-1 pb-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-widest transition-colors duration-150"
            style={{
              background: activeTab === tab ? 'var(--accent-subtle)' : 'transparent',
              color: activeTab === tab ? 'var(--accent-fg)' : 'var(--fg-subtle)',
              border: `1px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
            }}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Device Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="p-5 rounded-[10px] space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-2.5 w-48" />
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-2.5 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDevices.length === 0 ? (
        <EmptyState
          type="no-devices"
          onAction={() => setIsAddModalOpen(true)}
          actionLabel="Pair Camera Now"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map(device => {
            const isOnline = device.status === 'online';
            const statusColor = STATUS_COLORS[device.status] || 'var(--fg-subtle)';
            const statusBg = STATUS_BG[device.status] || 'var(--bg-subtle)';

            return (
              <Card
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className="cursor-pointer group"
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Name + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4
                        className="text-[13px] font-semibold truncate transition-colors"
                        style={{ color: 'var(--fg)' }}
                      >
                        {device.device_name}
                      </h4>
                      <p className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--fg-subtle)' }}>
                        <Layers className="w-2.5 h-2.5 shrink-0" />
                        {device.device_type} · {device.pairing_code}
                      </p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1 shrink-0"
                      style={{
                        background: statusBg,
                        color: statusColor,
                        border: `1px solid ${statusColor}30`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: statusColor,
                          animation: isOnline ? 'pulse 2s infinite' : undefined,
                        }}
                      />
                      {device.status}
                    </span>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between font-mono text-[11px] pt-3"
                    style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-subtle)' }}
                  >
                    <div className="flex items-center gap-1">
                      {isOnline
                        ? <Wifi className="w-3 h-3" style={{ color: 'var(--status-ok)' }} />
                        : <WifiOff className="w-3 h-3" />
                      }
                      <span>{isOnline ? '4/4 bars' : 'No signal'}</span>
                    </div>
                    <span>{device.last_heartbeat || 'Awaiting'}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDevice={addDevice}
        onUpdateStatus={updateDeviceStatus}
      />

      <DeviceDetailDrawer
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
        onDeleteDevice={deleteDevice}
      />
    </div>
  );
};
