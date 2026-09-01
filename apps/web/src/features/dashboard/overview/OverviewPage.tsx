import React from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Users, Clock, Camera, Activity, TrendingUp } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { shop } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time edge intelligence summary for <span className="text-indigo-400 font-medium">{shop?.shop_name}</span>.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Footfall Today</p>
              <h3 className="text-2xl font-bold text-white mt-1">1,428</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs yesterday
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Dwell Time</p>
              <h3 className="text-2xl font-bold text-white mt-1">14.2 min</h3>
              <p className="text-xs text-slate-400 mt-1">Optimal store engagement</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Activity className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Queue Time</p>
              <h3 className="text-2xl font-bold text-white mt-1">2.4 min</h3>
              <p className="text-xs text-slate-400 mt-1">{shop?.number_of_counters || 2} Counters Active</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Edge Cameras</p>
              <h3 className="text-2xl font-bold text-white mt-1">{shop?.expected_cameras || 3} Configured</h3>
              <p className="text-xs text-emerald-400 mt-1">All Nodes Operational</p>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
              <Camera className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Status Panel */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Store Edge Node Status</CardTitle>
          <CardDescription>Real-time telemetry from SNPE/QNN local inference units</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h4 className="text-sm font-semibold text-white">Main Entrance Edge Camera #1</h4>
                <p className="text-xs text-slate-400">ByteTrack Multi-Object Tracker • 30 FPS • Local SNPE Model</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              Streaming Live
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
