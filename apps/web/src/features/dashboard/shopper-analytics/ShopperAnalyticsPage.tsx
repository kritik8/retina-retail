import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, TrendingUp, MapPin, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

// ─── Caption component ────────────────────────────────────────────────────────
const Caption: React.FC<{ text: string }> = ({ text }) => (
  <div
    className="flex items-start gap-2 p-2.5 rounded-lg text-[11px] leading-relaxed"
    style={{ background: 'var(--bg-subtle)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
  >
    <Info className="w-3 h-3 shrink-0 mt-0.5" style={{ color: 'var(--fg-subtle)' }} />
    <span>{text}</span>
  </div>
);

// ─── Animated horizontal bar chart ───────────────────────────────────────────
interface BarItem {
  label: string;
  value: number;
  max: number;
  color?: string;
}

const AnimatedBarChart: React.FC<{ items: BarItem[]; unit?: string }> = ({ items, unit = '' }) => (
  <div className="space-y-3">
    {items.map((item, i) => (
      <div key={item.label} className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span style={{ color: 'var(--fg-muted)' }}>{item.label}</span>
          <span className="font-mono font-semibold" style={{ color: 'var(--fg)' }}>
            {item.value}{unit}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: item.color || 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${(item.value / item.max) * 100}%` }}
            transition={{ duration: 0.9, delay: i * 0.08, ease: 'easeOut' }}
          />
        </div>
      </div>
    ))}
  </div>
);

// ─── Zone heatmap (visual grid) ───────────────────────────────────────────────
const ZONE_CELLS = [
  { id: 'entrance', label: 'Entrance', heat: 0.85, x: 0, y: 0 },
  { id: 'aisle1',   label: 'Aisle 1',  heat: 0.55, x: 1, y: 0 },
  { id: 'aisle2',   label: 'Aisle 2',  heat: 0.72, x: 2, y: 0 },
  { id: 'produce',  label: 'Produce',  heat: 0.40, x: 0, y: 1 },
  { id: 'snacks',   label: 'Snacks',   heat: 0.68, x: 1, y: 1 },
  { id: 'checkout', label: 'Checkout', heat: 0.91, x: 2, y: 1 },
];

function heatColor(heat: number): string {
  if (heat > 0.8)  return 'rgba(239,68,68,0.75)';
  if (heat > 0.6)  return 'rgba(245,158,11,0.7)';
  if (heat > 0.4)  return 'rgba(34,197,94,0.6)';
  return 'rgba(99,102,241,0.45)';
}

const ZoneHeatmap: React.FC = () => {
  const [cells, setCells] = useState(ZONE_CELLS);

  // Live drift
  useEffect(() => {
    const t = setInterval(() => {
      setCells(prev => prev.map(c => ({
        ...c,
        heat: Math.min(1, Math.max(0.1, c.heat + (Math.random() - 0.5) * 0.08)),
      })));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-2">
      {cells.map((cell, i) => (
        <motion.div
          key={cell.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06, duration: 0.25 }}
          className="relative rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-default select-none"
          style={{
            background: heatColor(cell.heat),
            minHeight: '80px',
            border: '1px solid transparent',
          }}
          whileHover={{ scale: 1.04 }}
        >
          <motion.span
            key={cell.heat.toFixed(1)}
            className="font-mono text-[18px] font-bold text-white drop-shadow"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {Math.round(cell.heat * 100)}%
          </motion.span>
          <span className="font-sans text-[10px] font-medium text-white/80 text-center">{cell.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Animated radial ring ─────────────────────────────────────────────────────
const RadialRing: React.FC<{ value: number; max: number; label: string; sublabel: string; color: string }> = ({
  value, max, label, sublabel, color,
}) => {
  const pct = value / max;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
          <motion.circle
            cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${circ}`}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-mono text-lg font-bold"
            style={{ color: 'var(--fg)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {value}
          </motion.span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-sans text-[12px] font-semibold" style={{ color: 'var(--fg)' }}>{label}</p>
        <p className="font-sans text-[10px]" style={{ color: 'var(--fg-muted)' }}>{sublabel}</p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const ShopperAnalyticsPage: React.FC = () => {
  const dwellData: BarItem[] = [
    { label: 'Entrance & Exit',   value: 18,  max: 300, color: 'var(--accent)' },
    { label: 'Aisle 1 — Grains',  value: 95,  max: 300, color: 'var(--accent)' },
    { label: 'Aisle 2 — Snacks',  value: 52,  max: 300, color: 'var(--accent)' },
    { label: 'Checkout / POS',    value: 210, max: 300, color: 'var(--status-warn)' },
    { label: 'Produce Section',   value: 74,  max: 300, color: 'var(--accent)' },
  ];

  const peakData: BarItem[] = [
    { label: '10 AM', value: 28, max: 80 },
    { label: '12 PM', value: 61, max: 80 },
    { label: '2 PM',  value: 45, max: 80 },
    { label: '4 PM',  value: 72, max: 80 },
    { label: '6 PM',  value: 58, max: 80 },
    { label: '8 PM',  value: 33, max: 80 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-0.5 pt-1">
        <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
          Shopper Analytics
        </h1>
        <p className="font-sans text-xs" style={{ color: 'var(--fg-muted)' }}>
          Demographics, footfall patterns, dwell times, and aisle activity from edge vision nodes.
        </p>
      </div>

      {/* Radial stat rings */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--fg-subtle)' }}>
            <Users className="w-3.5 h-3.5" />
            Right Now in Store
          </h2>
          <div className="flex items-center justify-around flex-wrap gap-6 py-2">
            <RadialRing value={43}  max={120} label="In Store"      sublabel="shoppers detected"  color="var(--accent)" />
            <RadialRing value={9}   max={15}  label="At Checkout"   sublabel="in queue"           color="var(--status-warn)" />
            <RadialRing value={4}   max={10}  label="Staff Members" sublabel="on floor"           color="var(--status-ok)" />
          </div>
          <Caption text="Live counts tracked by YOLOv8 across all cameras. These update every few seconds as your in-store population changes." />
        </CardContent>
      </Card>

      {/* Zone Heatmap */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--fg-subtle)' }}>
            <MapPin className="w-3.5 h-3.5" />
            Zone Activity Heatmap
          </h2>
          <ZoneHeatmap />
          <Caption text="Each cell shows how busy that zone is right now (0–100%). Red = crowded, green = normal. This updates live every 2 seconds." />
        </CardContent>
      </Card>

      {/* Dwell time chart */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--fg-subtle)' }}>
            <Clock className="w-3.5 h-3.5" />
            Avg Dwell Time by Zone (seconds)
          </h2>
          <AnimatedBarChart items={dwellData} unit="s" />
          <Caption text="Dwell time shows how long shoppers spend in each zone on average. Long dwell at Checkout (orange bar) means long queues — action may be needed." />
        </CardContent>
      </Card>

      {/* Peak hour chart */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--fg-subtle)' }}>
            <TrendingUp className="w-3.5 h-3.5" />
            Peak Shopper Hours — Today
          </h2>
          <AnimatedBarChart items={peakData} unit=" shoppers" />
          <Caption text="Peak hours show when your store gets the most traffic. Use this to schedule extra staff at busy times (typically 4–6 PM here)." />
        </CardContent>
      </Card>
    </div>
  );
};
