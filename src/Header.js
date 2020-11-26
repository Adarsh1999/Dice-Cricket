import React from 'react';
import './Header.css';
// import SearchIcon from '@material-ui/icons/Search';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function Header() {
    return (
        <div className="wrapper">
            <div className="header">
                <a href="/">
                    <h1> The Dice Cricket </h1>
                </a>
            </div>
        </div>
    );
}

export default Header;
