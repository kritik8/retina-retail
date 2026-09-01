import React from 'react';
import { clsx } from 'clsx';

const cardBase: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
};

export const Card = ({ className, children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx('transition-colors duration-150', className)}
    style={{ ...cardBase, ...style }}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx('px-5 py-4', className)}
    style={{ borderBottom: '1px solid var(--border)', ...style }}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={clsx('text-[14px] font-semibold tracking-tight', className)}
    style={{ color: 'var(--fg)' }}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={clsx('text-[12px] mt-0.5', className)}
    style={{ color: 'var(--fg-muted)' }}
    {...props}
  >
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx('px-5 py-4 rounded-b-[10px]', className)}
    style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)', ...style }}
    {...props}
  >
    {children}
  </div>
);
