import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/budget_logo.svg?react';
import { useUserContext } from "../security/userProvider";
import { useError } from '../../utils/errorContext';
import { Button, TextInput } from 'flowbite-react';
import Error from '../custom/error.js';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setErrorMessage, getErrorMessage, errorMessage } = useError();

    const { login, error } = useUserContext();

    const handleLogin = async () => {
        if (!username && !password) {
            setErrorMessage(getErrorMessage('credentials.missing'));
            return
        } else if (!username) {
            setErrorMessage(getErrorMessage('username.missing'));
            return;
        } else if (!password) {
            setErrorMessage(getErrorMessage('password.missing'));
            return;
        }


        await login(username, password);

        if (!error) {
            navigate('/');
        } else {
            setErrorMessage(getErrorMessage('default'));
        }
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        setErrorMessage('');
    };

    return (
        <div className='flex flex-col items-center'>
            <div className="logo">
                <Logo/>
            </div>

            <p className="levelup">Level up your money game!</p>

            <div class="container login-signup">

                <h2>Welcome back!</h2>

                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <div>
                        <label htmlFor="username_login">Username:</label>
                        <TextInput id='username_login' class="focus:border-green-500 focus:ring-green-500" type='text' value={username} onChange={handleInputChange(setUsername)} required />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <TextInput id='password' class="focus:border-green-500 focus:ring-green-500" type='password' value={password} onChange={handleInputChange(setPassword)} required />
                    </div>
                    <Button class="self-center flex items-center justify-center text-white rounded-lg w-1/2 bg-dark-green" type='submit'>Login</Button>
                    <div className="redirect">
                        <p>Don't have an account yet?</p>
                        <a href="/register">Sign Up</a>
                    </div>

                </form>

            </div>

            <div className='max-w-sm'>
                {error && <Error message={error} type={'error'} />}
            </div>

        </div>
    );
}