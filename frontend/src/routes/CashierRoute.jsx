import React, { useState } from 'react';
import CashierLayout from '../layouts/CashierLayout';
import CashierLogin from '../pages/auth/LoginCashier';
import CashierPOS from '../pages/cashier/cashierPOS';
import TransactionHistory from '../pages/cashier/Transaction';

export default function CashierRoute() {
  const [currentView, setCurrentView] = useState('pos');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [cashierUser, setCashierUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCashierUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('login');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  return (
    <CashierLayout
      cashierUser={cashierUser}
      currentView={currentView}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {currentView === 'login' && (
        <CashierLogin
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentView('register')}
        />
      )}

      {currentView === 'pos' && (
        <CashierPOS cashierUser={cashierUser} />
      )}

      {currentView === 'transactions' && (
        <TransactionHistory />
      )}
    </CashierLayout>
  );
}
