import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/budget_logo.svg';
import { API_BASE_URL } from '../../utils/macros';
import { useUserContext } from '../security/userProvider';
import { TextInput, Button } from 'flowbite-react';
import Logo from '../../assets/budget_logo.svg?react';

export default function Register() {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	// const {login, error} = useUserContext();
	const { user, setUser } = useUserContext();

	const handleRegister = async () => {
		try {
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			const response = await axios.post(`${API_BASE_URL}/user/register`, { username, password, email, timezone });

			if (response.status === 201) {
				const { id, username, email } = response.data.user;
				// alert(`User ${username} registered!`);

				try {
					// await login(username, password);
					const loginResponse = await axios.post(`${API_BASE_URL}/user/login`, { username, password }, { withCredentials: true });

					console.log(loginResponse);

					console.log(loginResponse.status);

					if (loginResponse.status.valueOf() === 200) {
						console.log("navigate status")

						const user = {
							id: loginResponse.data.id,
							username: loginResponse.data.username,
							email: loginResponse.data.email,
						}

						setUser(user);

						navigate('/avatars');
					}


				} catch (err) {
					console.error(err.message);
				}
			}
		} catch (e) {
			if (e.response.status === 400) {
				setErrorMessage(e.response.data.message);
			} else {
				setErrorMessage("Unexpected error occured. Please try again later.");
			}
		}
	};


	return (
		<div>
			<div className="logo">
				<Logo />
			</div>

			<p className="levelup">Level up your money game!</p>

			<div class="container login-signup">

				<h2>Create an account!</h2>

				<form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
					<div>
						<label htmlFor="username">Username:</label>
						<TextInput
							id='username'
							class="focus:border-green-500 focus:ring-green-500"
							type='text'
							value={username}
							onChange={(e) => {
								const value = e.target.value;
								if (/^[a-zA-Z0-9._-]*$/.test(value)) {
									setUsername(value);
								}
							}}
						/>					</div>
					<div>
						<label htmlFor="email">Email:</label>
						<TextInput
							id='email'
							class="focus:border-green-500 focus:ring-green-500"
							placeholder='example@email.com'
							type='email'
							value={email}
							onChange={(e) => {
								const value = e.target.value;
								if (/^\S*$/.test(value)) {
									setEmail(value);
								}
							}}
						/>					</div>
					<div>
						<label htmlFor="password">Password:</label>
						<TextInput id='password' class="focus:border-green-500 focus:ring-green-500" type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
					</div>
					{errorMessage && <p>{errorMessage}</p>}
					<Button class="self-center flex items-center justify-center text-white rounded-lg w-1/2" type='submit'>Register</Button>
					<div className="redirect">
						<p>Already have an acccount?</p>
						<a href="/login">Sign In</a>
					</div>
				</form>
			</div>
		</div>

	);
}