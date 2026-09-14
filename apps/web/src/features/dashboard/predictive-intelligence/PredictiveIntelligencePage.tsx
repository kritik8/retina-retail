import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Info,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mockIntelligenceService } from '@/services/mock/storeIntelligence';
import type { StoreState, Prediction, CongestionRiskLevel } from '@/types';

export const PredictiveIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const [storeState, setStoreState] = useState<StoreState | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [horizonMinutes, setHorizonMinutes] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    value: number;
    type: 'historical' | 'forecast';
    range?: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [stateRes, predRes] = await Promise.all([
        mockIntelligenceService.getStoreState(),
        mockIntelligenceService.getPrediction(horizonMinutes),
      ]);
      setStoreState(stateRes);
      setPrediction(predRes);
    } catch (err) {
      console.error('Failed to fetch predictive data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [horizonMinutes]);

  if (loading || !storeState || !prediction) {
    return (
      <div className="space-y-6 animate-pulse max-w-6xl mx-auto">
        <div className="h-8 rounded-lg w-1/4" style={{ background: 'var(--bg-subtle)' }} />
        <div className="h-20 rounded-xl" style={{ background: 'var(--bg-subtle)' }} />
        <div className="h-80 rounded-2xl" style={{ background: 'var(--bg-subtle)' }} />
      </div>
    );
  }

  const getRiskBadge = (risk: CongestionRiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return { bg: 'var(--status-err-bg)', border: 'var(--status-err-border)', fg: 'var(--status-err)', dot: 'var(--status-err)', label: 'CRITICAL' };
      case 'HIGH':
        return { bg: 'var(--status-warn-bg)', border: 'var(--status-warn-border)', fg: 'var(--status-warn)', dot: 'var(--status-warn)', label: 'HIGH RISK' };
      case 'MODERATE':
        return { bg: 'var(--status-warn-bg)', border: 'var(--status-warn-border)', fg: 'var(--status-warn)', dot: 'var(--status-warn)', label: 'MODERATE' };
      default:
        return { bg: 'var(--status-ok-bg)', border: 'var(--status-ok-border)', fg: 'var(--status-ok)', dot: 'var(--status-ok)', label: 'NORMAL' };
    }
  };

  const riskBadge = getRiskBadge(prediction.risk);

  // SVG Chart Geometry
  const width = 800;
  const height = 230;
  const paddingX = 40;
  const paddingY = 28;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const maxValue = 36;
  const minValue = 0;

  const hist = prediction.historicalSeries;
  const fore = prediction.forecastSeries;
  const totalSteps = hist.length + fore.length - 1;

  const histPoints = hist.map((pt, i) => {
    const x = paddingX + (i / totalSteps) * plotWidth;
    const y = height - paddingY - ((pt.value - minValue) / (maxValue - minValue)) * plotHeight;
    return { x, y, pt };
  });

  const histPathD = histPoints.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const foreStartIndex = hist.length - 1;

  const forePoints = fore.map((pt, i) => {
    const x = paddingX + ((foreStartIndex + i) / totalSteps) * plotWidth;
    const y = height - paddingY - ((pt.value - minValue) / (maxValue - minValue)) * plotHeight;
    const yUpper = height - paddingY - ((pt.upperBand - minValue) / (maxValue - minValue)) * plotHeight;
    const yLower = height - paddingY - ((pt.lowerBand - minValue) / (maxValue - minValue)) * plotHeight;
    return { x, y, yUpper, yLower, pt };
  });

  const forePathD = forePoints.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const upperPath = forePoints.map((p) => `${p.x} ${p.yUpper}`).join(' L ');
  const lowerPathReversed = [...forePoints].reverse().map((p) => `${p.x} ${p.yLower}`).join(' L ');
  const confidencePolygonD = `M ${upperPath} L ${lowerPathReversed} Z`;
  const transitionX = histPoints[histPoints.length - 1].x;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-32">
      {/* ─── 1. Header & Horizon Switcher (Short header + one-line subtext) ────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
            Predictive Store Intelligence
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
            Real-time queue trajectory forecasting and proactive bottleneck prevention.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex p-1 rounded-lg text-xs" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            {[10, 15, 30].map((h) => (
              <button
                key={h}
                onClick={() => setHorizonMinutes(h)}
                className="px-2.5 py-1 rounded-md font-mono text-xs transition-colors"
                style={{
                  background: horizonMinutes === h ? 'var(--accent-subtle)' : 'transparent',
                  color: horizonMinutes === h ? 'var(--accent-fg)' : 'var(--fg-muted)',
                  fontWeight: horizonMinutes === h ? 600 : 400,
                  border: horizonMinutes === h ? '1px solid var(--accent)' : '1px solid transparent',
                }}
              >
                +{h}m
              </button>
            ))}
          </div>

          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium"
            disabled={isRefreshing}
            style={{ background: 'var(--bg-elevated)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync
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
            Current Queue
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              {storeState.queueLength}
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>waiting</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Forecast (+{horizonMinutes}m)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-2xl font-bold" style={{ color: 'var(--status-warn)' }}>
              {prediction.predictedQueue}
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>projected</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Time to Breach
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-2xl font-bold" style={{ color: 'var(--status-err)' }}>
              ~{prediction.timeToThreshold}
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>minutes</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Congestion Risk
          </span>
          <div className="mt-1.5">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold tracking-wide"
              style={{ background: riskBadge.bg, color: riskBadge.fg, border: `1px solid ${riskBadge.border}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: riskBadge.dot }} />
              {riskBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. ONE Primary Visualization (High visual weight forecast chart) ─── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        {/* Chart Header & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--fg)' }} />
            <h2 className="font-serif text-base font-bold" style={{ color: 'var(--fg)' }}>
              Queue Forecast Trajectory (+{horizonMinutes}m)
            </h2>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <div className="flex items-center gap-1.5" style={{ color: 'var(--fg-muted)' }}>
              <span className="w-3 h-0.5 rounded" style={{ background: 'var(--fg)' }} />
              <span>Historical</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--status-warn)' }}>
              <span className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: 'var(--status-warn)' }} />
              <span>Forecasted</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--status-err)' }}>
              <span className="w-3 h-0.5 border-t border-dashed" style={{ borderColor: 'var(--status-err)' }} />
              <span>Limit (15)</span>
            </div>
          </div>
        </div>

        {/* SVG Visualization Canvas */}
        <div className="relative w-full overflow-hidden p-3 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="predAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--status-warn)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--status-warn)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 10, 20, 30].map((val) => {
              const y = height - paddingY - ((val - minValue) / (maxValue - minValue)) * plotHeight;
              return (
                <g key={val}>
                  <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
                  <text x={paddingX - 8} y={y + 3} textAnchor="end" fill="var(--fg-muted)" fontSize="9" fontFamily="monospace">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Action threshold limit line (15 people) */}
            {(() => {
              const threshY = height - paddingY - ((15 - minValue) / (maxValue - minValue)) * plotHeight;
              return (
                <g>
                  <line
                    x1={paddingX}
                    y1={threshY}
                    x2={width - paddingX}
                    y2={threshY}
                    stroke="var(--status-err)"
                    strokeDasharray="5 3"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                  <text x={width - paddingX} y={threshY - 6} textAnchor="end" fill="var(--status-err)" fontSize="9" fontFamily="monospace">
                    Action Threshold (15)
                  </text>
                </g>
              );
            })()}

            {/* NOW vertical divider */}
            <line
              x1={transitionX}
              y1={paddingY}
              x2={transitionX}
              y2={height - paddingY}
              stroke="var(--fg-muted)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <text x={transitionX} y={paddingY - 6} textAnchor="middle" fill="var(--fg)" fontSize="10" fontWeight="bold" fontFamily="monospace">
              NOW
            </text>

            {/* Forecast confidence band */}
            <motion.path
              d={confidencePolygonD}
              fill="url(#predAreaGrad)"
              stroke="var(--status-warn)"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.6 }}
            />

            {/* Historical trajectory line */}
            <motion.path
              d={histPathD}
              fill="none"
              stroke="var(--fg)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />

            {/* Forecast trajectory line */}
            <motion.path
              d={forePathD}
              fill="none"
              stroke="var(--status-warn)"
              strokeWidth="2.5"
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.0, delay: 0.3 }}
            />

            {/* Historical markers */}
            {histPoints.map((p, idx) => (
              <circle
                key={`hist-${idx}`}
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="var(--fg)"
                stroke="var(--bg-elevated)"
                strokeWidth="2"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint({ label: p.pt.t, value: p.pt.value, type: 'historical' })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

            {/* Forecast markers */}
            {forePoints.map((p, idx) => (
              <circle
                key={`fore-${idx}`}
                cx={p.x}
                cy={p.y}
                r="4"
                fill="var(--status-warn)"
                stroke="var(--bg-elevated)"
                strokeWidth="2"
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    label: `+${idx * 3} min`,
                    value: p.pt.value,
                    type: 'forecast',
                    range: `${p.pt.lowerBand}–${p.pt.upperBand}`,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute top-4 right-4 rounded-xl px-3 py-2 text-xs space-y-0.5 shadow-xl backdrop-blur-md z-30"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            >
              <p className="font-semibold text-[11px]">{hoveredPoint.label}</p>
              <p className="font-mono font-bold">{hoveredPoint.value} shoppers</p>
              {hoveredPoint.range && (
                <p className="font-mono text-[10px]" style={{ color: 'var(--status-warn)' }}>
                  Range: {hoveredPoint.range}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ─── 4. Compact Visual Chips for Contributing Factors (Scannable) ───── */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mr-1" style={{ color: 'var(--fg-muted)' }}>
              Key Drivers:
            </span>
            {prediction.drivers.map((driver, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--fg)' }}>{driver.label}</span>
                {driver.changePercent !== undefined && (
                  <span
                    className="font-mono text-[10px] font-bold px-1 py-0.2 rounded"
                    style={{
                      background: driver.changePercent > 0 ? 'var(--status-err-bg)' : 'var(--status-warn-bg)',
                      color: driver.changePercent > 0 ? 'var(--status-err)' : 'var(--status-warn)',
                    }}
                  >
                    {driver.changePercent > 0 ? `+${driver.changePercent}%` : `${driver.changePercent}%`}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]" style={{ color: 'var(--fg-muted)' }}>
            <Info className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span>Forecast reliability: <strong style={{ color: 'var(--fg)' }}>{prediction.reliability}</strong></span>
          </div>
        </div>
      </div>

      {/* ─── 5. Secondary / Detailed Metrics (Collapsible behind Show Details) ─── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium transition-colors"
          style={{ background: 'var(--bg-elevated)', color: 'var(--fg)' }}
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
            <span>{showDetails ? 'Hide Detailed Flow Metrics' : 'Show Detailed Flow Metrics'}</span>
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
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
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Floor Occupancy</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>{storeState.occupancy} shoppers</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Incoming Rate</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>{storeState.incomingRate} /min</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Outgoing Rate</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>{storeState.outgoingRate} /min</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Service Capacity</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>{storeState.serviceRate} /min</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Area Saturation</p>
                <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--fg)' }}>{storeState.density}% density</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 6. Prominent Focused Recommendation Action Card ─────────────────── */}
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
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-fg)' }}>
                RECOMMENDED ACTION
              </span>
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Breach expected in ~{prediction.timeToThreshold} mins
              </span>
            </div>
            <h3 className="font-serif text-base font-bold mt-1.5" style={{ color: 'var(--fg)' }}>
              Investigate Bottleneck in Checkout Zone
            </h3>
            <p className="text-xs mt-0.5 max-w-xl" style={{ color: 'var(--fg-muted)' }}>
              Observed flow imbalance: incoming traffic is exceeding checkout throughput by ~31%. Explore root causes and simulate countermeasures.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <Button
            onClick={() => navigate('/dashboard/what-if-simulator')}
            variant="outline"
            size="sm"
            className="w-full md:w-auto text-xs"
            style={{ background: 'var(--bg-elevated)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            What-If Simulator
          </Button>

          <Button
            onClick={() => navigate('/dashboard/bottleneck-diagnosis')}
            variant="primary"
            size="sm"
            className="w-full md:w-auto gap-1.5 text-xs font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
          >
            <span>Investigate Bottleneck</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
