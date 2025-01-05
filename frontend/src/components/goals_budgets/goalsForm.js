import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/macros.js';
import { useUserContext } from "../security/userProvider";
import Icon from '../custom/icon.js';
import { Dropdown, TextInput, Button, Modal } from 'flowbite-react';
import Error from '../custom/error.js';
import Credits from '../../assets/credit.svg?react';

export default function GoalsForm({ userId, currentWalletId, goals, setGoals, onGoalAddition }) {
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [newGoalCategory, setNewGoalCategory] = useState(null);

    const { user, showModal } = useUserContext();

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
    }, [user, userId, currentWalletId]);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/goals`, {
                name: goalName,
                targetAmount: targetAmount,
                currentAmount: 0,
                categoryId: newGoalCategory,
                walletId: currentWalletId

            }, {
                withCredentials: true
            });

            const newGoal = response.data.goal;
            setGoals([...goals, newGoal]);
            onGoalAddition(newGoal);
            setGoalName('');
            setTargetAmount('');
            setNewGoalCategory(null);
            setErrorMessage('');

            const modalContent = {
                eventResult: response.data.eventResult,
                title: response.data.message,
            }

            showModal(modalContent);
        } catch (error) {
            setErrorMessage(error.response.data.message);
        }
    };

    const getDropdownLabel = (selectedId) => {
        if (!selectedId) return "Select a category";
        const selectedCategory = categories.find((cat) => cat.id === selectedId);
        return (
            <div className="flex items-center gap-2 h-5">
                <Icon id={selectedCategory.iconId} alt={selectedCategory.name} color={selectedCategory.color} />
                <span>{selectedCategory.name}</span>
            </div>
        );
    };

    return (
        <div className='max-w-lg flex flex-col items-center'>
            <h2>Add New Savings Goal</h2>
            <form onSubmit={handleAddGoal} className="flex flex-col items-center">

                <div className="grid grid-cols-2 gap-4">
                    <div className='w-44'>
                        <label htmlFor="goalname">Goal name:</label>
                        <TextInput id="goalname" class="focus:border-green-500 focus:ring-green-500" type='text' value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder='New goal' required />
                    </div>

                    <div className='w-44'>
                        <label>Target amount:</label>
                        <TextInput class="focus:border-green-500 focus:ring-green-500" type='number' value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder='1000' required />
                    </div>
                    
                </div>

                <div className='w-44'>
                        <Dropdown
                            label={getDropdownLabel(newGoalCategory)}
                            color='light'
                            theme={{ floating: { target: "w-full focus:border-green-500 justify-center focus-dg" } }}
                            required>
                            {newGoalCategory && (
                                <Dropdown.Item onClick={() => setNewGoalCategory(null)}>
                                    Category
                                </Dropdown.Item>
                            )}

                            <div className='max-h-60 overflow-y-auto'>
                                {categories.map((category) => (
                                    <Dropdown.Item
                                        key={category.id}
                                        onClick={() => setNewGoalCategory(category.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon id={category.iconId} alt={category.name} color={category.color} />
                                            <span>{category.name}</span>
                                        </div>
                                    </Dropdown.Item>
                                ))}
                            </div>


                        </Dropdown>
                        <input type="hidden" name="newGoalCategory" value={newGoalCategory} />
                    </div>



                <Button class="self-center flex items-center justify-center text-white rounded-lg" type='submit'>Add goal</Button>

            </form>

            {errorMessage && <Error message={errorMessage} type={'error'} />}

        </div>

    );
}
