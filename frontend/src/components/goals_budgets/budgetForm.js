import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../../utils/macros";
import { useUserContext } from "../security/userProvider";
import Icon from '../custom/icon';
import { Dropdown, Button, TextInput } from 'flowbite-react';
import Error from '../custom/error';

const BudgetForm = ({ userId, currentWalletId, budgets, setBudgets, onBudgetAddition }) => {
    const [newBudgetName, setNewBudgetName] = useState('');
    const [newBudgetLimit, setNewBudgetLimit] = useState('');
    const [newBudgetCategory, setNewBudgetCategory] = useState('');
    const [newBudgetRecurrence, setNewBudgetRecurrence] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [categories, setCategories] = useState([]);
    const [showDialog, setShowDialog] = useState(false);

    const { user } = useUserContext();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/categories/${currentWalletId}`, {
                    withCredentials: true
                });

                setCategories(response.data.categories);
            } catch (error) {
                setErrorMessage(error.response.data.message);
            }
        };

        fetchCategories();
    }, [user, currentWalletId]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${API_BASE_URL}/${userId}/budgets/${currentWalletId}/`,
                {
                    limit: newBudgetLimit,
                    currentAmount: 0,
                    recurrence: newBudgetRecurrence,
                    categoryId: newBudgetCategory,
                    walletId: currentWalletId,
                    name: newBudgetName
                },
                {
                    withCredentials: true
                });

            setShowDialog(true);

            setBudgets([...budgets, response.data.budget]);

            setNewBudgetName('');
            setNewBudgetLimit('');
            setNewBudgetRecurrence('');
            setNewBudgetCategory('');
            setErrorMessage('')

        } catch (error) {
            setErrorMessage(error.response.data.message);
        }
    }

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

    const getRecurrenceLabel = (recurrence) => {
        switch (recurrence) {
            case 'daily':
                return 'Daily';
            case 'weekly':
                return 'Weekly';
            case 'monthly':
                return 'Monthly';
            case 'yearly':
                return 'Yearly';
            default:
                return 'Recurrence';
        }
    };

    return (
        <div className='max-w-lg flex flex-col items-center'>
            <h2>Add New Budget</h2>
            <form onSubmit={handleFormSubmit} className="flex">
                <div className="grid grid-cols-2 gap-4">
                    <div className="w-44">
                        <label htmlFor="name">Budget Name:</label>
                        <TextInput class="focus:border-green-500 focus:ring-green-500" type='text' value={newBudgetName} onChange={(e) => setNewBudgetName(e.target.value)} placeholder='New budget' required />
                    </div>

                    <div className="w-44">
                        <label htmlFor="limit">Limit:</label>
                        <TextInput class="focus:border-green-500 focus:ring-green-500 h-10" type='number' value={newBudgetLimit} onChange={(e) => setNewBudgetLimit(e.target.value)} placeholder='1000' required />
                    </div>

                    <div className='w-44'>
                        <Dropdown
                            label={getDropdownLabel(newBudgetCategory)}
                            color='light'
                            theme={{ floating: { target: "w-full focus:border-green-500 justify-center focus-dg" } }}
                            required>
                            {newBudgetCategory && (
                                <Dropdown.Item onClick={() => setNewBudgetCategory(null)}>
                                    Category
                                </Dropdown.Item>
                            )}

                            <div className='max-h-60 overflow-y-auto'>
                                {categories.map((category) => (
                                    <Dropdown.Item
                                        key={category.id}
                                        onClick={() => setNewBudgetCategory(category.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon id={category.iconId} alt={category.name} color={category.color} />
                                            <span>{category.name}</span>
                                        </div>
                                    </Dropdown.Item>
                                ))}
                            </div>
                        </Dropdown>
                        <input type="hidden" name="newbudgetCategory" value={newBudgetCategory} />
                    </div>

                    <div className='w-44'>
                        <Dropdown
                            label={getRecurrenceLabel(newBudgetRecurrence)}
                            color='light'
                            theme={{ floating: { target: "w-full focus:border-green-500 justify-center focus-dg" } }}
                            required
                        >
                            <Dropdown.Item
                                value="daily"
                                onClick={() => setNewBudgetRecurrence('daily')}
                            >
                                Daily
                            </Dropdown.Item>
                            <Dropdown.Item
                                value="weekly"
                                onClick={() => setNewBudgetRecurrence('weekly')}
                            >
                                Weekly
                            </Dropdown.Item>
                            <Dropdown.Item
                                value="monthly"
                                onClick={() => setNewBudgetRecurrence('monthly')}
                            >
                                Monthly
                            </Dropdown.Item>
                            <Dropdown.Item
                                value="yearly"
                                onClick={() => setNewBudgetRecurrence('yearly')}
                            >
                                Yearly
                            </Dropdown.Item>
                        </Dropdown>
                    </div>

                </div>


                <Button class="self-center flex items-center justify-center text-white rounded-lg" type='submit'>Add budget</Button>


                {errorMessage && <Error message={errorMessage} type={'error'} />}
            </form>

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
