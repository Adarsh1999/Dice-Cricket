import React from 'react';
import ThemeToggle from './ThemeToggle';
// import SearchIcon from '@material-ui/icons/Search';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function Header() {
    return (
        <div className="flex justify-center font-sans">
            <div className="w-full p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-900 dark:to-indigo-900 shadow-2xl flex items-center justify-between">
                <a href="/" className="hover:no-underline text-white transform hover:scale-105 transition-all duration-300">
                    <h1 className="text-3xl font-bold tracking-wide drop-shadow-lg">
                        🎲 The Dice Cricket 🏏
                    </h1>
                </a>
                <ThemeToggle />
            </div>
        </div>
    );
}
export default Header;
