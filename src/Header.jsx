import React from 'react';
// import SearchIcon from '@material-ui/icons/Search';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function Header() {
    return (
        <div className="navbar bg-primary text-primary-content shadow">
            <div className="flex-1 px-2 mx-2 font-bold text-xl">
                <a href="/" className="hover:no-underline">The Dice Cricket</a>
            </div>
            {/* future theme toggle */}
        </div>
    );
}
export default Header;
