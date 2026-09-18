const { db } = require("../config/firebase");

const COLLECTION = "tables";

async function getAll() {
  const snapshot = await db
    .collection(COLLECTION)
    .where("aktif", "==", true)
    .get();

  const tables = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // urutkan di memory (hindari composite index dulu)
  tables.sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
  return tables;
}

async function getById(id) {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function create(payload) {
  const data = {
    nama: payload.nama || "Meja",
    kode: payload.kode || "",
    tipe: payload.tipe || "regular", // regular | vip | takeaway
    kapasitas: Number(payload.kapasitas) || 2,
    status: "available", // available | occupied
    posisiX: Number(payload.posisiX) || 0,
    posisiY: Number(payload.posisiY) || 0,
    urutan: Number(payload.urutan) || 0,
    aktif: true,
    currentSessionId: null,
    occupiedAt: null,
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  const ref = await db.collection(COLLECTION).add(data);
  return { id: ref.id, ...data };
}

async function update(id, payload) {
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    const err = new Error("Meja tidak ditemukan.");
    err.statusCode = 404;
    throw err;
  }

  const allowed = ["nama", "kode", "tipe", "kapasitas", "posisiX", "posisiY", "urutan", "aktif"];
  const data = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) data[key] = payload[key];
  }
  data.updatedAt = new Date();

  await ref.update(data);
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
}

async function setStatus(id, status, sessionId = null) {
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    const err = new Error("Meja tidak ditemukan.");
    err.statusCode = 404;
    throw err;
  }

  if (!["available", "occupied"].includes(status)) {
    const err = new Error("Status tidak valid.");
    err.statusCode = 400;
    throw err;
  }

  const data = {
    status,
    updatedAt: new Date(),
  };

  if (status === "occupied") {
    data.occupiedAt = new Date();
    data.currentSessionId = sessionId || doc.data().currentSessionId || null;
  } else {
    data.occupiedAt = null;
    data.currentSessionId = null;
  }

  await ref.update(data);
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
}

async function remove(id) {
  // soft delete
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    const err = new Error("Meja tidak ditemukan.");
    err.statusCode = 404;
    throw err;
  }
  await ref.update({ aktif: false, updatedAt: new Date() });
  return { id, aktif: false };
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  setStatus,
  remove,
};