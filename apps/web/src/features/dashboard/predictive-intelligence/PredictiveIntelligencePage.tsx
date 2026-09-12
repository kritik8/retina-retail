import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ArrowRight,
  Users,
  Activity,
  ShieldAlert,
  Info,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
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

  useEffect(() => { fetchData(); }, [horizonMinutes]);

  if (loading || !storeState || !prediction) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 rounded-xl w-1/3" style={{ background: 'var(--bg-subtle)' }} />
        <div className="h-32 rounded-xl" style={{ background: 'var(--bg-subtle)' }} />
        <div className="h-72 rounded-xl" style={{ background: 'var(--bg-subtle)' }} />
      </div>
    );
  }

  const getRiskBadge = (risk: CongestionRiskLevel) => {
    switch (risk) {
      case 'CRITICAL': return { bg: 'var(--status-err-bg)',  border: 'var(--status-err-border)',  fg: 'var(--status-err)',  dot: 'var(--status-err)',  label: 'CRITICAL' };
      case 'HIGH':     return { bg: 'var(--status-warn-bg)', border: 'var(--status-warn-border)', fg: 'var(--status-warn)', dot: 'var(--status-warn)', label: 'HIGH RISK' };
      case 'MODERATE': return { bg: 'var(--status-warn-bg)', border: 'var(--status-warn-border)', fg: 'var(--status-warn)', dot: 'var(--status-warn)', label: 'MODERATE' };
      default:         return { bg: 'var(--status-ok-bg)',   border: 'var(--status-ok-border)',   fg: 'var(--status-ok)',   dot: 'var(--status-ok)',   label: 'NORMAL' };
    }
  };

  const riskBadge = getRiskBadge(prediction.risk);

  // SVG Chart
  const width = 800; const height = 240;
  const paddingX = 40; const paddingY = 30;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const maxValue = 36; const minValue = 0;

  const hist = prediction.historicalSeries;
  const fore = prediction.forecastSeries;
  const totalSteps = hist.length + fore.length - 1;

  const histPoints = hist.map((pt, i) => {
    const x = paddingX + (i / totalSteps) * plotWidth;
    const y = height - paddingY - ((pt.value - minValue) / (maxValue - minValue)) * plotHeight;
    return { x, y, pt };
  });

  const histPathD = histPoints.reduce((acc, p, idx) => idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  const foreStartIndex = hist.length - 1;

  const forePoints = fore.map((pt, i) => {
    const x = paddingX + ((foreStartIndex + i) / totalSteps) * plotWidth;
    const y = height - paddingY - ((pt.value - minValue) / (maxValue - minValue)) * plotHeight;
    const yUpper = height - paddingY - ((pt.upperBand - minValue) / (maxValue - minValue)) * plotHeight;
    const yLower = height - paddingY - ((pt.lowerBand - minValue) / (maxValue - minValue)) * plotHeight;
    return { x, y, yUpper, yLower, pt };
  });

  const forePathD = forePoints.reduce((acc, p, idx) => idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  const upperPath = forePoints.map(p => `${p.x} ${p.yUpper}`).join(' L ');
  const lowerPathReversed = [...forePoints].reverse().map(p => `${p.x} ${p.yLower}`).join(' L ');
  const confidencePolygonD = `M ${upperPath} L ${lowerPathReversed} Z`;
  const transitionX = histPoints[histPoints.length - 1].x;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              Predictive Intelligence
            </h1>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider"
              style={{ background: riskBadge.bg, color: riskBadge.fg, border: `1px solid ${riskBadge.border}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: riskBadge.dot }} />
              {riskBadge.label}
            </span>
          </div>
          <p className="font-sans text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
            Queue forecast for next {horizonMinutes} minutes based on live shopper flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl text-xs" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            {[10, 15, 30].map(h => (
              <button
                key={h}
                onClick={() => setHorizonMinutes(h)}
                className="px-3 py-1 rounded-lg font-mono text-xs transition-colors"
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
          <Button onClick={fetchData} variant="outline" size="sm" className="gap-1.5 text-xs font-medium" disabled={isRefreshing}
            style={{ background: 'var(--bg-elevated)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: 'var(--status-warn-bg)', border: '1px solid var(--status-warn-border)' }}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl shrink-0"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--status-warn-border)', color: 'var(--status-warn)' }}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold" style={{ color: 'var(--fg)' }}>
              Queue congestion likely in ~{prediction.timeToThreshold} minutes
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
              Predicted checkout queue:{' '}
              <strong style={{ color: 'var(--status-warn)' }}>{prediction.predictedQueue} people</strong> — without intervention.
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/dashboard/what-if-simulator')}
          variant="primary" size="sm"
          className="shrink-0 gap-1.5 font-medium text-xs"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
        >
          <span>Simulate Fix</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* 2 quick-stat pills */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl flex items-center justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>In Store Now</p>
            <p className="font-serif text-2xl font-bold mt-0.5" style={{ color: 'var(--fg)' }}>
              {storeState.occupancy} <span className="font-sans text-sm font-normal" style={{ color: 'var(--fg-subtle)' }}>shoppers</span>
            </p>
          </div>
          <Users className="w-5 h-5" style={{ color: 'var(--fg-subtle)', opacity: 0.4 }} />
        </div>
        <div className="p-4 rounded-xl flex items-center justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--status-warn)' }}>Checkout Queue</p>
            <p className="font-serif text-2xl font-bold mt-0.5" style={{ color: 'var(--status-warn)' }}>
              {storeState.queueLength} <span className="font-sans text-sm font-normal" style={{ color: 'var(--fg-subtle)' }}>waiting</span>
            </p>
          </div>
          <Activity className="w-5 h-5" style={{ color: 'var(--status-warn)', opacity: 0.5 }} />
        </div>
      </div>

      {/* Forecast Chart */}
      <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--fg)' }} />
              <span>Queue Forecast — Next {horizonMinutes} Minutes</span>
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>
              Solid line: past 30 min · Dashed: predicted trajectory · Shaded: uncertainty range
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <div className="flex items-center gap-1.5" style={{ color: 'var(--fg-muted)' }}>
              <span className="w-3 h-0.5" style={{ background: 'var(--fg)' }} />
              <span>Past</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--status-warn)' }}>
              <span className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: 'var(--status-warn)' }} />
              <span>Forecast</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative w-full overflow-hidden p-4 rounded-xl"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--status-warn)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="var(--status-warn)" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {[0, 10, 20, 30].map(val => {
                const y = height - paddingY - ((val - minValue) / (maxValue - minValue)) * plotHeight;
                return (
                  <g key={val}>
                    <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border)" strokeDasharray="4 4" strokeWidth="1" />
                    <text x={paddingX - 10} y={y + 4} textAnchor="end" fill="var(--fg-subtle)" fontSize="10">{val}</text>
                  </g>
                );
              })}

              {/* Threshold line */}
              {(() => {
                const threshY = height - paddingY - ((15 - minValue) / (maxValue - minValue)) * plotHeight;
                return (
                  <g>
                    <line x1={paddingX} y1={threshY} x2={width - paddingX} y2={threshY}
                      stroke="var(--status-err)" strokeDasharray="6 3" strokeWidth="1.5" opacity="0.85" />
                    <text x={width - paddingX} y={threshY - 6} textAnchor="end" fill="var(--status-err)" fontSize="10">
                      ⚠ Action threshold (15 people)
                    </text>
                  </g>
                );
              })()}

              {/* NOW line */}
              <line x1={transitionX} y1={paddingY} x2={transitionX} y2={height - paddingY}
                stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x={transitionX} y={paddingY - 8} textAnchor="middle" fill="var(--fg)" fontSize="11" fontWeight="bold">NOW</text>

              {/* Confidence band */}
              <motion.path d={confidencePolygonD} fill="url(#forecastAreaGrad)"
                stroke="var(--status-warn)" strokeWidth="1" strokeDasharray="2 2" opacity="0.8"
                initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ duration: 0.8 }}
              />

              {/* Historical line */}
              <motion.path d={histPathD} fill="none" stroke="var(--fg)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }}
              />

              {/* Forecast line */}
              <motion.path d={forePathD} fill="none" stroke="var(--status-warn)" strokeWidth="2.5"
                strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.0, delay: 0.4 }}
              />

              {histPoints.map((p, idx) => (
                <circle key={`hist-${idx}`} cx={p.x} cy={p.y} r="4"
                  fill="var(--fg)" stroke="var(--bg-elevated)" strokeWidth="2" className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint({ label: p.pt.t, value: p.pt.value, type: 'historical' })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {forePoints.map((p, idx) => (
                <circle key={`fore-${idx}`} cx={p.x} cy={p.y} r="4.5"
                  fill="var(--status-warn)" stroke="var(--bg-elevated)" strokeWidth="2" className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint({ label: `+${idx * 3} min`, value: p.pt.value, type: 'forecast', range: `${p.pt.lowerBand}–${p.pt.upperBand}` })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {hoveredPoint && (
              <div className="absolute top-4 right-4 rounded-xl p-3 text-xs space-y-1 shadow-2xl backdrop-blur-md z-30"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              >
                <p className="font-semibold">{hoveredPoint.label}</p>
                <p className="font-mono font-bold">{hoveredPoint.value} people waiting</p>
                {hoveredPoint.range && <p className="font-mono text-[10px]" style={{ color: 'var(--status-warn)' }}>Range: {hoveredPoint.range}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--fg-muted)' }}>
            <Info className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
            <span>Forecast confidence: <strong style={{ color: 'var(--fg)' }}>{prediction.reliability}</strong> · Privacy-safe: no PII collected, centroid-only tracking</span>
          </div>
        </CardContent>
      </Card>

      {/* Drivers + CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader>
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <Activity className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
              <span>Why is congestion building?</span>
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>
              Top factors contributing to the predicted queue escalation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {prediction.drivers.map((driver, idx) => (
              <div key={idx} className="p-3 rounded-xl flex items-center justify-between gap-3"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center"
                    style={{ background: 'var(--accent-subtle)', color: 'var(--accent-fg)' }}
                  >
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'var(--fg)' }}>{driver.label}</span>
                </div>
                {driver.changePercent !== undefined && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md"
                    style={{
                      background: driver.changePercent > 0 ? 'var(--status-err-bg)' : 'var(--status-warn-bg)',
                      color: driver.changePercent > 0 ? 'var(--status-err)' : 'var(--status-warn)',
                      border: `1px solid ${driver.changePercent > 0 ? 'var(--status-err-border)' : 'var(--status-warn-border)'}`,
                    }}
                  >
                    {driver.changePercent > 0 ? `+${driver.changePercent}%` : `${driver.changePercent}%`}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader>
            <CardTitle className="font-serif text-lg" style={{ color: 'var(--fg)' }}>What should I do?</CardTitle>
            <CardDescription className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
              Use the What-If Simulator to test different actions and see how they change the forecast before acting.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={() => navigate('/dashboard/what-if-simulator')} variant="primary"
              className="w-full gap-2 font-medium"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
            >
              <span>Open What-If Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
