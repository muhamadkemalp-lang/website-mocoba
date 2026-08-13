const { db } = require("../config/firebase");

// Ringkasan pendapatan dalam rentang tanggal tertentu (default: 30 hari terakhir)
async function getSummary(startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const snapshot = await db
        .collection("orders")
        .where("createdAt", ">=", start)
        .where("createdAt", "<=", end)
        .get();

    let totalRevenue = 0;
    let totalTransactions = 0;
    const revenueByMethod = {};

    snapshot.forEach((doc) => {
        const data = doc.data();
        totalRevenue += Number(data.total || 0);
        totalTransactions += 1;

        const method = data.metodeBayar || "cash";
        revenueByMethod[method] = (revenueByMethod[method] || 0) + Number(data.total || 0);
    });

    return {
        periode: { start, end },
        totalRevenue,
        totalTransactions,
        revenueByMethod,
        avgTransaction: totalTransactions ? Math.round(totalRevenue / totalTransactions) : 0,
    };
}

// Total pendapatan per hari, N hari terakhir (default 7) — untuk grafik harian
async function getDailySales(days = 7) {
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const snapshot = await db.collection("orders").where("createdAt", ">=", start).get();

    // siapkan bucket kosong per hari supaya hari tanpa transaksi tetap muncul (nilai 0)
    const buckets = {};
    for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split("T")[0];
        buckets[key] = { label: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }), total: 0 };
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        const key = createdAt.toISOString().split("T")[0];
        if (buckets[key]) buckets[key].total += Number(data.total || 0);
    });

    return Object.values(buckets);
}

// Total pendapatan per bulan, N bulan terakhir (default 12) — untuk grafik bulanan
async function getMonthlySales(months = 12) {
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const snapshot = await db.collection("orders").where("createdAt", ">=", start).get();

    const buckets = {};
    for (let i = 0; i < months; i++) {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        buckets[key] = { label: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }), total: 0 };
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
        if (buckets[key]) buckets[key].total += Number(data.total || 0);
    });

    return Object.values(buckets);
}

module.exports = { getSummary, getDailySales, getMonthlySales };
