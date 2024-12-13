import React, {createContext, useContext, useEffect, useState} from "react";
import axios from "axios";
import {API_BASE_URL} from "../../utils/macros";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [equippedItems, setEquippedItems] = useState({hat: null, neck: null});

    const login = async (username, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/user/login`, {username, password}, {withCredentials: true });

            console.log(response);

            const user = {
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
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
            // console.log(error.response.data.message);
            setError(error.response.data.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const updateEquippedItems = (newEquippedItems) => {
        setEquippedItems(newEquippedItems);
    }

    const value = {
        user,
        login,
        setUser,
        loading,
        error,
        updateEquippedItems,
        equippedItems,
    };

    return (
        <UserContext.Provider value={{ user, setUser, equippedItems, updateEquippedItems, loading, login }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUserContext = () => {
    return useContext(UserContext);
};
