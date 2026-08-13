import React from 'react';
import POSNavbar from '../components/layout/POSNavbar';

export default function CashierLayout({
  children,
  currentView,
  onNavigate,
  onLogout
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <POSNavbar currentView={currentView} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}