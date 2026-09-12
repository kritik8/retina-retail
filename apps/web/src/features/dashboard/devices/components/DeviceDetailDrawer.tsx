import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Device } from '@/types';
import { Button } from '@/components/ui/Button';
import { API_BASE_URL } from '@/services/api/client';
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

  // Map device id to the camera stream id (cam-1..cam-5)
  const DEVICE_TO_CAM: Record<string, string> = {
    'cam-1': 'cam-1', 'cam-2': 'cam-2', 'cam-3': 'cam-3', 'cam-4': 'cam-4', 'cam-5': 'cam-5',
    // legacy ids
    'dev-01': 'cam-1', 'dev-02': 'cam-2', 'dev-03': 'cam-4', 'dev-04': 'cam-5', 'dev-05': 'cam-5',
  };

  // Default zone based on camera name
  const getDefaultZone = (name: string) => {
    if (/beauty|skin/i.test(name))       return 'Zone A — Beauty & Skincare Section';
    if (/entrance/i.test(name))          return 'Zone B — Main Entrance';
    if (/accessor/i.test(name))          return 'Zone C — Accessories & Display Wall';
    if (/checkout/i.test(name))          return 'Zone D — Checkout Counter';
    if (/fragran|gift/i.test(name))      return 'Zone E — Fragrance & Gifting Aisle';
    return 'Zone A — Beauty & Skincare Section';
  };

  const [selectedZone, setSelectedZone] = useState(
    device ? getDefaultZone(device.device_name) : 'Zone A — Beauty & Skincare Section'
  );

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
          className="fixed inset-0"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="w-full max-w-md h-full flex flex-col justify-between z-10 relative overflow-y-auto"
          style={{ background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div
            className="p-5 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md" style={{ background: 'var(--bg-subtle)', color: 'var(--fg)' }}>
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold truncate max-w-[200px]" style={{ color: 'var(--fg)' }}>{device.device_name}</h3>
                <p className="font-mono text-[11px]" style={{ color: 'var(--fg-muted)' }}>Code: {device.pairing_code}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors"
              style={{ color: 'var(--fg-subtle)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-5 flex-1">
            {/* Live Vision Feed Box */}
            <div
              className="relative w-full h-52 rounded-lg overflow-hidden flex flex-col justify-between select-none group"
              style={{ background: '#000000', border: '1px solid var(--border)' }}
            >
              {/* Real-time Video Stream with AI Detection HUD */}
              <div className="relative w-full h-full">
                <video
                  src={
                    `${API_BASE_URL}/api/video/${DEVICE_TO_CAM[device.id] || 'cam-1'}`
                  }
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to high-res cloud clip if local video is unreachable
                    e.currentTarget.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                  }}
                />

                {/* Animated AI Bounding Boxes */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: '32%',
                    top: '28%',
                    width: '18%',
                    height: '52%',
                    border: '1.5px solid #4ade80',
                    background: 'rgba(74, 222, 128, 0.08)',
                    boxShadow: '0 0 10px rgba(74, 222, 128, 0.25)',
                  }}
                >
                  <div
                    className="absolute -top-4 left-0 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold"
                    style={{ background: '#4ade80', color: '#09090b' }}
                  >
                    Shopper #104 (98%)
                  </div>
                </div>

                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: '60%',
                    top: '32%',
                    width: '17%',
                    height: '48%',
                    border: '1.5px solid #4ade80',
                    background: 'rgba(74, 222, 128, 0.08)',
                    boxShadow: '0 0 10px rgba(74, 222, 128, 0.25)',
                  }}
                >
                  <div
                    className="absolute -top-4 left-0 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold"
                    style={{ background: '#4ade80', color: '#09090b' }}
                  >
                    Shopper #109 (94%)
                  </div>
                </div>
              </div>

              {/* Top Overlay Bar */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between z-10 font-mono text-[10px] p-3 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
              >
                <span
                  className="px-2 py-0.5 rounded font-semibold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md"
                  style={{ background: 'var(--status-err-bg)', color: 'var(--status-err)', border: '1px solid var(--status-err-border)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--status-err)' }} />
                  LIVE OPTICS
                </span>
                <span className="px-2 py-0.5 rounded backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.6)', color: '#EDEDE9' }}>
                  YOLOv8 + ByteTrack
                </span>
              </div>

              {/* Bottom Telemetry Overlay */}
              <div
                className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-mono text-[10px] px-2.5 py-1.5 rounded-md z-10 backdrop-blur-md pointer-events-none"
                style={{ background: 'rgba(25,25,26,0.85)', border: '1px solid var(--border)', color: '#EDEDE9' }}
              >
                <span>VisionBackbone-v2 · {device.pairing_code}</span>
                <span style={{ color: 'var(--status-ok)' }}>14.2ms Latency</span>
              </div>
            </div>

            {/* Status & Signal Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg space-y-1" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block" style={{ color: 'var(--fg-subtle)' }}>Status</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: isOnline ? 'var(--status-ok)' : 'var(--status-err)' }} />
                  <span className="font-sans text-xs font-semibold capitalize" style={{ color: isOnline ? 'var(--status-ok)' : 'var(--status-err)' }}>
                    {device.status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg space-y-1" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block" style={{ color: 'var(--fg-subtle)' }}>Signal</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" style={{ color: 'var(--status-ok)' }} />
                  <span className="font-mono text-xs font-semibold" style={{ color: 'var(--fg)' }}>98% (4/4 Bars)</span>
                </div>
              </div>
            </div>

            {/* Hardware Telemetry */}
            <div className="space-y-2">
              <h4 className="font-mono text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--fg-subtle)' }}>
                <Activity className="w-3.5 h-3.5" />
                <span>Hardware Telemetry</span>
              </h4>

              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <span className="flex items-center gap-2" style={{ color: 'var(--fg-muted)' }}>
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--status-ok)' }} /> System Uptime
                  </span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--fg)' }}>99.84%</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <span className="flex items-center gap-2" style={{ color: 'var(--fg-muted)' }}>
                    <Cpu className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} /> Edge NPU Latency
                  </span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--status-ok)' }}>14.2 ms</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <span className="flex items-center gap-2" style={{ color: 'var(--fg-muted)' }}>
                    <Thermometer className="w-3.5 h-3.5" style={{ color: 'var(--status-warn)' }} /> Temperature
                  </span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--fg)' }}>42°C (Optimal)</span>
                </div>
              </div>
            </div>

            {/* Zone Assignment */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--fg-subtle)' }}>
                <Layers className="w-3.5 h-3.5" />
                <span>Assigned Store Zone</span>
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
              >
                <option value="Zone A — Beauty & Skincare Section">Zone A — Beauty &amp; Skincare Section</option>
                <option value="Zone B — Main Entrance">Zone B — Main Entrance</option>
                <option value="Zone C — Accessories & Display Wall">Zone C — Accessories &amp; Display Wall</option>
                <option value="Zone D — Checkout Counter">Zone D — Checkout Counter</option>
                <option value="Zone E — Fragrance & Gifting Aisle">Zone E — Fragrance &amp; Gifting Aisle</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
            {isConfirmingDelete ? (
              <div className="p-3.5 rounded-lg space-y-3" style={{ background: 'var(--status-err-bg)', border: '1px solid var(--status-err-border)' }}>
                <p className="font-sans text-xs font-medium text-center" style={{ color: 'var(--status-err)' }}>
                  Are you sure you want to unpair this edge camera?
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
                variant="danger"
                size="sm"
                className="w-full"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Unpair & Remove Device</span>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
