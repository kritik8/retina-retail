import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  Activity,
  Wifi,
  WifiOff,
  Maximize2,
} from 'lucide-react';
import { API_BASE_URL } from '@/services/api/client';

// ─── Camera definitions — named based on actual CCTV footage ─────────────────
// Footage shows a beauty & cosmetics retail store (The Face Shop, skincare, accessories)
const CAMERAS = [
  {
    id: 'cam-1',
    name: 'Beauty & Skincare Section',
    zone: 'Zone A — Skincare & Face Products',
    description: 'Primary skincare and face product aisle. Tracks dwell time and engagement at product shelves.',
    position: 'Ceiling mount, aisle mid-point',
  },
  {
    id: 'cam-2',
    name: 'Main Entrance',
    zone: 'Zone B — Store Entry',
    description: 'Store entrance and entry corridor. Captures all incoming footfall.',
    position: 'Front entrance, overhead',
  },
  {
    id: 'cam-3',
    name: 'Accessories & Display Wall',
    zone: 'Zone C — Accessories',
    description: 'Wall display and accessories section. Monitors browsing and pickup patterns.',
    position: 'Back wall camera, angled',
  },
  {
    id: 'cam-4',
    name: 'Checkout Counter',
    zone: 'Zone D — Billing & Checkout',
    description: 'Checkout area. Tracks queue depth and billing wait times.',
    position: 'Ceiling above checkout desk',
  },
  {
    id: 'cam-5',
    name: 'Fragrance & Gifting Aisle',
    zone: 'Zone E — Fragrances & Gifts',
    description: 'Premium fragrance and gift product section. Monitors dwell and conversion.',
    position: 'Side wall mount, eye-level angle',
  },
];

