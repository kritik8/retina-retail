import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mockIntelligenceService } from '@/services/mock/storeIntelligence';
import type { BottleneckDiagnosis, CongestionRiskLevel } from '@/types';

const STORE_ZONES = [
  { id: 'z-entrance', label: 'Store Entry', defaultLoad: 0.35 },
  { id: 'z-aisle1', label: 'Beauty & Skincare', defaultLoad: 0.45 },
  { id: 'z-aisle2', label: 'Accessories Wall', defaultLoad: 0.50 },
  { id: 'z-checkout', label: 'Checkout Counter', defaultLoad: 0.88 },
  { id: 'z-back', label: 'Fragrance Gondola', defaultLoad: 0.22 },
  { id: 'z-storage', label: 'Storage & Staging', defaultLoad: 0.10 },
];

function loadColor(load: number, isBottleneck: boolean) {
  if (isBottleneck) return { bg: 'var(--status-err-bg)', border: 'var(--status-err)', text: 'var(--status-err)' };
  if (load > 0.7) return { bg: 'var(--status-err-bg)', border: 'var(--status-err)', text: 'var(--status-err)' };
  if (load > 0.5) return { bg: 'var(--status-warn-bg)', border: 'var(--status-warn)', text: 'var(--status-warn)' };
  return { bg: 'var(--status-ok-bg)', border: 'var(--status-ok)', text: 'var(--status-ok)' };
}

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
  const [showTimeline, setShowTimeline] = useState(false);

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

  useEffect(() => {
    fetchDiagnosis();
  }, []);

  if (loading || !diagnosis) {
    return (
      <div className="space-y-6 animate-pulse max-w-6xl mx-auto">
        <div className="h-8 rounded-lg w-1/4" style={{ background: 'var(--bg-subtle)' }} />
        <div className="h-20 rounded-xl" style={{ background: 'var(--bg-subtle)' }} />
        <div className="h-80 rounded-2xl" style={{ background: 'var(--bg-subtle)' }} />
      </div>
    );
  }

  const sevColor =
    diagnosis.severity === 'CRITICAL'
      ? 'var(--status-err)'
      : diagnosis.severity === 'HIGH'
      ? 'var(--status-warn)'
      : 'var(--status-ok)';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-32">
      {/* ─── 1. Header (Short header + one-line subtext) ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
            Automated Bottleneck Diagnosis
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
            Root-cause flow analysis and localized store congestion diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchDiagnosis}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium"
            disabled={isRefreshing}
            style={{ background: 'var(--bg-elevated)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Re-analyze
          </Button>

          <Button
            onClick={() => navigate('/dashboard/what-if-simulator')}
            variant="primary"
            size="sm"
            className="gap-1.5 text-xs font-medium"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
          >
            <span>Simulate Countermeasures</span>
            <ArrowRight className="w-4 h-4" />
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
            Primary Bottleneck
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-serif text-lg font-bold truncate" style={{ color: 'var(--status-err)' }}>
              {diagnosis.bottleneckZoneName || diagnosis.primaryBottleneck}
            </span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Arrival Rate
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              14.2
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>shoppers/min</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Service Capacity
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-serif text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              3.1
            </span>
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>checkouts/min</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex flex-col justify-between"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
            Flow Imbalance
          </span>
          <div className="mt-1.5">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold tracking-wide"
              style={{ background: sevColor + '20', color: sevColor, border: `1px solid ${sevColor}40` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sevColor }} />
              +{diagnosis.imbalance || 31}% DEFICIT
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. ONE Primary Visualization: Store Floor Congestion Grid ────────── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" style={{ color: 'var(--status-err)' }} />
            <h2 className="font-serif text-base font-bold" style={{ color: 'var(--fg)' }}>
              Floor Plan Congestion & Chokepoint Localization
            </h2>
          </div>
          <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--bg-subtle)', color: 'var(--fg-muted)' }}>
            Real-time Sensor Mesh
          </span>
        </div>

        {/* Zone Grid Canvas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          {STORE_ZONES.map((zone, i) => {
            const isBottleneck = zone.id === (diagnosis.bottleneckZoneId || 'z-checkout');
            const colors = loadColor(zone.defaultLoad, isBottleneck);
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative rounded-xl p-4 text-center transition-transform hover:scale-[1.01]"
                style={{ background: colors.bg, border: `1.5px solid ${colors.border}35` }}
              >
                {isBottleneck && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider shadow-sm"
                    style={{ background: 'var(--status-err)', color: '#fff' }}
                  >
                    ⚠ Chokepoint
                  </span>
                )}
                <p className="font-sans text-xs font-semibold mt-1" style={{ color: colors.text }}>
                  {zone.label}
                </p>
                <p className="font-mono text-2xl font-bold mt-0.5" style={{ color: colors.text }}>
                  {Math.round(zone.defaultLoad * 100)}%
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: colors.text, opacity: 0.7 }}>
                  capacity load
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ─── 4. Compact Contributing Factor Scores (Labeled Contribution Scores) ─ */}
        <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
              Contribution Scores:
            </span>
            {diagnosis.contributingFactors.map((factor, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--fg)' }}>{factor.label}</span>
                <span
                  className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: factor.score >= 70 ? 'var(--status-err-bg)' : factor.score >= 50 ? 'var(--status-warn-bg)' : 'var(--accent-subtle)',
                    color: factor.score >= 70 ? 'var(--status-err)' : factor.score >= 50 ? 'var(--status-warn)' : 'var(--accent-fg)',
                  }}
                >
                  {factor.score}
                </span>
              </div>
            ))}
          </div>

          <span className="font-mono text-[11px]" style={{ color: 'var(--fg-muted)' }}>
            Scores normalized 0–100 · Empirical CV telemetry
          </span>
        </div>
      </div>

      {/* ─── 5. Secondary / Escalation Timeline (Collapsible) ─────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium transition-colors"
          style={{ background: 'var(--bg-elevated)', color: 'var(--fg)' }}
        >
          <span className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
            <span>{showTimeline ? 'Hide Escalation Timeline' : 'Show Escalation Timeline ( Buildup History )'}</span>
          </span>
          {showTimeline ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 border-t"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
            >
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
                {diagnosis.timeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <span
                      className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full"
                      style={{ background: getTimelineDotColor(step.risk), boxShadow: `0 0 0 3px var(--bg-elevated)` }}
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs" style={{ color: 'var(--fg)' }}>{step.time}</span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>{step.status}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
            style={{ background: 'var(--status-warn-bg)', border: '1px solid var(--status-warn-border)', color: 'var(--status-warn)' }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-fg)' }}>
                DIAGNOSTIC RECOMMENDATION
              </span>
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Observed flow imbalance
              </span>
            </div>
            <h3 className="font-serif text-base font-bold mt-1.5" style={{ color: 'var(--fg)' }}>
              Open Secondary Checkout Counter
            </h3>
            <p className="text-xs mt-0.5 max-w-xl" style={{ color: 'var(--fg-muted)' }}>
              {diagnosis.recommendation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <Button
            onClick={() => navigate('/dashboard/predictive-intelligence')}
            variant="outline"
            size="sm"
            className="w-full md:w-auto text-xs"
            style={{ background: 'var(--bg-elevated)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            View Forecast
          </Button>

          <Button
            onClick={() => navigate('/dashboard/what-if-simulator')}
            variant="primary"
            size="sm"
            className="w-full md:w-auto gap-1.5 text-xs font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent-hover)' }}
          >
            <span>Explore Interventions</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
