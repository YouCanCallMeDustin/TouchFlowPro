/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
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
                // Keep existing colors
                'primary-blue': '#3b82f6',
                'secondary-teal': '#14b8a6',
                'accent-orange': '#f97316',
                'bg-main': '#f8fafc',
                'text-main': '#0f172a',
                'text-muted': '#64748b',
                primary: {
                    blue: 'hsl(209, 100%, 28%)',
                },
                secondary: {
                    teal: 'hsl(180, 100%, 33%)',
                },
                accent: {
                    orange: 'hsl(38, 92%, 51%)',
                },
                bg: {
                    main: 'hsl(220, 20%, 97%)',
                }
            },
            fontFamily: {
                heading: ['Inter', 'system-ui', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            backgroundImage: {
                'gradient-brand': 'linear-gradient(135deg, #1E40AF 0%, #8B5CF6 50%, #EC4899 100%)',
                'gradient-flow': 'linear-gradient(90deg, #06B6D4 0%, #8B5CF6 50%, #EC4899 100%)',
                'gradient-keyboard': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
