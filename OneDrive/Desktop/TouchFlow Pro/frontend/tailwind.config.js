/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Semantic Tokens
                bg: {
                    main: 'var(--bg-main)',
                    card: 'var(--bg-card)',
                },
                surface: {
                    DEFAULT: 'var(--bg-card)',
                    2: 'var(--surface-2)', // We'll add this to index.css
                },
                text: {
                    main: 'var(--text-main)',
                    muted: 'var(--text-muted)',
                },
                border: {
                    DEFAULT: 'var(--glass-border)',
                },
                // Brand Colors (mapped to CSS vars for runtime flexibility)
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: '#ffffff',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: '#ffffff',
                },
                // Keep legacy brand object for backward compatibility if needed, 
                // but prefer the semantic ones above.
                brand: {
                    blue: {
                        DEFAULT: '#1E40AF',
                        dark: '#1E3A8A',
                        light: '#3B82F6',
                    },
                    magenta: {
                        DEFAULT: '#EC4899',
                        dark: '#DB2777',
                        light: '#F472B6',
                    },
                    cyan: {
                        DEFAULT: '#06B6D4',
                        light: '#22D3EE',
                        bright: '#67E8F9',
                    },
                    purple: {
                        DEFAULT: '#8B5CF6',
                        indigo: '#6366F1',
                        violet: '#A855F7',
                    },
                },
            },
            fontFamily: {
                heading: ['var(--font-heading)', 'Inter', 'system-ui', 'sans-serif'],
                body: ['var(--font-body)', 'Inter', 'sans-serif'],
                mono: ['var(--font-mono)', 'Fira Code', 'monospace'],
            },
            boxShadow: {
                'sm': 'var(--shadow-sm)',
                'md': 'var(--shadow-md)',
                'lg': 'var(--shadow-lg)',
                'premium': 'var(--shadow-premium)',
                '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            },
            backgroundImage: {
                'gradient-brand': 'linear-gradient(135deg, #1E40AF 0%, #8B5CF6 50%, #EC4899 100%)',
                'gradient-flow': 'linear-gradient(90deg, #06B6D4 0%, #8B5CF6 50%, #EC4899 100%)',
                'gradient-keyboard': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
}