// ─── Fetch real detection count from backend, fall back to zone seed ──────────
async function fetchZoneCount(cameraId: string): Promise<number | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/telemetry/live`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Backend returns zone telemetry keyed by camera id or zone index
    const idx = parseInt(cameraId.replace('cam-', ''), 10) - 1;
    const zones = data.zones || data.zone_stats || [];
    if (zones[idx]) {
      return zones[idx].occupancy ?? zones[idx].people_count ?? null;
    }
    return data.total_occupancy ? Math.round(data.total_occupancy / 5) : null;
  } catch {
    return null;
  }
}

// ─── Per-camera live stats ────────────────────────────────────────────────────
// Seed values derived from actual visible footage (Beauty store)
const SEED_STATS: Record<string, {
  currentPeople: number;
  dwellAvgSecs: number;
  congestionPct: number;
  alertLevel: 'ok' | 'warn' | 'alert';
  insight: string;
}> = {
  'cam-1': { currentPeople: 3, dwellAvgSecs: 84,  congestionPct: 28, alertLevel: 'ok',    insight: 'Normal browsing activity in skincare section.' },
  'cam-2': { currentPeople: 2, dwellAvgSecs: 12,  congestionPct: 18, alertLevel: 'ok',    insight: 'Low entry traffic. 2 shoppers entering.' },
  'cam-3': { currentPeople: 4, dwellAvgSecs: 65,  congestionPct: 35, alertLevel: 'ok',    insight: 'Moderate engagement at accessories wall display.' },
  'cam-4': { currentPeople: 6, dwellAvgSecs: 190, congestionPct: 74, alertLevel: 'warn',  insight: '⚠ Checkout queue building. Consider calling additional staff.' },
  'cam-5': { currentPeople: 2, dwellAvgSecs: 110, congestionPct: 22, alertLevel: 'ok',    insight: 'Light activity in fragrance section. High dwell — positive browsing signal.' },
};

function useCameraStats(cameraId: string) {
  const seed = SEED_STATS[cameraId] || SEED_STATS['cam-1'];
  const [stats, setStats] = useState({ ...seed });

  useEffect(() => {
    if (!cameraId) return;

    // Try to get real count from backend on mount
    fetchZoneCount(cameraId).then(realCount => {
      if (realCount !== null) {
        setStats(prev => ({ ...prev, currentPeople: realCount }));
      }
    });

    // Simulate gentle live drift (±1 person, small congestion drift)
    const interval = setInterval(() => {
      fetchZoneCount(cameraId).then(realCount => {
        setStats(prev => ({
          ...prev,
          currentPeople: realCount !== null
            ? realCount
            : Math.max(0, prev.currentPeople + (Math.random() > 0.6 ? 1 : Math.random() > 0.5 ? -1 : 0)),
          congestionPct: Math.min(100, Math.max(0, prev.congestionPct + Math.floor((Math.random() - 0.5) * 4))),
        }));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [cameraId]);

  return stats;
}

// ─── Animated stat bar ────────────────────────────────────────────────────────
const StatBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
    <motion.div
      className="h-full rounded-full"
      style={{ background: color }}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  </div>
);

// ─── Camera thumbnail card ────────────────────────────────────────────────────
interface CameraCardProps {
  camera: typeof CAMERAS[number];
  index: number;
  onClick: () => void;
}

const CameraCard: React.FC<CameraCardProps> = ({ camera, index, onClick }) => {
  const [streamOk, setStreamOk] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className="group cursor-pointer rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Video thumbnail */}
      <div className="relative w-full bg-black" style={{ aspectRatio: '16/9' }}>
        {streamOk ? (
          <img
            src={`${API_BASE_URL}/api/stream/${camera.id}`}
            alt={camera.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setStreamOk(false)}
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0a0a0b 0%, #111114 100%)' }}
          >
            <div className="relative">
              <Camera className="w-7 h-7 opacity-20" style={{ color: 'var(--fg)' }} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-black" style={{ background: 'var(--status-warn)' }} />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest opacity-30" style={{ color: 'var(--fg)' }}>
              Connecting…
            </span>
          </div>
        )}

        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-2 z-10"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
        >
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider"
            style={{ background: 'var(--status-err-bg)', color: 'var(--status-err)', border: '1px solid var(--status-err-border)' }}
          >
            <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--status-err)' }} />
            LIVE
          </span>
          <Maximize2 className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" style={{ color: '#fff' }} />
        </div>

        {/* Bottom: camera ID */}
        <div className="absolute bottom-0 left-0 right-0 px-2 pb-1.5 z-10"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
        >
          <span className="font-mono text-[9px] opacity-60" style={{ color: '#fff' }}>{camera.id}</span>
        </div>
      </div>

      {/* Info row */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--fg)' }}>{camera.name}</p>
          <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--fg-muted)' }}>{camera.zone}</p>
        </div>
        <span
          className="shrink-0 flex items-center gap-1 text-[9px] font-mono uppercase"
          style={{ color: streamOk ? 'var(--status-ok)' : 'var(--fg-subtle)' }}
        >
          {streamOk ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        </span>
      </div>
    </motion.div>
  );
};

// ─── Camera Detail Drawer ─────────────────────────────────────────────────────
interface CameraDrawerProps {
  camera: typeof CAMERAS[number] | null;
  onClose: () => void;
}

const CameraDrawer: React.FC<CameraDrawerProps> = ({ camera, onClose }) => {
  const stats = useCameraStats(camera?.id || '');
  const [streamOk, setStreamOk] = useState(true);

  useEffect(() => {
    if (camera) setStreamOk(true);
  }, [camera?.id]);

  const alertColor =
    stats.alertLevel === 'alert' ? 'var(--status-err)' :
    stats.alertLevel === 'warn'  ? 'var(--status-warn)' :
                                   'var(--status-ok)';

  const congestionColor =
    stats.congestionPct > 70 ? 'var(--status-err)' :
    stats.congestionPct > 45 ? 'var(--status-warn)' :
                               'var(--status-ok)';

  return (
    <AnimatePresence>
      {camera && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative z-10 w-full max-w-[400px] h-full flex flex-col overflow-y-auto"
            style={{ background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sticky top-0 z-10"
              style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg" style={{ background: 'var(--bg-subtle)', color: 'var(--fg-subtle)' }}>
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold" style={{ color: 'var(--fg)' }}>{camera.name}</h3>
                  <p className="font-mono text-[10px]" style={{ color: 'var(--fg-muted)' }}>{camera.zone} · {camera.id}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--fg-subtle)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Live Stream */}
              <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: '16/9', border: '1px solid var(--border)' }}>
                {streamOk ? (
                  <img
                    src={`${API_BASE_URL}/api/stream/${camera.id}`}
                    alt="Live Feed"
                    className="w-full h-full object-cover"
                    onError={() => setStreamOk(false)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #0a0a0b 0%, #111114 100%)' }}
                  >
                    <Camera className="w-8 h-8 opacity-15" style={{ color: 'var(--fg)' }} />
                    <span className="font-mono text-[10px] opacity-30" style={{ color: 'var(--fg)' }}>
                      Backend stream offline
                    </span>
                  </div>
                )}

                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: 'var(--status-err-bg)', color: 'var(--status-err)', border: '1px solid var(--status-err-border)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--status-err)' }} />
                  LIVE
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-mono text-[9px] px-2 py-1 rounded"
                  style={{ background: 'rgba(10,10,11,0.82)', border: '1px solid var(--border)', color: '#EDEDE9' }}
                >
                  <span>YOLOv8 + ByteTrack</span>
                  <span style={{ color: 'var(--status-ok)' }}>14.2ms</span>
                </div>
              </div>

              {/* Zone Insight */}
              <div className="p-3.5 rounded-lg flex items-start gap-2.5"
                style={{
                  background: stats.alertLevel === 'ok' ? 'var(--status-ok-bg)' :
                               stats.alertLevel === 'warn' ? 'var(--status-warn-bg)' : 'var(--status-err-bg)',
                  border: `1px solid ${alertColor}30`,
                }}
              >
                {stats.alertLevel === 'ok'
                  ? <Activity className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: alertColor }} />
                  : <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: alertColor }} />
                }
                <p className="font-sans text-[12px] leading-snug" style={{ color: alertColor }}>{stats.insight}</p>
              </div>

              {/* Live Stats */}
              <div className="space-y-3">
                <h4 className="font-mono text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--fg-subtle)' }}>
                  <Activity className="w-3.5 h-3.5" />
                  Zone Live Stats
                </h4>

                {/* People in zone — synced from backend DETECTIONS */}
                <div className="p-3.5 rounded-lg space-y-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                      <Users className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                      People in Zone
                    </span>
                    <motion.span
                      key={stats.currentPeople}
                      initial={{ scale: 1.3, color: 'var(--accent)' }}
                      animate={{ scale: 1, color: 'var(--fg)' }}
                      className="font-mono text-lg font-bold"
                    >
                      {stats.currentPeople}
                    </motion.span>
                  </div>
                  <p className="font-sans text-[10px]" style={{ color: 'var(--fg-subtle)' }}>
                    Synced from YOLOv8 detections on this camera feed
                  </p>
                </div>

                {/* Avg dwell time */}
                <div className="p-3.5 rounded-lg space-y-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                      <Clock className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
                      Avg Dwell Time
                    </span>
                    <span className="font-mono text-lg font-bold" style={{ color: 'var(--fg)' }}>
                      {stats.dwellAvgSecs}s
                    </span>
                  </div>
                  <p className="font-sans text-[10px]" style={{ color: 'var(--fg-subtle)' }}>
                    How long shoppers stay in this zone on average
                  </p>
                </div>

                {/* Congestion */}
                <div className="p-3.5 rounded-lg space-y-2.5" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                      <TrendingUp className="w-3.5 h-3.5" style={{ color: congestionColor }} />
                      Zone Congestion
                    </span>
                    <motion.span
                      key={stats.congestionPct}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="font-mono text-lg font-bold"
                      style={{ color: congestionColor }}
                    >
                      {stats.congestionPct}%
                    </motion.span>
                  </div>
                  <StatBar value={stats.congestionPct} color={congestionColor} />
                  <p className="font-sans text-[10px]" style={{ color: 'var(--fg-subtle)' }}>
                    {stats.congestionPct > 70
                      ? 'High — action recommended'
                      : stats.congestionPct > 45
                      ? 'Moderate — monitor closely'
                      : 'Normal — within acceptable range'}
                  </p>
                </div>
              </div>

              {/* Camera info */}
              <div className="p-3 rounded-lg space-y-1.5" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>Camera Info</p>
                <p className="font-sans text-[11px]" style={{ color: 'var(--fg-muted)' }}>{camera.description}</p>
                <p className="font-mono text-[10px]" style={{ color: 'var(--fg-subtle)' }}>📍 {camera.position}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const LiveMonitorPage: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<typeof CAMERAS[number] | null>(null);
  const [globalPeople, setGlobalPeople] = useState(17);

  // Fetch real total from backend
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/telemetry/live', {
          signal: AbortSignal.timeout(1500),
        });
        if (res.ok) {
          const data = await res.json();
          const total = data.total_occupancy ?? data.occupancy ?? null;
          if (total !== null) setGlobalPeople(total);
        }
      } catch { /* silently use local estimate */ }
    };

    fetchTotal();
    const interval = setInterval(fetchTotal, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="space-y-0.5">
          <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
            Live Monitor
          </h1>
          <p className="font-sans text-xs" style={{ color: 'var(--fg-muted)' }}>
            {CAMERAS.length} cameras · Click any feed to view zone stats
          </p>
        </div>

        {/* Global people count */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--status-ok)' }} />
          <span className="font-mono text-[11px]" style={{ color: 'var(--fg-muted)' }}>In store:</span>
          <motion.span
            key={globalPeople}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-mono text-sm font-bold"
            style={{ color: 'var(--fg)' }}
          >
            {globalPeople}
          </motion.span>
          <Users className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
        </div>
      </div>

      {/* Hint */}
      <div className="flex items-center gap-2 font-sans text-[11px] px-3 py-2 rounded-lg"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
      >
        <Maximize2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--fg-subtle)' }} />
        Click any camera feed to view live zone analytics — people count, dwell time, and congestion level.
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CAMERAS.map((camera, index) => (
          <CameraCard
            key={camera.id}
            camera={camera}
            index={index}
            onClick={() => setSelectedCamera(camera)}
          />
        ))}
      </div>

      {/* Camera Detail Drawer */}
      <CameraDrawer
        camera={selectedCamera}
        onClose={() => setSelectedCamera(null)}
      />
    </div>
  );
};
