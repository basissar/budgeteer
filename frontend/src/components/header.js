import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/budget_logo.svg';

const Header = () => {

    const location = useLocation();

    const excludedPaths = ['/login', '/register'];

    const showHeader = !excludedPaths.includes(location.pathname);

    if (!showHeader) {
        return null;
    }

    return (
        <header>
            <div>
                <img src={logo} alt="Logo" />
            </div>

            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/expenses">Expenses</Link></li>
                    <li><Link to="/analytics">Analytics</Link></li>
                    <li><Link to="/budgets_and_goals">Budgets & Savings</Link></li>
                    <li><Link to="/wallets">Wallets</Link></li>
                    <li><Link to="/avatarOverview">Avatar</Link></li>
                    <li><Link to="/account">Account</Link></li>
                </ul>
            </nav>

        </header>
    );
};

export default Header;
