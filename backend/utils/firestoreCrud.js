const { db } = require("../config/firebase");

// Helper CRUD generik untuk satu koleksi Firestore.
// Dipakai oleh service-service sederhana (product, ingredient, equipment, dll)
// supaya tidak menulis ulang get/create/update/delete di setiap file.
function createCrudService(collectionName) {
    const col = db.collection(collectionName);

    async function getAll() {
        const snapshot = await col.orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    async function getById(id) {
        const doc = await col.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    async function create(data) {
        const payload = {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const ref = await col.add(payload);
        return { id: ref.id, ...payload };
    }

    async function update(id, data) {
        const ref = col.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return null;

        const payload = { ...data, updatedAt: new Date() };
        await ref.update(payload);
        return { id, ...doc.data(), ...payload };
    }

    async function remove(id) {
        const ref = col.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return false;
        await ref.delete();
        return true;
    }

    return { getAll, getById, create, update, remove };
}

module.exports = createCrudService;
