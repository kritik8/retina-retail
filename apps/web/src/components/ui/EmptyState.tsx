import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Camera, Sparkles, Store, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-devices' | 'no-insights' | 'day-one-shop';
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  onAction,
  actionLabel,
}) => {
  const configs = {
    'no-devices': {
      icon: Camera,
      defaultTitle: 'No edge cameras paired yet',
      defaultDesc: 'Pair your SNPE vision nodes to start streaming live shopper footfall, queue SLA, and shelf heatmaps.',
      defaultBtn: 'Pair your first camera',
    },
    'no-insights': {
      icon: Sparkles,
      defaultTitle: 'Awaiting AI vision insights',
      defaultDesc: 'Our edge vision backbone generates plain-language insights automatically as shopper traffic is detected.',
      defaultBtn: 'Check edge devices',
    },
    'day-one-shop': {
      icon: Store,
      defaultTitle: "Day one \u2014 let\u2019s get set up",
      defaultDesc: 'Your store profile is active. Pair hardware cameras or configure your 2D floor plan to unlock live analytics.',
      defaultBtn: 'Configure store map',
    },
  };

  const { icon: Icon, defaultTitle, defaultDesc, defaultBtn } = configs[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="py-14 px-8 text-center rounded-[10px] max-w-md mx-auto space-y-4"
      style={{ border: '1px dashed var(--border-strong)', background: 'var(--bg-elevated)' }}
    >
      <div className="flex justify-center">
        <Icon
          className="w-8 h-8"
          style={{ color: 'var(--fg-subtle)', opacity: 0.5 }}
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--fg)' }}>
          {title || defaultTitle}
        </h3>
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          {description || defaultDesc}
        </p>
      </div>

      {onAction && (
        <Button onClick={onAction} variant="primary" size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel || defaultBtn}</span>
        </Button>
      )}
    </motion.div>
  );
};
