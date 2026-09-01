import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Camera, Sparkles, Store, Plus, Layers } from 'lucide-react';

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
      defaultTitle: 'No Edge Cameras Paired Yet',
      defaultDesc: 'Pair your store SNPE vision nodes to start streaming live shopper footfall, queue SLA, and shelf heatmaps.',
      defaultBtn: 'Pair Your First Camera',
      btnIcon: Plus,
    },
    'no-insights': {
      icon: Sparkles,
      defaultTitle: 'Awaiting AI Vision Insights',
      defaultDesc: 'Our edge computer vision backbone generates plain-language insights automatically as shopper traffic is detected.',
      defaultBtn: 'Refresh Telemetry',
      btnIcon: Sparkles,
    },
    'day-one-shop': {
      icon: Store,
      defaultTitle: 'Welcome to Day One at RetinaRetail',
      defaultDesc: 'Your store profile is active! Pair hardware cameras or configure your 2D Digital Twin floor plan to unlock live analytics.',
      defaultBtn: 'Configure Store Map',
      btnIcon: Layers,
    },
  };

  const config = configs[type];
  const Icon = config.icon;
  const BtnIcon = config.btnIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-10 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 space-y-4 max-w-lg mx-auto"
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          {title || config.defaultTitle}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {description || config.defaultDesc}
        </p>
      </div>

      {onAction && (
        <Button onClick={onAction} variant="primary" size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500 mt-2">
          <BtnIcon className="w-4 h-4" />
          <span>{actionLabel || config.defaultBtn}</span>
        </Button>
      )}
    </motion.div>
  );
};
