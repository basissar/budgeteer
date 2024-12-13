import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './wallets.css';
import icon from "../assets/card-icon.svg";
import {API_BASE_URL} from "../utils/macros";
import {useUserContext} from "./security/userProvider";

export default function Wallets() {
    const navigate = useNavigate();
    const [wallets, setWallets] = useState([]);
    const [userId, setUserId] = useState('');
    const [newWalletName, setNewWalletName] = useState('');
    const [currency, setCurrency] = useState('CZK'); // Default currency
    const [initialAmount, setInitialAmount] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { user } = useUserContext();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const walletResponse = await axios.get(`${API_BASE_URL}/${user.id}/wallets`, {
                    withCredentials: true,
                });
                setWallets(walletResponse.data.wallets);
            } catch (error) {
                setErrorMessage("An error occurred while fetching data.");
            }
        };

        fetchData();
    }, [user]);

    const handleCreateWallet = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/${user.id}/wallets`,
                { userId: user.id, name: newWalletName, currency: currency, initialAmount: initialAmount },
                {
                    withCredentials: true
                }
            );

            const createdWallet = response.data.wallet;

            setNewWalletName('');
            setInitialAmount('');
            setWallets([...wallets, createdWallet]); 
        } catch (err) {
            alert(err.message);
        }
    }

    const calculateCurrentAmount = (wallet) => {
        if (wallet && wallet.expenses) {
            return wallet.expenses
            .filter(expense => expense.sourceCategoryId === null)
            .reduce((total, expense) => total + expense.amount, 0);
        } else {
            return 0; 
        }
    }

    return (
        <div>
            <ul className="wallet-list">
                {wallets.map(wallet => (
                    <li key={wallet.id} className="wallet-item">
                        <div className="wallet-info">
                            <img src={icon} alt="icon" />
                            <p>{wallet.name}</p>
                        </div>
                        <p className="wallet-amount">{calculateCurrentAmount(wallet)} {wallet.currency}</p>
                    </li>
                ))}
            </ul>

            <div className="createWallet">
                <h3>Add wallet</h3>
                <form onSubmit={handleCreateWallet}>
                    <label htmlFor="newWalletName">Wallet name:</label>
                    <input
                        type="text"
                        id="newWalletName"
                        value={newWalletName}
                        onChange={(e) => setNewWalletName(e.target.value)}
                        required
                    />
                    <label htmlFor="currency">Currency:</label>
                    <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="CZK">CZK</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        {/* Add more currency options as needed */}
                    </select>
                    <label htmlFor="initialAmount">Initial Amount:</label>
                    <input
                        type="number"
                        id="initialAmount"
                        value={initialAmount}
                        onChange={(e) => setInitialAmount(e.target.value)}
                        required
                    />
                    <button type="submit">Add wallet</button>
                </form>
            </div>

            {errorMessage && <p>{errorMessage}</p>}
        </div>
    )
}