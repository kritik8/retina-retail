import React, { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { useDevicesData } from './useDevicesData';
import { AddDeviceModal } from './components/AddDeviceModal';
import { DeviceDetailDrawer } from './components/DeviceDetailDrawer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Camera,
  Plus,
  Wifi,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { Device } from '@/types';

export const DevicesPage: React.FC = () => {
  const { shop } = useAuth();
  const { devices, isLoading, addDevice, updateDeviceStatus, deleteDevice } = useDevicesData(shop?.id);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'offline' | 'pending'>('all');

  const filteredDevices = devices.filter((d) => {
    if (activeTab === 'all') return true;
    return d.status === activeTab;
  });

  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const pendingCount = devices.filter((d) => d.status === 'pending').length;
  const offlineCount = devices.filter((d) => d.status === 'offline').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Edge Hardware & Cameras
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3 h-3" /> SNPE / QNN Mesh
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage vision sensor nodes, pairing codes, and live camera telemetry for{' '}
            <span className="text-indigo-400 font-semibold">{shop?.shop_name}</span>.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          className="gap-2 bg-indigo-600 hover:bg-indigo-500"
        >
          <Plus className="w-4 h-4" />
          <span>Add Camera</span>
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Nodes</span>
            <h3 className="text-2xl font-bold text-white mt-0.5">{devices.length}</h3>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Camera className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Online & Active</span>
            <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">{onlineCount}</h3>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Pairing</span>
            <h3 className="text-2xl font-bold text-amber-400 mt-0.5">{pendingCount}</h3>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Offline Nodes</span>
            <h3 className="text-2xl font-bold text-rose-400 mt-0.5">{offlineCount}</h3>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['all', 'online', 'pending', 'offline'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab} {tab === 'all' ? `(${devices.length})` : tab === 'online' ? `(${onlineCount})` : tab === 'pending' ? `(${pendingCount})` : `(${offlineCount})`}
          </button>
        ))}
      </div>

      {/* Device Cards Grid */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/50 space-y-3">
          <Camera className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No hardware devices found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "+ Add Camera" above to pair your first SNPE vision node with this store location.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} variant="primary" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Pair Camera Now</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => {
            const isOnline = device.status === 'online';
            const isPending = device.status === 'pending';

            return (
              <Card
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-sm"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Row: Name & Status Pulse */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                        {device.device_name}
                      </h4>
                      <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{device.device_type} • Code: {device.pairing_code}</span>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border flex items-center gap-1.5 shrink-0 ${
                        isOnline
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : isPending
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOnline
                            ? 'bg-emerald-500 animate-pulse'
                            : isPending
                            ? 'bg-amber-500 animate-ping'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span>{device.status}</span>
                    </span>
                  </div>

                  {/* Card Footer: Signal Strength & Last Heartbeat */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Wifi className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span>{isOnline ? '4/4 Signal' : 'No Signal'}</span>
                    </div>

                    <span>Heartbeat: {device.last_heartbeat || 'Pending'}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDevice={addDevice}
        onUpdateStatus={updateDeviceStatus}
      />

      {/* Device Detail Drawer */}
      <DeviceDetailDrawer
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
        onDeleteDevice={deleteDevice}
      />
    </div>
  );
};
