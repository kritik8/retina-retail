import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  ArrowRight,
  Activity,
  RefreshCw,
  Clock,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockIntelligenceService } from '@/services/mock/storeIntelligence';
import type { BottleneckDiagnosis, CongestionRiskLevel } from '@/types';

// Visual zone status grid (replaces heavy DigitalTwinCanvas)
const STORE_ZONES = [
  { id: 'z-entrance', label: 'Entrance', defaultLoad: 0.35 },
  { id: 'z-aisle1',   label: 'Beauty Aisle',    defaultLoad: 0.45 },
  { id: 'z-aisle2',   label: 'Accessories',     defaultLoad: 0.50 },
  { id: 'z-checkout', label: 'Checkout',         defaultLoad: 0.88 },
  { id: 'z-back',     label: 'Fragrances',       defaultLoad: 0.22 },
  { id: 'z-storage',  label: 'Storage',          defaultLoad: 0.10 },
];

function loadColor(load: number, isBottleneck: boolean) {
  if (isBottleneck) return { bg: 'var(--status-err-bg)', border: 'var(--status-err)', text: 'var(--status-err)' };
  if (load > 0.7)  return { bg: 'var(--status-err-bg)',  border: 'var(--status-err)',  text: 'var(--status-err)' };
  if (load > 0.5)  return { bg: 'var(--status-warn-bg)', border: 'var(--status-warn)', text: 'var(--status-warn)' };
  return { bg: 'var(--status-ok-bg)', border: 'var(--status-ok)', text: 'var(--status-ok)' };
}

const ZoneGrid: React.FC<{ bottleneckZoneId?: string }> = ({ bottleneckZoneId }) => (
  <div className="grid grid-cols-3 gap-2">
    {STORE_ZONES.map((zone, i) => {
      const isBottleneck = zone.id === bottleneckZoneId;
      const colors = loadColor(zone.defaultLoad, isBottleneck);
      return (
        <motion.div
          key={zone.id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06 }}
          className="relative rounded-xl p-3 text-center"
          style={{ background: colors.bg, border: `1.5px solid ${colors.border}30` }}
        >
          {isBottleneck && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase"
              style={{ background: 'var(--status-err)', color: '#fff' }}
            >
              ⚠ Bottleneck
            </span>
          )}
          <p className="font-sans text-[11px] font-semibold mt-2" style={{ color: colors.text }}>{zone.label}</p>
          <p className="font-mono text-[18px] font-bold" style={{ color: colors.text }}>
            {Math.round(zone.defaultLoad * 100)}%
          </p>
          <p className="font-mono text-[9px]" style={{ color: colors.text, opacity: 0.7 }}>congestion</p>
        </motion.div>
      );
    })}
  </div>
);

const getTimelineDotColor = (risk: CongestionRiskLevel) => {
  if (risk === 'CRITICAL') return 'var(--status-err)';
  if (risk === 'HIGH' || risk === 'MODERATE') return 'var(--status-warn)';
  return 'var(--status-ok)';
};

export const BottleneckDiagnosisPage: React.FC = () => {
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState<BottleneckDiagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDiagnosis = async () => {
    try {
      setIsRefreshing(true);
      const data = await mockIntelligenceService.getDiagnosis();
      setDiagnosis(data);
    } catch (err) {
      console.error('Failed to fetch bottleneck diagnosis', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchDiagnosis(); }, []);

  if (loading || !diagnosis) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 rounded-xl w-1/3" style={{ background: 'var(--bg-subtle)' }} />
        <div className="h-32 rounded-xl" style={{ background: 'var(--bg-subtle)' }} />
        <div className="h-64 rounded-xl" style={{ background: 'var(--bg-subtle)' }} />
      </div>
    );
  }

  const sevColor = diagnosis.severity === 'CRITICAL' ? 'var(--status-err)'
    : diagnosis.severity === 'HIGH' ? 'var(--status-warn)'
    : 'var(--status-ok)';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              Bottleneck Diagnosis
            </h1>
            <span className="px-3 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider"
              style={{ background: sevColor + '20', color: sevColor, border: `1px solid ${sevColor}40` }}
            >
              {diagnosis.severity}
            </span>
          </div>
          <p className="font-sans text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
            Where is your store getting stuck right now?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchDiagnosis} variant="outline" size="sm" className="gap-1.5 text-xs" disabled={isRefreshing}
            style={{ background: 'var(--bg-elevated)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Re-analyze
          </Button>
          <Button onClick={() => navigate('/dashboard/what-if-simulator')} variant="primary" size="sm" className="gap-2 text-xs font-medium"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
          >
            Simulate Fix <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Primary alert */}
      <div className="p-4 rounded-2xl flex items-start gap-3"
        style={{ background: 'var(--status-err-bg)', border: '1px solid var(--status-err-border)' }}
      >
        <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--status-err)' }} />
        <div>
          <p className="font-serif text-sm font-bold" style={{ color: 'var(--fg)' }}>
            Primary bottleneck: <span style={{ color: 'var(--status-err)' }}>{diagnosis.bottleneckZoneName || diagnosis.primaryBottleneck}</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{diagnosis.recommendation}</p>
        </div>
      </div>

      {/* Zone overview + Factor breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Zone congestion grid */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader>
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <MapPin className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
              Zone Congestion Overview
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>
              Which parts of the store are most congested right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ZoneGrid bottleneckZoneId={diagnosis.bottleneckZoneId} />
          </CardContent>
        </Card>

        {/* Contributing factors */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader>
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <Activity className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
              Why is this happening?
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>
              Factors contributing to the current congestion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {diagnosis.contributingFactors.map((factor, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold" style={{ color: 'var(--fg)' }}>{factor.label}</span>
                  <span className="font-mono text-[11px]" style={{
                    color: factor.score >= 75 ? 'var(--status-err)' : factor.score >= 50 ? 'var(--status-warn)' : 'var(--fg-subtle)'
                  }}>
                    {factor.score >= 75 ? 'High impact' : factor.score >= 50 ? 'Moderate' : 'Low impact'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.score}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      background: factor.score >= 75 ? 'var(--status-err)' : factor.score >= 50 ? 'var(--status-warn)' : 'var(--accent)',
                    }}
                  />
                </div>
                <p className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>{factor.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Timeline + Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Timeline */}
        <Card style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader>
            <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
              How did it escalate?
            </CardTitle>
            <CardDescription style={{ color: 'var(--fg-muted)' }}>Timeline of traffic buildup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
              {diagnosis.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full"
                    style={{ background: getTimelineDotColor(step.risk), boxShadow: `0 0 0 3px var(--bg-elevated)` }}
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs" style={{ color: 'var(--fg)' }}>{step.time}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--fg)' }}>{step.status}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className="flex flex-col justify-between" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <CardHeader>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--status-ok)' }}>
              <Sparkles className="w-3.5 h-3.5" /> Recommended Action
            </span>
            <CardTitle className="font-serif text-base mt-1" style={{ color: 'var(--fg)' }}>What should you do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="p-3.5 rounded-xl text-xs leading-relaxed" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--fg)' }}>
              {diagnosis.recommendation}
            </p>
            <Button onClick={() => navigate('/dashboard/what-if-simulator')} variant="primary" className="w-full gap-2 font-medium"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
            >
              Test This Fix in Simulator <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
