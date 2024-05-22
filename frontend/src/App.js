import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login.js';

import './App.css';
import Register from './components/registration.js';
import UserProfile from './UserProfile.js';
import Wallets from './components/wallets.js';
import Expenses from './components/expenses.js';
import Budgets from './components/budgets.js';


import Header from './components/header.js';
import Analytics from './components/analytics.js';

function App() {
	return (
		<div className="wrapper">
			
			<Router>
				<Header />

				<Routes>
					<Route path="/login" element={<Login />}>
					</Route>
					<Route path="/register" element={<Register />}>
					</Route>
					<Route path="/profile/:username" element={<UserProfile />}>
					</Route>
					<Route path="/wallets" element={<Wallets />}>
					</Route>
					<Route path="/expenses" element={<Expenses />}>
					</Route>
					<Route path="/budgets" element={<Budgets />}>
					</Route>
					<Route path='/analytics' element={<Analytics />}>
					</Route>
				</Routes>
			</Router>
		</div>
	);
}

export default App;