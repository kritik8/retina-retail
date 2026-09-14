import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ArrowRight,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ─── Zone heatmap cells ────────────────────────────────────────────────────────
const INITIAL_ZONES = [
  { id: 'entrance', label: 'Store Entrance', heat: 0.82, dwell: '18s', status: 'Transit' },
  { id: 'aisle1', label: 'Beauty & Skincare', heat: 0.58, dwell: '95s', status: 'Browsing' },
  { id: 'aisle2', label: 'Accessories Wall', heat: 0.74, dwell: '52s', status: 'Active' },
  { id: 'produce', label: 'Fragrance Gondola', heat: 0.42, dwell: '74s', status: 'Light' },
  { id: 'snacks', label: 'Promotional Endcap', heat: 0.68, dwell: '64s', status: 'Active' },
  { id: 'checkout', label: 'Checkout & POS', heat: 0.91, dwell: '210s', status: 'Congested' },
];

function heatBadge(heat: number) {
  if (heat > 0.8) return { bg: 'var(--status-err-bg)', border: 'var(--status-err)', text: 'var(--status-err)', label: 'High Load' };
  if (heat > 0.6) return { bg: 'var(--status-warn-bg)', border: 'var(--status-warn)', text: 'var(--status-warn)', label: 'Moderate' };
  return { bg: 'var(--status-ok-bg)', border: 'var(--status-ok)', text: 'var(--status-ok)', label: 'Normal' };
}

export const ShopperAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [showDetails, setShowDetails] = useState(false);

  // Subtle live drift
  useEffect(() => {
    const t = setInterval(() => {
      setZones((prev) =>
        prev.map((c) => ({
          ...c,
          heat: Math.min(0.96, Math.max(0.2, c.heat + (Math.random() - 0.5) * 0.04)),
        }))
      );
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-32">
      {/* ─── 1. Header (Short header + one-line subtext) ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
            Shopper Analytics
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
            Footfall distribution, zone activity heat, and shopper dwell metrics across edge nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/dashboard/live-monitor')}
            variant="outline"
            size="sm"
            className="text-xs"
            style={{ background: 'var(--bg-elevated)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            Live Monitor
          </Button>

          <Button
            onClick={() => navigate('/dashboard/bottleneck-diagnosis')}
            variant="primary"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
          >
            <span>Diagnose Hotspots</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ─── 2. Headline Metric Strip (Strict 4 headline numbers max) ───────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Active In Store
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              43
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>shoppers detected</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Average Dwell Time
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              8.4
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>minutes / shopper</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Top Dwell Zone
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-lg font-bold truncate" style={{ color: 'var(--status-warn)' }}>
              Checkout POS
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>(210s)</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Store Saturation
          </span>
          <div className="mt-1.5">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold tracking-wide"
              style={{ background: 'var(--status-ok-bg)', color: 'var(--status-ok)', border: '1px solid var(--status-ok-border)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              68% · NOMINAL
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. ONE Primary Visualization: Store Zone Activity Heatmap ─────────── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: 'var(--fg)' }} />
            <h2 className="font-serif text-base font-bold" style={{ color: 'var(--fg)' }}>
              Zone Activity & Occupancy Heatmap
            </h2>
          </div>
          <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--bg-subtle)', color: 'var(--fg-muted)' }}>
            Anonymous Centroids · CV Stream
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          {zones.map((zone, i) => {
            const badge = heatBadge(zone.heat);
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative rounded-xl p-4 text-center transition-transform hover:scale-[1.01]"
                style={{ background: badge.bg, border: `1px solid ${badge.border}35` }}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span style={{ color: badge.text }}>{zone.status}</span>
                  <span className="font-semibold" style={{ color: badge.text }}>
                    {zone.dwell} dwell
                  </span>
                </div>

                <p className="font-serif text-2xl font-bold mt-1" style={{ color: badge.text }}>
                  {Math.round(zone.heat * 100)}%
                </p>

                <p className="font-sans text-xs font-semibold mt-1 truncate" style={{ color: 'var(--fg)' }}>
                  {zone.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ─── 4. Compact Visual Chips for Peak Hours Rhythm ───────────────────── */}
        <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
              Peak Traffic Hours:
            </span>
            {[
              { time: '10 AM', count: 28 },
              { time: '12 PM', count: 61 },
              { time: '2 PM', count: 45 },
              { time: '4 PM', count: 72, peak: true },
              { time: '6 PM', count: 58 },
            ].map((slot) => (
              <div
                key={slot.time}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: slot.peak ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                  border: `1px solid ${slot.peak ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                <span style={{ color: 'var(--fg)' }}>{slot.time}</span>
                <span
                  className="font-mono text-[10px] font-bold px-1 rounded"
                  style={{
                    color: slot.peak ? 'var(--accent-fg)' : 'var(--fg-muted)',
                  }}
                >
                  {slot.count}
                </span>
              </div>
            ))}
          </div>

          <span className="font-mono text-[11px]" style={{ color: 'var(--fg-muted)' }}>
            Next wave expected: 4:00 PM
          </span>
        </div>
      </div>

      {/* ─── 5. Secondary / Detailed Dwell Breakdown (Collapsible) ────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium transition-colors"
          style={{ background: 'var(--bg-elevated)', color: 'var(--fg)' }}
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
            <span>{showDetails ? 'Hide Detailed Zone Dwell Breakdown' : 'Show Detailed Zone Dwell Breakdown'}</span>
          </span>
          <span className="font-mono text-[11px] text-zinc-400">{showDetails ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-3 border-t grid grid-cols-2 sm:grid-cols-5 gap-3"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
            >
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Entrance Dwell</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>18s avg</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Beauty Aisle</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>95s avg</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Accessories</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>52s avg</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Checkout Dwell</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--status-warn)' }}>210s peak</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Fragrance Gondola</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>74s avg</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 6. Prominent Focused Recommendation Action Block ─────────────────── */}
      <div
        className="p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
        style={{
          background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-subtle) 100%)',
          border: '1px solid var(--border-strong, var(--border))',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-start gap-3.5">
          <div
            className="p-2.5 rounded-xl shrink-0 mt-0.5"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent)', color: 'var(--accent-fg)' }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-fg)' }}>
                OPERATIONAL RECOMMENDATION
              </span>
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Peak traffic wave at 4:00 PM
              </span>
            </div>
            <h3 className="font-serif text-base font-bold mt-1.5" style={{ color: 'var(--fg)' }}>
              Rebalance Floor Coverage Ahead of 4:00 PM Wave
            </h3>
            <p className="text-xs mt-0.5 max-w-xl" style={{ color: 'var(--fg-muted)' }}>
              Historical patterns show footfall jumps from 45 to 72 shoppers between 3:30 and 4:30 PM. Reallocate 1 floor associate from Fragrance to Checkout queue assistance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <Button
            onClick={() => navigate('/dashboard/live-monitor')}
            variant="outline"
            size="sm"
            className="w-full md:w-auto text-xs"
            style={{ background: 'var(--bg-elevated)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            Live Monitor
          </Button>

          <Button
            onClick={() => navigate('/dashboard/what-if-simulator')}
            variant="primary"
            size="sm"
            className="w-full md:w-auto gap-1.5 text-xs font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
          >
            <span>Simulate Staff Shift</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
