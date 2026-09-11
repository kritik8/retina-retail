import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ArrowRight,
  Clock,
  Users,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
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

  useEffect(() => {
    fetchData();
  }, [horizonMinutes]);

  if (loading || !storeState || !prediction) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 rounded-xl w-1/3" style={{ background: 'var(--bg-subtle)' }} />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl" style={{ background: 'var(--bg-subtle)' }} />
          ))}
        </div>
        <div className="h-96 rounded-2xl" style={{ background: 'var(--bg-subtle)' }} />
      </div>
    );
  }

  const getRiskBadge = (risk: CongestionRiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return {
          bg: 'var(--status-err-bg)',
          border: 'var(--status-err-border)',
          fg: 'var(--status-err)',
          dot: 'var(--status-err)',
          label: 'CRITICAL CONGESTION',
        };
      case 'HIGH':
        return {
          bg: 'var(--status-warn-bg)',
          border: 'var(--status-warn-border)',
          fg: 'var(--status-warn)',
          dot: 'var(--status-warn)',
          label: 'HIGH CONGESTION RISK',
        };
      case 'MODERATE':
        return {
          bg: 'var(--status-warn-bg)',
          border: 'var(--status-warn-border)',
          fg: 'var(--status-warn)',
          dot: 'var(--status-warn)',
          label: 'MODERATE RISK',
        };
      case 'NORMAL':
      default:
        return {
          bg: 'var(--status-ok-bg)',
          border: 'var(--status-ok-border)',
          fg: 'var(--status-ok)',
          dot: 'var(--status-ok)',
          label: 'NORMAL STORE FLOW',
        };
    }
  };

  const riskBadge = getRiskBadge(prediction.risk);

  // SVG Chart Calculations
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
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

  const histPathD = histPoints.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const foreStartIndex = hist.length - 1;
  const forePoints = fore.map((pt, i) => {
    const x = paddingX + ((foreStartIndex + i) / totalSteps) * plotWidth;
    const y = height - paddingY - ((pt.value - minValue) / (maxValue - minValue)) * plotHeight;
    const yUpper =
      height - paddingY - ((pt.upperBand - minValue) / (maxValue - minValue)) * plotHeight;
    const yLower =
      height - paddingY - ((pt.lowerBand - minValue) / (maxValue - minValue)) * plotHeight;
    return { x, y, yUpper, yLower, pt };
  });

  const forePathD = forePoints.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const upperPath = forePoints.map((p) => `${p.x} ${p.yUpper}`).join(' L ');
  const lowerPathReversed = [...forePoints]
    .reverse()
    .map((p) => `${p.x} ${p.yLower}`)
    .join(' L ');
  const confidencePolygonD = `M ${upperPath} L ${lowerPathReversed} Z`;

  const transitionX = histPoints[histPoints.length - 1].x;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              Predictive Store Intelligence
            </h1>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: riskBadge.bg,
                color: riskBadge.fg,
                border: `1px solid ${riskBadge.border}`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: riskBadge.dot }}
              />
              {riskBadge.label}
            </span>
          </div>
          <p className="font-sans text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
            Real-time trajectory forecasting and pre-emptive queue bottleneck modeling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex p-1 rounded-xl text-xs"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            {[10, 15, 30].map((h) => (
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
                +{h}m Horizon
              </button>
            ))}
          </div>

          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium"
            disabled={isRefreshing}
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--fg)',
              border: '1px solid var(--border)',
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* 2. Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        style={{
          background: 'var(--status-warn-bg)',
          border: '1px solid var(--status-warn-border)',
        }}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--status-warn-border)',
              color: 'var(--status-warn)',
            }}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              High Congestion Risk Predicted
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded font-bold"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--status-warn-border)',
                  color: 'var(--status-warn)',
                }}
              >
                +7 min to threshold
              </span>
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
              Queue projected to reach{' '}
              <strong style={{ color: 'var(--status-warn)' }}>{prediction.predictedQueue} people</strong> in
              approximately {prediction.timeToThreshold} minutes without intervention.
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/dashboard/bottleneck-diagnosis')}
          variant="primary"
          size="sm"
          className="shrink-0 gap-1.5 font-medium text-xs"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-fg)',
            border: '1px solid var(--accent-hover)',
          }}
        >
          <span>Investigate Bottleneck</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* 3. Current Metrics Row (6 KPI chips) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Occupancy */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardContent className="p-3.5 space-y-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--fg-subtle)' }}>
              Occupancy
              <Users className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
            </span>
            <div className="font-serif text-xl font-bold" style={{ color: 'var(--fg)' }}>
              {storeState.occupancy} <span className="font-sans text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>shoppers</span>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--fg-subtle)' }}>Total in store</p>
          </CardContent>
        </Card>

        {/* Current Queue */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardContent className="p-3.5 space-y-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--status-warn)' }}>
              Live Queue
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--status-warn)' }} />
            </span>
            <div className="font-serif text-xl font-bold" style={{ color: 'var(--status-warn)' }}>
              {storeState.queueLength} <span className="font-sans text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>waiting</span>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--fg-subtle)' }}>Current POS depth</p>
          </CardContent>
        </Card>

        {/* Incoming Rate */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardContent className="p-3.5 space-y-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--fg-subtle)' }}>
              Inflow Rate
              <ArrowDownRight className="w-3.5 h-3.5" style={{ color: 'var(--status-ok)' }} />
            </span>
            <div className="font-serif text-xl font-bold" style={{ color: 'var(--fg)' }}>
              {storeState.incomingRate} <span className="font-sans text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>/min</span>
            </div>
            <p className="font-mono text-[10px] font-medium" style={{ color: 'var(--status-ok)' }}>+31% surge</p>
          </CardContent>
        </Card>

        {/* Outgoing Rate */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardContent className="p-3.5 space-y-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--fg-subtle)' }}>
              Outflow Rate
              <ArrowUpRight className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
            </span>
            <div className="font-serif text-xl font-bold" style={{ color: 'var(--fg)' }}>
              {storeState.outgoingRate} <span className="font-sans text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>/min</span>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--fg-subtle)' }}>Store egress</p>
          </CardContent>
        </Card>

        {/* Service Rate */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardContent className="p-3.5 space-y-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--status-err)' }}>
              Service Rate
              <Activity className="w-3.5 h-3.5" style={{ color: 'var(--status-err)' }} />
            </span>
            <div className="font-serif text-xl font-bold" style={{ color: 'var(--status-err)' }}>
              {storeState.serviceRate} <span className="font-sans text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>/min</span>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--status-err)' }}>1 active counter</p>
          </CardContent>
        </Card>

        {/* Density */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardContent className="p-3.5 space-y-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--fg-subtle)' }}>
              Store Density
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
            </span>
            <div className="font-serif text-xl font-bold" style={{ color: 'var(--fg)' }}>
              {storeState.density}%
            </div>
            <p className="text-[10px]" style={{ color: 'var(--fg-subtle)' }}>Floor saturation</p>
          </CardContent>
        </Card>
      </div>

      {/* 4. Main Forecast Chart with Confidence Band */}
      <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--fg)' }} />
              <span>Queue Depth Trajectory & Predictive Forecast</span>
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>
              Solid line: measured historical queue • Dashed line: multi-step projection with dynamic uncertainty band
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <div className="flex items-center gap-1.5" style={{ color: 'var(--fg-muted)' }}>
              <span className="w-3 h-0.5" style={{ background: 'var(--fg)' }} />
              <span>Historical</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--status-warn)' }}>
              <span className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: 'var(--status-warn)' }} />
              <span>Forecast</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--status-warn)' }}>
              <span className="w-3 h-2 rounded" style={{ background: 'var(--status-warn-bg)', border: '1px solid var(--status-warn-border)' }} />
              <span>Confidence Band</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div
            className="relative w-full overflow-hidden p-4 rounded-xl"
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
            }}
          >
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-64 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--status-warn)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="var(--status-warn)" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 10, 20, 30].map((val) => {
                const y = height - paddingY - ((val - minValue) / (maxValue - minValue)) * plotHeight;
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="var(--border)"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="font-mono text-[10px]"
                      fill="var(--fg-subtle)"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Threshold Line at queue = 15 */}
              {(() => {
                const threshY =
                  height - paddingY - ((15 - minValue) / (maxValue - minValue)) * plotHeight;
                return (
                  <g>
                    <line
                      x1={paddingX}
                      y1={threshY}
                      x2={width - paddingX}
                      y2={threshY}
                      stroke="var(--status-err)"
                      strokeDasharray="6 3"
                      strokeWidth="1.5"
                      opacity="0.85"
                    />
                    <text
                      x={width - paddingX}
                      y={threshY - 6}
                      textAnchor="end"
                      className="font-mono text-[10px] font-semibold"
                      fill="var(--status-err)"
                    >
                      Critical Queue Threshold (15 people)
                    </text>
                  </g>
                );
              })()}

              {/* Transition Divider Line (Now) */}
              <line
                x1={transitionX}
                y1={paddingY}
                x2={transitionX}
                y2={height - paddingY}
                stroke="var(--border-strong)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text
                x={transitionX}
                y={paddingY - 8}
                textAnchor="middle"
                className="font-mono text-[11px] font-bold"
                fill="var(--fg)"
              >
                LIVE NOW (8 people)
              </text>

              {/* Forecast Confidence Band Polygon */}
              <motion.path
                d={confidencePolygonD}
                fill="url(#forecastAreaGrad)"
                stroke="var(--status-warn)"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 0.8 }}
              />

              {/* Historical Solid Line */}
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

              {/* Forecast Dashed Line */}
              <motion.path
                d={forePathD}
                fill="none"
                stroke="var(--status-warn)"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.0, delay: 0.4 }}
              />

              {/* Historical Data Dots */}
              {histPoints.map((p, idx) => (
                <circle
                  key={`hist-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="var(--fg)"
                  stroke="var(--bg-elevated)"
                  strokeWidth="2"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      label: p.pt.t,
                      value: p.pt.value,
                      type: 'historical',
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Forecast Data Dots */}
              {forePoints.map((p, idx) => (
                <circle
                  key={`fore-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill="var(--status-warn)"
                  stroke="var(--bg-elevated)"
                  strokeWidth="2"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      label: `+${idx * 3} min (${p.pt.t})`,
                      value: p.pt.value,
                      type: 'forecast',
                      range: `${p.pt.lowerBand} – ${p.pt.upperBand} people`,
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute top-4 right-4 rounded-xl p-3 text-xs space-y-1 shadow-2xl backdrop-blur-md z-30"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg)',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold" style={{ color: 'var(--fg)' }}>{hoveredPoint.label}</span>
                  <span
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold"
                    style={{
                      background: hoveredPoint.type === 'forecast' ? 'var(--status-warn-bg)' : 'var(--bg-subtle)',
                      color: hoveredPoint.type === 'forecast' ? 'var(--status-warn)' : 'var(--fg-muted)',
                      border: `1px solid ${hoveredPoint.type === 'forecast' ? 'var(--status-warn-border)' : 'var(--border)'}`,
                    }}
                  >
                    {hoveredPoint.type === 'forecast' ? 'Forecast' : 'Observed'}
                  </span>
                </div>
                <div className="font-serif text-base font-bold" style={{ color: 'var(--fg)' }}>
                  {hoveredPoint.value} <span className="font-sans text-xs font-normal" style={{ color: 'var(--fg-muted)' }}>waiting customers</span>
                </div>
                {hoveredPoint.range && (
                  <p className="font-mono text-[10px]" style={{ color: 'var(--status-warn)' }}>
                    Band: {hoveredPoint.range}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Forecast Metadata Footer */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-muted)' }}
          >
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              <span>
                Forecast reliability: <strong style={{ color: 'var(--fg)' }}>{prediction.reliability}</strong> (Inflow vs Service Model)
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span>Model: Retina Flow Imbalance Estimator</span>
              <span>•</span>
              <span style={{ color: 'var(--status-ok)' }}>Zero PII / Track Centroid Aggregation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Contributing Factors & Deep Dive CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contributing Factors Card */}
        <Card className="lg:col-span-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader>
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <Activity className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
              <span>Observed Flow Imbalance Drivers</span>
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>
              Primary factors contributing to the projected queue escalation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {prediction.drivers.map((driver, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl flex items-center justify-between gap-3"
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center"
                    style={{
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent-fg)',
                    }}
                  >
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'var(--fg)' }}>
                    {driver.label}
                  </span>
                </div>

                {driver.changePercent !== undefined && (
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded-md"
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

        {/* Action / Next Step Card */}
        <Card
          className="flex flex-col justify-between"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}
        >
          <CardHeader>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
              Step 2 of Intelligence Chain
            </span>
            <CardTitle className="font-serif text-lg mt-1" style={{ color: 'var(--fg)' }}>
              Automated Bottleneck Diagnosis
            </CardTitle>
            <CardDescription className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
              Pinpoint which zone, register, or aisle is acting as the primary flow impedance.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            <div
              className="p-3.5 rounded-xl space-y-1.5"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
              }}
            >
              <span className="font-mono text-[10px] uppercase font-semibold block" style={{ color: 'var(--fg-subtle)' }}>
                Preliminary Assessment
              </span>
              <p className="text-xs font-medium" style={{ color: 'var(--fg)' }}>
                Checkout register capacity is currently the dominant contributing factor (Score 82).
              </p>
            </div>

            <Button
              onClick={() => navigate('/dashboard/bottleneck-diagnosis')}
              variant="primary"
              className="w-full gap-2 font-medium"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
                border: '1px solid var(--accent-hover)',
              }}
            >
              <span>Investigate Bottleneck</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
