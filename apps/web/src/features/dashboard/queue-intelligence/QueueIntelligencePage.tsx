import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CounterLane {
  id: number;
  name: string;
  status: 'active' | 'standby';
  queueLength: number;
  avgWaitMins: number;
  cashierName?: string;
}

const LANES: CounterLane[] = [
  { id: 1, name: 'Counter 1 (Express)', status: 'active', queueLength: 5, avgWaitMins: 2.1, cashierName: 'Aarav M.' },
  { id: 2, name: 'Counter 2 (Standard)', status: 'active', queueLength: 3, avgWaitMins: 1.4, cashierName: 'Priya K.' },
  { id: 3, name: 'Counter 3 (Standby)', status: 'standby', queueLength: 0, avgWaitMins: 0 },
  { id: 4, name: 'Counter 4 (Standby)', status: 'standby', queueLength: 0, avgWaitMins: 0 },
];

export const QueueIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-32">
      {/* ─── 1. Header (Short header + one-line subtext) ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
            Queue Intelligence
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
            POS checkout depths, service throughput cadence, and lane wait-time projections.
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
            Live Camera Feeds
          </Button>

          <Button
            onClick={() => navigate('/dashboard/what-if-simulator')}
            variant="primary"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
          >
            <span>Simulate Additional Lane</span>
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
            Active Queue
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-2xl font-bold" style={{ color: 'var(--status-warn)' }}>
              8
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>waiting</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Average Wait Time
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              2.4
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>minutes</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Open Checkouts
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-2xl font-bold" style={{ color: 'var(--status-ok)' }}>
              2
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>of 4 counters active</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Service Cadence
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              3.1
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>checkouts/min</span>
          </div>
        </div>
      </div>

      {/* ─── 3. ONE Primary Visualization: POS Lane Queue Depth Visualizer ────── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: 'var(--fg)' }} />
            <h2 className="font-serif text-base font-bold" style={{ color: 'var(--fg)' }}>
              Live Checkout Lane Distribution & Queue Load
            </h2>
          </div>
          <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--bg-subtle)', color: 'var(--fg-muted)' }}>
            Sensor Zone · Checkout POS
          </span>
        </div>

        {/* Lanes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          {LANES.map((lane) => {
            const isActive = lane.status === 'active';
            return (
              <div
                key={lane.id}
                className="p-4 rounded-xl flex flex-col justify-between"
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${isActive ? 'var(--border)' : 'var(--border)'}`,
                  opacity: isActive ? 1 : 0.6,
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                      {lane.name}
                    </span>
                    <span
                      className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                      style={{
                        background: isActive ? 'var(--status-ok-bg)' : 'var(--bg-subtle)',
                        color: isActive ? 'var(--status-ok)' : 'var(--fg-muted)',
                      }}
                    >
                      {lane.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-serif text-2xl font-bold" style={{ color: isActive ? 'var(--fg)' : 'var(--fg-muted)' }}>
                      {lane.queueLength}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>shoppers waiting</span>
                  </div>

                  {/* Visual Queue Capacity Bar */}
                  <div className="mt-3 w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(lane.queueLength / 10) * 100}%` }}
                      className="h-full rounded-full"
                      style={{
                        background: lane.queueLength >= 6 ? 'var(--status-err)' : lane.queueLength >= 3 ? 'var(--status-warn)' : 'var(--status-ok)',
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--fg-muted)' }}>Avg Wait:</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--fg)' }}>
                    {isActive ? `${lane.avgWaitMins}m` : '0m'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── 4. Compact Status Chips ────────────────────────────────────────── */}
        <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
              Lane Status:
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span style={{ color: 'var(--fg)' }}>Lane 1 Express: Moderate Queue (5)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span style={{ color: 'var(--fg)' }}>Lane 2 Standard: Optimal Flow (3)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]" style={{ color: 'var(--fg-muted)' }}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target wait SLA: under 3.0 min</span>
          </div>
        </div>
      </div>

      {/* ─── 5. Secondary / Detailed Cadence Metrics (Collapsible) ────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium transition-colors"
          style={{ background: 'var(--bg-elevated)', color: 'var(--fg)' }}
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
            <span>{showDetails ? 'Hide Service Step Breakdown' : 'Show Service Step Breakdown'}</span>
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
              className="px-4 py-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-3"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
            >
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Item Scanning</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>42s / customer</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Payment Processing</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>28s / transaction</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Bagging & Hand-off</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>15s / cart</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Total Cycle Time</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--status-warn)' }}>85s avg</p>
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
            style={{ background: 'var(--status-warn-bg)', border: '1px solid var(--status-warn-border)', color: 'var(--status-warn)' }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-fg)' }}>
                OPERATIONAL RECOMMENDATION
              </span>
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Peak wave expected in ~7 mins
              </span>
            </div>
            <h3 className="font-serif text-base font-bold mt-1.5" style={{ color: 'var(--fg)' }}>
              Open Counter 3 (Standby) Within 6 Minutes
            </h3>
            <p className="text-xs mt-0.5 max-w-xl" style={{ color: 'var(--fg-muted)' }}>
              Incoming foot traffic from Aisle 1 is projected to push Counter 1 wait times over 3.5 minutes. Activating Counter 3 maintains sub-2 minute wait times.
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
            <span>Simulate Lane 3</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
