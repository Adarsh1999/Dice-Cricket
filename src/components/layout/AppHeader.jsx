import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from '../ui/Icon';
import ThemeToggle from './ThemeToggle';

function AppHeader() {
    return (
        <header className="app-header">
            <div className="app-header__inner">
                <Link aria-label="Dice Cricket home" className="brand" to="/">
                    <span className="brand__mark">
                        <Icon name="dice" size={23} />
                    </span>
                    <span className="brand__copy">
                        <strong>Dice Cricket</strong>
                        <small>Match Centre</small>
                    </span>
                </Link>

                <nav aria-label="Primary navigation" className="app-nav">
                    <NavLink activeClassName="app-nav__link--active" className="app-nav__link" exact to="/">
                        <Icon name="home" size={17} />
                        <span>New match</span>
                    </NavLink>
                    <NavLink activeClassName="app-nav__link--active" className="app-nav__link" to="/history">
                        <Icon name="history" size={17} />
                        <span>Archive</span>
                    </NavLink>
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}

export default AppHeader;
