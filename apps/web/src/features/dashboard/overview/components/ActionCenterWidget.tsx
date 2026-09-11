import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Clock, FlaskConical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const ActionCenterWidget: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card
      style={{
        background: 'var(--status-warn-bg)',
        border: '1px solid var(--status-warn-border)',
      }}
      className="overflow-hidden shadow-sm"
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left info */}
          <div className="flex items-start gap-3.5">
            <div
              className="p-2 rounded-xl shrink-0"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--status-warn-border)',
                color: 'var(--status-warn)',
              }}
            >
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded font-mono text-[10px] font-bold tracking-wider uppercase"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--status-warn-border)',
                    color: 'var(--status-warn)',
                  }}
                >
                  ⚡ Congestion Predicted
                </span>
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--fg-muted)' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: 'var(--status-warn)' }} />
                  Estimated: <strong style={{ color: 'var(--fg)' }}>+7 min to peak threshold</strong>
                </span>
              </div>

              <h3 className="font-serif text-base font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
                Queue expected to reach 21 customers (Main Checkout 2)
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-0.5" style={{ color: 'var(--fg-muted)' }}>
                <span>
                  <strong style={{ color: 'var(--fg)' }}>Likely Bottleneck:</strong> Main Checkout & POS
                </span>
                <span>•</span>
                <span>
                  <strong style={{ color: 'var(--fg)' }}>Recommended Action:</strong> Open Counter 2 (Main POS)
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
            <Button
              onClick={() => navigate('/dashboard/predictive-intelligence')}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 font-medium"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
              }}
            >
              <span>View Forecast</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>

            <Button
              onClick={() => navigate('/dashboard/what-if-simulator?preset=checkout')}
              variant="primary"
              size="sm"
              className="text-xs gap-1.5 font-medium"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
                border: '1px solid var(--accent-hover)',
              }}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Simulate Intervention</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
