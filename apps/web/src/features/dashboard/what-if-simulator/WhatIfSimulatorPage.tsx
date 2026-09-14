import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  CheckCircle2,
  TrendingDown,
  Activity,
  Check,
  X,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mockIntelligenceService } from '@/services/mock/storeIntelligence';
import { actionLogService } from '@/services/mock/actionLog';
import type { SimulationRequest, SimulationResult, Recommendation } from '@/types';

const INTERVENTIONS: {
  id: SimulationRequest['interventionType'];
  title: string;
  description: string;
  tag: string;
}[] = [
  {
    id: 'add_checkout',
    title: 'Open Additional Checkout',
    description: 'Add billing counter capacity (+2.2 checkouts/min) to clear checkout queues.',
    tag: 'Fastest Fix',
  },
  {
    id: 'increase_staffing',
    title: 'Deploy Floor Staff',
    description: 'Add floor associates to guide and assist customers at checkout queues.',
    tag: 'Operational',
  },
  {
    id: 'redirect_traffic',
    title: 'Redirect Aisle Traffic',
    description: 'Guide shoppers toward secondary pathways away from the checkout bottleneck.',
    tag: 'Traffic Flow',
  },
];

export const WhatIfSimulatorPage: React.FC = () => {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [interventionType, setInterventionType] = useState<SimulationRequest['interventionType']>('add_checkout');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [hoveredTimePoint, setHoveredTimePoint] = useState<{
    t: number;
    baseline: number;
    simulated: number;
  } | null>(null);

  useEffect(() => {
    async function init() {
      const [recRes, initialResult] = await Promise.all([
        mockIntelligenceService.getRecommendation(),
        mockIntelligenceService.runSimulation({ interventionType: 'add_checkout', additionalCounters: 1 }),
      ]);
      setRecommendation(recRes);
      setSimulationResult(initialResult);
    }
    init();
  }, []);

  const handleRunSimulation = async (type = interventionType) => {
    setIsSimulating(true);
    try {
      const result = await mockIntelligenceService.runSimulation({ interventionType: type, additionalCounters: 1 });
      setSimulationResult(result);
    } catch (e) {
      console.error('Simulation error', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyAction = () => {
    if (!simulationResult) return;
    const chosen = INTERVENTIONS.find((i) => i.id === interventionType);
    const actionText = chosen?.title || interventionType;
    const rationale = `Simulated ${simulationResult.queueReductionPercent}% queue reduction — peak drops from ${simulationResult.baseline.peakQueue} to ${simulationResult.simulation.peakQueue} shoppers.`;
    actionLogService.logAction({
      action: actionText,
      rationale,
      interventionType,
      details: { reductionPct: simulationResult.queueReductionPercent },
    });
    setAppliedNotification(`Decision recorded: "${actionText}". Logged to store manager activity log.`);
    setTimeout(() => setAppliedNotification(null), 4000);
  };

  // SVG Chart Geometry
  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingY = 28;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const maxVal = 32;

  const baselinePoints =
    simulationResult?.baseline.timeSeries.map((p) => ({
      x: paddingX + (p.t / 15) * plotWidth,
      y: height - paddingY - (p.value / maxVal) * plotHeight,
      pt: p,
    })) || [];

  const simulatedPoints =
    simulationResult?.simulation.timeSeries.map((p) => ({
      x: paddingX + (p.t / 15) * plotWidth,
      y: height - paddingY - (p.value / maxVal) * plotHeight,
      pt: p,
    })) || [];

  const baselinePathD = baselinePoints.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const simulatedPathD = simulatedPoints.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-32">
      {/* ─── 1. Header (Short header + one-line subtext) ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
            What-If Store Simulator
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
            Test operational counteractions against the store forecast before making changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleRunSimulation(interventionType)}
            disabled={isSimulating}
            variant="primary"
            size="sm"
            className="gap-2 font-semibold text-xs"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Simulating…' : 'Run Simulation'}
          </Button>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {appliedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-3"
            style={{
              background: 'var(--status-ok-bg)',
              borderColor: 'var(--status-ok-border)',
              color: 'var(--status-ok)',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{appliedNotification}</span>
            </div>
            <button onClick={() => setAppliedNotification(null)} className="p-1 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. Headline Metric Strip (Strict 4 headline numbers max) ───────────── */}
      {simulationResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            className="p-3.5 rounded-xl flex flex-col justify-between"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
              Queue Reduction
            </span>
            <div className="flex items-baseline gap-1 mt-1.5 font-serif text-2xl font-bold" style={{ color: 'var(--status-ok)' }}>
              <TrendingDown className="w-5 h-5 inline-block" />
              <span>-{simulationResult.queueReductionPercent}%</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl flex flex-col justify-between"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
              Peak with Intervention
            </span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
                {simulationResult.simulation.peakQueue}
              </span>
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                vs {simulationResult.baseline.peakQueue} baseline
              </span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl flex flex-col justify-between"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
              Threshold (15 People)
            </span>
            <div className="mt-1.5">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold"
                style={{
                  background: simulationResult.thresholdAvoided ? 'var(--status-ok-bg)' : 'var(--status-err-bg)',
                  color: simulationResult.thresholdAvoided ? 'var(--status-ok)' : 'var(--status-err)',
                  border: `1px solid ${simulationResult.thresholdAvoided ? 'var(--status-ok-border)' : 'var(--status-err-border)'}`,
                }}
              >
                {simulationResult.thresholdAvoided ? '✓ BREACH AVOIDED' : '⚠ THRESHOLD EXCEEDED'}
              </span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl flex flex-col justify-between"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
              Intervention State
            </span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="font-serif text-base font-bold truncate" style={{ color: 'var(--accent-fg)' }}>
                {INTERVENTIONS.find((i) => i.id === interventionType)?.tag || 'Active'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. ONE Primary Visualization: No-Action vs With-Action Trajectory ─── */}
      {simulationResult && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: 'var(--fg)' }} />
              <h2 className="font-serif text-base font-bold" style={{ color: 'var(--fg)' }}>
                Simulated Trajectory Comparison (+15m)
              </h2>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px]">
              <div className="flex items-center gap-1.5" style={{ color: 'var(--status-err)' }}>
                <span className="w-3 h-0.5 border-t border-dashed" style={{ borderColor: 'var(--status-err)' }} />
                <span>No Action (Baseline)</span>
              </div>
              <div className="flex items-center gap-1.5" style={{ color: 'var(--status-ok)' }}>
                <span className="w-3 h-0.5 rounded" style={{ background: 'var(--status-ok)' }} />
                <span>With Action</span>
              </div>
              <div className="flex items-center gap-1.5" style={{ color: 'var(--fg-muted)' }}>
                <span className="w-3 h-0.5 border-t border-dashed" style={{ borderColor: 'var(--border)' }} />
                <span>Target (15)</span>
              </div>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full p-3 rounded-xl overflow-hidden" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52 overflow-visible" preserveAspectRatio="none">
              {[0, 10, 20, 30].map((val) => {
                const y = height - paddingY - (val / maxVal) * plotHeight;
                return (
                  <g key={val}>
                    <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
                    <text x={paddingX - 8} y={y + 3} textAnchor="end" fill="var(--fg-muted)" fontSize="9" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Threshold line */}
              {(() => {
                const threshY = height - paddingY - (15 / maxVal) * plotHeight;
                return (
                  <line
                    x1={paddingX}
                    y1={threshY}
                    x2={width - paddingX}
                    y2={threshY}
                    stroke="var(--status-err)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                );
              })()}

              {/* Baseline (No Action) */}
              <motion.path
                d={baselinePathD}
                fill="none"
                stroke="var(--status-err)"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />

              {/* Simulated (With Action) */}
              <motion.path
                d={simulatedPathD}
                fill="none"
                stroke="var(--status-ok)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.0 }}
              />

              {simulatedPoints.map((p, idx) => {
                const bPoint = baselinePoints[idx];
                return (
                  <circle
                    key={`sim-${idx}`}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="var(--status-ok)"
                    stroke="var(--bg-elevated)"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredTimePoint({ t: p.pt.t, baseline: bPoint?.pt.value || 0, simulated: p.pt.value })}
                    onMouseLeave={() => setHoveredTimePoint(null)}
                  />
                );
              })}
            </svg>

            {hoveredTimePoint && (
              <div
                className="absolute top-3 right-4 rounded-xl px-3 py-2 text-xs space-y-1 shadow-xl backdrop-blur-md z-30"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              >
                <p className="font-semibold font-mono text-[11px]">+{hoveredTimePoint.t} min from now</p>
                <div className="flex items-center gap-4 font-mono text-xs">
                  <span style={{ color: 'var(--status-err)' }}>No action: {hoveredTimePoint.baseline}</span>
                  <span className="font-bold" style={{ color: 'var(--status-ok)' }}>
                    With action: {hoveredTimePoint.simulated}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between text-[10px] font-mono pt-2 px-2" style={{ color: 'var(--fg-muted)' }}>
            <span>Now</span>
            <span>+5 min</span>
            <span>+10 min</span>
            <span>+15 min</span>
          </div>

          {/* ─── 4. Compact Horizontal Intervention Selector ────────────────────── */}
          <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
                Test Interventions:
              </span>
              {INTERVENTIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setInterventionType(item.id);
                    handleRunSimulation(item.id);
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: interventionType === item.id ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                    color: interventionType === item.id ? 'var(--accent-fg)' : 'var(--fg)',
                    border: `1px solid ${interventionType === item.id ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  <span>{item.title}</span>
                  <span className="ml-1.5 font-mono text-[10px] opacity-75">({item.tag})</span>
                </button>
              ))}
            </div>

            <span className="font-mono text-[11px]" style={{ color: 'var(--fg-muted)' }}>
              Assumed throughput: +2.2/min
            </span>
          </div>
        </div>
      )}

      {/* ─── 5. Secondary / Detailed Time-Step Table (Collapsible) ─────────────── */}
      {simulationResult && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <button
            onClick={() => setShowTable(!showTable)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium transition-colors"
            style={{ background: 'var(--bg-elevated)', color: 'var(--fg)' }}
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
              <span>{showTable ? 'Hide +5m, +10m & Peak Breakdown' : 'Show +5m, +10m & Peak Breakdown'}</span>
            </span>
            {showTable ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
          </button>

          <AnimatePresence>
            {showTable && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 border-t overflow-x-auto"
                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
              >
                <table className="w-full font-mono text-xs text-left">
                  <thead>
                    <tr className="text-[10px] uppercase text-zinc-500 border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="pb-2">Horizon Point</th>
                      <th className="pb-2">No Action (Baseline)</th>
                      <th className="pb-2">With Action (Simulated)</th>
                      <th className="pb-2">Reduction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    <tr>
                      <td className="py-2.5 font-semibold">+5 Minutes</td>
                      <td className="py-2.5" style={{ color: 'var(--status-err)' }}>14 shoppers</td>
                      <td className="py-2.5" style={{ color: 'var(--status-ok)' }}>7 shoppers</td>
                      <td className="py-2.5 font-bold" style={{ color: 'var(--status-ok)' }}>-50%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold">+10 Minutes</td>
                      <td className="py-2.5" style={{ color: 'var(--status-err)' }}>21 shoppers</td>
                      <td className="py-2.5" style={{ color: 'var(--status-ok)' }}>8 shoppers</td>
                      <td className="py-2.5 font-bold" style={{ color: 'var(--status-ok)' }}>-62%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold">Peak Projected</td>
                      <td className="py-2.5 font-bold" style={{ color: 'var(--status-err)' }}>
                        {simulationResult.baseline.peakQueue} shoppers
                      </td>
                      <td className="py-2.5 font-bold" style={{ color: 'var(--status-ok)' }}>
                        {simulationResult.simulation.peakQueue} shoppers
                      </td>
                      <td className="py-2.5 font-bold" style={{ color: 'var(--status-ok)' }}>
                        -{simulationResult.queueReductionPercent}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
            style={{ background: 'var(--status-ok-bg)', border: '1px solid var(--status-ok-border)', color: 'var(--status-ok)' }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                style={{ background: 'var(--status-ok-bg)', color: 'var(--status-ok)', border: '1px solid var(--status-ok-border)' }}
              >
                RECOMMENDED ACTION
              </span>
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Decision logging only · No physical control
              </span>
            </div>
            <h3 className="font-serif text-base font-bold mt-1.5" style={{ color: 'var(--fg)' }}>
              {recommendation?.action || 'Open An Additional Checkout Counter'}
            </h3>
            <p className="text-xs mt-0.5 max-w-xl" style={{ color: 'var(--fg-muted)' }}>
              {recommendation?.rationale ||
                'Opening one counter immediately drops peak queue below the critical 15-person threshold.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <Button
            onClick={() => setAppliedNotification('Recommendation dismissed.')}
            variant="outline"
            size="sm"
            className="w-full md:w-auto text-xs"
            style={{ background: 'var(--bg-elevated)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
          >
            Dismiss
          </Button>

          <Button
            onClick={handleApplyAction}
            variant="primary"
            size="sm"
            className="w-full md:w-auto gap-1.5 text-xs font-semibold"
            style={{ background: 'var(--status-ok)', color: '#ffffff' }}
          >
            <Check className="w-4 h-4" />
            <span>Apply Action</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
