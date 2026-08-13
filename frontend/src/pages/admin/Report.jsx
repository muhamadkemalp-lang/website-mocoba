import { useEffect, useState } from "react";
import { AlertCircle, TrendingUp, Package, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import reportApi from "../../api/report.api";
import StatCard from "../../components/cards/StatCard";

const formatRp = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

const thirtyDaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
};

const todayStr = () => new Date().toISOString().split("T")[0];

export default function Report() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(thirtyDaysAgo());
    const [endDate, setEndDate] = useState(todayStr());
    const [data, setData] = useState([]);

    useEffect(() => {
        loadReport();
    }, []);

    async function loadReport() {
        setLoading(true);
        setError(null);
        try {
            const res = await reportApi.getSalesByProduct(
                new Date(startDate).toISOString(),
                new Date(endDate + "T23:59:59").toISOString()
            );
            setData(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal memuat laporan penjualan.");
        } finally {
            setLoading(false);
        }
    }

    const totalQty = data.reduce((sum, item) => sum + (item.qtyTerjual || 0), 0);
    const totalRevenue = data.reduce((sum, item) => sum + (item.totalPendapatan || 0), 0);
    const topProduct = data[0]; // sudah terurut dari backend (qtyTerjual desc)

    const chartData = data.slice(0, 10).map((item) => ({
        nama: item.nama && item.nama.length > 14 ? item.nama.slice(0, 14) + "…" : item.nama || "-",
        qtyTerjual: item.qtyTerjual,
    }));

    if (loading && data.length === 0) {
        return <div className="p-8 text-center text-slate-500 text-sm">Memuat laporan...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Laporan Penjualan</h1>
                <p className="text-sm text-slate-500">Performa produk berdasarkan jumlah terjual</p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
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
                    onClick={loadReport}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                >
                    {loading ? "Memuat..." : "Terapkan Filter"}
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Total Item Terjual" value={totalQty} icon={<Package className="w-5 h-5" />} accent="blue" />
                <StatCard label="Total Pendapatan" value={formatRp(totalRevenue)} icon={<TrendingUp className="w-5 h-5" />} accent="green" />
                <StatCard label="Menu Terlaris" value={topProduct?.nama || "-"} icon={<Trophy className="w-5 h-5" />} accent="orange" />
            </div>

            {data.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">Belum ada data penjualan</p>
                    <p className="text-slate-400 text-sm mt-1">Coba ubah rentang tanggal, atau belum ada transaksi di periode ini.</p>
                </div>
            ) : (
                <>
                    {/* Chart Top 10 */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <h3 className="text-base font-semibold text-slate-900 mb-4">Top 10 Produk Terlaris</h3>
                        <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 36)}>
                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 12, fill: "#718096" }} axisLine={false} tickLine={false} />
                                <YAxis
                                    type="category"
                                    dataKey="nama"
                                    width={130}
                                    tick={{ fontSize: 12, fill: "#4A5568" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip formatter={(value) => [`${value} terjual`, ""]} cursor={{ fill: "#F7FAFC" }} />
                                <Bar dataKey="qtyTerjual" fill="#3182CE" radius={[0, 6, 6, 0]} maxBarSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tabel Lengkap */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-900">Semua Produk</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
                                    <th className="px-4 py-3 font-semibold">Rank</th>
                                    <th className="px-4 py-3 font-semibold">Produk</th>
                                    <th className="px-4 py-3 font-semibold text-right">Qty Terjual</th>
                                    <th className="px-4 py-3 font-semibold text-right">Total Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.map((item, idx) => (
                                    <tr key={item.productID || idx} className="hover:bg-slate-50/60">
                                        <td className="px-4 py-3 text-slate-500">
                                            {idx === 0 ? (
                                                <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                                                    <Trophy className="w-3.5 h-3.5" /> #1
                                                </span>
                                            ) : (
                                                `#${idx + 1}`
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{item.nama || "-"}</td>
                                        <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{item.qtyTerjual}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-800 tabular-nums">
                                            {formatRp(item.totalPendapatan)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}