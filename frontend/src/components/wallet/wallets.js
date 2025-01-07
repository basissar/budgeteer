import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../../utils/macros";
import { useUserContext } from "../security/userProvider";
import Wallet from "../wallet/walletCard.js";
import { Dropdown, TextInput, Button, Tooltip } from 'flowbite-react';
import Error from '../custom/error.js';

export default function Wallets() {
    const navigate = useNavigate();
    const [newWalletName, setNewWalletName] = useState('');
    const [currency, setCurrency] = useState('CZK');
    const [initialAmount, setInitialAmount] = useState('');
    const [walletBalnces, setWalletBalances] = useState(new Map);

    const { user, wallets, setWallets, error, setError } = useUserContext();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const walletResponse = await axios.get(`${API_BASE_URL}/${user.id}/wallets`, {
                    withCredentials: true,
                });

                setWallets(walletResponse.data.wallets);

                const newWalletBalances = new Map();

                for (const w of walletResponse.data.wallets) {
                    const balanceResponse = await axios.get(`${API_BASE_URL}/analytics/${w.id}/balance`, {
                        withCredentials: true,
                    });

                    newWalletBalances.set(w.id, balanceResponse.data.sum);
                }

                setWalletBalances(newWalletBalances);

            } catch (error) {
                setError(`An error occurred while fetching data. ${error}`);
            }
        };

        fetchData();
    }, [user]);

    const handleCreateWallet = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${API_BASE_URL}/${user.id}/wallets`,
                { userId: user.id, name: newWalletName, currency: currency, initialAmount: initialAmount },
                {
                    withCredentials: true
                }
            );

            console.log(response.data);
            const createdWallet = response.data.wallet;

            setNewWalletName('');
            setInitialAmount('');

            setWallets((prevWallets) => [...prevWallets, createdWallet]);
        } catch (err) {
            alert(err.message);
        }
    };


    const cantCreate = () => {
        return wallets.length === 3;
    };

    const handleWalletClick = (walletId) => {
        navigate(`/wallets/${walletId}`);
    };

    return (
        <div className='flex flex-col items-center'>
            {error && <Error message={error} />}

            <div className='mx-auto flex flex-row gap-10 mt-[50px]'>
                {wallets.map(wallet => (
                    <div key={wallet.id} onClick={() => handleWalletClick(wallet.id)}>
                        <Wallet
                            cardName={wallet.name}
                            amount={walletBalnces.get(wallet.id)}
                            currency={wallet.currency}
                        />
                    </div>
                ))}
            </div>


            <div className="max-w-[300px] mt-[2%] flex flex-col items-center p-[20px] bg-green">
                <h3>Add wallet</h3>
                <form onSubmit={handleCreateWallet}>
                    <div>
                        <label htmlFor="newWalletName">Wallet name:</label>
                        <TextInput class="focus:border-green-500 focus:ring-green-500" type='text' value={newWalletName} onChange={(e) => setNewWalletName(e.target.value)} placeholder='New wallet' id="newWalletName" required />
                    </div>

                    <div>
                        <label htmlFor="initialAmount">Initial Amount:</label>
                        <TextInput class="focus:border-green-500 focus:ring-green-500 h-10" type='number' value={initialAmount} onChange={(e) => setInitialAmount(e.target.value)} id="initialAmount" required />
                    </div>

                    <div>
                        <label htmlFor="currency">Currency:</label>
                        <Dropdown
                            label={currency || "Select currency"}
                            color="light"
                            theme={{ floating: { target: "w-full focus:border-green-500 justify-center focus-dg" } }}
                        >
                            <Dropdown.Item className="w-full text-center" onClick={() => setCurrency('CZK')}>CZK</Dropdown.Item>
                            <Dropdown.Item className="w-full text-center" onClick={() => setCurrency('USD')}>USD</Dropdown.Item>
                            <Dropdown.Item className="w-full text-center" onClick={() => setCurrency('EUR')}>EUR</Dropdown.Item>
                            <Dropdown.Item className="w-full text-center" onClick={() => setCurrency('GBP')}>GBP</Dropdown.Item>
                        </Dropdown>
                    </div>

                    <div className="w-full">
                        {cantCreate() ? (
                            <Tooltip content="You cannot add more than 3 wallets" style="light" theme={{ target: "w-full" }}>
                                <Button
                                    disabled
                                    className="w-full self-center flex items-center justify-center text-white rounded-lg bg-dark-green-disabled"
                                    type="submit"
                                    fullSized
                                >
                                    Add Wallet
                                </Button>
                            </Tooltip>
                        ) : (
                            <Button
                                disabled={cantCreate()}
                                className="w-full self-center flex items-center justify-center text-white rounded-lg"
                                type="submit"
                            >
                                Add Wallet
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}