import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Package } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Shelf & Inventory Tracking</h1>
        <p className="text-sm text-slate-400 mt-1">
          Automated shelf out-of-stock alerts and vision-based stock monitoring.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Shelf Monitoring</span>
          </CardTitle>
          <CardDescription>Real-time out-of-stock detection via camera nodes</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
          <p className="text-sm text-slate-400 font-medium">Inventory & shelf status telemetry will populate here.</p>
        </CardContent>
      </Card>
    </div>
  );
};
