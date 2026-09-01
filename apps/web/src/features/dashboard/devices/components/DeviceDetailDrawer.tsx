import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Device } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Camera,
  X,
  Trash2,
  Activity,
  Cpu,
  Thermometer,
  Wifi,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface DeviceDetailDrawerProps {
  device: Device | null;
  onClose: () => void;
  onDeleteDevice: (id: string) => Promise<void>;
}

export const DeviceDetailDrawer: React.FC<DeviceDetailDrawerProps> = ({
  device,
  onClose,
  onDeleteDevice,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedZone, setSelectedZone] = useState('Main Entrance & Pedestrian Portal');

  if (!device) return null;

  const isOnline = device.status === 'online';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteDevice(device.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete device:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between z-10 relative overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white truncate max-w-[200px]">{device.device_name}</h3>
                <p className="text-xs text-slate-400 font-mono">Code: {device.pairing_code}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 flex-1">
            {/* Mock Live Vision Feed Thumbnail Box */}
            <div className="relative w-full h-48 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex flex-col justify-between p-3 select-none">
              {/* Top Overlay Bar */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    LIVE OPTICS
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">1080p @ 30 FPS</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-400">
                  SNPE / ByteTrack
                </span>
              </div>

              {/* Bounding Box Mock Overlay Targets */}
              <div className="relative inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-28 h-20 border-2 border-dashed border-emerald-400/70 rounded-lg relative flex items-start p-1 bg-emerald-500/5">
                  <span className="text-[9px] font-mono bg-emerald-500 text-slate-950 font-bold px-1 rounded">
                    Shopper #104 (98%)
                  </span>
                </div>
              </div>

              {/* Bottom Telemetry Overlay */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 z-10 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800">
                <span>Model: VisionBackbone-v2</span>
                <span className="text-emerald-400">14.2ms Latency</span>
              </div>
            </div>

            {/* Status & Signal Indicator Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Status</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className={`text-sm font-bold capitalize ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {device.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Signal Strength</span>
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">98% (4/4 Bars)</span>
                </div>
              </div>
            </div>

            {/* Detailed Hardware Stats */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Hardware Telemetry</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> System Uptime
                  </span>
                  <span className="font-mono font-semibold text-white">99.84%</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Edge NPU Latency
                  </span>
                  <span className="font-mono font-semibold text-emerald-400">14.2 ms</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Core Temperature
                  </span>
                  <span className="font-mono font-semibold text-white">42°C (Optimal)</span>
                </div>
              </div>
            </div>

            {/* Zone Assignment Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Assigned Store Zone</span>
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="Main Entrance & Pedestrian Portal">Main Entrance & Pedestrian Portal</option>
                <option value="Aisle 1: Rice, Grains & Staples">Aisle 1: Rice, Grains & Staples</option>
                <option value="Aisle 2: Snacks & Beverages">Aisle 2: Snacks & Beverages</option>
                <option value="POS Express & Main Checkout Zone">POS Express & Main Checkout Zone</option>
              </select>
            </div>
          </div>

          {/* Footer Actions / Delete Confirmation */}
          <div className="p-6 border-t border-slate-800/80 bg-slate-950/50 space-y-3">
            {isConfirmingDelete ? (
              <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-3">
                <p className="text-xs text-rose-300 font-medium text-center">
                  Are you sure you want to unpair and remove this edge camera?
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsConfirmingDelete(false)}
                    variant="outline"
                    size="sm"
                    className="w-1/2 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    variant="danger"
                    size="sm"
                    className="w-1/2 text-xs"
                  >
                    Confirm Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsConfirmingDelete(true)}
                variant="outline"
                className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Unpair & Remove Device</span>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
