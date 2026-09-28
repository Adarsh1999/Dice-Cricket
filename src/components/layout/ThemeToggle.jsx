import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme === 'dark';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

function ThemeToggle() {
    const [isDark, setIsDark] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    return (
        <button
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="icon-button"
            onClick={() => setIsDark((currentTheme) => !currentTheme)}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            type="button"
        >
            <Icon name={isDark ? 'sun' : 'moon'} size={18} />
        </button>
    );
}

export default ThemeToggle;
