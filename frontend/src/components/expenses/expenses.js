import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ExpenseForm from './expenseForm.js';

import { API_BASE_URL, INFO } from '../../utils/macros.js';
import { useUserContext } from "../security/userProvider";
import Icon from '../custom/icon.js';
import { Dropdown, Radio, Label, Table } from 'flowbite-react';
import UpArrow from '../custom/UpArrow.jsx';
import DownArrow from '../custom/DownArrow.jsx';
import ExpenseTable from './expenseTable.js';
import WalletSelect from '../custom/walletSelect.js';

export default function Expenses() {
    const [currentWalletId, setCurrentWalletId] = useState('');
    const [currentWalletCurrency, setCurrentWalletCurrency] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [wallets, setWallets] = useState([]);

    const [categories, setCategories] = useState([]);

    const [userId, setUserId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    const [categoryFilter, setCategoryFilter] = useState('');

    const { user } = useUserContext();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            setUserId(user.id);

            try {
                const walletResponse = await axios.get(`${API_BASE_URL}/${user.id}/wallets`, {
                    withCredentials: true,
                });
                setWallets(walletResponse.data.wallets);

                if (walletResponse.data.wallets.length > 0) {
                    const firstWalletId = walletResponse.data.wallets[0].id;
                    setCurrentWalletId(firstWalletId);
                    setCurrentWalletCurrency(walletResponse.data.wallets[0].currency);

                    const expensesResponse = await axios.get(`${API_BASE_URL}/${user.id}/wallets/${firstWalletId}/expenses`, {
                        withCredentials: true,
                    });
                    setExpenses(expensesResponse.data.expenses);
                }
            } catch (error) {
                setErrorMessage("An error occured while fetching data");
                console.error(error);
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!user || !currentWalletId) return;

            try {
                const response = await axios.get(`${API_BASE_URL}/${user.id}/categories/${currentWalletId}`, {
                    withCredentials: true,
                });
                setCategories(response.data.categories);
            } catch (error) {
                setErrorMessage("An error occurred while fetching categories.");
                console.error(error);
            }
        };

        fetchCategories();
    }, [user, currentWalletId]);

    const handleWalletChange = async (selectedOption) => {
        setCurrentWalletId(selectedOption.value);
        const selectedWallet = wallets.find(wallet => wallet.id === selectedOption.value);
        setCurrentWalletCurrency(selectedWallet.currency)

        try {
            const response = await axios.get(`${API_BASE_URL}/${user.id}/wallets/${selectedOption.value}/expenses`, {
                withCredentials: true,
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
            const response = await axios.delete(`${API_BASE_URL}/${userId}/expenses/${expenseId}`, {
                withCredentials: true,
            });

            console.log(response);

            setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseId));
        } catch (error) {
            setErrorMessage(`An error occurred while deleting an expense`);
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
                    ? fieldA.localeCompare(fieldB, undefined, { sensitivity: 'base' })
                    : fieldB.localeCompare(fieldA, undefined, { sensitivity: 'base' });
            }

            if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
            if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [expenses, sortField, sortOrder]);

    const filteredExpenses = useMemo(() => {
        return sortedExpenses.filter(expense => {
            if (!categoryFilter) return true;
            return expense.sourceCategory?.id === categoryFilter || expense.targetCategory?.id === categoryFilter;
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

    const getDropdownLabel = (selectedId) => {
        if (!selectedId) return "All categories";

        const selectedCategory = categories.find((cat) => cat.id === selectedId);
        return (
            <div className="flex items-center gap-2 h-5">
                <Icon id={selectedCategory.id} alt={selectedCategory.name} />
                <span>{selectedCategory.name}</span>
            </div>
        );
    };

    return (
        <div className="flex items-center flex-col">
            <div className="flex items-center gap-x-5 m-2.5">
                <div className="w-44">
                    <WalletSelect wallets={wallets} handleWalletChange={handleWalletChange} currentWalletId={currentWalletId} />
                </div>

                <div className="flex items-center gap-4">
                    <legend>Sort by:</legend>
                    <fieldset className="flex flex-row gap-2">
                        <div className="flex items-center gap-2">
                            <Radio className="radio-dg" value="date" checked={sortField === 'date'} onChange={handleSortChange} id="date" />
                            <Label htmlFor="date">Date</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Radio className="radio-dg" value="amount" checked={sortField === 'amount'} onChange={handleSortChange} id="amount" />
                            <Label htmlFor="amount">Amount</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Radio className="radio-dg" value="name" checked={sortField === 'name'} onChange={handleSortChange} id="name" />
                            <Label htmlFor="name">Name</Label>
                        </div>
                    </fieldset>
                </div>


                <button
                    onClick={toggleSortOrder}
                    className="flex flex-row items-center justify-center p-2 rounded-md hover:bg-gray-200 transition h-10"
                    aria-label="Toggle Sort Order"
                >
                    <UpArrow color={sortOrder === "asc" ? "black" : "gray"} />
                    <DownArrow color={sortOrder === "desc" ? "black" : "gray"} />
                </button>


                <div class="w-44">
                    <Dropdown
                        label={getDropdownLabel(categoryFilter)}
                        color="light"
                        theme={{ floating: { target: "w-full focus:border-green-500 justify-center focus-dg" } }}>

                        <Dropdown.Item onClick={() => handleCategoryFilterChange({ target: { value: "" } })}>
                            All categories
                        </Dropdown.Item>

                        <div className="max-h-60 overflow-y-auto">
                            {categories.map((category) => (
                                <Dropdown.Item
                                    key={category.id}
                                    onClick={() => handleCategoryFilterChange({ target: { value: category.id } })}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon id={category.id} alt={category.name} />
                                        <span>{category.name}</span>
                                    </div>
                                </Dropdown.Item>
                            ))}
                        </div>
                    </Dropdown>
                    <input type="hidden" name="category" value={categoryFilter} />
                </div>
            </div>


            <div className="flex flex-row gap-20">
                <div >
                    <h2>Expenses</h2>
                    <div className='min-w-[1060px]'>
                        <ExpenseTable expenses={filteredExpenses} currency={currentWalletCurrency} handleEditExpense={handleEditExpense} handleDeleteExpense={handleDeleteExpense} />
                    </div>
                </div>

                <div className='flex flex-col max-w-sm'>
                    {currentWalletId && <ExpenseForm userId={userId} currentWalletId={currentWalletId} expenses={memoizedExpenses} setExpenses={setExpenses} categories={categories} />}
                </div>
            </div>
        </div>
    );

}