import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseForm = ({ userId, currentWalletId, expenses, setExpenses }) => {
    const [newExpenseName, setNewExpenseName] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');
    const [newExpenseSource, setNewExpenseSource] = useState(null);
    const [newExpenseTarget, setNewExpenseTarget] = useState('');
    const [newExpenseDate, setNewExpenseDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [categories, setCategories] = useState([]);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/budgeteer/${userId}/categories/${currentWalletId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setCategories(response.data.categories);
            } catch (error) {
                setErrorMessage(`An error occurred while fetching categories`);
                console.error(error.message);
            }
        };

        fetchCategories();
    }, [userId, currentWalletId]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!newExpenseTarget) {
            alert("Please select a target category");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:8000/budgeteer/${userId}/wallets/${currentWalletId}/expenses`,
                {
                    name: newExpenseName,
                    amount: newExpenseAmount,
                    date: newExpenseDate,
                    sourceCategoryId: newExpenseSource,
                    targetCategoryId: newExpenseTarget,
                    walletId: currentWalletId
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                });

            // alert("Expense created successfully!");

            // Show the dialog
            setShowDialog(true);

            setExpenses([...expenses, response.data.expense]);

            setNewExpenseName('');
            setNewExpenseAmount('');
            setNewExpenseSource(null);
            setNewExpenseTarget('');
            setNewExpenseDate('');

        } catch (error) {
            setErrorMessage(`An error occurred while creating expense`);
            console.error(error.message);
        }
    }

    return (
        <div className="expense-form">
            <h2>Add New Expense</h2>
            <form onSubmit={handleFormSubmit} className="expense-form-grid">
                <div className="input-container">
                    <label htmlFor="amount">Amount:</label>
                    <input type="number" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} required />
                </div>

                <div className="input-container">
                    <label htmlFor="name">Expense Name:</label>
                    <input type="text" value={newExpenseName} onChange={(e) => setNewExpenseName(e.target.value)} required />
                </div>

                <div className="input-container">
                    <label htmlFor="target">Target category:</label>
                    <select value={newExpenseTarget} onChange={(e) => setNewExpenseTarget(e.target.value)} required>
                        <option value="">None</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id} style={{ backgroundColor: category.color }}>{category.name}</option>
                        ))}
                    </select>
                </div>

                <div className="input-container">
                    <label htmlFor="source">Source category:</label>
                    <select value={newExpenseSource} onChange={(e) => setNewExpenseSource(e.target.value)}>
                        <option value="">None</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id} style={{ backgroundColor: category.color }}>{category.name}</option>
                        ))}
                    </select>
                </div>

                <div className="input-container">
                    <label htmlFor="date">Expense date:</label>
                    <input type="date" value={newExpenseDate} onChange={(e) => setNewExpenseDate(e.target.value)} required />
                </div>

                <div className="button-container">
                    <button type="submit">Add Expense</button>
                </div>

                {errorMessage && <p>${errorMessage}</p>}
            </form>

            {/* Custom dialog window */}
            {showDialog && (
                <div className="dialog-overlay">
                    <div className="dialog-content">
                        <span className="close" onClick={() => setShowDialog(false)}>&times;</span>
                        <p>Expense created successfully!</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExpenseForm;