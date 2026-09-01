import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Package } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
          Inventory & Shelf Tracking
        </h1>
        <p className="font-sans text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
          Automated out-of-stock alerts and vision-based shelf inventory monitoring.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
            <Package className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
            <span>Shelf Monitoring</span>
          </CardTitle>
          <CardDescription style={{ color: 'var(--fg-muted)' }}>Real-time out-of-stock detection via camera nodes</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center border border-dashed rounded-lg" style={{ background: 'var(--bg)', borderColor: 'var(--border-strong)' }}>
          <p className="font-mono text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>Inventory & shelf status telemetry active.</p>
        </CardContent>
      </Card>
    </div>
  );
};
