const { db } = require("../config/firebase");
const orderService = require("./order.service");
const userService = require("./user.service");

// Poin didapat member: 1 poin per kelipatan Rp10.000 dari total belanja (SETELAH diskon)
const POINTS_PER_RUPIAH = 1 / 10000;

// payload: { items: [{ productID, nama, qty, harga }], memberID (optional), metodeBayar, discountAmount (optional, default 0) }
async function checkout(payload) {
  const { items, memberID, metodeBayar, discountAmount, tableId, tableName } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("items tidak boleh kosong.");
    err.statusCode = 400;
    throw err;
  }

  const subtotal = items.reduce((sum, item) => {
  const harga = Number(item.harga || 0);
  const qty = Number(item.qty ?? item.jumlah ?? 0);
  return sum + harga * qty;
}, 0);

const normalizedItems = items.map((item) => ({
  productID: item.productID,
  nama: item.nama,
  harga: Number(item.harga || 0),
  qty: Number(item.qty ?? item.jumlah ?? 0),
  catatan: item.catatan || item.note || "",
}));

  // sessionId: kalau meja sudah occupied, pakai yang lama; kalau baru, pakai order id nanti
  let sessionId = null;
  if (tableId) {
    const tableDoc = await db.collection("tables").doc(tableId).get();
    if (tableDoc.exists) {
      sessionId = tableDoc.data().currentSessionId || null;
    }
  }

  const orderData = {
    items,
    subtotal,
    discount,
    total,
    memberID: memberID || null,
    metodeBayar: metodeBayar || "cash",
    status: "selesai",
    tableId: tableId || null,
    tableName: tableName || null,
    sessionId: sessionId, // diisi ulang setelah dapat order id jika perlu
    createdAt: new Date(),
  };

  const orderRef = await db.collection("orders").add(orderData);

  // Jika meja dipilih: set occupied + session
  if (tableId) {
    const newSessionId = sessionId || orderRef.id;
    await db.collection("tables").doc(tableId).update({
      status: "occupied",
      currentSessionId: newSessionId,
      occupiedAt: sessionId ? undefined : new Date(), // jangan overwrite kalau sudah occupied
      updatedAt: new Date(),
    });

    // pastikan order punya sessionId
    if (!sessionId) {
      await orderRef.update({ sessionId: newSessionId });
      orderData.sessionId = newSessionId;
    }
  }

  let pointsEarned = 0;
  if (memberID) {
    pointsEarned = Math.floor(total * POINTS_PER_RUPIAH);
    await userService.adjustPoints(memberID, pointsEarned);
  }

  return {
    id: orderRef.id,
    ...orderData,
    pointsEarned,
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