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

  // Generate unique 6-character pairing code when modal opens
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

    // Simulate 2.2s edge device handshake
    setTimeout(async () => {
      await onUpdateStatus({ deviceId: createdDevice.id, status: 'online' });
      setIsSimulatingPairing(false);
      setIsSuccess(true);

      // Auto close after 2s success celebration
      setTimeout(() => {
        onClose();
      }, 2200);
    }, 2000);
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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pair Edge Camera / Hardware</h3>
                <p className="text-xs text-slate-400">Connect a new SNPE/QNN camera node to your store</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {isSuccess ? (
              /* Success Celebration Animation */
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Hardware Connected!</h3>
                  <p className="text-sm text-emerald-400 font-medium">
                    Edge node is now online & streaming live vision telemetry.
                  </p>
                </div>
              </motion.div>
            ) : !createdDevice ? (
              /* Step 1: Set Device Name & Generate Code */
              <div className="space-y-5">
                <Input
                  label="Device Name / Location Identifier"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g. Aisle 4 Optics Camera"
                />

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Generated Pairing Code
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-extrabold text-indigo-400 tracking-wider">
                      {pairingCode}
                    </span>
                    <button
                      type="button"
                      onClick={copyPairingCode}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleInitiatePairing}
                  isLoading={isCreating}
                  variant="primary"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl gap-2 font-semibold"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Generate QR Pairing Code</span>
                </Button>
              </div>
            ) : (
              /* Step 2: Show QR Code + Pairing Listener + Dev Simulation */
              <div className="space-y-6 text-center">
                {/* QR Code Frame */}
                <div className="inline-block p-4 bg-white rounded-2xl shadow-xl border-4 border-indigo-500/30">
                  <QRCodeSVG value={pairingUrl} size={160} level="H" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Scan or enter on edge device:
                  </span>
                  <div className="text-2xl font-mono font-bold text-indigo-400 tracking-wider">
                    {createdDevice.pairing_code}
                  </div>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed pt-1">
                    Enter this code on your RetinaRetail edge hardware screen to pair it with this store.
                  </p>
                </div>

                {/* Waiting indicator */}
                <div className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>Waiting for edge device heartbeat... (Status: <strong className="text-amber-400 capitalize">{createdDevice.status}</strong>)</span>
                </div>

                {/* Dev-Only Simulated Connection Button */}
                <div className="pt-2 border-t border-slate-800/80">
                  <Button
                    onClick={handleSimulateConnection}
                    isLoading={isSimulatingPairing}
                    variant="outline"
                    size="sm"
                    className="w-full border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>⚡ Simulate Edge Device Connecting (Dev Demo)</span>
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
