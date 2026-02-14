import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    startIcon?: React.ReactNode;
    label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, startIcon, label, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && <label className="block text-sm font-medium mb-1 text-text-muted">{label}</label>}
                <div className="relative">
                    {startIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {startIcon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            startIcon && "pl-10",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
