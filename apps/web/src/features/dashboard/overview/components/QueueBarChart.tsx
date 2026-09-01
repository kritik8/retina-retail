import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Clock, AlertTriangle } from 'lucide-react';
import type { CounterWaitData } from '@/lib/mockData';

interface QueueBarChartProps {
  data: CounterWaitData[];
  thresholdMins?: number;
}

export const QueueBarChart: React.FC<QueueBarChartProps> = ({
  data,
  thresholdMins = 3.0,
}) => {
  const maxWait = Math.max(6.0, ...data.map((d) => d.waitTimeMins * 1.15));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2 font-serif font-semibold" style={{ color: 'var(--fg)' }}>
            <Clock className="w-4 h-4" style={{ color: 'var(--status-warn)' }} />
            <span>Counter Queue Wait Times</span>
          </CardTitle>
          <CardDescription style={{ color: 'var(--fg-muted)' }}>Live POS checkout latency telemetry</CardDescription>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px]" style={{ color: 'var(--fg-subtle)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--status-warn)' }} />
          <span>SLA: {thresholdMins.toFixed(1)}m</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="space-y-3">
          {data.map((item) => {
            const isOverThreshold = item.waitTimeMins > thresholdMins;
            const isSeverelyOver = item.waitTimeMins > 5.0;

            const barColor = isSeverelyOver
              ? 'var(--status-err)'
              : isOverThreshold
              ? 'var(--status-warn)'
              : 'var(--status-ok)';

            const percentage = Math.min(100, (item.waitTimeMins / maxWait) * 100);

            return (
              <div key={item.counter} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium flex items-center gap-1.5" style={{ color: 'var(--fg)' }}>
                    {item.counter}
                    {isSeverelyOver && (
                      <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--status-err)' }} />
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px]" style={{ color: 'var(--fg-muted)' }}>{item.queueLength} in line</span>
                    <span className="font-mono font-semibold text-xs" style={{ color: barColor }}>
                      {item.waitTimeMins.toFixed(1)} m
                    </span>
                  </div>
                </div>

                {/* Progress Bar with Threshold Mark */}
                <div className="relative w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  {/* Threshold marker line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 z-10"
                    style={{ left: `${(thresholdMins / maxWait) * 100}%`, background: 'var(--border-strong)' }}
                  />

                  {/* Bar Fill */}
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: barColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between font-mono text-[10px] pt-2" style={{ color: 'var(--fg-subtle)', borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--status-ok)' }} /> &lt; 3.0m Optimal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--status-warn)' }} /> 3-5m Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--status-err)' }} /> &gt; 5.0m Congested
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
