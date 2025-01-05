import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, INFO } from '../../utils/macros.js';
import CustomDialog from '../custom/customDialog.js'
import { useUserContext } from "../security/userProvider";
import { Datepicker, Button, TextInput, Select, Dropdown, DropdownItem } from "flowbite-react";
import Icon from '../custom/icon.js';
import datePickerTheme from '../../themes/datePicker.json';
import Error from '../custom/error.js';

const ExpenseForm = ({ userId, currentWalletId, expenses, setExpenses, categories }) => {
    const [newExpenseName, setNewExpenseName] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');
    const [newExpenseSource, setNewExpenseSource] = useState(null);
    const [newExpenseTarget, setNewExpenseTarget] = useState('');
    const [newExpenseDate, setNewExpenseDate] = useState(new Date());
    const [errorMessage, setErrorMessage] = useState('');
    const [eventResult, setEventResult] = useState(null);
    const [showDialog, setShowDialog] = useState(false);

    const [responseMessage, setResponseMessage] = useState('');

    const { user, showModal} = useUserContext();

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!newExpenseTarget) {
            alert("Please select a target category");
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/wallets/${currentWalletId}/expenses`,
                {
                    name: newExpenseName,
                    amount: newExpenseAmount,
                    date: newExpenseDate,
                    sourceCategoryId: newExpenseSource,
                    targetCategoryId: newExpenseTarget,
                    walletId: currentWalletId
                },
                {
                    withCredentials: true
                });

            setResponseMessage(response.data.message);

            const modalContent = {
                eventResult: response.data.eventResult,
                title: response.data.message
            }

            showModal(modalContent);

            setEventResult(response.data.eventResult);

            setExpenses([...expenses, response.data.expense]);

            setNewExpenseName('');
            setNewExpenseAmount('');
            setNewExpenseSource(null);
            setNewExpenseTarget('');
            setNewExpenseDate(new Date());

        } catch (error) {
            setErrorMessage(`An error occurred while creating expense`);
            console.error(error.message);
        }
    }

    const getDropdownLabel = (selectedId) => {
        if (!selectedId) return "Select a category";
        const selectedCategory = categories.find((cat) => cat.id === selectedId);
        return (
            <div className="flex items-center gap-2 h-5">
                <Icon id={selectedCategory.iconId} alt={selectedCategory.name} color={selectedCategory.color}/>
                <span>{selectedCategory.name}</span>
            </div>
        );
    };

    return (
        <div>
            <h2>Add New Expense</h2>
            <form onSubmit={handleFormSubmit} className="flex">
                <div className="grid grid-cols-2 gap-4">
                    <div className="w-44">
                        <label htmlFor="amount">Amount:</label>
                        <TextInput class="focus:border-green-500 focus:ring-green-500 h-10" type='number' value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} placeholder='1000' required />
                    </div>

                    <div className="w-44">
                        <label htmlFor="name">Expense Name:</label>
                        <TextInput class="focus:border-green-500 focus:ring-green-500" type='text' value={newExpenseName} onChange={(e) => setNewExpenseName(e.target.value)} placeholder='new expense' required />
                    </div>

                    <div className="w-44">
                        <label htmlFor="target">Target category:</label>
                        <Dropdown
                            label={getDropdownLabel(newExpenseTarget)}
                            color='light'
                            theme={{ floating: { target: "w-full focus:border-green-500 justify-center focus-dg" } }}>
                            {newExpenseTarget && (
                                <Dropdown.Item onClick={() => setNewExpenseTarget(null)}>
                                    Select a category
                                </Dropdown.Item>
                            )}

                            <div className='max-h-60 overflow-y-auto'>
                                {categories.map((category) => (
                                    <Dropdown.Item
                                        key={category.id}
                                        onClick={() => setNewExpenseTarget(category.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon id={category.iconId} alt={category.name} color={category.color} />
                                            <span>{category.name}</span>
                                        </div>
                                    </Dropdown.Item>
                                ))}
                            </div>


                        </Dropdown>
                        <input type="hidden" name="target" value={newExpenseTarget} />
                    </div>

                    <div className="w-44">
                        <label htmlFor="source">Source category:</label>
                        <Dropdown
                            label={getDropdownLabel(newExpenseSource)}
                            color='light'
                            theme={{ floating: { target: "w-full focus:border-green-500 justify-center focus-dg" } }}>
                            {newExpenseSource && (
                                <Dropdown.Item onClick={() => setNewExpenseSource(null)}>
                                    Select a category
                                </Dropdown.Item>
                            )}

                            <div className='max-h-60 overflow-y-auto'>
                                {categories.map((category) => (
                                    <Dropdown.Item
                                        key={category.id}
                                        onClick={() => setNewExpenseSource(category.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon id={category.iconId} alt={category.name} color={category.color}/>
                                            <span>{category.name}</span>
                                        </div>
                                    </Dropdown.Item>
                                ))}
                            </div>


                        </Dropdown>
                        <input type="hidden" name="source" value={newExpenseSource} />
                    </div>
                </div>

                <div className='flex flex-col items-center gap-4'>
                    <div>
                        <label htmlFor="date">Expense date:</label>
                        <Datepicker selected={newExpenseDate} onChange={(date) => setNewExpenseDate(date)} required
                        theme={datePickerTheme}
                        />
                    </div>

                    <Button class="self-center flex items-center justify-center text-white rounded-lg" type='submit'>Add expense</Button>


                </div>
                {errorMessage && <Error message={errorMessage} type={'error'}/>}
            </form>
        </div>
    );
}

export default ExpenseForm;