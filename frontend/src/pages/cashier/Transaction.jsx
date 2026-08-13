import { useState, useEffect, useMemo } from "react";
import {
    Search, X, Receipt, RefreshCw, Filter, ArrowUpDown,
    Eye, AlertCircle, DollarSign, CreditCard, Smartphone,
} from "lucide-react";
import transactionsApi from "../../api/transactions.api";

const formatRp = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

function formatDate(dateVal) {
    if (!dateVal) return "-";
    const d = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(dateVal) {
    if (!dateVal) return "-";
    const d = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

const PAYMENT_METHODS = [
    { id: "all", label: "Semua", icon: Filter },
    { id: "cash", label: "Tunai", icon: DollarSign },
    { id: "qris", label: "QRIS", icon: Smartphone },
    { id: "debit", label: "Debit/CC", icon: CreditCard },
];

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("desc");
    const [detailTarget, setDetailTarget] = useState(null);

    useEffect(() => {
        loadTransactions();
    }, []);

    async function loadTransactions() {
        setLoading(true);
        setError(null);
        try {
            const res = await transactionsApi.getAll();
            setTransactions(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal memuat riwayat transaksi.");
        } finally {
            setLoading(false);
        }
    }

    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        // Filter by payment method
        if (paymentFilter !== "all") {
            result = result.filter((t) => t.metodeBayar === paymentFilter);
        }

        // Search by ID or items
        if (search.trim()) {
            const q = search.toLowerCase().trim();
            result = result.filter((t) => {
                const idMatch = (t.id || "").toLowerCase().includes(q);
                const itemMatch = (t.items || []).some(
                    (item) => (item.nama || "").toLowerCase().includes(q)
                );
                const methodMatch = (t.metodeBayar || "").toLowerCase().includes(q);
                return idMatch || itemMatch || methodMatch;
            });
        }

        // Sort by date
        result.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [transactions, paymentFilter, search, sortOrder]);

    const todayCount = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return transactions.filter((t) => {
            const d = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
            return d >= today;
        }).length;
    }, [transactions]);

    const todayRevenue = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return transactions
            .filter((t) => {
                const d = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
                return d >= today;
            })
            .reduce((sum, t) => sum + (t.total || 0), 0);
    }, [transactions]);

    return (
        <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden min-h-[calc(100vh-61px)]">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 shrink-0">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-emerald-600" />
                            Riwayat Transaksi
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {transactions.length} total transaksi &middot; {todayCount} hari ini
                            {todayRevenue > 0 && ` &middot; ${formatRp(todayRevenue)}`}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={loadTransactions}
                        disabled={loading}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-60"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Memuat..." : "Perbarui"}
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 shrink-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari ID, nama item, atau metode bayar..."
                            className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Sort */}
                    <button
                        type="button"
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shrink-0"
                    >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        {sortOrder === "desc" ? "Terbaru" : "Terlama"}
                    </button>
                </div>

                {/* Payment Method Filter */}
                <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar">
                    {PAYMENT_METHODS.map((method) => {
                        const Icon = method.icon;
                        const isActive = paymentFilter === method.id;
                        return (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setPaymentFilter(method.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                                    isActive
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {method.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mx-4 md:mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2 shrink-0">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 p-8">
                        <RefreshCw className="w-10 h-10 text-slate-300 mb-3 animate-spin" />
                        <h3 className="font-semibold text-slate-700 text-base">Memuat Transaksi</h3>
                        <p className="text-xs text-slate-400 mt-1">Mengambil data dari server...</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                        <Receipt className="w-10 h-10 text-slate-300 mb-3" />
                        <h3 className="font-semibold text-slate-700 text-base">
                            {search || paymentFilter !== "all" ? "Tidak Ada Hasil" : "Belum Ada Transaksi"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            {search || paymentFilter !== "all"
                                ? "Tidak ada transaksi yang cocok dengan filter yang dipilih."
                                : "Belum ada transaksi yang tercatat. Lakukan transaksi di menu POS."}
                        </p>
                        {(search || paymentFilter !== "all") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setPaymentFilter("all");
                                }}
                                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTransactions.slice(0, 100).map((tx) => (
                            <div
                                key={tx.id}
                                className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                                onClick={() => setDetailTarget(tx)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left: Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                #{tx.id?.slice(-8) || "-"}
                                            </span>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                tx.metodeBayar === "cash"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : tx.metodeBayar === "qris"
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "bg-purple-50 text-purple-700"
                                            }`}>
                                                {tx.metodeBayar?.toUpperCase() || "CASH"}
                                            </span>
                                            {tx.discount > 0 && (
                                                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                                                    -{formatRp(tx.discount)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                                            <span>{formatDate(tx.createdAt)}</span>
                                            <span>&bull;</span>
                                            <span>{formatTime(tx.createdAt)}</span>
                                            <span>&bull;</span>
                                            <span>{tx.items?.length || 0} item</span>
                                            {tx.memberID && (
                                                <>
                                                    <span>&bull;</span>
                                                    <span className="text-amber-600 font-medium">Member</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {(tx.items || []).slice(0, 4).map((item, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-block px-2 py-0.5 bg-slate-50 text-slate-700 text-[11px] rounded-md border border-slate-100"
                                                >
                                                    {item.nama || item.name}
                                                    <span className="text-slate-400 ml-1">x{item.qty}</span>
                                                </span>
                                            ))}
                                            {(tx.items || []).length > 4 && (
                                                <span className="text-[11px] text-slate-400 self-center">
                                                    +{tx.items.length - 4} lainnya
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Total */}
                                    <div className="text-right shrink-0">
                                        <div className="text-base font-bold text-slate-900 tabular-nums">
                                            {formatRp(tx.total)}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 justify-end">
                                            <Eye className="w-3 h-3 text-slate-400" />
                                            <span className="text-[11px] text-slate-400">Detail</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredTransactions.length > 100 && (
                            <div className="text-center text-xs text-slate-400 py-3">
                                Menampilkan 100 transaksi terbaru dari {filteredTransactions.length}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {detailTarget && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-emerald-600" />
                                Detail Transaksi
                            </h2>
                            <button
                                type="button"
                                onClick={() => setDetailTarget(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 overflow-y-auto">
                            {/* Info Header */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 rounded-xl bg-slate-50">
                                    <span className="text-[11px] text-slate-500 block font-medium">ID Transaksi</span>
                                    <span className="font-mono text-xs text-slate-800 font-semibold">{detailTarget.id}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50">
                                    <span className="text-[11px] text-slate-500 block font-medium">Tanggal</span>
                                    <span className="text-slate-800 font-semibold text-xs">
                                        {formatDate(detailTarget.createdAt)}, {formatTime(detailTarget.createdAt)}
                                    </span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50">
                                    <span className="text-[11px] text-slate-500 block font-medium">Metode Bayar</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${
                                        detailTarget.metodeBayar === "cash"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : detailTarget.metodeBayar === "qris"
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-purple-50 text-purple-700"
                                    }`}>
                                        {detailTarget.metodeBayar?.toUpperCase() || "CASH"}
                                    </span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50">
                                    <span className="text-[11px] text-slate-500 block font-medium">Status</span>
                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5 bg-emerald-50 text-emerald-700">
                                        {detailTarget.status?.toUpperCase() || "SELESAI"}
                                    </span>
                                </div>
                                {detailTarget.memberID && (
                                    <div className="col-span-2 p-3 rounded-xl bg-amber-50">
                                        <span className="text-[11px] text-amber-600 block font-medium">Member</span>
                                        <span className="text-amber-800 font-semibold text-xs">{detailTarget.memberID}</span>
                                    </div>
                                )}
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    Item Pesanan
                                </h4>
                                {detailTarget.items && detailTarget.items.length > 0 ? (
                                    <div className="space-y-2">
                                        {detailTarget.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-400 font-mono text-xs">{idx + 1}.</span>
                                                    <div>
                                                        <span className="font-medium text-slate-800">{item.nama || item.name}</span>
                                                        <span className="text-slate-400 ml-2">x{item.qty}</span>
                                                    </div>
                                                </div>
                                                <span className="font-semibold text-slate-800 tabular-nums text-sm">
                                                    {formatRp(item.harga * item.qty)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 p-3 bg-slate-50 rounded-xl">Tidak ada item.</p>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium tabular-nums">{formatRp(detailTarget.subtotal || detailTarget.total)}</span>
                                </div>
                                {detailTarget.discount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                        <span>Diskon</span>
                                        <span className="tabular-nums">-{formatRp(detailTarget.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
                                    <span>Total</span>
                                    <span className="text-emerald-700 tabular-nums">{formatRp(detailTarget.total)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-3 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                onClick={() => setDetailTarget(null)}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
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

