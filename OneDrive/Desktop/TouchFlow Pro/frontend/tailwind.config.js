/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
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
                heading: ['Montserrat', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
