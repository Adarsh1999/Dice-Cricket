import React, { useEffect, useState } from 'react';

// Simple dark mode toggle. It adds or removes the `dark` class on the root <html> element
// and persists the user's preference in localStorage so it is remembered across sessions.

function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    // On mount, read the stored preference or fall back to system preference
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsDark((prev) => !prev);
    };

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded focus:outline-none text-white dark:text-yellow-400 focus:ring-2 focus:ring-offset-2 focus:ring-white dark:focus:ring-yellow-400"
        >
            {isDark ? '🌞' : '🌙'}
        </button>
    );
}

export default ThemeToggle;
