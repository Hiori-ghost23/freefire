import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary hover:bg-primary/80 text-white',
      secondary: 'bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-white',
      outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
      ghost: 'hover:bg-white/5 text-white',
    };
    
    const sizes = {
      default: 'h-11 px-8 py-2',
      sm: 'h-9 px-3 text-sm',
      lg: 'h-12 px-8 text-lg',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
