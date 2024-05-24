import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Budgets from './budgets';
import Goals from './goals/goals';
import { API_BASE_URL, INFO } from '../utils/macros';
import { CustomSelect } from './custom/customSelect';
import './budgets.css';

export default function BudgetGoalOverview() {
    const [currentWalletId, setCurrentWalletId] = useState('');
    const [currentWalletCurrency, setCurrentWalletCurrency] = useState('');
    const [wallets, setWallets] = useState([]);
    const [userId, setUserId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const userResponse = await axios.get(`${INFO}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                setUserId(userResponse.data.user.id);

                const walletResponse = await axios.get(`${API_BASE_URL}/${userResponse.data.user.id}/wallets`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWallets(walletResponse.data.wallets);

                if (walletResponse.data.wallets.length > 0) {
                    const firstWalletId = walletResponse.data.wallets[0].id;
                    setCurrentWalletId(firstWalletId);
                    setCurrentWalletCurrency(walletResponse.data.wallets[0].currency);
                }
            } catch (error) {
                setErrorMessage("An error occurred while fetching data");
                console.log(error);
            }
        };

        fetchData();
    }, []);

    const handleWalletChange = (selectedOption) => {
        setCurrentWalletId(selectedOption.value);
        const selectedWallet = wallets.find(wallet => wallet.id === selectedOption.value);
        setCurrentWalletCurrency(selectedWallet.currency);
    };

    return (
        <div className="budgets_goals_container">
            {errorMessage && <p>{errorMessage}</p>}

            <div className="select-container">
                <CustomSelect
                    options={wallets}
                    value={currentWalletId}
                    onChange={handleWalletChange}
                />
            </div>

            <div className="forms-tables-container">
                <div className="forms-container">
                    <Budgets
                        currentWalletId={currentWalletId}
                        currentWalletCurrency={currentWalletCurrency}
                        userId={userId}
                    />
                    <Goals
                        currentWalletId={currentWalletId}
                        currentWalletCurrency={currentWalletCurrency}
                        userId={userId}
                    />
                </div>
            </div>
        </div>
    );
}
