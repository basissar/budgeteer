import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './header.css';
import logo from '../assets/budget_logo.svg';

const Header = () => {
    const location = useLocation();

    // Define an array of paths where you don't want to show the header
    const excludedPaths = ['/login', '/register'];

    // Check if the current path is in the excludedPaths array
    const showHeader = !excludedPaths.includes(location.pathname);

    // If the current path is in excludedPaths, don't render the header
    if (!showHeader) {
        return null;
    }

    return (
        <header>
            <div className="logo">
				<img src={logo} alt="Logo"/>
			</div>

            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/expenses">Expenses</Link></li>
                    <li><Link to="/analytics">Analytics</Link></li>
                    <li><Link to="/budgets-savings">Budgets & Savings</Link></li>
                    <li><Link to="/wallets">Wallets</Link></li>
                    <li><Link to="/avatar">Avatar</Link></li>
                    <li><Link to="/account">Account</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
