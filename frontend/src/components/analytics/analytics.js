import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { INFO, API_BASE_URL } from '../../utils/macros';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale } from 'chart.js';
import './analytics.css';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend, CategoryScale);

export default function Analytics() {
    const [userId, setUserId] = useState('');
    const [negativeSum, setNegativeSum] = useState(null);
    const [positiveSum, setPositiveSum] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [wallets, setWallets] = useState([]);
    const [currentWalletId, setCurrentWalletId] = useState('');
    const [currentWalletCurrency, setCurrentWalletCurrency] = useState('');
    const [selectedMonthYear, setSelectedMonthYear] = useState(new Date());
    // const [balances, setBalances] = useState(new Map());
    const [balances, setBalances] = useState({});
    const [categories, setCategories] = useState([]);

    const [categorySelect, setCategory] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const userResponse = await axios.get(INFO, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                const receivedUserId = userResponse.data.user.id;

                setUserId(receivedUserId);

                const walletResponse = await axios.get(`${API_BASE_URL}/${receivedUserId}/wallets`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                setWallets(walletResponse.data.wallets);

                if (walletResponse.data.wallets.length > 0) {
                    // const firstWalletId = walletResponse.data.wallets[0].id;

                    const savedWalletId = localStorage.getItem('currentWalletId') || walletResponse.data.wallets[0].id;


                    setCurrentWalletId(savedWalletId);
                    setCurrentWalletCurrency(walletResponse.data.wallets[0].currency);

                    await fetchCategories(receivedUserId, savedWalletId);
                    await fetchWalletBalance(receivedUserId, savedWalletId);
                }
            } catch (error) {
                setErrorMessage("An error occurred while fetching user data");
                console.error(error.stack);
            }
        };

        fetchData();
    }, []);

    const fetchCategories = async (userId, walletId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/${userId}/categories/${walletId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCategories(response.data.categories);
        } catch (error) {
            setErrorMessage("An error occurred while fetching categories");
            console.error(error);
        }
    };

    const fetchSumsForMonth = async (date) => {
        try {
            const token = localStorage.getItem('token');
            const formattedDate = date.toISOString();

            const negSumResponse = await axios.post(`${API_BASE_URL}/analytics/${userId}/sumNegative`,
                {
                    date: formattedDate
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                });

            setNegativeSum(negSumResponse.data.sum);
        } catch (error) {
            setErrorMessage("An error occurred while fetching sums");
            console.error(error);
        }
    };

    const fetchSumsForDateRange = async () => {
        try {
            const token = localStorage.getItem('token');
            const negSumResponse = await axios.post(`${API_BASE_URL}/analytics/${userId}/sumNegativeRange`,
                {
                    startDate,
                    endDate,
                    categoryId
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                });

            setPositiveSum(negSumResponse.data.sum);
        } catch (error) {
            setErrorMessage("An error occurred while fetching sums");
            console.error(error);
        }
    };

    const fetchWalletBalance = async (userId, currentWalletId) => {
        try {
            const token = localStorage.getItem('token');
            const balanceResponse = await axios.get(`${API_BASE_URL}/analytics/${userId}/${currentWalletId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setBalances(balanceResponse.data.sumMap);   
        } catch (err) {
            setErrorMessage(`An error occurred while fetching sums: ${err.message}`);
            console.error(err.message);
        }
    }

    const handleMonthYearChange = (date) => {
        setSelectedMonthYear(date);
    };

    const handleWalletChange = async (e) => {
        const selectedOption = e.target.value;
        const selectedWalletCurr = e.target.selectedOptions[0].getAttribute('data-currency');

        setCurrentWalletId(selectedOption);
        setCurrentWalletCurrency(selectedWalletCurr);

        // Save the selected wallet ID to local storage
        localStorage.setItem('currentWalletId', selectedOption);

        try {
            await fetchCategories(userId, selectedOption);
            await fetchWalletBalance(userId, selectedOption);
        } catch (err) {
            setErrorMessage(`An error occurred while fetching sums: ${err.message}`);
            console.error(err.message);
        }
    }

    const chartData = {
        labels: Object.keys(balances).map(key => {
            const category = categories.find(cat => cat.id === Number(key));
            return category ? category.name : key;
        }),
        datasets: [{
            data: Object.values(balances),
            backgroundColor: Object.keys(balances).map(key => {
                const category = categories.find(cat => cat.id === Number(key));
                return category ? category.color : "#000000";
            }),
            hoverBackgroungColor: Object.keys(balances).map(key => {
                const category = categories.find(cat => cat.id === Number(key));
                return category ? category.color : "#000000";
            })
        }]
    }

    const chartOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const value = tooltipItem.raw || 0;
                        return `${value} ${currentWalletCurrency}`;
                    }
                }
            }
        }
    };

    return (
        <div className="analytics-container">
            {errorMessage && <p>{errorMessage}</p>}

            <h2>Monthly Analytics</h2>

            <div>
                <label htmlFor="walletSelect">Select wallet</label>
                <select id="walletSelect" className="select-wallet" value={currentWalletId} onChange={handleWalletChange}>
                    {wallets.map(wallet => (
                        <option key={wallet.id} value={wallet.id} data-currency={wallet.currency}>{wallet.name}</option>
                    ))}
                </select>
            </div>

            <DatePicker
                selected={selectedMonthYear}
                onChange={handleMonthYearChange}
                dateFormat="MM/yyyy"
                showMonthYearPicker
            />
            <button onClick={() => fetchSumsForMonth(selectedMonthYear)}>Fetch Sums for Month</button>
            <div>
                <p>Negative Expenses Sum: {negativeSum !== null ? negativeSum : 'Loading...'}</p>
                <p>Positive Expenses Sum: {positiveSum !== null ? positiveSum : 'Loading...'}</p>
            </div>

            <h2>Custom Date Range Analytics</h2>
            <div className='dateRangeAnalytics'>
                <div>
                    <label>Start Date:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                <div>
                    <label>End Date:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>

                <div>
                    <label htmlFor='category'>Category:</label>
                    <select value={categorySelect} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">None</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id} style={{ backgroundColor: category.color }}>{category.name}</option>
                        ))}
                    </select>
                </div>

                {/* <div className="category-filter">
                <label>
                        Category:
                        <select value={categoryFilter} onChange={handleCategoryFilterChange}>
                            <option value="">All</option>
                            {categoryIcons.map(category => (
                                <option key={category.name} value={category.name}>{category.name}</option>
                            ))}
                        </select>
                    </label>
                </div> */}
                
                <button onClick={fetchSumsForDateRange}>Fetch Sums for Date Range</button>
                <div>
                    <p>Negative Expenses Sum: {negativeSum !== null ? negativeSum : 'Loading...'}</p>
                    <p>Positive Expenses Sum: {positiveSum !== null ? positiveSum : 'Loading...'}</p>
                </div>
                <label>
                    Wallet balance:
                </label>
                <button onClick={fetchWalletBalance}>Fetch wallet balance</button>
            </div>


            <h2>Wallet Balances Pie Chart</h2>
            <div style={{ width: '40%', margin: 'auto' }}>
                <Pie data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
