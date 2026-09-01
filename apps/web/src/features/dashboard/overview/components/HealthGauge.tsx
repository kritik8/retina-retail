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
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // ~289.02
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getStatusColor = () => {
    if (score >= 88) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', stroke: '#10b981' };
    if (score >= 75) return { text: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', stroke: '#6366f1' };
    if (score >= 55) return { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', stroke: '#f59e0b' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', stroke: '#ef4444' };
  };

  const statusConfig = getStatusColor();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

      {/* Radial Gauge Centerpiece */}
      <div className="flex flex-col items-center justify-center shrink-0 space-y-3 relative z-10">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Track Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="text-slate-800"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated Gauge Progress Arc */}
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
            <span className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-0.5">
              <AnimatedNumber value={score} />
              <span className="text-xs font-semibold text-slate-400">/100</span>
            </span>
            <span className={`text-xs font-semibold uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="text-center space-y-0.5">
          <h3 className="text-sm font-semibold text-white flex items-center justify-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Store Health Index</span>
          </h3>
          <p className="text-xs text-slate-400">Composite AI Intelligence Score</p>
        </div>
      </div>

      {/* Right Column: Composite Score Breakdown Metrics */}
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Footfall Rate
            </span>
            <span className="font-semibold text-white">{breakdown.footfallScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${breakdown.footfallScore}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-[11px] text-slate-500">18.4% growth vs average</p>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Queue Flow
            </span>
            <span className="font-semibold text-white">{breakdown.queueScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${breakdown.queueScore}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-[11px] text-slate-500">Avg 2.3 min wait time</p>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              Shelf Availability
            </span>
            <span className="font-semibold text-white">{breakdown.stockScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${breakdown.stockScore}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-[11px] text-slate-500">3 active low-stock alerts</p>
        </div>
      </div>
    </div>
  );
};
