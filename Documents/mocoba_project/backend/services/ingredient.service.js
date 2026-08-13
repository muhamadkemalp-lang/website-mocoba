const { db } = require("../config/firebase");
const createCrudService = require("../utils/firestoreCrud");

const base = createCrudService("ingredients");

// Bahan baku dengan stok di bawah/sama dengan ambang batas (default 20)
async function getLowStock(threshold = 20) {
    const snapshot = await db
        .collection("ingredients")
        .where("stok", "<=", threshold)
        .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Tambah/kurangi stok bahan baku manual (misal: barang datang, atau koreksi stok)
// type: "in" (tambah) atau "out" (kurangi)
async function adjustStock(id, qty, type, note) {
    const ref = db.collection("ingredients").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;

    const current = Number(doc.data().stok || 0);
    const delta = type === "out" ? -Math.abs(qty) : Math.abs(qty);
    const newStock = current + delta;

    if (newStock < 0) {
        const err = new Error("Stok tidak cukup untuk dikurangi.");
        err.statusCode = 400;
        throw err;
    }

    await ref.update({ stok: newStock, updatedAt: new Date() });

    // Catat riwayat perubahan stok
    await db.collection("stock_logs").add({
        ingredientId: id,
        ingredientName: doc.data().nama || "",
        type,
        qty: Math.abs(qty),
        note: note || "",
        stokSebelum: current,
        stokSesudah: newStock,
        createdAt: new Date(),
    });

    return { id, stok: newStock };
}

module.exports = { ...base, getLowStock, adjustStock };
