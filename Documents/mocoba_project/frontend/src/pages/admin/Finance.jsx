import { useEffect, useState } from "react";
import { AlertCircle, X, TrendingUp, Wallet, Receipt, BarChart3, Search, Eye } from "lucide-react";
import financeApi from "../../api/finance.api";
import transactionsApi from "../../api/transactions.api";
import StatCard from "../../components/cards/StatCard";
import DailyRevenueChart from "../../components/charts/DailyRevenueChart";
import MonthlyRevenueChart from "../../components/charts/MonthlyRevenueChart";
import RevenueByMethodChart from "../../components/charts/RevenueByMethodChart";

const formatRp = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

// Backend mengirim tanggal dalam bentuk { _seconds, _nanoseconds } (hasil JSON dari Firestore Timestamp).
// Fungsi ini menangani SEMUA kemungkinan bentuk: objek _seconds, Date asli, atau string ISO.
function toJsDate(dateVal) {
    if (!dateVal) return null;
    if (dateVal._seconds !== undefined) return new Date(dateVal._seconds * 1000);
    if (dateVal.toDate) return dateVal.toDate(); // jaga-jaga kalau suatu saat akses langsung Firestore SDK
    return new Date(dateVal);
}

function formatDate(dateVal) {
    const d = toJsDate(dateVal);
    if (!d || isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(dateVal) {
    const d = toJsDate(dateVal);
    if (!d || isNaN(d.getTime())) return "-";
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
const thirtyDaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
};

const todayStr = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
};

export default function Finance() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(thirtyDaysAgo());
    const [endDate, setEndDate] = useState(todayStr());
    const [summary, setSummary] = useState(null);
    const [todaySummary, setTodaySummary] = useState(null);
    const [dailySales, setDailySales] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [detailTarget, setDetailTarget] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadFinanceData();
        loadTransactions();
    }, []);

    async function loadFinanceData() {
        setLoading(true);
        setError(null);
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfToday = now.toISOString();
            const [summaryRes, todayRes, dailyRes, monthlyRes] = await Promise.all([
                financeApi.getSummary(new Date(startDate).toISOString(), new Date(endDate + "T23:59:59").toISOString()),
                financeApi.getSummary(startOfMonth, endOfToday),
                financeApi.getDailySales(7),
                financeApi.getMonthlySales(12),
            ]);
            setSummary(summaryRes.data);
            setTodaySummary(todayRes.data);
            setDailySales(dailyRes.data);
            setMonthlySales(monthlyRes.data);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal memuat data keuangan.");
        } finally {
            setLoading(false);
        }
    }

    async function loadTransactions() {
        setTransactionsLoading(true);
        try {
            const res = await transactionsApi.getAll();
            setTransactions(res.data || []);
        } catch (err) {
            // Non-critical
        } finally {
            setTransactionsLoading(false);
        }
    }

    async function handleFilter() {
        setLoading(true);
        setError(null);
        try {
            const res = await financeApi.getSummary(
                new Date(startDate).toISOString(),
                new Date(endDate + "T23:59:59").toISOString()
            );
            setSummary(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal memuat data keuangan.");
        } finally {
            setLoading(false);
        }
    }

    const filteredTransactions = transactions.filter((t) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (t.id || "").toLowerCase().includes(q) ||
            (t.metodeBayar || "").toLowerCase().includes(q) ||
            (t.kasirNama || t.kasir || "").toLowerCase().includes(q)
        );
    });

    if (loading && !summary) {
        return <div className="p-8 text-center text-slate-500 text-sm">Memuat data keuangan...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Keuangan</h1>
                    <p className="text-sm text-slate-500">Ringkasan pendapatan dan transaksi</p>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Filter Tanggal */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-end gap-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Dari Tanggal</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sampai Tanggal</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleFilter}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                >
                    {loading ? "Memuat..." : "Terapkan Filter"}
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Pendapatan (Periode)" value={formatRp(summary?.totalRevenue)} icon={<TrendingUp className="w-5 h-5" />} accent="blue" />
                <StatCard label="Total Transaksi" value={summary?.totalTransactions ?? 0} icon={<Receipt className="w-5 h-5" />} accent="green" />
                <StatCard label="Rata-rata / Transaksi" value={formatRp(summary?.avgTransaction)} icon={<BarChart3 className="w-5 h-5" />} accent="orange" />
                <StatCard label="Pendapatan Bulan Ini" value={formatRp(todaySummary?.totalRevenue)} icon={<Wallet className="w-5 h-5" />} accent="blue" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DailyRevenueChart data={dailySales} />
                <MonthlyRevenueChart data={monthlySales} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RevenueByMethodChart revenueByMethod={summary?.revenueByMethod} />
                {/* Detail per metode bayar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Detail per Metode Bayar</h3>
                    {summary?.revenueByMethod && Object.keys(summary.revenueByMethod).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(summary.revenueByMethod).map(([method, total]) => {
                                const pct = summary.totalRevenue > 0 ? ((total / summary.totalRevenue) * 100).toFixed(1) : 0;
                                return (
                                    <div key={method} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                        <div>
                                            <span className="text-sm font-semibold text-slate-800 uppercase">{method}</span>
                                            <span className="text-xs text-slate-400 ml-2">{pct}%</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-900 tabular-nums">{formatRp(total)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">Belum ada data transaksi.</p>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">Transaksi Terbaru</h3>
                    <div className="relative max-w-xs w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari transaksi..."
                            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {transactionsLoading ? (
                    <div className="p-8 text-center text-slate-500 text-sm">Memuat transaksi...</div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        {search ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi"}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
                                    <th className="px-4 py-3 font-semibold">ID</th>
                                    <th className="px-4 py-3 font-semibold">Tanggal</th>
                                    <th className="px-4 py-3 font-semibold">Items</th>
                                    <th className="px-4 py-3 font-semibold text-right">Total</th>
                                    <th className="px-4 py-3 font-semibold">Metode</th>
                                    <th className="px-4 py-3 font-semibold">Kasir</th>
                                    <th className="px-4 py-3 font-semibold text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTransactions.slice(0, 50).map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{tx.id?.slice(-8) || "-"}</td>
                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                            <div>{formatDate(tx.createdAt)}</div>
                                            <div className="text-xs text-slate-400">{formatTime(tx.createdAt)}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{tx.items ? `${tx.items.length} item` : "-"}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-800 tabular-nums">{formatRp(tx.total)}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 uppercase">
                                                {tx.metodeBayar || "CASH"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{tx.kasirNama || tx.kasir || "-"}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setDetailTarget(tx)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {filteredTransactions.length > 50 && (
                    <div className="px-5 py-3 bg-slate-50 text-xs text-slate-500 text-center border-t border-slate-100">
                        Menampilkan 50 transaksi terbaru dari {filteredTransactions.length}
                    </div>
                )}
            </div>

            {/* MODAL: Detail Transaksi */}
            {detailTarget && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                            <h2 className="font-bold text-slate-900">Detail Transaksi</h2>
                            <button type="button" onClick={() => setDetailTarget(null)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-xs text-slate-500 block">ID Transaksi</span>
                                    <span className="font-mono text-xs text-slate-700">{detailTarget.id}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Tanggal</span>
                                    <span className="text-slate-700">{formatDate(detailTarget.createdAt)}, {formatTime(detailTarget.createdAt)}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Metode Bayar</span>
                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 uppercase">
                                        {detailTarget.metodeBayar || "CASH"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Kasir</span>
                                    <span className="text-slate-700">{detailTarget.kasirNama || detailTarget.kasir || "-"}</span>
                                </div>
                                {detailTarget.memberID && (
                                    <div className="col-span-2">
                                        <span className="text-xs text-slate-500 block">Member</span>
                                        <span className="text-slate-700">{detailTarget.memberID}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-slate-800 mb-2">Item Pesanan</h4>
                                {detailTarget.items && detailTarget.items.length > 0 ? (
                                    <div className="space-y-2">
                                        {detailTarget.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-sm">
                                                <div>
                                                    <span className="font-medium text-slate-800">{item.nama || item.name}</span>
                                                    <span className="text-slate-400 ml-2">x{item.qty}</span>
                                                </div>
                                                <span className="font-semibold text-slate-800 tabular-nums">
                                                    {formatRp(item.harga * item.qty)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">Tidak ada item.</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                                <span className="text-sm font-semibold text-emerald-800">Total</span>
                                <span className="text-lg font-bold text-emerald-800 tabular-nums">{formatRp(detailTarget.total)}</span>
                            </div>
                        </div>

                        <div className="px-5 py-3 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                onClick={() => setDetailTarget(null)}
                                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

