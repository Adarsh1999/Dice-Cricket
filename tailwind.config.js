/* eslint @typescript-eslint/no-var-requires: "off" */

const colors = require('tailwindcss/colors');

module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'media', // 'media' or 'class'
    theme: {
        colors: {
            ...colors,
        },
        extend: {},
    },
    variants: {
        extend: {
            opacity: ['disabled'],
        },
    },
    plugins: [require('@tailwindcss/typography'), require('daisyui')],
    daisyui: {
        themes: [
            {
                cricket: {
                    primary: '#2563EB',
                    secondary: '#FACC15',
                    accent: '#EA580C',
                    neutral: '#1F2937',
                    'base-100': '#F3F4F6',
                    info: '#3ABFF8',
                    success: '#36D399',
                    warning: '#FBBF24',
                    error: '#F87272',
                },
            },
            'light', 'dark',
        ],
    }
};
