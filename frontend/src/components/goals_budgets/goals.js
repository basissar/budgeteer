import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoalsForm from './goalsForm.js';
import { API_BASE_URL, INFO } from '../../utils/macros.js';
import { useUserContext } from "../security/userProvider";
import Error from '../custom/error.js';
import GoalsTable from './goalsTable.js';
import { Modal } from 'flowbite-react';

export default function Goals() {
    const [goals, setGoals] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentWalletId, setCurrentWalletId] = useState('');
    const [currentWalletCurrency, setCurrentCurrency] = useState('');
    const [categories, setCategories] = useState([]);

    const { user, currentWallet} = useUserContext();

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const goalsResponse = await axios.get(`${API_BASE_URL}/wallets/${currentWalletId}/goals`, {
                    withCredentials: true
                });
                setGoals(goalsResponse.data.goals);
            } catch (error) {
                setErrorMessage(`An error occurred while fetching goals ${error}`);
            }
        };

        if (currentWalletId) {
            fetchGoals();
        }
    }, [user, currentWalletId]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/categories/${currentWalletId}`, {
                    withCredentials: true
                });

                setCategories(response.data.categories);
            } catch (error) {
                setErrorMessage(`An error occurred while fetching categories`);
                console.error(error.message);
            }
        };

        fetchCategories();
    }, [user, currentWalletId]);

    useEffect(() => {
        if (currentWallet) {
            setCurrentWalletId(currentWallet.id);
            setCurrentCurrency(currentWallet.currency);
        }
    }, [currentWallet])

    const handleGoalAddition = (newGoal) => {
        setGoals([...goals, newGoal]);
    };

    return (
        <div className='mt-5 flex flex-col'>

            <div className="flex flex-row gap-20">
                {currentWalletId && <GoalsForm userId={user.id} currentWalletId={currentWalletId} goals={goals} setGoals={setGoals} onGoalAddition={handleGoalAddition} />}


                <div>
                    <h2>Goals</h2>
                    <GoalsTable
                        goals={goals}
                        currentWalletCurrency={currentWalletCurrency}
                    />
                </div>
            </div>

        </div>
    );
}
