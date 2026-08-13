const { db } = require("../config/firebase");

const col = db.collection("users");

async function findByEmail(email) {
    const snap = await col.where("email", "==", email).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
}

async function findById(id) {
    const doc = await col.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

async function createUser(data) {
    const payload = { ...data, createdAt: new Date(), updatedAt: new Date() };
    const ref = await col.add(payload);
    return { id: ref.id, ...payload };
}

async function updateUser(id, data) {
    const ref = col.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const payload = { ...data, updatedAt: new Date() };
    await ref.update(payload);
    return { id, ...doc.data(), ...payload };
}

async function deleteUser(id) {
    const ref = col.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
}

// Ambil semua user dengan role tertentu (mis. "admin", "kasir", "member")
async function findByRole(role) {
    const snap = await col.where("role", "==", role).orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Tambah/kurangi poin member (dipanggil otomatis setelah transaksi selesai)
async function adjustPoints(id, delta) {
    const ref = col.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;

    const current = Number(doc.data().points || 0);
    const newPoints = Math.max(0, current + delta);
    await ref.update({ points: newPoints, updatedAt: new Date() });
    return { id, points: newPoints };
}

module.exports = {
    findByEmail,
    findById,
    createUser,
    updateUser,
    deleteUser,
    findByRole,
    adjustPoints,
};
