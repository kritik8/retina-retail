import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, style, ...props }) => {
  return (
    <div
      className={clsx('animate-pulse rounded-[8px]', className)}
      style={{ background: 'var(--bg-subtle)', ...style }}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div
    className="p-5 rounded-[10px] space-y-3"
    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
  >
    <div className="flex items-center justify-between">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="h-7 w-7 rounded-lg" />
    </div>
    <Skeleton className="h-7 w-28" />
    <Skeleton className="h-2.5 w-36" />
  </div>
);

export const OverviewSkeleton: React.FC = () => (
  <div className="space-y-8">
    <div className="space-y-2">
      <Skeleton className="h-6 w-52" />
      <Skeleton className="h-3.5 w-80" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>

    <div
      className="h-40 rounded-[10px] p-5 space-y-4"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-20 w-full" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {[0, 1].map(i => (
        <div
          key={i}
          className="h-60 rounded-[10px] p-5 space-y-3"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-40 w-full" />
        </div>
      ))}
    </div>
  </div>
);
