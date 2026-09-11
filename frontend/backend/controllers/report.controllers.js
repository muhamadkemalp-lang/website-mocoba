const { db } = require("../config/firebase");
const financeService = require("../services/finance.service");

// Laporan penjualan per produk dalam rentang tanggal
exports.salesByProduct = async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const startDate = start ? new Date(start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = end ? new Date(end) : new Date();

        const snapshot = await db
            .collection("orders")
            .where("createdAt", ">=", startDate)
            .where("createdAt", "<=", endDate)
            .get();

        const tally = {};
        snapshot.forEach((doc) => {
            const items = doc.data().items || [];
            items.forEach((item) => {
                if (!tally[item.productID]) {
                    tally[item.productID] = { productID: item.productID, nama: item.nama, qtyTerjual: 0, totalPendapatan: 0 };
                }
                tally[item.productID].qtyTerjual += item.qty;
                tally[item.productID].totalPendapatan += item.qty * item.harga;
            });
        });

        const data = Object.values(tally).sort((a, b) => b.qtyTerjual - a.qtyTerjual);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// Laporan keuangan ringkas (delegasi ke finance.service)
exports.financeSummary = async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const data = await financeService.getSummary(start, end);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};
