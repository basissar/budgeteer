import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetForm from './budgetForm.js'; // Create a BudgetForm component similar to ExpenseForm.js
import './budgets.css'; // Import the CSS file
import CustomWalletSelect from './customWalletSelect.js';
import { API_BASE_URL, INFO } from '../utils/macros.js';
import { CustomSelect } from './custom/customSelect.js';
import deleteIcon from "../assets/delete.svg";
import editIcon from "../assets/edit.svg";
import { ProgressBar } from './custom/progressBar.js';

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

export default function Budgets({ currentWalletId, currentWalletCurrency, userId })  {

    const [budgets, setBudgets] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const token = localStorage.getItem('token');
                const budgetsResponse = await axios.get(`${API_BASE_URL}/${userId}/budgets/${currentWalletId}`, {
                    headers: { Authorization: `Bearer ${token}` }
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
    }, [currentWalletId, userId]);

    const handleBudgetAddition = (newBudget) => {
        setBudgets([...budgets, newBudget]);
    };

    const handleEditBudget = async (budgetId) => {
        // Implement budget editing functionality
    };

    const handleDeleteBudget = async (budgetId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_BASE_URL}/${userId}/budgets/${budgetId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setBudgets(budgets.filter(budget => budget.id !== budgetId));
        } catch (err) {
            console.error(err.message);
        }
    };
    

    return (
        <div className="budgets-container">
            {errorMessage && <p>{errorMessage}</p>}

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
                                <th>Category</th>
                                <th>Recurrence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map(budget => (
                                <tr key={budget.id}>
                                    <td>{budget.name}</td>
                                    <td id="progress"><ProgressBar percentage={(budget.currentAmount / budget.limit) * 100} color={budget.category && budget.category.color} /> <span>{budget.currentAmount}/{budget.limit} {currentWalletCurrency}</span></td>
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
                                        <img src={editIcon} alt='Edit' className='edit-icon' onClick={() => handleEditBudget(budget.id)} />
                                        <img src={deleteIcon} alt='Delete' className='delete-icon' onClick={() => handleDeleteBudget(budget.id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
