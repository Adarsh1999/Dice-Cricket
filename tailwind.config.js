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
    plugins: [],
};
