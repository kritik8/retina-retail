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
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Counter Queue Wait Times (Last 4 Hours)</span>
          </CardTitle>
          <CardDescription>Live POS checkout latency telemetry</CardDescription>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>SLA Target: {thresholdMins.toFixed(1)}m</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="space-y-3">
          {data.map((item) => {
            const isOverThreshold = item.waitTimeMins > thresholdMins;
            const isSeverelyOver = item.waitTimeMins > 5.0;

            const barColor = isSeverelyOver
              ? 'bg-rose-500'
              : isOverThreshold
              ? 'bg-amber-500'
              : 'bg-emerald-500';

            const percentage = Math.min(100, (item.waitTimeMins / maxWait) * 100);

            return (
              <div key={item.counter} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    {item.counter}
                    {isSeverelyOver && (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{item.queueLength} in line</span>
                    <span className={`font-mono font-bold ${isSeverelyOver ? 'text-rose-400' : isOverThreshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {item.waitTimeMins.toFixed(1)} min
                    </span>
                  </div>
                </div>

                {/* Progress Bar with Threshold Mark */}
                <div className="relative w-full h-3 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                  {/* Threshold marker line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-600 z-10 stroke-dasharray"
                    style={{ left: `${(thresholdMins / maxWait) * 100}%` }}
                  />

                  {/* Bar Fill */}
                  <motion.div
                    className={`h-full ${barColor} rounded-lg`}
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
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt; 3.0m Optimal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> 3-5m Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt; 5.0m Congested
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
