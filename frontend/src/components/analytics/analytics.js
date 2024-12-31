import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/macros';
import { useUserContext } from '../security/userProvider';
import { Datepicker,  Button } from 'flowbite-react';
import datePickerTheme from '../../themes/datePicker.json';
import { ExpenseSummary } from '../dashboard/expenseSummary';
import PieChart from '../custom/piechart';
import CategorySumTable from '../custom/categorySumTable';
import SummarySelect from '../custom/summarySelect';

export default function Analytics() {
    const [userId, setUserId] = useState('');

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [positiveSumMap, setPositiveSumMap] = useState(new Map());
    const [negativeSumMap, setNegativeSumMap] = useState(new Map());

    const [errorMessage, setErrorMessage] = useState('');

    const [currentWalletCurrency, setCurrentCurrency] = useState('');
    const [currentWalletId, setCurrentWalletId] = useState('');

    const [loading, setLoading] = useState(true);

    const [balances, setBalances] = useState({});
    const [categories, setCategories] = useState([]);

    const { user, currentWallet, wallets } = useUserContext();

    const [selectedRange, setSelectedRange] = useState('t');
    const [count, setCount] = useState(1);

    useEffect(() => {
        const fetchUser = async () => {
            if (!user) return;

            setUserId(user.id);
        };

        fetchUser();
    }, [user]);

    useEffect(() => {
        if (currentWallet) {
            setCurrentWalletId(currentWallet.id);
            setCurrentCurrency(currentWallet.currency);
        }
    }, [currentWallet]);

    useEffect(() => {
        const handleChange = async () => {
            if (!currentWallet) return;
            handleWalletChange(currentWallet.id);
        };

        handleChange();
    }, [currentWallet])

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !currentWalletId) return;

            setLoading(true);
            try {
                const categoriesResponse = await axios.get(`${API_BASE_URL}/categories/${currentWalletId}`, {
                    withCredentials: true,
                });

                setCategories(categoriesResponse.data.categories);

                const balanceResponse = await axios.get(`${API_BASE_URL}/analytics/${currentWalletId}/categories`, {
                    withCredentials: true,
                });

                setBalances(balanceResponse.data.sumMap);
                setCurrentCurrency(currentWallet.currency);
            } catch (error) {
                setErrorMessage(`An error occurred: ${error.message}`);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [userId, currentWalletId]);

    const handleWalletChange = (walletId) => {
        setCurrentWalletId(walletId);
        const selectedWallet = wallets.find(wallet => wallet.id === walletId);
        setCurrentCurrency(selectedWallet.currency);
    };

    const fetchSumsForDateRange = async () => {
        try {
            const start = startDate.toISOString();
            const end = endDate.toISOString();

            const sumsResponse = await axios.get(`${API_BASE_URL}/analytics/${currentWallet.id}/sums`,
                {
                    withCredentials: true,
                    params: {
                        startDate: start,
                        endDate: end
                    }
                }
            );

            setPositiveSumMap(sumsResponse.data.sumMaps.positiveSumMap);
            setNegativeSumMap(sumsResponse.data.sumMaps.negativeSumMap);
        } catch (error) {
            setErrorMessage("An error occurred while fetching sums");
            console.error(error);
        }
    };

    const handleSelectRange = (value) => {
        setSelectedRange(value);
        if (value === 'x') setCount(6);
        else if (value === 'w') setCount(7);
        else setCount(1);
    };

    useEffect(() => {
    }, [selectedRange, count]);


    return (
        <div className='flex flex-col justify-center'>
            <div className='flex flex-row gap-2 mx-auto mt-[50px]'>

                <div>
                    <div className='flex flex-col items-center mr-[150px] gap-2'>
                        <ExpenseSummary
                            key={`${selectedRange}-${count}`}
                            selectedRange={selectedRange}
                            count={count}
                            height={100 * count}
                            width={600}
                        />
                        <div>
                            <SummarySelect onSelect={handleSelectRange} />
                        </div>
                    </div>

                </div>

                <div className='min-w-[380]'>
                    <PieChart balances={balances} categories={categories} currency={currentWalletCurrency} />
                </div>
            </div>

            <h2>Custom Date Range Analytics</h2>
            <div className='flex flex-row mb-[100px] mt-[20px] mx-auto'>
                <div className='flex flex-col mr-[150px]'>

                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-col'>
                            <label htmlFor='start'>Start date:</label>
                            <Datepicker selected={startDate} onChange={(date) => setStartDate(date)} required
                                theme={datePickerTheme} id="start" />
                        </div>

                        <div className='flex flex-col'>
                            <label htmlFor='end'>End date:</label>
                            <Datepicker selected={endDate} onChange={(date) => setEndDate(date)} required
                                theme={datePickerTheme} id="end" />
                        </div>
                    </div>

                    <Button class="self-center flex items-center justify-center text-white rounded-lg w-1/2 bg-dark-green" onClick={fetchSumsForDateRange}>Load data</Button>
                </div>

                <CategorySumTable negativeSumMap={negativeSumMap} categories={categories} currency={currentWalletCurrency} />
            </div>

        </div>
    );
}
