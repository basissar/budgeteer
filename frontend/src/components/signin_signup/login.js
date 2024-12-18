import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import { useNavigate } from 'react-router-dom';
import styles from './login.module.css';
import logo from '../../assets/budget_logo.svg';
import {useUserContext} from "../security/userProvider";

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const endpoint = 'http://localhost:8000/budgeteer/user/login'

    const {login, error, loading} = useUserContext();

    const handleLogin = async () => {
        await login(username, password);

        if (!error) {
            navigate('/');
        }
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        setErrorMessage(''); // Clear error when user changes input
    };

    return (
        <div>
            <div className={styles.logo}>
				<img src={logo} alt="Logo"/>
			</div>

            <p className={styles.log_levelup}>Level up your money game!</p>

            <div className={styles.log_container}>

                <h2>Welcome back!</h2>
                
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <div>
                        <label htmlFor="username_login">Username:</label>
                        <input
                            type="text"
                            id="username_login"
                            value={username}
                            onChange={handleInputChange(setUsername)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handleInputChange(setPassword)}
                        />
                    </div>
                    {error && <p className={styles.errorMessage}>{error}</p>} {/* Show error message */}
                    <button type="submit">Login</button>
                    <div className={styles.log_redirect}>
                        <p>Don't have an account yet?</p>
                        <a href="/register">Sign Up</a>
                    </div>
                    
                </form>
            </div>
        </div>
    );
}