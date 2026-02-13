import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center justify-center rounded-[var(--radius)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-[var(--primary)] text-white hover:opacity-90 shadow-md hover:shadow-lg": variant === "primary",
                        "bg-[var(--secondary)] text-[var(--bg-main)] hover:opacity-90 shadow-sm": variant === "secondary",
                        "hover:bg-[var(--surface-2)] text-[var(--text)]": variant === "ghost",
                        "bg-[var(--danger)] text-white hover:opacity-90 shadow-sm": variant === "danger",
                        "border border-[var(--border)] bg-transparent hover:bg-[var(--surface-2)] text-[var(--text)]": variant === "outline",

                        "h-8 px-3 text-xs": size === "sm",
                        "h-10 px-4 py-2 text-sm": size === "md",
                        "h-12 px-6 text-base": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                {...props}
            >
                {isLoading && (
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
