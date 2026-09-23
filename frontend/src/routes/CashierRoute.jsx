import React, { useState, useEffect } from "react";
import CashierLayout from "../layouts/CashierLayout";
import CashierLogin from "../pages/auth/LoginCashier";
import CashierPOS from "../pages/cashier/cashierPOS";
import TransactionHistory from "../pages/cashier/Transaction";
import TableSelect from "../pages/cashier/TableSelect";

export default function CashierRoute() {
  const [currentView, setCurrentView] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cashierUser, setCashierUser] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("mocoba_token");
    const user = localStorage.getItem("mocoba_user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser.role === "kasir" || parsedUser.role === "admin") {
          setCashierUser(parsedUser);
          setIsLoggedIn(true);
          setCurrentView("tables");
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
    setSelectedTable(null);
    setCurrentView("tables");
  };

  const handleLogout = () => {
    localStorage.removeItem("mocoba_token");
    localStorage.removeItem("mocoba_user");
    setIsLoggedIn(false);
    setCashierUser(null);
    setSelectedTable(null);
    setCurrentView("login");
  };

  const handleNavigate = (view) => {
    if (view === "pos" && !selectedTable) {
      setCurrentView("tables");
      return;
    }
    if (view === "tables") {
      setCurrentView("tables");
      return;
    }
    setCurrentView(view);
  };

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setCurrentView("pos");
  };

  const handleChangeTable = () => {
    setSelectedTable(null);
    setCurrentView("tables");
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
      {currentView === "tables" && (
        <TableSelect onSelectTable={handleSelectTable} />
      )}

      {currentView === "pos" && selectedTable && (
        <CashierPOS
          cashierUser={cashierUser}
          selectedTable={selectedTable}
          onChangeTable={handleChangeTable}
        />
      )}

      {currentView === "transactions" && <TransactionHistory />}
    </CashierLayout>
  );
}