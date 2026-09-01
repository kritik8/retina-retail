import React from 'react';
import { clsx } from 'clsx';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      'rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-sm transition-all duration-200',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('px-6 py-5 border-b border-slate-100 dark:border-slate-800/60', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={clsx('text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={clsx('text-sm text-slate-500 dark:text-slate-400 mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-xl', className)} {...props}>
    {children}
  </div>
);
