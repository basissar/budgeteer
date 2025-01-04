import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { API_BASE_URL } from "../../utils/macros";

import { Alert } from "flowbite-react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [equippedItems, setEquippedItems] = useState({ hat: null, neck: null });
    const [wallets, setWallets] = useState([]);
    const [currentWallet, setCurrentWallet] = useState(null);

    const [openModal, setOpenModal] = useState(true);

    const navigate = useNavigate();

    const navigateRef = React.useRef(navigate);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('AXIOS ERROR:', error);
                if (error.response?.status === 401) {
                    console.log(`ERROR HAPPENED ${error}`);

                    <Alert color="warning" rounded>
                        <span className="font-medium">Info alert!</span> Session expired. Please log in again.
                    </Alert>

                    setUser(null);
                    setCurrentWallet(null);
                    setEquippedItems({ hat: null, neck: null });
                    setWallets([]);
                    setError('Session expired. Please log in again.');
                    navigateRef.current('/login');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const updateWallet = (updatedWallet) => {
        setWallets((prevWallets) =>
            prevWallets.map((wallet) =>
                wallet.id === updatedWallet.id ? updatedWallet : wallet
            )
        );
    
        if (currentWallet?.id === updatedWallet.id) {
            setCurrentWallet(updatedWallet);
        }
    };

    const login = async (username, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/user/login`, { username, password }, { withCredentials: true });

            const user = {
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
            }

            const walletResponse = await axios.get(`${API_BASE_URL}/${user.id}/wallets`, { withCredentials: true });
            setWallets(walletResponse.data.wallets);

            if (walletResponse.data.wallets.length > 0) {
                setCurrentWallet(walletResponse.data.wallets[0]);
            }

            const accountResponse = await axios.get(`${API_BASE_URL}/${user.id}/account`, { withCredentials: true });

            updateEquippedItems(
                accountResponse.data.account.equippedItems.reduce((acc, item) => {
                    acc[item.type] = item;
                    return acc;
                }, { hat: null, neck: null })
            );

            setUser(user);
        } catch (error) {
            setError(error.response.data.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const updateEquippedItems = (newEquippedItems) => {
        setEquippedItems(newEquippedItems);
    }

    const handleWalletChange = (selectedWalletId) => {
        const selectedWallet = wallets.find(wallet => wallet.id === selectedWalletId);
        setCurrentWallet(selectedWallet);
    };

    return (
        <UserContext.Provider value={{ user, setUser, equippedItems, updateEquippedItems, loading, login, error, setError, handleWalletChange, wallets, setWallets, currentWallet, updateWallet }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUserContext = () => {
    return useContext(UserContext);
};
