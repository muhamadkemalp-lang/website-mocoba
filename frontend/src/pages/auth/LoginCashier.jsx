import { useState } from "react";
import { Lock, Mail, Store, ShieldCheck, ArrowRight, Terminal } from "lucide-react";
import { loginCashierAPI } from "../../api/cashier.api";

export default function CashierLogin({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberTerminal, setRememberTerminal] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Masukkan email dan password kasir Anda.");
            return;
        }
        setError("");
        setIsLoading(true);

        const res = await loginCashierAPI(email, password);
        setIsLoading(false);

        if (res.success) {
            onLoginSuccess(res.user);
        } else {
            setError(res.message || "Login gagal, cek email/password Anda.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-white">
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col md:flex-row relative z-10">
                {/* Left Branding Banner */}
                <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div>
                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-emerald-400 text-xs font-medium tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            TERMINAL ONLINE
                        </div>

                        <div className="mt-8 flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                                <Store className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-white">MOCOBA Kasir</h1>
                                <p className="text-xs text-slate-400">Point of Sale Terminal</p>
                            </div>
                        </div>

                        <p className="mt-6 text-sm text-slate-300 leading-relaxed">
                            Masuk untuk memproses pesanan pelanggan, menerapkan diskon, dan mencetak struk.
                        </p>
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-800 space-y-3">
                        <div className="flex items-center gap-2.5 text-xs text-slate-400">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Sesi terminal terenkripsi</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-400">
                            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Terhubung ke server MOCOBA</span>
                        </div>
                    </div>
                </div>

                {/* Right Form Area */}
                <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Login Kasir</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Masukkan email dan password akun kasir Anda untuk mulai shift.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 font-medium">
                            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="cashier-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Email Kasir
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    id="cashier-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="kasir@mocoba.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="cashier-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="cashier-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                                <input
                                    type="checkbox"
                                    checked={rememberTerminal}
                                    onChange={(e) => setRememberTerminal(e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                />
                                <span>Ingat terminal ini</span>
                            </label>
                            <a
                                href="#reset"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert("Hubungi admin untuk reset password kasir.");
                                }}
                                className="text-slate-500 hover:text-slate-800 underline decoration-slate-300"
                            >
                                Lupa password?
                            </a>
                        </div>

                        <button
                            id="login-button"
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed group text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Membuka shift...</span>
                                </>
                            ) : (
                                <>
                                    <span>Login ke Terminal Kasir</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-500">
                            Belum punya akun kasir? Hubungi admin toko untuk dibuatkan akun.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}