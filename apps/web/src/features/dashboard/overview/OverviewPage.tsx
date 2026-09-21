import React, { useState } from 'react';
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
import {
  Users,
  Clock,
  Package,
  Camera,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Video,
  Info,
  X,
  BookOpen,
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
};

// Small explanatory caption component
const Caption: React.FC<{ text: string }> = ({ text }) => (
  <div
    className="flex items-start gap-2 p-2.5 rounded-lg text-[11px] leading-relaxed"
    style={{ background: 'var(--bg-subtle)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
  >
    <Info className="w-3 h-3 shrink-0 mt-0.5" style={{ color: 'var(--fg-subtle)' }} />
    <span>{text}</span>
  </div>
);

// First-timer guide banner — dismissible
const GuideBanner: React.FC<{ onDismiss: () => void; onGoToLive: () => void }> = ({ onDismiss, onGoToLive }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
    className="relative rounded-xl p-4"
    style={{
      background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.05) 100%)',
      border: '1px solid rgba(99,102,241,0.3)',
    }}
  >
    {/* Dismiss */}
    <button
      onClick={onDismiss}
      className="absolute top-3 right-3 p-1 rounded-lg transition-colors"
      style={{ color: 'var(--fg-subtle)' }}
      title="Dismiss guide"
    >
      <X className="w-3.5 h-3.5" />
    </button>

    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg shrink-0" style={{ background: 'rgba(99,102,241,0.2)' }}>
        <BookOpen className="w-4 h-4" style={{ color: '#818cf8' }} />
      </div>
      <div className="space-y-2.5 pr-6">
        <div>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--fg)' }}>
            Welcome to Retina Retail — AI-Powered Store Intelligence
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-muted)' }}>
            Real-time analytics powered by YOLOv8 computer vision across 5 live camera feeds.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { step: '1', title: 'Live Monitor', desc: 'See YOLO detections on CCTV feeds' },
            { step: '2', title: 'Queue Intelligence', desc: 'Track checkout wait times live' },
            { step: '3', title: 'What-If Simulator', desc: 'Simulate staffing interventions' },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-2 p-2.5 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}
            >
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono"
                style={{ background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}
              >
                {item.step}
              </span>
              <div>
                <p className="text-[11px] font-semibold" style={{ color: 'var(--fg)' }}>{item.title}</p>
                <p className="text-[10px]" style={{ color: 'var(--fg-muted)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onGoToLive}
          className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }}
        >
          <Video className="w-3 h-3" />
          Start with Live Monitor
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  </motion.div>
);

