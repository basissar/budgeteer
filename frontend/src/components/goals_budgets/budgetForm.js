import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BudgetForm = ({ userId, currentWalletId, budgets, setBudgets, onBudgetAddition}) => {
    const [newBudgetName, setNewBudgetName] = useState('');
    const [newBudgetLimit, setNewBudgetLimit] = useState('');
    const [newBudgetCategory, setNewBudgetCategory] = useState('');
    const [newBudgetRecurrence, setNewBudgetRecurrence] = useState('');
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

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:8000/budgeteer/${userId}/budgets/${currentWalletId}/`,
                {
                    limit: newBudgetLimit,
                    currentAmount: 0,
                    recurrence: newBudgetRecurrence,
                    categoryId: newBudgetCategory,
                    walletId: currentWalletId,
                    name: newBudgetName
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                });

            // Show the dialog
            setShowDialog(true);

            setBudgets([...budgets, response.data.budget]);
            // onBudgetAddition(response.data.budget);

            setNewBudgetName('');
            setNewBudgetLimit('');
            setNewBudgetRecurrence('');
            setNewBudgetCategory('');

        } catch (error) {
            setErrorMessage(`An error occurred while creating budget`);
            console.error(error.message);
        }
    }

    return (
        <div className="budget-form">
            <h2>Add New Budget</h2>
            <form onSubmit={handleFormSubmit} className="budget-form-grid">
                <div className="input-container">
                    <label htmlFor="name">Budget Name:</label>
                    <input type="text" value={newBudgetName} onChange={(e) => setNewBudgetName(e.target.value)} required />
                </div>

                <div className="input-container">
                    <label htmlFor="limit">Limit:</label>
                    <input type="number" value={newBudgetLimit} onChange={(e) => setNewBudgetLimit(e.target.value)} required />
                </div>

                <div className="input-container">
                    <label htmlFor="category">Category:</label>
                    <select value={newBudgetCategory} onChange={(e) => setNewBudgetCategory(e.target.value)} required>
                        <option value="">Select Category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id} style={{ backgroundColor: category.color }}>{category.name}</option>
                        ))}
                    </select>
                </div>

                <div className="input-container">
                    <label htmlFor="recurrence">Recurrence:</label>
                    <select value={newBudgetRecurrence} onChange={(e) => setNewBudgetRecurrence(e.target.value)} required>
                        <option value="">Select Recurrence</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>

                <div className="button-container">
                    <button type="submit">Add Budget</button>
                </div>

                {errorMessage && <p>${errorMessage}</p>}
            </form>

            {/* Custom dialog window */}
            {showDialog && (
                <div className="dialog-overlay">
                    <div className="dialog-content">
                        <span className="close" onClick={() => setShowDialog(false)}>&times;</span>
                        <p>Budget created successfully!</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BudgetForm;
