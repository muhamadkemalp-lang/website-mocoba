import { useEffect, useState } from "react";
import dashboardApi from "../../api/dashboard.api";
import financeApi from "../../api/finance.api";

import StatCard from "../../components/cards/StatCard";
import DailyRevenueChart from "../../components/charts/DailyRevenueChart";
import MonthlyRevenueChart from "../../components/charts/MonthlyRevenueChart";
import RevenueByMethodChart from "../../components/charts/RevenueByMethodChart";
import TopProductsChart from "../../components/charts/TopProductsChart";

const formatRp = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [summary, setSummary] = useState(null);
    const [financeSummary, setFinanceSummary] = useState(null);
    const [dailySales, setDailySales] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        setLoading(true);
        setError(null);

        try {
            const now = new Date();
            const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            const [summaryRes, financeRes, dailyRes, monthlyRes, topRes, lowStockRes] = await Promise.all([
                dashboardApi.getSummary(),
                financeApi.getSummary(firstOfMonth, now.toISOString()),
                financeApi.getDailySales(7),
                financeApi.getMonthlySales(12),
                dashboardApi.getTopProducts(5),
                dashboardApi.getLowStock(20),
            ]);

            setSummary(summaryRes.data);
            setFinanceSummary(financeRes.data);
            setDailySales(dailyRes.data);
            setMonthlySales(monthlyRes.data);
            setTopProducts(topRes.data);
            setLowStock(lowStockRes.data);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal memuat data dashboard.");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center", color: "#718096" }}>Memuat dashboard...</div>;
    }

    if (error) {
        return (
            <div style={{ padding: "24px", background: "#FFF5F5", color: "#C53030", borderRadius: "10px", margin: "24px" }}>
                {error}
                <button onClick={loadDashboard} style={{ marginLeft: "12px", color: "#3182CE", cursor: "pointer" }}>
                    Coba lagi
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1A202C" }}>Dashboard</h1>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <StatCard label="Pendapatan Hari Ini" value={formatRp(summary?.todaySales)} icon="💰" accent="blue" />
                <StatCard label="Order Hari Ini" value={summary?.todayOrders ?? 0} icon="🧾" accent="green" />
                <StatCard label="Pendapatan Bulan Ini" value={formatRp(financeSummary?.totalRevenue)} icon="📈" accent="orange" />
                <StatCard
                    label="Rata-rata / Transaksi"
                    value={formatRp(financeSummary?.avgTransaction)}
                    icon="📊"
                    accent="blue"
                />
            </div>

            {/* Peringatan stok menipis */}
            {lowStock.length > 0 && (
                <div style={{ background: "#FFFAF0", border: "1px solid #FBD38D", borderRadius: "10px", padding: "16px" }}>
                    <strong style={{ color: "#DD6B20" }}>⚠️ {lowStock.length} bahan baku stoknya menipis:</strong>{" "}
                    <span style={{ color: "#744210" }}>
                        {lowStock.map((i) => `${i.nama} (${i.stok} ${i.satuan || ""})`).join(", ")}
                    </span>
                </div>
            )}

            {/* Grafik pendapatan */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <DailyRevenueChart data={dailySales} />
                <MonthlyRevenueChart data={monthlySales} />
            </div>

            {/* Financial flow & produk terlaris */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <RevenueByMethodChart revenueByMethod={financeSummary?.revenueByMethod} />
                <TopProductsChart data={topProducts} />
            </div>
        </div>
    );
}