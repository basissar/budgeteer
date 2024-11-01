import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL, INFO } from "../../utils/macros";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './expenseSummary.css'
import {CustomCardSelect} from "../custom/customCardSelect.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


export function ExpenseSummary({ months }) {
    const [userId, setUserId] = useState('');
    const [sums, setSums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [currentWalletId, setCurrentWalletId] = useState('');
    const [currentCurrency, setCurrentCurrency] = useState('');

    useEffect(() => {
        const fetchUserAndWallets = async () => {
            try {
                const token = localStorage.getItem('token');
                const userResponse = await axios.get(INFO, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                const receivedId = userResponse.data.user.id;
                setUserId(receivedId);

                const walletResponse = await axios.get(`${API_BASE_URL}/${receivedId}/wallets`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWallets(walletResponse.data.wallets);

                if (walletResponse.data.wallets.length > 0) {
                    const firstWallet = walletResponse.data.wallets[0];
                    setCurrentWalletId(firstWallet.id);
                    setCurrentCurrency(firstWallet.currency);
                }
            } catch (error) {
                setError("An error occurred while fetching user data");
                console.error(error);
            }
        };

        fetchUserAndWallets();
    }, []);

    useEffect(() => {
        const fetchSums = async () => {
            if (!currentWalletId) return;

            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const currentDate = new Date();
                const promises = [];
                const monthsArray = [];

                for (let i = 0; i < months; i++) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                    monthsArray.push(date);
                    promises.push(axios.post(`${API_BASE_URL}/analytics/${userId}/${currentWalletId}/sumNegative`, { date: date.toISOString(), walletId: currentWalletId }, {
                        headers: { Authorization: `Bearer ${token}` }
                    }));
                    promises.push(axios.post(`${API_BASE_URL}/analytics/${userId}/${currentWalletId}/sumPositive`, { date: date.toISOString(), walletId: currentWalletId }, {
                        headers: { Authorization: `Bearer ${token}` }
                    }));
                }

                const results = await Promise.all(promises);
                const newSums = monthsArray.map((date, index) => {
                    const negativeSum = Math.abs(results[index * 2].data.sum);
                    const positiveSum = results[index * 2 + 1].data.sum;
                    return {
                        date: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
                        positiveSum,
                        negativeSum
                    };
                });

                setSums(newSums.reverse()); 
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSums();
    }, [months, currentWalletId, userId]);

    const handleWalletChange = (selectedOption) => {
        setCurrentWalletId(selectedOption.value);
        const selectedWallet = wallets.find(wallet => wallet.id === selectedOption.value);
        setCurrentCurrency(selectedWallet.currency);
    };

    const chartData = {
        labels: sums.map(sum => sum.date),
        datasets: [
            {
                label: `Total Income ${currentCurrency}`,
                data: sums.map(sum => sum.positiveSum),
                borderColor: 'green',
                backgroundColor: 'rgba(0, 255, 0, 0.5)',
                fill: false,
                tension: 0.1
            },
            {
                label: `Total Expenses ${currentCurrency}`,
                data: sums.map(sum => sum.negativeSum),
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                fill: false,
                tension: 0.1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            // title: {
            //     display: true,
            //     text: 'Expense Summary for the Last Months',
            // },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.raw + ` ${currentCurrency}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="month_graph">
            <CustomCardSelect
                    options={wallets}
                    value={currentWalletId}
                    onChange={handleWalletChange}
                />

            <h2>Expense Summary for the Last {months} Months</h2>
            <Line data={chartData} options={chartOptions} />
        </div>
    );
}
