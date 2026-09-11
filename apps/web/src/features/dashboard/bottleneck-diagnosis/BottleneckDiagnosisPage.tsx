import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  ArrowRight,
  Activity,
  Layers,
  ArrowDownRight,
  RefreshCw,
  GitBranch,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockIntelligenceService } from '@/services/mock/storeIntelligence';
import { defaultKiranaLayout } from '@/lib/mockLayouts';
import { DigitalTwinCanvas } from '@/features/dashboard/store-map/components/DigitalTwinCanvas';
import type { BottleneckDiagnosis, StoreZone, CongestionRiskLevel } from '@/types';

export const BottleneckDiagnosisPage: React.FC = () => {
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState<BottleneckDiagnosis | null>(null);
  const [zones] = useState<StoreZone[]>(defaultKiranaLayout.zones);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>('z-checkout');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDiagnosis = async () => {
    try {
      setIsRefreshing(true);
      const data = await mockIntelligenceService.getDiagnosis();
      setDiagnosis(data);
      if (data.bottleneckZoneId) {
        setSelectedZoneId(data.bottleneckZoneId);
      }
    } catch (err) {
      console.error('Failed to fetch bottleneck diagnosis', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiagnosis();
  }, []);

  if (loading || !diagnosis) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 rounded-xl w-1/3" style={{ background: 'var(--bg-subtle)' }} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-xl" style={{ background: 'var(--bg-subtle)' }} />
          <div className="h-64 rounded-xl" style={{ background: 'var(--bg-subtle)' }} />
          <div className="h-64 rounded-xl" style={{ background: 'var(--bg-subtle)' }} />
        </div>
        <div className="h-96 rounded-2xl" style={{ background: 'var(--bg-subtle)' }} />
      </div>
    );
  }

  const getSeverityBadge = (severity: CongestionRiskLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'var(--status-err-bg)',
          border: 'var(--status-err-border)',
          fg: 'var(--status-err)',
        };
      case 'HIGH':
        return {
          bg: 'var(--status-warn-bg)',
          border: 'var(--status-warn-border)',
          fg: 'var(--status-warn)',
        };
      case 'MODERATE':
        return {
          bg: 'var(--status-warn-bg)',
          border: 'var(--status-warn-border)',
          fg: 'var(--status-warn)',
        };
      default:
        return {
          bg: 'var(--status-ok-bg)',
          border: 'var(--status-ok-border)',
          fg: 'var(--status-ok)',
        };
    }
  };

  const getTimelineDotColor = (risk: CongestionRiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return 'var(--status-err)';
      case 'HIGH':
      case 'MODERATE':
        return 'var(--status-warn)';
      default:
        return 'var(--status-ok)';
    }
  };

  const sevBadge = getSeverityBadge(diagnosis.severity);

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              Automated Bottleneck Diagnosis
            </h1>
            <span
              className="px-3 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: sevBadge.bg,
                color: sevBadge.fg,
                border: `1px solid ${sevBadge.border}`,
              }}
            >
              Severity: {diagnosis.severity}
            </span>
          </div>
          <p className="font-sans text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
            Root factor isolation based on zone dwell density and observed flow differential.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchDiagnosis}
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
            <span>Re-analyze</span>
          </Button>

          <Button
            onClick={() => navigate('/dashboard/what-if-simulator')}
            variant="primary"
            size="sm"
            className="gap-2 text-xs font-medium"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              border: '1px solid var(--accent-hover)',
            }}
          >
            <span>Explore Interventions</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 2. Top Overview Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Primary Bottleneck Identifier */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardContent className="p-4 space-y-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--status-err)' }}>
              Primary Bottleneck
              <AlertOctagon className="w-4 h-4" style={{ color: 'var(--status-err)' }} />
            </span>
            <div className="font-serif text-lg font-bold capitalize truncate" style={{ color: 'var(--fg)' }}>
              {diagnosis.bottleneckZoneName || diagnosis.primaryBottleneck}
            </div>
            <p className="font-mono text-[11px]" style={{ color: 'var(--status-err)' }}>
              Zone ID: {diagnosis.bottleneckZoneId}
            </p>
          </CardContent>
        </Card>

        {/* Arrival Inflow Rate */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardContent className="p-4 space-y-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--status-ok)' }}>
              Arrival Rate
              <ArrowDownRight className="w-4 h-4" style={{ color: 'var(--status-ok)' }} />
            </span>
            <div className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              {diagnosis.arrivalRate}{' '}
              <span className="font-sans text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>shoppers/min</span>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>Entering checkout queue</p>
          </CardContent>
        </Card>

        {/* Service Completion Rate */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardContent className="p-4 space-y-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--status-err)' }}>
              Service Rate
              <Activity className="w-4 h-4" style={{ color: 'var(--status-err)' }} />
            </span>
            <div className="font-serif text-2xl font-bold" style={{ color: 'var(--status-err)' }}>
              {diagnosis.serviceRate}{' '}
              <span className="font-sans text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>checkouts/min</span>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>Single cashier throughput</p>
          </CardContent>
        </Card>

        {/* Flow Imbalance Differential */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardContent className="p-4 space-y-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--status-warn)' }}>
              Flow Imbalance
              <GitBranch className="w-4 h-4" style={{ color: 'var(--status-warn)' }} />
            </span>
            <div className="font-serif text-2xl font-bold" style={{ color: 'var(--status-warn)' }}>
              +{diagnosis.imbalance}{' '}
              <span className="font-sans text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>net backlog/min</span>
            </div>
            <p className="font-mono text-[11px]" style={{ color: 'var(--status-warn)' }}>Accumulation deficit</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Section: Floor Plan Problem Zone & Contributing Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Floor Plan with Problem Zone Spotlight */}
        <Card className="lg:col-span-7" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
                <Layers className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
                <span>Spatial Bottleneck Localization</span>
              </CardTitle>
              <CardDescription style={{ color: 'var(--fg-muted)' }}>
                Live store twin with highlighted bottleneck zone ({diagnosis.bottleneckZoneName})
              </CardDescription>
            </div>
            <span
              className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold flex items-center gap-1.5"
              style={{
                background: 'var(--status-err-bg)',
                color: 'var(--status-err)',
                border: '1px solid var(--status-err-border)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-ping"
                style={{ background: 'var(--status-err)' }}
              />
              Impedance Focus
            </span>
          </CardHeader>

          <CardContent>
            <DigitalTwinCanvas
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={(id) => setSelectedZoneId(id)}
              highlightZoneId={diagnosis.bottleneckZoneId}
              heightClass="h-[400px]"
            />
          </CardContent>
        </Card>

        {/* Contributing Factors Score List */}
        <Card className="lg:col-span-5 flex flex-col justify-between" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader>
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <Activity className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
              <span>Contributing Factor Breakdown</span>
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>
              Relative contribution scores (0–100) estimated from flow differentials
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3.5">
              {diagnosis.contributingFactors.map((factor, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold" style={{ color: 'var(--fg)' }}>
                      {factor.label}
                    </span>
                    <span className="font-mono font-bold" style={{ color: 'var(--fg)' }}>
                      Score: {factor.score}
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.score}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{
                        background: factor.score >= 75
                          ? 'var(--status-err)'
                          : factor.score >= 50
                          ? 'var(--status-warn)'
                          : factor.score >= 30
                          ? 'var(--accent)'
                          : 'var(--fg-subtle)',
                      }}
                    />
                  </div>

                  <p className="text-[11px] leading-tight" style={{ color: 'var(--fg-muted)' }}>
                    {factor.detail}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="p-3 rounded-xl text-[11px]"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--fg-muted)',
              }}
            >
              <strong style={{ color: 'var(--fg)' }}>Methodology Note:</strong> Scores represent relative
              weights derived from zone dwell accumulation and inflow rates, not absolute probabilities.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Incident Timeline & Recommendation Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Escalation Timeline */}
        <Card className="lg:col-span-7" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader>
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
              <span>Flow Escalation Timeline</span>
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>
              Progression from nominal store traffic to detected bottleneck
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div
              className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5"
              style={{ borderColor: 'var(--border)' }}
            >
              {diagnosis.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <span
                    className="absolute -left-[23px] top-1 w-3 h-3 rounded-full"
                    style={{
                      background: getTimelineDotColor(step.risk),
                      boxShadow: `0 0 0 3px var(--bg-elevated)`,
                    }}
                  />

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs" style={{ color: 'var(--fg)' }}>
                        {step.time}
                      </span>
                      <span className="text-xs font-bold" style={{ color: 'var(--fg)' }}>
                        {step.status}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operational Recommendation & Action Link */}
        <Card
          className="lg:col-span-5 flex flex-col justify-between"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}
        >
          <CardHeader>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--status-ok)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence Recommendation
            </span>
            <CardTitle className="font-serif text-base mt-1" style={{ color: 'var(--fg)' }}>
              Mitigation Rationale
            </CardTitle>
            <CardDescription className="text-xs" style={{ color: 'var(--fg-muted)' }}>
              Algorithmic suggestions using observed flow impedance data
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            <div
              className="p-4 rounded-xl text-xs leading-relaxed space-y-2"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--fg)',
              }}
            >
              <p>{diagnosis.recommendation}</p>
              <p className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                Likely cause identified as register throughput shortfall during inflow surge.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => navigate('/dashboard/what-if-simulator')}
                variant="primary"
                className="w-full gap-2 font-medium"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                  border: '1px solid var(--accent-hover)',
                }}
              >
                <span>Test Interventions in What-If Simulator</span>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <p className="text-[10px] text-center font-mono" style={{ color: 'var(--fg-subtle)' }}>
                Simulation models counter opening effects against live forecast
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
