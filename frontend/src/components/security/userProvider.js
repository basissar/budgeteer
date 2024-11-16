import React, { createContext, useContext, useState} from "react";
import axios from "axios";
import {API_BASE_URL} from "../../utils/macros";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (username, password) => {
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/user/login`, {username, password}, {withCredentials: true });

            const user = {
                id: response.data.id,
                username: response.data.username,
            }

            setUser(user);
        } catch (error) {
            setError(error.response.data.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        login,
        setUser,
        loading,
        error,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUserContext = () => {
    return useContext(UserContext);
};
