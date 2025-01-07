import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/signin_signup/login.js';
import './App.css';
import './styles/main.less';
import Register from './components/signin_signup/registration.js';
import UserProfile from './UserProfile.js';
import Wallets from './components/wallet/wallets.js';
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
import WalletDetails from './components/wallet/walletDetails.js';
import GoalDetails from './components/goals_budgets/goalDetails.js';
import Error from './components/custom/error.js';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1520);
    };

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="wrapper">
      <Router>
        <UserProvider>
          <ErrorProvider>
            {!isMobile && <Header />}
            
            {isMobile ? (
              <Error message={'You must use a larger device to use this app.'}type={'alert'}/>
            ) : (
              <Routes>
                <Route path='/' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile/:username" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
                <Route path="/wallets" element={<PrivateRoute><Wallets /></PrivateRoute>} />
                <Route path='/wallets/:walletId' element={<PrivateRoute><WalletDetails /></PrivateRoute>} />
                <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
                <Route path="/budgets_and_goals" element={<PrivateRoute><BudgetGoalOverview /></PrivateRoute>} />
                <Route path='/goals/:goalId' element={<PrivateRoute><GoalDetails /></PrivateRoute>} />
                <Route path='/analytics' element={<PrivateRoute><Analytics /></PrivateRoute>} />
                <Route path='/avatars' element={<PrivateRoute><Avatars /></PrivateRoute>} />
                <Route path='/avatarOverview' element={<PrivateRoute><AvatarOverview /></PrivateRoute>} />
                <Route path='/account' element={<PrivateRoute><UserAccountOverview /></PrivateRoute>} />
              </Routes>
            )}
          </ErrorProvider>
        </UserProvider>
      </Router>
    </div>
  );
}

export default App;
