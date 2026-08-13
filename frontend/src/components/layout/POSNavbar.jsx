import { useState, useEffect } from "react";
import { Store, LogOut, Clock, ShoppingCart, Receipt } from "lucide-react";

export default function POSNavbar({ currentView, onNavigate, onLogout, cashierUser }) {
    const [currentTime, setCurrentTime] = useState(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const namaKasir = cashierUser?.nama || "Kasir";
    const initials = namaKasir
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="bg-slate-900 text-white border-b border-slate-800 px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-md">
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/30">
                    <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-bold text-sm tracking-tight text-white leading-none">MOCOBA Kasir</h1>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                        Terminal Aktif
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-0.5">
                <button
                    type="button"
                    onClick={() => onNavigate("pos")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        currentView === "pos"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    POS
                </button>
                <button
                    type="button"
                    onClick={() => onNavigate("transactions")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        currentView === "transactions"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                >
                    <Receipt className="w-3.5 h-3.5" />
                    Transaksi
                </button>
            </div>

            {/* Right: Cashier Info & Logout */}
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentTime}</span>
                </div>

                <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                        {initials}
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-xs font-bold text-white leading-none">{namaKasir}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 capitalize">{cashierUser?.role || "kasir"}</div>
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        title="Logout"
                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors ml-1"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}
