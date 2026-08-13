const { db } = require("../config/firebase");

async function getDashboardSummary() {

    const today = new Date();

    const startToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const endToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
    );

    //-----------------------
    // Today's Orders
    //-----------------------

    const orderSnapshot = await db
        .collection("orders")
        .where("createdAt", ">=", startToday)
        .where("createdAt", "<", endToday)
        .get();

    let todaySales = 0;

    orderSnapshot.forEach(doc => {

        todaySales += Number(doc.data().total || 0);

    });

    //-----------------------
    // Total Product
    //-----------------------

    const productSnapshot = await db
        .collection("product")
        .where("status", "==", true)
        .get();

    //-----------------------
    // Low Stock
    //-----------------------

    const ingredientSnapshot = await db
        .collection("ingredients")
        .where("stok","<=",20)
        .get();

    //-----------------------
    // Return
    //-----------------------

    return {

        todaySales,

        todayOrders: orderSnapshot.size,

        totalProducts: productSnapshot.size,

        lowStock: ingredientSnapshot.size

    };

}

//-----------------------
// Low Stock (daftar lengkap, bukan cuma jumlah)
//-----------------------

async function getLowStock(threshold = 20) {
    const snapshot = await db
        .collection("ingredients")
        .where("stok", "<=", threshold)
        .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

//-----------------------
// Top Products (dihitung dari 100 order terakhir)
//-----------------------

async function getTopProducts(limit = 5) {
    const snapshot = await db
        .collection("orders")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();

    const tally = {};

    snapshot.forEach((doc) => {
        const items = doc.data().items || [];
        items.forEach((item) => {
            if (!tally[item.productID]) {
                tally[item.productID] = { productID: item.productID, nama: item.nama, qtyTerjual: 0 };
            }
            tally[item.productID].qtyTerjual += item.qty;
        });
    });

    return Object.values(tally)
        .sort((a, b) => b.qtyTerjual - a.qtyTerjual)
        .slice(0, limit);
}

//-----------------------
// Recent Orders
//-----------------------

async function getRecentOrders(limit = 10) {
    const snapshot = await db
        .collection("orders")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

module.exports = {

    getDashboardSummary,
    getLowStock,
    getTopProducts,
    getRecentOrders

}