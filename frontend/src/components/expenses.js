import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './expenses.css'; // Import the CSS file
import ExpenseForm from './expenseForm.js';

import deleteIcon from "../assets/delete.svg";
import editIcon from "../assets/edit.svg";
import CustomWalletSelect from './customWalletSelect.js';
import { API_BASE_URL } from '../utils/macros.js';

// Define the array of category icons
const categoryIcons = [
    { name: 'Unclassified', icon: require("../assets/cat-1.svg").default },
    { name: 'Entertainment', icon: require("../assets/cat-2.svg").default },
    { name: 'Food', icon: require("../assets/cat-3.svg").default },
    { name: 'School', icon: require("../assets/cat-4.svg").default },
    { name: 'Transport', icon: require("../assets/cat-5.svg").default },
    { name: 'Shopping', icon: require("../assets/cat-6.svg").default },
    { name: 'Healthcare', icon: require("../assets/cat-7.svg").default },
    { name: 'Housing', icon: require("../assets/cat-8.svg").default },
    { name: 'Pets', icon: require("../assets/cat-9.svg").default },
    { name: 'Travel', icon: require("../assets/cat-10.svg").default },
    { name: 'Subscriptions', icon: require("../assets/cat-11.svg").default }
];


export default function Expenses() {
    const [currentWalletId, setCurrentWalletId] = useState('');
    const [currentWalletCurrency, setCurrentWalletCurrency] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [userId, setUserId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const endpoint = 'http://localhost:8000/userinfo'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const userResponse = await axios.get(endpoint, {
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

                    const expensesResponse = await axios.get(`${API_BASE_URL}/${userResponse.data.user.id}/wallets/${firstWalletId}/expenses`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setExpenses(expensesResponse.data.expenses);
                }
            } catch (error) {
                setErrorMessage("An error occured while fetching data");
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const handleWalletChange = async (selectedOption, e) => {
        setCurrentWalletId(selectedOption);

        const selectedWalletCurr = e;

        setCurrentWalletCurrency(selectedWalletCurr);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/${userId}/wallets/${selectedOption}/expenses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExpenses(response.data.expenses);
        } catch (error) {
            setErrorMessage(`An error occurred while fetching expenses`);
            console.error(error.message);
        }
    }

    const handleEditExpense = async (expenses) => { }

    const handleDeleteExpense = async (expenseId) => {
        try {
            const token = localStorage.getItem('token');
            const reponse = await axios.delete(`${API_BASE_URL}/${userId}/expenses/${expenseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log(reponse);

            setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseId));
        } catch (error) {
            setErrorMessage(`An error occured while deleting an expense`);
            console.error(error.message);
        }
    }

    const memoizedExpenses = useMemo(() => expenses, [expenses]);

    return (
        <div className="container">

            {errorMessage && <p>${errorMessage}</p>}

            <CustomWalletSelect
                label="Select wallet"
                options={wallets.map(wallet => wallet.name)}
                onChange={(option) => {
                    const selectedWallet = wallets.find(wallet => wallet.name === option);
                    handleWalletChange(selectedWallet.id, selectedWallet.currency);
                }}
            />

            <div className="expenses-container">
                <div className="expense-table">
                    <h2>Expenses</h2>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Expense Name</th>
                                    <th>Source Category</th>
                                    <th>Target Category</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memoizedExpenses.map(expense => (
                                    <tr key={expense.id}>
                                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                                        <td>{expense.name}</td>
                                        <td>{expense.sourceCategory ? (
                                            <div className="category-with-icon">
                                                <img className="category-icon" src={categoryIcons.find(icon => icon.name === expense.sourceCategory.name)?.icon} alt={expense.sourceCategory.name} />
                                                <div className="category-div" style={{ backgroundColor: expense.sourceCategory.color, borderRadius: '5px', padding: '5px' }}>
                                                    {expense.sourceCategory.name}
                                                </div>
                                            </div>
                                        ) : ''}</td>
                                        <td>{expense.targetCategory ? (
                                            <div className="category-with-icon">
                                                <img className="category-icon" src={categoryIcons.find(icon => icon.name === expense.targetCategory.name)?.icon} alt={expense.targetCategory.name} />
                                                <div className="category-div" style={{ backgroundColor: expense.targetCategory.color, borderRadius: '5px', padding: '5px' }}>
                                                    {expense.targetCategory.name}
                                                </div>
                                            </div>
                                        ) : ''}</td>
                                        <td className={expense.amount >= 0 ? 'positive-amount' : 'negative-amount'}>
                                            {expense.amount} {currentWalletCurrency}
                                        </td>
                                        <td>
                                            <img src={editIcon} alt="Edit" className="edit-icon" onClick={() => handleEditExpense(expense.id)} />
                                            <img src={deleteIcon} alt="Delete" className="delete-icon" onClick={() => handleDeleteExpense(expense.id)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="expense-form-container">
                    {currentWalletId && <ExpenseForm userId={userId} currentWalletId={currentWalletId} expenses={memoizedExpenses} setExpenses={setExpenses} />}
                </div>
            </div>
        </div>
    );

}