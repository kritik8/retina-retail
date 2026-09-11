import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  TrendingDown,
  ShieldCheck,
  Zap,
  Activity,
  Check,
  X,
  History,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockIntelligenceService } from '@/services/mock/storeIntelligence';
import { actionLogService } from '@/services/mock/actionLog';
import type {
  StoreState,
  SimulationRequest,
  SimulationResult,
  Recommendation,
  InterventionLogEntry,
} from '@/types';

export const WhatIfSimulatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // State
  const [storeState, setStoreState] = useState<StoreState | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [interventionType, setInterventionType] =
    useState<SimulationRequest['interventionType']>('add_checkout');
  const [additionalCounters, setAdditionalCounters] = useState<1 | 2 | 3>(1);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<InterventionLogEntry[]>([]);
  const [hoveredTimePoint, setHoveredTimePoint] = useState<{
    t: number;
    baseline: number;
    simulated: number;
  } | null>(null);

  useEffect(() => {
    async function init() {
      const [stateRes, recRes] = await Promise.all([
        mockIntelligenceService.getStoreState(),
        mockIntelligenceService.getRecommendation(),
      ]);
      setStoreState(stateRes);
      setRecommendation(recRes);
      setRecentLogs(actionLogService.getLogs());

      const preset = searchParams.get('preset');
      const initialType: SimulationRequest['interventionType'] =
        preset === 'checkout' ? 'add_checkout' : 'add_checkout';
      setInterventionType(initialType);

      // Initial simulation run with preset or default
      const initialReq: SimulationRequest = {
        interventionType: initialType,
        additionalCounters: 1,
      };
      const initialResult = await mockIntelligenceService.runSimulation(initialReq);
      setSimulationResult(initialResult);
    }

    init();
  }, [searchParams]);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const result = await mockIntelligenceService.runSimulation({
        interventionType,
        additionalCounters: interventionType === 'add_checkout' ? additionalCounters : undefined,
      });
      setSimulationResult(result);
    } catch (e) {
      console.error('Simulation error', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyAction = () => {
    if (!simulationResult) return;

    const actionText =
      interventionType === 'add_checkout'
        ? `Open ${additionalCounters} Additional Checkout Counter(s)`
        : interventionType === 'increase_staffing'
        ? 'Deploy Floor Staff to Expedite Packing'
        : interventionType === 'redirect_checkout'
        ? 'Direct Incoming Customers to Express Counter 4'
        : 'Reroute Aisle 3 Traffic Flow';

    const rationale = `Simulated ${simulationResult.queueReductionPercent}% queue reduction, reducing peak from ${simulationResult.baseline.peakQueue} to ${simulationResult.simulation.peakQueue} shoppers.`;

    actionLogService.logAction({
      action: actionText,
      rationale,
      interventionType,
      details: {
        counters: additionalCounters,
        reductionPct: simulationResult.queueReductionPercent,
        simulatedCapacity: simulationResult.simulatedCapacity,
      },
    });

    setRecentLogs(actionLogService.getLogs());
    setAppliedNotification(
      `Decision logged: "${actionText}". Recorded to management decision log.`
    );

    setTimeout(() => {
      setAppliedNotification(null);
    }, 4500);
  };

  const handleDismiss = () => {
    setAppliedNotification('Intervention dismissed without applying action.');
    setTimeout(() => {
      setAppliedNotification(null);
    }, 3000);
  };

  // SVG Chart Setup
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const maxVal = 32;

  const baselinePoints =
    simulationResult?.baseline.timeSeries.map((p) => {
      const x = paddingX + (p.t / 15) * plotWidth;
      const y = height - paddingY - (p.value / maxVal) * plotHeight;
      return { x, y, pt: p };
    }) || [];

  const simulatedPoints =
    simulationResult?.simulation.timeSeries.map((p) => {
      const x = paddingX + (p.t / 15) * plotWidth;
      const y = height - paddingY - (p.value / maxVal) * plotHeight;
      return { x, y, pt: p };
    }) || [];

  const baselinePathD = baselinePoints.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const simulatedPathD = simulatedPoints.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  // Helper values for comparisons table
  const baselineAt5 = simulationResult?.baseline.timeSeries.find((p) => p.t >= 4)?.value || 14;
  const baselineAt10 = simulationResult?.baseline.timeSeries.find((p) => p.t >= 10)?.value || 21;
  const simAt5 = simulationResult?.simulation.timeSeries.find((p) => p.t >= 4)?.value || 8;
  const simAt10 = simulationResult?.simulation.timeSeries.find((p) => p.t >= 10)?.value || 4;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
            What-If Store Simulator
          </h1>
          <span
            className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
            style={{
              background: 'var(--accent-subtle)',
              color: 'var(--accent-fg)',
              border: '1px solid var(--accent-border)',
            }}
          >
            <FlaskConical className="w-3 h-3" /> Decision Support
          </span>
        </div>
        <p className="font-sans text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
          Test operational decisions against the current store forecast before taking action.
        </p>
      </div>

      {/* 2. Notification Banner (if action applied) */}
      <AnimatePresence>
        {appliedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3 shadow-lg"
            style={{
              background: 'var(--status-ok-bg)',
              borderColor: 'var(--status-ok-border)',
              color: 'var(--status-ok)',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{appliedNotification}</span>
            </div>
            <button
              onClick={() => setAppliedNotification(null)}
              className="hover:opacity-75"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Current State Summary Strip */}
      {storeState && (
        <div
          className="p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
              Baseline State:
            </span>
            <div>
              <span style={{ color: 'var(--fg-muted)' }}>Live Queue: </span>
              <strong className="font-mono font-bold" style={{ color: 'var(--status-warn)' }}>{storeState.queueLength} customers</strong>
            </div>
            <div>
              <span style={{ color: 'var(--fg-muted)' }}>Arrival Flow: </span>
              <strong className="font-mono font-bold" style={{ color: 'var(--fg)' }}>{storeState.incomingRate}/min</strong>
            </div>
            <div>
              <span style={{ color: 'var(--fg-muted)' }}>Base Service Capacity: </span>
              <strong className="font-mono font-bold" style={{ color: 'var(--fg)' }}>{storeState.serviceRate}/min</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--status-err)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--status-err)' }} />
            <span>Unmitigated Peak: 28 customers in 15m</span>
          </div>
        </div>
      )}

      {/* 4. Intervention Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Intervention Selection Controls */}
        <Card className="lg:col-span-8" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <Zap className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
              <span>Select Intervention Model</span>
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>
              Choose an operational action to evaluate against the store forecast
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* 4 Intervention Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Add Checkout */}
              <button
                type="button"
                onClick={() => setInterventionType('add_checkout')}
                className="p-3.5 rounded-xl border text-left transition-all"
                style={{
                  background: interventionType === 'add_checkout' ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                  borderColor: interventionType === 'add_checkout' ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--fg)' }}>
                    Open Additional Checkout
                  </span>
                  <span
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold"
                    style={{
                      background: 'var(--status-ok-bg)',
                      color: 'var(--status-ok)',
                      border: '1px solid var(--status-ok-border)',
                    }}
                  >
                    Primary Fix
                  </span>
                </div>
                <p className="text-[11px] mt-1 leading-tight" style={{ color: 'var(--fg-muted)' }}>
                  Open 1–3 additional registers to increase checkout processing throughput.
                </p>
              </button>

              {/* Option 2: Increase Staffing */}
              <button
                type="button"
                onClick={() => setInterventionType('increase_staffing')}
                className="p-3.5 rounded-xl border text-left transition-all"
                style={{
                  background: interventionType === 'increase_staffing' ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                  borderColor: interventionType === 'increase_staffing' ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--fg)' }}>
                    Increase Checkout Staffing
                  </span>
                  <span
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--fg-subtle)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Dual Cashier
                  </span>
                </div>
                <p className="text-[11px] mt-1 leading-tight" style={{ color: 'var(--fg-muted)' }}>
                  Assign bagger/assistant to existing register to speed up item scan rate.
                </p>
              </button>

              {/* Option 3: Redirect Checkout */}
              <button
                type="button"
                onClick={() => setInterventionType('redirect_checkout')}
                className="p-3.5 rounded-xl border text-left transition-all"
                style={{
                  background: interventionType === 'redirect_checkout' ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                  borderColor: interventionType === 'redirect_checkout' ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--fg)' }}>
                    Redirect to Express POS
                  </span>
                  <span
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--fg-subtle)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Load Balance
                  </span>
                </div>
                <p className="text-[11px] mt-1 leading-tight" style={{ color: 'var(--fg-muted)' }}>
                  Prompt waiting baskets (&lt;5 items) towards under-utilized Counter 4.
                </p>
              </button>

              {/* Option 4: Redirect Traffic */}
              <button
                type="button"
                onClick={() => setInterventionType('redirect_traffic')}
                className="p-3.5 rounded-xl border text-left transition-all"
                style={{
                  background: interventionType === 'redirect_traffic' ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                  borderColor: interventionType === 'redirect_traffic' ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--fg)' }}>
                    Reroute Aisle Inflow
                  </span>
                  <span
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--fg-subtle)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Spatial
                  </span>
                </div>
                <p className="text-[11px] mt-1 leading-tight" style={{ color: 'var(--fg-muted)' }}>
                  Divert aisle shoppers towards outer perimeter to slow queue arrival rate.
                </p>
              </button>
            </div>

            {/* Additional parameters for 'add_checkout' */}
            {interventionType === 'add_checkout' ? (
              <div
                className="p-4 rounded-xl space-y-3"
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>
                    Number of Additional Counters to Open:
                  </span>
                  <div className="flex gap-2">
                    {([1, 2, 3] as const).map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setAdditionalCounters(count)}
                        className="w-9 h-9 rounded-lg font-mono text-xs font-bold transition-all"
                        style={{
                          background: additionalCounters === count ? 'var(--accent)' : 'var(--bg-elevated)',
                          color: additionalCounters === count ? 'var(--accent-fg)' : 'var(--fg)',
                          border: `1px solid ${additionalCounters === count ? 'var(--accent-hover)' : 'var(--border)'}`,
                        }}
                      >
                        +{count}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="text-xs font-mono flex items-center justify-between pt-2"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-muted)' }}
                >
                  <span>Capacity Math:</span>
                  <span>
                    Current 3.1/min + ({additionalCounters} × 2.2/min) ={' '}
                    <strong className="font-bold" style={{ color: 'var(--fg)' }}>
                      {(3.1 + additionalCounters * 2.2).toFixed(1)} checkouts/min
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="p-3 rounded-xl text-xs flex items-center gap-2"
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg-muted)',
                }}
              >
                <Info className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <span>Standard parametric throughput adjustment applied for this intervention type.</span>
              </div>
            )}

            <Button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              variant="primary"
              className="w-full gap-2 font-semibold"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
                border: '1px solid var(--accent-hover)',
              }}
            >
              <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Calculating Trajectory...' : 'Run Simulation Model'}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Action Decision Block */}
        <Card
          className="lg:col-span-4 flex flex-col justify-between"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}
        >
          <CardHeader className="pb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--status-ok)' }}>
              <ShieldCheck className="w-3.5 h-3.5" /> Recommended Operational Action
            </span>
            <CardTitle className="font-serif text-base mt-1" style={{ color: 'var(--fg)' }}>
              {recommendation?.action || 'Open Counter 2 (Main POS)'}
            </CardTitle>
            <CardDescription className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
              {recommendation?.rationale}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            <div
              className="p-3 rounded-xl text-[11px] leading-snug"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--fg-muted)',
              }}
            >
              <strong className="block mb-1 font-semibold" style={{ color: 'var(--status-ok)' }}>Human-in-the-Loop Safeguard:</strong>
              Applying this action only records manager intent to the operational log. It does not trigger any physical hardware.
            </div>

            <div className="flex gap-2.5">
              <Button
                onClick={handleApplyAction}
                variant="primary"
                className="flex-1 text-xs font-semibold gap-1.5"
                style={{
                  background: 'var(--status-ok)',
                  color: '#ffffff',
                }}
              >
                <Check className="w-4 h-4" />
                <span>Apply Action</span>
              </Button>

              <Button
                onClick={handleDismiss}
                variant="outline"
                className="text-xs gap-1"
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--fg-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <X className="w-3.5 h-3.5" />
                <span>Dismiss</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Simulation Results Section */}
      {simulationResult && (
        <div className="space-y-6">
          {/* Summary Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <CardContent className="p-4 space-y-1">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
                  Queue Reduction
                </span>
                <div className="font-serif text-2xl font-bold flex items-center gap-1.5" style={{ color: 'var(--status-ok)' }}>
                  <TrendingDown className="w-5 h-5" />
                  <span>-{simulationResult.queueReductionPercent}%</span>
                </div>
                <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>Peak depth reduction</p>
              </CardContent>
            </Card>

            <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <CardContent className="p-4 space-y-1">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
                  Simulated Peak Queue
                </span>
                <div className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
                  {simulationResult.simulation.peakQueue}{' '}
                  <span className="font-sans text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>vs 28 baseline</span>
                </div>
                <p className="text-[11px] font-medium" style={{ color: 'var(--status-ok)' }}>Contained below limit</p>
              </CardContent>
            </Card>

            <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <CardContent className="p-4 space-y-1">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
                  Critical Threshold
                </span>
                <div className="font-serif text-2xl font-bold flex items-center gap-1.5">
                  {simulationResult.thresholdAvoided ? (
                    <span className="flex items-center gap-1" style={{ color: 'var(--status-ok)' }}>
                      <CheckCircle2 className="w-5 h-5" /> Avoided
                    </span>
                  ) : (
                    <span className="flex items-center gap-1" style={{ color: 'var(--status-err)' }}>
                      <XCircle className="w-5 h-5" /> Breached
                    </span>
                  )}
                </div>
                <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>Target &lt; 15 shoppers</p>
              </CardContent>
            </Card>

            <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <CardContent className="p-4 space-y-1">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
                  Simulated Capacity
                </span>
                <div className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
                  {simulationResult.simulatedCapacity}{' '}
                  <span className="font-sans text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>/min</span>
                </div>
                <p className="font-mono text-[11px]" style={{ color: 'var(--status-ok)' }}>
                  +{(simulationResult.simulatedCapacity - simulationResult.baseCapacity).toFixed(1)} added throughput
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dual Line Comparison Chart & Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Dual Line Chart */}
            <Card className="lg:col-span-8" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                    <Activity className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
                    <span>No Action vs With Action Trajectory Comparison</span>
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--fg-muted)' }}>
                    Red line: no action baseline trajectory • Green line: projected trajectory with intervention
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--status-err)' }}>
                    <span className="w-3 h-0.5" style={{ background: 'var(--status-err)' }} />
                    <span>No Action Baseline</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--status-ok)' }}>
                    <span className="w-3 h-0.5" style={{ background: 'var(--status-ok)' }} />
                    <span>With Intervention</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div
                  className="relative w-full overflow-hidden p-4 rounded-xl"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-56 overflow-visible"
                    preserveAspectRatio="none"
                  >
                    {/* Horizontal Grid lines */}
                    {[0, 10, 20, 30].map((val) => {
                      const y = height - paddingY - (val / maxVal) * plotHeight;
                      return (
                        <g key={val}>
                          <line
                            x1={paddingX}
                            y1={y}
                            x2={width - paddingX}
                            y2={y}
                            stroke="var(--border)"
                            strokeDasharray="4 4"
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

                    {/* Critical Threshold Line (15) */}
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
                          opacity="0.6"
                        />
                      );
                    })()}

                    {/* Baseline Line (Red) */}
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

                    {/* Simulated Intervention Line (Emerald Green) */}
                    <motion.path
                      d={simulatedPathD}
                      fill="none"
                      stroke="var(--status-ok)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.0 }}
                    />

                    {/* Interactive dots on simulated line */}
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
                          className="cursor-pointer hover:scale-125 transition-transform"
                          onMouseEnter={() =>
                            setHoveredTimePoint({
                              t: p.pt.t,
                              baseline: bPoint ? bPoint.pt.value : 0,
                              simulated: p.pt.value,
                            })
                          }
                          onMouseLeave={() => setHoveredTimePoint(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Tooltip */}
                  {hoveredTimePoint && (
                    <div
                      className="absolute top-3 right-4 rounded-xl p-3 text-xs space-y-1 shadow-2xl backdrop-blur-md z-30"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--fg)',
                      }}
                    >
                      <p className="font-semibold font-mono" style={{ color: 'var(--fg-muted)' }}>
                        +{hoveredTimePoint.t} minutes from now
                      </p>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span style={{ color: 'var(--status-err)' }}>Baseline: {hoveredTimePoint.baseline}</span>
                        <span className="font-bold" style={{ color: 'var(--status-ok)' }}>
                          Simulated: {hoveredTimePoint.simulated}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* X-axis time marks */}
                <div className="flex justify-between text-[11px] font-mono pt-2 px-2" style={{ color: 'var(--fg-subtle)' }}>
                  <span>Now (+0m)</span>
                  <span>+4 min</span>
                  <span>+8 min</span>
                  <span>+12 min</span>
                  <span>+15 min (Peak Horizon)</span>
                </div>
              </CardContent>
            </Card>

            {/* Results Comparison Table & Recent Log */}
            <div className="lg:col-span-4 space-y-6">
              {/* Comparison Table */}
              <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-sm" style={{ color: 'var(--fg)' }}>
                    Projection Comparison Table
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-xs">
                    <thead>
                      <tr
                        className="font-mono text-[10px] uppercase tracking-wider"
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: 'var(--bg-subtle)',
                          color: 'var(--fg-subtle)',
                        }}
                      >
                        <th className="text-left p-3 font-semibold">Horizon</th>
                        <th className="text-center p-3 font-semibold" style={{ color: 'var(--status-err)' }}>No Action</th>
                        <th className="text-center p-3 font-semibold" style={{ color: 'var(--status-ok)' }}>With Action</th>
                        <th className="text-right p-3 font-semibold">Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="p-3 font-medium" style={{ color: 'var(--fg)' }}>+5 Minutes</td>
                        <td className="p-3 text-center font-mono" style={{ color: 'var(--status-err)' }}>{baselineAt5}</td>
                        <td className="p-3 text-center font-mono font-bold" style={{ color: 'var(--status-ok)' }}>{simAt5}</td>
                        <td className="p-3 text-right font-mono font-semibold" style={{ color: 'var(--status-ok)' }}>
                          -{baselineAt5 - simAt5}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="p-3 font-medium" style={{ color: 'var(--fg)' }}>+10 Minutes</td>
                        <td className="p-3 text-center font-mono" style={{ color: 'var(--status-err)' }}>{baselineAt10}</td>
                        <td className="p-3 text-center font-mono font-bold" style={{ color: 'var(--status-ok)' }}>{simAt10}</td>
                        <td className="p-3 text-right font-mono font-semibold" style={{ color: 'var(--status-ok)' }}>
                          -{baselineAt10 - simAt10}
                        </td>
                      </tr>
                      <tr style={{ background: 'var(--bg-subtle)' }}>
                        <td className="p-3 font-bold" style={{ color: 'var(--fg)' }}>Peak Load</td>
                        <td className="p-3 text-center font-mono font-bold" style={{ color: 'var(--status-err)' }}>
                          {simulationResult.baseline.peakQueue}
                        </td>
                        <td className="p-3 text-center font-mono font-bold" style={{ color: 'var(--status-ok)' }}>
                          {simulationResult.simulation.peakQueue}
                        </td>
                        <td className="p-3 text-right font-mono font-bold" style={{ color: 'var(--status-ok)' }}>
                          -{simulationResult.baseline.peakQueue - simulationResult.simulation.peakQueue}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Decision Log History Strip */}
              <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-sm flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                    <History className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
                    <span>Manager Decision Log (Local Mock)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentLogs.length === 0 ? (
                    <p className="text-[11px] italic" style={{ color: 'var(--fg-muted)' }}>No decisions logged yet.</p>
                  ) : (
                    recentLogs.slice(0, 3).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg text-[11px] space-y-0.5"
                        style={{
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate" style={{ color: 'var(--fg)' }}>
                            {log.action}
                          </span>
                          <span className="font-mono text-[10px]" style={{ color: 'var(--status-ok)' }}>Logged</span>
                        </div>
                        <p className="text-[10px] truncate" style={{ color: 'var(--fg-muted)' }}>{log.rationale}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
