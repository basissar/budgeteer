import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './registration.module.css';
import logo from '../assets/budget_logo.svg';

export default function Register() {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const regURL = 'http://localhost:8000/budgeteer/user/register';

	const handleRegister = async () => {
		try {
			const response = await axios.post(regURL, { username, password, email });

			if (response.status === 201) {
				const { id, username, email } = response.data.user;
				alert(`User ${username} registered!`);

				//redirection to login page
				navigate('/login');
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
			<div className={styles.logo}>
				<img src={logo} alt="Logo"/>
			</div>

			<p className={styles.reg_levelup}>Level up your money game!</p>

			<div className={styles.reg_container}>

			<h2>Create an account!</h2>

			<form className="registration-form" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
				<div>
					<label htmlFor="username">Username:</label>
					<input
						type="text"
						id="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</div>
				<div>
					<label htmlFor="email">Email:</label>
					<input
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<div>
					<label htmlFor="password">Password:</label>
					<input
						type="password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				{errorMessage && <p>{errorMessage}</p>}
				<button type="submit">Register</button>
				<div className={styles.reg_redirect}>
					<p>Already have an acccount?</p>
					<a href="/login">Sign In</a>
				</div>
			</form>
		</div>
		</div>
		
	);
}