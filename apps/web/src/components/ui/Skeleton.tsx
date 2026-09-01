import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800/80',
        className
      )}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-8 rounded-xl" />
    </div>
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-40" />
  </div>
);

export const OverviewSkeleton: React.FC = () => (
  <div className="space-y-8">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>

    <div className="h-44 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-20 w-full" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-64 rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-44 w-full" />
      </div>
      <div className="h-64 rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-44 w-full" />
      </div>
    </div>
  </div>
);
