import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Activity,
  Check,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockIntelligenceService } from '@/services/mock/storeIntelligence';
import { actionLogService } from '@/services/mock/actionLog';
import type { SimulationRequest, SimulationResult, Recommendation } from '@/types';

// Simplified intervention options — no counter/cashier counts, no service rate math
const INTERVENTIONS: { id: SimulationRequest['interventionType']; title: string; description: string; tag: string }[] = [
  {
    id: 'add_checkout',
    title: 'Open Another Checkout',
    description: 'Open an additional billing counter to increase throughput and clear the queue faster.',
    tag: 'Fastest Fix',
  },
  {
    id: 'increase_staffing',
    title: 'Add Floor Staff',
    description: 'Deploy extra staff to assist shoppers and speed up the checkout process.',
    tag: 'Easy Deploy',
  },
  {
    id: 'redirect_traffic',
    title: 'Redirect Aisle Shoppers',
    description: 'Guide aisle shoppers toward uncongested areas to reduce checkout arrivals temporarily.',
    tag: 'Spatial',
  },
];

export const WhatIfSimulatorPage: React.FC = () => {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [interventionType, setInterventionType] = useState<SimulationRequest['interventionType']>('add_checkout');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);
  const [hoveredTimePoint, setHoveredTimePoint] = useState<{ t: number; baseline: number; simulated: number } | null>(null);

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

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const result = await mockIntelligenceService.runSimulation({ interventionType, additionalCounters: 1 });
      setSimulationResult(result);
    } catch (e) {
      console.error('Simulation error', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyAction = () => {
    if (!simulationResult) return;
    const chosen = INTERVENTIONS.find(i => i.id === interventionType);
    const actionText = chosen?.title || interventionType;
    const rationale = `Simulated ${simulationResult.queueReductionPercent}% queue reduction — peak drops from ${simulationResult.baseline.peakQueue} to ${simulationResult.simulation.peakQueue} shoppers.`;
    actionLogService.logAction({ action: actionText, rationale, interventionType, details: { reductionPct: simulationResult.queueReductionPercent } });
    setAppliedNotification(`Logged: "${actionText}". Recorded to management decision log.`);
    setTimeout(() => setAppliedNotification(null), 4000);
  };

  // SVG Chart
  const width = 800; const height = 220;
  const paddingX = 40; const paddingY = 30;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const maxVal = 32;

  const baselinePoints = simulationResult?.baseline.timeSeries.map(p => ({
    x: paddingX + (p.t / 15) * plotWidth,
    y: height - paddingY - (p.value / maxVal) * plotHeight,
    pt: p,
  })) || [];

  const simulatedPoints = simulationResult?.simulation.timeSeries.map(p => ({
    x: paddingX + (p.t / 15) * plotWidth,
    y: height - paddingY - (p.value / maxVal) * plotHeight,
    pt: p,
  })) || [];

  const baselinePathD = baselinePoints.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  const simulatedPathD = simulatedPoints.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
            What-If Simulator
          </h1>
          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent-fg)', border: '1px solid var(--accent-border)' }}
          >
            <FlaskConical className="w-3 h-3" /> Decision Support
          </span>
        </div>
        <p className="font-sans text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
          Pick an action, simulate it, and see how the queue changes before you act.
        </p>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {appliedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3"
            style={{ background: 'var(--status-ok-bg)', borderColor: 'var(--status-ok-border)', color: 'var(--status-ok)', borderWidth: 1, borderStyle: 'solid' }}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{appliedNotification}</span>
            </div>
            <button onClick={() => setAppliedNotification(null)}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intervention picker + action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Intervention Options */}
        <div className="lg:col-span-2 space-y-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
            Choose an action to simulate:
          </p>
          <div className="space-y-2">
            {INTERVENTIONS.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setInterventionType(item.id)}
                className="w-full p-4 rounded-xl border text-left transition-all"
                style={{
                  background: interventionType === item.id ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                  borderColor: interventionType === item.id ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>{item.title}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold"
                    style={{ background: 'var(--status-ok-bg)', color: 'var(--status-ok)', border: '1px solid var(--status-ok-border)' }}
                  >
                    {item.tag}
                  </span>
                </div>
                <p className="text-[12px] mt-1" style={{ color: 'var(--fg-muted)' }}>{item.description}</p>
              </button>
            ))}
          </div>

          <Button onClick={handleRunSimulation} disabled={isSimulating} variant="primary" className="w-full gap-2 font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
          >
            <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Calculating…' : 'Run Simulation'}
          </Button>
        </div>

        {/* AI Recommendation */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader className="pb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--status-ok)' }}>
              AI Recommendation
            </span>
            <CardTitle className="font-serif text-base mt-1" style={{ color: 'var(--fg)' }}>
              {recommendation?.action || 'Open an additional checkout'}
            </CardTitle>
            <CardDescription className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
              {recommendation?.rationale}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <p className="text-[11px] p-3 rounded-lg" style={{ background: 'var(--bg-subtle)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
              Applying logs your decision. It does not trigger any physical action automatically.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleApplyAction} variant="primary" className="flex-1 text-xs font-semibold gap-1.5"
                style={{ background: 'var(--status-ok)', color: '#ffffff' }}
              >
                <Check className="w-4 h-4" /> Apply Action
              </Button>
              <Button onClick={() => setAppliedNotification('Dismissed.')} variant="outline" className="text-xs gap-1"
                style={{ background: 'var(--bg-subtle)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Results */}
      {simulationResult && (
        <div className="space-y-5">
          {/* 3 result stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl space-y-1" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>Queue Reduction</p>
              <p className="font-serif text-2xl font-bold flex items-center gap-1" style={{ color: 'var(--status-ok)' }}>
                <TrendingDown className="w-5 h-5" />-{simulationResult.queueReductionPercent}%
              </p>
              <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>Peak depth</p>
            </div>
            <div className="p-4 rounded-xl space-y-1" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>After Action</p>
              <p className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
                {simulationResult.simulation.peakQueue}
                <span className="font-sans text-xs font-normal ml-1" style={{ color: 'var(--fg-subtle)' }}>people</span>
              </p>
              <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>vs {simulationResult.baseline.peakQueue} without action</p>
            </div>
            <div className="p-4 rounded-xl space-y-1" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>Critical Threshold</p>
              <p className="font-serif text-2xl font-bold flex items-center gap-1.5">
                {simulationResult.thresholdAvoided
                  ? <span className="flex items-center gap-1" style={{ color: 'var(--status-ok)' }}><CheckCircle2 className="w-5 h-5" />Avoided</span>
                  : <span className="flex items-center gap-1" style={{ color: 'var(--status-err)' }}><XCircle className="w-5 h-5" />Breached</span>
                }
              </p>
              <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>Target: under 15 shoppers</p>
            </div>
          </div>

          {/* Chart */}
          <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                  <Activity className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
                  Queue Trajectory: No Action vs With Action
                </CardTitle>
                <CardDescription style={{ color: 'var(--fg-muted)' }}>
                  Red = no action · Green = with your chosen action
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <div className="flex items-center gap-1.5" style={{ color: 'var(--status-err)' }}>
                  <span className="w-3 h-0.5" style={{ background: 'var(--status-err)' }} /> No Action
                </div>
                <div className="flex items-center gap-1.5" style={{ color: 'var(--status-ok)' }}>
                  <span className="w-3 h-0.5" style={{ background: 'var(--status-ok)' }} /> With Action
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-full p-4 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52 overflow-visible" preserveAspectRatio="none">
                  {[0, 10, 20, 30].map(val => {
                    const y = height - paddingY - (val / maxVal) * plotHeight;
                    return (
                      <g key={val}>
                        <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border)" strokeDasharray="4 4" />
                        <text x={paddingX - 10} y={y + 4} textAnchor="end" fill="var(--fg-subtle)" fontSize="10">{val}</text>
                      </g>
                    );
                  })}

                  {/* Threshold */}
                  {(() => {
                    const threshY = height - paddingY - (15 / maxVal) * plotHeight;
                    return <line x1={paddingX} y1={threshY} x2={width - paddingX} y2={threshY}
                      stroke="var(--status-err)" strokeDasharray="4 4" strokeWidth="1" opacity="0.6" />;
                  })()}

                  <motion.path d={baselinePathD} fill="none" stroke="var(--status-err)" strokeWidth="2.5"
                    strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }}
                  />
                  <motion.path d={simulatedPathD} fill="none" stroke="var(--status-ok)" strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.0 }}
                  />

                  {simulatedPoints.map((p, idx) => {
                    const bPoint = baselinePoints[idx];
                    return (
                      <circle key={`sim-${idx}`} cx={p.x} cy={p.y} r="4"
                        fill="var(--status-ok)" stroke="var(--bg-elevated)" strokeWidth="2" className="cursor-pointer"
                        onMouseEnter={() => setHoveredTimePoint({ t: p.pt.t, baseline: bPoint?.pt.value || 0, simulated: p.pt.value })}
                        onMouseLeave={() => setHoveredTimePoint(null)}
                      />
                    );
                  })}
                </svg>

                {hoveredTimePoint && (
                  <div className="absolute top-3 right-4 rounded-xl p-3 text-xs space-y-1 shadow-2xl backdrop-blur-md z-30"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                  >
                    <p className="font-semibold font-mono">+{hoveredTimePoint.t} min from now</p>
                    <div className="flex items-center gap-4 font-mono">
                      <span style={{ color: 'var(--status-err)' }}>No action: {hoveredTimePoint.baseline}</span>
                      <span className="font-bold" style={{ color: 'var(--status-ok)' }}>With action: {hoveredTimePoint.simulated}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[11px] font-mono pt-2 px-2" style={{ color: 'var(--fg-subtle)' }}>
                <span>Now</span><span>+5 min</span><span>+10 min</span><span>+15 min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