export const OverviewPage: React.FC = () => {
  const { data, isLoading, isFetching } = useOverviewData();
  const [showGuide, setShowGuide] = useState(true);
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              Overview
            </h1>
            {isFetching && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--fg-subtle)' }} />
            )}
          </div>
          <p className="font-sans text-xs" style={{ color: 'var(--fg-muted)' }}>
            The Face Shop — Sector 18 · live telemetry stream
          </p>
        </div>

        {/* Live Monitor shortcut */}
        <button
          onClick={() => navigate('/dashboard/live-monitor')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--fg-muted)',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <Video className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
          Live Cameras
          <ArrowRight className="w-3 h-3" style={{ color: 'var(--fg-subtle)' }} />
        </button>
      </div>

      {/* First-timer guide banner */}
      {showGuide && (
        <GuideBanner
          onDismiss={() => setShowGuide(false)}
          onGoToLive={() => navigate('/dashboard/live-monitor')}
        />
      )}

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {/* Footfall */}
        <motion.div variants={cardVariants}>
          <Card className="h-full">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                  Today's Footfall
                </span>
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)', opacity: 0.5 }} />
              </div>
              <div className="font-serif text-3xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
                <AnimatedNumber value={data.footfallToday} />
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px]" style={{ color: 'var(--status-ok)' }}>
                <TrendingUp className="w-3 h-3" />
                <span>+{data.footfallChangePct}% vs avg</span>
              </div>
              {/* Micro sparkline */}
              <div className="flex items-end gap-0.5 h-4 pt-1">
                {data.footfallSparkline.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-xs transition-all"
                    style={{
                      height: `${Math.max(15, (val / Math.max(...data.footfallSparkline)) * 100)}%`,
                      background: idx === data.footfallSparkline.length - 1
                        ? 'var(--accent)'
                        : 'var(--border-strong)',
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Avg Queue Wait */}
        <motion.div variants={cardVariants}>
          <Card className="h-full">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                  Avg Queue Wait
                </span>
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)', opacity: 0.5 }} />
              </div>
              <div className="font-serif text-3xl font-bold tracking-tight" style={{ color: queueColor }}>
                <AnimatedNumber value={data.avgQueueWaitMins} decimals={1} suffix="m" />
              </div>
              <p className="font-sans text-[11px]" style={{ color: 'var(--fg-subtle)' }}>
                {isQueueGood ? 'Target SLA met (<3.0m)' : 'Exceeds SLA threshold'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Alerts */}
        <motion.div variants={cardVariants}>
          <Card
            className="h-full cursor-pointer group"
            onClick={() => navigate('/dashboard/inventory')}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                  Stock Alerts
                </span>
                <Package className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)', opacity: 0.5 }} />
              </div>
              <div className="flex items-end justify-between">
                <span className="font-serif text-3xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
                  <AnimatedNumber value={data.activeStockAlerts} />
                </span>
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  style={{ color: 'var(--fg-subtle)' }}
                />
              </div>
              <p className="font-sans text-[11px] flex items-center gap-1" style={{ color: 'var(--status-warn)' }}>
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Tap to view inventory</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Devices Online */}
        <motion.div variants={cardVariants}>
          <Card className="h-full cursor-pointer group" onClick={() => navigate('/dashboard/live-monitor')}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
                  Cameras Online
                </span>
                <Camera className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)', opacity: 0.5 }} />
              </div>
              <div className="font-serif text-3xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
                {data.devicesOnline}
                <span className="font-sans text-base font-normal" style={{ color: 'var(--fg-subtle)' }}>
                  /{data.totalDevices}
                </span>
              </div>
              {/* Camera name list with status dot */}
              <div className="space-y-1 pt-0.5">
                {data.devicesList.map((dev) => (
                  <div key={dev.id} className="flex items-center gap-1.5">
                    <span
                      className="shrink-0 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: dev.status === 'online' ? 'var(--status-ok)' : 'var(--status-err)',
                      }}
                    />
                    <span className="font-sans text-[10px] truncate" style={{ color: 'var(--fg-muted)' }}>
                      {dev.name}
                    </span>
                  </div>
                ))}
              </div>
              <p className="font-sans text-[10px] group-hover:underline" style={{ color: 'var(--accent)' }}>
                View live feeds →
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Store Health Index Gauge */}
      <HealthGauge
        score={data.storeHealthScore}
        status={data.healthStatus}
        breakdown={data.healthBreakdown}
      />
      <Caption text="Store Health Score — a combined indicator across queue wait times, footfall velocity, stock availability, and device uptime. Green means your store is running smoothly." />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <FootfallChart data={data.hourlyFootfall} />
          <Caption text="Hourly Footfall — how many shoppers entered your store each hour today. Peaks help you schedule staff better." />
        </div>
        <div className="space-y-2">
          <QueueBarChart data={data.counterWaitTimes} thresholdMins={data.queueThresholdMins} />
          <Caption text="Queue Wait by Counter — average customer wait time at each checkout. Bars above the red line need attention." />
        </div>
      </div>

      {/* AI Insights Feed */}
      {data.aiInsights.length === 0 ? (
        <EmptyState
          type="no-insights"
          onAction={() => navigate('/dashboard/devices')}
          actionLabel="Check edge devices"
        />
      ) : (
        <div className="space-y-2">
          <InsightFeed insights={data.aiInsights} />
          <Caption text="AI Insights — automated observations from your vision sensors. Act on red alerts first." />
        </div>
      )}
    </div>
  );
};
