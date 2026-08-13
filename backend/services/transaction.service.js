const { db } = require("../config/firebase");
const orderService = require("./order.service");
const userService = require("./user.service");

// Poin didapat member: 1 poin per kelipatan Rp10.000 dari total belanja (SETELAH diskon)
const POINTS_PER_RUPIAH = 1 / 10000;

// payload: { items: [{ productID, nama, qty, harga }], memberID (optional), metodeBayar, discountAmount (optional, default 0) }
async function checkout(payload) {
    const { items, memberID, metodeBayar, discountAmount } = payload;

    if (!Array.isArray(items) || items.length === 0) {
        const err = new Error("items tidak boleh kosong.");
        err.statusCode = 400;
        throw err;
    }

    const subtotal = items.reduce((sum, item) => sum + item.harga * item.qty, 0);

    // Diskon tidak boleh lebih besar dari subtotal, dan tidak boleh negatif
    const discount = Math.min(subtotal, Math.max(0, Number(discountAmount) || 0));
    const total = subtotal - discount;

    // 1) Potong stok bahan baku sesuai resep tiap item (akan lempar error kalau stok kurang)
    await orderService.processOrder({ items });

    // 2) Simpan data pesanan (subtotal & discount disimpan terpisah untuk laporan)
    const orderRef = await db.collection("orders").add({
        items,
        subtotal,
        discount,
        total,
        memberID: memberID || null,
        metodeBayar: metodeBayar || "cash",
        status: "selesai",
        createdAt: new Date(),
    });

    // 3) Tambah poin member (dihitung dari total SETELAH diskon)
    let pointsEarned = 0;
    if (memberID) {
        pointsEarned = Math.floor(total * POINTS_PER_RUPIAH);
        await userService.adjustPoints(memberID, pointsEarned);
    }

    return {
        id: orderRef.id,
        items,
        subtotal,
        discount,
        total,
        pointsEarned,
        status: "selesai",
    };
}

async function getAll() {
    const snapshot = await db.collection("orders").orderBy("createdAt", "desc").limit(100).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getById(id) {
    const doc = await db.collection("orders").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

module.exports = { checkout, getAll, getById };