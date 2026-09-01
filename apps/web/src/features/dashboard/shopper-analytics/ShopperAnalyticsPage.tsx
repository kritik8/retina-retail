import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Users } from 'lucide-react';

export const ShopperAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Shopper Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Demographics, footfall patterns, dwell times, and aisle heatmaps streamed from edge vision nodes.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Store Footfall & Demographics</span>
          </CardTitle>
          <CardDescription>Live shopper counts aggregated from multi-task vision backbones</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
          <p className="text-sm text-slate-400 font-medium">Real-time shopper analytics charts will populate here.</p>
        </CardContent>
      </Card>
    </div>
  );
};
