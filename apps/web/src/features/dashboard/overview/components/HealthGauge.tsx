import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from './AnimatedNumber';
import { Activity, Users, Clock, Package } from 'lucide-react';

interface HealthGaugeProps {
  score: number;
  status: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  breakdown: {
    footfallScore: number;
    queueScore: number;
    stockScore: number;
  };
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({ score, status, breakdown }) => {
  const radius = 46;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getStatusConfig = () => {
    if (score >= 88) return { text: 'var(--status-ok)', bg: 'var(--status-ok-bg)', border: 'var(--status-ok-border)', stroke: 'var(--status-ok)' };
    if (score >= 75) return { text: 'var(--fg)', bg: 'var(--accent-subtle)', border: 'var(--accent-border)', stroke: 'var(--accent)' };
    if (score >= 55) return { text: 'var(--status-warn)', bg: 'var(--status-warn-bg)', border: 'var(--status-warn-border)', stroke: 'var(--status-warn)' };
    return { text: 'var(--status-err)', bg: 'var(--status-err-bg)', border: 'var(--status-err-border)', stroke: 'var(--status-err)' };
  };

  const statusConfig = getStatusConfig();

  return (
    <div
      className="rounded-[10px] p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      {/* Radial Gauge Centerpiece */}
      <div className="flex flex-col items-center justify-center shrink-0 space-y-3 relative z-10">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              strokeWidth={strokeWidth}
              stroke="var(--border)"
              fill="transparent"
            />
            {/* Progress */}
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              strokeWidth={strokeWidth}
              stroke={statusConfig.stroke}
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Score & Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-serif text-3xl font-bold tracking-tight flex items-baseline gap-0.5" style={{ color: 'var(--fg)' }}>
              <AnimatedNumber value={score} />
              <span className="font-mono text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>/100</span>
            </span>
            <span
              className="text-[10px] font-mono font-semibold uppercase tracking-widest mt-1 px-2.5 py-0.5 rounded-full"
              style={{ background: statusConfig.bg, color: statusConfig.text, border: `1px solid ${statusConfig.border}` }}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="text-center space-y-0.5">
          <h3 className="font-serif text-sm font-semibold flex items-center justify-center gap-1.5" style={{ color: 'var(--fg)' }}>
            <Activity className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
            <span>Store Health Index</span>
          </h3>
          <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>Composite AI Score</p>
        </div>
      </div>

      {/* Right Column: Score Breakdown */}
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        {/* Footfall */}
        <div className="p-3.5 rounded-lg space-y-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--fg-muted)' }}>
              <Users className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
              Footfall
            </span>
            <span className="font-mono font-semibold" style={{ color: 'var(--fg)' }}>{breakdown.footfallScore}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--accent)' }}
              initial={{ width: 0 }}
              animate={{ width: `${breakdown.footfallScore}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>18.4% growth vs avg</p>
        </div>

        {/* Queue */}
        <div className="p-3.5 rounded-lg space-y-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--fg-muted)' }}>
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--status-warn)' }} />
              Queue Flow
            </span>
            <span className="font-mono font-semibold" style={{ color: 'var(--fg)' }}>{breakdown.queueScore}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--status-warn)' }}
              initial={{ width: 0 }}
              animate={{ width: `${breakdown.queueScore}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>Avg 2.3 min wait</p>
        </div>

        {/* Shelf */}
        <div className="p-3.5 rounded-lg space-y-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--fg-muted)' }}>
              <Package className="w-3.5 h-3.5" style={{ color: 'var(--status-ok)' }} />
              Stock Availability
            </span>
            <span className="font-mono font-semibold" style={{ color: 'var(--fg)' }}>{breakdown.stockScore}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--status-ok)' }}
              initial={{ width: 0 }}
              animate={{ width: `${breakdown.stockScore}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>3 low-stock alerts</p>
        </div>
      </div>
    </div>
  );
};
