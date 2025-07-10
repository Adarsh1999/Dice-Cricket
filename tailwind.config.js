/* eslint @typescript-eslint/no-var-requires: "off" */

const colors = require('tailwindcss/colors');

module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class', // Use class strategy for dark mode
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
    plugins: [],
};
