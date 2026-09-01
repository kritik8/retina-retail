import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Camera, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const DevicesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Edge Hardware & Cameras</h1>
          <p className="text-sm text-slate-400 mt-1">
            Pair and manage SNPE/QNN vision sensor nodes installed in your store.
          </p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Pair New Edge Device</span>
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <span>Paired Devices & Sensors</span>
          </CardTitle>
          <CardDescription>Active edge devices linked to your shop database</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
          <p className="text-sm text-slate-400 font-medium">Paired edge device list and pairing codes will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};
