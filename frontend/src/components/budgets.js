import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetForm from './budgetForm.js'; // Create a BudgetForm component similar to ExpenseForm.js
import './budgets.css'; // Import the CSS file
import CustomWalletSelect from './customWalletSelect.js';
import { API_BASE_URL, INFO } from '../utils/macros.js';

const categoryIcons = [
    { name: 'Unclassified', icon: require("../assets/categories/cat-1.svg").default },
    { name: 'Entertainment', icon: require("../assets/categories/cat-2.svg").default },
    { name: 'Food', icon: require("../assets/categories/cat-3.svg").default },
    { name: 'School', icon: require("../assets/categories/cat-4.svg").default },
    { name: 'Transport', icon: require("../assets/categories/cat-5.svg").default },
    { name: 'Shopping', icon: require("../assets/categories/cat-6.svg").default },
    { name: 'Healthcare', icon: require("../assets/categories/cat-7.svg").default },
    { name: 'Housing', icon: require("../assets/categories/cat-8.svg").default },
    { name: 'Pets', icon: require("../assets/categories/cat-9.svg").default },
    { name: 'Travel', icon: require("../assets/categories/cat-10.svg").default },
    { name: 'Subscriptions', icon: require("../assets/categories/cat-11.svg").default }
];

export default function Budgets() {
    const [currentWalletId, setCurrentWalletId] = useState('');
    const [currentWalletCurrency, setCurrentWalletCurrency] = useState('');
    const [budgets, setBudgets] = useState([]);
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

                    const budgetsResponse = await axios.get(`${API_BASE_URL}/${userResponse.data.user.id}/budgets/${firstWalletId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setBudgets(budgetsResponse.data.budgets);
                }
            } catch (error) {
                setErrorMessage("An error occurred while fetching data");
                console.log(error);
            }
        };

        fetchData();
    }, []);

    const handleWalletChange = async (event) => {
        const selectedOption = event.target.value;
        const selectedWalletCurrency = event.target.options[event.target.selectedIndex].getAttribute('data-currency');
        
        setCurrentWalletId(selectedOption);
        setCurrentWalletCurrency(selectedWalletCurrency);
    
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/${userId}/budgets/${selectedOption}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBudgets(response.data.budgets);
        } catch (error) {
            setErrorMessage(`An error occurred while fetching budgets`);
            console.error(error.message);
        }
    }

    const handleBudgetAddition = (newBudget) => {
        setBudgets([...budgets, newBudget]);
    }

    const handleEditBudget = async (budgetId) => {

    }

    const handleDeleteBudget = async (budgetId) => {
        console.log("Calling budget delete on budget: ", budgetId);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_BASE_URL}/${userId}/budgets/${budgetId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setBudgets(budgets.filter(budget => budget.id !== budgetId));

        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <div className="container">
            {errorMessage && <p>{errorMessage}</p>}


            <div>
                <label htmlFor="walletSelect">Select wallet</label>
                <select id="walletSelect" className="select-wallet" value={currentWalletId} onChange={handleWalletChange}>
                    {wallets.map(wallet => (
                        <option key={wallet.id} value={wallet.id} data-currency={wallet.currency}>{wallet.name}</option>
                    ))}
                </select>
            </div>

            {/* Budgets table */}
            <div className="budgets-container">
                {/* Budget form */}
                <div className="budget-form-container">
                    {currentWalletId && <BudgetForm userId={userId} currentWalletId={currentWalletId} budgets={budgets} setBudgets={setBudgets} onBudgetAddition={handleBudgetAddition} />}
                </div>


                <div className="budget-table">
                    <h2>Budgets</h2>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Limit</th>
                                    <th>Current Amount</th>
                                    <th>Category</th>
                                    <th>Recurrence</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgets.map(budget => (

                                    <tr key={budget.id}>
                                        <td>{budget.name}</td>
                                        <td>{budget.limit} {currentWalletCurrency}</td>
                                        <td>{budget.currentAmount} {currentWalletCurrency}</td>
                                        <td>{budget.category ? (
                                            <div className="category-with-icon">
                                                <img className="category-icon" src={categoryIcons.find(icon => icon.name === budget.category.name)?.icon} alt={budget.category.name} />
                                                <div className="category-div" style={{ backgroundColor: budget.category.color, borderRadius: '5px', padding: '5px' }}>
                                                    {budget.category.name}
                                                </div>
                                            </div>
                                        ) : ''}</td>
                                        <td>{budget.recurrence}</td>
                                        <td>
                                            <button onClick={() => handleEditBudget(budget.id)}>Edit</button>
                                            <button onClick={() => handleDeleteBudget(budget.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
