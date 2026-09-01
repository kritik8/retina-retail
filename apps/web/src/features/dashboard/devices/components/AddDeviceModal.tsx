import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Camera,
  QrCode,
  CheckCircle2,
  X,
  Zap,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import type { Device } from '@/types';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDevice: (device: Omit<Device, 'id' | 'created_at'>) => Promise<Device>;
  onUpdateStatus: (params: { deviceId: string; status: 'online' | 'offline' | 'pending' }) => Promise<void>;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  onAddDevice,
  onUpdateStatus,
}) => {
  const [deviceName, setDeviceName] = useState('New Edge Vision Camera');
  const [pairingCode, setPairingCode] = useState('');
  const [createdDevice, setCreatedDevice] = useState<Device | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSimulatingPairing, setIsSimulatingPairing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const code = 'RET-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      setPairingCode(code);
      setDeviceName(`Edge Vision Camera #${Math.floor(10 + Math.random() * 90)}`);
      setCreatedDevice(null);
      setIsSuccess(false);
      setIsSimulatingPairing(false);
    }
  }, [isOpen]);

  const handleInitiatePairing = async () => {
    if (!deviceName.trim()) return;
    setIsCreating(true);
    try {
      const dev = await onAddDevice({
        shop_id: '',
        device_name: deviceName,
        device_type: 'camera',
        pairing_code: pairingCode,
        status: 'pending',
        last_heartbeat: null,
      });
      setCreatedDevice(dev);
    } catch (err) {
      console.error('Failed to create device pairing request:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSimulateConnection = async () => {
    if (!createdDevice) return;
    setIsSimulatingPairing(true);

    setTimeout(async () => {
      await onUpdateStatus({ deviceId: createdDevice.id, status: 'online' });
      setIsSimulatingPairing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1800);
  };

  const copyPairingCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const pairingUrl = `https://retinaretail.qd.je/pair?code=${pairingCode}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        />

        {/* Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md rounded-[10px] shadow-2xl overflow-hidden z-10 relative"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md" style={{ background: 'var(--bg-subtle)', color: 'var(--fg)' }}>
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold" style={{ color: 'var(--fg)' }}>Pair Edge Camera</h3>
                <p className="font-sans text-[11px]" style={{ color: 'var(--fg-muted)' }}>Connect vision node to your store</p>
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

          {/* Body */}
          <div className="p-5 space-y-5">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-3"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: 'var(--status-ok-bg)', color: 'var(--status-ok)', border: '1px solid var(--status-ok-border)' }}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-serif text-lg font-bold" style={{ color: 'var(--fg)' }}>Hardware Connected!</h3>
                  <p className="font-sans text-xs" style={{ color: 'var(--status-ok)' }}>
                    Edge node is online & streaming vision telemetry.
                  </p>
                </div>
              </motion.div>
            ) : !createdDevice ? (
              <div className="space-y-4">
                <Input
                  label="Device Name / Location"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g. Aisle 4 Camera"
                />

                <div
                  className="p-4 rounded-lg space-y-1.5"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block" style={{ color: 'var(--fg-subtle)' }}>
                    Generated Pairing Code
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl font-bold tracking-wider" style={{ color: 'var(--fg)' }}>
                      {pairingCode}
                    </span>
                    <button
                      type="button"
                      onClick={copyPairingCode}
                      className="flex items-center gap-1 font-mono text-[11px]"
                      style={{ color: 'var(--fg-muted)' }}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--status-ok)' }} /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleInitiatePairing}
                  isLoading={isCreating}
                  variant="primary"
                  size="sm"
                  className="w-full py-2.5 gap-2"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Generate QR Code</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-5 text-center">
                {/* QR Code */}
                <div
                  className="inline-block p-3 rounded-xl shadow-sm"
                  style={{ background: '#FFFFFF', border: '1px solid var(--border-strong)' }}
                >
                  <QRCodeSVG value={pairingUrl} size={140} level="H" />
                </div>

                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block" style={{ color: 'var(--fg-subtle)' }}>
                    Scan or enter code:
                  </span>
                  <div className="font-serif text-xl font-bold tracking-wider" style={{ color: 'var(--fg)' }}>
                    {createdDevice.pairing_code}
                  </div>
                  <p className="font-sans text-[11px] max-w-xs mx-auto pt-0.5" style={{ color: 'var(--fg-muted)' }}>
                    Enter this code on your RetinaRetail edge hardware screen to pair.
                  </p>
                </div>

                {/* Status indicator */}
                <div
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-mono text-[11px]"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
                >
                  <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--accent)' }} />
                  <span>Status: <strong style={{ color: 'var(--status-warn)' }}>{createdDevice.status}</strong></span>
                </div>

                {/* Dev Simulation Button */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <Button
                    onClick={handleSimulateConnection}
                    isLoading={isSimulatingPairing}
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Simulate Edge Connection (Dev Demo)</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
