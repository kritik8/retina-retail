import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Sparkles, AlertTriangle, Package, TrendingUp, Camera } from 'lucide-react';
import type { AIInsightItem } from '@/lib/mockData';

interface InsightFeedProps {
  insights: AIInsightItem[];
}

export const InsightFeed: React.FC<InsightFeedProps> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  const getInsightIcon = (type: AIInsightItem['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4" style={{ color: 'var(--status-warn)' }} />;
      case 'inventory':
        return <Package className="w-4 h-4" style={{ color: 'var(--status-err)' }} />;
      case 'trend':
        return <TrendingUp className="w-4 h-4" style={{ color: 'var(--status-ok)' }} />;
      case 'device':
        return <Camera className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />;
    }
  };

  const getSeverityBadge = (severity: AIInsightItem['severity']) => {
    switch (severity) {
      case 'high':
        return { label: 'High Priority', style: { background: 'var(--status-err-bg)', color: 'var(--status-err)', border: '1px solid var(--status-err-border)' } };
      case 'medium':
        return { label: 'Attention', style: { background: 'var(--status-warn-bg)', color: 'var(--status-warn)', border: '1px solid var(--status-warn-border)' } };
      case 'info':
      default:
        return { label: 'Info', style: { background: 'var(--bg-subtle)', color: 'var(--fg-muted)', border: '1px solid var(--border)' } };
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2 font-serif font-semibold" style={{ color: 'var(--fg)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
            <span>Real-time Vision Insights</span>
          </CardTitle>
          <CardDescription style={{ color: 'var(--fg-muted)' }}>Automated notifications from edge AI nodes</CardDescription>
        </div>
        <span
          className="text-[10px] font-mono font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
          style={{ background: 'var(--accent-subtle)', color: 'var(--accent-fg)', border: '1px solid var(--accent-border)' }}
        >
          Live Feed
        </span>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {insights.map((insight, idx) => {
          const badge = getSeverityBadge(insight.severity);
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3.5 rounded-lg flex items-start gap-3 transition-colors"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <div className="mt-0.5 shrink-0">{getInsightIcon(insight.type)}</div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[13px] font-medium truncate" style={{ color: 'var(--fg)' }}>
                    {insight.title}
                  </h4>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--fg-subtle)' }}>
                    {insight.timestamp}
                  </span>
                </div>

                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                  {insight.detail}
                </p>

                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md" style={badge.style}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};
