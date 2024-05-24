import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login.js';

import './App.css';
import Register from './components/registration.js';
import UserProfile from './UserProfile.js';
import Wallets from './components/wallets.js';
import Expenses from './components/expenses/expenses.js';
import Budgets from './components/budgets.js';
import BudgetGoalOverview from './components/budgetGoal.js';


import Header from './components/header.js';
import Analytics from './components/analytics.js';
import Avatars from './components/avatars.js';
import { Dashboard } from './components/dashboard/dashboard.js';
import { AvatarOverview } from './components/avatarOverview/avatarOverview.js';

//TODO handle routes for dashboard better

function App() {
	return (
		<div className="wrapper">
			
			<Router>
				<Header />

				<Routes>
					<Route path='/' element={<Dashboard />}>
					</Route>
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
					<Route path="/budgets_and_goals" element={<BudgetGoalOverview />}>
					</Route>
					<Route path='/analytics' element={<Analytics />}>
					</Route>
					<Route path='/avatars' element={<Avatars />}>
					</Route>
					<Route path='/avatarOverview' element={<AvatarOverview />}>
					</Route>
				</Routes>
			</Router>
		</div>
	);
}

export default App;