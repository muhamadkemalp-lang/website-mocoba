const { db } = require("../config/firebase");
const createCrudService = require("../utils/firestoreCrud");

const base = createCrudService("product");

// Hanya produk yang aktif/tersedia (dipakai app kasir & member, bukan admin)
async function getAvailable() {
    const snapshot = await db
        .collection("product")
        .where("status", "==", true)
        .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

module.exports = { ...base, getAvailable };
