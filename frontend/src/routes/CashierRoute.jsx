import React, { useState, useEffect } from "react";
import CashierLayout from "../layouts/CashierLayout";
import CashierLogin from "../pages/auth/LoginCashier";
import CashierPOS from "../pages/cashier/cashierPOS";
import TransactionHistory from "../pages/cashier/Transaction";

export default function CashierRoute() {
  const [currentView, setCurrentView] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cashierUser, setCashierUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("mocoba_token");
    const user = localStorage.getItem("mocoba_user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser.role === "kasir" || parsedUser.role === "admin") {
          setCashierUser(parsedUser);
          setIsLoggedIn(true);
          setCurrentView("pos");
        }
      } catch {
        localStorage.removeItem("mocoba_token");
        localStorage.removeItem("mocoba_user");
      }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCashierUser(user);
    setIsLoggedIn(true);
    setCurrentView("pos");
  };

  const handleLogout = () => {
    localStorage.removeItem("mocoba_token");
    localStorage.removeItem("mocoba_user");
    setIsLoggedIn(false);
    setCashierUser(null);
    setCurrentView("login");
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  if (!isLoggedIn) {
    return (
      <CashierLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => {}}
      />
    );
  }

  return (
    <CashierLayout
      cashierUser={cashierUser}
      currentView={currentView}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {currentView === "pos" && <CashierPOS cashierUser={cashierUser} />}
      {currentView === "transactions" && <TransactionHistory />}
    </CashierLayout>
  );
}