module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class', // Use class strategy for dark mode
    theme: {
        extend: {},
    },
    variants: {
        extend: {
            opacity: ['disabled'],
        },
    },
    plugins: [],
};
