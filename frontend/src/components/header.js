import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/budget_logo.svg?react';
import WalletSelect from './custom/walletSelect';

const Header = () => {

    const location = useLocation();

    const excludedPaths = ['/login', '/register'];

    const excludedWalletSelectPaths = ['/account', '/avatarOverview', '/wallets'];

    const walletExclusionPattern = /^\/wallets(\/|$)/;

    const showHeader = !excludedPaths.includes(location.pathname);

    const showWalletSelect = !excludedWalletSelectPaths.includes(location.pathname) && !walletExclusionPattern.test(location.pathname);

    if (!showHeader) {
        return null;
    }

    return (
        <header>
            <div>
                <Logo/>
            </div>

            {showWalletSelect && (
                <div className="w-44">
                    <WalletSelect />
                </div>
            )}

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
