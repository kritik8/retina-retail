import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useOverviewData } from './useOverviewData';
import { AnimatedNumber } from './components/AnimatedNumber';
import { HealthGauge } from './components/HealthGauge';
import { FootfallChart } from './components/FootfallChart';
import { QueueBarChart } from './components/QueueBarChart';
import { InsightFeed } from './components/InsightFeed';
import { Card, CardContent } from '@/components/ui/Card';
import { OverviewSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/features/auth/useAuth';
import {
  Users,
  Clock,
  Package,
  Camera,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const OverviewPage: React.FC = () => {
  const { data, isLoading, isFetching } = useOverviewData();
  const { shop } = useAuth();
  const navigate = useNavigate();

  if (isLoading || !data) return <OverviewSkeleton />;

  const isQueueGood = data.avgQueueWaitMins <= data.queueThresholdMins;
  const isQueueSevere = data.avgQueueWaitMins > 5.0;

  const queueColor = isQueueSevere
    ? 'var(--status-err)'
    : isQueueGood
    ? 'var(--status-ok)'
    : 'var(--status-warn)';

  return (
    <div className="space-y-7">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--fg)' }}>
              Overview
            </h1>
            {isFetching && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--fg-subtle)' }} />
            )}
          </div>
          <p className="text-[13px]" style={{ color: 'var(--fg-muted)' }}>
            {shop?.shop_name} · live telemetry
          </p>
        </div>
      </div>

      {/* ── KPI Cards — staggered entrance ─────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {/* Footfall */}
        <motion.div variants={cardVariants}>
          <Card className="h-full">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                  Footfall
                </span>
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)', opacity: 0.4 }} />
              </div>
              <div className="font-mono text-[28px] font-semibold tracking-tight" style={{ color: 'var(--fg)' }}>
                <AnimatedNumber value={data.footfallToday} />
              </div>
              <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--status-ok)' }}>
                <TrendingUp className="w-3 h-3" />
                <span>+{data.footfallChangePct}% vs yesterday</span>
              </div>
              {/* Micro sparkline */}
              <div className="flex items-end gap-0.5 h-5">
                {data.footfallSparkline.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${Math.max(15, (val / Math.max(...data.footfallSparkline)) * 100)}%`,
                      background: idx === data.footfallSparkline.length - 1
                        ? 'var(--accent)'
                        : 'var(--bg-subtle)',
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Queue Wait */}
        <motion.div variants={cardVariants}>
          <Card className="h-full">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                  Avg Queue
                </span>
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)', opacity: 0.4 }} />
              </div>
              <div className="font-mono text-[28px] font-semibold tracking-tight" style={{ color: queueColor }}>
                <AnimatedNumber value={data.avgQueueWaitMins} decimals={1} suffix=" m" />
              </div>
              <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>
                {isQueueGood ? 'Within target (3.0 m)' : 'Above SLA threshold'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Alerts */}
        <motion.div variants={cardVariants}>
          <Card
            className="h-full cursor-pointer group"
            onClick={() => navigate('/dashboard/inventory')}
            style={{ transition: 'border-color 150ms' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                  Stock Alerts
                </span>
                <Package className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)', opacity: 0.4 }} />
              </div>
              <div className="flex items-end justify-between">
                <span className="font-mono text-[28px] font-semibold tracking-tight" style={{ color: 'var(--fg)' }}>
                  <AnimatedNumber value={data.activeStockAlerts} />
                </span>
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  style={{ color: 'var(--fg-subtle)' }}
                />
              </div>
              <p className="text-[11px]" style={{ color: 'var(--status-warn)' }}>
                <AlertTriangle className="inline w-3 h-3 mr-1" />
                Tap to view inventory
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Devices Online */}
        <motion.div variants={cardVariants}>
          <Card className="h-full">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                  Devices
                </span>
                <Camera className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)', opacity: 0.4 }} />
              </div>
              <div className="font-mono text-[28px] font-semibold tracking-tight" style={{ color: 'var(--fg)' }}>
                {data.devicesOnline}
                <span className="text-[16px] font-normal" style={{ color: 'var(--fg-muted)' }}>
                  /{data.totalDevices}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {data.devicesList.map((dev) => (
                  <span
                    key={dev.id}
                    title={`${dev.name} (${dev.status})`}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: dev.status === 'online'
                        ? 'var(--status-ok)'
                        : 'var(--status-err)',
                      opacity: dev.status === 'online' ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Health Gauge ────────────────────────────────────── */}
      <HealthGauge
        score={data.storeHealthScore}
        status={data.healthStatus}
        breakdown={data.healthBreakdown}
      />

      {/* ── Charts ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FootfallChart data={data.hourlyFootfall} />
        <QueueBarChart data={data.counterWaitTimes} thresholdMins={data.queueThresholdMins} />
      </div>

      {/* ── AI Insights ─────────────────────────────────────── */}
      {data.aiInsights.length === 0 ? (
        <EmptyState
          type="no-insights"
          onAction={() => navigate('/dashboard/devices')}
          actionLabel="Check edge devices"
        />
      ) : (
        <InsightFeed insights={data.aiInsights} />
      )}
    </div>
  );
};
