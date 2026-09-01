import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, style, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--fg-muted)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-3 py-2.5 rounded-lg text-[13px] transition-colors duration-150 outline-none',
            'focus:ring-1',
            className
          )}
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--fg)',
            border: `1px solid ${error ? 'var(--status-err)' : 'var(--border)'}`,
            // Focus via CSS — ring-[var(--accent)] won't work as JIT arbitrary,
            // so we override via a CSS custom property workaround
            ...style,
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = error ? 'var(--status-err)' : 'var(--accent)';
            e.currentTarget.style.boxShadow = error
              ? '0 0 0 2px var(--status-err-bg)'
              : '0 0 0 2px var(--accent-subtle)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? 'var(--status-err)' : 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          placeholder={props.placeholder}
          {...props}
        />
        {error && (
          <p className="text-[11px] font-medium" style={{ color: 'var(--status-err)' }}>{error}</p>
        )}
        {helperText && !error && (
          <p className="text-[11px]" style={{ color: 'var(--fg-subtle)' }}>{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
