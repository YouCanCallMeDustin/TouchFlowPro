import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}): React.ReactElement => {
    // Base classes
    const baseClasses = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    // Size variants
    const sizeClasses = {
        sm: "text-sm px-3 py-1.5 gap-1.5",
        md: "text-base px-6 py-3 gap-2",
        lg: "text-lg px-8 py-4 gap-2.5"
    };

    // Color/Style variants
    const variantClasses = {
        primary: "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 border border-white/10",
        secondary: "bg-secondary text-white shadow-md shadow-secondary/20 hover:shadow-lg hover:bg-secondary-dark hover:-translate-y-0.5",
        outline: "bg-transparent border-2 border-border text-text-main hover:border-primary hover:text-primary hover:bg-primary/5",
        ghost: "bg-transparent text-text-muted hover:text-text-main hover:bg-surface-2",
        danger: "bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600"
    };

    // Loading spinner
    const Spinner = () => (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <button
            className={`
                ${baseClasses} 
                ${sizeClasses[size]} 
                ${variantClasses[variant]} 
                ${className}
            `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Spinner />}
            {!isLoading && leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
};
