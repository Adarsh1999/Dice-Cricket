import React from 'react';
// import SearchIcon from '@material-ui/icons/Search';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function Header() {
    return (
        <div className="flex justify-center font-sans">
            <div className=" w-full p-3 bg-blue-500 shadow-md">
                <a href="/" className="hover:no-underline text-white">
                    <h1> The Dice Cricket </h1>
                </a>
            </div>
        </div>
    );
}
export default Header;
