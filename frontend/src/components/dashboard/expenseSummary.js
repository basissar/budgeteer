import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL, INFO } from "../../utils/macros";
import { useUserContext } from "../security/userProvider";
import LineChart from "../custom/lineChart.js";
import { Spinner } from "flowbite-react";

export function ExpenseSummary({ selectedRange, height, width, count }) {
    const [userId, setUserId] = useState('');
    const [sums, setSums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentWalletId, setCurrentWalletId] = useState('');
    const [currentCurrency, setCurrentCurrency] = useState('');
    const [walletBallance, setWalletBallance] = useState(null);

    const { user, currentWallet, wallets } = useUserContext();

    useEffect(() => {
        const fetchUserAndWallets = async () => {
            if (!user) return;

            setUserId(user.id);
        };

        fetchUserAndWallets();
    }, [user]);

    useEffect(() => {
        const fetchSums = async () => {
            if (!currentWalletId) return;

            setLoading(true);
            try {
                const currentDate = new Date();
                const promises = [];
                const monthsArray = [];

                if (selectedRange === 't') {
                    const startDate = new Date();
                    const endDate = new Date();
                    monthsArray.push(currentDate);
                    promises.push(fetchSumForPeriod(startDate, endDate, true));
                    promises.push(fetchSumForPeriod(startDate, endDate, false));
                } else if (selectedRange === 'w') {
                    for (let i = 0; i < count; i++) {
                        const date = new Date(currentDate);
                        date.setDate(currentDate.getDate() - i);
                        monthsArray.push(date);
                        const startDate = new Date(date.setHours(0, 0, 0, 0));
                        const endDate = new Date(date.setHours(23, 59, 59, 999));
                        promises.push(fetchSumForPeriod(startDate, endDate, true));
                        promises.push(fetchSumForPeriod(startDate, endDate, false));
                    }
                } else if (selectedRange === 'm') {
                    monthsArray.push(currentDate);
                    const startDate = new Date();
                    const endDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 1);
                    promises.push(fetchSumForPeriod(startDate, endDate, true));
                    promises.push(fetchSumForPeriod(startDate, endDate, false));
                } else if (selectedRange === 'x') {
                    for (let i = 0; i < count; i++) {
                        const date = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth() - i));
                        date.setMonth(date.getMonth() - i);
                        monthsArray.push(date);
                        const startDate = new Date(date.getFullYear(), date.getMonth() - i);
                        const endDate = new Date(date.getFullYear(), date.getMonth() - i + 1);
                        promises.push(fetchSumForPeriod(startDate, endDate, true));
                        promises.push(fetchSumForPeriod(startDate, endDate, false));
                    }
                } else if (selectedRange === 'y') {
                    monthsArray.push(currentDate.getFullYear());
                    const startDate = new Date();
                    const endDate = new Date();
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    promises.push(fetchSumForPeriod(startDate, endDate, true));
                    promises.push(fetchSumForPeriod(startDate, endDate, false));
                }

                const results = await Promise.all(promises);

                if (selectedRange === 'x' || selectedRange === 'w' || selectedRange === 'm') {
                    const mappedSums = monthsArray.map((date, index) => ({
                        date: selectedRange === 'w'
                            ? date.toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric' })
                            : selectedRange === 'm'
                                ? date.toLocaleString('default', { month: 'short', year: 'numeric' })
                                : date.toLocaleString('default', { month: 'short', year: 'numeric' }),
                        positiveSum: results[index * 2]?.data.result,
                        negativeSum: Math.abs(results[index * 2 + 1]?.data.result),
                    }));

                    setSums(mappedSums.reverse());
                } else {
                    const newSums = monthsArray.map((date, index) => {
                        const positiveSum = results[index * 2].data.result;
                        const negativeSum = Math.abs(results[index * 2 + 1].data.result);
                        return {
                            date: date.toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric' }),
                            positiveSum,
                            negativeSum
                        };
                    });
                    setSums(newSums.reverse());
                }

                const balanceResponse = await axios.get(`${API_BASE_URL}/analytics/${currentWalletId}/balance`,
                    { withCredentials: true }
                );

                setWalletBallance(balanceResponse.data.sum);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSums();
    }, [ currentWalletId, userId]);

    useEffect(() => {
        const handleChange = async () => {
            if (!currentWallet) return;
            handleWalletChange(currentWallet.id);
        };

        handleChange();
    }, [currentWallet])

    const handleWalletChange = (walletId) => {
        setCurrentWalletId(walletId);
        const selectedWallet = wallets.find(wallet => wallet.id === walletId);
        setCurrentCurrency(selectedWallet.currency);
    };

    const fetchSumForPeriod = async (startDate, endDate, condition) => {
        return axios.get(`${API_BASE_URL}/analytics/${currentWalletId}/sumAction`, {
            withCredentials: true,
            params: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                sourceCategoryId: "null",
                amountCondition: condition,
            }
        });
    };

    if (loading) return (
        <div className="text-center">
            <Spinner color="success" aria-label="Extra large spinner example" size="xl" />
        </div>
    )

    if (error) return <div>Error: {error}</div>;

    return (
        <LineChart totalWallet={walletBallance} sums={sums} currency={currentCurrency} height={height} width={width} />
    );
}
