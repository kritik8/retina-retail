import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Clock } from 'lucide-react';

export const QueueIntelligencePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
          Queue Intelligence
        </h1>
        <p className="font-sans text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
          POS checkout line length, wait times, and dynamic counter opening recommendations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-base flex items-center gap-2" style={{ color: 'var(--fg)' }}>
            <Clock className="w-4 h-4" style={{ color: 'var(--status-warn)' }} />
            <span>Counter Queue Metrics</span>
          </CardTitle>
          <CardDescription style={{ color: 'var(--fg-muted)' }}>Live counter queue depths and estimated wait times</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center border border-dashed rounded-lg" style={{ background: 'var(--bg)', borderColor: 'var(--border-strong)' }}>
          <p className="font-mono text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>Queue intelligence monitoring active.</p>
        </CardContent>
      </Card>
    </div>
  );
};
