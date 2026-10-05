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
const sevenDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 6); // termasuk hari ini = 7 hari
  return d.toISOString().split("T")[0];
};

const todayStr = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
};

export default function Finance() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(sevenDaysAgo());
    const [endDate, setEndDate] = useState(todayStr());
    const [summary, setSummary] = useState(null);
    const [todaySummary, setTodaySummary] = useState(null);
    const [dailySales, setDailySales] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [detailTarget, setDetailTarget] = useState(null);
    const [search, setSearch] = useState("");
    const [dailyRecap, setDailyRecap] = useState({
  allTotal: 0,
  allCount: 0,
  cash: { total: 0, count: 0 },
  qris: { total: 0, count: 0 },
  debit: { total: 0, count: 0 },
});

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

    const [summaryRes, monthRes, dailyRes, monthlyRes, todayTxRes] =
      await Promise.all([
        financeApi.getSummary(
          new Date(startDate).toISOString(),
          new Date(endDate + "T23:59:59").toISOString()
        ),
        financeApi.getSummary(startOfMonth, endOfToday), // bulan ini
        financeApi.getDailySales(7),
        financeApi.getMonthlySales(12),
        transactionsApi.getToday(), // REKAP HARI INI — wajib
      ]);

    setSummary(summaryRes.data);
    setTodaySummary(monthRes.data); // tetap untuk kartu "Bulan Ini"
    setDailySales(dailyRes.data);
    setMonthlySales(monthlyRes.data);
    setDailyRecap(buildDailyRecap(todayTxRes.data || []));
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
    function normalizeMethod(m) {
  const s = String(m || "cash").toLowerCase();
  if (s.includes("qris")) return "qris";
  if (s.includes("debit") || s.includes("card") || s.includes("cc")) return "debit";
  return "cash";
}

function buildDailyRecap(orders) {
  const stats = {
    cash: { count: 0, total: 0 },
    qris: { count: 0, total: 0 },
    debit: { count: 0, total: 0 },
  };
  for (const tx of orders || []) {
    const method = normalizeMethod(tx.metodeBayar);
    const amount = Number(tx.total) || 0;
    if (stats[method]) {
      stats[method].count += 1;
      stats[method].total += amount;
    }
  }
  return {
    ...stats,
    allCount: (orders || []).length,
    allTotal:
      stats.cash.total + stats.qris.total + stats.debit.total,
  };
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
            {/* REKAP HARI INI — untuk cocokkan cash */}
<div className="bg-white rounded-2xl border border-emerald-200 p-4 space-y-3">
  <div className="flex items-center justify-between">
    <h2 className="text-sm font-bold text-slate-900">
      Rekap Hari Ini ({todayStr()})
    </h2>
    <span className="text-xs text-slate-500">
      {dailyRecap.allCount} transaksi
    </span>
  </div>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
      <p className="text-[11px] text-slate-500 font-medium">Omzet hari ini</p>
      <p className="text-lg font-bold text-slate-900 tabular-nums">
        {formatRp(dailyRecap.allTotal)}
      </p>
    </div>
    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
      <p className="text-[11px] text-emerald-700 font-medium">Tunai (laci)</p>
      <p className="text-lg font-bold text-emerald-900 tabular-nums">
        {formatRp(dailyRecap.cash.total)}
      </p>
      <p className="text-[11px] text-emerald-700">{dailyRecap.cash.count} trx</p>
    </div>
    <div className="rounded-xl bg-sky-50 border border-sky-200 p-3">
      <p className="text-[11px] text-sky-700 font-medium">QRIS</p>
      <p className="text-lg font-bold text-sky-900 tabular-nums">
        {formatRp(dailyRecap.qris.total)}
      </p>
      <p className="text-[11px] text-sky-700">{dailyRecap.qris.count} trx</p>
    </div>
    <div className="rounded-xl bg-violet-50 border border-violet-200 p-3">
      <p className="text-[11px] text-violet-700 font-medium">Debit/CC</p>
      <p className="text-lg font-bold text-violet-900 tabular-nums">
        {formatRp(dailyRecap.debit.total)}
      </p>
      <p className="text-[11px] text-violet-700">{dailyRecap.debit.count} trx</p>
    </div>
  </div>
  <p className="text-[11px] text-slate-500">
    Bandingkan angka <b>Tunai</b> dengan uang fisik di laci (setelah modal awal & pengeluaran).
  </p>
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
                                {filteredTransactions.slice(0, 100).map((tx) => (
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

