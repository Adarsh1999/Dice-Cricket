import React from 'react';
import ThemeToggle from './ThemeToggle';
// import SearchIcon from '@material-ui/icons/Search';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function Header() {
    return (
        <div className="flex justify-center font-sans">
            <div className="w-full p-3 bg-blue-500 dark:bg-blue-700 shadow-md flex items-center justify-between">
                <a href="/" className="hover:no-underline text-white">
                    <h1> The Dice Cricket </h1>
                </a>
                <ThemeToggle />
            </div>
        </div>
    );
}
export default Header;
