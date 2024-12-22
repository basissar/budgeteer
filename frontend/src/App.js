import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/signin_signup/login.js';

import './App.css';
import './styles/main.less';
import Register from './components/signin_signup/registration.js';
import UserProfile from './UserProfile.js';
import Wallets from './components/wallets.js';
import Expenses from './components/expenses/expenses.js';
import Budgets from './components/goals_budgets/budgets.js';
import BudgetGoalOverview from './components/goals_budgets/budgetGoal.js';


import Header from './components/header.js';
import Analytics from './components/analytics/analytics.js';
import Avatars from './components/avatarOverview/avatars.js';
import { Dashboard } from './components/dashboard/dashboard.js';
import { AvatarOverview } from './components/avatarOverview/avatarOverview.js';
import { UserProvider } from "./components/security/userProvider";
import PrivateRoute from "./components/security/privateRoute";
import { UserAccountOverview } from "./components/account/userAccountOverview";
import { ErrorProvider } from './utils/errorContext.js';

//TODO handle routes for dashboard better

function App() {
	return (
		<ErrorProvider>
			<UserProvider>
				<div className="wrapper">

					<Router>
						<Header />

						<Routes>
							<Route path='/' element={<PrivateRoute><Dashboard /></PrivateRoute>}>
							</Route>
							<Route path="/login" element={<Login />}>
							</Route>
							<Route path="/register" element={<Register />}>
							</Route>
							<Route path="/profile/:username" element={<PrivateRoute><UserProfile /></PrivateRoute>}>
							</Route>
							<Route path="/wallets" element={<PrivateRoute><Wallets /></PrivateRoute>}>
							</Route>
							<Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>}>
							</Route>
							<Route path="/budgets_and_goals" element={<PrivateRoute><BudgetGoalOverview /></PrivateRoute>}>
							</Route>
							<Route path='/analytics' element={<PrivateRoute><Analytics /></PrivateRoute>}>
							</Route>
							<Route path='/avatars' element={<PrivateRoute><Avatars /></PrivateRoute>}>
							</Route>
							<Route path='/avatarOverview' element={<PrivateRoute><AvatarOverview /></PrivateRoute>}>
							</Route>
							<Route path='/account' element={<PrivateRoute><UserAccountOverview /></PrivateRoute>}>
							</Route>
						</Routes>
					</Router>
				</div>
			</UserProvider>
		</ErrorProvider>

	);
}

export default App;