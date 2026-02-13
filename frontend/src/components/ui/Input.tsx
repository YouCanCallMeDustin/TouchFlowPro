import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    startIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, hint, startIcon, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {startIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors">
                            {startIcon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] ring-offset-[var(--bg)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--muted)]/50 focus-visible:outline-none focus-visible:border-[var(--primary)]/50 focus-visible:ring-4 focus-visible:ring-[var(--primary)]/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium",
                            startIcon && "pl-12",
                            error && "border-[var(--danger)] focus-visible:ring-[var(--danger)]/10",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {hint && !error && <p className="text-xs text-[var(--muted)]">{hint}</p>}
                {error && <p className="text-xs text-[var(--danger)] font-bold uppercase tracking-wider">{error}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
