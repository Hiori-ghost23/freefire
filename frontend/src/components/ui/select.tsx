import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-11 w-full rounded-lg border px-3 py-2 text-sm bg-white/5 border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          error && 'border-error focus-visible:ring-error',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export { Select };

// Données des pays supportés
export const COUNTRIES = [
  { code: 'BJ', name: 'Bénin', phoneCode: '+229' },
  { code: 'BF', name: 'Burkina Faso', phoneCode: '+226' },
  { code: 'CI', name: 'Côte d\'Ivoire', phoneCode: '+225' },
  { code: 'GW', name: 'Guinée-Bissau', phoneCode: '+245' },
  { code: 'ML', name: 'Mali', phoneCode: '+223' },
  { code: 'NE', name: 'Niger', phoneCode: '+227' },
  { code: 'NG', name: 'Nigeria', phoneCode: '+234' },
  { code: 'SN', name: 'Sénégal', phoneCode: '+221' },
  { code: 'TG', name: 'Togo', phoneCode: '+228' },
  { code: 'FR', name: 'France', phoneCode: '+33' },
];
