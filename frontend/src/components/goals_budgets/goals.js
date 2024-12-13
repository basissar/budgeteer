import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoalsForm from './goalsForm.js';
import './budgets.css'; // Use the same CSS file
// import CustomWalletSelect from './customWalletSelect';
import { API_BASE_URL, INFO } from '../../utils/macros.js';
import { CustomCardSelect } from '../custom/customCardSelect.js';
import deleteIcon from "../../assets/delete.svg";
import editIcon from "../../assets/edit.svg";
import { ProgressBar } from '../custom/progressBar.js';
import {useUserContext} from "../security/userProvider";

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

export default function Goals({ currentWalletId, currentWalletCurrency, userId })  {
    const [goals, setGoals] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const { user } = useUserContext();

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const goalsResponse = await axios.get(`${API_BASE_URL}/${user.id}/goals/${currentWalletId}`, {
                    withCredentials: true
                });
                setGoals(goalsResponse.data.goals);
            } catch (error) {
                setErrorMessage("An error occurred while fetching goals");
                console.log(error);
            }
        };

        if (currentWalletId) {
            fetchGoals();
        }
    }, [user, currentWalletId, userId]);

    const handleGoalAddition = (newGoal) => {
        setGoals([...goals, newGoal]);
    };

    const handleEditGoal = async (goalId) => {
        // Implement goal editing functionality
    };

    const handleDeleteGoal = async (goalId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/${user.id}/goals/${goalId}`, {
                withCredentials: true
            });

            setGoals(goals.filter(goal => goal.id !== goalId));
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="goals-container">
            {errorMessage && <p>{errorMessage}</p>}

            <div className="goal-form-container">
                {currentWalletId && <GoalsForm userId={userId} currentWalletId={currentWalletId} goals={goals} setGoals={setGoals} onGoalAddition={handleGoalAddition} />}
            </div>

            <div className="goal-table">
                <h2>Goals</h2>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Progress</th>
                                <th>Category</th>   
                            </tr>
                        </thead>
                        <tbody>
                            {goals.map(goal => (
                                <tr key={goal.id}>
                                    <td>{goal.name}</td>
                                    <td id="progress">
                                        <ProgressBar percentage={(goal.currentAmount / goal.targetAmount) * 100} color="#4CAF50" />
                                        <span>{goal.currentAmount}/{goal.targetAmount} {currentWalletCurrency}</span>
                                    </td>
                                    <td>
                                        {goal.category ? (
                                            <div className="category-with-icon">
                                                <img className="category-icon" src={categoryIcons.find(icon => icon.name === goal.category.name)?.icon} alt={goal.category.name} />
                                                <div className="category-div" style={{ backgroundColor: goal.category.color, borderRadius: '5px', padding: '5px' }}>
                                                    {goal.category.name}
                                                </div>
                                            </div>
                                        ) : ''}
                                    </td>
                                    <td>
                                        <img src={editIcon} alt='Edit' className='edit-icon' onClick={() => handleEditGoal(goal.id)} />
                                        <img src={deleteIcon} alt='Delete' className='delete-icon' onClick={() => handleDeleteGoal(goal.id)} />
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
