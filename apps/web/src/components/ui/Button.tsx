import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, style, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed';

    const sizeMap = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-3.5 py-2 text-sm gap-2',
      lg: 'px-4.5 py-2.5 text-sm gap-2',
    };

    // We use inline style for CSS-var-based colors to avoid Tailwind JIT misses
    const variantStyleMap: Record<string, React.CSSProperties> = {
      primary:   { background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none' },
      secondary: { background: 'var(--bg-subtle)', color: 'var(--fg)', border: '1px solid var(--border)' },
      outline:   { background: 'transparent', color: 'var(--fg)', border: '1px solid var(--border)' },
      ghost:     { background: 'transparent', color: 'var(--fg-muted)', border: 'none' },
      danger:    { background: 'var(--status-err-bg)', color: 'var(--status-err)', border: '1px solid var(--status-err)' },
    };

    const hoverClass: Record<string, string> = {
      primary:   'hover:opacity-90',
      secondary: 'hover:opacity-80',
      outline:   'hover:bg-[var(--bg-subtle)]',
      ghost:     'hover:bg-[var(--bg-subtle)]',
      danger:    'hover:opacity-90',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(base, sizeMap[size], hoverClass[variant], className)}
        style={{ ...variantStyleMap[variant], ...style }}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
