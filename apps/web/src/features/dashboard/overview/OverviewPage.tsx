import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOverviewData } from './useOverviewData';
import { AnimatedNumber } from './components/AnimatedNumber';
import { HealthGauge } from './components/HealthGauge';
import { FootfallChart } from './components/FootfallChart';
import { QueueBarChart } from './components/QueueBarChart';
import { InsightFeed } from './components/InsightFeed';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  Layers,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { data, isLoading, isFetching } = useOverviewData();
  const { shop } = useAuth();
  const navigate = useNavigate();

  if (isLoading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading store telemetry stream...</p>
      </div>
    );
  }

  // Queue Wait Color-coding
  const isQueueGood = data.avgQueueWaitMins <= data.queueThresholdMins;
  const isQueueSevere = data.avgQueueWaitMins > 5.0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Retail Intelligence Overview
            </h1>
            {isFetching && (
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" title="Refreshing live telemetry..." />
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time edge vision analytics for{' '}
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{shop?.shop_name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/dashboard/store-map')}
            variant="primary"
            size="sm"
            className="gap-2 bg-indigo-600 hover:bg-indigo-500"
          >
            <Layers className="w-4 h-4" />
            <span>Store Digital Twin</span>
          </Button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Telemetry Active</span>
          </div>
        </div>
      </div>

      {/* TOP ROW — 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Today's Footfall */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Today's Footfall
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                <AnimatedNumber value={data.footfallToday} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +{data.footfallChangePct}% vs yesterday
                </span>
              </div>
            </div>

            {/* Sparkline Visual */}
            <div className="flex items-end gap-1 h-6 pt-1">
              {data.footfallSparkline.map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-indigo-500/30 hover:bg-indigo-500 rounded-t transition-colors"
                  style={{ height: `${Math.max(15, (val / Math.max(...data.footfallSparkline)) * 100)}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Avg. Queue Wait */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Avg Queue Wait
              </span>
              <div
                className={`p-2 rounded-xl border ${
                  isQueueSevere
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    : isQueueGood
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div
                className={`text-3xl font-extrabold tracking-tight ${
                  isQueueSevere
                    ? 'text-rose-500'
                    : isQueueGood
                    ? 'text-emerald-500'
                    : 'text-amber-500'
                }`}
              >
                <AnimatedNumber value={data.avgQueueWaitMins} decimals={1} suffix=" min" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isQueueGood ? '✓ Within target threshold' : '⚠️ Above target threshold (3.0 min)'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Active Stock Alerts */}
        <Card
          onClick={() => navigate('/dashboard/inventory')}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-500/50 transition-all group"
        >
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Stock Alerts
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                <Package className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-between">
                <AnimatedNumber value={data.activeStockAlerts} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-amber-500 font-medium mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Click to view low-stock shelves
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Devices Online */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Devices Online
              </span>
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {data.devicesOnline} <span className="text-lg font-semibold text-slate-400">/ {data.totalDevices}</span>
              </div>

              {/* Pulse dots list per device */}
              <div className="flex items-center gap-2 mt-2">
                {data.devicesList.map((dev) => (
                  <span
                    key={dev.id}
                    title={`${dev.name} (${dev.status})`}
                    className={`w-2.5 h-2.5 rounded-full ${
                      dev.status === 'online'
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-rose-500 opacity-60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECOND ROW — Store Health Score Visual Centerpiece */}
      <HealthGauge
        score={data.storeHealthScore}
        status={data.healthStatus}
        breakdown={data.healthBreakdown}
      />

      {/* FEATURED BANNER — Digital Twin Flagship Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/90 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">Store Digital Twin & Real-Time Heatmap</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
              60 FPS Live
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Inspect real-time 2D floor plans, spatial shopper density heatmaps, and vision camera coverage zones.
          </p>
        </div>

        <Button
          onClick={() => navigate('/dashboard/store-map')}
          variant="primary"
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 shrink-0"
        >
          <span>Open Digital Twin Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* THIRD ROW — Two Side-by-Side Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FootfallChart data={data.hourlyFootfall} />
        <QueueBarChart data={data.counterWaitTimes} thresholdMins={data.queueThresholdMins} />
      </div>

      {/* FOURTH ROW — AI Automated Insight Feed */}
      <InsightFeed insights={data.aiInsights} />
    </div>
  );
};
