import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetForm from './budgetForm.js';
import { API_BASE_URL } from '../../utils/macros.js';
import { useUserContext } from "../security/userProvider";
import BudgetTable from './budgetTable.js';
import Error from '../custom/error.js';
import { use } from 'react';

export default function Budgets() {
    const [currentWalletId, setCurrentWalletId] = useState('');
    const [currentWalletCurrency, setCurrentCurrency] = useState('');

    const [budgets, setBudgets] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const { user, currentWallet, wallets } = useUserContext();

    useEffect(() => {
        const fetchBudgets = async () => {
            if (!user, !currentWalletId) return;

            try {
                const budgetsResponse = await axios.get(`${API_BASE_URL}/${user.id}/budgets/${currentWalletId}`, {
                    withCredentials: true
                });
                setBudgets(budgetsResponse.data.budgets);
            } catch (error) {
                setErrorMessage("An error occurred while fetching budgets");
                console.log(error);
            }
        };

        if (currentWalletId) {
            fetchBudgets();
        }
    }, [currentWalletId, user]);

    useEffect(() => {
        if (currentWallet) {
            setCurrentWalletId(currentWallet.id);
            setCurrentCurrency(currentWallet.currency);
        }
    }, [currentWallet])

    const handleWalletChange = async (walletId) => {
        setCurrentWalletId(walletId);
        const selectedWallet = wallets.find(wallet => wallet.id === walletId);
        setCurrentCurrency(selectedWallet.currency);
    }

    const handleBudgetAddition = (newBudget) => {
        setBudgets([...budgets, newBudget]);
    };

    const handleEditBudget = async (budgetId) => {
        // Implement budget editing functionality
    };

    const handleDeleteBudget = async (budgetId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/${user.id}/budgets/${budgetId}`, {
                withCredentials: true
            });

            setBudgets(budgets.filter(budget => budget.id !== budgetId));
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className='mt-5 flex flex-col'>

            <div className="flex flex-row gap-20">

                {currentWalletId && <BudgetForm userId={user.id} currentWalletId={currentWalletId} budgets={budgets} setBudgets={setBudgets} onBudgetAddition={handleBudgetAddition} />}

                <div>
                    <h2>Budgets</h2>
                    <BudgetTable
                        budgets={budgets}
                        currentWalletCurrency={currentWalletCurrency}
                        handleEditBudget={handleEditBudget}
                        handleDeleteBudget={handleDeleteBudget}
                    />
                </div>
            </div>

            {errorMessage && <Error message={errorMessage} type={'error'} />}

        </div>
    );
}
