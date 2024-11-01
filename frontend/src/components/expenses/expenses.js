import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './expenses.css';
import ExpenseForm from './expenseForm.js';
import { CustomCardSelect } from '../custom/customCardSelect.js';

import deleteIcon from "../../assets/delete.svg";
import editIcon from "../../assets/edit.svg";
import { API_BASE_URL, INFO } from '../../utils/macros.js';

// Define the array of category icons
const categoryIcons = [
    { name: 'Unclassified', icon: require("../../assets/categories/cat-1.svg").default },
    { name: 'Entertainment', icon: require("../../assets/categories/cat-2.svg").default },
    { name: 'Food', icon: require("../../assets/categories/cat-3.svg").default },
    { name: 'School', icon: require("../../assets/categories/cat-4.svg").default },
    { name: 'Transport', icon: require("../../assets/categories/cat-5.svg").default },
    { name: 'Shopping', icon: require("../../assets/categories/cat-6.svg").default },
    { name: 'Healthcare', icon: require("../../assets/categories/cat-7.svg").default },
    { name: 'Housing', icon: require("../../assets/categories/cat-8.svg").default },
    { name: 'Pets', icon: require("../../assets/categories/cat-9.svg").default },
    { name: 'Travel', icon: require("../../assets/categories/cat-10.svg").default },
    { name: 'Subscriptions', icon: require("../../assets/categories/cat-11.svg").default }
];


export default function Expenses() {
    const [currentWalletId, setCurrentWalletId] = useState('');
    const [currentWalletCurrency, setCurrentWalletCurrency] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [userId, setUserId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const userResponse = await axios.get(INFO, {
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

    const handleWalletChange = async (selectedOption) => {
        setCurrentWalletId(selectedOption.value);
        const selectedWallet = wallets.find(wallet => wallet.id === selectedOption.value);
        setCurrentWalletCurrency(selectedWallet.currency)

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/${userId}/wallets/${selectedOption.value}/expenses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExpenses(response.data.expenses);
        } catch (error) {
            setErrorMessage(`An error occurred while fetching expenses`);
            console.error(error.message);
        }
    }

    //TODO add handleEditExpense
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

    const sortedExpenses = useMemo(() => {
        return [...expenses].sort((a, b) => {
            const fieldA = a[sortField];
            const fieldB = b[sortField];

            if (typeof fieldA === 'string' && typeof fieldB === 'string') {
                return sortOrder === 'asc'
                    ? fieldA.localeCompare(fieldB, undefined, {sensitivity: 'base'})
                    : fieldB.localeCompare(fieldA, undefined, {sensitivity: 'base'});
            }

            if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
            if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [expenses, sortField, sortOrder]);

    const filteredExpenses = useMemo(() => {
        return sortedExpenses.filter(expense => {
            if (!categoryFilter) return true;
            return expense.sourceCategory?.name === categoryFilter || expense.targetCategory?.name === categoryFilter;
        });
    }, [sortedExpenses, categoryFilter]);

    const handleSortChange = (e) => {
        setSortField(e.target.value);
    };

    const toggleSortOrder = () => {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    const handleCategoryFilterChange = (e) => {
        setCategoryFilter(e.target.value);
    };

    return (
        <div className="container">
            <div className="sort-select-container">
                <div className="select-container">
                    <CustomCardSelect
                        options={wallets}
                        value={currentWalletId}
                        onChange={handleWalletChange}
                    />
                </div>

                <div className="sort-controls">
                    <span>Sort by:</span>
                    <div className="sort-radio">
                        <label>
                            <input
                                type="radio"
                                value="date"
                                checked={sortField === 'date'}
                                onChange={handleSortChange}
                            />
                            Date
                        </label>
                    </div>
                    <div className="sort-radio">
                        <label>
                            <input
                                type="radio"
                                value="amount"
                                checked={sortField === 'amount'}
                                onChange={handleSortChange}
                            />
                            Amount
                        </label>
                    </div>
                    <div className="sort-radio">
                        <label>
                            <input
                                type="radio"
                                value="name"
                                checked={sortField === 'name'}
                                onChange={handleSortChange}
                            />
                            Name
                        </label>
                    </div>
                    <button onClick={toggleSortOrder}>
                        {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                    </button>

                    <div className="category-filter">
                        <label>
                            Category:
                            <select value={categoryFilter} onChange={handleCategoryFilterChange}>
                                <option value="">All</option>
                                {categoryIcons.map(category => (
                                    <option key={category.name} value={category.name}>{category.name}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
            </div>


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
                            {filteredExpenses.map(expense => (
                                <tr key={expense.id}>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                    <td>{expense.name}</td>
                                    <td>{expense.sourceCategory ? (
                                        <div className="category-with-icon">
                                            <img className="category-icon"
                                                 src={categoryIcons.find(icon => icon.name === expense.sourceCategory.name)?.icon}
                                                 alt={expense.sourceCategory.name}/>
                                            <div className="category-div" style={{
                                                backgroundColor: expense.sourceCategory.color,
                                                borderRadius: '5px',
                                                padding: '5px'
                                            }}>
                                                {expense.sourceCategory.name}
                                            </div>
                                        </div>
                                    ) : ''}</td>
                                    <td>{expense.targetCategory ? (
                                        <div className="category-with-icon">
                                            <img className="category-icon"
                                                 src={categoryIcons.find(icon => icon.name === expense.targetCategory.name)?.icon}
                                                 alt={expense.targetCategory.name}/>
                                            <div className="category-div" style={{
                                                backgroundColor: expense.targetCategory.color,
                                                borderRadius: '5px',
                                                padding: '5px' }}>
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

            {errorMessage && <p>${errorMessage}</p>}
        </div>
    );

}