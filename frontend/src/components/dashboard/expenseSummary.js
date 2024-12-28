import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL, INFO } from "../../utils/macros";
import { useUserContext } from "../security/userProvider";
import LineChart from "../custom/lineChart.js";
import { Spinner } from "flowbite-react";


export function ExpenseSummary({ months, height, width }) {
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

                for (let i = 0; i < months; i++) {
                    const date = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth() - i, 1));
                    monthsArray.push(date);
                    promises.push(axios.post(`${API_BASE_URL}/analytics/${userId}/${currentWalletId}/sumNegative`, { date: date.toISOString(), walletId: currentWalletId }, {
                        withCredentials: true,
                    }));
                    promises.push(axios.post(`${API_BASE_URL}/analytics/${userId}/${currentWalletId}/sumPositive`, { date: date.toISOString(), walletId: currentWalletId }, {
                        withCredentials: true,
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

                const balanceResponse = await axios.get(`${API_BASE_URL}/analytics/${currentWalletId}`,
                    { withCredentials: true }
                );

                setWalletBallance(balanceResponse.data.sum);

                setSums(newSums.reverse());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSums();
    }, [months, currentWalletId, userId]);

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
