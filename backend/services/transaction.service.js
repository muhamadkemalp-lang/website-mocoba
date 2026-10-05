const { db } = require("../config/firebase");
const orderService = require("./order.service");
const userService = require("./user.service");

// Poin: 1 poin per Rp10.000 (setelah diskon)
const POINTS_PER_RUPIAH = 1 / 10000;

async function checkout(payload) {
  const { items, memberID, metodeBayar, discountAmount, tableId, tableName, customerName } = payload;

  async function decreaseStock(items) {
  for (const item of items) {
    const productId = item.productID;
    const qty = Number(item.qty ?? item.jumlah ?? 0);
    if (!productId || qty <= 0) continue;

    const ref = db.collection("product").doc(productId);
    const snap = await ref.get();
    if (!snap.exists) {
      const err = new Error(`Produk ${item.nama || productId} tidak ditemukan.`);
      err.statusCode = 400;
      throw err;
    }

    const data = snap.data();
    const current = Number(data.stok ?? data.stock ?? 0);

    if (current < qty) {
      const err = new Error(
        `Stok "${data.nama || item.nama}" tidak cukup (tersisa ${current}).`
      );
      err.statusCode = 400;
      throw err;
    }

    await ref.update({
      stok: current - qty,
      updatedAt: new Date(),
    });
  }
}

  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("items tidak boleh kosong.");
    err.statusCode = 400;
    throw err;
  }

  const normalizedItems = items.map((item) => ({
    productID: item.productID,
    nama: item.nama || "Produk",
    harga: Number(item.harga || 0),
    qty: Number(item.qty ?? item.jumlah ?? 0),
    catatan: item.catatan || item.note || "",
  }));

  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + item.harga * item.qty,
    0
  );

  const discount = Math.min(subtotal, Math.max(0, Number(discountAmount) || 0));
  const total = subtotal - discount;

  // Potong stok menurut resep (comment baris ini jika ingin tes tanpa resep)
  await orderService.processOrder({ items: normalizedItems });
  await decreaseStock(normalizedItems);

  let sessionId = null;
  if (tableId) {
    const tableDoc = await db.collection("tables").doc(tableId).get();
    if (tableDoc.exists) {
      sessionId = tableDoc.data().currentSessionId || null;
    }
  }

  const orderData = {
    items: normalizedItems,
    subtotal,
    discount,
    total,
    memberID: memberID || null,
    metodeBayar: metodeBayar || "cash",
    status: "selesai",
    tableId: tableId || null,
    tableName: tableName || null,
    customerName: (customerName || "").trim() || "Pelanggan Umum",
    sessionId: sessionId,
    createdAt: new Date(),
  };

  const orderRef = await db.collection("orders").add(orderData);

  if (tableId) {
    const newSessionId = sessionId || orderRef.id;
    const tableUpdate = {
      status: "occupied",
      currentSessionId: newSessionId,
      updatedAt: new Date(),
    };
    if (!sessionId) {
      tableUpdate.occupiedAt = new Date();
    }
    await db.collection("tables").doc(tableId).update(tableUpdate);

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
  const snapshot = await db
    .collection("orders")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getById(id) {
  const doc = await db.collection("orders").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}
async function getToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const snapshot = await db
    .collection("orders")
    .where("createdAt", ">=", start)
    .where("createdAt", "<=", end)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

module.exports = { checkout, getAll, getById, getToday };
