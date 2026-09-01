import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Users } from 'lucide-react';

export const ShopperAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
          Shopper Analytics
        </h1>
        <p className="font-sans text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
          Demographics, footfall patterns, dwell times, and aisle heatmaps streamed from edge vision nodes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
            <Users className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
            <span>Store Footfall & Demographics</span>
          </CardTitle>
          <CardDescription style={{ color: 'var(--fg-muted)' }}>Live shopper counts aggregated from multi-task vision backbones</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center border border-dashed rounded-lg" style={{ background: 'var(--bg)', borderColor: 'var(--border-strong)' }}>
          <p className="font-mono text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>Real-time shopper analytics telemetry active.</p>
        </CardContent>
      </Card>
    </div>
  );
};
