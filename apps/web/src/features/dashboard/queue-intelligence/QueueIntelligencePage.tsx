import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Clock } from 'lucide-react';

export const QueueIntelligencePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Queue Intelligence</h1>
        <p className="text-sm text-slate-400 mt-1">
          POS checkout line length, wait times, and dynamic counter opening recommendations.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Counter Queue Metrics</span>
          </CardTitle>
          <CardDescription>Live counter queue depths and estimated wait times</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
          <p className="text-sm text-slate-400 font-medium">Queue intelligence monitoring will populate here.</p>
        </CardContent>
      </Card>
    </div>
  );
};
