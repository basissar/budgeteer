import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/macros.js';

export default function GoalsForm({ userId, currentWalletId, goals, setGoals, onGoalAddition }) {
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [newGoalCategory, setNewGoalCategory] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/${userId}/categories/${currentWalletId}`, {
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

    const handleAddGoal = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/${userId}/goals/${currentWalletId}`, {
                name: goalName,
                targetAmount: targetAmount,
                currentAmount: currentAmount,
                categoryId: newGoalCategory,
                walletId: currentWalletId

            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newGoal = response.data.goal;
            setGoals([...goals, newGoal]);
            onGoalAddition(newGoal);
            setGoalName('');
            setTargetAmount('');
            setCurrentAmount('');
        } catch (error) {
            console.error("Error adding goal:", error);
        }
    };

    return (
        <div className='goal-form'>
            <h2>Add New Savings Goal</h2>
            <form onSubmit={handleAddGoal} className='goal-form-grid'>
            <div className="input-container">
                    <label htmlFor="category">Category:</label>
                    <select value={newGoalCategory} onChange={(e) => setNewGoalCategory(e.target.value)} required>
                        <option value="">Select Category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id} style={{ backgroundColor: category.color }}>{category.name}</option>
                        ))}
                    </select>
            </div>
            <div className="input-container">
                    <label htmlFor="goalname">Goal name:</label>
                    <input
                        id="goalname"
                        type="text"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        placeholder="Goal Name"
                        required
                    />
                </div>

            <div className="input-container">
            <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="Target Amount"
                required
            />
            </div>
            
            <div className="input-container">
            <input
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="Current Amount"
                required
            />
            </div>

            <div className='button-container'>
                <button type="submit">Add Goal</button>
            </div>
            
        </form>
        </div>
        
    );
}
